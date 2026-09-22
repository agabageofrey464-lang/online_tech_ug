import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Approve a registration: activates the code and emails it to the learner. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${API}/api/v1/unlock-codes/${id}/approve`, {
    method: "POST",
    headers: { "X-Admin-Key": process.env.ADMIN_API_KEY ?? "" },
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
