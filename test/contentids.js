"use strict";

// the ids of the server's own items (lib/itemids.js) and the move of old
// content ids (lib/contentmove.js): content pack items take 10000-49999;
// those an older server gave from 55000 are moved there at start, with every
// copy of the id a player's things hold (and nothing else that happens to
// have the same number); a backup is written first; the move is kept, so a
// later start puts right an old id that turns up again; with 10000-49999
// full a new item is left out; custom den items take 50000 on, but never an
// id a content item had.

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const contentDir = fs.mkdtempSync(path.join(os.tmpdir(), "aj-content-"));
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "aj-test-"));
process.env.AJ_CONTENT_DIR = contentDir;
process.env.AJ_DATA_DIR = dataDir;

const accounts = require("../lib/accounts.js");
const contentPacks = require("../lib/contentpacks.js");
const customItems = require("../lib/customitems.js");
const defpacks = require("../lib/defpacks.js");
const denPrefabs = require("../lib/denprefabs.js");
const denLayouts = require("../lib/denlayouts.js");
const itemIds = require("../lib/itemids.js");

// a 1x1 transparent PNG
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
const TYPE_DEN_ITEM = 3; // lib/ecards.js
const TYPE_GEMS = 4;

const writePack = keys => {
  const dir = path.join(contentDir, "idpack");
  fs.mkdirSync(path.join(dir, "images"), {recursive: true});
  for (const key of keys) {
    fs.writeFileSync(path.join(dir, `images/${key}.png`), PNG);
  }
  fs.writeFileSync(path.join(dir, "pack.json"), JSON.stringify({id: "idpack", name: "Id Pack", price: 100,
    items: keys.map(key => ({key, name: `Item ${key}`, placement: "floor", image: `images/${key}.png`, width: 1, height: 1}))}));
};

const db = () => accounts.database();
const addContent = (pack, key, id, retired = 0) => db().prepare("INSERT INTO content_items (pack, key, id, name, placement, so, image, retired) VALUES (?, ?, ?, ?, 'floor', 0, ?, ?)")
  .run(pack, key, id, `Item ${key}`, `images/${key}.png`, retired);
const ids = () => db().prepare("SELECT key, id FROM content_items WHERE pack = 'idpack' ORDER BY id").all()
  .reduce((all, row) => ({...all, [row.key]: row.id}), {});
const backups = () => fs.readdirSync(path.join(dataDir, "backups")).filter(name => name.startsWith("before-content-ids-"));

// every place in the database (but the move table) a number turns up, as
// a json path, apart from what the migration knows of
const findAnywhere = numbers => {
  const found = [];
  const walk = (value, where) => {
    if (Array.isArray(value)) {
      value.forEach((one, index) => walk(one, `${where}[${index}]`));
    }
    else if (value && typeof value === "object") {
      for (const [key, one] of Object.entries(value)) {
        if (numbers.some(n => key.includes(String(n)))) {
          found.push(`${where}.<key ${key}>`);
        }
        walk(one, `${where}.${key}`);
      }
    }
    else if (numbers.includes(Number(value)) || (typeof value === "string" && numbers.some(n => value.includes(String(n))))) {
      found.push(where);
    }
  };
  for (const {name} of db().prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name != 'content_id_moves'").all()) {
    for (const row of db().prepare(`SELECT * FROM "${name}"`).all()) {
      for (const [column, value] of Object.entries(row)) {
        let parsed = value;
        if (typeof value === "string" && /^[[{]/.test(value)) {
          try {
            parsed = JSON.parse(value);
          }
          catch {
            // as it is
          }
        }
        walk(parsed, `${name}.${column}`);
      }
    }
  }
  return found;
};

const run = async () => {
  // the layout
  assert.strictEqual(contentPacks.ID_COUNT, 40000);
  assert.ok(itemIds.isContentId("den", 10000) && itemIds.isContentId("den", 49999));
  for (const id of [9999, 50000, 55000, 65535]) {
    assert.ok(!itemIds.isContentId("den", id), id);
  }
  assert.ok(itemIds.isContentId("clothing", 10000) && itemIds.isContentId("clothing", 14999) && !itemIds.isContentId("clothing", 15000));
  assert.strictEqual(itemIds.nextCustomId("den", 0), 50000);
  assert.strictEqual(itemIds.nextCustomId("den", 50005), 50006);
  assert.strictEqual(itemIds.nextCustomId("den", 65535), null);
  assert.strictEqual(itemIds.size(itemIds.CUSTOM.den), 15536);

  await defpacks.init();
  accounts.load();
  denPrefabs.load();
  denLayouts.load();
  db().exec(`CREATE TABLE IF NOT EXISTS content_items (
    pack TEXT NOT NULL, key TEXT NOT NULL, id INTEGER NOT NULL UNIQUE, name TEXT NOT NULL, placement TEXT NOT NULL,
    so INTEGER NOT NULL, image TEXT NOT NULL, retired INTEGER NOT NULL, PRIMARY KEY (pack, key))`);

  // what an older server left: content ids from 55000, held all about
  addContent("idpack", "A", 55000);
  addContent("idpack", "B", 55001);
  addContent("gone", "S", 57000, 1);
  const {account} = accounts.register("Mover", "KettlePass01", {type: 4});
  assert.ok(account, "an account");
  account.denItems = [{inv: 101, def: 55000, version: 0, spots: {0: {x: 1, y: 2, flip: 0}}}, {inv: 102, def: 55001, version: 0, spots: {}},
    {inv: 103, def: 57000, version: 0, spots: {}}, {inv: 104, def: 158, version: 0, spots: {}}];
  account.denUndo = {den: 0, items: [{def: 55000, version: 0, x: 1, y: 2, flip: 0}]};
  account.denLayouts = [{name: "Mine", den: 0, items: [{def: 55001, version: 0, x: 3, y: 4, flip: 0}, {def: 158, version: 0, x: 5, y: 6, flip: 0}]}];
  account.ecards = [{id: 1, gift: {type: TYPE_DEN_ITEM, def: 57000, color: 0, name: 9302000, version: 0}},
    {id: 2, gift: {type: TYPE_GEMS, def: 55000, color: 0, name: 55000}}]; // gems: a number, not an item
  account.items = [...(account.items || []), {inv: 105, def: 55000, color: 0, on: []}]; // clothing: ids of its own
  account.finderGiven = {"den:55001": {count: 2, at: 1}, "clothing:55000": {count: 1, at: 1}};
  accounts.save(account);
  accounts.flush();
  db().prepare("INSERT INTO den_prefabs (id, owner, name, items, thumb, code, created_at) VALUES ('p1', ?, 'Set', ?, NULL, NULL, 1)")
    .run(account.id, JSON.stringify([[55000, 0, 1, 2, 0], [158, 0, 3, 4, 0]]));
  accounts.setSetting("finderLocks", JSON.stringify(["den:55001", "clothing:55000"]));
  db().prepare("INSERT INTO den_layout_shares (code, owner, name, den, items, created_at) VALUES ('ABCD2345', ?, 'Den', 1, ?, 1)")
    .run(account.id, JSON.stringify([[55001, 0, 10, 20, 0, 1], [158, 0, 30, 40, 0, 1]]));

  writePack(["A", "B", "C"]);
  contentPacks.load();
  assert.deepStrictEqual(ids(), {A: 10000, B: 10001, C: 10003}, "old ids moved in order, a new one after");
  assert.strictEqual(backups().length, 1, "a backup before the move");
  assert.deepStrictEqual(account.denItems.map(item => item.def), [10000, 10001, 10002, 158]);
  assert.deepStrictEqual(account.denItems[0].spots, {0: {x: 1, y: 2, flip: 0}}, "placed where it was");
  assert.strictEqual(account.denUndo.items[0].def, 10000);
  assert.deepStrictEqual(account.denLayouts[0].items.map(item => item.def), [10001, 158]);
  assert.deepStrictEqual(account.ecards[0].gift, {type: TYPE_DEN_ITEM, def: 10002, color: 0, name: 9400002, version: 0});
  assert.deepStrictEqual(account.ecards[1].gift, {type: TYPE_GEMS, def: 55000, color: 0, name: 55000}, "a gift of gems untouched");
  assert.strictEqual(account.items.find(item => item.inv === 105).def, 55000, "clothing untouched");
  assert.deepStrictEqual(account.finderGiven, {"den:10001": {count: 2, at: 1}, "clothing:55000": {count: 1, at: 1}});
  assert.deepStrictEqual(JSON.parse(db().prepare("SELECT items FROM den_prefabs WHERE id = 'p1'").get().items), [[10000, 0, 1, 2, 0], [158, 0, 3, 4, 0]]);
  assert.deepStrictEqual(JSON.parse(accounts.setting("finderLocks")), ["den:10001", "clothing:55000"]);
  assert.deepStrictEqual(JSON.parse(db().prepare("SELECT items FROM den_layout_shares WHERE code = 'ABCD2345'").get().items), [[10001, 0, 10, 20, 0, 1], [158, 0, 30, 40, 0, 1]]);
  // saved: the account as stored has them too
  const stored = JSON.parse(db().prepare("SELECT state FROM accounts WHERE id = ?").get(account.id).state);
  assert.deepStrictEqual(stored.denItems.map(item => item.def), [10000, 10001, 10002, 158]);
  // and the old ids are nowhere else, but in what is not a den item
  assert.deepStrictEqual(findAnywhere([55001, 57000]), []);
  assert.deepStrictEqual(findAnywhere([55000]).sort(), [
    "accounts.state.ecards[1].gift.def", "accounts.state.ecards[1].gift.name", "accounts.state.finderGiven.<key clothing:55000>",
    `accounts.state.items[${account.items.length - 1}].def`, "settings.value[1]"].sort());
  // the names and defs
  assert.strictEqual(defpacks.denItemDef(10000).nameStrId, "9400000");
  assert.strictEqual(defpacks.string(9400000), "Item A");
  assert.ok(defpacks.denItemDef(10002), "an item off sale still has its def");
  assert.ok(!defpacks.denItemDef(55000), "the old id is no item now");

  // an old id back (an account restored from a backup): put right at the
  // next start, without moving anything or another backup
  account.denItems.push({inv: 106, def: 55001, version: 0, spots: {}});
  accounts.save(account);
  accounts.flush();
  writePack(["C", "B", "A", "E"]);
  contentPacks.load();
  assert.strictEqual(account.denItems.find(item => item.inv === 106).def, 10001);
  assert.deepStrictEqual(ids(), {A: 10000, B: 10001, C: 10003, E: 10004});
  assert.strictEqual(backups().length, 1);

  // 10000-49999 full: a new item is left out, the others stay
  const insert = db().prepare("INSERT INTO content_items (pack, key, id, name, placement, so, image, retired) VALUES ('old', ?, ?, 'Old', 'floor', 0, 'x.png', 1)");
  db().exec("BEGIN");
  for (let id = 10005; id <= 49999; id++) {
    insert.run(`K${id}`, id);
  }
  db().exec("COMMIT");
  writePack(["A", "B", "C", "E", "F"]);
  contentPacks.load();
  assert.deepStrictEqual(ids(), {A: 10000, B: 10001, C: 10003, E: 10004});

  // custom den items: from 50000; never an id a content item had
  customItems.load();
  const make = name => customItems.create("den", {base: 158, name, cost: 10}, "tester");
  const first = make("First Chair");
  assert.strictEqual(first.error, undefined, first.error);
  assert.strictEqual(first.item.id, 50000);
  db().prepare("UPDATE custom_items SET id = 54999 WHERE kind = 'den' AND id = 50000").run();
  customItems.load();
  const next = make("Next Chair");
  assert.strictEqual(next.error, undefined, next.error);
  assert.strictEqual(next.item.id, 55002, "past 55000 and 55001, which content items had");
  console.log("content ids: ok");
};

run().catch(err => {
  console.error(err);
  process.exitCode = 1;
}).finally(() => {
  try {
    db().close();
  }
  catch {
    // not open
  }
  fs.rmSync(contentDir, {recursive: true, force: true});
  fs.rmSync(dataDir, {recursive: true, force: true});
});
