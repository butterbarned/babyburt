"use strict";

// First Five Minutes (adventure 39), the new-player tutorial: Peck walks a
// new player through Jamaa. written by hand from a recording of the official
// game, step by step, as each step waits for one thing only (a click, a walk,
// a voice line played to its end). hidden: only "!tutorial" starts it; it is
// not played on signing up.
//
// Peck's lines are voiced: her game says when a line has played ("qat" of
// its vo actor), and that moves her on. a line whose voice does not load
// would hold her forever, so each moves on by itself a little after its
// recorded length as well (VO_LENGTH).

// how long each voice line played in the recording (ms): one that does not
// report back moves on this much later, plus VO_SLACK
const VO_LENGTH = {vo1a: 1500, vo1b: 2900, vo1c: 800, vo2a: 3800, vo2b: 2600, vo2c: 3600, vo3: 3500, vo4: 3500, vo5: 4100,
  vo5a: 1600, vo6b: 4500, vo7a: 2700, vo7b: 1400, vo7c: 5200, vo8: 2000, vo9: 2300, vo10a: 2500, vo10b: 1500, vo11a: 2600,
  vo11b: 6700, vo11c: 4700, vo12a: 2500, vo12b: 1600};
const VO_SLACK = 1500;
// what the crowd calls out after each thing done (as in the recording): after customizing
// ("You look amazing!"), after the emote (smileys), after the gems ("That's a lot of Gems!")
const CHEERS = {
  customized: [21218, 21219, 20144, 20147],
  emoted: [20132, 20133, 20143, 20144, 20145, 20146, 20147, 20153, 20154],
  gems: [21222, 21223, 21224, 21225, 21226, 20132, 20143, 20144, 20145, 20153],
};
const NPCS = 31;

const ACTORS = [
  ["questready", 7, 0, 0, 1, 1, "", ""],
  ["queststart", 18, 0, 0, 1, 1, "", ""],
  ["blockvol1", 5, 0, 0, 1, 1, "", ""],
  ["blockvol2", 5, 0, 0, 1, 1, "", ""],
  ["dialog1a", 8, 0, 0, 0, 1, "", ""],
  ["vo1a", 1, 44, 0, 1, 1, "", ""],
  ["dialog1b", 8, 0, 0, 0, 1, "", ""],
  ["vo1b", 1, 44, 0, 1, 1, "", ""],
  ["dialog1lp", 8, 0, 0, 0, 1, "", ""],
  ["vo1c", 1, 44, 0, 1, 1, "", ""],
  ["confetti1_t", 8, 0, 0, 0, 1, "", ""],
  ["confetti2_t", 8, 0, 0, 0, 1, "", ""],
  ["hoploop", 8, 0, 0, 0, 1, "", ""],
  ["dialog2a", 8, 0, 0, 0, 1, "", ""],
  ["vo2a", 1, 44, 0, 1, 1, "", ""],
  ["dialog2b", 8, 0, 0, 0, 1, "", ""],
  ["vo2b", 1, 44, 0, 1, 1, "", ""],
  ["dialog2lp", 8, 0, 0, 0, 1, "", ""],
  ["vo2c", 1, 44, 0, 1, 1, "", ""],
  ["dialog3", 8, 0, 0, 0, 1, "", ""],
  ["vo3", 1, 44, 0, 1, 1, "", ""],
  ["dialog3a", 8, 0, 0, 0, 1, "", ""],
  ["vo4", 1, 44, 0, 1, 1, "", ""],
  ["dialog3b", 8, 0, 0, 0, 1, "", ""],
  ["vo5", 1, 44, 0, 1, 1, "", ""],
  ["dialog3c", 8, 0, 0, 0, 1, "", ""],
  ["vo5a", 1, 44, 0, 1, 1, "", ""],
  ["dialog3d", 8, 0, 0, 0, 1, "", ""],
  ["cancontinue", 7, 0, 0, 1, 1, "", ""],
  ["dialog3lp", 8, 0, 0, 0, 1, "", ""],
  ["vo6b", 1, 44, 0, 1, 1, "", ""],
  ["dialog4", 8, 0, 0, 0, 1, "", ""],
  ["vo7a", 1, 44, 0, 1, 1, "", ""],
  ["dialog4aa", 8, 0, 0, 0, 1, "", ""],
  ["vo7b", 1, 44, 0, 1, 1, "", ""],
  ["dialog4lp", 8, 0, 0, 0, 1, "", ""],
  ["vo7c", 1, 44, 0, 1, 1, "", ""],
  ["dialog4a", 8, 0, 0, 0, 1, "", ""],
  ["vo8", 1, 44, 0, 1, 1, "", ""],
  ["click_here", 2, 0, 0, 0, 1, "", ""],
  ["dialog4alp", 8, 0, 0, 0, 1, "", ""],
  ["vo9", 1, 44, 0, 1, 1, "", ""],
  ["treasure1", 13, 39, 0, 0, 1, "", ""],
  ["dialog5", 8, 0, 0, 0, 1, "", ""],
  ["vo10a", 1, 44, 0, 1, 1, "", ""],
  ["dialog5lp", 8, 0, 0, 0, 1, "", ""],
  ["vo10b", 1, 44, 0, 1, 1, "", ""],
  ["dialog6", 8, 0, 0, 0, 1, "", ""],
  ["vo11a", 1, 44, 0, 1, 1, "", ""],
  ["dialog6a", 8, 0, 0, 0, 1, "", ""],
  ["vo11b", 1, 44, 0, 1, 1, "", ""],
  ["dialog6b", 8, 0, 0, 0, 1, "", ""],
  ["vo11c", 1, 44, 0, 1, 1, "", ""],
  ["dialog6c", 8, 0, 0, 0, 1, "", ""],
  ["vo12a", 1, 44, 0, 1, 1, "", ""],
  ["dialog6d", 8, 0, 0, 0, 1, "", ""],
  ["endlp", 8, 0, 0, 0, 1, "", ""],
  ["vo12b", 1, 44, 0, 1, 1, "", ""],
  ["exitvol", 3, 0, 0, 0, 1, "", ""],
  ["incenter", 7, 0, 0, 0, 1, "", ""],
  ["alpha", 1, 20, 0, 0, 1, "", ""],
  ["_shop_vol", 28, 0, 0, 0, 1, "", ""],
  ["go_here_vol", 3, 0, 0, 0, 1, "", ""],
  ["pathalpha1", 20, 0, 0, 1, 1, "", ""],
  ["pathalpha2", 20, 0, 0, 1, 1, "", ""],
  ["gui_ffm", 28, 0, 0, 1, 1, "", ""],
  ["gui_aved", 28, 0, 0, 1, 1, "", ""],
  ["gui_1", 28, 0, 0, 1, 1, "", ""],
  ["gui_2", 28, 0, 0, 1, 1, "", ""],
  ["gui_3", 28, 0, 0, 1, 1, "", ""],
  ["gui_4", 28, 0, 0, 1, 1, "", ""],
  ["gui_5", 28, 0, 0, 1, 1, "", ""],
  ["gui_6", 28, 0, 0, 1, 1, "", ""],
  ["gui_7", 28, 0, 0, 1, 1, "", ""],
  ["gui_8", 28, 0, 0, 1, 1, "", ""],
  ["gui_9", 28, 0, 0, 1, 1, "", ""],
  ["gui_10", 28, 0, 0, 1, 1, "", ""],
  ["gui_11", 28, 0, 0, 1, 1, "", ""],
  ["gui_12", 28, 0, 0, 1, 1, "", ""],
  ["emoted", 7, 0, 0, 0, 1, "", ""],
  ["gui_13", 28, 0, 0, 1, 1, "", ""],
  ["gui_14", 28, 0, 0, 1, 1, "", ""],
  ["gui_15", 28, 0, 0, 1, 1, "", ""],
  ["gui_16", 28, 0, 0, 1, 1, "", ""],
  ["gui_17", 28, 0, 0, 1, 1, "", ""],
  ["gui_18", 28, 0, 0, 1, 1, "", ""],
  ["gui_19", 28, 0, 0, 1, 1, "", ""],
  ["gui_20", 28, 0, 0, 1, 1, "", ""],
  ["gui_21", 28, 0, 0, 1, 1, "", ""],
  ["gui_22", 28, 0, 0, 1, 1, "", ""],
  ["gui_23", 28, 0, 0, 1, 1, "", ""],
  ["gui_24", 28, 0, 0, 1, 1, "", ""],
  ["gui_25", 28, 0, 0, 1, 1, "", ""],
  ["gui_26", 28, 0, 0, 1, 1, "", ""],
  ["gui_27", 28, 0, 0, 1, 1, "", ""],
  ["gui_28", 28, 0, 0, 1, 1, "", ""],
  ["gui_29", 28, 0, 0, 1, 1, "", ""],
  ["gui_30", 28, 0, 0, 1, 1, "", ""],
  ["gui_31", 28, 0, 0, 1, 1, "", ""],
  ["gui_32", 28, 0, 0, 1, 1, "", ""],
  ["gui_33", 28, 0, 0, 1, 1, "", ""],
  ["gui_34", 28, 0, 0, 1, 1, "", ""],
  ["gui_35", 28, 0, 0, 1, 1, "", ""],
  ["gui_36", 28, 0, 0, 1, 1, "", ""],
  ["gui_37", 28, 0, 0, 1, 1, "", ""],
  ["gui_38", 28, 0, 0, 1, 1, "", ""],
  ["gui_39", 28, 0, 0, 1, 1, "", ""],
  ["gui_40", 28, 0, 0, 1, 1, "", ""],
  ["gui_41", 28, 0, 0, 1, 1, "", ""],
  ["gui_42", 28, 0, 0, 1, 1, "", ""],
  ["gui_43", 28, 0, 0, 1, 1, "", ""],
  ["gui_44", 28, 0, 0, 1, 1, "", ""],
  ["gui_45", 28, 0, 0, 1, 1, "", ""],
  ["gui_46", 28, 0, 0, 1, 1, "", ""],
  ["gui_47", 28, 0, 0, 1, 1, "", ""],
  ["gui_48", 28, 0, 0, 1, 1, "", ""],
  ["shop_once", 7, 0, 0, 1, 1, "", ""],
  ["chatindex", 7, 0, 0, 1, 1, "", ""],
  ["iconindex", 7, 0, 0, 1, 1, "", ""],
  ["npc1", 1, 273, 0, 1, 1, "", "facesw"],
  ["npc2", 1, 274, 0, 1, 1, "", "facesw"],
  ["npc3", 1, 275, 0, 1, 1, "", "facesw"],
  ["npc4", 1, 276, 0, 1, 1, "", "facesw"],
  ["npc5", 1, 277, 0, 1, 1, "", "facesw"],
  ["npc6", 1, 278, 0, 1, 1, "", "facesw"],
  ["npc7", 1, 279, 0, 1, 1, "", "facesw"],
  ["npc8", 1, 280, 0, 1, 1, "", "facesw"],
  ["npc9", 1, 281, 0, 1, 1, "", "facesw"],
  ["npc10", 1, 282, 0, 1, 1, "", "facesw"],
  ["npc11", 1, 283, 0, 1, 1, "", "facesw"],
  ["npc12", 1, 284, 0, 1, 1, "", "facesw"],
  ["npc13", 1, 285, 0, 1, 1, "", "facesw"],
  ["npc14", 1, 286, 0, 1, 1, "", "facesw"],
  ["npc15", 1, 287, 0, 1, 1, "", "facesw"],
  ["npc16", 1, 288, 0, 1, 1, "", "facesw"],
  ["npc17", 1, 289, 0, 1, 1, "", "facesw"],
  ["npc18", 1, 290, 0, 1, 1, "", "facesw"],
  ["npc19", 1, 291, 0, 1, 1, "", "facesw"],
  ["npc20", 1, 292, 0, 1, 1, "", "facesw"],
  ["npc21", 1, 293, 0, 1, 1, "", "facesw"],
  ["npc22", 1, 294, 0, 1, 1, "", "facesw"],
  ["npc23", 1, 295, 0, 1, 1, "", "facesw"],
  ["npc24", 1, 296, 0, 1, 1, "", "facesw"],
  ["npc25", 1, 297, 0, 1, 1, "", "facesw"],
  ["npc26", 1, 298, 0, 1, 1, "", "facesw"],
  ["npc27", 1, 299, 0, 1, 1, "", "facesw"],
  ["npc28", 1, 300, 0, 1, 1, "", "facesw"],
  ["npc29", 1, 301, 0, 1, 1, "", "facesw"],
  ["npc30", 1, 302, 0, 1, 1, "", "facesw"],
  ["npc31", 1, 303, 0, 1, 1, "", "facesw"],
  ["byalphar", 3, 0, 0, 0, 1, "", ""],
  ["byalphal", 3, 0, 0, 0, 1, "", ""],
  ["bynpc1l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc2l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc3l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc4l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc5l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc6l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc7l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc8l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc9l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc10l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc11l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc12l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc13l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc14l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc15l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc16l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc17l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc18l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc19l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc20l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc21l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc22l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc23l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc24l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc25l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc26l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc27l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc28l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc29l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc30l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc31l", 3, 0, 0, 1, 1, "", ""],
  ["bynpc1r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc2r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc3r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc4r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc5r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc6r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc7r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc8r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc9r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc10r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc11r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc12r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc13r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc14r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc15r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc16r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc17r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc18r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc19r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc20r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc21r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc22r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc23r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc24r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc25r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc26r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc27r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc28r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc29r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc30r", 3, 0, 0, 1, 1, "", ""],
  ["bynpc31r", 3, 0, 0, 1, 1, "", ""],
  ["npcrnd", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd1", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd2", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd3", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd4", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd5", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd6", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd8", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd10", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd11", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd12", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd13", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd14", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd15", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd16", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd17", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd18", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd19", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd20", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd21", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd23", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd25", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd27", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd28", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd7", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd9", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd22", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd24", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd26", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd29", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd30", 7, 0, 0, 1, 1, "", ""],
  ["npcrnd31", 7, 0, 0, 1, 1, "", ""],
  ["npcseq1a_27", 3, 0, 0, 1, 1, "", ""],
  ["npcseq1b_1", 3, 0, 0, 1, 1, "", ""],
  ["npcseq1d_10", 3, 0, 0, 1, 1, "", ""],
  ["npcseq1e_2", 3, 0, 0, 1, 1, "", ""],
  ["npcseq1f_3", 3, 0, 0, 1, 1, "", ""],
  ["npcseq1h_8", 3, 0, 0, 1, 1, "", ""],
  ["npcseq1i_7", 3, 0, 0, 1, 1, "", ""],
  ["npcseq1j_29", 3, 0, 0, 1, 1, "", ""],
  ["vinedoor", 2, 0, 0, 1, 1, "", ""],
  ["peckftpath1", 2, 0, 0, 0, 1, "", ""],
  ["peckftpath2", 2, 0, 0, 0, 1, "", ""],
  ["confetti1", 2, 0, 0, 0, 1, "", ""],
  ["confetti1a", 2, 0, 0, 0, 1, "", ""],
  ["confetti1b", 2, 0, 0, 0, 1, "", ""],
  ["confetti2", 2, 0, 0, 0, 1, "", ""],
  ["confetti2a", 2, 0, 0, 0, 1, "", ""],
  ["confetti2b", 2, 0, 0, 0, 1, "", ""],
  ["diff_level", 7, 0, 0, 1, 1, "", ""],
  ["live_players", 7, 0, 1, 0, 1, "", ""],
  ["playermember", 7, 0, 0, 1, 1, "", ""]
];

// the walkers along Peck's path: stepping by one has it do its thing, once
// (its state, a line or a move); bynpc<N>l / r has npc<N> turn to look
const SEQ = {"npcseq1a_27":[["qcmd","1","npc27","7","1","1"],
    ["qcmd","2","npc27","21247","1"]],"npcseq1b_1":[["qswfs","npc1","hop"],
    ["qcmd","1","npc1","7","1","0"]],"npcseq1d_10":[["qswfs","npc10","dance"],
    ["qcmd","1","npc10","7","1","0"]],"npcseq1e_2":[["qcmd","1","npc2","7","1","1"],
    ["qcmd","2","npc2","20145","1"]],"npcseq1f_3":[["qcmd","1","npc3","7","1","1"],
    ["qcmd","2","npc3","20146","1"]],"npcseq1h_8":[["qcmd","1","npc8","7","1","1"],
    ["qcmd","2","npc8","21248","1"]],"npcseq1i_7":[["qswfs","npc7","facesw_k"],
    ["qcmd","1","npc7","2","1","0"],
    ["qcmd","1","npc7","7","1","1"],
    ["qcmd","2","npc7","20133","1"]],"npcseq1j_29":[["qcmd","1","npc29","7","1","1"],
    ["qcmd","2","npc29","20154","1"]]};

const set = (q, name, state, visible, click) => q.send("qcmd", 1, name, state, visible, click);
const uri = (q, page) => q.send("qposturi", `/newffm/#${page}/#0#001`);
const ffm = q => (q.vars.ffm = q.vars.ffm || {phase: "start", waiting: {}, seq: new Set(), confetti: false, can: 0});
const idle = q => {
  q.send("qswfs", "alpha", "idle");
  set(q, "alpha", 2, 1, 1);
};
const face = (q, left) => {
  q.send("qswfs", "alpha", left ? "facesw_k" : "facese_k");
  set(q, "alpha", left ? 20 : 21, 1, 1);
  set(q, "alpha", 1, 1, 0);
};
// a voice line on its own (the customize window's), and what follows it
const voice = (q, vo, sound, next) => {
  const f = ffm(q);
  q.send("qsndVO", sound, vo);
  set(q, vo, 1, 1, 1);
  f.waiting[vo] = next || null;
  q.after((VO_LENGTH[vo] || 4000) + VO_SLACK, () => played(q, vo));
};
// Peck says a line (her pose for it, the words, the voice)
const say = (q, vo, sound, state, line, next) => {
  q.send("qswfs", "alpha", "talking");
  set(q, "alpha", state, 1, 1);
  q.send("qcmd", 2, "alpha", line, 1);
  set(q, "alpha", 1, 1, 0);
  voice(q, vo, sound, next);
};
// a voice line played to its end (or given up on): once
const played = (q, vo) => {
  const f = ffm(q);
  if (!(vo in f.waiting)) {
    return;
  }
  const next = f.waiting[vo];
  delete f.waiting[vo];
  if (next) {
    next();
  }
};
const at = (q, phase) => ffm(q).phase === phase;
const COLOR_TAB_WAIT = 70; // the eyes follow the colour tab line straight away (second recording: 70 ms, no click)
const go = (q, phase) => {
  ffm(q).phase = phase;
};
// a cheer goes round the crowd: one walker after another, a second apart
const cheer = (q, count, lines) => {
  for (let i = 0; i < count; i++) {
    q.after(1000 * (i + 1), () => q.send("qcmd", 2, `npc${1 + Math.floor(Math.random() * NPCS)}`,
      lines[Math.floor(Math.random() * lines.length)], 1));
  }
};
// the confetti over the path: three pictures each side, one after another every second
const confetti = q => {
  const f = ffm(q);
  if (f.confetti) {
    return;
  }
  f.confetti = true;
  q.send("qcmdVT", 1, "confetti1_t", 1, 0, 0);
  let tick = 0;
  const loop = () => {
    if (!f.confetti) {
      return;
    }
    for (const [side, from] of [["1", 0], ["2", 1]]) {
      const frames = [`confetti${side}`, `confetti${side}a`, `confetti${side}b`];
      const k = tick - from;
      if (k >= 0) {
        set(q, frames[k % 3], 1, 1, 0);
        if (k >= 2) {
          set(q, frames[(k + 1) % 3], 0, 0, 0);
        }
      }
    }
    tick++;
    q.after(1000, loop);
  };
  loop();
};
const confettiOff = q => {
  ffm(q).confetti = false;
  for (const frame of ["confetti1", "confetti1a", "confetti1b", "confetti2", "confetti2a", "confetti2b"]) {
    set(q, frame, 0, 0, 0);
  }
};
// while waiting for something, Peck says so again now and then
const nag = (q, phase, first, every, act) => {
  const again = delay => q.after(delay, () => {
    if (at(q, phase)) {
      act();
      again(every);
    }
  });
  again(first);
};

// the customize window: the colour tab, the eyes, the pattern, then free to change things
const eyes = q => {
  go(q, "eyes");
  q.send("qcmdVT", 1, "dialog3a", 1, 0, 0);
  uri(q, "60-customizeeyetab");
  set(q, "gui_32", 2, 1, 0);
  set(q, "gui_41", 1, 1, 0);
  set(q, "gui_42", 1, 1, 1);
  set(q, "gui_43", 1, 1, 1);
  set(q, "gui_31", 0, 1, 0);
  set(q, "gui_44", 2, 1, 0);
  set(q, "vo3", 99, 0, 0);
  voice(q, "vo4", "short_04", () => pattern(q));
};
const pattern = q => {
  if (!at(q, "eyes")) {
    return; // (the window was closed early)
  }
  go(q, "pattern");
  q.send("qcmdVT", 1, "dialog3b", 1, 0, 0);
  uri(q, "70-customizepatterntab");
  set(q, "gui_33", 2, 1, 0);
  set(q, "gui_40", 1, 1, 1);
  set(q, "gui_32", 0, 1, 0);
  set(q, "gui_44", 3, 0, 0);
  set(q, "vo4", 99, 0, 0);
  voice(q, "vo5", "short_05", () => freeToChange(q));
};
const freeToChange = q => {
  if (!at(q, "pattern")) {
    return;
  }
  go(q, "free");
  set(q, "vo5", 99, 0, 0);
  uri(q, "80-playercancustomize");
  set(q, "gui_44", 4, 0, 0);
  for (const [name, state, click] of [["gui_32", 1, 0], ["gui_24", 1, 1], ["gui_31", 1, 0], ["gui_23", 1, 1], ["gui_25", 1, 1], ["gui_33", 1, 0], ["gui_31", 2, 0], ["gui_31", 1, 0]]) {
    set(q, name, state, 1, click);
  }
  voice(q, "vo5a", "standard_09", () => canContinue(q));
};
// once Peck's line is done the X lights (changing things meanwhile is up to the player)
const canContinue = q => {
  if (!at(q, "free")) {
    return;
  }
  go(q, "close");
  set(q, "vo5a", 99, 0, 0);
  q.send("qcmdVT", 1, "cancontinue", 1, 0, 0);
  q.after(200, () => {
    q.send("qcmdVT", 1, "cancontinue", 2, 0, 0);
    set(q, "gui_44", 0, 1, 0);
  });
  q.after(350, () => {
    set(q, "gui_44", 5, 0, 0);
    voice(q, "vo6b", "standard_10");
    uri(q, "90-customizexbuttonactive");
    set(q, "gui_26", 2, 1, 1);
  });
};

module.exports = {
  defId: 39,
  title: "First Five Minutes (tutorial)",
  // not in the adventure list, and not played on signing up: only "!tutorial" starts it
  hidden: true,
  exitType: "ffm", // on leaving, "qxt ffm": the game's end of its tutorial
  rooms: {start: {room: "first_five.room_firstfive", name: "Jamaa", nameStringId: 0, music: "aj_musnpeintro"}},
  written: "2018-02-07 20:08:14",
  objective: 0,
  actors: ACTORS,
  on: {
    loaded(q) {
      q.send("qsndpk", 3752);
      set(q, "gui_18", 1, 1, 0);
      q.send("qsndpk", 3753);
      uri(q, "00-start");
    },
    trigger: {
      // Peck appears, and says hello
      questready(q) {
        if (!at(q, "start")) {
          return;
        }
        go(q, "hello");
        q.send("qcmdVT", 1, "questready", 99, 0, 0);
        q.after(220, () => {
          q.send("qswfs", "alpha", "facesw_k");
          q.send("qswfs", "alpha", "appear");
          set(q, "alpha", 3, 1, 1);
          set(q, "alpha", 1, 1, 0);
          uri(q, "10-peckappears");
        });
        q.after(3220, () => {
          q.send("qicon", "alpha", 1);
          say(q, "vo1a", "short_01a", 4, 21279, () => {
            idle(q);
            q.send("qcmdVT", 1, "dialog1b", 1, 0, 0);
            set(q, "vo1a", 99, 0, 0);
            say(q, "vo1b", "short_01b", 5, 21280, () => {
              idle(q);
              q.send("qcmdVT", 1, "dialog1lp", 1, 0, 0);
              set(q, "vo1b", 99, 0, 0);
              say(q, "vo1c", "short_01c", 6, 21281, () => {
                // off down the path; the walkers react as the player follows
                go(q, "walk1");
                uri(q, "20-peckstartspath");
                set(q, "blockvol1", 99, 0, 0);
                q.send("qsp", "alpha", "pathalpha1");
                q.send("qswfs", "alpha", "facese_k");
                q.send("qswfs", "alpha", "walking");
                set(q, "alpha", 7, 1, 0);
                set(q, "peckftpath1", 1, 1, 0);
                set(q, "vo1c", 99, 0, 0);
              });
            });
          });
        });
      },
      // the swirl: Peck's talk in the middle of town
      go_here_vol(q) {
        if (!at(q, "gohere")) {
          return;
        }
        go(q, "center");
        set(q, "byalphar", 1, 1, 1);
        set(q, "byalphal", 1, 1, 1);
        set(q, "blockvol1", 0, 1, 0);
        set(q, "peckftpath1", 0, 0, 0);
        set(q, "go_here_vol", 99, 0, 0);
        uri(q, "30-meetspeckincenter");
        say(q, "vo2a", "short_02a", 8, 21282, () => {
          idle(q);
          q.send("qcmdVT", 1, "dialog2b", 1, 0, 0);
          say(q, "vo2b", "short_02b", 9, 21283, () => {
            // the animal picture lights up; she reminds the player while they wait
            go(q, "picture");
            uri(q, "40-customizebuttonhighlighted");
            set(q, "gui_10", 2, 1, 1);
            idle(q);
            set(q, "vo2b", 99, 0, 0);
            let times = 0;
            nag(q, "picture", 4400, 15000, () => {
              q.send("qcmdVT", 1, "dialog2lp", ++times, 0, 0);
              say(q, "vo2c", "standard_04", 91, 27974, () => {
                idle(q);
                set(q, "vo2c", 99, 0, 0);
              });
            });
          });
        });
      },
      byalphal(q) {
        face(q, true);
      },
      byalphar(q) {
        face(q, false);
      },
      // the animal picture clicked, and the customize window open
      gui_10(q) {
        if (at(q, "picture")) {
          go(q, "editor");
          idle(q);
          set(q, "gui_10", 0, 1, 0);
        }
      },
      gui_aved(q) {
        if (!at(q, "editor") && !at(q, "picture")) {
          return;
        }
        go(q, "colortab");
        uri(q, "50-customizecolortab");
        set(q, "gui_31", 2, 1, 0);
        set(q, "gui_38", 1, 1, 1);
        set(q, "gui_39", 1, 1, 1);
        set(q, "gui_44", 1, 1, 0);
        // on to the eyes when the colour tab reports in (gui_31), or, as the recording paced it,
        // shortly after Peck's line ends: nothing here needs a click
        voice(q, "vo3", "short_03", () => q.after(COLOR_TAB_WAIT, () => {
          if (at(q, "colortab")) {
            eyes(q);
          }
        }));
      },
      gui_31(q) {
        if (at(q, "colortab")) {
          eyes(q);
        }
      },
      // the customize buttons: nothing to do (the player changing their look)
      gui_23() {},
      gui_24() {},
      gui_25() {},
      // the X: the window closed, an award, and on to emotes
      // (at any point once the window is open: closing it early does not hold things up)
      gui_26(q) {
        if (!["colortab", "eyes", "pattern", "free", "close"].includes(ffm(q).phase)) {
          return;
        }
        go(q, "talk7");
        q.send("qcmdVT", 1, "dialog4", 1, 0, 0);
        uri(q, "100-customizeclosedawardgiven");
        q.send("qaward", 78, 1);
        set(q, "gui_26", 0, 1, 0);
        cheer(q, 5, CHEERS.customized);
        q.after(1300, () => set(q, "vo6b", 99, 0, 0));
        q.after(2550, () => say(q, "vo7a", "short_07a", 10, 21289, () => {
          idle(q);
          q.send("qcmdVT", 1, "dialog4aa", 1, 0, 0);
          set(q, "vo7a", 99, 0, 0);
          say(q, "vo7b", "short_07b", 11, 21290, () => {
            go(q, "emote");
            uri(q, "110-emoticonactive");
            set(q, "gui_13", 2, 1, 1);
            idle(q);
            set(q, "vo7b", 99, 0, 0);
          });
        }));
      },
      // the emote button: once opens the menu (Peck says to pick one if it
      // takes a while), again is an emote picked
      gui_13(q) {
        if (at(q, "emote")) {
          go(q, "emoteMenu");
          nag(q, "emoteMenu", 4200, 15000, () => {
            q.send("qcmdVT", 1, "emoted", 1, 0, 0);
            say(q, "vo7c", "standard_14", 111, 27977, () => {
              idle(q);
              set(q, "vo7c", 99, 0, 0);
            });
          });
          return;
        }
        if (!at(q, "emoteMenu")) {
          return;
        }
        go(q, "talk8");
        q.send("qcmdVT", 1, "emoted", 2, 0, 0);
        q.send("qcmdVT", 1, "dialog4a", 1, 0, 0);
        uri(q, "120-emoticonfinished");
        say(q, "vo8", "short_08", 12, 21291, () => {
          // a chest of gems appears
          go(q, "treasure");
          idle(q);
          q.send("qcmdVT", 1, "dialog4alp", 1, 0, 0);
          uri(q, "130-treasureappears");
          q.send("qswfs", "treasure1", "appear");
          set(q, "treasure1", 1, 1, 1);
          set(q, "vo8", 99, 0, 0);
          const point = () => {
            say(q, "vo9", "short_09", 13, 21292, () => {
              idle(q);
              set(q, "vo9", 99, 0, 0);
            });
            set(q, "click_here", 1, 1, 0);
          };
          q.after(130, point);
          let times = 1;
          nag(q, "treasure", 20000, 20000, () => {
            q.send("qcmdVT", 1, "dialog4alp", ++times, 0, 0);
            set(q, "vo9", 0, 1, 1);
            point();
          });
        });
        set(q, "gui_13", 0, 1, 0);
        q.send("qcmdVT", 1, "emoted", 99, 0, 0);
        cheer(q, 7, CHEERS.emoted);
      },
      treasure1(q) {
        if (at(q, "treasure")) {
          go(q, "opening");
          q.tell("qatt", "treasure1", 3, 1500, 0, 1);
        }
      },
      // the gem count: pointed at, then Peck's last lines and off to the gate
      gui_7(q) {
        if (!at(q, "gemhud")) {
          return;
        }
        go(q, "talk11");
        set(q, "gui_7", 1, 1, 0);
        q.after(2800, () => set(q, "gui_7", 0, 1, 0));
        q.after(800, () => {
          uri(q, "160-gemhudfinishedfinished");
          say(q, "vo11a", "short_11a", 16, 27978, () => {
            idle(q);
            set(q, "vo11a", 99, 0, 0);
            uri(q, "170-pecktalk1");
            say(q, "vo11b", "short_11b", 17, 21296, () => {
              idle(q);
              q.send("qcmdVT", 1, "dialog6b", 1, 0, 0);
              uri(q, "180-pecktalk2");
              set(q, "vo11b", 99, 0, 0);
              say(q, "vo11c", "short_11c", 18, 27979, () => {
                idle(q);
                set(q, "vo11c", 99, 0, 0);
                q.after(320, () => {
                  uri(q, "190-pecktalk3");
                  say(q, "vo12a", "short_12a", 19, 21298, () => {
                    idle(q);
                    q.send("qcmdVT", 1, "dialog6d", 1, 0, 0);
                    q.send("qswfs", "alpha", "talking");
                    set(q, "alpha", 191, 1, 1);
                    q.send("qcmd", 2, "alpha", 21299, 1);
                    set(q, "alpha", 1, 1, 0);
                    q.send("qsndVO", "short_12b", "vo12b");
                    set(q, "vo12b", 99, 0, 0);
                    set(q, "vo12a", 99, 0, 0);
                    q.after(1180, () => leave(q));
                  });
                });
              });
            });
          });
        });
      },
      // Peck at the end of a path
      alpha(q) {
        if (at(q, "walk1")) {
          go(q, "gohere");
          q.send("qsp", "alpha", "");
          q.after(360, () => {
            q.send("qcmdVT", 1, "incenter", 1, 0, 0);
            idle(q);
            set(q, "alpha", 1, 1, 0);
            face(q, true);
            set(q, "go_here_vol", 1, 1, 1);
          });
        }
        else if (at(q, "leave")) {
          q.after(3800, () => q.send("qsp", "alpha", ""));
        }
      },
      // Skip: straight to the end
      gui_ffm(q) {
        if (!at(q, "done")) {
          go(q, "done");
          q.tell("qcmd", 19);
        }
      },
      // through the gate: the end
      exitvol(q) {
        if (at(q, "leave")) {
          go(q, "done");
          uri(q, "210-playerexitvol");
          q.tell("qcmd", 19);
        }
      },
    },
    triggerLike: [
      // a voice line played to its end
      [/^vo\d+[a-z]?$/, (q, name) => played(q, name)],
      [/^npcseq/, (q, name) => {
        const f = ffm(q);
        if (f.seq.has(name) || !SEQ[name]) {
          return;
        }
        f.seq.add(name);
        for (const [cmd, ...fields] of SEQ[name]) {
          q.send(cmd, ...fields.map(v => (/^-?\d+$/.test(v) ? Number(v) : v)));
        }
        set(q, name, 99, 0, 0);
        if (name === "npcseq1h_8") {
          confetti(q);
        }
      }],
      [/^bynpc\d+[lr]$/, (q, name) => {
        const npc = `npc${name.match(/\d+/)[0]}`;
        const left = name.endsWith("l");
        q.send("qswfs", npc, left ? "facesw_k" : "facese_k");
        set(q, npc, left ? 2 : 1, 1, 0);
      }],
    ],
    // the chest opened: 1500 gems, then the gem count lights up
    opened: {
      treasure1(q) {
        if (!at(q, "opening")) {
          return;
        }
        go(q, "talk10");
        q.gems(1500);
        q.send("qcmdVT", 1, "dialog5", 1, 0, 0);
        uri(q, "140-gemscollected");
        say(q, "vo10a", "short_10a", 14, 21293, () => {
          idle(q);
          set(q, "vo10a", 99, 0, 0);
          q.after(560, () => {
            go(q, "gemhud");
            uri(q, "150-gemhudstart");
            set(q, "gui_7", 2, 1, 1);
            say(q, "vo10b", "short_10b", 15, 21294, () => {
              idle(q);
              set(q, "vo10b", 99, 0, 0);
            });
          });
        });
        set(q, "click_here", 0, 0, 0);
        cheer(q, 12, CHEERS.gems);
      },
    },
  },
};

// Peck walks to the gate, which opens; she calls the player now and then until they go through
function leave(q) {
  go(q, "leave");
  uri(q, "200-peckstartsleaving");
  q.send("qsp", "alpha", "pathalpha2");
  q.send("qswfs", "alpha", "facese_k");
  q.send("qswfs", "alpha", "walking");
  set(q, "alpha", 22, 1, 1);
  set(q, "alpha", 1, 1, 0);
  set(q, "peckftpath2", 1, 1, 0);
  q.after(2670, () => set(q, "vinedoor", 1, 1, 0));
  q.after(3670, () => {
    set(q, "blockvol2", 99, 0, 0);
    set(q, "exitvol", 1, 1, 1);
    confettiOff(q);
  });
  nag(q, "leave", 17000, 20000, () => {
    set(q, "vo12b", 0, 1, 1);
    q.send("qsndVO", "short_12b", "vo12b");
    set(q, "vo12b", 99, 0, 0);
  });
}
