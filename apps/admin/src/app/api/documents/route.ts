import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const key = () => process.env.ADMIN_API_KEY ?? "";

// Issued documents (letters and the like) are kept privately on the API. These
// forward to it with the admin key; the admin auth middleware guards them here.

export async function GET(req: Request) {
  const kind = new URL(req.url).searchParams.get("kind") ?? "";
  try {
    const res = await fetch(`${API}/api/v1/documents?kind=${encodeURIComponent(kind)}`, {
      headers: { "X-Admin-Key": key() },
      cache: "no-store",
    });
    const data = await res.json().catch(() => []);
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "That file is too large to keep a copy of." }, { status: 413 });
  }
  try {
    const res = await fetch(`${API}/api/v1/documents`, {
      method: "POST",
      headers: { "X-Admin-Key": key() },
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Couldn't reach the server." }, { status: 502 });
  }
}
