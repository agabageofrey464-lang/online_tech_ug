import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Protected by the admin auth middleware. Forwards to the API with the secret key.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body.name || !body.category || !body.price_ugx) {
    return NextResponse.json({ error: "Name, category and price are required." }, { status: 400 });
  }
  const payload = {
    slug: (body.slug && String(body.slug).trim()) || slugify(body.name),
    name: String(body.name).trim(),
    category: body.category,
    brand: body.brand || "Generic",
    condition: body.condition || "Brand New",
    description: body.description || "",
    price_ugx: Number(body.price_ugx),
    old_price_ugx: body.old_price_ugx ? Number(body.old_price_ugx) : null,
    rating: body.rating ? Number(body.rating) : 4.5,
    in_stock: body.in_stock !== false,
    image_url: body.image_url || "",
  };

  const res = await fetch(`${API}/api/v1/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Admin-Key": process.env.ADMIN_API_KEY ?? "" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
