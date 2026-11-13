# Server modules

Every file of the server, grouped by what it is for. Written by `node tools/make-docs.js` from the code: each module's description is its own opening comment, so fix a description there, not here. [architecture.md](architecture.md) says how they fit together.

In each module: **Uses** are the modules it loads, **Used by** the ones that load it, **Def packs** the game tables it reads (see [game-files.md](game-files.md#the-def-packs)), **Game files** the CDN folders it names, and **Data** what it keeps under `data/`.

## Contents

- **The core**: [`server.js`](#server-js), [`config.js`](#config-js), [`lib/sfs.js`](#lib-sfs-js), [`lib/world.js`](#lib-world-js), [`lib/http.js`](#lib-http-js), [`lib/commands.js`](#lib-commands-js), [`lib/stubs.js`](#lib-stubs-js), [`lib/limits.js`](#lib-limits-js), [`lib/log.js`](#lib-log-js), [`lib/logtext.js`](#lib-logtext-js), [`lib/stats.js`](#lib-stats-js), [`lib/retention.js`](#lib-retention-js)
- **The game's files**: [`lib/cdn.js`](#lib-cdn-js), [`lib/amf3.js`](#lib-amf3-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/roominfo.js`](#lib-roominfo-js), [`lib/gamefiles.js`](#lib-gamefiles-js)
- **Accounts and signing in**: [`lib/accounts.js`](#lib-accounts-js), [`lib/signup.js`](#lib-signup-js), [`lib/manage.js`](#lib-manage-js), [`lib/totp.js`](#lib-totp-js), [`lib/captcha.js`](#lib-captcha-js), [`lib/devices.js`](#lib-devices-js), [`lib/names.js`](#lib-names-js), [`lib/discord.js`](#lib-discord-js), [`lib/recoverymail.js`](#lib-recoverymail-js), [`lib/invitehook.js`](#lib-invitehook-js), [`lib/erase.js`](#lib-erase-js)
- **A player's things**: [`lib/player.js`](#lib-player-js), [`lib/avatars.js`](#lib-avatars-js), [`lib/items.js`](#lib-items-js), [`lib/dens.js`](#lib-dens-js), [`lib/pets.js`](#lib-pets-js), [`lib/adopt.js`](#lib-adopt-js), [`lib/trades.js`](#lib-trades-js), [`lib/worlditems.js`](#lib-worlditems-js), [`lib/achievements.js`](#lib-achievements-js), [`lib/colours.js`](#lib-colours-js), [`lib/wearrules.js`](#lib-wearrules-js), [`lib/badges.js`](#lib-badges-js), [`lib/tints.js`](#lib-tints-js), [`lib/disguises.js`](#lib-disguises-js), [`lib/buddies.js`](#lib-buddies-js)
- **Shops, items and music**: [`lib/shopstock.js`](#lib-shopstock-js), [`lib/sales.js`](#lib-sales-js), [`lib/admin.js`](#lib-admin-js), [`lib/customitems.js`](#lib-customitems-js), [`lib/playeritems.js`](#lib-playeritems-js), [`lib/itemcontrol.js`](#lib-itemcontrol-js), [`lib/itemart.js`](#lib-itemart-js), [`lib/custommusic.js`](#lib-custommusic-js), [`lib/extramusic.js`](#lib-extramusic-js)
- **Places and events**: [`lib/parties.js`](#lib-parties-js), [`lib/epicdens.js`](#lib-epicdens-js), [`lib/adventures.js`](#lib-adventures-js), [`lib/adventures/training-grounds.js`](#lib-adventures-training-grounds-js), [`lib/adventures/return-of-the-phantoms.js`](#lib-adventures-return-of-the-phantoms-js), [`lib/minigames.js`](#lib-minigames-js), [`lib/buddygames.js`](#lib-buddygames-js), [`lib/journeybook.js`](#lib-journeybook-js), [`lib/theatre.js`](#lib-theatre-js), [`lib/theatrevideos.js`](#lib-theatrevideos-js), [`lib/masterpieces.js`](#lib-masterpieces-js), [`lib/jpegprint.js`](#lib-jpegprint-js), [`lib/walls.js`](#lib-walls-js), [`lib/ecards.js`](#lib-ecards-js), [`lib/emoji.js`](#lib-emoji-js)
- **Chat and safety**: [`lib/chatfilter.js`](#lib-chatfilter-js), [`lib/chatspam.js`](#lib-chatspam-js), [`lib/chatlog.js`](#lib-chatlog-js), [`lib/moderation.js`](#lib-moderation-js), [`lib/reports.js`](#lib-reports-js), [`lib/bans.js`](#lib-bans-js), [`lib/image-moderation.js`](#lib-image-moderation-js), [`lib/modnotes.js`](#lib-modnotes-js), [`lib/modlog.js`](#lib-modlog-js), [`lib/support.js`](#lib-support-js)
- **Staff and the dashboards**: [`lib/panel.js`](#lib-panel-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/staff.js`](#lib-staff-js), [`lib/roles.js`](#lib-roles-js), [`lib/discordbot.js`](#lib-discordbot-js), [`lib/announcemedia.js`](#lib-announcemedia-js)
- **Other**: [`lib/creatorlimits.js`](#lib-creatorlimits-js), [`lib/outfitcodes.js`](#lib-outfitcodes-js), [`lib/denitemfile.js`](#lib-denitemfile-js), [`lib/contentshop.js`](#lib-contentshop-js), [`lib/websocket.js`](#lib-websocket-js), [`lib/denprefabs.js`](#lib-denprefabs-js), [`lib/itemids.js`](#lib-itemids-js), [`lib/contentmove.js`](#lib-contentmove-js), [`lib/contentpacks.js`](#lib-contentpacks-js)
- **Data files in lib/**: `lib/games.json`, `lib/journeybook.json`, `lib/shop-stock.json`, `lib/sale-dates.json`, `lib/ecard-art.json`, `lib/wall-art.json`, `lib/chat-filter.txt`, `lib/reserved-names.txt`, `lib/sexual-names.txt`

## The core

What every request and message passes through.

### server.js

**Starts everything: loads the def packs and the database, then opens the web server and the game socket.**

- 103 lines
- **Uses** [`lib/log.js`](#lib-log-js), [`lib/accounts.js`](#lib-accounts-js), [`lib/bans.js`](#lib-bans-js), [`lib/devices.js`](#lib-devices-js), [`lib/discord.js`](#lib-discord-js), [`lib/discordbot.js`](#lib-discordbot-js), [`lib/roles.js`](#lib-roles-js), [`lib/chatlog.js`](#lib-chatlog-js), [`lib/modlog.js`](#lib-modlog-js), [`lib/retention.js`](#lib-retention-js), [`lib/colours.js`](#lib-colours-js), [`lib/customitems.js`](#lib-customitems-js), [`lib/contentpacks.js`](#lib-contentpacks-js), [`lib/custommusic.js`](#lib-custommusic-js), [`lib/theatrevideos.js`](#lib-theatrevideos-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/http.js`](#lib-http-js), [`lib/masterpieces.js`](#lib-masterpieces-js), [`lib/denprefabs.js`](#lib-denprefabs-js), [`lib/panel.js`](#lib-panel-js), [`lib/reports.js`](#lib-reports-js), [`lib/roominfo.js`](#lib-roominfo-js), [`lib/support.js`](#lib-support-js), [`lib/sfs.js`](#lib-sfs-js), [`lib/stats.js`](#lib-stats-js), [`lib/world.js`](#lib-world-js)

### config.js

**Every setting, with its environment variable and its default.**

- 429 lines
- **Used by** [`server.js`](#server-js), [`lib/adventures.js`](#lib-adventures-js), [`lib/captcha.js`](#lib-captcha-js), [`lib/cdn.js`](#lib-cdn-js), [`lib/chatlog.js`](#lib-chatlog-js), [`lib/colours.js`](#lib-colours-js), [`lib/commands.js`](#lib-commands-js), [`lib/custommusic.js`](#lib-custommusic-js), [`lib/devices.js`](#lib-devices-js), [`lib/discord.js`](#lib-discord-js), [`lib/discordbot.js`](#lib-discordbot-js), [`lib/emoji.js`](#lib-emoji-js), [`lib/image-moderation.js`](#lib-image-moderation-js), [`lib/limits.js`](#lib-limits-js), [`lib/moderation.js`](#lib-moderation-js), [`lib/names.js`](#lib-names-js), [`lib/parties.js`](#lib-parties-js), [`lib/playeritems.js`](#lib-playeritems-js), [`lib/recoverymail.js`](#lib-recoverymail-js), [`lib/retention.js`](#lib-retention-js), [`lib/sfs.js`](#lib-sfs-js), [`lib/signup.js`](#lib-signup-js), [`lib/stats.js`](#lib-stats-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/theatrevideos.js`](#lib-theatrevideos-js), [`lib/announcemedia.js`](#lib-announcemedia-js), [`lib/gamefiles.js`](#lib-gamefiles-js), [`lib/invitehook.js`](#lib-invitehook-js), [`lib/creatorlimits.js`](#lib-creatorlimits-js), [`lib/masterpieces.js`](#lib-masterpieces-js), [`lib/panel.js`](#lib-panel-js), [`lib/dens.js`](#lib-dens-js), [`lib/itemart.js`](#lib-itemart-js), [`lib/admin.js`](#lib-admin-js), [`lib/manage.js`](#lib-manage-js), [`lib/http.js`](#lib-http-js), [`lib/accounts.js`](#lib-accounts-js), [`lib/world.js`](#lib-world-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/contentmove.js`](#lib-contentmove-js), [`lib/contentpacks.js`](#lib-contentpacks-js)

### lib/sfs.js

**The game socket: the SmartFoxServer 1.x protocol the client speaks.**

SmartFoxServer 1.x wire protocol as spoken by the client's SmartFoxClient: messages are UTF-8, terminated by a NUL byte, and come in three flavours told apart by their first character:

```
  <msg t='sys'><body action='..' r='roomId'>..</body></msg>   system (XML)
  %xt%<ext>%<cmd>%<roomId>%<param>%...%                        extension (raw)
  {"t":"xt","b":{...}}                                         extension (JSON)
```

- 323 lines
- **Uses** [`lib/limits.js`](#lib-limits-js)
- **Used by** [`server.js`](#server-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/http.js`](#lib-http-js)

### lib/world.js

**The game itself: logins, rooms, movement, chat, and every game message, handed on to the modules below.**

game logic behind the socket. field orders below mirror the client's parsers; the class that reads each message is named next to it.

- 2346 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/achievements.js`](#lib-achievements-js), [`lib/adopt.js`](#lib-adopt-js), [`lib/colours.js`](#lib-colours-js), [`lib/customitems.js`](#lib-customitems-js), [`lib/roles.js`](#lib-roles-js), [`lib/modlog.js`](#lib-modlog-js), [`lib/playeritems.js`](#lib-playeritems-js), [`lib/commands.js`](#lib-commands-js), [`lib/limits.js`](#lib-limits-js), [`lib/masterpieces.js`](#lib-masterpieces-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/avatars.js`](#lib-avatars-js), [`lib/badges.js`](#lib-badges-js), [`lib/bans.js`](#lib-bans-js), [`lib/devices.js`](#lib-devices-js), [`lib/chatlog.js`](#lib-chatlog-js), [`lib/chatfilter.js`](#lib-chatfilter-js), [`lib/chatspam.js`](#lib-chatspam-js), [`lib/buddies.js`](#lib-buddies-js), [`lib/dens.js`](#lib-dens-js), [`lib/contentshop.js`](#lib-contentshop-js), [`lib/disguises.js`](#lib-disguises-js), [`lib/tints.js`](#lib-tints-js), [`lib/ecards.js`](#lib-ecards-js), [`lib/epicdens.js`](#lib-epicdens-js), [`lib/items.js`](#lib-items-js), [`lib/journeybook.js`](#lib-journeybook-js), [`lib/minigames.js`](#lib-minigames-js), [`lib/adventures.js`](#lib-adventures-js), [`lib/moderation.js`](#lib-moderation-js), [`lib/parties.js`](#lib-parties-js), [`lib/pets.js`](#lib-pets-js), [`lib/reports.js`](#lib-reports-js), [`lib/roominfo.js`](#lib-roominfo-js), [`lib/shopstock.js`](#lib-shopstock-js), [`lib/signup.js`](#lib-signup-js), [`lib/trades.js`](#lib-trades-js), [`lib/stubs.js`](#lib-stubs-js), [`lib/walls.js`](#lib-walls-js), [`lib/worlditems.js`](#lib-worlditems-js), [`lib/stats.js`](#lib-stats-js), [`lib/theatre.js`](#lib-theatre-js), [`lib/player.js`](#lib-player-js)
- **Used by** [`server.js`](#server-js), [`lib/commands.js`](#lib-commands-js), [`lib/discordbot.js`](#lib-discordbot-js), [`lib/erase.js`](#lib-erase-js), [`lib/staff.js`](#lib-staff-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/panel.js`](#lib-panel-js), [`lib/admin.js`](#lib-admin-js), [`lib/manage.js`](#lib-manage-js), [`lib/http.js`](#lib-http-js)
- **Def packs** 1000 (items), 1030 (den items), 1040 (den types), 1046 (pets), 1049 (name tag badges), 1051 (currency exchange), 1054 (diamond shop), 1060 (combined lists), 1062 (pet food), 1063 (pet toys)

### lib/http.js

**The web server: the launcher's and the client's web services, the game's files, the pages and every dashboard route.**

stands in for every web service the launcher and the SWF talk to: www (flashvars), authenticator, player-session-data, ajelectronapi, the game host page and the content CDN.

- 1518 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/customitems.js`](#lib-customitems-js), [`lib/contentpacks.js`](#lib-contentpacks-js), [`lib/itemart.js`](#lib-itemart-js), [`lib/emoji.js`](#lib-emoji-js), [`lib/modlog.js`](#lib-modlog-js), [`lib/roles.js`](#lib-roles-js), [`lib/admin.js`](#lib-admin-js), [`lib/bans.js`](#lib-bans-js), [`lib/captcha.js`](#lib-captcha-js), [`lib/cdn.js`](#lib-cdn-js), [`lib/devices.js`](#lib-devices-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/limits.js`](#lib-limits-js), [`lib/manage.js`](#lib-manage-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/discordbot.js`](#lib-discordbot-js), [`lib/badges.js`](#lib-badges-js), [`lib/extramusic.js`](#lib-extramusic-js), [`lib/custommusic.js`](#lib-custommusic-js), [`lib/theatrevideos.js`](#lib-theatrevideos-js), [`lib/announcemedia.js`](#lib-announcemedia-js), [`lib/itemcontrol.js`](#lib-itemcontrol-js), [`lib/masterpieces.js`](#lib-masterpieces-js), [`lib/denprefabs.js`](#lib-denprefabs-js), [`lib/panel.js`](#lib-panel-js), [`lib/totp.js`](#lib-totp-js), [`lib/world.js`](#lib-world-js), [`lib/sfs.js`](#lib-sfs-js), [`lib/websocket.js`](#lib-websocket-js), [`lib/playeritems.js`](#lib-playeritems-js)
- **Used by** [`server.js`](#server-js)
- **Game files** `audio/`, `assets/`
- **Data** `data/rules.txt`

### lib/commands.js

**The "!something" chat commands.**

things players can do by typing "!something" in the chat box, for what the game has no window for. none of them touches another player: they look things up, or change the typist's own outfit, den or settings. what a command has to say comes up in a plain message box of the game's ("xtl", shown by the patched client), not as a note from Animal Jam HQ.

the chat box only lets through letters, digits, spaces and !'.,():?- so that is all a command or a name given to one can be made of.

- 1125 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/chatlog.js`](#lib-chatlog-js), [`lib/customitems.js`](#lib-customitems-js), [`lib/itemcontrol.js`](#lib-itemcontrol-js), [`lib/wearrules.js`](#lib-wearrules-js), [`lib/modnotes.js`](#lib-modnotes-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/disguises.js`](#lib-disguises-js), [`lib/dens.js`](#lib-dens-js), [`lib/moderation.js`](#lib-moderation-js), [`lib/modlog.js`](#lib-modlog-js), [`lib/roles.js`](#lib-roles-js), [`lib/limits.js`](#lib-limits-js), [`lib/player.js`](#lib-player-js), [`lib/world.js`](#lib-world-js)
- **Used by** [`lib/world.js`](#lib-world-js)

### lib/stubs.js

**Empty answers for features this server does not have, so the client does not wait forever.**

features this server does not have, answered with the "nothing here" reply each one's client code expects, so that the client carries on instead of waiting on a spinner. each entry names the client method that reads it.

- 13 lines
- **Used by** [`lib/world.js`](#lib-world-js)

### lib/limits.js

**Rate limits, and who a request is from.**

small in-memory rate limits for the parts of the server that strangers can reach: logins, sign-ups, error reports and the game socket; and who a web request is from.

- 138 lines
- **Used by** [`lib/bans.js`](#lib-bans-js), [`lib/buddies.js`](#lib-buddies-js), [`lib/captcha.js`](#lib-captcha-js), [`lib/commands.js`](#lib-commands-js), [`lib/ecards.js`](#lib-ecards-js), [`lib/minigames.js`](#lib-minigames-js), [`lib/playeritems.js`](#lib-playeritems-js), [`lib/reports.js`](#lib-reports-js), [`lib/sfs.js`](#lib-sfs-js), [`lib/signup.js`](#lib-signup-js), [`lib/staff.js`](#lib-staff-js), [`lib/walls.js`](#lib-walls-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/masterpieces.js`](#lib-masterpieces-js), [`lib/panel.js`](#lib-panel-js), [`lib/dens.js`](#lib-dens-js), [`lib/admin.js`](#lib-admin-js), [`lib/contentshop.js`](#lib-contentshop-js), [`lib/manage.js`](#lib-manage-js), [`lib/http.js`](#lib-http-js), [`lib/items.js`](#lib-items-js), [`lib/world.js`](#lib-world-js), [`lib/customitems.js`](#lib-customitems-js)

### lib/log.js

**Keeps the server's recent log lines for the owner dashboard.**

keeps the most recent lines the server printed, for the admin panel's log view. requiring this module is what starts the capture.

- 37 lines
- **Used by** [`server.js`](#server-js), [`lib/panel.js`](#lib-panel-js)

### lib/logtext.js

**Makes outside text safe to put in the log.**

a value from outside (a username, an address, what a client sent) as it may go into a line of the server's log: on one line, and with no control characters, so that it cannot pass for a line of the server's own (a name with a line break in it, "...\n[admin] signed in") or move the terminal's cursor about. (U+2028 and U+2029, which end a line too, are in the second.)

- 18 lines
- **Used by** [`lib/adventures.js`](#lib-adventures-js), [`lib/bans.js`](#lib-bans-js), [`lib/captcha.js`](#lib-captcha-js), [`lib/cdn.js`](#lib-cdn-js), [`lib/chatfilter.js`](#lib-chatfilter-js), [`lib/colours.js`](#lib-colours-js), [`lib/custommusic.js`](#lib-custommusic-js), [`lib/devices.js`](#lib-devices-js), [`lib/discord.js`](#lib-discord-js), [`lib/discordbot.js`](#lib-discordbot-js), [`lib/ecards.js`](#lib-ecards-js), [`lib/emoji.js`](#lib-emoji-js), [`lib/modlog.js`](#lib-modlog-js), [`lib/parties.js`](#lib-parties-js), [`lib/reports.js`](#lib-reports-js), [`lib/roominfo.js`](#lib-roominfo-js), [`lib/sfs.js`](#lib-sfs-js), [`lib/signup.js`](#lib-signup-js), [`lib/support.js`](#lib-support-js), [`lib/walls.js`](#lib-walls-js), [`lib/theatre.js`](#lib-theatre-js), [`lib/theatrevideos.js`](#lib-theatrevideos-js), [`lib/announcemedia.js`](#lib-announcemedia-js), [`lib/panel.js`](#lib-panel-js), [`lib/dens.js`](#lib-dens-js), [`lib/manage.js`](#lib-manage-js), [`lib/http.js`](#lib-http-js), [`lib/accounts.js`](#lib-accounts-js), [`lib/world.js`](#lib-world-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/customitems.js`](#lib-customitems-js), [`lib/contentmove.js`](#lib-contentmove-js), [`lib/contentpacks.js`](#lib-contentpacks-js)

### lib/stats.js

**Player counts and play time over time, for the dashboards' graphs.**

the game's numbers over time, for the graphs on the admin and moderator panels: how many were playing (a sample a minute, written as one row per five minutes with its average and its most), every login to the game, and every stretch of play when it ends. the logins and the stretches name the account, so they go after a year (as the privacy policy says of the records kept about players); the head-counts name nobody and stay.

- 210 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js)
- **Used by** [`server.js`](#server-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/panel.js`](#lib-panel-js), [`lib/world.js`](#lib-world-js)

### lib/retention.js

**Deletes old records about players, as the privacy policy says.**

how long the records about players are kept, as the privacy policy says (public/privacy.html): change one and change the other. run at start and once a day. chat has its own, shorter time (lib/chatlog.js), and sign-in histories are trimmed as they are written (lib/accounts.js).

- 53 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js)
- **Used by** [`server.js`](#server-js)
- **Data** `data/client-errors.log`

## The game's files

Reading the game's tables and files; see game-files.md.

### lib/cdn.js

**Fetches the game's files from the official CDN and keeps them in cache/; hashes file names.**

mirrors LoaderCache.hashItV2 in the client: the last path component of every versioned asset is obfuscated this way before it is requested.

- 205 lines
- **Used by** [`lib/badges.js`](#lib-badges-js), [`lib/custommusic.js`](#lib-custommusic-js), [`lib/extramusic.js`](#lib-extramusic-js), [`lib/roominfo.js`](#lib-roominfo-js), [`lib/gamefiles.js`](#lib-gamefiles-js), [`lib/http.js`](#lib-http-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/customitems.js`](#lib-customitems-js), [`lib/contentpacks.js`](#lib-contentpacks-js)
- **Game files** `defPacks/`

### lib/amf3.js

**Reads and writes AMF3, the format of def packs and room files.**

minimal AMF3 reader, enough for the game's defPacks (objects, arrays, strings and numbers).

- 338 lines
- **Used by** [`lib/extramusic.js`](#lib-extramusic-js), [`lib/roominfo.js`](#lib-roominfo-js), [`lib/gamefiles.js`](#lib-gamefiles-js), [`lib/defpacks.js`](#lib-defpacks-js)

### lib/defpacks.js

**Loads the def packs (the game's tables) and serves changed copies of them to clients.**

- 704 lines
- **Uses** [`lib/amf3.js`](#lib-amf3-js), [`lib/cdn.js`](#lib-cdn-js), [`lib/sales.js`](#lib-sales-js), [`lib/badges.js`](#lib-badges-js), [`lib/extramusic.js`](#lib-extramusic-js), [`lib/wearrules.js`](#lib-wearrules-js)
- **Used by** [`server.js`](#server-js), [`lib/achievements.js`](#lib-achievements-js), [`lib/adopt.js`](#lib-adopt-js), [`lib/commands.js`](#lib-commands-js), [`lib/disguises.js`](#lib-disguises-js), [`lib/ecards.js`](#lib-ecards-js), [`lib/epicdens.js`](#lib-epicdens-js), [`lib/itemcontrol.js`](#lib-itemcontrol-js), [`lib/minigames.js`](#lib-minigames-js), [`lib/parties.js`](#lib-parties-js), [`lib/pets.js`](#lib-pets-js), [`lib/roominfo.js`](#lib-roominfo-js), [`lib/shopstock.js`](#lib-shopstock-js), [`lib/trades.js`](#lib-trades-js), [`lib/worlditems.js`](#lib-worlditems-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/gamefiles.js`](#lib-gamefiles-js), [`lib/panel.js`](#lib-panel-js), [`lib/dens.js`](#lib-dens-js), [`lib/admin.js`](#lib-admin-js), [`lib/manage.js`](#lib-manage-js), [`lib/http.js`](#lib-http-js), [`lib/avatars.js`](#lib-avatars-js), [`lib/items.js`](#lib-items-js), [`lib/player.js`](#lib-player-js), [`lib/accounts.js`](#lib-accounts-js), [`lib/world.js`](#lib-world-js), [`lib/customitems.js`](#lib-customitems-js), [`lib/contentpacks.js`](#lib-contentpacks-js)
- **Def packs** 1000 (items), 1003 (animals), 1011 (rooms), 1025 (NPCs), 1030 (den items), 1036 (emoticons), 1038 (generic lists), 1040 (den types), 1042 (achievements), 1046 (pets), 1047 (parties), 1049 (name tag badges), 1051 (currency exchange), 1054 (diamond shop), 1057 (special animals), 1061 (Adopt-A-Pet), 1062 (pet food), 1063 (pet toys), 1064 (world items), 10230 (English text)
- **Game files** `defPacks/`

### lib/roominfo.js

**Reads room files for each room's name and the shops in it.**

what a room's own file says about it: its name ("Jam Mart Clothing"), which the client shows in the corner of the screen, and which shops stand in it. the room defPack has neither, and a shop's title is not in any defPack at all: the official server sent both along. the file is the same one the client loads to draw the room (roomDefs/<path>.xroom: zlib, then AMF3), so reading it here costs no extra download once anyone has been in the room.

- 103 lines
- **Uses** [`lib/amf3.js`](#lib-amf3-js), [`lib/cdn.js`](#lib-cdn-js), [`lib/defpacks.js`](#lib-defpacks-js)
- **Used by** [`server.js`](#server-js), [`lib/world.js`](#lib-world-js)
- **Game files** `roomDefs/`

### lib/gamefiles.js

**What every game file is: the owner dashboard's Game files page, and tools/check-references.js.**

what each of the game's files is: the owner dashboard's Game files page (lib/panel.js), and tools/check-references.js. the CDN names a file by a hash of its name ("media/1233" is "1830/media/<md5...>", lib/cdn.js), and the names are bare numbers: what a number is, the def packs say. a party's def names its room and its art, a den item's def its picture file, and so on. this reads every def pack and the server's own tables (lib/*.json) once, the first time it is asked, and keeps:

```
  entries   {kind, id, name, fields, files, links} for each thing the game
            has (a party, a den item, a shop list, ...). `files` are the
            files it is drawn or played from, `links` the other entries it
            names (a party's room, a shop's items).
  by file   each file's path ("media/1233") -> the entries that use it, so
            a hash or a path can be looked up the other way.
```

docs/game-files.md says what every folder of the CDN holds.

- 704 lines
- **Uses** [`lib/amf3.js`](#lib-amf3-js), [`lib/badges.js`](#lib-badges-js), [`lib/cdn.js`](#lib-cdn-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/extramusic.js`](#lib-extramusic-js), `lib/games.json`, `lib/journeybook.json`, `lib/ecard-art.json`, `lib/wall-art.json`, `lib/shop-stock.json`
- **Used by** [`lib/panel.js`](#lib-panel-js)
- **Game files** `media/`, `items/`, `defPacks/`, `imageArrays/`, `roomDefs/`, `audio/`, `streams/`, `subtitle/`, `factDefs/`

## Accounts and signing in

### lib/accounts.js

**The account database (SQLite): credentials, settings, and each account's state as JSON.**

accounts live in a SQLite database. identity and credentials are columns; everything a player owns (animals, items, pets, den, buddies, ...) is one JSON document per account in `state`.

every account is held in memory while the server runs. game code changes those objects directly and then calls save(account, ...), which has the accounts named written back a moment later, and the others looked at a few at a time (flush, below).

- 1052 lines
- **Uses** [`lib/defpacks.js`](#lib-defpacks-js), [`lib/names.js`](#lib-names-js)
- **Used by** [`server.js`](#server-js), [`lib/achievements.js`](#lib-achievements-js), [`lib/adopt.js`](#lib-adopt-js), [`lib/adventures.js`](#lib-adventures-js), [`lib/bans.js`](#lib-bans-js), [`lib/buddies.js`](#lib-buddies-js), [`lib/chatlog.js`](#lib-chatlog-js), [`lib/colours.js`](#lib-colours-js), [`lib/commands.js`](#lib-commands-js), [`lib/devices.js`](#lib-devices-js), [`lib/discord.js`](#lib-discord-js), [`lib/discordbot.js`](#lib-discordbot-js), [`lib/disguises.js`](#lib-disguises-js), [`lib/ecards.js`](#lib-ecards-js), [`lib/erase.js`](#lib-erase-js), [`lib/itemcontrol.js`](#lib-itemcontrol-js), [`lib/minigames.js`](#lib-minigames-js), [`lib/moderation.js`](#lib-moderation-js), [`lib/modlog.js`](#lib-modlog-js), [`lib/modnotes.js`](#lib-modnotes-js), [`lib/parties.js`](#lib-parties-js), [`lib/pets.js`](#lib-pets-js), [`lib/playeritems.js`](#lib-playeritems-js), [`lib/reports.js`](#lib-reports-js), [`lib/retention.js`](#lib-retention-js), [`lib/signup.js`](#lib-signup-js), [`lib/staff.js`](#lib-staff-js), [`lib/stats.js`](#lib-stats-js), [`lib/support.js`](#lib-support-js), [`lib/trades.js`](#lib-trades-js), [`lib/walls.js`](#lib-walls-js), [`lib/wearrules.js`](#lib-wearrules-js), [`lib/worlditems.js`](#lib-worlditems-js), [`lib/roles.js`](#lib-roles-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/tints.js`](#lib-tints-js), [`lib/creatorlimits.js`](#lib-creatorlimits-js), [`lib/masterpieces.js`](#lib-masterpieces-js), [`lib/panel.js`](#lib-panel-js), [`lib/dens.js`](#lib-dens-js), [`lib/admin.js`](#lib-admin-js), [`lib/contentshop.js`](#lib-contentshop-js), [`lib/manage.js`](#lib-manage-js), [`lib/http.js`](#lib-http-js), [`lib/avatars.js`](#lib-avatars-js), [`lib/items.js`](#lib-items-js), [`lib/world.js`](#lib-world-js), [`lib/denprefabs.js`](#lib-denprefabs-js), [`lib/customitems.js`](#lib-customitems-js), [`lib/contentmove.js`](#lib-contentmove-js), [`lib/contentpacks.js`](#lib-contentpacks-js)
- **Data** `data/backups`

### lib/signup.js

**The client's Create Account screens.**

the client's own "Create Account" screens (createAccountFlow.CreateAccount). they log in to a guest zone with no credentials, check the chosen names with "la" and create the account with "lc".

- 123 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/bans.js`](#lib-bans-js), [`lib/limits.js`](#lib-limits-js), [`lib/player.js`](#lib-player-js)
- **Used by** [`lib/world.js`](#lib-world-js)

### lib/manage.js

**The account page (/account): a player's own settings, password, 2FA, data export, deletion.**

the account page at /account: what a player can do about their own account from a browser. they sign in with the game's username and password; that sets a cookie only this page's requests send back (HttpOnly, SameSite=Strict, Path=/account). sessions live in memory, so restarting the server signs everyone out of the page (not out of the game).

A locked account can still sign in here: this is where it is unlocked.

A banned account, or anyone signing in from a banned address, gets another page altogether: what the ban is and why, one appeal, and the way out (signing out, or deleting the account). the password and two-step sign-in stay within reach, in case the account is in other hands. nothing else of the account is sent or may be changed until the ban is over.

- 790 lines
- **Uses** [`lib/customitems.js`](#lib-customitems-js), [`lib/itemcontrol.js`](#lib-itemcontrol-js), [`lib/playeritems.js`](#lib-playeritems-js), [`lib/accounts.js`](#lib-accounts-js), [`lib/limits.js`](#lib-limits-js), [`lib/achievements.js`](#lib-achievements-js), [`lib/badges.js`](#lib-badges-js), [`lib/discord.js`](#lib-discord-js), [`lib/bans.js`](#lib-bans-js), [`lib/captcha.js`](#lib-captcha-js), [`lib/chatlog.js`](#lib-chatlog-js), [`lib/chatfilter.js`](#lib-chatfilter-js), [`lib/erase.js`](#lib-erase-js), [`lib/masterpieces.js`](#lib-masterpieces-js), [`lib/creatorlimits.js`](#lib-creatorlimits-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/support.js`](#lib-support-js), [`lib/totp.js`](#lib-totp-js), [`lib/recoverymail.js`](#lib-recoverymail-js), [`lib/world.js`](#lib-world-js), [`lib/devices.js`](#lib-devices-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/itemart.js`](#lib-itemart-js)
- **Used by** [`lib/staff.js`](#lib-staff-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/panel.js`](#lib-panel-js), [`lib/http.js`](#lib-http-js)

### lib/totp.js

**Two-step sign-in codes (authenticator apps).**

two-step sign-in: a six-digit code from an authenticator app, asked for after the password by the client's sign-in (lib/http.js) and the account page's (lib/manage.js). A player turns it on and off on the account page. time-based one-time passwords as every authenticator app makes them (RFC 6238: HMAC-SHA1, six digits, a new one every 30 seconds).

on an account:

```
  totp         null, or {secret (base32), since, lastStep, recovery: [SHA-256
               of a code, ...]} once it is on. lastStep is the time step of
               the last code taken: a code works once.
  totpSetup    {secret, at} while it is being turned on: the secret was
               shown and no code from it has been given yet.
  devices      [{hash, at, via}]: devices that need not give a code for
               DEVICE_DAYS after one sign-in with a code. each holds a
               random token; only its hash is kept here.
```

A recovery code stands in for a code from the app, once: for a player whose phone is gone. they are shown when two-step sign-in is turned on and never again. the admin can turn it off for an account from the panel.

the secret has to be kept as it is, since every code is worked out from it: whoever can read the database can make codes. it never leaves the server after it was shown at setup.

- 205 lines
- **Used by** [`lib/roles.js`](#lib-roles-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/panel.js`](#lib-panel-js), [`lib/manage.js`](#lib-manage-js), [`lib/http.js`](#lib-http-js)

### lib/captcha.js

**Cloudflare Turnstile before passwords and sign-ups, when it is set up.**

cloudflare turnstile, with AJ_TURNSTILE_SITE_KEY and AJ_TURNSTILE_SECRET set: a captcha before every password tried (the client's login, the account page, the moderator panel) and every account made (the sign-up page, the client). a saved sign-in is not asked. the page shows the widget (public/captcha.js) and sends its answer as `captcha`; the answer is checked here with cloudflare, and is good for one request.

a sign-in that passed the captcha and then wants a 2FA code, and a sign-up the client signs in with straight after, get a pass: good for that account from that address for a few minutes, so the second request is not asked again.

- 125 lines
- **Uses** [`lib/limits.js`](#lib-limits-js)
- **Used by** [`lib/modpanel.js`](#lib-modpanel-js), [`lib/admin.js`](#lib-admin-js), [`lib/manage.js`](#lib-manage-js), [`lib/http.js`](#lib-http-js)

### lib/devices.js

**The computers players sign in from: alts and device bans.**

the computers players sign in from, for telling alts apart and keeping a banned player's computer out (the "device ban" of the panels).

the client (1.3.0 and on) sends, with every sign-in, hashes of what it can read about the computer: the system's own id (MachineGuid on Windows, IOPlatformUUID on macOS, /etc/machine-id on Linux), the board's id or serial, the disks' serials, the network cards' addresses, and an id of its own it keeps in two or three places. none of them is sent as it is: each is SHA-256 of "burrow-device:<kind>:<value>", and here that is keyed again with a secret of this server's (data/device-key), so what is kept is of no use anywhere else.

any one of them is a match: someone who edits /etc/machine-id or deletes MachineGuid still has the same disks and the client's own id. the network card's address alone (MAC_KIND) is a weak match: it is easily changed and sometimes shared, so it bans nothing; it is written down for the moderators instead. values every cheap board or VM has ("To be filled by O.E.M.", all zeros) are left out here, so that no ban falls on everyone who has one. what the client noticed was wrong (the system id missing, or not shaped as it always is) comes as notes, and is written down too.

the client is open source, so a player who builds their own can send anything; this keeps out the usual ban evader (a VPN, a new account), not a determined one. the moderators see the alerts and decide.

- 429 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js)
- **Used by** [`server.js`](#server-js), [`lib/erase.js`](#lib-erase-js), [`lib/staff.js`](#lib-staff-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/panel.js`](#lib-panel-js), [`lib/admin.js`](#lib-admin-js), [`lib/manage.js`](#lib-manage-js), [`lib/http.js`](#lib-http-js), [`lib/world.js`](#lib-world-js)
- **Data** `data/device-key`

### lib/names.js

**Which usernames are refused.**

which usernames a player may not choose (sign-up, and a request for a new name): the ones that would pass for whoever runs the game, and slurs. deliberately loose. A name is refused for BEING such a word, or having one as one of its words; a name that merely contains one is let through, and whoever runs the server deals with the odd one by hand (rename, in the admin panel). the lists are files, read again when they change:

```
  lib/reserved-names.txt       staff-like names
  public/filter/level1.txt     the chat filter's first level: slurs, threats
  lib/sexual-names.txt         sexual words, refused anywhere in a name
                               (bar the short ones marked "=", see the file)
```

and the names of the Epic Dens, which are how a showcase den is asked for.

- 96 lines
- **Uses** [`lib/epicdens.js`](#lib-epicdens-js)
- **Used by** [`lib/playeritems.js`](#lib-playeritems-js), [`lib/accounts.js`](#lib-accounts-js)

### lib/discord.js

**Linking a Discord account; the Server Booster badge; Discord sign-in to the dashboards.**

a player's Discord account, linked on the account page by signing in to Discord (OAuth2, scope "identify"): the only way a Discord username gets onto a player's card, so the name shown is theirs. one Discord account for one Dusklight account, or a single boost would badge a player's every account.

the Discord Server Booster badge follows the linked account: given while it boosts Dusklight's Discord server, taken off when it stops, checked when the account is linked and again every RECHECK_HOURS. Dusklight's bot asks Discord (GET /guilds/<id>/members/<user id>, which needs no privileged intent: the bot only has to be in the server). an account that is not linked keeps whatever badges the admin gave it.

with AJ_DISCORD_CLIENT_ID and AJ_DISCORD_CLIENT_SECRET unset, linking is off; without AJ_DISCORD_BOT_TOKEN and AJ_DISCORD_GUILD_ID, the booster badge is left alone.

- 296 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/badges.js`](#lib-badges-js)
- **Used by** [`server.js`](#server-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/panel.js`](#lib-panel-js), [`lib/manage.js`](#lib-manage-js)

### lib/recoverymail.js

**Sends account recovery mail through an outside service, when one is set up.**

- 22 lines
- **Used by** [`lib/manage.js`](#lib-manage-js)

### lib/invitehook.js

**Hands invite codes to an outside bot, when one is set up.**

optional link to an outside service (the FireFly-bot) that gives invite codes out. with AJ_INVITE_HOOK_URL / AJ_INVITE_HOOK_TOKEN unset, none of this does anything. a failure here never stops codes being made.

- 37 lines
- **Used by** [`lib/panel.js`](#lib-panel-js)

### lib/erase.js

**Deletes an account and everything kept about it.**

an account deleted for good, by its owner (lib/manage.js) or by the admin (lib/panel.js), and what was kept about it elsewhere with it: its chat lines, its appeal, its feedback and username requests, the computers it was used from (lib/devices.js), its den prefabs, and the paintings it made (from whoever holds one by now). what stays is said in the privacy policy (public/privacy.html): the record of bans and of what moderators did, under the name it had, until lib/retention.js ends it. the caller has taken the account out of the world and its pages.

- 31 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/bans.js`](#lib-bans-js), [`lib/chatlog.js`](#lib-chatlog-js), [`lib/denprefabs.js`](#lib-denprefabs-js), [`lib/devices.js`](#lib-devices-js), [`lib/masterpieces.js`](#lib-masterpieces-js), [`lib/support.js`](#lib-support-js), [`lib/world.js`](#lib-world-js)
- **Used by** [`lib/panel.js`](#lib-panel-js), [`lib/manage.js`](#lib-manage-js)

## A player's things

### lib/player.js

**Helpers over an account's animals, pets and items.**

shops send a diamond def id instead of the item's own def id when the item is priced in diamonds. resolves either form to {defId, cost, currencyType}, with `ownPrice(defId)` giving {cost, currencyType} for an ordinary item; null when the diamond def does not exist or is not of the expected kind.

- 157 lines
- **Uses** [`lib/defpacks.js`](#lib-defpacks-js), [`lib/wearrules.js`](#lib-wearrules-js)
- **Used by** [`lib/adventures.js`](#lib-adventures-js), [`lib/buddies.js`](#lib-buddies-js), [`lib/commands.js`](#lib-commands-js), [`lib/ecards.js`](#lib-ecards-js), [`lib/minigames.js`](#lib-minigames-js), [`lib/moderation.js`](#lib-moderation-js), [`lib/parties.js`](#lib-parties-js), [`lib/pets.js`](#lib-pets-js), [`lib/playeritems.js`](#lib-playeritems-js), [`lib/shopstock.js`](#lib-shopstock-js), [`lib/signup.js`](#lib-signup-js), [`lib/trades.js`](#lib-trades-js), [`lib/walls.js`](#lib-walls-js), [`lib/worlditems.js`](#lib-worlditems-js), [`lib/panel.js`](#lib-panel-js), [`lib/dens.js`](#lib-dens-js), [`lib/admin.js`](#lib-admin-js), [`lib/contentshop.js`](#lib-contentshop-js), [`lib/avatars.js`](#lib-avatars-js), [`lib/items.js`](#lib-items-js), [`lib/world.js`](#lib-world-js)

### lib/avatars.js

**Owning several animals and switching between them.**

owning several animals (client side: AvatarSwitch, AvatarXtCommManager). new animals are free.

- 153 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/colours.js`](#lib-colours-js), [`lib/badges.js`](#lib-badges-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/player.js`](#lib-player-js)
- **Used by** [`lib/world.js`](#lib-world-js)

### lib/items.js

**Clothing: buying, wearing, recycling.**

clothing: buying, wearing and recycling (client side: ItemXtCommManager).

- 223 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/achievements.js`](#lib-achievements-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/limits.js`](#lib-limits-js), [`lib/wearrules.js`](#lib-wearrules-js), [`lib/player.js`](#lib-player-js)
- **Used by** [`lib/world.js`](#lib-world-js)
- **Def packs** 1000 (items), 1051 (currency exchange), 1054 (diamond shop), 1060 (combined lists)

### lib/dens.js

**Den items and dens: owning, placing, recycling, den types.**

den items: owning, placing and recycling furniture (client side: DenXtCommManager, DenItemHolder, DenEditor).

- 804 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/achievements.js`](#lib-achievements-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/wearrules.js`](#lib-wearrules-js), [`lib/epicdens.js`](#lib-epicdens-js), [`lib/masterpieces.js`](#lib-masterpieces-js), [`lib/denprefabs.js`](#lib-denprefabs-js), [`lib/limits.js`](#lib-limits-js), [`lib/player.js`](#lib-player-js)
- **Used by** [`lib/adventures.js`](#lib-adventures-js), [`lib/commands.js`](#lib-commands-js), [`lib/ecards.js`](#lib-ecards-js), [`lib/minigames.js`](#lib-minigames-js), [`lib/moderation.js`](#lib-moderation-js), [`lib/playeritems.js`](#lib-playeritems-js), [`lib/worlditems.js`](#lib-worlditems-js), [`lib/journeybook.js`](#lib-journeybook-js), [`lib/admin.js`](#lib-admin-js), [`lib/contentshop.js`](#lib-contentshop-js), [`lib/world.js`](#lib-world-js)
- **Def packs** 1040 (den types)

### lib/pets.js

**Pets.**

pets (client side: PetManager, PetXtCommManager). A pet's species and look are packed into three integers by PetManager.packPetBits; the species is the low byte of the first. pets are free.

- 275 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/achievements.js`](#lib-achievements-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/player.js`](#lib-player-js)
- **Used by** [`lib/world.js`](#lib-world-js)
- **Def packs** 1062 (pet food), 1063 (pet toys)

### lib/adopt.js

**The Adopt-A-Pet checklist.**

the Adopt-A-Pet checklist (client side: AdoptAPetManager, CheckListPopup): the collectable toy pets a player has "found". the real game handed them out through codes packed with the toys. here every day's first login finds one the player does not have yet, and the admin panel can give any.

account.adoptAPets holds {inv, def, ts, seen}.

- 67 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/achievements.js`](#lib-achievements-js), [`lib/defpacks.js`](#lib-defpacks-js)
- **Used by** [`lib/panel.js`](#lib-panel-js), [`lib/world.js`](#lib-world-js)

### lib/trades.js

**Trading between players.**

trading (client side: TradeXtCommManager, TradeManager). A player keeps a trade list of items on offer. someone else asks for one of them, offering items of their own; the owner accepts or declines; then both confirm and the items change hands.

- 439 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/masterpieces.js`](#lib-masterpieces-js), [`lib/player.js`](#lib-player-js)
- **Used by** [`lib/world.js`](#lib-world-js)

### lib/worlditems.js

**Gifts lying about in the lands.**

gifts lying about in the lands (client side: WorldItemsManager): a room has up to three spots, a world-item def says which spot it sits in, what it gives and which bit of a user var records that the player took it. the real game put a few out at a time. here each spot shows the first gift the player has not taken yet, so all of them come round in turn.

- 76 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/achievements.js`](#lib-achievements-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/dens.js`](#lib-dens-js), [`lib/player.js`](#lib-player-js)
- **Used by** [`lib/world.js`](#lib-world-js)

### lib/achievements.js

**Achievements and the user vars they count.**

achievements (client side: AchievementManager, AchievementXtCommManager). an achievement def names a user var and the value it has to reach. most user vars are counters the official servers kept ("gems earned", "buddies added"); the ones this server can count itself are kept here, and the rest are whatever the client last set them to (see "zs" in world.js).

A player's achievements are {inv, def} pairs in account.achievements. the client learns about a new one from the reply to a user var change.

- 168 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/defpacks.js`](#lib-defpacks-js)
- **Used by** [`lib/adopt.js`](#lib-adopt-js), [`lib/adventures.js`](#lib-adventures-js), [`lib/buddies.js`](#lib-buddies-js), [`lib/ecards.js`](#lib-ecards-js), [`lib/minigames.js`](#lib-minigames-js), [`lib/moderation.js`](#lib-moderation-js), [`lib/pets.js`](#lib-pets-js), [`lib/worlditems.js`](#lib-worlditems-js), [`lib/panel.js`](#lib-panel-js), [`lib/dens.js`](#lib-dens-js), [`lib/contentshop.js`](#lib-contentshop-js), [`lib/manage.js`](#lib-manage-js), [`lib/items.js`](#lib-items-js), [`lib/world.js`](#lib-world-js)

### lib/colours.js

**Custom colours beyond the game's palette.**

custom colours. the game stores a colour as four palette indexes packed in one number, which leaves no room for "any hex colour". so a number in a range no real colour uses (CUSTOM_BASE and up) is instead the id of an entry here: the four RGB values that layer is drawn with. the patched client keeps the same table (PaletteHelper.customColors); the server sends it at login and announces every new entry to everyone before anybody can receive a colour that uses it.

- 75 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js)
- **Used by** [`server.js`](#server-js), [`lib/panel.js`](#lib-panel-js), [`lib/avatars.js`](#lib-avatars-js), [`lib/world.js`](#lib-world-js)

### lib/wearrules.js

**Rules on which animals may wear which clothing.**

- 92 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js)
- **Used by** [`lib/commands.js`](#lib-commands-js), [`lib/itemcontrol.js`](#lib-itemcontrol-js), [`lib/dens.js`](#lib-dens-js), [`lib/items.js`](#lib-items-js), [`lib/player.js`](#lib-player-js), [`lib/defpacks.js`](#lib-defpacks-js)

### lib/badges.js

**Badges on player cards, name tag badges, bios.**

what a player's card shows about the account beyond the game's own: marks the admin gives in the panel, the player's Discord username and their bio, both of which they set themselves on the account page. all of it is for show: a badge gives no power over anything or anyone.

every badge is drawn on the player's card, after the username in the name bar (buddy.BuddyCard in the SWF), as public/badges/<id>.png; the card is told its id and label. the Discord username is drawn there too, last. ids and labels must stay free of "," "|" and "%", which separate them on the way to the client.

A badge with `tag` is a name tag badge as well: one more of the icons a player picks for their name tag in the animal editor, beside the game's own 62. it is a row added to the badge pack (defPack 1049) that clients get, with a picture of ours (swf/badges/<id>.swf, served as media `tag.media`) and an unlock flag: the editor only offers a badge whose `pendingFlagsBit` is set in the flags the login message carries (gui.AvatarEditor .onNamebarBadgeIdsLoaded), so it is offered to the accounts that hold it and to nobody else, from their next login. the server refuses a name tag that names one the account does not hold (lib/avatars.js). the def ids must follow the game's own without a gap: a name tag names its badge by its place in the list, and the editor takes that to be the def id less one. so a badge added later goes on the end and none is ever taken out.

tools/make-badges.py draws both pictures of a badge from one outline.

early Member is given by the server itself, to an account made while there are no more than a hundred (lib/accounts.js); the admin may give it and take it away like any other.

- 134 lines
- **Uses** [`lib/cdn.js`](#lib-cdn-js)
- **Used by** [`lib/discord.js`](#lib-discord-js), [`lib/gamefiles.js`](#lib-gamefiles-js), [`lib/panel.js`](#lib-panel-js), [`lib/manage.js`](#lib-manage-js), [`lib/http.js`](#lib-http-js), [`lib/avatars.js`](#lib-avatars-js), [`lib/world.js`](#lib-world-js), [`lib/defpacks.js`](#lib-defpacks-js)
- **Def packs** 1049 (name tag badges)
- **Game files** `media/`

### lib/tints.js

**The mud, ice, fire or acid tint staff put on a player's animal.**

a colour the admin puts on a player's animal, as the game's mud, ice, fire and acid put one on whoever stands in them (AvatarManager. processPlayerSplashColor). in the game it fades once they step out; one put on here stays until the admin takes it off.

the client tints its own animal and tells the room by a chat line of type 8, "<alpha << 24 | rgb>" (UserCommXtCommManager.sendAvatarBlendColor), which the others draw (AvatarManager._setAvatarBlendColor). a tinted player's client still works out its own colour as they walk in and out of the game's mud, and says so: the server answers each time with the tint, to them and everyone else, so it never fades. no change to the SWF.

- 58 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js)
- **Used by** [`lib/panel.js`](#lib-panel-js), [`lib/world.js`](#lib-world-js)

### lib/disguises.js

**Playing as one of the game's characters ("!become").**

playing as one of the game's characters ("!become liza").

the alphas were animals players could not be: in 2013 they were animal types of their own (2, 3, 9 to 12, since given to the eagle, deer, hyena, otter, polar bear and owl), and that artwork is gone. what is left of them is in the NPC table (defPack 1025): the clips the adventures put on the map, each a drawing that can stand, face left or right, talk, cast and so on, but not walk.

the client has one way to draw a player as something from that table: the Phantomizer den item, which swaps a player's animal for NPC 2, a phantom, that then follows it about (DenXtCommManager.denPhantomResponse, "dph": [ok, sfsUserId, on]). the patched client takes the NPC's id from one more field of that message (XtReplyDemuxer, avatar.NPCView in swf-src/). so a disguise is a "dph" that follows a player's animal wherever the client is told of the animal.

what does not work, by the nature of it: the clip glides, as it has no walk; the animal under it still does everything, unseen (sit, dance, clothes); and a client keeps the first disguise it drew for an animal until that animal is drawn afresh, so changing from one to another shows when the player next changes rooms.

- 79 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/defpacks.js`](#lib-defpacks-js)
- **Used by** [`lib/commands.js`](#lib-commands-js), [`lib/world.js`](#lib-world-js)
- **Def packs** 1025 (NPCs)

### lib/buddies.js

**Buddy lists and blocking.**

buddy lists and blocking (client side: BuddyXtCommManager, BuddyManager). buddies are mutual and stored on both accounts as lowercased usernames.

- 230 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/achievements.js`](#lib-achievements-js), [`lib/limits.js`](#lib-limits-js), [`lib/player.js`](#lib-player-js)
- **Used by** [`lib/world.js`](#lib-world-js)

## Shops, items and music

### lib/shopstock.js

**What each shop sells (from lib/shop-stock.json).**

what stands on each shop's shelves. no file of the game says: the official server sent a shop's list when it was opened. lib/shop-stock.json has it from the AJ Classic Wiki, per generic list (tools/shop-stock.py makes the file and says which shop was taken for which list, and where that was a guess): "now", what the wiki has on sale there, and "former", what was sold there once. A shop stocks all of the first, and of the second what is in its season today (lib/sales.js): a shop's seasonal things come back to it each year, and what left for good stays away.

- 104 lines
- **Uses** [`lib/defpacks.js`](#lib-defpacks-js), [`lib/sales.js`](#lib-sales-js), [`lib/player.js`](#lib-player-js), `lib/shop-stock.json`
- **Used by** [`lib/world.js`](#lib-world-js)
- **Def packs** 1000 (items), 1030 (den items), 1054 (diamond shop), 1060 (combined lists)

### lib/sales.js

**When items are on sale: their yearly windows (lib/sale-dates.json).**

when shop items are on sale. the client decides that by itself: a shop drops whatever its def's availabilityStartTime..availabilityEndTime does not cover today (GenericListXtCommManager.filterIitems), tags what started in the last ten days as new and counts down to the end. so the defs are what to change, and they are re-stamped here before a client gets them.

the official game rewrote an item's window each time the item came back, and lib/sale-dates.json has every window found in the builds the CDN still serves (tools/sale-history.js). here each window comes round again every year on the same dates: an item whose window, moved to this year, covers today is stamped with it; any other gets the next one coming, and stays hidden until then. items with no window in the file are left as their def has them.

- 104 lines
- **Uses** `lib/sale-dates.json`
- **Used by** [`lib/shopstock.js`](#lib-shopstock-js), [`lib/panel.js`](#lib-panel-js), [`lib/defpacks.js`](#lib-defpacks-js)

### lib/admin.js

**The item finder (/shop): any item, put straight into an account.**

backs the item finder page (/shop): look any item up by id or name and put it straight into an account, since in-game shops only stock a slice each.

- 384 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/bans.js`](#lib-bans-js), [`lib/captcha.js`](#lib-captcha-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/devices.js`](#lib-devices-js), [`lib/roles.js`](#lib-roles-js), [`lib/dens.js`](#lib-dens-js), [`lib/itemcontrol.js`](#lib-itemcontrol-js), [`lib/customitems.js`](#lib-customitems-js), [`lib/contentpacks.js`](#lib-contentpacks-js), [`lib/limits.js`](#lib-limits-js), [`lib/world.js`](#lib-world-js), [`lib/outfitcodes.js`](#lib-outfitcodes-js), [`lib/player.js`](#lib-player-js)
- **Used by** [`lib/modpanel.js`](#lib-modpanel-js), [`lib/http.js`](#lib-http-js)

### lib/customitems.js

**Items staff make while the server runs.**

items the staff make while the server runs, with no restart of the server or of anybody's game. each is an existing item's art (the clothing piece or den item it is made from) under an id, name, price and colours of its own. the server's tables and the packs new games fetch have it at once (defpacks.setCustomItem); games already playing are sent its def row ("xdi", which the patched client adds to its tables), and so is a game at login if its packs may be older than the item (sendAll).

an item can be taken out of the shop, renamed and repriced, or deleted: then it goes from every inventory too (lib/itemcontrol.js).

- 533 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/cdn.js`](#lib-cdn-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/contentpacks.js`](#lib-contentpacks-js), [`lib/itemids.js`](#lib-itemids-js), [`lib/limits.js`](#lib-limits-js)
- **Used by** [`server.js`](#server-js), [`lib/commands.js`](#lib-commands-js), [`lib/custommusic.js`](#lib-custommusic-js), [`lib/itemcontrol.js`](#lib-itemcontrol-js), [`lib/playeritems.js`](#lib-playeritems-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/itemart.js`](#lib-itemart-js), [`lib/admin.js`](#lib-admin-js), [`lib/manage.js`](#lib-manage-js), [`lib/http.js`](#lib-http-js), [`lib/world.js`](#lib-world-js)
- **Game files** `audio/`, `items/`

### lib/playeritems.js

**Items players make for themselves (the Item Maker).**

items players make for themselves (the patched client's Item Maker, in the settings menu): one of the game's clothing pieces or den items under a name of their own, as staff make them (lib/customitems.js), but free, never in a shop, and in the item finder for its maker only. the maker is given one at once; it can be worn, placed and traded like any other. a maker may delete their own; staff may delete anyone's (the moderator panel).

"xcm" from the client: ["info"], ["make", kind, baseId, name], ["rename", kind, id, name], ["look", kind, id, a look of lib/customitems.js LOOKS_BY_USE] (how one with a picture is worn) or ["delete", kind, id]. its picture is uploaded over HTTP (lib/itemart.js, POST /api/itemart). the answer is always "xcm" [ok 1 | 0, what to say, left today, left in all, the maker's items as JSON]

- 315 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/creatorlimits.js`](#lib-creatorlimits-js), [`lib/customitems.js`](#lib-customitems-js), [`lib/dens.js`](#lib-dens-js), [`lib/itemcontrol.js`](#lib-itemcontrol-js), [`lib/modlog.js`](#lib-modlog-js), [`lib/names.js`](#lib-names-js), [`lib/player.js`](#lib-player-js), [`lib/itemart.js`](#lib-itemart-js), [`lib/limits.js`](#lib-limits-js)
- **Used by** [`lib/modpanel.js`](#lib-modpanel-js), [`lib/panel.js`](#lib-panel-js), [`lib/manage.js`](#lib-manage-js), [`lib/http.js`](#lib-http-js), [`lib/world.js`](#lib-world-js)

### lib/itemcontrol.js

**Locking items, taking them from players, deleting custom items.**

what staff who make items (items.create: admins and developers) may do about who has them:

```
- lock an item out of the item finder (lib/admin.js): players no longer
  find it there or take it from it. staff who may lock still do, with the
  item marked locked. it stays wherever else it is (a shop, a trade).
- take an item from one player: every one of it they have.
- delete a custom item (lib/customitems.js): out of the game, and out of
  every inventory.
```

- 238 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/customitems.js`](#lib-customitems-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/wearrules.js`](#lib-wearrules-js), [`lib/itemart.js`](#lib-itemart-js)
- **Used by** [`lib/commands.js`](#lib-commands-js), [`lib/playeritems.js`](#lib-playeritems-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/admin.js`](#lib-admin-js), [`lib/manage.js`](#lib-manage-js), [`lib/http.js`](#lib-http-js)

### lib/itemart.js

**Custom items' own pictures.**

custom items' own pictures: uploaded by the item's maker (or staff), shown by the patched client in place of the item's icon, and for a den item in place of the item standing in a den (AJClient.customArtUrl). worn clothing keeps the art it was made from: that is drawn for every animal and pose, which one picture cannot be.

a picture is checked before it is kept: a PNG, a JPEG or a GIF by its own bytes (whatever it is called), of a sensible size, and kept without what else such files carry (a photo's EXIF, with where it was taken; PNG text; GIF comments). a BMP is made a PNG. (the pages and the game turn other kinds, and pictures too big, into a PNG before they send them.) kept as data/itemart/<kind>-<id>.<png|jpg|gif>; its version, a hash, is on the item (customItems.setArt), so a new picture is a new address.

- 422 lines
- **Uses** [`lib/customitems.js`](#lib-customitems-js), [`lib/image-moderation.js`](#lib-image-moderation-js)
- **Used by** [`lib/itemcontrol.js`](#lib-itemcontrol-js), [`lib/playeritems.js`](#lib-playeritems-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/manage.js`](#lib-manage-js), [`lib/http.js`](#lib-http-js)
- **Data** `data/itemart/<kind>-<id>.<png|jpg|gif>`

### lib/custommusic.js

**Music tracks staff upload, made den music items.**

music tracks staff upload in the panels (permission "music.upload", lib/roles.js): an MP3 made a den music item while the server runs, as the extra tracks of lib/extramusic.js are. each is a custom den item (lib/customitems.js) made from the game's "Jam On", with an `audio` version of its own: games are sent its def row at once, players get it from the item finder (or the shop, if staff put it on sale), and deleting it takes it from everyone, as with any custom item.

a den music item plays "audio/<abbrName>.mp3" from the content server (DenItemHolder); for these the server answers with the file uploaded, kept in data/custom-music/<item id>-<version>.mp3 (the data folder is the one place the server writes to).

- 191 lines
- **Uses** [`lib/cdn.js`](#lib-cdn-js), [`lib/customitems.js`](#lib-customitems-js), [`lib/extramusic.js`](#lib-extramusic-js)
- **Used by** [`server.js`](#server-js), [`lib/http.js`](#lib-http-js)
- **Game files** `audio/`
- **Data** `data/custom-music/<item`

### lib/extramusic.js

**Sounds from the game's files made into den music items.**

extra den music: sounds found in the game's files that nothing plays, or that only one room plays, made into music den items (see "Odd audio" in DISCOVERIES.md). they are not in any shop; the item finder and the admin panel's gifts give them by id.

A music den item plays "audio/<its abbrName>.mp3" from the content server (DenItemHolder), and the CDN has no such files for these. each one's sound sits inside a media file or a room file as an MP3 (a DefineSound tag of a zlib-compressed SWF), so the file is cut out of there when a client first asks for it. nothing of it is kept in this repository, except the tracks that are files of their own (`mp3`, in public/music/).

- 175 lines
- **Uses** [`lib/amf3.js`](#lib-amf3-js), [`lib/cdn.js`](#lib-cdn-js)
- **Used by** [`lib/custommusic.js`](#lib-custommusic-js), [`lib/gamefiles.js`](#lib-gamefiles-js), [`lib/http.js`](#lib-http-js), [`lib/defpacks.js`](#lib-defpacks-js)
- **Game files** `audio/`, `media/`, `roomDefs/`

## Places and events

### lib/parties.js

**The game's parties, and parties players host.**

parties (client side: PartyManager, PartyPopup, CustomPartyCreatePopup).

"AJ parties" are the game's own party rooms. the real game opened a few at a time on a timetable; here every one whose room exists is open all the time. A party room is called "party<defId>".

"Jammer parties" are hosted by players: pick one of the party rooms made for it, a three-word name and the music, pay a diamond, and the party is listed for everyone until it ends. its room is "pparty<host username>", which is how the client tells whose party it is in.

- 280 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/epicdens.js`](#lib-epicdens-js), [`lib/masterpieces.js`](#lib-masterpieces-js), [`lib/player.js`](#lib-player-js)
- **Used by** [`lib/world.js`](#lib-world-js)

### lib/epicdens.js

**The Epic Dens list: the showcase dens.**

Epic Dens: the world map's list of dens worth a visit (client side: VolumeSelector, DenXtCommManager.requestDenHighest).

the official list named players, and its "AJHQ" button led to a showcase den Animal Jam HQ had furnished, a new one every so often, held as party 36. those showcase dens are still on the CDN, 53 of them, each a whole room with its furniture in the file. here the list is the showcase dens: the client shows a name per row and asks to enter "den<that name>", which the server answers by putting the player in the room. the client draws twenty rows at most, so the list is a different twenty each day, and the AJHQ button goes to one more.

the files do not say what the dens were called. each is named after the den type it was built in, going by its file name.

- 65 lines
- **Uses** [`lib/defpacks.js`](#lib-defpacks-js)
- **Used by** [`lib/names.js`](#lib-names-js), [`lib/parties.js`](#lib-parties-js), [`lib/dens.js`](#lib-dens-js), [`lib/world.js`](#lib-world-js)

### lib/adventures.js

**Adventures: the engine around the hand-written scripts in lib/adventures/.**

adventures. the engine is in the client (quest/QuestManager): it places the actors named in the room file and plays them. what happens when was decided by scripts on the official server, which no file holds, so each adventure here is a script written by hand from a recording of the official game (tools/recorder.js): lib/adventures/<name>.js says what to send when the player triggers an actor, answers one, and so on.

one player to an adventure, each in rooms of their own.

- 358 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/achievements.js`](#lib-achievements-js), [`lib/dens.js`](#lib-dens-js), [`lib/player.js`](#lib-player-js), [`lib/adventures/training-grounds.js`](#lib-adventures-training-grounds-js), [`lib/adventures/return-of-the-phantoms.js`](#lib-adventures-return-of-the-phantoms-js)
- **Used by** [`lib/world.js`](#lib-world-js)

### lib/adventures/training-grounds.js

**The script of the Training Grounds adventure.**

the Training Grounds ("Adventure Tutorial", script def 15), written from a recording of the official game of 2026-10-12: one player, who talked to Liza four times, fed the four phantoms to the plants, crept past the rest unseen and opened the chest. everything sent here was seen sent there, in this order. not in the recording, so not here: being caught by a phantom.

commands ("qcmd"): 1 sets an actor's [state, visible, needs a click]; 3 has it talk (a string id); 38 is the line under the screen's top; 19 ends the adventure. "qswfs" plays a state of an actor's artwork.

- 199 lines
- **Used by** [`lib/adventures.js`](#lib-adventures-js)

### lib/adventures/return-of-the-phantoms.js

**The script of the Return of the Phantoms adventure.**

return of the Phantoms (script def 14), normal mode, written from a recording of the official game of 2026-10-12: one player, who plugged the four pipes, watered the eight plants, fetched the key from the burrow, freed the four bunnies and took a prize; was zapped down once, fed four phantoms to the plants and opened two chests. what was sent there is sent here. marked "guessed" below is what that run did not do.

commands ("qcmd"): 1 sets an actor's [state, visible, needs a click], and state 99 takes it out of the adventure (all that belongs to hard mode goes that way at the start); 2 has an actor say a string; 3 has it talk and wait for an answer; 7 takes what the player carries; 14 puts the player at a spawn point; 38 is the line under the top of the screen; 19 ends the adventure. "qcmdVT" sets a counter or a timer, "qsp" a phantom's path.

- 689 lines
- **Used by** [`lib/adventures.js`](#lib-adventures-js)

### lib/minigames.js

**Minigames: which game is which (lib/games.json), starting them, gem awards.**

minigames (client side: MinigameManager, MinigameXtCommManager and the game.* classes). the games themselves are compiled into the client; what the official server kept was the table saying which game def id is which game (the "game" defPack is gone from the CDN) and the session around a game: the room it runs in, the start signal, gem awards, and for some games a few messages of their own.

lib/games.json is that table, put back together from what still names the ids: arcade-machine den items (gameDefId and a name), the room files (which id stands where), the names GameCardPopup has for each game class, and the achievement defs (which user vars a game counts in). entries:

```
  id      game def id
  swf     the game's key in game.IncludeMinigames
  title   its name; sent as the id of the localization string that says so
  type    0 runs in a window over the room ("in-room"), 1 replaces the room
  vars    user vars: games played, and two the game uses as it likes
  pet     pet species the player must have out (the pet games)
  start   what the game waits for after it says "ready": see START
  ready   false: needs more from the server than is here yet; not playable
  tickets a carnival game: how many points of its score make one ticket
  icon    media id of its picture in the HUD's Games window; the games with
          one are the ones that window lists
  buddy   true: one of the eight games two players play from a player's
          card (lib/buddygames.js). their ids are ours: nothing in the
          client names them, and the official table is gone.
  card    a buddy game's picture, on the card's game tab and in the
          invitation
```

every other game is played alone (minPlayers = maxPlayers = 1): the multiplayer ones each have a protocol of their own between the players.

- 868 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/achievements.js`](#lib-achievements-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/buddygames.js`](#lib-buddygames-js), [`lib/masterpieces.js`](#lib-masterpieces-js), [`lib/dens.js`](#lib-dens-js), [`lib/limits.js`](#lib-limits-js), [`lib/player.js`](#lib-player-js), `lib/games.json`
- **Used by** [`lib/world.js`](#lib-world-js)

### lib/buddygames.js

**The eight two-player games played from a player card.**

the eight games two buddies play against each other from a player's card (client side: game.pVP_*). each has a protocol of its own, which the official server spoke and nothing else records; what is here was read off each game's `message` method and the code inside its scene file (the "theGame" layer of roomDefs/pvp_*/room_main).

half of them the server referees, since the clients only draw what they are told: Tic Tac Toe, Four Gems, Rock Paper Scissors, the Shell Game and Pairs. the other half run on both clients at once, each simulating the same thing from the same inputs, and the server only passes the inputs across and says when both are ready to go on: Bowling, Marbles, Scooped.

A game here is given `match`: {ids: [sfsUserId, sfsUserId] in the order of the start message, send(player, ...fields), broadcast(...fields), over()} and keeps what it likes on `match.state`. `player` is 0 or 1. every handler is entered with words that came from a client, so each checks what it is given; a message that makes no sense is dropped.

- 370 lines
- **Used by** [`lib/minigames.js`](#lib-minigames-js)

### lib/journeybook.js

**The Journey Book: its pages and facts (lib/journeybook.json).**

The Journey Book (the HUD's book button, GuiManager.openJourneyBook): a page for each land, each listing the facts found there, and a den item for finding them all. The official server answered two generic lists for it, which this rebuilds from the game's own files (lib/journeybook.json):

```
  53: the pages, as (page media id, the land's name string) pairs. the
      book opens at the page whose name is the room's (GuiManager.
      onJourneyBookMediaListReceived); with no pages at all it opened empty
      and could not be shut, and a party that opens it on entry (Call of
      the Alphas) left the player stuck.
  54: every fact, as (id, media, title, description, type, user var, bit)
      (GenericListXtCommManager.handleFactResponse, JBManager).
```

The pages, their names and their gifts were read from the page files themselves (each names its facts "jb_<id>" and its gifts "jb_gift_d_<den item>[_<part>]"); the facts from factDefs/<id>. A page has one part (a user var and a gift) a land; the "alpha" page (the Call of the Alphas party, media 6189) has three, one for each year's set of facts.

- 104 lines
- **Uses** [`lib/dens.js`](#lib-dens-js), `lib/journeybook.json`
- **Used by** [`lib/world.js`](#lib-world-js)

### lib/theatre.js

**What each theatre plays, and its queue.**

what each theatre plays, and what waits to play after it: kept by room name ("path.name#shard"), so it outlasts the room being empty (lib/world.js lets an empty room go) and someone walking in finds it where it is. staff run it in the game's theatre box (the "xtv" handler in lib/world.js) and on the moderator panel's Theatre page (lib/modpanel.js).

an entry is {kind: "file", id, name} (lib/theatrevideos.js) or {kind: "youtube", id, name}. a file goes on to the next entry when it is over; YouTube's length is not known here, so a YouTube video plays until staff skip it or stop it.

- 178 lines
- **Uses** [`lib/theatrevideos.js`](#lib-theatrevideos-js)
- **Used by** [`lib/modpanel.js`](#lib-modpanel-js), [`lib/world.js`](#lib-world-js)

### lib/theatrevideos.js

**Video files kept on this server for the theatre.**

video files kept on this server, for staff to play on the theatre's screen (the "xtv" handler in lib/world.js) in place of a YouTube link: they type the video's name in the game's theatre box. everyone in the room sees it from the same point, and whoever comes in later joins it where it is.

the files are data/theatre-videos/<name>.mp4 (or .webm): uploaded in the admin panel, or copied there on the machine (as the user the server runs as). the file's name, without its extension, is the video's name. each has an id made from its name, size and time, so the address it is served at (/theatre/<id>) changes whenever the file does.

subtitles: data/theatre-videos/<name>.vtt beside the video, served at /theatre/<id>.vtt and shown by the game page (public/game.html) with a CC button. they come out of the video itself when it has text subtitles (an MKV's or an MP4's own track, by ffmpeg: config.ffmpeg), or are added by hand (an .srt, .vtt or .ass/.ssa file, made WebVTT here). a <name>.srt copied into the folder is made the .vtt too. <name>.nosubs says the video was looked through and has none, so it is not looked through again. ffmpeg also makes an upload playable: an MKV with H.264 in becomes an MP4, and sound the game's player cannot play (AC-3, DTS...) becomes AAC.

- 729 lines
- **Used by** [`server.js`](#server-js), [`lib/theatre.js`](#lib-theatre-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/http.js`](#lib-http-js)
- **Data** `data/theatre-videos/<name>.mp4`, `data/theatre-videos/<name>.vtt`

### lib/masterpieces.js

**Paintings from the Art Studio, hung in dens.**

masterpieces: paintings from the Art Studio, framed and hung in a den (client side: game.artStudioPainting.ArtStudioPainting, the same in ArtStudioGridDrawing, masterpiece.MasterpieceDisplayItem, gui.MasterpiecePreview).

how one comes about, in the client's order:

```
  1. the game asks for an upload token over the game socket ("gmtkn").
  2. it posts the painting, a JPEG, with that token to the web server
     (the mdUrl flashvar + "mp") and is told the painting's id.
  3. it buys the Masterpiece den item (diamond def 221) naming that id
     and the frame picked, for two diamonds or a Masterpiece Token.
  4. the item is in the inventory but "not approved": the client will
     not place, trade or recycle it. whoever runs the server looks at it
     in the admin panel and approves or rejects it. (That review can be
     switched off there; paintings are then approved as they are bought.)
```

Everyone's client fetches a painting from "masterpieces/<id>" on the content server when it has to draw it.

A painting lives here, in a table of its own: who made it and where it stands. the picture is a file, data/masterpieces/<id>.jpg (the table's `image` column held it once, and is left empty now: pictures made the one file with every account in it many times its size). the den item made from it carries the painting's id (`image` on the den item, see lib/dens.js) and can change hands; the painting's maker stays who it was.

- 574 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/creatorlimits.js`](#lib-creatorlimits-js), [`lib/limits.js`](#lib-limits-js), [`lib/image-moderation.js`](#lib-image-moderation-js), [`lib/jpegprint.js`](#lib-jpegprint-js)
- **Used by** [`server.js`](#server-js), [`lib/erase.js`](#lib-erase-js), [`lib/minigames.js`](#lib-minigames-js), [`lib/parties.js`](#lib-parties-js), [`lib/trades.js`](#lib-trades-js), [`lib/walls.js`](#lib-walls-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/panel.js`](#lib-panel-js), [`lib/dens.js`](#lib-dens-js), [`lib/manage.js`](#lib-manage-js), [`lib/http.js`](#lib-http-js), [`lib/world.js`](#lib-world-js)
- **Data** `data/masterpieces/<id>.jpg`

### lib/jpegprint.js

**Fingerprints of paintings, to know one again.**

a picture's fingerprint, to know a masterpiece again when it comes back re-encoded (lib/masterpieces.js): the Art Studio paints a saved .ajart again a little differently, so the JPEG's bytes differ while every 8 by 8 block's average stays within a fraction of a step.

the fingerprint is the average of each block, per component, read from the JPEG's DC coefficients alone (no inverse DCT): a baseline JPEG (what the Art Studio writes) with no subsampling and no restart markers. any other JPEG has none, and only its exact bytes are known again.

layout: [width (uint16), height (uint16), components (uint8)], then a byte per block and component, block by block in rows.

- 213 lines
- **Used by** [`lib/masterpieces.js`](#lib-masterpieces-js)

### lib/walls.js

**Jammer Walls.**

Jammer Walls (client side: PlayerWallManager, PlayerWallGui, PlayerWallXtCommManager): a page per player where they and their visitors leave short messages, decorated by its owner.

the client does this in two parts. over the game socket it asks for a token for one player's wall ("wt"); with that token it then talks JSON over HTTP to the address in the playerWallHost flashvar (POST /wall here): CHK "has it changed?", GET, PUT a message, DEL one, and a few more.

A wall is account.wall: {privacy, posts, params, visits, hidden, modified, readAt}; a new account's empty one is made in lib/accounts.js.

- 378 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/chatfilter.js`](#lib-chatfilter-js), [`lib/chatlog.js`](#lib-chatlog-js), [`lib/masterpieces.js`](#lib-masterpieces-js), [`lib/limits.js`](#lib-limits-js), [`lib/player.js`](#lib-player-js), [`lib/moderation.js`](#lib-moderation-js)
- **Used by** [`lib/world.js`](#lib-world-js)

### lib/ecards.js

**Jam-A-Grams.**

Jam-A-Grams (client side: ECardManager, ECardInbox, ECardCreation, ECardXtCommManager): a card, a stamp, a short message and perhaps a gift, kept in the receiver's inbox (account.ecards) until they delete it.

which cards and stamps exist was a list on the official servers. the ones offered here were found by looking through the CDN's media files for card artwork (tools/find-art.py found what is in lib/ecard-art.json).

- 380 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/achievements.js`](#lib-achievements-js), [`lib/chatfilter.js`](#lib-chatfilter-js), [`lib/chatlog.js`](#lib-chatlog-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/dens.js`](#lib-dens-js), [`lib/limits.js`](#lib-limits-js), [`lib/moderation.js`](#lib-moderation-js), [`lib/player.js`](#lib-player-js)
- **Used by** [`lib/world.js`](#lib-world-js)

### lib/emoji.js

**Emoji pictures for chat.**

pictures of emoji, for the patched client's chat bubbles (gui.ChatBalloon): the game's font has none, so an emoji typed in chat (with Windows' emoji panel, say) is drawn as one of these. they are Twemoji's (CC-BY 4.0, jdecked/twemoji on GitHub), asked of config.emojiUpstream once each and kept in data/emoji. a name is the emoji's code points in hex, joined by "-", as Twemoji names its files ("1f600", "1f468-200d-1f469").

- 81 lines
- **Used by** [`lib/http.js`](#lib-http-js)
- **Data** `data/emoji`

## Chat and safety

### lib/chatfilter.js

**The server's own chat filter (lib/chat-filter.txt).**

the server's own filter for what players write to each other: typed chat, Jam-a-Gram messages, Jammer Wall posts and bios. unlike the chat filter in the client (the player's to set, or turn off), this one cannot be turned off, and what it catches reaches nobody. it is meant to be narrow: slurs, and sexual talk aimed at someone, never swearing as such ("fuck" is fine, "i'll fuck you in the ass" is not). the rules are lib/chat-filter.txt, read again when it changes; the file says how they are written.

- 176 lines
- **Used by** [`lib/ecards.js`](#lib-ecards-js), [`lib/walls.js`](#lib-walls-js), [`lib/manage.js`](#lib-manage-js), [`lib/world.js`](#lib-world-js)

### lib/chatspam.js

**Trims spam out of chat lines.**

typed chat made fit to read before anyone sees it (lib/world.js, pubMsg): not a filter of what is said (that is lib/chatfilter.js) but of how much of it there is. a key held down ("aaaaaaaaaa..."), a word said over and over, one long run of letters with no space, a line all in capitals, a wall of emoji: each is cut down, and the line still goes. the same line said again and again in a short while does not.

- 62 lines
- **Used by** [`lib/world.js`](#lib-world-js)

### lib/chatlog.js

**What players typed, kept for moderators.**

what players typed: chat in a room, whispers, Jam-a-Grams and posts on each other's Jammer Walls. kept for the moderator panel (lib/modpanel.js), which is where a moderator reads what was said before deciding anything; nothing else reads it. lines older than config.chatLogDays are deleted, and an account's lines go when the account is deleted. with chatLogDays 0 nothing is kept at all.

- 165 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js)
- **Used by** [`server.js`](#server-js), [`lib/commands.js`](#lib-commands-js), [`lib/ecards.js`](#lib-ecards-js), [`lib/erase.js`](#lib-erase-js), [`lib/walls.js`](#lib-walls-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/panel.js`](#lib-panel-js), [`lib/manage.js`](#lib-manage-js), [`lib/world.js`](#lib-world-js)

### lib/moderation.js

**Kick, ban, silence, clear a den.**

moderation: kick, ban, silence, clear a den, grant gems, message a player. these are done from the admin panel (lib/panel.js). no game account has them: the client's own moderator requests (FacilitatorXtCommManager) are always refused.

- 314 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/achievements.js`](#lib-achievements-js), [`lib/bans.js`](#lib-bans-js), [`lib/dens.js`](#lib-dens-js), [`lib/player.js`](#lib-player-js)
- **Used by** [`lib/commands.js`](#lib-commands-js), [`lib/ecards.js`](#lib-ecards-js), [`lib/walls.js`](#lib-walls-js), [`lib/world.js`](#lib-world-js)

### lib/reports.js

**Player reports.**

player reports (client side: ReportAPlayer, FacilitatorXtCommManager). A report is who, about whom, one of the game's fixed reasons, and what the reporter typed about it (the patched report window has a text box; the game's own had none). they wait in the admin panel's Reports page.

- 120 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/limits.js`](#lib-limits-js)
- **Used by** [`server.js`](#server-js), [`lib/discordbot.js`](#lib-discordbot-js), [`lib/staff.js`](#lib-staff-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/panel.js`](#lib-panel-js), [`lib/world.js`](#lib-world-js)

### lib/bans.js

**Address bans, appeals and the record of bans.**

what bans keep beside the account's own `bannedUntil`: banned addresses, each account's one appeal, and a record of every ban given and lifted.

an address ban is for good, and is of the address alone: the accounts that were used from it are not banned with it (a VPN's address is many people's). it keeps that address out of the game and out of signing up; the account page still opens there, where a player can ask about it or delete their account. this machine's own address cannot be banned, which is also the address of everyone when a proxy or a tunnel stands in front and the server has not been told (AJ_TRUSTED_PROXY).

- 201 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/limits.js`](#lib-limits-js)
- **Used by** [`server.js`](#server-js), [`lib/erase.js`](#lib-erase-js), [`lib/moderation.js`](#lib-moderation-js), [`lib/signup.js`](#lib-signup-js), [`lib/staff.js`](#lib-staff-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/panel.js`](#lib-panel-js), [`lib/admin.js`](#lib-admin-js), [`lib/manage.js`](#lib-manage-js), [`lib/http.js`](#lib-http-js), [`lib/world.js`](#lib-world-js)

### lib/image-moderation.js

**Checks uploaded pictures with Google Cloud Vision, when it is set up.**

Google Cloud Vision SafeSearch detects adult and racy material.  We keep this dependency-free and use its REST API so deploying the server needs no service-account files or Google SDK in node_modules.

- 53 lines
- **Used by** [`lib/masterpieces.js`](#lib-masterpieces-js), [`lib/itemart.js`](#lib-itemart-js)

### lib/modnotes.js

**Moderators' notes on players.**

moderators' notes on a player: what staff want one another to know about them ("talked to them about trading, seemed fine"), on the player's page of the moderator panel and with "!notes" in the game. the player is never shown them (lib/manage.js leaves them out of their data).

on an account: modNotes [{id, at, by, text}], the oldest first.

- 54 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js)
- **Used by** [`lib/commands.js`](#lib-commands-js), [`lib/modpanel.js`](#lib-modpanel-js)

### lib/modlog.js

**What each staff member did.**

what each moderator did in the moderator panel (lib/modpanel.js), for whoever runs the server to read in the admin panel. never pruned.

- 55 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js)
- **Used by** [`server.js`](#server-js), [`lib/commands.js`](#lib-commands-js), [`lib/discordbot.js`](#lib-discordbot-js), [`lib/playeritems.js`](#lib-playeritems-js), [`lib/staff.js`](#lib-staff-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/panel.js`](#lib-panel-js), [`lib/http.js`](#lib-http-js), [`lib/world.js`](#lib-world-js)

### lib/support.js

**Username requests and feedback from the account page.**

what players send from the account page (/account, lib/manage.js) for whoever runs the server to answer in the admin panel: requests for a new username, and feedback and bug reports.

- 158 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js)
- **Used by** [`server.js`](#server-js), [`lib/erase.js`](#lib-erase-js), [`lib/staff.js`](#lib-staff-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/panel.js`](#lib-panel-js), [`lib/manage.js`](#lib-manage-js)

## Staff and the dashboards

### lib/panel.js

**The owner dashboard (/dashboard/admin): the admin password, or an Owner's staff sign-in.**

the admin panel at /admin: the only place the server is administered from. it has one password, chosen the first time the panel is opened and kept as a salted scrypt hash in the database. no game account has admin powers.

signing in sets a cookie that only this panel's pages send back (HttpOnly, SameSite=Strict, Path=/admin); sessions live in memory, so restarting the server signs everyone out.

- 1399 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/achievements.js`](#lib-achievements-js), [`lib/adopt.js`](#lib-adopt-js), [`lib/announcemedia.js`](#lib-announcemedia-js), [`lib/badges.js`](#lib-badges-js), [`lib/discord.js`](#lib-discord-js), [`lib/discordbot.js`](#lib-discordbot-js), [`lib/bans.js`](#lib-bans-js), [`lib/colours.js`](#lib-colours-js), [`lib/chatlog.js`](#lib-chatlog-js), [`lib/devices.js`](#lib-devices-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/invitehook.js`](#lib-invitehook-js), [`lib/limits.js`](#lib-limits-js), [`lib/log.js`](#lib-log-js), [`lib/masterpieces.js`](#lib-masterpieces-js), [`lib/creatorlimits.js`](#lib-creatorlimits-js), [`lib/modlog.js`](#lib-modlog-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/playeritems.js`](#lib-playeritems-js), [`lib/erase.js`](#lib-erase-js), [`lib/gamefiles.js`](#lib-gamefiles-js), [`lib/reports.js`](#lib-reports-js), [`lib/roles.js`](#lib-roles-js), [`lib/sales.js`](#lib-sales-js), [`lib/stats.js`](#lib-stats-js), [`lib/staff.js`](#lib-staff-js), [`lib/support.js`](#lib-support-js), [`lib/totp.js`](#lib-totp-js), [`lib/manage.js`](#lib-manage-js), [`lib/world.js`](#lib-world-js), [`lib/tints.js`](#lib-tints-js), [`lib/player.js`](#lib-player-js)
- **Used by** [`server.js`](#server-js), [`lib/http.js`](#lib-http-js)

### lib/modpanel.js

**The staff dashboard (/dashboard/staff): moderators, with their own accounts and 2FA.**

the moderator panel at /mod: what a moderator needs to look after the players, and no more. it is apart from the admin panel (lib/panel.js), which stays whoever runs the server's alone.

A moderator is a game account the admin gave a staff role (lib/roles.js: helper, moderator or admin; `moderator` on an older account counts as a moderator), and what they may do here is what their role allows. they sign in here with that account's username and password and a code from their authenticator app, every time: an account without 2FA cannot sign in at all, and a trusted device is not taken for a code. being a moderator gives the account nothing in the game itself.

what it does not give: sign-in histories, the server's log, what an account owns, passwords, renaming, deleting, gifts. a moderator may look up which players signed in from an address they already have (a search written down under their name, below), but is shown no others; an address can be banned through its player (the one they last signed in from) and shows here with its end left out. another moderator cannot be acted on. everything done here is written down (lib/modlog.js) under the moderator's name, for the admin panel.

- 1256 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/admin.js`](#lib-admin-js), [`lib/bans.js`](#lib-bans-js), [`lib/captcha.js`](#lib-captcha-js), [`lib/chatlog.js`](#lib-chatlog-js), [`lib/customitems.js`](#lib-customitems-js), [`lib/itemcontrol.js`](#lib-itemcontrol-js), [`lib/itemart.js`](#lib-itemart-js), [`lib/playeritems.js`](#lib-playeritems-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/devices.js`](#lib-devices-js), [`lib/discord.js`](#lib-discord-js), [`lib/limits.js`](#lib-limits-js), [`lib/manage.js`](#lib-manage-js), [`lib/masterpieces.js`](#lib-masterpieces-js), [`lib/modlog.js`](#lib-modlog-js), [`lib/modnotes.js`](#lib-modnotes-js), [`lib/reports.js`](#lib-reports-js), [`lib/roles.js`](#lib-roles-js), [`lib/staff.js`](#lib-staff-js), [`lib/stats.js`](#lib-stats-js), [`lib/sfs.js`](#lib-sfs-js), [`lib/support.js`](#lib-support-js), [`lib/totp.js`](#lib-totp-js), [`lib/world.js`](#lib-world-js), [`lib/theatre.js`](#lib-theatre-js), [`lib/theatrevideos.js`](#lib-theatrevideos-js)
- **Used by** [`lib/discordbot.js`](#lib-discordbot-js), [`lib/panel.js`](#lib-panel-js), [`lib/manage.js`](#lib-manage-js), [`lib/http.js`](#lib-http-js)

### lib/staff.js

**What both dashboards do alike.**

what the admin panel (lib/panel.js) and the moderator panel (lib/modpanel.js) both do. `by` is who is doing it, for the record: "admin", or a moderator's username.

- 257 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/bans.js`](#lib-bans-js), [`lib/devices.js`](#lib-devices-js), [`lib/limits.js`](#lib-limits-js), [`lib/manage.js`](#lib-manage-js), [`lib/modlog.js`](#lib-modlog-js), [`lib/reports.js`](#lib-reports-js), [`lib/support.js`](#lib-support-js), [`lib/world.js`](#lib-world-js)
- **Used by** [`lib/modpanel.js`](#lib-modpanel-js), [`lib/panel.js`](#lib-panel-js)

### lib/roles.js

**Staff roles and their permissions.**

staff roles, and what each may do. an account holds at most one role (`role` on the account), set by the admin. an account from before roles that is only marked `moderator` counts as a moderator, so nothing that worked before stops working.

a role is a list of permissions, and every staff action checks the one it needs, in the moderator panel (lib/modpanel.js) and in the game (lib/commands.js) alike. a higher role holds everything a lower one does. staff never act on staff of their own rank or above: that is for someone higher up, and for the admin in the end.

- 214 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/totp.js`](#lib-totp-js)
- **Used by** [`server.js`](#server-js), [`lib/commands.js`](#lib-commands-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/panel.js`](#lib-panel-js), [`lib/admin.js`](#lib-admin-js), [`lib/http.js`](#lib-http-js), [`lib/world.js`](#lib-world-js)

### lib/discordbot.js

**The Discord bot: staff commands and the status board.**

Dusklight's Discord control surface. It is intentionally a thin client over lib/modpanel.js: Discord proves who clicked a command, and the panel then proves that their linked Dusklight account is still active staff and applies its usual permission and rank rules. There is no Discord-only staff list.

- 879 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/modpanel.js`](#lib-modpanel-js), [`lib/modlog.js`](#lib-modlog-js), [`lib/reports.js`](#lib-reports-js), [`lib/world.js`](#lib-world-js)
- **Used by** [`server.js`](#server-js), [`lib/panel.js`](#lib-panel-js), [`lib/http.js`](#lib-http-js)

### lib/announcemedia.js

**Pictures shown with announcements.**

pictures and GIFs shown with an announcement (the admin panel's Announcement box, lib/panel.js). the admin gives a link; the server fetches it once and keeps a copy, served from here (/announce-media/<id>.<ext>), so every player's game loads it from this server, not from the site it came from (which then sees no player's address, and may take it down).

a link to a picture (PNG, JPEG, GIF, WebP) or a short video (MP4, WebM: what GIF sites send "GIFs" as now, shown looping and silent) is taken as it is. a link to a page (a Tenor, Giphy or Imgur page, say) is followed to the picture the page names for previews (its "og:video" or "og:image"). what a file is goes by its first bytes, never by its name or its type.

the files are data/announce-media/<id>.<ext>, the id from what is in them; the newest KEEP stay.

- 292 lines
- **Used by** [`lib/panel.js`](#lib-panel-js), [`lib/http.js`](#lib-http-js)
- **Data** `data/announce-media/<id>.<ext>`

## Other

Modules with no group in tools/make-docs.js yet.

### lib/creatorlimits.js

how much players may make: items in the Item Maker (lib/playeritems.js) and Masterpieces in the Art Studio (lib/masterpieces.js). The admin panel sets them. The server's own values are kept in the settings table. A player may have values of their own, higher or lower, on their account (account.creatorLimits), which stand in for the server's one by one. A value left unset is the default below.

- 122 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js)
- **Used by** [`lib/playeritems.js`](#lib-playeritems-js), [`lib/masterpieces.js`](#lib-masterpieces-js), [`lib/panel.js`](#lib-panel-js), [`lib/manage.js`](#lib-manage-js)

### lib/outfitcodes.js

outfit codes from the Burrow outfit tool (github.com/sharkinthedark/burrow-outfit-tool): base64 of JSON {a: animal, c: [3 colours], p: pattern, e: eyes, w: [[item id, [four palette indexes]], ...]}. the item ids are the game's clothing def ids, and the four indexes pack into the game's colour id (the tool's pack(): one byte each, the first highest). items the tool's players made for themselves have ids that are not numbers.

- 55 lines
- **Used by** [`lib/admin.js`](#lib-admin-js)

### lib/denitemfile.js

makes a den item's file (what the game fetches as items/<defId << 16 | iconId>) from a picture, for the content shop's items (lib/contentpacks.js). unlike a custom item's picture (lib/itemart.js), which the client fits in 160 px, this is the game's own kind of item, so it is drawn at its full size, flipped as the game flips any item, and sorted as any item is.

what the client does with the file (loader/DenItemHelper, room/DenItemHolder):

```
 - it is AMF3, read with readObject: {so, ba, ...}. `ba` is a SWF it
   loads; `so` its sort offset. (the game's own files also have r, cx, cy
   and v, which the client never reads; they are copied for likeness.)
 - the SWF's root is a MovieClip with a sprite named "item1" in it (the
   game's art has that name; some of the client's code looks for it).
 - the den stands it on its spot from the content's width and height:
   its left by half its width, its top by its height. so the picture's top
   left is the SWF's (0, 0), and its bottom edge is where it meets the floor.
 - an item with no "flip" frame label is flipped by mirroring it, which
   is what a picture wants.
 - items are put in depth order by their bottom less `so`: `so` is how far
   above its bottom edge its "sort line" is. an avatar standing below that
   line is drawn in front of it.
 - the same file is the item's icon in the shop and the inventory.
```

- 393 lines
- **Used by** [`lib/contentpacks.js`](#lib-contentpacks-js)

### lib/contentshop.js

the content shop (the den editor's shop of this server's own den items, lib/contentpacks.js): open to everyone, paid for in gems.

```
  dcc []  -> [1, json]  the catalog: {packs: [{id, name, price}],
             groups: [name], categories: [{id, name, count}],
             collections: [{id, name, group, kind, pack, count}]}
  dcq [collection, category, text, page, pageSize (optional, 1 to 60; 24)]
          -> [1, total, page, pageSize, json]  the items on sale that match,
             a page of them: [{id, name, cost, placement, w, h, cat, cols}]
  dcb [count, (defId, quantity)...]
          -> [1, spent, gems, given, (defId)...] or [0, message]
             the whole cart or none of it. the den item list ("di") and the
             gems ("cu") are sent before the answer.
```

(named "dc…": the client hands every "d…" answer to its den code, den.DenXtCommManager.) JSON goes in one field: "%" (which lib/sfs.js drops) is written as %.

- 109 lines
- **Uses** [`lib/achievements.js`](#lib-achievements-js), [`lib/accounts.js`](#lib-accounts-js), [`lib/contentpacks.js`](#lib-contentpacks-js), [`lib/dens.js`](#lib-dens-js), [`lib/limits.js`](#lib-limits-js), [`lib/player.js`](#lib-player-js)
- **Used by** [`lib/world.js`](#lib-world-js)

### lib/websocket.js

the game socket for a browser (the client run by Ruffle, public/game.html at /account/play): a browser has no plain TCP socket, so Ruffle carries the game's bytes in WebSocket messages (its socketProxy setting) to the web port. this unwraps them into a stream that looks enough like a net.Socket for lib/sfs.js to take as its own: the same messages, the same limits.

RFC 6455, server side, binary only: no extensions, no subprotocols.

- 195 lines
- **Used by** [`lib/http.js`](#lib-http-js)

### lib/denprefabs.js

den prefabs: items laid out together, which a player saves from their den and puts down again as a group, anywhere, in any den of theirs (the den editor's prefab tab, gui.DenPrefabs). a prefab's items are [def, version, x, y, flip]: where each stands from the prefab's middle, and the item's saved flip value (DenItemHolder: its flips, player depth and layer nudge; its group and lock are not kept, a prefab coming down as one new group). the picture is a small PNG the game drew of it, served at /denprefab/<id>.png.

a prefab can be shared: it gets a code that anyone can type in to copy it to their own prefabs, for as long as it is there to copy.

- 198 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js)
- **Used by** [`server.js`](#server-js), [`lib/erase.js`](#lib-erase-js), [`lib/dens.js`](#lib-dens-js), [`lib/http.js`](#lib-http-js)

### lib/itemids.js

the ids this server's own items take, by kind. den item ids and clothing ids are two lists apart (a den item and a piece of clothing may have the same id). den item ids stay below 65536: the game asks for a den item's file as items/<id << 16 | n>, a 32-bit number.

den items

```
  1-5925        the game's own
  6001-9999     extra music (lib/extramusic.js)
  10000-49999   content packs (lib/contentpacks.js)
  50000-65535   custom items (lib/customitems.js), but for the ids content
                items had before they were moved into 10000-49999
                (lib/contentmove.js; 55000 on), which go to nothing again
```

clothing

```
  1-4606        the game's own
  10000-14999   content packs (none yet)
  50000-65535   custom items
```

swf-src/DenEditor.as isContentItem has the content den range too (they show in the den editor's Custom tab), as does tools/item-ids.js (which lists what each range holds); a change here is a change there.

- 57 lines
- **Used by** [`lib/customitems.js`](#lib-customitems-js), [`lib/contentpacks.js`](#lib-contentpacks-js)

### lib/contentmove.js

content den items given ids outside 10000-49999 (servers before 2026-11-13 gave them 55000 on) are moved into it, once, at start (lib/contentpacks.js load), and with them every id a player's things hold:

```
  - den items had (denItems[].def): the den keeps them where they are, as
    placing is by inventory number
  - saved den layouts (denLayouts[].items[].def) and the den as it was
    before being cleared (denUndo.items[].def)
  - Jam-A-Gram den item gifts not yet opened (ecards[].gift def and name)
  - what the item finder gave (finderGiven "den:<id>"), the finder's
    locks (setting finderLocks "den:<id>") and den prefabs (den_prefabs
    items [[def, ...]...])
```

trades and mannequins name items by inventory number, so they need nothing.

a copy of the database is written to data/backups/ before anything is moved, and the start stops if it can't be. each move is kept (content_id_moves), and every start puts right any old id still held (an account restored from a backup, a start stopped halfway). an old id is never given to anything again (lib/customitems.js skips them).

- 203 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js)
- **Used by** [`lib/contentpacks.js`](#lib-contentpacks-js)
- **Data** `data/backups`

### lib/contentpacks.js

the content shop's den items: pictures made into den items of the game's own kind (lib/denitemfile.js), at their own size, in packs under config.contentDir, sold in the shop of the den editor (lib/contentshop.js) and nowhere else: not in the game's shops, nor the item finder.

a pack is a folder: pack.json (made by a converter, e.g. tools/content/resortopia/convert.py) and its pictures. pack.json:

```
  {id, name, price, groups: [name...], categories: [{id, name}...],
   collections: [{id, name, group, kind}...],
   items: [{key, name, image, width, height, placement: floor|wall|rug,
            category, collections: [id...], so, tags, nameCn, ...}...]}
```

an item's id is given the first time its pack is read and kept (content_items, by pack and key), so a pack can be made again, or grow, and every item keeps its id. an item gone from its pack, or a pack gone, is taken off sale; whoever has it keeps it (its picture is shown while the pack still has it).

a folder whose name starts with "_" is not a pack. <contentDir>/_test/ <defId>.png (or <defId>_so<N>.png, a sort offset of N px) stands in for den item <defId>'s art, any item's (for trying a picture in a den).

- 374 lines
- **Uses** [`lib/accounts.js`](#lib-accounts-js), [`lib/cdn.js`](#lib-cdn-js), [`lib/defpacks.js`](#lib-defpacks-js), [`lib/denitemfile.js`](#lib-denitemfile-js), [`lib/itemids.js`](#lib-itemids-js), [`lib/contentmove.js`](#lib-contentmove-js)
- **Used by** [`server.js`](#server-js), [`lib/admin.js`](#lib-admin-js), [`lib/contentshop.js`](#lib-contentshop-js), [`lib/http.js`](#lib-http-js), [`lib/customitems.js`](#lib-customitems-js)
- **Game files** `items/`

## Data files in lib/

| File | What it holds | Read by |
|---|---|---|
| `lib/games.json` | The minigames table (the game's own list was never a file): id, class, title, icon. | [`lib/buddygames.js`](#lib-buddygames-js), [`lib/minigames.js`](#lib-minigames-js), [`lib/gamefiles.js`](#lib-gamefiles-js) |
| `lib/journeybook.json` | The Journey Book's pages and facts. | [`lib/journeybook.js`](#lib-journeybook-js), [`lib/gamefiles.js`](#lib-gamefiles-js) |
| `lib/shop-stock.json` | What each shop list sells, from the AJ Classic Wiki (tools/shop-stock.py). | [`lib/shopstock.js`](#lib-shopstock-js), [`lib/gamefiles.js`](#lib-gamefiles-js) |
| `lib/sale-dates.json` | When each item was on sale, from every build (tools/sale-history.js). | [`lib/sales.js`](#lib-sales-js) |
| `lib/ecard-art.json` | The Jam-A-Gram cards and stamps offered (media ids, found by tools/find-art.py). | [`lib/ecards.js`](#lib-ecards-js), [`lib/gamefiles.js`](#lib-gamefiles-js) |
| `lib/wall-art.json` | The Jammer Wall wallpapers and stickers (media ids). | [`lib/walls.js`](#lib-walls-js), [`lib/gamefiles.js`](#lib-gamefiles-js) |
| `lib/chat-filter.txt` | The chat filter's rules. | [`lib/chatfilter.js`](#lib-chatfilter-js), [`lib/manage.js`](#lib-manage-js), [`lib/world.js`](#lib-world-js) |
| `lib/reserved-names.txt` | Usernames that would pass for staff. | [`lib/names.js`](#lib-names-js) |
| `lib/sexual-names.txt` | Words refused in usernames. | [`lib/names.js`](#lib-names-js) |
