"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { products, productCategories } from "@/lib/data";
import { ProductCard } from "@/components/product-card";

type Sort = "popular" | "price-asc" | "price-desc";

const ALL_BRANDS = ["All", ...Array.from(new Set(products.map((p) => p.brand))).sort()];

export function ShopGrid() {
  const params = useSearchParams();
  const [category, setCategory] = useState<string>("All");
  const [brand, setBrand] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("popular");
  const [showFilters, setShowFilters] = useState(false);

  // Initialise from URL (?cat= & ?brand= & ?q=).
  useEffect(() => {
    const cat = params.get("cat");
    const br = params.get("brand");
    const q = params.get("q");
    if (cat && (productCategories as readonly string[]).includes(cat)) setCategory(cat);
    if (br && ALL_BRANDS.includes(br)) setBrand(br);
    if (q) setQuery(q);
  }, [params]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => (category === "All" ? true : p.category === category));
    if (brand !== "All") list = list.filter((p) => p.brand === brand);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "popular") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [category, brand, query, sort]);

  return (
    <div className="grid gap-3 lg:grid-cols-[210px_1fr]">
      {/* Mobile filter toggle */}
      <button
        onClick={() => setShowFilters((v) => !v)}
        className="flex items-center justify-between rounded bg-white p-3 text-sm font-bold text-ink-700 shadow-sm lg:hidden"
      >
        <span className="flex items-center gap-2">
          Filters
          {(category !== "All" || brand !== "All") && (
            <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[11px] font-semibold text-brand-700">
              {[category !== "All" ? category : null, brand !== "All" ? brand : null].filter(Boolean).join(" · ")}
            </span>
          )}
        </span>
        <span className="text-brand-600">{showFilters ? "Hide ▲" : "Show ▼"}</span>
      </button>

      {/* Sidebar filters */}
      <aside className={`h-fit rounded bg-white p-4 shadow-sm lg:block ${showFilters ? "block" : "hidden"}`}>
        <p className="text-xs font-bold uppercase tracking-wider text-ink-700/50">Category</p>
        <div className="mt-2 flex flex-col">
          {productCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded px-2 py-1.5 text-left text-sm transition ${
                category === c ? "bg-brand-50 font-semibold text-brand-700" : "text-ink-800 hover:bg-ink-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ink-700/50">Brand</p>
        <div className="mt-2 flex flex-col">
          {ALL_BRANDS.map((b) => (
            <button
              key={b}
              onClick={() => setBrand(b)}
              className={`rounded px-2 py-1.5 text-left text-sm transition ${
                brand === b ? "bg-brand-50 font-semibold text-brand-700" : "text-ink-800 hover:bg-ink-50"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </aside>

      {/* Results */}
      <div>
        <div className="mb-3 flex flex-col gap-2 rounded bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-md border border-ink-600/15 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none sm:w-64"
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-ink-700/60">{filtered.length} item(s)</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-md border border-ink-600/15 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="popular">Most popular</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="rounded bg-white p-12 text-center text-ink-700/60 shadow-sm">
            No products match your search.
          </div>
        )}
      </div>
    </div>
  );
}
