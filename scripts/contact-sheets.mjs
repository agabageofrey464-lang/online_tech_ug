// Build labeled contact sheets from images/ so the catalog can be matched visually.
// Usage: node scripts/contact-sheets.mjs
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire("e:/Projects/onlinetech_ug/apps/web/node_modules/");
// sharp lives under the pnpm store; resolve from the workspace root node_modules
const sharp = require("e:/Projects/onlinetech_ug/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js");

const SRC = "e:/Projects/onlinetech_ug/images";
const OUT = "e:/Projects/onlinetech_ug/images/_sheets";
fs.mkdirSync(OUT, { recursive: true });

const exts = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const files = fs
  .readdirSync(SRC)
  .filter((f) => exts.has(path.extname(f).toLowerCase()))
  .sort();

const COLS = 6;
const ROWS = 8;
const CELL_W = 230;
const IMG_H = 165;
const LABEL_H = 26;
const CELL_H = IMG_H + LABEL_H;
const PER = COLS * ROWS;

const manifest = {};
let sheetNo = 0;

async function buildSheet(slice, startIdx) {
  sheetNo += 1;
  const rows = Math.ceil(slice.length / COLS);
  const W = COLS * CELL_W;
  const H = rows * CELL_H;
  const composites = [];

  for (let i = 0; i < slice.length; i++) {
    const idx = startIdx + i;
    const file = slice[i];
    manifest[idx] = file;
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = col * CELL_W;
    const y = row * CELL_H;

    let thumb;
    try {
      thumb = await sharp(path.join(SRC, file))
        .resize(CELL_W - 8, IMG_H - 8, { fit: "inside", background: "#ffffff" })
        .flatten({ background: "#ffffff" })
        .jpeg({ quality: 70 })
        .toBuffer();
      composites.push({ input: thumb, left: x + 4, top: y + 4 });
    } catch (e) {
      // skip unreadable
    }

    const label = `#${idx}`;
    const svg = Buffer.from(
      `<svg width="${CELL_W}" height="${LABEL_H}"><rect width="100%" height="100%" fill="#282363"/><text x="6" y="18" font-family="Arial" font-size="14" fill="#ffffff">${label}</text></svg>`
    );
    composites.push({ input: svg, left: x, top: y + IMG_H });
  }

  const out = path.join(OUT, `sheet-${String(sheetNo).padStart(2, "0")}.jpg`);
  await sharp({ create: { width: W, height: H, channels: 3, background: "#dddddd" } })
    .composite(composites)
    .jpeg({ quality: 72 })
    .toFile(out);
  console.log("wrote", out, `(${slice.length} imgs, #${startIdx}-${startIdx + slice.length - 1})`);
}

for (let start = 0; start < files.length; start += PER) {
  const slice = files.slice(start, start + PER);
  await buildSheet(slice, start);
}

fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 0));
console.log("total images:", files.length, "sheets:", sheetNo);
