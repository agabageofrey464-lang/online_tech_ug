// Tiny thumbnails for the places that draw a picture at 28–40px.
//
// The offer strip and the little circles in each panel header were loading the
// full product photo — 50 to 120KB, a thousand pixels wide — to paint a 28px
// circle, and they were marked loading="lazy" despite sitting at the very top
// of the page. So on arrival they were white discs, which is exactly what a
// broken image looks like. On a Ugandan mobile connection they stayed that way
// for a while.
//
// Image optimisation is switched off site-wide (we exhausted the quota and the
// bill was not worth it), so nothing resizes these for us. This does it ahead
// of time: one 96px square per source image, a couple of KB each.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire("e:/Projects/onlinetech_ug/");
const sharp = require("e:/Projects/onlinetech_ug/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js");

const PUB = "e:/Projects/onlinetech_ug/apps/web/public";
// Two derived sizes, because nothing on a listing page needs the full file.
//   96px  — the offer strip and panel-header circles, drawn at 28-44px.
//   400px — product and course cards, drawn at 136-204px.
// Image optimisation is off site-wide (we exhausted the quota), so without
// these every card pulls the original: 284 images on the home page came to
// 12.4MB, which on a Ugandan mobile connection reads as pictures missing.
const SIZES = [
  { dir: "thumbs", px: 96, quality: 74 },
  { dir: "cards", px: 400, quality: 80 },
];
const DIRS = ["products", "courses"];

let written = 0;
let skipped = 0;

for (const size of SIZES) {
  for (const dir of DIRS) {
    const from = path.join(PUB, dir);
    const to = path.join(PUB, size.dir, dir);
    if (!fs.existsSync(from)) continue;
    fs.mkdirSync(to, { recursive: true });

    for (const file of fs.readdirSync(from)) {
      if (!file.toLowerCase().endsWith(".webp")) continue;
      const src = path.join(from, file);
      const dst = path.join(to, file);

      // Only redo one when its source is newer, so re-running is cheap.
      try {
        if (fs.statSync(dst).mtimeMs >= fs.statSync(src).mtimeMs) {
          skipped += 1;
          continue;
        }
      } catch {
        /* not generated yet */
      }

      try {
        // The small one is cropped square for a circle; the card keeps the
        // whole photo, since a cropped product is a misleading product.
        const pipe = sharp(src);
        await (size.px <= 96
          ? pipe.resize(size.px, size.px, { fit: "cover", position: "centre" })
          : pipe.resize(size.px, size.px, { fit: "inside", withoutEnlargement: true })
        )
          .webp({ quality: size.quality })
          .toFile(dst);
        written += 1;
      } catch (err) {
        console.warn("could not resize", dir + "/" + file, String(err).slice(0, 80));
      }
    }
  }
}

console.log(`derived images written: ${written}, already current: ${skipped}`);
