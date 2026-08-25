import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { articles } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Tech Blog — Guides, Tips & Insights",
  description:
    "Buying guides, tech tips, security advice and business insights from Online Tech Uganda. (Looking for headlines? See our News page.)",
};

export const revalidate = 300; // ISR: rebuild every 5 min instead of on every request

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

type Card = { slug: string; title: string; category: string; excerpt: string; image: string; date: string; readMins: number };

async function getPosts(): Promise<Card[]> {
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${API}/api/v1/posts?type=blog`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((p: { slug: string; title: string; category: string; excerpt: string; image_url: string; body: string; created_at: string }) => ({
          slug: p.slug,
          title: p.title,
          category: p.category,
          excerpt: p.excerpt,
          image: p.image_url || "",
          date: p.created_at,
          readMins: Math.max(1, Math.round((p.body?.split(/\s+/).length ?? 0) / 200)),
        }));
      }
    }
  } catch {
    /* ignore */
  }
  return [];
}

function Thumb({ c, className }: { c: Card; className: string }) {
  if (c.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={c.image} alt={c.title} className={`object-cover ${className}`} />;
  }
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-ink-700 to-brand-500 text-center ${className}`}>
      <span className="px-4 text-lg font-extrabold text-white">{c.category}</span>
    </div>
  );
}

export default async function BlogPage() {
  const apiPosts = await getPosts();
  const staticCards: Card[] = articles.map((a) => ({
    slug: a.slug, title: a.title, category: a.category, excerpt: a.excerpt, image: a.image, date: a.date, readMins: a.readMins,
  }));
  const all = [...apiPosts, ...staticCards];
  const [featured, ...rest] = all;

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Blog" }]}
        eyebrow="Tech blog"
        title="Guides, tips & insights"
        subtitle="Buying guides, online safety and business advice for Uganda. For the latest headlines, see our News page."
      />
      <section className="container-page py-12">
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group block overflow-hidden rounded-card border border-ink-600/10 bg-white shadow-sm transition hover:shadow-md">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch">
              <Thumb c={featured} className="h-48 w-full shrink-0 sm:h-auto sm:w-72" />
              <div className="p-6 sm:py-8 sm:pr-8">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">Featured · {fmt(featured.date)}</span>
                <h2 className="mt-1 text-2xl font-extrabold text-ink-600 group-hover:text-brand-600">{featured.title}</h2>
                <p className="mt-2 text-ink-700/70">{featured.excerpt}</p>
                <p className="mt-3 text-sm font-bold text-brand-600">Read article →</p>
              </div>
            </div>
          </Link>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((a) => (
            <Link key={a.slug} href={`/blog/${a.slug}`} className="group flex flex-col overflow-hidden rounded-card border border-ink-600/10 bg-white shadow-sm transition hover:shadow-md">
              <Thumb c={a} className="h-40 w-full" />
              <div className="flex flex-1 flex-col p-5">
                <span className="w-fit rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700">{a.category}</span>
                <h3 className="mt-2 text-lg font-extrabold text-ink-600 group-hover:text-brand-600">{a.title}</h3>
                <p className="clamp-2 mt-2 flex-1 text-sm text-ink-700/70">{a.excerpt}</p>
                <p className="mt-3 text-xs text-ink-700/50">{fmt(a.date)} · {a.readMins} min read</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
