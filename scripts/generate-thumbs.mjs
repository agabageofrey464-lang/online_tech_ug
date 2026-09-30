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
const SIZE = 96;
// Drawn at 28–40px on a 2x screen, so 96 is already generous.
const DIRS = ["products", "courses"];

let written = 0;
let skipped = 0;

for (const dir of DIRS) {
  const from = path.join(PUB, dir);
  const to = path.join(PUB, "thumbs", dir);
  if (!fs.existsSync(from)) continue;
  fs.mkdirSync(to, { recursive: true });

  for (const file of fs.readdirSync(from)) {
    if (!file.toLowerCase().endsWith(".webp")) continue;
    const src = path.join(from, file);
    const dst = path.join(to, file);

    // Only redo a thumbnail when its source is newer, so re-running is cheap.
    try {
      if (fs.statSync(dst).mtimeMs >= fs.statSync(src).mtimeMs) {
        skipped += 1;
        continue;
      }
    } catch {
      /* no thumbnail yet */
    }

    try {
      await sharp(src)
        .resize(SIZE, SIZE, { fit: "cover", position: "centre" })
        .webp({ quality: 74 })
        .toFile(dst);
      written += 1;
    } catch (err) {
      console.warn("could not thumbnail", dir + "/" + file, String(err).slice(0, 80));
    }
  }
}

console.log(`thumbnails written: ${written}, already current: ${skipped}`);
