import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// What would be removed if this vendor is deleted — used for the confirm dialog.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${API}/api/v1/vendor/admin/${id}/impact`, {
    headers: { "X-Admin-Key": process.env.ADMIN_API_KEY ?? "" },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
