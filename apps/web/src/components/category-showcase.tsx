"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/data";

/**
 * "Find what you need" — a centred heading, a search, two tabs, and a grid of
 * square picture tiles: by category, or by brand.
 *
 * The search answers in the row itself. As a name is typed, the tiles give
 * way to the products that match — the same cards the rest of the shop uses,
 * in the same sliding row — so what is found sits exactly where the range
 * was, and the products further down the page are more of the same thing.
 * Clear the box and the categories come back.
 */
export type ShowcaseTile = { name: string; href: string; img: string; blurb: string };

type FeedItem = {
  slug: string;
  name: string;
  category: Product["category"];
  brand: string;
  condition: Product["condition"];
  price_ugx: number;
  old_price_ugx: number | null;
  rating: number;
  in_stock: boolean;
  image_url: string;
  description: string;
  specs: Product["details"] | null;
  seller?: string | null;
};

const toProduct = (p: FeedItem): Product => ({
  id: p.slug,
  name: p.name,
  category: p.category,
  brand: p.brand,
  condition: p.condition,
  price: p.price_ugx,
  oldPrice: p.old_price_ugx ?? undefined,
  rating: p.rating,
  inStock: p.in_stock,
  image: p.image_url,
  specs: p.description ? p.description.split(", ") : [],
  details: p.specs ?? undefined,
  seller: p.seller ?? undefined,
});

// Fetched once, the first time the box is used, and filtered in the browser.
let catalogue: Promise<Product[]> | null = null;
const loadCatalogue = () =>
  (catalogue ??= fetch("/api/browse")
    .then((r) => (r.ok ? r.json() : { items: [] }))
    .then((d) => ((Array.isArray(d) ? d : (d.items ?? [])) as FeedItem[]).filter((p) => p.in_stock).map(toProduct))
    .catch(() => []));

/** What people most often come looking for. A tap searches for it. */
const POPULAR = ["iPhone", "Samsung", "HP laptop", "Lenovo", "MacBook", "SSD", "Laptop skin", "Router"];
const SHOWN = 12;

export function CategoryShowcase({ categories, brands }: { categories: ShowcaseTile[]; brands: ShowcaseTile[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"category" | "brand">("category");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Product[] | null>(null);
  const tiles = tab === "category" ? categories : brands;

  const term = q.trim().toLowerCase();
  const searching = term.length >= 2;
  const found = useMemo(() => {
    if (!searching || !items) return [];
    const words = term.split(/\s+/);
    const hits = items.filter((p) => {
      const text = `${p.name} ${p.brand} ${p.category} ${p.specs.join(" ")}`.toLowerCase();
      return words.every((w) => text.includes(w));
    });
    // Names that begin with what was typed come first, then the better rated.
    return hits.sort((a, b) => Number(b.name.toLowerCase().startsWith(term)) - Number(a.name.toLowerCase().startsWith(term)) || b.rating - a.rating);
  }, [items, searching, term]);

  const warm = () => void loadCatalogue().then(setItems);
  const all = `/shop?q=${encodeURIComponent(q.trim())}`;

  return (
    <section aria-label="Find a product, or shop by category or brand" className="flex flex-col py-6 sm:py-8">
      {/* The range comes first, straight under the band; the search follows it.
          Once something is typed, the search and what it found take the top. */}
      <div className={`mx-auto w-full max-w-2xl px-2 text-center ${searching ? "" : "order-2 mt-12"}`}>
        <h2 className="text-[28px] leading-tight text-ink-900 sm:text-[36px]">Find What You Need</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-700/80">
          Laptops, phones and everything that goes with them — tested, warranted and delivered countrywide.
        </p>

        {/* The search: square and plain like the rest of the shop, with the
            one orange thing on it being what you press. */}
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (term) router.push(all);
          }}
          className="mt-5 flex items-stretch border border-ink-900 bg-white text-left shadow-[0_10px_30px_-18px_rgba(22,21,29,0.55)] focus-within:ring-2 focus-within:ring-brand-500/40"
        >
          <Search size={20} strokeWidth={1.6} className="ml-4 shrink-0 self-center text-ink-700/60" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              warm();
            }}
            onFocus={warm}
            placeholder="Search a product, brand or model…"
            aria-label="Search the shop"
            autoComplete="off"
            enterKeyHint="search"
            className="min-w-0 flex-1 bg-transparent px-3 py-4 text-[16px] text-ink-900 !shadow-none !outline-none !ring-0 placeholder:text-ink-700/45"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Clear the search" className="shrink-0 self-center p-2 text-ink-700/60 hover:text-ink-900">
              <X size={18} />
            </button>
          )}
          <button
            type="submit"
            className="shrink-0 bg-brand-500 px-5 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-brand-600 sm:px-8"
          >
            Search
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2 text-[13px]">
          <span className="mr-1 font-display italic text-ink-700/70">Popular:</span>
          {POPULAR.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setQ(p);
                warm();
              }}
              aria-pressed={term === p.toLowerCase()}
              className={`border px-3 py-1.5 transition ${
                term === p.toLowerCase() ? "border-ink-900 bg-ink-800 text-white" : "border-ink-700/20 bg-white text-ink-800 hover:border-ink-900"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

      </div>

      {searching ? (
        <div className="mt-6" aria-live="polite">
          <div className="flex flex-wrap items-baseline justify-between gap-2 px-1">
            <p className="font-display text-[20px] text-ink-900">
              {items === null
                ? "Looking…"
                : found.length === 0
                  ? `Nothing matches “${q.trim()}”`
                  : `${found.length} product${found.length === 1 ? "" : "s"} for “${q.trim()}”`}
            </p>
            {found.length > 0 && (
              <Link href={all} className="text-[13px] font-bold uppercase tracking-[0.1em] text-ink-800 underline-offset-4 hover:text-brand-600 hover:underline">
                See all in the shop →
              </Link>
            )}
          </div>

          {items !== null && found.length === 0 ? (
            <p className="mt-3 bg-white px-5 py-6 text-center text-[14px] text-ink-700/85">
              Try a brand or the kind of thing — “HP”, “charger”, “1TB”. Or{" "}
              <Link href="/find" className="font-bold text-brand-600 hover:underline">
                tell us your budget
              </Link>{" "}
              and we will find it for you.
            </p>
          ) : (
            <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-3 no-scrollbar">
              {found.slice(0, SHOWN).map((p) => (
                <div key={p.id} className="w-[62%] shrink-0 snap-start sm:w-[36%] lg:w-[calc((100%-2.25rem)/4)]">
                  <ProductCard product={p} />
                </div>
              ))}
              {found.length > SHOWN && (
                <Link
                  href={all}
                  className="flex w-[46%] shrink-0 snap-start flex-col items-center justify-center bg-ink-800 p-6 text-center text-white transition hover:bg-ink-900 sm:w-[24%] lg:w-[16%]"
                >
                  <span className="font-display text-[32px] leading-none">+{found.length - SHOWN}</span>
                  <span className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em]">more in the shop</span>
                </Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="order-1">
          <div className="flex justify-center gap-3">
            {(
              [
                ["category", "Shop By Category"],
                ["brand", "Shop By Brand"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                aria-pressed={tab === value}
                className={`px-5 py-2.5 text-[14px] transition ${
                  tab === value ? "bg-brand-500 font-semibold text-white" : "border border-ink-700/25 bg-white text-ink-800 hover:border-ink-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {/* A grid, not a row to drag: every part of the range in view at once,
              four across on a wide screen and two on a phone. Each is a square
              photograph with its name beneath. A phone shows the first eight. */}
          <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-7 sm:gap-x-6 sm:gap-y-9 lg:grid-cols-4">
            {tiles.map((t, i) => (
              <Link key={t.href} href={t.href} className={`group block ${i >= 8 ? "hidden lg:block" : ""}`}>
                <div className="relative aspect-square overflow-hidden bg-[var(--tile)]">
                  <SafeImage
                    src={t.img}
                    alt={t.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <h3 className="mt-3.5 text-center font-sans text-[11.5px] font-semibold uppercase tracking-[0.2em] text-ink-900 group-hover:text-brand-600 sm:text-[12.5px]">
                  {t.name} <span aria-hidden>›</span>
                </h3>
              </Link>
            ))}
          </div>
          {tiles.length > 8 && (
            <p className="mt-6 text-center lg:hidden">
              <Link href="/shop" className="text-[12px] font-bold uppercase tracking-[0.16em] text-ink-900 underline underline-offset-4">
                See everything in the shop ›
              </Link>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
