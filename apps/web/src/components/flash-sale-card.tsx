import Link from "next/link";
import { productImage, type Product } from "@/lib/data";
import { ugx } from "@/lib/site";
import { SafeImage } from "@/components/safe-image";

// Featured card: bold price + crossed-out old price + -% badge + "items left" bar.
export function FlashSaleCard({ product, sold = 70 }: { product: Product; sold?: number }) {
  // Jumia-style anchor pricing (DESIGN only — the real selling price is unchanged).
  const seed = [...product.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const synthPct = 8 + (seed % 15); // modest, design-only: 8%–22%
  const oldPrice =
    product.oldPrice && product.oldPrice > product.price
      ? product.oldPrice
      : Math.round(product.price / (1 - synthPct / 100) / 100) * 100;
  const discountPct = Math.max(1, Math.round((1 - product.price / oldPrice) * 100));

  return (
    <Link href={`/shop/${product.id}`} className="group block h-full rounded-xl bg-white pb-2.5 transition duration-200 hover:shadow-[0_6px_22px_rgba(20,16,46,0.13)] hover:ring-1 hover:ring-ink-600/10">
      <div className="relative aspect-[4/3] overflow-hidden bg-white">
        <SafeImage
          src={productImage(product)}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 42vw, 16vw"
          className="object-contain p-1 transition group-hover:scale-105"
        />
      </div>

      <div className="px-2">
        <h3 className="clamp-2 mt-2 min-h-[2.4rem] text-[12.5px] leading-tight text-ink-900">
          {product.name}
        </h3>

        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span className="text-base font-extrabold text-ink-900">{ugx(product.price)}</span>
          <span className="text-[11px] text-ink-700/45 line-through">{ugx(oldPrice)}</span>
          <span className="rounded bg-brand-500 px-1 py-0.5 text-[10px] font-extrabold leading-none text-white">
            -{discountPct}%
          </span>
        </div>

        {/* Items-left progress bar */}
        <div className="mt-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-100">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${sold}%` }} />
          </div>
          <p className="mt-1 text-[11px] font-medium text-ink-700/60">{100 - sold} items left</p>
        </div>
      </div>
    </Link>
  );
}
