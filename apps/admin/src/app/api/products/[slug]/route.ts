import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const adminKey = () => process.env.ADMIN_API_KEY ?? "";

// Fetch one product for the edit form.
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  try {
    const res = await fetch(`${API}/api/v1/products/${slug}`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Couldn't reach the product server." }, { status: 502 });
  }
}

// Update a product. Forwards the whole edited payload to the API.
export async function PUT(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const payload = {
    name: body.name,
    category: body.category,
    brand: body.brand,
    condition: body.condition,
    description: body.description,
    price_ugx: body.price_ugx != null ? Number(body.price_ugx) : undefined,
    old_price_ugx: body.old_price_ugx ? Number(body.old_price_ugx) : null,
    in_stock: body.in_stock,
    image_url: body.image_url ?? "",
    specs:
      body.specs && Object.values(body.specs).some((v) => String(v ?? "").trim())
        ? body.specs
        : null,
  };
  try {
    const res = await fetch(`${API}/api/v1/products/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey() },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Couldn't reach the product server." }, { status: 502 });
  }
}

// Delete a product.
export async function DELETE(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  try {
    const res = await fetch(`${API}/api/v1/products/${slug}`, {
      method: "DELETE",
      headers: { "X-Admin-Key": adminKey() },
    });
    if (res.status === 204 || res.ok) return NextResponse.json({ ok: true });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Couldn't reach the product server." }, { status: 502 });
  }
}
