import Link from "next/link";
import { productImage, type Product } from "@/lib/data";
import { card } from "@/lib/thumb";
import { ugx } from "@/lib/site";
import { WishlistButton } from "@/components/wishlist-button";
import { ProductRating } from "@/components/product-rating";
import { SafeImage } from "@/components/safe-image";
import { AddToCartButton } from "@/components/add-to-cart-button";

/**
 * Product tile: the photo on a soft panel with no border or shadow, the name
 * in the serif on the left and the price on the right, one quiet line of
 * specification beneath. The condition sits as a tab at the top of the photo
 * and "Quick add" rises over it on hover.
 *
 * Kept deliberately spare — the full specification lives on the product page,
 * and extra lines here only slow a shopper scanning a grid.
 */

/**
 * The facts a buyer compares on. For computers that is CPU / RAM / storage,
 * with screen and OS as a second line. Everything else falls back to the
 * product's own spec bullets, so accessories still say something useful.
 */
/**
 * The label at the front of a spec, not the sentence behind it.
 *
 * These fields are written for the full specification table, where prose is
 * welcome: a phone's `os` reads "iOS — the longest software support of any
 * phone we sell", and its `display` reads "6.8\" QHD+ Dynamic AMOLED 2X,
 * 120Hz, HDR10+". Dropped onto a card, the two together ran to 256px inside a
 * 126px box and were cut mid-word.
 *
 * A card has room for roughly twenty-four characters on a line, so each field
 * is reduced to the part that identifies it and the joined line is checked
 * against that budget rather than each piece separately — two parts that each
 * fit can still overflow together.
 */
function head(value: string | undefined): string {
  if (!value) return "";
  return value.split(/[,(—–]|\s-\s/)[0].trim();
}

/**
 * A screen, in the two facts that matter: how big, and what panel.
 *
 * Taking the size plus whatever word followed it gave "6.1\" Super" — from
 * "6.1\" Super Retina XDR OLED" — which tells a buyer nothing. The panel type
 * is looked for by name instead, wherever it sits in the string.
 */
function screenOf(display: string | undefined): string {
  const h = head(display);
  const size = h.match(/\d+(?:\.\d+)?\s*"/)?.[0]?.replace(/\s+/g, "") ?? "";
  const panel = h.match(/(AMOLED|OLED|IPS|LCD|Retina|LED)/i)?.[1] ?? "";
  const joined = [size, panel].filter(Boolean).join(" ");
  return joined || h;
}

/** "Android with One UI" -> "Android"; "Windows 11 Pro" -> "Windows 11" */
function osOf(value: string | undefined): string {
  const h = head(value);
  const m = h.match(/^(Windows\s*\d+|macOS|Android|iOS|Chrome\s*OS|Linux)/i);
  return m ? m[1] : h.split(/\s+/).slice(0, 2).join(" ");
}

/** "16GB unified memory" -> "16GB" */
function sizeOf(value: string | undefined): string {
  const h = head(value);
  return h.match(/^\s*(\d+\s?(?:GB|TB|MB))/i)?.[1]?.replace(/\s+/g, "") ?? h;
}

/** Join what fits, dropping from the end rather than cutting a word in half. */
function fit(parts: string[], max: number): string {
  const kept: string[] = [];
  for (const p of parts.filter(Boolean)) {
    const next = [...kept, p].join(" · ");
    if (next.length > max && kept.length > 0) break;
    kept.push(p);
  }
  return kept.join(" · ");
}

function specLines(product: Product): { primary: string; secondary: string } {
  const d = product.details;
  if (d) {
    // Not every product has a processor or a screen, so each part is read
    // only if it is there and the card shows whatever it can.
    const cpu =
      d.processor?.match(/Core i\d|Ryzen \d|Apple M\d|Celeron|Pentium|Athlon|Xeon/i)?.[0] ?? "";
    const ram = sizeOf(d.ram);
    const storage = sizeOf(d.storage ?? d.capacity);
    const screen = screenOf(d.display);
    const os = osOf(d.os ?? d.interface);
    return {
      primary: fit([cpu, ram, storage], 28),
      secondary: fit([screen, os], 24),
    };
  }
  // Products without a spec table fall back to their hand-written bullets.
  // Those are short individually but "Padded laptop compartment · Durable grey
  // fabric" still overran the card, so the same budget applies.
  const bullets = product.specs ?? [];
  const primary = fit(bullets.slice(0, 2), 28);
  const used = primary ? primary.split(" · ").length : 0;
  return { primary, secondary: fit(bullets.slice(used, used + 2), 24) };
}

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.inStock !== false;
  // A crossed-out price is shown only when the product really was that price.
  // Every card used to carry one, worked out from the product's id so that
  // each looked 6-20% off — a discount on nothing. Likewise the review count
  // beside the stars: see <ProductRating />.
  const oldPrice = product.oldPrice && product.oldPrice > product.price ? product.oldPrice : null;
  const discountPct = oldPrice ? Math.max(1, Math.round((1 - product.price / oldPrice) * 100)) : 0;
  const spec = specLines(product);

  return (
    // A container, so the name and price sit side by side on a wide tile and
    // stack on a narrow one — the same card is used in three-across grids and
    // in 13rem rails.
    <article className="group card-lift @container relative flex h-full w-full flex-col overflow-hidden bg-[var(--tile)]">
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/shop/${product.id}`} className="block h-full w-full">
          {/* Multiply lets a photo shot on white sit on the panel instead of
              in a white box of its own. */}
          <SafeImage
            src={card(productImage(product))}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`card-zoom object-contain p-4 mix-blend-multiply @[15rem]:p-7 ${inStock ? "" : "opacity-50"}`}
          />
        </Link>

        {/* A tab at the top of the photo for brand-new stock only. A used
            machine's condition is given on its own page, in the specification. */}
        {product.condition === "Brand New" && (
          <span className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 whitespace-nowrap bg-ink-600 px-3 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] text-white @[15rem]:px-5 @[15rem]:text-[10.5px]">
            New
          </span>
        )}

        <WishlistButton
          slug={product.id}
          className="absolute right-1.5 top-1.5 z-20 opacity-0 transition group-hover:opacity-100"
        />

        {!inStock && (
          <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-ink-900/80 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white">
            Out of stock
          </span>
        )}

        {/* Quick add — over the photo, for a pointer that can hover. A phone
            opens the product instead. Vendors' products are ordered from
            their own page. */}
        {inStock && !product.seller && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 hidden justify-center opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 @[13rem]:flex">
            <AddToCartButton
              label="Quick add"
              className="!rounded-none !bg-white !px-5 !py-2.5 !text-[11px] !font-bold uppercase !tracking-[0.16em] !text-ink-900 shadow-sm hover:!bg-ink-600 hover:!text-white"
              item={{ slug: product.id, name: product.name, price: product.price, category: product.category, condition: product.condition }}
            />
          </div>
        )}
      </div>

      <Link href={`/shop/${product.id}`} className="flex flex-1 flex-col px-3 pb-3.5 pt-3 @[15rem]:px-4 @[15rem]:pb-4">
        <div className="flex flex-col gap-1 @[20rem]:flex-row @[20rem]:items-start @[20rem]:justify-between @[20rem]:gap-3">
          <h3 className="clamp-2 min-h-[2.5em] text-[16px] leading-[1.25] text-ink-900 transition-colors duration-200 group-hover:text-brand-600 @[15rem]:text-[19px]">
            {product.name}
          </h3>
          <div className="shrink-0 @[20rem]:pt-1 @[20rem]:text-right">
            <p className="whitespace-nowrap text-[13px] font-semibold text-ink-900">{ugx(product.price)}</p>
            {oldPrice && (
              <p className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap @[20rem]:justify-end">
                <span className="text-[11px] text-ink-700/45 line-through">{ugx(oldPrice)}</span>
                <span className="text-[11px] font-bold text-green-700">-{discountPct}%</span>
              </p>
            )}
          </div>
        </div>

        {/* Specs — fixed height so every card in a row still lines up, whether
            the product has a full specification or only short bullets. */}
        <div className="mt-2 min-h-[2.2em]">
          {spec.primary && <p className="truncate text-[11.5px] text-ink-700/75">{spec.primary}</p>}
          {spec.secondary && <p className="truncate text-[11px] text-ink-700/50">{spec.secondary}</p>}
        </div>

        {product.seller && (
          <p className="mt-1 truncate text-[11px] text-ink-700/60">
            Sold by <span className="font-semibold text-brand-600">{product.seller}</span>
          </p>
        )}

        <ProductRating slug={product.id} className="mt-1.5" />
      </Link>
    </article>
  );
}
