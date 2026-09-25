import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const key = () => process.env.ADMIN_API_KEY ?? "";

/**
 * Turning on alerts for this device.
 *
 * These notifications carry customer names, phone numbers and order totals, so
 * the admin key attaches here on the server and never reaches the browser.
 * The VAPID key is public, but goes through here too so the browser never has
 * to know the API's address for alerts to work.
 */
const PATHS: Record<string, string> = {
  subscribe: "admin/subscribe",
  test: "admin/test",
  devices: "admin/owner-devices",
  key: "public-key",
};

function target(action: string): string | null {
  const path = PATHS[action];
  return path ? `${API}/api/v1/push/${path}` : null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const url = target(action);
  if (!url) return NextResponse.json({ detail: "Unknown action" }, { status: 404 });

  const res = await fetch(url, { headers: { "X-Admin-Key": key() }, cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const url = target(action);
  if (!url) return NextResponse.json({ detail: "Unknown action" }, { status: 404 });

  const body = await req.text();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Admin-Key": key() },
    body: body || "{}",
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
