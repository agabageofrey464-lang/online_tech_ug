// Real photographs for the parts that were still drawn tiles.
//
// Seven products carried on-brand artwork because no photograph existed. Six
// now have one. They are held to the same rule as everything else here: the
// brand on the listing must be the brand in the picture, or no brand visible
// at all. A Samsung drive on a Seagate listing is the castle mistake wearing
// a different hat.
//
// The seventh, the 65W USB-C charger, keeps its tile. Wikimedia Commons has
// no photograph of one — the searches returned cameras, a Samsung battery and
// a bare USB-C cable end, and a cable is not a charger.
//
// Sources are a few hundred pixels. Centring them at native size on a 900px
// field left the subject tiny with a sea of white around it, so they are
// scaled to fill most of the frame instead. The cards draw these at about
// 200px, where the modest upscale is invisible.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire("e:/Projects/onlinetech_ug/");
const sharp = require("e:/Projects/onlinetech_ug/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js");

const OUT = "e:/Projects/onlinetech_ug/apps/web/public/products";
const CAND = process.argv[2]; // the scratchpad holding the reviewed candidates

const PICKS = {
  // A Crucial MX500 on a Crucial MX500 listing — the exact product.
  "crucial-mx500-500gb": "parts5/crucial-mx500-500gb/2.webp",
  // Kingston FURY, the right brand and family.
  "kingston-fury-8gb-ddr4": "parts2/kingston-fury-8gb-ddr4/3.webp",
  // Unbranded white power bank, shown charging a phone.
  "anker-powerbank-20000": "parts2/anker-powerbank-20000/0.webp",
  // Plain black clip-on webcam, no maker's mark — ours is sold as Generic.
  "hd-1080p-webcam": "parts2/hd-1080p-webcam/3.webp",
  // Backlit mechanical keyboard, no brand on the shot.
  "redragon-k552-keyboard": "parts2/redragon-k552-keyboard/1.webp",
  // Plain external drive enclosure.
  "seagate-expansion-1tb": "parts3/seagate-expansion-1tb/2.webp",
};

let n = 0;
for (const [slug, rel] of Object.entries(PICKS)) {
  const from = path.join(CAND, rel);
  if (!fs.existsSync(from)) {
    console.warn("missing candidate:", rel);
    continue;
  }
  await sharp(from)
    .trim({ threshold: 12 })
    .resize(760, 760, { fit: "contain", background: "#ffffff" })
    .extend({ top: 70, bottom: 70, left: 70, right: 70, background: "#ffffff" })
    .flatten({ background: "#ffffff" })
    .webp({ quality: 88 })
    .toFile(path.join(OUT, `${slug}.webp`));
  n += 1;
}
console.log("part photos written:", n);
