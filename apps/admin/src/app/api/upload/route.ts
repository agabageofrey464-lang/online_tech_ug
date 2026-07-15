import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const key = () => process.env.ADMIN_API_KEY ?? "";

// Forwards a file upload to the API (with the admin key) and returns the full
// public URL of the stored image, ready to drop into an image_url field.
export async function POST(req: Request) {
  const form = await req.formData();
  const res = await fetch(`${API}/api/v1/uploads`, {
    method: "POST",
    headers: { "X-Admin-Key": key() },
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok && data.path) {
    return NextResponse.json({ url: `${API}/api/v1/uploads/${data.path}` });
  }
  return NextResponse.json({ error: data.detail || "Upload failed" }, { status: res.status || 500 });
}
