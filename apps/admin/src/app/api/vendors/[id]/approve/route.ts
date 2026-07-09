import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const approved = new URL(req.url).searchParams.get("approved") ?? "true";
  const res = await fetch(
    `${API}/api/v1/vendor/admin/${encodeURIComponent(id)}/approve?approved=${approved}`,
    { method: "POST", headers: { "X-Admin-Key": process.env.ADMIN_API_KEY ?? "" } },
  );
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
