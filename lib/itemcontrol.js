"use strict";

const accounts = require("./accounts.js");
const customItems = require("./customitems.js");
const defpacks = require("./defpacks.js");
const wearRules = require("./wearrules.js");

// what staff who make items (items.create: admins and developers) may do
// about who has them:
//
// - lock an item out of the item finder (lib/admin.js): players no longer
//   find it there or take it from it. staff who may lock still do, with the
//   item marked locked. it stays wherever else it is (a shop, a trade).
// - take an item from one player: every one of it they have.
// - delete a custom item (lib/customitems.js): out of the game, and out of
//   every inventory.

const LOCKS_SETTING = "finderLocks";
const KINDS = ["clothing", "den"];

let locks = null; // Set of "kind:id"

const key = (kind, id) => `${kind}:${Number(id)}`;

const lockSet = () => {
  if (!locks) {
    let saved = [];
    try {
      saved = JSON.parse(accounts.setting(LOCKS_SETTING) || "[]");
    }
    catch {
      saved = [];
    }
    locks = new Set(Array.isArray(saved) ? saved.map(String) : []);
  }
  return locks;
};

const saveLocks = () => accounts.setSetting(LOCKS_SETTING, JSON.stringify([...lockSet()]));

const defOf = (kind, id) => (kind === "den" ? defpacks.denItemDef(id) : defpacks.itemDef(id));

const nameOf = (kind, id) => {
  const def = defOf(kind, id);
  if (!def) {
    return "";
  }
  return kind === "den" ? defpacks.string(def.nameStrId) || def.abbrName || "" : defpacks.string(def.titleStrId);
};

const describe = (kind, id) => `${nameOf(kind, id) || "(no name)"} (${kind === "den" ? "den item" : "clothing"} ${Number(id)})`;

// checks a kind and id typed by staff: {kind, id} of an item that exists, or {error}.
const item = (kind, id) => {
  const number = Number(id);
  if (!KINDS.includes(kind)) {
    return {error: "The kind is clothing or den."};
  }
  if (!Number.isInteger(number) || !defOf(kind, number) || (kind === "clothing" && !defpacks.clothingIds().includes(number))) {
    return {error: `No ${kind === "den" ? "den item" : "clothing"} with the id ${id}.`};
  }
  return {kind, id: number};
};

const isLocked = (kind, id) => lockSet().has(key(kind, id));

// returns {ok} or {error}.
const setLocked = (kind, id, locked) => {
  const found = item(kind, id);
  if (found.error) {
    return found;
  }
  const was = isLocked(found.kind, found.id);
  if (was === locked) {
    return {error: `${describe(found.kind, found.id)} is ${locked ? "already" : "not"} locked.`};
  }
  lockSet()[locked ? "add" : "delete"](key(found.kind, found.id));
  saveLocks();
  return {ok: `${describe(found.kind, found.id)} is ${locked ? "locked out of" : "back in"} the item finder.`};
};

const lockedList = () => [...lockSet()].map(entry => {
  const [kind, id] = entry.split(":");
  return {kind, id: Number(id), name: nameOf(kind, id)};
});

// The animals a moderator can select in the dashboard. Avatar types, rather
// than a hand-written list of species, keep this correct for packs added in
// a later game build.
const wearAnimals = () => defpacks.avatarTypes().sort((one, two) => one - two).map(type => {
  const def = defpacks.avatarDef(type) || {};
  return {id: Number(type), name: defpacks.string(def.titleStrRef || def.nameStrId) || def.abbrName || `Animal ${type}`};
});

const wearRuleList = () => wearRules.all().flatMap(rule => {
  const found = item("clothing", rule.id);
  return found.error ? [] : [{id: found.id, name: nameOf(found.kind, found.id), blockedTypes: rule.blocked}];
});

// Remove a new restriction from every possible display of an item. A clothing
// association has an avatar slot; a mannequin keeps the inventory ids it
// wears on the den item. Both must be cleaned or a rule can be bypassed by
// switching animals or visiting a den.
const removeBlockedUses = (account, itemId, blocked) => {
  const disallowedAvatarSlots = new Set(account.avatars.filter(avatar => blocked.has(Number(avatar.type))).map(avatar => avatar.avInvId));
  const matchingInventory = new Set(account.items.filter(piece => piece.def === itemId).map(piece => piece.inv));
  let removed = 0;
  let clothingChanged = false;
  let mannequinChanged = false;
  for (const piece of account.items) {
    if (piece.def !== itemId || !Array.isArray(piece.on)) {
      continue;
    }
    const kept = piece.on.filter(avInvId => !disallowedAvatarSlots.has(avInvId));
    if (kept.length !== piece.on.length) {
      removed += piece.on.length - kept.length;
      piece.on = kept;
      clothingChanged = true;
    }
  }
  for (const denItem of account.denItems) {
    const mannequinType = Number((defpacks.denItemDef(denItem.def) || {}).mannequinAvatarDefId);
    if (!blocked.has(mannequinType) || !denItem.mannequin) {
      continue;
    }
    // pieces: what it wears (lib/dens.js); worn: the five a mannequin saved before that kept.
    const {mannequin} = denItem;
    const pieces = Array.isArray(mannequin.pieces) ? mannequin.pieces : (Array.isArray(mannequin.worn) ? mannequin.worn.map(Number).filter(Boolean) : []);
    const kept = pieces.filter(inv => !matchingInventory.has(Number(inv)));
    if (kept.length !== pieces.length) {
      removed += pieces.length - kept.length;
      mannequin.pieces = kept;
      delete mannequin.worn;
      mannequinChanged = true;
    }
  }
  return {changed: clothingChanged || mannequinChanged, mannequinChanged, removed};
};

// Make a clothing item unavailable to the selected animal types. `world`
// refreshes games and den visitors after the persistent state is cleaned.
const setWearRule = (id, blockedTypes, world) => {
  const found = item("clothing", id);
  if (found.error) {
    return found;
  }
  const animals = wearAnimals();
  const allowed = new Set(animals.map(animal => animal.id));
  if (!Array.isArray(blockedTypes) || blockedTypes.length > allowed.size || !blockedTypes.every(Number.isInteger)
    || blockedTypes.some(type => !allowed.has(type))) {
    return {error: "Choose only animals from the list."};
  }
  const blocked = [...new Set(blockedTypes)].sort((one, two) => one - two);
  const changedRule = wearRules.setBlockedTypes(found.id, blocked).changed;
  let accountsChanged = 0;
  let removed = 0;
  const blockedSet = new Set(blocked);
  for (const account of accounts.all()) {
    const cleaned = removeBlockedUses(account, found.id, blockedSet);
    if (!cleaned.changed) {
      continue;
    }
    accountsChanged++;
    removed += cleaned.removed;
    accounts.save(account);
    world.wearRulesChanged(account, cleaned.mannequinChanged);
  }
  // Packs downloaded after this moment, and games already open, use the
  // same rule-to-flag transformation. Server checks above remain authority.
  defpacks.invalidateClientItemPack();
  customItems.sendClothingDefs([found.id]);
  const animalNames = blocked.map(type => animals.find(animal => animal.id === type).name);
  const subject = describe(found.kind, found.id);
  const suffix = blocked.length ? `cannot be worn by ${animalNames.join(", ")}.` : "can be worn by every animal again.";
  return {ok: `${subject} ${suffix}${removed ? ` Took it off ${removed} existing use${removed === 1 ? "" : "s"}.` : ""}`,
    detail: `clothing ${found.id}; blocked types ${blocked.join(",") || "none"}; ${accountsChanged} account${accountsChanged === 1 ? "" : "s"} changed`, changed: changedRule};
};

// every one of an item an account has, out of its inventory (and its trade
// list). `world` tells a game playing (lib/world.js itemsTaken). returns how
// many went.
const takeFromAccount = (account, kind, id, world) => {
  const number = Number(id);
  const collection = kind === "den" ? "denItems" : "items";
  const gone = account[collection].filter(entry => entry.def === number);
  if (!gone.length) {
    return 0;
  }
  const invs = new Set(gone.map(entry => entry.inv));
  account[collection] = account[collection].filter(entry => !invs.has(entry.inv));
  account.tradeList = account.tradeList.filter(entry => !invs.has(entry.inv));
  accounts.save();
  world.itemsTaken(account, kind, [...invs], kind === "clothing" && gone.some(entry => entry.on.length > 0));
  return gone.length;
};

// from one player, by username. returns {ok, count} or {error}.
const take = (username, kind, id, world) => {
  const account = accounts.byName(username);
  if (!account) {
    return {error: `No player called ${username}.`};
  }
  // a deleted custom item can be gone from the tables and still be owned:
  // the id is taken as it is then.
  const found = item(kind, id);
  if (found.error && !(KINDS.includes(kind) && Number.isInteger(Number(id)))) {
    return found;
  }
  const count = takeFromAccount(account, kind, id, world);
  return count ? {ok: `Took ${count} of ${describe(kind, id)} from ${account.username}.`, count}
    : {error: `${account.username} has no ${describe(kind, id)}.`};
};

// a custom item out of the game, and out of everyone's inventory. returns {ok} or {error}.
const deleteCustom = (kind, id, world) => {
  const entry = customItems.get(kind, id);
  if (!entry) {
    return {error: "No such custom item."};
  }
  let count = 0;
  for (const account of accounts.all()) {
    count += takeFromAccount(account, kind, entry.id, world);
  }
  if (entry.art) {
    require("./itemart.js").remove(kind, entry.id);
  }
  customItems.remove(kind, entry.id);
  if (lockSet().delete(key(kind, entry.id))) {
    saveLocks();
  }
  if (kind === "clothing") {
    wearRules.forget(entry.id);
  }
  return {ok: `Deleted ${entry.name} (${kind === "den" ? "den item" : "clothing"} ${entry.id})${count ? `, and took ${count} from players` : ""}.`};
};

module.exports = {isLocked, setLocked, lockedList, wearAnimals, wearRuleList, setWearRule, take, deleteCustom};
