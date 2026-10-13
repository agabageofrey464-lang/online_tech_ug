import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopGrid } from "@/components/shop-grid";
import { FeaturedProducts } from "@/components/featured-products";
import { ShopHeading } from "@/components/shop-heading";
import { UnfilteredOnly } from "@/components/unfiltered-only";
import { getStoreProducts } from "@/lib/catalog";
import { productImage } from "@/lib/data";
import { CATEGORY_ORDER } from "@/lib/browse-order";
import { card } from "@/lib/thumb";
import { share } from "@/lib/seo";

// Rebuilt in the background every few minutes, so a product added or
// repriced in the admin reaches the shop without a deploy.
export const revalidate = 60; // a minute, so a new or newly approved listing shows promptly

// Static, deliberately. This page used to read searchParams on the server,
// which meant it could never be cached: every visitor waited for a function to
// start, call the API and render the whole catalogue — about a second before
// anything appeared, against 0.4s for the cached home page. The filters, the
// heading and the breadcrumb all read the query string in the browser instead,
// which is where the grid was already doing it.
export const metadata: Metadata = share({
  title: "Shop Computers & Accessories",
  description:
    "Buy laptops, desktops, accessories, networking and storage in Uganda. Quality-checked, with delivery and flexible payment options.",
  // Filtered views are variations of this page, not pages of their own.
  alternates: { canonical: "/shop" },
}, "/shop");

// The product that pictures each category in the rail — the same faces the
// home page uses, so a category looks the same wherever it is met.
const LEAD: Record<string, string> = {
  Laptops: "hp-envy-x360-15-i7-29e0ea",
  Desktops: "hp-all-in-one-i5-1734fd",
  Components: "kingston-fury-8gb-ddr4",
  Storage: "sandisk-extreme-2tb-portable",
  Accessories: "hp-z24-monitor-181ddc",
  Networking: "tp-link-archer-c6",
  Power: "anker-powerbank-20000",
};

export default async function ShopPage() {
  // Our own catalogue, then what approved vendors have listed in the shop's
  // categories. A vendor's product carries its seller's name on the card and
  // opens its own page in the marketplace.
  const products = await getStoreProducts();

  const brandCount = new Set(products.map((p) => p.brand)).size;
  const stats = [
    `${products.length}+ Products`,
    `${brandCount}+ Brands`,
    "Warranty included",
    "Countrywide delivery",
  ];

  const tiles = CATEGORY_ORDER.flatMap((c) => {
    const items = products.filter((p) => p.category === c && p.inStock !== false);
    if (items.length === 0) return [];
    const face =
      items.find((p) => p.id === LEAD[c]) ??
      items.find((p) => productImage(p).startsWith("/products/")) ??
      items.find((p) => p.image) ??
      items[0];
    return [{ name: c as string, img: card(productImage(face)) }];
  });

  // The four newest brand-new products picture the "New In" tile.
  const fresh = products
    .filter((p) => p.inStock !== false && p.condition === "Brand New" && (p.image || productImage(p).startsWith("/products/")))
    .slice(-6)
    .reverse()
    .map((p) => card(productImage(p)));

  return (
    <div className="container-wide py-3">
      {/* useSearchParams needs a Suspense boundary to prerender. */}
      <Suspense fallback={<div className="mb-3 h-40 rounded-lg bg-ink-600/10" />}>
        <ShopHeading stats={stats} tiles={tiles} fresh={fresh} />
      </Suspense>

      <Suspense fallback={<div className="rounded bg-white p-12 text-center text-ink-700/60 shadow-sm">Loading…</div>}>
        <ShopGrid items={products} />
      </Suspense>

      <Suspense fallback={null}>
        <UnfilteredOnly>
          <div className="mt-8">
            <FeaturedProducts />
          </div>
        </UnfilteredOnly>
      </Suspense>
    </div>
  );
}
