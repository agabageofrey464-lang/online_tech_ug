import type { Metadata } from "next";
import { ContactOptions } from "@/components/contact-options";
import Image from "next/image";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ExploreMore } from "@/components/explore-more";
import { Button } from "@/components/ui";
import { Icon } from "@/components/icon";
import { services } from "@/lib/data";
import { fallbackImage } from "@/lib/image-fallback";
import Link from "next/link";
import { ugx, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services — Web, Apps, Software, Repairs & Networking",
  description:
    "Website & mobile app development, custom software systems, computer repairs, IT support and networking services in Uganda.",
};

const process = [
  { step: "1", title: "Talk to us", text: "Share your goals on WhatsApp, phone or our contact form." },
  { step: "2", title: "Get a quote", text: "We propose a clear scope, timeline and price." },
  { step: "3", title: "We build", text: "Regular updates while we design, build and test." },
  { step: "4", title: "Launch & support", text: "We deliver, train you, and keep supporting you." },
];

// Short "good to know" info shown on each service card.
const SERVICE_INFO: Record<string, string> = {
  "web-development":
    "Most websites delivered in 2–4 weeks. Includes mobile-friendly design, SEO basics, and 1 month free support.",
  "mobile-apps":
    "Cross-platform Android & iOS apps, published to Google Play and the App Store, with payment & notification integration.",
  "software-systems":
    "Custom systems (School, POS, Inventory, SACCO) built around your workflow — with staff training and support plans.",
  "repairs-support":
    "Free diagnosis. Most repairs (screens, batteries, RAM/SSD upgrades, OS installs) done same-day, onsite or remote.",
  networking:
    "Free site survey, then Wi-Fi, office LAN/cabling, CCTV and network security for homes, offices and schools.",
  "digital-learning":
    "We build full e-learning platforms (LMS) with video, certificates and payments — and run our own academy.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Services" }]}
        eyebrow="Services"
        title="Your full technology team"
        subtitle="From your first website to a custom business system — we design, build, repair and support."
      />

      <section className="container-page py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          {services.map((s) => (
            <div
              key={s.slug}
              id={s.slug}
              className="overflow-hidden rounded-card border border-ink-600/10 bg-white shadow-sm transition hover:shadow-md"
            >
              {/* Service photo banner (communicates the service) */}
              <div className="relative h-44 w-full overflow-hidden bg-ink-50">
                <Image
                  src={s.image ?? fallbackImage(s.title)}
                  alt={s.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/55 via-ink-900/10 to-transparent" />
                <span className="absolute bottom-3 left-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-600 shadow-md">
                  <Icon name={s.icon} size={26} />
                </span>
                {s.startingFrom && (
                  <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-brand-700 shadow-sm">
                    From {ugx(s.startingFrom)}
                  </span>
                )}
              </div>

              <div className="p-7 pt-5">
              <h2 className="text-xl font-extrabold text-ink-600">{s.title}</h2>
              <p className="mt-2 text-ink-700/75">{s.summary}</p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-ink-700/80">
                    <Check size={16} className="shrink-0 text-brand-500" /> {b}
                  </li>
                ))}
              </ul>
              {SERVICE_INFO[s.slug] && (
                <p className="mt-4 flex items-start gap-2 rounded-lg bg-brand-50 p-3 text-sm text-ink-700">
                  <Icon name="verified" size={16} className="mt-0.5 shrink-0 text-brand-600" />
                  {SERVICE_INFO[s.slug]}
                </p>
              )}
              <div className="mt-6">
                <Button
                  href={whatsappLink(`Hi, I'm interested in your ${s.title} service.`)}
                  external
                  variant="primary"
                >
                  Request a quote
                </Button>
              </div>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/pricing"
          className="mt-10 flex items-center justify-between gap-3 rounded-card border border-ink-600/10 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <div>
            <p className="text-sm font-extrabold text-ink-900">See service pricing & plans</p>
            <p className="text-xs text-ink-700/60">Websites, apps & software — clear pricing, all in one place.</p>
          </div>
          <span className="shrink-0 rounded-full bg-brand-500 px-4 py-2 text-xs font-bold text-white">View pricing →</span>
        </Link>
      </section>

      <section className="bg-ink-50/60 py-16">
        <div className="container-page">
          <h2 className="text-center text-2xl font-extrabold text-ink-600 sm:text-3xl">How we work</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((p) => (
              <div key={p.step} className="rounded-card bg-white p-6 shadow-sm">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 font-extrabold text-white">
                  {p.step}
                </span>
                <h3 className="mt-4 font-bold text-ink-600">{p.title}</h3>
                <p className="mt-1 text-sm text-ink-700/70">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ExploreMore exclude={["/services"]} />

      <div className="container-page pb-10">
        <ContactOptions
          subject={"Service enquiry"}
          heading={"Need one of these services?"}
          note={"Tell us what you need and we will advise on the best option and price."}
        />
      </div>

    </>
  );
}
