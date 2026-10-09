import { NextResponse } from "next/server";
import { getStoreProducts } from "@/lib/catalog";
import { productImage } from "@/lib/data";

/**
 * Everything on sale, for the parts of the site that load products in the
 * browser: the grid that grows as the home page is scrolled, and the search
 * box. It is the live list — the database's prices and products, and vendors'
 * — where /api/catalog is the catalogue file the API seeds itself from.
 */
export const revalidate = 300;

export async function GET() {
  const items = (await getStoreProducts()).map((p) => ({
    slug: p.id,
    name: p.name,
    category: p.category,
    brand: p.brand,
    condition: p.condition,
    price_ugx: p.price,
    old_price_ugx: p.oldPrice ?? null,
    rating: p.rating,
    in_stock: p.inStock ?? true,
    image_url: productImage(p),
    description: p.specs.join(", "),
    specs: p.details ?? null,
    seller: p.seller ?? null,
  }));
  return NextResponse.json(
    { count: items.length, items },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } },
  );
}
