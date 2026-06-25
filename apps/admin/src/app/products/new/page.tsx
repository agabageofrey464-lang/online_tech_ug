"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORIES = ["Laptops", "Desktops", "Components", "Power", "Accessories", "Networking", "Storage"];
const CONDITIONS = ["Brand New", "UK Used", "Refurbished"];

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: "Accessories",
    brand: "",
    condition: "Brand New",
    price_ugx: "",
    old_price_ugx: "",
    description: "",
    in_stock: true,
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.push("/products");
        router.refresh();
      } else {
        setError(data.detail || data.error || `Failed (${res.status})`);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const input =
    "w-full rounded-lg border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div className="max-w-2xl">
      <Link href="/products" className="text-sm font-semibold text-brand-600 hover:underline">
        ← Back to products
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold text-ink-600">Add product</h1>
      <p className="text-sm text-ink-600/60">New products become orderable immediately.</p>

      <form onSubmit={submit} className="mt-6 grid gap-4 rounded-2xl border border-ink-600/10 bg-white p-6 shadow-sm">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink-600">Product name *</span>
          <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={input} placeholder="e.g. HP Wireless Mouse" />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-ink-600">Category *</span>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className={input}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-ink-600">Condition</span>
            <select value={form.condition} onChange={(e) => set("condition", e.target.value)} className={input}>
              {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-ink-600">Brand</span>
            <input value={form.brand} onChange={(e) => set("brand", e.target.value)} className={input} placeholder="e.g. HP" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-ink-600">Price (UGX) *</span>
            <input required type="number" value={form.price_ugx} onChange={(e) => set("price_ugx", e.target.value)} className={input} placeholder="80000" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-ink-600">Old price (UGX)</span>
            <input type="number" value={form.old_price_ugx} onChange={(e) => set("old_price_ugx", e.target.value)} className={input} placeholder="optional" />
          </label>
          <label className="flex items-center gap-2 self-end text-sm font-medium text-ink-600">
            <input type="checkbox" checked={form.in_stock} onChange={(e) => set("in_stock", e.target.checked)} className="h-4 w-4" />
            In stock
          </label>
        </div>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink-600">Short description</span>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className={input} placeholder="Key features, separated by commas" />
        </label>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">
            {saving ? "Saving…" : "Save product"}
          </button>
          <Link href="/products" className="rounded-lg border border-ink-600/20 px-5 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50">
            Cancel
          </Link>
        </div>
        <p className="text-xs text-ink-600/50">
          Tip: a placeholder image is used until a photo is uploaded for this product.
        </p>
      </form>
    </div>
  );
}
