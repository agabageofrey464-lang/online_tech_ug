import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const BASE = site.url.startsWith("http://localhost") ? "https://www.onlinetechug.com" : site.url;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep user-only / transactional pages out of search results.
      disallow: [
        // Signed-in areas
        "/account", "/wishlist", "/cart", "/checkout", "/login", "/signup", "/reset-password",
        "/vendor", "/academy", "/learn/dashboard", "/learn/codes",
        // One-off pages that mean nothing to a stranger arriving from search:
        // somebody else's receipt, a gated notes page, an unsubscribe link.
        "/learn/*/registered", "/learn/*/success", "/learn/*/notes",
        "/unsubscribe", "/advertise/create", "/refer",
        "/_api/",
      ],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
