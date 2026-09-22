import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function GET() {
  const res = await fetch(`${API}/api/v1/discussion/admin/all`, {
    headers: { "X-Admin-Key": process.env.ADMIN_API_KEY ?? "" },
    cache: "no-store",
  });
  const data = await res.json().catch(() => []);
  return NextResponse.json(data, { status: res.status });
}
