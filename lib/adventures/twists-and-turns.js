"use strict";

// Twists and Turns (adventure 13), a corn maze, one of the newer adventures:
// up to 20 at once, joined while it runs. written by hand from a recording
// of the official game (two runs), as the maze is laid out anew each time:
//  - three sections, each with one of three layouts (picked when the
//    adventure starts): the layout decides which paths are open, where that
//    section's key lies and which 25-gem pickups are out.
//  - a coloured chest per section (red 1, green 2, blue 3), opened with its
//    key for 250 gems; a gift chest per section, a choice of 2 den items; a
//    hidden chest, clothing.
//  - six hint signs in a shuffled order, two farmers, a secret area.
//  - a gate that needs four players at once (p_vol): what it does could not
//    be recorded alone; here, with four in its square, the gate opens to a
//    chest of 250 gems (a guess).

const ROOM = {room: "adventures.room_adventure_13a_2016", name: "Twists and Turns", nameStringId: 19743, music: "muscornmaze"};
const SECTIONS = [1, 2, 3];
const GEMS = 25; // each pickup along the paths
const CHEST_GEMS = 250;
// what a hint sign says, by the hint it shows (1-6)
const HINTS = [19766, 19784, 19785, 19786, 19787, 19788];
// the coloured chests: what each says without its key (green's was not recorded: a guess), the page it reaches
const CHESTS = {
  1: {line: 19799, uri: "/adventure13-twistsandturns/#50-redtreasure/#0#001"},
  2: {line: 19797, uri: "/adventure13-twistsandturns/#30-greentreasure/#0#001"},
  3: {line: 19796, uri: "/adventure13-twistsandturns/#20-bluetreasure/#0#001"},
};
// the gift chests: one den item for anyone, one for members, each picked
// for the run from the wiki's lists (animaljam.fandom.com/wiki/Twists_and_Turns)
// and what was recorded, and their pages. the recording had the wiki's
// first and second sections' prizes the other way about (Which Way Sign
// from the first chest, Cornstalk Lantern and Leaf Table from the second),
// and the Phantom Harvest Jack-o-Lantern as the members' one, so they are
// taken so here. 5932 and 5940 were recorded but are not in this server's
// item list as I have it, nor are some newer ones the wiki names (Autumn
// Harvest Wagon, Pile of Hay, Broken Fence, the pies, ...): left out.
const GIFTS = {
  1: {free: [1824, 1823, 3427, 5679, 5683, 5685, 5691], members: [5932, 1847, 2403, 3430, 5681, 5696, 5684, 5693],
    uri: "/adventure13-twistsandturns/#10-treasure1/#0#001"},
  2: {free: [2417, 1822, 3424, 5680, 5692, 5687, 5686, 5678], members: [1821, 1849, 3429, 5694, 5682],
    uri: "/adventure13-twistsandturns/#13-treasure2/#0#001"},
  3: {free: [5940, 1850, 1820, 3426, 5695], members: [5690, 1846, 1848, 3428, 5688, 5689],
    uri: "/adventure13-twistsandturns/#16-treasure3/#0#001"},
};
const pickOne = list => list[Math.floor(Math.random() * list.length)];
// the hidden chests: one of these, in any of its colours (the wiki's list;
// the recorded Old Hood is one): [item, "colours"]
const HIDDEN_CLOTHING = [
  [251, "1393885184,-2058223616,342425600,1394016256,1401094144,1399521280,1395130368,1402273792"], // Bat Glasses
  [127, "991181627,990198587,671115540,990919483,991312699,1002584891,990264123,992688955"], // Bunny Hat
  [153, "-2044067840,270794752,1400373248,-1615659008,86769664,1449721856,371851264,1396768768"], // Butterfly Wings
  [340, "359203135"], // Candy Cane Crown
  [339, "1764236799"], // Candy Cane Tiara
  [264, "405542916,392430853,352256040,134154031,-1922471638,-2090243689,23685397,-1016501861"], // Clover Blanket
  [265, "405165055,673600511,437277695,708465663,-702131201,1780901887,1764099714,1730570601"], // Dragon Mask
  [343, "1762985860,1763018179,1762985811,1695876884,1770129239,1771702021,1763247873,1711343445"], // Fancy Top Hat
  [303, "690694975,359229759,371927871,439036735,-1641338049,1762989375,1779832383,1409247551"], // Flower Necklace
  [439, "-16709881"], // Freedom Bunny Hat
  [209, "-985553"], // Freedom Hat
  [249, "-16646315,-9961643,-14090411,-16318635,-9699499,-8257707,-11075755,-3932331"], // Hat And Beard
  [259, "86805865,-2073400833,2648831,1393907199,115758441,379808105,1449748841,148334953"], // Hat And Curly Wig
  [258, "152932014,338165864,111909094,85531365,1466657129,-1873385111,1733612393,1397800"], // Heart Locket
  [161, "-732610560,-1620770816,539697152,1400382976,2040610816,-1008058368,-1092206592,1751728128"], // Horned Leg Pads
  [453, "1750401363,-1076657069,-1059841453,-1009317549,1097465683,-1901924013,-1127218093,11801683"], // Knight Helmet
  [420, "352272640,754926014,1811890553,369049996,788480448,402604291,486490562,16728330"], // Lollipop Necklace
  [158, "1680561707,1716802900,676402354,1733514061,739774231,1761678633,-340812861,-561113513"], // Mech Angel Wings
  [402, "1733514047,777192966,676528128,710088214,726860547,760420633,-1353507812,1767073639"], // Moon Necklace
  [58, "5580347,1395070247,1398085179,991131451,-1071179205,-2060774105,-1289284549,86442043"], // Necklace
  [140, "644092417,-1735695306,680213307,1728128807,85333127,392779150,374696386,-715827787"], // Old Hood
  [469, "359202816,342425600,90767360,1393885184,1768292352,-1016528896,1466499072,107544576"], // Round Glasses
  [216, "1398272575"], // Scary Horns
  [253, "671088640,1761607680,721420288,1392508928,-2113929216,-2130706432,2013265920,-1929379840"], // Spiked Hair
  [60, "-2036622357,674970388,121510715,-1736112282,638799655,1646733115,379822741,424693889"], // Star Cape
  [165, "-162056960,-217765120,-266927872,674960384,1398030336,-1681632000,1332480,282421504"], // Tie
  [244, "-251565525,-16704527,671164927,536946219,-1425970901,-1778263765,2097244715,1761699883"], // Turkey Hat
  [245, "-268160502,-166198011,671417605,459670789,340879717,-1943391734,-259837430,6894090"], // Wreath Necklace
];
const GATE_PLAYERS = 4;

const ACTORS = [
    ["advcompress", 7, 0, 0, 1, 1, "", ""],
    ["advtype2", 7, 0, 0, 1, 1, "", ""],
    ["queststart", 18, 0, 0, 1, 1, "", ""],
    ["questready", 7, 0, 0, 1, 1, "", ""],
    ["setup", 8, 0, 0, 0, 1, "", ""],
    ["_1option", 7, 0, 0, 0, 1, "", ""],
    ["_2option", 7, 0, 0, 0, 1, "", ""],
    ["_3option", 7, 0, 0, 0, 1, "", ""],
    ["_s_1gem1a", 1, 44, 0, 0, 1, "", ""],
    ["_s_1gem1b", 1, 44, 0, 0, 1, "", ""],
    ["_s_1gem1c", 1, 44, 0, 0, 1, "", ""],
    ["_s_1gem2a", 1, 44, 0, 0, 1, "", ""],
    ["_s_1gem2b", 1, 44, 0, 0, 1, "", ""],
    ["_s_1gem2c", 1, 44, 0, 0, 1, "", ""],
    ["_s_1gem3a", 1, 44, 0, 0, 1, "", ""],
    ["_s_1gem3b", 1, 44, 0, 0, 1, "", ""],
    ["_s_1gem3c", 1, 44, 0, 0, 1, "", ""],
    ["_s_2gem123a", 1, 44, 0, 0, 1, "", ""],
    ["_s_2gem1b", 1, 44, 0, 0, 1, "", ""],
    ["_s_2gem1c", 1, 44, 0, 0, 1, "", ""],
    ["_s_2gem2b", 1, 44, 0, 0, 1, "", ""],
    ["_s_2gem2c", 1, 44, 0, 0, 1, "", ""],
    ["_s_2gem3b", 1, 44, 0, 0, 1, "", ""],
    ["_s_2gem3c", 1, 44, 0, 0, 1, "", ""],
    ["_s_3gem1c", 1, 44, 0, 0, 1, "", ""],
    ["_s_3gem2a", 1, 44, 0, 0, 1, "", ""],
    ["_s_3gem2b", 1, 44, 0, 0, 1, "", ""],
    ["_s_3gem2c", 1, 44, 0, 0, 1, "", ""],
    ["_s_3gem3c", 1, 44, 0, 0, 1, "", ""],
    ["_s_3gem3d", 1, 44, 0, 0, 1, "", ""],
    ["_s_3gem13a", 1, 44, 0, 0, 1, "", ""],
    ["_s_3gem13b", 1, 44, 0, 0, 1, "", ""],
    ["_s_3gem12d", 1, 44, 0, 0, 1, "", ""],
    ["exit_vol", 3, 0, 0, 1, 1, "", ""],
    ["1tile1", 2, 0, 0, 1, 1, "", ""],
    ["1tile12", 2, 0, 0, 1, 1, "", ""],
    ["1tile13", 2, 0, 0, 1, 1, "", ""],
    ["1tile2", 2, 0, 0, 1, 1, "", ""],
    ["1tile23", 2, 0, 0, 1, 1, "", ""],
    ["1tile3", 2, 0, 0, 1, 1, "", ""],
    ["2tile1", 2, 0, 0, 1, 1, "", ""],
    ["2tile12", 2, 0, 0, 1, 1, "", ""],
    ["2tile13", 2, 0, 0, 1, 1, "", ""],
    ["2tile2", 2, 0, 0, 1, 1, "", ""],
    ["2tile23", 2, 0, 0, 1, 1, "", ""],
    ["2tile3", 2, 0, 0, 1, 1, "", ""],
    ["3tile1", 2, 0, 0, 1, 1, "", ""],
    ["3tile12", 2, 0, 0, 1, 1, "", ""],
    ["3tile13", 2, 0, 0, 1, 1, "", ""],
    ["3tile2", 2, 0, 0, 1, 1, "", ""],
    ["3tile23", 2, 0, 0, 1, 1, "", ""],
    ["3tile3", 2, 0, 0, 1, 1, "", ""],
    ["exit_portal", 2, 0, 0, 1, 1, "", ""],
    ["1block1", 5, 0, 0, 1, 1, "", ""],
    ["1block12", 5, 0, 0, 1, 1, "", ""],
    ["1block13", 5, 0, 0, 1, 1, "", ""],
    ["1block2", 5, 0, 0, 1, 1, "", ""],
    ["1block23", 5, 0, 0, 1, 1, "", ""],
    ["1block3", 5, 0, 0, 1, 1, "", ""],
    ["2block1", 5, 0, 0, 1, 1, "", ""],
    ["2block12", 5, 0, 0, 1, 1, "", ""],
    ["2block13", 5, 0, 0, 1, 1, "", ""],
    ["2block2", 5, 0, 0, 1, 1, "", ""],
    ["2block23", 5, 0, 0, 1, 1, "", ""],
    ["2block3", 5, 0, 0, 1, 1, "", ""],
    ["3block1", 5, 0, 0, 1, 1, "", ""],
    ["3block12", 5, 0, 0, 1, 1, "", ""],
    ["3block13", 5, 0, 0, 1, 1, "", ""],
    ["3block2", 5, 0, 0, 1, 1, "", ""],
    ["3block23", 5, 0, 0, 1, 1, "", ""],
    ["3block3", 5, 0, 0, 1, 1, "", ""],
    ["chances", 7, 0, 0, 1, 1, "", ""],
    ["keychance", 7, 0, 0, 1, 1, "", ""],
    ["1treasure", 13, 263, 0, 1, 1, "", ""],
    ["2treasure", 13, 261, 0, 1, 1, "", ""],
    ["3treasure1", 13, 260, 0, 0, 1, "", ""],
    ["3treasure2", 13, 260, 0, 0, 1, "", ""],
    ["3treasure3", 13, 260, 0, 0, 1, "", ""],
    ["1key1", 17, 3629, 0, 0, 1, "", ""],
    ["1key2", 17, 3629, 0, 0, 1, "", ""],
    ["1key3", 17, 3629, 0, 0, 1, "", ""],
    ["2key", 17, 3632, 0, 1, 1, "", ""],
    ["3key1", 17, 3630, 0, 0, 1, "", ""],
    ["3key2", 17, 3630, 0, 0, 1, "", ""],
    ["3key3", 17, 3630, 0, 0, 1, "", ""],
    ["1treasure_g", 13, 382, 0, 1, 1, "", ""],
    ["2treasure_g", 13, 382, 0, 1, 1, "", ""],
    ["3treasure_g", 13, 382, 0, 1, 1, "", ""],
    ["1treasure_h", 13, 39, 0, 1, 1, "", ""],
    ["2treasure_h", 13, 39, 0, 1, 1, "", ""],
    ["3treasure_h", 13, 39, 0, 1, 1, "", ""],
    ["p_treasure1", 13, 39, 0, 1, 1, "", ""],
    ["p_trigger", 1, 66, 0, 1, 1, "", ""],
    ["p_timer", 8, 0, 0, 0, 1, "", ""],
    ["p_vol", 24, 1, 0, 0, 1, "", ""],
    ["p_invol", 7, 0, 0, 1, 1, "", ""],
    ["p_pad", 2, 0, 0, 1, 1, "", ""],
    ["p_door", 2, 0, 0, 1, 1, "", ""],
    ["p_block", 5, 0, 0, 1, 1, "", ""],
    ["info1", 1, 44, 0, 0, 1, "", ""],
    ["info2", 1, 44, 0, 0, 1, "", ""],
    ["info3", 1, 44, 0, 0, 1, "", ""],
    ["info4", 1, 44, 0, 0, 1, "", ""],
    ["info5", 1, 44, 0, 0, 1, "", ""],
    ["info6", 1, 44, 0, 0, 1, "", ""],
    ["secreatarea", 3, 0, 0, 1, 1, "", ""],
    ["rndinfo", 7, 0, 0, 1, 1, "", ""],
    ["npc1a", 1, 380, 0, 0, 1, "", ""],
    ["npc1b", 1, 381, 0, 0, 1, "", ""],
    ["npc2a", 1, 381, 0, 0, 1, "", ""],
    ["npc2b", 1, 380, 0, 0, 1, "", ""],
    ["npcvol1", 24, 1, 0, 1, 1, "", ""],
    ["npcvol2", 24, 1, 0, 1, 1, "", ""],
    ["diff_level", 7, 0, 0, 1, 1, "", ""],
    ["live_players", 7, 0, 1, 0, 1, "", ""],
    ["playermember", 7, 0, 0, 1, 1, "", ""]
];
const NAMES = ACTORS.map(row => row[0]);
const set = (q, name, state, visible, click) => q.send("qcmd", 1, name, state, visible, click);
const maze = q => (q.vars.tt = q.vars.tt || {layout: {}, shift: 0, npc: "a", started: false, drops: new Set(), gate: new Set(), gateOpen: false,
  gifts: {}, hidden: {}});
// what a gift chest holds this run, the same for everyone: [kind, item, colour] each
const giftsOf = (q, section) => {
  const m = maze(q);
  m.gifts[section] = m.gifts[section] || [[1, pickOne(GIFTS[section].free), 0], [1, pickOne(GIFTS[section].members), 0]];
  return m.gifts[section];
};
// ... and a hidden chest: [item, colour]
const hiddenOf = (q, name) => {
  const m = maze(q);
  if (!m.hidden[name]) {
    const [item, colours] = pickOne(HIDDEN_CLOTHING);
    m.hidden[name] = [item, Number(pickOne(colours.split(",")))];
  }
  return m.hidden[name];
};

// one section laid out: its paths, its key (and blue chest), its gems
const layOut = (q, section, option) => {
  q.send("qcmdVT", 1, `_${section}option`, option, 0, 0);
  for (const piece of ["1", "12", "13", "2", "23", "3"].filter(digits => digits.includes(String(option)))) {
    set(q, `${section}tile${piece}`, 1, 0, 0);
    set(q, `${section}block${piece}`, 1, 0, 0);
  }
  if (section === 1) {
    set(q, `1key${option}`, 1, 1, 1);
  }
  if (section === 3) {
    set(q, `3treasure${option}`, 1, 1, 1);
    set(q, `3key${option}`, 1, 1, 1);
  }
  for (const gem of NAMES.filter(name => new RegExp(`^_s_${section}gem(\\d+)[a-z]$`).test(name))) {
    if (gem.match(/gem(\d+)/)[1].includes(String(option))) {
      set(q, gem, 1, 1, 1);
      q.send("qspn", gem, `${gem}__give_gem`, 200, 42, 3, GEMS, 0, 0, 0);
      set(q, gem, 99, 0, 0);
      maze(q).drops.add(`${gem}__give_gem`);
    }
  }
};

const KEY_FOR = {1: /^1key\d$/, 2: /^2key$/, 3: /^3key\d$/};

module.exports = {
  defId: 62,
  title: "Twists and Turns",
  rooms: {start: ROOM},
  written: "2020-10-19 21:40:29",
  objective: 24034,
  public: true, // joined while it runs, by up to 20
  maxPlayers: 20,
  actors: ACTORS,
  // "!adv" commands of its own, for testing (staff)
  debug: {
    help: "group (the gate that wants four opened)",
    group(q) {
      const m = maze(q);
      if (m.gateOpen) {
        return "The gate is open already.";
      }
      m.gateOpen = true;
      set(q, "p_pad", 1, 1, 0);
      set(q, "p_door", 1, 1, 0);
      set(q, "p_block", 1, 0, 0);
      set(q, "p_treasure1", 1, 1, 1);
      return "Gate open.";
    },
  },
  on: {
    loaded(q) {
      q.send("qsndpk", 3662);
    },
    trigger: {
      // each player, as their game is ready; the first lays the maze out
      questready(q) {
        const m = maze(q);
        q.tell("qposturi", "/adventure13-twistsandturns/#00-start/#0#001");
        if (m.started) {
          return;
        }
        m.started = true;
        m.npc = Math.random() < 0.5 ? "a" : "b";
        m.shift = Math.floor(Math.random() * HINTS.length);
        q.send("qcmdVT", 1, "setup", 1, 0, 0);
        set(q, `npc1${m.npc}`, 1, 1, 1);
        q.send("qswfs", `npc2${m.npc}`, "facesw");
        set(q, `npc2${m.npc}`, 1, 1, 1);
        q.after(330, () => {
          set(q, "p_pad", 2, 1, 0);
          set(q, "p_door", 2, 1, 0);
          for (let i = 1; i <= HINTS.length; i++) {
            set(q, `info${i}`, (i - 1 + m.shift) % HINTS.length + 1, 1, 1);
          }
        });
        SECTIONS.forEach((section, i) => q.after(330 + 1000 * i, () => {
          m.layout[section] = 1 + Math.floor(Math.random() * 3);
          layOut(q, section, m.layout[section]);
        }));
      },
      npcvol1(q) {
        q.after(1000, () => q.tell("qcmd", 2, `npc1${maze(q).npc}`, 24035, 1));
      },
      npcvol2(q) {
        q.after(1000, () => q.tell("qcmd", 2, `npc2${maze(q).npc}`, 24036, 1));
      },
      secreatarea(q) {
        q.tell("qsnd", "ajq_mussecretareast");
      },
      p_trigger(q) {
        q.tell("qcmd", 2, "p_trigger", 10772, 0);
      },
      // the gate: with enough in its square, it opens
      p_vol(q) {
        const m = maze(q);
        m.gate.add(q.me);
        const here = q.players().filter(id => m.gate.has(id)).length;
        if (!m.gateOpen && here >= GATE_PLAYERS) {
          m.gateOpen = true;
          set(q, "p_pad", 1, 1, 0);
          set(q, "p_door", 1, 1, 0);
          set(q, "p_block", 1, 0, 0);
          set(q, "p_treasure1", 1, 1, 1);
        }
      },
      p_treasure1(q) {
        q.tell("qatt", "p_treasure1", 3, CHEST_GEMS, 0, 1);
      },
      exit_vol(q) {
        q.tell("qcmd", 19);
      },
    },
    triggerLike: [
      [/__give_gem$/, (q, name) => {
        const m = maze(q);
        if (!m.drops.has(name)) {
          return;
        }
        m.drops.delete(name);
        q.send("qad", name, 0, "null");
        q.gems(GEMS);
      }],
      [/^info\d$/, (q, name) => {
        const m = maze(q);
        const i = Number(name.slice(4));
        q.tell("qcmd", 2, name, HINTS[(i - 1 + m.shift) % HINTS.length], 2);
      }],
      // a coloured chest: opened with its key, otherwise it shakes and says so
      [/^(1treasure|2treasure|3treasure\d)$/, (q, name) => {
        const section = Number(name[0]);
        const chest = CHESTS[section];
        if (KEY_FOR[section].test(q.held() || "")) {
          q.use();
          q.tell("qatt", name, 3, CHEST_GEMS, 0, 1);
          q.tell("qposturi", chest.uri);
          q.vars[`key ${q.me} ${section}`] = true;
          return;
        }
        q.tell("qcmd", 2, name, chest.line, 0);
        q.tell("qatt", name, 5, 0, 0, 1);
      }],
      // a gift chest: a choice of 2, once for each player
      [/^[123]treasure_g$/, (q, name) => {
        const gift = GIFTS[Number(name[0])];
        if (q.vars[`gift ${q.me} ${name}`]) {
          return;
        }
        q.vars[`gift ${q.me} ${name}`] = true;
        q.offerOwn(giftsOf(q, Number(name[0])));
        q.tell("qatt", name, 7);
        q.tell("qposturi", gift.uri);
        q.tell("qatt", name, 0);
      }],
      // a hidden chest: clothing
      [/^[123]treasure_h$/, (q, name) => {
        const [def, colour] = hiddenOf(q, name);
        q.tell("qatt", name, 2, def, colour, 1);
      }],
    ],
    untriggered: {
      p_vol(q) {
        maze(q).gate.delete(q.me);
      },
    },
    // a chest opened: what was in it, once for each player
    openedLike: [
      [/^(1treasure|2treasure|3treasure\d)$/, (q, name) => {
        const section = Number(name[0]);
        if (!q.vars[`key ${q.me} ${section}`] || q.vars[`opened ${q.me} ${section}`]) {
          return;
        }
        q.vars[`opened ${q.me} ${section}`] = true;
        q.gems(CHEST_GEMS);
        q.tell("qposturi", CHESTS[section].uri);
      }],
      [/^[123]treasure_h$/, (q, name) => {
        if (q.vars[`opened ${q.me} ${name}`]) {
          return;
        }
        q.vars[`opened ${q.me} ${name}`] = true;
        q.clothes(...hiddenOf(q, name));
      }],
      [/^p_treasure1$/, (q, name) => {
        if (q.vars[`opened ${q.me} ${name}`]) {
          return;
        }
        q.vars[`opened ${q.me} ${name}`] = true;
        q.gems(CHEST_GEMS);
      }],
    ],
  },
};
