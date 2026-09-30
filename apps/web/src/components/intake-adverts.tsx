import Link from "next/link";
import { ArrowRight, CalendarDays, GraduationCap } from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import { upcomingIntakes } from "@/lib/intakes";
import { REGISTRATION_FEE } from "@/lib/data";
import { ugx } from "@/lib/site";

/**
 * An advert for every intake that has not started yet, drawn as festival
 * strips.
 *
 * These began as plain white cards with a photo on top, which read as a
 * listing rather than an announcement — and an intake is an announcement, with
 * a date people have to act before. They now use the same printed-banner
 * language as the academy board and the offer strips: a colour wash, the
 * diagonal stripe texture, the yellow the brand uses for dates and prices.
 *
 * Generated from the one intake list, so a new date appears here on its own
 * and a date that has passed leaves.
 */
export function IntakeAdverts() {
  const list = upcomingIntakes();
  if (list.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-xl shadow-md ring-1 ring-black/5">
      {/* ── Header band ─────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-r from-ink-700 via-ink-600 to-brand-600 text-white">
        <span
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "repeating-linear-gradient(115deg, #fff 0 3px, transparent 3px 22px)",
          }}
        />
        <span className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/70 sm:text-[11px]">
              <GraduationCap size={15} className="text-[#FCDC04]" />
              Online Tech Academy
            </p>
            <h2 className="mt-1 font-display text-2xl font-black leading-tight drop-shadow-sm sm:text-3xl">
              Classes starting <span className="text-[#FCDC04]">soon</span>
            </h2>
          </div>
          <Link
            href="/learn"
            className="press inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-xs font-black text-ink-900 shadow-sm transition hover:bg-white/90 sm:text-sm"
          >
            Browse all courses <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── One strip per intake ────────────────────────────────── */}
      <div className="grid gap-2.5 bg-white p-2.5 sm:grid-cols-2 sm:gap-3 sm:p-3">
        {list.map((intake) => (
          <Link
            key={intake.date}
            href="/learn"
            className={`card-lift group relative flex min-h-[9.5rem] flex-col justify-between overflow-hidden rounded-lg ${intake.bg} p-4 text-white shadow-sm sm:p-5`}
          >
            {/* The course photograph, held right back — it gives the strip a
                subject without competing with the words on top of it. Bright
                subjects (a lit code screen, a cyan chart) still punched
                through a flat opacity and left white text sitting on busy
                highlights, so a scrim follows it. */}
            <SafeImage
              src={intake.img}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover opacity-[0.18] transition duration-700 group-hover:scale-105"
            />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-transparent" />
            <span
              className="pointer-events-none absolute inset-0 opacity-[0.10]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(115deg, #fff 0 3px, transparent 3px 20px)",
              }}
            />
            <span className="pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full bg-white/15 blur-2xl" />

            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FCDC04] px-3 py-1 text-[11px] font-black uppercase tracking-wide text-ink-900">
                <CalendarDays size={12} />
                {intake.label}
              </span>
              <h3 className="mt-2.5 font-display text-xl font-black leading-tight drop-shadow-sm sm:text-2xl">
                {intake.title}
              </h3>
              <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-white/85">
                {intake.note}
              </p>
            </div>

            <div className="relative mt-4 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-white/65">
                {intake.small}
              </span>
              <span className="press inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-black text-ink-900 shadow-sm transition group-hover:bg-[#FCDC04]">
                Reserve a place <ArrowRight size={13} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <p className="bg-white px-4 pb-3 text-center text-[12px] text-ink-700/60">
        Registration {ugx(REGISTRATION_FEE)} once, then the training fee for your course. Pay by
        MTN MoMo or Airtel Money.
      </p>
    </section>
  );
}
