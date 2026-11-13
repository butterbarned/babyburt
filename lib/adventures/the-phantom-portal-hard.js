"use strict";

// Recorded adventure 16, made with the adventure script maker. Plays in adventures.room_adventure_2a, adventures.room_adventure_2b.
// To change it, open this file in the maker. Edits made by hand are kept only
// until the maker writes the file again. By hand here (marked "by hand"): the
// plant lines, the monkeys' chat, Liza and the crystals.

// true the first time for each key, false after: for steps that must happen once
const once = (q, key) => {
  q.vars.done = q.vars.done || new Set();
  if (q.vars.done.has(key)) {
    return false;
  }
  q.vars.done.add(key);
  return true;
};
// a progress bar ("qviu <bar> <percent>") that fills while the player keeps at its trigger (hopping on a pad)
// and drains when they stop, as the official server did: once a second, two steps (2.5% for the epic door, 5% for others)
const bar = (q, name) => (q.vars.bars = q.vars.bars || {})[name] || (q.vars.bars[name] = {value: 0, filling: false, full: false, ticking: false, marks: {}});
const fill = (q, name, onFull, marks, step = 2.5) => {
  const b = bar(q, name);
  if (b.full) {
    return;
  }
  b.filling = true;
  if (b.ticking) {
    return;
  }
  b.ticking = true;
  if (b.value === 0) {
    b.value = step;
  }
  const tick = () => {
    for (let half = 0; half < 2; half++) {
      b.value = Math.max(0, Math.min(100, b.value + (b.filling ? step : -step)));
      if (b.value >= 100) {
        b.full = true;
        onFull();
        q.send("qviu", name, 100);
        return;
      }
      const shown = Math.floor(b.value);
      q.send("qviu", name, shown);
      if (b.filling && marks[shown] && !b.marks[shown]) {
        b.marks[shown] = true;
        marks[shown]();
      }
      if (b.value === 0) {
        b.ticking = false;
        return;
      }
    }
    q.after(1000, tick);
  };
  q.after(1000, tick);
};
const stopFilling = (q, name) => {
  bar(q, name).filling = false;
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
  if (key === "monkeychat 4") {
    monkeyChat(q);
    set(q, "social_1", 1, 1, 1);
    set(q, "chatvol_1", 1, 1, 1);
  }
  if (key === "notifycount 1") {
    q.send("qcmd", 38, 3668);
    q.send("qcmdVT", 1, "20_uri", 1, 0, 0);
    q.send("qposturi", "/adventure2-thephantomportal/#20-gettothemonkeys/#0#101");
    q.send("qcmdVT", 1, "20_uri", 99, 0, 0);
    q.send("qcmd", 2, "trapped_1", 3684, 1);
  }
  if (key === "notifycount 2") {
    q.send("qcmd", 2, "trapped_4", 3690, 1);
  }
  if (key === "notifycount 3") {
    q.send("qcmd", 2, "trapped_3", 3688, 1);
  }
  if (key === "notifycount 4") {
    q.send("qcmd", 2, "trapped_4", 3690, 1);
  }
  if (key === "notifycount 5") {
    q.send("qcmd", 2, "trapped_2", 3686, 1);
  }
  if (key === "notifycount 6") {
    q.send("qcmd", 2, "trapped_4", 3690, 1);
  }
  if (key === "notifycount 7") {
    q.send("qcmd", 2, "trapped_3", 3688, 1);
  }
  if (key === "notifycount 8") {
    q.send("qcmd", 2, "trapped_2", 3686, 1);
  }
  if (key === "notifycount 9") {
    q.send("qcmd", 2, "trapped_1", 3684, 1);
  }
  if (key === "notifycount 10") {
    q.send("qcmd", 2, "trapped_1", 3684, 1);
  }
  if (key === "notifycount 11") {
    q.send("qcmd", 2, "trapped_4", 3690, 1);
  }
  if (key === "pipecount 1") {
    q.send("qcmd", 38, 3730);
  }
  if (key === "pipecount 3") {
    q.send("qcmd", 38, 3729);
  }
  if (key === "pipecount 4") {
    q.send("qcmd", 38, 3472);
  }
  if (key === "pipecount 5") {
    q.send("qcmd", 38, 3546);
  }
  if (key === "pipecount 6") {
    q.send("qcmd", 38, 3547);
  }
  if (key === "pipecount 7") {
    set(q, "pail_1", 1, 1, 0);
    set(q, "pail_2", 1, 1, 0);
    set(q, "pail_3", 1, 1, 0);
    set(q, "pail_4", 1, 1, 0);
    set(q, "pail_5", 1, 1, 0);
    set(q, "planttrig_2", 1, 1, 1);
    set(q, "planttrig_3", 1, 1, 1);
    set(q, "planttrig_4", 1, 1, 1);
    set(q, "planttrig_24", 1, 1, 1);
    set(q, "planttrig_26", 1, 1, 1);
    set(q, "planttrig_27", 1, 1, 1);
    set(q, "planttrig_1", 1, 1, 1);
    set(q, "planttrig_5", 1, 1, 1);
    set(q, "planttrig_6", 1, 1, 1);
    set(q, "planttrig_7", 1, 1, 1);
    set(q, "planttrig_8", 1, 1, 1);
    set(q, "planttrig_9", 1, 1, 1);
    set(q, "planttrig_10", 1, 1, 1);
    set(q, "planttrig_11", 1, 1, 1);
    set(q, "planttrig_12", 1, 1, 1);
    set(q, "planttrig_13", 1, 1, 1);
    set(q, "planttrig_14", 1, 1, 1);
    set(q, "planttrig_16", 1, 1, 1);
    set(q, "planttrig_17", 1, 1, 1);
    set(q, "planttrig_18", 1, 1, 1);
    set(q, "planttrig_19", 1, 1, 1);
    set(q, "planttrig_20", 1, 1, 1);
    set(q, "planttrig_21", 1, 1, 1);
    set(q, "planttrig_22", 1, 1, 1);
    set(q, "planttrig_23", 1, 1, 1);
    set(q, "planttrig_25", 1, 1, 1);
    set(q, "water_1", 0, 1, 0);
    set(q, "waterfall", 1, 1, 0);
    q.xp(25, "pipecount");
    q.send("qsnd", "ajq_riverclear");
    set(q, "well_1", 0, 1, 0);
    set(q, "watervol_1", 1, 0, 0);
    q.send("qcmd", 38, 3667);
    q.send("qcmdVT", 1, "10_uri", 1, 0, 0);
    q.send("qposturi", "/adventure2-thephantomportal/#10-plugthepipes/#0#101");
    q.send("qcmdVT", 1, "10_uri", 99, 0, 0);
  }
  if (key === "trapcount 1") {
    q.send("qcmd", 38, 3670);
  }
  if (key === "trapcount 2") {
    q.send("qcmd", 38, 3671);
  }
  if (key === "trapcount 3") {
    q.send("qcmd", 38, 3692);
  }
  if (key === "trapcount 4") {
    q.xp(25, "trapcount");
    q.send("qcmd", 38, 3693);
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
const set = (q, name, state, visible, click) => {
  (q.vars.shown = q.vars.shown || {})[name] = visible; // what is on screen (a pad only works once it is there)
  q.send("qcmd", 1, name, state, visible, click);
};
const appear = (q, name, face) => {
  if (face) {
    q.send("qswfs", name, face);
  }
  q.send("qswfs", name, "appear");
  set(q, name, 1, 1, 1);
};

// written by hand: once all four monkeys are free they take turns to
// talk, one every 15 seconds or so (as recorded), until the gate opens
const MONKEY_CHAT = [["trapped_1", 3704], ["trapped_2", 3705], ["trapped_3", 3706], ["trapped_4", 3707]];
const monkeyChat = q => {
  if (q.vars.chatting) {
    return;
  }
  q.vars.chatting = true;
  let next = 0;
  const say = () => {
    if (q.vars.gateOpen) {
      return;
    }
    const [monkey, line] = MONKEY_CHAT[next++ % MONKEY_CHAT.length];
    set(q, monkey, 6, 1, 1);
    q.send("qcmd", 2, monkey, line, 1);
    set(q, monkey, 7, 1, 0);
    q.after(15000, say);
  };
  q.after(2800, say);
};

// by hand: the passage chests' clothing (lib/prize-pools.js)
const {passageClothing, SLINGSHOT} = require("../prize-pools.js");

module.exports = {
  defId: 16,
  title: "The Phantom Portal (hard)",
  rooms: {
    start: {room: "adventures.room_adventure_2a", name: "Adventure Tutorial", nameStringId: 18326, music: "ajq_musqueststealth"},
    tocave: {room: "adventures.room_adventure_2b", name: "Adventure Tutorial", nameStringId: 18326, music: "ajq_muscave"},
  },
  written: "2026-11-11 18:09:12",
  objective: 3465,
  lobby: true, // the "waiting for players" screen first, as on the official server

  // name, type, def, state, visible, needs a click, path, artwork state
  actors: [
    ["queststart", 18, 0, 0, 1, 1, "", ""],
    ["questready", 7, 0, 0, 1, 1, "", ""],
    ["start_init", 8, 0, 0, 0, 1, "", ""],
    ["tocave", 9, 1, 0, 1, 1, "", ""],
    ["cave_init", 8, 0, 0, 0, 1, "", ""],
    ["toforest", 9, 0, 0, 1, 1, "", ""],
    ["liza_1", 1, 21, 0, 1, 1, "", "facesw"],
    ["liza_2", 1, 21, 0, 0, 1, "", ""],
    ["phantom_4", 11, 2, 0, 1, 1, "path_4", ""],
    ["phantom_5", 11, 2, 0, 1, 1, "path_5", ""],
    ["phantom__8", 11, 2, 0, 1, 1, "path_8", ""],
    ["phantom_9", 11, 2, 0, 1, 1, "path_9", ""],
    ["phantom_10", 11, 2, 0, 1, 1, "path_10", ""],
    ["phantom_11", 11, 2, 0, 1, 1, "path_11", ""],
    ["phantom_12", 11, 2, 0, 1, 1, "path_12", ""],
    ["phantom_13", 11, 2, 0, 1, 1, "path_13", ""],
    ["phantom_14", 11, 2, 0, 1, 1, "path_14", ""],
    ["phantom_16h", 11, 2, 0, 1, 1, "path_16", ""],
    ["phantom_17", 11, 2, 0, 1, 1, "path_17", ""],
    ["phantom_18", 11, 2, 0, 1, 1, "path_18", ""],
    ["phantom19__a", 11, 2, 0, 1, 1, "path_19", ""],
    ["phantom19__b", 11, 2, 0, 1, 1, "path_19", ""],
    ["phantom19__c", 11, 2, 0, 1, 1, "path_19", ""],
    ["phantom_1_h", 11, 2, 0, 1, 1, "path_1_h", ""],
    ["phantom_2_h", 11, 2, 0, 1, 1, "path_2_h", ""],
    ["phantom_3_h", 11, 2, 0, 1, 1, "path_3_h", ""],
    ["phantom_4_h", 11, 2, 0, 1, 1, "path_4_h", ""],
    ["phantom_5_h", 11, 2, 0, 1, 1, "path_5_h", ""],
    ["phantom_6_h", 11, 2, 0, 1, 1, "path_6_h", ""],
    ["phantom_7a_h", 11, 2, 0, 1, 1, "path_7a_h", ""],
    ["phantom_7b_h", 11, 2, 0, 1, 1, "path_7b_h", ""],
    ["phantom_7c_h", 11, 2, 0, 1, 1, "path_7c_h", ""],
    ["phantom_8a_h", 11, 2, 0, 1, 1, "path_8a_h", ""],
    ["phantom_9b_h", 11, 2, 0, 1, 1, "path_9b_h", ""],
    ["phantom_10_h", 11, 2, 0, 1, 1, "path_10_h", ""],
    ["phantom_11_h", 11, 2, 0, 1, 1, "path_11_h", ""],
    ["phantom_12_h", 11, 2, 0, 1, 1, "path_12_h", ""],
    ["phantom_13_h", 11, 2, 0, 1, 1, "path_13_h", ""],
    ["phantom_14_h", 11, 2, 0, 1, 1, "path_14_h", ""],
    ["phantom_15_h", 11, 2, 0, 1, 1, "path_15_h", ""],
    ["phantom_16_h", 11, 2, 0, 1, 1, "path_16_h", ""],
    ["phantom__17h", 11, 2, 0, 1, 1, "path_8", ""],
    ["phantom_18h", 11, 2, 0, 1, 1, "path_18h", ""],
    ["phantom_19h", 11, 2, 0, 1, 1, "path_19h", ""],
    ["phantom_1a", 11, 2, 0, 0, 1, "", ""],
    ["phantom_6a", 11, 2, 0, 0, 1, "", ""],
    ["phantom_2a", 11, 2, 0, 0, 1, "", ""],
    ["phantom_3a", 11, 2, 0, 0, 1, "", ""],
    ["phantom_1b", 11, 2, 0, 0, 1, "", ""],
    ["phantom_2b", 11, 2, 0, 0, 1, "", ""],
    ["phantom_3b", 11, 2, 0, 0, 1, "", ""],
    ["phantom_6b", 11, 2, 0, 0, 1, "", ""],
    ["phantom_8b_h", 11, 2, 0, 1, 1, "", ""],
    ["phantom_8c_h", 11, 2, 0, 1, 1, "", ""],
    ["phantom_9a_h", 11, 2, 0, 1, 1, "", ""],
    ["path_1", 20, 0, 0, 1, 1, "", ""],
    ["path_1_h", 20, 0, 0, 1, 1, "", ""],
    ["path_2", 20, 0, 0, 1, 1, "", ""],
    ["path_2_h", 20, 0, 0, 1, 1, "", ""],
    ["path_3", 20, 0, 0, 1, 1, "", ""],
    ["path_3_h", 20, 0, 0, 1, 1, "", ""],
    ["path_4", 20, 0, 0, 1, 1, "", ""],
    ["path_4_h", 20, 0, 0, 1, 1, "", ""],
    ["path_5", 20, 0, 0, 1, 1, "", ""],
    ["path_5_h", 20, 0, 0, 1, 1, "", ""],
    ["path_6", 20, 0, 0, 1, 1, "", ""],
    ["path_6_h", 20, 0, 0, 1, 1, "", ""],
    ["path_7a_h", 20, 0, 0, 1, 1, "", ""],
    ["path_7b_h", 20, 0, 0, 1, 1, "", ""],
    ["path_7c_h", 20, 0, 0, 1, 1, "", ""],
    ["path_8", 20, 0, 0, 1, 1, "", ""],
    ["path_8a_h", 20, 0, 0, 1, 1, "", ""],
    ["path_9", 20, 0, 0, 1, 1, "", ""],
    ["path_9b_h", 20, 0, 0, 1, 1, "", ""],
    ["path_10", 20, 0, 0, 1, 1, "", ""],
    ["path_10_h", 20, 0, 0, 1, 1, "", ""],
    ["path_11", 20, 0, 0, 1, 1, "", ""],
    ["path_11_h", 20, 0, 0, 1, 1, "", ""],
    ["path_12", 20, 0, 0, 1, 1, "", ""],
    ["path_12_h", 20, 0, 0, 1, 1, "", ""],
    ["path_13", 20, 0, 0, 1, 1, "", ""],
    ["path_13_h", 20, 0, 0, 1, 1, "", ""],
    ["path_14", 20, 0, 0, 1, 1, "", ""],
    ["path_14_h", 20, 0, 0, 1, 1, "", ""],
    ["path_15_h", 20, 0, 0, 1, 1, "", ""],
    ["path_16", 20, 0, 0, 1, 1, "", ""],
    ["path_16_h", 20, 0, 0, 1, 1, "", ""],
    ["path_17", 20, 0, 0, 1, 1, "", ""],
    ["path_18", 20, 0, 0, 1, 1, "", ""],
    ["path_19", 20, 0, 0, 1, 1, "", ""],
    ["path_18h", 20, 0, 0, 1, 1, "", ""],
    ["path_19h", 20, 0, 0, 1, 1, "", ""],
    ["trappath_1", 20, 0, 0, 1, 1, "", ""],
    ["trappath_2", 20, 0, 0, 1, 1, "", ""],
    ["trappath_3", 20, 0, 0, 1, 1, "", ""],
    ["trappath_4", 20, 0, 0, 1, 1, "", ""],
    ["cork_1a", 15, 1937, 0, 0, 1, "", ""],
    ["cork_1a_h", 15, 1937, 0, 0, 1, "", ""],
    ["cork_1b", 15, 1937, 0, 0, 1, "", ""],
    ["cork_1b_h", 15, 1937, 0, 0, 1, "", ""],
    ["cork_1c", 15, 1937, 0, 0, 1, "", ""],
    ["cork_1c_h", 15, 1937, 0, 0, 1, "", ""],
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
    ["easy", 2, 0, 0, 1, 1, "", ""],
    ["hard", 2, 0, 0, 1, 1, "", ""],
    ["vine_1", 2, 0, 0, 1, 1, "", ""],
    ["pipe_1", 2, 0, 0, 1, 1, "", ""],
    ["pipe_2", 2, 0, 0, 1, 1, "", ""],
    ["pipe_3", 2, 0, 0, 1, 1, "", ""],
    ["pipe_4", 2, 0, 0, 1, 1, "", ""],
    ["pipe_5", 2, 0, 0, 1, 1, "", ""],
    ["pipe_6", 2, 0, 0, 1, 1, "", ""],
    ["well_1", 2, 0, 0, 1, 1, "", ""],
    ["well_1e", 2, 0, 0, 1, 1, "", ""],
    ["water_1", 2, 0, 0, 1, 1, "", ""],
    ["gate_1", 2, 0, 0, 1, 1, "", ""],
    ["cage_1", 2, 0, 0, 1, 1, "", ""],
    ["cage_2", 2, 0, 0, 1, 1, "", ""],
    ["cage_3", 2, 0, 0, 1, 1, "", ""],
    ["cage_4", 2, 0, 0, 1, 1, "", ""],
    ["epicdoor", 2, 0, 0, 1, 1, "", ""],
    ["epicpad", 2, 0, 0, 1, 1, "", ""],
    ["block_1", 2, 0, 0, 1, 1, "", ""],
    ["block_2", 2, 0, 0, 1, 1, "", ""],
    ["blockicon_1", 2, 0, 0, 1, 1, "", ""],
    ["blockicon_2", 2, 0, 0, 1, 1, "", ""],
    ["pipetrig_1", 1, 69, 0, 1, 1, "", ""],
    ["pipetrig_2", 1, 69, 0, 1, 1, "", ""],
    ["pipetrig_3", 1, 69, 0, 1, 1, "", ""],
    ["pipetrig_4", 1, 69, 0, 1, 1, "", ""],
    ["pipetrig_5", 1, 69, 0, 1, 1, "", ""],
    ["pipetrig_6", 1, 69, 0, 1, 1, "", ""],
    ["key_1", 15, 1912, 0, 0, 1, "", ""],
    ["key_2a", 15, 1912, 0, 0, 1, "", ""],
    ["key_2b", 15, 1912, 0, 0, 1, "", ""],
    ["key_2c", 15, 1912, 0, 0, 1, "", ""],
    ["key_2a_h", 15, 1912, 0, 0, 1, "", ""],
    ["key_2b_h", 15, 1912, 0, 0, 1, "", ""],
    ["key_2c_h", 15, 1912, 0, 0, 1, "", ""],
    ["key_3a", 15, 1912, 0, 0, 1, "", ""],
    ["key_3b", 15, 1912, 0, 0, 1, "", ""],
    ["key_3c", 15, 1912, 0, 0, 1, "", ""],
    ["key_3a_h", 15, 1912, 0, 0, 1, "", ""],
    ["key_3b_h", 15, 1912, 0, 0, 1, "", ""],
    ["key_3c_h", 15, 1912, 0, 0, 1, "", ""],
    ["key_4a", 15, 1912, 0, 0, 1, "", ""],
    ["key_4b", 15, 1912, 0, 0, 1, "", ""],
    ["key_4c", 15, 1912, 0, 0, 1, "", ""],
    ["key_4a_h", 15, 1912, 0, 0, 1, "", ""],
    ["key_4b_h", 15, 1912, 0, 0, 1, "", ""],
    ["key_4c_h", 15, 1912, 0, 0, 1, "", ""],
    ["key_5a", 15, 1912, 0, 0, 1, "", ""],
    ["key_5b", 15, 1912, 0, 0, 1, "", ""],
    ["key_5c", 15, 1912, 0, 0, 1, "", ""],
    ["key_5a_h", 15, 1912, 0, 0, 1, "", ""],
    ["key_5b_h", 15, 1912, 0, 0, 1, "", ""],
    ["key_5c_h", 15, 1912, 0, 0, 1, "", ""],
    ["pail_1", 17, 1955, 0, 0, 1, "", ""],
    ["pail_2", 17, 1955, 0, 0, 1, "", ""],
    ["pail_2e", 17, 1955, 0, 0, 1, "", ""],
    ["pail_3", 17, 1955, 0, 0, 1, "", ""],
    ["pail_4", 17, 1955, 0, 0, 1, "", ""],
    ["pail_4e", 17, 1955, 0, 0, 1, "", ""],
    ["pail_5", 17, 1955, 0, 0, 1, "", ""],
    ["plant_1", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_2", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_3", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_4", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_5", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_6", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_7", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_8", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_9", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_10", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_11", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_12", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_13", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_14", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_16", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_17", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_18", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_19", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_20", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_21", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_22", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_23", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_24", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_25", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_26", 21, 100, 0, 1, 1, "", "wilt"],
    ["plant_27", 21, 100, 0, 1, 1, "", "wilt"],
    ["planttrig_1", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_2", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_3", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_4", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_5", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_6", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_7", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_8", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_9", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_10", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_11", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_12", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_13", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_14", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_16", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_17", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_18", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_19", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_20", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_21", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_22", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_23", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_24", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_25", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_26", 1, 67, 0, 0, 1, "", ""],
    ["planttrig_27", 1, 67, 0, 0, 1, "", ""],
    ["plantinfo_1", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo_2", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo_3", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo_4", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo_5", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo_6", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo_7", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo_8", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo_9", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo10", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo11", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo12", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo13", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo14", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo16", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo17", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo18", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo19", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo20", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo21", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo22", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo23", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo24", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo25", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo26", 1, 116, 0, 0, 1, "", ""],
    ["plantinfo27", 1, 116, 0, 0, 1, "", ""],
    ["web_2", 23, 104, 0, 1, 1, "", ""],
    ["web_4", 23, 104, 0, 1, 1, "", ""],
    ["web_6", 23, 104, 0, 1, 1, "", ""],
    ["web_8_h", 23, 104, 0, 1, 1, "", ""],
    ["web_9_h", 23, 104, 0, 1, 1, "", ""],
    ["web_10_h", 23, 104, 0, 1, 1, "", ""],
    ["web_13_h", 23, 104, 0, 1, 1, "", ""],
    ["web_1", 23, 105, 0, 1, 1, "", ""],
    ["web_3", 23, 105, 0, 1, 1, "", ""],
    ["web_5", 23, 105, 0, 1, 1, "", ""],
    ["web_7_h", 23, 105, 0, 1, 1, "", ""],
    ["web_11_h", 23, 105, 0, 1, 1, "", ""],
    ["web_12_h", 23, 105, 0, 1, 1, "", ""],
    ["blocker_h", 5, 0, 0, 1, 1, "", ""],
    ["vineblock_1", 5, 0, 0, 1, 1, "", ""],
    ["watervol_1", 5, 0, 0, 1, 1, "", ""],
    ["gateblock_1", 5, 0, 0, 1, 1, "", ""],
    ["webvol_1", 5, 0, 0, 1, 1, "", ""],
    ["webvol_2", 5, 0, 0, 1, 1, "", ""],
    ["webvol_3", 5, 0, 0, 1, 1, "", ""],
    ["webvol_4", 5, 0, 0, 1, 1, "", ""],
    ["webvol_5", 5, 0, 0, 1, 1, "", ""],
    ["webvol_6", 5, 0, 0, 1, 1, "", ""],
    ["webvol_7_h", 5, 0, 0, 1, 1, "", ""],
    ["webvol_8_h", 5, 0, 0, 1, 1, "", ""],
    ["webvol_9_h", 5, 0, 0, 1, 1, "", ""],
    ["webvol_10_h", 5, 0, 0, 1, 1, "", ""],
    ["webvol_11_h", 5, 0, 0, 1, 1, "", ""],
    ["webvol_12_h", 5, 0, 0, 1, 1, "", ""],
    ["webvol_13_h", 5, 0, 0, 1, 1, "", ""],
    ["blockvol_1", 5, 0, 0, 1, 1, "", ""],
    ["blockvol_2", 5, 0, 0, 1, 1, "", ""],
    ["exitblock_1", 5, 0, 0, 1, 1, "", ""],
    ["epicdoorcol", 5, 0, 0, 1, 1, "", ""],
    ["stone_1a", 15, 2275, 0, 0, 1, "", ""],
    ["stone_1b", 15, 2275, 0, 0, 1, "", ""],
    ["stone_1c", 15, 2275, 0, 0, 1, "", ""],
    ["stone_1d", 15, 2275, 0, 0, 1, "", ""],
    ["stone_2a", 15, 2275, 0, 0, 1, "", ""],
    ["stone_2b", 15, 2275, 0, 0, 1, "", ""],
    ["stone_2c", 15, 2275, 0, 0, 1, "", ""],
    ["stone_2d", 15, 2275, 0, 0, 1, "", ""],
    ["stone_3a", 15, 2275, 0, 0, 1, "", ""],
    ["stone_3b", 15, 2275, 0, 0, 1, "", ""],
    ["stone_3c", 15, 2275, 0, 0, 1, "", ""],
    ["stone_3d", 15, 2275, 0, 0, 1, "", ""],
    ["stone_1a_h", 15, 2275, 0, 0, 1, "", ""],
    ["stone_1b_h", 15, 2275, 0, 0, 1, "", ""],
    ["stone_1c_h", 15, 2275, 0, 0, 1, "", ""],
    ["stone_1d_h", 15, 2275, 0, 0, 1, "", ""],
    ["stone_2a_h", 15, 2275, 0, 0, 1, "", ""],
    ["stone_2b_h", 15, 2275, 0, 0, 1, "", ""],
    ["stone_2c_h", 15, 2275, 0, 0, 1, "", ""],
    ["stone_2d_h", 15, 2275, 0, 0, 1, "", ""],
    ["stone_3a_h", 15, 2275, 0, 0, 1, "", ""],
    ["stone_3b_h", 15, 2275, 0, 0, 1, "", ""],
    ["stone_3c_h", 15, 2275, 0, 0, 1, "", ""],
    ["stone_3d_h", 15, 2275, 0, 0, 1, "", ""],
    ["checkpoint_1", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["checkpoint_2", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["checkpoint_3", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["waterfall", 16, "ajq_waterfall_lp", 0, 0, 1, "", ""],
    ["sludge_1", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge_2", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge_3", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge_4", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge_5", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge_6", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["pipeinfo_1", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo_2", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo_3", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo_4", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo_5", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo_6", 1, 116, 0, 0, 1, "", ""],
    ["phantomcount", 7, 0, 0, 0, 1, "", ""],
    ["pipecount", 7, 0, 0, 0, 1, "", ""],
    ["notifycount", 7, 0, 0, 0, 1, "", ""],
    ["monkeychat", 7, 0, 0, 0, 1, "", ""],
    ["trapcount", 7, 0, 0, 0, 1, "", ""],
    ["timer_1", 8, 0, 0, 0, 1, "", ""],
    ["chattimer", 8, 0, 0, 0, 1, "", ""],
    ["gifttimer", 8, 0, 0, 0, 1, "", ""],
    ["blocktimer_1", 8, 0, 0, 0, 1, "", ""],
    ["blocktimer_2", 8, 0, 0, 0, 1, "", ""],
    ["treasure_1", 13, 39, 0, 1, 1, "", ""],
    ["treasure_2", 13, 39, 0, 1, 1, "", ""],
    ["treasure_3", 13, 39, 0, 1, 1, "", ""],
    ["treasure_4e", 13, 39, 0, 1, 1, "", ""],
    ["treasure_4h", 13, 39, 0, 1, 1, "", ""],
    ["treasure_5", 13, 39, 0, 1, 1, "", ""],
    ["treasure_6", 13, 39, 0, 1, 1, "", ""],
    ["treasure_7", 13, 39, 0, 1, 1, "", ""],
    ["treasure_8", 13, 39, 0, 1, 1, "", ""],
    ["gatetrig_1", 1, 44, 0, 1, 1, "", ""],
    ["roomtrig_1", 1, 44, 0, 1, 1, "", ""],
    ["trapkey_1", 1, 44, 0, 1, 1, "", ""],
    ["trapkey_2", 1, 44, 0, 1, 1, "", ""],
    ["trapkey_3", 1, 44, 0, 1, 1, "", ""],
    ["trapkey_4", 1, 44, 0, 1, 1, "", ""],
    ["trapped_1", 1, 106, 0, 1, 1, "", ""],
    ["trapped_2", 1, 107, 0, 1, 1, "", ""],
    ["trapped_3", 1, 108, 0, 1, 1, "", ""],
    ["trapped_4", 1, 109, 0, 1, 1, "", ""],
    ["blocktrig_1", 1, 52, 0, 1, 1, "", ""],
    ["blocktrig_2", 1, 54, 0, 1, 1, "", ""],
    ["cheatchq1", 3, 0, 0, 1, 1, "", ""],
    ["cheatchq2", 3, 0, 0, 1, 1, "", ""],
    ["social_1", 24, 200, 0, 0, 1, "", ""],
    ["portal_1", 2, 0, 0, 0, 1, "", ""],
    ["phantom_port", 16, "ajq_portalstate1lp", 0, 1, 1, "", ""],
    ["gem_placed", 16, "ajq_portalstate2lp", 0, 0, 1, "", ""],
    ["portal_clear", 16, "ajq_portalstate3lp", 0, 0, 1, "", ""],
    ["roomtrig_1b", 3, 0, 0, 1, 1, "", ""],
    ["roomtrig_2", 3, 0, 0, 1, 1, "", ""],
    ["notify_keys", 3, 0, 0, 1, 1, "", ""],
    ["trapvol_1", 3, 0, 0, 1, 1, "", ""],
    ["trapvol_2", 3, 0, 0, 1, 1, "", ""],
    ["trapvol_3", 3, 0, 0, 1, 1, "", ""],
    ["trapvol_4", 3, 0, 0, 1, 1, "", ""],
    ["chatvol_1", 3, 0, 0, 0, 1, "", ""],
    ["secretvol1", 3, 0, 0, 1, 1, "", ""],
    ["secretvol2", 3, 0, 0, 1, 1, "", ""],
    ["secretvol3", 3, 0, 0, 1, 1, "", ""],
    ["secretvol4", 3, 0, 0, 1, 1, "", ""],
    ["secretvol5", 3, 0, 0, 1, 1, "", ""],
    ["exitvol_1", 3, 0, 0, 0, 1, "", ""],
    ["slidevol_1", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_2", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_4", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_5", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_7", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_8", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_10", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_11", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_15", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_17", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_18", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_19", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_20", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_21", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_24", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_25", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_26", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_3", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_6", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_9", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_12", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_16", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_22", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_23", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_27", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_13", 3, 0, 0, 1, 1, "", ""],
    ["slidevol_14", 3, 0, 0, 1, 1, "", ""],
    ["players", 7, 0, 0, 1, 1, "", ""],
    ["00_uri", 7, 0, 0, 0, 1, "", ""],
    ["10_uri", 7, 0, 0, 0, 1, "", ""],
    ["20_uri", 7, 0, 0, 0, 1, "", ""],
    ["30_uri", 7, 0, 0, 0, 1, "", ""],
    ["40_uri", 7, 0, 0, 0, 1, "", ""],
    ["50_uri", 7, 0, 0, 0, 1, "", ""],
    ["diff_level", 7, 0, 0, 1, 1, "", ""],
    ["live_players", 7, 0, 1, 0, 1, "", ""],
  ],

  on: {
    loaded(q) {
      // step 143
      q.send("qsndpk", 2364);
    },

    // walked into, or clicked
    trigger: {
      treasure_1(q) {
        q.send("qatt", "treasure_1", 3, 50, 0, 1); // the chest opens
      },
      treasure_2(q) {
        q.send("qatt", "treasure_2", 3, 200, 0, 1); // the chest opens
      },
      treasure_3(q) {
        q.send("qatt", "treasure_3", 3, 300, 0, 1); // the chest opens
      },
      treasure_4e(q) {
        q.send("qatt", "treasure_4e", 3, 50, 0, 1); // the chest opens
      },
      treasure_4h(q) {
        q.send("qatt", "treasure_4h", 3, 400, 0, 1); // the chest opens
      },
      treasure_5(q) {
        // by hand: the fox passage's chest holds clothing (the wiki's list), not gems
        q.send("qatt", "treasure_5", 2, ...passageClothing(q, "treasure_5", {hard: true}), 1); // the chest opens
      },
      treasure_6(q) {
        // by hand: the lion passage's chest (hard mode) holds the Slingshot
        q.send("qatt", "treasure_6", 2, ...passageClothing(q, "treasure_6", {only: SLINGSHOT}), 1); // the chest opens
      },
      treasure_7(q) {
        q.send("qatt", "treasure_7", 3, 50, 0, 1); // the chest opens
      },
      treasure_8(q) {
        q.send("qatt", "treasure_8", 3, 400, 0, 1); // the chest opens
      },
      gatetrig_1(q) {
        const held = q.held(); // what the player carried when this fired
        // step 1: unless holding key_1
        if (held !== "key_1") {
          q.send("qcmd", 2, "gatetrig_1", 3679, 0);
        }
        // step 11: only while holding key_1, once
        if (held === "key_1" && once(q, "step11")) {
          q.use();
          set(q, "gate_1", 1, 1, 0);
          set(q, "gateblock_1", 1, 0, 0);
          q.xp(25, "gatetrig_1");
          q.send("qcmd", 38, 3701);
          set(q, "gatetrig_1", 1, 0, 0);
        }
      },
      pipeinfo_1(q) {
        // step 2
        q.send("qcmd", 2, "pipeinfo_1", 3468, 2);
        q.after(210, () => {
          set(q, "pipeinfo_1", 0, 0, 0);
        });
      },
      questready(q) {
        const n = tally(q, "trigger questready");
        // step 3: the 1st time
        if (n === 1) {
          set(q, "liza_1", 99, 0, 0);
          q.send("qcmdVT", 1, "start_init", 1, 0, 0);
          q.after(850, () => {
            appear(q, "liza_1");
            set(q, "water_1", 1, 1, 0);
            set(q, "well_1", 1, 1, 0);
          });
        }
        // step 4: the 2nd time
        if (n === 2) {
          q.after(1370, () => {
            appear(q, "liza_2");
          });
        }
      },
      liza_1(q) {
        // step 5
        set(q, "easy", 99, 0, 0);
        set(q, "well_1e", 99, 0, 0);
        set(q, "blocker_h", 99, 0, 0);
        set(q, "treasure_4e", 99, 0, 0);
        set(q, variant(q, "cork_1", "_h", "abc"), 1, 1, 0);
        set(q, variant(q, "cork_2", "_h", "abc"), 1, 1, 0);
        set(q, variant(q, "cork_3", "_h", "abc"), 1, 1, 0);
        set(q, variant(q, "cork_4", "_h", "abc"), 1, 1, 0);
        set(q, variant(q, "cork_5", "_h", "abc"), 1, 1, 0);
        set(q, variant(q, "cork_6", "_h", "abc"), 1, 1, 0);
        set(q, variant(q, "key_2", "_h", "abc"), 1, 1, 0);
        set(q, variant(q, "key_3", "_h", "abc"), 1, 1, 0);
        set(q, variant(q, "key_4", "_h", "abc"), 1, 1, 0);
        set(q, variant(q, "key_5", "_h", "abc"), 1, 1, 0);
        q.send("qsp", variant(q, "phantom_1", "", "ab"), "path_1");
        set(q, variant(q, "phantom_1", "", "ab"), 1, 1, 1);
        q.send("qsp", variant(q, "phantom_2", "", "ab"), "path_2");
        set(q, variant(q, "phantom_2", "", "ab"), 1, 1, 1);
        q.send("qsp", variant(q, "phantom_3", "", "ab"), "path_3");
        set(q, variant(q, "phantom_3", "", "ab"), 1, 1, 1);
        q.send("qsp", variant(q, "phantom_6", "", "ab"), "path_6");
        set(q, variant(q, "phantom_6", "", "ab"), 1, 1, 1);
        q.after(500, () => {
          q.send("qcmd", 3, 0, "liza_1", 1, 3678);
          q.after(320, () => {
            set(q, "portal_1", 2, 1, 0);
            set(q, variant(q, "stone_1", "_h", "abcd"), 1, 1, 0);
            set(q, variant(q, "stone_2", "_h", "abcd"), 1, 1, 0);
            set(q, variant(q, "stone_3", "_h", "abcd"), 1, 1, 0);
          });
        });
      },
      phantom__17h__give_gem(q) {
        // step 8: once
        if (once(q, "step8")) {
          q.send("qad", "phantom__17h__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phantom_6a__give_gem(q) {
        // step 9: once
        if (once(q, "step9")) {
          q.send("qad", "phantom_6a__give_gem", 0, "null");
          q.gems(50);
        }
      },
      roomtrig_1(q) {
        // step 12
        q.send("qcmd", 2, "roomtrig_1", 3702, 0);
      },
      notify_keys(q) {
        // step 18
        q.send("qcmd", 38, 3669);
        set(q, "notify_keys", 1, 0, 0);
      },
      phantom19__c__give_gem(q) {
        // step 56: once
        if (once(q, "step56")) {
          q.send("qad", "phantom19__c__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phantom19__b__give_gem(q) {
        // step 57: once
        if (once(q, "step57")) {
          q.send("qad", "phantom19__b__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phantom19__a__give_gem(q) {
        // step 58: once
        if (once(q, "step58")) {
          q.send("qad", "phantom19__a__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phantom_8b_h__give_gem(q) {
        // step 74: once
        if (once(q, "step74")) {
          q.send("qad", "phantom_8b_h__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phantom_9a_h__give_gem(q) {
        // step 80: once
        if (once(q, "step80")) {
          q.send("qad", "phantom_9a_h__give_gem", 0, "null");
          q.gems(25);
        }
      },
      chatvol_1(q) {
        // step 86 (by hand: the monkeys' lines are their own chat, see monkeyChat)
        set(q, "chatvol_1", 2, 0, 0);
      },
      roomtrig_1b(q) {
        // step 87: once
        if (once(q, "step87")) {
          q.room("tocave", "tocave");
          q.send("qcmdVT", 1, "cave_init", 1, 0, 0);
        }
      },
      liza_2(q) {
        const held = q.held(); // what the player carried when this fired
        // by hand: by how many crystals she has, whichever they are, not by
        // which one or how often she was talked to (the recording brought them 1, 3, 2)
        q.vars.crystals = q.vars.crystals || 0;
        if (once(q, "liza intro")) {
          set(q, "liza_2", 9, 1, 1);
          q.send("qcmd", 3, 0, "liza_2", 9, 3672);
          return;
        }
        if (/^stone_[123][abcd]_h$/.test(held || "") && q.vars.crystals < 3) {
          q.use();
          q.vars.crystals++;
          const [state, line] = [[3, 3673], [5, 3674], [7, 3675]][q.vars.crystals - 1];
          if (q.vars.crystals === 3) {
            q.send("qcmdVT", 1, "40_uri", 1, 0, 0);
            q.send("qposturi", "/adventure2-thephantomportal/#40-gatherthealphastones/#0#101");
            q.send("qcmdVT", 1, "40_uri", 99, 0, 0);
            set(q, "phantom_port", 1, 0, 0);
            set(q, "gem_placed", 0, 0, 0);
            set(q, "portal_clear", 1, 1, 0);
            set(q, "portal_1", 6, 1, 0);
            q.send("qswfs", "liza_2", "idle");
          }
          set(q, "liza_2", state, 1, 1);
          q.send("qcmd", 3, 0, "liza_2", state, line);
          return;
        }
        if (q.vars.crystals < 3) {
          q.send("qcmd", 2, "liza_2", 3676, 0);
        }
      },
      slidevol_19(q) {
        // step 100
        q.send("qsnd", "ajq_slidesingle");
      },
      slidevol_20(q) {
        // step 101
        q.send("qsnd", "ajq_slidesingle");
      },
      slidevol_22(q) {
        // step 102
        q.send("qsnd", "ajq_slidedouble");
      },
      slidevol_1(q) {
        // step 104
        q.send("qsnd", "ajq_slidesingle");
      },
      slidevol_11(q) {
        // step 105
        q.send("qsnd", "ajq_slidesingle");
      },
      slidevol_25(q) {
        // step 106
        q.send("qsnd", "ajq_slidesingle");
      },
      slidevol_27(q) {
        // step 107
        q.send("qsnd", "ajq_slidedouble");
      },
      slidevol_24(q) {
        // step 108
        q.send("qsnd", "ajq_slidesingle");
      },
      exitvol_1(q) {
        // step 111
        q.send("qcmd", 19);
      },
      social_1(q) {
        // social_1 starts hidden: nothing until the script shows it
        if (!(q.vars.shown || {})["social_1"]) {
          return;
        }
        // keep at it to fill epicdoor
        fill(q, "epicdoor", () => {
          q.vars.gateOpen = true; // the monkeys stop their chat
          set(q, "epicdoorcol", 1, 0, 0);
          set(q, "roomtrig_1", 1, 0, 0);
          set(q, "epicpad", 1, 1, 0);
          set(q, "social_1", 2, 1, 1);
          q.xp(25, "social_1");
          q.send("qcmdVT", 1, "30_uri", 1, 0, 0);
          q.send("qposturi", "/adventure2-thephantomportal/#30-rescuethemonkeys/#0#101");
          q.send("qcmdVT", 1, "30_uri", 99, 0, 0);
          q.send("qcmd", 38, 3694);
        }, {});
      },
    },

    // families of triggers: the rule for any of them; {n} is its number
    triggerLike: [
      [/^pipetrig_(\d+)$/, (q, name) => {
        const n = name.match(/^pipetrig_(\d+)$/)[1];
        const held = q.held(); // what the player carried when this fired
        // pipetrig_1, unless holding cork_#_h
        if (name === "pipetrig_1" && !/^cork_\d+[a-z]?_h$/.test(held || "")) {
          // step 112
          set(q, "pipeinfo_1", 1, 1, 1);
          q.send("qcmd", 2, "pipeinfo_1", 3468, 2);
        }
        // pipetrig_6, unless holding cork_#_h
        if (name === "pipetrig_6" && !/^cork_\d+[a-z]?_h$/.test(held || "")) {
          // step 113
          set(q, "pipeinfo_6", 1, 1, 1);
          q.send("qcmd", 2, "pipeinfo_6", 3468, 2);
        }
        // pipetrig_5, the Nth time, unless holding cork_#_h
        if (name === "pipetrig_5" && !/^cork_\d+[a-z]?_h$/.test(held || "")) {
          const k = tally(q, "pipetrig_# - pipetrig_5");
          // step 114: the 1st time
          if (k === 1) {
            set(q, "pipeinfo_5", 1, 1, 1);
            q.send("qcmd", 2, "pipeinfo_5", 3468, 2);
          }
          // step 115: the 2nd time
          if (k === 2) {
            q.send("qcmd", 2, "pipeinfo_5", 3468, 2);
          }
        }
        // in the order they are done, holding cork_#_h, once each
        if (/^cork_\d+[a-z]?_h$/.test(held || "") && once(q, "pipetrig_# cork_#_h " + name)) {
          const k = tally(q, "pipetrig_# cork_#_h");
          // step 116: every one
          q.use();
          set(q, `${name}`, 1, 0, 0);
          set(q, `pipe_${n}`, 1, 1, 0);
          q.send("qcmdVT", 1, "pipecount", bump(q, "pipecount"), 0, 0); // one more than last time
          counted(q, "pipecount"); // what that count sets off
          set(q, `sludge_${n}`, 1, 0, 0);
          q.xp(5, `${name}`);
          // step 117: the 1st one done
          if (k === 1) {
            q.send("qcmdVT", 1, "pipecount", bump(q, "pipecount"), 0, 0); // one more than last time
            counted(q, "pipecount"); // what that count sets off
          }
        }
      }],
      [/^planttrig_(\d+)$/, (q, name) => {
        const n = name.match(/^planttrig_(\d+)$/)[1];
        const held = q.held(); // what the player carried when this fired
        // each of them, holding pail_#, once each
        // by hand: the plant's own "?" (plantinfo_1 to _9, then plantinfo10 on)
        const info = Number(n) < 10 ? `plantinfo_${n}` : `plantinfo${n}`;
        // by hand: without water, the plant says what it needs (as Meet Cosmo's do; not recorded here)
        if (!/^pail_\d+[a-z]?$/.test(held || "") && !(q.vars.done || new Set()).has("planttrig_# pail_# " + name)) {
          set(q, info, 1, 1, 1);
          q.send("qcmd", 2, info, 3703, 2);
        }
        if (/^pail_\d+[a-z]?$/.test(held || "") && once(q, "planttrig_# pail_# " + name)) {
          set(q, info, 0, 0, 0);
          // step 118
          q.use();
          set(q, `${name}`, 2, 0, 0);
          q.xp(5, `${name}`);
          q.send("qswfs", `plant_${n}`, "revive");
          set(q, `plant_${n}`, 1, 1, 0);
        }
      }],
      [/^phantom_(\d+)__give_gem$/, (q, name) => {
        const n = name.match(/^phantom_(\d+)__give_gem$/)[1];
        // each of them, once each
        if (once(q, "phantom_#__give_gem - " + name)) {
          // step 119
          q.send("qad", `${name}`, 0, "null");
          q.gems(25);
        }
      }],
      [/^phantom_(\d+)b__give_gem$/, (q, name) => {
        const n = name.match(/^phantom_(\d+)b__give_gem$/)[1];
        // each of them, once each
        if (once(q, "phantom_#b__give_gem - " + name)) {
          // step 120
          q.send("qad", `${name}`, 0, "null");
          q.gems(25);
        }
      }],
      [/^secretvol(\d+)$/, (q, name) => {
        const n = name.match(/^secretvol(\d+)$/)[1];
        // each of them
        {
          // step 121
          q.send("qsnd", "ajq_mussecretareast");
        }
      }],
      [/^phantom_(\d+)_h__give_gem$/, (q, name) => {
        const n = name.match(/^phantom_(\d+)_h__give_gem$/)[1];
        // each of them, once each
        if (once(q, "phantom_#_h__give_gem - " + name)) {
          // step 122
          q.send("qad", `${name}`, 0, "null");
          q.gems(25);
        }
      }],
      [/^trapvol_(\d+)$/, (q, name) => {
        const n = name.match(/^trapvol_(\d+)$/)[1];
        // each of them
        {
          // step 123
          q.send("qcmdVT", 1, "notifycount", bump(q, "notifycount"), 0, 0); // one more than last time
          counted(q, "notifycount"); // what that count sets off
          set(q, `trapped_${n}`, 1, 1, 1);
          set(q, `trapped_${n}`, 2, 1, 0);
        }
      }],
      [/^trapkey_(\d+)$/, (q, name) => {
        const n = name.match(/^trapkey_(\d+)$/)[1];
        const held = q.held(); // what the player carried when this fired
        // each of them, unless holding key_#_h
        if (!/^key_\d+[a-z]?_h$/.test(held || "")) {
          // step 124
          q.send("qcmd", 2, `${name}`, 3708, 0);
        }
        // each of them, holding key_#_h, once each
        if (/^key_\d+[a-z]?_h$/.test(held || "") && once(q, "trapkey_# key_#_h " + name)) {
          // step 126
          q.use();
          set(q, `trapvol_${n}`, 1, 0, 0);
          set(q, `${name}`, 1, 0, 0);
          set(q, `cage_${n}`, 1, 1, 0);
          set(q, `trapped_${n}`, 3, 1, 1);
          q.send("qsp", `trapped_${n}`, `trappath_${n}`);
          set(q, `trapped_${n}`, 4, 1, 1);
          q.send("qcmdVT", 1, "trapcount", bump(q, "trapcount"), 0, 0); // one more than last time
          counted(q, "trapcount"); // what that count sets off
          q.xp(10, `${name}`);
        }
        // trapkey_3, holding key_#_h, once each
        if (name === "trapkey_3" && /^key_\d+[a-z]?_h$/.test(held || "") && once(q, "trapkey_# key_#_h trapkey_3 " + name)) {
          // step 127
          q.send("qcmd", 2, "trapped_3", 3689, 1);
        }
        // trapkey_2, holding key_#_h, once each
        if (name === "trapkey_2" && /^key_\d+[a-z]?_h$/.test(held || "") && once(q, "trapkey_# key_#_h trapkey_2 " + name)) {
          // step 128
          q.send("qcmd", 2, "trapped_2", 3687, 1);
        }
        // trapkey_1, holding key_#_h, once each
        if (name === "trapkey_1" && /^key_\d+[a-z]?_h$/.test(held || "") && once(q, "trapkey_# key_#_h trapkey_1 " + name)) {
          // step 129
          q.send("qcmd", 2, "trapped_1", 3685, 1);
        }
        // trapkey_4, holding key_#_h, once each
        if (name === "trapkey_4" && /^key_\d+[a-z]?_h$/.test(held || "") && once(q, "trapkey_# key_#_h trapkey_4 " + name)) {
          // step 130
          q.send("qcmd", 2, "trapped_4", 3691, 1);
        }
      }],
      [/^phantom_(\d+)h__give_gem$/, (q, name) => {
        const n = name.match(/^phantom_(\d+)h__give_gem$/)[1];
        // each of them, once each
        if (once(q, "phantom_#h__give_gem - " + name)) {
          // step 125
          q.send("qad", `${name}`, 0, "null");
          q.gems(25);
        }
      }],
      [/^trapped_(\d+)$/, (q, name) => {
        const n = name.match(/^trapped_(\d+)$/)[1];
        // each of them, once each
        if (once(q, "trapped_# - " + name)) {
          // step 131
          q.send("qsp", `${name}`, "");
          q.send("qswfs", `${name}`, "hop");
          set(q, `${name}`, 5, 1, 0);
          q.send("qcmdVT", 1, "monkeychat", bump(q, "monkeychat"), 0, 0); // one more than last time
          counted(q, "monkeychat"); // what that count sets off
        }
      }],
    ],

    // a talk read to its end
    answer: {
      liza_1(q) {
        // step 6: once
        if (once(q, "step6")) {
          q.send("qcmdVT", 1, "00_uri", 1, 0, 0);
          q.send("qcmdVT", 1, "players", 1, 0, 0);
          q.send("qposturi", "/adventure2-thephantomportal/#00-start/#0#101");
          q.send("qcmdVT", 1, "00_uri", 99, 0, 0);
          set(q, "vine_1", 1, 1, 0);
          set(q, "vineblock_1", 1, 0, 0);
          q.send("qcmd", 38, 3666);
          q.send("qswfs", "liza_1", "disappear");
          set(q, "liza_1", 2, 1, 1);
          set(q, "liza_1", 3, 1, 0);
        }
      },
      liza_2(q, state) {
        // by hand: by which of her talks was read (its state), not how many
        if (state === "9" && once(q, "liza answer 9")) {
          q.send("qswfs", "liza_2", "castmagicloop");
          set(q, "liza_2", 2, 1, 1);
          q.send("qcmd", 38, 3695);
        }
        if (state === "3" && once(q, "liza answer 3")) {
          set(q, "gem_placed", 1, 1, 0);
          set(q, "portal_1", 4, 1, 0);
          set(q, "liza_2", 4, 1, 1);
          q.send("qcmd", 38, 3696); // (by hand: recorded late, on a later talk)
        }
        if (state === "5" && once(q, "liza answer 5")) {
          set(q, "portal_1", 5, 1, 0);
          set(q, "liza_2", 6, 1, 1);
          q.send("qcmd", 38, 3697);
        }
        if (state === "7" && once(q, "liza answer 7")) {
          q.xp(50, "liza_2");
          q.send("qcmd", 38, 3576);
          set(q, "liza_2", 8, 1, 0);
          q.send("qcmdVT", 1, "50_uri", 1, 0, 0);
          q.send("qposturi", "/adventure2-thephantomportal/#50-exit/#0#101");
          q.offer([[2,213,-261551589],[3,1500,1500],[2,136,706024753],[3,1000,1000],[2,338,677794049]]); // [1, den item, 0], [2, clothing item, ?] or [3, gems, gems]
          q.after(3000, () => {
            set(q, "exitblock_1", 1, 0, 0);
            set(q, "exitvol_1", 1, 1, 1);
          });
        }
      },
    },

    // hit by the player (adventures.js needs its handler, see the maker)
    attacked: {
      web_1(q) {
        const n = tally(q, "attacked web_1");
        // step 13: the 1st time
        if (n === 1) {
          q.send("qahs", "web_1", 80, 10, 0);
        }
        // step 14: the 2nd time
        if (n === 2) {
          q.send("qahs", "web_1", 60, 10, 0);
        }
        // step 15: the 3rd time
        if (n === 3) {
          q.send("qahs", "web_1", 40, 10, 0);
        }
        // step 16: the 4th time
        if (n === 4) {
          q.send("qahs", "web_1", 20, 10, 0);
        }
        // step 17: the 5th time
        if (n === 5) {
          q.send("qad", "web_1", 10, 0, 1194, 838, "");
          q.xp(5, "web_1");
          set(q, "webvol_1", 1, 0, 0);
          q.xp(2);
        }
      },
      web_3(q) {
        const n = tally(q, "attacked web_3");
        // step 19: the 1st time
        if (n === 1) {
          q.send("qahs", "web_3", 80, 10, 0);
        }
        // step 20: the 2nd time
        if (n === 2) {
          q.send("qahs", "web_3", 60, 10, 0);
        }
        // step 21: the 3rd time
        if (n === 3) {
          q.send("qahs", "web_3", 40, 10, 0);
        }
        // step 22: the 4th time
        if (n === 4) {
          q.send("qahs", "web_3", 20, 10, 0);
        }
        // step 23: the 5th time
        if (n === 5) {
          q.send("qad", "web_3", 10, 0, -600, 237, "");
          q.xp(5, "web_3");
          set(q, "webvol_3", 1, 0, 0);
          q.xp(2);
        }
      },
      web_4(q) {
        const n = tally(q, "attacked web_4");
        // step 24: the 1st time
        if (n === 1) {
          q.send("qahs", "web_4", 80, 10, 0);
        }
        // step 25: the 2nd time
        if (n === 2) {
          q.send("qahs", "web_4", 60, 10, 0);
        }
        // step 26: the 3rd time
        if (n === 3) {
          q.send("qahs", "web_4", 40, 10, 0);
        }
        // step 27: the 4th time
        if (n === 4) {
          q.send("qahs", "web_4", 20, 10, 0);
        }
        // step 28: the 5th time
        if (n === 5) {
          q.send("qad", "web_4", 10, 0, -849, -299, "");
          q.xp(5, "web_4");
          set(q, "webvol_4", 1, 0, 0);
          q.xp(2);
        }
      },
      web_2(q) {
        const n = tally(q, "attacked web_2");
        // step 29: the 1st time
        if (n === 1) {
          q.send("qahs", "web_2", 80, 10, 0);
        }
        // step 30: the 2nd time
        if (n === 2) {
          q.send("qahs", "web_2", 60, 10, 0);
        }
        // step 31: the 3rd time
        if (n === 3) {
          q.send("qahs", "web_2", 40, 10, 0);
        }
        // step 32: the 4th time
        if (n === 4) {
          q.send("qahs", "web_2", 20, 10, 0);
        }
        // step 33: the 5th time
        if (n === 5) {
          q.send("qad", "web_2", 10, 0, 569, -298, "");
          q.xp(5, "web_2");
          set(q, "webvol_2", 1, 0, 0);
          q.xp(2);
        }
      },
      web_5(q) {
        const n = tally(q, "attacked web_5");
        // step 35: the 1st time
        if (n === 1) {
          q.send("qahs", "web_5", 80, 10, 0);
        }
        // step 36: the 2nd time
        if (n === 2) {
          q.send("qahs", "web_5", 60, 10, 0);
        }
        // step 37: the 3rd time
        if (n === 3) {
          q.send("qahs", "web_5", 40, 10, 0);
        }
        // step 38: the 4th time
        if (n === 4) {
          q.send("qahs", "web_5", 20, 10, 0);
        }
        // step 39: the 5th time
        if (n === 5) {
          q.send("qad", "web_5", 10, 0, -1525, -59, "");
          q.xp(5, "web_5");
          set(q, "webvol_5", 1, 0, 0);
          q.xp(2);
        }
      },
      web_9_h(q) {
        const n = tally(q, "attacked web_9_h");
        // step 41: the 1st time
        if (n === 1) {
          q.send("qahs", "web_9_h", 80, 10, 0);
        }
        // step 42: the 2nd time
        if (n === 2) {
          q.send("qahs", "web_9_h", 60, 10, 0);
        }
        // step 43: the 3rd time
        if (n === 3) {
          q.send("qahs", "web_9_h", 40, 10, 0);
        }
        // step 44: the 4th time
        if (n === 4) {
          q.send("qahs", "web_9_h", 20, 10, 0);
        }
        // step 45: the 5th time
        if (n === 5) {
          q.send("qad", "web_9_h", 10, 0, -1883, -2984, "");
          q.xp(5, "web_9_h");
          set(q, "webvol_9_h", 1, 0, 0);
          q.xp(2);
        }
      },
      web_12_h(q) {
        const n = tally(q, "attacked web_12_h");
        // step 46: the 1st time
        if (n === 1) {
          q.send("qahs", "web_12_h", 80, 10, 0);
        }
        // step 47: the 2nd time
        if (n === 2) {
          q.send("qahs", "web_12_h", 60, 10, 0);
        }
        // step 48: the 3rd time
        if (n === 3) {
          q.send("qahs", "web_12_h", 40, 10, 0);
        }
        // step 49: the 4th time
        if (n === 4) {
          q.send("qahs", "web_12_h", 20, 10, 0);
        }
        // step 50: the 5th time
        if (n === 5) {
          q.send("qad", "web_12_h", 10, 0, -2188, -3909, "");
          q.xp(5, "web_12_h");
          set(q, "webvol_12_h", 1, 0, 0);
          q.xp(2);
        }
      },
      web_6(q) {
        const n = tally(q, "attacked web_6");
        // step 51: the 1st time
        if (n === 1) {
          q.send("qahs", "web_6", 80, 10, 0);
        }
        // step 52: the 2nd time
        if (n === 2) {
          q.send("qahs", "web_6", 60, 10, 0);
        }
        // step 53: the 3rd time
        if (n === 3) {
          q.send("qahs", "web_6", 40, 10, 0);
        }
        // step 54: the 4th time
        if (n === 4) {
          q.send("qahs", "web_6", 20, 10, 0);
        }
        // step 55: the 5th time
        if (n === 5) {
          q.send("qad", "web_6", 10, 0, -2796, 151, "");
          q.xp(5, "web_6");
          set(q, "webvol_6", 1, 0, 0);
          q.xp(2);
        }
      },
      web_7_h(q) {
        const n = tally(q, "attacked web_7_h");
        // step 59: the 1st time
        if (n === 1) {
          q.send("qahs", "web_7_h", 80, 10, 0);
        }
        // step 60: the 2nd time
        if (n === 2) {
          q.send("qahs", "web_7_h", 60, 10, 0);
        }
        // step 61: the 3rd time
        if (n === 3) {
          q.send("qahs", "web_7_h", 40, 10, 0);
        }
        // step 62: the 4th time
        if (n === 4) {
          q.send("qahs", "web_7_h", 20, 10, 0);
        }
        // step 63: the 5th time
        if (n === 5) {
          q.send("qad", "web_7_h", 10, 0, -4727, 432, "");
          q.xp(5, "web_7_h");
          set(q, "webvol_7_h", 1, 0, 0);
          q.xp(2);
        }
      },
      web_8_h(q) {
        const n = tally(q, "attacked web_8_h");
        // step 64: the 1st time
        if (n === 1) {
          q.send("qahs", "web_8_h", 80, 10, 0);
        }
        // step 65: the 2nd time
        if (n === 2) {
          q.send("qahs", "web_8_h", 60, 10, 0);
        }
        // step 66: the 3rd time
        if (n === 3) {
          q.send("qahs", "web_8_h", 40, 10, 0);
        }
        // step 67: the 4th time
        if (n === 4) {
          q.send("qahs", "web_8_h", 20, 10, 0);
        }
        // step 68: the 5th time
        if (n === 5) {
          q.send("qad", "web_8_h", 10, 0, -4293, -1947, "");
          q.xp(5, "web_8_h");
          set(q, "webvol_8_h", 1, 0, 0);
          q.xp(2);
        }
      },
      web_11_h(q) {
        const n = tally(q, "attacked web_11_h");
        // step 69: the 1st time
        if (n === 1) {
          q.send("qahs", "web_11_h", 80, 10, 0);
        }
        // step 70: the 2nd time
        if (n === 2) {
          q.send("qahs", "web_11_h", 60, 10, 0);
        }
        // step 71: the 3rd time
        if (n === 3) {
          q.send("qahs", "web_11_h", 40, 10, 0);
        }
        // step 72: the 4th time
        if (n === 4) {
          q.send("qahs", "web_11_h", 20, 10, 0);
        }
        // step 73: the 5th time
        if (n === 5) {
          q.send("qad", "web_11_h", 10, 0, -4127, -3167, "");
          q.xp(5, "web_11_h");
          set(q, "webvol_11_h", 1, 0, 0);
          q.xp(2);
        }
      },
      web_10_h(q) {
        const n = tally(q, "attacked web_10_h");
        // step 75: the 1st time
        if (n === 1) {
          q.send("qahs", "web_10_h", 80, 10, 0);
        }
        // step 76: the 2nd time
        if (n === 2) {
          q.send("qahs", "web_10_h", 60, 10, 0);
        }
        // step 77: the 3rd time
        if (n === 3) {
          q.send("qahs", "web_10_h", 40, 10, 0);
        }
        // step 78: the 4th time
        if (n === 4) {
          q.send("qahs", "web_10_h", 20, 10, 0);
        }
        // step 79: the 5th time
        if (n === 5) {
          q.send("qad", "web_10_h", 10, 0, -4053, -3876, "");
          q.xp(5, "web_10_h");
          set(q, "webvol_10_h", 1, 0, 0);
          q.xp(2);
        }
      },
      web_13_h(q) {
        const n = tally(q, "attacked web_13_h");
        // step 81: the 1st time
        if (n === 1) {
          q.send("qahs", "web_13_h", 80, 10, 0);
        }
        // step 82: the 2nd time
        if (n === 2) {
          q.send("qahs", "web_13_h", 60, 10, 0);
        }
        // step 83: the 3rd time
        if (n === 3) {
          q.send("qahs", "web_13_h", 40, 10, 0);
        }
        // step 84: the 4th time
        if (n === 4) {
          q.send("qahs", "web_13_h", 20, 10, 0);
        }
        // step 85: the 5th time
        if (n === 5) {
          q.send("qad", "web_13_h", 10, 0, -968, -1894, "");
          q.xp(5, "web_13_h");
          set(q, "webvol_13_h", 1, 0, 0);
          q.xp(2);
        }
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
        // step 7
        q.xp(5, "treasure_2");
      },
      treasure_3(q) {
        if (!once(q, "opened treasure_3")) {
          return;
        }
        q.gems(300);
        // step 10
        q.xp(5, "treasure_3");
      },
      treasure_4e(q) {
        if (!once(q, "opened treasure_4e")) {
          return;
        }
        q.gems(50);
      },
      treasure_4h(q) {
        if (!once(q, "opened treasure_4h")) {
          return;
        }
        q.gems(400);
        // step 40
        q.xp(5, "treasure_4h");
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
        q.clothes(...passageClothing(q, "treasure_6", {only: SLINGSHOT}));
      },
      treasure_7(q) {
        if (!once(q, "opened treasure_7")) {
          return;
        }
        q.gems(50);
      },
      treasure_8(q) {
        if (!once(q, "opened treasure_8")) {
          return;
        }
        q.gems(400);
        // step 34
        q.xp(5, "treasure_8");
      },
    },

    // a plant ate a phantom: [actor, 50, 1, x, y, ""] has it die there
    eaten(q, plant, phantom, x, y) {
      if (!once(q, "eaten " + phantom)) {
        return;
      }
      const drops = {"phantom_6a":"key_1"}; // what is left behind
      q.send("qad", phantom, 50, 1, x, y, drops[phantom] || "");
      // step 133
      q.send("qcmdVT", 1, "phantomcount", bump(q, "phantomcount"), 0, 0); // one more than last time
      // step 134: every one but phantom_6a
      if (!["phantom_6a"].includes(phantom)) {
        q.send("qspn", `${phantom}`, `${phantom}__give_gem`, 200, 42, 3, 25, "null", "null", "null");
      }
      // step 135: when it is phantom_6a
      if (phantom === "phantom_6a") {
        q.send("qspn", `${phantom}`, `${phantom}__give_gem`, 200, 42, 3, 50, "null", "null", "null");
      }
      // step 136: every one but phantom_6a
      if (!["phantom_6a"].includes(phantom)) {
        q.xp(5, `${phantom}`);
      }
      // step 137: when it is phantom_6a
      if (phantom === "phantom_6a") {
        q.xp(10, `${phantom}`);
      }
      // step 138: every one but phantom_2b, phantom_1b, phantom_6a
      if (!["phantom_2b","phantom_1b","phantom_6a"].includes(phantom)) {
        set(q, `${phantom}`, 2, 0, 0);
      }
      // step 139: when it is phantom_2b
      if (phantom === "phantom_2b") {
        set(q, `${phantom}`, 3, 0, 0);
      }
      // step 140: when it is phantom_1b
      if (phantom === "phantom_1b") {
        set(q, `${phantom}`, 3, 0, 0);
      }
      // step 141: when it is phantom_6a
      if (phantom === "phantom_6a") {
        set(q, `${phantom}`, 3, 0, 0);
      }
      // step 142: when it is phantom_6a
      if (phantom === "phantom_6a") {
        set(q, "key_1", 1, 1, 0);
        q.send("qcmd", 38, 3700);
        q.send("qsnd", "ajq_itemfound");
      }
    },

    // the player stopped (left the pad, stopped hopping): adventures.js needs its handler, see the maker
    untriggered: {
      social_1: q => stopFilling(q, "epicdoor"),
    },
  },
};

/* adventure-script-maker
{"defId":16,"title":"The Phantom Portal (hard)","rooms":[{"key":"start","room":"adventures.room_adventure_2a","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_musqueststealth"},{"key":"tocave","room":"adventures.room_adventure_2b","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_muscave","arrive":"tocave"}],"objective":3465,"actors":[{"name":"questready","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"start_init","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"tocave","type":9,"def":1,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cave_init","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"toforest","type":9,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"liza_1","type":1,"def":21,"state":0,"visible":1,"click":1,"path":"","art":"facesw"},{"name":"liza_2","type":1,"def":21,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_4","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_4","art":""},{"name":"phantom_5","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_5","art":""},{"name":"phantom__8","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_8","art":""},{"name":"phantom_9","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_9","art":""},{"name":"phantom_10","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_10","art":""},{"name":"phantom_11","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_11","art":""},{"name":"phantom_12","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_12","art":""},{"name":"phantom_13","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_13","art":""},{"name":"phantom_14","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_14","art":""},{"name":"phantom_16h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_16","art":""},{"name":"phantom_17","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_17","art":""},{"name":"phantom_18","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_18","art":""},{"name":"phantom19__a","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_19","art":""},{"name":"phantom19__b","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_19","art":""},{"name":"phantom19__c","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_19","art":""},{"name":"phantom_1_h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_1_h","art":""},{"name":"phantom_2_h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_2_h","art":""},{"name":"phantom_3_h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_3_h","art":""},{"name":"phantom_4_h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_4_h","art":""},{"name":"phantom_5_h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_5_h","art":""},{"name":"phantom_6_h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_6_h","art":""},{"name":"phantom_7a_h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_7a_h","art":""},{"name":"phantom_7b_h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_7b_h","art":""},{"name":"phantom_7c_h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_7c_h","art":""},{"name":"phantom_8a_h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_8a_h","art":""},{"name":"phantom_9b_h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_9b_h","art":""},{"name":"phantom_10_h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_10_h","art":""},{"name":"phantom_11_h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_11_h","art":""},{"name":"phantom_12_h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_12_h","art":""},{"name":"phantom_13_h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_13_h","art":""},{"name":"phantom_14_h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_14_h","art":""},{"name":"phantom_15_h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_15_h","art":""},{"name":"phantom_16_h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_16_h","art":""},{"name":"phantom__17h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_8","art":""},{"name":"phantom_18h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_18h","art":""},{"name":"phantom_19h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path_19h","art":""},{"name":"phantom_1a","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_6a","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":"","drop":"key_1"},{"name":"phantom_2a","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_3a","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_1b","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_2b","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_3b","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_6b","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_8b_h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"phantom_8c_h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"phantom_9a_h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_1","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_1_h","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_2","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_2_h","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_3","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_3_h","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_4","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_4_h","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_5","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_5_h","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_6","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_6_h","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_7a_h","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_7b_h","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_7c_h","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_8","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_8a_h","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_9","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_9b_h","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_10","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_10_h","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_11","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_11_h","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_12","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_12_h","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_13","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_13_h","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_14","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_14_h","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_15_h","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_16","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_16_h","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_17","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_18","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_19","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_18h","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path_19h","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trappath_1","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trappath_2","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trappath_3","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trappath_4","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cork_1a","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_1a_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_1b","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_1b_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_1c","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_1c_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_2a","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_2a_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_2b","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_2b_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_2c","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_2c_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_3a","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_3a_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_3b","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_3b_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_3c","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_3c_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_4a","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_4a_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_4b","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_4b_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_4c","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_4c_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_5a_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_5b_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_5c_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_6a_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_6b_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork_6c_h","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"easy","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"hard","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"vine_1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe_1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe_2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe_3","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe_4","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe_5","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe_6","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"well_1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"well_1e","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"water_1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gate_1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cage_1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cage_2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cage_3","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cage_4","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"epicdoor","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"epicpad","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"block_1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"block_2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockicon_1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockicon_2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipetrig_1","type":1,"def":69,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipetrig_2","type":1,"def":69,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipetrig_3","type":1,"def":69,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipetrig_4","type":1,"def":69,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipetrig_5","type":1,"def":69,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipetrig_6","type":1,"def":69,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key_1","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_2a","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_2b","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_2c","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_2a_h","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_2b_h","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_2c_h","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_3a","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_3b","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_3c","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_3a_h","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_3b_h","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_3c_h","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_4a","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_4b","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_4c","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_4a_h","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_4b_h","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_4c_h","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_5a","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_5b","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_5c","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_5a_h","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_5b_h","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"key_5c_h","type":15,"def":1912,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pail_1","type":17,"def":1955,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pail_2","type":17,"def":1955,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pail_2e","type":17,"def":1955,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pail_3","type":17,"def":1955,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pail_4","type":17,"def":1955,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pail_4e","type":17,"def":1955,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pail_5","type":17,"def":1955,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plant_1","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_2","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_3","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_4","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_5","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_6","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_7","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_8","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_9","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_10","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_11","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_12","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_13","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_14","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_16","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_17","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_18","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_19","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_20","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_21","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_22","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_23","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_24","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_25","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_26","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"plant_27","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":"wilt"},{"name":"planttrig_1","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_2","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_3","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_4","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_5","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_6","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_7","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_8","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_9","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_10","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_11","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_12","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_13","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_14","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_16","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_17","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_18","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_19","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_20","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_21","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_22","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_23","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_24","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_25","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_26","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"planttrig_27","type":1,"def":67,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo_1","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo_2","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo_3","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo_4","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo_5","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo_6","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo_7","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo_8","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo_9","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo10","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo11","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo12","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo13","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo14","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo16","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo17","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo18","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo19","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo20","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo21","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo22","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo23","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo24","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo25","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo26","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"plantinfo27","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"web_2","type":23,"def":104,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_4","type":23,"def":104,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_6","type":23,"def":104,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_8_h","type":23,"def":104,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_9_h","type":23,"def":104,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_10_h","type":23,"def":104,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_13_h","type":23,"def":104,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_1","type":23,"def":105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_3","type":23,"def":105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_5","type":23,"def":105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_7_h","type":23,"def":105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_11_h","type":23,"def":105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"web_12_h","type":23,"def":105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blocker_h","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"vineblock_1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"watervol_1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gateblock_1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"webvol_1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"webvol_2","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"webvol_3","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"webvol_4","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"webvol_5","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"webvol_6","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"webvol_7_h","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"webvol_8_h","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"webvol_9_h","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"webvol_10_h","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"webvol_11_h","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"webvol_12_h","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"webvol_13_h","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol_1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol_2","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"exitblock_1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"epicdoorcol","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"stone_1a","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"stone_1b","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"stone_1c","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"stone_1d","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"stone_2a","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"stone_2b","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"stone_2c","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"stone_2d","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"stone_3a","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"stone_3b","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"stone_3c","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"stone_3d","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"stone_1a_h","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"stone_1b_h","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"stone_1c_h","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"stone_1d_h","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"stone_2a_h","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"stone_2b_h","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"stone_2c_h","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"stone_2d_h","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"stone_3a_h","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"stone_3b_h","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"stone_3c_h","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"stone_3d_h","type":15,"def":2275,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"checkpoint_1","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"checkpoint_2","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"checkpoint_3","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"waterfall","type":16,"def":"ajq_waterfall_lp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"sludge_1","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge_2","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge_3","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge_4","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge_5","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge_6","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipeinfo_1","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo_2","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo_3","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo_4","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo_5","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo_6","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantomcount","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipecount","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"notifycount","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"monkeychat","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trapcount","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"timer_1","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"chattimer","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gifttimer","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"blocktimer_1","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"blocktimer_2","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"treasure_1","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"treasure_2","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":200,"chestKind":3},{"name":"treasure_3","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":300,"chestKind":3},{"name":"treasure_4e","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"treasure_4h","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":400,"chestKind":3},{"name":"treasure_5","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"treasure_6","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"treasure_7","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"treasure_8","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":400,"chestKind":3},{"name":"gatetrig_1","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"roomtrig_1","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trapkey_1","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trapkey_2","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trapkey_3","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trapkey_4","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trapped_1","type":1,"def":106,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trapped_2","type":1,"def":107,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trapped_3","type":1,"def":108,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trapped_4","type":1,"def":109,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blocktrig_1","type":1,"def":52,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blocktrig_2","type":1,"def":54,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cheatchq1","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cheatchq2","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"social_1","type":24,"def":200,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"portal_1","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom_port","type":16,"def":"ajq_portalstate1lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gem_placed","type":16,"def":"ajq_portalstate2lp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"portal_clear","type":16,"def":"ajq_portalstate3lp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"roomtrig_1b","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"roomtrig_2","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"notify_keys","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trapvol_1","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trapvol_2","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trapvol_3","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trapvol_4","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"chatvol_1","type":3,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"secretvol1","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"secretvol2","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"secretvol3","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"secretvol4","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"secretvol5","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"exitvol_1","type":3,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"slidevol_1","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_2","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_4","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_5","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_7","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_8","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_10","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_11","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_15","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_17","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_18","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_19","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_20","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_21","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_24","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_25","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_26","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_3","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_6","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_9","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_12","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_16","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_22","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_23","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_27","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_13","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidevol_14","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"players","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"00_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"10_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"20_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"30_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"40_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"50_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""}],"steps":[{"id":142,"when":"loaded","name":"","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qsndpk","fields":"2364"}]},{"id":1,"when":"trigger","name":"gatetrig_1","once":false,"holding":"","nth":0,"actions":[{"a":"say","name":"gatetrig_1","str":3679,"flag":0}],"unless":"key_1"},{"id":2,"when":"trigger","name":"pipeinfo_1","once":false,"holding":"","nth":0,"actions":[{"a":"say","name":"pipeinfo_1","str":3468,"flag":2},{"a":"wait","ms":210},{"a":"set","name":"pipeinfo_1","state":0,"visible":0,"click":0}]},{"id":3,"when":"trigger","name":"questready","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"set","name":"liza_1","state":99,"visible":0,"click":0},{"a":"var","name":"start_init","value":1},{"a":"wait","ms":850},{"a":"appear","name":"liza_1","face":""},{"a":"show","name":"water_1","click":0},{"a":"show","name":"well_1","click":0}]},{"id":4,"when":"trigger","name":"questready","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"wait","ms":1370},{"a":"appear","name":"liza_2","face":""}]},{"id":5,"when":"trigger","name":"liza_1","once":false,"holding":"","nth":0,"actions":[{"a":"set","name":"easy","state":99,"visible":0,"click":0},{"a":"set","name":"well_1e","state":99,"visible":0,"click":0},{"a":"set","name":"blocker_h","state":99,"visible":0,"click":0},{"a":"set","name":"treasure_4e","state":99,"visible":0,"click":0},{"a":"show","name":"cork_1b_h","click":0},{"a":"show","name":"cork_2b_h","click":0},{"a":"show","name":"cork_3b_h","click":0},{"a":"show","name":"cork_4b_h","click":0},{"a":"show","name":"cork_5b_h","click":0},{"a":"show","name":"cork_6b_h","click":0},{"a":"show","name":"key_2b_h","click":0},{"a":"show","name":"key_3b_h","click":0},{"a":"show","name":"key_4b_h","click":0},{"a":"show","name":"key_5b_h","click":0},{"a":"path","name":"phantom_1b","path":"path_1"},{"a":"show","name":"phantom_1b","click":1},{"a":"path","name":"phantom_2b","path":"path_2"},{"a":"show","name":"phantom_2b","click":1},{"a":"path","name":"phantom_3b","path":"path_3"},{"a":"show","name":"phantom_3b","click":1},{"a":"path","name":"phantom_6a","path":"path_6"},{"a":"show","name":"phantom_6a","click":1},{"a":"wait","ms":500},{"a":"talk","name":"liza_1","str":3678,"mode":1},{"a":"wait","ms":320},{"a":"set","name":"portal_1","state":2,"visible":1,"click":0},{"a":"show","name":"stone_1a_h","click":0},{"a":"show","name":"stone_2a_h","click":0},{"a":"show","name":"stone_3a_h","click":0}]},{"id":6,"when":"answer","name":"liza_1","once":true,"holding":"","nth":0,"actions":[{"a":"var","name":"00_uri","value":1},{"a":"var","name":"players","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure2-thephantomportal/#00-start/#0#101"},{"a":"var","name":"00_uri","value":99},{"a":"show","name":"vine_1","click":0},{"a":"hide","name":"vineblock_1"},{"a":"goal","str":3666},{"a":"artstate","name":"liza_1","state":"disappear"},{"a":"set","name":"liza_1","state":2,"visible":1,"click":1},{"a":"set","name":"liza_1","state":3,"visible":1,"click":0}]},{"id":7,"when":"opened","name":"treasure_2","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"treasure_2"}]},{"id":8,"when":"trigger","name":"phantom__17h__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom__17h__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":9,"when":"trigger","name":"phantom_6a__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom_6a__give_gem|0|null"},{"a":"gems","amount":50}]},{"id":10,"when":"opened","name":"treasure_3","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"treasure_3"}]},{"id":11,"when":"trigger","name":"gatetrig_1","once":true,"holding":"key_1","nth":0,"actions":[{"a":"use"},{"a":"show","name":"gate_1","click":0},{"a":"hide","name":"gateblock_1"},{"a":"xp","amount":25,"name":"gatetrig_1"},{"a":"goal","str":3701},{"a":"hide","name":"gatetrig_1"}]},{"id":12,"when":"trigger","name":"roomtrig_1","once":false,"holding":"","nth":0,"actions":[{"a":"say","name":"roomtrig_1","str":3702,"flag":0}]},{"id":13,"when":"attacked","name":"web_1","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_1|80|10|0"}]},{"id":14,"when":"attacked","name":"web_1","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_1|60|10|0"}]},{"id":15,"when":"attacked","name":"web_1","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_1|40|10|0"}]},{"id":16,"when":"attacked","name":"web_1","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_1|20|10|0"}]},{"id":17,"when":"attacked","name":"web_1","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"web_1|10|0|1194|838|"},{"a":"xp","amount":5,"name":"web_1"},{"a":"hide","name":"webvol_1"},{"a":"xp","amount":2,"name":""}]},{"id":18,"when":"trigger","name":"notify_keys","once":false,"holding":"","nth":0,"actions":[{"a":"goal","str":3669},{"a":"hide","name":"notify_keys"}]},{"id":19,"when":"attacked","name":"web_3","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_3|80|10|0"}]},{"id":20,"when":"attacked","name":"web_3","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_3|60|10|0"}]},{"id":21,"when":"attacked","name":"web_3","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_3|40|10|0"}]},{"id":22,"when":"attacked","name":"web_3","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_3|20|10|0"}]},{"id":23,"when":"attacked","name":"web_3","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"web_3|10|0|-600|237|"},{"a":"xp","amount":5,"name":"web_3"},{"a":"hide","name":"webvol_3"},{"a":"xp","amount":2,"name":""}]},{"id":24,"when":"attacked","name":"web_4","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_4|80|10|0"}]},{"id":25,"when":"attacked","name":"web_4","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_4|60|10|0"}]},{"id":26,"when":"attacked","name":"web_4","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_4|40|10|0"}]},{"id":27,"when":"attacked","name":"web_4","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_4|20|10|0"}]},{"id":28,"when":"attacked","name":"web_4","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"web_4|10|0|-849|-299|"},{"a":"xp","amount":5,"name":"web_4"},{"a":"hide","name":"webvol_4"},{"a":"xp","amount":2,"name":""}]},{"id":29,"when":"attacked","name":"web_2","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_2|80|10|0"}]},{"id":30,"when":"attacked","name":"web_2","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_2|60|10|0"}]},{"id":31,"when":"attacked","name":"web_2","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_2|40|10|0"}]},{"id":32,"when":"attacked","name":"web_2","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_2|20|10|0"}]},{"id":33,"when":"attacked","name":"web_2","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"web_2|10|0|569|-298|"},{"a":"xp","amount":5,"name":"web_2"},{"a":"hide","name":"webvol_2"},{"a":"xp","amount":2,"name":""}]},{"id":34,"when":"opened","name":"treasure_8","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"treasure_8"}]},{"id":35,"when":"attacked","name":"web_5","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_5|80|10|0"}]},{"id":36,"when":"attacked","name":"web_5","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_5|60|10|0"}]},{"id":37,"when":"attacked","name":"web_5","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_5|40|10|0"}]},{"id":38,"when":"attacked","name":"web_5","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_5|20|10|0"}]},{"id":39,"when":"attacked","name":"web_5","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"web_5|10|0|-1525|-59|"},{"a":"xp","amount":5,"name":"web_5"},{"a":"hide","name":"webvol_5"},{"a":"xp","amount":2,"name":""}]},{"id":40,"when":"opened","name":"treasure_4h","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"treasure_4h"}]},{"id":41,"when":"attacked","name":"web_9_h","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_9_h|80|10|0"}]},{"id":42,"when":"attacked","name":"web_9_h","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_9_h|60|10|0"}]},{"id":43,"when":"attacked","name":"web_9_h","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_9_h|40|10|0"}]},{"id":44,"when":"attacked","name":"web_9_h","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_9_h|20|10|0"}]},{"id":45,"when":"attacked","name":"web_9_h","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"web_9_h|10|0|-1883|-2984|"},{"a":"xp","amount":5,"name":"web_9_h"},{"a":"hide","name":"webvol_9_h"},{"a":"xp","amount":2,"name":""}]},{"id":46,"when":"attacked","name":"web_12_h","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_12_h|80|10|0"}]},{"id":47,"when":"attacked","name":"web_12_h","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_12_h|60|10|0"}]},{"id":48,"when":"attacked","name":"web_12_h","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_12_h|40|10|0"}]},{"id":49,"when":"attacked","name":"web_12_h","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_12_h|20|10|0"}]},{"id":50,"when":"attacked","name":"web_12_h","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"web_12_h|10|0|-2188|-3909|"},{"a":"xp","amount":5,"name":"web_12_h"},{"a":"hide","name":"webvol_12_h"},{"a":"xp","amount":2,"name":""}]},{"id":51,"when":"attacked","name":"web_6","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_6|80|10|0"}]},{"id":52,"when":"attacked","name":"web_6","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_6|60|10|0"}]},{"id":53,"when":"attacked","name":"web_6","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_6|40|10|0"}]},{"id":54,"when":"attacked","name":"web_6","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_6|20|10|0"}]},{"id":55,"when":"attacked","name":"web_6","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"web_6|10|0|-2796|151|"},{"a":"xp","amount":5,"name":"web_6"},{"a":"hide","name":"webvol_6"},{"a":"xp","amount":2,"name":""}]},{"id":56,"when":"trigger","name":"phantom19__c__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom19__c__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":57,"when":"trigger","name":"phantom19__b__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom19__b__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":58,"when":"trigger","name":"phantom19__a__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom19__a__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":59,"when":"attacked","name":"web_7_h","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_7_h|80|10|0"}]},{"id":60,"when":"attacked","name":"web_7_h","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_7_h|60|10|0"}]},{"id":61,"when":"attacked","name":"web_7_h","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_7_h|40|10|0"}]},{"id":62,"when":"attacked","name":"web_7_h","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_7_h|20|10|0"}]},{"id":63,"when":"attacked","name":"web_7_h","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"web_7_h|10|0|-4727|432|"},{"a":"xp","amount":5,"name":"web_7_h"},{"a":"hide","name":"webvol_7_h"},{"a":"xp","amount":2,"name":""}]},{"id":64,"when":"attacked","name":"web_8_h","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_8_h|80|10|0"}]},{"id":65,"when":"attacked","name":"web_8_h","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_8_h|60|10|0"}]},{"id":66,"when":"attacked","name":"web_8_h","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_8_h|40|10|0"}]},{"id":67,"when":"attacked","name":"web_8_h","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_8_h|20|10|0"}]},{"id":68,"when":"attacked","name":"web_8_h","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"web_8_h|10|0|-4293|-1947|"},{"a":"xp","amount":5,"name":"web_8_h"},{"a":"hide","name":"webvol_8_h"},{"a":"xp","amount":2,"name":""}]},{"id":69,"when":"attacked","name":"web_11_h","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_11_h|80|10|0"}]},{"id":70,"when":"attacked","name":"web_11_h","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_11_h|60|10|0"}]},{"id":71,"when":"attacked","name":"web_11_h","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_11_h|40|10|0"}]},{"id":72,"when":"attacked","name":"web_11_h","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_11_h|20|10|0"}]},{"id":73,"when":"attacked","name":"web_11_h","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"web_11_h|10|0|-4127|-3167|"},{"a":"xp","amount":5,"name":"web_11_h"},{"a":"hide","name":"webvol_11_h"},{"a":"xp","amount":2,"name":""}]},{"id":74,"when":"trigger","name":"phantom_8b_h__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom_8b_h__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":75,"when":"attacked","name":"web_10_h","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_10_h|80|10|0"}]},{"id":76,"when":"attacked","name":"web_10_h","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_10_h|60|10|0"}]},{"id":77,"when":"attacked","name":"web_10_h","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_10_h|40|10|0"}]},{"id":78,"when":"attacked","name":"web_10_h","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_10_h|20|10|0"}]},{"id":79,"when":"attacked","name":"web_10_h","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"web_10_h|10|0|-4053|-3876|"},{"a":"xp","amount":5,"name":"web_10_h"},{"a":"hide","name":"webvol_10_h"},{"a":"xp","amount":2,"name":""}]},{"id":80,"when":"trigger","name":"phantom_9a_h__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom_9a_h__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":81,"when":"attacked","name":"web_13_h","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_13_h|80|10|0"}]},{"id":82,"when":"attacked","name":"web_13_h","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_13_h|60|10|0"}]},{"id":83,"when":"attacked","name":"web_13_h","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_13_h|40|10|0"}]},{"id":84,"when":"attacked","name":"web_13_h","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"web_13_h|20|10|0"}]},{"id":85,"when":"attacked","name":"web_13_h","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"web_13_h|10|0|-968|-1894|"},{"a":"xp","amount":5,"name":"web_13_h"},{"a":"hide","name":"webvol_13_h"},{"a":"xp","amount":2,"name":""}]},{"id":86,"when":"trigger","name":"chatvol_1","once":false,"holding":"","nth":0,"actions":[{"a":"set","name":"chatvol_1","state":2,"visible":0,"click":0},{"a":"wait","ms":1820},{"a":"set","name":"trapped_1","state":6,"visible":1,"click":1},{"a":"say","name":"trapped_1","str":3704,"flag":1},{"a":"set","name":"trapped_1","state":7,"visible":1,"click":0},{"a":"wait","ms":13020},{"a":"set","name":"trapped_2","state":6,"visible":1,"click":1},{"a":"say","name":"trapped_2","str":3705,"flag":1},{"a":"set","name":"trapped_2","state":7,"visible":1,"click":0},{"a":"wait","ms":17030},{"a":"set","name":"trapped_3","state":6,"visible":1,"click":1},{"a":"say","name":"trapped_3","str":3706,"flag":1},{"a":"set","name":"trapped_3","state":7,"visible":1,"click":0}]},{"id":87,"when":"trigger","name":"roomtrig_1b","once":true,"holding":"","nth":0,"actions":[{"a":"room","key":"tocave","spawn":"tocave"},{"a":"var","name":"cave_init","value":1}]},{"id":88,"when":"trigger","name":"liza_2","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"set","name":"liza_2","state":9,"visible":1,"click":1},{"a":"talk","name":"liza_2","str":3672,"mode":9}],"unless":"stone_1a_h, stone_3a_h, stone_2a_h"},{"id":89,"when":"trigger","name":"liza_2","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"say","name":"liza_2","str":3676,"flag":0}],"unless":"stone_1a_h, stone_3a_h, stone_2a_h"},{"id":90,"when":"trigger","name":"liza_2","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"say","name":"liza_2","str":3676,"flag":0}],"unless":"stone_1a_h, stone_3a_h, stone_2a_h"},{"id":91,"when":"trigger","name":"liza_2","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"say","name":"liza_2","str":3676,"flag":0}],"unless":"stone_1a_h, stone_3a_h, stone_2a_h"},{"id":92,"when":"trigger","name":"liza_2","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"say","name":"liza_2","str":3676,"flag":0}],"unless":"stone_1a_h, stone_3a_h, stone_2a_h"},{"id":93,"when":"trigger","name":"liza_2","once":false,"holding":"","nth":6,"nthOn":false,"actions":[{"a":"say","name":"liza_2","str":3676,"flag":0}],"unless":"stone_1a_h, stone_3a_h, stone_2a_h"},{"id":94,"when":"trigger","name":"liza_2","once":false,"holding":"","nth":8,"nthOn":false,"actions":[{"a":"goal","str":3696},{"a":"say","name":"liza_2","str":3676,"flag":0}],"unless":"stone_1a_h, stone_3a_h, stone_2a_h"},{"id":95,"when":"trigger","name":"liza_2","once":false,"holding":"","nth":10,"nthOn":true,"actions":[{"a":"say","name":"liza_2","str":3676,"flag":0}],"unless":"stone_1a_h, stone_3a_h, stone_2a_h"},{"id":96,"when":"answer","name":"liza_2","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"artstate","name":"liza_2","state":"castmagicloop"},{"a":"set","name":"liza_2","state":2,"visible":1,"click":1},{"a":"goal","str":3695}]},{"id":97,"when":"answer","name":"liza_2","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"show","name":"gem_placed","click":0},{"a":"set","name":"portal_1","state":4,"visible":1,"click":0},{"a":"set","name":"liza_2","state":4,"visible":1,"click":1}]},{"id":98,"when":"answer","name":"liza_2","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"set","name":"portal_1","state":5,"visible":1,"click":0},{"a":"set","name":"liza_2","state":6,"visible":1,"click":1},{"a":"goal","str":3697}]},{"id":99,"when":"answer","name":"liza_2","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"xp","amount":50,"name":"liza_2"},{"a":"goal","str":3576},{"a":"set","name":"liza_2","state":8,"visible":1,"click":0},{"a":"var","name":"50_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure2-thephantomportal/#50-exit/#0#101"},{"a":"prize","list":"clothes 213 -261551589, gems 1500, clothes 136 706024753, gems 1000, clothes 338 677794049"},{"a":"wait","ms":3000},{"a":"hide","name":"exitblock_1"},{"a":"show","name":"exitvol_1","click":1}]},{"id":100,"when":"trigger","name":"slidevol_19","once":false,"holding":"","nth":0,"actions":[{"a":"sound","sound":"ajq_slidesingle"}]},{"id":101,"when":"trigger","name":"slidevol_20","once":false,"holding":"","nth":0,"actions":[{"a":"sound","sound":"ajq_slidesingle"}]},{"id":102,"when":"trigger","name":"slidevol_22","once":false,"holding":"","nth":0,"actions":[{"a":"sound","sound":"ajq_slidedouble"}]},{"id":103,"when":"trigger","name":"liza_2","once":false,"holding":"stone_1a_h","nth":0,"actions":[{"a":"use"},{"a":"set","name":"liza_2","state":3,"visible":1,"click":1},{"a":"talk","name":"liza_2","str":3673,"mode":3}]},{"id":104,"when":"trigger","name":"slidevol_1","once":false,"holding":"","nth":0,"actions":[{"a":"sound","sound":"ajq_slidesingle"}]},{"id":105,"when":"trigger","name":"slidevol_11","once":false,"holding":"","nth":0,"actions":[{"a":"sound","sound":"ajq_slidesingle"}]},{"id":106,"when":"trigger","name":"slidevol_25","once":false,"holding":"","nth":0,"actions":[{"a":"sound","sound":"ajq_slidesingle"}]},{"id":107,"when":"trigger","name":"slidevol_27","once":false,"holding":"","nth":0,"actions":[{"a":"sound","sound":"ajq_slidedouble"}]},{"id":108,"when":"trigger","name":"slidevol_24","once":false,"holding":"","nth":0,"actions":[{"a":"sound","sound":"ajq_slidesingle"}]},{"id":109,"when":"trigger","name":"liza_2","once":false,"holding":"stone_3a_h","nth":0,"actions":[{"a":"use"},{"a":"set","name":"liza_2","state":5,"visible":1,"click":1},{"a":"talk","name":"liza_2","str":3674,"mode":5}]},{"id":110,"when":"trigger","name":"liza_2","once":true,"holding":"stone_2a_h","nth":0,"actions":[{"a":"use"},{"a":"var","name":"40_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure2-thephantomportal/#40-gatherthealphastones/#0#101"},{"a":"var","name":"40_uri","value":99},{"a":"hide","name":"phantom_port"},{"a":"set","name":"gem_placed","state":0,"visible":0,"click":0},{"a":"show","name":"portal_clear","click":0},{"a":"set","name":"portal_1","state":6,"visible":1,"click":0},{"a":"artstate","name":"liza_2","state":"idle"},{"a":"set","name":"liza_2","state":7,"visible":1,"click":1},{"a":"talk","name":"liza_2","str":3675,"mode":7}]},{"id":111,"when":"trigger","name":"exitvol_1","once":false,"holding":"","nth":0,"actions":[{"a":"end"}]},{"id":112,"holding":"","when":"trigger","name":"pipetrig_#","family":true,"holdFam":"","unlessFam":"cork_#_h","member":"pipetrig_1","once":false,"nth":0,"actions":[{"a":"show","name":"pipeinfo_1","click":1},{"a":"say","name":"pipeinfo_1","str":3468,"flag":2}]},{"id":113,"holding":"","when":"trigger","name":"pipetrig_#","family":true,"holdFam":"","unlessFam":"cork_#_h","member":"pipetrig_6","once":false,"nth":0,"actions":[{"a":"show","name":"pipeinfo_6","click":1},{"a":"say","name":"pipeinfo_6","str":3468,"flag":2}]},{"id":114,"holding":"","when":"trigger","name":"pipetrig_#","family":true,"holdFam":"","unlessFam":"cork_#_h","member":"pipetrig_5","once":false,"nth":1,"memberNth":true,"actions":[{"a":"show","name":"pipeinfo_5","click":1},{"a":"say","name":"pipeinfo_5","str":3468,"flag":2}]},{"id":115,"holding":"","when":"trigger","name":"pipetrig_#","family":true,"holdFam":"","unlessFam":"cork_#_h","member":"pipetrig_5","once":false,"nth":2,"memberNth":true,"actions":[{"a":"say","name":"pipeinfo_5","str":3468,"flag":2}]},{"id":116,"holding":"","when":"trigger","name":"pipetrig_#","family":true,"holdFam":"cork_#_h","unlessFam":"","once":true,"nth":0,"actions":[{"a":"use"},{"a":"hide","name":"{name}"},{"a":"show","name":"pipe_{n}","click":0},{"a":"var","name":"pipecount","value":"{count}"},{"a":"hide","name":"sludge_{n}"},{"a":"xp","amount":5,"name":"{name}"}]},{"id":117,"holding":"","when":"trigger","name":"pipetrig_#","family":true,"holdFam":"cork_#_h","unlessFam":"","once":true,"nth":1,"actions":[{"a":"var","name":"pipecount","value":"{count}"}]},{"id":118,"holding":"","when":"trigger","name":"planttrig_#","family":true,"holdFam":"pail_#","unlessFam":"","once":true,"nth":0,"actions":[{"a":"use"},{"a":"set","name":"{name}","state":2,"visible":0,"click":0},{"a":"xp","amount":5,"name":"{name}"},{"a":"artstate","name":"plant_{n}","state":"revive"},{"a":"show","name":"plant_{n}","click":0}]},{"id":119,"holding":"","when":"trigger","name":"phantom_#__give_gem","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"send","cmd":"qad","fields":"{name}|0|null"},{"a":"gems","amount":25}]},{"id":120,"holding":"","when":"trigger","name":"phantom_#b__give_gem","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"send","cmd":"qad","fields":"{name}|0|null"},{"a":"gems","amount":25}]},{"id":121,"holding":"","when":"trigger","name":"secretvol#","family":true,"holdFam":"","unlessFam":"","once":false,"nth":0,"actions":[{"a":"sound","sound":"ajq_mussecretareast"}]},{"id":122,"holding":"","when":"trigger","name":"phantom_#_h__give_gem","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"send","cmd":"qad","fields":"{name}|0|null"},{"a":"gems","amount":25}]},{"id":123,"holding":"","when":"trigger","name":"trapvol_#","family":true,"holdFam":"","unlessFam":"","once":false,"nth":0,"actions":[{"a":"var","name":"notifycount","value":"{count}"},{"a":"show","name":"trapped_{n}","click":1},{"a":"set","name":"trapped_{n}","state":2,"visible":1,"click":0}]},{"id":124,"holding":"","when":"trigger","name":"trapkey_#","family":true,"holdFam":"","unlessFam":"key_#_h","once":false,"nth":0,"actions":[{"a":"say","name":"{name}","str":3708,"flag":0}]},{"id":125,"holding":"","when":"trigger","name":"phantom_#h__give_gem","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"send","cmd":"qad","fields":"{name}|0|null"},{"a":"gems","amount":25}]},{"id":126,"holding":"","when":"trigger","name":"trapkey_#","family":true,"holdFam":"key_#_h","unlessFam":"","once":true,"nth":0,"actions":[{"a":"use"},{"a":"hide","name":"trapvol_{n}"},{"a":"hide","name":"{name}"},{"a":"show","name":"cage_{n}","click":0},{"a":"set","name":"trapped_{n}","state":3,"visible":1,"click":1},{"a":"path","name":"trapped_{n}","path":"trappath_{n}"},{"a":"set","name":"trapped_{n}","state":4,"visible":1,"click":1},{"a":"var","name":"trapcount","value":"{count}"},{"a":"xp","amount":10,"name":"{name}"}]},{"id":127,"holding":"","when":"trigger","name":"trapkey_#","family":true,"holdFam":"key_#_h","unlessFam":"","member":"trapkey_3","once":true,"nth":0,"actions":[{"a":"say","name":"trapped_3","str":3689,"flag":1}]},{"id":128,"holding":"","when":"trigger","name":"trapkey_#","family":true,"holdFam":"key_#_h","unlessFam":"","member":"trapkey_2","once":true,"nth":0,"actions":[{"a":"say","name":"trapped_2","str":3687,"flag":1}]},{"id":129,"holding":"","when":"trigger","name":"trapkey_#","family":true,"holdFam":"key_#_h","unlessFam":"","member":"trapkey_1","once":true,"nth":0,"actions":[{"a":"say","name":"trapped_1","str":3685,"flag":1}]},{"id":130,"holding":"","when":"trigger","name":"trapkey_#","family":true,"holdFam":"key_#_h","unlessFam":"","member":"trapkey_4","once":true,"nth":0,"actions":[{"a":"say","name":"trapped_4","str":3691,"flag":1}]},{"id":131,"holding":"","when":"trigger","name":"trapped_#","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"path","name":"{name}","path":""},{"a":"artstate","name":"{name}","state":"hop"},{"a":"set","name":"{name}","state":5,"visible":1,"click":0},{"a":"var","name":"monkeychat","value":"{count}"}]},{"id":132,"holding":"","when":"eaten","name":"","nth":0,"once":false,"actions":[{"a":"var","name":"phantomcount","value":"{count}"}]},{"id":133,"holding":"","when":"eaten","name":"","nth":0,"once":false,"unlessMembers":["phantom_6a"],"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_gem|200|42|3|25|null|null|null"}]},{"id":134,"holding":"","when":"eaten","name":"","member":"phantom_6a","nth":0,"once":false,"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_gem|200|42|3|50|null|null|null"}]},{"id":135,"holding":"","when":"eaten","name":"","nth":0,"once":false,"unlessMembers":["phantom_6a"],"actions":[{"a":"xp","amount":5,"name":"{phantom}"}]},{"id":136,"holding":"","when":"eaten","name":"","member":"phantom_6a","nth":0,"once":false,"actions":[{"a":"xp","amount":10,"name":"{phantom}"}]},{"id":137,"holding":"","when":"eaten","name":"","nth":0,"once":false,"unlessMembers":["phantom_2b","phantom_1b","phantom_6a"],"actions":[{"a":"set","name":"{phantom}","state":2,"visible":0,"click":0}]},{"id":138,"holding":"","when":"eaten","name":"","member":"phantom_2b","nth":0,"once":false,"actions":[{"a":"set","name":"{phantom}","state":3,"visible":0,"click":0}]},{"id":139,"holding":"","when":"eaten","name":"","member":"phantom_1b","nth":0,"once":false,"actions":[{"a":"set","name":"{phantom}","state":3,"visible":0,"click":0}]},{"id":140,"holding":"","when":"eaten","name":"","member":"phantom_6a","nth":0,"once":false,"actions":[{"a":"set","name":"{phantom}","state":3,"visible":0,"click":0}]},{"id":141,"holding":"","when":"eaten","name":"","member":"phantom_6a","nth":0,"once":false,"actions":[{"a":"show","name":"key_1","click":0},{"a":"goal","str":3700},{"a":"sound","sound":"ajq_itemfound"}]}],"written":"2017-05-09 21:20:45","eat":{"phantom_4":[50,1],"phantom_2b":[50,1],"phantom_1b":[50,1],"phantom__17h":[50,1],"phantom_16_h":[50,1],"phantom_15_h":[50,1],"phantom_6a":[50,1],"phantom_11":[50,1],"phantom_12":[50,1],"phantom_13":[50,1],"phantom_14":[50,1],"phantom_17":[50,1],"phantom_18":[50,1],"phantom_16h":[50,1],"phantom19__c":[50,1],"phantom19__b":[50,1],"phantom19__a":[50,1],"phantom_18h":[50,1],"phantom_8b_h":[50,1],"phantom_9a_h":[50,1]},"bars":[{"bar":"epicdoor","trigger":"social_1","done":[{"a":"hide","name":"epicdoorcol"},{"a":"hide","name":"roomtrig_1"},{"a":"show","name":"epicpad","click":0},{"a":"set","name":"social_1","state":2,"visible":1,"click":1},{"a":"xp","amount":25,"name":"social_1"},{"a":"var","name":"30_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure2-thephantomportal/#30-rescuethemonkeys/#0#101"},{"a":"var","name":"30_uri","value":99},{"a":"goal","str":3694}],"marks":{},"step":2.5}],"variantGroups":["phantom_1|","phantom_6|","phantom_2|","phantom_3|","cork_1|_h","cork_2|_h","cork_3|_h","cork_4|_h","cork_5|_h","cork_6|_h","key_2|_h","key_3|_h","key_4|_h","key_5|_h","stone_1|_h","stone_2|_h","stone_3|_h"],"mainRun":4,"countRules":[{"counter":"pipecount","value":1,"actions":[{"a":"goal","str":3730}]},{"counter":"pipecount","value":3,"actions":[{"a":"goal","str":3729}]},{"counter":"pipecount","value":4,"actions":[{"a":"goal","str":3472}]},{"counter":"pipecount","value":5,"actions":[{"a":"goal","str":3546}]},{"counter":"pipecount","value":6,"actions":[{"a":"goal","str":3547}]},{"counter":"pipecount","value":7,"actions":[{"a":"show","name":"pail_1","click":0},{"a":"show","name":"pail_2","click":0},{"a":"show","name":"pail_3","click":0},{"a":"show","name":"pail_4","click":0},{"a":"show","name":"pail_5","click":0},{"a":"show","name":"planttrig_2","click":1},{"a":"show","name":"planttrig_3","click":1},{"a":"show","name":"planttrig_4","click":1},{"a":"show","name":"planttrig_24","click":1},{"a":"show","name":"planttrig_26","click":1},{"a":"show","name":"planttrig_27","click":1},{"a":"show","name":"planttrig_1","click":1},{"a":"show","name":"planttrig_5","click":1},{"a":"show","name":"planttrig_6","click":1},{"a":"show","name":"planttrig_7","click":1},{"a":"show","name":"planttrig_8","click":1},{"a":"show","name":"planttrig_9","click":1},{"a":"show","name":"planttrig_10","click":1},{"a":"show","name":"planttrig_11","click":1},{"a":"show","name":"planttrig_12","click":1},{"a":"show","name":"planttrig_13","click":1},{"a":"show","name":"planttrig_14","click":1},{"a":"show","name":"planttrig_16","click":1},{"a":"show","name":"planttrig_17","click":1},{"a":"show","name":"planttrig_18","click":1},{"a":"show","name":"planttrig_19","click":1},{"a":"show","name":"planttrig_20","click":1},{"a":"show","name":"planttrig_21","click":1},{"a":"show","name":"planttrig_22","click":1},{"a":"show","name":"planttrig_23","click":1},{"a":"show","name":"planttrig_25","click":1},{"a":"set","name":"water_1","state":0,"visible":1,"click":0},{"a":"show","name":"waterfall","click":0},{"a":"xp","amount":25,"name":"pipecount"},{"a":"sound","sound":"ajq_riverclear"},{"a":"set","name":"well_1","state":0,"visible":1,"click":0},{"a":"hide","name":"watervol_1"},{"a":"goal","str":3667},{"a":"var","name":"10_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure2-thephantomportal/#10-plugthepipes/#0#101"},{"a":"var","name":"10_uri","value":99}]},{"counter":"notifycount","value":1,"actions":[{"a":"goal","str":3668},{"a":"var","name":"20_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure2-thephantomportal/#20-gettothemonkeys/#0#101"},{"a":"var","name":"20_uri","value":99},{"a":"say","name":"trapped_1","str":3684,"flag":1}]},{"counter":"notifycount","value":2,"actions":[{"a":"say","name":"trapped_4","str":3690,"flag":1}]},{"counter":"notifycount","value":3,"actions":[{"a":"say","name":"trapped_3","str":3688,"flag":1}]},{"counter":"notifycount","value":4,"actions":[{"a":"say","name":"trapped_4","str":3690,"flag":1}]},{"counter":"notifycount","value":5,"actions":[{"a":"say","name":"trapped_2","str":3686,"flag":1}]},{"counter":"notifycount","value":6,"actions":[{"a":"say","name":"trapped_4","str":3690,"flag":1}]},{"counter":"notifycount","value":7,"actions":[{"a":"say","name":"trapped_3","str":3688,"flag":1}]},{"counter":"trapcount","value":1,"actions":[{"a":"goal","str":3670}]},{"counter":"notifycount","value":8,"actions":[{"a":"say","name":"trapped_2","str":3686,"flag":1}]},{"counter":"trapcount","value":2,"actions":[{"a":"goal","str":3671}]},{"counter":"notifycount","value":9,"actions":[{"a":"say","name":"trapped_1","str":3684,"flag":1}]},{"counter":"notifycount","value":10,"actions":[{"a":"say","name":"trapped_1","str":3684,"flag":1}]},{"counter":"trapcount","value":3,"actions":[{"a":"goal","str":3692}]},{"counter":"notifycount","value":11,"actions":[{"a":"say","name":"trapped_4","str":3690,"flag":1}]},{"counter":"trapcount","value":4,"actions":[{"a":"xp","amount":25,"name":"trapcount"},{"a":"goal","str":3693}]},{"counter":"monkeychat","value":4,"actions":[{"a":"show","name":"social_1","click":1},{"a":"show","name":"chatvol_1","click":1},{"a":"set","name":"trapped_4","state":6,"visible":1,"click":1},{"a":"say","name":"trapped_4","str":3707,"flag":1},{"a":"set","name":"trapped_4","state":7,"visible":1,"click":0}]}],"puzzles":[],"bosses":[]}
*/
