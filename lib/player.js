"use strict";

const defpacks = require("./defpacks.js");
const wearRules = require("./wearrules.js");
// accessors over an account's animals, pets and items (shape: accounts.js).

// SbiConstants.CURRENCY_NAMES; an item's currencyType indexes into this.
const CURRENCIES = ["gems", "tickets", "orbs", "diamonds", "straw", "bamboo", "wood", "stone", "silver", "gold", "gemstone", "ecoCredits"];
const CURRENCY_DIAMONDS = 3;

// what a diamond def's refId points at (DiamondItem.isAccessory and friends).
const DIAMOND_TYPES = {clothing: "0", denItem: "1", pet: "2", avatar: "3", denRoom: "4", customAvatar: "5"};

// shops send a diamond def id instead of the item's own def id when the item
// is priced in diamonds. resolves either form to {defId, cost, currencyType},
// with `ownPrice(defId)` giving {cost, currencyType} for an ordinary item; null
// when the diamond def does not exist or is not of the expected kind.
const resolvePurchase = (defId, isDiamond, kind, ownPrice) => {
  if (!isDiamond) {
    return {defId: Number(defId), ...ownPrice(defId)};
  }
  const diamond = defpacks.diamondDef(defId);
  return diamond && diamond.type === DIAMOND_TYPES[kind]
    ? {defId: Number(diamond.refId), cost: Number(diamond.cost), currencyType: CURRENCY_DIAMONDS}
    : null;
};

const activeAvatar = account => account.avatars.find(avatar => avatar.perUserAvId === account.activeAvatar) || account.avatars[0];

// the requested animal, or the one in use when the id is unknown.
const avatarById = (account, perUserAvId) =>
  account.avatars.find(avatar => avatar.perUserAvId === Number(perUserAvId)) || activeAvatar(account);

const activePet = account => account.pets.find(pet => pet.inv === activeAvatar(account).petInvId) || null;

// The persisted state is also filtered here, not only where a player tries
// to put an item on. That keeps an old/corrupt pairing from reaching player
// cards or other people in a room while a dashboard rule is being applied.
const wornItems = (account, avatar) => account.items.filter(item => item.on.includes(avatar.avInvId)
  && wearRules.mayWear(item.def, avatar.type));

// item.EquippedAvatars: comma-separated 32-bit words, one bit per avInvId of
// an animal wearing the item.
// With an account, omit stale pairings that are no longer allowed. The full
// inventory protocol otherwise exposes those bits and a later avatar switch
// can appear to revive a prohibited item.
const equippedBits = (item, account = null) => {
  const words = [0];
  const wornBy = account ? item.on.filter(avInvId => {
    const avatar = account.avatars.find(candidate => candidate.avInvId === avInvId);
    return avatar && wearRules.mayWear(item.def, avatar.type);
  }) : item.on;
  for (const avInvId of wornBy) {
    const word = avInvId >>> 5;
    while (words.length <= word) {
      words.push(0);
    }
    words[word] = (words[word] | (1 << (avInvId & 31))) >>> 0;
  }
  return words.join(",");
};

// how much an account may hold, as the patched client counts
// (shop.ShopManager), and how many pieces one animal may wear at once: the
// seven places clothes go, three to a place, and a few to spare. everyone in
// a room is sent what each animal there wears.
const MAX_ITEMS = 5000;
const MAX_DEN_ITEMS = 5000;
const MAX_WORN = 24;
// has the account room for `count` more? `kind` is "items" (clothing) or "denItems".
const hasRoom = (account, kind, count = 1) => account[kind].length + count <= (kind === "items" ? MAX_ITEMS : MAX_DEN_ITEMS);

// adds a clothing item to an account's inventory (the caller saves); null
// when the inventory is full.
const addClothing = (account, defId, color) => {
  if (!hasRoom(account, "items")) {
    return null;
  }
  const item = {inv: account.nextInv++, def: Number(defId), color: Number(color), on: []};
  account.items.push(item);
  return item;
};

// ItemXtCommManager.itemsChangedListResponse ("2" = inventory changed): tells
// a connected player about a new item. [type, inUse, perUserAvId, username,
// color, addedCount, removedCount, (invIdx, defId)..., removedInvIdx...]
const sendClothingAdded = (session, item) => {
  if (!item) {
    return; // the inventory was full
  }
  session.sendXt("il", -1, 2, 0, activeAvatar(session.account).perUserAvId, session.account.username, item.color, 1, 0, item.inv, item.def);
};

// the same message, for items that left the inventory (one inventory id or
// a list of them).
const sendClothingRemoved = (session, inv) => {
  const gone = [].concat(inv);
  session.sendXt("il", -1, 2, 0, activeAvatar(session.account).perUserAvId, session.account.username, 0, 0, gone.length, ...gone);
};

// what goes in the "days since last login" field of a player's card. the
// patched client (swf-src/BuddyCard.as) takes it as the time the player was
// last seen, in seconds, to show as a time of day and a date; -2 is "online
// now" and -1 "unknown", which the official client showed as "More than 30
// Days".
const LAST_SEEN_ONLINE = -2;
const LAST_SEEN_UNKNOWN = -1;
const lastSeenField = (account, isOnline) => (isOnline ? LAST_SEEN_ONLINE : account.lastSeen || account.lastLogin || LAST_SEEN_UNKNOWN);

// the order a player put an animal's clothes in (the avatar editor's layers
// panel: swf-src/AvatarLayersPanel.as), kept as avatar.layerOrder, the
// inventory ids of the pieces bottom first. "xlo" [username, perUserAvId,
// count, (def, inv)...] tells a client, before each list of what the animal
// wears (sendItemList), and AvatarUtility.resolveLayerOrder paints it so:
// pieces the order does not name go in by their slot. only pieces it still
// wears are sent; count 0 is the game's own order (after "Default order").
// an animal never given one (no avatar.layerOrder) is told nothing: a client
// built before the panel would take an "xlo" for an unknown command.
const sendLayerOrder = (to, account, avatar) => {
  if (!Array.isArray(avatar.layerOrder)) {
    return;
  }
  const worn = new Map(wornItems(account, avatar).map(item => [item.inv, item]));
  const pieces = avatar.layerOrder.map(inv => worn.get(inv)).filter(Boolean);
  to.sendXt("xlo", -1, account.username, avatar.perUserAvId, pieces.length, ...pieces.flatMap(item => [item.def, item.inv]));
};

// the clothing items `pieces` in the order `order` (inventory ids, the
// bottom first) puts them, as the client paints them
// (AvatarUtility.resolveLayerOrder): a piece the order names keeps its place
// there; one it does not goes in by its layer, over the pieces of its own
// layer and under those of the layers above. null when there is no order.
const layerOf = item => Number((defpacks.itemDef(item.def) || {}).layerId) || 0;
const resolveLayerOrder = (pieces, order) => {
  if (!Array.isArray(order) || order.length === 0) {
    return null;
  }
  const left = pieces.filter(item => layerOf(item) > 3);
  const placed = [];
  for (const inv of order) {
    const index = left.findIndex(item => item.inv === Number(inv));
    if (index >= 0) {
      placed.push(...left.splice(index, 1));
    }
  }
  left.sort((one, two) => layerOf(one) - layerOf(two) || one.inv - two.inv);
  for (const item of left) {
    const above = placed.findIndex(other => layerOf(other) > layerOf(item));
    placed.splice(above < 0 ? placed.length : above, 0, item);
  }
  return placed;
};

const isUint = text => /^\d{1,10}$/.test(text) && Number(text) <= 0xFFFFFFFF;

module.exports = {MAX_ITEMS, MAX_DEN_ITEMS, MAX_WORN, hasRoom, CURRENCIES, DIAMOND_TYPES, resolvePurchase, activeAvatar, avatarById, activePet, wornItems, equippedBits, addClothing, sendClothingAdded, sendClothingRemoved, sendLayerOrder, resolveLayerOrder, lastSeenField, isUint};
