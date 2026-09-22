import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Replies posted with the admin key are flagged as official trainer answers. */
export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${API}/api/v1/discussion`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Admin-Key": process.env.ADMIN_API_KEY ?? "" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
