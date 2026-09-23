import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const adminKey = () => process.env.ADMIN_API_KEY ?? "";

// Protected by the admin auth middleware. Forwards to the API with the secret key.
// Used by every inbox that needs to reply to the person who wrote in.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body.message || String(body.message).trim().length < 2) {
    return NextResponse.json({ detail: "Write a message first." }, { status: 400 });
  }

  const res = await fetch(`${API}/api/v1/feedback/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey() },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
