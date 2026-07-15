import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopGrid } from "@/components/shop-grid";
import { FeaturedProducts } from "@/components/featured-products";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { products } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shop Computers & Accessories",
  description:
    "Buy laptops, desktops, accessories, networking and storage in Uganda. Quality-checked, with delivery and flexible payment options.",
};

export default function ShopPage() {
  const brandCount = new Set(products.map((p) => p.brand)).size;
  const stats = [
    `${products.length}+ Products`,
    `${brandCount}+ Brands`,
    "Warranty included",
    "Countrywide delivery",
  ];

  return (
    <div className="container-wide py-3">
      <div className="mb-3">
        <Breadcrumbs items={[{ label: "Shop" }]} />
      </div>

      {/* Category banner */}
      <section className="mb-3 overflow-hidden rounded-lg bg-gradient-to-r from-ink-700 to-ink-600 text-white shadow-sm">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-extrabold sm:text-2xl">
              💻 Computers &amp; Accessories
            </h1>
            <p className="mt-1 max-w-xl text-sm text-white/80">
              Genuine laptops, desktops, components & accessories — quality-checked, with delivery and flexible payments.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.map((s) => (
              <span
                key={s}
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/15"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      <FeaturedProducts />
      <Suspense fallback={<div className="rounded bg-white p-12 text-center text-ink-700/60 shadow-sm">Loading…</div>}>
        <ShopGrid />
      </Suspense>
    </div>
  );
}
