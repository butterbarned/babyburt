"use strict";

// end-to-end check of what was brought back from the game's files: showcase
// dens, animals and dens out of season, added dens and parties, the shops
// of odd items, rooms shown as another version of themselves. simulated
// players, a real server.

const assert = require("assert");
const zlib = require("zlib");
const amf3 = require("../lib/amf3.js");
const cdn = require("../lib/cdn.js");
const harness = require("./harness.js");

const HTTP_PORT = 18082;
const GAME_PORT = 19341;
const BASE = `http://127.0.0.1:${HTTP_PORT}`;
const TOWNSHIP = "jamaa_township.room_main#1";
const {postJson} = harness;

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

// A defPack as clients get it from this server, as its rows.
const pack = async id => Object.values(amf3.decode(zlib.inflateRawSync(Buffer.from(
  await (await fetch(`${BASE}/${cdn.hashedPath(`defPacks/${id}`)}`)).arrayBuffer()))));
const byId = (rows, id) => rows.find(row => String(row.id) === String(id));

const run = async () => {
  const registerJson = body => fetch(`${BASE}/api/register`, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({avatarType: 1, agreed: true, ...body})});
  for (const username of ["Ann", "Ben"]) {
    assert.strictEqual((await registerJson({username, password: "KettlePass01"})).status, 200);
  }
  const {client: a, roomId} = await arrive("Ann", "KettlePass01");

  // --- Epic Dens: twenty names; asking for the den of one leads into its room
  a.xt("dh", roomId);
  const epic = await a.nextXt("dh");
  assert.strictEqual(epic[2], "20");
  assert.strictEqual(new Set(epic.slice(3)).size, 20);
  a.xt("dj", roomId, `den${epic[3]}`, 1, -1);
  const showcase = await a.untilXt("rj");
  assert.match(showcase[3], /^epic_dens\.room_\w+#1$/);
  assert.strictEqual(showcase[14], epic[3]); // the name in the corner of the screen
  assert.match((await a.nextXt("rp"))[2], /^epic_dens\.room_/);
  // the AJHQ button is party 36: one more showcase den, not one of the twenty.
  a.xt("sj", showcase[4], 36);
  const featured = await a.untilXt("rj");
  assert.match(featured[3], /^party36_\d+$/);
  assert.ok(!epic.slice(3).includes(featured[14]));
  assert.match((await a.nextXt("rp"))[2], /^epic_dens\.room_/);
  assert.strictEqual(byId(await pack(1047), 36).titleStrId, "8700"); // "Epic Dens"

  // --- nothing is out of season among animals, pets and dens
  for (const id of [1003, 1046, 1040]) {
    assert.deepStrictEqual((await pack(id)).filter(def => Number(def.availabilityStartTime) > 0 || Number(def.availabilityEndTime) > 0), []);
  }

  // --- the four draft dens: in the pack, named, and for sale
  const dens = await pack(1040);
  assert.deepStrictEqual([62, 63, 64, 65].map(id => byId(dens, id).roomDefId), ["130", "187", "186", "441"]);
  const strings = amf3.decode(zlib.inflateRawSync(Buffer.from(await (await fetch(`${BASE}/${cdn.hashedPath("defPacks/10230")}`)).arrayBuffer())));
  assert.strictEqual(strings[byId(dens, 62).titleStrRef], "Castle (2010 draft)");
  assert.strictEqual(strings[157], "Small House"); // and the game's own are as they were
  // the den switcher asks for the slot it wants filled, and the den's id is that slot.
  a.xt("db", featured[4], -1, 0, 65, 3, 0);
  assert.strictEqual((await a.untilXt("db"))[2], "1");
  const owned = await a.nextXt("dl");
  assert.deepStrictEqual(owned.slice(2), ["2", "0", owned[4], "3", "65"]);
  a.xt("db", featured[4], -1, 0, 62, 3, 0); // a slot already taken: the first free one instead
  await a.untilXt("db");
  assert.deepStrictEqual((await a.nextXt("dl")).slice(7), ["1", "62"]);
  a.xt("dc", featured[4], 3);
  await a.nextXt("dc");
  a.xt("dj", featured[4], "denAnn", 1, -1);
  await a.untilXt("rj");
  assert.strictEqual((await a.nextXt("rp"))[2], "player_den.room_main_epicpalace");

  // --- four more parties, in the rooms nothing used
  a.xt("sl", roomId);
  const parties = await a.untilXt("sl");
  for (const id of ["54", "55", "56", "57"]) {
    assert.ok(parties.includes(id));
  }
  a.xt("sj", roomId, 56);
  await a.untilXt("rj");
  assert.strictEqual((await a.nextXt("rp"))[2], "party.venue_pl_res_bakery");

  // --- the shops of odd items: Beta furniture in the chamber base, the Founders' Hat in the archives
  const denItems = await pack(1030);
  a.xt("gl", roomId, 396);
  const oddDenItems = (await a.nextXt("gl")).slice(9);
  assert.ok(oddDenItems.length > 200);
  // what the shop really sold comes first (lib/shopstock.js), then the Beta set.
  assert.strictEqual(byId(denItems, oddDenItems[0]).abbrName, "ChamberLamp");
  assert.match(byId(denItems, oddDenItems.find(id => !/^Chamber/.test(byId(denItems, id).abbrName))).abbrName, /^Beta/);
  assert.ok(oddDenItems.some(id => /^Beta/.test(byId(denItems, id).abbrName)));
  assert.ok(oddDenItems.includes("3123")); // TestCloud
  assert.ok(oddDenItems.every(id => /^Chamber/.test(byId(denItems, id).abbrName) || byId(denItems, id).availabilityEndTime === "0"));
  a.xt("gl", roomId, 666);
  assert.ok((await a.nextXt("gl")).slice(9).includes("215"));

  // --- extra den music: den items like the official tracks, their audio cut out of the game's files, in no shop
  const track = byId(denItems, 6001);
  assert.deepStrictEqual([track.abbrName, track.typeCat, track.sortCat, strings[track.nameStrId]], ["XtraNarration", "4", "4", "Narration"]);
  assert.ok(byId(denItems, 6011));
  const mp3 = Buffer.from(await (await fetch(`${BASE}/${cdn.hashedPath("audio/XtraUnnamed.mp3")}`)).arrayBuffer());
  assert.ok(mp3.length > 3000 && mp3[0] === 0xFF && (mp3[1] & 0xE0) === 0xE0); // an MP3 frame
  for (const shop of [12, 51, 63, 85, 396]) {
    a.xt("gl", roomId, shop);
    assert.ok(!(await a.nextXt("gl")).slice(9).some(id => Number(id) >= 6001 && Number(id) <= 6011));
  }
  a.xt("gl", roomId, 401); // nor among the tracks a hosted party can play
  assert.ok(!(await a.nextXt("gl")).slice(9).includes("6001"));

  // --- a room shown as its other version: same room, another file
  const month = new Date().getUTCMonth() + 1;
  a.xt("rj", roomId, "appondale.room_museum#1", 1, 0, 0);
  assert.strictEqual((await a.untilXt("rj"))[3], "appondale.room_museum#1");
  assert.strictEqual((await a.nextXt("rp"))[2], month % 2 === 0 ? "appondale.room_museum_ant" : "appondale.room_museum");

  // --- mannequins: a den item that wears clothing of its owner's
  a.xt("ib", roomId, 666, 1, 215, 0, 0); // the Founders' Hat, a head item
  const hat = (await a.untilXt("il"))[9];
  await a.untilXt("ib");
  a.xt("db", roomId, 0, 12, 3433, 0, 0); // arctic Wolf Mannequin
  assert.strictEqual((await a.untilXt("db"))[2], "1");
  // the owner's list: eight fields, the ten of a mannequin (all 0 = bare, the animal's own colours), one more.
  const listed = await a.nextXt("di");
  // the last is all it wears (lib/dens.js mannequinTail), which an old client reads as int() = 0.
  assert.deepStrictEqual(listed.slice(5), [listed[5], "3433", "0", "0", "true", "", "-1", "", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0~~"]);
  const mannequin = listed[5];
  a.xt("dj", roomId, "denAnn", 1, -1);
  const den = (await a.untilXt("rj"))[4];
  await a.untilXt("ds");
  // placed, coloured, wearing the hat. the hat offered as a tail piece is not taken.
  a.xt("ds", den, 1, 0, mannequin, 1, 300, 400, 0, "off", 111, 222, 0, 333, 0, hat, 0, 0, 0, hat);
  assert.deepStrictEqual((await a.nextXt("dss")).slice(2), [mannequin]);
  a.xt("di", den);
  assert.deepStrictEqual((await a.nextXt("di")).slice(13, 24), ["111", "222", "0", "333", "0", "0", "0", "0", "0", hat, `0~~215_392491620_${hat}`]);
  // A visitor is told what the hat is: its def and colour, then its id.
  const {client: b, roomId: benRoom} = await arrive("Ben", "KettlePass01");
  b.xt("dj", benRoom, "denAnn", 1, -1);
  const seen = await b.untilXt("ds");
  assert.deepStrictEqual(seen.slice(5), [mannequin, "3433", "1", "300", "400", "0", "0", "", "", "-1", "",
    "111", "222", "0", "333", "0", "0", "0", "0", "0", "215", "392491620", hat, `0~~215_392491620_${hat}`]);

  // a mannequin wears as much as an animal may: three to a layer, in the owner's order.
  const hats = [hat];
  for (let i = 0; i < 3; i++) {
    a.xt("ib", den, 666, 1, 215, 0, 0);
    hats.push((await a.untilXt("il"))[9]);
    await a.untilXt("ib");
  }
  const wears = async () => {
    a.xt("di", den);
    const fields = (await a.untilXt("di")).slice(13, 24);
    return [fields[9], fields[10]];
  };
  const saveMannequin = (inv, head) => {
    a.xt("ds", den, 1, 0, inv, 1, 300, 400, 0, "off", 111, 222, 0, 333, 0, 0, 0, 0, 0, head);
    return a.untilXt("dss");
  };
  const piece = inv => `215_392491620_${inv}`;
  // a fourth hat is one too many for the layer; the order is kept, bottom first.
  await saveMannequin(mannequin, `${hats[2]}~o~${hats[2]}.${hats[0]}.${hats[3]}.${hats[1]}`);
  assert.deepStrictEqual(await wears(), [hats[2], `0~o~${[hats[2], hats[0], hats[3]].map(piece).join(".")}`]);
  // a client built before sends the five it was shown: that strips nothing...
  await saveMannequin(mannequin, hats[2]);
  assert.deepStrictEqual(await wears(), [hats[2], `0~o~${[hats[2], hats[0], hats[3]].map(piece).join(".")}`]);
  // ...but a change there is what it wears now, in the game's own order.
  await saveMannequin(mannequin, hats[1]);
  assert.deepStrictEqual(await wears(), [hats[1], `0~~${piece(hats[1])}`]);
  // a list that is not one is refused, and so the mannequin is as it was.
  await saveMannequin(mannequin, `${hats[0]}~o~${hats[0]}.x`);
  await saveMannequin(mannequin, `${hats[0]}~z~${hats[0]}`);
  assert.deepStrictEqual(await wears(), [hats[1], `0~~${piece(hats[1])}`]);
  // the same hat on a second mannequin comes off the first.
  a.xt("db", den, 0, 12, 3433, 0, 0);
  await a.untilXt("db");
  const list = await a.untilXt("di"); // each mannequin is 19 fields here
  const secondInv = list[5 + 19];
  assert.strictEqual(list[5 + 20], "3433");
  await saveMannequin(secondInv, `0~~${hats[1]}.${hats[3]}`);
  a.xt("di", den);
  const twoListed = await a.untilXt("di");
  assert.deepStrictEqual([twoListed[23], twoListed[23 + 19]], ["0~~", `0~~${piece(hats[1])}.${piece(hats[3])}`]);
  // the first mannequin has the first hat again, for what follows.
  await saveMannequin(mannequin, hat);
  assert.deepStrictEqual(await wears(), [hat, `0~~${piece(hat)}`]);
  // --- playing as an alpha: the client is told which character stands in for the animal
  const say = (client, room, text) => client.send(`<msg t='sys'><body action='pubMsg' r='${room}'><txt><![CDATA[${text}%0]]></txt></body></msg>`);
  a.xt("au", den, 1, 300, 300, 14, 1); // Ann has walked in: others see her
  await b.untilXt("ac");
  say(a, den, "!become liza");
  const disguised = await a.untilXt("dph");
  assert.deepStrictEqual(disguised.slice(2), ["1", disguised[3], "1", "21"]);
  // ben has her animal put on his screen afresh, and the disguise after it.
  assert.strictEqual((await b.untilXt("ac"))[2], disguised[3]);
  assert.deepStrictEqual((await b.untilXt("dph")).slice(2), ["1", disguised[3], "1", "21"]);
  assert.match((await a.untilXt("xtl"))[2], /^Done/);
  say(a, den, "!become nobody");
  assert.match((await a.untilXt("xtl"))[2], /no character called nobody/);
  say(a, den, "!become off");
  assert.deepStrictEqual((await a.untilXt("dph")).slice(2), ["1", disguised[3], "0", "2"]);
  await b.untilXt("ac");

  // the hat recycled: the mannequin is bare again.
  a.xt("ir", den, hat);
  await a.untilXt("ir");
  await a.nextXt("il");
  a.xt("di", den);
  assert.strictEqual((await a.nextXt("di"))[22], "0");

  // --- a player who is not in the game: their card still shows who they are
  assert.strictEqual((await registerJson({username: "Cat", password: "KettlePass01"})).status, 200);
  const {client: c, roomId: catRoom} = await arrive("Cat", "KettlePass01");
  c.xt("pc", catRoom, 312, 1, 0, 0, 15386, 15428, 0); // a pet, so there is one to list
  await c.untilXt("pc");
  c.socket.destroy();
  await new Promise(resolve => setTimeout(resolve, 200));
  b.xt("ag", benRoom, "cat", 1);
  const card = await b.untilXt("ag");
  assert.deepStrictEqual(card.slice(2, 5), ["Cat", card[3], "0"]); // found, offline
  b.xt("al", benRoom, "Cat");
  const animals = await b.nextXt("al");
  assert.deepStrictEqual(animals.slice(2, 4), ["Cat", "1"]);
  b.xt("ad", benRoom, "Cat", animals[4], 2);
  const animal = await b.nextXt("ad");
  assert.deepStrictEqual([animal[2], animal[9]], ["Cat", animals[4]]);
  assert.deepStrictEqual((await b.nextXt("il")).slice(2, 6), ["1", "0", animals[4], "Cat"]); // what it wears
  b.xt("pl", benRoom, "Cat");
  assert.deepStrictEqual((await b.nextXt("pl")).slice(2, 5), ["1", "Cat", "1"]);
  // A buddy request and a Jam-A-Gram for them wait until they are back.
  b.xt("ba", benRoom, "Cat");
  assert.deepStrictEqual((await b.nextXt("ba")).slice(2), ["1", "Cat", "1"]); // sent
  b.xt("gl", benRoom, 10);
  const cards = (await b.nextXt("gl")).slice(9);
  b.xt("gl", benRoom, 44);
  const stamps = (await b.nextXt("gl")).slice(9);
  b.xt("es", benRoom, "Cat", cards[0], stamps[0], 0, "see you soon", 0, 0, 0);
  assert.strictEqual((await b.untilXt("es"))[2], "1");
  const {client: c2, login: catLogin, roomId: catRoom2} = await arrive("Cat", "KettlePass01");
  assert.strictEqual(catLogin.params.numUnreadECards, 1);
  assert.deepStrictEqual((await c2.untilXt("ba")).slice(2), ["0", "Ben", "1"]); // asked, now that Cat is here
  c2.xt("bc", catRoom2, "Ben", 1);
  assert.deepStrictEqual((await c2.untilXt("bs")).slice(3, 4), ["Ben"]);
  assert.deepStrictEqual((await b.untilXt("bs")).slice(3, 4), ["Cat"]);

  // --- masterpieces: painted, posted, framed, reviewed, hung
  const panel = async (pathname, body, cookie) => {
    const response = await fetch(`${BASE}/admin/api/${pathname}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {"Content-Type": "application/json", ...(cookie ? {Cookie: cookie} : {})},
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const picture = (response.headers.get("content-type") || "").startsWith("image/");
    return {status: response.status, data: picture ? Buffer.from(await response.arrayBuffer()) : await response.json(),
      cookie: (response.headers.get("set-cookie") || "").split(";")[0]};
  };
  const admin = (await panel("setup", {password: "admin-password-1"})).cookie;
  const post = (token, picture) => {
    const form = new FormData();
    form.append("authToken", token);
    form.append("image", new Blob([picture], {type: "image/jpeg"}), "ArtStudioImage");
    return fetch(`${BASE}/game/mp`, {method: "POST", body: form}).then(response => response.json());
  };
  // the least a JPEG can be and pass for one: a header segment, a frame
  // header (100 by 100), the start of the picture data, some of it, the end.
  const jpeg = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0, 16]), Buffer.alloc(14),
    Buffer.from([0xFF, 0xC0, 0, 11, 8, 0, 100, 0, 100, 1, 1, 0x11, 0]), Buffer.from([0xFF, 0xDA, 0, 8, 1, 1, 0, 0, 63, 0]),
    Buffer.alloc(400, 7), Buffer.from([0xFF, 0xD9])]);
  // the frames: 24 of them, each with a name.
  a.xt("gl", den, 424);
  const frames = await a.untilXt("gl");
  assert.deepStrictEqual([frames[8], frames[9], frames[10]], ["24", "4813", "25174"]);
  // the easel asks for a token; the painting is posted with it, once.
  // the easel's popup needs Pixel Painting described along with Painting.
  a.xt("mi", den, 51);
  const described = await a.untilXt("mi");
  assert.deepStrictEqual([described[2], described[3], described[3 + 19]], ["2", "51", "139"]);
  a.xt("mj", den, 51, 0, 0, 0);
  const easel = (await a.untilXt("mj"))[1];
  // the admin can turn Masterpieces off, and set how old an account must be
  // (lib/creatorlimits.js): either way no token, and a message says why
  const refused = async () => {
    a.xt("mm", easel, 51, "gmtkn", 0, 1);
    const said = await a.untilXt("xtl");
    assert.strictEqual((await a.untilXt("mm"))[3], "0");
    return said[2];
  };
  assert.strictEqual((await panel("creator-limits", {masterpieces: false}, admin)).status, 200);
  assert.match(await refused(), /turned off/);
  assert.strictEqual((await panel("creator-limits", {masterpieces: true, limits: {masterpieceMinAgeHours: 48}}, admin)).status, 200);
  assert.match(await refused(), /once they are 2 days old/);
  assert.match((await panel("account", {username: "Ann", action: "creatorLimits", limits: {masterpieceMinAgeHours: 0}}, admin)).data.ok, /own limits/);
  assert.strictEqual((await panel("creator-limits", {limits: {masterpieceMinAgeHours: null}}, admin)).status, 200);
  a.xt("mm", easel, 51, "gmtkn", 0, 1);
  const tokenReply = await a.untilXt("mm");
  assert.deepStrictEqual([tokenReply[2], tokenReply[3], tokenReply[7]], ["tkn", "1", "1"]);
  assert.deepStrictEqual(await post("not-a-token", jpeg), {success: false});
  const posted = await post(tokenReply[5], jpeg);
  assert.strictEqual(posted.success, true);
  assert.deepStrictEqual(await post(tokenReply[5], jpeg), {success: false});
  assert.deepStrictEqual(Buffer.from(await (await fetch(`${BASE}/masterpieces/${posted.uuid}`)).arrayBuffer()), jpeg);
  // framed (frame 2) for two diamonds: an item, not approved, that will not go on a wall.
  a.xt("db", den, 0, 0, 221, 2, 1, 1, 0, posted.uuid);
  const bought = await a.untilXt("db");
  assert.strictEqual(bought[2], "1");
  const painting = bought[6];
  const framed = await a.nextXt("di");
  const at = framed.indexOf(painting, 5);
  assert.deepStrictEqual(framed.slice(at, at + 9), [painting, "2725", "0", "2", "false", posted.uuid, String(framed[at + 6]), framed[at + 7], "0"]);
  assert.match(framed[at + 7], /^[0-9a-f-]{36}$/); // Ann's uuid: she made it
  a.xt("ds", den, 1, 0, painting, 1, 500, 300, 0, "off", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  assert.deepStrictEqual((await a.untilXt("dss")).slice(2), []);
  // ben cannot frame Ann's painting.
  b.xt("db", benRoom, 0, 0, 221, 0, 1, 1, 0, posted.uuid);
  assert.strictEqual((await b.untilXt("db"))[2], "0");
  // the panel has it waiting, with the picture; approving tells Ann.
  const waiting = (await panel("masterpieces", undefined, admin)).data;
  assert.deepStrictEqual([waiting.review, waiting.waiting.map(entry => [entry.id, entry.creator]), waiting.approved], [true, [[posted.uuid, "Ann"]], []]);
  assert.deepStrictEqual((await panel(`masterpiece?id=${posted.uuid}`, undefined, admin)).data, jpeg);
  assert.strictEqual((await panel(`masterpiece?id=${posted.uuid}`)).status, 401);
  assert.strictEqual((await panel("masterpiece", {id: posted.uuid, action: "approve"}, admin)).status, 200);
  assert.match((await a.untilXt("ep"))[7], /approved/);
  // on show, with who approved it and when: the last approved first
  const onShow = (await panel("masterpieces", undefined, admin)).data.approved;
  assert.deepStrictEqual(onShow.map(entry => [entry.id, entry.approvedBy]), [[posted.uuid, "admin"]]);
  assert.ok(Math.abs(onShow[0].approvedAt - Date.now() / 1000) < 60);
  const approved = await a.nextXt("di");
  assert.strictEqual(approved[approved.indexOf(painting, 5) + 4], "true");
  // hung, once Ann is home from the easel: a visitor is told which painting and whose.
  a.xt("dj", den, "denAnn", 1, -1);
  await a.untilXt("ds");
  a.xt("ds", den, 1, 0, painting, 1, 500, 300, 0, "off", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  assert.deepStrictEqual((await a.untilXt("dss")).slice(2), [painting]);
  const hung = await b.untilXt("ds");
  const spot = hung.indexOf(painting, 5);
  assert.deepStrictEqual(hung.slice(spot, spot + 11), [painting, "2725", "1", "500", "300", "2", "0", "", posted.uuid, framed[at + 6], framed[at + 7]]);
  b.xt("dmc", benRoom, "Ann", posted.uuid);
  assert.deepStrictEqual((await b.nextXt("dmc")).slice(2), ["Ann"]);
  b.xt("dmi", benRoom, "Ann");
  assert.deepStrictEqual((await b.nextXt("dmi")).slice(2, 8), ["1", "2725", painting, "2", "true", posted.uuid]);
  // A like from Ben counts once; Ann cannot like her own.
  b.xt("crp", benRoom, "masterpiece", posted.uuid, "x", "", "2,x,1");
  assert.strictEqual((await b.nextXt("crp"))[2], "1");
  b.xt("crp", benRoom, "masterpiece", posted.uuid, "x", "", "2,x,1");
  assert.strictEqual((await b.nextXt("crp"))[2], "0");
  a.xt("crg", den, "masterpiece", posted.uuid, "x", "");
  assert.deepStrictEqual((await a.untilXt("crg")).slice(2), ["1", "0", "1"]);
  // it hangs in the Masterpiece Gallery party, which is told so with the room.
  b.xt("sm", benRoom);
  assert.deepStrictEqual(JSON.parse((await b.nextXt("sm"))[2]).pool.map(entry => [entry.resourceId, entry.userName, entry.frameId]), [[posted.uuid, "Ann", 2]]);
  b.xt("sj", benRoom, 47);
  await b.untilXt("rj");
  assert.strictEqual(JSON.parse((await b.nextXt("rp"))[8]).pool[0].resourceId, posted.uuid);
  // removed from the panel: gone from Ann's den and things, a token in its place.
  assert.strictEqual((await panel("masterpiece", {id: posted.uuid, action: "remove"}, admin)).status, 200);
  const after = await a.untilXt("di");
  assert.ok(!after.includes(posted.uuid) && after.includes("2947"));
  assert.strictEqual((await fetch(`${BASE}/masterpieces/${posted.uuid}`)).status, 404);
  // with review off, a painting framed with that token is approved on the spot.
  assert.strictEqual((await panel("masterpiece", {action: "review", on: false}, admin)).status, 200);
  a.xt("mj", den, 51, 0, 0, 0);
  const easelAgain = (await a.untilXt("mj"))[1];
  a.xt("mm", easelAgain, 51, "gmtkn", 0, 1);
  const second = await post((await a.untilXt("mm"))[5], jpeg);
  a.xt("db", den, 0, 0, 221, 0, 1, 1, 1, second.uuid);
  assert.strictEqual((await a.untilXt("db"))[2], "1");
  const last = await a.nextXt("di");
  assert.ok(!last.includes("2947") && last[last.indexOf(second.uuid) - 1] === "true");
  // approved by nobody, that one
  assert.deepStrictEqual((await panel("masterpieces", undefined, admin)).data.approved.map(entry => [entry.id, entry.approvedBy]), [[second.uuid, null]]);

  // --- the Journey Book: its pages and facts, a bit a fact, and a finished page's den item
  a.xt("gl", roomId, 53);
  const bookPages = await a.untilXt("gl");
  assert.deepStrictEqual(bookPages.slice(8, 11), ["14", "1185", "912"]); // 14 pages, Bahari Bay first
  assert.strictEqual(bookPages[bookPages.indexOf("6189") + 1], "30381"); // the Call of the Alphas page, by the party's name
  a.xt("gl", roomId, 54);
  const bookFacts = await a.untilXt("gl");
  assert.strictEqual(bookFacts[8], "167");
  const setVar = async (id, bit) => {
    a.xt("zs", roomId, id, bit, 1);
    return Number((await a.untilXt("zs"))[3]);
  };
  // Kani Cove's page (var 288): ten facts, bits 0 to 9. each found one is a bit more, not the bit's number.
  assert.strictEqual(await setVar(288, 3), 1 << 3);
  assert.strictEqual(await setVar(288, 0), (1 << 3) | 1);
  assert.strictEqual(await setVar(288, 31), (1 << 3) | 1); // its gift: not before every fact is found
  let found = 0;
  for (let bit = 0; bit < 10; bit++) {
    found = await setVar(288, bit);
  }
  assert.strictEqual(found, 1023);
  a.xt("zs", roomId, 288, 31, 1);
  const kept = await a.untilXt("di");
  assert.ok(kept.includes("696")); // the Kani Cove page's den item
  assert.strictEqual(Number((await a.untilXt("zs"))[3]), (1023 | (2 ** 31)) >>> 0);
  assert.strictEqual(await setVar(288, 31), (1023 | (2 ** 31)) >>> 0); // and only once

  a.socket.destroy();
  b.socket.destroy();
  c2.socket.destroy();
};

harness.withServer("restored features test", HTTP_PORT, GAME_PORT, run).catch(err => {
  console.error(err);
  process.exit(1);
});
