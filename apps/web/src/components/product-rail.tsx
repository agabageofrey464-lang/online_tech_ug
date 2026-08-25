"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/data";

// Horizontal product rail with Jumia-style ‹ › scroll arrows (desktop). On mobile
// it stays swipe-only to keep the cards clean.
export function ProductRail({ items }: { items: Product[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className="group/rail relative">
      {/* items-stretch keeps every card the same height so the row reads level,
         and the wider gap separates the white cards on the coloured band. */}
      <div ref={ref} className="flex snap-x items-stretch gap-3 overflow-x-auto p-4 no-scrollbar sm:gap-4">
        {items.map((p) => (
          <div key={p.id} className="flex w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[16%]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label="Scroll left"
        className="absolute left-1 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink-800 opacity-0 shadow-md ring-1 ring-ink-600/10 transition hover:bg-brand-50 md:flex md:group-hover/rail:opacity-100"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="Scroll right"
        className="absolute right-1 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink-800 opacity-0 shadow-md ring-1 ring-ink-600/10 transition hover:bg-brand-50 md:flex md:group-hover/rail:opacity-100"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
