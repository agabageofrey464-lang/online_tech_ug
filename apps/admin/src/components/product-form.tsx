"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageUpload } from "@/components/image-upload";
import { EMPTY_SPECS, emptyValues, type ProductFormValues } from "@/lib/product-form-data";

// Re-export so existing imports from this component keep working.
export { EMPTY_SPECS, emptyValues };
export type { ProductFormValues };

const CATEGORIES = ["Laptops", "Desktops", "Components", "Power", "Accessories", "Networking", "Storage"];
const CONDITIONS = ["Brand New", "UK Used", "Refurbished"];
const COMPUTER_CATS = ["Laptops", "Desktops"];

const SPEC_FIELDS: { key: keyof typeof EMPTY_SPECS; label: string; placeholder: string }[] = [
  { key: "type", label: "Type", placeholder: "Business Ultrabook, Gaming Laptop…" },
  { key: "processor", label: "Processor", placeholder: "Intel Core i5-1135G7" },
  { key: "generation", label: "Generation", placeholder: "11th Generation" },
  { key: "ram", label: "RAM", placeholder: "16GB DDR4" },
  { key: "storage", label: "Storage", placeholder: "512GB NVMe SSD" },
  { key: "graphics", label: "Graphics", placeholder: "Intel Iris Xe (integrated)" },
  { key: "display", label: "Display", placeholder: '14" Full HD (1920×1080)' },
  { key: "os", label: "Operating system", placeholder: "Windows 11 Pro" },
  { key: "battery", label: "Battery life", placeholder: "Up to 10 hours" },
  { key: "ports", label: "Ports & connectivity", placeholder: "USB-C, HDMI, Wi-Fi 6…" },
  { key: "build", label: "Build quality", placeholder: "Aluminium chassis" },
  { key: "purpose", label: "Best for", placeholder: "Office work, students…" },
];

/**
 * The single product form, shared by the "Add" and "Edit" pages so their fields
 * can never drift apart. `mode` decides the endpoint/method and whether Delete
 * is shown.
 */
export function ProductForm({
  mode,
  slug,
  initial,
}: {
  mode: "create" | "edit";
  slug?: string;
  initial: ProductFormValues;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ProductFormValues>(initial);
  const [showSpecs, setShowSpecs] = useState(
    COMPUTER_CATS.includes(initial.category) || Object.values(initial.specs).some(Boolean),
  );

  function set<K extends keyof ProductFormValues>(k: K, v: ProductFormValues[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    if (k === "category" && COMPUTER_CATS.includes(String(v))) setShowSpecs(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    let ok = false;
    try {
      const res = await fetch(mode === "create" ? "/api/products" : `/api/products/${slug}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) ok = true;
      else setError(data.detail || data.error || `Failed (${res.status})`);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
    if (ok) {
      router.push("/products");
      router.refresh();
    }
  }

  async function remove() {
    if (!confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    setError("");
    let ok = false;
    try {
      const res = await fetch(`/api/products/${slug}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) ok = true;
      else setError(data.detail || data.error || `Couldn't delete (${res.status})`);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setDeleting(false);
    }
    if (ok) {
      router.push("/products");
      router.refresh();
    }
  }

  const input =
    "w-full rounded-lg border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";
  const isComputer = COMPUTER_CATS.includes(form.category);

  return (
    <form onSubmit={submit} className="mt-6 grid gap-5 rounded-2xl border border-ink-600/10 bg-white p-6 shadow-sm">
      <div>
        <span className="mb-1.5 block text-sm font-medium text-ink-600">Product photo</span>
        <ImageUpload value={form.image_url} onChange={(url) => set("image_url", url)} />
        <p className="mt-1 text-xs text-ink-600/50">Large phone photos are shrunk automatically.</p>
      </div>

      <label className="text-sm">
        <span className="mb-1 block font-medium text-ink-600">Product name *</span>
        <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={input} placeholder="e.g. HP EliteBook 840 G8" />
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
          <input type="number" value={form.old_price_ugx} onChange={(e) => set("old_price_ugx", e.target.value)} className={input} placeholder="optional — shows a discount" />
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

      <div className="rounded-xl border border-ink-600/10 bg-ink-50/40">
        <button type="button" onClick={() => setShowSpecs((v) => !v)} className="flex w-full items-center justify-between px-4 py-3 text-left">
          <span className="text-sm font-bold text-ink-600">
            Specifications {isComputer && <span className="text-brand-600">(recommended for {form.category.toLowerCase()})</span>}
          </span>
          <span className="text-lg leading-none text-ink-600/50">{showSpecs ? "−" : "+"}</span>
        </button>
        {showSpecs && (
          <div className="grid gap-3 border-t border-ink-600/10 p-4 sm:grid-cols-2">
            {SPEC_FIELDS.map((f) => (
              <label key={f.key} className="text-sm">
                <span className="mb-1 block text-xs font-medium text-ink-600/80">{f.label}</span>
                <input
                  value={form.specs[f.key]}
                  onChange={(e) => setForm((s) => ({ ...s, specs: { ...s.specs, [f.key]: e.target.value } }))}
                  className={input}
                  placeholder={f.placeholder}
                />
              </label>
            ))}
          </div>
        )}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={saving || deleting} className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">
          {saving ? "Saving…" : mode === "create" ? "Save product" : "Save changes"}
        </button>
        <Link href="/products" className="rounded-lg border border-ink-600/20 px-5 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50">
          Cancel
        </Link>
        {mode === "edit" && (
          <button type="button" onClick={remove} disabled={saving || deleting} className="ml-auto rounded-lg border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-60">
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>
    </form>
  );
}
