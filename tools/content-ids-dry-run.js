"use strict";

// a rehearsal of the move of old content ids (lib/contentmove.js) on a copy
// of a database: the copy is made in a folder of its own, the server's
// start-up loading runs on it (as the server would), what changed is
// printed, the copy is searched for any old id left anywhere, and the copy
// is deleted. the database named is only read, so the server can be running.
//
//   node tools/content-ids-dry-run.js <game.sqlite>
//
// run it from the folder of the new server code (it needs that code and its
// asset cache). exits 1 if anything is left on an old id.

const fs = require("fs");
const os = require("os");
const path = require("path");
const {DatabaseSync} = require("node:sqlite");

const source = process.argv[2];
if (!source || !fs.existsSync(source)) {
  console.log("usage: node tools/content-ids-dry-run.js <game.sqlite>");
  process.exit(2);
}
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "aj-dry-run-"));
const copy = path.join(dir, "game.sqlite");
const original = new DatabaseSync(source, {readOnly: true});
original.prepare("VACUUM INTO ?").run(copy);
original.close();
process.env.AJ_DATA_DIR = dir;

const accounts = require("../lib/accounts.js");
const defpacks = require("../lib/defpacks.js");

// every value or key in the database (but the move table) that is one of
// `numbers`, as a json path
const findAnywhere = (db, numbers) => {
  const wanted = new Set(numbers.map(String));
  const found = [];
  const walk = (value, where) => {
    if (Array.isArray(value)) {
      value.forEach((one, index) => walk(one, `${where}[${index}]`));
    }
    else if (value && typeof value === "object") {
      for (const [key, one] of Object.entries(value)) {
        if (wanted.has(key) || [...key.matchAll(/\d+/g)].some(match => wanted.has(match[0]))) {
          found.push(`${where} key ${key}`);
        }
        walk(one, `${where}.${key}`);
      }
    }
    else if (wanted.has(String(value)) || (typeof value === "string" && [...value.matchAll(/\d+/g)].some(match => wanted.has(match[0])))) {
      found.push(`${where} = ${String(value).slice(0, 80)}`);
    }
  };
  for (const {name} of db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT IN ('content_id_moves', 'chat_log', 'mod_log', 'stats_online', 'stats_logins', 'stats_sessions')").all()) {
    for (const row of db.prepare(`SELECT * FROM "${name}"`).all()) {
      const id = row.username || row.id || row.key || "";
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
        if (!(value instanceof Uint8Array)) {
          walk(parsed, `${name}(${id}).${column}`);
        }
      }
    }
  }
  return found;
};

const main = async () => {
  await defpacks.init();
  accounts.load();
  require("../lib/customitems.js").load();
  const db = accounts.database();
  const before = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'content_id_moves'").get()
    ? db.prepare("SELECT COUNT(*) AS n FROM content_id_moves").get().n : 0;
  console.log("--- the server's content loading, on the copy:");
  require("../lib/contentpacks.js").load();
  console.log("---");
  const moves = db.prepare("SELECT old, new FROM content_id_moves ORDER BY old").all();
  console.log(`ids moved now: ${moves.length - before} (in all: ${moves.length})`);
  for (const move of moves.slice(0, 3)) {
    console.log(`  e.g. ${move.old} -> ${move.new}`);
  }
  const old = moves.map(move => move.old);
  const left = old.length ? findAnywhere(db, old) : [];
  // a number that is not a den item (gems, clothing, a time) can be the
  // same as an old id: listed for a look, not a fault
  const denLeft = left.filter(where => /\.denItems\[|\.denLayouts\[|\.denUndo\.|den_prefabs|den:/.test(where));
  console.log(`den items still on an old id: ${denLeft.length}`);
  for (const where of denLeft.slice(0, 20)) {
    console.log(`  ${where}`);
  }
  const other = left.filter(where => !denLeft.includes(where));
  if (other.length) {
    console.log(`other places with the same number as an old id (to look at; gems, clothing and such are fine): ${other.length}`);
    for (const where of other.slice(0, 20)) {
      console.log(`  ${where}`);
    }
  }
  db.close();
  fs.rmSync(dir, {recursive: true, force: true});
  console.log(denLeft.length ? "NOT OK" : "ok: the copy is deleted, the database named was not changed");
  process.exitCode = denLeft.length ? 1 : 0;
};

main().catch(err => {
  console.error(err);
  fs.rmSync(dir, {recursive: true, force: true});
  process.exitCode = 1;
});
