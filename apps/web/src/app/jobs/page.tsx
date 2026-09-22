import type { Metadata } from "next";
import {
  MapPin,
  Briefcase,
  Check,
  Mail,
  MessageCircle,
  GraduationCap,
  FileText,
  Users,
  Building2,
  CalendarClock,
  Award,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ExploreMore } from "@/components/explore-more";
import { JobApply } from "@/components/job-apply";
import { jobs as seedJobs } from "@/lib/jobs";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Internships & Jobs",
  description:
    "Industrial training and internship placements in Kampala for university students — web development, graphic design, IT support, networking and more. Acceptance and completion letters provided. Plus IT jobs at Online Tech Uganda.",
  alternates: { canonical: "/jobs" },
};

// Always fetch fresh so newly posted jobs appear immediately.
export const revalidate = 300; // ISR: rebuild every 5 min instead of on every request

type JobItem = {
  id: string | number;
  title: string;
  type: string;
  category: string;
  location: string;
  summary: string;
  requirements: string[];
  openings: number;
};

async function getJobs(): Promise<JobItem[]> {
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${API}/api/v1/jobs`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) return data;
    }
  } catch {
    /* fall through to seed */
  }
  return seedJobs as unknown as JobItem[];
}

const typeTone: Record<string, string> = {
  "Full-time": "bg-green-100 text-green-700",
  Internship: "bg-blue-100 text-blue-700",
  "Part-time": "bg-yellow-100 text-yellow-700",
  Contract: "bg-purple-100 text-purple-700",
};

/** Placement areas we actually supervise. */
const AREAS = [
  { icon: "💻", title: "Web Development", body: "HTML, CSS, JavaScript and real client websites." },
  { icon: "🎨", title: "Graphic Design", body: "Flyers, branding and social media artwork." },
  { icon: "🖧", title: "IT Support & Networking", body: "Setup, cabling, troubleshooting and user support." },
  { icon: "🔧", title: "Computer Repair", body: "Diagnosis, upgrades and hardware maintenance." },
  { icon: "📣", title: "Digital Marketing", body: "Social media, content and running campaigns." },
  { icon: "🎬", title: "Video & Photo Editing", body: "Shooting, editing and producing media." },
];

const STEPS = [
  {
    icon: FileText,
    title: "Send your request",
    body: "WhatsApp or email us your name, university, programme, registration number and the dates your school requires.",
  },
  {
    icon: Users,
    title: "We review and confirm",
    body: "We check availability in your area of interest and confirm a place, usually within a few days.",
  },
  {
    icon: Building2,
    title: "Get your acceptance letter",
    body: "We issue a signed and stamped acceptance letter addressed to your Academic Registrar, for your school's records.",
  },
  {
    icon: Award,
    title: "Train, then get certified",
    body: "Work with our team on real jobs. At the end we complete your assessment forms and issue a completion letter.",
  },
];

export default async function JobsPage() {
  const jobs = await getJobs();
  const internships = jobs.filter((j) => j.type === "Internship");
  const roles = jobs.filter((j) => j.type !== "Internship");

  // Pre-filled with exactly what we need, so a student does not have to guess.
  const applyLink = whatsappLink(
    [
      "Hi Online Tech Uganda, I would like to apply for industrial training / internship.",
      "",
      "Name:",
      "University:",
      "Programme:",
      "Registration No.:",
      "Area of interest:",
      "Start date:",
      "End date:",
    ].join(String.fromCharCode(10)),
  );

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Internships & Jobs" }]}
        eyebrow="Careers"
        title="Internships & Jobs"
        subtitle="Industrial training for university students, and openings at Online Tech Uganda."
      />

      {/* ── Internship programme ───────────────────────────────── */}
      <section className="container-page pt-10">
        <div className="relative overflow-hidden rounded-card bg-ink-700 p-6 text-white sm:p-9">
          <span className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
              <GraduationCap size={13} /> Industrial training
            </span>
            <h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">
              Do your internship with a working IT company
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/85">
              We take students from <b>any university or institution</b> in Uganda for industrial
              training. You won&apos;t be making tea — you&apos;ll sit with our team and work on
              real client jobs, supervised, with your school&apos;s paperwork properly handled.
            </p>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {[
                "Signed & stamped acceptance letter",
                "Assessment forms completed",
                "Completion letter at the end",
                "Real client work, not filing",
              ].map((x) => (
                <p key={x} className="flex items-center gap-2 text-sm text-white/90">
                  <Check size={16} className="shrink-0 text-green-400" />
                  {x}
                </p>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <a
                href={applyLink}
                target="_blank"
                rel="noreferrer"
                className="press inline-flex items-center gap-2 rounded-md bg-green-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-700"
              >
                <MessageCircle size={16} /> Apply on WhatsApp
              </a>
              <a
                href={`mailto:${site.email}?subject=${encodeURIComponent("Internship / Industrial Training Application")}`}
                className="press inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-bold text-ink-900 transition hover:bg-white/90"
              >
                <Mail size={16} /> Apply by email
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Placement areas ────────────────────────────────────── */}
      <section className="container-page pt-8">
        <h2 className="text-lg font-extrabold text-ink-900">Where you can be placed</h2>
        <p className="mt-1 text-sm text-ink-700/65">
          Tell us which area interests you — placements depend on availability.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((a) => (
            <div key={a.title} className="rounded-card border border-ink-600/10 bg-white p-4 shadow-sm">
              <span className="text-2xl" aria-hidden>
                {a.icon}
              </span>
              <p className="mt-1.5 font-bold text-ink-900">{a.title}</p>
              <p className="text-sm text-ink-700/70">{a.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section className="container-page pt-8">
        <h2 className="text-lg font-extrabold text-ink-900">How it works</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative rounded-card border border-ink-600/10 bg-white p-5 shadow-sm">
              <span className="absolute right-4 top-3 text-4xl font-black text-ink-600/[0.07]">
                {i + 1}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <s.icon size={19} />
              </span>
              <p className="mt-2.5 font-bold text-ink-900">{s.title}</p>
              <p className="mt-1 text-sm text-ink-700/70">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-card border border-brand-200 bg-brand-50 p-4">
          <CalendarClock size={20} className="shrink-0 text-brand-600" />
          <p className="text-sm text-ink-700">
            <b className="text-ink-900">Apply early.</b> Recess-term placements fill up fast — send
            your request at least two weeks before your school&apos;s start date.
          </p>
        </div>
      </section>

      {/* ── Open internship posts ──────────────────────────────── */}
      {internships.length > 0 && (
        <section className="container-page pt-10">
          <h2 className="text-lg font-extrabold text-ink-900">Open internship positions</h2>
          <div className="mt-4 space-y-4">
            {internships.map((j) => (
              <JobCard key={j.id} j={j} />
            ))}
          </div>
        </section>
      )}

      {/* ── Jobs ───────────────────────────────────────────────── */}
      <section className="container-page py-10">
        <h2 className="text-lg font-extrabold text-ink-900">
          Open positions{" "}
          <span className="text-sm font-semibold text-ink-700/50">({roles.length})</span>
        </h2>
        <div className="mt-4 space-y-4">
          {roles.map((j) => (
            <JobCard key={j.id} j={j} />
          ))}
        </div>

        <div className="mt-8 rounded-card bg-ink-700 p-6 text-center text-white">
          <p className="font-bold">Don&apos;t see a role that fits?</p>
          <p className="mt-1 text-sm text-white/80">
            Send us your CV — we&apos;re always looking for talent.
          </p>
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

function JobCard({ j }: { j: JobItem }) {
  return (
    <div className="rounded-card border border-ink-600/10 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-extrabold text-ink-600">{j.title}</h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${typeTone[j.type] ?? "bg-ink-100 text-ink-700"}`}
            >
              {j.type}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-700/60">
            <span className="flex items-center gap-1">
              <Briefcase size={13} /> {j.category}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={13} /> {j.location}
            </span>
            <span>{j.openings} opening(s)</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <JobApply jobId={typeof j.id === "number" ? j.id : undefined} jobTitle={j.title} />
          <a
            href={`mailto:${site.email}?subject=${encodeURIComponent("Application: " + j.title)}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-ink-600/20 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50"
          >
            <Mail size={15} /> Email
          </a>
          <a
            href={whatsappLink(`Hi, I'd like to apply for the "${j.title}" position at Online Tech Uganda.`)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-green-600 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
          >
            <MessageCircle size={15} /> WhatsApp
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
      <ExploreMore exclude={["/jobs"]} />

    </div>
  );
}
