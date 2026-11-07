"use strict";

// fetches Ruffle, the Flash player for browsers, into config.ruffleDir
// (cache/ruffle), for playing in a browser (/account/play). one release,
// checked against its hash: the server hands these files to every player.
//
//   node tools/fetch-ruffle.js
//
// to move to another release, change RELEASE and SHA256 together (the hash is
// the zip's: `sha256sum ruffle-*-web-selfhosted.zip`), run this, and try the
// game in a browser before putting it on a server.

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const config = require("../config.js");

const RELEASE = "nightly-2026-11-04";
const FILE = "ruffle-nightly-2026_11_04-web-selfhosted.zip";
const SHA256 = "90889cf1ee5ce1e92255e8bfd86e7c81e19d82e4115a615e568e15b526527575";
const URL_OF = `https://github.com/ruffle-rs/ruffle/releases/download/${RELEASE}/${FILE}`;

// the entries of a zip, read from its central directory: {name: Buffer}.
const unzip = zip => {
  const end = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (end < 0) {
    throw new Error("not a zip");
  }
  const count = zip.readUInt16LE(end + 10);
  let at = zip.readUInt32LE(end + 16);
  const files = {};
  for (let i = 0; i < count; i++) {
    if (zip.readUInt32LE(at) !== 0x02014b50) {
      throw new Error("bad zip directory");
    }
    const method = zip.readUInt16LE(at + 10);
    const size = zip.readUInt32LE(at + 20);
    const nameLength = zip.readUInt16LE(at + 28);
    const extraLength = zip.readUInt16LE(at + 30);
    const commentLength = zip.readUInt16LE(at + 32);
    const local = zip.readUInt32LE(at + 42);
    const name = zip.toString("utf8", at + 46, at + 46 + nameLength);
    at += 46 + nameLength + extraLength + commentLength;
    if (name.endsWith("/")) {
      continue;
    }
    const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
    const data = zip.subarray(start, start + size);
    files[name] = method === 0 ? data : method === 8 ? zlib.inflateRawSync(data) : null;
    if (!files[name]) {
      throw new Error(`${name}: unknown compression ${method}`);
    }
  }
  return files;
};

const main = async () => {
  console.log(`fetching ${URL_OF}`);
  const res = await fetch(URL_OF);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const zip = Buffer.from(await res.arrayBuffer());
  const hash = crypto.createHash("sha256").update(zip).digest("hex");
  if (hash !== SHA256) {
    throw new Error(`hash ${hash} is not the one expected (${SHA256})`);
  }
  const files = unzip(zip);
  // the player and its licences (MIT or Apache 2.0), which go where it goes
  const wanted = Object.keys(files).filter(name => /^[\w.-]+$/.test(name) && (/\.(js|wasm)$/.test(name) || /^LICENSE_/.test(name)));
  if (!wanted.includes("ruffle.js")) {
    throw new Error("no ruffle.js in the zip");
  }
  // a fresh folder, so no file of an older release is left being served
  const temporary = `${config.ruffleDir}.new`;
  fs.rmSync(temporary, {recursive: true, force: true});
  fs.mkdirSync(temporary, {recursive: true});
  for (const name of wanted) {
    fs.writeFileSync(path.join(temporary, name), files[name]);
  }
  fs.writeFileSync(path.join(temporary, "VERSION"), `${RELEASE}\n`);
  fs.rmSync(config.ruffleDir, {recursive: true, force: true});
  fs.renameSync(temporary, config.ruffleDir);
  console.log(`Ruffle ${RELEASE} is in ${config.ruffleDir} (${wanted.join(", ")})`);
};

main().catch(err => {
  console.error(`could not fetch Ruffle: ${err.message}`);
  process.exit(1);
});
