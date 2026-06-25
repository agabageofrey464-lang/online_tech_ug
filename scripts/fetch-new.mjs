import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const require = createRequire("e:/Projects/onlinetech_ug/");
const sharp = require("e:/Projects/onlinetech_ug/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js");
const UA = "OnlineTechUg/1.0 (mutesajoshua@gmail.com)";
const OUT = "e:/Projects/onlinetech_ug/images/_online";

// slug -> queries (tried in order)
const SKUS = {
  "usb-c-charger-65w": ["USB-C power adapter charger", "laptop USB-C charger"],
  "hp-laptop-charger": ["HP laptop AC adapter", "laptop power adapter charger"],
  "dell-laptop-charger": ["Dell laptop AC adapter", "laptop charger power supply"],
  "power-bank-20000": ["power bank portable charger", "USB power bank"],
  "power-bank-10000": ["power bank battery", "portable charger power bank"],
  "ram-ddr4-8gb-sodimm": ["DDR4 SODIMM laptop memory", "laptop RAM memory module"],
  "ram-ddr4-16gb-sodimm": ["DDR4 RAM memory module", "computer memory RAM"],
  "ram-ddr4-8gb-dimm": ["DDR4 DIMM desktop memory", "RAM memory stick DIMM"],
  "ssd-nvme-500gb": ["NVMe M.2 SSD", "M.2 solid state drive"],
  "ssd-480gb-sata": ["SATA SSD 2.5 inch", "solid state drive SATA"],
  "sandisk-flash-64gb": ["SanDisk USB flash drive", "USB flash drive"],
  "sandisk-flash-128gb": ["USB flash drive memory stick", "flash drive USB 3.0"],
  "kingston-flash-32gb": ["Kingston USB flash drive", "USB memory stick"],
  "sandisk-microsd-64gb": ["microSD memory card", "SD memory card flash"],
  "logitech-m170-mouse": ["Logitech wireless mouse", "computer wireless mouse"],
  "laptop-cooling-pad": ["laptop cooling pad", "notebook cooler fan"],
  "usb-c-hub": ["USB-C hub adapter", "USB hub dock"],
  "hdmi-cable-15m": ["HDMI cable", "HDMI connector cable"],
  "usb-headset": ["computer headset headphones", "headset microphone"],
};

async function search(query, limit = 8) {
  const url = "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
    `&gsrsearch=${encodeURIComponent(query)}` +
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
  if (buf.length < 2500) return false;
  fs.writeFileSync(dest, buf); return true;
}

const man = {};
for (const [slug, queries] of Object.entries(SKUS)) {
  const dir = path.join(OUT, slug); fs.mkdirSync(dir, { recursive: true });
  let urls = [];
  for (const q of queries) { if (urls.length >= 5) break;
    try { for (const u of await search(q)) if (!urls.includes(u)) urls.push(u); } catch {} }
  urls = urls.slice(0, 5); man[slug] = []; let n = 0;
  for (const u of urls) { const dest = path.join(dir, `cand-${n}.jpg`);
    try { if (await download(u, dest)) { man[slug].push({ n, url: u, file: dest }); n += 1; } } catch {} }
  console.log(slug, "->", n);
}
fs.writeFileSync(path.join(OUT, "new-candidates.json"), JSON.stringify(man, null, 2));

// Contact sheet
const cells = [];
for (const [slug, list] of Object.entries(man)) for (const c of list) cells.push({ label: `${slug} #${c.n}`, file: c.file });
const CW = 250, IH = 180, LH = 30, COLS = 5;
const rows = Math.ceil(cells.length / COLS), W = COLS * CW, H = rows * (IH + LH), comp = [];
for (let i = 0; i < cells.length; i++) { const x = (i % COLS) * CW, y = Math.floor(i / COLS) * (IH + LH);
  try { comp.push({ input: await sharp(cells[i].file).resize(CW - 8, IH - 8, { fit: "inside", background: "#fff" }).flatten({ background: "#fff" }).jpeg({ quality: 70 }).toBuffer(), left: x + 4, top: y + 4 }); } catch {}
  comp.push({ input: Buffer.from(`<svg width="${CW}" height="${LH}"><rect width="100%" height="100%" fill="#282363"/><text x="5" y="20" font-family="Arial" font-size="12" fill="#fff">${cells[i].label}</text></svg>`), left: x, top: y + IH }); }
await sharp({ create: { width: W, height: Math.max(H, 1), channels: 3, background: "#ddd" } }).composite(comp).jpeg({ quality: 74 }).toFile(path.join(OUT, "new-sheet.jpg"));
console.log("sheet cells", cells.length);
