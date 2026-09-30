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
const THUMBED = ["/products/", "/courses/"];

export function thumb(src: string): string {
  if (!src || src.startsWith("http")) return src;
  // Aliases: the database stores plenty of .jpg paths that rewrite to .webp,
  // and the thumbnails are only ever .webp.
  const webp = src.replace(/\.(jpe?g|png)$/i, ".webp");
  return THUMBED.some((d) => webp.startsWith(d)) ? `/thumbs${webp}` : webp;
}
