"use strict";

const config = require("../config.js");

// optional link to an outside service (the FireFly-bot) that gives invite
// codes out. with AJ_INVITE_HOOK_URL / AJ_INVITE_HOOK_TOKEN unset, none of
// this does anything. a failure here never stops codes being made.
const TIMEOUT_MS = 8000;

const post = async (route, body) => {
  try {
    const response = await fetch(`${config.inviteHook.url}${route}`, {
      method: "POST",
      headers: {"Content-Type": "application/json", "Authorization": `Bearer ${config.inviteHook.token}`},
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return response.ok;
  }
  catch (err) {
    console.error(`[invitehook] ${route} failed`);
    return false;
  }
};

// [{code, hash, expiresAt, note}]. null if no service is set up, else whether it accepted them.
const publish = async invites => config.inviteHook ? post("/codes", {invites}) : null;

// a revoked code should not be given out. hash is the stored hash, never the code.
const revoke = async hash => {
  if (config.inviteHook && hash) {
    await post("/revoked", {hash});
  }
};

module.exports = {available: () => Boolean(config.inviteHook), publish, revoke};
