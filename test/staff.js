"use strict";

// end to end: staff roles (lib/roles.js), the staff chat commands
// (lib/commands.js) and the moderator panel's role checks
// (lib/modpanel.js), against a real server with a database of its own.

const assert = require("assert");
const crypto = require("crypto");
const harness = require("./harness.js");

const HTTP_PORT = 18091;
const GAME_PORT = 19350;
const BASE = `http://127.0.0.1:${HTTP_PORT}`;
const TOWNSHIP = "jamaa_township.room_main#1";
const SAREPIA = "sarepia.room_main#1";
const {postJson} = harness;

// the authenticator app's side of 2FA (lib/totp.js): a base32 secret,
// HMAC-SHA1, 30-second steps, six digits.
const STEP = 30;
const base32Decode = text => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bits = text.replace(/=+$/, "").toUpperCase().split("").map(c => alphabet.indexOf(c).toString(2).padStart(5, "0")).join("");
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
};
const codeAt = (secret, step) => {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const mac = crypto.createHmac("sha1", base32Decode(secret)).update(counter).digest();
  const offset = mac[mac.length - 1] & 0x0F;
  return String((mac.readUInt32BE(offset) & 0x7FFFFFFF) % 1000000).padStart(6, "0");
};
const stepNow = () => Math.floor(Date.now() / 1000 / STEP);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
// a code is taken once: each use needs a later step than the last.
const waitForStep = async step => {
  while (stepNow() < step) {
    await sleep(250);
  }
};

// a web panel's session: keeps the cookie it is given.
const webSession = () => {
  let cookie = "";
  return async (path, body) => {
    const headers = {cookie};
    const options = body === undefined ? {headers} : {method: "POST", headers: {...headers, "Content-Type": "application/json"}, body: JSON.stringify(body)};
    const res = await fetch(`${BASE}${path}`, options);
    const set = res.headers.get("set-cookie");
    if (set) {
      cookie = set.split(";")[0];
    }
    return {status: res.status, data: await res.json().catch(() => ({}))};
  };
};

const say = (client, roomId, text) =>
  client.send(`<msg t='sys'><body action='pubMsg' r='${roomId}'><txt><![CDATA[${text}%0]]></txt></body></msg>`);

// logs in (with a 2FA code when given) and walks into `room`. `onLogin`
// sees what comes with the login, before joining skips past it.
const arrive = async (username, password, room, totp, onLogin = async () => {}) => {
  const res = await postJson(`${BASE}/authenticate`, {username, password, ...(totp ? {totp} : {})});
  const auth = await res.json();
  assert.strictEqual(res.status, 200, `${username} could not sign in: ${JSON.stringify(auth)}`);
  const client = new harness.GameClient(GAME_PORT);
  await client.connect();
  const login = await client.logIn(username, auth.auth_token);
  assert.strictEqual(login.status, "1");
  await onLogin(client);
  client.xt("rj", 1, room, 1, 0, 0);
  let rj = await client.untilXt("rj");
  await client.untilXt("rp");
  // a session's first room is always a spawn room (lib/world.js joinRoom)
  if (rj[3] !== room) {
    client.xt("rj", rj[4], room, 1, 0, 0);
    rj = await client.untilXt("rj");
    await client.untilXt("rp");
  }
  client.xt("au", rj[4], 1, 400, 400, 14, 1);
  return {client, login, roomId: rj[4], room: rj[3], token: auth.auth_token};
};

// the next moderator popup ("fd") of this kind, skipping earlier ones (a
// silence notice, say) still waiting.
const untilPopup = async (client, kind) => {
  for (;;) {
    const fields = await client.untilXt("fd");
    if (fields[2] === kind) {
      return fields;
    }
  }
};

// the next message box ("xtl") the server shows this client.
const nextBox = async client => (await client.untilXt("xtl"))[2];

// the chat line `text` coming back (every typed line, a command too, is
// shown to its sender, so skip those before it).
const untilChat = async (client, text) => {
  for (;;) {
    const line = await client.untilXt("uc");
    if (line[3] === text) {
      return line;
    }
  }
};

const run = async () => {
  const registerJson = body => fetch(`${BASE}/api/register`, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({avatarType: 1, agreed: true, ...body})});
  const people = {Mira: "KettlePass11", Hal: "KettlePass12", Pip: "KettlePass13", Ann: "KettlePass14"};
  for (const [username, password] of Object.entries(people)) {
    assert.strictEqual((await registerJson({username, password})).status, 200);
  }

  // --- the admin gives roles
  const admin = webSession();
  assert.strictEqual((await admin("/admin/api/setup", {password: "AdminPass99!"})).status, 200);
  assert.strictEqual((await admin("/admin/api/login", {password: "AdminPass99!"})).status, 200);
  const roleList = await admin("/admin/api/roles");
  assert.deepStrictEqual(roleList.data.roles.map(role => role.id), ["developer", "helper", "moderator", "admin", "owner"]);
  assert.match((await admin("/admin/api/account", {username: "Mira", action: "role", role: "boss"})).data.error, /No such role/);

  // staff need 2FA: turned on from the account page.
  const secrets = {};
  const usedStep = {};
  for (const username of ["Mira", "Hal"]) {
    const page = webSession();
    assert.strictEqual((await page("/account/api/login", {username, password: people[username]})).status, 200);
    const begun = await page("/account/api/act", {action: "twoStepStart", current: people[username]});
    secrets[username] = begun.data.setup.secret;
    usedStep[username] = stepNow();
    const confirmed = await page("/account/api/act", {action: "twoStepConfirm", code: codeAt(secrets[username], usedStep[username])});
    assert.ok(confirmed.data.ok, JSON.stringify(confirmed.data));
  }
  assert.match((await admin("/admin/api/account", {username: "Mira", action: "role", role: "moderator"})).data.ok, /moderator/);
  assert.match((await admin("/admin/api/account", {username: "Hal", action: "role", role: "helper"})).data.ok, /helper/);

  // --- the game: the login reply carries your own role, and nobody else's
  usedStep.Mira++;
  // and the patched client's staff window is told the same ("xsp")
  let staffSaid = null;
  const mira = await arrive("Mira", people.Mira, TOWNSHIP, codeAt(secrets.Mira, usedStep.Mira), async client => {
    staffSaid = await client.untilXt("xsp");
  });
  assert.strictEqual(staffSaid[2], "moderator");
  assert.ok(staffSaid[3].split(",").includes("player.summon"));
  assert.strictEqual(mira.login.params.staffRole, "moderator");
  assert.ok(mira.login.params.staffPermissions.split(",").includes("player.summon"));
  usedStep.Hal++;
  const hal = await arrive("Hal", people.Hal, TOWNSHIP, codeAt(secrets.Hal, usedStep.Hal));
  assert.strictEqual(hal.login.params.staffRole, "helper");
  const pip = await arrive("Pip", people.Pip, SAREPIA);
  assert.strictEqual(pip.login.params.staffRole, "");
  const ann = await arrive("Ann", people.Ann, SAREPIA);

  // a staff command from a player is plain chat
  say(pip.client, pip.roomId, "!kick Mira");
  await untilChat(pip.client, "!kick Mira");

  say(mira.client, mira.roomId, "!staff");
  const staffBox = await nextBox(mira.client);
  assert.match(staffBox, /Mira \(Moderator\)/);
  assert.match(staffBox, /Hal \(Helper\)/);

  // the adventure commands are a moderator's: a helper's are plain chat
  say(hal.client, hal.roomId, "!tutorial");
  await untilChat(hal.client, "!tutorial");
  say(mira.client, mira.roomId, "!adv start");
  assert.match(await nextBox(mira.client), /^!adv start DEF \[hard\]: .*15 Training Grounds/);

  // summon: Pip is brought from Sarepia to Mira in the township
  say(mira.client, mira.roomId, "!summon Pip");
  // ... onto the spot where Mira stands, when the room has loaded ("xgt")
  assert.deepStrictEqual((await pip.client.untilXt("xgt")).slice(2), ["400", "400", "0"]);
  assert.strictEqual((await pip.client.untilXt("rj"))[3], TOWNSHIP);
  assert.strictEqual(await nextBox(mira.client), "Pip was brought here.");

  // a helper may silence a player, but not kick, nor act on a moderator
  say(hal.client, hal.roomId, "!silence Pip 1");
  assert.strictEqual(await nextBox(hal.client), "Pip cannot chat for 1 hours.");
  say(hal.client, hal.roomId, "!silence Pip off");
  assert.strictEqual(await nextBox(hal.client), "Pip can chat again.");
  say(hal.client, hal.roomId, "!silence Mira 1");
  assert.match(await nextBox(hal.client), /your rank or above/);
  say(hal.client, hal.roomId, "!kick Pip");
  // no permission: just chat, seen by the room (Mira, in the township)
  await untilChat(mira.client, "!kick Pip");

  // goto: Mira goes to Ann in Sarepia
  say(mira.client, mira.roomId, "!goto Ann");
  assert.deepStrictEqual((await mira.client.untilXt("xgt")).slice(2), ["400", "400", "0"]);
  assert.strictEqual((await mira.client.untilXt("rj"))[3], SAREPIA);
  // in the same room already: straight onto her
  say(mira.client, ann.roomId, "!goto Ann");
  assert.deepStrictEqual((await mira.client.untilXt("xgt")).slice(2), ["400", "400", "1"]);

  // a warning: the game's own popup for the reason ("fw", 1 = bullying),
  // kept on the account; a message box; the count; then kick disconnects
  say(mira.client, ann.roomId, "!warn Ann bullying called names");
  assert.deepStrictEqual((await ann.client.untilXt("fd")).slice(2, 4), ["fw", "1"]);
  assert.strictEqual(await nextBox(mira.client), "Ann warned (bullying): warning 1.");
  say(mira.client, ann.roomId, "!warn Ann");
  assert.deepStrictEqual((await ann.client.untilXt("fd")).slice(2, 4), ["fw", "4"]); // behavior, the default
  assert.strictEqual(await nextBox(mira.client), "Ann warned (behavior): warning 2.");
  say(mira.client, ann.roomId, "!message Ann please be kind");
  assert.deepStrictEqual((await ann.client.untilXt("fd")).slice(2, 4), ["fp", "please be kind"]);
  assert.strictEqual(await nextBox(mira.client), "Shown to Ann.");
  say(mira.client, ann.roomId, "!warnings Ann");
  assert.match(await nextBox(mira.client), /^Ann has 2 warnings\. Latest: \S+ behavior by Mira; \S+ bullying by Mira \(called names\)$/);
  // the client's staff window ("xmd"): the same commands, one field each
  // the third warning in 30 days also silences for an hour (config.warningSilence)
  mira.client.xt("xmd", ann.roomId, "warn", "Ann", "personal");
  assert.deepStrictEqual((await ann.client.untilXt("fd")).slice(2, 4), ["fw", "3"]);
  assert.deepStrictEqual((await ann.client.untilXt("fd")).slice(2, 4), ["fs", "60"]);
  assert.strictEqual(await nextBox(mira.client), "Ann warned (personal): warning 3. Silenced for 60 minutes, for that many warnings.");
  mira.client.xt("xmd", ann.roomId, "message", "Ann", "hello there");
  assert.deepStrictEqual((await untilPopup(ann.client, "fp")).slice(2, 4), ["fp", "hello there"]);
  assert.strictEqual(await nextBox(mira.client), "Shown to Ann.");
  mira.client.xt("xmd", ann.roomId, "ban", "Ann"); // not one the window has: nothing
  // and from a player, nothing at all: Ann warns Mira
  ann.client.xt("xmd", ann.roomId, "warn", "Mira", "bullying");
  mira.client.xt("xmd", ann.roomId, "warnings", "Ann");
  assert.match(await nextBox(mira.client), /^Ann has 3 warnings\. /);
  say(mira.client, ann.roomId, "!warnings Mira");
  assert.strictEqual(await nextBox(mira.client), "Mira has no warnings.");
  say(mira.client, ann.roomId, "!kick Ann");
  assert.strictEqual((await ann.client.untilXt("fd"))[2], "fk");
  assert.strictEqual(await nextBox(mira.client), "Ann was disconnected.");

  // --- the moderator panel: what the role allows, checked by the server
  for (const username of ["Mira", "Hal"]) {
    usedStep[username]++;
  }
  await waitForStep(Math.max(usedStep.Mira, usedStep.Hal) - 1);
  const modPage = webSession();
  assert.strictEqual((await modPage("/mod/api/login", {username: "Mira", password: people.Mira, code: codeAt(secrets.Mira, usedStep.Mira)})).status, 200);
  const miraMe = (await modPage("/mod/api/me")).data;
  assert.strictEqual(miraMe.role, "moderator");
  assert.ok(miraMe.permissions.includes("player.ban"));
  const halPage = webSession();
  assert.strictEqual((await halPage("/mod/api/login", {username: "Hal", password: people.Hal, code: codeAt(secrets.Hal, usedStep.Hal)})).status, 200);
  const halMe = (await halPage("/mod/api/me")).data;
  assert.strictEqual(halMe.role, "helper");
  assert.ok(halMe.permissions.includes("server.view"));
  assert.ok(!halMe.permissions.includes("player.ban"));
  const health = await halPage("/mod/api/server");
  assert.strictEqual(health.status, 200);
  assert.ok(Number.isInteger(health.data.players));
  assert.ok(Number.isInteger(health.data.sockets.openConnections));
  assert.strictEqual(typeof health.data.update.needsPublish, "boolean");
  assert.ok(Array.isArray(health.data.update.changed));
  assert.strictEqual((await halPage("/mod/api/act", {username: "Pip", action: "ban", hours: 1, reason: "x"})).data.error, "Your role cannot do that.");
  assert.match((await halPage("/mod/api/act", {username: "Mira", action: "silence", hours: 1})).data.error, /your rank or above/);
  // the Players page's list, narrowed to who is online, staff, banned or
  // silenced (Ann was put out above); an unknown narrowing is everyone
  const listed = async only => (await modPage(`/mod/api/players?only=${only}`)).data.players.map(player => player.username).sort();
  assert.deepStrictEqual(await listed("staff"), ["Hal", "Mira"]);
  const online = await listed("online");
  assert.ok(["Hal", "Mira", "Pip"].every(name => online.includes(name)), online.join(", "));
  assert.deepStrictEqual(await listed("banned"), []);
  assert.deepStrictEqual(await listed("everything"), ["Ann", "Hal", "Mira", "Pip"]);
  // the Masterpieces page: those waiting, and the last approved (by anyone,
  // or only by this moderator), to take one back from
  const paintings = (await modPage("/mod/api/masterpieces?mine=1")).data;
  assert.deepStrictEqual([paintings.waiting, paintings.approved, paintings.recent], [[], [], []]);
  // signed in through the game (a client the moderator is playing in hands
  // over its login token): staff in the game now, from the game's address
  const viaGame = webSession();
  assert.strictEqual((await viaGame("/mod/api/game-login", {token: mira.token})).status, 200);
  assert.strictEqual((await viaGame("/mod/api/me")).data.username, "Mira");
  // a player's token, or none that is good, opens nothing
  assert.strictEqual((await webSession()("/mod/api/game-login", {token: pip.token})).status, 401);
  assert.strictEqual((await webSession()("/mod/api/game-login", {token: "0".repeat(64)})).status, 401);
  // searching by address (against ban evasion) is for the roles that ban addresses
  assert.strictEqual((await halPage("/mod/api/players?by=address&q=127.0.0.")).status, 403);
  assert.ok(Array.isArray((await modPage("/mod/api/players?by=address&q=127.0.0.")).data.players));
  // the panel's other ban decisions are for the roles that ban: a helper
  // may not answer an appeal, judge a new name or a painting, nor place or
  // lift a hardware ban, and is refused before anything is looked up.
  for (const [route, body] of [
    ["/mod/api/request", {action: "appealApprove", id: 1}], ["/mod/api/request", {action: "appealDeny", id: 1}],
    ["/mod/api/request", {action: "approve", id: 1}], ["/mod/api/request", {action: "deny", id: 1}],
    ["/mod/api/masterpiece", {action: "approve", id: "x"}], ["/mod/api/masterpiece", {action: "remove", id: "x"}],
    ["/mod/api/device", {id: 1}],
  ]) {
    assert.strictEqual((await halPage(route, body)).status, 403, `${route} ${JSON.stringify(body)}`);
  }
  for (const action of ["banDevices", "unbanDevices"]) {
    assert.strictEqual((await halPage("/mod/api/act", {username: "Pip", action, reason: "x"})).data.error, "Your role cannot do that.");
  }
  // a moderator's role lets them through, to the thing itself
  assert.strictEqual((await modPage("/mod/api/request", {action: "appealApprove", id: 999999})).data.error, "No such appeal waiting.");
  assert.strictEqual((await modPage("/mod/api/request", {action: "approve", id: 999999})).data.error, "No such request waiting.");
  assert.strictEqual((await modPage("/mod/api/masterpiece", {action: "approve", id: "x"})).data.error, "No such painting waiting.");
  assert.strictEqual((await modPage("/mod/api/device", {id: 999999})).data.error, "No such hardware ban.");
  assert.strictEqual((await modPage("/mod/api/act", {username: "Pip", action: "unbanDevices"})).data.error, "None of their hardware is banned.");
  // a report is closed by whoever may act on one, a helper too
  assert.strictEqual((await halPage("/mod/api/report", {id: 999999})).data.error, "No such report waiting.");
  // an action the panel does not know is refused, never let through unchecked
  assert.strictEqual((await modPage("/mod/api/act", {username: "Pip", action: "giveEverything"})).data.error, "Unknown action.");
  // a warning from the panel, and on the player's page
  assert.match((await modPage("/mod/api/act", {username: "Pip", action: "warn", reason: "scamming", note: "fake trade"})).data.ok, /^Pip warned \(scamming\): warning 1\./);
  assert.match((await modPage("/mod/api/act", {username: "Pip", action: "warn", reason: "nonsense"})).data.error, /reason/);
  assert.deepStrictEqual((await untilPopup(pip.client, "fw")).slice(2, 4), ["fw", "9"]);
  const pipPage = (await modPage("/mod/api/player?username=Pip")).data;
  assert.strictEqual(pipPage.warnings, 1);
  assert.deepStrictEqual([pipPage.warningList[0].reason, pipPage.warningList[0].note, pipPage.warningList[0].by], ["scamming", "fake trade", "Mira"]);
  assert.strictEqual(pipPage.warningList[0].seen, true);

  // mod notes: for staff, never the player; removed by their writer or an admin
  assert.strictEqual((await modPage("/mod/api/act", {username: "Pip", action: "note", text: "  talked about   trading, seemed fine "})).data.ok, "Note added.");
  assert.match((await modPage("/mod/api/act", {username: "Pip", action: "note", text: "   "})).data.error, /Write the note first/);
  assert.strictEqual((await halPage("/mod/api/act", {username: "Pip", action: "note", text: "keeps asking for free items"})).data.ok, "Note added.");
  const notes = (await modPage("/mod/api/player?username=Pip")).data.notes;
  assert.deepStrictEqual(notes.map(note => `${note.by}: ${note.text}`), ["Hal: keeps asking for free items", "Mira: talked about trading, seemed fine"]);
  assert.match((await modPage("/mod/api/act", {username: "Pip", action: "deleteNote", id: notes[0].id})).data.error, /Only whoever wrote a note/);
  assert.strictEqual((await halPage("/mod/api/act", {username: "Pip", action: "deleteNote", id: notes[0].id})).data.ok, "Note removed.");
  assert.match((await halPage("/mod/api/act", {username: "Mira", action: "note", text: "x"})).data.error, /your rank or above/);
  say(mira.client, ann.roomId, "!note Pip asked about the rules");
  assert.strictEqual(await nextBox(mira.client), "Note on Pip added.");
  say(mira.client, ann.roomId, "!notes Pip");
  assert.match(await nextBox(mira.client), /^Notes on Pip: \S+ Mira: asked about the rules \| \S+ Mira: talked about trading, seemed fine$/);
  say(mira.client, ann.roomId, "!notes Nobody");
  assert.strictEqual(await nextBox(mira.client), "No player called Nobody.");

  // warnings while away (Ann was disconnected): kept for her next visit;
  // the fifth in 30 days silences for a day; one is taken back
  assert.match((await modPage("/mod/api/act", {username: "Ann", action: "warn", reason: "bullying"})).data.ok,
    /^Ann warned \(bullying\): warning 4\. They are offline: they will see it when they next play\.$/);
  assert.match((await modPage("/mod/api/act", {username: "Ann", action: "warn", reason: "behavior"})).data.ok,
    /warning 5\. .*silenced them for 1 day\.$/);
  assert.strictEqual((await modPage("/mod/api/act", {username: "Ann", action: "unwarn"})).data.ok, "Took back Ann's latest warning (behavior).");
  const annAway = (await modPage("/mod/api/player?username=Ann")).data;
  assert.strictEqual(annAway.warnings, 4);
  assert.strictEqual(annAway.warningList[0].seen, false);
  assert.deepStrictEqual(await listed("silenced"), ["Ann"]);
  const annBack = await arrive("Ann", people.Ann, SAREPIA);
  assert.deepStrictEqual((await untilPopup(annBack.client, "fw")).slice(2, 4), ["fw", "1"]); // the bullying one
  assert.strictEqual((await modPage("/mod/api/player?username=Ann")).data.warningList[0].seen, true);
  say(mira.client, ann.roomId, "!unwarn Ann");
  assert.strictEqual(await nextBox(mira.client), "Took back Ann's latest warning (bullying).");
  say(mira.client, ann.roomId, "!unwarn Mira");
  assert.strictEqual(await nextBox(mira.client), "That is you.");

  // the panel's summon brings Pip to Mira (now in Sarepia)
  assert.match((await modPage("/mod/api/act", {username: "Pip", action: "summon"})).data.ok || "", /^Pip was brought to /);
  assert.strictEqual((await pip.client.untilXt("rj"))[3], SAREPIA);

  // a custom warning: the staff member's words are what the player sees
  mira.client.xt("xmd", ann.roomId, "warn", "Pip", "custom", "no spamming please");
  assert.deepStrictEqual((await untilPopup(pip.client, "fp")).slice(2, 4), ["fp", "Warning: no spamming please"]);
  assert.strictEqual(await nextBox(mira.client), "Pip warned (custom): warning 2.");
  say(mira.client, ann.roomId, "!warn Pip custom");
  assert.match(await nextBox(mira.client), /^Use: !warn PLAYER custom TEXT/);
  assert.match((await modPage("/mod/api/act", {username: "Pip", action: "warn", reason: "custom", note: " "})).data.error, /custom warning needs its words/);

  // invisible: gone from players' screens, still seen by staff (half
  // see-through: "xiv"), and seen moving by them; not for a helper
  // ("ac": [.., room, id, x, y, anim, username, ...]; others' may be waiting)
  const untilDrawn = async (client, username, x) => {
    for (;;) {
      const fields = await client.untilXt("ac");
      if (fields[6] === username && fields[3] === x) {
        return fields;
      }
    }
  };
  const untilRemoved = async (client, id) => {
    for (;;) {
      if ((await client.untilXt("ar"))[2] === id) {
        return;
      }
    }
  };
  mira.client.xt("au", ann.roomId, 1, 300, 300, 14, 1);
  const miraId = (await untilDrawn(pip.client, "Mira", "300"))[2];
  hal.client.xt("rj", 1, SAREPIA, 1, 0, 0);
  const halRj = await hal.client.untilXt("rj");
  await hal.client.untilXt("rp");
  hal.client.xt("au", halRj[4], 1, 410, 410, 14, 1);
  await untilDrawn(hal.client, "Mira", "300");
  say(mira.client, ann.roomId, "!invisible");
  await untilRemoved(pip.client, miraId);
  assert.deepStrictEqual((await hal.client.untilXt("xiv")).slice(2), [miraId, "1"]);
  assert.deepStrictEqual((await mira.client.untilXt("xiv")).slice(2), [miraId, "1"]);
  assert.match(await nextBox(mira.client), /^You are invisible: only staff see you/);
  mira.client.xt("au", ann.roomId, 1, 350, 350, 14, 0);
  for (;;) {
    const moved = await hal.client.untilXt("au");
    if (moved[3] === miraId) {
      break;
    }
  }
  // a helper may not: the window's request does nothing, the command is chat
  hal.client.xt("xiv", halRj[4]);
  say(hal.client, halRj[4], "!invisible");
  await untilChat(pip.client, "!invisible");
  // back again, where she walked to
  mira.client.xt("xiv", ann.roomId);
  assert.deepStrictEqual((await untilDrawn(pip.client, "Mira", "350")).slice(2, 5), [miraId, "350", "350"]);
  assert.deepStrictEqual((await hal.client.untilXt("xiv")).slice(2), [miraId, "0"]);
  assert.strictEqual(await nextBox(mira.client), "You can be seen again.");

  // everything above is in the moderators' log, the in-game ones marked so
  const log = (await admin("/admin/api/moderators")).data.log.map(entry => `${entry.by} ${entry.action} ${entry.target}`);
  for (const line of ["Mira summon (in game) Pip", "Hal silence (in game) Pip", "Mira goto (in game) Ann", "Mira warn (in game) Ann",
    "Mira message (in game) Ann", "Mira kick (in game) Ann", "Mira warn Pip", "Mira summon Pip", "Mira warn Ann", "Mira unwarn Ann",
    "Mira unwarn (in game) Ann", "Mira went invisible (in game) ", "Mira became visible (in game) ", "Mira note Pip", "Hal deleteNote Pip",
    "Mira note (in game) Pip"]) {
    assert.ok(log.includes(line), `missing from the log: ${line}\n${log.join("\n")}`);
  }

  // the moderators' message box header has real line breaks, not "\\n"
  const zlib = require("zlib");
  const {decode} = require("../lib/amf3.js");
  const stringsPath = require("../lib/cdn.js").hashedPath("defPacks/10230");
  const strings = decode(zlib.inflateRawSync(Buffer.from(await (await fetch(`${BASE}/${stringsPath}`)).arrayBuffer())));
  assert.strictEqual(strings[11134], "--Message From Moderator--\n\n");
  assert.ok(!strings[11135].includes("\\n"));

  // --- the account page ends the moderator panel's sessions too: a new
  // password, or signing out everywhere, leaves no panel session behind.
  // and a moderator does not answer their own request for a new name.
  for (const username of ["Mira", "Hal"]) {
    usedStep[username]++;
  }
  await waitForStep(Math.max(usedStep.Mira, usedStep.Hal) - 1);
  const miraAccount = webSession();
  assert.strictEqual((await miraAccount("/account/api/login", {username: "Mira", password: people.Mira, code: codeAt(secrets.Mira, usedStep.Mira)})).status, 200);
  assert.ok((await miraAccount("/account/api/act", {action: "requestName", newName: "Miranda", reason: "a longer name"})).data.ok);
  const asked = (await modPage("/mod/api/requests")).data.names.find(request => request.oldName === "Mira");
  assert.strictEqual((await modPage("/mod/api/request", {action: "approve", id: asked.id})).data.error, "That is you.");
  assert.strictEqual((await modPage("/mod/api/me")).status, 200);
  assert.strictEqual((await miraAccount("/account/api/act", {action: "password", current: people.Mira, password: "KettlePass21"})).data.ok, "Password changed.");
  assert.strictEqual((await modPage("/mod/api/me")).status, 401);
  const halAccount = webSession();
  assert.strictEqual((await halAccount("/account/api/login", {username: "Hal", password: people.Hal, code: codeAt(secrets.Hal, usedStep.Hal)})).status, 200);
  assert.strictEqual((await halPage("/mod/api/me")).status, 200);
  assert.strictEqual((await halAccount("/account/api/act", {action: "signOutEverywhere"})).data.ok, "Signed out everywhere.");
  assert.strictEqual((await halPage("/mod/api/me")).status, 401);

  // --- an Owner: the owner dashboard through their own staff sign-in
  assert.match((await admin("/admin/api/account", {username: "Hal", action: "role", role: "owner"})).data.ok, /Hal is now an owner/);
  usedStep.Hal++;
  await waitForStep(usedStep.Hal);
  const ownerPage = webSession();
  assert.strictEqual((await ownerPage("/admin/api/overview")).status, 401);
  assert.strictEqual((await ownerPage("/mod/api/login", {username: "Hal", password: people.Hal, code: codeAt(secrets.Hal, usedStep.Hal)})).status, 200);
  assert.ok((await ownerPage("/mod/api/me")).data.permissions.includes("theatre.upload"));
  const ownerState = (await ownerPage("/admin/api/state")).data;
  assert.deepStrictEqual([ownerState.signedIn, ownerState.owner], [true, "Hal"]);
  assert.strictEqual((await ownerPage("/admin/api/overview")).status, 200);
  // what stays with the admin password: Owners, and the password itself
  assert.match((await ownerPage("/admin/api/account", {username: "Pip", action: "role", role: "owner"})).data.error, /Only the admin password/);
  assert.match((await ownerPage("/admin/api/account", {username: "Hal", action: "ban", hours: 1, reason: "x"})).data.error, /Only the admin password/);
  assert.strictEqual((await ownerPage("/admin/api/password", {current: "AdminPass99!", password: "AnotherPass99!"})).status, 403);
  // the rest is theirs, written down under their name
  assert.match((await ownerPage("/admin/api/account", {username: "Pip", action: "tint", tint: "mud"})).data.ok, /tinted mud/);
  assert.ok((await admin("/admin/api/moderators")).data.log.some(entry => entry.by === "Hal" && entry.action === "tinted mud" && entry.target === "Pip"));
  // the staff dashboard's Owner page (public/mod.html), by the addresses it uses
  assert.match((await ownerPage("/dashboard/api/admin/account", {username: "Pip", action: "role", role: "helper"})).data.ok, /Pip is now a helper/);
  assert.match((await ownerPage("/dashboard/api/admin/account", {username: "Pip", action: "role", role: "none"})).data.ok, /no staff role/);
  assert.match((await ownerPage("/dashboard/api/admin/account", {username: "Pip", action: "badges", badges: ["contributor"]})).data.ok, /Pip has: Contributor/);
  assert.deepStrictEqual((await ownerPage("/dashboard/api/admin/account?username=Pip")).data.account.badges, ["contributor"]);
  assert.match((await ownerPage("/dashboard/api/admin/account", {username: "Pip", action: "badges", badges: []})).data.ok, /no badges/);
  const ownerCodes = await ownerPage("/dashboard/api/admin/invites", {count: 2, days: 1, note: "from the staff panel"});
  assert.strictEqual(ownerCodes.data.codes.length, 2);
  const ownerInvite = ownerCodes.data.invites.find(invite => invite.note === "from the staff panel" && invite.created_by === "Hal");
  assert.ok(ownerInvite);
  assert.strictEqual((await ownerPage("/dashboard/api/admin/invites/revoke", {id: ownerInvite.id})).status, 200);
  assert.strictEqual((await ownerPage("/dashboard/api/admin/invites")).status, 200);

  // --- the game closed for maintenance: players are put out and refused, staff are not
  const closed = await ownerPage("/admin/api/game", {closed: true});
  assert.match(closed.data.ok, /only staff can sign in\. 2 players were told and put out/);
  assert.match((await pip.client.untilXt("ua"))[1], /closing for maintenance/);
  await new Promise(resolve => pip.client.socket.once("close", resolve));
  assert.strictEqual((await ownerPage("/admin/api/overview")).data.server.gameClosed, true);
  assert.deepStrictEqual((await ownerPage("/admin/api/overview")).data.players, []);
  const refused = await postJson(`${BASE}/authenticate`, {username: "Pip", password: people.Pip});
  const pipAgain = new harness.GameClient(GAME_PORT);
  await pipAgain.connect();
  const turnedAway = await pipAgain.logIn("Pip", (await refused.json()).auth_token);
  assert.deepStrictEqual([turnedAway.status, turnedAway.statusId], ["0", -16]); // the game's "down for maintenance"
  pipAgain.socket.destroy();
  usedStep.Hal++;
  await waitForStep(usedStep.Hal);
  const halStaff = await arrive("Hal", people.Hal, SAREPIA, codeAt(secrets.Hal, usedStep.Hal));
  assert.strictEqual(halStaff.login.status, "1");
  halStaff.client.socket.destroy();
  assert.match((await ownerPage("/admin/api/game", {closed: false})).data.ok, /open/);
  const pipBack = await arrive("Pip", people.Pip, SAREPIA);
  pipBack.client.socket.destroy();

  for (const {client} of [mira, hal, pip, annBack]) {
    client.socket.destroy();
  }
};

harness.withServer("staff test", HTTP_PORT, GAME_PORT, run).catch(err => {
  console.error(err);
  process.exit(1);
});
