// Distinct covers for the courses that were sharing one photograph.
//
// Six Microsoft courses — Office, Word, Excel, PowerPoint, Publisher and
// Access — all pointed at the same file: a dark, badly lit snapshot of a
// spreadsheet on a monitor. On the home page that meant four cards in a row
// showing the identical picture under four different names, which reads as a
// page that was never finished.
//
// A stock photo of a screen tells a student nothing anyway. These are drawn
// instead: each course gets its own colour, its own glyph and its own name,
// in the house palette, sharp at any size and a fraction of the weight of a
// photograph. They are clearly artwork, which is honest — we are not
// pretending to show them a classroom.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const require = createRequire("e:/Projects/onlinetech_ug/");
const sharp = require("e:/Projects/onlinetech_ug/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js");

const OUT = "e:/Projects/onlinetech_ug/apps/web/public/courses";
fs.mkdirSync(OUT, { recursive: true });

const W = 1200;
const H = 800;

// Document / sheet / slide / database glyphs, drawn in a 100x100 box.
const GLYPH = {
  doc: `<g fill="none" stroke="#fff" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round">
    <path d="M28 14h30l16 16v56a4 4 0 0 1-4 4H28a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4z"/>
    <path d="M57 14v18h17"/><path d="M36 50h28M36 62h28M36 38h14"/></g>`,
  sheet: `<g fill="none" stroke="#fff" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round">
    <rect x="18" y="20" width="64" height="60" rx="5"/>
    <path d="M18 38h64M18 58h64M42 20v60M62 20v60"/></g>`,
  slide: `<g fill="none" stroke="#fff" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round">
    <rect x="16" y="20" width="68" height="46" rx="5"/>
    <path d="M50 66v14M38 86h24"/><path d="M30 52l12-14 10 12 8-8 10 14"/></g>`,
  layout: `<g fill="none" stroke="#fff" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round">
    <rect x="18" y="18" width="64" height="64" rx="5"/>
    <path d="M18 38h64M44 38v44"/><path d="M27 52h9M27 62h9"/></g>`,
  db: `<g fill="none" stroke="#fff" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="50" cy="26" rx="28" ry="10"/>
    <path d="M22 26v22c0 5.5 12.5 10 28 10s28-4.5 28-10V26"/>
    <path d="M22 48v22c0 5.5 12.5 10 28 10s28-4.5 28-10V48"/></g>`,
  suite: `<g fill="none" stroke="#fff" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round">
    <rect x="16" y="16" width="30" height="30" rx="4"/><rect x="54" y="16" width="30" height="30" rx="4"/>
    <rect x="16" y="54" width="30" height="30" rx="4"/><rect x="54" y="54" width="30" height="30" rx="4"/></g>`,
};

// slug -> { title, kicker, glyph, from, to }
const COVERS = {
  "microsoft-office": { title: "Microsoft Office", kicker: "The whole suite", glyph: "suite", from: "#d9430f", to: "#8c2a0c" },
  "microsoft-word": { title: "Microsoft Word", kicker: "Documents & letters", glyph: "doc", from: "#1f4e9c", to: "#12306a" },
  "microsoft-excel": { title: "Microsoft Excel", kicker: "Spreadsheets & formulas", glyph: "sheet", from: "#12805a", to: "#0a4f38" },
  "microsoft-powerpoint": { title: "Microsoft PowerPoint", kicker: "Slides that persuade", glyph: "slide", from: "#c4501b", to: "#8a3510" },
  "microsoft-publisher": { title: "Microsoft Publisher", kicker: "Layouts & printing", glyph: "layout", from: "#0e7490", to: "#0c5d75" },
  "microsoft-access": { title: "Microsoft Access", kicker: "Databases & records", glyph: "db", from: "#8a2036", to: "#5c1424" },
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function coverSVG({ glyph, from, to }) {
  // Deliberately wordless. The card that shows this already prints the course
  // title over the bottom of the image, so a title drawn into the artwork too
  // came out doubled — the same words twice, one of them ghosted behind a
  // gradient. The picture carries the colour and the symbol; the card carries
  // the words.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/>
    </linearGradient>
    <pattern id="stripes" width="34" height="34" patternTransform="rotate(115)" patternUnits="userSpaceOnUse">
      <rect width="34" height="34" fill="none"/>
      <rect width="5" height="34" fill="#ffffff" opacity="0.07"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#stripes)"/>
  <circle cx="960" cy="180" r="250" fill="#ffffff" opacity="0.07"/>
  <circle cx="180" cy="690" r="190" fill="#ffffff" opacity="0.05"/>

  <g transform="translate(450,220) scale(3.0)">${GLYPH[glyph]}</g>
</svg>`;
}

let n = 0;
for (const [slug, cfg] of Object.entries(COVERS)) {
  await sharp(Buffer.from(coverSVG(cfg))).webp({ quality: 88 }).toFile(path.join(OUT, `${slug}.webp`));
  n += 1;
}
console.log("course covers written:", n);
