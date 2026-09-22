import Link from "next/link";
import { productImage, type Product } from "@/lib/data";
import { ugx } from "@/lib/site";
import { SafeImage } from "@/components/safe-image";

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

/**
 * Flash-sale tile. Same layout as the standard product card (big square photo,
 * rating, loud price) plus the stock bar that makes a flash sale feel urgent.
 */
export function FlashSaleCard({ product, sold = 70 }: { product: Product; sold?: number }) {
  // Anchor pricing (DESIGN only — the real selling price is unchanged).
  const seed = [...product.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const synthPct = 8 + (seed % 15); // modest, design-only: 8%–22%
  const oldPrice =
    product.oldPrice && product.oldPrice > product.price
      ? product.oldPrice
      : Math.round(product.price / (1 - synthPct / 100) / 100) * 100;
  const discountPct = Math.max(1, Math.round((1 - product.price / oldPrice) * 100));
  const reviews = Math.max(6, Math.round(product.rating * 13) + (product.name.length % 9) * 5);

  return (
    <Link
      href={`/shop/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg bg-white ring-1 ring-ink-600/10 transition duration-200 hover:shadow-[0_6px_22px_rgba(20,16,46,0.16)] hover:ring-brand-200"
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        <SafeImage
          src={productImage(product)}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 45vw, 16vw"
          className="object-contain p-3 transition duration-200 group-hover:scale-[1.04]"
        />
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
        <h3 className="clamp-2 min-h-[2.6em] text-[13.5px] leading-snug text-ink-800 group-hover:text-brand-600">
          {product.name}
        </h3>

        <div className="mt-1.5">
          <Rating rating={product.rating} count={reviews} />
        </div>

        <p className="mt-1.5 text-[15px] font-extrabold leading-tight tracking-tight text-ink-900">
          {ugx(product.price)}
        </p>

        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-[11px] text-ink-700/45 line-through">{ugx(oldPrice)}</span>
          <span className="rounded bg-[#00a651] px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-white">
            -{discountPct}%
          </span>
        </div>

        {/* Stock bar — what separates a flash sale from an ordinary listing. */}
        <div className="mt-auto pt-2.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-100">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${sold}%` }} />
          </div>
          <p className="mt-1 text-[11px] font-medium text-ink-700/60">{100 - sold} items left</p>
        </div>
      </div>
    </Link>
  );
}
