import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopGrid } from "@/components/shop-grid";
import { FeaturedProducts } from "@/components/featured-products";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { products } from "@/lib/data";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; brand?: string; q?: string; deals?: string; sort?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const cat = typeof sp.cat === "string" ? sp.cat : "";
  const brand = typeof sp.brand === "string" ? sp.brand : "";
  const q = typeof sp.q === "string" ? sp.q : "";
  const focus = q ? `“${q}”` : brand || cat || "";
  const title = focus ? `${focus} — Shop` : "Shop Computers & Accessories";
  const description = focus
    ? `Buy ${focus} in Uganda at Online Tech Uganda — quality-checked, warranty included, countrywide delivery & flexible payment.`
    : "Buy laptops, desktops, accessories, networking and storage in Uganda. Quality-checked, with delivery and flexible payment options.";
  return {
    title,
    description,
    // Canonical points to the base shop page so query-filtered views don't create
    // duplicate-content pages in search.
    alternates: { canonical: "/shop" },
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; brand?: string; q?: string; deals?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const cat = typeof sp.cat === "string" ? sp.cat : "";
  const brand = typeof sp.brand === "string" ? sp.brand : "";
  const q = typeof sp.q === "string" ? sp.q : "";
  const deals = sp.deals === "1" || sp.deals === "true";
  const isNew = sp.sort === "new";

  // The page reads as a proper Jumia category/results page — the heading and
  // breadcrumb reflect exactly what the shopper chose.
  const title = q
    ? `Search: “${q}”`
    : brand
      ? brand
      : cat
        ? cat
        : deals
          ? "Top Deals"
          : isNew
            ? "New Arrivals"
            : "Computers & Accessories";
  const isFiltered = Boolean(q || brand || cat || deals || isNew);

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
        <Breadcrumbs items={isFiltered ? [{ label: "Shop", href: "/shop" }, { label: title }] : [{ label: "Shop" }]} />
      </div>

      {/* Category / results banner — reflects the chosen category, brand or search */}
      <section className="mb-3 overflow-hidden rounded-lg bg-gradient-to-r from-ink-700 to-ink-600 text-white shadow-sm">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-extrabold sm:text-2xl">
              {isFiltered ? title : <>💻 Computers &amp; Accessories</>}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-white/80">
              {isFiltered
                ? `Browse ${title} at Online Tech Uganda — quality-checked, warranty & countrywide delivery.`
                : "Genuine laptops, desktops, components & accessories — quality-checked, with delivery and flexible payments."}
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

      {!isFiltered && <FeaturedProducts />}
      <Suspense fallback={<div className="rounded bg-white p-12 text-center text-ink-700/60 shadow-sm">Loading…</div>}>
        <ShopGrid />
      </Suspense>
    </div>
  );
}
