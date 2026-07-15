"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { products, productCategories, productImage } from "@/lib/data";
import { SafeImage } from "@/components/safe-image";
import { ugx } from "@/lib/site";

// Extra browse destinations shown under the product categories.
const MORE: [string, string][] = [
  ["Marketplace", "/marketplace"],
  ["Services", "/services"],
  ["Online Courses", "/learn"],
  ["Sell with us", "/sell"],
  ["Jobs", "/jobs"],
];

export default function CategoriesPage() {
  const [active, setActive] = useState<string>(productCategories[0]);
  const items = products.filter((p) => p.category === active).slice(0, 15);

  return (
    <div className="flex min-h-[75vh] bg-white">
      {/* Left rail — category list */}
      <aside className="w-[104px] shrink-0 overflow-y-auto border-r border-ink-600/10 bg-ink-50/50">
        {productCategories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`flex w-full items-center border-l-[3px] px-2.5 py-4 text-left text-xs font-semibold leading-tight transition ${
              active === c
                ? "border-brand-500 bg-white text-brand-600"
                : "border-transparent text-ink-700 hover:bg-white/60"
            }`}
          >
            {c}
          </button>
        ))}
        <div className="my-1 border-t border-ink-600/10" />
        {MORE.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="block border-l-[3px] border-transparent px-2.5 py-3.5 text-left text-xs font-semibold leading-tight text-ink-700 hover:bg-white/60"
          >
            {label}
          </Link>
        ))}
      </aside>

      {/* Right panel — selected category */}
      <div className="min-w-0 flex-1 p-3">
        <Link
          href="/shop"
          className="flex items-center justify-between rounded-lg border border-ink-600/10 bg-white px-4 py-3 text-sm font-bold text-ink-900 shadow-sm"
        >
          All Products <ChevronRight size={18} className="text-ink-700/50" />
        </Link>

        <div className="mt-3 rounded-lg border border-ink-600/10 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-ink-900">{active}</h2>
            <Link
              href={`/shop?cat=${encodeURIComponent(active)}`}
              className="text-xs font-bold text-brand-600 hover:underline"
            >
              See All
            </Link>
          </div>

          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-700/50">Nothing here yet.</p>
          ) : (
            <div className="mt-3 grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4 lg:grid-cols-6">
              {items.map((p) => (
                <Link key={p.id} href={`/shop/${p.id}`} className="group flex flex-col rounded-lg p-1 text-center transition duration-200 hover:shadow-[0_6px_20px_rgba(20,16,46,0.13)] hover:ring-1 hover:ring-ink-600/10">
                  <span className="relative aspect-square w-full overflow-hidden rounded-lg bg-white ring-1 ring-ink-600/10">
                    <SafeImage
                      src={productImage(p)}
                      alt={p.name}
                      fill
                      sizes="(max-width:640px) 30vw, 120px"
                      className="object-contain p-1 transition group-hover:scale-105"
                    />
                  </span>
                  <span className="clamp-2 mt-1 text-[11px] leading-tight text-ink-800">{p.name}</span>
                  <span className="text-[11px] font-bold text-ink-900">{ugx(p.price)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
