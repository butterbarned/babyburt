"use strict";

// which den and clothing ids are used, and by what: the custom items (PNG
// items made in the mod panel, lib/customitems.js), the content packs
// (lib/contentpacks.js) and the extra music (lib/extramusic.js). reads the
// game's database without changing it, so it can run beside the server.
// needs nothing else of the server's code, so the one file can be copied to
// a server of any version.
//
//   node tools/item-ids.js            the ranges, what is in each, and any clash
//   node tools/item-ids.js 50012 ...  what each id is
//
// AJ_DATA_DIR picks the database, as for the server (default data/).
// the ranges are lib/itemids.js's, copied (this file needs no other).

const path = require("path");
const fs = require("fs");
const {DatabaseSync} = require("node:sqlite");

const OFFICIAL_DEN_LAST = 5925;
const CONTENT_NEW = {first: 10000, last: 49999};
const CUSTOM = {den: [{first: 50000, last: 65535}], clothing: [{first: 50000, last: 65535}]};

const dataDir = process.env.AJ_DATA_DIR || path.join(__dirname, "..", "data");
const file = path.join(dataDir, "game.sqlite");
if (!fs.existsSync(file)) {
  console.log(`no database at ${file} (set AJ_DATA_DIR)`);
  process.exit(1);
}
const db = new DatabaseSync(file, {readOnly: true});
const hasTable = name => Boolean(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").get(name));
const custom = hasTable("custom_items") ? db.prepare("SELECT kind, id, name FROM custom_items ORDER BY kind, id").all() : [];
const content = hasTable("content_items") ? db.prepare("SELECT pack, key, id, name, retired FROM content_items ORDER BY id").all() : [];
let music = [];
try {
  music = require("../lib/extramusic.js").TRACKS.map(track => Number(track.id));
}
catch {
  // no extra music here
}

const span = ids => (ids.length ? `${Math.min(...ids)}-${Math.max(...ids)}` : "none");
const between = (ids, first, last) => ids.filter(id => id >= first && id <= last);

const lookup = id => {
  const found = [];
  if (id >= 1 && id <= OFFICIAL_DEN_LAST) {
    found.push("an official den item id (or clothing, which has ids of its own)");
  }
  if (music.includes(id)) {
    found.push("extra music (den)");
  }
  for (const row of custom.filter(one => one.id === id)) {
    found.push(`custom ${row.kind} item "${row.name}"`);
  }
  for (const row of content.filter(one => one.id === id)) {
    found.push(`content pack ${row.pack}, ${row.key} "${row.name}"${row.retired ? " (off sale)" : ""}`);
  }
  return found.length ? found : ["free"];
};

const ids = process.argv.slice(2).map(Number).filter(Number.isInteger);
if (ids.length) {
  for (const id of ids) {
    console.log(`${id}: ${lookup(id).join("; ")}`);
  }
  process.exit(0);
}

const contentIds = content.map(row => row.id);
const customDen = custom.filter(row => row.kind === "den").map(row => row.id);
const customClothing = custom.filter(row => row.kind === "clothing").map(row => row.id);
console.log(`database: ${file}\n`);
console.log("den items:");
console.log(`  official:       1-${OFFICIAL_DEN_LAST}`);
console.log(`  extra music:    ${music.length} (${span(music)})`);
console.log(`  content packs:  ${content.length} (${content.filter(row => row.retired).length} off sale)`);
const newIds = between(contentIds, CONTENT_NEW.first, CONTENT_NEW.last);
const oldIds = contentIds.filter(id => id < CONTENT_NEW.first || id > CONTENT_NEW.last);
const movedCount = hasTable("content_id_moves") ? db.prepare("SELECT COUNT(*) AS n FROM content_id_moves").get().n : 0;
const ranges = list => list.map(range => `${range.first}-${range.last}`).join(", ");
console.log(`    new ids, ${CONTENT_NEW.first}-${CONTENT_NEW.last}: ${newIds.length} used (${span(newIds)}), ${CONTENT_NEW.last - CONTENT_NEW.first + 1 - newIds.length} free`);
console.log(`    on old ids (55000 on): ${oldIds.length} (${span(oldIds)})${oldIds.length ? "; a server of 2026-11-13 on moves them into 10000-49999 when it starts" : ""}`);
console.log(`    moved from old ids so far: ${movedCount}${movedCount ? " (those old ids go to nothing again)" : ""}`);
console.log(`  custom (PNG):   ${customDen.length} (${span(customDen)}); takes ${ranges(CUSTOM.den)}`);
console.log(`\nclothing (ids of its own, apart from den items):`);
console.log("  content packs:  none yet; takes 10000-14999");
console.log(`  custom (PNG):   ${customClothing.length} (${span(customClothing)}); takes ${ranges(CUSTOM.clothing)}`);

console.log("\ncontent packs:");
const packs = new Map();
for (const row of content) {
  packs.set(row.pack, packs.get(row.pack) || []);
  packs.get(row.pack).push(row.id);
}
for (const [name, packIds] of packs) {
  console.log(`  ${name}: ${packIds.length} items, ids ${span(packIds)}`);
}
if (!packs.size) {
  console.log("  none");
}

// den ids two things claim
const problems = [];
const owner = new Map();
const claim = (id, what) => {
  if (owner.has(id)) {
    problems.push(`${id}: ${owner.get(id)} and ${what}`);
  }
  owner.set(id, what);
};
for (const id of music) {
  claim(id, "extra music");
}
for (const row of custom.filter(one => one.kind === "den")) {
  claim(row.id, `custom den item "${row.name}"`);
}
for (const row of content) {
  claim(row.id, `content ${row.pack}/${row.key}`);
}
const inAny = (id, list) => list.some(range => id >= range.first && id <= range.last);
for (const row of custom) {
  if (!inAny(row.id, CUSTOM[row.kind] || [])) {
    problems.push(`${row.id}: custom ${row.kind} item "${row.name}" is outside the custom ids (${ranges(CUSTOM[row.kind] || [])})`);
  }
}
console.log(problems.length ? `\n${problems.length} problem(s):\n  ${problems.join("\n  ")}` : "\nno clashes");
