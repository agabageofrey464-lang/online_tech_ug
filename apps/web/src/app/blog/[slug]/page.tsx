import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { findArticle } from "@/lib/blog";
import { whatsappLink } from "@/lib/site";
import { share } from "@/lib/seo";

export const revalidate = 300; // ISR: rebuild every 5 min instead of on every request

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

type ApiPost = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  author: string;
  created_at: string;
  image_url?: string;
};

async function getApiPost(slug: string): Promise<ApiPost | null> {
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${API}/api/v1/posts/${slug}`, { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch {
    /* ignore */
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getApiPost(slug);
  if (post) return share({ title: post.title, description: post.excerpt }, `/blog/${slug}`);
  const a = findArticle(slug);
  return a ? share({ title: a.title, description: a.excerpt }, `/blog/${slug}`) : { title: "Article not found" };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getApiPost(slug);

  // Common shape for rendering
  let view:
    | { title: string; category: string; author: string; date: string; readMins: number; image: string; blocks: { h?: string; p?: string }[] }
    | null = null;

  if (post) {
    const paras = post.body.split(/\n\s*\n/).map((p) => ({ p: p.trim() })).filter((b) => b.p);
    view = {
      title: post.title,
      category: post.category,
      author: post.author,
      date: post.created_at,
      readMins: Math.max(1, Math.round(post.body.split(/\s+/).length / 200)),
      image: post.image_url || "",
      blocks: paras,
    };
  } else {
    const a = findArticle(slug);
    if (a) view = { title: a.title, category: a.category, author: a.author, date: a.date, readMins: a.readMins, image: a.image, blocks: a.body };
  }

  if (!view) notFound();

  return (
    <article className="container-page max-w-3xl py-10">
      <div className="mb-6">
        <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: view.title }]} />
      </div>
      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">{view.category}</span>
      <h1 className="mt-3 text-3xl font-extrabold text-ink-600">{view.title}</h1>
      <p className="mt-2 text-sm text-ink-700/60">
        By {view.author} · {fmt(view.date)} · {view.readMins} min read
      </p>

      {view.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={view.image}
          alt={view.title}
          className="mt-5 aspect-[16/9] w-full rounded-card object-cover shadow-sm"
        />
      )}

      <div className="mt-6 space-y-4">
        {view.blocks.map((b, i) =>
          b.h ? (
            <h2 key={i} className="pt-2 text-xl font-extrabold text-ink-600">{b.h}</h2>
          ) : (
            <p key={i} className="leading-relaxed text-ink-700/85">{b.p}</p>
          ),
        )}
      </div>

      {/* In-article promo box */}
      <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-card border border-brand-200 bg-brand-50 p-5 sm:flex-row">
        <div>
          <p className="text-sm font-extrabold text-ink-900">🔥 Shop the latest tech deals</p>
          <p className="text-xs text-ink-700/70">Laptops, phones & accessories with warranty and countrywide delivery.</p>
        </div>
        <Link href="/shop?deals=1" className="shrink-0 rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600">
          See today&apos;s deals →
        </Link>
      </div>

      <div className="mt-6 rounded-card bg-ink-700 p-6 text-center text-white">
        <p className="font-bold">Have a question or need help choosing?</p>
        <a
          href={whatsappLink("Hi, I read your blog and have a question.")}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
        >
          Chat with us on WhatsApp
        </a>
      </div>

      <div className="mt-8">
        <Link href="/blog" className="text-sm font-bold text-brand-600 hover:underline">
          ← Back to all articles
        </Link>
      </div>
    </article>
  );
}
