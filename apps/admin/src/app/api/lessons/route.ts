import { NextResponse } from "next/server";

/**
 * Lessons for the admin: what exists, and what has been cleared for sale.
 *
 * Two sources, because the two halves live in different places. The lessons
 * themselves are published by the shop front — they are defined in its course
 * file, not in a table — and the decision about each one is stored on the API.
 * Joining them here keeps that seam out of the page.
 */

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.onlinetechug.com";
const key = () => process.env.ADMIN_API_KEY ?? "";

export async function GET() {
  try {
    const [feedRes, statusRes] = await Promise.all([
      fetch(`${SITE}/api/lessons-feed`, { cache: "no-store" }),
      fetch(`${API}/api/v1/courses/lessons/overview`, {
        headers: { "X-Admin-Key": key() },
        cache: "no-store",
      }),
    ]);

    if (!feedRes.ok) {
      return NextResponse.json(
        { error: `Could not read the lesson list from the site (${feedRes.status}).` },
        { status: 502 },
      );
    }

    const feed = await feedRes.json();
    // A missing status is not fatal: better to show the lessons with nothing
    // published than an error page.
    const status = statusRes.ok ? await statusRes.json() : { published: {} };

    return NextResponse.json({
      courses: feed.courses ?? [],
      published: status.published ?? {},
    });
  } catch {
    return NextResponse.json({ error: "Could not reach the site or the API." }, { status: 502 });
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${API}/api/v1/courses/lessons/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Admin-Key": key() },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
