import Link from "next/link";
import { productImage, type Product } from "@/lib/data";
import { card, tile } from "@/lib/thumb";
import { productImages } from "@/lib/product-images";
import { site, soldBy, ugx } from "@/lib/site";
import { WishlistButton } from "@/components/wishlist-button";
import { ProductRating } from "@/components/product-rating";
import { SafeImage } from "@/components/safe-image";
import { CardActions } from "@/components/card-actions";

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

/** The specification as label and value, for the quick look and for comparing. */
const DETAIL_LABELS: [keyof NonNullable<Product["details"]>, string][] = [
  ["processor", "Processor"], ["ram", "Memory"], ["storage", "Storage"], ["capacity", "Capacity"], ["display", "Screen"],
  ["graphics", "Graphics"], ["os", "System"], ["battery", "Battery"], ["interface", "Connection"], ["speed", "Speed"],
  ["compatibility", "Works with"], ["warranty", "Warranty"],
];
function specRows(product: Product): [string, string][] {
  const d = product.details;
  const rows: [string, string][] = d ? DETAIL_LABELS.filter(([k]) => d[k]).map(([k, label]) => [label, String(d[k])]) : [];
  // A product with no table has its short bullets instead.
  const bullets = (product.specs ?? []).filter(Boolean).slice(0, 6);
  return rows.length ? rows : bullets.length ? [["Details", bullets.join(" · ")]] : [];
}

export function ProductCard({ product, large = false }: { product: Product; large?: boolean }) {
  // In the shop's own grid a tile on a computer is large, so it is given the
  // larger copy of the photograph there; a phone keeps the light one.
  const big = large ? tile(productImage(product)) : null;
  const inStock = product.inStock !== false;
  // A crossed-out price is shown only when the product really was that price.
  // Every card used to carry one, worked out from the product's id so that
  // each looked 6-20% off — a discount on nothing. Likewise the review count
  // beside the stars: see <ProductRating />.
  const oldPrice = product.oldPrice && product.oldPrice > product.price ? product.oldPrice : null;
  const discountPct = oldPrice ? Math.max(1, Math.round((1 - product.price / oldPrice) * 100)) : 0;
  const spec = specLines(product);
  const second = productImages[product.id]?.[1];

  return (
    // A container, so the name and price sit side by side on a wide tile and
    // stack on a narrow one — the same card is used in three-across grids and
    // in 13rem rails.
    <article className="group @container relative flex h-full w-full flex-col overflow-hidden bg-white transition hover:shadow-[0_12px_30px_-16px_rgba(22,21,29,0.45)]">
      <div className="relative aspect-square overflow-hidden bg-white">
        <Link href={`/shop/${product.id}`} className="block h-full w-full">
          {/* Multiply lets a photo shot on white sit on the panel instead of
              in a white box of its own. */}
          <picture>
            {big && <source media="(min-width: 1024px)" srcSet={big} />}
            <SafeImage
              src={card(productImage(product))}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`card-zoom object-contain p-2 mix-blend-multiply @[15rem]:p-3 ${inStock ? "" : "opacity-50"}`}
            />
          </picture>
          {/* Another view of the same product, on hover. The wrapper carries the
              fade: the image's own opacity belongs to its load-in. */}
          {second && (
            <div className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <SafeImage
                src={card(second)}
                alt={`${product.name} — another view`}
                fill
                loading="lazy"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-contain p-2 mix-blend-multiply @[15rem]:p-3"
              />
            </div>
          )}
        </Link>

        {/* The condition, as a white pill at the foot of the photograph. */}
        {product.condition && (
          <span className="pointer-events-none absolute bottom-2.5 right-2.5 z-10 whitespace-nowrap rounded-full bg-white/95 px-2.5 py-1 text-[11.5px] text-ink-800 shadow-sm @[15rem]:text-[12.5px]">
            {product.condition}
          </span>
        )}

        <WishlistButton
          slug={product.id}
          className="absolute right-1.5 top-1.5 z-20 ring-2 ring-white/90"
        />

        {/* A quick look, compare and share — small round buttons under the heart. */}
        <CardActions
          product={{
            id: product.id,
            name: product.name,
            price: product.price,
            oldPrice,
            image: productImage(product),
            category: product.category,
            brand: product.brand,
            condition: product.condition,
            cartCondition: product.seller ? soldBy(product.seller) : product.condition,
            cartImage: product.seller ? product.image : undefined,
            inStock,
            rows: specRows(product),
          }}
        />

        {!inStock && (
          <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-ink-900/80 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white">
            Out of stock
          </span>
        )}

      </div>

      {/* Under the photograph, as the big home stores set it: a coloured tag
          and the price on one line, the name, the stars, and small grey tags. */}
      <Link href={`/shop/${product.id}`} className="flex flex-1 flex-col px-2.5 pb-3.5 pt-3 @[15rem]:px-3">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="rounded-md bg-brand-600 px-2 py-0.5 text-[12px] font-medium text-white @[15rem]:text-[13.5px]">
            {product.condition === "Brand New" ? "New" : product.category === "Phones" ? "Phone" : "In stock"}
          </span>
          <span className="whitespace-nowrap text-[15px] font-semibold text-brand-700 @[15rem]:text-[16.5px]">{ugx(product.price)}</span>
          {oldPrice && <span className="whitespace-nowrap text-[12px] text-ink-700/60 line-through decoration-dotted @[15rem]:text-[13px]">{ugx(oldPrice)}</span>}
        </p>
        <h3 className="mt-2 line-clamp-2 text-[14.5px] !font-normal leading-[1.35] text-ink-900 transition-colors group-hover:text-brand-600 @[15rem]:text-[16.5px]">
          {product.name}
        </h3>
        {spec.primary && <p className="mt-0.5 truncate text-[12px] text-ink-700/60">{spec.primary}</p>}
        <ProductRating slug={product.id} className="mt-1.5" />
        {product.seller && (
          <p className="mt-1 truncate text-[11.5px] text-ink-700/60">
            Sold by <span className="font-semibold text-brand-600">{site.name}</span> · {product.seller}
          </p>
        )}
        <span className="mt-2.5 flex flex-wrap gap-1.5">
          {inStock && <span className="bg-[#f1efea] px-2 py-1 text-[11.5px] text-ink-700 @[15rem]:text-[12.5px]">Same-Day Delivery</span>}
          <span className="hidden bg-[#f1efea] px-2 py-1 text-[12.5px] text-ink-700 @[15rem]:inline">Warranty</span>
          {(product.rating ?? 0) >= 4.7 && <span className="hidden bg-[#f1efea] px-2 py-1 text-[12.5px] text-ink-700 @[15rem]:inline">Best Seller</span>}
        </span>
      </Link>
    </article>
  );
}
