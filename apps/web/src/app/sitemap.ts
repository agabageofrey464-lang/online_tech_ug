import type { MetadataRoute } from "next";
import { nav, site } from "@/lib/site";
import { products, courses } from "@/lib/data";
import { portfolio } from "@/lib/portfolio";
import { articles } from "@/lib/blog";

// Private / user-only routes that should never be indexed.
const PRIVATE = new Set(["/account", "/wishlist", "/checkout", "/checkout/success", "/learn/dashboard"]);

const url = (path: string) => `${site.url}${path === "/" ? "" : path}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = nav
    .filter((item) => !PRIVATE.has(item.href))
    .map((item) => ({
      url: url(item.href),
      lastModified: now,
      changeFrequency: "weekly",
      priority: item.href === "/" ? 1 : 0.8,
    }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: url(`/shop/${p.id}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const coursePages: MetadataRoute.Sitemap = courses.map((c) => ({
    url: url(`/learn/${c.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const portfolioPages: MetadataRoute.Sitemap = portfolio.map((p) => ({
    url: url(`/portfolio/${p.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const blogPages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: url(`/blog/${a.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...coursePages, ...portfolioPages, ...blogPages];
}
