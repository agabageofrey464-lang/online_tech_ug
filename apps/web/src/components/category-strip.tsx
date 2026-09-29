import Image from "next/image";
import Link from "next/link";
import { products, productCategories, productImage } from "@/lib/data";

/**
 * Categories, as a row you can thumb through.
 *
 * On a phone the home page had no way into a category at all — the mega-menu
 * and the sidebar are both desktop-only, so browsing by category meant opening
 * the menu and going looking. This puts every category one tap away, with the
 * number of items in each so nobody taps into a near-empty one.
 */

export function CategoryStrip({ className = "" }: { className?: string }) {
  const counts = new Map<string, number>();
  for (const p of products) {
    if (p.inStock === false) continue;
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  }

  // A line icon says "category". A photograph says what you can buy.
  // Picking the best-rated item chose by reputation, not by clarity — it put
  // an SSD on Components and a cluttered desk shot on Accessories. These are
  // chosen by eye, checked at the size they are actually drawn.
  const face = new Map<string, string>(
    Object.entries({
      Laptops: "/products/hp-elitebook-840-g3.webp",
      Desktops: "/products/hp-280-g6-desktop.webp",
      Phones: "/products/samsung-galaxy-a35-5g.webp",
      Components: "/products/ram-ddr4-8gb-dimm.webp",
      Power: "/products/power-bank-20000.webp",
      Accessories: "/products/logitech-mk270.webp",
      Networking: "/products/tp-link-archer-c6.webp",
      Storage: "/products/ssd-480gb-sata.webp",
    }),
  );
  // A category we have not chosen for still gets a picture rather than a hole.
  for (const c of productCategories) {
    if (face.has(c)) continue;
    const best = products
      .filter((p) => p.category === c && p.inStock !== false)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0];
    if (best) face.set(c, productImage(best));
  }

  // Busiest first: what we actually have most of is what most people want.
  const cats = productCategories
    .filter((c) => c !== "All")
    .map((c) => ({ name: c, count: counts.get(c) ?? 0, img: face.get(c) }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  if (cats.length === 0) return null;

  return (
    <section className={`overflow-hidden rounded-lg bg-white shadow-sm ${className}`}>
      <div className="flex items-center justify-between px-3 pt-2.5">
        <h2 className="text-[13px] font-extrabold text-ink-900">Shop by category</h2>
        <Link href="/categories" className="text-[11px] font-bold text-brand-600">
          See all →
        </Link>
      </div>

      {/* A scrolling row rather than a grid: a grid of eight leaves an orphan
          on its own line and eats the top of the page. */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-3 pb-3 pt-2 no-scrollbar">
        {cats.map((c) => (
          <Link
            key={c.name}
            href={`/shop?cat=${encodeURIComponent(c.name)}`}
            className="press group flex w-[66px] shrink-0 flex-col items-center gap-1 text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-ink-600/10 transition group-hover:ring-2 group-hover:ring-brand-500">
              {c.img ? (
                <Image
                  src={c.img}
                  alt=""
                  width={48}
                  height={48}
                  loading="lazy"
                  className="h-10 w-10 object-contain transition duration-300 group-hover:scale-110"
                />
              ) : null}
            </span>
            <span className="w-full truncate text-[10.5px] font-bold leading-tight text-ink-800">
              {c.name}
            </span>
            <span className="text-[9px] font-semibold text-ink-700/55">{c.count} items</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
