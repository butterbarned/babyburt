"use strict";

const crypto = require("crypto");
const {logText} = require("./logtext.js");
const accounts = require("./accounts.js");
const badges = require("./badges.js");
const config = require("../config.js");

// a player's Discord account, linked on the account page by signing in to
// Discord (OAuth2, scope "identify"): the only way a Discord username gets
// onto a player's card, so the name shown is theirs. one Discord account
// for one Dusklight account, or a single boost would badge a player's every
// account.
//
// the Discord Server Booster badge follows the linked account: given while
// it boosts Dusklight's Discord server, taken off when it stops, checked when
// the account is linked and again every RECHECK_HOURS. Dusklight's bot asks
// Discord (GET /guilds/<id>/members/<user id>, which needs no privileged
// intent: the bot only has to be in the server). an account that is not
// linked keeps whatever badges the admin gave it.
//
// with AJ_DISCORD_CLIENT_ID and AJ_DISCORD_CLIENT_SECRET unset, linking is
// off; without AJ_DISCORD_BOT_TOKEN and AJ_DISCORD_GUILD_ID, the booster
// badge is left alone.

const API = "https://discord.com/api/v10";
const AUTHORIZE = "https://discord.com/oauth2/authorize";
const STATE_MINUTES = 10;
const MAX_STATES = 10000;
const RECHECK_HOURS = 6;
const RECHECK_GAP_MS = 300; // between two members asked about, under Discord's rate limit
const TIMEOUT_MS = 15000;
const BOOSTER = "booster";

const linking = () => Boolean(config.discord.clientId && config.discord.clientSecret);
const boostChecks = () => Boolean(config.discord.botToken && config.discord.guildId);
const redirectUri = () => `${config.siteUrl}account/discord/callback`;
const adminRedirectUri = () => `${config.siteUrl}dashboard/admin/discord/callback`;
const staffRedirectUri = () => `${config.siteUrl}dashboard/staff/discord/callback`;

// a link under way: state (in Discord's address) -> {accountId, nonce (in a
// cookie of the browser that asked), expires}. both must come back.
const states = new Map();
const adminStates = new Map();
const staffStates = new Map();

const newState = statesMap => {
  for (const [state, entry] of statesMap) {
    if (entry.expires < Date.now()) {
      statesMap.delete(state);
    }
  }
  if (statesMap.size >= MAX_STATES) {
    statesMap.delete(statesMap.keys().next().value);
  }
  const state = crypto.randomBytes(24).toString("hex");
  const nonce = crypto.randomBytes(24).toString("hex");
  statesMap.set(state, {nonce, expires: Date.now() + STATE_MINUTES * 60000});
  return {state, nonce};
};

const authorize = (redirect, state) => {
  const url = new URL(AUTHORIZE);
  url.search = new URLSearchParams({client_id: config.discord.clientId, response_type: "code", scope: "identify",
    redirect_uri: redirect, state, prompt: "consent"}).toString();
  return url.href;
};

const start = account => {
  const {state, nonce} = newState(states);
  states.get(state).accountId = account.id;
  return {url: authorize(redirectUri(), state), nonce};
};

// A separate OAuth state and redirect for the owner dashboard. The Discord
// account must already be linked to a Dusklight account explicitly granted
// adminDashboardAccess; knowing a Discord name is never enough.
const startAdmin = () => {
  const {state, nonce} = newState(adminStates);
  return {url: authorize(adminRedirectUri(), state), nonce};
};

// Staff sign in through a separately scoped state and callback. A Discord
// identity is only useful here after its owner has linked it to their own
// Dusklight account; modpanel.js also verifies that account remains active staff.
const startStaff = () => {
  const {state, nonce} = newState(staffStates);
  return {url: authorize(staffRedirectUri(), state), nonce};
};

const call = async (path, options = {}) => {
  const res = await fetch(`${API}${path}`, {...options, signal: AbortSignal.timeout(TIMEOUT_MS)});
  const body = await res.json().catch(() => ({}));
  return {status: res.status, body};
};

// how a Discord username is kept and shown: as Discord spells them now, or,
// for an old "name#1234" one, without the characters a card cannot carry.
const shownName = user => badges.discordName(user.username)
  || `${String(user.username).replace(/[,|%\s]/g, "")}${user.discriminator && user.discriminator !== "0" ? `#${user.discriminator}` : ""}`.slice(0, 40);

const setBooster = (account, on) => {
  if (account.badges.includes(BOOSTER) === on) {
    return false;
  }
  badges.set(account, on ? [...account.badges, BOOSTER] : account.badges.filter(id => id !== BOOSTER));
  return true;
};

// whether the linked account boosts the server now: true, false, or null
// when Discord could not be asked.
const boosting = async account => {
  if (!boostChecks() || !account.discordId) {
    return null;
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    const {status, body} = await call(`/guilds/${config.discord.guildId}/members/${account.discordId}`,
      {headers: {Authorization: `Bot ${config.discord.botToken}`}}).catch(() => ({status: 0, body: {}}));
    if (status === 200) {
      return Boolean(body.premium_since);
    }
    if (status === 404) {
      return false; // not in the server (any more)
    }
    if (status === 429) {
      await new Promise(resolve => setTimeout(resolve, Math.min(60, Number(body.retry_after) || 5) * 1000));
      continue;
    }
    console.log(`[discord] could not check ${logText(account.username)}'s boost: ${logText(status)}`);
    return null;
  }
  return null;
};

const checkBoost = async account => {
  const on = await boosting(account);
  if (on !== null && setBooster(account, on)) {
    accounts.save(account);
    console.log(`[discord] ${logText(account.username)} ${on ? "boosts: booster badge given" : "no longer boosts: booster badge taken off"}`);
  }
};

// the end of a link: the code Discord gave, for the state and the nonce the
// browser brought back. {ok, account} or {error}.
const finish = async (state, nonce, code) => {
  const entry = typeof state === "string" ? states.get(state) : null;
  states.delete(state);
  const digest = text => crypto.createHash("sha256").update(String(text)).digest();
  if (!entry || entry.expires < Date.now() || typeof nonce !== "string" || !crypto.timingSafeEqual(digest(entry.nonce), digest(nonce))) {
    return {error: "expired"};
  }
  const account = accounts.byId(entry.accountId);
  if (!account || typeof code !== "string" || !code) {
    return {error: "expired"};
  }
  try {
    const token = await call("/oauth2/token", {
      method: "POST",
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
      body: new URLSearchParams({client_id: config.discord.clientId, client_secret: config.discord.clientSecret,
        grant_type: "authorization_code", code, redirect_uri: redirectUri()}).toString(),
    });
    if (token.status !== 200 || !token.body.access_token) {
      return {error: "discord"};
    }
    const me = await call("/users/@me", {headers: {Authorization: `Bearer ${token.body.access_token}`}});
    if (me.status !== 200 || !/^\d{5,25}$/.test(String(me.body.id))) {
      return {error: "discord"};
    }
    const id = String(me.body.id);
    if (accounts.all().some(other => other !== account && other.discordId === id)) {
      return {error: "taken"};
    }
    account.discordId = id;
    account.discord = shownName(me.body);
    accounts.save(account);
    console.log(`[discord] ${logText(account.username)} linked Discord ${logText(account.discord)} (${logText(id)})`);
    await checkBoost(account);
    return {ok: true, account};
  }
  catch (err) {
    console.log(`[discord] link failed: ${logText(err.message)}`);
    return {error: "discord"};
  }
};

const finishAdmin = async (state, nonce, code) => {
  const entry = typeof state === "string" ? adminStates.get(state) : null;
  adminStates.delete(state);
  const digest = text => crypto.createHash("sha256").update(String(text)).digest();
  if (!entry || entry.expires < Date.now() || typeof nonce !== "string" || !crypto.timingSafeEqual(digest(entry.nonce), digest(nonce)) || !code) {
    return {error: "expired"};
  }
  try {
    const token = await call("/oauth2/token", {
      method: "POST",
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
      body: new URLSearchParams({client_id: config.discord.clientId, client_secret: config.discord.clientSecret,
        grant_type: "authorization_code", code, redirect_uri: adminRedirectUri()}).toString(),
    });
    if (token.status !== 200 || !token.body.access_token) {
      return {error: "discord"};
    }
    const me = await call("/users/@me", {headers: {Authorization: `Bearer ${token.body.access_token}`}});
    if (me.status !== 200 || !/^\d{5,25}$/.test(String(me.body.id))) {
      return {error: "discord"};
    }
    const account = accounts.all().find(candidate => candidate.discordId === String(me.body.id) && candidate.adminDashboardAccess);
    return account ? {ok: true, account} : {error: "denied"};
  }
  catch (err) {
    console.log(`[discord] admin sign-in failed: ${logText(err.message)}`);
    return {error: "discord"};
  }
};

const finishStaff = async (state, nonce, code) => {
  const entry = typeof state === "string" ? staffStates.get(state) : null;
  staffStates.delete(state);
  const digest = text => crypto.createHash("sha256").update(String(text)).digest();
  if (!entry || entry.expires < Date.now() || typeof nonce !== "string" || !crypto.timingSafeEqual(digest(entry.nonce), digest(nonce)) || !code) {
    return {error: "expired"};
  }
  try {
    const token = await call("/oauth2/token", {
      method: "POST",
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
      body: new URLSearchParams({client_id: config.discord.clientId, client_secret: config.discord.clientSecret,
        grant_type: "authorization_code", code, redirect_uri: staffRedirectUri()}).toString(),
    });
    if (token.status !== 200 || !token.body.access_token) {
      return {error: "discord"};
    }
    const me = await call("/users/@me", {headers: {Authorization: `Bearer ${token.body.access_token}`}});
    if (me.status !== 200 || !/^\d{5,25}$/.test(String(me.body.id))) {
      return {error: "discord"};
    }
    const account = accounts.all().find(candidate => candidate.discordId === String(me.body.id));
    return account ? {ok: true, account} : {error: "denied"};
  }
  catch (err) {
    console.log(`[discord] staff sign-in failed: ${logText(err.message)}`);
    return {error: "discord"};
  }
};

// the link undone, by the player or an admin; the booster badge goes with it.
const unlink = account => {
  const had = Boolean(account.discordId || account.discord);
  delete account.discordId;
  account.discord = "";
  if (had) {
    setBooster(account, false);
  }
  accounts.save(account);
  return had;
};

// every linked account in turn, a little apart, again and again.
let rechecking = false;
const recheckAll = async () => {
  if (rechecking || !boostChecks()) {
    return;
  }
  rechecking = true;
  try {
    for (const account of accounts.all().filter(one => one.discordId)) {
      await checkBoost(account);
      await new Promise(resolve => setTimeout(resolve, RECHECK_GAP_MS));
    }
  }
  finally {
    rechecking = false;
  }
};

// at start: Discord usernames typed in by hand before linking existed are
// cleared (only a linked one is shown now), then the boosts are looked at
// and looked at again every RECHECK_HOURS.
const startup = () => {
  const typed = accounts.all().filter(account => account.discord && !account.discordId);
  for (const account of typed) {
    account.discord = "";
  }
  if (typed.length) {
    accounts.save(...typed);
    console.log(`[discord] ${typed.length} Discord usernames typed in by hand were cleared`);
  }
  if (boostChecks()) {
    setTimeout(recheckAll, 30000).unref();
    setInterval(recheckAll, RECHECK_HOURS * 3600000).unref();
  }
};

module.exports = {linking, boostChecks, start, finish, startAdmin, finishAdmin, startStaff, finishStaff, unlink, startup};
