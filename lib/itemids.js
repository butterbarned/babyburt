"use strict";

// the ids this server's own items take, by kind. den item ids and clothing
// ids are two lists apart (a den item and a piece of clothing may have the
// same id). den item ids stay below 65536: the game asks for a den item's
// file as items/<id << 16 | n>, a 32-bit number.
//
// den items
//   1-5925        the game's own
//   6001-9999     extra music (lib/extramusic.js)
//   10000-49999   content packs (lib/contentpacks.js)
//   50000-65535   custom items (lib/customitems.js), but for the ids content
//                 items had before they were moved into 10000-49999
//                 (lib/contentmove.js; 55000 on), which go to nothing again
// clothing
//   1-4606        the game's own
//   10000-14999   content packs (none yet)
//   50000-65535   custom items
//
// swf-src/DenEditor.as isContentItem has the content den range too (they
// show in the den editor's Custom tab), as does tools/item-ids.js (which
// lists what each range holds); a change here is a change there.

const CONTENT_DEN = {first: 10000, last: 49999, strings: 9400000};
const CONTENT_CLOTHING = {first: 10000, last: 14999};
const CUSTOM = {
  den: [{first: 50000, last: 65535}],
  clothing: [{first: 50000, last: 65535}],
};

const within = (id, range) => id >= range.first && id <= range.last;

// an id the content packs have, or may give, of that kind
const isContentId = (kind, id) => {
  const n = Number(id);
  return within(n, kind === "den" ? CONTENT_DEN : CONTENT_CLOTHING);
};

// an id custom items may have
const isCustomId = (kind, id) => (CUSTOM[kind] || []).some(range => within(Number(id), range));

// the id a new custom item of that kind takes after `last` (the highest a
// custom item of that kind has; none: 0), or null with none left
const nextCustomId = (kind, last) => {
  for (const range of CUSTOM[kind] || []) {
    const id = Math.max(range.first, Number(last) + 1);
    if (id <= range.last) {
      return id;
    }
  }
  return null;
};

const size = ranges => ranges.reduce((sum, range) => sum + range.last - range.first + 1, 0);

module.exports = {CONTENT_DEN, CONTENT_CLOTHING, CUSTOM, isContentId, isCustomId, nextCustomId, size};
