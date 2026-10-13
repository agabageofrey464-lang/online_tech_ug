"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Scale, X } from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import { clearCompare, compareList, onCompareChange, removeCompare, type CompareItem } from "@/lib/compare";
import { ugx } from "@/lib/site";

/**
 * The products chosen to compare: a small bar while they are being gathered,
 * and the table that sets them side by side.
 *
 * Nothing is drawn until a product is chosen, so a visitor who never uses it
 * never sees it.
 */
export function CompareBar() {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const read = () => setItems(compareList());
    read();
    return onCompareChange(read);
  }, []);
  useEffect(() => {
    if (items.length === 0) setOpen(false);
  }, [items.length]);

  if (items.length === 0) return null;

  // Every label any of them has, in the order first met.
  const labels = Array.from(new Set(items.flatMap((p) => p.rows.map(([k]) => k))));
  const cheapest = Math.min(...items.map((p) => p.price));

  return (
    <>
      <div className="fixed inset-x-0 bottom-[4.5rem] z-40 flex justify-center px-3 md:bottom-4">
        <div className="flex max-w-full items-center gap-3 bg-ink-800 py-2 pl-3 pr-2 text-white shadow-xl">
          <Scale size={17} className="shrink-0 text-brand-300" />
          <div className="flex -space-x-2">
            {items.map((p) => (
              <span key={p.id} className="relative h-9 w-9 overflow-hidden rounded-full bg-white ring-2 ring-ink-800">
                <SafeImage src={p.image} alt={p.name} fill sizes="36px" className="object-contain p-0.5" />
              </span>
            ))}
          </div>
          <button
            onClick={() => setOpen(true)}
            disabled={items.length < 2}
            className="bg-brand-500 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-brand-600 disabled:bg-white/15 disabled:text-white/60"
          >
            {items.length < 2 ? "Pick one more" : `Compare ${items.length}`}
          </button>
          <button onClick={clearCompare} aria-label="Clear the comparison" className="p-2 text-white/70 hover:text-white">
            <X size={16} />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-ink-900/60 sm:items-center sm:p-6" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label="Compare products">
          <div className="keeps-card-colours relative max-h-[92vh] w-full max-w-5xl overflow-auto bg-white p-4 sm:p-7" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} aria-label="Close" className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-ink-50 text-ink-900">
              <X size={18} />
            </button>
            <h2 className="pr-10 text-[26px] leading-tight text-ink-900">Compare</h2>

            <table className="mt-4 w-full min-w-[32rem] border-collapse text-left text-[13px]">
              <thead>
                <tr>
                  <th className="w-[22%] p-2" />
                  {items.map((p) => (
                    <th key={p.id} className="p-2 align-top font-normal">
                      <div className="relative aspect-square w-full max-w-[9rem] bg-[var(--tile)]">
                        <SafeImage src={p.image} alt={p.name} fill sizes="144px" className="object-contain p-2 mix-blend-multiply" />
                      </div>
                      <Link href={`/shop/${p.id}`} onClick={() => setOpen(false)} className="mt-2 block font-display text-[17px] leading-tight text-ink-900 hover:text-brand-600">
                        {p.name}
                      </Link>
                      <button onClick={() => removeCompare(p.id)} className="mt-1 text-[11px] font-semibold text-ink-700/60 underline underline-offset-2 hover:text-brand-600">
                        Remove
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-ink-600/15">
                  <th className="p-2 font-semibold text-ink-700/70">Price</th>
                  {items.map((p) => (
                    <td key={p.id} className="p-2 text-[15px] font-semibold text-ink-900">
                      {ugx(p.price)}
                      {items.length > 1 && p.price === cheapest && <span className="ml-2 bg-green-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-800">Lowest</span>}
                    </td>
                  ))}
                </tr>
                {[
                  ["Brand", (p: CompareItem) => p.brand],
                  ["Condition", (p: CompareItem) => p.condition],
                  ["Category", (p: CompareItem) => p.category],
                ].map(([label, get]) => (
                  <tr key={label as string} className="border-t border-ink-600/10">
                    <th className="p-2 font-semibold text-ink-700/70">{label as string}</th>
                    {items.map((p) => (
                      <td key={p.id} className="p-2 text-ink-900">{(get as (p: CompareItem) => string)(p) || "—"}</td>
                    ))}
                  </tr>
                ))}
                {labels.map((label) => (
                  <tr key={label} className="border-t border-ink-600/10">
                    <th className="p-2 font-semibold text-ink-700/70">{label}</th>
                    {items.map((p) => (
                      <td key={p.id} className="p-2 text-ink-900">{p.rows.find(([k]) => k === label)?.[1] ?? "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
