import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const require = createRequire("e:/Projects/onlinetech_ug/");
const sharp = require("e:/Projects/onlinetech_ug/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js");
const UA = "OnlineTechUg/1.0 (mutesajoshua@gmail.com)";
const OUT = "e:/Projects/onlinetech_ug/images/_online";

const SKUS = {
  "logitech-mk270": ["computer keyboard and mouse", "desktop keyboard mouse set", "wireless mouse keyboard"],
  "mercury-ups-650va": ["APC Back-UPS", "uninterruptible power supply device home", "battery backup UPS"],
  "wd-elements-1tb-hdd": ["external hard disk drive USB", "portable hard drive", "hard disk drive enclosure"],
  "kingston-240gb-ssd": ["solid-state drive SATA", "SSD 2.5 inch", "solid state drive computer"],
};
async function search(query, limit = 10) {
  const url = "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    `&gsrsearch=${encodeURIComponent("filetype:bitmap " + query)}` +
    `&gsrnamespace=6&gsrlimit=${limit}&prop=imageinfo&iiprop=url|mime&iiurlwidth=1000&format=json`;
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  const d = await r.json();
  return Object.values(d?.query?.pages || {}).map((p) => p.imageinfo?.[0])
    .filter((ii) => ii && /jpe?g|png/.test(ii.mime || "")).map((ii) => ii.thumburl).filter(Boolean);
}
async function download(u, dest) {
  const r = await fetch(u, { headers: { "User-Agent": UA } });
  if (!r.ok) return false;
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 3000) return false;
  fs.writeFileSync(dest, buf); return true;
}
const man = JSON.parse(fs.readFileSync(path.join(OUT, "candidates.json"), "utf8"));
const cells = [];
for (const [slug, queries] of Object.entries(SKUS)) {
  const dir = path.join(OUT, slug); fs.mkdirSync(dir, { recursive: true });
  let urls = [];
  for (const q of queries) { if (urls.length >= 8) break;
    try { for (const u of await search(q)) if (!urls.includes(u)) urls.push(u); } catch {} }
  urls = urls.slice(0, 8); man[slug] = []; let n = 0;
  for (const u of urls) { const dest = path.join(dir, `cand-${n}.jpg`);
    try { if (await download(u, dest)) { man[slug].push({ n, url: u, file: dest }); n += 1; } } catch {} }
  console.log(slug, "->", n);
}
fs.writeFileSync(path.join(OUT, "candidates.json"), JSON.stringify(man, null, 2));
for (const slug of Object.keys(SKUS)) for (const c of man[slug]) cells.push({ label: `${slug} #${c.n}`, file: c.file });
const CELL_W = 260, IMG_H = 190, LABEL_H = 30, COLS = 4;
const rows = Math.ceil(cells.length / COLS), W = COLS * CELL_W, H = rows * (IMG_H + LABEL_H), comp = [];
for (let i = 0; i < cells.length; i++) { const x = (i % COLS) * CELL_W, y = Math.floor(i / COLS) * (IMG_H + LABEL_H);
  try { comp.push({ input: await sharp(cells[i].file).resize(CELL_W - 8, IMG_H - 8, { fit: "inside", background: "#fff" }).flatten({ background: "#fff" }).jpeg({ quality: 72 }).toBuffer(), left: x + 4, top: y + 4 }); } catch {}
  comp.push({ input: Buffer.from(`<svg width="${CELL_W}" height="${LABEL_H}"><rect width="100%" height="100%" fill="#282363"/><text x="6" y="20" font-family="Arial" font-size="13" fill="#fff">${cells[i].label}</text></svg>`), left: x, top: y + IMG_H }); }
await sharp({ create: { width: W, height: H, channels: 3, background: "#ddd" } }).composite(comp).jpeg({ quality: 74 }).toFile(path.join(OUT, "online-sheet2.jpg"));
console.log("sheet2", cells.length);
