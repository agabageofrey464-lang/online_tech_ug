"use client";

import { useEffect } from "react";
import { listedProducts as products } from "@/lib/data";
import { useRecentlyViewed } from "@/lib/recently-viewed";
import { ProductCard } from "@/components/product-card";

/** Drop this on a product detail page to record the view. Renders nothing. */
export function RecentlyViewedTracker({ slug }: { slug: string }) {
  const { track } = useRecentlyViewed();
  useEffect(() => {
    track(slug);
  }, [slug, track]);
  return null;
}

/** "Your recently viewed items" carousel. Hidden until there's something to show. */
export function RecentlyViewed({
  exclude,
  title = "Your recently viewed items",
}: {
  exclude?: string;
  title?: string;
}) {
  const { slugs } = useRecentlyViewed();
  const items = slugs
    .filter((s) => s !== exclude)
    .map((s) => products.find((p) => p.id === s))
    .filter(Boolean) as typeof products;

  if (items.length === 0) return null;

  return (
    <section className="overflow-hidden rounded bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-base font-extrabold text-ink-900">{title}</h2>
      </div>
      <div className="flex snap-x gap-2.5 overflow-x-auto p-3 no-scrollbar">
        {items.map((p) => (
          <div key={p.id} className="w-[47%] shrink-0 snap-start sm:w-1/4 lg:w-1/6">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
