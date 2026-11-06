"use strict";

// the content shop's den items: a picture made into a den item file of the
// game's own kind (lib/denitemfile.js), and served in place of a den item's
// art from the test folder (lib/contentpacks.js).

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const zlib = require("zlib");

const contentDir = fs.mkdtempSync(path.join(os.tmpdir(), "content-"));
process.env.AJ_CONTENT_DIR = contentDir;

const amf3 = require("../lib/amf3.js");
const cdn = require("../lib/cdn.js");
const denItemFile = require("../lib/denitemfile.js");
const contentPacks = require("../lib/contentpacks.js");

// ---- PNGs to read -----------------------------------------------------------

const crcTable = Array.from({length: 256}, (unused, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});
const crc = buffer => {
  let c = 0xFFFFFFFF;
  for (const byte of buffer) {
    c = crcTable[(c ^ byte) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
};
const chunk = (type, body) => {
  const head = Buffer.alloc(4);
  head.writeUInt32BE(body.length);
  const typed = Buffer.concat([Buffer.from(type, "latin1"), body]);
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE(crc(typed));
  return Buffer.concat([head, typed, tail]);
};
// a PNG of `rows` (each row's bytes, unfiltered), filtered row by row with
// `filters` (cycled), so that every filter is read
const png = (width, height, colour, depth, rows, extra = [], filters = [0, 1, 2, 3, 4]) => {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = depth;
  header[9] = colour;
  const step = Math.max(1, ({0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[colour] * depth) >> 3);
  const out = [];
  rows.forEach((row, y) => {
    const filter = filters[y % filters.length];
    const prior = y > 0 ? rows[y - 1] : Buffer.alloc(row.length);
    const line = Buffer.alloc(row.length);
    for (let x = 0; x < row.length; x++) {
      const a = x >= step ? row[x - step] : 0;
      const b = prior[x];
      const c = x >= step ? prior[x - step] : 0;
      const p = a + b - c;
      const predictor = filter === 0 ? 0 : filter === 1 ? a : filter === 2 ? b : filter === 3 ? (a + b) >> 1
        : (Math.abs(p - a) <= Math.abs(p - b) && Math.abs(p - a) <= Math.abs(p - c) ? a : Math.abs(p - b) <= Math.abs(p - c) ? b : c);
      line[x] = (row[x] - predictor) & 0xFF;
    }
    out.push(Buffer.from([filter]), line);
  });
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), chunk("IHDR", header), ...extra,
    chunk("IDAT", zlib.deflateSync(Buffer.concat(out))), chunk("IEND", Buffer.alloc(0))]);
};

// ---- reading an item file back ----------------------------------------------

// the tags of a SWF's body: [{code, body}], and the frame size in pixels
const readSwf = swf => {
  assert.strictEqual(swf.toString("latin1", 0, 3), "CWS");
  const body = zlib.inflateSync(swf.subarray(8));
  assert.strictEqual(swf.readUInt32LE(4), 8 + body.length, "the header says the SWF's length");
  const bits = body[0] >> 3;
  const rectBytes = Math.ceil((5 + bits * 4) / 8);
  const field = index => {
    let value = 0;
    for (let i = 0; i < bits; i++) {
      const at = 5 + index * bits + i;
      value = (value << 1) | ((body[at >> 3] >> (7 - (at & 7))) & 1);
    }
    return value;
  };
  const size = {width: field(1) / 20, height: field(3) / 20};
  const tags = [];
  let at = rectBytes + 4;
  while (at < body.length) {
    const head = body.readUInt16LE(at);
    let length = head & 0x3F;
    at += 2;
    if (length === 0x3F) {
      length = body.readUInt32LE(at);
      at += 4;
    }
    tags.push({code: head >> 6, body: body.subarray(at, at + length)});
    at += length;
  }
  return {size, tags};
};

const run = () => {
  // an RGBA picture 3 x 2: half see-through red, see-through, blue / white, green, black
  const rgba = png(3, 2, 6, 8, [
    Buffer.from([255, 0, 0, 128, 0, 0, 0, 0, 0, 0, 255, 255]),
    Buffer.from([255, 255, 255, 255, 0, 255, 0, 255, 0, 0, 0, 255]),
  ]);
  const image = denItemFile.decodePng(rgba);
  assert.deepStrictEqual([image.width, image.height], [3, 2]);
  assert.deepStrictEqual([...image.pixels], [255, 0, 0, 128, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 0, 255, 0, 255, 0, 0, 0, 255]);

  // a palette picture at 2 bits, its first colour see-through (as the Resortopia ones)
  const palette = chunk("PLTE", Buffer.from([0, 0, 0, 10, 20, 30, 200, 100, 50]));
  const trns = chunk("tRNS", Buffer.from([0, 255, 128]));
  const indexed = denItemFile.decodePng(png(5, 2, 3, 2, [Buffer.from([0b00011000, 0b01000000]), Buffer.from([0b10101010, 0b00000000])], [palette, trns]));
  assert.deepStrictEqual([...indexed.pixels.subarray(0, 20)], [0, 0, 0, 0, 10, 20, 30, 255, 200, 100, 50, 128, 0, 0, 0, 0, 10, 20, 30, 255]);
  assert.deepStrictEqual([...indexed.pixels.subarray(20, 24)], [200, 100, 50, 128]);
  // grey with alpha, and RGB with a see-through colour
  assert.deepStrictEqual([...denItemFile.decodePng(png(1, 1, 4, 8, [Buffer.from([90, 40])])).pixels], [90, 90, 90, 40]);
  const keyed = denItemFile.decodePng(png(2, 1, 2, 8, [Buffer.from([1, 2, 3, 4, 5, 6])], [chunk("tRNS", Buffer.from([0, 1, 0, 2, 0, 3]))]));
  assert.deepStrictEqual([...keyed.pixels], [1, 2, 3, 0, 4, 5, 6, 255]);
  assert.throws(() => denItemFile.decodePng(Buffer.from("not a png")), /not a PNG/);

  // the item file: AMF3 as the game's, with its sort offset and SWF
  const item = amf3.decode(denItemFile.fromPng(rgba, 1));
  assert.deepStrictEqual(Object.keys(item), ["r", "cx", "cy", "so", "v", "ba"]);
  assert.strictEqual(item.so, 1);
  assert.strictEqual(amf3.decode(denItemFile.fromPng(rgba, 99)).so, 2, "the sort offset is kept inside the picture");
  const {size, tags} = readSwf(Buffer.from(item.ba));
  assert.deepStrictEqual(size, {width: 3, height: 2}, "the stage is the picture's size");
  assert.deepStrictEqual(tags.map(one => one.code), [69, 9, 86, 36, 2, 39, 26, 1, 0]);
  // the bitmap: 32-bit, its colours multiplied by alpha
  const bitmap = tags.find(one => one.code === 36).body;
  assert.deepStrictEqual([bitmap.readUInt16LE(0), bitmap[2], bitmap.readUInt16LE(3), bitmap.readUInt16LE(5)], [1, 5, 3, 2]);
  const argb = zlib.inflateSync(bitmap.subarray(7));
  assert.deepStrictEqual([...argb.subarray(0, 8)], [128, 128, 0, 0, 0, 0, 0, 0]);
  // the sprite on the root is named item1
  const place = tags.filter(one => one.code === 26).pop().body;
  assert.strictEqual(place[0], 0x22);
  assert.strictEqual(place.toString("utf8", 5, place.length - 1), "item1");

  // the test folder: <defId>.png stands in for that item's art, for every iconId
  assert.strictEqual(contentPacks.fileFor(cdn.hashedPath(`items/${(1520 << 16) | 1}`)), null);
  fs.mkdirSync(path.join(contentDir, "_test"));
  fs.writeFileSync(path.join(contentDir, "_test", "1520_so7.png"), rgba);
  fs.writeFileSync(path.join(contentDir, "_test", "notes.txt"), "not a picture");
  // it is looked at again after a little while
  const later = Date.now() + 2500;
  while (Date.now() < later) {
    // wait
  }
  for (const low of [1, 2, 3, 104]) {
    const served = contentPacks.fileFor(cdn.hashedPath(`items/${((1520 << 16) | low) >>> 0}`));
    assert.ok(served, `items/1520<<16|${low} is served`);
    assert.strictEqual(amf3.decode(served).so, 2, "the sort offset from the name, kept inside the picture");
  }
  assert.strictEqual(contentPacks.fileFor(cdn.hashedPath(`items/${(1521 << 16) | 1}`)), null);
  assert.strictEqual(contentPacks.fileFor(cdn.hashedPath("defPacks/1030")), null);

  fs.rmSync(contentDir, {recursive: true, force: true});
  console.log("content items: ok");
};

run();
