# Uploading music in bulk

The admin panel's **Music** tab takes one MP3 at a time. `tools/upload-music.js` uploads a whole folder, and
converts FLAC (and other formats) to MP3 first. Each MP3 becomes a den music track straight away, with no restart;
players get it from the item finder (and the shop, if you put it on sale).

It needs Node.js 22.5+ (already needed by the server) and, to convert anything that is not an MP3,
[ffmpeg](https://ffmpeg.org/) (Arch/CachyOS: `sudo pacman -S ffmpeg`; Ubuntu: `sudo apt install ffmpeg`;
Windows: `winget install ffmpeg`). It has no other dependencies.

## Quick start (local server)

```sh
node tools/upload-music.js ~/Music/flight
```

It asks for the admin password (typing is hidden), signs in to `http://127.0.0.1:8080`, and goes through the
folder. Output looks like:

```
[1/3] First_Song.flac: converting... 192k, 0.5 MB; uploaded as "First Song" (den item 50000)
[2/3] second_song.wav: converting... 192k, 0.5 MB; uploaded as "second song" (den item 50001)
[3/3] Third.mp3: uploaded as "Third" (den item 50002)
done: 3 uploaded, 0 skipped, 0 failed
```

Run it again on the same folder and tracks that already exist (by name) are skipped, so it is safe to add files
and re-run.

## A public server

The admin panel only answers from the server itself, so use an SSH tunnel (see the Oracle guide, step 8), keep it
open, and point the script at the tunnel:

```sh
node tools/upload-music.js --server https://127.0.0.1:8443 --insecure ~/Music/flight
```

`--insecure` is needed because the certificate is for your domain, not `127.0.0.1`. The script refuses it for
anything but `127.0.0.1` or `localhost`. Alternatively, copy the music to the server and run the script there with
`--server https://127.0.0.1` (or `--server https://127.0.0.1:443`).

## Options

| Option | What it does |
|---|---|
| `--server URL` | The server. Default `http://127.0.0.1:8080`. |
| `--password TEXT` | The admin password. Otherwise `$AJ_ADMIN_PASSWORD`, otherwise you are asked. Avoid typing it on the command line on a shared computer: it stays in your shell history. |
| `--cost N` | Price in gems (default 0). |
| `--shop` | Put the tracks on sale in the shop. |
| `--bitrate K` | MP3 bitrate for conversions: 320, 256, 224, 192 (default), 160, 128, 112, 96 or 64. |
| `--no-convert` | Upload `.mp3` files only; skip everything else. |
| `--convert-only DIR` | Convert to MP3 into `DIR` and stop. No server needed. |
| `--keep DIR` | Keep the converted MP3s in `DIR` (otherwise they are deleted after the run). |
| `-r`, `--recursive` | Look in folders inside the folder too. |
| `--allow-duplicates` | Upload a track even if one with that name exists. |
| `--insecure` | Accept the certificate of `https://127.0.0.1` / `localhost` (a tunnel's). |
| `--dry-run` | Show what would happen; convert and upload nothing. |
| `--file-names` | Name tracks after their file names instead of the title tag. |
| `--list` | Show the uploaded tracks (id and name) and stop. |
| `--rename ID NAME` | Give an uploaded track another name and stop. Find ids with `--list`. |

You can give several folders or files: `node tools/upload-music.js album1 album2 single.flac`.

## Renaming a track

In the admin panel (or the staff panel, for roles that can upload music), the **Music** tab has a **Rename**
button on each track. From the command line:

```sh
node tools/upload-music.js --server https://127.0.0.1:8443 --insecure --list
node tools/upload-music.js --server https://127.0.0.1:8443 --insecure --rename 50003 "Better Name"
```

The new name shows in every game at once (no restart, and players don't need to log out), and it is kept across
restarts. Names are 1 to 40 letters, numbers, spaces and simple punctuation (`' & ! ? . , : ( ) # + -`). Only
tracks uploaded this way can be renamed. A rename is written to the staff action log like an upload.

## Converting without uploading

To turn a folder of FLACs into MP3s you can check or edit first:

```sh
node tools/upload-music.js --convert-only ./mp3s ~/Music/flight
```

Or by hand with ffmpeg, using the same settings the script uses:

```sh
ffmpeg -i song.flac -vn -map_metadata -1 -ar 44100 -ac 2 -codec:a libmp3lame -b:a 192k song.mp3
```

## What it does with each file

- **Name.** The track name is the **title tag** stored in the file (read with `ffprobe`, which comes with ffmpeg).
  A file with no title tag uses its file name without the extension, and `--file-names` always does. Underscores
  become spaces, characters the server does not allow are removed, and the name is cut to 40 characters (an
  unfinished bracket at the cut is dropped). Fix a wrong tag in your music player, or use `--file-names`.
- **Conversion.** Non-MP3 files (FLAC, WAV, OGG, Opus, M4A, AAC, WMA, AIFF) are converted to 44.1 kHz stereo MP3
  (what the game's Flash plays best). Cover art and tags are dropped from the MP3 (the name is taken from the original file's tag first).
- **Size limit.** The server accepts MP3s from 4 KB to 15 MB. If a converted track is over 15 MB the script
  retries at lower bitrates (down to 64k) until it fits. At 96k that is about 20 minutes of audio; a longer track
  fails and says so. An MP3 that is already over 15 MB is re-encoded the same way.
- **Checks.** The server checks the MP3 itself and refuses files that are not valid MPEG audio layer III; the
  script prints the reason and carries on with the next file.
- **Exit code.** 0 if nothing failed, 1 if any file failed or the sign-in failed (useful in scripts).

## Troubleshooting

- **"could not sign in: wrong admin password":** the admin password, not a staff account's. Forgotten it? See
  `tools/reset-admin-password.js`.
- **"the server does not accept that address":** the admin panel only answers from the server's own machine or
  through a tunnel, and the address must be `127.0.0.1` or `localhost` with the port.
- **"self-signed certificate" or "hostname mismatch":** add `--insecure` (tunnel only).
- **"ffmpeg is needed":** install ffmpeg, or use `--no-convert`.
- **"Too many attempts":** the sign-in lockout after wrong passwords; wait a few minutes.
- **A track plays too quietly or loudly:** the script does not change volume; fix it in the source file (or with
  ffmpeg's `-af loudnorm`) and upload again under a different name, or delete the old one in the Music tab first.
