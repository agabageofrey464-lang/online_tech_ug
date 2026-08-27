import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const key = () => ({ "X-Admin-Key": process.env.ADMIN_API_KEY ?? "" });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const res = await fetch(`${API}/api/v1/campaigns/admin/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...key() },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${API}/api/v1/campaigns/admin/${id}`, { method: "DELETE", headers: key() });
  return NextResponse.json({ ok: res.ok }, { status: res.ok ? 200 : res.status });
}
