import { products as seedProducts, type Product } from "@/lib/data";

/**
 * The shop's products, from the database the admin edits.
 *
 * The storefront used to render straight from `data.ts`, so a price changed in
 * the admin never reached a customer and a product added there never appeared
 * at all. This reads the API instead, which is the same place orders are
 * priced from — so what a customer is shown and what they are charged cannot
 * drift apart.
 *
 * `data.ts` stays as the fallback. If the API is unreachable the shop still
 * renders yesterday's catalogue rather than an empty page, because a shop that
 * shows nothing is worse than a shop that is slightly behind.
 */

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** How long a rendered page may serve before it is refreshed in the background. */
export const CATALOG_REVALIDATE = 300; // 5 minutes

type ApiProduct = {
  slug: string;
  name: string;
  category: string;
  brand: string;
  condition: string;
  description: string;
  price_ugx: number;
  old_price_ugx: number | null;
  rating: number;
  in_stock: boolean;
  stock_qty?: number;
  image_url: string;
  specs?: Record<string, string> | null;
};

const CATEGORIES = [
  "Laptops",
  "Desktops",
  "Components",
  "Power",
  "Accessories",
  "Networking",
  "Storage",
] as const;

const CONDITIONS = ["Brand New", "UK Used", "Refurbished"] as const;

function asCategory(value: string): Product["category"] {
  return (CATEGORIES as readonly string[]).includes(value)
    ? (value as Product["category"])
    : "Accessories";
}

function asCondition(value: string): Product["condition"] {
  return (CONDITIONS as readonly string[]).includes(value)
    ? (value as Product["condition"])
    : "Brand New";
}

/** The API's shape, mapped onto the one every component already expects. */
function toProduct(row: ApiProduct, seed?: Product): Product {
  // Card bullets: the seed's hand-written ones read better than anything
  // generated from columns, so they win where we have them.
  const specs =
    seed?.specs?.length
      ? seed.specs
      : Object.values(row.specs ?? {})
          .filter((v) => typeof v === "string" && v.trim())
          .slice(0, 4);

  return {
    id: row.slug,
    name: row.name,
    category: asCategory(row.category),
    price: Number(row.price_ugx) || 0,
    oldPrice: row.old_price_ugx ? Number(row.old_price_ugx) : undefined,
    brand: row.brand || seed?.brand || "",
    condition: asCondition(row.condition),
    rating: Number(row.rating) || seed?.rating || 0,
    badge: seed?.badge,
    inStock: row.in_stock,
    image: row.image_url || seed?.image,
    specs: specs.length ? specs : (seed?.specs ?? []),
    // Full specification tables are long-form editorial; keep the seed's.
    details: seed?.details,
  };
}

const seedBySlug = new Map(seedProducts.map((p) => [p.id, p]));

/**
 * Every product on sale.
 *
 * Server-side only. Falls back to the seed catalogue on any failure.
 */
export async function getProducts(): Promise<Product[]> {
  try {
    // The list endpoint pages at 100, so walk it rather than assuming one page
    // holds everything — silently truncating the shop is how products go
    // missing without anybody noticing.
    const all: ApiProduct[] = [];
    for (let offset = 0; offset < 1000; offset += 100) {
      const res = await fetch(`${API}/api/v1/products?limit=100&offset=${offset}`, {
        next: { revalidate: CATALOG_REVALIDATE },
      });
      if (!res.ok) throw new Error(`products ${res.status}`);
      const page: ApiProduct[] = await res.json();
      all.push(...page);
      if (page.length < 100) break;
    }
    if (all.length === 0) throw new Error("empty catalogue");
    return all.map((row) => toProduct(row, seedBySlug.get(row.slug)));
  } catch {
    return seedProducts;
  }
}

/** One product by slug, or null. Falls back to the seed catalogue. */
export async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API}/api/v1/products/${encodeURIComponent(slug)}`, {
      next: { revalidate: CATALOG_REVALIDATE },
    });
    if (res.status === 404) return seedBySlug.get(slug) ?? null;
    if (!res.ok) throw new Error(`product ${res.status}`);
    const row: ApiProduct = await res.json();
    return toProduct(row, seedBySlug.get(slug));
  } catch {
    return seedBySlug.get(slug) ?? null;
  }
}
