"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Clock,
  GraduationCap,
  Laptop2,
  Sparkles,
  Wallet,
} from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import { courses, courseTotal } from "@/lib/data";
import { ugx } from "@/lib/site";

/**
 * Printed-brochure panels for the academy, on the home page.
 *
 * Someone browsing for a laptop will not click through to /learn to discover
 * we teach. These are the pages of a brochure laid flat: what you can study,
 * what it costs, how it runs, and how to start — readable without going
 * anywhere. Everything is drawn in the house palette and typeface rather than
 * as images, so it stays sharp at any size and costs no download.
 */

/** Four routes a student actually picks between, each pointing at real courses. */
const TRACKS = [
  {
    key: "office",
    kicker: "Track 01",
    title: "Office & Computer Skills",
    blurb: "From switching a computer on to running Word, Excel and email with confidence.",
    slugs: ["computer-basics", "microsoft-office", "microsoft-excel", "typing-skills"],
    icon: Laptop2,
    bg: "from-teal-600 to-teal-800",
  },
  {
    key: "creative",
    kicker: "Track 02",
    title: "Design & Creative",
    blurb: "Posters, brands, photographs and video — the work Kampala businesses buy every week.",
    slugs: ["graphic-design", "video-editing", "photography-editing", "digital-marketing"],
    icon: Sparkles,
    bg: "from-brand-500 to-brand-700",
  },
  {
    key: "tech",
    kicker: "Track 03",
    title: "Code & Systems",
    blurb: "Build websites and apps, or run the networks and security a company depends on.",
    slugs: ["web-development", "python-programming", "computer-networking", "cybersecurity-basics"],
    icon: GraduationCap,
    bg: "from-ink-600 to-ink-700",
  },
  {
    key: "business",
    kicker: "Track 04",
    title: "Business & Data",
    blurb: "Keep the books, read the numbers and draw the plans — skills an employer pays for.",
    slugs: ["quickbooks-accounting", "data-analysis-excel", "autocad", "microsoft-365-teams"],
    icon: Wallet,
    bg: "from-green-700 to-green-800",
  },
];

const HOW = [
  { icon: BadgeCheck, t: "Register", d: "Pay the one-off registration and pick your course." },
  { icon: Clock, t: "Study", d: "Evenings, weekends or online — around the job you already have." },
  { icon: Laptop2, t: "Practise", d: "On real machines, with notes you keep for good." },
  { icon: Award, t: "Qualify", d: "Sit the assessment and collect your certificate." },
];

export function LearningBrochures() {
  const bySlug = new Map(courses.map((c) => [c.slug, c]));

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-black text-ink-900 sm:text-xl">
            What you can study with us
          </h2>
          <p className="text-[13px] text-ink-700/65">
            Four routes, twenty-two courses — pick the one that pays you soonest.
          </p>
        </div>
        <Link
          href="/learn"
          className="press inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-ink-600"
        >
          See every course <ArrowRight size={14} />
        </Link>
      </div>

      {/* ── The four brochure panels ────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2">
        {TRACKS.map((t) => {
          const list = t.slugs.map((s) => bySlug.get(s)).filter(Boolean) as typeof courses;
          if (list.length === 0) return null;
          const from = Math.min(...list.map(courseTotal));

          return (
            <article
              key={t.key}
              className="card-lift overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-ink-600/10"
            >
              {/* The panel head, printed in the house colours */}
              <div className={`relative bg-gradient-to-br ${t.bg} p-4 text-white sm:p-5`}>
                <span
                  className="pointer-events-none absolute inset-0 opacity-[0.08]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(115deg, #fff 0 3px, transparent 3px 20px)",
                  }}
                />
                <div className="relative flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25">
                    <t.icon size={21} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/65">
                      {t.kicker}
                    </p>
                    <h3 className="font-display text-lg font-black leading-tight sm:text-xl">
                      {t.title}
                    </h3>
                  </div>
                  <span className="ml-auto shrink-0 rounded-full bg-[#FCDC04] px-2.5 py-1 text-[11px] font-black text-ink-900">
                    from {ugx(from)}
                  </span>
                </div>
                <p className="relative mt-2.5 text-[12.5px] leading-relaxed text-white/85">
                  {t.blurb}
                </p>
              </div>

              {/* The courses inside it */}
              <ul className="divide-y divide-ink-600/8">
                {list.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/learn/${c.slug}`}
                      className="group flex items-center gap-3 px-3 py-2.5 transition hover:bg-brand-50/60"
                    >
                      <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-ink-50">
                        <SafeImage
                          src={c.cover ?? `/courses/${c.slug}.webp`}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover transition duration-500 group-hover:scale-110"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-bold text-ink-900">
                          {c.title}
                        </span>
                        <span className="block text-[11px] text-ink-700/55">
                          {c.durationMonths
                            ? `${c.durationMonths} month${c.durationMonths > 1 ? "s" : ""} · ${c.level}`
                            : c.level}
                        </span>
                      </span>
                      <span className="shrink-0 text-[13px] font-black text-brand-600">
                        {ugx(courseTotal(c))}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      {/* ── How it runs, as a printed strip ─────────────────────── */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-ink-600/10">
        <div className="flex items-center gap-2 bg-ink-700 px-4 py-2.5 text-white">
          <GraduationCap size={16} className="text-[#FCDC04]" />
          <h3 className="font-display text-sm font-black uppercase tracking-wide">
            How the training runs
          </h3>
          <Link
            href="/learn"
            className="ml-auto rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold ring-1 ring-white/20 transition hover:bg-white hover:text-ink-900"
          >
            Start now →
          </Link>
        </div>
        <ol className="grid divide-y divide-ink-600/8 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {HOW.map((h, n) => (
            <li key={h.t} className="flex items-start gap-3 p-4">
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <h.icon size={17} />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-black text-white">
                  {n + 1}
                </span>
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-extrabold text-ink-900">{h.t}</span>
                <span className="block text-[11.5px] leading-snug text-ink-700/65">{h.d}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
