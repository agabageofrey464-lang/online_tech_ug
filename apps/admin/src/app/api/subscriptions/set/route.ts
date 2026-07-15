import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const key = () => process.env.ADMIN_API_KEY ?? "";

// Set/extend a subscription: { kind: "vendor"|"freelancer"|"advert", id, days }
export async function POST(req: Request) {
  const { kind, id, days } = await req.json().catch(() => ({}));
  const res = await fetch(
    `${API}/api/v1/subscriptions/set?kind=${encodeURIComponent(kind)}&id=${id}&days=${days}`,
    { method: "POST", headers: { "X-Admin-Key": key() } },
  );
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
