import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const adminKey = () => process.env.ADMIN_API_KEY ?? "";

// Revoke (or un-revoke via ?revoked=false) a code. Protected by the admin middleware.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const revoked = new URL(req.url).searchParams.get("revoked") ?? "true";
  const res = await fetch(
    `${API}/api/v1/unlock-codes/${encodeURIComponent(id)}/revoke?revoked=${revoked}`,
    { method: "POST", headers: { "X-Admin-Key": adminKey() } },
  );
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
