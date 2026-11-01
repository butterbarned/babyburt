"use strict";

// the theatre's videos (lib/theatrevideos.js) and their subtitles: those
// taken out of a video by ffmpeg, those added by hand (SRT, WebVTT, ASS), an
// MKV made an MP4 and sound the game cannot play made AAC. needs ffmpeg and
// ffprobe; without them only the parts that do not are run.
//
//   node test/theatre.js

const assert = require("assert");
const {execFileSync} = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "theatre-test-"));
process.env.AJ_DATA_DIR = dataDir;
const videos = require("../lib/theatrevideos.js");
const harness = require("./harness.js");
const config = require("../config.js");

const folder = path.join(dataDir, "theatre-videos");
const work = fs.mkdtempSync(path.join(os.tmpdir(), "theatre-media-"));
const has = program => {
  try {
    execFileSync(program, ["-version"], {stdio: "ignore"});
    return true;
  }
  catch (err) {
    return false;
  }
};
const ffmpeg = (...args) => execFileSync(config.ffmpeg, ["-v", "error", "-y", ...args], {stdio: ["ignore", "ignore", "inherit"]});
const probe = file => JSON.parse(execFileSync(config.ffprobe, ["-v", "error", "-show_entries", "stream=codec_type,codec_name",
  "-show_entries", "format=format_name", "-of", "json", file]).toString());
const upload = (file, name) => videos.add(fs.createReadStream(file), name, "test");
const vttOf = name => fs.readFileSync(path.join(folder, `${name}.vtt`), "utf8");

const SRT = "1\r\n00:00:00,100 --> 00:00:01,000\r\n<font color=\"red\">Hello there</font>\r\n\r\n2\r\n00:00:01,000 --> 00:00:01,900\r\nSecond <i>line</i>\r\n";
const FORCED_SRT = "1\n00:00:00,100 --> 00:00:01,000\nOnly a sign\n";
const ASS = `[Script Info]
Title: test

[V4+ Styles]
Format: Name, Fontname
Style: Default,Arial

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:01.50,0:00:02.00,Default,,0,0,0,,{\\an8}Second, with a comma\\Nand a break
Dialogue: 0,0:00:00.10,0:00:01.25,Default,,0,0,0,,{\\i1}First{\\i0}
`;

// a fake response, for serveSubtitles
const response = () => {
  const res = {status: 0, headers: {}, body: null};
  res.writeHead = (status, headers) => {
    res.status = status;
    res.headers = headers;
  };
  res.end = body => {
    res.body = body === undefined ? null : String(body);
  };
  return res;
};

const main = async () => {
  // ---- what is sent, made WebVTT
  const fromSrt = videos.toVtt(Buffer.from(`﻿${SRT}`));
  assert.strictEqual(fromSrt, "WEBVTT\n\n00:00:00.100 --> 00:00:01.000\nHello there\n\n00:00:01.000 --> 00:00:01.900\nSecond <i>line</i>\n");
  const fromAss = videos.toVtt(ASS);
  assert.strictEqual(fromAss, "WEBVTT\n\n00:00:00.100 --> 00:00:01.250\nFirst\n\n00:00:01.500 --> 00:00:02.000\nSecond, with a comma\nand a break\n");
  assert.strictEqual(videos.toVtt(fromSrt), fromSrt, "WebVTT stays as it is");
  assert.strictEqual(videos.toVtt("not subtitles at all"), null);
  console.log("ok: SRT, ASS and WebVTT are made WebVTT");

  if (!has(config.ffmpeg) || !has(config.ffprobe)) {
    console.log("skipped: ffmpeg is not installed, so nothing is taken out of videos");
    return;
  }
  fs.writeFileSync(path.join(work, "en.srt"), SRT);
  fs.writeFileSync(path.join(work, "forced.srt"), FORCED_SRT);
  const picture = ["-f", "lavfi", "-i", "testsrc=duration=2:size=160x120:rate=10"];
  const sound = ["-f", "lavfi", "-i", "sine=frequency=440:duration=2"];

  // ---- an MKV (H.264, AC-3 sound, a forced track and an English one): an
  // MP4 with AAC sound, and the English subtitles beside it
  ffmpeg(...picture, ...sound, "-i", path.join(work, "forced.srt"), "-i", path.join(work, "en.srt"),
    "-map", "0:v", "-map", "1:a", "-map", "2:s", "-map", "3:s",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "ac3", "-c:s", "srt",
    "-metadata:s:s:0", "language=eng", "-disposition:s:0", "forced",
    "-metadata:s:s:1", "language=eng", path.join(work, "movie.mkv"));
  let result = await upload(path.join(work, "movie.mkv"), "Movie Night");
  assert.ok(result.video, JSON.stringify(result));
  assert.strictEqual(path.extname(result.video.file), ".mp4");
  assert.match(result.said, /sound was made AAC/);
  assert.match(result.said, /subtitles \(eng\) are shown/);
  const made = probe(result.video.file);
  assert.match(made.format.format_name, /mp4/);
  assert.deepStrictEqual(made.streams.map(stream => `${stream.codec_type}:${stream.codec_name}`), ["video:h264", "audio:aac"]);
  assert.match(vttOf("Movie Night"), /Hello there/, "the whole English track, not the forced one");
  assert.ok(!/Only a sign/.test(vttOf("Movie Night")));
  assert.deepStrictEqual(fs.readdirSync(folder).sort(), ["Movie Night.mp4", "Movie Night.vtt"], "nothing left over");
  console.log("ok: an MKV is made an MP4 with AAC sound, and its English subtitles are taken out");

  // served beside it, and listed
  const id = result.video.id;
  let res = response();
  videos.serveSubtitles({method: "GET"}, res, id);
  assert.strictEqual(res.status, 200);
  assert.match(res.headers["Content-Type"], /^text\/vtt/);
  assert.match(res.body, /^WEBVTT/);
  assert.strictEqual(videos.list().find(video => video.id === id).subtitles, true);

  // ---- an MP4 with its own (mov_text) subtitles is kept as it is
  ffmpeg(...picture, ...sound, "-i", path.join(work, "en.srt"), "-map", "0:v", "-map", "1:a", "-map", "2:s",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-c:s", "mov_text", path.join(work, "clip.mp4"));
  const before = fs.statSync(path.join(work, "clip.mp4")).size;
  result = await upload(path.join(work, "clip.mp4"), "Clip");
  assert.strictEqual(result.video.bytes, before, "a playable MP4 is not made again");
  assert.match(vttOf("Clip"), /Second <i>line<\/i>|Second line/);
  console.log("ok: an MP4's own subtitles are taken out, the video kept as it was");

  // ---- one with none, and one the game cannot play
  ffmpeg(...picture, "-c:v", "libx264", "-pix_fmt", "yuv420p", path.join(work, "plain.mp4"));
  result = await upload(path.join(work, "plain.mp4"), "Plain");
  assert.match(result.said, /no subtitles/);
  assert.ok(fs.existsSync(path.join(folder, "Plain.nosubs")));
  res = response();
  videos.serveSubtitles({method: "GET"}, res, result.video.id);
  assert.strictEqual(res.status, 404);
  let hevc = true;
  try {
    ffmpeg(...picture, "-c:v", "libx265", "-pix_fmt", "yuv420p", path.join(work, "hevc.mkv"));
  }
  catch (err) {
    hevc = false;
  }
  if (hevc) {
    result = await upload(path.join(work, "hevc.mkv"), "Too New");
    assert.match(result.error, /HEVC/);
    assert.ok(!fs.readdirSync(folder).some(name => name.startsWith("new-") || name.startsWith("Too New")), "nothing kept");
  }
  console.log("ok: one without subtitles says so; HEVC is refused");

  // ---- added by hand, taken off, and carried by a rename
  const plain = videos.find("Plain");
  assert.match(videos.setSubtitles(plain.id, Buffer.from(ASS)).error || "", /^$/);
  assert.match(vttOf("Plain"), /Second, with a comma/);
  assert.ok(!fs.existsSync(path.join(folder, "Plain.nosubs")));
  assert.match(videos.setSubtitles(plain.id, Buffer.from("nothing")).error, /No subtitles/);
  const renamed = videos.rename(plain.id, "Plain Two");
  assert.ok(renamed.video);
  assert.match(vttOf("Plain Two"), /Second, with a comma/);
  assert.ok(!fs.existsSync(path.join(folder, "Plain.vtt")));
  videos.removeSubtitles(renamed.video.id);
  assert.ok(!fs.existsSync(path.join(folder, "Plain Two.vtt")));
  assert.ok(fs.existsSync(path.join(folder, "Plain Two.nosubs")), "not looked for again");
  videos.remove(videos.find("Movie Night").id);
  assert.ok(!fs.readdirSync(folder).some(name => name.startsWith("Movie Night")), "its subtitles go with it");
  console.log("ok: subtitles added by hand, taken off, renamed and deleted with their video");

  // ---- copied in on the machine: an .srt beside one, and one with its own
  fs.copyFileSync(path.join(work, "plain.mp4"), path.join(folder, "Copied.mp4"));
  fs.writeFileSync(path.join(folder, "Copied.srt"), SRT);
  fs.copyFileSync(path.join(work, "clip.mp4"), path.join(folder, "Copied Clip.mp4"));
  const listed = videos.list();
  assert.strictEqual(listed.find(video => video.name === "Copied").subtitles, true, "the .srt is made its .vtt at once");
  assert.strictEqual(listed.find(video => video.name === "Copied Clip").lookingForSubtitles, true);
  for (let tries = 0; tries < 100 && !fs.existsSync(path.join(folder, "Copied Clip.vtt")); tries++) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.match(vttOf("Copied Clip"), /Hello there/);
  console.log("ok: videos copied into the folder get their subtitles too");

  // ---- through a real server: the admin panel's routes, and the address
  // the game page asks for subtitles at
  const HTTP_PORT = 18097;
  const BASE = `http://127.0.0.1:${HTTP_PORT}`;
  await harness.withServer("theatre server", HTTP_PORT, 19357, async () => {
    let cookie = "";
    const admin = async (urlPath, body, json = true) => {
      const res = await fetch(`${BASE}${urlPath}`, body === undefined ? {headers: {cookie}}
        : {method: "POST", headers: {cookie, ...(json ? {"Content-Type": "application/json"} : {})}, body: json ? JSON.stringify(body) : body});
      cookie = (res.headers.get("set-cookie") || cookie).split(";")[0];
      return {status: res.status, data: await res.json().catch(() => ({}))};
    };
    assert.strictEqual((await admin("/admin/api/setup", {password: "AdminPass99!"})).status, 200);
    assert.strictEqual((await admin("/admin/api/login", {password: "AdminPass99!"})).status, 200);
    let sent = await admin("/admin/api/theatre?name=Over%20The%20Web", fs.readFileSync(path.join(work, "movie.mkv")), false);
    assert.strictEqual(sent.status, 200, JSON.stringify(sent.data));
    assert.match(sent.data.ok, /subtitles \(eng\) are shown with it/);
    const shown = (await admin("/admin/api/theatre")).data.videos.find(video => video.name === "Over The Web");
    assert.strictEqual(shown.subtitles, true);
    let vtt = await fetch(`${BASE}/theatre/${shown.id}.vtt`);
    assert.strictEqual(vtt.status, 200);
    assert.match(vtt.headers.get("content-type"), /^text\/vtt/);
    assert.match(await vtt.text(), /Hello there/);
    sent = await admin(`/admin/api/theatre?subtitles=${shown.id}`, ASS, false);
    assert.match(sent.data.ok, /has subtitles now \(2 lines\)/);
    assert.match(await (await fetch(`${BASE}/theatre/${shown.id}.vtt`)).text(), /Second, with a comma/);
    sent = await admin(`/admin/api/theatre?nosubtitles=${shown.id}`, {});
    assert.match(sent.data.ok, /no subtitles now/);
    vtt = await fetch(`${BASE}/theatre/${shown.id}.vtt`);
    assert.strictEqual(vtt.status, 404);
    // a visitor cannot add them
    assert.strictEqual((await fetch(`${BASE}/admin/api/theatre?subtitles=${shown.id}`, {method: "POST", body: SRT})).status, 403);
  });
  console.log("ok: the admin panel's routes, and /theatre/<id>.vtt");
};

main().then(() => {
  fs.rmSync(dataDir, {recursive: true, force: true});
  fs.rmSync(work, {recursive: true, force: true});
  console.log("theatre: all passed");
}, err => {
  console.error(err);
  console.error(`(left for a look: ${dataDir})`);
  process.exit(1);
});
