"use strict";

// end to end: a LINE PLAY content item's animation and music
// (lib/contentpacks.js, tools/content/lineplay/animate.py). its item file
// says what they are ("lpa", for loader.ContentAnim); /itemanim/ and
// /itemsound/ serve them, and nothing else; an animation that does not add
// up is left out; and how a placed one plays (its version, set from the
// layers panel with "dvc") is kept.

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const harness = require("./harness.js");
const amf3 = require("../lib/amf3.js");
const cdn = require("../lib/cdn.js");

const HTTP_PORT = 18111;
const GAME_PORT = 19379;
const BASE = `http://127.0.0.1:${HTTP_PORT}`;
const TOWNSHIP = "jamaa_township.room_main#1";
const {postJson} = harness;

// a 1x1 transparent PNG, standing in for the pictures
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
const MP3 = Buffer.from("ID3\u0003\u0000\u0000\u0000\u0000\u0000\u0000not really music", "latin1");

const contentDir = fs.mkdtempSync(path.join(os.tmpdir(), "aj-content-"));
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "aj-test-"));
process.env.AJ_CONTENT_DIR = contentDir;

const ANIM = {frames: 2, cols: 2, w: 1, h: 1, x: -3, y: -4, ms: [100, 250]};
const ITEMS = [
  {key: "MUSIC_BOX", name: "Music Box", anim: {image: "anims/MUSIC_BOX.png", ...ANIM}, sound: "sounds/MUSIC_BOX.mp3"},
  {key: "JUKEBOX", name: "Jukebox", sound: "sounds/JUKEBOX.mp3"},
  {key: "PLAIN", name: "Plain Table"},
  // one frame time short: left out
  {key: "BROKEN", name: "Broken Fountain", anim: {image: "anims/BROKEN.png", ...ANIM, ms: [100]}},
  // out of the pack's folder: left out
  {key: "OUTSIDE", name: "Outside Lamp", anim: {image: "../elsewhere.png", ...ANIM}, sound: "../elsewhere.mp3"},
];

const writePack = () => {
  const dir = path.join(contentDir, "lineplay");
  for (const sub of ["images", "anims", "sounds"]) {
    fs.mkdirSync(path.join(dir, sub), {recursive: true});
  }
  for (const item of ITEMS) {
    fs.writeFileSync(path.join(dir, `images/${item.key}.png`), PNG);
  }
  fs.writeFileSync(path.join(dir, "anims/MUSIC_BOX.png"), PNG);
  fs.writeFileSync(path.join(dir, "anims/BROKEN.png"), PNG);
  fs.writeFileSync(path.join(dir, "sounds/MUSIC_BOX.mp3"), MP3);
  fs.writeFileSync(path.join(dir, "sounds/JUKEBOX.mp3"), MP3);
  fs.writeFileSync(path.join(contentDir, "elsewhere.png"), PNG);
  fs.writeFileSync(path.join(dir, "pack.json"), JSON.stringify({
    id: "lineplay", name: "LINE PLAY", price: 100, groups: [], categories: [{id: "decor", name: "Decor"}], collections: [],
    items: ITEMS.map(item => ({image: `images/${item.key}.png`, width: 1, height: 1, so: 0, placement: "floor", category: "decor", ...item})),
  }));
};

const itemFile = async id => {
  const file = await fetch(`${BASE}/${cdn.hashedPath(`items/${((id << 16) | 1) >>> 0}`)}`);
  assert.strictEqual(file.status, 200);
  return amf3.decode(Buffer.from(await file.arrayBuffer()));
};

const run = async () => {
  const response = await fetch(`${BASE}/api/register`, {method: "POST", headers: {"Content-Type": "application/json"},
    body: JSON.stringify({username: "Lina", password: "KettlePass01", avatarType: 1, agreed: true})});
  assert.strictEqual(response.status, 200);
  const auth = await (await postJson(`${BASE}/authenticate`, {username: "Lina", password: "KettlePass01"})).json();
  const client = new harness.GameClient(GAME_PORT);
  await client.connect();
  assert.strictEqual((await client.logIn("Lina", auth.auth_token)).status, "1");
  client.xt("rj", 1, TOWNSHIP, 1, 0, 0);
  const roomId = (await client.untilXt("rj"))[4];
  await client.untilXt("rp");

  client.xt("dcq", roomId, "", "", "", 0, "");
  const reply = await client.untilXt("dcq");
  const ids = Object.fromEntries(JSON.parse(reply[6]).map(item => [item.name, item.id]));
  assert.strictEqual(Object.keys(ids).length, 5);

  // --- the item files: what each has
  const box = await itemFile(ids["Music Box"]);
  const [frames, cols, w, h, x, y, ms, music, tag] = String(box.lpa).split("|");
  assert.deepStrictEqual([frames, cols, w, h, x, y, ms, music], ["2", "2", "1", "1", "-3", "-4", "100,250", "1"]);
  assert.match(tag, /^[0-9a-z]+$/);
  assert.strictEqual(Buffer.from(box.ba).toString("latin1", 0, 3), "CWS");
  assert.match(String((await itemFile(ids.Jukebox)).lpa), /^0\|0\|0\|0\|0\|0\|\|1\|[0-9a-z]+$/, "music and no frames");
  for (const name of ["Plain Table", "Broken Fountain", "Outside Lamp"]) {
    assert.strictEqual((await itemFile(ids[name])).lpa, undefined, `${name} has nothing to play`);
  }

  // --- the frames and music, and nothing else
  const sheet = await fetch(`${BASE}/itemanim/den/${ids["Music Box"]}.png?v=${tag}`);
  assert.strictEqual(sheet.status, 200);
  assert.strictEqual(sheet.headers.get("content-type"), "image/png");
  assert.ok(Buffer.from(await sheet.arrayBuffer()).equals(PNG));
  const song = await fetch(`${BASE}/itemsound/den/${ids["Music Box"]}.mp3`);
  assert.strictEqual(song.status, 200);
  assert.strictEqual(song.headers.get("content-type"), "audio/mpeg");
  assert.ok(Buffer.from(await song.arrayBuffer()).equals(MP3));
  assert.strictEqual((await fetch(`${BASE}/itemsound/den/${ids.Jukebox}.mp3`)).status, 200);
  for (const address of [`itemanim/den/${ids.Jukebox}.png`, `itemanim/den/${ids["Plain Table"]}.png`, `itemanim/den/${ids["Broken Fountain"]}.png`,
    `itemanim/den/${ids["Outside Lamp"]}.png`, `itemsound/den/${ids["Outside Lamp"]}.mp3`, `itemanim/den/${ids["Music Box"]}.mp3`,
    `itemsound/den/${ids["Music Box"]}.png`, "itemanim/den/158.png"]) {
    assert.strictEqual((await fetch(`${BASE}/${address}`)).status, 404, address);
  }

  // --- how a placed one plays: kept in its version ("dvc")
  client.xt("dcb", roomId, 1, ids["Music Box"], 1);
  // "di": [inv, def, spot, version, ...] for each item, 9 fields
  const rowOf = (di, test) => {
    for (let i = 5; i + 8 < di.length; i += 9) {
      if (test(di.slice(i, i + 9))) {
        return di.slice(i, i + 9);
      }
    }
    return null;
  };
  const bought = rowOf(await client.untilXt("di"), row => Number(row[1]) === ids["Music Box"]);
  assert.strictEqual((await client.untilXt("dcb"))[2], "1");
  assert.ok(bought, "the music box is had");
  const inv = Number(bought[0]);
  assert.strictEqual(bought[3], "0", "a new one plays on click, with its music");
  client.xt("dvc", roomId, inv, 5); // on hover (1), music off (4)
  assert.deepStrictEqual((await client.untilXt("dvc")).slice(2), ["1", String(inv), "5"]);
  client.xt("di", roomId);
  const kept = rowOf(await client.untilXt("di"), row => Number(row[0]) === inv);
  assert.ok(kept, "the music box is still had");
  assert.strictEqual(kept[3], "5", "its version is kept");
  client.socket.destroy();
  await new Promise(resolve => setTimeout(resolve, 1500));
};

(async () => {
  writePack();
  await harness.withServer("content animation test", HTTP_PORT, GAME_PORT, run, {dataDir});
})().catch(err => {
  console.error(err);
  process.exitCode = 1;
}).finally(() => {
  fs.rmSync(contentDir, {recursive: true, force: true});
  fs.rmSync(dataDir, {recursive: true, force: true, maxRetries: 10, retryDelay: 200});
});
