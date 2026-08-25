import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const key = () => ({ "X-Admin-Key": process.env.ADMIN_API_KEY ?? "" });

// What would be removed if this vendor is deleted (confirmation summary).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${API}/api/v1/vendor/admin/${encodeURIComponent(id)}/impact`, {
    headers: key(),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

// Permanently delete the vendor and everything they own.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${API}/api/v1/vendor/admin/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: key(),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
