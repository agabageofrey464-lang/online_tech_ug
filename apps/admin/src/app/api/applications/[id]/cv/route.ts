const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const key = () => process.env.ADMIN_API_KEY ?? "";

/** Streams the applicant's CV file through with the admin key attached. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${API}/api/v1/careers/applications/${id}/cv`, {
    headers: { "X-Admin-Key": key() },
    cache: "no-store",
  });
  if (!res.ok) return new Response("Not found", { status: res.status });
  const headers = new Headers();
  headers.set("Content-Type", res.headers.get("Content-Type") ?? "application/octet-stream");
  const disp = res.headers.get("Content-Disposition");
  if (disp) headers.set("Content-Disposition", disp);
  return new Response(res.body, { status: 200, headers });
}
