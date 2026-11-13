"use strict";

// Recorded adventure 17, made with the adventure script maker. Plays in adventures.room_adventure_6a, adventures.room_adventure_6b, adventures.room_adventure_6c, adventures.room_adventure_6b, adventures.room_adventure_6d, adventures.room_adventure_6e, adventures.room_adventure_6f.
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
// what the server does by itself while the player is in some rooms (the volcano shaking): one of these
// at random, then the next after its wait, for as long as the player stays in those rooms
const AMBIENT_ROOMS = ["start","in6c1","in6e"];
const ambientOnes = [
  [8010, q => {
    q.send("qcmdVT", 1, "shaketimer", 7, 0, 0);
    q.send("qshake", 750);
  }],
  [12010, q => {
    q.send("qcmdVT", 1, "shaketimer", 3, 0, 0);
    q.send("qshake", 1500);
  }],
  [10010, q => {
    q.send("qcmdVT", 1, "shaketimer", 5, 0, 0);
    q.send("qshake", 1000);
  }],
];
const ambient = (q, room) => {
  q.vars.room = room;
  if (!AMBIENT_ROOMS.includes(room) || q.vars.ambientOn) {
    return;
  }
  q.vars.ambientOn = true;
  const next = () => {
    if (!AMBIENT_ROOMS.includes(q.vars.room)) {
      q.vars.ambientOn = false;
      return;
    }
    const [wait, act] = ambientOnes[Math.floor(Math.random() * ambientOnes.length)];
    act(q);
    q.after(wait, next);
  };
  q.after(1000, next);
};
// mirror puzzles: each mirror's turns (the way it points, 0-3; its state adds 4 while a beam reaches it),
// the beams (which mirrors each depends on, and how it looks for the ways they were seen to point), and how
// the mirrors point when it is solved
const PUZZLES = [{"name":"puz01","mirrors":{"trig01":{"mirror":"puz01start","init":1,"vc":[1,0],"turn":[{"a":"set","name":"trig01","state":2,"visible":1,"click":1},{"a":"set","name":"trig01","state":1,"visible":1,"click":1}],"lit":{"by":[],"table":{"":1}}}},"goals":[{"solved":{"puz01start":0}}],"beams":{},"locks":[],"sting":"ajq_mirrorstinger","start":{"puz01start":[9,1,0],"puz01beam01":[99,0,0],"puz01end":[0,1,1],"puz01door":[0,1,1],"puz01frame":[0,1,1],"puz01block":[0,1,1]},"lit0":{"puz01start":2}},{"name":"puz02","mirrors":{"trig02b":{"mirror":"puz02start2","init":2,"vc":[1,0],"turn":[{"a":"set","name":"trig02b","state":2,"visible":1,"click":1},{"a":"set","name":"trig02b","state":1,"visible":1,"click":1}],"lit":{"by":[],"table":{"":1}}},"trig02a":{"mirror":"puz02start1","init":0,"vc":[1,0],"turn":[{"a":"set","name":"trig02a","state":2,"visible":1,"click":1},{"a":"set","name":"trig02a","state":1,"visible":1,"click":1}],"lit":{"by":["puz02start1","puz02start3"],"table":{"1,2":1,"2,2":1,"3,2":1,"3,3":1,"3,0":1,"3,1":1,"0,1":1,"1,1":1}}},"trig02c":{"mirror":"puz02start3","init":2,"vc":[1,0],"turn":[{"a":"set","name":"trig02c","state":2,"visible":1,"click":1},{"a":"set","name":"trig02c","state":1,"visible":1,"click":1}],"lit":{"by":["puz02start3"],"table":{"0":1,"1":1,"3":1}}}},"goals":[{"solved":{"puz02start2":0,"puz02start1":3}},{"solved":{"puz02start2":1,"puz02start1":1,"puz02start3":1}}],"beams":{"puz02beam04":{"by":["puz02start2"],"table":{"0":[1,1,0]},"off":[99,0,0]},"puz02c":{"by":["puz02start2"],"table":{"0":[6,1,0]},"off":[2,1,0]},"puz02beam05":{"by":["puz02start2"],"table":{"0":[1,1,0]},"off":[99,0,0]},"puz02d":{"by":["puz02start2"],"table":{"0":[5,1,0]},"off":[1,1,0]},"puz02beam06":{"by":["puz02start2"],"table":{"0":[1,1,0]},"off":[99,0,0]},"puz02e":{"by":["puz02start2"],"table":{"0":[7,1,0]},"off":[3,1,0]},"puz02beam07":{"by":["puz02start2"],"table":{"0":[1,1,0]},"off":[99,0,0]},"puz02end1":{"by":["puz02start2"],"table":{"0":[1,1,0],"1":[1,1,0]},"off":[0,1,1]},"puz02frame1r":{"by":["puz02start2"],"table":{"0":[2,1,0],"1":[2,1,0]},"off":[0,1,1]},"puz02beam08":{"by":["puz02start1"],"table":{"1":[1,1,0]},"off":[99,0,0]},"puz02f":{"by":["puz02start1"],"table":{"1":[6,1,0]},"off":[2,1,0]},"puz02beam09":{"by":["puz02start1"],"table":{"1":[150,1,0]},"off":[99,0,0]},"puz02end4":{"by":["puz02start1","puz02start3"],"table":{"1,2":[1,1,0],"2,2":[0,1,0],"3,2":[0,1,0],"3,3":[0,1,0],"3,0":[0,1,0],"3,1":[0,1,0],"0,1":[0,1,0],"1,1":[1,1,0]},"off":[0,1,1]},"puz02end4n5":{"by":["puz02start1","puz02start3"],"table":{"1,2":[1,1,0],"2,2":[0,1,0],"3,2":[0,1,0],"3,3":[0,1,0],"3,0":[0,1,0],"3,1":[0,1,0],"0,1":[0,1,0],"1,1":[1,1,0]},"off":[0,1,1]},"puz02frame2l":{"by":["puz02start2","puz02start1","puz02start3"],"table":{"0,1,2":[1,1,0],"0,2,2":[0,1,0],"0,3,2":[0,1,0],"0,3,3":[0,1,0],"0,3,0":[0,1,0],"0,3,1":[0,1,0],"0,0,1":[0,1,0],"0,1,1":[1,1,0],"1,1,1":[2,1,0]},"off":[0,1,1]},"puz02beam18":{"by":["puz02start3"],"table":{"1":[240,1,0]},"off":[99,0,0]},"puz02n":{"by":["puz02start3"],"table":{"1":[6,1,0]},"off":[2,1,0]},"puz02beam19":{"by":["puz02start3"],"table":{"1":[150,1,0]},"off":[99,0,0]},"puz02end3":{"by":["puz02start3"],"table":{"1":[1,1,0]},"off":[0,1,1]},"puz02frame2r":{"by":["puz02start3"],"table":{"1":[2,1,0]},"off":[0,1,1]},"puz02beam01":{"by":["puz02start1"],"table":{"3":[1,1,0]},"off":[99,0,0]},"puz02a":{"by":["puz02start1"],"table":{"3":[5,1,0]},"off":[1,1,0]},"puz02beam02":{"by":["puz02start1"],"table":{"3":[1,1,0]},"off":[99,0,0]},"puz02b":{"by":["puz02start1"],"table":{"3":[7,1,0]},"off":[3,1,0]},"puz02beam03":{"by":["puz02start1"],"table":{"3":[150,1,0]},"off":[99,0,0]}},"locks":[],"sting":"ajq_mirrorstinger","start":{"puz02start2":[10,1,0],"puz02beam04":[99,0,0],"puz02c":[2,1,0],"puz02beam05":[99,0,0],"puz02d":[1,1,0],"puz02beam06":[99,0,0],"puz02e":[3,1,0],"puz02beam07":[99,0,0],"puz02end1":[0,1,1],"puz02frame1r":[0,1,1],"puz02start1":[0,1,0],"puz02beam08":[99,0,0],"puz02f":[2,1,0],"puz02beam09":[99,0,0],"puz02end4":[0,1,1],"puz02end4n5":[0,1,1],"puz02frame2l":[0,1,1],"puz02beam01":[99,0,0],"puz02a":[1,1,0],"puz02beam02":[99,0,0],"puz02b":[3,1,0],"puz02beam03":[99,0,0],"puz02end2":[0,1,1],"puz02frame1l":[0,1,1],"puz02door1":[0,1,1],"puz02block1":[0,1,1],"puz02start3":[2,1,0],"puz02beam18":[99,0,0],"puz02n":[2,1,0],"puz02beam19":[99,0,0],"puz02end3":[0,1,1],"puz02frame2r":[0,1,1],"puz02beam10":[99,0,0],"puz02g":[3,1,0],"puz02beam11":[99,0,0],"puz02h":[1,1,0],"puz02beam12":[99,0,0],"puz02i":[2,1,0],"puz02beam13":[99,0,0],"puz02j":[0,1,0],"puz02beam14":[99,0,0],"puz02k":[2,1,0],"puz02beam15":[99,0,0],"puz02l":[3,1,0],"puz02beam16":[99,0,0],"puz02m":[1,1,0],"puz02beam17":[99,0,0],"puz02end5":[0,1,1],"puz02end5x":[0,0,1],"puz02door2":[0,1,1],"puz02block2":[0,1,1]},"lit0":{"puz02start2":2,"puz02start1":0,"puz02start3":0}},{"name":"puz03","mirrors":{"trig03a":{"mirror":"puz03start","init":1,"vc":[1,0],"turn":[{"a":"set","name":"trig03a","state":2,"visible":1,"click":1},{"a":"set","name":"trig03a","state":1,"visible":1,"click":1}],"lit":{"by":[],"table":{"":1}}},"trig03e":{"mirror":"puz03f","init":1,"vc":[1,0],"turn":[{"a":"set","name":"trig03e","state":2,"visible":1,"click":1},{"a":"set","name":"trig03e","state":1,"visible":1,"click":1}],"lit":{"by":["puz03start","puz03f","puz03b"],"table":{"0,1,3":1,"0,2,3":1,"0,1,2":1,"0,0,2":1}}},"trig03d":{"mirror":"puz03e","init":3,"vc":[1,0],"turn":[{"a":"set","name":"trig03d","state":2,"visible":1,"click":1},{"a":"set","name":"trig03d","state":1,"visible":1,"click":1}],"lit":{"by":["puz03start","puz03f","puz03e","puz03d","puz03b","puz03g","puz03i","puz03k"],"table":{"0,1,3,0,3,3,1,3":1,"0,1,2,0,3,3,1,3":1,"0,1,2,1,3,3,1,3":1,"0,1,2,2,3,3,1,3":1,"0,1,2,3,3,3,1,3":1,"0,1,2,3,2,3,1,3":1,"0,2,2,3,2,3,1,3":1,"0,3,2,3,2,3,1,3":1,"0,0,2,3,2,3,1,3":1,"0,0,2,3,2,0,1,3":1,"0,0,2,3,2,1,1,3":1,"0,0,2,3,2,2,1,3":1,"0,0,2,3,2,2,2,3":1,"0,0,2,3,2,2,3,3":1,"0,0,2,3,2,2,0,3":1,"0,0,2,3,2,2,0,0":1,"0,0,2,3,2,2,0,1":1,"0,0,2,3,2,2,0,2":1}}},"trig03c":{"mirror":"puz03d","init":0,"vc":[1,0],"turn":[{"a":"set","name":"trig03c","state":2,"visible":1,"click":1},{"a":"set","name":"trig03c","state":1,"visible":1,"click":1}],"lit":{"by":["puz03e","puz03d","puz03b"],"table":{"2,0,3":1,"2,3,3":1,"2,3,2":1}}},"trig03b":{"mirror":"puz03b","init":3,"vc":[1,0],"turn":[{"a":"set","name":"trig03b","state":2,"visible":1,"click":1},{"a":"set","name":"trig03b","state":1,"visible":1,"click":1}],"lit":{"by":["puz03start","puz03b"],"table":{"0,3":1,"0,2":1}}},"trig03f":{"mirror":"puz03g","init":3,"vc":[1,0],"turn":[{"a":"set","name":"trig03f","state":2,"visible":1,"click":1},{"a":"set","name":"trig03f","state":1,"visible":1,"click":1}],"lit":{"by":["puz03g"],"table":{"1":1,"2":1}}},"trig03g":{"mirror":"puz03i","init":1,"vc":[1,0],"turn":[{"a":"set","name":"trig03g","state":2,"visible":1,"click":1},{"a":"set","name":"trig03g","state":1,"visible":1,"click":1}],"lit":{"by":["puz03i"],"table":{"0":1,"3":1}}},"trig03h":{"mirror":"puz03k","init":3,"vc":[1,0],"turn":[{"a":"set","name":"trig03h","state":2,"visible":1,"click":1},{"a":"set","name":"trig03h","state":1,"visible":1,"click":1}],"lit":{"by":["puz03k"],"table":{"1":1,"2":1}}}},"goals":[{"solved":{"puz03start":0,"puz03f":0,"puz03e":2,"puz03d":3,"puz03b":2,"puz03g":2,"puz03i":0,"puz03k":2}}],"beams":{"puz03beam01":{"by":["puz03start"],"table":{"0":[1,1,0]},"off":[99,0,0]},"puz03a":{"by":["puz03start"],"table":{"0":[5,1,0]},"off":[1,1,0]},"puz03beam02":{"by":["puz03start"],"table":{"0":[1,1,0]},"off":[99,0,0]},"puz03beam13":{"by":["puz03start","puz03b"],"table":{"0,3":[1,1,0]},"off":[99,0,0]},"puz03beam06":{"by":["puz03start","puz03f","puz03b"],"table":{"0,1,3":[80,1,0],"0,1,2":[80,1,0],"0,2,2":[80,1,0],"0,3,2":[80,1,0],"0,0,2":[80,1,0]},"off":[99,0,0]},"puz03beam05":{"by":["puz03e","puz03b"],"table":{"2,3":[80,1,0],"2,2":[80,1,0]},"off":[99,0,0]},"puz03beam04":{"by":["puz03d","puz03b"],"table":{"3,3":[70,1,0],"3,2":[70,1,0]},"off":[99,0,0]},"puz03c":{"by":["puz03d","puz03b"],"table":{"3,3":[4,1,0],"3,2":[4,1,0]},"off":[0,1,0]},"puz03beam03":{"by":["puz03d","puz03b"],"table":{"3,3":[1,1,0],"3,2":[1,1,0]},"off":[99,0,0]},"puz03beam07":{"by":["puz03f","puz03e"],"table":{"0,2":[1,1,0]},"off":[99,0,0]},"puz03beam08":{"by":["puz03g"],"table":{"2":[320,1,0]},"off":[99,0,0]},"puz03h":{"by":["puz03g"],"table":{"2":[5,1,0]},"off":[1,1,0]},"puz03beam09":{"by":["puz03g"],"table":{"2":[1,1,0]},"off":[99,0,0]},"puz03beam10":{"by":["puz03i"],"table":{"0":[90,1,0]},"off":[99,0,0]},"puz03j":{"by":["puz03i"],"table":{"0":[7,1,0]},"off":[3,1,0]},"puz03beam11":{"by":["puz03i"],"table":{"0":[90,1,0]},"off":[99,0,0]}},"locks":[],"sting":"ajq_mirrorstinger","start":{"puz03start":[9,1,0],"puz03beam01":[99,0,0],"puz03a":[1,1,0],"puz03beam02":[99,0,0],"puz03b":[3,1,0],"puz03beam13":[99,0,0],"puz03f":[1,1,0],"puz03beam06":[99,0,0],"puz03e":[3,1,0],"puz03beam05":[99,0,0],"puz03d":[0,1,0],"puz03beam04":[99,0,0],"puz03c":[0,1,0],"puz03beam03":[99,0,0],"puz03beam07":[99,0,0],"puz03g":[3,1,0],"puz03beam08":[99,0,0],"puz03h":[1,1,0],"puz03beam09":[99,0,0],"puz03i":[1,1,0],"puz03beam10":[99,0,0],"puz03j":[3,1,0],"puz03beam11":[99,0,0],"puz03k":[3,1,0],"puz03end":[0,1,1],"puz03door":[0,1,1],"puz03frame":[0,1,1],"puz03beam12":[99,0,0],"puz03block":[0,1,1]},"lit0":{"puz03start":2,"puz03f":0,"puz03e":0,"puz03d":0,"puz03b":0,"puz03g":0,"puz03i":0,"puz03k":0}},{"name":"puz04","mirrors":{"trig04b":{"mirror":"puz04start2","init":1,"vc":[1,0],"turn":[{"a":"set","name":"trig04b","state":2,"visible":1,"click":1},{"a":"set","name":"trig04b","state":1,"visible":1,"click":1}],"lit":{"by":[],"table":{"":1}}},"trig04a":{"mirror":"puz04start1","init":2,"vc":[1,0],"turn":[{"a":"set","name":"trig04a","state":2,"visible":1,"click":1},{"a":"set","name":"trig04a","state":1,"visible":1,"click":1}],"lit":{"by":["puz04start1"],"table":{"0":1,"1":1,"3":1}}}},"goals":[{"solved":{"puz04start2":0,"puz04start1":1}}],"beams":{"puz04beam01":{"by":["puz04start1"],"table":{"1":[90,1,0]},"off":[99,0,0]},"puz04a":{"by":["puz04start1"],"table":{"1":[7,1,0]},"off":[3,1,0]},"puz04beam02":{"by":["puz04start1"],"table":{"1":[1,1,0]},"off":[99,0,0]},"puz04b":{"by":["puz04start1"],"table":{"1":[6,1,0]},"off":[2,1,0]},"puz04beam03":{"by":["puz04start1"],"table":{"1":[450,1,0]},"off":[99,0,0]},"puz04end1":{"by":["puz04start1"],"table":{"1":[1,1,0]},"off":[0,1,1]},"puz04frame_l":{"by":["puz04start1"],"table":{"1":[2,1,0]},"off":[0,1,1]}},"locks":[],"sting":"ajq_mirrorstinger","start":{"puz04start2":[9,1,0],"puz04start1":[2,1,0],"puz04beam01":[99,0,0],"puz04a":[3,1,0],"puz04beam02":[99,0,0],"puz04b":[2,1,0],"puz04beam03":[99,0,0],"puz04end1":[0,1,1],"puz04frame_l":[0,1,1],"puz04beam04":[99,0,0],"puz04c":[2,1,0],"puz04beam05":[99,0,0],"puz04d":[0,1,0],"puz04beam06":[99,0,0],"puz04e":[1,1,0],"puz04beam07":[99,0,0],"puz04f":[2,1,0],"puz04beam08":[99,0,0],"puz04g":[3,1,0],"puz04beam09":[99,0,0],"puz04h":[0,1,0],"puz04beam10":[99,0,0],"puz04i":[2,1,0],"puz04end2":[0,1,1],"puz04frame_r":[0,1,1],"puz04door":[0,1,1],"puz04block":[0,1,1]},"lit0":{"puz04start2":2,"puz04start1":0}}];
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
const SPAWNERS = {"factory10":[11,2],"factory01":[11,2],"factory02":[11,2],"factory03":[11,2],"factory04":[11,2],"factory05":[11,2],"factory06":[11,2],"factory07":[11,2]};
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
  if (key === "lavacount 1") {
    q.send("qcmdVT", 1, "20_uri", 1, 0, 0);
    q.send("qposturi", "/adventure6-greelysinferno/#20-foundfirstalphastone/#0#001");
    q.send("qcmdVT", 1, "20_uri", 99, 0, 0);
    q.send("qcmd", 38, 10913);
    q.send("qcmd", 38, 10913);
  }
  if (key === "lavacount 2") {
    q.send("qcmdVT", 1, "30_uri", 1, 0, 0);
    q.send("qposturi", "/adventure6-greelysinferno/#30-foundsecondalphastone/#0#001");
    q.send("qcmdVT", 1, "30_uri", 99, 0, 0);
    q.send("qcmd", 38, 10914);
    q.send("qcmd", 38, 10914);
  }
  if (key === "lavacount 3") {
    q.send("qcmdVT", 1, "40_uri", 1, 0, 0);
    q.send("qposturi", "/adventure6-greelysinferno/#40-foundthirdalphastone/#0#001");
    q.send("qcmdVT", 1, "40_uri", 99, 0, 0);
    q.send("qcmd", 38, 10915);
    q.send("qcmd", 38, 10915);
  }
  if (key === "lavacount 4") {
    q.send("qcmdVT", 1, "50_uri", 1, 0, 0);
    q.send("qposturi", "/adventure6-greelysinferno/#50-gatherthealphastones/#0#001");
    q.send("qcmdVT", 1, "50_uri", 99, 0, 0);
    q.send("qcmd", 38, 10916);
    q.xp(25, "lavacount");
    set(q, "lavadone", 1, 1, 0);
    q.send("qsnd", "ajq_firedoor");
    q.send("qcmd", 38, 10916);
    q.xp(25, "lavacount");
    q.send("qsnd", "ajq_firedoor");
    set(q, "lavablock", 99, 0, 0);
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

module.exports = {
  defId: 17,
  title: "Greely's Inferno",
  rooms: {
    start: {room: "adventures.room_adventure_6a", name: "Adventure Tutorial", nameStringId: 18326, music: "ajq_musvolout"},
    in6b1: {room: "adventures.room_adventure_6b", name: "Adventure Tutorial", nameStringId: 18326, music: "ajq_musvolin"},
    in6c1: {room: "adventures.room_adventure_6c", name: "Adventure Tutorial", nameStringId: 18326, music: ""},
    in6b3: {room: "adventures.room_adventure_6b", name: "Adventure Tutorial", nameStringId: 18326, music: ""},
    in6d: {room: "adventures.room_adventure_6d", name: "Adventure Tutorial", nameStringId: 18326, music: ""},
    in6e: {room: "adventures.room_adventure_6e", name: "Adventure Tutorial", nameStringId: 18326, music: ""},
    in6f: {room: "adventures.room_adventure_6f", name: "Adventure Tutorial", nameStringId: 18326, music: "0"},
  },
  written: "2026-11-11 18:10:21",
  objective: 10907,
  lobby: true, // the "waiting for players" screen first, as on the official server

  // name, type, def, state, visible, needs a click, path, artwork state
  actors: [
    ["queststart", 18, 0, 0, 1, 1, "", ""],
    ["players", 7, 0, 0, 1, 1, "", ""],
    ["00_uri", 7, 0, 0, 0, 1, "", ""],
    ["cp4", 27, 0, 0, 1, 1, "", ""],
    ["to6b2", 3, 0, 0, 1, 1, "", ""],
    ["to6b3", 3, 0, 0, 1, 1, "", ""],
    ["to6c1", 3, 0, 0, 1, 1, "", ""],
    ["to6c2", 3, 0, 0, 1, 1, "", ""],
    ["to6b1", 3, 0, 0, 1, 1, "", ""],
    ["to6a", 3, 0, 0, 1, 1, "", ""],
    ["to6f", 3, 0, 0, 0, 1, "", ""],
    ["enterboss", 3, 0, 0, 1, 1, "", ""],
    ["playendswf", 3, 0, 0, 1, 1, "", ""],
    ["in6a", 9, 0, 0, 1, 1, "", ""],
    ["in6b1", 9, 1, 0, 1, 1, "", ""],
    ["in6b2", 9, 1, 0, 1, 1, "", ""],
    ["in6b3", 9, 1, 0, 1, 1, "", ""],
    ["in6c1", 9, 2, 0, 1, 1, "", ""],
    ["in6c2", 9, 2, 0, 1, 1, "", ""],
    ["in6d", 9, 3, 0, 1, 1, "", ""],
    ["in6e", 9, 4, 0, 1, 1, "", ""],
    ["in6f", 9, 5, 0, 1, 1, "", ""],
    ["startcosmo1", 3, 0, 0, 1, 1, "", ""],
    ["cosmo1", 1, 25, 0, 0, 1, "", ""],
    ["cosmo1x", 1, 25, 0, 0, 1, "", ""],
    ["swf_var", 7, 0, 0, 1, 1, "", ""],
    ["swfpause", 8, 0, 0, 0, 1, "", ""],
    ["cosmo1wait", 8, 0, 0, 0, 1, "", ""],
    ["cosmo2", 1, 25, 0, 0, 1, "", ""],
    ["80_uri", 7, 0, 0, 0, 1, "", ""],
    ["graham1on", 3, 0, 0, 1, 1, "", ""],
    ["graham1", 1, 23, 0, 0, 1, "", ""],
    ["graham1x", 1, 23, 0, 0, 1, "", ""],
    ["givegear", 3, 0, 0, 0, 1, "", ""],
    ["graham2", 1, 23, 0, 0, 1, "", ""],
    ["greely1", 1, 22, 0, 0, 1, "", ""],
    ["60_uri", 7, 0, 0, 0, 1, "", ""],
    ["greely2", 1, 22, 0, 0, 1, "", ""],
    ["greely2x", 1, 22, 0, 0, 1, "", ""],
    ["greelymajik1", 16, "ajq_greelymagicorb_lp", 0, 0, 1, "", ""],
    ["greelymajik2", 16, "ajq_greelymagicorb_lp", 0, 0, 1, "", ""],
    ["greelyshake", 8, 0, 0, 0, 1, "", ""],
    ["liza1", 1, 21, 0, 0, 1, "", ""],
    ["phantomvol01", 26, 0, 0, 0, 1, "", ""],
    ["phantvol01h", 26, 0, 0, 0, 1, "", ""],
    ["phantomvol02", 26, 0, 0, 0, 1, "", ""],
    ["phantvol02h", 26, 0, 0, 0, 1, "", ""],
    ["phantomvol03", 26, 0, 0, 0, 1, "", ""],
    ["phantomvol04", 26, 0, 0, 0, 1, "", ""],
    ["phantomvol05", 26, 0, 0, 0, 1, "", ""],
    ["phantvol05h", 26, 0, 0, 0, 1, "", ""],
    ["avatartile1", 2, 0, 0, 1, 1, "", ""],
    ["avatartile2", 2, 0, 0, 1, 1, "", ""],
    ["pillar1", 2, 0, 0, 1, 1, "", ""],
    ["pillar2", 2, 0, 0, 1, 1, "", ""],
    ["avatarblock1", 5, 0, 0, 1, 1, "", ""],
    ["avatarblock2", 5, 0, 0, 1, 1, "", ""],
    ["avatar1a", 1, 44, 0, 1, 1, "", ""],
    ["avatar1b", 1, 44, 0, 1, 1, "", ""],
    ["avatar1c", 1, 44, 0, 1, 1, "", ""],
    ["avatar1d", 1, 44, 0, 1, 1, "", ""],
    ["avatar1e", 1, 44, 0, 1, 1, "", ""],
    ["treasure_a1", 13, 39, 0, 1, 1, "", ""],
    ["treasure_a2", 13, 39, 0, 1, 1, "", ""],
    ["treasure0", 13, 39, 0, 1, 1, "", ""],
    ["treasure01", 13, 39, 0, 1, 1, "", ""],
    ["treasure02", 13, 39, 0, 1, 1, "", ""],
    ["treasure03", 13, 39, 0, 1, 1, "", ""],
    ["treasure04", 13, 39, 0, 0, 1, "", ""],
    ["treasure05", 13, 39, 0, 0, 1, "", ""],
    ["treasure06", 13, 39, 0, 1, 1, "", ""],
    ["treasure07", 13, 39, 0, 1, 1, "", ""],
    ["treasure08", 13, 39, 0, 1, 1, "", ""],
    ["avatar1", 1, 48, 0, 1, 1, "", ""],
    ["avatar2", 1, 45, 0, 1, 1, "", ""],
    ["blocktimer1", 8, 0, 0, 0, 1, "", ""],
    ["blocktimer2", 8, 0, 0, 0, 1, "", ""],
    ["givetorch", 1, 134, 0, 1, 1, "", ""],
    ["greelymouth", 2, 0, 0, 1, 1, "", ""],
    ["back26b", 3, 0, 0, 1, 1, "", ""],
    ["back26b2", 3, 0, 0, 1, 1, "", ""],
    ["shaketimer", 8, 0, 0, 0, 1, "", ""],
    ["lavahurt01", 14, 2, 0, 0, 1, "", ""],
    ["lavahurt02", 14, 2, 0, 0, 1, "", ""],
    ["lavacrack01", 2, 0, 0, 1, 1, "", ""],
    ["lavacrack02", 2, 0, 0, 1, 1, "", ""],
    ["lavatoggle", 8, 0, 0, 0, 1, "", ""],
    ["lavastart", 3, 0, 0, 1, 1, "", ""],
    ["lavasound1", 16, "ajq_lavaplatforms", 0, 0, 1, "", ""],
    ["lavasound2", 16, "ajq_lavaplatforms", 0, 0, 1, "", ""],
    ["lavasound3", 16, "ajq_lavaplatforms", 0, 0, 1, "", ""],
    ["lavasound4", 16, "ajq_lavaplatforms", 0, 0, 1, "", ""],
    ["factory01", 12, 72, 0, 1, 1, "", ""],
    ["factory02", 12, 72, 0, 1, 1, "", ""],
    ["factory03", 12, 72, 0, 1, 1, "", ""],
    ["factory04", 12, 72, 0, 1, 1, "", ""],
    ["factory05", 12, 72, 0, 1, 1, "", ""],
    ["factory06", 12, 72, 0, 1, 1, "", ""],
    ["factory07", 12, 72, 0, 1, 1, "", ""],
    ["factory09", 12, 72, 0, 1, 1, "", ""],
    ["factory10", 12, 72, 0, 1, 1, "", ""],
    ["factory11h", 12, 72, 0, 1, 1, "", ""],
    ["factblok01", 5, 0, 0, 1, 1, "", ""],
    ["factblok02", 5, 0, 0, 1, 1, "", ""],
    ["factblok03", 5, 0, 0, 1, 1, "", ""],
    ["factblok04", 5, 0, 0, 1, 1, "", ""],
    ["factblok05", 5, 0, 0, 1, 1, "", ""],
    ["factblok06", 5, 0, 0, 1, 1, "", ""],
    ["factblok07", 5, 0, 0, 1, 1, "", ""],
    ["factblok09", 5, 0, 0, 1, 1, "", ""],
    ["factblok10", 5, 0, 0, 1, 1, "", ""],
    ["factblok11", 5, 0, 0, 1, 1, "", ""],
    ["locategems", 3, 0, 0, 1, 1, "", ""],
    ["boomrock1", 11, 169, 0, 1, 1, "", ""],
    ["boomrock2", 11, 169, 0, 1, 1, "", ""],
    ["rockblock01", 5, 0, 0, 1, 1, "", ""],
    ["rockblock02", 5, 0, 0, 1, 1, "", ""],
    ["pipetrig03", 1, 69, 0, 1, 1, "", ""],
    ["pipetrig04", 1, 69, 0, 1, 1, "", ""],
    ["pipetrig01", 1, 69, 0, 1, 1, "", ""],
    ["pipetrig02", 1, 69, 0, 1, 1, "", ""],
    ["pipetrig05", 1, 69, 0, 1, 1, "", ""],
    ["pipetrig06", 1, 69, 0, 1, 1, "", ""],
    ["pipetrig07", 1, 69, 0, 1, 1, "", ""],
    ["pipetrig08", 1, 69, 0, 1, 1, "", ""],
    ["pipetrig09", 1, 69, 0, 1, 1, "", ""],
    ["pipecount", 1, 44, 0, 0, 1, "", ""],
    ["greelyshow", 3, 0, 0, 0, 1, "", ""],
    ["sludge01", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge02", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge03", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge04", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge05", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge06", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge07", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge08", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["sludge09", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["greelysludge", 16, "ajq_sludge_lp", 0, 1, 1, "", ""],
    ["pipeinfo01", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo02", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo03", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo04", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo05", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo06", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo07", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo08", 1, 116, 0, 0, 1, "", ""],
    ["pipeinfo09", 1, 116, 0, 0, 1, "", ""],
    ["pipe01", 2, 0, 0, 1, 1, "", ""],
    ["pipe02", 2, 0, 0, 1, 1, "", ""],
    ["pipe03", 2, 0, 0, 1, 1, "", ""],
    ["pipe04", 2, 0, 0, 1, 1, "", ""],
    ["pipe05", 2, 0, 0, 1, 1, "", ""],
    ["pipe06", 2, 0, 0, 1, 1, "", ""],
    ["pipe07", 2, 0, 0, 1, 1, "", ""],
    ["pipe08", 2, 0, 0, 1, 1, "", ""],
    ["pipe09", 2, 0, 0, 1, 1, "", ""],
    ["cork01", 15, 1937, 0, 1, 1, "", ""],
    ["cork02", 15, 1937, 0, 1, 1, "", ""],
    ["cork03", 15, 1937, 0, 0, 1, "", ""],
    ["cork04", 15, 1937, 0, 0, 1, "", ""],
    ["cork05", 15, 1937, 0, 0, 1, "", ""],
    ["cork06", 15, 1937, 0, 0, 1, "", ""],
    ["cork07", 15, 1937, 0, 0, 1, "", ""],
    ["cork08", 15, 1937, 0, 0, 1, "", ""],
    ["cork09", 15, 1937, 0, 0, 1, "", ""],
    ["lavatrig1", 1, 87, 0, 1, 1, "", ""],
    ["lavatrig2", 1, 87, 0, 1, 1, "", ""],
    ["lavatrig3", 1, 87, 0, 1, 1, "", ""],
    ["lavatrig4", 1, 87, 0, 1, 1, "", ""],
    ["lavacount", 7, 0, 0, 0, 1, "", ""],
    ["20_uri", 7, 0, 0, 0, 1, "", ""],
    ["30_uri", 7, 0, 0, 0, 1, "", ""],
    ["40_uri", 7, 0, 0, 0, 1, "", ""],
    ["50_uri", 7, 0, 0, 0, 1, "", ""],
    ["lavapause", 8, 0, 0, 0, 1, "", ""],
    ["lavainfo1", 1, 116, 0, 1, 1, "", ""],
    ["lavainfo2", 1, 116, 0, 1, 1, "", ""],
    ["lavainfo3", 1, 116, 0, 1, 1, "", ""],
    ["lavainfo4", 1, 116, 0, 1, 1, "", ""],
    ["gem1", 15, 2105, 0, 1, 1, "", ""],
    ["gem2", 15, 2105, 0, 1, 1, "", ""],
    ["gem3", 15, 2105, 0, 1, 1, "", ""],
    ["gem4", 15, 2105, 0, 1, 1, "", ""],
    ["switch01t", 2, 0, 0, 1, 1, "", ""],
    ["switch02t", 2, 0, 0, 1, 1, "", ""],
    ["switch03t", 2, 0, 0, 1, 1, "", ""],
    ["switch04t", 2, 0, 0, 1, 1, "", ""],
    ["switch05t", 2, 0, 0, 1, 1, "", ""],
    ["switch06t", 2, 0, 0, 1, 1, "", ""],
    ["switch07t", 2, 0, 0, 1, 1, "", ""],
    ["switch08t", 2, 0, 0, 1, 1, "", ""],
    ["switch01", 1, 134, 0, 1, 1, "", ""],
    ["switch02", 1, 134, 0, 1, 1, "", ""],
    ["switch03", 1, 134, 0, 1, 1, "", ""],
    ["switch04", 1, 134, 0, 1, 1, "", ""],
    ["switch05", 1, 134, 0, 1, 1, "", ""],
    ["switch06", 1, 134, 0, 1, 1, "", ""],
    ["switch07", 1, 134, 0, 1, 1, "", ""],
    ["switch08", 1, 134, 0, 1, 1, "", ""],
    ["switchwait01", 8, 0, 0, 0, 1, "", ""],
    ["switchwait02", 8, 0, 0, 0, 1, "", ""],
    ["switchwait03", 8, 0, 0, 0, 1, "", ""],
    ["switchwait04", 8, 0, 0, 0, 1, "", ""],
    ["switchwait05", 8, 0, 0, 0, 1, "", ""],
    ["switchwait06", 8, 0, 0, 0, 1, "", ""],
    ["switchwait07", 8, 0, 0, 0, 1, "", ""],
    ["switchwait08", 8, 0, 0, 0, 1, "", ""],
    ["hard", 2, 0, 0, 1, 1, "", ""],
    ["easy", 2, 0, 0, 1, 1, "", ""],
    ["bridge01", 2, 0, 0, 1, 1, "", ""],
    ["bridge02", 2, 0, 0, 1, 1, "", ""],
    ["brazier01t", 2, 0, 0, 1, 1, "", ""],
    ["brazier02t", 2, 0, 0, 1, 1, "", ""],
    ["lavaline1", 2, 0, 0, 1, 1, "", ""],
    ["lavaline2", 2, 0, 0, 1, 1, "", ""],
    ["lavaline3", 2, 0, 0, 1, 1, "", ""],
    ["lavaline4", 2, 0, 0, 1, 1, "", ""],
    ["lavadone", 2, 0, 0, 1, 1, "", ""],
    ["lavablock", 5, 0, 0, 1, 1, "", ""],
    ["torch01lite", 1, 116, 0, 1, 1, "", ""],
    ["torch01", 17, 2045, 0, 1, 1, "", ""],
    ["braziercount", 7, 0, 0, 0, 1, "", ""],
    ["brazier01", 1, 86, 0, 1, 1, "", ""],
    ["brazier02", 1, 86, 0, 1, 1, "", ""],
    ["bridge01wait", 8, 0, 0, 0, 1, "", ""],
    ["bridge02wait", 8, 0, 0, 0, 1, "", ""],
    ["brazier01l", 1, 116, 0, 1, 1, "", ""],
    ["brazier02l", 1, 116, 0, 1, 1, "", ""],
    ["easyblock", 5, 0, 0, 1, 1, "", ""],
    ["kingblock", 5, 0, 0, 1, 1, "", ""],
    ["bridge01blok", 5, 0, 0, 1, 1, "", ""],
    ["bridge02blok", 5, 0, 0, 1, 1, "", ""],
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
    ["pipeblock01", 5, 0, 0, 1, 1, "", ""],
    ["pipeblock02", 5, 0, 0, 1, 1, "", ""],
    ["pipeblock05", 5, 0, 0, 1, 1, "", ""],
    ["pipeblock06", 5, 0, 0, 1, 1, "", ""],
    ["pipeblock07", 5, 0, 0, 1, 1, "", ""],
    ["pipeblock08", 5, 0, 0, 1, 1, "", ""],
    ["pipeblock09", 5, 0, 0, 1, 1, "", ""],
    ["hardsecret", 5, 0, 0, 1, 1, "", ""],
    ["seedgiveoff", 8, 0, 0, 0, 1, "", ""],
    ["seedgive", 3, 0, 0, 0, 1, "", ""],
    ["seedpile00", 1, 134, 0, 1, 1, "", ""],
    ["seedpile01", 1, 134, 0, 1, 1, "", ""],
    ["seedpile02", 1, 134, 0, 1, 1, "", ""],
    ["seedpile03", 1, 134, 0, 1, 1, "", ""],
    ["seedpile04", 1, 134, 0, 1, 1, "", ""],
    ["seedpile05", 1, 134, 0, 1, 1, "", ""],
    ["seedpile11", 1, 134, 0, 1, 1, "", ""],
    ["seedpile13", 1, 134, 0, 1, 1, "", ""],
    ["seedpile14", 1, 134, 0, 1, 1, "", ""],
    ["seedpile16", 1, 134, 0, 1, 1, "", ""],
    ["seedpile19", 1, 134, 0, 1, 1, "", ""],
    ["seedpile20", 1, 134, 0, 1, 1, "", ""],
    ["seedpile17", 1, 134, 0, 1, 1, "", ""],
    ["seedpile18", 1, 134, 0, 1, 1, "", ""],
    ["seedtimer17", 8, 0, 0, 0, 1, "", ""],
    ["seedtimer18", 8, 0, 0, 0, 1, "", ""],
    ["phantomfall1", 3, 0, 0, 1, 1, "", ""],
    ["phanttrig", 3, 0, 0, 1, 1, "", ""],
    ["phantom02d", 11, 2, 0, 1, 1, "path02d", ""],
    ["phantom05a", 11, 2, 0, 1, 1, "path05a", ""],
    ["phantom05b", 11, 2, 0, 1, 1, "path05b", ""],
    ["phantom05c", 11, 2, 0, 1, 1, "path05c", ""],
    ["phantom__06a", 11, 2, 0, 1, 1, "path06", ""],
    ["phantom__06b", 11, 2, 0, 1, 1, "path06", ""],
    ["phantom08c", 11, 2, 0, 1, 1, "path08c", ""],
    ["phantom__09a", 11, 2, 0, 1, 1, "path09", ""],
    ["phantom__09b", 11, 2, 0, 1, 1, "path09", ""],
    ["phantom00a", 11, 2, 0, 1, 1, "path00a", ""],
    ["phantom00b", 11, 2, 0, 1, 1, "path00b", ""],
    ["phantom00c", 11, 2, 0, 1, 1, "path00c", ""],
    ["phantom00d", 11, 2, 0, 1, 1, "path00d", ""],
    ["phantom00e", 11, 2, 0, 1, 1, "path00e", ""],
    ["phantom00f", 11, 2, 0, 1, 1, "path00f", ""],
    ["phantom00g", 11, 2, 0, 1, 1, "path00g", ""],
    ["phantom00h", 11, 2, 0, 1, 1, "path00h", ""],
    ["phantom__00i", 11, 2, 0, 1, 1, "path00i", ""],
    ["phantom00j", 11, 2, 0, 1, 1, "path00j", ""],
    ["phantom__00k", 11, 2, 0, 1, 1, "path00i", ""],
    ["phantom__00l", 11, 2, 0, 1, 1, "path00i", ""],
    ["phantom00n", 11, 2, 0, 1, 1, "path00n", ""],
    ["phantom00o", 11, 2, 0, 1, 1, "path00o", ""],
    ["phantom00p", 11, 2, 0, 1, 1, "path00p", ""],
    ["phantom00q", 11, 2, 0, 1, 1, "path00q", ""],
    ["phantom00r", 11, 2, 0, 1, 1, "path00r", ""],
    ["phantom12h", 11, 2, 0, 1, 1, "path12", ""],
    ["phantom13h", 11, 2, 0, 1, 1, "path13", ""],
    ["phantom14h", 11, 2, 0, 1, 1, "path14", ""],
    ["phantom15h", 11, 2, 0, 1, 1, "path15", ""],
    ["phantom16h", 11, 2, 0, 1, 1, "path16", ""],
    ["phantom__17h", 11, 2, 0, 1, 1, "path06", ""],
    ["phantom__18h", 11, 2, 0, 1, 1, "path06", ""],
    ["phantom19h", 11, 2, 0, 1, 1, "path19", ""],
    ["phantom20h", 11, 2, 0, 1, 1, "path20", ""],
    ["phantom21h", 11, 2, 0, 1, 1, "path21", ""],
    ["phantom22h", 11, 2, 0, 1, 1, "path22", ""],
    ["phantom01a", 11, 2, 0, 0, 1, "", ""],
    ["phantom01b", 11, 2, 0, 0, 1, "", ""],
    ["phantom__04a", 11, 2, 0, 0, 1, "", ""],
    ["phantom__04b", 11, 2, 0, 0, 1, "", ""],
    ["phantom__04c", 11, 2, 0, 0, 1, "", ""],
    ["phantom__04d", 11, 2, 0, 0, 1, "", ""],
    ["phantom11a", 11, 2, 0, 0, 1, "", ""],
    ["phantom11b", 11, 2, 0, 0, 1, "", ""],
    ["phantom11c", 11, 2, 0, 0, 1, "", ""],
    ["phantom__23h", 11, 2, 0, 0, 1, "", ""],
    ["phantom03a", 11, 2, 0, 1, 1, "path03a", ""],
    ["phantom03b", 11, 2, 0, 1, 1, "path03b", ""],
    ["phantom03c", 11, 2, 0, 1, 1, "path03c", ""],
    ["phantom02a", 11, 2, 0, 1, 1, "path02a", ""],
    ["phantom02b", 11, 2, 0, 1, 1, "path02b", ""],
    ["phantom02c", 11, 2, 0, 1, 1, "path02c", ""],
    ["phantom08a", 11, 2, 0, 1, 1, "path08a", ""],
    ["phantom08b", 11, 2, 0, 1, 1, "path08b", ""],
    ["phantom__10a", 11, 2, 0, 0, 1, "", ""],
    ["phantom__10b", 11, 2, 0, 0, 1, "", ""],
    ["path00a", 20, 0, 0, 1, 1, "", ""],
    ["path00b", 20, 0, 0, 1, 1, "", ""],
    ["path00c", 20, 0, 0, 1, 1, "", ""],
    ["path00d", 20, 0, 0, 1, 1, "", ""],
    ["path00e", 20, 0, 0, 1, 1, "", ""],
    ["path00f", 20, 0, 0, 1, 1, "", ""],
    ["path00g", 20, 0, 0, 1, 1, "", ""],
    ["path00h", 20, 0, 0, 1, 1, "", ""],
    ["path00i", 20, 0, 0, 1, 1, "", ""],
    ["path00j", 20, 0, 0, 1, 1, "", ""],
    ["path00n", 20, 0, 0, 1, 1, "", ""],
    ["path00o", 20, 0, 0, 1, 1, "", ""],
    ["path00p", 20, 0, 0, 1, 1, "", ""],
    ["path00q", 20, 0, 0, 1, 1, "", ""],
    ["path00r", 20, 0, 0, 1, 1, "", ""],
    ["path01a", 20, 0, 0, 1, 1, "", ""],
    ["path01b", 20, 0, 0, 1, 1, "", ""],
    ["path02a", 20, 0, 0, 1, 1, "", ""],
    ["path02b", 20, 0, 0, 1, 1, "", ""],
    ["path02c", 20, 0, 0, 1, 1, "", ""],
    ["path02d", 20, 0, 0, 1, 1, "", ""],
    ["path03a", 20, 0, 0, 1, 1, "", ""],
    ["path03b", 20, 0, 0, 1, 1, "", ""],
    ["path03c", 20, 0, 0, 1, 1, "", ""],
    ["path04a", 20, 0, 0, 1, 1, "", ""],
    ["path04b", 20, 0, 0, 1, 1, "", ""],
    ["path05a", 20, 0, 0, 1, 1, "", ""],
    ["path05b", 20, 0, 0, 1, 1, "", ""],
    ["path05c", 20, 0, 0, 1, 1, "", ""],
    ["path06", 20, 0, 0, 1, 1, "", ""],
    ["path08a", 20, 0, 0, 1, 1, "", ""],
    ["path08b", 20, 0, 0, 1, 1, "", ""],
    ["path08c", 20, 0, 0, 1, 1, "", ""],
    ["path09", 20, 0, 0, 1, 1, "", ""],
    ["path10", 20, 0, 0, 1, 1, "", ""],
    ["path11a", 20, 0, 0, 1, 1, "", ""],
    ["path11b", 20, 0, 0, 1, 1, "", ""],
    ["path11c", 20, 0, 0, 1, 1, "", ""],
    ["path12", 20, 0, 0, 1, 1, "", ""],
    ["path13", 20, 0, 0, 1, 1, "", ""],
    ["path14", 20, 0, 0, 1, 1, "", ""],
    ["path15", 20, 0, 0, 1, 1, "", ""],
    ["path16", 20, 0, 0, 1, 1, "", ""],
    ["path19", 20, 0, 0, 1, 1, "", ""],
    ["path20", 20, 0, 0, 1, 1, "", ""],
    ["path21", 20, 0, 0, 1, 1, "", ""],
    ["path22", 20, 0, 0, 1, 1, "", ""],
    ["secret01", 3, 0, 0, 1, 1, "", ""],
    ["secret02", 3, 0, 0, 1, 1, "", ""],
    ["ambush01vol", 3, 0, 0, 1, 1, "", ""],
    ["ambush02vol", 3, 0, 0, 1, 1, "", ""],
    ["ambush11avol", 3, 0, 0, 1, 1, "", ""],
    ["ambush11bvol", 3, 0, 0, 1, 1, "", ""],
    ["ambush11cvol", 3, 0, 0, 1, 1, "", ""],
    ["gear01sound", 16, "ajq_langearlp", 0, 0, 1, "", ""],
    ["gear02sound1", 16, "ajq_langearlp", 0, 0, 1, "", ""],
    ["gear02sound2", 16, "ajq_langearlp", 0, 0, 1, "", ""],
    ["gear02sound3", 16, "ajq_langearlp", 0, 0, 1, "", ""],
    ["gear03sound", 16, "ajq_langearlp", 0, 0, 1, "", ""],
    ["gear04sound1", 16, "ajq_langearlp", 0, 0, 1, "", ""],
    ["gear04sound2", 16, "ajq_langearlp", 0, 0, 1, "", ""],
    ["chomper01", 21, 100, 0, 1, 1, "", ""],
    ["chomper02", 21, 100, 0, 1, 1, "", ""],
    ["chomper03", 21, 100, 0, 1, 1, "", ""],
    ["chomper04", 21, 100, 0, 1, 1, "", ""],
    ["chomper05", 21, 100, 0, 1, 1, "", ""],
    ["chomper06", 21, 100, 0, 1, 1, "", ""],
    ["chomper07", 21, 100, 0, 1, 1, "", ""],
    ["chomper08", 21, 100, 0, 1, 1, "", ""],
    ["chomper09", 21, 100, 0, 1, 1, "", ""],
    ["chomper10", 21, 100, 0, 1, 1, "", ""],
    ["chomper11", 21, 100, 0, 1, 1, "", ""],
    ["chomper12", 21, 100, 0, 1, 1, "", ""],
    ["chomper13", 21, 100, 0, 1, 1, "", ""],
    ["sentry08", 25, 30, 0, 1, 1, "", ""],
    ["sentry09", 25, 30, 0, 1, 1, "", ""],
    ["sentry10", 25, 30, 0, 1, 1, "", ""],
    ["sentry11", 25, 30, 0, 1, 1, "", ""],
    ["sentry12", 25, 30, 0, 1, 1, "", ""],
    ["sentry13", 25, 30, 0, 1, 1, "", ""],
    ["sentry08h", 25, 30, 0, 1, 1, "", ""],
    ["sentry09h", 25, 30, 0, 1, 1, "", ""],
    ["sentry10h", 25, 30, 0, 1, 1, "", ""],
    ["sentry11h", 25, 30, 0, 1, 1, "", ""],
    ["sentry12h", 25, 30, 0, 1, 1, "", ""],
    ["sentry13h", 25, 30, 0, 1, 1, "", ""],
    ["sentry01", 25, 170, 0, 1, 1, "", ""],
    ["sentry02", 25, 170, 0, 1, 1, "", ""],
    ["sentry03", 25, 170, 0, 1, 1, "", ""],
    ["sentry04", 25, 170, 0, 1, 1, "", ""],
    ["sentry05", 25, 170, 0, 1, 1, "", ""],
    ["sentry06", 25, 170, 0, 1, 1, "", ""],
    ["sentry07", 25, 170, 0, 1, 1, "", ""],
    ["sentry14", 25, 170, 0, 1, 1, "", ""],
    ["sentry15", 25, 170, 0, 1, 1, "", ""],
    ["sentry01h", 25, 170, 0, 1, 1, "", ""],
    ["sentry02h", 25, 170, 0, 1, 1, "", ""],
    ["sentry03h", 25, 170, 0, 1, 1, "", ""],
    ["sentry04h", 25, 170, 0, 1, 1, "", ""],
    ["sentry05h", 25, 170, 0, 1, 1, "", ""],
    ["sentry06h", 25, 170, 0, 1, 1, "", ""],
    ["sentry07h", 25, 170, 0, 1, 1, "", ""],
    ["sentry14h", 25, 170, 0, 1, 1, "", ""],
    ["sentry15h", 25, 170, 0, 1, 1, "", ""],
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
    ["checkpoint00", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["checkpoint01", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["checkpoint02", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["checkpoint03", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["checkpoint04", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["checkpoint05", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["checkpoint06", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["checkpoint07", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["checkpoint08", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["checkpoint09", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["checkpoint10", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["checkpoint11", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["plantvol", 22, 0, 0, 1, 1, "", ""],
    ["6b_init", 3, 0, 0, 1, 1, "", ""],
    ["10_uri", 7, 0, 0, 0, 1, "", ""],
    ["reinit", 7, 0, 0, 1, 1, "", ""],
    ["darklight", 1, 116, 0, 1, 1, "", ""],
    ["init_puzz", 7, 0, 0, 1, 1, "", ""],
    ["init_easy", 7, 0, 0, 1, 1, "", ""],
    ["init_hard", 7, 0, 0, 1, 1, "", ""],
    ["allpuzzoff", 7, 0, 0, 1, 1, "", ""],
    ["gear01trig", 1, 84, 0, 1, 1, "", ""],
    ["gear02trig1", 1, 84, 0, 1, 1, "", ""],
    ["gear02trig3", 1, 84, 0, 1, 1, "", ""],
    ["gear03trig", 1, 84, 0, 1, 1, "", ""],
    ["gear04trig1", 1, 84, 0, 1, 1, "", ""],
    ["gear04trig2", 1, 84, 0, 1, 1, "", ""],
    ["gear02trig2", 1, 84, 0, 1, 1, "", ""],
    ["gear01wait", 8, 0, 0, 0, 1, "", ""],
    ["gear02wait1", 8, 0, 0, 0, 1, "", ""],
    ["gear02wait2", 8, 0, 0, 0, 1, "", ""],
    ["gear02wait3", 8, 0, 0, 0, 1, "", ""],
    ["gear03wait", 8, 0, 0, 0, 1, "", ""],
    ["gear04wait1", 8, 0, 0, 0, 1, "", ""],
    ["gear04wait2", 8, 0, 0, 0, 1, "", ""],
    ["puz01init", 7, 0, 0, 1, 1, "", ""],
    ["puz02init1", 7, 0, 0, 1, 1, "", ""],
    ["puz02init2", 7, 0, 0, 1, 1, "", ""],
    ["puz02init3", 7, 0, 0, 1, 1, "", ""],
    ["puz03init", 7, 0, 0, 1, 1, "", ""],
    ["puz04init1", 7, 0, 0, 1, 1, "", ""],
    ["puz04init2", 7, 0, 0, 1, 1, "", ""],
    ["gear02a", 15, 2066, 0, 0, 1, "", ""],
    ["gear02b", 15, 2066, 0, 0, 1, "", ""],
    ["gear02c", 15, 2066, 0, 0, 1, "", ""],
    ["gear03", 15, 2066, 0, 0, 1, "", ""],
    ["gear04a", 15, 2066, 0, 0, 1, "", ""],
    ["gear04b", 15, 2066, 0, 0, 1, "", ""],
    ["gear01", 17, 2066, 0, 0, 1, "", ""],
    ["gear01info", 1, 116, 0, 0, 1, "", ""],
    ["gear02info1", 1, 116, 0, 0, 1, "", ""],
    ["gear02info2", 1, 116, 0, 0, 1, "", ""],
    ["gear02info3", 1, 116, 0, 0, 1, "", ""],
    ["gear03info", 1, 116, 0, 0, 1, "", ""],
    ["gear04info1", 1, 116, 0, 0, 1, "", ""],
    ["gear04info2", 1, 116, 0, 0, 1, "", ""],
    ["puz01start", 2, 0, 0, 1, 1, "", ""],
    ["puz02start1", 2, 0, 0, 1, 1, "", ""],
    ["puz02start2", 2, 0, 0, 1, 1, "", ""],
    ["puz02start3", 2, 0, 0, 1, 1, "", ""],
    ["puz03start", 2, 0, 0, 1, 1, "", ""],
    ["puz04start1", 2, 0, 0, 1, 1, "", ""],
    ["puz04start2", 2, 0, 0, 1, 1, "", ""],
    ["puz02a", 2, 0, 0, 1, 1, "", ""],
    ["puz02b", 2, 0, 0, 1, 1, "", ""],
    ["puz02c", 2, 0, 0, 1, 1, "", ""],
    ["puz02d", 2, 0, 0, 1, 1, "", ""],
    ["puz02e", 2, 0, 0, 1, 1, "", ""],
    ["puz02f", 2, 0, 0, 1, 1, "", ""],
    ["puz02g", 2, 0, 0, 1, 1, "", ""],
    ["puz02h", 2, 0, 0, 1, 1, "", ""],
    ["puz02i", 2, 0, 0, 1, 1, "", ""],
    ["puz02j", 2, 0, 0, 1, 1, "", ""],
    ["puz02k", 2, 0, 0, 1, 1, "", ""],
    ["puz02l", 2, 0, 0, 1, 1, "", ""],
    ["puz02m", 2, 0, 0, 1, 1, "", ""],
    ["puz02n", 2, 0, 0, 1, 1, "", ""],
    ["puz03a", 2, 0, 0, 1, 1, "", ""],
    ["puz03b", 2, 0, 0, 1, 1, "", ""],
    ["puz03c", 2, 0, 0, 1, 1, "", ""],
    ["puz03d", 2, 0, 0, 1, 1, "", ""],
    ["puz03e", 2, 0, 0, 1, 1, "", ""],
    ["puz03f", 2, 0, 0, 1, 1, "", ""],
    ["puz03g", 2, 0, 0, 1, 1, "", ""],
    ["puz03h", 2, 0, 0, 1, 1, "", ""],
    ["puz03i", 2, 0, 0, 1, 1, "", ""],
    ["puz03j", 2, 0, 0, 1, 1, "", ""],
    ["puz03k", 2, 0, 0, 1, 1, "", ""],
    ["puz04a", 2, 0, 0, 1, 1, "", ""],
    ["puz04b", 2, 0, 0, 1, 1, "", ""],
    ["puz04c", 2, 0, 0, 1, 1, "", ""],
    ["puz04d", 2, 0, 0, 1, 1, "", ""],
    ["puz04e", 2, 0, 0, 1, 1, "", ""],
    ["puz04f", 2, 0, 0, 1, 1, "", ""],
    ["puz04g", 2, 0, 0, 1, 1, "", ""],
    ["puz04h", 2, 0, 0, 1, 1, "", ""],
    ["puz04i", 2, 0, 0, 1, 1, "", ""],
    ["puz06a", 2, 0, 0, 1, 1, "", ""],
    ["puz06b", 2, 0, 0, 1, 1, "", ""],
    ["puz06c", 2, 0, 0, 1, 1, "", ""],
    ["puz06d", 2, 0, 0, 1, 1, "", ""],
    ["puz06e", 2, 0, 0, 1, 1, "", ""],
    ["puz06f", 2, 0, 0, 1, 1, "", ""],
    ["puz06g", 2, 0, 0, 1, 1, "", ""],
    ["puz06h", 2, 0, 0, 1, 1, "", ""],
    ["puz06i", 2, 0, 0, 1, 1, "", ""],
    ["puz06j", 2, 0, 0, 1, 1, "", ""],
    ["puz06k", 2, 0, 0, 1, 1, "", ""],
    ["puz06l", 2, 0, 0, 1, 1, "", ""],
    ["puz06m", 2, 0, 0, 1, 1, "", ""],
    ["puz06n", 2, 0, 0, 1, 1, "", ""],
    ["puz07a", 2, 0, 0, 1, 1, "", ""],
    ["puz07c", 2, 0, 0, 1, 1, "", ""],
    ["puz07h", 2, 0, 0, 1, 1, "", ""],
    ["puz07j", 2, 0, 0, 1, 1, "", ""],
    ["puz08a", 2, 0, 0, 1, 1, "", ""],
    ["puz08b", 2, 0, 0, 1, 1, "", ""],
    ["puz08c", 2, 0, 0, 1, 1, "", ""],
    ["puz08d", 2, 0, 0, 1, 1, "", ""],
    ["puz08e", 2, 0, 0, 1, 1, "", ""],
    ["puz08f", 2, 0, 0, 1, 1, "", ""],
    ["puz08g", 2, 0, 0, 1, 1, "", ""],
    ["puz08h", 2, 0, 0, 1, 1, "", ""],
    ["puz08i", 2, 0, 0, 1, 1, "", ""],
    ["puz01end", 2, 0, 0, 1, 1, "", ""],
    ["puz01door", 2, 0, 0, 1, 1, "", ""],
    ["puz01frame", 2, 0, 0, 1, 1, "", ""],
    ["puz02end1", 2, 0, 0, 1, 1, "", ""],
    ["puz02end2", 2, 0, 0, 1, 1, "", ""],
    ["puz02end3", 2, 0, 0, 1, 1, "", ""],
    ["puz02end4", 2, 0, 0, 1, 1, "", ""],
    ["puz02end4n5", 2, 0, 0, 1, 1, "", ""],
    ["puz02end5", 2, 0, 0, 1, 1, "", ""],
    ["puz02end5x", 2, 0, 0, 0, 1, "", ""],
    ["puz02door1", 2, 0, 0, 1, 1, "", ""],
    ["puz02door2", 2, 0, 0, 1, 1, "", ""],
    ["puz02frame1l", 2, 0, 0, 1, 1, "", ""],
    ["puz02frame1r", 2, 0, 0, 1, 1, "", ""],
    ["puz02frame2l", 2, 0, 0, 1, 1, "", ""],
    ["puz02frame2r", 2, 0, 0, 1, 1, "", ""],
    ["puz03end", 2, 0, 0, 1, 1, "", ""],
    ["puz03door", 2, 0, 0, 1, 1, "", ""],
    ["puz03frame", 2, 0, 0, 1, 1, "", ""],
    ["puz04end1", 2, 0, 0, 1, 1, "", ""],
    ["puz04end2", 2, 0, 0, 1, 1, "", ""],
    ["puz04door", 2, 0, 0, 1, 1, "", ""],
    ["puz04frame_l", 2, 0, 0, 1, 1, "", ""],
    ["puz04frame_r", 2, 0, 0, 1, 1, "", ""],
    ["puz01beam01", 2, 0, 0, 1, 1, "", ""],
    ["puz02beam01", 2, 0, 0, 1, 1, "", ""],
    ["puz02beam02", 2, 0, 0, 1, 1, "", ""],
    ["puz02beam03", 2, 0, 0, 1, 1, "", ""],
    ["puz02beam04", 2, 0, 0, 1, 1, "", ""],
    ["puz02beam05", 2, 0, 0, 1, 1, "", ""],
    ["puz02beam06", 2, 0, 0, 1, 1, "", ""],
    ["puz02beam07", 2, 0, 0, 1, 1, "", ""],
    ["puz02beam08", 2, 0, 0, 1, 1, "", ""],
    ["puz02beam09", 2, 0, 0, 1, 1, "", ""],
    ["puz02beam10", 2, 0, 0, 1, 1, "", ""],
    ["puz02beam11", 2, 0, 0, 1, 1, "", ""],
    ["puz02beam12", 2, 0, 0, 1, 1, "", ""],
    ["puz02beam13", 2, 0, 0, 1, 1, "", ""],
    ["puz02beam14", 2, 0, 0, 1, 1, "", ""],
    ["puz02beam15", 2, 0, 0, 1, 1, "", ""],
    ["puz02beam16", 2, 0, 0, 1, 1, "", ""],
    ["puz02beam17", 2, 0, 0, 1, 1, "", ""],
    ["puz02beam18", 2, 0, 0, 1, 1, "", ""],
    ["puz02beam19", 2, 0, 0, 1, 1, "", ""],
    ["puz03beam01", 2, 0, 0, 1, 1, "", ""],
    ["puz03beam02", 2, 0, 0, 1, 1, "", ""],
    ["puz03beam03", 2, 0, 0, 1, 1, "", ""],
    ["puz03beam04", 2, 0, 0, 1, 1, "", ""],
    ["puz03beam05", 2, 0, 0, 1, 1, "", ""],
    ["puz03beam06", 2, 0, 0, 1, 1, "", ""],
    ["puz03beam07", 2, 0, 0, 1, 1, "", ""],
    ["puz03beam08", 2, 0, 0, 1, 1, "", ""],
    ["puz03beam09", 2, 0, 0, 1, 1, "", ""],
    ["puz03beam10", 2, 0, 0, 1, 1, "", ""],
    ["puz03beam11", 2, 0, 0, 1, 1, "", ""],
    ["puz03beam12", 2, 0, 0, 1, 1, "", ""],
    ["puz03beam13", 2, 0, 0, 1, 1, "", ""],
    ["puz04beam01", 2, 0, 0, 1, 1, "", ""],
    ["puz04beam02", 2, 0, 0, 1, 1, "", ""],
    ["puz04beam03", 2, 0, 0, 1, 1, "", ""],
    ["puz04beam04", 2, 0, 0, 1, 1, "", ""],
    ["puz04beam05", 2, 0, 0, 1, 1, "", ""],
    ["puz04beam06", 2, 0, 0, 1, 1, "", ""],
    ["puz04beam07", 2, 0, 0, 1, 1, "", ""],
    ["puz04beam08", 2, 0, 0, 1, 1, "", ""],
    ["puz04beam09", 2, 0, 0, 1, 1, "", ""],
    ["puz04beam10", 2, 0, 0, 1, 1, "", ""],
    ["puz06beam01", 2, 0, 0, 1, 1, "", ""],
    ["puz06beam02", 2, 0, 0, 1, 1, "", ""],
    ["puz06beam03", 2, 0, 0, 1, 1, "", ""],
    ["puz06beam04", 2, 0, 0, 1, 1, "", ""],
    ["puz06beam05", 2, 0, 0, 1, 1, "", ""],
    ["puz06beam06", 2, 0, 0, 1, 1, "", ""],
    ["puz06beam07", 2, 0, 0, 1, 1, "", ""],
    ["puz06beam08", 2, 0, 0, 1, 1, "", ""],
    ["puz06beam09", 2, 0, 0, 1, 1, "", ""],
    ["puz07beam01", 2, 0, 0, 1, 1, "", ""],
    ["puz07beam02", 2, 0, 0, 1, 1, "", ""],
    ["puz07beam03", 2, 0, 0, 1, 1, "", ""],
    ["puz08beam01", 2, 0, 0, 1, 1, "", ""],
    ["puz08beam02", 2, 0, 0, 1, 1, "", ""],
    ["puz01block", 5, 0, 0, 1, 1, "", ""],
    ["puz02block1", 5, 0, 0, 1, 1, "", ""],
    ["puz02block2", 5, 0, 0, 1, 1, "", ""],
    ["puz03block", 5, 0, 0, 1, 1, "", ""],
    ["puz04block", 5, 0, 0, 1, 1, "", ""],
    ["puz01done", 7, 0, 0, 1, 1, "", ""],
    ["puz02done1", 7, 0, 0, 1, 1, "", ""],
    ["puz02done2", 7, 0, 0, 1, 1, "", ""],
    ["puz03done", 7, 0, 0, 1, 1, "", ""],
    ["puz04done", 7, 0, 0, 1, 1, "", ""],
    ["puz01wait", 8, 0, 0, 0, 1, "", ""],
    ["puz02wait1", 8, 0, 0, 0, 1, "", ""],
    ["puz02wait2", 8, 0, 0, 0, 1, "", ""],
    ["puz03wait", 8, 0, 0, 0, 1, "", ""],
    ["puz04wait", 8, 0, 0, 0, 1, "", ""],
    ["trig01", 1, 154, 0, 0, 1, "", ""],
    ["trig02a", 1, 154, 0, 0, 1, "", ""],
    ["puz02f_on", 7, 0, 0, 1, 1, "", ""],
    ["trig02b", 1, 154, 0, 0, 1, "", ""],
    ["trig02c", 1, 154, 0, 0, 1, "", ""],
    ["trig03a", 1, 154, 0, 0, 1, "", ""],
    ["trig03b", 1, 154, 0, 0, 1, "", ""],
    ["trig03c", 1, 154, 0, 0, 1, "", ""],
    ["trig03d", 1, 154, 0, 0, 1, "", ""],
    ["trig03e", 1, 154, 0, 0, 1, "", ""],
    ["trig03f", 1, 154, 0, 0, 1, "", ""],
    ["trig03g", 1, 154, 0, 0, 1, "", ""],
    ["trig03h", 1, 154, 0, 0, 1, "", ""],
    ["puz03b_on", 7, 0, 0, 1, 1, "", ""],
    ["puz03b_off", 7, 0, 0, 1, 1, "", ""],
    ["puz03d_on", 7, 0, 0, 1, 1, "", ""],
    ["puz03d_off", 7, 0, 0, 1, 1, "", ""],
    ["puz03e_on", 7, 0, 0, 1, 1, "", ""],
    ["puz03e_off", 7, 0, 0, 1, 1, "", ""],
    ["puz03f_on", 7, 0, 0, 1, 1, "", ""],
    ["puz03f_off", 7, 0, 0, 1, 1, "", ""],
    ["puz03f_on2", 7, 0, 0, 1, 1, "", ""],
    ["puz03f_off2", 7, 0, 0, 1, 1, "", ""],
    ["puz03g_on", 7, 0, 0, 1, 1, "", ""],
    ["puz03g_off", 7, 0, 0, 1, 1, "", ""],
    ["puz03i_on", 7, 0, 0, 1, 1, "", ""],
    ["puz03i_off", 7, 0, 0, 1, 1, "", ""],
    ["puz03k_on", 7, 0, 0, 1, 1, "", ""],
    ["puz03k_off", 7, 0, 0, 1, 1, "", ""],
    ["trig04a", 1, 154, 0, 0, 1, "", ""],
    ["trig04b", 1, 154, 0, 0, 1, "", ""],
    ["teletimer", 8, 0, 0, 0, 1, "", ""],
    ["gifttimer", 8, 0, 0, 0, 1, "", ""],
    ["teleportking", 3, 0, 0, 0, 1, "", ""],
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
    ["kpath1", 20, 0, 0, 1, 1, "", ""],
    ["kpath2", 20, 0, 0, 1, 1, "", ""],
    ["kpath3", 20, 0, 0, 1, 1, "", ""],
    ["kingpath", 20, 0, 0, 1, 1, "", ""],
    ["seedpile6", 1, 134, 0, 1, 1, "", ""],
    ["seedpile7", 1, 134, 0, 1, 1, "", ""],
    ["seedpile8", 1, 134, 0, 1, 1, "", ""],
    ["seedpile9", 1, 134, 0, 1, 1, "", ""],
    ["seedpile6t", 2, 0, 0, 1, 1, "", ""],
    ["seedpile7t", 2, 0, 0, 1, 1, "", ""],
    ["seedpile8t", 2, 0, 0, 1, 1, "", ""],
    ["seedpile9t", 2, 0, 0, 1, 1, "", ""],
    ["seedpile17t", 2, 0, 0, 1, 1, "", ""],
    ["seedpile18t", 2, 0, 0, 1, 1, "", ""],
    ["seeddelay", 8, 0, 0, 0, 1, "", ""],
    ["seedmover", 7, 0, 0, 1, 1, "", ""],
    ["seedtimer6", 8, 0, 0, 0, 1, "", ""],
    ["seedtimer7", 8, 0, 0, 0, 1, "", ""],
    ["seedtimer8", 8, 0, 0, 0, 1, "", ""],
    ["seedtimer9", 8, 0, 0, 0, 1, "", ""],
    ["boss_easy", 11, 26, 0, 1, 1, "kingpath", ""],
    ["boss_hard", 11, 26, 0, 1, 1, "kingpath", ""],
    ["spawner", 7, 0, 0, 0, 1, "", ""],
    ["hide_kphants", 7, 0, 0, 1, 1, "", ""],
    ["hidedelay2", 8, 0, 0, 0, 1, "", ""],
    ["greelydelay", 8, 0, 0, 0, 1, "", ""],
    ["70_uri", 7, 0, 0, 0, 1, "", ""],
    ["spawntimer", 8, 0, 0, 1, 1, "", ""],
    ["kphant_off", 7, 0, 0, 0, 1, "", ""],
    ["hideseeds", 7, 0, 0, 1, 1, "", ""],
    ["exitking", 3, 0, 0, 0, 1, "", ""],
    ["init6e", 3, 0, 0, 1, 1, "", ""],
    ["init6f", 3, 0, 0, 1, 1, "", ""],
    ["90_uri", 7, 0, 0, 0, 1, "", ""],
    ["exitroom", 3, 0, 0, 1, 1, "", ""],
    ["seedcount", 7, 0, 0, 1, 1, "", ""],
    ["portalsound", 16, "ajq_portalgatelp", 0, 0, 1, "", ""],
    ["exitportal", 2, 0, 0, 1, 1, "", ""],
    ["exitblock", 5, 0, 0, 1, 1, "", ""],
    ["blockinfo", 1, 145, 0, 1, 1, "", ""],
    ["blockrock", 11, 167, 0, 1, 1, "", ""],
    ["rockblock", 5, 0, 0, 1, 1, "", ""],
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
    ["podvol01", 5, 0, 0, 1, 1, "", ""],
    ["podvol02", 5, 0, 0, 1, 1, "", ""],
    ["podvol03", 5, 0, 0, 1, 1, "", ""],
    ["podvol04", 5, 0, 0, 1, 1, "", ""],
    ["podvol05", 5, 0, 0, 1, 1, "", ""],
    ["podvol06", 5, 0, 0, 1, 1, "", ""],
    ["podvol07", 5, 0, 0, 1, 1, "", ""],
    ["podvol08", 5, 0, 0, 1, 1, "", ""],
    ["podvol09", 5, 0, 0, 1, 1, "", ""],
    ["podvol10", 5, 0, 0, 1, 1, "", ""],
    ["podvol11", 5, 0, 0, 1, 1, "", ""],
    ["podvol12", 5, 0, 0, 1, 1, "", ""],
    ["puz06a_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz06a_on2", 7, 0, 0, 1, 1, "", ""],
    ["puz06a_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz06a_off2", 7, 0, 0, 1, 1, "", ""],
    ["puz06b_on", 7, 0, 0, 1, 1, "", ""],
    ["puz06b_off", 7, 0, 0, 1, 1, "", ""],
    ["puz06c_on", 7, 0, 0, 1, 1, "", ""],
    ["puz06c_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz06c_off", 7, 0, 0, 1, 1, "", ""],
    ["puz06c_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz06d_on", 7, 0, 0, 1, 1, "", ""],
    ["puz06d_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz06d_off", 7, 0, 0, 1, 1, "", ""],
    ["puz06d_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz06e_on", 7, 0, 0, 1, 1, "", ""],
    ["puz06e_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz06e_on2", 7, 0, 0, 1, 1, "", ""],
    ["puz06e_off", 7, 0, 0, 1, 1, "", ""],
    ["puz06e_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz06f_on", 7, 0, 0, 1, 1, "", ""],
    ["puz06f_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz06f_on2", 7, 0, 0, 1, 1, "", ""],
    ["puz06g_on", 7, 0, 0, 1, 1, "", ""],
    ["puz06g_off", 7, 0, 0, 1, 1, "", ""],
    ["puz06g_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz06h_on", 7, 0, 0, 1, 1, "", ""],
    ["puz06h_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz06h_on2", 7, 0, 0, 1, 1, "", ""],
    ["puz06h_off", 7, 0, 0, 1, 1, "", ""],
    ["puz06h_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz06i_on", 7, 0, 0, 1, 1, "", ""],
    ["puz06i_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz06i_off", 7, 0, 0, 1, 1, "", ""],
    ["puz06i_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz06j_on", 7, 0, 0, 1, 1, "", ""],
    ["puz06j_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz06j_on2", 7, 0, 0, 1, 1, "", ""],
    ["puz06j_off", 7, 0, 0, 1, 1, "", ""],
    ["puz06j_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz06j_off2", 7, 0, 0, 1, 1, "", ""],
    ["puz06k_on", 7, 0, 0, 1, 1, "", ""],
    ["puz06k_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz06k_off", 7, 0, 0, 1, 1, "", ""],
    ["puz06k_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz06l_on", 7, 0, 0, 1, 1, "", ""],
    ["puz06l_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz06l_off", 7, 0, 0, 1, 1, "", ""],
    ["puz06l_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz06m_on", 7, 0, 0, 1, 1, "", ""],
    ["puz06m_off", 7, 0, 0, 1, 1, "", ""],
    ["puz06m_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz06m_off2", 7, 0, 0, 1, 1, "", ""],
    ["puz06n_on", 7, 0, 0, 1, 1, "", ""],
    ["puz06n_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz06n_off1", 7, 0, 0, 1, 1, "", ""],
    ["trig06s1", 1, 154, 0, 0, 1, "", ""],
    ["trig06s2", 1, 154, 0, 0, 1, "", ""],
    ["trig06s3", 1, 154, 0, 0, 1, "", ""],
    ["trig06a", 1, 154, 0, 0, 1, "", ""],
    ["trig06b", 1, 154, 0, 0, 1, "", ""],
    ["trig06c", 1, 154, 0, 0, 1, "", ""],
    ["trig06d", 1, 154, 0, 0, 1, "", ""],
    ["trig06e", 1, 154, 0, 0, 1, "", ""],
    ["trig06f", 1, 154, 0, 0, 1, "", ""],
    ["trig06g", 1, 154, 0, 0, 1, "", ""],
    ["trig06h", 1, 154, 0, 0, 1, "", ""],
    ["trig06i", 1, 154, 0, 0, 1, "", ""],
    ["trig06j", 1, 154, 0, 0, 1, "", ""],
    ["trig06k", 1, 154, 0, 0, 1, "", ""],
    ["trig06l", 1, 154, 0, 0, 1, "", ""],
    ["trig06m", 1, 154, 0, 0, 1, "", ""],
    ["trig06n", 1, 154, 0, 0, 1, "", ""],
    ["puz07a_on", 7, 0, 0, 1, 1, "", ""],
    ["puz07a_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz07a_off", 7, 0, 0, 1, 1, "", ""],
    ["puz07a_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz07b_on", 7, 0, 0, 1, 1, "", ""],
    ["puz07b_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz07b_on2", 7, 0, 0, 1, 1, "", ""],
    ["puz07b_off", 7, 0, 0, 1, 1, "", ""],
    ["puz07b_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz07c_on", 7, 0, 0, 1, 1, "", ""],
    ["puz07c_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz07c_on2", 7, 0, 0, 1, 1, "", ""],
    ["puz07c_off", 7, 0, 0, 1, 1, "", ""],
    ["puz07c_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz07c_off2", 7, 0, 0, 1, 1, "", ""],
    ["puz07d_on", 7, 0, 0, 1, 1, "", ""],
    ["puz07d_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz07d_off", 7, 0, 0, 1, 1, "", ""],
    ["puz07d_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz07e_on", 7, 0, 0, 1, 1, "", ""],
    ["puz07e_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz07e_off", 7, 0, 0, 1, 1, "", ""],
    ["puz07e_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz07f_on", 7, 0, 0, 1, 1, "", ""],
    ["puz07f_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz07f_on2", 7, 0, 0, 1, 1, "", ""],
    ["puz07f_on3", 7, 0, 0, 1, 1, "", ""],
    ["puz07f_off", 7, 0, 0, 1, 1, "", ""],
    ["puz07f_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz07f_off2", 7, 0, 0, 1, 1, "", ""],
    ["puz07f_off3", 7, 0, 0, 1, 1, "", ""],
    ["puz07g_on", 7, 0, 0, 1, 1, "", ""],
    ["puz07g_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz07g_off", 7, 0, 0, 1, 1, "", ""],
    ["puz07g_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz07h_on", 7, 0, 0, 1, 1, "", ""],
    ["puz07h_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz07h_off", 7, 0, 0, 1, 1, "", ""],
    ["puz07h_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz07i_on", 7, 0, 0, 1, 1, "", ""],
    ["puz07i_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz07i_off", 7, 0, 0, 1, 1, "", ""],
    ["puz07i_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz07j_on", 7, 0, 0, 1, 1, "", ""],
    ["puz07j_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz07j_on2", 7, 0, 0, 1, 1, "", ""],
    ["puz07j_off", 7, 0, 0, 1, 1, "", ""],
    ["puz07j_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz07j_off2", 7, 0, 0, 1, 1, "", ""],
    ["puz07k_on", 7, 0, 0, 1, 1, "", ""],
    ["puz07k_off", 7, 0, 0, 1, 1, "", ""],
    ["trig07start", 1, 154, 0, 0, 1, "", ""],
    ["trig07a", 1, 154, 0, 0, 1, "", ""],
    ["trig07b", 1, 154, 0, 0, 1, "", ""],
    ["trig07c", 1, 154, 0, 0, 1, "", ""],
    ["trig07d", 1, 154, 0, 0, 1, "", ""],
    ["trig07e", 1, 154, 0, 0, 1, "", ""],
    ["trig07f", 1, 154, 0, 0, 1, "", ""],
    ["trig07g", 1, 154, 0, 0, 1, "", ""],
    ["trig07h", 1, 154, 0, 0, 1, "", ""],
    ["trig07i", 1, 154, 0, 0, 1, "", ""],
    ["trig07j", 1, 154, 0, 0, 1, "", ""],
    ["trig07k", 1, 154, 0, 0, 1, "", ""],
    ["puz08a_on", 7, 0, 0, 1, 1, "", ""],
    ["puz08a_off", 7, 0, 0, 1, 1, "", ""],
    ["puz08b_on", 7, 0, 0, 1, 1, "", ""],
    ["puz08b_off", 7, 0, 0, 1, 1, "", ""],
    ["puz08c_on", 7, 0, 0, 1, 1, "", ""],
    ["puz08c_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz08c_off", 7, 0, 0, 1, 1, "", ""],
    ["puz08c_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz08d_on", 7, 0, 0, 1, 1, "", ""],
    ["puz08d_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz08d_on2", 7, 0, 0, 1, 1, "", ""],
    ["puz08d_off", 7, 0, 0, 1, 1, "", ""],
    ["puz08d_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz08d_off2", 7, 0, 0, 1, 1, "", ""],
    ["puz08e_on", 7, 0, 0, 1, 1, "", ""],
    ["puz08e_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz08e_off", 7, 0, 0, 1, 1, "", ""],
    ["puz08e_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz08f_on", 7, 0, 0, 1, 1, "", ""],
    ["puz08f_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz08f_off", 7, 0, 0, 1, 1, "", ""],
    ["puz08f_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz08g_on", 7, 0, 0, 1, 1, "", ""],
    ["puz08g_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz08g_on2", 7, 0, 0, 1, 1, "", ""],
    ["puz08g_off", 7, 0, 0, 1, 1, "", ""],
    ["puz08g_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz08g_off2", 7, 0, 0, 1, 1, "", ""],
    ["puz08h_on", 7, 0, 0, 1, 1, "", ""],
    ["puz08h_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz08h_off", 7, 0, 0, 1, 1, "", ""],
    ["puz08h_off1", 7, 0, 0, 1, 1, "", ""],
    ["puz08i_on", 7, 0, 0, 1, 1, "", ""],
    ["puz08i_on1", 7, 0, 0, 1, 1, "", ""],
    ["puz08i_off", 7, 0, 0, 1, 1, "", ""],
    ["puz08i_off1", 7, 0, 0, 1, 1, "", ""],
    ["trig08s1", 1, 154, 0, 0, 1, "", ""],
    ["trig08s2", 1, 154, 0, 0, 1, "", ""],
    ["trig08a", 1, 154, 0, 0, 1, "", ""],
    ["trig08b", 1, 154, 0, 0, 1, "", ""],
    ["trig08c", 1, 154, 0, 0, 1, "", ""],
    ["trig08d", 1, 154, 0, 0, 1, "", ""],
    ["trig08e", 1, 154, 0, 0, 1, "", ""],
    ["trig08f", 1, 154, 0, 0, 1, "", ""],
    ["trig08g", 1, 154, 0, 0, 1, "", ""],
    ["trig08h", 1, 154, 0, 0, 1, "", ""],
    ["trig08i", 1, 154, 0, 0, 1, "", ""],
    ["cheatchq1", 3, 0, 0, 1, 1, "", ""],
    ["cheatchq2", 3, 0, 0, 1, 1, "", ""],
    ["playermember", 7, 0, 0, 1, 1, "", ""],
    ["diff_level", 7, 0, 0, 1, 1, "", ""],
    ["live_players", 7, 0, 1, 0, 1, "", ""],
  ],

  on: {
    loaded(q) {
      ambient(q, "start");
      // step 221
      q.send("qsndpk", 2552);
    },

    // walked into, or clicked
    trigger: {
      treasure_a1(q) {
        q.send("qatt", "treasure_a1", 3, 50, 0, 1); // the chest opens
      },
      treasure_a2(q) {
        q.send("qatt", "treasure_a2", 3, 50, 0, 1); // the chest opens
      },
      treasure0(q) {
        q.send("qatt", "treasure0", 3, 50, 0, 1); // the chest opens
      },
      treasure01(q) {
        q.send("qatt", "treasure01", 3, 50, 0, 1); // the chest opens
      },
      treasure02(q) {
        q.send("qatt", "treasure02", 3, 50, 0, 1); // the chest opens
      },
      treasure03(q) {
        q.send("qatt", "treasure03", 3, 100, 0, 1); // the chest opens
      },
      treasure04(q) {
        q.send("qatt", "treasure04", 3, 100, 0, 1); // the chest opens
      },
      treasure05(q) {
        q.send("qatt", "treasure05", 3, 100, 0, 1); // the chest opens
      },
      treasure06(q) {
        q.send("qatt", "treasure06", 3, 50, 0, 1); // the chest opens
      },
      treasure07(q) {
        q.send("qatt", "treasure07", 3, 50, 0, 1); // the chest opens
      },
      treasure08(q) {
        q.send("qatt", "treasure08", 3, 50, 0, 1); // the chest opens
      },
      startcosmo1(q) {
        // step 1
        set(q, "cosmo1x", 3, 1, 1);
        q.send("qcmd", 3, 0, "cosmo1x", 3, 10892);
        set(q, "startcosmo1", 99, 0, 0);
      },
      seedgive(q) {
        // step 7
        giveSeeds(q, 137, 3, 3);
        q.after(1530, () => {
          set(q, "cosmo1", 99, 0, 0);
          set(q, "seedgive", 99, 0, 0);
        });
      },
      switch06(q) {
        // step 12: once
        if (once(q, "step12")) {
          q.xp(5, "switch06");
          set(q, "switch06t", 1, 1, 0);
          set(q, "sentry08_lp", 1, 0, 0);
          set(q, "sentry09_lp", 1, 0, 0);
          set(q, "switch06", 99, 0, 0);
          q.after(1200, () => {
            q.send("qswfs", "sentry08", "turnoff");
            set(q, "sentry08", 1, 1, 0);
            q.send("qswfs", "sentry09", "turnoff");
            set(q, "sentry09", 1, 1, 0);
          });
        }
      },
      switch07(q) {
        // step 13: once
        if (once(q, "step13")) {
          q.xp(5, "switch07");
          set(q, "switch07t", 1, 1, 0);
          set(q, "sentry10_lp", 1, 0, 0);
          set(q, "sentry11_lp", 1, 0, 0);
          set(q, "switch07", 99, 0, 0);
          q.after(480, () => {
            q.send("qswfs", "sentry10", "turnoff");
            set(q, "sentry10", 1, 1, 0);
            q.send("qswfs", "sentry11", "turnoff");
            set(q, "sentry11", 1, 1, 0);
          });
        }
      },
      phantomfall1(q) {
        // step 14
        set(q, "phantomvol01", 1, 1, 0);
        set(q, "phantomfall1", 99, 0, 0);
      },
      seedpile18(q) {
        // step 15
        giveSeeds(q, 137, 3, 3);
        set(q, "seedpile18", 99, 0, 0);
        set(q, "seedpile18t", 1, 1, 0);
        q.after(21330, () => {
          set(q, "seedpile18t", 0, 1, 0);
          q.send("qcmdVT", 1, "seeddelay", 0, 0, 0);
          q.after(1000, () => {
            set(q, "seedpile18", 0, 1, 1);
            q.send("qcmdVT", 1, "seedtimer18", 0, 0, 0);
          });
        });
      },
      switch08(q) {
        // step 17: once
        if (once(q, "step17")) {
          q.xp(5, "switch08");
          set(q, "switch08t", 1, 1, 0);
          set(q, "sentry12_lp", 1, 0, 0);
          set(q, "sentry13_lp", 1, 0, 0);
          set(q, "switch08", 99, 0, 0);
          q.after(270, () => {
            q.send("qswfs", "sentry12", "turnoff");
            set(q, "sentry12", 1, 1, 0);
            q.send("qswfs", "sentry13", "turnoff");
            set(q, "sentry13", 1, 1, 0);
          });
        }
      },
      phantom__00i__give_gem(q) {
        // step 18: once
        if (once(q, "step18")) {
          q.send("qad", "phantom__00i__give_gem", 0, "null");
          q.gems(25);
        }
      },
      seedpile11(q) {
        // step 19
        giveSeeds(q, 137, 3, 3);
      },
      phantom00r__give_gem(q) {
        // step 20: once
        if (once(q, "step20")) {
          q.send("qad", "phantom00r__give_gem", 0, "null");
          q.gems(25);
        }
      },
      graham1on(q) {
        // step 21
        appear(q, "graham1");
        q.send("qswfs", "graham1", "idle");
        set(q, "graham1", 2, 1, 0);
        set(q, "graham1x", 1, 1, 1);
        q.send("qcmd", 3, 0, "graham1x", 1, 10866);
        set(q, "graham1on", 99, 0, 0);
      },
      givegear(q) {
        // step 23
        q.send("qgi", "gear01");
        q.send("qsnd", "ajq_cogappear");
      },
      graham1(q) {
        const n = tally(q, "trigger graham1");
        // step 24: the 1st time
        if (n === 1) {
          q.send("qcmd", 3, 0, "graham1", 3, 10894);
        }
        // step 25: the 2nd time
        if (n === 2) {
          q.send("qcmd", 3, 0, "graham1", 3, 10894);
        }
        // step 26: the 3rd time
        if (n === 3) {
          q.send("qcmd", 3, 0, "graham1", 4, 10965);
        }
        // step 27: the 4th time and after
        if (n >= 4) {
          q.send("qcmd", 3, 0, "graham1", 4, 10965);
        }
      },
      to6b1(q) {
        // step 28
        q.room("in6b1", "in6b1");
        ambient(q, "in6b1");
      },
      "6b_init"(q) {
        const n = tally(q, "trigger 6b_init");
        // step 29: the 1st time
        if (n === 1) {
          q.send("qcmdVT", 1, "10_uri", 1, 0, 0);
          q.send("qposturi", "/adventure6-greelysinferno/#10-reachtopofswitchbacks/#0#001");
          q.send("qcmdVT", 1, "10_uri", 99, 0, 0);
          q.send("qcmd", 38, 10911);
          q.send("qtorch", 0, 1, "torch01lite");
          q.send("qtorch", 0, 1, "darklight");
          set(q, "bridge01", 99, 0, 0);
          set(q, "bridge02", 99, 0, 0);
          set(q, "puz01beam01", 99, 0, 0);
          set(q, "puz02start1", 99, 0, 0);
          set(q, "puz02start2", 99, 0, 0);
          set(q, "puz02start3", 99, 0, 0);
          set(q, "puz02a", 99, 0, 0);
          set(q, "puz02b", 99, 0, 0);
          set(q, "puz02c", 99, 0, 0);
          set(q, "puz02d", 99, 0, 0);
          set(q, "puz02e", 99, 0, 0);
          set(q, "puz02f", 99, 0, 0);
          set(q, "puz02g", 99, 0, 0);
          set(q, "puz02h", 99, 0, 0);
          set(q, "puz02i", 99, 0, 0);
          set(q, "puz02j", 99, 0, 0);
          set(q, "puz02k", 99, 0, 0);
          set(q, "puz02l", 99, 0, 0);
          set(q, "puz02m", 99, 0, 0);
          set(q, "puz02n", 99, 0, 0);
          set(q, "puz02beam01", 99, 0, 0);
          set(q, "puz02beam02", 99, 0, 0);
          set(q, "puz02beam03", 99, 0, 0);
          set(q, "puz02beam04", 99, 0, 0);
          set(q, "puz02beam05", 99, 0, 0);
          set(q, "puz02beam06", 99, 0, 0);
          set(q, "puz02beam07", 99, 0, 0);
          set(q, "puz02beam08", 99, 0, 0);
          set(q, "puz02beam09", 99, 0, 0);
          set(q, "puz02beam10", 99, 0, 0);
          set(q, "puz02beam11", 99, 0, 0);
          set(q, "puz02beam12", 99, 0, 0);
          set(q, "puz02beam13", 99, 0, 0);
          set(q, "puz02beam14", 99, 0, 0);
          set(q, "puz02beam15", 99, 0, 0);
          set(q, "puz02beam16", 99, 0, 0);
          set(q, "puz02beam17", 99, 0, 0);
          set(q, "puz02beam18", 99, 0, 0);
          set(q, "puz02beam19", 99, 0, 0);
          set(q, "puz03start", 99, 0, 0);
          set(q, "puz03a", 99, 0, 0);
          set(q, "puz03b", 99, 0, 0);
          set(q, "puz03c", 99, 0, 0);
          set(q, "puz03d", 99, 0, 0);
          set(q, "puz03e", 99, 0, 0);
          set(q, "puz03f", 99, 0, 0);
          set(q, "puz03g", 99, 0, 0);
          set(q, "puz03h", 99, 0, 0);
          set(q, "puz03i", 99, 0, 0);
          set(q, "puz03j", 99, 0, 0);
          set(q, "puz03k", 99, 0, 0);
          set(q, "puz03beam01", 99, 0, 0);
          set(q, "puz03beam02", 99, 0, 0);
          set(q, "puz03beam03", 99, 0, 0);
          set(q, "puz03beam04", 99, 0, 0);
          set(q, "puz03beam05", 99, 0, 0);
          set(q, "puz03beam06", 99, 0, 0);
          set(q, "puz03beam07", 99, 0, 0);
          set(q, "puz03beam08", 99, 0, 0);
          set(q, "puz03beam09", 99, 0, 0);
          set(q, "puz03beam10", 99, 0, 0);
          set(q, "puz03beam11", 99, 0, 0);
          set(q, "puz03beam12", 99, 0, 0);
          set(q, "puz03beam13", 99, 0, 0);
          set(q, "puz04start1", 99, 0, 0);
          set(q, "puz04start2", 99, 0, 0);
          set(q, "puz04a", 99, 0, 0);
          set(q, "puz04b", 99, 0, 0);
          set(q, "puz04c", 99, 0, 0);
          set(q, "puz04d", 99, 0, 0);
          set(q, "puz04e", 99, 0, 0);
          set(q, "puz04f", 99, 0, 0);
          set(q, "puz04g", 99, 0, 0);
          set(q, "puz04h", 99, 0, 0);
          set(q, "puz04i", 99, 0, 0);
          set(q, "puz04beam01", 99, 0, 0);
          set(q, "puz04beam02", 99, 0, 0);
          set(q, "puz04beam03", 99, 0, 0);
          set(q, "puz04beam04", 99, 0, 0);
          set(q, "puz04beam05", 99, 0, 0);
          set(q, "puz04beam06", 99, 0, 0);
          set(q, "puz04beam07", 99, 0, 0);
          set(q, "puz04beam08", 99, 0, 0);
          set(q, "puz04beam09", 99, 0, 0);
          set(q, "puz04beam10", 99, 0, 0);
          set(q, "puz06a", 99, 0, 0);
          set(q, "puz06b", 99, 0, 0);
          set(q, "puz06c", 99, 0, 0);
          set(q, "puz06d", 99, 0, 0);
          set(q, "puz06e", 99, 0, 0);
          set(q, "puz06f", 99, 0, 0);
          set(q, "puz06g", 99, 0, 0);
          set(q, "puz06h", 99, 0, 0);
          set(q, "puz06i", 99, 0, 0);
          set(q, "puz06j", 99, 0, 0);
          set(q, "puz06k", 99, 0, 0);
          set(q, "puz06l", 99, 0, 0);
          set(q, "puz06m", 99, 0, 0);
          set(q, "puz06n", 99, 0, 0);
          set(q, "puz06beam01", 99, 0, 0);
          set(q, "puz06beam02", 99, 0, 0);
          set(q, "puz06beam03", 99, 0, 0);
          set(q, "puz06beam04", 99, 0, 0);
          set(q, "puz06beam05", 99, 0, 0);
          set(q, "puz06beam06", 99, 0, 0);
          set(q, "puz06beam07", 99, 0, 0);
          set(q, "puz06beam08", 99, 0, 0);
          set(q, "puz06beam09", 99, 0, 0);
          set(q, "puz07a", 99, 0, 0);
          set(q, "puz07c", 99, 0, 0);
          set(q, "puz07j", 99, 0, 0);
          set(q, "puz07h", 99, 0, 0);
          set(q, "puz07beam01", 99, 0, 0);
          set(q, "puz07beam02", 99, 0, 0);
          set(q, "puz07beam03", 99, 0, 0);
          set(q, "puz08a", 99, 0, 0);
          set(q, "puz08b", 99, 0, 0);
          set(q, "puz08c", 99, 0, 0);
          set(q, "puz08d", 99, 0, 0);
          set(q, "puz08e", 99, 0, 0);
          set(q, "puz08f", 99, 0, 0);
          set(q, "puz08g", 99, 0, 0);
          set(q, "puz08h", 99, 0, 0);
          set(q, "puz08i", 99, 0, 0);
          set(q, "puz08beam01", 99, 0, 0);
          set(q, "puz08beam02", 99, 0, 0);
          set(q, "puz02start1", 0, 1, 0);
          set(q, "puz02start2", 2, 1, 0);
          set(q, "puz02start3", 2, 1, 0);
          set(q, "puz02a", 1, 1, 0);
          set(q, "puz02b", 3, 1, 0);
          set(q, "puz02c", 2, 1, 0);
          set(q, "puz02d", 1, 1, 0);
          set(q, "puz02e", 3, 1, 0);
          set(q, "puz02f", 2, 1, 0);
          set(q, "puz02g", 3, 1, 0);
          set(q, "puz02h", 1, 1, 0);
          set(q, "puz02i", 2, 1, 0);
          set(q, "puz02j", 0, 1, 0);
          set(q, "puz02k", 2, 1, 0);
          set(q, "puz02l", 3, 1, 0);
          set(q, "puz02m", 1, 1, 0);
          set(q, "puz02n", 2, 1, 0);
          set(q, "puz03start", 1, 1, 0);
          set(q, "puz03a", 1, 1, 0);
          set(q, "puz03b", 3, 1, 0);
          set(q, "puz03c", 0, 1, 0);
          set(q, "puz03d", 0, 1, 0);
          set(q, "puz03e", 3, 1, 0);
          set(q, "puz03f", 1, 1, 0);
          set(q, "puz03g", 3, 1, 0);
          set(q, "puz03h", 1, 1, 0);
          set(q, "puz03i", 1, 1, 0);
          set(q, "puz03j", 3, 1, 0);
          set(q, "puz03k", 3, 1, 0);
          set(q, "puz04start1", 2, 1, 0);
          set(q, "puz04start2", 1, 1, 0);
          set(q, "puz04a", 3, 1, 0);
          set(q, "puz04b", 2, 1, 0);
          set(q, "puz04c", 2, 1, 0);
          set(q, "puz04d", 1, 1, 0);
          set(q, "puz04d", 0, 1, 0);
          set(q, "puz04e", 1, 1, 0);
          set(q, "puz04f", 2, 1, 0);
          set(q, "puz04g", 3, 1, 0);
          set(q, "puz04h", 1, 1, 0);
          set(q, "puz04h", 0, 1, 0);
          set(q, "puz04i", 2, 1, 0);
          set(q, "gear04a", 1, 1, 0);
          set(q, "gear04b", 1, 1, 0);
          set(q, "gear03", 1, 1, 0);
          set(q, "6b_init", 1, 1, 1);
          set(q, "puz02j", 1, 1, 0);
          set(q, "puz02j", 0, 1, 0);
          set(q, "puz03c", 1, 1, 0);
          set(q, "puz03c", 0, 1, 0);
          set(q, "puz03d", 1, 1, 0);
          set(q, "puz03d", 0, 1, 0);
          set(q, "puz04d", 1, 1, 0);
          set(q, "puz04d", 0, 1, 0);
          set(q, "puz04h", 1, 1, 0);
          set(q, "puz04h", 0, 1, 0);
          set(q, "puz02start1", 1, 1, 0);
          set(q, "puz02start1", 0, 1, 0);
        }
        // step 30: the 2nd time and after
        if (n >= 2) {
          set(q, "puz02j", 1, 1, 0);
          set(q, "puz02j", 0, 1, 0);
          set(q, "puz03c", 1, 1, 0);
          set(q, "puz03c", 0, 1, 0);
          set(q, "puz03d", 1, 1, 0);
          set(q, "puz03d", 0, 1, 0);
          set(q, "puz04d", 1, 1, 0);
          set(q, "puz04d", 0, 1, 0);
          set(q, "puz04h", 1, 1, 0);
          set(q, "puz04h", 0, 1, 0);
          set(q, "puz02start1", 1, 1, 0);
          set(q, "puz02start1", 0, 1, 0);
        }
      },
      gear01trig(q) {
        const held = q.held(); // what the player carried when this fired
        // step 31: only while holding gear01, once
        if (held === "gear01" && once(q, "step31")) {
          q.use();
          set(q, "gear01", 99, 0, 0);
          set(q, "gear01info", 99, 0, 0);
          set(q, "puz01start", 9, 1, 0);
          set(q, "trig01", 1, 1, 1);
          set(q, "gear01trig", 99, 0, 0);
          q.xp(5, "gear01trig");
        }
      },
      seedpile01(q) {
        // step 32
        giveSeeds(q, 137, 3, 3);
      },
      givetorch(q) {
        // step 33
        q.send("qgi", "torch01");
      },
      ambush01vol(q) {
        // step 34
        q.send("qswfs", "phantom01a", "appear");
        q.send("qsp", "phantom01a", "path01a");
        set(q, "phantom01a", 1, 1, 1);
        q.send("qswfs", "phantom01b", "appear");
        q.send("qsp", "phantom01b", "path01b");
        set(q, "phantom01b", 1, 1, 1);
        set(q, "ambush01vol", 99, 0, 0);
      },
      brazier01(q) {
        // step 35: once
        if (once(q, "step35")) {
          q.send("qcmdVT", 1, "braziercount", bump(q, "braziercount"), 0, 0); // one more than last time
          set(q, "brazier01t", 1, 1, 0);
          set(q, "bridge01", 1, 1, 0);
          q.send("qtorch", 0, 1, "bridge01");
          set(q, "brazier01l", 99, 0, 0);
          set(q, "brazier01l", 0, 1, 0);
          q.send("qtorch", 0, 1, "brazier01l");
          q.xp(5, "brazier01");
          set(q, "brazier01", 99, 0, 0);
          q.after(1230, () => {
            set(q, "bridge01blok", 99, 0, 0);
            q.after(10010, () => {
              set(q, "bridge02blok", 99, 0, 0);
            });
          });
        }
      },
      switch01(q) {
        // step 36: once
        if (once(q, "step36")) {
          q.xp(5, "switch01");
          set(q, "switch01t", 1, 1, 0);
          set(q, "sentry01_lp", 1, 0, 0);
          set(q, "switch01", 99, 0, 0);
          q.after(570, () => {
            q.send("qswfs", "sentry01", "turnoff");
            set(q, "sentry01", 1, 1, 0);
          });
        }
      },
      brazier02(q) {
        const held = q.held(); // what the player carried when this fired
        // step 37: only while holding torch01, once
        if (held === "torch01" && once(q, "step37")) {
          q.send("qcmdVT", 1, "braziercount", bump(q, "braziercount"), 0, 0); // one more than last time
          q.use();
          set(q, "torch01", 99, 0, 0);
          set(q, "givetorch", 99, 0, 0);
          set(q, "darklight", 99, 0, 0);
          set(q, "brazier02t", 1, 1, 0);
          set(q, "bridge02", 1, 1, 0);
          q.send("qtorch", 0, 1, "bridge02");
          set(q, "brazier02l", 99, 0, 0);
          set(q, "brazier02l", 0, 1, 0);
          q.send("qtorch", 0, 1, "brazier02l");
          q.xp(5, "brazier02");
          set(q, "brazier02", 99, 0, 0);
        }
      },
      locategems(q) {
        // step 38
        q.send("qcmd", 38, 10912);
        set(q, "locategems", 99, 0, 0);
      },
      switch02(q) {
        // step 39: once
        if (once(q, "step39")) {
          q.xp(5, "switch02");
          set(q, "switch02t", 1, 1, 0);
          set(q, "sentry02_lp", 1, 0, 0);
          set(q, "sentry03_lp", 1, 0, 0);
          set(q, "sentry14_lp", 1, 0, 0);
          set(q, "switch02", 99, 0, 0);
          q.after(270, () => {
            q.send("qswfs", "sentry02", "turnoff");
            set(q, "sentry02", 1, 1, 0);
            q.send("qswfs", "sentry03", "turnoff");
            set(q, "sentry03", 1, 1, 0);
            q.send("qswfs", "sentry14", "turnoff");
            set(q, "sentry14", 1, 1, 0);
          });
        }
      },
      gear02trig1(q) {
        const held = q.held(); // what the player carried when this fired
        // step 40: unless holding gear02c
        if (held !== "gear02c") {
          set(q, "gear02info1", 1, 1, 1);
          q.send("qcmd", 2, "gear02info1", 10906, 2);
        }
        // step 48: only while holding gear02c, once
        if (held === "gear02c" && once(q, "step48")) {
          q.use();
          set(q, "gear02info1", 99, 0, 0);
          set(q, "puz02start1", 8, 1, 0);
          set(q, "trig02a", 1, 1, 1);
          set(q, "gear02trig1", 99, 0, 0);
          q.xp(5, "gear02trig1");
          q.after(660, () => {
            set(q, "gear02sound1", 1, 1, 0);
          });
        }
      },
      seedpile02(q) {
        // step 41
        giveSeeds(q, 137, 3, 3);
      },
      pipetrig08(q) {
        const held = q.held(); // what the player carried when this fired
        // step 42: only while holding cork07, once
        if (held === "cork07" && once(q, "step42")) {
          q.use();
          set(q, "pipetrig08", 1, 0, 0);
          set(q, "pipe08", 1, 1, 0);
          set(q, "sludge04", 1, 0, 0);
          set(q, "pipeblock08", 99, 0, 0);
          q.xp(5, "pipetrig08");
        }
      },
      pipetrig09(q) {
        const held = q.held(); // what the player carried when this fired
        // step 43: only while holding cork08, once
        if (held === "cork08" && once(q, "step43")) {
          q.use();
          set(q, "pipetrig09", 1, 0, 0);
          set(q, "pipe09", 1, 1, 0);
          set(q, "pipeblock09", 99, 0, 0);
          q.xp(5, "pipetrig09");
        }
      },
      pipetrig07(q) {
        const held = q.held(); // what the player carried when this fired
        // step 44: only while holding cork09, once
        if (held === "cork09" && once(q, "step44")) {
          q.use();
          set(q, "pipetrig07", 1, 0, 0);
          set(q, "pipe07", 1, 1, 0);
          set(q, "pipeblock07", 99, 0, 0);
          q.xp(5, "pipetrig07");
        }
      },
      switch03(q) {
        // step 45: once
        if (once(q, "step45")) {
          q.xp(5, "switch03");
          set(q, "switch03t", 1, 1, 0);
          set(q, "sentry04_lp", 1, 0, 0);
          set(q, "sentry05_lp", 1, 0, 0);
          set(q, "sentry15_lp", 1, 0, 0);
          set(q, "switch03", 99, 0, 0);
          q.send("qswfs", "sentry04", "turnoff");
          set(q, "sentry04", 1, 1, 0);
          q.send("qswfs", "sentry05", "turnoff");
          set(q, "sentry05", 1, 1, 0);
          q.send("qswfs", "sentry15", "turnoff");
          set(q, "sentry15", 1, 1, 0);
        }
      },
      seedpile13(q) {
        // step 46
        giveSeeds(q, 137, 3, 3);
      },
      gear02trig2(q) {
        const held = q.held(); // what the player carried when this fired
        // step 47: only while holding gear02b, once
        if (held === "gear02b" && once(q, "step47")) {
          q.use();
          set(q, "gear02info2", 99, 0, 0);
          set(q, "puz02start2", 10, 1, 0);
          set(q, "trig02b", 1, 1, 1);
          set(q, "gear02trig2", 99, 0, 0);
          q.xp(5, "gear02trig2");
          q.after(500, () => {
            set(q, "gear02sound2", 1, 1, 0);
          });
        }
      },
      gear02trig3(q) {
        const held = q.held(); // what the player carried when this fired
        // step 50: only while holding gear02a, once
        if (held === "gear02a" && once(q, "step50")) {
          q.use();
          set(q, "gear02info3", 99, 0, 0);
          set(q, "puz02start3", 10, 1, 0);
          set(q, "trig02c", 1, 1, 1);
          set(q, "gear02trig3", 99, 0, 0);
          q.after(280, () => {
            q.xp(5, "gear02trig3");
            set(q, "gear02sound3", 1, 1, 0);
          });
        }
      },
      pipetrig06(q) {
        const held = q.held(); // what the player carried when this fired
        // step 51: only while holding cork05, once
        if (held === "cork05" && once(q, "step51")) {
          q.use();
          set(q, "pipetrig06", 1, 0, 0);
          set(q, "pipe06", 1, 1, 0);
          set(q, "pipeblock06", 99, 0, 0);
          q.xp(5, "pipetrig06");
        }
      },
      gear03trig(q) {
        const held = q.held(); // what the player carried when this fired
        // step 52: only while holding gear03, once
        if (held === "gear03" && once(q, "step52")) {
          q.use();
          set(q, "gear03info", 99, 0, 0);
          set(q, "puz03start", 9, 1, 0);
          set(q, "trig03a", 1, 1, 1);
          set(q, "gear03trig", 99, 0, 0);
          q.xp(5, "gear03trig");
          q.after(470, () => {
            set(q, "gear03sound", 1, 1, 0);
          });
        }
      },
      pipetrig05(q) {
        const held = q.held(); // what the player carried when this fired
        // step 53: only while holding cork06, once
        if (held === "cork06" && once(q, "step53")) {
          q.use();
          set(q, "pipetrig05", 1, 0, 0);
          set(q, "pipe05", 1, 1, 0);
          set(q, "pipeblock05", 99, 0, 0);
          q.xp(5, "pipetrig05");
        }
      },
      ambush02vol(q) {
        // step 54
        q.send("qswfs", "phantom__04a", "appear");
        q.send("qsp", "phantom__04a", "path04a");
        set(q, "phantom__04a", 1, 1, 1);
        q.send("qswfs", "phantom__04b", "appear");
        q.send("qsp", "phantom__04b", "path04a");
        set(q, "phantom__04b", 1, 1, 1);
        q.send("qswfs", "phantom__04c", "appear");
        q.send("qsp", "phantom__04c", "path04b");
        set(q, "phantom__04c", 1, 1, 1);
        q.send("qswfs", "phantom__04d", "appear");
        q.send("qsp", "phantom__04d", "path04b");
        set(q, "phantom__04d", 1, 1, 1);
        set(q, "ambush02vol", 99, 0, 0);
      },
      phantom__04c__give_gem(q) {
        // step 55: once
        if (once(q, "step55")) {
          q.send("qad", "phantom__04c__give_gem", 0, "null");
          q.gems(25);
        }
      },
      phantom__04d__give_gem(q) {
        // step 56: once
        if (once(q, "step56")) {
          q.send("qad", "phantom__04d__give_gem", 0, "null");
          q.gems(25);
        }
      },
      seedpile19(q) {
        // step 57
        giveSeeds(q, 137, 3, 3);
      },
      phantom__04b__give_gem(q) {
        // step 58: once
        if (once(q, "step58")) {
          q.send("qad", "phantom__04b__give_gem", 0, "null");
          q.gems(25);
        }
      },
      back26b2(q) {
        // step 60
        set(q, "puz04d", 1, 1, 0);
        set(q, "puz04d", 0, 1, 0);
        set(q, "puz04h", 1, 1, 0);
        set(q, "puz04h", 0, 1, 0);
      },
      to6c1(q) {
        // step 61
        q.room("in6c1", "in6c1");
        ambient(q, "in6c1");
      },
      seedpile20(q) {
        // step 62
        giveSeeds(q, 137, 3, 3);
      },
      ambush11avol(q) {
        // step 63
        set(q, "phantomvol02", 1, 1, 0);
        q.send("qswfs", "phantom11a", "appear");
        q.send("qsp", "phantom11a", "path11a");
        set(q, "phantom11a", 1, 1, 1);
        set(q, "ambush11avol", 99, 0, 0);
      },
      ambush11bvol(q) {
        // step 64
        q.send("qswfs", "phantom11b", "appear");
        q.send("qsp", "phantom11b", "path11b");
        set(q, "phantom11b", 1, 1, 1);
        set(q, "ambush11bvol", 99, 0, 0);
      },
      ambush11cvol(q) {
        // step 65
        q.send("qswfs", "phantom11c", "appear");
        q.send("qsp", "phantom11c", "path11c");
        set(q, "phantom11c", 1, 1, 1);
        set(q, "ambush11cvol", 99, 0, 0);
      },
      to6b3(q) {
        // step 66
        q.room("in6b3", "in6b3");
        ambient(q, "in6b3");
      },
      back26b(q) {
        // step 67
        set(q, "puz04d", 1, 1, 0);
        set(q, "puz04d", 0, 1, 0);
        set(q, "puz04h", 1, 1, 0);
        set(q, "puz04h", 0, 1, 0);
      },
      seedpile03(q) {
        // step 68
        giveSeeds(q, 137, 3, 3);
      },
      switch04(q) {
        // step 69: once
        if (once(q, "step69")) {
          q.xp(5, "switch04");
          set(q, "switch04t", 1, 1, 0);
          set(q, "sentry06_lp", 1, 0, 0);
          set(q, "switch04", 99, 0, 0);
          q.after(840, () => {
            q.send("qswfs", "sentry06", "turnoff");
            set(q, "sentry06", 1, 1, 0);
          });
        }
      },
      phantom__06b__give_gem(q) {
        // step 70: once
        if (once(q, "step70")) {
          q.send("qad", "phantom__06b__give_gem", 0, "null");
          q.gems(25);
        }
      },
      avatar1(q) {
        // step 71
        q.send("qcmd", 2, "avatar1", 10839, 0);
      },
      factory10__0___give_d(q) {
        // step 72: once
        if (once(q, "step72")) {
          q.send("qad", "factory10__0___give_d", 0, "null");
          q.gems(25);
        }
      },
      pipetrig01(q) {
        const held = q.held(); // what the player carried when this fired
        // step 73: only while holding cork01, once
        if (held === "cork01" && once(q, "step73")) {
          q.use();
          set(q, "pipetrig01", 1, 0, 0);
          set(q, "pipe01", 1, 1, 0);
          set(q, "sludge01", 1, 0, 0);
          set(q, "pipeblock01", 99, 0, 0);
          q.xp(5, "pipetrig01");
        }
      },
      switch05(q) {
        // step 74: once
        if (once(q, "step74")) {
          q.xp(5, "switch05");
          set(q, "switch05t", 1, 1, 0);
          set(q, "sentry07_lp", 1, 0, 0);
          set(q, "switch05", 99, 0, 0);
          q.after(240, () => {
            q.send("qswfs", "sentry07", "turnoff");
            set(q, "sentry07", 1, 1, 0);
          });
        }
      },
      gear04trig2(q) {
        const held = q.held(); // what the player carried when this fired
        // step 75: only while holding gear04a, once
        if (held === "gear04a" && once(q, "step75")) {
          q.use();
          set(q, "gear04info2", 99, 0, 0);
          set(q, "puz04start2", 9, 1, 0);
          set(q, "trig04b", 1, 1, 1);
          set(q, "gear04trig2", 99, 0, 0);
          q.xp(5, "gear04trig2");
        }
      },
      seedpile16(q) {
        // step 77
        giveSeeds(q, 137, 3, 3);
      },
      gear04trig1(q) {
        const held = q.held(); // what the player carried when this fired
        // step 78: only while holding gear04b, once
        if (held === "gear04b" && once(q, "step78")) {
          q.use();
          set(q, "gear04info1", 99, 0, 0);
          set(q, "puz04start1", 10, 1, 0);
          set(q, "trig04a", 1, 1, 1);
          set(q, "gear04trig1", 99, 0, 0);
          q.xp(5, "gear04trig1");
        }
      },
      factory01__0___give_d(q) {
        // step 79: once
        if (once(q, "step79")) {
          q.send("qad", "factory01__0___give_d", 0, "null");
          q.gems(25);
        }
      },
      pipetrig02(q) {
        const held = q.held(); // what the player carried when this fired
        // step 80: only while holding cork02, once
        if (held === "cork02" && once(q, "step80")) {
          q.use();
          set(q, "pipetrig02", 1, 0, 0);
          set(q, "pipe02", 1, 1, 0);
          set(q, "sludge02", 1, 0, 0);
          set(q, "pipeblock02", 99, 0, 0);
          q.xp(5, "pipetrig02");
        }
      },
      seedpile04(q) {
        // step 81
        giveSeeds(q, 137, 3, 3);
      },
      factory02__2___give_d(q) {
        // step 82: once
        if (once(q, "step82")) {
          q.send("qad", "factory02__2___give_d", 0, "null");
          q.gems(25);
        }
      },
      factory03__2___give_d(q) {
        // step 83: once
        if (once(q, "step83")) {
          q.send("qad", "factory03__2___give_d", 0, "null");
          q.gems(25);
        }
      },
      factory03__1___give_d(q) {
        // step 84: once
        if (once(q, "step84")) {
          q.send("qad", "factory03__1___give_d", 0, "null");
          q.gems(25);
        }
      },
      factory02__1___give_d(q) {
        // step 85: once
        if (once(q, "step85")) {
          q.send("qad", "factory02__1___give_d", 0, "null");
          q.gems(25);
        }
      },
      factory02__0___give_d(q) {
        // step 86: once
        if (once(q, "step86")) {
          q.send("qad", "factory02__0___give_d", 0, "null");
          q.gems(25);
        }
      },
      factory03__0___give_d(q) {
        // step 87: once
        if (once(q, "step87")) {
          q.send("qad", "factory03__0___give_d", 0, "null");
          q.gems(25);
        }
      },
      factory04__1___give_d(q) {
        // step 93: once
        if (once(q, "step93")) {
          q.send("qad", "factory04__1___give_d", 0, "null");
          q.gems(25);
        }
      },
      factory04__0___give_d(q) {
        // step 94: once
        if (once(q, "step94")) {
          q.send("qad", "factory04__0___give_d", 0, "null");
          q.gems(25);
        }
      },
      lavastart(q) {
        // step 102
        set(q, "lavastart", 99, 0, 0);
      },
      seedpile05(q) {
        const n = tally(q, "trigger seedpile05");
        // step 103: the 1st time
        if (n === 1) {
          giveSeeds(q, 137, 3, 3);
          set(q, "lavacrack01", 1, 1, 0);
          set(q, "lavahurt01", 1, 1, 1);
          set(q, "lavasound1", 1, 1, 0);
          set(q, "lavasound3", 1, 1, 0);
        }
        // step 104: the 2nd time and after
        if (n >= 2) {
          giveSeeds(q, 137, 3, 3);
        }
      },
      lavahurt01(q) {
        // step 105
        set(q, "lavacrack01", 0, 1, 0);
        set(q, "lavahurt01", 0, 0, 0);
        set(q, "lavasound1", 0, 0, 0);
        set(q, "lavasound3", 0, 0, 0);
        q.after(1000, () => {
          set(q, "lavacrack02", 1, 1, 0);
          set(q, "lavahurt02", 1, 1, 1);
          set(q, "lavasound2", 1, 1, 0);
          set(q, "lavasound4", 1, 1, 0);
          q.after(5010, () => {
            set(q, "lavahurt01", 1, 1, 1);
            set(q, "lavasound1", 1, 1, 0);
            set(q, "lavasound3", 1, 1, 0);
          });
        });
      },
      factory06__0___give_d(q) {
        // step 106: once
        if (once(q, "step106")) {
          q.send("qad", "factory06__0___give_d", 0, "null");
          q.gems(25);
        }
      },
      factory06__1___give_d(q) {
        // step 107: once
        if (once(q, "step107")) {
          q.send("qad", "factory06__1___give_d", 0, "null");
          q.gems(25);
        }
      },
      factory07__0___give_d(q) {
        // step 108: once
        if (once(q, "step108")) {
          q.send("qcmdVT", 1, "lavatoggle", 0, 0, 0);
          q.send("qad", "factory07__0___give_d", 0, "null");
          q.after(950, () => {
            set(q, "lavacrack02", 0, 1, 0);
            set(q, "lavahurt02", 0, 0, 0);
            set(q, "lavasound2", 0, 0, 0);
            set(q, "lavasound4", 0, 0, 0);
            q.after(1000, () => {
              set(q, "lavacrack01", 1, 1, 0);
              set(q, "lavahurt01", 1, 1, 1);
              set(q, "lavasound1", 1, 1, 0);
              set(q, "lavasound3", 1, 1, 0);
              q.gems(25);
            });
          });
        }
      },
      seedpile14(q) {
        const n = tally(q, "trigger seedpile14");
        // step 109: the 1st time
        if (n === 1) {
          giveSeeds(q, 137, 3, 3);
        }
        // step 110: the 2nd time
        if (n === 2) {
          giveSeeds(q, 137, 3, 3);
          q.after(560, () => {
            set(q, "lavacrack01", 0, 1, 0);
            set(q, "lavahurt01", 0, 0, 0);
            set(q, "lavasound1", 0, 0, 0);
            set(q, "lavasound3", 0, 0, 0);
            q.after(1000, () => {
              set(q, "lavacrack02", 1, 1, 0);
              set(q, "lavahurt02", 1, 1, 1);
              set(q, "lavasound2", 1, 1, 0);
              set(q, "lavasound4", 1, 1, 0);
            });
          });
        }
        // step 111: the 3rd time
        if (n === 3) {
          giveSeeds(q, 137, 3, 3);
          q.after(2710, () => {
            q.send("qcmdVT", 1, "lavatoggle", 0, 0, 0);
          });
        }
      },
      phanttrig(q) {
        // step 112
        q.send("qswfs", "phantom__10a", "appear");
        q.send("qsp", "phantom__10a", "path10");
        set(q, "phantom__10a", 1, 1, 1);
        q.send("qswfs", "phantom__10b", "appear");
        q.send("qsp", "phantom__10b", "path10");
        set(q, "phantom__10b", 1, 1, 1);
        set(q, "phanttrig", 99, 0, 0);
      },
      pipetrig04(q) {
        const held = q.held(); // what the player carried when this fired
        // step 113: unless holding cork04
        if (held !== "cork04") {
          set(q, "pipeinfo04", 1, 1, 1);
          q.send("qcmd", 2, "pipeinfo04", 10903, 2);
        }
        // step 115: only while holding cork04, once
        if (held === "cork04" && once(q, "step115")) {
          q.use();
          set(q, "pipetrig04", 1, 0, 0);
          set(q, "pipe04", 1, 1, 0);
          set(q, "pipeinfo04", 0, 0, 0);
          set(q, "pipecount", 1, 0, 0);
          q.xp(5, "pipetrig04");
          q.after(1450, () => {
            set(q, "lavacrack01", 0, 1, 0);
            set(q, "lavahurt01", 0, 0, 0);
            set(q, "lavasound1", 0, 0, 0);
            set(q, "lavasound3", 0, 0, 0);
          });
        }
      },
      phantom__10b__give_gem(q) {
        // step 114: once
        if (once(q, "step114")) {
          q.send("qad", "phantom__10b__give_gem", 0, "null");
          set(q, "lavacrack02", 0, 1, 0);
          set(q, "lavahurt02", 0, 0, 0);
          set(q, "lavasound2", 0, 0, 0);
          set(q, "lavasound4", 0, 0, 0);
          set(q, "lavacrack01", 1, 1, 0);
          set(q, "lavahurt01", 1, 1, 1);
          set(q, "lavasound1", 1, 1, 0);
          set(q, "lavasound3", 1, 1, 0);
          q.gems(25);
        }
      },
      pipetrig03(q) {
        const held = q.held(); // what the player carried when this fired
        // step 117: only while holding cork03, once
        if (held === "cork03" && once(q, "step117")) {
          q.use();
          set(q, "pipetrig03", 1, 0, 0);
          set(q, "pipe03", 1, 1, 0);
          set(q, "sludge03", 1, 0, 0);
          set(q, "pipecount", 2, 1, 1);
          set(q, "greelyshow", 1, 1, 1);
          q.xp(5, "pipetrig03");
          set(q, "lavacrack02", 0, 1, 0);
          set(q, "lavahurt02", 0, 0, 0);
          set(q, "lavasound2", 0, 0, 0);
          set(q, "lavasound4", 0, 0, 0);
          q.after(1000, () => {
            set(q, "lavacrack01", 1, 1, 0);
            set(q, "lavahurt01", 1, 1, 1);
            set(q, "lavasound1", 1, 1, 0);
            set(q, "lavasound3", 1, 1, 0);
            q.after(4000, () => {
              set(q, "lavacrack01", 0, 1, 0);
              set(q, "lavahurt01", 0, 0, 0);
              set(q, "lavasound1", 0, 0, 0);
              set(q, "lavasound3", 0, 0, 0);
            });
          });
        }
      },
      greelyshow(q) {
        // step 118
        appear(q, "greely1");
        set(q, "greely1", 2, 1, 1);
        q.send("qcmd", 38, 10917);
        q.send("qicon", "greely1", 1);
        set(q, "greelyshow", 99, 0, 0);
      },
      greely1(q) {
        const n = tally(q, "trigger greely1");
        // step 119: the 1st time
        if (n === 1) {
          q.send("qcmd", 3, 0, "greely1", 2, 10870);
          q.after(460, () => {
            set(q, "lavacrack02", 1, 1, 0);
            set(q, "lavahurt02", 1, 1, 1);
            set(q, "lavasound2", 1, 1, 0);
            set(q, "lavasound4", 1, 1, 0);
            q.after(2990, () => {
              q.send("qcmdVT", 1, "lavatoggle", 0, 0, 0);
              q.after(1000, () => {
                set(q, "lavacrack02", 0, 1, 0);
                set(q, "lavahurt02", 0, 0, 0);
                set(q, "lavasound2", 0, 0, 0);
                set(q, "lavasound4", 0, 0, 0);
                q.after(1000, () => {
                  set(q, "lavacrack01", 1, 1, 0);
                  set(q, "lavahurt01", 1, 1, 1);
                  set(q, "lavasound1", 1, 1, 0);
                  set(q, "lavasound3", 1, 1, 0);
                  q.after(4000, () => {
                    set(q, "lavacrack01", 0, 1, 0);
                    set(q, "lavahurt01", 0, 0, 0);
                    set(q, "lavasound1", 0, 0, 0);
                    set(q, "lavasound3", 0, 0, 0);
                    q.after(1000, () => {
                      set(q, "lavacrack02", 1, 1, 0);
                      set(q, "lavahurt02", 1, 1, 1);
                      set(q, "lavasound2", 1, 1, 0);
                      set(q, "lavasound4", 1, 1, 0);
                      q.after(5000, () => {
                        set(q, "lavacrack02", 0, 1, 0);
                        set(q, "lavahurt02", 0, 0, 0);
                        set(q, "lavasound2", 0, 0, 0);
                        set(q, "lavasound4", 0, 0, 0);
                        set(q, "lavacrack01", 1, 1, 0);
                        set(q, "lavahurt01", 1, 1, 1);
                        set(q, "lavasound1", 1, 1, 0);
                        set(q, "lavasound3", 1, 1, 0);
                      });
                    });
                  });
                });
              });
            });
          });
        }
        // step 120: the 2nd time
        if (n === 2) {
          q.send("qcmd", 3, 0, "greely1", 4, 10895);
        }
        // step 121: the 3rd time and after
        if (n >= 3) {
          q.send("qcmd", 3, 0, "greely1", 4, 10895);
        }
      },
      enterboss(q) {
        // step 124
        set(q, "enterboss", 99, 0, 0);
        q.after(1690, () => {
          q.send("qmusic", 0);
          q.send("qplayswf", "2558", "null", "null");
          q.send("qsp", "boss_easy", "kingpath");
          set(q, "boss_easy", 0, 1, 1);
          q.send("qcmd", 38, 10919);
          q.send("qmusic", 0);
          q.send("qmusic", "ajq_muscavebossbattle");
          set(q, "phantomvol03", 1, 1, 0);
        });
      },
      teleportking(q) {
        // step 125
        q.room("in6d", "in6d");
        ambient(q, "in6d");
      },
      seedpile9(q) {
        // step 126
        giveSeeds(q, 137, 3, 3);
        set(q, "seedpile9", 99, 0, 0);
        set(q, "seedpile9t", 1, 1, 0);
        q.send("qcmdVT", 1, "seedcount", bump(q, "seedcount"), 0, 0); // one more than last time
        q.after(21330, () => {
          set(q, "seedpile9t", 0, 1, 0);
          q.send("qcmdVT", 1, "seeddelay", 0, 0, 0);
          q.after(1000, () => {
            set(q, "seedpile9", 0, 1, 1);
            q.send("qcmdVT", 1, "seedtimer9", 0, 0, 0);
          });
        });
      },
      seedpile8(q) {
        // step 127
        giveSeeds(q, 137, 3, 3);
        set(q, "seedpile8", 99, 0, 0);
        set(q, "seedpile8t", 1, 1, 0);
        q.send("qcmdVT", 1, "seedcount", bump(q, "seedcount"), 0, 0); // one more than last time
        q.after(21330, () => {
          set(q, "seedpile8t", 0, 1, 0);
          q.send("qcmdVT", 1, "seeddelay", 0, 0, 0);
          q.after(1000, () => {
            set(q, "seedpile8", 0, 1, 1);
            q.send("qcmdVT", 1, "seedtimer8", 0, 0, 0);
          });
        });
      },
      seedpile6(q) {
        // step 128
        giveSeeds(q, 137, 3, 3);
        set(q, "seedpile6", 99, 0, 0);
        set(q, "seedpile6t", 1, 1, 0);
        q.send("qcmdVT", 1, "seedcount", bump(q, "seedcount"), 0, 0); // one more than last time
        q.after(21330, () => {
          set(q, "seedpile6t", 0, 1, 0);
          q.send("qcmdVT", 1, "seeddelay", 0, 0, 0);
          q.after(1000, () => {
            set(q, "seedpile6", 0, 1, 1);
            q.send("qcmdVT", 1, "seedtimer6", 0, 0, 0);
          });
        });
      },
      seedpile7(q) {
        // step 129
        giveSeeds(q, 137, 3, 3);
        set(q, "seedpile7", 99, 0, 0);
        set(q, "seedpile7t", 1, 1, 0);
        q.send("qcmdVT", 1, "seedcount", bump(q, "seedcount"), 0, 0); // one more than last time
        q.after(21330, () => {
          set(q, "seedpile7t", 0, 1, 0);
          q.send("qcmdVT", 1, "seeddelay", 0, 0, 0);
          q.after(1000, () => {
            set(q, "seedpile7", 0, 1, 1);
            q.send("qcmdVT", 1, "seedtimer7", 0, 0, 0);
          });
        });
      },
      kphant__4d__give_gem(q) {
        // step 130: once
        if (once(q, "step130")) {
          q.send("qad", "kphant__4d__give_gem", 0, "null");
          q.gems(25);
        }
      },
      greely2(q) {
        // step 131
        q.send("qcmd", 3, 0, "greely2", 1, 10896);
        q.after(950, () => {
          q.send("qmusic", "ajq_musvolin");
        });
      },
      exitking(q) {
        // step 135
        q.room("in6e", "in6e");
        ambient(q, "in6e");
      },
      init6e(q) {
        // step 136
        q.send("qcmd", 38, 10922);
        set(q, "phantomvol05", 1, 1, 0);
        set(q, "init6e", 99, 0, 0);
      },
      playendswf(q) {
        // step 137
        q.after(2410, () => {
          set(q, "phantomvol05", 99, 0, 0);
          q.send("qmusic", 0);
          q.send("qplayswf", "2551", "null", "null");
          set(q, "playendswf", 99, 0, 0);
        });
      },
      to6f(q) {
        // step 138
        q.room("in6f", "in6f");
        ambient(q, "in6f");
      },
      init6f(q) {
        // step 139: once
        if (once(q, "step139")) {
          q.send("qcmd", 38, 10923);
          q.send("qcmdVT", 1, "80_uri", 1, 0, 0);
          q.send("qposturi", "/adventure6-greelysinferno/#80-escapethevolcano/#0#001");
          q.send("qcmdVT", 1, "80_uri", 99, 0, 0);
          appear(q, "cosmo2");
          appear(q, "graham2");
          set(q, "graham2", 2, 1, 0);
          appear(q, "liza1");
          set(q, "liza1", 2, 1, 0);
          set(q, "init6f", 99, 0, 0);
        }
      },
      cosmo2(q) {
        const n = tally(q, "trigger cosmo2");
        // step 140: the 1st time
        if (n === 1) {
          q.after(1380, () => {
            q.send("qcmd", 3, 0, "cosmo2", 1, 10893);
          });
        }
        // step 141: the 2nd time
        if (n === 2) {
          q.send("qcmd", 3, 0, "cosmo2", 4, 10897);
        }
        // step 142: the 3rd time and after
        if (n >= 3) {
          q.send("qcmd", 3, 0, "cosmo2", 4, 10897);
        }
      },
      graham2(q) {
        // step 144
        q.send("qcmd", 3, 0, "graham2", 3, 10909);
      },
      liza1(q) {
        // step 145
        q.send("qcmd", 3, 0, "liza1", 3, 10921);
      },
      exitroom(q) {
        // step 146
        q.send("qcmd", 19);
      },
      trig01(q) {
        // a mirror of puz01: turns it; the number of the door that opened, if one did
        const opened = turn(q, 0, "trig01");
        if (opened === 0) {
          set(q, "puz01beam01", 50, 1, 0);
          q.xp(25, "puz01done");
          set(q, "puz01end", 1, 1, 0);
          set(q, "puz01door", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          set(q, "puz01frame", 2, 1, 0);
          set(q, "trig01", 99, 0, 0);
          q.after(1390, () => {
            set(q, "puz01block", 99, 0, 0);
          });
        }
        if (once(q, "first turn trig01")) {
          set(q, "gear01sound", 1, 1, 0);
        }
      },
      trig02b(q) {
        // a mirror of puz02: turns it; the number of the door that opened, if one did
        const opened = turn(q, 1, "trig02b");
        if (opened === 0) {
          set(q, "puz02end2", 1, 1, 0);
          set(q, "puz02frame1l", 2, 1, 0);
          q.xp(25, "puz02done1");
          set(q, "puz02door1", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          set(q, "gear02trig3", 0, 1, 1);
          q.after(1700, () => {
            set(q, "puz02block1", 99, 0, 0);
          });
        }
        if (opened === 1) {
          set(q, "puz02beam10", 70, 1, 0);
          set(q, "puz02g", 7, 1, 0);
          set(q, "puz02beam11", 1, 1, 0);
          set(q, "puz02h", 5, 1, 0);
          set(q, "puz02beam12", 1, 1, 0);
          set(q, "puz02i", 6, 1, 0);
          set(q, "puz02beam13", 1, 1, 0);
          set(q, "puz02j", 4, 1, 0);
          set(q, "puz02beam14", 1, 1, 0);
          set(q, "puz02k", 6, 1, 0);
          set(q, "puz02beam15", 1, 1, 0);
          set(q, "puz02l", 7, 1, 0);
          set(q, "puz02beam16", 1, 1, 0);
          set(q, "puz02m", 5, 1, 0);
          set(q, "puz02beam17", 150, 1, 0);
          set(q, "puz02end5", 1, 1, 0);
          set(q, "puz02end5x", 1, 1, 0);
          q.xp(25, "puz02done2");
          set(q, "puz02door2", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          set(q, "trig02a", 99, 0, 0);
          set(q, "trig02b", 99, 0, 0);
          set(q, "trig02c", 99, 0, 0);
          set(q, "cork05", 1, 1, 0);
          q.after(1110, () => {
            set(q, "puz02block2", 99, 0, 0);
          });
        }
      },
      trig02a(q) {
        // a mirror of puz02: turns it; the number of the door that opened, if one did
        const opened = turn(q, 1, "trig02a");
        if (opened === 0) {
          set(q, "puz02end2", 1, 1, 0);
          set(q, "puz02frame1l", 2, 1, 0);
          q.xp(25, "puz02done1");
          set(q, "puz02door1", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          set(q, "gear02trig3", 0, 1, 1);
          q.after(1700, () => {
            set(q, "puz02block1", 99, 0, 0);
          });
        }
        if (opened === 1) {
          set(q, "puz02beam10", 70, 1, 0);
          set(q, "puz02g", 7, 1, 0);
          set(q, "puz02beam11", 1, 1, 0);
          set(q, "puz02h", 5, 1, 0);
          set(q, "puz02beam12", 1, 1, 0);
          set(q, "puz02i", 6, 1, 0);
          set(q, "puz02beam13", 1, 1, 0);
          set(q, "puz02j", 4, 1, 0);
          set(q, "puz02beam14", 1, 1, 0);
          set(q, "puz02k", 6, 1, 0);
          set(q, "puz02beam15", 1, 1, 0);
          set(q, "puz02l", 7, 1, 0);
          set(q, "puz02beam16", 1, 1, 0);
          set(q, "puz02m", 5, 1, 0);
          set(q, "puz02beam17", 150, 1, 0);
          set(q, "puz02end5", 1, 1, 0);
          set(q, "puz02end5x", 1, 1, 0);
          q.xp(25, "puz02done2");
          set(q, "puz02door2", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          set(q, "trig02a", 99, 0, 0);
          set(q, "trig02b", 99, 0, 0);
          set(q, "trig02c", 99, 0, 0);
          set(q, "cork05", 1, 1, 0);
          q.after(1110, () => {
            set(q, "puz02block2", 99, 0, 0);
          });
        }
      },
      trig02c(q) {
        // a mirror of puz02: turns it; the number of the door that opened, if one did
        const opened = turn(q, 1, "trig02c");
        if (opened === 0) {
          set(q, "puz02end2", 1, 1, 0);
          set(q, "puz02frame1l", 2, 1, 0);
          q.xp(25, "puz02done1");
          set(q, "puz02door1", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          set(q, "gear02trig3", 0, 1, 1);
          q.after(1700, () => {
            set(q, "puz02block1", 99, 0, 0);
          });
        }
        if (opened === 1) {
          set(q, "puz02beam10", 70, 1, 0);
          set(q, "puz02g", 7, 1, 0);
          set(q, "puz02beam11", 1, 1, 0);
          set(q, "puz02h", 5, 1, 0);
          set(q, "puz02beam12", 1, 1, 0);
          set(q, "puz02i", 6, 1, 0);
          set(q, "puz02beam13", 1, 1, 0);
          set(q, "puz02j", 4, 1, 0);
          set(q, "puz02beam14", 1, 1, 0);
          set(q, "puz02k", 6, 1, 0);
          set(q, "puz02beam15", 1, 1, 0);
          set(q, "puz02l", 7, 1, 0);
          set(q, "puz02beam16", 1, 1, 0);
          set(q, "puz02m", 5, 1, 0);
          set(q, "puz02beam17", 150, 1, 0);
          set(q, "puz02end5", 1, 1, 0);
          set(q, "puz02end5x", 1, 1, 0);
          q.xp(25, "puz02done2");
          set(q, "puz02door2", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          set(q, "trig02a", 99, 0, 0);
          set(q, "trig02b", 99, 0, 0);
          set(q, "trig02c", 99, 0, 0);
          set(q, "cork05", 1, 1, 0);
          q.after(1110, () => {
            set(q, "puz02block2", 99, 0, 0);
          });
        }
      },
      trig03a(q) {
        // a mirror of puz03: turns it; the number of the door that opened, if one did
        const opened = turn(q, 2, "trig03a");
        if (opened === 0) {
          q.xp(25, "puz03done");
          set(q, "puz03end", 1, 1, 0);
          set(q, "puz03door", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          set(q, "puz03frame", 2, 1, 0);
          set(q, "puz03beam12", 1, 1, 0);
          set(q, "trig03a", 99, 0, 0);
          set(q, "trig03b", 99, 0, 0);
          set(q, "trig03c", 99, 0, 0);
          set(q, "trig03d", 99, 0, 0);
          set(q, "trig03e", 99, 0, 0);
          set(q, "trig03f", 99, 0, 0);
          set(q, "trig03g", 99, 0, 0);
          set(q, "trig03h", 99, 0, 0);
          set(q, "cork06", 1, 1, 0);
          q.after(1640, () => {
            set(q, "puz03block", 99, 0, 0);
          });
        }
      },
      trig03e(q) {
        // a mirror of puz03: turns it; the number of the door that opened, if one did
        const opened = turn(q, 2, "trig03e");
        if (opened === 0) {
          q.xp(25, "puz03done");
          set(q, "puz03end", 1, 1, 0);
          set(q, "puz03door", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          set(q, "puz03frame", 2, 1, 0);
          set(q, "puz03beam12", 1, 1, 0);
          set(q, "trig03a", 99, 0, 0);
          set(q, "trig03b", 99, 0, 0);
          set(q, "trig03c", 99, 0, 0);
          set(q, "trig03d", 99, 0, 0);
          set(q, "trig03e", 99, 0, 0);
          set(q, "trig03f", 99, 0, 0);
          set(q, "trig03g", 99, 0, 0);
          set(q, "trig03h", 99, 0, 0);
          set(q, "cork06", 1, 1, 0);
          q.after(1640, () => {
            set(q, "puz03block", 99, 0, 0);
          });
        }
      },
      trig03d(q) {
        // a mirror of puz03: turns it; the number of the door that opened, if one did
        const opened = turn(q, 2, "trig03d");
        if (opened === 0) {
          q.xp(25, "puz03done");
          set(q, "puz03end", 1, 1, 0);
          set(q, "puz03door", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          set(q, "puz03frame", 2, 1, 0);
          set(q, "puz03beam12", 1, 1, 0);
          set(q, "trig03a", 99, 0, 0);
          set(q, "trig03b", 99, 0, 0);
          set(q, "trig03c", 99, 0, 0);
          set(q, "trig03d", 99, 0, 0);
          set(q, "trig03e", 99, 0, 0);
          set(q, "trig03f", 99, 0, 0);
          set(q, "trig03g", 99, 0, 0);
          set(q, "trig03h", 99, 0, 0);
          set(q, "cork06", 1, 1, 0);
          q.after(1640, () => {
            set(q, "puz03block", 99, 0, 0);
          });
        }
      },
      trig03c(q) {
        // a mirror of puz03: turns it; the number of the door that opened, if one did
        const opened = turn(q, 2, "trig03c");
        if (opened === 0) {
          q.xp(25, "puz03done");
          set(q, "puz03end", 1, 1, 0);
          set(q, "puz03door", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          set(q, "puz03frame", 2, 1, 0);
          set(q, "puz03beam12", 1, 1, 0);
          set(q, "trig03a", 99, 0, 0);
          set(q, "trig03b", 99, 0, 0);
          set(q, "trig03c", 99, 0, 0);
          set(q, "trig03d", 99, 0, 0);
          set(q, "trig03e", 99, 0, 0);
          set(q, "trig03f", 99, 0, 0);
          set(q, "trig03g", 99, 0, 0);
          set(q, "trig03h", 99, 0, 0);
          set(q, "cork06", 1, 1, 0);
          q.after(1640, () => {
            set(q, "puz03block", 99, 0, 0);
          });
        }
      },
      trig03b(q) {
        // a mirror of puz03: turns it; the number of the door that opened, if one did
        const opened = turn(q, 2, "trig03b");
        if (opened === 0) {
          q.xp(25, "puz03done");
          set(q, "puz03end", 1, 1, 0);
          set(q, "puz03door", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          set(q, "puz03frame", 2, 1, 0);
          set(q, "puz03beam12", 1, 1, 0);
          set(q, "trig03a", 99, 0, 0);
          set(q, "trig03b", 99, 0, 0);
          set(q, "trig03c", 99, 0, 0);
          set(q, "trig03d", 99, 0, 0);
          set(q, "trig03e", 99, 0, 0);
          set(q, "trig03f", 99, 0, 0);
          set(q, "trig03g", 99, 0, 0);
          set(q, "trig03h", 99, 0, 0);
          set(q, "cork06", 1, 1, 0);
          q.after(1640, () => {
            set(q, "puz03block", 99, 0, 0);
          });
        }
      },
      trig03f(q) {
        // a mirror of puz03: turns it; the number of the door that opened, if one did
        const opened = turn(q, 2, "trig03f");
        if (opened === 0) {
          q.xp(25, "puz03done");
          set(q, "puz03end", 1, 1, 0);
          set(q, "puz03door", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          set(q, "puz03frame", 2, 1, 0);
          set(q, "puz03beam12", 1, 1, 0);
          set(q, "trig03a", 99, 0, 0);
          set(q, "trig03b", 99, 0, 0);
          set(q, "trig03c", 99, 0, 0);
          set(q, "trig03d", 99, 0, 0);
          set(q, "trig03e", 99, 0, 0);
          set(q, "trig03f", 99, 0, 0);
          set(q, "trig03g", 99, 0, 0);
          set(q, "trig03h", 99, 0, 0);
          set(q, "cork06", 1, 1, 0);
          q.after(1640, () => {
            set(q, "puz03block", 99, 0, 0);
          });
        }
      },
      trig03g(q) {
        // a mirror of puz03: turns it; the number of the door that opened, if one did
        const opened = turn(q, 2, "trig03g");
        if (opened === 0) {
          q.xp(25, "puz03done");
          set(q, "puz03end", 1, 1, 0);
          set(q, "puz03door", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          set(q, "puz03frame", 2, 1, 0);
          set(q, "puz03beam12", 1, 1, 0);
          set(q, "trig03a", 99, 0, 0);
          set(q, "trig03b", 99, 0, 0);
          set(q, "trig03c", 99, 0, 0);
          set(q, "trig03d", 99, 0, 0);
          set(q, "trig03e", 99, 0, 0);
          set(q, "trig03f", 99, 0, 0);
          set(q, "trig03g", 99, 0, 0);
          set(q, "trig03h", 99, 0, 0);
          set(q, "cork06", 1, 1, 0);
          q.after(1640, () => {
            set(q, "puz03block", 99, 0, 0);
          });
        }
      },
      trig03h(q) {
        // a mirror of puz03: turns it; the number of the door that opened, if one did
        const opened = turn(q, 2, "trig03h");
        if (opened === 0) {
          q.xp(25, "puz03done");
          set(q, "puz03end", 1, 1, 0);
          set(q, "puz03door", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          set(q, "puz03frame", 2, 1, 0);
          set(q, "puz03beam12", 1, 1, 0);
          set(q, "trig03a", 99, 0, 0);
          set(q, "trig03b", 99, 0, 0);
          set(q, "trig03c", 99, 0, 0);
          set(q, "trig03d", 99, 0, 0);
          set(q, "trig03e", 99, 0, 0);
          set(q, "trig03f", 99, 0, 0);
          set(q, "trig03g", 99, 0, 0);
          set(q, "trig03h", 99, 0, 0);
          set(q, "cork06", 1, 1, 0);
          q.after(1640, () => {
            set(q, "puz03block", 99, 0, 0);
          });
        }
      },
      trig04b(q) {
        // a mirror of puz04: turns it; the number of the door that opened, if one did
        const opened = turn(q, 3, "trig04b");
        if (opened === 0) {
          set(q, "puz04beam04", 60, 1, 0);
          set(q, "puz04c", 6, 1, 0);
          set(q, "puz04beam05", 280, 1, 0);
          set(q, "puz04d", 4, 1, 0);
          set(q, "puz04beam06", 1, 1, 0);
          set(q, "puz04e", 5, 1, 0);
          set(q, "puz04beam07", 1, 1, 0);
          set(q, "puz04f", 6, 1, 0);
          set(q, "puz04beam08", 300, 1, 0);
          set(q, "puz04g", 7, 1, 0);
          set(q, "puz04beam09", 150, 1, 0);
          set(q, "puz04h", 4, 1, 0);
          set(q, "puz04beam10", 50, 1, 0);
          set(q, "puz04i", 6, 1, 0);
          set(q, "puz04end2", 1, 1, 0);
          set(q, "puz04frame_r", 2, 1, 0);
          q.xp(25, "puz04done");
          set(q, "puz04door", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          set(q, "trig04a", 99, 0, 0);
          set(q, "trig04b", 99, 0, 0);
          q.after(1650, () => {
            set(q, "puz04block", 99, 0, 0);
          });
        }
        if (once(q, "first turn trig04b")) {
          set(q, "gear04sound2", 1, 1, 0);
        }
      },
      trig04a(q) {
        // a mirror of puz04: turns it; the number of the door that opened, if one did
        const opened = turn(q, 3, "trig04a");
        if (opened === 0) {
          set(q, "puz04beam04", 60, 1, 0);
          set(q, "puz04c", 6, 1, 0);
          set(q, "puz04beam05", 280, 1, 0);
          set(q, "puz04d", 4, 1, 0);
          set(q, "puz04beam06", 1, 1, 0);
          set(q, "puz04e", 5, 1, 0);
          set(q, "puz04beam07", 1, 1, 0);
          set(q, "puz04f", 6, 1, 0);
          set(q, "puz04beam08", 300, 1, 0);
          set(q, "puz04g", 7, 1, 0);
          set(q, "puz04beam09", 150, 1, 0);
          set(q, "puz04h", 4, 1, 0);
          set(q, "puz04beam10", 50, 1, 0);
          set(q, "puz04i", 6, 1, 0);
          set(q, "puz04end2", 1, 1, 0);
          set(q, "puz04frame_r", 2, 1, 0);
          q.xp(25, "puz04done");
          set(q, "puz04door", 1, 1, 0);
          q.send("qsnd", "ajq_gemdoor");
          set(q, "trig04a", 99, 0, 0);
          set(q, "trig04b", 99, 0, 0);
          q.after(1650, () => {
            set(q, "puz04block", 99, 0, 0);
          });
        }
      },
      factory10(q) {
        spawning(q, "factory10"); // the factory starts sending out phantoms
      },
      factory01(q) {
        spawning(q, "factory01"); // the factory starts sending out phantoms
      },
      factory02(q) {
        spawning(q, "factory02"); // the factory starts sending out phantoms
      },
      factory03(q) {
        spawning(q, "factory03"); // the factory starts sending out phantoms
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
      factory07(q) {
        spawning(q, "factory07"); // the factory starts sending out phantoms
      },
    },

    // families of triggers: the rule for any of them; {n} is its number
    triggerLike: [
      [/^phantom(\d+)a__give_gem$/, (q, name) => {
        const n = name.match(/^phantom(\d+)a__give_gem$/)[1];
        // each of them, once each
        if (once(q, "phantom#a__give_gem - " + name)) {
          // step 147
          q.send("qad", `${name}`, 0, "null");
          q.gems(25);
        }
      }],
      [/^phantom(\d+)b__give_gem$/, (q, name) => {
        const n = name.match(/^phantom(\d+)b__give_gem$/)[1];
        // each of them, once each
        if (once(q, "phantom#b__give_gem - " + name)) {
          // step 148
          q.send("qad", `${name}`, 0, "null");
          q.gems(25);
        }
      }],
      [/^phantom(\d+)d__give_gem$/, (q, name) => {
        const n = name.match(/^phantom(\d+)d__give_gem$/)[1];
        // each of them, once each
        if (once(q, "phantom#d__give_gem - " + name)) {
          // step 149
          q.send("qad", `${name}`, 0, "null");
          q.gems(25);
        }
      }],
      [/^phantom(\d+)c__give_gem$/, (q, name) => {
        const n = name.match(/^phantom(\d+)c__give_gem$/)[1];
        // each of them, once each
        if (once(q, "phantom#c__give_gem - " + name)) {
          // step 150
          q.send("qad", `${name}`, 0, "null");
          q.gems(25);
        }
      }],
      [/^lavatrig(\d+)$/, (q, name) => {
        const n = name.match(/^lavatrig(\d+)$/)[1];
        const held = q.held(); // what the player carried when this fired
        // each of them, holding gem#, once each
        if (/^gem\d+[a-z]?$/.test(held || "") && once(q, "lavatrig# gem# " + name)) {
          // step 151
          q.use();
          set(q, `lavaline${n}`, 1, 1, 0);
          set(q, `lavainfo${n}`, 99, 0, 0);
          q.send("qcmdVT", 1, "lavacount", bump(q, "lavacount"), 0, 0); // one more than last time
          counted(q, "lavacount"); // what that count sets off
          q.xp(25, `${name}`);
          set(q, `${name}`, 1, 0, 0);
        }
      }],
      [/^phantom__(\d+)a__give_gem$/, (q, name) => {
        const n = name.match(/^phantom__(\d+)a__give_gem$/)[1];
        // each of them, once each
        if (once(q, "phantom__#a__give_gem - " + name)) {
          // step 152
          q.send("qad", `${name}`, 0, "null");
          q.gems(25);
        }
      }],
      [/^factory(\d+)$/, (q, name) => {
        const n = name.match(/^factory(\d+)$/)[1];
        // each of them
        {
          // step 153
          q.after(360, () => {
            set(q, "lavacrack02", 1, 1, 0);
            set(q, "lavahurt02", 1, 1, 1);
            set(q, "lavasound2", 1, 1, 0);
            set(q, "lavasound4", 1, 1, 0);
          });
        }
      }],
      [/^pod(\d+)__give_gem$/, (q, name) => {
        const n = name.match(/^pod(\d+)__give_gem$/)[1];
        // each of them, once each
        if (once(q, "pod#__give_gem - " + name)) {
          // step 154
          q.send("qad", `${name}`, 0, "null");
          q.gems(5);
        }
      }],
      [/^kphant__(\d+)a__give_gem$/, (q, name) => {
        const n = name.match(/^kphant__(\d+)a__give_gem$/)[1];
        // each of them, once each
        if (once(q, "kphant__#a__give_gem - " + name)) {
          // step 155
          q.send("qad", `${name}`, 0, "null");
          q.gems(25);
        }
      }],
      [/^kphant__(\d+)b__give_gem$/, (q, name) => {
        const n = name.match(/^kphant__(\d+)b__give_gem$/)[1];
        // each of them, once each
        if (once(q, "kphant__#b__give_gem - " + name)) {
          // step 156
          q.send("qad", `${name}`, 0, "null");
          q.gems(25);
        }
      }],
      [/^kphant__(\d+)c__give_gem$/, (q, name) => {
        const n = name.match(/^kphant__(\d+)c__give_gem$/)[1];
        // each of them, once each
        if (once(q, "kphant__#c__give_gem - " + name)) {
          // step 157
          q.send("qad", `${name}`, 0, "null");
          q.gems(25);
        }
      }],
    ],

    // a talk read to its end
    answer: {
      cosmo1x(q) {
        const n = tally(q, "answer cosmo1x");
        // step 2: the 1st time
        if (n === 1) {
          q.send("qcmdVT", 1, "00_uri", 1, 0, 0);
          q.send("qcmdVT", 1, "players", 1, 0, 0);
          q.send("qposturi", "/adventure6-greelysinferno/#00-start/#0#001");
          q.send("qcmdVT", 1, "00_uri", 99, 0, 0);
          q.after(1670, () => {
            q.send("qshake", 1000);
            q.send("qplayswf", "2553", "null", "null");
          });
        }
        // step 3: the 2nd time
        if (n === 2) {
          q.send("qcmd", 38, 10908);
          set(q, "seedgive", 1, 1, 1);
          q.send("qswfs", "cosmo1", "disappear");
          set(q, "cosmo1", 3, 1, 1);
          q.send("qicon", "cosmo1", 0);
          set(q, "cosmo1", 4, 1, 0);
        }
      },
      graham1x(q) {
        // step 22
        set(q, "givegear", 1, 1, 1);
        q.send("qcmd", 38, 10910);
        set(q, "graham1", 3, 1, 1);
      },
      greely1(q) {
        const n = tally(q, "answer greely1");
        // step 122: the 1st time
        if (n === 1) {
          q.send("qswfs", "greely1", "castmagicloop");
          set(q, "greely1", 3, 1, 1);
          set(q, "kingblock", 99, 0, 0);
          q.send("qcmdVT", 1, "60_uri", 1, 0, 0);
          q.send("qposturi", "/adventure6-greelysinferno/#60-reachgreely/#0#001");
          q.send("qcmdVT", 1, "60_uri", 99, 0, 0);
          q.send("qcmd", 38, 10918);
          set(q, "greelymajik1", 1, 1, 0);
          set(q, "greelymouth", 1, 1, 0);
          set(q, "greelysludge", 99, 0, 0);
          set(q, "greely1", 4, 1, 1);
        }
        // step 123: the 2nd time
        if (n === 2) {
          q.send("qcmdVT", 1, "lavatoggle", 0, 0, 0);
        }
      },
      greely2(q) {
        // step 132
        set(q, "greely2", 2, 1, 0);
        q.send("qicon", "greely2", 0);
        q.after(1610, () => {
          q.send("qshake", 1000);
          q.after(3000, () => {
            set(q, "greely2x", 3, 1, 1);
            q.send("qcmd", 3, 0, "greely2x", 3, 11005);
          });
        });
      },
      greely2x(q) {
        const n = tally(q, "answer greely2x");
        // step 133: the 1st time
        if (n === 1) {
          set(q, "greely2x", 2, 0, 0);
          q.send("qcmdVT", 1, "greelyshake", 6, 0, 0);
          q.send("qswfs", "greely2", "castmagicloop");
          set(q, "greely2", 3, 1, 1);
          set(q, "greelymajik2", 1, 1, 0);
          set(q, "greely2", 2, 1, 0);
          q.after(1490, () => {
            q.send("qshake", 2000);
            q.after(2000, () => {
              set(q, "greely2x", 4, 1, 1);
              q.send("qcmd", 3, 0, "greely2x", 4, 11006);
            });
          });
        }
        // step 134: the 2nd time
        if (n === 2) {
          set(q, "greely2x", 2, 0, 0);
          q.send("qcmdVT", 1, "greelyshake", 11, 0, 0);
          q.after(1470, () => {
            set(q, "exitking", 1, 1, 1);
          });
        }
      },
      cosmo2(q) {
        const n = tally(q, "answer cosmo2");
        // step 143: the 1st time
        if (n === 1) {
          q.after(1050, () => {
            q.send("qcmd", 38, 10924);
            set(q, "cosmo2", 2, 1, 1);
            set(q, "exitportal", 1, 1, 0);
            set(q, "portalsound", 1, 1, 0);
            q.xp(50, "cosmo2");
            set(q, "cosmo2", 3, 1, 0);
            q.send("qcmdVT", 1, "90_uri", 1, 0, 0);
            q.send("qposturi", "/adventure6-greelysinferno/#90-exit/#0#001");
            q.offer([[1,1374,0],[1,1372,0],[3,750,750],[3,1000,1000],[1,1370,0]]); // [1, den item, 0], [2, clothing item, ?] or [3, gems, gems]
            q.after(2620, () => {
              set(q, "cosmo2", 4, 1, 1);
              set(q, "graham2", 3, 1, 1);
              set(q, "liza1", 3, 1, 1);
              set(q, "exitblock", 99, 0, 0);
            });
          });
        }
      },
    },

    // an item picked up
    pickedUp: {
      cork03(q) {
        // step 116
        q.after(800, () => {
          set(q, "lavacrack02", 1, 1, 0);
          set(q, "lavahurt02", 1, 1, 1);
          set(q, "lavasound2", 1, 1, 0);
          set(q, "lavasound4", 1, 1, 0);
        });
      },
    },

    // hit by the player (adventures.js needs its handler, see the maker)
    attacked: {
      pod04(q) {
        const n = tally(q, "attacked pod04");
        // step 88: the 1st time
        if (n === 1) {
          q.send("qahs", "pod04", 80, 10, 0);
        }
        // step 89: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod04", 60, 10, 0);
        }
        // step 90: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod04", 40, 10, 0);
        }
        // step 91: the 4th time
        if (n === 4) {
          q.send("qahs", "pod04", 20, 10, 0);
        }
        // step 92: the 5th time
        if (n === 5) {
          q.send("qad", "pod04", 10, 0, -887, 1993, "");
          q.xp(5, "pod04");
          q.send("qspn", "pod04", "pod04__give_gem", 200, 42, 3, 5, "null", "null", "null");
          set(q, "podvol04", 99, 0, 0);
          set(q, "pod04", 2, 1, 0);
        }
      },
      pod10(q) {
        const n = tally(q, "attacked pod10");
        // step 95: the 1st time
        if (n === 1) {
          q.send("qahs", "pod10", 80, 10, 0);
        }
        // step 96: the 2nd time
        if (n === 2) {
          q.send("qahs", "pod10", 60, 10, 0);
        }
        // step 97: the 3rd time
        if (n === 3) {
          q.send("qahs", "pod10", 40, 10, 0);
        }
        // step 98: the 4th time
        if (n === 4) {
          q.send("qahs", "pod10", 20, 10, 0);
        }
        // step 99: the 5th time
        if (n === 5) {
          q.send("qad", "pod10", 10, 0, -1250, 1311, "");
          q.xp(5, "pod10");
          q.send("qspn", "pod10", "pod10__give_gem", 200, 42, 3, 5, "null", "null", "null");
          set(q, "podvol10", 99, 0, 0);
          set(q, "pod10", 2, 1, 0);
        }
      },
      pod08(q) {
        // step 100
        q.send("qahs", "pod08", 80, 10, 0);
      },
      pod12(q) {
        // step 101
        q.send("qahs", "pod12", 80, 10, 0);
      },
    },

    // a chest, opened
    opened: {
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
      treasure0(q) {
        if (!once(q, "opened treasure0")) {
          return;
        }
        q.gems(50);
      },
      treasure01(q) {
        if (!once(q, "opened treasure01")) {
          return;
        }
        q.gems(50);
      },
      treasure02(q) {
        if (!once(q, "opened treasure02")) {
          return;
        }
        q.gems(50);
        // step 16
        q.xp(5, "treasure02");
      },
      treasure03(q) {
        if (!once(q, "opened treasure03")) {
          return;
        }
        q.gems(100);
        // step 59
        q.xp(5, "treasure03");
      },
      treasure04(q) {
        if (!once(q, "opened treasure04")) {
          return;
        }
        q.gems(100);
        // step 76
        q.xp(5, "treasure04");
      },
      treasure05(q) {
        if (!once(q, "opened treasure05")) {
          return;
        }
        q.gems(100);
        // step 49
        q.xp(5, "treasure05");
      },
      treasure06(q) {
        if (!once(q, "opened treasure06")) {
          return;
        }
        q.gems(50);
      },
      treasure07(q) {
        if (!once(q, "opened treasure07")) {
          return;
        }
        q.gems(50);
      },
      treasure08(q) {
        if (!once(q, "opened treasure08")) {
          return;
        }
        q.gems(50);
      },
    },

    // a plant ate a phantom: [actor, 50, 1, x, y, ""] has it die there
    eaten(q, plant, phantom, x, y) {
      // boss_easy is a boss: it takes 12 hits, each doing what that hit did in the recording
      if (phantom === "boss_easy") {
        const n = tally(q, "hit boss_easy");
        // step 158: hit 1
        if (n === 1) {
        }
        // step 159: hit 2
        if (n === 2) {
        }
        // step 160: hit 3
        if (n === 3) {
          q.after(350, () => {
            q.send("qepr", `${phantom}`);
            q.send("qahs", `${phantom}`, 90, 100, 0);
          });
        }
        // step 161: hit 4
        if (n === 4) {
          q.send("qepr", `${phantom}`);
          q.send("qswfs", `${phantom}`, "agro");
          set(q, `${phantom}`, 1, 1, 1);
          q.send("qahs", `${phantom}`, 80, 100, 0);
          q.after(1080, () => {
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
            set(q, "phantomvol04", 99, 0, 0);
            q.send("qcmdVT", 1, "spawntimer", 0, 0, 0);
            set(q, "phantomvol03", 99, 0, 0);
            set(q, "phantomvol04", 1, 1, 0);
            q.send("qshake", 2000);
          });
        }
        // step 162: hit 5
        if (n === 5) {
          q.send("qepr", `${phantom}`);
          q.send("qahs", `${phantom}`, 70, 100, 0);
        }
        // step 163: hit 6
        if (n === 6) {
          q.send("qepr", `${phantom}`);
          q.send("qswfs", `${phantom}`, "agro");
          set(q, `${phantom}`, 2, 1, 1);
          q.send("qahs", `${phantom}`, 60, 100, 0);
          q.after(1990, () => {
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
            set(q, "phantomvol03", 1, 1, 0);
            set(q, "phantomvol04", 99, 0, 0);
            q.send("qcmdVT", 1, "spawntimer", 0, 0, 0);
            set(q, "phantomvol03", 99, 0, 0);
            set(q, "phantomvol04", 1, 1, 0);
            q.send("qshake", 2000);
          });
        }
        // step 164: hit 7
        if (n === 7) {
          q.send("qepr", `${phantom}`);
          q.send("qahs", `${phantom}`, 50, 100, 0);
        }
        // step 165: hit 8
        if (n === 8) {
          q.send("qepr", `${phantom}`);
          q.send("qswfs", `${phantom}`, "agro");
          set(q, `${phantom}`, 3, 1, 1);
          q.send("qahs", `${phantom}`, 40, 100, 0);
          q.after(1730, () => {
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
            set(q, "phantomvol03", 1, 1, 0);
            set(q, "phantomvol04", 99, 0, 0);
            q.send("qcmdVT", 1, "spawntimer", 0, 0, 0);
            set(q, "phantomvol03", 99, 0, 0);
            set(q, "phantomvol04", 1, 1, 0);
            q.send("qshake", 2000);
          });
        }
        // step 166: hit 9
        if (n === 9) {
          q.send("qepr", `${phantom}`);
          q.send("qahs", `${phantom}`, 30, 100, 0);
        }
        // step 167: hit 10
        if (n === 10) {
          q.send("qepr", `${phantom}`);
          q.send("qswfs", `${phantom}`, "agro");
          set(q, `${phantom}`, 4, 1, 1);
          q.send("qahs", `${phantom}`, 20, 100, 0);
          q.after(1340, () => {
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
            set(q, "phantomvol03", 1, 1, 0);
            set(q, "phantomvol04", 99, 0, 0);
            q.send("qcmdVT", 1, "spawntimer", 0, 0, 0);
            set(q, "phantomvol03", 99, 0, 0);
            set(q, "phantomvol04", 1, 1, 0);
            q.send("qshake", 2000);
          });
        }
        // step 168: hit 11
        if (n === 11) {
          q.send("qepr", `${phantom}`);
          q.send("qahs", `${phantom}`, 10, 100, 0);
        }
        // step 169: hit 12 (it dies)
        if (n === 12) {
          q.send("qad", phantom, 100, 1, x, y, "");
          q.xp(200, `${phantom}`);
          q.send("qswfs", "kphant__1d", "disappear");
          set(q, "kphant__1d", 98, 1, 0);
          q.send("qswfs", "kphant__2d", "disappear");
          set(q, "kphant__2d", 98, 1, 0);
          q.send("qswfs", "kphant__3d", "disappear");
          set(q, "kphant__3d", 98, 1, 0);
        }
        return;
      }
      if (!once(q, "eaten " + phantom)) {
        return;
      }
      const how = {"blockrock":[1,1],"boomrock2":[1,1],"factory10":[1,1],"boomrock1":[1,1],"factory01":[1,1],"factory03":[1,1],"factory02":[1,1],"factory04":[1,1],"factory09":[1,1],"factory05":[1,1],"factory06":[1,1],"factory07":[1,1],"boss_easy":[100,1]}; // how these die (phantoms: 50, 1)
      const drops = {"phantom03a":"cork07","phantom03b":"cork08","phantom03c":"cork09","phantom02a":"gear02a","phantom02b":"gear02b","phantom02c":"gear02c","phantom08a":"gear04a","phantom08b":"gear04b","phantom__10a":"cork03","phantom__10b":"cork04"}; // what is left behind
      q.send("qad", phantom, (how[phantom] || [50, 1])[0], (how[phantom] || [50, 1])[1], x, y, drops[phantom] || "");
      spawned(q, phantom); // a factory destroyed, or one of its phantoms gone
      const n = tally(q, "eaten");
      // step 170: every phantom#
      if (/^(?:phantom\d+[a-z]?)$/.test(phantom)) {
        q.send("qspn", `${phantom}`, `${phantom}__give_gem`, 200, 42, 3, 25, "null", "null", "null");
        q.xp(5, `${phantom}`);
      }
      // step 171: every phantom__#
      if (/^(?:phantom__\d+[a-z]?)$/.test(phantom)) {
        q.send("qspn", `${phantom}`, `${phantom}__give_gem`, 200, 42, 3, 25, "null", "null", "null");
        q.xp(5, `${phantom}`);
      }
      // step 172: every phantom__#, every one but phantom__00i, phantom__06b, phantom__06a, phantom__09a
      if (/^(?:phantom__\d+[a-z]?)$/.test(phantom) && !["phantom__00i","phantom__06b","phantom__06a","phantom__09a"].includes(phantom)) {
        set(q, `${phantom}`, 3, 1, 0);
      }
      // step 173: every boomrock#
      if (/^(?:boomrock\d+[a-z]?)$/.test(phantom)) {
        q.xp(5, `${phantom}`);
        q.send("qsnd", "ajq_mussecretareastdel");
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 174: every factory#
      if (/^(?:factory\d+[a-z]?)$/.test(phantom)) {
        q.xp(5, `${phantom}`);
      }
      // step 175: every factory#__#_
      if (/^(?:factory\d+[a-z]?__\d+[a-z]?_)$/.test(phantom)) {
        q.send("qspn", `${phantom}`, `${phantom}__give_d`, 200, 42, 3, 25, "null", "null", "null");
      }
      // step 176: every kphant__#
      if (/^(?:kphant__\d+[a-z]?)$/.test(phantom)) {
        q.send("qspn", `${phantom}`, `${phantom}__give_gem`, 200, 42, 3, 25, "null", "null", "null");
        q.xp(5, `${phantom}`);
        set(q, `${phantom}`, 3, 1, 0);
      }
      // step 177: when it is phantom00a
      if (phantom === "phantom00a") {
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 178: when it is phantom00b
      if (phantom === "phantom00b") {
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 179: when it is phantom00d
      if (phantom === "phantom00d") {
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 180: when it is phantom__00i
      if (phantom === "phantom__00i") {
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 181: when it is phantom00r
      if (phantom === "phantom00r") {
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 182: the 6th time
      if (n === 6) {
        q.send("qcmd", 38, 10911);
      }
      // step 183: when it is blockrock
      if (phantom === "blockrock") {
        q.xp(5, `${phantom}`);
        set(q, "rockblock", 99, 0, 0);
        set(q, "graham1", 4, 1, 1);
        q.send("qsnd", "ajq_mussecretareastdel");
        set(q, "blockinfo", 99, 0, 0);
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 184: when it is phantom01a
      if (phantom === "phantom01a") {
        set(q, `${phantom}`, 3, 1, 0);
      }
      // step 185: when it is phantom02d
      if (phantom === "phantom02d") {
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 186: when it is phantom03a
      if (phantom === "phantom03a") {
        set(q, "cork07", 1, 1, 0);
        q.send("qsnd", "ajq_itemfound");
        set(q, `${phantom}`, 2, 0, 0);
      }
      // step 187: when it is phantom03c
      if (phantom === "phantom03c") {
        set(q, "cork09", 1, 1, 0);
        q.send("qsnd", "ajq_itemfound");
        set(q, `${phantom}`, 2, 0, 0);
      }
      // step 188: when it is phantom03b
      if (phantom === "phantom03b") {
        set(q, "cork08", 1, 1, 0);
        q.send("qsnd", "ajq_itemfound");
        set(q, `${phantom}`, 2, 0, 0);
      }
      // step 189: when it is phantom02a
      if (phantom === "phantom02a") {
        set(q, "gear02a", 1, 1, 0);
        q.send("qsnd", "ajq_cogappear");
        set(q, `${phantom}`, 2, 0, 0);
      }
      // step 190: when it is phantom02c
      if (phantom === "phantom02c") {
        set(q, "gear02c", 1, 1, 0);
        q.send("qsnd", "ajq_cogappear");
        set(q, `${phantom}`, 2, 0, 0);
      }
      // step 191: when it is phantom02b
      if (phantom === "phantom02b") {
        set(q, "gear02b", 1, 1, 0);
        q.send("qsnd", "ajq_cogappear");
        set(q, `${phantom}`, 2, 0, 0);
      }
      // step 192: when it is boomrock2
      if (phantom === "boomrock2") {
        set(q, "rockblock02", 99, 0, 0);
        appear(q, "treasure05");
        set(q, "treasure05", 2, 1, 1);
      }
      // step 193: when it is phantom05a
      if (phantom === "phantom05a") {
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 194: when it is phantom05c
      if (phantom === "phantom05c") {
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 195: when it is phantom11a
      if (phantom === "phantom11a") {
        set(q, `${phantom}`, 3, 1, 0);
      }
      // step 196: when it is phantom11b
      if (phantom === "phantom11b") {
        set(q, `${phantom}`, 3, 1, 0);
      }
      // step 197: when it is phantom11c
      if (phantom === "phantom11c") {
        set(q, `${phantom}`, 3, 1, 0);
      }
      // step 198: when it is phantom__06b
      if (phantom === "phantom__06b") {
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 199: when it is phantom__06a
      if (phantom === "phantom__06a") {
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 200: when it is factory10
      if (phantom === "factory10") {
        set(q, "factblok10", 99, 0, 0);
      }
      // step 201: when it is boomrock1
      if (phantom === "boomrock1") {
        set(q, "rockblock01", 99, 0, 0);
        appear(q, "treasure04");
        set(q, "treasure04", 2, 1, 1);
      }
      // step 202: when it is phantom08a
      if (phantom === "phantom08a") {
        q.send("qsnd", "ajq_cogappear");
        set(q, `${phantom}`, 2, 0, 0);
      }
      // step 203: when it is phantom08c
      if (phantom === "phantom08c") {
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 204: when it is phantom08b
      if (phantom === "phantom08b") {
        q.send("qsnd", "ajq_cogappear");
        set(q, `${phantom}`, 2, 0, 0);
      }
      // step 205: when it is factory01
      if (phantom === "factory01") {
        set(q, "factblok01", 99, 0, 0);
      }
      // step 206: when it is phantom__09a
      if (phantom === "phantom__09a") {
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 207: when it is factory03
      if (phantom === "factory03") {
        set(q, "factblok03", 99, 0, 0);
      }
      // step 208: when it is factory02
      if (phantom === "factory02") {
        set(q, "factblok02", 99, 0, 0);
      }
      // step 209: when it is factory04
      if (phantom === "factory04") {
        set(q, "factblok04", 99, 0, 0);
      }
      // step 210: when it is factory09
      if (phantom === "factory09") {
        set(q, "factblok09", 99, 0, 0);
      }
      // step 211: when it is factory05
      if (phantom === "factory05") {
        set(q, "factblok05", 99, 0, 0);
      }
      // step 212: when it is factory06
      if (phantom === "factory06") {
        set(q, "factblok06", 99, 0, 0);
        q.after(740, () => {
          q.send("qcmdVT", 1, "lavatoggle", 0, 0, 0);
        });
      }
      // step 213: when it is factory06__1_
      if (phantom === "factory06__1_") {
        set(q, "lavacrack01", 1, 1, 0);
      }
      // step 214: when it is factory07
      if (phantom === "factory07") {
        set(q, "factblok07", 99, 0, 0);
      }
      // step 215: when it is phantom__10b
      if (phantom === "phantom__10b") {
        set(q, "cork04", 1, 1, 0);
        q.send("qsnd", "ajq_itemfound");
      }
      // step 216: when it is phantom__10a
      if (phantom === "phantom__10a") {
        set(q, "cork03", 1, 1, 0);
        q.send("qsnd", "ajq_itemfound");
      }
      // step 217: when it is kphant__3c
      if (phantom === "kphant__3c") {
        q.send("qseed", 137, 0, 3);
        q.send("qps", 1, "iluvbunnies1234", "plant__61_", 137, 918, 1675, 1162812);
      }
      // step 218: when it is kphant__4d
      if (phantom === "kphant__4d") {
        q.send("qswfs", `${phantom}`, "disappear");
        set(q, `${phantom}`, 98, 1, 0);
        q.send("qswfs", "kphant__5d", "disappear");
        set(q, "kphant__5d", 98, 1, 0);
        q.send("qswfs", "kphant__6d", "disappear");
        set(q, "kphant__6d", 98, 1, 0);
        set(q, "seedpile6", 99, 0, 0);
        set(q, "seedpile6t", 1, 1, 0);
        q.send("qmusic", 0);
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
        set(q, `${phantom}`, 99, 0, 0);
        set(q, "kphant__5d", 99, 0, 0);
        set(q, "kphant__6d", 99, 0, 0);
        set(q, "kphant__7d", 99, 0, 0);
        set(q, "kphant__8d", 99, 0, 0);
        set(q, "phantomvol04", 99, 0, 0);
        q.after(2000, () => {
          q.send("qsnd", "ajq_bossvictorystinger");
          appear(q, "greely2");
          q.send("qcmdVT", 1, "70_uri", 1, 0, 0);
          q.send("qposturi", "/adventure6-greelysinferno/#70-defeatthephantomking/#0#001");
          q.send("qcmdVT", 1, "70_uri", 99, 0, 0);
          q.send("qcmd", 38, 10920);
          q.send("qicon", "greely2", 1);
        });
      }
      // step 219: every phantom#, every one but phantom00a, phantom00b, phantom00d, phantom00r, phantom01a, phantom02d, phantom03a, phantom03c, phantom03b, phantom02a, phantom02c, phantom02b, phantom05a, phantom05c, phantom11a, phantom11b, phantom11c, phantom08a, phantom08c, phantom08b
      if (/^(?:phantom\d+[a-z]?)$/.test(phantom) && !["phantom00a","phantom00b","phantom00d","phantom00r","phantom01a","phantom02d","phantom03a","phantom03c","phantom03b","phantom02a","phantom02c","phantom02b","phantom05a","phantom05c","phantom11a","phantom11b","phantom11c","phantom08a","phantom08c","phantom08b"].includes(phantom)) {
        set(q, `${phantom}`, 2, 1, 0);
      }
      // step 220: every phantom__#, every one but phantom__00i, phantom__04b, phantom__04c, phantom__04d, phantom__04a, phantom__06b, phantom__06a, phantom__09a, phantom__10b, phantom__10a
      if (/^(?:phantom__\d+[a-z]?)$/.test(phantom) && !["phantom__00i","phantom__04b","phantom__04c","phantom__04d","phantom__04a","phantom__06b","phantom__06a","phantom__09a","phantom__10b","phantom__10a"].includes(phantom)) {
        set(q, `${phantom}`, 2, 1, 0);
      }
    },

    // a seed planted (the server has grown the plant: [plant, seed, x, y])
    planted(q, plant, seed, x, y) {
      const n = tally(q, "planted");
      // step 8: the 43rd time
      if (n === 43) {
        q.after(460, () => {
          set(q, "lavacrack02", 0, 1, 0);
          set(q, "lavahurt02", 0, 0, 0);
          set(q, "lavasound2", 0, 0, 0);
          set(q, "lavasound4", 0, 0, 0);
          q.after(5000, () => {
            set(q, "lavacrack01", 0, 1, 0);
            set(q, "lavahurt01", 0, 0, 0);
            set(q, "lavasound1", 0, 0, 0);
            set(q, "lavasound3", 0, 0, 0);
          });
        });
      }
      // step 9: the 45th time
      if (n === 45) {
        q.after(210, () => {
          q.send("qcmdVT", 1, "lavatoggle", 0, 0, 0);
        });
      }
      // step 10: the 50th time
      if (n === 50) {
        q.after(930, () => {
          q.send("qseed", 137, 1, 3);
          q.send("qseed", 137, 0, 3);
          q.send("qseed", 137, 0, 3);
        });
      }
      // step 11: the 60th time
      if (n === 60) {
        set(q, "seedpile9t", 0, 1, 0);
        q.send("qcmdVT", 1, "seeddelay", 0, 0, 0);
        q.after(370, () => {
          q.send("qseed", 137, 1, 3);
        });
      }
    },

    // a cutscene played to its end (the client answers "qplayswf"; adventures.js needs
    // a handler that runs this, see the maker)
    cutsceneDone(q) {
      const n = tally(q, "cutsceneDone");
      // step 4: the 1st time
      if (n === 1) {
        q.send("qcmdVT", 1, "swf_var", 1, 0, 0);
        q.send("qcmdVT", 1, "swfpause", 3, 0, 0);
        q.send("qshake", 1000);
        q.after(1900, () => {
          set(q, "cosmo1x", 4, 1, 1);
          q.send("qcmd", 3, 0, "cosmo1x", 4, 11008);
        });
      }
      // step 5: the 2nd time
      if (n === 2) {
        set(q, "teleportking", 1, 1, 1);
      }
      // step 6: the 3rd time
      if (n === 3) {
        set(q, "to6f", 1, 1, 1);
      }
    },
  },
};

/* adventure-script-maker
{"defId":17,"title":"Greely's Inferno","rooms":[{"key":"start","room":"adventures.room_adventure_6a","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_musvolout"},{"key":"in6b1","room":"adventures.room_adventure_6b","name":"Adventure Tutorial","nameStringId":18326,"music":"ajq_musvolin","arrive":"in6b1"},{"key":"in6c1","room":"adventures.room_adventure_6c","name":"Adventure Tutorial","nameStringId":18326,"music":"","arrive":"in6c1"},{"key":"in6b3","room":"adventures.room_adventure_6b","name":"Adventure Tutorial","nameStringId":18326,"music":"","arrive":"in6b3"},{"key":"in6d","room":"adventures.room_adventure_6d","name":"Adventure Tutorial","nameStringId":18326,"music":"","arrive":"in6d"},{"key":"in6e","room":"adventures.room_adventure_6e","name":"Adventure Tutorial","nameStringId":18326,"music":"","arrive":"in6e"},{"key":"in6f","room":"adventures.room_adventure_6f","name":"Adventure Tutorial","nameStringId":18326,"music":"0","arrive":"in6f"}],"objective":10907,"actors":[{"name":"players","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"00_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cp4","type":27,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"to6b2","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"to6b3","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"to6c1","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"to6c2","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"to6b1","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"to6a","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"to6f","type":3,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"enterboss","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"playendswf","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"in6a","type":9,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"in6b1","type":9,"def":1,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"in6b2","type":9,"def":1,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"in6b3","type":9,"def":1,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"in6c1","type":9,"def":2,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"in6c2","type":9,"def":2,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"in6d","type":9,"def":3,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"in6e","type":9,"def":4,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"in6f","type":9,"def":5,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"startcosmo1","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cosmo1","type":1,"def":25,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cosmo1x","type":1,"def":25,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"swf_var","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"swfpause","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cosmo1wait","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cosmo2","type":1,"def":25,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"80_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"graham1on","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"graham1","type":1,"def":23,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"graham1x","type":1,"def":23,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"givegear","type":3,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"graham2","type":1,"def":23,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"greely1","type":1,"def":22,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"60_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"greely2","type":1,"def":22,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"greely2x","type":1,"def":22,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"greelymajik1","type":16,"def":"ajq_greelymagicorb_lp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"greelymajik2","type":16,"def":"ajq_greelymagicorb_lp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"greelyshake","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"liza1","type":1,"def":21,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantomvol01","type":26,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantvol01h","type":26,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantomvol02","type":26,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantvol02h","type":26,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantomvol03","type":26,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantomvol04","type":26,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantomvol05","type":26,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantvol05h","type":26,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"avatartile1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatartile2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pillar1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pillar2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatarblock1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatarblock2","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatar1a","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatar1b","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatar1c","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatar1d","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatar1e","type":1,"def":44,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"treasure_a1","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"treasure_a2","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"treasure0","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"treasure01","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"treasure02","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50,"chestKind":3},{"name":"treasure03","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":100,"chestKind":3},{"name":"treasure04","type":13,"def":39,"state":0,"visible":0,"click":1,"path":"","art":"","gems":100,"chestKind":3},{"name":"treasure05","type":13,"def":39,"state":0,"visible":0,"click":1,"path":"","art":"","gems":100,"chestKind":3},{"name":"treasure06","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"treasure07","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"treasure08","type":13,"def":39,"state":0,"visible":1,"click":1,"path":"","art":"","gems":50},{"name":"avatar1","type":1,"def":48,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"avatar2","type":1,"def":45,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blocktimer1","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"blocktimer2","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"givetorch","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"greelymouth","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"back26b","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"back26b2","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"shaketimer","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"lavahurt01","type":14,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"lavahurt02","type":14,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"lavacrack01","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavacrack02","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavatoggle","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"lavastart","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavasound1","type":16,"def":"ajq_lavaplatforms","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"lavasound2","type":16,"def":"ajq_lavaplatforms","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"lavasound3","type":16,"def":"ajq_lavaplatforms","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"lavasound4","type":16,"def":"ajq_lavaplatforms","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"factory01","type":12,"def":72,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factory02","type":12,"def":72,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factory03","type":12,"def":72,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factory04","type":12,"def":72,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factory05","type":12,"def":72,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factory06","type":12,"def":72,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factory07","type":12,"def":72,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factory09","type":12,"def":72,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factory10","type":12,"def":72,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factory11h","type":12,"def":72,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factblok01","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factblok02","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factblok03","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factblok04","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factblok05","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factblok06","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factblok07","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factblok09","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factblok10","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"factblok11","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"locategems","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"boomrock1","type":11,"def":169,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"boomrock2","type":11,"def":169,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"rockblock01","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"rockblock02","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipetrig03","type":1,"def":69,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipetrig04","type":1,"def":69,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipetrig01","type":1,"def":69,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipetrig02","type":1,"def":69,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipetrig05","type":1,"def":69,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipetrig06","type":1,"def":69,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipetrig07","type":1,"def":69,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipetrig08","type":1,"def":69,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipetrig09","type":1,"def":69,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipecount","type":1,"def":44,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"greelyshow","type":3,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"sludge01","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge02","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge03","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge04","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge05","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge06","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge07","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge08","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sludge09","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"greelysludge","type":16,"def":"ajq_sludge_lp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipeinfo01","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo02","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo03","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo04","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo05","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo06","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo07","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo08","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipeinfo09","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"pipe01","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe02","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe03","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe04","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe05","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe06","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe07","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe08","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipe09","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cork01","type":15,"def":1937,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cork02","type":15,"def":1937,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cork03","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork04","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork05","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork06","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork07","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork08","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cork09","type":15,"def":1937,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"lavatrig1","type":1,"def":87,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavatrig2","type":1,"def":87,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavatrig3","type":1,"def":87,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavatrig4","type":1,"def":87,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavacount","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"20_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"30_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"40_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"50_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"lavapause","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"lavainfo1","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavainfo2","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavainfo3","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavainfo4","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gem1","type":15,"def":2105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gem2","type":15,"def":2105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gem3","type":15,"def":2105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gem4","type":15,"def":2105,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch01t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch02t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch03t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch04t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch05t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch06t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch07t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch08t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch01","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch02","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch03","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch04","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch05","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch06","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch07","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switch08","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"switchwait01","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"switchwait02","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"switchwait03","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"switchwait04","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"switchwait05","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"switchwait06","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"switchwait07","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"switchwait08","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"hard","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"easy","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge01","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge02","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier01t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier02t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavaline1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavaline2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavaline3","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavaline4","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavadone","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"lavablock","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"torch01lite","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"torch01","type":17,"def":2045,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"braziercount","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"brazier01","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier02","type":1,"def":86,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge01wait","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"bridge02wait","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"brazier01l","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"brazier02l","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"easyblock","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"kingblock","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge01blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"bridge02blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry01blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry02blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry03blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry04blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry05blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry06blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry07blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry08blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry09blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry10blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry11blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry12blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry13blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry14blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry15blok","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipeblock01","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipeblock02","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipeblock05","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipeblock06","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipeblock07","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipeblock08","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pipeblock09","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"hardsecret","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedgiveoff","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedgive","type":3,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedpile00","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile01","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile02","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile03","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile04","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile05","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile11","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile13","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile14","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile16","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile19","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile20","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile17","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile18","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedtimer17","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedtimer18","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantomfall1","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"phanttrig","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"phantom02d","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path02d","art":""},{"name":"phantom05a","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path05a","art":""},{"name":"phantom05b","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path05b","art":""},{"name":"phantom05c","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path05c","art":""},{"name":"phantom__06a","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path06","art":""},{"name":"phantom__06b","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path06","art":""},{"name":"phantom08c","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path08c","art":""},{"name":"phantom__09a","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path09","art":""},{"name":"phantom__09b","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path09","art":""},{"name":"phantom00a","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path00a","art":""},{"name":"phantom00b","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path00b","art":""},{"name":"phantom00c","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path00c","art":""},{"name":"phantom00d","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path00d","art":""},{"name":"phantom00e","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path00e","art":""},{"name":"phantom00f","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path00f","art":""},{"name":"phantom00g","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path00g","art":""},{"name":"phantom00h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path00h","art":""},{"name":"phantom__00i","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path00i","art":""},{"name":"phantom00j","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path00j","art":""},{"name":"phantom__00k","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path00i","art":""},{"name":"phantom__00l","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path00i","art":""},{"name":"phantom00n","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path00n","art":""},{"name":"phantom00o","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path00o","art":""},{"name":"phantom00p","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path00p","art":""},{"name":"phantom00q","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path00q","art":""},{"name":"phantom00r","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path00r","art":""},{"name":"phantom12h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path12","art":""},{"name":"phantom13h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path13","art":""},{"name":"phantom14h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path14","art":""},{"name":"phantom15h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path15","art":""},{"name":"phantom16h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path16","art":""},{"name":"phantom__17h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path06","art":""},{"name":"phantom__18h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path06","art":""},{"name":"phantom19h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path19","art":""},{"name":"phantom20h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path20","art":""},{"name":"phantom21h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path21","art":""},{"name":"phantom22h","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path22","art":""},{"name":"phantom01a","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom01b","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom__04a","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom__04b","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom__04c","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom__04d","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom11a","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom11b","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom11c","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom__23h","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"phantom03a","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path03a","art":"","drop":"cork07"},{"name":"phantom03b","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path03b","art":"","drop":"cork08"},{"name":"phantom03c","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path03c","art":"","drop":"cork09"},{"name":"phantom02a","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path02a","art":"","drop":"gear02a"},{"name":"phantom02b","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path02b","art":"","drop":"gear02b"},{"name":"phantom02c","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path02c","art":"","drop":"gear02c"},{"name":"phantom08a","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path08a","art":"","drop":"gear04a"},{"name":"phantom08b","type":11,"def":2,"state":0,"visible":1,"click":1,"path":"path08b","art":"","drop":"gear04b"},{"name":"phantom__10a","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":"","drop":"cork03"},{"name":"phantom__10b","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":"","drop":"cork04"},{"name":"path00a","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path00b","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path00c","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path00d","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path00e","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path00f","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path00g","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path00h","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path00i","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path00j","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path00n","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path00o","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path00p","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path00q","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path00r","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path01a","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path01b","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path02a","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path02b","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path02c","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path02d","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path03a","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path03b","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path03c","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path04a","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path04b","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path05a","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path05b","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path05c","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path06","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path08a","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path08b","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path08c","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path09","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path10","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path11a","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path11b","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path11c","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path12","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path13","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path14","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path15","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path16","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path19","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path20","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path21","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"path22","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"secret01","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"secret02","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"ambush01vol","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"ambush02vol","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"ambush11avol","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"ambush11bvol","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"ambush11cvol","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gear01sound","type":16,"def":"ajq_langearlp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear02sound1","type":16,"def":"ajq_langearlp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear02sound2","type":16,"def":"ajq_langearlp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear02sound3","type":16,"def":"ajq_langearlp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear03sound","type":16,"def":"ajq_langearlp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear04sound1","type":16,"def":"ajq_langearlp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear04sound2","type":16,"def":"ajq_langearlp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"chomper01","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"chomper02","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"chomper03","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"chomper04","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"chomper05","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"chomper06","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"chomper07","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"chomper08","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"chomper09","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"chomper10","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"chomper11","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"chomper12","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"chomper13","type":21,"def":100,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry08","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry09","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry10","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry11","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry12","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry13","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry08h","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry09h","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry10h","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry11h","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry12h","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry13h","type":25,"def":30,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry01","type":25,"def":170,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry02","type":25,"def":170,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry03","type":25,"def":170,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry04","type":25,"def":170,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry05","type":25,"def":170,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry06","type":25,"def":170,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry07","type":25,"def":170,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry14","type":25,"def":170,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry15","type":25,"def":170,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry01h","type":25,"def":170,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry02h","type":25,"def":170,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry03h","type":25,"def":170,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry04h","type":25,"def":170,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry05h","type":25,"def":170,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry06h","type":25,"def":170,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry07h","type":25,"def":170,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry14h","type":25,"def":170,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry15h","type":25,"def":170,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry01_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry02_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry03_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry04_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry05_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry06_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry07_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry08_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry09_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry10_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry11_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry12_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry13_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry14_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"sentry15_lp","type":16,"def":"ajq_phntmwatcherlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"checkpoint00","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"checkpoint01","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"checkpoint02","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"checkpoint03","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"checkpoint04","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"checkpoint05","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"checkpoint06","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"checkpoint07","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"checkpoint08","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"checkpoint09","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"checkpoint10","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"checkpoint11","type":16,"def":"ajq_spawnpointlp","state":0,"visible":1,"click":1,"path":"","art":""},{"name":"plantvol","type":22,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"6b_init","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"10_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"reinit","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"darklight","type":1,"def":116,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"init_puzz","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"init_easy","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"init_hard","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"allpuzzoff","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gear01trig","type":1,"def":84,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gear02trig1","type":1,"def":84,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gear02trig3","type":1,"def":84,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gear03trig","type":1,"def":84,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gear04trig1","type":1,"def":84,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gear04trig2","type":1,"def":84,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gear02trig2","type":1,"def":84,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gear01wait","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear02wait1","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear02wait2","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear02wait3","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear03wait","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear04wait1","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear04wait2","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz01init","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02init1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02init2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02init3","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03init","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04init1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04init2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"gear02a","type":15,"def":2066,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear02b","type":15,"def":2066,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear02c","type":15,"def":2066,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear03","type":15,"def":2066,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear04a","type":15,"def":2066,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear04b","type":15,"def":2066,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear01","type":17,"def":2066,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear01info","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear02info1","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear02info2","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear02info3","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear03info","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear04info1","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gear04info2","type":1,"def":116,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz01start","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02start1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02start2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02start3","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03start","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04start1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04start2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02c","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02d","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02e","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02f","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02g","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02h","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02i","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02j","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02k","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02l","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02m","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02n","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03c","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03d","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03e","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03f","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03g","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03h","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03i","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03j","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03k","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04c","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04d","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04e","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04f","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04g","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04h","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04i","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06c","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06d","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06e","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06f","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06g","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06h","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06i","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06j","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06k","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06l","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06m","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06n","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07c","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07h","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07j","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08a","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08b","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08c","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08d","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08e","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08f","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08g","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08h","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08i","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz01end","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz01door","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz01frame","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02end1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02end2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02end3","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02end4","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02end4n5","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02end5","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02end5x","type":2,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz02door1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02door2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02frame1l","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02frame1r","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02frame2l","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02frame2r","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03end","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03door","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03frame","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04end1","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04end2","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04door","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04frame_l","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04frame_r","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz01beam01","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02beam01","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02beam02","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02beam03","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02beam04","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02beam05","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02beam06","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02beam07","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02beam08","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02beam09","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02beam10","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02beam11","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02beam12","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02beam13","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02beam14","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02beam15","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02beam16","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02beam17","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02beam18","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02beam19","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03beam01","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03beam02","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03beam03","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03beam04","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03beam05","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03beam06","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03beam07","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03beam08","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03beam09","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03beam10","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03beam11","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03beam12","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03beam13","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04beam01","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04beam02","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04beam03","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04beam04","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04beam05","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04beam06","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04beam07","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04beam08","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04beam09","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04beam10","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06beam01","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06beam02","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06beam03","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06beam04","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06beam05","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06beam06","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06beam07","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06beam08","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06beam09","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07beam01","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07beam02","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07beam03","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08beam01","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08beam02","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz01block","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02block1","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02block2","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03block","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04block","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz01done","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02done1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz02done2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03done","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz04done","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz01wait","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz02wait1","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz02wait2","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz03wait","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz04wait","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig01","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig02a","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz02f_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig02b","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig02c","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig03a","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig03b","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig03c","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig03d","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig03e","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig03f","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig03g","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig03h","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz03b_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03b_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03d_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03d_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03e_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03e_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03f_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03f_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03f_on2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03f_off2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03g_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03g_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03i_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03i_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03k_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz03k_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig04a","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig04b","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"teletimer","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"gifttimer","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"teleportking","type":3,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__1a","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__2a","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__3a","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__4a","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__5a","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__6a","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__1b","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__2b","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__3b","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__4b","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__5b","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__6b","type":11,"def":32,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__1c","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__2c","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__3c","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__4c","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__5c","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__6c","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__1d","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__2d","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__3d","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__4d","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__5d","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__6d","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__7d","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kphant__8d","type":11,"def":2,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"kpath1","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"kpath2","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"kpath3","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"kingpath","type":20,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile6","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile7","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile8","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile9","type":1,"def":134,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile6t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile7t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile8t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile9t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile17t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedpile18t","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seeddelay","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedmover","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedtimer6","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedtimer7","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedtimer8","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"seedtimer9","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"boss_easy","type":11,"def":26,"state":0,"visible":1,"click":1,"path":"kingpath","art":""},{"name":"boss_hard","type":11,"def":26,"state":0,"visible":1,"click":1,"path":"kingpath","art":""},{"name":"spawner","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"hide_kphants","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"hidedelay2","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"greelydelay","type":8,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"70_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"spawntimer","type":8,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"kphant_off","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"hideseeds","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"exitking","type":3,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"init6e","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"init6f","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"90_uri","type":7,"def":0,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"exitroom","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"seedcount","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"portalsound","type":16,"def":"ajq_portalgatelp","state":0,"visible":0,"click":1,"path":"","art":""},{"name":"exitportal","type":2,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"exitblock","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockinfo","type":1,"def":145,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"blockrock","type":11,"def":167,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"rockblock","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod01","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod02","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod03","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod04","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod05","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod06","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod07","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod08","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod09","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod10","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod11","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"pod12","type":23,"def":151,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol01","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol02","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol03","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol04","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol05","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol06","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol07","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol08","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol09","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol10","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol11","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"podvol12","type":5,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06a_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06a_on2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06a_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06a_off2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06b_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06b_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06c_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06c_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06c_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06c_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06d_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06d_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06d_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06d_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06e_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06e_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06e_on2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06e_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06e_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06f_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06f_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06f_on2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06g_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06g_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06g_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06h_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06h_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06h_on2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06h_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06h_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06i_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06i_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06i_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06i_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06j_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06j_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06j_on2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06j_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06j_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06j_off2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06k_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06k_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06k_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06k_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06l_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06l_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06l_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06l_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06m_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06m_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06m_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06m_off2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06n_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06n_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz06n_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig06s1","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig06s2","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig06s3","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig06a","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig06b","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig06c","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig06d","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig06e","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig06f","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig06g","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig06h","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig06i","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig06j","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig06k","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig06l","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig06m","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig06n","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz07a_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07a_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07a_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07a_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07b_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07b_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07b_on2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07b_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07b_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07c_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07c_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07c_on2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07c_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07c_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07c_off2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07d_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07d_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07d_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07d_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07e_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07e_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07e_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07e_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07f_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07f_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07f_on2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07f_on3","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07f_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07f_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07f_off2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07f_off3","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07g_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07g_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07g_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07g_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07h_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07h_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07h_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07h_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07i_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07i_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07i_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07i_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07j_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07j_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07j_on2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07j_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07j_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07j_off2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07k_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz07k_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig07start","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig07a","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig07b","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig07c","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig07d","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig07e","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig07f","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig07g","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig07h","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig07i","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig07j","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig07k","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"puz08a_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08a_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08b_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08b_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08c_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08c_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08c_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08c_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08d_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08d_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08d_on2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08d_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08d_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08d_off2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08e_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08e_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08e_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08e_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08f_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08f_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08f_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08f_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08g_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08g_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08g_on2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08g_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08g_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08g_off2","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08h_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08h_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08h_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08h_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08i_on","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08i_on1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08i_off","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"puz08i_off1","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"trig08s1","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig08s2","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig08a","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig08b","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig08c","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig08d","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig08e","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig08f","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig08g","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig08h","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"trig08i","type":1,"def":154,"state":0,"visible":0,"click":1,"path":"","art":""},{"name":"cheatchq1","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"cheatchq2","type":3,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""},{"name":"playermember","type":7,"def":0,"state":0,"visible":1,"click":1,"path":"","art":""}],"steps":[{"id":221,"when":"loaded","name":"","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qsndpk","fields":"2552"}]},{"id":1,"when":"trigger","name":"startcosmo1","once":false,"holding":"","nth":0,"actions":[{"a":"set","name":"cosmo1x","state":3,"visible":1,"click":1},{"a":"talk","name":"cosmo1x","str":10892,"mode":3},{"a":"set","name":"startcosmo1","state":99,"visible":0,"click":0}]},{"id":2,"when":"answer","name":"cosmo1x","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"var","name":"00_uri","value":1},{"a":"var","name":"players","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure6-greelysinferno/#00-start/#0#001"},{"a":"var","name":"00_uri","value":99},{"a":"wait","ms":1670},{"a":"send","cmd":"qshake","fields":"1000"},{"a":"cutscene","swf":"2553","extra":"null|null"}]},{"id":3,"when":"answer","name":"cosmo1x","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"goal","str":10908},{"a":"show","name":"seedgive","click":1},{"a":"artstate","name":"cosmo1","state":"disappear"},{"a":"set","name":"cosmo1","state":3,"visible":1,"click":1},{"a":"send","cmd":"qicon","fields":"cosmo1|0"},{"a":"set","name":"cosmo1","state":4,"visible":1,"click":0}]},{"id":4,"when":"cutsceneDone","name":"","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"var","name":"swf_var","value":1},{"a":"var","name":"swfpause","value":3},{"a":"send","cmd":"qshake","fields":"1000"},{"a":"wait","ms":1900},{"a":"set","name":"cosmo1x","state":4,"visible":1,"click":1},{"a":"talk","name":"cosmo1x","str":11008,"mode":4}]},{"id":5,"when":"cutsceneDone","name":"","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"show","name":"teleportking","click":1}]},{"id":6,"when":"cutsceneDone","name":"","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"show","name":"to6f","click":1}]},{"id":7,"when":"trigger","name":"seedgive","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"wait","ms":1530},{"a":"set","name":"cosmo1","state":99,"visible":0,"click":0},{"a":"set","name":"seedgive","state":99,"visible":0,"click":0}]},{"id":8,"when":"planted","name":"","once":false,"holding":"","nth":43,"nthOn":0,"actions":[{"a":"wait","ms":460},{"a":"set","name":"lavacrack02","state":0,"visible":1,"click":0},{"a":"set","name":"lavahurt02","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound2","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound4","state":0,"visible":0,"click":0},{"a":"wait","ms":5000},{"a":"set","name":"lavacrack01","state":0,"visible":1,"click":0},{"a":"set","name":"lavahurt01","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound1","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound3","state":0,"visible":0,"click":0}]},{"id":9,"when":"planted","name":"","once":false,"holding":"","nth":45,"nthOn":0,"actions":[{"a":"wait","ms":210},{"a":"var","name":"lavatoggle","value":0}]},{"id":10,"when":"planted","name":"","once":false,"holding":"","nth":50,"nthOn":0,"actions":[{"a":"wait","ms":930},{"a":"send","cmd":"qseed","fields":"137|1|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qseed","fields":"137|0|3"}]},{"id":11,"when":"planted","name":"","once":false,"holding":"","nth":60,"nthOn":0,"actions":[{"a":"set","name":"seedpile9t","state":0,"visible":1,"click":0},{"a":"var","name":"seeddelay","value":0},{"a":"wait","ms":370},{"a":"send","cmd":"qseed","fields":"137|1|3"}]},{"id":12,"when":"trigger","name":"switch06","once":true,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"switch06"},{"a":"show","name":"switch06t","click":0},{"a":"hide","name":"sentry08_lp"},{"a":"hide","name":"sentry09_lp"},{"a":"set","name":"switch06","state":99,"visible":0,"click":0},{"a":"wait","ms":1200},{"a":"artstate","name":"sentry08","state":"turnoff"},{"a":"show","name":"sentry08","click":0},{"a":"artstate","name":"sentry09","state":"turnoff"},{"a":"show","name":"sentry09","click":0}]},{"id":13,"when":"trigger","name":"switch07","once":true,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"switch07"},{"a":"show","name":"switch07t","click":0},{"a":"hide","name":"sentry10_lp"},{"a":"hide","name":"sentry11_lp"},{"a":"set","name":"switch07","state":99,"visible":0,"click":0},{"a":"wait","ms":480},{"a":"artstate","name":"sentry10","state":"turnoff"},{"a":"show","name":"sentry10","click":0},{"a":"artstate","name":"sentry11","state":"turnoff"},{"a":"show","name":"sentry11","click":0}]},{"id":14,"when":"trigger","name":"phantomfall1","once":false,"holding":"","nth":0,"actions":[{"a":"show","name":"phantomvol01","click":0},{"a":"set","name":"phantomfall1","state":99,"visible":0,"click":0}]},{"id":15,"when":"trigger","name":"seedpile18","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"seedpile18","state":99,"visible":0,"click":0},{"a":"show","name":"seedpile18t","click":0},{"a":"wait","ms":21330},{"a":"set","name":"seedpile18t","state":0,"visible":1,"click":0},{"a":"var","name":"seeddelay","value":0},{"a":"wait","ms":1000},{"a":"set","name":"seedpile18","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer18","value":0}]},{"id":16,"when":"opened","name":"treasure02","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"treasure02"}]},{"id":17,"when":"trigger","name":"switch08","once":true,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"switch08"},{"a":"show","name":"switch08t","click":0},{"a":"hide","name":"sentry12_lp"},{"a":"hide","name":"sentry13_lp"},{"a":"set","name":"switch08","state":99,"visible":0,"click":0},{"a":"wait","ms":270},{"a":"artstate","name":"sentry12","state":"turnoff"},{"a":"show","name":"sentry12","click":0},{"a":"artstate","name":"sentry13","state":"turnoff"},{"a":"show","name":"sentry13","click":0}]},{"id":18,"when":"trigger","name":"phantom__00i__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom__00i__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":19,"when":"trigger","name":"seedpile11","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3}]},{"id":20,"when":"trigger","name":"phantom00r__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom00r__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":21,"when":"trigger","name":"graham1on","once":false,"holding":"","nth":0,"actions":[{"a":"appear","name":"graham1","face":""},{"a":"artstate","name":"graham1","state":"idle"},{"a":"set","name":"graham1","state":2,"visible":1,"click":0},{"a":"show","name":"graham1x","click":1},{"a":"talk","name":"graham1x","str":10866,"mode":1},{"a":"set","name":"graham1on","state":99,"visible":0,"click":0}]},{"id":22,"when":"answer","name":"graham1x","once":false,"holding":"","nth":0,"actions":[{"a":"show","name":"givegear","click":1},{"a":"goal","str":10910},{"a":"set","name":"graham1","state":3,"visible":1,"click":1}]},{"id":23,"when":"trigger","name":"givegear","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qgi","fields":"gear01"},{"a":"sound","sound":"ajq_cogappear"}]},{"id":24,"when":"trigger","name":"graham1","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"talk","name":"graham1","str":10894,"mode":3}]},{"id":25,"when":"trigger","name":"graham1","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"talk","name":"graham1","str":10894,"mode":3}]},{"id":26,"when":"trigger","name":"graham1","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"talk","name":"graham1","str":10965,"mode":4}]},{"id":27,"when":"trigger","name":"graham1","once":false,"holding":"","nth":4,"nthOn":true,"actions":[{"a":"talk","name":"graham1","str":10965,"mode":4}]},{"id":28,"when":"trigger","name":"to6b1","once":false,"holding":"","nth":0,"actions":[{"a":"room","key":"in6b1","spawn":"in6b1"}]},{"id":29,"when":"trigger","name":"6b_init","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"var","name":"10_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure6-greelysinferno/#10-reachtopofswitchbacks/#0#001"},{"a":"var","name":"10_uri","value":99},{"a":"goal","str":10911},{"a":"send","cmd":"qtorch","fields":"0|1|torch01lite"},{"a":"send","cmd":"qtorch","fields":"0|1|darklight"},{"a":"set","name":"bridge01","state":99,"visible":0,"click":0},{"a":"set","name":"bridge02","state":99,"visible":0,"click":0},{"a":"set","name":"puz01beam01","state":99,"visible":0,"click":0},{"a":"set","name":"puz02start1","state":99,"visible":0,"click":0},{"a":"set","name":"puz02start2","state":99,"visible":0,"click":0},{"a":"set","name":"puz02start3","state":99,"visible":0,"click":0},{"a":"set","name":"puz02a","state":99,"visible":0,"click":0},{"a":"set","name":"puz02b","state":99,"visible":0,"click":0},{"a":"set","name":"puz02c","state":99,"visible":0,"click":0},{"a":"set","name":"puz02d","state":99,"visible":0,"click":0},{"a":"set","name":"puz02e","state":99,"visible":0,"click":0},{"a":"set","name":"puz02f","state":99,"visible":0,"click":0},{"a":"set","name":"puz02g","state":99,"visible":0,"click":0},{"a":"set","name":"puz02h","state":99,"visible":0,"click":0},{"a":"set","name":"puz02i","state":99,"visible":0,"click":0},{"a":"set","name":"puz02j","state":99,"visible":0,"click":0},{"a":"set","name":"puz02k","state":99,"visible":0,"click":0},{"a":"set","name":"puz02l","state":99,"visible":0,"click":0},{"a":"set","name":"puz02m","state":99,"visible":0,"click":0},{"a":"set","name":"puz02n","state":99,"visible":0,"click":0},{"a":"set","name":"puz02beam01","state":99,"visible":0,"click":0},{"a":"set","name":"puz02beam02","state":99,"visible":0,"click":0},{"a":"set","name":"puz02beam03","state":99,"visible":0,"click":0},{"a":"set","name":"puz02beam04","state":99,"visible":0,"click":0},{"a":"set","name":"puz02beam05","state":99,"visible":0,"click":0},{"a":"set","name":"puz02beam06","state":99,"visible":0,"click":0},{"a":"set","name":"puz02beam07","state":99,"visible":0,"click":0},{"a":"set","name":"puz02beam08","state":99,"visible":0,"click":0},{"a":"set","name":"puz02beam09","state":99,"visible":0,"click":0},{"a":"set","name":"puz02beam10","state":99,"visible":0,"click":0},{"a":"set","name":"puz02beam11","state":99,"visible":0,"click":0},{"a":"set","name":"puz02beam12","state":99,"visible":0,"click":0},{"a":"set","name":"puz02beam13","state":99,"visible":0,"click":0},{"a":"set","name":"puz02beam14","state":99,"visible":0,"click":0},{"a":"set","name":"puz02beam15","state":99,"visible":0,"click":0},{"a":"set","name":"puz02beam16","state":99,"visible":0,"click":0},{"a":"set","name":"puz02beam17","state":99,"visible":0,"click":0},{"a":"set","name":"puz02beam18","state":99,"visible":0,"click":0},{"a":"set","name":"puz02beam19","state":99,"visible":0,"click":0},{"a":"set","name":"puz03start","state":99,"visible":0,"click":0},{"a":"set","name":"puz03a","state":99,"visible":0,"click":0},{"a":"set","name":"puz03b","state":99,"visible":0,"click":0},{"a":"set","name":"puz03c","state":99,"visible":0,"click":0},{"a":"set","name":"puz03d","state":99,"visible":0,"click":0},{"a":"set","name":"puz03e","state":99,"visible":0,"click":0},{"a":"set","name":"puz03f","state":99,"visible":0,"click":0},{"a":"set","name":"puz03g","state":99,"visible":0,"click":0},{"a":"set","name":"puz03h","state":99,"visible":0,"click":0},{"a":"set","name":"puz03i","state":99,"visible":0,"click":0},{"a":"set","name":"puz03j","state":99,"visible":0,"click":0},{"a":"set","name":"puz03k","state":99,"visible":0,"click":0},{"a":"set","name":"puz03beam01","state":99,"visible":0,"click":0},{"a":"set","name":"puz03beam02","state":99,"visible":0,"click":0},{"a":"set","name":"puz03beam03","state":99,"visible":0,"click":0},{"a":"set","name":"puz03beam04","state":99,"visible":0,"click":0},{"a":"set","name":"puz03beam05","state":99,"visible":0,"click":0},{"a":"set","name":"puz03beam06","state":99,"visible":0,"click":0},{"a":"set","name":"puz03beam07","state":99,"visible":0,"click":0},{"a":"set","name":"puz03beam08","state":99,"visible":0,"click":0},{"a":"set","name":"puz03beam09","state":99,"visible":0,"click":0},{"a":"set","name":"puz03beam10","state":99,"visible":0,"click":0},{"a":"set","name":"puz03beam11","state":99,"visible":0,"click":0},{"a":"set","name":"puz03beam12","state":99,"visible":0,"click":0},{"a":"set","name":"puz03beam13","state":99,"visible":0,"click":0},{"a":"set","name":"puz04start1","state":99,"visible":0,"click":0},{"a":"set","name":"puz04start2","state":99,"visible":0,"click":0},{"a":"set","name":"puz04a","state":99,"visible":0,"click":0},{"a":"set","name":"puz04b","state":99,"visible":0,"click":0},{"a":"set","name":"puz04c","state":99,"visible":0,"click":0},{"a":"set","name":"puz04d","state":99,"visible":0,"click":0},{"a":"set","name":"puz04e","state":99,"visible":0,"click":0},{"a":"set","name":"puz04f","state":99,"visible":0,"click":0},{"a":"set","name":"puz04g","state":99,"visible":0,"click":0},{"a":"set","name":"puz04h","state":99,"visible":0,"click":0},{"a":"set","name":"puz04i","state":99,"visible":0,"click":0},{"a":"set","name":"puz04beam01","state":99,"visible":0,"click":0},{"a":"set","name":"puz04beam02","state":99,"visible":0,"click":0},{"a":"set","name":"puz04beam03","state":99,"visible":0,"click":0},{"a":"set","name":"puz04beam04","state":99,"visible":0,"click":0},{"a":"set","name":"puz04beam05","state":99,"visible":0,"click":0},{"a":"set","name":"puz04beam06","state":99,"visible":0,"click":0},{"a":"set","name":"puz04beam07","state":99,"visible":0,"click":0},{"a":"set","name":"puz04beam08","state":99,"visible":0,"click":0},{"a":"set","name":"puz04beam09","state":99,"visible":0,"click":0},{"a":"set","name":"puz04beam10","state":99,"visible":0,"click":0},{"a":"set","name":"puz06a","state":99,"visible":0,"click":0},{"a":"set","name":"puz06b","state":99,"visible":0,"click":0},{"a":"set","name":"puz06c","state":99,"visible":0,"click":0},{"a":"set","name":"puz06d","state":99,"visible":0,"click":0},{"a":"set","name":"puz06e","state":99,"visible":0,"click":0},{"a":"set","name":"puz06f","state":99,"visible":0,"click":0},{"a":"set","name":"puz06g","state":99,"visible":0,"click":0},{"a":"set","name":"puz06h","state":99,"visible":0,"click":0},{"a":"set","name":"puz06i","state":99,"visible":0,"click":0},{"a":"set","name":"puz06j","state":99,"visible":0,"click":0},{"a":"set","name":"puz06k","state":99,"visible":0,"click":0},{"a":"set","name":"puz06l","state":99,"visible":0,"click":0},{"a":"set","name":"puz06m","state":99,"visible":0,"click":0},{"a":"set","name":"puz06n","state":99,"visible":0,"click":0},{"a":"set","name":"puz06beam01","state":99,"visible":0,"click":0},{"a":"set","name":"puz06beam02","state":99,"visible":0,"click":0},{"a":"set","name":"puz06beam03","state":99,"visible":0,"click":0},{"a":"set","name":"puz06beam04","state":99,"visible":0,"click":0},{"a":"set","name":"puz06beam05","state":99,"visible":0,"click":0},{"a":"set","name":"puz06beam06","state":99,"visible":0,"click":0},{"a":"set","name":"puz06beam07","state":99,"visible":0,"click":0},{"a":"set","name":"puz06beam08","state":99,"visible":0,"click":0},{"a":"set","name":"puz06beam09","state":99,"visible":0,"click":0},{"a":"set","name":"puz07a","state":99,"visible":0,"click":0},{"a":"set","name":"puz07c","state":99,"visible":0,"click":0},{"a":"set","name":"puz07j","state":99,"visible":0,"click":0},{"a":"set","name":"puz07h","state":99,"visible":0,"click":0},{"a":"set","name":"puz07beam01","state":99,"visible":0,"click":0},{"a":"set","name":"puz07beam02","state":99,"visible":0,"click":0},{"a":"set","name":"puz07beam03","state":99,"visible":0,"click":0},{"a":"set","name":"puz08a","state":99,"visible":0,"click":0},{"a":"set","name":"puz08b","state":99,"visible":0,"click":0},{"a":"set","name":"puz08c","state":99,"visible":0,"click":0},{"a":"set","name":"puz08d","state":99,"visible":0,"click":0},{"a":"set","name":"puz08e","state":99,"visible":0,"click":0},{"a":"set","name":"puz08f","state":99,"visible":0,"click":0},{"a":"set","name":"puz08g","state":99,"visible":0,"click":0},{"a":"set","name":"puz08h","state":99,"visible":0,"click":0},{"a":"set","name":"puz08i","state":99,"visible":0,"click":0},{"a":"set","name":"puz08beam01","state":99,"visible":0,"click":0},{"a":"set","name":"puz08beam02","state":99,"visible":0,"click":0},{"a":"set","name":"puz02start1","state":0,"visible":1,"click":0},{"a":"set","name":"puz02start2","state":2,"visible":1,"click":0},{"a":"set","name":"puz02start3","state":2,"visible":1,"click":0},{"a":"show","name":"puz02a","click":0},{"a":"set","name":"puz02b","state":3,"visible":1,"click":0},{"a":"set","name":"puz02c","state":2,"visible":1,"click":0},{"a":"show","name":"puz02d","click":0},{"a":"set","name":"puz02e","state":3,"visible":1,"click":0},{"a":"set","name":"puz02f","state":2,"visible":1,"click":0},{"a":"set","name":"puz02g","state":3,"visible":1,"click":0},{"a":"show","name":"puz02h","click":0},{"a":"set","name":"puz02i","state":2,"visible":1,"click":0},{"a":"set","name":"puz02j","state":0,"visible":1,"click":0},{"a":"set","name":"puz02k","state":2,"visible":1,"click":0},{"a":"set","name":"puz02l","state":3,"visible":1,"click":0},{"a":"show","name":"puz02m","click":0},{"a":"set","name":"puz02n","state":2,"visible":1,"click":0},{"a":"show","name":"puz03start","click":0},{"a":"show","name":"puz03a","click":0},{"a":"set","name":"puz03b","state":3,"visible":1,"click":0},{"a":"set","name":"puz03c","state":0,"visible":1,"click":0},{"a":"set","name":"puz03d","state":0,"visible":1,"click":0},{"a":"set","name":"puz03e","state":3,"visible":1,"click":0},{"a":"show","name":"puz03f","click":0},{"a":"set","name":"puz03g","state":3,"visible":1,"click":0},{"a":"show","name":"puz03h","click":0},{"a":"show","name":"puz03i","click":0},{"a":"set","name":"puz03j","state":3,"visible":1,"click":0},{"a":"set","name":"puz03k","state":3,"visible":1,"click":0},{"a":"set","name":"puz04start1","state":2,"visible":1,"click":0},{"a":"show","name":"puz04start2","click":0},{"a":"set","name":"puz04a","state":3,"visible":1,"click":0},{"a":"set","name":"puz04b","state":2,"visible":1,"click":0},{"a":"set","name":"puz04c","state":2,"visible":1,"click":0},{"a":"show","name":"puz04d","click":0},{"a":"set","name":"puz04d","state":0,"visible":1,"click":0},{"a":"show","name":"puz04e","click":0},{"a":"set","name":"puz04f","state":2,"visible":1,"click":0},{"a":"set","name":"puz04g","state":3,"visible":1,"click":0},{"a":"show","name":"puz04h","click":0},{"a":"set","name":"puz04h","state":0,"visible":1,"click":0},{"a":"set","name":"puz04i","state":2,"visible":1,"click":0},{"a":"show","name":"gear04a","click":0},{"a":"show","name":"gear04b","click":0},{"a":"show","name":"gear03","click":0},{"a":"show","name":"6b_init","click":1},{"a":"show","name":"puz02j","click":0},{"a":"set","name":"puz02j","state":0,"visible":1,"click":0},{"a":"show","name":"puz03c","click":0},{"a":"set","name":"puz03c","state":0,"visible":1,"click":0},{"a":"show","name":"puz03d","click":0},{"a":"set","name":"puz03d","state":0,"visible":1,"click":0},{"a":"show","name":"puz04d","click":0},{"a":"set","name":"puz04d","state":0,"visible":1,"click":0},{"a":"show","name":"puz04h","click":0},{"a":"set","name":"puz04h","state":0,"visible":1,"click":0},{"a":"show","name":"puz02start1","click":0},{"a":"set","name":"puz02start1","state":0,"visible":1,"click":0}]},{"id":30,"when":"trigger","name":"6b_init","once":false,"holding":"","nth":2,"nthOn":true,"actions":[{"a":"show","name":"puz02j","click":0},{"a":"set","name":"puz02j","state":0,"visible":1,"click":0},{"a":"show","name":"puz03c","click":0},{"a":"set","name":"puz03c","state":0,"visible":1,"click":0},{"a":"show","name":"puz03d","click":0},{"a":"set","name":"puz03d","state":0,"visible":1,"click":0},{"a":"show","name":"puz04d","click":0},{"a":"set","name":"puz04d","state":0,"visible":1,"click":0},{"a":"show","name":"puz04h","click":0},{"a":"set","name":"puz04h","state":0,"visible":1,"click":0},{"a":"show","name":"puz02start1","click":0},{"a":"set","name":"puz02start1","state":0,"visible":1,"click":0}]},{"id":31,"when":"trigger","name":"gear01trig","once":true,"holding":"gear01","nth":0,"actions":[{"a":"use"},{"a":"set","name":"gear01","state":99,"visible":0,"click":0},{"a":"set","name":"gear01info","state":99,"visible":0,"click":0},{"a":"set","name":"puz01start","state":9,"visible":1,"click":0},{"a":"show","name":"trig01","click":1},{"a":"set","name":"gear01trig","state":99,"visible":0,"click":0},{"a":"xp","amount":5,"name":"gear01trig"}]},{"id":32,"when":"trigger","name":"seedpile01","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3}]},{"id":33,"when":"trigger","name":"givetorch","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qgi","fields":"torch01"}]},{"id":34,"when":"trigger","name":"ambush01vol","once":false,"holding":"","nth":0,"actions":[{"a":"artstate","name":"phantom01a","state":"appear"},{"a":"path","name":"phantom01a","path":"path01a"},{"a":"show","name":"phantom01a","click":1},{"a":"artstate","name":"phantom01b","state":"appear"},{"a":"path","name":"phantom01b","path":"path01b"},{"a":"show","name":"phantom01b","click":1},{"a":"set","name":"ambush01vol","state":99,"visible":0,"click":0}]},{"id":35,"when":"trigger","name":"brazier01","once":true,"holding":"","nth":0,"actions":[{"a":"var","name":"braziercount","value":"{count}"},{"a":"show","name":"brazier01t","click":0},{"a":"show","name":"bridge01","click":0},{"a":"send","cmd":"qtorch","fields":"0|1|bridge01"},{"a":"set","name":"brazier01l","state":99,"visible":0,"click":0},{"a":"set","name":"brazier01l","state":0,"visible":1,"click":0},{"a":"send","cmd":"qtorch","fields":"0|1|brazier01l"},{"a":"xp","amount":5,"name":"brazier01"},{"a":"set","name":"brazier01","state":99,"visible":0,"click":0},{"a":"wait","ms":1230},{"a":"set","name":"bridge01blok","state":99,"visible":0,"click":0},{"a":"wait","ms":10010},{"a":"set","name":"bridge02blok","state":99,"visible":0,"click":0}]},{"id":36,"when":"trigger","name":"switch01","once":true,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"switch01"},{"a":"show","name":"switch01t","click":0},{"a":"hide","name":"sentry01_lp"},{"a":"set","name":"switch01","state":99,"visible":0,"click":0},{"a":"wait","ms":570},{"a":"artstate","name":"sentry01","state":"turnoff"},{"a":"show","name":"sentry01","click":0}]},{"id":37,"when":"trigger","name":"brazier02","once":true,"holding":"torch01","nth":0,"actions":[{"a":"var","name":"braziercount","value":"{count}"},{"a":"use"},{"a":"set","name":"torch01","state":99,"visible":0,"click":0},{"a":"set","name":"givetorch","state":99,"visible":0,"click":0},{"a":"set","name":"darklight","state":99,"visible":0,"click":0},{"a":"show","name":"brazier02t","click":0},{"a":"show","name":"bridge02","click":0},{"a":"send","cmd":"qtorch","fields":"0|1|bridge02"},{"a":"set","name":"brazier02l","state":99,"visible":0,"click":0},{"a":"set","name":"brazier02l","state":0,"visible":1,"click":0},{"a":"send","cmd":"qtorch","fields":"0|1|brazier02l"},{"a":"xp","amount":5,"name":"brazier02"},{"a":"set","name":"brazier02","state":99,"visible":0,"click":0}]},{"id":38,"when":"trigger","name":"locategems","once":false,"holding":"","nth":0,"actions":[{"a":"goal","str":10912},{"a":"set","name":"locategems","state":99,"visible":0,"click":0}]},{"id":39,"when":"trigger","name":"switch02","once":true,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"switch02"},{"a":"show","name":"switch02t","click":0},{"a":"hide","name":"sentry02_lp"},{"a":"hide","name":"sentry03_lp"},{"a":"hide","name":"sentry14_lp"},{"a":"set","name":"switch02","state":99,"visible":0,"click":0},{"a":"wait","ms":270},{"a":"artstate","name":"sentry02","state":"turnoff"},{"a":"show","name":"sentry02","click":0},{"a":"artstate","name":"sentry03","state":"turnoff"},{"a":"show","name":"sentry03","click":0},{"a":"artstate","name":"sentry14","state":"turnoff"},{"a":"show","name":"sentry14","click":0}]},{"id":40,"when":"trigger","name":"gear02trig1","once":false,"holding":"","nth":0,"actions":[{"a":"show","name":"gear02info1","click":1},{"a":"say","name":"gear02info1","str":10906,"flag":2}],"unless":"gear02c"},{"id":41,"when":"trigger","name":"seedpile02","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3}]},{"id":42,"when":"trigger","name":"pipetrig08","once":true,"holding":"cork07","nth":0,"actions":[{"a":"use"},{"a":"hide","name":"pipetrig08"},{"a":"show","name":"pipe08","click":0},{"a":"hide","name":"sludge04"},{"a":"set","name":"pipeblock08","state":99,"visible":0,"click":0},{"a":"xp","amount":5,"name":"pipetrig08"}]},{"id":43,"when":"trigger","name":"pipetrig09","once":true,"holding":"cork08","nth":0,"actions":[{"a":"use"},{"a":"hide","name":"pipetrig09"},{"a":"show","name":"pipe09","click":0},{"a":"set","name":"pipeblock09","state":99,"visible":0,"click":0},{"a":"xp","amount":5,"name":"pipetrig09"}]},{"id":44,"when":"trigger","name":"pipetrig07","once":true,"holding":"cork09","nth":0,"actions":[{"a":"use"},{"a":"hide","name":"pipetrig07"},{"a":"show","name":"pipe07","click":0},{"a":"set","name":"pipeblock07","state":99,"visible":0,"click":0},{"a":"xp","amount":5,"name":"pipetrig07"}]},{"id":45,"when":"trigger","name":"switch03","once":true,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"switch03"},{"a":"show","name":"switch03t","click":0},{"a":"hide","name":"sentry04_lp"},{"a":"hide","name":"sentry05_lp"},{"a":"hide","name":"sentry15_lp"},{"a":"set","name":"switch03","state":99,"visible":0,"click":0},{"a":"artstate","name":"sentry04","state":"turnoff"},{"a":"show","name":"sentry04","click":0},{"a":"artstate","name":"sentry05","state":"turnoff"},{"a":"show","name":"sentry05","click":0},{"a":"artstate","name":"sentry15","state":"turnoff"},{"a":"show","name":"sentry15","click":0}]},{"id":46,"when":"trigger","name":"seedpile13","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3}]},{"id":47,"when":"trigger","name":"gear02trig2","once":true,"holding":"gear02b","nth":0,"actions":[{"a":"use"},{"a":"set","name":"gear02info2","state":99,"visible":0,"click":0},{"a":"set","name":"puz02start2","state":10,"visible":1,"click":0},{"a":"show","name":"trig02b","click":1},{"a":"set","name":"gear02trig2","state":99,"visible":0,"click":0},{"a":"xp","amount":5,"name":"gear02trig2"},{"a":"wait","ms":500},{"a":"show","name":"gear02sound2","click":0}]},{"id":48,"when":"trigger","name":"gear02trig1","once":true,"holding":"gear02c","nth":0,"actions":[{"a":"use"},{"a":"set","name":"gear02info1","state":99,"visible":0,"click":0},{"a":"set","name":"puz02start1","state":8,"visible":1,"click":0},{"a":"show","name":"trig02a","click":1},{"a":"set","name":"gear02trig1","state":99,"visible":0,"click":0},{"a":"xp","amount":5,"name":"gear02trig1"},{"a":"wait","ms":660},{"a":"show","name":"gear02sound1","click":0}]},{"id":49,"when":"opened","name":"treasure05","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"treasure05"}]},{"id":50,"when":"trigger","name":"gear02trig3","once":true,"holding":"gear02a","nth":0,"actions":[{"a":"use"},{"a":"set","name":"gear02info3","state":99,"visible":0,"click":0},{"a":"set","name":"puz02start3","state":10,"visible":1,"click":0},{"a":"show","name":"trig02c","click":1},{"a":"set","name":"gear02trig3","state":99,"visible":0,"click":0},{"a":"wait","ms":280},{"a":"xp","amount":5,"name":"gear02trig3"},{"a":"show","name":"gear02sound3","click":0}]},{"id":51,"when":"trigger","name":"pipetrig06","once":true,"holding":"cork05","nth":0,"actions":[{"a":"use"},{"a":"hide","name":"pipetrig06"},{"a":"show","name":"pipe06","click":0},{"a":"set","name":"pipeblock06","state":99,"visible":0,"click":0},{"a":"xp","amount":5,"name":"pipetrig06"}]},{"id":52,"when":"trigger","name":"gear03trig","once":true,"holding":"gear03","nth":0,"actions":[{"a":"use"},{"a":"set","name":"gear03info","state":99,"visible":0,"click":0},{"a":"set","name":"puz03start","state":9,"visible":1,"click":0},{"a":"show","name":"trig03a","click":1},{"a":"set","name":"gear03trig","state":99,"visible":0,"click":0},{"a":"xp","amount":5,"name":"gear03trig"},{"a":"wait","ms":470},{"a":"show","name":"gear03sound","click":0}]},{"id":53,"when":"trigger","name":"pipetrig05","once":true,"holding":"cork06","nth":0,"actions":[{"a":"use"},{"a":"hide","name":"pipetrig05"},{"a":"show","name":"pipe05","click":0},{"a":"set","name":"pipeblock05","state":99,"visible":0,"click":0},{"a":"xp","amount":5,"name":"pipetrig05"}]},{"id":54,"when":"trigger","name":"ambush02vol","once":false,"holding":"","nth":0,"actions":[{"a":"artstate","name":"phantom__04a","state":"appear"},{"a":"path","name":"phantom__04a","path":"path04a"},{"a":"show","name":"phantom__04a","click":1},{"a":"artstate","name":"phantom__04b","state":"appear"},{"a":"path","name":"phantom__04b","path":"path04a"},{"a":"show","name":"phantom__04b","click":1},{"a":"artstate","name":"phantom__04c","state":"appear"},{"a":"path","name":"phantom__04c","path":"path04b"},{"a":"show","name":"phantom__04c","click":1},{"a":"artstate","name":"phantom__04d","state":"appear"},{"a":"path","name":"phantom__04d","path":"path04b"},{"a":"show","name":"phantom__04d","click":1},{"a":"set","name":"ambush02vol","state":99,"visible":0,"click":0}]},{"id":55,"when":"trigger","name":"phantom__04c__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom__04c__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":56,"when":"trigger","name":"phantom__04d__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom__04d__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":57,"when":"trigger","name":"seedpile19","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3}]},{"id":58,"when":"trigger","name":"phantom__04b__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom__04b__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":59,"when":"opened","name":"treasure03","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"treasure03"}]},{"id":60,"when":"trigger","name":"back26b2","once":false,"holding":"","nth":0,"actions":[{"a":"show","name":"puz04d","click":0},{"a":"set","name":"puz04d","state":0,"visible":1,"click":0},{"a":"show","name":"puz04h","click":0},{"a":"set","name":"puz04h","state":0,"visible":1,"click":0}]},{"id":61,"when":"trigger","name":"to6c1","once":false,"holding":"","nth":0,"actions":[{"a":"room","key":"in6c1","spawn":"in6c1"}]},{"id":62,"when":"trigger","name":"seedpile20","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3}]},{"id":63,"when":"trigger","name":"ambush11avol","once":false,"holding":"","nth":0,"actions":[{"a":"show","name":"phantomvol02","click":0},{"a":"artstate","name":"phantom11a","state":"appear"},{"a":"path","name":"phantom11a","path":"path11a"},{"a":"show","name":"phantom11a","click":1},{"a":"set","name":"ambush11avol","state":99,"visible":0,"click":0}]},{"id":64,"when":"trigger","name":"ambush11bvol","once":false,"holding":"","nth":0,"actions":[{"a":"artstate","name":"phantom11b","state":"appear"},{"a":"path","name":"phantom11b","path":"path11b"},{"a":"show","name":"phantom11b","click":1},{"a":"set","name":"ambush11bvol","state":99,"visible":0,"click":0}]},{"id":65,"when":"trigger","name":"ambush11cvol","once":false,"holding":"","nth":0,"actions":[{"a":"artstate","name":"phantom11c","state":"appear"},{"a":"path","name":"phantom11c","path":"path11c"},{"a":"show","name":"phantom11c","click":1},{"a":"set","name":"ambush11cvol","state":99,"visible":0,"click":0}]},{"id":66,"when":"trigger","name":"to6b3","once":false,"holding":"","nth":0,"actions":[{"a":"room","key":"in6b3","spawn":"in6b3"}]},{"id":67,"when":"trigger","name":"back26b","once":false,"holding":"","nth":0,"actions":[{"a":"show","name":"puz04d","click":0},{"a":"set","name":"puz04d","state":0,"visible":1,"click":0},{"a":"show","name":"puz04h","click":0},{"a":"set","name":"puz04h","state":0,"visible":1,"click":0}]},{"id":68,"when":"trigger","name":"seedpile03","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3}]},{"id":69,"when":"trigger","name":"switch04","once":true,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"switch04"},{"a":"show","name":"switch04t","click":0},{"a":"hide","name":"sentry06_lp"},{"a":"set","name":"switch04","state":99,"visible":0,"click":0},{"a":"wait","ms":840},{"a":"artstate","name":"sentry06","state":"turnoff"},{"a":"show","name":"sentry06","click":0}]},{"id":70,"when":"trigger","name":"phantom__06b__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom__06b__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":71,"when":"trigger","name":"avatar1","once":false,"holding":"","nth":0,"actions":[{"a":"say","name":"avatar1","str":10839,"flag":0}]},{"id":72,"when":"trigger","name":"factory10__0___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory10__0___give_d|0|null"},{"a":"gems","amount":25}]},{"id":73,"when":"trigger","name":"pipetrig01","once":true,"holding":"cork01","nth":0,"actions":[{"a":"use"},{"a":"hide","name":"pipetrig01"},{"a":"show","name":"pipe01","click":0},{"a":"hide","name":"sludge01"},{"a":"set","name":"pipeblock01","state":99,"visible":0,"click":0},{"a":"xp","amount":5,"name":"pipetrig01"}]},{"id":74,"when":"trigger","name":"switch05","once":true,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"switch05"},{"a":"show","name":"switch05t","click":0},{"a":"hide","name":"sentry07_lp"},{"a":"set","name":"switch05","state":99,"visible":0,"click":0},{"a":"wait","ms":240},{"a":"artstate","name":"sentry07","state":"turnoff"},{"a":"show","name":"sentry07","click":0}]},{"id":75,"when":"trigger","name":"gear04trig2","once":true,"holding":"gear04a","nth":0,"actions":[{"a":"use"},{"a":"set","name":"gear04info2","state":99,"visible":0,"click":0},{"a":"set","name":"puz04start2","state":9,"visible":1,"click":0},{"a":"show","name":"trig04b","click":1},{"a":"set","name":"gear04trig2","state":99,"visible":0,"click":0},{"a":"xp","amount":5,"name":"gear04trig2"}]},{"id":76,"when":"opened","name":"treasure04","once":false,"holding":"","nth":0,"actions":[{"a":"xp","amount":5,"name":"treasure04"}]},{"id":77,"when":"trigger","name":"seedpile16","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3}]},{"id":78,"when":"trigger","name":"gear04trig1","once":true,"holding":"gear04b","nth":0,"actions":[{"a":"use"},{"a":"set","name":"gear04info1","state":99,"visible":0,"click":0},{"a":"set","name":"puz04start1","state":10,"visible":1,"click":0},{"a":"show","name":"trig04a","click":1},{"a":"set","name":"gear04trig1","state":99,"visible":0,"click":0},{"a":"xp","amount":5,"name":"gear04trig1"}]},{"id":79,"when":"trigger","name":"factory01__0___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory01__0___give_d|0|null"},{"a":"gems","amount":25}]},{"id":80,"when":"trigger","name":"pipetrig02","once":true,"holding":"cork02","nth":0,"actions":[{"a":"use"},{"a":"hide","name":"pipetrig02"},{"a":"show","name":"pipe02","click":0},{"a":"hide","name":"sludge02"},{"a":"set","name":"pipeblock02","state":99,"visible":0,"click":0},{"a":"xp","amount":5,"name":"pipetrig02"}]},{"id":81,"when":"trigger","name":"seedpile04","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3}]},{"id":82,"when":"trigger","name":"factory02__2___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory02__2___give_d|0|null"},{"a":"gems","amount":25}]},{"id":83,"when":"trigger","name":"factory03__2___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory03__2___give_d|0|null"},{"a":"gems","amount":25}]},{"id":84,"when":"trigger","name":"factory03__1___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory03__1___give_d|0|null"},{"a":"gems","amount":25}]},{"id":85,"when":"trigger","name":"factory02__1___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory02__1___give_d|0|null"},{"a":"gems","amount":25}]},{"id":86,"when":"trigger","name":"factory02__0___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory02__0___give_d|0|null"},{"a":"gems","amount":25}]},{"id":87,"when":"trigger","name":"factory03__0___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory03__0___give_d|0|null"},{"a":"gems","amount":25}]},{"id":88,"when":"attacked","name":"pod04","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod04|80|10|0"}]},{"id":89,"when":"attacked","name":"pod04","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod04|60|10|0"}]},{"id":90,"when":"attacked","name":"pod04","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod04|40|10|0"}]},{"id":91,"when":"attacked","name":"pod04","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod04|20|10|0"}]},{"id":92,"when":"attacked","name":"pod04","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod04|10|0|-887|1993|"},{"a":"xp","amount":5,"name":"pod04"},{"a":"send","cmd":"qspn","fields":"pod04|pod04__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"podvol04","state":99,"visible":0,"click":0},{"a":"set","name":"pod04","state":2,"visible":1,"click":0}]},{"id":93,"when":"trigger","name":"factory04__1___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory04__1___give_d|0|null"},{"a":"gems","amount":25}]},{"id":94,"when":"trigger","name":"factory04__0___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory04__0___give_d|0|null"},{"a":"gems","amount":25}]},{"id":95,"when":"attacked","name":"pod10","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod10|80|10|0"}]},{"id":96,"when":"attacked","name":"pod10","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod10|60|10|0"}]},{"id":97,"when":"attacked","name":"pod10","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod10|40|10|0"}]},{"id":98,"when":"attacked","name":"pod10","once":false,"holding":"","nth":4,"nthOn":false,"actions":[{"a":"send","cmd":"qahs","fields":"pod10|20|10|0"}]},{"id":99,"when":"attacked","name":"pod10","once":false,"holding":"","nth":5,"nthOn":false,"actions":[{"a":"send","cmd":"qad","fields":"pod10|10|0|-1250|1311|"},{"a":"xp","amount":5,"name":"pod10"},{"a":"send","cmd":"qspn","fields":"pod10|pod10__give_gem|200|42|3|5|null|null|null"},{"a":"set","name":"podvol10","state":99,"visible":0,"click":0},{"a":"set","name":"pod10","state":2,"visible":1,"click":0}]},{"id":100,"when":"attacked","name":"pod08","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qahs","fields":"pod08|80|10|0"}]},{"id":101,"when":"attacked","name":"pod12","once":false,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qahs","fields":"pod12|80|10|0"}]},{"id":102,"when":"trigger","name":"lavastart","once":false,"holding":"","nth":0,"actions":[{"a":"set","name":"lavastart","state":99,"visible":0,"click":0}]},{"id":103,"when":"trigger","name":"seedpile05","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"show","name":"lavacrack01","click":0},{"a":"show","name":"lavahurt01","click":1},{"a":"show","name":"lavasound1","click":0},{"a":"show","name":"lavasound3","click":0}]},{"id":104,"when":"trigger","name":"seedpile05","once":false,"holding":"","nth":2,"nthOn":true,"actions":[{"a":"seeds","seed":137,"count":3,"max":3}]},{"id":105,"when":"trigger","name":"lavahurt01","once":false,"holding":"","nth":0,"actions":[{"a":"set","name":"lavacrack01","state":0,"visible":1,"click":0},{"a":"set","name":"lavahurt01","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound1","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound3","state":0,"visible":0,"click":0},{"a":"wait","ms":1000},{"a":"show","name":"lavacrack02","click":0},{"a":"show","name":"lavahurt02","click":1},{"a":"show","name":"lavasound2","click":0},{"a":"show","name":"lavasound4","click":0},{"a":"wait","ms":5010},{"a":"show","name":"lavahurt01","click":1},{"a":"show","name":"lavasound1","click":0},{"a":"show","name":"lavasound3","click":0}]},{"id":106,"when":"trigger","name":"factory06__0___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory06__0___give_d|0|null"},{"a":"gems","amount":25}]},{"id":107,"when":"trigger","name":"factory06__1___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"factory06__1___give_d|0|null"},{"a":"gems","amount":25}]},{"id":108,"when":"trigger","name":"factory07__0___give_d","once":true,"holding":"","nth":0,"actions":[{"a":"var","name":"lavatoggle","value":0},{"a":"send","cmd":"qad","fields":"factory07__0___give_d|0|null"},{"a":"wait","ms":950},{"a":"set","name":"lavacrack02","state":0,"visible":1,"click":0},{"a":"set","name":"lavahurt02","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound2","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound4","state":0,"visible":0,"click":0},{"a":"wait","ms":1000},{"a":"show","name":"lavacrack01","click":0},{"a":"show","name":"lavahurt01","click":1},{"a":"show","name":"lavasound1","click":0},{"a":"show","name":"lavasound3","click":0},{"a":"gems","amount":25}]},{"id":109,"when":"trigger","name":"seedpile14","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"seeds","seed":137,"count":3,"max":3}]},{"id":110,"when":"trigger","name":"seedpile14","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"wait","ms":560},{"a":"set","name":"lavacrack01","state":0,"visible":1,"click":0},{"a":"set","name":"lavahurt01","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound1","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound3","state":0,"visible":0,"click":0},{"a":"wait","ms":1000},{"a":"show","name":"lavacrack02","click":0},{"a":"show","name":"lavahurt02","click":1},{"a":"show","name":"lavasound2","click":0},{"a":"show","name":"lavasound4","click":0}]},{"id":111,"when":"trigger","name":"seedpile14","once":false,"holding":"","nth":3,"nthOn":false,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"wait","ms":2710},{"a":"var","name":"lavatoggle","value":0}]},{"id":112,"when":"trigger","name":"phanttrig","once":false,"holding":"","nth":0,"actions":[{"a":"artstate","name":"phantom__10a","state":"appear"},{"a":"path","name":"phantom__10a","path":"path10"},{"a":"show","name":"phantom__10a","click":1},{"a":"artstate","name":"phantom__10b","state":"appear"},{"a":"path","name":"phantom__10b","path":"path10"},{"a":"show","name":"phantom__10b","click":1},{"a":"set","name":"phanttrig","state":99,"visible":0,"click":0}]},{"id":113,"when":"trigger","name":"pipetrig04","once":false,"holding":"","nth":0,"actions":[{"a":"show","name":"pipeinfo04","click":1},{"a":"say","name":"pipeinfo04","str":10903,"flag":2}],"unless":"cork04"},{"id":114,"when":"trigger","name":"phantom__10b__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"phantom__10b__give_gem|0|null"},{"a":"set","name":"lavacrack02","state":0,"visible":1,"click":0},{"a":"set","name":"lavahurt02","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound2","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound4","state":0,"visible":0,"click":0},{"a":"show","name":"lavacrack01","click":0},{"a":"show","name":"lavahurt01","click":1},{"a":"show","name":"lavasound1","click":0},{"a":"show","name":"lavasound3","click":0},{"a":"gems","amount":25}]},{"id":115,"when":"trigger","name":"pipetrig04","once":true,"holding":"cork04","nth":0,"actions":[{"a":"use"},{"a":"hide","name":"pipetrig04"},{"a":"show","name":"pipe04","click":0},{"a":"set","name":"pipeinfo04","state":0,"visible":0,"click":0},{"a":"hide","name":"pipecount"},{"a":"xp","amount":5,"name":"pipetrig04"},{"a":"wait","ms":1450},{"a":"set","name":"lavacrack01","state":0,"visible":1,"click":0},{"a":"set","name":"lavahurt01","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound1","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound3","state":0,"visible":0,"click":0}]},{"id":116,"when":"pickedUp","name":"cork03","once":false,"holding":"","nth":0,"actions":[{"a":"wait","ms":800},{"a":"show","name":"lavacrack02","click":0},{"a":"show","name":"lavahurt02","click":1},{"a":"show","name":"lavasound2","click":0},{"a":"show","name":"lavasound4","click":0}]},{"id":117,"when":"trigger","name":"pipetrig03","once":true,"holding":"cork03","nth":0,"actions":[{"a":"use"},{"a":"hide","name":"pipetrig03"},{"a":"show","name":"pipe03","click":0},{"a":"hide","name":"sludge03"},{"a":"set","name":"pipecount","state":2,"visible":1,"click":1},{"a":"show","name":"greelyshow","click":1},{"a":"xp","amount":5,"name":"pipetrig03"},{"a":"set","name":"lavacrack02","state":0,"visible":1,"click":0},{"a":"set","name":"lavahurt02","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound2","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound4","state":0,"visible":0,"click":0},{"a":"wait","ms":1000},{"a":"show","name":"lavacrack01","click":0},{"a":"show","name":"lavahurt01","click":1},{"a":"show","name":"lavasound1","click":0},{"a":"show","name":"lavasound3","click":0},{"a":"wait","ms":4000},{"a":"set","name":"lavacrack01","state":0,"visible":1,"click":0},{"a":"set","name":"lavahurt01","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound1","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound3","state":0,"visible":0,"click":0}]},{"id":118,"when":"trigger","name":"greelyshow","once":false,"holding":"","nth":0,"actions":[{"a":"appear","name":"greely1","face":""},{"a":"set","name":"greely1","state":2,"visible":1,"click":1},{"a":"goal","str":10917},{"a":"send","cmd":"qicon","fields":"greely1|1"},{"a":"set","name":"greelyshow","state":99,"visible":0,"click":0}]},{"id":119,"when":"trigger","name":"greely1","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"talk","name":"greely1","str":10870,"mode":2},{"a":"wait","ms":460},{"a":"show","name":"lavacrack02","click":0},{"a":"show","name":"lavahurt02","click":1},{"a":"show","name":"lavasound2","click":0},{"a":"show","name":"lavasound4","click":0},{"a":"wait","ms":2990},{"a":"var","name":"lavatoggle","value":0},{"a":"wait","ms":1000},{"a":"set","name":"lavacrack02","state":0,"visible":1,"click":0},{"a":"set","name":"lavahurt02","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound2","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound4","state":0,"visible":0,"click":0},{"a":"wait","ms":1000},{"a":"show","name":"lavacrack01","click":0},{"a":"show","name":"lavahurt01","click":1},{"a":"show","name":"lavasound1","click":0},{"a":"show","name":"lavasound3","click":0},{"a":"wait","ms":4000},{"a":"set","name":"lavacrack01","state":0,"visible":1,"click":0},{"a":"set","name":"lavahurt01","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound1","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound3","state":0,"visible":0,"click":0},{"a":"wait","ms":1000},{"a":"show","name":"lavacrack02","click":0},{"a":"show","name":"lavahurt02","click":1},{"a":"show","name":"lavasound2","click":0},{"a":"show","name":"lavasound4","click":0},{"a":"wait","ms":5000},{"a":"set","name":"lavacrack02","state":0,"visible":1,"click":0},{"a":"set","name":"lavahurt02","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound2","state":0,"visible":0,"click":0},{"a":"set","name":"lavasound4","state":0,"visible":0,"click":0},{"a":"show","name":"lavacrack01","click":0},{"a":"show","name":"lavahurt01","click":1},{"a":"show","name":"lavasound1","click":0},{"a":"show","name":"lavasound3","click":0}]},{"id":120,"when":"trigger","name":"greely1","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"talk","name":"greely1","str":10895,"mode":4}]},{"id":121,"when":"trigger","name":"greely1","once":false,"holding":"","nth":3,"nthOn":true,"actions":[{"a":"talk","name":"greely1","str":10895,"mode":4}]},{"id":122,"when":"answer","name":"greely1","once":false,"holding":"","nth":1,"nthOn":0,"actions":[{"a":"artstate","name":"greely1","state":"castmagicloop"},{"a":"set","name":"greely1","state":3,"visible":1,"click":1},{"a":"set","name":"kingblock","state":99,"visible":0,"click":0},{"a":"var","name":"60_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure6-greelysinferno/#60-reachgreely/#0#001"},{"a":"var","name":"60_uri","value":99},{"a":"goal","str":10918},{"a":"show","name":"greelymajik1","click":0},{"a":"show","name":"greelymouth","click":0},{"a":"set","name":"greelysludge","state":99,"visible":0,"click":0},{"a":"set","name":"greely1","state":4,"visible":1,"click":1}]},{"id":123,"when":"answer","name":"greely1","once":false,"holding":"","nth":2,"nthOn":0,"actions":[{"a":"var","name":"lavatoggle","value":0}]},{"id":124,"when":"trigger","name":"enterboss","once":false,"holding":"","nth":0,"actions":[{"a":"set","name":"enterboss","state":99,"visible":0,"click":0},{"a":"wait","ms":1690},{"a":"send","cmd":"qmusic","fields":"0"},{"a":"cutscene","swf":"2558","extra":"null|null"},{"a":"path","name":"boss_easy","path":"kingpath"},{"a":"set","name":"boss_easy","state":0,"visible":1,"click":1},{"a":"goal","str":10919},{"a":"send","cmd":"qmusic","fields":"0"},{"a":"send","cmd":"qmusic","fields":"ajq_muscavebossbattle"},{"a":"show","name":"phantomvol03","click":0}]},{"id":125,"when":"trigger","name":"teleportking","once":false,"holding":"","nth":0,"actions":[{"a":"room","key":"in6d","spawn":"in6d"}]},{"id":126,"when":"trigger","name":"seedpile9","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"seedpile9","state":99,"visible":0,"click":0},{"a":"show","name":"seedpile9t","click":0},{"a":"var","name":"seedcount","value":"{count}"},{"a":"wait","ms":21330},{"a":"set","name":"seedpile9t","state":0,"visible":1,"click":0},{"a":"var","name":"seeddelay","value":0},{"a":"wait","ms":1000},{"a":"set","name":"seedpile9","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer9","value":0}]},{"id":127,"when":"trigger","name":"seedpile8","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"seedpile8","state":99,"visible":0,"click":0},{"a":"show","name":"seedpile8t","click":0},{"a":"var","name":"seedcount","value":"{count}"},{"a":"wait","ms":21330},{"a":"set","name":"seedpile8t","state":0,"visible":1,"click":0},{"a":"var","name":"seeddelay","value":0},{"a":"wait","ms":1000},{"a":"set","name":"seedpile8","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer8","value":0}]},{"id":128,"when":"trigger","name":"seedpile6","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"seedpile6","state":99,"visible":0,"click":0},{"a":"show","name":"seedpile6t","click":0},{"a":"var","name":"seedcount","value":"{count}"},{"a":"wait","ms":21330},{"a":"set","name":"seedpile6t","state":0,"visible":1,"click":0},{"a":"var","name":"seeddelay","value":0},{"a":"wait","ms":1000},{"a":"set","name":"seedpile6","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer6","value":0}]},{"id":129,"when":"trigger","name":"seedpile7","once":false,"holding":"","nth":0,"actions":[{"a":"seeds","seed":137,"count":3,"max":3},{"a":"set","name":"seedpile7","state":99,"visible":0,"click":0},{"a":"show","name":"seedpile7t","click":0},{"a":"var","name":"seedcount","value":"{count}"},{"a":"wait","ms":21330},{"a":"set","name":"seedpile7t","state":0,"visible":1,"click":0},{"a":"var","name":"seeddelay","value":0},{"a":"wait","ms":1000},{"a":"set","name":"seedpile7","state":0,"visible":1,"click":1},{"a":"var","name":"seedtimer7","value":0}]},{"id":130,"when":"trigger","name":"kphant__4d__give_gem","once":true,"holding":"","nth":0,"actions":[{"a":"send","cmd":"qad","fields":"kphant__4d__give_gem|0|null"},{"a":"gems","amount":25}]},{"id":131,"when":"trigger","name":"greely2","once":false,"holding":"","nth":0,"actions":[{"a":"talk","name":"greely2","str":10896,"mode":1},{"a":"wait","ms":950},{"a":"send","cmd":"qmusic","fields":"ajq_musvolin"}]},{"id":132,"when":"answer","name":"greely2","once":false,"holding":"","nth":0,"actions":[{"a":"set","name":"greely2","state":2,"visible":1,"click":0},{"a":"send","cmd":"qicon","fields":"greely2|0"},{"a":"wait","ms":1610},{"a":"send","cmd":"qshake","fields":"1000"},{"a":"wait","ms":3000},{"a":"set","name":"greely2x","state":3,"visible":1,"click":1},{"a":"talk","name":"greely2x","str":11005,"mode":3}]},{"id":133,"when":"answer","name":"greely2x","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"set","name":"greely2x","state":2,"visible":0,"click":0},{"a":"var","name":"greelyshake","value":6},{"a":"artstate","name":"greely2","state":"castmagicloop"},{"a":"set","name":"greely2","state":3,"visible":1,"click":1},{"a":"show","name":"greelymajik2","click":0},{"a":"set","name":"greely2","state":2,"visible":1,"click":0},{"a":"wait","ms":1490},{"a":"send","cmd":"qshake","fields":"2000"},{"a":"wait","ms":2000},{"a":"set","name":"greely2x","state":4,"visible":1,"click":1},{"a":"talk","name":"greely2x","str":11006,"mode":4}]},{"id":134,"when":"answer","name":"greely2x","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"set","name":"greely2x","state":2,"visible":0,"click":0},{"a":"var","name":"greelyshake","value":11},{"a":"wait","ms":1470},{"a":"show","name":"exitking","click":1}]},{"id":135,"when":"trigger","name":"exitking","once":false,"holding":"","nth":0,"actions":[{"a":"room","key":"in6e","spawn":"in6e"}]},{"id":136,"when":"trigger","name":"init6e","once":false,"holding":"","nth":0,"actions":[{"a":"goal","str":10922},{"a":"show","name":"phantomvol05","click":0},{"a":"set","name":"init6e","state":99,"visible":0,"click":0}]},{"id":137,"when":"trigger","name":"playendswf","once":false,"holding":"","nth":0,"actions":[{"a":"wait","ms":2410},{"a":"set","name":"phantomvol05","state":99,"visible":0,"click":0},{"a":"send","cmd":"qmusic","fields":"0"},{"a":"cutscene","swf":"2551","extra":"null|null"},{"a":"set","name":"playendswf","state":99,"visible":0,"click":0}]},{"id":138,"when":"trigger","name":"to6f","once":false,"holding":"","nth":0,"actions":[{"a":"room","key":"in6f","spawn":"in6f"}]},{"id":139,"when":"trigger","name":"init6f","once":true,"holding":"","nth":0,"actions":[{"a":"goal","str":10923},{"a":"var","name":"80_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure6-greelysinferno/#80-escapethevolcano/#0#001"},{"a":"var","name":"80_uri","value":99},{"a":"appear","name":"cosmo2","face":""},{"a":"appear","name":"graham2","face":""},{"a":"set","name":"graham2","state":2,"visible":1,"click":0},{"a":"appear","name":"liza1","face":""},{"a":"set","name":"liza1","state":2,"visible":1,"click":0},{"a":"set","name":"init6f","state":99,"visible":0,"click":0}]},{"id":140,"when":"trigger","name":"cosmo2","once":false,"holding":"","nth":1,"nthOn":false,"actions":[{"a":"wait","ms":1380},{"a":"talk","name":"cosmo2","str":10893,"mode":1}]},{"id":141,"when":"trigger","name":"cosmo2","once":false,"holding":"","nth":2,"nthOn":false,"actions":[{"a":"talk","name":"cosmo2","str":10897,"mode":4}]},{"id":142,"when":"trigger","name":"cosmo2","once":false,"holding":"","nth":3,"nthOn":true,"actions":[{"a":"talk","name":"cosmo2","str":10897,"mode":4}]},{"id":143,"when":"answer","name":"cosmo2","once":false,"holding":"","nth":1,"nthOn":0,"actions":[{"a":"wait","ms":1050},{"a":"goal","str":10924},{"a":"set","name":"cosmo2","state":2,"visible":1,"click":1},{"a":"show","name":"exitportal","click":0},{"a":"show","name":"portalsound","click":0},{"a":"xp","amount":50,"name":"cosmo2"},{"a":"set","name":"cosmo2","state":3,"visible":1,"click":0},{"a":"var","name":"90_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure6-greelysinferno/#90-exit/#0#001"},{"a":"prize","list":"den 1374, den 1372, gems 750, gems 1000, den 1370"},{"a":"wait","ms":2620},{"a":"set","name":"cosmo2","state":4,"visible":1,"click":1},{"a":"set","name":"graham2","state":3,"visible":1,"click":1},{"a":"set","name":"liza1","state":3,"visible":1,"click":1},{"a":"set","name":"exitblock","state":99,"visible":0,"click":0}]},{"id":144,"when":"trigger","name":"graham2","once":false,"holding":"","nth":0,"actions":[{"a":"talk","name":"graham2","str":10909,"mode":3}]},{"id":145,"when":"trigger","name":"liza1","once":false,"holding":"","nth":0,"actions":[{"a":"talk","name":"liza1","str":10921,"mode":3}]},{"id":146,"when":"trigger","name":"exitroom","once":false,"holding":"","nth":0,"actions":[{"a":"end"}]},{"id":147,"holding":"","when":"trigger","name":"phantom#a__give_gem","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"send","cmd":"qad","fields":"{name}|0|null"},{"a":"gems","amount":25}]},{"id":148,"holding":"","when":"trigger","name":"phantom#b__give_gem","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"send","cmd":"qad","fields":"{name}|0|null"},{"a":"gems","amount":25}]},{"id":149,"holding":"","when":"trigger","name":"phantom#d__give_gem","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"send","cmd":"qad","fields":"{name}|0|null"},{"a":"gems","amount":25}]},{"id":150,"holding":"","when":"trigger","name":"phantom#c__give_gem","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"send","cmd":"qad","fields":"{name}|0|null"},{"a":"gems","amount":25}]},{"id":151,"holding":"","when":"trigger","name":"lavatrig#","family":true,"holdFam":"gem#","unlessFam":"","once":true,"nth":0,"actions":[{"a":"use"},{"a":"show","name":"lavaline{n}","click":0},{"a":"set","name":"lavainfo{n}","state":99,"visible":0,"click":0},{"a":"var","name":"lavacount","value":"{count}"},{"a":"xp","amount":25,"name":"{name}"},{"a":"hide","name":"{name}"}]},{"id":152,"holding":"","when":"trigger","name":"phantom__#a__give_gem","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"send","cmd":"qad","fields":"{name}|0|null"},{"a":"gems","amount":25}]},{"id":153,"holding":"","when":"trigger","name":"factory#","family":true,"holdFam":"","unlessFam":"","once":false,"nth":0,"actions":[{"a":"wait","ms":360},{"a":"show","name":"lavacrack02","click":0},{"a":"show","name":"lavahurt02","click":1},{"a":"show","name":"lavasound2","click":0},{"a":"show","name":"lavasound4","click":0}]},{"id":154,"holding":"","when":"trigger","name":"pod#__give_gem","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"send","cmd":"qad","fields":"{name}|0|null"},{"a":"gems","amount":5}]},{"id":155,"holding":"","when":"trigger","name":"kphant__#a__give_gem","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"send","cmd":"qad","fields":"{name}|0|null"},{"a":"gems","amount":25}]},{"id":156,"holding":"","when":"trigger","name":"kphant__#b__give_gem","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"send","cmd":"qad","fields":"{name}|0|null"},{"a":"gems","amount":25}]},{"id":157,"holding":"","when":"trigger","name":"kphant__#c__give_gem","family":true,"holdFam":"","unlessFam":"","once":true,"nth":0,"actions":[{"a":"send","cmd":"qad","fields":"{name}|0|null"},{"a":"gems","amount":25}]},{"id":158,"holding":"","when":"eaten","name":"","boss":"boss_easy","nth":1,"once":false,"dies":null,"actions":[]},{"id":159,"holding":"","when":"eaten","name":"","boss":"boss_easy","nth":2,"once":false,"dies":null,"actions":[]},{"id":160,"holding":"","when":"eaten","name":"","boss":"boss_easy","nth":3,"once":false,"dies":null,"actions":[{"a":"wait","ms":350},{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"send","cmd":"qahs","fields":"{phantom}|90|100|0"}]},{"id":161,"holding":"","when":"eaten","name":"","boss":"boss_easy","nth":4,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"artstate","name":"{phantom}","state":"agro"},{"a":"show","name":"{phantom}","click":1},{"a":"send","cmd":"qahs","fields":"{phantom}|80|100|0"},{"a":"wait","ms":1080},{"a":"var","name":"spawner","value":"{count}"},{"a":"artstate","name":"kphant__1a","state":"appear"},{"a":"path","name":"kphant__1a","path":"kpath1"},{"a":"show","name":"kphant__1a","click":1},{"a":"artstate","name":"kphant__5a","state":"appear"},{"a":"path","name":"kphant__5a","path":"kpath3"},{"a":"show","name":"kphant__5a","click":1},{"a":"artstate","name":"kphant__1a","state":"appear"},{"a":"path","name":"kphant__1a","path":"kpath1"},{"a":"show","name":"kphant__1a","click":1},{"a":"artstate","name":"kphant__5a","state":"appear"},{"a":"path","name":"kphant__5a","path":"kpath3"},{"a":"show","name":"kphant__5a","click":1},{"a":"sound","sound":"ajq_phantomminispawn"},{"a":"set","name":"phantomvol04","state":99,"visible":0,"click":0},{"a":"var","name":"spawntimer","value":0},{"a":"set","name":"phantomvol03","state":99,"visible":0,"click":0},{"a":"show","name":"phantomvol04","click":0},{"a":"send","cmd":"qshake","fields":"2000"}]},{"id":162,"holding":"","when":"eaten","name":"","boss":"boss_easy","nth":5,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"send","cmd":"qahs","fields":"{phantom}|70|100|0"}]},{"id":163,"holding":"","when":"eaten","name":"","boss":"boss_easy","nth":6,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"artstate","name":"{phantom}","state":"agro"},{"a":"set","name":"{phantom}","state":2,"visible":1,"click":1},{"a":"send","cmd":"qahs","fields":"{phantom}|60|100|0"},{"a":"wait","ms":1990},{"a":"var","name":"spawner","value":"{count}"},{"a":"artstate","name":"kphant__2b","state":"appear"},{"a":"path","name":"kphant__2b","path":"kpath1"},{"a":"show","name":"kphant__2b","click":1},{"a":"artstate","name":"kphant__3b","state":"appear"},{"a":"path","name":"kphant__3b","path":"kpath2"},{"a":"show","name":"kphant__3b","click":1},{"a":"artstate","name":"kphant__4b","state":"appear"},{"a":"path","name":"kphant__4b","path":"kpath2"},{"a":"show","name":"kphant__4b","click":1},{"a":"artstate","name":"kphant__6b","state":"appear"},{"a":"path","name":"kphant__6b","path":"kpath3"},{"a":"show","name":"kphant__6b","click":1},{"a":"artstate","name":"kphant__2b","state":"appear"},{"a":"path","name":"kphant__2b","path":"kpath1"},{"a":"show","name":"kphant__2b","click":1},{"a":"artstate","name":"kphant__3b","state":"appear"},{"a":"path","name":"kphant__3b","path":"kpath2"},{"a":"show","name":"kphant__3b","click":1},{"a":"artstate","name":"kphant__4b","state":"appear"},{"a":"path","name":"kphant__4b","path":"kpath2"},{"a":"show","name":"kphant__4b","click":1},{"a":"artstate","name":"kphant__6b","state":"appear"},{"a":"path","name":"kphant__6b","path":"kpath3"},{"a":"show","name":"kphant__6b","click":1},{"a":"sound","sound":"ajq_phantomminispawn"},{"a":"show","name":"phantomvol03","click":0},{"a":"set","name":"phantomvol04","state":99,"visible":0,"click":0},{"a":"var","name":"spawntimer","value":0},{"a":"set","name":"phantomvol03","state":99,"visible":0,"click":0},{"a":"show","name":"phantomvol04","click":0},{"a":"send","cmd":"qshake","fields":"2000"}]},{"id":164,"holding":"","when":"eaten","name":"","boss":"boss_easy","nth":7,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"send","cmd":"qahs","fields":"{phantom}|50|100|0"}]},{"id":165,"holding":"","when":"eaten","name":"","boss":"boss_easy","nth":8,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"artstate","name":"{phantom}","state":"agro"},{"a":"set","name":"{phantom}","state":3,"visible":1,"click":1},{"a":"send","cmd":"qahs","fields":"{phantom}|40|100|0"},{"a":"wait","ms":1730},{"a":"var","name":"spawner","value":"{count}"},{"a":"artstate","name":"kphant__1c","state":"appear"},{"a":"path","name":"kphant__1c","path":"kpath1"},{"a":"show","name":"kphant__1c","click":1},{"a":"artstate","name":"kphant__3c","state":"appear"},{"a":"path","name":"kphant__3c","path":"kpath2"},{"a":"show","name":"kphant__3c","click":1},{"a":"artstate","name":"kphant__4c","state":"appear"},{"a":"path","name":"kphant__4c","path":"kpath2"},{"a":"show","name":"kphant__4c","click":1},{"a":"artstate","name":"kphant__5c","state":"appear"},{"a":"path","name":"kphant__5c","path":"kpath3"},{"a":"show","name":"kphant__5c","click":1},{"a":"artstate","name":"kphant__1c","state":"appear"},{"a":"path","name":"kphant__1c","path":"kpath1"},{"a":"show","name":"kphant__1c","click":1},{"a":"artstate","name":"kphant__3c","state":"appear"},{"a":"path","name":"kphant__3c","path":"kpath2"},{"a":"show","name":"kphant__3c","click":1},{"a":"artstate","name":"kphant__4c","state":"appear"},{"a":"path","name":"kphant__4c","path":"kpath2"},{"a":"show","name":"kphant__4c","click":1},{"a":"artstate","name":"kphant__5c","state":"appear"},{"a":"path","name":"kphant__5c","path":"kpath3"},{"a":"show","name":"kphant__5c","click":1},{"a":"sound","sound":"ajq_phantomminispawn"},{"a":"show","name":"phantomvol03","click":0},{"a":"set","name":"phantomvol04","state":99,"visible":0,"click":0},{"a":"var","name":"spawntimer","value":0},{"a":"set","name":"phantomvol03","state":99,"visible":0,"click":0},{"a":"show","name":"phantomvol04","click":0},{"a":"send","cmd":"qshake","fields":"2000"}]},{"id":166,"holding":"","when":"eaten","name":"","boss":"boss_easy","nth":9,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"send","cmd":"qahs","fields":"{phantom}|30|100|0"}]},{"id":167,"holding":"","when":"eaten","name":"","boss":"boss_easy","nth":10,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"artstate","name":"{phantom}","state":"agro"},{"a":"set","name":"{phantom}","state":4,"visible":1,"click":1},{"a":"send","cmd":"qahs","fields":"{phantom}|20|100|0"},{"a":"wait","ms":1340},{"a":"var","name":"spawner","value":"{count}"},{"a":"artstate","name":"kphant__1d","state":"appear"},{"a":"path","name":"kphant__1d","path":"kpath1"},{"a":"show","name":"kphant__1d","click":1},{"a":"artstate","name":"kphant__2d","state":"appear"},{"a":"path","name":"kphant__2d","path":"kpath1"},{"a":"show","name":"kphant__2d","click":1},{"a":"artstate","name":"kphant__3d","state":"appear"},{"a":"path","name":"kphant__3d","path":"kpath2"},{"a":"show","name":"kphant__3d","click":1},{"a":"artstate","name":"kphant__4d","state":"appear"},{"a":"path","name":"kphant__4d","path":"kpath2"},{"a":"show","name":"kphant__4d","click":1},{"a":"artstate","name":"kphant__5d","state":"appear"},{"a":"path","name":"kphant__5d","path":"kpath3"},{"a":"show","name":"kphant__5d","click":1},{"a":"artstate","name":"kphant__6d","state":"appear"},{"a":"path","name":"kphant__6d","path":"kpath3"},{"a":"show","name":"kphant__6d","click":1},{"a":"artstate","name":"kphant__1d","state":"appear"},{"a":"path","name":"kphant__1d","path":"kpath1"},{"a":"show","name":"kphant__1d","click":1},{"a":"artstate","name":"kphant__2d","state":"appear"},{"a":"path","name":"kphant__2d","path":"kpath1"},{"a":"show","name":"kphant__2d","click":1},{"a":"artstate","name":"kphant__3d","state":"appear"},{"a":"path","name":"kphant__3d","path":"kpath2"},{"a":"show","name":"kphant__3d","click":1},{"a":"artstate","name":"kphant__4d","state":"appear"},{"a":"path","name":"kphant__4d","path":"kpath2"},{"a":"show","name":"kphant__4d","click":1},{"a":"artstate","name":"kphant__5d","state":"appear"},{"a":"path","name":"kphant__5d","path":"kpath3"},{"a":"show","name":"kphant__5d","click":1},{"a":"artstate","name":"kphant__6d","state":"appear"},{"a":"path","name":"kphant__6d","path":"kpath3"},{"a":"show","name":"kphant__6d","click":1},{"a":"sound","sound":"ajq_phantomminispawn"},{"a":"show","name":"phantomvol03","click":0},{"a":"set","name":"phantomvol04","state":99,"visible":0,"click":0},{"a":"var","name":"spawntimer","value":0},{"a":"set","name":"phantomvol03","state":99,"visible":0,"click":0},{"a":"show","name":"phantomvol04","click":0},{"a":"send","cmd":"qshake","fields":"2000"}]},{"id":168,"holding":"","when":"eaten","name":"","boss":"boss_easy","nth":11,"once":false,"dies":null,"actions":[{"a":"send","cmd":"qepr","fields":"{phantom}"},{"a":"send","cmd":"qahs","fields":"{phantom}|10|100|0"}]},{"id":169,"holding":"","when":"eaten","name":"","boss":"boss_easy","nth":12,"once":false,"dies":[100,1],"actions":[{"a":"xp","amount":200,"name":"{phantom}"},{"a":"artstate","name":"kphant__1d","state":"disappear"},{"a":"set","name":"kphant__1d","state":98,"visible":1,"click":0},{"a":"artstate","name":"kphant__2d","state":"disappear"},{"a":"set","name":"kphant__2d","state":98,"visible":1,"click":0},{"a":"artstate","name":"kphant__3d","state":"disappear"},{"a":"set","name":"kphant__3d","state":98,"visible":1,"click":0}]},{"id":170,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["phantom#"],"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_gem|200|42|3|25|null|null|null"},{"a":"xp","amount":5,"name":"{phantom}"}]},{"id":171,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["phantom__#"],"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_gem|200|42|3|25|null|null|null"},{"a":"xp","amount":5,"name":"{phantom}"}]},{"id":172,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["phantom__#"],"unlessMembers":["phantom__00i","phantom__06b","phantom__06a","phantom__09a"],"actions":[{"a":"set","name":"{phantom}","state":3,"visible":1,"click":0}]},{"id":173,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["boomrock#"],"actions":[{"a":"xp","amount":5,"name":"{phantom}"},{"a":"sound","sound":"ajq_mussecretareastdel"},{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":174,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["factory#"],"actions":[{"a":"xp","amount":5,"name":"{phantom}"}]},{"id":175,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["factory#__#_"],"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_d|200|42|3|25|null|null|null"}]},{"id":176,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["kphant__#"],"actions":[{"a":"send","cmd":"qspn","fields":"{phantom}|{phantom}__give_gem|200|42|3|25|null|null|null"},{"a":"xp","amount":5,"name":"{phantom}"},{"a":"set","name":"{phantom}","state":3,"visible":1,"click":0}]},{"id":177,"holding":"","when":"eaten","name":"","member":"phantom00a","nth":0,"once":false,"actions":[{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":178,"holding":"","when":"eaten","name":"","member":"phantom00b","nth":0,"once":false,"actions":[{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":179,"holding":"","when":"eaten","name":"","member":"phantom00d","nth":0,"once":false,"actions":[{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":180,"holding":"","when":"eaten","name":"","member":"phantom__00i","nth":0,"once":false,"actions":[{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":181,"holding":"","when":"eaten","name":"","member":"phantom00r","nth":0,"once":false,"actions":[{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":182,"holding":"","when":"eaten","name":"","nth":6,"once":false,"actions":[{"a":"goal","str":10911}]},{"id":183,"holding":"","when":"eaten","name":"","member":"blockrock","nth":0,"once":false,"actions":[{"a":"xp","amount":5,"name":"{phantom}"},{"a":"set","name":"rockblock","state":99,"visible":0,"click":0},{"a":"set","name":"graham1","state":4,"visible":1,"click":1},{"a":"sound","sound":"ajq_mussecretareastdel"},{"a":"set","name":"blockinfo","state":99,"visible":0,"click":0},{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":184,"holding":"","when":"eaten","name":"","member":"phantom01a","nth":0,"once":false,"actions":[{"a":"set","name":"{phantom}","state":3,"visible":1,"click":0}]},{"id":185,"holding":"","when":"eaten","name":"","member":"phantom02d","nth":0,"once":false,"actions":[{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":186,"holding":"","when":"eaten","name":"","member":"phantom03a","nth":0,"once":false,"actions":[{"a":"show","name":"cork07","click":0},{"a":"sound","sound":"ajq_itemfound"},{"a":"set","name":"{phantom}","state":2,"visible":0,"click":0}]},{"id":187,"holding":"","when":"eaten","name":"","member":"phantom03c","nth":0,"once":false,"actions":[{"a":"show","name":"cork09","click":0},{"a":"sound","sound":"ajq_itemfound"},{"a":"set","name":"{phantom}","state":2,"visible":0,"click":0}]},{"id":188,"holding":"","when":"eaten","name":"","member":"phantom03b","nth":0,"once":false,"actions":[{"a":"show","name":"cork08","click":0},{"a":"sound","sound":"ajq_itemfound"},{"a":"set","name":"{phantom}","state":2,"visible":0,"click":0}]},{"id":189,"holding":"","when":"eaten","name":"","member":"phantom02a","nth":0,"once":false,"actions":[{"a":"show","name":"gear02a","click":0},{"a":"sound","sound":"ajq_cogappear"},{"a":"set","name":"{phantom}","state":2,"visible":0,"click":0}]},{"id":190,"holding":"","when":"eaten","name":"","member":"phantom02c","nth":0,"once":false,"actions":[{"a":"show","name":"gear02c","click":0},{"a":"sound","sound":"ajq_cogappear"},{"a":"set","name":"{phantom}","state":2,"visible":0,"click":0}]},{"id":191,"holding":"","when":"eaten","name":"","member":"phantom02b","nth":0,"once":false,"actions":[{"a":"show","name":"gear02b","click":0},{"a":"sound","sound":"ajq_cogappear"},{"a":"set","name":"{phantom}","state":2,"visible":0,"click":0}]},{"id":192,"holding":"","when":"eaten","name":"","member":"boomrock2","nth":0,"once":false,"actions":[{"a":"set","name":"rockblock02","state":99,"visible":0,"click":0},{"a":"appear","name":"treasure05","face":""},{"a":"set","name":"treasure05","state":2,"visible":1,"click":1}]},{"id":193,"holding":"","when":"eaten","name":"","member":"phantom05a","nth":0,"once":false,"actions":[{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":194,"holding":"","when":"eaten","name":"","member":"phantom05c","nth":0,"once":false,"actions":[{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":195,"holding":"","when":"eaten","name":"","member":"phantom11a","nth":0,"once":false,"actions":[{"a":"set","name":"{phantom}","state":3,"visible":1,"click":0}]},{"id":196,"holding":"","when":"eaten","name":"","member":"phantom11b","nth":0,"once":false,"actions":[{"a":"set","name":"{phantom}","state":3,"visible":1,"click":0}]},{"id":197,"holding":"","when":"eaten","name":"","member":"phantom11c","nth":0,"once":false,"actions":[{"a":"set","name":"{phantom}","state":3,"visible":1,"click":0}]},{"id":198,"holding":"","when":"eaten","name":"","member":"phantom__06b","nth":0,"once":false,"actions":[{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":199,"holding":"","when":"eaten","name":"","member":"phantom__06a","nth":0,"once":false,"actions":[{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":200,"holding":"","when":"eaten","name":"","member":"factory10","nth":0,"once":false,"actions":[{"a":"set","name":"factblok10","state":99,"visible":0,"click":0}]},{"id":201,"holding":"","when":"eaten","name":"","member":"boomrock1","nth":0,"once":false,"actions":[{"a":"set","name":"rockblock01","state":99,"visible":0,"click":0},{"a":"appear","name":"treasure04","face":""},{"a":"set","name":"treasure04","state":2,"visible":1,"click":1}]},{"id":202,"holding":"","when":"eaten","name":"","member":"phantom08a","nth":0,"once":false,"actions":[{"a":"sound","sound":"ajq_cogappear"},{"a":"set","name":"{phantom}","state":2,"visible":0,"click":0}]},{"id":203,"holding":"","when":"eaten","name":"","member":"phantom08c","nth":0,"once":false,"actions":[{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":204,"holding":"","when":"eaten","name":"","member":"phantom08b","nth":0,"once":false,"actions":[{"a":"sound","sound":"ajq_cogappear"},{"a":"set","name":"{phantom}","state":2,"visible":0,"click":0}]},{"id":205,"holding":"","when":"eaten","name":"","member":"factory01","nth":0,"once":false,"actions":[{"a":"set","name":"factblok01","state":99,"visible":0,"click":0}]},{"id":206,"holding":"","when":"eaten","name":"","member":"phantom__09a","nth":0,"once":false,"actions":[{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":207,"holding":"","when":"eaten","name":"","member":"factory03","nth":0,"once":false,"actions":[{"a":"set","name":"factblok03","state":99,"visible":0,"click":0}]},{"id":208,"holding":"","when":"eaten","name":"","member":"factory02","nth":0,"once":false,"actions":[{"a":"set","name":"factblok02","state":99,"visible":0,"click":0}]},{"id":209,"holding":"","when":"eaten","name":"","member":"factory04","nth":0,"once":false,"actions":[{"a":"set","name":"factblok04","state":99,"visible":0,"click":0}]},{"id":210,"holding":"","when":"eaten","name":"","member":"factory09","nth":0,"once":false,"actions":[{"a":"set","name":"factblok09","state":99,"visible":0,"click":0}]},{"id":211,"holding":"","when":"eaten","name":"","member":"factory05","nth":0,"once":false,"actions":[{"a":"set","name":"factblok05","state":99,"visible":0,"click":0}]},{"id":212,"holding":"","when":"eaten","name":"","member":"factory06","nth":0,"once":false,"actions":[{"a":"set","name":"factblok06","state":99,"visible":0,"click":0},{"a":"wait","ms":740},{"a":"var","name":"lavatoggle","value":0}]},{"id":213,"holding":"","when":"eaten","name":"","member":"factory06__1_","nth":0,"once":false,"actions":[{"a":"show","name":"lavacrack01","click":0}]},{"id":214,"holding":"","when":"eaten","name":"","member":"factory07","nth":0,"once":false,"actions":[{"a":"set","name":"factblok07","state":99,"visible":0,"click":0}]},{"id":215,"holding":"","when":"eaten","name":"","member":"phantom__10b","nth":0,"once":false,"actions":[{"a":"show","name":"cork04","click":0},{"a":"sound","sound":"ajq_itemfound"}]},{"id":216,"holding":"","when":"eaten","name":"","member":"phantom__10a","nth":0,"once":false,"actions":[{"a":"show","name":"cork03","click":0},{"a":"sound","sound":"ajq_itemfound"}]},{"id":217,"holding":"","when":"eaten","name":"","member":"kphant__3c","nth":0,"once":false,"actions":[{"a":"send","cmd":"qseed","fields":"137|0|3"},{"a":"send","cmd":"qps","fields":"1|iluvbunnies1234|plant__61_|137|918|1675|1162812"}]},{"id":218,"holding":"","when":"eaten","name":"","member":"kphant__4d","nth":0,"once":false,"actions":[{"a":"artstate","name":"{phantom}","state":"disappear"},{"a":"set","name":"{phantom}","state":98,"visible":1,"click":0},{"a":"artstate","name":"kphant__5d","state":"disappear"},{"a":"set","name":"kphant__5d","state":98,"visible":1,"click":0},{"a":"artstate","name":"kphant__6d","state":"disappear"},{"a":"set","name":"kphant__6d","state":98,"visible":1,"click":0},{"a":"set","name":"seedpile6","state":99,"visible":0,"click":0},{"a":"show","name":"seedpile6t","click":0},{"a":"send","cmd":"qmusic","fields":"0"},{"a":"set","name":"kphant__1a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__2a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__3a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__4a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__5a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__6a","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__1b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__2b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__3b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__4b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__5b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__6b","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__1c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__2c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__3c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__4c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__5c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__6c","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__1d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__2d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__3d","state":99,"visible":0,"click":0},{"a":"set","name":"{phantom}","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__5d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__6d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__7d","state":99,"visible":0,"click":0},{"a":"set","name":"kphant__8d","state":99,"visible":0,"click":0},{"a":"set","name":"phantomvol04","state":99,"visible":0,"click":0},{"a":"wait","ms":2000},{"a":"sound","sound":"ajq_bossvictorystinger"},{"a":"appear","name":"greely2","face":""},{"a":"var","name":"70_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure6-greelysinferno/#70-defeatthephantomking/#0#001"},{"a":"var","name":"70_uri","value":99},{"a":"goal","str":10920},{"a":"send","cmd":"qicon","fields":"greely2|1"}]},{"id":219,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["phantom#"],"unlessMembers":["phantom00a","phantom00b","phantom00d","phantom00r","phantom01a","phantom02d","phantom03a","phantom03c","phantom03b","phantom02a","phantom02c","phantom02b","phantom05a","phantom05c","phantom11a","phantom11b","phantom11c","phantom08a","phantom08c","phantom08b"],"actions":[{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]},{"id":220,"holding":"","when":"eaten","name":"","nth":0,"once":false,"stems":["phantom__#"],"unlessMembers":["phantom__00i","phantom__04b","phantom__04c","phantom__04d","phantom__04a","phantom__06b","phantom__06a","phantom__09a","phantom__10b","phantom__10a"],"actions":[{"a":"set","name":"{phantom}","state":2,"visible":1,"click":0}]}],"written":"2018-01-05 23:48:49","ambient":{"rooms":["start","in6c1","in6e"],"first":1000,"variants":[{"acts":[{"a":"var","name":"shaketimer","value":7},{"a":"send","cmd":"qshake","fields":"750"}],"wait":8010},{"acts":[{"a":"var","name":"shaketimer","value":3},{"a":"send","cmd":"qshake","fields":"1500"}],"wait":12010},{"acts":[{"a":"var","name":"shaketimer","value":5},{"a":"send","cmd":"qshake","fields":"1000"}],"wait":10010}]},"spawners":{"factory10":[11,2],"factory01":[11,2],"factory02":[11,2],"factory03":[11,2],"factory04":[11,2],"factory05":[11,2],"factory06":[11,2],"factory07":[11,2]},"eat":{"phantom00a":[50,1],"phantom00b":[50,1],"phantom00d":[50,1],"phantom__00i":[50,1],"phantom00r":[50,1],"blockrock":[1,1],"phantom01a":[50,1],"phantom02d":[50,1],"phantom03a":[50,1],"phantom03c":[50,1],"phantom03b":[50,1],"phantom02a":[50,1],"phantom02c":[50,1],"phantom02b":[50,1],"boomrock2":[1,1],"phantom__04b":[50,1],"phantom__04c":[50,1],"phantom__04d":[50,1],"phantom__04a":[50,1],"phantom05a":[50,1],"phantom05c":[50,1],"phantom11a":[50,1],"phantom11b":[50,1],"phantom11c":[50,1],"phantom__06b":[50,1],"phantom__06a":[50,1],"factory10":[1,1],"factory10__0_":[50,1],"boomrock1":[1,1],"phantom08a":[50,1],"phantom08c":[50,1],"phantom08b":[50,1],"factory01":[1,1],"factory01__0_":[50,1],"phantom__09a":[50,1],"factory03":[1,1],"factory02__0_":[50,1],"factory02__1_":[50,1],"factory03__0_":[50,1],"factory03__1_":[50,1],"factory02":[1,1],"factory02__2_":[50,1],"factory03__2_":[50,1],"factory04":[1,1],"factory04__1_":[50,1],"factory04__0_":[50,1],"factory09":[1,1],"factory05":[1,1],"factory05__0_":[50,1],"factory06__0_":[50,1],"factory06":[1,1],"factory06__1_":[50,1],"factory07":[1,1],"factory07__0_":[50,1],"phantom__10b":[50,1],"phantom__10a":[50,1],"kphant__1a":[50,1],"kphant__3b":[50,1],"kphant__6b":[50,1],"kphant__5a":[50,1],"kphant__2b":[50,1],"kphant__3c":[50,1],"kphant__5c":[50,1],"kphant__4c":[50,1],"kphant__4b":[50,1],"kphant__1c":[50,1],"boss_easy":[100,1],"kphant__4d":[50,1]},"bars":[],"variantGroups":[],"countRules":[{"counter":"lavacount","value":1,"actions":[{"a":"var","name":"20_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure6-greelysinferno/#20-foundfirstalphastone/#0#001"},{"a":"var","name":"20_uri","value":99},{"a":"goal","str":10913},{"a":"goal","str":10913}]},{"counter":"lavacount","value":2,"actions":[{"a":"var","name":"30_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure6-greelysinferno/#30-foundsecondalphastone/#0#001"},{"a":"var","name":"30_uri","value":99},{"a":"goal","str":10914},{"a":"goal","str":10914}]},{"counter":"lavacount","value":3,"actions":[{"a":"var","name":"40_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure6-greelysinferno/#40-foundthirdalphastone/#0#001"},{"a":"var","name":"40_uri","value":99},{"a":"goal","str":10915},{"a":"goal","str":10915}]},{"counter":"lavacount","value":4,"actions":[{"a":"var","name":"50_uri","value":1},{"a":"send","cmd":"qposturi","fields":"/adventure6-greelysinferno/#50-gatherthealphastones/#0#001"},{"a":"var","name":"50_uri","value":99},{"a":"goal","str":10916},{"a":"xp","amount":25,"name":"lavacount"},{"a":"show","name":"lavadone","click":0},{"a":"sound","sound":"ajq_firedoor"},{"a":"goal","str":10916},{"a":"xp","amount":25,"name":"lavacount"},{"a":"sound","sound":"ajq_firedoor"},{"a":"set","name":"lavablock","state":99,"visible":0,"click":0}]}],"puzzles":[{"name":"puz01","mirrors":{"trig01":{"mirror":"puz01start","init":1,"vc":[1,0],"turn":[{"a":"set","name":"trig01","state":2,"visible":1,"click":1},{"a":"set","name":"trig01","state":1,"visible":1,"click":1}],"first":[{"a":"show","name":"gear01sound","click":0}],"lit":{"by":[],"table":{"":1}}}},"goals":[{"solved":{"puz01start":0},"done":[{"a":"set","name":"puz01beam01","state":50,"visible":1,"click":0},{"a":"xp","amount":25,"name":"puz01done"},{"a":"show","name":"puz01end","click":0},{"a":"show","name":"puz01door","click":0},{"a":"sound","sound":"ajq_gemdoor"},{"a":"set","name":"puz01frame","state":2,"visible":1,"click":0},{"a":"set","name":"trig01","state":99,"visible":0,"click":0},{"a":"wait","ms":1390},{"a":"set","name":"puz01block","state":99,"visible":0,"click":0}]}],"beams":{},"locks":[],"sting":"ajq_mirrorstinger","start":{"puz01start":[9,1,0],"puz01beam01":[99,0,0],"puz01end":[0,1,1],"puz01door":[0,1,1],"puz01frame":[0,1,1],"puz01block":[0,1,1]},"lit0":{"puz01start":2}},{"name":"puz02","mirrors":{"trig02b":{"mirror":"puz02start2","init":2,"vc":[1,0],"turn":[{"a":"set","name":"trig02b","state":2,"visible":1,"click":1},{"a":"set","name":"trig02b","state":1,"visible":1,"click":1}],"first":[],"lit":{"by":[],"table":{"":1}}},"trig02a":{"mirror":"puz02start1","init":0,"vc":[1,0],"turn":[{"a":"set","name":"trig02a","state":2,"visible":1,"click":1},{"a":"set","name":"trig02a","state":1,"visible":1,"click":1}],"first":[],"lit":{"by":["puz02start1","puz02start3"],"table":{"1,2":1,"2,2":1,"3,2":1,"3,3":1,"3,0":1,"3,1":1,"0,1":1,"1,1":1}}},"trig02c":{"mirror":"puz02start3","init":2,"vc":[1,0],"turn":[{"a":"set","name":"trig02c","state":2,"visible":1,"click":1},{"a":"set","name":"trig02c","state":1,"visible":1,"click":1}],"first":[],"lit":{"by":["puz02start3"],"table":{"0":1,"1":1,"3":1}}}},"goals":[{"solved":{"puz02start2":0,"puz02start1":3},"done":[{"a":"show","name":"puz02end2","click":0},{"a":"set","name":"puz02frame1l","state":2,"visible":1,"click":0},{"a":"xp","amount":25,"name":"puz02done1"},{"a":"show","name":"puz02door1","click":0},{"a":"sound","sound":"ajq_gemdoor"},{"a":"set","name":"gear02trig3","state":0,"visible":1,"click":1},{"a":"wait","ms":1700},{"a":"set","name":"puz02block1","state":99,"visible":0,"click":0}]},{"solved":{"puz02start2":1,"puz02start1":1,"puz02start3":1},"done":[{"a":"set","name":"puz02beam10","state":70,"visible":1,"click":0},{"a":"set","name":"puz02g","state":7,"visible":1,"click":0},{"a":"show","name":"puz02beam11","click":0},{"a":"set","name":"puz02h","state":5,"visible":1,"click":0},{"a":"show","name":"puz02beam12","click":0},{"a":"set","name":"puz02i","state":6,"visible":1,"click":0},{"a":"show","name":"puz02beam13","click":0},{"a":"set","name":"puz02j","state":4,"visible":1,"click":0},{"a":"show","name":"puz02beam14","click":0},{"a":"set","name":"puz02k","state":6,"visible":1,"click":0},{"a":"show","name":"puz02beam15","click":0},{"a":"set","name":"puz02l","state":7,"visible":1,"click":0},{"a":"show","name":"puz02beam16","click":0},{"a":"set","name":"puz02m","state":5,"visible":1,"click":0},{"a":"set","name":"puz02beam17","state":150,"visible":1,"click":0},{"a":"show","name":"puz02end5","click":0},{"a":"show","name":"puz02end5x","click":0},{"a":"xp","amount":25,"name":"puz02done2"},{"a":"show","name":"puz02door2","click":0},{"a":"sound","sound":"ajq_gemdoor"},{"a":"set","name":"trig02a","state":99,"visible":0,"click":0},{"a":"set","name":"trig02b","state":99,"visible":0,"click":0},{"a":"set","name":"trig02c","state":99,"visible":0,"click":0},{"a":"show","name":"cork05","click":0},{"a":"wait","ms":1110},{"a":"set","name":"puz02block2","state":99,"visible":0,"click":0}]}],"beams":{"puz02beam04":{"by":["puz02start2"],"table":{"0":[1,1,0]},"off":[99,0,0]},"puz02c":{"by":["puz02start2"],"table":{"0":[6,1,0]},"off":[2,1,0]},"puz02beam05":{"by":["puz02start2"],"table":{"0":[1,1,0]},"off":[99,0,0]},"puz02d":{"by":["puz02start2"],"table":{"0":[5,1,0]},"off":[1,1,0]},"puz02beam06":{"by":["puz02start2"],"table":{"0":[1,1,0]},"off":[99,0,0]},"puz02e":{"by":["puz02start2"],"table":{"0":[7,1,0]},"off":[3,1,0]},"puz02beam07":{"by":["puz02start2"],"table":{"0":[1,1,0]},"off":[99,0,0]},"puz02end1":{"by":["puz02start2"],"table":{"0":[1,1,0],"1":[1,1,0]},"off":[0,1,1]},"puz02frame1r":{"by":["puz02start2"],"table":{"0":[2,1,0],"1":[2,1,0]},"off":[0,1,1]},"puz02beam08":{"by":["puz02start1"],"table":{"1":[1,1,0]},"off":[99,0,0]},"puz02f":{"by":["puz02start1"],"table":{"1":[6,1,0]},"off":[2,1,0]},"puz02beam09":{"by":["puz02start1"],"table":{"1":[150,1,0]},"off":[99,0,0]},"puz02end4":{"by":["puz02start1","puz02start3"],"table":{"1,2":[1,1,0],"2,2":[0,1,0],"3,2":[0,1,0],"3,3":[0,1,0],"3,0":[0,1,0],"3,1":[0,1,0],"0,1":[0,1,0],"1,1":[1,1,0]},"off":[0,1,1]},"puz02end4n5":{"by":["puz02start1","puz02start3"],"table":{"1,2":[1,1,0],"2,2":[0,1,0],"3,2":[0,1,0],"3,3":[0,1,0],"3,0":[0,1,0],"3,1":[0,1,0],"0,1":[0,1,0],"1,1":[1,1,0]},"off":[0,1,1]},"puz02frame2l":{"by":["puz02start2","puz02start1","puz02start3"],"table":{"0,1,2":[1,1,0],"0,2,2":[0,1,0],"0,3,2":[0,1,0],"0,3,3":[0,1,0],"0,3,0":[0,1,0],"0,3,1":[0,1,0],"0,0,1":[0,1,0],"0,1,1":[1,1,0],"1,1,1":[2,1,0]},"off":[0,1,1]},"puz02beam18":{"by":["puz02start3"],"table":{"1":[240,1,0]},"off":[99,0,0]},"puz02n":{"by":["puz02start3"],"table":{"1":[6,1,0]},"off":[2,1,0]},"puz02beam19":{"by":["puz02start3"],"table":{"1":[150,1,0]},"off":[99,0,0]},"puz02end3":{"by":["puz02start3"],"table":{"1":[1,1,0]},"off":[0,1,1]},"puz02frame2r":{"by":["puz02start3"],"table":{"1":[2,1,0]},"off":[0,1,1]},"puz02beam01":{"by":["puz02start1"],"table":{"3":[1,1,0]},"off":[99,0,0]},"puz02a":{"by":["puz02start1"],"table":{"3":[5,1,0]},"off":[1,1,0]},"puz02beam02":{"by":["puz02start1"],"table":{"3":[1,1,0]},"off":[99,0,0]},"puz02b":{"by":["puz02start1"],"table":{"3":[7,1,0]},"off":[3,1,0]},"puz02beam03":{"by":["puz02start1"],"table":{"3":[150,1,0]},"off":[99,0,0]}},"locks":[],"sting":"ajq_mirrorstinger","start":{"puz02start2":[10,1,0],"puz02beam04":[99,0,0],"puz02c":[2,1,0],"puz02beam05":[99,0,0],"puz02d":[1,1,0],"puz02beam06":[99,0,0],"puz02e":[3,1,0],"puz02beam07":[99,0,0],"puz02end1":[0,1,1],"puz02frame1r":[0,1,1],"puz02start1":[0,1,0],"puz02beam08":[99,0,0],"puz02f":[2,1,0],"puz02beam09":[99,0,0],"puz02end4":[0,1,1],"puz02end4n5":[0,1,1],"puz02frame2l":[0,1,1],"puz02beam01":[99,0,0],"puz02a":[1,1,0],"puz02beam02":[99,0,0],"puz02b":[3,1,0],"puz02beam03":[99,0,0],"puz02end2":[0,1,1],"puz02frame1l":[0,1,1],"puz02door1":[0,1,1],"puz02block1":[0,1,1],"puz02start3":[2,1,0],"puz02beam18":[99,0,0],"puz02n":[2,1,0],"puz02beam19":[99,0,0],"puz02end3":[0,1,1],"puz02frame2r":[0,1,1],"puz02beam10":[99,0,0],"puz02g":[3,1,0],"puz02beam11":[99,0,0],"puz02h":[1,1,0],"puz02beam12":[99,0,0],"puz02i":[2,1,0],"puz02beam13":[99,0,0],"puz02j":[0,1,0],"puz02beam14":[99,0,0],"puz02k":[2,1,0],"puz02beam15":[99,0,0],"puz02l":[3,1,0],"puz02beam16":[99,0,0],"puz02m":[1,1,0],"puz02beam17":[99,0,0],"puz02end5":[0,1,1],"puz02end5x":[0,0,1],"puz02door2":[0,1,1],"puz02block2":[0,1,1]},"lit0":{"puz02start2":2,"puz02start1":0,"puz02start3":0}},{"name":"puz03","mirrors":{"trig03a":{"mirror":"puz03start","init":1,"vc":[1,0],"turn":[{"a":"set","name":"trig03a","state":2,"visible":1,"click":1},{"a":"set","name":"trig03a","state":1,"visible":1,"click":1}],"first":[],"lit":{"by":[],"table":{"":1}}},"trig03e":{"mirror":"puz03f","init":1,"vc":[1,0],"turn":[{"a":"set","name":"trig03e","state":2,"visible":1,"click":1},{"a":"set","name":"trig03e","state":1,"visible":1,"click":1}],"first":[],"lit":{"by":["puz03start","puz03f","puz03b"],"table":{"0,1,3":1,"0,2,3":1,"0,1,2":1,"0,0,2":1}}},"trig03d":{"mirror":"puz03e","init":3,"vc":[1,0],"turn":[{"a":"set","name":"trig03d","state":2,"visible":1,"click":1},{"a":"set","name":"trig03d","state":1,"visible":1,"click":1}],"first":[],"lit":{"by":["puz03start","puz03f","puz03e","puz03d","puz03b","puz03g","puz03i","puz03k"],"table":{"0,1,3,0,3,3,1,3":1,"0,1,2,0,3,3,1,3":1,"0,1,2,1,3,3,1,3":1,"0,1,2,2,3,3,1,3":1,"0,1,2,3,3,3,1,3":1,"0,1,2,3,2,3,1,3":1,"0,2,2,3,2,3,1,3":1,"0,3,2,3,2,3,1,3":1,"0,0,2,3,2,3,1,3":1,"0,0,2,3,2,0,1,3":1,"0,0,2,3,2,1,1,3":1,"0,0,2,3,2,2,1,3":1,"0,0,2,3,2,2,2,3":1,"0,0,2,3,2,2,3,3":1,"0,0,2,3,2,2,0,3":1,"0,0,2,3,2,2,0,0":1,"0,0,2,3,2,2,0,1":1,"0,0,2,3,2,2,0,2":1}}},"trig03c":{"mirror":"puz03d","init":0,"vc":[1,0],"turn":[{"a":"set","name":"trig03c","state":2,"visible":1,"click":1},{"a":"set","name":"trig03c","state":1,"visible":1,"click":1}],"first":[],"lit":{"by":["puz03e","puz03d","puz03b"],"table":{"2,0,3":1,"2,3,3":1,"2,3,2":1}}},"trig03b":{"mirror":"puz03b","init":3,"vc":[1,0],"turn":[{"a":"set","name":"trig03b","state":2,"visible":1,"click":1},{"a":"set","name":"trig03b","state":1,"visible":1,"click":1}],"first":[],"lit":{"by":["puz03start","puz03b"],"table":{"0,3":1,"0,2":1}}},"trig03f":{"mirror":"puz03g","init":3,"vc":[1,0],"turn":[{"a":"set","name":"trig03f","state":2,"visible":1,"click":1},{"a":"set","name":"trig03f","state":1,"visible":1,"click":1}],"first":[],"lit":{"by":["puz03g"],"table":{"1":1,"2":1}}},"trig03g":{"mirror":"puz03i","init":1,"vc":[1,0],"turn":[{"a":"set","name":"trig03g","state":2,"visible":1,"click":1},{"a":"set","name":"trig03g","state":1,"visible":1,"click":1}],"first":[],"lit":{"by":["puz03i"],"table":{"0":1,"3":1}}},"trig03h":{"mirror":"puz03k","init":3,"vc":[1,0],"turn":[{"a":"set","name":"trig03h","state":2,"visible":1,"click":1},{"a":"set","name":"trig03h","state":1,"visible":1,"click":1}],"first":[],"lit":{"by":["puz03k"],"table":{"1":1,"2":1}}}},"goals":[{"solved":{"puz03start":0,"puz03f":0,"puz03e":2,"puz03d":3,"puz03b":2,"puz03g":2,"puz03i":0,"puz03k":2},"done":[{"a":"xp","amount":25,"name":"puz03done"},{"a":"show","name":"puz03end","click":0},{"a":"show","name":"puz03door","click":0},{"a":"sound","sound":"ajq_gemdoor"},{"a":"set","name":"puz03frame","state":2,"visible":1,"click":0},{"a":"show","name":"puz03beam12","click":0},{"a":"set","name":"trig03a","state":99,"visible":0,"click":0},{"a":"set","name":"trig03b","state":99,"visible":0,"click":0},{"a":"set","name":"trig03c","state":99,"visible":0,"click":0},{"a":"set","name":"trig03d","state":99,"visible":0,"click":0},{"a":"set","name":"trig03e","state":99,"visible":0,"click":0},{"a":"set","name":"trig03f","state":99,"visible":0,"click":0},{"a":"set","name":"trig03g","state":99,"visible":0,"click":0},{"a":"set","name":"trig03h","state":99,"visible":0,"click":0},{"a":"show","name":"cork06","click":0},{"a":"wait","ms":1640},{"a":"set","name":"puz03block","state":99,"visible":0,"click":0}]}],"beams":{"puz03beam01":{"by":["puz03start"],"table":{"0":[1,1,0]},"off":[99,0,0]},"puz03a":{"by":["puz03start"],"table":{"0":[5,1,0]},"off":[1,1,0]},"puz03beam02":{"by":["puz03start"],"table":{"0":[1,1,0]},"off":[99,0,0]},"puz03beam13":{"by":["puz03start","puz03b"],"table":{"0,3":[1,1,0]},"off":[99,0,0]},"puz03beam06":{"by":["puz03start","puz03f","puz03b"],"table":{"0,1,3":[80,1,0],"0,1,2":[80,1,0],"0,2,2":[80,1,0],"0,3,2":[80,1,0],"0,0,2":[80,1,0]},"off":[99,0,0]},"puz03beam05":{"by":["puz03e","puz03b"],"table":{"2,3":[80,1,0],"2,2":[80,1,0]},"off":[99,0,0]},"puz03beam04":{"by":["puz03d","puz03b"],"table":{"3,3":[70,1,0],"3,2":[70,1,0]},"off":[99,0,0]},"puz03c":{"by":["puz03d","puz03b"],"table":{"3,3":[4,1,0],"3,2":[4,1,0]},"off":[0,1,0]},"puz03beam03":{"by":["puz03d","puz03b"],"table":{"3,3":[1,1,0],"3,2":[1,1,0]},"off":[99,0,0]},"puz03beam07":{"by":["puz03f","puz03e"],"table":{"0,2":[1,1,0]},"off":[99,0,0]},"puz03beam08":{"by":["puz03g"],"table":{"2":[320,1,0]},"off":[99,0,0]},"puz03h":{"by":["puz03g"],"table":{"2":[5,1,0]},"off":[1,1,0]},"puz03beam09":{"by":["puz03g"],"table":{"2":[1,1,0]},"off":[99,0,0]},"puz03beam10":{"by":["puz03i"],"table":{"0":[90,1,0]},"off":[99,0,0]},"puz03j":{"by":["puz03i"],"table":{"0":[7,1,0]},"off":[3,1,0]},"puz03beam11":{"by":["puz03i"],"table":{"0":[90,1,0]},"off":[99,0,0]}},"locks":[],"sting":"ajq_mirrorstinger","start":{"puz03start":[9,1,0],"puz03beam01":[99,0,0],"puz03a":[1,1,0],"puz03beam02":[99,0,0],"puz03b":[3,1,0],"puz03beam13":[99,0,0],"puz03f":[1,1,0],"puz03beam06":[99,0,0],"puz03e":[3,1,0],"puz03beam05":[99,0,0],"puz03d":[0,1,0],"puz03beam04":[99,0,0],"puz03c":[0,1,0],"puz03beam03":[99,0,0],"puz03beam07":[99,0,0],"puz03g":[3,1,0],"puz03beam08":[99,0,0],"puz03h":[1,1,0],"puz03beam09":[99,0,0],"puz03i":[1,1,0],"puz03beam10":[99,0,0],"puz03j":[3,1,0],"puz03beam11":[99,0,0],"puz03k":[3,1,0],"puz03end":[0,1,1],"puz03door":[0,1,1],"puz03frame":[0,1,1],"puz03beam12":[99,0,0],"puz03block":[0,1,1]},"lit0":{"puz03start":2,"puz03f":0,"puz03e":0,"puz03d":0,"puz03b":0,"puz03g":0,"puz03i":0,"puz03k":0}},{"name":"puz04","mirrors":{"trig04b":{"mirror":"puz04start2","init":1,"vc":[1,0],"turn":[{"a":"set","name":"trig04b","state":2,"visible":1,"click":1},{"a":"set","name":"trig04b","state":1,"visible":1,"click":1}],"first":[{"a":"show","name":"gear04sound2","click":0}],"lit":{"by":[],"table":{"":1}}},"trig04a":{"mirror":"puz04start1","init":2,"vc":[1,0],"turn":[{"a":"set","name":"trig04a","state":2,"visible":1,"click":1},{"a":"set","name":"trig04a","state":1,"visible":1,"click":1}],"first":[],"lit":{"by":["puz04start1"],"table":{"0":1,"1":1,"3":1}}}},"goals":[{"solved":{"puz04start2":0,"puz04start1":1},"done":[{"a":"set","name":"puz04beam04","state":60,"visible":1,"click":0},{"a":"set","name":"puz04c","state":6,"visible":1,"click":0},{"a":"set","name":"puz04beam05","state":280,"visible":1,"click":0},{"a":"set","name":"puz04d","state":4,"visible":1,"click":0},{"a":"show","name":"puz04beam06","click":0},{"a":"set","name":"puz04e","state":5,"visible":1,"click":0},{"a":"show","name":"puz04beam07","click":0},{"a":"set","name":"puz04f","state":6,"visible":1,"click":0},{"a":"set","name":"puz04beam08","state":300,"visible":1,"click":0},{"a":"set","name":"puz04g","state":7,"visible":1,"click":0},{"a":"set","name":"puz04beam09","state":150,"visible":1,"click":0},{"a":"set","name":"puz04h","state":4,"visible":1,"click":0},{"a":"set","name":"puz04beam10","state":50,"visible":1,"click":0},{"a":"set","name":"puz04i","state":6,"visible":1,"click":0},{"a":"show","name":"puz04end2","click":0},{"a":"set","name":"puz04frame_r","state":2,"visible":1,"click":0},{"a":"xp","amount":25,"name":"puz04done"},{"a":"show","name":"puz04door","click":0},{"a":"sound","sound":"ajq_gemdoor"},{"a":"set","name":"trig04a","state":99,"visible":0,"click":0},{"a":"set","name":"trig04b","state":99,"visible":0,"click":0},{"a":"wait","ms":1650},{"a":"set","name":"puz04block","state":99,"visible":0,"click":0}]}],"beams":{"puz04beam01":{"by":["puz04start1"],"table":{"1":[90,1,0]},"off":[99,0,0]},"puz04a":{"by":["puz04start1"],"table":{"1":[7,1,0]},"off":[3,1,0]},"puz04beam02":{"by":["puz04start1"],"table":{"1":[1,1,0]},"off":[99,0,0]},"puz04b":{"by":["puz04start1"],"table":{"1":[6,1,0]},"off":[2,1,0]},"puz04beam03":{"by":["puz04start1"],"table":{"1":[450,1,0]},"off":[99,0,0]},"puz04end1":{"by":["puz04start1"],"table":{"1":[1,1,0]},"off":[0,1,1]},"puz04frame_l":{"by":["puz04start1"],"table":{"1":[2,1,0]},"off":[0,1,1]}},"locks":[],"sting":"ajq_mirrorstinger","start":{"puz04start2":[9,1,0],"puz04start1":[2,1,0],"puz04beam01":[99,0,0],"puz04a":[3,1,0],"puz04beam02":[99,0,0],"puz04b":[2,1,0],"puz04beam03":[99,0,0],"puz04end1":[0,1,1],"puz04frame_l":[0,1,1],"puz04beam04":[99,0,0],"puz04c":[2,1,0],"puz04beam05":[99,0,0],"puz04d":[0,1,0],"puz04beam06":[99,0,0],"puz04e":[1,1,0],"puz04beam07":[99,0,0],"puz04f":[2,1,0],"puz04beam08":[99,0,0],"puz04g":[3,1,0],"puz04beam09":[99,0,0],"puz04h":[0,1,0],"puz04beam10":[99,0,0],"puz04i":[2,1,0],"puz04end2":[0,1,1],"puz04frame_r":[0,1,1],"puz04door":[0,1,1],"puz04block":[0,1,1]},"lit0":{"puz04start2":2,"puz04start1":0}}],"bosses":["boss_easy"]}
*/
