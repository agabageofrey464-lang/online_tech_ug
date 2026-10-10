/**
 * Products taken off sale for good.
 *
 * The catalogue file (data.ts) still lists them, and the API seeds itself from
 * that file — so deleting a product in the dashboard alone would bring it back
 * the next time the API synced. A slug named here is left out of the feed the
 * API reads, out of every listing, and its page answers "not found".
 *
 * The first ten phones had no photograph, only a drawn placeholder. The rest
 * of the shop's own phones followed when phones were handed to vendors. To
 * sell one again, remove its slug here.
 */
export const RETIRED = new Set([
  "iphone-13-128gb",
  "samsung-galaxy-a15",
  "redmi-note-13",
  "tecno-spark-30",
  "tecno-spark-20",
  "tecno-camon-30",
  "tecno-pova-6",
  "infinix-note-40",
  "infinix-hot-40i",
  "oppo-a60",
  // The shop's own phones, taken off sale on 10 Oct 2026: phones are sold by
  // approved vendors now, and only their listings appear under Phones.
  "infinix-hot-50",
  "iphone-11-64gb",
  "iphone-12-128gb",
  "iphone-13-pro-128gb",
  "iphone-14-128gb",
  "iphone-14-plus-128gb",
  "iphone-14-pro-max-256gb",
  "iphone-15-128gb",
  "iphone-15-pro-256gb",
  "iphone-16-128gb",
  "iphone-16-pro-max-256gb",
  "iphone-17-256gb",
  "itel-p65",
  "redmi-note-14",
  "samsung-galaxy-a06",
  "samsung-galaxy-a25-5g",
  "samsung-galaxy-a35-5g",
  "samsung-galaxy-a55-5g",
  "samsung-galaxy-note-9-128gb",
  "samsung-galaxy-note-9-512gb",
  "samsung-galaxy-s20-5g",
  "samsung-galaxy-s20-fe-5g",
  "samsung-galaxy-s20-plus-5g",
  "samsung-galaxy-s20-ultra-5g",
  "samsung-galaxy-s21-plus-5g",
  "samsung-galaxy-s21-ultra-5g",
  "samsung-galaxy-s24-ultra-256gb",
  "samsung-galaxy-s9-plus",
  "xiaomi-redmi-14c",
]);
