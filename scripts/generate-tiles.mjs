// Generate clean, on-brand product tiles (SVG -> webp) for accessory/component/power
// SKUs where good online photos aren't available. Also optimizes the Pavilion photo.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const require = createRequire("e:/Projects/onlinetech_ug/");
const sharp = require("e:/Projects/onlinetech_ug/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js");

const ROOT = "e:/Projects/onlinetech_ug";
const prodDir = path.join(ROOT, "apps/web/public/products");
fs.mkdirSync(prodDir, { recursive: true });

const ORANGE = "#f15a29";
const INK = "#282363";

// Simple, recognizable icon glyphs (stroke = currentColor), drawn in a 100x100 box.
const ICONS = {
  plug: `<g fill="none" stroke="${ORANGE}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M30 20v18M70 20v18"/>
    <path d="M22 38h56v10a28 28 0 0 1-56 0z"/>
    <path d="M50 76v16"/></g>`,
  battery: `<g fill="none" stroke="${ORANGE}" stroke-width="6" stroke-linejoin="round">
    <rect x="18" y="30" width="60" height="40" rx="8"/>
    <path d="M82 42v16" stroke-linecap="round"/>
    <path d="M50 36l-8 14h12l-8 14" stroke-linecap="round" stroke-linejoin="round"/></g>`,
  ram: `<g fill="none" stroke="${ORANGE}" stroke-width="6" stroke-linejoin="round">
    <path d="M16 34h68v26H16z"/>
    <path d="M30 60v10M44 60v10M56 60v10M70 60v10" stroke-linecap="round"/>
    <path d="M32 44h10M48 44h10M64 44h6" stroke-linecap="round"/></g>`,
  ssd: `<g fill="none" stroke="${ORANGE}" stroke-width="6" stroke-linejoin="round">
    <rect x="20" y="26" width="60" height="48" rx="6"/>
    <path d="M34 40h32M34 52h22" stroke-linecap="round"/>
    <circle cx="68" cy="58" r="4" fill="${ORANGE}" stroke="none"/></g>`,
  usb: `<g fill="none" stroke="${ORANGE}" stroke-width="6" stroke-linejoin="round">
    <rect x="30" y="20" width="40" height="46" rx="6"/>
    <path d="M40 66h20v14H40z"/>
    <path d="M44 30h12M44 40h12" stroke-linecap="round"/></g>`,
  sd: `<g fill="none" stroke="${ORANGE}" stroke-width="6" stroke-linejoin="round">
    <path d="M30 22h28l14 14v42a4 4 0 0 1-4 4H30a4 4 0 0 1-4-4V26a4 4 0 0 1 4-4z"/>
    <path d="M40 30v8M50 30v8M60 34v4" stroke-linecap="round"/></g>`,
};

// slug -> { icon, title, sub }
const TILES = {
  "usb-c-charger-65w": { icon: "plug", title: "USB-C 65W Charger", sub: "Fast laptop charging" },
  "laptop-charger-pin-90w": { icon: "plug", title: "90W Pin Charger", sub: "HP / Dell / Lenovo" },
  "power-bank-20000": { icon: "battery", title: "20,000mAh Power Bank", sub: "Fast charge · 2 ports" },
  "power-bank-10000": { icon: "battery", title: "10,000mAh Power Bank", sub: "Slim & portable" },
  "ram-ddr4-8gb-sodimm": { icon: "ram", title: "8GB DDR4 Laptop RAM", sub: "SODIMM · 3200MHz" },
  "ram-ddr4-16gb-sodimm": { icon: "ram", title: "16GB DDR4 Laptop RAM", sub: "SODIMM · 3200MHz" },
  "ram-ddr4-8gb-dimm": { icon: "ram", title: "8GB DDR4 Desktop RAM", sub: "DIMM · 3200MHz" },
  "ssd-nvme-500gb": { icon: "ssd", title: "500GB NVMe M.2 SSD", sub: "Up to 3500MB/s" },
  "ssd-480gb-sata": { icon: "ssd", title: "480GB SATA SSD", sub: "2.5\" · 550MB/s" },
  "sandisk-flash-64gb": { icon: "usb", title: "64GB Flash Drive", sub: "USB 3.0" },
  "kingston-flash-32gb": { icon: "usb", title: "32GB Flash Drive", sub: "USB 2.0" },
  "microsd-64gb": { icon: "sd", title: "64GB MicroSD Card", sub: "Class 10 + adapter" },
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function tileSVG({ icon, title, sub }) {
  title = esc(title);
  sub = esc(sub);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
    <rect width="900" height="900" fill="#ffffff"/>
    <rect x="0" y="0" width="900" height="10" fill="${ORANGE}"/>
    <circle cx="450" cy="360" r="190" fill="#fff3ee"/>
    <g transform="translate(310,220) scale(2.8)">${ICONS[icon]}</g>
    <text x="450" y="640" font-family="Arial, sans-serif" font-size="48" font-weight="800" fill="${INK}" text-anchor="middle">${title}</text>
    <text x="450" y="695" font-family="Arial, sans-serif" font-size="30" fill="#6b6b80" text-anchor="middle">${sub}</text>
    <text x="450" y="800" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="${ORANGE}" text-anchor="middle">Online Tech Uganda</text>
  </svg>`;
}

for (const [slug, cfg] of Object.entries(TILES)) {
  await sharp(Buffer.from(tileSVG(cfg)))
    .webp({ quality: 90 })
    .toFile(path.join(prodDir, `${slug}.webp`));
  console.log("tile:", slug);
}

// HP Pavilion x360 — real photo from the owner's collection.
await sharp(path.join(ROOT, "images/d5cbcf4d8c864b949b2f0602730911f0.jpg"))
  .resize(900, 900, { fit: "contain", background: "#ffffff" })
  .flatten({ background: "#ffffff" })
  .webp({ quality: 82 })
  .toFile(path.join(prodDir, "hp-pavilion-x360-13.webp"));
console.log("photo: hp-pavilion-x360-13");
console.log("done", Object.keys(TILES).length + 1);
