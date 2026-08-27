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
  // Group the selected category by brand — the natural "subcategory" for a
  // computer shop, mirroring Jumia's category page structure.
  const inCat = products.filter((p) => p.category === active);
  const groups = Array.from(new Set(inCat.map((p) => p.brand)))
    .map((brand) => ({ brand, items: inCat.filter((p) => p.brand === brand).slice(0, 6) }))
    .sort((a, b) => b.items.length - a.items.length);

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

      {/* Right panel — Jumia-style: subcategory groups (by brand) with image tiles */}
      <div className="min-w-0 flex-1 space-y-3 p-3">
        <Link
          href={`/shop?cat=${encodeURIComponent(active)}`}
          className="flex items-center justify-between rounded-lg bg-white px-4 py-3 text-sm font-bold text-ink-900 shadow-sm"
        >
          All {active} <ChevronRight size={18} className="text-ink-700/50" />
        </Link>

        {groups.length === 0 ? (
          <p className="rounded-lg bg-white py-10 text-center text-sm text-ink-700/50 shadow-sm">
            Nothing here yet.
          </p>
        ) : (
          groups.map((g) => (
            <section key={g.brand} className="rounded-lg bg-white p-3 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-ink-900">{g.brand}</h2>
                <Link
                  href={`/shop?cat=${encodeURIComponent(active)}&brand=${encodeURIComponent(g.brand)}`}
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  See All
                </Link>
              </div>
              <div className="grid-cards-sm gap-x-3 gap-y-4">
                {g.items.map((p) => (
                  <Link
                    key={p.id}
                    href={`/shop/${p.id}`}
                    className="group flex flex-col text-center"
                  >
                    <span className="relative aspect-square w-full overflow-hidden rounded-lg bg-ink-50">
                      <SafeImage
                        src={productImage(p)}
                        alt={p.name}
                        fill
                        sizes="(max-width:640px) 30vw, 120px"
                        className="object-contain p-1.5 transition group-hover:scale-105"
                      />
                    </span>
                    <span className="clamp-2 mt-1 text-[11px] leading-tight text-ink-800">{p.name}</span>
                    <span className="text-[11px] font-bold text-ink-900">{ugx(p.price)}</span>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
