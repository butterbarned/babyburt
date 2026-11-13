"use strict";

// Recorded adventure 19, made with the adventure script maker. Plays in adventures.room_adventure_4a, adventures.room_adventure_4b.
// To change it, open this file in the maker. Edits made by hand are kept only
// until the maker writes the file again. By hand here (marked "by hand"): Cosmo's
// answers, the chests, every pod, brazier and seed pile.

// true the first time for each key, false after: for steps that must happen once
const once = (q, key) => {
  q.vars.done = q.vars.done || new Set();
  if (q.vars.done.has(key)) {
    return false;
  }
  q.vars.done.add(key);
  return true;
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
  if (key === "lavacount 1") {
    set(q, "cosmo2", 5, 1, 1);
    q.send("qcmd", 3, 0, "cosmo2", 5, 3887);
  }
  if (key === "lavacount 2") {
    set(q, "cosmo2", 6, 1, 1);
    q.send("qcmd", 3, 0, "cosmo2", 6, 3908);
  }
  if (key === "lavacount 3") {
    set(q, "cosmo2", 7, 1, 1);
    q.send("qcmd", 3, 0, "cosmo2", 7, 3910);
  }
  if (key === "lavacount 4") {
    q.send("qswfs", "phantom__1a", "disappear");
    set(q, "phantom__1a", 98, 1, 0);
    q.send("qswfs", "phantom_2", "disappear");
    set(q, "phantom_2", 98, 1, 0);
    q.send("qswfs", "phantom__3a", "disappear");
    set(q, "phantom__3a", 98, 1, 0);
    q.send("qswfs", "phantom_4", "disappear");
    set(q, "phantom_4", 98, 1, 0);
    q.send("qswfs", "phantom_4f", "disappear");
    set(q, "phantom_4f", 98, 1, 0);
    q.send("qswfs", "phantom_5", "disappear");
    set(q, "phantom_5", 98, 1, 0);
    q.send("qswfs", "phantom_6", "disappear");
    set(q, "phantom_6", 98, 1, 0);
    q.send("qswfs", "phantom_6f", "disappear");
    set(q, "phantom_6f", 98, 1, 0);
    q.send("qswfs", "phantom_7", "disappear");
    set(q, "phantom_7", 98, 1, 0);
    q.send("qswfs", "phantom_7f", "disappear");
    set(q, "phantom_7f", 98, 1, 0);
    q.send("qswfs", "phantom_8", "disappear");
    set(q, "phantom_8", 98, 1, 0);
    q.send("qswfs", "phantom_8f", "disappear");
    set(q, "phantom_8f", 98, 1, 0);
    q.send("qswfs", "phantom_11", "disappear");
    set(q, "phantom_11", 98, 1, 0);
    q.send("qswfs", "phantom_12", "disappear");
    set(q, "phantom_12", 98, 1, 0);
    q.send("qswfs", "phantom_13", "disappear");
    set(q, "phantom_13", 98, 1, 0);
    q.send("qswfs", "phantom_14", "disappear");
    set(q, "phantom_14", 98, 1, 0);
    q.send("qswfs", "phantom_15", "disappear");
    set(q, "phantom_15", 98, 1, 0);
    q.send("qswfs", "phantom_16", "disappear");
    set(q, "phantom_16", 98, 1, 0);
    q.send("qswfs", "phantom_17", "disappear");
    set(q, "phantom_17", 98, 1, 0);
    q.send("qswfs", "phantom_18", "disappear");
    set(q, "phantom_18", 98, 1, 0);
    q.send("qswfs", "phantom_18f", "disappear");
    set(q, "phantom_18f", 98, 1, 0);
    q.send("qswfs", "phantom_19", "disappear");
    set(q, "phantom_19", 98, 1, 0);
    q.send("qswfs", "phantom_19f", "disappear");
    set(q, "phantom_19f", 98, 1, 0);
    q.send("qswfs", "phantom_20", "disappear");
    set(q, "phantom_20", 98, 1, 0);
    q.send("qswfs", "phantom_20f", "disappear");
    set(q, "phantom_20f", 98, 1, 0);
    q.send("qswfs", "phantom_21", "disappear");
    set(q, "phantom_21", 98, 1, 0);
    q.send("qswfs", "phantom_21f", "disappear");
    set(q, "phantom_21f", 98, 1, 0);
    q.send("qswfs", "phantom__22a", "disappear");
    set(q, "phantom__22a", 98, 1, 0);
    q.send("qswfs", "phantom_23", "disappear");
    set(q, "phantom_23", 98, 1, 0);
    q.send("qswfs", "phantom_23f", "disappear");
    set(q, "phantom_23f", 98, 1, 0);
    q.send("qswfs", "phantom_24", "disappear");
    set(q, "phantom_24", 98, 1, 0);
    q.send("qswfs", "phantom_25", "disappear");
    set(q, "phantom_25", 98, 1, 0);
    q.send("qswfs", "phantom_26", "disappear");
    set(q, "phantom_26", 98, 1, 0);
    q.send("qswfs", "phantom_27", "disappear");
    set(q, "phantom_27", 98, 1, 0);
    q.send("qswfs", "phantom_28f", "disappear");
    set(q, "phantom_28f", 98, 1, 0);
    set(q, "cosmo2", 8, 1, 1);
    q.send("qcmd", 3, 0, "cosmo2", 8, 3912);
    q.xp(25, "lavacount");
    set(q, "phantom__1a", 99, 0, 0);
    set(q, "phantom_2", 99, 0, 0);
    set(q, "phantom__3a", 99, 0, 0);
    set(q, "phantom_4", 99, 0, 0);
    set(q, "phantom_4f", 99, 0, 0);
    set(q, "phantom_5", 99, 0, 0);
    set(q, "phantom_6", 99, 0, 0);
    set(q, "phantom_6f", 99, 0, 0);
    set(q, "phantom_7", 99, 0, 0);
    set(q, "phantom_7f", 99, 0, 0);
    set(q, "phantom_8", 99, 0, 0);
    set(q, "phantom_8f", 99, 0, 0);
    set(q, "phantom_11", 99, 0, 0);
    set(q, "phantom_12", 99, 0, 0);
    set(q, "phantom_13", 99, 0, 0);
    set(q, "phantom_14", 99, 0, 0);
    set(q, "phantom_15", 99, 0, 0);
    set(q, "phantom_16", 99, 0, 0);
    set(q, "phantom_17", 99, 0, 0);
    set(q, "phantom_18", 99, 0, 0);
    set(q, "phantom_18f", 99, 0, 0);
    set(q, "phantom_19", 99, 0, 0);
    set(q, "phantom_19f", 99, 0, 0);
    set(q, "phantom_20", 99, 0, 0);
    set(q, "phantom_20f", 99, 0, 0);
    set(q, "phantom_21", 99, 0, 0);
    set(q, "phantom_21f", 99, 0, 0);
    set(q, "phantom__22a", 99, 0, 0);
    set(q, "phantom_23", 99, 0, 0);
    set(q, "phantom_23f", 99, 0, 0);
    set(q, "phantom_24", 99, 0, 0);
    set(q, "phantom_25", 99, 0, 0);
    set(q, "phantom_26", 99, 0, 0);
    set(q, "phantom_27", 99, 0, 0);
    set(q, "phantom_28f", 99, 0, 0);
  }
};
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

// by hand: the gems each pod gave in the recording (any other: 5, 10 or 15)
const POD_GEMS = {"pod2": 15, "pod24": 5, "pod3": 5, "pod3e": 5, "pod13": 5, "pod14": 10, "pod19e": 15, "pod16": 5, "pod20": 15, "pod21": 5, "pod23": 5, "pod22": 15, "pod19": 10, "pod18": 15, "pod17": 10, "pod59": 10, "pod26": 10, "pod27": 10, "pod6": 10, "pod39": 10, "pod4": 5, "pod28": 10, "pod29": 5, "pod31e": 15, "pod31": 5, "pod5": 5, "pod5e": 10, "pod37": 15, "pod38": 15, "pod40": 15, "pod35": 10, "pod41": 10, "pod7": 5};
// by hand: the animal passages' chests' clothing (lib/prize-pools.js)
const {passageClothing} = require("../prize-pools.js");

module.exports = {
  defId: 19,
  title: "The Hive",
  rooms: {
    start: {room: "adventures.room_adventure_4a", name: "Adventure Tutorial", nameStringId: 18326, music: "ajq_musdungeon"},
    bossenter3: {room: "adventures.room_adventure_4b", name: "Adventure Tutorial", nameStringId: 18326, music: "ajq_muscavebossbattle"},
  },
  written: "2026-11-11 18:09:52",
  objective: 3924,
  lobby: true, // the "waiting for players" screen first, as on the official server

  // name, type, def, state, visible, needs a click, path, artwork state
  actors: [
    ["queststart", 18, 0, 0, 1, 1, "", ""],
    ["questready", 7, 0, 0, 1, 1, "", ""],
    ["start_init", 8, 0, 0, 0, 1, "", ""],
    ["players", 7, 0, 0, 1, 1, "", ""],
    ["00_uri", 7, 0, 0, 0, 1, "", ""],
    ["cp1e", 27, 0, 0, 1, 1, "", ""],
    ["cp2e", 27, 0, 0, 1, 1, "", ""],
    ["greely1", 1, 22, 0, 0, 1, "", ""],
    ["greely1hide", 8, 0, 0, 0, 1, "", ""],
    ["greelytrig", 3, 0, 0, 1, 1, "", ""],
    ["cosmo1", 1, 25, 0, 1, 1, "", "appear"],
    ["cosmo1hide", 8, 0, 0, 0, 1, "", ""],
    ["cosmo1e", 1, 25, 0, 1, 1, "", "appear"],
    ["cosmo1ehide", 8, 0, 0, 0, 1, "", ""],
    ["cosmo2", 1, 25, 0, 1, 1, "", "appear"],
    ["10_uri", 7, 0, 0, 0, 1, "", ""],
    ["20_uri", 7, 0, 0, 0, 1, "", ""],
    ["30_uri", 7, 0, 0, 0, 1, "", ""],
    ["40_uri", 7, 0, 0, 0, 1, "", ""],
    ["50_uri", 7, 0, 0, 0, 1, "", ""],
    ["cosmo2hide", 8, 0, 0, 0, 1, "", ""],
    ["cosmo2vol", 3, 0, 0, 1, 1, "", ""],
    ["exitblock0", 5, 0, 0, 1, 1, "", ""],
    ["blockvol_e", 5, 0, 0, 1, 1, "", ""],
    ["exitvol0", 3, 0, 0, 1, 1, "", ""],
    ["teletimer", 8, 0, 0, 0, 1, "", ""],
    ["cosmo3", 1, 25, 0, 1, 1, "", "appear"],
    ["gifttimer", 8, 0, 0, 0, 1, "", ""],
    ["bossenter3", 9, 1, 0, 1, 1, "", ""],
    ["start_e", 9, 0, 0, 1, 1, "", ""],
    ["lavatrig1", 1, 87, 0, 1, 1, "", ""],
    ["lavatrig2", 1, 87, 0, 1, 1, "", ""],
    ["lavatrig3", 1, 87, 0, 1, 1, "", ""],
    ["lavatrig4", 1, 87, 0, 1, 1, "", ""],
    ["lavacount", 7, 0, 0, 0, 1, "", ""],
    ["teleportking", 3, 0, 0, 0, 1, "", ""],
    ["pod3", 23, 151, 0, 1, 1, "", ""],
    ["pod1", 23, 151, 0, 1, 1, "", ""],
    ["pod2", 23, 151, 0, 1, 1, "", ""],
    ["pod3e", 23, 151, 0, 1, 1, "", ""],
    ["pod4", 23, 151, 0, 1, 1, "", ""],
    ["pod5", 23, 151, 0, 1, 1, "", ""],
    ["pod5e", 23, 151, 0, 1, 1, "", ""],
    ["pod6", 23, 151, 0, 1, 1, "", ""],
    ["pod7", 23, 151, 0, 1, 1, "", ""],
    ["pod8", 23, 151, 0, 1, 1, "", ""],
    ["pod9", 23, 151, 0, 1, 1, "", ""],
    ["pod10", 23, 151, 0, 1, 1, "", ""],
    ["pod11", 23, 151, 0, 1, 1, "", ""],
    ["pod12", 23, 151, 0, 1, 1, "", ""],
    ["pod13", 23, 151, 0, 1, 1, "", ""],
    ["pod14", 23, 151, 0, 1, 1, "", ""],
    ["pod16", 23, 151, 0, 1, 1, "", ""],
    ["pod17", 23, 151, 0, 1, 1, "", ""],
    ["pod18", 23, 151, 0, 1, 1, "", ""],
    ["pod19", 23, 151, 0, 1, 1, "", ""],
    ["pod19e", 23, 151, 0, 1, 1, "", ""],
    ["pod20", 23, 151, 0, 1, 1, "", ""],
    ["pod21", 23, 151, 0, 1, 1, "", ""],
    ["pod22", 23, 151, 0, 1, 1, "", ""],
    ["pod23", 23, 151, 0, 1, 1, "", ""],
    ["pod24", 23, 151, 0, 1, 1, "", ""],
    ["pod25", 23, 151, 0, 1, 1, "", ""],
    ["pod26", 23, 151, 0, 1, 1, "", ""],
    ["pod27", 23, 151, 0, 1, 1, "", ""],
    ["pod28", 23, 151, 0, 1, 1, "", ""],
    ["pod29", 23, 151, 0, 1, 1, "", ""],
    ["pod30", 23, 151, 0, 1, 1, "", ""],
    ["pod31", 23, 151, 0, 1, 1, "", ""],
    ["pod31e", 23, 151, 0, 1, 1, "", ""],
    ["pod35", 23, 151, 0, 1, 1, "", ""],
    ["pod37", 23, 151, 0, 1, 1, "", ""],
    ["pod38", 23, 151, 0, 1, 1, "", ""],
    ["pod39", 23, 151, 0, 1, 1, "", ""],
    ["pod40", 23, 151, 0, 1, 1, "", ""],
    ["pod41", 23, 151, 0, 1, 1, "", ""],
    ["pod43", 23, 151, 0, 1, 1, "", ""],
    ["pod44", 23, 151, 0, 1, 1, "", ""],
    ["pod45", 23, 151, 0, 1, 1, "", ""],
    ["pod46", 23, 151, 0, 1, 1, "", ""],
    ["pod48", 23, 151, 0, 1, 1, "", ""],
    ["pod49", 23, 151, 0, 1, 1, "", ""],
    ["pod51", 23, 151, 0, 1, 1, "", ""],
    ["pod59", 23, 151, 0, 1, 1, "", ""],
    ["lightme", 2, 0, 0, 1, 1, "", ""],
    ["hard", 2, 0, 0, 1, 1, "", ""],
    ["easy", 2, 0, 0, 1, 1, "", ""],
    ["random1", 2, 0, 0, 1, 1, "", ""],
    ["exitportal", 2, 0, 0, 1, 1, "", ""],
    ["bridge1", 2, 0, 0, 1, 1, "", ""],
    ["bridge2", 2, 0, 0, 1, 1, "", ""],
    ["bridge4", 2, 0, 0, 1, 1, "", ""],
    ["bridge5", 2, 0, 0, 1, 1, "", ""],
    ["bridge6", 2, 0, 0, 1, 1, "", ""],
    ["bridge7", 2, 0, 0, 1, 1, "", ""],
    ["bridge9", 2, 0, 0, 1, 1, "", ""],
    ["bridge10", 2, 0, 0, 1, 1, "", ""],
    ["bridge11", 2, 0, 0, 1, 1, "", ""],
    ["bridge12", 2, 0, 0, 1, 1, "", ""],
    ["bridge13", 2, 0, 0, 1, 1, "", ""],
    ["bridge14", 2, 0, 0, 1, 1, "", ""],
    ["bridge15", 2, 0, 0, 1, 1, "", ""],
    ["bridge17", 2, 0, 0, 1, 1, "", ""],
    ["bridge19", 2, 0, 0, 1, 1, "", ""],
    ["bridge20", 2, 0, 0, 1, 1, "", ""],
    ["bridge21", 2, 0, 0, 1, 1, "", ""],
    ["bridge22", 2, 0, 0, 1, 1, "", ""],
    ["bridge23", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier1", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier2", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier4", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier5", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier6", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier7", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier9", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier10", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier10b", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier11", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier12", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier13", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier13b", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier14", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier15", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier17", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier19", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier20", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier21", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier22", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier23", 2, 0, 0, 1, 1, "", ""],
    ["lavatile1", 2, 0, 0, 1, 1, "", ""],
    ["lavatile2", 2, 0, 0, 1, 1, "", ""],
    ["lavatile3", 2, 0, 0, 1, 1, "", ""],
    ["lavatile4", 2, 0, 0, 1, 1, "", ""],
    ["lava1", 2, 0, 0, 1, 1, "", ""],
    ["lava2", 2, 0, 0, 1, 1, "", ""],
    ["lava3", 2, 0, 0, 1, 1, "", ""],
    ["lava4", 2, 0, 0, 1, 1, "", ""],
    ["lavadoor", 2, 0, 0, 1, 1, "", ""],
    ["avatartile1", 2, 0, 0, 1, 1, "", ""],
    ["avatartile2", 2, 0, 0, 1, 1, "", ""],
    ["pillar1", 2, 0, 0, 1, 1, "", ""],
    ["pillar2", 2, 0, 0, 1, 1, "", ""],
    ["avatar1", 1, 57, 0, 1, 1, "", ""],
    ["avatar2", 1, 58, 0, 1, 1, "", ""],
    ["blocktimer1", 8, 0, 0, 0, 1, "", ""],
    ["blocktimer2", 8, 0, 0, 0, 1, "", ""],
    ["treasure_a1", 13, 39, 0, 1, 1, "", ""],
    ["treasure_a2", 13, 39, 0, 1, 1, "", ""],
    ["torch", 17, 2045, 0, 1, 1, "", ""],
    ["torch1", 1, 134, 0, 1, 1, "", ""],
    ["torch2", 1, 134, 0, 1, 1, "", ""],
    ["torch3", 1, 134, 0, 1, 1, "", ""],
    ["torch4", 1, 134, 0, 1, 1, "", ""],
    ["brazier1", 1, 86, 0, 1, 1, "", ""],
    ["brazier2", 1, 86, 0, 1, 1, "", ""],
    ["brazier4", 1, 86, 0, 1, 1, "", ""],
    ["brazier5", 1, 86, 0, 1, 1, "", ""],
    ["brazier6", 1, 86, 0, 1, 1, "", ""],
    ["brazier7", 1, 86, 0, 1, 1, "", ""],
    ["brazier9", 1, 86, 0, 1, 1, "", ""],
    ["brazier10", 1, 86, 0, 1, 1, "", ""],
    ["brazier10b", 1, 86, 0, 1, 1, "", ""],
    ["brazier11", 1, 86, 0, 1, 1, "", ""],
    ["brazier12", 1, 86, 0, 1, 1, "", ""],
    ["brazier13", 1, 86, 0, 1, 1, "", ""],
    ["brazier13b", 1, 86, 0, 1, 1, "", ""],
    ["brazier14", 1, 86, 0, 1, 1, "", ""],
    ["brazier15", 1, 86, 0, 1, 1, "", ""],
    ["brazier17", 1, 86, 0, 1, 1, "", ""],
    ["brazier19", 1, 86, 0, 1, 1, "", ""],
    ["brazier20", 1, 86, 0, 1, 1, "", ""],
    ["brazier21", 1, 86, 0, 1, 1, "", ""],
    ["brazier22", 1, 86, 0, 1, 1, "", ""],
    ["brazier23", 1, 86, 0, 1, 1, "", ""],
    ["bridgewait1", 8, 0, 0, 0, 1, "", ""],
    ["bridgewait2", 8, 0, 0, 0, 1, "", ""],
    ["bridgewait4", 8, 0, 0, 0, 1, "", ""],
    ["bridgewait5", 8, 0, 0, 0, 1, "", ""],
    ["bridgewait6", 8, 0, 0, 0, 1, "", ""],
    ["bridgewait7", 8, 0, 0, 0, 1, "", ""],
    ["bridgewait9", 8, 0, 0, 0, 1, "", ""],
    ["bridgewait10", 8, 0, 0, 0, 1, "", ""],
    ["bridgewait11", 8, 0, 0, 0, 1, "", ""],
    ["bridgewait12", 8, 0, 0, 0, 1, "", ""],
    ["bridgewait13", 8, 0, 0, 0, 1, "", ""],
    ["bridgewait14", 8, 0, 0, 0, 1, "", ""],
    ["bridgewait15", 8, 0, 0, 0, 1, "", ""],
    ["bridgewait17", 8, 0, 0, 0, 1, "", ""],
    ["bridgewait19", 8, 0, 0, 0, 1, "", ""],
    ["bridgewait20", 8, 0, 0, 0, 1, "", ""],
    ["bridgewait21", 8, 0, 0, 0, 1, "", ""],
    ["bridgewait22", 8, 0, 0, 0, 1, "", ""],
    ["bridgewait23", 8, 0, 0, 0, 1, "", ""],
    ["brazierlit1", 1, 116, 0, 1, 1, "", ""],
    ["brazierlit2", 1, 116, 0, 1, 1, "", ""],
    ["brazierlit4", 1, 116, 0, 1, 1, "", ""],
    ["brazierlit5", 1, 116, 0, 1, 1, "", ""],
    ["brazierlit6", 1, 116, 0, 1, 1, "", ""],
    ["brazierlit7", 1, 116, 0, 1, 1, "", ""],
    ["brazierlit9", 1, 116, 0, 1, 1, "", ""],
    ["brazierlit10", 1, 116, 0, 1, 1, "", ""],
    ["brazierli10b", 1, 116, 0, 1, 1, "", ""],
    ["brazierlit11", 1, 116, 0, 1, 1, "", ""],
    ["brazierlit12", 1, 116, 0, 1, 1, "", ""],
    ["brazierlit13", 1, 116, 0, 1, 1, "", ""],
    ["brazierli13b", 1, 116, 0, 1, 1, "", ""],
    ["brazierlit14", 1, 116, 0, 1, 1, "", ""],
    ["brazierlit15", 1, 116, 0, 1, 1, "", ""],
    ["brazierlit17", 1, 116, 0, 1, 1, "", ""],
    ["brazierlit19", 1, 116, 0, 1, 1, "", ""],
    ["brazierlit20", 1, 116, 0, 1, 1, "", ""],
    ["brazierlit21", 1, 116, 0, 1, 1, "", ""],
    ["brazierlit22", 1, 116, 0, 1, 1, "", ""],
    ["brazierlit23", 1, 116, 0, 1, 1, "", ""],
    ["blockbridg1", 5, 0, 0, 1, 1, "", ""],
    ["blockbridg2", 5, 0, 0, 1, 1, "", ""],
    ["blockbridg4", 5, 0, 0, 1, 1, "", ""],
    ["blockbridg5", 5, 0, 0, 1, 1, "", ""],
    ["blockbridg6", 5, 0, 0, 1, 1, "", ""],
    ["blockbridg7", 5, 0, 0, 1, 1, "", ""],
    ["blockbridg9", 5, 0, 0, 1, 1, "", ""],
    ["blockbridg10", 5, 0, 0, 1, 1, "", ""],
    ["blockbridg11", 5, 0, 0, 1, 1, "", ""],
    ["blockbridg12", 5, 0, 0, 1, 1, "", ""],
    ["blockbridg13", 5, 0, 0, 1, 1, "", ""],
    ["blockbridg14", 5, 0, 0, 1, 1, "", ""],
    ["blockbridg15", 5, 0, 0, 1, 1, "", ""],
    ["blockbridg17", 5, 0, 0, 1, 1, "", ""],
    ["blockbridg19", 5, 0, 0, 1, 1, "", ""],
    ["blockbridg20", 5, 0, 0, 1, 1, "", ""],
    ["blockbridg21", 5, 0, 0, 1, 1, "", ""],
    ["blockbridg22", 5, 0, 0, 1, 1, "", ""],
    ["blockbridg23", 5, 0, 0, 1, 1, "", ""],
    ["blockweb1", 5, 0, 0, 1, 1, "", ""],
    ["blockweb2", 5, 0, 0, 1, 1, "", ""],
    ["avatarblock1", 5, 0, 0, 1, 1, "", ""],
    ["avatarblock2", 5, 0, 0, 1, 1, "", ""],
    ["podvol1", 5, 0, 0, 1, 1, "", ""],
    ["podvol2", 5, 0, 0, 1, 1, "", ""],
    ["podvol3", 5, 0, 0, 1, 1, "", ""],
    ["podvol3e", 5, 0, 0, 1, 1, "", ""],
    ["podvol4", 5, 0, 0, 1, 1, "", ""],
    ["podvol5", 5, 0, 0, 1, 1, "", ""],
    ["podvol5e", 5, 0, 0, 1, 1, "", ""],
    ["podvol6", 5, 0, 0, 1, 1, "", ""],
    ["podvol7", 5, 0, 0, 1, 1, "", ""],
    ["podvol8", 5, 0, 0, 1, 1, "", ""],
    ["podvol9", 5, 0, 0, 1, 1, "", ""],
    ["podvol10", 5, 0, 0, 1, 1, "", ""],
    ["podvol11", 5, 0, 0, 1, 1, "", ""],
    ["podvol12", 5, 0, 0, 1, 1, "", ""],
    ["podvol13", 5, 0, 0, 1, 1, "", ""],
    ["podvol14", 5, 0, 0, 1, 1, "", ""],
    ["podvol16", 5, 0, 0, 1, 1, "", ""],
    ["podvol17", 5, 0, 0, 1, 1, "", ""],
    ["podvol18", 5, 0, 0, 1, 1, "", ""],
    ["podvol19", 5, 0, 0, 1, 1, "", ""],
    ["podvol19e", 5, 0, 0, 1, 1, "", ""],
    ["podvol20", 5, 0, 0, 1, 1, "", ""],
    ["podvol21", 5, 0, 0, 1, 1, "", ""],
    ["podvol22", 5, 0, 0, 1, 1, "", ""],
    ["podvol23", 5, 0, 0, 1, 1, "", ""],
    ["podvol24", 5, 0, 0, 1, 1, "", ""],
    ["podvol25", 5, 0, 0, 1, 1, "", ""],
    ["podvol26", 5, 0, 0, 1, 1, "", ""],
    ["podvol27", 5, 0, 0, 1, 1, "", ""],
    ["podvol28", 5, 0, 0, 1, 1, "", ""],
    ["podvol29", 5, 0, 0, 1, 1, "", ""],
    ["podvol30", 5, 0, 0, 1, 1, "", ""],
    ["podvol31", 5, 0, 0, 1, 1, "", ""],
    ["podvol31e", 5, 0, 0, 1, 1, "", ""],
    ["podvol35", 5, 0, 0, 1, 1, "", ""],
    ["podvol37", 5, 0, 0, 1, 1, "", ""],
    ["podvol38", 5, 0, 0, 1, 1, "", ""],
    ["podvol39", 5, 0, 0, 1, 1, "", ""],
    ["podvol40", 5, 0, 0, 1, 1, "", ""],
    ["podvol41", 5, 0, 0, 1, 1, "", ""],
    ["podvol43", 5, 0, 0, 1, 1, "", ""],
    ["podvol44", 5, 0, 0, 1, 1, "", ""],
    ["podvol45", 5, 0, 0, 1, 1, "", ""],
    ["podvol46", 5, 0, 0, 1, 1, "", ""],
    ["podvol48", 5, 0, 0, 1, 1, "", ""],
    ["podvol49", 5, 0, 0, 1, 1, "", ""],
    ["podvol51", 5, 0, 0, 1, 1, "", ""],
    ["podvol59", 5, 0, 0, 1, 1, "", ""],
    ["exitblock", 5, 0, 0, 1, 1, "", ""],
    ["phantom__1a", 11, 32, 0, 1, 1, "path1", ""],
    ["phantom_2", 11, 32, 0, 1, 1, "path2", ""],
    ["phantom__3a", 11, 32, 0, 1, 1, "path3", ""],
    ["phantom_4", 11, 32, 0, 1, 1, "path4", ""],
    ["phantom_5", 11, 32, 0, 1, 1, "path5", ""],
    ["phantom_6", 11, 32, 0, 1, 1, "path6", ""],
    ["phantom_7", 11, 32, 0, 1, 1, "path7", ""],
    ["phantom_8", 11, 32, 0, 1, 1, "path8", ""],
    ["phantom_11", 11, 32, 0, 1, 1, "path11", ""],
    ["phantom_12", 11, 32, 0, 1, 1, "path12", ""],
    ["phantom_13", 11, 32, 0, 1, 1, "path13", ""],
    ["phantom_14", 11, 32, 0, 1, 1, "path14", ""],
    ["phantom_15", 11, 32, 0, 1, 1, "path15", ""],
    ["phantom_16", 11, 32, 0, 1, 1, "path16", ""],
    ["phantom_17", 11, 32, 0, 1, 1, "path17", ""],
    ["phantom_18", 11, 32, 0, 1, 1, "path18", ""],
    ["phantom_19", 11, 32, 0, 1, 1, "path19", ""],
    ["phantom_20", 11, 32, 0, 1, 1, "path20", ""],
    ["phantom_21", 11, 32, 0, 1, 1, "path21", ""],
    ["phantom__22a", 11, 32, 0, 1, 1, "path22", ""],
    ["phantom_23", 11, 32, 0, 1, 1, "path23", ""],
    ["phantom_24", 11, 32, 0, 1, 1, "path24", ""],
    ["phantom_25", 11, 32, 0, 1, 1, "path25", ""],
    ["phantom_26", 11, 32, 0, 1, 1, "path26", ""],
    ["phantom_27", 11, 32, 0, 1, 1, "path27", ""],
    ["phantom_4f", 11, 32, 0, 1, 1, "path4", ""],
    ["phantom_6f", 11, 32, 0, 1, 1, "path6", ""],
    ["phantom_7f", 11, 32, 0, 1, 1, "path7", ""],
    ["phantom_8f", 11, 32, 0, 1, 1, "path8", ""],
    ["phantom_18f", 11, 32, 0, 1, 1, "path18", ""],
    ["phantom_19f", 11, 32, 0, 1, 1, "path19", ""],
    ["phantom_20f", 11, 32, 0, 1, 1, "path20", ""],
    ["phantom_21f", 11, 32, 0, 1, 1, "path21", ""],
    ["phantom_23f", 11, 32, 0, 1, 1, "path23", ""],
    ["phantom_28f", 11, 32, 0, 1, 1, "path28", ""],
    ["kphant__1a", 11, 32, 0, 0, 1, "", ""],
    ["kphant__2a", 11, 32, 0, 0, 1, "", ""],
    ["kphant__3a", 11, 32, 0, 0, 1, "", ""],
    ["kphant__4a", 11, 32, 0, 0, 1, "", ""],
    ["kphant__5a", 11, 32, 0, 0, 1, "", ""],
    ["kphant__6a", 11, 32, 0, 0, 1, "", ""],
    ["kphant__1b", 11, 32, 0, 0, 1, "", ""],
    ["kphant__2b", 11, 32, 0, 0, 1, "", ""],
    ["kphant__3b", 11, 32, 0, 0, 1, "", ""],
    ["kphant__4b", 11, 32, 0, 0, 1, "", ""],
    ["kphant__5b", 11, 32, 0, 0, 1, "", ""],
    ["kphant__6b", 11, 32, 0, 0, 1, "", ""],
    ["kphant__1c", 11, 2, 0, 0, 1, "", ""],
    ["kphant__2c", 11, 2, 0, 0, 1, "", ""],
    ["kphant__3c", 11, 2, 0, 0, 1, "", ""],
    ["kphant__4c", 11, 2, 0, 0, 1, "", ""],
    ["kphant__5c", 11, 2, 0, 0, 1, "", ""],
    ["kphant__6c", 11, 2, 0, 0, 1, "", ""],
    ["kphant__1d", 11, 2, 0, 0, 1, "", ""],
    ["kphant__2d", 11, 2, 0, 0, 1, "", ""],
    ["kphant__3d", 11, 2, 0, 0, 1, "", ""],
    ["kphant__4d", 11, 2, 0, 0, 1, "", ""],
    ["kphant__5d", 11, 2, 0, 0, 1, "", ""],
    ["kphant__6d", 11, 2, 0, 0, 1, "", ""],
    ["kphant__7d", 11, 2, 0, 0, 1, "", ""],
    ["kphant__8d", 11, 2, 0, 0, 1, "", ""],
    ["path1", 20, 0, 0, 1, 1, "", ""],
    ["path2", 20, 0, 0, 1, 1, "", ""],
    ["path3", 20, 0, 0, 1, 1, "", ""],
    ["path4", 20, 0, 0, 1, 1, "", ""],
    ["path5", 20, 0, 0, 1, 1, "", ""],
    ["path6", 20, 0, 0, 1, 1, "", ""],
    ["path7", 20, 0, 0, 1, 1, "", ""],
    ["path8", 20, 0, 0, 1, 1, "", ""],
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
    ["path21", 20, 0, 0, 1, 1, "", ""],
    ["path22", 20, 0, 0, 1, 1, "", ""],
    ["path23", 20, 0, 0, 1, 1, "", ""],
    ["path24", 20, 0, 0, 1, 1, "", ""],
    ["path25", 20, 0, 0, 1, 1, "", ""],
    ["path26", 20, 0, 0, 1, 1, "", ""],
    ["path27", 20, 0, 0, 1, 1, "", ""],
    ["path28", 20, 0, 0, 1, 1, "", ""],
    ["kpath1", 20, 0, 0, 1, 1, "", ""],
    ["kpath2", 20, 0, 0, 1, 1, "", ""],
    ["kpath3", 20, 0, 0, 1, 1, "", ""],
    ["kingpath", 20, 0, 0, 1, 1, "", ""],
    ["gem_p1a", 15, 2105, 0, 1, 1, "", ""],
    ["gem_p1b", 15, 2105, 0, 1, 1, "", ""],
    ["gem_p1c", 15, 2105, 0, 1, 1, "", ""],
    ["gem_p1d", 15, 2105, 0, 1, 1, "", ""],
    ["gem_p2a", 15, 2105, 0, 1, 1, "", ""],
    ["gem_p2b", 15, 2105, 0, 1, 1, "", ""],
    ["gem_p2c", 15, 2105, 0, 1, 1, "", ""],
    ["gem_p2d", 15, 2105, 0, 1, 1, "", ""],
    ["gem_p3a", 15, 2105, 0, 1, 1, "", ""],
    ["gem_p3b", 15, 2105, 0, 1, 1, "", ""],
    ["gem_p3c", 15, 2105, 0, 1, 1, "", ""],
    ["gem_p3d", 15, 2105, 0, 1, 1, "", ""],
    ["gem_icon_p3a", 1, 175, 0, 0, 1, "", ""],
    ["gem_icon_p3b", 1, 175, 0, 0, 1, "", ""],
    ["gem_icon_p3c", 1, 175, 0, 0, 1, "", ""],
    ["gem_icon_p3d", 1, 175, 0, 0, 1, "", ""],
    ["p1_treasure1", 13, 39, 0, 1, 1, "", ""],
    ["p2_treasure1", 13, 39, 0, 1, 1, "", ""],
    ["p3_treasure1", 13, 39, 0, 1, 1, "", ""],
    ["p1_treasure2", 13, 39, 0, 1, 1, "", ""],
    ["p2_treasure2", 13, 39, 0, 1, 1, "", ""],
    ["p3_treasure2", 13, 39, 0, 1, 1, "", ""],
    ["p1_treasure3", 13, 39, 0, 1, 1, "", ""],
    ["p2_treasure3", 13, 39, 0, 1, 1, "", ""],
    ["p3_treasure3", 13, 39, 0, 1, 1, "", ""],
    ["seedpile0", 1, 134, 0, 1, 1, "", ""],
    ["seedpile1", 1, 134, 0, 1, 1, "", ""],
    ["seedpile2", 1, 134, 0, 1, 1, "", ""],
    ["seedpile3", 1, 134, 0, 1, 1, "", ""],
    ["seedpile3e", 1, 134, 0, 1, 1, "", ""],
    ["seedpile4", 1, 134, 0, 1, 1, "", ""],
    ["seedpile5", 1, 134, 0, 1, 1, "", ""],
    ["seedcount", 7, 0, 0, 1, 1, "", ""],
    ["seedpile6", 1, 134, 0, 1, 1, "", ""],
    ["seedpile7", 1, 134, 0, 1, 1, "", ""],
    ["seedpile8", 1, 134, 0, 1, 1, "", ""],
    ["seedpile9", 1, 134, 0, 1, 1, "", ""],
    ["seedpile10", 1, 134, 0, 1, 1, "", ""],
    ["seedpile1t", 2, 0, 0, 1, 1, "", ""],
    ["seedpile6t", 2, 0, 0, 1, 1, "", ""],
    ["seedpile7t", 2, 0, 0, 1, 1, "", ""],
    ["seedpile8t", 2, 0, 0, 1, 1, "", ""],
    ["seedpile9t", 2, 0, 0, 1, 1, "", ""],
    ["seedpile10t", 2, 0, 0, 1, 1, "", ""],
    ["seeddelay", 8, 0, 0, 0, 1, "", ""],
    ["seedmover", 7, 0, 0, 1, 1, "", ""],
    ["seedtimer6", 8, 0, 0, 0, 1, "", ""],
    ["seedtimer7", 8, 0, 0, 0, 1, "", ""],
    ["seedtimer8", 8, 0, 0, 0, 1, "", ""],
    ["seedtimer9", 8, 0, 0, 0, 1, "", ""],
    ["seedtimer10", 8, 0, 0, 0, 1, "", ""],
    ["web1", 23, 104, 0, 1, 1, "", ""],
    ["web2", 23, 104, 0, 1, 1, "", ""],
    ["hide_phants", 7, 0, 0, 1, 1, "", ""],
    ["hidedelay1", 8, 0, 0, 0, 1, "", ""],
    ["phant_off", 7, 0, 0, 1, 1, "", ""],
    ["boss_easy", 11, 26, 0, 1, 1, "kingpath", ""],
    ["boss_hard", 11, 26, 0, 1, 1, "kingpath", ""],
    ["spawner", 7, 0, 0, 0, 1, "", ""],
    ["hide_kphants", 7, 0, 0, 1, 1, "", ""],
    ["hidedelay2", 8, 0, 0, 0, 1, "", ""],
    ["cosmo3delay", 8, 0, 0, 0, 1, "", ""],
    ["60_uri", 7, 0, 0, 0, 1, "", ""],
    ["spawntimer", 8, 0, 0, 0, 1, "", ""],
    ["kphant_off", 7, 0, 0, 1, 1, "", ""],
    ["hideseeds", 7, 0, 0, 1, 1, "", ""],
    ["plantvol", 22, 0, 0, 1, 1, "", ""],
    ["portalsound", 16, "ajq_portalgatelp", 0, 0, 1, "", ""],
    ["checkpoint1", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["checkpoint2e", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["checkpoint2", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["checkpoint3", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["checkpoint4", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["checkpoint5", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["70_uri", 7, 0, 0, 0, 1, "", ""],
    ["exitvol", 3, 0, 0, 1, 1, "", ""],
    ["picktasks", 7, 0, 0, 1, 1, "", ""],
    ["randomtask", 7, 0, 0, 0, 1, "", ""],
    ["easystart", 3, 0, 0, 0, 1, "", ""],
    ["cheatchq1", 3, 0, 0, 1, 1, "", ""],
    ["cheatchq2", 3, 0, 0, 1, 1, "", ""],
    ["playermember", 7, 0, 0, 1, 1, "", ""],
    ["diff_level", 7, 0, 0, 1, 1, "", ""],
    ["live_players", 7, 0, 1, 0, 1, "", ""],
  ],

  on: {
    loaded(q) {
      // step 275
      q.send("qsndpk", 2401);
    },

    // walked into, or clicked
    trigger: {
      treasure_a1(q) {
        // by hand: behind an animal passage: clothing (as the other adventures' passages; a guess)
        q.send("qatt", "treasure_a1", 2, ...passageClothing(q, "treasure_a1", {hard: false}), 1); // the chest opens
      },
      treasure_a2(q) {
        // by hand: behind an animal passage: clothing (as the other adventures' passages; a guess)
        q.send("qatt", "treasure_a2", 2, ...passageClothing(q, "treasure_a2", {hard: false}), 1); // the chest opens
      },
      p1_treasure1(q) {
        q.send("qatt", "p1_treasure1", 3, 100, 0, 1); // by hand: as recorded for this chest in this mode, whichever layout // the chest opens
      },
      p2_treasure1(q) {
        q.send("qatt", "p2_treasure1", 3, 100, 0, 1); // by hand: as recorded for this chest in this mode, whichever layout // the chest opens
      },
      p3_treasure1(q) {
        q.send("qatt", "p3_treasure1", 3, 100, 0, 1); // by hand: as recorded for this chest in this mode, whichever layout // the chest opens
      },
      p1_treasure2(q) {
        q.send("qatt", "p1_treasure2", 3, 150, 0, 1); // by hand: as recorded for this chest in this mode, whichever layout // the chest opens
      },
      p2_treasure2(q) {
        q.send("qatt", "p2_treasure2", 3, 150, 0, 1); // by hand: as recorded for this chest in this mode, whichever layout // the chest opens
      },
      p3_treasure2(q) {
        q.send("qatt", "p3_treasure2", 3, 150, 0, 1); // by hand: as recorded for this chest in this mode, whichever layout // the chest opens
      },
      p1_treasure3(q) {
        q.send("qatt", "p1_treasure3", 3, 200, 0, 1); // by hand: as recorded for this chest in this mode, whichever layout // the chest opens
      },
      p2_treasure3(q) {
        q.send("qatt", "p2_treasure3", 3, 200, 0, 1); // by hand: as recorded for this chest in this mode, whichever layout // the chest opens
      },
      p3_treasure3(q) {
        q.send("qatt", "p3_treasure3", 3, 200, 0, 1); // by hand: as recorded for this chest in this mode, whichever layout // the chest opens
      },
      questready(q) {
        const n = tally(q, "trigger questready");
        // step 1: the 1st time
        if (n === 1) {
          q.send("qcmdVT", 1, "start_init", 1, 0, 0);
          set(q, "easystart", 1, 1, 1);
          set(q, "hard", 99, 0, 0);
          q.after(260, () => {
            set(q, "torch1", 99, 0, 0);
            set(q, "bridge1", 99, 0, 0);
            set(q, "bridge2", 99, 0, 0);
            set(q, "bridge4", 99, 0, 0);
            set(q, "bridge5", 99, 0, 0);
            set(q, "bridge6", 99, 0, 0);
            set(q, "bridge7", 99, 0, 0);
            set(q, "bridge9", 99, 0, 0);
            set(q, "bridge10", 99, 0, 0);
            set(q, "bridge11", 99, 0, 0);
            set(q, "bridge12", 99, 0, 0);
            set(q, "bridge13", 99, 0, 0);
            set(q, "bridge14", 99, 0, 0);
            set(q, "bridge15", 99, 0, 0);
            set(q, "bridge17", 99, 0, 0);
            set(q, "bridge19", 99, 0, 0);
            set(q, "bridge20", 99, 0, 0);
            set(q, "bridge21", 99, 0, 0);
            set(q, "bridge22", 99, 0, 0);
            set(q, "bridge23", 99, 0, 0);
            set(q, "greely1", 99, 0, 0);
            set(q, "cosmo2", 99, 0, 0);
            set(q, "cosmo3", 99, 0, 0);
            set(q, "kphant__1a", 99, 0, 0);
            set(q, "kphant__2a", 99, 0, 0);
            set(q, "kphant__3a", 99, 0, 0);
            set(q, "kphant__4a", 99, 0, 0);
            set(q, "kphant__5a", 99, 0, 0);
            set(q, "kphant__6a", 99, 0, 0);
            set(q, "kphant__1b", 99, 0, 0);
            set(q, "kphant__2b", 99, 0, 0);
            set(q, "kphant__3b", 99, 0, 0);
            set(q, "kphant__4b", 99, 0, 0);
            set(q, "kphant__5b", 99, 0, 0);
            set(q, "kphant__6b", 99, 0, 0);
            set(q, "kphant__1c", 99, 0, 0);
            set(q, "kphant__2c", 99, 0, 0);
            set(q, "kphant__3c", 99, 0, 0);
            set(q, "kphant__4c", 99, 0, 0);
            set(q, "kphant__5c", 99, 0, 0);
            set(q, "kphant__6c", 99, 0, 0);
            set(q, "kphant__1d", 99, 0, 0);
            set(q, "kphant__2d", 99, 0, 0);
            set(q, "kphant__3d", 99, 0, 0);
            set(q, "kphant__4d", 99, 0, 0);
            set(q, "kphant__5d", 99, 0, 0);
            set(q, "kphant__6d", 99, 0, 0);
            set(q, "kphant__7d", 99, 0, 0);
            set(q, "kphant__8d", 99, 0, 0);
            set(q, "lavatrig1", 99, 0, 0);
            set(q, "lavatrig2", 99, 0, 0);
            set(q, "lavatrig3", 99, 0, 0);
            set(q, "lavatrig4", 99, 0, 0);
            q.send("qcmdVT", 1, "randomtask", 3, 0, 0);
            set(q, "gem_icon_p3a", 1, 1, 0);
            set(q, "gem_icon_p3b", 1, 1, 0);
            set(q, "gem_icon_p3c", 1, 1, 0);
            set(q, "gem_icon_p3d", 1, 1, 0);
            set(q, "p1_treasure1", 99, 0, 0);
            set(q, "p2_treasure1", 99, 0, 0);
            set(q, "p1_treasure2", 99, 0, 0);
            set(q, "p2_treasure2", 99, 0, 0);
            set(q, "p1_treasure3", 99, 0, 0);
            set(q, "p2_treasure3", 99, 0, 0);
            set(q, "t_brazier4", 99, 0, 0);
            set(q, "brazier4", 99, 0, 0);
            set(q, "t_brazier6", 99, 0, 0);
            set(q, "brazier6", 99, 0, 0);
            set(q, "t_brazier7", 99, 0, 0);
            set(q, "brazier7", 99, 0, 0);
            set(q, "t_brazier9", 99, 0, 0);
            set(q, "brazier9", 99, 0, 0);
            set(q, "t_brazier10b", 99, 0, 0);
            set(q, "brazier10b", 99, 0, 0);
            set(q, "t_brazier11", 99, 0, 0);
            set(q, "brazier11", 99, 0, 0);
            set(q, "t_brazier12", 99, 0, 0);
            set(q, "brazier12", 99, 0, 0);
            set(q, "brazier13b", 99, 0, 0);
            set(q, "t_brazier13b", 99, 0, 0);
            set(q, "t_brazier14", 99, 0, 0);
            set(q, "brazier14", 99, 0, 0);
            set(q, "t_brazier15", 99, 0, 0);
            set(q, "brazier15", 99, 0, 0);
            set(q, "t_brazier17", 99, 0, 0);
            set(q, "brazier17", 99, 0, 0);
            set(q, "t_brazier19", 99, 0, 0);
            set(q, "brazier19", 99, 0, 0);
            set(q, "t_brazier20", 99, 0, 0);
            set(q, "brazier20", 99, 0, 0);
            set(q, "pod49", 0, 1, 1);
            set(q, "pod44", 0, 1, 1);
            set(q, "pod48", 0, 1, 1);
            set(q, "pod30", 0, 1, 1);
            set(q, "pod8", 0, 1, 1);
            set(q, "pod9", 0, 1, 1);
            set(q, "pod10", 0, 1, 1);
            set(q, "pod11", 0, 1, 1);
            set(q, "pod12", 0, 1, 1);
            set(q, "pod43", 0, 1, 1);
            set(q, "phantom__22a", 99, 0, 0);
            set(q, "phantom__3a", 99, 0, 0);
            set(q, "boss_easy", 99, 0, 0);
            set(q, "boss_hard", 99, 0, 0);
          });
        }
        // step 2: the 2nd time
        if (n === 2) {
          q.send("qsp", "boss_easy", "kingpath");
          set(q, "boss_easy", 0, 1, 1);
          q.send("qcmd", 38, 3885);
        }
      },
      easystart(q) {
        // step 3
        q.send("qcmd", 14, 1, "start_e");
        q.after(820, () => {
          q.send("qicon", "cosmo1e", 1);
          set(q, "phantom_4f", 99, 0, 0);
          set(q, "phantom_6f", 99, 0, 0);
          set(q, "phantom_7f", 99, 0, 0);
          set(q, "phantom_8f", 99, 0, 0);
          set(q, "phantom_18f", 99, 0, 0);
          set(q, "phantom_19f", 99, 0, 0);
          set(q, "phantom_20f", 99, 0, 0);
          set(q, "phantom_21f", 99, 0, 0);
          set(q, "phantom_23f", 99, 0, 0);
          set(q, "phantom_28f", 99, 0, 0);
          set(q, "phantom_17", 99, 0, 0);
          set(q, "phantom_12", 99, 0, 0);
          set(q, "phantom_13", 99, 0, 0);
          set(q, "phantom_14", 99, 0, 0);
          set(q, "phantom_15", 99, 0, 0);
          set(q, "phantom_24", 99, 0, 0);
          set(q, "phantom_16", 99, 0, 0);
          set(q, "phantom_18", 99, 0, 0);
          set(q, "phantom_19", 99, 0, 0);
          set(q, "phantom_20", 99, 0, 0);
          set(q, "phantom_21", 99, 0, 0);
          set(q, "phantom_26", 99, 0, 0);
          set(q, "boss_hard", 99, 0, 0);
        });
      },
      cosmo1e(q) {
        // step 4
        q.send("qcmd", 3, 0, "cosmo1e", 0, 3914);
        q.after(4830, () => {
          q.send("qtorch", 0, 1, "lightme");
          q.send("qtorch", 0, 1, "torch2");
          q.send("qtorch", 0, 1, "torch3");
          q.send("qtorch", 0, 1, "torch4");
        });
      },
      greelytrig(q) {
        // step 35
        appear(q, "greely1");
        set(q, "greely1", 2, 1, 1);
        q.send("qcmd", 38, 3920);
        q.send("qicon", "greely1", 1);
        q.send("qswfs", "cosmo1", "disappear");
        set(q, "cosmo1", 2, 1, 1);
        set(q, "cosmo1", 3, 1, 0);
        set(q, "greelytrig", 1, 0, 0);
        q.after(1420, () => {
          set(q, "cosmo1", 99, 0, 0);
        });
      },
      greely1(q) {
        // step 36
        q.send("qcmd", 3, 0, "greely1", 2, 3918);
      },
      cosmo2vol(q) {
        const n = tally(q, "trigger cosmo2vol");
        // step 68: the 1st time
        if (n === 1) {
          set(q, "cosmo2vol", 1, 1, 1);
          q.send("qcmd", 38, 3645);
          q.send("qicon", "cosmo2", 1);
          set(q, "cosmo2vol", 2, 0, 0);
        }
      },
      cosmo2(q) {
        // step 93
        q.send("qcmd", 3, 0, "cosmo2", 1, 3919);
      },
      torch1(q) {
        // step 109
        q.send("qgi", "torch");
      },
      phantom__1a__give_gem(q) {
        // step 159: once
        if (once(q, "step159")) {
          q.send("qad", "phantom__1a__give_gem", 0, "null");
          q.gems(25);
        }
      },
      avatar1(q) {
        // step 238
        q.send("qcmd", 2, "avatar1", 4033, 0);
      },
      exitvol0(q) {
        // step 240
        q.send("qfade", 1);
        set(q, "exitvol0", 99, 0, 0);
        q.after(410, () => {
          q.send("qplayswf", "2533", "null", "null");
        });
      },
      teleportking(q) {
        // step 242
        q.room("bossenter3", "bossenter3");
      },
      cosmo3(q) {
        // step 248
        q.send("qcmd", 3, 0, "cosmo3", 1, 3916);
      },
      exitvol(q) {
        // step 251
        q.send("qcmd", 19);
      },
    },

    // families of triggers: the rule for any of them; {n} is its number
    triggerLike: [
      // by hand: a pod's gems, once
      [/^pod\d+e?__give_gem$/, (q, name) => {
        const pod = name.replace(/__give_gem$/, "");
        if (once(q, "gems of " + pod)) {
          q.send("qad", name, 0, "null");
          q.gems((q.vars.podGems || {})[pod] || POD_GEMS[pod] || 10);
        }
      }],
      // by hand: each brazier lit (with the torch) puts down its bridge (brazier10b and
      // 13b light the same bridges as 10 and 13, from the other side)
      [/^brazier(\d+)(b?)$/, (q, name) => {
        const [, n, b] = name.match(/^brazier(\d+)(b?)$/);
        if (!once(q, "lit " + name)) {
          return;
        }
        const lit = b ? `brazierli${n}b` : `brazierlit${n}`;
        set(q, `t_${name}`, 1, 1, 0);
        set(q, `bridge${n}`, 1, 1, 0);
        set(q, lit, 99, 0, 0);
        set(q, lit, 0, 1, 0);
        q.send("qtorch", 0, 1, lit);
        q.xp(5, name);
        set(q, name, 1, 1, 0);
        q.after(1500, () => {
          set(q, `blockbridg${n}`, 99, 0, 0);
        });
      }],
      // by hand: every seed pile gives boomseeds, every time
      [/^seedpile\d+e?$/, q => {
        giveSeeds(q, 137, 3, 3);
      }],
      [/^lavatrig(\d+)$/, (q, name) => {
        const n = name.match(/^lavatrig(\d+)$/)[1];
        const held = q.held(); // what the player carried when this fired
        // each of them, unless holding gem_p#
        if (!/^gem_p\d+[a-z]?$/.test(held || "")) {
          // step 252
          q.send("qcmd", 2, `${name}`, 3917, 2);
          set(q, "cosmo2", 4, 1, 1);
          q.send("qcmd", 3, 0, "cosmo2", 4, 3907);
        }
        // each of them, holding gem_p#, once each
        if (/^gem_p\d+[a-z]?$/.test(held || "") && once(q, "lavatrig# gem_p# " + name)) {
          // step 253
          q.use();
          set(q, `lava${n}`, 1, 1, 0);
          set(q, `lavatile${n}`, 1, 1, 0);
          q.send("qcmdVT", 1, "lavacount", bump(q, "lavacount"), 0, 0); // one more than last time
          counted(q, "lavacount"); // what that count sets off
          q.xp(25, `${name}`);
          set(q, `${name}`, 1, 0, 0);
        }
      }],
      [/^phantom_(\d+)__give_gem$/, (q, name) => {
        const n = name.match(/^phantom_(\d+)__give_gem$/)[1];
        // each of them, once each
        if (once(q, "phantom_#__give_gem - " + name)) {
          // step 254
          q.send("qad", `${name}`, 0, "null");
          q.gems(25);
        }
      }],
      [/^kphant__(\d+)a__give_gem$/, (q, name) => {
        const n = name.match(/^kphant__(\d+)a__give_gem$/)[1];
        // each of them, once each
        if (once(q, "kphant__#a__give_gem - " + name)) {
          // step 255
          q.send("qad", `${name}`, 0, "null");
          q.gems(25);
        }
      }],
      [/^kphant__(\d+)b__give_gem$/, (q, name) => {
        const n = name.match(/^kphant__(\d+)b__give_gem$/)[1];
        // each of them, once each
        if (once(q, "kphant__#b__give_gem - " + name)) {
          // step 256
          q.send("qad", `${name}`, 0, "null");
          q.gems(25);
        }
      }],
      [/^kphant__(\d+)c__give_gem$/, (q, name) => {
        const n = name.match(/^kphant__(\d+)c__give_gem$/)[1];
        // each of them, once each
        if (once(q, "kphant__#c__give_gem - " + name)) {
          // step 257
          q.send("qad", `${name}`, 0, "null");
          q.gems(25);
        }
      }],
      [/^kphant__(\d+)d__give_gem$/, (q, name) => {
        const n = name.match(/^kphant__(\d+)d__give_gem$/)[1];
        // each of them, once each
        if (once(q, "kphant__#d__give_gem - " + name)) {
          // step 258
          q.send("qad", `${name}`, 0, "null");
          q.gems(25);
        }
      }],
    ],

    // a talk read to its end
    answer: {
      cosmo1e(q) {
        // step 5: once
        if (once(q, "step5")) {
          q.send("qcmdVT", 1, "00_uri", 1, 0, 0);
          q.send("qcmdVT", 1, "players", 1, 0, 0);
          q.send("qposturi", "/adventure4-thehive/#00-start/#0#001");
          q.send("qcmdVT", 1, "00_uri", 99, 0, 0);
          q.send("qicon", "cosmo1e", 0);
          set(q, "cosmo1e", 1, 1, 1);
          q.send("qcmd", 38, 3921);
          q.send("qswfs", "cosmo1e", "disappear");
          set(q, "cosmo1e", 2, 1, 1);
          set(q, "cosmo1e", 3, 1, 0);
          q.after(1180, () => {
            set(q, "cosmo1e", 99, 0, 0);
          });
        }
      },
      greely1(q) {
        // step 37
        q.send("qicon", "greely1", 0);
        q.send("qswfs", "greely1", "disappear");
        set(q, "greely1", 3, 1, 1);
        q.send("qcmd", 38, 3921);
        set(q, "greely1", 4, 1, 0);
        set(q, "gem_p1a", 99, 0, 0);
        set(q, "gem_p1b", 99, 0, 0);
        set(q, "gem_p1c", 99, 0, 0);
        set(q, "gem_p1d", 99, 0, 0);
        set(q, "gem_p2a", 99, 0, 0);
        set(q, "gem_p2b", 99, 0, 0);
        set(q, "gem_p2c", 99, 0, 0);
        set(q, "gem_p2d", 99, 0, 0);
        q.after(1000, () => {
          set(q, "greely1", 99, 0, 0);
          q.send("qswfs", "cosmo2", "appear");
          set(q, "cosmo2", 0, 1, 1);
          set(q, "cosmo2", 1, 1, 1);
        });
      },
      cosmo2(q, state) {
        // by hand: by which of his talks was read (its state), not how many times he was answered
        state = Number(state);
        if (state === 1 && once(q, "cosmo2 answer 1")) {
          q.send("qicon", "cosmo2", 0);
          set(q, "cosmo2", 2, 1, 1);
          q.send("qcmd", 38, 3646);
          set(q, "lavatrig1", 0, 1, 1);
          set(q, "lavatrig2", 0, 1, 1);
          set(q, "lavatrig3", 0, 1, 1);
          set(q, "lavatrig4", 0, 1, 1);
          set(q, "torch1", 0, 1, 1);
          set(q, "cosmo2", 3, 1, 0);
          q.send("qcmdVT", 1, "10_uri", 1, 0, 0);
          q.send("qposturi", "/adventure4-thehive/#10-talkedtocosmobydoor/#0#001");
          q.send("qcmdVT", 1, "10_uri", 99, 0, 0);
          q.send("qicon", "gem_icon_p3a", 1);
          q.send("qicon", "gem_icon_p3b", 1);
          q.send("qicon", "gem_icon_p3c", 1);
          q.send("qicon", "gem_icon_p3d", 1);
        }
        if (state === 5 && ((q.vars.counts || {}).lavacount || 0) >= 1 && once(q, "cosmo2 answer 5")) {
          q.send("qcmdVT", 1, "20_uri", 1, 0, 0);
          q.send("qposturi", "/adventure4-thehive/#20-foundthefirststone/#0#001");
          q.send("qcmdVT", 1, "20_uri", 99, 0, 0);
          q.send("qcmd", 38, 3677);
          set(q, "cosmo2", 3, 1, 0);
        }
        if (state === 6 && ((q.vars.counts || {}).lavacount || 0) >= 2 && once(q, "cosmo2 answer 6")) {
          q.send("qcmdVT", 1, "30_uri", 1, 0, 0);
          q.send("qposturi", "/adventure4-thehive/#30-foundthesecondstone/#0#001");
          q.send("qcmdVT", 1, "30_uri", 99, 0, 0);
          q.send("qcmd", 38, 3883);
          set(q, "cosmo2", 3, 1, 0);
        }
        if (state === 7 && ((q.vars.counts || {}).lavacount || 0) >= 3 && once(q, "cosmo2 answer 7")) {
          q.send("qcmdVT", 1, "40_uri", 1, 0, 0);
          q.send("qposturi", "/adventure4-thehive/#40-foundthethirdstone/#0#001");
          q.send("qcmdVT", 1, "40_uri", 99, 0, 0);
          q.send("qcmd", 38, 3884);
          set(q, "cosmo2", 3, 1, 0);
        }
        if (state === 8 && ((q.vars.counts || {}).lavacount || 0) >= 4 && once(q, "cosmo2 answer 8")) {
          q.send("qswfs", "cosmo2", "disappear");
          set(q, "cosmo2", 9, 1, 1);
          set(q, "lavadoor", 1, 1, 0);
          q.send("qmusic", 0);
          q.send("qsnd", "ajq_firedoor");
          set(q, "cosmo2", 10, 1, 0);
          q.send("qcmdVT", 1, "50_uri", 1, 0, 0);
          q.send("qposturi", "/adventure4-thehive/#50-findthealphastones/#0#001");
          q.send("qcmdVT", 1, "50_uri", 99, 0, 0);
          q.send("qcmd", 38, 10783);
          q.after(2460, () => {
            set(q, "cosmo2", 99, 0, 0);
            set(q, "exitblock0", 99, 0, 0);
          });
        }
        if (state === 4) {
          set(q, "cosmo2", 3, 1, 0); // where the lava crystals go: again later
        }
      },
      cosmo3(q) {
        // step 249: once
        if (once(q, "step249")) {
          set(q, "cosmo3", 2, 1, 1);
          q.send("qicon", "cosmo3", 0);
          set(q, "portalsound", 1, 1, 0);
          set(q, "exitportal", 1, 1, 0);
          q.xp(50, "cosmo3");
          q.send("qcmd", 38, 3915);
          set(q, "cosmo3", 3, 1, 0);
          q.after(550, () => {
            q.send("qcmdVT", 1, "70_uri", 1, 0, 0);
            q.send("qposturi", "/adventure4-thehive/#70-exit/#0#001");
            q.offer([[3,1000,1000],[1,57,0],[1,58,0],[1,62,0],[3,750,750]]); // [1, den item, 0], [2, clothing item, ?] or [3, gems, gems]
          });
        }
      },
    },

    // an item picked up
    pickedUp: {
      torch(q) {
        // step 110
        q.send("qgi", "torch");
      },
      gem_p3b(q) {
        // step 156
        q.send("qicon", "gem_icon_p3b", 0);
      },
      gem_p3a(q) {
        // step 179
        q.send("qicon", "gem_icon_p3a", 0);
      },
      gem_p3c(q) {
        // step 225
        q.send("qicon", "gem_icon_p3c", 0);
      },
      gem_p3d(q) {
        // step 239
        q.send("qicon", "gem_icon_p3d", 0);
      },
    },

    // hit by the player (adventures.js needs its handler, see the maker)
    attacked: {
      web2(q) {
        const n = tally(q, "attacked web2");
        // step 30: the 1st time
        if (n === 1) {
          q.send("qahs", "web2", 80, 10, 0);
        }
        // step 31: the 2nd time
        if (n === 2) {
          q.send("qahs", "web2", 60, 10, 0);
        }
        // step 32: the 3rd time
        if (n === 3) {
          q.send("qahs", "web2", 40, 10, 0);
        }
        // step 33: the 4th time
        if (n === 4) {
          q.send("qahs", "web2", 20, 10, 0);
        }
        // step 34: the 5th time
        if (n === 5) {
          q.send("qad", "web2", 10, 0, -2965, 633, "");
          q.xp(5, "web2");
          set(q, "blockweb2", 1, 0, 0);
          q.xp(2);
        }
      },
    },
    attackedLike: [
      // by hand: every pod takes five hits (as recorded), wherever it is hit
      [/^pod\d+e?$/, (q, name, x = 0, y = 0) => {
        const hits = (q.vars.podHits = q.vars.podHits || {});
        if (hits[name] >= 5) {
          return;
        }
        hits[name] = (hits[name] || 0) + 1;
        if (hits[name] < 5) {
          q.send("qahs", name, 100 - 20 * hits[name], 10, 0);
          return;
        }
        const gems = POD_GEMS[name] || [5, 10, 15][Math.floor(Math.random() * 3)];
        (q.vars.podGems = q.vars.podGems || {})[name] = gems;
        q.send("qad", name, 10, 0, x, y, "");
        q.xp(5, name);
        q.send("qspn", name, `${name}__give_gem`, 200, 42, 3, gems, "null", "null", "null");
        set(q, name.replace(/^pod/, "podvol"), 99, 0, 0);
        set(q, name, 2, 1, 0);
      }],
    ],

    // a chest, opened
    opened: {
      treasure_a1(q) {
        if (!once(q, "opened treasure_a1")) {
          return;
        }
        q.clothes(...passageClothing(q, "treasure_a1", {hard: false}));
      },
      treasure_a2(q) {
        if (!once(q, "opened treasure_a2")) {
          return;
        }
        q.clothes(...passageClothing(q, "treasure_a2", {hard: false}));
      },
      p1_treasure1(q) {
        if (!once(q, "opened p1_treasure1")) {
          return;
        }
        q.gems(100);
      },
      p2_treasure1(q) {
        if (!once(q, "opened p2_treasure1")) {
          return;
        }
        q.gems(100);
      },
      p3_treasure1(q) {
        if (!once(q, "opened p3_treasure1")) {
          return;
        }
        q.gems(100);
        // step 148
        q.xp(5, "p3_treasure1");
      },
      p1_treasure2(q) {
        if (!once(q, "opened p1_treasure2")) {
          return;
        }
        q.gems(150);
      },
      p2_treasure2(q) {
        if (!once(q, "opened p2_treasure2")) {
          return;
        }
        q.gems(150);
      },
      p3_treasure2(q) {
        if (!once(q, "opened p3_treasure2")) {
          return;
        }
        q.gems(150);
        // step 207
        q.xp(5, "p3_treasure2");
      },
      p1_treasure3(q) {
        if (!once(q, "opened p1_treasure3")) {
          return;
        }
        q.gems(200);
      },
      p2_treasure3(q) {
        if (!once(q, "opened p2_treasure3")) {
          return;
        }
        q.gems(200);
      },
      p3_treasure3(q) {
        if (!once(q, "opened p3_treasure3")) {
          return;
        }
        q.gems(200);
        // step 237
        q.xp(5, "p3_treasure3");
      },
    },

    // a plant ate a phantom: [actor, 50, 1, x, y, ""] has it die there
    eaten(q, plant, phantom, x, y) {
      // boss_easy is a boss: it takes 10 hits, each doing what that hit did in the recording
      if (phantom === "boss_easy") {
        const n = tally(q, "hit boss_easy");
        // step 259: hit 1
        if (n === 1) {
          q.send("qepr", `${phantom}`);
          q.send("qahs", `${phantom}`, 90, 100, 0);
        }
        // step 260: hit 2
        if (n === 2) {
          q.send("qepr", `${phantom}`);
          q.send("qswfs", `${phantom}`, "agro");
          set(q, `${phantom}`, 1, 1, 1);
          q.send("qahs", `${phantom}`, 80, 100, 0);
          q.after(1590, () => {
            q.send("qicon", "cosmo3", 1);
            q.send("qcmdVT", 1, "spawner", bump(q, "spawner"), 0, 0); // one more than last time
            q.send("qswfs", "kphant__1a", "appear");
            q.send("qsp", "kphant__1a", "kpath1");
            set(q, "kphant__1a", 1, 1, 1);
            q.send("qswfs", "kphant__5a", "appear");
            q.send("qsp", "kphant__5a", "kpath3");
            set(q, "kphant__5a", 1, 1, 1);
            q.send("qswfs", "kphant__1a", "appear");
            q.send("qsp", "kphant__1a", "kpath1");
            set(q, "kphant__1a", 1, 1, 1);
            q.send("qswfs", "kphant__5a", "appear");
            q.send("qsp", "kphant__5a", "kpath3");
            set(q, "kphant__5a", 1, 1, 1);
            q.send("qsnd", "ajq_phantomminispawn");
            q.send("qcmdVT", 1, "spawntimer", 0, 0, 0);
          });
        }
        // step 261: hit 3
        if (n === 3) {
          q.send("qepr", `${phantom}`);
          q.send("qahs", `${phantom}`, 70, 100, 0);
        }
        // step 262: hit 4
        if (n === 4) {
          q.send("qepr", `${phantom}`);
          q.send("qswfs", `${phantom}`, "agro");
          set(q, `${phantom}`, 2, 1, 1);
          q.send("qahs", `${phantom}`, 60, 100, 0);
          q.after(1620, () => {
            q.send("qicon", "cosmo3", 1);
            q.send("qcmdVT", 1, "spawner", bump(q, "spawner"), 0, 0); // one more than last time
            q.send("qswfs", "kphant__2b", "appear");
            q.send("qsp", "kphant__2b", "kpath1");
            set(q, "kphant__2b", 1, 1, 1);
            q.send("qswfs", "kphant__3b", "appear");
            q.send("qsp", "kphant__3b", "kpath2");
            set(q, "kphant__3b", 1, 1, 1);
            q.send("qswfs", "kphant__4b", "appear");
            q.send("qsp", "kphant__4b", "kpath2");
            set(q, "kphant__4b", 1, 1, 1);
            q.send("qswfs", "kphant__6b", "appear");
            q.send("qsp", "kphant__6b", "kpath3");
            set(q, "kphant__6b", 1, 1, 1);
            q.send("qswfs", "kphant__2b", "appear");
            q.send("qsp", "kphant__2b", "kpath1");
            set(q, "kphant__2b", 1, 1, 1);
            q.send("qswfs", "kphant__3b", "appear");
            q.send("qsp", "kphant__3b", "kpath2");
            set(q, "kphant__3b", 1, 1, 1);
            q.send("qswfs", "kphant__4b", "appear");
            q.send("qsp", "kphant__4b", "kpath2");
            set(q, "kphant__4b", 1, 1, 1);
            q.send("qswfs", "kphant__6b", "appear");
            q.send("qsp", "kphant__6b", "kpath3");
            set(q, "kphant__6b", 1, 1, 1);
            q.send("qsnd", "ajq_phantomminispawn");
            q.send("qcmdVT", 1, "spawntimer", 0, 0, 0);
          });
        }
        // step 263: hit 5
        if (n === 5) {
          q.send("qepr", `${phantom}`);
          q.send("qahs", `${phantom}`, 50, 100, 0);
        }
        // step 264: hit 6
        if (n === 6) {
          q.send("qepr", `${phantom}`);
          q.send("qswfs", `${phantom}`, "agro");
          set(q, `${phantom}`, 3, 1, 1);
          q.send("qahs", `${phantom}`, 40, 100, 0);
          q.after(1620, () => {
            q.send("qicon", "cosmo3", 1);
            q.send("qcmdVT", 1, "spawner", bump(q, "spawner"), 0, 0); // one more than last time
            q.send("qswfs", "kphant__1c", "appear");
            q.send("qsp", "kphant__1c", "kpath1");
            set(q, "kphant__1c", 1, 1, 1);
            q.send("qswfs", "kphant__3c", "appear");
            q.send("qsp", "kphant__3c", "kpath2");
            set(q, "kphant__3c", 1, 1, 1);
            q.send("qswfs", "kphant__4c", "appear");
            q.send("qsp", "kphant__4c", "kpath2");
            set(q, "kphant__4c", 1, 1, 1);
            q.send("qswfs", "kphant__5c", "appear");
            q.send("qsp", "kphant__5c", "kpath3");
            set(q, "kphant__5c", 1, 1, 1);
            q.send("qswfs", "kphant__1c", "appear");
            q.send("qsp", "kphant__1c", "kpath1");
            set(q, "kphant__1c", 1, 1, 1);
            q.send("qswfs", "kphant__3c", "appear");
            q.send("qsp", "kphant__3c", "kpath2");
            set(q, "kphant__3c", 1, 1, 1);
            q.send("qswfs", "kphant__4c", "appear");
            q.send("qsp", "kphant__4c", "kpath2");
            set(q, "kphant__4c", 1, 1, 1);
            q.send("qswfs", "kphant__5c", "appear");
            q.send("qsp", "kphant__5c", "kpath3");
            set(q, "kphant__5c", 1, 1, 1);
            q.send("qsnd", "ajq_phantomminispawn");
            q.send("qcmdVT", 1, "spawntimer", 0, 0, 0);
          });
        }
        // step 265: hit 7
        if (n === 7) {
          q.send("qepr", `${phantom}`);
          q.send("qahs", `${phantom}`, 30, 100, 0);
        }
        // step 266: hit 8
        if (n === 8) {
          q.send("qepr", `${phantom}`);
          q.send("qswfs", `${phantom}`, "agro");
          set(q, `${phantom}`, 4, 1, 1);
          q.send("qahs", `${phantom}`, 20, 100, 0);
          q.after(1360, () => {
            q.send("qicon", "cosmo3", 1);
            q.send("qcmdVT", 1, "spawner", bump(q, "spawner"), 0, 0); // one more than last time
            q.send("qswfs", "kphant__1d", "appear");
            q.send("qsp", "kphant__1d", "kpath1");
            set(q, "kphant__1d", 1, 1, 1);
            q.send("qswfs", "kphant__2d", "appear");
            q.send("qsp", "kphant__2d", "kpath1");
            set(q, "kphant__2d", 1, 1, 1);
            q.send("qswfs", "kphant__3d", "appear");
            q.send("qsp", "kphant__3d", "kpath2");
            set(q, "kphant__3d", 1, 1, 1);
            q.send("qswfs", "kphant__4d", "appear");
            q.send("qsp", "kphant__4d", "kpath2");
            set(q, "kphant__4d", 1, 1, 1);
            q.send("qswfs", "kphant__5d", "appear");
            q.send("qsp", "kphant__5d", "kpath3");
            set(q, "kphant__5d", 1, 1, 1);
            q.send("qswfs", "kphant__6d", "appear");
            q.send("qsp", "kphant__6d", "kpath3");
            set(q, "kphant__6d", 1, 1, 1);
            q.send("qswfs", "kphant__1d", "appear");
            q.send("qsp", "kphant__1d", "kpath1");
            set(q, "kphant__1d", 1, 1, 1);
            q.send("qswfs", "kphant__2d", "appear");
            q.send("qsp", "kphant__2d", "kpath1");
            set(q, "kphant__2d", 1, 1, 1);
            q.send("qswfs", "kphant__3d", "appear");
            q.send("qsp", "kphant__3d", "kpath2");
            set(q, "kphant__3d", 1, 1, 1);
            q.send("qswfs", "kphant__4d", "appear");
            q.send("qsp", "kphant__4d", "kpath2");
            set(q, "kphant__4d", 1, 1, 1);
            q.send("qswfs", "kphant__5d", "appear");
            q.send("qsp", "kphant__5d", "kpath3");
            set(q, "kphant__5d", 1, 1, 1);
            q.send("qswfs", "kphant__6d", "appear");
            q.send("qsp", "kphant__6d", "kpath3");
            set(q, "kphant__6d", 1, 1, 1);
            q.send("qsnd", "ajq_phantomminispawn");
            q.send("qcmdVT", 1, "spawntimer", 0, 0, 0);
          });
        }
        // step 267: hit 9
        if (n === 9) {
          q.send("qepr", `${phantom}`);
          q.send("qahs", `${phantom}`, 10, 100, 0);
        }
        // step 268: hit 10 (it dies)
        if (n === 10) {
          q.send("qad", phantom, 100, 1, x, y, "");
          q.xp(200, `${phantom}`);
          set(q, "seedpile8t", 1, 1, 0);
          q.send("qmusic", 0);
          set(q, `${phantom}`, 6, 1, 0);
          q.after(600, () => {
            set(q, "kphant__1a", 99, 0, 0);
            set(q, "kphant__2a", 99, 0, 0);
            set(q, "kphant__3a", 99, 0, 0);
            set(q, "kphant__4a", 99, 0, 0);
            set(q, "kphant__5a", 99, 0, 0);
            set(q, "kphant__6a", 99, 0, 0);
            set(q, "kphant__1b", 99, 0, 0);
            set(q, "kphant__2b", 99, 0, 0);
            set(q, "kphant__3b", 99, 0, 0);
            set(q, "kphant__4b", 99, 0, 0);
            set(q, "kphant__5b", 99, 0, 0);
            set(q, "kphant__6b", 99, 0, 0);
            set(q, "kphant__1c", 99, 0, 0);
            set(q, "kphant__2c", 99, 0, 0);
            set(q, "kphant__3c", 99, 0, 0);
            set(q, "kphant__4c", 99, 0, 0);
            set(q, "kphant__5c", 99, 0, 0);
            set(q, "kphant__6c", 99, 0, 0);
            set(q, "kphant__1d", 99, 0, 0);
            set(q, "kphant__2d", 99, 0, 0);
            set(q, "kphant__3d", 99, 0, 0);
            set(q, "kphant__4d", 99, 0, 0);
            set(q, "kphant__5d", 99, 0, 0);
            set(q, "kphant__6d", 99, 0, 0);
            set(q, "kphant__7d", 99, 0, 0);
            set(q, "kphant__8d", 99, 0, 0);
            q.after(2000, () => {
              q.send("qsnd", "ajq_bossvictorystinger");
              q.send("qcmdVT", 1, "60_uri", 1, 0, 0);
              q.send("qposturi", "/adventure4-thehive/#60-defeatthephantomking/#0#001");
              q.send("qcmdVT", 1, "60_uri", 99, 0, 0);
              q.send("qcmd", 38, 3924);
              q.after(5010, () => {
                q.send("qswfs", "cosmo3", "appear");
                set(q, "cosmo3", 0, 1, 1);
                set(q, "cosmo3", 1, 1, 1);
                q.send("qicon", "cosmo3", 1);
                q.send("qmusic", "ajq_mussafelp");
              });
            });
          });
        }
        return;
      }
      if (!once(q, "eaten " + phantom)) {
        return;
      }
      const how = {"pod35":[20,1],"boss_easy":[100,1]}; // how these die (phantoms: 50, 1)
      q.send("qad", phantom, (how[phantom] || [50, 1])[0], (how[phantom] || [50, 1])[1], x, y, "");
      const num = (phantom.match(/(\d+)\D*$/) || [])[1]; // its number (pod28: 28)
      // step 269
      q.xp(5, `${phantom}`);
      // step 270: every one but pod#
      if (!/^(?:pod\d+[a-z]?)$/.test(phantom)) {
        q.send("qspn", `${phantom}`, `${phantom}__give_gem`, 200, 42, 3, 25, "null", "null", "null");
      }
      // step 271: every pod#
      if (/^(?:pod\d+[a-z]?)$/.test(phantom)) {
        q.send("qspn", `${phantom}`, `${phantom}__give_gem`, 200, 42, 3, 10, "null", "null", "null");
      }
      // step 272: every one but phantom__#, pod#, phantom_#
      if (!/^(?:phantom__\d+[a-z]?|pod\d+[a-z]?|phantom_\d+[a-z]?)$/.test(phantom)) {
        set(q, `${phantom}`, 3, 1, 0);
      }
      // step 273: every phantom__# or pod# or phantom_#
      if (/^(?:phantom__\d+[a-z]?|pod\d+[a-z]?|phantom_\d+[a-z]?)$/.test(phantom)) {
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 274: every pod#
      if (/^(?:pod\d+[a-z]?)$/.test(phantom)) {
        set(q, `podvol${num}`, 99, 0, 0);
      }
    },

    // a seed planted (the server has grown the plant: [plant, seed, x, y])
    planted(q, plant, seed, x, y) {
      const n = tally(q, "planted");
      // step 157: the 23rd time
      if (n === 23) {
        set(q, "seedpile7", 0, 1, 1);
        q.send("qcmdVT", 1, "seedtimer7", 0, 0, 0);
      }
      // step 158: the 36th time
      if (n === 36) {
        set(q, "seedpile7", 0, 1, 1);
        q.send("qcmdVT", 1, "seedtimer7", 0, 0, 0);
      }
    },

    // the prize taken
    gifted(q) {
      // step 250
      q.after(350, () => {
        set(q, "exitblock", 99, 0, 0);
      });
    },

    // a cutscene played to its end (the client answers "qplayswf"; adventures.js needs
    // a handler that runs this, see the maker)
    cutsceneDone(q) {
      // step 241
      set(q, "teleportking", 1, 1, 1);
    },
  },
};

/* adventure-script-maker
{"defId":19,"title":"The Hive","rooms":[{"key":"start","room":"adventures.room_adventure_4a","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_musdungeon"},{"key":"bossenter3","room":"adventures.room_adventure_4b","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_muscavebossbattle","arrive":"bossenter3"}],"objective":3924,"actors":[{"name":"questready","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"start_init","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"players","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"00_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cp1e","type":27,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cp2e","type":27,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"greely1","type":1,"def":22,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"greely1hide","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"greelytrig","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cosmo1","type":1,"def":25,"state":0,"visible":1,"click":1,"path":"","art":"appear"},{"name":"cosmo1hide","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cosmo1e","type":1,"def":25,"state":0,"visible":1,"click":1,"path":"","art":"appear"},{"name":"cosmo1ehide","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cosmo2","type":1,"def":25,"state":0,"visible":1,"click":1,"path":"","art":"appear"},{"name":"10_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"20_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"30_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"40_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"50_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cosmo2hide","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cosmo2vol","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"exitblock0","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol_e","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"exitvol0","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"teletimer","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cosmo3","type":1,"def":25,"state":0,"visible":1,"click":1,"path":"","art":"appear"},{"name":"gifttimer","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bossenter3","type":9,"def":1,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"start_e","type":9,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavatrig1","type":1,"def":87,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavatrig2","type":1,"def":87,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavatrig3","type":1,"def":87,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavatrig4","type":1,"def":87,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavacount","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"teleportking","type":3,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pod3","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod1","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod2","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod3e","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod4","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod5","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod5e","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod6","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod7","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod8","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod9","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod10","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod11","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod12","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod13","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod14","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod16","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod17","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod18","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod19","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod19e","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod20","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod21","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod22","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod23","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod24","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod25","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod26","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod27","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod28","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod29","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod30","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod31","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod31e","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod35","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod37","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod38","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod39","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod40","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod41","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod43","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod44","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod45","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod46","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod48","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod49","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod51","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod59","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lightme","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"hard","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"easy","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"random1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"exitportal","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge4","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge5","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge6","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge7","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge9","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge10","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge11","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge12","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge13","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge14","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge15","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge17","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge19","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge20","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge21","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge22","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge23","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier4","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier5","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier6","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier7","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier9","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier10","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier10b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier11","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier12","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier13","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier13b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier14","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier15","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier17","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier19","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier20","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier21","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier22","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier23","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavatile1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavatile2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavatile3","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavatile4","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lava1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lava2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lava3","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lava4","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavadoor","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatartile1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatartile2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pillar1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pillar2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatar1","type":1,"def":57,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatar2","type":1,"def":58,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blocktimer1","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"blocktimer2","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"treasure_a1","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"treasure_a2","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"torch","type":17,"def":2045,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"torch1","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"torch2","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"torch3","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"torch4","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier1","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier2","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier4","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier5","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier6","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier7","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier9","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier10","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier10b","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier11","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier12","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier13","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier13b","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier14","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier15","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier17","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier19","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier20","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier21","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier22","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier23","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridgewait1","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bridgewait2","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bridgewait4","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bridgewait5","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bridgewait6","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bridgewait7","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bridgewait9","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bridgewait10","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bridgewait11","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bridgewait12","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bridgewait13","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bridgewait14","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bridgewait15","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bridgewait17","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bridgewait19","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bridgewait20","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bridgewait21","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bridgewait22","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bridgewait23","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"brazierlit1","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazierlit2","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazierlit4","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazierlit5","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazierlit6","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazierlit7","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazierlit9","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazierlit10","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazierli10b","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazierlit11","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazierlit12","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazierlit13","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazierli13b","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazierlit14","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazierlit15","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazierlit17","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazierlit19","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazierlit20","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazierlit21","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazierlit22","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazierlit23","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockbridg1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockbridg2","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockbridg4","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockbridg5","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockbridg6","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockbridg7","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockbridg9","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockbridg10","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockbridg11","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockbridg12","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockbridg13","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockbridg14","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockbridg15","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockbridg17","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockbridg19","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockbridg20","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockbridg21","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockbridg22","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockbridg23","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockweb1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockweb2","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatarblock1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatarblock2","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol2","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol3","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol3e","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol4","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol5","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol5e","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol6","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol7","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol8","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol9","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol10","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol11","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol12","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol13","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol14","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol16","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol17","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol18","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol19","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol19e","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol20","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol21","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol22","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol23","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol24","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol25","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol26","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol27","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol28","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol29","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol30","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol31","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol31e","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol35","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol37","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol38","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol39","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol40","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol41","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol43","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol44","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol45","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol46","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol48","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol49","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol51","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol59","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"exitblock","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"phantom__1a","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path1","art":""},{"name":"phantom_2","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path2","art":""},{"name":"phantom__3a","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path3","art":""},{"name":"phantom_4","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path4","art":""},{"name":"phantom_5","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path5","art":""},{"name":"phantom_6","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path6","art":""},{"name":"phantom_7","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path7","art":""},{"name":"phantom_8","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path8","art":""},{"name":"phantom_11","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path11","art":""},{"name":"phantom_12","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path12","art":""},{"name":"phantom_13","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path13","art":""},{"name":"phantom_14","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path14","art":""},{"name":"phantom_15","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path15","art":""},{"name":"phantom_16","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path16","art":""},{"name":"phantom_17","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path17","art":""},{"name":"phantom_18","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path18","art":""},{"name":"phantom_19","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path19","art":""},{"name":"phantom_20","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path20","art":""},{"name":"phantom_21","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path21","art":""},{"name":"phantom__22a","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path22","art":""},{"name":"phantom_23","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path23","art":""},{"name":"phantom_24","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path24","art":""},{"name":"phantom_25","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path25","art":""},{"name":"phantom_26","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path26","art":""},{"name":"phantom_27","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path27","art":""},{"name":"phantom_4f","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path4","art":""},{"name":"phantom_6f","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path6","art":""},{"name":"phantom_7f","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path7","art":""},{"name":"phantom_8f","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path8","art":""},{"name":"phantom_18f","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path18","art":""},{"name":"phantom_19f","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path19","art":""},{"name":"phantom_20f","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path20","art":""},{"name":"phantom_21f","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path21","art":""},{"name":"phantom_23f","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path23","art":""},{"name":"phantom_28f","type":11,"def":32,"state":0,"visible":1,"click":1,"path":"path28","art":""},{"name":"kphant__1a","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__2a","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__3a","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__4a","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__5a","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__6a","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__1b","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__2b","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__3b","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__4b","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__5b","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__6b","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__1c","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__2c","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__3c","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__4c","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__5c","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__6c","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__1d","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__2d","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__3d","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__4d","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__5d","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__6d","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__7d","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__8d","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path1","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path2","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path3","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path4","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path5","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path6","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path7","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path8","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path11","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path12","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path13","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path14","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path15","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path16","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path17","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path18","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path19","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path20","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path21","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path22","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path23","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path24","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path25","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path26","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path27","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path28","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"kpath1","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"kpath2","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"kpath3","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"kingpath","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gem_p1a","type":15,"def":2105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gem_p1b","type":15,"def":2105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gem_p1c","type":15,"def":2105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gem_p1d","type":15,"def":2105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gem_p2a","type":15,"def":2105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gem_p2b","type":15,"def":2105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gem_p2c","type":15,"def":2105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gem_p2d","type":15,"def":2105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gem_p3a","type":15,"def":2105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gem_p3b","type":15,"def":2105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gem_p3c","type":15,"def":2105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gem_p3d","type":15,"def":2105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gem_icon_p3a","type":1,"def":175,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gem_icon_p3b","type":1,"def":175,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gem_icon_p3c","type":1,"def":175,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gem_icon_p3d","type":1,"def":175,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"p1_treasure1","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"p2_treasure1","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"p3_treasure1","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":100,"chestKind":3},{"name":"p1_treasure2","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"p2_treasure2","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"p3_treasure2","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":150,"chestKind":3},{"name":"p1_treasure3","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"p2_treasure3","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"p3_treasure3","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":200,"chestKind":3},{"name":"seedpile0","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile1","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile2","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile3","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile3e","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile4","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile5","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedcount","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile6","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile7","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile8","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile9","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile10","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile1t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile6t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile7t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile8t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile9t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile10t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seeddelay","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedmover","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedtimer6","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedtimer7","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedtimer8","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedtimer9","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedtimer10","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"web1","type":23,"def":104,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web2","type":23,"def":104,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"hide_phants","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"hidedelay1","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phant_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"boss_easy","type":11,"def":26,"state":0,"visible":1,"click":1,"path":"kingpath","art":""},{"name":"boss_hard","type":11,"def":26,"state":0,"visible":1,"click":1,"path":"kingpath","art":""},{"name":"spawner","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"hide_kphants","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"hidedelay2","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cosmo3delay","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"60_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"spawntimer","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"hideseeds","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"plantvol","type":22,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"portalsound","type":16,"def":"ajq_portalgatelp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"checkpoint1","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"checkpoint2e","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"checkpoint2","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"checkpoint3","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"checkpoint4","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"checkpoint5","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"70_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"exitvol","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"picktasks","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"randomtask","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"easystart","type":3,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cheatchq1","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cheatchq2","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"playermember","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""}],"steps":[{"id":275,"when":"loaded","name":"","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qsndpk","fields":"2401"}]},{"id":1,"when":"trigger","name":"questready","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"var","name":"start_init","value":1},{"a":"show","name":"easystart","click":1},{"a":"set","name":"hard","state":99,"visible":0,"click":0},{"a":"wait","ms":260},{"a":"set","name":"torch1","state":99,"visible":0,"click":0},{"a":"set","name":"bridge1","state":99,"visible":0,"click":0},{"a":"set","name":"bridge2","state":99,"visible":0,"click":0},{"a":"set","name":"bridge4","state":99,"visible":0,"click":0},{"a":"set","name":"bridge5","state":99,"visible":0,"click":0},{"a":"set","name":"bridge6","state":99,"visible":0,"click":0},{"a":"set","name":"bridge7","state":99,"visible":0,"click":0},{"a":"set","name":"bridge9","state":99,"visible":0,"click":0},{"a":"set","name":"bridge10","state":99,"visible":0,"click":0},{"a":"set","name":"bridge11","state":99,"visible":0,"click":0},{"a":"set","name":"bridge12","state":99,"visible":0,"click":0},{"a":"set","name":"bridge13","state":99,"visible":0,"click":0},{"a":"set","name":"bridge14","state":99,"visible":0,"click":0},{"a":"set","name":"bridge15","state":99,"visible":0,"click":0},{"a":"set","name":"bridge17","state":99,"visible":0,"click":0},{"a":"set","name":"bridge19","state":99,"visible":0,"click":0},{"a":"set","name":"bridge20","state":99,"visible":0,"click":0},{"a":"set","name":"bridge21","state":99,"visible":0,"click":0},{"a":"set","name":"bridge22","state":99,"visible":0,"click":0},{"a":"set","name":"bridge23","state":99,"visible":0,"click":0},{"a":"set","name":"greely1","state":99,"visible":0,"click":0},{"a":"set","name":"cosmo2","state":99,"visible":0,"click":0},{"a":"set","name":"cosmo3","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__1a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__2a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__3a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__4a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__5a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__6a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__1b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__2b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__3b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__4b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__5b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__6b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__1c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__2c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__3c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__4c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__5c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__6c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__1d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__2d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__3d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__4d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__5d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__6d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__7d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__8d","state":99,"visible":0,"click":0},{"a":"set","name":"lavatrig1","state":99,"visible":0,"click":0},{"a":"set","name":"lavatrig2","state":99,"visible":0,"click":0},{"a":"set","name":"lavatrig3","state":99,"visible":0,"click":0},{"a":"set","name":"lavatrig4","state":99,"visible":0,"click":0},{"a":"var","name":"randomtask","value":3},{"a":"show","name":"gem_icon_p3a","click":0},{"a":"show","name":"gem_icon_p3b","click":0},{"a":"show","name":"gem_icon_p3c","click":0},{"a":"show","name":"gem_icon_p3d","click":0},{"a":"set","name":"p1_treasure1","state":99,"visible":0,"click":0},{"a":"set","name":"p2_treasure1","state":99,"visible":0,"click":0},{"a":"set","name":"p1_treasure2","state":99,"visible":0,"click":0},{"a":"set","name":"p2_treasure2","state":99,"visible":0,"click":0},{"a":"set","name":"p1_treasure3","state":99,"visible":0,"click":0},{"a":"set","name":"p2_treasure3","state":99,"visible":0,"click":0},{"a":"set","name":"t_brazier4","state":99,"visible":0,"click":0},{"a":"set","name":"brazier4","state":99,"visible":0,"click":0},{"a":"set","name":"t_brazier6","state":99,"visible":0,"click":0},{"a":"set","name":"brazier6","state":99,"visible":0,"click":0},{"a":"set","name":"t_brazier7","state":99,"visible":0,"click":0},{"a":"set","name":"brazier7","state":99,"visible":0,"click":0},{"a":"set","name":"t_brazier9","state":99,"visible":0,"click":0},{"a":"set","name":"brazier9","state":99,"visible":0,"click":0},{"a":"set","name":"t_brazier10b","state":99,"visible":0,"click":0},{"a":"set","name":"brazier10b","state":99,"visible":0,"click":0},{"a":"set","name":"t_brazier11","state":99,"visible":0,"click":0},{"a":"set","name":"brazier11","state":99,"visible":0,"click":0},{"a":"set","name":"t_brazier12","state":99,"visible":0,"click":0},{"a":"set","name":"brazier12","state":99,"visible":0,"click":0},{"a":"set","name":"brazier13b","state":99,"visible":0,"click":0},{"a":"set","name":"t_brazier13b","state":99,"visible":0,"click":0},{"a":"set","name":"t_brazier14","state":99,"visible":0,"click":0},{"a":"set","name":"brazier14","state":99,"visible":0,"click":0},{"a":"set","name":"t_brazier15","state":99,"visible":0,"click":0},{"a":"set","name":"brazier15","state":99,"visible":0,"click":0},{"a":"set","name":"t_brazier17","state":99,"visible":0,"click":0},{"a":"set","name":"brazier17","state":99,"visible":0,"click":0},{"a":"set","name":"t_brazier19","state":99,"visible":0,"click":0},{"a":"set","name":"brazier19","state":99,"visible":0,"click":0},{"a":"set","name":"t_brazier20","state":99,"visible":0,"click":0},{"a":"set","name":"brazier20","state":99,"visible":0,"click":0},{"a":"set","name":"pod49","state":0,"visible":1,"click":1},{"a":"set","name":"pod44","state":0,"visible":1,"click":1},{"a":"set","name":"pod48","state":0,"visible":1,"click":1},{"a":"set","name":"pod30","state":0,"visible":1,"click":1},{"a":"set","name":"pod8","state":0,"visible":1,"click":1},{"a":"set","name":"pod9","state":0,"visible":1,"click":1},{"a":"set","name":"pod10","state":0,"visible":1,"click":1},{"a":"set","name":"pod11","state":0,"visible":1,"click":1},{"a":"set","name":"pod12","state":0,"visible":1,"click":1},{"a":"set","name":"pod43","state":0,"visible":1,"click":1},{"a":"set","name":"phantom__22a","state":99,"visible":0,"click":0},{"a":"set","name":"phantom__3a","state":99,"visible":0,"click":0},{"a":"set","name":"boss_easy","state":99,"visible":0,"click":0},{"a":"set","name":"boss_hard","state":99,"visible":0,"click":0}]},{"id":2,"when":"trigger","name":"questready","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"path","name":"boss_easy","path":"kingpath"},{"a":"set","name":"boss_easy","state":0,"visible":1,"click":1},{"a":"goal","str":3885}]},{"id":3,"when":"trigger","name":"easystart","once":false,"holding":"","nth":0,"actions":[{"a":"teleport","name":"start_e"},{"a":"wait","ms":820},{"a":"send","cmd":"qicon","fields":"cosmo1e|1"},{"a":"set","name":"phantom_4f","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_6f","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_7f","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_8f","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_18f","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_19f","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_20f","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_21f","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_23f","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_28f","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_17","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_12","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_13","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_14","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_15","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_24","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_16","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_18","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_19","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_20","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_21","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_26","state":99,"visible":0,"click":0},{"a":"set","name":"boss_hard","state":99,"visible":0,"click":0}]},{"id":4,"when":"trigger","name":"cosmo1e","once":false,"holding":"","nth":0,"actions":[{"a":"talk","name":"cosmo1e","str":3914,"mode":0},{"a":"wait","ms":4830},{"a":"send","cmd":"qtorch","fields":"0|1|lightme"},{"a":"send","cmd":"qtorch","fields":"0|1|torch2"},{"a":"send","cmd":"qtorch","fields":"0|1|torch3"},{"a":"send","cmd":"qtorch","fields":"0|1|torch4"}]},{"id":5,"when":"answer","name":"cosmo1e","once":true,"holding":"","nth":0,"actions":[{"a":"var","name":"00_uri","value":1},{"a":"var","name":"players","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure4-thehive/#00-start/#0#001"},{"a":"var","name":"00_uri","value":99},{"a":"send","cmd":"qicon","fields":"cosmo1e|0"},{"a":"show","name":"cosmo1e","click":1},{"a":"goal","str":3921},{"a":"artstate","name":"cosmo1e","state":"disappear"},{"a":"set","name":"cosmo1e","state":2,"visible":1,"click":1},{"a":"set","name":"cosmo1e","state":3,"visible":1,"click":0},{"a":"wait","ms":1180},{"a":"set","name":"cosmo1e","state":99,"visible":0,"click":0}]},{"id":6,"when":"attacked","name":"pod2","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod2|80|10|0"}]},{"id":7,"when":"attacked","name":"pod2","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod2|60|10|0"}]},{"id":8,"when":"attacked","name":"pod2","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod2|40|10|0"}]},{"id":9,"when":"attacked","name":"pod2","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod2|20|10|0"}]},{"id":10,"when":"attacked","name":"pod2","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod2|10|0|-2996|1519|"},{"a":"xp","amount":5,"name":"pod2"},{"a":"send","cmd":"qspn","fields":"pod2|pod2__give_gem|200|42|3|15|null|null|null"},{"a":"set","name":"podvol2","state":99,"visible":0,"click":0},{"a":"set","name":"pod2","state":2,"visible":1,"click":0}]},{"id":11,"when":"trigger","name":"pod2__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod2__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":12,"when":"attacked","name":"pod24","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod24|80|10|0"}]},{"id":13,"when":"attacked","name":"pod24","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod24|60|10|0"}]},{"id":14,"when":"attacked","name":"pod24","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod24|40|10|0"}]},{"id":15,"when":"attacked","name":"pod24","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod24|20|10|0"}]},{"id":16,"when":"attacked","name":"pod24","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod24|10|0|-3790|1525|"},{"a":"xp","amount":5,"name":"pod24"},{"a":"send","cmd":"qspn","fields":"pod24|pod24__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"podvol24","state":99,"visible":0,"click":0},{"a":"set","name":"pod24","state":2,"visible":1,"click":0}]},{"id":17,"when":"trigger","name":"pod24__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod24__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":18,"when":"attacked","name":"pod3","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod3|80|10|0"}]},{"id":19,"when":"attacked","name":"pod3","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod3|60|10|0"}]},{"id":20,"when":"attacked","name":"pod3","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod3|40|10|0"}]},{"id":21,"when":"attacked","name":"pod3","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod3|20|10|0"}]},{"id":22,"when":"attacked","name":"pod3","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod3|10|0|-3509|1167|"},{"a":"xp","amount":5,"name":"pod3"},{"a":"send","cmd":"qspn","fields":"pod3|pod3__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"podvol3","state":99,"visible":0,"click":0},{"a":"set","name":"pod3","state":2,"visible":1,"click":0}]},{"id":23,"when":"trigger","name":"pod3__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod3__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":24,"when":"attacked","name":"pod3e","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod3e|80|10|0"}]},{"id":25,"when":"attacked","name":"pod3e","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod3e|60|10|0"}]},{"id":26,"when":"attacked","name":"pod3e","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod3e|40|10|0"}]},{"id":27,"when":"attacked","name":"pod3e","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod3e|20|10|0"}]},{"id":28,"when":"attacked","name":"pod3e","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod3e|10|0|-3375|804|"},{"a":"xp","amount":5,"name":"pod3e"},{"a":"send","cmd":"qspn","fields":"pod3e|pod3e__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"podvol3e","state":99,"visible":0,"click":0},{"a":"set","name":"pod3e","state":2,"visible":1,"click":0}]},{"id":29,"when":"trigger","name":"pod3e__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod3e__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":30,"when":"attacked","name":"web2","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web2|80|10|0"}]},{"id":31,"when":"attacked","name":"web2","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web2|60|10|0"}]},{"id":32,"when":"attacked","name":"web2","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web2|40|10|0"}]},{"id":33,"when":"attacked","name":"web2","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web2|20|10|0"}]},{"id":34,"when":"attacked","name":"web2","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"web2|10|0|-2965|633|"},{"a":"xp","amount":5,"name":"web2"},{"a":"hide","name":"blockweb2"},{"a":"xp","amount":2,"name":""}]},{"id":35,"when":"trigger","name":"greelytrig","once":false,"holding":"","nth":0,"actions":[{"a":"appear","name":"greely1","face":""},{"a":"set","name":"greely1","state":2,"visible":1,"click":1},{"a":"goal","str":3920},{"a":"send","cmd":"qicon","fields":"greely1|1"},{"a":"artstate","name":"cosmo1","state":"disappear"},{"a":"set","name":"cosmo1","state":2,"visible":1,"click":1},{"a":"set","name":"cosmo1","state":3,"visible":1,"click":0},{"a":"hide","name":"greelytrig"},{"a":"wait","ms":1420},{"a":"set","name":"cosmo1","state":99,"visible":0,"click":0}]},{"id":36,"when":"trigger","name":"greely1","once":false,"holding":"","nth":0,"actions":[{"a":"talk","name":"greely1","str":3918,"mode":2}]},{"id":37,"when":"answer","name":"greely1","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qicon","fields":"greely1|0"},{"a":"artstate","name":"greely1","state":"disappear"},{"a":"set","name":"greely1","state":3,"visible":1,"click":1},{"a":"goal","str":3921},{"a":"set","name":"greely1","state":4,"visible":1,"click":0},{"a":"set","name":"gem_p1a","state":99,"visible":0,"click":0},{"a":"set","name":"gem_p1b","state":99,"visible":0,"click":0},{"a":"set","name":"gem_p1c","state":99,"visible":0,"click":0},{"a":"set","name":"gem_p1d","state":99,"visible":0,"click":0},{"a":"set","name":"gem_p2a","state":99,"visible":0,"click":0},{"a":"set","name":"gem_p2b","state":99,"visible":0,"click":0},{"a":"set","name":"gem_p2c","state":99,"visible":0,"click":0},{"a":"set","name":"gem_p2d","state":99,"visible":0,"click":0},{"a":"wait","ms":1000},{"a":"set","name":"greely1","state":99,"visible":0,"click":0},{"a":"artstate","name":"cosmo2","state":"appear"},{"a":"set","name":"cosmo2","state":0,"visible":1,"click":1},{"a":"show","name":"cosmo2","click":1}]},{"id":38,"when":"attacked","name":"pod13","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod13|80|10|0"}]},{"id":39,"when":"attacked","name":"pod13","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod13|60|10|0"}]},{"id":40,"when":"attacked","name":"pod13","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod13|40|10|0"}]},{"id":41,"when":"attacked","name":"pod13","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod13|20|10|0"}]},{"id":42,"when":"attacked","name":"pod13","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod13|10|0|-2946|81|"},{"a":"xp","amount":5,"name":"pod13"},{"a":"send","cmd":"qspn","fields":"pod13|pod13__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"podvol13","state":99,"visible":0,"click":0},{"a":"set","name":"pod13","state":2,"visible":1,"click":0}]},{"id":43,"when":"trigger","name":"pod13__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod13__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":44,"when":"attacked","name":"pod14","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod14|80|10|0"}]},{"id":45,"when":"attacked","name":"pod14","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod14|60|10|0"}]},{"id":46,"when":"attacked","name":"pod14","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod14|40|10|0"}]},{"id":47,"when":"attacked","name":"pod14","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod14|20|10|0"}]},{"id":48,"when":"attacked","name":"pod14","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod14|10|0|-2048|578|"},{"a":"xp","amount":5,"name":"pod14"},{"a":"send","cmd":"qspn","fields":"pod14|pod14__give_gem|200|42|3|10|null|null|null"},{"a":"set","name":"podvol14","state":99,"visible":0,"click":0},{"a":"set","name":"pod14","state":2,"visible":1,"click":0}]},{"id":49,"when":"trigger","name":"pod14__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod14__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":50,"when":"attacked","name":"pod19e","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod19e|80|10|0"}]},{"id":51,"when":"attacked","name":"pod19e","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod19e|60|10|0"}]},{"id":52,"when":"attacked","name":"pod19e","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod19e|40|10|0"}]},{"id":53,"when":"attacked","name":"pod19e","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod19e|20|10|0"}]},{"id":54,"when":"attacked","name":"pod19e","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod19e|10|0|-1103|-652|"},{"a":"xp","amount":5,"name":"pod19e"},{"a":"send","cmd":"qspn","fields":"pod19e|pod19e__give_gem|200|42|3|15|null|null|null"},{"a":"set","name":"podvol19e","state":99,"visible":0,"click":0},{"a":"set","name":"pod19e","state":2,"visible":1,"click":0}]},{"id":55,"when":"trigger","name":"pod19e__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod19e__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":56,"when":"attacked","name":"pod16","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod16|80|10|0"}]},{"id":57,"when":"attacked","name":"pod16","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod16|60|10|0"}]},{"id":58,"when":"attacked","name":"pod16","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod16|40|10|0"}]},{"id":59,"when":"attacked","name":"pod16","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod16|20|10|0"}]},{"id":60,"when":"attacked","name":"pod16","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod16|10|0|-433|-642|"},{"a":"xp","amount":5,"name":"pod16"},{"a":"send","cmd":"qspn","fields":"pod16|pod16__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"podvol16","state":99,"visible":0,"click":0},{"a":"set","name":"pod16","state":2,"visible":1,"click":0}]},{"id":61,"when":"trigger","name":"pod16__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod16__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":62,"when":"attacked","name":"pod20","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod20|80|10|0"}]},{"id":63,"when":"attacked","name":"pod20","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod20|60|10|0"}]},{"id":64,"when":"attacked","name":"pod20","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod20|40|10|0"}]},{"id":65,"when":"attacked","name":"pod20","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod20|20|10|0"}]},{"id":66,"when":"attacked","name":"pod20","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod20|10|0|105|-1125|"},{"a":"xp","amount":5,"name":"pod20"},{"a":"send","cmd":"qspn","fields":"pod20|pod20__give_gem|200|42|3|15|null|null|null"},{"a":"set","name":"podvol20","state":99,"visible":0,"click":0},{"a":"set","name":"pod20","state":2,"visible":1,"click":0}]},{"id":67,"when":"trigger","name":"pod20__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod20__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":68,"when":"trigger","name":"cosmo2vol","once":false,"holding":"","nth":1,"nthOn":0,"actions":[{"a":"show","name":"cosmo2vol","click":1},{"a":"goal","str":3645},{"a":"send","cmd":"qicon","fields":"cosmo2|1"},{"a":"set","name":"cosmo2vol","state":2,"visible":0,"click":0}]},{"id":69,"when":"attacked","name":"pod21","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod21|80|10|0"}]},{"id":70,"when":"attacked","name":"pod21","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod21|60|10|0"}]},{"id":71,"when":"attacked","name":"pod21","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod21|40|10|0"}]},{"id":72,"when":"attacked","name":"pod21","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod21|20|10|0"}]},{"id":73,"when":"attacked","name":"pod21","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod21|10|0|-1098|-1711|"},{"a":"xp","amount":5,"name":"pod21"},{"a":"send","cmd":"qspn","fields":"pod21|pod21__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"podvol21","state":99,"visible":0,"click":0},{"a":"set","name":"pod21","state":2,"visible":1,"click":0}]},{"id":74,"when":"trigger","name":"pod21__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod21__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":75,"when":"attacked","name":"pod23","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod23|80|10|0"}]},{"id":76,"when":"attacked","name":"pod23","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod23|60|10|0"}]},{"id":77,"when":"attacked","name":"pod23","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod23|40|10|0"}]},{"id":78,"when":"attacked","name":"pod23","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod23|20|10|0"}]},{"id":79,"when":"attacked","name":"pod23","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod23|10|0|-794|-1228|"},{"a":"xp","amount":5,"name":"pod23"},{"a":"send","cmd":"qspn","fields":"pod23|pod23__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"podvol23","state":99,"visible":0,"click":0},{"a":"set","name":"pod23","state":2,"visible":1,"click":0}]},{"id":80,"when":"trigger","name":"pod23__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod23__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":81,"when":"attacked","name":"pod22","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod22|80|10|0"}]},{"id":82,"when":"attacked","name":"pod22","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod22|60|10|0"}]},{"id":83,"when":"attacked","name":"pod22","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod22|40|10|0"}]},{"id":84,"when":"attacked","name":"pod22","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod22|20|10|0"}]},{"id":85,"when":"attacked","name":"pod22","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod22|10|0|-955|-1141|"},{"a":"xp","amount":5,"name":"pod22"},{"a":"send","cmd":"qspn","fields":"pod22|pod22__give_gem|200|42|3|15|null|null|null"},{"a":"set","name":"podvol22","state":99,"visible":0,"click":0},{"a":"set","name":"pod22","state":2,"visible":1,"click":0}]},{"id":86,"when":"trigger","name":"pod22__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod22__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":87,"when":"attacked","name":"pod19","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod19|80|10|0"}]},{"id":88,"when":"attacked","name":"pod19","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod19|60|10|0"}]},{"id":89,"when":"attacked","name":"pod19","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod19|40|10|0"}]},{"id":90,"when":"attacked","name":"pod19","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod19|20|10|0"}]},{"id":91,"when":"attacked","name":"pod19","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod19|10|0|-1107|-1054|"},{"a":"xp","amount":5,"name":"pod19"},{"a":"send","cmd":"qspn","fields":"pod19|pod19__give_gem|200|42|3|10|null|null|null"},{"a":"set","name":"podvol19","state":99,"visible":0,"click":0},{"a":"set","name":"pod19","state":2,"visible":1,"click":0}]},{"id":92,"when":"trigger","name":"pod19__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod19__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":93,"when":"trigger","name":"cosmo2","once":false,"holding":"","nth":0,"actions":[{"a":"talk","name":"cosmo2","str":3919,"mode":1}]},{"id":94,"when":"answer","name":"cosmo2","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qicon","fields":"cosmo2|0"},{"a":"set","name":"cosmo2","state":2,"visible":1,"click":1},{"a":"goal","str":3646},{"a":"set","name":"lavatrig1","state":0,"visible":1,"click":1},{"a":"set","name":"lavatrig2","state":0,"visible":1,"click":1},{"a":"set","name":"lavatrig3","state":0,"visible":1,"click":1},{"a":"set","name":"lavatrig4","state":0,"visible":1,"click":1},{"a":"set","name":"torch1","state":0,"visible":1,"click":1},{"a":"set","name":"cosmo2","state":3,"visible":1,"click":0},{"a":"var","name":"10_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure4-thehive/#10-talkedtocosmobydoor/#0#001"},{"a":"var","name":"10_uri","value":99},{"a":"send","cmd":"qicon","fields":"gem_icon_p3a|1"},{"a":"send","cmd":"qicon","fields":"gem_icon_p3b|1"},{"a":"send","cmd":"qicon","fields":"gem_icon_p3c|1"},{"a":"send","cmd":"qicon","fields":"gem_icon_p3d|1"}]},{"id":95,"when":"answer","name":"cosmo2","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"set","name":"cosmo2","state":3,"visible":1,"click":0}]},{"id":96,"when":"answer","name":"cosmo2","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"set","name":"cosmo2","state":3,"visible":1,"click":0}]},{"id":97,"when":"answer","name":"cosmo2","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"set","name":"cosmo2","state":3,"visible":1,"click":0}]},{"id":98,"when":"answer","name":"cosmo2","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"var","name":"20_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure4-thehive/#20-foundthefirststone/#0#001"},{"a":"var","name":"20_uri","value":99},{"a":"goal","str":3677},{"a":"set","name":"cosmo2","state":3,"visible":1,"click":0}]},{"id":99,"when":"answer","name":"cosmo2","once":false,"holding":"","nth":6,"nthOn":false,"actions":[{"a":"set","name":"cosmo2","state":3,"visible":1,"click":0}]},{"id":100,"when":"answer","name":"cosmo2","once":false,"holding":"","nth":7,"nthOn":false,"actions":[{"a":"var","name":"30_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure4-thehive/#30-foundthesecondstone/#0#001"},{"a":"var","name":"30_uri","value":99},{"a":"goal","str":3883},{"a":"set","name":"cosmo2","state":3,"visible":1,"click":0}]},{"id":101,"when":"answer","name":"cosmo2","once":false,"holding":"","nth":8,"nthOn":false,"actions":[{"a":"var","name":"40_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure4-thehive/#40-foundthethirdstone/#0#001"},{"a":"var","name":"40_uri","value":99},{"a":"goal","str":3884},{"a":"set","name":"cosmo2","state":3,"visible":1,"click":0}]},{"id":102,"when":"answer","name":"cosmo2","once":false,"holding":"","nth":9,"nthOn":false,"actions":[{"a":"artstate","name":"cosmo2","state":"disappear"},{"a":"set","name":"cosmo2","state":9,"visible":1,"click":1},{"a":"show","name":"lavadoor","click":0},{"a":"send","cmd":"qmusic","fields":"0"},{"a":"sound","sound":"ajq_firedoor"},{"a":"set","name":"cosmo2","state":10,"visible":1,"click":0},{"a":"var","name":"50_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure4-thehive/#50-findthealphastones/#0#001"},{"a":"var","name":"50_uri","value":99},{"a":"goal","str":10783},{"a":"wait","ms":2460},{"a":"set","name":"cosmo2","state":99,"visible":0,"click":0},{"a":"set","name":"exitblock0","state":99,"visible":0,"click":0}]},{"id":103,"when":"attacked","name":"pod18","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod18|80|10|0"}]},{"id":104,"when":"attacked","name":"pod18","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod18|60|10|0"}]},{"id":105,"when":"attacked","name":"pod18","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod18|40|10|0"}]},{"id":106,"when":"attacked","name":"pod18","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod18|20|10|0"}]},{"id":107,"when":"attacked","name":"pod18","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod18|10|0|-1443|-2053|"},{"a":"xp","amount":5,"name":"pod18"},{"a":"send","cmd":"qspn","fields":"pod18|pod18__give_gem|200|42|3|15|null|null|null"},{"a":"set","name":"podvol18","state":99,"visible":0,"click":0},{"a":"set","name":"pod18","state":2,"visible":1,"click":0}]},{"id":108,"when":"trigger","name":"pod18__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod18__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":109,"when":"trigger","name":"torch1","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qgi","fields":"torch"}]},{"id":110,"when":"pickedUp","name":"torch","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qgi","fields":"torch"}]},{"id":111,"when":"trigger","name":"seedpile0","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3}]},{"id":112,"when":"attacked","name":"pod17","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod17|80|10|0"}]},{"id":113,"when":"attacked","name":"pod17","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod17|60|10|0"}]},{"id":114,"when":"attacked","name":"pod17","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod17|40|10|0"}]},{"id":115,"when":"attacked","name":"pod17","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod17|20|10|0"}]},{"id":116,"when":"attacked","name":"pod17","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod17|10|0|-1654|-1361|"},{"a":"xp","amount":5,"name":"pod17"},{"a":"send","cmd":"qspn","fields":"pod17|pod17__give_gem|200|42|3|10|null|null|null"},{"a":"set","name":"podvol17","state":99,"visible":0,"click":0},{"a":"set","name":"pod17","state":2,"visible":1,"click":0}]},{"id":117,"when":"trigger","name":"pod17__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod17__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":118,"when":"attacked","name":"pod59","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod59|80|10|0"}]},{"id":119,"when":"attacked","name":"pod59","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod59|60|10|0"}]},{"id":120,"when":"attacked","name":"pod59","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod59|40|10|0"}]},{"id":121,"when":"attacked","name":"pod59","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod59|20|10|0"}]},{"id":122,"when":"attacked","name":"pod59","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod59|10|0|-2371|-1309|"},{"a":"xp","amount":5,"name":"pod59"},{"a":"send","cmd":"qspn","fields":"pod59|pod59__give_gem|200|42|3|10|null|null|null"},{"a":"set","name":"podvol59","state":99,"visible":0,"click":0},{"a":"set","name":"pod59","state":2,"visible":1,"click":0}]},{"id":123,"when":"trigger","name":"pod59__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod59__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":124,"when":"attacked","name":"pod26","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod26|80|10|0"}]},{"id":125,"when":"attacked","name":"pod26","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod26|60|10|0"}]},{"id":126,"when":"attacked","name":"pod26","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod26|40|10|0"}]},{"id":127,"when":"attacked","name":"pod26","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod26|20|10|0"}]},{"id":128,"when":"attacked","name":"pod26","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod26|10|0|-2819|-1498|"},{"a":"xp","amount":5,"name":"pod26"},{"a":"send","cmd":"qspn","fields":"pod26|pod26__give_gem|200|42|3|10|null|null|null"},{"a":"set","name":"podvol26","state":99,"visible":0,"click":0},{"a":"set","name":"pod26","state":2,"visible":1,"click":0}]},{"id":129,"when":"trigger","name":"pod26__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod26__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":130,"when":"trigger","name":"brazier1","once":true,"holding":"","nth":0,"actions":[{"a":"show","name":"t_brazier1","click":0},{"a":"show","name":"bridge1","click":0},{"a":"set","name":"brazierlit1","state":99,"visible":0,"click":0},{"a":"set","name":"brazierlit1","state":0,"visible":1,"click":0},{"a":"send","cmd":"qtorch","fields":"0|1|brazierlit1"},{"a":"xp","amount":5,"name":"brazier1"},{"a":"show","name":"brazier1","click":0},{"a":"wait","ms":1230},{"a":"set","name":"blockbridg1","state":99,"visible":0,"click":0}]},{"id":131,"when":"attacked","name":"pod4","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod4|80|10|0"}]},{"id":132,"when":"attacked","name":"pod4","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod4|60|10|0"}]},{"id":133,"when":"attacked","name":"pod4","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod4|40|10|0"}]},{"id":134,"when":"attacked","name":"pod4","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod4|20|10|0"}]},{"id":135,"when":"attacked","name":"pod4","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod4|10|0|-3791|-1140|"},{"a":"xp","amount":5,"name":"pod4"},{"a":"send","cmd":"qspn","fields":"pod4|pod4__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"podvol4","state":99,"visible":0,"click":0},{"a":"set","name":"pod4","state":2,"visible":1,"click":0}]},{"id":136,"when":"attacked","name":"pod27","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod27|80|10|0"}]},{"id":137,"when":"attacked","name":"pod27","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod27|60|10|0"}]},{"id":138,"when":"attacked","name":"pod27","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod27|40|10|0"}]},{"id":139,"when":"attacked","name":"pod27","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod27|20|10|0"}]},{"id":140,"when":"attacked","name":"pod27","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod27|10|0|-4002|-1463|"},{"a":"xp","amount":5,"name":"pod27"},{"a":"send","cmd":"qspn","fields":"pod27|pod27__give_gem|200|42|3|10|null|null|null"},{"a":"set","name":"podvol27","state":99,"visible":0,"click":0},{"a":"set","name":"pod27","state":2,"visible":1,"click":0}]},{"id":141,"when":"trigger","name":"pod27__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod27__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":142,"when":"attacked","name":"pod6","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod6|80|10|0"}]},{"id":143,"when":"attacked","name":"pod6","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod6|60|10|0"}]},{"id":144,"when":"attacked","name":"pod6","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod6|40|10|0"}]},{"id":145,"when":"attacked","name":"pod6","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod6|20|10|0"}]},{"id":146,"when":"attacked","name":"pod6","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod6|10|0|-4019|-1728|"},{"a":"xp","amount":5,"name":"pod6"},{"a":"send","cmd":"qspn","fields":"pod6|pod6__give_gem|200|42|3|10|null|null|null"},{"a":"set","name":"podvol6","state":99,"visible":0,"click":0},{"a":"set","name":"pod6","state":2,"visible":1,"click":0}]},{"id":147,"when":"trigger","name":"pod6__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod6__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":148,"when":"opened","name":"p3_treasure1","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"p3_treasure1"}]},{"id":149,"when":"attacked","name":"pod39","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod39|80|10|0"}]},{"id":150,"when":"attacked","name":"pod39","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod39|60|10|0"}]},{"id":151,"when":"attacked","name":"pod39","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod39|40|10|0"}]},{"id":152,"when":"attacked","name":"pod39","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod39|20|10|0"}]},{"id":153,"when":"attacked","name":"pod39","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod39|10|0|-3272|-1981|"},{"a":"xp","amount":5,"name":"pod39"},{"a":"send","cmd":"qspn","fields":"pod39|pod39__give_gem|200|42|3|10|null|null|null"},{"a":"set","name":"podvol39","state":99,"visible":0,"click":0},{"a":"set","name":"pod39","state":2,"visible":1,"click":0}]},{"id":154,"when":"trigger","name":"pod39__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod39__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":155,"when":"trigger","name":"pod4__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod4__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":156,"when":"pickedUp","name":"gem_p3b","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qicon","fields":"gem_icon_p3b|0"}]},{"id":157,"when":"planted","name":"","once":false,"holding":"","nth":23,"nthOn":0,"actions":[{"a":"set","name":"seedpile7","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer7","value":0}]},{"id":158,"when":"planted","name":"","once":false,"holding":"","nth":36,"nthOn":0,"actions":[{"a":"set","name":"seedpile7","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer7","value":0}]},{"id":159,"when":"trigger","name":"phantom__1a__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom__1a__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":160,"when":"trigger","name":"pod28__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod28__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":161,"when":"attacked","name":"pod29","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod29|80|10|0"}]},{"id":162,"when":"attacked","name":"pod29","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod29|60|10|0"}]},{"id":163,"when":"attacked","name":"pod29","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod29|40|10|0"}]},{"id":164,"when":"attacked","name":"pod29","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod29|20|10|0"}]},{"id":165,"when":"attacked","name":"pod29","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod29|10|0|-3746|-531|"},{"a":"xp","amount":5,"name":"pod29"},{"a":"send","cmd":"qspn","fields":"pod29|pod29__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"podvol29","state":99,"visible":0,"click":0},{"a":"set","name":"pod29","state":2,"visible":1,"click":0}]},{"id":166,"when":"trigger","name":"pod29__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod29__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":167,"when":"attacked","name":"pod31e","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod31e|80|10|0"}]},{"id":168,"when":"attacked","name":"pod31e","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod31e|60|10|0"}]},{"id":169,"when":"attacked","name":"pod31e","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod31e|40|10|0"}]},{"id":170,"when":"attacked","name":"pod31e","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod31e|20|10|0"}]},{"id":171,"when":"attacked","name":"pod31e","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod31e|10|0|-4769|19|"},{"a":"xp","amount":5,"name":"pod31e"},{"a":"send","cmd":"qspn","fields":"pod31e|pod31e__give_gem|200|42|3|15|null|null|null"},{"a":"set","name":"podvol31e","state":99,"visible":0,"click":0},{"a":"set","name":"pod31e","state":2,"visible":1,"click":0}]},{"id":172,"when":"trigger","name":"pod31e__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod31e__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":173,"when":"attacked","name":"pod31","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod31|80|10|0"}]},{"id":174,"when":"attacked","name":"pod31","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod31|60|10|0"}]},{"id":175,"when":"attacked","name":"pod31","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod31|40|10|0"}]},{"id":176,"when":"attacked","name":"pod31","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod31|20|10|0"}]},{"id":177,"when":"attacked","name":"pod31","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod31|10|0|-5065|192|"},{"a":"xp","amount":5,"name":"pod31"},{"a":"send","cmd":"qspn","fields":"pod31|pod31__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"podvol31","state":99,"visible":0,"click":0},{"a":"set","name":"pod31","state":2,"visible":1,"click":0}]},{"id":178,"when":"trigger","name":"pod31__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod31__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":179,"when":"pickedUp","name":"gem_p3a","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qicon","fields":"gem_icon_p3a|0"}]},{"id":180,"when":"attacked","name":"pod5","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod5|80|10|0"}]},{"id":181,"when":"attacked","name":"pod5","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod5|60|10|0"}]},{"id":182,"when":"attacked","name":"pod5","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod5|40|10|0"}]},{"id":183,"when":"attacked","name":"pod5","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod5|20|10|0"}]},{"id":184,"when":"attacked","name":"pod5","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod5|10|0|-4883|-442|"},{"a":"xp","amount":5,"name":"pod5"},{"a":"send","cmd":"qspn","fields":"pod5|pod5__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"podvol5","state":99,"visible":0,"click":0},{"a":"set","name":"pod5","state":2,"visible":1,"click":0}]},{"id":185,"when":"trigger","name":"pod5__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod5__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":186,"when":"attacked","name":"pod5e","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod5e|80|10|0"}]},{"id":187,"when":"attacked","name":"pod5e","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod5e|60|10|0"}]},{"id":188,"when":"attacked","name":"pod5e","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod5e|40|10|0"}]},{"id":189,"when":"attacked","name":"pod5e","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod5e|20|10|0"}]},{"id":190,"when":"attacked","name":"pod5e","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod5e|10|0|-5139|-666|"},{"a":"xp","amount":5,"name":"pod5e"},{"a":"send","cmd":"qspn","fields":"pod5e|pod5e__give_gem|200|42|3|10|null|null|null"},{"a":"set","name":"podvol5e","state":99,"visible":0,"click":0},{"a":"set","name":"pod5e","state":2,"visible":1,"click":0}]},{"id":191,"when":"trigger","name":"pod5e__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod5e__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":192,"when":"trigger","name":"brazier2","once":true,"holding":"","nth":0,"actions":[{"a":"show","name":"t_brazier2","click":0},{"a":"show","name":"bridge2","click":0},{"a":"set","name":"brazierlit2","state":99,"visible":0,"click":0},{"a":"set","name":"brazierlit2","state":0,"visible":1,"click":0},{"a":"send","cmd":"qtorch","fields":"0|1|brazierlit2"},{"a":"xp","amount":5,"name":"brazier2"},{"a":"show","name":"brazier2","click":0},{"a":"wait","ms":1520},{"a":"set","name":"blockbridg2","state":99,"visible":0,"click":0}]},{"id":193,"when":"trigger","name":"seedpile5","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3}]},{"id":194,"when":"attacked","name":"pod37","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod37|80|10|0"}]},{"id":195,"when":"attacked","name":"pod37","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod37|60|10|0"}]},{"id":196,"when":"attacked","name":"pod37","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod37|40|10|0"}]},{"id":197,"when":"attacked","name":"pod37","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod37|20|10|0"}]},{"id":198,"when":"attacked","name":"pod37","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod37|10|0|-5260|-1629|"},{"a":"xp","amount":5,"name":"pod37"},{"a":"send","cmd":"qspn","fields":"pod37|pod37__give_gem|200|42|3|15|null|null|null"},{"a":"set","name":"podvol37","state":99,"visible":0,"click":0},{"a":"set","name":"pod37","state":2,"visible":1,"click":0}]},{"id":199,"when":"trigger","name":"pod37__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod37__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":200,"when":"trigger","name":"brazier10","once":true,"holding":"","nth":0,"actions":[{"a":"show","name":"t_brazier10","click":0},{"a":"show","name":"bridge10","click":0},{"a":"set","name":"brazierlit10","state":99,"visible":0,"click":0},{"a":"set","name":"brazierlit10","state":0,"visible":1,"click":0},{"a":"send","cmd":"qtorch","fields":"0|1|brazierlit10"},{"a":"xp","amount":5,"name":"brazier10"},{"a":"show","name":"brazier10","click":0},{"a":"wait","ms":1200},{"a":"set","name":"blockbridg10","state":99,"visible":0,"click":0}]},{"id":201,"when":"attacked","name":"pod38","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod38|80|10|0"}]},{"id":202,"when":"attacked","name":"pod38","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod38|60|10|0"}]},{"id":203,"when":"attacked","name":"pod38","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod38|40|10|0"}]},{"id":204,"when":"attacked","name":"pod38","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod38|20|10|0"}]},{"id":205,"when":"attacked","name":"pod38","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod38|10|0|-5952|-1757|"},{"a":"xp","amount":5,"name":"pod38"},{"a":"send","cmd":"qspn","fields":"pod38|pod38__give_gem|200|42|3|15|null|null|null"},{"a":"set","name":"podvol38","state":99,"visible":0,"click":0},{"a":"set","name":"pod38","state":2,"visible":1,"click":0}]},{"id":206,"when":"trigger","name":"pod38__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod38__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":207,"when":"opened","name":"p3_treasure2","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"p3_treasure2"}]},{"id":208,"when":"attacked","name":"pod40","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod40|80|10|0"}]},{"id":209,"when":"attacked","name":"pod40","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod40|60|10|0"}]},{"id":210,"when":"attacked","name":"pod40","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod40|40|10|0"}]},{"id":211,"when":"attacked","name":"pod40","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod40|20|10|0"}]},{"id":212,"when":"attacked","name":"pod40","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod40|10|0|-4480|-2061|"},{"a":"xp","amount":5,"name":"pod40"},{"a":"send","cmd":"qspn","fields":"pod40|pod40__give_gem|200|42|3|15|null|null|null"},{"a":"set","name":"podvol40","state":99,"visible":0,"click":0},{"a":"set","name":"pod40","state":2,"visible":1,"click":0}]},{"id":213,"when":"trigger","name":"pod40__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod40__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":214,"when":"attacked","name":"pod35","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod35|80|10|0"}]},{"id":215,"when":"attacked","name":"pod35","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod35|60|10|0"}]},{"id":216,"when":"attacked","name":"pod35","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod35|40|10|0"}]},{"id":217,"when":"trigger","name":"pod35__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod35__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":218,"when":"attacked","name":"pod41","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod41|80|10|0"}]},{"id":219,"when":"attacked","name":"pod41","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod41|60|10|0"}]},{"id":220,"when":"attacked","name":"pod41","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod41|40|10|0"}]},{"id":221,"when":"attacked","name":"pod41","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod41|20|10|0"}]},{"id":222,"when":"attacked","name":"pod41","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod41|10|0|-4037|-2311|"},{"a":"xp","amount":5,"name":"pod41"},{"a":"send","cmd":"qspn","fields":"pod41|pod41__give_gem|200|42|3|10|null|null|null"},{"a":"set","name":"podvol41","state":99,"visible":0,"click":0},{"a":"set","name":"pod41","state":2,"visible":1,"click":0}]},{"id":223,"when":"trigger","name":"pod41__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod41__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":224,"when":"trigger","name":"brazier23","once":true,"holding":"","nth":0,"actions":[{"a":"show","name":"t_brazier23","click":0},{"a":"show","name":"bridge23","click":0},{"a":"set","name":"brazierlit23","state":99,"visible":0,"click":0},{"a":"set","name":"brazierlit23","state":0,"visible":1,"click":0},{"a":"send","cmd":"qtorch","fields":"0|1|brazierlit23"},{"a":"xp","amount":5,"name":"brazier23"},{"a":"show","name":"brazier23","click":0},{"a":"wait","ms":1000},{"a":"set","name":"blockbridg23","state":99,"visible":0,"click":0}]},{"id":225,"when":"pickedUp","name":"gem_p3c","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qicon","fields":"gem_icon_p3c|0"}]},{"id":226,"when":"trigger","name":"brazier5","once":true,"holding":"","nth":0,"actions":[{"a":"show","name":"t_brazier5","click":0},{"a":"show","name":"bridge5","click":0},{"a":"set","name":"brazierlit5","state":99,"visible":0,"click":0},{"a":"set","name":"brazierlit5","state":0,"visible":1,"click":0},{"a":"send","cmd":"qtorch","fields":"0|1|brazierlit5"},{"a":"xp","amount":5,"name":"brazier5"},{"a":"show","name":"brazier5","click":0},{"a":"wait","ms":1810},{"a":"set","name":"blockbridg5","state":99,"visible":0,"click":0}]},{"id":227,"when":"trigger","name":"seedpile3e","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3}]},{"id":228,"when":"trigger","name":"brazier22","once":true,"holding":"","nth":0,"actions":[{"a":"show","name":"t_brazier22","click":0},{"a":"show","name":"bridge22","click":0},{"a":"set","name":"brazierlit22","state":99,"visible":0,"click":0},{"a":"set","name":"brazierlit22","state":0,"visible":1,"click":0},{"a":"send","cmd":"qtorch","fields":"0|1|brazierlit22"},{"a":"xp","amount":5,"name":"brazier22"},{"a":"show","name":"brazier22","click":0}]},{"id":229,"when":"attacked","name":"pod7","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod7|80|10|0"}]},{"id":230,"when":"attacked","name":"pod7","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod7|60|10|0"}]},{"id":231,"when":"attacked","name":"pod7","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod7|40|10|0"},{"a":"wait","ms":170},{"a":"set","name":"blockbridg22","state":99,"visible":0,"click":0}]},{"id":232,"when":"attacked","name":"pod7","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod7|20|10|0"}]},{"id":233,"when":"attacked","name":"pod7","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod7|10|0|-2331|-2500|"},{"a":"xp","amount":5,"name":"pod7"},{"a":"send","cmd":"qspn","fields":"pod7|pod7__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"podvol7","state":99,"visible":0,"click":0},{"a":"set","name":"pod7","state":2,"visible":1,"click":0}]},{"id":234,"when":"trigger","name":"pod7__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod7__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":235,"when":"trigger","name":"brazier13","once":true,"holding":"","nth":0,"actions":[{"a":"show","name":"t_brazier13","click":0},{"a":"show","name":"bridge13","click":0},{"a":"set","name":"brazierlit13","state":99,"visible":0,"click":0},{"a":"set","name":"brazierlit13","state":0,"visible":1,"click":0},{"a":"send","cmd":"qtorch","fields":"0|1|brazierlit13"},{"a":"xp","amount":5,"name":"brazier13"},{"a":"show","name":"brazier13","click":0},{"a":"wait","ms":1220},{"a":"set","name":"blockbridg13","state":99,"visible":0,"click":0},{"a":"wait","ms":9010},{"a":"set","name":"blockbridg21","state":99,"visible":0,"click":0}]},{"id":236,"when":"trigger","name":"brazier21","once":true,"holding":"","nth":0,"actions":[{"a":"show","name":"t_brazier21","click":0},{"a":"show","name":"bridge21","click":0},{"a":"set","name":"brazierlit21","state":99,"visible":0,"click":0},{"a":"set","name":"brazierlit21","state":0,"visible":1,"click":0},{"a":"send","cmd":"qtorch","fields":"0|1|brazierlit21"},{"a":"xp","amount":5,"name":"brazier21"},{"a":"show","name":"brazier21","click":0}]},{"id":237,"when":"opened","name":"p3_treasure3","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"p3_treasure3"}]},{"id":238,"when":"trigger","name":"avatar1","once":false,"holding":"","nth":0,"actions":[{"a":"say","name":"avatar1","str":4033,"flag":0}]},{"id":239,"when":"pickedUp","name":"gem_p3d","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qicon","fields":"gem_icon_p3d|0"}]},{"id":240,"when":"trigger","name":"exitvol0","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qfade","fields":"1"},{"a":"set","name":"exitvol0","state":99,"visible":0,"click":0},{"a":"wait","ms":410},{"a":"cutscene","swf":"2533","extra":"null|null"}]},{"id":241,"when":"cutsceneDone","name":"","once":false,"holding":"","nth":0,"actions":[{"a":"show","name":"teleportking","click":1}]},{"id":242,"when":"trigger","name":"teleportking","once":false,"holding":"","nth":0,"actions":[{"a":"room","key":"bossenter3","spawn":"bossenter3"}]},{"id":243,"when":"trigger","name":"seedpile9","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"seedpile9","state":99,"visible":0,"click":0},{"a":"show","name":"seedpile9t","click":0},{"a":"var","name":"seedcount","value":"{count}"},{"a":"wait","ms":46600},{"a":"set","name":"seedpile9t","state":0,"visible":1,"click":0},{"a":"var","name":"seeddelay","value":0},{"a":"wait","ms":1000},{"a":"set","name":"seedpile9","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer9","value":0}]},{"id":244,"when":"trigger","name":"seedpile10","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"seedpile10","state":99,"visible":0,"click":0},{"a":"show","name":"seedpile10t","click":0},{"a":"var","name":"seedcount","value":"{count}"},{"a":"wait","ms":46600},{"a":"set","name":"seedpile10t","state":0,"visible":1,"click":0},{"a":"var","name":"seeddelay","value":0},{"a":"wait","ms":1000},{"a":"set","name":"seedpile10","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer10","value":0}]},{"id":245,"when":"trigger","name":"seedpile7","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"seedpile7","state":99,"visible":0,"click":0},{"a":"show","name":"seedpile7t","click":0},{"a":"var","name":"seedcount","value":"{count}"},{"a":"wait","ms":46600},{"a":"set","name":"seedpile7t","state":0,"visible":1,"click":0},{"a":"var","name":"seeddelay","value":0},{"a":"wait","ms":1000},{"a":"set","name":"seedpile7","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer7","value":0}]},{"id":246,"when":"trigger","name":"seedpile6","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"seedpile6","state":99,"visible":0,"click":0},{"a":"show","name":"seedpile6t","click":0},{"a":"var","name":"seedcount","value":"{count}"},{"a":"wait","ms":46600},{"a":"set","name":"seedpile6t","state":0,"visible":1,"click":0},{"a":"var","name":"seeddelay","value":0},{"a":"wait","ms":1000},{"a":"set","name":"seedpile6","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer6","value":0}]},{"id":247,"when":"trigger","name":"seedpile8","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"seedpile8","state":99,"visible":0,"click":0},{"a":"show","name":"seedpile8t","click":0},{"a":"var","name":"seedcount","value":"{count}"},{"a":"wait","ms":46600},{"a":"set","name":"seedpile8t","state":0,"visible":1,"click":0},{"a":"var","name":"seeddelay","value":0},{"a":"wait","ms":1000},{"a":"set","name":"seedpile8","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer8","value":0}]},{"id":248,"when":"trigger","name":"cosmo3","once":false,"holding":"","nth":0,"actions":[{"a":"talk","name":"cosmo3","str":3916,"mode":1}]},{"id":249,"when":"answer","name":"cosmo3","once":true,"holding":"","nth":0,"actions":[{"a":"set","name":"cosmo3","state":2,"visible":1,"click":1},{"a":"send","cmd":"qicon","fields":"cosmo3|0"},{"a":"show","name":"portalsound","click":0},{"a":"show","name":"exitportal","click":0},{"a":"xp","amount":50,"name":"cosmo3"},{"a":"goal","str":3915},{"a":"set","name":"cosmo3","state":3,"visible":1,"click":0},{"a":"wait","ms":550},{"a":"var","name":"70_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure4-thehive/#70-exit/#0#001"},{"a":"prize","list":"gems 1000, den 57, den 58, den 62, gems 750"}]},{"id":250,"when":"gifted","name":"","once":false,"holding":"","nth":0,"actions":[{"a":"wait","ms":350},{"a":"set","name":"exitblock","state":99,"visible":0,"click":0}]},{"id":251,"when":"trigger","name":"exitvol","once":false,"holding":"","nth":0,"actions":[{"a":"end"}]},{"id":252,"holding":"","when":"trigger","name":"lavatrig#","family":true,"holdFam":"","unlessFam":"gem_p#","once":false,"nth":0,"actions":[{"a":"say","name":"{name}","str":3917,"flag":2},{"a":"set","name":"cosmo2","state":4,"visible":1,"click":1},{"a":"talk","name":"cosmo2","str":3907,"mode":4}]},{"id":253,"holding":"","when":"trigger","name":"lavatrig#","family":true,"holdFam":"gem_p#","unlessFam":"","once":true,"nth":0,"actions":[{"a":"use"},{"a":"show","name":"lava{n}","click":0},{"a":"show","name":"lavatile{n}","click":0},{"a":"var","name":"lavacount","value":"{count}"},{"a":"xp","amount":25,"name":"{name}"},{"a":"hide","name":"{name}"}]},{"id":254,"holding":"","when":"trigger","name":"phantom_#__give_gem","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"send","cmd":"qad","fields":"{name}|0|null"},{"a":"gems","amount":25}]},{"id":255,"holding":"","when":"trigger","name":"kphant__#a__give_gem","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"send","cmd":"qad","fields":"{name}|0|null"},{"a":"gems","amount":25}]},{"id":256,"holding":"","when":"trigger","name":"kphant__#b__give_gem","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"send","cmd":"qad","fields":"{name}|0|null"},{"a":"gems","amount":25}]},{"id":257,"holding":"","when":"trigger","name":"kphant__#c__give_gem","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"send","cmd":"qad","fields":"{name}|0|null"},{"a":"gems","amount":25}]},{"id":258,"holding":"","when":"trigger","name":"kphant__#d__give_gem","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"send","cmd":"qad","fields":"{name}|0|null"},{"a":"gems","amount":25}]},{"id":259,"holding":"","when":"eaten","name":"","boss":"boss_easy","nth":1,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"send","cmd":"qahs","fields":"{phantom}|90|100|0"}]},{"id":260,"holding":"","when":"eaten","name":"","boss":"boss_easy","nth":2,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"artstate","name":"{phantom}","state":"agro"},{"a":"show","name":"{phantom}","click":1},{"a":"send","cmd":"qahs","fields":"{phantom}|80|100|0"},{"a":"wait","ms":1590},{"a":"send","cmd":"qicon","fields":"cosmo3|1"},{"a":"var","name":"spawner","value":"{count}"},{"a":"artstate","name":"kphant__1a","state":"appear"},{"a":"path","name":"kphant__1a","path":"kpath1"},{"a":"show","name":"kphant__1a","click":1},{"a":"artstate","name":"kphant__5a","state":"appear"},{"a":"path","name":"kphant__5a","path":"kpath3"},{"a":"show","name":"kphant__5a","click":1},{"a":"artstate","name":"kphant__1a","state":"appear"},{"a":"path","name":"kphant__1a","path":"kpath1"},{"a":"show","name":"kphant__1a","click":1},{"a":"artstate","name":"kphant__5a","state":"appear"},{"a":"path","name":"kphant__5a","path":"kpath3"},{"a":"show","name":"kphant__5a","click":1},{"a":"sound","sound":"ajq_phantomminispawn"},{"a":"var","name":"spawntimer","value":0}]},{"id":261,"holding":"","when":"eaten","name":"","boss":"boss_easy","nth":3,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"send","cmd":"qahs","fields":"{phantom}|70|100|0"}]},{"id":262,"holding":"","when":"eaten","name":"","boss":"boss_easy","nth":4,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"artstate","name":"{phantom}","state":"agro"},{"a":"set","name":"{phantom}","state":2,"visible":1,"click":1},{"a":"send","cmd":"qahs","fields":"{phantom}|60|100|0"},{"a":"wait","ms":1620},{"a":"send","cmd":"qicon","fields":"cosmo3|1"},{"a":"var","name":"spawner","value":"{count}"},{"a":"artstate","name":"kphant__2b","state":"appear"},{"a":"path","name":"kphant__2b","path":"kpath1"},{"a":"show","name":"kphant__2b","click":1},{"a":"artstate","name":"kphant__3b","state":"appear"},{"a":"path","name":"kphant__3b","path":"kpath2"},{"a":"show","name":"kphant__3b","click":1},{"a":"artstate","name":"kphant__4b","state":"appear"},{"a":"path","name":"kphant__4b","path":"kpath2"},{"a":"show","name":"kphant__4b","click":1},{"a":"artstate","name":"kphant__6b","state":"appear"},{"a":"path","name":"kphant__6b","path":"kpath3"},{"a":"show","name":"kphant__6b","click":1},{"a":"artstate","name":"kphant__2b","state":"appear"},{"a":"path","name":"kphant__2b","path":"kpath1"},{"a":"show","name":"kphant__2b","click":1},{"a":"artstate","name":"kphant__3b","state":"appear"},{"a":"path","name":"kphant__3b","path":"kpath2"},{"a":"show","name":"kphant__3b","click":1},{"a":"artstate","name":"kphant__4b","state":"appear"},{"a":"path","name":"kphant__4b","path":"kpath2"},{"a":"show","name":"kphant__4b","click":1},{"a":"artstate","name":"kphant__6b","state":"appear"},{"a":"path","name":"kphant__6b","path":"kpath3"},{"a":"show","name":"kphant__6b","click":1},{"a":"sound","sound":"ajq_phantomminispawn"},{"a":"var","name":"spawntimer","value":0}]},{"id":263,"holding":"","when":"eaten","name":"","boss":"boss_easy","nth":5,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"send","cmd":"qahs","fields":"{phantom}|50|100|0"}]},{"id":264,"holding":"","when":"eaten","name":"","boss":"boss_easy","nth":6,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"artstate","name":"{phantom}","state":"agro"},{"a":"set","name":"{phantom}","state":3,"visible":1,"click":1},{"a":"send","cmd":"qahs","fields":"{phantom}|40|100|0"},{"a":"wait","ms":1620},{"a":"send","cmd":"qicon","fields":"cosmo3|1"},{"a":"var","name":"spawner","value":"{count}"},{"a":"artstate","name":"kphant__1c","state":"appear"},{"a":"path","name":"kphant__1c","path":"kpath1"},{"a":"show","name":"kphant__1c","click":1},{"a":"artstate","name":"kphant__3c","state":"appear"},{"a":"path","name":"kphant__3c","path":"kpath2"},{"a":"show","name":"kphant__3c","click":1},{"a":"artstate","name":"kphant__4c","state":"appear"},{"a":"path","name":"kphant__4c","path":"kpath2"},{"a":"show","name":"kphant__4c","click":1},{"a":"artstate","name":"kphant__5c","state":"appear"},{"a":"path","name":"kphant__5c","path":"kpath3"},{"a":"show","name":"kphant__5c","click":1},{"a":"artstate","name":"kphant__1c","state":"appear"},{"a":"path","name":"kphant__1c","path":"kpath1"},{"a":"show","name":"kphant__1c","click":1},{"a":"artstate","name":"kphant__3c","state":"appear"},{"a":"path","name":"kphant__3c","path":"kpath2"},{"a":"show","name":"kphant__3c","click":1},{"a":"artstate","name":"kphant__4c","state":"appear"},{"a":"path","name":"kphant__4c","path":"kpath2"},{"a":"show","name":"kphant__4c","click":1},{"a":"artstate","name":"kphant__5c","state":"appear"},{"a":"path","name":"kphant__5c","path":"kpath3"},{"a":"show","name":"kphant__5c","click":1},{"a":"sound","sound":"ajq_phantomminispawn"},{"a":"var","name":"spawntimer","value":0}]},{"id":265,"holding":"","when":"eaten","name":"","boss":"boss_easy","nth":7,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"send","cmd":"qahs","fields":"{phantom}|30|100|0"}]},{"id":266,"holding":"","when":"eaten","name":"","boss":"boss_easy","nth":8,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"artstate","name":"{phantom}","state":"agro"},{"a":"set","name":"{phantom}","state":4,"visible":1,"click":1},{"a":"send","cmd":"qahs","fields":"{phantom}|20|100|0"},{"a":"wait","ms":1360},{"a":"send","cmd":"qicon","fields":"cosmo3|1"},{"a":"var","name":"spawner","value":"{count}"},{"a":"artstate","name":"kphant__1d","state":"appear"},{"a":"path","name":"kphant__1d","path":"kpath1"},{"a":"show","name":"kphant__1d","click":1},{"a":"artstate","name":"kphant__2d","state":"appear"},{"a":"path","name":"kphant__2d","path":"kpath1"},{"a":"show","name":"kphant__2d","click":1},{"a":"artstate","name":"kphant__3d","state":"appear"},{"a":"path","name":"kphant__3d","path":"kpath2"},{"a":"show","name":"kphant__3d","click":1},{"a":"artstate","name":"kphant__4d","state":"appear"},{"a":"path","name":"kphant__4d","path":"kpath2"},{"a":"show","name":"kphant__4d","click":1},{"a":"artstate","name":"kphant__5d","state":"appear"},{"a":"path","name":"kphant__5d","path":"kpath3"},{"a":"show","name":"kphant__5d","click":1},{"a":"artstate","name":"kphant__6d","state":"appear"},{"a":"path","name":"kphant__6d","path":"kpath3"},{"a":"show","name":"kphant__6d","click":1},{"a":"artstate","name":"kphant__1d","state":"appear"},{"a":"path","name":"kphant__1d","path":"kpath1"},{"a":"show","name":"kphant__1d","click":1},{"a":"artstate","name":"kphant__2d","state":"appear"},{"a":"path","name":"kphant__2d","path":"kpath1"},{"a":"show","name":"kphant__2d","click":1},{"a":"artstate","name":"kphant__3d","state":"appear"},{"a":"path","name":"kphant__3d","path":"kpath2"},{"a":"show","name":"kphant__3d","click":1},{"a":"artstate","name":"kphant__4d","state":"appear"},{"a":"path","name":"kphant__4d","path":"kpath2"},{"a":"show","name":"kphant__4d","click":1},{"a":"artstate","name":"kphant__5d","state":"appear"},{"a":"path","name":"kphant__5d","path":"kpath3"},{"a":"show","name":"kphant__5d","click":1},{"a":"artstate","name":"kphant__6d","state":"appear"},{"a":"path","name":"kphant__6d","path":"kpath3"},{"a":"show","name":"kphant__6d","click":1},{"a":"sound","sound":"ajq_phantomminispawn"},{"a":"var","name":"spawntimer","value":0}]},{"id":267,"holding":"","when":"eaten","name":"","boss":"boss_easy","nth":9,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"send","cmd":"qahs","fields":"{phantom}|10|100|0"}]},{"id":268,"holding":"","when":"eaten","name":"","boss":"boss_easy","nth":10,"once":false,"dies":[100,1],"actions":[{"a":"xp","amount":200,"name":"{phantom}"},{"a":"show","name":"seedpile8t","click":0},{"a":"send","cmd":"qmusic","fields":"0"},{"a":"set","name":"{phantom}","state":6,"visible":1,"click":0},{"a":"wait","ms":600},{"a":"set","name":"kphant__1a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__2a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__3a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__4a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__5a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__6a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__1b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__2b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__3b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__4b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__5b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__6b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__1c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__2c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__3c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__4c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__5c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__6c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__1d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__2d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__3d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__4d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__5d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__6d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__7d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__8d","state":99,"visible":0,"click":0},{"a":"wait","ms":2000},{"a":"sound","sound":"ajq_bossvictorystinger"},{"a":"var","name":"60_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure4-thehive/#60-defeatthephantomking/#0#001"},{"a":"var","name":"60_uri","value":99},{"a":"goal","str":3924},{"a":"wait","ms":5010},{"a":"artstate","name":"cosmo3","state":"appear"},{"a":"set","name":"cosmo3","state":0,"visible":1,"click":1},{"a":"show","name":"cosmo3","click":1},{"a":"send","cmd":"qicon","fields":"cosmo3|1"},{"a":"send","cmd":"qmusic","fields":"ajq_mussafelp"}]},{"id":269,"holding":"","when":"eaten","name":"","nth":0,"once":false,"actions":[{"a":"xp","amount":5,"name":"{phantom}"}]},{"id":270,"holding":"","when":"eaten","name":"","nth":0,"once":false,"notStems":["pod#"],"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_gem|200|42|3|25|null|null|null"}]},{"id":271,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["pod#"],"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_gem|200|42|3|10|null|null|null"}]},{"id":272,"holding":"","when":"eaten","name":"","nth":0,"once":false,"notStems":["phantom__#","pod#","phantom_#"],"actions":[{"a":"set","name":"{phantom}","state":3,"visible":1,"click":0}]},{"id":273,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["phantom__#","pod#","phantom_#"],"actions":[{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":274,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["pod#"],"actions":[{"a":"set","name":"podvol{num}","state":99,"visible":0,"click":0}]}],"written":"2018-01-18 17:56:21","eat":{"phantom__1a":[50,1],"pod28":[50,1],"phantom_2":[50,1],"phantom_11":[50,1],"phantom_25":[50,1],"phantom_5":[50,1],"pod35":[20,1],"phantom_27":[50,1],"phantom_6":[50,1],"phantom_4":[50,1],"phantom_7":[50,1],"phantom_23":[50,1],"phantom_8":[50,1],"kphant__5a":[50,1],"kphant__1a":[50,1],"kphant__6b":[50,1],"kphant__4b":[50,1],"kphant__3b":[50,1],"kphant__2b":[50,1],"kphant__4c":[50,1],"kphant__5c":[50,1],"kphant__3c":[50,1],"kphant__1c":[50,1],"kphant__2d":[50,1],"kphant__1d":[50,1],"kphant__3d":[50,1],"kphant__4d":[50,1],"kphant__5d":[50,1],"kphant__6d":[50,1],"boss_easy":[100,1]},"bars":[],"variantGroups":[],"countRules":[{"counter":"lavacount","value":1,"actions":[{"a":"set","name":"cosmo2","state":5,"visible":1,"click":1},{"a":"talk","name":"cosmo2","str":3887,"mode":5}]},{"counter":"lavacount","value":2,"actions":[{"a":"set","name":"cosmo2","state":6,"visible":1,"click":1},{"a":"talk","name":"cosmo2","str":3908,"mode":6}]},{"counter":"lavacount","value":3,"actions":[{"a":"set","name":"cosmo2","state":7,"visible":1,"click":1},{"a":"talk","name":"cosmo2","str":3910,"mode":7}]},{"counter":"lavacount","value":4,"actions":[{"a":"artstate","name":"phantom__1a","state":"disappear"},{"a":"set","name":"phantom__1a","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_2","state":"disappear"},{"a":"set","name":"phantom_2","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom__3a","state":"disappear"},{"a":"set","name":"phantom__3a","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_4","state":"disappear"},{"a":"set","name":"phantom_4","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_4f","state":"disappear"},{"a":"set","name":"phantom_4f","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_5","state":"disappear"},{"a":"set","name":"phantom_5","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_6","state":"disappear"},{"a":"set","name":"phantom_6","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_6f","state":"disappear"},{"a":"set","name":"phantom_6f","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_7","state":"disappear"},{"a":"set","name":"phantom_7","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_7f","state":"disappear"},{"a":"set","name":"phantom_7f","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_8","state":"disappear"},{"a":"set","name":"phantom_8","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_8f","state":"disappear"},{"a":"set","name":"phantom_8f","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_11","state":"disappear"},{"a":"set","name":"phantom_11","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_12","state":"disappear"},{"a":"set","name":"phantom_12","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_13","state":"disappear"},{"a":"set","name":"phantom_13","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_14","state":"disappear"},{"a":"set","name":"phantom_14","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_15","state":"disappear"},{"a":"set","name":"phantom_15","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_16","state":"disappear"},{"a":"set","name":"phantom_16","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_17","state":"disappear"},{"a":"set","name":"phantom_17","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_18","state":"disappear"},{"a":"set","name":"phantom_18","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_18f","state":"disappear"},{"a":"set","name":"phantom_18f","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_19","state":"disappear"},{"a":"set","name":"phantom_19","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_19f","state":"disappear"},{"a":"set","name":"phantom_19f","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_20","state":"disappear"},{"a":"set","name":"phantom_20","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_20f","state":"disappear"},{"a":"set","name":"phantom_20f","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_21","state":"disappear"},{"a":"set","name":"phantom_21","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_21f","state":"disappear"},{"a":"set","name":"phantom_21f","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom__22a","state":"disappear"},{"a":"set","name":"phantom__22a","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_23","state":"disappear"},{"a":"set","name":"phantom_23","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_23f","state":"disappear"},{"a":"set","name":"phantom_23f","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_24","state":"disappear"},{"a":"set","name":"phantom_24","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_25","state":"disappear"},{"a":"set","name":"phantom_25","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_26","state":"disappear"},{"a":"set","name":"phantom_26","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_27","state":"disappear"},{"a":"set","name":"phantom_27","state":98,"visible":1,"click":0},{"a":"artstate","name":"phantom_28f","state":"disappear"},{"a":"set","name":"phantom_28f","state":98,"visible":1,"click":0},{"a":"set","name":"cosmo2","state":8,"visible":1,"click":1},{"a":"talk","name":"cosmo2","str":3912,"mode":8},{"a":"xp","amount":25,"name":"lavacount"},{"a":"set","name":"phantom__1a","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_2","state":99,"visible":0,"click":0},{"a":"set","name":"phantom__3a","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_4","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_4f","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_5","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_6","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_6f","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_7","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_7f","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_8","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_8f","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_11","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_12","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_13","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_14","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_15","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_16","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_17","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_18","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_18f","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_19","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_19f","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_20","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_20f","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_21","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_21f","state":99,"visible":0,"click":0},{"a":"set","name":"phantom__22a","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_23","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_23f","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_24","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_25","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_26","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_27","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_28f","state":99,"visible":0,"click":0}]}],"puzzles":[],"bosses":["boss_easy"]}
*/
