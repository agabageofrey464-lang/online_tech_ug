"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { products, productCategories } from "@/lib/data";
import { ProductCard } from "@/components/product-card";

type Sort = "popular" | "price-asc" | "price-desc" | "new";

const BRANDS = Array.from(new Set(products.map((p) => p.brand))).sort();

// Product conditions in a sensible order (only those that actually exist).
const CONDITION_ORDER = ["Brand New", "UK Used", "Refurbished", "Premium Repack"];
const CONDITIONS = CONDITION_ORDER.filter((c) => products.some((p) => p.condition === c));

const PRICE_BANDS: { label: string; min: number; max: number }[] = [
  { label: "All prices", min: 0, max: Infinity },
  { label: "Under UGX 100,000", min: 0, max: 100000 },
  { label: "UGX 100,000 – 500,000", min: 100000, max: 500000 },
  { label: "UGX 500,000 – 2,000,000", min: 500000, max: 2000000 },
  { label: "UGX 2,000,000 – 5,000,000", min: 2000000, max: 5000000 },
  { label: "Over UGX 5,000,000", min: 5000000, max: Infinity },
];

const RATINGS = [0, 4, 3];

export function ShopGrid() {
  const params = useSearchParams();
  const [category, setCategory] = useState<string>("All");
  const [brands, setBrands] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [priceIdx, setPriceIdx] = useState(0);
  const [minRating, setMinRating] = useState(0);
  // Render in pages — showing all ~180 products at once fires hundreds of image
  // requests and makes the page crawl on mobile data.
  const PAGE = 36;
  const [page, setPage] = useState(1);
  // Anchor for paging: scroll back to the TOP OF THE GRID, not the whole page —
  // this grid is also embedded mid-way down the home page.
  const topRef = useRef<HTMLDivElement | null>(null);

  // Initialise from URL (?cat= & ?brand= & ?q=).
  useEffect(() => {
    const cat = params.get("cat");
    const br = params.get("brand");
    const q = params.get("q");
    const s = params.get("sort");
    if (cat && (productCategories as readonly string[]).includes(cat)) setCategory(cat);
    if (br) setBrands(br.split(",").filter((b) => BRANDS.includes(b)));
    if (q) setQuery(q);
    if (s === "new" || s === "price-asc" || s === "price-desc" || s === "popular") setSort(s);
  }, [params]);

  const anyFilter =
    category !== "All" || brands.length > 0 || conditions.length > 0 || priceIdx !== 0 || minRating !== 0;
  function clearAll() {
    setCategory("All");
    setBrands([]);
    setConditions([]);
    setPriceIdx(0);
    setMinRating(0);
  }
  function toggleBrand(b: string) {
    setBrands((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  }
  function toggleCondition(c: string) {
    setConditions((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  useEffect(() => {
    setPage(1);
  }, [category, brands, conditions, query, sort, priceIdx, minRating]);

  // Pagination (Jumia-style): the shopper chooses the page — nothing auto-loads.

  const filtered = useMemo(() => {
    const band = PRICE_BANDS[priceIdx];
    let list = products.filter((p) => (category === "All" ? true : p.category === category));
    if (brands.length) list = list.filter((p) => brands.includes(p.brand));
    if (conditions.length) list = list.filter((p) => p.condition != null && conditions.includes(p.condition));
    list = list.filter((p) => p.price >= band.min && p.price < band.max);
    if (minRating > 0) list = list.filter((p) => p.rating >= minRating);
    if (query.trim()) {
      const q = query.toLowerCase();
      // Match the whole product, not just its name — shoppers search for specs
      // like "DIMM", "NVMe", "RTX" or "16GB", not only model names.
      list = list.filter((p) =>
        [p.name, p.brand, p.category, p.condition ?? "", ...(p.specs ?? []), ...Object.values(p.details ?? {})]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "popular") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "new") list = [...list].reverse(); // newest products are appended last

    // When someone searches, follow the direct hits with MORE from the same
    // categories and brands. A search for "ThinkPad" then shows every laptop we
    // stock, so the shopper always has something to browse instead of 2 results.
    if (query.trim() && list.length) {
      const hitIds = new Set(list.map((p) => p.id));
      const cats = new Set(list.map((p) => p.category));
      const brandsHit = new Set(list.map((p) => p.brand));
      const related = products
        .filter((p) => !hitIds.has(p.id) && (cats.has(p.category) || brandsHit.has(p.brand)))
        // same-category first, then same-brand, best rated within each
        .sort(
          (a, b) =>
            Number(cats.has(b.category)) - Number(cats.has(a.category)) ||
            (b.rating ?? 0) - (a.rating ?? 0),
        );
      return [...list, ...related];
    }
    return list;
  }, [category, brands, conditions, query, sort, priceIdx, minRating]);

  // Page slice + the page numbers to render (with … for long lists).
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * PAGE, current * PAGE);
  const go = (n: number) => {
    setPage(Math.min(Math.max(1, n), totalPages));
    // Bring the shopper to the first product of the new page, not the page top.
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const pageNumbers: (number | "…")[] = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const out: (number | "…")[] = [1];
    const from = Math.max(2, current - 1);
    const to = Math.min(totalPages - 1, current + 1);
    if (from > 2) out.push("…");
    for (let i = from; i <= to; i++) out.push(i);
    if (to < totalPages - 1) out.push("…");
    out.push(totalPages);
    return out;
  })();

  // How many of the results are direct matches (the rest are "related").
  const exactCount = useMemo(() => {
    if (!query.trim()) return filtered.length;
    const q = query.toLowerCase();
    return filtered.filter((p) =>
      [p.name, p.brand, p.category, p.condition ?? "", ...(p.specs ?? []), ...Object.values(p.details ?? {})]
        .join(" ")
        .toLowerCase()
        .includes(q),
    ).length;
  }, [filtered, query]);

  return (
    <div ref={topRef} className="scroll-mt-24 grid gap-3 lg:grid-cols-[210px_1fr]">
      {/* Mobile filter toggle */}
      <button
        onClick={() => setShowFilters((v) => !v)}
        className="flex items-center justify-between rounded bg-white p-3 text-sm font-bold text-ink-700 shadow-sm lg:hidden"
      >
        <span className="flex items-center gap-2">
          Filters
          {(category !== "All" || brands.length > 0) && (
            <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[11px] font-semibold text-brand-700">
              {[category !== "All" ? category : null, brands.length ? `${brands.length} brand${brands.length > 1 ? "s" : ""}` : null]
                .filter(Boolean)
                .join(" · ")}
            </span>
          )}
        </span>
        <span className="text-brand-600">{showFilters ? "Hide ▲" : "Show ▼"}</span>
      </button>

      {/* Mobile category chips — quick top-to-bottom categories as a scrolling row */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar lg:hidden">
        {(productCategories as readonly string[]).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              category === c ? "bg-brand-500 text-white shadow" : "bg-white text-ink-700 shadow-sm hover:bg-brand-50"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Sidebar filters — sticky so the column isn't a big empty space */}
      <aside className={`h-fit rounded bg-white p-4 shadow-sm lg:sticky lg:top-4 lg:block lg:self-start ${showFilters ? "block" : "hidden"}`}>
        {/* Category — Amazon-style drill-down */}
        <p className="text-sm font-bold text-ink-900">Category</p>
        <div className="mt-1.5 flex flex-col text-sm">
          {category === "All" ? (
            productCategories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className="py-1 text-left text-ink-700 transition hover:text-brand-600"
              >
                {c}
              </button>
            ))
          ) : (
            <>
              <button
                onClick={() => setCategory("All")}
                className="flex items-center gap-1 py-1 text-left text-ink-700/70 transition hover:text-brand-600"
              >
                <span className="text-base leading-none">‹</span> All Categories
              </button>
              <span className="py-1 pl-2 font-bold text-ink-900">{category}</span>
            </>
          )}
        </div>

        {/* Brands — checkboxes (multi-select) */}
        <p className="mt-5 text-sm font-bold text-ink-900">Brands</p>
        <div className="mt-1.5 flex flex-col gap-0.5 text-sm">
          {BRANDS.map((b) => (
            <label
              key={b}
              className="flex cursor-pointer items-center gap-2 py-0.5 text-ink-800 hover:text-brand-600"
            >
              <input
                type="checkbox"
                checked={brands.includes(b)}
                onChange={() => toggleBrand(b)}
                className="h-4 w-4 shrink-0 rounded border-ink-600/40 accent-brand-500"
              />
              {b}
            </label>
          ))}
        </div>

        {/* Condition */}
        {CONDITIONS.length > 0 && (
          <>
            <p className="mt-5 text-sm font-bold text-ink-900">Condition</p>
            <div className="mt-1.5 flex flex-col gap-0.5 text-sm">
              {CONDITIONS.map((c) => (
                <label key={c} className="flex cursor-pointer items-center gap-2 py-0.5 text-ink-800 hover:text-brand-600">
                  <input
                    type="checkbox"
                    checked={conditions.includes(c)}
                    onChange={() => toggleCondition(c)}
                    className="h-4 w-4 shrink-0 rounded border-ink-600/40 accent-brand-500"
                  />
                  {c}
                </label>
              ))}
            </div>
          </>
        )}

        {/* Price */}
        <p className="mt-5 text-sm font-bold text-ink-900">
          Price{category !== "All" ? ` ${category}` : ""}
        </p>
        <div className="mt-1.5 flex flex-col text-sm">
          {PRICE_BANDS.map((b, i) => (
            <button
              key={b.label}
              onClick={() => setPriceIdx(i)}
              className={`py-1 text-left transition ${
                priceIdx === i ? "font-bold text-ink-900" : "text-ink-700 hover:text-brand-600"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Customer review */}
        <p className="mt-5 text-sm font-bold text-ink-900">Customer Review</p>
        <div className="mt-1.5 flex flex-col text-sm">
          {RATINGS.map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={`flex items-center gap-1 py-1 text-left transition ${
                minRating === r ? "font-bold text-ink-900" : "text-ink-700 hover:text-brand-600"
              }`}
            >
              {r === 0 ? (
                "All ratings"
              ) : (
                <>
                  <span className="text-brand-500">{"★".repeat(r)}<span className="text-ink-600/25">{"★".repeat(5 - r)}</span></span>
                  <span className="text-xs text-ink-700/60">&amp; Up</span>
                </>
              )}
            </button>
          ))}
        </div>

        {anyFilter && (
          <button onClick={clearAll} className="mt-5 text-sm font-semibold text-brand-600 hover:underline">
            Clear all filters
          </button>
        )}
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
              <option value="new">Newest arrivals</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
        </div>

        {filtered.length > 0 ? (
          // Flat cards directly on the page — full-bleed to the screen edges on
          // mobile, no panel, no borders, just whitespace.
          <>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {pageItems.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {totalPages > 1 && (
              <nav className="mt-6 flex flex-wrap items-center justify-center gap-1.5 py-2" aria-label="Pagination">
                <button
                  onClick={() => go(page - 1)}
                  disabled={page === 1}
                  className="rounded-md border border-ink-600/15 bg-white px-3 py-2 text-sm font-semibold text-ink-700 transition hover:border-brand-400 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ‹ Prev
                </button>
                {pageNumbers.map((n, i) =>
                  n === "…" ? (
                    <span key={`gap-${i}`} className="px-1.5 text-sm text-ink-700/40">
                      …
                    </span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => go(n as number)}
                      aria-current={n === page ? "page" : undefined}
                      className={`min-w-9 rounded-md px-3 py-2 text-sm font-bold transition ${
                        n === page
                          ? "bg-brand-500 text-white shadow-sm"
                          : "border border-ink-600/15 bg-white text-ink-700 hover:border-brand-400 hover:text-brand-600"
                      }`}
                    >
                      {n}
                    </button>
                  ),
                )}
                <button
                  onClick={() => go(page + 1)}
                  disabled={page === totalPages}
                  className="rounded-md border border-ink-600/15 bg-white px-3 py-2 text-sm font-semibold text-ink-700 transition hover:border-brand-400 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next ›
                </button>
              </nav>
            )}
          </>
        ) : (
          <div className="rounded bg-white p-12 text-center text-ink-700/60 shadow-sm">
            No products match your search.
          </div>
        )}
      </div>
    </div>
  );
}
