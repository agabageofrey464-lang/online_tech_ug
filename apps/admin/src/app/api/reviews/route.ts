import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Every review, pending first. Guarded by the admin auth middleware here and
// by the admin key on the API.
export async function GET() {
  try {
    const res = await fetch(`${API}/api/v1/reviews/admin`, {
      headers: { "X-Admin-Key": process.env.ADMIN_API_KEY ?? "" },
      cache: "no-store",
    });
    const data = await res.json().catch(() => []);
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}
