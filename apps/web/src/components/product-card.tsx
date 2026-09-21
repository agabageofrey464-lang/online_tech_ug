import Link from "next/link";
import { productImage, type Product } from "@/lib/data";
import { ugx } from "@/lib/site";
import { WishlistButton } from "@/components/wishlist-button";
import { SafeImage } from "@/components/safe-image";

// Colour the condition tag by how new the item is.
function conditionStyle(c: string): string {
  if (c === "Brand New") return "bg-brand-500 text-white";
  if (c === "Refurbished") return "bg-amber-500 text-white";
  return "bg-ink-700/85 text-white"; // UK Used / other
}

/** Rating line: a single gold star, the score, then the number of ratings. */
function Rating({ rating, count }: { rating: number; count: number }) {
  return (
    <span className="flex items-center gap-1 text-[12px] leading-none">
      <span className="text-[14px] leading-none text-[#f68b1e]">★</span>
      <span className="font-bold text-ink-900">{rating.toFixed(1)}</span>
      <span className="text-ink-700/50">({count.toLocaleString()})</span>
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

  return (
    <article className="group relative flex h-full w-full flex-col overflow-hidden rounded-lg bg-white ring-1 ring-ink-600/10 transition duration-200 hover:z-10 hover:shadow-[0_6px_22px_rgba(20,16,46,0.16)] hover:ring-brand-200">
      {/* Photo — large and square, the way the reference leads with the product */}
      <div className="relative aspect-square overflow-hidden bg-white">
        <Link href={`/shop/${product.id}`} className="block h-full w-full">
          <SafeImage
            src={productImage(product)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            className={`object-contain p-3 transition duration-200 group-hover:scale-[1.04] ${inStock ? "" : "opacity-50"}`}
          />
        </Link>

        <WishlistButton
          slug={product.id}
          className="absolute right-2 top-2 z-20 opacity-0 transition group-hover:opacity-100"
        />

        {/* Condition sits ON the photo — it matters for used machines, but the
            reference layout has no room for another text row. */}
        {product.condition !== "Refurbished" && (
          <span
            className={`absolute left-2 top-2 z-10 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${conditionStyle(product.condition)}`}
          >
            {product.condition}
          </span>
        )}
        {!inStock && (
          <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded bg-ink-900/80 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            Out of stock
          </span>
        )}
      </div>

      <Link href={`/shop/${product.id}`} className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
        {/* Title — two lines, plain weight */}
        <h3 className="clamp-2 min-h-[2.6em] text-[13.5px] leading-snug text-ink-800 group-hover:text-brand-600">
          {product.name}
        </h3>

        <div className="mt-1.5">
          <Rating rating={product.rating} count={reviews} />
        </div>

        {/* Price — the loudest thing on the card */}
        <p className="mt-1.5 text-[19px] font-extrabold leading-none tracking-tight text-ink-900">
          {ugx(product.price)}
        </p>

        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-[12px] text-ink-700/45 line-through">{ugx(oldPrice)}</span>
          <span className="rounded bg-[#e63946] px-1.5 py-0.5 text-[11px] font-extrabold leading-none text-white">
            -{discountPct}%
          </span>
        </div>
      </Link>
    </article>
  );
}
