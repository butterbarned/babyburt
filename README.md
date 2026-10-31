# Dusklight

A private server for the AJ Classic desktop client, written in Node.js with no framework. It handles
accounts and sign-up (with optional invite codes), the game server itself, an owner dashboard, a moderator
panel, an optional Discord staff bot, and the public website (home, sign-up, account, terms and privacy).

> Dusklight is an unofficial fan project. It is not affiliated with, endorsed by or connected to WildWorks, Inc.
> or Animal Jam. Animal Jam and Animal Jam Classic are trademarks of WildWorks, Inc. Game content belongs to
> its owners. Requests for removal can be sent to the contact address you set in `AJ_LEGAL_EMAIL`.

## Quick start

You need Node.js 22.5 or later and Git.

```sh
git clone https://github.com/butterbarned/babyburt dusklight
cd dusklight
npm ci
npm start
```

Then open <http://127.0.0.1:8080/admin> and set an admin password. The full walkthrough, including playing
with the desktop client, is in **[LOCAL_SETUP.md](LOCAL_SETUP.md)**.

## Guides

| I want to... | Read |
|---|---|
| Run it on my own computer | [LOCAL_SETUP.md](LOCAL_SETUP.md) |
| Put it on a public server (Oracle Cloud) | [deploy/ORACLE.md](deploy/ORACLE.md) |
| Set up Discord sign-in and the staff bot | [deploy/DISCORD.md](deploy/DISCORD.md) |
| Auto-update a server from Git | [deploy/README.md](deploy/README.md) |
| Upload a folder of music (and convert FLAC to MP3) | [docs/MUSIC_UPLOAD.md](docs/MUSIC_UPLOAD.md) |
| Give it my own name and logo | [server_personalization/README.md](server_personalization/README.md) |
| Contribute | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Understand the code, the game's files, and what is broken | [docs/README.md](docs/README.md) |

## Configuration

Everything is set with environment variables beginning `AJ_`; see the comments in [config.js](config.js).
The ones you are most likely to need:

| Variable | What it does |
|---|---|
| `AJ_PUBLIC_URL` | The address players reach the server at. Setting it makes the server "public" (stricter defaults). |
| `AJ_SITE_URL` | A separate name for the website, if it differs from the game server's. Optional. |
| `AJ_BIND`, `AJ_HTTP_PORT`, `AJ_GAME_PORT` | Where it listens (defaults `127.0.0.1`, `8080`, `9339`). |
| `AJ_TLS_CERT`, `AJ_TLS_KEY` | A certificate and key; both ports then use TLS. |
| `AJ_TRUSTED_PROXY=1` | A reverse proxy on the same machine fronts the web port. |
| `AJ_DATA_DIR` | Where accounts, logs and backups are kept (default `./data`, never committed). |
| `AJ_OPERATOR`, `AJ_HOSTED_IN`, `AJ_LEGAL_EMAIL`, `AJ_ADMIN_EMAIL` | Fill in the Terms and Privacy pages. |
| `AJ_TURNSTILE_SITE_KEY`, `AJ_TURNSTILE_SECRET` | Cloudflare Turnstile captcha on sign-up. |
| `AJ_DISCORD_BOT_TOKEN`, `AJ_DISCORD_GUILD_ID` | Turn on the Discord staff bot. |

Secrets belong in environment variables or a root-only environment file, never in the repository.

## Layout

| Path | Contents |
|---|---|
| `server.js`, `config.js` | Entry point and settings |
| `lib/` | The server: accounts, game protocol, moderation, web routes, Discord bot |
| `public/` | Web pages and static files |
| `swf/`, `swf-src/` | The game client files and the source of the parts changed for this server |
| `deploy/` | Update scripts and the Oracle guide |
| `server_personalization/` | A tool for giving the server its own name and logo |
| `test/` | Tests |
| `tools/` | Maintenance scripts |

Runtime folders `data/` (player data) and `cache/` (game files fetched on demand) are created on first run and
are listed in `.gitignore`. **Never commit `data/`.**

## Tests

```sh
npm test
node .github/scripts/invariants.js
```
