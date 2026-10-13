"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
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

/** One drop-down in the row above the products: a bordered button and its list. */
function Menu({ label, count = 0, children }: { label: string; count?: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex items-center gap-3 border bg-white px-5 py-3.5 text-[15px] text-ink-900 transition hover:border-ink-900 ${open ? "border-ink-900" : "border-ink-700/25"}`}
      >
        {label}
        {count > 0 && <span className="text-ink-700/70">({count})</span>}
        <ChevronDown size={17} strokeWidth={1.75} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 flex max-h-80 w-72 flex-col gap-3.5 overflow-y-auto border border-ink-700/20 bg-white p-5 text-[14px] text-ink-800 shadow-xl">
          {children}
        </div>
      )}
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

/**
 * `home` is the same listing as the front of the home page: the first rows
 * only, and a link on to the shop where the rest is.
 */
export function ShopGrid({ items, home = false }: { items?: Product[]; home?: boolean }) {
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
  // Every filter at once, in a panel that slides in from the left.
  const [showFilters, setShowFilters] = useState(false);
  const [priceIdx, setPriceIdx] = useState(0);
  // ?deals=1 — only products reduced from a recorded old price. The link said
  // "deals" for a long time while the page showed the whole catalogue.
  const [onlyDeals, setOnlyDeals] = useState(false);
  // Render in pages — showing all ~200 products at once fires hundreds of image
  // requests and makes the page crawl on mobile data. Sixty at a time, though:
  // at thirty-six a shopper on a wide screen reached "Loading more products…"
  // after six rows and read the shop as a small one.
  const PAGE = home ? 12 : 24;
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
    setCategory(cat && (productCategories as readonly string[]).includes(cat) ? cat : "All");
    if (br) setBrands(br.split(",").filter((b) => BRANDS.includes(b)));
    if (q) setQuery(q);
    setOnlyDeals(params.get("deals") === "1" || params.get("deals") === "true");
    if (s === "new" || s === "price-asc" || s === "price-desc" || s === "popular") setSort(s);
  }, [params]);

  // The heading and the rail above read the address, so a filter changed here
  // is written to it and the page's name follows the choice.
  const router = useRouter();
  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(window.location.search);
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `/shop?${qs}` : "/shop", { scroll: false });
  }
  function pickCategory(c: string) {
    setCategory(c);
    setParam("cat", c === "All" ? null : c);
  }
  function pickSort(v: Sort) {
    setSort(v);
    setParam("sort", v === "popular" ? null : v);
  }
  function toggleDeals() {
    setParam("deals", onlyDeals ? null : "1");
    setOnlyDeals((v) => !v);
  }

  const anyFilter =
    category !== "All" || brands.length > 0 || conditions.length > 0 || priceIdx !== 0 || onlyDeals || query.trim() !== "";
  function clearAll() {
    setCategory("All");
    setBrands([]);
    setConditions([]);
    setPriceIdx(0);
    setOnlyDeals(false);
    setQuery("");
    setSort("popular");
    router.replace("/shop", { scroll: false });
  }
  function toggleBrand(b: string) {
    const next = brands.includes(b) ? brands.filter((x) => x !== b) : [...brands, b];
    setBrands(next);
    setParam("brand", next.length ? next.join(",") : null);
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

  const count = (c: string) => (c === "All" ? products.length : products.filter((p) => p.category === c).length);
  const SORTS: [Sort, string][] = [
    ["popular", "Best Matches"],
    ["price-asc", "Price: Low to High"],
    ["price-desc", "Price: High to Low"],
    ["new", "Newest"],
  ];

  // The lists themselves, drawn once and used twice: in the row of drop-downs
  // on a wide screen, and in the panel that holds every filter.
  const categoryOptions = (productCategories as readonly string[]).map((c) => (
    <Option key={c} checked={category === c} onChange={() => pickCategory(c)}>
      <span className="flex-1">{c === "All" ? "All Categories" : c}</span>
      <span className="text-[12px] text-ink-700/45">{count(c)}</span>
    </Option>
  ));
  const brandOptions = BRANDS.map((b) => (
    <Option key={b} square checked={brands.includes(b)} onChange={() => toggleBrand(b)}>
      {b}
    </Option>
  ));
  const conditionOptions = CONDITIONS.map((c) => (
    <Option key={c} square checked={conditions.includes(c)} onChange={() => toggleCondition(c)}>
      {c}
    </Option>
  ));
  const priceOptions = PRICE_BANDS.map((b, i) => (
    <Option key={b.label} checked={priceIdx === i} onChange={() => setPriceIdx(i)}>
      {b.label}
    </Option>
  ));

  // What is switched on, each as a chip that switches it off again.
  const chips: { label: string; off: () => void }[] = [
    ...(category !== "All" ? [{ label: category, off: () => pickCategory("All") }] : []),
    ...brands.map((b) => ({ label: b, off: () => toggleBrand(b) })),
    ...conditions.map((c) => ({ label: c, off: () => toggleCondition(c) })),
    ...(priceIdx !== 0 ? [{ label: PRICE_BANDS[priceIdx].label, off: () => setPriceIdx(0) }] : []),
    ...(onlyDeals ? [{ label: "Reduced prices", off: toggleDeals }] : []),
    ...(query.trim() ? [{ label: `“${query.trim()}”`, off: () => { setQuery(""); setParam("q", null); } }] : []),
  ];

  return (
    <div>
      {/* The row above the products: every filter, then how many and in what order. */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShowFilters(true)}
          className="flex items-center gap-3 border border-ink-700/25 bg-white px-5 py-3.5 text-[15px] text-ink-900 transition hover:border-ink-900"
        >
          Filters{activeCount > 0 && <span className="text-ink-700/70">({activeCount})</span>}
          <SlidersHorizontal size={18} strokeWidth={1.75} />
        </button>
        <div className="hidden flex-wrap items-center gap-3 lg:flex">
          <Menu label="Category" count={category !== "All" ? 1 : 0}>{categoryOptions}</Menu>
          <Menu label="Brand" count={brands.length}>{brandOptions}</Menu>
          {CONDITIONS.length > 0 && <Menu label="Condition" count={conditions.length}>{conditionOptions}</Menu>}
          <Menu label="Price" count={priceIdx !== 0 ? 1 : 0}>{priceOptions}</Menu>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <span className="hidden text-[15px] text-ink-800 sm:inline">
            {filtered.length} {filtered.length === 1 ? "Result" : "Results"}
          </span>
          <span className="hidden h-5 w-px bg-ink-700/25 sm:block" aria-hidden />
          <label className="flex items-center gap-3 text-[15px] text-ink-800">
            <span className="hidden sm:inline">Sort By</span>
            <select
              value={sort}
              onChange={(e) => pickSort(e.target.value as Sort)}
              aria-label="Sort products by"
              className="border border-ink-700/25 bg-white py-3.5 pl-4 pr-9 text-[15px] text-ink-900 hover:border-ink-900 focus:border-ink-900 focus:outline-none"
            >
              {SORTS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* What is switched on, and the way to switch it all off. */}
      <div className="mb-5 mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-[14px] text-ink-800 sm:hidden">
          {filtered.length} {filtered.length === 1 ? "Result" : "Results"}
        </span>
        {chips.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={c.off}
            className="flex items-center gap-2 rounded-full bg-[#e9e6df] px-4 py-2 text-[13.5px] tracking-[0.04em] text-ink-900 hover:bg-[#dedad1]"
          >
            {c.label}
            <X size={13} strokeWidth={2} aria-label="Remove" />
          </button>
        ))}
        {anyFilter && (
          <button type="button" onClick={clearAll} className="ml-1 text-[14px] text-ink-900 underline underline-offset-4 hover:text-brand-600">
            Clear Filters
          </button>
        )}
      </div>

      {/* Every filter in one panel, from the left. */}
      {showFilters &&
        createPortal(
          <div className="fixed inset-0 z-[150]" role="dialog" aria-modal="true" aria-label="Filter and sort">
            <button type="button" aria-label="Close filters" onClick={() => setShowFilters(false)} className="absolute inset-0 h-full w-full cursor-default bg-ink-900/50" />
            <aside className="absolute left-0 top-0 flex h-full w-[22rem] max-w-[88vw] flex-col bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-ink-600/10 px-5 py-4">
                <span className="font-display text-[24px] leading-none text-ink-900">Filter &amp; Sort</span>
                <button type="button" onClick={() => setShowFilters(false)} aria-label="Close filters" className="flex h-10 w-10 items-center justify-center text-ink-900 hover:text-brand-600">
                  <X size={22} strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="border-b border-ink-600/10 px-5 py-4">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products…"
                    className="w-full border border-ink-700/25 bg-white px-4 py-3 text-[15px] placeholder:text-ink-700/45 focus:border-ink-900 focus:outline-none"
                  />
                </div>
                <Section title="Sort By" defaultOpen>
                  {SORTS.map(([value, label]) => (
                    <Option key={value} checked={sort === value} onChange={() => pickSort(value)}>
                      {label}
                    </Option>
                  ))}
                </Section>
                <Section title="Category" defaultOpen>
                  {categoryOptions}
                </Section>
                <Section title="Brand">{brandOptions}</Section>
                {CONDITIONS.length > 0 && <Section title="Condition">{conditionOptions}</Section>}
                <Section title="Price">{priceOptions}</Section>
                <Section title="Offers" defaultOpen>
                  <Option square checked={onlyDeals} onChange={toggleDeals}>
                    Reduced prices only
                  </Option>
                </Section>
              </div>
              <div className="flex items-center gap-3 border-t border-ink-600/10 px-5 py-4">
                {anyFilter && (
                  <button type="button" onClick={clearAll} className="text-[13px] text-ink-900 underline underline-offset-4 hover:text-brand-600">
                    Clear Filters
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="ml-auto bg-brand-500 px-6 py-3.5 text-[12px] font-bold uppercase tracking-[0.14em] text-white hover:bg-brand-600"
                >
                  Show {filtered.length} {filtered.length === 1 ? "result" : "results"}
                </button>
              </div>
            </aside>
          </div>,
          document.body,
        )}

      {/* Results */}
      {filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-x-2 gap-y-5 sm:gap-x-4 sm:gap-y-8 md:grid-cols-3 lg:gap-x-8 lg:gap-y-12 min-[1900px]:grid-cols-4">
            {pageItems.map((p) => (
              <ProductCard key={p.id} product={p} large />
            ))}
          </div>
          {shown < filtered.length && (
            // A page of twenty-four, and a button for the next. The grid used
            // to keep loading as it was scrolled, sixty at a time.
            <div className="mt-8 flex flex-col items-center gap-3 py-4">
              <p className="text-[13px] text-ink-700/70">
                Showing {pageItems.length} of {filtered.length} products
              </p>
              {home ? (
                <Link
                  href="/shop"
                  className="bg-brand-500 px-10 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-brand-600"
                >
                  See everything in the shop ›
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setShown((n) => n + PAGE)}
                  className="border border-ink-900 px-10 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-ink-900 transition hover:bg-ink-600 hover:text-white"
                >
                  Show more
                </button>
              )}
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

      {/* What used to fill the filter column: a way to choose, what is
          trending, and the courses and repairs — now a row beneath the products. */}
      {!home && <SidebarExtras />}
    </div>
  );
}
