import { NextResponse } from "next/server";
import { products, productImage } from "@/lib/data";

/**
 * The catalogue, as the shop actually displays it.
 *
 * The storefront renders from data.ts, but an order is priced and validated
 * against the API's own products table. When the two drift a customer is shown
 * one price and charged another — or worse, told the product doesn't exist and
 * can't buy it at all. That happened: 101 products were unorderable and 34 were
 * charging the price from before the last increase.
 *
 * So the API pulls this feed and syncs itself. Publishing the site is now the
 * only step: whatever is deployed here is what the API will charge.
 *
 * Everything served here is already public on the product pages.
 */

export const revalidate = 300;

export function GET() {
  const items = products.map((p) => ({
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
  }));

  return NextResponse.json(
    { count: items.length, generated_at: new Date().toISOString(), items },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } },
  );
}
