import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Protected by the admin auth middleware. Forwards status updates to the API.
export async function PATCH(req: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${API}/api/v1/orders/${encodeURIComponent(reference)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "X-Admin-Key": process.env.ADMIN_API_KEY ?? "" },
    body: JSON.stringify({ status: body.status, payment_status: body.payment_status }),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

// Removes an order permanently. Guarded by the same admin auth middleware as
// the rest of /api; the API refuses it without the admin key regardless.
export async function DELETE(_req: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const res = await fetch(`${API}/api/v1/orders/${encodeURIComponent(reference)}`, {
    method: "DELETE",
    headers: { "X-Admin-Key": process.env.ADMIN_API_KEY ?? "" },
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
