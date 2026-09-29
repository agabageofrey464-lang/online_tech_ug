import Link from "next/link";
import { ArrowRight, Award, BookOpen, Clock } from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import { Icon } from "@/components/icon";
import { courses, courseTotal, type Course } from "@/lib/data";
import { ugx } from "@/lib/site";

/**
 * The courses, shown properly on the home page.
 *
 * The old grid put five narrow cards to a row, repeated the same stock photo
 * across half of them, and printed `course.price` — which is the self-study
 * unlock price, not the taught programme. A visitor read "Computer Basics —
 * UGX 50,000" for a programme that costs 500,000, on the most visited page on
 * the site.
 *
 * Both figures are real, so both are shown and each is named: the programme
 * fee in full, and the cheaper way in underneath it.
 */

const SHOWN = 8;

function CourseCard({ c }: { c: Course }) {
  const total = courseTotal(c);

  return (
    <Link
      href={`/learn/${c.slug}`}
      className="group/course card-lift flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-ink-600/10"
    >
      <span className="relative block h-32 w-full overflow-hidden bg-ink-50 sm:h-36">
        <SafeImage
          src={c.cover ?? `/courses/${c.slug}.webp`}
          alt={c.title}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover/course:scale-[1.06]"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-ink-900/10 to-transparent" />

        <span className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-brand-600 shadow-sm">
          <Icon name={c.emoji} size={17} />
        </span>

        {c.durationMonths ? (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
            <Clock size={10} /> {c.durationMonths} month{c.durationMonths > 1 ? "s" : ""}
          </span>
        ) : null}

        <span className="absolute inset-x-2 bottom-2">
          <span className="line-clamp-2 block text-[13.5px] font-black leading-tight text-white drop-shadow">
            {c.title}
          </span>
        </span>
      </span>

      <span className="flex flex-1 flex-col p-3">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="rounded bg-ink-50 px-1.5 py-0.5 text-[10px] font-bold text-ink-700/70">
            {c.level}
          </span>
          <span className="inline-flex items-center gap-1 rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
            <Award size={10} /> Certificate
          </span>
        </span>

        {/* The programme fee, named — not the unlock price wearing its clothes. */}
        <span className="mt-auto pt-2.5">
          <span className="block text-[10px] font-bold uppercase tracking-wide text-ink-700/45">
            Full programme
          </span>
          <span className="block text-base font-black leading-tight text-brand-600">
            {ugx(total)}
          </span>
          {c.price ? (
            <span className="mt-0.5 block text-[10.5px] text-ink-700/55">
              or study online from {ugx(c.price)}
            </span>
          ) : null}
        </span>
      </span>
    </Link>
  );
}

export function CourseShowcase() {
  // Cheapest programme first, so the grid opens on what most people can afford.
  const list = [...courses].sort((a, b) => courseTotal(a) - courseTotal(b)).slice(0, SHOWN);
  const rest = courses.length - list.length;

  return (
    <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
      {list.map((c) => (
        <CourseCard key={c.slug} c={c} />
      ))}

      {/* The last tile is the brochure, using space a ninth card would waste. */}
      <Link
        href="/learn"
        className="card-lift relative flex flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-ink-600 to-ink-700 p-4 text-white shadow-sm ring-1 ring-black/5 sm:col-span-2 lg:col-span-4"
      >
        <span
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "repeating-linear-gradient(115deg, #fff 0 3px, transparent 3px 20px)",
          }}
        />
        <span className="relative flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#FCDC04] text-ink-900">
              <BookOpen size={20} />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-lg font-black leading-tight">
                {rest > 0 ? `${rest} more courses to choose from` : "Every course we teach"}
              </span>
              <span className="block text-[12.5px] text-white/70">
                Design, networking, accounting, code and more — Kampala or online.
              </span>
            </span>
          </span>

          <span className="ml-auto flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1.5 text-[11.5px] font-bold ring-1 ring-white/20">
              Single lessons from {ugx(5000)}
            </span>
            <span className="press inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-black shadow-sm">
              Browse all courses <ArrowRight size={15} />
            </span>
          </span>
        </span>
      </Link>
    </div>
  );
}
