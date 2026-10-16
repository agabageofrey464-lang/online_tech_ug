import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const key = () => process.env.ADMIN_API_KEY ?? "";

export async function GET(req: Request) {
  // Passes on when the owner last opened Orders and Enrollments.
  const qs = new URL(req.url).search;
  const res = await fetch(`${API}/api/v1/stats/counts${qs}`, {
    headers: { "X-Admin-Key": key() },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
