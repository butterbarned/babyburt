# Dusklight documentation

Where everything is, what it does, and how the pieces connect.

## Start here

| Page | What it covers |
|---|---|
| [architecture.md](architecture.md) | How it fits together: the launcher, the web server, the game server, the dashboards; where data is kept; where to change what |
| [game-files.md](game-files.md) | The game's files: what each CDN folder and def pack holds, how files are named, and which files make up a party, a den item, clothing, a shop, a room and the rest |
| [broken-references.md](broken-references.md) | What points at something that isn't there, and what it should point at |

## Reference

These four are written by `node tools/make-docs.js` from the code itself.
Run it again after changing the code, and don't edit them by hand.

| Page | What it covers |
|---|---|
| [server.md](server.md) | Every module of `lib/`, by area: what it does, what it uses, what uses it, which game tables and data it touches |
| [client.md](client.md) | Every class changed in the game client (`swf-src/`), and which of its methods were changed |
| [web.md](web.md) | The web pages, the routes each one calls, and every route |
| [tools.md](tools.md) | Every script in `tools/` |

## Guides

| Page | What it covers |
|---|---|
| [MUSIC_UPLOAD.md](MUSIC_UPLOAD.md) | Uploading a folder of music |
| [CUSTOM_ITEM_ART.md](CUSTOM_ITEM_ART.md) | Custom items' pictures |
| [../LOCAL_SETUP.md](../LOCAL_SETUP.md) | Running it on your own computer |
| [../deploy/ORACLE.md](../deploy/ORACLE.md) | Putting it on a public server |
| [../deploy/DISCORD.md](../deploy/DISCORD.md) | Discord sign-in and the staff bot |

## Looking things up

- **What is this file / which files are this thing's?** The owner dashboard's
  **Game files** page (`/dashboard/admin#gamefiles`): search by name, id,
  `kind:id`, path or hashed file name.
- **What is broken?** `node tools/check-references.js --list <file list>`;
  see [broken-references.md](broken-references.md).
- **Which module handles X?** [server.md](server.md), or search `lib/world.js`
  for the game message's name in quotes.
