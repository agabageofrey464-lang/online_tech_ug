import {
  BadgeCheck,
  CalendarDays,
  Check,
  FileCheck2,
  GraduationCap,
  MessageCircle,
  Smartphone,
  Users,
} from "lucide-react";
import { JobApply } from "@/components/job-apply";
import { site, ugx, whatsappLink } from "@/lib/site";

/**
 * Industrial training, with the price on it.
 *
 * A student's first question is what it costs and how long it runs, and the
 * old panel answered neither — they had to apply to find out. The fee and the
 * period now sit in their own card beside the pitch, with what the money
 * covers and how to pay it.
 */

export const INTERNSHIP_FEE = 150_000;
/** The dates this intake actually runs. */
export const INTERNSHIP_START = "1 November";
export const INTERNSHIP_END = "18 December 2026";
export const INTERNSHIP_WINDOW = `${INTERNSHIP_START} – ${INTERNSHIP_END}`;
/**
 * Seven weeks, not two months.
 *
 * 1 November to 18 December is 47 days. The page and the brochure both said
 * "2 months", which overstates it by a fortnight — and a school with a minimum
 * placement length will hold a student to what we printed.
 */
export const INTERNSHIP_WEEKS = 7;
/** This intake runs remotely — nobody is expected at the Kampala office. */
export const INTERNSHIP_MODE = "Online";

const GUARANTEES = [
  { icon: FileCheck2, t: "Acceptance letter", d: "Signed and stamped for your school, usually same week." },
  { icon: BadgeCheck, t: "Assessment forms", d: "Filled in and signed by your supervisor here." },
  { icon: GraduationCap, t: "Completion letter", d: "Issued at the end, on our letterhead." },
  { icon: Users, t: "Real client work", d: "Live tickets with your name on the commit, not filing." },
];

const COVERS = [
  "A supervisor assigned to you, reachable through the whole placement",
  "Daily check-ins, code review and real tickets from the team's board",
  "Every school form signed and stamped, on time",
  "Work you can put in a portfolio and a reference you can use",
  "First look at any job we open after you finish",
];

export function InternshipPanel() {
  const ask = whatsappLink(
    "Hi Online Tech Uganda, I would like to apply for industrial training / internship. " +
      "Please tell me about the intake dates.",
  );

  return (
    <div className="overflow-hidden ring-1 ring-black/5">
      <div className="grid lg:grid-cols-[1.15fr_1fr]">
        {/* ── The pitch ─────────────────────────────────────────── */}
        <div className="relative bg-ink-700 p-6 text-white sm:p-8">
          <span className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/25 blur-3xl" />
          <span
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "repeating-linear-gradient(115deg, #fff 0 3px, transparent 3px 22px)",
            }}
          />

          <div className="relative">
            <span className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-3 py-1 text-[11px] font-black uppercase tracking-wider">
                <GraduationCap size={13} /> Industrial training
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3efe9] px-3 py-1 text-[11px] font-black uppercase tracking-wider text-ink-900">
                {INTERNSHIP_MODE} · {INTERNSHIP_WINDOW}
              </span>
            </span>

            <h2 className="mt-3 text-[26px] leading-tight leading-tight sm:text-[32px]">
              Spend your internship doing the work,
              <br className="hidden sm:block" /> not watching it
            </h2>

            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/85">
              Students come to us from <b>every university and institution in Uganda</b> — Makerere,
              Kyambogo, MUBS, Ndejje, UCU, the technical colleges. It runs <b>entirely online</b>,
              so you can do it from home, from campus or from your home district. You will not be
              sent a reading list: you take real tickets from the same board as the team, and by
              the end you have something to show and people who will vouch for you.
            </p>

            <p className="mt-2.5 max-w-xl text-[13.5px] leading-relaxed text-white/70">
              Most of it is software — websites, systems, databases, the apps we are shipping that
              month — with networking, design and digital marketing for anyone whose course points
              that way.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {GUARANTEES.map((g) => (
                <div key={g.t} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] bg-white/10 text-[#f3efe9] ring-1 ring-white/15">
                    <g.icon size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-extrabold">{g.t}</span>
                    <span className="block text-[11.5px] leading-snug text-white/65">{g.d}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── What it costs ─────────────────────────────────────── */}
        <div className="flex flex-col bg-white p-6 sm:p-8">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-ink-700/45">
              Placement fee
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700">
              <CalendarDays size={12} /> {INTERNSHIP_WEEKS} weeks · {INTERNSHIP_WINDOW}
            </span>
          </div>

          <p className="mt-1 font-display text-4xl font-black leading-none text-brand-600 sm:text-5xl">
            {ugx(INTERNSHIP_FEE)}
          </p>
          <p className="mt-1.5 text-[13px] text-ink-700/70">
            One payment for the whole {INTERNSHIP_WEEKS}-week placement. Nothing further to pay.
          </p>

          <ul className="mt-5 space-y-2">
            {COVERS.map((c) => (
              <li key={c} className="flex items-start gap-2 text-[13.5px] text-ink-800">
                <Check size={16} className="mt-0.5 shrink-0 text-green-600" />
                {c}
              </li>
            ))}
          </ul>

          <div className="mt-5 bg-ink-50/70 p-3.5">
            <p className="flex items-center gap-2 text-[12px] font-bold text-ink-900">
              <Smartphone size={14} className="text-brand-500" /> How to pay
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-700/75">
              Mobile Money to <b className="text-ink-900">{site.payment.momo.number}</b> (
              {site.payment.momo.name}). Send the confirmation on WhatsApp and we will start your
              paperwork the same day — there is nowhere to travel to for this intake.
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <JobApply
              jobTitle={`Industrial Training / Internship (${INTERNSHIP_WINDOW})`}
              label="Apply for a place"
              className="press inline-flex flex-1 items-center justify-center gap-2 rounded-[3px] bg-brand-500 px-6 py-3 text-sm font-black text-white transition hover:bg-brand-600"
            />
            <a
              href={ask}
              target="_blank"
              rel="noreferrer"
              className="press inline-flex items-center justify-center gap-2 rounded-[3px] border border-ink-600/20 px-5 py-3 text-sm font-bold text-ink-800 transition hover:bg-ink-50"
            >
              <MessageCircle size={16} /> Ask first
            </a>
          </div>

          <p className="mt-3 text-[11.5px] text-ink-700/55">
            We keep the intake small so everyone gets a supervisor. Apply early and your
            acceptance letter is signed well before your school&apos;s deadline.
          </p>
        </div>
      </div>
    </div>
  );
}
