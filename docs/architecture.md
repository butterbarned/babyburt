# How Dusklight fits together

The big picture: the pieces, how a player gets from the launcher into a
room, where things are kept, and where to look to change something. The
module-by-module reference is [server.md](server.md).

## The pieces

```
 desktop launcher ──HTTP──▶ lib/http.js ──▶ sign-in, flashvars, the game's files (lib/cdn.js, cache/)
 (separate repo)                │            pages: /account, /dashboard/admin, /dashboard/staff, /shop
       │                        │
       └── runs ajclient.swf ───┤ (the patched client: swf/ajclient.swf, built from swf-src/)
                                │
                     game socket (TCP, port 9339)
                                ▼
                          lib/sfs.js  ── SmartFoxServer 1.x messages
                                ▼
                         lib/world.js ── logins, rooms, chat; hands each
                                │        message to the module that owns it
        ┌──────────┬──────────┬─┴────────┬───────────┬────────────┐
     dens.js   items.js  parties.js  trades.js  minigames.js   ...
        │
        ▼
   lib/accounts.js ── data/game.sqlite (every account; a player's things as JSON)
   lib/defpacks.js ── the game's tables, read from the def packs (cache/)
```

- **The launcher** (the desktop client, in its own repository) signs in
  over HTTP, gets a token, and starts the game SWF with flashvars that
  point back at this server.
- **The client** is the official AJ Classic SWF with some classes replaced
  ([client.md](client.md)). Most of what the game shows and does runs in
  the client. The server says what is where, who owns what, and what
  happens next.
- **The web server** (`lib/http.js`) stands in for every web service the
  official game used. It also serves the game's files, and serves the web
  pages and the dashboards' routes ([web.md](web.md)).
- **The game server** (`lib/sfs.js`, `lib/world.js`) speaks the client's
  socket protocol. A message names a command (`"rj"`, join a room; `"ib"`,
  buy an item), and `lib/world.js` sends it to the module that handles it.

## From launcher to room

1. **`POST /authenticate`** (`lib/http.js`): username and password (and a
   2FA code, a captcha) give an auth token.
2. **`GET /flashvars`**: where the client finds everything: the content
   address, the game socket, the Jammer Wall service.
3. The client loads its files: `ajclient.swf` (the patched one), the def
   packs (`defPacks/1000` and the rest, some changed by `lib/defpacks.js`),
   `assets/HUDAssets.swf` and so on. All of them go through
   `lib/http.js` → `lib/cdn.js`, which serves them from `cache/` or fetches
   them from the official CDN once.
4. **The socket login** (`world.js`, `login`): the token is checked, the
   account loaded (`lib/accounts.js`), and the player's animals, items,
   buddies and settings sent.
5. **Joining a room** (`rj`): the client loads the room's file
   (`roomDefs/<path>.xroom`) and the server tells it who is there.

## Where things are kept

| Where | What | Written by |
|---|---|---|
| `data/game.sqlite` | accounts, settings, chat log, bans, reports, stats | `lib/accounts.js` and the modules that keep records |
| `data/itemart/` | custom items' pictures | `lib/itemart.js` |
| `data/masterpieces/` | Art Studio paintings | `lib/masterpieces.js` |
| `data/custom-music/` | music staff uploaded | `lib/custommusic.js` |
| `data/theatre-videos/` | the theatre's video files | `lib/theatrevideos.js` |
| `data/announce-media/` | pictures shown with announcements | `lib/announcemedia.js` |
| `data/emoji/` | emoji pictures for chat | `lib/emoji.js` |
| `data/backups/` | database backups | `lib/accounts.js` |
| `data/device-key` | the secret the device ids are keyed with | `lib/devices.js` |
| `data/rules.txt` | the rules players are shown in the game (`GET /rules.txt`) | by hand, on the server |
| `data/client-errors.log` | errors clients reported | `lib/http.js` |
| `cache/` | the game's files, as fetched from the CDN | `lib/cdn.js`, `tools/fetch-archive.js` |
| `lib/*.json`, `lib/*.txt` | tables the server needs that the game's files don't have | by hand, or by the tools ([server.md](server.md#data-files-in-lib)) |

`data/` is never committed. `AJ_DATA_DIR` moves it.

## The dashboards

| Page | Module | Who |
|---|---|---|
| `/dashboard/admin` (owner dashboard) | `lib/panel.js` | the admin password, from the machine itself or `AJ_ADMIN_ALLOW` addresses; or an Owner (a staff role) signed in to the staff dashboard, from anywhere |
| `/dashboard/staff` (staff dashboard) | `lib/modpanel.js` | staff accounts with 2FA; what they see depends on their role's permissions (`lib/roles.js`) |
| `/account` | `lib/manage.js` | every player, for their own account |
| Discord bot | `lib/discordbot.js` | staff with a linked Discord account |

What both staff dashboards do alike is in `lib/staff.js`. Every staff
action is recorded in the mod log (`lib/modlog.js`).

## Where to change...

| I want to change... | Look in |
|---|---|
| what a chat command does | `lib/commands.js` |
| what a shop sells | `lib/shop-stock.json` (`tools/shop-stock.py` rebuilds it); `lib/shopstock.js` |
| when items are on sale | `lib/sale-dates.json`, `lib/sales.js` |
| an item's def as clients see it | `lib/defpacks.js` (`clientItemRow`, the pack changes) |
| parties | `lib/parties.js` |
| a den rule | `lib/dens.js` |
| how a game message is answered | `lib/world.js`: search for the command's name in quotes (`"rj"`); it names the module that handles it |
| what the client shows or does | `swf-src/` (then `sh tools/build-client.sh`); the original is under `tools/decompiled/` |
| a dashboard page | `public/admin.html` or `public/mod.html`, and its route in `lib/panel.js` or `lib/modpanel.js` |
| a setting | `config.js` (environment variables `AJ_*`) |
| staff permissions | `lib/roles.js` |
| what a game file is | [game-files.md](game-files.md), and the owner dashboard's Game files page |

## Words

| Word | Means |
|---|---|
| **def** | one row of one of the game's tables: a party, a den item, a room |
| **def pack** | one of those tables, as a file (`defPacks/<id>`) |
| **media id** | the number of a `media/` file, named by the defs that use it |
| **layer id** (`layerDefId`) | the art a piece of clothing is drawn with; part of an image array's id |
| **image array** | one piece of art drawn for one animal and one animation (`imageArrays/<id>`) |
| **xt message** | a game message on the socket: `%xt%<extension>%<command>%<room>%<fields>...%` |
| **room path** | a room's file and name: `jamaa_township/room_main` (file), `jamaa_township.room_main` (in the game) |
| **user var** | a counter or set of flags the client keeps per player (achievements, Journey Book facts) |
| **the CDN** | the official content server the game's files come from, `ajcontent.akamaized.net` |
| **build** | a release of the game's files, by number (1830 is the current one) |
| **Burrow** | the server Dusklight is built on; "Burrow:" in a comment marks a change from the original client |
