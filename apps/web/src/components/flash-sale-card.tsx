import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/data";
import { ugx } from "@/lib/site";

// Jumia-style flash-sale card: discount badge, bold price, old price, "items left" bar.
export function FlashSaleCard({ product, sold = 70 }: { product: Product; sold?: number }) {
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  return (
    <Link href={`/shop/${product.id}`} className="group block rounded-lg bg-white p-2.5 shadow-sm transition hover:shadow-md sm:p-3">
      <div className="relative aspect-square overflow-hidden bg-white">
        <Image
          src={`/products/${product.id}.webp`}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 42vw, 16vw"
          className="object-contain p-1 transition group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute right-0 top-0 rounded-bl-lg bg-brand-100 px-1.5 py-0.5 text-[11px] font-bold text-brand-700">
            -{discount}%
          </span>
        )}
      </div>

      <h3 className="clamp-2 mt-2 min-h-[2.4rem] text-[13px] leading-tight text-ink-900">
        {product.name}
      </h3>

      <p className="mt-1 text-base font-extrabold text-ink-900">{ugx(product.price)}</p>
      {product.oldPrice && (
        <p className="text-xs text-ink-700/40 line-through">{ugx(product.oldPrice)}</p>
      )}

      {/* Items-left progress bar */}
      <div className="mt-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-100">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${sold}%` }} />
        </div>
        <p className="mt-1 text-[11px] font-medium text-ink-700/60">{100 - sold} items left</p>
      </div>
    </Link>
  );
}
