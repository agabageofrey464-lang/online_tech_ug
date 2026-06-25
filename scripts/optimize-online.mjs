import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const require = createRequire("e:/Projects/onlinetech_ug/");
const sharp = require("e:/Projects/onlinetech_ug/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js");
const ROOT = "e:/Projects/onlinetech_ug";
const ON = path.join(ROOT, "images/_online");
const prodDir = path.join(ROOT, "apps/web/public/products");

// Chosen candidate per SKU (sourced from Wikimedia Commons).
const SEL = {
  "hp-280-g6-desktop": "hp-280-g6-desktop/cand-1.jpg",
  "logitech-mk270": "logitech-mk270/cand-4.jpg",
  "logitech-c270-webcam": "logitech-c270-webcam/cand-1.jpg",
  "laptop-charger-universal": "laptop-charger-universal/cand-2.jpg",
  "mercury-ups-650va": "mercury-ups-650va/cand-2.jpg",
  "tp-link-archer-c6": "tp-link-archer-c6/cand-0.jpg",
  "tp-link-tl-sg108": "tp-link-tl-sg108/cand-4.jpg",
  "sandisk-ssd-1tb": "sandisk-ssd-1tb/cand-1.jpg",
  "wd-elements-1tb-hdd": "wd-elements-1tb-hdd/cand-0.jpg",
  "kingston-240gb-ssd": "kingston-240gb-ssd/cand-0.jpg",
};

for (const [slug, rel] of Object.entries(SEL)) {
  const src = path.join(ON, rel);
  if (!fs.existsSync(src)) { console.warn("MISSING", rel); continue; }
  await sharp(src)
    .resize(900, 900, { fit: "contain", background: "#ffffff" })
    .flatten({ background: "#ffffff" })
    .webp({ quality: 82 })
    .toFile(path.join(prodDir, `${slug}.webp`));
  console.log("online product:", slug);
}
console.log("done", Object.keys(SEL).length);
