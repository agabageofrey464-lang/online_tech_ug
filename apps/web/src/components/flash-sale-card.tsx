import Link from "next/link";
import { productImage, type Product } from "@/lib/data";
import { ugx } from "@/lib/site";
import { SafeImage } from "@/components/safe-image";
import { ProductRating } from "@/components/product-rating";

/**
 * Flash-sale tile. Same layout as the standard product card: big square photo,
 * the rating customers have given it, a loud price.
 *
 * It used to end in a stock bar and "23 items left", and carry a crossed-out
 * price — all three worked out from the product's id. The price beside the
 * strike-through is real only when the product has a recorded old price, and
 * that is the only time one is shown.
 */
export function FlashSaleCard({ product }: { product: Product }) {
  const oldPrice = product.oldPrice && product.oldPrice > product.price ? product.oldPrice : null;
  const discountPct = oldPrice ? Math.max(1, Math.round((1 - product.price / oldPrice) * 100)) : 0;

  return (
    <Link
      href={`/shop/${product.id}`}
      className="group flex h-full flex-col overflow-hidden card-soft rounded-lg bg-white transition duration-200 hover:shadow-[0_6px_22px_rgba(20,16,46,0.16)]"
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

        <ProductRating slug={product.id} className="mt-1.5 text-[12px]" />

        <p className="mt-1.5 text-[16px] font-extrabold leading-none tracking-tight text-ink-900">
          {ugx(product.price)}
        </p>

        {oldPrice && (
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[11.5px] text-ink-700/45 line-through">{ugx(oldPrice)}</span>
            <span className="rounded-sm bg-[#00a651] px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
              -{discountPct}%
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
