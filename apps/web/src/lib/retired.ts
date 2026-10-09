/**
 * Products taken off sale for good.
 *
 * The catalogue file (data.ts) still lists them, and the API seeds itself from
 * that file — so deleting a product in the dashboard alone would bring it back
 * the next time the API synced. A slug named here is left out of the feed the
 * API reads, out of every listing, and its page answers "not found".
 *
 * These ten phones had no photograph, only a drawn placeholder. To sell one
 * again, remove its slug here and add it with a real photograph.
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
]);
