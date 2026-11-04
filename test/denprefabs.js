"use strict";

// end-to-end check of den prefabs (lib/denprefabs.js, the den handlers in
// lib/dens.js): saving, listing, renaming, sharing by code, copying,
// deleting, the missing items given free, the picture, and recolouring a
// den item. simulated players, a real server.

const assert = require("assert");
const harness = require("./harness.js");

const HTTP_PORT = 18103;
const GAME_PORT = 19371;
const BASE = `http://127.0.0.1:${HTTP_PORT}`;
const TOWNSHIP = "jamaa_township.room_main#1";
const {postJson} = harness;

// a 1x1 transparent PNG
const PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

const arrive = async username => {
  const auth = await (await postJson(`${BASE}/authenticate`, {username, password: "KettlePass01"})).json();
  const client = new harness.GameClient(GAME_PORT);
  await client.connect();
  const login = await client.logIn(username, auth.auth_token);
  assert.strictEqual(login.status, "1");
  client.xt("rj", 1, TOWNSHIP, 1, 0, 0);
  const roomId = (await client.untilXt("rj"))[4];
  await client.untilXt("rp");
  client.xt("au", roomId, 1, 400, 400, 14, 1);
  return {client, roomId};
};

// DenXtCommManager.denItemsResponse as [{inv, def, placed, version}], nine fields an item.
const denItems = fields => {
  const items = [];
  for (let i = 5; i < fields.length; i += 9) {
    items.push({inv: fields[i], def: fields[i + 1], placed: fields[i + 2], version: fields[i + 3]});
  }
  return items;
};

const run = async () => {
  for (const username of ["Ann", "Ben"]) {
    const response = await fetch(`${BASE}/api/register`, {method: "POST", headers: {"Content-Type": "application/json"},
      body: JSON.stringify({username, password: "KettlePass01", avatarType: 1, agreed: true})});
    assert.strictEqual(response.status, 200);
  }
  const {client: a, roomId} = await arrive("Ann");
  const {client: b, roomId: benRoom} = await arrive("Ben");

  a.xt("gl", roomId, 9);
  const shop = await a.untilXt("gl");
  const [chair, table] = [shop[9], shop[10]];
  assert.ok(chair && table && chair !== table);

  // --- nothing yet
  a.xt("dpl", roomId);
  assert.deepStrictEqual((await a.untilXt("dpl")).slice(2), ["1", "0"]);

  // --- refused: no name, no items, an item that is no den item
  a.xt("dps", roomId, "", "", 1, chair, 0, 0, 0, 0);
  assert.deepStrictEqual((await a.untilXt("dps")).slice(2), ["0", "Give it a name."]);
  a.xt("dps", roomId, "Nook", "", 0);
  assert.strictEqual((await a.untilXt("dps"))[2], "0");
  a.xt("dps", roomId, "Nook", "", 1, 999999, 0, 0, 0, 0);
  assert.strictEqual((await a.untilXt("dps"))[2], "0");

  // --- saved: two chairs (one in colour 2) and a table, with a picture
  a.xt("dps", roomId, "  Reading   nook ", PNG, 3, chair, 0, -40, 10, 1, chair, 2, 40, 10, 0, table, 0, 0, 0, 4 | 2 << 16);
  const saved = await a.untilXt("dps");
  assert.strictEqual(saved[2], "1");
  const id = saved[3];
  assert.match(id, /^[0-9a-f]{16}$/);
  assert.strictEqual(saved[4], "Reading nook");
  a.xt("dpl", roomId);
  assert.deepStrictEqual((await a.untilXt("dpl")).slice(2), ["1", "1", id, "Reading nook", "3", "1", ""]);
  a.xt("dpo", roomId, id);
  assert.deepStrictEqual((await a.untilXt("dpo")).slice(2),
    ["1", id, "Reading nook", "3", chair, "0", "-40", "10", "1", chair, "2", "40", "10", "0", table, "0", "0", "0", String(4 | 2 << 16)]);

  // the picture is there for the game to load; another id is not
  const picture = await fetch(`${BASE}/denprefab/${id}.png`);
  assert.strictEqual(picture.status, 200);
  assert.strictEqual(picture.headers.get("content-type"), "image/png");
  assert.deepStrictEqual(Buffer.from(await picture.arrayBuffer()), Buffer.from(PNG, "base64"));
  assert.strictEqual((await fetch(`${BASE}/denprefab/0123456789abcdef.png`)).status, 404);

  // --- the missing items, given free: Ann has none of them
  a.xt("dpg", roomId, id);
  const given = denItems(await a.untilXt("di"));
  assert.deepStrictEqual((await a.untilXt("dpg")).slice(2), ["1", "3", "0"]);
  assert.deepStrictEqual(given.map(item => [item.def, item.version]).sort(), [[chair, "0"], [chair, "2"], [table, "0"]].sort());
  // and asked again, nothing more: they are hers and not in her den
  a.xt("dpg", roomId, id);
  assert.deepStrictEqual((await a.untilXt("dpg")).slice(2), ["1", "0", "0"]);

  // --- recolouring a den item of her own
  const plainChair = given.find(item => item.def === chair && item.version === "0");
  a.xt("dvc", roomId, plainChair.inv, 5);
  assert.deepStrictEqual((await a.untilXt("dvc")).slice(2), ["1", plainChair.inv, "5"]);
  a.xt("di", roomId);
  assert.strictEqual(denItems(await a.untilXt("di")).find(item => item.inv === plainChair.inv).version, "5");
  a.xt("dvc", roomId, 999999, 1); // not hers
  assert.strictEqual((await a.untilXt("dvc"))[2], "0");
  a.xt("dvc", roomId, plainChair.inv, -1);
  assert.strictEqual((await a.untilXt("dvc"))[2], "0");
  // now she has no plain chair free, so one is given again
  a.xt("dpg", roomId, id);
  await a.untilXt("di");
  assert.deepStrictEqual((await a.untilXt("dpg")).slice(2), ["1", "1", "0"]);

  // --- renamed; Ben cannot touch it
  a.xt("dpn", roomId, id, "Cosy corner");
  assert.deepStrictEqual((await a.untilXt("dpn")).slice(2), ["1", id, "Cosy corner"]);
  b.xt("dpn", benRoom, id, "Mine now");
  assert.strictEqual((await b.untilXt("dpn"))[2], "0");
  b.xt("dpo", benRoom, id);
  assert.strictEqual((await b.untilXt("dpo"))[2], "0");
  b.xt("dpd", benRoom, id);
  assert.strictEqual((await b.untilXt("dpd"))[2], "0");

  // --- duplicated: a copy of her own, "<name> copy"; Ben cannot
  b.xt("dpc", benRoom, id);
  assert.strictEqual((await b.untilXt("dpc"))[2], "0");
  a.xt("dpc", roomId, id);
  const twin = await a.untilXt("dpc");
  assert.strictEqual(twin[2], "1");
  assert.notStrictEqual(twin[3], id);
  assert.strictEqual(twin[4], "Cosy corner copy");
  a.xt("dpo", roomId, twin[3]);
  assert.strictEqual((await a.untilXt("dpo"))[5], "3");
  a.xt("dpd", roomId, twin[3]);
  assert.strictEqual((await a.untilXt("dpd"))[2], "1");

  // --- den items duplicated in the editor: two tables wanted, one free
  a.xt("ddg", roomId, 2, table, 0, table, 0);
  await a.untilXt("di");
  assert.deepStrictEqual((await a.untilXt("ddg")).slice(2), ["1", "1", "0"]);
  a.xt("ddg", roomId, 1, 999999, 0); // no den item
  assert.strictEqual((await a.untilXt("ddg"))[2], "0");
  a.xt("ddg", roomId, 2, table, 0); // fewer than it says
  assert.strictEqual((await a.untilXt("ddg"))[2], "0");

  // --- shared by code: the same code every time; Ben copies it
  a.xt("dpx", roomId, id);
  const shared = await a.untilXt("dpx");
  assert.strictEqual(shared[2], "1");
  const code = shared[4];
  assert.match(code, /^[A-HJ-NP-Z2-9]{8}$/);
  a.xt("dpx", roomId, id);
  assert.strictEqual((await a.untilXt("dpx"))[4], code);
  a.xt("dpi", roomId, code); // her own
  assert.deepStrictEqual((await a.untilXt("dpi")).slice(2), ["0", "That prefab is one of yours already."]);
  b.xt("dpi", benRoom, "NOPE1234");
  assert.strictEqual((await b.untilXt("dpi"))[2], "0");
  b.xt("dpi", benRoom, `${code.slice(0, 4).toLowerCase()}-${code.slice(4)}`); // typed as it pleases him
  const copied = await b.untilXt("dpi");
  assert.strictEqual(copied[2], "1");
  assert.strictEqual(copied[4], "Cosy corner");
  b.xt("dpl", benRoom);
  assert.deepStrictEqual((await b.untilXt("dpl")).slice(2), ["1", "1", copied[3], "Cosy corner", "3", "1", ""]); // his copy, not shared
  b.xt("dpo", benRoom, copied[3]);
  assert.strictEqual((await b.untilXt("dpo"))[5], "3");

  // --- deleted: gone from Ann's list and its code; Ben's copy stays
  a.xt("dpd", roomId, id);
  assert.deepStrictEqual((await a.untilXt("dpd")).slice(2), ["1", id]);
  a.xt("dpl", roomId);
  assert.deepStrictEqual((await a.untilXt("dpl")).slice(2), ["1", "0"]);
  assert.strictEqual((await fetch(`${BASE}/denprefab/${id}.png`)).status, 404);
  b.xt("dpi", benRoom, code);
  assert.strictEqual((await b.untilXt("dpi"))[2], "0");
  b.xt("dpl", benRoom);
  assert.strictEqual((await b.untilXt("dpl"))[3], "1");

};

harness.withServer("den prefabs test", HTTP_PORT, GAME_PORT, run).catch(err => {
  console.error(err);
  process.exit(1);
});
