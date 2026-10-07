"use client";

import { useState } from "react";
import { BellRing, Check } from "lucide-react";

/**
 * "Tell me when it's back" — for a product we have run out of.
 *
 * An out-of-stock page was a dead end: a greyed-out button and nothing to do
 * but leave. This takes a name and a phone number and puts the request in the
 * admin's Leads, tagged with the product, so the shop can call when stock
 * arrives. It is a person following up, not an automatic message — which is
 * what the note under the button promises.
 */
export function StockAlert({ productName, slug }: { productName: string; slug: string }) {
  const [form, setForm] = useState({ name: "", phone: "" });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/_api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          subject: `Stock alert: ${productName}`.slice(0, 200),
          message: `Please tell me when "${productName}" is back in stock. (Product: /shop/${slug})`,
        }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="flex items-start gap-2 rounded-lg bg-green-50 px-3 py-3 text-sm font-semibold text-green-700">
        <Check size={18} className="mt-0.5 shrink-0" />
        Got it. We&apos;ll call or WhatsApp you as soon as it is back in stock.
      </p>
    );
  }

  const input =
    "w-full min-w-0 rounded-lg border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <form onSubmit={submit} className="rounded-lg border border-brand-200 bg-brand-50/60 p-3">
      <p className="flex items-center gap-2 text-sm font-extrabold text-ink-900">
        <BellRing size={16} className="text-brand-600" /> Tell me when it&apos;s back
      </p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <input required minLength={2} maxLength={160} placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
        <input required minLength={5} maxLength={40} inputMode="tel" placeholder="Phone / WhatsApp number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={input} />
      </div>
      <button type="submit" disabled={state === "sending"} className="press mt-2 w-full rounded-lg bg-brand-500 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60">
        {state === "sending" ? "Sending…" : "Notify me"}
      </button>
      {state === "error" ? (
        <p className="mt-1.5 text-xs font-semibold text-red-600">That didn&apos;t go through. Please check the number and try again.</p>
      ) : (
        <p className="mt-1.5 text-xs text-ink-700/60">One of our team will contact you. We won&apos;t use your number for anything else.</p>
      )}
    </form>
  );
}
