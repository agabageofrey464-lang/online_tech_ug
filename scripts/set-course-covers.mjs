// Real photographs for the course covers that had none.
//
// Six Microsoft courses shared one dark snapshot of a spreadsheet, and after
// that was split up they carried drawn glyphs instead — honest, but the owner
// wanted photographs. Several other courses were worse than either: mobile app
// development showed a hard-disk logo, photography showed the cover of an
// 1880s German camera magazine, and web development showed the Wikipedia logo
// on a black field.
//
// Searching Wikimedia Commons for these produced land deeds, soldiers and a
// burning hut, so the pictures come from the photography already in this repo
// — bright, professional, and each used by exactly one course. Nothing is
// reused across two, which is the fault that started all this.
//
// Each cover shows the *work*, not the software: a spreadsheet course gets a
// dashboard, a presentation course gets people presenting, an accounting
// course gets money being counted. No gradient is baked in — the card already
// lays one over the bottom for its title.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire("e:/Projects/onlinetech_ug/");
const sharp = require("e:/Projects/onlinetech_ug/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js");

const PUB = "e:/Projects/onlinetech_ug/apps/web/public";

// course slug -> source photo, and why it suits the course
const COVERS = {
  // charts and figures on screen — what the course produces
  "microsoft-excel": "web/photo-1551288049-bebda4e38f71.webp",
  // hands writing at a clean desk — documents
  "microsoft-word": "web/photo-1555421689-491a97ff2040.webp",
  // a team working through something together — slides are for an audience
  "microsoft-powerpoint": "hero/hero-4.webp",
  // racks of stored records — a database course
  "microsoft-access": "web/photo-1544197150-b99a580bb7a8.webp",
  // someone laying out a design by hand — publishing
  "microsoft-publisher": "web/photo-1581092160562-40aa08e78837.webp",
  // a classroom, because the suite is taught as a full programme
  "microsoft-office": "web/photo-1509062522246-3755977927d7.webp",

  // Wrong pictures, not merely dull ones:
  "mobile-app-development": "web/photo-1512941937669-90a1b58e7e9c.webp", // was an HDD logo
  "photography-editing": "web/photo-1558618666-fcd25c85cd64.webp", // was an 1880s magazine
  "web-development": "web/photo-1547658719-da2b51169166.webp", // was the Wikipedia logo
  "quickbooks-accounting": "web/photo-1633158829585-23ba8f7c8caf.webp", // was a cluttered desk

  // Not wrong, just weak: a bare pie-chart screenshot and a wall of
  // infographic text, neither of which reads at the size a card shows.
  "data-analysis-excel": "web/photo-1460925895917-afdab827c52f.webp",
  "digital-marketing": "web/photo-1556740738-b6a63e27c4df.webp",
};

let n = 0;
for (const [slug, src] of Object.entries(COVERS)) {
  const from = path.join(PUB, src);
  if (!fs.existsSync(from)) {
    console.warn("missing source:", src);
    continue;
  }
  await sharp(from)
    .resize(1200, 800, { fit: "cover", position: "centre" })
    .webp({ quality: 86 })
    .toFile(path.join(PUB, "courses", `${slug}.webp`));
  n += 1;
}
console.log("course covers written:", n);
