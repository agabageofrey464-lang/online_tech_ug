"use client";

import { useCallback, useEffect, useState } from "react";
import { ugx } from "@/lib/api";

type Item = {
  slug: string;
  name: string;
  category: string;
  price_ugx: number;
  in_stock: boolean;
  stock_qty: number;
  image_url: string;
};

const LOW = 5;

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory", { cache: "no-store" });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveStock(slug: string) {
    const raw = edits[slug];
    if (raw === undefined) return;
    const qty = Math.max(0, Number(raw) || 0);
    setSaving(slug);
    try {
      const res = await fetch(`/api/inventory/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock_qty: qty }),
      });
      if (res.ok) {
        const updated = await res.json();
        setItems((prev) => prev.map((it) => (it.slug === slug ? { ...it, stock_qty: updated.stock_qty, in_stock: updated.in_stock } : it)));
        setEdits((e) => { const n = { ...e }; delete n[slug]; return n; });
      }
    } finally {
      setSaving(null);
    }
  }

  const lowCount = items.filter((i) => i.stock_qty > 0 && i.stock_qty <= LOW).length;
  const outCount = items.filter((i) => i.stock_qty === 0).length;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink-600">Inventory</h1>
        <p className="text-sm text-ink-600/60">
          {items.length} product(s) · <span className="font-semibold text-amber-600">{lowCount} low</span> · <span className="font-semibold text-red-600">{outCount} out of stock</span>. Stock drops automatically as orders come in.
        </p>
      </header>

      {loading ? (
        <p className="rounded-2xl border border-ink-600/10 bg-white p-8 text-center text-ink-600/50">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-600/20 bg-white p-10 text-center text-ink-600/60">
          No products in the catalog yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-600/10 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-ink-600/10 bg-ink-50 text-[11px] uppercase tracking-wider text-ink-600/60">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Price</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">In stock</th>
                <th className="p-4 text-right">Update</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const low = it.stock_qty > 0 && it.stock_qty <= LOW;
                const out = it.stock_qty === 0;
                const val = edits[it.slug] ?? String(it.stock_qty);
                return (
                  <tr key={it.slug} className={`border-b border-ink-600/5 ${out ? "bg-red-50/40" : low ? "bg-amber-50/40" : ""}`}>
                    <td className="p-4">
                      <p className="font-semibold text-ink-600">{it.name}</p>
                      <p className="text-xs text-ink-600/50">{it.category}</p>
                    </td>
                    <td className="p-4 text-ink-600">{ugx(it.price_ugx)}</td>
                    <td className="p-4 text-center">
                      {out ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">Out of stock</span>
                      ) : low ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Low ({it.stock_qty})</span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">In stock</span>
                      )}
                    </td>
                    <td className="p-4 text-center font-bold text-ink-600">{it.stock_qty}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          min="0"
                          value={val}
                          onChange={(e) => setEdits((prev) => ({ ...prev, [it.slug]: e.target.value }))}
                          className="w-20 rounded-md border border-ink-600/15 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
                        />
                        <button
                          onClick={() => saveStock(it.slug)}
                          disabled={saving === it.slug || edits[it.slug] === undefined}
                          className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-600 disabled:opacity-40"
                        >
                          {saving === it.slug ? "…" : "Save"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
