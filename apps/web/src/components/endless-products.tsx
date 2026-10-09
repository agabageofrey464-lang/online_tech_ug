"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/data";
import { byGroup, groupHref, groupOf, groupTitle } from "@/lib/browse-order";

/**
 * The whole catalogue, category by category, arriving as you scroll.
 *
 * The home page ended in a fixed grid and a "See all" button, so seeing the
 * rest of the shop meant leaving the page. Here the first products arrive
 * with the page, and each time the reader nears the end the next batch is
 * added — no button, no new page. They come in their categories, each under
 * its own heading, so scrolling past the laptops brings the desktops, then
 * the components, and so on until everything in stock has been shown.
 *
 * The rest of the catalogue is fetched once, the first time it is needed,
 * from the same feed the search box uses; nothing extra is downloaded by a
 * visitor who never scrolls this far.
 */

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

const BATCH = 12;
const LEADS = ["Lenovo", "HP", "Dell"];


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

export function EndlessProducts({
  initial,
  total,
  counts,
}: {
  initial: Product[];
  total: number;
  /** How many products each category has in stock, for its heading. */
  counts: Record<string, number>;
}) {
  const [items, setItems] = useState<Product[]>(initial);
  const [done, setDone] = useState(initial.length >= total);
  const [failed, setFailed] = useState(false);
  const rest = useRef<Product[] | null>(null);
  const loading = useRef(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || done || typeof IntersectionObserver === "undefined") return;

    async function more() {
      if (loading.current) return;
      loading.current = true;
      try {
        if (rest.current === null) {
          const res = await fetch("/api/browse");
          if (!res.ok) throw new Error(String(res.status));
          const data = await res.json();
          const feed: FeedItem[] = Array.isArray(data) ? data : (data.items ?? []);
          // In stock only, in the same category order the page began in, less
          // what is already on screen.
          const shown = new Set(initial.map((p) => p.id));
          rest.current = byGroup(feed.filter((p) => p.in_stock)).filter((p) => !shown.has(p.slug)).map(toProduct);
        }
        const next = rest.current.splice(0, BATCH);
        if (next.length) setItems((list) => [...list, ...next]);
        if (rest.current.length === 0) setDone(true);
      } catch {
        setFailed(true);
        setDone(true);
      } finally {
        loading.current = false;
      }
    }

    // Start fetching well before the end is on screen, so the grid has grown
    // by the time the reader gets there.
    const io = new IntersectionObserver((entries) => entries[0]?.isIntersecting && void more(), { rootMargin: "1400px 0px" });
    io.observe(el);
    return () => io.disconnect();
    // `items.length` re-arms the observer after each batch, in case the
    // sentinel is still within reach once the new cards are in.
  }, [done, initial, items.length]);

  // Consecutive products of one group — a lead brand, or a category — become
  // one section.
  const sections: { category: string; items: Product[] }[] = [];
  for (const p of items) {
    const group = groupOf(p);
    const last = sections[sections.length - 1];
    if (last && last.category === group) last.items.push(p);
    else sections.push({ category: group, items: [p] });
  }

  return (
    <>
      {sections.map((sec) => (
        <section key={sec.category} aria-label={sec.category} className="bg-[#f3efe9]">
          <div className="flex items-center justify-between gap-2 px-3 pb-1 pt-4 sm:px-4">
            <h3 className="flex items-center gap-2 font-display text-lg font-black text-ink-900 sm:text-xl">
              <span className="h-5 w-1.5 rounded-full bg-brand-500" />
              {groupTitle(sec.category)}
              {counts[sec.category] ? (
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-ink-700/70 ring-1 ring-ink-600/10">
                  {counts[sec.category]}
                </span>
              ) : null}
            </h3>
            <Link
              href={groupHref(sec.category)}
              className="shrink-0 text-xs font-bold text-brand-600 hover:underline sm:text-sm"
            >
              All {LEADS.includes(sec.category) ? sec.category : sec.category.toLowerCase()} →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 p-2 sm:gap-3 sm:p-3">
            {sec.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ))}

      <div ref={sentinel} className="bg-[#f3efe9] px-3 pb-4 pt-1 text-center">
        {!done ? (
          <p className="flex items-center justify-center gap-2 py-3 text-xs font-semibold text-ink-700/60">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            Loading more products…
          </p>
        ) : (
          <>
            <p className="py-2 text-xs font-semibold text-ink-700/60">
              {failed ? "Couldn't load more just now." : `That's all ${items.length} products in stock.`}
            </p>
            <Link
              href="/shop"
              className="press inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-600"
            >
              {failed ? "Open the shop →" : "Search and filter in the shop →"}
            </Link>
          </>
        )}
      </div>
    </>
  );
}
