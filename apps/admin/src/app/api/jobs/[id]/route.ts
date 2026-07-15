import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const key = () => process.env.ADMIN_API_KEY ?? "";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const res = await fetch(`${API}/api/v1/jobs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Admin-Key": key() },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${API}/api/v1/jobs/${id}`, {
    method: "DELETE",
    headers: { "X-Admin-Key": key() },
  });
  return new NextResponse(null, { status: res.status });
}
