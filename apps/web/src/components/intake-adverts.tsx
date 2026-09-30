import Link from "next/link";
import { CalendarDays, ArrowRight, GraduationCap } from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import { upcomingIntakes } from "@/lib/intakes";
import { REGISTRATION_FEE } from "@/lib/data";
import { ugx } from "@/lib/site";

/**
 * An advert for every intake that has not started yet.
 *
 * The home page used to carry two hand-written intake slides inside the
 * campaign carousel, so only two were ever advertised and one of them was
 * still promoting a date that had passed. These are generated from the one
 * intake list, so a new date appears here on its own and an old one leaves.
 *
 * Rendered as a row of dated cards rather than a carousel: somebody deciding
 * which intake suits them wants to compare the dates, not wait for each to
 * rotate past.
 */
export function IntakeAdverts() {
  const list = upcomingIntakes();
  if (list.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-ink-700 px-4 py-3 text-white sm:px-5">
        <h2 className="flex items-center gap-2 text-lg font-black tracking-tight sm:text-xl">
          <GraduationCap size={20} className="text-[#FCDC04]" />
          Classes starting soon
        </h2>
        <Link
          href="/learn"
          className="press inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-ink-900 shadow-sm transition hover:bg-white/90 sm:text-sm"
        >
          Browse all courses <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((intake) => (
          <Link
            key={intake.date}
            href="/learn"
            className="card-lift group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-ink-600/10"
          >
            <span className="relative block h-28 w-full overflow-hidden bg-ink-50">
              <SafeImage
                src={intake.img}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <span className={`absolute inset-0 opacity-85 ${intake.bg} mix-blend-multiply`} />
              <span className="absolute inset-x-3 bottom-2 flex items-center gap-1.5 text-white">
                <CalendarDays size={14} className="shrink-0 text-[#FCDC04]" />
                <span className="text-[13px] font-black drop-shadow">{intake.label}</span>
              </span>
            </span>

            <span className="flex flex-1 flex-col p-4">
              <span className="font-display text-[15px] font-black leading-tight text-ink-900">
                {intake.title}
              </span>
              <span className="mt-1 text-[13px] leading-relaxed text-ink-700/70">
                {intake.note}
              </span>
              <span className="mt-auto pt-3">
                <span className="block text-[11px] font-semibold text-ink-700/50">
                  {intake.small}
                </span>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-xs font-black text-white shadow-sm transition group-hover:bg-brand-600">
                  Reserve a place <ArrowRight size={13} />
                </span>
              </span>
            </span>
          </Link>
        ))}
      </div>

      <p className="border-t border-ink-600/10 px-4 py-2.5 text-center text-[12px] text-ink-700/60">
        Registration {ugx(REGISTRATION_FEE)} once, then the training fee for your course. Pay by
        MTN MoMo or Airtel Money.
      </p>
    </section>
  );
}
