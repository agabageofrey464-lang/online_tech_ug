import type { Product } from "@/lib/data";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Spec = { label: string; value: string };

/** A vendor's product, as the marketplace feed returns it. */
export type VendorItem = {
  id: number;
  vendor_id: number;
  name: string;
  category: string;
  price_ugx: number;
  old_price_ugx: number | null;
  brand: string;
  condition: string;
  description: string;
  image_url: string;
  in_stock: boolean;
  specs: Spec[] | null;
  vendor_name: string;
  vendor_verified?: boolean;
  vendor_phone?: string;
  vendor_email?: string;
};

export async function getVendorItems(): Promise<VendorItem[]> {
  try {
    const res = await fetch(`${API}/api/v1/vendor/marketplace`, { next: { revalidate: 300 } });
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}

export async function getVendorItem(id: number): Promise<VendorItem | null> {
  try {
    const res = await fetch(`${API}/api/v1/vendor/marketplace/${id}`, { next: { revalidate: 120 } });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

/**
 * Where a vendor's category sits in the shop. Vendors choose from a longer
 * list than the shop has shelves for — the marketplace takes clothing and
 * groceries too — so only the ones that are computer-shop goods are given a
 * place here. Anything else stays in the marketplace, where it belongs.
 */
const SHELF: Record<string, Product["category"]> = {
  Laptops: "Laptops",
  Desktops: "Desktops",
  "Phones & Tablets": "Phones",
  Phones: "Phones",
  Accessories: "Accessories",
  "Phone Accessories": "Accessories",
  Networking: "Networking",
  Storage: "Storage",
  Components: "Components",
  Power: "Power",
  Electronics: "Accessories",
};

const CONDITIONS: Product["condition"][] = ["Brand New", "UK Used", "Refurbished"];

/**
 * Vendor products as shop products, so they stand on the shop's shelves beside
 * our own. Each keeps the "vp-<id>" id the cart and checkout already
 * understand, and carries its seller's name so the card can say who sells it.
 */
export function asShopProducts(items: VendorItem[]): Product[] {
  return items
    .filter((v) => v.in_stock && SHELF[v.category])
    .map((v) => ({
      id: `vp-${v.id}`,
      name: v.name,
      category: SHELF[v.category],
      price: v.price_ugx,
      oldPrice: v.old_price_ugx && v.old_price_ugx > v.price_ugx ? v.old_price_ugx : undefined,
      brand: v.brand || v.vendor_name,
      condition: CONDITIONS.includes(v.condition as Product["condition"]) ? (v.condition as Product["condition"]) : "Brand New",
      rating: 0,
      inStock: true,
      image: v.image_url || "/placeholder.svg",
      specs: (v.specs ?? []).slice(0, 4).map((s) => s.value),
      seller: v.vendor_name,
    }));
}
