import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopGrid } from "@/components/shop-grid";
import { FeaturedProducts } from "@/components/featured-products";
import { ShopHeading } from "@/components/shop-heading";
import { UnfilteredOnly } from "@/components/unfiltered-only";
import { getProducts } from "@/lib/catalog";
import { asShopProducts, getVendorItems } from "@/lib/vendor-items";
import { share } from "@/lib/seo";

// Rebuilt in the background every few minutes, so a product added or
// repriced in the admin reaches the shop without a deploy.
export const revalidate = 300; // keep in step with CATALOG_REVALIDATE

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

export default async function ShopPage() {
  // Our own catalogue, then what approved vendors have listed in the shop's
  // categories. A vendor's product carries its seller's name on the card and
  // opens its own page in the marketplace.
  const [own, vendorItems] = await Promise.all([getProducts(), getVendorItems()]);
  const products = [...own, ...asShopProducts(vendorItems)];

  const brandCount = new Set(products.map((p) => p.brand)).size;
  const stats = [
    `${products.length}+ Products`,
    `${brandCount}+ Brands`,
    "Warranty included",
    "Countrywide delivery",
  ];

  return (
    <div className="container-wide py-3">
      {/* useSearchParams needs a Suspense boundary to prerender. */}
      <Suspense fallback={<div className="mb-3 h-40 rounded-lg bg-ink-600/10" />}>
        <ShopHeading stats={stats} />
      </Suspense>

      <Suspense fallback={null}>
        <UnfilteredOnly>
          <FeaturedProducts />
        </UnfilteredOnly>
      </Suspense>

      <Suspense fallback={<div className="rounded bg-white p-12 text-center text-ink-700/60 shadow-sm">Loading…</div>}>
        <ShopGrid items={products} />
      </Suspense>
    </div>
  );
}
