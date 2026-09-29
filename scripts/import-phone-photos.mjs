// Real iPhone photographs, in place of our drawn tiles.
//
// The handset tiles in generate-phone-tiles.mjs are deliberate artwork — a
// silhouette in the brand palette — used because we had no photographs. The
// owner has now supplied real ones in apps/web/public/phones, so every model
// covered by a photograph gets the photograph.
//
// Only a model that is actually pictured is mapped. An iPhone 14 photo does not
// go on the iPhone 11 listing just to fill a tile: 11, 12 and 13 keep their
// drawings until someone photographs them.
//
// Tiles are squared onto white (the shop grid is square and the source photos
// are every shape), banners are cropped wide for the offer strips.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire("e:/Projects/onlinetech_ug/");
const sharp = require("e:/Projects/onlinetech_ug/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js");

const ROOT = "e:/Projects/onlinetech_ug/apps/web/public";
// The folder is committed as "Phones"; Windows treats the two spellings as one
// directory but a Linux build would not find a lowercase path.
const SRC = path.join(ROOT, "Phones");
const PRODUCTS = path.join(ROOT, "products");
const PROMOS = path.join(ROOT, "promos");
fs.mkdirSync(PROMOS, { recursive: true });

/** slug -> source file. The slug is the product id; the shop reads /products/<id>.webp. */
const TILES = {
  "iphone-14-128gb": "Iphone 14.jpg",
  "iphone-15-128gb": "Iphone15.jpg",
  "iphone-14-plus-128gb": "14 plus.jpg",
  "iphone-14-pro-max-256gb": "14 pro and 14 pro max.jpeg",
  "iphone-15-pro-256gb": "15 pro.png",
  "iphone-16-128gb": "Apple16.jpg",
  "iphone-16-pro-max-256gb": "Iphone16 pro max and 16 pro.jpg",
  "iphone-17-256gb": "iPhone-17-series-comparison.jpg",
};

/** Wide artwork for the offer strips and category banners. */
const BANNERS = {
  "iphone-14-series": "iPhone-14-Series.jpg",
  "iphone-15-series": "iphone-15 series.jpg",
  "iphone-16-series": "iPhone 16 series.jpg",
  "iphone-17-series": "iPhone-17-series.002.jpg",
};

let tiles = 0;
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
    .toFile(path.join(PRODUCTS, `${slug}.webp`));
  tiles += 1;
}

// These four are designed graphics, not snapshots: the model names are printed
// on them. Cropping to fill a wide strip cut the title off the top and the
// labels off the bottom, which is the only part worth showing. So they are
// letterboxed instead, onto their own corner colour so the padding disappears
// rather than showing as white bars on a pink or lime artwork.
async function edgeColour(file) {
  const { data } = await sharp(file).resize(3, 3, { fit: "cover" }).raw().toBuffer({ resolveWithObject: true });
  const [r, g, b] = data; // top-left pixel of a 3x3 average-ish sample
  return { r, g, b, alpha: 1 };
}

let banners = 0;
for (const [name, file] of Object.entries(BANNERS)) {
  const from = path.join(SRC, file);
  if (!fs.existsSync(from)) {
    console.warn("missing source:", file);
    continue;
  }
  const background = await edgeColour(from);
  await sharp(from)
    .resize(1400, 560, { fit: "contain", background })
    .flatten({ background })
    .webp({ quality: 84 })
    .toFile(path.join(PROMOS, `${name}.webp`));
  banners += 1;
}

console.log("tiles:", tiles, "banners:", banners);
