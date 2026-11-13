"use strict";

// Recorded adventure 22, made with the adventure script maker. Plays in adventures.room_adventure_7a, adventures.room_adventure_7b.
// To change it, open this file in the maker. Edits made by hand are kept only
// until the maker writes the file again.

// true the first time for each key, false after: for steps that must happen once
const once = (q, key) => {
  q.vars.done = q.vars.done || new Set();
  if (q.vars.done.has(key)) {
    return false;
  }
  q.vars.done.add(key);
  return true;
};
// phantom factories: [type, def] of what each sends out, every 3 seconds once the player comes near,
// at most 4 about at once, until a plant destroys the factory
const SPAWNERS = {"factory04":[11,2],"factory05":[11,2],"factory06":[11,2],"factory03":[11,2],"factory02":[11,2],"factory01":[11,2]};
const spawnState = (q, f) => (q.vars.spawn = q.vars.spawn || {})[f] || (q.vars.spawn[f] = {n: 0, alive: 0, on: false, dead: false});
const spawning = (q, f) => {
  const s = spawnState(q, f);
  if (s.on || s.dead) {
    return;
  }
  s.on = true;
  const tick = () => {
    if (s.dead) {
      return;
    }
    if (s.alive < 4) {
      q.send("qspn", f, `${f}__${s.n}_`, SPAWNERS[f][0], SPAWNERS[f][1], Math.floor(Math.random() * 1000), Math.floor(Math.random() * 1000), "null", "null", "null");
      s.n++;
      s.alive++;
    }
    q.after(3000, tick);
  };
  q.after(450, tick);
};
const spawned = (q, phantom) => {
  if (SPAWNERS[phantom]) {
    spawnState(q, phantom).dead = true;
    return;
  }
  const m = /^(.*)__\d+_$/.exec(phantom);
  if (m && SPAWNERS[m[1]]) {
    const s = spawnState(q, m[1]);
    s.alive = Math.max(0, s.alive - 1);
  }
};
// what happens when a count gets somewhere (how many plants are watered): once for each value
const counted = (q, name) => {
  const value = q.vars.counts[name];
  const key = `${name} ${value}`;
  q.vars.reached = q.vars.reached || {};
  if (q.vars.reached[key]) {
    return;
  }
  q.vars.reached[key] = true;
  if (key === "lockcount 1") {
    q.send("qcmd", 38, 15838);
    set(q, "greelycage", 1, 1, 0);
    q.send("qcmdVT", 1, "30_uri", 1, 0, 0);
    q.send("qposturi", "/adventure7-thesearchforgreely/#30-unlockfirstlock/#0#001");
    q.send("qcmdVT", 1, "30_uri", 99, 0, 0);
  }
  if (key === "lockcount 2") {
    q.send("qcmd", 38, 15839);
    set(q, "greelycage", 2, 1, 0);
    q.send("qcmdVT", 1, "40_uri", 1, 0, 0);
    q.send("qposturi", "/adventure7-thesearchforgreely/#40-unlocksecondlock/#0#001");
    q.send("qcmdVT", 1, "40_uri", 99, 0, 0);
  }
  if (key === "lockcount 3") {
    q.send("qcmd", 38, 15840);
    set(q, "greelycage", 3, 1, 0);
    q.send("qcmdVT", 1, "50_uri", 1, 0, 0);
    q.send("qposturi", "/adventure7-thesearchforgreely/#50-unlockthirdlock/#0#001");
    q.send("qcmdVT", 1, "50_uri", 99, 0, 0);
  }
  if (key === "lockcount 4") {
    set(q, "greelycage", 4, 1, 0);
    set(q, "alarmlights", 0, 1, 0);
    set(q, "alarmloop1", 1, 1, 0);
    set(q, "alarmloop2", 1, 1, 0);
    set(q, "alarmloop3", 1, 1, 0);
    set(q, "alarmloop4", 1, 1, 0);
    set(q, "all2boss1", 1, 1, 1);
    q.send("qcmdVT", 1, "60_uri", 1, 0, 0);
    q.send("qposturi", "/adventure7-thesearchforgreely/#60-unlockfourthlock/#0#001");
    q.send("qcmdVT", 1, "60_uri", 99, 0, 0);
    q.send("qmusic", 0);
    set(q, "alarmloop1", 0, 0, 0);
    set(q, "alarmloop2", 0, 0, 0);
    set(q, "alarmloop3", 0, 0, 0);
    set(q, "alarmloop4", 0, 0, 0);
    set(q, "cp4", 0, 1, 0);
    set(q, "cp5", 0, 1, 0);
    set(q, "chqpoint04lp", 0, 1, 0);
    set(q, "chqpoint05lp", 0, 1, 0);
    q.send("qcmdVT", 1, "___tst", 1, 0, 0);
    q.send("qplayswf", "2680", "null", "null");
    set(q, "all2boss", 1, 1, 1);
  }
  if (key === "seedcount 4") {
    set(q, "bseedpile2t", 0, 1, 0);
    set(q, "bseedpile2", 0, 1, 1);
    q.send("qcmdVT", 1, "seedtimer2", 0, 0, 0);
    q.send("qcmdVT", 1, "seedtimer4", 0, 0, 0);
  }
  if (key === "seedcount 7") {
    q.send("qcmdVT", 1, "seedtimer4", 0, 0, 0);
  }
  if (key === "seedcount 9") {
    set(q, "bseedpile5t", 0, 1, 0);
    set(q, "bseedpile5", 0, 1, 1);
    q.send("qcmdVT", 1, "seedtimer5", 0, 0, 0);
  }
};
// an item put in one of several places at random (bunny_key_1a ... 1f): picked once, then the same
const variant = (q, start, end, letters) => {
  q.vars.variants = q.vars.variants || {};
  const key = start + "|" + end;
  if (!q.vars.variants[key]) {
    q.vars.variants[key] = start + letters[Math.floor(Math.random() * letters.length)] + end;
  }
  return q.vars.variants[key];
};
const V_OTHERS = (q, start, end, letters) => letters.split("").map(l => start + l + end).filter(x => x !== variant(q, start, end, letters));
// a count kept for the whole adventure: one more each time
const bump = (q, name) => {
  q.vars.counts = q.vars.counts || {};
  q.vars.counts[name] = (q.vars.counts[name] || 0) + 1;
  return q.vars.counts[name];
};
// seeds into the bag one at a time, up to the most it holds ("qseed <seed> <count> <max>");
// q.seeds(seed) is what adventures.js last told the player they have
const giveSeeds = (q, seed, count, max) => {
  let have = ((q.seeds && q.seeds(seed)) || {count: 0}).count;
  for (let i = 0; i < count; i++) {
    have = Math.min(have + 1, max);
    q.send("qseed", seed, have, max);
  }
};
// how many times something has happened in this adventure, counting this one
const tally = (q, key) => {
  q.vars.tally = q.vars.tally || {};
  q.vars.tally[key] = (q.vars.tally[key] || 0) + 1;
  return q.vars.tally[key];
};
// qcmd 1: an actor's [state, visible, needs a click]
const set = (q, name, state, visible, click) => q.send("qcmd", 1, name, state, visible, click);
const appear = (q, name, face) => {
  if (face) {
    q.send("qswfs", name, face);
  }
  q.send("qswfs", name, "appear");
  set(q, name, 1, 1, 1);
};

module.exports = {
  defId: 22,
  title: "The Search for Greely",
  rooms: {
    start: {room: "adventures.room_adventure_7a", name: "Adventure Tutorial", nameStringId: 18326, music: "ajq_mussearch4greelylp"},
    in_7b: {room: "adventures.room_adventure_7b", name: "Adventure Tutorial", nameStringId: 18326, music: "ajq_musphntmcreepy"},
  },
  written: "2026-11-11 18:10:33",
  objective: 15817,
  lobby: true, // the "waiting for players" screen first, as on the official server

  // name, type, def, state, visible, needs a click, path, artwork state
  actors: [
    ["queststart", 18, 0, 0, 1, 1, "", ""],
    ["randomtask", 7, 0, 0, 1, 1, "", ""],
    ["players", 7, 0, 0, 1, 1, "", ""],
    ["2changer", 9, 0, 0, 1, 1, "", ""],
    ["in_7b", 9, 1, 0, 1, 1, "", ""],
    ["startdelay", 8, 0, 0, 0, 1, "", ""],
    ["graham01_go", 3, 0, 0, 1, 1, "", ""],
    ["graham01", 1, 23, 0, 0, 1, "", ""],
    ["graham01hide", 8, 0, 0, 0, 1, "", ""],
    ["graham02_go", 3, 0, 0, 1, 1, "", ""],
    ["graham02wait", 8, 0, 0, 0, 1, "", ""],
    ["graham02", 1, 23, 0, 0, 1, "", ""],
    ["graham02hide", 8, 0, 0, 0, 1, "", ""],
    ["graham03_go", 3, 0, 0, 1, 1, "", ""],
    ["graham03", 1, 23, 0, 1, 1, "", "facesw"],
    ["graham04", 1, 23, 0, 0, 1, "", ""],
    ["graham04x", 1, 23, 0, 0, 1, "", ""],
    ["greely01", 1, 22, 0, 1, 1, "", ""],
    ["greely01hide", 8, 0, 0, 0, 1, "", ""],
    ["greely02", 1, 22, 0, 0, 1, "", ""],
    ["greely02x", 1, 22, 0, 0, 1, "", ""],
    ["liza01", 1, 21, 0, 0, 1, "", ""],
    ["liza01x", 1, 21, 0, 0, 1, "", ""],
    ["cosmo01", 1, 25, 0, 0, 1, "", ""],
    ["cosmo01x", 1, 25, 0, 0, 1, "", ""],
    ["greelyitem01", 1, 44, 0, 1, 1, "", ""],
    ["greelyitem02", 1, 44, 0, 1, 1, "", ""],
    ["greelyitem03", 1, 44, 0, 1, 1, "", ""],
    ["changer", 1, 180, 0, 1, 1, "", ""],
    ["torchlight", 1, 116, 0, 1, 1, "", ""],
    ["givetorch", 1, 134, 0, 0, 1, "", ""],
    ["brazier01", 1, 86, 0, 1, 1, "", ""],
    ["bridgewait1", 8, 0, 0, 0, 1, "", ""],
    ["l_brazier01", 1, 116, 0, 1, 1, "", ""],
    ["wheel01", 1, 154, 0, 0, 1, "", ""],
    ["wheel02", 1, 154, 0, 0, 1, "", ""],
    ["wheel03", 1, 154, 0, 0, 1, "", ""],
    ["beacondelay", 8, 0, 0, 0, 1, "", ""],
    ["portaldelay", 8, 0, 0, 0, 1, "", ""],
    ["key_count", 7, 0, 0, 1, 1, "", ""],
    ["alpha_stone", 15, 2651, 0, 0, 1, "", ""],
    ["portal01", 3, 0, 0, 1, 1, "", ""],
    ["portal01once", 7, 0, 0, 1, 1, "", ""],
    ["checkpuzzle", 7, 0, 0, 1, 1, "", ""],
    ["greely02wait", 8, 0, 0, 0, 1, "", ""],
    ["puzzledoor", 2, 0, 0, 1, 1, "", ""],
    ["wheeltile1", 2, 0, 0, 1, 1, "", ""],
    ["wheeltile2", 2, 0, 0, 1, 1, "", ""],
    ["wheeltile3", 2, 0, 0, 1, 1, "", ""],
    ["den_block", 5, 0, 0, 1, 1, "", ""],
    ["torch", 17, 2045, 0, 1, 1, "", ""],
    ["avatarpad1", 2, 0, 0, 1, 1, "", ""],
    ["avatarpad2", 2, 0, 0, 1, 1, "", ""],
    ["avatardoor1", 2, 0, 0, 1, 1, "", ""],
    ["avatardoor2", 2, 0, 0, 1, 1, "", ""],
    ["easy", 2, 0, 0, 1, 1, "", ""],
    ["hard", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier01", 2, 0, 0, 1, 1, "", ""],
    ["t_bridge01", 2, 0, 0, 1, 1, "", ""],
    ["phantomdoor", 2, 0, 0, 1, 1, "", ""],
    ["phantompad", 2, 0, 0, 1, 1, "", ""],
    ["seedpile01_t", 2, 0, 0, 1, 1, "", ""],
    ["seedpile02_t", 2, 0, 0, 1, 1, "", ""],
    ["seedpile03_t", 2, 0, 0, 1, 1, "", ""],
    ["seedpile04_t", 2, 0, 0, 1, 1, "", ""],
    ["seedpile05_t", 2, 0, 0, 1, 1, "", ""],
    ["seedpile06_t", 2, 0, 0, 1, 1, "", ""],
    ["seedpile07_t", 2, 0, 0, 1, 1, "", ""],
    ["seedpile15_t", 2, 0, 0, 1, 1, "", ""],
    ["switch01_t", 2, 0, 0, 1, 1, "", ""],
    ["switch02_t", 2, 0, 0, 1, 1, "", ""],
    ["switch02_th", 2, 0, 0, 1, 1, "", ""],
    ["switch03_t", 2, 0, 0, 1, 1, "", ""],
    ["switch03_th", 2, 0, 0, 1, 1, "", ""],
    ["switch04_t", 2, 0, 0, 1, 1, "", ""],
    ["switch05_t", 2, 0, 0, 1, 1, "", ""],
    ["switch05_th", 2, 0, 0, 1, 1, "", ""],
    ["hardblock", 5, 0, 0, 1, 1, "", ""],
    ["bridgeblok01", 5, 0, 0, 1, 1, "", ""],
    ["sentry01blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry02blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry03blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry04blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry05blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry06blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry07blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry08blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry09blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry10blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry11blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry12blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry13blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry14blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry15blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry16blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry17blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry18blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry19blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry20blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry21blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry22blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry23blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry24blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry25blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry27blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry28blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry29blok", 5, 0, 0, 1, 1, "", ""],
    ["sentry30blok", 5, 0, 0, 1, 1, "", ""],
    ["pod01blok", 5, 0, 0, 1, 1, "", ""],
    ["pod02blok", 5, 0, 0, 1, 1, "", ""],
    ["pod03blok", 5, 0, 0, 1, 1, "", ""],
    ["pod04blok", 5, 0, 0, 1, 1, "", ""],
    ["pod05blok", 5, 0, 0, 1, 1, "", ""],
    ["pod06blok", 5, 0, 0, 1, 1, "", ""],
    ["pod07blok", 5, 0, 0, 1, 1, "", ""],
    ["pod08blok", 5, 0, 0, 1, 1, "", ""],
    ["pod09blok", 5, 0, 0, 1, 1, "", ""],
    ["pod10blok", 5, 0, 0, 1, 1, "", ""],
    ["pod11blok", 5, 0, 0, 1, 1, "", ""],
    ["pod12blok", 5, 0, 0, 1, 1, "", ""],
    ["pod13blok", 5, 0, 0, 1, 1, "", ""],
    ["pod15blok", 5, 0, 0, 1, 1, "", ""],
    ["pod16blok", 5, 0, 0, 1, 1, "", ""],
    ["pod17blok", 5, 0, 0, 1, 1, "", ""],
    ["pod18blok", 5, 0, 0, 1, 1, "", ""],
    ["pod19blok", 5, 0, 0, 1, 1, "", ""],
    ["pod20blok", 5, 0, 0, 1, 1, "", ""],
    ["pod21blok", 5, 0, 0, 1, 1, "", ""],
    ["pod22blok", 5, 0, 0, 1, 1, "", ""],
    ["pod23blok", 5, 0, 0, 1, 1, "", ""],
    ["pod24blok", 5, 0, 0, 1, 1, "", ""],
    ["pod25blok", 5, 0, 0, 1, 1, "", ""],
    ["pod26blok", 5, 0, 0, 1, 1, "", ""],
    ["pod27blok", 5, 0, 0, 1, 1, "", ""],
    ["pod28blok", 5, 0, 0, 1, 1, "", ""],
    ["pod29blok", 5, 0, 0, 1, 1, "", ""],
    ["pod30blok", 5, 0, 0, 1, 1, "", ""],
    ["pod31blok", 5, 0, 0, 1, 1, "", ""],
    ["pod32blok", 5, 0, 0, 1, 1, "", ""],
    ["pod33blok", 5, 0, 0, 1, 1, "", ""],
    ["pod35blok", 5, 0, 0, 1, 1, "", ""],
    ["pod36blok", 5, 0, 0, 1, 1, "", ""],
    ["pod37blok", 5, 0, 0, 1, 1, "", ""],
    ["pod38blok", 5, 0, 0, 1, 1, "", ""],
    ["pod39blok", 5, 0, 0, 1, 1, "", ""],
    ["pod40blok", 5, 0, 0, 1, 1, "", ""],
    ["pod41blok", 5, 0, 0, 1, 1, "", ""],
    ["pod42blok", 5, 0, 0, 1, 1, "", ""],
    ["pod43blok", 5, 0, 0, 1, 1, "", ""],
    ["pod44blok", 5, 0, 0, 1, 1, "", ""],
    ["pod45blok", 5, 0, 0, 1, 1, "", ""],
    ["pod46blok", 5, 0, 0, 1, 1, "", ""],
    ["pod47blok", 5, 0, 0, 1, 1, "", ""],
    ["pod48blok", 5, 0, 0, 1, 1, "", ""],
    ["pod49blok", 5, 0, 0, 1, 1, "", ""],
    ["pod50blok", 5, 0, 0, 1, 1, "", ""],
    ["pod51blok", 5, 0, 0, 1, 1, "", ""],
    ["pod52blok", 5, 0, 0, 1, 1, "", ""],
    ["pod53blok", 5, 0, 0, 1, 1, "", ""],
    ["pod54blok", 5, 0, 0, 1, 1, "", ""],
    ["pod55blok", 5, 0, 0, 1, 1, "", ""],
    ["pod56blok", 5, 0, 0, 1, 1, "", ""],
    ["pod57blok", 5, 0, 0, 1, 1, "", ""],
    ["pod58blok", 5, 0, 0, 1, 1, "", ""],
    ["pod59blok", 5, 0, 0, 1, 1, "", ""],
    ["pod60blok", 5, 0, 0, 1, 1, "", ""],
    ["pod61blok", 5, 0, 0, 1, 1, "", ""],
    ["pod62blok", 5, 0, 0, 1, 1, "", ""],
    ["pod63blok", 5, 0, 0, 1, 1, "", ""],
    ["pod64blok", 5, 0, 0, 1, 1, "", ""],
    ["pod65blok", 5, 0, 0, 1, 1, "", ""],
    ["pod66blok", 5, 0, 0, 1, 1, "", ""],
    ["pod67blok", 5, 0, 0, 1, 1, "", ""],
    ["pod68blok", 5, 0, 0, 1, 1, "", ""],
    ["pod69blok", 5, 0, 0, 1, 1, "", ""],
    ["pod70blok", 5, 0, 0, 1, 1, "", ""],
    ["pod71blok", 5, 0, 0, 1, 1, "", ""],
    ["web01blok", 5, 0, 0, 1, 1, "", ""],
    ["web03blok", 5, 0, 0, 1, 1, "", ""],
    ["web04blok", 5, 0, 0, 1, 1, "", ""],
    ["web08blok", 5, 0, 0, 1, 1, "", ""],
    ["phantomblok", 5, 0, 0, 1, 1, "", ""],
    ["avatarblock1", 5, 0, 0, 1, 1, "", ""],
    ["avatarblock2", 5, 0, 0, 1, 1, "", ""],
    ["braziercount", 7, 0, 0, 0, 1, "", ""],
    ["hint01", 3, 0, 0, 1, 1, "", ""],
    ["npc01", 1, 163, 0, 1, 1, "", "idle"],
    ["npc01wait", 8, 0, 0, 0, 1, "", ""],
    ["npc02", 1, 106, 0, 1, 1, "", "facesw"],
    ["hint02", 3, 0, 0, 1, 1, "", ""],
    ["npc03", 1, 161, 0, 1, 1, "", "idle"],
    ["npc03wait", 8, 0, 0, 0, 1, "", ""],
    ["npc04", 1, 107, 0, 1, 1, "", "facesw"],
    ["hint03", 3, 0, 0, 1, 1, "", ""],
    ["npc05", 1, 164, 0, 1, 1, "", "idle"],
    ["npc05wait", 8, 0, 0, 0, 1, "", ""],
    ["npc06", 1, 108, 0, 1, 1, "", "facesw"],
    ["treasure01", 13, 39, 0, 1, 1, "", ""],
    ["treasure02", 13, 39, 0, 1, 1, "", ""],
    ["treasure02_h", 13, 39, 0, 1, 1, "", ""],
    ["treasure03", 13, 39, 0, 1, 1, "", ""],
    ["treasure04", 13, 39, 0, 1, 1, "", ""],
    ["treasure05", 13, 39, 0, 1, 1, "", ""],
    ["treasure06", 13, 39, 0, 1, 1, "", ""],
    ["next_room", 7, 0, 0, 1, 1, "", ""],
    ["aseedpile01", 1, 134, 0, 1, 1, "", ""],
    ["aseedpile02", 1, 134, 0, 1, 1, "", ""],
    ["aseedpile02h", 1, 134, 0, 1, 1, "", ""],
    ["aseedpile03", 1, 134, 0, 1, 1, "", ""],
    ["aseedpile03h", 1, 134, 0, 1, 1, "", ""],
    ["aseedpile04", 1, 134, 0, 1, 1, "", ""],
    ["aseedpile04h", 1, 134, 0, 1, 1, "", ""],
    ["seedpile01", 1, 134, 0, 1, 1, "", ""],
    ["seedpile02", 1, 134, 0, 1, 1, "", ""],
    ["seedpile03", 1, 134, 0, 1, 1, "", ""],
    ["seedpile04", 1, 134, 0, 1, 1, "", ""],
    ["seedpile05", 1, 134, 0, 1, 1, "", ""],
    ["seedpile06", 1, 134, 0, 1, 1, "", ""],
    ["seedpile07", 1, 134, 0, 1, 1, "", ""],
    ["seedpile15", 1, 134, 0, 1, 1, "", ""],
    ["seedtimer01", 8, 0, 0, 0, 1, "", ""],
    ["seedtimer02", 8, 0, 0, 0, 1, "", ""],
    ["seedtimer03", 8, 0, 0, 0, 1, "", ""],
    ["seedtimer04", 8, 0, 0, 0, 1, "", ""],
    ["seedtimer05", 8, 0, 0, 0, 1, "", ""],
    ["seedtimer06", 8, 0, 0, 0, 1, "", ""],
    ["seedtimer07", 8, 0, 0, 0, 1, "", ""],
    ["seedtimer15", 8, 0, 0, 0, 1, "", ""],
    ["sentry01", 25, 30, 0, 1, 1, "", ""],
    ["sentry02", 25, 30, 0, 1, 1, "", ""],
    ["sentry03", 25, 30, 0, 1, 1, "", ""],
    ["sentry04", 25, 30, 0, 1, 1, "", ""],
    ["sentry05", 25, 30, 0, 1, 1, "", ""],
    ["sentry06", 25, 30, 0, 1, 1, "", ""],
    ["sentry07", 25, 30, 0, 1, 1, "", ""],
    ["sentry08", 25, 30, 0, 1, 1, "", ""],
    ["sentry09", 25, 30, 0, 1, 1, "", ""],
    ["sentry10", 25, 30, 0, 1, 1, "", ""],
    ["sentry11", 25, 30, 0, 1, 1, "", ""],
    ["sentry12", 25, 30, 0, 1, 1, "", ""],
    ["sentry13", 25, 30, 0, 1, 1, "", ""],
    ["sentry14", 25, 30, 0, 1, 1, "", ""],
    ["sentry15", 25, 30, 0, 1, 1, "", ""],
    ["sentry16", 25, 30, 0, 1, 1, "", ""],
    ["sentry17", 25, 30, 0, 1, 1, "", ""],
    ["sentry18", 25, 30, 0, 1, 1, "", ""],
    ["sentry19", 25, 30, 0, 1, 1, "", ""],
    ["sentry20", 25, 30, 0, 1, 1, "", ""],
    ["sentry21", 25, 30, 0, 1, 1, "", ""],
    ["sentry22", 25, 30, 0, 1, 1, "", ""],
    ["sentry23", 25, 30, 0, 1, 1, "", ""],
    ["sentry24", 25, 30, 0, 1, 1, "", ""],
    ["sentry25", 25, 30, 0, 1, 1, "", ""],
    ["sentry27", 25, 30, 0, 1, 1, "", ""],
    ["sentry28", 25, 30, 0, 1, 1, "", ""],
    ["sentry29", 25, 30, 0, 1, 1, "", ""],
    ["sentry30", 25, 30, 0, 1, 1, "", ""],
    ["sentry01_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry02_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry03_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry04_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry05_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry06_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry07_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry08_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry09_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry10_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry11_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry12_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry13_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry14_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry15_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry16_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry17_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry18_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry19_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry20_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry21_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry22_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry23_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry24_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry25_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry27_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry28_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry29_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry30_lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["switch01", 1, 134, 0, 1, 1, "", ""],
    ["switchwait01", 8, 0, 0, 0, 1, "", ""],
    ["switch02", 1, 134, 0, 1, 1, "", ""],
    ["switchwait02", 8, 0, 0, 0, 1, "", ""],
    ["switch02h", 1, 134, 0, 1, 1, "", ""],
    ["swichwait02h", 8, 0, 0, 0, 1, "", ""],
    ["switch03", 1, 134, 0, 1, 1, "", ""],
    ["switchwait03", 8, 0, 0, 0, 1, "", ""],
    ["switch03h", 1, 134, 0, 1, 1, "", ""],
    ["swichwait03h", 8, 0, 0, 0, 1, "", ""],
    ["switch04", 1, 134, 0, 1, 1, "", ""],
    ["switchwait04", 8, 0, 0, 0, 1, "", ""],
    ["switch05", 1, 134, 0, 1, 1, "", ""],
    ["switchwait05", 8, 0, 0, 0, 1, "", ""],
    ["switch05h", 1, 134, 0, 1, 1, "", ""],
    ["swichwait05h", 8, 0, 0, 0, 1, "", ""],
    ["phantom__01", 11, 2, 0, 1, 1, "path01", ""],
    ["phantom__02", 11, 2, 0, 1, 1, "path01", ""],
    ["phantom__03", 11, 2, 0, 1, 1, "path01", ""],
    ["phantom__04", 11, 2, 0, 1, 1, "path01", ""],
    ["phantom05", 11, 2, 0, 1, 1, "path05", ""],
    ["phantom06", 11, 2, 0, 1, 1, "path06", ""],
    ["phantom07", 11, 2, 0, 1, 1, "path07", ""],
    ["phantom08", 11, 2, 0, 1, 1, "path08", ""],
    ["phantom09", 11, 2, 0, 1, 1, "path09", ""],
    ["phantom10", 11, 2, 0, 1, 1, "path10", ""],
    ["phantom11", 11, 2, 0, 1, 1, "path11", ""],
    ["phantom12", 11, 2, 0, 1, 1, "path12", ""],
    ["phantom13", 11, 2, 0, 1, 1, "path13", ""],
    ["phantom14", 11, 2, 0, 1, 1, "path14", ""],
    ["phantom15", 11, 2, 0, 1, 1, "path15", ""],
    ["phantom16", 11, 2, 0, 1, 1, "path16", ""],
    ["phantom17", 11, 2, 0, 1, 1, "path17", ""],
    ["phantom18", 11, 2, 0, 1, 1, "path18", ""],
    ["phantom19", 11, 2, 0, 1, 1, "path19", ""],
    ["phantom__20", 11, 2, 0, 1, 1, "path20", ""],
    ["phantom__21", 11, 2, 0, 1, 1, "path20", ""],
    ["phantom__22", 11, 2, 0, 1, 1, "path20", ""],
    ["phantom__23", 11, 2, 0, 1, 1, "path20", ""],
    ["phantom24", 11, 2, 0, 1, 1, "path24", ""],
    ["phantom25", 11, 2, 0, 1, 1, "path25", ""],
    ["phantom26", 11, 2, 0, 1, 1, "path26", ""],
    ["phantom27", 11, 2, 0, 1, 1, "path27", ""],
    ["phantom28", 11, 2, 0, 1, 1, "path28", ""],
    ["phantom__29", 11, 2, 0, 1, 1, "path29", ""],
    ["phantom__30", 11, 2, 0, 1, 1, "path29", ""],
    ["phantom__31", 11, 2, 0, 1, 1, "path29", ""],
    ["phantom__32", 11, 2, 0, 1, 1, "path29", ""],
    ["path01", 20, 0, 0, 1, 1, "", ""],
    ["path05", 20, 0, 0, 1, 1, "", ""],
    ["path06", 20, 0, 0, 1, 1, "", ""],
    ["path07", 20, 0, 0, 1, 1, "", ""],
    ["path08", 20, 0, 0, 1, 1, "", ""],
    ["path09", 20, 0, 0, 1, 1, "", ""],
    ["path10", 20, 0, 0, 1, 1, "", ""],
    ["path11", 20, 0, 0, 1, 1, "", ""],
    ["path12", 20, 0, 0, 1, 1, "", ""],
    ["path13", 20, 0, 0, 1, 1, "", ""],
    ["path14", 20, 0, 0, 1, 1, "", ""],
    ["path15", 20, 0, 0, 1, 1, "", ""],
    ["path16", 20, 0, 0, 1, 1, "", ""],
    ["path17", 20, 0, 0, 1, 1, "", ""],
    ["path18", 20, 0, 0, 1, 1, "", ""],
    ["path19", 20, 0, 0, 1, 1, "", ""],
    ["path20", 20, 0, 0, 1, 1, "", ""],
    ["path24", 20, 0, 0, 1, 1, "", ""],
    ["path25", 20, 0, 0, 1, 1, "", ""],
    ["path26", 20, 0, 0, 1, 1, "", ""],
    ["path27", 20, 0, 0, 1, 1, "", ""],
    ["path28", 20, 0, 0, 1, 1, "", ""],
    ["path29", 20, 0, 0, 1, 1, "", ""],
    ["bpath1", 20, 0, 0, 1, 1, "", ""],
    ["bpath2", 20, 0, 0, 1, 1, "", ""],
    ["bpath_last", 20, 0, 0, 1, 1, "", ""],
    ["bpath1a", 20, 0, 0, 1, 1, "", ""],
    ["bpath1b", 20, 0, 0, 1, 1, "", ""],
    ["bpath1c", 20, 0, 0, 1, 1, "", ""],
    ["bpath2a", 20, 0, 0, 1, 1, "", ""],
    ["bpath2b", 20, 0, 0, 1, 1, "", ""],
    ["bpath2c", 20, 0, 0, 1, 1, "", ""],
    ["factory01", 12, 149, 0, 0, 1, "", ""],
    ["factory02", 12, 149, 0, 0, 1, "", ""],
    ["factory03", 12, 149, 0, 0, 1, "", ""],
    ["factory04", 12, 149, 0, 0, 1, "", ""],
    ["factory05", 12, 149, 0, 0, 1, "", ""],
    ["factory06", 12, 149, 0, 0, 1, "", ""],
    ["factory07", 12, 149, 0, 0, 1, "", ""],
    ["factory08", 12, 149, 0, 0, 1, "", ""],
    ["factory09", 12, 149, 0, 0, 1, "", ""],
    ["factory11", 12, 149, 0, 0, 1, "", ""],
    ["factory12", 12, 149, 0, 0, 1, "", ""],
    ["factory13", 12, 149, 0, 0, 1, "", ""],
    ["factory14", 12, 149, 0, 0, 1, "", ""],
    ["fact01blok", 14, 2, 0, 0, 1, "", ""],
    ["fact02blok", 14, 2, 0, 0, 1, "", ""],
    ["fact03blok", 14, 2, 0, 0, 1, "", ""],
    ["fact04blok", 14, 2, 0, 0, 1, "", ""],
    ["fact05blok", 14, 2, 0, 0, 1, "", ""],
    ["fact06blok", 14, 2, 0, 0, 1, "", ""],
    ["fact07blok", 14, 2, 0, 0, 1, "", ""],
    ["fact08blok", 14, 2, 0, 0, 1, "", ""],
    ["fact09blok", 14, 2, 0, 0, 1, "", ""],
    ["fact11blok", 14, 2, 0, 0, 1, "", ""],
    ["fact12blok", 14, 2, 0, 0, 1, "", ""],
    ["fact13blok", 14, 2, 0, 0, 1, "", ""],
    ["fact14blok", 14, 2, 0, 0, 1, "", ""],
    ["chqpoint01lp", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["chqpoint02lp", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["chqpoint03lp", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["chqpoint04lp", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["chqpoint05lp", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["cp1", 27, 0, 0, 1, 1, "", ""],
    ["cp2", 27, 0, 0, 1, 1, "", ""],
    ["cp3", 27, 0, 0, 1, 1, "", ""],
    ["cp4", 27, 0, 0, 1, 1, "", ""],
    ["cp5", 27, 0, 0, 1, 1, "", ""],
    ["key01", 15, 2688, 0, 1, 1, "", ""],
    ["key01_h", 15, 2688, 0, 1, 1, "", ""],
    ["key03", 15, 2688, 0, 1, 1, "", ""],
    ["key03_h", 15, 2688, 0, 1, 1, "", ""],
    ["key04", 15, 2688, 0, 1, 1, "", ""],
    ["key04_h", 15, 2688, 0, 1, 1, "", ""],
    ["key01icon", 1, 147, 0, 1, 1, "", ""],
    ["key02icon", 1, 147, 0, 1, 1, "", ""],
    ["key03icon", 1, 147, 0, 1, 1, "", ""],
    ["key04icon", 1, 147, 0, 1, 1, "", ""],
    ["keyfinalicon", 1, 147, 0, 1, 1, "", ""],
    ["key02", 15, 2688, 0, 1, 1, "", ""],
    ["key02_h", 15, 2688, 0, 1, 1, "", ""],
    ["pod01", 23, 182, 0, 1, 1, "", ""],
    ["pod02", 23, 182, 0, 1, 1, "", ""],
    ["pod03", 23, 182, 0, 1, 1, "", ""],
    ["pod04", 23, 182, 0, 1, 1, "", ""],
    ["pod05", 23, 182, 0, 1, 1, "", ""],
    ["pod06", 23, 182, 0, 1, 1, "", ""],
    ["pod07", 23, 182, 0, 1, 1, "", ""],
    ["pod08", 23, 182, 0, 1, 1, "", ""],
    ["pod09", 23, 182, 0, 1, 1, "", ""],
    ["pod10", 23, 182, 0, 1, 1, "", ""],
    ["pod11", 23, 182, 0, 1, 1, "", ""],
    ["pod12", 23, 182, 0, 1, 1, "", ""],
    ["pod13", 23, 182, 0, 1, 1, "", ""],
    ["pod15", 23, 182, 0, 1, 1, "", ""],
    ["pod16", 23, 182, 0, 1, 1, "", ""],
    ["pod17", 23, 182, 0, 1, 1, "", ""],
    ["pod18", 23, 182, 0, 1, 1, "", ""],
    ["pod19", 23, 182, 0, 1, 1, "", ""],
    ["pod20", 23, 182, 0, 1, 1, "", ""],
    ["pod21", 23, 182, 0, 1, 1, "", ""],
    ["pod22", 23, 182, 0, 1, 1, "", ""],
    ["pod23", 23, 182, 0, 1, 1, "", ""],
    ["pod24", 23, 182, 0, 1, 1, "", ""],
    ["pod25", 23, 182, 0, 1, 1, "", ""],
    ["pod26", 23, 182, 0, 1, 1, "", ""],
    ["pod27", 23, 182, 0, 1, 1, "", ""],
    ["pod28", 23, 182, 0, 1, 1, "", ""],
    ["pod29", 23, 182, 0, 1, 1, "", ""],
    ["pod30", 23, 182, 0, 1, 1, "", ""],
    ["pod31", 23, 182, 0, 1, 1, "", ""],
    ["pod32", 23, 182, 0, 1, 1, "", ""],
    ["pod33", 23, 182, 0, 1, 1, "", ""],
    ["pod35", 23, 182, 0, 1, 1, "", ""],
    ["pod36", 23, 182, 0, 1, 1, "", ""],
    ["pod37", 23, 182, 0, 1, 1, "", ""],
    ["pod38", 23, 182, 0, 1, 1, "", ""],
    ["pod39", 23, 182, 0, 1, 1, "", ""],
    ["pod40", 23, 182, 0, 1, 1, "", ""],
    ["pod41", 23, 182, 0, 1, 1, "", ""],
    ["pod42", 23, 182, 0, 1, 1, "", ""],
    ["pod43", 23, 182, 0, 1, 1, "", ""],
    ["pod44", 23, 182, 0, 1, 1, "", ""],
    ["pod45", 23, 182, 0, 1, 1, "", ""],
    ["pod46", 23, 182, 0, 1, 1, "", ""],
    ["pod47", 23, 182, 0, 1, 1, "", ""],
    ["pod48", 23, 182, 0, 1, 1, "", ""],
    ["pod49", 23, 182, 0, 1, 1, "", ""],
    ["pod50", 23, 182, 0, 1, 1, "", ""],
    ["pod51", 23, 182, 0, 1, 1, "", ""],
    ["pod52", 23, 182, 0, 1, 1, "", ""],
    ["pod53", 23, 182, 0, 1, 1, "", ""],
    ["pod54", 23, 182, 0, 1, 1, "", ""],
    ["pod55", 23, 182, 0, 1, 1, "", ""],
    ["pod56", 23, 182, 0, 1, 1, "", ""],
    ["pod57", 23, 182, 0, 1, 1, "", ""],
    ["pod58", 23, 182, 0, 1, 1, "", ""],
    ["pod59", 23, 182, 0, 1, 1, "", ""],
    ["pod60", 23, 182, 0, 1, 1, "", ""],
    ["pod61", 23, 182, 0, 1, 1, "", ""],
    ["pod62", 23, 182, 0, 1, 1, "", ""],
    ["pod63", 23, 182, 0, 1, 1, "", ""],
    ["pod64", 23, 182, 0, 1, 1, "", ""],
    ["pod65", 23, 182, 0, 1, 1, "", ""],
    ["pod66", 23, 182, 0, 1, 1, "", ""],
    ["pod67", 23, 182, 0, 1, 1, "", ""],
    ["pod68", 23, 182, 0, 1, 1, "", ""],
    ["pod69", 23, 182, 0, 1, 1, "", ""],
    ["pod70", 23, 182, 0, 1, 1, "", ""],
    ["pod71", 23, 182, 0, 1, 1, "", ""],
    ["web01", 23, 184, 0, 1, 1, "", ""],
    ["web03", 23, 184, 0, 1, 1, "", ""],
    ["web04", 23, 184, 0, 1, 1, "", ""],
    ["web08", 23, 184, 0, 1, 1, "", ""],
    ["plantvol", 22, 0, 0, 1, 1, "", ""],
    ["no_phantom", 3, 0, 0, 1, 1, "", ""],
    ["show_alphas", 3, 0, 0, 0, 1, "", ""],
    ["enddelay", 8, 0, 0, 0, 1, "", ""],
    ["gifttimer", 8, 0, 0, 0, 1, "", ""],
    ["beacon", 2, 0, 0, 0, 1, "", ""],
    ["exitportal", 2, 0, 0, 1, 1, "", ""],
    ["exitportal2", 2, 0, 0, 1, 1, "", ""],
    ["exit_vol", 3, 0, 0, 1, 1, "", ""],
    ["shower_spout", 2, 0, 0, 1, 1, "", ""],
    ["shower_pad", 2, 0, 0, 1, 1, "", ""],
    ["shower_slot", 2, 0, 0, 1, 1, "", ""],
    ["cheatchq1", 3, 0, 0, 1, 1, "", ""],
    ["cheatchq2", 3, 0, 0, 1, 1, "", ""],
    ["phantomonly", 1, 179, 0, 1, 1, "", ""],
    ["blocktimer", 8, 0, 0, 0, 1, "", ""],
    ["avataronly1", 1, 48, 0, 1, 1, "", ""],
    ["blocktimer1", 8, 0, 0, 0, 1, "", ""],
    ["avataronly2", 1, 50, 0, 1, 1, "", ""],
    ["blocktimer2", 8, 0, 0, 0, 1, "", ""],
    ["boss_off", 2, 0, 0, 1, 1, "", ""],
    ["boss_on", 2, 0, 0, 1, 1, "", ""],
    ["changer_vol", 3, 0, 0, 0, 1, "", ""],
    ["boss_block", 2, 0, 0, 1, 1, "", ""],
    ["boss_block1", 2, 0, 0, 1, 1, "", ""],
    ["bossblokvol1", 5, 0, 0, 1, 1, "", ""],
    ["bossblokvol2", 5, 0, 0, 1, 1, "", ""],
    ["bossblokvol3", 5, 0, 0, 1, 1, "", ""],
    ["bossblokvol4", 5, 0, 0, 1, 1, "", ""],
    ["minipod02", 23, 178, 0, 1, 1, "", ""],
    ["minipod03", 23, 178, 0, 1, 1, "", ""],
    ["minipod04", 23, 178, 0, 1, 1, "", ""],
    ["minipod05", 23, 178, 0, 1, 1, "", ""],
    ["minipod08", 23, 178, 0, 1, 1, "", ""],
    ["lock01", 1, 44, 0, 1, 1, "", ""],
    ["lock02", 1, 44, 0, 1, 1, "", ""],
    ["lock03", 1, 44, 0, 1, 1, "", ""],
    ["lock04", 1, 44, 0, 1, 1, "", ""],
    ["lockcount", 7, 0, 0, 0, 1, "", ""],
    ["___tst", 7, 0, 0, 1, 1, "", ""],
    ["swfwait", 8, 0, 0, 0, 1, "", ""],
    ["all2boss1", 3, 0, 0, 0, 1, "", ""],
    ["all2boss", 3, 0, 0, 0, 1, "", ""],
    ["bossstart", 9, 1, 0, 1, 1, "", ""],
    ["boss1a", 11, 29, 0, 0, 1, "", ""],
    ["boss1b", 11, 29, 0, 0, 1, "", ""],
    ["boss2a", 11, 28, 0, 0, 1, "", ""],
    ["boss2b", 11, 28, 0, 0, 1, "", ""],
    ["dedboss", 7, 0, 0, 0, 1, "", ""],
    ["greelydelay", 8, 0, 0, 0, 1, "", ""],
    ["spawner1", 7, 0, 0, 0, 1, "", ""],
    ["spawner2", 7, 0, 0, 0, 1, "", ""],
    ["hide_kphants", 7, 0, 0, 1, 1, "", ""],
    ["hidedelay2", 8, 0, 0, 0, 1, "", ""],
    ["spawntimer1a", 8, 0, 0, 1, 1, "", ""],
    ["spawntimer1b", 8, 0, 0, 1, 1, "", ""],
    ["spawntimer2a", 8, 0, 0, 1, 1, "", ""],
    ["spawntimer2b", 8, 0, 0, 1, 1, "", ""],
    ["kphant_off", 7, 0, 0, 0, 1, "", ""],
    ["hideseeds", 7, 0, 0, 1, 1, "", ""],
    ["kphant1__1a", 11, 32, 0, 0, 1, "", ""],
    ["kphant1__2a", 11, 32, 0, 0, 1, "", ""],
    ["kphant1__3a", 11, 32, 0, 0, 1, "", ""],
    ["kphant1__4a", 11, 32, 0, 0, 1, "", ""],
    ["kphant1__1b", 11, 32, 0, 0, 1, "", ""],
    ["kphant1__2b", 11, 32, 0, 0, 1, "", ""],
    ["kphant1__3b", 11, 32, 0, 0, 1, "", ""],
    ["kphant1__4b", 11, 32, 0, 0, 1, "", ""],
    ["kphant1__1c", 11, 32, 0, 0, 1, "", ""],
    ["kphant1__2c", 11, 32, 0, 0, 1, "", ""],
    ["kphant1__3c", 11, 32, 0, 0, 1, "", ""],
    ["kphant1__4c", 11, 32, 0, 0, 1, "", ""],
    ["kphant1__5c", 11, 32, 0, 0, 1, "", ""],
    ["kphant1__6c", 11, 32, 0, 0, 1, "", ""],
    ["kphant1__1d", 11, 32, 0, 0, 1, "", ""],
    ["kphant1__2d", 11, 32, 0, 0, 1, "", ""],
    ["kphant1__3d", 11, 32, 0, 0, 1, "", ""],
    ["kphant1__4d", 11, 32, 0, 0, 1, "", ""],
    ["kphant1__5d", 11, 32, 0, 0, 1, "", ""],
    ["kphant1__6d", 11, 32, 0, 0, 1, "", ""],
    ["kphant2__1a", 11, 32, 0, 0, 1, "", ""],
    ["kphant2__2a", 11, 32, 0, 0, 1, "", ""],
    ["kphant2__3a", 11, 32, 0, 0, 1, "", ""],
    ["kphant2__4a", 11, 32, 0, 0, 1, "", ""],
    ["kphant2__1b", 11, 32, 0, 0, 1, "", ""],
    ["kphant2__2b", 11, 32, 0, 0, 1, "", ""],
    ["kphant2__3b", 11, 32, 0, 0, 1, "", ""],
    ["kphant2__4b", 11, 32, 0, 0, 1, "", ""],
    ["kphant2__1c", 11, 32, 0, 0, 1, "", ""],
    ["kphant2__2c", 11, 32, 0, 0, 1, "", ""],
    ["kphant2__3c", 11, 32, 0, 0, 1, "", ""],
    ["kphant2__4c", 11, 32, 0, 0, 1, "", ""],
    ["kphant2__5c", 11, 32, 0, 0, 1, "", ""],
    ["kphant2__6c", 11, 32, 0, 0, 1, "", ""],
    ["kphant2__1d", 11, 32, 0, 0, 1, "", ""],
    ["kphant2__2d", 11, 32, 0, 0, 1, "", ""],
    ["kphant2__3d", 11, 32, 0, 0, 1, "", ""],
    ["kphant2__4d", 11, 32, 0, 0, 1, "", ""],
    ["kphant2__5d", 11, 32, 0, 0, 1, "", ""],
    ["kphant2__6d", 11, 32, 0, 0, 1, "", ""],
    ["alarmlights", 2, 0, 0, 1, 1, "", ""],
    ["greelycage", 2, 0, 0, 1, 1, "", ""],
    ["greelychain1", 2, 0, 0, 1, 1, "", ""],
    ["greelychain2", 2, 0, 0, 1, 1, "", ""],
    ["greelychain3", 2, 0, 0, 1, 1, "", ""],
    ["greelychain4", 2, 0, 0, 1, 1, "", ""],
    ["find4keys", 3, 0, 0, 1, 1, "", ""],
    ["portal01blok", 5, 0, 0, 1, 1, "", ""],
    ["changeback", 3, 0, 0, 1, 1, "", ""],
    ["key_final", 15, 2688, 0, 1, 1, "", ""],
    ["lock_final", 1, 44, 0, 0, 1, "", ""],
    ["greely01wait", 8, 0, 0, 0, 1, "", ""],
    ["bseedpile1", 1, 134, 0, 1, 1, "", ""],
    ["bseedpile2", 1, 134, 0, 1, 1, "", ""],
    ["bseedpile3", 1, 134, 0, 1, 1, "", ""],
    ["bseedpile4", 1, 134, 0, 1, 1, "", ""],
    ["bseedpile5", 1, 134, 0, 1, 1, "", ""],
    ["bseedpile6", 1, 134, 0, 1, 1, "", ""],
    ["bseedpile1t", 2, 0, 0, 1, 1, "", ""],
    ["bseedpile2t", 2, 0, 0, 1, 1, "", ""],
    ["bseedpile3t", 2, 0, 0, 1, 1, "", ""],
    ["bseedpile4t", 2, 0, 0, 1, 1, "", ""],
    ["bseedpile5t", 2, 0, 0, 1, 1, "", ""],
    ["bseedpile6t", 2, 0, 0, 1, 1, "", ""],
    ["seeddelay", 8, 0, 0, 0, 1, "", ""],
    ["seedmover", 7, 0, 0, 1, 1, "", ""],
    ["seedtimer1", 8, 0, 0, 0, 1, "", ""],
    ["seedtimer2", 8, 0, 0, 0, 1, "", ""],
    ["seedtimer3", 8, 0, 0, 0, 1, "", ""],
    ["seedtimer4", 8, 0, 0, 0, 1, "", ""],
    ["seedtimer5", 8, 0, 0, 0, 1, "", ""],
    ["seedtimer6", 8, 0, 0, 0, 1, "", ""],
    ["seedcount", 7, 0, 0, 1, 1, "", ""],
    ["gooploop", 16, "ajq_disguisesludgelp", 0, 0, 1, "", ""],
    ["lavaloop", 16, "ajq_lavawalllp", 0, 1, 1, "", ""],
    ["alarmloop2", 16, "ajq_spinningalarmlp", 0, 0, 1, "", ""],
    ["alarmloop4", 16, "ajq_spinningalarmlp", 0, 0, 1, "", ""],
    ["alarmloop1", 16, "ajq_pulsealarmlp", 0, 0, 1, "", ""],
    ["alarmloop3", 16, "ajq_pulsealarmlp", 0, 0, 1, "", ""],
    ["portal_loop1", 16, "ajq_portalstate2lp", 0, 1, 1, "", ""],
    ["portal_loop2", 16, "ajq_portalstate2lp", 0, 1, 1, "", ""],
    ["portal_clear", 16, "ajq_portalgatelp", 0, 0, 1, "", ""],
    ["__tst", 7, 0, 0, 1, 1, "", ""],
    ["00_uri", 7, 0, 0, 0, 1, "", ""],
    ["10_uri", 7, 0, 0, 0, 1, "", ""],
    ["20_uri", 7, 0, 0, 0, 1, "", ""],
    ["30_uri", 7, 0, 0, 0, 1, "", ""],
    ["40_uri", 7, 0, 0, 0, 1, "", ""],
    ["50_uri", 7, 0, 0, 0, 1, "", ""],
    ["60_uri", 7, 0, 0, 0, 1, "", ""],
    ["70_uri", 7, 0, 0, 0, 1, "", ""],
    ["80_uri", 7, 0, 0, 0, 1, "", ""],
    ["90_uri", 7, 0, 0, 0, 1, "", ""],
    ["exitblock", 5, 0, 0, 0, 1, "", ""],
    ["secret1", 3, 0, 0, 1, 1, "", ""],
    ["diff_level", 7, 0, 0, 1, 1, "", ""],
    ["live_players", 7, 0, 1, 0, 1, "", ""],
  ],

  on: {
    loaded(q) {
      const n = tally(q, "loaded");
      // step 330
      q.send("qsndpk", 2686);
      // step 1: the 1st time
      if (n === 1) {
        q.after(420, () => {
          set(q, "t_bridge01", 99, 0, 0);
          q.send("qtorch", 0, 1, "torchlight");
          q.after(1000, () => {
            q.send("qswfs", "graham01", "appear");
            set(q, "graham01", 1, 1, 0);
            q.send("qcmdVT", 1, "players", 1, 0, 0);
          });
        });
      }
    },

    // walked into, or clicked
    trigger: {
      treasure01(q) {
        q.send("qatt", "treasure01", 3, 100, 0, 1); // the chest opens
      },
      treasure02(q) {
        q.send("qatt", "treasure02", 2, 249, -8257707, 1); // the chest opens (an item, not gems)
      },
      treasure02_h(q) {
        q.send("qatt", "treasure02_h", 3, 50, 0, 1); // the chest opens
      },
      treasure03(q) {
        q.send("qatt", "treasure03", 3, 50, 0, 1); // the chest opens
      },
      treasure04(q) {
        q.send("qatt", "treasure04", 3, 200, -8257707, 1); // the chest opens
      },
      treasure05(q) {
        q.send("qatt", "treasure05", 3, 150, -8257707, 1); // the chest opens
      },
      treasure06(q) {
        q.send("qatt", "treasure06", 3, 50, 0, 1); // the chest opens
      },
      graham01_go(q) {
        // step 2: once
        if (once(q, "step2")) {
          set(q, "graham01", 2, 1, 1);
          q.send("qcmd", 3, 0, "graham01", 2, 15818);
          q.send("qcmdVT", 1, "00_uri", 1, 0, 0);
          q.send("qcmdVT", 1, "__tst", 1, 0, 0);
          q.send("qposturi", "/adventure7-thesearchforgreely/#00-start/#0#001");
          q.send("qcmdVT", 1, "00_uri", 99, 0, 0);
          set(q, "graham01_go", 99, 0, 0);
        }
      },
      givetorch(q) {
        // step 4
        set(q, "graham01", 99, 0, 0);
        q.send("qgi", "torch");
      },
      brazier01(q) {
        const held = q.held(); // what the player carried when this fired
        // step 5: only while holding torch, once
        if (held === "torch" && once(q, "step5")) {
          set(q, "t_brazier01", 1, 1, 0);
          set(q, "t_bridge01", 1, 1, 0);
          set(q, "l_brazier01", 99, 0, 0);
          set(q, "l_brazier01", 0, 1, 0);
          q.send("qtorch", 0, 1, "l_brazier01");
          q.xp(5, "brazier01");
          q.send("qcmdVT", 1, "braziercount", 1, 0, 0);
          q.use();
          set(q, "torch", 99, 0, 0);
          set(q, "givetorch", 99, 0, 0);
          set(q, "brazier01", 1, 1, 0);
          q.after(1000, () => {
            set(q, "bridgeblok01", 99, 0, 0);
          });
        }
      },
      greelyitem01(q) {
        // step 6
        q.send("qcmd", 2, "greelyitem01", 15925, 2);
      },
      hint01(q) {
        const n = tally(q, "trigger hint01");
        // step 7: the 2nd time
        if (n === 2) {
          q.send("qswfs", "npc02", "facesw");
          set(q, "npc02", 0, 1, 1);
        }
        // step 8: the 4th time
        if (n === 4) {
          q.send("qswfs", "npc01", "hop");
          set(q, "npc01", 10, 1, 1);
          set(q, "npc01", 11, 1, 0);
          q.send("qswfs", "npc02", "hop");
          set(q, "npc02", 10, 1, 1);
          q.send("qcmd", 2, "npc02", 15879, 1);
          set(q, "npc02", 11, 1, 0);
        }
        // step 9: the 5th time and after
        if (n >= 5) {
          q.send("qswfs", "npc01", "hop");
          set(q, "npc01", 10, 1, 1);
          set(q, "npc01", 11, 1, 0);
          q.send("qswfs", "npc02", "hop");
          set(q, "npc02", 10, 1, 1);
          q.send("qcmd", 2, "npc02", 15879, 1);
          set(q, "npc02", 11, 1, 0);
        }
      },
      npc01(q) {
        const n = tally(q, "trigger npc01");
        // step 10: the 1st time
        if (n === 1) {
          q.send("qcmd", 2, "npc01", 15822, 1);
          q.after(3820, () => {
            set(q, "npc02", 2, 1, 1);
            q.send("qcmd", 2, "npc02", 15887, 1);
            set(q, "npc02", 1, 1, 0);
            q.send("qcmdVT", 1, "npc01wait", 0, 0, 0);
            q.after(22020, () => {
              set(q, "npc04", 2, 1, 1);
              q.send("qcmd", 2, "npc04", 15888, 1);
              set(q, "npc04", 1, 1, 0);
              q.send("qcmdVT", 1, "npc03wait", 0, 0, 0);
              q.after(12010, () => {
                set(q, "npc06", 2, 1, 1);
                q.send("qcmd", 2, "npc06", 15889, 1);
                set(q, "npc06", 1, 1, 0);
                q.send("qcmdVT", 1, "npc05wait", 0, 0, 0);
              });
            });
          });
        }
        // step 11: the 2nd time and after
        if (n >= 2) {
          q.send("qcmd", 2, "npc01", 15822, 1);
        }
      },
      hint02(q) {
        const n = tally(q, "trigger hint02");
        // step 13: the 1st time
        if (n === 1) {
          set(q, "npc04", 1, 1, 0);
        }
        // step 14: the 4th time
        if (n === 4) {
          q.send("qswfs", "npc03", "hop");
          set(q, "npc03", 10, 1, 1);
          set(q, "npc03", 11, 1, 0);
          q.send("qswfs", "npc04", "hop");
          set(q, "npc04", 10, 1, 1);
          q.send("qcmd", 2, "npc04", 15880, 1);
          set(q, "npc04", 11, 1, 0);
        }
        // step 15: the 5th time
        if (n === 5) {
          q.send("qswfs", "npc03", "hop");
          set(q, "npc03", 10, 1, 1);
          set(q, "npc03", 11, 1, 0);
          q.send("qswfs", "npc04", "hop");
          set(q, "npc04", 10, 1, 1);
          q.send("qcmd", 2, "npc04", 15880, 1);
          set(q, "npc04", 11, 1, 0);
        }
        // step 16: the 6th time
        if (n === 6) {
          q.send("qswfs", "npc03", "hop");
          set(q, "npc03", 10, 1, 1);
          set(q, "npc03", 11, 1, 0);
          q.send("qswfs", "npc04", "hop");
          set(q, "npc04", 10, 1, 1);
          q.send("qcmd", 2, "npc04", 15880, 1);
          set(q, "npc04", 11, 1, 0);
          q.after(5930, () => {
            q.send("qswfs", "npc05", "hop");
            set(q, "npc05", 10, 1, 1);
            set(q, "npc05", 11, 1, 0);
            q.send("qswfs", "npc06", "hop");
            set(q, "npc06", 10, 1, 1);
            q.send("qcmd", 2, "npc06", 15881, 1);
            set(q, "npc06", 11, 1, 0);
          });
        }
      },
      npc03(q) {
        const n = tally(q, "trigger npc03");
        // step 17: the 1st time
        if (n === 1) {
          q.send("qcmd", 2, "npc03", 15823, 1);
        }
        // step 18: the 2nd time
        if (n === 2) {
          q.send("qcmd", 2, "npc03", 15823, 1);
          q.after(3220, () => {
            set(q, "npc04", 2, 1, 1);
            q.send("qcmd", 2, "npc04", 15888, 1);
            set(q, "npc04", 1, 1, 0);
            q.send("qcmdVT", 1, "npc03wait", 0, 0, 0);
            q.after(6000, () => {
              set(q, "npc02", 2, 1, 1);
              q.send("qcmd", 2, "npc02", 15887, 1);
              set(q, "npc02", 1, 1, 0);
              q.send("qcmdVT", 1, "npc01wait", 0, 0, 0);
              q.after(15010, () => {
                set(q, "npc06", 2, 1, 1);
                q.send("qcmd", 2, "npc06", 15889, 1);
                set(q, "npc06", 1, 1, 0);
                q.send("qcmdVT", 1, "npc05wait", 0, 0, 0);
              });
            });
          });
        }
      },
      phantomonly(q) {
        const n = tally(q, "trigger phantomonly");
        // step 19: the 1st time
        if (n === 1) {
          q.send("qcmd", 2, "phantomonly", 15884, 0);
        }
        // step 20: the 2nd time
        if (n === 2) {
          set(q, "phantompad", 1, 1, 0);
          set(q, "phantomdoor", 1, 1, 0);
          set(q, "cheatchq1", 99, 0, 0);
          set(q, "phantomonly", 1, 0, 0);
          q.send("qsnd", "ajq_mussecretareast");
          q.xp(25, "phantomonly");
          q.after(1350, () => {
            set(q, "phantomblok", 99, 0, 0);
          });
        }
      },
      hint03(q) {
        const n = tally(q, "trigger hint03");
        // step 21: the 1st time
        if (n === 1) {
          set(q, "npc06", 1, 1, 0);
        }
        // step 22: the 4th time
        if (n === 4) {
          q.send("qswfs", "npc05", "hop");
          set(q, "npc05", 10, 1, 1);
          set(q, "npc05", 11, 1, 0);
          q.send("qswfs", "npc06", "hop");
          set(q, "npc06", 10, 1, 1);
          q.send("qcmd", 2, "npc06", 15881, 1);
          set(q, "npc06", 11, 1, 0);
        }
        // step 23: the 6th time and after
        if (n >= 6) {
          q.after(1060, () => {
            q.send("qswfs", "npc05", "hop");
            set(q, "npc05", 10, 1, 1);
            set(q, "npc05", 11, 1, 0);
            q.send("qswfs", "npc06", "hop");
            set(q, "npc06", 10, 1, 1);
            q.send("qcmd", 2, "npc06", 15881, 1);
            set(q, "npc06", 11, 1, 0);
          });
        }
      },
      npc05(q) {
        // step 24
        q.send("qcmd", 2, "npc05", 15824, 1);
      },
      graham02_go(q) {
        // step 25
        q.send("qswfs", "graham02", "appear");
        q.send("qswfs", "graham02", "facesw");
        set(q, "graham02", 1, 1, 1);
        set(q, "graham02", 6, 1, 0);
        set(q, "graham02_go", 99, 0, 0);
        q.after(2210, () => {
          set(q, "graham02", 2, 1, 1);
          q.send("qcmd", 3, 0, "graham02", 2, 15832);
        });
      },
      wheel01(q) {
        const n = tally(q, "trigger wheel01");
        // step 28: the 1st time
        if (n === 1) {
          set(q, "wheeltile1", 1, 1, 0);
          set(q, "wheel01", 2, 1, 1);
          set(q, "wheel01", 1, 1, 1);
          q.after(14940, () => {
            set(q, "wheeltile2", 1, 1, 0);
            set(q, "wheel02", 2, 1, 1);
            set(q, "wheel02", 1, 1, 1);
          });
        }
        // step 29: the 2nd time
        if (n === 2) {
          set(q, "wheeltile1", 2, 1, 0);
          set(q, "wheel01", 2, 1, 1);
          set(q, "wheel01", 1, 1, 1);
        }
        // step 30: the 3rd time
        if (n === 3) {
          set(q, "wheeltile1", 3, 1, 0);
          set(q, "wheel01", 2, 1, 1);
          set(q, "wheel01", 1, 1, 1);
        }
        // step 31: the 4th time
        if (n === 4) {
          set(q, "wheeltile1", 4, 1, 0);
          set(q, "wheel01", 2, 1, 1);
          set(q, "wheel01", 1, 1, 1);
        }
      },
      wheel02(q) {
        const n = tally(q, "trigger wheel02");
        // step 32: the 5th time
        if (n === 5) {
          set(q, "wheeltile2", 5, 1, 0);
          set(q, "wheel02", 2, 1, 1);
          set(q, "wheel02", 1, 1, 1);
        }
        // step 33: the 6th time
        if (n === 6) {
          set(q, "wheeltile2", 0, 1, 0);
          set(q, "wheel02", 2, 1, 1);
          set(q, "wheel02", 1, 1, 1);
        }
        // step 34: the 7th time
        if (n === 7) {
          set(q, "wheeltile2", 1, 1, 0);
          set(q, "wheel02", 2, 1, 1);
          set(q, "wheel02", 1, 1, 1);
        }
        // step 35: the 8th time
        if (n === 8) {
          set(q, "wheeltile2", 2, 1, 0);
          set(q, "wheel02", 2, 1, 1);
          set(q, "wheel02", 1, 1, 1);
        }
      },
      graham02(q) {
        const n = tally(q, "trigger graham02");
        // step 36: the 2nd time
        if (n === 2) {
          q.after(2320, () => {
            q.send("qcmd", 3, 0, "graham02", 3, 15897);
            set(q, "wheeltile2", 2, 1, 0);
            set(q, "wheel02", 2, 1, 1);
            set(q, "wheel02", 1, 1, 1);
            set(q, "wheeltile2", 3, 1, 0);
            set(q, "wheel02", 2, 1, 1);
            set(q, "wheel02", 1, 1, 1);
            set(q, "wheeltile2", 4, 1, 0);
            set(q, "wheel02", 2, 1, 1);
            set(q, "wheel02", 1, 1, 1);
            q.send("qcmd", 3, 0, "graham02", 3, 15897);
          });
        }
      },
      wheel03(q) {
        // step 37: once
        if (once(q, "step37")) {
          set(q, "wheeltile3", 1, 1, 0);
          set(q, "wheeltile1", 99, 0, 0);
          set(q, "wheeltile2", 99, 0, 0);
          set(q, "wheeltile3", 99, 0, 0);
          set(q, "wheel01", 99, 0, 0);
          set(q, "wheel02", 99, 0, 0);
          set(q, "wheel03", 99, 0, 0);
          set(q, "puzzledoor", 1, 1, 0);
          q.send("qcmdVT", 1, "10_uri", 1, 0, 0);
          q.send("qposturi", "/adventure7-thesearchforgreely/#10-solveddoorpuzzle/#0#001");
          q.send("qcmdVT", 1, "10_uri", 99, 0, 0);
          q.after(1340, () => {
            set(q, "den_block", 99, 0, 0);
            set(q, "graham02", 4, 1, 1);
            q.send("qcmd", 3, 0, "graham02", 4, 15898);
          });
        }
      },
      greelyitem02(q) {
        // step 38
        q.send("qcmd", 2, "greelyitem02", 15926, 2);
      },
      greelyitem03(q) {
        // step 39
        q.send("qcmd", 2, "greelyitem03", 15927, 2);
      },
      graham03_go(q) {
        // step 40
        q.send("qcmd", 38, 15817);
        set(q, "graham03_go", 99, 0, 0);
      },
      graham03(q) {
        const n = tally(q, "trigger graham03");
        // step 41: the 1st time
        if (n === 1) {
          q.send("qcmd", 3, 0, "graham03", 0, 15834);
        }
        // step 42: the 2nd time
        if (n === 2) {
          q.send("qcmd", 3, 0, "graham03", 1, 15855);
        }
        // step 43: the 3rd time
        if (n === 3) {
          q.send("qcmd", 3, 0, "graham03", 1, 15855);
        }
        // step 44: the 4th time
        if (n === 4) {
          q.send("qcmd", 3, 0, "graham03", 2, 15858);
        }
        // step 45: the 5th time and after
        if (n >= 5) {
          q.send("qcmd", 3, 0, "graham03", 2, 15858);
        }
      },
      portal01(q) {
        const n = tally(q, "trigger portal01");
        // step 47: the 1st time
        if (n === 1) {
          q.send("qcmd", 2, "portal01", 15819, 0);
        }
        // step 48: the 2nd time
        if (n === 2) {
          q.send("qcmdVT", 1, "portal01once", 1, 0, 0);
          q.send("qcmd", 38, 15956);
          set(q, "treasure03", 99, 0, 0);
          set(q, "avatarpad2", 99, 0, 0);
          set(q, "avatardoor2", 99, 0, 0);
          set(q, "avataronly2", 99, 0, 0);
          set(q, "bossblokvol1", 99, 0, 0);
          set(q, "bossblokvol2", 99, 0, 0);
          set(q, "bossblokvol3", 99, 0, 0);
          set(q, "bossblokvol4", 99, 0, 0);
          set(q, "cp4", 99, 0, 0);
          set(q, "cp5", 99, 0, 0);
          set(q, "chqpoint04lp", 99, 0, 0);
          set(q, "chqpoint05lp", 99, 0, 0);
          set(q, "boss_on", 99, 0, 0);
          set(q, "alarmlights", 1, 1, 0);
          set(q, "bseedpile1", 99, 0, 0);
          set(q, "bseedpile2", 99, 0, 0);
          set(q, "bseedpile3", 99, 0, 0);
          set(q, "bseedpile4", 99, 0, 0);
          set(q, "bseedpile5", 99, 0, 0);
          set(q, "bseedpile6", 99, 0, 0);
          set(q, "bseedpile1t", 1, 1, 0);
          set(q, "bseedpile2t", 1, 1, 0);
          set(q, "bseedpile3t", 1, 1, 0);
          set(q, "bseedpile4t", 1, 1, 0);
          set(q, "bseedpile5t", 1, 1, 0);
          set(q, "bseedpile6t", 1, 1, 0);
          set(q, "key_final", 99, 0, 0);
          set(q, "portal01blok", 99, 0, 0);
          q.send("qcmdVT", 1, "20_uri", 1, 0, 0);
          q.send("qposturi", "/adventure7-thesearchforgreely/#20-enteredphantomvortex/#0#001");
          q.send("qcmdVT", 1, "20_uri", 99, 0, 0);
          q.room("in_7b", "in_7b");
        }
        // the way through keeps working after that (by hand: the maker stopped after the 2nd time)
        if (n >= 3) {
          q.room("in_7b", "in_7b");
        }
      },
      changer(q) {
        const held = q.held(); // what the player carried when this fired
        // step 49: only while holding alpha_stone
        if (held === "alpha_stone") {
          q.send("qcmd", 38, 15882);
          set(q, "gooploop", 1, 1, 0);
          set(q, "shower_slot", 1, 1, 0);
          q.use();
          set(q, "alpha_stone", 99, 0, 0);
          set(q, "changer_vol", 1, 1, 1);
          set(q, "shower_spout", 2, 1, 0);
          set(q, "graham03", 2, 1, 1);
          set(q, "changer", 99, 0, 0);
        }
      },
      changer_vol(q) {
        const n = tally(q, "trigger changer_vol");
        // step 50: the 1st time
        if (n === 1) {
          q.send("qavsw", 2, 1167910);
          q.send("qcmd", 38, 15883);
          set(q, "changer_vol", 2, 1, 1);
        }
      },
      changeback(q) {
        const n = tally(q, "trigger changeback");
        // step 52: the 1st time
        if (n === 1) {
          q.send("qavsw", 0, 1167910);
          q.send("qcmd", 3, 0, "changeback", 0, 15886);
        }
      },
      exit_vol(q) {
        const n = tally(q, "trigger exit_vol");
        // step 53: the 1st time
        if (n === 1) {
          q.send("qcmd", 2, "exit_vol", 15819, 0);
        }
        // step 54: the 2nd time
        if (n === 2) {
          q.send("qcmd", 19);
        }
      },
      pod40__give_gem(q) {
        // step 60: once
        if (once(q, "step60")) {
          q.send("qad", "pod40__give_gem", 0, "null");
          q.gems(15);
        }
      },
      pod41__give_gem(q) {
        // step 66: once
        if (once(q, "step66")) {
          q.send("qad", "pod41__give_gem", 0, "null");
          q.gems(15);
        }
      },
      pod43__give_gem(q) {
        // step 77: once
        if (once(q, "step77")) {
          q.send("qad", "pod43__give_gem", 0, "null");
          q.gems(15);
        }
      },
      pod42__give_gem(q) {
        // step 78: once
        if (once(q, "step78")) {
          q.send("qad", "pod42__give_gem", 0, "null");
          q.gems(15);
        }
      },
      find4keys(q) {
        // step 79
        q.send("qcmd", 38, 15837);
        q.send("qicon", "key01icon", 1);
        q.send("qicon", "key02icon", 1);
        q.send("qicon", "key03icon", 1);
        q.send("qicon", "key04icon", 1);
        set(q, "find4keys", 99, 0, 0);
      },
      seedpile03(q) {
        // step 80
        giveSeeds(q, 137, 3, 3);
        set(q, "seedpile03", 99, 0, 0);
        set(q, "seedpile03_t", 1, 1, 0);
        q.after(39440, () => {
          set(q, "seedpile03_t", 0, 1, 0);
          set(q, "seedpile03", 0, 1, 1);
          q.send("qcmdVT", 1, "seedtimer03", 0, 0, 0);
        });
      },
      switch04(q) {
        // step 81: once
        if (once(q, "step81")) {
          q.xp(5, "switch04");
          set(q, "switch04_t", 1, 1, 0);
          set(q, "sentry15_lp", 1, 0, 0);
          set(q, "sentry14_lp", 1, 0, 0);
          set(q, "sentry18_lp", 1, 0, 0);
          set(q, "sentry19_lp", 1, 0, 0);
          set(q, "switch04", 99, 0, 0);
          q.after(280, () => {
            q.send("qswfs", "sentry15", "turnoff");
            set(q, "sentry15", 1, 1, 0);
            q.send("qswfs", "sentry14", "turnoff");
            set(q, "sentry14", 1, 1, 0);
            q.send("qswfs", "sentry18", "turnoff");
            set(q, "sentry18", 1, 1, 0);
            q.send("qswfs", "sentry19", "turnoff");
            set(q, "sentry19", 1, 1, 0);
          });
        }
      },
      switch05(q) {
        // step 83: once
        if (once(q, "step83")) {
          q.xp(5, "switch05");
          set(q, "switch05_t", 1, 1, 0);
          set(q, "sentry16_lp", 1, 0, 0);
          set(q, "sentry17_lp", 1, 0, 0);
          set(q, "sentry20_lp", 1, 0, 0);
          set(q, "sentry21_lp", 1, 0, 0);
          set(q, "switch05", 99, 0, 0);
          q.after(940, () => {
            q.send("qswfs", "sentry16", "turnoff");
            set(q, "sentry16", 1, 1, 0);
            q.send("qswfs", "sentry17", "turnoff");
            set(q, "sentry17", 1, 1, 0);
            q.send("qswfs", "sentry20", "turnoff");
            set(q, "sentry20", 1, 1, 0);
            q.send("qswfs", "sentry21", "turnoff");
            set(q, "sentry21", 1, 1, 0);
            appear(q, "factory04");
            set(q, "fact04blok", 1, 1, 1);
            set(q, "factory04", 2, 1, 1);
            appear(q, "factory05");
            set(q, "fact05blok", 1, 1, 1);
            set(q, "factory05", 2, 1, 1);
          });
        }
      },
      factory05__0___give_d(q) {
        // step 93: once
        if (once(q, "step93")) {
          q.send("qad", "factory05__0___give_d", 0, "null");
          q.gems(25);
        }
      },
      phantom12__give_gem(q) {
        // step 99: once
        if (once(q, "step99")) {
          q.send("qad", "phantom12__give_gem", 0, "null");
          q.gems(25);
        }
      },
      pod25__give_gem(q) {
        // step 109: once
        if (once(q, "step109")) {
          q.send("qad", "pod25__give_gem", 0, "null");
          q.gems(15);
        }
      },
      pod22__give_gem(q) {
        // step 115: once
        if (once(q, "step115")) {
          q.send("qad", "pod22__give_gem", 0, "null");
          q.gems(5);
        }
      },
      pod23__give_gem(q) {
        // step 116: once
        if (once(q, "step116")) {
          q.send("qad", "pod23__give_gem", 0, "null");
          q.gems(5);
        }
      },
      pod26__give_gem(q) {
        // step 123: once
        if (once(q, "step123")) {
          q.send("qad", "pod26__give_gem", 0, "null");
          q.gems(5);
        }
      },
      pod37__give_gem(q) {
        // step 135: once
        if (once(q, "step135")) {
          q.send("qad", "pod37__give_gem", 0, "null");
          q.gems(5);
        }
      },
      pod33__give_gem(q) {
        // step 146: once
        if (once(q, "step146")) {
          q.send("qad", "pod33__give_gem", 0, "null");
          q.gems(10);
        }
      },
      pod31__give_gem(q) {
        // step 152: once
        if (once(q, "step152")) {
          q.send("qad", "pod31__give_gem", 0, "null");
          q.gems(10);
        }
      },
      pod38__give_gem(q) {
        // step 153: once
        if (once(q, "step153")) {
          q.send("qad", "pod38__give_gem", 0, "null");
          q.gems(10);
        }
      },
      pod30__give_gem(q) {
        // step 154: once
        if (once(q, "step154")) {
          q.send("qad", "pod30__give_gem", 0, "null");
          q.gems(15);
        }
      },
      switch03(q) {
        // step 160: once
        if (once(q, "step160")) {
          q.xp(5, "switch03");
          set(q, "switch03_t", 1, 1, 0);
          set(q, "sentry07_lp", 1, 0, 0);
          set(q, "sentry08_lp", 1, 0, 0);
          set(q, "sentry09_lp", 1, 0, 0);
          set(q, "sentry10_lp", 1, 0, 0);
          set(q, "sentry11_lp", 1, 0, 0);
          set(q, "sentry12_lp", 1, 0, 0);
          set(q, "sentry13_lp", 1, 0, 0);
          set(q, "switch03", 99, 0, 0);
          appear(q, "factory06");
          set(q, "fact06blok", 1, 1, 1);
          set(q, "factory06", 2, 1, 1);
          appear(q, "factory07");
          set(q, "fact07blok", 1, 1, 1);
          set(q, "factory07", 2, 1, 1);
          q.send("qswfs", "sentry07", "turnoff");
          set(q, "sentry07", 1, 1, 0);
          q.send("qswfs", "sentry08", "turnoff");
          set(q, "sentry08", 1, 1, 0);
          q.send("qswfs", "sentry09", "turnoff");
          set(q, "sentry09", 1, 1, 0);
          q.send("qswfs", "sentry10", "turnoff");
          set(q, "sentry10", 1, 1, 0);
          q.send("qswfs", "sentry11", "turnoff");
          set(q, "sentry11", 1, 1, 0);
          q.send("qswfs", "sentry12", "turnoff");
          set(q, "sentry12", 1, 1, 0);
          q.send("qswfs", "sentry13", "turnoff");
          set(q, "sentry13", 1, 1, 0);
        }
      },
      aseedpile04(q) {
        // step 165
        giveSeeds(q, 137, 3, 3);
        set(q, "aseedpile04", 1, 1, 1);
        set(q, "aseedpile04", 0, 1, 1);
      },
      factory06__1___give_d(q) {
        // step 166: once
        if (once(q, "step166")) {
          q.send("qad", "factory06__1___give_d", 0, "null");
          q.gems(25);
        }
      },
      pod16__give_gem(q) {
        // step 167: once
        if (once(q, "step167")) {
          q.send("qad", "pod16__give_gem", 0, "null");
          q.gems(10);
        }
      },
      factory06__0___give_d(q) {
        // step 168: once
        if (once(q, "step168")) {
          q.send("qad", "factory06__0___give_d", 0, "null");
          q.gems(25);
        }
      },
      factory04__0___give_d(q) {
        // step 169: once
        if (once(q, "step169")) {
          q.send("qad", "factory04__0___give_d", 0, "null");
          q.gems(25);
        }
      },
      seedpile02(q) {
        // step 170
        giveSeeds(q, 137, 3, 3);
        set(q, "seedpile02", 99, 0, 0);
        set(q, "seedpile02_t", 1, 1, 0);
        q.after(39440, () => {
          set(q, "seedpile02_t", 0, 1, 0);
          set(q, "seedpile02", 0, 1, 1);
          q.send("qcmdVT", 1, "seedtimer02", 0, 0, 0);
        });
      },
      phantom10__give_gem(q) {
        // step 177: once
        if (once(q, "step177")) {
          q.send("qad", "phantom10__give_gem", 0, "null");
          q.gems(25);
        }
      },
      pod11__give_gem(q) {
        // step 178: once
        if (once(q, "step178")) {
          q.send("qad", "pod11__give_gem", 0, "null");
          q.gems(15);
        }
      },
      pod13__give_gem(q) {
        // step 179: once
        if (once(q, "step179")) {
          q.send("qad", "pod13__give_gem", 0, "null");
          q.gems(15);
        }
      },
      phantom09__give_gem(q) {
        // step 180: once
        if (once(q, "step180")) {
          q.send("qad", "phantom09__give_gem", 0, "null");
          q.gems(25);
        }
      },
      seedpile15(q) {
        // step 181
        giveSeeds(q, 137, 3, 3);
        set(q, "seedpile15", 99, 0, 0);
        set(q, "seedpile15_t", 1, 1, 0);
        q.after(39440, () => {
          set(q, "seedpile15_t", 0, 1, 0);
          set(q, "seedpile15", 0, 1, 1);
          q.send("qcmdVT", 1, "seedtimer15", 0, 0, 0);
        });
      },
      pod18__give_gem(q) {
        // step 183: once
        if (once(q, "step183")) {
          q.send("qad", "pod18__give_gem", 0, "null");
          q.gems(10);
        }
      },
      phantom25__give_gem(q) {
        // step 184: once
        if (once(q, "step184")) {
          q.send("qad", "phantom25__give_gem", 0, "null");
          q.gems(25);
        }
      },
      pod47__give_gem(q) {
        // step 190: once
        if (once(q, "step190")) {
          q.send("qad", "pod47__give_gem", 0, "null");
          q.gems(15);
        }
      },
      aseedpile02(q) {
        const n = tally(q, "trigger aseedpile02");
        // step 191: the 5th time
        if (n === 5) {
          giveSeeds(q, 137, 3, 3);
          set(q, "aseedpile02", 1, 1, 1);
          set(q, "aseedpile02", 0, 1, 1);
          giveSeeds(q, 137, 3, 3);
          set(q, "aseedpile02", 1, 1, 1);
          set(q, "aseedpile02", 0, 1, 1);
          giveSeeds(q, 137, 3, 3);
          set(q, "aseedpile02", 1, 1, 1);
          set(q, "aseedpile02", 0, 1, 1);
          giveSeeds(q, 137, 3, 3);
          set(q, "aseedpile02", 1, 1, 1);
          set(q, "aseedpile02", 0, 1, 1);
          q.after(290, () => {
            giveSeeds(q, 137, 3, 3);
            set(q, "aseedpile02", 1, 1, 1);
            set(q, "aseedpile02", 0, 1, 1);
          });
        }
      },
      factory03__2___give_d(q) {
        // step 193: once
        if (once(q, "step193")) {
          q.send("qad", "factory03__2___give_d", 0, "null");
          q.gems(25);
        }
      },
      factory03__1___give_d(q) {
        // step 194: once
        if (once(q, "step194")) {
          q.send("qad", "factory03__1___give_d", 0, "null");
          q.gems(25);
        }
      },
      factory03__0___give_d(q) {
        // step 195: once
        if (once(q, "step195")) {
          q.send("qad", "factory03__0___give_d", 0, "null");
          q.gems(25);
        }
      },
      pod17__give_gem(q) {
        // step 196: once
        if (once(q, "step196")) {
          q.send("qad", "pod17__give_gem", 0, "null");
          q.gems(15);
        }
      },
      pod12__give_gem(q) {
        // step 197: once
        if (once(q, "step197")) {
          q.send("qad", "pod12__give_gem", 0, "null");
          q.gems(5);
        }
      },
      seedpile01(q) {
        const n = tally(q, "trigger seedpile01");
        // step 198: the 1st time
        if (n === 1) {
          giveSeeds(q, 137, 3, 3);
          set(q, "seedpile01", 99, 0, 0);
          set(q, "seedpile01_t", 1, 1, 0);
          q.after(39440, () => {
            set(q, "seedpile01_t", 0, 1, 0);
            set(q, "seedpile01", 0, 1, 1);
            q.send("qcmdVT", 1, "seedtimer01", 0, 0, 0);
          });
        }
        // step 199: the 2nd time
        if (n === 2) {
          giveSeeds(q, 137, 3, 3);
          set(q, "seedpile01", 99, 0, 0);
          set(q, "seedpile01_t", 1, 1, 0);
          q.after(39440, () => {
            set(q, "seedpile01_t", 0, 1, 0);
            set(q, "seedpile01", 0, 1, 1);
            q.send("qcmdVT", 1, "seedtimer01", 0, 0, 0);
          });
        }
        // step 200: the 4th time
        if (n === 4) {
          q.after(9360, () => {
            giveSeeds(q, 137, 3, 3);
            set(q, "seedpile01", 99, 0, 0);
            set(q, "seedpile01_t", 1, 1, 0);
            q.after(39440, () => {
              set(q, "seedpile01_t", 0, 1, 0);
              set(q, "seedpile01", 0, 1, 1);
              q.send("qcmdVT", 1, "seedtimer01", 0, 0, 0);
            });
          });
        }
        // step 201: the 5th time and after
        if (n >= 5) {
          giveSeeds(q, 137, 3, 3);
          set(q, "seedpile01", 99, 0, 0);
          set(q, "seedpile01_t", 1, 1, 0);
          q.after(39440, () => {
            set(q, "seedpile01_t", 0, 1, 0);
            set(q, "seedpile01", 0, 1, 1);
            q.send("qcmdVT", 1, "seedtimer01", 0, 0, 0);
          });
        }
      },
      pod44__give_gem(q) {
        // step 212: once
        if (once(q, "step212")) {
          q.send("qad", "pod44__give_gem", 0, "null");
          q.gems(15);
        }
      },
      pod01__give_gem(q) {
        // step 213: once
        if (once(q, "step213")) {
          q.send("qad", "pod01__give_gem", 0, "null");
          q.gems(5);
        }
      },
      pod02__give_gem(q) {
        // step 216: once
        if (once(q, "step216")) {
          q.send("qad", "pod02__give_gem", 0, "null");
          q.gems(5);
        }
      },
      switch01(q) {
        // step 217: once
        if (once(q, "step217")) {
          q.xp(5, "switch01");
          set(q, "switch01_t", 1, 1, 0);
          set(q, "sentry01_lp", 1, 0, 0);
          set(q, "sentry02_lp", 1, 0, 0);
          set(q, "switch01", 99, 0, 0);
          q.after(1600, () => {
            q.send("qswfs", "sentry01", "turnoff");
            set(q, "sentry01", 1, 1, 0);
            q.send("qswfs", "sentry02", "turnoff");
            set(q, "sentry02", 1, 1, 0);
          });
        }
      },
      phantom05__give_gem(q) {
        // step 218: once
        if (once(q, "step218")) {
          q.send("qad", "phantom05__give_gem", 0, "null");
          q.gems(25);
        }
      },
      pod04__give_gem(q) {
        // step 227: once
        if (once(q, "step227")) {
          q.send("qad", "pod04__give_gem", 0, "null");
          q.gems(10);
        }
      },
      pod06__give_gem(q) {
        // step 228: once
        if (once(q, "step228")) {
          q.send("qad", "pod05__give_gem", 0, "null");
          q.send("qad", "pod06__give_gem", 0, "null");
          q.gems(10);
        }
      },
      seedpile05(q) {
        // step 229
        giveSeeds(q, 137, 3, 3);
        set(q, "seedpile05", 99, 0, 0);
        set(q, "seedpile05_t", 1, 1, 0);
        q.after(39440, () => {
          set(q, "seedpile05_t", 0, 1, 0);
          set(q, "seedpile05", 0, 1, 1);
          q.send("qcmdVT", 1, "seedtimer05", 0, 0, 0);
        });
      },
      phantom__02__give_gem(q) {
        // step 230: once
        if (once(q, "step230")) {
          q.send("qad", "phantom__02__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phantom__03__give_gem(q) {
        // step 231: once
        if (once(q, "step231")) {
          q.send("qad", "phantom__03__give_gem", 0, "null");
          q.gems(25);
        }
      },
      pod07__give_gem(q) {
        // step 232: once
        if (once(q, "step232")) {
          q.send("qad", "pod07__give_gem", 0, "null");
          q.gems(15);
        }
      },
      aseedpile01(q) {
        // step 233
        giveSeeds(q, 137, 3, 3);
        set(q, "aseedpile01", 1, 1, 1);
        set(q, "aseedpile01", 0, 1, 1);
      },
      phantom06__give_gem(q) {
        // step 235: once
        if (once(q, "step235")) {
          q.send("qad", "phantom06__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phantom07__give_gem(q) {
        // step 236: once
        if (once(q, "step236")) {
          q.send("qad", "phantom07__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phantom08__give_gem(q) {
        // step 240: once
        if (once(q, "step240")) {
          q.send("qad", "phantom08__give_gem", 0, "null");
          q.gems(25);
        }
      },
      pod08__give_gem(q) {
        // step 241: once
        if (once(q, "step241")) {
          q.send("qad", "pod08__give_gem", 0, "null");
          q.gems(15);
        }
      },
      phantom24__give_gem(q) {
        // step 242: once
        if (once(q, "step242")) {
          q.send("qad", "phantom24__give_gem", 0, "null");
          q.gems(25);
        }
      },
      pod09__give_gem(q) {
        // step 248: once
        if (once(q, "step248")) {
          q.send("qad", "pod09__give_gem", 0, "null");
          q.gems(10);
        }
      },
      phantom__22__give_gem(q) {
        // step 249: once
        if (once(q, "step249")) {
          q.send("qad", "phantom__22__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phantom__21__give_gem(q) {
        // step 251: once
        if (once(q, "step251")) {
          q.send("qad", "phantom__21__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phantom__23__give_gem(q) {
        // step 252: once
        if (once(q, "step252")) {
          q.send("qad", "phantom__23__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phantom__20__give_gem(q) {
        // step 253: once
        if (once(q, "step253")) {
          q.send("qad", "phantom__20__give_gem", 0, "null");
          q.gems(25);
        }
      },
      pod10__give_gem(q) {
        // step 259: once
        if (once(q, "step259")) {
          q.send("qad", "pod10__give_gem", 0, "null");
          q.gems(5);
        }
      },
      switch02(q) {
        // step 260: once
        if (once(q, "step260")) {
          q.xp(5, "switch02");
          set(q, "switch02_t", 1, 1, 0);
          set(q, "sentry03_lp", 1, 0, 0);
          set(q, "sentry04_lp", 1, 0, 0);
          set(q, "sentry06_lp", 1, 0, 0);
          set(q, "switch02", 99, 0, 0);
          q.after(790, () => {
            appear(q, "factory01");
            set(q, "fact01blok", 1, 1, 1);
            set(q, "factory01", 2, 1, 1);
            q.send("qswfs", "sentry03", "turnoff");
            set(q, "sentry03", 1, 1, 0);
            q.send("qswfs", "sentry04", "turnoff");
            set(q, "sentry04", 1, 1, 0);
            q.send("qswfs", "sentry06", "turnoff");
            set(q, "sentry06", 1, 1, 0);
          });
        }
      },
      all2boss(q) {
        // step 261
        q.send("qcmd", 14, 1, "bossstart");
      },
      bseedpile5(q) {
        // step 263
        giveSeeds(q, 137, 3, 3);
        set(q, "bseedpile5", 99, 0, 0);
        set(q, "bseedpile5t", 1, 1, 0);
        q.send("qcmdVT", 1, "seedcount", bump(q, "seedcount"), 0, 0); // one more than last time
        counted(q, "seedcount"); // what that count sets off
        q.after(50470, () => {
          set(q, "bseedpile5t", 0, 1, 0);
          q.send("qcmdVT", 1, "seeddelay", 0, 0, 0);
          q.after(1000, () => {
            set(q, "bseedpile5", 0, 1, 1);
            q.send("qcmdVT", 1, "seedtimer5", 0, 0, 0);
          });
        });
      },
      bseedpile6(q) {
        // step 264
        giveSeeds(q, 137, 3, 3);
        set(q, "bseedpile6", 99, 0, 0);
        set(q, "bseedpile6t", 1, 1, 0);
        q.send("qcmdVT", 1, "seedcount", bump(q, "seedcount"), 0, 0); // one more than last time
        counted(q, "seedcount"); // what that count sets off
        q.after(50470, () => {
          set(q, "bseedpile6t", 0, 1, 0);
          q.send("qcmdVT", 1, "seeddelay", 0, 0, 0);
          q.after(1000, () => {
            set(q, "bseedpile6", 0, 1, 1);
            q.send("qcmdVT", 1, "seedtimer6", 0, 0, 0);
          });
        });
      },
      factory01__0___give_d(q) {
        // step 265: once
        if (once(q, "step265")) {
          q.send("qad", "factory01__0___give_d", 0, "null");
          q.gems(25);
        }
      },
      bseedpile2(q) {
        // step 266
        giveSeeds(q, 137, 3, 3);
        set(q, "bseedpile2", 99, 0, 0);
        set(q, "bseedpile2t", 1, 1, 0);
        q.send("qcmdVT", 1, "seedcount", bump(q, "seedcount"), 0, 0); // one more than last time
        counted(q, "seedcount"); // what that count sets off
        q.after(50470, () => {
          set(q, "bseedpile2t", 0, 1, 0);
          q.send("qcmdVT", 1, "seeddelay", 0, 0, 0);
          q.after(1000, () => {
            set(q, "bseedpile2", 0, 1, 1);
            q.send("qcmdVT", 1, "seedtimer2", 0, 0, 0);
          });
        });
      },
      bseedpile1(q) {
        const n = tally(q, "trigger bseedpile1");
        // step 267: the 14th time
        if (n === 14) {
          giveSeeds(q, 137, 3, 3);
          set(q, "bseedpile1", 99, 0, 0);
          set(q, "bseedpile1t", 1, 1, 0);
          q.send("qcmdVT", 1, "seedcount", bump(q, "seedcount"), 0, 0); // one more than last time
          counted(q, "seedcount"); // what that count sets off
          q.send("qcmdVT", 1, "seeddelay", 0, 0, 0);
          q.after(29660, () => {
            q.after(50470, () => {
              set(q, "bseedpile1t", 0, 1, 0);
              q.send("qcmdVT", 1, "seeddelay", 0, 0, 0);
              q.after(1000, () => {
                set(q, "bseedpile1", 0, 1, 1);
                q.send("qcmdVT", 1, "seedtimer1", 0, 0, 0);
              });
            });
          });
        }
      },
      bseedpile3(q) {
        // step 268
        giveSeeds(q, 137, 3, 3);
        set(q, "bseedpile3", 99, 0, 0);
        set(q, "bseedpile3t", 1, 1, 0);
        q.send("qcmdVT", 1, "seedcount", bump(q, "seedcount"), 0, 0); // one more than last time
        counted(q, "seedcount"); // what that count sets off
        q.after(270, () => {
          q.send("qcmdVT", 1, "seeddelay", 0, 0, 0);
          q.after(1000, () => {
            q.after(50470, () => {
              set(q, "bseedpile3t", 0, 1, 0);
              q.send("qcmdVT", 1, "seeddelay", 0, 0, 0);
              q.after(1000, () => {
                set(q, "bseedpile3", 0, 1, 1);
                q.send("qcmdVT", 1, "seedtimer3", 0, 0, 0);
              });
            });
          });
        });
      },
      bseedpile4(q) {
        const n = tally(q, "trigger bseedpile4");
        // step 269: the 1st time
        if (n === 1) {
          giveSeeds(q, 137, 3, 3);
          set(q, "bseedpile4", 99, 0, 0);
          set(q, "bseedpile4t", 1, 1, 0);
          q.send("qcmdVT", 1, "seedcount", bump(q, "seedcount"), 0, 0); // one more than last time
          counted(q, "seedcount"); // what that count sets off
          q.after(50470, () => {
            set(q, "bseedpile4t", 0, 1, 0);
            q.send("qcmdVT", 1, "seeddelay", 0, 0, 0);
            q.after(1000, () => {
              set(q, "bseedpile4", 0, 1, 1);
              q.send("qcmdVT", 1, "seedtimer4", 0, 0, 0);
            });
          });
        }
        // step 270: the 2nd time
        if (n === 2) {
          giveSeeds(q, 137, 3, 3);
          set(q, "bseedpile4", 99, 0, 0);
          set(q, "bseedpile4t", 1, 1, 0);
          q.send("qcmdVT", 1, "seedcount", bump(q, "seedcount"), 0, 0); // one more than last time
          counted(q, "seedcount"); // what that count sets off
          q.after(1870, () => {
            q.send("qcmdVT", 1, "seeddelay", 0, 0, 0);
            q.after(1000, () => {
              q.after(50470, () => {
                set(q, "bseedpile4t", 0, 1, 0);
                q.send("qcmdVT", 1, "seeddelay", 0, 0, 0);
                q.after(1000, () => {
                  set(q, "bseedpile4", 0, 1, 1);
                  q.send("qcmdVT", 1, "seedtimer4", 0, 0, 0);
                });
              });
            });
          });
        }
      },
      kphant2__2b__give_gem(q) {
        // step 271: once
        if (once(q, "step271")) {
          q.send("qad", "kphant2__2b__give_gem", 0, "null");
          q.gems(25);
        }
      },
      lock_final(q) {
        const held = q.held(); // what the player carried when this fired
        // step 273: only while holding key_final, once
        if (held === "key_final" && once(q, "step273")) {
          q.xp(50, "lock_final");
          q.use();
          set(q, "greelycage", 6, 1, 0);
          q.send("qsnd", "ajq_greelyprisonshatter");
          set(q, "lock_final", 99, 0, 0);
          q.after(1160, () => {
            set(q, "greely01", 1, 1, 1);
            q.send("qcmd", 3, 0, "greely01", 1, 15836);
          });
        }
      },
      show_alphas(q) {
        // step 275
        set(q, "exit_vol", 99, 0, 0);
        set(q, "greely02x", 1, 1, 1);
        q.send("qcmd", 3, 0, "greely02x", 1, 15841);
        set(q, "show_alphas", 99, 0, 0);
      },
      graham04(q) {
        // step 287
        q.send("qcmd", 3, 0, "graham04", 3, 15937);
      },
      greely02(q) {
        // step 288
        q.send("qcmd", 3, 0, "greely02", 4, 15870);
      },
      cosmo01(q) {
        // step 289
        q.send("qcmd", 3, 0, "cosmo01", 3, 15938);
      },
      liza01(q) {
        // step 290
        q.send("qcmd", 3, 0, "liza01", 3, 15936);
      },
      factory04(q) {
        spawning(q, "factory04"); // the factory starts sending out phantoms
      },
      factory05(q) {
        spawning(q, "factory05"); // the factory starts sending out phantoms
      },
      factory06(q) {
        spawning(q, "factory06"); // the factory starts sending out phantoms
      },
      factory03(q) {
        spawning(q, "factory03"); // the factory starts sending out phantoms
      },
      factory02(q) {
        spawning(q, "factory02"); // the factory starts sending out phantoms
      },
      factory01(q) {
        spawning(q, "factory01"); // the factory starts sending out phantoms
      },
    },

    // families of triggers: the rule for any of them; {n} is its number
    triggerLike: [
      [/^treasure(\d+)$/, (q, name) => {
        const n = name.match(/^treasure(\d+)$/)[1];
        // each of them, once each
        if (once(q, "treasure# - " + name)) {
          // step 291
          set(q, "seedpile03_t", 0, 1, 0);
          set(q, "seedpile03", 0, 1, 1);
          q.send("qcmdVT", 1, "seedtimer03", 0, 0, 0);
        }
      }],
      [/^lock(\d+)$/, (q, name) => {
        const n = name.match(/^lock(\d+)$/)[1];
        const held = q.held(); // what the player carried when this fired
        // each of them, holding key#, once each
        if (/^key\d+[a-z]?$/.test(held || "") && once(q, "lock# key# " + name)) {
          // step 292
          q.use();
          q.send("qcmdVT", 1, "lockcount", bump(q, "lockcount"), 0, 0); // one more than last time
          counted(q, "lockcount"); // what that count sets off
          q.xp(25, `${name}`);
          set(q, `${name}`, 1, 0, 0);
        }
        // lock04, holding key#, once each
        if (name === "lock04" && /^key\d+[a-z]?$/.test(held || "") && once(q, "lock# key# lock04 " + name)) {
          // step 293
          set(q, "greelychain4", 1, 1, 0);
        }
        // lock01, holding key#, once each
        if (name === "lock01" && /^key\d+[a-z]?$/.test(held || "") && once(q, "lock# key# lock01 " + name)) {
          // step 294
          set(q, "greelychain1", 1, 1, 0);
        }
        // lock03, holding key#, once each
        if (name === "lock03" && /^key\d+[a-z]?$/.test(held || "") && once(q, "lock# key# lock03 " + name)) {
          // step 295
          set(q, "greelychain3", 1, 1, 0);
        }
        // lock02, holding key#, once each
        if (name === "lock02" && /^key\d+[a-z]?$/.test(held || "") && once(q, "lock# key# lock02 " + name)) {
          // step 296
          set(q, "greelychain2", 1, 1, 0);
        }
        // each of them, unless holding key#
        if (!/^key\d+[a-z]?$/.test(held || "")) {
          // step 297
          q.send("qcmd", 2, `${name}`, 15860, 0);
        }
      }],
    ],

    // a talk read to its end
    answer: {
      graham01(q) {
        // step 3
        q.send("qcmd", 38, 15820);
        set(q, "givetorch", 1, 1, 1);
        q.send("qswfs", "graham01", "disappear");
        set(q, "graham01", 3, 1, 1);
        set(q, "graham01", 4, 1, 0);
      },
      graham02(q) {
        const n = tally(q, "answer graham02");
        // step 26: the 1st time
        if (n === 1) {
          q.send("qcmd", 38, 15854);
          set(q, "wheel01", 1, 1, 1);
          set(q, "wheel02", 1, 1, 1);
          set(q, "wheel03", 1, 1, 1);
          set(q, "graham02", 3, 1, 1);
        }
        // step 27: the 3rd time
        if (n === 3) {
          q.send("qcmd", 38, 15835);
          q.send("qswfs", "graham02", "disappear");
          set(q, "graham02", 5, 1, 1);
          set(q, "graham02", 6, 1, 0);
          q.after(1080, () => {
            set(q, "graham02", 99, 0, 0);
          });
        }
      },
      graham03(q) {
        const n = tally(q, "answer graham03");
        // step 46: the 1st time
        if (n === 1) {
          q.send("qcmd", 38, 15833);
          q.send("qswfs", "alpha_stone", "appear");
          set(q, "alpha_stone", 1, 1, 0);
          set(q, "graham03", 1, 1, 1);
        }
      },
      greely01(q) {
        // step 274
        q.send("qcmd", 38, 15873);
        set(q, "boss_block1", 0, 1, 0);
        set(q, "bossblokvol3", 99, 0, 0);
        q.send("qswfs", "greely02", "facesw");
        set(q, "greely02", 2, 1, 1);
        set(q, "greely02", 1, 1, 0);
        q.send("qicon", "greely02", 1);
        set(q, "show_alphas", 1, 1, 1);
        set(q, "exitblock", 1, 1, 0);
        q.send("qswfs", "greely01", "disappear");
        set(q, "greely01", 2, 1, 1);
        set(q, "greely01", 3, 1, 0);
        q.after(1270, () => {
          set(q, "greely01", 99, 0, 0);
        });
      },
      greely02x(q) {
        const n = tally(q, "answer greely02x");
        // step 276: the 1st time
        if (n === 1) {
          set(q, "exitportal2", 2, 1, 0);
          set(q, "portal_loop2", 99, 0, 0);
          set(q, "portal_clear", 1, 1, 0);
          q.after(1000, () => {
            appear(q, "graham04");
            set(q, "graham04", 2, 1, 0);
            q.after(1000, () => {
              appear(q, "liza01");
              set(q, "liza01", 2, 1, 0);
              q.after(1000, () => {
                appear(q, "cosmo01");
                set(q, "cosmo01", 2, 1, 0);
                q.after(1000, () => {
                  q.send("qswfs", "greely02", "facesw");
                  set(q, "greely02", 2, 1, 1);
                  set(q, "greely02", 1, 1, 0);
                  q.after(1000, () => {
                    set(q, "graham04x", 1, 1, 1);
                    q.send("qcmd", 3, 0, "graham04x", 1, 15874);
                  });
                });
              });
            });
          });
        }
        // step 277: the 2nd time
        if (n === 2) {
          set(q, "cosmo01x", 2, 1, 1);
          q.send("qcmd", 3, 0, "cosmo01x", 2, 15934);
        }
        // step 278: the 3rd time
        if (n === 3) {
          set(q, "beacon", 1, 1, 0);
          q.after(1070, () => {
            set(q, "liza01x", 2, 1, 1);
            q.send("qcmd", 3, 0, "liza01x", 2, 15935);
          });
        }
        // step 279: the 4th time
        if (n === 4) {
          set(q, "graham04x", 2, 1, 1);
          q.send("qcmd", 3, 0, "graham04x", 2, 15875);
        }
        // step 280: the 5th time
        if (n === 5) {
          q.send("qcmd", 38, 15863);
          q.xp(50, "greely02x");
          q.after(1910, () => {
            q.send("qcmdVT", 1, "90_uri", 1, 0, 0);
            q.send("qposturi", "/adventure7-thesearchforgreely/#90-exit/#0#001");
            q.send("qcmdVT", 1, "90_uri", 99, 0, 0);
            q.offer([[1,1490,0],[1,1491,0],[1,1492,0],[1,1493,0],[3,1000,1000]]); // [1, den item, 0], [2, clothing item, ?] or [3, gems, gems]
            set(q, "greely02", 4, 1, 1);
            set(q, "graham04", 3, 1, 1);
            set(q, "liza01", 3, 1, 1);
            set(q, "cosmo01", 3, 1, 1);
            set(q, "boss_block", 0, 1, 0);
            set(q, "bossblokvol1", 99, 0, 0);
            set(q, "bossblokvol2", 99, 0, 0);
            set(q, "bossblokvol4", 99, 0, 0);
            q.send("qicon", "greely02", 0);
            q.after(2000, () => {
              set(q, "exit_vol", 1, 1, 1);
              set(q, "exitblock", 99, 0, 0);
            });
          });
        }
      },
      graham04x(q) {
        const n = tally(q, "answer graham04x");
        // step 281: the 1st time
        if (n === 1) {
          set(q, "liza01x", 1, 1, 1);
          q.send("qcmd", 3, 0, "liza01x", 1, 15878);
        }
        // step 282: the 2nd time
        if (n === 2) {
          set(q, "greely02x", 5, 1, 1);
          q.send("qcmd", 3, 0, "greely02x", 5, 15849);
        }
      },
      liza01x(q) {
        const n = tally(q, "answer liza01x");
        // step 283: the 1st time
        if (n === 1) {
          set(q, "cosmo01x", 1, 1, 1);
          q.send("qcmd", 3, 0, "cosmo01x", 1, 15877);
        }
        // step 284: the 2nd time
        if (n === 2) {
          set(q, "greely02x", 4, 1, 1);
          q.send("qcmd", 3, 0, "greely02x", 4, 15848);
        }
      },
      cosmo01x(q) {
        const n = tally(q, "answer cosmo01x");
        // step 285: the 1st time
        if (n === 1) {
          set(q, "greely02x", 2, 1, 1);
          q.send("qcmd", 3, 0, "greely02x", 2, 15846);
        }
        // step 286: the 2nd time
        if (n === 2) {
          set(q, "greely02x", 3, 1, 1);
          q.send("qcmd", 3, 0, "greely02x", 3, 15847);
        }
      },
    },

    // an item picked up
    pickedUp: {
      key04(q) {
        // step 82
        q.send("qicon", "key04icon", 0);
      },
      key03(q) {
        // step 164
        q.send("qicon", "key03icon", 0);
      },
      key02(q) {
        // step 192: once
        if (once(q, "step192")) {
          set(q, "seedpile02_t", 0, 1, 0);
          set(q, "seedpile02", 0, 1, 1);
          q.send("qcmdVT", 1, "seedtimer02", 0, 0, 0);
          q.after(520, () => {
            appear(q, "factory02");
            set(q, "fact02blok", 1, 1, 1);
            set(q, "factory02", 2, 1, 1);
            appear(q, "factory03");
            set(q, "fact03blok", 1, 1, 1);
            set(q, "factory03", 2, 1, 1);
            q.send("qicon", "key02icon", 0);
          });
        }
      },
      key01(q) {
        // step 250
        q.send("qicon", "key01icon", 0);
      },
      key_final(q) {
        // step 272
        q.send("qicon", "keyfinalicon", 0);
      },
    },

    // hit by the player (adventures.js needs its handler, see the maker)
    attacked: {
      pod40(q) {
        const n = tally(q, "attacked pod40");
        // step 55: the 1st time
        if (n === 1) {
          q.send("qahs", "pod40", 80, 10, 0);
        }
        // step 56: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod40", 60, 10, 0);
        }
        // step 57: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod40", 40, 10, 0);
        }
        // step 58: the 4th time
        if (n === 4) {
          q.send("qahs", "pod40", 20, 10, 0);
        }
        // step 59: the 5th time
        if (n === 5) {
          q.send("qad", "pod40", 10, 0, 1144, 1894, "");
          q.xp(5, "pod40");
          q.send("qspn", "pod40", "pod40__give_gem", 200, 42, 3, 15, "null", "null", "null");
          set(q, "pod40blok", 99, 0, 0);
        }
      },
      pod41(q) {
        const n = tally(q, "attacked pod41");
        // step 61: the 1st time
        if (n === 1) {
          q.send("qahs", "pod41", 80, 10, 0);
        }
        // step 62: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod41", 60, 10, 0);
        }
        // step 63: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod41", 40, 10, 0);
        }
        // step 64: the 4th time
        if (n === 4) {
          q.send("qahs", "pod41", 20, 10, 0);
        }
        // step 65: the 5th time
        if (n === 5) {
          q.send("qad", "pod41", 10, 0, 1458, 2037, "");
          q.xp(5, "pod41");
          q.send("qspn", "pod41", "pod41__give_gem", 200, 42, 3, 15, "null", "null", "null");
          set(q, "pod41blok", 99, 0, 0);
        }
      },
      pod43(q) {
        const n = tally(q, "attacked pod43");
        // step 67: the 1st time
        if (n === 1) {
          q.send("qahs", "pod43", 80, 10, 0);
        }
        // step 68: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod43", 60, 10, 0);
        }
        // step 69: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod43", 40, 10, 0);
        }
        // step 70: the 4th time
        if (n === 4) {
          q.send("qahs", "pod43", 20, 10, 0);
        }
        // step 71: the 5th time
        if (n === 5) {
          q.send("qad", "pod43", 10, 0, 1894, 2233, "");
          q.xp(5, "pod43");
          q.send("qspn", "pod43", "pod43__give_gem", 200, 42, 3, 15, "null", "null", "null");
          set(q, "pod43blok", 99, 0, 0);
        }
      },
      pod42(q) {
        const n = tally(q, "attacked pod42");
        // step 72: the 1st time
        if (n === 1) {
          q.send("qahs", "pod42", 80, 10, 0);
        }
        // step 73: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod42", 60, 10, 0);
        }
        // step 74: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod42", 40, 10, 0);
        }
        // step 75: the 4th time
        if (n === 4) {
          q.send("qahs", "pod42", 20, 10, 0);
        }
        // step 76: the 5th time
        if (n === 5) {
          q.send("qad", "pod42", 10, 0, 1747, 2369, "");
          q.xp(5, "pod42");
          q.send("qspn", "pod42", "pod42__give_gem", 200, 42, 3, 15, "null", "null", "null");
          set(q, "pod42blok", 99, 0, 0);
        }
      },
      web08(q) {
        const n = tally(q, "attacked web08");
        // step 94: the 1st time
        if (n === 1) {
          q.send("qahs", "web08", 80, 10, 0);
        }
        // step 95: the 2nd time
        if (n === 2) {
          q.send("qahs", "web08", 60, 10, 0);
        }
        // step 96: the 3rd time
        if (n === 3) {
          q.send("qahs", "web08", 40, 10, 0);
        }
        // step 97: the 4th time
        if (n === 4) {
          q.send("qahs", "web08", 20, 10, 0);
        }
        // step 98: the 5th time
        if (n === 5) {
          q.send("qad", "web08", 10, 0, 5096, 2505, "");
          q.xp(5, "web08");
          set(q, "web08blok", 1, 0, 0);
          q.xp(2);
        }
      },
      pod22(q) {
        const n = tally(q, "attacked pod22");
        // step 100: the 1st time
        if (n === 1) {
          q.send("qahs", "pod22", 80, 10, 0);
        }
        // step 101: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod22", 60, 10, 0);
        }
        // step 102: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod22", 40, 10, 0);
        }
        // step 103: the 4th time
        if (n === 4) {
          q.send("qahs", "pod22", 20, 10, 0);
        }
        // step 104: the 5th time
        if (n === 5) {
          q.send("qad", "pod22", 10, 0, 5688, 3028, "");
          q.xp(5, "pod22");
          q.send("qspn", "pod22", "pod22__give_gem", 200, 42, 3, 5, "null", "null", "null");
          set(q, "pod22blok", 99, 0, 0);
        }
      },
      pod25(q) {
        const n = tally(q, "attacked pod25");
        // step 105: the 1st time
        if (n === 1) {
          q.after(270, () => {
            q.send("qahs", "pod25", 80, 10, 0);
          });
        }
        // step 106: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod25", 60, 10, 0);
          q.after(310, () => {
            q.send("qahs", "pod25", 40, 10, 0);
          });
        }
        // step 107: the 4th time
        if (n === 4) {
          q.send("qahs", "pod25", 20, 10, 0);
        }
        // step 108: the 5th time
        if (n === 5) {
          q.send("qad", "pod25", 10, 0, 5776, 2883, "");
          q.xp(5, "pod25");
          q.send("qspn", "pod25", "pod25__give_gem", 200, 42, 3, 15, "null", "null", "null");
          set(q, "pod25blok", 99, 0, 0);
        }
      },
      pod23(q) {
        const n = tally(q, "attacked pod23");
        // step 110: the 1st time
        if (n === 1) {
          q.send("qahs", "pod23", 80, 10, 0);
        }
        // step 111: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod23", 60, 10, 0);
        }
        // step 112: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod23", 40, 10, 0);
        }
        // step 113: the 4th time
        if (n === 4) {
          q.send("qahs", "pod23", 20, 10, 0);
        }
        // step 114: the 5th time
        if (n === 5) {
          q.send("qad", "pod23", 10, 0, 5730, 3174, "");
          q.xp(5, "pod23");
          q.send("qspn", "pod23", "pod23__give_gem", 200, 42, 3, 5, "null", "null", "null");
          set(q, "pod23blok", 99, 0, 0);
        }
      },
      pod26(q) {
        const n = tally(q, "attacked pod26");
        // step 118: the 1st time
        if (n === 1) {
          q.send("qahs", "pod26", 80, 10, 0);
        }
        // step 119: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod26", 60, 10, 0);
        }
        // step 120: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod26", 40, 10, 0);
        }
        // step 121: the 4th time
        if (n === 4) {
          q.send("qahs", "pod26", 20, 10, 0);
        }
        // step 122: the 5th time
        if (n === 5) {
          q.send("qad", "pod26", 10, 0, 5946, 2922, "");
          q.xp(5, "pod26");
          q.send("qspn", "pod26", "pod26__give_gem", 200, 42, 3, 5, "null", "null", "null");
          set(q, "pod26blok", 99, 0, 0);
        }
      },
      pod27(q) {
        // step 124
        q.send("qahs", "pod27", 80, 10, 0);
      },
      pod37(q) {
        const n = tally(q, "attacked pod37");
        // step 125: the 1st time
        if (n === 1) {
          q.send("qahs", "pod37", 80, 10, 0);
        }
        // step 126: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod37", 60, 10, 0);
        }
        // step 127: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod37", 40, 10, 0);
        }
        // step 128: the 4th time
        if (n === 4) {
          q.send("qahs", "pod37", 20, 10, 0);
        }
        // step 129: the 5th time
        if (n === 5) {
          q.send("qad", "pod37", 10, 0, 6416, 3112, "");
          q.xp(5, "pod37");
          q.send("qspn", "pod37", "pod37__give_gem", 200, 42, 3, 5, "null", "null", "null");
          set(q, "pod37blok", 99, 0, 0);
        }
      },
      pod38(q) {
        const n = tally(q, "attacked pod38");
        // step 130: the 1st time
        if (n === 1) {
          q.send("qahs", "pod38", 80, 10, 0);
        }
        // step 131: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod38", 60, 10, 0);
        }
        // step 132: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod38", 40, 10, 0);
        }
        // step 133: the 4th time
        if (n === 4) {
          q.send("qahs", "pod38", 20, 10, 0);
        }
        // step 134: the 5th time
        if (n === 5) {
          q.send("qad", "pod38", 10, 0, 6377, 3238, "");
          q.xp(5, "pod38");
          q.send("qspn", "pod38", "pod38__give_gem", 200, 42, 3, 10, "null", "null", "null");
          set(q, "pod38blok", 99, 0, 0);
        }
      },
      pod30(q) {
        const n = tally(q, "attacked pod30");
        // step 136: the 1st time
        if (n === 1) {
          q.send("qahs", "pod30", 80, 10, 0);
        }
        // step 137: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod30", 60, 10, 0);
        }
        // step 138: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod30", 40, 10, 0);
        }
        // step 139: the 4th time
        if (n === 4) {
          q.send("qahs", "pod30", 20, 10, 0);
        }
        // step 140: the 5th time
        if (n === 5) {
          q.send("qad", "pod30", 10, 0, 6429, 2976, "");
          q.xp(5, "pod30");
          q.send("qspn", "pod30", "pod30__give_gem", 200, 42, 3, 15, "null", "null", "null");
          set(q, "pod30blok", 99, 0, 0);
        }
      },
      pod33(q) {
        const n = tally(q, "attacked pod33");
        // step 141: the 1st time
        if (n === 1) {
          q.send("qahs", "pod33", 80, 10, 0);
        }
        // step 142: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod33", 60, 10, 0);
        }
        // step 143: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod33", 40, 10, 0);
        }
        // step 144: the 4th time
        if (n === 4) {
          q.send("qahs", "pod33", 20, 10, 0);
        }
        // step 145: the 5th time
        if (n === 5) {
          q.send("qad", "pod33", 10, 0, 6684, 2931, "");
          q.xp(5, "pod33");
          q.send("qspn", "pod33", "pod33__give_gem", 200, 42, 3, 10, "null", "null", "null");
          set(q, "pod33blok", 99, 0, 0);
        }
      },
      pod31(q) {
        const n = tally(q, "attacked pod31");
        // step 147: the 1st time
        if (n === 1) {
          q.send("qahs", "pod31", 80, 10, 0);
        }
        // step 148: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod31", 60, 10, 0);
        }
        // step 149: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod31", 40, 10, 0);
        }
        // step 150: the 4th time
        if (n === 4) {
          q.send("qahs", "pod31", 20, 10, 0);
        }
        // step 151: the 5th time
        if (n === 5) {
          q.send("qad", "pod31", 10, 0, 6830, 2873, "");
          q.xp(5, "pod31");
          q.send("qspn", "pod31", "pod31__give_gem", 200, 42, 3, 10, "null", "null", "null");
          set(q, "pod31blok", 99, 0, 0);
        }
      },
      pod32(q) {
        // step 155
        q.send("qahs", "pod32", 80, 10, 0);
      },
      pod39(q) {
        // step 156
        q.send("qahs", "pod39", 80, 10, 0);
      },
      pod16(q) {
        const n = tally(q, "attacked pod16");
        // step 157: the 1st time
        if (n === 1) {
          q.send("qahs", "pod16", 80, 10, 0);
        }
        // step 158: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod16", 60, 10, 0);
        }
        // step 159: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod16", 40, 10, 0);
        }
      },
      pod45(q) {
        // step 161
        q.send("qahs", "pod45", 80, 10, 0);
      },
      pod46(q) {
        const n = tally(q, "attacked pod46");
        // step 162: the 1st time
        if (n === 1) {
          q.send("qahs", "pod46", 80, 10, 0);
        }
        // step 163: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod46", 60, 10, 0);
        }
      },
      web01(q) {
        const n = tally(q, "attacked web01");
        // step 171: the 1st time
        if (n === 1) {
          q.send("qahs", "web01", 80, 10, 0);
        }
        // step 172: the 2nd time
        if (n === 2) {
          q.send("qahs", "web01", 60, 10, 0);
        }
        // step 173: the 3rd time
        if (n === 3) {
          q.send("qahs", "web01", 40, 10, 0);
        }
        // step 174: the 4th time
        if (n === 4) {
          q.send("qahs", "web01", 20, 10, 0);
        }
        // step 175: the 5th time
        if (n === 5) {
          q.send("qad", "web01", 10, 0, 4718, 4178, "");
          q.xp(5, "web01");
          set(q, "web01blok", 1, 0, 0);
          q.xp(2);
        }
      },
      pod11(q) {
        // step 176
        q.send("qahs", "pod11", 80, 10, 0);
      },
      pod18(q) {
        // step 182
        q.send("qahs", "pod18", 80, 10, 0);
      },
      pod47(q) {
        const n = tally(q, "attacked pod47");
        // step 185: the 1st time
        if (n === 1) {
          q.send("qahs", "pod47", 80, 10, 0);
        }
        // step 186: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod47", 60, 10, 0);
        }
        // step 187: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod47", 40, 10, 0);
        }
        // step 188: the 4th time
        if (n === 4) {
          q.send("qahs", "pod47", 20, 10, 0);
        }
        // step 189: the 5th time
        if (n === 5) {
          q.send("qad", "pod47", 10, 0, 6643, 5144, "");
          q.xp(5, "pod47");
          q.send("qspn", "pod47", "pod47__give_gem", 200, 42, 3, 15, "null", "null", "null");
          set(q, "pod47blok", 99, 0, 0);
        }
      },
      pod01(q) {
        const n = tally(q, "attacked pod01");
        // step 202: the 1st time
        if (n === 1) {
          q.send("qahs", "pod01", 80, 10, 0);
        }
        // step 203: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod01", 60, 10, 0);
        }
        // step 204: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod01", 40, 10, 0);
        }
        // step 205: the 4th time
        if (n === 4) {
          q.send("qahs", "pod01", 20, 10, 0);
        }
        // step 206: the 5th time
        if (n === 5) {
          q.send("qad", "pod01", 10, 0, 1727, 4128, "");
          q.xp(5, "pod01");
          q.send("qspn", "pod01", "pod01__give_gem", 200, 42, 3, 5, "null", "null", "null");
          set(q, "pod01blok", 99, 0, 0);
        }
      },
      pod44(q) {
        const n = tally(q, "attacked pod44");
        // step 207: the 1st time
        if (n === 1) {
          q.send("qahs", "pod44", 80, 10, 0);
        }
        // step 208: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod44", 60, 10, 0);
        }
        // step 209: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod44", 40, 10, 0);
        }
        // step 210: the 4th time
        if (n === 4) {
          q.send("qahs", "pod44", 20, 10, 0);
        }
        // step 211: the 5th time
        if (n === 5) {
          q.send("qad", "pod44", 10, 0, 1575, 4046, "");
          q.xp(5, "pod44");
          q.send("qspn", "pod44", "pod44__give_gem", 200, 42, 3, 15, "null", "null", "null");
          set(q, "pod44blok", 99, 0, 0);
        }
      },
      pod02(q) {
        // step 214: once
        if (once(q, "step214")) {
          q.send("qad", "pod02", 50, 1, 731, 4241, "");
          q.xp(5, "pod02");
          q.send("qspn", "pod02", "pod02__give_gem", 200, 42, 3, 5, "null", "null", "null");
          set(q, "pod02blok", 99, 0, 0);
        }
      },
      pod03(q) {
        // step 215
        q.send("qahs", "pod03", 80, 10, 0);
      },
      pod04(q) {
        const n = tally(q, "attacked pod04");
        // step 219: the 1st time
        if (n === 1) {
          q.send("qahs", "pod04", 80, 10, 0);
        }
        // step 220: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod04", 60, 10, 0);
        }
        // step 221: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod04", 40, 10, 0);
        }
        // step 222: the 8th time
        if (n === 8) {
          q.after(360, () => {
            q.send("qahs", "pod04", 20, 10, 0);
            q.send("qad", "pod04", 10, 0, 1900, 4844, "");
            q.xp(5, "pod04");
            q.send("qspn", "pod04", "pod04__give_gem", 200, 42, 3, 10, "null", "null", "null");
            set(q, "pod04blok", 99, 0, 0);
          });
        }
      },
      pod06(q) {
        const n = tally(q, "attacked pod06");
        // step 223: the 1st time
        if (n === 1) {
          q.send("qahs", "pod06", 80, 10, 0);
        }
        // step 224: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod06", 60, 10, 0);
        }
        // step 225: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod06", 40, 10, 0);
        }
        // step 226: the 6th time
        if (n === 6) {
          q.send("qahs", "pod06", 20, 10, 0);
          q.send("qad", "pod06", 10, 0, 1925, 4997, "");
          q.xp(5, "pod06");
          q.send("qspn", "pod06", "pod06__give_gem", 200, 42, 3, 10, "null", "null", "null");
          set(q, "pod06blok", 99, 0, 0);
          set(q, "seedpile01_t", 0, 1, 0);
          set(q, "seedpile01", 0, 1, 1);
          q.send("qcmdVT", 1, "seedtimer01", 0, 0, 0);
        }
      },
      pod08(q) {
        const n = tally(q, "attacked pod08");
        // step 237: the 1st time
        if (n === 1) {
          q.send("qahs", "pod08", 80, 10, 0);
        }
        // step 238: the 3rd time
        if (n === 3) {
          q.after(270, () => {
            q.send("qahs", "pod08", 60, 10, 0);
            q.after(190, () => {
              q.send("qahs", "pod08", 40, 10, 0);
            });
          });
        }
        // step 239: the 20th time
        if (n === 20) {
          q.send("qahs", "pod08", 20, 10, 0);
          q.send("qad", "pod08", 10, 0, 1390, 5571, "");
          q.xp(5, "pod08");
          q.send("qspn", "pod08", "pod08__give_gem", 200, 42, 3, 15, "null", "null", "null");
          set(q, "pod08blok", 99, 0, 0);
        }
      },
      pod09(q) {
        const n = tally(q, "attacked pod09");
        // step 243: the 1st time
        if (n === 1) {
          q.send("qahs", "pod09", 80, 10, 0);
        }
        // step 244: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod09", 60, 10, 0);
        }
        // step 245: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod09", 40, 10, 0);
        }
        // step 246: the 4th time
        if (n === 4) {
          q.send("qahs", "pod09", 20, 10, 0);
        }
        // step 247: the 5th time
        if (n === 5) {
          q.send("qad", "pod09", 10, 0, 929, 5444, "");
          q.xp(5, "pod09");
          q.send("qspn", "pod09", "pod09__give_gem", 200, 42, 3, 10, "null", "null", "null");
          set(q, "pod09blok", 99, 0, 0);
        }
      },
      pod10(q) {
        const n = tally(q, "attacked pod10");
        // step 254: the 1st time
        if (n === 1) {
          q.send("qahs", "pod10", 80, 10, 0);
        }
        // step 255: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod10", 60, 10, 0);
        }
        // step 256: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod10", 40, 10, 0);
        }
        // step 257: the 4th time
        if (n === 4) {
          q.send("qahs", "pod10", 20, 10, 0);
        }
        // step 258: the 5th time
        if (n === 5) {
          q.send("qad", "pod10", 10, 0, 207, 5048, "");
          q.xp(5, "pod10");
          q.send("qspn", "pod10", "pod10__give_gem", 200, 42, 3, 5, "null", "null", "null");
          set(q, "pod10blok", 99, 0, 0);
        }
      },
    },

    // a chest, opened
    opened: {
      treasure01(q) {
        if (!once(q, "opened treasure01")) {
          return;
        }
        q.gems(100);
        // step 12
        q.xp(5, "treasure01");
      },
      treasure02(q) {
        if (!once(q, "opened treasure02")) {
          return;
        }
        // item 249 (the official server put it in the player's things; this server does not yet)
        // step 51
        q.xp(5, "treasure02");
      },
      treasure02_h(q) {
        if (!once(q, "opened treasure02_h")) {
          return;
        }
        q.gems(50);
      },
      treasure03(q) {
        if (!once(q, "opened treasure03")) {
          return;
        }
        q.gems(50);
      },
      treasure04(q) {
        if (!once(q, "opened treasure04")) {
          return;
        }
        q.gems(200);
        // step 234
        q.after(380, () => {
          q.xp(5, "treasure04");
        });
      },
      treasure05(q) {
        if (!once(q, "opened treasure05")) {
          return;
        }
        q.gems(150);
        // step 117
        q.xp(5, "treasure05");
      },
      treasure06(q) {
        if (!once(q, "opened treasure06")) {
          return;
        }
        q.gems(50);
      },
    },

    // a plant ate a phantom: [actor, 50, 1, x, y, ""] has it die there
    eaten(q, plant, phantom, x, y) {
      // boss1a is a boss: it takes 8 hits, each doing what that hit did in the recording
      if (phantom === "boss1a") {
        const n = tally(q, "hit boss1a");
        // step 298: hit 1
        if (n === 1) {
          q.send("qepr", `${phantom}`);
          q.send("qahs", `${phantom}`, 87, 100, 0);
        }
        // step 299: hit 2
        if (n === 2) {
          q.send("qepr", `${phantom}`);
          set(q, `${phantom}`, 2, 1, 1);
          q.send("qswfs", `${phantom}`, "agro");
          set(q, `${phantom}`, 4, 1, 1);
          q.send("qahs", `${phantom}`, 75, 100, 0);
          q.after(1490, () => {
            q.send("qcmdVT", 1, "spawner1", bump(q, "spawner1"), 0, 0); // one more than last time
            q.send("qswfs", "kphant1__1a", "appear");
            q.send("qsp", "kphant1__1a", "bpath1a");
            set(q, "kphant1__1a", 1, 1, 1);
            q.send("qswfs", "kphant1__2a", "appear");
            q.send("qsp", "kphant1__2a", "bpath1c");
            set(q, "kphant1__2a", 1, 1, 1);
            q.send("qswfs", "kphant1__1a", "appear");
            q.send("qsp", "kphant1__1a", "bpath1a");
            set(q, "kphant1__1a", 1, 1, 1);
            q.send("qswfs", "kphant1__2a", "appear");
            q.send("qsp", "kphant1__2a", "bpath1c");
            set(q, "kphant1__2a", 1, 1, 1);
            q.send("qsnd", "ajq_phantomminispawn");
            q.send("qcmdVT", 1, "spawntimer1a", 0, 0, 0);
          });
        }
        // step 300: hit 3
        if (n === 3) {
          q.send("qepr", `${phantom}`);
          q.send("qahs", `${phantom}`, 62, 100, 0);
        }
        // step 301: hit 4
        if (n === 4) {
          q.send("qepr", `${phantom}`);
          set(q, `${phantom}`, 5, 1, 1);
          q.send("qswfs", `${phantom}`, "agro");
          set(q, `${phantom}`, 7, 1, 1);
          q.send("qahs", `${phantom}`, 50, 100, 0);
          q.after(1650, () => {
            q.send("qcmdVT", 1, "spawner1", bump(q, "spawner1"), 0, 0); // one more than last time
            q.send("qswfs", "kphant1__1b", "appear");
            q.send("qsp", "kphant1__1b", "bpath1a");
            set(q, "kphant1__1b", 1, 1, 1);
            q.send("qswfs", "kphant1__2b", "appear");
            q.send("qsp", "kphant1__2b", "bpath1c");
            set(q, "kphant1__2b", 1, 1, 1);
            q.send("qswfs", "kphant1__1b", "appear");
            q.send("qsp", "kphant1__1b", "bpath1a");
            set(q, "kphant1__1b", 1, 1, 1);
            q.send("qswfs", "kphant1__2b", "appear");
            q.send("qsp", "kphant1__2b", "bpath1c");
            set(q, "kphant1__2b", 1, 1, 1);
            q.send("qsnd", "ajq_phantomminispawn");
            q.send("qcmdVT", 1, "spawntimer1a", 0, 0, 0);
          });
        }
        // step 302: hit 5
        if (n === 5) {
          q.send("qepr", `${phantom}`);
          q.send("qahs", `${phantom}`, 37, 100, 0);
        }
        // step 303: hit 6
        if (n === 6) {
          q.send("qepr", `${phantom}`);
          set(q, `${phantom}`, 8, 1, 1);
          q.send("qsp", `${phantom}`, "bpath_last");
          set(q, `${phantom}`, 9, 1, 1);
          q.send("qswfs", `${phantom}`, "agro");
          set(q, `${phantom}`, 10, 1, 1);
          q.send("qahs", `${phantom}`, 25, 100, 0);
          q.after(1330, () => {
            q.send("qcmdVT", 1, "spawner1", bump(q, "spawner1"), 0, 0); // one more than last time
            q.send("qswfs", "kphant1__1c", "appear");
            q.send("qsp", "kphant1__1c", "bpath1a");
            set(q, "kphant1__1c", 1, 1, 1);
            q.send("qswfs", "kphant1__2c", "appear");
            q.send("qsp", "kphant1__2c", "bpath1b");
            set(q, "kphant1__2c", 1, 1, 1);
            q.send("qswfs", variant(q, "kphant1__3", "", "abcd"), "appear");
            q.send("qsp", variant(q, "kphant1__3", "", "abcd"), "bpath1c");
            set(q, variant(q, "kphant1__3", "", "abcd"), 1, 1, 1);
            q.send("qswfs", "kphant1__1c", "appear");
            q.send("qsp", "kphant1__1c", "bpath1a");
            set(q, "kphant1__1c", 1, 1, 1);
            q.send("qswfs", "kphant1__2c", "appear");
            q.send("qsp", "kphant1__2c", "bpath1b");
            set(q, "kphant1__2c", 1, 1, 1);
            q.send("qswfs", variant(q, "kphant1__3", "", "abcd"), "appear");
            q.send("qsp", variant(q, "kphant1__3", "", "abcd"), "bpath1c");
            set(q, variant(q, "kphant1__3", "", "abcd"), 1, 1, 1);
            q.send("qsnd", "ajq_phantomminispawn");
            q.send("qcmdVT", 1, "spawntimer1a", 0, 0, 0);
          });
        }
        // step 304: hit 7
        if (n === 7) {
          q.send("qepr", `${phantom}`);
          q.send("qahs", `${phantom}`, 12, 100, 0);
        }
        // step 305: hit 8 (it dies)
        if (n === 8) {
          q.send("qad", phantom, 100, 1, x, y, "");
          q.send("qcmdVT", 1, "dedboss", bump(q, "dedboss"), 0, 0); // one more than last time
          q.send("qcmdVT", 1, "80_uri", 1, 0, 0);
          q.send("qposturi", "/adventure7-thesearchforgreely/#80-defeatedsecondboss/#0#001");
          q.send("qcmdVT", 1, "80_uri", 99, 0, 0);
          q.send("qswfs", "kphant1__1a", "disappear");
          set(q, "kphant1__1a", 98, 1, 0);
          q.send("qswfs", "kphant1__2a", "disappear");
          set(q, "kphant1__2a", 98, 1, 0);
          q.send("qswfs", "kphant1__1b", "disappear");
          set(q, "kphant1__1b", 98, 1, 0);
          q.send("qswfs", "kphant1__2b", "disappear");
          set(q, "kphant1__2b", 98, 1, 0);
          q.send("qswfs", "kphant1__1c", "disappear");
          set(q, "kphant1__1c", 98, 1, 0);
          q.send("qswfs", "kphant1__2c", "disappear");
          set(q, "kphant1__2c", 98, 1, 0);
          q.send("qswfs", variant(q, "kphant1__3", "", "abcd"), "disappear");
          for (const other of V_OTHERS(q, "kphant1__3", "", "abcd")) {
            set(q, other, 98, 1, 0);
          }
          q.send("qswfs", "kphant2__1a", "disappear");
          set(q, "kphant2__1a", 98, 1, 0);
          q.send("qswfs", "kphant2__2a", "disappear");
          set(q, "kphant2__2a", 98, 1, 0);
          q.send("qswfs", "kphant2__1b", "disappear");
          set(q, "kphant2__1b", 98, 1, 0);
          q.send("qswfs", "kphant2__1c", "disappear");
          set(q, "kphant2__1c", 98, 1, 0);
          q.send("qswfs", "kphant2__2c", "disappear");
          set(q, "kphant2__2c", 98, 1, 0);
          q.send("qswfs", variant(q, "kphant2__3", "", "abcd"), "disappear");
          for (const other of V_OTHERS(q, "kphant2__3", "", "abcd")) {
            set(q, other, 98, 1, 0);
          }
          set(q, "bseedpile5", 99, 0, 0);
          set(q, "bseedpile5t", 1, 1, 0);
          q.xp(200, `${phantom}`);
          q.after(1240, () => {
            set(q, "alarmlights", 1, 1, 0);
            set(q, "alarmloop1", 0, 0, 0);
            set(q, "alarmloop2", 0, 0, 0);
            set(q, "alarmloop3", 0, 0, 0);
            set(q, "alarmloop4", 0, 0, 0);
            set(q, "key_final", 0, 1, 1);
            set(q, "lock_final", 1, 1, 1);
            q.send("qicon", "keyfinalicon", 1);
            q.send("qmusic", 0);
            q.send("qmusic", "ajq_musphntmcreepy");
            q.send("qcmd", 38, 15958);
            q.send("qcmdVT", 1, "kphant_off", 99, 0, 0);
            set(q, "kphant1__1a", 99, 0, 0);
            set(q, "kphant1__2a", 99, 0, 0);
            for (const other of V_OTHERS(q, "kphant1__3", "", "abcd")) {
              set(q, other, 99, 0, 0);
            }
            set(q, "kphant1__4a", 99, 0, 0);
            set(q, "kphant1__1b", 99, 0, 0);
            set(q, "kphant1__2b", 99, 0, 0);
            set(q, "kphant1__4b", 99, 0, 0);
            set(q, "kphant1__1c", 99, 0, 0);
            set(q, "kphant1__2c", 99, 0, 0);
            set(q, "kphant1__4c", 99, 0, 0);
            set(q, "kphant1__5c", 99, 0, 0);
            set(q, "kphant1__6c", 99, 0, 0);
            set(q, "kphant1__1d", 99, 0, 0);
            set(q, "kphant1__2d", 99, 0, 0);
            set(q, "kphant1__4d", 99, 0, 0);
            set(q, "kphant1__5d", 99, 0, 0);
            set(q, "kphant1__6d", 99, 0, 0);
            set(q, "kphant2__1a", 99, 0, 0);
            set(q, "kphant2__2a", 99, 0, 0);
            for (const other of V_OTHERS(q, "kphant2__3", "", "abcd")) {
              set(q, other, 99, 0, 0);
            }
            set(q, "kphant2__4a", 99, 0, 0);
            set(q, "kphant2__1b", 99, 0, 0);
            set(q, "kphant2__2b", 99, 0, 0);
            set(q, "kphant2__4b", 99, 0, 0);
            set(q, "kphant2__1c", 99, 0, 0);
            set(q, "kphant2__2c", 99, 0, 0);
            set(q, "kphant2__4c", 99, 0, 0);
            set(q, "kphant2__5c", 99, 0, 0);
            set(q, "kphant2__6c", 99, 0, 0);
            set(q, "kphant2__1d", 99, 0, 0);
            set(q, "kphant2__2d", 99, 0, 0);
            set(q, "kphant2__4d", 99, 0, 0);
            set(q, "kphant2__5d", 99, 0, 0);
            set(q, "kphant2__6d", 99, 0, 0);
            set(q, "kphant1__1a", 99, 0, 0);
            set(q, "kphant1__2a", 99, 0, 0);
            set(q, "kphant1__4a", 99, 0, 0);
            set(q, "kphant1__1b", 99, 0, 0);
            set(q, "kphant1__2b", 99, 0, 0);
            set(q, "kphant1__4b", 99, 0, 0);
            set(q, "kphant1__1c", 99, 0, 0);
            set(q, "kphant1__2c", 99, 0, 0);
            set(q, "kphant1__4c", 99, 0, 0);
            set(q, "kphant1__5c", 99, 0, 0);
            set(q, "kphant1__6c", 99, 0, 0);
            set(q, "kphant1__1d", 99, 0, 0);
            set(q, "kphant1__2d", 99, 0, 0);
            set(q, "kphant1__4d", 99, 0, 0);
            set(q, "kphant1__5d", 99, 0, 0);
            set(q, "kphant1__6d", 99, 0, 0);
            set(q, "kphant2__1a", 99, 0, 0);
            set(q, "kphant2__2a", 99, 0, 0);
            set(q, "kphant2__4a", 99, 0, 0);
            set(q, "kphant2__1b", 99, 0, 0);
            set(q, "kphant2__2b", 99, 0, 0);
            set(q, "kphant2__4b", 99, 0, 0);
            set(q, "kphant2__1c", 99, 0, 0);
            set(q, "kphant2__2c", 99, 0, 0);
            set(q, "kphant2__4c", 99, 0, 0);
            set(q, "kphant2__5c", 99, 0, 0);
            set(q, "kphant2__6c", 99, 0, 0);
            set(q, "kphant2__1d", 99, 0, 0);
            set(q, "kphant2__2d", 99, 0, 0);
            set(q, "kphant2__4d", 99, 0, 0);
            set(q, "kphant2__5d", 99, 0, 0);
            set(q, "kphant2__6d", 99, 0, 0);
          });
        }
        return;
      }
      // boss1b is a boss: it takes 8 hits, each doing what that hit did in the recording
      if (phantom === "boss1b") {
        const n = tally(q, "hit boss1b");
        // step 306: hit 1
        if (n === 1) {
          q.send("qepr", `${phantom}`);
          q.send("qahs", `${phantom}`, 87, 100, 0);
        }
        // step 307: hit 2
        if (n === 2) {
          q.send("qepr", `${phantom}`);
          set(q, `${phantom}`, 2, 1, 1);
          q.send("qswfs", `${phantom}`, "agro");
          set(q, `${phantom}`, 4, 1, 1);
          q.send("qahs", `${phantom}`, 75, 100, 0);
          q.after(1450, () => {
            q.send("qcmdVT", 1, "spawner2", bump(q, "spawner2"), 0, 0); // one more than last time
            q.send("qswfs", "kphant2__1a", "appear");
            q.send("qsp", "kphant2__1a", "bpath2a");
            set(q, "kphant2__1a", 1, 1, 1);
            q.send("qswfs", "kphant2__2a", "appear");
            q.send("qsp", "kphant2__2a", "bpath2c");
            set(q, "kphant2__2a", 1, 1, 1);
            q.send("qswfs", "kphant2__1a", "appear");
            q.send("qsp", "kphant2__1a", "bpath2a");
            set(q, "kphant2__1a", 1, 1, 1);
            q.send("qswfs", "kphant2__2a", "appear");
            q.send("qsp", "kphant2__2a", "bpath2c");
            set(q, "kphant2__2a", 1, 1, 1);
            q.send("qsnd", "ajq_phantomminispawn");
            q.send("qcmdVT", 1, "spawntimer1b", 0, 0, 0);
          });
        }
        // step 308: hit 3
        if (n === 3) {
          q.send("qepr", `${phantom}`);
          q.send("qahs", `${phantom}`, 62, 100, 0);
        }
        // step 309: hit 4
        if (n === 4) {
          q.send("qepr", `${phantom}`);
          set(q, `${phantom}`, 5, 1, 1);
          q.send("qswfs", `${phantom}`, "agro");
          set(q, `${phantom}`, 7, 1, 1);
          q.send("qahs", `${phantom}`, 50, 100, 0);
          q.after(1210, () => {
            q.send("qcmdVT", 1, "spawner2", bump(q, "spawner2"), 0, 0); // one more than last time
            q.send("qswfs", "kphant2__1b", "appear");
            q.send("qsp", "kphant2__1b", "bpath2a");
            set(q, "kphant2__1b", 1, 1, 1);
            q.send("qswfs", "kphant2__2b", "appear");
            q.send("qsp", "kphant2__2b", "bpath2c");
            set(q, "kphant2__2b", 1, 1, 1);
            q.send("qswfs", "kphant2__1b", "appear");
            q.send("qsp", "kphant2__1b", "bpath2a");
            set(q, "kphant2__1b", 1, 1, 1);
            q.send("qswfs", "kphant2__2b", "appear");
            q.send("qsp", "kphant2__2b", "bpath2c");
            set(q, "kphant2__2b", 1, 1, 1);
            q.send("qsnd", "ajq_phantomminispawn");
            q.send("qcmdVT", 1, "spawntimer1b", 0, 0, 0);
            q.after(1000, () => {
              q.send("qcmdVT", 1, "seeddelay", 0, 0, 0);
            });
          });
        }
        // step 310: hit 5
        if (n === 5) {
          q.send("qepr", `${phantom}`);
          q.send("qahs", `${phantom}`, 37, 100, 0);
        }
        // step 311: hit 6
        if (n === 6) {
          q.send("qepr", `${phantom}`);
          set(q, `${phantom}`, 8, 1, 1);
          q.send("qswfs", `${phantom}`, "agro");
          set(q, `${phantom}`, 10, 1, 1);
          q.send("qahs", `${phantom}`, 25, 100, 0);
          q.after(1170, () => {
            q.send("qcmdVT", 1, "spawner2", bump(q, "spawner2"), 0, 0); // one more than last time
            q.send("qswfs", "kphant2__1c", "appear");
            q.send("qsp", "kphant2__1c", "bpath2a");
            set(q, "kphant2__1c", 1, 1, 1);
            q.send("qswfs", "kphant2__2c", "appear");
            q.send("qsp", "kphant2__2c", "bpath2b");
            set(q, "kphant2__2c", 1, 1, 1);
            q.send("qswfs", variant(q, "kphant2__3", "", "abcd"), "appear");
            q.send("qsp", variant(q, "kphant2__3", "", "abcd"), "bpath2c");
            set(q, variant(q, "kphant2__3", "", "abcd"), 1, 1, 1);
            q.send("qswfs", "kphant2__1c", "appear");
            q.send("qsp", "kphant2__1c", "bpath2a");
            set(q, "kphant2__1c", 1, 1, 1);
            q.send("qswfs", "kphant2__2c", "appear");
            q.send("qsp", "kphant2__2c", "bpath2b");
            set(q, "kphant2__2c", 1, 1, 1);
            q.send("qswfs", variant(q, "kphant2__3", "", "abcd"), "appear");
            q.send("qsp", variant(q, "kphant2__3", "", "abcd"), "bpath2c");
            set(q, variant(q, "kphant2__3", "", "abcd"), 1, 1, 1);
            q.send("qsnd", "ajq_phantomminispawn");
            q.send("qcmdVT", 1, "spawntimer1b", 0, 0, 0);
          });
        }
        // step 312: hit 7
        if (n === 7) {
          q.send("qepr", `${phantom}`);
          q.send("qahs", `${phantom}`, 12, 100, 0);
        }
        // step 313: hit 8 (it dies)
        if (n === 8) {
          q.send("qad", phantom, 100, 1, x, y, "");
          q.send("qcmdVT", 1, "dedboss", bump(q, "dedboss"), 0, 0); // one more than last time
          q.send("qcmdVT", 1, "70_uri", 1, 0, 0);
          q.send("qposturi", "/adventure7-thesearchforgreely/#70-defeatedfirstboss/#0#001");
          q.send("qcmdVT", 1, "70_uri", 99, 0, 0);
          q.xp(200, `${phantom}`);
        }
        return;
      }
      if (!once(q, "eaten " + phantom)) {
        return;
      }
      const how = {"factory04":[1,1],"factory05":[1,1],"pod16":[20,1],"factory06":[1,1],"factory07":[1,1],"pod11":[40,1],"pod18":[40,1],"factory03":[1,1],"boss1b":[100,1],"boss1a":[100,1]}; // how these die (phantoms: 50, 1)
      q.send("qad", phantom, (how[phantom] || [50, 1])[0], (how[phantom] || [50, 1])[1], x, y, "");
      spawned(q, phantom); // a factory destroyed, or one of its phantoms gone
      // step 314: every factory#__#_
      if (/^(?:factory\d+[a-z]?__\d+[a-z]?_)$/.test(phantom)) {
        q.send("qspn", `${phantom}`, `${phantom}__give_d`, 200, 42, 3, 25, "null", "null", "null");
      }
      // step 315: every factory#
      if (/^(?:factory\d+[a-z]?)$/.test(phantom)) {
        q.xp(5, `${phantom}`);
      }
      // step 316: every phantom#
      if (/^(?:phantom\d+[a-z]?)$/.test(phantom)) {
        q.send("qspn", `${phantom}`, `${phantom}__give_gem`, 200, 42, 3, 25, "null", "null", "null");
        q.xp(5, `${phantom}`);
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 317: every pod#
      if (/^(?:pod\d+[a-z]?)$/.test(phantom)) {
        q.xp(5, `${phantom}`);
        set(q, `${phantom}blok`, 99, 0, 0);
      }
      // step 318: every pod#, every one but pod16, pod12, pod18
      if (/^(?:pod\d+[a-z]?)$/.test(phantom) && !["pod16","pod12","pod18"].includes(phantom)) {
        q.send("qspn", `${phantom}`, `${phantom}__give_gem`, 200, 42, 3, 15, "null", "null", "null");
      }
      // step 319: every phantom__#
      if (/^(?:phantom__\d+[a-z]?)$/.test(phantom)) {
        q.send("qspn", `${phantom}`, `${phantom}__give_gem`, 200, 42, 3, 25, "null", "null", "null");
        q.xp(5, `${phantom}`);
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 320: when it is factory04
      if (phantom === "factory04") {
        set(q, "fact04blok", 99, 0, 0);
      }
      // step 321: when it is factory05
      if (phantom === "factory05") {
        set(q, "fact05blok", 99, 0, 0);
      }
      // step 322: when it is pod16
      if (phantom === "pod16") {
        q.send("qspn", `${phantom}`, `${phantom}__give_gem`, 200, 42, 3, 10, "null", "null", "null");
      }
      // step 323: when it is factory06
      if (phantom === "factory06") {
        set(q, "fact06blok", 99, 0, 0);
      }
      // step 324: when it is factory07
      if (phantom === "factory07") {
        set(q, "fact07blok", 99, 0, 0);
      }
      // step 325: when it is pod12
      if (phantom === "pod12") {
        q.send("qspn", `${phantom}`, `${phantom}__give_gem`, 200, 42, 3, 5, "null", "null", "null");
      }
      // step 326: when it is pod18
      if (phantom === "pod18") {
        q.send("qspn", `${phantom}`, `${phantom}__give_gem`, 200, 42, 3, 10, "null", "null", "null");
      }
      // step 327: when it is web03
      if (phantom === "web03") {
        q.xp(5, `${phantom}`);
        set(q, `${phantom}blok`, 1, 0, 0);
      }
      // step 328: when it is factory03__2_
      if (phantom === "factory03__2_") {
        q.xp(5, `${phantom}`);
        set(q, "fact03blok", 99, 0, 0);
      }
      // step 329: when it is kphant2__2b
      if (phantom === "kphant2__2b") {
        q.send("qspn", `${phantom}`, `${phantom}__give_gem`, 200, 42, 3, 25, "null", "null", "null");
        q.xp(5, `${phantom}`);
        set(q, `${phantom}`, 3, 1, 0);
      }
    },

    // a seed planted (the server has grown the plant: [plant, seed, x, y])
    planted(q, plant, seed, x, y) {
      const n = tally(q, "planted");
      // step 84: the 2nd time
      if (n === 2) {
        set(q, "seedpile03_t", 0, 1, 0);
        set(q, "seedpile03", 0, 1, 1);
        q.send("qcmdVT", 1, "seedtimer03", 0, 0, 0);
      }
      // step 85: the 22nd time
      if (n === 22) {
        q.after(870, () => {
          q.send("qseed", 137, 1, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
        });
      }
      // step 86: the 49th time
      if (n === 49) {
        q.after(850, () => {
          q.send("qseed", 137, 1, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
        });
      }
      // step 87: the 114th time
      if (n === 114) {
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
      }
      // step 88: the 120th time
      if (n === 120) {
        q.after(2270, () => {
          q.send("qseed", 137, 0, 3);
        });
      }
      // step 89: the 142nd time
      if (n === 142) {
        q.send("qseed", 137, 1, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.after(530, () => {
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
        });
      }
      // step 90: the 144th time
      if (n === 144) {
        q.after(500, () => {
          q.send("qseed", 137, 1, 3);
        });
      }
      // step 91: the 191st time
      if (n === 191) {
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
        q.send("qseed", 137, 0, 3);
      }
      // step 92: the 224th time
      if (n === 224) {
        q.after(700, () => {
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
        });
      }
    },

    // a cutscene played to its end (the client answers "qplayswf"; adventures.js needs
    // a handler that runs this, see the maker)
    cutsceneDone(q) {
      // step 262
      set(q, "all2boss", 99, 0, 0);
      set(q, "all2boss1", 99, 0, 0);
      q.send("qsp", "boss1a", "bpath1");
      set(q, "boss1a", 1, 1, 1);
      q.send("qsp", "boss1b", "bpath2");
      set(q, "boss1b", 1, 1, 1);
      set(q, "boss_off", 99, 0, 0);
      set(q, "boss_on", 1, 1, 0);
      set(q, "cp1", 99, 0, 0);
      set(q, "cp2", 99, 0, 0);
      set(q, "cp3", 99, 0, 0);
      set(q, "chqpoint01lp", 99, 0, 0);
      set(q, "chqpoint02lp", 99, 0, 0);
      set(q, "chqpoint03lp", 99, 0, 0);
      set(q, "boss_block", 1, 1, 0);
      set(q, "boss_block1", 1, 1, 0);
      set(q, "bossblokvol1", 0, 1, 0);
      set(q, "bossblokvol2", 0, 1, 0);
      set(q, "bossblokvol3", 0, 1, 0);
      set(q, "bossblokvol4", 0, 1, 0);
      set(q, "bseedpile1", 0, 1, 1);
      set(q, "bseedpile2", 0, 1, 1);
      set(q, "bseedpile3", 0, 1, 1);
      set(q, "bseedpile4", 0, 1, 1);
      set(q, "bseedpile5", 0, 1, 1);
      set(q, "bseedpile6", 0, 1, 1);
      set(q, "bseedpile1t", 0, 1, 0);
      set(q, "bseedpile2t", 0, 1, 0);
      set(q, "bseedpile3t", 0, 1, 0);
      set(q, "bseedpile4t", 0, 1, 0);
      set(q, "bseedpile5t", 0, 1, 0);
      set(q, "bseedpile6t", 0, 1, 0);
      set(q, "seedpile02", 99, 0, 0);
      set(q, "seedpile02_t", 1, 1, 0);
      set(q, "alarmloop1", 1, 1, 0);
      set(q, "alarmloop2", 1, 1, 0);
      set(q, "alarmloop3", 1, 1, 0);
      set(q, "alarmloop4", 1, 1, 0);
      q.send("qcmd", 38, 15850);
      q.send("qmusic", "ajq_mus2phntmkings");
    },
  },
};

/* adventure-script-maker
{"defId":22,"title":"The Search for Greely","rooms":[{"key":"start","room":"adventures.room_adventure_7a","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_mussearch4greelylp"},{"key":"in_7b","room":"adventures.room_adventure_7b","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_musphntmcreepy","arrive":"in_7b"}],"objective":15817,"actors":[{"name":"randomtask","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"players","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"2changer","type":9,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"in_7b","type":9,"def":1,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"startdelay","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"graham01_go","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"graham01","type":1,"def":23,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"graham01hide","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"graham02_go","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"graham02wait","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"graham02","type":1,"def":23,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"graham02hide","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"graham03_go","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"graham03","type":1,"def":23,"state":0,"visible":1,"click":1,"path":"","art":"facesw"},{"name":"graham04","type":1,"def":23,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"graham04x","type":1,"def":23,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"greely01","type":1,"def":22,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"greely01hide","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"greely02","type":1,"def":22,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"greely02x","type":1,"def":22,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"liza01","type":1,"def":21,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"liza01x","type":1,"def":21,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cosmo01","type":1,"def":25,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cosmo01x","type":1,"def":25,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"greelyitem01","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"greelyitem02","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"greelyitem03","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"changer","type":1,"def":180,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"torchlight","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"givetorch","type":1,"def":134,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"brazier01","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridgewait1","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"l_brazier01","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"wheel01","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"wheel02","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"wheel03","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"beacondelay","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"portaldelay","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_count","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"alpha_stone","type":15,"def":2651,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"portal01","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"portal01once","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"checkpuzzle","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"greely02wait","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puzzledoor","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"wheeltile1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"wheeltile2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"wheeltile3","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"den_block","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"torch","type":17,"def":2045,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatarpad1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatarpad2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatardoor1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatardoor2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"easy","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"hard","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier01","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_bridge01","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"phantomdoor","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"phantompad","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile01_t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile02_t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile03_t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile04_t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile05_t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile06_t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile07_t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile15_t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch01_t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch02_t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch02_th","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch03_t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch03_th","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch04_t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch05_t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch05_th","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"hardblock","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridgeblok01","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry01blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry02blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry03blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry04blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry05blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry06blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry07blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry08blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry09blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry10blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry11blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry12blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry13blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry14blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry15blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry16blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry17blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry18blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry19blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry20blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry21blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry22blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry23blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry24blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry25blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry27blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry28blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry29blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry30blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod01blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod02blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod03blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod04blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod05blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod06blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod07blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod08blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod09blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod10blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod11blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod12blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod13blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod15blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod16blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod17blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod18blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod19blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod20blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod21blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod22blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod23blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod24blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod25blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod26blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod27blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod28blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod29blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod30blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod31blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod32blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod33blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod35blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod36blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod37blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod38blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod39blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod40blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod41blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod42blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod43blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod44blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod45blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod46blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod47blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod48blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod49blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod50blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod51blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod52blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod53blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod54blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod55blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod56blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod57blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod58blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod59blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod60blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod61blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod62blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod63blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod64blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod65blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod66blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod67blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod68blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod69blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod70blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod71blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web01blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web03blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web04blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web08blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"phantomblok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatarblock1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatarblock2","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"braziercount","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"hint01","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"npc01","type":1,"def":163,"state":0,"visible":1,"click":1,"path":"","art":"idle"},{"name":"npc01wait","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"npc02","type":1,"def":106,"state":0,"visible":1,"click":1,"path":"","art":"facesw"},{"name":"hint02","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"npc03","type":1,"def":161,"state":0,"visible":1,"click":1,"path":"","art":"idle"},{"name":"npc03wait","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"npc04","type":1,"def":107,"state":0,"visible":1,"click":1,"path":"","art":"facesw"},{"name":"hint03","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"npc05","type":1,"def":164,"state":0,"visible":1,"click":1,"path":"","art":"idle"},{"name":"npc05wait","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"npc06","type":1,"def":108,"state":0,"visible":1,"click":1,"path":"","art":"facesw"},{"name":"treasure01","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":100,"chestKind":3},{"name":"treasure02","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":249,"chestKind":2,"chestItem":"-8257707"},{"name":"treasure02_h","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"treasure03","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"treasure04","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":200,"chestKind":3,"chestItem":"-8257707"},{"name":"treasure05","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":150,"chestKind":3,"chestItem":"-8257707"},{"name":"treasure06","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"next_room","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"aseedpile01","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"aseedpile02","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"aseedpile02h","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"aseedpile03","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"aseedpile03h","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"aseedpile04","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"aseedpile04h","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile01","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile02","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile03","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile04","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile05","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile06","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile07","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile15","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedtimer01","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedtimer02","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedtimer03","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedtimer04","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedtimer05","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedtimer06","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedtimer07","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedtimer15","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"sentry01","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry02","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry03","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry04","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry05","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry06","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry07","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry08","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry09","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry10","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry11","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry12","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry13","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry14","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry15","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry16","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry17","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry18","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry19","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry20","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry21","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry22","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry23","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry24","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry25","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry27","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry28","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry29","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry30","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry01_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry02_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry03_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry04_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry05_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry06_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry07_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry08_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry09_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry10_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry11_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry12_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry13_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry14_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry15_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry16_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry17_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry18_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry19_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry20_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry21_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry22_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry23_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry24_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry25_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry27_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry28_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry29_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry30_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch01","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switchwait01","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"switch02","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switchwait02","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"switch02h","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"swichwait02h","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"switch03","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switchwait03","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"switch03h","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"swichwait03h","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"switch04","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switchwait04","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"switch05","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switchwait05","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"switch05h","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"swichwait05h","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom__01","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path01","art":""},{"name":"phantom__02","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path01","art":""},{"name":"phantom__03","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path01","art":""},{"name":"phantom__04","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path01","art":""},{"name":"phantom05","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path05","art":""},{"name":"phantom06","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path06","art":""},{"name":"phantom07","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path07","art":""},{"name":"phantom08","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path08","art":""},{"name":"phantom09","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path09","art":""},{"name":"phantom10","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path10","art":""},{"name":"phantom11","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path11","art":""},{"name":"phantom12","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path12","art":""},{"name":"phantom13","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path13","art":""},{"name":"phantom14","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path14","art":""},{"name":"phantom15","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path15","art":""},{"name":"phantom16","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path16","art":""},{"name":"phantom17","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path17","art":""},{"name":"phantom18","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path18","art":""},{"name":"phantom19","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path19","art":""},{"name":"phantom__20","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path20","art":""},{"name":"phantom__21","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path20","art":""},{"name":"phantom__22","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path20","art":""},{"name":"phantom__23","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path20","art":""},{"name":"phantom24","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path24","art":""},{"name":"phantom25","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path25","art":""},{"name":"phantom26","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path26","art":""},{"name":"phantom27","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path27","art":""},{"name":"phantom28","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path28","art":""},{"name":"phantom__29","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path29","art":""},{"name":"phantom__30","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path29","art":""},{"name":"phantom__31","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path29","art":""},{"name":"phantom__32","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path29","art":""},{"name":"path01","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path05","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path06","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path07","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path08","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path09","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path10","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path11","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path12","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path13","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path14","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path15","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path16","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path17","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path18","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path19","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path20","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path24","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path25","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path26","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path27","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path28","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path29","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bpath1","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bpath2","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bpath_last","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bpath1a","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bpath1b","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bpath1c","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bpath2a","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bpath2b","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bpath2c","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factory01","type":12,"def":149,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"factory02","type":12,"def":149,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"factory03","type":12,"def":149,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"factory04","type":12,"def":149,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"factory05","type":12,"def":149,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"factory06","type":12,"def":149,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"factory07","type":12,"def":149,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"factory08","type":12,"def":149,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"factory09","type":12,"def":149,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"factory11","type":12,"def":149,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"factory12","type":12,"def":149,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"factory13","type":12,"def":149,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"factory14","type":12,"def":149,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"fact01blok","type":14,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"fact02blok","type":14,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"fact03blok","type":14,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"fact04blok","type":14,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"fact05blok","type":14,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"fact06blok","type":14,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"fact07blok","type":14,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"fact08blok","type":14,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"fact09blok","type":14,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"fact11blok","type":14,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"fact12blok","type":14,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"fact13blok","type":14,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"fact14blok","type":14,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"chqpoint01lp","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"chqpoint02lp","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"chqpoint03lp","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"chqpoint04lp","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"chqpoint05lp","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cp1","type":27,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cp2","type":27,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cp3","type":27,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cp4","type":27,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cp5","type":27,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key01","type":15,"def":2688,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key01_h","type":15,"def":2688,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key03","type":15,"def":2688,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key03_h","type":15,"def":2688,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key04","type":15,"def":2688,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key04_h","type":15,"def":2688,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key01icon","type":1,"def":147,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key02icon","type":1,"def":147,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key03icon","type":1,"def":147,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key04icon","type":1,"def":147,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"keyfinalicon","type":1,"def":147,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key02","type":15,"def":2688,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key02_h","type":15,"def":2688,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod01","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod02","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod03","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod04","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod05","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod06","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod07","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod08","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod09","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod10","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod11","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod12","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod13","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod15","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod16","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod17","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod18","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod19","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod20","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod21","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod22","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod23","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod24","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod25","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod26","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod27","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod28","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod29","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod30","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod31","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod32","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod33","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod35","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod36","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod37","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod38","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod39","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod40","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod41","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod42","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod43","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod44","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod45","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod46","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod47","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod48","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod49","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod50","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod51","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod52","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod53","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod54","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod55","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod56","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod57","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod58","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod59","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod60","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod61","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod62","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod63","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod64","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod65","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod66","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod67","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod68","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod69","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod70","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod71","type":23,"def":182,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web01","type":23,"def":184,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web03","type":23,"def":184,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web04","type":23,"def":184,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web08","type":23,"def":184,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"plantvol","type":22,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"no_phantom","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"show_alphas","type":3,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"enddelay","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gifttimer","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"beacon","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"exitportal","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"exitportal2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"exit_vol","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"shower_spout","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"shower_pad","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"shower_slot","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cheatchq1","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cheatchq2","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"phantomonly","type":1,"def":179,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blocktimer","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"avataronly1","type":1,"def":48,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blocktimer1","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"avataronly2","type":1,"def":50,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blocktimer2","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"boss_off","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"boss_on","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"changer_vol","type":3,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"boss_block","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"boss_block1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bossblokvol1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bossblokvol2","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bossblokvol3","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bossblokvol4","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"minipod02","type":23,"def":178,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"minipod03","type":23,"def":178,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"minipod04","type":23,"def":178,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"minipod05","type":23,"def":178,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"minipod08","type":23,"def":178,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lock01","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lock02","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lock03","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lock04","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lockcount","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"___tst","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"swfwait","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"all2boss1","type":3,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"all2boss","type":3,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bossstart","type":9,"def":1,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"boss1a","type":11,"def":29,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"boss1b","type":11,"def":29,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"boss2a","type":11,"def":28,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"boss2b","type":11,"def":28,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"dedboss","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"greelydelay","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"spawner1","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"spawner2","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"hide_kphants","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"hidedelay2","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"spawntimer1a","type":8,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"spawntimer1b","type":8,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"spawntimer2a","type":8,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"spawntimer2b","type":8,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"kphant_off","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"hideseeds","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"kphant1__1a","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant1__2a","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant1__3a","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant1__4a","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant1__1b","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant1__2b","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant1__3b","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant1__4b","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant1__1c","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant1__2c","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant1__3c","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant1__4c","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant1__5c","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant1__6c","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant1__1d","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant1__2d","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant1__3d","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant1__4d","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant1__5d","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant1__6d","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant2__1a","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant2__2a","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant2__3a","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant2__4a","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant2__1b","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant2__2b","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant2__3b","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant2__4b","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant2__1c","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant2__2c","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant2__3c","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant2__4c","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant2__5c","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant2__6c","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant2__1d","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant2__2d","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant2__3d","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant2__4d","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant2__5d","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant2__6d","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"alarmlights","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"greelycage","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"greelychain1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"greelychain2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"greelychain3","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"greelychain4","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"find4keys","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"portal01blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"changeback","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key_final","type":15,"def":2688,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lock_final","type":1,"def":44,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"greely01wait","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bseedpile1","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bseedpile2","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bseedpile3","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bseedpile4","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bseedpile5","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bseedpile6","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bseedpile1t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bseedpile2t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bseedpile3t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bseedpile4t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bseedpile5t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bseedpile6t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seeddelay","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedmover","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedtimer1","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedtimer2","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedtimer3","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedtimer4","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedtimer5","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedtimer6","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedcount","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gooploop","type":16,"def":"ajq_disguisesludgelp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"lavaloop","type":16,"def":"ajq_lavawalllp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"alarmloop2","type":16,"def":"ajq_spinningalarmlp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"alarmloop4","type":16,"def":"ajq_spinningalarmlp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"alarmloop1","type":16,"def":"ajq_pulsealarmlp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"alarmloop3","type":16,"def":"ajq_pulsealarmlp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"portal_loop1","type":16,"def":"ajq_portalstate2lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"portal_loop2","type":16,"def":"ajq_portalstate2lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"portal_clear","type":16,"def":"ajq_portalgatelp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"__tst","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"00_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"10_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"20_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"30_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"40_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"50_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"60_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"70_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"80_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"90_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"exitblock","type":5,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"secret1","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""}],"steps":[{"id":330,"when":"loaded","name":"","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qsndpk","fields":"2686"}]},{"id":1,"when":"loaded","name":"","once":false,"holding":"","nth":1,"nthOn":0,"actions":[{"a":"wait","ms":420},{"a":"set","name":"t_bridge01","state":99,"visible":0,"click":0},{"a":"send","cmd":"qtorch","fields":"0|1|torchlight"},{"a":"wait","ms":1000},{"a":"artstate","name":"graham01","state":"appear"},{"a":"show","name":"graham01","click":0},{"a":"var","name":"players","value":1}]},{"id":2,"when":"trigger","name":"graham01_go","once":true,"holding":"","nth":0,"actions":[{"a":"set","name":"graham01","state":2,"visible":1,"click":1},{"a":"talk","name":"graham01","str":15818,"mode":2},{"a":"var","name":"00_uri","value":1},{"a":"var","name":"__tst","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure7-thesearchforgreely/#00-start/#0#001"},{"a":"var","name":"00_uri","value":99},{"a":"set","name":"graham01_go","state":99,"visible":0,"click":0}]},{"id":3,"when":"answer","name":"graham01","once":false,"holding":"","nth":0,"actions":[{"a":"goal","str":15820},{"a":"show","name":"givetorch","click":1},{"a":"artstate","name":"graham01","state":"disappear"},{"a":"set","name":"graham01","state":3,"visible":1,"click":1},{"a":"set","name":"graham01","state":4,"visible":1,"click":0}]},{"id":4,"when":"trigger","name":"givetorch","once":false,"holding":"","nth":0,"actions":[{"a":"set","name":"graham01","state":99,"visible":0,"click":0},{"a":"send","cmd":"qgi","fields":"torch"}]},{"id":5,"when":"trigger","name":"brazier01","once":true,"holding":"torch","nth":0,"actions":[{"a":"show","name":"t_brazier01","click":0},{"a":"show","name":"t_bridge01","click":0},{"a":"set","name":"l_brazier01","state":99,"visible":0,"click":0},{"a":"set","name":"l_brazier01","state":0,"visible":1,"click":0},{"a":"send","cmd":"qtorch","fields":"0|1|l_brazier01"},{"a":"xp","amount":5,"name":"brazier01"},{"a":"var","name":"braziercount","value":1},{"a":"use"},{"a":"set","name":"torch","state":99,"visible":0,"click":0},{"a":"set","name":"givetorch","state":99,"visible":0,"click":0},{"a":"show","name":"brazier01","click":0},{"a":"wait","ms":1000},{"a":"set","name":"bridgeblok01","state":99,"visible":0,"click":0}]},{"id":6,"when":"trigger","name":"greelyitem01","once":false,"holding":"","nth":0,"actions":[{"a":"say","name":"greelyitem01","str":15925,"flag":2}]},{"id":7,"when":"trigger","name":"hint01","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"artstate","name":"npc02","state":"facesw"},{"a":"set","name":"npc02","state":0,"visible":1,"click":1}]},{"id":8,"when":"trigger","name":"hint01","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"artstate","name":"npc01","state":"hop"},{"a":"set","name":"npc01","state":10,"visible":1,"click":1},{"a":"set","name":"npc01","state":11,"visible":1,"click":0},{"a":"artstate","name":"npc02","state":"hop"},{"a":"set","name":"npc02","state":10,"visible":1,"click":1},{"a":"say","name":"npc02","str":15879,"flag":1},{"a":"set","name":"npc02","state":11,"visible":1,"click":0}]},{"id":9,"when":"trigger","name":"hint01","once":false,"holding":"","nth":5,"nthOn":true,"actions":[{"a":"artstate","name":"npc01","state":"hop"},{"a":"set","name":"npc01","state":10,"visible":1,"click":1},{"a":"set","name":"npc01","state":11,"visible":1,"click":0},{"a":"artstate","name":"npc02","state":"hop"},{"a":"set","name":"npc02","state":10,"visible":1,"click":1},{"a":"say","name":"npc02","str":15879,"flag":1},{"a":"set","name":"npc02","state":11,"visible":1,"click":0}]},{"id":10,"when":"trigger","name":"npc01","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"say","name":"npc01","str":15822,"flag":1},{"a":"wait","ms":3820},{"a":"set","name":"npc02","state":2,"visible":1,"click":1},{"a":"say","name":"npc02","str":15887,"flag":1},{"a":"show","name":"npc02","click":0},{"a":"var","name":"npc01wait","value":0},{"a":"wait","ms":22020},{"a":"set","name":"npc04","state":2,"visible":1,"click":1},{"a":"say","name":"npc04","str":15888,"flag":1},{"a":"show","name":"npc04","click":0},{"a":"var","name":"npc03wait","value":0},{"a":"wait","ms":12010},{"a":"set","name":"npc06","state":2,"visible":1,"click":1},{"a":"say","name":"npc06","str":15889,"flag":1},{"a":"show","name":"npc06","click":0},{"a":"var","name":"npc05wait","value":0}]},{"id":11,"when":"trigger","name":"npc01","once":false,"holding":"","nth":2,"nthOn":true,"actions":[{"a":"say","name":"npc01","str":15822,"flag":1}]},{"id":12,"when":"opened","name":"treasure01","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"treasure01"}]},{"id":13,"when":"trigger","name":"hint02","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"show","name":"npc04","click":0}]},{"id":14,"when":"trigger","name":"hint02","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"artstate","name":"npc03","state":"hop"},{"a":"set","name":"npc03","state":10,"visible":1,"click":1},{"a":"set","name":"npc03","state":11,"visible":1,"click":0},{"a":"artstate","name":"npc04","state":"hop"},{"a":"set","name":"npc04","state":10,"visible":1,"click":1},{"a":"say","name":"npc04","str":15880,"flag":1},{"a":"set","name":"npc04","state":11,"visible":1,"click":0}]},{"id":15,"when":"trigger","name":"hint02","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"artstate","name":"npc03","state":"hop"},{"a":"set","name":"npc03","state":10,"visible":1,"click":1},{"a":"set","name":"npc03","state":11,"visible":1,"click":0},{"a":"artstate","name":"npc04","state":"hop"},{"a":"set","name":"npc04","state":10,"visible":1,"click":1},{"a":"say","name":"npc04","str":15880,"flag":1},{"a":"set","name":"npc04","state":11,"visible":1,"click":0}]},{"id":16,"when":"trigger","name":"hint02","once":false,"holding":"","nth":6,"nthOn":false,"actions":[{"a":"artstate","name":"npc03","state":"hop"},{"a":"set","name":"npc03","state":10,"visible":1,"click":1},{"a":"set","name":"npc03","state":11,"visible":1,"click":0},{"a":"artstate","name":"npc04","state":"hop"},{"a":"set","name":"npc04","state":10,"visible":1,"click":1},{"a":"say","name":"npc04","str":15880,"flag":1},{"a":"set","name":"npc04","state":11,"visible":1,"click":0},{"a":"wait","ms":5930},{"a":"artstate","name":"npc05","state":"hop"},{"a":"set","name":"npc05","state":10,"visible":1,"click":1},{"a":"set","name":"npc05","state":11,"visible":1,"click":0},{"a":"artstate","name":"npc06","state":"hop"},{"a":"set","name":"npc06","state":10,"visible":1,"click":1},{"a":"say","name":"npc06","str":15881,"flag":1},{"a":"set","name":"npc06","state":11,"visible":1,"click":0}]},{"id":17,"when":"trigger","name":"npc03","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"say","name":"npc03","str":15823,"flag":1}]},{"id":18,"when":"trigger","name":"npc03","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"say","name":"npc03","str":15823,"flag":1},{"a":"wait","ms":3220},{"a":"set","name":"npc04","state":2,"visible":1,"click":1},{"a":"say","name":"npc04","str":15888,"flag":1},{"a":"show","name":"npc04","click":0},{"a":"var","name":"npc03wait","value":0},{"a":"wait","ms":6000},{"a":"set","name":"npc02","state":2,"visible":1,"click":1},{"a":"say","name":"npc02","str":15887,"flag":1},{"a":"show","name":"npc02","click":0},{"a":"var","name":"npc01wait","value":0},{"a":"wait","ms":15010},{"a":"set","name":"npc06","state":2,"visible":1,"click":1},{"a":"say","name":"npc06","str":15889,"flag":1},{"a":"show","name":"npc06","click":0},{"a":"var","name":"npc05wait","value":0}]},{"id":19,"when":"trigger","name":"phantomonly","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"say","name":"phantomonly","str":15884,"flag":0}]},{"id":20,"when":"trigger","name":"phantomonly","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"show","name":"phantompad","click":0},{"a":"show","name":"phantomdoor","click":0},{"a":"set","name":"cheatchq1","state":99,"visible":0,"click":0},{"a":"hide","name":"phantomonly"},{"a":"sound","sound":"ajq_mussecretareast"},{"a":"xp","amount":25,"name":"phantomonly"},{"a":"wait","ms":1350},{"a":"set","name":"phantomblok","state":99,"visible":0,"click":0}]},{"id":21,"when":"trigger","name":"hint03","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"show","name":"npc06","click":0}]},{"id":22,"when":"trigger","name":"hint03","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"artstate","name":"npc05","state":"hop"},{"a":"set","name":"npc05","state":10,"visible":1,"click":1},{"a":"set","name":"npc05","state":11,"visible":1,"click":0},{"a":"artstate","name":"npc06","state":"hop"},{"a":"set","name":"npc06","state":10,"visible":1,"click":1},{"a":"say","name":"npc06","str":15881,"flag":1},{"a":"set","name":"npc06","state":11,"visible":1,"click":0}]},{"id":23,"when":"trigger","name":"hint03","once":false,"holding":"","nth":6,"nthOn":true,"actions":[{"a":"wait","ms":1060},{"a":"artstate","name":"npc05","state":"hop"},{"a":"set","name":"npc05","state":10,"visible":1,"click":1},{"a":"set","name":"npc05","state":11,"visible":1,"click":0},{"a":"artstate","name":"npc06","state":"hop"},{"a":"set","name":"npc06","state":10,"visible":1,"click":1},{"a":"say","name":"npc06","str":15881,"flag":1},{"a":"set","name":"npc06","state":11,"visible":1,"click":0}]},{"id":24,"when":"trigger","name":"npc05","once":false,"holding":"","nth":0,"actions":[{"a":"say","name":"npc05","str":15824,"flag":1}]},{"id":25,"when":"trigger","name":"graham02_go","once":false,"holding":"","nth":0,"actions":[{"a":"artstate","name":"graham02","state":"appear"},{"a":"artstate","name":"graham02","state":"facesw"},{"a":"show","name":"graham02","click":1},{"a":"set","name":"graham02","state":6,"visible":1,"click":0},{"a":"set","name":"graham02_go","state":99,"visible":0,"click":0},{"a":"wait","ms":2210},{"a":"set","name":"graham02","state":2,"visible":1,"click":1},{"a":"talk","name":"graham02","str":15832,"mode":2}]},{"id":26,"when":"answer","name":"graham02","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"goal","str":15854},{"a":"show","name":"wheel01","click":1},{"a":"show","name":"wheel02","click":1},{"a":"show","name":"wheel03","click":1},{"a":"set","name":"graham02","state":3,"visible":1,"click":1}]},{"id":27,"when":"answer","name":"graham02","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"goal","str":15835},{"a":"artstate","name":"graham02","state":"disappear"},{"a":"set","name":"graham02","state":5,"visible":1,"click":1},{"a":"set","name":"graham02","state":6,"visible":1,"click":0},{"a":"wait","ms":1080},{"a":"set","name":"graham02","state":99,"visible":0,"click":0}]},{"id":28,"when":"trigger","name":"wheel01","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"show","name":"wheeltile1","click":0},{"a":"set","name":"wheel01","state":2,"visible":1,"click":1},{"a":"show","name":"wheel01","click":1},{"a":"wait","ms":14940},{"a":"show","name":"wheeltile2","click":0},{"a":"set","name":"wheel02","state":2,"visible":1,"click":1},{"a":"show","name":"wheel02","click":1}]},{"id":29,"when":"trigger","name":"wheel01","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"set","name":"wheeltile1","state":2,"visible":1,"click":0},{"a":"set","name":"wheel01","state":2,"visible":1,"click":1},{"a":"show","name":"wheel01","click":1}]},{"id":30,"when":"trigger","name":"wheel01","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"set","name":"wheeltile1","state":3,"visible":1,"click":0},{"a":"set","name":"wheel01","state":2,"visible":1,"click":1},{"a":"show","name":"wheel01","click":1}]},{"id":31,"when":"trigger","name":"wheel01","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"set","name":"wheeltile1","state":4,"visible":1,"click":0},{"a":"set","name":"wheel01","state":2,"visible":1,"click":1},{"a":"show","name":"wheel01","click":1}]},{"id":32,"when":"trigger","name":"wheel02","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"set","name":"wheeltile2","state":5,"visible":1,"click":0},{"a":"set","name":"wheel02","state":2,"visible":1,"click":1},{"a":"show","name":"wheel02","click":1}]},{"id":33,"when":"trigger","name":"wheel02","once":false,"holding":"","nth":6,"nthOn":false,"actions":[{"a":"set","name":"wheeltile2","state":0,"visible":1,"click":0},{"a":"set","name":"wheel02","state":2,"visible":1,"click":1},{"a":"show","name":"wheel02","click":1}]},{"id":34,"when":"trigger","name":"wheel02","once":false,"holding":"","nth":7,"nthOn":false,"actions":[{"a":"show","name":"wheeltile2","click":0},{"a":"set","name":"wheel02","state":2,"visible":1,"click":1},{"a":"show","name":"wheel02","click":1}]},{"id":35,"when":"trigger","name":"wheel02","once":false,"holding":"","nth":8,"nthOn":false,"actions":[{"a":"set","name":"wheeltile2","state":2,"visible":1,"click":0},{"a":"set","name":"wheel02","state":2,"visible":1,"click":1},{"a":"show","name":"wheel02","click":1}]},{"id":36,"when":"trigger","name":"graham02","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"wait","ms":2320},{"a":"talk","name":"graham02","str":15897,"mode":3},{"a":"set","name":"wheeltile2","state":2,"visible":1,"click":0},{"a":"set","name":"wheel02","state":2,"visible":1,"click":1},{"a":"show","name":"wheel02","click":1},{"a":"set","name":"wheeltile2","state":3,"visible":1,"click":0},{"a":"set","name":"wheel02","state":2,"visible":1,"click":1},{"a":"show","name":"wheel02","click":1},{"a":"set","name":"wheeltile2","state":4,"visible":1,"click":0},{"a":"set","name":"wheel02","state":2,"visible":1,"click":1},{"a":"show","name":"wheel02","click":1},{"a":"talk","name":"graham02","str":15897,"mode":3}]},{"id":37,"when":"trigger","name":"wheel03","once":true,"holding":"","nth":0,"actions":[{"a":"show","name":"wheeltile3","click":0},{"a":"set","name":"wheeltile1","state":99,"visible":0,"click":0},{"a":"set","name":"wheeltile2","state":99,"visible":0,"click":0},{"a":"set","name":"wheeltile3","state":99,"visible":0,"click":0},{"a":"set","name":"wheel01","state":99,"visible":0,"click":0},{"a":"set","name":"wheel02","state":99,"visible":0,"click":0},{"a":"set","name":"wheel03","state":99,"visible":0,"click":0},{"a":"show","name":"puzzledoor","click":0},{"a":"var","name":"10_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure7-thesearchforgreely/#10-solveddoorpuzzle/#0#001"},{"a":"var","name":"10_uri","value":99},{"a":"wait","ms":1340},{"a":"set","name":"den_block","state":99,"visible":0,"click":0},{"a":"set","name":"graham02","state":4,"visible":1,"click":1},{"a":"talk","name":"graham02","str":15898,"mode":4}]},{"id":38,"when":"trigger","name":"greelyitem02","once":false,"holding":"","nth":0,"actions":[{"a":"say","name":"greelyitem02","str":15926,"flag":2}]},{"id":39,"when":"trigger","name":"greelyitem03","once":false,"holding":"","nth":0,"actions":[{"a":"say","name":"greelyitem03","str":15927,"flag":2}]},{"id":40,"when":"trigger","name":"graham03_go","once":false,"holding":"","nth":0,"actions":[{"a":"goal","str":15817},{"a":"set","name":"graham03_go","state":99,"visible":0,"click":0}]},{"id":41,"when":"trigger","name":"graham03","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"talk","name":"graham03","str":15834,"mode":0}]},{"id":42,"when":"trigger","name":"graham03","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"talk","name":"graham03","str":15855,"mode":1}]},{"id":43,"when":"trigger","name":"graham03","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"talk","name":"graham03","str":15855,"mode":1}]},{"id":44,"when":"trigger","name":"graham03","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"talk","name":"graham03","str":15858,"mode":2}]},{"id":45,"when":"trigger","name":"graham03","once":false,"holding":"","nth":5,"nthOn":true,"actions":[{"a":"talk","name":"graham03","str":15858,"mode":2}]},{"id":46,"when":"answer","name":"graham03","once":false,"holding":"","nth":1,"nthOn":0,"actions":[{"a":"goal","str":15833},{"a":"artstate","name":"alpha_stone","state":"appear"},{"a":"show","name":"alpha_stone","click":0},{"a":"show","name":"graham03","click":1}]},{"id":47,"when":"trigger","name":"portal01","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"say","name":"portal01","str":15819,"flag":0}]},{"id":48,"when":"trigger","name":"portal01","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"var","name":"portal01once","value":1},{"a":"goal","str":15956},{"a":"set","name":"treasure03","state":99,"visible":0,"click":0},{"a":"set","name":"avatarpad2","state":99,"visible":0,"click":0},{"a":"set","name":"avatardoor2","state":99,"visible":0,"click":0},{"a":"set","name":"avataronly2","state":99,"visible":0,"click":0},{"a":"set","name":"bossblokvol1","state":99,"visible":0,"click":0},{"a":"set","name":"bossblokvol2","state":99,"visible":0,"click":0},{"a":"set","name":"bossblokvol3","state":99,"visible":0,"click":0},{"a":"set","name":"bossblokvol4","state":99,"visible":0,"click":0},{"a":"set","name":"cp4","state":99,"visible":0,"click":0},{"a":"set","name":"cp5","state":99,"visible":0,"click":0},{"a":"set","name":"chqpoint04lp","state":99,"visible":0,"click":0},{"a":"set","name":"chqpoint05lp","state":99,"visible":0,"click":0},{"a":"set","name":"boss_on","state":99,"visible":0,"click":0},{"a":"show","name":"alarmlights","click":0},{"a":"set","name":"bseedpile1","state":99,"visible":0,"click":0},{"a":"set","name":"bseedpile2","state":99,"visible":0,"click":0},{"a":"set","name":"bseedpile3","state":99,"visible":0,"click":0},{"a":"set","name":"bseedpile4","state":99,"visible":0,"click":0},{"a":"set","name":"bseedpile5","state":99,"visible":0,"click":0},{"a":"set","name":"bseedpile6","state":99,"visible":0,"click":0},{"a":"show","name":"bseedpile1t","click":0},{"a":"show","name":"bseedpile2t","click":0},{"a":"show","name":"bseedpile3t","click":0},{"a":"show","name":"bseedpile4t","click":0},{"a":"show","name":"bseedpile5t","click":0},{"a":"show","name":"bseedpile6t","click":0},{"a":"set","name":"key_final","state":99,"visible":0,"click":0},{"a":"set","name":"portal01blok","state":99,"visible":0,"click":0},{"a":"var","name":"20_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure7-thesearchforgreely/#20-enteredphantomvortex/#0#001"},{"a":"var","name":"20_uri","value":99},{"a":"room","key":"in_7b","spawn":"in_7b"}]},{"id":49,"when":"trigger","name":"changer","once":false,"holding":"alpha_stone","nth":0,"actions":[{"a":"goal","str":15882},{"a":"show","name":"gooploop","click":0},{"a":"show","name":"shower_slot","click":0},{"a":"use"},{"a":"set","name":"alpha_stone","state":99,"visible":0,"click":0},{"a":"show","name":"changer_vol","click":1},{"a":"set","name":"shower_spout","state":2,"visible":1,"click":0},{"a":"set","name":"graham03","state":2,"visible":1,"click":1},{"a":"set","name":"changer","state":99,"visible":0,"click":0}]},{"id":50,"when":"trigger","name":"changer_vol","once":false,"holding":"","nth":1,"nthOn":0,"actions":[{"a":"send","cmd":"qavsw","fields":"2|1167910"},{"a":"goal","str":15883},{"a":"set","name":"changer_vol","state":2,"visible":1,"click":1}]},{"id":51,"when":"opened","name":"treasure02","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"treasure02"}]},{"id":52,"when":"trigger","name":"changeback","once":false,"holding":"","nth":1,"nthOn":0,"actions":[{"a":"send","cmd":"qavsw","fields":"0|1167910"},{"a":"talk","name":"changeback","str":15886,"mode":0}]},{"id":53,"when":"trigger","name":"exit_vol","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"say","name":"exit_vol","str":15819,"flag":0}]},{"id":54,"when":"trigger","name":"exit_vol","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"end"}]},{"id":55,"when":"attacked","name":"pod40","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod40|80|10|0"}]},{"id":56,"when":"attacked","name":"pod40","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod40|60|10|0"}]},{"id":57,"when":"attacked","name":"pod40","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod40|40|10|0"}]},{"id":58,"when":"attacked","name":"pod40","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod40|20|10|0"}]},{"id":59,"when":"attacked","name":"pod40","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod40|10|0|1144|1894|"},{"a":"xp","amount":5,"name":"pod40"},{"a":"send","cmd":"qspn","fields":"pod40|pod40__give_gem|200|42|3|15|null|null|null"},{"a":"set","name":"pod40blok","state":99,"visible":0,"click":0}]},{"id":60,"when":"trigger","name":"pod40__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod40__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":61,"when":"attacked","name":"pod41","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod41|80|10|0"}]},{"id":62,"when":"attacked","name":"pod41","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod41|60|10|0"}]},{"id":63,"when":"attacked","name":"pod41","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod41|40|10|0"}]},{"id":64,"when":"attacked","name":"pod41","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod41|20|10|0"}]},{"id":65,"when":"attacked","name":"pod41","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod41|10|0|1458|2037|"},{"a":"xp","amount":5,"name":"pod41"},{"a":"send","cmd":"qspn","fields":"pod41|pod41__give_gem|200|42|3|15|null|null|null"},{"a":"set","name":"pod41blok","state":99,"visible":0,"click":0}]},{"id":66,"when":"trigger","name":"pod41__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod41__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":67,"when":"attacked","name":"pod43","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod43|80|10|0"}]},{"id":68,"when":"attacked","name":"pod43","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod43|60|10|0"}]},{"id":69,"when":"attacked","name":"pod43","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod43|40|10|0"}]},{"id":70,"when":"attacked","name":"pod43","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod43|20|10|0"}]},{"id":71,"when":"attacked","name":"pod43","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod43|10|0|1894|2233|"},{"a":"xp","amount":5,"name":"pod43"},{"a":"send","cmd":"qspn","fields":"pod43|pod43__give_gem|200|42|3|15|null|null|null"},{"a":"set","name":"pod43blok","state":99,"visible":0,"click":0}]},{"id":72,"when":"attacked","name":"pod42","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod42|80|10|0"}]},{"id":73,"when":"attacked","name":"pod42","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod42|60|10|0"}]},{"id":74,"when":"attacked","name":"pod42","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod42|40|10|0"}]},{"id":75,"when":"attacked","name":"pod42","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod42|20|10|0"}]},{"id":76,"when":"attacked","name":"pod42","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod42|10|0|1747|2369|"},{"a":"xp","amount":5,"name":"pod42"},{"a":"send","cmd":"qspn","fields":"pod42|pod42__give_gem|200|42|3|15|null|null|null"},{"a":"set","name":"pod42blok","state":99,"visible":0,"click":0}]},{"id":77,"when":"trigger","name":"pod43__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod43__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":78,"when":"trigger","name":"pod42__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod42__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":79,"when":"trigger","name":"find4keys","once":false,"holding":"","nth":0,"actions":[{"a":"goal","str":15837},{"a":"send","cmd":"qicon","fields":"key01icon|1"},{"a":"send","cmd":"qicon","fields":"key02icon|1"},{"a":"send","cmd":"qicon","fields":"key03icon|1"},{"a":"send","cmd":"qicon","fields":"key04icon|1"},{"a":"set","name":"find4keys","state":99,"visible":0,"click":0}]},{"id":80,"when":"trigger","name":"seedpile03","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"seedpile03","state":99,"visible":0,"click":0},{"a":"show","name":"seedpile03_t","click":0},{"a":"wait","ms":39440},{"a":"set","name":"seedpile03_t","state":0,"visible":1,"click":0},{"a":"set","name":"seedpile03","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer03","value":0}]},{"id":81,"when":"trigger","name":"switch04","once":true,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"switch04"},{"a":"show","name":"switch04_t","click":0},{"a":"hide","name":"sentry15_lp"},{"a":"hide","name":"sentry14_lp"},{"a":"hide","name":"sentry18_lp"},{"a":"hide","name":"sentry19_lp"},{"a":"set","name":"switch04","state":99,"visible":0,"click":0},{"a":"wait","ms":280},{"a":"artstate","name":"sentry15","state":"turnoff"},{"a":"show","name":"sentry15","click":0},{"a":"artstate","name":"sentry14","state":"turnoff"},{"a":"show","name":"sentry14","click":0},{"a":"artstate","name":"sentry18","state":"turnoff"},{"a":"show","name":"sentry18","click":0},{"a":"artstate","name":"sentry19","state":"turnoff"},{"a":"show","name":"sentry19","click":0}]},{"id":82,"when":"pickedUp","name":"key04","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qicon","fields":"key04icon|0"}]},{"id":83,"when":"trigger","name":"switch05","once":true,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"switch05"},{"a":"show","name":"switch05_t","click":0},{"a":"hide","name":"sentry16_lp"},{"a":"hide","name":"sentry17_lp"},{"a":"hide","name":"sentry20_lp"},{"a":"hide","name":"sentry21_lp"},{"a":"set","name":"switch05","state":99,"visible":0,"click":0},{"a":"wait","ms":940},{"a":"artstate","name":"sentry16","state":"turnoff"},{"a":"show","name":"sentry16","click":0},{"a":"artstate","name":"sentry17","state":"turnoff"},{"a":"show","name":"sentry17","click":0},{"a":"artstate","name":"sentry20","state":"turnoff"},{"a":"show","name":"sentry20","click":0},{"a":"artstate","name":"sentry21","state":"turnoff"},{"a":"show","name":"sentry21","click":0},{"a":"appear","name":"factory04","face":""},{"a":"show","name":"fact04blok","click":1},{"a":"set","name":"factory04","state":2,"visible":1,"click":1},{"a":"appear","name":"factory05","face":""},{"a":"show","name":"fact05blok","click":1},{"a":"set","name":"factory05","state":2,"visible":1,"click":1}]},{"id":84,"when":"planted","name":"","once":false,"holding":"","nth":2,"nthOn":0,"actions":[{"a":"set","name":"seedpile03_t","state":0,"visible":1,"click":0},{"a":"set","name":"seedpile03","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer03","value":0}]},{"id":85,"when":"planted","name":"","once":false,"holding":"","nth":22,"nthOn":0,"actions":[{"a":"wait","ms":870},{"a":"send","cmd":"qseed","fields":"137|1|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"}]},{"id":86,"when":"planted","name":"","once":false,"holding":"","nth":49,"nthOn":0,"actions":[{"a":"wait","ms":850},{"a":"send","cmd":"qseed","fields":"137|1|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"}]},{"id":87,"when":"planted","name":"","once":false,"holding":"","nth":114,"nthOn":0,"actions":[{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"}]},{"id":88,"when":"planted","name":"","once":false,"holding":"","nth":120,"nthOn":0,"actions":[{"a":"wait","ms":2270},{"a":"send","cmd":"qseed","fields":"137|0|3"}]},{"id":89,"when":"planted","name":"","once":false,"holding":"","nth":142,"nthOn":0,"actions":[{"a":"send","cmd":"qseed","fields":"137|1|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"wait","ms":530},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"}]},{"id":90,"when":"planted","name":"","once":false,"holding":"","nth":144,"nthOn":0,"actions":[{"a":"wait","ms":500},{"a":"send","cmd":"qseed","fields":"137|1|3"}]},{"id":91,"when":"planted","name":"","once":false,"holding":"","nth":191,"nthOn":0,"actions":[{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"}]},{"id":92,"when":"planted","name":"","once":false,"holding":"","nth":224,"nthOn":0,"actions":[{"a":"wait","ms":700},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"}]},{"id":93,"when":"trigger","name":"factory05__0___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory05__0___give_d|0|null"},{"a":"gems","amount":25}]},{"id":94,"when":"attacked","name":"web08","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web08|80|10|0"}]},{"id":95,"when":"attacked","name":"web08","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web08|60|10|0"}]},{"id":96,"when":"attacked","name":"web08","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web08|40|10|0"}]},{"id":97,"when":"attacked","name":"web08","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web08|20|10|0"}]},{"id":98,"when":"attacked","name":"web08","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"web08|10|0|5096|2505|"},{"a":"xp","amount":5,"name":"web08"},{"a":"hide","name":"web08blok"},{"a":"xp","amount":2,"name":""}]},{"id":99,"when":"trigger","name":"phantom12__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom12__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":100,"when":"attacked","name":"pod22","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod22|80|10|0"}]},{"id":101,"when":"attacked","name":"pod22","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod22|60|10|0"}]},{"id":102,"when":"attacked","name":"pod22","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod22|40|10|0"}]},{"id":103,"when":"attacked","name":"pod22","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod22|20|10|0"}]},{"id":104,"when":"attacked","name":"pod22","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod22|10|0|5688|3028|"},{"a":"xp","amount":5,"name":"pod22"},{"a":"send","cmd":"qspn","fields":"pod22|pod22__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"pod22blok","state":99,"visible":0,"click":0}]},{"id":105,"when":"attacked","name":"pod25","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"wait","ms":270},{"a":"send","cmd":"qahs","fields":"pod25|80|10|0"}]},{"id":106,"when":"attacked","name":"pod25","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod25|60|10|0"},{"a":"wait","ms":310},{"a":"send","cmd":"qahs","fields":"pod25|40|10|0"}]},{"id":107,"when":"attacked","name":"pod25","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod25|20|10|0"}]},{"id":108,"when":"attacked","name":"pod25","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod25|10|0|5776|2883|"},{"a":"xp","amount":5,"name":"pod25"},{"a":"send","cmd":"qspn","fields":"pod25|pod25__give_gem|200|42|3|15|null|null|null"},{"a":"set","name":"pod25blok","state":99,"visible":0,"click":0}]},{"id":109,"when":"trigger","name":"pod25__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod25__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":110,"when":"attacked","name":"pod23","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod23|80|10|0"}]},{"id":111,"when":"attacked","name":"pod23","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod23|60|10|0"}]},{"id":112,"when":"attacked","name":"pod23","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod23|40|10|0"}]},{"id":113,"when":"attacked","name":"pod23","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod23|20|10|0"}]},{"id":114,"when":"attacked","name":"pod23","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod23|10|0|5730|3174|"},{"a":"xp","amount":5,"name":"pod23"},{"a":"send","cmd":"qspn","fields":"pod23|pod23__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"pod23blok","state":99,"visible":0,"click":0}]},{"id":115,"when":"trigger","name":"pod22__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod22__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":116,"when":"trigger","name":"pod23__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod23__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":117,"when":"opened","name":"treasure05","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"treasure05"}]},{"id":118,"when":"attacked","name":"pod26","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod26|80|10|0"}]},{"id":119,"when":"attacked","name":"pod26","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod26|60|10|0"}]},{"id":120,"when":"attacked","name":"pod26","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod26|40|10|0"}]},{"id":121,"when":"attacked","name":"pod26","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod26|20|10|0"}]},{"id":122,"when":"attacked","name":"pod26","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod26|10|0|5946|2922|"},{"a":"xp","amount":5,"name":"pod26"},{"a":"send","cmd":"qspn","fields":"pod26|pod26__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"pod26blok","state":99,"visible":0,"click":0}]},{"id":123,"when":"trigger","name":"pod26__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod26__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":124,"when":"attacked","name":"pod27","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qahs","fields":"pod27|80|10|0"}]},{"id":125,"when":"attacked","name":"pod37","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod37|80|10|0"}]},{"id":126,"when":"attacked","name":"pod37","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod37|60|10|0"}]},{"id":127,"when":"attacked","name":"pod37","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod37|40|10|0"}]},{"id":128,"when":"attacked","name":"pod37","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod37|20|10|0"}]},{"id":129,"when":"attacked","name":"pod37","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod37|10|0|6416|3112|"},{"a":"xp","amount":5,"name":"pod37"},{"a":"send","cmd":"qspn","fields":"pod37|pod37__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"pod37blok","state":99,"visible":0,"click":0}]},{"id":130,"when":"attacked","name":"pod38","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod38|80|10|0"}]},{"id":131,"when":"attacked","name":"pod38","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod38|60|10|0"}]},{"id":132,"when":"attacked","name":"pod38","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod38|40|10|0"}]},{"id":133,"when":"attacked","name":"pod38","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod38|20|10|0"}]},{"id":134,"when":"attacked","name":"pod38","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod38|10|0|6377|3238|"},{"a":"xp","amount":5,"name":"pod38"},{"a":"send","cmd":"qspn","fields":"pod38|pod38__give_gem|200|42|3|10|null|null|null"},{"a":"set","name":"pod38blok","state":99,"visible":0,"click":0}]},{"id":135,"when":"trigger","name":"pod37__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod37__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":136,"when":"attacked","name":"pod30","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod30|80|10|0"}]},{"id":137,"when":"attacked","name":"pod30","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod30|60|10|0"}]},{"id":138,"when":"attacked","name":"pod30","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod30|40|10|0"}]},{"id":139,"when":"attacked","name":"pod30","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod30|20|10|0"}]},{"id":140,"when":"attacked","name":"pod30","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod30|10|0|6429|2976|"},{"a":"xp","amount":5,"name":"pod30"},{"a":"send","cmd":"qspn","fields":"pod30|pod30__give_gem|200|42|3|15|null|null|null"},{"a":"set","name":"pod30blok","state":99,"visible":0,"click":0}]},{"id":141,"when":"attacked","name":"pod33","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod33|80|10|0"}]},{"id":142,"when":"attacked","name":"pod33","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod33|60|10|0"}]},{"id":143,"when":"attacked","name":"pod33","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod33|40|10|0"}]},{"id":144,"when":"attacked","name":"pod33","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod33|20|10|0"}]},{"id":145,"when":"attacked","name":"pod33","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod33|10|0|6684|2931|"},{"a":"xp","amount":5,"name":"pod33"},{"a":"send","cmd":"qspn","fields":"pod33|pod33__give_gem|200|42|3|10|null|null|null"},{"a":"set","name":"pod33blok","state":99,"visible":0,"click":0}]},{"id":146,"when":"trigger","name":"pod33__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod33__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":147,"when":"attacked","name":"pod31","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod31|80|10|0"}]},{"id":148,"when":"attacked","name":"pod31","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod31|60|10|0"}]},{"id":149,"when":"attacked","name":"pod31","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod31|40|10|0"}]},{"id":150,"when":"attacked","name":"pod31","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod31|20|10|0"}]},{"id":151,"when":"attacked","name":"pod31","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod31|10|0|6830|2873|"},{"a":"xp","amount":5,"name":"pod31"},{"a":"send","cmd":"qspn","fields":"pod31|pod31__give_gem|200|42|3|10|null|null|null"},{"a":"set","name":"pod31blok","state":99,"visible":0,"click":0}]},{"id":152,"when":"trigger","name":"pod31__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod31__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":153,"when":"trigger","name":"pod38__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod38__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":154,"when":"trigger","name":"pod30__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod30__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":155,"when":"attacked","name":"pod32","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qahs","fields":"pod32|80|10|0"}]},{"id":156,"when":"attacked","name":"pod39","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qahs","fields":"pod39|80|10|0"}]},{"id":157,"when":"attacked","name":"pod16","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod16|80|10|0"}]},{"id":158,"when":"attacked","name":"pod16","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod16|60|10|0"}]},{"id":159,"when":"attacked","name":"pod16","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod16|40|10|0"}]},{"id":160,"when":"trigger","name":"switch03","once":true,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"switch03"},{"a":"show","name":"switch03_t","click":0},{"a":"hide","name":"sentry07_lp"},{"a":"hide","name":"sentry08_lp"},{"a":"hide","name":"sentry09_lp"},{"a":"hide","name":"sentry10_lp"},{"a":"hide","name":"sentry11_lp"},{"a":"hide","name":"sentry12_lp"},{"a":"hide","name":"sentry13_lp"},{"a":"set","name":"switch03","state":99,"visible":0,"click":0},{"a":"appear","name":"factory06","face":""},{"a":"show","name":"fact06blok","click":1},{"a":"set","name":"factory06","state":2,"visible":1,"click":1},{"a":"appear","name":"factory07","face":""},{"a":"show","name":"fact07blok","click":1},{"a":"set","name":"factory07","state":2,"visible":1,"click":1},{"a":"artstate","name":"sentry07","state":"turnoff"},{"a":"show","name":"sentry07","click":0},{"a":"artstate","name":"sentry08","state":"turnoff"},{"a":"show","name":"sentry08","click":0},{"a":"artstate","name":"sentry09","state":"turnoff"},{"a":"show","name":"sentry09","click":0},{"a":"artstate","name":"sentry10","state":"turnoff"},{"a":"show","name":"sentry10","click":0},{"a":"artstate","name":"sentry11","state":"turnoff"},{"a":"show","name":"sentry11","click":0},{"a":"artstate","name":"sentry12","state":"turnoff"},{"a":"show","name":"sentry12","click":0},{"a":"artstate","name":"sentry13","state":"turnoff"},{"a":"show","name":"sentry13","click":0}]},{"id":161,"when":"attacked","name":"pod45","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qahs","fields":"pod45|80|10|0"}]},{"id":162,"when":"attacked","name":"pod46","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod46|80|10|0"}]},{"id":163,"when":"attacked","name":"pod46","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod46|60|10|0"}]},{"id":164,"when":"pickedUp","name":"key03","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qicon","fields":"key03icon|0"}]},{"id":165,"when":"trigger","name":"aseedpile04","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"show","name":"aseedpile04","click":1},{"a":"set","name":"aseedpile04","state":0,"visible":1,"click":1}]},{"id":166,"when":"trigger","name":"factory06__1___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory06__1___give_d|0|null"},{"a":"gems","amount":25}]},{"id":167,"when":"trigger","name":"pod16__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod16__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":168,"when":"trigger","name":"factory06__0___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory06__0___give_d|0|null"},{"a":"gems","amount":25}]},{"id":169,"when":"trigger","name":"factory04__0___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory04__0___give_d|0|null"},{"a":"gems","amount":25}]},{"id":170,"when":"trigger","name":"seedpile02","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"seedpile02","state":99,"visible":0,"click":0},{"a":"show","name":"seedpile02_t","click":0},{"a":"wait","ms":39440},{"a":"set","name":"seedpile02_t","state":0,"visible":1,"click":0},{"a":"set","name":"seedpile02","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer02","value":0}]},{"id":171,"when":"attacked","name":"web01","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web01|80|10|0"}]},{"id":172,"when":"attacked","name":"web01","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web01|60|10|0"}]},{"id":173,"when":"attacked","name":"web01","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web01|40|10|0"}]},{"id":174,"when":"attacked","name":"web01","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web01|20|10|0"}]},{"id":175,"when":"attacked","name":"web01","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"web01|10|0|4718|4178|"},{"a":"xp","amount":5,"name":"web01"},{"a":"hide","name":"web01blok"},{"a":"xp","amount":2,"name":""}]},{"id":176,"when":"attacked","name":"pod11","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qahs","fields":"pod11|80|10|0"}]},{"id":177,"when":"trigger","name":"phantom10__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom10__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":178,"when":"trigger","name":"pod11__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod11__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":179,"when":"trigger","name":"pod13__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod13__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":180,"when":"trigger","name":"phantom09__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom09__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":181,"when":"trigger","name":"seedpile15","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"seedpile15","state":99,"visible":0,"click":0},{"a":"show","name":"seedpile15_t","click":0},{"a":"wait","ms":39440},{"a":"set","name":"seedpile15_t","state":0,"visible":1,"click":0},{"a":"set","name":"seedpile15","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer15","value":0}]},{"id":182,"when":"attacked","name":"pod18","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qahs","fields":"pod18|80|10|0"}]},{"id":183,"when":"trigger","name":"pod18__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod18__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":184,"when":"trigger","name":"phantom25__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom25__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":185,"when":"attacked","name":"pod47","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod47|80|10|0"}]},{"id":186,"when":"attacked","name":"pod47","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod47|60|10|0"}]},{"id":187,"when":"attacked","name":"pod47","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod47|40|10|0"}]},{"id":188,"when":"attacked","name":"pod47","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod47|20|10|0"}]},{"id":189,"when":"attacked","name":"pod47","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod47|10|0|6643|5144|"},{"a":"xp","amount":5,"name":"pod47"},{"a":"send","cmd":"qspn","fields":"pod47|pod47__give_gem|200|42|3|15|null|null|null"},{"a":"set","name":"pod47blok","state":99,"visible":0,"click":0}]},{"id":190,"when":"trigger","name":"pod47__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod47__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":191,"when":"trigger","name":"aseedpile02","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"show","name":"aseedpile02","click":1},{"a":"set","name":"aseedpile02","state":0,"visible":1,"click":1},{"a":"seeds","seed":137,"count":3,"max":3},{"a":"show","name":"aseedpile02","click":1},{"a":"set","name":"aseedpile02","state":0,"visible":1,"click":1},{"a":"seeds","seed":137,"count":3,"max":3},{"a":"show","name":"aseedpile02","click":1},{"a":"set","name":"aseedpile02","state":0,"visible":1,"click":1},{"a":"seeds","seed":137,"count":3,"max":3},{"a":"show","name":"aseedpile02","click":1},{"a":"set","name":"aseedpile02","state":0,"visible":1,"click":1},{"a":"wait","ms":290},{"a":"seeds","seed":137,"count":3,"max":3},{"a":"show","name":"aseedpile02","click":1},{"a":"set","name":"aseedpile02","state":0,"visible":1,"click":1}]},{"id":192,"when":"pickedUp","name":"key02","once":true,"holding":"","nth":0,"actions":[{"a":"set","name":"seedpile02_t","state":0,"visible":1,"click":0},{"a":"set","name":"seedpile02","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer02","value":0},{"a":"wait","ms":520},{"a":"appear","name":"factory02","face":""},{"a":"show","name":"fact02blok","click":1},{"a":"set","name":"factory02","state":2,"visible":1,"click":1},{"a":"appear","name":"factory03","face":""},{"a":"show","name":"fact03blok","click":1},{"a":"set","name":"factory03","state":2,"visible":1,"click":1},{"a":"send","cmd":"qicon","fields":"key02icon|0"}]},{"id":193,"when":"trigger","name":"factory03__2___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory03__2___give_d|0|null"},{"a":"gems","amount":25}]},{"id":194,"when":"trigger","name":"factory03__1___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory03__1___give_d|0|null"},{"a":"gems","amount":25}]},{"id":195,"when":"trigger","name":"factory03__0___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory03__0___give_d|0|null"},{"a":"gems","amount":25}]},{"id":196,"when":"trigger","name":"pod17__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod17__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":197,"when":"trigger","name":"pod12__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod12__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":198,"when":"trigger","name":"seedpile01","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"seedpile01","state":99,"visible":0,"click":0},{"a":"show","name":"seedpile01_t","click":0},{"a":"wait","ms":39440},{"a":"set","name":"seedpile01_t","state":0,"visible":1,"click":0},{"a":"set","name":"seedpile01","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer01","value":0}]},{"id":199,"when":"trigger","name":"seedpile01","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"seedpile01","state":99,"visible":0,"click":0},{"a":"show","name":"seedpile01_t","click":0},{"a":"wait","ms":39440},{"a":"set","name":"seedpile01_t","state":0,"visible":1,"click":0},{"a":"set","name":"seedpile01","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer01","value":0}]},{"id":200,"when":"trigger","name":"seedpile01","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"wait","ms":9360},{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"seedpile01","state":99,"visible":0,"click":0},{"a":"show","name":"seedpile01_t","click":0},{"a":"wait","ms":39440},{"a":"set","name":"seedpile01_t","state":0,"visible":1,"click":0},{"a":"set","name":"seedpile01","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer01","value":0}]},{"id":201,"when":"trigger","name":"seedpile01","once":false,"holding":"","nth":5,"nthOn":true,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"seedpile01","state":99,"visible":0,"click":0},{"a":"show","name":"seedpile01_t","click":0},{"a":"wait","ms":39440},{"a":"set","name":"seedpile01_t","state":0,"visible":1,"click":0},{"a":"set","name":"seedpile01","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer01","value":0}]},{"id":202,"when":"attacked","name":"pod01","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod01|80|10|0"}]},{"id":203,"when":"attacked","name":"pod01","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod01|60|10|0"}]},{"id":204,"when":"attacked","name":"pod01","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod01|40|10|0"}]},{"id":205,"when":"attacked","name":"pod01","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod01|20|10|0"}]},{"id":206,"when":"attacked","name":"pod01","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod01|10|0|1727|4128|"},{"a":"xp","amount":5,"name":"pod01"},{"a":"send","cmd":"qspn","fields":"pod01|pod01__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"pod01blok","state":99,"visible":0,"click":0}]},{"id":207,"when":"attacked","name":"pod44","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod44|80|10|0"}]},{"id":208,"when":"attacked","name":"pod44","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod44|60|10|0"}]},{"id":209,"when":"attacked","name":"pod44","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod44|40|10|0"}]},{"id":210,"when":"attacked","name":"pod44","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod44|20|10|0"}]},{"id":211,"when":"attacked","name":"pod44","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod44|10|0|1575|4046|"},{"a":"xp","amount":5,"name":"pod44"},{"a":"send","cmd":"qspn","fields":"pod44|pod44__give_gem|200|42|3|15|null|null|null"},{"a":"set","name":"pod44blok","state":99,"visible":0,"click":0}]},{"id":212,"when":"trigger","name":"pod44__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod44__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":213,"when":"trigger","name":"pod01__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod01__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":214,"when":"attacked","name":"pod02","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod02|50|1|731|4241|"},{"a":"xp","amount":5,"name":"pod02"},{"a":"send","cmd":"qspn","fields":"pod02|pod02__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"pod02blok","state":99,"visible":0,"click":0}]},{"id":215,"when":"attacked","name":"pod03","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qahs","fields":"pod03|80|10|0"}]},{"id":216,"when":"trigger","name":"pod02__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod02__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":217,"when":"trigger","name":"switch01","once":true,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"switch01"},{"a":"show","name":"switch01_t","click":0},{"a":"hide","name":"sentry01_lp"},{"a":"hide","name":"sentry02_lp"},{"a":"set","name":"switch01","state":99,"visible":0,"click":0},{"a":"wait","ms":1600},{"a":"artstate","name":"sentry01","state":"turnoff"},{"a":"show","name":"sentry01","click":0},{"a":"artstate","name":"sentry02","state":"turnoff"},{"a":"show","name":"sentry02","click":0}]},{"id":218,"when":"trigger","name":"phantom05__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom05__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":219,"when":"attacked","name":"pod04","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod04|80|10|0"}]},{"id":220,"when":"attacked","name":"pod04","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod04|60|10|0"}]},{"id":221,"when":"attacked","name":"pod04","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod04|40|10|0"}]},{"id":222,"when":"attacked","name":"pod04","once":false,"holding":"","nth":8,"nthOn":false,"actions":[{"a":"wait","ms":360},{"a":"send","cmd":"qahs","fields":"pod04|20|10|0"},{"a":"send","cmd":"qad","fields":"pod04|10|0|1900|4844|"},{"a":"xp","amount":5,"name":"pod04"},{"a":"send","cmd":"qspn","fields":"pod04|pod04__give_gem|200|42|3|10|null|null|null"},{"a":"set","name":"pod04blok","state":99,"visible":0,"click":0}]},{"id":223,"when":"attacked","name":"pod06","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod06|80|10|0"}]},{"id":224,"when":"attacked","name":"pod06","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod06|60|10|0"}]},{"id":225,"when":"attacked","name":"pod06","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod06|40|10|0"}]},{"id":226,"when":"attacked","name":"pod06","once":false,"holding":"","nth":6,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod06|20|10|0"},{"a":"send","cmd":"qad","fields":"pod06|10|0|1925|4997|"},{"a":"xp","amount":5,"name":"pod06"},{"a":"send","cmd":"qspn","fields":"pod06|pod06__give_gem|200|42|3|10|null|null|null"},{"a":"set","name":"pod06blok","state":99,"visible":0,"click":0},{"a":"set","name":"seedpile01_t","state":0,"visible":1,"click":0},{"a":"set","name":"seedpile01","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer01","value":0}]},{"id":227,"when":"trigger","name":"pod04__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod04__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":228,"when":"trigger","name":"pod06__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod05__give_gem|0|null"},{"a":"send","cmd":"qad","fields":"pod06__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":229,"when":"trigger","name":"seedpile05","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"seedpile05","state":99,"visible":0,"click":0},{"a":"show","name":"seedpile05_t","click":0},{"a":"wait","ms":39440},{"a":"set","name":"seedpile05_t","state":0,"visible":1,"click":0},{"a":"set","name":"seedpile05","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer05","value":0}]},{"id":230,"when":"trigger","name":"phantom__02__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom__02__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":231,"when":"trigger","name":"phantom__03__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom__03__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":232,"when":"trigger","name":"pod07__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod07__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":233,"when":"trigger","name":"aseedpile01","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"show","name":"aseedpile01","click":1},{"a":"set","name":"aseedpile01","state":0,"visible":1,"click":1}]},{"id":234,"when":"opened","name":"treasure04","once":false,"holding":"","nth":0,"actions":[{"a":"wait","ms":380},{"a":"xp","amount":5,"name":"treasure04"}]},{"id":235,"when":"trigger","name":"phantom06__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom06__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":236,"when":"trigger","name":"phantom07__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom07__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":237,"when":"attacked","name":"pod08","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod08|80|10|0"}]},{"id":238,"when":"attacked","name":"pod08","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"wait","ms":270},{"a":"send","cmd":"qahs","fields":"pod08|60|10|0"},{"a":"wait","ms":190},{"a":"send","cmd":"qahs","fields":"pod08|40|10|0"}]},{"id":239,"when":"attacked","name":"pod08","once":false,"holding":"","nth":20,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod08|20|10|0"},{"a":"send","cmd":"qad","fields":"pod08|10|0|1390|5571|"},{"a":"xp","amount":5,"name":"pod08"},{"a":"send","cmd":"qspn","fields":"pod08|pod08__give_gem|200|42|3|15|null|null|null"},{"a":"set","name":"pod08blok","state":99,"visible":0,"click":0}]},{"id":240,"when":"trigger","name":"phantom08__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom08__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":241,"when":"trigger","name":"pod08__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod08__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":242,"when":"trigger","name":"phantom24__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom24__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":243,"when":"attacked","name":"pod09","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod09|80|10|0"}]},{"id":244,"when":"attacked","name":"pod09","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod09|60|10|0"}]},{"id":245,"when":"attacked","name":"pod09","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod09|40|10|0"}]},{"id":246,"when":"attacked","name":"pod09","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod09|20|10|0"}]},{"id":247,"when":"attacked","name":"pod09","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod09|10|0|929|5444|"},{"a":"xp","amount":5,"name":"pod09"},{"a":"send","cmd":"qspn","fields":"pod09|pod09__give_gem|200|42|3|10|null|null|null"},{"a":"set","name":"pod09blok","state":99,"visible":0,"click":0}]},{"id":248,"when":"trigger","name":"pod09__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod09__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":249,"when":"trigger","name":"phantom__22__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom__22__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":250,"when":"pickedUp","name":"key01","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qicon","fields":"key01icon|0"}]},{"id":251,"when":"trigger","name":"phantom__21__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom__21__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":252,"when":"trigger","name":"phantom__23__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom__23__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":253,"when":"trigger","name":"phantom__20__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom__20__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":254,"when":"attacked","name":"pod10","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod10|80|10|0"}]},{"id":255,"when":"attacked","name":"pod10","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod10|60|10|0"}]},{"id":256,"when":"attacked","name":"pod10","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod10|40|10|0"}]},{"id":257,"when":"attacked","name":"pod10","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod10|20|10|0"}]},{"id":258,"when":"attacked","name":"pod10","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod10|10|0|207|5048|"},{"a":"xp","amount":5,"name":"pod10"},{"a":"send","cmd":"qspn","fields":"pod10|pod10__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"pod10blok","state":99,"visible":0,"click":0}]},{"id":259,"when":"trigger","name":"pod10__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod10__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":260,"when":"trigger","name":"switch02","once":true,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"switch02"},{"a":"show","name":"switch02_t","click":0},{"a":"hide","name":"sentry03_lp"},{"a":"hide","name":"sentry04_lp"},{"a":"hide","name":"sentry06_lp"},{"a":"set","name":"switch02","state":99,"visible":0,"click":0},{"a":"wait","ms":790},{"a":"appear","name":"factory01","face":""},{"a":"show","name":"fact01blok","click":1},{"a":"set","name":"factory01","state":2,"visible":1,"click":1},{"a":"artstate","name":"sentry03","state":"turnoff"},{"a":"show","name":"sentry03","click":0},{"a":"artstate","name":"sentry04","state":"turnoff"},{"a":"show","name":"sentry04","click":0},{"a":"artstate","name":"sentry06","state":"turnoff"},{"a":"show","name":"sentry06","click":0}]},{"id":261,"when":"trigger","name":"all2boss","once":false,"holding":"","nth":0,"actions":[{"a":"teleport","name":"bossstart"}]},{"id":262,"when":"cutsceneDone","name":"","once":false,"holding":"","nth":0,"actions":[{"a":"set","name":"all2boss","state":99,"visible":0,"click":0},{"a":"set","name":"all2boss1","state":99,"visible":0,"click":0},{"a":"path","name":"boss1a","path":"bpath1"},{"a":"show","name":"boss1a","click":1},{"a":"path","name":"boss1b","path":"bpath2"},{"a":"show","name":"boss1b","click":1},{"a":"set","name":"boss_off","state":99,"visible":0,"click":0},{"a":"show","name":"boss_on","click":0},{"a":"set","name":"cp1","state":99,"visible":0,"click":0},{"a":"set","name":"cp2","state":99,"visible":0,"click":0},{"a":"set","name":"cp3","state":99,"visible":0,"click":0},{"a":"set","name":"chqpoint01lp","state":99,"visible":0,"click":0},{"a":"set","name":"chqpoint02lp","state":99,"visible":0,"click":0},{"a":"set","name":"chqpoint03lp","state":99,"visible":0,"click":0},{"a":"show","name":"boss_block","click":0},{"a":"show","name":"boss_block1","click":0},{"a":"set","name":"bossblokvol1","state":0,"visible":1,"click":0},{"a":"set","name":"bossblokvol2","state":0,"visible":1,"click":0},{"a":"set","name":"bossblokvol3","state":0,"visible":1,"click":0},{"a":"set","name":"bossblokvol4","state":0,"visible":1,"click":0},{"a":"set","name":"bseedpile1","state":0,"visible":1,"click":1},{"a":"set","name":"bseedpile2","state":0,"visible":1,"click":1},{"a":"set","name":"bseedpile3","state":0,"visible":1,"click":1},{"a":"set","name":"bseedpile4","state":0,"visible":1,"click":1},{"a":"set","name":"bseedpile5","state":0,"visible":1,"click":1},{"a":"set","name":"bseedpile6","state":0,"visible":1,"click":1},{"a":"set","name":"bseedpile1t","state":0,"visible":1,"click":0},{"a":"set","name":"bseedpile2t","state":0,"visible":1,"click":0},{"a":"set","name":"bseedpile3t","state":0,"visible":1,"click":0},{"a":"set","name":"bseedpile4t","state":0,"visible":1,"click":0},{"a":"set","name":"bseedpile5t","state":0,"visible":1,"click":0},{"a":"set","name":"bseedpile6t","state":0,"visible":1,"click":0},{"a":"set","name":"seedpile02","state":99,"visible":0,"click":0},{"a":"show","name":"seedpile02_t","click":0},{"a":"show","name":"alarmloop1","click":0},{"a":"show","name":"alarmloop2","click":0},{"a":"show","name":"alarmloop3","click":0},{"a":"show","name":"alarmloop4","click":0},{"a":"goal","str":15850},{"a":"send","cmd":"qmusic","fields":"ajq_mus2phntmkings"}]},{"id":263,"when":"trigger","name":"bseedpile5","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"bseedpile5","state":99,"visible":0,"click":0},{"a":"show","name":"bseedpile5t","click":0},{"a":"var","name":"seedcount","value":"{count}"},{"a":"wait","ms":50470},{"a":"set","name":"bseedpile5t","state":0,"visible":1,"click":0},{"a":"var","name":"seeddelay","value":0},{"a":"wait","ms":1000},{"a":"set","name":"bseedpile5","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer5","value":0}]},{"id":264,"when":"trigger","name":"bseedpile6","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"bseedpile6","state":99,"visible":0,"click":0},{"a":"show","name":"bseedpile6t","click":0},{"a":"var","name":"seedcount","value":"{count}"},{"a":"wait","ms":50470},{"a":"set","name":"bseedpile6t","state":0,"visible":1,"click":0},{"a":"var","name":"seeddelay","value":0},{"a":"wait","ms":1000},{"a":"set","name":"bseedpile6","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer6","value":0}]},{"id":265,"when":"trigger","name":"factory01__0___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory01__0___give_d|0|null"},{"a":"gems","amount":25}]},{"id":266,"when":"trigger","name":"bseedpile2","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"bseedpile2","state":99,"visible":0,"click":0},{"a":"show","name":"bseedpile2t","click":0},{"a":"var","name":"seedcount","value":"{count}"},{"a":"wait","ms":50470},{"a":"set","name":"bseedpile2t","state":0,"visible":1,"click":0},{"a":"var","name":"seeddelay","value":0},{"a":"wait","ms":1000},{"a":"set","name":"bseedpile2","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer2","value":0}]},{"id":267,"when":"trigger","name":"bseedpile1","once":false,"holding":"","nth":14,"nthOn":false,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"bseedpile1","state":99,"visible":0,"click":0},{"a":"show","name":"bseedpile1t","click":0},{"a":"var","name":"seedcount","value":"{count}"},{"a":"var","name":"seeddelay","value":0},{"a":"wait","ms":29660},{"a":"wait","ms":50470},{"a":"set","name":"bseedpile1t","state":0,"visible":1,"click":0},{"a":"var","name":"seeddelay","value":0},{"a":"wait","ms":1000},{"a":"set","name":"bseedpile1","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer1","value":0}]},{"id":268,"when":"trigger","name":"bseedpile3","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"bseedpile3","state":99,"visible":0,"click":0},{"a":"show","name":"bseedpile3t","click":0},{"a":"var","name":"seedcount","value":"{count}"},{"a":"wait","ms":270},{"a":"var","name":"seeddelay","value":0},{"a":"wait","ms":1000},{"a":"wait","ms":50470},{"a":"set","name":"bseedpile3t","state":0,"visible":1,"click":0},{"a":"var","name":"seeddelay","value":0},{"a":"wait","ms":1000},{"a":"set","name":"bseedpile3","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer3","value":0}]},{"id":269,"when":"trigger","name":"bseedpile4","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"bseedpile4","state":99,"visible":0,"click":0},{"a":"show","name":"bseedpile4t","click":0},{"a":"var","name":"seedcount","value":"{count}"},{"a":"wait","ms":50470},{"a":"set","name":"bseedpile4t","state":0,"visible":1,"click":0},{"a":"var","name":"seeddelay","value":0},{"a":"wait","ms":1000},{"a":"set","name":"bseedpile4","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer4","value":0}]},{"id":270,"when":"trigger","name":"bseedpile4","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"bseedpile4","state":99,"visible":0,"click":0},{"a":"show","name":"bseedpile4t","click":0},{"a":"var","name":"seedcount","value":"{count}"},{"a":"wait","ms":1870},{"a":"var","name":"seeddelay","value":0},{"a":"wait","ms":1000},{"a":"wait","ms":50470},{"a":"set","name":"bseedpile4t","state":0,"visible":1,"click":0},{"a":"var","name":"seeddelay","value":0},{"a":"wait","ms":1000},{"a":"set","name":"bseedpile4","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer4","value":0}]},{"id":271,"when":"trigger","name":"kphant2__2b__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"kphant2__2b__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":272,"when":"pickedUp","name":"key_final","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qicon","fields":"keyfinalicon|0"}]},{"id":273,"when":"trigger","name":"lock_final","once":true,"holding":"key_final","nth":0,"actions":[{"a":"xp","amount":50,"name":"lock_final"},{"a":"use"},{"a":"set","name":"greelycage","state":6,"visible":1,"click":0},{"a":"sound","sound":"ajq_greelyprisonshatter"},{"a":"set","name":"lock_final","state":99,"visible":0,"click":0},{"a":"wait","ms":1160},{"a":"show","name":"greely01","click":1},{"a":"talk","name":"greely01","str":15836,"mode":1}]},{"id":274,"when":"answer","name":"greely01","once":false,"holding":"","nth":0,"actions":[{"a":"goal","str":15873},{"a":"set","name":"boss_block1","state":0,"visible":1,"click":0},{"a":"set","name":"bossblokvol3","state":99,"visible":0,"click":0},{"a":"artstate","name":"greely02","state":"facesw"},{"a":"set","name":"greely02","state":2,"visible":1,"click":1},{"a":"show","name":"greely02","click":0},{"a":"send","cmd":"qicon","fields":"greely02|1"},{"a":"show","name":"show_alphas","click":1},{"a":"show","name":"exitblock","click":0},{"a":"artstate","name":"greely01","state":"disappear"},{"a":"set","name":"greely01","state":2,"visible":1,"click":1},{"a":"set","name":"greely01","state":3,"visible":1,"click":0},{"a":"wait","ms":1270},{"a":"set","name":"greely01","state":99,"visible":0,"click":0}]},{"id":275,"when":"trigger","name":"show_alphas","once":false,"holding":"","nth":0,"actions":[{"a":"set","name":"exit_vol","state":99,"visible":0,"click":0},{"a":"show","name":"greely02x","click":1},{"a":"talk","name":"greely02x","str":15841,"mode":1},{"a":"set","name":"show_alphas","state":99,"visible":0,"click":0}]},{"id":276,"when":"answer","name":"greely02x","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"set","name":"exitportal2","state":2,"visible":1,"click":0},{"a":"set","name":"portal_loop2","state":99,"visible":0,"click":0},{"a":"show","name":"portal_clear","click":0},{"a":"wait","ms":1000},{"a":"appear","name":"graham04","face":""},{"a":"set","name":"graham04","state":2,"visible":1,"click":0},{"a":"wait","ms":1000},{"a":"appear","name":"liza01","face":""},{"a":"set","name":"liza01","state":2,"visible":1,"click":0},{"a":"wait","ms":1000},{"a":"appear","name":"cosmo01","face":""},{"a":"set","name":"cosmo01","state":2,"visible":1,"click":0},{"a":"wait","ms":1000},{"a":"artstate","name":"greely02","state":"facesw"},{"a":"set","name":"greely02","state":2,"visible":1,"click":1},{"a":"show","name":"greely02","click":0},{"a":"wait","ms":1000},{"a":"show","name":"graham04x","click":1},{"a":"talk","name":"graham04x","str":15874,"mode":1}]},{"id":277,"when":"answer","name":"greely02x","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"set","name":"cosmo01x","state":2,"visible":1,"click":1},{"a":"talk","name":"cosmo01x","str":15934,"mode":2}]},{"id":278,"when":"answer","name":"greely02x","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"show","name":"beacon","click":0},{"a":"wait","ms":1070},{"a":"set","name":"liza01x","state":2,"visible":1,"click":1},{"a":"talk","name":"liza01x","str":15935,"mode":2}]},{"id":279,"when":"answer","name":"greely02x","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"set","name":"graham04x","state":2,"visible":1,"click":1},{"a":"talk","name":"graham04x","str":15875,"mode":2}]},{"id":280,"when":"answer","name":"greely02x","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"goal","str":15863},{"a":"xp","amount":50,"name":"greely02x"},{"a":"wait","ms":1910},{"a":"var","name":"90_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure7-thesearchforgreely/#90-exit/#0#001"},{"a":"var","name":"90_uri","value":99},{"a":"prize","list":"den 1490, den 1491, den 1492, den 1493, gems 1000"},{"a":"set","name":"greely02","state":4,"visible":1,"click":1},{"a":"set","name":"graham04","state":3,"visible":1,"click":1},{"a":"set","name":"liza01","state":3,"visible":1,"click":1},{"a":"set","name":"cosmo01","state":3,"visible":1,"click":1},{"a":"set","name":"boss_block","state":0,"visible":1,"click":0},{"a":"set","name":"bossblokvol1","state":99,"visible":0,"click":0},{"a":"set","name":"bossblokvol2","state":99,"visible":0,"click":0},{"a":"set","name":"bossblokvol4","state":99,"visible":0,"click":0},{"a":"send","cmd":"qicon","fields":"greely02|0"},{"a":"wait","ms":2000},{"a":"show","name":"exit_vol","click":1},{"a":"set","name":"exitblock","state":99,"visible":0,"click":0}]},{"id":281,"when":"answer","name":"graham04x","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"show","name":"liza01x","click":1},{"a":"talk","name":"liza01x","str":15878,"mode":1}]},{"id":282,"when":"answer","name":"graham04x","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"set","name":"greely02x","state":5,"visible":1,"click":1},{"a":"talk","name":"greely02x","str":15849,"mode":5}]},{"id":283,"when":"answer","name":"liza01x","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"show","name":"cosmo01x","click":1},{"a":"talk","name":"cosmo01x","str":15877,"mode":1}]},{"id":284,"when":"answer","name":"liza01x","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"set","name":"greely02x","state":4,"visible":1,"click":1},{"a":"talk","name":"greely02x","str":15848,"mode":4}]},{"id":285,"when":"answer","name":"cosmo01x","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"set","name":"greely02x","state":2,"visible":1,"click":1},{"a":"talk","name":"greely02x","str":15846,"mode":2}]},{"id":286,"when":"answer","name":"cosmo01x","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"set","name":"greely02x","state":3,"visible":1,"click":1},{"a":"talk","name":"greely02x","str":15847,"mode":3}]},{"id":287,"when":"trigger","name":"graham04","once":false,"holding":"","nth":0,"actions":[{"a":"talk","name":"graham04","str":15937,"mode":3}]},{"id":288,"when":"trigger","name":"greely02","once":false,"holding":"","nth":0,"actions":[{"a":"talk","name":"greely02","str":15870,"mode":4}]},{"id":289,"when":"trigger","name":"cosmo01","once":false,"holding":"","nth":0,"actions":[{"a":"talk","name":"cosmo01","str":15938,"mode":3}]},{"id":290,"when":"trigger","name":"liza01","once":false,"holding":"","nth":0,"actions":[{"a":"talk","name":"liza01","str":15936,"mode":3}]},{"id":291,"holding":"","when":"trigger","name":"treasure#","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"set","name":"seedpile03_t","state":0,"visible":1,"click":0},{"a":"set","name":"seedpile03","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer03","value":0}]},{"id":292,"holding":"","when":"trigger","name":"lock#","family":true,"holdFam":"key#","unlessFam":"","once":true,"nth":0,"actions":[{"a":"use"},{"a":"var","name":"lockcount","value":"{count}"},{"a":"xp","amount":25,"name":"{name}"},{"a":"hide","name":"{name}"}]},{"id":293,"holding":"","when":"trigger","name":"lock#","family":true,"holdFam":"key#","unlessFam":"","member":"lock04","once":true,"nth":0,"actions":[{"a":"show","name":"greelychain4","click":0}]},{"id":294,"holding":"","when":"trigger","name":"lock#","family":true,"holdFam":"key#","unlessFam":"","member":"lock01","once":true,"nth":0,"actions":[{"a":"show","name":"greelychain1","click":0}]},{"id":295,"holding":"","when":"trigger","name":"lock#","family":true,"holdFam":"key#","unlessFam":"","member":"lock03","once":true,"nth":0,"actions":[{"a":"show","name":"greelychain3","click":0}]},{"id":296,"holding":"","when":"trigger","name":"lock#","family":true,"holdFam":"key#","unlessFam":"","member":"lock02","once":true,"nth":0,"actions":[{"a":"show","name":"greelychain2","click":0}]},{"id":297,"holding":"","when":"trigger","name":"lock#","family":true,"holdFam":"","unlessFam":"key#","once":false,"nth":0,"actions":[{"a":"say","name":"{name}","str":15860,"flag":0}]},{"id":298,"holding":"","when":"eaten","name":"","boss":"boss1a","nth":1,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"send","cmd":"qahs","fields":"{phantom}|87|100|0"}]},{"id":299,"holding":"","when":"eaten","name":"","boss":"boss1a","nth":2,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"set","name":"{phantom}","state":2,"visible":1,"click":1},{"a":"artstate","name":"{phantom}","state":"agro"},{"a":"set","name":"{phantom}","state":4,"visible":1,"click":1},{"a":"send","cmd":"qahs","fields":"{phantom}|75|100|0"},{"a":"wait","ms":1490},{"a":"var","name":"spawner1","value":"{count}"},{"a":"artstate","name":"kphant1__1a","state":"appear"},{"a":"path","name":"kphant1__1a","path":"bpath1a"},{"a":"show","name":"kphant1__1a","click":1},{"a":"artstate","name":"kphant1__2a","state":"appear"},{"a":"path","name":"kphant1__2a","path":"bpath1c"},{"a":"show","name":"kphant1__2a","click":1},{"a":"artstate","name":"kphant1__1a","state":"appear"},{"a":"path","name":"kphant1__1a","path":"bpath1a"},{"a":"show","name":"kphant1__1a","click":1},{"a":"artstate","name":"kphant1__2a","state":"appear"},{"a":"path","name":"kphant1__2a","path":"bpath1c"},{"a":"show","name":"kphant1__2a","click":1},{"a":"sound","sound":"ajq_phantomminispawn"},{"a":"var","name":"spawntimer1a","value":0}]},{"id":300,"holding":"","when":"eaten","name":"","boss":"boss1a","nth":3,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"send","cmd":"qahs","fields":"{phantom}|62|100|0"}]},{"id":301,"holding":"","when":"eaten","name":"","boss":"boss1a","nth":4,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"set","name":"{phantom}","state":5,"visible":1,"click":1},{"a":"artstate","name":"{phantom}","state":"agro"},{"a":"set","name":"{phantom}","state":7,"visible":1,"click":1},{"a":"send","cmd":"qahs","fields":"{phantom}|50|100|0"},{"a":"wait","ms":1650},{"a":"var","name":"spawner1","value":"{count}"},{"a":"artstate","name":"kphant1__1b","state":"appear"},{"a":"path","name":"kphant1__1b","path":"bpath1a"},{"a":"show","name":"kphant1__1b","click":1},{"a":"artstate","name":"kphant1__2b","state":"appear"},{"a":"path","name":"kphant1__2b","path":"bpath1c"},{"a":"show","name":"kphant1__2b","click":1},{"a":"artstate","name":"kphant1__1b","state":"appear"},{"a":"path","name":"kphant1__1b","path":"bpath1a"},{"a":"show","name":"kphant1__1b","click":1},{"a":"artstate","name":"kphant1__2b","state":"appear"},{"a":"path","name":"kphant1__2b","path":"bpath1c"},{"a":"show","name":"kphant1__2b","click":1},{"a":"sound","sound":"ajq_phantomminispawn"},{"a":"var","name":"spawntimer1a","value":0}]},{"id":302,"holding":"","when":"eaten","name":"","boss":"boss1a","nth":5,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"send","cmd":"qahs","fields":"{phantom}|37|100|0"}]},{"id":303,"holding":"","when":"eaten","name":"","boss":"boss1a","nth":6,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"set","name":"{phantom}","state":8,"visible":1,"click":1},{"a":"path","name":"{phantom}","path":"bpath_last"},{"a":"set","name":"{phantom}","state":9,"visible":1,"click":1},{"a":"artstate","name":"{phantom}","state":"agro"},{"a":"set","name":"{phantom}","state":10,"visible":1,"click":1},{"a":"send","cmd":"qahs","fields":"{phantom}|25|100|0"},{"a":"wait","ms":1330},{"a":"var","name":"spawner1","value":"{count}"},{"a":"artstate","name":"kphant1__1c","state":"appear"},{"a":"path","name":"kphant1__1c","path":"bpath1a"},{"a":"show","name":"kphant1__1c","click":1},{"a":"artstate","name":"kphant1__2c","state":"appear"},{"a":"path","name":"kphant1__2c","path":"bpath1b"},{"a":"show","name":"kphant1__2c","click":1},{"a":"artstate","name":"kphant1__3c","state":"appear"},{"a":"path","name":"kphant1__3c","path":"bpath1c"},{"a":"show","name":"kphant1__3c","click":1},{"a":"artstate","name":"kphant1__1c","state":"appear"},{"a":"path","name":"kphant1__1c","path":"bpath1a"},{"a":"show","name":"kphant1__1c","click":1},{"a":"artstate","name":"kphant1__2c","state":"appear"},{"a":"path","name":"kphant1__2c","path":"bpath1b"},{"a":"show","name":"kphant1__2c","click":1},{"a":"artstate","name":"kphant1__3c","state":"appear"},{"a":"path","name":"kphant1__3c","path":"bpath1c"},{"a":"show","name":"kphant1__3c","click":1},{"a":"sound","sound":"ajq_phantomminispawn"},{"a":"var","name":"spawntimer1a","value":0}]},{"id":304,"holding":"","when":"eaten","name":"","boss":"boss1a","nth":7,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"send","cmd":"qahs","fields":"{phantom}|12|100|0"}]},{"id":305,"holding":"","when":"eaten","name":"","boss":"boss1a","nth":8,"once":false,"dies":[100,1],"actions":[{"a":"var","name":"dedboss","value":"{count}"},{"a":"var","name":"80_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure7-thesearchforgreely/#80-defeatedsecondboss/#0#001"},{"a":"var","name":"80_uri","value":99},{"a":"artstate","name":"kphant1__1a","state":"disappear"},{"a":"set","name":"kphant1__1a","state":98,"visible":1,"click":0},{"a":"artstate","name":"kphant1__2a","state":"disappear"},{"a":"set","name":"kphant1__2a","state":98,"visible":1,"click":0},{"a":"artstate","name":"kphant1__1b","state":"disappear"},{"a":"set","name":"kphant1__1b","state":98,"visible":1,"click":0},{"a":"artstate","name":"kphant1__2b","state":"disappear"},{"a":"set","name":"kphant1__2b","state":98,"visible":1,"click":0},{"a":"artstate","name":"kphant1__1c","state":"disappear"},{"a":"set","name":"kphant1__1c","state":98,"visible":1,"click":0},{"a":"artstate","name":"kphant1__2c","state":"disappear"},{"a":"set","name":"kphant1__2c","state":98,"visible":1,"click":0},{"a":"artstate","name":"kphant1__3c","state":"disappear"},{"a":"set","name":"kphant1__3c","state":98,"visible":1,"click":0},{"a":"artstate","name":"kphant2__1a","state":"disappear"},{"a":"set","name":"kphant2__1a","state":98,"visible":1,"click":0},{"a":"artstate","name":"kphant2__2a","state":"disappear"},{"a":"set","name":"kphant2__2a","state":98,"visible":1,"click":0},{"a":"artstate","name":"kphant2__1b","state":"disappear"},{"a":"set","name":"kphant2__1b","state":98,"visible":1,"click":0},{"a":"artstate","name":"kphant2__1c","state":"disappear"},{"a":"set","name":"kphant2__1c","state":98,"visible":1,"click":0},{"a":"artstate","name":"kphant2__2c","state":"disappear"},{"a":"set","name":"kphant2__2c","state":98,"visible":1,"click":0},{"a":"artstate","name":"kphant2__3c","state":"disappear"},{"a":"set","name":"kphant2__3c","state":98,"visible":1,"click":0},{"a":"set","name":"bseedpile5","state":99,"visible":0,"click":0},{"a":"show","name":"bseedpile5t","click":0},{"a":"xp","amount":200,"name":"{phantom}"},{"a":"wait","ms":1240},{"a":"show","name":"alarmlights","click":0},{"a":"set","name":"alarmloop1","state":0,"visible":0,"click":0},{"a":"set","name":"alarmloop2","state":0,"visible":0,"click":0},{"a":"set","name":"alarmloop3","state":0,"visible":0,"click":0},{"a":"set","name":"alarmloop4","state":0,"visible":0,"click":0},{"a":"set","name":"key_final","state":0,"visible":1,"click":1},{"a":"show","name":"lock_final","click":1},{"a":"send","cmd":"qicon","fields":"keyfinalicon|1"},{"a":"send","cmd":"qmusic","fields":"0"},{"a":"send","cmd":"qmusic","fields":"ajq_musphntmcreepy"},{"a":"goal","str":15958},{"a":"var","name":"kphant_off","value":99},{"a":"set","name":"kphant1__1a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__2a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__3a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__4a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__1b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__2b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__3b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__4b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__1c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__2c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__3c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__4c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__5c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__6c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__1d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__2d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__3d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__4d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__5d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__6d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__1a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__2a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__3a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__4a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__1b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__2b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__3b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__4b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__1c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__2c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__3c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__4c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__5c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__6c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__1d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__2d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__3d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__4d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__5d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__6d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__1a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__2a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__3a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__4a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__1b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__2b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__3b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__4b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__1c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__2c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__3c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__4c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__5c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__6c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__1d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__2d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__3d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__4d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__5d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant1__6d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__1a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__2a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__3a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__4a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__1b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__2b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__3b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__4b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__1c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__2c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__3c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__4c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__5c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__6c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__1d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__2d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__3d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__4d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__5d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant2__6d","state":99,"visible":0,"click":0}]},{"id":306,"holding":"","when":"eaten","name":"","boss":"boss1b","nth":1,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"send","cmd":"qahs","fields":"{phantom}|87|100|0"}]},{"id":307,"holding":"","when":"eaten","name":"","boss":"boss1b","nth":2,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"set","name":"{phantom}","state":2,"visible":1,"click":1},{"a":"artstate","name":"{phantom}","state":"agro"},{"a":"set","name":"{phantom}","state":4,"visible":1,"click":1},{"a":"send","cmd":"qahs","fields":"{phantom}|75|100|0"},{"a":"wait","ms":1450},{"a":"var","name":"spawner2","value":"{count}"},{"a":"artstate","name":"kphant2__1a","state":"appear"},{"a":"path","name":"kphant2__1a","path":"bpath2a"},{"a":"show","name":"kphant2__1a","click":1},{"a":"artstate","name":"kphant2__2a","state":"appear"},{"a":"path","name":"kphant2__2a","path":"bpath2c"},{"a":"show","name":"kphant2__2a","click":1},{"a":"artstate","name":"kphant2__1a","state":"appear"},{"a":"path","name":"kphant2__1a","path":"bpath2a"},{"a":"show","name":"kphant2__1a","click":1},{"a":"artstate","name":"kphant2__2a","state":"appear"},{"a":"path","name":"kphant2__2a","path":"bpath2c"},{"a":"show","name":"kphant2__2a","click":1},{"a":"sound","sound":"ajq_phantomminispawn"},{"a":"var","name":"spawntimer1b","value":0}]},{"id":308,"holding":"","when":"eaten","name":"","boss":"boss1b","nth":3,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"send","cmd":"qahs","fields":"{phantom}|62|100|0"}]},{"id":309,"holding":"","when":"eaten","name":"","boss":"boss1b","nth":4,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"set","name":"{phantom}","state":5,"visible":1,"click":1},{"a":"artstate","name":"{phantom}","state":"agro"},{"a":"set","name":"{phantom}","state":7,"visible":1,"click":1},{"a":"send","cmd":"qahs","fields":"{phantom}|50|100|0"},{"a":"wait","ms":1210},{"a":"var","name":"spawner2","value":"{count}"},{"a":"artstate","name":"kphant2__1b","state":"appear"},{"a":"path","name":"kphant2__1b","path":"bpath2a"},{"a":"show","name":"kphant2__1b","click":1},{"a":"artstate","name":"kphant2__2b","state":"appear"},{"a":"path","name":"kphant2__2b","path":"bpath2c"},{"a":"show","name":"kphant2__2b","click":1},{"a":"artstate","name":"kphant2__1b","state":"appear"},{"a":"path","name":"kphant2__1b","path":"bpath2a"},{"a":"show","name":"kphant2__1b","click":1},{"a":"artstate","name":"kphant2__2b","state":"appear"},{"a":"path","name":"kphant2__2b","path":"bpath2c"},{"a":"show","name":"kphant2__2b","click":1},{"a":"sound","sound":"ajq_phantomminispawn"},{"a":"var","name":"spawntimer1b","value":0},{"a":"wait","ms":1000},{"a":"var","name":"seeddelay","value":0}]},{"id":310,"holding":"","when":"eaten","name":"","boss":"boss1b","nth":5,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"send","cmd":"qahs","fields":"{phantom}|37|100|0"}]},{"id":311,"holding":"","when":"eaten","name":"","boss":"boss1b","nth":6,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"set","name":"{phantom}","state":8,"visible":1,"click":1},{"a":"artstate","name":"{phantom}","state":"agro"},{"a":"set","name":"{phantom}","state":10,"visible":1,"click":1},{"a":"send","cmd":"qahs","fields":"{phantom}|25|100|0"},{"a":"wait","ms":1170},{"a":"var","name":"spawner2","value":"{count}"},{"a":"artstate","name":"kphant2__1c","state":"appear"},{"a":"path","name":"kphant2__1c","path":"bpath2a"},{"a":"show","name":"kphant2__1c","click":1},{"a":"artstate","name":"kphant2__2c","state":"appear"},{"a":"path","name":"kphant2__2c","path":"bpath2b"},{"a":"show","name":"kphant2__2c","click":1},{"a":"artstate","name":"kphant2__3c","state":"appear"},{"a":"path","name":"kphant2__3c","path":"bpath2c"},{"a":"show","name":"kphant2__3c","click":1},{"a":"artstate","name":"kphant2__1c","state":"appear"},{"a":"path","name":"kphant2__1c","path":"bpath2a"},{"a":"show","name":"kphant2__1c","click":1},{"a":"artstate","name":"kphant2__2c","state":"appear"},{"a":"path","name":"kphant2__2c","path":"bpath2b"},{"a":"show","name":"kphant2__2c","click":1},{"a":"artstate","name":"kphant2__3c","state":"appear"},{"a":"path","name":"kphant2__3c","path":"bpath2c"},{"a":"show","name":"kphant2__3c","click":1},{"a":"sound","sound":"ajq_phantomminispawn"},{"a":"var","name":"spawntimer1b","value":0}]},{"id":312,"holding":"","when":"eaten","name":"","boss":"boss1b","nth":7,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"send","cmd":"qahs","fields":"{phantom}|12|100|0"}]},{"id":313,"holding":"","when":"eaten","name":"","boss":"boss1b","nth":8,"once":false,"dies":[100,1],"actions":[{"a":"var","name":"dedboss","value":"{count}"},{"a":"var","name":"70_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure7-thesearchforgreely/#70-defeatedfirstboss/#0#001"},{"a":"var","name":"70_uri","value":99},{"a":"xp","amount":200,"name":"{phantom}"}]},{"id":314,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["factory#__#_"],"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_d|200|42|3|25|null|null|null"}]},{"id":315,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["factory#"],"actions":[{"a":"xp","amount":5,"name":"{phantom}"}]},{"id":316,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["phantom#"],"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_gem|200|42|3|25|null|null|null"},{"a":"xp","amount":5,"name":"{phantom}"},{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":317,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["pod#"],"actions":[{"a":"xp","amount":5,"name":"{phantom}"},{"a":"set","name":"{phantom}blok","state":99,"visible":0,"click":0}]},{"id":318,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["pod#"],"unlessMembers":["pod16","pod12","pod18"],"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_gem|200|42|3|15|null|null|null"}]},{"id":319,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["phantom__#"],"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_gem|200|42|3|25|null|null|null"},{"a":"xp","amount":5,"name":"{phantom}"},{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":320,"holding":"","when":"eaten","name":"","member":"factory04","nth":0,"once":false,"actions":[{"a":"set","name":"fact04blok","state":99,"visible":0,"click":0}]},{"id":321,"holding":"","when":"eaten","name":"","member":"factory05","nth":0,"once":false,"actions":[{"a":"set","name":"fact05blok","state":99,"visible":0,"click":0}]},{"id":322,"holding":"","when":"eaten","name":"","member":"pod16","nth":0,"once":false,"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_gem|200|42|3|10|null|null|null"}]},{"id":323,"holding":"","when":"eaten","name":"","member":"factory06","nth":0,"once":false,"actions":[{"a":"set","name":"fact06blok","state":99,"visible":0,"click":0}]},{"id":324,"holding":"","when":"eaten","name":"","member":"factory07","nth":0,"once":false,"actions":[{"a":"set","name":"fact07blok","state":99,"visible":0,"click":0}]},{"id":325,"holding":"","when":"eaten","name":"","member":"pod12","nth":0,"once":false,"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_gem|200|42|3|5|null|null|null"}]},{"id":326,"holding":"","when":"eaten","name":"","member":"pod18","nth":0,"once":false,"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_gem|200|42|3|10|null|null|null"}]},{"id":327,"holding":"","when":"eaten","name":"","member":"web03","nth":0,"once":false,"actions":[{"a":"xp","amount":5,"name":"{phantom}"},{"a":"hide","name":"{phantom}blok"}]},{"id":328,"holding":"","when":"eaten","name":"","member":"factory03__2_","nth":0,"once":false,"actions":[{"a":"xp","amount":5,"name":"{phantom}"},{"a":"set","name":"fact03blok","state":99,"visible":0,"click":0}]},{"id":329,"holding":"","when":"eaten","name":"","member":"kphant2__2b","nth":0,"once":false,"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_gem|200|42|3|25|null|null|null"},{"a":"xp","amount":5,"name":"{phantom}"},{"a":"set","name":"{phantom}","state":3,"visible":1,"click":0}]}],"written":"2018-01-05 23:48:55","spawners":{"factory04":[11,2],"factory05":[11,2],"factory06":[11,2],"factory03":[11,2],"factory02":[11,2],"factory01":[11,2]},"eat":{"factory04__0_":[50,1],"factory04":[1,1],"factory05":[1,1],"factory05__0_":[50,1],"phantom12":[50,1],"factory06__0_":[50,1],"pod16":[20,1],"factory06":[1,1],"factory07":[1,1],"factory06__1_":[50,1],"phantom10":[50,1],"pod15":[50,1],"pod12":[50,1],"pod11":[40,1],"pod13":[50,1],"phantom09":[50,1],"pod18":[40,1],"pod17":[50,1],"phantom25":[50,1],"web03":[50,1],"factory03__1_":[50,1],"factory03":[1,1],"factory03__0_":[50,1],"factory03__2_":[50,1],"phantom__02":[50,1],"phantom__03":[50,1],"phantom05":[50,1],"pod05":[50,1],"pod07":[50,1],"phantom06":[50,1],"phantom07":[50,1],"phantom08":[50,1],"phantom24":[50,1],"phantom__22":[50,1],"phantom__21":[50,1],"phantom__23":[50,1],"phantom__20":[50,1],"factory01__0_":[50,1],"kphant2__2b":[50,1],"boss1b":[100,1],"boss1a":[100,1]},"bars":[],"variantGroups":["kphant1__3|","kphant2__3|"],"countRules":[{"counter":"lockcount","value":1,"actions":[{"a":"goal","str":15838},{"a":"show","name":"greelycage","click":0},{"a":"var","name":"30_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure7-thesearchforgreely/#30-unlockfirstlock/#0#001"},{"a":"var","name":"30_uri","value":99}]},{"counter":"lockcount","value":2,"actions":[{"a":"goal","str":15839},{"a":"set","name":"greelycage","state":2,"visible":1,"click":0},{"a":"var","name":"40_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure7-thesearchforgreely/#40-unlocksecondlock/#0#001"},{"a":"var","name":"40_uri","value":99}]},{"counter":"lockcount","value":3,"actions":[{"a":"goal","str":15840},{"a":"set","name":"greelycage","state":3,"visible":1,"click":0},{"a":"var","name":"50_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure7-thesearchforgreely/#50-unlockthirdlock/#0#001"},{"a":"var","name":"50_uri","value":99}]},{"counter":"lockcount","value":4,"actions":[{"a":"set","name":"greelycage","state":4,"visible":1,"click":0},{"a":"set","name":"alarmlights","state":0,"visible":1,"click":0},{"a":"show","name":"alarmloop1","click":0},{"a":"show","name":"alarmloop2","click":0},{"a":"show","name":"alarmloop3","click":0},{"a":"show","name":"alarmloop4","click":0},{"a":"show","name":"all2boss1","click":1},{"a":"var","name":"60_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure7-thesearchforgreely/#60-unlockfourthlock/#0#001"},{"a":"var","name":"60_uri","value":99},{"a":"send","cmd":"qmusic","fields":"0"},{"a":"set","name":"alarmloop1","state":0,"visible":0,"click":0},{"a":"set","name":"alarmloop2","state":0,"visible":0,"click":0},{"a":"set","name":"alarmloop3","state":0,"visible":0,"click":0},{"a":"set","name":"alarmloop4","state":0,"visible":0,"click":0},{"a":"set","name":"cp4","state":0,"visible":1,"click":0},{"a":"set","name":"cp5","state":0,"visible":1,"click":0},{"a":"set","name":"chqpoint04lp","state":0,"visible":1,"click":0},{"a":"set","name":"chqpoint05lp","state":0,"visible":1,"click":0},{"a":"var","name":"___tst","value":1},{"a":"cutscene","swf":"2680","extra":"null|null"},{"a":"show","name":"all2boss","click":1}]},{"counter":"seedcount","value":4,"actions":[{"a":"set","name":"bseedpile2t","state":0,"visible":1,"click":0},{"a":"set","name":"bseedpile2","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer2","value":0},{"a":"var","name":"seedtimer4","value":0}]},{"counter":"seedcount","value":7,"actions":[{"a":"var","name":"seedtimer4","value":0}]},{"counter":"seedcount","value":9,"actions":[{"a":"set","name":"bseedpile5t","state":0,"visible":1,"click":0},{"a":"set","name":"bseedpile5","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer5","value":0}]}],"puzzles":[],"bosses":["boss1a","boss1b"]}
*/
