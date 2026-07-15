import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const key = () => process.env.ADMIN_API_KEY ?? "";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const verified = new URL(req.url).searchParams.get("verified") ?? "true";
  const res = await fetch(`${API}/api/v1/vendor/admin/${id}/verify?verified=${verified}`, {
    method: "POST",
    headers: { "X-Admin-Key": key() },
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
