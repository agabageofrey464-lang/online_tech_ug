import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const key = () => process.env.ADMIN_API_KEY ?? "";

// Streams a stored document back to the signed-in admin. The file never has a
// public address: it is fetched here with the admin key and passed through.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${API}/api/v1/documents/${encodeURIComponent(id)}/file`, {
    headers: { "X-Admin-Key": key() },
    cache: "no-store",
  });
  if (!res.ok || !res.body) {
    return NextResponse.json({ error: "Document not found" }, { status: res.status || 404 });
  }
  return new Response(res.body, {
    status: 200,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/pdf",
      "Content-Disposition": res.headers.get("content-disposition") ?? "attachment",
      "Cache-Control": "private, no-store",
    },
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${API}/api/v1/documents/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "X-Admin-Key": key() },
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
