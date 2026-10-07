import type { Metadata } from "next";
import { site } from "@/lib/site";

/** The picture a shared link shows when the page has none of its own. */
export const SHARE_IMAGE = "/og.jpg";

/**
 * The JPEG copy of a product or course picture, made for link previews.
 * WhatsApp and Facebook are unreliable with WebP, which is what the site
 * serves, so scripts/generate-thumbs.mjs writes a 1200x630 JPEG beside each.
 */
export function shareImage(src: string | undefined): string {
  if (!src || !/^\/(products|courses)\//.test(src)) return SHARE_IMAGE;
  return `/og${src.replace(/\.(webp|jpe?g|png)$/i, ".jpg")}`;
}

/**
 * A page's metadata, with what a shared link needs added to it.
 *
 * Next does not carry a page's title into its Open Graph tags; a page that
 * sets only `title` and `description` inherits the site-wide ones. So a link
 * to a course, the internship page or a blog post, pasted into WhatsApp, was
 * previewed as "Online Tech Uganda" with the logo, pointing at the home page —
 * the same card whatever was shared. This gives each page its own title,
 * description, address and picture in the preview.
 */
export function share(meta: Metadata, path: string, image: string = SHARE_IMAGE): Metadata {
  const title = typeof meta.title === "string" ? meta.title : site.name;
  const description = meta.description ?? site.description;
  return {
    ...meta,
    alternates: { canonical: path, ...meta.alternates },
    openGraph: {
      title,
      description,
      url: path,
      siteName: site.name,
      locale: "en_UG",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      ...meta.openGraph,
    },
    twitter: { card: "summary_large_image", title, description, images: [image], ...meta.twitter },
  };
}
