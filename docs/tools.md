# Tools

The scripts in `tools/`. Written by `node tools/make-docs.js` from each script's opening comment.

`tools/decompiled/` is the decompiled client, for reading only (`old-builds/` has older builds). `tools/ffdec/` is JPEXS, which `build-client.sh` runs.

## tools/build-client.sh

```
rebuilds swf/ajclient.swf: the untouched client (swf/ajclient.before-finder.swf)
with every class in swf-src/ compiled over its original, by JPEXS (tools/ffdec,
needs Java). the result is the same bytes every time.

  tools/build-client.sh [output.swf]      (default: swf/ajclient.swf)

A class added to swf-src/ needs a line below: its full name, then its file.

one thing is not a whole class: gui.EmoticonUtility's static initialiser,
as P-code, with our emote added to its lists (tools/make-emote.py). the
decompiler gets two of that class's functions wrong, so the class cannot
be compiled from its source. 4839 is that method body's place in the
untouched client.

gui.BulletinBoard cannot be compiled from its source either (its media
callback comes out as loops that do not do what the bytecode does), so two
of its methods are replaced as P-code: the tutorial and "what's new" video
lists return at once when empty, as this server sends them (they threw).
```

## tools/check-references.js

```
looks for connections that lead nowhere, in the code and in the game's
data, and prints what it found as Markdown (docs/broken-references.md
says what each one should point at, and is kept by hand from this).

  node tools/check-references.js [--files] [--list <file list>] [--out report.md]

in the code:
  - files of the repository a comment, a page or a script names, that are
    not there (a path under lib/, tools/ and so on, or a NAME.md)
  - classes in swf-src/ that tools/build-client.sh does not compile, and
    ones it names that are not there
  - calls the web pages make to the server that no route answers
  - files config.js points the server at that are not there
  - the theme list's room files (config.themes) the cache does not have

in the game's data (lib/gamefiles.js):
  - defs that name something no def pack has: a party's room, a shop's
    item, a diamond row's pet
```

## tools/client-test.js

```
drives the custom client (~/aj-private-client) through a real login and
saves a screenshot of the game view. it opens a window on the desktop.

  AJ_USER=name AJ_PASS=password [WAIT=55000] node tools/client-test.js shot.png

extra arguments go to Electron. uses the Chrome DevTools Protocol.
```

## tools/content-ids-dry-run.js

```
a rehearsal of the move of old content ids (lib/contentmove.js) on a copy
of a database: the copy is made in a folder of its own, the server's
start-up loading runs on it (as the server would), what changed is
printed, the copy is searched for any old id left anywhere, and the copy
is deleted. the database named is only read, so the server can be running.

  node tools/content-ids-dry-run.js <game.sqlite>

run it from the folder of the new server code (it needs that code and its
asset cache). exits 1 if anything is left on an old id.
every value or key in the database (but the move table) that is one of
`numbers`, as a json path: a number, or a whole number in a string ("den:
55000", not the digits inside a hash). only where, never what, is printed:
the tables hold password hashes and such.
```

## tools/extract-swfs.sh

```
extract-swfs.sh - copy every SWF out of a mirror folder, adding a .swf extension.

Usage:
  ./extract-swfs.sh [SOURCE_DIR] [DEST_DIR]

Defaults: SOURCE_DIR=./cache   DEST_DIR=./swf-copies

Files are detected by their first 3 bytes (FWS, CWS or ZWS = the three SWF
signatures), so audio and other asset types are ignored. The originals are
never touched or renamed; only copies are made. Re-running is safe: copies
that already exist are skipped.
```

## tools/fetch-archive.js

```
fills cache/ (and data/emoji/) with every game file in a list, straight
from the official CDN, so the server can later run with AJ_OFFLINE=1 and
no outside address at all. made for the VPS: the list is the archive kept
on another machine (files.txt.gz, one path per line: "1830/imageArrays/
<hash>" for a game file, "emoji/<name>.png" for an emoji), so the files
themselves never have to be carried over.

  node tools/fetch-archive.js files.txt.gz [--concurrency 128]

run it as the user the server runs as, so the files are theirs. the server
can keep running meanwhile. it can be stopped and started again: a file
already kept is not fetched again. files are kept as lib/cdn.js keeps
them (cachePath: a hashed name one folder down, under its first two
characters). anything that could not be fetched is listed in
cache/fetch-failures.tsv. players' own data (masterpieces/, ABSU/) is
never on the list and could not be fetched with it: every game path
starts with a build number.
the same as cachePath in lib/cdn.js
```

## tools/fetch-ruffle.js

```
fetches Ruffle, the Flash player for browsers, into config.ruffleDir
(cache/ruffle), for playing in a browser (/account/play). one release,
checked against its hash: the server hands these files to every player.

  node tools/fetch-ruffle.js

to move to another release, change RELEASE and SHA256 together (the hash is
the zip's: `sha256sum ruffle-*-web-selfhosted.zip`), run this, and try the
game in a browser before putting it on a server.
the entries of a zip, read from its central directory: {name: Buffer}.
```

## tools/find-art.py

```
ZWS: "ZWS", version, uncompressed length, compressed length, LZMA
properties, data. the .lzma format wants properties, length, data.
```

## tools/game-fonts.js

```
makes the font files a browser player needs (/account/play, Ruffle): the
game's text asks for its fonts by name ("CCDigitalDeliveryBold",
"TikiIsland"...), as the desktop client has them, and Ruffle finds a font
only by the name inside its file. so each font is written again under each
name the game uses for it, into public/fonts/game/, with a list
(fonts.json) that public/game.html hands to Ruffle.

  node tools/game-fonts.js

CCDigitalDelivery comes from public/fonts (the whole font); the others are
taken out of swf/sharedFonts.swf by JPEXS (tools/ffdec, needs Java).
[file it comes from, name the game asks for, bold]
the fonts in sharedFonts.swf, as TTF files, by their class name
JPEXS names them "<id>_<class>_<font name>.ttf"
the tables of an OpenType/TrueType file: {tag: Buffer}, and its version
```

## tools/hud/dump.py

_No opening comment._

## tools/hud/transplant-nametag.py

_No opening comment._

## tools/install-theatre-videos.sh

```
moves the videos in a folder into the theatre's (data/theatre-videos, see
lib/theatrevideos.js), owned by the user the server runs as, where staff
can play them at once: no restart. tools/upload-videos.ps1 uploads a
folder of them to ~/theatre-incoming and runs this; it can be run by hand
just as well, on videos put anywhere on the machine:

  sudo bash tools/install-theatre-videos.sh <folder> [data folder]
  sudo bash tools/install-theatre-videos.sh --list [data folder]

--list prints the videos there now, "<file name><tab><bytes>" a line.

to let the user you log in as (ubuntu, say) see, add and delete the
videos in a file viewer, and nothing else of the data folder, once:

  d=/home/flight/flight/data/theatre-videos
  sudo setfacl -m u:ubuntu:x /home/flight /home/flight/flight /home/flight/flight/data
  sudo setfacl -R -m u:ubuntu:rwX,m::rwX "$d"
  sudo setfacl -d -m u:ubuntu:rwX,u:flight:rwX "$d"
```

## tools/item-ids.js

```
which den and clothing ids are used, and by what: the custom items (PNG
items made in the mod panel, lib/customitems.js), the content packs
(lib/contentpacks.js) and the extra music (lib/extramusic.js). reads the
game's database without changing it, so it can run beside the server.
needs nothing else of the server's code, so the one file can be copied to
a server of any version.

  node tools/item-ids.js            the ranges, what is in each, and any clash
  node tools/item-ids.js 50012 ...  what each id is

AJ_DATA_DIR picks the database, as for the server (default data/).
the ranges are lib/itemids.js's, copied (this file needs no other).
no extra music here
```

## tools/make-badges.py

_No opening comment._

## tools/make-bio-tab.py

```
the trade button's pictures, and how many layers of each are the button itself.
```

## tools/make-docs.js

```
writes the reference pages of docs/ from the code itself, so they say
what the code does today:

  docs/server.md   every module of lib/: what it is for (its own opening
                   comment), what it uses, what uses it, the game files
                   and data files it touches
  docs/client.md   every class in swf-src/ and what was changed in it
  docs/web.md      the web pages, and the server routes each one calls
  docs/tools.md    every script in tools/

  node tools/make-docs.js

run it after adding or changing a module, and commit what it writes. the
pages written by hand (docs/README.md, architecture.md, game-files.md,
broken-references.md) link to these. a module's group and one-line summary
are in GROUPS below: a new module with none is listed under "Other".
each module's group and one-line summary, written by hand
```

## tools/make-emote.py

```
character ids of ours, far above the file's own (which end near 4,000):
picture, the two shapes, the two clips.
the game's emotes are drawn about their middle: the large ones 35 by 38
pixels (emo_sick's shape is 706 by 763 twips), the small ones 19 by 20.
```

## tools/mirror-ajcontent.js

_No opening comment._

## tools/pack-for-vps.sh

```
makes a folder to copy to the machine that will host the server: the code,
the asset cache, and a clean copy of the database. nothing else of data/
goes: not the logs (months of game messages, with what players typed and
enough to work some passwords out), not the recordings of the official
game, not the old accounts.json.

  tools/pack-for-vps.sh <new folder>

the database is copied with SQLite's own VACUUM INTO, so it is whole and
small whether or not the server is running. tools/ is left out but for
what the running server may be asked to use.
```

## tools/publish-public.sh

```
copies this repository as it stands at its last commit, minus what stays
private, into the public one and pushes it:

  tools/publish-public.sh [--no-push]

no markdown file of any kind goes public. the public repository has a
history of its own: nothing of this one's
history goes there, so a file that was ever committed here and is private
never shows up in an old public commit. the public repository's own files
(its README, .gitignore and licence, written there) are left as they are.
what stays private: the client updates (release files) and the working
notes. the game's client, its SWFs and the client decompiled go public.
the public repository's own: never replaced or removed from here
no markdown file goes public, of any kind (the owner's rule)
a last look before anything leaves: no markdown and no key
```

## tools/reset-admin-password.js

```
forgets the admin panel's password, so the panel asks for a new one the
next time it is opened. restart the server afterwards: from another machine
the panel will want the setup code it prints at start.

  node tools/reset-admin-password.js
```

## tools/room-assets.js

```
writes out the files a room file carries inside it.

  node tools/room-assets.js <outdir> <room/path>...
  node tools/room-assets.js /tmp/scenes pvp_tictactoe/room_main

A room file (roomDefs/<path>.xroom: zlib, then AMF3) holds its artwork as
SWFs in `assets`, each with a name and its bytes (`ba`); its layers say
which asset each one shows. A minigame's scene is such a room, and the
SWF on its "theGame" layer has code of its own: half the rules of each
buddy game are in there (lib/buddygames.js). to read it:

  java -jar tools/ffdec/ffdec-cli.jar -export script <dir> <the .swf>
```

## tools/room-history.js

```
lists every version of the lands' room files the CDN still has: for each
room, which builds share a version, the big pictures inside it, and when
its newest artwork was saved. this is how the older designs in the Theme
list were found (DISCOVERIES.md, "Older designs of the lands").

  node tools/room-history.js <workdir>

downloads about 1.9 GB and keeps the 400 MB that is distinct, in
<workdir>/files, so a second run only reads. A build is dated by the
newest sale start in its item pack, which is a few weeks ahead of it.
tried again below
```

## tools/room-info.js

_No opening comment._

## tools/sale-history.js

```
collects when each item was on sale, from every build of the defPacks the
CDN still serves, into lib/sale-dates.json (see lib/sales.js for what
reads it).

  node tools/sale-history.js

an item's def carries one sale window, availabilityStartTime to
availabilityEndTime, and the official game rewrote it whenever the item
came back: Halloween items have a window each October, and so on. any one
build only has the latest. old builds stay on the CDN under their own
number (35 of them between 1636 and 1830 when this was written), so
reading them all gives each item's windows over about four years.

downloads about 10 MB and keeps none of it.
tried again below
```

## tools/shop-stock.py

_No opening comment._

## tools/upload-music.js

```
uploads music to a running server's admin panel, as its Music tab does, but
a whole folder at a time. each MP3 becomes a den music track at once.
FLAC (and WAV, OGG, M4A, ...) are converted to MP3 first with ffmpeg, which
has to be installed for that.

  node tools/upload-music.js [options] <folder-or-file>...

  --server URL       the server (default http://127.0.0.1:8080). for a public server
                     use an SSH tunnel, as for the admin panel: https://127.0.0.1:8443
  --password TEXT    the admin password (else $AJ_ADMIN_PASSWORD, else asked for)
  --cost N           price in gems (default 0)
  --shop             put the tracks on sale in the shop
  --bitrate K        MP3 bitrate in kbit/s for conversions (default 192); a track too big
                     for the 15 MB limit is tried again at lower ones
  --no-convert       upload .mp3 files only; skip everything else
  --convert-only DIR convert to MP3 into DIR and stop: no server needed
  --keep DIR         keep converted MP3s in DIR (else they are deleted afterwards)
  --recursive, -r    look in the folders inside a folder too
```

## tools/upload-videos.ps1

```
uploads every video in a folder on this computer to the theatre's folder
on the VPS (data/theatre-videos, see lib/theatrevideos.js), where staff can
play them at once: no restart. it goes through PuTTY (pscp and plink) and
a saved PuTTY session that logs in with a key.

  powershell -ExecutionPolicy Bypass -File tools\upload-videos.ps1 -Folder "D:\Movies" -Session my-vps

-Recurse takes the videos in the folder's folders too, all into the one
theatre folder. -Server is where the server's repository is on the VPS
(default /home/flight/flight).

each video is uploaded to ~/theatre-incoming on the VPS, then
tools/install-theatre-videos.sh (run there with sudo) moves them all in,
owned by the server's user. a video already there (the same name and
size) is not uploaded again, nor one already in ~/theatre-incoming from a
run that was cut short, so it can be run again after a dropped connection.
only .mp4, .m4v and .webm files are taken; a video's name is its file's.
the VPS answers in UTF-8: names with accents read back as they are
```

## tools/upload-videos.sh

```
tools/upload-videos.ps1 for Linux: uploads every video in a folder on this
computer to the theatre's folder on the VPS (data/theatre-videos, see
lib/theatrevideos.js), where staff can play them at once: no restart. it
goes through ssh and rsync, to a host ssh can log in to with a key (a
Host in ~/.ssh/config, or user@address).

  bash tools/upload-videos.sh <folder> <ssh host> [--recurse] [--server /home/flight/flight]

--recurse takes the videos in the folder's folders too, all into the one
theatre folder. --server is where the server's repository is on the VPS.

the videos go to ~/theatre-upload on the VPS, then
tools/install-theatre-videos.sh (run there with sudo) moves them in,
owned by the server's user. rsync keeps a file it is still sending under
~/theatre-upload/.partial and goes on from there next time, so only
whole files are moved in, and after a dropped connection the same
command picks up where it stopped. a video already there (the same name
and size) is not sent again. only .mp4, .m4v and .webm files are taken;
```
