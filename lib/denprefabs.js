"use strict";

const crypto = require("crypto");
const accounts = require("./accounts.js");

// den prefabs: items laid out together, which a player saves from their den
// and puts down again as a group, anywhere, in any den of theirs (the den
// editor's prefab tab, gui.DenPrefabs). a prefab's items are [def, version,
// x, y, flip]: where each stands from the prefab's middle, and the item's
// saved flip value (DenItemHolder: its flips, player depth and layer nudge;
// its group and lock are not kept, a prefab coming down as one new group).
// the picture is a small PNG the game drew of it, served at
// /denprefab/<id>.png.
//
// a prefab can be shared: it gets a code that anyone can type in to copy it
// to their own prefabs, for as long as it is there to copy.

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS den_prefabs (
    id         TEXT PRIMARY KEY,
    owner      INTEGER NOT NULL,
    name       TEXT NOT NULL,
    items      TEXT NOT NULL,
    thumb      BLOB,
    code       TEXT UNIQUE,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS den_prefabs_owner ON den_prefabs (owner, created_at);
`;

const MAX_PREFABS = 50; // per account
const MAX_ITEMS = 200; // per prefab
const MAX_NAME = 30;
const MAX_THUMB = 48 * 1024;
const MAX_OFFSET = 5000; // pixels from the prefab's middle
const MAX_VERSION = 1023;
const MAX_FLIP = 0x7fffffff;
const ID_PATTERN = /^[0-9a-f]{16}$/;
// no 0/O, 1/I/L: a code is read off a screen and typed in
const CODE_LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const db = () => accounts.database();
const now = () => Math.floor(Date.now() / 1000);

const load = () => db().exec(SCHEMA);

// a name as it is kept: one line, no control characters or the game
// message's own separator, at most MAX_NAME long.
const cleanName = text => String(text === undefined ? "" : text)
  .replace(/[\u0000-\u001f\u007f%]/g, " ").replace(/\s+/g, " ").trim().slice(0, MAX_NAME);

const isInt = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;

// items as sent ([def, version, x, y, flip]...), checked; null when any is
// wrong. `isDenItem` (def) -> boolean says what may be in a prefab.
const cleanItems = (rows, isDenItem) => {
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > MAX_ITEMS) {
    return null;
  }
  const items = rows.map(row => row.map(Number));
  const ok = items.every(([def, version, x, y, flip]) => isDenItem(def) && isInt(version, 0, MAX_VERSION)
    && isInt(x, -MAX_OFFSET, MAX_OFFSET) && isInt(y, -MAX_OFFSET, MAX_OFFSET) && isInt(flip, 0, MAX_FLIP));
  return ok ? items : null;
};

const thumbOf = base64 => {
  if (!base64) {
    return null;
  }
  const bytes = Buffer.from(String(base64), "base64");
  return bytes.length <= MAX_THUMB && bytes.subarray(0, 8).equals(PNG_SIGNATURE) ? bytes : null;
};

const row = (id, account) => db().prepare("SELECT * FROM den_prefabs WHERE id = ? AND owner = ?").get(String(id), account.id);

const summary = entry => ({id: entry.id, name: entry.name, count: JSON.parse(entry.items).length, hasThumb: Boolean(entry.thumb), code: entry.code || ""});

// the account's prefabs, oldest first: [{id, name, count, hasThumb, code}].
const list = account => db().prepare("SELECT * FROM den_prefabs WHERE owner = ? ORDER BY created_at, rowid").all(account.id).map(summary);

const count = account => db().prepare("SELECT COUNT(*) AS count FROM den_prefabs WHERE owner = ?").get(account.id).count;

// one of the account's prefabs with its items, or null.
const get = (account, id) => {
  const entry = ID_PATTERN.test(String(id)) ? row(id, account) : null;
  return entry ? {...summary(entry), items: JSON.parse(entry.items)} : null;
};

const insert = (account, name, items, thumb) => {
  const id = crypto.randomBytes(8).toString("hex");
  db().prepare("INSERT INTO den_prefabs (id, owner, name, items, thumb, code, created_at) VALUES (?, ?, ?, ?, ?, NULL, ?)")
    .run(id, account.id, name, JSON.stringify(items), thumb, now());
  return id;
};

// saves a new prefab. returns {id} or {error}.
const save = (account, {name, items, thumb}, isDenItem) => {
  const kept = cleanName(name);
  const checked = cleanItems(items, isDenItem);
  if (!kept) {
    return {error: "Give it a name."};
  }
  if (!checked) {
    return {error: `A prefab holds 1 to ${MAX_ITEMS} items.`};
  }
  if (count(account) >= MAX_PREFABS) {
    return {error: `You have ${MAX_PREFABS} prefabs already. Delete one first.`};
  }
  return {id: insert(account, kept, checked, thumbOf(thumb))};
};

const rename = (account, id, name) => {
  const kept = cleanName(name);
  if (!kept || !get(account, id)) {
    return null;
  }
  db().prepare("UPDATE den_prefabs SET name = ? WHERE id = ? AND owner = ?").run(kept, String(id), account.id);
  return kept;
};

// a copy of one's own prefab, "<name> copy". returns {id, name} or {error}.
const duplicate = (account, id) => {
  const entry = ID_PATTERN.test(String(id)) ? row(id, account) : null;
  if (!entry) {
    return {error: "That prefab is not there any more."};
  }
  if (count(account) >= MAX_PREFABS) {
    return {error: `You have ${MAX_PREFABS} prefabs already. Delete one first.`};
  }
  const name = cleanName(`${entry.name.slice(0, MAX_NAME - 5).trim()} copy`);
  return {id: insert(account, name, JSON.parse(entry.items), entry.thumb), name};
};

const remove = (account, id) => get(account, id) !== null
  && db().prepare("DELETE FROM den_prefabs WHERE id = ? AND owner = ?").run(String(id), account.id).changes > 0;

const newCode = () => {
  for (;;) {
    const bytes = crypto.randomBytes(CODE_LENGTH);
    const code = Array.from(bytes, byte => CODE_LETTERS[byte % CODE_LETTERS.length]).join("");
    if (!db().prepare("SELECT 1 FROM den_prefabs WHERE code = ?").get(code)) {
      return code;
    }
  }
};

// the prefab's share code (made the first time it is shared), or null.
const share = (account, id) => {
  const entry = get(account, id);
  if (!entry) {
    return null;
  }
  if (entry.code) {
    return entry.code;
  }
  const code = newCode();
  db().prepare("UPDATE den_prefabs SET code = ? WHERE id = ? AND owner = ?").run(code, entry.id, account.id);
  return code;
};

// what is typed in, as a code is kept: capitals, no spaces or dashes.
const cleanCode = text => String(text === undefined ? "" : text).toUpperCase().replace(/[\s-]/g, "");

// copies the prefab with that code to the account's own. returns {id, name}
// or {error}. `isDenItem` leaves out items the server has no more.
const importCode = (account, code, isDenItem) => {
  const wanted = cleanCode(code);
  const entry = wanted.length === CODE_LENGTH ? db().prepare("SELECT * FROM den_prefabs WHERE code = ?").get(wanted) : null;
  if (!entry) {
    return {error: "There is no prefab with that code. Check it and try again."};
  }
  if (entry.owner === account.id) {
    return {error: "That prefab is one of yours already."};
  }
  if (count(account) >= MAX_PREFABS) {
    return {error: `You have ${MAX_PREFABS} prefabs already. Delete one first.`};
  }
  const items = JSON.parse(entry.items).filter(([def]) => isDenItem(def));
  if (items.length === 0) {
    return {error: "None of that prefab's items are in the game any more."};
  }
  return {id: insert(account, entry.name, items, entry.thumb), name: entry.name};
};

// a prefab's picture (for /denprefab/<id>.png), or null.
const thumb = id => {
  const entry = ID_PATTERN.test(String(id)) ? db().prepare("SELECT thumb FROM den_prefabs WHERE id = ?").get(String(id)) : null;
  return entry && entry.thumb ? entry.thumb : null;
};

// an account deleted for good: its prefabs go with it (lib/erase.js).
const forget = account => db().prepare("DELETE FROM den_prefabs WHERE owner = ?").run(account.id);

module.exports = {MAX_PREFABS, MAX_ITEMS, MAX_NAME, MAX_VERSION, load, list, get, save, rename, duplicate, remove, share, importCode, thumb, forget, cleanName};
