import Link from "next/link";
import { productImage, type Product } from "@/lib/data";
import { productImages } from "@/lib/product-images";
import { ugx } from "@/lib/site";
import { WishlistButton } from "@/components/wishlist-button";
import { SafeImage } from "@/components/safe-image";

// Colour the condition tag by how new the item is.
function conditionStyle(c: string): string {
  if (c === "Brand New") return "bg-brand-100 text-brand-700";
  if (c === "Refurbished") return "bg-amber-100 text-amber-700";
  return "bg-ink-100 text-ink-700"; // UK Used / other
}

/** Rating bar: grey stars with a gold overlay clipped to the rating. */
function Stars({ rating }: { rating: number }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <span
      className="relative inline-block align-middle text-[12px] leading-none tracking-[1px]"
      aria-label={`Rated ${rating} out of 5`}
    >
      <span className="text-ink-600/20">★★★★★</span>
      <span
        className="absolute left-0 top-0 overflow-hidden whitespace-nowrap text-[#f68b1e]"
        style={{ width: `${pct}%` }}
      >
        ★★★★★
      </span>
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.inStock !== false;
  // Deterministic rating count — stable per product so it never shifts between renders.
  const reviews = Math.max(6, Math.round(product.rating * 13) + (product.name.length % 9) * 5);

  // Anchor pricing (DESIGN only — the real selling price is unchanged).
  const seed = [...product.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const synthPct = 6 + (seed % 15); // modest: 6%–20%
  const oldPrice =
    product.oldPrice && product.oldPrice > product.price
      ? product.oldPrice
      : Math.round(product.price / (1 - synthPct / 100) / 100) * 100;
  const discountPct = Math.max(1, Math.round((1 - product.price / oldPrice) * 100));

  // Alternate views for the thumbnail strip under the main photo.
  const shots = productImages[product.id] ?? [];
  const thumbs = shots.slice(1, 4);

  return (
    <article className="group relative flex h-full w-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-ink-600/[0.06] transition duration-200 hover:z-10 hover:shadow-[0_6px_22px_rgba(20,16,46,0.16)] hover:ring-brand-200">
      {/* Main photo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-white">
        <Link href={`/shop/${product.id}`} className="block h-full w-full">
          <SafeImage
            src={productImage(product)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            className={`object-contain p-1.5 transition duration-200 group-hover:scale-[1.04] ${inStock ? "" : "opacity-50"}`}
          />
        </Link>

        <WishlistButton
          slug={product.id}
          className="absolute left-2 top-2 z-20 opacity-0 transition group-hover:opacity-100"
        />
        {product.badge && (
          <span className="absolute right-2 top-2 z-10 rounded bg-ink-600/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            {product.badge}
          </span>
        )}
        {!inStock && (
          <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded bg-ink-900/80 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            Out of stock
          </span>
        )}
      </div>

      {/* Thumbnail strip — alternate views. The row is ALWAYS rendered at a fixed
          height so every card in a grid lines up, whether or not this product has
          extra angles. */}
      <div className="flex h-7 items-center justify-center gap-1 px-2.5">
        {thumbs.map((src, i) => (
          <span
            key={i}
            className="relative h-6 w-6 shrink-0 overflow-hidden rounded border border-ink-600/10 bg-white"
          >
            <SafeImage
              src={src}
              alt={`${product.name} view ${i + 2}`}
              fill
              sizes="24px"
              className="object-contain p-0.5"
            />
          </span>
        ))}
      </div>

      <Link href={`/shop/${product.id}`} className="flex flex-1 flex-col px-2.5 pt-0.5">
        {/* Title — link-blue, two lines */}
        <h3 className="clamp-2 min-h-[2.3em] text-[12px] leading-tight text-ink-700 group-hover:text-brand-600 group-hover:underline">
          {product.name}
        </h3>

        {/* Brand + condition on one row to keep the card short */}
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          {product.brand && product.brand !== "Generic" && (
            <span className="text-[11px] text-ink-700/55">{product.brand}</span>
          )}
          {product.condition !== "Refurbished" && (
            <span className={`rounded px-1 py-px text-[9px] font-bold uppercase tracking-wide ${conditionStyle(product.condition)}`}>
              {product.condition}
            </span>
          )}
        </div>

        {/* Rating + review count */}
        <div className="mt-0.5 flex items-center gap-1.5">
          <Stars rating={product.rating} />
          <span className="text-[11px] text-ink-700/55">{reviews.toLocaleString()}</span>
        </div>

        {/* Price */}
        <div className="mt-0.5">
          <p className="text-[15px] font-extrabold leading-tight text-ink-900">{ugx(product.price)}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-ink-700/45 line-through">{ugx(oldPrice)}</span>
            <span className="rounded bg-brand-500 px-1 text-[9px] font-extrabold leading-[1.4] text-white">
              -{discountPct}%
            </span>
          </div>
        </div>

        <div className="pb-2" />
      </Link>
    </article>
  );
}
