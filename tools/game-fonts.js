"use strict";

// makes the font files a browser player needs (/account/play, Ruffle): the
// game's text asks for its fonts by name ("CCDigitalDeliveryBold",
// "TikiIsland"...), as the desktop client has them, and Ruffle finds a font
// only by the name inside its file. so each font is written again under each
// name the game uses for it, into public/fonts/game/, with a list
// (fonts.json) that public/game.html hands to Ruffle.
//
//   node tools/game-fonts.js
//
// CCDigitalDelivery comes from public/fonts (the whole font); the others are
// taken out of swf/sharedFonts.swf by JPEXS (tools/ffdec, needs Java).

const {execFileSync} = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const root = path.join(__dirname, "..");
const out = path.join(root, "public", "fonts", "game");

// [file it comes from, name the game asks for, bold]
const FONTS = [
  ["public/fonts/CCDigitalDelivery-Regular.otf", "CCDigitalDeliveryRegular", false],
  ["public/fonts/CCDigitalDelivery-Bold.otf", "CCDigitalDeliveryRegular", true],
  ["public/fonts/CCDigitalDelivery-Regular.otf", "CCDigitalDelivery-Regular", false],
  ["public/fonts/CCDigitalDelivery-Regular.otf", "CCDigitalDelivery", false],
  ["public/fonts/CCDigitalDelivery-Bold.otf", "CCDigitalDelivery", true],
  ["public/fonts/CCDigitalDelivery-Bold.otf", "CCDigitalDeliveryBold", false],
  ["public/fonts/CCDigitalDelivery-Bold.otf", "CCDigitalDeliveryBold", true],
  ["sharedFonts:TikiIsland", "TikiIsland", false],
  ["sharedFonts:TikiIsland", "Tiki Island", false],
  ["sharedFonts:TikiIsland", "TikiIsland-Regular", false],
  ["sharedFonts:GiantSizedSpectacularStdBBRegular", "GiantSizedSpectacular Std BB", false],
  ["sharedFonts:GiantSizedSpectacularStdBBRegular", "GiantSizedSpectacularStdBBRegular", false],
];

// the fonts in sharedFonts.swf, as TTF files, by their class name
const fromSharedFonts = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "game-fonts-"));
  try {
    execFileSync("java", ["-jar", path.join(root, "tools", "ffdec", "ffdec-cli.jar"), "-format", "font:ttf", "-export", "font", dir,
      path.join(root, "swf", "sharedFonts.swf")], {stdio: "ignore"});
    const found = {};
    for (const file of fs.readdirSync(dir)) {
      // JPEXS names them "<id>_<class>_<font name>.ttf"
      const match = /^\d+_([^_]+)_/.exec(file);
      if (match) {
        found[match[1]] = fs.readFileSync(path.join(dir, file));
      }
    }
    return found;
  }
  finally {
    fs.rmSync(dir, {recursive: true, force: true});
  }
};

// the tables of an OpenType/TrueType file: {tag: Buffer}, and its version
const readFont = font => {
  const tables = {};
  for (let i = 0; i < font.readUInt16BE(4); i++) {
    const at = 12 + i * 16;
    const offset = font.readUInt32BE(at + 8);
    tables[font.toString("latin1", at, at + 4)] = Buffer.from(font.subarray(offset, offset + font.readUInt32BE(at + 12)));
  }
  return {version: font.readUInt32BE(0), tables};
};

const checksum = data => {
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    sum = (sum + ((data[i] << 24 | (data[i + 1] || 0) << 16 | (data[i + 2] || 0) << 8 | (data[i + 3] || 0)) >>> 0)) >>> 0;
  }
  return sum;
};

const writeFont = ({version, tables}) => {
  const tags = Object.keys(tables).sort();
  let shift = 0;
  while (1 << (shift + 1) <= tags.length) {
    shift++;
  }
  const head = Buffer.alloc(12 + tags.length * 16);
  head.writeUInt32BE(version, 0);
  head.writeUInt16BE(tags.length, 4);
  head.writeUInt16BE(16 << shift, 6);
  head.writeUInt16BE(shift, 8);
  head.writeUInt16BE(tags.length * 16 - (16 << shift), 10);
  const parts = [head];
  let offset = head.length;
  tags.forEach((tag, i) => {
    const data = tables[tag];
    const at = 12 + i * 16;
    head.write(tag, at, "latin1");
    head.writeUInt32BE(checksum(data), at + 4);
    head.writeUInt32BE(offset, at + 8);
    head.writeUInt32BE(data.length, at + 12);
    const padded = Buffer.alloc((data.length + 3) & ~3);
    data.copy(padded);
    parts.push(padded);
    offset += padded.length;
  });
  const font = Buffer.concat(parts);
  // head.checkSumAdjustment, over the whole file
  const headAt = font.readUInt32BE(12 + tags.indexOf("head") * 16 + 8);
  font.writeUInt32BE(0, headAt + 8);
  font.writeUInt32BE((0xB1B0AFBA - checksum(font)) >>> 0, headAt + 8);
  return font;
};

// a name table that calls the font `name`, `bold` or not
const nameTable = (name, bold) => {
  const style = bold ? "Bold" : "Regular";
  // the full name (4) too is the name alone: Ruffle may find a font by it,
  // telling bold from not by the style bits
  const strings = {1: name, 2: style, 4: name, 6: (bold ? `${name}-Bold` : name).replace(/[^\x21-\x7e]/g, ""), 16: name, 17: style};
  const records = [];
  const data = [];
  let offset = 0;
  // Windows (3, 1, en-US), UTF-16BE; and Mac (1, 0, English), Latin-1
  for (const [platform, encoding, language, encode] of [[1, 0, 0, s => Buffer.from(s, "latin1")],
    [3, 1, 0x409, s => Buffer.from(s, "utf16le").swap16()]]) {
    for (const id of Object.keys(strings).map(Number).sort((a, b) => a - b)) {
      const bytes = encode(strings[id]);
      records.push([platform, encoding, language, id, bytes.length, offset]);
      data.push(bytes);
      offset += bytes.length;
    }
  }
  const table = Buffer.alloc(6 + records.length * 12);
  table.writeUInt16BE(0, 0);
  table.writeUInt16BE(records.length, 2);
  table.writeUInt16BE(table.length, 4);
  records.forEach((record, i) => record.forEach((value, j) => table.writeUInt16BE(value, 6 + i * 12 + j * 2)));
  return Buffer.concat([table, ...data]);
};

const renamed = (source, name, bold) => {
  const font = readFont(source);
  font.tables.name = nameTable(name, bold);
  // the style bits: OS/2 fsSelection (bold 0x20, regular 0x40) and head macStyle (bold 1)
  if (font.tables["OS/2"]) {
    const os2 = font.tables["OS/2"];
    os2.writeUInt16BE((os2.readUInt16BE(62) & ~0x61) | (bold ? 0x20 : 0x40), 62);
    os2.writeUInt16BE(bold ? 700 : 400, 4);
  }
  const head = font.tables.head;
  head.writeUInt16BE((head.readUInt16BE(44) & ~1) | (bold ? 1 : 0), 44);
  return writeFont(font);
};

const main = () => {
  const shared = FONTS.some(([from]) => from.startsWith("sharedFonts:")) ? fromSharedFonts() : {};
  fs.rmSync(out, {recursive: true, force: true});
  fs.mkdirSync(out, {recursive: true});
  const list = [];
  for (const [from, name, bold] of FONTS) {
    const source = from.startsWith("sharedFonts:") ? shared[from.slice("sharedFonts:".length)] : fs.readFileSync(path.join(root, from));
    if (!source) {
      throw new Error(`${from} not found`);
    }
    const kind = source.readUInt32BE(0) === 0x4f54544f ? "otf" : "ttf";
    const file = `${name.replace(/ /g, "_").replace(/[^A-Za-z0-9_-]/g, "")}${bold ? "-Bold" : ""}.${kind}`;
    fs.writeFileSync(path.join(out, file), renamed(source, name, bold));
    list.push(`/fonts/game/${file}`);
  }
  fs.writeFileSync(path.join(out, "fonts.json"), JSON.stringify(list, null, 2) + "\n");
  console.log(`${list.length} fonts in ${path.relative(root, out)}`);
};

main();
