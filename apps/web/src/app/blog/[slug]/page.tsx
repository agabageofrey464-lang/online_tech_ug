import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { articles, findArticle } from "@/lib/blog";
import { whatsappLink } from "@/lib/site";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = findArticle(slug);
  if (!a) return { title: "Article not found" };
  return { title: a.title, description: a.excerpt };
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = findArticle(slug);
  if (!a) notFound();

  return (
    <article className="container-page max-w-3xl py-10">
      <div className="mb-6">
        <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: a.title }]} />
      </div>
      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">{a.category}</span>
      <h1 className="mt-3 text-3xl font-extrabold text-ink-600">{a.title}</h1>
      <p className="mt-2 text-sm text-ink-700/60">
        By {a.author} · {fmt(a.date)} · {a.readMins} min read
      </p>

      <div className="mt-6 space-y-4">
        {a.body.map((b, i) =>
          b.h ? (
            <h2 key={i} className="pt-2 text-xl font-extrabold text-ink-600">
              {b.h}
            </h2>
          ) : (
            <p key={i} className="leading-relaxed text-ink-700/85">
              {b.p}
            </p>
          ),
        )}
      </div>

      <div className="mt-8 rounded-card bg-ink-700 p-6 text-center text-white">
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
