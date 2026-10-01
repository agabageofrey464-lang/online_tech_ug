import Link from "next/link";
import { productImage, type Product } from "@/lib/data";
import { card } from "@/lib/thumb";
import { ugx } from "@/lib/site";
import { WishlistButton } from "@/components/wishlist-button";
import { SafeImage } from "@/components/safe-image";

/**
 * Product tile, matching the jumia.ug reference: white card, square photo,
 * two-line title, a single-star rating with the review count, then the price
 * with the struck anchor price and a green discount badge.
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

/** Rating: one gold star, the score, then how many people rated it. */
function Rating({ rating, count }: { rating: number; count: number }) {
  return (
    <span className="flex items-center gap-1 text-[12.5px] leading-none">
      <span className="text-[14px] leading-none text-[#f68b1e]">★</span>
      <span className="font-bold text-ink-900">{rating.toFixed(1)}</span>
      <span className="text-ink-700/50">({count.toLocaleString()})</span>
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.inStock !== false;
  // Deterministic per product, so the figure never shifts between renders.
  const reviews = Math.max(6, Math.round(product.rating * 13) + (product.name.length % 9) * 5);

  // Anchor pricing (DESIGN only — the real selling price is unchanged).
  const seed = [...product.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const synthPct = 6 + (seed % 15); // modest: 6%–20%
  const oldPrice =
    product.oldPrice && product.oldPrice > product.price
      ? product.oldPrice
      : Math.round(product.price / (1 - synthPct / 100) / 100) * 100;
  const discountPct = Math.max(1, Math.round((1 - product.price / oldPrice) * 100));
  const spec = specLines(product);

  return (
    <article className="group card-lift relative flex h-full w-full flex-col overflow-hidden rounded-md border border-ink-600/[0.08] bg-white shadow-[var(--shadow-1)] hover:z-10">
      <div className="relative aspect-square overflow-hidden bg-white">
        <Link href={`/shop/${product.id}`} className="block h-full w-full">
          <SafeImage
            src={card(productImage(product))}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            className={`card-zoom object-contain p-2.5 ${inStock ? "" : "opacity-50"}`}
          />
        </Link>

        {/* Condition rides on the photo — it matters on a used machine, and it
            costs no vertical space here. */}
        {product.condition !== "Refurbished" && (
          <span className="pointer-events-none absolute right-0 top-0 z-10 rounded-bl-md bg-brand-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
            {product.condition}
          </span>
        )}

        <WishlistButton
          slug={product.id}
          className="absolute left-1 top-1 z-20 opacity-0 transition group-hover:opacity-100"
        />

        {!inStock && (
          <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded bg-ink-900/80 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            Out of stock
          </span>
        )}
      </div>

      <Link href={`/shop/${product.id}`} className="flex flex-1 flex-col px-2.5 pb-3 pt-2">
        <h3 className="clamp-2 min-h-[2.6em] text-[13.5px] leading-snug text-ink-800 transition-colors duration-200 group-hover:text-brand-600">
          {product.name}
        </h3>

        {/* Specs — fixed height so every card in a row still lines up, whether
            the product has a full specification or only short bullets. */}
        <div className="mt-1 min-h-[2.1em]">
          {spec.primary && (
            <p className="truncate text-[11px] font-semibold text-ink-700/75">{spec.primary}</p>
          )}
          {spec.secondary && (
            <p className="truncate text-[10.5px] text-ink-700/50">{spec.secondary}</p>
          )}
        </div>

        <div className="mt-1.5">
          <Rating rating={product.rating} count={reviews} />
        </div>

        <p className="mt-1.5 text-[17px] font-extrabold leading-none tracking-tight text-ink-900">
          {ugx(product.price)}
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11.5px] text-ink-700/45 line-through">{ugx(oldPrice)}</span>
          <span className="rounded-sm bg-[#00a651] px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
            -{discountPct}%
          </span>
        </div>
      </Link>
    </article>
  );
}
