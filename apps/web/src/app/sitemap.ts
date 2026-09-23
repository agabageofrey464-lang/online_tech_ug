import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { products, courses } from "@/lib/data";
import { portfolio } from "@/lib/portfolio";
import { articles } from "@/lib/blog";

// Canonical base — falls back to the live domain (never localhost in the sitemap).
const BASE = site.url.startsWith("http://localhost") ? "https://www.onlinetechug.com" : site.url;
const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api.onlinetechug.com";
const url = (path: string) => `${BASE}${path === "/" ? "" : path}`;

// Public, indexable routes.
const PUBLIC_PATHS = [
  "/", "/shop", "/find", "/categories", "/marketplace", "/sell", "/learn", "/community", "/jobs",
  "/freelancers", "/advertise", "/services", "/pricing", "/portfolio", "/request", "/track",
  "/news", "/blog", "/about", "/help", "/refer", "/pay", "/contact",
];

async function apiList(path: string): Promise<Record<string, unknown>[]> {
  try {
    const res = await fetch(`${API}/api/v1${path}`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch {
    /* ignore */
  }
  return [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = PUBLIC_PATHS.map((p) => ({
    url: url(p),
    lastModified: now,
    changeFrequency: p === "/" || p === "/shop" || p === "/news" ? "daily" : "weekly",
    priority: p === "/" ? 1 : p === "/shop" || p === "/marketplace" ? 0.9 : 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: url(`/shop/${p.id}`), lastModified: now, changeFrequency: "weekly", priority: 0.7,
  }));
  const coursePages: MetadataRoute.Sitemap = courses.map((c) => ({
    url: url(`/learn/${c.slug}`), lastModified: now, changeFrequency: "monthly", priority: 0.7,
  }));
  const portfolioPages: MetadataRoute.Sitemap = portfolio.map((p) => ({
    url: url(`/portfolio/${p.slug}`), lastModified: now, changeFrequency: "monthly", priority: 0.6,
  }));
  const staticBlog: MetadataRoute.Sitemap = articles.map((a) => ({
    url: url(`/blog/${a.slug}`), lastModified: now, changeFrequency: "monthly", priority: 0.6,
  }));

  // Dynamic blog/news posts published from the admin.
  const posts = await apiList("/posts");
  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: url(`/blog/${p.slug as string}`),
    lastModified: p.created_at ? new Date(p.created_at as string) : now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // De-duplicate blog slugs (static + dynamic).
  const seen = new Set<string>();
  const blogPages = [...postPages, ...staticBlog].filter((e) => (seen.has(e.url) ? false : seen.add(e.url)));

  return [...staticPages, ...productPages, ...coursePages, ...portfolioPages, ...blogPages];
}
