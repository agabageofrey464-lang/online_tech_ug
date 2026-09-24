"use client";

import { useState } from "react";
import { Store } from "lucide-react";
import { RequestSent } from "@/components/request-sent";
import { submitRequest } from "@/lib/api";

const CATS = [
  // Tech
  "Computers & Laptops", "Phones & Accessories", "Components & Parts", "Networking", "Other electronics",
  // Open to all businesses — not just IT
  "Fashion & Clothing", "Home & Living", "Beauty & Health", "Food & Groceries",
  "Books & Stationery", "Agriculture", "General Services", "Other business",
];

export function VendorApply() {
  const [f, setF] = useState({ shop: "", owner: "", phone: "", email: "", category: CATS[0], products: "" });
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sent, setSent] = useState({ reference: "", emailed: false });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const k = "otu_vendor_applications";
      const list = JSON.parse(localStorage.getItem(k) || "[]");
      list.push({ ...f, at: new Date().toISOString() });
      localStorage.setItem(k, JSON.stringify(list));
    } catch {}

    const message =
      `Vendor application: ${f.shop}
` +
      `Category: ${f.category}

` +
      `What they sell:
${f.products}`;

    try {
      const res = await submitRequest({
        name: f.owner,
        phone: f.phone,
        email: f.email,
        subject: `Vendor application — ${f.shop}`,
        message,
      });
      setSent({ reference: res.reference, emailed: res.emailed });
      setDone(true);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "We couldn't send that. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  if (done) {
    return (
      <RequestSent
        title="Application received"
        reference={sent.reference}
        emailed={sent.emailed}
        next="Our team will review your shop, set up your vendor account and explain how payouts work — usually within one working day."
      />
    );
  }

  return (
    <form onSubmit={submit} className="rounded-card border border-ink-600/10 bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink-600">
        <Store size={20} className="text-brand-500" /> Apply to sell
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink-700">Shop / business name *</span>
          <input required value={f.shop} onChange={(e) => setF({ ...f, shop: e.target.value })} className={input} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink-700">Owner name *</span>
          <input required value={f.owner} onChange={(e) => setF({ ...f, owner: e.target.value })} className={input} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink-700">Phone *</span>
          <input required value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className={input} placeholder="07xx xxx xxx" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink-700">Email</span>
          <input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={input} />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-medium text-ink-700">What do you sell? *</span>
          <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className={input}>
            {CATS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="mt-4 block text-sm">
        <span className="mb-1 block font-medium text-ink-700">Tell us about your products *</span>
        <textarea
          required
          rows={3}
          value={f.products}
          onChange={(e) => setF({ ...f, products: e.target.value })}
          className={input}
          placeholder="e.g. brand-new & UK-used laptops, chargers, accessories — about 50 items in stock"
        />
      </label>
      {err && <p className="mt-4 text-sm font-semibold text-red-600">{err}</p>}
      <button
        type="submit"
        disabled={busy}
        className="press mt-5 rounded-md bg-brand-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
      >
        Submit application
      </button>
    </form>
  );
}
