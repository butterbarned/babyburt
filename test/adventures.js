"use strict";

// end to end: adventures (lib/adventures.js, lib/adventures/*.js). the list
// the adventure window shows; one played alone from start to its first
// script step and left; one with a lobby; a host's private lobby joined from
// their bubble and started for both; a public event adventure (Twists and
// Turns) that a second player joins while it runs; "!tutorial" refused to a
// player. every
// script is loaded and has a start room. simulated players, a real server.

const assert = require("assert");
const harness = require("./harness.js");

const HTTP_PORT = 18113;
const GAME_PORT = 19381;
const BASE = `http://127.0.0.1:${HTTP_PORT}`;
const TOWNSHIP = "jamaa_township.room_main#1";
const LIST_ADVENTURES = 201;

const say = (client, roomId, text) =>
  client.send(`<msg t='sys'><body action='pubMsg' r='${roomId}'><txt><![CDATA[${text}%0]]></txt></body></msg>`);

const arrive = async username => {
  const auth = await (await harness.postJson(`${BASE}/authenticate`, {username, password: "KettlePass01"})).json();
  const client = new harness.GameClient(GAME_PORT);
  await client.connect();
  assert.strictEqual((await client.logIn(username, auth.auth_token)).status, "1");
  client.xt("rj", 1, TOWNSHIP, 1, 0, 0);
  const joined = await client.untilXt("rj");
  await client.untilXt("rp");
  return {client, roomId: joined[4], roomName: joined[3], id: null};
};

// QuestXtCommManager.questStartResponse, then the adventure's room: its name
const started = async (client, defId) => {
  const qs = await client.untilXt("qs");
  assert.strictEqual(qs[2], String(defId), qs.slice(0, 6).join("%"));
  const room = await client.untilXt("rj");
  assert.strictEqual(room[2], "1");
  assert.match(room[3], new RegExp(`^quest_\\d+_${defId}_`));
  return {name: room[3], id: room[4]};
};

// back to the land they came from
const leave = async (client, roomId) => {
  client.xt("qx", roomId, "");
  const back = await client.untilXt("rj");
  assert.strictEqual(back[3].split("#")[0].split("@")[0], "jamaa_township.room_main", back[3]);
  return back[4];
};

const run = async () => {
  // every script loads, and has a start room and actors
  for (const file of require("fs").readdirSync(`${__dirname}/../lib/adventures`)) {
    const script = require(`../lib/adventures/${file}`);
    assert.ok(script.rooms && script.rooms.start && script.rooms.start.room, `${file}: a start room`);
    assert.ok(Array.isArray(script.actors) && script.actors.length, `${file}: actors`);
  }

  for (const username of ["Ann", "Ben"]) {
    const response = await fetch(`${BASE}/api/register`, {method: "POST", headers: {"Content-Type": "application/json"},
      body: JSON.stringify({username, password: "KettlePass01", avatarType: 1, agreed: true})});
    assert.strictEqual(response.status, 200);
  }
  const ann = await arrive("Ann");
  const ben = await arrive("Ben");

  // the hearts at an adventure's start: half the healthBase at the end of her
  // own "ad" (GuiManager.setQuestHearts), the same 6 health the engine counts
  ann.client.xt("ad", ann.roomId, "Ann", 1, 0);
  const own = await ann.client.untilXt("ad");
  assert.strictEqual(own[own.length - 1], String(require("../lib/adventures.js").HEARTS));
  assert.strictEqual(require("../lib/adventures.js").HEARTS, 6, "3 hearts");

  // --- the adventure window's list: the playable ones, the tutorials left out
  ann.client.xt("gl", ann.roomId, LIST_ADVENTURES);
  const listed = (await ann.client.untilXt("gl")).slice(9);
  for (const defId of ["14", "15", "16", "17", "18", "19", "20", "22", "23", "46", "62"]) {
    assert.ok(listed.includes(defId), `${defId} listed: ${listed.join(",")}`);
  }
  assert.ok(!listed.includes("39"), "the tutorial is not listed");

  // --- alone: Training Grounds starts at once, its script begins, and back
  ann.client.xt("qj", ann.roomId, ann.roomName, 15, 0, 0);
  const grounds = await started(ann.client, 15);
  ann.client.xt("qmi", grounds.id);
  ann.roomId = await leave(ann.client, grounds.id);

  // --- an adventure with a lobby: waits, then starts on the player's Play
  ann.client.xt("qj", ann.roomId, ann.roomName, 23, 0, 0);
  assert.deepStrictEqual((await ann.client.untilXt("qj")).slice(2), ["1", "1", "23", "0"]);
  ann.client.xt("qs", ann.roomId);
  const desert = await started(ann.client, 23);
  ann.client.xt("qmi", desert.id);
  ann.roomId = await leave(ann.client, desert.id);

  // --- hard mode: the hard script plays (told apart by when it was written)
  for (const [defId, normal, hard] of [[19, "the-hive", "the-hive-hard"], [20, "meet-cosmo", "meet-cosmo-hard"]]) {
    for (const [difficulty, file] of [[0, normal], [1, hard]]) {
      ann.client.xt("qj", ann.roomId, ann.roomName, defId, difficulty, 0);
      assert.deepStrictEqual((await ann.client.untilXt("qj")).slice(2), ["1", "1", String(defId), String(difficulty)]);
      ann.client.xt("qs", ann.roomId);
      const qs = await ann.client.untilXt("qs");
      assert.strictEqual(qs[5], require(`../lib/adventures/${file}.js`).written, `${file} played`);
      const room = await ann.client.untilXt("rj");
      ann.client.xt("qmi", room[4]);
      ann.roomId = await leave(ann.client, room[4]);
    }
  }

  // --- a private lobby: Ann hosts Return of the Phantoms (hard), Ben clicks
  // her bubble, Ann starts it for both
  ann.client.xt("qjc", ann.roomId, ann.roomName, 14, 1);
  assert.deepStrictEqual((await ann.client.untilXt("qjc")).slice(2), ["1", "1", "14", "1"]);
  const bubble = await ben.client.untilXt("uc");
  assert.match(bubble[3], /^14,\d+,1\|on$/);
  assert.strictEqual(bubble[4], "11");
  ben.client.xt("qjp", ben.roomId, ben.roomName, "Ann");
  assert.deepStrictEqual((await ben.client.untilXt("qjp")).slice(2), ["1", "1", "14", "1"]);
  // who is waiting: Ann alone as she opened it, then both
  assert.strictEqual((await ann.client.untilXt("qw")).length, 3, "the host waiting");
  assert.strictEqual((await ann.client.untilXt("qw")).length, 4, "both waiting");
  ann.client.xt("qs", ann.roomId);
  const annPhantoms = await started(ann.client, 14);
  const benPhantoms = await started(ben.client, 14);
  assert.strictEqual(annPhantoms.name, benPhantoms.name, "one adventure for both");
  ann.client.xt("qmi", annPhantoms.id);
  ben.client.xt("qmi", benPhantoms.id);
  ann.roomId = await leave(ann.client, annPhantoms.id);
  ben.roomId = await leave(ben.client, benPhantoms.id);

  // --- a public event adventure: Ben joins the run Ann started
  ann.client.xt("qj", ann.roomId, ann.roomName, 62, 0, 0);
  const annMaze = await started(ann.client, 62);
  ann.client.xt("qmi", annMaze.id);
  ben.client.xt("qj", ben.roomId, ben.roomName, 62, 0, 0);
  const benMaze = await started(ben.client, 62);
  assert.strictEqual(benMaze.name, annMaze.name, "joined the run already going");
  for (;;) {
    const count = await ann.client.untilXt("qcmd");
    if (count[2] === "1" && count[3] === "live_players") {
      assert.strictEqual(count[4], "2");
      break;
    }
  }
  ann.roomId = await leave(ann.client, annMaze.id);
  ben.roomId = await leave(ben.client, benMaze.id);

  // --- "!tutorial" and "!adv" are moderators' (test/staff.js): from a player
  // they are plain chat, and start nothing
  say(ben.client, ben.roomId, "!tutorial");
  for (;;) {
    const line = await ben.client.untilXt("uc");
    if (line[3] === "!tutorial") {
      break;
    }
  }
};

harness.withServer("adventures test", HTTP_PORT, GAME_PORT, run).catch(err => {
  console.error(err);
  process.exit(1);
});
