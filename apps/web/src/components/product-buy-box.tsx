"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart";
import { ugx } from "@/lib/site";

/**
 * The part of a product page where the customer chooses and buys: the colour,
 * the configuration, how many, and the button.
 *
 * Colours are the ones entered for the product in the dashboard, and the
 * chosen one travels with the cart to the order, so whoever packs it knows
 * which to send. Configurations are other products in the catalogue that are
 * the same model — each is a real listing with its own price and stock, so
 * choosing one opens that product rather than changing a number on this page.
 */

/** What a colour name looks like. These are the products' colours, not the site's. */
const SWATCHES: [RegExp, string][] = [
  [/rose\s*gold/i, "#e0b4a6"],
  [/space\s*gr[ae]y|graphite|charcoal/i, "#5b5d62"],
  [/midnight|navy/i, "#232a3b"],
  [/starlight|champagne|cream|beige/i, "#efe6d6"],
  [/titanium/i, "#8d8a85"],
  [/silver|platinum/i, "#cfd2d6"],
  [/gold/i, "#d9b77e"],
  [/black/i, "#1b1b1d"],
  [/white/i, "#f8f8f6"],
  [/gr[ae]y/i, "#8a8d91"],
  [/blue/i, "#3f5f8f"],
  [/green/i, "#56806a"],
  [/red/i, "#a9322b"],
  [/pink/i, "#e7b9c0"],
  [/purple|violet|lavender/i, "#8b7bb0"],
  [/yellow/i, "#e6cf6a"],
  [/orange/i, "#d9793b"],
  [/brown|bronze|copper/i, "#8a5a3c"],
];
const swatch = (name: string) => SWATCHES.find(([re]) => re.test(name))?.[1] ?? "#dcd3c6";

export type Choice = { id: string; label: string; price: number; current: boolean };

export function ProductBuyBox({
  item,
  colors,
  choices,
}: {
  item: { slug: string; name: string; price: number; category: string; condition: string };
  colors: string[];
  choices: Choice[];
}) {
  const { add } = useCart();
  const [color, setColor] = useState(colors[0] ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <div className="space-y-6">
      {colors.length > 0 && (
        <div>
          <p className="text-[14px] text-ink-900">
            Colour: <span className="text-ink-700/70">{color}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-pressed={c === color}
                aria-label={c}
                title={c}
                className={`h-10 w-10 border p-[3px] transition ${c === color ? "border-ink-900" : "border-transparent hover:border-ink-700/40"}`}
              >
                <span className="block h-full w-full border border-ink-900/15" style={{ backgroundColor: swatch(c) }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {choices.length > 1 && (
        <div>
          <p className="text-[14px] text-ink-900">
            Choice: <span className="text-ink-700/70">{choices.find((c) => c.current)?.label}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {choices.map((c) =>
              c.current ? (
                <span key={c.id} className="border-2 border-ink-900 bg-white px-4 py-2.5 text-center text-[13px] text-ink-900">
                  {c.label}
                  <span className="block text-[11px] text-ink-700/60">{ugx(c.price)}</span>
                </span>
              ) : (
                <Link
                  key={c.id}
                  href={`/shop/${c.id}`}
                  className="border border-ink-700/25 bg-white px-4 py-2.5 text-center text-[13px] text-ink-900 transition hover:border-ink-900"
                >
                  {c.label}
                  <span className="block text-[11px] text-ink-700/60">{ugx(c.price)}</span>
                </Link>
              ),
            )}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex h-14 shrink-0 items-center border border-ink-700/30 bg-white">
          <button type="button" aria-label="One fewer" onClick={() => setQty((n) => Math.max(1, n - 1))} className="flex h-full w-12 items-center justify-center text-ink-900 disabled:text-ink-700/30" disabled={qty === 1}>
            <Minus size={18} strokeWidth={1.5} />
          </button>
          <span className="w-10 text-center text-[16px] tabular-nums text-ink-900" aria-live="polite">{qty}</span>
          <button type="button" aria-label="One more" onClick={() => setQty((n) => Math.min(99, n + 1))} className="flex h-full w-12 items-center justify-center text-ink-900">
            <Plus size={18} strokeWidth={1.5} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            add({ ...item, option: color || undefined }, qty);
            setAdded(true);
            setTimeout(() => setAdded(false), 1400);
          }}
          className={`press h-14 flex-1 text-[13px] font-bold uppercase tracking-[0.18em] text-white transition ${added ? "bg-brand-500" : "bg-ink-600 hover:bg-ink-700"}`}
        >
          {added ? "✓ Added" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
