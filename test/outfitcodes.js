"use strict";

// end to end: an outfit code from the Burrow outfit tool, pasted into the
// avatar editor (POST /api/outfit, lib/outfitcodes.js), puts its clothing in
// the inventory in its colours, once.

const assert = require("assert");
const harness = require("./harness.js");
const {decode, packColour} = require("../lib/outfitcodes.js");

const HTTP_PORT = 18105;
const GAME_PORT = 19373;
const BASE = `http://127.0.0.1:${HTTP_PORT}`;
const TOWNSHIP = "jamaa_township.room_main#1";
const {postJson} = harness;

// as the client sends it: no Origin of another site
const post = (url, body) => fetch(url, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(body)});
// as the tool's outfitCode() writes it
const codeOf = outfit => Buffer.from(JSON.stringify(outfit)).toString("base64");

const run = async () => {
  // --- decoding alone
  assert.strictEqual(packColour([1, 2, 3, 4]), 0x01020304);
  assert.strictEqual(packColour([255, 255, 255, 255]), 0xFFFFFFFF);
  assert.strictEqual(packColour([0xFD, 0, 0, 0]), null);
  assert.strictEqual(packColour([1, 2, 3]), null);
  assert.strictEqual(decode("not a code"), null);
  assert.strictEqual(decode(Buffer.from("[1,2]").toString("base64")), null);
  assert.deepStrictEqual(decode(codeOf({a: 1, w: [["2262", [1, 2, 3, 4]], ["o5", [0, 0, 0, 0]], ["2263", "bad"]]})),
    {items: [{id: 2262, color: 0x01020304}, {id: 2263, color: null}], foreign: 1});

  const response = await fetch(`${BASE}/api/register`, {method: "POST", headers: {"Content-Type": "application/json"},
    body: JSON.stringify({username: "Ann", password: "KettlePass01", avatarType: 1, agreed: true})});
  assert.strictEqual(response.status, 200);
  const auth = await (await postJson(`${BASE}/authenticate`, {username: "Ann", password: "KettlePass01"})).json();
  const client = new harness.GameClient(GAME_PORT);
  await client.connect();
  assert.strictEqual((await client.logIn("Ann", auth.auth_token)).status, "1");
  client.xt("rj", 1, TOWNSHIP, 1, 0, 0);
  await client.untilXt("rj");

  const outfit = (code, check) => post(`${BASE}/api/outfit`, {username: "Ann", token: auth.auth_token, code, check});
  const code = codeOf({a: 1, c: [], p: null, e: null, w: [["2262", [1, 2, 3, 4]], ["2263", null], ["o1", [0, 0, 0, 0]], ["999999999", [0, 0, 0, 0]]]});

  // --- asked first: counted, nothing given
  let answer = await outfit(code, true);
  assert.deepStrictEqual([answer.status, await answer.json()], [200, {added: 2, owned: 0, unavailable: 2, full: false, limited: false}]);

  // --- then given, each in its colour, the game told
  answer = await outfit(code, false);
  assert.deepStrictEqual(await answer.json(), {added: 2, owned: 0, unavailable: 2, full: false, limited: false});
  const added = [];
  while (added.length < 2) {
    const changed = await client.untilXt("il");
    if (changed[2] === "2" && changed[5] === "Ann" && changed[7] === "1") {
      added.push([Number(changed[10]), Number(changed[6])]);
    }
  }
  assert.deepStrictEqual(added[0], [2262, 0x01020304]);
  assert.strictEqual(added[1][0], 2263);

  // --- the same code again: all owned already
  answer = await outfit(code, true);
  assert.deepStrictEqual(await answer.json(), {added: 0, owned: 2, unavailable: 2, full: false, limited: false});

  // --- not a code; not another's account
  assert.strictEqual((await outfit("hello", true)).status, 400);
  assert.strictEqual((await post(`${BASE}/api/outfit`, {username: "Nobody", token: auth.auth_token, code})).status, 403);
  client.socket.destroy();
};

harness.withServer("outfit codes test", HTTP_PORT, GAME_PORT, run).catch(err => {
  console.error(err);
  process.exit(1);
});
