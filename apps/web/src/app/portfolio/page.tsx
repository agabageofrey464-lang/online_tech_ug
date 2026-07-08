import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { PortfolioGrid } from "@/components/portfolio-grid";
import { Icon } from "@/components/icon";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Systems & Software We Build — Portfolio",
  description:
    "We design and build websites, mobile apps and management systems for Ugandan businesses. See our work and start your own project.",
};

const capabilities = [
  {
    icon: "web",
    title: "Websites & E-commerce",
    body: "Business sites, online stores and landing pages that load fast, look great on phones and rank on Google.",
    points: ["Company & portfolio sites", "Online shops + Mobile Money", "Blogs & booking pages"],
  },
  {
    icon: "mobile",
    title: "Mobile Apps",
    body: "Android & iOS apps built for real use — from delivery and booking to SACCO and membership apps.",
    points: ["Android & iOS", "Offline-friendly", "Push notifications"],
  },
  {
    icon: "software",
    title: "Management Systems",
    body: "Custom systems tailored to how you actually work, with dashboards, reports and user roles.",
    points: ["School / clinic / POS", "Inventory & HR", "Reports & analytics"],
  },
];

const process = [
  { n: 1, name: "Requirements", body: "We listen and map exactly what you need." },
  { n: 2, name: "Design", body: "Clean, approved mock-ups before we build." },
  { n: 3, name: "Development", body: "We build it in clear, reviewable stages." },
  { n: 4, name: "Testing", body: "We test on real devices and fix everything." },
  { n: 5, name: "Launch & Handover", body: "We deploy, train your team and support you." },
];

export default function PortfolioPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Portfolio" }]}
        eyebrow="Software & systems"
        title="We build systems for your business"
        subtitle="Websites, mobile apps and management systems — designed around how your business works. Explore our work below, then let's build yours."
      />

      {/* Capabilities */}
      <section className="container-page py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {capabilities.map((c) => (
            <div key={c.title} className="rounded-card border border-ink-600/10 bg-white p-6 shadow-sm transition hover:shadow-md">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon name={c.icon} size={24} />
              </span>
              <h3 className="mt-4 text-lg font-extrabold text-ink-900">{c.title}</h3>
              <p className="mt-1.5 text-sm text-ink-700/70">{c.body}</p>
              <ul className="mt-3 space-y-1.5">
                {c.points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-ink-700/80">
                    <Icon name="verified" size={15} className="shrink-0 text-brand-500" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Recent work */}
      <section className="container-page pb-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-ink-900">Recent work</h2>
            <p className="mt-1 text-sm text-ink-700/60">A selection of projects we&apos;ve delivered. Open any project for details and screenshots.</p>
          </div>
        </div>
        <PortfolioGrid />
      </section>

      {/* How we work */}
      <section className="bg-ink-50/60 py-14">
        <div className="container-page">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-600">How we work</p>
            <h2 className="mt-2 text-2xl font-extrabold text-ink-900">From idea to launch in 5 clear steps</h2>
          </div>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {process.map((s) => (
              <li key={s.n} className="relative rounded-card border border-ink-600/10 bg-white p-5 shadow-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-extrabold text-white">
                  {s.n}
                </span>
                <p className="mt-3 font-extrabold text-ink-900">{s.name}</p>
                <p className="mt-1 text-sm text-ink-700/70">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-page py-14">
        <div className="bg-brand-gradient overflow-hidden rounded-card px-8 py-12 text-center text-white">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Have a system in mind? Let&apos;s build it.</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Tell us what your business needs and we&apos;ll design a solution that fits — with a clear quote and timeline.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/request"
              className="rounded-lg bg-white px-6 py-3 text-sm font-bold text-brand-600 transition hover:bg-white/90"
            >
              Start a project
            </Link>
            <a
              href={whatsappLink("Hello Online Tech Uganda! I'd like to discuss building a system/app/website for my business.")}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/40 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
