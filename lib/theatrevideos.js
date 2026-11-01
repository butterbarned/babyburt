"use strict";

const {spawn} = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const {logText} = require("./logtext.js");
const config = require("../config.js");

// video files kept on this server, for staff to play on the theatre's screen
// (the "xtv" handler in lib/world.js) in place of a YouTube link: they type
// the video's name in the game's theatre box. everyone in the room sees it
// from the same point, and whoever comes in later joins it where it is.
//
// the files are data/theatre-videos/<name>.mp4 (or .webm): uploaded in the
// admin panel, or copied there on the machine (as the user the server runs
// as). the file's name, without its extension, is the video's name. each has
// an id made from its name, size and time, so the address it is served at
// (/theatre/<id>) changes whenever the file does.
//
// subtitles: data/theatre-videos/<name>.vtt beside the video, served at
// /theatre/<id>.vtt and shown by the game page (public/game.html) with a CC
// button. they come out of the video itself when it has text subtitles (an
// MKV's or an MP4's own track, by ffmpeg: config.ffmpeg), or are added by
// hand (an .srt, .vtt or .ass/.ssa file, made WebVTT here). a <name>.srt
// copied into the folder is made the .vtt too. <name>.nosubs says the video
// was looked through and has none, so it is not looked through again.
// ffmpeg also makes an upload playable: an MKV with H.264 in becomes an MP4,
// and sound the game's player cannot play (AC-3, DTS...) becomes AAC.

const MAX_BYTES = 4 * 1024 * 1024 * 1024;
const MAX_NAME = 60;
const ID = /^[0-9a-f]{16}$/;
const TYPES = {".mp4": "video/mp4", ".m4v": "video/mp4", ".webm": "video/webm"};
const MAX_SUBTITLE_BYTES = 5 * 1024 * 1024;
const FOLDER = () => path.join(config.dataDir, "theatre-videos");
const LIST_FOR_MS = 2000;

// a name staff may give one: no "%" (the game's messages are cut at it),
// no path, nothing hidden.
const cleanName = text => String(text || "").replace(/[\u0000-\u001f\u007f%\/\\:*?"<>|]/g, "").replace(/\s+/g, " ").trim().slice(0, MAX_NAME).trim();

// every video in the folder: [{id, name, file, type, bytes, addedAt}],
// read again at most every LIST_FOR_MS (a video being watched asks for
// its file piece by piece).
let listed = null;
let listedAt = 0;
const videos = () => {
  if (listed && Date.now() - listedAt < LIST_FOR_MS) {
    return listed;
  }
  const found = [];
  for (const entry of fs.existsSync(FOLDER()) ? fs.readdirSync(FOLDER(), {withFileTypes: true}) : []) {
    const type = TYPES[path.extname(entry.name).toLowerCase()];
    if (!entry.isFile() || !type || entry.name.startsWith("new-")) {
      continue;
    }
    const file = path.join(FOLDER(), entry.name);
    const stat = fs.statSync(file);
    const id = crypto.createHash("sha256").update(`${entry.name}\0${stat.size}\0${stat.mtimeMs}`).digest("hex").slice(0, 16);
    found.push({id, name: path.basename(entry.name, path.extname(entry.name)), file, type, bytes: stat.size, addedAt: stat.mtimeMs});
  }
  listed = found.sort((a, b) => b.addedAt - a.addedAt);
  listedAt = Date.now();
  return listed;
};
const forget = () => {
  listed = null;
};

const byId = id => ID.test(String(id)) ? videos().find(video => video.id === id) || null : null;

// how long an MP4 is, in ms: from its movie header ("mvhd", in "moov",
// which may be at the end of the file), or null.
const mp4Length = (fd, size) => {
  const head = Buffer.alloc(16);
  const walk = (from, to, inMovie) => {
    for (let at = from; at + 8 <= to;) {
      fs.readSync(fd, head, 0, 16, at);
      let length = head.readUInt32BE(0);
      let body = at + 8;
      if (length === 1) {
        length = Number(head.readBigUInt64BE(8));
        body = at + 16;
      }
      else if (length === 0) {
        length = to - at;
      }
      if (length < 8) {
        return null;
      }
      const type = head.toString("latin1", 4, 8);
      if (type === "moov") {
        return walk(body, Math.min(at + length, to), true);
      }
      if (inMovie && type === "mvhd") {
        const box = Buffer.alloc(32);
        fs.readSync(fd, box, 0, 32, body);
        const wide = box[0] === 1; // version 1: 64-bit times
        const scale = box.readUInt32BE(wide ? 20 : 12);
        const duration = wide ? Number(box.readBigUInt64BE(24)) : box.readUInt32BE(16);
        return scale ? Math.round(duration / scale * 1000) : null;
      }
      at += length;
    }
    return null;
  };
  return walk(0, size, false);
};

// how long a WebM is, in ms: from its Segment's Info (Duration, in
// TimecodeScale ns), which comes before the first Cluster; or null.
const WEBM = {segment: 0x18538067, info: 0x1549A966, scale: 0x2AD7B1, duration: 0x4489, cluster: 0x1F43B675};
const webmLength = (fd, size) => {
  const data = Buffer.alloc(Math.min(size, 1024 * 1024));
  fs.readSync(fd, data, 0, data.length, 0);
  // an EBML number: its first byte's leading zeroes say how many bytes it has
  const number = (at, keepMarker) => {
    if (at >= data.length || data[at] === 0) {
      return null;
    }
    const length = Math.clz32(data[at]) - 23;
    let value = keepMarker ? data[at] : data[at] & (0xFF >> length);
    for (let i = 1; i < length; i++) {
      value = value * 256 + (data[at + i] || 0);
    }
    return {value, length, unknown: !keepMarker && value === 2 ** (7 * length) - 1};
  };
  let scale = 1000000;
  let duration = null;
  let done = false;
  const walk = (from, to) => {
    for (let at = from; at < Math.min(to, data.length) && !done;) {
      const id = number(at, true);
      const length = id && number(at + id.length, false);
      if (!length) {
        done = true;
        return;
      }
      const body = at + id.length + length.length;
      const end = length.unknown ? to : body + length.value;
      if (id.value === WEBM.segment || id.value === WEBM.info) {
        walk(body, end);
        done = done || id.value === WEBM.info;
      }
      else if (id.value === WEBM.scale && body + length.value <= data.length) {
        scale = data.readUIntBE(body, Math.min(length.value, 6));
      }
      else if (id.value === WEBM.duration && body + length.value <= data.length && (length.value === 4 || length.value === 8)) {
        duration = length.value === 4 ? data.readFloatBE(body) : data.readDoubleBE(body);
      }
      else if (id.value === WEBM.cluster) {
        done = true;
      }
      at = end;
    }
  };
  walk(0, Infinity);
  return duration ? Math.round(duration * scale / 1e6) : null;
};

// a video's length in ms, or null when its file does not say; kept by id
const lengths = new Map();
const lengthOf = id => {
  const video = byId(id);
  if (!video) {
    return null;
  }
  if (!lengths.has(id)) {
    let length = null;
    try {
      const fd = fs.openSync(video.file, "r");
      try {
        length = video.type === "video/webm" ? webmLength(fd, video.bytes) : mp4Length(fd, video.bytes);
      }
      finally {
        fs.closeSync(fd);
      }
    }
    catch (err) {
      length = null;
    }
    lengths.set(id, Number.isFinite(length) && length > 0 ? length : null);
  }
  return lengths.get(id);
};

// the video staff mean by what they typed: its name, any case, with or
// without its extension.
const find = text => {
  const wanted = String(text || "").trim().toLowerCase();
  return wanted ? videos().find(video => video.name.toLowerCase() === wanted
    || path.basename(video.file).toLowerCase() === wanted) || null : null;
};

// for the admin panel: newest first
const list = () => {
  lookForSubtitles();
  return videos().map(({id, name, bytes, addedAt}) => ({id, name, bytes, addedAt, lengthMs: lengthOf(id),
    subtitles: fs.existsSync(subtitlesOf(name)), lookingForSubtitles: looking.has(name)}));
};

// ---- subtitles ----------------------------------------------------------
const subtitlesOf = name => path.join(FOLDER(), `${name}.vtt`);
const noSubsOf = name => path.join(FOLDER(), `${name}.nosubs`);
const srtOf = name => path.join(FOLDER(), `${name}.srt`);

// "00:01:02,5" / "1:02.500" / "0:01:02.50" (ASS: hundredths): WebVTT's "00:01:02.500"
const vttTime = (text, hundredths = false) => {
  const match = /^(?:(\d+):)?(\d{1,2}):(\d{1,2})(?:[.,](\d{1,3}))?$/.exec(String(text).trim());
  if (!match) {
    return null;
  }
  let ms = match[4] || "0";
  ms = hundredths && ms.length <= 2 ? String(Number(ms.padEnd(2, "0")) * 10) : ms.padEnd(3, "0");
  return `${String(Number(match[1] || 0)).padStart(2, "0")}:${match[2].padStart(2, "0")}:${match[3].padStart(2, "0")}.${ms.padStart(3, "0")}`;
};

// ASS/SSA's [Events] as WebVTT cues: the words only (its styling, karaoke
// and positions are not carried over).
const assToVtt = text => {
  const cues = [];
  let format = null;
  let inEvents = false;
  for (const line of text.split("\n")) {
    const section = /^\s*\[(.+)\]\s*$/.exec(line);
    if (section) {
      inEvents = section[1].trim().toLowerCase() === "events";
      continue;
    }
    if (!inEvents) {
      continue;
    }
    const field = /^\s*(\w+)\s*:\s?(.*)$/.exec(line);
    if (!field) {
      continue;
    }
    if (field[1].toLowerCase() === "format") {
      format = field[2].split(",").map(name => name.trim().toLowerCase());
      continue;
    }
    if (field[1].toLowerCase() !== "dialogue" || !format) {
      continue;
    }
    const parts = field[2].split(",");
    const values = parts.slice(0, format.length - 1).concat(parts.slice(format.length - 1).join(","));
    const value = name => values[format.indexOf(name)];
    const start = vttTime(value("start"), true);
    const end = vttTime(value("end"), true);
    const words = String(value("text") || "").replace(/\{[^}]*\}/g, "").replace(/\\[Nn]/g, "\n").replace(/\\h/g, " ").trim();
    if (start && end && words) {
      cues.push({start, end, words});
    }
  }
  cues.sort((one, other) => (one.start < other.start ? -1 : one.start > other.start ? 1 : 0));
  return cues.map(cue => `${cue.start} --> ${cue.end}\n${cue.words}`).join("\n\n");
};

// what was sent (SRT, WebVTT or ASS/SSA), as WebVTT; or null when it has no cues
const toVtt = data => {
  let text = Buffer.isBuffer(data) ? data.toString("utf8") : String(data);
  text = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n").replace(/\0/g, "");
  let body;
  if (/^\s*\[script info\]/i.test(text) || /^\s*dialogue\s*:/im.test(text) && /\[events\]/i.test(text)) {
    body = assToVtt(text);
  }
  else {
    // SRT and WebVTT: a cue is lines after a "start --> end" line
    const blocks = text.replace(/^WEBVTT[^\n]*\n/, "").split(/\n{2,}/);
    const cues = [];
    for (const block of blocks) {
      const lines = block.split("\n");
      const at = lines.findIndex(line => line.includes("-->"));
      if (at < 0) {
        continue;
      }
      const timing = /^\s*([\d:.,]+)\s*-->\s*([\d:.,]+)(.*)$/.exec(lines[at]);
      const start = timing && vttTime(timing[1]);
      const end = timing && vttTime(timing[2]);
      // <font> is SRT's; WebVTT keeps <i>, <b> and <u>
      const words = lines.slice(at + 1).join("\n").replace(/<\/?font[^>]*>/gi, "").replace(/\{\\[^}]*\}/g, "").trim();
      if (start && end && words) {
        // the cue settings (position and the like) a WebVTT cue may have
        const settings = /^[\s\w:%.-]*$/.test(timing[3]) ? timing[3].trimEnd() : "";
        cues.push(`${start} --> ${end}${settings}\n${words}`);
      }
    }
    body = cues.join("\n\n");
  }
  return body ? `WEBVTT\n\n${body}\n` : null;
};

const writeSubtitles = (name, vtt) => {
  fs.writeFileSync(subtitlesOf(name), vtt, {mode: 0o640});
  fs.rmSync(noSubsOf(name), {force: true});
};

// subtitles sent for one (staff): {ok, video} or {error}
const setSubtitles = (id, data) => {
  const video = byId(id);
  if (!video) {
    return {error: "No such video."};
  }
  if (!data || data.length === 0 || data.length > MAX_SUBTITLE_BYTES) {
    return {error: `A subtitle file, ${MAX_SUBTITLE_BYTES / 1024 / 1024} MB at most, please.`};
  }
  const vtt = toVtt(data);
  if (!vtt) {
    return {error: "No subtitles were found in that file. It has to be an .srt, .vtt, .ass or .ssa file."};
  }
  writeSubtitles(video.name, vtt);
  console.log(`[theatre videos] subtitles added to "${logText(video.name)}"`);
  return {ok: true, video, cues: vtt.split("-->").length - 1};
};

// taken off one; the video is not looked through for them again
const removeSubtitles = id => {
  const video = byId(id);
  if (!video) {
    return null;
  }
  fs.rmSync(subtitlesOf(video.name), {force: true});
  fs.writeFileSync(noSubsOf(video.name), "", {mode: 0o640});
  console.log(`[theatre videos] subtitles taken off "${logText(video.name)}"`);
  return video;
};

const serveSubtitles = (req, res, id) => {
  const video = byId(id);
  const vtt = video && fs.existsSync(subtitlesOf(video.name)) ? fs.readFileSync(subtitlesOf(video.name)) : null;
  if (!vtt) {
    res.writeHead(404, {"Content-Type": "text/plain", "Content-Length": 9, "Cache-Control": "no-cache"});
    res.end("Not found");
    return;
  }
  // its address stays when subtitles are added or changed
  res.writeHead(200, {"Content-Type": "text/vtt; charset=utf-8", "Content-Length": vtt.length,
    "Cache-Control": "no-cache", "X-Content-Type-Options": "nosniff"});
  res.end(req.method === "HEAD" ? undefined : vtt);
};

// ---- ffmpeg ---------------------------------------------------------------
// a program's run: {code, out, err}; code is null when it could not start
const run = (program, args, timeoutMs = 3 * 3600000) => new Promise(resolve => {
  let out = "";
  let err = "";
  let child;
  try {
    child = spawn(program, args, {stdio: ["ignore", "pipe", "pipe"], windowsHide: true});
  }
  catch (error) {
    resolve({code: null, out, err: error.message});
    return;
  }
  const timer = setTimeout(() => child.kill("SIGKILL"), timeoutMs);
  child.stdout.on("data", chunk => {
    out = (out + chunk).slice(-4 * 1024 * 1024);
  });
  child.stderr.on("data", chunk => {
    err = (err + chunk).slice(-8192);
  });
  child.on("error", error => {
    clearTimeout(timer);
    resolve({code: null, out, err: error.message});
  });
  child.on("close", code => {
    clearTimeout(timer);
    resolve({code, out, err});
  });
});

let ffmpegThere = null; // found once
const hasFfmpeg = async () => {
  if (ffmpegThere === null) {
    const [ffmpeg, ffprobe] = await Promise.all([run(config.ffmpeg, ["-version"], 15000), run(config.ffprobe, ["-version"], 15000)]);
    ffmpegThere = ffmpeg.code === 0 && ffprobe.code === 0;
    if (!ffmpegThere) {
      console.log("[theatre videos] ffmpeg or ffprobe not found: uploads are kept as sent, and subtitles only come from files added by hand");
    }
  }
  return ffmpegThere;
};

// a file's streams: {format, streams: [{index, type, codec, language, title, isDefault, forced}]}, or null
const probe = async file => {
  const result = await run(config.ffprobe, ["-v", "error", "-show_entries",
    "format=format_name:stream=index,codec_type,codec_name:stream_tags=language,title:stream_disposition=default,forced",
    "-of", "json", file], 120000);
  if (result.code !== 0) {
    return null;
  }
  try {
    const data = JSON.parse(result.out);
    return {
      format: String((data.format || {}).format_name || ""),
      streams: (data.streams || []).map(stream => ({
        index: stream.index, type: stream.codec_type, codec: String(stream.codec_name || ""),
        language: String((stream.tags || {}).language || "").toLowerCase(), title: String((stream.tags || {}).title || ""),
        isDefault: Boolean((stream.disposition || {}).default), forced: Boolean((stream.disposition || {}).forced),
      })),
    };
  }
  catch (err) {
    return null;
  }
};

// subtitles ffmpeg can write as WebVTT; pictures (Blu-ray's PGS, DVD's
// VobSub) cannot be
const TEXT_SUBTITLES = ["subrip", "srt", "ass", "ssa", "webvtt", "mov_text", "text", "microdvd", "subviewer", "jacosub", "sami", "realtext", "stl", "mpl2", "vplayer", "pjs"];
const ENGLISH = ["eng", "en", "en-us", "en-gb"];
// the track to show: English and whole (not "forced", which has only the
// odd foreign line), else the file's default, else the first
const pickSubtitles = streams => {
  const text = streams.filter(stream => stream.type === "subtitle" && TEXT_SUBTITLES.includes(stream.codec));
  const whole = text.filter(stream => !stream.forced && !/forced|signs/i.test(stream.title));
  return whole.find(stream => ENGLISH.includes(stream.language)) || whole.find(stream => stream.isDefault)
    || whole[0] || text[0] || null;
};

// a video's own subtitles written beside it as <name>.vtt: a few words for staff
const extractSubtitles = async (file, name, info = null) => {
  const found = info || await probe(file);
  if (!found) {
    fs.writeFileSync(noSubsOf(name), "", {mode: 0o640});
    return "Its subtitles could not be read.";
  }
  const stream = pickSubtitles(found.streams);
  if (!stream) {
    fs.writeFileSync(noSubsOf(name), "", {mode: 0o640});
    return found.streams.some(one => one.type === "subtitle")
      ? "It only has picture subtitles (Blu-ray or DVD), which cannot be shown: add an .srt for it."
      : "It has no subtitles of its own.";
  }
  const out = path.join(FOLDER(), `new-${crypto.randomBytes(6).toString("hex")}.vtt`);
  const result = await run(config.ffmpeg, ["-v", "error", "-nostdin", "-y", "-i", file, "-map", `0:${stream.index}`, "-c:s", "webvtt", "-f", "webvtt", out]);
  const vtt = result.code === 0 && fs.existsSync(out) ? toVtt(fs.readFileSync(out)) : null;
  fs.rmSync(out, {force: true});
  if (!vtt) {
    // not tried again by itself: subtitles can still be added by hand
    fs.writeFileSync(noSubsOf(name), "", {mode: 0o640});
    console.log(`[theatre videos] subtitles of "${logText(name)}" could not be taken out: ${logText(result.err.trim().split("\n").pop() || "")}`);
    return "Its subtitles could not be taken out of it.";
  }
  writeSubtitles(name, vtt);
  const which = [stream.language && stream.language !== "und" ? stream.language : "", stream.title].filter(Boolean).join(", ");
  console.log(`[theatre videos] subtitles taken out of "${logText(name)}"${which ? ` (${logText(which)})` : ""}`);
  return `Its subtitles${which ? ` (${which})` : ""} are shown with it.`;
};

// videos whose subtitles are being looked for, and those waiting to be: one at a time
const looking = new Set();
let lookingChain = Promise.resolve();
// the folder's videos not looked through yet (copied in on the machine):
// an .srt beside one is made its .vtt, else ffmpeg looks in the video.
const lookForSubtitles = () => {
  for (const video of videos()) {
    if (looking.has(video.name) || fs.existsSync(subtitlesOf(video.name)) || fs.existsSync(noSubsOf(video.name))) {
      continue;
    }
    if (fs.existsSync(srtOf(video.name))) {
      const vtt = toVtt(fs.readFileSync(srtOf(video.name)));
      if (vtt) {
        writeSubtitles(video.name, vtt);
        continue;
      }
    }
    if (ffmpegThere === false) {
      continue;
    }
    looking.add(video.name);
    lookingChain = lookingChain.then(async () => {
      try {
        if (await hasFfmpeg() && fs.existsSync(video.file)) {
          await extractSubtitles(video.file, video.name);
        }
      }
      catch (err) {
        console.log(`[theatre videos] looking for subtitles in "${logText(video.name)}" failed: ${logText(err.message)}`);
      }
      looking.delete(video.name);
    });
  }
};

const PLAYABLE_VIDEO = {mp4: ["h264", "av1", "vp9"], webm: ["vp8", "vp9", "av1"]};
const PLAYABLE_SOUND = {mp4: ["aac", "mp3", "opus", "flac"], webm: ["opus", "vorbis"]};
// an upload made playable: {file, ext} of what to keep (maybe made anew
// from it), or {error}
const makePlayable = async (file, info) => {
  const video = info.streams.find(stream => stream.type === "video" && !["mjpeg", "png", "bmp"].includes(stream.codec));
  const sound = info.streams.find(stream => stream.type === "audio" && stream.isDefault) || info.streams.find(stream => stream.type === "audio");
  if (!video) {
    return {error: "That file has no video in it."};
  }
  const container = /matroska|webm/.test(info.format) ? "webm" : /mp4|mov/.test(info.format) ? "mp4" : null;
  if (container && PLAYABLE_VIDEO[container].includes(video.codec) && (!sound || PLAYABLE_SOUND[container].includes(sound.codec))) {
    return {file, ext: container === "webm" ? ".webm" : ".mp4"};
  }
  if (!PLAYABLE_VIDEO.mp4.includes(video.codec)) {
    return {error: `Its video is ${video.codec.toUpperCase()}, which the game cannot play. Make it H.264 first (HandBrake does: its "Fast 1080p30" preset).`};
  }
  // the same pictures in an MP4, its sound made AAC when it is not playable
  const out = path.join(FOLDER(), `new-${crypto.randomBytes(6).toString("hex")}.mp4`);
  const keepSound = !sound || PLAYABLE_SOUND.mp4.includes(sound.codec);
  const args = ["-v", "error", "-nostdin", "-y", "-i", file, "-map", `0:${video.index}`];
  if (sound) {
    args.push("-map", `0:${sound.index}`);
  }
  args.push("-c:v", "copy", ...(keepSound ? ["-c:a", "copy"] : ["-c:a", "aac", "-b:a", "192k", "-ac", "2"]),
    "-sn", "-dn", "-map_metadata", "-1", "-movflags", "+faststart", out);
  const result = await run(config.ffmpeg, args);
  if (result.code !== 0 || !fs.existsSync(out)) {
    fs.rmSync(out, {force: true});
    console.log(`[theatre videos] making an upload an MP4 failed: ${logText(result.err.trim().split("\n").pop() || "")}`);
    return {error: "The server could not make that file playable. Make it an MP4 (H.264, AAC) first: HandBrake does."};
  }
  return {file: out, ext: ".mp4", made: true, soundMade: !keepSound};
};

// the file's extension from its first bytes, or null for one no player plays
const kindOf = head => {
  if (head.length >= 12 && head.toString("latin1", 4, 8) === "ftyp") {
    return ".mp4";
  }
  if (head.length >= 4 && head.readUInt32BE(0) === 0x1A45DFA3) {
    return ".webm";
  }
  return null;
};

// an upload, the request's body written straight to the folder (a video is
// too big to hold): {video} or {error}.
const add = (req, name, by) => new Promise(resolve => {
  const clean = cleanName(name);
  if (!clean) {
    resolve({error: "Give the video a name."});
    return;
  }
  if (find(clean)) {
    resolve({error: `There is already a video called "${clean}".`});
    return;
  }
  fs.mkdirSync(FOLDER(), {recursive: true, mode: 0o700});
  const waiting = path.join(FOLDER(), `new-${crypto.randomBytes(6).toString("hex")}`);
  // readable by the group too: an ACL on the folder can then let another
  // user (the one an admin logs in as) see the videos, as
  // tools/install-theatre-videos.sh says
  const out = fs.createWriteStream(waiting, {mode: 0o640});
  let size = 0;
  let head = Buffer.alloc(0);
  let failed = null;
  const fail = error => {
    if (!failed) {
      failed = error;
      req.unpipe(out);
      req.resume();
      out.destroy();
      fs.rm(waiting, {force: true}, () => resolve({error}));
    }
  };
  req.on("data", chunk => {
    size += chunk.length;
    if (head.length < 12) {
      head = Buffer.concat([head, chunk]).subarray(0, 12);
    }
    if (size > MAX_BYTES) {
      fail(`That file is too big: ${MAX_BYTES / 1024 / 1024 / 1024} GB at most.`);
    }
  });
  req.on("error", () => fail("The upload was cut short."));
  out.on("error", () => fail("The server could not save it."));
  out.on("finish", async () => {
    if (failed) {
      return;
    }
    let ext = kindOf(head);
    if (!ext) {
      fail("That is not a video the game can play: an MP4 (H.264), a WebM or an MKV.");
      return;
    }
    // with ffmpeg: made playable if it is not, and its subtitles taken out
    let info = null;
    let kept = {file: waiting, ext};
    if (await hasFfmpeg()) {
      info = await probe(waiting);
      if (!info) {
        fail("That file could not be read as a video.");
        return;
      }
      kept = await makePlayable(waiting, info);
      if (kept.error) {
        fail(kept.error);
        return;
      }
      ext = kept.ext;
    }
    const file = path.join(FOLDER(), `${clean}${ext}`);
    if (find(clean) || fs.existsSync(file)) {
      if (kept.file !== waiting) {
        fs.rmSync(kept.file, {force: true});
      }
      fail(`There is already a video called "${clean}".`);
      return;
    }
    let said = "";
    if (info) {
      looking.add(clean);
      try {
        said = await extractSubtitles(waiting, clean, info);
      }
      finally {
        looking.delete(clean);
      }
      if (kept.made) {
        said = `${kept.soundMade ? "Its sound was made AAC so the game can play it. " : "It was made an MP4 so the game can play it. "}${said}`;
      }
    }
    if (kept.file !== waiting) {
      fs.rmSync(waiting, {force: true});
    }
    fs.renameSync(kept.file, file);
    forget();
    console.log(`[theatre videos] ${logText(by)} uploaded "${logText(clean)}" (${logText(size)} bytes)`);
    resolve({video: find(clean), said});
  });
  req.pipe(out);
});

// another name for one: {video, before} or {error}.
const rename = (id, name) => {
  const video = byId(id);
  const clean = cleanName(name);
  if (!video) {
    return {error: "No such video."};
  }
  if (!clean) {
    return {error: "Give the video a name."};
  }
  const other = find(clean);
  if (other && other.id !== video.id) {
    return {error: `There is already a video called "${clean}".`};
  }
  fs.renameSync(video.file, path.join(FOLDER(), `${clean}${path.extname(video.file)}`));
  for (const [from, to] of [[subtitlesOf(video.name), subtitlesOf(clean)], [noSubsOf(video.name), noSubsOf(clean)], [srtOf(video.name), srtOf(clean)]]) {
    if (from !== to && fs.existsSync(from)) {
      fs.renameSync(from, to);
    }
  }
  forget();
  console.log(`[theatre videos] "${logText(video.name)}" renamed to "${logText(clean)}"`);
  return {video: find(clean), before: video.name};
};

// one deleted: the video it was, or null.
const remove = id => {
  const video = byId(id);
  if (!video) {
    return null;
  }
  fs.rmSync(video.file, {force: true});
  for (const file of [subtitlesOf(video.name), noSubsOf(video.name), srtOf(video.name)]) {
    fs.rmSync(file, {force: true});
  }
  forget();
  console.log(`[theatre videos] "${logText(video.name)}" deleted`);
  return video;
};

// a video's file, or the part of it a Range header asks for: a player
// that seeks asks for the part from there on.
const serve = (req, res, id) => {
  const video = byId(id);
  if (!video) {
    res.writeHead(404, {"Content-Type": "text/plain", "Content-Length": 9});
    res.end("Not found");
    return;
  }
  const headers = {"Content-Type": video.type, "Accept-Ranges": "bytes", "X-Content-Type-Options": "nosniff",
    // its address changes with the file, so it may be kept
    "Cache-Control": "public, max-age=86400"};
  let start = 0;
  let end = video.bytes - 1;
  let status = 200;
  const range = /^bytes=(\d*)-(\d*)$/.exec(String(req.headers.range || "").trim());
  if (range && (range[1] || range[2])) {
    if (range[1]) {
      start = Number(range[1]);
      end = range[2] ? Math.min(Number(range[2]), end) : end;
    }
    else {
      start = Math.max(0, video.bytes - Number(range[2]));
    }
    if (start > end || start >= video.bytes) {
      res.writeHead(416, {"Content-Range": `bytes */${video.bytes}`, "Content-Length": 0});
      res.end();
      return;
    }
    status = 206;
    headers["Content-Range"] = `bytes ${start}-${end}/${video.bytes}`;
  }
  headers["Content-Length"] = end - start + 1;
  res.writeHead(status, headers);
  if (req.method === "HEAD" || video.bytes === 0) {
    res.end();
    return;
  }
  const input = fs.createReadStream(video.file, {start, end});
  input.on("error", () => res.destroy());
  res.on("close", () => input.destroy());
  input.pipe(res);
};

// at start: uploads cut short go.
const load = () => {
  let gone = 0;
  for (const name of fs.existsSync(FOLDER()) ? fs.readdirSync(FOLDER()) : []) {
    if (name.startsWith("new-")) {
      fs.rmSync(path.join(FOLDER(), name), {force: true});
      gone++;
    }
  }
  console.log(`[theatre videos] ${logText(videos().length)} videos${gone ? `, ${logText(gone)} unfinished uploads removed` : ""}`);
  lookForSubtitles();
};

module.exports = {MAX_BYTES, MAX_SUBTITLE_BYTES, ID, list, find, byId, lengthOf, add, rename, remove, serve, load,
  setSubtitles, removeSubtitles, serveSubtitles, toVtt, hasFfmpeg};
