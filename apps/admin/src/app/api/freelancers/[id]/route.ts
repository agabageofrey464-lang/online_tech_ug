import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const key = () => process.env.ADMIN_API_KEY ?? "";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${API}/api/v1/careers/admin/freelancers/${id}`, {
    method: "DELETE",
    headers: { "X-Admin-Key": key() },
  });
  return new NextResponse(null, { status: res.status });
}
