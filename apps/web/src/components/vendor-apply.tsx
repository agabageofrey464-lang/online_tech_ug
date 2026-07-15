"use client";

import { useState } from "react";
import { CheckCircle2, Store } from "lucide-react";
import { whatsappLink, site } from "@/lib/site";

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

  function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const k = "otu_vendor_applications";
      const list = JSON.parse(localStorage.getItem(k) || "[]");
      list.push({ ...f, at: new Date().toISOString() });
      localStorage.setItem(k, JSON.stringify(list));
    } catch {}
    const msg =
      `Hello Online Tech Uganda! I'd like to SELL on your platform.\n` +
      `Shop: ${f.shop}\nOwner: ${f.owner}\nPhone: ${f.phone}` +
      `${f.email ? `\nEmail: ${f.email}` : ""}\nCategory: ${f.category}\nProducts: ${f.products}`;
    window.open(whatsappLink(msg), "_blank");
    setDone(true);
  }

  const input =
    "w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  if (done) {
    return (
      <div className="rounded-card border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle2 className="mx-auto text-green-600" size={44} />
        <h2 className="mt-3 text-lg font-extrabold text-ink-700">Application received!</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-700/70">
          We&apos;ve opened WhatsApp with your details. Our team will review and set up your vendor account,
          then explain payouts. You can also call {site.phoneDisplay}.
        </p>
      </div>
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
      <button type="submit" className="mt-5 rounded-md bg-brand-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-600">
        Submit application
      </button>
    </form>
  );
}
