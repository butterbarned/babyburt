"use strict";

// end to end: the content shop (lib/contentshop.js) and its packs
// (lib/contentpacks.js). a pack in a folder of its own is read at start; its
// items get ids from 55000 and keep them when the pack is read again; the
// catalog, searching and paging; buying a cart (all of it or nothing); the
// item files made from the pictures; the item finder not finding them; and
// an item gone from the pack going off sale while its owner keeps it.

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const harness = require("./harness.js");
const amf3 = require("../lib/amf3.js");
const cdn = require("../lib/cdn.js");

const HTTP_PORT = 18107;
const GAME_PORT = 19375;
const BASE = `http://127.0.0.1:${HTTP_PORT}`;
const TOWNSHIP = "jamaa_township.room_main#1";
const {postJson} = harness;

// a 1x1 transparent PNG
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");

const contentDir = fs.mkdtempSync(path.join(os.tmpdir(), "aj-content-"));
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "aj-test-"));
process.env.AJ_CONTENT_DIR = contentDir;

const writePack = items => {
  const dir = path.join(contentDir, "testpack");
  fs.mkdirSync(path.join(dir, "images"), {recursive: true});
  for (const item of items) {
    fs.writeFileSync(path.join(dir, `images/${item.key}.png`), PNG);
  }
  fs.writeFileSync(path.join(dir, "pack.json"), JSON.stringify({
    id: "testpack", name: "Test Pack", price: 100, groups: ["Garden", "Festivals"],
    categories: [{id: "seating", name: "Seating"}, {id: "windows", name: "Windows"}, {id: "rugs", name: "Rugs"}],
    collections: [{id: "set-a", name: "Set A", group: "Garden", kind: "set"}, {id: "set-b", name: "Set B", group: "Garden", kind: "set"},
      {id: "xmas", name: "Christmas", group: "Festivals", kind: "festival"}],
    items: items.map(item => ({image: `images/${item.key}.png`, width: 1, height: 1, so: 0, tags: [], ...item})),
  }));
};

const CHAIR = {key: "SIT_1", name: "Hearts Chair", placement: "floor", category: "seating", collections: ["set-a"], tags: ["Garden"], so: 1};
const WINDOW = {key: "PENDANT_1", name: "Moonlit Window", placement: "wall", category: "windows", collections: ["set-a", "xmas"]};
const RUG = {key: "CARPET_1", name: "Dream Cloud", placement: "rug", category: "rugs", collections: ["set-b"], nameCn: "梦幻云"};
const PRICEY = {key: "GOLD_1", name: "Golden Throne", placement: "floor", category: "seating", collections: ["set-b"], price: 1000000};
const BROKEN = {key: "BAD_1", name: "Floating Thing", placement: "sky", category: "seating", collections: ["set-a"]};
const LATER = {key: "SIT_2", name: "Basket Chair", placement: "floor", category: "seating", collections: ["set-a"]};

const arrive = async username => {
  const auth = await (await postJson(`${BASE}/authenticate`, {username, password: "KettlePass01"})).json();
  const client = new harness.GameClient(GAME_PORT);
  await client.connect();
  assert.strictEqual((await client.logIn(username, auth.auth_token)).status, "1");
  client.xt("rj", 1, TOWNSHIP, 1, 0, 0);
  const roomId = (await client.untilXt("rj"))[4];
  await client.untilXt("rp");
  return {client, roomId};
};

const query = async (client, roomId, collection = "", category = "", text = "", page = 0, pageSize = "") => {
  client.xt("dcq", roomId, collection, category, text, page, pageSize);
  const reply = await client.untilXt("dcq");
  assert.strictEqual(reply[2], "1", reply.join("%"));
  return {total: Number(reply[3]), page: Number(reply[4]), pageSize: Number(reply[5]), items: JSON.parse(reply[6])};
};

// DenXtCommManager.denItemsResponse: the den item defs, nine fields an item
const denDefs = fields => {
  const defs = [];
  for (let i = 5; i < fields.length; i += 9) {
    defs.push(Number(fields[i + 1]));
  }
  return defs;
};

const ids = {};

const firstRun = async () => {
  const response = await fetch(`${BASE}/api/register`, {method: "POST", headers: {"Content-Type": "application/json"},
    body: JSON.stringify({username: "Cara", password: "KettlePass01", avatarType: 1, agreed: true})});
  assert.strictEqual(response.status, 200);
  const {client, roomId} = await arrive("Cara");

  // --- the catalog: what is on sale (not the broken one), by collection and category
  client.xt("dcc", roomId);
  const dcc = await client.untilXt("dcc");
  assert.strictEqual(dcc[2], "1");
  const catalog = JSON.parse(dcc[3]);
  assert.deepStrictEqual(catalog.packs, [{id: "testpack", name: "Test Pack", price: 100}]);
  assert.deepStrictEqual(catalog.groups, ["Garden", "Festivals"]);
  assert.deepStrictEqual(catalog.collections.map(c => [c.id, c.count]), [["testpack:set-a", 2], ["testpack:set-b", 2], ["testpack:xmas", 1]]);
  assert.deepStrictEqual(catalog.categories.map(c => [c.id, c.count]), [["seating", 2], ["windows", 1], ["rugs", 1]]);

  // --- searching
  const all = await query(client, roomId);
  assert.strictEqual(all.total, 4);
  for (const item of all.items) {
    ids[item.name] = item.id;
    assert.ok(item.id >= 55000 && item.id <= 65535, `${item.name} has a content id`);
  }
  assert.strictEqual(new Set(Object.values(ids)).size, 4);
  assert.deepStrictEqual(all.items.find(item => item.name === "Hearts Chair"),
    {id: ids["Hearts Chair"], name: "Hearts Chair", cost: 100, placement: "floor", w: 1, h: 1, cat: "seating", cols: ["testpack:set-a"]});
  assert.strictEqual(all.items.find(item => item.name === "Golden Throne").cost, 1000000);
  assert.deepStrictEqual((await query(client, roomId, "testpack:set-a")).items.map(item => item.name).sort(), ["Hearts Chair", "Moonlit Window"]);
  assert.deepStrictEqual((await query(client, roomId, "", "seating")).items.map(item => item.name).sort(), ["Golden Throne", "Hearts Chair"]);
  assert.deepStrictEqual((await query(client, roomId, "", "", "moonlit WIN")).items.map(item => item.name), ["Moonlit Window"]);
  assert.deepStrictEqual((await query(client, roomId, "", "", "梦幻")).items.map(item => item.name), ["Dream Cloud"], "found by its Chinese name");
  assert.deepStrictEqual((await query(client, roomId, "", "", "garden")).items.map(item => item.name), ["Hearts Chair"], "found by a tag");
  assert.strictEqual((await query(client, roomId, "testpack:xmas", "seating")).total, 0);
  // a page past the end is the last page
  const late = await query(client, roomId, "", "", "", 99);
  assert.strictEqual(late.page, 0);
  // pages of a size asked for
  const small = await query(client, roomId, "", "", "", 1, 3);
  assert.deepStrictEqual([small.total, small.page, small.pageSize, small.items.length], [4, 1, 3, 1]);

  // --- the item files: made from the picture, for every icon id and placed category
  for (const low of [1, 2]) {
    const file = await fetch(`${BASE}/${cdn.hashedPath(`items/${((ids["Hearts Chair"] << 16) | low) >>> 0}`)}`);
    assert.strictEqual(file.status, 200);
    const item = amf3.decode(Buffer.from(await file.arrayBuffer()));
    assert.strictEqual(item.so, 1);
    assert.strictEqual(Buffer.from(item.ba).toString("latin1", 0, 3), "CWS");
  }

  // --- not in the item finder
  const finder = await (await fetch(`${BASE}/api/search?kind=den&q=hearts+chair`)).json();
  assert.ok(!finder.results.some(result => result.id === ids["Hearts Chair"]), "the item finder does not find it");

  // --- refused carts: nothing changes
  const refused = async (...cart) => {
    client.xt("dcb", roomId, ...cart);
    const reply = await client.untilXt("dcb");
    assert.strictEqual(reply[2], "0", reply.join("%"));
    return reply[3];
  };
  assert.match(await refused(1, ids["Golden Throne"], 20), /^That costs 20000000 gems; you have \d+\.$/);
  assert.match(await refused(1, 999, 1), /can't be bought/);
  assert.match(await refused(1, ids["Hearts Chair"], 21), /can't be bought/);
  assert.match(await refused(2, ids["Hearts Chair"], 1), /can't be bought/); // fewer fields than it says
  assert.match(await refused(0), /can't be bought/);

  // --- bought: two chairs and a rug, the den items and gems sent first
  client.xt("dcb", roomId, 2, ids["Hearts Chair"], 2, ids["Dream Cloud"], 1);
  const di = await client.untilXt("di");
  const cu = await client.untilXt("cu");
  const bought = await client.untilXt("dcb");
  assert.deepStrictEqual(bought.slice(2, 6), ["1", "300", cu[3], "3"]);
  assert.strictEqual(cu[2], "0");
  assert.deepStrictEqual(bought.slice(6).map(Number).sort(), [ids["Hearts Chair"], ids["Hearts Chair"], ids["Dream Cloud"]].sort());
  const owned = denDefs(di);
  assert.strictEqual(owned.filter(def => def === ids["Hearts Chair"]).length, 2);
  assert.strictEqual(owned.filter(def => def === ids["Dream Cloud"]).length, 1);
  // the gems went down by the cost
  client.xt("dcb", roomId, 1, ids["Golden Throne"], 20);
  const left = Number(/you have (\d+)/.exec((await client.untilXt("dcb"))[3])[1]);
  assert.strictEqual(left, Number(cu[3]));
  client.socket.destroy();
  // accounts are written within a second (lib/accounts.js SAVE_DELAY_MS);
  // the test stops the server without letting it write what is waiting
  await new Promise(resolve => setTimeout(resolve, 2000));
};

const secondRun = async () => {
  const {client, roomId} = await arrive("Cara");
  const all = await query(client, roomId);
  const now = Object.fromEntries(all.items.map(item => [item.name, item.id]));
  // the same ids as before; the window, gone from the pack, is off sale; the new chair has an id of its own
  assert.deepStrictEqual(Object.keys(now).sort(), ["Basket Chair", "Dream Cloud", "Golden Throne", "Hearts Chair"]);
  for (const name of ["Dream Cloud", "Golden Throne", "Hearts Chair"]) {
    assert.strictEqual(now[name], ids[name], `${name} keeps its id`);
  }
  assert.ok(!Object.values(ids).includes(now["Basket Chair"]));
  client.xt("dcb", roomId, 1, ids["Moonlit Window"], 1);
  assert.deepStrictEqual((await client.untilXt("dcb")).slice(2), ["0", "Moonlit Window isn't sold any more."]);
  // its file is still there for whoever has one
  const file = await fetch(`${BASE}/${cdn.hashedPath(`items/${((ids["Moonlit Window"] << 16) | 2) >>> 0}`)}`);
  assert.strictEqual(file.status, 200);
  // and what was bought is still had
  client.xt("di", roomId);
  const owned = denDefs(await client.untilXt("di"));
  assert.strictEqual(owned.filter(def => def === ids["Hearts Chair"]).length, 2);
  client.socket.destroy();
};

(async () => {
  writePack([CHAIR, WINDOW, RUG, PRICEY, BROKEN]);
  await harness.withServer("content shop test", HTTP_PORT, GAME_PORT, firstRun, {dataDir});
  writePack([CHAIR, RUG, PRICEY, LATER]);
  await harness.withServer("content shop test (the pack made again)", HTTP_PORT, GAME_PORT, secondRun, {dataDir});
})().catch(err => {
  console.error(err);
  process.exitCode = 1;
}).finally(() => {
  fs.rmSync(contentDir, {recursive: true, force: true});
  fs.rmSync(dataDir, {recursive: true, force: true, maxRetries: 10, retryDelay: 200});
});
