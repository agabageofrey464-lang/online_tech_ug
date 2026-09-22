import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({ hidden: true }));
  const res = await fetch(`${API}/api/v1/discussion/admin/${id}/hide`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Admin-Key": process.env.ADMIN_API_KEY ?? "" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
