// Curate a set of small videos into apps/web/public/videos with a manifest.
import fs from "node:fs";
import path from "node:path";
const ROOT = "e:/Projects/onlinetech_ug";
const SRC = path.join(ROOT, "images");
const OUT = path.join(ROOT, "apps/web/public/videos");
fs.mkdirSync(OUT, { recursive: true });

const MAX = 4.2 * 1024 * 1024; // <= ~4.2MB
const MIN = 250 * 1024;
const LIMIT = 18;

const vids = fs
  .readdirSync(SRC)
  .filter((f) => f.toLowerCase().endsWith(".mp4"))
  .map((f) => ({ f, size: fs.statSync(path.join(SRC, f)).size }))
  .filter((v) => v.size >= MIN && v.size <= MAX)
  .sort((a, b) => a.size - b.size);

// spread the selection across the size range for variety
const step = Math.max(1, Math.floor(vids.length / LIMIT));
const picked = [];
for (let i = 0; i < vids.length && picked.length < LIMIT; i += step) picked.push(vids[i]);

const titles = [
  "Laptop Showcase", "In-Store Tour", "Unboxing & First Look", "Performance Demo",
  "Customer Pickup", "Gaming Laptop Reel", "MacBook Spotlight", "Business Series",
  "Desktop Setup", "Accessories Lineup", "Deal of the Week", "Quality Check",
  "New Arrivals", "Repairs & Support", "Behind the Counter", "Tech Tips",
  "Featured Device", "OnlineTech Daily",
];

const manifest = [];
picked.forEach((v, i) => {
  const name = `v-${String(i + 1).padStart(2, "0")}.mp4`;
  fs.copyFileSync(path.join(SRC, v.f), path.join(OUT, name));
  manifest.push({ src: `/videos/${name}`, title: titles[i % titles.length], size: v.size });
});

fs.writeFileSync(path.join(OUT, "videos.json"), JSON.stringify(manifest, null, 2));
const total = manifest.reduce((s, m) => s + m.size, 0);
console.log("videos:", manifest.length, "total MB:", (total / 1024 / 1024).toFixed(1));
