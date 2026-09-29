// On-brand phone tiles, for handsets we stock but have not photographed yet.
//
// These are deliberately drawings, not fake photographs: a handset silhouette
// in the brand palette with the model, the colour and the headline spec. They
// read honestly as our own artwork, and each one is replaced the moment a real
// photo of that phone exists in apps/web/public/products/<slug>.webp.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire("e:/Projects/onlinetech_ug/");
const sharp = require("e:/Projects/onlinetech_ug/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js");

const ROOT = "e:/Projects/onlinetech_ug";
const prodDir = path.join(ROOT, "apps/web/public/products");
fs.mkdirSync(prodDir, { recursive: true });

const ORANGE = "#f15a29";
const INK = "#12102e";
const MUTED = "#6b6b80";

// slug -> { title, sub, body, screen }
// `body` is the handset colour, `screen` the wallpaper tint behind the glass.
const PHONES = {
  "itel-p65": { title: "itel P65", sub: "8GB + 256GB · 5000mAh", body: "#2f3a4a", screen: "#1d4ed8" },
  "tecno-spark-20": { title: "Tecno Spark 20", sub: "8GB + 256GB · 50MP", body: "#1f2937", screen: "#0ea5e9" },
  "tecno-spark-30": { title: "Tecno Spark 30", sub: "8GB + 256GB · 108MP", body: "#0f766e", screen: "#14b8a6" },
  "tecno-camon-30": { title: "Tecno Camon 30", sub: "8GB + 256GB · 50MP OIS", body: "#3f3f46", screen: "#8b5cf6" },
  "tecno-pova-6": { title: "Tecno Pova 6", sub: "8GB + 256GB · 6000mAh", body: "#18181b", screen: "#22c55e" },
  "infinix-hot-40i": { title: "Infinix Hot 40i", sub: "8GB + 256GB · 90Hz", body: "#1e293b", screen: "#3b82f6" },
  "infinix-hot-50": { title: "Infinix Hot 50", sub: "8GB + 256GB · 5000mAh", body: "#134e4a", screen: "#2dd4bf" },
  "infinix-note-40": { title: "Infinix Note 40", sub: "8GB + 256GB · AMOLED", body: "#111827", screen: "#f59e0b" },
  "infinix-zero-30": { title: "Infinix Zero 30", sub: "12GB + 256GB · 108MP", body: "#1c1917", screen: "#a78bfa" },
  "samsung-galaxy-a06": { title: "Samsung Galaxy A06", sub: "4GB + 128GB · 5000mAh", body: "#27272a", screen: "#60a5fa" },
  "samsung-galaxy-a15": { title: "Samsung Galaxy A15", sub: "6GB + 128GB · AMOLED", body: "#1f2937", screen: "#2563eb" },
  "samsung-galaxy-a25-5g": { title: "Samsung Galaxy A25 5G", sub: "8GB + 256GB · 5G", body: "#0f172a", screen: "#3b82f6" },
  "samsung-galaxy-a35-5g": { title: "Samsung Galaxy A35 5G", sub: "8GB + 256GB · 120Hz", body: "#1e1b4b", screen: "#6366f1" },
  "samsung-galaxy-a55-5g": { title: "Samsung Galaxy A55 5G", sub: "8GB + 256GB · Exynos", body: "#312e81", screen: "#818cf8" },
  "redmi-note-13": { title: "Redmi Note 13", sub: "8GB + 256GB · 108MP", body: "#1f2937", screen: "#0ea5e9" },
  "redmi-note-14": { title: "Redmi Note 14", sub: "8GB + 256GB · AMOLED", body: "#052e16", screen: "#22c55e" },
  "xiaomi-redmi-14c": { title: "Redmi 14C", sub: "8GB + 256GB · 5160mAh", body: "#334155", screen: "#38bdf8" },
  "oppo-a60": { title: "OPPO A60", sub: "8GB + 256GB · 5000mAh", body: "#164e63", screen: "#22d3ee" },
  "iphone-11-64gb": { title: "iPhone 11 64GB", sub: "A13 Bionic · UK Used", body: "#3f3f46", screen: "#f472b6" },
  "iphone-12-128gb": { title: "iPhone 12 128GB", sub: "A14 · 5G · UK Used", body: "#1e3a8a", screen: "#60a5fa" },
  "iphone-13-128gb": { title: "iPhone 13 128GB", sub: "A15 Bionic · UK Used", body: "#1c1917", screen: "#fb7185" },
  "iphone-14-128gb": { title: "iPhone 14 128GB", sub: "A15 · 5G · Sealed", body: "#4c1d95", screen: "#c084fc" },
  "iphone-15-128gb": { title: "iPhone 15 128GB", sub: "A16 · USB-C · Sealed", body: "#0f172a", screen: "#34d399" },
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function phoneSVG({ title, sub, body, screen }) {
  title = esc(title);
  sub = esc(sub);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
  <defs>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${screen}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${screen}" stop-opacity="0.45"/>
    </linearGradient>
    <linearGradient id="shell" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${body}"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.85"/>
    </linearGradient>
  </defs>

  <rect width="900" height="900" fill="#ffffff"/>
  <rect x="0" y="0" width="900" height="10" fill="${ORANGE}"/>
  <circle cx="450" cy="330" r="215" fill="#fff3ee"/>

  <!-- the handset -->
  <g transform="translate(348,132)">
    <rect x="0" y="0" width="204" height="400" rx="30" fill="url(#shell)"/>
    <rect x="9" y="9" width="186" height="382" rx="23" fill="url(#glass)"/>
    <rect x="76" y="17" width="52" height="11" rx="5.5" fill="${body}" opacity="0.92"/>
    <!-- camera island -->
    <rect x="20" y="24" width="46" height="62" rx="14" fill="#000" opacity="0.30"/>
    <circle cx="35" cy="42" r="9" fill="#0b0b12"/>
    <circle cx="35" cy="42" r="3.4" fill="${screen}" opacity="0.85"/>
    <circle cx="35" cy="68" r="9" fill="#0b0b12"/>
    <circle cx="35" cy="68" r="3.4" fill="${screen}" opacity="0.6"/>
    <!-- a hint of a wallpaper, so the glass does not read as flat plastic -->
    <path d="M9 300 C 60 250, 140 350, 195 288 L195 368 a23 23 0 0 1 -23 23 H32 a23 23 0 0 1 -23 -23 Z"
          fill="#ffffff" opacity="0.16"/>
    <rect x="70" y="372" width="64" height="5" rx="2.5" fill="#ffffff" opacity="0.55"/>
  </g>

  <text x="450" y="640" font-family="Arial, sans-serif" font-size="46" font-weight="800" fill="${INK}" text-anchor="middle">${title}</text>
  <text x="450" y="692" font-family="Arial, sans-serif" font-size="29" fill="${MUTED}" text-anchor="middle">${sub}</text>
  <text x="450" y="800" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="${ORANGE}" text-anchor="middle">Online Tech Uganda</text>
</svg>`;
}

let n = 0;
for (const [slug, cfg] of Object.entries(PHONES)) {
  await sharp(Buffer.from(phoneSVG(cfg)))
    .webp({ quality: 90 })
    .toFile(path.join(prodDir, `${slug}.webp`));
  n += 1;
}
console.log("phone tiles written:", n);
