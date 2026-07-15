import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const key = () => process.env.ADMIN_API_KEY ?? "";

export async function GET(req: Request) {
  const pending = new URL(req.url).searchParams.get("pending_only") ?? "false";
  const res = await fetch(`${API}/api/v1/vendor/admin/products?pending_only=${pending}`, {
    headers: { "X-Admin-Key": key() },
    cache: "no-store",
  });
  const data = await res.json().catch(() => []);
  return NextResponse.json(data, { status: res.status });
}

// Admin creates a product ON BEHALF OF a vendor (approved & live immediately).
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { vendor_id, ...product } = body ?? {};
  const res = await fetch(`${API}/api/v1/vendor/admin/${vendor_id}/products`, {
    method: "POST",
    headers: { "X-Admin-Key": key(), "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
