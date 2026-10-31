# Broken references

What points at something that isn't there, and what it should point at, as
far as is known. Checked on 2026-10-29 against the VPS's cache
(`vps-archive.tar.gz`, 1.1 million files) and the CDN link lists in
`D:\aj-links`.

To check again:

```sh
node tools/check-references.js                                  # the code and the game's tables
node tools/check-references.js --list <file list or folder>     # and every file the tables name
```

`--list` takes what the CDN or a cache holds: `tar -tzf vps-archive.tar.gz`
saved to a file, `D:\aj-links`, or `files.txt.gz`. Without a list, the
local `cache/` is all it can check, and a cache that isn't the whole archive
misses most files. In the owner dashboard, **Game files → Broken links**
shows the first kind of problem (defs naming defs that don't exist).

- [In the code](#in-the-code)
- [In the game's tables](#in-the-games-tables)
- [Files the tables name that nobody has](#files-the-tables-name-that-nobody-has)
- [What is fine](#what-is-fine)

## In the code

### Notes that were never part of this repository

Dusklight is built on the Burrow server. Burrow's `tools/publish-public.sh`
kept its working notes private when it published the code, so the comments
that point at them lead nowhere:

| Named | Where | What it was | Point at instead |
|---|---|---|---|
| `DISCOVERIES.md` "Older designs of the lands" | `config.js:236`, `tools/room-history.js:6` | how the seasonal room files in the Theme list were found and dated | `tools/room-history.js`, which does that search; [game-files.md](game-files.md#a-room-or-a-land) |
| `DISCOVERIES.md` "Odd audio" | `lib/extramusic.js:11`, `lib/panel.js:285` | the sounds made into extra den music | the `TRACKS` list in `lib/extramusic.js`, which names each sound and where it is cut from |
| `HANDOFF.md` | `config.js:169` | Burrow's notes on asset versions 19 to 25 | nothing: the comment's list of versions says what each changed |
| `GOING-PUBLIC.md`, `TBA.md` | `tools/publish-public.sh:18` | the list of what stays private | nothing to fix: the script names them to leave them out |
| `tools/recorder.js` | `lib/adventures.js:8` | the tool that recorded the official game for the adventure scripts. `.gitignore` leaves it out on purpose | nothing: its results are the scripts in `lib/adventures/`. A new adventure needs a recording made some other way |

### Belongs to the launcher's repository

These are named on purpose, and live in the desktop client (launcher) repository:

- `tools/make-update.js` (`config.js:193`) writes launcher updates into `client-updates/`.
- `BUILDING.md` (`config.js:196`) explains building the installers that go in `data/downloads/`.

### Folders the server expects

| Setting | Folder | What happens without it | Fix |
|---|---|---|---|
| `config.clientUpdatesDir` (`AJ_CLIENT_UPDATES_DIR`) | `client-updates/` | `/client/` answers nothing, so installed launchers never update themselves. Burrow kept this folder private, and the comment saying it is "in the repository" is wrong here | put the launcher's update files there (made by the launcher's `tools/make-update.js`), or point the setting at where they are |
| `config.downloadsDir` (`AJ_DOWNLOADS_DIR`) | `data/downloads/` | `/download` lists no installers | copy the installers there after a launcher build |

### Fine as they are

- Every class `tools/build-client.sh` compiles is there, and every file in `swf-src/` is compiled. `room.DenItemHolder` is compiled from the decompiled original on purpose.
- Every call the three pages (`admin.html`, `mod.html`, `account.html`) make has a route.
- Every room the Theme list (`config.themes`) draws from an older build is in the VPS's cache.

## In the game's tables

These are in the def packs as the CDN serves them, not in this server's
code. The parties are already handled: `lib/parties.js` opens only parties
whose room exists, so these four never appear.

| Def | Names | Problem | What it should point at |
|---|---|---|---|
| Party 3, New Year's Party | room 228 | no room 228 in the room pack of any build from 1810 to 1830, and no file | **room 326, `party/venue_newyear2`**: party 26 is the same party with that room |
| Party 5, Jamaaliday Jam | room 222 | no room 222 anywhere | **room 223, `party/venue_ginger`**: party 1 is the Jamaaliday Jam with that room |
| Party 25, New Year's Shop | room 322 | no room 322 anywhere | nothing found. No party room on the CDN is a shop |
| Party 45 (a Jammer party, no name) | room 549 | no room 549 anywhere | nothing found: the other Jammer party venues (rooms 530–535, 541, 546) all have parties of their own |
| Den type 19, Arcade | room 296 | no room 296 anywhere | probably **room 436, `player_den/room_main_solarcade`**, the Sol Arcade Den (den type 20). Not sold (`storeStatus` 5) |
| Diamond shop row 112 | pet 33 | there is no pet 33 (the pets go 32, 34) | nothing: the row sells a pet that was taken out |
| Room 352 | `bradyexpeditionsassets/main_room` | no such file in any build | **`bradyexpeditionsassets/room_main`**, which every build has. The name is back to front. The Brady Expeditions minigame (id 40) loads its scene by the game's own name, so the room def's mistake may not matter in play |

To put a party on the right room, `lib/defpacks.js` would have to change
the def before it reaches clients, as it already does for sale dates.
Nothing does that yet.

### Den items whose picture has the wrong number

The client asks for a den item's picture as `items/<id << 16 | icon>`,
working the icon out from the def's `sortCat` (`DenItem.getIconId`). For
**70 den items** there is no file under that icon, but there is one under
another:

| How many | sortCat says | The file is |
|---|---|---|
| 66 (173 to 327) | 0, a floor item (icon 1) | icon 2, a wall item |
| 2 (406, 407) | 2 (icon 3) | icon 7 |
| 2 (408, 409) | 2 (icon 3) | icon 6 |

All 70 have no name except 182, "Test Item". No shop sells them, but the
item finder offers them, and they show up blank in the game. **They should point at the file that exists**,
for example den item 173 at `items/11337730` (icon 2), not `items/11337729`.
`node tools/check-references.js --list ...` lists every one under "Den
items whose picture has another icon id". The fix is to serve these defs
with the `sortCat` their file has. That would also move the 66 floor items
into the wall item tab, which is what their pictures are.

## Files the tables name that nobody has

Neither the VPS's cache nor any CDN list has these files. They came out
after the archive was made, or were never put on the CDN.

| What | How many | Effect | Notes |
|---|---|---|---|
| Den item pictures | ~210 den items | the item is invisible: blank in shops, inventory and dens | all but 22 are the newest items (ids from about 5600 on). **11 of them are still sold**, see below |
| Jamaa Journal pages | 134 files (the page and icon of the newest issues, 358 on) | those pages are blank | media 9271 and up |
| English subtitles of the movies | 43 movies (`subtitle/<id>/0`) | no subtitles in English; the video plays | the other four languages are there |
| Clothing 4289, Painted Striped Egg Shoes | its small icon (`imageArrays/18482079`) | a blank small icon; the large one is there | |
| Def packs 1024, 1033, 1035, 1037, 1059, 1060 | | none | not missing: they were never files, only lists the official server sent over the socket. The live CDN has none of them in any build back to 1691. See [game-files.md](game-files.md#the-def-packs) |

### Den items still sold with no picture

Players can buy these and get an invisible item. They should be taken off
sale until a picture is found. Turning off the shop rows in
`lib/shop-stock.json`, or giving each one its own picture (`lib/itemart.js`,
as staff do for custom items), would both work.

| Den item | Sold in |
|---|---|
| 3114 Phantom Sprinkler | shop lists 167 and 173 ("former": back in its season) |
| 5656 Autumn Harvest My Shop | shop lists 167 and 173; diamond row 3375 |
| 5845 Mint Chip Ice Cream Cake Freezer | shop lists 167 and 173; diamond row 3634 |
| 5853 Mint Chip Waffle Cone Display | shop lists 167 and 173; diamond row 3632 |
| 5918–5924 Ghostly Phantom Rug, Sofa, Chair, Window, Lamp, Table, Archway | diamond rows 3753–3759 |

## What is fine

Things that look missing but aren't:

- **Name tag badges 63–76** (`media/20001` and up) and the card's Bio tab
  (`media/20100`) are this server's own, served from `swf/badges/` and
  `swf/biotab.swf`.
- **The Summer Carnival room** (`party/venue_carnival`) is gone from build
  1830. The server takes it from 1828 (`config.olderBuilds`).
- **The Epic Dens and the newest den types** (`epic_dens/*`, Boreal
  Cottage and the like) aren't in the CDN link lists, but are in the VPS's
  cache.
- **Media 20000 and up** are never on the CDN: those numbers are this
  server's.
