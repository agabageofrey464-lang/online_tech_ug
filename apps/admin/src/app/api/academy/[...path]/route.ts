import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const adminKey = () => process.env.ADMIN_API_KEY ?? "";

/**
 * Proxy to the academy's admin endpoints.
 *
 * Protected by the admin auth middleware, and the secret key is attached
 * here on the server — it never reaches the browser.
 */

function target(path: string[], search: string) {
  return `${API}/api/v1/academy/admin/${path.join("/")}${search}`;
}

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const search = new URL(req.url).search;
  const res = await fetch(target(path, search), {
    headers: { "X-Admin-Key": adminKey() },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ([]));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const search = new URL(req.url).search;
  const body = await req.text();
  const res = await fetch(target(path, search), {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey() },
    body: body || undefined,
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const body = await req.text();
  const res = await fetch(target(path, new URL(req.url).search), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey() },
    body: body || undefined,
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
