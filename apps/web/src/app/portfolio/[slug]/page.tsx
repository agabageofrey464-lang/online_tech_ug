import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductGallery } from "@/components/product-gallery";
import { Button } from "@/components/ui";
import { portfolio, findProject, caseStudies } from "@/lib/portfolio";
import { whatsappLink } from "@/lib/site";
import { share } from "@/lib/seo";

export function generateStaticParams() {
  return portfolio.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = findProject(slug);
  if (!p) return { title: "Project not found" };
  return share(
    { title: `${p.title} — ${p.kind === "case-study" ? "Case study" : "Portfolio"}`, description: p.summary },
    `/portfolio/${p.slug}`,
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) notFound();

  const ask = whatsappLink(`Hi, I'd like something like your "${project.title}" project.`);

  // ── An example of what we build: what it includes, plainly labelled ──────
  if (project.kind === "example") {
    return (
      <div className="container-page py-10">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: "Portfolio", href: "/portfolio" }, { label: project.title }]} />
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <ProductGallery images={project.shots} alt={project.title} />

          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">{project.category}</span>
              <span className="rounded-full bg-ink-900/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">Example</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold text-ink-600">{project.title}</h1>
            <p className="mt-4 text-ink-700/80">{project.description}</p>

            <h2 className="mt-6 text-sm font-bold uppercase tracking-wider text-ink-700/50">What&apos;s included</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {project.tags.map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm text-ink-700/80">
                  <Check size={16} className="shrink-0 text-brand-500" /> {t}
                </li>
              ))}
            </ul>

            <p className="mt-5 rounded-lg bg-ink-50 px-3 py-2.5 text-[13px] leading-relaxed text-ink-700/70">
              This is an example of a system we build, to show what one includes. The pictures are
              illustrative. For finished work you can open, see our{" "}
              <Link href="/portfolio" className="font-bold text-brand-600 hover:underline">
                case studies
              </Link>
              .
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button href={ask} external variant="primary">
                Ask for one like this
              </Button>
              <Button href="/request" variant="outline">
                Request a quote
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── A case study: the client, the problem, what we built, and proof ──────
  const others = caseStudies().filter((c) => c.slug !== project.slug);

  return (
    <article>
      {/* Header */}
      <header className="border-b-4 border-brand-500 bg-ink-700 text-white">
        <div className="container-page py-7 sm:py-10">
          <Breadcrumbs items={[{ label: "Portfolio", href: "/portfolio" }, { label: project.title }]} light />
          <p className="mt-4 text-[11px] font-black uppercase tracking-[0.2em] text-brand-300">
            Case study · {project.category}
          </p>
          <h1 className="mt-1.5 max-w-3xl font-display text-3xl font-black leading-tight sm:text-4xl">{project.title}</h1>
          <p className="mt-2 max-w-2xl text-[15.5px] leading-relaxed text-white/80">{project.summary}</p>

          <dl className="mt-6 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
            {[
              ["Client", project.client],
              ["Industry", project.industry ?? "—"],
              ["Year", project.year],
              ["Type", project.category],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] font-bold uppercase tracking-wide text-white/50">{k}</dt>
                <dd className="mt-0.5 font-semibold">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noreferrer"
                className="press inline-flex items-center gap-2 rounded-full bg-[#f3efe9] px-5 py-2.5 text-sm font-black text-ink-900 shadow-sm transition hover:brightness-105"
              >
                Open the live site <ArrowUpRight size={16} />
              </a>
            )}
            <a
              href={ask}
              target="_blank"
              rel="noreferrer"
              className="press inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold text-white ring-1 ring-white/30 transition hover:bg-white/20"
            >
              Ask for one like this
            </a>
          </div>
        </div>
      </header>

      {/* The finished thing, first — nobody should scroll to find out what it looks like. */}
      <section className="container-page -mt-0 pt-8">
        <figure className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-ink-600/10">
          <div className="relative aspect-[16/10] bg-ink-50">
            <Image src={project.shots[0]} alt={`${project.title} — main screen`} fill priority sizes="(max-width: 1024px) 100vw, 1100px" className="object-cover object-top" />
          </div>
          {project.captions?.[0] && (
            <figcaption className="border-t border-ink-600/10 px-4 py-2.5 text-[13px] text-ink-700/70">{project.captions[0]}</figcaption>
          )}
        </figure>
      </section>

      {/* Facts */}
      {project.facts && (
        <section className="container-page pt-6">
          <dl className="grid gap-3 sm:grid-cols-3">
            {project.facts.map((f) => (
              <div key={f.label} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-ink-600/10">
                <dt className="font-display text-2xl font-black text-brand-600">{f.value}</dt>
                <dd className="mt-0.5 text-[13.5px] text-ink-700/70">{f.label}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Problem and solution */}
      <section className="container-page grid gap-5 pt-10 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink-600/10 sm:p-7">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-ink-700/50">The problem</p>
          <p className="mt-2 text-[15.5px] leading-relaxed text-ink-700/85">{project.problem}</p>
        </div>
        <div className="rounded-2xl bg-ink-700 p-6 text-white shadow-sm sm:p-7">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#f3efe9]">What we did</p>
          <p className="mt-2 text-[15.5px] leading-relaxed text-white/90">{project.solution}</p>
        </div>
      </section>

      {/* What we built */}
      {project.built && (
        <section className="container-page pt-10">
          <h2 className="font-display text-2xl font-black text-ink-900">What we built</h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2">
            {project.built.map((b, i) => (
              <li key={b.title} className="flex gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-ink-600/10">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 font-display text-base font-black text-white">
                  {i + 1}
                </span>
                <span>
                  <span className="block font-display text-[17px] font-black text-ink-900">{b.title}</span>
                  <span className="mt-0.5 block text-[14px] leading-relaxed text-ink-700/80">{b.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* More screens, each with a line saying what it shows */}
      {project.shots.length > 1 && (
        <section className="container-page pt-10">
          <h2 className="font-display text-2xl font-black text-ink-900">More of it</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {project.shots.slice(1).map((src, i) => {
              const caption = project.captions?.[i + 1];
              const phone = /phone/i.test(caption ?? "");
              return (
                <figure key={src} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-ink-600/10">
                  <div className={`relative bg-ink-50 ${phone ? "aspect-[16/10]" : "aspect-[16/10]"}`}>
                    <Image src={src} alt={caption ?? `${project.title} — screen ${i + 2}`} fill sizes="(max-width: 768px) 100vw, 50vw" className={phone ? "object-contain py-3" : "object-cover object-top"} />
                  </div>
                  {caption && <figcaption className="border-t border-ink-600/10 px-4 py-2.5 text-[13px] text-ink-700/70">{caption}</figcaption>}
                </figure>
              );
            })}
          </div>
        </section>
      )}

      {/* Built with */}
      {project.stack && (
        <section className="container-page pt-10">
          <h2 className="font-display text-2xl font-black text-ink-900">Built with</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.stack.map((t) => (
              <span key={t} className="rounded-full bg-white px-3.5 py-1.5 text-[13px] font-bold text-ink-800 shadow-sm ring-1 ring-ink-600/10">
                {t}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* A call to action about this project, not a generic one */}
      <section className="container-page pt-10">
        <div className="stripes flex flex-col gap-4 rounded-2xl bg-brand-600 px-6 py-7 text-white shadow-sm sm:px-9 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-2xl font-black leading-tight sm:text-3xl">
              Need {project.category === "Management Systems" ? "a system" : "a site"} like this one?
            </h2>
            <p className="mt-1.5 max-w-xl text-[15px] text-white/90">
              Tell us what yours has to do. We reply with a written quote and a timeline before any work begins.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Link href="/request" className="press inline-flex items-center justify-center rounded-full bg-[#f3efe9] px-6 py-3 text-sm font-black text-ink-900 shadow-sm transition hover:brightness-105">
              Request a quote
            </Link>
            <a href={ask} target="_blank" rel="noreferrer" className="press inline-flex items-center justify-center rounded-full bg-white/15 px-6 py-3 text-sm font-bold text-white ring-1 ring-white/30 transition hover:bg-white/25">
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* The other case studies */}
      {others.length > 0 && (
        <section className="container-page py-10">
          <h2 className="font-display text-xl font-black text-ink-900">More case studies</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {others.map((c) => (
              <Link key={c.slug} href={`/portfolio/${c.slug}`} className="card-lift group flex overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-ink-600/10">
                <div className="relative w-32 shrink-0 overflow-hidden bg-ink-50 sm:w-44">
                  <Image src={c.shots[0]} alt="" fill sizes="176px" className="card-zoom object-cover object-top" />
                </div>
                <div className="min-w-0 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-700/55">{c.category}</p>
                  <p className="mt-0.5 font-display text-[17px] font-black leading-snug text-ink-900">{c.title}</p>
                  <span className="mt-1.5 inline-block text-sm font-bold text-brand-600 group-hover:underline">Read it →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
