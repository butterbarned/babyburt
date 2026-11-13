"use strict";

// end-to-end check of what smoke.js does not cover: achievements, the
// currency exchange, pets' characters, Adopt-A-Pet, gifts in the lands,
// parties, Jam-A-Grams, Jammer Walls, reports, blocking, chat commands and
// the admin panel's pages for them. three simulated players, a real server.

const assert = require("assert");
const harness = require("./harness.js");

const HTTP_PORT = 18081;
const GAME_PORT = 19340;
const BASE = `http://127.0.0.1:${HTTP_PORT}`;
const TOWNSHIP = "jamaa_township.room_main#1";
const {postJson} = harness;

const say = (client, roomId, text) =>
  client.send(`<msg t='sys'><body action='pubMsg' r='${roomId}'><txt><![CDATA[${text}%0]]></txt></body></msg>`);

// registers nothing: logs an existing account in and walks it into Jamaa
// Township. returns {client, login, roomId}.
const arrive = async (username, password) => {
  const auth = await (await postJson(`${BASE}/authenticate`, {username, password})).json();
  const client = new harness.GameClient(GAME_PORT);
  await client.connect();
  const login = await client.logIn(username, auth.auth_token);
  assert.strictEqual(login.status, "1");
  client.xt("rj", 1, TOWNSHIP, 1, 0, 0);
  const roomId = (await client.untilXt("rj"))[4];
  await client.untilXt("rp");
  client.xt("au", roomId, 1, 400, 400, 14, 1);
  return {client, login, roomId};
};

// DenXtCommManager.denItemsResponse as [{inv, def, placed}], nine fields an item.
const denItems = fields => {
  const items = [];
  for (let i = 5; i < fields.length; i += 9) {
    items.push({inv: fields[i], def: fields[i + 1], placed: fields[i + 2]});
  }
  return items;
};

const wall = async body => (await postJson(`${BASE}/wall`, body)).json();

const run = async () => {
  const registerJson = body => fetch(`${BASE}/api/register`, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({avatarType: 1, agreed: true, ...body})});
  for (const username of ["Ann", "Ben", "Cat", "Scout"]) {
    assert.strictEqual((await registerJson({username, password: "KettlePass01"})).status, 200);
  }

  // --- the admin panel's message of the day reaches a player once their first room has loaded
  const panel = async (pathname, body, cookie) => {
    const response = await fetch(`${BASE}/admin/api/${pathname}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {"Content-Type": "application/json", ...(cookie ? {Cookie: cookie} : {})},
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return {status: response.status, data: await response.json(), cookie: (response.headers.get("set-cookie") || "").split(";")[0]};
  };
  const admin = (await panel("setup", {password: "admin-password-1"})).cookie;
  assert.strictEqual((await panel("motd", {text: "Welcome to the test server"}, admin)).status, 200);
  assert.strictEqual((await panel("messages", undefined, admin)).data.motd, "Welcome to the test server");

  const {client: a, login: annLogin, roomId} = await arrive("Ann", "KettlePass01");
  // "ua": the text sits where a room id usually does, then 1 = system message.
  assert.deepStrictEqual((await a.untilXt("ua")).slice(1), ["Welcome to the test server", "1"]);
  assert.strictEqual((await panel("motd", {text: ""}, admin)).status, 200);

  // every account says it is two days old: a newer one gets a cut-down party list.
  assert.ok(Math.abs(Date.now() / 1000 - 2 * 86400 - annLogin.params.createdAt) < 60);
  // the phrase menus are not empty (the Jam-A-Gram window reads the first of list 66).
  a.xt("gl", roomId, 66);
  assert.deepStrictEqual((await a.nextXt("gl")).slice(8, 10), ["15", "1759"]);
  // walls are switched on, and each day's first login finds an Adopt-A-Pet.
  assert.strictEqual(annLogin.params.webWallStatus, 1);
  assert.strictEqual(annLogin.params.usableAdoptAPetDefs.length, 1);
  assert.strictEqual(annLogin.params.usableAdoptAPetDefs[0].hasSeen, false);
  a.xt("padc", roomId, "Ann");
  assert.deepStrictEqual((await a.nextXt("padc")).slice(2), ["1"]);
  a.xt("pad", roomId, "Ann");
  assert.deepStrictEqual((await a.nextXt("pad")).slice(2), ["1", "1", String(annLogin.params.usableAdoptAPetDefs[0].defId), String(annLogin.params.usableAdoptAPetDefs[0].invId)]);

  const {client: b, login: benLogin} = await arrive("Ben", "KettlePass01");
  await a.untilXt("ac");
  await a.nextXt("il");

  // Actions are normally live type-3 chat packets. A player who enters after
  // one has started must receive the current action after the avatar itself,
  // including its mirror marker, rather than seeing an idle animal.
  say(a, roomId, ":dance:%3%m1");
  assert.deepStrictEqual((await b.untilXt("uc")).slice(2), [String(annLogin.params.userId), ":dance:", "3", "m1"]);
  const {client: c} = await arrive("Cat", "KettlePass01");
  assert.deepStrictEqual((await c.untilXt("uc")).slice(2), [String(annLogin.params.userId), ":dance:", "3", "m1"]);
  await a.untilXt("ac"); // Cat appearing in the room
  await a.nextXt("il");
  await b.untilXt("ac");
  await b.nextXt("il");
  c.socket.destroy();
  await a.untilXt("ar");
  await b.untilXt("ar");

  // the shop's name and stalls come from its room file (lib/roominfo.js),
  // read the first time anyone goes in; until then the name is made from its
  // path. a scout goes in first and comes back until the file has been read,
  // so that what follows does not depend on what an earlier run left in the
  // cache. (the scout never enters the township, so a and b see nothing.)
  const scoutAuth = await (await postJson(`${BASE}/authenticate`, {username: "Scout", password: "KettlePass01"})).json();
  const scout = new harness.GameClient(GAME_PORT);
  await scout.connect();
  assert.strictEqual((await scout.logIn("Scout", scoutAuth.auth_token)).status, "1");
  let scoutRoom = 1;
  for (let tries = 0; ; tries++) {
    scout.xt("rj", scoutRoom, "jamaa_township.clothes_shop#1", 1, 0, 0);
    const there = await scout.untilXt("rj");
    if (there[14] === "Jam Mart Clothing") {
      break;
    }
    assert.ok(tries < 40, `the shop's room file was never read (still "${there[14]}")`);
    await new Promise(resolve => setTimeout(resolve, 500));
    scout.xt("rj", there[4], "sarepia.room_main#1", 1, 0, 0);
    scoutRoom = (await scout.untilXt("rj"))[4];
  }
  scout.socket.destroy();
  await new Promise(resolve => setTimeout(resolve, 300)); // gone before Ben walks in

  // --- a shop's title is its room's name, as the id of the string that says so
  b.xt("rj", roomId, "jamaa_township.clothes_shop#1", 1, 0, 0);
  const shopRoom = await b.untilXt("rj");
  assert.strictEqual(shopRoom[14], "Jam Mart Clothing");
  await b.nextXt("rp");
  b.xt("gl", shopRoom[4], 11); // the tables in that room open list 11
  const titled = await b.nextXt("gl");
  assert.deepStrictEqual(titled.slice(3, 5), ["1000", "389"]); // string 389: "Jam Mart Clothing"
  b.xt("gl", shopRoom[4], 5); // a shop that is not in this room keeps its own title
  assert.strictEqual((await b.nextXt("gl"))[4], "");
  b.xt("rj", shopRoom[4], TOWNSHIP, 1, 0, 0);
  await b.untilXt("rj");
  await b.nextXt("rp");
  await b.nextXt("ac");
  await b.nextXt("il");
  b.xt("au", roomId, 1, 420, 400, 14, 1);
  await a.untilXt("ar");
  await a.untilXt("ac");
  await a.nextXt("il");

  // --- the admin tints an animal as the game's mud does (lib/tints.js), and it stays
  const MUD = String((255 << 24 | 0x5C4033) | 0);
  assert.match((await panel("account", {username: "Ann", action: "tint", tint: "mud"}, admin)).data.ok, /tinted mud/);
  const annId = (await a.untilBlend(MUD))[2];
  assert.strictEqual((await b.untilBlend(MUD))[2], annId);
  // her own game says the mud is wearing off: everyone is told it is not
  a.send(`<msg t='sys'><body action='pubMsg' r='${roomId}'><txt><![CDATA[0%8]]></txt></body></msg>`);
  assert.strictEqual((await b.untilBlend(MUD))[2], annId);
  assert.strictEqual((await a.untilBlend(MUD))[2], annId);
  assert.match((await panel("account", {username: "Ann", action: "tint", tint: "glitter"}, admin)).data.error, /No such tint/);
  assert.strictEqual((await panel("account?username=Ann", undefined, admin)).data.account.tint, "mud");
  assert.match((await panel("account", {username: "Ann", action: "tint", tint: ""}, admin)).data.ok, /tint is off/);
  assert.strictEqual((await b.untilBlend(0))[2], annId);
  // untinted, her game's own colour goes to the others again
  a.send(`<msg t='sys'><body action='pubMsg' r='${roomId}'><txt><![CDATA[123%8]]></txt></body></msg>`);
  assert.strictEqual((await b.untilBlend(123))[2], annId);

  // --- minigames: which game is which, a game in a window over the room, gems, a full-screen game
  a.xt("mi", roomId, 15, 4, 999999);
  const gameInfo = await a.nextXt("mi");
  // 19 fields a game. 15 is the popcorn machine, in a window (type 0).
  assert.deepStrictEqual([gameInfo[2], gameInfo.length, gameInfo[3], gameInfo[6], gameInfo[10]], ["3", 3 + 3 * 19, "15", "MicroPopcorn", "0"]);
  assert.deepStrictEqual([gameInfo[22], gameInfo[25], gameInfo[29], gameInfo[31]], ["4", "Pachinko", "1", "16"]); // gem Ball: full screen, counts in var 16
  assert.strictEqual(gameInfo[39], "4295"); // its picture in the Games window
  // an id nobody knows still gets an entry (a room draws no game signs unless
  // it hears about all of them), with a name the client can look up.
  assert.strictEqual(gameInfo[41], "999999");
  assert.ok(Number(gameInfo[42]) > 0);
  // the HUD's Games window: game def ids, each with a picture, none of the unfinished ones.
  a.xt("gl", roomId, 341);
  const library = (await a.nextXt("gl")).slice(9);
  assert.ok(library.includes("4") && library.includes("94") && !library.includes("62") && library.length > 15);
  // phantom Invasion: 10 gems a go, and the prize a win would bring is named up front.
  a.xt("mj", roomId, 72, 0, 0, -1);
  const invasionRoom = (await a.nextXt("rj"))[4];
  await a.untilXt("ms");
  a.xt("mm", invasionRoom, 72, "cp");
  assert.strictEqual((await a.nextXt("cu"))[2], "0"); // gems
  const go = await a.nextXt("mm");
  assert.deepStrictEqual([go[2], go[3], go[5]], ["cp", "1", "1"]);
  const [serialNo, prizeDef] = [Number(go[4]), go[6]];
  assert.ok(serialNo > 0 && Number(prizeDef) > 0);
  const uidNow = annLogin.params.userId;
  a.xt("mm", invasionRoom, 72, "cd", 11 * 5 + (uidNow + 99) * 3 + (serialNo + 49) * 5, (serialNo + uidNow + 11) * 3 + 11 * 3);
  assert.ok(denItems(await a.untilXt("di")).some(item => item.def === prizeDef)); // kept: it is in the den inventory
  a.xt("rl", invasionRoom, invasionRoom);
  a.xt("mj", roomId, 15, 0, 0, -1);
  const subRoom = await a.nextXt("rj");
  assert.deepStrictEqual([subRoom[2], subRoom[10], subRoom[12], subRoom[13]], ["1", "1", "1", "1"]); // a game room, temporary, beside the room
  const gemSerial = Number((await a.nextXt("mg"))[2]);
  await a.nextXt("ma");
  assert.deepStrictEqual((await a.nextXt("mj")).slice(1), [subRoom[4], String(annLogin.params.userId)]);
  assert.deepStrictEqual((await a.nextXt("ms")).slice(1), [subRoom[4], "1", String(annLogin.params.userId), String(annLogin.params.dbUserId), "Ann"]);
  // 25 gems, signed the way MinigameManager.sendGemAward signs them.
  const uid = annLogin.params.userId;
  a.xt("mg", subRoom[4], (25 + 29) * 7 + (uid + 99) * 3 + (gemSerial + 49) * 5, (15 + 49) * 3 + (gemSerial + 83) * 5, (gemSerial + uid + 25) * 3 + 25 * 3);
  const nextSerial = Number((await a.nextXt("mg"))[2]);
  a.xt("mg", subRoom[4], 1, 2, 3); // not signed: no gems
  await a.nextXt("mg");
  assert.ok(nextSerial > 0);
  // food machine wins award a temporary avatar attachment rather than an
  // inventory entry.
    a.xt("mm", subRoom[4], 15, "_a", 1);
    assert.deepStrictEqual((await a.nextXt("mm")).slice(2), ["_a", "1", ""]);
  // Attachment packets must also return to their sender: that echoed media
  // id is what makes the local avatar draw the held item.
  a.send(`<msg t='sys'><body action='pubMsg' r='${subRoom[4]}'><txt><![CDATA[1,%4]]></txt></body></msg>`);
  assert.deepStrictEqual((await a.nextXt("uc")).slice(2), [String(annLogin.params.userId), "35,", "4"]);
  a.xt("rl", subRoom[4], subRoom[4]);
  a.xt("mj", roomId, 4, 0, 0, -1); // gem Ball takes the room's place
  const gameRoom = await a.nextXt("rj");
  assert.deepStrictEqual([gameRoom[10], gameRoom[13]], ["1", "0"]);
  await a.nextXt("mg");
  await a.nextXt("ma");
  await a.nextXt("mj");
  await a.nextXt("ms");
  assert.deepStrictEqual((await b.untilXt("ar")).slice(2), [String(annLogin.params.userId)]); // gone from the township meanwhile
  a.xt("zs", gameRoom[4], 16, 1, 1); // "one more game played", twice: a counter, not a value
  await a.nextXt("zs");
  a.xt("zs", gameRoom[4], 16, 1, 1);
  assert.deepStrictEqual((await a.nextXt("zs")).slice(2, 4), ["16", "2"]);
  a.xt("mj", gameRoom[4], 62, 0, 0, -1); // a game that needs more than is here yet
  assert.deepStrictEqual((await a.nextXt("mj")).slice(2), ["as", "0"]);
  assert.match((await a.nextXt("ua"))[1], /not ready/);
  a.xt("rj", gameRoom[4], TOWNSHIP, 1, 0, 0); // and back
  await a.untilXt("rj");
  await a.nextXt("rp");
  await a.nextXt("ac");
  await a.nextXt("il");
  a.xt("au", roomId, 1, 400, 400, 14, 1);
  await b.untilXt("ac");
  await b.nextXt("il");

  // --- name tags: the colour and badge go with a colour change, reach the room, and stay
  a.xt("gl", roomId, 110);
  const badges = await a.nextXt("gl");
  assert.deepStrictEqual([badges[3], badges[8], badges[9], badges[70]], ["1049", "76", "1", "62"]); // every badge, in id order: the game's 62 and the fourteen the admin gives (verified among them)
  const tag = 6 | 11 << 8; // colour 6, the twelfth badge
  a.xt("ap", roomId, 1, 2, 3, tag);
  assert.deepStrictEqual((await a.nextXt("ap")).slice(2), ["1"]);
  assert.deepStrictEqual((await b.untilXt("an")).slice(2), [String(annLogin.params.userId), String(tag)]);
  a.xt("ap", roomId, 1, 2, 3, 6 | 200 << 8); // no such badge: the colours change, the tag stays
  await a.nextXt("ap");
  b.xt("ag", roomId, "Ann");
  assert.strictEqual((await b.untilXt("ag"))[10], String(tag));

  // --- the currency exchange: 1 diamond for 1,000 gems (def 4, at counter 169)
  a.xt("gl", roomId, 169);
  const exchange = await a.nextXt("gl");
  assert.deepStrictEqual([exchange[3], ...exchange.slice(8)], ["1051", "4", "4", "5", "6", "7"]);
  a.xt("ce", roomId, 169, 4);
  assert.deepStrictEqual((await a.nextXt("cu")).slice(2), ["0", String(annLogin.params.gemsCount + 1015), "0"]); // 25 won, 10 spent on Phantom Invasion
  assert.deepStrictEqual((await a.nextXt("ce")).slice(2), ["1", String(annLogin.params.diamondsCount - 1)]);
  // 1,000 gems earned (25 in the game, 1,000 here) is an achievement (def 1); the counter came on its own.
  assert.ok(a.varUpdates.some(update => update[2] === "1" && update[3] === "1025" && update[4] === "1" && update[6] === "1"));
  a.xt("ce", roomId, 5, 4); // not an exchange counter
  assert.deepStrictEqual((await a.nextXt("ce")).slice(2), ["0", "0"]);

  // --- pets have a personality and favourites; mastery has to be earned
  a.xt("pc", roomId, 312, 1, 0, 0, 15386, 15428, 0);
  const petInv = (await a.nextXt("pc"))[5];
  a.xt("pl", roomId, "Ann");
  const petList = await a.nextXt("pl");
  const [mastery, personality, toy, food] = petList.slice(11, 15).map(Number);
  assert.strictEqual(mastery, 0);
  assert.ok(personality >= 25865 && personality <= 25932 && toy > 0 && food > 0);
  await a.nextXt("pu");
  // the kitten's foods (list 439) are the first ten in the pack, starting with hamburgers.
  a.xt("gl", roomId, 439);
  const foods = await a.nextXt("gl");
  assert.deepStrictEqual([foods[3], foods[8], foods[9], foods[10]], ["1062", "10", "1", "25933"]);
  assert.ok(foods.slice(9).filter((_, i) => i % 2 === 0).includes(String(food)));
  a.xt("gl", roomId, 432);
  assert.deepStrictEqual((await a.nextXt("gl")).slice(8, 10), ["68", "25865"]);
  a.xt("pm", roomId, 1, petInv);
  assert.deepStrictEqual((await a.nextXt("pm")).slice(2), ["0"]);

  // --- gifts lying about in the lands: one per spot, the next one after it is taken
  a.xt("gl", roomId, 583);
  const spots = await a.nextXt("gl");
  assert.deepStrictEqual([spots[3], spots[8]], ["1064", "3"]);
  a.xt("wig", roomId, spots[9], 0, 0);
  assert.strictEqual((await a.untilXt("wig"))[2], "1");
  a.xt("wig", roomId, spots[9], 0, 0); // only once
  assert.strictEqual((await a.untilXt("wig"))[2], "0");
  a.xt("gl", roomId, 583);
  const spotsAfter = await a.untilXt("gl");
  assert.ok(spotsAfter[8] === "3" && !spotsAfter.slice(9).includes(spots[9]));

  // --- parties: the game's own, always open
  a.xt("sl", roomId);
  const partyList = await a.nextXt("sl");
  assert.ok(Number(partyList[3]) > 20 && partyList[5] === "0" && Number(partyList[3]) * 3 === partyList.length - 4);
  a.xt("sj", roomId, partyList[4]);
  const partyJoin = await a.nextXt("rj");
  assert.deepStrictEqual(partyJoin.slice(2, 4), ["1", `party${partyList[4]}`]);
  const partyRoom = await a.nextXt("rp");
  assert.deepStrictEqual([partyRoom[2].split(".")[0], partyRoom[4], partyRoom[5]], ["party", "5", partyList[4]]);
  a.xt("sj", partyJoin[4], 4); // bunnies only, and Ann is not one
  assert.deepStrictEqual((await a.nextXt("sj")).slice(2), ["0", "NA", "4"]);

  // --- parties put back: the Trading Party in the trading barn, and two rooms no party used
  const offered = partyList.slice(4).filter((field, index) => index % 3 === 0);
  assert.ok(["6", "52", "53"].every(id => offered.includes(id)) && !offered.includes("3"));
  a.xt("sj", partyJoin[4], 6);
  assert.deepStrictEqual((await a.nextXt("rj")).slice(3, 4), ["party6"]);
  assert.strictEqual((await a.nextXt("rp"))[2], "party.venue_pl_barn_trading");

  // --- the Summer Carnival: gone from the official room list, back in ours; its games pay in tickets
  assert.ok(partyList.slice(4).filter((field, index) => index % 3 === 0).includes("18"));
  a.xt("sj", partyJoin[4], 18);
  const carnival = await a.nextXt("rj");
  assert.deepStrictEqual(carnival.slice(2, 4), ["1", "party18"]);
  assert.strictEqual((await a.nextXt("rp"))[2], "party.venue_carnival");
  // its shops sell what is priced in tickets: 76 pieces of clothing at the first.
  a.xt("gl", carnival[4], 101);
  const ticketClothes = await a.nextXt("gl");
  assert.deepStrictEqual([ticketClothes[3], ticketClothes[8]], ["1000", "76"]);
  a.xt("mi", carnival[4], 68, 96);
  const booths = await a.nextXt("mi");
  assert.deepStrictEqual([booths[6], booths[25]], ["Skeeball", "DunkAPhantom"]);
  a.xt("mj", carnival[4], 68, 0, 0, -1);
  const booth = (await a.nextXt("rj"))[4];
  await a.untilXt("ms");
  // "pz" and "pg" each bring a serial number, hidden as (n + 5) * 3 - 7.
  const shown = async word => {
    const message = await a.nextXt("mm");
    assert.strictEqual(message[2], word);
    return message;
  };
  const serial1 = (Number((await shown("pz"))[3]) + 7) / 3 - 5;
  a.xt("mm", booth, 68, "pg");
  assert.strictEqual((await a.nextXt("cu"))[2], "0"); // 5 gems a go
  const paid = await shown("pg");
  assert.strictEqual(paid[3], "1");
  const serial2 = (Number(paid[4]) + 7) / 3 - 5;
  const points = 250; // at 10 points a ticket
  a.xt("mm", booth, 68, "gr", (points + 29) * 7 + (serial1 + 49) * 5, (points + 49) * 3 + (serial2 + 83) * 5, (serial1 + points) * 3 + points * 3);
  assert.deepStrictEqual((await a.nextXt("cu")).slice(2, 4), ["1", String(annLogin.params.ticketsCount + 25)]);
  assert.strictEqual((await shown("gr"))[3], "25");
  a.xt("mm", booth, 68, "gr", 1, 2, 3); // the same go again, and unsigned: nothing
  assert.strictEqual((await shown("gr"))[3], "0");
  a.xt("rj", booth, "party18", 1, 0, 0); // back out of the game
  assert.strictEqual((await a.untilXt("rj"))[3], "party18");
  await a.nextXt("rp");

  // --- sale dates: a window comes round each year (lib/sales.js)
  const sales = require("../lib/sales.js");
  const day = (year, month, date) => Date.UTC(year, month - 1, date) / 86400000;
  const at = (year, month, date) => Date.UTC(year, month - 1, date, 12) / 1000;
  const october = [[day(2023, 10, 1), day(2023, 11, 11)], [day(2024, 10, 5), day(2024, 11, 11)]];
  assert.deepStrictEqual(sales.windowFor(october, at(2030, 10, 20)), [at(2030, 10, 1) - 43200, at(2030, 11, 11) - 43200]); // on sale now
  assert.deepStrictEqual(sales.windowFor(october, at(2030, 3, 1))[0], at(2030, 10, 1) - 43200); // waiting for the next one
  assert.deepStrictEqual(sales.windowFor([[day(2018, 1, 1), day(2019, 2, 1)]], at(2030, 3, 1)), [0, 0]); // sold all year round: always
  assert.strictEqual(sales.windowFor(undefined, at(2030, 3, 1)), null);

  // --- a party of Ann's own: the lists its window needs, then hosting it
  a.xt("gl", partyJoin[4], 370);
  const hostable = await a.nextXt("gl");
  assert.ok(hostable[3] === "1047" && Number(hostable[8]) >= 5);
  a.xt("gl", partyJoin[4], 401);
  const music = await a.nextXt("gl");
  assert.ok(music[3] === "1030" && Number(music[8]) > 10);
  a.xt("gl", partyJoin[4], 386);
  assert.deepStrictEqual((await a.nextXt("gl")).slice(8, 10), ["26", "24135"]);
  a.xt("scp", partyJoin[4], hostable[9], 24135, 24162, 1, music[9]); // 1 is not a name
  assert.deepStrictEqual((await a.nextXt("scp")).slice(2), ["0", "INV"]);
  a.xt("scp", partyJoin[4], hostable[9], 24135, 24162, 24186, music[9]);
  assert.deepStrictEqual((await a.nextXt("cu")).slice(2, 4), ["3", String(annLogin.params.diamondsCount - 2)]);
  const hosting = await a.nextXt("scp");
  assert.deepStrictEqual(hosting.slice(2, 4), ["1", "1"]);
  assert.ok(Number(hosting[4]) > 7000);
  const own = await a.nextXt("rj");
  // the party's name is three string ids; its music is in the join message.
  assert.deepStrictEqual([own[3], own[14], own[19]], ["ppartyAnn", "24135|24162|24186", music[9]]);
  await a.nextXt("rp");
  assert.strictEqual((await a.nextXt("sjp"))[2], "1");
  a.xt("au", own[4], 1, 400, 400, 14, 1);
  a.xt("scp", own[4], hostable[9], 24135, 24162, 24186, music[9]);
  assert.deepStrictEqual((await a.nextXt("scp")).slice(2), ["0", "EXISTS"]);

  b.xt("slp", 1, 0, 200);
  const hostedList = await b.untilXt("slp");
  assert.deepStrictEqual(hostedList.slice(2, 3).concat(hostedList.slice(6, 11)), ["1", "1", annLogin.params.uuid, "24135|24162|24186", "127.0.0.1", hostable[9]]);
  b.xt("sphp", 1, annLogin.params.uuid);
  assert.ok(Number((await b.nextXt("sphp"))[2]) > 7000);
  b.xt("spn", 1, annLogin.params.uuid);
  assert.deepStrictEqual((await b.nextXt("spn")).slice(2), ["1", annLogin.params.uuid, "127.0.0.1"]);
  b.xt("sjp", 1, annLogin.params.uuid);
  assert.deepStrictEqual((await b.nextXt("rj")).slice(2, 4), ["1", "ppartyAnn"]);
  await b.nextXt("rp");
  await b.nextXt("ac"); // Ann, already there
  await b.nextXt("il");
  assert.strictEqual((await b.nextXt("sjp"))[2], "1");
  b.xt("au", own[4], 1, 420, 420, 14, 1);
  await a.untilXt("ac");
  await a.nextXt("il");

  // --- chat commands: answered in a popup, never shown to the room
  say(a, own[4], "!online");
  assert.deepStrictEqual((await a.nextXt("xtl")).slice(2), ["2 playing: Ann, Ben"]); // a plain message box
  assert.strictEqual((await a.nextXt("uc"))[3], "!online"); // the sender's own bubble
  say(a, own[4], "!!! wow");
  assert.strictEqual((await b.untilXt("uc"))[3], "!!! wow"); // not a command: just chat
  await a.nextXt("uc");
  say(a, own[4], "!roll");
  assert.match((await b.nextXt("uc"))[3], /^\(rolls a dice: [1-6]\)$/);
  await a.nextXt("uc");

  // --- outfits: what the animal wears, saved and put back on
  a.xt("gl", own[4], 5);
  const shop = await a.nextXt("gl");
  a.xt("ib", own[4], 5, 1, shop[9], 0, 0, -1, "");
  const hat = (await a.nextXt("il"))[9];
  await a.nextXt("ib");
  a.xt("iu", own[4], 1, 0, hat);
  await a.nextXt("iu");
  await a.nextXt("il");
  await b.untilXt("il");
  say(a, own[4], "!outfit save hat");
  assert.strictEqual((await a.nextXt("xtl"))[2], "Outfit hat saved (1 items).");
  await a.nextXt("uc");
  a.xt("iu", own[4], 0, 1, hat);
  await a.nextXt("iu");
  const off = await a.nextXt("il"); // her own game hears it too
  assert.deepStrictEqual([off[2], off[7], off[8], off[9]], ["3", "0", "1", hat]);
  assert.strictEqual((await b.nextXt("il"))[8], "0"); // ben sees it come off
  say(a, own[4], "!outfit wear hat");
  // "3": what is worn changed, [.., onCount, offCount, (inv, def)...]
  const worn = await a.nextXt("il");
  assert.deepStrictEqual([worn[2], worn[7], worn[8], worn[9]], ["3", "1", "0", hat]);
  assert.strictEqual((await a.nextXt("xtl"))[2], "Wearing hat.");
  await a.nextXt("uc");
  assert.deepStrictEqual((await b.nextXt("il")).slice(8, 10), ["1", shop[9]]); // and back on

  // --- the order an animal's clothes are painted in (the avatar editor's
  // layers panel, "xlo"): a second of the same hat, put under the first.
  // Ben is told before what she wears, and with her player card.
  a.xt("ib", own[4], 5, 1, shop[9], 0, 0, -1, "");
  const hat2 = (await a.nextXt("il"))[9];
  await a.nextXt("ib");
  a.xt("iu", own[4], 1, 0, hat2);
  await a.nextXt("iu");
  await a.nextXt("il");
  await b.untilXt("il");
  assert.deepStrictEqual(b.layerOrders, []); // never given an order: nothing told
  a.xt("xlo", own[4], 3, shop[9], hat2, shop[9], hat, shop[9], 999999); // the last is not hers
  await b.untilXt("il");
  const layerOrder = b.layerOrders.pop();
  assert.deepStrictEqual([layerOrder[2], ...layerOrder.slice(4)], ["Ann", "2", shop[9], hat2, shop[9], hat]);
  b.xt("ag", own[4], "Ann");
  await b.untilXt("ag");
  assert.deepStrictEqual(b.layerOrders.pop().slice(4), ["2", shop[9], hat2, shop[9], hat]);
  a.xt("iu", own[4], 0, 1, hat2); // what she no longer wears is not told
  await a.nextXt("iu");
  await a.nextXt("il");
  await b.untilXt("il");
  assert.deepStrictEqual(b.layerOrders.pop().slice(4), ["1", shop[9], hat]);
  a.xt("xlo", own[4], 0); // the game's own order again
  await b.untilXt("il");
  assert.deepStrictEqual(b.layerOrders.pop().slice(4), ["0"]);
  a.xt("xlo", own[4], 2, shop[9], "x", shop[9], hat); // not numbers: nothing changes
  b.xt("ag", own[4], "Ann");
  await b.untilXt("ag");
  assert.deepStrictEqual(b.layerOrders.pop().slice(4), ["0"]);

  // --- outfits keep the order too, and the avatar editor's outfits window
  // ("xol", "xos", "xod") lists, saves and deletes them.
  a.xt("iu", own[4], 1, 0, hat2);
  await a.nextXt("iu");
  await a.nextXt("il");
  a.xt("xlo", own[4], 2, shop[9], hat2, shop[9], hat); // hat2 under hat
  await b.untilXt("il");
  a.layerOrders.length = 0;
  say(a, own[4], "!outfit save stack");
  assert.strictEqual((await a.untilXt("xtl"))[2], "Outfit stack saved (2 items).");
  a.xt("xol", own[4]);
  const listed = await a.untilXt("xol");
  const hatColour = listed[7];
  assert.deepStrictEqual(listed.slice(2), ["2", "hat", "0", "1", shop[9], hatColour, hat,
    "stack", "1", "2", shop[9], hatColour, hat2, shop[9], hatColour, hat]);
  // an outfit saved in no order is worn in the game's own: Ann's order is told as none
  say(a, own[4], "!outfit wear hat");
  await a.untilXt("il");
  assert.deepStrictEqual(a.layerOrders.pop().slice(4), ["0"]);
  await a.untilXt("xtl");
  // the ordered one brings its order, which is told before what she wears
  say(a, own[4], "!outfit wear stack");
  await a.untilXt("il");
  assert.deepStrictEqual(a.layerOrders.pop().slice(4), ["2", shop[9], hat2, shop[9], hat]);
  await a.untilXt("xtl");
  await b.untilXt("il");
  assert.deepStrictEqual(b.layerOrders.pop().slice(4), ["2", shop[9], hat2, shop[9], hat]);
  // and undo goes back to the outfit before, in its order (none)
  say(a, own[4], "!outfit undo");
  await a.untilXt("il");
  assert.deepStrictEqual(a.layerOrders.pop().slice(4), ["0"]);
  await a.untilXt("xtl");
  // the editor saves a new order ("xlo") and then the clothes ("iu"): undo
  // brings back the clothes and the order from before both
  say(a, own[4], "!outfit wear stack");
  await a.untilXt("xtl");
  await b.untilXt("il");
  a.xt("xlo", own[4], 2, shop[9], hat, shop[9], hat2);
  await b.untilXt("il");
  a.xt("iu", own[4], 0, 1, hat2);
  await a.untilXt("iu");
  await a.untilXt("il");
  a.layerOrders.length = 0;
  say(a, own[4], "!outfit undo");
  const undone = await a.untilXt("il");
  assert.deepStrictEqual([undone[7], undone[8]], ["2", "0"]);
  assert.deepStrictEqual(a.layerOrders.pop().slice(4), ["2", shop[9], hat2, shop[9], hat]);
  await a.untilXt("xtl");
  // the window: what the editor shows, kept under a name; a piece not hers is left out
  a.xt("xos", own[4], "Top", 1, 3, hat, hat2, 999999);
  const saved = await a.untilXt("xol");
  assert.deepStrictEqual(saved.slice(2, 3).concat(saved.slice(18)), ["3", "top", "1", "2", shop[9], hatColour, hat, shop[9], hatColour, hat2]);
  a.xt("xos", own[4], "no way", 0, 0); // not a name the chat box can type
  assert.match((await a.untilXt("xtl"))[2], /letters and digits/);
  await a.untilXt("xol");
  a.xt("xod", own[4], "top");
  assert.strictEqual((await a.untilXt("xol"))[2], "2");
  a.xt("xod", own[4], "stack");
  await a.untilXt("xol");
  a.xt("iu", own[4], 0, 1, hat2);
  await a.untilXt("iu");
  await a.untilXt("il");
  await b.untilXt("il");

  // --- Jam-A-Grams: a card, a stamp, typed words and the hat as a gift
  a.xt("gl", own[4], 10);
  const cards = await a.nextXt("gl");
  assert.ok(cards[3] === "1033" && Number(cards[8]) > 100 && cards[9] === "1");
  a.xt("gl", own[4], 44);
  const stamps = await a.nextXt("gl");
  a.xt("es", own[4], "Ben", cards[9], 9999, 2, "hello", 0, 0, 0); // no such stamp
  assert.deepStrictEqual((await a.nextXt("es")).slice(2), ["0"]);
  a.xt("es", own[4], "Ben", cards[9], stamps[9], 2, "A hat for you!", 1, hat, 0);
  // the hat leaves Ann's inventory with the card.
  const sent = await a.nextXt("il");
  assert.deepStrictEqual([sent[2], sent[7], sent[8], sent[9]], ["2", "0", "1", hat]);
  assert.deepStrictEqual((await a.nextXt("es")).slice(2), ["1"]);
  const pushed = await b.untilXt("ep");
  // a clothing gift goes by the id of its picture (the def's layerDefId,
  // lib/ecards.js giftId), not the item's
  assert.deepStrictEqual(pushed.slice(3, 9), ["Ann", cards[9], stamps[9], "0", "A hat for you!", "1"]);
  assert.ok(Number(pushed[9]) > 0);
  b.xt("el", own[4], 0);
  const inbox = await b.nextXt("el");
  assert.deepStrictEqual([inbox[2], inbox.length], ["1", 3 + 17]);
  b.xt("er", own[4], pushed[2]);
  assert.deepStrictEqual((await b.nextXt("er")).slice(2), [pushed[2], "1"]);
  b.xt("eg", own[4], pushed[2], 1);
  assert.deepStrictEqual((await b.nextXt("il")).slice(2, 3).concat((await b.nextXt("eg")).slice(2)), ["2", pushed[2], "1"]);
  b.xt("eg", own[4], pushed[2], 1); // the gift is taken only once
  assert.deepStrictEqual((await b.nextXt("eg")).slice(2), [pushed[2], "0"]);
  b.xt("ed", own[4], pushed[2]);
  assert.deepStrictEqual((await b.nextXt("ed")).slice(2), ["1", "1", pushed[2]]);
  b.xt("ei", own[4], 0); // ben takes Jam-A-Grams from nobody now (the inbox's first button)
  assert.deepStrictEqual((await b.nextXt("ei")).slice(2), ["1"]);
  a.xt("es", own[4], "Ben", cards[9], stamps[9], 2, "again", 0, 0, 0);
  assert.deepStrictEqual((await a.nextXt("es")).slice(2), ["-2"]);
  b.xt("ei", own[4], 2); // and from everyone again
  await b.nextXt("ei");

  // secret valentines are off (lib/ecards.js): one asked for is refused
  a.xt("es", own[4], "Ben", cards[9], stamps[9], 2, "GUESS WHO", 0, 0, 1);
  assert.deepStrictEqual((await a.nextXt("es")).slice(2), ["0"]);

  // --- Jammer Walls: the wallpapers a wall cannot be drawn without, and their buttons
  a.xt("gl", own[4], 314);
  const wallpapers = await a.nextXt("gl");
  a.xt("gl", own[4], 313);
  const wallpaperButtons = await a.nextXt("gl");
  assert.ok(wallpapers[3] === "1033" && Number(wallpapers[8]) > 19 && wallpapers[8] === wallpaperButtons[8]); // 19: a new wall's wallpaper
  a.xt("gl", own[4], 646);
  assert.ok(Number((await a.nextXt("gl"))[8]) > 10);
  a.xt("dmi", own[4], "Ben"); // masterpieces hung on the wall: none, but it waits to hear
  assert.deepStrictEqual((await a.nextXt("dmi")).slice(2), ["0"]);
  a.xt("crg", own[4], "jammerwall", benLogin.params.uuid, annLogin.params.uuid, "report");
  assert.deepStrictEqual((await a.nextXt("crg")).slice(2), ["1", "0", "0"]); // found, not liked by me, no likes
  a.xt("crp", own[4], "jammerwall", benLogin.params.uuid, annLogin.params.uuid);
  assert.deepStrictEqual((await a.nextXt("crp")).slice(2), ["1"]);
  a.xt("crp", own[4], "jammerwall", benLogin.params.uuid, annLogin.params.uuid); // one like each
  assert.deepStrictEqual((await a.nextXt("crp")).slice(2), ["0"]);
  b.xt("crg", own[4], "jammerwall", benLogin.params.uuid, benLogin.params.uuid, "report");
  assert.deepStrictEqual((await b.nextXt("crg")).slice(2), ["1", "0", "1"]);

  // --- Jammer Walls: a token over the socket, then JSON over HTTP
  a.xt("wsg", own[4], "Ben");
  assert.deepStrictEqual((await a.nextXt("wsg")).slice(2), ["2"]); // open to everyone
  a.xt("wt", own[4], "Ben");
  const token = await a.nextXt("wt");
  assert.deepStrictEqual([token[2], token[4], token[5], token[6]], ["1", "1", "1", "Ben"]);
  assert.deepStrictEqual(await wall({cmd: "GET", t: "nonsense"}), {s: false, e: "token"});
  const before = await wall({cmd: "GET", t: token[3]});
  assert.deepStrictEqual([before.s, before.r, before.p.bg, before.p.visits], [true, [], "19", 0]);
  const put = await wall({cmd: "PUT", t: token[3], m: "Nice wall, Ben!", s: 2, c: 3, ai: 1, ac: [1, 2, 3], ae: 4, ap: 5, l: 0, aci: -1, sid: 999});
  assert.strictEqual(put.PUT.s, true);
  assert.deepStrictEqual([put.GET.r.length, put.GET.r[0].m, put.GET.r[0].un, put.GET.r[0].uid, put.GET.r[0].x], [1, "Nice wall, Ben!", "Ann", annLogin.params.dbUserId, put.x]);
  assert.strictEqual((await wall({cmd: "CHK", t: token[3]})).t, put.t);
  a.xt("wci", own[4], "Ben");
  assert.deepStrictEqual((await a.nextXt("wci")).slice(2), ["1"]);
  b.xt("wt", own[4], "Ben");
  const ownToken = (await b.nextXt("wt"))[3];
  b.xt("wps", own[4], JSON.stringify({bg: "7", tag: "hello there", visits: 5000}));
  assert.deepStrictEqual((await b.nextXt("wps")).slice(2), ["1"]);
  const mine = await wall({cmd: "GET", t: ownToken});
  assert.deepStrictEqual([mine.p.bg, mine.p.tag, mine.p.visits, mine.r.length], ["7", "hello there", 1, 1]); // visits are not the owner's to set
  // the photo booth picture: its animal, its pet and what it wears, kept
  const photo = {avatar: {id: 4, color1: 1463028479, color2: 603979776, color3: 83885823, eyes: 4, pattern: 25}, bgid: 3,
    pet: {ts: 1792133948, lbits: 25, uBits: 0, eBits: 0}, items: [{id: 101, color: 1463028479}, {id: 202, color: 0}]};
  b.xt("wps", own[4], JSON.stringify({pb: photo}));
  assert.deepStrictEqual((await b.nextXt("wps")).slice(2), ["1"]);
  assert.deepStrictEqual((await wall({cmd: "GET", t: ownToken})).p.pb, photo);
  b.xt("wps", own[4], JSON.stringify({pb: {avatar: {deep: {deeper: 1}}}})); // but no deeper than that
  assert.deepStrictEqual((await b.nextXt("wps")).slice(2), ["0"]);
  assert.deepStrictEqual(await wall({cmd: "CLW", t: token[3]}), {s: false}); // only the owner clears a wall
  assert.deepStrictEqual(await wall({cmd: "DEL", t: ownToken, x: put.x}), {s: true});
  assert.strictEqual((await wall({cmd: "GET", t: ownToken})).r.length, 0);
  b.xt("wss", own[4], 0); // locked
  assert.deepStrictEqual((await b.nextXt("wss")).slice(2), ["1"]);
  assert.deepStrictEqual(await wall({cmd: "GET", t: token[3]}), {s: false, e: "token"});
  a.xt("wt", own[4], "Ben");
  assert.deepStrictEqual((await a.nextXt("wt")).slice(2), ["-1"]);
  b.xt("wss", own[4], 2);
  await b.nextXt("wss");

  // --- reports: the reason, what was typed, and what the reported player had been saying
  say(b, own[4], "something rude");
  await b.nextXt("uc");
  await a.untilXt("uc");
  a.xt("xrd", own[4], "Ben", 2, "He keeps saying rude things in my party");
  a.xt("fr", own[4], "Ben", 2);
  assert.deepStrictEqual((await a.nextXt("fr")).slice(2), ["1"]);
  const waiting = (await panel("reports", undefined, admin)).data;
  const reportId = waiting.reports[0].id;
  assert.strictEqual(waiting.open, 1);
  assert.strictEqual(waiting.reports.length, 1);
  assert.deepStrictEqual([waiting.reports[0].reporter, waiting.reports[0].target, waiting.reports[0].reason, waiting.reports[0].detail, waiting.reports[0].room],
    ["Ann", "Ben", "Bad words", "He keeps saying rude things in my party", "ppartyAnn"]);
  assert.match(waiting.reports[0].context, /something rude/);
  assert.strictEqual((await panel("overview", undefined, admin)).data.stats.reports, 1);
  assert.strictEqual((await panel("report", {id: waiting.reports[0].id}, admin)).status, 200);
  assert.strictEqual((await panel("reports", undefined, admin)).data.open, 0);
  assert.strictEqual((await panel("reports?handled=1", undefined, admin)).data.reports.length, 1); // this one (secret valentines, reported before, are off)

  // --- blocking: no chat from them, out of my party and my den, and out of sight if I say so
  a.xt("bb", own[4], "Ben");
  assert.deepStrictEqual((await a.nextXt("bb")).slice(2), ["Ben", "1"]);
  // ben is sent back to the township: a room change he did not ask for.
  const sentHome = await b.untilXt("rj");
  assert.deepStrictEqual(sentHome.slice(2, 4), ["1", TOWNSHIP]);
  const home = sentHome[4]; // the township emptied meanwhile, so it is a new room
  await b.nextXt("rp");
  assert.deepStrictEqual((await a.nextXt("ar")).slice(2), [String(benLogin.params.userId)]);
  b.xt("au", home, 1, 300, 300, 14, 1);
  b.xt("sjp", home, annLogin.params.uuid);
  assert.deepStrictEqual((await b.nextXt("sjp")).slice(2), ["0", "BLK"]);
  b.xt("slp", home, 0, 200);
  assert.deepStrictEqual((await b.nextXt("slp")).slice(2, 4), ["1", "0"]); // nor is it listed for him
  b.xt("dj", home, "denAnn", 1, -1);
  assert.strictEqual((await b.nextXt("rj"))[2], "0");
  b.xt("wt", home, "Ann");
  assert.deepStrictEqual((await b.nextXt("wt")).slice(2), ["-1"]);

  a.xt("rj", own[4], TOWNSHIP, 1, 0, 0);
  await a.untilXt("rj");
  await a.nextXt("rp");
  await a.nextXt("ac"); // ben is drawn: blocked, but not hidden yet
  await a.nextXt("il");
  a.xt("au", home, 1, 500, 500, 14, 1);
  await b.untilXt("ac");
  await b.nextXt("il");
  say(b, home, "can you hear me");
  await b.nextXt("uc");
  say(a, home, "hello");
  assert.strictEqual((await a.nextXt("uc"))[3], "hello"); // ben's line never came
  assert.strictEqual((await b.nextXt("uc"))[3], "hello"); // though he still hears Ann
  say(a, home, "!hideblocked on");
  assert.deepStrictEqual((await a.nextXt("ar")).slice(2), [String(benLogin.params.userId)]);
  assert.strictEqual((await a.nextXt("xtl"))[2], "Players you have blocked are now hidden from you.");
  await a.nextXt("uc");
  b.xt("au", home, 2, 310, 310, 320, 320, 14, 0); // ben walks about: nothing for Ann
  a.xt("zg", home);
  const vars = await a.nextXt("zg");
  assert.strictEqual(vars[vars.indexOf("9001", 3) + 2], "1");
  a.xt("zs", home, 9001, 0, 1); // the settings window's switch, off again
  assert.deepStrictEqual((await a.nextXt("ac")).slice(2, 3), [String(benLogin.params.userId)]);
  await a.nextXt("il");
  assert.deepStrictEqual((await a.nextXt("zs")).slice(2), ["9001", "0", "0"]);
  a.xt("bu", home, "Ben");
  assert.deepStrictEqual((await a.nextXt("bu")).slice(2), ["Ben", "1"]);

  // blocking someone standing in my den puts them outside, with the game's own notice.
  b.xt("dj", home, "denAnn", 1, -1);
  const denId = (await b.untilXt("rj"))[4];
  await b.nextXt("rp");
  await b.nextXt("ds");
  a.xt("bb", home, "Ben");
  await a.untilXt("bb");
  await b.nextXt("dpk");
  assert.deepStrictEqual((await b.nextXt("rj")).slice(2, 4), ["1", TOWNSHIP]);
  await b.nextXt("rp");
  a.xt("bu", home, "Ben");
  await a.untilXt("bu");

  // --- den layouts: save, clear, load; and copying a den one stands in
  a.xt("dj", home, "denAnn", 1, -1);
  const annDen = (await a.untilXt("rj"))[4];
  await a.nextXt("rp");
  await a.nextXt("ds");
  a.xt("au", annDen, 1, 200, 200, 14, 1);
  a.xt("gl", annDen, 9);
  const denShop = await a.nextXt("gl");
  a.xt("db", annDen, 0, 9, denShop[9], 0, 0, 0, 0, "");
  await a.nextXt("db");
  const chair = denItems(await a.nextXt("di")).find(item => item.def === denShop[9]).inv;
  a.xt("ds", annDen, 1, 0, chair, 1, 120, 340, 1, "", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  await a.nextXt("dss");
  say(a, annDen, "!den save cosy");
  assert.strictEqual((await a.nextXt("xtl"))[2], "Den layout cosy saved (1 items).");
  await a.nextXt("uc");
  a.xt("de", annDen);
  await a.nextXt("de");
  await a.nextXt("di");
  say(a, annDen, "!den load cosy");
  assert.deepStrictEqual(denItems(await a.nextXt("di")).find(item => item.inv === chair), {inv: chair, def: denShop[9], placed: "1"}); // placed again
  assert.deepStrictEqual((await a.nextXt("ds")).slice(2, 10), ["1", "0", "0", chair, denShop[9], "1", "120", "340"]);
  assert.strictEqual((await a.nextXt("xtl"))[2], "Den layout cosy loaded.");
  await a.nextXt("uc");

  b.xt("dj", home, "denAnn", 1, -1);
  await b.untilXt("rj");
  await b.nextXt("rp");
  await b.nextXt("ac"); // Ann, at home
  await b.nextXt("il");
  await b.nextXt("ds");
  say(b, annDen, "!den copy");
  const copied = denItems(await b.nextXt("di")); // ben had no such chair: he has one now, placed
  assert.deepStrictEqual(copied.map(item => [item.def, item.placed]), [[denShop[9], "1"]]);
  assert.strictEqual((await b.nextXt("xtl"))[2], "Your den now looks like this one.");
  await b.nextXt("uc");

  // --- the panel: announcements, gifts, what an account owns, the ban list
  const announced = await panel("announce", {text: "Party at Ann's den"}, admin);
  assert.deepStrictEqual(announced.data, {ok: "Shown to 1 player."}); // Ann has walked about; Ben has not moved in the den yet
  assert.strictEqual((await a.untilXt("ua"))[1], "Party at Ann's den");
  const rooms = (await panel("messages", undefined, admin)).data.rooms;
  assert.deepStrictEqual(rooms.find(room => room.name === "denAnn"), {name: "denAnn", title: "Ann's Den", players: 2});
  assert.strictEqual((await panel("announce", {text: "nobody there", room: "no.such#1"}, admin)).data.ok, "Shown to 0 players.");
  // a picture with it is fetched by the server (lib/announcemedia.js), never
  // from this machine or its network; nothing is announced when it fails
  const privateLink = await panel("announce", {text: "look", media: "http://127.0.0.1/logo.png"}, admin);
  assert.deepStrictEqual([privateLink.status, privateLink.data.error], [400, "The picture: That link is to a private address, which cannot be used."]);
  assert.strictEqual((await panel("announce", {media: "not a link"}, admin)).status, 400);

  // gifts come as Jam-A-Grams from Animal Jam HQ. diamonds: the client is
  // told a code was redeemed, asks for its cards and opens a gift popup.
  assert.strictEqual((await panel("account", {username: "Ben", action: "gift", kind: "diamonds", amount: 7, text: "7 for you"}, admin)).status, 200);
  assert.deepStrictEqual((await b.untilXt("grc")).slice(2), ["1", "", "0"]);
  b.xt("el", annDen, 0); // the inbox does not list it
  assert.strictEqual((await b.nextXt("el"))[2], "0");
  b.xt("el", annDen, 1); // the popups' request does
  const popupCards = await b.nextXt("el");
  // sender, message (not starting with a number), type 9 = diamonds, amount, sender type 2 = opens as a popup
  assert.deepStrictEqual([popupCards[2], popupCards[4], popupCards[8], popupCards[9], popupCards[10], popupCards[16]],
    ["1", "Dusklight HQ", "Gift: 7 for you", "9", "7", "2"]);
  b.xt("eg", annDen, popupCards[3], 1);
  assert.deepStrictEqual((await b.nextXt("cu")).slice(2), ["3", String(benLogin.params.diamondsCount + 7), "0"]);
  assert.deepStrictEqual((await b.nextXt("eg")).slice(2), [popupCards[3], "1"]);
  b.xt("el", annDen, 1);
  assert.strictEqual((await b.nextXt("el"))[2], "0"); // answered, so gone
  // an item waits in the inbox, from "the voice": the name is string 15964, "Animal Jam HQ".
  assert.strictEqual((await panel("account", {username: "Ben", action: "gift", kind: "den", id: Number(denShop[9])}, admin)).status, 200);
  const hqCard = await b.nextXt("ep");
  assert.deepStrictEqual([hqCard[3], hqCard[7], hqCard[8], hqCard[9], hqCard[15]], ["15964", "A gift for you!", "3", denShop[9], "1"]);
  b.xt("eg", annDen, hqCard[2], 1);
  assert.strictEqual((await b.nextXt("di"))[3], "2");
  assert.deepStrictEqual((await b.nextXt("eg")).slice(2), [hqCard[2], "1"]);
  assert.strictEqual((await panel("account", {username: "Ben", action: "gift", kind: "den", id: 99999999}, admin)).status, 400);
  assert.strictEqual((await panel("account", {username: "Ben", action: "gift", kind: "tickets", amount: 3}, admin)).status, 200); // no card for tickets
  assert.deepStrictEqual((await b.nextXt("cu")).slice(2, 3), ["1"]);
  assert.strictEqual((await panel("account", {username: "Ben", action: "gift", kind: "achievement", id: 99}, admin)).status, 200);
  assert.strictEqual((await panel("account", {username: "Ben", action: "gift", kind: "achievement", id: 99}, admin)).status, 400); // already has it
  assert.match((await panel("account", {username: "Cat", action: "gift", kind: "adopt", id: "all"}, admin)).data.ok, /^Cat has \d+ more/);

  const owned = (await panel("owned?username=Ben", undefined, admin)).data;
  assert.deepStrictEqual([owned.animals.length, owned.denItemsTotal, owned.denItems[0].count, owned.clothingTotal, owned.currency.diamonds],
    [1, 2, 2, 1, benLogin.params.diamondsCount + 7]);
  assert.ok(owned.achievements >= 1 && owned.clothing[0].name.length > 0);

  assert.deepStrictEqual((await panel("bans", undefined, admin)).data.accounts, []);
  await panel("account", {username: "Cat", action: "ban", hours: 0}, admin);
  await panel("account", {username: "Ben", action: "silence", hours: 1}, admin);
  const disciplined = (await panel("bans", undefined, admin)).data.accounts;
  assert.deepStrictEqual(disciplined.map(entry => [entry.username, entry.banned, entry.silenced > 1700]), [["Ben", 0, true], ["Cat", -1, false]]);

  // --- the panel's Debug page: into a room nothing leads to, and sale dates off
  const debug = (await panel("debug", undefined, admin)).data;
  assert.ok(debug.players.includes("Ann") && debug.rooms.length > 400 && debug.everythingOnSale === false);
  assert.match(debug.rooms.find(room => room.path === "epic_dens/room_solarcade2").note, /Epic Dens/);
  assert.strictEqual((await panel("debug", {action: "teleport", username: "Ann", room: "epic_dens/room_solarcade2"}, admin)).status, 200);
  assert.strictEqual((await a.untilXt("rj"))[3].split("#")[0], "epic_dens.room_solarcade2");
  assert.strictEqual((await panel("debug", {action: "teleport", username: "Ann", room: "no/such_room"}, admin)).status, 400);
  assert.strictEqual((await panel("debug", {action: "teleport", username: "Cat", room: "jamaa_township/room_main"}, admin)).status, 400); // not playing
  // den items out of season have dates in the pack clients get; with the switch on, none do.
  const zlib = require("zlib");
  const amf3 = require("../lib/amf3.js");
  const cdn = require("../lib/cdn.js");
  const dated = async pack => Object.values(amf3.decode(zlib.inflateRawSync(Buffer.from(
    await (await fetch(`${BASE}/${cdn.hashedPath(`defPacks/${pack}`)}`)).arrayBuffer())))).filter(def => Number(def.availabilityEndTime) > 0).length;
  assert.ok(await dated(1030) > 0);
  assert.strictEqual((await panel("debug", {action: "everythingOnSale", on: true}, admin)).status, 200);
  assert.strictEqual(await dated(1030), 0);
  await panel("debug", {action: "everythingOnSale", on: false}, admin);
  assert.ok(await dated(1030) > 0);

  // Renames must carry the names shown on existing moderation records.
  // The admin action disconnects Ben before making this change.
  assert.strictEqual((await panel("account", {username: "Ben", action: "rename", newName: "Benny"}, admin)).status, 200);
  const renamedReport = (await panel("reports?handled=1", undefined, admin)).data.reports.find(report => report.id === reportId);
  assert.strictEqual(renamedReport.target, "Benny");

  a.socket.destroy();
  b.socket.destroy();
};

harness.withServer("feature test", HTTP_PORT, GAME_PORT, run).catch(err => {
  console.error(err);
  process.exit(1);
});
