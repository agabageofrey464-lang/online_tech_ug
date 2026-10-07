import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const headers = () => ({ "X-Admin-Key": process.env.ADMIN_API_KEY ?? "" });

// Approve a review, making it public.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${API}/api/v1/reviews/${encodeURIComponent(id)}/approve`, { method: "POST", headers: headers() });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

// Remove a review for good.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${API}/api/v1/reviews/${encodeURIComponent(id)}`, { method: "DELETE", headers: headers() });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
