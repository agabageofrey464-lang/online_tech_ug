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
 * list than the shop has shelves for; a category with no shelf of its own
 * goes with the accessories, so everything a vendor lists reaches the shop
 * as well as the marketplace.
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

/**
 * The shelf a vendor's product belongs on. What the product is decides first:
 * a phone is a phone and a laptop a laptop whatever category the vendor picked
 * for it — "Lenovo ryzen 5" filed under Accessories is still a laptop. Only
 * when the name does not say is the vendor's own category used.
 */
const PHONE = /\b(i\s?phone|galaxy|samsung\s+[sa]\d|redmi|xiaomi|tecno|infinix|itel|oppo|vivo|honor|huawei|nokia|pixel|oneplus|realme|smart\s?phone|phone|tablets?|ipad|tab\s?\d)\b/i;
const NOT_PHONE = /\b(case|cover|charger|cable|protector|holder|stand|earphone|headphone|power\s?bank|adapter|screen\s?guard|pouch)\b/i;
const LAPTOP = /\b(laptop|notebook|macbook|thinkpad|elitebook|probook|latitude|inspiron|ideapad|vivobook|zenbook|pavilion|x1\s?carbon|ryzen\s?\d|core\s?i\d|chromebook)\b/i;
const NOT_LAPTOP = /\b(bag|sleeve|stand|charger|adapter|battery|keyboard|skin|cooler|ram|ssd)\b/i;

export function shelfFor(v: { name: string; category: string }): Product["category"] {
  if (PHONE.test(v.name) && !NOT_PHONE.test(v.name)) return "Phones";
  if (LAPTOP.test(v.name) && !NOT_LAPTOP.test(v.name)) return "Laptops";
  return SHELF[v.category] ?? "Accessories";
}

const CONDITIONS: Product["condition"][] = ["Brand New", "UK Used", "Refurbished"];

/**
 * Vendor products as shop products, so they stand on the shop's shelves beside
 * our own. Each keeps the "vp-<id>" id the cart and checkout already
 * understand, and carries its seller's name so the card can say who sells it.
 */
export function asShopProducts(items: VendorItem[]): Product[] {
  return items
    .filter((v) => v.in_stock)
    .map((v) => ({
      id: `vp-${v.id}`,
      name: v.name,
      category: shelfFor(v),
      price: v.price_ugx,
      oldPrice: v.old_price_ugx && v.old_price_ugx > v.price_ugx ? v.old_price_ugx : undefined,
      brand: v.brand || v.vendor_name,
      condition: CONDITIONS.includes(v.condition as Product["condition"]) ? (v.condition as Product["condition"]) : "Brand New",
      // Unrated, but not last: a vendor's product stands among ours.
      rating: 4.5,
      inStock: true,
      image: v.image_url || "/placeholder.svg",
      // The card's two specification lines: the vendor's own rows, or, where
      // none were given, the brand, the kind of thing and its description.
      specs: (v.specs ?? []).length
        ? (v.specs ?? []).slice(0, 4).map((s) => s.value)
        : [v.brand, v.category, ...(v.description || "").split(/[,.;\n]/)].map((x) => (x || "").trim()).filter(Boolean).slice(0, 4),
      seller: v.vendor_name,
    }));
}
