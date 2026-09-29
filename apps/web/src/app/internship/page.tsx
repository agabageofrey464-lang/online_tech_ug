import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  Briefcase,
  Building2,
  Code2,
  FileText,
  GraduationCap,
  MonitorSmartphone,
  Network,
  Palette,
  Users,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { InternshipPanel, INTERNSHIP_FEE, INTERNSHIP_MONTHS } from "@/components/internship-panel";
import { ContactOptions } from "@/components/contact-options";
import { ugx } from "@/lib/site";

export const metadata: Metadata = {
  title: "Industrial Training & Internship in Kampala",
  description:
    `Industrial training for university students in Uganda — ${ugx(INTERNSHIP_FEE)} for ${INTERNSHIP_MONTHS} months. ` +
    "Software development, IT support, networking and design, supervised on real client work. " +
    "Acceptance and completion letters provided for Makerere, Kyambogo, MUBS, UCU, Ndejje and every other institution.",
  alternates: { canonical: "/internship" },
};

export const revalidate = 3600;

/** Where a student can actually be placed, software first. */
const AREAS = [
  {
    icon: Code2,
    title: "Software Development",
    body: "Websites, web apps and business systems in the stack we actually ship with — HTML, CSS, JavaScript, React and Python. You take tickets from the same board as the team.",
    tag: "Most places",
  },
  {
    icon: MonitorSmartphone,
    title: "Systems & Databases",
    body: "School, POS, inventory and SACCO systems: designing tables, writing queries, building the screens a client will use every day.",
    tag: "Software",
  },
  {
    icon: Palette,
    title: "Graphic & Media Design",
    body: "Brand work, flyers, social artwork, photo and video editing for real campaigns that go out under a client's name.",
    tag: "Creative",
  },
  {
    icon: Network,
    title: "Networking & IT Support",
    body: "Wi-Fi and office LAN setup, structured cabling, CCTV, and supporting users who need their problem solved today.",
    tag: "Hardware",
  },
  {
    icon: Wrench,
    title: "Computer Repair",
    body: "Diagnosis, upgrades and board-level maintenance on the machines that come through the shop.",
    tag: "Hardware",
  },
  {
    icon: Briefcase,
    title: "Digital Marketing",
    body: "Running social accounts and paid campaigns, writing the content, and reading what the numbers actually say.",
    tag: "Creative",
  },
];

const STEPS = [
  {
    icon: FileText,
    title: "Send your details",
    body: "Your name, university, programme, registration number and the dates your school requires.",
  },
  {
    icon: Users,
    title: "We confirm a place",
    body: "We check availability in the area you want and come back to you, usually within a few days.",
  },
  {
    icon: Building2,
    title: "Acceptance letter",
    body: "Signed and stamped, addressed to your Academic Registrar, in time for your school's deadline.",
  },
  {
    icon: Award,
    title: "Train, then get certified",
    body: "Work with the team on real jobs. At the end we complete your assessment forms and issue a completion letter.",
  },
];

const FAQS = [
  {
    q: "Which universities do you take?",
    a: "All of them. Makerere, Kyambogo, MUBS, UCU, Ndejje, Bugema, Mbarara, Gulu, and every technical college and institute — public or private, diploma or degree.",
  },
  {
    q: `Why is there a ${ugx(INTERNSHIP_FEE)} fee?`,
    a: "It pays for a supervisor's time, your workstation and internet for the two months, and the paperwork. We keep intakes small so everybody gets properly supervised, and that only works if the placement covers its own cost.",
  },
  {
    q: "Do I need to know how to code already?",
    a: "No. Tell us what you have covered at school and we place you where you will learn fastest. Students arrive at every level, including people who have never written a line.",
  },
  {
    q: "Can I do it during the holiday only?",
    a: `The programme runs ${INTERNSHIP_MONTHS} months, which fits the standard recess term. If your school requires different dates, tell us when you apply and we will work with them.`,
  },
  {
    q: "Will I get a job afterwards?",
    a: "No promises — but when we open a role, the people who trained here are the first we call, and we have hired interns before.",
  },
];

export default function InternshipPage() {
  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Industrial Training & Internship"
        subtitle={`${ugx(INTERNSHIP_FEE)} for ${INTERNSHIP_MONTHS} months — software, IT and design, on real client work.`}
        crumbs={[{ label: "Internship" }]}
      />

      <section className="container-page pt-10">
        <InternshipPanel />
      </section>

      {/* ── Where you can be placed ────────────────────────────── */}
      <section className="container-page pt-12">
        <h2 className="font-display text-xl font-black text-ink-900">Where you can be placed</h2>
        <p className="mt-1 text-sm text-ink-700/65">
          Most of our work is software, so most placements are too. Tell us what interests you when
          you apply — places in each area are limited.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((a) => (
            <div
              key={a.title}
              className="card-lift rounded-xl bg-white p-4 shadow-sm ring-1 ring-ink-600/10"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <a.icon size={19} />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[15px] font-extrabold text-ink-900">{a.title}</h3>
                    <span className="rounded-full bg-ink-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-700/60">
                      {a.tag}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-700/70">{a.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section className="container-page pt-12">
        <h2 className="font-display text-xl font-black text-ink-900">How it works</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-ink-600/10">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-ink-700 text-white">
                <s.icon size={18} />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-black text-white">
                  {i + 1}
                </span>
              </span>
              <h3 className="mt-3 text-[15px] font-extrabold text-ink-900">{s.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-700/70">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Questions students actually ask ────────────────────── */}
      <section className="container-page pt-12">
        <h2 className="font-display text-xl font-black text-ink-900">Questions students ask</h2>
        <div className="mt-4 space-y-2.5">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-xl bg-white p-4 shadow-sm ring-1 ring-ink-600/10"
            >
              <summary className="cursor-pointer list-none text-[15px] font-bold text-ink-900 marker:hidden">
                <span className="flex items-center justify-between gap-3">
                  {f.q}
                  <span className="shrink-0 text-brand-500 transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-700/75">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Also hiring ────────────────────────────────────────── */}
      <section className="container-page pt-12">
        <Link
          href="/jobs"
          className="card-lift flex flex-wrap items-center gap-4 rounded-xl bg-ink-700 p-5 text-white shadow-sm"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#FCDC04] text-ink-900">
            <GraduationCap size={21} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-lg font-black">Finished your studies?</span>
            <span className="block text-[13px] text-white/70">
              See the roles we are hiring for at Online Tech Uganda.
            </span>
          </span>
          <span className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-black">
            View jobs →
          </span>
        </Link>
      </section>

      <section className="container-page py-12">
        <ContactOptions />
      </section>
    </>
  );
}
