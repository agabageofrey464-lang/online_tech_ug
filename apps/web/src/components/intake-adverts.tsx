import { ArrowRight, CalendarDays, GraduationCap } from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import { upcomingIntakes } from "@/lib/intakes";
import { REGISTRATION_FEE } from "@/lib/data";
import { ugx, whatsappLink } from "@/lib/site";

/**
 * An advert for every intake that has not started yet.
 *
 * Each one used to be a festival strip: white words set straight on top of a
 * course photograph, under a diagonal stripe texture. The photograph was meant
 * to sit right back at 18%, but the image component fades pictures in by
 * setting their opacity itself, so it arrived at full strength and the words
 * were being read off a lit code screen or a bar chart. On a phone, where a
 * strip is one column wide and four lines of copy tall, it was worse.
 *
 * So the words and the picture no longer share a surface. An intake is a date
 * first, and the date is what the card leads with — a calendar tile in the
 * intake's colour — followed by what it is, on plain white, with the
 * photograph in a panel of its own where there is room for one. On a phone the
 * photograph steps aside and each intake is a compact row.
 *
 * It lives on the Learn page, at the top, so the button on each card reserves
 * a place — by WhatsApp, which is how places are actually booked — instead of
 * linking to the page the reader is already on.
 *
 * Generated from the one intake list, so a new date appears here on its own
 * and a date that has passed leaves.
 */
export function IntakeAdverts() {
  const list = upcomingIntakes();
  if (list.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-ink-600/10">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-3 bg-ink-700 px-4 py-4 text-white sm:px-6 sm:py-5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/70 sm:text-[11px]">
            <GraduationCap size={15} className="shrink-0 text-[#FCDC04]" />
            Online Tech Academy
          </p>
          <h2 className="mt-1 font-display text-xl font-black leading-tight sm:text-3xl">
            Classes starting <span className="text-[#FCDC04]">soon</span>
          </h2>
        </div>
        <a
          href="#courses"
          className="press inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-ink-900 transition hover:bg-white/90 sm:px-5 sm:py-2.5 sm:text-sm"
        >
          <span className="sm:hidden">All courses</span>
          <span className="hidden sm:inline">Browse all courses</span>
          <ArrowRight size={14} />
        </a>
      </div>

      {/* ── One card per intake ─────────────────────────────────── */}
      <ul className="grid gap-3 p-3 sm:p-4 lg:grid-cols-2">
        {list.map((intake, i) => {
          const date = new Date(`${intake.date}T00:00:00Z`);
          const month = date.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });
          return (
            <li key={intake.date}>
              <a
                href={whatsappLink(`Hi, I'd like to register for the classes starting ${intake.label}.`)}
                target="_blank"
                rel="noreferrer"
                className="card-lift group flex h-full overflow-hidden rounded-lg bg-white ring-1 ring-ink-600/10 transition hover:ring-brand-300"
              >
                {/* The date, as a calendar tile. */}
                <div
                  className={`flex w-[4.75rem] shrink-0 flex-col items-center justify-center ${intake.bg} px-2 py-4 text-white sm:w-24`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">{month}</span>
                  <span className="font-display text-4xl font-black leading-none sm:text-5xl">{date.getUTCDate()}</span>
                  <span className="mt-1 text-[11px] font-semibold text-white/70">{date.getUTCFullYear()}</span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col p-3.5 sm:p-4">
                  {i === 0 && (
                    <span className="mb-1.5 inline-flex w-fit items-center gap-1 rounded-full bg-[#FCDC04] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-ink-900">
                      <CalendarDays size={11} /> Next intake
                    </span>
                  )}
                  <h3 className="font-display text-[17px] font-black leading-snug text-ink-900 sm:text-xl">
                    {intake.title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-700/75">{intake.note}</p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-700/55">
                      {intake.small}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-3.5 py-1.5 text-xs font-bold text-white transition group-hover:bg-brand-600">
                      Reserve a place <ArrowRight size={13} />
                    </span>
                  </div>
                </div>

                {/* The course photograph, in a panel of its own — only where
                    the card is wide enough to give it one. */}
                <div className="relative hidden w-36 shrink-0 overflow-hidden sm:block lg:hidden xl:block xl:w-40">
                  <SafeImage
                    src={intake.img}
                    alt=""
                    fill
                    sizes="160px"
                    className="card-zoom object-cover"
                  />
                </div>
              </a>
            </li>
          );
        })}
      </ul>

      <p className="border-t border-ink-600/10 px-4 py-3 text-center text-[12px] text-ink-700/60">
        Registration {ugx(REGISTRATION_FEE)} once, then the training fee for your course. Pay by
        MTN MoMo or Airtel Money.
      </p>
    </section>
  );
}
