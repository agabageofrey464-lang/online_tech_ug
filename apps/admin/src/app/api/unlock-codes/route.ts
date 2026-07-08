import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const adminKey = () => process.env.ADMIN_API_KEY ?? "";

// Protected by the admin auth middleware. Forwards to the API with the secret key.

// List codes (optionally filtered by ?course=slug).
export async function GET(req: Request) {
  const course = new URL(req.url).searchParams.get("course");
  const qs = course ? `?course=${encodeURIComponent(course)}` : "";
  const res = await fetch(`${API}/api/v1/unlock-codes${qs}`, {
    headers: { "X-Admin-Key": adminKey() },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ([]));
  return NextResponse.json(data, { status: res.status });
}

// Generate a new code for a course.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body.course_slug) {
    return NextResponse.json({ detail: "course_slug is required." }, { status: 400 });
  }
  const res = await fetch(`${API}/api/v1/unlock-codes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey() },
    body: JSON.stringify({ course_slug: body.course_slug, note: body.note ?? "" }),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
