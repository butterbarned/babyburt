"use strict";

// end to end: whole den layouts to share (lib/denlayouts.js, the "dl*"
// messages in lib/dens.js). a den saved as a file's rows (signed) and as a
// code; another player loading the code (what they lack given free, all
// placed) and the file (theirs now, nothing given); a file changed by hand
// laid out with one's own items only; files that are not layouts refused;
// "!den undo" putting back the den as it was before; laying out with
// nothing looked at refused. simulated players, a real server.

const assert = require("assert");
const harness = require("./harness.js");

const HTTP_PORT = 18109;
const GAME_PORT = 19377;
const BASE = `http://127.0.0.1:${HTTP_PORT}`;
const TOWNSHIP = "jamaa_township.room_main#1";
const {postJson} = harness;
const MASTERPIECE = 2725; // lib/masterpieces.js DEN_ITEM: one of a kind, never in a layout

const say = (client, roomId, text) =>
  client.send(`<msg t='sys'><body action='pubMsg' r='${roomId}'><txt><![CDATA[${text}%0]]></txt></body></msg>`);

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

// into one's own den: its room id
const goHome = async (client, roomId, username) => {
  client.xt("dj", roomId, `den${username}`, 1, -1);
  const denId = (await client.untilXt("rj"))[4];
  await client.untilXt("ds");
  client.xt("au", denId, 1, 200, 200, 14, 1);
  return denId;
};

// DenXtCommManager.denItemsResponse as [{inv, def, placed, version}]
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
  const {client: a, roomId: annTown} = await arrive("Ann");
  const {client: b, roomId: benTown} = await arrive("Ben");

  // --- Ann's den: a chair and a table, placed
  const annDen = await goHome(a, annTown, "Ann");
  a.xt("gl", annDen, 9);
  const shop = await a.untilXt("gl");
  const [chair, table] = [shop[9], shop[10]];
  const buy = async def => {
    a.xt("db", annDen, 0, 9, def, 0, 0, 0, 0, "");
    await a.untilXt("db");
    return denItems(await a.untilXt("di")).filter(item => item.def === def).pop().inv;
  };
  const annChair = await buy(chair);
  const annTable = await buy(table);
  a.xt("ds", annDen, 2, 0, annChair, 1, 120, 340, 1, "", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, annTable, 1, 300, 360, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  await a.untilXt("dss");

  // --- as a file's rows: the den kind, a signature, [def, version, x, y, flip, cat] each
  a.xt("dlx", annDen);
  const file = (await a.untilXt("dlx")).slice(2);
  assert.strictEqual(file[0], "1");
  const [den, signature, count, ...rows] = file.slice(1);
  assert.match(signature, /^[0-9a-f]{32}$/);
  assert.strictEqual(count, "2");
  assert.deepStrictEqual(rows, [chair, "0", "120", "340", "1", "1", table, "0", "300", "360", "0", "1"]);

  // --- as a code
  a.xt("dlc", annDen, "  Cosy   den ");
  const shared = (await a.untilXt("dlc")).slice(2);
  assert.strictEqual(shared[0], "1");
  const code = shared[1];
  assert.match(code, /^[A-Z2-9]{8}$/);

  // --- Ben, in his own den: the code looked at, then laid out (both given)
  const benDen = await goHome(b, benTown, "Ben");
  b.xt("dla", benDen);
  assert.deepStrictEqual((await b.untilXt("dla")).slice(2), ["0", "Load a layout first."]);
  b.xt("dli", benDen, "c", "nosuchcode");
  assert.strictEqual((await b.untilXt("dli"))[2], "0");
  b.xt("dli", benDen, "c", code.toLowerCase().replace(/(....)/, "$1-"));
  // [ok, count, have, give, cannot, signed, name]
  assert.deepStrictEqual((await b.untilXt("dli")).slice(2), ["1", "2", "0", "2", "0", "1", "Cosy den"]);
  b.xt("dla", benDen);
  const given = denItems(await b.untilXt("di"));
  assert.deepStrictEqual(given.map(item => [item.def, item.placed]).sort(), [[chair, "1"], [table, "1"]].sort());
  const state = await b.untilXt("ds");
  assert.strictEqual(state[2], "2");
  assert.strictEqual(state[4], "1", "the den reloads, whatever the game was doing");
  assert.deepStrictEqual((await b.untilXt("dla")).slice(2), ["1", "2", "0"]);
  const benChair = given.find(item => item.def === chair).inv;

  // --- Ann's file: Ben has both now, nothing given
  b.xt("dli", benDen, "f", den, signature, count, ...rows);
  assert.deepStrictEqual((await b.untilXt("dli")).slice(2), ["1", "2", "2", "0", "0", "1", ""]);

  // --- changed by hand: the chair moved, and the table made another item
  // Ben has none of: not signed, nothing given, the chair placed
  const other = shop.slice(11).find(def => def && def !== chair && def !== table);
  const forged = [chair, "0", "500", "340", "1", "1", other, "0", "300", "360", "0", "1"];
  b.xt("dli", benDen, "f", den, signature, count, ...forged);
  assert.deepStrictEqual((await b.untilXt("dli")).slice(2), ["1", "2", "1", "0", "1", "0", ""]);
  b.xt("dla", benDen);
  const after = denItems(await b.untilXt("di"));
  assert.ok(!after.some(item => item.def === other), "nothing given for a changed file");
  const moved = await b.untilXt("ds");
  assert.strictEqual(moved[2], "1");
  assert.deepStrictEqual(moved.slice(5, 10), [benChair, chair, "1", "500", "340"]);
  assert.deepStrictEqual((await b.untilXt("dla")).slice(2), ["1", "1", "1"]);

  // --- "!den undo": the den before that layout, chair and table where they were
  say(b, benDen, "!den undo");
  await b.untilXt("di");
  const undone = await b.untilXt("ds");
  assert.strictEqual(undone[2], "2");
  assert.ok(undone.includes("120") && undone.includes("300"), undone.join("%"));
  assert.strictEqual((await b.untilXt("xtl"))[2], "Your den is back as it was.");

  // --- not layouts: a masterpiece, a colour out of range, too many, not numbers
  for (const bad of [
    [den, signature, 1, MASTERPIECE, 0, 0, 0, 0, 1],
    [den, signature, 1, chair, 5000, 0, 0, 0, 1],
    [den, signature, 2000, chair, 0, 0, 0, 0, 1],
    [den, signature, 1, "chair", 0, 0, 0, 0, 1],
    [den, signature, 1, chair, 0, 0, 0, 0],
  ]) {
    b.xt("dli", benDen, "f", ...bad);
    assert.deepStrictEqual((await b.untilXt("dli")).slice(2), ["0", "That file is not a den layout this game can read."], bad.join(","));
  }
  // another kind of den
  b.xt("dli", benDen, "f", Number(den) + 1, signature, count, ...rows);
  assert.strictEqual((await b.untilXt("dli"))[2], "0");
  b.xt("dla", benDen);
  assert.deepStrictEqual((await b.untilXt("dla")).slice(2), ["0", "Load a layout first."]);
};

harness.withServer("den layouts test", HTTP_PORT, GAME_PORT, run).catch(err => {
  console.error(err);
  process.exit(1);
});
