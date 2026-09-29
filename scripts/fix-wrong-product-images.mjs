// Replace the eight product images that showed the wrong object entirely.
//
// These eight were the only products carrying an `image:` override pointing at
// a generically-named file (desktop-1, ram-4, keyboard-2 ...). Every one of
// them had been matched on a word rather than on the product: the HP ProDesk
// 400 G5 *Tower* was illustrated with Broadway Tower, an English castle. The
// Kingston DDR4 stick was a 256MB SDRAM module with "256MB" printed on it, the
// Crucial SSD was a Plextor, and the Anker power bank was a USB hub.
//
// The desktop gets a real photograph of an HP ProDesk tower. The other seven
// are brand-specific parts, and freely-licensed photographs of those exact
// products do not exist — the closest candidates were Corsair memory, a
// Samsung SSD and Canon camera batteries, which would have repeated the same
// mistake with better lighting. They get the same honest on-brand tiles this
// repo already uses wherever a real photo is missing: artwork that states what
// the product is and never pretends to be a photograph of it.
//
// Each tile is written to /products/<id>.webp so the slug convention resolves
// it, and the `image:` overrides are removed from data.ts — the shared generic
// filenames were what let a castle stand in for a computer in the first place.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const require = createRequire("e:/Projects/onlinetech_ug/");
const sharp = require("e:/Projects/onlinetech_ug/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js");

const ROOT = "e:/Projects/onlinetech_ug";
const prodDir = path.join(ROOT, "apps/web/public/products");
const ORANGE = "#f15a29";
const INK = "#282363";
const MUTED = "#6b6b80";

const ICONS = {
  ram: `<g fill="none" stroke="${ORANGE}" stroke-width="6" stroke-linejoin="round">
    <path d="M16 34h68v26H16z"/>
    <path d="M30 60v10M44 60v10M56 60v10M70 60v10" stroke-linecap="round"/>
    <path d="M32 44h10M48 44h10M64 44h6" stroke-linecap="round"/></g>`,
  ssd: `<g fill="none" stroke="${ORANGE}" stroke-width="6" stroke-linejoin="round">
    <rect x="20" y="26" width="60" height="48" rx="6"/>
    <path d="M34 40h32M34 52h22" stroke-linecap="round"/>
    <circle cx="68" cy="58" r="4" fill="${ORANGE}" stroke="none"/></g>`,
  battery: `<g fill="none" stroke="${ORANGE}" stroke-width="6" stroke-linejoin="round">
    <rect x="18" y="30" width="60" height="40" rx="8"/>
    <path d="M82 42v16" stroke-linecap="round"/>
    <path d="M50 36l-8 14h12l-8 14" stroke-linecap="round"/></g>`,
  plug: `<g fill="none" stroke="${ORANGE}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M30 20v18M70 20v18"/>
    <path d="M22 38h56v10a28 28 0 0 1-56 0z"/>
    <path d="M50 76v16"/></g>`,
  keyboard: `<g fill="none" stroke="${ORANGE}" stroke-width="6" stroke-linejoin="round">
    <rect x="12" y="30" width="76" height="42" rx="6"/>
    <path d="M24 42h4M38 42h4M52 42h4M66 42h4M74 42h2" stroke-linecap="round"/>
    <path d="M24 53h4M38 53h4M52 53h4M66 53h6" stroke-linecap="round"/>
    <path d="M34 63h32" stroke-linecap="round"/></g>`,
  webcam: `<g fill="none" stroke="${ORANGE}" stroke-width="6" stroke-linejoin="round">
    <circle cx="50" cy="42" r="24"/>
    <circle cx="50" cy="42" r="9" fill="${ORANGE}" stroke="none"/>
    <path d="M28 70h44M50 66v4" stroke-linecap="round"/>
    <path d="M34 82h32a6 6 0 0 0 6-6H28a6 6 0 0 0 6 6z"/></g>`,
  hdd: `<g fill="none" stroke="${ORANGE}" stroke-width="6" stroke-linejoin="round">
    <rect x="16" y="28" width="68" height="44" rx="7"/>
    <circle cx="44" cy="50" r="13"/>
    <circle cx="44" cy="50" r="3" fill="${ORANGE}" stroke="none"/>
    <path d="M68 40v20" stroke-linecap="round"/></g>`,
};

// product id -> tile content
const TILES = {
  "kingston-fury-8gb-ddr4": { icon: "ram", title: "Kingston FURY 8GB", sub: "DDR4 DIMM · 3200MHz" },
  "crucial-mx500-500gb": { icon: "ssd", title: "Crucial MX500 500GB", sub: "2.5\" SATA · 560MB/s" },
  "anker-powerbank-20000": { icon: "battery", title: "Anker 20,000mAh", sub: "USB-C PD · Fast charge" },
  "usb-c-65w-charger": { icon: "plug", title: "65W USB-C Charger", sub: "Universal laptops" },
  "redragon-k552-keyboard": { icon: "keyboard", title: "Redragon K552", sub: "Mechanical · RGB · TKL" },
  "hd-1080p-webcam": { icon: "webcam", title: "1080p HD Webcam", sub: "Built-in mic · Clip-on" },
  "seagate-expansion-1tb": { icon: "hdd", title: "Seagate Expansion 1TB", sub: "USB 3.0 portable drive" },
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function tileSVG({ icon, title, sub }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
  <rect width="900" height="900" fill="#ffffff"/>
  <rect x="0" y="0" width="900" height="10" fill="${ORANGE}"/>
  <circle cx="450" cy="360" r="200" fill="#fff3ee"/>
  <g transform="translate(270,180) scale(3.6)">${ICONS[icon]}</g>
  <text x="450" y="660" font-family="Arial, sans-serif" font-size="46" font-weight="800" fill="${INK}" text-anchor="middle">${esc(title)}</text>
  <text x="450" y="712" font-family="Arial, sans-serif" font-size="29" fill="${MUTED}" text-anchor="middle">${esc(sub)}</text>
  <text x="450" y="812" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="${ORANGE}" text-anchor="middle">Online Tech Uganda</text>
</svg>`;
}

let n = 0;
for (const [slug, cfg] of Object.entries(TILES)) {
  await sharp(Buffer.from(tileSVG(cfg))).webp({ quality: 90 }).toFile(path.join(prodDir, `${slug}.webp`));
  n += 1;
}

// The one real photograph: an actual HP ProDesk tower, in place of the castle.
const photo = process.argv[2];
if (photo && fs.existsSync(photo)) {
  await sharp(photo)
    .resize(1000, 1000, { fit: "contain", background: "#ffffff" })
    .flatten({ background: "#ffffff" })
    .webp({ quality: 88 })
    .toFile(path.join(prodDir, "hp-prodesk-400-g5.webp"));
  console.log("prodesk photo written");
}
console.log("tiles written:", n);
