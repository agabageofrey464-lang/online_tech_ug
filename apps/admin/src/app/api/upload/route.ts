import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const key = () => process.env.ADMIN_API_KEY ?? "";

// Forwards a file upload to the API (with the admin key) and returns the full
// public URL of the stored image, ready to drop into an image_url field.
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    // Body too large for the platform, or a malformed multipart request.
    return NextResponse.json({ error: "That image is too large to upload. Please use one under 4 MB." }, { status: 413 });
  }

  if (!key()) {
    return NextResponse.json({ error: "Admin key is not configured on the server." }, { status: 500 });
  }

  let res: Response;
  try {
    res = await fetch(`${API}/api/v1/uploads`, {
      method: "POST",
      headers: { "X-Admin-Key": key() },
      body: form,
    });
  } catch {
    return NextResponse.json({ error: "Couldn't reach the image server. Please try again." }, { status: 502 });
  }

  const data = await res.json().catch(() => ({} as Record<string, unknown>));
  if (res.ok && data.path) {
    return NextResponse.json({ url: `${API}/api/v1/uploads/${data.path}` });
  }
  return NextResponse.json(
    { error: typeof data.detail === "string" ? data.detail : "Upload failed. Please try again." },
    { status: res.status || 500 },
  );
}
