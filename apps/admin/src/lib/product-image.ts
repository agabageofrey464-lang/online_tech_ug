// Product pictures are files on the shop, and the API stores where they are as
// the shop sees them — "/products/dell-latitude-e6440.webp". Loaded from the
// admin as written, that path points at the admin itself and comes back as the
// login page, so every picture here has to be given the shop's address first.
const SHOP = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.onlinetechug.com").replace(/\/$/, "");

/** The full picture. A product with none saved falls back to the shop's own
 *  convention of one file per product, named after its slug. */
export function productImage(url: string | null | undefined, slug?: string): string {
  const src = url || (slug ? `/products/${slug}.webp` : "");
  if (!src) return "";
  return /^(https?:|data:|blob:)/.test(src) ? src : `${SHOP}${src.startsWith("/") ? "" : "/"}${src}`;
}

/** The shop's 96px copy, for the rows of a list. Only pictures under
 *  /products have one; anything else is returned whole. */
export function productThumb(url: string | null | undefined, slug?: string): string {
  const src = url || (slug ? `/products/${slug}.webp` : "");
  if (src.startsWith("/products/")) return `${SHOP}/thumbs${src.replace(/\.(jpe?g|png)$/i, ".webp")}`;
  return productImage(src);
}
