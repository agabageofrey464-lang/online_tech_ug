/**
 * The 96px version of a product or course picture.
 *
 * Image optimisation is off site-wide — we exhausted the quota and the bill
 * was not worth it — so an `<Image>` drawing a 28px circle was downloading the
 * full photograph, a thousand pixels wide and 50–120KB, to paint it. The offer
 * strip and the panel-header circles did that at the very top of every page,
 * which is why they sat there as white discs until the network caught up.
 *
 * scripts/generate-thumbs.mjs writes one of these for every file under
 * /products and /courses, so a mapped path always exists. Anything outside
 * those folders is returned untouched.
 */
const DERIVED = ["/products/", "/courses/"];

function derived(src: string, folder: string): string {
  if (!src || src.startsWith("http")) return src;
  // Aliases: the database stores plenty of .jpg paths that rewrite to .webp,
  // and the derived copies are only ever .webp.
  const webp = src.replace(/\.(jpe?g|png)$/i, ".webp");
  return DERIVED.some((d) => webp.startsWith(d)) ? `/${folder}${webp}` : webp;
}

/** The 96px copy, for circles drawn at 28-44px. */
export function thumb(src: string): string {
  return derived(src, "thumbs");
}

/**
 * The 400px copy, for product and course cards.
 *
 * Cards draw these between 136 and 204px but were loading the original, and
 * with image optimisation off that is the whole file. The home page alone
 * carries 284 of them — 12.4MB of pictures, which on a slow connection does
 * not read as "loading", it reads as missing. The same images at 400px come
 * to 6.3MB across the entire catalogue.
 *
 * Product and course *pages* keep the full file: there the picture is the
 * thing being examined.
 */
export function card(src: string): string {
  return derived(src, "cards");
}
