"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { products as seedProducts, productCategories, type Product } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { SidebarExtras } from "@/components/sidebar-extras";
import { EmptyState } from "@/components/empty-state";

type Sort = "popular" | "price-asc" | "price-desc" | "new";

// Product conditions in a sensible order (only those that actually exist).
const CONDITION_ORDER = ["Brand New", "UK Used", "Refurbished", "Premium Repack"];

const PRICE_BANDS: { label: string; min: number; max: number }[] = [
  { label: "All prices", min: 0, max: Infinity },
  { label: "Under UGX 100,000", min: 0, max: 100000 },
  { label: "UGX 100,000 – 500,000", min: 100000, max: 500000 },
  { label: "UGX 500,000 – 2,000,000", min: 500000, max: 2000000 },
  { label: "UGX 2,000,000 – 5,000,000", min: 2000000, max: 5000000 },
  { label: "Over UGX 5,000,000", min: 5000000, max: Infinity },
];

const RATINGS = [0, 4, 3];

export function ShopGrid({ items }: { items?: Product[] }) {
  const products = items?.length ? items : seedProducts;
  const params = useSearchParams();

  // Filters are built from what is actually on sale, so a brand that sells out
  // stops being offered as a filter on its own.
  const BRANDS = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    [products],
  );
  const CONDITIONS = useMemo(
    () => CONDITION_ORDER.filter((c) => products.some((p) => p.condition === c)),
    [products],
  );
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
  const [shown, setShown] = useState(PAGE);
  // Sentinel at the end of the grid: when it scrolls into view we reveal the
  // next batch, so the catalogue just keeps going.
  const sentinelRef = useRef<HTMLDivElement | null>(null);

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
    setShown(PAGE);
  }, [category, brands, conditions, query, sort, priceIdx, minRating]);

  // Infinite scroll — reveal the next batch as the shopper reaches the end.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setShown((n) => n + PAGE);
      },
      { rootMargin: "600px 0px" }, // start loading before it is actually visible
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown, PAGE]);

  const filtered = useMemo(() => {
    const band = PRICE_BANDS[priceIdx];
    // Anything out of stock is left out of the listing entirely rather than
    // shown greyed with a badge. A shop that fills its shelves with things it
    // cannot sell reads as a shop with nothing in it — and the handsets we
    // have no photograph of are exactly the ones we do not want leading the
    // Phones page. The product page still answers on a direct link, so an
    // existing link or search result never dead-ends.
    let list = products
      .filter((p) => p.inStock !== false)
      .filter((p) => (category === "All" ? true : p.category === category));
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
  }, [products, category, brands, conditions, query, sort, priceIdx, minRating]);

  const pageItems = filtered.slice(0, shown);

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
    <div className="grid gap-3 lg:grid-cols-[210px_1fr]">
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

      {/* Mobile category chips — a scrolling row that sticks to the top, so a
          long grid can be re-filtered without scrolling back up for it. */}
      <div className="sticky top-0 z-20 -mx-1 flex gap-2 overflow-x-auto bg-[#e6e8ef]/95 px-1 py-2 no-scrollbar backdrop-blur lg:hidden">
        {(productCategories as readonly string[]).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              category === c ? "bg-brand-500 text-white shadow" : "bg-white text-ink-700 shadow-sm hover:bg-brand-50"
            }`}
          >
            {c}
            <span className={category === c ? "ml-1 text-white/70" : "ml-1 text-ink-700/45"}>
              {c === "All" ? products.length : products.filter((p) => p.category === c).length}
            </span>
          </button>
        ))}
      </div>

      {/* Sidebar filters — sticky so the column isn't a big empty space */}
      <div className={`h-fit lg:sticky lg:top-4 lg:block lg:self-start ${showFilters ? "block" : "hidden lg:block"}`}>
      <aside className="rounded bg-white p-4 shadow-sm">
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
      <SidebarExtras />
      </div>

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
          // White cards on a warm cream panel, as on the reference grid.
          <>
            <div className="grid-cards gap-2 rounded-lg bg-[#fdf3ec] p-2">
              {pageItems.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {shown < filtered.length && (
              <div ref={sentinelRef} className="mt-5 flex flex-col items-center gap-2 py-4">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                <p className="text-xs text-ink-700/50">Loading more products…</p>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            art="search"
            title="No products match your search"
            message="Try a different word, or clear a filter or two to see more."
            actionLabel="Browse everything"
            actionHref="/shop"
          />
        )}
      </div>
    </div>
  );
}
