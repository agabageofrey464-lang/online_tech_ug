import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const BASE = site.url.startsWith("http://localhost") ? "https://www.onlinetechug.com" : site.url;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep user-only / transactional pages out of search results.
      disallow: ["/account", "/wishlist", "/checkout", "/learn/dashboard", "/refer", "/login", "/signup", "/_api/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
