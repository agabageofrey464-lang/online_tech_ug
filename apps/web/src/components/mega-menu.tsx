"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { productCategories, products } from "@/lib/data";

const TOP_BRANDS = Array.from(new Set(products.map((p) => p.brand))).sort().slice(0, 12);

const SERVICES: [string, string][] = [
  ["Repairs & IT Support", "/services#repairs-support"],
  ["Websites & Software", "/services"],
  ["Online Courses", "/learn"],
  ["Sell with us (Vendor)", "/sell"],
  ["Advertise your business", "/advertise"],
  ["Request custom software", "/request"],
];

/** Amazon-style full-width mega menu that drops from the "All" button (desktop). */
export function MegaMenu() {
  return (
    <div className="group/mega mr-1.5 shrink-0">
      <Link
        href="/shop"
        className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-brand-500 to-brand-600 px-3.5 py-1.5 font-bold text-white shadow-md shadow-brand-900/30 ring-1 ring-white/10 transition hover:brightness-110 active:scale-95"
      >
        <Menu size={18} /> All
      </Link>

      {/* Full-width panel — spans the nav container, desktop only */}
      <div className="invisible absolute left-0 right-0 top-full z-50 hidden pt-1 opacity-0 transition duration-150 group-hover/mega:visible group-hover/mega:opacity-100 lg:block">
        <div className="overflow-hidden rounded-b-xl border-t-2 border-brand-500 bg-white text-ink-800 shadow-2xl ring-1 ring-ink-600/10">
          <div className="grid grid-cols-12 gap-6 p-6">
            {/* Categories */}
            <div className="col-span-3">
              <p className="mb-2.5 border-b border-ink-600/10 pb-1.5 text-sm font-extrabold text-ink-900">
                Shop by category
              </p>
              <ul className="space-y-2">
                {productCategories.map((c) => (
                  <li key={c}>
                    <Link
                      href={`/shop?cat=${encodeURIComponent(c)}`}
                      className="text-sm text-ink-700/80 transition hover:text-brand-600 hover:underline"
                    >
                      {c}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Brands */}
            <div className="col-span-3">
              <p className="mb-2.5 border-b border-ink-600/10 pb-1.5 text-sm font-extrabold text-ink-900">
                Top brands
              </p>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
                {TOP_BRANDS.map((b) => (
                  <li key={b}>
                    <Link
                      href={`/shop?brand=${encodeURIComponent(b)}`}
                      className="text-sm text-ink-700/80 transition hover:text-brand-600 hover:underline"
                    >
                      {b}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services & learning */}
            <div className="col-span-3">
              <p className="mb-2.5 border-b border-ink-600/10 pb-1.5 text-sm font-extrabold text-ink-900">
                Services &amp; learning
              </p>
              <ul className="space-y-2">
                {SERVICES.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-ink-700/80 transition hover:text-brand-600 hover:underline"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Promo */}
            <div className="col-span-3">
              <Link href="/shop?deals=1" className="block overflow-hidden rounded-lg shadow-sm">
                <div className="relative h-44 w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/web/photo-1496181133206-80ce9b88a853.jpg"
                    alt="Hot deals"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/30 to-transparent" />
                  <div className="absolute bottom-3 left-4 text-white">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-brand-300">Hot deals</p>
                    <p className="text-xl font-extrabold leading-tight">Up to 50% off</p>
                    <span className="mt-1 inline-block rounded-md bg-brand-500 px-3 py-1 text-xs font-bold">
                      Shop now →
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
