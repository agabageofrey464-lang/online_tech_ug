import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { SectionTitle } from "@/components/home-sections";
import { ProgressRail } from "@/components/progress-rail";
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
    <section aria-label="Featured products">
      <SectionTitle href="/shop?deals=1" cta="See deals">Featured Products</SectionTitle>
      <ProgressRail>
        {featured.map((p) => (
          <div key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[30%] lg:w-[calc((100%-2.25rem)/4)]">
            <ProductCard product={p} />
          </div>
        ))}
      </ProgressRail>
    </section>
  );
}
