import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui";
import { Icon } from "@/components/icon";
import { stats, whyUs } from "@/lib/data";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Online Tech Uganda Ltd is an integrated technology company — an online computer store, digital agency, software company, online learning platform and IT services provider.",
};

const departments = [
  {
    name: "Shop Department",
    items: ["Computers", "Accessories"],
    icon: "package",
  },
  {
    name: "Services Department",
    items: ["Websites", "Mobile Apps", "Software Systems", "Repairs"],
    icon: "software",
  },
  {
    name: "Learning Department",
    items: ["Video Courses", "Notes", "Certificates"],
    icon: "learn",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "About" }]}
        eyebrow="About"
        title="One brand. Your complete tech partner."
        subtitle="We bring computers, software, learning and support together under one integrated system — built for Uganda."
      />

      {/* Mission / vision */}
      <section className="container-page py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-card border border-ink-600/10 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-ink-600">Our mission</h2>
            <p className="mt-3 text-ink-700/75">
              To make quality technology and digital skills affordable and accessible to every
              Ugandan — selling reliable computers, building world-class software, and teaching the
              skills people need to thrive in a digital world.
            </p>
          </div>
          <div className="rounded-card border border-ink-600/10 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-ink-600">Our vision</h2>
            <p className="mt-3 text-ink-700/75">
              To become Uganda&apos;s leading integrated technology company — an online computer store,
              a digital agency, a software company, an online learning platform and an IT services
              company, all under one trusted brand.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-2 gap-6 rounded-card bg-ink-600 p-8 text-white sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-extrabold">{s.value}</p>
              <p className="mt-1 text-sm text-white/70">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Structure */}
      <section className="bg-ink-50/60 py-16">
        <div className="container-page">
          <h2 className="text-center text-2xl font-extrabold text-ink-600 sm:text-3xl">
            How we&apos;re organized
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {departments.map((d) => (
              <div key={d.name} className="rounded-card bg-white p-7 shadow-sm">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Icon name={d.icon} size={28} />
                </span>
                <h3 className="mt-3 font-extrabold text-ink-600">{d.name}</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-ink-700/75">
                  {d.items.map((i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-brand-500">•</span> {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="container-page py-16">
        <h2 className="text-2xl font-extrabold text-ink-600 sm:text-3xl">Leadership</h2>
        <div className="mt-8 max-w-2xl rounded-card border border-ink-600/10 bg-white p-7 shadow-sm">
          <div className="flex items-center gap-5">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-ink-700 text-2xl font-extrabold text-white">
              {site.ceo.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
            <div>
              <h3 className="text-lg font-extrabold text-ink-600">{site.ceo.name}</h3>
              <p className="text-sm font-semibold text-brand-600">{site.ceo.title}</p>
              <a href={`mailto:${site.ceo.email}`} className="text-sm text-ink-700/70 hover:text-brand-600">
                {site.ceo.email}
              </a>
            </div>
          </div>
          <p className="mt-5 text-ink-700/75">
            Leading Online Tech Uganda with a mission to make quality technology and digital skills
            affordable and accessible to every Ugandan — from your first laptop to your first website,
            and the skills to use them with confidence.
          </p>
        </div>
      </section>

      {/* Why us */}
      <section className="container-page py-16">
        <h2 className="text-2xl font-extrabold text-ink-600 sm:text-3xl">Why choose Online Tech Uganda</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((w) => (
            <div key={w.title} className="rounded-card border border-ink-600/10 bg-white p-6 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Icon name={w.icon} size={24} />
              </span>
              <h3 className="mt-3 font-bold text-ink-600">{w.title}</h3>
              <p className="mt-1 text-sm text-ink-700/70">{w.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Button href="/contact" variant="primary">
            Work with us →
          </Button>
        </div>
      </section>
    </>
  );
}
