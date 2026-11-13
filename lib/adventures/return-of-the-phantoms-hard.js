"use strict";

// Recorded adventure 14, made with the adventure script maker. Plays in adventures.room_adventure_1x, adventures.room_adventure_1a, adventures.room_adventure_1x.
// To change it, open this file in the maker. Edits made by hand are kept only
// until the maker writes the file again. By hand here (marked "by hand"): the
// arctic wolves' passage (its room and chest).

// true the first time for each key, false after: for steps that must happen once
const once = (q, key) => {
  q.vars.done = q.vars.done || new Set();
  if (q.vars.done.has(key)) {
    return false;
  }
  q.vars.done.add(key);
  return true;
};
const OBJECTIVE = 3465; // the line at the top when the adventure begins
// what happens when a count gets somewhere (how many plants are watered): once for each value
const counted = (q, name) => {
  const value = q.vars.counts[name];
  const key = `${name} ${value}`;
  q.vars.reached = q.vars.reached || {};
  if (q.vars.reached[key]) {
    return;
  }
  q.vars.reached[key] = true;
  if (key === "flower_count 1") {
    q.send("qcmd", 38, 3475);
    q.vars.goal = 3475;
  }
  if (key === "flower_count 2") {
    q.send("qcmd", 38, 3476);
    q.vars.goal = 3476;
  }
  if (key === "flower_count 3") {
    q.send("qcmd", 38, 3477);
    q.vars.goal = 3477;
  }
  if (key === "flower_count 4") {
    q.send("qcmd", 38, 3478);
    q.vars.goal = 3478;
  }
  if (key === "flower_count 5") {
    q.send("qcmd", 38, 3479);
    q.vars.goal = 3479;
  }
  if (key === "flower_count 6") {
    q.send("qcmd", 38, 3480);
    q.vars.goal = 3480;
  }
  if (key === "flower_count 7") {
    q.send("qcmd", 38, 3481);
    q.vars.goal = 3481;
  }
  if (key === "flower_count 8") {
    q.send("qcmd", 38, 3482);
    q.vars.goal = 3482;
  }
  if (key === "flower_count 9") {
    q.send("qcmd", 38, 3483);
    q.vars.goal = 3483;
  }
  if (key === "flower_count 10") {
    q.send("qcmd", 38, 3484);
    q.vars.goal = 3484;
  }
  if (key === "flower_count 11") {
    q.send("qcmd", 38, 3485);
    q.vars.goal = 3485;
  }
  if (key === "flower_count 12") {
    q.send("qcmd", 38, 3486);
    q.vars.goal = 3486;
    set(q, "trig_1a", 1, 1, 1);
    set(q, "nobody_home", 1, 0, 0);
    set(q, "bunnyblocker", 1, 0, 0);
    set(q, "burrow_door", 1, 1, 0);
    set(q, "pail_1", 2, 0, 0);
    set(q, "pail_2", 2, 0, 0);
    set(q, "pail_3", 2, 0, 0);
    q.xp(15, "flower_count");
    set(q, "bunny_12", 1, 1, 0);
    q.send("qcmdVT", 1, "20_uri", 1, 0, 0);
    q.send("qposturi", "/adventure1-returnofthephantoms/#20-revivetheplants/#0#101");
    q.send("qcmdVT", 1, "20_uri", 99, 0, 0);
  }
  if (key === "trap_count 1") {
    q.send("qcmd", 38, 3573);
    q.vars.goal = 3573;
  }
  if (key === "trap_count 2") {
    q.send("qcmd", 38, 3574);
    q.vars.goal = 3574;
  }
  if (key === "trap_count 3") {
    q.send("qcmd", 38, 3575);
    q.vars.goal = 3575;
  }
  if (key === "trap_count 4") {
    q.send("qcmd", 38, 3576);
    q.vars.goal = 3576;
    q.xp(25, "trap_count");
    appear(q, "liza_2", "facesw");
    q.send("qcmdVT", 1, "30_uri", 1, 0, 0);
    q.send("qposturi", "/adventure1-returnofthephantoms/#30-rescuethebunnies/#0#101");
    q.send("qcmdVT", 1, "30_uri", 99, 0, 0);
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

// by hand: the passage chest's clothing (lib/prize-pools.js)
const {passageClothing} = require("../prize-pools.js");

module.exports = {
  defId: 14,
  title: "Return of the Phantoms (hard)",
  rooms: {
    start: {room: "adventures.room_adventure_1x", name: "On An Adventure", nameStringId: 18324, music: "ajq_musquest"},
    spawn_1_a: {room: "adventures.room_adventure_1a", name: "On An Adventure", nameStringId: 18324, music: "ajq_musbunnyburrow"},
    spawn_1a: {room: "adventures.room_adventure_1x", name: "On An Adventure", nameStringId: 18324, music: "ajq_musquest"},
    // by hand: behind the arctic wolves' passage, and back (its music not recorded: a guess)
    spawn_1_b: {room: "adventures.room_adventure_1b", name: "On An Adventure", nameStringId: 18324, music: "ajq_musquest"},
    spawn_1b: {room: "adventures.room_adventure_1x", name: "On An Adventure", nameStringId: 18324, music: "ajq_musquest"},
  },
  written: "2026-11-11 18:10:37",
  objective: 3465,
  lobby: true, // the "waiting for players" screen first, as on the official server

  // name, type, def, state, visible, needs a click, path, artwork state
  actors: [
    ["queststart", 18, 0, 0, 1, 1, "", ""],
    ["questready", 7, 0, 0, 1, 1, "", ""],
    ["checkpoint2", 27, 0, 0, 1, 1, "", ""],
    ["checkpoint4", 27, 0, 0, 1, 1, "", ""],
    ["start_init", 8, 0, 0, 0, 1, "", ""],
    ["water_time", 8, 0, 0, 0, 1, "", ""],
    ["bunnytimer_1", 8, 0, 0, 0, 1, "", ""],
    ["bunnytimer_2", 8, 0, 0, 0, 1, "", ""],
    ["bunnytimer_3", 8, 0, 0, 0, 1, "", ""],
    ["bunnytimer_4", 8, 0, 0, 0, 1, "", ""],
    ["blocktimer_1", 8, 0, 0, 0, 1, "", ""],
    ["phan_timer_1", 8, 0, 0, 0, 1, "", ""],
    ["gifttimer", 8, 0, 0, 0, 1, "", ""],
    ["players", 7, 0, 0, 1, 1, "", ""],
    ["waterdone", 7, 0, 0, 1, 1, "", ""],
    ["watervar", 7, 0, 0, 0, 1, "", ""],
    ["flower_count", 7, 0, 0, 0, 1, "", ""],
    ["trap_count", 7, 0, 0, 0, 1, "", ""],
    ["spawn_1_a", 9, 1, 0, 1, 1, "", ""],
    ["trig_1_a", 3, 0, 0, 1, 1, "", ""],
    ["spawn_1a", 9, 0, 0, 1, 1, "", ""],
    ["trig_1a", 3, 0, 0, 0, 1, "", ""],
    ["spawn_1_b", 9, 2, 0, 1, 1, "", ""],
    ["trig_1_b", 3, 0, 0, 1, 1, "", ""],
    ["spawn_1b", 9, 0, 0, 1, 1, "", ""],
    ["trig_1b", 3, 0, 0, 1, 1, "", ""],
    ["liza_1", 1, 21, 0, 0, 1, "", ""],
    ["liza_2", 1, 21, 0, 0, 1, "", ""],
    ["bunny_1", 1, 88, 0, 1, 1, "", "facesw"],
    ["bunny_2", 1, 89, 0, 1, 1, "", ""],
    ["bunny_3", 1, 90, 0, 1, 1, "", "facesw"],
    ["bunnytrig_3", 3, 0, 0, 1, 1, "", ""],
    ["bunny_4", 1, 91, 0, 1, 1, "", "facesw"],
    ["bunny_5", 1, 92, 0, 1, 1, "", ""],
    ["bunny_6", 1, 93, 0, 1, 1, "", ""],
    ["bunny_7", 1, 94, 0, 1, 1, "", ""],
    ["bunny_8", 1, 95, 0, 1, 1, "", ""],
    ["bunny_9", 1, 96, 0, 1, 1, "", "facesw"],
    ["bunny_10", 1, 97, 0, 1, 1, "", "facesw"],
    ["bunny_11", 1, 98, 0, 1, 1, "", ""],
    ["bunny_12", 1, 101, 0, 1, 1, "", "facesw"],
    ["nobody_home", 1, 44, 0, 1, 1, "", ""],
    ["pipeinfo_1", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo_2", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo_3", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo_4", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo_5", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo_6", 1, 116, 0, 0, 1, "", ""],
    ["pipetrig_1", 1, 69, 0, 0, 1, "", ""],
    ["pipetrig_2", 1, 69, 0, 0, 1, "", ""],
    ["pipetrig_3", 1, 69, 0, 0, 1, "", ""],
    ["pipetrig_4", 1, 69, 0, 0, 1, "", ""],
    ["pipetrig_5", 1, 69, 0, 0, 1, "", ""],
    ["pipetrig_6", 1, 69, 0, 0, 1, "", ""],
    ["flowerinfo_1", 1, 116, 0, 0, 1, "", ""],
    ["flowerinfo_2", 1, 116, 0, 0, 1, "", ""],
    ["flowerinfo_3", 1, 116, 0, 0, 1, "", ""],
    ["flowerinfo_4", 1, 116, 0, 0, 1, "", ""],
    ["flowerinfo_5", 1, 116, 0, 0, 1, "", ""],
    ["flowerinfo_6", 1, 116, 0, 0, 1, "", ""],
    ["flowerinfo_7", 1, 116, 0, 0, 1, "", ""],
    ["flowerinfo_8", 1, 116, 0, 0, 1, "", ""],
    ["flowerinfo_9", 1, 116, 0, 0, 1, "", ""],
    ["flowerinfo10", 1, 116, 0, 0, 1, "", ""],
    ["flowerinfo11", 1, 116, 0, 0, 1, "", ""],
    ["flowerinfo12", 1, 116, 0, 0, 1, "", ""],
    ["flowertrig_1", 1, 67, 0, 0, 1, "", ""],
    ["flowertrig_2", 1, 67, 0, 0, 1, "", ""],
    ["flowertrig_3", 1, 67, 0, 0, 1, "", ""],
    ["flowertrig_4", 1, 67, 0, 0, 1, "", ""],
    ["flowertrig_5", 1, 67, 0, 0, 1, "", ""],
    ["flowertrig_6", 1, 67, 0, 0, 1, "", ""],
    ["flowertrig_7", 1, 67, 0, 0, 1, "", ""],
    ["flowertrig_8", 1, 67, 0, 0, 1, "", ""],
    ["flowertrig_9", 1, 67, 0, 0, 1, "", ""],
    ["flowertrig10", 1, 67, 0, 0, 1, "", ""],
    ["flowertrig11", 1, 67, 0, 0, 1, "", ""],
    ["flowertrig12", 1, 67, 0, 0, 1, "", ""],
    ["plant_1", 21, 100, 0, 1, 1, "", ""],
    ["plant_2", 21, 100, 0, 1, 1, "", ""],
    ["plant_3", 21, 100, 0, 1, 1, "", ""],
    ["plant_4", 21, 100, 0, 1, 1, "", ""],
    ["plant_5", 21, 100, 0, 1, 1, "", ""],
    ["plant_6", 21, 100, 0, 1, 1, "", ""],
    ["plant_7", 21, 100, 0, 1, 1, "", ""],
    ["plant_8", 21, 100, 0, 1, 1, "", ""],
    ["plant_9", 21, 100, 0, 1, 1, "", ""],
    ["plant_10", 21, 100, 0, 1, 1, "", ""],
    ["plant_11", 21, 100, 0, 1, 1, "", ""],
    ["plant_12", 21, 100, 0, 1, 1, "", ""],
    ["plant_13", 21, 100, 0, 1, 1, "", ""],
    ["plant_14", 21, 100, 0, 1, 1, "", ""],
    ["plant_15", 21, 100, 0, 1, 1, "", ""],
    ["plant_16", 21, 100, 0, 1, 1, "", ""],
    ["plant_17", 21, 100, 0, 1, 1, "", ""],
    ["plant_18", 21, 100, 0, 1, 1, "", ""],
    ["path_1", 20, 0, 0, 0, 1, "", ""],
    ["path_2", 20, 0, 0, 0, 1, "", ""],
    ["path_2_h", 20, 0, 0, 0, 1, "", ""],
    ["path_3", 20, 0, 0, 0, 1, "", ""],
    ["path_3_h", 20, 0, 0, 0, 1, "", ""],
    ["path_5", 20, 0, 0, 0, 1, "", ""],
    ["path_5_h", 20, 0, 0, 0, 1, "", ""],
    ["path_6", 20, 0, 0, 0, 1, "", ""],
    ["path_7", 20, 0, 0, 0, 1, "", ""],
    ["path_8a", 20, 0, 0, 0, 1, "", ""],
    ["path_8b", 20, 0, 0, 0, 1, "", ""],
    ["path_9", 20, 0, 0, 0, 1, "", ""],
    ["path_9_h", 20, 0, 0, 0, 1, "", ""],
    ["path_11", 20, 0, 0, 0, 1, "", ""],
    ["path_11_h", 20, 0, 0, 0, 1, "", ""],
    ["path_12", 20, 0, 0, 0, 1, "", ""],
    ["path_12_h", 20, 0, 0, 0, 1, "", ""],
    ["path_13_h", 20, 0, 0, 0, 1, "", ""],
    ["path_14_h", 20, 0, 0, 0, 1, "", ""],
    ["path_15_h", 20, 0, 0, 0, 1, "", ""],
    ["path_17_h", 20, 0, 0, 0, 1, "", ""],
    ["path_18_h", 20, 0, 0, 0, 1, "", ""],
    ["path_19_h", 20, 0, 0, 0, 1, "", ""],
    ["pail_1", 17, 1955, 0, 0, 1, "", ""],
    ["pail_2", 17, 1955, 0, 0, 1, "", ""],
    ["pail_3", 17, 1955, 0, 0, 1, "", ""],
    ["cork_1", 15, 1937, 0, 0, 1, "", ""],
    ["cork_2a", 15, 1937, 0, 0, 1, "", ""],
    ["cork_2a_h", 15, 1937, 0, 0, 1, "", ""],
    ["cork_2b", 15, 1937, 0, 0, 1, "", ""],
    ["cork_2b_h", 15, 1937, 0, 0, 1, "", ""],
    ["cork_2c", 15, 1937, 0, 0, 1, "", ""],
    ["cork_2c_h", 15, 1937, 0, 0, 1, "", ""],
    ["cork_3a", 15, 1937, 0, 0, 1, "", ""],
    ["cork_3a_h", 15, 1937, 0, 0, 1, "", ""],
    ["cork_3b", 15, 1937, 0, 0, 1, "", ""],
    ["cork_3b_h", 15, 1937, 0, 0, 1, "", ""],
    ["cork_3c", 15, 1937, 0, 0, 1, "", ""],
    ["cork_3c_h", 15, 1937, 0, 0, 1, "", ""],
    ["cork_4a", 15, 1937, 0, 0, 1, "", ""],
    ["cork_4a_h", 15, 1937, 0, 0, 1, "", ""],
    ["cork_4b", 15, 1937, 0, 0, 1, "", ""],
    ["cork_4b_h", 15, 1937, 0, 0, 1, "", ""],
    ["cork_4c", 15, 1937, 0, 0, 1, "", ""],
    ["cork_4c_h", 15, 1937, 0, 0, 1, "", ""],
    ["cork_5a_h", 15, 1937, 0, 0, 1, "", ""],
    ["cork_5b_h", 15, 1937, 0, 0, 1, "", ""],
    ["cork_5c_h", 15, 1937, 0, 0, 1, "", ""],
    ["cork_6a_h", 15, 1937, 0, 0, 1, "", ""],
    ["cork_6b_h", 15, 1937, 0, 0, 1, "", ""],
    ["cork_6c_h", 15, 1937, 0, 0, 1, "", ""],
    ["spawn_1", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["spawn_2", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["spawn_3", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["spawn_4", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["waterfall", 16, "ajq_waterfall_lp", 0, 0, 1, "", ""],
    ["sludgewall", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge_1", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge_2", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge_3", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge_4", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge_5", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge_6", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["portal", 16, "ajq_portalgatelp", 0, 0, 1, "", ""],
    ["diffvol_1", 5, 0, 0, 1, 1, "", ""],
    ["diffvol_2", 5, 0, 0, 1, 1, "", ""],
    ["diffvol_3", 5, 0, 0, 1, 1, "", ""],
    ["bunnyblocker", 5, 0, 0, 1, 1, "", ""],
    ["phan_block_e", 5, 0, 0, 1, 1, "", ""],
    ["phan_block_h", 5, 0, 0, 1, 1, "", ""],
    ["watervol_1", 5, 0, 0, 1, 1, "", ""],
    ["vineblock_1", 5, 0, 0, 1, 1, "", ""],
    ["vineblock_2", 5, 0, 0, 1, 1, "", ""],
    ["blocker_h", 5, 0, 0, 1, 1, "", ""],
    ["blocker_e", 5, 0, 0, 1, 1, "", ""],
    ["exit_block", 5, 0, 0, 1, 1, "", ""],
    ["bunnyvol_1", 5, 0, 0, 1, 1, "", ""],
    ["bunnytrig_1", 1, 45, 0, 1, 1, "", ""],
    ["cheatchq", 3, 0, 0, 1, 1, "", ""],
    ["phan_trig_e", 1, 44, 0, 1, 1, "", ""],
    ["phan_trig_h", 1, 44, 0, 1, 1, "", ""],
    ["phan_key_1", 15, 1912, 0, 0, 1, "", ""],
    ["cage10_f", 2, 0, 0, 1, 1, "", ""],
    ["cage10_b", 2, 0, 0, 1, 1, "", ""],
    ["cage9_f", 2, 0, 0, 1, 1, "", ""],
    ["cage9_b", 2, 0, 0, 1, 1, "", ""],
    ["cage8_f", 2, 0, 0, 1, 1, "", ""],
    ["cage8_b", 2, 0, 0, 1, 1, "", ""],
    ["cage7_f", 2, 0, 0, 1, 1, "", ""],
    ["cage7_b", 2, 0, 0, 1, 1, "", ""],
    ["burrow_door", 2, 0, 0, 1, 1, "", ""],
    ["bunnytile_1", 2, 0, 0, 1, 1, "", ""],
    ["bunnyblock_1", 2, 0, 0, 1, 1, "", ""],
    ["phan_door_e", 2, 0, 0, 1, 1, "", ""],
    ["phan_door_h", 2, 0, 0, 1, 1, "", ""],
    ["vine_1", 2, 0, 0, 1, 1, "", ""],
    ["vine_2", 2, 0, 0, 1, 1, "", ""],
    ["well_1", 2, 0, 0, 1, 1, "", ""],
    ["well_1h", 2, 0, 0, 1, 1, "", ""],
    ["water_1", 2, 0, 0, 1, 1, "", ""],
    ["easy", 2, 0, 0, 1, 1, "", ""],
    ["hard", 2, 0, 0, 1, 1, "", ""],
    ["pipe_1", 2, 0, 0, 1, 1, "", ""],
    ["pipe_2", 2, 0, 0, 1, 1, "", ""],
    ["pipe_3", 2, 0, 0, 1, 1, "", ""],
    ["pipe_4", 2, 0, 0, 1, 1, "", ""],
    ["pipe_5", 2, 0, 0, 1, 1, "", ""],
    ["pipe_6", 2, 0, 0, 1, 1, "", ""],
    ["flowers_1", 2, 0, 0, 1, 1, "", ""],
    ["flowers_2", 2, 0, 0, 1, 1, "", ""],
    ["flowers_3", 2, 0, 0, 1, 1, "", ""],
    ["flowers_4", 2, 0, 0, 1, 1, "", ""],
    ["flowers_5", 2, 0, 0, 1, 1, "", ""],
    ["flowers_6", 2, 0, 0, 1, 1, "", ""],
    ["flowers_7", 2, 0, 0, 1, 1, "", ""],
    ["flowers_8", 2, 0, 0, 1, 1, "", ""],
    ["flowers_9", 2, 0, 0, 1, 1, "", ""],
    ["flowers_10", 2, 0, 0, 1, 1, "", ""],
    ["flowers_11", 2, 0, 0, 1, 1, "", ""],
    ["flowers_12", 2, 0, 0, 1, 1, "", ""],
    ["exit_port", 2, 0, 0, 1, 1, "", ""],
    ["phantom_1", 11, 2, 0, 0, 1, "", ""],
    ["phantom_2", 11, 2, 0, 0, 1, "", ""],
    ["phantom_2_h", 11, 2, 0, 0, 1, "", ""],
    ["phantom_3", 11, 2, 0, 0, 1, "", ""],
    ["phantom_3_h", 11, 2, 0, 0, 1, "", ""],
    ["phantom_4", 11, 2, 0, 0, 1, "", ""],
    ["phantom_5__a", 11, 2, 0, 0, 1, "", ""],
    ["phantom_5__b", 11, 2, 0, 0, 1, "", ""],
    ["phantom_5__c", 11, 2, 0, 0, 1, "", ""],
    ["phantom_5_h", 11, 2, 0, 0, 1, "", ""],
    ["phantom_6", 11, 2, 0, 0, 1, "", ""],
    ["phantom_7", 11, 2, 0, 0, 1, "", ""],
    ["phantom_8__a", 11, 2, 0, 0, 1, "", ""],
    ["phantom_8__b", 11, 2, 0, 0, 1, "", ""],
    ["phantom_9", 11, 2, 0, 0, 1, "", ""],
    ["phantom_9a_h", 11, 2, 0, 0, 1, "", ""],
    ["phantom_9b_h", 11, 2, 0, 0, 1, "", ""],
    ["phantom_9c_h", 11, 2, 0, 0, 1, "", ""],
    ["phantom_10", 11, 2, 0, 0, 1, "", ""],
    ["phantom_11", 11, 2, 0, 0, 1, "", ""],
    ["phantom_11_h", 11, 2, 0, 0, 1, "", ""],
    ["phantom_12", 11, 2, 0, 0, 1, "", ""],
    ["phantom_12_h", 11, 2, 0, 0, 1, "", ""],
    ["phantom_13", 11, 2, 0, 0, 1, "", ""],
    ["phantom_13_h", 11, 2, 0, 0, 1, "", ""],
    ["phantom_14", 11, 2, 0, 0, 1, "", ""],
    ["phantom_14_h", 11, 2, 0, 0, 1, "", ""],
    ["phantom_15", 11, 2, 0, 0, 1, "", ""],
    ["phantom_15_h", 11, 2, 0, 0, 1, "", ""],
    ["phantom_16_h", 11, 2, 0, 0, 1, "", ""],
    ["phantom_17_h", 11, 2, 0, 0, 1, "", ""],
    ["phantom_18_h", 11, 2, 0, 0, 1, "", ""],
    ["phantom_19_h", 11, 2, 0, 0, 1, "", ""],
    ["phantoff1", 8, 0, 0, 0, 1, "", ""],
    ["phantoff2", 8, 0, 0, 0, 1, "", ""],
    ["phantoff2h", 8, 0, 0, 0, 1, "", ""],
    ["phantoff3", 8, 0, 0, 0, 1, "", ""],
    ["phantoff3h", 8, 0, 0, 0, 1, "", ""],
    ["phantoff4", 8, 0, 0, 0, 1, "", ""],
    ["phantoff5a", 8, 0, 0, 0, 1, "", ""],
    ["phantoff5b", 8, 0, 0, 0, 1, "", ""],
    ["phantoff5c", 8, 0, 0, 0, 1, "", ""],
    ["phantoff5h", 8, 0, 0, 0, 1, "", ""],
    ["phantoff6", 8, 0, 0, 0, 1, "", ""],
    ["phantoff7", 8, 0, 0, 0, 1, "", ""],
    ["phantoff8a", 8, 0, 0, 0, 1, "", ""],
    ["phantoff8b", 8, 0, 0, 0, 1, "", ""],
    ["phantoff9", 8, 0, 0, 0, 1, "", ""],
    ["phantoff9a", 8, 0, 0, 0, 1, "", ""],
    ["phantoff9b", 8, 0, 0, 0, 1, "", ""],
    ["phantoff9c", 8, 0, 0, 0, 1, "", ""],
    ["phantoff10", 8, 0, 0, 0, 1, "", ""],
    ["phantoff11", 8, 0, 0, 0, 1, "", ""],
    ["phantoff11h", 8, 0, 0, 0, 1, "", ""],
    ["phantoff12", 8, 0, 0, 0, 1, "", ""],
    ["phantoff12h", 8, 0, 0, 0, 1, "", ""],
    ["phantoff13", 8, 0, 0, 0, 1, "", ""],
    ["phantoff13h", 8, 0, 0, 0, 1, "", ""],
    ["phantoff14", 8, 0, 0, 0, 1, "", ""],
    ["phantoff14h", 8, 0, 0, 0, 1, "", ""],
    ["phantoff15", 8, 0, 0, 0, 1, "", ""],
    ["phantoff15h", 8, 0, 0, 0, 1, "", ""],
    ["phantoff16h", 8, 0, 0, 0, 1, "", ""],
    ["phantoff17h", 8, 0, 0, 0, 1, "", ""],
    ["phantoff18h", 8, 0, 0, 0, 1, "", ""],
    ["phantoff19h", 8, 0, 0, 0, 1, "", ""],
    ["treasure_1", 13, 39, 0, 1, 1, "", ""],
    ["treasure_2", 13, 39, 0, 1, 1, "", ""],
    ["treasure_3", 13, 39, 0, 1, 1, "", ""],
    ["treasure_4", 13, 39, 0, 1, 1, "", ""],
    ["treasure_5", 13, 39, 0, 1, 1, "", ""],
    ["treasure_6", 13, 39, 0, 1, 1, "", ""],
    ["treasure_7", 13, 39, 0, 1, 1, "", ""],
    ["bunny_key_1a", 15, 1912, 0, 0, 1, "", ""],
    ["bunny_key_1b", 15, 1912, 0, 0, 1, "", ""],
    ["bunny_key_1c", 15, 1912, 0, 0, 1, "", ""],
    ["bunny_key_1d", 15, 1912, 0, 0, 1, "", ""],
    ["bunny_key_1e", 15, 1912, 0, 0, 1, "", ""],
    ["bunny_key_1f", 15, 1912, 0, 0, 1, "", ""],
    ["bunny_key_2a", 15, 1912, 0, 0, 1, "", ""],
    ["bunny_key_2b", 15, 1912, 0, 0, 1, "", ""],
    ["bunny_key_2c", 15, 1912, 0, 0, 1, "", ""],
    ["bunny_key_2d", 15, 1912, 0, 0, 1, "", ""],
    ["bunny_key_2e", 15, 1912, 0, 0, 1, "", ""],
    ["bunny_key_2f", 15, 1912, 0, 0, 1, "", ""],
    ["bunny_key_3a", 15, 1912, 0, 0, 1, "", ""],
    ["bunny_key_3b", 15, 1912, 0, 0, 1, "", ""],
    ["bunny_key_3c", 15, 1912, 0, 0, 1, "", ""],
    ["bunny_key_3d", 15, 1912, 0, 0, 1, "", ""],
    ["bunny_key_3e", 15, 1912, 0, 0, 1, "", ""],
    ["bunny_key_3f", 15, 1912, 0, 0, 1, "", ""],
    ["bunny_key_4a", 15, 1912, 0, 0, 1, "", ""],
    ["bunny_key_4b", 15, 1912, 0, 0, 1, "", ""],
    ["bunny_key_4c", 15, 1912, 0, 0, 1, "", ""],
    ["bunny_key_4d", 15, 1912, 0, 0, 1, "", ""],
    ["bunny_key_4e", 15, 1912, 0, 0, 1, "", ""],
    ["bunny_key_4f", 15, 1912, 0, 0, 1, "", ""],
    ["exit_vol", 3, 0, 0, 1, 1, "", ""],
    ["secret_1", 3, 0, 0, 1, 1, "", ""],
    ["secret_2", 3, 0, 0, 1, 1, "", ""],
    ["00_uri", 7, 0, 0, 0, 1, "", ""],
    ["10_uri", 7, 0, 0, 0, 1, "", ""],
    ["20_uri", 7, 0, 0, 0, 1, "", ""],
    ["30_uri", 7, 0, 0, 0, 1, "", ""],
    ["40_uri", 7, 0, 0, 0, 1, "", ""],
    ["playermember", 7, 0, 0, 1, 1, "", ""],
    ["diff_level", 7, 0, 0, 1, 1, "", ""],
    ["live_players", 7, 0, 1, 0, 1, "", ""],
  ],

  on: {
    // walked into, or clicked
    trigger: {
      treasure_1(q) {
        q.send("qatt", "treasure_1", 3, 50, 0, 1); // the chest opens
      },
      treasure_2(q) {
        q.send("qatt", "treasure_2", 3, 200, 0, 1); // the chest opens
      },
      treasure_3(q) {
        q.send("qatt", "treasure_3", 3, 200, 0, 1); // the chest opens
      },
      treasure_4(q) {
        q.send("qatt", "treasure_4", 3, 100, 0, 1); // the chest opens
      },
      treasure_5(q) {
        // by hand: the arctic wolves' passage's chest holds clothing (the wiki's list), not gems
        q.send("qatt", "treasure_5", 2, ...passageClothing(q, "treasure_5", {hard: true}), 1); // the chest opens
      },
      treasure_6(q) {
        q.send("qatt", "treasure_6", 3, 400, 0, 1); // the chest opens
      },
      treasure_7(q) {
        q.send("qatt", "treasure_7", 3, 300, 0, 1); // the chest opens
      },
      nobody_home(q) {
        // step 1
        q.send("qcmd", 2, "nobody_home", 3464, 0);
      },
      bunnytrig_3(q) {
        // step 2
        // what bunny_3 says depends on how far the adventure is (the line at the top)
        q.send("qcmd", 2, "bunny_3", ({3486: 3506})[q.vars.goal || OBJECTIVE] || 3469, 1);
      },
      phantom_5__c__give_gem(q) {
        // step 3: once
        if (once(q, "step3")) {
          q.send("qad", "phantom_5__c__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phan_trig_h(q) {
        const held = q.held(); // what the player carried when this fired
        // step 4: unless holding phan_key_1
        if (held !== "phan_key_1") {
          q.send("qcmd", 2, "phan_trig_h", 3060, 0);
        }
        // step 21: only while holding phan_key_1, once
        if (held === "phan_key_1" && once(q, "step21")) {
          q.use();
          set(q, "phan_door_h", 1, 1, 0);
          set(q, "phan_trig_h", 1, 0, 0);
          q.xp(15, "phan_trig_h");
          q.send("qcmd", 38, 3490);
          q.vars.goal = 3490;
          q.send("qsp", "phantom_1", "path_1");
          set(q, "phantom_1", 1, 1, 1);
          q.send("qsp", "phantom_6", "path_6");
          set(q, "phantom_6", 1, 1, 1);
          q.send("qsp", "phantom_7", "path_7");
          set(q, "phantom_7", 1, 1, 1);
          set(q, "phantom_10", 1, 1, 1);
          q.send("qsp", "phantom_11", "path_1");
          set(q, "phantom_11", 1, 1, 1);
          q.send("qsp", "phantom_12", "path_12");
          set(q, "phantom_12", 1, 1, 1);
          set(q, "phantom_13", 1, 1, 1);
          set(q, "phantom_14", 1, 1, 1);
          set(q, "phantom_15", 1, 1, 1);
          q.send("qsp", "phantom_11_h", "path_11_h");
          set(q, "phantom_11_h", 1, 1, 1);
          q.send("qsp", "phantom_12_h", "path_12_h");
          set(q, "phantom_12_h", 1, 1, 1);
          q.send("qsp", "phantom_13_h", "path_13_h");
          set(q, "phantom_13_h", 1, 1, 1);
          q.send("qsp", "phantom_14_h", "path_14_h");
          set(q, "phantom_14_h", 1, 1, 1);
          q.send("qsp", "phantom_15_h", "path_15_h");
          set(q, "phantom_15_h", 1, 1, 1);
          q.send("qsp", "phantom_17_h", "path_17_h");
          set(q, "phantom_17_h", 1, 1, 1);
          q.send("qsp", "phantom_18_h", "path_18_h");
          set(q, "phantom_18_h", 1, 1, 1);
          q.send("qsp", "phantom_19_h", "path_19_h");
          set(q, "phantom_19_h", 1, 1, 1);
          q.after(2220, () => {
            set(q, "phan_block_h", 1, 0, 0);
          });
        }
      },
      questready(q) {
        const n = tally(q, "trigger questready");
        // step 7: the 1st time
        if (n === 1) {
          q.send("qcmdVT", 1, "start_init", 1, 0, 0);
          q.after(390, () => {
            appear(q, "liza_1", "facesw");
            set(q, "well_1", 1, 1, 0);
            set(q, "water_1", 1, 1, 0);
            set(q, "flowers_1", 1, 1, 0);
            set(q, "flowers_2", 1, 1, 0);
            set(q, "flowers_3", 1, 1, 0);
            set(q, "flowers_4", 1, 1, 0);
            set(q, "flowers_9", 1, 1, 0);
            set(q, "flowers_10", 1, 1, 0);
            set(q, "flowers_11", 1, 1, 0);
            set(q, "flowers_12", 1, 1, 0);
            set(q, "blocker_h", 99, 0, 0);
            set(q, "phan_trig_e", 99, 0, 0);
            set(q, "easy", 99, 0, 0);
            set(q, "phan_door_e", 99, 0, 0);
            set(q, "phan_block_e", 99, 0, 0);
            set(q, "treasure_1", 1, 1, 1);
            set(q, "treasure_2", 1, 1, 1);
            set(q, "treasure_3", 1, 1, 1);
            set(q, "treasure_4", 1, 1, 1);
            set(q, "treasure_5", 1, 1, 1);
            set(q, "treasure_6", 1, 1, 1);
            set(q, "treasure_7", 1, 1, 1);
            set(q, "checkpoint4", 99, 0, 0);
            set(q, "spawn_4", 99, 0, 0);
            set(q, "flowers_5", 1, 1, 0);
            set(q, "flowers_6", 1, 1, 0);
            set(q, "flowers_7", 1, 1, 0);
            set(q, "flowers_8", 1, 1, 0);
            set(q, "well_1h", 1, 1, 0);
            set(q, variant(q, "cork_2", "_h", "abc"), 1, 1, 0);
            set(q, variant(q, "cork_3", "_h", "abc"), 1, 1, 0);
            set(q, variant(q, "cork_4", "_h", "abc"), 1, 1, 0);
            set(q, variant(q, "cork_5", "_h", "abc"), 1, 1, 0);
            set(q, variant(q, "cork_6", "_h", "abc"), 1, 1, 0);
            set(q, variant(q, "bunny_key_1", "", "abcdef"), 1, 1, 0);
            set(q, variant(q, "bunny_key_2", "", "abcdef"), 1, 1, 0);
            set(q, variant(q, "bunny_key_3", "", "abcdef"), 1, 1, 0);
            set(q, variant(q, "bunny_key_4", "", "abcdef"), 1, 1, 0);
            set(q, "diffvol_1", 1, 0, 0);
            set(q, "diffvol_2", 1, 0, 0);
            set(q, "diffvol_3", 1, 0, 0);
          });
        }
      },
      liza_1(q) {
        // step 8
        q.send("qcmd", 3, 0, "liza_1", 1, 3461);
      },
      phantom_3__give_gem(q) {
        // step 10: once
        if (once(q, "step10")) {
          q.send("qad", "phantom_3__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phantom_2__give_gem(q) {
        // step 11: once
        if (once(q, "step11")) {
          q.send("qad", "phantom_2__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phantom_4__give_gem(q) {
        // step 12: once
        if (once(q, "step12")) {
          q.send("qad", "phantom_4__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phantom_8__a__give_gem(q) {
        // step 13: once
        if (once(q, "step13")) {
          q.send("qad", "phantom_8__a__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phantom_9__give_gem(q) {
        // step 14: once
        if (once(q, "step14")) {
          q.send("qad", "phantom_9__give_gem", 0, "null");
          q.gems(25);
        }
      },
      trig_1a(q) {
        // step 17
        q.room("spawn_1_a", "spawn_1_a");
      },
      trig_1_a(q) {
        // step 19
        q.room("spawn_1a", "spawn_1a");
      },
      // by hand: the arctic wolves' passage, into its own room and back
      trig_1b(q) {
        q.room("spawn_1_b", "spawn_1_b");
      },
      trig_1_b(q) {
        q.room("spawn_1b", "spawn_1b");
      },
      bunnytrig_1(q) {
        // step 22
        q.send("qcmd", 2, "bunnytrig_1", 3019, 0);
      },
      phantom_12__give_gem(q) {
        // step 23: once
        if (once(q, "step23")) {
          q.send("qad", "phantom_12__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phantom_11__give_gem(q) {
        // step 24: once
        if (once(q, "step24")) {
          q.send("qad", "phantom_11__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phantom_10__give_gem(q) {
        // step 25: once
        if (once(q, "step25")) {
          q.send("qad", "phantom_10__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phantom_15__give_gem(q) {
        // step 26: once
        if (once(q, "step26")) {
          q.send("qad", "phantom_15__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phantom_14__give_gem(q) {
        // step 27: once
        if (once(q, "step27")) {
          q.send("qad", "phantom_14__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phantom_7__give_gem(q) {
        // step 28: once
        if (once(q, "step28")) {
          q.send("qad", "phantom_7__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phantom_6__give_gem(q) {
        // step 29: once
        if (once(q, "step29")) {
          q.send("qad", "phantom_6__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phantom_19_h__give_gem(q) {
        // step 30: once
        if (once(q, "step30")) {
          q.send("qad", "phantom_19_h__give_gem", 0, "null");
          q.gems(25);
        }
      },
      liza_2(q) {
        // step 32
        q.send("qcmd", 3, 0, "liza_2", 1, 3495);
      },
      exit_vol(q) {
        // step 34
        q.send("qcmd", 19);
      },
    },

    // families of triggers: the rule for any of them; {n} is its number
    triggerLike: [
      [/^phantom_(\d+)__b__give_gem$/, (q, name) => {
        const n = name.match(/^phantom_(\d+)__b__give_gem$/)[1];
        // each of them, once each
        if (once(q, "phantom_#__b__give_gem - " + name)) {
          // step 35
          q.send("qad", `${name}`, 0, "null");
          q.gems(25);
        }
      }],
      [/^flowertrig_(\d+)$/, (q, name) => {
        const n = name.match(/^flowertrig_(\d+)$/)[1];
        const held = q.held(); // what the player carried when this fired
        // flowertrig_1, unless holding pail_#
        if (name === "flowertrig_1" && !/^pail_\d+[a-z]?$/.test(held || "")) {
          // step 36
          q.after(610, () => {
            set(q, "flowerinfo_1", 1, 1, 1);
            q.send("qcmd", 2, "flowerinfo_1", 3022, 2);
          });
        }
        // flowertrig_3, unless holding pail_#
        if (name === "flowertrig_3" && !/^pail_\d+[a-z]?$/.test(held || "")) {
          // step 37
          q.after(830, () => {
            set(q, "flowerinfo_3", 1, 1, 1);
            q.send("qcmd", 2, "flowerinfo_3", 3022, 2);
          });
        }
        // flowertrig_2, unless holding pail_#
        if (name === "flowertrig_2" && !/^pail_\d+[a-z]?$/.test(held || "")) {
          // step 38
          set(q, "flowerinfo_2", 1, 1, 1);
          q.send("qcmd", 2, "flowerinfo_2", 3022, 2);
        }
        // each of them, holding pail_#, once each
        if (/^pail_\d+[a-z]?$/.test(held || "") && once(q, "flowertrig_# pail_# " + name)) {
          // step 62
          q.use();
          set(q, `flowers_${n}`, 0, 1, 0);
          set(q, `${name}`, 2, 0, 0);
          q.send("qcmdVT", 1, "flower_count", bump(q, "flower_count"), 0, 0); // one more than last time
          counted(q, "flower_count"); // what that count sets off
          q.xp(5, `${name}`);
        }
      }],
      [/^bunny_(\d+)$/, (q, name) => {
        const n = name.match(/^bunny_(\d+)$/)[1];
        const held = q.held(); // what the player carried when this fired
        // bunny_11, the Nth time, unless holding bunny_key_#
        if (name === "bunny_11" && !/^bunny_key_\d+[a-z]?$/.test(held || "")) {
          const k = tally(q, "bunny_# - bunny_11");
          // step 39: the 1st time
          if (k === 1) {
            q.send("qcmd", 2, "bunny_11", 3583, 1);
          }
          // step 40: the 2nd time
          if (k === 2) {
            q.send("qcmd", 2, "bunny_11", 3583, 1);
            q.send("qcmd", 2, "bunny_11", 3583, 1);
            q.after(190, () => {
              q.send("qcmd", 2, "bunny_11", 3583, 1);
              q.send("qcmd", 2, "bunny_11", 3583, 1);
              q.send("qcmd", 2, "bunny_11", 3583, 1);
              q.send("qcmd", 2, "bunny_11", 3583, 1);
              q.send("qcmd", 2, "bunny_11", 3583, 1);
              q.send("qcmd", 2, "bunny_11", 3583, 1);
            });
          }
        }
        // bunny_1, unless holding bunny_key_#
        if (name === "bunny_1" && !/^bunny_key_\d+[a-z]?$/.test(held || "")) {
          // step 41
          q.send("qcmd", 2, "bunny_1", 3462, 1);
        }
        // bunny_2, the Nth time, unless holding bunny_key_#
        if (name === "bunny_2" && !/^bunny_key_\d+[a-z]?$/.test(held || "")) {
          const k = tally(q, "bunny_# - bunny_2");
          // step 42: the 1st time
          if (k === 1) {
            q.send("qcmd", 2, "bunny_2", 3463, 1);
            set(q, "bunny_2", 2, 1, 0);
            set(q, "cork_1", 1, 1, 0);
            q.after(980, () => {
              set(q, "pipetrig_1", 1, 1, 1);
              q.after(3000, () => {
                set(q, "bunny_2", 1, 1, 1);
                q.send("qcmd", 2, "bunny_2", 3467, 1);
                set(q, "bunny_2", 2, 1, 0);
                q.send("qcmdVT", 1, "watervar", 2, 0, 0);
                q.send("qcmd", 38, 3730);
                q.vars.goal = 3730;
                set(q, "pipetrig_2", 1, 1, 1);
                set(q, "pipetrig_3", 1, 1, 1);
                set(q, "pipetrig_4", 1, 1, 1);
                set(q, "pipetrig_5", 1, 1, 1);
                set(q, "pipetrig_6", 1, 1, 1);
              });
            });
          }
          // step 43: the 2nd time
          if (k === 2) {
            q.send("qcmd", 2, "bunny_2", 3471, 1);
          }
          // step 44: the 3rd time
          if (k === 3) {
            q.send("qcmd", 2, "bunny_2", 3471, 1);
          }
          // step 45: the 4th time
          if (k === 4) {
            q.send("qcmd", 2, "bunny_2", 3504, 1);
          }
        }
        // bunny_4, the Nth time, unless holding bunny_key_#
        if (name === "bunny_4" && !/^bunny_key_\d+[a-z]?$/.test(held || "")) {
          const k = tally(q, "bunny_# - bunny_4");
          // step 46: the 1st time
          if (k === 1) {
            q.send("qcmd", 2, "bunny_4", 3470, 1);
          }
          // step 47: the 2nd time
          if (k === 2) {
            q.send("qcmd", 2, "bunny_4", 3505, 1);
          }
        }
        // bunny_12, unless holding bunny_key_#
        if (name === "bunny_12" && !/^bunny_key_\d+[a-z]?$/.test(held || "")) {
          // step 48
          q.send("qcmd", 2, "bunny_12", 3603, 1);
        }
        // bunny_5, unless holding bunny_key_#
        if (name === "bunny_5" && !/^bunny_key_\d+[a-z]?$/.test(held || "")) {
          // step 49
          q.send("qcmd", 2, "bunny_5", 3487, 1);
        }
        // bunny_6, unless holding bunny_key_#
        if (name === "bunny_6" && !/^bunny_key_\d+[a-z]?$/.test(held || "")) {
          // step 50
          q.send("qcmd", 2, "bunny_6", 3488, 1);
          set(q, "bunny_6", 1, 1, 0);
          set(q, "phan_key_1", 1, 1, 0);
        }
        // bunny_10, unless holding bunny_key_#
        if (name === "bunny_10" && !/^bunny_key_\d+[a-z]?$/.test(held || "")) {
          // step 51
          q.send("qcmd", 2, "bunny_10", 3572, 1);
        }
        // bunny_8, unless holding bunny_key_#
        if (name === "bunny_8" && !/^bunny_key_\d+[a-z]?$/.test(held || "")) {
          // step 52
          q.send("qcmd", 2, "bunny_8", 3572, 1);
        }
        // bunny_3, unless holding bunny_key_#
        if (name === "bunny_3" && !/^bunny_key_\d+[a-z]?$/.test(held || "")) {
          // step 53
          q.after(260, () => {
            q.send("qcmd", 2, "bunny_3", 3506, 1);
          });
        }
        // each of them, holding bunny_key_#, once each
        if (/^bunny_key_\d+[a-z]?$/.test(held || "") && once(q, "bunny_# bunny_key_# " + name)) {
          // step 64
          q.use();
          q.xp(10, `${name}`);
          set(q, `cage${n}_f`, 1, 1, 0);
          set(q, `cage${n}_b`, 1, 1, 0);
          q.send("qswfs", `${name}`, "dance");
          set(q, `${name}`, 1, 1, 0);
          q.send("qcmdVT", 1, "trap_count", bump(q, "trap_count"), 0, 0); // one more than last time
          counted(q, "trap_count"); // what that count sets off
        }
        // bunny_7, holding bunny_key_#, once each
        if (name === "bunny_7" && /^bunny_key_\d+[a-z]?$/.test(held || "") && once(q, "bunny_# bunny_key_# bunny_7 " + name)) {
          // step 65
          q.send("qcmd", 2, "bunny_7", 3568, 1);
        }
        // bunny_9, holding bunny_key_#, once each
        if (name === "bunny_9" && /^bunny_key_\d+[a-z]?$/.test(held || "") && once(q, "bunny_# bunny_key_# bunny_9 " + name)) {
          // step 66
          q.send("qcmd", 2, "bunny_9", 3570, 1);
        }
        // bunny_10, holding bunny_key_#, once each
        if (name === "bunny_10" && /^bunny_key_\d+[a-z]?$/.test(held || "") && once(q, "bunny_# bunny_key_# bunny_10 " + name)) {
          // step 67
          q.send("qcmd", 2, "bunny_10", 3571, 1);
        }
        // bunny_8, holding bunny_key_#, once each
        if (name === "bunny_8" && /^bunny_key_\d+[a-z]?$/.test(held || "") && once(q, "bunny_# bunny_key_# bunny_8 " + name)) {
          // step 68
          q.send("qcmd", 2, "bunny_8", 3569, 1);
        }
      }],
      [/^secret_(\d+)$/, (q, name) => {
        const n = name.match(/^secret_(\d+)$/)[1];
        // each of them
        {
          // step 54
          q.send("qsnd", "ajq_mussecretareast");
        }
      }],
      [/^pipetrig_(\d+)$/, (q, name) => {
        const n = name.match(/^pipetrig_(\d+)$/)[1];
        const held = q.held(); // what the player carried when this fired
        // pipetrig_1, holding cork_#, once each
        if (name === "pipetrig_1" && /^cork_\d+[a-z]?$/.test(held || "") && once(q, "pipetrig_# cork_# pipetrig_1 " + name)) {
          // step 55
          q.use();
          set(q, "pipe_1", 1, 1, 0);
          set(q, "sludge_1", 1, 0, 0);
          set(q, "pipetrig_1", 2, 0, 0);
          q.send("qcmdVT", 1, "watervar", 1, 0, 0);
          q.send("qsp", "phantom_2", "path_2");
          set(q, "phantom_2", 1, 1, 1);
          q.send("qsp", "phantom_3", "path_3");
          set(q, "phantom_3", 1, 1, 1);
          set(q, "phantom_4", 1, 1, 1);
          q.send("qsp", "phantom_2_h", "path_2_h");
          set(q, "phantom_2_h", 1, 1, 1);
          q.send("qsp", "phantom_3_h", "path_3_h");
          set(q, "phantom_3_h", 1, 1, 1);
          q.send("qsp", "phantom_5_h", "path_5_h");
          set(q, "phantom_5_h", 1, 1, 1);
          q.send("qsp", "phantom_5__a", "path_5");
          set(q, "phantom_5__a", 1, 1, 1);
          q.send("qsp", "phantom_5__b", "path_5");
          set(q, "phantom_5__b", 1, 1, 1);
          q.send("qsp", "phantom_5__c", "path_5");
          set(q, "phantom_5__c", 1, 1, 1);
          q.send("qsp", "phantom_8__b", "path_8b");
          set(q, "phantom_8__b", 1, 1, 1);
          q.send("qsp", "phantom_8__a", "path_8a");
          set(q, "phantom_8__a", 1, 1, 1);
          q.send("qsp", "phantom_9", "path_9");
          set(q, "phantom_9", 1, 1, 1);
          q.send("qsp", "phantom_9a_h", "path_9_h");
          set(q, "phantom_9a_h", 1, 1, 1);
          q.send("qsp", "phantom_9b_h", "path_9_h");
          set(q, "phantom_9b_h", 1, 1, 1);
          q.send("qsp", "phantom_9c_h", "path_9_h");
          set(q, "phantom_9c_h", 1, 1, 1);
          set(q, "phantom_16_h", 1, 1, 1);
          q.xp(5, "pipetrig_1");
        }
        // in the order they are done, holding cork_#_h, once each
        if (/^cork_\d+[a-z]?_h$/.test(held || "") && once(q, "pipetrig_# cork_#_h " + name)) {
          const k = tally(q, "pipetrig_# cork_#_h");
          // step 56: the 1st one done
          if (k === 1) {
            q.use();
            set(q, `pipe_${n}`, 1, 1, 0);
            set(q, `sludge_${n}`, 1, 0, 0);
            set(q, `${name}`, 2, 0, 0);
            q.send("qcmdVT", 1, "watervar", 3, 0, 0);
            q.send("qcmd", 38, 3729);
            q.vars.goal = 3729;
            q.xp(5, `${name}`);
          }
          // step 57: the 2nd one done
          if (k === 2) {
            q.use();
            set(q, `pipe_${n}`, 1, 1, 0);
            set(q, `sludge_${n}`, 1, 0, 0);
            set(q, `${name}`, 2, 0, 0);
            q.send("qcmdVT", 1, "watervar", 4, 0, 0);
            q.send("qcmd", 38, 3472);
            q.vars.goal = 3472;
            q.xp(5, `${name}`);
          }
          // step 58: the 3rd one done
          if (k === 3) {
            q.use();
            set(q, `pipe_${n}`, 1, 1, 0);
            set(q, `sludge_${n}`, 1, 0, 0);
            set(q, `pipeinfo_${n}`, 0, 0, 0);
            set(q, `${name}`, 2, 0, 0);
            q.send("qcmdVT", 1, "watervar", 5, 0, 0);
            q.send("qcmd", 38, 3546);
            q.vars.goal = 3546;
            q.xp(5, `${name}`);
          }
          // step 59: the 4th one done
          if (k === 4) {
            q.use();
            set(q, `pipe_${n}`, 1, 1, 0);
            set(q, `sludge_${n}`, 1, 0, 0);
            set(q, `${name}`, 2, 0, 0);
            q.send("qcmdVT", 1, "watervar", 6, 0, 0);
            q.send("qcmd", 38, 3547);
            q.vars.goal = 3547;
            q.xp(5, `${name}`);
          }
          // step 60: the 5th one done
          if (k === 5) {
            q.use();
            set(q, `pipe_${n}`, 1, 1, 0);
            set(q, `sludge_${n}`, 1, 0, 0);
            set(q, `${name}`, 2, 0, 0);
            q.send("qcmdVT", 1, "watervar", 7, 0, 0);
            set(q, "sludgewall", 1, 0, 0);
            set(q, "waterfall", 1, 1, 0);
            set(q, "water_1", 0, 1, 0);
            set(q, "well_1", 0, 1, 0);
            set(q, "pail_1", 1, 1, 0);
            set(q, "pail_2", 1, 1, 0);
            q.send("qcmd", 38, 3474);
            q.vars.goal = 3474;
            set(q, "well_1h", 0, 1, 0);
            set(q, "pail_3", 1, 1, 0);
            set(q, "flowertrig_5", 1, 1, 1);
            set(q, `flowertrig_${n}`, 1, 1, 1);
            set(q, "flowertrig_7", 1, 1, 1);
            set(q, "flowertrig_8", 1, 1, 1);
            set(q, "watervol_1", 1, 0, 0);
            set(q, "flowertrig_1", 1, 1, 1);
            set(q, "flowertrig_2", 1, 1, 1);
            set(q, "flowertrig_3", 1, 1, 1);
            set(q, "flowertrig_4", 1, 1, 1);
            set(q, "flowertrig_9", 1, 1, 1);
            set(q, "flowertrig10", 1, 1, 1);
            set(q, "flowertrig11", 1, 1, 1);
            set(q, "flowertrig12", 1, 1, 1);
            set(q, "bunny_2", 3, 1, 1);
            set(q, "bunny_1", 2, 1, 1);
            q.xp(15, "waterdone");
            q.send("qcmdVT", 1, "10_uri", 1, 0, 0);
            q.send("qposturi", "/adventure1-returnofthephantoms/#10-plugthepipes/#0#101");
            q.send("qcmdVT", 1, "10_uri", 99, 0, 0);
            q.xp(5, `${name}`);
            q.after(2620, () => {
              q.send("qsnd", "ajq_riverclear");
            });
          }
        }
        // pipetrig_4, unless holding cork_# or cork_#_h
        if (name === "pipetrig_4" && !/^cork_\d+[a-z]?$/.test(held || "") && !/^cork_\d+[a-z]?_h$/.test(held || "")) {
          // step 61
          set(q, "pipeinfo_4", 1, 1, 1);
          q.send("qcmd", 2, "pipeinfo_4", 3468, 2);
        }
      }],
      [/^flowertrig(\d+)$/, (q, name) => {
        const n = name.match(/^flowertrig(\d+)$/)[1];
        const held = q.held(); // what the player carried when this fired
        // each of them, holding pail_#, once each
        if (/^pail_\d+[a-z]?$/.test(held || "") && once(q, "flowertrig# pail_# " + name)) {
          // step 63
          q.use();
          set(q, `flowers_${n}`, 0, 1, 0);
          set(q, `${name}`, 2, 0, 0);
          q.send("qcmdVT", 1, "flower_count", bump(q, "flower_count"), 0, 0); // one more than last time
          counted(q, "flower_count"); // what that count sets off
          q.xp(5, `${name}`);
        }
      }],
    ],

    // a talk read to its end
    answer: {
      liza_1(q) {
        // step 9: once
        if (once(q, "step9")) {
          q.send("qcmdVT", 1, "00_uri", 1, 0, 0);
          q.send("qcmdVT", 1, "players", 1, 0, 0);
          q.send("qposturi", "/adventure1-returnofthephantoms/#00-start/#0#101");
          q.send("qcmdVT", 1, "00_uri", 99, 0, 0);
          set(q, "vineblock_1", 1, 0, 0);
          set(q, "vine_1", 1, 1, 0);
          q.send("qswfs", "liza_1", "disappear");
          set(q, "liza_1", 2, 1, 1);
          set(q, "liza_1", 3, 1, 0);
          q.send("qcmd", 38, 3466);
          q.vars.goal = 3466;
          q.after(15790, () => {
            set(q, "vineblock_2", 1, 0, 0);
            set(q, "vine_2", 1, 1, 0);
          });
        }
      },
      liza_2(q) {
        // step 33: once
        if (once(q, "step33")) {
          set(q, "liza_2", 2, 1, 1);
          set(q, "exit_port", 1, 1, 0);
          set(q, "portal", 1, 1, 0);
          q.xp(50, "liza_2");
          set(q, "liza_2", 3, 1, 0);
          q.after(280, () => {
            q.send("qcmdVT", 1, "40_uri", 1, 0, 0);
            q.send("qposturi", "/adventure1-returnofthephantoms/#40-exit/#0#101");
            q.send("qcmdVT", 1, "40_uri", 99, 0, 0);
            q.offer([[2,406,1466636075],[3,1000,1000],[2,213,-261551589],[3,1500,1500],[2,413,-417659113]]); // [1, den item, 0], [2, clothing item, ?] or [3, gems, gems]
            q.after(3010, () => {
              set(q, "exit_block", 1, 0, 0);
            });
          });
        }
      },
    },

    // an item picked up
    pickedUp: {
      phan_key_1(q) {
        // step 18
        set(q, "bunny_1", 3, 1, 1);
        set(q, "bunny_2", 4, 1, 1);
        set(q, "bunny_3", 2, 1, 1);
        set(q, "bunny_4", 2, 1, 1);
      },
    },

    // a chest, opened
    opened: {
      treasure_1(q) {
        if (!once(q, "opened treasure_1")) {
          return;
        }
        q.gems(50);
        // step 15
        q.xp(5, "treasure_1");
      },
      treasure_2(q) {
        if (!once(q, "opened treasure_2")) {
          return;
        }
        q.gems(200);
        // step 6
        q.xp(5, "treasure_2");
      },
      treasure_3(q) {
        if (!once(q, "opened treasure_3")) {
          return;
        }
        q.gems(200);
        // step 20
        q.xp(5, "treasure_3");
      },
      treasure_4(q) {
        if (!once(q, "opened treasure_4")) {
          return;
        }
        q.gems(100);
        // step 16
        q.xp(5, "treasure_4");
      },
      treasure_5(q) {
        if (!once(q, "opened treasure_5")) {
          return;
        }
        q.clothes(...passageClothing(q, "treasure_5", {hard: true}));
      },
      treasure_6(q) {
        if (!once(q, "opened treasure_6")) {
          return;
        }
        q.gems(400);
        // step 5
        q.xp(5, "treasure_6");
      },
      treasure_7(q) {
        if (!once(q, "opened treasure_7")) {
          return;
        }
        q.gems(300);
        // step 31
        q.xp(5, "treasure_7");
      },
    },

    // a plant ate a phantom: [actor, 50, 1, x, y, ""] has it die there
    eaten(q, plant, phantom, x, y) {
      if (!once(q, "eaten " + phantom)) {
        return;
      }
      q.send("qad", phantom, 50, 1, x, y, "");
      // step 69
      q.send("qspn", `${phantom}`, `${phantom}__give_gem`, 200, 42, 3, 25, "null", "null", "null");
      q.xp(5, `${phantom}`);
      set(q, `${phantom}`, 3, 1, 0);
      set(q, `${phantom}`, 99, 0, 0);
      // step 70: every one but phantom_5__c, phantom_3, phantom_4, phantom_8__b, phantom_8__a, phantom_9, phantom_5__a, phantom_12, phantom_11, phantom_15, phantom_10, phantom_14, phantom_7, phantom_6, phantom_19_h
      if (!["phantom_5__c","phantom_3","phantom_4","phantom_8__b","phantom_8__a","phantom_9","phantom_5__a","phantom_12","phantom_11","phantom_15","phantom_10","phantom_14","phantom_7","phantom_6","phantom_19_h"].includes(phantom)) {
        q.after(1490, () => {
        });
      }
      // step 71: when it is phantom_5__c
      if (phantom === "phantom_5__c") {
        q.after(1690, () => {
        });
      }
      // step 72: when it is phantom_3
      if (phantom === "phantom_3") {
        q.after(1860, () => {
        });
      }
      // step 73: when it is phantom_4
      if (phantom === "phantom_4") {
        q.after(1290, () => {
        });
      }
      // step 74: when it is phantom_8__b
      if (phantom === "phantom_8__b") {
        q.after(1500, () => {
        });
      }
      // step 75: when it is phantom_8__a
      if (phantom === "phantom_8__a") {
        q.after(1840, () => {
        });
      }
      // step 76: when it is phantom_9
      if (phantom === "phantom_9") {
        q.after(1550, () => {
        });
      }
      // step 77: when it is phantom_5__a
      if (phantom === "phantom_5__a") {
        q.after(1930, () => {
        });
      }
      // step 78: when it is phantom_12
      if (phantom === "phantom_12") {
        q.after(1940, () => {
        });
      }
      // step 79: when it is phantom_11
      if (phantom === "phantom_11") {
        q.after(1230, () => {
        });
      }
      // step 80: when it is phantom_15
      if (phantom === "phantom_15") {
        q.after(2870, () => {
        });
      }
      // step 81: when it is phantom_10
      if (phantom === "phantom_10") {
        q.after(1410, () => {
        });
      }
      // step 82: when it is phantom_14
      if (phantom === "phantom_14") {
        q.after(1040, () => {
        });
      }
      // step 83: when it is phantom_7
      if (phantom === "phantom_7") {
        q.after(1990, () => {
        });
      }
      // step 84: when it is phantom_6
      if (phantom === "phantom_6") {
        q.after(1560, () => {
        });
      }
      // step 85: when it is phantom_19_h
      if (phantom === "phantom_19_h") {
        q.after(1310, () => {
        });
      }
    },
  },
};

/* adventure-script-maker
{"defId":14,"title":"Return of the Phantoms (hard)","rooms":[{"key":"start","room":"adventures.room_adventure_1x","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_musquest"},{"key":"spawn_1_a","room":"adventures.room_adventure_1a","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_musbunnyburrow","arrive":"spawn_1_a"},{"key":"spawn_1a","room":"adventures.room_adventure_1x","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_musquest","arrive":"spawn_1a"}],"objective":3465,"actors":[{"name":"questready","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"checkpoint2","type":27,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"checkpoint4","type":27,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"start_init","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"water_time","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunnytimer_1","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunnytimer_2","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunnytimer_3","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunnytimer_4","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"blocktimer_1","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phan_timer_1","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gifttimer","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"players","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"waterdone","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"watervar","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flower_count","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trap_count","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"spawn_1_a","type":9,"def":1,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig_1_a","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"spawn_1a","type":9,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig_1a","type":3,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"spawn_1_b","type":9,"def":2,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig_1_b","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"spawn_1b","type":9,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig_1b","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"liza_1","type":1,"def":21,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"liza_2","type":1,"def":21,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_1","type":1,"def":88,"state":0,"visible":1,"click":1,"path":"","art":"facesw"},{"name":"bunny_2","type":1,"def":89,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bunny_3","type":1,"def":90,"state":0,"visible":1,"click":1,"path":"","art":"facesw"},{"name":"bunnytrig_3","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bunny_4","type":1,"def":91,"state":0,"visible":1,"click":1,"path":"","art":"facesw"},{"name":"bunny_5","type":1,"def":92,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bunny_6","type":1,"def":93,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bunny_7","type":1,"def":94,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bunny_8","type":1,"def":95,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bunny_9","type":1,"def":96,"state":0,"visible":1,"click":1,"path":"","art":"facesw"},{"name":"bunny_10","type":1,"def":97,"state":0,"visible":1,"click":1,"path":"","art":"facesw"},{"name":"bunny_11","type":1,"def":98,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bunny_12","type":1,"def":101,"state":0,"visible":1,"click":1,"path":"","art":"facesw"},{"name":"nobody_home","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipeinfo_1","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo_2","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo_3","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo_4","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo_5","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo_6","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipetrig_1","type":1,"def":69,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipetrig_2","type":1,"def":69,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipetrig_3","type":1,"def":69,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipetrig_4","type":1,"def":69,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipetrig_5","type":1,"def":69,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipetrig_6","type":1,"def":69,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowerinfo_1","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowerinfo_2","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowerinfo_3","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowerinfo_4","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowerinfo_5","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowerinfo_6","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowerinfo_7","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowerinfo_8","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowerinfo_9","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowerinfo10","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowerinfo11","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowerinfo12","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowertrig_1","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowertrig_2","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowertrig_3","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowertrig_4","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowertrig_5","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowertrig_6","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowertrig_7","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowertrig_8","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowertrig_9","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowertrig10","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowertrig11","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"flowertrig12","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plant_1","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"plant_2","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"plant_3","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"plant_4","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"plant_5","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"plant_6","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"plant_7","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"plant_8","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"plant_9","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"plant_10","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"plant_11","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"plant_12","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"plant_13","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"plant_14","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"plant_15","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"plant_16","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"plant_17","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"plant_18","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_1","type":20,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path_2","type":20,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path_2_h","type":20,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path_3","type":20,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path_3_h","type":20,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path_5","type":20,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path_5_h","type":20,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path_6","type":20,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path_7","type":20,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path_8a","type":20,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path_8b","type":20,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path_9","type":20,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path_9_h","type":20,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path_11","type":20,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path_11_h","type":20,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path_12","type":20,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path_12_h","type":20,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path_13_h","type":20,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path_14_h","type":20,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path_15_h","type":20,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path_17_h","type":20,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path_18_h","type":20,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path_19_h","type":20,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pail_1","type":17,"def":1955,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pail_2","type":17,"def":1955,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pail_3","type":17,"def":1955,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_1","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_2a","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_2a_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_2b","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_2b_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_2c","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_2c_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_3a","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_3a_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_3b","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_3b_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_3c","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_3c_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_4a","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_4a_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_4b","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_4b_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_4c","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_4c_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_5a_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_5b_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_5c_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_6a_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_6b_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_6c_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"spawn_1","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"spawn_2","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"spawn_3","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"spawn_4","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"waterfall","type":16,"def":"ajq_waterfall_lp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"sludgewall","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge_1","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge_2","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge_3","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge_4","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge_5","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge_6","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"portal","type":16,"def":"ajq_portalgatelp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"diffvol_1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"diffvol_2","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"diffvol_3","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bunnyblocker","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"phan_block_e","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"phan_block_h","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"watervol_1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"vineblock_1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"vineblock_2","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blocker_h","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blocker_e","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"exit_block","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bunnyvol_1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bunnytrig_1","type":1,"def":45,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cheatchq","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"phan_trig_e","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"phan_trig_h","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"phan_key_1","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cage10_f","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cage10_b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cage9_f","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cage9_b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cage8_f","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cage8_b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cage7_f","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cage7_b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"burrow_door","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bunnytile_1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bunnyblock_1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"phan_door_e","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"phan_door_h","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"vine_1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"vine_2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"well_1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"well_1h","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"water_1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"easy","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"hard","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe_1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe_2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe_3","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe_4","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe_5","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe_6","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"flowers_1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"flowers_2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"flowers_3","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"flowers_4","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"flowers_5","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"flowers_6","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"flowers_7","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"flowers_8","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"flowers_9","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"flowers_10","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"flowers_11","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"flowers_12","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"exit_port","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"phantom_1","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_2","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_2_h","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_3","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_3_h","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_4","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_5__a","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_5__b","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_5__c","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_5_h","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_6","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_7","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_8__a","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_8__b","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_9","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_9a_h","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_9b_h","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_9c_h","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_10","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_11","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_11_h","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_12","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_12_h","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_13","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_13_h","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_14","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_14_h","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_15","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_15_h","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_16_h","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_17_h","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_18_h","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_19_h","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff1","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff2","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff2h","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff3","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff3h","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff4","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff5a","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff5b","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff5c","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff5h","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff6","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff7","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff8a","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff8b","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff9","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff9a","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff9b","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff9c","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff10","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff11","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff11h","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff12","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff12h","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff13","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff13h","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff14","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff14h","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff15","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff15h","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff16h","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff17h","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff18h","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantoff19h","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"treasure_1","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50,"chestKind":3},{"name":"treasure_2","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":200,"chestKind":3},{"name":"treasure_3","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":200,"chestKind":3},{"name":"treasure_4","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":100,"chestKind":3},{"name":"treasure_5","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"treasure_6","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":400,"chestKind":3},{"name":"treasure_7","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":300,"chestKind":3},{"name":"bunny_key_1a","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_key_1b","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_key_1c","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_key_1d","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_key_1e","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_key_1f","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_key_2a","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_key_2b","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_key_2c","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_key_2d","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_key_2e","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_key_2f","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_key_3a","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_key_3b","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_key_3c","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_key_3d","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_key_3e","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_key_3f","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_key_4a","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_key_4b","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_key_4c","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_key_4d","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_key_4e","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bunny_key_4f","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"exit_vol","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"secret_1","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"secret_2","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"00_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"10_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"20_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"30_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"40_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"playermember","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""}],"steps":[{"id":1,"when":"trigger","name":"nobody_home","once":false,"holding":"","nth":0,"actions":[{"a":"say","name":"nobody_home","str":3464,"flag":0}]},{"id":2,"when":"trigger","name":"bunnytrig_3","once":false,"holding":"","nth":0,"actions":[{"a":"sayStage","name":"bunny_3","table":{"3486":3506},"dflt":3469,"flag":1}]},{"id":3,"when":"trigger","name":"phantom_5__c__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom_5__c__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":4,"when":"trigger","name":"phan_trig_h","once":false,"holding":"","nth":0,"actions":[{"a":"say","name":"phan_trig_h","str":3060,"flag":0}],"unless":"phan_key_1"},{"id":5,"when":"opened","name":"treasure_6","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"treasure_6"}]},{"id":6,"when":"opened","name":"treasure_2","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"treasure_2"}]},{"id":7,"when":"trigger","name":"questready","once":false,"holding":"","nth":1,"nthOn":0,"actions":[{"a":"var","name":"start_init","value":1},{"a":"wait","ms":390},{"a":"appear","name":"liza_1","face":"facesw"},{"a":"show","name":"well_1","click":0},{"a":"show","name":"water_1","click":0},{"a":"show","name":"flowers_1","click":0},{"a":"show","name":"flowers_2","click":0},{"a":"show","name":"flowers_3","click":0},{"a":"show","name":"flowers_4","click":0},{"a":"show","name":"flowers_9","click":0},{"a":"show","name":"flowers_10","click":0},{"a":"show","name":"flowers_11","click":0},{"a":"show","name":"flowers_12","click":0},{"a":"set","name":"blocker_h","state":99,"visible":0,"click":0},{"a":"set","name":"phan_trig_e","state":99,"visible":0,"click":0},{"a":"set","name":"easy","state":99,"visible":0,"click":0},{"a":"set","name":"phan_door_e","state":99,"visible":0,"click":0},{"a":"set","name":"phan_block_e","state":99,"visible":0,"click":0},{"a":"show","name":"treasure_1","click":1},{"a":"show","name":"treasure_2","click":1},{"a":"show","name":"treasure_3","click":1},{"a":"show","name":"treasure_4","click":1},{"a":"show","name":"treasure_5","click":1},{"a":"show","name":"treasure_6","click":1},{"a":"show","name":"treasure_7","click":1},{"a":"set","name":"checkpoint4","state":99,"visible":0,"click":0},{"a":"set","name":"spawn_4","state":99,"visible":0,"click":0},{"a":"show","name":"flowers_5","click":0},{"a":"show","name":"flowers_6","click":0},{"a":"show","name":"flowers_7","click":0},{"a":"show","name":"flowers_8","click":0},{"a":"show","name":"well_1h","click":0},{"a":"show","name":"cork_2b_h","click":0},{"a":"show","name":"cork_3b_h","click":0},{"a":"show","name":"cork_4b_h","click":0},{"a":"show","name":"cork_5b_h","click":0},{"a":"show","name":"cork_6b_h","click":0},{"a":"show","name":"bunny_key_1f","click":0},{"a":"show","name":"bunny_key_2f","click":0},{"a":"show","name":"bunny_key_3f","click":0},{"a":"show","name":"bunny_key_4f","click":0},{"a":"hide","name":"diffvol_1"},{"a":"hide","name":"diffvol_2"},{"a":"hide","name":"diffvol_3"}]},{"id":8,"when":"trigger","name":"liza_1","once":false,"holding":"","nth":0,"actions":[{"a":"talk","name":"liza_1","str":3461,"mode":1}]},{"id":9,"when":"answer","name":"liza_1","once":true,"holding":"","nth":0,"actions":[{"a":"var","name":"00_uri","value":1},{"a":"var","name":"players","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure1-returnofthephantoms/#00-start/#0#101"},{"a":"var","name":"00_uri","value":99},{"a":"hide","name":"vineblock_1"},{"a":"show","name":"vine_1","click":0},{"a":"artstate","name":"liza_1","state":"disappear"},{"a":"set","name":"liza_1","state":2,"visible":1,"click":1},{"a":"set","name":"liza_1","state":3,"visible":1,"click":0},{"a":"goal","str":3466},{"a":"wait","ms":15790},{"a":"hide","name":"vineblock_2"},{"a":"show","name":"vine_2","click":0}]},{"id":10,"when":"trigger","name":"phantom_3__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom_3__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":11,"when":"trigger","name":"phantom_2__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom_2__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":12,"when":"trigger","name":"phantom_4__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom_4__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":13,"when":"trigger","name":"phantom_8__a__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom_8__a__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":14,"when":"trigger","name":"phantom_9__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom_9__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":15,"when":"opened","name":"treasure_1","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"treasure_1"}]},{"id":16,"when":"opened","name":"treasure_4","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"treasure_4"}]},{"id":17,"when":"trigger","name":"trig_1a","once":false,"holding":"","nth":0,"actions":[{"a":"room","key":"spawn_1_a","spawn":"spawn_1_a"}]},{"id":18,"when":"pickedUp","name":"phan_key_1","once":false,"holding":"","nth":0,"actions":[{"a":"set","name":"bunny_1","state":3,"visible":1,"click":1},{"a":"set","name":"bunny_2","state":4,"visible":1,"click":1},{"a":"set","name":"bunny_3","state":2,"visible":1,"click":1},{"a":"set","name":"bunny_4","state":2,"visible":1,"click":1}]},{"id":19,"when":"trigger","name":"trig_1_a","once":false,"holding":"","nth":0,"actions":[{"a":"room","key":"spawn_1a","spawn":"spawn_1a"}]},{"id":20,"when":"opened","name":"treasure_3","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"treasure_3"}]},{"id":21,"when":"trigger","name":"phan_trig_h","once":true,"holding":"phan_key_1","nth":0,"actions":[{"a":"use"},{"a":"show","name":"phan_door_h","click":0},{"a":"hide","name":"phan_trig_h"},{"a":"xp","amount":15,"name":"phan_trig_h"},{"a":"goal","str":3490},{"a":"path","name":"phantom_1","path":"path_1"},{"a":"show","name":"phantom_1","click":1},{"a":"path","name":"phantom_6","path":"path_6"},{"a":"show","name":"phantom_6","click":1},{"a":"path","name":"phantom_7","path":"path_7"},{"a":"show","name":"phantom_7","click":1},{"a":"show","name":"phantom_10","click":1},{"a":"path","name":"phantom_11","path":"path_1"},{"a":"show","name":"phantom_11","click":1},{"a":"path","name":"phantom_12","path":"path_12"},{"a":"show","name":"phantom_12","click":1},{"a":"show","name":"phantom_13","click":1},{"a":"show","name":"phantom_14","click":1},{"a":"show","name":"phantom_15","click":1},{"a":"path","name":"phantom_11_h","path":"path_11_h"},{"a":"show","name":"phantom_11_h","click":1},{"a":"path","name":"phantom_12_h","path":"path_12_h"},{"a":"show","name":"phantom_12_h","click":1},{"a":"path","name":"phantom_13_h","path":"path_13_h"},{"a":"show","name":"phantom_13_h","click":1},{"a":"path","name":"phantom_14_h","path":"path_14_h"},{"a":"show","name":"phantom_14_h","click":1},{"a":"path","name":"phantom_15_h","path":"path_15_h"},{"a":"show","name":"phantom_15_h","click":1},{"a":"path","name":"phantom_17_h","path":"path_17_h"},{"a":"show","name":"phantom_17_h","click":1},{"a":"path","name":"phantom_18_h","path":"path_18_h"},{"a":"show","name":"phantom_18_h","click":1},{"a":"path","name":"phantom_19_h","path":"path_19_h"},{"a":"show","name":"phantom_19_h","click":1},{"a":"wait","ms":2220},{"a":"hide","name":"phan_block_h"}]},{"id":22,"when":"trigger","name":"bunnytrig_1","once":false,"holding":"","nth":0,"actions":[{"a":"say","name":"bunnytrig_1","str":3019,"flag":0}]},{"id":23,"when":"trigger","name":"phantom_12__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom_12__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":24,"when":"trigger","name":"phantom_11__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom_11__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":25,"when":"trigger","name":"phantom_10__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom_10__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":26,"when":"trigger","name":"phantom_15__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom_15__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":27,"when":"trigger","name":"phantom_14__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom_14__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":28,"when":"trigger","name":"phantom_7__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom_7__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":29,"when":"trigger","name":"phantom_6__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom_6__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":30,"when":"trigger","name":"phantom_19_h__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom_19_h__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":31,"when":"opened","name":"treasure_7","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"treasure_7"}]},{"id":32,"when":"trigger","name":"liza_2","once":false,"holding":"","nth":0,"actions":[{"a":"talk","name":"liza_2","str":3495,"mode":1}]},{"id":33,"when":"answer","name":"liza_2","once":true,"holding":"","nth":0,"actions":[{"a":"set","name":"liza_2","state":2,"visible":1,"click":1},{"a":"show","name":"exit_port","click":0},{"a":"show","name":"portal","click":0},{"a":"xp","amount":50,"name":"liza_2"},{"a":"set","name":"liza_2","state":3,"visible":1,"click":0},{"a":"wait","ms":280},{"a":"var","name":"40_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure1-returnofthephantoms/#40-exit/#0#101"},{"a":"var","name":"40_uri","value":99},{"a":"prize","list":"clothes 406 1466636075, gems 1000, clothes 213 -261551589, gems 1500, clothes 413 -417659113"},{"a":"wait","ms":3010},{"a":"hide","name":"exit_block"}]},{"id":34,"when":"trigger","name":"exit_vol","once":false,"holding":"","nth":0,"actions":[{"a":"end"}]},{"id":35,"holding":"","when":"trigger","name":"phantom_#__b__give_gem","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"send","cmd":"qad","fields":"{name}|0|null"},{"a":"gems","amount":25}]},{"id":36,"holding":"","when":"trigger","name":"flowertrig_#","family":true,"holdFam":"","unlessFam":"pail_#","member":"flowertrig_1","once":false,"nth":0,"actions":[{"a":"wait","ms":610},{"a":"show","name":"flowerinfo_1","click":1},{"a":"say","name":"flowerinfo_1","str":3022,"flag":2}]},{"id":37,"holding":"","when":"trigger","name":"flowertrig_#","family":true,"holdFam":"","unlessFam":"pail_#","member":"flowertrig_3","once":false,"nth":0,"actions":[{"a":"wait","ms":830},{"a":"show","name":"flowerinfo_3","click":1},{"a":"say","name":"flowerinfo_3","str":3022,"flag":2}]},{"id":38,"holding":"","when":"trigger","name":"flowertrig_#","family":true,"holdFam":"","unlessFam":"pail_#","member":"flowertrig_2","once":false,"nth":0,"actions":[{"a":"show","name":"flowerinfo_2","click":1},{"a":"say","name":"flowerinfo_2","str":3022,"flag":2}]},{"id":39,"holding":"","when":"trigger","name":"bunny_#","family":true,"holdFam":"","unlessFam":"bunny_key_#","member":"bunny_11","once":false,"nth":1,"memberNth":true,"actions":[{"a":"say","name":"bunny_11","str":3583,"flag":1}]},{"id":40,"holding":"","when":"trigger","name":"bunny_#","family":true,"holdFam":"","unlessFam":"bunny_key_#","member":"bunny_11","once":false,"nth":2,"memberNth":true,"actions":[{"a":"say","name":"bunny_11","str":3583,"flag":1},{"a":"say","name":"bunny_11","str":3583,"flag":1},{"a":"wait","ms":190},{"a":"say","name":"bunny_11","str":3583,"flag":1},{"a":"say","name":"bunny_11","str":3583,"flag":1},{"a":"say","name":"bunny_11","str":3583,"flag":1},{"a":"say","name":"bunny_11","str":3583,"flag":1},{"a":"say","name":"bunny_11","str":3583,"flag":1},{"a":"say","name":"bunny_11","str":3583,"flag":1}]},{"id":41,"holding":"","when":"trigger","name":"bunny_#","family":true,"holdFam":"","unlessFam":"bunny_key_#","member":"bunny_1","once":false,"nth":0,"actions":[{"a":"say","name":"bunny_1","str":3462,"flag":1}]},{"id":42,"holding":"","when":"trigger","name":"bunny_#","family":true,"holdFam":"","unlessFam":"bunny_key_#","member":"bunny_2","once":false,"nth":1,"memberNth":true,"actions":[{"a":"say","name":"bunny_2","str":3463,"flag":1},{"a":"set","name":"bunny_2","state":2,"visible":1,"click":0},{"a":"show","name":"cork_1","click":0},{"a":"wait","ms":980},{"a":"show","name":"pipetrig_1","click":1},{"a":"wait","ms":3000},{"a":"show","name":"bunny_2","click":1},{"a":"say","name":"bunny_2","str":3467,"flag":1},{"a":"set","name":"bunny_2","state":2,"visible":1,"click":0},{"a":"var","name":"watervar","value":2},{"a":"goal","str":3730},{"a":"show","name":"pipetrig_2","click":1},{"a":"show","name":"pipetrig_3","click":1},{"a":"show","name":"pipetrig_4","click":1},{"a":"show","name":"pipetrig_5","click":1},{"a":"show","name":"pipetrig_6","click":1}]},{"id":43,"holding":"","when":"trigger","name":"bunny_#","family":true,"holdFam":"","unlessFam":"bunny_key_#","member":"bunny_2","once":false,"nth":2,"memberNth":true,"actions":[{"a":"say","name":"bunny_2","str":3471,"flag":1}]},{"id":44,"holding":"","when":"trigger","name":"bunny_#","family":true,"holdFam":"","unlessFam":"bunny_key_#","member":"bunny_2","once":false,"nth":3,"memberNth":true,"actions":[{"a":"say","name":"bunny_2","str":3471,"flag":1}]},{"id":45,"holding":"","when":"trigger","name":"bunny_#","family":true,"holdFam":"","unlessFam":"bunny_key_#","member":"bunny_2","once":false,"nth":4,"memberNth":true,"actions":[{"a":"say","name":"bunny_2","str":3504,"flag":1}]},{"id":46,"holding":"","when":"trigger","name":"bunny_#","family":true,"holdFam":"","unlessFam":"bunny_key_#","member":"bunny_4","once":false,"nth":1,"memberNth":true,"actions":[{"a":"say","name":"bunny_4","str":3470,"flag":1}]},{"id":47,"holding":"","when":"trigger","name":"bunny_#","family":true,"holdFam":"","unlessFam":"bunny_key_#","member":"bunny_4","once":false,"nth":2,"memberNth":true,"actions":[{"a":"say","name":"bunny_4","str":3505,"flag":1}]},{"id":48,"holding":"","when":"trigger","name":"bunny_#","family":true,"holdFam":"","unlessFam":"bunny_key_#","member":"bunny_12","once":false,"nth":0,"actions":[{"a":"say","name":"bunny_12","str":3603,"flag":1}]},{"id":49,"holding":"","when":"trigger","name":"bunny_#","family":true,"holdFam":"","unlessFam":"bunny_key_#","member":"bunny_5","once":false,"nth":0,"actions":[{"a":"say","name":"bunny_5","str":3487,"flag":1}]},{"id":50,"holding":"","when":"trigger","name":"bunny_#","family":true,"holdFam":"","unlessFam":"bunny_key_#","member":"bunny_6","once":false,"nth":0,"actions":[{"a":"say","name":"bunny_6","str":3488,"flag":1},{"a":"show","name":"bunny_6","click":0},{"a":"show","name":"phan_key_1","click":0}]},{"id":51,"holding":"","when":"trigger","name":"bunny_#","family":true,"holdFam":"","unlessFam":"bunny_key_#","member":"bunny_10","once":false,"nth":0,"actions":[{"a":"say","name":"bunny_10","str":3572,"flag":1}]},{"id":52,"holding":"","when":"trigger","name":"bunny_#","family":true,"holdFam":"","unlessFam":"bunny_key_#","member":"bunny_8","once":false,"nth":0,"actions":[{"a":"say","name":"bunny_8","str":3572,"flag":1}]},{"id":53,"holding":"","when":"trigger","name":"bunny_#","family":true,"holdFam":"","unlessFam":"bunny_key_#","member":"bunny_3","once":false,"nth":0,"actions":[{"a":"wait","ms":260},{"a":"say","name":"bunny_3","str":3506,"flag":1}]},{"id":54,"holding":"","when":"trigger","name":"secret_#","family":true,"holdFam":"","unlessFam":"","once":false,"nth":0,"actions":[{"a":"sound","sound":"ajq_mussecretareast"}]},{"id":55,"holding":"","when":"trigger","name":"pipetrig_#","family":true,"holdFam":"cork_#","unlessFam":"","member":"pipetrig_1","once":true,"nth":0,"actions":[{"a":"use"},{"a":"show","name":"pipe_1","click":0},{"a":"hide","name":"sludge_1"},{"a":"set","name":"pipetrig_1","state":2,"visible":0,"click":0},{"a":"var","name":"watervar","value":1},{"a":"path","name":"phantom_2","path":"path_2"},{"a":"show","name":"phantom_2","click":1},{"a":"path","name":"phantom_3","path":"path_3"},{"a":"show","name":"phantom_3","click":1},{"a":"show","name":"phantom_4","click":1},{"a":"path","name":"phantom_2_h","path":"path_2_h"},{"a":"show","name":"phantom_2_h","click":1},{"a":"path","name":"phantom_3_h","path":"path_3_h"},{"a":"show","name":"phantom_3_h","click":1},{"a":"path","name":"phantom_5_h","path":"path_5_h"},{"a":"show","name":"phantom_5_h","click":1},{"a":"path","name":"phantom_5__a","path":"path_5"},{"a":"show","name":"phantom_5__a","click":1},{"a":"path","name":"phantom_5__b","path":"path_5"},{"a":"show","name":"phantom_5__b","click":1},{"a":"path","name":"phantom_5__c","path":"path_5"},{"a":"show","name":"phantom_5__c","click":1},{"a":"path","name":"phantom_8__b","path":"path_8b"},{"a":"show","name":"phantom_8__b","click":1},{"a":"path","name":"phantom_8__a","path":"path_8a"},{"a":"show","name":"phantom_8__a","click":1},{"a":"path","name":"phantom_9","path":"path_9"},{"a":"show","name":"phantom_9","click":1},{"a":"path","name":"phantom_9a_h","path":"path_9_h"},{"a":"show","name":"phantom_9a_h","click":1},{"a":"path","name":"phantom_9b_h","path":"path_9_h"},{"a":"show","name":"phantom_9b_h","click":1},{"a":"path","name":"phantom_9c_h","path":"path_9_h"},{"a":"show","name":"phantom_9c_h","click":1},{"a":"show","name":"phantom_16_h","click":1},{"a":"xp","amount":5,"name":"pipetrig_1"}]},{"id":56,"holding":"","when":"trigger","name":"pipetrig_#","family":true,"holdFam":"cork_#_h","unlessFam":"","once":true,"nth":1,"actions":[{"a":"use"},{"a":"show","name":"pipe_{n}","click":0},{"a":"hide","name":"sludge_{n}"},{"a":"set","name":"{name}","state":2,"visible":0,"click":0},{"a":"var","name":"watervar","value":3},{"a":"goal","str":3729},{"a":"xp","amount":5,"name":"{name}"}]},{"id":57,"holding":"","when":"trigger","name":"pipetrig_#","family":true,"holdFam":"cork_#_h","unlessFam":"","once":true,"nth":2,"actions":[{"a":"use"},{"a":"show","name":"pipe_{n}","click":0},{"a":"hide","name":"sludge_{n}"},{"a":"set","name":"{name}","state":2,"visible":0,"click":0},{"a":"var","name":"watervar","value":4},{"a":"goal","str":3472},{"a":"xp","amount":5,"name":"{name}"}]},{"id":58,"holding":"","when":"trigger","name":"pipetrig_#","family":true,"holdFam":"cork_#_h","unlessFam":"","once":true,"nth":3,"actions":[{"a":"use"},{"a":"show","name":"pipe_{n}","click":0},{"a":"hide","name":"sludge_{n}"},{"a":"set","name":"pipeinfo_{n}","state":0,"visible":0,"click":0},{"a":"set","name":"{name}","state":2,"visible":0,"click":0},{"a":"var","name":"watervar","value":5},{"a":"goal","str":3546},{"a":"xp","amount":5,"name":"{name}"}]},{"id":59,"holding":"","when":"trigger","name":"pipetrig_#","family":true,"holdFam":"cork_#_h","unlessFam":"","once":true,"nth":4,"actions":[{"a":"use"},{"a":"show","name":"pipe_{n}","click":0},{"a":"hide","name":"sludge_{n}"},{"a":"set","name":"{name}","state":2,"visible":0,"click":0},{"a":"var","name":"watervar","value":6},{"a":"goal","str":3547},{"a":"xp","amount":5,"name":"{name}"}]},{"id":60,"holding":"","when":"trigger","name":"pipetrig_#","family":true,"holdFam":"cork_#_h","unlessFam":"","once":true,"nth":5,"actions":[{"a":"use"},{"a":"show","name":"pipe_{n}","click":0},{"a":"hide","name":"sludge_{n}"},{"a":"set","name":"{name}","state":2,"visible":0,"click":0},{"a":"var","name":"watervar","value":7},{"a":"hide","name":"sludgewall"},{"a":"show","name":"waterfall","click":0},{"a":"set","name":"water_1","state":0,"visible":1,"click":0},{"a":"set","name":"well_1","state":0,"visible":1,"click":0},{"a":"show","name":"pail_1","click":0},{"a":"show","name":"pail_2","click":0},{"a":"goal","str":3474},{"a":"set","name":"well_1h","state":0,"visible":1,"click":0},{"a":"show","name":"pail_3","click":0},{"a":"show","name":"flowertrig_5","click":1},{"a":"show","name":"flowertrig_{n}","click":1},{"a":"show","name":"flowertrig_7","click":1},{"a":"show","name":"flowertrig_8","click":1},{"a":"hide","name":"watervol_1"},{"a":"show","name":"flowertrig_1","click":1},{"a":"show","name":"flowertrig_2","click":1},{"a":"show","name":"flowertrig_3","click":1},{"a":"show","name":"flowertrig_4","click":1},{"a":"show","name":"flowertrig_9","click":1},{"a":"show","name":"flowertrig10","click":1},{"a":"show","name":"flowertrig11","click":1},{"a":"show","name":"flowertrig12","click":1},{"a":"set","name":"bunny_2","state":3,"visible":1,"click":1},{"a":"set","name":"bunny_1","state":2,"visible":1,"click":1},{"a":"xp","amount":15,"name":"waterdone"},{"a":"var","name":"10_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure1-returnofthephantoms/#10-plugthepipes/#0#101"},{"a":"var","name":"10_uri","value":99},{"a":"xp","amount":5,"name":"{name}"},{"a":"wait","ms":2620},{"a":"sound","sound":"ajq_riverclear"}]},{"id":61,"holding":"","when":"trigger","name":"pipetrig_#","family":true,"holdFam":"","unlessFam":"cork_#, cork_#_h","member":"pipetrig_4","once":false,"nth":0,"actions":[{"a":"show","name":"pipeinfo_4","click":1},{"a":"say","name":"pipeinfo_4","str":3468,"flag":2}]},{"id":62,"holding":"","when":"trigger","name":"flowertrig_#","family":true,"holdFam":"pail_#","unlessFam":"","once":true,"nth":0,"actions":[{"a":"use"},{"a":"set","name":"flowers_{n}","state":0,"visible":1,"click":0},{"a":"set","name":"{name}","state":2,"visible":0,"click":0},{"a":"var","name":"flower_count","value":"{count}"},{"a":"xp","amount":5,"name":"{name}"}]},{"id":63,"holding":"","when":"trigger","name":"flowertrig#","family":true,"holdFam":"pail_#","unlessFam":"","once":true,"nth":0,"actions":[{"a":"use"},{"a":"set","name":"flowers_{n}","state":0,"visible":1,"click":0},{"a":"set","name":"{name}","state":2,"visible":0,"click":0},{"a":"var","name":"flower_count","value":"{count}"},{"a":"xp","amount":5,"name":"{name}"}]},{"id":64,"holding":"","when":"trigger","name":"bunny_#","family":true,"holdFam":"bunny_key_#","unlessFam":"","once":true,"nth":0,"actions":[{"a":"use"},{"a":"xp","amount":10,"name":"{name}"},{"a":"show","name":"cage{n}_f","click":0},{"a":"show","name":"cage{n}_b","click":0},{"a":"artstate","name":"{name}","state":"dance"},{"a":"show","name":"{name}","click":0},{"a":"var","name":"trap_count","value":"{count}"}]},{"id":65,"holding":"","when":"eaten","name":"","nth":0,"once":false,"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_gem|200|42|3|25|null|null|null"},{"a":"xp","amount":5,"name":"{phantom}"},{"a":"set","name":"{phantom}","state":3,"visible":1,"click":0},{"a":"set","name":"{phantom}","state":99,"visible":0,"click":0}]},{"id":66,"holding":"","when":"eaten","name":"","nth":0,"once":false,"unlessMembers":["phantom_5__c","phantom_3","phantom_4","phantom_8__b","phantom_8__a","phantom_9","phantom_5__a","phantom_12","phantom_11","phantom_15","phantom_10","phantom_14","phantom_7","phantom_6","phantom_19_h"],"actions":[{"a":"wait","ms":1490}]},{"id":67,"holding":"","when":"eaten","name":"","member":"phantom_5__c","nth":0,"once":false,"actions":[{"a":"wait","ms":1690}]},{"id":68,"holding":"","when":"eaten","name":"","member":"phantom_3","nth":0,"once":false,"actions":[{"a":"wait","ms":1860}]},{"id":69,"holding":"","when":"eaten","name":"","member":"phantom_4","nth":0,"once":false,"actions":[{"a":"wait","ms":1290}]},{"id":70,"holding":"","when":"eaten","name":"","member":"phantom_8__b","nth":0,"once":false,"actions":[{"a":"wait","ms":1500}]},{"id":71,"holding":"","when":"eaten","name":"","member":"phantom_8__a","nth":0,"once":false,"actions":[{"a":"wait","ms":1840}]},{"id":72,"holding":"","when":"eaten","name":"","member":"phantom_9","nth":0,"once":false,"actions":[{"a":"wait","ms":1550}]},{"id":73,"holding":"","when":"eaten","name":"","member":"phantom_5__a","nth":0,"once":false,"actions":[{"a":"wait","ms":1930}]},{"id":74,"holding":"","when":"eaten","name":"","member":"phantom_12","nth":0,"once":false,"actions":[{"a":"wait","ms":1940}]},{"id":75,"holding":"","when":"eaten","name":"","member":"phantom_11","nth":0,"once":false,"actions":[{"a":"wait","ms":1230}]},{"id":76,"holding":"","when":"eaten","name":"","member":"phantom_15","nth":0,"once":false,"actions":[{"a":"wait","ms":2870}]},{"id":77,"holding":"","when":"eaten","name":"","member":"phantom_10","nth":0,"once":false,"actions":[{"a":"wait","ms":1410}]},{"id":78,"holding":"","when":"eaten","name":"","member":"phantom_14","nth":0,"once":false,"actions":[{"a":"wait","ms":1040}]},{"id":79,"holding":"","when":"eaten","name":"","member":"phantom_7","nth":0,"once":false,"actions":[{"a":"wait","ms":1990}]},{"id":80,"holding":"","when":"eaten","name":"","member":"phantom_6","nth":0,"once":false,"actions":[{"a":"wait","ms":1560}]},{"id":81,"holding":"","when":"eaten","name":"","member":"phantom_19_h","nth":0,"once":false,"actions":[{"a":"wait","ms":1310}]}],"written":"2017-10-30 22:02:01","eat":{"phantom_3":[50,1],"phantom_2":[50,1],"phantom_8__b":[50,1],"phantom_8__a":[50,1],"phantom_9":[50,1],"phantom_4":[50,1],"phantom_5__c":[50,1],"phantom_5__b":[50,1],"phantom_5__a":[50,1],"phantom_12":[50,1],"phantom_11":[50,1],"phantom_15":[50,1],"phantom_10":[50,1],"phantom_14":[50,1],"phantom_7":[50,1],"phantom_6":[50,1],"phantom_19_h":[50,1]},"bars":[],"variantGroups":["cork_2|_h","cork_3|_h","cork_4|_h","cork_5|_h","cork_6|_h","bunny_key_1|","bunny_key_2|","bunny_key_3|","bunny_key_4|"],"mainRun":2,"countRules":[{"counter":"flower_count","value":1,"actions":[{"a":"goal","str":3475}]},{"counter":"flower_count","value":2,"actions":[{"a":"goal","str":3476}]},{"counter":"flower_count","value":3,"actions":[{"a":"goal","str":3477}]},{"counter":"flower_count","value":4,"actions":[{"a":"goal","str":3478}]},{"counter":"flower_count","value":5,"actions":[{"a":"goal","str":3479}]},{"counter":"flower_count","value":6,"actions":[{"a":"goal","str":3480}]},{"counter":"flower_count","value":7,"actions":[{"a":"goal","str":3481}]},{"counter":"flower_count","value":8,"actions":[{"a":"goal","str":3482}]},{"counter":"flower_count","value":9,"actions":[{"a":"goal","str":3483}]},{"counter":"flower_count","value":10,"actions":[{"a":"goal","str":3484}]},{"counter":"flower_count","value":11,"actions":[{"a":"goal","str":3485}]},{"counter":"flower_count","value":12,"actions":[{"a":"goal","str":3486},{"a":"show","name":"trig_1a","click":1},{"a":"hide","name":"nobody_home"},{"a":"hide","name":"bunnyblocker"},{"a":"show","name":"burrow_door","click":0},{"a":"set","name":"pail_1","state":2,"visible":0,"click":0},{"a":"set","name":"pail_2","state":2,"visible":0,"click":0},{"a":"set","name":"pail_3","state":2,"visible":0,"click":0},{"a":"xp","amount":15,"name":"flower_count"},{"a":"show","name":"bunny_12","click":0},{"a":"var","name":"20_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure1-returnofthephantoms/#20-revivetheplants/#0#101"},{"a":"var","name":"20_uri","value":99}]},{"counter":"trap_count","value":1,"actions":[{"a":"goal","str":3573},{"a":"say","name":"bunny_7","str":3568,"flag":1}]},{"counter":"trap_count","value":2,"actions":[{"a":"goal","str":3574},{"a":"say","name":"bunny_9","str":3570,"flag":1}]},{"counter":"trap_count","value":3,"actions":[{"a":"goal","str":3575},{"a":"say","name":"bunny_10","str":3571,"flag":1}]},{"counter":"trap_count","value":4,"actions":[{"a":"goal","str":3576},{"a":"xp","amount":25,"name":"trap_count"},{"a":"appear","name":"liza_2","face":"facesw"},{"a":"var","name":"30_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure1-returnofthephantoms/#30-rescuethebunnies/#0#101"},{"a":"var","name":"30_uri","value":99},{"a":"say","name":"bunny_8","str":3569,"flag":1}]}],"puzzles":[],"bosses":[]}
*/
