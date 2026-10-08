import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { listedProducts as products } from "@/lib/data";

/** Curated featured products (best-rated + discounted) shown atop the shop. */
export function FeaturedProducts() {
  const featured = [...products]
    .map((p) => ({ p, disc: p.oldPrice && p.oldPrice > p.price ? (p.oldPrice - p.price) / p.oldPrice : 0 }))
    .sort((a, b) => b.disc - a.disc || (b.p.rating ?? 0) - (a.p.rating ?? 0))
    .slice(0, 6)
    .map((x) => x.p);

  if (featured.length === 0) return null;

  return (
    <section className="mb-4 overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-ink-600/5 px-4 py-3">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-900">
          <span className="h-4 w-1 rounded-full bg-brand-500" /> Featured Products
        </h2>
        <Link href="/shop?deals=1" className="text-sm font-semibold text-brand-600 hover:underline">See deals →</Link>
      </div>
      <div className="flex snap-x gap-2.5 overflow-x-auto p-3 no-scrollbar">
        {featured.map((p) => (
          <div key={p.id} className="w-[45%] shrink-0 snap-start sm:w-[30%] lg:w-[15.5%]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
