import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { articles } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Tech Blog",
  description:
    "Weekly tech tips, buying guides, security advice and business insights from Online Tech Uganda.",
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default function BlogPage() {
  const [featured, ...rest] = articles;
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Blog" }]}
        eyebrow="Tech blog"
        title="Tips, guides & insights"
        subtitle="New articles every week — buying guides, tech tips, online safety and business advice for Uganda."
      />
      <section className="container-page py-12">
        {/* Featured */}
        <Link
          href={`/blog/${featured.slug}`}
          className="group block overflow-hidden rounded-card border border-ink-600/10 bg-white shadow-sm transition hover:shadow-md"
        >
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
            <div className="flex h-40 w-full shrink-0 items-center justify-center rounded-xl bg-ink-700 text-center sm:w-64">
              <span className="px-4 text-lg font-extrabold text-white">{featured.category}</span>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                Featured · {fmt(featured.date)}
              </span>
              <h2 className="mt-1 text-2xl font-extrabold text-ink-600 group-hover:text-brand-600">
                {featured.title}
              </h2>
              <p className="mt-2 text-ink-700/70">{featured.excerpt}</p>
              <p className="mt-3 text-sm font-bold text-brand-600">Read article →</p>
            </div>
          </div>
        </Link>

        {/* Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((a) => (
            <Link
              key={a.slug}
              href={`/blog/${a.slug}`}
              className="group flex flex-col rounded-card border border-ink-600/10 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <span className="w-fit rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700">
                {a.category}
              </span>
              <h3 className="mt-3 text-lg font-extrabold text-ink-600 group-hover:text-brand-600">{a.title}</h3>
              <p className="mt-2 flex-1 text-sm text-ink-700/70">{a.excerpt}</p>
              <p className="mt-3 text-xs text-ink-700/50">
                {fmt(a.date)} · {a.readMins} min read
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
