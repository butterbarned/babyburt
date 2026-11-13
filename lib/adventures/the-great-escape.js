"use strict";

// Recorded adventure 18, made with the adventure script maker. Plays in adventures.room_adventure_5a, adventures.room_adventure_5b, adventures.room_adventure_5a.
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
// mirror puzzles: each mirror's turns (the way it points, 0-3; its state adds 4 while a beam reaches it),
// the beams (which mirrors each depends on, and how it looks for the ways they were seen to point), and how
// the mirrors point when it is solved
const PUZZLES = [{"name":"puz6","mirrors":{"trig6":{"mirror":"puz6a","init":3,"vc":[1,0],"turn":[{"a":"set","name":"trig6","state":1,"visible":1,"click":1},{"a":"set","name":"trig6","state":0,"visible":1,"click":1}],"lit":{"by":["puz6a"],"table":{"2":1}}}},"goals":[{"solved":{"puz6a":2}}],"beams":{},"locks":[],"sting":"ajq_mirrorstinger","start":{"puz6a":[7,1,0],"puz6beam2":[99,0,0],"puz6end":[0,1,1],"puz6door":[0,1,1],"puz6frame_l":[0,1,1],"puz6frame_r":[0,1,1]},"lit0":{"puz6a":1}},{"name":"puz7","mirrors":{"trig7a":{"mirror":"puz7b","init":1,"vc":[1,0],"turn":[{"a":"set","name":"trig7a","state":1,"visible":1,"click":1},{"a":"set","name":"trig7a","state":0,"visible":1,"click":1}],"lit":{"by":["puz7b"],"table":{"0":1,"3":1}}},"trig7b":{"mirror":"puz7c","init":0,"vc":[1,0],"turn":[{"a":"set","name":"trig7b","state":1,"visible":1,"click":1},{"a":"set","name":"trig7b","state":0,"visible":1,"click":1}],"lit":{"by":["puz7c"],"table":{"2":1,"3":1}}}},"goals":[{"solved":{"puz7b":0,"puz7c":3}}],"beams":{"puz7beam3":{"by":["puz7b"],"table":{"0":[30,1,0]},"off":[99,0,0]}},"locks":[],"sting":"ajq_mirrorstinger","start":{"puz7b":[1,1,0],"puz7beam3":[99,0,0],"puz7c":[0,1,0],"puz7beam4":[99,0,0],"puz7end":[0,1,1],"puz7door":[0,1,1],"puz7frame_l":[0,1,1],"puz7frame_r":[0,1,1]},"lit0":{"puz7b":0,"puz7c":0}},{"name":"puz8","mirrors":{"trig8a":{"mirror":"puz8d","init":0,"vc":[1,0],"turn":[{"a":"set","name":"trig8a","state":1,"visible":1,"click":1},{"a":"set","name":"trig8a","state":0,"visible":1,"click":1}],"lit":{"by":["puz8d"],"table":{"3":1}}},"trig8b":{"mirror":"puz8a","init":2,"vc":[1,0],"turn":[{"a":"set","name":"trig8b","state":1,"visible":1,"click":1},{"a":"set","name":"trig8b","state":0,"visible":1,"click":1},{"a":"set","name":"trig8b","state":1,"visible":1,"click":1},{"a":"set","name":"trig8b","state":0,"visible":1,"click":1}],"lit":{"by":[],"table":{"":1}}}},"goals":[{"solved":{"puz8d":3,"puz8a":1}}],"beams":{"puz8beam3":{"by":["puz8d"],"table":{"3":[10,1,0]},"off":[99,0,0]},"puz8end1":{"by":["puz8d"],"table":{"3":[1,1,0]},"off":[0,1,1]},"puz8frame_l":{"by":["puz8d"],"table":{"3":[2,1,0]},"off":[0,1,1]}},"locks":[{"trig":"trig8a","dir":3,"msgs":[["qcmdVT",1,"puz8state","{count}",0,0],["qcmd",1,"trig8a",99,0,0]]}],"sting":"ajq_mirrorstinger","start":{"puz8d":[4,1,0],"puz8beam3":[99,0,0],"puz8end1":[0,1,1],"puz8frame_l":[0,1,1],"puz8a":[6,1,0],"puz8beam5":[99,0,0],"puz8b":[2,1,0],"puz8beam6":[99,0,0],"puz8end2":[0,1,1],"puz8frame_r":[0,1,1],"puz8door":[0,1,1]},"lit0":{"puz8d":1,"puz8a":1}},{"name":"puz9","mirrors":{"trig9a":{"mirror":"puz9c","init":2,"vc":[1,0],"turn":[{"a":"set","name":"trig9a","state":1,"visible":1,"click":1},{"a":"set","name":"trig9a","state":0,"visible":1,"click":1}],"lit":{"by":["puz9c"],"table":{"1":1}}},"trig9b":{"mirror":"puz9h","init":2,"vc":[1,0],"turn":[{"a":"set","name":"trig9b","state":1,"visible":1,"click":1},{"a":"set","name":"trig9b","state":0,"visible":1,"click":1}],"lit":{"by":["puz9h"],"table":{"0":1,"1":1}}},"trig9c":{"mirror":"puz9i","init":0,"vc":[1,0],"turn":[{"a":"set","name":"trig9c","state":1,"visible":1,"click":1},{"a":"set","name":"trig9c","state":0,"visible":1,"click":1}],"lit":{"by":["puz9h","puz9i"],"table":{"1,0":1,"1,3":1}}}},"goals":[{"solved":{"puz9c":1,"puz9h":1,"puz9i":3}}],"beams":{"puz9beam4":{"by":["puz9c"],"table":{"1":[35,1,0]},"off":[99,0,0]},"puz9d":{"by":["puz9c"],"table":{"1":[6,1,0]},"off":[2,1,0]},"puz9beam5":{"by":["puz9c"],"table":{"1":[10,1,0]},"off":[99,0,0]},"puz9e":{"by":["puz9c"],"table":{"1":[4,1,0]},"off":[0,1,0]},"puz9beam6":{"by":["puz9c"],"table":{"1":[35,1,0]},"off":[99,0,0]},"puz9f":{"by":["puz9c"],"table":{"1":[6,1,0]},"off":[2,1,0]},"puz9beam7":{"by":["puz9c"],"table":{"1":[1,1,0]},"off":[99,0,0]},"puz9g":{"by":["puz9c"],"table":{"1":[7,1,0]},"off":[3,1,0]},"puz9beam8":{"by":["puz9c"],"table":{"1":[5,1,0]},"off":[99,0,0]},"puz9beam9":{"by":["puz9h"],"table":{"1":[15,1,0]},"off":[99,0,0]}},"locks":[],"sting":"ajq_mirrorstinger","start":{"puz9c":[6,1,0],"puz9beam4":[99,0,0],"puz9d":[2,1,0],"puz9beam5":[99,0,0],"puz9e":[0,1,0],"puz9beam6":[99,0,0],"puz9f":[2,1,0],"puz9beam7":[99,0,0],"puz9g":[3,1,0],"puz9beam8":[99,0,0],"puz9h":[2,1,0],"puz9beam9":[99,0,0],"puz9i":[0,1,0],"puz9beam10":[99,0,0],"puz9j":[0,1,0],"puz9beam11":[99,0,0],"puz9end":[0,1,1],"puz9door":[0,1,1],"puz9frame_l":[0,1,1],"puz9frame_r":[0,1,1]},"lit0":{"puz9c":1,"puz9h":0,"puz9i":0}},{"name":"puz10","mirrors":{"trig10c":{"mirror":"puz10d","init":3,"vc":[1,0],"turn":[{"a":"set","name":"trig10c","state":1,"visible":1,"click":1},{"a":"set","name":"trig10c","state":0,"visible":1,"click":1}],"lit":{"by":["puz10c"],"table":{"2":1}}},"trig10a":{"mirror":"puz10a","init":2,"vc":[1,0],"turn":[{"a":"set","name":"trig10a","state":1,"visible":1,"click":1},{"a":"set","name":"trig10a","state":0,"visible":1,"click":1}],"lit":{"by":["puz10a"],"table":{"1":1,"2":1}}},"trig10b":{"mirror":"puz10c","init":3,"vc":[1,0],"turn":[{"a":"set","name":"trig10b","state":1,"visible":1,"click":1},{"a":"set","name":"trig10b","state":0,"visible":1,"click":1}],"lit":{"by":["puz10a","puz10c"],"table":{"1,1":1,"1,2":1}}}},"goals":[{"solved":{"puz10d":2,"puz10a":1,"puz10c":2}},{"solved":{"puz10d":2,"puz10a":2,"puz10c":2}}],"beams":{"puz10beam9":{"by":["puz10a"],"table":{"0":[99,0,0],"1":[99,0,0],"3":[99,0,0]},"off":[10,1,0]},"puz10e":{"by":["puz10a"],"table":{"0":[1,1,0],"1":[1,1,0],"3":[1,1,0]},"off":[5,1,0]},"puz10beam8":{"by":["puz10a"],"table":{"0":[99,0,0],"1":[99,0,0],"3":[99,0,0]},"off":[1,1,0]},"puz10f":{"by":["puz10a"],"table":{"0":[3,1,0],"1":[3,1,0],"3":[3,1,0]},"off":[7,1,0]},"puz10beam7":{"by":["puz10a"],"table":{"0":[99,0,0],"1":[99,0,0],"3":[99,0,0]},"off":[10,1,0]},"puz10g":{"by":["puz10a"],"table":{"0":[1,1,0],"1":[1,1,0],"3":[1,1,0]},"off":[5,1,0]},"puz10beam10":{"by":["puz10a"],"table":{"0":[99,0,0],"1":[99,0,0],"3":[99,0,0]},"off":[25,1,0]},"puz10end3":{"by":["puz10a"],"table":{"0":[0,1,0],"1":[0,1,0],"3":[0,1,0]},"off":[1,1,0]},"puz10frame2r":{"by":["puz10a"],"table":{"0":[0,1,0],"1":[0,1,0],"3":[0,1,0]},"off":[2,1,0]},"puz10beam2":{"by":["puz10a"],"table":{"1":[10,1,0]},"off":[99,0,0]},"puz10b":{"by":["puz10a"],"table":{"1":[7,1,0]},"off":[3,1,0]},"puz10beam3":{"by":["puz10a"],"table":{"1":[1,1,0]},"off":[99,0,0]}},"locks":[],"sting":"ajq_mirrorstinger","start":{"puz10d":[3,1,0],"puz10a":[6,1,0],"puz10beam9":[10,1,0],"puz10e":[5,1,0],"puz10beam8":[1,1,0],"puz10f":[7,1,0],"puz10beam7":[10,1,0],"puz10g":[5,1,0],"puz10beam10":[25,1,0],"puz10end3":[1,1,0],"puz10frame2r":[2,1,0],"puz10beam2":[99,0,0],"puz10b":[3,1,0],"puz10beam3":[99,0,0],"puz10c":[3,1,0],"puz10beam4":[99,0,0],"puz10end1":[0,1,1],"puz10frame1r":[0,1,1],"puz10frame1l":[0,1,1],"puz10door1":[0,1,1],"puz10start2":[1,1,0],"puz10beam5":[99,0,0],"puz10beam6":[99,0,0],"puz10end2":[0,1,1],"puz10frame2l":[0,1,1],"puz10door2":[0,1,1]},"lit0":{"puz10d":0,"puz10a":1,"puz10c":0}}];
const turn = (q, p, trig) => {
  const P = PUZZLES[p];
  const st = (q.vars.puzzles = q.vars.puzzles || {})[p] || (q.vars.puzzles[p] = {dir: {}, shown: Object.assign({}, P.start), lit: Object.assign({}, P.lit0), goal: 0, done: false});
  if (st.done) {
    return -1;
  }
  const all = Object.values(P.mirrors);
  const dir = name => name in st.dir ? st.dir[name] : all.find(m => m.mirror === name).init;
  const M = P.mirrors[trig];
  if ((st.locked || {})[trig]) {
    return -1;
  }
  st.dir[M.mirror] = (dir(M.mirror) + 1) % 4;
  for (const a of M.turn) {
    set(q, a.name, Number(a.state), a.visible ? 1 : 0, a.click ? 1 : 0);
  }
  const show = (name, look) => {
    if (String(st.shown[name]) !== String(look)) {
      st.shown[name] = look;
      set(q, name, ...look);
    }
  };
  let reached = false;
  for (const m of all) {
    const lit = m.lit.table[m.lit.by.map(dir).join(",")] || 0;
    if (lit && !(st.lit || {})[m.mirror]) {
      reached = true;
    }
    (st.lit = st.lit || {})[m.mirror] = lit;
    show(m.mirror, [dir(m.mirror) + 4 * lit, ...m.vc]);
  }
  for (const L of P.locks) {
    const lm = P.mirrors[L.trig].mirror;
    if (!(st.locked || {})[L.trig] && dir(lm) === L.dir) {
      (st.locked = st.locked || {})[L.trig] = true;
      for (const [cmd, ...fields] of L.msgs) {
        if (cmd === "xp") {
          q.xp(fields[0], fields[1]);
        }
        else {
          q.send(cmd, ...fields.map(f => f === "{count}" ? bump(q, fields[1]) : f));
        }
      }
    }
  }
  if (reached && P.sting) {
    q.send("qsnd", P.sting); // a beam reached another mirror
  }
  for (const [beam, B] of Object.entries(P.beams)) {
    show(beam, B.table[B.by.map(dir).join(",")] || B.off);
  }
  const g = st.goal || 0;
  if (Object.entries(P.goals[g].solved).every(([m, v]) => dir(m) === v)) {
    st.goal = g + 1;
    st.done = st.goal >= P.goals.length;
    return g;
  }
  return -1;
};
// phantom factories: [type, def] of what each sends out, every 3 seconds once the player comes near,
// at most 4 about at once, until a plant destroys the factory
const SPAWNERS = {"factory03":[11,2],"factory01":[11,2]};
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
const OBJECTIVE = 3909; // the line at the top when the adventure begins
// what happens when a count gets somewhere (how many plants are watered): once for each value
const counted = (q, name) => {
  const value = q.vars.counts[name];
  const key = `${name} ${value}`;
  q.vars.reached = q.vars.reached || {};
  if (q.vars.reached[key]) {
    return;
  }
  q.vars.reached[key] = true;
  if (key === "_stage 1") {
    q.send("qcmd", 38, 3925);
    q.vars.goal = 3925;
  }
  if (key === "_stage 2") {
    q.send("qcmd", 38, 3928);
    q.vars.goal = 3928;
  }
  if (key === "_stage 3") {
    q.send("qcmdVT", 1, "10_uri", 1, 0, 0);
    q.send("qposturi", "/adventure5-thegreatescape/#10-getcaptured/#0#001");
    q.send("qcmdVT", 1, "10_uri", 99, 0, 0);
    set(q, "alertbox", 1, 1, 0);
    q.send("qmusic", 0);
    q.send("qmusic", "ajq_phntmprisoner");
    q.send("qswfs", "phantom1a", "appear");
    q.send("qsp", "phantom1a", "path1a");
    set(q, "phantom1a", 1, 1, 0);
    q.send("qswfs", "phantom1b", "appear");
    q.send("qsp", "phantom1b", "path1b");
    set(q, "phantom1b", 1, 1, 0);
    q.send("qswfs", "phantom1c", "appear");
    q.send("qsp", "phantom1c", "path1c");
    set(q, "phantom1c", 1, 1, 0);
    q.send("qswfs", "phantom1d", "appear");
    q.send("qsp", "phantom1d", "path1d");
    set(q, "phantom1d", 1, 1, 0);
    q.send("qswfs", "phantom1e", "appear");
    q.send("qsp", "phantom1e", "path1e");
    set(q, "phantom1e", 1, 1, 0);
    q.send("qswfs", "phantom1f", "appear");
    q.send("qsp", "phantom1f", "path1f");
    set(q, "phantom1f", 1, 1, 0);
    q.send("qswfs", "phantom1g", "appear");
    q.send("qsp", "phantom1g", "path1g");
    set(q, "phantom1g", 1, 1, 0);
    q.send("qswfs", "phantom1h", "appear");
    q.send("qsp", "phantom1h", "path1h");
    set(q, "phantom1h", 1, 1, 0);
    q.send("qswfs", "phantom1i", "appear");
    q.send("qsp", "phantom1i", "path1i");
    set(q, "phantom1i", 1, 1, 0);
    q.send("qcmd", 38, 3930);
    q.vars.goal = 3930;
    q.send("qfade", 0);
    q.send("qfade", 1);
    set(q, "sludgerain", 99, 0, 0);
    set(q, "toprison", 1, 1, 1);
  }
  if (key === "monkeychat 6") {
    q.send("qcmd", 38, 10647);
    q.vars.goal = 10647;
    set(q, "vol_hop2", 1, 1, 1);
    set(q, "vol_hop2", 2, 1, 1);
    set(q, "chatvol_1", 1, 1, 1);
    q.send("qcmd", 38, 10647);
    q.vars.goal = 10647;
    set(q, "vol_hop2", 1, 1, 1);
    set(q, "vol_hop2", 2, 1, 1);
  }
  if (key === "pris2state 1") {
    q.send("qcmd", 38, 3934);
    q.vars.goal = 3934;
  }
  if (key === "pris2state 2") {
    q.send("qcmd", 38, 3962);
    q.vars.goal = 3962;
  }
  if (key === "pris3state 1") {
    q.send("qcmd", 38, 3988);
    q.vars.goal = 3988;
  }
  if (key === "puz8state 2") {
    q.send("qcmd", 38, 10677);
    q.vars.goal = 10677;
    q.send("qcmd", 38, 10677);
    q.vars.goal = 10677;
  }
  if (key === "trapcount 1") {
    q.send("qcmd", 38, 3991);
    q.vars.goal = 3991;
    set(q, "celldoor01", 1, 1, 0);
    q.send("qcmdVT", 1, "pris7state", 1, 0, 0);
    q.send("qcmd", 2, "prisoner07", 10711, 1);
  }
  if (key === "trapcount 2") {
    q.send("qcmd", 38, 3992);
    q.vars.goal = 3992;
    q.send("qcmdVT", 1, "pris5state", 1, 0, 0);
    q.send("qcmd", 2, "prisoner05", 10709, 1);
  }
  if (key === "trapcount 3") {
    q.send("qcmd", 38, 3993);
    q.vars.goal = 3993;
    q.send("qcmdVT", 1, "pris6state", 1, 0, 0);
    q.send("qcmd", 2, "prisoner06", 10710, 1);
  }
  if (key === "trapcount 4") {
    q.send("qcmd", 38, 10645);
    q.vars.goal = 10645;
  }
  if (key === "trapcount 5") {
    q.xp(25, "trapcount");
    q.send("qcmd", 38, 10713);
    q.vars.goal = 10713;
    q.send("qcmdVT", 1, "pris4state", 1, 0, 0);
    q.send("qcmd", 2, "prisoner04", 10708, 1);
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

module.exports = {
  defId: 18,
  title: "The Great Escape",
  rooms: {
    start: {room: "adventures.room_adventure_5a", name: "Adventure Tutorial", nameStringId: 18326, music: "ajq_musspooky"},
    inprison: {room: "adventures.room_adventure_5b", name: "Adventure Tutorial", nameStringId: 18326, music: ""},
    endroom: {room: "adventures.room_adventure_5a", name: "Adventure Tutorial", nameStringId: 18326, music: ""},
  },
  written: "2026-11-11 18:10:01",
  objective: 3909,
  lobby: true, // the "waiting for players" screen first, as on the official server

  // name, type, def, state, visible, needs a click, path, artwork state
  actors: [
    ["queststart", 18, 0, 0, 1, 1, "", ""],
    ["questready", 7, 0, 0, 1, 1, "", ""],
    ["start_init", 8, 0, 0, 0, 1, "", ""],
    ["players", 7, 0, 0, 1, 1, "", ""],
    ["00_uri", 7, 0, 0, 0, 1, "", ""],
    ["cosmo1", 1, 25, 0, 1, 1, "", "appear"],
    ["cosmo1hide", 8, 0, 0, 0, 1, "", ""],
    ["cosmo2", 1, 25, 0, 0, 1, "", ""],
    ["greely", 1, 22, 0, 0, 1, "", ""],
    ["40_uri", 7, 0, 0, 0, 1, "", ""],
    ["greelydelay", 8, 0, 0, 0, 1, "", ""],
    ["greelydelay2", 8, 0, 0, 0, 1, "", ""],
    ["gifttimer", 8, 0, 0, 0, 1, "", ""],
    ["playgame", 8, 0, 0, 0, 1, "", ""],
    ["endpause", 8, 0, 0, 0, 1, "", ""],
    ["60_uri", 7, 0, 0, 0, 1, "", ""],
    ["_stage", 7, 0, 0, 0, 1, "", ""],
    ["spawn1delay", 8, 0, 0, 0, 1, "", ""],
    ["10_uri", 7, 0, 0, 0, 1, "", ""],
    ["notifyvol01", 3, 0, 0, 1, 1, "", ""],
    ["vol_dance", 24, 20, 0, 0, 1, "", ""],
    ["vol_hop", 24, 20, 0, 0, 1, "", ""],
    ["vol_play", 24, 20, 0, 0, 1, "", ""],
    ["vol_hop2", 24, 100, 0, 0, 1, "", ""],
    ["30_uri", 7, 0, 0, 0, 1, "", ""],
    ["phantom1a", 11, 155, 0, 0, 1, "", ""],
    ["phantom1b", 11, 155, 0, 0, 1, "", ""],
    ["phantom1c", 11, 155, 0, 0, 1, "", ""],
    ["phantom1d", 11, 155, 0, 0, 1, "", ""],
    ["phantom1e", 11, 155, 0, 0, 1, "", ""],
    ["phantom1f", 11, 155, 0, 0, 1, "", ""],
    ["phantom1g", 11, 155, 0, 0, 1, "", ""],
    ["phantom1h", 11, 155, 0, 0, 1, "", ""],
    ["phantom1i", 11, 155, 0, 0, 1, "", ""],
    ["phantom2a", 11, 2, 0, 1, 1, "path2a", ""],
    ["phantom2b", 11, 2, 0, 1, 1, "path2b", ""],
    ["phantom2c", 11, 2, 0, 1, 1, "path2c", ""],
    ["phantom3a", 11, 2, 0, 1, 1, "path3a", ""],
    ["phantom3b", 11, 2, 0, 1, 1, "path3b", ""],
    ["phantom3c", 11, 2, 0, 1, 1, "path3c", ""],
    ["phantom4a", 11, 2, 0, 1, 1, "path4a", ""],
    ["phantom4b", 11, 2, 0, 1, 1, "path4b", ""],
    ["phantom4c", 11, 2, 0, 1, 1, "path4c", ""],
    ["phantom5a", 11, 2, 0, 1, 1, "path5a", ""],
    ["phantom5b", 11, 2, 0, 1, 1, "path5b", ""],
    ["phantom5c", 11, 2, 0, 1, 1, "path5c", ""],
    ["factory01", 12, 156, 0, 1, 1, "", ""],
    ["factory02", 12, 156, 0, 1, 1, "", ""],
    ["factory03", 12, 156, 0, 1, 1, "", ""],
    ["factory04", 12, 156, 0, 1, 1, "", ""],
    ["pod01", 23, 151, 0, 1, 1, "", ""],
    ["pod02", 23, 151, 0, 1, 1, "", ""],
    ["pod03", 23, 151, 0, 1, 1, "", ""],
    ["pod04", 23, 151, 0, 1, 1, "", ""],
    ["pod05", 23, 151, 0, 1, 1, "", ""],
    ["pod06", 23, 151, 0, 1, 1, "", ""],
    ["pod07", 23, 151, 0, 1, 1, "", ""],
    ["pod08", 23, 151, 0, 1, 1, "", ""],
    ["pod09", 23, 151, 0, 1, 1, "", ""],
    ["pod10", 23, 151, 0, 1, 1, "", ""],
    ["pod11", 23, 151, 0, 1, 1, "", ""],
    ["pod12", 23, 151, 0, 1, 1, "", ""],
    ["pod13", 23, 151, 0, 1, 1, "", ""],
    ["pod14h", 23, 151, 0, 1, 1, "", ""],
    ["pod15h", 23, 151, 0, 1, 1, "", ""],
    ["pod16h", 23, 151, 0, 1, 1, "", ""],
    ["pod17h", 23, 151, 0, 1, 1, "", ""],
    ["pod18h", 23, 151, 0, 1, 1, "", ""],
    ["pod19h", 23, 151, 0, 1, 1, "", ""],
    ["pod20h", 23, 151, 0, 1, 1, "", ""],
    ["pod21h", 23, 151, 0, 1, 1, "", ""],
    ["toproom", 7, 0, 0, 0, 1, "", ""],
    ["path1a", 20, 0, 0, 1, 1, "", ""],
    ["path1b", 20, 0, 0, 1, 1, "", ""],
    ["path1c", 20, 0, 0, 1, 1, "", ""],
    ["path1d", 20, 0, 0, 1, 1, "", ""],
    ["path1e", 20, 0, 0, 1, 1, "", ""],
    ["path1f", 20, 0, 0, 1, 1, "", ""],
    ["path1g", 20, 0, 0, 1, 1, "", ""],
    ["path1h", 20, 0, 0, 1, 1, "", ""],
    ["path1i", 20, 0, 0, 1, 1, "", ""],
    ["path2a", 20, 0, 0, 1, 1, "", ""],
    ["path2b", 20, 0, 0, 1, 1, "", ""],
    ["path2c", 20, 0, 0, 1, 1, "", ""],
    ["path3a", 20, 0, 0, 1, 1, "", ""],
    ["path3b", 20, 0, 0, 1, 1, "", ""],
    ["path3c", 20, 0, 0, 1, 1, "", ""],
    ["path4a", 20, 0, 0, 1, 1, "", ""],
    ["path4b", 20, 0, 0, 1, 1, "", ""],
    ["path4c", 20, 0, 0, 1, 1, "", ""],
    ["path5a", 20, 0, 0, 1, 1, "", ""],
    ["path5b", 20, 0, 0, 1, 1, "", ""],
    ["path5c", 20, 0, 0, 1, 1, "", ""],
    ["prisonpath03", 20, 0, 0, 1, 1, "", ""],
    ["prisonpath04", 20, 0, 0, 1, 1, "", ""],
    ["prisonpath05", 20, 0, 0, 1, 1, "", ""],
    ["prisonpath06", 20, 0, 0, 1, 1, "", ""],
    ["prisonpath07", 20, 0, 0, 1, 1, "", ""],
    ["prisonpath08", 20, 0, 0, 1, 1, "", ""],
    ["toprison", 3, 0, 0, 0, 1, "", ""],
    ["inprison", 9, 1, 0, 1, 1, "", ""],
    ["prisonfadein", 8, 0, 0, 0, 1, "", ""],
    ["endroom", 9, 0, 0, 1, 1, "", ""],
    ["opendoor01", 1, 134, 0, 0, 1, "", ""],
    ["20_uri", 7, 0, 0, 0, 1, "", ""],
    ["opendoor02", 1, 134, 0, 1, 1, "", ""],
    ["prisonvol01", 3, 0, 0, 1, 1, "", ""],
    ["prisonvol02", 3, 0, 0, 1, 1, "", ""],
    ["prisonvol03", 3, 0, 0, 1, 1, "", ""],
    ["prisonvol04", 3, 0, 0, 1, 1, "", ""],
    ["prisonvol05", 3, 0, 0, 1, 1, "", ""],
    ["prisonvol06", 3, 0, 0, 1, 1, "", ""],
    ["prisonvol07", 3, 0, 0, 1, 1, "", ""],
    ["prisonvol08", 3, 0, 0, 1, 1, "", ""],
    ["slidesound", 3, 0, 0, 1, 1, "", ""],
    ["avatarexit", 3, 0, 0, 1, 1, "", ""],
    ["pris1wait", 8, 0, 0, 0, 1, "", ""],
    ["pris3wait", 8, 0, 0, 0, 1, "", ""],
    ["pris8wait", 8, 0, 0, 0, 1, "", ""],
    ["pris2wait", 8, 0, 0, 0, 1, "", ""],
    ["pris2state", 7, 0, 0, 1, 1, "", ""],
    ["pris3state", 7, 0, 0, 1, 1, "", ""],
    ["pris4state", 7, 0, 0, 1, 1, "", ""],
    ["pris5state", 7, 0, 0, 1, 1, "", ""],
    ["pris6state", 7, 0, 0, 1, 1, "", ""],
    ["pris7state", 7, 0, 0, 1, 1, "", ""],
    ["pris8state", 7, 0, 0, 1, 1, "", ""],
    ["prisoner01", 1, 116, 0, 1, 1, "", ""],
    ["prisoner02", 1, 160, 0, 1, 1, "", ""],
    ["prisoner03", 1, 161, 0, 1, 1, "", ""],
    ["prisoner04", 1, 162, 0, 1, 1, "", ""],
    ["prisoner05", 1, 163, 0, 1, 1, "", ""],
    ["prisoner06", 1, 164, 0, 1, 1, "", ""],
    ["prisoner07", 1, 159, 0, 1, 1, "", ""],
    ["prisoner08", 1, 165, 0, 1, 1, "", ""],
    ["lock03", 1, 44, 0, 1, 1, "", ""],
    ["sentryswitch", 1, 134, 0, 1, 1, "", ""],
    ["sentryswitc2", 1, 134, 0, 1, 1, "", ""],
    ["sentryswitc3", 1, 134, 0, 1, 1, "", ""],
    ["sentryswitc4", 1, 134, 0, 1, 1, "", ""],
    ["lock04", 1, 44, 0, 1, 1, "", ""],
    ["lock05", 1, 44, 0, 1, 1, "", ""],
    ["lock06", 1, 44, 0, 1, 1, "", ""],
    ["lock07", 1, 44, 0, 1, 1, "", ""],
    ["monkeychat", 7, 0, 0, 0, 1, "", ""],
    ["chattimer", 8, 0, 0, 0, 1, "", ""],
    ["chatvol_1", 3, 0, 0, 0, 1, "", ""],
    ["puz6col", 5, 0, 0, 1, 1, "", ""],
    ["puz8col", 5, 0, 0, 1, 1, "", ""],
    ["puz12col", 5, 0, 0, 1, 1, "", ""],
    ["puz16col", 5, 0, 0, 1, 1, "", ""],
    ["puz19dcol", 5, 0, 0, 1, 1, "", ""],
    ["puz9ecol", 5, 0, 0, 1, 1, "", ""],
    ["puz10gcol", 5, 0, 0, 1, 1, "", ""],
    ["puz10acol", 5, 0, 0, 1, 1, "", ""],
    ["puz17bcol", 5, 0, 0, 1, 1, "", ""],
    ["blockvol01", 5, 0, 0, 1, 1, "", ""],
    ["blockvol02", 5, 0, 0, 1, 1, "", ""],
    ["blockvol03", 5, 0, 0, 1, 1, "", ""],
    ["blockvol04", 5, 0, 0, 1, 1, "", ""],
    ["blockvol05", 5, 0, 0, 1, 1, "", ""],
    ["blockvol06", 5, 0, 0, 1, 1, "", ""],
    ["blockvol07", 5, 0, 0, 1, 1, "", ""],
    ["blockvol08", 5, 0, 0, 1, 1, "", ""],
    ["blockvol09", 5, 0, 0, 1, 1, "", ""],
    ["blockvol10", 5, 0, 0, 1, 1, "", ""],
    ["blockvol11", 5, 0, 0, 1, 1, "", ""],
    ["blockvol12", 5, 0, 0, 1, 1, "", ""],
    ["blockvol13", 5, 0, 0, 1, 1, "", ""],
    ["blockvol14", 5, 0, 0, 1, 1, "", ""],
    ["blockvol15", 5, 0, 0, 1, 1, "", ""],
    ["blockvol16", 5, 0, 0, 1, 1, "", ""],
    ["blockvol17", 5, 0, 0, 1, 1, "", ""],
    ["blockvol_end", 5, 0, 0, 1, 1, "", ""],
    ["podcol01", 5, 0, 0, 1, 1, "", ""],
    ["podcol02", 5, 0, 0, 1, 1, "", ""],
    ["podcol03", 5, 0, 0, 1, 1, "", ""],
    ["podcol04", 5, 0, 0, 1, 1, "", ""],
    ["podcol05", 5, 0, 0, 1, 1, "", ""],
    ["podcol06", 5, 0, 0, 1, 1, "", ""],
    ["podcol07", 5, 0, 0, 1, 1, "", ""],
    ["podcol08", 5, 0, 0, 1, 1, "", ""],
    ["podcol09", 5, 0, 0, 1, 1, "", ""],
    ["podcol10", 5, 0, 0, 1, 1, "", ""],
    ["podcol11", 5, 0, 0, 1, 1, "", ""],
    ["podcol12", 5, 0, 0, 1, 1, "", ""],
    ["podcol13", 5, 0, 0, 1, 1, "", ""],
    ["podcol14h", 5, 0, 0, 1, 1, "", ""],
    ["podcol15h", 5, 0, 0, 1, 1, "", ""],
    ["podcol16h", 5, 0, 0, 1, 1, "", ""],
    ["podcol17h", 5, 0, 0, 1, 1, "", ""],
    ["podcol18h", 5, 0, 0, 1, 1, "", ""],
    ["podcol19h", 5, 0, 0, 1, 1, "", ""],
    ["podcol20h", 5, 0, 0, 1, 1, "", ""],
    ["podcol21h", 5, 0, 0, 1, 1, "", ""],
    ["sencol01", 5, 0, 0, 1, 1, "", ""],
    ["sencol02", 5, 0, 0, 1, 1, "", ""],
    ["sencol03", 5, 0, 0, 1, 1, "", ""],
    ["sencol04", 5, 0, 0, 1, 1, "", ""],
    ["sencol05", 5, 0, 0, 1, 1, "", ""],
    ["sencol06", 5, 0, 0, 1, 1, "", ""],
    ["sencol07", 5, 0, 0, 1, 1, "", ""],
    ["sencol08", 5, 0, 0, 1, 1, "", ""],
    ["sencol09", 5, 0, 0, 1, 1, "", ""],
    ["sencol11", 5, 0, 0, 1, 1, "", ""],
    ["sencol12", 5, 0, 0, 1, 1, "", ""],
    ["sencol13", 5, 0, 0, 1, 1, "", ""],
    ["cellblock00", 5, 0, 0, 1, 1, "", ""],
    ["cellblock01", 5, 0, 0, 1, 1, "", ""],
    ["cellblock02", 5, 0, 0, 1, 1, "", ""],
    ["cellblock03", 5, 0, 0, 1, 1, "", ""],
    ["cellblock04", 5, 0, 0, 1, 1, "", ""],
    ["cellblock05", 5, 0, 0, 1, 1, "", ""],
    ["cellblock06", 5, 0, 0, 1, 1, "", ""],
    ["cellblock07", 5, 0, 0, 1, 1, "", ""],
    ["avatarblock1", 5, 0, 0, 1, 1, "", ""],
    ["avatarblock2", 5, 0, 0, 1, 1, "", ""],
    ["secretblock", 5, 0, 0, 1, 1, "", ""],
    ["stealthvol_1", 5, 0, 0, 1, 1, "", ""],
    ["hardblock", 5, 0, 0, 1, 1, "", ""],
    ["hardavatar", 5, 0, 0, 1, 1, "", ""],
    ["hard", 2, 0, 0, 0, 1, "", ""],
    ["easy", 2, 0, 0, 0, 1, "", ""],
    ["rain01", 2, 0, 0, 0, 1, "", ""],
    ["alertbox", 2, 0, 0, 0, 1, "", ""],
    ["jumppad", 2, 0, 0, 1, 1, "", ""],
    ["switchtile1", 2, 0, 0, 1, 1, "", ""],
    ["switchtile2", 2, 0, 0, 1, 1, "", ""],
    ["switchtile3", 2, 0, 0, 1, 1, "", ""],
    ["switchtile4", 2, 0, 0, 1, 1, "", ""],
    ["passagdoor01", 2, 0, 0, 1, 1, "", ""],
    ["passagdoor02", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier01", 2, 0, 0, 1, 1, "", ""],
    ["t_brazier02", 2, 0, 0, 1, 1, "", ""],
    ["t_bridge01", 2, 0, 0, 1, 1, "", ""],
    ["t_bridge02", 2, 0, 0, 1, 1, "", ""],
    ["towerdoor01", 2, 0, 0, 1, 1, "", ""],
    ["towerdoor02", 2, 0, 0, 1, 1, "", ""],
    ["celldoor00", 2, 0, 0, 1, 1, "", ""],
    ["celldoor01", 2, 0, 0, 1, 1, "", ""],
    ["celldoor02", 2, 0, 0, 1, 1, "", ""],
    ["celldoor03", 2, 0, 0, 1, 1, "", ""],
    ["celldoor04", 2, 0, 0, 1, 1, "", ""],
    ["celldoor05", 2, 0, 0, 1, 1, "", ""],
    ["celldoor06", 2, 0, 0, 1, 1, "", ""],
    ["celldoor07", 2, 0, 0, 1, 1, "", ""],
    ["avatartile1", 2, 0, 0, 1, 1, "", ""],
    ["pillar1", 2, 0, 0, 1, 1, "", ""],
    ["avatartile2", 2, 0, 0, 1, 1, "", ""],
    ["pillar2", 2, 0, 0, 1, 1, "", ""],
    ["interactdoor", 2, 0, 0, 1, 1, "", ""],
    ["exitportal", 2, 0, 0, 1, 1, "", ""],
    ["startwater", 2, 0, 0, 1, 1, "", ""],
    ["passagdoor03", 2, 0, 0, 1, 1, "", ""],
    ["torch", 17, 2045, 0, 1, 1, "", ""],
    ["torchlight", 1, 116, 0, 1, 1, "", ""],
    ["pickup_torch", 1, 134, 0, 1, 1, "", ""],
    ["braziercount", 7, 0, 0, 0, 1, "", ""],
    ["brazier01", 1, 86, 0, 1, 1, "", ""],
    ["brazier02", 1, 86, 0, 1, 1, "", ""],
    ["lbrazier01", 1, 116, 0, 1, 1, "", ""],
    ["lbrazier02", 1, 116, 0, 1, 1, "", ""],
    ["sentry01", 25, 30, 0, 1, 1, "", ""],
    ["sentry02", 25, 30, 0, 1, 1, "", ""],
    ["sentry03", 25, 30, 0, 1, 1, "", ""],
    ["sentry04", 25, 30, 0, 1, 1, "", ""],
    ["sentry05", 25, 30, 0, 1, 1, "", ""],
    ["sentry06", 25, 30, 0, 1, 1, "", ""],
    ["sentry07", 25, 30, 0, 1, 1, "", ""],
    ["sentry08", 25, 30, 0, 1, 1, "", ""],
    ["sentry09", 25, 30, 0, 1, 1, "", ""],
    ["sentry11", 25, 30, 0, 1, 1, "", ""],
    ["sentry12", 25, 30, 0, 1, 1, "", ""],
    ["sentry01h", 25, 30, 0, 1, 1, "", ""],
    ["sentry02h", 25, 30, 0, 1, 1, "", ""],
    ["sentry03h", 25, 30, 0, 1, 1, "", ""],
    ["sentry04h", 25, 30, 0, 1, 1, "", ""],
    ["sentry05h", 25, 30, 0, 1, 1, "", ""],
    ["sentry06h", 25, 30, 0, 1, 1, "", ""],
    ["sentry07h", 25, 30, 0, 1, 1, "", ""],
    ["sentry08h", 25, 30, 0, 1, 1, "", ""],
    ["sentry09h", 25, 30, 0, 1, 1, "", ""],
    ["sentry11h", 25, 30, 0, 1, 1, "", ""],
    ["sentry12h", 25, 30, 0, 1, 1, "", ""],
    ["sentry13h", 25, 30, 0, 1, 1, "", ""],
    ["sentry01lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry02lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry03lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry04lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry05lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry06lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry07lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry08lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry09lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry11lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry12lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["sentry13lp", 16, "ajq_phntmwatcherlp", 0, 1, 1, "", ""],
    ["trapcount", 7, 0, 0, 0, 1, "", ""],
    ["lock00", 1, 44, 0, 1, 1, "", ""],
    ["lock02", 1, 44, 0, 1, 1, "", ""],
    ["lock01", 1, 44, 0, 1, 1, "", ""],
    ["lock08", 1, 44, 0, 1, 1, "", ""],
    ["lock09", 1, 44, 0, 1, 1, "", ""],
    ["sludgerain", 16, "ajq_sludgerain_lp", 0, 1, 1, "", ""],
    ["sludgerain2", 16, "ajq_sludgerain_lp", 0, 1, 1, "", ""],
    ["key00", 15, 1912, 0, 1, 1, "", ""],
    ["key01", 15, 1912, 0, 1, 1, "", ""],
    ["key02", 15, 1912, 0, 1, 1, "", ""],
    ["key03", 15, 1912, 0, 1, 1, "", ""],
    ["key04", 15, 1912, 0, 1, 1, "", ""],
    ["key05", 15, 1912, 0, 1, 1, "", ""],
    ["key06", 15, 1912, 0, 1, 1, "", ""],
    ["key07", 15, 1912, 0, 1, 1, "", ""],
    ["key08", 15, 1912, 0, 1, 1, "", ""],
    ["key09", 15, 1912, 0, 1, 1, "", ""],
    ["toproomvol", 3, 0, 0, 1, 1, "", ""],
    ["treasure01", 13, 39, 0, 1, 1, "", ""],
    ["treasure02", 13, 39, 0, 1, 1, "", ""],
    ["treasure03", 13, 39, 0, 1, 1, "", ""],
    ["treasure04", 13, 39, 0, 1, 1, "", ""],
    ["treasure_a1", 13, 39, 0, 1, 1, "", ""],
    ["treasure_a2", 13, 39, 0, 1, 1, "", ""],
    ["avatar1", 1, 47, 0, 1, 1, "", ""],
    ["avatar2", 1, 66, 0, 1, 1, "", ""],
    ["blocktimer1", 8, 0, 0, 0, 1, "", ""],
    ["blocktimer2", 8, 0, 0, 0, 1, "", ""],
    ["respawn0", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["respawn1", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["respawn2", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["respawn3", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["respawn4", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["respawn5", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["seedpile01", 1, 134, 0, 1, 1, "", ""],
    ["seedpile02", 1, 134, 0, 1, 1, "", ""],
    ["seedpile03", 1, 134, 0, 1, 1, "", ""],
    ["seedpile04", 1, 134, 0, 1, 1, "", ""],
    ["seedpile05h", 1, 134, 0, 1, 1, "", ""],
    ["seedpile06h", 1, 134, 0, 1, 1, "", ""],
    ["seedpile07h", 1, 134, 0, 1, 1, "", ""],
    ["seedcount", 7, 0, 0, 1, 1, "", ""],
    ["seedpile05", 1, 134, 0, 1, 1, "", ""],
    ["seedpile06", 1, 134, 0, 1, 1, "", ""],
    ["seedpile07", 1, 134, 0, 1, 1, "", ""],
    ["t_seedpile02", 2, 0, 0, 1, 1, "", ""],
    ["t_seedpile03", 2, 0, 0, 1, 1, "", ""],
    ["t_seedpile04", 2, 0, 0, 1, 1, "", ""],
    ["t_seedpile05", 2, 0, 0, 1, 1, "", ""],
    ["t_seedpile06", 2, 0, 0, 1, 1, "", ""],
    ["t_seedpile07", 2, 0, 0, 1, 1, "", ""],
    ["seeddelay", 8, 0, 0, 0, 1, "", ""],
    ["seedmover", 7, 0, 0, 1, 1, "", ""],
    ["seedtimer05", 8, 0, 0, 0, 1, "", ""],
    ["seedtimer06", 8, 0, 0, 0, 1, "", ""],
    ["seedtimer07", 8, 0, 0, 0, 1, "", ""],
    ["70_uri", 7, 0, 0, 0, 1, "", ""],
    ["exitvol", 3, 0, 0, 1, 1, "", ""],
    ["plantvol", 22, 0, 0, 1, 1, "", ""],
    ["portalsound", 16, "ajq_portalgatelp", 0, 0, 1, "", ""],
    ["greelyvol", 3, 0, 0, 0, 1, "", ""],
    ["puz2vol", 3, 0, 0, 1, 1, "", ""],
    ["lok8blokoff", 8, 0, 0, 0, 1, "", ""],
    ["lok9blokoff", 8, 0, 0, 0, 1, "", ""],
    ["puz6blokoff", 8, 0, 0, 0, 1, "", ""],
    ["puz7blokoff", 8, 0, 0, 0, 1, "", ""],
    ["puz8blokoff", 8, 0, 0, 0, 1, "", ""],
    ["puz9blokoff", 8, 0, 0, 0, 1, "", ""],
    ["puz10blokof1", 8, 0, 0, 0, 1, "", ""],
    ["puz10blokof2", 8, 0, 0, 0, 1, "", ""],
    ["puz6start", 2, 0, 0, 1, 1, "", ""],
    ["puz6a", 2, 0, 0, 1, 1, "", ""],
    ["puz6end", 2, 0, 0, 1, 1, "", ""],
    ["puz6door", 2, 0, 0, 1, 1, "", ""],
    ["puz6frame_l", 2, 0, 0, 1, 1, "", ""],
    ["puz6frame_r", 2, 0, 0, 1, 1, "", ""],
    ["puz7start", 2, 0, 0, 1, 1, "", ""],
    ["puz7a", 2, 0, 0, 1, 1, "", ""],
    ["puz7b", 2, 0, 0, 1, 1, "", ""],
    ["puz7c", 2, 0, 0, 1, 1, "", ""],
    ["puz7end", 2, 0, 0, 1, 1, "", ""],
    ["puz7door", 2, 0, 0, 1, 1, "", ""],
    ["puz7frame_l", 2, 0, 0, 1, 1, "", ""],
    ["puz7frame_r", 2, 0, 0, 1, 1, "", ""],
    ["puz8start1", 2, 0, 0, 1, 1, "", ""],
    ["puz8start2", 2, 0, 0, 1, 1, "", ""],
    ["puz8a", 2, 0, 0, 1, 1, "", ""],
    ["puz8b", 2, 0, 0, 1, 1, "", ""],
    ["puz8c", 2, 0, 0, 1, 1, "", ""],
    ["puz8d", 2, 0, 0, 1, 1, "", ""],
    ["puz8end1", 2, 0, 0, 1, 1, "", ""],
    ["puz8end2", 2, 0, 0, 1, 1, "", ""],
    ["puz8door", 2, 0, 0, 1, 1, "", ""],
    ["puz8frame_l", 2, 0, 0, 1, 1, "", ""],
    ["puz8frame_r", 2, 0, 0, 1, 1, "", ""],
    ["puz9start", 2, 0, 0, 1, 1, "", ""],
    ["puz9a", 2, 0, 0, 1, 1, "", ""],
    ["puz9b", 2, 0, 0, 1, 1, "", ""],
    ["puz9c", 2, 0, 0, 1, 1, "", ""],
    ["puz9d", 2, 0, 0, 1, 1, "", ""],
    ["puz9e", 2, 0, 0, 1, 1, "", ""],
    ["puz9f", 2, 0, 0, 1, 1, "", ""],
    ["puz9g", 2, 0, 0, 1, 1, "", ""],
    ["puz9h", 2, 0, 0, 1, 1, "", ""],
    ["puz9i", 2, 0, 0, 1, 1, "", ""],
    ["puz9j", 2, 0, 0, 1, 1, "", ""],
    ["puz9end", 2, 0, 0, 1, 1, "", ""],
    ["puz9door", 2, 0, 0, 1, 1, "", ""],
    ["puz9frame_l", 2, 0, 0, 1, 1, "", ""],
    ["puz9frame_r", 2, 0, 0, 1, 1, "", ""],
    ["puz10start1", 2, 0, 0, 1, 1, "", ""],
    ["puz10start2", 2, 0, 0, 1, 1, "", ""],
    ["puz10a", 2, 0, 0, 1, 1, "", ""],
    ["puz10b", 2, 0, 0, 1, 1, "", ""],
    ["puz10c", 2, 0, 0, 1, 1, "", ""],
    ["puz10d", 2, 0, 0, 1, 1, "", ""],
    ["puz10e", 2, 0, 0, 1, 1, "", ""],
    ["puz10f", 2, 0, 0, 1, 1, "", ""],
    ["puz10g", 2, 0, 0, 1, 1, "", ""],
    ["puz10end1", 2, 0, 0, 1, 1, "", ""],
    ["puz10end2", 2, 0, 0, 1, 1, "", ""],
    ["puz10end3", 2, 0, 0, 1, 1, "", ""],
    ["puz10door1", 2, 0, 0, 1, 1, "", ""],
    ["puz10door2", 2, 0, 0, 1, 1, "", ""],
    ["puz10frame1l", 2, 0, 0, 1, 1, "", ""],
    ["puz10frame1r", 2, 0, 0, 1, 1, "", ""],
    ["puz10frame2l", 2, 0, 0, 1, 1, "", ""],
    ["puz10frame2r", 2, 0, 0, 1, 1, "", ""],
    ["puz12a", 2, 0, 0, 1, 1, "", ""],
    ["puz13c", 2, 0, 0, 1, 1, "", ""],
    ["puz14a", 2, 0, 0, 1, 1, "", ""],
    ["puz14b", 2, 0, 0, 1, 1, "", ""],
    ["puz15start1", 2, 0, 0, 1, 1, "", ""],
    ["puz15start2", 2, 0, 0, 1, 1, "", ""],
    ["puz15a", 2, 0, 0, 1, 1, "", ""],
    ["puz15b", 2, 0, 0, 1, 1, "", ""],
    ["puz15c", 2, 0, 0, 1, 1, "", ""],
    ["puz15d", 2, 0, 0, 1, 1, "", ""],
    ["puz16start2", 2, 0, 0, 1, 1, "", ""],
    ["puz16a", 2, 0, 0, 1, 1, "", ""],
    ["puz17start", 2, 0, 0, 1, 1, "", ""],
    ["puz17a", 2, 0, 0, 1, 1, "", ""],
    ["puz17b", 2, 0, 0, 1, 1, "", ""],
    ["puz17c", 2, 0, 0, 1, 1, "", ""],
    ["puz17d", 2, 0, 0, 1, 1, "", ""],
    ["puz17e", 2, 0, 0, 1, 1, "", ""],
    ["puz18start", 2, 0, 0, 1, 1, "", ""],
    ["puz18a", 2, 0, 0, 1, 1, "", ""],
    ["puz18b", 2, 0, 0, 1, 1, "", ""],
    ["puz19a", 2, 0, 0, 1, 1, "", ""],
    ["puz19b", 2, 0, 0, 1, 1, "", ""],
    ["puz19c", 2, 0, 0, 1, 1, "", ""],
    ["puz19d", 2, 0, 0, 1, 1, "", ""],
    ["puz20a", 2, 0, 0, 1, 1, "", ""],
    ["puz20b", 2, 0, 0, 1, 1, "", ""],
    ["puz20c", 2, 0, 0, 1, 1, "", ""],
    ["puz6beam1", 2, 0, 0, 0, 1, "", ""],
    ["puz6beam2", 2, 0, 0, 0, 1, "", ""],
    ["puz7beam1", 2, 0, 0, 0, 1, "", ""],
    ["puz7beam2", 2, 0, 0, 0, 1, "", ""],
    ["puz7beam3", 2, 0, 0, 0, 1, "", ""],
    ["puz7beam4", 2, 0, 0, 0, 1, "", ""],
    ["puz8beam1", 2, 0, 0, 0, 1, "", ""],
    ["puz8beam2", 2, 0, 0, 0, 1, "", ""],
    ["puz8beam3", 2, 0, 0, 0, 1, "", ""],
    ["puz8beam4", 2, 0, 0, 0, 1, "", ""],
    ["puz8beam5", 2, 0, 0, 0, 1, "", ""],
    ["puz8beam6", 2, 0, 0, 0, 1, "", ""],
    ["puz9beam1", 2, 0, 0, 0, 1, "", ""],
    ["puz9beam2", 2, 0, 0, 0, 1, "", ""],
    ["puz9beam3", 2, 0, 0, 0, 1, "", ""],
    ["puz9beam4", 2, 0, 0, 0, 1, "", ""],
    ["puz9beam5", 2, 0, 0, 0, 1, "", ""],
    ["puz9beam6", 2, 0, 0, 0, 1, "", ""],
    ["puz9beam7", 2, 0, 0, 0, 1, "", ""],
    ["puz9beam8", 2, 0, 0, 0, 1, "", ""],
    ["puz9beam9", 2, 0, 0, 0, 1, "", ""],
    ["puz9beam10", 2, 0, 0, 0, 1, "", ""],
    ["puz9beam11", 2, 0, 0, 0, 1, "", ""],
    ["puz10beam1", 2, 0, 0, 0, 1, "", ""],
    ["puz10beam2", 2, 0, 0, 0, 1, "", ""],
    ["puz10beam3", 2, 0, 0, 0, 1, "", ""],
    ["puz10beam4", 2, 0, 0, 0, 1, "", ""],
    ["puz10beam5", 2, 0, 0, 0, 1, "", ""],
    ["puz10beam6", 2, 0, 0, 0, 1, "", ""],
    ["puz10beam7", 2, 0, 0, 0, 1, "", ""],
    ["puz10beam8", 2, 0, 0, 0, 1, "", ""],
    ["puz10beam9", 2, 0, 0, 0, 1, "", ""],
    ["puz10beam10", 2, 0, 0, 0, 1, "", ""],
    ["puz12beam1", 2, 0, 0, 0, 1, "", ""],
    ["puz12beam2", 2, 0, 0, 0, 1, "", ""],
    ["puz15beam1", 2, 0, 0, 0, 1, "", ""],
    ["puz15beam2", 2, 0, 0, 0, 1, "", ""],
    ["puz16beam1", 2, 0, 0, 0, 1, "", ""],
    ["puz16beam2", 2, 0, 0, 0, 1, "", ""],
    ["puz16beam3", 2, 0, 0, 0, 1, "", ""],
    ["puz17beam1", 2, 0, 0, 0, 1, "", ""],
    ["puz19beam1", 2, 0, 0, 0, 1, "", ""],
    ["puz19beam2", 2, 0, 0, 0, 1, "", ""],
    ["puz19beam3", 2, 0, 0, 0, 1, "", ""],
    ["puz19beam4", 2, 0, 0, 0, 1, "", ""],
    ["puz19beam5", 2, 0, 0, 0, 1, "", ""],
    ["puz20beam1", 2, 0, 0, 0, 1, "", ""],
    ["puz20beam2", 2, 0, 0, 0, 1, "", ""],
    ["trig6", 1, 154, 0, 1, 1, "", ""],
    ["trig7a", 1, 154, 0, 1, 1, "", ""],
    ["trig7b", 1, 154, 0, 1, 1, "", ""],
    ["puz8state", 7, 0, 0, 0, 1, "", ""],
    ["trig8a", 1, 154, 0, 1, 1, "", ""],
    ["trig8b", 1, 154, 0, 1, 1, "", ""],
    ["trig9a", 1, 154, 0, 1, 1, "", ""],
    ["trig9b", 1, 154, 0, 1, 1, "", ""],
    ["trig9c", 1, 154, 0, 1, 1, "", ""],
    ["boomrock10", 11, 157, 0, 1, 1, "", ""],
    ["trig10a", 1, 154, 0, 1, 1, "", ""],
    ["trig10b", 1, 154, 0, 1, 1, "", ""],
    ["trig10c", 1, 154, 0, 1, 1, "", ""],
    ["trig12b", 1, 154, 0, 1, 1, "", ""],
    ["trig13a", 1, 154, 0, 1, 1, "", ""],
    ["trig13b", 1, 154, 0, 1, 1, "", ""],
    ["trig14a", 1, 154, 0, 1, 1, "", ""],
    ["trig14b", 1, 154, 0, 1, 1, "", ""],
    ["trig15a", 1, 154, 0, 1, 1, "", ""],
    ["trig15b", 1, 154, 0, 1, 1, "", ""],
    ["trig16a", 1, 154, 0, 1, 1, "", ""],
    ["trig16b", 1, 154, 0, 1, 1, "", ""],
    ["trig17a", 1, 154, 0, 1, 1, "", ""],
    ["trig17b", 1, 154, 0, 1, 1, "", ""],
    ["trig17c", 1, 154, 0, 1, 1, "", ""],
    ["trig18a", 1, 154, 0, 1, 1, "", ""],
    ["trig18b", 1, 154, 0, 1, 1, "", ""],
    ["trig18c", 1, 154, 0, 1, 1, "", ""],
    ["boomrock19", 11, 157, 0, 1, 1, "", ""],
    ["trig19a", 1, 154, 0, 1, 1, "", ""],
    ["trig19b", 1, 154, 0, 1, 1, "", ""],
    ["trig19c", 1, 154, 0, 1, 1, "", ""],
    ["boomrock20", 11, 157, 0, 1, 1, "", ""],
    ["trig20a", 1, 154, 0, 1, 1, "", ""],
    ["trig20b", 1, 154, 0, 1, 1, "", ""],
    ["trig20c", 1, 154, 0, 1, 1, "", ""],
    ["initpuzzles", 8, 0, 0, 0, 1, "", ""],
    ["easypuzon", 7, 0, 0, 1, 1, "", ""],
    ["hardpuz1on", 7, 0, 0, 1, 1, "", ""],
    ["hardpuz2on", 7, 0, 0, 1, 1, "", ""],
    ["cheatchq1", 3, 0, 0, 1, 1, "", ""],
    ["cheatchq2", 3, 0, 0, 1, 1, "", ""],
    ["playermember", 7, 0, 0, 1, 1, "", ""],
    ["diff_level", 7, 0, 0, 1, 1, "", ""],
    ["live_players", 7, 0, 1, 0, 1, "", ""],
  ],

  on: {
    loaded(q) {
      // step 196
      q.send("qsndpk", 2507);
    },

    // walked into, or clicked
    trigger: {
      treasure01(q) {
        q.send("qatt", "treasure01", 3, 50, 0, 1); // the chest opens
      },
      treasure02(q) {
        q.send("qatt", "treasure02", 3, 100, 0, 1); // the chest opens
      },
      treasure03(q) {
        q.send("qatt", "treasure03", 3, 150, 0, 1); // the chest opens
      },
      treasure04(q) {
        q.send("qatt", "treasure04", 3, 200, 0, 1); // the chest opens
      },
      treasure_a1(q) {
        q.send("qatt", "treasure_a1", 3, 50, 0, 1); // the chest opens
      },
      treasure_a2(q) {
        q.send("qatt", "treasure_a2", 3, 50, 0, 1); // the chest opens
      },
      questready(q) {
        const n = tally(q, "trigger questready");
        // step 1: the 1st time
        if (n === 1) {
          q.send("qcmdVT", 1, "start_init", 1, 0, 0);
          set(q, "startwater", 1, 1, 0);
          set(q, "exitportal", 99, 0, 0);
          q.after(830, () => {
            set(q, "stealthvol_1", 99, 0, 0);
            set(q, "t_bridge01", 99, 0, 0);
            set(q, "t_bridge02", 99, 0, 0);
            set(q, "rain01", 1, 1, 0);
            set(q, "sentry01h", 99, 0, 0);
            set(q, "sentry02h", 99, 0, 0);
            set(q, "sentry03h", 99, 0, 0);
            set(q, "sentry04h", 99, 0, 0);
            set(q, "sentry05h", 99, 0, 0);
            set(q, "sentry06h", 99, 0, 0);
            set(q, "sentry07h", 99, 0, 0);
            set(q, "sentry08h", 99, 0, 0);
            set(q, "sentry09h", 99, 0, 0);
            set(q, "sentry11h", 99, 0, 0);
            set(q, "sentry12h", 99, 0, 0);
            set(q, "sentry13h", 99, 0, 0);
            set(q, "sencol13", 99, 0, 0);
            set(q, "sentry13lp", 99, 0, 0);
            set(q, "pod14h", 99, 0, 0);
            set(q, "pod15h", 99, 0, 0);
            set(q, "pod16h", 99, 0, 0);
            set(q, "pod17h", 99, 0, 0);
            set(q, "pod18h", 99, 0, 0);
            set(q, "pod19h", 99, 0, 0);
            set(q, "pod20h", 99, 0, 0);
            set(q, "podcol14h", 99, 0, 0);
            set(q, "podcol15h", 99, 0, 0);
            set(q, "podcol16h", 99, 0, 0);
            set(q, "podcol17h", 99, 0, 0);
            set(q, "podcol18h", 99, 0, 0);
            set(q, "podcol19h", 99, 0, 0);
            set(q, "podcol20h", 99, 0, 0);
            set(q, "phantom4a", 99, 0, 0);
            set(q, "phantom4b", 99, 0, 0);
            set(q, "phantom4c", 99, 0, 0);
            set(q, "phantom5a", 99, 0, 0);
            set(q, "phantom5b", 99, 0, 0);
            set(q, "phantom5c", 99, 0, 0);
            set(q, "seedpile05h", 99, 0, 0);
            set(q, "seedpile06h", 99, 0, 0);
            set(q, "easy", 1, 1, 0);
            set(q, "avatar2", 99, 0, 0);
            set(q, "treasure_a2", 99, 0, 0);
            set(q, "avatartile2", 99, 0, 0);
            set(q, "passagdoor03", 99, 0, 0);
            set(q, "t_seedpile05", 1, 1, 0);
            set(q, "t_seedpile06", 1, 1, 0);
            set(q, "t_seedpile07", 1, 1, 0);
            set(q, "seedpile05", 99, 0, 0);
            set(q, "seedpile06", 99, 0, 0);
            set(q, "seedpile07", 99, 0, 0);
          });
        }
        // step 2: the 2nd time
        if (n === 2) {
          set(q, "exitportal", 0, 1, 0);
          set(q, "phantom1a", 99, 0, 0);
          set(q, "phantom1b", 99, 0, 0);
          set(q, "phantom1c", 99, 0, 0);
          set(q, "phantom1d", 99, 0, 0);
          set(q, "phantom1e", 99, 0, 0);
          set(q, "phantom1f", 99, 0, 0);
          set(q, "phantom1g", 99, 0, 0);
          set(q, "phantom1h", 99, 0, 0);
          set(q, "phantom1i", 99, 0, 0);
          set(q, "alertbox", 99, 0, 0);
          q.send("qmusic", 0);
          q.send("qmusic", "ajq_musdungeon");
          q.send("qcmd", 38, 3931);
          q.vars.goal = 3931;
        }
        // step 3: the 3rd time
        if (n === 3) {
          set(q, "sludgerain", 0, 1, 0);
          q.send("qmusic", "ajq_musspooky");
          q.after(2000, () => {
            appear(q, "cosmo2");
            q.send("qcmdVT", 1, "60_uri", 1, 0, 0);
            q.send("qposturi", "/adventure5-thegreatescape/#60-parachutedownthetower/#0#001");
            q.send("qcmdVT", 1, "60_uri", 99, 0, 0);
            q.send("qcmd", 38, 3909);
            q.vars.goal = 3909;
          });
        }
      },
      cosmo1(q) {
        // step 4
        q.send("qicon", "cosmo1", 1);
        q.send("qcmd", 3, 0, "cosmo1", 0, 3886);
      },
      vol_dance(q) {
        // step 6: once
        if (once(q, "step6")) {
          q.after(1140, () => {
            q.xp(5, "vol_dance");
            set(q, "vol_dance", 2, 1, 0);
            q.send("qcmdVT", 1, "_stage", bump(q, "_stage"), 0, 0); // one more than last time
            counted(q, "_stage"); // what that count sets off
          });
        }
      },
      vol_hop(q) {
        // step 7: once
        if (once(q, "step7")) {
          q.after(1330, () => {
            q.xp(5, "vol_hop");
            set(q, "vol_hop", 2, 1, 0);
            q.send("qcmdVT", 1, "_stage", bump(q, "_stage"), 0, 0); // one more than last time
            counted(q, "_stage"); // what that count sets off
          });
        }
      },
      vol_play(q) {
        // step 8: once
        if (once(q, "step8")) {
          q.after(1160, () => {
            q.xp(5, "vol_play");
            set(q, "vol_play", 2, 1, 0);
            q.send("qcmdVT", 1, "_stage", bump(q, "_stage"), 0, 0); // one more than last time
            counted(q, "_stage"); // what that count sets off
            q.after(1010, () => {
              q.after(1000, () => {
                q.after(3000, () => {
                  q.after(2000, () => {
                  });
                });
              });
            });
          });
        }
      },
      toprison(q) {
        // step 9
        q.room("inprison", "inprison");
      },
      prisonvol01(q) {
        const n = tally(q, "trigger prisonvol01");
        // step 10: the 1st time
        if (n === 1) {
          q.send("qcmd", 2, "prisoner01", 3938, 1);
          set(q, "opendoor01", 1, 1, 1);
          q.send("qcmd", 38, 3932);
          q.vars.goal = 3932;
          set(q, "prisoner01", 1, 1, 1);
          set(q, "prisonvol01", 99, 0, 0);
          q.after(14480, () => {
            q.send("qcmdVT", 1, "pris1wait", 0, 0, 0);
            set(q, "prisonvol01", 0, 1, 1);
          });
        }
        // step 11: the 2nd time
        if (n === 2) {
          q.send("qcmd", 2, "prisoner01", 3939, 1);
          set(q, "prisonvol01", 99, 0, 0);
          q.after(14930, () => {
            q.send("qcmdVT", 1, "pris1wait", 0, 0, 0);
            set(q, "prisonvol01", 0, 1, 1);
          });
        }
        // step 12: the 3rd time
        if (n === 3) {
          q.send("qcmd", 2, "prisoner01", 3939, 1);
          set(q, "prisonvol01", 99, 0, 0);
        }
        // step 13: the 4th time
        if (n === 4) {
          q.send("qcmd", 2, "prisoner01", 3940, 1);
          set(q, "prisonvol01", 99, 0, 0);
          q.after(910, () => {
            set(q, "puz13c", 99, 0, 0);
            set(q, "puz14a", 99, 0, 0);
            set(q, "puz14b", 99, 0, 0);
            set(q, "puz15start1", 99, 0, 0);
            set(q, "puz15start2", 99, 0, 0);
            set(q, "puz15a", 99, 0, 0);
            set(q, "puz15b", 99, 0, 0);
            set(q, "puz15c", 99, 0, 0);
            set(q, "puz15d", 99, 0, 0);
            set(q, "puz16start2", 99, 0, 0);
            set(q, "puz16a", 99, 0, 0);
            set(q, "puz16beam1", 99, 0, 0);
            set(q, "puz16beam2", 99, 0, 0);
            set(q, "puz16beam3", 99, 0, 0);
            set(q, "puz17start", 99, 0, 0);
            set(q, "puz17a", 99, 0, 0);
            set(q, "puz17b", 99, 0, 0);
            set(q, "puz17c", 99, 0, 0);
            set(q, "puz17d", 99, 0, 0);
            set(q, "puz17e", 99, 0, 0);
            set(q, "puz17beam1", 99, 0, 0);
            set(q, "puz18start", 99, 0, 0);
            set(q, "puz18a", 99, 0, 0);
            set(q, "puz18b", 99, 0, 0);
            set(q, "puz19a", 99, 0, 0);
            set(q, "puz19b", 99, 0, 0);
            set(q, "puz19c", 99, 0, 0);
            set(q, "puz19d", 99, 0, 0);
            set(q, "puz19beam1", 99, 0, 0);
            set(q, "puz19beam2", 99, 0, 0);
            set(q, "puz19beam3", 99, 0, 0);
            set(q, "puz19beam4", 99, 0, 0);
            set(q, "puz19beam5", 99, 0, 0);
            set(q, "boomrock19", 99, 0, 0);
            q.after(1010, () => {
              set(q, "puz20a", 99, 0, 0);
              set(q, "puz20b", 99, 0, 0);
              set(q, "puz20c", 99, 0, 0);
              set(q, "puz20beam1", 99, 0, 0);
              set(q, "puz20beam2", 99, 0, 0);
              set(q, "boomrock20", 99, 0, 0);
              q.after(990, () => {
                set(q, "puz12col", 99, 0, 0);
                set(q, "puz16col", 99, 0, 0);
                set(q, "puz19dcol", 99, 0, 0);
                set(q, "trig6", 0, 1, 1);
                set(q, "puz6start", 5, 1, 0);
                set(q, "puz6a", 7, 1, 0);
                set(q, "puz6beam1", 35, 1, 0);
                set(q, "trig7a", 0, 1, 1);
                set(q, "trig7b", 0, 1, 1);
                set(q, "puz7start", 7, 1, 0);
                set(q, "puz7a", 5, 1, 0);
                set(q, "puz7b", 1, 1, 0);
                set(q, "puz7c", 1, 1, 0);
                set(q, "puz7c", 0, 1, 0);
                set(q, "puz7beam1", 200, 1, 0);
                set(q, "puz7beam2", 300, 1, 0);
                set(q, "trig8a", 0, 1, 1);
                set(q, "trig8b", 0, 1, 1);
                set(q, "puz8start1", 5, 1, 0);
                set(q, "puz8start2", 4, 1, 0);
                set(q, "puz8a", 6, 1, 0);
                set(q, "puz8b", 2, 1, 0);
                set(q, "puz8c", 6, 1, 0);
                set(q, "puz8d", 4, 1, 0);
                set(q, "puz8beam1", 35, 1, 0);
                set(q, "puz8beam2", 60, 1, 0);
                set(q, "puz8beam4", 35, 1, 0);
                set(q, "trig9a", 0, 1, 1);
                set(q, "trig9b", 0, 1, 1);
                set(q, "trig9c", 0, 1, 1);
                set(q, "puz9start", 4, 1, 0);
                set(q, "puz9a", 5, 1, 0);
                set(q, "puz9b", 7, 1, 0);
                set(q, "puz9c", 6, 1, 0);
                set(q, "puz9d", 2, 1, 0);
                set(q, "puz9e", 1, 1, 0);
                set(q, "puz9e", 0, 1, 0);
                set(q, "puz9f", 2, 1, 0);
                set(q, "puz9g", 3, 1, 0);
                set(q, "puz9h", 2, 1, 0);
                set(q, "puz9i", 1, 1, 0);
                set(q, "puz9i", 0, 1, 0);
                set(q, "puz9j", 1, 1, 0);
                set(q, "puz9j", 0, 1, 0);
                set(q, "puz9beam1", 15, 1, 0);
                set(q, "puz9beam2", 15, 1, 0);
                set(q, "puz9beam3", 10, 1, 0);
                set(q, "trig10a", 0, 1, 1);
                set(q, "trig10b", 0, 1, 1);
                set(q, "trig10c", 0, 1, 1);
                set(q, "puz10start1", 4, 1, 0);
                set(q, "puz10start2", 1, 1, 0);
                set(q, "puz10a", 2, 1, 0);
                set(q, "puz10b", 3, 1, 0);
                set(q, "puz10c", 3, 1, 0);
                set(q, "puz10d", 3, 1, 0);
                set(q, "puz10e", 1, 1, 0);
                set(q, "puz10f", 3, 1, 0);
                set(q, "puz10g", 1, 1, 0);
                set(q, "boomrock10", 0, 1, 1);
              });
            });
          });
        }
        // step 14: the 5th time
        if (n === 5) {
          q.send("qcmd", 2, "prisoner01", 3940, 1);
          set(q, "prisonvol01", 99, 0, 0);
          q.after(15000, () => {
            q.send("qcmdVT", 1, "pris1wait", 0, 0, 0);
            set(q, "prisonvol01", 0, 1, 1);
          });
        }
        // step 15: the 6th time
        if (n === 6) {
          set(q, "prisonvol01", 99, 0, 0);
          q.after(14910, () => {
            q.send("qcmdVT", 1, "pris1wait", 0, 0, 0);
            set(q, "prisonvol01", 0, 1, 1);
            q.after(29250, () => {
              q.send("qcmdVT", 1, "pris3wait", 0, 0, 0);
              set(q, "prisonvol03", 0, 1, 1);
              q.after(8010, () => {
                q.send("qcmdVT", 1, "pris8wait", 0, 0, 0);
                set(q, "prisonvol08", 0, 1, 1);
                q.after(11010, () => {
                  q.send("qcmdVT", 1, "pris3wait", 0, 0, 0);
                  set(q, "prisonvol03", 0, 1, 1);
                });
              });
            });
          });
        }
      },
      opendoor01(q) {
        // step 16: once
        if (once(q, "step16")) {
          q.send("qcmdVT", 1, "20_uri", 1, 0, 0);
          q.send("qposturi", "/adventure5-thegreatescape/#20-escapethecell/#0#001");
          q.send("qcmdVT", 1, "20_uri", 99, 0, 0);
          q.send("qcmd", 38, 3933);
          q.vars.goal = 3933;
          q.send("qsnd", "ajq_mussecretareast");
          q.xp(5, "opendoor01");
          set(q, "passagdoor01", 1, 1, 0);
          set(q, "blockvol01", 99, 0, 0);
          set(q, "prisoner01", 2, 1, 1);
          q.send("qcmd", 2, "prisoner01", 3940, 1);
          q.send("qtorch", 0, 1, "torchlight");
          set(q, "opendoor01", 99, 0, 0);
          q.after(310, () => {
            set(q, "trig6", 99, 0, 0);
            set(q, "trig7a", 99, 0, 0);
            set(q, "trig7b", 99, 0, 0);
            set(q, "trig8a", 99, 0, 0);
            set(q, "trig8b", 99, 0, 0);
            set(q, "trig9a", 99, 0, 0);
            set(q, "trig9b", 99, 0, 0);
            set(q, "trig9c", 99, 0, 0);
            set(q, "trig10a", 99, 0, 0);
            set(q, "trig10b", 99, 0, 0);
            set(q, "trig10c", 99, 0, 0);
            set(q, "trig12b", 99, 0, 0);
            set(q, "trig13a", 99, 0, 0);
            set(q, "trig13b", 99, 0, 0);
            set(q, "trig14a", 99, 0, 0);
            set(q, "trig14b", 99, 0, 0);
            set(q, "trig15a", 99, 0, 0);
            set(q, "trig15b", 99, 0, 0);
            set(q, "trig16a", 99, 0, 0);
            set(q, "trig16b", 99, 0, 0);
            set(q, "trig17a", 99, 0, 0);
            set(q, "trig17b", 99, 0, 0);
            set(q, "trig17c", 99, 0, 0);
            set(q, "trig18a", 99, 0, 0);
            set(q, "trig18b", 99, 0, 0);
            set(q, "trig18c", 99, 0, 0);
            set(q, "trig19a", 99, 0, 0);
            set(q, "trig19b", 99, 0, 0);
            set(q, "trig19c", 99, 0, 0);
            set(q, "trig20a", 99, 0, 0);
            set(q, "trig20b", 99, 0, 0);
            set(q, "trig20c", 99, 0, 0);
            q.after(1160, () => {
              set(q, "puz6start", 99, 0, 0);
              set(q, "puz6a", 99, 0, 0);
              set(q, "puz6beam1", 99, 0, 0);
              set(q, "puz6beam2", 99, 0, 0);
              set(q, "puz7start", 99, 0, 0);
              set(q, "puz7a", 99, 0, 0);
              set(q, "puz7b", 99, 0, 0);
              set(q, "puz7c", 99, 0, 0);
              set(q, "puz7beam1", 99, 0, 0);
              set(q, "puz7beam2", 99, 0, 0);
              set(q, "puz7beam3", 99, 0, 0);
              set(q, "puz7beam4", 99, 0, 0);
              set(q, "puz8start1", 99, 0, 0);
              set(q, "puz8start2", 99, 0, 0);
              set(q, "puz8a", 99, 0, 0);
              set(q, "puz8b", 99, 0, 0);
              set(q, "puz8c", 99, 0, 0);
              set(q, "puz8d", 99, 0, 0);
              set(q, "puz8beam1", 99, 0, 0);
              set(q, "puz8beam2", 99, 0, 0);
              set(q, "puz8beam3", 99, 0, 0);
              set(q, "puz8beam4", 99, 0, 0);
              set(q, "puz8beam5", 99, 0, 0);
              set(q, "puz8beam6", 99, 0, 0);
              q.after(870, () => {
                set(q, "puz9start", 99, 0, 0);
                set(q, "puz9a", 99, 0, 0);
                set(q, "puz9b", 99, 0, 0);
                set(q, "puz9c", 99, 0, 0);
                set(q, "puz9d", 99, 0, 0);
                set(q, "puz9e", 99, 0, 0);
                set(q, "puz9f", 99, 0, 0);
                set(q, "puz9g", 99, 0, 0);
                set(q, "puz9h", 99, 0, 0);
                set(q, "puz9i", 99, 0, 0);
                set(q, "puz9j", 99, 0, 0);
                set(q, "puz9beam1", 99, 0, 0);
                set(q, "puz9beam2", 99, 0, 0);
                set(q, "puz9beam3", 99, 0, 0);
                set(q, "puz9beam4", 99, 0, 0);
                set(q, "puz9beam5", 99, 0, 0);
                set(q, "puz9beam6", 99, 0, 0);
                set(q, "puz9beam7", 99, 0, 0);
                set(q, "puz9beam8", 99, 0, 0);
                set(q, "puz9beam9", 99, 0, 0);
                set(q, "puz9beam10", 99, 0, 0);
                set(q, "puz9beam11", 99, 0, 0);
                q.after(840, () => {
                  q.send("qcmdVT", 1, "pris1wait", 0, 0, 0);
                  set(q, "prisonvol01", 0, 1, 1);
                  set(q, "puz10start1", 99, 0, 0);
                  set(q, "puz10start2", 99, 0, 0);
                  set(q, "puz10a", 99, 0, 0);
                  set(q, "puz10b", 99, 0, 0);
                  set(q, "puz10c", 99, 0, 0);
                  set(q, "puz10d", 99, 0, 0);
                  set(q, "puz10e", 99, 0, 0);
                  set(q, "puz10f", 99, 0, 0);
                  set(q, "puz10g", 99, 0, 0);
                  set(q, "puz10beam1", 99, 0, 0);
                  set(q, "puz10beam2", 99, 0, 0);
                  set(q, "puz10beam3", 99, 0, 0);
                  set(q, "puz10beam4", 99, 0, 0);
                  set(q, "puz10beam5", 99, 0, 0);
                  set(q, "puz10beam6", 99, 0, 0);
                  set(q, "puz10beam7", 99, 0, 0);
                  set(q, "puz10beam8", 99, 0, 0);
                  set(q, "puz10beam9", 99, 0, 0);
                  set(q, "puz10beam10", 99, 0, 0);
                  set(q, "boomrock10", 99, 0, 0);
                  set(q, "puz12a", 99, 0, 0);
                  set(q, "puz12beam1", 99, 0, 0);
                  set(q, "puz12beam2", 99, 0, 0);
                  q.after(15020, () => {
                    q.send("qcmdVT", 1, "pris1wait", 0, 0, 0);
                    set(q, "prisonvol01", 0, 1, 1);
                    q.after(32030, () => {
                      set(q, "prisoner02", 2, 1, 1);
                      q.send("qcmdVT", 1, "pris2wait", 0, 0, 0);
                    });
                  });
                });
              });
            });
          });
        }
      },
      pickup_torch(q) {
        // step 17
        q.send("qgi", "torch");
      },
      brazier01(q) {
        // step 18: once
        if (once(q, "step18")) {
          q.send("qcmdVT", 1, "braziercount", bump(q, "braziercount"), 0, 0); // one more than last time
          set(q, "t_brazier01", 1, 1, 0);
          set(q, "t_bridge01", 1, 1, 0);
          q.send("qtorch", 0, 1, "t_bridge01");
          set(q, "lbrazier01", 99, 0, 0);
          set(q, "lbrazier01", 0, 1, 0);
          q.send("qtorch", 0, 1, "lbrazier01");
          set(q, "blockvol02", 99, 0, 0);
          q.xp(5, "brazier01");
          set(q, "brazier01", 1, 1, 0);
        }
      },
      lbrazier02(q) {
        // step 19
        set(q, "lbrazier02", 99, 0, 0);
        set(q, "lbrazier02", 0, 1, 0);
        q.send("qtorch", 0, 1, "lbrazier02");
        set(q, "blockvol03", 99, 0, 0);
      },
      brazier02(q) {
        const held = q.held(); // what the player carried when this fired
        // step 20: only while holding torch, once
        if (held === "torch" && once(q, "step20")) {
          q.send("qcmdVT", 1, "braziercount", bump(q, "braziercount"), 0, 0); // one more than last time
          q.use();
          set(q, "torch", 99, 0, 0);
          set(q, "pickup_torch", 99, 0, 0);
          set(q, "t_brazier02", 1, 1, 0);
          set(q, "t_bridge02", 1, 1, 0);
          q.send("qtorch", 0, 1, "t_bridge02");
          q.xp(5, "brazier02");
          set(q, "brazier02", 1, 1, 0);
        }
      },
      prisonvol02(q) {
        // step 21: once
        if (once(q, "step21")) {
          q.send("qcmdVT", 1, "pris2state", bump(q, "pris2state"), 0, 0); // one more than last time
          counted(q, "pris2state"); // what that count sets off
          set(q, "prisoner02", 1, 1, 1);
          q.send("qcmd", 2, "prisoner02", 3941, 1);
          set(q, "prisoner02", 0, 1, 0);
          set(q, "prisonvol02", 99, 0, 0);
        }
      },
      prisoner02(q) {
        // step 22
        // what prisoner02 says depends on how far the adventure is (the line at the top)
        q.send("qcmd", 2, "prisoner02", ({10645: 3953})[q.vars.goal || OBJECTIVE] || 3942, 1);
      },
      puz2vol(q) {
        // step 23
        q.send("qcmd", 38, 3934);
        q.vars.goal = 3934;
        set(q, "puz2vol", 99, 0, 0);
      },
      lock00(q) {
        const held = q.held(); // what the player carried when this fired
        // step 24: unless holding key06
        if (held !== "key06") {
          q.send("qcmd", 2, "lock00", 10669, 0);
        }
        // step 59: only while holding key06, once
        if (held === "key06" && once(q, "step59")) {
          q.use();
          set(q, "celldoor00", 1, 1, 0);
          set(q, "cellblock00", 99, 0, 0);
          q.xp(10, "lock00");
          set(q, "lock00", 1, 0, 0);
        }
      },
      prisonvol03(q) {
        const n = tally(q, "trigger prisonvol03");
        // step 25: the 1st time
        if (n === 1) {
          set(q, "prisoner03", 1, 1, 1);
          q.send("qcmdVT", 1, "pris3state", bump(q, "pris3state"), 0, 0); // one more than last time
          counted(q, "pris3state"); // what that count sets off
          q.send("qcmd", 2, "prisoner03", 10663, 1);
          set(q, "prisoner03", 0, 1, 0);
          set(q, "prisonvol03", 99, 0, 0);
        }
        // step 26: the 2nd time
        if (n === 2) {
          set(q, "prisoner03", 2, 1, 1);
          q.send("qcmd", 2, "prisoner03", 3954, 1);
          set(q, "prisoner03", 0, 1, 0);
          set(q, "prisonvol03", 99, 0, 0);
        }
        // step 27: the 3rd time
        if (n === 3) {
          set(q, "prisoner03", 2, 1, 1);
          q.send("qcmd", 2, "prisoner03", 3954, 1);
          set(q, "prisoner03", 0, 1, 0);
          set(q, "prisonvol03", 99, 0, 0);
        }
        // step 28: the 4th time
        if (n === 4) {
          set(q, "prisoner03", 3, 1, 1);
          q.send("qcmd", 2, "prisoner03", 10706, 1);
          set(q, "prisoner03", 0, 1, 0);
          set(q, "prisonvol03", 99, 0, 0);
        }
        // step 29: the 5th time
        if (n === 5) {
          set(q, "prisoner03", 3, 1, 1);
          q.send("qcmd", 2, "prisoner03", 10706, 1);
          set(q, "prisoner03", 0, 1, 0);
          set(q, "prisonvol03", 99, 0, 0);
        }
        // step 30: the 6th time and after
        if (n >= 6) {
          set(q, "prisoner03", 3, 1, 1);
          q.send("qcmd", 2, "prisoner03", 10706, 1);
          set(q, "prisoner03", 0, 1, 0);
          set(q, "prisonvol03", 99, 0, 0);
        }
      },
      prisonvol08(q) {
        const n = tally(q, "trigger prisonvol08");
        // step 31: the 1st time
        if (n === 1) {
          set(q, "prisoner08", 1, 1, 1);
          q.send("qcmdVT", 1, "pris8state", bump(q, "pris8state"), 0, 0); // one more than last time
          q.send("qcmd", 2, "prisoner08", 3936, 1);
          set(q, "prisoner08", 0, 1, 0);
          set(q, "prisonvol08", 99, 0, 0);
        }
        // step 32: the 2nd time
        if (n === 2) {
          set(q, "prisoner08", 2, 1, 1);
          q.send("qcmd", 2, "prisoner08", 10721, 1);
          set(q, "prisoner08", 0, 1, 0);
          set(q, "prisonvol08", 99, 0, 0);
        }
        // step 33: the 3rd time
        if (n === 3) {
          set(q, "prisoner08", 2, 1, 1);
          q.send("qcmd", 2, "prisoner08", 10721, 1);
          set(q, "prisoner08", 0, 1, 0);
          set(q, "prisonvol08", 99, 0, 0);
        }
        // step 34: the 4th time
        if (n === 4) {
          set(q, "prisoner08", 3, 1, 1);
          q.send("qcmd", 2, "prisoner08", 10712, 1);
          set(q, "prisoner08", 0, 1, 0);
          set(q, "prisonvol08", 99, 0, 0);
        }
        // step 35: the 5th time and after
        if (n >= 5) {
          set(q, "prisoner08", 3, 1, 1);
          q.send("qcmd", 2, "prisoner08", 10712, 1);
          set(q, "prisoner08", 0, 1, 0);
          set(q, "prisonvol08", 99, 0, 0);
        }
      },
      lock03(q) {
        const held = q.held(); // what the player carried when this fired
        const n = tally(q, "trigger lock03");
        // step 36: unless holding key04, the 2nd time
        if (held !== "key04" && n === 2) {
          q.send("qcmdVT", 1, "pris3wait", 0, 0, 0);
          set(q, "prisonvol03", 0, 1, 1);
          q.send("qcmd", 2, "lock03", 10669, 0);
          q.send("qcmd", 2, "lock03", 10669, 0);
          q.send("qcmd", 2, "lock03", 10669, 0);
          q.after(2780, () => {
            q.send("qcmdVT", 1, "pris8wait", 0, 0, 0);
            set(q, "prisonvol08", 0, 1, 1);
            q.after(12010, () => {
              q.send("qcmdVT", 1, "pris3wait", 0, 0, 0);
              set(q, "prisonvol03", 0, 1, 1);
              q.after(3000, () => {
                q.send("qcmdVT", 1, "pris8wait", 0, 0, 0);
                set(q, "prisonvol08", 0, 1, 1);
              });
            });
          });
        }
        // step 56: only while holding key04, once
        if (held === "key04" && once(q, "step56")) {
          q.use();
          set(q, "celldoor03", 1, 1, 0);
          set(q, "cellblock03", 99, 0, 0);
          q.send("qcmdVT", 1, "trapcount", bump(q, "trapcount"), 0, 0); // one more than last time
          counted(q, "trapcount"); // what that count sets off
          q.xp(10, "lock03");
          q.send("qcmdVT", 1, "pris3state", bump(q, "pris3state"), 0, 0); // one more than last time
          counted(q, "pris3state"); // what that count sets off
          set(q, "prisoner03", 3, 1, 1);
          q.send("qcmd", 2, "prisoner03", 10706, 1);
          set(q, "prisoner03", 0, 1, 0);
          q.send("qcmdVT", 1, "pris8state", bump(q, "pris8state"), 0, 0); // one more than last time
          set(q, "prisoner08", 3, 1, 1);
          q.send("qcmd", 2, "prisoner08", 10712, 1);
          set(q, "prisoner08", 0, 1, 0);
          set(q, "lock03", 99, 0, 0);
          q.after(12450, () => {
            q.send("qcmdVT", 1, "pris8wait", 0, 0, 0);
            set(q, "prisonvol08", 0, 1, 1);
            q.after(1000, () => {
              q.send("qcmdVT", 1, "pris3wait", 0, 0, 0);
              set(q, "prisonvol03", 0, 1, 1);
              q.after(38030, () => {
                q.send("qcmdVT", 1, "pris8wait", 0, 0, 0);
                set(q, "prisonvol08", 0, 1, 1);
                q.after(22020, () => {
                  q.send("qcmdVT", 1, "pris3wait", 0, 0, 0);
                  set(q, "prisonvol03", 0, 1, 1);
                });
              });
            });
          });
        }
      },
      prisonvol07(q) {
        const n = tally(q, "trigger prisonvol07");
        // step 37: the 1st time
        if (n === 1) {
          set(q, "prisoner07", 1, 1, 1);
          q.send("qcmd", 2, "prisoner07", 10660, 1);
          set(q, "prisoner07", 0, 1, 0);
        }
        // step 38: the 2nd time
        if (n === 2) {
          set(q, "prisoner07", 2, 1, 1);
          q.send("qcmd", 2, "prisoner07", 10711, 1);
          set(q, "prisoner07", 0, 1, 0);
        }
        // step 39: the 3rd time
        if (n === 3) {
          set(q, "prisoner07", 2, 1, 1);
          q.send("qcmd", 2, "prisoner07", 10711, 1);
          set(q, "prisoner07", 0, 1, 0);
        }
        // step 40: the 4th time
        if (n === 4) {
          set(q, "prisoner07", 2, 1, 1);
          q.send("qcmd", 2, "prisoner07", 10711, 1);
          set(q, "prisoner07", 0, 1, 0);
        }
        // step 41: the 5th time and after
        if (n >= 5) {
          set(q, "prisoner07", 2, 1, 1);
          q.send("qcmd", 2, "prisoner07", 10711, 1);
          set(q, "prisoner07", 0, 1, 0);
        }
      },
      lock07(q) {
        const held = q.held(); // what the player carried when this fired
        // step 42: only while holding key03, once
        if (held === "key03" && once(q, "step42")) {
          q.use();
          q.send("qcmdVT", 1, "trapcount", bump(q, "trapcount"), 0, 0); // one more than last time
          counted(q, "trapcount"); // what that count sets off
          set(q, "cellblock07", 99, 0, 0);
          q.xp(10, "lock07");
          set(q, "prisoner07", 2, 1, 1);
          set(q, "prisoner07", 0, 1, 0);
          set(q, "lock07", 99, 0, 0);
        }
      },
      prisonvol05(q) {
        const n = tally(q, "trigger prisonvol05");
        // step 43: the 1st time
        if (n === 1) {
          set(q, "prisoner05", 1, 1, 1);
          q.send("qcmd", 2, "prisoner05", 10642, 1);
          set(q, "prisoner05", 0, 1, 0);
        }
        // step 44: the 2nd time
        if (n === 2) {
          set(q, "prisoner05", 2, 1, 1);
          q.send("qcmd", 2, "prisoner05", 10709, 1);
          set(q, "prisoner05", 0, 1, 0);
        }
        // step 45: the 3rd time
        if (n === 3) {
          set(q, "prisoner05", 2, 1, 1);
          q.send("qcmd", 2, "prisoner05", 10709, 1);
          set(q, "prisoner05", 0, 1, 0);
        }
        // step 46: the 4th time
        if (n === 4) {
          set(q, "prisoner05", 2, 1, 1);
          q.send("qcmd", 2, "prisoner05", 10709, 1);
          set(q, "prisoner05", 0, 1, 0);
        }
        // step 47: the 5th time and after
        if (n >= 5) {
          set(q, "prisoner05", 2, 1, 1);
          q.send("qcmd", 2, "prisoner05", 10709, 1);
          set(q, "prisoner05", 0, 1, 0);
        }
      },
      lock05(q) {
        const held = q.held(); // what the player carried when this fired
        // step 48: only while holding key02, once
        if (held === "key02" && once(q, "step48")) {
          q.use();
          q.send("qcmdVT", 1, "trapcount", bump(q, "trapcount"), 0, 0); // one more than last time
          counted(q, "trapcount"); // what that count sets off
          set(q, "celldoor05", 1, 1, 0);
          set(q, "cellblock05", 99, 0, 0);
          q.xp(10, "lock05");
          set(q, "prisoner05", 2, 1, 1);
          set(q, "prisoner05", 0, 1, 0);
          set(q, "lock05", 99, 0, 0);
        }
      },
      lock01(q) {
        const held = q.held(); // what the player carried when this fired
        // step 49: only while holding key01, once
        if (held === "key01" && once(q, "step49")) {
          q.use();
          set(q, "celldoor07", 1, 1, 0);
          set(q, "cellblock01", 99, 0, 0);
          q.xp(10, "lock01");
          set(q, "lock01", 1, 0, 0);
        }
      },
      prisonvol06(q) {
        const n = tally(q, "trigger prisonvol06");
        // step 51: the 1st time
        if (n === 1) {
          set(q, "prisoner06", 1, 1, 1);
          q.send("qcmd", 2, "prisoner06", 10657, 1);
          set(q, "prisoner06", 0, 1, 0);
        }
        // step 52: the 2nd time
        if (n === 2) {
          set(q, "prisoner06", 2, 1, 1);
          q.send("qcmd", 2, "prisoner06", 10710, 1);
          set(q, "prisoner06", 0, 1, 0);
        }
        // step 53: the 3rd time
        if (n === 3) {
          set(q, "prisoner06", 2, 1, 1);
          q.send("qcmd", 2, "prisoner06", 10710, 1);
          set(q, "prisoner06", 0, 1, 0);
        }
        // step 54: the 4th time and after
        if (n >= 4) {
          set(q, "prisoner06", 2, 1, 1);
          q.send("qcmd", 2, "prisoner06", 10710, 1);
          set(q, "prisoner06", 0, 1, 0);
        }
      },
      lock06(q) {
        const held = q.held(); // what the player carried when this fired
        // step 55: only while holding key07, once
        if (held === "key07" && once(q, "step55")) {
          q.use();
          q.send("qcmdVT", 1, "trapcount", bump(q, "trapcount"), 0, 0); // one more than last time
          counted(q, "trapcount"); // what that count sets off
          set(q, "celldoor06", 1, 1, 0);
          set(q, "cellblock06", 99, 0, 0);
          q.xp(10, "lock06");
          set(q, "prisoner06", 2, 1, 1);
          set(q, "prisoner06", 0, 1, 0);
          set(q, "lock06", 99, 0, 0);
        }
      },
      lock02(q) {
        const held = q.held(); // what the player carried when this fired
        // step 57: only while holding key05, once
        if (held === "key05" && once(q, "step57")) {
          q.use();
          set(q, "celldoor02", 1, 1, 0);
          set(q, "cellblock02", 99, 0, 0);
          q.xp(10, "lock02");
          set(q, "lock02", 1, 0, 0);
        }
      },
      opendoor02(q) {
        // step 61: once
        if (once(q, "step61")) {
          q.xp(5, "opendoor02");
          set(q, "passagdoor02", 1, 1, 0);
          set(q, "secretblock", 99, 0, 0);
          q.send("qsnd", "ajq_mussecretareast");
          set(q, "opendoor02", 99, 0, 0);
        }
      },
      prisonvol04(q) {
        const n = tally(q, "trigger prisonvol04");
        // step 63: the 1st time
        if (n === 1) {
          set(q, "prisoner04", 1, 1, 1);
          q.send("qcmd", 2, "prisoner04", 3961, 1);
          set(q, "prisoner04", 0, 1, 0);
        }
        // step 64: the 2nd time
        if (n === 2) {
          set(q, "prisoner04", 2, 1, 1);
          q.send("qcmd", 2, "prisoner04", 10708, 1);
          set(q, "prisoner04", 0, 1, 0);
        }
        // step 65: the 3rd time
        if (n === 3) {
          set(q, "prisoner04", 2, 1, 1);
          q.send("qcmd", 2, "prisoner04", 10708, 1);
          set(q, "prisoner04", 0, 1, 0);
        }
        // step 66: the 4th time and after
        if (n >= 4) {
          set(q, "prisoner04", 2, 1, 1);
          q.send("qcmd", 2, "prisoner04", 10708, 1);
          set(q, "prisoner04", 0, 1, 0);
        }
      },
      lock04(q) {
        const held = q.held(); // what the player carried when this fired
        // step 67: only while holding key00, once
        if (held === "key00" && once(q, "step67")) {
          q.use();
          q.send("qcmdVT", 1, "trapcount", bump(q, "trapcount"), 0, 0); // one more than last time
          counted(q, "trapcount"); // what that count sets off
          set(q, "celldoor04", 1, 1, 0);
          set(q, "cellblock04", 99, 0, 0);
          q.xp(10, "lock04");
          set(q, "prisoner04", 2, 1, 1);
          set(q, "prisoner04", 0, 1, 0);
          set(q, "lock04", 99, 0, 0);
        }
      },
      sentryswitch(q) {
        // step 68: once
        if (once(q, "step68")) {
          q.xp(5, "sentryswitch");
          set(q, "switchtile1", 1, 1, 0);
          set(q, "sentry01lp", 1, 0, 0);
          set(q, "sentry12lp", 1, 0, 0);
          set(q, "sentry02lp", 1, 0, 0);
          set(q, "sentry11lp", 1, 0, 0);
          q.send("qswfs", "sentry01", "turnoff");
          set(q, "sentry01", 1, 1, 0);
          q.send("qswfs", "sentry12", "turnoff");
          set(q, "sentry12", 1, 1, 0);
          q.send("qswfs", "sentry11", "turnoff");
          set(q, "sentry11", 1, 1, 0);
          q.send("qswfs", "sentry02", "turnoff");
          set(q, "sentry02", 1, 1, 0);
          set(q, "prisoner03", 4, 1, 1);
          q.send("qcmd", 2, "prisoner03", 3955, 1);
          q.send("qsp", "prisoner03", "prisonpath03");
          set(q, "prisoner03", 5, 1, 1);
          set(q, "prisoner08", 4, 1, 1);
          q.send("qcmd", 2, "prisoner08", 3937, 1);
          q.send("qsp", "prisoner08", "prisonpath08");
          set(q, "prisoner08", 5, 1, 1);
          set(q, "prisonvol03", 99, 0, 0);
          set(q, "prisonvol08", 99, 0, 0);
          set(q, "prisoner04", 3, 1, 1);
          q.send("qcmd", 2, "prisoner04", 3989, 1);
          q.send("qsp", "prisoner04", "prisonpath04");
          set(q, "prisoner04", 4, 1, 1);
          set(q, "prisonvol04", 99, 0, 0);
          set(q, "prisoner05", 3, 1, 1);
          q.send("qcmd", 2, "prisoner05", 10643, 1);
          q.send("qsp", "prisoner05", "prisonpath05");
          set(q, "prisoner05", 4, 1, 1);
          set(q, "prisonvol05", 99, 0, 0);
          set(q, "prisoner06", 3, 1, 1);
          q.send("qcmd", 2, "prisoner06", 10658, 1);
          q.send("qsp", "prisoner06", "prisonpath06");
          set(q, "prisoner06", 4, 1, 1);
          set(q, "prisonvol06", 99, 0, 0);
          set(q, "prisoner07", 3, 1, 1);
          q.send("qcmd", 2, "prisoner07", 10661, 1);
          q.send("qsp", "prisoner07", "prisonpath07");
          set(q, "prisoner07", 4, 1, 1);
          set(q, "prisonvol07", 99, 0, 0);
          set(q, "sentryswitch", 99, 0, 0);
          q.send("qcmd", 38, 10722);
          q.vars.goal = 10722;
        }
      },
      prisoner06(q) {
        // step 69: once
        if (once(q, "step69")) {
          q.send("qsp", "prisoner06", "");
          q.send("qswfs", "prisoner06", "hop");
          set(q, "prisoner06", 5, 1, 1);
          q.send("qcmdVT", 1, "monkeychat", bump(q, "monkeychat"), 0, 0); // one more than last time
          counted(q, "monkeychat"); // what that count sets off
          set(q, "prisoner06", 0, 1, 0);
        }
      },
      prisoner04(q) {
        // step 70: once
        if (once(q, "step70")) {
          q.send("qsp", "prisoner04", "");
          q.send("qswfs", "prisoner04", "hop");
          set(q, "prisoner04", 5, 1, 1);
          q.send("qcmdVT", 1, "monkeychat", bump(q, "monkeychat"), 0, 0); // one more than last time
          counted(q, "monkeychat"); // what that count sets off
          set(q, "prisoner04", 0, 1, 0);
        }
      },
      prisoner03(q) {
        // step 71
        q.send("qsp", "prisoner03", "");
        q.send("qswfs", "prisoner03", "hop");
        set(q, "prisoner03", 6, 1, 1);
        q.send("qcmdVT", 1, "monkeychat", bump(q, "monkeychat"), 0, 0); // one more than last time
        counted(q, "monkeychat"); // what that count sets off
        set(q, "prisoner03", 0, 1, 0);
        q.after(7440, () => {
          set(q, "prisoner03", 7, 1, 1);
          q.send("qcmd", 2, "prisoner03", 3960, 1);
          set(q, "prisoner03", 0, 1, 0);
        });
      },
      prisoner08(q) {
        // step 72: once
        if (once(q, "step72")) {
          q.send("qsp", "prisoner08", "");
          q.send("qswfs", "prisoner08", "hop");
          set(q, "prisoner08", 6, 1, 1);
          q.send("qcmdVT", 1, "monkeychat", bump(q, "monkeychat"), 0, 0); // one more than last time
          counted(q, "monkeychat"); // what that count sets off
          set(q, "prisoner08", 0, 1, 0);
        }
      },
      prisoner05(q) {
        // step 73: once
        if (once(q, "step73")) {
          q.send("qsp", "prisoner05", "");
          q.send("qswfs", "prisoner05", "hop");
          set(q, "prisoner05", 5, 1, 1);
          q.send("qcmdVT", 1, "monkeychat", bump(q, "monkeychat"), 0, 0); // one more than last time
          counted(q, "monkeychat"); // what that count sets off
          set(q, "prisoner05", 0, 1, 0);
        }
      },
      prisoner07(q) {
        // step 74: once
        if (once(q, "step74")) {
          q.send("qsp", "prisoner07", "");
          q.send("qswfs", "prisoner07", "hop");
          set(q, "prisoner07", 5, 1, 1);
          q.send("qcmdVT", 1, "monkeychat", bump(q, "monkeychat"), 0, 0); // one more than last time
          counted(q, "monkeychat"); // what that count sets off
          set(q, "prisoner07", 0, 1, 0);
        }
      },
      chatvol_1(q) {
        // step 75
        set(q, "chatvol_1", 2, 0, 0);
      },
      pod01__give_gem(q) {
        // step 81: once
        if (once(q, "step81")) {
          q.send("qad", "pod01__give_gem", 0, "null");
          q.gems(5);
        }
      },
      pod02__give_gem(q) {
        // step 87: once
        if (once(q, "step87")) {
          q.send("qad", "pod02__give_gem", 0, "null");
          q.gems(10);
        }
      },
      pod11__give_gem(q) {
        // step 93: once
        if (once(q, "step93")) {
          q.send("qad", "pod11__give_gem", 0, "null");
          q.gems(15);
        }
      },
      notifyvol01(q) {
        // step 94
        q.send("qcmd", 38, 10676);
        q.vars.goal = 10676;
        set(q, "notifyvol01", 99, 0, 0);
      },
      pod03__give_gem(q) {
        // step 100: once
        if (once(q, "step100")) {
          q.send("qad", "pod03__give_gem", 0, "null");
          q.gems(5);
        }
      },
      sentryswitc2(q) {
        // step 101: once
        if (once(q, "step101")) {
          q.xp(5, "sentryswitc2");
          set(q, "switchtile2", 1, 1, 0);
          set(q, "sentry03lp", 1, 0, 0);
          q.send("qswfs", "sentry03", "turnoff");
          set(q, "sentry03", 1, 1, 0);
          set(q, "sentryswitc2", 99, 0, 0);
        }
      },
      pod12__give_gem(q) {
        // step 107: once
        if (once(q, "step107")) {
          q.send("qad", "pod12__give_gem", 0, "null");
          q.gems(5);
        }
      },
      pod05__give_gem(q) {
        // step 113: once
        if (once(q, "step113")) {
          q.send("qad", "pod05__give_gem", 0, "null");
          q.gems(15);
        }
      },
      pod04__give_gem(q) {
        // step 119: once
        if (once(q, "step119")) {
          q.send("qad", "pod04__give_gem", 0, "null");
          q.gems(10);
        }
      },
      pod21h__give_gem(q) {
        // step 125: once
        if (once(q, "step125")) {
          q.send("qad", "pod21h__give_gem", 0, "null");
          q.gems(5);
        }
      },
      pod06__give_gem(q) {
        // step 131: once
        if (once(q, "step131")) {
          q.send("qad", "pod06__give_gem", 0, "null");
          q.gems(15);
        }
      },
      pod08__give_gem(q) {
        // step 137: once
        if (once(q, "step137")) {
          q.send("qad", "pod08__give_gem", 0, "null");
          q.gems(10);
        }
      },
      lock08(q) {
        const held = q.held(); // what the player carried when this fired
        // step 138: unless holding key08
        if (held !== "key08") {
          q.send("qcmd", 2, "lock08", 10675, 0);
        }
        // step 151: only while holding key08, once
        if (held === "key08" && once(q, "step151")) {
          q.use();
          set(q, "towerdoor01", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          q.xp(10, "lock08");
          q.send("qcmd", 38, 10678);
          q.vars.goal = 10678;
          set(q, "lock08", 1, 0, 0);
          q.after(740, () => {
            set(q, "blockvol08", 99, 0, 0);
          });
        }
      },
      pod07__give_gem(q) {
        // step 144: once
        if (once(q, "step144")) {
          q.send("qad", "pod07__give_gem", 0, "null");
          q.gems(15);
        }
      },
      pod13__give_gem(q) {
        // step 150: once
        if (once(q, "step150")) {
          q.send("qad", "pod13__give_gem", 0, "null");
          q.gems(10);
        }
      },
      sentryswitc3(q) {
        // step 152: once
        if (once(q, "step152")) {
          q.xp(5, "sentryswitc3");
          set(q, "switchtile3", 1, 1, 0);
          set(q, "sentry04lp", 1, 0, 0);
          set(q, "sentry05lp", 1, 0, 0);
          set(q, "sentry06lp", 1, 0, 0);
          q.send("qswfs", "sentry04", "turnoff");
          set(q, "sentry04", 1, 1, 0);
          q.send("qswfs", "sentry05", "turnoff");
          set(q, "sentry05", 1, 1, 0);
          q.send("qswfs", "sentry06", "turnoff");
          set(q, "sentry06", 1, 1, 0);
          set(q, "sentryswitc3", 99, 0, 0);
        }
      },
      pod09__give_gem(q) {
        // step 158: once
        if (once(q, "step158")) {
          q.send("qad", "pod09__give_gem", 0, "null");
          q.gems(10);
        }
      },
      pod10__give_gem(q) {
        // step 164: once
        if (once(q, "step164")) {
          q.send("qad", "pod10__give_gem", 0, "null");
          q.gems(10);
        }
      },
      lock09(q) {
        const held = q.held(); // what the player carried when this fired
        // step 165: unless holding key09
        if (held !== "key09") {
          q.send("qcmd", 2, "lock09", 10675, 0);
        }
        // step 166: only while holding key09, once
        if (held === "key09" && once(q, "step166")) {
          q.use();
          q.send("qsnd", "ajq_gemdoor");
          set(q, "towerdoor02", 1, 1, 0);
          q.xp(10, "lock09");
          q.send("qcmd", 38, 10680);
          q.vars.goal = 10680;
          set(q, "lock09", 1, 0, 0);
          q.after(1950, () => {
            set(q, "blockvol10", 99, 0, 0);
          });
        }
      },
      sentryswitc4(q) {
        // step 167: once
        if (once(q, "step167")) {
          q.xp(5, "sentryswitc4");
          set(q, "switchtile4", 1, 1, 0);
          q.send("qswfs", "sentry07", "turnoff");
          set(q, "sentry07", 1, 1, 0);
          set(q, "sentry07lp", 1, 0, 0);
          q.send("qswfs", "sentry08", "turnoff");
          set(q, "sentry08", 1, 1, 0);
          set(q, "sentry08lp", 1, 0, 0);
          q.send("qswfs", "sentry09", "turnoff");
          set(q, "sentry09", 1, 1, 0);
          set(q, "sentry09lp", 1, 0, 0);
          set(q, "sentryswitc4", 99, 0, 0);
        }
      },
      avatar1(q) {
        // step 168
        q.send("qcmd", 2, "avatar1", 10715, 0);
      },
      toproomvol(q) {
        // step 169
        q.send("qcmd", 38, 10672);
        q.vars.goal = 10672;
        set(q, "toproomvol", 1, 0, 0);
      },
      factory03__0___give_d(q) {
        // step 170: once
        if (once(q, "step170")) {
          q.send("qad", "factory03__0___give_d", 0, "null");
          q.gems(25);
        }
      },
      factory01__0___give_d(q) {
        // step 171: once
        if (once(q, "step171")) {
          q.send("qad", "factory01__0___give_d", 0, "null");
          q.gems(25);
        }
      },
      greelyvol(q) {
        // step 172: once
        if (once(q, "step172")) {
          q.send("qmusic", 0);
          q.send("qmusic", "aj_musvolcanogreely");
          appear(q, "greely");
          q.send("qcmdVT", 1, "40_uri", 1, 0, 0);
          q.send("qposturi", "/adventure5-thegreatescape/#40-reachthetopofthetower/#0#001");
          q.send("qcmdVT", 1, "40_uri", 99, 0, 0);
          q.send("qcmd", 38, 10720);
          q.vars.goal = 10720;
          q.send("qicon", "greely", 1);
          set(q, "greely", 2, 1, 1);
          set(q, "stealthvol_1", 0, 1, 0);
          q.send("qshake", 2000);
          set(q, "greelyvol", 99, 0, 0);
        }
      },
      greely(q) {
        // step 173
        q.send("qcmd", 3, 0, "greely", 2, 10670);
        q.after(18600, () => {
          set(q, "greely", 4, 1, 1);
          q.send("qcmd", 3, 0, "greely", 4, 3935);
        });
      },
      cosmo2(q) {
        // step 178
        q.send("qicon", "cosmo2", 1);
        q.send("qcmd", 3, 0, "cosmo2", 1, 10668);
      },
      exitvol(q) {
        // step 180
        q.send("qcmd", 19);
      },
      vol_hop2(q) {
        // vol_hop2 starts hidden: nothing until the script shows it
        if (!(q.vars.shown || {})["vol_hop2"]) {
          return;
        }
        // keep at it to fill interactdoor
        fill(q, "interactdoor", () => {
          q.xp(25, "vol_hop2");
          set(q, "jumppad", 1, 1, 1);
          q.send("qcmdVT", 1, "30_uri", 1, 0, 0);
          q.send("qposturi", "/adventure5-thegreatescape/#30-escapethedungeon/#0#001");
          q.send("qcmdVT", 1, "30_uri", 99, 0, 0);
          set(q, "blockvol06", 99, 0, 0);
          q.send("qcmd", 38, 10664);
          q.vars.goal = 10664;
          q.send("qswfs", "prisoner03", "idle");
          set(q, "prisoner03", 10, 1, 1);
          set(q, "prisoner03", 0, 1, 0);
          q.send("qswfs", "prisoner04", "idle");
          set(q, "prisoner04", 10, 1, 1);
          set(q, "prisoner04", 0, 1, 0);
          q.send("qswfs", "prisoner05", "idle");
          set(q, "prisoner05", 10, 1, 1);
          set(q, "prisoner05", 0, 1, 0);
          q.send("qswfs", "prisoner06", "idle");
          set(q, "prisoner06", 10, 1, 1);
          set(q, "prisoner06", 0, 1, 0);
          q.send("qswfs", "prisoner07", "idle");
          set(q, "prisoner07", 10, 1, 1);
          set(q, "prisoner07", 0, 1, 0);
          q.send("qswfs", "prisoner08", "idle");
          set(q, "prisoner08", 10, 1, 1);
          set(q, "prisoner08", 0, 1, 0);
          set(q, "vol_hop2", 3, 1, 1);
        }, {}, 5);
      },
      trig6(q) {
        // a mirror of puz6: turns it; the number of the door that opened, if one did
        const opened = turn(q, 0, "trig6");
        if (opened === 0) {
          q.xp(25, "trig6");
          set(q, "puz6beam2", 1, 1, 0);
          set(q, "puz6end", 1, 1, 0);
          set(q, "puz6door", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          set(q, "puz6frame_l", 2, 1, 0);
          set(q, "puz6frame_r", 2, 1, 0);
          q.send("qcmdVT", 1, "pris2state", bump(q, "pris2state"), 0, 0); // one more than last time
          counted(q, "pris2state"); // what that count sets off
          set(q, "prisoner02", 3, 1, 1);
          q.send("qcmd", 2, "prisoner02", 3953, 1);
          set(q, "trig6", 99, 0, 0);
          q.after(260, () => {
            set(q, "blockvol04", 99, 0, 0);
          });
        }
      },
      trig7a(q) {
        // a mirror of puz7: turns it; the number of the door that opened, if one did
        const opened = turn(q, 1, "trig7a");
        if (opened === 0) {
          set(q, "puz7beam4", 600, 1, 0);
          q.xp(25, "trig7b");
          set(q, "puz7end", 1, 1, 0);
          set(q, "puz7door", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          set(q, "puz7frame_l", 2, 1, 0);
          set(q, "puz7frame_r", 2, 1, 0);
          q.send("qcmd", 38, 3962);
          q.vars.goal = 3962;
          set(q, "prisoner01", 99, 0, 0);
          set(q, "trig7b", 99, 0, 0);
          set(q, "trig7a", 99, 0, 0);
          q.after(820, () => {
            set(q, "blockvol05", 99, 0, 0);
          });
        }
      },
      trig7b(q) {
        // a mirror of puz7: turns it; the number of the door that opened, if one did
        const opened = turn(q, 1, "trig7b");
        if (opened === 0) {
          set(q, "puz7beam4", 600, 1, 0);
          q.xp(25, "trig7b");
          set(q, "puz7end", 1, 1, 0);
          set(q, "puz7door", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          set(q, "puz7frame_l", 2, 1, 0);
          set(q, "puz7frame_r", 2, 1, 0);
          q.send("qcmd", 38, 3962);
          q.vars.goal = 3962;
          set(q, "prisoner01", 99, 0, 0);
          set(q, "trig7b", 99, 0, 0);
          set(q, "trig7a", 99, 0, 0);
          q.after(820, () => {
            set(q, "blockvol05", 99, 0, 0);
          });
        }
      },
      trig8a(q) {
        // a mirror of puz8: turns it; the number of the door that opened, if one did
        const opened = turn(q, 2, "trig8a");
        if (opened === 0) {
          q.after(1240, () => {
            q.after(810, () => {
              set(q, "puz8beam5", 30, 1, 0);
              set(q, "puz8b", 6, 1, 0);
              set(q, "puz8beam6", 50, 1, 0);
              set(q, "puz8end2", 1, 1, 0);
              set(q, "puz8frame_r", 2, 1, 0);
              q.send("qcmdVT", 1, "puz8state", bump(q, "puz8state"), 0, 0); // one more than last time
              counted(q, "puz8state"); // what that count sets off
              q.xp(25, "puz8state");
              set(q, "puz8door", 1, 1, 0);
              q.send("qsnd", "ajq_gemdoor");
              q.xp(25, "puz8state");
              q.send("qsnd", "ajq_gemdoor");
              set(q, "trig8b", 99, 0, 0);
              q.after(350, () => {
                set(q, "blockvol07", 99, 0, 0);
              });
            });
          });
        }
      },
      trig8b(q) {
        // a mirror of puz8: turns it; the number of the door that opened, if one did
        const opened = turn(q, 2, "trig8b");
        if (opened === 0) {
          q.after(1240, () => {
            q.after(810, () => {
              set(q, "puz8beam5", 30, 1, 0);
              set(q, "puz8b", 6, 1, 0);
              set(q, "puz8beam6", 50, 1, 0);
              set(q, "puz8end2", 1, 1, 0);
              set(q, "puz8frame_r", 2, 1, 0);
              q.send("qcmdVT", 1, "puz8state", bump(q, "puz8state"), 0, 0); // one more than last time
              counted(q, "puz8state"); // what that count sets off
              q.xp(25, "puz8state");
              set(q, "puz8door", 1, 1, 0);
              q.send("qsnd", "ajq_gemdoor");
              q.xp(25, "puz8state");
              q.send("qsnd", "ajq_gemdoor");
              set(q, "trig8b", 99, 0, 0);
              q.after(350, () => {
                set(q, "blockvol07", 99, 0, 0);
              });
            });
          });
        }
      },
      trig9a(q) {
        // a mirror of puz9: turns it; the number of the door that opened, if one did
        const opened = turn(q, 3, "trig9a");
        if (opened === 0) {
          set(q, "puz9beam10", 85, 1, 0);
          set(q, "puz9j", 4, 1, 0);
          set(q, "puz9beam11", 25, 1, 0);
          q.xp(25, "trig9c");
          set(q, "trig9a", 99, 0, 0);
          set(q, "trig9b", 99, 0, 0);
          set(q, "trig9c", 99, 0, 0);
          set(q, "puz9end", 1, 1, 0);
          set(q, "puz9door", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          set(q, "puz9frame_l", 2, 1, 0);
          set(q, "puz9frame_r", 2, 1, 0);
          q.send("qcmd", 38, 10679);
          q.vars.goal = 10679;
          q.after(700, () => {
            set(q, "blockvol09", 99, 0, 0);
          });
        }
      },
      trig9b(q) {
        // a mirror of puz9: turns it; the number of the door that opened, if one did
        const opened = turn(q, 3, "trig9b");
        if (opened === 0) {
          set(q, "puz9beam10", 85, 1, 0);
          set(q, "puz9j", 4, 1, 0);
          set(q, "puz9beam11", 25, 1, 0);
          q.xp(25, "trig9c");
          set(q, "trig9a", 99, 0, 0);
          set(q, "trig9b", 99, 0, 0);
          set(q, "trig9c", 99, 0, 0);
          set(q, "puz9end", 1, 1, 0);
          set(q, "puz9door", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          set(q, "puz9frame_l", 2, 1, 0);
          set(q, "puz9frame_r", 2, 1, 0);
          q.send("qcmd", 38, 10679);
          q.vars.goal = 10679;
          q.after(700, () => {
            set(q, "blockvol09", 99, 0, 0);
          });
        }
      },
      trig9c(q) {
        // a mirror of puz9: turns it; the number of the door that opened, if one did
        const opened = turn(q, 3, "trig9c");
        if (opened === 0) {
          set(q, "puz9beam10", 85, 1, 0);
          set(q, "puz9j", 4, 1, 0);
          set(q, "puz9beam11", 25, 1, 0);
          q.xp(25, "trig9c");
          set(q, "trig9a", 99, 0, 0);
          set(q, "trig9b", 99, 0, 0);
          set(q, "trig9c", 99, 0, 0);
          set(q, "puz9end", 1, 1, 0);
          set(q, "puz9door", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          set(q, "puz9frame_l", 2, 1, 0);
          set(q, "puz9frame_r", 2, 1, 0);
          q.send("qcmd", 38, 10679);
          q.vars.goal = 10679;
          q.after(700, () => {
            set(q, "blockvol09", 99, 0, 0);
          });
        }
      },
      trig10c(q) {
        // a mirror of puz10: turns it; the number of the door that opened, if one did
        const opened = turn(q, 4, "trig10c");
        if (opened === 0) {
          q.xp(25, "trig10b");
          set(q, "puz10beam4", 500, 1, 0);
          set(q, "puz10end1", 1, 1, 0);
          set(q, "trig10b", 99, 0, 0);
          set(q, "puz10frame1r", 2, 1, 0);
          set(q, "puz10frame1l", 2, 1, 0);
          set(q, "puz10door1", 1, 1, 0);
          set(q, "puz10start2", 5, 1, 0);
          set(q, "puz10beam5", 400, 1, 0);
          set(q, "puz10beam6", 35, 1, 0);
          set(q, "puz10end2", 1, 1, 0);
          set(q, "puz10frame2l", 2, 1, 0);
          set(q, "trig10c", 99, 0, 0);
          q.after(880, () => {
            set(q, "blockvol11", 99, 0, 0);
          });
        }
        if (opened === 1) {
          set(q, "puz10beam4", 99, 0, 0);
          set(q, "trig10a", 99, 0, 0);
          set(q, "puz10door2", 1, 1, 0);
          q.xp(25, "trig10a");
          q.send("qcmd", 38, 10681);
          q.vars.goal = 10681;
          set(q, "blockvol12", 99, 0, 0);
        }
      },
      trig10a(q) {
        // a mirror of puz10: turns it; the number of the door that opened, if one did
        const opened = turn(q, 4, "trig10a");
        if (opened === 0) {
          q.xp(25, "trig10b");
          set(q, "puz10beam4", 500, 1, 0);
          set(q, "puz10end1", 1, 1, 0);
          set(q, "trig10b", 99, 0, 0);
          set(q, "puz10frame1r", 2, 1, 0);
          set(q, "puz10frame1l", 2, 1, 0);
          set(q, "puz10door1", 1, 1, 0);
          set(q, "puz10start2", 5, 1, 0);
          set(q, "puz10beam5", 400, 1, 0);
          set(q, "puz10beam6", 35, 1, 0);
          set(q, "puz10end2", 1, 1, 0);
          set(q, "puz10frame2l", 2, 1, 0);
          set(q, "trig10c", 99, 0, 0);
          q.after(880, () => {
            set(q, "blockvol11", 99, 0, 0);
          });
        }
        if (opened === 1) {
          set(q, "puz10beam4", 99, 0, 0);
          set(q, "trig10a", 99, 0, 0);
          set(q, "puz10door2", 1, 1, 0);
          q.xp(25, "trig10a");
          q.send("qcmd", 38, 10681);
          q.vars.goal = 10681;
          set(q, "blockvol12", 99, 0, 0);
        }
      },
      trig10b(q) {
        // a mirror of puz10: turns it; the number of the door that opened, if one did
        const opened = turn(q, 4, "trig10b");
        if (opened === 0) {
          q.xp(25, "trig10b");
          set(q, "puz10beam4", 500, 1, 0);
          set(q, "puz10end1", 1, 1, 0);
          set(q, "trig10b", 99, 0, 0);
          set(q, "puz10frame1r", 2, 1, 0);
          set(q, "puz10frame1l", 2, 1, 0);
          set(q, "puz10door1", 1, 1, 0);
          set(q, "puz10start2", 5, 1, 0);
          set(q, "puz10beam5", 400, 1, 0);
          set(q, "puz10beam6", 35, 1, 0);
          set(q, "puz10end2", 1, 1, 0);
          set(q, "puz10frame2l", 2, 1, 0);
          set(q, "trig10c", 99, 0, 0);
          q.after(880, () => {
            set(q, "blockvol11", 99, 0, 0);
          });
        }
        if (opened === 1) {
          set(q, "puz10beam4", 99, 0, 0);
          set(q, "trig10a", 99, 0, 0);
          set(q, "puz10door2", 1, 1, 0);
          q.xp(25, "trig10a");
          q.send("qcmd", 38, 10681);
          q.vars.goal = 10681;
          set(q, "blockvol12", 99, 0, 0);
        }
      },
      factory03(q) {
        spawning(q, "factory03"); // the factory starts sending out phantoms
      },
      factory01(q) {
        spawning(q, "factory01"); // the factory starts sending out phantoms
      },
    },

    // families of triggers: the rule for any of them; {n} is its number
    triggerLike: [
      [/^seedpile(\d+)$/, (q, name) => {
        const n = name.match(/^seedpile(\d+)$/)[1];
        // each of them
        {
          // step 181
          giveSeeds(q, 137, 3, 3);
        }
      }],
      [/^phantom(\d+)b__give_gem$/, (q, name) => {
        const n = name.match(/^phantom(\d+)b__give_gem$/)[1];
        // each of them, once each
        if (once(q, "phantom#b__give_gem - " + name)) {
          // step 182
          q.send("qad", `${name}`, 0, "null");
          q.gems(25);
        }
      }],
      [/^phantom(\d+)a__give_gem$/, (q, name) => {
        const n = name.match(/^phantom(\d+)a__give_gem$/)[1];
        // each of them, once each
        if (once(q, "phantom#a__give_gem - " + name)) {
          // step 183
          q.send("qad", `${name}`, 0, "null");
          q.gems(25);
        }
      }],
      [/^phantom(\d+)c__give_gem$/, (q, name) => {
        const n = name.match(/^phantom(\d+)c__give_gem$/)[1];
        // each of them, once each
        if (once(q, "phantom#c__give_gem - " + name)) {
          // step 184
          q.send("qad", `${name}`, 0, "null");
          q.gems(25);
        }
      }],
    ],

    // a talk read to its end
    answer: {
      cosmo1(q) {
        // step 5: once
        if (once(q, "step5")) {
          q.send("qcmdVT", 1, "00_uri", 1, 0, 0);
          q.send("qcmdVT", 1, "players", 1, 0, 0);
          q.send("qposturi", "/adventure5-thegreatescape/#00-start/#0#001");
          q.send("qcmdVT", 1, "00_uri", 99, 0, 0);
          set(q, "vol_dance", 1, 1, 1);
          set(q, "vol_play", 1, 1, 1);
          set(q, "vol_hop", 1, 1, 1);
          q.send("qcmd", 38, 3911);
          q.vars.goal = 3911;
          q.send("qswfs", "cosmo1", "disappear");
          set(q, "cosmo1", 1, 1, 1);
          q.send("qicon", "cosmo1", 0);
          set(q, "cosmo1", 2, 1, 0);
          q.after(1160, () => {
            set(q, "cosmo1", 99, 0, 0);
          });
        }
      },
      greely(q) {
        const n = tally(q, "answer greely");
        // step 174: the 1st time
        if (n === 1) {
          set(q, "greely", 3, 1, 0);
          set(q, "toprison", 99, 0, 0);
          q.after(1070, () => {
            q.send("qshake", 2000);
            q.after(2000, () => {
              q.send("qmusic", 0);
              q.send("qplayswf", "2497", "null", "null");
            });
          });
        }
        // step 175: the 2nd time
        if (n === 2) {
          q.send("qcmd", 38, 10673);
          q.vars.goal = 10673;
          q.send("qswfs", "greely", "disappear");
          set(q, "greely", 5, 1, 1);
          q.send("qicon", "greely", 0);
          set(q, "greely", 6, 1, 0);
          q.after(1590, () => {
            q.send("qshake", 2000);
            q.send("qmusic", 0);
            set(q, "greely", 99, 0, 0);
            q.send("qfade", 0);
            q.send("qfade", 1);
            q.send("qmusic", 0);
            q.after(2000, () => {
              q.send("qcmd", 4, 93, "playgame", 4);
            });
          });
        }
      },
      cosmo2(q) {
        // step 179: once
        if (once(q, "step179")) {
          set(q, "cosmo2", 2, 1, 1);
          set(q, "portalsound", 1, 1, 0);
          set(q, "exitportal", 1, 1, 0);
          q.xp(50, "cosmo2");
          q.send("qcmd", 38, 10674);
          q.vars.goal = 10674;
          set(q, "cosmo2", 3, 1, 0);
          q.after(200, () => {
            q.send("qcmdVT", 1, "70_uri", 1, 0, 0);
            q.send("qposturi", "/adventure5-thegreatescape/#70-exit/#0#001");
            q.offer([[1,1328,0],[3,1000,1000],[1,1329,0],[3,750,750],[1,1330,0]]); // [1, den item, 0], [2, clothing item, ?] or [3, gems, gems]
            q.after(3000, () => {
              set(q, "blockvol_end", 99, 0, 0);
            });
          });
        }
      },
    },

    // hit by the player (adventures.js needs its handler, see the maker)
    attacked: {
      pod01(q) {
        const n = tally(q, "attacked pod01");
        // step 76: the 1st time
        if (n === 1) {
          q.send("qahs", "pod01", 80, 10, 0);
        }
        // step 77: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod01", 60, 10, 0);
        }
        // step 78: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod01", 40, 10, 0);
        }
        // step 79: the 4th time
        if (n === 4) {
          q.send("qahs", "pod01", 20, 10, 0);
        }
        // step 80: the 5th time
        if (n === 5) {
          q.send("qad", "pod01", 10, 0, -368, 11661, "");
          q.xp(5, "pod01");
          q.send("qspn", "pod01", "pod01__give_gem", 200, 42, 3, 5, "null", "null", "null");
          set(q, "podcol01", 99, 0, 0);
          set(q, "pod01", 2, 1, 0);
        }
      },
      pod02(q) {
        const n = tally(q, "attacked pod02");
        // step 82: the 1st time
        if (n === 1) {
          q.send("qahs", "pod02", 80, 10, 0);
        }
        // step 83: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod02", 60, 10, 0);
        }
        // step 84: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod02", 40, 10, 0);
        }
        // step 85: the 4th time
        if (n === 4) {
          q.send("qahs", "pod02", 20, 10, 0);
        }
        // step 86: the 5th time
        if (n === 5) {
          q.send("qad", "pod02", 10, 0, 233, 11678, "");
          q.xp(5, "pod02");
          q.send("qspn", "pod02", "pod02__give_gem", 200, 42, 3, 10, "null", "null", "null");
          set(q, "podcol02", 99, 0, 0);
          set(q, "pod02", 2, 1, 0);
        }
      },
      pod11(q) {
        const n = tally(q, "attacked pod11");
        // step 88: the 1st time
        if (n === 1) {
          q.send("qahs", "pod11", 80, 10, 0);
        }
        // step 89: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod11", 60, 10, 0);
        }
        // step 90: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod11", 40, 10, 0);
        }
        // step 91: the 4th time
        if (n === 4) {
          q.send("qahs", "pod11", 20, 10, 0);
        }
        // step 92: the 5th time
        if (n === 5) {
          q.send("qad", "pod11", 10, 0, 1087, 11744, "");
          q.xp(5, "pod11");
          q.send("qspn", "pod11", "pod11__give_gem", 200, 42, 3, 15, "null", "null", "null");
          set(q, "podcol11", 99, 0, 0);
          set(q, "pod11", 2, 1, 0);
        }
      },
      pod03(q) {
        const n = tally(q, "attacked pod03");
        // step 95: the 1st time
        if (n === 1) {
          q.send("qahs", "pod03", 80, 10, 0);
        }
        // step 96: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod03", 60, 10, 0);
        }
        // step 97: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod03", 40, 10, 0);
        }
        // step 98: the 4th time
        if (n === 4) {
          q.send("qahs", "pod03", 20, 10, 0);
        }
        // step 99: the 5th time
        if (n === 5) {
          q.send("qad", "pod03", 10, 0, 778, 10979, "");
          q.xp(5, "pod03");
          q.send("qspn", "pod03", "pod03__give_gem", 200, 42, 3, 5, "null", "null", "null");
          set(q, "podcol03", 99, 0, 0);
          set(q, "pod03", 2, 1, 0);
        }
      },
      pod12(q) {
        const n = tally(q, "attacked pod12");
        // step 102: the 1st time
        if (n === 1) {
          q.send("qahs", "pod12", 80, 10, 0);
        }
        // step 103: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod12", 60, 10, 0);
        }
        // step 104: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod12", 40, 10, 0);
        }
        // step 105: the 4th time
        if (n === 4) {
          q.send("qahs", "pod12", 20, 10, 0);
        }
        // step 106: the 5th time
        if (n === 5) {
          q.send("qad", "pod12", 10, 0, 497, 9810, "");
          q.xp(5, "pod12");
          q.send("qspn", "pod12", "pod12__give_gem", 200, 42, 3, 5, "null", "null", "null");
          set(q, "podcol12", 99, 0, 0);
          set(q, "pod12", 2, 1, 0);
        }
      },
      pod05(q) {
        const n = tally(q, "attacked pod05");
        // step 108: the 1st time
        if (n === 1) {
          q.send("qahs", "pod05", 80, 10, 0);
        }
        // step 109: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod05", 60, 10, 0);
        }
        // step 110: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod05", 40, 10, 0);
        }
        // step 111: the 4th time
        if (n === 4) {
          q.send("qahs", "pod05", 20, 10, 0);
        }
        // step 112: the 5th time
        if (n === 5) {
          q.send("qad", "pod05", 10, 0, -309, 9862, "");
          q.xp(5, "pod05");
          q.send("qspn", "pod05", "pod05__give_gem", 200, 42, 3, 15, "null", "null", "null");
          set(q, "podcol05", 99, 0, 0);
          set(q, "pod05", 2, 1, 0);
        }
      },
      pod04(q) {
        const n = tally(q, "attacked pod04");
        // step 114: the 1st time
        if (n === 1) {
          q.send("qahs", "pod04", 80, 10, 0);
        }
        // step 115: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod04", 60, 10, 0);
        }
        // step 116: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod04", 40, 10, 0);
        }
        // step 117: the 4th time
        if (n === 4) {
          q.send("qahs", "pod04", 20, 10, 0);
        }
        // step 118: the 5th time
        if (n === 5) {
          q.send("qad", "pod04", 10, 0, 597, 9370, "");
          q.xp(5, "pod04");
          q.send("qspn", "pod04", "pod04__give_gem", 200, 42, 3, 10, "null", "null", "null");
          set(q, "podcol04", 99, 0, 0);
          set(q, "pod04", 2, 1, 0);
        }
      },
      pod21h(q) {
        const n = tally(q, "attacked pod21h");
        // step 120: the 1st time
        if (n === 1) {
          q.send("qahs", "pod21h", 80, 10, 0);
        }
        // step 121: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod21h", 60, 10, 0);
        }
        // step 122: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod21h", 40, 10, 0);
        }
        // step 123: the 4th time
        if (n === 4) {
          q.send("qahs", "pod21h", 20, 10, 0);
        }
        // step 124: the 5th time
        if (n === 5) {
          q.send("qad", "pod21h", 10, 0, -19, 8023, "");
          q.xp(5, "pod21h");
          q.send("qspn", "pod21h", "pod21h__give_gem", 200, 42, 3, 5, "null", "null", "null");
          set(q, "podcol21h", 99, 0, 0);
          set(q, "pod21h", 2, 1, 0);
        }
      },
      pod06(q) {
        const n = tally(q, "attacked pod06");
        // step 126: the 1st time
        if (n === 1) {
          q.send("qahs", "pod06", 80, 10, 0);
        }
        // step 127: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod06", 60, 10, 0);
        }
        // step 128: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod06", 40, 10, 0);
        }
        // step 129: the 4th time
        if (n === 4) {
          q.send("qahs", "pod06", 20, 10, 0);
        }
        // step 130: the 5th time
        if (n === 5) {
          q.send("qad", "pod06", 10, 0, 255, 8201, "");
          q.xp(5, "pod06");
          q.send("qspn", "pod06", "pod06__give_gem", 200, 42, 3, 15, "null", "null", "null");
          set(q, "podcol06", 99, 0, 0);
          set(q, "pod06", 2, 1, 0);
        }
      },
      pod08(q) {
        const n = tally(q, "attacked pod08");
        // step 132: the 1st time
        if (n === 1) {
          q.send("qahs", "pod08", 80, 10, 0);
        }
        // step 133: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod08", 60, 10, 0);
        }
        // step 134: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod08", 40, 10, 0);
        }
        // step 135: the 4th time
        if (n === 4) {
          q.send("qahs", "pod08", 20, 10, 0);
        }
        // step 136: the 5th time
        if (n === 5) {
          q.send("qad", "pod08", 10, 0, 509, 8362, "");
          q.xp(5, "pod08");
          q.send("qspn", "pod08", "pod08__give_gem", 200, 42, 3, 10, "null", "null", "null");
          set(q, "podcol08", 99, 0, 0);
          set(q, "pod08", 2, 1, 0);
        }
      },
      pod07(q) {
        const n = tally(q, "attacked pod07");
        // step 139: the 1st time
        if (n === 1) {
          q.send("qahs", "pod07", 80, 10, 0);
        }
        // step 140: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod07", 60, 10, 0);
        }
        // step 141: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod07", 40, 10, 0);
        }
        // step 142: the 4th time
        if (n === 4) {
          q.send("qahs", "pod07", 20, 10, 0);
        }
        // step 143: the 5th time
        if (n === 5) {
          q.send("qad", "pod07", 10, 0, 581, 7614, "");
          q.xp(5, "pod07");
          q.send("qspn", "pod07", "pod07__give_gem", 200, 42, 3, 15, "null", "null", "null");
          set(q, "podcol07", 99, 0, 0);
          set(q, "pod07", 2, 1, 0);
        }
      },
      pod13(q) {
        const n = tally(q, "attacked pod13");
        // step 145: the 1st time
        if (n === 1) {
          q.send("qahs", "pod13", 80, 10, 0);
        }
        // step 146: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod13", 60, 10, 0);
        }
        // step 147: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod13", 40, 10, 0);
        }
        // step 148: the 4th time
        if (n === 4) {
          q.send("qahs", "pod13", 20, 10, 0);
        }
        // step 149: the 5th time
        if (n === 5) {
          q.send("qad", "pod13", 10, 0, 1453, 8133, "");
          q.xp(5, "pod13");
          q.send("qspn", "pod13", "pod13__give_gem", 200, 42, 3, 10, "null", "null", "null");
          set(q, "podcol13", 99, 0, 0);
          set(q, "pod13", 2, 1, 0);
        }
      },
      pod09(q) {
        const n = tally(q, "attacked pod09");
        // step 153: the 1st time
        if (n === 1) {
          q.send("qahs", "pod09", 80, 10, 0);
        }
        // step 154: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod09", 60, 10, 0);
        }
        // step 155: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod09", 40, 10, 0);
        }
        // step 156: the 4th time
        if (n === 4) {
          q.send("qahs", "pod09", 20, 10, 0);
        }
        // step 157: the 5th time
        if (n === 5) {
          q.send("qad", "pod09", 10, 0, 585, 5880, "");
          q.xp(5, "pod09");
          q.send("qspn", "pod09", "pod09__give_gem", 200, 42, 3, 10, "null", "null", "null");
          set(q, "podcol09", 99, 0, 0);
          set(q, "pod09", 2, 1, 0);
        }
      },
      pod10(q) {
        const n = tally(q, "attacked pod10");
        // step 159: the 1st time
        if (n === 1) {
          q.send("qahs", "pod10", 80, 10, 0);
        }
        // step 160: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod10", 60, 10, 0);
        }
        // step 161: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod10", 40, 10, 0);
        }
        // step 162: the 4th time
        if (n === 4) {
          q.send("qahs", "pod10", 20, 10, 0);
        }
        // step 163: the 5th time
        if (n === 5) {
          q.send("qad", "pod10", 10, 0, 1123, 4952, "");
          q.xp(5, "pod10");
          q.send("qspn", "pod10", "pod10__give_gem", 200, 42, 3, 10, "null", "null", "null");
          set(q, "podcol10", 99, 0, 0);
          set(q, "pod10", 2, 1, 0);
        }
      },
    },

    // a chest, opened
    opened: {
      treasure01(q) {
        if (!once(q, "opened treasure01")) {
          return;
        }
        q.gems(50);
        // step 58
        q.xp(5, "treasure01");
      },
      treasure02(q) {
        if (!once(q, "opened treasure02")) {
          return;
        }
        q.gems(100);
        // step 60
        q.xp(5, "treasure02");
      },
      treasure03(q) {
        if (!once(q, "opened treasure03")) {
          return;
        }
        q.gems(150);
        // step 50
        q.xp(5, "treasure03");
      },
      treasure04(q) {
        if (!once(q, "opened treasure04")) {
          return;
        }
        q.gems(200);
        // step 62
        q.xp(5, "treasure04");
      },
      treasure_a1(q) {
        if (!once(q, "opened treasure_a1")) {
          return;
        }
        q.gems(50);
      },
      treasure_a2(q) {
        if (!once(q, "opened treasure_a2")) {
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
      const how = {"boomrock10":[1,1],"factory03":[1,1],"factory01":[1,1],"factory02":[1,1]}; // how these die (phantoms: 50, 1)
      q.send("qad", phantom, (how[phantom] || [50, 1])[0], (how[phantom] || [50, 1])[1], x, y, "");
      spawned(q, phantom); // a factory destroyed, or one of its phantoms gone
      // step 185: every phantom#
      if (/^(?:phantom\d+[a-z]?)$/.test(phantom)) {
        q.send("qspn", `${phantom}`, `${phantom}__give_gem`, 200, 42, 3, 25, "null", "null", "null");
        q.xp(5, `${phantom}`);
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 186: every factory#
      if (/^(?:factory\d+[a-z]?)$/.test(phantom)) {
        q.xp(5, `${phantom}`);
        q.send("qcmdVT", 1, "toproom", bump(q, "toproom"), 0, 0); // one more than last time
      }
      // step 187: every factory#__#_
      if (/^(?:factory\d+[a-z]?__\d+[a-z]?_)$/.test(phantom)) {
        q.send("qspn", `${phantom}`, `${phantom}__give_d`, 200, 42, 3, 25, "null", "null", "null");
      }
      // step 188: when it is boomrock10
      if (phantom === "boomrock10") {
        set(q, "blockvol13", 99, 0, 0);
        q.xp(5, `${phantom}`);
        set(q, `${phantom}`, 2, 1, 0);
        set(q, "puz10beam1", 80, 1, 0);
        set(q, "puz10a", 6, 1, 0);
        set(q, "puz10beam9", 10, 1, 0);
        set(q, "puz10e", 5, 1, 0);
        set(q, "puz10beam8", 1, 1, 0);
        set(q, "puz10f", 7, 1, 0);
        set(q, "puz10beam7", 10, 1, 0);
        set(q, "puz10g", 5, 1, 0);
        set(q, "puz10beam10", 25, 1, 0);
        set(q, "puz10end3", 1, 1, 0);
        set(q, "puz10frame2r", 2, 1, 0);
      }
      // step 189: when it is phantom3b
      if (phantom === "phantom3b") {
        q.send("qcmdVT", 1, "toproom", bump(q, "toproom"), 0, 0); // one more than last time
      }
      // step 190: when it is phantom3c
      if (phantom === "phantom3c") {
        q.send("qcmdVT", 1, "toproom", bump(q, "toproom"), 0, 0); // one more than last time
      }
      // step 191: when it is phantom3a
      if (phantom === "phantom3a") {
        q.send("qcmdVT", 1, "toproom", bump(q, "toproom"), 0, 0); // one more than last time
      }
      // step 192: when it is factory03
      if (phantom === "factory03") {
        set(q, "blockvol16", 99, 0, 0);
      }
      // step 193: when it is factory01
      if (phantom === "factory01") {
        set(q, "blockvol14", 99, 0, 0);
      }
      // step 194: when toproom gets to 6
      if ((q.vars.counts || {})["toproom"] === 6 && once(q, "count toproom")) {
        set(q, "greelyvol", 1, 1, 1);
        q.send("qcmd", 38, 10682);
        q.vars.goal = 10682;
      }
      // step 195: when it is factory02
      if (phantom === "factory02") {
        set(q, "blockvol15", 99, 0, 0);
      }
    },

    // the player stopped (left the pad, stopped hopping): adventures.js needs its handler, see the maker
    untriggered: {
      vol_hop2: q => stopFilling(q, "interactdoor"),
    },

    // a minigame played to its end (the client sends "qfrmgdone"; adventures.js needs
    // a handler that runs this, see the maker)
    minigameDone(q) {
      // step 177
      q.room("endroom", "endroom");
    },

    // a cutscene played to its end (the client answers "qplayswf"; adventures.js needs
    // a handler that runs this, see the maker)
    cutsceneDone(q) {
      // step 176
      q.send("qmusic", "aj_musvolcanogreely");
      q.after(840, () => {
        q.send("qshake", 2000);
      });
    },
  },
};

/* adventure-script-maker
{"defId":18,"title":"The Great Escape","rooms":[{"key":"start","room":"adventures.room_adventure_5a","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_musspooky"},{"key":"inprison","room":"adventures.room_adventure_5b","name":"Adventure Tutorial","nameStringId":18326,"music":"","arrive":"inprison"},{"key":"endroom","room":"adventures.room_adventure_5a","name":"Adventure Tutorial","nameStringId":18326,"music":"","arrive":"endroom"}],"objective":3909,"actors":[{"name":"questready","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"start_init","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"players","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"00_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cosmo1","type":1,"def":25,"state":0,"visible":1,"click":1,"path":"","art":"appear"},{"name":"cosmo1hide","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cosmo2","type":1,"def":25,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"greely","type":1,"def":22,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"40_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"greelydelay","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"greelydelay2","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gifttimer","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"playgame","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"endpause","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"60_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"_stage","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"spawn1delay","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"10_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"notifyvol01","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"vol_dance","type":24,"def":20,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"vol_hop","type":24,"def":20,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"vol_play","type":24,"def":20,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"vol_hop2","type":24,"def":100,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"30_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom1a","type":11,"def":155,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom1b","type":11,"def":155,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom1c","type":11,"def":155,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom1d","type":11,"def":155,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom1e","type":11,"def":155,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom1f","type":11,"def":155,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom1g","type":11,"def":155,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom1h","type":11,"def":155,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom1i","type":11,"def":155,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom2a","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path2a","art":""},{"name":"phantom2b","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path2b","art":""},{"name":"phantom2c","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path2c","art":""},{"name":"phantom3a","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path3a","art":""},{"name":"phantom3b","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path3b","art":""},{"name":"phantom3c","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path3c","art":""},{"name":"phantom4a","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path4a","art":""},{"name":"phantom4b","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path4b","art":""},{"name":"phantom4c","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path4c","art":""},{"name":"phantom5a","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path5a","art":""},{"name":"phantom5b","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path5b","art":""},{"name":"phantom5c","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path5c","art":""},{"name":"factory01","type":12,"def":156,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factory02","type":12,"def":156,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factory03","type":12,"def":156,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factory04","type":12,"def":156,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod01","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod02","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod03","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod04","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod05","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod06","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod07","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod08","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod09","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod10","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod11","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod12","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod13","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod14h","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod15h","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod16h","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod17h","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod18h","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod19h","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod20h","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod21h","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"toproom","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"path1a","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path1b","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path1c","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path1d","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path1e","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path1f","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path1g","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path1h","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path1i","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path2a","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path2b","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path2c","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path3a","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path3b","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path3c","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path4a","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path4b","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path4c","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path5a","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path5b","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path5c","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"prisonpath03","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"prisonpath04","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"prisonpath05","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"prisonpath06","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"prisonpath07","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"prisonpath08","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"toprison","type":3,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"inprison","type":9,"def":1,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"prisonfadein","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"endroom","type":9,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"opendoor01","type":1,"def":134,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"20_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"opendoor02","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"prisonvol01","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"prisonvol02","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"prisonvol03","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"prisonvol04","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"prisonvol05","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"prisonvol06","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"prisonvol07","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"prisonvol08","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"slidesound","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatarexit","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pris1wait","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pris3wait","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pris8wait","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pris2wait","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pris2state","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pris3state","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pris4state","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pris5state","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pris6state","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pris7state","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pris8state","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"prisoner01","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"prisoner02","type":1,"def":160,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"prisoner03","type":1,"def":161,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"prisoner04","type":1,"def":162,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"prisoner05","type":1,"def":163,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"prisoner06","type":1,"def":164,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"prisoner07","type":1,"def":159,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"prisoner08","type":1,"def":165,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lock03","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentryswitch","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentryswitc2","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentryswitc3","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentryswitc4","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lock04","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lock05","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lock06","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lock07","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"monkeychat","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"chattimer","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"chatvol_1","type":3,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz6col","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz8col","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz12col","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz16col","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz19dcol","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz9ecol","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz10gcol","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz10acol","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz17bcol","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol01","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol02","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol03","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol04","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol05","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol06","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol07","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol08","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol09","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol10","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol11","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol12","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol13","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol14","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol15","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol16","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol17","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockvol_end","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podcol01","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podcol02","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podcol03","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podcol04","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podcol05","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podcol06","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podcol07","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podcol08","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podcol09","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podcol10","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podcol11","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podcol12","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podcol13","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podcol14h","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podcol15h","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podcol16h","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podcol17h","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podcol18h","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podcol19h","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podcol20h","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podcol21h","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sencol01","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sencol02","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sencol03","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sencol04","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sencol05","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sencol06","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sencol07","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sencol08","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sencol09","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sencol11","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sencol12","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sencol13","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cellblock00","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cellblock01","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cellblock02","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cellblock03","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cellblock04","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cellblock05","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cellblock06","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cellblock07","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatarblock1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatarblock2","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"secretblock","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"stealthvol_1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"hardblock","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"hardavatar","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"hard","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"easy","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"rain01","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"alertbox","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"jumppad","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switchtile1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switchtile2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switchtile3","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switchtile4","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"passagdoor01","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"passagdoor02","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier01","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_brazier02","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_bridge01","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_bridge02","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"towerdoor01","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"towerdoor02","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"celldoor00","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"celldoor01","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"celldoor02","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"celldoor03","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"celldoor04","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"celldoor05","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"celldoor06","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"celldoor07","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatartile1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pillar1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatartile2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pillar2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"interactdoor","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"exitportal","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"startwater","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"passagdoor03","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"torch","type":17,"def":2045,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"torchlight","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pickup_torch","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"braziercount","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"brazier01","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier02","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lbrazier01","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lbrazier02","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry01","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry02","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry03","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry04","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry05","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry06","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry07","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry08","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry09","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry11","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry12","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry01h","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry02h","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry03h","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry04h","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry05h","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry06h","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry07h","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry08h","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry09h","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry11h","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry12h","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry13h","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry01lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry02lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry03lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry04lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry05lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry06lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry07lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry08lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry09lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry11lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry12lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry13lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trapcount","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"lock00","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lock02","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lock01","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lock08","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lock09","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludgerain","type":16,"def":"ajq_sludgerain_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludgerain2","type":16,"def":"ajq_sludgerain_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key00","type":15,"def":1912,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key01","type":15,"def":1912,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key02","type":15,"def":1912,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key03","type":15,"def":1912,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key04","type":15,"def":1912,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key05","type":15,"def":1912,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key06","type":15,"def":1912,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key07","type":15,"def":1912,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key08","type":15,"def":1912,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"key09","type":15,"def":1912,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"toproomvol","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"treasure01","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50,"chestKind":3},{"name":"treasure02","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":100,"chestKind":3},{"name":"treasure03","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":150,"chestKind":3},{"name":"treasure04","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":200,"chestKind":3},{"name":"treasure_a1","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"treasure_a2","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"avatar1","type":1,"def":47,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatar2","type":1,"def":66,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blocktimer1","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"blocktimer2","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"respawn0","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"respawn1","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"respawn2","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"respawn3","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"respawn4","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"respawn5","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile01","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile02","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile03","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile04","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile05h","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile06h","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile07h","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedcount","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile05","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile06","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile07","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_seedpile02","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_seedpile03","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_seedpile04","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_seedpile05","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_seedpile06","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"t_seedpile07","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seeddelay","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedmover","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedtimer05","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedtimer06","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedtimer07","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"70_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"exitvol","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"plantvol","type":22,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"portalsound","type":16,"def":"ajq_portalgatelp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"greelyvol","type":3,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz2vol","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lok8blokoff","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"lok9blokoff","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz6blokoff","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz7blokoff","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz8blokoff","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz9blokoff","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz10blokof1","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz10blokof2","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz6start","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz6a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz6end","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz6door","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz6frame_l","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz6frame_r","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz7start","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz7a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz7b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz7c","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz7end","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz7door","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz7frame_l","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz7frame_r","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz8start1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz8start2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz8a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz8b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz8c","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz8d","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz8end1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz8end2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz8door","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz8frame_l","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz8frame_r","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz9start","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz9a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz9b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz9c","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz9d","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz9e","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz9f","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz9g","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz9h","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz9i","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz9j","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz9end","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz9door","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz9frame_l","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz9frame_r","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz10start1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz10start2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz10a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz10b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz10c","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz10d","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz10e","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz10f","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz10g","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz10end1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz10end2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz10end3","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz10door1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz10door2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz10frame1l","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz10frame1r","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz10frame2l","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz10frame2r","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz12a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz13c","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz14a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz14b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz15start1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz15start2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz15a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz15b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz15c","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz15d","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz16start2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz16a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz17start","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz17a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz17b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz17c","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz17d","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz17e","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz18start","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz18a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz18b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz19a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz19b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz19c","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz19d","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz20a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz20b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz20c","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz6beam1","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz6beam2","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz7beam1","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz7beam2","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz7beam3","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz7beam4","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz8beam1","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz8beam2","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz8beam3","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz8beam4","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz8beam5","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz8beam6","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz9beam1","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz9beam2","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz9beam3","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz9beam4","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz9beam5","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz9beam6","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz9beam7","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz9beam8","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz9beam9","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz9beam10","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz9beam11","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz10beam1","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz10beam2","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz10beam3","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz10beam4","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz10beam5","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz10beam6","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz10beam7","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz10beam8","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz10beam9","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz10beam10","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz12beam1","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz12beam2","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz15beam1","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz15beam2","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz16beam1","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz16beam2","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz16beam3","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz17beam1","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz19beam1","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz19beam2","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz19beam3","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz19beam4","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz19beam5","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz20beam1","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz20beam2","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig6","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig7a","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig7b","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz8state","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig8a","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig8b","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig9a","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig9b","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig9c","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"boomrock10","type":11,"def":157,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig10a","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig10b","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig10c","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig12b","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig13a","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig13b","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig14a","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig14b","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig15a","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig15b","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig16a","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig16b","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig17a","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig17b","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig17c","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig18a","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig18b","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig18c","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"boomrock19","type":11,"def":157,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig19a","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig19b","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig19c","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"boomrock20","type":11,"def":157,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig20a","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig20b","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig20c","type":1,"def":154,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"initpuzzles","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"easypuzon","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"hardpuz1on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"hardpuz2on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cheatchq1","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cheatchq2","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"playermember","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""}],"steps":[{"id":196,"when":"loaded","name":"","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qsndpk","fields":"2507"}]},{"id":1,"when":"trigger","name":"questready","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"var","name":"start_init","value":1},{"a":"show","name":"startwater","click":0},{"a":"set","name":"exitportal","state":99,"visible":0,"click":0},{"a":"wait","ms":830},{"a":"set","name":"stealthvol_1","state":99,"visible":0,"click":0},{"a":"set","name":"t_bridge01","state":99,"visible":0,"click":0},{"a":"set","name":"t_bridge02","state":99,"visible":0,"click":0},{"a":"show","name":"rain01","click":0},{"a":"set","name":"sentry01h","state":99,"visible":0,"click":0},{"a":"set","name":"sentry02h","state":99,"visible":0,"click":0},{"a":"set","name":"sentry03h","state":99,"visible":0,"click":0},{"a":"set","name":"sentry04h","state":99,"visible":0,"click":0},{"a":"set","name":"sentry05h","state":99,"visible":0,"click":0},{"a":"set","name":"sentry06h","state":99,"visible":0,"click":0},{"a":"set","name":"sentry07h","state":99,"visible":0,"click":0},{"a":"set","name":"sentry08h","state":99,"visible":0,"click":0},{"a":"set","name":"sentry09h","state":99,"visible":0,"click":0},{"a":"set","name":"sentry11h","state":99,"visible":0,"click":0},{"a":"set","name":"sentry12h","state":99,"visible":0,"click":0},{"a":"set","name":"sentry13h","state":99,"visible":0,"click":0},{"a":"set","name":"sencol13","state":99,"visible":0,"click":0},{"a":"set","name":"sentry13lp","state":99,"visible":0,"click":0},{"a":"set","name":"pod14h","state":99,"visible":0,"click":0},{"a":"set","name":"pod15h","state":99,"visible":0,"click":0},{"a":"set","name":"pod16h","state":99,"visible":0,"click":0},{"a":"set","name":"pod17h","state":99,"visible":0,"click":0},{"a":"set","name":"pod18h","state":99,"visible":0,"click":0},{"a":"set","name":"pod19h","state":99,"visible":0,"click":0},{"a":"set","name":"pod20h","state":99,"visible":0,"click":0},{"a":"set","name":"podcol14h","state":99,"visible":0,"click":0},{"a":"set","name":"podcol15h","state":99,"visible":0,"click":0},{"a":"set","name":"podcol16h","state":99,"visible":0,"click":0},{"a":"set","name":"podcol17h","state":99,"visible":0,"click":0},{"a":"set","name":"podcol18h","state":99,"visible":0,"click":0},{"a":"set","name":"podcol19h","state":99,"visible":0,"click":0},{"a":"set","name":"podcol20h","state":99,"visible":0,"click":0},{"a":"set","name":"phantom4a","state":99,"visible":0,"click":0},{"a":"set","name":"phantom4b","state":99,"visible":0,"click":0},{"a":"set","name":"phantom4c","state":99,"visible":0,"click":0},{"a":"set","name":"phantom5a","state":99,"visible":0,"click":0},{"a":"set","name":"phantom5b","state":99,"visible":0,"click":0},{"a":"set","name":"phantom5c","state":99,"visible":0,"click":0},{"a":"set","name":"seedpile05h","state":99,"visible":0,"click":0},{"a":"set","name":"seedpile06h","state":99,"visible":0,"click":0},{"a":"show","name":"easy","click":0},{"a":"set","name":"avatar2","state":99,"visible":0,"click":0},{"a":"set","name":"treasure_a2","state":99,"visible":0,"click":0},{"a":"set","name":"avatartile2","state":99,"visible":0,"click":0},{"a":"set","name":"passagdoor03","state":99,"visible":0,"click":0},{"a":"show","name":"t_seedpile05","click":0},{"a":"show","name":"t_seedpile06","click":0},{"a":"show","name":"t_seedpile07","click":0},{"a":"set","name":"seedpile05","state":99,"visible":0,"click":0},{"a":"set","name":"seedpile06","state":99,"visible":0,"click":0},{"a":"set","name":"seedpile07","state":99,"visible":0,"click":0}]},{"id":2,"when":"trigger","name":"questready","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"set","name":"exitportal","state":0,"visible":1,"click":0},{"a":"set","name":"phantom1a","state":99,"visible":0,"click":0},{"a":"set","name":"phantom1b","state":99,"visible":0,"click":0},{"a":"set","name":"phantom1c","state":99,"visible":0,"click":0},{"a":"set","name":"phantom1d","state":99,"visible":0,"click":0},{"a":"set","name":"phantom1e","state":99,"visible":0,"click":0},{"a":"set","name":"phantom1f","state":99,"visible":0,"click":0},{"a":"set","name":"phantom1g","state":99,"visible":0,"click":0},{"a":"set","name":"phantom1h","state":99,"visible":0,"click":0},{"a":"set","name":"phantom1i","state":99,"visible":0,"click":0},{"a":"set","name":"alertbox","state":99,"visible":0,"click":0},{"a":"send","cmd":"qmusic","fields":"0"},{"a":"send","cmd":"qmusic","fields":"ajq_musdungeon"},{"a":"goal","str":3931}]},{"id":3,"when":"trigger","name":"questready","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"set","name":"sludgerain","state":0,"visible":1,"click":0},{"a":"send","cmd":"qmusic","fields":"ajq_musspooky"},{"a":"wait","ms":2000},{"a":"appear","name":"cosmo2","face":""},{"a":"var","name":"60_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure5-thegreatescape/#60-parachutedownthetower/#0#001"},{"a":"var","name":"60_uri","value":99},{"a":"goal","str":3909}]},{"id":4,"when":"trigger","name":"cosmo1","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qicon","fields":"cosmo1|1"},{"a":"talk","name":"cosmo1","str":3886,"mode":0}]},{"id":5,"when":"answer","name":"cosmo1","once":true,"holding":"","nth":0,"actions":[{"a":"var","name":"00_uri","value":1},{"a":"var","name":"players","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure5-thegreatescape/#00-start/#0#001"},{"a":"var","name":"00_uri","value":99},{"a":"show","name":"vol_dance","click":1},{"a":"show","name":"vol_play","click":1},{"a":"show","name":"vol_hop","click":1},{"a":"goal","str":3911},{"a":"artstate","name":"cosmo1","state":"disappear"},{"a":"show","name":"cosmo1","click":1},{"a":"send","cmd":"qicon","fields":"cosmo1|0"},{"a":"set","name":"cosmo1","state":2,"visible":1,"click":0},{"a":"wait","ms":1160},{"a":"set","name":"cosmo1","state":99,"visible":0,"click":0}]},{"id":6,"when":"trigger","name":"vol_dance","once":true,"holding":"","nth":0,"actions":[{"a":"wait","ms":1140},{"a":"xp","amount":5,"name":"vol_dance"},{"a":"set","name":"vol_dance","state":2,"visible":1,"click":0},{"a":"var","name":"_stage","value":"{count}"}]},{"id":7,"when":"trigger","name":"vol_hop","once":true,"holding":"","nth":0,"actions":[{"a":"wait","ms":1330},{"a":"xp","amount":5,"name":"vol_hop"},{"a":"set","name":"vol_hop","state":2,"visible":1,"click":0},{"a":"var","name":"_stage","value":"{count}"}]},{"id":8,"when":"trigger","name":"vol_play","once":true,"holding":"","nth":0,"actions":[{"a":"wait","ms":1160},{"a":"xp","amount":5,"name":"vol_play"},{"a":"set","name":"vol_play","state":2,"visible":1,"click":0},{"a":"var","name":"_stage","value":"{count}"},{"a":"wait","ms":1010},{"a":"wait","ms":1000},{"a":"wait","ms":3000},{"a":"wait","ms":2000}]},{"id":9,"when":"trigger","name":"toprison","once":false,"holding":"","nth":0,"actions":[{"a":"room","key":"inprison","spawn":"inprison"}]},{"id":10,"when":"trigger","name":"prisonvol01","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"say","name":"prisoner01","str":3938,"flag":1},{"a":"show","name":"opendoor01","click":1},{"a":"goal","str":3932},{"a":"show","name":"prisoner01","click":1},{"a":"set","name":"prisonvol01","state":99,"visible":0,"click":0},{"a":"wait","ms":14480},{"a":"var","name":"pris1wait","value":0},{"a":"set","name":"prisonvol01","state":0,"visible":1,"click":1}]},{"id":11,"when":"trigger","name":"prisonvol01","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"say","name":"prisoner01","str":3939,"flag":1},{"a":"set","name":"prisonvol01","state":99,"visible":0,"click":0},{"a":"wait","ms":14930},{"a":"var","name":"pris1wait","value":0},{"a":"set","name":"prisonvol01","state":0,"visible":1,"click":1}]},{"id":12,"when":"trigger","name":"prisonvol01","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"say","name":"prisoner01","str":3939,"flag":1},{"a":"set","name":"prisonvol01","state":99,"visible":0,"click":0}]},{"id":13,"when":"trigger","name":"prisonvol01","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"say","name":"prisoner01","str":3940,"flag":1},{"a":"set","name":"prisonvol01","state":99,"visible":0,"click":0},{"a":"wait","ms":910},{"a":"set","name":"puz13c","state":99,"visible":0,"click":0},{"a":"set","name":"puz14a","state":99,"visible":0,"click":0},{"a":"set","name":"puz14b","state":99,"visible":0,"click":0},{"a":"set","name":"puz15start1","state":99,"visible":0,"click":0},{"a":"set","name":"puz15start2","state":99,"visible":0,"click":0},{"a":"set","name":"puz15a","state":99,"visible":0,"click":0},{"a":"set","name":"puz15b","state":99,"visible":0,"click":0},{"a":"set","name":"puz15c","state":99,"visible":0,"click":0},{"a":"set","name":"puz15d","state":99,"visible":0,"click":0},{"a":"set","name":"puz16start2","state":99,"visible":0,"click":0},{"a":"set","name":"puz16a","state":99,"visible":0,"click":0},{"a":"set","name":"puz16beam1","state":99,"visible":0,"click":0},{"a":"set","name":"puz16beam2","state":99,"visible":0,"click":0},{"a":"set","name":"puz16beam3","state":99,"visible":0,"click":0},{"a":"set","name":"puz17start","state":99,"visible":0,"click":0},{"a":"set","name":"puz17a","state":99,"visible":0,"click":0},{"a":"set","name":"puz17b","state":99,"visible":0,"click":0},{"a":"set","name":"puz17c","state":99,"visible":0,"click":0},{"a":"set","name":"puz17d","state":99,"visible":0,"click":0},{"a":"set","name":"puz17e","state":99,"visible":0,"click":0},{"a":"set","name":"puz17beam1","state":99,"visible":0,"click":0},{"a":"set","name":"puz18start","state":99,"visible":0,"click":0},{"a":"set","name":"puz18a","state":99,"visible":0,"click":0},{"a":"set","name":"puz18b","state":99,"visible":0,"click":0},{"a":"set","name":"puz19a","state":99,"visible":0,"click":0},{"a":"set","name":"puz19b","state":99,"visible":0,"click":0},{"a":"set","name":"puz19c","state":99,"visible":0,"click":0},{"a":"set","name":"puz19d","state":99,"visible":0,"click":0},{"a":"set","name":"puz19beam1","state":99,"visible":0,"click":0},{"a":"set","name":"puz19beam2","state":99,"visible":0,"click":0},{"a":"set","name":"puz19beam3","state":99,"visible":0,"click":0},{"a":"set","name":"puz19beam4","state":99,"visible":0,"click":0},{"a":"set","name":"puz19beam5","state":99,"visible":0,"click":0},{"a":"set","name":"boomrock19","state":99,"visible":0,"click":0},{"a":"wait","ms":1010},{"a":"set","name":"puz20a","state":99,"visible":0,"click":0},{"a":"set","name":"puz20b","state":99,"visible":0,"click":0},{"a":"set","name":"puz20c","state":99,"visible":0,"click":0},{"a":"set","name":"puz20beam1","state":99,"visible":0,"click":0},{"a":"set","name":"puz20beam2","state":99,"visible":0,"click":0},{"a":"set","name":"boomrock20","state":99,"visible":0,"click":0},{"a":"wait","ms":990},{"a":"set","name":"puz12col","state":99,"visible":0,"click":0},{"a":"set","name":"puz16col","state":99,"visible":0,"click":0},{"a":"set","name":"puz19dcol","state":99,"visible":0,"click":0},{"a":"set","name":"trig6","state":0,"visible":1,"click":1},{"a":"set","name":"puz6start","state":5,"visible":1,"click":0},{"a":"set","name":"puz6a","state":7,"visible":1,"click":0},{"a":"set","name":"puz6beam1","state":35,"visible":1,"click":0},{"a":"set","name":"trig7a","state":0,"visible":1,"click":1},{"a":"set","name":"trig7b","state":0,"visible":1,"click":1},{"a":"set","name":"puz7start","state":7,"visible":1,"click":0},{"a":"set","name":"puz7a","state":5,"visible":1,"click":0},{"a":"show","name":"puz7b","click":0},{"a":"show","name":"puz7c","click":0},{"a":"set","name":"puz7c","state":0,"visible":1,"click":0},{"a":"set","name":"puz7beam1","state":200,"visible":1,"click":0},{"a":"set","name":"puz7beam2","state":300,"visible":1,"click":0},{"a":"set","name":"trig8a","state":0,"visible":1,"click":1},{"a":"set","name":"trig8b","state":0,"visible":1,"click":1},{"a":"set","name":"puz8start1","state":5,"visible":1,"click":0},{"a":"set","name":"puz8start2","state":4,"visible":1,"click":0},{"a":"set","name":"puz8a","state":6,"visible":1,"click":0},{"a":"set","name":"puz8b","state":2,"visible":1,"click":0},{"a":"set","name":"puz8c","state":6,"visible":1,"click":0},{"a":"set","name":"puz8d","state":4,"visible":1,"click":0},{"a":"set","name":"puz8beam1","state":35,"visible":1,"click":0},{"a":"set","name":"puz8beam2","state":60,"visible":1,"click":0},{"a":"set","name":"puz8beam4","state":35,"visible":1,"click":0},{"a":"set","name":"trig9a","state":0,"visible":1,"click":1},{"a":"set","name":"trig9b","state":0,"visible":1,"click":1},{"a":"set","name":"trig9c","state":0,"visible":1,"click":1},{"a":"set","name":"puz9start","state":4,"visible":1,"click":0},{"a":"set","name":"puz9a","state":5,"visible":1,"click":0},{"a":"set","name":"puz9b","state":7,"visible":1,"click":0},{"a":"set","name":"puz9c","state":6,"visible":1,"click":0},{"a":"set","name":"puz9d","state":2,"visible":1,"click":0},{"a":"show","name":"puz9e","click":0},{"a":"set","name":"puz9e","state":0,"visible":1,"click":0},{"a":"set","name":"puz9f","state":2,"visible":1,"click":0},{"a":"set","name":"puz9g","state":3,"visible":1,"click":0},{"a":"set","name":"puz9h","state":2,"visible":1,"click":0},{"a":"show","name":"puz9i","click":0},{"a":"set","name":"puz9i","state":0,"visible":1,"click":0},{"a":"show","name":"puz9j","click":0},{"a":"set","name":"puz9j","state":0,"visible":1,"click":0},{"a":"set","name":"puz9beam1","state":15,"visible":1,"click":0},{"a":"set","name":"puz9beam2","state":15,"visible":1,"click":0},{"a":"set","name":"puz9beam3","state":10,"visible":1,"click":0},{"a":"set","name":"trig10a","state":0,"visible":1,"click":1},{"a":"set","name":"trig10b","state":0,"visible":1,"click":1},{"a":"set","name":"trig10c","state":0,"visible":1,"click":1},{"a":"set","name":"puz10start1","state":4,"visible":1,"click":0},{"a":"show","name":"puz10start2","click":0},{"a":"set","name":"puz10a","state":2,"visible":1,"click":0},{"a":"set","name":"puz10b","state":3,"visible":1,"click":0},{"a":"set","name":"puz10c","state":3,"visible":1,"click":0},{"a":"set","name":"puz10d","state":3,"visible":1,"click":0},{"a":"show","name":"puz10e","click":0},{"a":"set","name":"puz10f","state":3,"visible":1,"click":0},{"a":"show","name":"puz10g","click":0},{"a":"set","name":"boomrock10","state":0,"visible":1,"click":1}]},{"id":14,"when":"trigger","name":"prisonvol01","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"say","name":"prisoner01","str":3940,"flag":1},{"a":"set","name":"prisonvol01","state":99,"visible":0,"click":0},{"a":"wait","ms":15000},{"a":"var","name":"pris1wait","value":0},{"a":"set","name":"prisonvol01","state":0,"visible":1,"click":1}]},{"id":15,"when":"trigger","name":"prisonvol01","once":false,"holding":"","nth":6,"nthOn":false,"actions":[{"a":"set","name":"prisonvol01","state":99,"visible":0,"click":0},{"a":"wait","ms":14910},{"a":"var","name":"pris1wait","value":0},{"a":"set","name":"prisonvol01","state":0,"visible":1,"click":1},{"a":"wait","ms":29250},{"a":"var","name":"pris3wait","value":0},{"a":"set","name":"prisonvol03","state":0,"visible":1,"click":1},{"a":"wait","ms":8010},{"a":"var","name":"pris8wait","value":0},{"a":"set","name":"prisonvol08","state":0,"visible":1,"click":1},{"a":"wait","ms":11010},{"a":"var","name":"pris3wait","value":0},{"a":"set","name":"prisonvol03","state":0,"visible":1,"click":1}]},{"id":16,"when":"trigger","name":"opendoor01","once":true,"holding":"","nth":0,"actions":[{"a":"var","name":"20_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure5-thegreatescape/#20-escapethecell/#0#001"},{"a":"var","name":"20_uri","value":99},{"a":"goal","str":3933},{"a":"sound","sound":"ajq_mussecretareast"},{"a":"xp","amount":5,"name":"opendoor01"},{"a":"show","name":"passagdoor01","click":0},{"a":"set","name":"blockvol01","state":99,"visible":0,"click":0},{"a":"set","name":"prisoner01","state":2,"visible":1,"click":1},{"a":"say","name":"prisoner01","str":3940,"flag":1},{"a":"send","cmd":"qtorch","fields":"0|1|torchlight"},{"a":"set","name":"opendoor01","state":99,"visible":0,"click":0},{"a":"wait","ms":310},{"a":"set","name":"trig6","state":99,"visible":0,"click":0},{"a":"set","name":"trig7a","state":99,"visible":0,"click":0},{"a":"set","name":"trig7b","state":99,"visible":0,"click":0},{"a":"set","name":"trig8a","state":99,"visible":0,"click":0},{"a":"set","name":"trig8b","state":99,"visible":0,"click":0},{"a":"set","name":"trig9a","state":99,"visible":0,"click":0},{"a":"set","name":"trig9b","state":99,"visible":0,"click":0},{"a":"set","name":"trig9c","state":99,"visible":0,"click":0},{"a":"set","name":"trig10a","state":99,"visible":0,"click":0},{"a":"set","name":"trig10b","state":99,"visible":0,"click":0},{"a":"set","name":"trig10c","state":99,"visible":0,"click":0},{"a":"set","name":"trig12b","state":99,"visible":0,"click":0},{"a":"set","name":"trig13a","state":99,"visible":0,"click":0},{"a":"set","name":"trig13b","state":99,"visible":0,"click":0},{"a":"set","name":"trig14a","state":99,"visible":0,"click":0},{"a":"set","name":"trig14b","state":99,"visible":0,"click":0},{"a":"set","name":"trig15a","state":99,"visible":0,"click":0},{"a":"set","name":"trig15b","state":99,"visible":0,"click":0},{"a":"set","name":"trig16a","state":99,"visible":0,"click":0},{"a":"set","name":"trig16b","state":99,"visible":0,"click":0},{"a":"set","name":"trig17a","state":99,"visible":0,"click":0},{"a":"set","name":"trig17b","state":99,"visible":0,"click":0},{"a":"set","name":"trig17c","state":99,"visible":0,"click":0},{"a":"set","name":"trig18a","state":99,"visible":0,"click":0},{"a":"set","name":"trig18b","state":99,"visible":0,"click":0},{"a":"set","name":"trig18c","state":99,"visible":0,"click":0},{"a":"set","name":"trig19a","state":99,"visible":0,"click":0},{"a":"set","name":"trig19b","state":99,"visible":0,"click":0},{"a":"set","name":"trig19c","state":99,"visible":0,"click":0},{"a":"set","name":"trig20a","state":99,"visible":0,"click":0},{"a":"set","name":"trig20b","state":99,"visible":0,"click":0},{"a":"set","name":"trig20c","state":99,"visible":0,"click":0},{"a":"wait","ms":1160},{"a":"set","name":"puz6start","state":99,"visible":0,"click":0},{"a":"set","name":"puz6a","state":99,"visible":0,"click":0},{"a":"set","name":"puz6beam1","state":99,"visible":0,"click":0},{"a":"set","name":"puz6beam2","state":99,"visible":0,"click":0},{"a":"set","name":"puz7start","state":99,"visible":0,"click":0},{"a":"set","name":"puz7a","state":99,"visible":0,"click":0},{"a":"set","name":"puz7b","state":99,"visible":0,"click":0},{"a":"set","name":"puz7c","state":99,"visible":0,"click":0},{"a":"set","name":"puz7beam1","state":99,"visible":0,"click":0},{"a":"set","name":"puz7beam2","state":99,"visible":0,"click":0},{"a":"set","name":"puz7beam3","state":99,"visible":0,"click":0},{"a":"set","name":"puz7beam4","state":99,"visible":0,"click":0},{"a":"set","name":"puz8start1","state":99,"visible":0,"click":0},{"a":"set","name":"puz8start2","state":99,"visible":0,"click":0},{"a":"set","name":"puz8a","state":99,"visible":0,"click":0},{"a":"set","name":"puz8b","state":99,"visible":0,"click":0},{"a":"set","name":"puz8c","state":99,"visible":0,"click":0},{"a":"set","name":"puz8d","state":99,"visible":0,"click":0},{"a":"set","name":"puz8beam1","state":99,"visible":0,"click":0},{"a":"set","name":"puz8beam2","state":99,"visible":0,"click":0},{"a":"set","name":"puz8beam3","state":99,"visible":0,"click":0},{"a":"set","name":"puz8beam4","state":99,"visible":0,"click":0},{"a":"set","name":"puz8beam5","state":99,"visible":0,"click":0},{"a":"set","name":"puz8beam6","state":99,"visible":0,"click":0},{"a":"wait","ms":870},{"a":"set","name":"puz9start","state":99,"visible":0,"click":0},{"a":"set","name":"puz9a","state":99,"visible":0,"click":0},{"a":"set","name":"puz9b","state":99,"visible":0,"click":0},{"a":"set","name":"puz9c","state":99,"visible":0,"click":0},{"a":"set","name":"puz9d","state":99,"visible":0,"click":0},{"a":"set","name":"puz9e","state":99,"visible":0,"click":0},{"a":"set","name":"puz9f","state":99,"visible":0,"click":0},{"a":"set","name":"puz9g","state":99,"visible":0,"click":0},{"a":"set","name":"puz9h","state":99,"visible":0,"click":0},{"a":"set","name":"puz9i","state":99,"visible":0,"click":0},{"a":"set","name":"puz9j","state":99,"visible":0,"click":0},{"a":"set","name":"puz9beam1","state":99,"visible":0,"click":0},{"a":"set","name":"puz9beam2","state":99,"visible":0,"click":0},{"a":"set","name":"puz9beam3","state":99,"visible":0,"click":0},{"a":"set","name":"puz9beam4","state":99,"visible":0,"click":0},{"a":"set","name":"puz9beam5","state":99,"visible":0,"click":0},{"a":"set","name":"puz9beam6","state":99,"visible":0,"click":0},{"a":"set","name":"puz9beam7","state":99,"visible":0,"click":0},{"a":"set","name":"puz9beam8","state":99,"visible":0,"click":0},{"a":"set","name":"puz9beam9","state":99,"visible":0,"click":0},{"a":"set","name":"puz9beam10","state":99,"visible":0,"click":0},{"a":"set","name":"puz9beam11","state":99,"visible":0,"click":0},{"a":"wait","ms":840},{"a":"var","name":"pris1wait","value":0},{"a":"set","name":"prisonvol01","state":0,"visible":1,"click":1},{"a":"set","name":"puz10start1","state":99,"visible":0,"click":0},{"a":"set","name":"puz10start2","state":99,"visible":0,"click":0},{"a":"set","name":"puz10a","state":99,"visible":0,"click":0},{"a":"set","name":"puz10b","state":99,"visible":0,"click":0},{"a":"set","name":"puz10c","state":99,"visible":0,"click":0},{"a":"set","name":"puz10d","state":99,"visible":0,"click":0},{"a":"set","name":"puz10e","state":99,"visible":0,"click":0},{"a":"set","name":"puz10f","state":99,"visible":0,"click":0},{"a":"set","name":"puz10g","state":99,"visible":0,"click":0},{"a":"set","name":"puz10beam1","state":99,"visible":0,"click":0},{"a":"set","name":"puz10beam2","state":99,"visible":0,"click":0},{"a":"set","name":"puz10beam3","state":99,"visible":0,"click":0},{"a":"set","name":"puz10beam4","state":99,"visible":0,"click":0},{"a":"set","name":"puz10beam5","state":99,"visible":0,"click":0},{"a":"set","name":"puz10beam6","state":99,"visible":0,"click":0},{"a":"set","name":"puz10beam7","state":99,"visible":0,"click":0},{"a":"set","name":"puz10beam8","state":99,"visible":0,"click":0},{"a":"set","name":"puz10beam9","state":99,"visible":0,"click":0},{"a":"set","name":"puz10beam10","state":99,"visible":0,"click":0},{"a":"set","name":"boomrock10","state":99,"visible":0,"click":0},{"a":"set","name":"puz12a","state":99,"visible":0,"click":0},{"a":"set","name":"puz12beam1","state":99,"visible":0,"click":0},{"a":"set","name":"puz12beam2","state":99,"visible":0,"click":0},{"a":"wait","ms":15020},{"a":"var","name":"pris1wait","value":0},{"a":"set","name":"prisonvol01","state":0,"visible":1,"click":1},{"a":"wait","ms":32030},{"a":"set","name":"prisoner02","state":2,"visible":1,"click":1},{"a":"var","name":"pris2wait","value":0}]},{"id":17,"when":"trigger","name":"pickup_torch","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qgi","fields":"torch"}]},{"id":18,"when":"trigger","name":"brazier01","once":true,"holding":"","nth":0,"actions":[{"a":"var","name":"braziercount","value":"{count}"},{"a":"show","name":"t_brazier01","click":0},{"a":"show","name":"t_bridge01","click":0},{"a":"send","cmd":"qtorch","fields":"0|1|t_bridge01"},{"a":"set","name":"lbrazier01","state":99,"visible":0,"click":0},{"a":"set","name":"lbrazier01","state":0,"visible":1,"click":0},{"a":"send","cmd":"qtorch","fields":"0|1|lbrazier01"},{"a":"set","name":"blockvol02","state":99,"visible":0,"click":0},{"a":"xp","amount":5,"name":"brazier01"},{"a":"show","name":"brazier01","click":0}]},{"id":19,"when":"trigger","name":"lbrazier02","once":false,"holding":"","nth":0,"actions":[{"a":"set","name":"lbrazier02","state":99,"visible":0,"click":0},{"a":"set","name":"lbrazier02","state":0,"visible":1,"click":0},{"a":"send","cmd":"qtorch","fields":"0|1|lbrazier02"},{"a":"set","name":"blockvol03","state":99,"visible":0,"click":0}]},{"id":20,"when":"trigger","name":"brazier02","once":true,"holding":"torch","nth":0,"actions":[{"a":"var","name":"braziercount","value":"{count}"},{"a":"use"},{"a":"set","name":"torch","state":99,"visible":0,"click":0},{"a":"set","name":"pickup_torch","state":99,"visible":0,"click":0},{"a":"show","name":"t_brazier02","click":0},{"a":"show","name":"t_bridge02","click":0},{"a":"send","cmd":"qtorch","fields":"0|1|t_bridge02"},{"a":"xp","amount":5,"name":"brazier02"},{"a":"show","name":"brazier02","click":0}]},{"id":21,"when":"trigger","name":"prisonvol02","once":true,"holding":"","nth":0,"actions":[{"a":"var","name":"pris2state","value":"{count}"},{"a":"show","name":"prisoner02","click":1},{"a":"say","name":"prisoner02","str":3941,"flag":1},{"a":"set","name":"prisoner02","state":0,"visible":1,"click":0},{"a":"set","name":"prisonvol02","state":99,"visible":0,"click":0}]},{"id":22,"when":"trigger","name":"prisoner02","once":false,"holding":"","nth":0,"actions":[{"a":"sayStage","name":"prisoner02","table":{"10645":3953},"dflt":3942,"flag":1}]},{"id":23,"when":"trigger","name":"puz2vol","once":false,"holding":"","nth":0,"actions":[{"a":"goal","str":3934},{"a":"set","name":"puz2vol","state":99,"visible":0,"click":0}]},{"id":24,"when":"trigger","name":"lock00","once":false,"holding":"","nth":0,"actions":[{"a":"say","name":"lock00","str":10669,"flag":0}],"unless":"key06"},{"id":25,"when":"trigger","name":"prisonvol03","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"show","name":"prisoner03","click":1},{"a":"var","name":"pris3state","value":"{count}"},{"a":"say","name":"prisoner03","str":10663,"flag":1},{"a":"set","name":"prisoner03","state":0,"visible":1,"click":0},{"a":"set","name":"prisonvol03","state":99,"visible":0,"click":0}]},{"id":26,"when":"trigger","name":"prisonvol03","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"set","name":"prisoner03","state":2,"visible":1,"click":1},{"a":"say","name":"prisoner03","str":3954,"flag":1},{"a":"set","name":"prisoner03","state":0,"visible":1,"click":0},{"a":"set","name":"prisonvol03","state":99,"visible":0,"click":0}]},{"id":27,"when":"trigger","name":"prisonvol03","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"set","name":"prisoner03","state":2,"visible":1,"click":1},{"a":"say","name":"prisoner03","str":3954,"flag":1},{"a":"set","name":"prisoner03","state":0,"visible":1,"click":0},{"a":"set","name":"prisonvol03","state":99,"visible":0,"click":0}]},{"id":28,"when":"trigger","name":"prisonvol03","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"set","name":"prisoner03","state":3,"visible":1,"click":1},{"a":"say","name":"prisoner03","str":10706,"flag":1},{"a":"set","name":"prisoner03","state":0,"visible":1,"click":0},{"a":"set","name":"prisonvol03","state":99,"visible":0,"click":0}]},{"id":29,"when":"trigger","name":"prisonvol03","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"set","name":"prisoner03","state":3,"visible":1,"click":1},{"a":"say","name":"prisoner03","str":10706,"flag":1},{"a":"set","name":"prisoner03","state":0,"visible":1,"click":0},{"a":"set","name":"prisonvol03","state":99,"visible":0,"click":0}]},{"id":30,"when":"trigger","name":"prisonvol03","once":false,"holding":"","nth":6,"nthOn":true,"actions":[{"a":"set","name":"prisoner03","state":3,"visible":1,"click":1},{"a":"say","name":"prisoner03","str":10706,"flag":1},{"a":"set","name":"prisoner03","state":0,"visible":1,"click":0},{"a":"set","name":"prisonvol03","state":99,"visible":0,"click":0}]},{"id":31,"when":"trigger","name":"prisonvol08","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"show","name":"prisoner08","click":1},{"a":"var","name":"pris8state","value":"{count}"},{"a":"say","name":"prisoner08","str":3936,"flag":1},{"a":"set","name":"prisoner08","state":0,"visible":1,"click":0},{"a":"set","name":"prisonvol08","state":99,"visible":0,"click":0}]},{"id":32,"when":"trigger","name":"prisonvol08","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"set","name":"prisoner08","state":2,"visible":1,"click":1},{"a":"say","name":"prisoner08","str":10721,"flag":1},{"a":"set","name":"prisoner08","state":0,"visible":1,"click":0},{"a":"set","name":"prisonvol08","state":99,"visible":0,"click":0}]},{"id":33,"when":"trigger","name":"prisonvol08","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"set","name":"prisoner08","state":2,"visible":1,"click":1},{"a":"say","name":"prisoner08","str":10721,"flag":1},{"a":"set","name":"prisoner08","state":0,"visible":1,"click":0},{"a":"set","name":"prisonvol08","state":99,"visible":0,"click":0}]},{"id":34,"when":"trigger","name":"prisonvol08","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"set","name":"prisoner08","state":3,"visible":1,"click":1},{"a":"say","name":"prisoner08","str":10712,"flag":1},{"a":"set","name":"prisoner08","state":0,"visible":1,"click":0},{"a":"set","name":"prisonvol08","state":99,"visible":0,"click":0}]},{"id":35,"when":"trigger","name":"prisonvol08","once":false,"holding":"","nth":5,"nthOn":true,"actions":[{"a":"set","name":"prisoner08","state":3,"visible":1,"click":1},{"a":"say","name":"prisoner08","str":10712,"flag":1},{"a":"set","name":"prisoner08","state":0,"visible":1,"click":0},{"a":"set","name":"prisonvol08","state":99,"visible":0,"click":0}]},{"id":36,"when":"trigger","name":"lock03","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"var","name":"pris3wait","value":0},{"a":"set","name":"prisonvol03","state":0,"visible":1,"click":1},{"a":"say","name":"lock03","str":10669,"flag":0},{"a":"say","name":"lock03","str":10669,"flag":0},{"a":"say","name":"lock03","str":10669,"flag":0},{"a":"wait","ms":2780},{"a":"var","name":"pris8wait","value":0},{"a":"set","name":"prisonvol08","state":0,"visible":1,"click":1},{"a":"wait","ms":12010},{"a":"var","name":"pris3wait","value":0},{"a":"set","name":"prisonvol03","state":0,"visible":1,"click":1},{"a":"wait","ms":3000},{"a":"var","name":"pris8wait","value":0},{"a":"set","name":"prisonvol08","state":0,"visible":1,"click":1}],"unless":"key04"},{"id":37,"when":"trigger","name":"prisonvol07","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"show","name":"prisoner07","click":1},{"a":"say","name":"prisoner07","str":10660,"flag":1},{"a":"set","name":"prisoner07","state":0,"visible":1,"click":0}]},{"id":38,"when":"trigger","name":"prisonvol07","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"set","name":"prisoner07","state":2,"visible":1,"click":1},{"a":"say","name":"prisoner07","str":10711,"flag":1},{"a":"set","name":"prisoner07","state":0,"visible":1,"click":0}]},{"id":39,"when":"trigger","name":"prisonvol07","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"set","name":"prisoner07","state":2,"visible":1,"click":1},{"a":"say","name":"prisoner07","str":10711,"flag":1},{"a":"set","name":"prisoner07","state":0,"visible":1,"click":0}]},{"id":40,"when":"trigger","name":"prisonvol07","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"set","name":"prisoner07","state":2,"visible":1,"click":1},{"a":"say","name":"prisoner07","str":10711,"flag":1},{"a":"set","name":"prisoner07","state":0,"visible":1,"click":0}]},{"id":41,"when":"trigger","name":"prisonvol07","once":false,"holding":"","nth":5,"nthOn":true,"actions":[{"a":"set","name":"prisoner07","state":2,"visible":1,"click":1},{"a":"say","name":"prisoner07","str":10711,"flag":1},{"a":"set","name":"prisoner07","state":0,"visible":1,"click":0}]},{"id":42,"when":"trigger","name":"lock07","once":true,"holding":"key03","nth":0,"actions":[{"a":"use"},{"a":"var","name":"trapcount","value":"{count}"},{"a":"set","name":"cellblock07","state":99,"visible":0,"click":0},{"a":"xp","amount":10,"name":"lock07"},{"a":"set","name":"prisoner07","state":2,"visible":1,"click":1},{"a":"set","name":"prisoner07","state":0,"visible":1,"click":0},{"a":"set","name":"lock07","state":99,"visible":0,"click":0}]},{"id":43,"when":"trigger","name":"prisonvol05","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"show","name":"prisoner05","click":1},{"a":"say","name":"prisoner05","str":10642,"flag":1},{"a":"set","name":"prisoner05","state":0,"visible":1,"click":0}]},{"id":44,"when":"trigger","name":"prisonvol05","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"set","name":"prisoner05","state":2,"visible":1,"click":1},{"a":"say","name":"prisoner05","str":10709,"flag":1},{"a":"set","name":"prisoner05","state":0,"visible":1,"click":0}]},{"id":45,"when":"trigger","name":"prisonvol05","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"set","name":"prisoner05","state":2,"visible":1,"click":1},{"a":"say","name":"prisoner05","str":10709,"flag":1},{"a":"set","name":"prisoner05","state":0,"visible":1,"click":0}]},{"id":46,"when":"trigger","name":"prisonvol05","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"set","name":"prisoner05","state":2,"visible":1,"click":1},{"a":"say","name":"prisoner05","str":10709,"flag":1},{"a":"set","name":"prisoner05","state":0,"visible":1,"click":0}]},{"id":47,"when":"trigger","name":"prisonvol05","once":false,"holding":"","nth":5,"nthOn":true,"actions":[{"a":"set","name":"prisoner05","state":2,"visible":1,"click":1},{"a":"say","name":"prisoner05","str":10709,"flag":1},{"a":"set","name":"prisoner05","state":0,"visible":1,"click":0}]},{"id":48,"when":"trigger","name":"lock05","once":true,"holding":"key02","nth":0,"actions":[{"a":"use"},{"a":"var","name":"trapcount","value":"{count}"},{"a":"show","name":"celldoor05","click":0},{"a":"set","name":"cellblock05","state":99,"visible":0,"click":0},{"a":"xp","amount":10,"name":"lock05"},{"a":"set","name":"prisoner05","state":2,"visible":1,"click":1},{"a":"set","name":"prisoner05","state":0,"visible":1,"click":0},{"a":"set","name":"lock05","state":99,"visible":0,"click":0}]},{"id":49,"when":"trigger","name":"lock01","once":true,"holding":"key01","nth":0,"actions":[{"a":"use"},{"a":"show","name":"celldoor07","click":0},{"a":"set","name":"cellblock01","state":99,"visible":0,"click":0},{"a":"xp","amount":10,"name":"lock01"},{"a":"hide","name":"lock01"}]},{"id":50,"when":"opened","name":"treasure03","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"treasure03"}]},{"id":51,"when":"trigger","name":"prisonvol06","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"show","name":"prisoner06","click":1},{"a":"say","name":"prisoner06","str":10657,"flag":1},{"a":"set","name":"prisoner06","state":0,"visible":1,"click":0}]},{"id":52,"when":"trigger","name":"prisonvol06","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"set","name":"prisoner06","state":2,"visible":1,"click":1},{"a":"say","name":"prisoner06","str":10710,"flag":1},{"a":"set","name":"prisoner06","state":0,"visible":1,"click":0}]},{"id":53,"when":"trigger","name":"prisonvol06","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"set","name":"prisoner06","state":2,"visible":1,"click":1},{"a":"say","name":"prisoner06","str":10710,"flag":1},{"a":"set","name":"prisoner06","state":0,"visible":1,"click":0}]},{"id":54,"when":"trigger","name":"prisonvol06","once":false,"holding":"","nth":4,"nthOn":true,"actions":[{"a":"set","name":"prisoner06","state":2,"visible":1,"click":1},{"a":"say","name":"prisoner06","str":10710,"flag":1},{"a":"set","name":"prisoner06","state":0,"visible":1,"click":0}]},{"id":55,"when":"trigger","name":"lock06","once":true,"holding":"key07","nth":0,"actions":[{"a":"use"},{"a":"var","name":"trapcount","value":"{count}"},{"a":"show","name":"celldoor06","click":0},{"a":"set","name":"cellblock06","state":99,"visible":0,"click":0},{"a":"xp","amount":10,"name":"lock06"},{"a":"set","name":"prisoner06","state":2,"visible":1,"click":1},{"a":"set","name":"prisoner06","state":0,"visible":1,"click":0},{"a":"set","name":"lock06","state":99,"visible":0,"click":0}]},{"id":56,"when":"trigger","name":"lock03","once":true,"holding":"key04","nth":0,"actions":[{"a":"use"},{"a":"show","name":"celldoor03","click":0},{"a":"set","name":"cellblock03","state":99,"visible":0,"click":0},{"a":"var","name":"trapcount","value":"{count}"},{"a":"xp","amount":10,"name":"lock03"},{"a":"var","name":"pris3state","value":"{count}"},{"a":"set","name":"prisoner03","state":3,"visible":1,"click":1},{"a":"say","name":"prisoner03","str":10706,"flag":1},{"a":"set","name":"prisoner03","state":0,"visible":1,"click":0},{"a":"var","name":"pris8state","value":"{count}"},{"a":"set","name":"prisoner08","state":3,"visible":1,"click":1},{"a":"say","name":"prisoner08","str":10712,"flag":1},{"a":"set","name":"prisoner08","state":0,"visible":1,"click":0},{"a":"set","name":"lock03","state":99,"visible":0,"click":0},{"a":"wait","ms":12450},{"a":"var","name":"pris8wait","value":0},{"a":"set","name":"prisonvol08","state":0,"visible":1,"click":1},{"a":"wait","ms":1000},{"a":"var","name":"pris3wait","value":0},{"a":"set","name":"prisonvol03","state":0,"visible":1,"click":1},{"a":"wait","ms":38030},{"a":"var","name":"pris8wait","value":0},{"a":"set","name":"prisonvol08","state":0,"visible":1,"click":1},{"a":"wait","ms":22020},{"a":"var","name":"pris3wait","value":0},{"a":"set","name":"prisonvol03","state":0,"visible":1,"click":1}]},{"id":57,"when":"trigger","name":"lock02","once":true,"holding":"key05","nth":0,"actions":[{"a":"use"},{"a":"show","name":"celldoor02","click":0},{"a":"set","name":"cellblock02","state":99,"visible":0,"click":0},{"a":"xp","amount":10,"name":"lock02"},{"a":"hide","name":"lock02"}]},{"id":58,"when":"opened","name":"treasure01","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"treasure01"}]},{"id":59,"when":"trigger","name":"lock00","once":true,"holding":"key06","nth":0,"actions":[{"a":"use"},{"a":"show","name":"celldoor00","click":0},{"a":"set","name":"cellblock00","state":99,"visible":0,"click":0},{"a":"xp","amount":10,"name":"lock00"},{"a":"hide","name":"lock00"}]},{"id":60,"when":"opened","name":"treasure02","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"treasure02"}]},{"id":61,"when":"trigger","name":"opendoor02","once":true,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"opendoor02"},{"a":"show","name":"passagdoor02","click":0},{"a":"set","name":"secretblock","state":99,"visible":0,"click":0},{"a":"sound","sound":"ajq_mussecretareast"},{"a":"set","name":"opendoor02","state":99,"visible":0,"click":0}]},{"id":62,"when":"opened","name":"treasure04","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"treasure04"}]},{"id":63,"when":"trigger","name":"prisonvol04","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"show","name":"prisoner04","click":1},{"a":"say","name":"prisoner04","str":3961,"flag":1},{"a":"set","name":"prisoner04","state":0,"visible":1,"click":0}]},{"id":64,"when":"trigger","name":"prisonvol04","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"set","name":"prisoner04","state":2,"visible":1,"click":1},{"a":"say","name":"prisoner04","str":10708,"flag":1},{"a":"set","name":"prisoner04","state":0,"visible":1,"click":0}]},{"id":65,"when":"trigger","name":"prisonvol04","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"set","name":"prisoner04","state":2,"visible":1,"click":1},{"a":"say","name":"prisoner04","str":10708,"flag":1},{"a":"set","name":"prisoner04","state":0,"visible":1,"click":0}]},{"id":66,"when":"trigger","name":"prisonvol04","once":false,"holding":"","nth":4,"nthOn":true,"actions":[{"a":"set","name":"prisoner04","state":2,"visible":1,"click":1},{"a":"say","name":"prisoner04","str":10708,"flag":1},{"a":"set","name":"prisoner04","state":0,"visible":1,"click":0}]},{"id":67,"when":"trigger","name":"lock04","once":true,"holding":"key00","nth":0,"actions":[{"a":"use"},{"a":"var","name":"trapcount","value":"{count}"},{"a":"show","name":"celldoor04","click":0},{"a":"set","name":"cellblock04","state":99,"visible":0,"click":0},{"a":"xp","amount":10,"name":"lock04"},{"a":"set","name":"prisoner04","state":2,"visible":1,"click":1},{"a":"set","name":"prisoner04","state":0,"visible":1,"click":0},{"a":"set","name":"lock04","state":99,"visible":0,"click":0}]},{"id":68,"when":"trigger","name":"sentryswitch","once":true,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"sentryswitch"},{"a":"show","name":"switchtile1","click":0},{"a":"hide","name":"sentry01lp"},{"a":"hide","name":"sentry12lp"},{"a":"hide","name":"sentry02lp"},{"a":"hide","name":"sentry11lp"},{"a":"artstate","name":"sentry01","state":"turnoff"},{"a":"show","name":"sentry01","click":0},{"a":"artstate","name":"sentry12","state":"turnoff"},{"a":"show","name":"sentry12","click":0},{"a":"artstate","name":"sentry11","state":"turnoff"},{"a":"show","name":"sentry11","click":0},{"a":"artstate","name":"sentry02","state":"turnoff"},{"a":"show","name":"sentry02","click":0},{"a":"set","name":"prisoner03","state":4,"visible":1,"click":1},{"a":"say","name":"prisoner03","str":3955,"flag":1},{"a":"path","name":"prisoner03","path":"prisonpath03"},{"a":"set","name":"prisoner03","state":5,"visible":1,"click":1},{"a":"set","name":"prisoner08","state":4,"visible":1,"click":1},{"a":"say","name":"prisoner08","str":3937,"flag":1},{"a":"path","name":"prisoner08","path":"prisonpath08"},{"a":"set","name":"prisoner08","state":5,"visible":1,"click":1},{"a":"set","name":"prisonvol03","state":99,"visible":0,"click":0},{"a":"set","name":"prisonvol08","state":99,"visible":0,"click":0},{"a":"set","name":"prisoner04","state":3,"visible":1,"click":1},{"a":"say","name":"prisoner04","str":3989,"flag":1},{"a":"path","name":"prisoner04","path":"prisonpath04"},{"a":"set","name":"prisoner04","state":4,"visible":1,"click":1},{"a":"set","name":"prisonvol04","state":99,"visible":0,"click":0},{"a":"set","name":"prisoner05","state":3,"visible":1,"click":1},{"a":"say","name":"prisoner05","str":10643,"flag":1},{"a":"path","name":"prisoner05","path":"prisonpath05"},{"a":"set","name":"prisoner05","state":4,"visible":1,"click":1},{"a":"set","name":"prisonvol05","state":99,"visible":0,"click":0},{"a":"set","name":"prisoner06","state":3,"visible":1,"click":1},{"a":"say","name":"prisoner06","str":10658,"flag":1},{"a":"path","name":"prisoner06","path":"prisonpath06"},{"a":"set","name":"prisoner06","state":4,"visible":1,"click":1},{"a":"set","name":"prisonvol06","state":99,"visible":0,"click":0},{"a":"set","name":"prisoner07","state":3,"visible":1,"click":1},{"a":"say","name":"prisoner07","str":10661,"flag":1},{"a":"path","name":"prisoner07","path":"prisonpath07"},{"a":"set","name":"prisoner07","state":4,"visible":1,"click":1},{"a":"set","name":"prisonvol07","state":99,"visible":0,"click":0},{"a":"set","name":"sentryswitch","state":99,"visible":0,"click":0},{"a":"goal","str":10722}]},{"id":69,"when":"trigger","name":"prisoner06","once":true,"holding":"","nth":0,"actions":[{"a":"path","name":"prisoner06","path":""},{"a":"artstate","name":"prisoner06","state":"hop"},{"a":"set","name":"prisoner06","state":5,"visible":1,"click":1},{"a":"var","name":"monkeychat","value":"{count}"},{"a":"set","name":"prisoner06","state":0,"visible":1,"click":0}]},{"id":70,"when":"trigger","name":"prisoner04","once":true,"holding":"","nth":0,"actions":[{"a":"path","name":"prisoner04","path":""},{"a":"artstate","name":"prisoner04","state":"hop"},{"a":"set","name":"prisoner04","state":5,"visible":1,"click":1},{"a":"var","name":"monkeychat","value":"{count}"},{"a":"set","name":"prisoner04","state":0,"visible":1,"click":0}]},{"id":71,"when":"trigger","name":"prisoner03","once":false,"holding":"","nth":0,"actions":[{"a":"path","name":"prisoner03","path":""},{"a":"artstate","name":"prisoner03","state":"hop"},{"a":"set","name":"prisoner03","state":6,"visible":1,"click":1},{"a":"var","name":"monkeychat","value":"{count}"},{"a":"set","name":"prisoner03","state":0,"visible":1,"click":0},{"a":"wait","ms":7440},{"a":"set","name":"prisoner03","state":0,"visible":1,"click":0}]},{"id":72,"when":"trigger","name":"prisoner08","once":true,"holding":"","nth":0,"actions":[{"a":"path","name":"prisoner08","path":""},{"a":"artstate","name":"prisoner08","state":"hop"},{"a":"set","name":"prisoner08","state":6,"visible":1,"click":1},{"a":"var","name":"monkeychat","value":"{count}"},{"a":"set","name":"prisoner08","state":0,"visible":1,"click":0}]},{"id":73,"when":"trigger","name":"prisoner05","once":true,"holding":"","nth":0,"actions":[{"a":"path","name":"prisoner05","path":""},{"a":"artstate","name":"prisoner05","state":"hop"},{"a":"set","name":"prisoner05","state":5,"visible":1,"click":1},{"a":"var","name":"monkeychat","value":"{count}"},{"a":"set","name":"prisoner05","state":0,"visible":1,"click":0}]},{"id":74,"when":"trigger","name":"prisoner07","once":true,"holding":"","nth":0,"actions":[{"a":"path","name":"prisoner07","path":""},{"a":"artstate","name":"prisoner07","state":"hop"},{"a":"set","name":"prisoner07","state":5,"visible":1,"click":1},{"a":"var","name":"monkeychat","value":"{count}"},{"a":"set","name":"prisoner07","state":0,"visible":1,"click":0}]},{"id":75,"when":"trigger","name":"chatvol_1","once":false,"holding":"","nth":0,"actions":[{"a":"set","name":"chatvol_1","state":2,"visible":0,"click":0}]},{"id":76,"when":"attacked","name":"pod01","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod01|80|10|0"}]},{"id":77,"when":"attacked","name":"pod01","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod01|60|10|0"}]},{"id":78,"when":"attacked","name":"pod01","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod01|40|10|0"}]},{"id":79,"when":"attacked","name":"pod01","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod01|20|10|0"}]},{"id":80,"when":"attacked","name":"pod01","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod01|10|0|-368|11661|"},{"a":"xp","amount":5,"name":"pod01"},{"a":"send","cmd":"qspn","fields":"pod01|pod01__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"podcol01","state":99,"visible":0,"click":0},{"a":"set","name":"pod01","state":2,"visible":1,"click":0}]},{"id":81,"when":"trigger","name":"pod01__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod01__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":82,"when":"attacked","name":"pod02","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod02|80|10|0"}]},{"id":83,"when":"attacked","name":"pod02","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod02|60|10|0"}]},{"id":84,"when":"attacked","name":"pod02","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod02|40|10|0"}]},{"id":85,"when":"attacked","name":"pod02","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod02|20|10|0"}]},{"id":86,"when":"attacked","name":"pod02","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod02|10|0|233|11678|"},{"a":"xp","amount":5,"name":"pod02"},{"a":"send","cmd":"qspn","fields":"pod02|pod02__give_gem|200|42|3|10|null|null|null"},{"a":"set","name":"podcol02","state":99,"visible":0,"click":0},{"a":"set","name":"pod02","state":2,"visible":1,"click":0}]},{"id":87,"when":"trigger","name":"pod02__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod02__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":88,"when":"attacked","name":"pod11","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod11|80|10|0"}]},{"id":89,"when":"attacked","name":"pod11","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod11|60|10|0"}]},{"id":90,"when":"attacked","name":"pod11","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod11|40|10|0"}]},{"id":91,"when":"attacked","name":"pod11","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod11|20|10|0"}]},{"id":92,"when":"attacked","name":"pod11","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod11|10|0|1087|11744|"},{"a":"xp","amount":5,"name":"pod11"},{"a":"send","cmd":"qspn","fields":"pod11|pod11__give_gem|200|42|3|15|null|null|null"},{"a":"set","name":"podcol11","state":99,"visible":0,"click":0},{"a":"set","name":"pod11","state":2,"visible":1,"click":0}]},{"id":93,"when":"trigger","name":"pod11__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod11__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":94,"when":"trigger","name":"notifyvol01","once":false,"holding":"","nth":0,"actions":[{"a":"goal","str":10676},{"a":"set","name":"notifyvol01","state":99,"visible":0,"click":0}]},{"id":95,"when":"attacked","name":"pod03","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod03|80|10|0"}]},{"id":96,"when":"attacked","name":"pod03","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod03|60|10|0"}]},{"id":97,"when":"attacked","name":"pod03","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod03|40|10|0"}]},{"id":98,"when":"attacked","name":"pod03","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod03|20|10|0"}]},{"id":99,"when":"attacked","name":"pod03","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod03|10|0|778|10979|"},{"a":"xp","amount":5,"name":"pod03"},{"a":"send","cmd":"qspn","fields":"pod03|pod03__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"podcol03","state":99,"visible":0,"click":0},{"a":"set","name":"pod03","state":2,"visible":1,"click":0}]},{"id":100,"when":"trigger","name":"pod03__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod03__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":101,"when":"trigger","name":"sentryswitc2","once":true,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"sentryswitc2"},{"a":"show","name":"switchtile2","click":0},{"a":"hide","name":"sentry03lp"},{"a":"artstate","name":"sentry03","state":"turnoff"},{"a":"show","name":"sentry03","click":0},{"a":"set","name":"sentryswitc2","state":99,"visible":0,"click":0}]},{"id":102,"when":"attacked","name":"pod12","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod12|80|10|0"}]},{"id":103,"when":"attacked","name":"pod12","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod12|60|10|0"}]},{"id":104,"when":"attacked","name":"pod12","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod12|40|10|0"}]},{"id":105,"when":"attacked","name":"pod12","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod12|20|10|0"}]},{"id":106,"when":"attacked","name":"pod12","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod12|10|0|497|9810|"},{"a":"xp","amount":5,"name":"pod12"},{"a":"send","cmd":"qspn","fields":"pod12|pod12__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"podcol12","state":99,"visible":0,"click":0},{"a":"set","name":"pod12","state":2,"visible":1,"click":0}]},{"id":107,"when":"trigger","name":"pod12__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod12__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":108,"when":"attacked","name":"pod05","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod05|80|10|0"}]},{"id":109,"when":"attacked","name":"pod05","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod05|60|10|0"}]},{"id":110,"when":"attacked","name":"pod05","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod05|40|10|0"}]},{"id":111,"when":"attacked","name":"pod05","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod05|20|10|0"}]},{"id":112,"when":"attacked","name":"pod05","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod05|10|0|-309|9862|"},{"a":"xp","amount":5,"name":"pod05"},{"a":"send","cmd":"qspn","fields":"pod05|pod05__give_gem|200|42|3|15|null|null|null"},{"a":"set","name":"podcol05","state":99,"visible":0,"click":0},{"a":"set","name":"pod05","state":2,"visible":1,"click":0}]},{"id":113,"when":"trigger","name":"pod05__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod05__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":114,"when":"attacked","name":"pod04","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod04|80|10|0"}]},{"id":115,"when":"attacked","name":"pod04","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod04|60|10|0"}]},{"id":116,"when":"attacked","name":"pod04","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod04|40|10|0"}]},{"id":117,"when":"attacked","name":"pod04","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod04|20|10|0"}]},{"id":118,"when":"attacked","name":"pod04","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod04|10|0|597|9370|"},{"a":"xp","amount":5,"name":"pod04"},{"a":"send","cmd":"qspn","fields":"pod04|pod04__give_gem|200|42|3|10|null|null|null"},{"a":"set","name":"podcol04","state":99,"visible":0,"click":0},{"a":"set","name":"pod04","state":2,"visible":1,"click":0}]},{"id":119,"when":"trigger","name":"pod04__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod04__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":120,"when":"attacked","name":"pod21h","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod21h|80|10|0"}]},{"id":121,"when":"attacked","name":"pod21h","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod21h|60|10|0"}]},{"id":122,"when":"attacked","name":"pod21h","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod21h|40|10|0"}]},{"id":123,"when":"attacked","name":"pod21h","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod21h|20|10|0"}]},{"id":124,"when":"attacked","name":"pod21h","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod21h|10|0|-19|8023|"},{"a":"xp","amount":5,"name":"pod21h"},{"a":"send","cmd":"qspn","fields":"pod21h|pod21h__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"podcol21h","state":99,"visible":0,"click":0},{"a":"set","name":"pod21h","state":2,"visible":1,"click":0}]},{"id":125,"when":"trigger","name":"pod21h__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod21h__give_gem|0|null"},{"a":"gems","amount":5}]},{"id":126,"when":"attacked","name":"pod06","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod06|80|10|0"}]},{"id":127,"when":"attacked","name":"pod06","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod06|60|10|0"}]},{"id":128,"when":"attacked","name":"pod06","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod06|40|10|0"}]},{"id":129,"when":"attacked","name":"pod06","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod06|20|10|0"}]},{"id":130,"when":"attacked","name":"pod06","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod06|10|0|255|8201|"},{"a":"xp","amount":5,"name":"pod06"},{"a":"send","cmd":"qspn","fields":"pod06|pod06__give_gem|200|42|3|15|null|null|null"},{"a":"set","name":"podcol06","state":99,"visible":0,"click":0},{"a":"set","name":"pod06","state":2,"visible":1,"click":0}]},{"id":131,"when":"trigger","name":"pod06__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod06__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":132,"when":"attacked","name":"pod08","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod08|80|10|0"}]},{"id":133,"when":"attacked","name":"pod08","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod08|60|10|0"}]},{"id":134,"when":"attacked","name":"pod08","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod08|40|10|0"}]},{"id":135,"when":"attacked","name":"pod08","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod08|20|10|0"}]},{"id":136,"when":"attacked","name":"pod08","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod08|10|0|509|8362|"},{"a":"xp","amount":5,"name":"pod08"},{"a":"send","cmd":"qspn","fields":"pod08|pod08__give_gem|200|42|3|10|null|null|null"},{"a":"set","name":"podcol08","state":99,"visible":0,"click":0},{"a":"set","name":"pod08","state":2,"visible":1,"click":0}]},{"id":137,"when":"trigger","name":"pod08__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod08__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":138,"when":"trigger","name":"lock08","once":false,"holding":"","nth":0,"actions":[{"a":"say","name":"lock08","str":10675,"flag":0}],"unless":"key08"},{"id":139,"when":"attacked","name":"pod07","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod07|80|10|0"}]},{"id":140,"when":"attacked","name":"pod07","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod07|60|10|0"}]},{"id":141,"when":"attacked","name":"pod07","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod07|40|10|0"}]},{"id":142,"when":"attacked","name":"pod07","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod07|20|10|0"}]},{"id":143,"when":"attacked","name":"pod07","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod07|10|0|581|7614|"},{"a":"xp","amount":5,"name":"pod07"},{"a":"send","cmd":"qspn","fields":"pod07|pod07__give_gem|200|42|3|15|null|null|null"},{"a":"set","name":"podcol07","state":99,"visible":0,"click":0},{"a":"set","name":"pod07","state":2,"visible":1,"click":0}]},{"id":144,"when":"trigger","name":"pod07__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod07__give_gem|0|null"},{"a":"gems","amount":15}]},{"id":145,"when":"attacked","name":"pod13","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod13|80|10|0"}]},{"id":146,"when":"attacked","name":"pod13","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod13|60|10|0"}]},{"id":147,"when":"attacked","name":"pod13","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod13|40|10|0"}]},{"id":148,"when":"attacked","name":"pod13","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod13|20|10|0"}]},{"id":149,"when":"attacked","name":"pod13","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod13|10|0|1453|8133|"},{"a":"xp","amount":5,"name":"pod13"},{"a":"send","cmd":"qspn","fields":"pod13|pod13__give_gem|200|42|3|10|null|null|null"},{"a":"set","name":"podcol13","state":99,"visible":0,"click":0},{"a":"set","name":"pod13","state":2,"visible":1,"click":0}]},{"id":150,"when":"trigger","name":"pod13__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod13__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":151,"when":"trigger","name":"lock08","once":true,"holding":"key08","nth":0,"actions":[{"a":"use"},{"a":"show","name":"towerdoor01","click":0},{"a":"sound","sound":"ajq_gemdoor"},{"a":"xp","amount":10,"name":"lock08"},{"a":"goal","str":10678},{"a":"hide","name":"lock08"},{"a":"wait","ms":740},{"a":"set","name":"blockvol08","state":99,"visible":0,"click":0}]},{"id":152,"when":"trigger","name":"sentryswitc3","once":true,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"sentryswitc3"},{"a":"show","name":"switchtile3","click":0},{"a":"hide","name":"sentry04lp"},{"a":"hide","name":"sentry05lp"},{"a":"hide","name":"sentry06lp"},{"a":"artstate","name":"sentry04","state":"turnoff"},{"a":"show","name":"sentry04","click":0},{"a":"artstate","name":"sentry05","state":"turnoff"},{"a":"show","name":"sentry05","click":0},{"a":"artstate","name":"sentry06","state":"turnoff"},{"a":"show","name":"sentry06","click":0},{"a":"set","name":"sentryswitc3","state":99,"visible":0,"click":0}]},{"id":153,"when":"attacked","name":"pod09","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod09|80|10|0"}]},{"id":154,"when":"attacked","name":"pod09","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod09|60|10|0"}]},{"id":155,"when":"attacked","name":"pod09","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod09|40|10|0"}]},{"id":156,"when":"attacked","name":"pod09","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod09|20|10|0"}]},{"id":157,"when":"attacked","name":"pod09","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod09|10|0|585|5880|"},{"a":"xp","amount":5,"name":"pod09"},{"a":"send","cmd":"qspn","fields":"pod09|pod09__give_gem|200|42|3|10|null|null|null"},{"a":"set","name":"podcol09","state":99,"visible":0,"click":0},{"a":"set","name":"pod09","state":2,"visible":1,"click":0}]},{"id":158,"when":"trigger","name":"pod09__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod09__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":159,"when":"attacked","name":"pod10","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod10|80|10|0"}]},{"id":160,"when":"attacked","name":"pod10","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod10|60|10|0"}]},{"id":161,"when":"attacked","name":"pod10","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod10|40|10|0"}]},{"id":162,"when":"attacked","name":"pod10","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod10|20|10|0"}]},{"id":163,"when":"attacked","name":"pod10","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod10|10|0|1123|4952|"},{"a":"xp","amount":5,"name":"pod10"},{"a":"send","cmd":"qspn","fields":"pod10|pod10__give_gem|200|42|3|10|null|null|null"},{"a":"set","name":"podcol10","state":99,"visible":0,"click":0},{"a":"set","name":"pod10","state":2,"visible":1,"click":0}]},{"id":164,"when":"trigger","name":"pod10__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"pod10__give_gem|0|null"},{"a":"gems","amount":10}]},{"id":165,"when":"trigger","name":"lock09","once":false,"holding":"","nth":0,"actions":[{"a":"say","name":"lock09","str":10675,"flag":0}],"unless":"key09"},{"id":166,"when":"trigger","name":"lock09","once":true,"holding":"key09","nth":0,"actions":[{"a":"use"},{"a":"sound","sound":"ajq_gemdoor"},{"a":"show","name":"towerdoor02","click":0},{"a":"xp","amount":10,"name":"lock09"},{"a":"goal","str":10680},{"a":"hide","name":"lock09"},{"a":"wait","ms":1950},{"a":"set","name":"blockvol10","state":99,"visible":0,"click":0}]},{"id":167,"when":"trigger","name":"sentryswitc4","once":true,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"sentryswitc4"},{"a":"show","name":"switchtile4","click":0},{"a":"artstate","name":"sentry07","state":"turnoff"},{"a":"show","name":"sentry07","click":0},{"a":"hide","name":"sentry07lp"},{"a":"artstate","name":"sentry08","state":"turnoff"},{"a":"show","name":"sentry08","click":0},{"a":"hide","name":"sentry08lp"},{"a":"artstate","name":"sentry09","state":"turnoff"},{"a":"show","name":"sentry09","click":0},{"a":"hide","name":"sentry09lp"},{"a":"set","name":"sentryswitc4","state":99,"visible":0,"click":0}]},{"id":168,"when":"trigger","name":"avatar1","once":false,"holding":"","nth":0,"actions":[{"a":"say","name":"avatar1","str":10715,"flag":0}]},{"id":169,"when":"trigger","name":"toproomvol","once":false,"holding":"","nth":0,"actions":[{"a":"goal","str":10672},{"a":"hide","name":"toproomvol"}]},{"id":170,"when":"trigger","name":"factory03__0___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory03__0___give_d|0|null"},{"a":"gems","amount":25}]},{"id":171,"when":"trigger","name":"factory01__0___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory01__0___give_d|0|null"},{"a":"gems","amount":25}]},{"id":172,"when":"trigger","name":"greelyvol","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qmusic","fields":"0"},{"a":"send","cmd":"qmusic","fields":"aj_musvolcanogreely"},{"a":"appear","name":"greely","face":""},{"a":"var","name":"40_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure5-thegreatescape/#40-reachthetopofthetower/#0#001"},{"a":"var","name":"40_uri","value":99},{"a":"goal","str":10720},{"a":"send","cmd":"qicon","fields":"greely|1"},{"a":"set","name":"greely","state":2,"visible":1,"click":1},{"a":"set","name":"stealthvol_1","state":0,"visible":1,"click":0},{"a":"send","cmd":"qshake","fields":"2000"},{"a":"set","name":"greelyvol","state":99,"visible":0,"click":0}]},{"id":173,"when":"trigger","name":"greely","once":false,"holding":"","nth":0,"actions":[{"a":"talk","name":"greely","str":10670,"mode":2},{"a":"wait","ms":18600},{"a":"set","name":"greely","state":4,"visible":1,"click":1},{"a":"talk","name":"greely","str":3935,"mode":4}]},{"id":174,"when":"answer","name":"greely","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"set","name":"greely","state":3,"visible":1,"click":0},{"a":"set","name":"toprison","state":99,"visible":0,"click":0},{"a":"wait","ms":1070},{"a":"send","cmd":"qshake","fields":"2000"},{"a":"wait","ms":2000},{"a":"send","cmd":"qmusic","fields":"0"},{"a":"cutscene","swf":"2497","extra":"null|null"}]},{"id":175,"when":"answer","name":"greely","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"goal","str":10673},{"a":"artstate","name":"greely","state":"disappear"},{"a":"set","name":"greely","state":5,"visible":1,"click":1},{"a":"send","cmd":"qicon","fields":"greely|0"},{"a":"set","name":"greely","state":6,"visible":1,"click":0},{"a":"wait","ms":1590},{"a":"send","cmd":"qshake","fields":"2000"},{"a":"send","cmd":"qmusic","fields":"0"},{"a":"set","name":"greely","state":99,"visible":0,"click":0},{"a":"send","cmd":"qfade","fields":"0"},{"a":"send","cmd":"qfade","fields":"1"},{"a":"send","cmd":"qmusic","fields":"0"},{"a":"wait","ms":2000},{"a":"minigame","game":93,"name":"playgame","state":4}]},{"id":176,"when":"cutsceneDone","name":"","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qmusic","fields":"aj_musvolcanogreely"},{"a":"wait","ms":840},{"a":"send","cmd":"qshake","fields":"2000"}]},{"id":177,"when":"minigameDone","name":"","once":false,"holding":"","nth":0,"actions":[{"a":"room","key":"endroom","spawn":"endroom"}]},{"id":178,"when":"trigger","name":"cosmo2","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qicon","fields":"cosmo2|1"},{"a":"talk","name":"cosmo2","str":10668,"mode":1}]},{"id":179,"when":"answer","name":"cosmo2","once":true,"holding":"","nth":0,"actions":[{"a":"set","name":"cosmo2","state":2,"visible":1,"click":1},{"a":"show","name":"portalsound","click":0},{"a":"show","name":"exitportal","click":0},{"a":"xp","amount":50,"name":"cosmo2"},{"a":"goal","str":10674},{"a":"set","name":"cosmo2","state":3,"visible":1,"click":0},{"a":"wait","ms":200},{"a":"var","name":"70_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure5-thegreatescape/#70-exit/#0#001"},{"a":"prize","list":"den 1328, gems 1000, den 1329, gems 750, den 1330"},{"a":"wait","ms":3000},{"a":"set","name":"blockvol_end","state":99,"visible":0,"click":0}]},{"id":180,"when":"trigger","name":"exitvol","once":false,"holding":"","nth":0,"actions":[{"a":"end"}]},{"id":181,"holding":"","when":"trigger","name":"seedpile#","family":true,"holdFam":"","unlessFam":"","once":false,"nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3}]},{"id":182,"holding":"","when":"trigger","name":"phantom#b__give_gem","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"send","cmd":"qad","fields":"{name}|0|null"},{"a":"gems","amount":25}]},{"id":183,"holding":"","when":"trigger","name":"phantom#a__give_gem","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"send","cmd":"qad","fields":"{name}|0|null"},{"a":"gems","amount":25}]},{"id":184,"holding":"","when":"trigger","name":"phantom#c__give_gem","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"send","cmd":"qad","fields":"{name}|0|null"},{"a":"gems","amount":25}]},{"id":185,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["phantom#"],"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_gem|200|42|3|25|null|null|null"},{"a":"xp","amount":5,"name":"{phantom}"},{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":186,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["factory#"],"actions":[{"a":"xp","amount":5,"name":"{phantom}"},{"a":"var","name":"toproom","value":"{count}"}]},{"id":187,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["factory#__#_"],"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_d|200|42|3|25|null|null|null"}]},{"id":188,"holding":"","when":"eaten","name":"","member":"boomrock10","nth":0,"once":false,"actions":[{"a":"set","name":"blockvol13","state":99,"visible":0,"click":0},{"a":"xp","amount":5,"name":"{phantom}"},{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0},{"a":"set","name":"puz10beam1","state":80,"visible":1,"click":0},{"a":"set","name":"puz10a","state":6,"visible":1,"click":0},{"a":"set","name":"puz10beam9","state":10,"visible":1,"click":0},{"a":"set","name":"puz10e","state":5,"visible":1,"click":0},{"a":"show","name":"puz10beam8","click":0},{"a":"set","name":"puz10f","state":7,"visible":1,"click":0},{"a":"set","name":"puz10beam7","state":10,"visible":1,"click":0},{"a":"set","name":"puz10g","state":5,"visible":1,"click":0},{"a":"set","name":"puz10beam10","state":25,"visible":1,"click":0},{"a":"show","name":"puz10end3","click":0},{"a":"set","name":"puz10frame2r","state":2,"visible":1,"click":0}]},{"id":189,"holding":"","when":"eaten","name":"","member":"phantom3b","nth":0,"once":false,"actions":[{"a":"var","name":"toproom","value":"{count}"}]},{"id":190,"holding":"","when":"eaten","name":"","member":"phantom3c","nth":0,"once":false,"actions":[{"a":"var","name":"toproom","value":"{count}"}]},{"id":191,"holding":"","when":"eaten","name":"","member":"phantom3a","nth":0,"once":false,"actions":[{"a":"var","name":"toproom","value":"{count}"}]},{"id":192,"holding":"","when":"eaten","name":"","member":"factory03","nth":0,"once":false,"actions":[{"a":"set","name":"blockvol16","state":99,"visible":0,"click":0}]},{"id":193,"holding":"","when":"eaten","name":"","member":"factory01","nth":0,"once":false,"actions":[{"a":"set","name":"blockvol14","state":99,"visible":0,"click":0}]},{"id":194,"holding":"","when":"eaten","name":"","nth":0,"once":false,"countReach":{"name":"toproom","value":6},"actions":[{"a":"show","name":"greelyvol","click":1},{"a":"goal","str":10682}]},{"id":195,"holding":"","when":"eaten","name":"","member":"factory02","nth":0,"once":false,"actions":[{"a":"set","name":"blockvol15","state":99,"visible":0,"click":0}]}],"written":"2018-01-05 23:48:43","spawners":{"factory03":[11,2],"factory01":[11,2]},"eat":{"phantom2b":[50,1],"phantom2a":[50,1],"phantom2c":[50,1],"boomrock10":[1,1],"phantom3b":[50,1],"phantom3c":[50,1],"phantom3a":[50,1],"factory03":[1,1],"factory01":[1,1],"factory01__0_":[50,1],"factory02":[1,1],"factory03__0_":[50,1]},"bars":[{"bar":"interactdoor","trigger":"vol_hop2","done":[{"a":"xp","amount":25,"name":"vol_hop2"},{"a":"show","name":"jumppad","click":1},{"a":"var","name":"30_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure5-thegreatescape/#30-escapethedungeon/#0#001"},{"a":"var","name":"30_uri","value":99},{"a":"set","name":"blockvol06","state":99,"visible":0,"click":0},{"a":"goal","str":10664},{"a":"artstate","name":"prisoner03","state":"idle"},{"a":"set","name":"prisoner03","state":10,"visible":1,"click":1},{"a":"set","name":"prisoner03","state":0,"visible":1,"click":0},{"a":"artstate","name":"prisoner04","state":"idle"},{"a":"set","name":"prisoner04","state":10,"visible":1,"click":1},{"a":"set","name":"prisoner04","state":0,"visible":1,"click":0},{"a":"artstate","name":"prisoner05","state":"idle"},{"a":"set","name":"prisoner05","state":10,"visible":1,"click":1},{"a":"set","name":"prisoner05","state":0,"visible":1,"click":0},{"a":"artstate","name":"prisoner06","state":"idle"},{"a":"set","name":"prisoner06","state":10,"visible":1,"click":1},{"a":"set","name":"prisoner06","state":0,"visible":1,"click":0},{"a":"artstate","name":"prisoner07","state":"idle"},{"a":"set","name":"prisoner07","state":10,"visible":1,"click":1},{"a":"set","name":"prisoner07","state":0,"visible":1,"click":0},{"a":"artstate","name":"prisoner08","state":"idle"},{"a":"set","name":"prisoner08","state":10,"visible":1,"click":1},{"a":"set","name":"prisoner08","state":0,"visible":1,"click":0},{"a":"set","name":"vol_hop2","state":3,"visible":1,"click":1}],"marks":{},"step":5}],"variantGroups":[],"countRules":[{"counter":"_stage","value":1,"actions":[{"a":"goal","str":3925}]},{"counter":"_stage","value":2,"actions":[{"a":"goal","str":3928}]},{"counter":"_stage","value":3,"actions":[{"a":"var","name":"10_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure5-thegreatescape/#10-getcaptured/#0#001"},{"a":"var","name":"10_uri","value":99},{"a":"show","name":"alertbox","click":0},{"a":"send","cmd":"qmusic","fields":"0"},{"a":"send","cmd":"qmusic","fields":"ajq_phntmprisoner"},{"a":"artstate","name":"phantom1a","state":"appear"},{"a":"path","name":"phantom1a","path":"path1a"},{"a":"show","name":"phantom1a","click":0},{"a":"artstate","name":"phantom1b","state":"appear"},{"a":"path","name":"phantom1b","path":"path1b"},{"a":"show","name":"phantom1b","click":0},{"a":"artstate","name":"phantom1c","state":"appear"},{"a":"path","name":"phantom1c","path":"path1c"},{"a":"show","name":"phantom1c","click":0},{"a":"artstate","name":"phantom1d","state":"appear"},{"a":"path","name":"phantom1d","path":"path1d"},{"a":"show","name":"phantom1d","click":0},{"a":"artstate","name":"phantom1e","state":"appear"},{"a":"path","name":"phantom1e","path":"path1e"},{"a":"show","name":"phantom1e","click":0},{"a":"artstate","name":"phantom1f","state":"appear"},{"a":"path","name":"phantom1f","path":"path1f"},{"a":"show","name":"phantom1f","click":0},{"a":"artstate","name":"phantom1g","state":"appear"},{"a":"path","name":"phantom1g","path":"path1g"},{"a":"show","name":"phantom1g","click":0},{"a":"artstate","name":"phantom1h","state":"appear"},{"a":"path","name":"phantom1h","path":"path1h"},{"a":"show","name":"phantom1h","click":0},{"a":"artstate","name":"phantom1i","state":"appear"},{"a":"path","name":"phantom1i","path":"path1i"},{"a":"show","name":"phantom1i","click":0},{"a":"goal","str":3930},{"a":"send","cmd":"qfade","fields":"0"},{"a":"send","cmd":"qfade","fields":"1"},{"a":"set","name":"sludgerain","state":99,"visible":0,"click":0},{"a":"show","name":"toprison","click":1}]},{"counter":"pris2state","value":1,"actions":[{"a":"goal","str":3934}]},{"counter":"pris2state","value":2,"actions":[{"a":"goal","str":3962}]},{"counter":"pris3state","value":1,"actions":[{"a":"goal","str":3988}]},{"counter":"trapcount","value":1,"actions":[{"a":"goal","str":3991},{"a":"show","name":"celldoor01","click":0},{"a":"var","name":"pris7state","value":1},{"a":"say","name":"prisoner07","str":10711,"flag":1}]},{"counter":"trapcount","value":2,"actions":[{"a":"goal","str":3992},{"a":"var","name":"pris5state","value":1},{"a":"say","name":"prisoner05","str":10709,"flag":1}]},{"counter":"trapcount","value":3,"actions":[{"a":"goal","str":3993},{"a":"var","name":"pris6state","value":1},{"a":"say","name":"prisoner06","str":10710,"flag":1}]},{"counter":"trapcount","value":4,"actions":[{"a":"goal","str":10645}]},{"counter":"trapcount","value":5,"actions":[{"a":"xp","amount":25,"name":"trapcount"},{"a":"goal","str":10713},{"a":"var","name":"pris4state","value":1},{"a":"say","name":"prisoner04","str":10708,"flag":1}]},{"counter":"monkeychat","value":3,"actions":[{"a":"set","name":"prisoner03","state":7,"visible":1,"click":1},{"a":"say","name":"prisoner03","str":3960,"flag":1}]},{"counter":"monkeychat","value":6,"actions":[{"a":"goal","str":10647},{"a":"show","name":"vol_hop2","click":1},{"a":"set","name":"vol_hop2","state":2,"visible":1,"click":1},{"a":"show","name":"chatvol_1","click":1},{"a":"goal","str":10647},{"a":"show","name":"vol_hop2","click":1},{"a":"set","name":"vol_hop2","state":2,"visible":1,"click":1}]},{"counter":"puz8state","value":2,"actions":[{"a":"goal","str":10677},{"a":"goal","str":10677}]}],"puzzles":[{"name":"puz6","mirrors":{"trig6":{"mirror":"puz6a","init":3,"vc":[1,0],"turn":[{"a":"set","name":"trig6","state":1,"visible":1,"click":1},{"a":"set","name":"trig6","state":0,"visible":1,"click":1}],"first":[],"lit":{"by":["puz6a"],"table":{"2":1}}}},"goals":[{"solved":{"puz6a":2},"done":[{"a":"xp","amount":25,"name":"trig6"},{"a":"show","name":"puz6beam2","click":0},{"a":"show","name":"puz6end","click":0},{"a":"show","name":"puz6door","click":0},{"a":"sound","sound":"ajq_gemdoor"},{"a":"set","name":"puz6frame_l","state":2,"visible":1,"click":0},{"a":"set","name":"puz6frame_r","state":2,"visible":1,"click":0},{"a":"var","name":"pris2state","value":"{count}"},{"a":"set","name":"prisoner02","state":3,"visible":1,"click":1},{"a":"say","name":"prisoner02","str":3953,"flag":1},{"a":"set","name":"trig6","state":99,"visible":0,"click":0},{"a":"wait","ms":260},{"a":"set","name":"blockvol04","state":99,"visible":0,"click":0}]}],"beams":{},"locks":[],"sting":"ajq_mirrorstinger","start":{"puz6a":[7,1,0],"puz6beam2":[99,0,0],"puz6end":[0,1,1],"puz6door":[0,1,1],"puz6frame_l":[0,1,1],"puz6frame_r":[0,1,1]},"lit0":{"puz6a":1}},{"name":"puz7","mirrors":{"trig7a":{"mirror":"puz7b","init":1,"vc":[1,0],"turn":[{"a":"set","name":"trig7a","state":1,"visible":1,"click":1},{"a":"set","name":"trig7a","state":0,"visible":1,"click":1}],"first":[],"lit":{"by":["puz7b"],"table":{"0":1,"3":1}}},"trig7b":{"mirror":"puz7c","init":0,"vc":[1,0],"turn":[{"a":"set","name":"trig7b","state":1,"visible":1,"click":1},{"a":"set","name":"trig7b","state":0,"visible":1,"click":1}],"first":[],"lit":{"by":["puz7c"],"table":{"2":1,"3":1}}}},"goals":[{"solved":{"puz7b":0,"puz7c":3},"done":[{"a":"set","name":"puz7beam4","state":600,"visible":1,"click":0},{"a":"xp","amount":25,"name":"trig7b"},{"a":"show","name":"puz7end","click":0},{"a":"show","name":"puz7door","click":0},{"a":"sound","sound":"ajq_gemdoor"},{"a":"set","name":"puz7frame_l","state":2,"visible":1,"click":0},{"a":"set","name":"puz7frame_r","state":2,"visible":1,"click":0},{"a":"goal","str":3962},{"a":"set","name":"prisoner01","state":99,"visible":0,"click":0},{"a":"set","name":"trig7b","state":99,"visible":0,"click":0},{"a":"set","name":"trig7a","state":99,"visible":0,"click":0},{"a":"wait","ms":820},{"a":"set","name":"blockvol05","state":99,"visible":0,"click":0}]}],"beams":{"puz7beam3":{"by":["puz7b"],"table":{"0":[30,1,0]},"off":[99,0,0]}},"locks":[],"sting":"ajq_mirrorstinger","start":{"puz7b":[1,1,0],"puz7beam3":[99,0,0],"puz7c":[0,1,0],"puz7beam4":[99,0,0],"puz7end":[0,1,1],"puz7door":[0,1,1],"puz7frame_l":[0,1,1],"puz7frame_r":[0,1,1]},"lit0":{"puz7b":0,"puz7c":0}},{"name":"puz8","mirrors":{"trig8a":{"mirror":"puz8d","init":0,"vc":[1,0],"turn":[{"a":"set","name":"trig8a","state":1,"visible":1,"click":1},{"a":"set","name":"trig8a","state":0,"visible":1,"click":1}],"first":[],"lit":{"by":["puz8d"],"table":{"3":1}}},"trig8b":{"mirror":"puz8a","init":2,"vc":[1,0],"turn":[{"a":"set","name":"trig8b","state":1,"visible":1,"click":1},{"a":"set","name":"trig8b","state":0,"visible":1,"click":1},{"a":"set","name":"trig8b","state":1,"visible":1,"click":1},{"a":"set","name":"trig8b","state":0,"visible":1,"click":1}],"first":[],"lit":{"by":[],"table":{"":1}}}},"goals":[{"solved":{"puz8d":3,"puz8a":1},"done":[{"a":"wait","ms":1240},{"a":"wait","ms":810},{"a":"set","name":"puz8beam5","state":30,"visible":1,"click":0},{"a":"set","name":"puz8b","state":6,"visible":1,"click":0},{"a":"set","name":"puz8beam6","state":50,"visible":1,"click":0},{"a":"show","name":"puz8end2","click":0},{"a":"set","name":"puz8frame_r","state":2,"visible":1,"click":0},{"a":"var","name":"puz8state","value":"{count}"},{"a":"xp","amount":25,"name":"puz8state"},{"a":"show","name":"puz8door","click":0},{"a":"sound","sound":"ajq_gemdoor"},{"a":"xp","amount":25,"name":"puz8state"},{"a":"sound","sound":"ajq_gemdoor"},{"a":"set","name":"trig8b","state":99,"visible":0,"click":0},{"a":"wait","ms":350},{"a":"set","name":"blockvol07","state":99,"visible":0,"click":0}]}],"beams":{"puz8beam3":{"by":["puz8d"],"table":{"3":[10,1,0]},"off":[99,0,0]},"puz8end1":{"by":["puz8d"],"table":{"3":[1,1,0]},"off":[0,1,1]},"puz8frame_l":{"by":["puz8d"],"table":{"3":[2,1,0]},"off":[0,1,1]}},"locks":[{"trig":"trig8a","dir":3,"msgs":[["qcmdVT",1,"puz8state","{count}",0,0],["qcmd",1,"trig8a",99,0,0]]}],"sting":"ajq_mirrorstinger","start":{"puz8d":[4,1,0],"puz8beam3":[99,0,0],"puz8end1":[0,1,1],"puz8frame_l":[0,1,1],"puz8a":[6,1,0],"puz8beam5":[99,0,0],"puz8b":[2,1,0],"puz8beam6":[99,0,0],"puz8end2":[0,1,1],"puz8frame_r":[0,1,1],"puz8door":[0,1,1]},"lit0":{"puz8d":1,"puz8a":1}},{"name":"puz9","mirrors":{"trig9a":{"mirror":"puz9c","init":2,"vc":[1,0],"turn":[{"a":"set","name":"trig9a","state":1,"visible":1,"click":1},{"a":"set","name":"trig9a","state":0,"visible":1,"click":1}],"first":[],"lit":{"by":["puz9c"],"table":{"1":1}}},"trig9b":{"mirror":"puz9h","init":2,"vc":[1,0],"turn":[{"a":"set","name":"trig9b","state":1,"visible":1,"click":1},{"a":"set","name":"trig9b","state":0,"visible":1,"click":1}],"first":[],"lit":{"by":["puz9h"],"table":{"0":1,"1":1}}},"trig9c":{"mirror":"puz9i","init":0,"vc":[1,0],"turn":[{"a":"set","name":"trig9c","state":1,"visible":1,"click":1},{"a":"set","name":"trig9c","state":0,"visible":1,"click":1}],"first":[],"lit":{"by":["puz9h","puz9i"],"table":{"1,0":1,"1,3":1}}}},"goals":[{"solved":{"puz9c":1,"puz9h":1,"puz9i":3},"done":[{"a":"set","name":"puz9beam10","state":85,"visible":1,"click":0},{"a":"set","name":"puz9j","state":4,"visible":1,"click":0},{"a":"set","name":"puz9beam11","state":25,"visible":1,"click":0},{"a":"xp","amount":25,"name":"trig9c"},{"a":"set","name":"trig9a","state":99,"visible":0,"click":0},{"a":"set","name":"trig9b","state":99,"visible":0,"click":0},{"a":"set","name":"trig9c","state":99,"visible":0,"click":0},{"a":"show","name":"puz9end","click":0},{"a":"show","name":"puz9door","click":0},{"a":"sound","sound":"ajq_gemdoor"},{"a":"set","name":"puz9frame_l","state":2,"visible":1,"click":0},{"a":"set","name":"puz9frame_r","state":2,"visible":1,"click":0},{"a":"goal","str":10679},{"a":"wait","ms":700},{"a":"set","name":"blockvol09","state":99,"visible":0,"click":0}]}],"beams":{"puz9beam4":{"by":["puz9c"],"table":{"1":[35,1,0]},"off":[99,0,0]},"puz9d":{"by":["puz9c"],"table":{"1":[6,1,0]},"off":[2,1,0]},"puz9beam5":{"by":["puz9c"],"table":{"1":[10,1,0]},"off":[99,0,0]},"puz9e":{"by":["puz9c"],"table":{"1":[4,1,0]},"off":[0,1,0]},"puz9beam6":{"by":["puz9c"],"table":{"1":[35,1,0]},"off":[99,0,0]},"puz9f":{"by":["puz9c"],"table":{"1":[6,1,0]},"off":[2,1,0]},"puz9beam7":{"by":["puz9c"],"table":{"1":[1,1,0]},"off":[99,0,0]},"puz9g":{"by":["puz9c"],"table":{"1":[7,1,0]},"off":[3,1,0]},"puz9beam8":{"by":["puz9c"],"table":{"1":[5,1,0]},"off":[99,0,0]},"puz9beam9":{"by":["puz9h"],"table":{"1":[15,1,0]},"off":[99,0,0]}},"locks":[],"sting":"ajq_mirrorstinger","start":{"puz9c":[6,1,0],"puz9beam4":[99,0,0],"puz9d":[2,1,0],"puz9beam5":[99,0,0],"puz9e":[0,1,0],"puz9beam6":[99,0,0],"puz9f":[2,1,0],"puz9beam7":[99,0,0],"puz9g":[3,1,0],"puz9beam8":[99,0,0],"puz9h":[2,1,0],"puz9beam9":[99,0,0],"puz9i":[0,1,0],"puz9beam10":[99,0,0],"puz9j":[0,1,0],"puz9beam11":[99,0,0],"puz9end":[0,1,1],"puz9door":[0,1,1],"puz9frame_l":[0,1,1],"puz9frame_r":[0,1,1]},"lit0":{"puz9c":1,"puz9h":0,"puz9i":0}},{"name":"puz10","mirrors":{"trig10c":{"mirror":"puz10d","init":3,"vc":[1,0],"turn":[{"a":"set","name":"trig10c","state":1,"visible":1,"click":1},{"a":"set","name":"trig10c","state":0,"visible":1,"click":1}],"first":[],"lit":{"by":["puz10c"],"table":{"2":1}}},"trig10a":{"mirror":"puz10a","init":2,"vc":[1,0],"turn":[{"a":"set","name":"trig10a","state":1,"visible":1,"click":1},{"a":"set","name":"trig10a","state":0,"visible":1,"click":1}],"first":[],"lit":{"by":["puz10a"],"table":{"1":1,"2":1}}},"trig10b":{"mirror":"puz10c","init":3,"vc":[1,0],"turn":[{"a":"set","name":"trig10b","state":1,"visible":1,"click":1},{"a":"set","name":"trig10b","state":0,"visible":1,"click":1}],"first":[],"lit":{"by":["puz10a","puz10c"],"table":{"1,1":1,"1,2":1}}}},"goals":[{"solved":{"puz10d":2,"puz10a":1,"puz10c":2},"done":[{"a":"xp","amount":25,"name":"trig10b"},{"a":"set","name":"puz10beam4","state":500,"visible":1,"click":0},{"a":"show","name":"puz10end1","click":0},{"a":"set","name":"trig10b","state":99,"visible":0,"click":0},{"a":"set","name":"puz10frame1r","state":2,"visible":1,"click":0},{"a":"set","name":"puz10frame1l","state":2,"visible":1,"click":0},{"a":"show","name":"puz10door1","click":0},{"a":"set","name":"puz10start2","state":5,"visible":1,"click":0},{"a":"set","name":"puz10beam5","state":400,"visible":1,"click":0},{"a":"set","name":"puz10beam6","state":35,"visible":1,"click":0},{"a":"show","name":"puz10end2","click":0},{"a":"set","name":"puz10frame2l","state":2,"visible":1,"click":0},{"a":"set","name":"trig10c","state":99,"visible":0,"click":0},{"a":"wait","ms":880},{"a":"set","name":"blockvol11","state":99,"visible":0,"click":0}]},{"solved":{"puz10d":2,"puz10a":2,"puz10c":2},"done":[{"a":"set","name":"puz10beam4","state":99,"visible":0,"click":0},{"a":"set","name":"trig10a","state":99,"visible":0,"click":0},{"a":"show","name":"puz10door2","click":0},{"a":"xp","amount":25,"name":"trig10a"},{"a":"goal","str":10681},{"a":"set","name":"blockvol12","state":99,"visible":0,"click":0}]}],"beams":{"puz10beam9":{"by":["puz10a"],"table":{"0":[99,0,0],"1":[99,0,0],"3":[99,0,0]},"off":[10,1,0]},"puz10e":{"by":["puz10a"],"table":{"0":[1,1,0],"1":[1,1,0],"3":[1,1,0]},"off":[5,1,0]},"puz10beam8":{"by":["puz10a"],"table":{"0":[99,0,0],"1":[99,0,0],"3":[99,0,0]},"off":[1,1,0]},"puz10f":{"by":["puz10a"],"table":{"0":[3,1,0],"1":[3,1,0],"3":[3,1,0]},"off":[7,1,0]},"puz10beam7":{"by":["puz10a"],"table":{"0":[99,0,0],"1":[99,0,0],"3":[99,0,0]},"off":[10,1,0]},"puz10g":{"by":["puz10a"],"table":{"0":[1,1,0],"1":[1,1,0],"3":[1,1,0]},"off":[5,1,0]},"puz10beam10":{"by":["puz10a"],"table":{"0":[99,0,0],"1":[99,0,0],"3":[99,0,0]},"off":[25,1,0]},"puz10end3":{"by":["puz10a"],"table":{"0":[0,1,0],"1":[0,1,0],"3":[0,1,0]},"off":[1,1,0]},"puz10frame2r":{"by":["puz10a"],"table":{"0":[0,1,0],"1":[0,1,0],"3":[0,1,0]},"off":[2,1,0]},"puz10beam2":{"by":["puz10a"],"table":{"1":[10,1,0]},"off":[99,0,0]},"puz10b":{"by":["puz10a"],"table":{"1":[7,1,0]},"off":[3,1,0]},"puz10beam3":{"by":["puz10a"],"table":{"1":[1,1,0]},"off":[99,0,0]}},"locks":[],"sting":"ajq_mirrorstinger","start":{"puz10d":[3,1,0],"puz10a":[6,1,0],"puz10beam9":[10,1,0],"puz10e":[5,1,0],"puz10beam8":[1,1,0],"puz10f":[7,1,0],"puz10beam7":[10,1,0],"puz10g":[5,1,0],"puz10beam10":[25,1,0],"puz10end3":[1,1,0],"puz10frame2r":[2,1,0],"puz10beam2":[99,0,0],"puz10b":[3,1,0],"puz10beam3":[99,0,0],"puz10c":[3,1,0],"puz10beam4":[99,0,0],"puz10end1":[0,1,1],"puz10frame1r":[0,1,1],"puz10frame1l":[0,1,1],"puz10door1":[0,1,1],"puz10start2":[1,1,0],"puz10beam5":[99,0,0],"puz10beam6":[99,0,0],"puz10end2":[0,1,1],"puz10frame2l":[0,1,1],"puz10door2":[0,1,1]},"lit0":{"puz10d":0,"puz10a":1,"puz10c":0}}],"bosses":[]}
*/
