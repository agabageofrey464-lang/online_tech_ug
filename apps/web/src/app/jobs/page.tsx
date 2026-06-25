import type { Metadata } from "next";
import { MapPin, Briefcase, Check } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { jobs } from "@/lib/jobs";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Jobs & Internships",
  description:
    "IT jobs, internships and other openings at Online Tech Uganda. Apply for software, IT support, sales, design and marketing roles.",
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const typeTone: Record<string, string> = {
  "Full-time": "bg-green-100 text-green-700",
  Internship: "bg-blue-100 text-blue-700",
  "Part-time": "bg-yellow-100 text-yellow-700",
  Contract: "bg-purple-100 text-purple-700",
};

export default function JobsPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Jobs" }]}
        eyebrow="Careers"
        title="Jobs & Internships"
        subtitle="Join Online Tech Uganda — or find IT jobs and internships. Apply directly on WhatsApp or by email."
      />
      <section className="container-page py-12">
        <p className="mb-6 text-sm text-ink-700/60">{jobs.length} open positions</p>
        <div className="space-y-4">
          {jobs.map((j) => (
            <div key={j.id} className="rounded-card border border-ink-600/10 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-extrabold text-ink-600">{j.title}</h2>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${typeTone[j.type]}`}>
                      {j.type}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-700/60">
                    <span className="flex items-center gap-1"><Briefcase size={13} /> {j.category}</span>
                    <span className="flex items-center gap-1"><MapPin size={13} /> {j.location}</span>
                    <span>{j.openings} opening(s)</span>
                    <span>Posted {fmt(j.postedAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={whatsappLink(`Hi, I'd like to apply for the "${j.title}" position at Online Tech Uganda.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600"
                  >
                    Apply
                  </a>
                  <a
                    href={`mailto:${site.email}?subject=${encodeURIComponent("Application: " + j.title)}`}
                    className="rounded-md border border-ink-600/20 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50"
                  >
                    Email CV
                  </a>
                </div>
              </div>
              <p className="mt-3 text-sm text-ink-700/75">{j.summary}</p>
              <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {j.requirements.map((r) => (
                  <li key={r} className="flex items-center gap-2 text-sm text-ink-700/80">
                    <Check size={15} className="shrink-0 text-brand-500" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-card bg-ink-700 p-6 text-center text-white">
          <p className="font-bold">Don&apos;t see a role that fits?</p>
          <p className="mt-1 text-sm text-white/80">Send us your CV — we&apos;re always looking for talent.</p>
          <a
            href={whatsappLink("Hi, I'd like to send my CV for future opportunities.")}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
          >
            Send your CV
          </a>
        </div>
      </section>
    </>
  );
}
