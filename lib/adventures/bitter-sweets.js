"use strict";

// Bitter Sweets (adventure 12), one of the newer adventures: played as your
// pet, up to 8 at once, joined while it runs. written by hand from a
// recording of the official game, as its parts work like a game rather than
// a story the maker could replay:
//  - candy enemies ("proto" 1-211) come on a clock: every 3 seconds the next
//    of 60 slots wakes its enemies (slot n: n, n+60, n+120, n+180), and those
//    beaten since that slot last came round come back. one swipe beats one;
//    it drops an orb worth 3.
//  - candy pods ("_r_pod" 01-60) share the slot of their number: one swipe
//    breaks one, for a gem or an orb worth 1.
//  - orbs count up on each player's screen; at 100, 200, 400, 700 and 1000
//    the goal button offers a choice of 2 prizes.
//  - six gathering spots, four places each: a pet standing in a place (doing
//    the action the stump shows) lights its lantern post. what four lit at
//    once gives could not be recorded alone; here each of the four gets 25
//    orbs (a guess).
//  - each part of the map has its music; Alpha talks; the blockers say why
//    a pet can't pass; the exit asks before leaving.

const ROOM = {room: "adventures.room_adventure_12a_party", name: "Bitter Sweets", nameStringId: 19093, music: "ajq_mushauntedforest"};
const TICK = 3000; // ms between spawn slots
const SLOTS = 60;
const SOCIAL_TICK = 1000;
const ORB = {enemy: 3, pod: 1};
const GEM_CHANCE = 0.58; // a pod's drop: a gem this often, otherwise an orb (32 of 55 recorded)
const GOALS = [100, 200, 400, 700, 1000];
// the prizes each goal offers: one for anyone, one for members, picked
// each time from the wiki's lists (animaljam.fandom.com/wiki/Bitter_Sweets),
// which hold all that was recorded. den items by id; the members' clothing
// as [item, "colours"], in the colour recorded where there was one (the
// others in any of theirs: the wiki shows one each, but not which).
const PRIZE_LISTS = [
  {free: [1775, 1783, 1774, 1772, 3343, 5906, 5907], members: [2835, 1561, 1563, 3339, 5905]},
  {free: [1776, 1787, 1784, 1782, 2833, 3345, 5917], members: [1580, 1564, 2836, 3340, 5911, 5909]},
  {free: [1778, 1771, 1785, 5910], members: [[486, "-892546199"], [482, "-1577031772,1360593001,-1402404838,774423296,-1684107674,-1016790991,-1442819304,-1811904768"]]}, // Eyeball Hat, Frankenstein Mask
  {free: [1779, 1786, 5915, 5914, 5916], members: [[487, "-878787328,-1869105664,-745159424,-661404416,-1885030912,-1517436416,2031728640,-735661055"], [223, "1722951017"]]}, // Mummy Mask, Vampire Mask
  {free: [1781, 1777, 5912, 5913, 5908], members: [[1032, "-10092544"], [488, "-1577058304,-1526726656,-1476395008,-771751936,-754974720,-671088640,-637534208,-1946157056"]]}, // Bone Claws, Hockey Mask
];
const pickOne = list => list[Math.floor(Math.random() * list.length)];
// a goal's two: [kind, item, colour], 1 a den item, 2 clothing
const prizesFor = n => {
  const {free, members} = PRIZE_LISTS[n - 1];
  const gift = choice => (Array.isArray(choice) ? [2, choice[0], Number(pickOne(choice[1].split(",")))] : [1, choice, 0]);
  return [gift(pickOne(free)), gift(pickOne(members))];
};
const GOAL_TALK = [23700, 23701, 23702, 23703, 23704]; // Alpha, after each prize
const SOCIAL_REWARD = 25;
// Alpha's lines, one after another as she is clicked
const ALPHA = [19095, 19708, 19709, 19710, 19737, 19738];
// what each blocker says
const BLOCKERS = {petblocker1: 19714, petblocker2: 19715, petblocker3: 19716, petblocker4: 19717, petblocker5: 23706, petblocker6: 23707, petblocker7: 23708, petblocker8: 23705};
const MUSIC = {m_forest: "ajq_mushauntedforest", m_grave: "ajq_musgraveyard", m_swamp: "ajq_musfroggymarsh", m_patch: "ajq_muspumpkinpatch",
  m_hive: "ajq_musouterlimits", m_lab: "ajq_mussciencelab"};
// the action each gathering spot's stump shows (spot 3 had none set)
const STUMPS = {1: 1, 2: 5, 4: 4, 5: 3, 6: 2};
const SPOTS = [1, 2, 3, 4, 5, 6];
const PLACES = ["a", "b", "c", "d"];

const ACTORS = [
    ["advcompress", 7, 0, 0, 1, 1, "", ""],
    ["advtype7", 7, 0, 0, 1, 1, "", ""],
    ["orbnpcid", 7, 0, 0, 1, 1, "", ""],
    ["level_start", 18, 0, 0, 1, 1, "", ""],
    ["questready", 7, 0, 0, 1, 1, "", ""],
    ["setup", 8, 0, 0, 0, 1, "", ""],
    ["alpha01a", 1, 249, 0, 1, 1, "", ""],
    ["alpha01b", 1, 249, 0, 1, 1, "", ""],
    ["alpha01c", 1, 249, 0, 1, 1, "", ""],
    ["alpha01", 1, 249, 0, 1, 1, "", ""],
    ["alpha0a", 1, 249, 0, 1, 1, "", ""],
    ["alpha0b", 1, 249, 0, 1, 1, "", ""],
    ["alpha0c", 1, 249, 0, 1, 1, "", ""],
    ["alpha0d", 1, 249, 0, 1, 1, "", ""],
    ["alpha0e", 1, 249, 0, 1, 1, "", ""],
    ["exit_vol", 3, 0, 0, 1, 1, "", ""],
    ["socvol01a", 24, 13, 0, 1, 1, "", ""],
    ["socvol01b", 24, 13, 0, 1, 1, "", ""],
    ["socvol01c", 24, 13, 0, 1, 1, "", ""],
    ["socvol01d", 24, 13, 0, 1, 1, "", ""],
    ["socvol02a", 24, 13, 0, 1, 1, "", ""],
    ["socvol02b", 24, 13, 0, 1, 1, "", ""],
    ["socvol02c", 24, 13, 0, 1, 1, "", ""],
    ["socvol02d", 24, 13, 0, 1, 1, "", ""],
    ["socvol03a", 24, 13, 0, 1, 1, "", ""],
    ["socvol03b", 24, 13, 0, 1, 1, "", ""],
    ["socvol03c", 24, 13, 0, 1, 1, "", ""],
    ["socvol03d", 24, 13, 0, 1, 1, "", ""],
    ["socvol04a", 24, 13, 0, 1, 1, "", ""],
    ["socvol04b", 24, 13, 0, 1, 1, "", ""],
    ["socvol04c", 24, 13, 0, 1, 1, "", ""],
    ["socvol04d", 24, 13, 0, 1, 1, "", ""],
    ["socvol05a", 24, 13, 0, 1, 1, "", ""],
    ["socvol05b", 24, 13, 0, 1, 1, "", ""],
    ["socvol05c", 24, 13, 0, 1, 1, "", ""],
    ["socvol05d", 24, 13, 0, 1, 1, "", ""],
    ["socvol06a", 24, 13, 0, 1, 1, "", ""],
    ["socvol06b", 24, 13, 0, 1, 1, "", ""],
    ["socvol06c", 24, 13, 0, 1, 1, "", ""],
    ["socvol06d", 24, 13, 0, 1, 1, "", ""],
    ["sochq1", 7, 0, 0, 1, 1, "", ""],
    ["sochq2", 7, 0, 0, 1, 1, "", ""],
    ["sochq3", 7, 0, 0, 1, 1, "", ""],
    ["sochq4", 7, 0, 0, 1, 1, "", ""],
    ["sochq5", 7, 0, 0, 1, 1, "", ""],
    ["sochq6", 7, 0, 0, 1, 1, "", ""],
    ["ppoint01a", 2, 0, 0, 0, 1, "", ""],
    ["ppoint01b", 2, 0, 0, 0, 1, "", ""],
    ["ppoint01c", 2, 0, 0, 0, 1, "", ""],
    ["ppoint01d", 2, 0, 0, 0, 1, "", ""],
    ["ppoint02a", 2, 0, 0, 0, 1, "", ""],
    ["ppoint02b", 2, 0, 0, 0, 1, "", ""],
    ["ppoint02c", 2, 0, 0, 0, 1, "", ""],
    ["ppoint02d", 2, 0, 0, 0, 1, "", ""],
    ["ppoint03a", 2, 0, 0, 0, 1, "", ""],
    ["ppoint03b", 2, 0, 0, 0, 1, "", ""],
    ["ppoint03c", 2, 0, 0, 0, 1, "", ""],
    ["ppoint03d", 2, 0, 0, 0, 1, "", ""],
    ["ppoint04a", 2, 0, 0, 0, 1, "", ""],
    ["ppoint04b", 2, 0, 0, 0, 1, "", ""],
    ["ppoint04c", 2, 0, 0, 0, 1, "", ""],
    ["ppoint04d", 2, 0, 0, 0, 1, "", ""],
    ["ppoint05a", 2, 0, 0, 0, 1, "", ""],
    ["ppoint05b", 2, 0, 0, 0, 1, "", ""],
    ["ppoint05c", 2, 0, 0, 0, 1, "", ""],
    ["ppoint05d", 2, 0, 0, 0, 1, "", ""],
    ["ppoint06a", 2, 0, 0, 0, 1, "", ""],
    ["ppoint06b", 2, 0, 0, 0, 1, "", ""],
    ["ppoint06c", 2, 0, 0, 0, 1, "", ""],
    ["ppoint06d", 2, 0, 0, 0, 1, "", ""],
    ["social01", 2, 0, 0, 1, 1, "", ""],
    ["social02", 2, 0, 0, 1, 1, "", ""],
    ["social03", 2, 0, 0, 1, 1, "", ""],
    ["social04", 2, 0, 0, 1, 1, "", ""],
    ["social05", 2, 0, 0, 1, 1, "", ""],
    ["social06", 2, 0, 0, 1, 1, "", ""],
    ["marker01", 7, 0, 0, 1, 1, "", ""],
    ["marker02", 7, 0, 0, 1, 1, "", ""],
    ["marker03", 7, 0, 0, 1, 1, "", ""],
    ["marker04", 7, 0, 0, 1, 1, "", ""],
    ["marker05", 7, 0, 0, 1, 1, "", ""],
    ["marker06", 7, 0, 0, 1, 1, "", ""],
    ["treas1", 8, 0, 0, 0, 1, "", ""],
    ["treas3", 8, 0, 0, 0, 1, "", ""],
    ["treas4", 8, 0, 0, 0, 1, "", ""],
    ["treas5", 8, 0, 0, 0, 1, "", ""],
    ["treas6", 8, 0, 0, 0, 1, "", ""],
    ["treas2", 8, 0, 0, 0, 1, "", ""],
    ["socialinfo01", 4, 0, 0, 1, 1, "", ""],
    ["socialinfo02", 4, 0, 0, 1, 1, "", ""],
    ["socialinfo03", 4, 0, 0, 1, 1, "", ""],
    ["socialinfo04", 4, 0, 0, 1, 1, "", ""],
    ["socialinfo05", 4, 0, 0, 1, 1, "", ""],
    ["socialinfo06", 4, 0, 0, 1, 1, "", ""],
    ["exit_portal", 2, 0, 0, 1, 1, "", ""],
    ["stump1", 2, 0, 0, 1, 1, "", ""],
    ["stump2", 2, 0, 0, 1, 1, "", ""],
    ["stump3", 2, 0, 0, 1, 1, "", ""],
    ["stump4", 2, 0, 0, 1, 1, "", ""],
    ["stump5", 2, 0, 0, 1, 1, "", ""],
    ["stump6", 2, 0, 0, 1, 1, "", ""],
    ["streasure01", 13, 39, 0, 0, 1, "", ""],
    ["streasure02", 13, 39, 0, 0, 1, "", ""],
    ["streasure03", 13, 39, 0, 0, 1, "", ""],
    ["streasure04", 13, 39, 0, 0, 1, "", ""],
    ["streasure05", 13, 39, 0, 0, 1, "", ""],
    ["streasure06", 13, 39, 0, 0, 1, "", ""],
    ["socvol01", 24, 1, 0, 0, 1, "", ""],
    ["socvol02", 24, 1, 0, 0, 1, "", ""],
    ["socvol03", 24, 1, 0, 0, 1, "", ""],
    ["socvol04", 24, 1, 0, 0, 1, "", ""],
    ["socvol05", 24, 1, 0, 0, 1, "", ""],
    ["socvol06", 24, 1, 0, 0, 1, "", ""],
    ["reset1", 7, 0, 0, 1, 1, "", ""],
    ["reset2", 7, 0, 0, 1, 1, "", ""],
    ["reset3", 7, 0, 0, 1, 1, "", ""],
    ["reset4", 7, 0, 0, 1, 1, "", ""],
    ["reset5", 7, 0, 0, 1, 1, "", ""],
    ["reset6", 7, 0, 0, 1, 1, "", ""],
    ["protopath1", 20, 0, 0, 1, 1, "", ""],
    ["protopath3", 20, 0, 0, 1, 1, "", ""],
    ["protopath4", 20, 0, 0, 1, 1, "", ""],
    ["protopath5", 20, 0, 0, 1, 1, "", ""],
    ["protopath7", 20, 0, 0, 1, 1, "", ""],
    ["protopath10", 20, 0, 0, 1, 1, "", ""],
    ["protopath11", 20, 0, 0, 1, 1, "", ""],
    ["protopath13", 20, 0, 0, 1, 1, "", ""],
    ["protopath14", 20, 0, 0, 1, 1, "", ""],
    ["protopath17", 20, 0, 0, 1, 1, "", ""],
    ["protopath19", 20, 0, 0, 1, 1, "", ""],
    ["protopath20", 20, 0, 0, 1, 1, "", ""],
    ["protopath21", 20, 0, 0, 1, 1, "", ""],
    ["protopath23", 20, 0, 0, 1, 1, "", ""],
    ["protopath24", 20, 0, 0, 1, 1, "", ""],
    ["protopath27", 20, 0, 0, 1, 1, "", ""],
    ["protopath29", 20, 0, 0, 1, 1, "", ""],
    ["protopath30", 20, 0, 0, 1, 1, "", ""],
    ["protopath31", 20, 0, 0, 1, 1, "", ""],
    ["protopath32", 20, 0, 0, 1, 1, "", ""],
    ["protopath33", 20, 0, 0, 1, 1, "", ""],
    ["protopath34", 20, 0, 0, 1, 1, "", ""],
    ["protopath35", 20, 0, 0, 1, 1, "", ""],
    ["protopath36", 20, 0, 0, 1, 1, "", ""],
    ["protopath37", 20, 0, 0, 1, 1, "", ""],
    ["protopath39", 20, 0, 0, 1, 1, "", ""],
    ["protopath40", 20, 0, 0, 1, 1, "", ""],
    ["protopath41", 20, 0, 0, 1, 1, "", ""],
    ["protopath43", 20, 0, 0, 1, 1, "", ""],
    ["protopath45", 20, 0, 0, 1, 1, "", ""],
    ["protopath48", 20, 0, 0, 1, 1, "", ""],
    ["protopath50", 20, 0, 0, 1, 1, "", ""],
    ["protopath51", 20, 0, 0, 1, 1, "", ""],
    ["protopath53", 20, 0, 0, 1, 1, "", ""],
    ["protopath55", 20, 0, 0, 1, 1, "", ""],
    ["protopath57", 20, 0, 0, 1, 1, "", ""],
    ["protopath58", 20, 0, 0, 1, 1, "", ""],
    ["protopath60", 20, 0, 0, 1, 1, "", ""],
    ["protopath62", 20, 0, 0, 1, 1, "", ""],
    ["protopath63", 20, 0, 0, 1, 1, "", ""],
    ["protopath65", 20, 0, 0, 1, 1, "", ""],
    ["protopath66", 20, 0, 0, 1, 1, "", ""],
    ["protopath67", 20, 0, 0, 1, 1, "", ""],
    ["protopath68", 20, 0, 0, 1, 1, "", ""],
    ["protopath69", 20, 0, 0, 1, 1, "", ""],
    ["protopath70", 20, 0, 0, 1, 1, "", ""],
    ["protopath71", 20, 0, 0, 1, 1, "", ""],
    ["protopath72", 20, 0, 0, 1, 1, "", ""],
    ["protopath73", 20, 0, 0, 1, 1, "", ""],
    ["protopath76", 20, 0, 0, 1, 1, "", ""],
    ["protopath77", 20, 0, 0, 1, 1, "", ""],
    ["protopath78", 20, 0, 0, 1, 1, "", ""],
    ["protopath79", 20, 0, 0, 1, 1, "", ""],
    ["protopath80", 20, 0, 0, 1, 1, "", ""],
    ["protopath81", 20, 0, 0, 1, 1, "", ""],
    ["protopath82", 20, 0, 0, 1, 1, "", ""],
    ["protopath83", 20, 0, 0, 1, 1, "", ""],
    ["protopath84", 20, 0, 0, 1, 1, "", ""],
    ["protopath85", 20, 0, 0, 1, 1, "", ""],
    ["protopath86", 20, 0, 0, 1, 1, "", ""],
    ["protopath88", 20, 0, 0, 1, 1, "", ""],
    ["protopath89", 20, 0, 0, 1, 1, "", ""],
    ["protopath91", 20, 0, 0, 1, 1, "", ""],
    ["protopath93", 20, 0, 0, 1, 1, "", ""],
    ["protopath94", 20, 0, 0, 1, 1, "", ""],
    ["protopath96", 20, 0, 0, 1, 1, "", ""],
    ["protopath97", 20, 0, 0, 1, 1, "", ""],
    ["protopath99", 20, 0, 0, 1, 1, "", ""],
    ["protopath100", 20, 0, 0, 1, 1, "", ""],
    ["protopath104", 20, 0, 0, 1, 1, "", ""],
    ["protopath106", 20, 0, 0, 1, 1, "", ""],
    ["protopath107", 20, 0, 0, 1, 1, "", ""],
    ["protopath111", 20, 0, 0, 1, 1, "", ""],
    ["protopath112", 20, 0, 0, 1, 1, "", ""],
    ["protopath113", 20, 0, 0, 1, 1, "", ""],
    ["protopath114", 20, 0, 0, 1, 1, "", ""],
    ["protopath115", 20, 0, 0, 1, 1, "", ""],
    ["protopath117", 20, 0, 0, 1, 1, "", ""],
    ["protopath118", 20, 0, 0, 1, 1, "", ""],
    ["protopath119", 20, 0, 0, 1, 1, "", ""],
    ["protopath123", 20, 0, 0, 1, 1, "", ""],
    ["protopath124", 20, 0, 0, 1, 1, "", ""],
    ["protopath125", 20, 0, 0, 1, 1, "", ""],
    ["protopath126", 20, 0, 0, 1, 1, "", ""],
    ["protopath129", 20, 0, 0, 1, 1, "", ""],
    ["protopath130", 20, 0, 0, 1, 1, "", ""],
    ["protopath135", 20, 0, 0, 1, 1, "", ""],
    ["protopath136", 20, 0, 0, 1, 1, "", ""],
    ["protopath137", 20, 0, 0, 1, 1, "", ""],
    ["protopath138", 20, 0, 0, 1, 1, "", ""],
    ["protopath140", 20, 0, 0, 1, 1, "", ""],
    ["protopath141", 20, 0, 0, 1, 1, "", ""],
    ["protopath142", 20, 0, 0, 1, 1, "", ""],
    ["protopath143", 20, 0, 0, 1, 1, "", ""],
    ["protopath145", 20, 0, 0, 1, 1, "", ""],
    ["protopath148", 20, 0, 0, 1, 1, "", ""],
    ["protopath149", 20, 0, 0, 1, 1, "", ""],
    ["protopath151", 20, 0, 0, 1, 1, "", ""],
    ["protopath152", 20, 0, 0, 1, 1, "", ""],
    ["protopath154", 20, 0, 0, 1, 1, "", ""],
    ["protopath155", 20, 0, 0, 1, 1, "", ""],
    ["protopath159", 20, 0, 0, 1, 1, "", ""],
    ["protopath161", 20, 0, 0, 1, 1, "", ""],
    ["protopath163", 20, 0, 0, 1, 1, "", ""],
    ["protopath167", 20, 0, 0, 1, 1, "", ""],
    ["protopath169", 20, 0, 0, 1, 1, "", ""],
    ["protopath170", 20, 0, 0, 1, 1, "", ""],
    ["protopath172", 20, 0, 0, 1, 1, "", ""],
    ["protopath174", 20, 0, 0, 1, 1, "", ""],
    ["protopath177", 20, 0, 0, 1, 1, "", ""],
    ["protopath179", 20, 0, 0, 1, 1, "", ""],
    ["protopath181", 20, 0, 0, 1, 1, "", ""],
    ["protopath182", 20, 0, 0, 1, 1, "", ""],
    ["protopath183", 20, 0, 0, 1, 1, "", ""],
    ["protopath184", 20, 0, 0, 1, 1, "", ""],
    ["protopath185", 20, 0, 0, 1, 1, "", ""],
    ["protopath186", 20, 0, 0, 1, 1, "", ""],
    ["protopath189", 20, 0, 0, 1, 1, "", ""],
    ["protopath190", 20, 0, 0, 1, 1, "", ""],
    ["protopath191", 20, 0, 0, 1, 1, "", ""],
    ["protopath192", 20, 0, 0, 1, 1, "", ""],
    ["protopath193", 20, 0, 0, 1, 1, "", ""],
    ["protopath194", 20, 0, 0, 1, 1, "", ""],
    ["protopath195", 20, 0, 0, 1, 1, "", ""],
    ["protopath196", 20, 0, 0, 1, 1, "", ""],
    ["protopath197", 20, 0, 0, 1, 1, "", ""],
    ["protopath198", 20, 0, 0, 1, 1, "", ""],
    ["protopath199", 20, 0, 0, 1, 1, "", ""],
    ["protopath200", 20, 0, 0, 1, 1, "", ""],
    ["protopath201", 20, 0, 0, 1, 1, "", ""],
    ["protopath202", 20, 0, 0, 1, 1, "", ""],
    ["protopath203", 20, 0, 0, 1, 1, "", ""],
    ["protopath204", 20, 0, 0, 1, 1, "", ""],
    ["protopath205", 20, 0, 0, 1, 1, "", ""],
    ["protopath206", 20, 0, 0, 1, 1, "", ""],
    ["protopath207", 20, 0, 0, 1, 1, "", ""],
    ["protopath208", 20, 0, 0, 1, 1, "", ""],
    ["protopath209", 20, 0, 0, 1, 1, "", ""],
    ["protopath210", 20, 0, 0, 1, 1, "", ""],
    ["protopath211", 20, 0, 0, 1, 1, "", ""],
    ["protospawner", 8, 0, 0, 0, 1, "", ""],
    ["proto1", 11, 186, 0, 0, 1, "", ""],
    ["proto3", 11, 186, 0, 0, 1, "", ""],
    ["proto4", 11, 186, 0, 0, 1, "", ""],
    ["proto5", 11, 186, 0, 0, 1, "", ""],
    ["proto7", 11, 186, 0, 0, 1, "", ""],
    ["proto10", 11, 186, 0, 0, 1, "", ""],
    ["proto11", 11, 186, 0, 0, 1, "", ""],
    ["proto13", 11, 186, 0, 0, 1, "", ""],
    ["proto14", 11, 186, 0, 0, 1, "", ""],
    ["proto17", 11, 186, 0, 0, 1, "", ""],
    ["proto19", 11, 186, 0, 0, 1, "", ""],
    ["proto20", 11, 186, 0, 0, 1, "", ""],
    ["proto21", 11, 186, 0, 0, 1, "", ""],
    ["proto23", 11, 186, 0, 0, 1, "", ""],
    ["proto24", 11, 186, 0, 0, 1, "", ""],
    ["proto27", 11, 186, 0, 0, 1, "", ""],
    ["proto29", 11, 186, 0, 0, 1, "", ""],
    ["proto30", 11, 186, 0, 0, 1, "", ""],
    ["proto31", 11, 186, 0, 0, 1, "", ""],
    ["proto32", 11, 186, 0, 0, 1, "", ""],
    ["proto33", 11, 186, 0, 0, 1, "", ""],
    ["proto34", 11, 186, 0, 0, 1, "", ""],
    ["proto35", 11, 186, 0, 0, 1, "", ""],
    ["proto36", 11, 186, 0, 0, 1, "", ""],
    ["proto37", 11, 186, 0, 0, 1, "", ""],
    ["proto39", 11, 186, 0, 0, 1, "", ""],
    ["proto40", 11, 186, 0, 0, 1, "", ""],
    ["proto41", 11, 186, 0, 0, 1, "", ""],
    ["proto43", 11, 186, 0, 0, 1, "", ""],
    ["proto45", 11, 186, 0, 0, 1, "", ""],
    ["proto48", 11, 186, 0, 0, 1, "", ""],
    ["proto50", 11, 186, 0, 0, 1, "", ""],
    ["proto51", 11, 186, 0, 0, 1, "", ""],
    ["proto53", 11, 186, 0, 0, 1, "", ""],
    ["proto55", 11, 186, 0, 0, 1, "", ""],
    ["proto57", 11, 186, 0, 0, 1, "", ""],
    ["proto58", 11, 186, 0, 0, 1, "", ""],
    ["proto60", 11, 186, 0, 0, 1, "", ""],
    ["proto62", 11, 186, 0, 0, 1, "", ""],
    ["proto63", 11, 186, 0, 0, 1, "", ""],
    ["proto65", 11, 186, 0, 0, 1, "", ""],
    ["proto66", 11, 186, 0, 0, 1, "", ""],
    ["proto67", 11, 186, 0, 0, 1, "", ""],
    ["proto68", 11, 186, 0, 0, 1, "", ""],
    ["proto69", 11, 186, 0, 0, 1, "", ""],
    ["proto70", 11, 186, 0, 0, 1, "", ""],
    ["proto71", 11, 186, 0, 0, 1, "", ""],
    ["proto72", 11, 186, 0, 0, 1, "", ""],
    ["proto73", 11, 186, 0, 0, 1, "", ""],
    ["proto76", 11, 186, 0, 0, 1, "", ""],
    ["proto77", 11, 186, 0, 0, 1, "", ""],
    ["proto78", 11, 186, 0, 0, 1, "", ""],
    ["proto79", 11, 186, 0, 0, 1, "", ""],
    ["proto80", 11, 186, 0, 0, 1, "", ""],
    ["proto81", 11, 186, 0, 0, 1, "", ""],
    ["proto82", 11, 186, 0, 0, 1, "", ""],
    ["proto83", 11, 186, 0, 0, 1, "", ""],
    ["proto84", 11, 186, 0, 0, 1, "", ""],
    ["proto85", 11, 186, 0, 0, 1, "", ""],
    ["proto86", 11, 186, 0, 0, 1, "", ""],
    ["proto88", 11, 186, 0, 0, 1, "", ""],
    ["proto89", 11, 186, 0, 0, 1, "", ""],
    ["proto91", 11, 186, 0, 0, 1, "", ""],
    ["proto93", 11, 186, 0, 0, 1, "", ""],
    ["proto94", 11, 186, 0, 0, 1, "", ""],
    ["proto96", 11, 186, 0, 0, 1, "", ""],
    ["proto97", 11, 186, 0, 0, 1, "", ""],
    ["proto99", 11, 186, 0, 0, 1, "", ""],
    ["proto100", 11, 186, 0, 0, 1, "", ""],
    ["proto104", 11, 186, 0, 0, 1, "", ""],
    ["proto106", 11, 186, 0, 0, 1, "", ""],
    ["proto107", 11, 186, 0, 0, 1, "", ""],
    ["proto111", 11, 186, 0, 0, 1, "", ""],
    ["proto112", 11, 186, 0, 0, 1, "", ""],
    ["proto113", 11, 186, 0, 0, 1, "", ""],
    ["proto114", 11, 186, 0, 0, 1, "", ""],
    ["proto115", 11, 186, 0, 0, 1, "", ""],
    ["proto117", 11, 186, 0, 0, 1, "", ""],
    ["proto118", 11, 186, 0, 0, 1, "", ""],
    ["proto119", 11, 186, 0, 0, 1, "", ""],
    ["proto123", 11, 186, 0, 0, 1, "", ""],
    ["proto124", 11, 186, 0, 0, 1, "", ""],
    ["proto125", 11, 186, 0, 0, 1, "", ""],
    ["proto126", 11, 186, 0, 0, 1, "", ""],
    ["proto129", 11, 186, 0, 0, 1, "", ""],
    ["proto130", 11, 186, 0, 0, 1, "", ""],
    ["proto135", 11, 186, 0, 0, 1, "", ""],
    ["proto136", 11, 186, 0, 0, 1, "", ""],
    ["proto137", 11, 186, 0, 0, 1, "", ""],
    ["proto138", 11, 186, 0, 0, 1, "", ""],
    ["proto140", 11, 186, 0, 0, 1, "", ""],
    ["proto141", 11, 186, 0, 0, 1, "", ""],
    ["proto142", 11, 186, 0, 0, 1, "", ""],
    ["proto143", 11, 186, 0, 0, 1, "", ""],
    ["proto145", 11, 186, 0, 0, 1, "", ""],
    ["proto148", 11, 186, 0, 0, 1, "", ""],
    ["proto149", 11, 186, 0, 0, 1, "", ""],
    ["proto151", 11, 186, 0, 0, 1, "", ""],
    ["proto152", 11, 186, 0, 0, 1, "", ""],
    ["proto154", 11, 186, 0, 0, 1, "", ""],
    ["proto155", 11, 186, 0, 0, 1, "", ""],
    ["proto159", 11, 186, 0, 0, 1, "", ""],
    ["proto161", 11, 186, 0, 0, 1, "", ""],
    ["proto163", 11, 186, 0, 0, 1, "", ""],
    ["proto167", 11, 186, 0, 0, 1, "", ""],
    ["proto169", 11, 186, 0, 0, 1, "", ""],
    ["proto170", 11, 186, 0, 0, 1, "", ""],
    ["proto172", 11, 186, 0, 0, 1, "", ""],
    ["proto174", 11, 186, 0, 0, 1, "", ""],
    ["proto177", 11, 186, 0, 0, 1, "", ""],
    ["proto179", 11, 186, 0, 0, 1, "", ""],
    ["proto181", 11, 186, 0, 0, 1, "", ""],
    ["proto182", 11, 186, 0, 0, 1, "", ""],
    ["proto183", 11, 186, 0, 0, 1, "", ""],
    ["proto184", 11, 186, 0, 0, 1, "", ""],
    ["proto185", 11, 186, 0, 0, 1, "", ""],
    ["proto186", 11, 186, 0, 0, 1, "", ""],
    ["proto189", 11, 186, 0, 0, 1, "", ""],
    ["proto190", 11, 186, 0, 0, 1, "", ""],
    ["proto191", 11, 186, 0, 0, 1, "", ""],
    ["proto192", 11, 186, 0, 0, 1, "", ""],
    ["proto193", 11, 186, 0, 0, 1, "", ""],
    ["proto194", 11, 186, 0, 0, 1, "", ""],
    ["proto195", 11, 186, 0, 0, 1, "", ""],
    ["proto196", 11, 186, 0, 0, 1, "", ""],
    ["proto197", 11, 186, 0, 0, 1, "", ""],
    ["proto198", 11, 186, 0, 0, 1, "", ""],
    ["proto199", 11, 186, 0, 0, 1, "", ""],
    ["proto200", 11, 186, 0, 0, 1, "", ""],
    ["proto201", 11, 186, 0, 0, 1, "", ""],
    ["proto202", 11, 186, 0, 0, 1, "", ""],
    ["proto203", 11, 186, 0, 0, 1, "", ""],
    ["proto204", 11, 186, 0, 0, 1, "", ""],
    ["proto205", 11, 186, 0, 0, 1, "", ""],
    ["proto206", 11, 186, 0, 0, 1, "", ""],
    ["proto207", 11, 186, 0, 0, 1, "", ""],
    ["proto208", 11, 186, 0, 0, 1, "", ""],
    ["proto209", 11, 186, 0, 0, 1, "", ""],
    ["proto210", 11, 186, 0, 0, 1, "", ""],
    ["proto211", 11, 186, 0, 0, 1, "", ""],
    ["times_up", 7, 0, 0, 1, 1, "", ""],
    ["dropcandy", 7, 0, 0, 1, 1, "", ""],
    ["gui_goal1", 7, 0, 0, 1, 1, "", ""],
    ["gui_goal2", 7, 0, 0, 1, 1, "", ""],
    ["gui_goal3", 7, 0, 0, 1, 1, "", ""],
    ["gui_goal4", 7, 0, 0, 1, 1, "", ""],
    ["gui_goal5", 7, 0, 0, 1, 1, "", ""],
    ["gui_goal1a", 7, 0, 0, 1, 1, "", ""],
    ["gui_goal2a", 7, 0, 0, 1, 1, "", ""],
    ["gui_goal3a", 7, 0, 0, 1, 1, "", ""],
    ["gui_goal4a", 7, 0, 0, 1, 1, "", ""],
    ["gui_goal5a", 7, 0, 0, 1, 1, "", ""],
    ["gui_goal6a", 7, 0, 0, 1, 1, "", ""],
    ["candy01", 1, 44, 0, 0, 1, "", ""],
    ["candy02", 1, 44, 0, 0, 1, "", ""],
    ["candy03", 1, 44, 0, 0, 1, "", ""],
    ["candy04", 1, 44, 0, 0, 1, "", ""],
    ["candy05", 1, 44, 0, 0, 1, "", ""],
    ["candy06", 1, 44, 0, 0, 1, "", ""],
    ["dpa", 5, 0, 0, 1, 1, "", ""],
    ["_r_pod01", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod02", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod03", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod04", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod05", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod06", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod07", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod08", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod09", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod10", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod11", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod12", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod13", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod14", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod15", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod16", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod17", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod18", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod19", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod20", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod21", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod22", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod23", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod24", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod25", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod26", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod27", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod28", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod29", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod30", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod31", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod32", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod33", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod34", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod35", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod36", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod37", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod38", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod39", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod40", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod41", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod42", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod43", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod44", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod45", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod46", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod47", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod48", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod49", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod50", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod51", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod52", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod53", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod54", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod55", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod56", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod57", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod58", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod59", 23, 248, 0, 1, 1, "", "appear"],
    ["_r_pod60", 23, 248, 0, 1, 1, "", "appear"],
    ["petblocker1", 1, 254, 0, 1, 1, "", ""],
    ["petblocker2", 1, 253, 0, 1, 1, "", ""],
    ["petblocker3", 1, 250, 0, 1, 1, "", ""],
    ["petblocker4", 1, 251, 0, 1, 1, "", ""],
    ["petblocker5", 1, 375, 0, 1, 1, "", ""],
    ["petblocker6", 1, 377, 0, 1, 1, "", ""],
    ["petblocker7", 1, 376, 0, 1, 1, "", ""],
    ["petblocker8", 1, 378, 0, 1, 1, "", ""],
    ["blocktimer1", 8, 0, 0, 0, 1, "", ""],
    ["blocktimer2", 8, 0, 0, 0, 1, "", ""],
    ["blocktimer3", 8, 0, 0, 0, 1, "", ""],
    ["blocktimer4", 8, 0, 0, 0, 1, "", ""],
    ["blocktimer5", 8, 0, 0, 0, 1, "", ""],
    ["blocktimer6", 8, 0, 0, 0, 1, "", ""],
    ["blocktimer7", 8, 0, 0, 0, 1, "", ""],
    ["blocktimer8", 8, 0, 0, 0, 1, "", ""],
    ["petvol1", 24, 1, 0, 0, 1, "", ""],
    ["petvol2", 24, 1, 0, 0, 1, "", ""],
    ["petvol3", 24, 1, 0, 0, 1, "", ""],
    ["petvol4", 24, 1, 0, 0, 1, "", ""],
    ["petvol5", 24, 1, 0, 0, 1, "", ""],
    ["petvol6", 24, 1, 0, 0, 1, "", ""],
    ["petvol7", 24, 1, 0, 0, 1, "", ""],
    ["petvol8", 24, 1, 0, 0, 1, "", ""],
    ["petblock1", 5, 0, 0, 1, 1, "", ""],
    ["petblock2", 5, 0, 0, 1, 1, "", ""],
    ["petblock3", 5, 0, 0, 1, 1, "", ""],
    ["petblock4", 5, 0, 0, 1, 1, "", ""],
    ["petblock5", 5, 0, 0, 1, 1, "", ""],
    ["petblock6", 5, 0, 0, 1, 1, "", ""],
    ["petblock7", 5, 0, 0, 1, 1, "", ""],
    ["petblock8", 5, 0, 0, 1, 1, "", ""],
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
    ["podcol14", 5, 0, 0, 1, 1, "", ""],
    ["podcol15", 5, 0, 0, 1, 1, "", ""],
    ["podcol16", 5, 0, 0, 1, 1, "", ""],
    ["podcol17", 5, 0, 0, 1, 1, "", ""],
    ["podcol18", 5, 0, 0, 1, 1, "", ""],
    ["podcol19", 5, 0, 0, 1, 1, "", ""],
    ["podcol20", 5, 0, 0, 1, 1, "", ""],
    ["podcol21", 5, 0, 0, 1, 1, "", ""],
    ["podcol22", 5, 0, 0, 1, 1, "", ""],
    ["podcol23", 5, 0, 0, 1, 1, "", ""],
    ["podcol24", 5, 0, 0, 1, 1, "", ""],
    ["podcol25", 5, 0, 0, 1, 1, "", ""],
    ["podcol26", 5, 0, 0, 1, 1, "", ""],
    ["podcol27", 5, 0, 0, 1, 1, "", ""],
    ["podcol28", 5, 0, 0, 1, 1, "", ""],
    ["podcol29", 5, 0, 0, 1, 1, "", ""],
    ["podcol30", 5, 0, 0, 1, 1, "", ""],
    ["podcol31", 5, 0, 0, 1, 1, "", ""],
    ["podcol32", 5, 0, 0, 1, 1, "", ""],
    ["podcol33", 5, 0, 0, 1, 1, "", ""],
    ["podcol34", 5, 0, 0, 1, 1, "", ""],
    ["podcol35", 5, 0, 0, 1, 1, "", ""],
    ["podcol36", 5, 0, 0, 1, 1, "", ""],
    ["podcol37", 5, 0, 0, 1, 1, "", ""],
    ["podcol38", 5, 0, 0, 1, 1, "", ""],
    ["podcol39", 5, 0, 0, 1, 1, "", ""],
    ["podcol40", 5, 0, 0, 1, 1, "", ""],
    ["podcol41", 5, 0, 0, 1, 1, "", ""],
    ["podcol42", 5, 0, 0, 1, 1, "", ""],
    ["podcol43", 5, 0, 0, 1, 1, "", ""],
    ["podcol44", 5, 0, 0, 1, 1, "", ""],
    ["podcol45", 5, 0, 0, 1, 1, "", ""],
    ["podcol46", 5, 0, 0, 1, 1, "", ""],
    ["podcol47", 5, 0, 0, 1, 1, "", ""],
    ["podcol48", 5, 0, 0, 1, 1, "", ""],
    ["podcol49", 5, 0, 0, 1, 1, "", ""],
    ["podcol50", 5, 0, 0, 1, 1, "", ""],
    ["podcol51", 5, 0, 0, 1, 1, "", ""],
    ["podcol52", 5, 0, 0, 1, 1, "", ""],
    ["podcol53", 5, 0, 0, 1, 1, "", ""],
    ["podcol54", 5, 0, 0, 1, 1, "", ""],
    ["podcol55", 5, 0, 0, 1, 1, "", ""],
    ["podcol56", 5, 0, 0, 1, 1, "", ""],
    ["podcol57", 5, 0, 0, 1, 1, "", ""],
    ["podcol58", 5, 0, 0, 1, 1, "", ""],
    ["podcol59", 5, 0, 0, 1, 1, "", ""],
    ["podcol60", 5, 0, 0, 1, 1, "", ""],
    ["avatarpad1", 2, 0, 0, 1, 1, "", ""],
    ["avatarpad2", 2, 0, 0, 1, 1, "", ""],
    ["avatarpad3", 2, 0, 0, 1, 1, "", ""],
    ["avatarpad4", 2, 0, 0, 1, 1, "", ""],
    ["avatarpad5", 2, 0, 0, 1, 1, "", ""],
    ["avatarpad6", 2, 0, 0, 1, 1, "", ""],
    ["avatarpad7", 2, 0, 0, 1, 1, "", ""],
    ["avatarpad8", 2, 0, 0, 1, 1, "", ""],
    ["avatardoor1", 2, 0, 0, 1, 1, "", ""],
    ["avatardoor2", 2, 0, 0, 1, 1, "", ""],
    ["avatardoor3", 2, 0, 0, 1, 1, "", ""],
    ["avatardoor4", 2, 0, 0, 1, 1, "", ""],
    ["avatardoor5", 2, 0, 0, 1, 1, "", ""],
    ["avatardoor6", 2, 0, 0, 1, 1, "", ""],
    ["avatardoor7", 2, 0, 0, 1, 1, "", ""],
    ["avatardoor8", 2, 0, 0, 1, 1, "", ""],
    ["ptreasure1", 13, 39, 0, 1, 1, "", ""],
    ["ptreasure2", 13, 39, 0, 1, 1, "", ""],
    ["ptreasure3", 13, 39, 0, 1, 1, "", ""],
    ["ptreasure4", 13, 39, 0, 1, 1, "", ""],
    ["ptreasure5", 13, 39, 0, 1, 1, "", ""],
    ["ptreasure6", 13, 39, 0, 1, 1, "", ""],
    ["ptreasure7", 13, 39, 0, 1, 1, "", ""],
    ["ptreasure8", 13, 39, 0, 1, 1, "", ""],
    ["m_grave", 3, 0, 0, 1, 1, "", ""],
    ["m_forest", 3, 0, 0, 1, 1, "", ""],
    ["m_patch", 3, 0, 0, 1, 1, "", ""],
    ["m_lab", 3, 0, 0, 1, 1, "", ""],
    ["tesla", 7, 0, 0, 1, 1, "", ""],
    ["m_hive", 3, 0, 0, 1, 1, "", ""],
    ["m_swamp", 3, 0, 0, 1, 1, "", ""],
    ["s_tesla01", 16, "ajq_teslacoillp", 0, 1, 1, "", ""],
    ["s_tesla02", 16, "ajq_teslacoillp", 0, 1, 1, "", ""],
    ["s_tesla03", 16, "ajq_teslacoillp", 0, 1, 1, "", ""],
    ["s_tesla04", 16, "ajq_teslacoillp", 0, 1, 1, "", ""],
    ["s_tesla05", 16, "ajq_teslacoillp", 0, 1, 1, "", ""],
    ["s_tesla06", 16, "ajq_teslacoillp", 0, 1, 1, "", ""],
    ["s_tesla07", 16, "ajq_teslacoillp", 0, 1, 1, "", ""],
    ["s_tesla08", 16, "ajq_teslacoillp", 0, 1, 1, "", ""],
    ["s_tesla09", 16, "ajq_teslacoillp", 0, 1, 1, "", ""],
    ["s_mark_lp01", 16, "ajq_flamelp", 0, 0, 1, "", ""],
    ["s_mark_lp02", 16, "ajq_flamelp", 0, 0, 1, "", ""],
    ["s_mark_lp03", 16, "ajq_flamelp", 0, 0, 1, "", ""],
    ["s_mark_lp04", 16, "ajq_flamelp", 0, 0, 1, "", ""],
    ["s_mark_lp05", 16, "ajq_flamelp", 0, 0, 1, "", ""],
    ["s_mark_lp06", 16, "ajq_flamelp", 0, 0, 1, "", ""],
    ["s_lantern01", 16, "ajq_lanternhoverlp", 0, 0, 1, "", ""],
    ["s_lantern02", 16, "ajq_lanternhoverlp", 0, 0, 1, "", ""],
    ["s_lantern03", 16, "ajq_lanternhoverlp", 0, 0, 1, "", ""],
    ["s_lantern04", 16, "ajq_lanternhoverlp", 0, 0, 1, "", ""],
    ["s_lantern05", 16, "ajq_lanternhoverlp", 0, 0, 1, "", ""],
    ["s_lantern06", 16, "ajq_lanternhoverlp", 0, 0, 1, "", ""],
    ["s_tree", 16, "ajq_candytreelp", 0, 1, 1, "", ""],
    ["s_wall", 16, "ajq_phntmwalllp", 0, 1, 1, "", ""],
    ["s_tesla", 16, "ajq_teslacrystalballlp", 0, 1, 1, "", ""],
    ["s_respawn", 16, "ajq_spawnpointlp", 0, 1, 1, "", ""],
    ["s_exit", 16, "ajq_portalgatelp", 0, 1, 1, "", ""],
    ["teslas", 2, 0, 0, 1, 1, "", ""],
    ["diff_level", 7, 0, 0, 1, 1, "", ""],
    ["live_players", 7, 0, 1, 0, 1, "", ""],
    ["playermember", 7, 0, 0, 1, 1, "", ""]
];
const ENEMIES = ACTORS.map(row => row[0]).filter(name => /^proto\d+$/.test(name));
const PODS = ACTORS.map(row => row[0]).filter(name => /^_r_pod\d+$/.test(name));
const slotOf = name => (Number(name.match(/\d+/)[0]) - 1) % SLOTS + 1;
const two = n => String(n).padStart(2, "0");

const set = (q, name, state, visible, click) => q.send("qcmd", 1, name, state, visible, click);
const world = q => (q.vars.bs = q.vars.bs || {up: new Set(), down: new Set(), drops: new Set(), slot: 0, started: false,
  standing: {}, lit: {}, done: {}, lab: new Set(), goals: {}, alpha: 0});

// one slot of the clock: its enemies wake or come back, its pod comes back
const wake = (q, slot) => {
  const w = world(q);
  for (const name of ENEMIES.filter(enemy => slotOf(enemy) === slot)) {
    if (w.up.has(name)) {
      continue;
    }
    if (w.down.has(name)) {
      q.send("qrestore", name, 100);
    }
    q.send("qswfs", name, "appear");
    q.send("qsp", name, name.replace("proto", "protopath"));
    set(q, name, 1, 1, 1);
    w.down.delete(name);
    w.up.add(name);
  }
  const pod = `_r_pod${two(slot)}`;
  if (w.down.has(pod)) {
    set(q, `podcol${two(slot)}`, 0, 1, 0);
    q.send("qrestore", pod, 100);
    q.send("qswfs", pod, "appear");
    set(q, pod, 0, 1, 1);
    w.down.delete(pod);
  }
};
const clock = q => {
  const w = world(q);
  w.slot = w.slot % SLOTS + 1;
  wake(q, w.slot);
  q.after(TICK, () => clock(q));
};

// the gathering spots, once a second: a place someone stands in lights; one
// left goes out; all four lit at once gives each of them orbs
const gather = q => {
  const w = world(q);
  for (const spot of SPOTS) {
    const id = two(spot);
    for (const place of PLACES) {
      const vol = `socvol${id}${place}`;
      // (only those still playing)
      const playing = new Set(q.players());
      for (const id of [...(w.standing[vol] || [])]) {
        if (!playing.has(id)) {
          w.standing[vol].delete(id);
        }
      }
      const here = (w.standing[vol] || new Set()).size > 0;
      if (here && !w.lit[vol]) {
        w.lit[vol] = true;
        set(q, `ppoint${id}${place}`, 2, 1, 0);
      }
      else if (!here && w.lit[vol]) {
        w.lit[vol] = false;
        set(q, vol, 1, 1, 1);
        set(q, `ppoint${id}${place}`, 1, 1, 0);
        set(q, vol, 0, 1, 1);
      }
    }
    const lit = PLACES.filter(place => w.lit[`socvol${id}${place}`]).length;
    if (lit !== (w.count || {})[id]) {
      (w.count = w.count || {})[id] = lit;
      q.send("qcmdVT", 1, `marker${id}`, lit, 0, 0);
      set(q, `s_lantern${id}`, lit ? 1 : 99, lit ? 1 : 0, 0);
      set(q, `s_mark_lp${id}`, lit ? 1 : 99, lit ? 1 : 0, 0);
    }
    // all four, and not again until the spot has emptied
    if (lit === PLACES.length && !w.done[id]) {
      w.done[id] = true;
      const who = new Set(PLACES.flatMap(place => [...(w.standing[`socvol${id}${place}`] || [])]));
      for (const player of who) {
        const them = q.as(player);
        if (them) {
          them.orbs(SOCIAL_REWARD);
        }
      }
    }
    if (lit === 0) {
      w.done[id] = false;
    }
  }
  q.after(SOCIAL_TICK, () => gather(q));
};

module.exports = {
  defId: 46,
  title: "Bitter Sweets",
  rooms: {start: ROOM},
  written: "2020-09-17 18:50:31",
  objective: 19091,
  public: true, // joined while it runs, by up to 8
  maxPlayers: 8,
  actors: ACTORS,
  // "!adv" commands of its own, for testing (staff)
  debug: {
    help: "orbs N (orbs for you) | group [SPOT] (a gathering spot, 1-6, lit as if four stood on it: its orbs for you)",
    orbs(q, [count]) {
      if (!/^\d+$/.test(count || "")) {
        return `You have ${q.orbs()} orbs.`;
      }
      q.orbs(Number(count));
      return `${count} orbs given: ${q.orbs()} now.`;
    },
    group(q, [spot]) {
      const n = Number(spot || 1);
      if (!SPOTS.includes(n)) {
        return "Which spot? 1-6.";
      }
      const id = two(n);
      q.send("qcmdVT", 1, `marker${id}`, PLACES.length, 0, 0);
      set(q, `s_lantern${id}`, 1, 1, 0);
      set(q, `s_mark_lp${id}`, 1, 1, 0);
      q.orbs(SOCIAL_REWARD);
      // and back as it was, on the spots' next round
      (world(q).count || {})[id] = PLACES.length;
      return `Spot ${n} lit: ${SOCIAL_REWARD} orbs for you (${q.orbs()} now).`;
    },
  },
  on: {
    // each player's screen: what orbs are for, the goal counts
    loaded(q) {
      q.send("qcmdVT", 1, "orbnpcid", 247, 0, 0);
      q.send("qsndpk", 3590);
      q.send("qcmdVT", 1, "dropcandy", 1, 0, 0);
      GOALS.concat([1000]).forEach((goal, i) => q.send("qcmdVT", 1, `gui_goal${i + 1}a`, goal, 0, 0));
    },
    trigger: {
      // each player, as their game is ready: Alpha's welcome. the first
      // starts the clock and the gathering spots.
      questready(q) {
        const w = world(q);
        q.tell("qposturi", "/adventure12-bittersweets/#00-start/#0#001");
        q.tell("qicon", "alpha01", 1);
        q.tell("qcmd", 3, 0, "alpha01a", 0, 19088);
        q.tell("qcmdVT", 1, "orbnpcid", 247, 0, 0);
        GOALS.concat([1000]).forEach((goal, i) => q.tell("qcmdVT", 1, `gui_goal${i + 1}a`, goal, 0, 0));
        if (w.started) {
          return;
        }
        w.started = true;
        q.send("qcmdVT", 1, "setup", 1, 0, 0);
        set(q, "exit_portal", 1, 1, 0);
        SPOTS.forEach((spot, i) => q.after(1000 * (i + 1), () => {
          if (STUMPS[spot]) {
            set(q, `stump${spot}`, STUMPS[spot], 1, 0);
          }
          for (const place of PLACES) {
            set(q, `ppoint${two(spot)}${place}`, 1, 1, 0);
          }
        }));
        q.after(1000, () => clock(q));
        q.after(1500, () => gather(q));
      },
      // Alpha: her next line
      alpha01(q) {
        const w = world(q);
        q.tell("qcmd", 3, 0, "alpha01", w.alpha, ALPHA[w.alpha]);
      },
      // the exit asks first
      exit_vol(q) {
        q.tell("qcmd", 3, 1, "alpha01b", 0, 19092);
      },
    },
    triggerLike: [
      // an orb or a gem dropped: whoever gets there first
      [/__give_(orb|gem)$/, (q, name) => {
        const w = world(q);
        if (!w.drops.has(name)) {
          return;
        }
        w.drops.delete(name);
        q.send("qad", name, 0, 0);
        if (name.endsWith("__give_gem")) {
          q.gems(1);
        }
        else {
          q.orbs(name.startsWith("proto") ? ORB.enemy : ORB.pod);
        }
      }],
      // the goal button: a prize once the orbs are there, each goal once
      [/^gui_goal(\d)$/, (q, name) => {
        const w = world(q);
        const n = Number(name.slice(-1));
        const mine = w.goals[q.me] = w.goals[q.me] || {claimed: new Set(), pending: 0};
        if (n < 1 || n > GOALS.length || mine.claimed.has(n) || q.orbs() < GOALS[n - 1]) {
          return;
        }
        mine.claimed.add(n);
        mine.pending = n;
        q.offerOwn(prizesFor(n));
      }],
      [/^m_[a-z]+$/, (q, name) => {
        const w = world(q);
        if (MUSIC[name]) {
          q.tell("qmusic", 0);
          q.tell("qmusic", MUSIC[name]);
        }
        // the lab's tesla coils run while anyone is in the lab
        const before = w.lab.size;
        if (name === "m_lab") {
          w.lab.add(q.me);
        }
        else {
          w.lab.delete(q.me);
        }
        if (Boolean(before) !== Boolean(w.lab.size)) {
          q.send("qcmdVT", 1, "tesla", w.lab.size ? 1 : 0, 0, 0);
          set(q, "teslas", w.lab.size ? 1 : 0, 1, 0);
        }
      }],
      [/^petblocker\d$/, (q, name) => {
        if (BLOCKERS[name]) {
          q.tell("qcmd", 2, name, BLOCKERS[name], 0);
        }
      }],
      [/^socialinfo\d+$/, (q, name) => {
        q.tell("qcmd", 2, name, 19711, 2);
      }],
      // stepping into a gathering place (the client sends it only for the right action)
      [/^socvol\d\d[a-d]$/, (q, name) => {
        const w = world(q);
        (w.standing[name] = w.standing[name] || new Set()).add(q.me);
      }],
    ],
    untriggeredLike: [
      [/^socvol\d\d[a-d]$/, (q, name) => {
        const w = world(q);
        (w.standing[name] || new Set()).delete(q.me);
      }],
    ],
    attackedLike: [
      // a candy enemy: beaten, and its orb drops
      [/^proto\d+$/, (q, name) => {
        const w = world(q);
        if (!w.up.has(name)) {
          return;
        }
        w.up.delete(name);
        w.down.add(name);
        q.send("qad", name, 6, 0, 0, 0, "");
        q.send("qspn", name, `${name}__give_orb`, 200, 247, 4, ORB.enemy, 0, 0, 0);
        set(q, name, 3, 1, 0);
        w.drops.add(`${name}__give_orb`);
      }],
      // a candy pod: broken, for a gem or an orb
      [/^_r_pod\d+$/, (q, name, x, y) => {
        const w = world(q);
        if (w.down.has(name)) {
          return;
        }
        w.down.add(name);
        const id = name.match(/\d+/)[0];
        const gem = Math.random() < GEM_CHANCE;
        const drop = `${name}__give_${gem ? "gem" : "orb"}`;
        q.send("qad", name, 10, 0, x || 0, y || 0, "");
        q.send("qspn", name, drop, 200, gem ? 399 : 247, gem ? 3 : 4, 1, 0, 0, 0);
        set(q, `podcol${id}`, 99, 0, 0);
        set(q, name, 2, 1, 0);
        w.drops.add(drop);
      }],
    ],
    answer: {
      // past each line Alpha goes on to the next
      alpha01(q) {
        const w = world(q);
        w.alpha = (w.alpha + 1) % ALPHA.length;
        set(q, "alpha01", w.alpha, 1, 1);
      },
      // the welcome and the lines after each prize: nothing more
      alpha01a() {},
      alpha0a() {},
      alpha0b() {},
      alpha0c() {},
      alpha0d() {},
      alpha0e() {},
      // "leave?": yes
      alpha01b(q, state, answer) {
        if (answer === "1") {
          q.tell("qcmd", 19);
        }
      },
    },
    // a prize picked: how far the player has come, and Alpha says so
    gifted(q) {
      const mine = (world(q).goals[q.me] || {});
      const n = mine.pending;
      if (!n) {
        return;
      }
      mine.pending = 0;
      q.tell("qposturi", `/adventure12-bittersweets/#${n}0-threshold${Math.min(n, 4)}/#0#001`);
      q.tell("qcmd", 3, 0, `alpha0${"abcde"[n - 1]}`, 0, GOAL_TALK[n - 1]);
    },
  },
};
