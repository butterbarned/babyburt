# Web pages and routes

The pages in `public/` and the routes of the server they call. Written by `node tools/make-docs.js`.

## Pages

| Page | Address | What it is |
|---|---|---|
| `public/account.html` | `/account` | A player's own account page (lib/manage.js). |
| `public/admin.html` | `/dashboard/admin` | The owner dashboard (lib/panel.js): everything, behind the admin password or an Owner's staff sign-in. |
| `public/captcha.html` |  | The captcha, inside the client. |
| `public/commands.html` | `/commands` | The list of chat commands. |
| `public/dashboard.html` | `/dashboard` | The way into the two dashboards. |
| `public/download.html` | `/download` | The launcher's installers (config.downloadsDir). |
| `public/game.html` | `/play` | The page the game runs in, with the theatre's video and the browser overlays. |
| `public/home.html` | `/` | The home page. |
| `public/mod.html` | `/dashboard/staff` | The staff dashboard (lib/modpanel.js): what each staff role may do. |
| `public/privacy.html` | `/privacy` | The privacy policy (lib/retention.js keeps to it). |
| `public/recover.html` | `/recover` | Getting back into an account. |
| `public/register.html` | `/register` | Signing up from the web. |
| `public/shop.html` | `/shop` | The item finder (lib/admin.js). |
| `public/signup` | `/signup/...` | The sign-up pages' parts. |
| `public/stats-view.html` |  | The graphs shown inside the dashboards. |
| `public/terms.html` | `/terms` | The terms. |

Other files in `public/`: pictures (`badges/`, logos), `fonts/`, `music/` (extra den music), `filter/` (the client's chat filter lists), `captcha.js`.

## admin.html

Calls `/admin/api/<route>` (through `/dashboard/api/...` for the dashboards), answered by `lib/panel.js` unless said otherwise.

| Route | Answered in |
|---|---|
| `account` | `GET` lib/panel.js, `POST` lib/panel.js |
| `accounts` | `GET` lib/panel.js |
| `address` | `POST` lib/panel.js |
| `alts` | `GET` lib/panel.js |
| `announce` | `POST` lib/panel.js |
| `banrecord` | `GET` lib/panel.js |
| `bans` | `GET` lib/panel.js |
| `chat` | `GET` lib/panel.js |
| `chat/around` | `GET` lib/panel.js |
| `counts` | `GET` lib/panel.js |
| `creator-limits` | `GET` lib/panel.js, `POST` lib/panel.js |
| `debug` | `GET` lib/panel.js, `POST` lib/panel.js |
| `device` | `POST` lib/panel.js |
| `discord` | `GET` lib/panel.js |
| `discord/community` | `POST` lib/panel.js |
| `discord/config` | `POST` lib/panel.js |
| `discord/control` | `POST` lib/panel.js |
| `discord/security` | `POST` lib/panel.js |
| `discord/status` | `POST` lib/panel.js |
| `discord/status/publish` | `POST` lib/panel.js |
| `filterhits` | `GET` lib/panel.js |
| `game` | `POST` lib/panel.js |
| `gamefiles` | `GET` lib/panel.js |
| `gamefiles/entry` | `GET` lib/panel.js |
| `gamefiles/problems` | `GET` lib/panel.js |
| `gamefiles/worn` | `GET` lib/panel.js |
| `invites` | `GET` lib/panel.js, `POST` lib/panel.js |
| `invites/revoke` | `POST` lib/panel.js |
| `item-switches` | `POST` lib/panel.js, `ANY` lib/panel.js |
| `items` | lib/modpanel.js (shared item route) |
| `items/base` | lib/modpanel.js (shared item route) |
| `items/find` | lib/modpanel.js (shared item route) |
| `items/wear-rules` | lib/modpanel.js (shared item route) |
| `login` | `POST` lib/panel.js |
| `logout` | `POST` lib/panel.js |
| `logs` | `GET` lib/panel.js |
| `masterpiece` | `GET` lib/panel.js, `POST` lib/panel.js |
| `masterpieces` | `GET` lib/panel.js |
| `messages` | `GET` lib/panel.js |
| `moderators` | `GET` lib/panel.js |
| `motd` | `POST` lib/panel.js |
| `overview` | `GET` lib/panel.js |
| `owned` | `GET` lib/panel.js |
| `password` | `POST` lib/panel.js |
| `report` | `POST` lib/panel.js |
| `reports` | `GET` lib/panel.js |
| `review` | `ANY` lib/panel.js, lib/modpanel.js (shared item route) |
| `roles` | `GET` lib/panel.js, `POST` lib/panel.js |
| `setup` | `POST` lib/panel.js |
| `signup` | `POST` lib/panel.js |
| `state` | `GET` lib/panel.js |
| `support` | `GET` lib/panel.js, `POST` lib/panel.js |
| `timeline` | `GET` lib/panel.js |

## mod.html

Calls `/mod/api/<route>` (through `/dashboard/api/...` for the dashboards), answered by `lib/modpanel.js` unless said otherwise.

| Route | Answered in |
|---|---|
| `act` | `POST` lib/modpanel.js |
| `address` | `POST` lib/modpanel.js |
| `alts` | `GET` lib/modpanel.js |
| `bans` | `GET` lib/modpanel.js |
| `chat` | `GET` lib/modpanel.js |
| `chat/around` | `GET` lib/modpanel.js |
| `device` | `POST` lib/modpanel.js |
| `filterhits` | `GET` lib/modpanel.js |
| `items` | lib/modpanel.js (shared item route) |
| `items/base` | lib/modpanel.js (shared item route) |
| `items/find` | lib/modpanel.js (shared item route) |
| `items/wear-rules` | lib/modpanel.js (shared item route) |
| `login` | `POST` lib/modpanel.js |
| `logout` | `POST` lib/modpanel.js |
| `masterpiece` | `GET` lib/modpanel.js, `POST` lib/modpanel.js |
| `masterpieces` | `GET` lib/modpanel.js |
| `me` | `GET` lib/modpanel.js |
| `modlog` | `GET` lib/modpanel.js |
| `notes` | `GET` lib/modpanel.js |
| `overview` | `GET` lib/modpanel.js |
| `player` | `GET` lib/modpanel.js |
| `players` | `GET` lib/modpanel.js |
| `report` | `POST` lib/modpanel.js |
| `reports` | `GET` lib/modpanel.js |
| `request` | `POST` lib/modpanel.js |
| `requests` | `GET` lib/modpanel.js |
| `review` | `ANY` lib/modpanel.js, lib/modpanel.js (shared item route) |
| `server` | `GET` lib/modpanel.js |
| `state` | `GET` lib/modpanel.js |
| `theatre` | `ANY` lib/modpanel.js |
| `timeline` | `GET` lib/modpanel.js |

## account.html

Calls `/account/api/<route>` (through `/dashboard/api/...` for the dashboards), answered by `lib/manage.js` unless said otherwise.

| Route | Answered in |
|---|---|
| `act` | `POST` lib/manage.js |
| `login` | `POST` lib/manage.js |
| `logout` | `POST` lib/manage.js |
| `me` | `GET` lib/manage.js |
| `tradable` | `GET` lib/manage.js |

## Every route

| Route | In |
|---|---|
| `GET /account` | lib/manage.js |
| `POST /account/api/act` | lib/manage.js |
| `GET /account/api/export` | lib/manage.js |
| `ANY /account/api/itemart` | lib/http.js |
| `POST /account/api/login` | lib/manage.js |
| `POST /account/api/logout` | lib/manage.js |
| `GET /account/api/me` | lib/manage.js |
| `POST /account/api/recover/check` | lib/manage.js |
| `POST /account/api/recover/complete` | lib/manage.js |
| `POST /account/api/recover/request` | lib/manage.js |
| `GET /account/api/tradable` | lib/manage.js |
| `GET /account/discord/callback` | lib/manage.js |
| `GET /account/discord/link` | lib/manage.js |
| `GET /account/recover` | lib/manage.js |
| `GET /admin` | lib/panel.js |
| `GET /admin/api/account` | lib/panel.js |
| `POST /admin/api/account` | lib/panel.js |
| `GET /admin/api/accounts` | lib/panel.js |
| `POST /admin/api/address` | lib/panel.js |
| `GET /admin/api/address-search` | lib/panel.js |
| `GET /admin/api/alts` | lib/panel.js |
| `POST /admin/api/announce` | lib/panel.js |
| `GET /admin/api/banrecord` | lib/panel.js |
| `GET /admin/api/bans` | lib/panel.js |
| `GET /admin/api/chat` | lib/panel.js |
| `GET /admin/api/chat/around` | lib/panel.js |
| `GET /admin/api/counts` | lib/panel.js |
| `GET /admin/api/creator-limits` | lib/panel.js |
| `POST /admin/api/creator-limits` | lib/panel.js |
| `GET /admin/api/debug` | lib/panel.js |
| `POST /admin/api/debug` | lib/panel.js |
| `POST /admin/api/device` | lib/panel.js |
| `GET /admin/api/device-search` | lib/panel.js |
| `GET /admin/api/discord` | lib/panel.js |
| `POST /admin/api/discord/community` | lib/panel.js |
| `POST /admin/api/discord/config` | lib/panel.js |
| `POST /admin/api/discord/control` | lib/panel.js |
| `POST /admin/api/discord/security` | lib/panel.js |
| `POST /admin/api/discord/status` | lib/panel.js |
| `POST /admin/api/discord/status/publish` | lib/panel.js |
| `GET /admin/api/filterhits` | lib/panel.js |
| `POST /admin/api/game` | lib/panel.js |
| `GET /admin/api/gamefiles` | lib/panel.js |
| `GET /admin/api/gamefiles/entry` | lib/panel.js |
| `GET /admin/api/gamefiles/file` | lib/panel.js |
| `GET /admin/api/gamefiles/problems` | lib/panel.js |
| `GET /admin/api/gamefiles/worn` | lib/panel.js |
| `GET /admin/api/invites` | lib/panel.js |
| `POST /admin/api/invites` | lib/panel.js |
| `POST /admin/api/invites/revoke` | lib/panel.js |
| `POST /admin/api/item-switches` | lib/panel.js |
| `ANY /admin/api/item-switches` | lib/panel.js |
| `ANY /admin/api/itemart` | lib/http.js |
| `POST /admin/api/login` | lib/panel.js |
| `POST /admin/api/logout` | lib/panel.js |
| `GET /admin/api/logs` | lib/panel.js |
| `GET /admin/api/masterpiece` | lib/panel.js |
| `POST /admin/api/masterpiece` | lib/panel.js |
| `GET /admin/api/masterpieces` | lib/panel.js |
| `GET /admin/api/messages` | lib/panel.js |
| `GET /admin/api/moderators` | lib/panel.js |
| `POST /admin/api/motd` | lib/panel.js |
| `ANY /admin/api/music` | lib/http.js |
| `GET /admin/api/overview` | lib/panel.js |
| `GET /admin/api/owned` | lib/panel.js |
| `POST /admin/api/password` | lib/panel.js |
| `POST /admin/api/report` | lib/panel.js |
| `GET /admin/api/reports` | lib/panel.js |
| `ANY /admin/api/review` | lib/panel.js |
| `GET /admin/api/roles` | lib/panel.js |
| `POST /admin/api/roles` | lib/panel.js |
| `POST /admin/api/setup` | lib/panel.js |
| `POST /admin/api/signup` | lib/panel.js |
| `GET /admin/api/state` | lib/panel.js |
| `GET /admin/api/stats` | lib/panel.js |
| `GET /admin/api/support` | lib/panel.js |
| `POST /admin/api/support` | lib/panel.js |
| `ANY /admin/api/theatre` | lib/http.js |
| `GET /admin/api/timeline` | lib/panel.js |
| `GET /admin/discord/callback` | lib/panel.js |
| `GET /admin/discord/login` | lib/panel.js |
| `GET /api/accounts` | lib/admin.js |
| `POST /api/ban` | lib/admin.js |
| `POST /api/command` | lib/admin.js |
| `POST /api/give` | lib/admin.js |
| `POST /api/outfit` | lib/admin.js |
| `POST /api/register` | lib/admin.js |
| `GET /api/saved` | lib/admin.js |
| `GET /api/search` | lib/admin.js |
| `GET /api/status` | lib/admin.js |
| `POST /api/theme` | lib/admin.js |
| `POST /authenticate` | lib/http.js |
| `GET /ban-icon.png` | lib/http.js |
| `GET /bio-icon.png` | lib/http.js |
| `GET /captcha` | lib/http.js |
| `GET /captcha.js` | lib/http.js |
| `GET /commands` | lib/http.js |
| `GET /crossdomain.xml` | lib/http.js |
| `GET /download` | lib/http.js |
| `GET /favicon.ico` | lib/http.js |
| `GET /flashvars` | lib/http.js |
| `POST /game/mp` | lib/http.js |
| `GET /gameClient/game/index.html` | lib/http.js |
| `GET /logo-square.png` | lib/http.js |
| `GET /logo.png` | lib/http.js |
| `GET /mod` | lib/modpanel.js |
| `POST /mod/api/act` | lib/modpanel.js |
| `POST /mod/api/address` | lib/modpanel.js |
| `GET /mod/api/alts` | lib/modpanel.js |
| `GET /mod/api/bans` | lib/modpanel.js |
| `GET /mod/api/chat` | lib/modpanel.js |
| `GET /mod/api/chat/around` | lib/modpanel.js |
| `POST /mod/api/device` | lib/modpanel.js |
| `GET /mod/api/filterhits` | lib/modpanel.js |
| `POST /mod/api/game-login` | lib/modpanel.js |
| `ANY /mod/api/itemart` | lib/http.js |
| `POST /mod/api/login` | lib/modpanel.js |
| `POST /mod/api/logout` | lib/modpanel.js |
| `GET /mod/api/masterpiece` | lib/modpanel.js |
| `POST /mod/api/masterpiece` | lib/modpanel.js |
| `GET /mod/api/masterpieces` | lib/modpanel.js |
| `GET /mod/api/me` | lib/modpanel.js |
| `GET /mod/api/modlog` | lib/modpanel.js |
| `ANY /mod/api/music` | lib/http.js |
| `GET /mod/api/notes` | lib/modpanel.js |
| `GET /mod/api/overview` | lib/modpanel.js |
| `GET /mod/api/player` | lib/modpanel.js |
| `GET /mod/api/players` | lib/modpanel.js |
| `POST /mod/api/report` | lib/modpanel.js |
| `GET /mod/api/reports` | lib/modpanel.js |
| `POST /mod/api/request` | lib/modpanel.js |
| `GET /mod/api/requests` | lib/modpanel.js |
| `ANY /mod/api/review` | lib/modpanel.js |
| `GET /mod/api/server` | lib/modpanel.js |
| `GET /mod/api/state` | lib/modpanel.js |
| `GET /mod/api/stats` | lib/modpanel.js |
| `ANY /mod/api/theatre` | lib/modpanel.js |
| `ANY /mod/api/theatrevideos` | lib/http.js |
| `GET /mod/api/timeline` | lib/modpanel.js |
| `GET /mod/discord/callback` | lib/modpanel.js |
| `GET /mod/discord/login` | lib/modpanel.js |
| `GET /player` | lib/http.js |
| `GET /privacy` | lib/http.js |
| `GET /register` | lib/http.js |
| `GET /rules.txt` | lib/http.js |
| `GET /shop` | lib/http.js |
| `GET /terms` | lib/http.js |
| `POST /v1/login` | lib/http.js |
| `POST /v1/reportError` | lib/http.js |
| `POST /wall` | lib/http.js |

`lib/http.js` answers more by testing the address itself (the launcher's services, the game's files, the pages); read its `handle` function for those.
