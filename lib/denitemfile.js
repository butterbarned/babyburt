"use strict";

const zlib = require("zlib");

// makes a den item's file (what the game fetches as items/<defId << 16 |
// iconId>) from a picture, for the content shop's items (lib/contentpacks.js).
// unlike a custom item's picture (lib/itemart.js), which the client fits in
// 160 px, this is the game's own kind of item, so it is drawn at its full
// size, flipped as the game flips any item, and sorted as any item is.
//
// what the client does with the file (loader/DenItemHelper, room/DenItemHolder):
//  - it is AMF3, read with readObject: {so, ba, ...}. `ba` is a SWF it
//    loads; `so` its sort offset. (the game's own files also have r, cx, cy
//    and v, which the client never reads; they are copied for likeness.)
//  - the SWF's root is a MovieClip with a sprite named "item1" in it (the
//    game's art has that name; some of the client's code looks for it).
//  - the den stands it on its spot from the content's width and height:
//    its left by half its width, its top by its height. so the picture's top
//    left is the SWF's (0, 0), and its bottom edge is where it meets the floor.
//  - an item with no "flip" frame label is flipped by mirroring it, which
//    is what a picture wants.
//  - items are put in depth order by their bottom less `so`: `so` is how far
//    above its bottom edge its "sort line" is. an avatar standing below that
//    line is drawn in front of it.
//  - the same file is the item's icon in the shop and the inventory.

// ---- PNG reading --------------------------------------------------------

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
const MAX_SIDE = 2048;

const paeth = (a, b, c) => {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};

// a PNG (not interlaced; any colour type; 8-bit, or 1/2/4-bit palette or
// grey) as {width, height, pixels}: RGBA, 4 bytes a pixel, rows top down.
// throws when it is not one this reads.
const decodePng = data => {
  if (!Buffer.isBuffer(data) || data.length < 33 || !data.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error("not a PNG");
  }
  let at = 8;
  let header = null;
  let palette = null;
  let transparency = null;
  const idat = [];
  while (at + 12 <= data.length) {
    const length = data.readUInt32BE(at);
    const type = data.toString("latin1", at + 4, at + 8);
    const body = data.subarray(at + 8, at + 8 + length);
    if (body.length !== length) {
      throw new Error("PNG cut short");
    }
    if (type === "IHDR") {
      header = {width: body.readUInt32BE(0), height: body.readUInt32BE(4), depth: body[8], colour: body[9], interlace: body[12]};
    }
    else if (type === "PLTE") {
      palette = body;
    }
    else if (type === "tRNS") {
      transparency = body;
    }
    else if (type === "IDAT") {
      idat.push(body);
    }
    else if (type === "IEND") {
      break;
    }
    at += 12 + length;
  }
  if (!header) {
    throw new Error("PNG without a header");
  }
  const {width, height, depth, colour, interlace} = header;
  if (width < 1 || height < 1 || width > MAX_SIDE || height > MAX_SIDE) {
    throw new Error(`PNG ${width}x${height} is not 1 to ${MAX_SIDE} px a side`);
  }
  if (interlace !== 0) {
    throw new Error("interlaced PNG");
  }
  const channels = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[colour];
  if (!channels || (depth !== 8 && !((colour === 3 || colour === 0) && [1, 2, 4].includes(depth)))) {
    throw new Error(`PNG colour type ${colour} at ${depth} bits is not read`);
  }
  if (colour === 3 && !palette) {
    throw new Error("palette PNG without a palette");
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bitsPerPixel = channels * depth;
  const stride = Math.ceil(width * bitsPerPixel / 8);
  const step = Math.max(1, bitsPerPixel >> 3); // bytes back to "a" for the filters
  if (raw.length < (stride + 1) * height) {
    throw new Error("PNG data cut short");
  }
  const rows = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const out = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= step ? rows[out + x - step] : 0;
      const b = y > 0 ? rows[out - stride + x] : 0;
      const c = x >= step && y > 0 ? rows[out - stride + x - step] : 0;
      const value = line[x];
      rows[out + x] = filter === 0 ? value : filter === 1 ? value + a : filter === 2 ? value + b
        : filter === 3 ? value + ((a + b) >> 1) : filter === 4 ? value + paeth(a, b, c) : (() => {
          throw new Error(`PNG filter ${filter}`);
        })();
    }
  }
  const pixels = Buffer.alloc(width * height * 4);
  const sample = (y, x) => {
    // the x-th sample of a row of `depth`-bit samples
    if (depth === 8) {
      return rows[y * stride + x];
    }
    const perByte = 8 / depth;
    const byte = rows[y * stride + Math.floor(x / perByte)];
    return (byte >> ((perByte - 1 - (x % perByte)) * depth)) & ((1 << depth) - 1);
  };
  const greyKey = colour === 0 && transparency && transparency.length >= 2 ? transparency.readUInt16BE(0) : -1;
  const rgbKey = colour === 2 && transparency && transparency.length >= 6
    ? [transparency.readUInt16BE(0), transparency.readUInt16BE(2), transparency.readUInt16BE(4)] : null;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      let r;
      let g;
      let b;
      let alpha = 255;
      if (colour === 3) {
        const index = sample(y, x);
        if (index * 3 + 2 >= palette.length) {
          throw new Error("PNG palette index out of range");
        }
        [r, g, b] = [palette[index * 3], palette[index * 3 + 1], palette[index * 3 + 2]];
        alpha = transparency && index < transparency.length ? transparency[index] : 255;
      }
      else if (colour === 0) {
        const value = sample(y, x);
        r = g = b = depth === 8 ? value : Math.round(value * 255 / ((1 << depth) - 1));
        alpha = value === greyKey ? 0 : 255;
      }
      else {
        const s = y * stride + x * channels;
        if (colour === 4) {
          r = g = b = rows[s];
          alpha = rows[s + 1];
        }
        else {
          [r, g, b] = [rows[s], rows[s + 1], rows[s + 2]];
          alpha = colour === 6 ? rows[s + 3] : rgbKey && r === rgbKey[0] && g === rgbKey[1] && b === rgbKey[2] ? 0 : 255;
        }
      }
      pixels[o] = r;
      pixels[o + 1] = g;
      pixels[o + 2] = b;
      pixels[o + 3] = alpha;
    }
  }
  return {width, height, pixels};
};

// ---- SWF writing ----------------------------------------------------------

class Bits {
  constructor() {
    this.bytes = [];
    this.acc = 0;
    this.count = 0;
  }

  // `value` in `n` bits, high bit first (a negative one as two's complement)
  put(value, n) {
    for (let i = n - 1; i >= 0; i--) {
      this.acc = (this.acc << 1) | ((value >>> i) & 1);
      if (++this.count === 8) {
        this.bytes.push(this.acc);
        this.acc = 0;
        this.count = 0;
      }
    }
  }

  align() {
    if (this.count > 0) {
      this.put(0, 8 - this.count);
    }
  }

  buffer() {
    this.align();
    return Buffer.from(this.bytes);
  }
}

// bits a signed value needs
const signedBits = value => {
  let n = 1;
  while (value < -(2 ** (n - 1)) || value >= 2 ** (n - 1)) {
    n++;
  }
  return n;
};

const rect = (xMin, xMax, yMin, yMax) => {
  const bits = new Bits();
  const n = Math.max(...[xMin, xMax, yMin, yMax].map(signedBits));
  bits.put(n, 5);
  for (const value of [xMin, xMax, yMin, yMax]) {
    bits.put(value, n);
  }
  return bits.buffer();
};

const tag = (code, body = Buffer.alloc(0)) => {
  if (body.length < 63) {
    const head = Buffer.alloc(2);
    head.writeUInt16LE((code << 6) | body.length);
    return Buffer.concat([head, body]);
  }
  const head = Buffer.alloc(6);
  head.writeUInt16LE((code << 6) | 0x3F);
  head.writeUInt32LE(body.length, 2);
  return Buffer.concat([head, body]);
};

const u16 = value => {
  const out = Buffer.alloc(2);
  out.writeUInt16LE(value);
  return out;
};

const TWIPS = 20;
const BITMAP_ID = 1;
const SHAPE_ID = 2;
const SPRITE_ID = 3;

// DefineBitsLossless2: 32-bit ARGB, the colours multiplied by alpha
const bitmapTag = ({width, height, pixels}) => {
  const argb = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const alpha = pixels[i * 4 + 3];
    argb[i * 4] = alpha;
    argb[i * 4 + 1] = Math.round(pixels[i * 4] * alpha / 255);
    argb[i * 4 + 2] = Math.round(pixels[i * 4 + 1] * alpha / 255);
    argb[i * 4 + 3] = Math.round(pixels[i * 4 + 2] * alpha / 255);
  }
  const head = Buffer.alloc(7);
  head.writeUInt16LE(BITMAP_ID, 0);
  head[2] = 5;
  head.writeUInt16LE(width, 3);
  head.writeUInt16LE(height, 5);
  return tag(36, Buffer.concat([head, zlib.deflateSync(argb, {level: 9})]));
};

// DefineShape: a w x h rectangle at (0, 0) filled with the bitmap, one twip
// a twentieth of a pixel, so one bitmap pixel a pixel. a clipped,
// smoothed fill (0x41): the icon and the shop draw it smaller.
const shapeTag = (width, height) => {
  const w = width * TWIPS;
  const h = height * TWIPS;
  const bits = new Bits();
  // the fill styles: one bitmap fill
  bits.put(1, 8);
  bits.put(0x41, 8);
  bits.put(BITMAP_ID & 0xFF, 8);
  bits.put(BITMAP_ID >> 8, 8);
  // its matrix: scale 20 each way (16.16 fixed), no rotation, no move
  const scale = TWIPS * 65536;
  const scaleBits = signedBits(scale);
  bits.put(1, 1);
  bits.put(scaleBits, 5);
  bits.put(scale, scaleBits);
  bits.put(scale, scaleBits);
  bits.put(0, 1);
  bits.put(1, 5);
  bits.put(0, 1);
  bits.put(0, 1);
  bits.align();
  // no line styles; one bit for a fill style index, none for a line's
  bits.put(0, 8);
  bits.put(1, 4);
  bits.put(0, 4);
  // move to (0, 0) with fill style 1 (the fill on the right of each edge)
  bits.put(0, 1); // a style change
  bits.put(0, 1); // new styles
  bits.put(0, 1); // line style
  bits.put(1, 1); // fill style 1
  bits.put(0, 1); // fill style 0
  bits.put(1, 1); // move to
  bits.put(1, 5);
  bits.put(0, 1);
  bits.put(0, 1);
  bits.put(1, 1); // fill style 1 is the first
  // clockwise on screen (y down): right along the top, down, left, up
  for (const [dx, dy] of [[w, 0], [0, h], [-w, 0], [0, -h]]) {
    const n = Math.max(2, signedBits(dx || dy));
    bits.put(1, 1); // an edge
    bits.put(1, 1); // straight
    bits.put(n - 2, 4);
    bits.put(0, 1); // not a general line: one way only
    bits.put(dx === 0 ? 1 : 0, 1); // vertical?
    bits.put(dx || dy, n);
  }
  bits.put(0, 6); // the end
  return tag(2, Buffer.concat([u16(SHAPE_ID), rect(0, w, 0, h), bits.buffer()]));
};

// PlaceObject2 of `id` at `depth`, with `name` if given
const placeTag = (id, depth, name = null) => {
  const flags = 0x02 | (name ? 0x20 : 0);
  const parts = [Buffer.from([flags]), u16(depth), u16(id)];
  if (name) {
    parts.push(Buffer.from(`${name}\0`, "utf8"));
  }
  return tag(26, Buffer.concat(parts));
};

const SHOW_FRAME = tag(1);
const END = tag(0);
const SWF_VERSION = 10;

// the SWF of a picture: its RGBA pixels in a sprite named "item1", the
// picture's top left at (0, 0)
const swfOf = image => {
  const {width, height} = image;
  const sprite = Buffer.concat([u16(SPRITE_ID), u16(1), placeTag(SHAPE_ID, 1), SHOW_FRAME, END]);
  const body = Buffer.concat([
    rect(0, width * TWIPS, 0, height * TWIPS),
    Buffer.from([0x00, 0x18]), // 24 frames a second, as the game's items
    u16(1),
    tag(69, Buffer.from([0x08, 0, 0, 0])), // ActionScript 3, no code
    tag(9, Buffer.from([0xFF, 0xFF, 0xFF])),
    tag(86, Buffer.from([0x01, 0x00, ...Buffer.from("Scene 1", "latin1"), 0x00, 0x00])),
    bitmapTag(image),
    shapeTag(width, height),
    tag(39, sprite),
    placeTag(SPRITE_ID, 1, "item1"),
    SHOW_FRAME,
    END,
  ]);
  const head = Buffer.alloc(8);
  head.write("CWS", 0, "latin1");
  head[3] = SWF_VERSION;
  head.writeUInt32LE(8 + body.length, 4);
  return Buffer.concat([head, zlib.deflateSync(body, {level: 9})]);
};

// ---- the AMF3 wrapper -----------------------------------------------------

const u29 = value => {
  const v = value & 0x1FFFFFFF;
  if (v < 0x80) {
    return Buffer.from([v]);
  }
  if (v < 0x4000) {
    return Buffer.from([(v >> 7) | 0x80, v & 0x7F]);
  }
  if (v < 0x200000) {
    return Buffer.from([(v >> 14) | 0x80, ((v >> 7) & 0x7F) | 0x80, v & 0x7F]);
  }
  return Buffer.from([(v >> 22) | 0x80, ((v >> 15) & 0x7F) | 0x80, ((v >> 8) & 0x7F) | 0x80, v & 0xFF]);
};
const amfName = text => Buffer.concat([u29((Buffer.byteLength(text) << 1) | 1), Buffer.from(text, "utf8")]);
const amfInt = value => Buffer.concat([Buffer.from([0x04]), u29(value)]);
const amfBytes = data => Buffer.concat([Buffer.from([0x0C]), u29((data.length << 1) | 1), data]);
const amfString = text => Buffer.concat([Buffer.from([0x06]), amfName(text)]);

// what the game's own files carry beside so and ba (never read by the client)
const GAME_R = 10;
const GAME_V = 84217857;

// {so, ba, r, cx, cy, v} as an anonymous dynamic AMF3 object, and `extra`'s
// fields as strings: "lpa", a LINE PLAY item's animation and music
// (lib/contentpacks.js animSpec), which loader.DenItemHelper reads
const wrap = (swf, sortOffset, extra = {}) => {
  const fields = [["r", amfInt(GAME_R)], ["cx", amfInt(0)], ["cy", amfInt(0)], ["so", amfInt(sortOffset)], ["v", amfInt(GAME_V)],
    ...Object.entries(extra).filter(([, value]) => value).map(([name, value]) => [name, amfString(String(value))]), ["ba", amfBytes(swf)]];
  return Buffer.concat([Buffer.from([0x0A, 0x0B, 0x01]), ...fields.flatMap(([name, value]) => [amfName(name), value]), Buffer.from([0x01])]);
};

// a den item's file from a PNG. `sortOffset`: pixels above the picture's
// bottom edge that the den sorts it by (0: its bottom edge). `extra`: more
// string fields for the wrapper (see wrap).
const fromPng = (png, sortOffset = 0, extra = {}) => {
  const image = decodePng(png);
  const so = Math.max(0, Math.min(image.height, Math.round(Number(sortOffset) || 0)));
  return wrap(swfOf(image), so, extra);
};

module.exports = {fromPng, decodePng, swfOf, wrap};
