"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { listedProducts as seedProducts, productCategories, type Product } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { GROUP_ORDER, groupOf } from "@/lib/browse-order";
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

/** One fold-out group in the filter panel: a serif title, a chevron, a rule. */
function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-ink-600/10 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-5 text-left"
      >
        <span className="font-display text-[20px] leading-none text-ink-900">{title}</span>
        <ChevronDown size={20} strokeWidth={1.5} className={`shrink-0 text-ink-900 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="flex flex-col gap-3.5 px-5 pb-6 text-[14px] text-ink-800">{children}</div>}
    </div>
  );
}

/** A round option (one of several) or a square one (any of several). */
function Option({ checked, onChange, square = false, children }: { checked: boolean; onChange: () => void; square?: boolean; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 hover:text-brand-600">
      <input type={square ? "checkbox" : "radio"} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center border border-ink-700/50 bg-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400 ${square ? "rounded-[3px]" : "rounded-full"}`}
      >
        {checked && <span className={`h-2.5 w-2.5 bg-ink-900 ${square ? "rounded-[1px]" : "rounded-full"}`} />}
      </span>
      {children}
    </label>
  );
}

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
  // The panel starts closed on a phone and open on a desktop, and one button
  // flips whichever applies — hence two flags rather than one.
  const [showFilters, setShowFilters] = useState(false);
  const [hideOnDesktop, setHideOnDesktop] = useState(false);
  const [priceIdx, setPriceIdx] = useState(0);
  // ?deals=1 — only products reduced from a recorded old price. The link said
  // "deals" for a long time while the page showed the whole catalogue.
  const [onlyDeals, setOnlyDeals] = useState(false);
  // Render in pages — showing all ~200 products at once fires hundreds of image
  // requests and makes the page crawl on mobile data. Sixty at a time, though:
  // at thirty-six a shopper on a wide screen reached "Loading more products…"
  // after six rows and read the shop as a small one.
  const PAGE = 24;
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
    setOnlyDeals(params.get("deals") === "1" || params.get("deals") === "true");
    if (s === "new" || s === "price-asc" || s === "price-desc" || s === "popular") setSort(s);
  }, [params]);

  const anyFilter =
    category !== "All" || brands.length > 0 || conditions.length > 0 || priceIdx !== 0 || onlyDeals;
  function clearAll() {
    setCategory("All");
    setBrands([]);
    setConditions([]);
    setPriceIdx(0);
    setOnlyDeals(false);
  }
  function toggleBrand(b: string) {
    setBrands((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  }
  function toggleCondition(c: string) {
    setConditions((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  useEffect(() => {
    setShown(PAGE);
  }, [category, brands, conditions, query, sort, priceIdx, onlyDeals]);

  // Infinite scroll — reveal the next batch as the shopper reaches the end.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setShown((n) => n + PAGE);
      },
      { rootMargin: "1600px 0px" }, // the next batch is in place long before the end is on screen
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
    let list = products.filter((p) => (category === "All" ? true : p.category === category));
    if (brands.length) list = list.filter((p) => brands.includes(p.brand));
    if (conditions.length) list = list.filter((p) => p.condition != null && conditions.includes(p.condition));
    list = list.filter((p) => p.price >= band.min && p.price < band.max);
    if (onlyDeals) list = list.filter((p) => p.oldPrice != null && p.oldPrice > p.price);
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
    // Recommended: Lenovo, HP, Dell, then phones, then the rest — best rated
    // first within each.
    if (sort === "popular") {
      const rank = (p: Product) => {
        const i = GROUP_ORDER.indexOf(groupOf(p));
        return i === -1 ? GROUP_ORDER.length : i;
      };
      list = [...list].sort((a, b) => rank(a) - rank(b) || b.rating - a.rating);
    }
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
  }, [products, category, brands, conditions, query, sort, priceIdx, onlyDeals]);

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

  const activeCount =
    (category !== "All" ? 1 : 0) + brands.length + conditions.length + (priceIdx !== 0 ? 1 : 0) + (onlyDeals ? 1 : 0);

  return (
    <div>
      {/* The bar above everything: filter toggle, search, how many products. */}
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 bg-[#f0eeea] px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => {
            setShowFilters((v) => !v);
            setHideOnDesktop((v) => !v);
          }}
          className="flex shrink-0 items-center gap-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-ink-900 hover:text-brand-600"
        >
          <SlidersHorizontal size={20} strokeWidth={1.5} />
          <span className="lg:hidden">{showFilters ? "Hide" : "Show"} filter &amp; sort</span>
          <span className="hidden lg:inline">{hideOnDesktop ? "Show" : "Hide"} filter &amp; sort</span>
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[11px] font-bold tracking-normal text-white">
              {activeCount}
            </span>
          )}
        </button>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="order-3 w-full border-0 border-b border-ink-700/30 bg-transparent px-0 py-1.5 text-sm placeholder:text-ink-700/45 focus:border-brand-500 focus:outline-none sm:order-none sm:ml-auto sm:w-64"
        />
        <span className="ml-auto text-[13px] text-ink-700/80 sm:ml-0">
          {filtered.length} {filtered.length === 1 ? "Product" : "Products"}
        </span>
      </div>

      {/* Mobile category chips — a scrolling row that sticks to the top, so a
          long grid can be re-filtered without scrolling back up for it. */}
      <div className="sticky top-0 z-20 -mx-1 mb-2 flex gap-2 overflow-x-auto bg-[#f9f7f2]/95 px-1 py-2 no-scrollbar backdrop-blur lg:hidden">
        {(productCategories as readonly string[]).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              category === c ? "bg-ink-600 text-white" : "bg-white text-ink-700 hover:bg-brand-50"
            }`}
          >
            {c}
            <span className={category === c ? "ml-1 text-white/70" : "ml-1 text-ink-700/45"}>
              {c === "All" ? products.length : products.filter((p) => p.category === c).length}
            </span>
          </button>
        ))}
      </div>

      <div className={`grid gap-3 ${hideOnDesktop ? "" : "lg:grid-cols-[19rem_1fr]"}`}>
        {/* Filter panel — sticky so the column isn't a big empty space */}
        <div className={`h-fit lg:sticky lg:top-4 lg:self-start ${showFilters ? "block" : "hidden"} ${hideOnDesktop ? "lg:hidden" : "lg:block"}`}>
          <aside className="bg-white">
            <Section title="Sort By" defaultOpen>
              {(
                [
                  ["popular", "Recommended"],
                  ["price-asc", "Price: Low to High"],
                  ["price-desc", "Price: High to Low"],
                  ["new", "Newest"],
                ] as [Sort, string][]
              ).map(([value, label]) => (
                <Option key={value} checked={sort === value} onChange={() => setSort(value)}>
                  {label}
                </Option>
              ))}
            </Section>

            <Section title="Category" defaultOpen>
              {(productCategories as readonly string[]).map((c) => (
                <Option key={c} checked={category === c} onChange={() => setCategory(c)}>
                  <span className="flex-1">{c === "All" ? "All Categories" : c}</span>
                  <span className="text-[12px] text-ink-700/45">
                    {c === "All" ? products.length : products.filter((p) => p.category === c).length}
                  </span>
                </Option>
              ))}
            </Section>

            <Section title="Brand">
              {BRANDS.map((b) => (
                <Option key={b} square checked={brands.includes(b)} onChange={() => toggleBrand(b)}>
                  {b}
                </Option>
              ))}
            </Section>

            {CONDITIONS.length > 0 && (
              <Section title="Condition">
                {CONDITIONS.map((c) => (
                  <Option key={c} square checked={conditions.includes(c)} onChange={() => toggleCondition(c)}>
                    {c}
                  </Option>
                ))}
              </Section>
            )}

            <Section title="Price">
              {PRICE_BANDS.map((b, i) => (
                <Option key={b.label} checked={priceIdx === i} onChange={() => setPriceIdx(i)}>
                  {b.label}
                </Option>
              ))}
            </Section>

            <Section title="Offers" defaultOpen>
              <Option square checked={onlyDeals} onChange={() => setOnlyDeals((v) => !v)}>
                Reduced prices only
              </Option>
            </Section>

            {anyFilter && (
              <div className="border-t border-ink-600/10 px-5 py-4">
                <button onClick={clearAll} className="text-[12px] font-bold uppercase tracking-[0.1em] text-brand-600 hover:underline">
                  Clear all filters
                </button>
              </div>
            )}
          </aside>
          <SidebarExtras />
        </div>

        {/* Results */}
        <div>
          {filtered.length > 0 ? (
            <>
              <div
                className={`grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 ${
                  hideOnDesktop ? "xl:grid-cols-4 min-[1700px]:grid-cols-5" : "min-[1700px]:grid-cols-4"
                }`}
              >
                {pageItems.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {shown < filtered.length && (
                // A page of twenty-four, and a button for the next. The grid used
                // to keep loading as it was scrolled, sixty at a time.
                <div className="mt-8 flex flex-col items-center gap-3 py-4">
                  <p className="text-[13px] text-ink-700/70">
                    Showing {pageItems.length} of {filtered.length} products
                  </p>
                  <button
                    type="button"
                    onClick={() => setShown((n) => n + PAGE)}
                    className="border border-ink-900 px-10 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-ink-900 transition hover:bg-ink-600 hover:text-white"
                  >
                    Show more
                  </button>
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
    </div>
  );
}
