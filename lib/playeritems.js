"use strict";

const accounts = require("./accounts.js");
const config = require("../config.js");
const creatorLimits = require("./creatorlimits.js");
const customItems = require("./customitems.js");
const dens = require("./dens.js");
const itemControl = require("./itemcontrol.js");
const modlog = require("./modlog.js");
const names = require("./names.js");
const {addClothing, sendClothingAdded} = require("./player.js");

// items players make for themselves (the patched client's Item Maker, in the
// settings menu): one of the game's clothing pieces or den items under a
// name of their own, as staff make them (lib/customitems.js), but free, never
// in a shop, and in the item finder for its maker only. the maker is given
// one at once; it can be worn, placed and traded like any other. a maker
// may delete their own; staff may delete anyone's (the moderator panel).
//
// "xcm" from the client: ["info"], ["make", kind, baseId, name],
// ["rename", kind, id, name], ["look", kind, id, "sticker" | "texture"]
// (how one with a picture is worn) or ["delete", kind, id]. its picture is
// uploaded over HTTP (lib/itemart.js, POST /api/itemart). the answer is always "xcm" [ok 1 | 0, what to say,
// left today, left in all, the maker's items as JSON]

// the admin's two switches (the admin panel's Items page): whether players
// may make items at all, and whether what they make (an item, or a new
// picture for one) waits for a moderator first (items.approve: the
// moderator panel's Review page), out of the game till then.
const ENABLED_SETTING = "playerItems";
const APPROVAL_SETTING = "playerItemApproval";
const enabled = () => accounts.setting(ENABLED_SETTING) !== "off";
const approvalOn = () => accounts.setting(APPROVAL_SETTING) === "on";
// pictures are seen by everyone who meets the item, so a player's waits for
// a moderator even when items do not: unless the admin turns this off too.
const ART_APPROVAL_SETTING = "playerArtApproval";
const artApprovalOn = () => accounts.setting(ART_APPROVAL_SETTING) !== "off";
const pictureWaits = () => approvalOn() || artApprovalOn();
const setSwitches = ({enabled: on, approval, artApproval}) => {
  if (on !== undefined) {
    accounts.setSetting(ENABLED_SETTING, on ? "on" : "off");
  }
  if (approval !== undefined) {
    accounts.setSetting(APPROVAL_SETTING, approval ? "on" : "off");
  }
  if (artApproval !== undefined) {
    accounts.setSetting(ART_APPROVAL_SETTING, artApproval ? "on" : "off");
  }
};

// ---- what keeps pictures players upload decent
//
// - a picture turned away (or taken off by a moderator) is remembered by
//   its SHA-256, and the same picture cannot be sent again;
// - each counts against its maker: at ART_STRIKES their uploads stop,
//   till a moderator lets them again (account.artBlocked);
// - an account younger than config.itemArtMinAccountHours may not upload.
const ART_STRIKES = 3;
const REFUSED_SETTING = "refusedArt";
const MAX_REFUSED = 5000;
let refused = null; // Set of SHA-256 hex

const refusedSet = () => {
  if (!refused) {
    let saved = [];
    try {
      saved = JSON.parse(accounts.setting(REFUSED_SETTING) || "[]");
    }
    catch {
      saved = [];
    }
    refused = new Set(Array.isArray(saved) ? saved.map(String) : []);
  }
  return refused;
};
const pictureRefused = hash => refusedSet().has(hash);

// {error} when `account` may not upload a picture now, else null. `local`:
// the request is from this machine (no wait for a new account).
const uploadRefusal = (account, local = false) => {
  if (account.artBlocked) {
    return {error: "A moderator has turned off picture uploads for your account."};
  }
  const hours = config.itemArtMinAccountHours;
  if (!local && hours > 0 && Math.floor(Date.now() / 1000) - (account.createdAt || 0) < hours * 3600) {
    return {error: `New accounts can add pictures after ${hours} hours. Try again later.`};
  }
  return null;
};

// stops or lets again one player's uploads; letting them again clears the
// pictures counted against them.
const setUploadsBlocked = (account, blocked) => {
  account.artBlocked = Boolean(blocked);
  if (!blocked) {
    account.artRefusals = 0;
  }
  accounts.save(account);
  return {ok: blocked ? `${account.username} can no longer upload pictures.` : `${account.username} can upload pictures again.`};
};

// a picture turned away or taken off: never again, and counted against its
// maker (not against staff, whose items have no maker). before it is removed.
// returns what to add to what the moderator is told.
const strike = entry => {
  const hash = require("./itemart.js").digestOf(entry.kind, entry.id);
  if (hash) {
    const set = refusedSet();
    set.add(hash);
    const kept = [...set].slice(-MAX_REFUSED);
    refused = new Set(kept);
    accounts.setSetting(REFUSED_SETTING, JSON.stringify(kept));
  }
  const maker = entry.ownerId === null ? null : accounts.byId(entry.ownerId);
  if (!maker) {
    return "";
  }
  maker.artRefusals = (maker.artRefusals || 0) + 1;
  if (maker.artRefusals >= ART_STRIKES && !maker.artBlocked) {
    maker.artBlocked = true;
    accounts.save(maker);
    modlog.record("system", "picture uploads stopped", maker.username, `${maker.artRefusals} pictures turned away`);
    return ` That is ${maker.artRefusals} for ${maker.username}: their picture uploads are stopped.`;
  }
  accounts.save(maker);
  return ` ${maker.username} has had ${maker.artRefusals} of ${ART_STRIKES} pictures turned away.`;
};

// a moderator takes an item's picture off, shown or waiting (after a report).
const takePicture = (kind, id) => {
  const entry = customItems.get(kind, id);
  if (!entry || !entry.art) {
    return {error: "That item has no picture of its own."};
  }
  const said = strike(entry);
  const result = require("./itemart.js").remove(kind, entry.id);
  return result.error ? result : {ok: `${result.ok}${said}`};
};

// how many a player may make, a day and in all: lib/creatorlimits.js (the
// admin panel), the server's or the player's own
const DAY = 86400;

const RENAMES_PER_HOUR = 10;

const now = () => Math.floor(Date.now() / 1000);
const renames = require("./limits.js").limiter(RENAMES_PER_HOUR, 3600000); // per account: each is sent to every game

const madeBy = account => customItems.list().filter(entry => entry.ownerId === account.id);

const left = account => {
  const {itemsPerDay, itemsInAll} = creatorLimits.forAccount(account);
  const mine = madeBy(account);
  const today = mine.filter(entry => entry.createdAt > now() - DAY).length;
  return {today: Math.max(0, Math.min(itemsPerDay - today, itemsInAll - mine.length)), inAll: Math.max(0, itemsInAll - mine.length),
    perDay: itemsPerDay, max: itemsInAll};
};

// returns {ok} or {error}.
const make = (session, kind, baseId, name) => {
  const {account} = session;
  if (!enabled()) {
    return {error: "The Item Maker is turned off on this server for now."};
  }
  if (!customItems.KINDS.includes(kind) || !/^\d+$/.test(String(baseId))) {
    return {error: "Choose an item to make yours from."};
  }
  if (!customItems.copyable(kind, Number(baseId))) {
    return {error: "That item cannot be made into one of your own. Choose another."};
  }
  const room = left(account);
  if (room.inAll === 0) {
    return {error: `You have made ${room.max} items, as many as you can have. Delete one to make another.`};
  }
  if (room.today === 0) {
    return {error: `You have made ${room.perDay} items today. Try again tomorrow.`};
  }
  const clean = String(name || "").trim().replace(/\s+/g, " ");
  if (clean && names.refused(clean)) {
    return {error: "That name is not allowed."};
  }
  const waits = approvalOn();
  const result = customItems.create(kind, {base: Number(baseId), name: clean, cost: 0, members: false, inShop: false}, account.username, account.id, waits);
  if (result.error) {
    return result;
  }
  const {item} = result;
  if (waits) {
    modlog.record(account.username, "item made by a player, waiting for approval", "", `${kind} ${item.id} ${item.name}`);
    return {ok: `${item.name} is waiting for a moderator to approve it. It is yours as soon as they do.`};
  }
  giveTo(account, item, session);
  modlog.record(account.username, "item made by a player", "", `${kind} ${item.id} ${item.name}`);
  return {ok: `Made ${item.name}. It is in your ${kind === "den" ? "den items" : "clothing"} now.`};
};

// one of the item, to its maker: now in their game if `session` is it
const giveTo = (account, item, session) => {
  if (item.kind === "den") {
    if (dens.giveDenItem(account, item.id) && session) {
      dens.sendDenItems(session);
    }
  }
  else {
    const given = addClothing(account, item.id, item.colors[0]);
    accounts.save(account);
    if (session) {
      sendClothingAdded(session, given);
    }
  }
};

// a moderator's answer about what waits (lib/modpanel.js, lib/panel.js): an
// item let in is given to its maker; one turned away is deleted, or only
// its picture taken away. `world` finds whether its maker is playing, and
// tells games about items taken. returns {ok} or {error}.
const review = (kind, id, approve, by, world) => {
  const entry = customItems.get(kind, id);
  if (!entry || (!entry.pending && !entry.artPending)) {
    return {error: "That is not waiting for approval."};
  }
  const maker = entry.ownerId === null ? null : accounts.byId(entry.ownerId);
  const wasNew = entry.pending;
  if (approve) {
    customItems.approve(kind, entry.id);
    if (wasNew && maker) {
      giveTo(maker, entry, world.findOnline(maker.username));
    }
    return {ok: wasNew ? `${entry.name} is in the game, and ${maker ? maker.username : "its maker"} has one.` : `${entry.name}'s picture is shown now.`};
  }
  if (wasNew) {
    itemControl.deleteCustom(kind, entry.id, world);
    return {ok: `${entry.name} was turned away and deleted.`};
  }
  const said = strike(entry);
  require("./itemart.js").remove(kind, entry.id);
  return {ok: `${entry.name}'s new picture was turned away.${said}`};
};

// a new name for one of their own (every game is told: customItems.update).
const rename = (account, kind, id, name) => {
  const entry = customItems.get(kind, id);
  if (!entry || entry.ownerId !== account.id) {
    return {error: "That is not one of your items."};
  }
  if (!renames.allow(account.id)) {
    return {error: "Too many renames. Try again in an hour."};
  }
  const clean = String(name || "").trim().replace(/\s+/g, " ");
  if (clean && names.refused(clean)) {
    return {error: "That name is not allowed."};
  }
  const result = customItems.update(kind, entry.id, {name: clean});
  return result.error ? result : {ok: `Renamed it ${result.item.name}.`};
};

// how one of their own is worn ("sticker" or "texture")
const setLook = (account, kind, id, mode) => {
  const entry = customItems.get(kind, id);
  if (!entry || entry.ownerId !== account.id) {
    return {error: "That is not one of your items."};
  }
  const result = customItems.setArtMode(kind, entry.id, String(mode));
  return result.error ? result : {ok: `${entry.name} is worn as ${mode === "texture" ? "its shape, with your picture in it" : "your picture"}.`};
};

const remove = (session, kind, id, world) => {
  const entry = customItems.get(kind, id);
  if (!entry || entry.ownerId !== session.account.id) {
    return {error: "That is not one of your items."};
  }
  const result = itemControl.deleteCustom(kind, entry.id, world);
  return result.error ? result : {ok: `Deleted ${entry.name}.`};
};

const reply = (session, result) => {
  const room = left(session.account);
  const mine = madeBy(session.account).map(entry => ({kind: entry.kind, id: entry.id, name: entry.name, base: entry.base, art: entry.artPending ? "" : entry.art || "",
    artMode: entry.artMode || "sticker", waiting: entry.pending ? "item" : entry.artPending ? "picture" : ""}));
  session.sendXt("xcm", -1, result.error ? 0 : 1, String(result.error || result.ok || "").replace(/%/g, " percent"), room.today, room.inAll,
    JSON.stringify(mine).replace(/%/g, "\\u0025"));
};

// `world` tells games about items taken (lib/world.js itemsTaken).
const handlers = world => ({
  xcm(session, roomId, [action, kind, id, ...words]) {
    if (action === "make") {
      reply(session, make(session, kind, id, words.join(" ")));
    }
    else if (action === "look") {
      reply(session, setLook(session.account, kind, id, words[0]));
    }
    else if (action === "rename") {
      reply(session, rename(session.account, kind, id, words.join(" ")));
    }
    else if (action === "delete") {
      reply(session, remove(session, kind, id, world));
    }
    else {
      reply(session, enabled() ? {ok: ""} : {error: "The Item Maker is turned off on this server for now."});
    }
  },
});

module.exports = {handlers, madeBy, rename, setLook, review, enabled, approvalOn, artApprovalOn, pictureWaits, setSwitches,
  pictureRefused, uploadRefusal, setUploadsBlocked, takePicture, ART_STRIKES};
