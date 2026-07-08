import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep user-only / checkout pages out of search results.
      disallow: ["/account", "/wishlist", "/checkout", "/learn/dashboard"],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
