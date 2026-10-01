import { NextResponse } from "next/server";
import { courses } from "@/lib/data";
import { courseNotes } from "@/lib/course-notes";

/**
 * Every lesson, so the admin can decide which ones are fit to sell.
 *
 * Lessons live in this file rather than in a table, so the admin has no way to
 * see them — and it needed one, because the shop front was offering all 269
 * for money while eleven had a video behind them. This is the same device as
 * the catalogue feed: the shop front publishes what it is showing, and the
 * other side reads it.
 *
 * Nothing here is private. These titles are already printed on the course
 * page; what is withheld from a visitor is the lesson content itself, which
 * stays on the API behind an unlock code.
 */

export const revalidate = 300;

export function GET() {
  const out = courses.map((c) => ({
    slug: c.slug,
    title: c.title,
    // How many written note units exist for the course, which is the other
    // half of "is there anything behind this lesson".
    noteUnits: (courseNotes[c.slug] ?? []).length,
    // `lessons` on a Course is the COUNT; the lesson objects live in
    // `syllabus`. Reading the wrong one returned a number and the route 500'd.
    lessons: (c.syllabus ?? []).map((l, index) => ({
      index,
      title: l.title,
      minutes: l.minutes,
      youtube: l.youtube ?? null,
      preview: l.preview ?? null,
    })),
  }));

  return NextResponse.json(
    { count: out.length, courses: out },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } },
  );
}
