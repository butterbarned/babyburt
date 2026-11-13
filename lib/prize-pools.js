"use strict";

// Prizes picked at random where the official game does, for adventure
// scripts made with the maker (which writes the prizes recorded into the
// script, the same every time). kept apart from those scripts, so the
// maker writing one again does not undo it. adventures.js passes every
// end-of-adventure offer through reroll().
//
// hard mode of Return of the Phantoms (14) and The Phantom Portal (16):
// the wiki (animaljam.fandom.com/wiki/Return_of_the_Phantoms,
// .../The_Phantom_Portal) has three of the five chests at the end as "random
// clothing item", one as "750 or 1,500 gems" and one as 1,000 gems. all five
// clothing items recorded there (Rare Mech Angel Wings, Freedom Cape, Rare
// Star Cape, Tiara, Pink Purse) are on the wiki's list for those
// adventures' animal passages, among the ones marked hard mode only: that
// list is taken here. [item, "colours"]
const HARD_CLOTHING = [
  [212, "-160890623"], // Freedom Bands
  [213, "-261551589"], // Freedom Cape
  [214, "1777358582"], // Freedom Helmet
  [210, "-985517"], // Freedom Mask
  [211, "-160864528"], // Freedom Wings
  [247, "70522864,137162280,23729944,342518056,1765042928,1765042688,104098544,-2026607888"], // Jolly Elf Hat
  [240, "404224121,-15067152,387379446,1359519111,763500311,-1570113415,-2112358279,-697698183"], // Lei
  [156, "2020212992,-1601460736,614535168,1400378112,85501440,1449748565,-1029548800,1463838976"], // Old Blanket
  [338, "677794049"], // Pink Purse
  [155, "459580521,187389289,347255731,645413434,-1024856983,1470276713,-1109006743,1399406697"], // Pirate Sword
  [342, "436606627,-1914934366,422321577,1097405801,-1681751317,672409701,1416036417,-1952523597"], // Rare Bow And Arrows
  [138, "1463515451,272303931,1761688321,705701691,671098683,440105275,20660283,-1053066949"], // Rare Fox Hat
  [226, "402745194,788616550,1728140651,671634794,1426155370,1804953450,-661297302,437610346"], // Rare Frankenstein Mask
  [64, "1767127893,-1313787750,437917720,1767194727,1044266628,352387366,353724971,993727528"], // Rare Glove
  [400, "1363214593"], // Rare Heart Locket
  [467, "469703935"], // Rare Lei
  [406, "1466636075"], // Rare Mech Angel Wings
  [218, "1463838527"], // Rare Scary Bat Wings
  [217, "1398232598"], // Rare Scary Cat Hat
  [393, "-201326592"], // Rare Spiked Hair
  [413, "-417659113"], // Rare Star Cape
  [386, "1393890815"], // Rare Tiara
  [275, "1077897321,1396664169,22247785,88063337,-2076196759,-1034693015,-1621899159,1431519593"], // Shark Fin
  [427, "1432961365"], // Silver Glove
  [136, "1343566129,386478185,991627035,739579241,672470331,706024753,1714565425,806688049"], // Tiara
  [148, "1785331712,572653568,673710080,1734803456,-748027904,-1033240576,2036989952,2020212736"], // Worn Blanket
];
const HARD_GEMS = [750, 1500];

// the chests behind the animal passages (the fox's in The Phantom Portal,
// the arctic wolf's in Return of the Phantoms): one of these in normal mode,
// these and the hard-mode-only ones above in hard mode (the wiki's lists).
// [item, "colours"]
const PASSAGE_CLOTHING = [
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
// the lion's passage (The Phantom Portal, hard mode only): only the Slingshot
const SLINGSHOT = [555, "202921279,203117887,203248959,202724671,203773247,202855743,207050047,206853439"];

const pickOne = list => list[Math.floor(Math.random() * list.length)];

const REROLL = {
  // "DEF" or "DEFh" for hard mode
  "14h": gifts => hardEnd(gifts),
  "16h": gifts => hardEnd(gifts),
};

// each clothing prize a different one, in any of its colours; the 750 or
// 1,500 gems one either
const hardEnd = gifts => {
  const left = [...HARD_CLOTHING];
  return gifts.map(([kind, value, extra]) => {
    if (kind === 2 && left.length) {
      const [item, colours] = left.splice(Math.floor(Math.random() * left.length), 1)[0];
      return [2, item, Number(pickOne(colours.split(",")))];
    }
    if (kind === 3 && HARD_GEMS.includes(value)) {
      const gems = pickOne(HARD_GEMS);
      return [3, gems, gems];
    }
    return [kind, value, extra];
  });
};

const reroll = (script, difficulty, gifts) => {
  const how = REROLL[`${script.defId}${difficulty === 1 ? "h" : ""}`];
  return how ? how(gifts) : gifts;
};

// a passage chest's clothing for this run, the same for everyone: [item, colour]
const passageClothing = (q, chest, {hard = false, only = null} = {}) => {
  const rolled = (q.vars.passagePrizes = q.vars.passagePrizes || {});
  if (!rolled[chest]) {
    const [item, colours] = only || pickOne(hard ? [...PASSAGE_CLOTHING, ...HARD_CLOTHING] : PASSAGE_CLOTHING);
    rolled[chest] = [item, Number(pickOne(colours.split(",")))];
  }
  return rolled[chest];
};

module.exports = {reroll, passageClothing, SLINGSHOT};
