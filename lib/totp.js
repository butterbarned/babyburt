"use strict";

const crypto = require("crypto");

// two-step sign-in: a six-digit code from an authenticator app, asked for
// after the password by the client's sign-in (lib/http.js) and the account
// page's (lib/manage.js). A player turns it on and off on the account page.
// time-based one-time passwords as every authenticator app makes them
// (RFC 6238: HMAC-SHA1, six digits, a new one every 30 seconds).
//
// on an account:
//   totp         null, or {secret (base32), since, lastStep, recovery: [SHA-256
//                of a code, ...]} once it is on. lastStep is the time step of
//                the last code taken: a code works once.
//   totpSetup    {secret, at} while it is being turned on: the secret was
//                shown and no code from it has been given yet.
//   devices      [{hash, at, via}]: devices that need not give a code for
//                DEVICE_DAYS after one sign-in with a code. each holds a
//                random token; only its hash is kept here.
//
// A recovery code stands in for a code from the app, once: for a player
// whose phone is gone. they are shown when two-step sign-in is turned on and
// never again. the admin can turn it off for an account from the panel.
//
// the secret has to be kept as it is, since every code is worked out from
// it: whoever can read the database can make codes. it never leaves the
// server after it was shown at setup.

const STEP_SECONDS = 30;
const DIGITS = 6;
const WINDOW = 1; // steps either side of now that are taken: clocks differ
const SETUP_MINUTES = 15;
const RECOVERY_CODES = 8;
const DEVICE_DAYS = 30;
const MAX_DEVICES = 10;
const DEVICE_TOKEN_HEX = 48;
const ISSUER = "Dusklight";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

const base32Encode = bytes => {
  let bits = "";
  for (const byte of bytes) {
    bits += byte.toString(2).padStart(8, "0");
  }
  let out = "";
  for (let index = 0; index < bits.length; index += 5) {
    out += BASE32[parseInt(bits.slice(index, index + 5).padEnd(5, "0"), 2)];
  }
  return out;
};

const base32Decode = text => {
  let bits = "";
  for (const char of text) {
    bits += BASE32.indexOf(char).toString(2).padStart(5, "0");
  }
  const bytes = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(parseInt(bits.slice(index, index + 8), 2));
  }
  return Buffer.from(bytes);
};

const now = () => Math.floor(Date.now() / 1000);
const sha256 = text => crypto.createHash("sha256").update(text).digest("hex");

const sameText = (one, other) => {
  const a = Buffer.from(String(one));
  const b = Buffer.from(String(other));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// the code for one time step (RFC 4226, with the step as the counter).
const codeAt = (secret, step) => {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const mac = crypto.createHmac("sha1", base32Decode(secret)).update(counter).digest();
  const offset = mac[mac.length - 1] & 0x0F;
  return String((mac.readUInt32BE(offset) & 0x7FFFFFFF) % 10 ** DIGITS).padStart(DIGITS, "0");
};

// the time step a code belongs to if it is one the secret gives now, a
// step early or a step late, and later than `after`; or null.
const stepOf = (secret, code, after = 0, at = now()) => {
  const current = Math.floor(at / STEP_SECONDS);
  let found = null;
  // every candidate is compared, so that the time taken says nothing.
  for (let step = current - WINDOW; step <= current + WINDOW; step++) {
    if (sameText(codeAt(secret, step), code) && step > after) {
      found = step;
    }
  }
  return found;
};

const isOn = account => Boolean(account.totp);

// what an authenticator app takes, typed in or as a QR code.
const uri = (username, secret) => {
  const label = encodeURIComponent(`${ISSUER}:${String(username).slice(0, 30)}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(ISSUER)}`;
};

// begins turning it on: a new secret, to be confirmed with a code.
const begin = account => {
  account.totpSetup = {secret: base32Encode(crypto.randomBytes(20)), at: now()};
  return {secret: account.totpSetup.secret, uri: uri(account.username, account.totpSetup.secret)};
};

const RECOVERY_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no l, i, o, 0 or 1
// sixteen characters (about 79 bits): only its plain hash is kept, which is
// safe for a code this long and was thin for the ten of earlier setups
// (those still work until used).
const RECOVERY_LENGTH = 16;
const OLD_RECOVERY_LENGTH = 10;
const recoveryCode = () => {
  let code = "";
  while (code.length < RECOVERY_LENGTH) {
    const byte = crypto.randomBytes(1)[0];
    if (byte < RECOVERY_ALPHABET.length * 8) { // 248: no letter is likelier than another
      code += RECOVERY_ALPHABET[byte % RECOVERY_ALPHABET.length];
    }
  }
  return code.match(/.{4}/g).join("-");
};
// as typed: capitals, spaces and the dash do not matter.
const recoveryKey = text => String(text).toLowerCase().replace(/[^a-z0-9]/g, "");

// turns it on if `code` is one the secret shown at setup gives. returns the
// recovery codes, to be shown once, or null.
const confirm = (account, code) => {
  const setup = account.totpSetup;
  if (!setup || now() - setup.at > SETUP_MINUTES * 60) {
    account.totpSetup = null;
    return null;
  }
  const step = stepOf(setup.secret, String(code).replace(/\s/g, ""));
  if (step === null) {
    return null;
  }
  const codes = Array.from({length: RECOVERY_CODES}, recoveryCode);
  account.totp = {secret: setup.secret, since: now(), lastStep: step, recovery: codes.map(one => sha256(recoveryKey(one)))};
  account.totpSetup = null;
  account.devices = [];
  return codes;
};

// is `code` good for the account, as a code from the app or a recovery
// code? either is used up by this. returns "code", "recovery" or null.
const verify = (account, code) => {
  if (!account.totp || typeof code !== "string" || code.length > 60) {
    return null;
  }
  const digits = code.replace(/\s/g, "");
  if (/^\d{6}$/.test(digits)) {
    const step = stepOf(account.totp.secret, digits, account.totp.lastStep);
    if (step !== null) {
      account.totp.lastStep = step;
      return "code";
    }
    return null;
  }
  const index = account.totp.recovery.indexOf(sha256(recoveryKey(code)));
  if (index !== -1 && [RECOVERY_LENGTH, OLD_RECOVERY_LENGTH].includes(recoveryKey(code).length)) {
    account.totp.recovery.splice(index, 1);
    return "recovery";
  }
  return null;
};

const turnOff = account => {
  account.totp = null;
  account.totpSetup = null;
  account.devices = [];
};

const freshDevices = account => account.devices.filter(device => now() - device.at < DEVICE_DAYS * 86400);

// A token for the device that just signed in with a code. `via` says where
// ("launcher" or "web").
const trustDevice = (account, via) => {
  const token = crypto.randomBytes(DEVICE_TOKEN_HEX / 2).toString("hex");
  account.devices = [{hash: sha256(token), at: now(), via}, ...freshDevices(account)].slice(0, MAX_DEVICES);
  return token;
};

const deviceTrusted = (account, token) => {
  if (typeof token !== "string" || token.length !== DEVICE_TOKEN_HEX) {
    return false;
  }
  account.devices = freshDevices(account);
  const hash = sha256(token);
  return account.devices.some(device => device.hash === hash);
};

const forgetDevices = account => {
  account.devices = [];
};

module.exports = {
  DEVICE_DAYS, isOn, begin, confirm, verify, turnOff, trustDevice, deviceTrusted, forgetDevices, freshDevices,
  codeAt, stepOf, uri, base32Encode, base32Decode,
};
