"use strict";

const accounts = require("./accounts.js");
const config = require("../config.js");

// how much players may make: items in the Item Maker (lib/playeritems.js)
// and Masterpieces in the Art Studio (lib/masterpieces.js). The admin panel
// sets them. The server's own values are kept in the settings table. A
// player may have values of their own, higher or lower, on their account
// (account.creatorLimits), which stand in for the server's one by one. A
// value left unset is the default below.

const SETTING = "creatorLimits";
const MASTERPIECES_SETTING = "masterpieces"; // "off": nobody starts a new one

// `whole`: a count. the hours may be a part of one (0.5 for half an hour).
const FIELDS = {
  itemsPerDay: {label: "Items a day", max: 1000, whole: true, fallback: () => 5},
  itemsInAll: {label: "Items in all", max: 5000, whole: true, fallback: () => 20},
  masterpiecesPerDay: {label: "Masterpieces a day", max: 1000, whole: true, fallback: () => config.masterpiecesPerDay},
  masterpieceMinAgeHours: {label: "Account age for Masterpieces (hours)", max: 24 * 365, whole: false,
    fallback: () => config.masterpieceMinAccountAge / 3600},
};
const NAMES = Object.keys(FIELDS);

const valid = (name, value) => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= FIELDS[name].max
  && (!FIELDS[name].whole || Number.isInteger(value));

const saved = () => {
  try {
    const value = JSON.parse(accounts.setting(SETTING) || "{}");
    return value && typeof value === "object" ? value : {};
  }
  catch (err) {
    return {};
  }
};

// the server's values, each one set or its default
const server = () => {
  const set = saved();
  return Object.fromEntries(NAMES.map(name => [name, valid(name, set[name]) ? set[name] : FIELDS[name].fallback()]));
};

// what this player has of their own (only the values that were set)
const own = account => {
  const set = account && account.creatorLimits && typeof account.creatorLimits === "object" ? account.creatorLimits : {};
  return Object.fromEntries(NAMES.filter(name => valid(name, set[name])).map(name => [name, set[name]]));
};

// the values that apply to this player
const forAccount = account => ({...server(), ...own(account)});

// `changes`: {name: a number, or null for "not set"}. the problem with it,
// as words, or null.
const problem = changes => {
  if (!changes || typeof changes !== "object") {
    return "Nothing to change.";
  }
  for (const [name, value] of Object.entries(changes)) {
    if (!Object.hasOwn(FIELDS, name)) {
      return `There is no limit called ${name}.`;
    }
    if (value !== null && !valid(name, value)) {
      return `${FIELDS[name].label} must be ${FIELDS[name].whole ? "a whole number" : "a number"} from 0 to ${FIELDS[name].max}.`;
    }
  }
  return null;
};

const apply = (into, changes) => {
  for (const [name, value] of Object.entries(changes)) {
    if (value === null) {
      delete into[name];
    }
    else {
      into[name] = value;
    }
  }
  return into;
};

// both return the problem, or null once saved
const setServer = changes => {
  const why = problem(changes);
  if (!why) {
    accounts.setSetting(SETTING, JSON.stringify(apply(saved(), changes)));
  }
  return why;
};
const setForAccount = (account, changes) => {
  const why = problem(changes);
  if (!why) {
    const mine = apply(own(account), changes);
    if (Object.keys(mine).length) {
      account.creatorLimits = mine;
    }
    else {
      delete account.creatorLimits;
    }
    accounts.save(account);
  }
  return why;
};

const masterpiecesOn = () => accounts.setting(MASTERPIECES_SETTING) !== "off";
const setMasterpiecesOn = on => accounts.setSetting(MASTERPIECES_SETTING, on ? "on" : "off");

// "1 day", "36 hours", "30 minutes"
const describeHours = hours => {
  if (hours >= 24 && hours % 24 === 0) {
    return hours === 24 ? "a day" : `${hours / 24} days`;
  }
  if (hours >= 1) {
    return hours === 1 ? "an hour" : `${Math.round(hours * 10) / 10} hours`;
  }
  const minutes = Math.max(1, Math.round(hours * 60));
  return minutes === 1 ? "a minute" : `${minutes} minutes`;
};

module.exports = {FIELDS, NAMES, server, own, forAccount, setServer, setForAccount, masterpiecesOn, setMasterpiecesOn, describeHours};
