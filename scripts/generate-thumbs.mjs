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
//   560px — product and course cards.
// Image optimisation is off site-wide (we exhausted the quota), so without
// these every card pulls the original: 284 images on the home page came to
// 12.4MB, which on a Ugandan mobile connection reads as pictures missing.
//
// The card figure is a WIDTH, not a bounding box, because width is what the
// grid fixes: a slot is about 200px across and the picture fills it however
// tall it happens to be. Constraining the longest side instead — which is what
// this did at first — starved the upright photos. A 608×1080 phone shot fitted
// inside 400×400 comes out 225px wide, and a 225px file in a 207px slot on a
// 2× screen is stretched to 414. That is why the phones looked blurred.
//
// 560 is what the measurements asked for: the widest slot drawn is 220px, so
// 440 on a 2× screen, and 511 for a 170px slot on an Android phone at 3×.
// Going further costs bytes for detail no screen can show — 640 would put
// 3.9MB of pictures on the home page against 3.2MB here. withoutEnlargement
// leaves a narrower photo at its own width rather than blowing it up, which
// would add weight and no detail.
const SIZES = [
  { dir: "thumbs", px: 96, quality: 74 },
  { dir: "cards", width: 560, quality: 82 },
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
        await (size.width
          ? pipe.resize({ width: size.width, withoutEnlargement: true })
          : pipe.resize(size.px, size.px, { fit: "cover", position: "centre" })
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
