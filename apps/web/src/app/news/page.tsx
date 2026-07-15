import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Technology News — Uganda & the World",
  description:
    "The latest technology news and trends from Uganda, Africa and around the world — gadgets, internet, business, AI and more from Online Tech Uganda.",
};

export const dynamic = "force-dynamic";

type Post = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  image_url: string;
  created_at: string;
};

async function getNews(): Promise<Post[]> {
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${API}/api/v1/posts?type=news`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch {
    /* ignore */
  }
  return [];
}

const fmt = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";

// Category colour for the image-less fallback banner.
const catColor = (c: string) => {
  const map: Record<string, string> = {
    Uganda: "from-red-600 to-yellow-500",
    Africa: "from-green-600 to-lime-500",
    World: "from-blue-700 to-cyan-500",
    Technology: "from-indigo-600 to-brand-500",
    Business: "from-ink-700 to-ink-500",
    Sports: "from-orange-600 to-amber-500",
  };
  return map[c] ?? "from-ink-700 to-brand-500";
};

function Thumb({ p, tall }: { p: Post; tall?: boolean }) {
  const h = tall ? "h-56 sm:h-72" : "h-40";
  if (p.image_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={p.image_url} alt={p.title} className={`w-full ${h} object-cover`} />;
  }
  return (
    <div className={`flex w-full ${h} items-center justify-center bg-gradient-to-br ${catColor(p.category)} p-4 text-center`}>
      <span className="text-lg font-extrabold text-white">{p.category}</span>
    </div>
  );
}

export default async function NewsPage() {
  const news = await getNews();
  const [lead, ...rest] = news;

  return (
    <>
      <PageHeader
        crumbs={[{ label: "News" }]}
        eyebrow="Technology news"
        title="News & Trends"
        subtitle="The latest tech news and trends from Uganda, Africa and around the world — updated regularly."
      />

      <section className="container-page py-10">
        {news.length === 0 ? (
          <div className="rounded-card border border-dashed border-ink-600/20 bg-white p-12 text-center">
            <p className="font-bold text-ink-800">No news yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink-700/60">Check back soon — we post technology news regularly.</p>
          </div>
        ) : (
          <>
            {/* Lead headline */}
            {lead && (
              <Link href={`/blog/${lead.slug}`} className="group block overflow-hidden rounded-card border border-ink-600/10 bg-white shadow-sm transition hover:shadow-md">
                <Thumb p={lead} tall />
                <div className="p-6">
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand-700">{lead.category}</span>
                  <h2 className="mt-2 text-2xl font-extrabold text-ink-900 group-hover:text-brand-600 sm:text-3xl">{lead.title}</h2>
                  <p className="mt-2 max-w-3xl text-ink-700/75">{lead.excerpt}</p>
                  <p className="mt-2 text-xs text-ink-700/50">{fmt(lead.created_at)}</p>
                </div>
              </Link>
            )}

            {/* Headlines grid */}
            {rest.length > 0 && (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex flex-col overflow-hidden rounded-card border border-ink-600/10 bg-white shadow-sm transition hover:shadow-md">
                    <Thumb p={p} />
                    <div className="flex flex-1 flex-col p-5">
                      <span className="w-fit rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">{p.category}</span>
                      <h3 className="mt-2 text-lg font-extrabold leading-tight text-ink-900 group-hover:text-brand-600">{p.title}</h3>
                      <p className="clamp-2 mt-1 flex-1 text-sm text-ink-700/70">{p.excerpt}</p>
                      <p className="mt-2 text-xs text-ink-700/50">{fmt(p.created_at)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
