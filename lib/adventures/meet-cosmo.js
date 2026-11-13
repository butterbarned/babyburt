"use strict";

// Recorded adventure 20, made with the adventure script maker. Plays in adventures.room_adventure_3a, adventures.room_adventure_3f, adventures.room_adventure_3a, adventures.room_adventure_3b, adventures.room_adventure_3a, adventures.room_adventure_3h, adventures.room_adventure_3a, adventures.room_adventure_3c, adventures.room_adventure_3a, adventures.room_adventure_3d, adventures.room_adventure_3a, adventures.room_adventure_3i, adventures.room_adventure_3a.
// To change it, open this file in the maker. Edits made by hand are kept only
// until the maker writes the file again. By hand here: the bridge koalas
// (koala_7, koala_8, koala_9: see "bridge" below), the passage chests
// (c1treasure_3 to _6), and to_3g1 (the last
// cavern's way in) working every time.

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
const SPAWNERS = {"factory_3":[11,2],"factory_4":[11,2],"factory_5":[11,2],"factory_6":[11,2],"factory_8":[11,2],"factory_9":[11,2],"factory_2":[11,2],"c3factory1":[11,2]};
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
    // by hand: put away after it has blown up, so it is not shown again
    q.after(3000, () => set(q, phantom, 99, 0, 0));
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
  if (key === "pipecount 1") {
    set(q, "watervol_9", 99, 0, 0);
    set(q, "lily_9", 0, 1, 0);
  }
  if (key === "pipecount 3") {
    set(q, "watervol_1", 99, 0, 0);
  }
  if (key === "pipecount 4") {
    set(q, "watervol_4", 99, 0, 0);
    set(q, "lily_4", 0, 1, 0);
  }
  if (key === "pipecount 7") {
    set(q, "watervol_5a", 99, 0, 0);
    set(q, "watervol_5b", 99, 0, 0);
    set(q, "watervol_5c", 99, 0, 0);
    set(q, "watervol_5d", 99, 0, 0);
    set(q, "lily_5", 0, 1, 0);
  }
  if (key === "trapnotify 1") {
    q.send("qcmd", 38, 3898);
    q.send("qcmdVT", 1, "50_uri", 1, 0, 0);
    q.send("qposturi", "/adventure3-meetcosmo/#50-rescuedfirstkoala/#0#001");
    q.send("qcmdVT", 1, "50_uri", 99, 0, 0);
  }
  if (key === "trapnotify 2") {
    q.send("qcmd", 38, 3809);
    q.send("qcmdVT", 1, "70_uri", 1, 0, 0);
    q.send("qposturi", "/adventure3-meetcosmo/#70-rescuethekoalas/#0#001");
    q.send("qcmdVT", 1, "70_uri", 99, 0, 0);
  }
  if (key === "water5 3") {
    set(q, "waterfall_3", 0, 1, 0);
    set(q, "waterfall_4", 0, 1, 0);
    q.send("qicon", "cavestone_2", 1);
  }
  if (key === "wateredplant 1") {
    q.send("qcmd", 38, 3824);
  }
  if (key === "wateredplant 2") {
    q.send("qcmd", 38, 3825);
  }
  if (key === "wateredplant 3") {
    q.send("qcmd", 38, 3826);
  }
  if (key === "wateredplant 4") {
    q.send("qcmd", 38, 3827);
  }
  if (key === "wateredplant 5") {
    q.send("qcmd", 38, 3828);
  }
  if (key === "wateredplant 6") {
    q.send("qcmd", 38, 3829);
  }
  if (key === "wateredplant 7") {
    q.xp(25, "wateredplant");
    set(q, "pail_1", 99, 0, 0);
    q.send("qswfs", "cosmo_2", "appear");
    set(q, "cosmo_2", 0, 1, 1);
    set(q, "potion", 0, 1, 0);
    q.send("qicon", "cosmo_2", 1);
    q.send("qcmd", 38, 3809);
    q.send("qcmdVT", 1, "10_uri", 1, 0, 0);
    q.send("qposturi", "/adventure3-meetcosmo/#10-watercrops/#0#001");
    q.send("qcmdVT", 1, "10_uri", 99, 0, 0);
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
// written by hand (not by the maker): the bridge Isaac (koala_7) mends
// with ROPE from Tobias (koala_8, for an APPLE) and TIMBER from Zosi
// (koala_9, for a BANANA), in either order. what each says, and the
// objective, follow how far that has got, not how many times they were
// talked to; talking to Tobias or Zosi shows their trade as the objective
// (as recorded). the timber-first lines (3801, 3802, 3805) are the game's
// own but were not recorded.
const bridge = q => (q.vars.bridge = q.vars.bridge || {ropeGot: false, timberGot: false, rope: false, timber: false, fixed: false, rose: false, moth: false, talk: 0});
const say = (q, name, str) => q.send("qcmd", 2, name, str, 1);
const fixBridge = (q, line) => {
  const b = bridge(q);
  b.fixed = true;
  say(q, "koala_7", line);
  q.send("qcmd", 38, 3804);
  q.send("qicon", "cavestone_2", 1);
  set(q, "wood_bridge", 1, 1, 0);
  set(q, "blockvolbrid", 1, 0, 0);
  set(q, "koala_7", 4, 1, 1);
};
// once the bridge stands, Isaac chats: [his state, the line, "koala_7_talk"]
const ISAAC_CHAT = [[5, 3814, 1], [6, 3815, 2], [7, 3873, 3], [8, 3813, 0]];
const appear = (q, name, face) => {
  if (face) {
    q.send("qswfs", name, face);
  }
  q.send("qswfs", name, "appear");
  set(q, name, 1, 1, 1);
};

// by hand: the passage chests' clothing (lib/prize-pools.js)
const {passageClothing} = require("../prize-pools.js");

// by hand: the crop each watering spot grows (the same in all three recordings)
const GARDEN = {1: "gardenradish", 2: "gardenstrawb", 3: "gardencabbag", 4: "gardentomato", 5: "gardencorn", 6: "gardengrapes", 7: "gardencarro"};

// written by hand (not by the maker): Cosmo goes by how far things have got,
// not by how many times he was clicked or answered.
//  - the ingredients (nectar, chomper seeds, honey), in any order; his line
//    and the objective say what is still missing (states 2 to 20);
//  - then the boomseed crops, one of four orders picked at random (as on the
//    official server: three recordings had three of them), each asked for
//    with a talk; clicked while waiting he gives that crop's hint;
//  - then the boomseeds and the boulder (states 58 to 62).
const COSMO_INGREDIENTS = {nectar: "pickup_necta", chompseeds: "pickup_chomp", honey: "pickup_honey"};
// the first one brought: [his state, his line, the objective]
const COSMO_FIRST = {nectar: [2, 3758, 3833], chompseeds: [8, 3759, 3830], honey: [14, 3760, 3831]};
// the second: by the first, then the second: his state; the line and objective follow what is left
const COSMO_SECOND = {nectar: {chompseeds: 4, honey: 6}, chompseeds: {nectar: 10, honey: 12}, honey: {nectar: 16, chompseeds: 18}};
const COSMO_STILL = {nectar: {honey: 3843, chompseeds: 3844}, chompseeds: {honey: 3845, nectar: 3846}, honey: {nectar: 3847, chompseeds: 3848}};
const COSMO_LEFT_GOAL = {nectar: 3832, honey: 3834, chompseeds: 3835};
// the crops: what he is given (in hand) and where it is picked
const CROP = {radish: ["ga_radish", "pickup_radis"], cabbage: ["ga_cabbage", "pickup_cabba"], corn: ["ga_corn", "pickup_corn"],
  carrot: ["ga_carrot", "pickup_carro"], strawberry: ["ga_strawbery", "pickup_straw"], tomato: ["ga_tomato", "pickup_tomat"], grape: ["ga_grape", "pickup_grape"]};
// the four orders: his first state (then +2 each crop), the crops, his talks (asking the
// first; thanking and asking the next; ...; thanking for the last), the objectives, the hints
const COSMO_ORDERS = [
  {start: 22, crops: ["radish", "cabbage", "corn", "carrot"], talks: [3762, 3764, 3766, 3768, 3770], goals: [3771, 3772, 3773, 3774], hints: [3763, 3765, 3767, 3769]},
  {start: 31, crops: ["strawberry", "tomato", "grape", "radish"], talks: [3775, 3777, 3779, 3781, 3783], goals: [3784, 3785, 3786, 3787], hints: [3776, 3778, 3780, 3782]},
  {start: 40, crops: ["grape", "corn", "tomato", "cabbage"], talks: [3788, 3849, 3851, 3853, 3855], goals: [3856, 3857, 3858, 3859], hints: [3789, 3850, 3852, 3854]},
  {start: 49, crops: ["carrot", "strawberry", "corn", "radish"], talks: [3860, 3862, 3864, 3866, 3868], goals: [3869, 3870, 3871, 3872], hints: [3861, 3863, 3865, 3867]},
];
const cosmo = q => (q.vars.cosmo = q.vars.cosmo || {brought: [], order: null, step: 0, asking: null});
// a talk of his: remembered, so a click before it is answered shows it again
const cosmoTalk = (q, state, line) => {
  const c = cosmo(q);
  c.at = state;
  c.asking = [state, line];
  set(q, "cosmo_2", state, 1, 1);
  q.send("qcmd", 3, 0, "cosmo_2", state, line);
};

// by hand: the nightingale's song on the bamboo pipes, and how many plants there are to water
const SONG = [1, 2, 3, 5, 3];
const ALL_PLANTS = 12;

module.exports = {
  defId: 20,
  title: "Meet Cosmo",
  rooms: {
    start: {room: "adventures.room_adventure_3a", name: "Adventure Tutorial", nameStringId: 18326, music: "ajq_musquest_3"},
    to_3f: {room: "adventures.room_adventure_3f", name: "Adventure Tutorial", nameStringId: 18326, music: "musmeetcosmo"},
    from_3f: {room: "adventures.room_adventure_3a", name: "Adventure Tutorial", nameStringId: 18326, music: "ajq_musquest_3"},
    from_3a_den1: {room: "adventures.room_adventure_3b", name: "Adventure Tutorial", nameStringId: 18326, music: "ajq_mustreehutplayful"},
    from_den1: {room: "adventures.room_adventure_3a", name: "Adventure Tutorial", nameStringId: 18326, music: "ajq_musqueststealth"},
    from_3a1: {room: "adventures.room_adventure_3h", name: "Adventure Tutorial", nameStringId: 18326, music: "ajq_muscaveslides"},
    from_3h2: {room: "adventures.room_adventure_3a", name: "Adventure Tutorial", nameStringId: 18326, music: "ajq_musqueststealth"},
    // by hand: the cave's other way in and out (only the hard recording used it)
    from_3a2: {room: "adventures.room_adventure_3h", name: "Adventure Tutorial", nameStringId: 18326, music: "ajq_muscaveslides"},
    from_3h1: {room: "adventures.room_adventure_3a", name: "Adventure Tutorial", nameStringId: 18326, music: "ajq_musqueststealth"},
    from_3a_den2: {room: "adventures.room_adventure_3c", name: "Adventure Tutorial", nameStringId: 18326, music: "ajq_mustreehutplayful"},
    from_den2: {room: "adventures.room_adventure_3a", name: "Adventure Tutorial", nameStringId: 18326, music: "ajq_musqueststealth"},
    from_3a_den3: {room: "adventures.room_adventure_3d", name: "Adventure Tutorial", nameStringId: 18326, music: "ajq_mustreehutplayful"},
    from_den3: {room: "adventures.room_adventure_3a", name: "Adventure Tutorial", nameStringId: 18326, music: "ajq_musqueststealth"},
    from_3a5: {room: "adventures.room_adventure_3i", name: "Adventure Tutorial", nameStringId: 18326, music: "ajq_muscaveslides"},
    from_3g1: {room: "adventures.room_adventure_3a", name: "Adventure Tutorial", nameStringId: 18326, music: "ajq_musqueststealth"},
  },
  written: "2026-11-11 18:09:44",
  objective: 3809,
  lobby: true, // the "waiting for players" screen first, as on the official server

  // name, type, def, state, visible, needs a click, path, artwork state
  actors: [
    ["queststart", 18, 0, 0, 1, 1, "", ""],
    ["questready", 7, 0, 0, 1, 1, "", ""],
    ["start_init", 8, 0, 0, 0, 1, "", ""],
    ["to_3f", 9, 4, 0, 1, 1, "", ""],
    ["roomtrig_f3f", 3, 0, 0, 1, 1, "", ""],
    ["from_3f", 9, 0, 0, 1, 1, "", ""],
    ["roomtrig_t3f", 3, 0, 0, 1, 1, "", ""],
    ["from_3a_den1", 9, 1, 0, 1, 1, "", ""],
    ["to_3a_den1", 3, 0, 0, 1, 1, "", ""],
    ["from_den1", 9, 0, 0, 1, 1, "", ""],
    ["to_den1", 3, 0, 0, 1, 1, "", ""],
    ["from_3a_den2", 9, 2, 0, 1, 1, "", ""],
    ["to_3a_den2", 3, 0, 0, 1, 1, "", ""],
    ["from_den2", 9, 0, 0, 1, 1, "", ""],
    ["to_den2", 3, 0, 0, 1, 1, "", ""],
    ["from_3a_den3", 9, 3, 0, 1, 1, "", ""],
    ["to_3a_den3", 3, 0, 0, 1, 1, "", ""],
    ["from_den3", 9, 0, 0, 1, 1, "", ""],
    ["to_den3", 3, 0, 0, 1, 1, "", ""],
    ["from_3a1", 9, 5, 0, 1, 1, "", ""],
    ["to_3a1", 3, 0, 0, 1, 1, "", ""],
    ["from_3a2", 9, 5, 0, 1, 1, "", ""],
    ["to_3a2", 3, 0, 0, 1, 1, "", ""],
    ["cave1_exit", 3, 0, 0, 1, 1, "", ""],
    ["from_3h1", 9, 0, 0, 1, 1, "", ""],
    ["to_3h1", 3, 0, 0, 1, 1, "", ""],
    ["from_3h2", 9, 0, 0, 1, 1, "", ""],
    ["to_3h2", 3, 0, 0, 1, 1, "", ""],
    ["from_3g1", 9, 0, 0, 1, 1, "", ""],
    ["to_3g1", 3, 0, 0, 1, 1, "", ""],
    ["from_3a5", 9, 6, 0, 1, 1, "", ""],
    ["to_3a5", 3, 0, 0, 1, 1, "", ""],
    ["treasure_1", 13, 39, 0, 1, 1, "", ""],
    ["treasure_2", 13, 39, 0, 1, 1, "", ""],
    ["treasure_3", 13, 39, 0, 1, 1, "", ""],
    ["treasure_4", 13, 39, 0, 1, 1, "", ""],
    ["treasure_5", 13, 39, 0, 1, 1, "", ""],
    ["treasure_6", 13, 39, 0, 1, 1, "", ""],
    ["treasure_7", 13, 39, 0, 1, 1, "", ""],
    ["c1treasure_1", 13, 39, 0, 1, 1, "", ""],
    ["c1treasure_2", 13, 39, 0, 1, 1, "", ""],
    ["c1treasure_3", 13, 39, 0, 1, 1, "", ""],
    ["c1treasure_4", 13, 39, 0, 1, 1, "", ""],
    ["c1treasure_5", 13, 39, 0, 1, 1, "", ""],
    ["c1treasure_6", 13, 39, 0, 1, 1, "", ""],
    ["c2treasure1", 13, 39, 0, 1, 1, "", ""],
    ["c2treasure1h", 13, 39, 0, 1, 1, "", ""],
    ["c3treasure1", 13, 39, 0, 1, 1, "", ""],
    ["c3treasure2", 13, 39, 0, 1, 1, "", ""],
    ["c3treasure2h", 13, 39, 0, 1, 1, "", ""],
    ["c3treasure3", 13, 39, 0, 1, 1, "", ""],
    ["treasure3b", 13, 39, 0, 1, 1, "", "appear"],
    ["treasure3c", 13, 39, 0, 1, 1, "", "appear"],
    ["treasure3d1", 13, 39, 0, 1, 1, "", "appear"],
    ["treasure3d2", 13, 39, 0, 1, 1, "", "appear"],
    ["blockvol_3g", 5, 0, 0, 1, 1, "", ""],
    ["blockvol_3h", 5, 0, 0, 1, 1, "", ""],
    ["watervol_1", 5, 0, 0, 1, 1, "", ""],
    ["watervol_2", 5, 0, 0, 1, 1, "", ""],
    ["watervol_3", 5, 0, 0, 1, 1, "", ""],
    ["watervol_4", 5, 0, 0, 1, 1, "", ""],
    ["watervol_5a", 5, 0, 0, 1, 1, "", ""],
    ["watervol_5b", 5, 0, 0, 1, 1, "", ""],
    ["watervol_5c", 5, 0, 0, 1, 1, "", ""],
    ["watervol_5d", 5, 0, 0, 1, 1, "", ""],
    ["watervol_9", 5, 0, 0, 1, 1, "", ""],
    ["blockvolvine", 5, 0, 0, 1, 1, "", ""],
    ["blockvolbrid", 5, 0, 0, 1, 1, "", ""],
    ["c3facvol1", 5, 0, 0, 1, 1, "", ""],
    ["c3facvol2", 5, 0, 0, 1, 1, "", ""],
    ["boomrvol5", 5, 0, 0, 1, 1, "", ""],
    ["gardenblock", 5, 0, 0, 1, 1, "", ""],
    ["blockvol_1", 5, 0, 0, 1, 1, "", ""],
    ["blockvol_2", 5, 0, 0, 1, 1, "", ""],
    ["blockvol_3", 5, 0, 0, 1, 1, "", ""],
    ["blockvol_4", 5, 0, 0, 1, 1, "", ""],
    ["factryblok2", 5, 0, 0, 1, 1, "", ""],
    ["factryblok3", 5, 0, 0, 1, 1, "", ""],
    ["factryblok4", 5, 0, 0, 1, 1, "", ""],
    ["factryblok5", 5, 0, 0, 1, 1, "", ""],
    ["factryblok6", 5, 0, 0, 1, 1, "", ""],
    ["factryblok8", 5, 0, 0, 1, 1, "", ""],
    ["factryblok9", 5, 0, 0, 1, 1, "", ""],
    ["trapvol_1", 5, 0, 0, 1, 1, "", ""],
    ["trapvol_3", 5, 0, 0, 1, 1, "", ""],
    ["blockvolhard", 5, 0, 0, 1, 1, "", ""],
    ["stealthvol_1", 5, 0, 0, 1, 1, "", ""],
    ["stealthvol_2", 5, 0, 0, 1, 1, "", ""],
    ["stealthvol_3", 5, 0, 0, 1, 1, "", ""],
    ["stealthvol_4", 5, 0, 0, 1, 1, "", ""],
    ["stealthvol_5", 5, 0, 0, 1, 1, "", ""],
    ["blockweb1", 5, 0, 0, 1, 1, "", ""],
    ["blockweb2", 5, 0, 0, 1, 1, "", ""],
    ["blockweb3", 5, 0, 0, 1, 1, "", ""],
    ["blockweb7", 5, 0, 0, 1, 1, "", ""],
    ["blockweb8", 5, 0, 0, 1, 1, "", ""],
    ["blockweb9", 5, 0, 0, 1, 1, "", ""],
    ["blockweb14", 5, 0, 0, 1, 1, "", ""],
    ["blockweb15", 5, 0, 0, 1, 1, "", ""],
    ["blockweb16", 5, 0, 0, 1, 1, "", ""],
    ["blockweb17", 5, 0, 0, 1, 1, "", ""],
    ["blockweb18", 5, 0, 0, 1, 1, "", ""],
    ["blockweb19", 5, 0, 0, 1, 1, "", ""],
    ["exit_block", 5, 0, 0, 1, 1, "", ""],
    ["c2path1", 20, 0, 0, 1, 1, "", ""],
    ["c2path2", 20, 0, 0, 1, 1, "", ""],
    ["c2path3", 20, 0, 0, 1, 1, "", ""],
    ["c3path1", 20, 0, 0, 1, 1, "", ""],
    ["c3path2", 20, 0, 0, 1, 1, "", ""],
    ["c3path3", 20, 0, 0, 1, 1, "", ""],
    ["c3path4", 20, 0, 0, 1, 1, "", ""],
    ["path_1", 20, 0, 0, 1, 1, "", ""],
    ["path_2", 20, 0, 0, 1, 1, "", ""],
    ["path_3", 20, 0, 0, 1, 1, "", ""],
    ["path_4", 20, 0, 0, 1, 1, "", ""],
    ["path_5", 20, 0, 0, 1, 1, "", ""],
    ["path_6", 20, 0, 0, 1, 1, "", ""],
    ["path_7", 20, 0, 0, 1, 1, "", ""],
    ["path_9", 20, 0, 0, 1, 1, "", ""],
    ["path_10", 20, 0, 0, 1, 1, "", ""],
    ["path_11", 20, 0, 0, 1, 1, "", ""],
    ["path_12", 20, 0, 0, 1, 1, "", ""],
    ["path_13", 20, 0, 0, 1, 1, "", ""],
    ["path_14", 20, 0, 0, 1, 1, "", ""],
    ["path_15", 20, 0, 0, 1, 1, "", ""],
    ["path_16", 20, 0, 0, 1, 1, "", ""],
    ["path_17", 20, 0, 0, 1, 1, "", ""],
    ["path_18", 20, 0, 0, 1, 1, "", ""],
    ["cosmo_1", 1, 25, 0, 1, 1, "", "appear"],
    ["cosmo_1hide", 8, 0, 0, 0, 1, "", ""],
    ["cosmo_2", 1, 25, 0, 1, 1, "", "appear"],
    ["cosmo_x", 1, 25, 0, 1, 1, "", ""],
    ["cosmo_2hide", 8, 0, 0, 0, 1, "", ""],
    ["cosmo_4", 1, 25, 0, 1, 1, "", "facesw"],
    ["gifttimer", 8, 0, 0, 0, 1, "", ""],
    ["cosmo_5", 1, 25, 0, 1, 1, "", "appear"],
    ["cosmo_5hide", 8, 0, 0, 0, 1, "", ""],
    ["koala_1", 1, 117, 0, 1, 1, "", ""],
    ["koala_2", 1, 118, 0, 1, 1, "", ""],
    ["koala_3", 1, 119, 0, 1, 1, "", ""],
    ["koala_4", 1, 120, 0, 1, 1, "", "facesw"],
    ["koala_5", 1, 121, 0, 1, 1, "", ""],
    ["koala_7", 1, 123, 0, 1, 1, "", ""],
    ["koala_8", 1, 124, 0, 1, 1, "", ""],
    ["koala_9", 1, 125, 0, 1, 1, "", ""],
    ["koala_10", 1, 126, 0, 1, 1, "", "facesw"],
    ["pipetrig_1", 1, 69, 0, 1, 1, "", ""],
    ["pipetrig_4", 1, 69, 0, 1, 1, "", ""],
    ["pipetrig_2", 1, 69, 0, 1, 1, "", ""],
    ["pipetrig_3", 1, 69, 0, 1, 1, "", ""],
    ["pipetrig_9", 1, 69, 0, 1, 1, "", ""],
    ["pipetrig_5a", 1, 69, 0, 1, 1, "", ""],
    ["pipetrig_5b", 1, 69, 0, 1, 1, "", ""],
    ["pipetrig_5c", 1, 69, 0, 1, 1, "", ""],
    ["watertimer1", 8, 0, 0, 0, 1, "", ""],
    ["watertimer3", 8, 0, 0, 0, 1, "", ""],
    ["watertimer2", 8, 0, 0, 0, 1, "", ""],
    ["watertimer4", 8, 0, 0, 0, 1, "", ""],
    ["watertimer9", 8, 0, 0, 0, 1, "", ""],
    ["watertimer5", 8, 0, 0, 0, 1, "", ""],
    ["pail_6t", 2, 0, 0, 1, 1, "", ""],
    ["pail_5t", 2, 0, 0, 1, 1, "", ""],
    ["pail_6ta", 2, 0, 0, 1, 1, "", ""],
    ["hard_tile", 2, 0, 0, 1, 1, "", ""],
    ["easy_tile", 2, 0, 0, 1, 1, "", ""],
    ["lily_2", 2, 0, 0, 1, 1, "", ""],
    ["lily_4", 2, 0, 0, 1, 1, "", ""],
    ["lily_5", 2, 0, 0, 1, 1, "", ""],
    ["lily_9", 2, 0, 0, 1, 1, "", ""],
    ["potion", 2, 0, 0, 1, 1, "", ""],
    ["exit_port", 2, 0, 0, 1, 1, "", ""],
    ["water_1", 2, 0, 0, 1, 1, "", ""],
    ["water_2", 2, 0, 0, 1, 1, "", ""],
    ["water_3", 2, 0, 0, 1, 1, "", ""],
    ["water_4", 2, 0, 0, 1, 1, "", ""],
    ["water_5", 2, 0, 0, 1, 1, "", ""],
    ["water_9", 2, 0, 0, 1, 1, "", ""],
    ["pipe_1", 2, 0, 0, 1, 1, "", ""],
    ["pipe_2", 2, 0, 0, 1, 1, "", ""],
    ["pipe_3", 2, 0, 0, 1, 1, "", ""],
    ["pipe_4", 2, 0, 0, 1, 1, "", ""],
    ["pipe_5a", 2, 0, 0, 1, 1, "", ""],
    ["pipe_5b", 2, 0, 0, 1, 1, "", ""],
    ["pipe_5c", 2, 0, 0, 1, 1, "", ""],
    ["pipe_9", 2, 0, 0, 1, 1, "", ""],
    ["r2_t3_1a", 2, 0, 0, 1, 1, "", ""],
    ["r2_t3_1b", 2, 0, 0, 1, 1, "", ""],
    ["r2_t3_1c", 2, 0, 0, 1, 1, "", ""],
    ["r2_t3_1d", 2, 0, 0, 1, 1, "", ""],
    ["r2_t3_2a", 2, 0, 0, 1, 1, "", ""],
    ["r2_t3_2b", 2, 0, 0, 1, 1, "", ""],
    ["r2_t3_2c", 2, 0, 0, 1, 1, "", ""],
    ["r2_t3_2d", 2, 0, 0, 1, 1, "", ""],
    ["r2_t3_3a", 2, 0, 0, 1, 1, "", ""],
    ["r2_t3_3b", 2, 0, 0, 1, 1, "", ""],
    ["r2_t3_3c", 2, 0, 0, 1, 1, "", ""],
    ["r2_t3_3d", 2, 0, 0, 1, 1, "", ""],
    ["r2_t3_4a", 2, 0, 0, 1, 1, "", ""],
    ["r2_t3_4b", 2, 0, 0, 1, 1, "", ""],
    ["r2_t3_4c", 2, 0, 0, 1, 1, "", ""],
    ["r2_t3_4d", 2, 0, 0, 1, 1, "", ""],
    ["florence", 2, 0, 0, 1, 1, "", ""],
    ["vine_ladder", 2, 0, 0, 1, 1, "", ""],
    ["gardencabbag", 2, 0, 0, 1, 1, "", ""],
    ["gardencorn", 2, 0, 0, 1, 1, "", ""],
    ["gardentomato", 2, 0, 0, 1, 1, "", ""],
    ["gardencarro", 2, 0, 0, 1, 1, "", ""],
    ["gardenstrawb", 2, 0, 0, 1, 1, "", ""],
    ["gardenradish", 2, 0, 0, 1, 1, "", ""],
    ["gardengrapes", 2, 0, 0, 1, 1, "", ""],
    ["cage_1", 2, 0, 0, 1, 1, "", ""],
    ["cage_3", 2, 0, 0, 1, 1, "", ""],
    ["blockicon_1", 2, 0, 0, 1, 1, "", ""],
    ["blocktile_1", 2, 0, 0, 1, 1, "", ""],
    ["blockicon_2", 2, 0, 0, 1, 1, "", ""],
    ["blocktile_2", 2, 0, 0, 1, 1, "", ""],
    ["blockicon_3", 2, 0, 0, 1, 1, "", ""],
    ["blocktile_3", 2, 0, 0, 1, 1, "", ""],
    ["blockicon_4", 2, 0, 0, 1, 1, "", ""],
    ["blocktile_4", 2, 0, 0, 1, 1, "", ""],
    ["grow_corn", 2, 0, 0, 1, 1, "", ""],
    ["grow_radish", 2, 0, 0, 1, 1, "", ""],
    ["grow_strawbe", 2, 0, 0, 1, 1, "", ""],
    ["grow_cabbage", 2, 0, 0, 1, 1, "", ""],
    ["grow_tomato", 2, 0, 0, 1, 1, "", ""],
    ["grow_grape", 2, 0, 0, 1, 1, "", ""],
    ["grow_carrot", 2, 0, 0, 1, 1, "", ""],
    ["ga_rockinfo", 1, 145, 0, 1, 1, "", ""],
    ["caveinfo_1", 1, 145, 0, 1, 1, "", ""],
    ["caveinfo_2", 1, 145, 0, 1, 1, "", ""],
    ["pipeinfo_1", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo_2", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo_3", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo_4", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo_5a", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo_5b", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo_5c", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo_9", 1, 116, 0, 0, 1, "", ""],
    ["cork_11", 15, 1937, 0, 1, 1, "", ""],
    ["cork_21", 15, 1937, 0, 1, 1, "", ""],
    ["cork_22", 15, 1937, 0, 1, 1, "", ""],
    ["cork_23", 15, 1937, 0, 1, 1, "", ""],
    ["cork_1", 15, 1937, 0, 1, 1, "", ""],
    ["cork_4", 15, 1937, 0, 1, 1, "", ""],
    ["cork_6", 15, 1937, 0, 1, 1, "", ""],
    ["cork_2", 15, 1937, 0, 1, 1, "", ""],
    ["cork_3", 15, 1937, 0, 1, 1, "", ""],
    ["cork_5", 15, 1937, 0, 1, 1, "", ""],
    ["apple", 17, 2293, 0, 1, 1, "", ""],
    ["orange", 17, 2294, 0, 1, 1, "", ""],
    ["banana", 17, 2292, 0, 1, 1, "", ""],
    ["r1_t2_rose", 17, 2307, 0, 1, 1, "", ""],
    ["r1_t3_moth", 17, 2316, 0, 1, 1, "", ""],
    ["r2_t2_1a", 21, 100, 0, 1, 1, "", "revive"],
    ["r2_t2_1b", 21, 100, 0, 1, 1, "", "revive"],
    ["r2_t2_1c", 21, 100, 0, 1, 1, "", "revive"],
    ["r2_t2_1d", 21, 100, 0, 1, 1, "", "revive"],
    ["r2_t2_2a", 21, 100, 0, 1, 1, "", "revive"],
    ["r2_t2_2b", 21, 100, 0, 1, 1, "", "revive"],
    ["r2_t2_2c", 21, 100, 0, 1, 1, "", "revive"],
    ["r2_t2_2d", 21, 100, 0, 1, 1, "", "revive"],
    ["r2_t2_3a", 21, 100, 0, 1, 1, "", "revive"],
    ["r2_t2_3b", 21, 100, 0, 1, 1, "", "revive"],
    ["r2_t2_3c", 21, 100, 0, 1, 1, "", "revive"],
    ["r2_t2_3d", 21, 100, 0, 1, 1, "", "revive"],
    ["r2_t2_4a", 21, 100, 0, 1, 1, "", "revive"],
    ["r2_t2_4b", 21, 100, 0, 1, 1, "", "revive"],
    ["r2_t2_4c", 21, 100, 0, 1, 1, "", "revive"],
    ["r2_t2_4d", 21, 100, 0, 1, 1, "", "revive"],
    ["r2_t2_t1a", 1, 67, 0, 1, 1, "", ""],
    ["r2_t2_t1b", 1, 67, 0, 1, 1, "", ""],
    ["r2_t2_t1c", 1, 67, 0, 1, 1, "", ""],
    ["r2_t2_t1d", 1, 67, 0, 1, 1, "", ""],
    ["r2_t2_t2a", 1, 67, 0, 1, 1, "", ""],
    ["r2_t2_t2b", 1, 67, 0, 1, 1, "", ""],
    ["r2_t2_t2c", 1, 67, 0, 1, 1, "", ""],
    ["r2_t2_t2d", 1, 67, 0, 1, 1, "", ""],
    ["r2_t2_t3a", 1, 67, 0, 1, 1, "", ""],
    ["r2_t2_t3b", 1, 67, 0, 1, 1, "", ""],
    ["r2_t2_t3c", 1, 67, 0, 1, 1, "", ""],
    ["r2_t2_t3d", 1, 67, 0, 1, 1, "", ""],
    ["r2_t2_t4a", 1, 67, 0, 1, 1, "", ""],
    ["r2_t2_t4b", 1, 67, 0, 1, 1, "", ""],
    ["r2_t2_t4c", 1, 67, 0, 1, 1, "", ""],
    ["r2_t2_t4d", 1, 67, 0, 1, 1, "", ""],
    ["r2_t3_t1a", 1, 67, 0, 1, 1, "", ""],
    ["r2_t3_t1b", 1, 67, 0, 1, 1, "", ""],
    ["r2_t3_t1c", 1, 67, 0, 1, 1, "", ""],
    ["r2_t3_t1d", 1, 67, 0, 1, 1, "", ""],
    ["r2_t3_t2a", 1, 67, 0, 1, 1, "", ""],
    ["r2_t3_t2b", 1, 67, 0, 1, 1, "", ""],
    ["r2_t3_t2c", 1, 67, 0, 1, 1, "", ""],
    ["r2_t3_t2d", 1, 67, 0, 1, 1, "", ""],
    ["r2_t3_t3a", 1, 67, 0, 1, 1, "", ""],
    ["r2_t3_t3b", 1, 67, 0, 1, 1, "", ""],
    ["r2_t3_t3c", 1, 67, 0, 1, 1, "", ""],
    ["r2_t3_t3d", 1, 67, 0, 1, 1, "", ""],
    ["r2_t3_t4a", 1, 67, 0, 1, 1, "", ""],
    ["r2_t3_t4b", 1, 67, 0, 1, 1, "", ""],
    ["r2_t3_t4c", 1, 67, 0, 1, 1, "", ""],
    ["r2_t3_t4d", 1, 67, 0, 1, 1, "", ""],
    ["r2_t2_i1a", 1, 116, 0, 0, 1, "", ""],
    ["r2_t2_i1b", 1, 116, 0, 0, 1, "", ""],
    ["r2_t2_i1c", 1, 116, 0, 0, 1, "", ""],
    ["r2_t2_i1d", 1, 116, 0, 0, 1, "", ""],
    ["r2_t2_i2a", 1, 116, 0, 0, 1, "", ""],
    ["r2_t2_i2b", 1, 116, 0, 0, 1, "", ""],
    ["r2_t2_i2c", 1, 116, 0, 0, 1, "", ""],
    ["r2_t2_i2d", 1, 116, 0, 0, 1, "", ""],
    ["r2_t2_i3a", 1, 116, 0, 0, 1, "", ""],
    ["r2_t2_i3b", 1, 116, 0, 0, 1, "", ""],
    ["r2_t2_i3c", 1, 116, 0, 0, 1, "", ""],
    ["r2_t2_i3d", 1, 116, 0, 0, 1, "", ""],
    ["r2_t2_i4a", 1, 116, 0, 0, 1, "", ""],
    ["r2_t2_i4b", 1, 116, 0, 0, 1, "", ""],
    ["r2_t2_i4c", 1, 116, 0, 0, 1, "", ""],
    ["r2_t2_i4d", 1, 116, 0, 0, 1, "", ""],
    ["r2_t3_i1a", 1, 116, 0, 0, 1, "", ""],
    ["r2_t3_i1b", 1, 116, 0, 0, 1, "", ""],
    ["r2_t3_i1c", 1, 116, 0, 0, 1, "", ""],
    ["r2_t3_i1d", 1, 116, 0, 0, 1, "", ""],
    ["r2_t3_i2a", 1, 116, 0, 0, 1, "", ""],
    ["r2_t3_i2b", 1, 116, 0, 0, 1, "", ""],
    ["r2_t3_i2c", 1, 116, 0, 0, 1, "", ""],
    ["r2_t3_i2d", 1, 116, 0, 0, 1, "", ""],
    ["r2_t3_i3a", 1, 116, 0, 0, 1, "", ""],
    ["r2_t3_i3b", 1, 116, 0, 0, 1, "", ""],
    ["r2_t3_i3c", 1, 116, 0, 0, 1, "", ""],
    ["r2_t3_i3d", 1, 116, 0, 0, 1, "", ""],
    ["r2_t3_i4a", 1, 116, 0, 0, 1, "", ""],
    ["r2_t3_i4b", 1, 116, 0, 0, 1, "", ""],
    ["r2_t3_i4c", 1, 116, 0, 0, 1, "", ""],
    ["r2_t3_i4d", 1, 116, 0, 0, 1, "", ""],
    ["waterinfo_1", 1, 116, 0, 0, 1, "", ""],
    ["waterinfo_2", 1, 116, 0, 0, 1, "", ""],
    ["waterinfo_3", 1, 116, 0, 0, 1, "", ""],
    ["waterinfo_4", 1, 116, 0, 0, 1, "", ""],
    ["waterinfo_5", 1, 116, 0, 0, 1, "", ""],
    ["waterinfo_6", 1, 116, 0, 0, 1, "", ""],
    ["waterinfo_7", 1, 116, 0, 0, 1, "", ""],
    ["note_count", 7, 0, 0, 1, 1, "", ""],
    ["bamboo_1", 1, 44, 0, 1, 1, "", ""],
    ["bamboo_2", 1, 44, 0, 1, 1, "", ""],
    ["bamboo_3", 1, 44, 0, 1, 1, "", ""],
    ["bamboo_4", 1, 44, 0, 1, 1, "", ""],
    ["bamboo_5", 1, 44, 0, 1, 1, "", ""],
    ["rope", 15, 2304, 0, 1, 1, "", ""],
    ["timber", 15, 2302, 0, 1, 1, "", ""],
    ["ga_cabbage", 17, 2311, 0, 1, 1, "", ""],
    ["ga_carrot", 17, 2305, 0, 1, 1, "", ""],
    ["ga_radish", 17, 2310, 0, 1, 1, "", ""],
    ["ga_strawbery", 17, 2330, 0, 1, 1, "", ""],
    ["ga_grape", 17, 2329, 0, 1, 1, "", ""],
    ["ga_tomato", 17, 2358, 0, 1, 1, "", ""],
    ["ga_corn", 17, 2357, 0, 1, 1, "", ""],
    ["r3_t1_nitngl", 1, 44, 0, 1, 1, "", ""],
    ["r3_t1_timer", 8, 0, 0, 0, 1, "", ""],
    ["wood_bridge", 2, 0, 0, 1, 1, "", ""],
    ["bamboo", 2, 0, 0, 1, 1, "", ""],
    ["nectar", 17, 2324, 0, 1, 1, "", ""],
    ["chompseeds", 17, 2303, 0, 1, 1, "", ""],
    ["honey", 17, 2325, 0, 1, 1, "", ""],
    ["waterspot_1", 1, 67, 0, 1, 1, "", ""],
    ["waterspot_2", 1, 67, 0, 1, 1, "", ""],
    ["waterspot_3", 1, 67, 0, 1, 1, "", ""],
    ["waterspot_4", 1, 67, 0, 1, 1, "", ""],
    ["waterspot_5", 1, 67, 0, 1, 1, "", ""],
    ["waterspot_6", 1, 67, 0, 1, 1, "", ""],
    ["waterspot_7", 1, 67, 0, 1, 1, "", ""],
    ["pickup_radis", 1, 134, 0, 1, 1, "", ""],
    ["pickup_cabba", 1, 134, 0, 1, 1, "", ""],
    ["pickup_carro", 1, 134, 0, 1, 1, "", ""],
    ["pickup_straw", 1, 134, 0, 1, 1, "", ""],
    ["pickup_grape", 1, 134, 0, 1, 1, "", ""],
    ["pickup_corn", 1, 134, 0, 1, 1, "", ""],
    ["pickup_tomat", 1, 134, 0, 1, 1, "", ""],
    ["pickup_honey", 1, 134, 0, 1, 1, "", ""],
    ["pickup_necta", 1, 134, 0, 1, 1, "", ""],
    ["pickup_chomp", 1, 134, 0, 1, 1, "", ""],
    ["phantom_1", 11, 2, 0, 1, 1, "path_1", ""],
    ["phantom_2", 11, 2, 0, 1, 1, "path_2", ""],
    ["phantom__3", 11, 2, 0, 1, 1, "path_3", ""],
    ["phantom_4", 11, 2, 0, 1, 1, "path_4", ""],
    ["phantom_5", 11, 2, 0, 1, 1, "path_5", ""],
    ["phantom_6", 11, 2, 0, 1, 1, "path_6", ""],
    ["phantom_7", 11, 2, 0, 1, 1, "path_7", ""],
    ["phantom__8", 11, 2, 0, 1, 1, "path_3", ""],
    ["phantom_9", 11, 2, 0, 1, 1, "path_9", ""],
    ["phantom_10", 11, 2, 0, 1, 1, "path_10", ""],
    ["phantom_11", 11, 2, 0, 1, 1, "path_11", ""],
    ["phantom_12", 11, 2, 0, 1, 1, "path_12", ""],
    ["phantom_13", 11, 2, 0, 1, 1, "path_13", ""],
    ["phantom_14", 11, 2, 0, 1, 1, "path_14", ""],
    ["phantom_15", 11, 2, 0, 1, 1, "path_15", ""],
    ["phantom_16", 11, 2, 0, 1, 1, "path_16", ""],
    ["phantom_17", 11, 2, 0, 1, 1, "path_17", ""],
    ["phantom_18", 11, 2, 0, 1, 1, "path_18", ""],
    ["c2phantom1", 11, 2, 0, 1, 1, "c2path1", ""],
    ["c2phantom2", 11, 2, 0, 1, 1, "c2path2", ""],
    ["c2phantom3", 11, 2, 0, 1, 1, "c2path3", ""],
    ["c3phantom1", 11, 2, 0, 1, 1, "c3path1", ""],
    ["c3phantom2", 11, 2, 0, 1, 1, "c3path2", ""],
    ["c3phantom3", 11, 2, 0, 1, 1, "c3path3", ""],
    ["c3phantom4", 11, 2, 0, 1, 1, "c3path4", ""],
    ["pail_1", 17, 1955, 0, 1, 1, "", ""],
    ["pail_2", 17, 1955, 0, 1, 1, "", ""],
    ["pail_3", 17, 1955, 0, 1, 1, "", ""],
    ["pail_4", 17, 1955, 0, 1, 1, "", ""],
    ["pail_5", 17, 1955, 0, 1, 1, "", ""],
    ["pail_6", 17, 1955, 0, 1, 1, "", ""],
    ["boomtree_1", 2, 0, 0, 1, 1, "", ""],
    ["boomtree_2", 2, 0, 0, 1, 1, "", ""],
    ["boomtree_3", 2, 0, 0, 1, 1, "", ""],
    ["boomtree_5", 2, 0, 0, 1, 1, "", ""],
    ["boomtree_6", 2, 0, 0, 1, 1, "", ""],
    ["boomtree_7", 2, 0, 0, 1, 1, "", ""],
    ["boomtree_8", 2, 0, 0, 1, 1, "", ""],
    ["boomtimer_1", 8, 0, 0, 0, 1, "", ""],
    ["boomtimer_2", 8, 0, 0, 0, 1, "", ""],
    ["boomtimer_3", 8, 0, 0, 0, 1, "", ""],
    ["boomtimer_5", 8, 0, 0, 0, 1, "", ""],
    ["boomtimer_6", 8, 0, 0, 0, 1, "", ""],
    ["boomtimer_7", 8, 0, 0, 0, 1, "", ""],
    ["boomtimer_8", 8, 0, 0, 0, 1, "", ""],
    ["cavestone_1", 11, 139, 0, 1, 1, "", ""],
    ["cavestone_2", 11, 140, 0, 1, 1, "", ""],
    ["pickup_boom1", 1, 134, 0, 1, 1, "", ""],
    ["pickup_boom2", 1, 134, 0, 1, 1, "", ""],
    ["pickup_boom3", 1, 134, 0, 1, 1, "", ""],
    ["pickup_boom5", 1, 134, 0, 1, 1, "", ""],
    ["pickup_boom6", 1, 134, 0, 1, 1, "", ""],
    ["pickup_boom7", 1, 134, 0, 1, 1, "", ""],
    ["pickup_boom8", 1, 134, 0, 1, 1, "", ""],
    ["factory_6", 12, 72, 0, 1, 1, "", "appear"],
    ["factory_2", 12, 72, 0, 1, 1, "", "appear"],
    ["factory_3", 12, 72, 0, 1, 1, "", "appear"],
    ["factory_4", 12, 72, 0, 1, 1, "", "appear"],
    ["factory_5", 12, 72, 0, 1, 1, "", "appear"],
    ["factory_8", 12, 72, 0, 1, 1, "", "appear"],
    ["factory_9", 12, 72, 0, 1, 1, "", "appear"],
    ["c3factory1", 12, 72, 0, 1, 1, "", "appear"],
    ["c3factory2", 12, 72, 0, 1, 1, "", "appear"],
    ["respawn1", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["respawn2", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["respawn3", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["respawn4", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["respawn5", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["respawn3i", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["respawn3h", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["plant_vol", 22, 0, 0, 1, 1, "", ""],
    ["trigfact2", 3, 0, 0, 1, 1, "", ""],
    ["trigfact3", 3, 0, 0, 1, 1, "", ""],
    ["trigfact4", 3, 0, 0, 1, 1, "", ""],
    ["trigfact5", 3, 0, 0, 1, 1, "", ""],
    ["trigfact6", 3, 0, 0, 1, 1, "", ""],
    ["trigfact8", 3, 0, 0, 1, 1, "", ""],
    ["trigfact9", 3, 0, 0, 1, 1, "", ""],
    ["trapkey_1", 1, 44, 0, 1, 1, "", ""],
    ["trapkey_3", 1, 44, 0, 1, 1, "", ""],
    ["key_1a", 15, 1912, 0, 1, 1, "", ""],
    ["key_1b", 15, 1912, 0, 1, 1, "", ""],
    ["key_1c", 15, 1912, 0, 1, 1, "", ""],
    ["key_3a", 15, 1912, 0, 1, 1, "", ""],
    ["key_3b", 15, 1912, 0, 1, 1, "", ""],
    ["key_3c", 15, 1912, 0, 1, 1, "", ""],
    ["key_1a_h", 15, 1912, 0, 1, 1, "", ""],
    ["key_1b_h", 15, 1912, 0, 1, 1, "", ""],
    ["key_1c_h", 15, 1912, 0, 1, 1, "", ""],
    ["key_3a_h", 15, 1912, 0, 1, 1, "", ""],
    ["key_3b_h", 15, 1912, 0, 1, 1, "", ""],
    ["key_3c_h", 15, 1912, 0, 1, 1, "", ""],
    ["key_1a_icon", 1, 147, 0, 1, 1, "", ""],
    ["key_1b_icon", 1, 147, 0, 1, 1, "", ""],
    ["key_1c_icon", 1, 147, 0, 1, 1, "", ""],
    ["key_3a_icon", 1, 147, 0, 1, 1, "", ""],
    ["key_3b_icon", 1, 147, 0, 1, 1, "", ""],
    ["key_3c_icon", 1, 147, 0, 1, 1, "", ""],
    ["exit_vol", 3, 0, 0, 1, 1, "", ""],
    ["portal", 16, "ajq_portalgatelp", 0, 0, 1, "", ""],
    ["boomrock5", 11, 142, 0, 1, 1, "", ""],
    ["gardenrock", 11, 144, 0, 1, 1, "", ""],
    ["cosmo_5_show", 3, 0, 0, 1, 1, "", ""],
    ["sludge_1", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge_2", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge_3", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge_4", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge_5a", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge_5b", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge_5c", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge_9", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["waterfall_1", 16, "ajq_waterfall_lp", 0, 1, 1, "", ""],
    ["waterfall_2", 16, "ajq_waterfall_lp", 0, 1, 1, "", ""],
    ["waterfall_3", 16, "ajq_waterfall_lp", 0, 1, 1, "", ""],
    ["waterfall_4", 16, "ajq_waterfall_lp", 0, 1, 1, "", ""],
    ["seedpile_2", 1, 134, 0, 1, 1, "", ""],
    ["seedpile_3", 1, 134, 0, 1, 1, "", ""],
    ["cheatchq1", 3, 0, 0, 1, 1, "", ""],
    ["cheatchq2", 3, 0, 0, 1, 1, "", ""],
    ["cheatchq3", 3, 0, 0, 1, 1, "", ""],
    ["cheatchq4", 3, 0, 0, 1, 1, "", ""],
    ["blocktrig_1", 1, 46, 0, 1, 1, "", ""],
    ["blocktimer_1", 8, 0, 0, 0, 1, "", ""],
    ["blocktrig_2", 1, 57, 0, 1, 1, "", ""],
    ["blocktimer_2", 8, 0, 0, 0, 1, "", ""],
    ["blocktrig_3", 1, 51, 0, 1, 1, "", ""],
    ["blocktimer_3", 8, 0, 0, 0, 1, "", ""],
    ["blocktrig_4", 1, 148, 0, 1, 1, "", ""],
    ["blocktimer_4", 8, 0, 0, 0, 1, "", ""],
    ["secretvol_1", 3, 0, 0, 1, 1, "", ""],
    ["secretvol_2", 3, 0, 0, 1, 1, "", ""],
    ["secretvol_3", 3, 0, 0, 1, 1, "", ""],
    ["secretvol_4", 3, 0, 0, 1, 1, "", ""],
    ["secretvol_5", 3, 0, 0, 1, 1, "", ""],
    ["secretvol_6", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_1", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_5", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_7", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_8", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_9", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_10", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_12", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_13", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_14", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_15", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_16", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_17", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_2", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_3", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_4", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_6", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_11", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_18", 3, 0, 0, 1, 1, "", ""],
    ["beehive_loop", 16, "ajq_beehivelp", 0, 1, 1, "", ""],
    ["web_2", 23, 104, 0, 1, 1, "", ""],
    ["web_9", 23, 104, 0, 1, 1, "", ""],
    ["web_15", 23, 104, 0, 1, 1, "", ""],
    ["web_1", 23, 105, 0, 1, 1, "", ""],
    ["web_3", 23, 105, 0, 1, 1, "", ""],
    ["web_7", 23, 105, 0, 1, 1, "", ""],
    ["web_8", 23, 105, 0, 1, 1, "", ""],
    ["web_14", 23, 105, 0, 1, 1, "", ""],
    ["web_16", 23, 105, 0, 1, 1, "", ""],
    ["web_17", 23, 105, 0, 1, 1, "", ""],
    ["web_18", 23, 105, 0, 1, 1, "", ""],
    ["web_19", 23, 105, 0, 1, 1, "", ""],
    ["garden_vary", 7, 0, 0, 1, 1, "", ""],
    ["players", 7, 0, 0, 1, 1, "", ""],
    ["cave1_once", 7, 0, 0, 1, 1, "", ""],
    ["cave2_once", 7, 0, 0, 1, 1, "", ""],
    ["koala_2_once", 7, 0, 0, 1, 1, "", ""],
    ["koala_1_once", 7, 0, 0, 1, 1, "", ""],
    ["koala_3_once", 7, 0, 0, 1, 1, "", ""],
    ["koala_5_once", 7, 0, 0, 1, 1, "", ""],
    ["koala_7_talk", 7, 0, 0, 1, 1, "", ""],
    ["koala_7_once", 7, 0, 0, 1, 1, "", ""],
    ["vine_once", 7, 0, 0, 1, 1, "", ""],
    ["revived", 7, 0, 0, 0, 1, "", ""],
    ["water5", 7, 0, 0, 0, 1, "", ""],
    ["planttrig", 7, 0, 0, 0, 1, "", ""],
    ["waterspot", 7, 0, 0, 1, 1, "", ""],
    ["keys", 7, 0, 0, 0, 1, "", ""],
    ["picktasks", 7, 0, 0, 1, 1, "", ""],
    ["trapnotify", 7, 0, 0, 0, 1, "", ""],
    ["wateredplant", 7, 0, 0, 0, 1, "", ""],
    ["pipecount", 7, 0, 0, 0, 1, "", ""],
    ["den2corks", 7, 0, 0, 0, 1, "", ""],
    ["00_uri", 7, 0, 0, 0, 1, "", ""],
    ["10_uri", 7, 0, 0, 0, 1, "", ""],
    ["20_uri", 7, 0, 0, 0, 1, "", ""],
    ["30_uri", 7, 0, 0, 0, 1, "", ""],
    ["40_uri", 7, 0, 0, 0, 1, "", ""],
    ["50_uri", 7, 0, 0, 0, 1, "", ""],
    ["60_uri", 7, 0, 0, 0, 1, "", ""],
    ["70_uri", 7, 0, 0, 0, 1, "", ""],
    ["80_uri", 7, 0, 0, 0, 1, "", ""],
    ["playermember", 7, 0, 0, 1, 1, "", ""],
    ["diff_level", 7, 0, 0, 1, 1, "", ""],
    ["live_players", 7, 0, 1, 0, 1, "", ""],
  ],

  on: {
    loaded(q) {
      // step 194
      q.send("qsndpk", 2365);
    },

    // walked into, or clicked
    trigger: {
      pickup_straw(q) {
        // by hand (not recorded in this mode): the crop picked; not again while it is already in hand (two walk-ins would ask to drop it)
        if (q.held() !== "ga_strawbery") {
          q.send("qgi", "ga_strawbery");
        }
      },
      pickup_carro(q) {
        // by hand (not recorded in this mode): the crop picked; not again while it is already in hand (two walk-ins would ask to drop it)
        if (q.held() !== "ga_carrot") {
          q.send("qgi", "ga_carrot");
        }
      },
      pickup_radis(q) {
        // by hand (not recorded in this mode): the crop picked; not again while it is already in hand (two walk-ins would ask to drop it)
        if (q.held() !== "ga_radish") {
          q.send("qgi", "ga_radish");
        }
      },
      // by hand (koala_1, koala_2, koala_3): by how far things have got, not how often they were talked to
      koala_1(q) {
        const held = q.held(); // what the player carried when this fired
        if (held === "orange") {
          // an orange: 15 gems, every time
          q.send("qcmd", 2, "koala_1", 3877, 1);
          q.use();
          q.send("qspn", "koala_1", "koala_1__give_gem", 200, 42, 3, 15, "null", "null", "null");
          q.xp(10, "koala_1");
          return;
        }
        if (once(q, "koala_1 first")) {
          q.send("qcmdVT", 1, "koala_1_once", 1, 0, 0);
          q.send("qicon", "cavestone_1", 1);
          q.send("qcmd", 38, 3888);
        }
        q.send("qcmd", 2, "koala_1", q.vars.cave1 ? 3818 : 3817, 1);
      },
      koala_2(q) {
        // the plants: all of them watered, a chest
        const n = tally(q, "talk koala_2");
        const revived = (q.vars.counts || {}).revived || 0;
        if (revived >= ALL_PLANTS) {
          q.send("qcmd", 2, "koala_2", 10957, 1);
          if (once(q, "koala_2 chest")) {
            q.send("qswfs", "treasure3b", "appear");
            set(q, "treasure3b", 0, 1, 1);
            set(q, "treasure3b", 1, 1, 1);
          }
        }
        else if (n === 1) {
          q.send("qcmd", 2, "koala_2", 3796, 1);
        }
        else if (once(q, "koala_2 asks")) {
          q.send("qcmdVT", 1, "koala_2_once", 1, 0, 0);
          q.send("qcmd", 2, "koala_2", 10955, 1);
        }
        else {
          q.send("qcmd", 2, "koala_2", 10956, 1);
        }
      },
      koala_3(q) {
        const held = q.held(); // what the player carried when this fired
        if (held === "ga_carrot") {
          // a carrot: 50 gems, every time
          q.send("qcmd", 2, "koala_3", 3878, 1);
          q.use();
          q.send("qspn", "koala_3", "koala_3__give_gem", 200, 42, 3, 50, "null", "null", "null");
          q.xp(10, "koala_3");
          return;
        }
        if (q.vars.cave1) {
          q.send("qcmd", 2, "koala_3", 3816, 1);
        }
        else if (q.vars.song) {
          q.send("qcmd", 2, "koala_3", 3798, 1);
        }
        else {
          if (once(q, "koala_3 first")) {
            q.send("qcmdVT", 1, "koala_3_once", 1, 0, 0);
            q.send("qcmd", 38, 3889);
          }
          q.send("qcmd", 2, "koala_3", 3797, 1);
        }
      },
      koala_7(q) {
        const held = q.held(); // what the player carried when this fired
        const b = bridge(q);
        if (held === "rope" && !b.rope) {
          q.use();
          b.rope = true;
          set(q, "koala_8", 2, 1, 1);
          if (b.timber) {
            fixBridge(q, 3805);
          }
          else {
            say(q, "koala_7", 3799);
            q.send("qcmd", 38, 3800);
            set(q, "koala_7", 1, 1, 1);
          }
          return;
        }
        if (held === "timber" && !b.timber) {
          q.use();
          b.timber = true;
          set(q, "koala_9", 2, 1, 1);
          if (b.rope) {
            fixBridge(q, 3803);
          }
          else {
            say(q, "koala_7", 3801);
            q.send("qcmd", 38, 3802);
            set(q, "koala_7", 1, 1, 1);
          }
          return;
        }
        if (b.fixed) {
          const [state, line, talk] = ISAAC_CHAT[b.talk % ISAAC_CHAT.length];
          b.talk++;
          set(q, "koala_7", state, 1, 1);
          say(q, "koala_7", line);
          set(q, "koala_7", 4, 1, 1);
          q.send("qcmdVT", 1, "koala_7_talk", talk, 0, 0);
          return;
        }
        if (b.rope || b.timber) {
          say(q, "koala_7", b.rope ? 3799 : 3801);
          return;
        }
        say(q, "koala_7", 3823);
        if (once(q, "isaac first")) {
          q.send("qcmdVT", 1, "koala_7_once", 1, 0, 0);
          q.send("qcmd", 38, 3836);
        }
      },
      koala_9(q) {
        const held = q.held(); // what the player carried when this fired
        const b = bridge(q);
        if (held === "banana" && !b.timberGot) {
          q.use();
          b.timberGot = true;
          say(q, "koala_9", 3956);
          q.send("qcmd", 38, 3838);
          q.send("qgi", "timber");
          return;
        }
        if (held === "r1_t2_rose" && !b.rose) {
          b.rose = true;
          q.use();
          set(q, "r1_t2_rose", 99, 0, 0);
          q.xp(100, "koala_9");
          q.send("qswfs", "treasure3d2", "appear");
          set(q, "treasure3d2", 0, 1, 1);
          set(q, "treasure3d2", 1, 1, 1);
          say(q, "koala_9", 3905);
          set(q, "koala_9", 3, 1, 1);
          return;
        }
        if (b.rose) {
          say(q, "koala_9", 3905);
        }
        else if (b.timber) {
          say(q, "koala_9", 3903); // the rose she would like
        }
        else if (b.timberGot) {
          say(q, "koala_9", 3957); // Isaac wants the timber
        }
        else {
          say(q, "koala_9", 3822);
          q.send("qcmd", 38, 3837);
        }
      },
      koala_8(q) {
        const held = q.held(); // what the player carried when this fired
        const b = bridge(q);
        if (held === "apple" && !b.ropeGot) {
          q.use();
          b.ropeGot = true;
          say(q, "koala_8", 3958);
          q.send("qcmd", 38, 3840);
          q.send("qgi", "rope");
          return;
        }
        if (held === "r1_t3_moth" && !b.moth) {
          b.moth = true;
          q.use();
          set(q, "r1_t3_moth", 99, 0, 0);
          q.xp(100, "koala_8");
          q.send("qswfs", "treasure3d1", "appear");
          set(q, "treasure3d1", 0, 1, 1);
          set(q, "treasure3d1", 1, 1, 1);
          say(q, "koala_8", 3906);
          set(q, "koala_8", 3, 1, 1);
          return;
        }
        if (b.moth) {
          say(q, "koala_8", 3906);
        }
        else if (b.rope) {
          say(q, "koala_8", 3904); // the moth he lost
        }
        else if (b.ropeGot) {
          say(q, "koala_8", 3959); // Isaac wants the rope
        }
        else {
          say(q, "koala_8", 3821);
          q.send("qcmd", 38, 3839);
        }
      },
      treasure_1(q) {
        q.send("qatt", "treasure_1", 3, 50, 0, 1); // the chest opens
      },
      treasure_2(q) {
        q.send("qatt", "treasure_2", 3, 200, 0, 1); // the chest opens
      },
      treasure_3(q) {
        q.send("qatt", "treasure_3", 3, 50, 0, 1); // the chest opens
      },
      treasure_4(q) {
        q.send("qatt", "treasure_4", 3, 50, 0, 1); // the chest opens
      },
      treasure_5(q) {
        q.send("qatt", "treasure_5", 3, 50, 0, 1); // the chest opens
      },
      treasure_6(q) {
        q.send("qatt", "treasure_6", 3, 50, 0, 1); // the chest opens
      },
      treasure_7(q) {
        q.send("qatt", "treasure_7", 3, 50, 0, 1); // the chest opens
      },
      c1treasure_1(q) {
        q.send("qatt", "c1treasure_1", 3, 50, 0, 1); // the chest opens
      },
      c1treasure_2(q) {
        q.send("qatt", "c1treasure_2", 3, 100, 0, 1); // the chest opens
      },
      c1treasure_3(q) {
        // by hand: the chest behind the tigers' passage holds clothing (the wiki's list), not gems
        q.send("qatt", "c1treasure_3", 2, ...passageClothing(q, "c1treasure_3", {hard: false}), 1); // the chest opens
      },
      c1treasure_4(q) {
        // by hand: the chest behind a hard-mode passage (not there in normal mode) holds clothing (the wiki's list), not gems
        q.send("qatt", "c1treasure_4", 2, ...passageClothing(q, "c1treasure_4", {hard: true}), 1); // the chest opens
      },
      c1treasure_5(q) {
        // by hand: the chest behind a hard-mode passage (not there in normal mode) holds clothing (the wiki's list), not gems
        q.send("qatt", "c1treasure_5", 2, ...passageClothing(q, "c1treasure_5", {hard: true}), 1); // the chest opens
      },
      c1treasure_6(q) {
        // by hand: the chest behind a hard-mode passage (not there in normal mode) holds clothing (the wiki's list), not gems
        q.send("qatt", "c1treasure_6", 2, ...passageClothing(q, "c1treasure_6", {hard: true}), 1); // the chest opens
      },
      c2treasure1(q) {
        q.send("qatt", "c2treasure1", 3, 150, 0, 1); // the chest opens
      },
      c2treasure1h(q) {
        q.send("qatt", "c2treasure1h", 3, 50, 0, 1); // the chest opens
      },
      c3treasure1(q) {
        q.send("qatt", "c3treasure1", 3, 150, 0, 1); // the chest opens
      },
      c3treasure2(q) {
        q.send("qatt", "c3treasure2", 3, 150, 0, 1); // the chest opens
      },
      c3treasure2h(q) {
        q.send("qatt", "c3treasure2h", 3, 50, 0, 1); // the chest opens
      },
      c3treasure3(q) {
        q.send("qatt", "c3treasure3", 3, 150, 0, 1); // the chest opens
      },
      treasure3b(q) {
        q.send("qatt", "treasure3b", 3, 50, 0, 1); // the chest opens
      },
      treasure3c(q) {
        q.send("qatt", "treasure3c", 3, 50, 0, 1); // the chest opens
      },
      treasure3d1(q) {
        q.send("qatt", "treasure3d1", 3, 50, 0, 1); // the chest opens
      },
      treasure3d2(q) {
        q.send("qatt", "treasure3d2", 3, 50, 0, 1); // the chest opens
      },
      questready(q) {
        const n = tally(q, "trigger questready");
        // step 1: the 1st time
        if (n === 1) {
          q.send("qcmdVT", 1, "start_init", 1, 0, 0);
          set(q, "pail_1", 99, 0, 0);
          set(q, "pickup_necta", 99, 0, 0);
          set(q, "pickup_chomp", 99, 0, 0);
          set(q, "pickup_honey", 99, 0, 0);
          set(q, "pickup_carro", 99, 0, 0);
          set(q, "pickup_cabba", 99, 0, 0);
          set(q, "pickup_radis", 99, 0, 0);
          set(q, "pickup_straw", 99, 0, 0);
          set(q, "pickup_grape", 99, 0, 0);
          set(q, "pickup_corn", 99, 0, 0);
          set(q, "pickup_tomat", 99, 0, 0);
          set(q, "pickup_boom1", 99, 0, 0);
          set(q, "ga_rockinfo", 99, 0, 0);
          set(q, "potion", 99, 0, 0);
          set(q, "water_1", 1, 1, 0);
          set(q, "water_2", 1, 1, 0);
          set(q, "water_3", 1, 1, 0);
          set(q, "water_4", 1, 1, 0);
          set(q, "water_5", 1, 1, 0);
          set(q, "water_9", 1, 1, 0);
          set(q, "lily_2", 99, 0, 0);
          set(q, "lily_4", 99, 0, 0);
          set(q, "lily_5", 99, 0, 0);
          set(q, "lily_9", 99, 0, 0);
          set(q, "waterfall_1", 99, 0, 0);
          set(q, "waterfall_2", 99, 0, 0);
          set(q, "waterfall_3", 99, 0, 0);
          set(q, "waterfall_4", 99, 0, 0);
          set(q, "treasure3d1", 99, 0, 0);
          set(q, "treasure3d2", 99, 0, 0);
          set(q, "treasure3b", 99, 0, 0);
          set(q, "treasure3c", 99, 0, 0);
          set(q, "factory_2", 99, 0, 0);
          set(q, "factory_3", 99, 0, 0);
          set(q, "factory_4", 99, 0, 0);
          set(q, "factory_5", 99, 0, 0);
          set(q, "factory_6", 99, 0, 0);
          set(q, "factory_8", 99, 0, 0);
          set(q, "factory_9", 99, 0, 0);
          set(q, "boomtree_2", 1, 1, 0);
          set(q, "boomtree_3", 1, 1, 0);
          set(q, "boomtree_5", 1, 1, 0);
          set(q, "boomtree_6", 1, 1, 0);
          set(q, "boomtree_7", 1, 1, 0);
          set(q, "boomtree_8", 1, 1, 0);
          set(q, "cork_4", 99, 0, 0);
          set(q, "cork_6", 99, 0, 0);
          set(q, "cosmo_2", 99, 0, 0);
          set(q, "cosmo_4", 99, 0, 0);
          set(q, "cosmo_5", 99, 0, 0);
          q.after(1000, () => {
            set(q, "hard_tile", 99, 0, 0);
            set(q, "blockicon_2", 99, 0, 0);
            set(q, "blockicon_3", 99, 0, 0);
            set(q, "blockicon_4", 99, 0, 0);
            set(q, "c2phantom3", 99, 0, 0);
            set(q, "c3phantom3", 99, 0, 0);
            set(q, "phantom__3", 99, 0, 0);
            set(q, "phantom_9", 99, 0, 0);
            set(q, "phantom_10", 99, 0, 0);
            set(q, "c3factory2", 99, 0, 0);
            set(q, "c3treasure2h", 99, 0, 0);
            set(q, "c2treasure1h", 99, 0, 0);
            set(q, "c1treasure_4", 99, 0, 0);
            set(q, "c1treasure_5", 99, 0, 0);
            set(q, "c1treasure_6", 99, 0, 0);
            set(q, "web_1", 99, 0, 0);
            set(q, "web_2", 99, 0, 0);
            set(q, "web_3", 99, 0, 0);
            set(q, "web_7", 99, 0, 0);
            set(q, "web_8", 99, 0, 0);
            set(q, "web_9", 99, 0, 0);
            set(q, "web_14", 99, 0, 0);
            set(q, "web_15", 99, 0, 0);
            set(q, "web_16", 99, 0, 0);
            set(q, "web_17", 99, 0, 0);
            set(q, "web_18", 99, 0, 0);
            set(q, "web_19", 99, 0, 0);
            set(q, "blockweb1", 99, 0, 0);
            set(q, "blockweb2", 99, 0, 0);
            set(q, "blockweb3", 99, 0, 0);
            set(q, "blockweb7", 99, 0, 0);
            set(q, "blockweb8", 99, 0, 0);
            set(q, "blockweb9", 99, 0, 0);
            set(q, "blockweb14", 99, 0, 0);
            set(q, "blockweb15", 99, 0, 0);
            set(q, "blockweb16", 99, 0, 0);
            set(q, "blockweb17", 99, 0, 0);
            set(q, "blockweb18", 99, 0, 0);
            set(q, "blockweb19", 99, 0, 0);
            set(q, "pail_6ta", 99, 0, 0);
            set(q, "phantom_11", 99, 0, 0);
            set(q, "phantom_12", 99, 0, 0);
            set(q, "phantom_13", 99, 0, 0);
            set(q, "phantom_14", 99, 0, 0);
            set(q, "phantom_15", 99, 0, 0);
            set(q, "phantom_16", 99, 0, 0);
            set(q, "phantom_17", 99, 0, 0);
            set(q, "phantom_18", 99, 0, 0);
            q.send("qicon", "cosmo_1", 1);
            q.send("qcmdVT", 1, "keys", 99, 0, 0);
            set(q, "key_1a", 99, 0, 0);
            set(q, "key_1b", 99, 0, 0);
            set(q, "key_1c", 99, 0, 0);
            set(q, "key_3a", 99, 0, 0);
            set(q, "key_3b", 99, 0, 0);
            set(q, "key_3c", 99, 0, 0);
            set(q, "key_1a_h", 99, 0, 0);
            set(q, "key_1b_h", 99, 0, 0);
            set(q, "key_1c_h", 99, 0, 0);
            set(q, "key_3a_h", 99, 0, 0);
            set(q, "key_3b_h", 99, 0, 0);
            set(q, "key_3c_h", 99, 0, 0);
            q.send("qcmdVT", 1, "waterspot", 99, 0, 0);
            set(q, "waterspot_1", 99, 0, 0);
            set(q, "waterspot_2", 99, 0, 0);
            set(q, "waterspot_3", 99, 0, 0);
            set(q, "waterspot_4", 99, 0, 0);
            set(q, "waterspot_5", 99, 0, 0);
            set(q, "waterspot_6", 99, 0, 0);
            set(q, "waterspot_7", 99, 0, 0);
            q.send("qcmdVT", 1, "planttrig", 99, 0, 0);
            set(q, "r2_t2_t1a", 99, 0, 0);
            set(q, "r2_t2_t1b", 99, 0, 0);
            set(q, "r2_t2_t1c", 99, 0, 0);
            set(q, "r2_t2_t1d", 99, 0, 0);
            set(q, "r2_t2_t2a", 99, 0, 0);
            set(q, "r2_t2_t2b", 99, 0, 0);
            set(q, "r2_t2_t2c", 99, 0, 0);
            set(q, "r2_t2_t2d", 99, 0, 0);
            set(q, "r2_t2_t3a", 99, 0, 0);
            set(q, "r2_t2_t3b", 99, 0, 0);
            set(q, "r2_t2_t3c", 99, 0, 0);
            set(q, "r2_t2_t3d", 99, 0, 0);
            set(q, "r2_t2_t4a", 99, 0, 0);
            set(q, "r2_t2_t4b", 99, 0, 0);
            set(q, "r2_t2_t4c", 99, 0, 0);
            set(q, "r2_t2_t4d", 99, 0, 0);
            set(q, "r2_t3_t1a", 99, 0, 0);
            set(q, "r2_t3_t2a", 99, 0, 0);
            set(q, "r2_t3_t3a", 99, 0, 0);
            set(q, "r2_t3_t4a", 99, 0, 0);
            set(q, "r2_t3_t1b", 99, 0, 0);
            set(q, "r2_t3_t2b", 99, 0, 0);
            set(q, "r2_t3_t3b", 99, 0, 0);
            set(q, "r2_t3_t4b", 99, 0, 0);
            set(q, "r2_t3_t1c", 99, 0, 0);
            set(q, "r2_t3_t2c", 99, 0, 0);
            set(q, "r2_t3_t3c", 99, 0, 0);
            set(q, "r2_t3_t4c", 99, 0, 0);
            set(q, "r2_t3_t1d", 99, 0, 0);
            set(q, "r2_t3_t2d", 99, 0, 0);
            set(q, "r2_t3_t3d", 99, 0, 0);
            set(q, "r2_t3_t4d", 99, 0, 0);
            q.send("qswfs", "r2_t2_1a", "wilt");
            set(q, "r2_t2_1a", 1, 1, 0);
            q.send("qswfs", "r2_t2_2a", "wilt");
            set(q, "r2_t2_2a", 1, 1, 0);
            q.send("qswfs", "r2_t2_3a", "wilt");
            set(q, "r2_t2_3a", 1, 1, 0);
            q.send("qswfs", "r2_t2_4a", "wilt");
            set(q, "r2_t2_4a", 1, 1, 0);
            q.send("qswfs", "r2_t2_1b", "wilt");
            set(q, "r2_t2_1b", 1, 1, 0);
            q.send("qswfs", "r2_t2_2b", "wilt");
            set(q, "r2_t2_2b", 1, 1, 0);
            set(q, "r2_t2_t1a", 0, 1, 1);
            set(q, "r2_t2_t2a", 0, 1, 1);
            set(q, "r2_t2_t3a", 0, 1, 1);
            set(q, "r2_t2_t4a", 0, 1, 1);
            set(q, "r2_t2_t1b", 0, 1, 1);
            set(q, "r2_t2_t2b", 0, 1, 1);
            set(q, "r2_t3_1c", 1, 1, 0);
            set(q, "r2_t3_2c", 1, 1, 0);
            set(q, "r2_t3_3c", 1, 1, 0);
            set(q, "r2_t3_4c", 1, 1, 0);
            set(q, "r2_t3_1d", 1, 1, 0);
            set(q, "r2_t3_2d", 1, 1, 0);
            set(q, "r2_t3_t1c", 0, 1, 1);
            set(q, "r2_t3_t2c", 0, 1, 1);
            set(q, "r2_t3_t3c", 0, 1, 1);
            set(q, "r2_t3_t4c", 0, 1, 1);
            set(q, "r2_t3_t1d", 0, 1, 1);
            set(q, "r2_t3_t2d", 0, 1, 1);
            set(q, "key_1b", 0, 1, 1);
            set(q, "key_3b", 0, 1, 1);
            q.send("qcmdVT", 1, "garden_vary", 2, 0, 0);
            set(q, "exit_vol", 99, 0, 0);
          });
        }
      },
      cosmo_1(q) {
        // step 2
        q.send("qcmd", 3, 0, "cosmo_1", 0, 3752);
      },
      cosmo_2(q) {
        // by hand: see "Cosmo goes by how far things have got" at the top
        const held = q.held(); // what the player carried when this fired
        const c = cosmo(q);
        // the ingredients
        if (COSMO_INGREDIENTS[held] && c.started && !c.brought.includes(held)) {
          q.xp(5, "cosmo_2");
          q.use();
          set(q, held, 99, 0, 0);
          set(q, COSMO_INGREDIENTS[held], 99, 0, 0);
          c.brought.push(held);
          if (c.brought.length === 1) {
            cosmoTalk(q, COSMO_FIRST[held][0], COSMO_FIRST[held][1]);
          }
          else if (c.brought.length === 2) {
            const left = Object.keys(COSMO_INGREDIENTS).find(item => !c.brought.includes(item));
            cosmoTalk(q, COSMO_SECOND[c.brought[0]][held], COSMO_STILL[held][left]);
          }
          else {
            q.send("qcmdVT", 1, "20_uri", 1, 0, 0);
            q.send("qposturi", "/adventure3-meetcosmo/#20-findhoneynectarandchomperseeds/#0#001");
            q.send("qcmdVT", 1, "20_uri", 99, 0, 0);
            cosmoTalk(q, 20, 3761);
          }
          return;
        }
        // the crop he is waiting for
        const order = c.order;
        if (order && c.waiting && held === CROP[order.crops[c.step]][0]) {
          const [item, pickup] = CROP[order.crops[c.step]];
          q.xp(5, "cosmo_2");
          set(q, pickup, 99, 0, 0);
          q.use();
          set(q, item, 99, 0, 0);
          c.waiting = false;
          c.step++;
          cosmoTalk(q, order.start + 2 * c.step, order.talks[c.step]);
          return;
        }
        // a crop he is not waiting for: his hint, and it goes (as recorded)
        if (order && c.waiting && Object.values(CROP).some(([item]) => item === held)) {
          q.send("qcmd", 2, "cosmo_2", order.hints[c.step], 0);
          q.use();
          return;
        }
        // a talk not yet read to its end: again
        if (c.asking) {
          q.send("qcmd", 3, 0, "cosmo_2", c.asking[0], c.asking[1]);
          return;
        }
        if (!c.started) {
          cosmoTalk(q, 0, 3755);
        }
        else if (order && c.waiting) {
          q.send("qcmd", 2, "cosmo_2", order.hints[c.step], 0); // the crop's hint
        }
        else if (c.boulder) {
          // he has gone on by then
        }
        else if (c.seeds) {
          q.send("qcmd", 3, 0, "cosmo_2", 61, 3880); // use the boomseeds on the boulder
        }
        else if (c.boom) {
          q.send("qcmd", 3, 0, "cosmo_2", 59, 3793); // click on the tree
        }
        else if (!order) {
          q.send("qcmd", 2, "cosmo_2", 3757, 0); // where the ingredients are
        }
      },
      roomtrig_t3f(q) {
        // step 28
        q.room("to_3f", "to_3f");
      },
      pickup_necta(q) {
        // by hand: not again while it is already in hand (two walk-ins would ask to drop it)
        if (q.held() !== "nectar") {
          q.send("qgi", "nectar");
        }
      },
      roomtrig_f3f(q) {
        // step 30
        q.room("from_3f", "from_3f");
      },
      pickup_chomp(q) {
        // by hand: not again while it is already in hand (two walk-ins would ask to drop it)
        if (q.held() !== "chompseeds") {
          q.send("qgi", "chompseeds");
        }
      },
      pickup_honey(q) {
        // by hand: not again while it is already in hand (two walk-ins would ask to drop it)
        if (q.held() !== "honey") {
          q.send("qgi", "honey");
        }
      },
      pickup_grape(q) {
        // by hand: not again while it is already in hand (two walk-ins would ask to drop it)
        if (q.held() !== "ga_grape") {
          q.send("qgi", "ga_grape");
        }
      },
      pickup_corn(q) {
        // by hand: not again while it is already in hand (two walk-ins would ask to drop it)
        if (q.held() !== "ga_corn") {
          q.send("qgi", "ga_corn");
        }
      },
      pickup_tomat(q) {
        // by hand: not again while it is already in hand (two walk-ins would ask to drop it)
        if (q.held() !== "ga_tomato") {
          q.send("qgi", "ga_tomato");
        }
      },
      pickup_cabba(q) {
        // by hand: not again while it is already in hand (two walk-ins would ask to drop it)
        if (q.held() !== "ga_cabbage") {
          q.send("qgi", "ga_cabbage");
        }
      },
      pickup_boom1(q) {
        // by hand: the tree gives boomseeds five times, then grows them again,
        // for as long as it is wanted (the maker had it stop after five)
        const n = tally(q, "trigger pickup_boom1");
        const round = (n - 1) % 5 + 1;
        if (n === 1) {
          cosmo(q).seeds = true;
          set(q, "cosmo_2", 60, 1, 1);
          q.send("qcmd", 38, 3791);
          set(q, "cosmo_2", 61, 1, 1);
        }
        // his line about the boomseeds, until the boulder is cleared (twice in the recordings)
        if (n <= 2 && !cosmo(q).boulder && !q.vars.boulderDone) {
          q.send("qcmd", 3, 0, "cosmo_x", 0, 3794);
        }
        giveSeeds(q, 137, 3, 3);
        set(q, "boomtree_1", round + 1, 1, round === 5 ? 1 : 0);
        if (round === 5) {
          set(q, "pickup_boom1", 99, 0, 0);
          q.after(14720, () => {
            set(q, "pickup_boom1", 0, 1, 1);
            set(q, "boomtree_1", 1, 1, 0);
          });
        }
      },
      to_den1(q) {
        // step 52
        q.room("from_3a_den1", "from_3a_den1");
      },
      to_3a_den1(q) {
        // step 55
        q.room("from_den1", "from_den1");
      },
      r3_t1_nitngl(q) {
        // step 56
        set(q, "florence", 1, 1, 0);
        q.send("qsnd", "ajq_nightingalefull");
        set(q, "r3_t1_nitngl", 1, 0, 0);
        q.after(3470, () => {
          set(q, "r3_t1_nitngl", 0, 1, 1);
          set(q, "florence", 0, 1, 0);
          q.send("qcmdVT", 1, "r3_t1_timer", 0, 0, 0);
        });
      },
      to_3h1(q) {
        // step 70: once
        if (once(q, "step70")) {
          q.send("qcmdVT", 1, "cave1_once", 1, 0, 0);
          q.vars.cave1 = true; // by hand: the koalas' lines change after this
          q.send("qicon", "key_1b_icon", 1);
          q.send("qcmdVT", 1, "40_uri", 1, 0, 0);
          q.send("qposturi", "/adventure3-meetcosmo/#40-enteredfirstcave/#0#001");
          q.send("qcmdVT", 1, "40_uri", 99, 0, 0);
          q.send("qcmd", 38, 3897);
          q.send("qicon", "cavestone_1", 0);
        }
        // by hand: the way in works every time (the maker had it once only)
        q.room("from_3a1", "from_3a1");
      },
      slidevol_3(q) {
        // step 71
        q.send("qsnd", "ajq_slidedouble");
      },
      c2phantom2__give_gem(q) {
        // step 73: once
        if (once(q, "step73")) {
          q.send("qad", "c2phantom2__give_gem", 0, "null");
          q.gems(25);
        }
      },
      c2phantom1__give_gem(q) {
        // step 75: once
        if (once(q, "step75")) {
          q.send("qad", "c2phantom1__give_gem", 0, "null");
          q.gems(25);
        }
      },
      slidevol_1(q) {
        // step 76
        q.send("qsnd", "ajq_slidesingle");
      },
      slidevol_2(q) {
        // step 77
        q.send("qsnd", "ajq_slidedouble");
      },
      slidevol_4(q) {
        // step 78
        q.send("qsnd", "ajq_slidedouble");
      },
      // by hand: the cave's other way in and out, as in hard mode
      to_3h2(q) {
        q.room("from_3a2", "from_3a2");
      },
      to_3a1(q) {
        q.room("from_3h1", "from_3h1");
      },
      to_3a2(q) {
        // step 79
        q.room("from_3h2", "from_3h2");
      },
      cave1_exit(q) {
        // step 80
        q.send("qcmd", 38, 3896);
        set(q, "cave1_exit", 1, 0, 0);
      },
      secretvol_6(q) {
        // step 81
        q.send("qsnd", "ajq_mussecretareast");
      },
      cosmo_5_show(q) {
        // step 83
        q.send("qswfs", "cosmo_5", "appear");
        set(q, "cosmo_5", 0, 1, 1);
        q.send("qcmd", 3, 0, "cosmo_5", 0, 3882);
        set(q, "cosmo_5_show", 1, 0, 0);
      },
      factory_3(q) {
        spawning(q, "factory_3"); // the factory starts sending out phantoms
        const n = tally(q, "trigger factory_3");
        // step 85: the 1st time
        if (n === 1) {
          set(q, "factory_3", 1, 1, 1);
        }
      },
      factory_3__0___give_d(q) {
        // step 86: once
        if (once(q, "step86")) {
          q.send("qad", "factory_3__0___give_d", 0, "null");
          q.gems(25);
        }
      },
      factory_4(q) {
        spawning(q, "factory_4"); // the factory starts sending out phantoms
        const n = tally(q, "trigger factory_4");
        // step 87: the 1st time
        if (n === 1) {
          set(q, "factory_4", 1, 1, 1);
        }
        // step 88: the 2nd time
        if (n === 2) {
          q.after(1320, () => {
            q.send("qsnd", "ajq_riverclear");
            set(q, "watervol_3", 99, 0, 0);
          });
        }
      },
      factory_4__0___give_d(q) {
        // step 89: once
        if (once(q, "step89")) {
          q.send("qad", "factory_4__0___give_d", 0, "null");
          q.gems(25);
        }
      },
      to_den2(q) {
        // step 92
        q.room("from_3a_den2", "from_3a_den2");
      },
      koala_5(q) {
        // step 93
        q.send("qcmd", 2, "koala_5", 3819, 1);
      },
      to_3a_den2(q) {
        // step 95
        q.room("from_den2", "from_den2");
      },
      factory_5(q) {
        spawning(q, "factory_5"); // the factory starts sending out phantoms
        const n = tally(q, "trigger factory_5");
        // step 96: the 1st time
        if (n === 1) {
          set(q, "factory_5", 1, 1, 1);
        }
      },
      factory_5__0___give_d(q) {
        // step 97: once
        if (once(q, "step97")) {
          q.send("qad", "factory_5__0___give_d", 0, "null");
          q.gems(25);
        }
      },
      phantom__8__give_gem(q) {
        // step 98: once
        if (once(q, "step98")) {
          q.send("qad", "phantom__8__give_gem", 0, "null");
          q.gems(25);
        }
      },
      factory_6(q) {
        spawning(q, "factory_6"); // the factory starts sending out phantoms
        const n = tally(q, "trigger factory_6");
        // step 101: the 1st time
        if (n === 1) {
          set(q, "factory_6", 1, 1, 1);
        }
      },
      factory_6__0___give_d(q) {
        // step 102: once
        if (once(q, "step102")) {
          q.send("qad", "factory_6__0___give_d", 0, "null");
          q.gems(25);
        }
      },
      factory_8(q) {
        spawning(q, "factory_8"); // the factory starts sending out phantoms
        const n = tally(q, "trigger factory_8");
        // step 103: the 1st time
        if (n === 1) {
          set(q, "factory_8", 1, 1, 1);
        }
      },
      factory_8__0___give_d(q) {
        // step 104: once
        if (once(q, "step104")) {
          q.send("qad", "factory_8__0___give_d", 0, "null");
          q.gems(25);
        }
      },
      factory_9(q) {
        spawning(q, "factory_9"); // the factory starts sending out phantoms
        const n = tally(q, "trigger factory_9");
        // step 110: the 1st time
        if (n === 1) {
          set(q, "factory_9", 1, 1, 1);
        }
      },
      factory_9__0___give_d(q) {
        // step 111: once
        if (once(q, "step111")) {
          q.send("qad", "factory_9__0___give_d", 0, "null");
          q.gems(25);
        }
      },
      to_den3(q) {
        // step 112
        q.room("from_3a_den3", "from_3a_den3");
      },
      to_3a_den3(q) {
        // step 115
        q.room("from_den3", "from_den3");
      },
      factory_2(q) {
        spawning(q, "factory_2"); // the factory starts sending out phantoms
        const n = tally(q, "trigger factory_2");
        // step 126: the 1st time
        if (n === 1) {
          set(q, "factory_2", 1, 1, 1);
        }
      },
      factory_2__0___give_d(q) {
        // step 127: once
        if (once(q, "step127")) {
          q.send("qad", "factory_2__0___give_d", 0, "null");
          q.gems(25);
        }
      },
      pipetrig_5b(q) {
        const held = q.held(); // what the player carried when this fired
        // step 130: only while holding cork_22, once
        if (held === "cork_22" && once(q, "step130")) {
          q.use();
          set(q, "pipe_5b", 1, 1, 0);
          set(q, "sludge_5b", 1, 0, 0);
          set(q, "pipeinfo_5b", 99, 0, 0);
          q.xp(5, "pipetrig_5b");
          q.send("qcmdVT", 1, "water5", bump(q, "water5"), 0, 0); // one more than last time
          counted(q, "water5"); // what that count sets off
          q.send("qcmdVT", 1, "pipecount", bump(q, "pipecount"), 0, 0); // one more than last time
          counted(q, "pipecount"); // what that count sets off
          set(q, "pipetrig_5b", 1, 0, 0);
        }
      },
      to_3g1(q) {
        const n = tally(q, "trigger to_3g1");
        // step 131: the 1st time
        if (n === 1) {
          q.send("qcmdVT", 1, "cave2_once", 1, 0, 0);
          q.send("qicon", "key_3b_icon", 1);
          q.send("qcmdVT", 1, "60_uri", 1, 0, 0);
          q.send("qposturi", "/adventure3-meetcosmo/#60-enteredlastcave/#0#001");
          q.send("qcmdVT", 1, "60_uri", 99, 0, 0);
          q.send("qcmd", 38, 3899);
        }
        // step 132: the 2nd time and after
        if (n >= 2) {
          q.room("from_3a5", "from_3a5");
        }
      },
      to_3a5(q) {
        // step 133
        q.room("from_3g1", "from_3g1");
      },
      pipetrig_5a(q) {
        const held = q.held(); // what the player carried when this fired
        // step 134: only while holding cork_3, once
        if (held === "cork_3" && once(q, "step134")) {
          q.use();
          set(q, "pipe_5a", 1, 1, 0);
          set(q, "sludge_5a", 1, 0, 0);
          set(q, "pipeinfo_5a", 99, 0, 0);
          q.xp(5, "pipetrig_5a");
          q.send("qcmdVT", 1, "water5", bump(q, "water5"), 0, 0); // one more than last time
          counted(q, "water5"); // what that count sets off
          q.send("qcmdVT", 1, "pipecount", bump(q, "pipecount"), 0, 0); // one more than last time
          counted(q, "pipecount"); // what that count sets off
          set(q, "pipetrig_5a", 1, 0, 0);
        }
      },
      pipetrig_5c(q) {
        const held = q.held(); // what the player carried when this fired
        // step 135: only while holding cork_6, once
        if (held === "cork_6" && once(q, "step135")) {
          q.use();
          set(q, "pipe_5c", 1, 1, 0);
          set(q, "sludge_5c", 1, 0, 0);
          set(q, "pipeinfo_5c", 99, 0, 0);
          q.xp(5, "pipetrig_5c");
          q.send("qcmdVT", 1, "water5", bump(q, "water5"), 0, 0); // one more than last time
          counted(q, "water5"); // what that count sets off
          set(q, "water_5", 0, 1, 0);
          q.send("qcmdVT", 1, "pipecount", bump(q, "pipecount"), 0, 0); // one more than last time
          counted(q, "pipecount"); // what that count sets off
          set(q, "pipetrig_5c", 1, 0, 0);
          q.after(2260, () => {
            q.send("qsnd", "ajq_riverclear");
          });
        }
      },
      c3phantom4__give_gem(q) {
        // step 136: once
        if (once(q, "step136")) {
          q.send("qad", "c3phantom4__give_gem", 0, "null");
          q.gems(25);
        }
      },
      c3phantom1__give_gem(q) {
        // step 137: once
        if (once(q, "step137")) {
          q.send("qad", "c3phantom1__give_gem", 0, "null");
          q.gems(25);
        }
      },
      slidevol_12(q) {
        // step 138
        q.send("qsnd", "ajq_slidesingle");
      },
      slidevol_13(q) {
        // step 140
        q.send("qsnd", "ajq_slidesingle");
      },
      c3factory1(q) {
        spawning(q, "c3factory1"); // the factory starts sending out phantoms
        const n = tally(q, "trigger c3factory1");
        // step 141: the 1st time
        if (n === 1) {
          set(q, "c3factory1", 1, 1, 1);
        }
      },
      c3factory1__0___give_d(q) {
        // step 142: once
        if (once(q, "step142")) {
          q.send("qad", "c3factory1__0___give_d", 0, "null");
          q.gems(25);
        }
      },
      blocktrig_1(q) {
        // step 143
        q.send("qcmd", 2, "blocktrig_1", 4016, 0);
      },
      slidevol_11(q) {
        // step 145
        q.send("qsnd", "ajq_slidedouble");
      },
      cosmo_4(q) {
        // step 148
        q.send("qcmd", 3, 0, "cosmo_4", 1, 3874);
      },
      exit_vol(q) {
        // step 150
        q.send("qcmd", 19);
      },
    },

    // families of triggers: the rule for any of them; {n} is its number
    triggerLike: [
      // by hand: the other boomseed trees give seeds five times, then grow them
      // again, for as long as they are wanted (the maker had them stop)
      [/^pickup_boom([2-9])$/, (q, name) => {
        const tree = `boomtree_${name.slice(-1)}`;
        const round = (tally(q, "trigger " + name) - 1) % 5 + 1;
        giveSeeds(q, 137, 3, 3);
        set(q, tree, round + 1, 1, round === 5 ? 1 : 0);
        if (round === 5) {
          set(q, name, 99, 0, 0);
          q.after(14720, () => {
            set(q, name, 0, 1, 1);
            set(q, tree, 1, 1, 0);
          });
        }
      }],
      // by hand: the bamboo pipes. the nightingale's song is 1, 2, 3, 5, 3; pipe 4
      // is never in it. a pipe out of turn starts the song again (from 1 if it was
      // pipe 1); they can be played for as long as wanted, before and after
      [/^bamboo_([1-5])$/, (q, name) => {
        const pipe = Number(name.slice(-1));
        q.vars.notes = q.vars.notes || 0;
        if (pipe === 4) {
          q.send("qsnd", "ajq_ngnoteswrong");
          set(q, "bamboo", 4, 1, 0);
        }
        else {
          q.send("qsnd", `ajq_ngnotes${pipe === 5 ? 4 : pipe}`);
          set(q, "bamboo", pipe, 1, 0);
          if (pipe === SONG[q.vars.notes]) {
            q.vars.notes++;
            q.send("qcmdVT", 1, "note_count", q.vars.notes, 0, 0);
          }
          else if (pipe === SONG[0]) {
            if (q.vars.notes !== 1) {
              q.vars.notes = 1;
              q.send("qcmdVT", 1, "note_count", 1, 0, 0);
            }
          }
          else {
            q.vars.notes = 0;
            q.send("qcmdVT", 1, "note_count", 1, 0, 0);
            q.send("qcmdVT", 1, "note_count", 0, 0, 0);
            set(q, "bamboo", 0, 1, 0);
          }
          if (q.vars.notes === SONG.length) {
            q.vars.notes = 0;
            if (once(q, "the song")) {
              q.vars.song = true;
              q.send("qcmdVT", 1, "vine_once", 1, 0, 0);
              q.send("qicon", "cavestone_1", 1);
              q.send("qcmd", 38, 3890);
              set(q, "koala_3", 1, 1, 1);
              set(q, "vine_ladder", 1, 1, 0);
              set(q, "blockvolvine", 1, 0, 0);
              q.xp(25, "note_count");
            }
            q.send("qcmdVT", 1, "note_count", 0, 0, 0);
            set(q, "bamboo", 0, 1, 0);
          }
        }
        set(q, name, 1, 1, 1);
        set(q, name, 0, 1, 1);
      }],
      // by hand: the chomper plants (r2_t2) and crops (r2_t3): any pail waters any
      // of them; without one, its "?" says what it needs
      [/^r2_t([23])_t([1-4][a-d])$/, (q, name) => {
        const [, kind, spot] = name.match(/^r2_t([23])_t([1-4][a-d])$/);
        const held = q.held(); // what the player carried when this fired
        const plant = `r2_t${kind}_${spot}`;
        const info = `r2_t${kind}_i${spot}`;
        if (/^pail_\w+$/.test(held || "") && once(q, "watered " + plant)) {
          q.xp(5, name);
          q.use();
          if (kind === "2") {
            q.send("qswfs", plant, "revive");
          }
          set(q, plant, 0, 1, 0);
          q.send("qcmdVT", 1, "revived", bump(q, "revived"), 0, 0); // one more than last time
          counted(q, "revived"); // what that count sets off
          set(q, name, 1, 0, 0);
          set(q, info, 0, 0, 0);
        }
        else if (!/^pail_\w+$/.test(held || "") && !(q.vars.done || new Set()).has("watered " + plant)) {
          set(q, info, 1, 1, 1);
          q.send("qcmd", 2, info, kind === "2" ? 3703 : 15853, 2);
        }
      }],
      [/^waterspot_(\d+)$/, (q, name) => {
        const n = name.match(/^waterspot_(\d+)$/)[1];
        const held = q.held(); // what the player carried when this fired
        // each of them, holding pail_#, once each
        if (/^pail_\d+[a-z]?$/.test(held || "") && once(q, "waterspot_# pail_# " + name)) {
          // step 151
          q.send("qcmdVT", 1, "wateredplant", bump(q, "wateredplant"), 0, 0); // one more than last time
          counted(q, "wateredplant"); // what that count sets off
          q.use();
          set(q, `${name}`, 1, 0, 0);
          q.xp(5, `${name}`);
          // by hand: each spot grows its own crop, and its "?" goes (the maker had them by how many were watered)
          set(q, GARDEN[n], 1, 1, 0);
          set(q, `waterinfo_${n}`, 0, 0, 0);
        }
        // waterspot_3, holding pail_#, once each
        if (name === "waterspot_3" && /^pail_\d+[a-z]?$/.test(held || "") && once(q, "waterspot_# pail_# waterspot_3 " + name)) {
          // step 152
          set(q, "grow_cabbage", 1, 1, 0);
        }
        // waterspot_2, holding pail_#, once each
        if (name === "waterspot_2" && /^pail_\d+[a-z]?$/.test(held || "") && once(q, "waterspot_# pail_# waterspot_2 " + name)) {
          // step 153
          set(q, "grow_strawbe", 1, 1, 0);
        }
        // waterspot_1, holding pail_#, once each
        if (name === "waterspot_1" && /^pail_\d+[a-z]?$/.test(held || "") && once(q, "waterspot_# pail_# waterspot_1 " + name)) {
          // step 154
          set(q, "grow_radish", 1, 1, 0);
        }
        // waterspot_7, holding pail_#, once each
        if (name === "waterspot_7" && /^pail_\d+[a-z]?$/.test(held || "") && once(q, "waterspot_# pail_# waterspot_7 " + name)) {
          // step 155
          set(q, "grow_carrot", 1, 1, 0);
        }
        // waterspot_6, holding pail_#, once each
        if (name === "waterspot_6" && /^pail_\d+[a-z]?$/.test(held || "") && once(q, "waterspot_# pail_# waterspot_6 " + name)) {
          // step 156
          set(q, "grow_grape", 1, 1, 0);
        }
        // waterspot_5, holding pail_#, once each
        if (name === "waterspot_5" && /^pail_\d+[a-z]?$/.test(held || "") && once(q, "waterspot_# pail_# waterspot_5 " + name)) {
          // step 157
          set(q, "grow_corn", 1, 1, 0);
        }
        // waterspot_4, holding pail_#, once each
        if (name === "waterspot_4" && /^pail_\d+[a-z]?$/.test(held || "") && once(q, "waterspot_# pail_# waterspot_4 " + name)) {
          // step 158
          set(q, "grow_tomato", 1, 1, 0);
        }
        // each of them, unless holding pail_#
        if (!/^pail_\d+[a-z]?$/.test(held || "")) {
          // step 160
          set(q, `waterinfo_${n}`, 1, 1, 1);
          q.send("qcmd", 2, `waterinfo_${n}`, 15853, 2);
        }
      }],
      [/^pipetrig_(\d+)$/, (q, name) => {
        const n = name.match(/^pipetrig_(\d+)$/)[1];
        const held = q.held(); // what the player carried when this fired
        // pipetrig_9, unless holding cork_#
        if (name === "pipetrig_9" && !/^cork_\d+[a-z]?$/.test(held || "")) {
          // step 159
          set(q, "pipeinfo_9", 1, 1, 1);
          q.send("qcmd", 2, "pipeinfo_9", 3468, 2);
        }
        // each of them, holding cork_#, once each
        if (/^cork_\d+[a-z]?$/.test(held || "") && once(q, "pipetrig_# cork_# " + name)) {
          // step 162
          q.use();
          set(q, `pipe_${n}`, 1, 1, 0);
          set(q, `pipeinfo_${n}`, 99, 0, 0);
          q.xp(5, `${name}`);
          set(q, `water_${n}`, 0, 1, 0);
          q.send("qcmdVT", 1, "pipecount", bump(q, "pipecount"), 0, 0); // one more than last time
          counted(q, "pipecount"); // what that count sets off
          set(q, `${name}`, 1, 0, 0);
          q.send("qsnd", "ajq_riverclear");
        }
        // pipetrig_9, holding cork_#, once each
        if (name === "pipetrig_9" && /^cork_\d+[a-z]?$/.test(held || "") && once(q, "pipetrig_# cork_# pipetrig_9 " + name)) {
          // step 163
          set(q, "sludge_9", 990, 0, 0);
        }
        // pipetrig_3, holding cork_#, once each
        if (name === "pipetrig_3" && /^cork_\d+[a-z]?$/.test(held || "") && once(q, "pipetrig_# cork_# pipetrig_3 " + name)) {
          // step 164
          set(q, "sludge_3", 990, 0, 0);
        }
        // pipetrig_1, holding cork_#, once each
        if (name === "pipetrig_1" && /^cork_\d+[a-z]?$/.test(held || "") && once(q, "pipetrig_# cork_# pipetrig_1 " + name)) {
          // step 165
          set(q, "waterfall_2", 0, 1, 0);
          set(q, "sludge_1", 99, 0, 0);
        }
        // pipetrig_4, holding cork_#, once each
        if (name === "pipetrig_4" && /^cork_\d+[a-z]?$/.test(held || "") && once(q, "pipetrig_# cork_# pipetrig_4 " + name)) {
          // step 166
          set(q, "waterfall_1", 0, 1, 0);
          set(q, "sludge_4", 99, 0, 0);
        }
      }],
      [/^phantom_(\d+)__give_gem$/, (q, name) => {
        const n = name.match(/^phantom_(\d+)__give_gem$/)[1];
        // each of them, once each
        if (once(q, "phantom_#__give_gem - " + name)) {
          // step 161
          q.send("qad", `${name}`, 0, "null");
          q.gems(25);
        }
      }],
      [/^trapkey_(\d+)$/, (q, name) => {
        const n = name.match(/^trapkey_(\d+)$/)[1];
        const held = q.held(); // what the player carried when this fired
        // trapkey_1, unless holding key_#
        if (name === "trapkey_1" && !/^key_\d+[a-z]?$/.test(held || "")) {
          // step 167
          set(q, "koala_4", 1, 1, 1);
          q.send("qcmd", 2, "koala_4", 3806, 1);
          q.send("qswfs", "koala_4", "facesw");
          set(q, "koala_4", 0, 1, 0);
        }
        // trapkey_3, unless holding key_#
        if (name === "trapkey_3" && !/^key_\d+[a-z]?$/.test(held || "")) {
          // step 168
          set(q, "koala_10", 1, 1, 1);
          q.send("qcmd", 2, "koala_10", 3808, 1);
          q.send("qswfs", "koala_10", "facesw");
          set(q, "koala_10", 0, 1, 0);
        }
        // each of them, holding key_#, once each
        if (/^key_\d+[a-z]?$/.test(held || "") && once(q, "trapkey_# key_# " + name)) {
          // step 170
          q.send("qcmdVT", 1, "trapnotify", bump(q, "trapnotify"), 0, 0); // one more than last time
          counted(q, "trapnotify"); // what that count sets off
          q.use();
          set(q, `trapvol_${n}`, 99, 0, 0);
          set(q, `cage_${n}`, 1, 1, 0);
          q.xp(10, `${name}`);
          set(q, `${name}`, 1, 0, 0);
        }
        // trapkey_1, holding key_#, once each
        if (name === "trapkey_1" && /^key_\d+[a-z]?$/.test(held || "") && once(q, "trapkey_# key_# trapkey_1 " + name)) {
          // step 171
          q.send("qswfs", "koala_4", "hop");
          set(q, "koala_4", 2, 1, 1);
          q.send("qcmd", 2, "koala_4", 3810, 1);
          set(q, "koala_4", 3, 1, 0);
          set(q, "koala_3", 2, 1, 1);
          set(q, "koala_1", 1, 1, 1);
        }
        // trapkey_3, holding key_#, once each
        if (name === "trapkey_3" && /^key_\d+[a-z]?$/.test(held || "") && once(q, "trapkey_# key_# trapkey_3 " + name)) {
          // step 172
          q.send("qswfs", "koala_10", "hop");
          set(q, "koala_10", 2, 1, 1);
          q.send("qcmd", 2, "koala_10", 3812, 1);
          appear(q, "cosmo_4");
          set(q, "koala_5", 1, 1, 1);
          q.send("qicon", "cosmo_4", 1);
          set(q, "koala_10", 3, 1, 0);
        }
      }],
      [/^seedpile_(\d+)$/, (q, name) => {
        const n = name.match(/^seedpile_(\d+)$/)[1];
        // each of them
        {
          // step 169
          giveSeeds(q, 137, 3, 3);
        }
      }],
      [/^trigfact(\d+)$/, (q, name) => {
        const n = name.match(/^trigfact(\d+)$/)[1];
        // each of them
        {
          // step 173
          set(q, `${name}`, 1, 0, 0);
          // by hand: not again once it has been destroyed
          if (!spawnState(q, `factory_${n}`).dead) {
            q.send("qswfs", `factory_${n}`, "appear");
            set(q, `factory_${n}`, 0, 1, 1);
          }
        }
      }],
    ],

    // a talk read to its end
    answer: {
      cosmo_1(q) {
        // step 3: once
        if (once(q, "step3")) {
          q.send("qcmdVT", 1, "00_uri", 1, 0, 0);
          q.send("qcmdVT", 1, "players", 1, 0, 0);
          q.send("qposturi", "/adventure3-meetcosmo/#00-start/#0#001");
          q.send("qcmdVT", 1, "00_uri", 99, 0, 0);
          q.send("qswfs", "cosmo_1", "disappear");
          set(q, "cosmo_1", 1, 1, 1);
          set(q, "pail_1", 0, 1, 0);
          q.send("qcmdVT", 1, "waterspot", 0, 0, 0);
          set(q, "waterspot_1", 0, 1, 1);
          set(q, "waterspot_2", 0, 1, 1);
          set(q, "waterspot_3", 0, 1, 1);
          set(q, "waterspot_4", 0, 1, 1);
          set(q, "waterspot_5", 0, 1, 1);
          set(q, "waterspot_6", 0, 1, 1);
          set(q, "waterspot_7", 0, 1, 1);
          q.send("qcmd", 38, 3753);
          q.send("qicon", "cosmo_1", 0);
          set(q, "cosmo_1", 2, 1, 0);
          q.after(1580, () => {
            set(q, "cosmo_1", 3, 0, 0);
          });
        }
      },
      cosmo_2(q, state) {
        // by hand: by which of his talks was read (its state), not how many
        const c = cosmo(q);
        state = Number(state);
        if (!c.asking || c.asking[0] !== state) {
          return;
        }
        c.asking = null;
        if (state === 0) {
          c.started = true;
          set(q, "pickup_necta", 0, 1, 1);
          set(q, "pickup_chomp", 0, 1, 1);
          set(q, "pickup_honey", 0, 1, 1);
          q.send("qcmd", 38, 3756);
          set(q, "cosmo_2", 1, 1, 1);
          return;
        }
        if (state < 20) {
          const goal = c.brought.length === 1 ? COSMO_FIRST[c.brought[0]][2]
            : COSMO_LEFT_GOAL[Object.keys(COSMO_INGREDIENTS).find(item => !c.brought.includes(item))];
          q.send("qcmd", 38, goal);
          set(q, "cosmo_2", state + 1, 1, 1);
          return;
        }
        if (state === 20) {
          c.order = COSMO_ORDERS[Math.floor(Math.random() * COSMO_ORDERS.length)];
          c.step = 0;
          // all the crops can be picked from here on (as recorded in hard mode)
          for (const name of Object.keys(CROP)) {
            set(q, CROP[name][1], 0, 1, 1);
          }
          set(q, "cosmo_2", 21, 1, 1);
          cosmoTalk(q, c.order.start, c.order.talks[0]);
          return;
        }
        const order = c.order;
        if (order && state === order.start + 2 * c.step && c.step < 4) {
          q.send("qcmd", 38, order.goals[c.step]);
          set(q, "cosmo_2", state + 1, 1, 1);
          c.waiting = true;
          return;
        }
        if (order && state === order.start + 8) {
          c.boom = true;
          set(q, "boomtree_1", 1, 1, 0);
          set(q, "pickup_boom1", 0, 1, 1);
          cosmoTalk(q, 58, 3790);
          return;
        }
        if (state === 58) {
          q.send("qcmdVT", 1, "30_uri", 1, 0, 0);
          q.send("qposturi", "/adventure3-meetcosmo/#30-collectvegetables/#0#001");
          q.send("qcmdVT", 1, "30_uri", 99, 0, 0);
          q.send("qcmd", 38, 3795);
          set(q, "potion", 99, 0, 0);
          set(q, "ga_rockinfo", 0, 1, 1);
          set(q, "cosmo_2", 59, 1, 1);
          return;
        }
        if (state === 62) {
          c.boulder = true;
          q.send("qicon", "cosmo_2", 0);
          q.send("qcmd", 38, 3879);
          q.send("qswfs", "cosmo_2", "disappear");
          set(q, "cosmo_2", 63, 1, 1);
          q.send("qmusic", 0);
          q.send("qmusic", "ajq_musqueststealth");
          // the crops he did not ask for go; the carrot stays (a koala wants one later)
          for (const name of Object.keys(CROP)) {
            if (name !== "carrot") {
              set(q, CROP[name][1], 99, 0, 0);
            }
          }
          set(q, "pickup_carro", 0, 1, 1);
          set(q, "cosmo_2", 64, 1, 0);
          set(q, "cosmo_x", 99, 0, 0);
          q.after(1050, () => {
            set(q, "cosmo_2", 99, 0, 0);
          });
        }
      },
      cosmo_5(q) {
        // step 84
        q.send("qswfs", "cosmo_5", "disappear");
        set(q, "cosmo_5", 1, 1, 1);
        set(q, "cosmo_5", 2, 1, 0);
        q.after(1380, () => {
          set(q, "cosmo_5", 99, 0, 0);
        });
      },
      cosmo_4(q) {
        // step 149: once
        if (once(q, "step149")) {
          q.send("qicon", "cosmo_4", 0);
          set(q, "exit_port", 1, 1, 0);
          set(q, "portal", 1, 1, 0);
          q.xp(50, "cosmo_4");
          q.send("qcmd", 38, 3902);
          set(q, "cosmo_4", 2, 1, 0);
          q.after(180, () => {
            q.send("qcmdVT", 1, "80_uri", 1, 0, 0);
            q.send("qposturi", "/adventure3-meetcosmo/#80-exit/#0#001");
            q.offer([[3,750,750],[1,1308,0],[1,1309,0],[1,1310,0],[1,1311,0]]); // [1, den item, 0], [2, clothing item, ?] or [3, gems, gems]
            q.after(3010, () => {
              set(q, "exit_vol", 0, 1, 1);
              set(q, "exit_block", 99, 0, 0);
            });
          });
        }
      },
    },

    // an item picked up
    pickedUp: {
      cork_11(q) {
        // step 54
        set(q, "koala_2", 1, 1, 1);
      },
      key_1b(q) {
        // step 72
        q.send("qicon", "key_1b_icon", 0);
      },
      cork_22(q) {
        // step 94
        q.send("qcmdVT", 1, "den2corks", bump(q, "den2corks"), 0, 0); // one more than last time
      },
      key_3b(q) {
        // step 139
        q.send("qicon", "key_3b_icon", 0);
      },
    },

    // a chest, opened
    opened: {
      treasure_1(q) {
        if (!once(q, "opened treasure_1")) {
          return;
        }
        q.gems(50);
      },
      treasure_2(q) {
        if (!once(q, "opened treasure_2")) {
          return;
        }
        q.gems(200);
        // step 129
        q.xp(5, "treasure_2");
      },
      treasure_3(q) {
        if (!once(q, "opened treasure_3")) {
          return;
        }
        q.gems(50);
      },
      treasure_4(q) {
        if (!once(q, "opened treasure_4")) {
          return;
        }
        q.gems(50);
      },
      treasure_5(q) {
        if (!once(q, "opened treasure_5")) {
          return;
        }
        q.gems(50);
      },
      treasure_6(q) {
        if (!once(q, "opened treasure_6")) {
          return;
        }
        q.gems(50);
      },
      treasure_7(q) {
        if (!once(q, "opened treasure_7")) {
          return;
        }
        q.gems(50);
      },
      c1treasure_1(q) {
        if (!once(q, "opened c1treasure_1")) {
          return;
        }
        q.gems(50);
      },
      c1treasure_2(q) {
        if (!once(q, "opened c1treasure_2")) {
          return;
        }
        q.gems(100);
        // step 82
        q.xp(5, "c1treasure_2");
      },
      c1treasure_3(q) {
        if (!once(q, "opened c1treasure_3")) {
          return;
        }
        q.clothes(...passageClothing(q, "c1treasure_3", {hard: false}));
      },
      c1treasure_4(q) {
        if (!once(q, "opened c1treasure_4")) {
          return;
        }
        q.clothes(...passageClothing(q, "c1treasure_4", {hard: true}));
      },
      c1treasure_5(q) {
        if (!once(q, "opened c1treasure_5")) {
          return;
        }
        q.clothes(...passageClothing(q, "c1treasure_5", {hard: true}));
      },
      c1treasure_6(q) {
        if (!once(q, "opened c1treasure_6")) {
          return;
        }
        q.clothes(...passageClothing(q, "c1treasure_6", {hard: true}));
      },
      c2treasure1(q) {
        if (!once(q, "opened c2treasure1")) {
          return;
        }
        q.gems(150);
        // step 74
        q.xp(5, "c2treasure1");
      },
      c2treasure1h(q) {
        if (!once(q, "opened c2treasure1h")) {
          return;
        }
        q.gems(50);
      },
      c3treasure1(q) {
        if (!once(q, "opened c3treasure1")) {
          return;
        }
        q.gems(150);
        // step 147
        q.xp(5, "c3treasure1");
      },
      c3treasure2(q) {
        if (!once(q, "opened c3treasure2")) {
          return;
        }
        q.gems(150);
        // step 144
        q.xp(5, "c3treasure2");
      },
      c3treasure2h(q) {
        if (!once(q, "opened c3treasure2h")) {
          return;
        }
        q.gems(50);
      },
      c3treasure3(q) {
        if (!once(q, "opened c3treasure3")) {
          return;
        }
        q.gems(150);
        // step 146
        q.xp(5, "c3treasure3");
      },
      treasure3b(q) {
        if (!once(q, "opened treasure3b")) {
          return;
        }
        q.gems(50);
      },
      treasure3c(q) {
        if (!once(q, "opened treasure3c")) {
          return;
        }
        q.gems(50);
      },
      treasure3d1(q) {
        if (!once(q, "opened treasure3d1")) {
          return;
        }
        q.gems(50);
      },
      treasure3d2(q) {
        if (!once(q, "opened treasure3d2")) {
          return;
        }
        q.gems(50);
      },
    },

    // a plant ate a phantom: [actor, 50, 1, x, y, ""] has it die there
    eaten(q, plant, phantom, x, y) {
      if (!once(q, "eaten " + phantom)) {
        return;
      }
      const how = {"gardenrock":[1,1],"cavestone_1":[1,1],"factory_3":[1,1],"factory_4":[1,1],"factory_5":[1,1],"factory_6":[1,1],"factory_8":[1,1],"factory_9":[1,1],"factory_2":[1,1],"cavestone_2":[1,1],"c3factory1":[1,1],"boomrock5":[1,1]}; // how these die (phantoms: 50, 1)
      const drops = {"phantom__8":"cork_4"}; // what is left behind
      q.send("qad", phantom, (how[phantom] || [50, 1])[0], (how[phantom] || [50, 1])[1], x, y, drops[phantom] || "");
      spawned(q, phantom); // a factory destroyed, or one of its phantoms gone
      // step 174: every phantom_#
      if (/^(?:phantom_\d+[a-z]?)$/.test(phantom)) {
        q.send("qspn", `${phantom}`, `${phantom}__give_gem`, 200, 42, 3, 25, "null", "null", "null");
        q.xp(5, `${phantom}`);
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 175: every cavestone_#
      if (/^(?:cavestone_\d+[a-z]?)$/.test(phantom)) {
        q.xp(5, `${phantom}`);
        q.send("qsnd", "ajq_mussecretareastdel");
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 176: every c2phantom#
      if (/^(?:c2phantom\d+[a-z]?)$/.test(phantom)) {
        q.send("qspn", `${phantom}`, `${phantom}__give_gem`, 200, 42, 3, 25, "null", "null", "null");
        q.xp(5, `${phantom}`);
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 177: every factory_#
      if (/^(?:factory_\d+[a-z]?)$/.test(phantom)) {
        q.xp(5, `${phantom}`);
      }
      // step 178: every factory_#__#_
      if (/^(?:factory_\d+[a-z]?__\d+[a-z]?_)$/.test(phantom)) {
        q.send("qspn", `${phantom}`, `${phantom}__give_d`, 200, 42, 3, 25, "null", "null", "null");
      }
      // step 179: every c3phantom#
      if (/^(?:c3phantom\d+[a-z]?)$/.test(phantom)) {
        q.send("qspn", `${phantom}`, `${phantom}__give_gem`, 200, 42, 3, 25, "null", "null", "null");
        q.xp(5, `${phantom}`);
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 180: when it is gardenrock
      if (phantom === "gardenrock") {
        q.xp(25, `${phantom}`);
        q.xp(25, "cosmo_2");
        cosmoTalk(q, 62, 3881); // by hand: remembered, so its answer is known
        q.vars.boulderDone = true;
        set(q, "gardenblock", 99, 0, 0);
        set(q, "ga_rockinfo", 99, 0, 0);
        q.send("qsnd", "ajq_mussecretareastdel");
        set(q, "pail_1", 0, 1, 0);
        set(q, `${phantom}`, 2, 0, 0);
      }
      // step 181: when it is cavestone_1
      if (phantom === "cavestone_1") {
        set(q, "blockvol_3h", 99, 0, 0);
        set(q, "caveinfo_1", 99, 0, 0);
      }
      // step 182: when it is factory_3
      if (phantom === "factory_3") {
        set(q, "factryblok3", 99, 0, 0);
      }
      // step 183: when it is factory_4
      if (phantom === "factory_4") {
        set(q, "factryblok4", 99, 0, 0);
      }
      // step 184: when it is factory_5
      if (phantom === "factory_5") {
        set(q, "factryblok5", 99, 0, 0);
      }
      // step 185: when it is phantom__8
      if (phantom === "phantom__8") {
        set(q, "cork_4", 0, 1, 0);
        q.send("qspn", `${phantom}`, `${phantom}__give_gem`, 200, 42, 3, 25, "null", "null", "null");
        q.xp(5, `${phantom}`);
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 186: when it is factory_6
      if (phantom === "factory_6") {
        set(q, "cork_6", 0, 1, 0);
        set(q, "factryblok6", 99, 0, 0);
        set(q, `${phantom}`, 99, 0, 0);
      }
      // step 187: when it is factory_8
      if (phantom === "factory_8") {
        set(q, "factryblok8", 99, 0, 0);
      }
      // step 188: when it is factory_9
      if (phantom === "factory_9") {
        set(q, "factryblok9", 99, 0, 0);
      }
      // step 189: when it is factory_2
      if (phantom === "factory_2") {
        set(q, "factryblok2", 99, 0, 0);
      }
      // step 190: when it is cavestone_2
      if (phantom === "cavestone_2") {
        set(q, "blockvol_3g", 99, 0, 0);
        set(q, "caveinfo_2", 99, 0, 0);
        q.after(750, () => {
          q.send("qicon", `${phantom}`, 0);
          q.room("from_3a5", "from_3a5");
        });
      }
      // step 191: when it is c3factory1
      if (phantom === "c3factory1") {
        q.xp(5, `${phantom}`);
        set(q, "c3facvol1", 99, 0, 0);
      }
      // step 192: when it is c3factory1__0_
      if (phantom === "c3factory1__0_") {
        q.send("qspn", `${phantom}`, `${phantom}__give_d`, 200, 42, 3, 25, "null", "null", "null");
      }
      // step 193: when it is boomrock5
      if (phantom === "boomrock5") {
        set(q, "boomrvol5", 99, 0, 0);
        q.xp(5, `${phantom}`);
        q.send("qsnd", "ajq_mussecretareastdel");
        set(q, `${phantom}`, 2, 1, 0);
      }
    },
  },
};

/* adventure-script-maker
{"defId":20,"title":"Recorded adventure 20","rooms":[{"key":"start","room":"adventures.room_adventure_3a","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_musquest_3"},{"key":"to_3f","room":"adventures.room_adventure_3f","name":"Adventure Tutorial","nameStringId":18326,"music":"musmeetcosmo","arrive":"to_3f"},{"key":"from_3f","room":"adventures.room_adventure_3a","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_musquest_3","arrive":"from_3f"},{"key":"from_3a_den1","room":"adventures.room_adventure_3b","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_mustreehutplayful","arrive":"from_3a_den1"},{"key":"from_den1","room":"adventures.room_adventure_3a","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_musqueststealth","arrive":"from_den1"},{"key":"from_3a1","room":"adventures.room_adventure_3h","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_muscaveslides","arrive":"from_3a1"},{"key":"from_3h2","room":"adventures.room_adventure_3a","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_musqueststealth","arrive":"from_3h2"},{"key":"from_3a_den2","room":"adventures.room_adventure_3c","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_mustreehutplayful","arrive":"from_3a_den2"},{"key":"from_den2","room":"adventures.room_adventure_3a","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_musqueststealth","arrive":"from_den2"},{"key":"from_3a_den3","room":"adventures.room_adventure_3d","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_mustreehutplayful","arrive":"from_3a_den3"},{"key":"from_den3","room":"adventures.room_adventure_3a","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_musqueststealth","arrive":"from_den3"},{"key":"from_3a5","room":"adventures.room_adventure_3i","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_muscaveslides","arrive":"from_3a5"},{"key":"from_3g1","room":"adventures.room_adventure_3a","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_musqueststealth","arrive":"from_3g1"}],"objective":3809,"actors":[{"name":"questready","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"start_init","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"to_3f","type":9,"def":4,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"roomtrig_f3f","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"from_3f","type":9,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"roomtrig_t3f","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"from_3a_den1","type":9,"def":1,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"to_3a_den1","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"from_den1","type":9,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"to_den1","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"from_3a_den2","type":9,"def":2,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"to_3a_den2","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"from_den2","type":9,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"to_den2","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"from_3a_den3","type":9,"def":3,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"to_3a_den3","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"from_den3","type":9,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"to_den3","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"from_3a1","type":9,"def":5,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"to_3a1","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"from_3a2","type":9,"def":5,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"to_3a2","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cave1_exit","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"from_3h1","type":9,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"to_3h1","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"from_3h2","type":9,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"to_3h2","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"from_3g1","type":9,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"to_3g1","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"from_3a5","type":9,"def":6,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"to_3a5","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"treasure_1","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"treasure_2","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":200,"chestKind":3},{"name":"treasure_3","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"treasure_4","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"treasure_5","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"treasure_6","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"treasure_7","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"c1treasure_1","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"c1treasure_2","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":100,"chestKind":3},{"name":"c1treasure_3","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"c1treasure_4","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"c1treasure_5","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"c1treasure_6","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"c2treasure1","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":150,"chestKind":3},{"name":"c2treasure1h","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"c3treasure1","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":150,"chestKind":3},{"name":"c3treasure2","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":150,"chestKind":3},{"name":"c3treasure2h","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"c3treasure3","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":150,"chestKind":3},{"name":"treasure3b","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"appear","gems":50},{"name":"treasure3c","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"appear","gems":50},{"name":"treasure3d1","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"appear","gems":50},{"name":"treasure3d2","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"appear","gems":50},{"name":"blockvol_3g","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol_3h","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"watervol_1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"watervol_2","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"watervol_3","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"watervol_4","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"watervol_5a","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"watervol_5b","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"watervol_5c","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"watervol_5d","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"watervol_9","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvolvine","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvolbrid","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"c3facvol1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"c3facvol2","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"boomrvol5","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gardenblock","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol_1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol_2","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol_3","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol_4","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factryblok2","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factryblok3","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factryblok4","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factryblok5","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factryblok6","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factryblok8","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factryblok9","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trapvol_1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trapvol_3","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvolhard","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"stealthvol_1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"stealthvol_2","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"stealthvol_3","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"stealthvol_4","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"stealthvol_5","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockweb1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockweb2","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockweb3","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockweb7","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockweb8","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockweb9","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockweb14","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockweb15","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockweb16","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockweb17","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockweb18","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockweb19","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"exit_block","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"c2path1","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"c2path2","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"c2path3","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"c3path1","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"c3path2","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"c3path3","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"c3path4","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_1","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_2","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_3","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_4","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_5","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_6","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_7","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_9","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_10","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_11","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_12","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_13","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_14","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_15","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_16","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_17","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_18","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cosmo_1","type":1,"def":25,"state":0,"visible":1,"click":1,"path":"","art":"appear"},{"name":"cosmo_1hide","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cosmo_2","type":1,"def":25,"state":0,"visible":1,"click":1,"path":"","art":"appear"},{"name":"cosmo_x","type":1,"def":25,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cosmo_2hide","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cosmo_4","type":1,"def":25,"state":0,"visible":1,"click":1,"path":"","art":"facesw"},{"name":"gifttimer","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cosmo_5","type":1,"def":25,"state":0,"visible":1,"click":1,"path":"","art":"appear"},{"name":"cosmo_5hide","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"koala_1","type":1,"def":117,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"koala_2","type":1,"def":118,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"koala_3","type":1,"def":119,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"koala_4","type":1,"def":120,"state":0,"visible":1,"click":1,"path":"","art":"facesw"},{"name":"koala_5","type":1,"def":121,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"koala_7","type":1,"def":123,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"koala_8","type":1,"def":124,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"koala_9","type":1,"def":125,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"koala_10","type":1,"def":126,"state":0,"visible":1,"click":1,"path":"","art":"facesw"},{"name":"pipetrig_1","type":1,"def":69,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipetrig_4","type":1,"def":69,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipetrig_2","type":1,"def":69,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipetrig_3","type":1,"def":69,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipetrig_9","type":1,"def":69,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipetrig_5a","type":1,"def":69,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipetrig_5b","type":1,"def":69,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipetrig_5c","type":1,"def":69,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"watertimer1","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"watertimer3","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"watertimer2","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"watertimer4","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"watertimer9","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"watertimer5","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pail_6t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pail_5t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pail_6ta","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"hard_tile","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"easy_tile","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lily_2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lily_4","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lily_5","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lily_9","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"potion","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"exit_port","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"water_1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"water_2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"water_3","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"water_4","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"water_5","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"water_9","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe_1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe_2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe_3","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe_4","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe_5a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe_5b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe_5c","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe_9","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_1a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_1b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_1c","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_1d","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_2a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_2b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_2c","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_2d","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_3a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_3b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_3c","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_3d","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_4a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_4b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_4c","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_4d","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"florence","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"vine_ladder","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gardencabbag","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gardencorn","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gardentomato","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gardencarro","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gardenstrawb","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gardenradish","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gardengrapes","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cage_1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cage_3","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockicon_1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blocktile_1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockicon_2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blocktile_2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockicon_3","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blocktile_3","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockicon_4","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blocktile_4","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"grow_corn","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"grow_radish","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"grow_strawbe","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"grow_cabbage","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"grow_tomato","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"grow_grape","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"grow_carrot","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"ga_rockinfo","type":1,"def":145,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"caveinfo_1","type":1,"def":145,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"caveinfo_2","type":1,"def":145,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipeinfo_1","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo_2","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo_3","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo_4","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo_5a","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo_5b","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo_5c","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo_9","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_11","type":15,"def":1937,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cork_21","type":15,"def":1937,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cork_22","type":15,"def":1937,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cork_23","type":15,"def":1937,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cork_1","type":15,"def":1937,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cork_4","type":15,"def":1937,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cork_6","type":15,"def":1937,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cork_2","type":15,"def":1937,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cork_3","type":15,"def":1937,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cork_5","type":15,"def":1937,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"apple","type":17,"def":2293,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"orange","type":17,"def":2294,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"banana","type":17,"def":2292,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r1_t2_rose","type":17,"def":2307,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r1_t3_moth","type":17,"def":2316,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t2_1a","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"revive"},{"name":"r2_t2_1b","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"revive"},{"name":"r2_t2_1c","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"revive"},{"name":"r2_t2_1d","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"revive"},{"name":"r2_t2_2a","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"revive"},{"name":"r2_t2_2b","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"revive"},{"name":"r2_t2_2c","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"revive"},{"name":"r2_t2_2d","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"revive"},{"name":"r2_t2_3a","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"revive"},{"name":"r2_t2_3b","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"revive"},{"name":"r2_t2_3c","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"revive"},{"name":"r2_t2_3d","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"revive"},{"name":"r2_t2_4a","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"revive"},{"name":"r2_t2_4b","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"revive"},{"name":"r2_t2_4c","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"revive"},{"name":"r2_t2_4d","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"revive"},{"name":"r2_t2_t1a","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t2_t1b","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t2_t1c","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t2_t1d","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t2_t2a","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t2_t2b","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t2_t2c","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t2_t2d","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t2_t3a","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t2_t3b","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t2_t3c","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t2_t3d","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t2_t4a","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t2_t4b","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t2_t4c","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t2_t4d","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_t1a","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_t1b","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_t1c","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_t1d","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_t2a","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_t2b","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_t2c","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_t2d","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_t3a","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_t3b","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_t3c","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_t3d","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_t4a","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_t4b","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_t4c","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t3_t4d","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r2_t2_i1a","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t2_i1b","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t2_i1c","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t2_i1d","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t2_i2a","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t2_i2b","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t2_i2c","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t2_i2d","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t2_i3a","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t2_i3b","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t2_i3c","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t2_i3d","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t2_i4a","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t2_i4b","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t2_i4c","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t2_i4d","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t3_i1a","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t3_i1b","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t3_i1c","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t3_i1d","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t3_i2a","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t3_i2b","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t3_i2c","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t3_i2d","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t3_i3a","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t3_i3b","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t3_i3c","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t3_i3d","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t3_i4a","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t3_i4b","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t3_i4c","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"r2_t3_i4d","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"waterinfo_1","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"waterinfo_2","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"waterinfo_3","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"waterinfo_4","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"waterinfo_5","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"waterinfo_6","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"waterinfo_7","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"note_count","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bamboo_1","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bamboo_2","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bamboo_3","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bamboo_4","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bamboo_5","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"rope","type":15,"def":2304,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"timber","type":15,"def":2302,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"ga_cabbage","type":17,"def":2311,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"ga_carrot","type":17,"def":2305,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"ga_radish","type":17,"def":2310,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"ga_strawbery","type":17,"def":2330,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"ga_grape","type":17,"def":2329,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"ga_tomato","type":17,"def":2358,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"ga_corn","type":17,"def":2357,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r3_t1_nitngl","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"r3_t1_timer","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"wood_bridge","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bamboo","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"nectar","type":17,"def":2324,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"chompseeds","type":17,"def":2303,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"honey","type":17,"def":2325,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"waterspot_1","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"waterspot_2","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"waterspot_3","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"waterspot_4","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"waterspot_5","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"waterspot_6","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"waterspot_7","type":1,"def":67,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pickup_radis","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pickup_cabba","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pickup_carro","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pickup_straw","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pickup_grape","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pickup_corn","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pickup_tomat","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pickup_honey","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pickup_necta","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pickup_chomp","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"phantom_1","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_1","art":""},{"name":"phantom_2","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_2","art":""},{"name":"phantom__3","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_3","art":""},{"name":"phantom_4","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_4","art":""},{"name":"phantom_5","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_5","art":""},{"name":"phantom_6","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_6","art":""},{"name":"phantom_7","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_7","art":""},{"name":"phantom__8","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_3","art":"","drop":"cork_4"},{"name":"phantom_9","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_9","art":""},{"name":"phantom_10","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_10","art":""},{"name":"phantom_11","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_11","art":""},{"name":"phantom_12","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_12","art":""},{"name":"phantom_13","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_13","art":""},{"name":"phantom_14","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_14","art":""},{"name":"phantom_15","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_15","art":""},{"name":"phantom_16","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_16","art":""},{"name":"phantom_17","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_17","art":""},{"name":"phantom_18","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_18","art":""},{"name":"c2phantom1","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"c2path1","art":""},{"name":"c2phantom2","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"c2path2","art":""},{"name":"c2phantom3","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"c2path3","art":""},{"name":"c3phantom1","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"c3path1","art":""},{"name":"c3phantom2","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"c3path2","art":""},{"name":"c3phantom3","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"c3path3","art":""},{"name":"c3phantom4","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"c3path4","art":""},{"name":"pail_1","type":17,"def":1955,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pail_2","type":17,"def":1955,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pail_3","type":17,"def":1955,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pail_4","type":17,"def":1955,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pail_5","type":17,"def":1955,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pail_6","type":17,"def":1955,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"boomtree_1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"boomtree_2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"boomtree_3","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"boomtree_5","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"boomtree_6","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"boomtree_7","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"boomtree_8","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"boomtimer_1","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"boomtimer_2","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"boomtimer_3","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"boomtimer_5","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"boomtimer_6","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"boomtimer_7","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"boomtimer_8","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cavestone_1","type":11,"def":139,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cavestone_2","type":11,"def":140,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pickup_boom1","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pickup_boom2","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pickup_boom3","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pickup_boom5","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pickup_boom6","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pickup_boom7","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pickup_boom8","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factory_6","type":12,"def":72,"state":0,"visible":1,"click":1,"path":"","art":"appear"},{"name":"factory_2","type":12,"def":72,"state":0,"visible":1,"click":1,"path":"","art":"appear"},{"name":"factory_3","type":12,"def":72,"state":0,"visible":1,"click":1,"path":"","art":"appear"},{"name":"factory_4","type":12,"def":72,"state":0,"visible":1,"click":1,"path":"","art":"appear"},{"name":"factory_5","type":12,"def":72,"state":0,"visible":1,"click":1,"path":"","art":"appear"},{"name":"factory_8","type":12,"def":72,"state":0,"visible":1,"click":1,"path":"","art":"appear"},{"name":"factory_9","type":12,"def":72,"state":0,"visible":1,"click":1,"path":"","art":"appear"},{"name":"c3factory1","type":12,"def":72,"state":0,"visible":1,"click":1,"path":"","art":"appear"},{"name":"c3factory2","type":12,"def":72,"state":0,"visible":1,"click":1,"path":"","art":"appear"},{"name":"respawn1","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"respawn2","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"respawn3","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"respawn4","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"respawn5","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"respawn3i","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"respawn3h","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"plant_vol","type":22,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trigfact2","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trigfact3","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trigfact4","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trigfact5","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trigfact6","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trigfact8","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trigfact9","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trapkey_1","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trapkey_3","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key_1a","type":15,"def":1912,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key_1b","type":15,"def":1912,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key_1c","type":15,"def":1912,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key_3a","type":15,"def":1912,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key_3b","type":15,"def":1912,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key_3c","type":15,"def":1912,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key_1a_h","type":15,"def":1912,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key_1b_h","type":15,"def":1912,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key_1c_h","type":15,"def":1912,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key_3a_h","type":15,"def":1912,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key_3b_h","type":15,"def":1912,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key_3c_h","type":15,"def":1912,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key_1a_icon","type":1,"def":147,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key_1b_icon","type":1,"def":147,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key_1c_icon","type":1,"def":147,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key_3a_icon","type":1,"def":147,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key_3b_icon","type":1,"def":147,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key_3c_icon","type":1,"def":147,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"exit_vol","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"portal","type":16,"def":"ajq_portalgatelp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"boomrock5","type":11,"def":142,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gardenrock","type":11,"def":144,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cosmo_5_show","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge_1","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge_2","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge_3","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge_4","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge_5a","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge_5b","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge_5c","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge_9","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"waterfall_1","type":16,"def":"ajq_waterfall_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"waterfall_2","type":16,"def":"ajq_waterfall_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"waterfall_3","type":16,"def":"ajq_waterfall_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"waterfall_4","type":16,"def":"ajq_waterfall_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile_2","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile_3","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cheatchq1","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cheatchq2","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cheatchq3","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cheatchq4","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blocktrig_1","type":1,"def":46,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blocktimer_1","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"blocktrig_2","type":1,"def":57,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blocktimer_2","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"blocktrig_3","type":1,"def":51,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blocktimer_3","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"blocktrig_4","type":1,"def":148,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blocktimer_4","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"secretvol_1","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"secretvol_2","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"secretvol_3","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"secretvol_4","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"secretvol_5","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"secretvol_6","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_1","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_5","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_7","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_8","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_9","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_10","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_12","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_13","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_14","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_15","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_16","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_17","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_2","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_3","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_4","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_6","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_11","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_18","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"beehive_loop","type":16,"def":"ajq_beehivelp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_2","type":23,"def":104,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_9","type":23,"def":104,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_15","type":23,"def":104,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_1","type":23,"def":105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_3","type":23,"def":105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_7","type":23,"def":105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_8","type":23,"def":105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_14","type":23,"def":105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_16","type":23,"def":105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_17","type":23,"def":105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_18","type":23,"def":105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_19","type":23,"def":105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"garden_vary","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"players","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cave1_once","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cave2_once","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"koala_2_once","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"koala_1_once","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"koala_3_once","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"koala_5_once","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"koala_7_talk","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"koala_7_once","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"vine_once","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"revived","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"water5","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"waterspot","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"keys","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"picktasks","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trapnotify","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"wateredplant","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipecount","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"den2corks","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"00_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"10_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"20_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"30_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"40_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"50_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"60_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"70_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"80_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"playermember","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""}],"steps":[{"id":194,"when":"loaded","name":"","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qsndpk","fields":"2365"}]},{"id":1,"when":"trigger","name":"questready","once":false,"holding":"","nth":1,"nthOn":0,"actions":[{"a":"var","name":"start_init","value":1},{"a":"set","name":"pail_1","state":99,"visible":0,"click":0},{"a":"set","name":"pickup_necta","state":99,"visible":0,"click":0},{"a":"set","name":"pickup_chomp","state":99,"visible":0,"click":0},{"a":"set","name":"pickup_honey","state":99,"visible":0,"click":0},{"a":"set","name":"pickup_carro","state":99,"visible":0,"click":0},{"a":"set","name":"pickup_cabba","state":99,"visible":0,"click":0},{"a":"set","name":"pickup_radis","state":99,"visible":0,"click":0},{"a":"set","name":"pickup_straw","state":99,"visible":0,"click":0},{"a":"set","name":"pickup_grape","state":99,"visible":0,"click":0},{"a":"set","name":"pickup_corn","state":99,"visible":0,"click":0},{"a":"set","name":"pickup_tomat","state":99,"visible":0,"click":0},{"a":"set","name":"pickup_boom1","state":99,"visible":0,"click":0},{"a":"set","name":"ga_rockinfo","state":99,"visible":0,"click":0},{"a":"set","name":"potion","state":99,"visible":0,"click":0},{"a":"show","name":"water_1","click":0},{"a":"show","name":"water_2","click":0},{"a":"show","name":"water_3","click":0},{"a":"show","name":"water_4","click":0},{"a":"show","name":"water_5","click":0},{"a":"show","name":"water_9","click":0},{"a":"set","name":"lily_2","state":99,"visible":0,"click":0},{"a":"set","name":"lily_4","state":99,"visible":0,"click":0},{"a":"set","name":"lily_5","state":99,"visible":0,"click":0},{"a":"set","name":"lily_9","state":99,"visible":0,"click":0},{"a":"set","name":"waterfall_1","state":99,"visible":0,"click":0},{"a":"set","name":"waterfall_2","state":99,"visible":0,"click":0},{"a":"set","name":"waterfall_3","state":99,"visible":0,"click":0},{"a":"set","name":"waterfall_4","state":99,"visible":0,"click":0},{"a":"set","name":"treasure3d1","state":99,"visible":0,"click":0},{"a":"set","name":"treasure3d2","state":99,"visible":0,"click":0},{"a":"set","name":"treasure3b","state":99,"visible":0,"click":0},{"a":"set","name":"treasure3c","state":99,"visible":0,"click":0},{"a":"set","name":"factory_2","state":99,"visible":0,"click":0},{"a":"set","name":"factory_3","state":99,"visible":0,"click":0},{"a":"set","name":"factory_4","state":99,"visible":0,"click":0},{"a":"set","name":"factory_5","state":99,"visible":0,"click":0},{"a":"set","name":"factory_6","state":99,"visible":0,"click":0},{"a":"set","name":"factory_8","state":99,"visible":0,"click":0},{"a":"set","name":"factory_9","state":99,"visible":0,"click":0},{"a":"show","name":"boomtree_2","click":0},{"a":"show","name":"boomtree_3","click":0},{"a":"show","name":"boomtree_5","click":0},{"a":"show","name":"boomtree_6","click":0},{"a":"show","name":"boomtree_7","click":0},{"a":"show","name":"boomtree_8","click":0},{"a":"set","name":"cork_4","state":99,"visible":0,"click":0},{"a":"set","name":"cork_6","state":99,"visible":0,"click":0},{"a":"set","name":"cosmo_2","state":99,"visible":0,"click":0},{"a":"set","name":"cosmo_4","state":99,"visible":0,"click":0},{"a":"set","name":"cosmo_5","state":99,"visible":0,"click":0},{"a":"wait","ms":1000},{"a":"set","name":"hard_tile","state":99,"visible":0,"click":0},{"a":"set","name":"blockicon_2","state":99,"visible":0,"click":0},{"a":"set","name":"blockicon_3","state":99,"visible":0,"click":0},{"a":"set","name":"blockicon_4","state":99,"visible":0,"click":0},{"a":"set","name":"c2phantom3","state":99,"visible":0,"click":0},{"a":"set","name":"c3phantom3","state":99,"visible":0,"click":0},{"a":"set","name":"phantom__3","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_9","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_10","state":99,"visible":0,"click":0},{"a":"set","name":"c3factory2","state":99,"visible":0,"click":0},{"a":"set","name":"c3treasure2h","state":99,"visible":0,"click":0},{"a":"set","name":"c2treasure1h","state":99,"visible":0,"click":0},{"a":"set","name":"c1treasure_4","state":99,"visible":0,"click":0},{"a":"set","name":"c1treasure_5","state":99,"visible":0,"click":0},{"a":"set","name":"c1treasure_6","state":99,"visible":0,"click":0},{"a":"set","name":"web_1","state":99,"visible":0,"click":0},{"a":"set","name":"web_2","state":99,"visible":0,"click":0},{"a":"set","name":"web_3","state":99,"visible":0,"click":0},{"a":"set","name":"web_7","state":99,"visible":0,"click":0},{"a":"set","name":"web_8","state":99,"visible":0,"click":0},{"a":"set","name":"web_9","state":99,"visible":0,"click":0},{"a":"set","name":"web_14","state":99,"visible":0,"click":0},{"a":"set","name":"web_15","state":99,"visible":0,"click":0},{"a":"set","name":"web_16","state":99,"visible":0,"click":0},{"a":"set","name":"web_17","state":99,"visible":0,"click":0},{"a":"set","name":"web_18","state":99,"visible":0,"click":0},{"a":"set","name":"web_19","state":99,"visible":0,"click":0},{"a":"set","name":"blockweb1","state":99,"visible":0,"click":0},{"a":"set","name":"blockweb2","state":99,"visible":0,"click":0},{"a":"set","name":"blockweb3","state":99,"visible":0,"click":0},{"a":"set","name":"blockweb7","state":99,"visible":0,"click":0},{"a":"set","name":"blockweb8","state":99,"visible":0,"click":0},{"a":"set","name":"blockweb9","state":99,"visible":0,"click":0},{"a":"set","name":"blockweb14","state":99,"visible":0,"click":0},{"a":"set","name":"blockweb15","state":99,"visible":0,"click":0},{"a":"set","name":"blockweb16","state":99,"visible":0,"click":0},{"a":"set","name":"blockweb17","state":99,"visible":0,"click":0},{"a":"set","name":"blockweb18","state":99,"visible":0,"click":0},{"a":"set","name":"blockweb19","state":99,"visible":0,"click":0},{"a":"set","name":"pail_6ta","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_11","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_12","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_13","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_14","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_15","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_16","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_17","state":99,"visible":0,"click":0},{"a":"set","name":"phantom_18","state":99,"visible":0,"click":0},{"a":"send","cmd":"qicon","fields":"cosmo_1|1"},{"a":"var","name":"keys","value":99},{"a":"set","name":"key_1a","state":99,"visible":0,"click":0},{"a":"set","name":"key_1b","state":99,"visible":0,"click":0},{"a":"set","name":"key_1c","state":99,"visible":0,"click":0},{"a":"set","name":"key_3a","state":99,"visible":0,"click":0},{"a":"set","name":"key_3b","state":99,"visible":0,"click":0},{"a":"set","name":"key_3c","state":99,"visible":0,"click":0},{"a":"set","name":"key_1a_h","state":99,"visible":0,"click":0},{"a":"set","name":"key_1b_h","state":99,"visible":0,"click":0},{"a":"set","name":"key_1c_h","state":99,"visible":0,"click":0},{"a":"set","name":"key_3a_h","state":99,"visible":0,"click":0},{"a":"set","name":"key_3b_h","state":99,"visible":0,"click":0},{"a":"set","name":"key_3c_h","state":99,"visible":0,"click":0},{"a":"var","name":"waterspot","value":99},{"a":"set","name":"waterspot_1","state":99,"visible":0,"click":0},{"a":"set","name":"waterspot_2","state":99,"visible":0,"click":0},{"a":"set","name":"waterspot_3","state":99,"visible":0,"click":0},{"a":"set","name":"waterspot_4","state":99,"visible":0,"click":0},{"a":"set","name":"waterspot_5","state":99,"visible":0,"click":0},{"a":"set","name":"waterspot_6","state":99,"visible":0,"click":0},{"a":"set","name":"waterspot_7","state":99,"visible":0,"click":0},{"a":"var","name":"planttrig","value":99},{"a":"set","name":"r2_t2_t1a","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t2_t1b","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t2_t1c","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t2_t1d","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t2_t2a","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t2_t2b","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t2_t2c","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t2_t2d","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t2_t3a","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t2_t3b","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t2_t3c","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t2_t3d","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t2_t4a","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t2_t4b","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t2_t4c","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t2_t4d","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t3_t1a","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t3_t2a","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t3_t3a","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t3_t4a","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t3_t1b","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t3_t2b","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t3_t3b","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t3_t4b","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t3_t1c","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t3_t2c","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t3_t3c","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t3_t4c","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t3_t1d","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t3_t2d","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t3_t3d","state":99,"visible":0,"click":0},{"a":"set","name":"r2_t3_t4d","state":99,"visible":0,"click":0},{"a":"artstate","name":"r2_t2_1a","state":"wilt"},{"a":"show","name":"r2_t2_1a","click":0},{"a":"artstate","name":"r2_t2_2a","state":"wilt"},{"a":"show","name":"r2_t2_2a","click":0},{"a":"artstate","name":"r2_t2_3a","state":"wilt"},{"a":"show","name":"r2_t2_3a","click":0},{"a":"artstate","name":"r2_t2_4a","state":"wilt"},{"a":"show","name":"r2_t2_4a","click":0},{"a":"artstate","name":"r2_t2_1b","state":"wilt"},{"a":"show","name":"r2_t2_1b","click":0},{"a":"artstate","name":"r2_t2_2b","state":"wilt"},{"a":"show","name":"r2_t2_2b","click":0},{"a":"set","name":"r2_t2_t1a","state":0,"visible":1,"click":1},{"a":"set","name":"r2_t2_t2a","state":0,"visible":1,"click":1},{"a":"set","name":"r2_t2_t3a","state":0,"visible":1,"click":1},{"a":"set","name":"r2_t2_t4a","state":0,"visible":1,"click":1},{"a":"set","name":"r2_t2_t1b","state":0,"visible":1,"click":1},{"a":"set","name":"r2_t2_t2b","state":0,"visible":1,"click":1},{"a":"show","name":"r2_t3_1c","click":0},{"a":"show","name":"r2_t3_2c","click":0},{"a":"show","name":"r2_t3_3c","click":0},{"a":"show","name":"r2_t3_4c","click":0},{"a":"show","name":"r2_t3_1d","click":0},{"a":"show","name":"r2_t3_2d","click":0},{"a":"set","name":"r2_t3_t1c","state":0,"visible":1,"click":1},{"a":"set","name":"r2_t3_t2c","state":0,"visible":1,"click":1},{"a":"set","name":"r2_t3_t3c","state":0,"visible":1,"click":1},{"a":"set","name":"r2_t3_t4c","state":0,"visible":1,"click":1},{"a":"set","name":"r2_t3_t1d","state":0,"visible":1,"click":1},{"a":"set","name":"r2_t3_t2d","state":0,"visible":1,"click":1},{"a":"set","name":"key_1b","state":0,"visible":1,"click":1},{"a":"set","name":"key_3b","state":0,"visible":1,"click":1},{"a":"var","name":"garden_vary","value":2},{"a":"set","name":"exit_vol","state":99,"visible":0,"click":0}]},{"id":2,"when":"trigger","name":"cosmo_1","once":false,"holding":"","nth":0,"actions":[{"a":"talk","name":"cosmo_1","str":3752,"mode":0}]},{"id":3,"when":"answer","name":"cosmo_1","once":true,"holding":"","nth":0,"actions":[{"a":"var","name":"00_uri","value":1},{"a":"var","name":"players","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure3-meetcosmo/#00-start/#0#001"},{"a":"var","name":"00_uri","value":99},{"a":"artstate","name":"cosmo_1","state":"disappear"},{"a":"show","name":"cosmo_1","click":1},{"a":"set","name":"pail_1","state":0,"visible":1,"click":0},{"a":"var","name":"waterspot","value":0},{"a":"set","name":"waterspot_1","state":0,"visible":1,"click":1},{"a":"set","name":"waterspot_2","state":0,"visible":1,"click":1},{"a":"set","name":"waterspot_3","state":0,"visible":1,"click":1},{"a":"set","name":"waterspot_4","state":0,"visible":1,"click":1},{"a":"set","name":"waterspot_5","state":0,"visible":1,"click":1},{"a":"set","name":"waterspot_6","state":0,"visible":1,"click":1},{"a":"set","name":"waterspot_7","state":0,"visible":1,"click":1},{"a":"goal","str":3753},{"a":"send","cmd":"qicon","fields":"cosmo_1|0"},{"a":"set","name":"cosmo_1","state":2,"visible":1,"click":0},{"a":"wait","ms":1580},{"a":"set","name":"cosmo_1","state":3,"visible":0,"click":0}]},{"id":4,"when":"trigger","name":"cosmo_2","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"talk","name":"cosmo_2","str":3755,"mode":0}],"unless":"nectar, chompseeds, honey, ga_grape, ga_corn, ga_tomato, ga_cabbage"},{"id":5,"when":"trigger","name":"cosmo_2","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"say","name":"cosmo_2","str":3757,"flag":0}],"unless":"nectar, chompseeds, honey, ga_grape, ga_corn, ga_tomato, ga_cabbage"},{"id":6,"when":"trigger","name":"cosmo_2","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"say","name":"cosmo_2","str":3757,"flag":0}],"unless":"nectar, chompseeds, honey, ga_grape, ga_corn, ga_tomato, ga_cabbage"},{"id":7,"when":"trigger","name":"cosmo_2","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"say","name":"cosmo_2","str":3757,"flag":0}],"unless":"nectar, chompseeds, honey, ga_grape, ga_corn, ga_tomato, ga_cabbage"},{"id":8,"when":"trigger","name":"cosmo_2","once":false,"holding":"","nth":9,"nthOn":false,"actions":[{"a":"say","name":"cosmo_2","str":3850,"flag":0}],"unless":"nectar, chompseeds, honey, ga_grape, ga_corn, ga_tomato, ga_cabbage"},{"id":9,"when":"trigger","name":"cosmo_2","once":false,"holding":"","nth":10,"nthOn":false,"actions":[{"a":"say","name":"cosmo_2","str":3850,"flag":0}],"unless":"nectar, chompseeds, honey, ga_grape, ga_corn, ga_tomato, ga_cabbage"},{"id":10,"when":"trigger","name":"cosmo_2","once":false,"holding":"","nth":12,"nthOn":false,"actions":[{"a":"say","name":"cosmo_2","str":3852,"flag":0}],"unless":"nectar, chompseeds, honey, ga_grape, ga_corn, ga_tomato, ga_cabbage"},{"id":11,"when":"trigger","name":"cosmo_2","once":false,"holding":"","nth":13,"nthOn":false,"actions":[{"a":"say","name":"cosmo_2","str":3852,"flag":0}],"unless":"nectar, chompseeds, honey, ga_grape, ga_corn, ga_tomato, ga_cabbage"},{"id":12,"when":"trigger","name":"cosmo_2","once":false,"holding":"","nth":15,"nthOn":false,"actions":[{"a":"say","name":"cosmo_2","str":3854,"flag":0}],"unless":"nectar, chompseeds, honey, ga_grape, ga_corn, ga_tomato, ga_cabbage"},{"id":13,"when":"trigger","name":"cosmo_2","once":false,"holding":"","nth":16,"nthOn":false,"actions":[{"a":"say","name":"cosmo_2","str":3854,"flag":0}],"unless":"nectar, chompseeds, honey, ga_grape, ga_corn, ga_tomato, ga_cabbage"},{"id":14,"when":"trigger","name":"cosmo_2","once":false,"holding":"","nth":18,"nthOn":false,"actions":[{"a":"talk","name":"cosmo_2","str":3793,"mode":59}],"unless":"nectar, chompseeds, honey, ga_grape, ga_corn, ga_tomato, ga_cabbage"},{"id":15,"when":"trigger","name":"cosmo_2","once":false,"holding":"","nth":19,"nthOn":false,"actions":[{"a":"talk","name":"cosmo_2","str":3793,"mode":59}],"unless":"nectar, chompseeds, honey, ga_grape, ga_corn, ga_tomato, ga_cabbage"},{"id":16,"when":"trigger","name":"cosmo_2","once":false,"holding":"","nth":20,"nthOn":false,"actions":[{"a":"talk","name":"cosmo_2","str":3880,"mode":61}],"unless":"nectar, chompseeds, honey, ga_grape, ga_corn, ga_tomato, ga_cabbage"},{"id":17,"when":"answer","name":"cosmo_2","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"set","name":"pickup_necta","state":0,"visible":1,"click":1},{"a":"set","name":"pickup_chomp","state":0,"visible":1,"click":1},{"a":"set","name":"pickup_honey","state":0,"visible":1,"click":1},{"a":"goal","str":3756},{"a":"show","name":"cosmo_2","click":1}]},{"id":18,"when":"answer","name":"cosmo_2","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"goal","str":3833},{"a":"set","name":"cosmo_2","state":3,"visible":1,"click":1}]},{"id":19,"when":"answer","name":"cosmo_2","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"goal","str":3834},{"a":"set","name":"cosmo_2","state":5,"visible":1,"click":1}]},{"id":20,"when":"answer","name":"cosmo_2","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"set","name":"cosmo_2","state":21,"visible":1,"click":1},{"a":"set","name":"cosmo_2","state":40,"visible":1,"click":1},{"a":"talk","name":"cosmo_2","str":3788,"mode":40}]},{"id":21,"when":"answer","name":"cosmo_2","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"set","name":"pickup_grape","state":0,"visible":1,"click":1},{"a":"goal","str":3856},{"a":"set","name":"cosmo_2","state":41,"visible":1,"click":1}]},{"id":22,"when":"answer","name":"cosmo_2","once":false,"holding":"","nth":6,"nthOn":false,"actions":[{"a":"set","name":"pickup_corn","state":0,"visible":1,"click":1},{"a":"goal","str":3857},{"a":"set","name":"cosmo_2","state":43,"visible":1,"click":1}]},{"id":23,"when":"answer","name":"cosmo_2","once":false,"holding":"","nth":7,"nthOn":false,"actions":[{"a":"set","name":"pickup_tomat","state":0,"visible":1,"click":1},{"a":"goal","str":3858},{"a":"set","name":"cosmo_2","state":45,"visible":1,"click":1}]},{"id":24,"when":"answer","name":"cosmo_2","once":false,"holding":"","nth":8,"nthOn":false,"actions":[{"a":"set","name":"pickup_cabba","state":0,"visible":1,"click":1},{"a":"goal","str":3859},{"a":"set","name":"cosmo_2","state":47,"visible":1,"click":1}]},{"id":25,"when":"answer","name":"cosmo_2","once":false,"holding":"","nth":9,"nthOn":false,"actions":[{"a":"set","name":"cosmo_2","state":58,"visible":1,"click":1},{"a":"show","name":"boomtree_1","click":0},{"a":"set","name":"pickup_boom1","state":0,"visible":1,"click":1},{"a":"talk","name":"cosmo_2","str":3790,"mode":58}]},{"id":26,"when":"answer","name":"cosmo_2","once":false,"holding":"","nth":10,"nthOn":false,"actions":[{"a":"var","name":"30_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure3-meetcosmo/#30-collectvegetables/#0#001"},{"a":"var","name":"30_uri","value":99},{"a":"goal","str":3795},{"a":"set","name":"potion","state":99,"visible":0,"click":0},{"a":"set","name":"ga_rockinfo","state":0,"visible":1,"click":1},{"a":"set","name":"cosmo_2","state":59,"visible":1,"click":1}]},{"id":27,"when":"answer","name":"cosmo_2","once":false,"holding":"","nth":14,"nthOn":false,"actions":[{"a":"send","cmd":"qicon","fields":"cosmo_2|0"},{"a":"goal","str":3879},{"a":"artstate","name":"cosmo_2","state":"disappear"},{"a":"set","name":"cosmo_2","state":63,"visible":1,"click":1},{"a":"send","cmd":"qmusic","fields":"0"},{"a":"send","cmd":"qmusic","fields":"ajq_musqueststealth"},{"a":"set","name":"pickup_carro","state":0,"visible":1,"click":1},{"a":"set","name":"cosmo_2","state":64,"visible":1,"click":0},{"a":"set","name":"cosmo_x","state":99,"visible":0,"click":0},{"a":"wait","ms":1050},{"a":"set","name":"cosmo_2","state":99,"visible":0,"click":0}]},{"id":28,"when":"trigger","name":"roomtrig_t3f","once":false,"holding":"","nth":0,"actions":[{"a":"room","key":"to_3f","spawn":"to_3f"}]},{"id":29,"when":"trigger","name":"pickup_necta","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qgi","fields":"nectar"}]},{"id":30,"when":"trigger","name":"roomtrig_f3f","once":false,"holding":"","nth":0,"actions":[{"a":"room","key":"from_3f","spawn":"from_3f"}]},{"id":31,"when":"trigger","name":"cosmo_2","once":true,"holding":"nectar","nth":0,"actions":[{"a":"xp","amount":5,"name":"cosmo_2"},{"a":"use"},{"a":"set","name":"nectar","state":99,"visible":0,"click":0},{"a":"set","name":"pickup_necta","state":99,"visible":0,"click":0},{"a":"set","name":"cosmo_2","state":2,"visible":1,"click":1},{"a":"talk","name":"cosmo_2","str":3758,"mode":2}]},{"id":32,"when":"trigger","name":"pickup_chomp","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qgi","fields":"chompseeds"}]},{"id":33,"when":"trigger","name":"cosmo_2","once":true,"holding":"chompseeds","nth":0,"actions":[{"a":"xp","amount":5,"name":"cosmo_2"},{"a":"use"},{"a":"set","name":"chompseeds","state":99,"visible":0,"click":0},{"a":"set","name":"pickup_chomp","state":99,"visible":0,"click":0},{"a":"set","name":"cosmo_2","state":4,"visible":1,"click":1},{"a":"talk","name":"cosmo_2","str":3845,"mode":4}]},{"id":34,"when":"trigger","name":"pickup_honey","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qgi","fields":"honey"}]},{"id":35,"when":"trigger","name":"cosmo_2","once":true,"holding":"honey","nth":0,"actions":[{"a":"xp","amount":5,"name":"cosmo_2"},{"a":"use"},{"a":"set","name":"honey","state":99,"visible":0,"click":0},{"a":"set","name":"pickup_honey","state":99,"visible":0,"click":0},{"a":"set","name":"cosmo_2","state":20,"visible":1,"click":1},{"a":"var","name":"20_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure3-meetcosmo/#20-findhoneynectarandchomperseeds/#0#001"},{"a":"var","name":"20_uri","value":99},{"a":"talk","name":"cosmo_2","str":3761,"mode":20}]},{"id":36,"when":"trigger","name":"pickup_grape","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qgi","fields":"ga_grape"}]},{"id":37,"when":"trigger","name":"cosmo_2","once":true,"holding":"ga_grape","nth":0,"actions":[{"a":"xp","amount":5,"name":"cosmo_2"},{"a":"set","name":"pickup_grape","state":99,"visible":0,"click":0},{"a":"use"},{"a":"set","name":"ga_grape","state":99,"visible":0,"click":0},{"a":"set","name":"cosmo_2","state":42,"visible":1,"click":1},{"a":"talk","name":"cosmo_2","str":3849,"mode":42}]},{"id":38,"when":"trigger","name":"pickup_corn","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qgi","fields":"ga_corn"}]},{"id":39,"when":"trigger","name":"cosmo_2","once":true,"holding":"ga_corn","nth":0,"actions":[{"a":"xp","amount":5,"name":"cosmo_2"},{"a":"set","name":"pickup_corn","state":99,"visible":0,"click":0},{"a":"use"},{"a":"set","name":"ga_corn","state":99,"visible":0,"click":0},{"a":"set","name":"cosmo_2","state":44,"visible":1,"click":1},{"a":"talk","name":"cosmo_2","str":3851,"mode":44}]},{"id":40,"when":"trigger","name":"pickup_tomat","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qgi","fields":"ga_tomato"}]},{"id":41,"when":"trigger","name":"cosmo_2","once":true,"holding":"ga_tomato","nth":0,"actions":[{"a":"xp","amount":5,"name":"cosmo_2"},{"a":"set","name":"pickup_tomat","state":99,"visible":0,"click":0},{"a":"use"},{"a":"set","name":"ga_tomato","state":99,"visible":0,"click":0},{"a":"set","name":"cosmo_2","state":46,"visible":1,"click":1},{"a":"talk","name":"cosmo_2","str":3853,"mode":46}]},{"id":42,"when":"trigger","name":"pickup_cabba","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qgi","fields":"ga_cabbage"}]},{"id":43,"when":"trigger","name":"cosmo_2","once":true,"holding":"ga_cabbage","nth":0,"actions":[{"a":"xp","amount":5,"name":"cosmo_2"},{"a":"set","name":"pickup_cabba","state":99,"visible":0,"click":0},{"a":"use"},{"a":"set","name":"ga_cabbage","state":99,"visible":0,"click":0},{"a":"set","name":"cosmo_2","state":48,"visible":1,"click":1},{"a":"talk","name":"cosmo_2","str":3855,"mode":48}]},{"id":44,"when":"trigger","name":"pickup_boom1","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"set","name":"cosmo_2","state":60,"visible":1,"click":1},{"a":"goal","str":3791},{"a":"set","name":"cosmo_2","state":61,"visible":1,"click":1},{"a":"talk","name":"cosmo_x","str":3794,"mode":0},{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"boomtree_1","state":2,"visible":1,"click":0}]},{"id":45,"when":"trigger","name":"pickup_boom1","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"talk","name":"cosmo_x","str":3794,"mode":0},{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"boomtree_1","state":3,"visible":1,"click":0}]},{"id":46,"when":"trigger","name":"pickup_boom1","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"boomtree_1","state":4,"visible":1,"click":0}]},{"id":47,"when":"trigger","name":"pickup_boom1","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"boomtree_1","state":5,"visible":1,"click":0}]},{"id":48,"when":"trigger","name":"pickup_boom1","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"boomtree_1","state":6,"visible":1,"click":1},{"a":"set","name":"pickup_boom1","state":99,"visible":0,"click":0},{"a":"wait","ms":14720},{"a":"set","name":"pickup_boom1","state":0,"visible":1,"click":1},{"a":"show","name":"boomtree_1","click":0}]},{"id":49,"when":"trigger","name":"r2_t2_t2a","once":true,"holding":"pail_4","nth":0,"actions":[{"a":"xp","amount":5,"name":"r2_t2_t2a"},{"a":"use"},{"a":"artstate","name":"r2_t2_2a","state":"revive"},{"a":"set","name":"r2_t2_2a","state":0,"visible":1,"click":0},{"a":"var","name":"revived","value":"{count}"}]},{"id":50,"when":"trigger","name":"r2_t2_t2b","once":true,"holding":"pail_4","nth":0,"actions":[{"a":"xp","amount":5,"name":"r2_t2_t2b"},{"a":"use"},{"a":"artstate","name":"r2_t2_2b","state":"revive"},{"a":"set","name":"r2_t2_2b","state":0,"visible":1,"click":0},{"a":"var","name":"revived","value":"{count}"}]},{"id":51,"when":"trigger","name":"koala_1","once":true,"holding":"","nth":0,"actions":[{"a":"var","name":"koala_1_once","value":1},{"a":"send","cmd":"qicon","fields":"cavestone_1|1"},{"a":"goal","str":3888},{"a":"say","name":"koala_1","str":3817,"flag":1}]},{"id":52,"when":"trigger","name":"to_den1","once":false,"holding":"","nth":0,"actions":[{"a":"room","key":"from_3a_den1","spawn":"from_3a_den1"}]},{"id":53,"when":"trigger","name":"koala_2","once":false,"holding":"","nth":0,"actions":[{"a":"say","name":"koala_2","str":3796,"flag":1}]},{"id":54,"when":"pickedUp","name":"cork_11","once":false,"holding":"","nth":0,"actions":[{"a":"show","name":"koala_2","click":1}]},{"id":55,"when":"trigger","name":"to_3a_den1","once":false,"holding":"","nth":0,"actions":[{"a":"room","key":"from_den1","spawn":"from_den1"}]},{"id":56,"when":"trigger","name":"r3_t1_nitngl","once":false,"holding":"","nth":0,"actions":[{"a":"show","name":"florence","click":0},{"a":"sound","sound":"ajq_nightingalefull"},{"a":"hide","name":"r3_t1_nitngl"},{"a":"wait","ms":3470},{"a":"set","name":"r3_t1_nitngl","state":0,"visible":1,"click":1},{"a":"set","name":"florence","state":0,"visible":1,"click":0},{"a":"var","name":"r3_t1_timer","value":0}]},{"id":57,"when":"trigger","name":"koala_3","once":true,"holding":"","nth":0,"actions":[{"a":"var","name":"koala_3_once","value":1},{"a":"goal","str":3889},{"a":"say","name":"koala_3","str":3797,"flag":1}]},{"id":58,"when":"trigger","name":"bamboo_1","once":true,"holding":"","nth":0,"actions":[{"a":"sound","sound":"ajq_ngnotes1"},{"a":"show","name":"bamboo","click":0},{"a":"var","name":"note_count","value":1},{"a":"show","name":"bamboo_1","click":1},{"a":"set","name":"bamboo_1","state":0,"visible":1,"click":1}]},{"id":59,"when":"trigger","name":"bamboo_2","once":true,"holding":"","nth":0,"actions":[{"a":"sound","sound":"ajq_ngnotes2"},{"a":"set","name":"bamboo","state":2,"visible":1,"click":0},{"a":"var","name":"note_count","value":2},{"a":"show","name":"bamboo_2","click":1},{"a":"set","name":"bamboo_2","state":0,"visible":1,"click":1}]},{"id":60,"when":"trigger","name":"bamboo_3","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"sound","sound":"ajq_ngnotes3"},{"a":"set","name":"bamboo","state":3,"visible":1,"click":0},{"a":"var","name":"note_count","value":3},{"a":"show","name":"bamboo_3","click":1},{"a":"set","name":"bamboo_3","state":0,"visible":1,"click":1}]},{"id":61,"when":"trigger","name":"bamboo_3","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"sound","sound":"ajq_ngnotes3"},{"a":"set","name":"bamboo","state":3,"visible":1,"click":0},{"a":"var","name":"note_count","value":5},{"a":"var","name":"vine_once","value":1},{"a":"send","cmd":"qicon","fields":"cavestone_1|1"},{"a":"goal","str":3890},{"a":"show","name":"koala_3","click":1},{"a":"show","name":"vine_ladder","click":0},{"a":"hide","name":"blockvolvine"},{"a":"xp","amount":25,"name":"note_count"},{"a":"var","name":"note_count","value":0},{"a":"set","name":"bamboo","state":0,"visible":1,"click":0},{"a":"show","name":"bamboo_3","click":1},{"a":"set","name":"bamboo_3","state":0,"visible":1,"click":1}]},{"id":62,"when":"trigger","name":"bamboo_5","once":true,"holding":"","nth":0,"actions":[{"a":"sound","sound":"ajq_ngnotes4"},{"a":"set","name":"bamboo","state":5,"visible":1,"click":0},{"a":"var","name":"note_count","value":4},{"a":"show","name":"bamboo_5","click":1},{"a":"set","name":"bamboo_5","state":0,"visible":1,"click":1}]},{"id":63,"when":"trigger","name":"r2_t2_t1a","once":true,"holding":"pail_4","nth":0,"actions":[{"a":"xp","amount":5,"name":"r2_t2_t1a"},{"a":"use"},{"a":"artstate","name":"r2_t2_1a","state":"revive"},{"a":"set","name":"r2_t2_1a","state":0,"visible":1,"click":0},{"a":"var","name":"revived","value":"{count}"}]},{"id":64,"when":"trigger","name":"r2_t3_t2d","once":true,"holding":"pail_4","nth":0,"actions":[{"a":"xp","amount":5,"name":"r2_t3_t2d"},{"a":"use"},{"a":"set","name":"r2_t3_2d","state":0,"visible":1,"click":0},{"a":"var","name":"revived","value":"{count}"}]},{"id":65,"when":"trigger","name":"pickup_boom2","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"boomtree_2","state":2,"visible":1,"click":0}]},{"id":66,"when":"trigger","name":"pickup_boom2","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"boomtree_2","state":3,"visible":1,"click":0}]},{"id":67,"when":"trigger","name":"pickup_boom2","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"boomtree_2","state":4,"visible":1,"click":0}]},{"id":68,"when":"trigger","name":"pickup_boom2","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"boomtree_2","state":5,"visible":1,"click":0}]},{"id":69,"when":"trigger","name":"pickup_boom2","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"boomtree_2","state":6,"visible":1,"click":1},{"a":"set","name":"pickup_boom2","state":99,"visible":0,"click":0},{"a":"wait","ms":14720},{"a":"set","name":"pickup_boom2","state":0,"visible":1,"click":1},{"a":"show","name":"boomtree_2","click":0}]},{"id":70,"when":"trigger","name":"to_3h1","once":true,"holding":"","nth":0,"actions":[{"a":"var","name":"cave1_once","value":1},{"a":"send","cmd":"qicon","fields":"key_1b_icon|1"},{"a":"var","name":"40_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure3-meetcosmo/#40-enteredfirstcave/#0#001"},{"a":"var","name":"40_uri","value":99},{"a":"goal","str":3897},{"a":"send","cmd":"qicon","fields":"cavestone_1|0"},{"a":"room","key":"from_3a1","spawn":"from_3a1"}]},{"id":71,"when":"trigger","name":"slidevol_3","once":false,"holding":"","nth":0,"actions":[{"a":"sound","sound":"ajq_slidedouble"}]},{"id":72,"when":"pickedUp","name":"key_1b","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qicon","fields":"key_1b_icon|0"}]},{"id":73,"when":"trigger","name":"c2phantom2__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"c2phantom2__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":74,"when":"opened","name":"c2treasure1","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"c2treasure1"}]},{"id":75,"when":"trigger","name":"c2phantom1__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"c2phantom1__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":76,"when":"trigger","name":"slidevol_1","once":false,"holding":"","nth":0,"actions":[{"a":"sound","sound":"ajq_slidesingle"}]},{"id":77,"when":"trigger","name":"slidevol_2","once":false,"holding":"","nth":0,"actions":[{"a":"sound","sound":"ajq_slidedouble"}]},{"id":78,"when":"trigger","name":"slidevol_4","once":false,"holding":"","nth":0,"actions":[{"a":"sound","sound":"ajq_slidedouble"}]},{"id":79,"when":"trigger","name":"to_3a2","once":false,"holding":"","nth":0,"actions":[{"a":"room","key":"from_3h2","spawn":"from_3h2"}]},{"id":80,"when":"trigger","name":"cave1_exit","once":false,"holding":"","nth":0,"actions":[{"a":"goal","str":3896},{"a":"hide","name":"cave1_exit"}]},{"id":81,"when":"trigger","name":"secretvol_6","once":false,"holding":"","nth":0,"actions":[{"a":"sound","sound":"ajq_mussecretareast"}]},{"id":82,"when":"opened","name":"c1treasure_2","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"c1treasure_2"}]},{"id":83,"when":"trigger","name":"cosmo_5_show","once":false,"holding":"","nth":0,"actions":[{"a":"artstate","name":"cosmo_5","state":"appear"},{"a":"set","name":"cosmo_5","state":0,"visible":1,"click":1},{"a":"talk","name":"cosmo_5","str":3882,"mode":0},{"a":"hide","name":"cosmo_5_show"}]},{"id":84,"when":"answer","name":"cosmo_5","once":false,"holding":"","nth":0,"actions":[{"a":"artstate","name":"cosmo_5","state":"disappear"},{"a":"show","name":"cosmo_5","click":1},{"a":"set","name":"cosmo_5","state":2,"visible":1,"click":0},{"a":"wait","ms":1380},{"a":"set","name":"cosmo_5","state":99,"visible":0,"click":0}]},{"id":85,"when":"trigger","name":"factory_3","once":false,"holding":"","nth":1,"nthOn":0,"actions":[{"a":"show","name":"factory_3","click":1}]},{"id":86,"when":"trigger","name":"factory_3__0___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory_3__0___give_d|0|null"},{"a":"gems","amount":25}]},{"id":87,"when":"trigger","name":"factory_4","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"show","name":"factory_4","click":1}]},{"id":88,"when":"trigger","name":"factory_4","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"wait","ms":1320},{"a":"sound","sound":"ajq_riverclear"},{"a":"set","name":"watervol_3","state":99,"visible":0,"click":0}]},{"id":89,"when":"trigger","name":"factory_4__0___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory_4__0___give_d|0|null"},{"a":"gems","amount":25}]},{"id":90,"when":"trigger","name":"pickup_boom6","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"boomtree_6","state":2,"visible":1,"click":0}]},{"id":91,"when":"trigger","name":"r2_t3_t3c","once":true,"holding":"pail_3","nth":0,"actions":[{"a":"xp","amount":5,"name":"r2_t3_t3c"},{"a":"use"},{"a":"set","name":"r2_t3_3c","state":0,"visible":1,"click":0},{"a":"var","name":"revived","value":"{count}"}]},{"id":92,"when":"trigger","name":"to_den2","once":false,"holding":"","nth":0,"actions":[{"a":"room","key":"from_3a_den2","spawn":"from_3a_den2"}]},{"id":93,"when":"trigger","name":"koala_5","once":false,"holding":"","nth":0,"actions":[{"a":"say","name":"koala_5","str":3819,"flag":1}]},{"id":94,"when":"pickedUp","name":"cork_22","once":false,"holding":"","nth":0,"actions":[{"a":"var","name":"den2corks","value":"{count}"}]},{"id":95,"when":"trigger","name":"to_3a_den2","once":false,"holding":"","nth":0,"actions":[{"a":"room","key":"from_den2","spawn":"from_den2"}]},{"id":96,"when":"trigger","name":"factory_5","once":false,"holding":"","nth":1,"nthOn":0,"actions":[{"a":"show","name":"factory_5","click":1}]},{"id":97,"when":"trigger","name":"factory_5__0___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory_5__0___give_d|0|null"},{"a":"gems","amount":25}]},{"id":98,"when":"trigger","name":"phantom__8__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom__8__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":99,"when":"trigger","name":"pickup_boom5","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"boomtree_5","state":2,"visible":1,"click":0}]},{"id":100,"when":"trigger","name":"pickup_boom5","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"boomtree_5","state":3,"visible":1,"click":0}]},{"id":101,"when":"trigger","name":"factory_6","once":false,"holding":"","nth":1,"nthOn":0,"actions":[{"a":"show","name":"factory_6","click":1}]},{"id":102,"when":"trigger","name":"factory_6__0___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory_6__0___give_d|0|null"},{"a":"gems","amount":25}]},{"id":103,"when":"trigger","name":"factory_8","once":false,"holding":"","nth":1,"nthOn":0,"actions":[{"a":"show","name":"factory_8","click":1}]},{"id":104,"when":"trigger","name":"factory_8__0___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory_8__0___give_d|0|null"},{"a":"gems","amount":25}]},{"id":105,"when":"trigger","name":"koala_7","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"say","name":"koala_7","str":3823,"flag":1},{"a":"var","name":"koala_7_once","value":1},{"a":"goal","str":3836}],"unless":"rope, timber"},{"id":106,"when":"trigger","name":"koala_7","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"say","name":"koala_7","str":3823,"flag":1}],"unless":"rope, timber"},{"id":107,"when":"trigger","name":"koala_7","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"set","name":"koala_7","state":5,"visible":1,"click":1},{"a":"say","name":"koala_7","str":3814,"flag":1},{"a":"set","name":"koala_7","state":4,"visible":1,"click":1},{"a":"var","name":"koala_7_talk","value":"{count}"}],"unless":"rope, timber"},{"id":108,"when":"trigger","name":"koala_7","once":false,"holding":"","nth":6,"nthOn":false,"actions":[{"a":"set","name":"koala_7","state":6,"visible":1,"click":1},{"a":"say","name":"koala_7","str":3815,"flag":1},{"a":"set","name":"koala_7","state":4,"visible":1,"click":1},{"a":"var","name":"koala_7_talk","value":"{count}"}],"unless":"rope, timber"},{"id":109,"when":"trigger","name":"koala_7","once":false,"holding":"","nth":7,"nthOn":false,"actions":[{"a":"set","name":"koala_7","state":7,"visible":1,"click":1},{"a":"say","name":"koala_7","str":3873,"flag":1},{"a":"set","name":"koala_7","state":4,"visible":1,"click":1},{"a":"var","name":"koala_7_talk","value":"{count}"}],"unless":"rope, timber"},{"id":110,"when":"trigger","name":"factory_9","once":false,"holding":"","nth":1,"nthOn":0,"actions":[{"a":"show","name":"factory_9","click":1}]},{"id":111,"when":"trigger","name":"factory_9__0___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory_9__0___give_d|0|null"},{"a":"gems","amount":25}]},{"id":112,"when":"trigger","name":"to_den3","once":false,"holding":"","nth":0,"actions":[{"a":"room","key":"from_3a_den3","spawn":"from_3a_den3"}]},{"id":113,"when":"trigger","name":"koala_9","once":false,"holding":"","nth":0,"actions":[{"a":"say","name":"koala_9","str":3822,"flag":1},{"a":"goal","str":3837}],"unless":"banana"},{"id":114,"when":"trigger","name":"koala_8","once":false,"holding":"","nth":0,"actions":[{"a":"say","name":"koala_8","str":3821,"flag":1},{"a":"goal","str":3839}],"unless":"apple"},{"id":115,"when":"trigger","name":"to_3a_den3","once":false,"holding":"","nth":0,"actions":[{"a":"room","key":"from_den3","spawn":"from_den3"}]},{"id":116,"when":"trigger","name":"r2_t2_t4a","once":true,"holding":"pail_6","nth":0,"actions":[{"a":"xp","amount":5,"name":"r2_t2_t4a"},{"a":"use"},{"a":"artstate","name":"r2_t2_4a","state":"revive"},{"a":"set","name":"r2_t2_4a","state":0,"visible":1,"click":0},{"a":"var","name":"revived","value":"{count}"}]},{"id":117,"when":"trigger","name":"koala_8","once":false,"holding":"apple","nth":0,"actions":[{"a":"use"},{"a":"say","name":"koala_8","str":3958,"flag":1},{"a":"goal","str":3840},{"a":"send","cmd":"qgi","fields":"rope"}]},{"id":118,"when":"trigger","name":"koala_7","once":false,"holding":"rope","nth":0,"actions":[{"a":"use"},{"a":"say","name":"koala_7","str":3799,"flag":1},{"a":"goal","str":3800},{"a":"set","name":"koala_8","state":2,"visible":1,"click":1},{"a":"show","name":"koala_7","click":1}]},{"id":119,"when":"trigger","name":"pickup_boom7","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"boomtree_7","state":2,"visible":1,"click":0}]},{"id":120,"when":"trigger","name":"pickup_boom7","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"boomtree_7","state":3,"visible":1,"click":0}]},{"id":121,"when":"trigger","name":"pickup_boom7","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"boomtree_7","state":4,"visible":1,"click":0}]},{"id":122,"when":"trigger","name":"r2_t2_t1b","once":true,"holding":"pail_2","nth":0,"actions":[{"a":"xp","amount":5,"name":"r2_t2_t1b"},{"a":"use"},{"a":"artstate","name":"r2_t2_1b","state":"revive"},{"a":"set","name":"r2_t2_1b","state":0,"visible":1,"click":0},{"a":"var","name":"revived","value":"{count}"}]},{"id":123,"when":"trigger","name":"koala_9","once":false,"holding":"banana","nth":0,"actions":[{"a":"use"},{"a":"say","name":"koala_9","str":3956,"flag":1},{"a":"goal","str":3838},{"a":"send","cmd":"qgi","fields":"timber"}]},{"id":124,"when":"trigger","name":"koala_7","once":false,"holding":"timber","nth":0,"actions":[{"a":"use"},{"a":"say","name":"koala_7","str":3803,"flag":1},{"a":"goal","str":3804},{"a":"send","cmd":"qicon","fields":"cavestone_2|1"},{"a":"show","name":"wood_bridge","click":0},{"a":"hide","name":"blockvolbrid"},{"a":"set","name":"koala_9","state":2,"visible":1,"click":1},{"a":"set","name":"koala_7","state":4,"visible":1,"click":1}]},{"id":125,"when":"trigger","name":"r2_t3_t4c","once":true,"holding":"pail_2","nth":0,"actions":[{"a":"xp","amount":5,"name":"r2_t3_t4c"},{"a":"use"},{"a":"set","name":"r2_t3_4c","state":0,"visible":1,"click":0},{"a":"var","name":"revived","value":"{count}"}]},{"id":126,"when":"trigger","name":"factory_2","once":false,"holding":"","nth":1,"nthOn":0,"actions":[{"a":"show","name":"factory_2","click":1}]},{"id":127,"when":"trigger","name":"factory_2__0___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory_2__0___give_d|0|null"},{"a":"gems","amount":25}]},{"id":128,"when":"trigger","name":"r2_t3_t1d","once":true,"holding":"pail_2","nth":0,"actions":[{"a":"xp","amount":5,"name":"r2_t3_t1d"},{"a":"use"},{"a":"set","name":"r2_t3_1d","state":0,"visible":1,"click":0},{"a":"var","name":"revived","value":"{count}"}]},{"id":129,"when":"opened","name":"treasure_2","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"treasure_2"}]},{"id":130,"when":"trigger","name":"pipetrig_5b","once":true,"holding":"cork_22","nth":0,"actions":[{"a":"use"},{"a":"show","name":"pipe_5b","click":0},{"a":"hide","name":"sludge_5b"},{"a":"set","name":"pipeinfo_5b","state":99,"visible":0,"click":0},{"a":"xp","amount":5,"name":"pipetrig_5b"},{"a":"var","name":"water5","value":"{count}"},{"a":"var","name":"pipecount","value":"{count}"}]},{"id":131,"when":"trigger","name":"to_3g1","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"var","name":"cave2_once","value":1},{"a":"send","cmd":"qicon","fields":"key_3b_icon|1"},{"a":"var","name":"60_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure3-meetcosmo/#60-enteredlastcave/#0#001"},{"a":"var","name":"60_uri","value":99},{"a":"goal","str":3899}]},{"id":132,"when":"trigger","name":"to_3g1","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"room","key":"from_3a5","spawn":"from_3a5"}]},{"id":133,"when":"trigger","name":"to_3a5","once":false,"holding":"","nth":0,"actions":[{"a":"room","key":"from_3g1","spawn":"from_3g1"}]},{"id":134,"when":"trigger","name":"pipetrig_5a","once":true,"holding":"cork_3","nth":0,"actions":[{"a":"use"},{"a":"show","name":"pipe_5a","click":0},{"a":"hide","name":"sludge_5a"},{"a":"set","name":"pipeinfo_5a","state":99,"visible":0,"click":0},{"a":"xp","amount":5,"name":"pipetrig_5a"},{"a":"var","name":"water5","value":"{count}"},{"a":"var","name":"pipecount","value":"{count}"}]},{"id":135,"when":"trigger","name":"pipetrig_5c","once":true,"holding":"cork_6","nth":0,"actions":[{"a":"use"},{"a":"show","name":"pipe_5c","click":0},{"a":"hide","name":"sludge_5c"},{"a":"set","name":"pipeinfo_5c","state":99,"visible":0,"click":0},{"a":"xp","amount":5,"name":"pipetrig_5c"},{"a":"var","name":"water5","value":"{count}"},{"a":"set","name":"water_5","state":0,"visible":1,"click":0},{"a":"var","name":"pipecount","value":"{count}"},{"a":"wait","ms":2260},{"a":"sound","sound":"ajq_riverclear"}]},{"id":136,"when":"trigger","name":"c3phantom4__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"c3phantom4__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":137,"when":"trigger","name":"c3phantom1__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"c3phantom1__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":138,"when":"trigger","name":"slidevol_12","once":false,"holding":"","nth":0,"actions":[{"a":"sound","sound":"ajq_slidesingle"}]},{"id":139,"when":"pickedUp","name":"key_3b","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qicon","fields":"key_3b_icon|0"}]},{"id":140,"when":"trigger","name":"slidevol_13","once":false,"holding":"","nth":0,"actions":[{"a":"sound","sound":"ajq_slidesingle"}]},{"id":141,"when":"trigger","name":"c3factory1","once":false,"holding":"","nth":1,"nthOn":0,"actions":[{"a":"show","name":"c3factory1","click":1}]},{"id":142,"when":"trigger","name":"c3factory1__0___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"c3factory1__0___give_d|0|null"},{"a":"gems","amount":25}]},{"id":143,"when":"trigger","name":"blocktrig_1","once":false,"holding":"","nth":0,"actions":[{"a":"say","name":"blocktrig_1","str":4016,"flag":0}]},{"id":144,"when":"opened","name":"c3treasure2","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"c3treasure2"}]},{"id":145,"when":"trigger","name":"slidevol_11","once":false,"holding":"","nth":0,"actions":[{"a":"sound","sound":"ajq_slidedouble"}]},{"id":146,"when":"opened","name":"c3treasure3","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"c3treasure3"}]},{"id":147,"when":"opened","name":"c3treasure1","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"c3treasure1"}]},{"id":148,"when":"trigger","name":"cosmo_4","once":false,"holding":"","nth":0,"actions":[{"a":"talk","name":"cosmo_4","str":3874,"mode":1}]},{"id":149,"when":"answer","name":"cosmo_4","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qicon","fields":"cosmo_4|0"},{"a":"show","name":"exit_port","click":0},{"a":"show","name":"portal","click":0},{"a":"xp","amount":50,"name":"cosmo_4"},{"a":"goal","str":3902},{"a":"set","name":"cosmo_4","state":2,"visible":1,"click":0},{"a":"wait","ms":180},{"a":"var","name":"80_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure3-meetcosmo/#80-exit/#0#001"},{"a":"prize","list":"gems 750, den 1308, den 1309, den 1310, den 1311"},{"a":"wait","ms":3010},{"a":"set","name":"exit_vol","state":0,"visible":1,"click":1},{"a":"set","name":"exit_block","state":99,"visible":0,"click":0}]},{"id":150,"when":"trigger","name":"exit_vol","once":false,"holding":"","nth":0,"actions":[{"a":"end"}]},{"id":151,"holding":"","when":"trigger","name":"waterspot_#","family":true,"holdFam":"pail_#","unlessFam":"","once":true,"nth":0,"actions":[{"a":"var","name":"wateredplant","value":"{count}"},{"a":"use"},{"a":"hide","name":"{name}"},{"a":"xp","amount":5,"name":"{name}"}]},{"id":152,"holding":"","when":"trigger","name":"waterspot_#","family":true,"holdFam":"pail_#","unlessFam":"","member":"waterspot_3","once":true,"nth":0,"actions":[{"a":"show","name":"grow_cabbage","click":0}]},{"id":153,"holding":"","when":"trigger","name":"waterspot_#","family":true,"holdFam":"pail_#","unlessFam":"","member":"waterspot_2","once":true,"nth":0,"actions":[{"a":"show","name":"grow_strawbe","click":0}]},{"id":154,"holding":"","when":"trigger","name":"waterspot_#","family":true,"holdFam":"pail_#","unlessFam":"","member":"waterspot_1","once":true,"nth":0,"actions":[{"a":"show","name":"grow_radish","click":0}]},{"id":155,"holding":"","when":"trigger","name":"waterspot_#","family":true,"holdFam":"pail_#","unlessFam":"","member":"waterspot_7","once":true,"nth":0,"actions":[{"a":"show","name":"grow_carrot","click":0}]},{"id":156,"holding":"","when":"trigger","name":"waterspot_#","family":true,"holdFam":"pail_#","unlessFam":"","member":"waterspot_6","once":true,"nth":0,"actions":[{"a":"show","name":"grow_grape","click":0}]},{"id":157,"holding":"","when":"trigger","name":"waterspot_#","family":true,"holdFam":"pail_#","unlessFam":"","member":"waterspot_5","once":true,"nth":0,"actions":[{"a":"show","name":"grow_corn","click":0}]},{"id":158,"holding":"","when":"trigger","name":"waterspot_#","family":true,"holdFam":"pail_#","unlessFam":"","member":"waterspot_4","once":true,"nth":0,"actions":[{"a":"show","name":"grow_tomato","click":0}]},{"id":159,"holding":"","when":"trigger","name":"pipetrig_#","family":true,"holdFam":"","unlessFam":"cork_#","member":"pipetrig_9","once":false,"nth":0,"actions":[{"a":"show","name":"pipeinfo_9","click":1},{"a":"say","name":"pipeinfo_9","str":3468,"flag":2}]},{"id":160,"holding":"","when":"trigger","name":"waterspot_#","family":true,"holdFam":"","unlessFam":"pail_#","once":false,"nth":0,"actions":[{"a":"show","name":"waterinfo_{n}","click":1},{"a":"say","name":"waterinfo_{n}","str":15853,"flag":2}]},{"id":161,"holding":"","when":"trigger","name":"phantom_#__give_gem","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"send","cmd":"qad","fields":"{name}|0|null"},{"a":"gems","amount":25}]},{"id":162,"holding":"","when":"trigger","name":"pipetrig_#","family":true,"holdFam":"cork_#","unlessFam":"","once":true,"nth":0,"actions":[{"a":"use"},{"a":"show","name":"pipe_{n}","click":0},{"a":"set","name":"pipeinfo_{n}","state":99,"visible":0,"click":0},{"a":"xp","amount":5,"name":"{name}"},{"a":"set","name":"water_{n}","state":0,"visible":1,"click":0},{"a":"var","name":"pipecount","value":"{count}"},{"a":"hide","name":"{name}"},{"a":"sound","sound":"ajq_riverclear"}]},{"id":163,"holding":"","when":"trigger","name":"pipetrig_#","family":true,"holdFam":"cork_#","unlessFam":"","member":"pipetrig_9","once":true,"nth":0,"actions":[{"a":"set","name":"sludge_9","state":990,"visible":0,"click":0}]},{"id":164,"holding":"","when":"trigger","name":"pipetrig_#","family":true,"holdFam":"cork_#","unlessFam":"","member":"pipetrig_3","once":true,"nth":0,"actions":[{"a":"set","name":"sludge_3","state":990,"visible":0,"click":0}]},{"id":165,"holding":"","when":"trigger","name":"pipetrig_#","family":true,"holdFam":"cork_#","unlessFam":"","member":"pipetrig_1","once":true,"nth":0,"actions":[{"a":"set","name":"waterfall_2","state":0,"visible":1,"click":0},{"a":"set","name":"sludge_1","state":99,"visible":0,"click":0}]},{"id":166,"holding":"","when":"trigger","name":"pipetrig_#","family":true,"holdFam":"cork_#","unlessFam":"","member":"pipetrig_4","once":true,"nth":0,"actions":[{"a":"set","name":"waterfall_1","state":0,"visible":1,"click":0},{"a":"set","name":"sludge_4","state":99,"visible":0,"click":0}]},{"id":167,"holding":"","when":"trigger","name":"trapkey_#","family":true,"holdFam":"","unlessFam":"key_#","member":"trapkey_1","once":false,"nth":0,"actions":[{"a":"show","name":"koala_4","click":1},{"a":"say","name":"koala_4","str":3806,"flag":1},{"a":"artstate","name":"koala_4","state":"facesw"},{"a":"set","name":"koala_4","state":0,"visible":1,"click":0}]},{"id":168,"holding":"","when":"trigger","name":"trapkey_#","family":true,"holdFam":"","unlessFam":"key_#","member":"trapkey_3","once":false,"nth":0,"actions":[{"a":"show","name":"koala_10","click":1},{"a":"say","name":"koala_10","str":3808,"flag":1},{"a":"artstate","name":"koala_10","state":"facesw"},{"a":"set","name":"koala_10","state":0,"visible":1,"click":0}]},{"id":169,"holding":"","when":"trigger","name":"seedpile_#","family":true,"holdFam":"","unlessFam":"","once":false,"nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3}]},{"id":170,"holding":"","when":"trigger","name":"trapkey_#","family":true,"holdFam":"key_#","unlessFam":"","once":true,"nth":0,"actions":[{"a":"var","name":"trapnotify","value":"{count}"},{"a":"use"},{"a":"set","name":"trapvol_{n}","state":99,"visible":0,"click":0},{"a":"show","name":"cage_{n}","click":0},{"a":"xp","amount":10,"name":"{name}"},{"a":"hide","name":"{name}"}]},{"id":171,"holding":"","when":"trigger","name":"trapkey_#","family":true,"holdFam":"key_#","unlessFam":"","member":"trapkey_1","once":true,"nth":0,"actions":[{"a":"artstate","name":"koala_4","state":"hop"},{"a":"set","name":"koala_4","state":2,"visible":1,"click":1},{"a":"say","name":"koala_4","str":3810,"flag":1},{"a":"set","name":"koala_4","state":3,"visible":1,"click":0},{"a":"set","name":"koala_3","state":2,"visible":1,"click":1},{"a":"show","name":"koala_1","click":1}]},{"id":172,"holding":"","when":"trigger","name":"trapkey_#","family":true,"holdFam":"key_#","unlessFam":"","member":"trapkey_3","once":true,"nth":0,"actions":[{"a":"artstate","name":"koala_10","state":"hop"},{"a":"set","name":"koala_10","state":2,"visible":1,"click":1},{"a":"say","name":"koala_10","str":3812,"flag":1},{"a":"appear","name":"cosmo_4","face":""},{"a":"show","name":"koala_5","click":1},{"a":"send","cmd":"qicon","fields":"cosmo_4|1"},{"a":"set","name":"koala_10","state":3,"visible":1,"click":0}]},{"id":173,"holding":"","when":"trigger","name":"trigfact#","family":true,"holdFam":"","unlessFam":"","once":false,"nth":0,"actions":[{"a":"artstate","name":"factory_{n}","state":"appear"},{"a":"set","name":"factory_{n}","state":0,"visible":1,"click":1},{"a":"hide","name":"{name}"}]},{"id":174,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["phantom_#"],"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_gem|200|42|3|25|null|null|null"},{"a":"xp","amount":5,"name":"{phantom}"},{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":175,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["cavestone_#"],"actions":[{"a":"xp","amount":5,"name":"{phantom}"},{"a":"sound","sound":"ajq_mussecretareastdel"},{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":176,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["c2phantom#"],"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_gem|200|42|3|25|null|null|null"},{"a":"xp","amount":5,"name":"{phantom}"},{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":177,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["factory_#"],"actions":[{"a":"xp","amount":5,"name":"{phantom}"}]},{"id":178,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["factory_#__#_"],"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_d|200|42|3|25|null|null|null"}]},{"id":179,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["c3phantom#"],"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_gem|200|42|3|25|null|null|null"},{"a":"xp","amount":5,"name":"{phantom}"},{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":180,"holding":"","when":"eaten","name":"","member":"gardenrock","nth":0,"once":false,"actions":[{"a":"xp","amount":25,"name":"{phantom}"},{"a":"set","name":"cosmo_2","state":62,"visible":1,"click":1},{"a":"xp","amount":25,"name":"cosmo_2"},{"a":"talk","name":"cosmo_2","str":3881,"mode":62},{"a":"set","name":"gardenblock","state":99,"visible":0,"click":0},{"a":"set","name":"ga_rockinfo","state":99,"visible":0,"click":0},{"a":"sound","sound":"ajq_mussecretareastdel"},{"a":"set","name":"pail_1","state":0,"visible":1,"click":0},{"a":"set","name":"{phantom}","state":2,"visible":0,"click":0}]},{"id":181,"holding":"","when":"eaten","name":"","member":"cavestone_1","nth":0,"once":false,"actions":[{"a":"set","name":"blockvol_3h","state":99,"visible":0,"click":0},{"a":"set","name":"caveinfo_1","state":99,"visible":0,"click":0}]},{"id":182,"holding":"","when":"eaten","name":"","member":"factory_3","nth":0,"once":false,"actions":[{"a":"set","name":"factryblok3","state":99,"visible":0,"click":0}]},{"id":183,"holding":"","when":"eaten","name":"","member":"factory_4","nth":0,"once":false,"actions":[{"a":"set","name":"factryblok4","state":99,"visible":0,"click":0}]},{"id":184,"holding":"","when":"eaten","name":"","member":"factory_5","nth":0,"once":false,"actions":[{"a":"set","name":"factryblok5","state":99,"visible":0,"click":0}]},{"id":185,"holding":"","when":"eaten","name":"","member":"phantom__8","nth":0,"once":false,"actions":[{"a":"set","name":"cork_4","state":0,"visible":1,"click":0},{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_gem|200|42|3|25|null|null|null"},{"a":"xp","amount":5,"name":"{phantom}"},{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":186,"holding":"","when":"eaten","name":"","member":"factory_6","nth":0,"once":false,"actions":[{"a":"set","name":"cork_6","state":0,"visible":1,"click":0},{"a":"set","name":"factryblok6","state":99,"visible":0,"click":0},{"a":"set","name":"{phantom}","state":99,"visible":0,"click":0}]},{"id":187,"holding":"","when":"eaten","name":"","member":"factory_8","nth":0,"once":false,"actions":[{"a":"set","name":"factryblok8","state":99,"visible":0,"click":0}]},{"id":188,"holding":"","when":"eaten","name":"","member":"factory_9","nth":0,"once":false,"actions":[{"a":"set","name":"factryblok9","state":99,"visible":0,"click":0}]},{"id":189,"holding":"","when":"eaten","name":"","member":"factory_2","nth":0,"once":false,"actions":[{"a":"set","name":"factryblok2","state":99,"visible":0,"click":0}]},{"id":190,"holding":"","when":"eaten","name":"","member":"cavestone_2","nth":0,"once":false,"actions":[{"a":"set","name":"blockvol_3g","state":99,"visible":0,"click":0},{"a":"set","name":"caveinfo_2","state":99,"visible":0,"click":0},{"a":"wait","ms":750},{"a":"send","cmd":"qicon","fields":"{phantom}|0"},{"a":"room","key":"from_3a5","spawn":"from_3a5"}]},{"id":191,"holding":"","when":"eaten","name":"","member":"c3factory1","nth":0,"once":false,"actions":[{"a":"xp","amount":5,"name":"{phantom}"},{"a":"set","name":"c3facvol1","state":99,"visible":0,"click":0}]},{"id":192,"holding":"","when":"eaten","name":"","member":"c3factory1__0_","nth":0,"once":false,"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_d|200|42|3|25|null|null|null"}]},{"id":193,"holding":"","when":"eaten","name":"","member":"boomrock5","nth":0,"once":false,"actions":[{"a":"set","name":"boomrvol5","state":99,"visible":0,"click":0},{"a":"xp","amount":5,"name":"{phantom}"},{"a":"sound","sound":"ajq_mussecretareastdel"},{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]}],"written":"2017-12-18 21:26:53","spawners":{"factory_3":[11,2],"factory_4":[11,2],"factory_5":[11,2],"factory_6":[11,2],"factory_8":[11,2],"factory_9":[11,2],"factory_2":[11,2],"c3factory1":[11,2]},"eat":{"gardenrock":[1,1],"phantom_4":[50,1],"phantom_5":[50,1],"phantom_7":[50,1],"phantom_2":[50,1],"phantom_6":[50,1],"cavestone_1":[1,1],"c2phantom2":[50,1],"c2phantom1":[50,1],"factory_3":[1,1],"factory_3__0_":[50,1],"factory_4":[1,1],"factory_4__0_":[50,1],"phantom_1":[50,1],"factory_5":[1,1],"factory_5__0_":[50,1],"phantom__8":[50,1],"factory_6":[1,1],"factory_6__0_":[50,1],"factory_8":[1,1],"factory_8__0_":[50,1],"factory_9":[1,1],"factory_9__0_":[50,1],"factory_2__0_":[50,1],"factory_2":[1,1],"cavestone_2":[1,1],"c3phantom4":[50,1],"c3phantom1":[50,1],"c3factory1":[1,1],"c3factory1__0_":[50,1],"boomrock5":[1,1]},"bars":[],"variantGroups":[],"countRules":[{"counter":"wateredplant","value":1,"actions":[{"a":"goal","str":3824},{"a":"show","name":"gardencabbag","click":0}]},{"counter":"wateredplant","value":2,"actions":[{"a":"goal","str":3825},{"a":"show","name":"gardenstrawb","click":0}]},{"counter":"wateredplant","value":3,"actions":[{"a":"goal","str":3826},{"a":"show","name":"gardenradish","click":0}]},{"counter":"wateredplant","value":4,"actions":[{"a":"goal","str":3827},{"a":"show","name":"gardencarro","click":0}]},{"counter":"wateredplant","value":5,"actions":[{"a":"goal","str":3828},{"a":"show","name":"gardengrapes","click":0},{"a":"set","name":"waterinfo_6","state":0,"visible":0,"click":0}]},{"counter":"wateredplant","value":6,"actions":[{"a":"goal","str":3829},{"a":"show","name":"gardencorn","click":0},{"a":"set","name":"waterinfo_5","state":0,"visible":0,"click":0}]},{"counter":"wateredplant","value":7,"actions":[{"a":"xp","amount":25,"name":"wateredplant"},{"a":"set","name":"pail_1","state":99,"visible":0,"click":0},{"a":"artstate","name":"cosmo_2","state":"appear"},{"a":"set","name":"cosmo_2","state":0,"visible":1,"click":1},{"a":"set","name":"potion","state":0,"visible":1,"click":0},{"a":"send","cmd":"qicon","fields":"cosmo_2|1"},{"a":"goal","str":3809},{"a":"var","name":"10_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure3-meetcosmo/#10-watercrops/#0#001"},{"a":"var","name":"10_uri","value":99},{"a":"show","name":"gardentomato","click":0}]},{"counter":"revived","value":1,"actions":[{"a":"hide","name":"r2_t2_t2a"}]},{"counter":"revived","value":2,"actions":[{"a":"hide","name":"r2_t2_t2b"}]},{"counter":"pipecount","value":1,"actions":[{"a":"set","name":"watervol_9","state":99,"visible":0,"click":0},{"a":"set","name":"lily_9","state":0,"visible":1,"click":0}]},{"counter":"revived","value":3,"actions":[{"a":"hide","name":"r2_t2_t1a"}]},{"counter":"revived","value":4,"actions":[{"a":"hide","name":"r2_t3_t2d"}]},{"counter":"trapnotify","value":1,"actions":[{"a":"goal","str":3898},{"a":"var","name":"50_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure3-meetcosmo/#50-rescuedfirstkoala/#0#001"},{"a":"var","name":"50_uri","value":99}]},{"counter":"revived","value":5,"actions":[{"a":"hide","name":"r2_t3_t3c"}]},{"counter":"revived","value":6,"actions":[{"a":"hide","name":"r2_t2_t4a"}]},{"counter":"revived","value":7,"actions":[{"a":"hide","name":"r2_t2_t1b"}]},{"counter":"pipecount","value":3,"actions":[{"a":"set","name":"watervol_1","state":99,"visible":0,"click":0}]},{"counter":"revived","value":8,"actions":[{"a":"hide","name":"r2_t3_t4c"}]},{"counter":"revived","value":9,"actions":[{"a":"hide","name":"r2_t3_t1d"}]},{"counter":"pipecount","value":4,"actions":[{"a":"set","name":"watervol_4","state":99,"visible":0,"click":0},{"a":"set","name":"lily_4","state":0,"visible":1,"click":0}]},{"counter":"pipecount","value":5,"actions":[{"a":"hide","name":"pipetrig_5b"}]},{"counter":"pipecount","value":6,"actions":[{"a":"hide","name":"pipetrig_5a"}]},{"counter":"pipecount","value":7,"actions":[{"a":"hide","name":"pipetrig_5c"},{"a":"set","name":"watervol_5a","state":99,"visible":0,"click":0},{"a":"set","name":"watervol_5b","state":99,"visible":0,"click":0},{"a":"set","name":"watervol_5c","state":99,"visible":0,"click":0},{"a":"set","name":"watervol_5d","state":99,"visible":0,"click":0},{"a":"set","name":"lily_5","state":0,"visible":1,"click":0}]},{"counter":"water5","value":3,"actions":[{"a":"set","name":"waterfall_3","state":0,"visible":1,"click":0},{"a":"set","name":"waterfall_4","state":0,"visible":1,"click":0},{"a":"send","cmd":"qicon","fields":"cavestone_2|1"}]},{"counter":"trapnotify","value":2,"actions":[{"a":"goal","str":3809},{"a":"var","name":"70_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure3-meetcosmo/#70-rescuethekoalas/#0#001"},{"a":"var","name":"70_uri","value":99}]}],"puzzles":[],"bosses":[]}
*/
