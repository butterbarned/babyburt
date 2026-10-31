#!/usr/bin/env node
"use strict";

// uploads music to a running server's admin panel, as its Music tab does, but
// a whole folder at a time. each MP3 becomes a den music track at once.
// FLAC (and WAV, OGG, M4A, ...) are converted to MP3 first with ffmpeg, which
// has to be installed for that.
//
//   node tools/upload-music.js [options] <folder-or-file>...
//
//   --server URL       the server (default http://127.0.0.1:8080). for a public server
//                      use an SSH tunnel, as for the admin panel: https://127.0.0.1:8443
//   --password TEXT    the admin password (else $AJ_ADMIN_PASSWORD, else asked for)
//   --cost N           price in gems (default 0)
//   --shop             put the tracks on sale in the shop
//   --bitrate K        MP3 bitrate in kbit/s for conversions (default 192); a track too big
//                      for the 15 MB limit is tried again at lower ones
//   --no-convert       upload .mp3 files only; skip everything else
//   --convert-only DIR convert to MP3 into DIR and stop: no server needed
//   --keep DIR         keep converted MP3s in DIR (else they are deleted afterwards)
//   --recursive, -r    look in the folders inside a folder too
//   --allow-duplicates upload a track even if one with that name exists (default: skipped)
//   --insecure         accept the certificate of https://127.0.0.1 or localhost (a tunnel's)
//   --dry-run          show what would happen; convert and upload nothing
//   --list             show the uploaded tracks (id and name) and stop
//   --rename ID NAME   give uploaded track ID another name and stop (find ids with --list);
//                      NAME is up to 40 letters, numbers, spaces and simple punctuation
//   --help, -h

const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const https = require("https");
const {spawn, spawnSync} = require("child_process");

// the server's limits (lib/custommusic.js, lib/customitems.js)
const MAX_BYTES = 15 * 1024 * 1024;
const MIN_BYTES = 4 * 1024;
const MAX_NAME = 40;
const NAME_ALLOWED = /[^\p{L}\p{N} '&!?.,:()#+\-]/gu;
const CONVERTIBLE = new Set([".flac", ".wav", ".ogg", ".oga", ".opus", ".m4a", ".aac", ".wma", ".aif", ".aiff"]);
const BITRATES = [320, 256, 224, 192, 160, 128, 112, 96, 64];

const fail = message => {
  console.error(`error: ${message}`);
  process.exit(1);
};

const parse = argv => {
  const options = {server: "http://127.0.0.1:8080", cost: 0, shop: false, bitrate: 192, convert: true, recursive: false,
    duplicates: false, insecure: false, dryRun: false, inputs: []};
  const value = (i, name) => {
    if (i + 1 >= argv.length) {
      fail(`${name} needs a value`);
    }
    return argv[i + 1];
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "--server": options.server = value(i++, arg); break;
      case "--password": options.password = value(i++, arg); break;
      case "--cost": options.cost = Number(value(i++, arg)); break;
      case "--shop": options.shop = true; break;
      case "--bitrate": options.bitrate = Number(String(value(i++, arg)).replace(/k$/i, "")); break;
      case "--no-convert": options.convert = false; break;
      case "--convert-only": options.convertOnly = value(i++, arg); break;
      case "--keep": options.keep = value(i++, arg); break;
      case "--recursive": case "-r": options.recursive = true; break;
      case "--allow-duplicates": options.duplicates = true; break;
      case "--insecure": options.insecure = true; break;
      case "--dry-run": options.dryRun = true; break;
      case "--list": options.list = true; break;
      case "--rename":
        if (i + 2 >= argv.length) {
          fail("--rename needs a track id and a new name: --rename 50003 \"New name\"");
        }
        options.rename = {id: argv[i + 1], name: argv[i + 2]};
        i += 2;
        break;
      case "--help": case "-h": options.help = true; break;
      default:
        if (arg.startsWith("-")) {
          fail(`unknown option ${arg} (try --help)`);
        }
        options.inputs.push(arg);
    }
  }
  if (!Number.isInteger(options.cost) || options.cost < 0 || options.cost > 1000000) {
    fail("--cost is a whole number of gems from 0 to 1000000");
  }
  if (!BITRATES.includes(options.bitrate)) {
    fail(`--bitrate is one of ${BITRATES.join(", ")}`);
  }
  return options;
};

// the audio files in the inputs, in name order
const collect = (inputs, recursive) => {
  const found = [];
  const walk = (folder, deep) => {
    for (const entry of fs.readdirSync(folder, {withFileTypes: true}).sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true}))) {
      const full = path.join(folder, entry.name);
      if (entry.isDirectory()) {
        if (deep) {
          walk(full, deep);
        }
      }
      else if (entry.isFile() && (entry.name.toLowerCase().endsWith(".mp3") || CONVERTIBLE.has(path.extname(entry.name).toLowerCase()))) {
        found.push(full);
      }
    }
  };
  for (const input of inputs) {
    let stat;
    try {
      stat = fs.statSync(input);
    }
    catch {
      fail(`${input} does not exist`);
    }
    if (stat.isDirectory()) {
      walk(input, recursive);
    }
    else {
      found.push(input);
    }
  }
  return found;
};

// a track's name from its file name, within what the server accepts
const nameOf = file => {
  const base = path.basename(file, path.extname(file)).replace(/[_]+/g, " ");
  return base.replace(NAME_ALLOWED, "").replace(/\s+/g, " ").trim().slice(0, MAX_NAME).trim();
};

const haveFfmpeg = () => {
  const result = spawnSync("ffmpeg", ["-version"], {stdio: "ignore"});
  return !result.error && result.status === 0;
};

const runFfmpeg = (input, output, kbps) => new Promise(resolve => {
  // no picture, no tags (cover art would be kilobytes of ID3), 44.1 kHz stereo as the game's Flash plays best
  const child = spawn("ffmpeg", ["-y", "-v", "error", "-i", input, "-vn", "-map_metadata", "-1", "-ar", "44100", "-ac", "2",
    "-codec:a", "libmp3lame", "-b:a", `${kbps}k`, output], {stdio: ["ignore", "ignore", "pipe"]});
  let errors = "";
  child.stderr.on("data", chunk => {
    errors += chunk;
  });
  child.on("error", err => resolve({error: err.message}));
  child.on("close", code => resolve(code === 0 ? {} : {error: errors.trim().split("\n").slice(-3).join(" | ") || `ffmpeg exited with ${code}`}));
});

// converts `input` to an MP3 in `folder` that fits the server's size limit,
// stepping the bitrate down when it does not. returns {file, kbps} or {error}.
const convert = async (input, folder, startKbps) => {
  const output = path.join(folder, `${path.basename(input, path.extname(input))}.mp3`);
  for (const kbps of BITRATES.filter(rate => rate <= startKbps)) {
    const result = await runFfmpeg(input, output, kbps);
    if (result.error) {
      return result;
    }
    if (fs.statSync(output).size <= MAX_BYTES) {
      return {file: output, kbps};
    }
  }
  fs.rmSync(output, {force: true});
  return {error: `still over ${MAX_BYTES / 1024 / 1024} MB at the lowest bitrate (${BITRATES[BITRATES.length - 1]}k): too long for one track`};
};

const askPassword = () => new Promise((resolve, reject) => {
  if (!process.stdin.isTTY) {
    reject(new Error("no password: use --password or set AJ_ADMIN_PASSWORD"));
    return;
  }
  process.stderr.write("Admin password: ");
  let typed = "";
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  const onData = chunk => {
    for (const character of chunk) {
      if (character === "\r" || character === "\n") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.off("data", onData);
        process.stderr.write("\n");
        resolve(typed);
        return;
      }
      if (character === "\u0003") {
        process.stderr.write("\n");
        process.exit(130);
      }
      typed = character === "\u007f" ? typed.slice(0, -1) : typed + character;
    }
  };
  process.stdin.on("data", onData);
});

// a small client for the admin panel. the Host header always carries the
// port: through a tunnel the server only trusts "127.0.0.1:<port>".
const connect = (server, insecure) => {
  const url = new URL(server);
  const secure = url.protocol === "https:";
  const port = Number(url.port || (secure ? 443 : 80));
  if (insecure && !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)) {
    fail("--insecure is only for 127.0.0.1 or localhost (a tunnel); a real address should have a real certificate");
  }
  let cookie = "";
  const request = (method, target, body = null, headers = {}) => new Promise((resolve, reject) => {
    const req = (secure ? https : http).request({hostname: url.hostname, port, path: target, method, rejectUnauthorized: !insecure,
      headers: {Host: `${url.hostname}:${port}`, ...(cookie ? {Cookie: cookie} : {}), ...(body ? {"Content-Length": body.length} : {}), ...headers}}, res => {
      const chunks = [];
      res.on("data", chunk => chunks.push(chunk));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        let json = null;
        try {
          json = JSON.parse(text);
        }
        catch {}
        resolve({status: res.statusCode, headers: res.headers, json, text});
      });
    });
    req.on("error", reject);
    req.setTimeout(120000, () => req.destroy(new Error("the server took too long to answer")));
    req.end(body);
  });
  return {
    login: async password => {
      const reply = await request("POST", "/admin/api/login", Buffer.from(JSON.stringify({password})), {"Content-Type": "application/json"});
      if (reply.status !== 200) {
        const why = reply.status === 421 ? "the server does not accept that address (use 127.0.0.1 with the port, through a tunnel, or run this on the server)"
          : reply.status === 401 ? "wrong admin password" : (reply.json && reply.json.error) || `HTTP ${reply.status}`;
        throw new Error(`could not sign in: ${why}`);
      }
      const set = reply.headers["set-cookie"];
      cookie = (Array.isArray(set) ? set : [set]).filter(Boolean).map(line => line.split(";")[0]).join("; ");
      if (!cookie) {
        throw new Error("could not sign in: the server sent no session");
      }
    },
    tracks: async () => {
      const reply = await request("GET", "/admin/api/music");
      if (reply.status !== 200 || !reply.json) {
        throw new Error(`could not read the track list (HTTP ${reply.status})`);
      }
      return reply.json.tracks || [];
    },
    rename: (id, name) => request("POST", `/admin/api/music?rename=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`, Buffer.alloc(0)),
    upload: (name, data, cost, shop) => request("POST",
      `/admin/api/music?name=${encodeURIComponent(name)}&cost=${cost}${shop ? "&inShop=1" : ""}`, data, {"Content-Type": "audio/mpeg"}),
  };
};

const main = async () => {
  const options = parse(process.argv.slice(2));
  if (options.help || (options.inputs.length === 0 && !options.list && !options.rename)) {
    console.log(fs.readFileSync(__filename, "utf8").split("\n").filter(line => line.startsWith("//")).map(line => line.slice(3)).join("\n"));
    process.exit(options.help ? 0 : 1);
  }
  // listing and renaming need the server and no files
  if (options.list || options.rename) {
    const client = connect(options.server, options.insecure);
    await client.login(options.password || process.env.AJ_ADMIN_PASSWORD || await askPassword());
    if (options.rename) {
      const reply = await client.rename(options.rename.id, options.rename.name);
      if (reply.status === 200 && reply.json && reply.json.ok) {
        console.log(reply.json.ok);
      }
      else {
        fail((reply.json && reply.json.error) || `HTTP ${reply.status}`);
      }
    }
    if (options.list) {
      const tracks = await client.tracks();
      for (const track of tracks.sort((a, b) => a.id - b.id)) {
        console.log(`${String(track.id).padStart(6)}  ${track.name}${track.inShop ? `  (on sale, ${track.cost} gems)` : ""}`);
      }
      console.log(`${tracks.length} track${tracks.length === 1 ? "" : "s"}`);
    }
    process.exit(0);
  }
  const files = collect(options.inputs, options.recursive);
  if (files.length === 0) {
    fail("no audio files found");
  }
  const needsConversion = files.some(file => path.extname(file).toLowerCase() !== ".mp3");
  const ffmpeg = options.convert && (needsConversion || options.convertOnly) ? haveFfmpeg() : false;
  if (needsConversion && options.convert && !ffmpeg) {
    fail("ffmpeg is needed to convert non-MP3 files and was not found. Install it (Arch/CachyOS: sudo pacman -S ffmpeg, Ubuntu: sudo apt install ffmpeg), or use --no-convert");
  }

  // convert-only: no server
  if (options.convertOnly) {
    if (!ffmpeg) {
      fail("ffmpeg is needed for --convert-only and was not found");
    }
    fs.mkdirSync(options.convertOnly, {recursive: true});
    let bad = 0;
    for (const [i, file] of files.entries()) {
      process.stdout.write(`[${i + 1}/${files.length}] ${path.basename(file)} ... `);
      if (options.dryRun) {
        console.log("would convert");
        continue;
      }
      const result = await convert(file, options.convertOnly, options.bitrate);
      console.log(result.error ? `FAILED: ${result.error}` : `${path.basename(result.file)} (${(fs.statSync(result.file).size / 1024 / 1024).toFixed(1)} MB, ${result.kbps}k)`);
      bad += result.error ? 1 : 0;
    }
    process.exit(bad ? 1 : 0);
  }

  let client = null;
  let existing = new Set();
  if (!options.dryRun) {
    const password = options.password || process.env.AJ_ADMIN_PASSWORD || await askPassword();
    client = connect(options.server, options.insecure);
    await client.login(password);
    existing = new Set((await client.tracks()).map(track => track.name.toLowerCase()));
  }
  const temp = options.keep ? path.resolve(options.keep) : fs.mkdtempSync(path.join(os.tmpdir(), "dusklight-music-"));
  fs.mkdirSync(temp, {recursive: true});
  const tally = {uploaded: 0, skipped: 0, failed: 0};
  try {
    for (const [i, file] of files.entries()) {
      const label = `[${i + 1}/${files.length}] ${path.basename(file)}`;
      const name = nameOf(file);
      if (!name) {
        console.log(`${label}: skipped (no usable name; rename the file)`);
        tally.skipped++;
        continue;
      }
      if (!options.duplicates && existing.has(name.toLowerCase())) {
        console.log(`${label}: skipped ("${name}" already exists)`);
        tally.skipped++;
        continue;
      }
      let upload = file;
      const isMp3 = path.extname(file).toLowerCase() === ".mp3";
      const size = fs.statSync(file).size;
      const tooBig = isMp3 && size > MAX_BYTES;
      if (!isMp3 && !options.convert) {
        console.log(`${label}: skipped (not an MP3; conversion is off)`);
        tally.skipped++;
        continue;
      }
      if ((!isMp3 || tooBig) && options.dryRun) {
        console.log(`${label}: would convert, then upload as "${name}"`);
        continue;
      }
      if (!isMp3 || tooBig) {
        if (tooBig && !ffmpeg) {
          console.log(`${label}: FAILED: over ${MAX_BYTES / 1024 / 1024} MB, and ffmpeg is needed to shrink it`);
          tally.failed++;
          continue;
        }
        process.stdout.write(`${label}: converting... `);
        const result = await convert(file, temp, options.bitrate);
        if (result.error) {
          console.log(`FAILED: ${result.error}`);
          tally.failed++;
          continue;
        }
        process.stdout.write(`${result.kbps}k, ${(fs.statSync(result.file).size / 1024 / 1024).toFixed(1)} MB; `);
        upload = result.file;
      }
      else if (size < MIN_BYTES) {
        console.log(`${label}: FAILED: too small to be a song`);
        tally.failed++;
        continue;
      }
      else {
        process.stdout.write(`${label}: `);
      }
      if (options.dryRun) {
        console.log(`would upload as "${name}"`);
        continue;
      }
      let reply;
      try {
        reply = await client.upload(name, fs.readFileSync(upload), options.cost, options.shop);
      }
      catch (err) {
        console.log(`FAILED: ${err.message}`);
        tally.failed++;
        continue;
      }
      if (reply.status === 200 && reply.json && reply.json.item) {
        console.log(`uploaded as "${reply.json.item.name}" (den item ${reply.json.item.id})`);
        existing.add(name.toLowerCase());
        tally.uploaded++;
      }
      else {
        console.log(`FAILED: ${(reply.json && reply.json.error) || `HTTP ${reply.status}`}`);
        tally.failed++;
      }
    }
  }
  finally {
    if (!options.keep) {
      fs.rmSync(temp, {recursive: true, force: true});
    }
  }
  console.log(`done: ${tally.uploaded} uploaded, ${tally.skipped} skipped, ${tally.failed} failed`);
  process.exit(tally.failed ? 1 : 0);
};

main().catch(err => fail(err.message));
