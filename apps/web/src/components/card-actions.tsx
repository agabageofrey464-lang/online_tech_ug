"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, Scale, Share2, X } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { WishlistButton } from "@/components/wishlist-button";
import { SafeImage } from "@/components/safe-image";
import { COMPARE_MAX, compareList, onCompareChange, toggleCompare, type CompareItem } from "@/lib/compare";
import { arrivalText } from "@/lib/delivery";
import { site, ugx } from "@/lib/site";

/**
 * What can be done with a product from its card, without leaving the page.
 *
 * The card itself is untouched: these are three small round buttons at the
 * edge of the photograph, in the same white circle as the heart above them.
 *   • Quick look — the product in a panel over the page: a larger picture,
 *     the price, the specification and the buttons to buy.
 *   • Compare — set up to three products side by side.
 *   • Share — send the product to someone on WhatsApp.
 * With a mouse they appear as the card is pointed at. On a phone, where there
 * is no pointing, the one for a quick look is always there and the other two
 * are inside it.
 */

export type CardProduct = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  image: string;
  category: string;
  brand: string;
  condition: string;
  /** The seller line carried into the cart for a vendor's product. */
  cartCondition: string;
  cartImage?: string;
  inStock: boolean;
  rows: [string, string][];
};

const round = "flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-800 shadow-sm backdrop-blur transition hover:bg-white hover:text-brand-600";

const asCompare = (p: CardProduct): CompareItem => ({
  id: p.id, name: p.name, price: p.price, image: p.image, category: p.category, brand: p.brand, condition: p.condition, rows: p.rows,
});

export function CardActions({ product }: { product: CardProduct }) {
  const [open, setOpen] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [note, setNote] = useState("");
  const [arrives, setArrives] = useState("");
  const url = `${site.url}/shop/${product.id}`;

  useEffect(() => {
    const read = () => setComparing(compareList().some((x) => x.id === product.id));
    read();
    return onCompareChange(read);
  }, [product.id]);

  // The panel: closes on Escape, and the page behind does not scroll under it.
  useEffect(() => {
    if (!open) return;
    setArrives(arrivalText());
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", key);
    const was = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = was;
    };
  }, [open]);

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  function compare(e?: React.MouseEvent) {
    if (e) stop(e);
    const r = toggleCompare(asCompare(product));
    setNote(r === "full" ? `You can compare ${COMPARE_MAX} at a time. Remove one first.` : "");
    if (r === "full") setTimeout(() => setNote(""), 3000);
  }

  async function share(e?: React.MouseEvent) {
    if (e) stop(e);
    const text = `${product.name} — ${ugx(product.price)} at ${site.name}`;
    // A phone's own share sheet where there is one; WhatsApp otherwise.
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: product.name, text, url });
        return;
      } catch {
        /* closed without sharing, or not allowed — fall through */
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, "_blank", "noopener");
  }

  return (
    <>
      <div className="absolute right-1.5 top-11 z-20 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            setOpen(true);
          }}
          aria-label={`Quick look at ${product.name}`}
          title="Quick look"
          className={`${round} opacity-100 transition group-hover:opacity-100 [@media(hover:hover)]:opacity-0`}
        >
          <Eye size={15} />
        </button>
        <button
          type="button"
          onClick={compare}
          aria-pressed={comparing}
          aria-label={comparing ? `Remove ${product.name} from compare` : `Compare ${product.name}`}
          title={comparing ? "Remove from compare" : "Compare"}
          className={`${round} hidden opacity-0 group-hover:opacity-100 [@media(hover:hover)]:flex ${comparing ? "!bg-ink-800 !text-white !opacity-100" : ""}`}
        >
          <Scale size={15} />
        </button>
        <button
          type="button"
          onClick={share}
          aria-label={`Share ${product.name}`}
          title="Share"
          className={`${round} hidden opacity-0 group-hover:opacity-100 [@media(hover:hover)]:flex`}
        >
          <Share2 size={15} />
        </button>
      </div>
      {note && <p className="absolute inset-x-2 top-2 z-30 bg-ink-900 px-2.5 py-2 text-center text-[11px] font-semibold text-white">{note}</p>}

      {/* Drawn on the page itself, not inside the card: the card clips what is
          in it and moves on hover, which would trap a panel placed there. */}
      {open &&
        createPortal(
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-ink-900/60 sm:items-center sm:p-6" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label={product.name}>
          <div className="keeps-card-colours relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto bg-white sm:grid-cols-2" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} aria-label="Close" className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink-900 shadow">
              <X size={18} />
            </button>

            <div className="relative aspect-square bg-[var(--tile)] sm:aspect-auto sm:min-h-[26rem]">
              <SafeImage src={product.image} alt={product.name} fill sizes="(max-width: 640px) 100vw, 440px" className="object-contain p-6 mix-blend-multiply" />
            </div>

            <div className="flex flex-col p-5 sm:p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
                {product.category} · {product.condition}
              </p>
              <h2 className="mt-2 text-[26px] leading-tight text-ink-900">{product.name}</h2>
              <p className="mt-3 flex flex-wrap items-baseline gap-x-3">
                <span className="text-[20px] text-ink-900">{ugx(product.price)}</span>
                {product.oldPrice && product.oldPrice > product.price && <span className="text-sm text-ink-700/45 line-through">{ugx(product.oldPrice)}</span>}
              </p>
              <p className={`mt-1 text-[13px] ${product.inStock ? "text-ink-700/75" : "font-semibold text-brand-700"}`}>
                {product.inStock ? `In stock${arrives ? ` · order now, arrives ${arrives}` : ""}` : "Currently out of stock"}
              </p>

              {product.rows.length > 0 && (
                <dl className="mt-4 divide-y divide-ink-600/10 border-y border-ink-600/10">
                  {product.rows.slice(0, 7).map(([k, v], i) => (
                    <div key={i} className="grid grid-cols-[38%_62%] gap-2 py-2 text-[13px]">
                      <dt className="text-ink-700/60">{k}</dt>
                      <dd className="text-ink-900">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="mt-5 flex flex-col gap-2">
                {product.inStock && (
                  <AddToCartButton
                    label="Add to cart"
                    className="!w-full !rounded-none !bg-brand-500 !py-4 !text-[12px] !font-bold uppercase !tracking-[0.18em] !text-white hover:!bg-brand-600"
                    item={{ slug: product.id, name: product.name, price: product.price, category: product.category, condition: product.cartCondition, image: product.cartImage }}
                  />
                )}
                <Link href={`/shop/${product.id}`} className="border border-ink-900 py-3.5 text-center text-[12px] font-bold uppercase tracking-[0.18em] text-ink-900 transition hover:bg-ink-900 hover:text-white">
                  See full details
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] font-semibold text-ink-800">
                <button type="button" onClick={() => compare()} className="inline-flex items-center gap-1.5 hover:text-brand-600">
                  <Scale size={15} /> {comparing ? "In your comparison ✓" : "Compare"}
                </button>
                <button type="button" onClick={() => share()} className="inline-flex items-center gap-1.5 hover:text-brand-600">
                  <Share2 size={15} /> Share
                </button>
                <span className="inline-flex items-center gap-1.5">
                  <WishlistButton slug={product.id} className="!h-7 !w-7 !shadow-none" /> Save
                </span>
              </div>
              {note && <p className="mt-2 text-[12px] font-semibold text-brand-700">{note}</p>}
            </div>
          </div>
        </div>,
        document.body,
        )}
    </>
  );
}
