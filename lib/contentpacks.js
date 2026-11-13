"use strict";

const fs = require("fs");
const path = require("path");
const {logText} = require("./logtext.js");
const config = require("../config.js");
const accounts = require("./accounts.js");
const cdn = require("./cdn.js");
const defpacks = require("./defpacks.js");
const denItemFile = require("./denitemfile.js");
const itemIds = require("./itemids.js");
const contentMove = require("./contentmove.js");

// the content shop's den items: pictures made into den items of the game's
// own kind (lib/denitemfile.js), at their own size, in packs under
// config.contentDir, sold in the shop of the den editor (lib/contentshop.js)
// and nowhere else: not in the game's shops, nor the item finder.
//
// a pack is a folder: pack.json (made by a converter, e.g.
// tools/content/resortopia/convert.py) and its pictures. pack.json:
//   {id, name, price, groups: [name...], categories: [{id, name}...],
//    collections: [{id, name, group, kind}...],
//    items: [{key, name, image, width, height, placement: floor|wall|rug,
//             category, collections: [id...], so, tags, nameCn, ...}...]}
// an item's id is given the first time its pack is read and kept
// (content_items, by pack and key), so a pack can be made again, or grow,
// and every item keeps its id. an item gone from its pack, or a pack gone, is
// taken off sale; whoever has it keeps it (its picture is shown while the
// pack still has it).
//
// a folder whose name starts with "_" is not a pack. <contentDir>/_test/
// <defId>.png (or <defId>_so<N>.png, a sort offset of N px) stands in for
// den item <defId>'s art, any item's (for trying a picture in a den).

// the ids (lib/itemids.js): every item has one of 10000 to 49999 (those
// given 55000 on by an older server are moved there, lib/contentmove.js).
// names go under localization ids of their own (lib/customitems.js has
// 9100000 and 9200000; 9300000 on were the names of the old ids).
const NEW_IDS = itemIds.CONTENT_DEN;
const ID_COUNT = itemIds.size([NEW_IDS]);
const inRange = id => id >= NEW_IDS.first && id <= NEW_IDS.last;
const OLD_STRINGS = {first: 55000, strings: 9300000};
// an id's name string (one left outside, with no id free to move it to: its
// old one)
const stringOf = id => (inRange(id) || id < OLD_STRINGS.first ? NEW_IDS.strings + id - NEW_IDS.first : OLD_STRINGS.strings + id - OLD_STRINGS.first);
const PLACEMENTS = ["floor", "wall", "rug"];
// the def row of each kind of placement: a plain item's (Sturdy Table 158,
// Window 2, Blue Rug 118), with the content item's own id, name and price.
// sortCat 1 is hung on a wall; layer 1 lies on the floor under avatars.
const PLAIN_ROW = {abbrName: "", layer: "0", sortCat: "0", typeCat: "0", membersOnly: "0", itemStatus: "1", gameDefId: "0", enviroType: "3", flag: "0",
  recycleValue: "0", currencyType: "0", scalePercent: "100", specialType: "0", combinedCost: "", parentArrayId: "0", mannequinAvatarDefId: "0",
  mannequinCatId: "0", mannequinFrame: "0", promoType: "0", availabilityStartTime: "0", availabilityEndTime: "0", ecoPower: "0"};
const PLACEMENT_ROW = {floor: {}, wall: {sortCat: "1", typeCat: "1"}, rug: {layer: "1"}};
// the low 16 bits the game asks an item's file with: its icon id (1 to 3 by
// sortCat) and its placed category (1 floor, 2 wall)
const LOW_IDS = 8;
const DEFAULT_PRICE = 100;
const MAX_PRICE = 1000000;
const MAX_NAME = 60;
const MAX_BUILT = 300; // item files kept made, then it starts afresh

// ---- animation and music (LINE PLAY items: tools/content/lineplay/animate.py)
//
// a pack item may have "anim": {image, frames, cols, w, h, x, y, ms} (its
// frames in a grid in one picture, cells w x h, the cell's top left x, y
// from the item's picture's; ms each frame's time) and "sound" (an .mp3).
// the game gets them when someone clicks or points at the item, as its owner
// chose (gui.DenLayersPanel), from /itemanim/den/<id>.png and
// /itemsound/den/<id>.mp3 (lib/http.js). what they are goes in the item's
// file as "lpa" (lib/denitemfile.js), for loader.ContentAnim:
// "frames|cols|w|h|x|y|ms,ms,...|music 0 or 1|tag", tag changing with the
// files (the addresses carry it, so a new one is fetched).
const MAX_FRAMES = 256;
const MAX_CELL = 2048;
const MAX_OFFSET = 4096;
const MAX_FRAME_MS = 60000;

// a file of the pack's own, by its path in pack.json, or null
const packFile = (dir, rel, ext) => {
  const name = path.normalize(String(rel || ""));
  return rel && !path.isAbsolute(name) && !name.startsWith("..") && name.toLowerCase().endsWith(ext) ? path.join(dir, name) : null;
};

const whole = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;

// a pack item's animation, checked, or null
const animOf = (anim, dir) => {
  const file = anim && packFile(dir, anim.image, ".png");
  if (!file || !whole(anim.frames, 2, MAX_FRAMES) || !whole(anim.cols, 1, MAX_FRAMES) || !whole(anim.w, 1, MAX_CELL) || !whole(anim.h, 1, MAX_CELL)
    || !whole(anim.x, -MAX_OFFSET, MAX_OFFSET) || !whole(anim.y, -MAX_OFFSET, MAX_OFFSET) || !Array.isArray(anim.ms) || anim.ms.length !== anim.frames
    || !anim.ms.every(ms => whole(ms, 1, MAX_FRAME_MS))) {
    return null;
  }
  return {file, frames: anim.frames, cols: anim.cols, w: anim.w, h: anim.h, x: anim.x, y: anim.y, ms: anim.ms};
};

const mtimeOf = file => {
  try {
    return fs.statSync(file).mtimeMs;
  }
  catch {
    return null;
  }
};

// the "lpa" text of an entry (see above), or "" for one with neither
const animSpec = entry => {
  const anim = entry.anim && mtimeOf(entry.anim.file) !== null ? entry.anim : null;
  const sound = entry.sound && mtimeOf(entry.sound) !== null ? entry.sound : null;
  if (!anim && !sound) {
    return "";
  }
  const tag = [anim && anim.file, sound].filter(Boolean).map(file => Math.round(mtimeOf(file)).toString(36)).join("");
  const a = anim || {frames: 0, cols: 0, w: 0, h: 0, x: 0, y: 0, ms: []};
  return [a.frames, a.cols, a.w, a.h, a.x, a.y, a.ms.join(","), sound ? 1 : 0, tag].join("|");
};

// the picture of an item's frames, or its music: {file, type}, or null
const animFile = id => {
  const entry = entries.get(Number(id));
  return entry && entry.anim && mtimeOf(entry.anim.file) !== null ? {file: entry.anim.file, type: "image/png"} : null;
};
const soundFile = id => {
  const entry = entries.get(Number(id));
  return entry && entry.sound && mtimeOf(entry.sound) !== null ? {file: entry.sound, type: "audio/mpeg"} : null;
};

const SCHEMA = `CREATE TABLE IF NOT EXISTS content_items (
  pack TEXT NOT NULL, key TEXT NOT NULL, id INTEGER NOT NULL UNIQUE, name TEXT NOT NULL, placement TEXT NOT NULL,
  so INTEGER NOT NULL, image TEXT NOT NULL, retired INTEGER NOT NULL, PRIMARY KEY (pack, key))`;

const db = () => accounts.database();

// what was read: id -> entry; and the shop's catalog
let entries = new Map();
let catalog = {packs: [], groups: [], categories: [], collections: []};
let sources = new Map(); // hashed items/ path -> {file, so}
let built = new Map(); // `${file}|${mtime}|${so}|${lpa}` -> the item file

// ---- the test folder ----------------------------------------------------

const TEST_DIR = "_test";
const TEST_NAME = /^(\d{1,5})(?:_so(\d{1,4}))?\.png$/i;
const TEST_LOW_IDS = 256; // any item: a wallpaper's are by den
const RESCAN_MS = 2000;
let testSources = new Map();
let testScannedAt = 0;
let testStamp = "";

const scanTest = () => {
  const time = Date.now();
  if (time - testScannedAt < RESCAN_MS) {
    return;
  }
  testScannedAt = time;
  const dir = path.join(config.contentDir, TEST_DIR);
  let names;
  try {
    names = fs.readdirSync(dir);
  }
  catch {
    testSources = new Map();
    testStamp = "";
    return;
  }
  const found = names.map(name => ({name, match: TEST_NAME.exec(name)})).filter(({match}) => match).map(({name, match}) => {
    const file = path.join(dir, name);
    try {
      return {file, defId: Number(match[1]), so: Number(match[2] || 0), mtime: fs.statSync(file).mtimeMs};
    }
    catch {
      return null;
    }
  }).filter(entry => entry && entry.defId > 0 && entry.defId <= 65535);
  const stamp = found.map(entry => `${entry.file}:${entry.mtime}`).sort().join("|");
  if (stamp === testStamp) {
    return;
  }
  testStamp = stamp;
  testSources = new Map();
  for (const entry of found) {
    for (let low = 0; low < TEST_LOW_IDS; low++) {
      testSources.set(cdn.hashedPath(`items/${((entry.defId << 16) | low) >>> 0}`), entry);
    }
  }
  if (found.length) {
    console.log(`[content] test pictures for den items ${logText(found.map(entry => entry.defId).join(", "))}`);
  }
};

// ---- packs ----------------------------------------------------------------

const cleanText = (value, max) => String(value ?? "").replace(/[\u0000-\u001f%]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

// a pack's pack.json, checked: {pack} or {error}
const readPack = dir => {
  let pack;
  try {
    pack = JSON.parse(fs.readFileSync(path.join(dir, "pack.json"), "utf8"));
  }
  catch (err) {
    return {error: `pack.json: ${err.message}`};
  }
  if (!pack || !/^[a-z0-9][a-z0-9_-]{0,40}$/.test(String(pack.id)) || !Array.isArray(pack.items)) {
    return {error: "pack.json needs an id (a-z, 0-9, - and _) and items"};
  }
  return {pack};
};

// the def row of an entry
const rowOf = entry => ({...PLAIN_ROW, ...PLACEMENT_ROW[entry.placement], id: String(entry.id),
  nameStrId: String(stringOf(entry.id)), cost: String(entry.cost)});

// reads every pack, gives new items their ids, and puts every item ever
// read in the game's tables (those off sale too, for whoever has them).
const load = () => {
  db().exec(SCHEMA);
  const readRows = () => db().prepare("SELECT * FROM content_items ORDER BY id").all();
  let rows = readRows();
  const used = new Set(rows.map(row => row.id));
  // the next free id
  let next = NEW_IDS.first;
  const freeId = () => {
    while (used.has(next) && next <= NEW_IDS.last) {
      next++;
    }
    if (next > NEW_IDS.last) {
      return null;
    }
    used.add(next);
    return next;
  };
  // ids an older server gave, moved in (with every one players hold)
  if (contentMove.moveRows(rows, inRange, freeId)) {
    rows = readRows();
  }
  contentMove.fixHeld(stringOf);
  const byKey = new Map(rows.map(row => [`${row.pack}\n${row.key}`, row]));
  const seen = new Set();
  const loaded = new Map();
  const packs = [];
  let dirs = [];
  try {
    dirs = fs.readdirSync(config.contentDir, {withFileTypes: true}).filter(dirent => dirent.isDirectory() && !dirent.name.startsWith("_"))
      .map(dirent => dirent.name).sort();
  }
  catch {
    // no packs
  }
  const insert = db().prepare("INSERT INTO content_items (pack, key, id, name, placement, so, image, retired) VALUES (?, ?, ?, ?, ?, ?, ?, 0)");
  const update = db().prepare("UPDATE content_items SET name = ?, placement = ?, so = ?, image = ?, retired = 0 WHERE pack = ? AND key = ?");
  let full = 0;
  db().exec("BEGIN");
  try {
    for (const name of dirs) {
      const dir = path.join(config.contentDir, name);
      const {pack, error} = readPack(dir);
      if (error) {
        console.log(`[content] ${logText(name)}: ${logText(error)}; left out`);
        continue;
      }
      if (packs.some(other => other.id === pack.id)) {
        console.log(`[content] ${logText(name)}: another folder has pack ${logText(pack.id)}; left out`);
        continue;
      }
      const price = Number.isInteger(pack.price) && pack.price >= 0 && pack.price <= MAX_PRICE ? pack.price : DEFAULT_PRICE;
      const collectionIds = new Set((pack.collections || []).map(c => String(c.id)));
      let count = 0;
      for (const item of pack.items) {
        const key = cleanText(item && item.key, 80);
        const image = path.normalize(String(item && item.image || ""));
        const itemName = cleanText(item && item.name, MAX_NAME);
        if (!key || !itemName || !PLACEMENTS.includes(item.placement) || path.isAbsolute(image) || image.startsWith("..") || seen.has(`${pack.id}\n${key}`)) {
          continue;
        }
        seen.add(`${pack.id}\n${key}`);
        const so = Math.max(0, Math.min(4096, Math.round(Number(item.so) || 0)));
        let row = byKey.get(`${pack.id}\n${key}`);
        if (row) {
          update.run(itemName, item.placement, so, image, pack.id, key);
          row = {...row, name: itemName, placement: item.placement, so, image, retired: 0};
        }
        else {
          const id = freeId();
          if (id === null) {
            full++;
            continue;
          }
          insert.run(pack.id, key, id, itemName, item.placement, so, image);
          row = {pack: pack.id, key, id, name: itemName, placement: item.placement, so, image, retired: 0};
        }
        const itemPrice = Number.isInteger(item.price) && item.price >= 0 && item.price <= MAX_PRICE ? item.price : price;
        loaded.set(row.id, {
          id: row.id, pack: pack.id, key, name: itemName, placement: row.placement, so, cost: itemPrice,
          file: path.join(dir, image), width: Number(item.width) || 0, height: Number(item.height) || 0,
          category: cleanText(item.category, 40),
          anim: animOf(item.anim, dir), sound: packFile(dir, item.sound, ".mp3"),
          collections: (Array.isArray(item.collections) ? item.collections : []).map(String).filter(id => collectionIds.has(id)).map(id => `${pack.id}:${id}`),
          search: [itemName, item.nameCn, ...(Array.isArray(item.tags) ? item.tags : []), key].map(text => String(text || "").toLowerCase()).join("\n"),
          onSale: true,
        });
        count++;
      }
      packs.push({id: pack.id, name: cleanText(pack.name || pack.id, 60), price, dir,
        groups: (Array.isArray(pack.groups) ? pack.groups : []).map(group => cleanText(group, 60)),
        categories: (Array.isArray(pack.categories) ? pack.categories : []).map(c => ({id: cleanText(c.id, 40), name: cleanText(c.name, 60)})),
        collections: (Array.isArray(pack.collections) ? pack.collections : []).map(c => ({id: `${pack.id}:${cleanText(c.id, 80)}`,
          name: cleanText(c.name, 60), group: cleanText(c.group, 60), kind: cleanText(c.kind, 20)}))});
      console.log(`[content] pack ${logText(pack.id)}: ${logText(count)} items`);
    }
    // what is no longer in any pack read is off sale; its owners keep it
    const retire = db().prepare("UPDATE content_items SET retired = 1 WHERE pack = ? AND key = ?");
    for (const row of rows) {
      if (!seen.has(`${row.pack}\n${row.key}`)) {
        if (!row.retired) {
          retire.run(row.pack, row.key);
        }
        const pack = packs.find(one => one.id === row.pack);
        loaded.set(row.id, {id: row.id, pack: row.pack, key: row.key, name: row.name, placement: row.placement, so: row.so,
          cost: pack ? pack.price : DEFAULT_PRICE, file: pack ? path.join(pack.dir, row.image) : null, width: 0, height: 0, category: "",
          collections: [], search: "", onSale: false});
      }
    }
    db().exec("COMMIT");
  }
  catch (err) {
    db().exec("ROLLBACK");
    throw err;
  }
  if (full) {
    console.log(`[content] no ids left for ${logText(full)} items (all ${ID_COUNT} are given); left out`);
  }

  entries = loaded;
  defpacks.setCustomItems("den", [...entries.values()].map(entry => ({row: rowOf(entry), name: entry.name, inShop: false})));
  sources = new Map();
  for (const entry of entries.values()) {
    for (let low = 0; low < LOW_IDS; low++) {
      sources.set(cdn.hashedPath(`items/${((entry.id << 16) | low) >>> 0}`), entry);
    }
  }
  built = new Map();

  // the catalog: what is on sale, by collection and category
  const onSale = [...entries.values()].filter(entry => entry.onSale);
  const inCollection = new Map();
  const inCategory = new Map();
  for (const entry of onSale) {
    for (const id of entry.collections) {
      inCollection.set(id, (inCollection.get(id) || 0) + 1);
    }
    inCategory.set(entry.category, (inCategory.get(entry.category) || 0) + 1);
  }
  const categories = new Map();
  for (const pack of packs) {
    for (const c of pack.categories) {
      if (inCategory.get(c.id) && !categories.has(c.id)) {
        categories.set(c.id, {id: c.id, name: c.name, count: inCategory.get(c.id)});
      }
    }
  }
  catalog = {
    packs: packs.map(pack => ({id: pack.id, name: pack.name, price: pack.price})),
    groups: [...new Set(packs.flatMap(pack => pack.groups))],
    categories: [...categories.values()],
    collections: packs.flatMap(pack => pack.collections.filter(c => inCollection.get(c.id)).map(c => ({...c, pack: pack.id, count: inCollection.get(c.id)}))),
  };
  console.log(`[content] ${logText(onSale.length)} den items on sale, ${logText(entries.size - onSale.length)} off sale`);
};

// the item file for an asked-for path (as the CDN names it), or null when
// it is not one of ours
const fileFor = relPath => {
  scanTest();
  const source = testSources.get(relPath) || sources.get(relPath);
  if (!source || !source.file) {
    return null;
  }
  let mtime;
  try {
    mtime = fs.statSync(source.file).mtimeMs;
  }
  catch {
    return null;
  }
  const lpa = animSpec(source);
  const key = `${source.file}|${mtime}|${source.so}|${lpa}`;
  if (!built.has(key)) {
    let made;
    try {
      made = denItemFile.fromPng(fs.readFileSync(source.file), source.so, {lpa});
    }
    catch (err) {
      console.log(`[content] ${logText(path.basename(source.file))}: ${logText(err.message)}`);
      return null;
    }
    if (built.size >= MAX_BUILT) {
      built = new Map();
    }
    built.set(key, made);
  }
  return built.get(key);
};

// ---- the shop's questions -------------------------------------------------

const PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 60;

// items on sale matching a search: `collection` and `category` ids (or ""),
// `text` words that must all be found in its name, tags or Chinese name.
// {total, page, pageSize, items: [{id, name, cost, placement, w, h, cols}]}
const query = ({collection = "", category = "", text = "", page = 0, pageSize = PAGE_SIZE} = {}) => {
  const words = String(text).toLowerCase().split(/\s+/).filter(Boolean).slice(0, 8);
  const size = Math.max(1, Math.min(MAX_PAGE_SIZE, Number(pageSize) || PAGE_SIZE));
  const found = [...entries.values()].filter(entry => entry.onSale
    && (!collection || entry.collections.includes(collection))
    && (!category || entry.category === category)
    && words.every(word => entry.search.includes(word)));
  const pages = Math.max(1, Math.ceil(found.length / size));
  const at = Math.max(0, Math.min(pages - 1, Math.floor(Number(page) || 0)));
  return {
    total: found.length, page: at, pageSize: size,
    items: found.slice(at * size, (at + 1) * size).map(entry => ({id: entry.id, name: entry.name, cost: entry.cost, placement: entry.placement,
      w: entry.width, h: entry.height, cat: entry.category, cols: entry.collections})),
  };
};

module.exports = {
  ID_COUNT,
  load,
  fileFor,
  // a LINE PLAY item's frames picture and music (lib/http.js /itemanim/, /itemsound/)
  animFile,
  soundFile,
  query,
  catalog: () => catalog,
  // a content item (on sale or not), or null
  get: id => entries.get(Number(id)) || null,
  isContent: id => entries.has(Number(id)),
  // an id a content item had before it moved (lib/contentmove.js): never
  // given to anything again
  wasMoved: contentMove.wasMoved,
};
