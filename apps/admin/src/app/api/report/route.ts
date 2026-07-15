import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const key = () => process.env.ADMIN_API_KEY ?? "";

export async function GET(req: Request) {
  const days = new URL(req.url).searchParams.get("days") ?? "14";
  const res = await fetch(`${API}/api/v1/orders/report?days=${days}`, {
    headers: { "X-Admin-Key": key() },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
