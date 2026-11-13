"use strict";

// content den items given ids outside 10000-49999 (servers before
// 2026-11-13 gave them 55000 on) are moved into it, once, at start
// (lib/contentpacks.js load), and with them every id a player's things hold:
//   - den items had (denItems[].def): the den keeps them where they are, as
//     placing is by inventory number
//   - saved den layouts (denLayouts[].items[].def) and the den as it was
//     before being cleared (denUndo.items[].def)
//   - Jam-A-Gram den item gifts not yet opened (ecards[].gift def and name)
//   - what the item finder gave (finderGiven "den:<id>"), the finder's
//     locks (setting finderLocks "den:<id>") and den prefabs (den_prefabs
//     items [[def, ...]...]) and shared den layouts (den_layout_shares)
// trades and mannequins name items by inventory number, so they need nothing.
//
// a copy of the database is written to data/backups/ before anything is
// moved, and the start stops if it can't be. each move is kept
// (content_id_moves), and every start puts right any old id still held (an
// account restored from a backup, a start stopped halfway). an old id is
// never given to anything again (lib/customitems.js skips them).

const fs = require("fs");
const path = require("path");
const config = require("../config.js");
const accounts = require("./accounts.js");
const {logText} = require("./logtext.js");

const SCHEMA = "CREATE TABLE IF NOT EXISTS content_id_moves (old INTEGER PRIMARY KEY, new INTEGER NOT NULL UNIQUE, at INTEGER NOT NULL)";
const TYPE_DEN_ITEM = 3; // lib/ecards.js
const LOCKS_SETTING = "finderLocks"; // lib/itemcontrol.js

const db = () => accounts.database();
let moves = new Map(); // old id -> new id

const backup = () => {
  const folder = path.join(config.dataDir, "backups");
  fs.mkdirSync(folder, {recursive: true});
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
  const file = path.join(folder, `before-content-ids-${stamp}.sqlite`);
  db().prepare("VACUUM INTO ?").run(file);
  fs.chmodSync(file, 0o600);
  return file;
};

// gives every row (content_items) whose id is not `inRange` one from
// `freeId` (null: none left). returns whether any moved.
const moveRows = (rows, inRange, freeId) => {
  db().exec(SCHEMA);
  const stray = rows.filter(row => !inRange(row.id));
  const plan = [];
  for (const row of stray) {
    const id = freeId();
    if (id === null) {
      break;
    }
    plan.push([row.id, id]);
  }
  if (stray.length > plan.length) {
    console.log(`[content] no ids left to move ${logText(stray.length - plan.length)} items into; they keep theirs`);
  }
  if (plan.length) {
    const file = backup();
    const at = Math.floor(Date.now() / 1000);
    const update = db().prepare("UPDATE content_items SET id = ? WHERE id = ?");
    const insert = db().prepare("INSERT INTO content_id_moves (old, new, at) VALUES (?, ?, ?)");
    db().exec("BEGIN");
    try {
      for (const [old, id] of plan) {
        update.run(id, old);
        insert.run(old, id, at);
      }
      db().exec("COMMIT");
    }
    catch (err) {
      db().exec("ROLLBACK");
      throw err;
    }
    console.log(`[content] moved ${logText(plan.length)} items to new ids (${logText(plan[0][0])} is now ${logText(plan[0][1])}); the database as it was is ${logText(file)}`);
  }
  moves = new Map(db().prepare("SELECT old, new FROM content_id_moves").all().map(row => [Number(row.old), Number(row.new)]));
  return plan.length > 0;
};

// every old id players' things hold made its new one. `nameStrIdOf(id)`: a
// content item's name string id (for gifts).
const fixHeld = nameStrIdOf => {
  if (!moves.size) {
    return;
  }
  const moved = id => moves.get(Number(id));
  const counts = {"den items": 0, "layout items": 0, "undo items": 0, gifts: 0, "finder entries": 0, "prefab items": 0, "shared layout items": 0, locks: 0};
  const changed = [];
  const fixDefs = (list, what) => {
    let n = 0;
    for (const item of Array.isArray(list) ? list : []) {
      const id = item && moved(item.def);
      if (id) {
        item.def = id;
        n++;
      }
    }
    counts[what] += n;
    return n;
  };
  for (const account of accounts.all()) {
    let n = fixDefs(account.denItems, "den items");
    n += fixDefs(account.denUndo && account.denUndo.items, "undo items");
    for (const layout of Array.isArray(account.denLayouts) ? account.denLayouts : []) {
      n += fixDefs(layout && layout.items, "layout items");
    }
    for (const card of Array.isArray(account.ecards) ? account.ecards : []) {
      const id = card && card.gift && Number(card.gift.type) === TYPE_DEN_ITEM && moved(card.gift.def);
      if (id) {
        card.gift.def = id;
        card.gift.name = nameStrIdOf(id);
        counts.gifts++;
        n++;
      }
    }
    if (account.finderGiven && typeof account.finderGiven === "object") {
      for (const key of Object.keys(account.finderGiven)) {
        const match = /^den:(\d+)$/.exec(key);
        const id = match && moved(match[1]);
        if (id) {
          account.finderGiven[`den:${id}`] = account.finderGiven[`den:${id}`] || account.finderGiven[key];
          delete account.finderGiven[key];
          counts["finder entries"]++;
          n++;
        }
      }
    }
    if (n) {
      changed.push(account);
    }
  }
  if (changed.length) {
    accounts.save(...changed);
    accounts.flush();
  }

  // den prefabs and shared den layouts: items [[def, ...]...]
  for (const [table, key, what] of [["den_prefabs", "id", "prefab items"], ["den_layout_shares", "code", "shared layout items"]]) {
    if (!db().prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").get(table)) {
      continue;
    }
    const update = db().prepare(`UPDATE ${table} SET items = ? WHERE ${key} = ?`);
    for (const row of db().prepare(`SELECT ${key} AS key, items FROM ${table}`).all()) {
      let items;
      try {
        items = JSON.parse(row.items);
      }
      catch {
        continue;
      }
      if (!Array.isArray(items)) {
        continue;
      }
      let n = 0;
      for (const item of items) {
        const id = Array.isArray(item) && moved(item[0]);
        if (id) {
          item[0] = id;
          n++;
        }
      }
      if (n) {
        update.run(JSON.stringify(items), row.key);
        counts[what] += n;
      }
    }
  }

  let locks = null;
  try {
    locks = JSON.parse(accounts.setting(LOCKS_SETTING) || "null");
  }
  catch {
    // none readable
  }
  if (Array.isArray(locks)) {
    const fixed = locks.map(key => {
      const match = /^den:(\d+)$/.exec(String(key));
      const id = match && moved(match[1]);
      if (id) {
        counts.locks++;
      }
      return id ? `den:${id}` : key;
    });
    if (counts.locks) {
      accounts.setSetting(LOCKS_SETTING, JSON.stringify([...new Set(fixed)]));
    }
  }

  const done = Object.entries(counts).filter(([, n]) => n > 0);
  if (done.length) {
    console.log(`[content] old item ids made new in ${changed.length} accounts: ${done.map(([what, n]) => `${n} ${what}`).join(", ")}`);
  }
};

module.exports = {
  moveRows,
  fixHeld,
  // an id a content item had before it was moved: never given again
  wasMoved: id => moves.has(Number(id)),
  movedTo: id => moves.get(Number(id)) || null,
};
