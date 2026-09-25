import { NextResponse } from "next/server";
import { courses, courseTotal, REGISTRATION_FEE } from "@/lib/data";

/**
 * The courses, as the site actually offers them.
 *
 * Registration is validated against the API's own courses table, and that
 * table held four rows while the site advertised twenty-two. Registering for
 * any of the other eighteen — Computer Networking, Graphic Design, Python and
 * the rest — failed with "Unknown course", which nobody saw because the old
 * form swallowed the error and opened WhatsApp instead.
 *
 * So the API pulls this feed and seeds itself, exactly as it does for
 * products. Publishing the site is the only step.
 *
 * `price_ugx` is the full programme — registration plus training — because
 * that is the figure a learner is quoted and the one the owner's alert shows.
 *
 * Everything here is already public on the course pages.
 */

export const revalidate = 300;

export function GET() {
  const items = courses.map((c) => ({
    slug: c.slug,
    title: c.title,
    level: c.level,
    lessons: c.lessons,
    hours: c.hours,
    price_ugx: courseTotal(c),
    training_fee: c.trainingFee ?? 0,
    registration_fee: REGISTRATION_FEE,
    duration_months: c.durationMonths ?? null,
    blurb: c.blurb,
    emoji: c.emoji,
    // The syllabus travels with the course so a lecturer scheduling a class,
    // and a student checking their progress, see the same lesson list.
    syllabus: c.syllabus?.map((l) => ({
      title: l.title,
      minutes: l.minutes,
      free: l.free ?? false,
    })),
    materials: c.materials ?? null,
    quiz: c.quiz ?? null,
  }));

  return NextResponse.json(
    { count: items.length, generated_at: new Date().toISOString(), items },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}
