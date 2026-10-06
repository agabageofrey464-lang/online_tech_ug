import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  Briefcase,
  Building2,
  CalendarDays,
  Code2,
  FileCheck2,
  FileText,
  GraduationCap,
  MonitorSmartphone,
  Network,
  Palette,
  Users,
  Wallet,
  Wifi,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  InternshipPanel,
  INTERNSHIP_FEE,
  INTERNSHIP_WEEKS,
  INTERNSHIP_WINDOW,
} from "@/components/internship-panel";
import { ContactOptions } from "@/components/contact-options";
import { JobApply } from "@/components/job-apply";
import { SafeImage } from "@/components/safe-image";
import { ugx } from "@/lib/site";

export const metadata: Metadata = {
  title: "Industrial Training & Internship in Kampala",
  description:
    `Online industrial training for university students in Uganda — ${ugx(INTERNSHIP_FEE)} for ${INTERNSHIP_WEEKS} weeks, ` +
    `${INTERNSHIP_WINDOW}. ` +
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
    img: "/courses/web-development.webp",
    tone: "bg-brand-500",
    body: "Websites, web apps and business systems in the stack we actually ship with — HTML, CSS, JavaScript, React and Python. You take tickets from the same board as the team.",
    tag: "Most places",
  },
  {
    icon: MonitorSmartphone,
    title: "Systems & Databases",
    img: "/courses/microsoft-access.webp",
    tone: "bg-ink-600",
    body: "School, POS, inventory and SACCO systems: designing tables, writing queries, building the screens a client will use every day.",
    tag: "Software",
  },
  {
    icon: Palette,
    title: "Graphic & Media Design",
    img: "/courses/graphic-design.webp",
    tone: "bg-teal-700",
    body: "Brand work, flyers, social artwork, photo and video editing for real campaigns that go out under a client's name.",
    tag: "Creative",
  },
  {
    icon: Network,
    title: "Networking & IT Support",
    img: "/courses/computer-networking.webp",
    tone: "bg-green-700",
    body: "Network design, configuration and troubleshooting, plus remote support for users — practised on simulators and live systems.",
    tag: "Networking",
  },
  {
    icon: Wrench,
    title: "Technical Writing & Support",
    img: "/courses/microsoft-word.webp",
    tone: "bg-ink-700",
    body: "Documentation, user guides and handling real support queries — the part of every IT job nobody trains you for.",
    tag: "Support",
  },
  {
    icon: Briefcase,
    title: "Digital Marketing",
    img: "/courses/digital-marketing.webp",
    tone: "bg-brand-600",
    body: "Running social accounts and paid campaigns, writing the content, and reading what the numbers actually say.",
    tag: "Creative",
  },
];

/** The four facts a student checks before reading anything else. */
const FACTS = [
  { icon: Wallet, value: ugx(INTERNSHIP_FEE), label: "One payment, whole placement" },
  { icon: CalendarDays, value: `${INTERNSHIP_WEEKS} weeks`, label: INTERNSHIP_WINDOW },
  { icon: Wifi, value: "100% online", label: "From home, campus or upcountry" },
  { icon: FileCheck2, value: "All letters", label: "Acceptance, assessment, completion" },
];

const UNIVERSITIES = ["Makerere", "Kyambogo", "MUBS", "UCU", "Ndejje", "Bugema", "Mbarara", "Gulu", "Nkumba", "KIU"];

const STEP_TONES = ["bg-brand-500", "bg-ink-600", "bg-teal-700", "bg-green-700"];

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
    body: "Work with the team on real jobs, online. At the end we complete your assessment forms and issue a completion letter.",
  },
];

const FAQS = [
  {
    q: "Which universities do you take?",
    a: "All of them. Makerere, Kyambogo, MUBS, UCU, Ndejje, Bugema, Mbarara, Gulu, and every technical college and institute — public or private, diploma or degree.",
  },
  {
    q: `Why is there a ${ugx(INTERNSHIP_FEE)} fee?`,
    a: "It pays for a supervisor's time across the placement, the review of your work, and the paperwork your school needs. We keep intakes small so everybody gets properly supervised, and that only works if the placement covers its own cost.",
  },
  {
    q: "Do I need to know how to code already?",
    a: "No. Tell us what you have covered at school and we place you where you will learn fastest. Students arrive at every level, including people who have never written a line.",
  },
  {
    q: "When does it run, and do I have to come to Kampala?",
    a: `This intake runs ${INTERNSHIP_WINDOW} — ${INTERNSHIP_WEEKS} weeks over the recess term — and it is entirely online, so you can do it from home, from campus or from your home district. You need a computer and a working internet connection; nothing else. If your school requires different dates, tell us when you apply and we will work with them.`,
  },
  {
    q: "Will I get a job afterwards?",
    a: "No promises — but when we open a role, the people who trained here are the first we call, and we have hired interns before.",
  },
];

/** A section title with the orange marker and a line of explanation. */
function Heading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="max-w-2xl">
      <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-brand-600">
        <span className="h-4 w-1.5 rounded-full bg-brand-500" />
        {eyebrow}
      </p>
      <h2 className="mt-1.5 font-display text-2xl font-black leading-tight text-ink-900 sm:text-3xl">{title}</h2>
      {children && <p className="mt-2 text-[14.5px] leading-relaxed text-ink-700/75">{children}</p>}
    </div>
  );
}

export default function InternshipPage() {
  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Industrial Training & Internship"
        subtitle={`${ugx(INTERNSHIP_FEE)} · online · ${INTERNSHIP_WINDOW}. Software, IT and design, on real client work.`}
        crumbs={[{ label: "Internship" }]}
      />

      <section className="container-page pt-8 sm:pt-10">
        <InternshipPanel />
      </section>

      {/* ── The four facts ─────────────────────────────────────── */}
      {/* What it costs, how long, where and what paperwork: the questions a
          student has before any other, answered in four tiles they can read
          from across a room rather than found in a paragraph. */}
      <section className="container-page pt-4">
        <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {FACTS.map((f) => (
            <li key={f.value} className="flex items-center gap-3 rounded-xl bg-white p-3.5 shadow-sm ring-1 ring-ink-600/10 sm:p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 sm:h-12 sm:w-12">
                <f.icon size={20} />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-[17px] font-black leading-tight text-ink-900 sm:text-xl">{f.value}</span>
                <span className="block text-[11.5px] leading-snug text-ink-700/65 sm:text-[12.5px]">{f.label}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Every university ───────────────────────────────────── */}
      <section className="container-page pt-4">
        <div className="stripes flex flex-col gap-3 rounded-xl bg-ink-700 px-4 py-4 text-white sm:flex-row sm:items-center sm:gap-5 sm:px-6">
          <p className="flex shrink-0 items-center gap-2 font-display text-base font-black sm:text-lg">
            <GraduationCap size={20} className="text-[#FCDC04]" />
            Students from every university
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {UNIVERSITIES.map((u) => (
              <li key={u} className="rounded-full bg-white/10 px-2.5 py-1 text-[11.5px] font-bold ring-1 ring-white/20">
                {u}
              </li>
            ))}
            <li className="rounded-full bg-[#FCDC04] px-2.5 py-1 text-[11.5px] font-black text-ink-900">
              + every college &amp; institute
            </li>
          </ul>
        </div>
      </section>

      {/* ── Where you can be placed ────────────────────────────── */}
      <section className="container-page pt-12 sm:pt-14">
        <Heading eyebrow="Placements" title="Where you can be placed">
          Most of our work is software, so most placements are too. Everything here is supervised
          online. Tell us what interests you when you apply — places in each area are limited.
        </Heading>

        {/* A photograph for each, because six paragraphs under six small icons
            all looked like the same placement. On a phone the picture sits to
            the side so six cards do not become six screens. */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {AREAS.map((a) => (
            <article
              key={a.title}
              className="card-lift group flex overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-ink-600/10 sm:flex-col"
            >
              <div className="relative w-28 shrink-0 overflow-hidden sm:h-36 sm:w-full">
                <SafeImage
                  src={a.img}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 112px, (max-width: 1024px) 50vw, 33vw"
                  className="card-zoom object-cover"
                />
                <span className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-ink-900/55 to-transparent sm:block" />
                <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wide text-white shadow-sm sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10.5px] ${a.tone}`}>
                  {a.tag}
                </span>
                <span className="absolute bottom-3 left-3 hidden h-10 w-10 items-center justify-center rounded-full bg-white text-brand-600 shadow-md sm:flex">
                  <a.icon size={19} />
                </span>
              </div>
              <div className="min-w-0 flex-1 p-3.5 sm:p-4">
                <h3 className="font-display text-[16px] font-black leading-snug text-ink-900 sm:text-lg">{a.title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-700/75 sm:text-[13.5px]">{a.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section className="container-page pt-12 sm:pt-14">
        <Heading eyebrow="Four steps" title="How it works" />
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-ink-600/10">
              {/* The step number, as a tile — the same device the intake
                  cards use for a date. */}
              <div className={`flex w-16 shrink-0 flex-col items-center justify-center gap-1 text-white ${STEP_TONES[i % STEP_TONES.length]}`}>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">Step</span>
                <span className="font-display text-4xl font-black leading-none">{i + 1}</span>
              </div>
              <div className="min-w-0 flex-1 p-3.5 sm:p-4">
                <s.icon size={18} className="text-brand-600" />
                <h3 className="mt-1.5 font-display text-[16px] font-black leading-snug text-ink-900">{s.title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-700/75">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Questions students actually ask ────────────────────── */}
      <section className="container-page pt-12 sm:pt-14">
        <div className="grid gap-5 lg:grid-cols-[20rem_1fr] lg:gap-10">
          <Heading eyebrow="Before you apply" title="Questions students ask">
            Straight answers. If yours is not here, ask us on WhatsApp before you pay anything.
          </Heading>
          <div className="space-y-2.5">
            {FAQS.map((f, i) => (
              <details
                key={f.q}
                open={i === 0}
                className="group rounded-xl bg-white shadow-sm ring-1 ring-ink-600/10 open:ring-brand-300"
              >
                <summary className="cursor-pointer list-none p-4 text-[15px] font-bold text-ink-900 marker:hidden sm:text-base">
                  <span className="flex items-center justify-between gap-3">
                    {f.q}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-lg font-black leading-none text-brand-600 transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="px-4 pb-4 text-[14px] leading-relaxed text-ink-700/80">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Apply ──────────────────────────────────────────────── */}
      {/* The apply button was only at the top. Someone who has read the
          placements, the steps and the answers has decided, and should not
          have to scroll back up to act on it. */}
      <section className="container-page pt-12 sm:pt-14">
        <div className="stripes flex flex-col gap-4 rounded-xl bg-brand-600 px-5 py-6 text-white shadow-sm sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">{INTERNSHIP_WINDOW}</p>
            <h2 className="mt-1 font-display text-2xl font-black leading-tight sm:text-3xl">
              Places are limited. <span className="text-[#FCDC04]">Apply this week.</span>
            </h2>
            <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-white/90">
              {ugx(INTERNSHIP_FEE)} for the whole {INTERNSHIP_WEEKS}-week placement. Apply early and your
              acceptance letter is signed well before your school&apos;s deadline.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <JobApply
              jobTitle={`Industrial Training / Internship (${INTERNSHIP_WINDOW})`}
              label="Apply for a place"
              className="press inline-flex items-center justify-center rounded-full bg-[#FCDC04] px-7 py-3 text-sm font-black text-ink-900 shadow-sm transition hover:brightness-105"
            />
            <Link
              href="/jobs"
              className="press inline-flex items-center justify-center rounded-full bg-white/15 px-6 py-3 text-sm font-bold text-white ring-1 ring-white/30 transition hover:bg-white/25"
            >
              Finished studying? View jobs →
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <ContactOptions />
      </section>
    </>
  );
}
