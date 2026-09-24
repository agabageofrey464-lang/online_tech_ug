import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const key = () => process.env.ADMIN_API_KEY ?? "";

/**
 * Turning on alerts for this device.
 *
 * These notifications carry customer names, phone numbers and order totals, so
 * the admin key attaches here on the server and never reaches the browser.
 */
const PATHS: Record<string, string> = {
  subscribe: "subscribe",
  test: "test",
  devices: "owner-devices",
};

export async function GET(_req: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const path = PATHS[action];
  if (!path) return NextResponse.json({ detail: "Unknown action" }, { status: 404 });

  const res = await fetch(`${API}/api/v1/push/admin/${path}`, {
    headers: { "X-Admin-Key": key() },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const path = PATHS[action];
  if (!path) return NextResponse.json({ detail: "Unknown action" }, { status: 404 });

  const body = await req.text();
  const res = await fetch(`${API}/api/v1/push/admin/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Admin-Key": key() },
    body: body || "{}",
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
