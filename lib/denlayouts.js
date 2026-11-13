"use strict";

const crypto = require("crypto");
const accounts = require("./accounts.js");

// whole den layouts to share (the den editor's prefab tab, gui.DenShare;
// the messages are in lib/dens.js): a den as it stands, as rows of
// [def, version, x, y, flip, cat] (flip the item's saved flip value, cat its
// placement category), and the kind of den it was laid out in.
//
// a layout leaves as a file (the game makes it from the rows and a
// signature) or as a code (the rows kept here, den_layout_shares). a code,
// or a file as this server wrote it, is a den that was: what the player has
// none of is given to them free, as a prefab's is. a file changed after it
// was written (its signature no longer fits) is laid out with the player's
// own items only: no one makes items for nothing by writing a file.

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS den_layout_shares (
    code       TEXT PRIMARY KEY,
    owner      INTEGER NOT NULL,
    name       TEXT NOT NULL,
    den        INTEGER NOT NULL,
    items      TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS den_layout_shares_owner ON den_layout_shares (owner, created_at);
`;

const MAX_ITEMS = 1500; // per layout: 1500 rows are some 45 KB as sent, under lib/sfs.js MAX_MESSAGE
const MAX_SHARES = 20; // codes per account: the oldest goes when a new one would be one too many
const MAX_NAME = 30;
const MAX_VERSION = 1023;
const MAX_COORD = 20000;
const MAX_FLIP = 0x7fffffff;
const MIN_FLIP = -0x80000000; // bit 31 is part of an item's size (DenItemHolder SIZE_HIGH)
const MAX_CAT = 0xffff;
const KEY_SETTING = "denLayoutKey";
// no 0/O, 1/I/L: a code is read off a screen and typed in
const CODE_LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;

const db = () => accounts.database();
const now = () => Math.floor(Date.now() / 1000);

const load = () => db().exec(SCHEMA);

const cleanName = text => String(text === undefined ? "" : text)
  .replace(/[\u0000-\u001f\u007f%]/g, " ").replace(/\s+/g, " ").trim().slice(0, MAX_NAME);

const isInt = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;

// the rows of `values` (flat, as sent: count first), checked: null when
// anything is wrong. `isDenItem` (def) -> boolean: what may be in a layout.
const readRows = (values, isDenItem) => {
  const count = Number(values[0]);
  if (!isInt(count, 1, MAX_ITEMS) || values.length < 1 + count * 6) {
    return null;
  }
  const rows = [];
  for (let index = 0; index < count; index++) {
    const row = values.slice(1 + index * 6, 7 + index * 6).map(value => Number(value));
    const [def, version, x, y, flip, cat] = row;
    if (!isDenItem(def) || !isInt(version, 0, MAX_VERSION) || !isInt(x, -MAX_COORD, MAX_COORD) || !isInt(y, -MAX_COORD, MAX_COORD)
      || !isInt(flip, MIN_FLIP, MAX_FLIP) || !isInt(cat, 0, MAX_CAT)) {
      return null;
    }
    rows.push(row);
  }
  return rows;
};

// the server's own key for signing files, made the first time
const key = () => {
  let value = accounts.setting(KEY_SETTING);
  if (!value) {
    value = crypto.randomBytes(32).toString("hex");
    accounts.setSetting(KEY_SETTING, value);
  }
  return value;
};

// a layout's signature: whether a file is as this server wrote it
const sign = (den, rows) => crypto.createHmac("sha256", key())
  .update(`${Number(den)}|${rows.map(row => row.join(",")).join(";")}`).digest("hex").slice(0, 32);

const signed = (den, rows, signature) => {
  const want = Buffer.from(sign(den, rows));
  const got = Buffer.from(String(signature || ""));
  return got.length === want.length && crypto.timingSafeEqual(got, want);
};

const newCode = () => {
  for (;;) {
    const bytes = crypto.randomBytes(CODE_LENGTH);
    const code = Array.from(bytes, byte => CODE_LETTERS[byte % CODE_LETTERS.length]).join("");
    if (!db().prepare("SELECT 1 FROM den_layout_shares WHERE code = ?").get(code)) {
      return code;
    }
  }
};

// a code for the layout, kept until the account has MAX_SHARES newer ones
const share = (account, name, den, rows) => {
  const code = newCode();
  db().prepare("INSERT INTO den_layout_shares (code, owner, name, den, items, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(code, account.id, cleanName(name) || "My den", Number(den), JSON.stringify(rows), now());
  const old = db().prepare("SELECT code FROM den_layout_shares WHERE owner = ? ORDER BY created_at DESC, rowid DESC").all(account.id).slice(MAX_SHARES);
  for (const {code: gone} of old) {
    db().prepare("DELETE FROM den_layout_shares WHERE code = ?").run(gone);
  }
  return code;
};

// the layout of a code ({name, den, rows}), or null. rows of items the
// game has no more are left out.
const byCode = (code, isDenItem) => {
  const clean = String(code || "").toUpperCase().replace(/[\s-]/g, "");
  if (!/^[A-Z0-9]{4,16}$/.test(clean)) {
    return null;
  }
  const entry = db().prepare("SELECT * FROM den_layout_shares WHERE code = ?").get(clean);
  if (!entry) {
    return null;
  }
  let rows = [];
  try {
    rows = JSON.parse(entry.items).filter(row => Array.isArray(row) && isDenItem(Number(row[0])));
  }
  catch {
    rows = [];
  }
  return {name: entry.name, den: entry.den, rows};
};

const forget = account => db().prepare("DELETE FROM den_layout_shares WHERE owner = ?").run(account.id);

module.exports = {MAX_ITEMS, MAX_SHARES, MAX_NAME, load, cleanName, readRows, sign, signed, share, byCode, forget};
