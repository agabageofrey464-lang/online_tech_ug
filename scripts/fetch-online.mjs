// Fetch candidate product images from Wikimedia Commons for SKUs we lack photos for.
// Downloads up to N candidates per slug into images/_online/<slug>/ and builds a contact sheet.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire("e:/Projects/onlinetech_ug/");
const sharp = require("e:/Projects/onlinetech_ug/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js");

const UA = "OnlineTechUg/1.0 (mutesajoshua@gmail.com)";
const OUT = "e:/Projects/onlinetech_ug/images/_online";
fs.mkdirSync(OUT, { recursive: true });

// Each slug: list of search queries (tried in order until enough candidates).
const SKUS = {
  "hp-280-g6-desktop": ["HP ProDesk desktop computer", "HP desktop tower computer"],
  "logitech-mk270": ["Logitech wireless keyboard and mouse", "wireless keyboard mouse combo"],
  "logitech-c270-webcam": ["Logitech C270 webcam", "Logitech webcam"],
  "laptop-charger-universal": ["laptop power adapter charger", "AC adapter laptop"],
  "mercury-ups-650va": ["uninterruptible power supply UPS", "computer UPS battery backup"],
  "tp-link-archer-c6": ["TP-Link Archer C6 router", "TP-Link Archer wireless router"],
  "tp-link-tl-sg108": ["TP-Link network switch", "ethernet gigabit switch"],
  "sandisk-ssd-1tb": ["SanDisk Extreme portable SSD", "SanDisk portable solid state drive"],
  "wd-elements-1tb-hdd": ["Western Digital Elements external hard drive", "WD external hard drive"],
  "kingston-240gb-ssd": ["Kingston SSD solid state drive", "Kingston A400 SSD"],
};

async function search(query, limit = 8) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    `&gsrsearch=${encodeURIComponent("filetype:bitmap " + query)}` +
    `&gsrnamespace=6&gsrlimit=${limit}&prop=imageinfo&iiprop=url|mime&iiurlwidth=1000&format=json`;
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  const d = await r.json();
  const pages = Object.values(d?.query?.pages || {});
  return pages
    .map((p) => p.imageinfo?.[0])
    .filter((ii) => ii && /jpe?g|png/.test(ii.mime || ""))
    .map((ii) => ii.thumburl)
    .filter(Boolean);
}

async function download(u, dest) {
  const r = await fetch(u, { headers: { "User-Agent": UA } });
  if (!r.ok) return false;
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 3000) return false;
  fs.writeFileSync(dest, buf);
  return true;
}

const manifest = {};
const cells = [];
const CELL_W = 260, IMG_H = 190, LABEL_H = 30, COLS = 4;
let cellIndex = 0;

for (const [slug, queries] of Object.entries(SKUS)) {
  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });
  let urls = [];
  for (const q of queries) {
    if (urls.length >= 5) break;
    try {
      const found = await search(q);
      for (const u of found) if (!urls.includes(u)) urls.push(u);
    } catch (e) {
      console.warn("search fail", slug, q, e.message);
    }
  }
  urls = urls.slice(0, 5);
  manifest[slug] = [];
  let n = 0;
  for (const u of urls) {
    const dest = path.join(dir, `cand-${n}.jpg`);
    try {
      if (await download(u, dest)) {
        manifest[slug].push({ n, url: u, file: dest });
        n += 1;
      }
    } catch (e) {
      console.warn("dl fail", slug, e.message);
    }
  }
  console.log(slug, "->", n, "candidates");
}

fs.writeFileSync(path.join(OUT, "candidates.json"), JSON.stringify(manifest, null, 2));

// Build a contact sheet of all candidates, labeled "slug #n".
for (const [slug, list] of Object.entries(manifest)) {
  for (const c of list) {
    cells.push({ label: `${slug} #${c.n}`, file: c.file });
  }
}
const rows = Math.ceil(cells.length / COLS);
const W = COLS * CELL_W;
const H = rows * (IMG_H + LABEL_H);
const composites = [];
for (let i = 0; i < cells.length; i++) {
  const col = i % COLS, row = Math.floor(i / COLS);
  const x = col * CELL_W, y = row * (IMG_H + LABEL_H);
  try {
    const thumb = await sharp(cells[i].file)
      .resize(CELL_W - 8, IMG_H - 8, { fit: "inside", background: "#ffffff" })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 72 })
      .toBuffer();
    composites.push({ input: thumb, left: x + 4, top: y + 4 });
  } catch {}
  const svg = Buffer.from(
    `<svg width="${CELL_W}" height="${LABEL_H}"><rect width="100%" height="100%" fill="#282363"/><text x="6" y="20" font-family="Arial" font-size="13" fill="#fff">${cells[i].label}</text></svg>`
  );
  composites.push({ input: svg, left: x, top: y + IMG_H });
}
await sharp({ create: { width: W, height: H, channels: 3, background: "#ddd" } })
  .composite(composites)
  .jpeg({ quality: 74 })
  .toFile(path.join(OUT, "online-sheet.jpg"));
console.log("contact sheet:", path.join(OUT, "online-sheet.jpg"), cells.length, "cells");
