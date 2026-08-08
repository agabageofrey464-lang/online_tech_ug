import Link from "next/link";
import { productImage, type Product } from "@/lib/data";
import { ugx } from "@/lib/site";
import { WishlistButton } from "@/components/wishlist-button";
import { SafeImage } from "@/components/safe-image";

/** Jumia-style rating bar: grey stars with a gold overlay clipped to rating. */
function Stars({ rating }: { rating: number }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <span
      className="relative inline-block align-middle text-[11px] leading-none tracking-[1px]"
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

  return (
    <article className="group relative flex h-full flex-col rounded-xl bg-white transition duration-200 hover:shadow-[0_6px_22px_rgba(20,16,46,0.13)] hover:ring-1 hover:ring-ink-600/10">
      <WishlistButton
        slug={product.id}
        className="absolute left-2 top-2 z-10 opacity-0 transition group-hover:opacity-100"
      />

      <Link href={`/shop/${product.id}`} className="flex flex-1 flex-col">
        {/* Square frame gives the photo noticeably more room than 4:3, and a
            small even inset keeps it off the card edges. object-contain stays —
            cropping would cut the ends off laptops and towers. */}
        <div className="relative aspect-square overflow-hidden bg-white">
          <SafeImage
            src={productImage(product)}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            className={`object-contain p-2 transition duration-200 group-hover:scale-[1.03] ${inStock ? "" : "opacity-50"}`}
          />
          {product.badge && (
            <span className="absolute right-2 top-2 rounded bg-ink-600/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              {product.badge}
            </span>
          )}
          {!inStock && (
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-ink-900/80 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              Out of stock
            </span>
          )}
        </div>

        <div className="px-2 pb-2.5 pt-0.5">
          <h3 className="clamp-2 min-h-[2.4em] text-[12.5px] leading-tight text-ink-800 group-hover:text-brand-600">
            {product.name}
          </h3>

          {/* Price — full price, no discount markdown. */}
          <p className="mt-1 text-[15px] font-extrabold text-ink-900">{ugx(product.price)}</p>

          {/* Rating bar */}
          <div className="mt-1 flex items-center gap-1">
            <Stars rating={product.rating} />
            <span className="text-[11px] text-ink-700/45">({product.rating.toFixed(1)})</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
