import type { Metadata } from "next";
import Link from "next/link";
import {
  Code2,
  Smartphone,
  Globe,
  ShoppingCart,
  GraduationCap,
  Database,
  Check,
  MessageCircle,
  Mail,
  Phone,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { StoryRail } from "@/components/home-sections";
import { SERVICE_FROM } from "@/lib/service-prices";
import { ExploreMore } from "@/components/explore-more";
import { ServicesGrid } from "@/components/services-grid";
import { caseStudies } from "@/lib/portfolio";
import { SafeImage } from "@/components/safe-image";
import { site, ugx, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Software & Website Development in Uganda",
  description:
    "Custom software, mobile apps, websites, online shops and management systems built in Kampala, with Mobile Money, hosting and support. Get a quote.",
  alternates: { canonical: "/development" },
  openGraph: {
    title: "Software & Website Development in Uganda",
    description:
      "Custom software, mobile apps, websites, online shops and management systems built in Kampala — with Mobile Money integration and support after launch.",
    url: "/development",
    type: "website",
  },
};

const WHAT_WE_BUILD = [
  {
    icon: Code2,
    title: "Custom Software & Systems",
    body: "Systems built around how your business actually works — POS, inventory, HR, payroll, membership, records and reporting.",
    examples: ["Point of sale & stock", "SACCO / membership systems", "HR & payroll", "Records & reporting"],
    from: SERVICE_FROM.managementSystem,
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    body: "Android and iOS apps for ordering, delivery, payments, bookings and field work — built to run on the phones your customers actually have.",
    examples: ["Ordering & delivery apps", "Payment & wallet apps", "Booking systems", "Field data collection"],
    from: SERVICE_FROM.mobileApp,
  },
  {
    icon: Globe,
    title: "Websites",
    body: "Business websites, portfolios, NGO and school sites — fast on mobile data, easy for you to update, and built to be found on Google.",
    examples: ["Business & corporate sites", "Portfolios & profiles", "NGO & church sites", "Landing pages"],
    from: SERVICE_FROM.website,
  },
  {
    icon: ShoppingCart,
    title: "E-commerce Shops",
    body: "Online shops that take real payments — MTN Mobile Money, Airtel Money and card — with stock, orders and delivery handled properly.",
    examples: ["Online shops", "Mobile Money checkout", "Stock & order management", "Delivery tracking"],
    from: SERVICE_FROM.ecommerce,
  },
  {
    icon: Database,
    title: "Management Systems",
    body: "School management, clinic records, church membership, property and fleet systems — the software institutions here are usually still doing on paper.",
    examples: ["School management", "Clinic & patient records", "Church membership", "Property & fleet"],
    from: SERVICE_FROM.managementSystem,
  },
  {
    icon: GraduationCap,
    title: "Student Final-Year Projects",
    body: "Working systems for your final-year project, built with you so you can defend every part of it — plus documentation and a walkthrough.",
    examples: ["Working system", "Documentation", "Code walkthrough", "Defence preparation"],
    from: SERVICE_FROM.studentProject,
  },
];

const PROCESS = [
  { n: 1, title: "Tell us what you need", body: "A call or WhatsApp chat. Explain the problem — you don't need technical words." },
  { n: 2, title: "We scope and quote", body: "A written scope and a fixed price, so you know exactly what you're paying for." },
  { n: 3, title: "We build, you see progress", body: "You review working versions as we go, not a surprise at the end." },
  { n: 4, title: "Launch and support", body: "We deploy it, train your team, and stay available after launch." },
];

const WHY = [
  "Fixed written quote — no moving prices",
  "MTN MoMo & Airtel Money integration",
  "Built to work on slow connections",
  "You own the code and the accounts",
  "Training for your team included",
  "Support after launch, not a handover and silence",
];

export default function DevelopmentPage() {
  const quote = whatsappLink(
    [
      "Hi Online Tech Uganda, I'd like a quote for a software project.",
      "",
      "What I need:",
      "Who it's for:",
      "Rough budget:",
      "When I need it:",
    ].join(String.fromCharCode(10)),
  );

  return (
    <>
      {/* ── Banner: a photograph across the page, the words centred over it,
          as the finer home stores open each of their departments. ── */}
      <section className="relative overflow-hidden bg-ink-900 text-white">
        <Image src="/hero/hero-6.webp" alt="Software being built at Online Tech Uganda" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-ink-900/60" />
        <div className="container-page relative py-5 sm:py-8">
          <Breadcrumbs items={[{ label: "Software" }]} light />
          <div className="mx-auto max-w-3xl py-10 text-center sm:py-16">
            <p className="font-display text-[19px] italic text-brand-200 sm:text-[24px]">Built in Kampala, for how business works here</p>
            <h1 className="mt-2 font-display text-[36px] uppercase leading-[1.05] sm:text-[56px]">Software &amp; Websites</h1>
            <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed text-white/90 sm:text-[18px]">
              Custom systems, mobile apps, websites and online shops — with Mobile Money, pages that load on a slow
              connection, and people here afterwards when you need a change.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <a href={quote} target="_blank" rel="noreferrer" className="bg-white px-7 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-900 transition hover:bg-brand-500 hover:text-white">
                Get a free quote
              </a>
              <Link href="/portfolio" className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white underline underline-offset-4 hover:text-brand-200">
                See our work
              </Link>
            </div>
            <div className="mx-auto mt-8 grid max-w-xl gap-2 text-left sm:grid-cols-2">
              {WHY.slice(0, 4).map((w) => (
                <p key={w} className="flex items-center gap-2 text-[14px] text-white/90">
                  <Check size={16} className="shrink-0 text-green-400" />
                  {w}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── What we build ── */}
      <section className="container-page pt-14">
        <h2 className="text-[28px] leading-tight text-ink-900 sm:text-[34px]">What we build</h2>
        <p className="mt-1 text-sm text-ink-700/65">
          Starting prices below. Final cost depends on what the system has to do — we quote in
          writing before any work begins.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {WHAT_WE_BUILD.map((s) => (
            <div
              key={s.title}
              className="flex flex-col rounded-card border border-ink-600/10 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <s.icon size={22} />
              </span>
              <h3 className="mt-3 font-extrabold text-ink-900">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-700/70">{s.body}</p>

              <ul className="mt-3 space-y-1">
                {s.examples.map((e) => (
                  <li key={e} className="flex items-start gap-1.5 text-[12.5px] text-ink-700/75">
                    <Check size={13} className="mt-0.5 shrink-0 text-green-600" />
                    {e}
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex items-end justify-between pt-4">
                <span>
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-ink-700/45">
                    From
                  </span>
                  <span className="text-lg font-extrabold text-brand-600">{ugx(s.from)}</span>
                </span>
                <a
                  href={whatsappLink(`Hi, I'd like a quote for: ${s.title}.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="press rounded-md bg-brand-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-600"
                >
                  Get a quote
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Everything else we do ── */}
      {/* The services panel from the home page. A client who came for a
          website often needs the machines, the network and the support that
          go with it, and this is where they are deciding who to hire. */}
      <div className="pt-10">
        <ServicesGrid />
      </div>

      {/* ── Recent work, as a rail of tall photographs ── */}
      {caseStudies().length > 0 && (
        <section className="container-page pt-14">
          <StoryRail
            title="Work We've Delivered"
            sub="Shops, systems and sites running for real businesses."
            href="/portfolio"
            cta="View all"
            more="See the work"
            tiles={caseStudies().map((w) => ({
              href: `/portfolio/${w.slug}`,
              img: w.shots?.[0] ?? `/portfolio/${w.slug}.webp`,
              title: w.title,
              meta: `${w.category} · ${w.year}`,
              line: w.summary,
            }))}
          />
        </section>
      )}

      {/* ── Process ── */}
      <section className="container-page pt-14">
        <h2 className="text-[28px] leading-tight text-ink-900 sm:text-[34px]">How we work</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((s) => (
            <div
              key={s.n}
              className="relative rounded-card border border-ink-600/10 bg-white p-5 shadow-sm"
            >
              <span className="absolute right-4 top-3 text-4xl font-black text-ink-600/[0.07]">
                {s.n}
              </span>
              <p className="font-bold text-ink-900">{s.title}</p>
              <p className="mt-1 text-sm text-ink-700/70">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Students ── */}
      <section className="container-page pt-14">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-green-300 bg-green-50 p-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              <GraduationCap size={13} /> For students
            </span>
            <h2 className="mt-2 text-xl font-extrabold text-ink-900">
              Final-year project giving you trouble?
            </h2>
            <p className="mt-1 text-sm text-ink-700/75">
              We build the working system with you and walk you through the code, so you can
              explain and defend every part of it. Documentation included. We won&apos;t hand you
              something you can&apos;t account for in a viva.
            </p>
          </div>
          <a
            href={whatsappLink("Hi, I need help with my final-year project. Here's the topic:")}
            target="_blank"
            rel="noreferrer"
            className="press shrink-0 rounded-md bg-green-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-700"
          >
            Talk to us
          </a>
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="container-page py-10">
        <div className="rounded-card bg-ink-700 p-6 text-center text-white sm:p-9">
          <h2 className="text-2xl font-extrabold">Tell us what you want built</h2>
          <p className="mx-auto mt-2 max-w-xl text-white/85">
            Describe the problem in your own words. We&apos;ll tell you honestly whether software
            is the right answer, what it would take, and what it would cost — before you commit to
            anything.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <a
              href={quote}
              target="_blank"
              rel="noreferrer"
              className="press inline-flex items-center gap-2 rounded-md bg-green-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-700"
            >
              <MessageCircle size={16} /> WhatsApp us
            </a>
            <a
              href={`mailto:${site.email}?subject=${encodeURIComponent("Software project enquiry")}`}
              className="press inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-bold text-ink-900 transition hover:bg-white/90"
            >
              <Mail size={16} /> Email us
            </a>
            <a
              href={`tel:${site.phoneDisplay.replace(/\s/g, "")}`}
              className="press inline-flex items-center gap-2 rounded-md border border-white/25 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              <Phone size={16} /> {site.phoneDisplay}
            </a>
          </div>

          <p className="mt-5 text-sm text-white/70">
            Need paperwork before you can commit?{" "}
            <Link href="/invoice" className="font-bold text-white underline underline-offset-2">
              Request a quotation or proforma invoice
            </Link>
            .
          </p>
        </div>
      </section>

      <ExploreMore exclude={["/services"]} />
    </>
  );
}
