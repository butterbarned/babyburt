"use strict";

// a page for looking a content pack over before it goes in the game:
//   node tools/content/preview.js <pack dir>
// writes <pack dir>/preview.html (open it in a browser; the pictures are
// read from beside it). every item is shown at the size it will be in a
// den, beside an AJ animal standing at its own size in a den (picked on the
// page; drawn by tools/content/animals.py into ../_animals, or a plain box
// of a small animal's size when that has not been run), with its sort line
// in red (an avatar whose feet are below it is drawn in front of the item),
// and what the shop will say about it: name, category, where it goes,
// collections.

const fs = require("fs");
const path = require("path");

const packDir = process.argv[2];
if (!packDir) {
  console.log("usage: node tools/content/preview.js <pack dir>");
  process.exit(1);
}
const pack = JSON.parse(fs.readFileSync(path.join(packDir, "pack.json"), "utf8"));
const animalsFile = path.join(packDir, "..", "_animals", "animals.json");
const animals = fs.existsSync(animalsFile) ? JSON.parse(fs.readFileSync(animalsFile, "utf8")) : [];
// "</" can't end the script from inside the data
const data = JSON.stringify(pack).replace(/</g, "\\u003c");
const animalData = JSON.stringify(animals).replace(/</g, "\\u003c");

const page = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${pack.name.replace(/[<&]/g, "")} pack preview</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font: 13px/1.4 system-ui, sans-serif; color: #2b2b2b; background: #f3efe6; display: flex; height: 100vh; }
  nav { width: 260px; overflow-y: auto; background: #fffaf0; border-right: 1px solid #ddd2bd; padding: 10px; flex: none; }
  nav h3 { margin: 14px 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: .05em; color: #8a7553; }
  nav button { display: flex; justify-content: space-between; width: 100%; border: 0; background: none; padding: 3px 6px; text-align: left; cursor: pointer; border-radius: 4px; font: inherit; }
  nav button:hover { background: #f1e6cf; }
  nav button.on { background: #e2c98f; }
  main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
  header { padding: 10px 14px; border-bottom: 1px solid #ddd2bd; background: #fffaf0; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  header input[type=search] { width: 240px; padding: 5px 8px; }
  .chip { border: 1px solid #c9b48a; background: #fff; border-radius: 12px; padding: 2px 9px; cursor: pointer; font: inherit; }
  .chip.on { background: #8a6d36; color: #fff; border-color: #8a6d36; }
  #count { margin-left: auto; color: #6d6252; }
  #grid { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-wrap: wrap; gap: 12px; align-content: flex-start; }
  .card { background: #fff; border: 1px solid #e0d5bf; border-radius: 8px; padding: 8px; width: min-content; min-width: 210px; }
  .stage { position: relative; display: flex; align-items: flex-end; gap: 6px; padding: 6px; border-radius: 4px; min-height: 90px;
    background: repeating-conic-gradient(#efe7d6 0% 25%, #f8f3e8 0% 50%) 0 0 / 16px 16px; }
  .art { position: relative; flex: none; }
  .art img { display: block; }
  .so { position: absolute; left: -4px; right: -4px; border-top: 2px solid rgba(220, 30, 30, .75); }
  .animal-pic { flex: none; display: block; }
  .animal { flex: none; width: 56px; height: 76px; border-radius: 26px 26px 10px 10px; background: rgba(90, 120, 160, .25);
    border: 1px dashed rgba(60, 90, 140, .6); font-size: 10px; color: #3b5a85; display: flex; align-items: center; justify-content: center; }
  .name { font-weight: 600; margin-top: 6px; }
  .meta { color: #6d6252; font-size: 12px; }
  .flag { display: inline-block; background: #fbe3b0; color: #7a4a00; border-radius: 3px; padding: 0 5px; margin: 2px 2px 0 0; font-size: 11px; }
  .flag.piece { background: #d9e6f5; color: #234e80; }
  #more { margin: 10px auto; padding: 6px 16px; }
  label { user-select: none; }
  header.sizes { padding-top: 6px; padding-bottom: 6px; }
  header.sizes input[type=range] { width: 160px; vertical-align: middle; }
  .sep { width: 1px; height: 20px; background: #ddd2bd; }
  #tried .chip { background: #f6ecd6; }
  #sizesOut { margin: 0 14px; height: 70px; font: 12px monospace; }
  .tried-size { color: #9a3d00; font-weight: 600; }
</style>
</head>
<body>
<nav id="nav"></nav>
<main>
  <header>
    <input type="search" id="q" placeholder="Search names, tags, ids...">
    <span id="chips"></span>
    <label><select id="place"><option value="">anywhere</option><option value="floor">floor</option><option value="wall">wall</option><option value="rug">flat (rug)</option></select></label>
    <label><select id="flag"><option value="">any flags</option></select></label>
    <label>beside: <select id="animal"></select></label>
    <label><select id="pose"><option value="front">facing front</option><option value="side">side on</option></select></label>
    <label><input type="checkbox" id="mirror" checked> mirrored</label>
    <span id="count"></span>
  </header>
  <header class="sizes">
    <label title="Everything, animals too: 100% is the size in a den">View <input type="range" id="zoom" min="25" max="200" step="5" value="100"> <b id="zoomText">100%</b></label>
    <button id="zoom100" class="chip">true size</button>
    <span class="sep"></span>
    <label id="tryLabel" title="Only the items, not the animal: how big this group would be made">Try a size for <b id="tryTarget">(pick a collection, a category chip or Everything)</b>
      <input type="range" id="try" min="40" max="200" step="5" value="100" disabled> <b id="tryText">100%</b></label>
    <button id="tryReset" class="chip" disabled>reset</button>
    <span class="sep"></span>
    <span id="tried"></span>
    <button id="copySizes" class="chip">copy sizes</button>
  </header>
  <textarea id="sizesOut" readonly hidden></textarea>
  <div id="grid"></div>
</main>
<script>
const pack = ${data};
const animals = ${animalData};
const PAGE = 240;
const state = {collection: "", category: "", q: "", place: "", flag: "", zoom: 1, shown: PAGE,
  animal: (animals.find(a => a.name === "Bunny") || animals[0] || {}).id, pose: "front", mirror: true};
const byId = Object.fromEntries(pack.collections.map(c => [c.id, c]));
const catName = Object.fromEntries(pack.categories.map(c => [c.id, c.name]));
const el = (tag, props = {}, ...kids) => {
  const node = Object.assign(document.createElement(tag), props);
  kids.forEach(kid => node.append(kid));
  return node;
};

const nav = document.getElementById("nav");
const navButton = (label, count, id) => {
  const b = el("button", {}, el("span", {textContent: label}), el("span", {textContent: count}));
  b.dataset.id = id;
  b.onclick = () => { state.collection = id; state.shown = PAGE; draw(); };
  return b;
};
nav.append(navButton("Everything", pack.items.length, ""));
nav.append(navButton("Flagged for a look", pack.items.filter(i => i.flags.length).length, "@flagged"));
for (const group of pack.groups) {
  const cols = pack.collections.filter(c => c.group === group);
  if (!cols.length) continue;
  nav.append(el("h3", {textContent: group}));
  cols.forEach(c => nav.append(navButton(c.name, c.count, c.id)));
}

const chips = document.getElementById("chips");
for (const c of pack.categories) {
  const n = pack.items.filter(i => i.category === c.id).length;
  if (!n) continue;
  const b = el("button", {className: "chip", textContent: c.name + " " + n});
  b.dataset.id = c.id;
  b.onclick = () => { state.category = state.category === c.id ? "" : c.id; state.shown = PAGE; draw(); };
  chips.append(b);
}
const flagSelect = document.getElementById("flag");
for (const f of [...new Set(pack.items.flatMap(i => i.flags))].sort()) flagSelect.append(el("option", {value: f, textContent: f}));
document.getElementById("q").oninput = e => { state.q = e.target.value.toLowerCase(); state.shown = PAGE; draw(); };
document.getElementById("place").onchange = e => { state.place = e.target.value; state.shown = PAGE; draw(); };
flagSelect.onchange = e => { state.flag = e.target.value; state.shown = PAGE; draw(); };
const animalSelect = document.getElementById("animal");
if (!animals.length) {
  animalSelect.append(el("option", {textContent: "a small animal (run tools/content/animals.py for real ones)"}));
}
for (const a of animals) animalSelect.append(el("option", {value: a.id, textContent: a.name, selected: a.id === state.animal}));
animalSelect.onchange = e => { state.animal = Number(e.target.value); draw(); };
document.getElementById("pose").onchange = e => { state.pose = e.target.value; draw(); };
document.getElementById("mirror").onchange = e => { state.mirror = e.target.checked; draw(); };
// view zoom: everything, the animal too
const zoom = document.getElementById("zoom");
const setZoom = percent => {
  state.zoom = percent / 100;
  zoom.value = percent;
  document.getElementById("zoomText").textContent = percent + "%";
  draw();
};
zoom.oninput = e => setZoom(Number(e.target.value));
document.getElementById("zoom100").onclick = () => setZoom(100);

// sizes tried for a collection or a category chip (the items only), kept in
// this browser; "copy sizes" gives them as the converter reads them
// (category_map.json collectionScale / categoryScale)
const SIZES_KEY = "contentPreviewSizes:" + pack.id;
const tried = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem(SIZES_KEY));
    return {allScale: (saved && saved.allScale) || 1, collectionScale: {...(saved && saved.collectionScale)}, categoryScale: {...(saved && saved.categoryScale)}};
  }
  catch {
    return {allScale: 1, collectionScale: {}, categoryScale: {}};
  }
})();
const saveTried = () => localStorage.setItem(SIZES_KEY, JSON.stringify(tried));
// what the slider sizes: the collection on show, else the category chip,
// else (Everything) every item
const tryTarget = () => (byId[state.collection] ? {map: "collectionScale", id: state.collection, name: byId[state.collection].name}
  : state.category ? {map: "categoryScale", id: state.category, name: catName[state.category]}
  : state.collection === "" ? {map: "allScale", name: "every item"} : null);
const triedOf = target => (target.map === "allScale" ? tried.allScale : tried[target.map][target.id]) || 1;
// an item's size as tried: as the converter works it out, its category's
// times the first of its collections that has one
const triedFactor = item => (tried.allScale || 1) * (tried.categoryScale[item.category] || 1)
  * (item.collections.map(c => tried.collectionScale[c]).find(Boolean) || 1);
const tryInput = document.getElementById("try");
const setTried = percent => {
  const target = tryTarget();
  if (!target) return;
  if (target.map === "allScale") tried.allScale = percent / 100;
  else if (percent === 100) delete tried[target.map][target.id];
  else tried[target.map][target.id] = percent / 100;
  saveTried();
  draw();
};
tryInput.oninput = e => setTried(Number(e.target.value));
document.getElementById("tryReset").onclick = () => setTried(100);
const showTried = () => {
  const target = tryTarget();
  const percent = target ? Math.round(triedOf(target) * 100) : 100;
  document.getElementById("tryTarget").textContent = target ? target.name : "(pick a collection, a category chip or Everything)";
  tryInput.disabled = !target;
  document.getElementById("tryReset").disabled = !target;
  tryInput.value = percent;
  document.getElementById("tryText").textContent = percent + "%";
  const list = document.getElementById("tried");
  const entries = [
    ...(tried.allScale !== 1 ? [{label: "Everything", f: tried.allScale, go: () => { state.collection = ""; state.category = ""; }}] : []),
    ...Object.entries(tried.collectionScale).map(([id, f]) => ({label: byId[id] ? byId[id].name : id, f, go: () => { state.collection = id; state.category = ""; }})),
    ...Object.entries(tried.categoryScale).map(([id, f]) => ({label: catName[id] || id, f, go: () => { state.category = id; state.collection = ""; }})),
  ];
  list.replaceChildren(...(entries.length ? entries.map(e => {
    const b = el("button", {className: "chip", textContent: e.label + " " + Math.round(e.f * 100) + "%", title: "show it"});
    b.onclick = () => { e.go(); state.shown = PAGE; draw(); };
    return b;
  }) : [el("span", {className: "meta", textContent: "no sizes tried yet"})]));
};
document.getElementById("copySizes").onclick = () => {
  const out = document.getElementById("sizesOut");
  out.value = JSON.stringify(tried, null, 1);
  out.hidden = false;
  out.select();
  if (navigator.clipboard) navigator.clipboard.writeText(out.value).catch(() => {});
};

const matches = item => {
  if (state.collection === "@flagged" ? !item.flags.length : state.collection && !item.collections.includes(state.collection)) return false;
  if (state.category && item.category !== state.category) return false;
  if (state.place && item.placement !== state.place) return false;
  if (state.flag && !item.flags.includes(state.flag)) return false;
  if (state.q) {
    const hay = [item.name, item.key, item.nameCn, ...item.tags, ...item.aliases].join(" ").toLowerCase();
    if (!state.q.split(/\\s+/).every(word => hay.includes(word))) return false;
  }
  return true;
};

const card = item => {
  const z = state.zoom;
  const f = triedFactor(item);
  const w = Math.round(item.width * f);
  const h = Math.round(item.height * f);
  const so = Math.round(item.so * f);
  const img = el("img", {src: item.image, width: Math.round(w * z), height: Math.round(h * z), loading: "lazy", alt: ""});
  const art = el("div", {className: "art"}, img);
  if (item.placement === "floor" && so > 0) {
    art.append(el("div", {className: "so", style: "bottom:" + Math.round(so * z) + "px", title: "sort line: " + so + " px up"}));
  }
  const chosen = animals.find(a => a.id === state.animal);
  const pose = chosen && (chosen.poses[state.pose] || Object.values(chosen.poses)[0]);
  const animal = pose
    ? el("img", {className: "animal-pic", src: "../_animals/" + pose.file, width: Math.round(pose.w * z), height: Math.round(pose.h * z),
      title: chosen.name + ", " + pose.w + "×" + pose.h + " in a den", alt: chosen.name, style: state.mirror ? "transform:scaleX(-1)" : ""})
    : el("div", {className: "animal", textContent: "animal", style: "width:" + 56 * z + "px;height:" + 76 * z + "px"});
  const flags = el("div");
  if (item.structural) flags.append(el("span", {className: "flag piece", textContent: "building piece"}));
  if (item.tile) flags.append(el("span", {className: "flag piece", textContent: item.tile + " tile"}));
  item.flags.forEach(f => flags.append(el("span", {className: "flag", textContent: f})));
  return el("div", {className: "card"},
    el("div", {className: "stage"}, art, animal),
    el("div", {className: "name", textContent: item.name}),
    el("div", {className: "meta"}, (catName[item.category] || item.category) + " · " + item.placement + " · " + w + "×" + h + " · sort " + so,
      ...(f !== 1 ? [" ", el("span", {className: "tried-size", textContent: "(tried " + Math.round(f * 100) + "%)"})] : [])),
    el("div", {className: "meta", textContent: item.collections.map(c => byId[c] ? byId[c].name : c).join(", ")}),
    el("div", {className: "meta", textContent: item.aliases.join(", ") + (item.nameCn ? " · " + item.nameCn : "") + " · ×" + item.source.scale}),
    flags);
};

const grid = document.getElementById("grid");
function draw() {
  nav.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.id === state.collection));
  chips.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.id === state.category));
  showTried();
  const found = pack.items.filter(matches);
  document.getElementById("count").textContent = found.length + " items";
  grid.replaceChildren(...found.slice(0, state.shown).map(card));
  if (found.length > state.shown) {
    const more = el("button", {id: "more", textContent: "Show more (" + (found.length - state.shown) + " left)"});
    more.onclick = () => { state.shown += PAGE; draw(); };
    grid.append(el("div", {style: "width:100%;text-align:center"}, more));
  }
}
draw();
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(packDir, "preview.html"), page);
console.log(`wrote ${path.join(packDir, "preview.html")} (${pack.items.length} items, ${pack.collections.length} collections, ${animals.length} animals)`);
