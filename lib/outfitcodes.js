"use strict";

// outfit codes from the Burrow outfit tool (github.com/sharkinthedark/burrow-outfit-tool):
// base64 of JSON {a: animal, c: [3 colours], p: pattern, e: eyes,
// w: [[item id, [four palette indexes]], ...]}. the item ids are the game's
// clothing def ids, and the four indexes pack into the game's colour id
// (the tool's pack(): one byte each, the first highest). items the tool's
// players made for themselves have ids that are not numbers.

const MAX_CODE_LENGTH = 20000;
const MAX_ITEMS = 40;

// the tool's pack(): null for no colour it can make (a first byte of 0xFD,
// the game's mark for a custom colour, or anything not four bytes).
const packColour = indexes => {
  if (!Array.isArray(indexes) || indexes.length !== 4 || !indexes.every(v => v === null || (Number.isInteger(v) && v >= 0 && v <= 255))) {
    return null;
  }
  const [a, b, c, d] = indexes.map(v => v || 0);
  return a === 0xFD ? null : ((a << 24) | (b << 16) | (c << 8) | d) >>> 0;
};

// the items a code holds, [{id, color}] (color null: the item's own), and
// how many of them were not the game's (the tool's own items); null if it is
// not a code.
const decode = text => {
  const code = String(text || "").replace(/\s+/g, "");
  if (!code || code.length > MAX_CODE_LENGTH || !/^[A-Za-z0-9+/]+=*$/.test(code)) {
    return null;
  }
  let outfit;
  try {
    outfit = JSON.parse(Buffer.from(code, "base64").toString("utf8"));
  }
  catch {
    return null;
  }
  if (!outfit || typeof outfit !== "object" || !Array.isArray(outfit.w)) {
    return null;
  }
  const items = [];
  let foreign = 0;
  for (const worn of outfit.w.slice(0, MAX_ITEMS)) {
    const id = Array.isArray(worn) ? String(worn[0]) : "";
    if (!/^\d{1,9}$/.test(id)) {
      foreign++;
      continue;
    }
    items.push({id: Number(id), color: packColour(worn[1])});
  }
  return {items, foreign};
};

module.exports = {decode, packColour};
