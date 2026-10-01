// The owner's Samsung Galaxy photographs, squared for the shop grid.
//
// Same rule as the iPhones: one picture per model, and only a model that is
// actually pictured on its own. The base S20 is only ever in a line-up shot
// here, so it is not listed — a photo of three phones is not a photo of the
// one somebody is buying.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire("e:/Projects/onlinetech_ug/");
const sharp = require("e:/Projects/onlinetech_ug/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js");

const PUB = "e:/Projects/onlinetech_ug/apps/web/public";
const SRC = path.join(PUB, "Phones");
const OUT = path.join(PUB, "products");

/** product slug -> the owner's file */
const TILES = {
  "samsung-galaxy-s20-fe-5g": "S20 fe 3.jpg",
  "samsung-galaxy-s20-plus-5g": "S20+ (2).jpg",
  "samsung-galaxy-s20-ultra-5g": "S20 Ultra (1).jpeg",
  "samsung-galaxy-s21-plus-5g": "Samsung-Galaxy-S21-Plus (1).jpg",
  "samsung-galaxy-s21-ultra-5g": "S21 Ultra- 2.jpeg",
  // Second batch. The base S20 is listed now — it was only ever in a line-up
  // shot before, and a photo of three phones is not a photo of the one
  // somebody is buying.
  "samsung-galaxy-s20-5g": "S20 - 1.png",
  "samsung-galaxy-note-9-128gb": "Note 9 - 5.jpg",
  "samsung-galaxy-note-9-512gb": "Note 9 - 5.jpg",
  "samsung-galaxy-s9-plus": "S9+ - 2.jpeg",
};

let n = 0;
for (const [slug, file] of Object.entries(TILES)) {
  const from = path.join(SRC, file);
  if (!fs.existsSync(from)) {
    console.warn("missing source:", file);
    continue;
  }
  await sharp(from)
    .resize(1000, 1000, { fit: "contain", background: "#ffffff" })
    .flatten({ background: "#ffffff" })
    .webp({ quality: 86 })
    .toFile(path.join(OUT, `${slug}.webp`));
  n += 1;
}
console.log("samsung tiles written:", n);
