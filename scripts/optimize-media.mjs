// Optimize curated product + gallery images into apps/web/public as WebP.
// Usage: node scripts/optimize-media.mjs
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire("e:/Projects/onlinetech_ug/");
const sharp = require("e:/Projects/onlinetech_ug/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js");

const ROOT = "e:/Projects/onlinetech_ug";
const SRC = path.join(ROOT, "images");
const PUB = path.join(ROOT, "apps/web/public");
const map = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/media-map.json"), "utf8"));

const prodDir = path.join(PUB, "products");
const galDir = path.join(PUB, "gallery");
fs.mkdirSync(prodDir, { recursive: true });
fs.mkdirSync(galDir, { recursive: true });

// Product images: square, contained on white (clean catalog look).
for (const [slug, file] of Object.entries(map.products)) {
  const src = path.join(SRC, file);
  if (!fs.existsSync(src)) {
    console.warn("MISSING product src:", file);
    continue;
  }
  await sharp(src)
    .resize(900, 900, { fit: "contain", background: "#ffffff" })
    .flatten({ background: "#ffffff" })
    .webp({ quality: 82 })
    .toFile(path.join(prodDir, `${slug}.webp`));
  console.log("product:", slug);
}

// Gallery images: keep aspect ratio, max 1200px on long edge.
const galleryOut = [];
let i = 0;
for (const file of map.gallery) {
  const src = path.join(SRC, file);
  if (!fs.existsSync(src)) {
    console.warn("MISSING gallery src:", file);
    continue;
  }
  i += 1;
  const name = `g-${String(i).padStart(2, "0")}.webp`;
  const meta = await sharp(src).metadata();
  await sharp(src)
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(path.join(galDir, name));
  galleryOut.push({ src: `/gallery/${name}`, w: meta.width, h: meta.height });
}

fs.writeFileSync(path.join(galDir, "gallery.json"), JSON.stringify(galleryOut, null, 2));
console.log("products:", Object.keys(map.products).length, "gallery:", galleryOut.length);
