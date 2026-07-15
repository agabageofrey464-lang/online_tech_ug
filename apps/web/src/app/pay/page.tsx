"use client";

import { useState } from "react";
import { site } from "@/lib/site";

const purposes = [
  "Vendor subscription",
  "Advert / marketing",
  "Freelancer subscription",
  "Website / software service",
  "Course / learning",
  "Order payment",
  "Other",
];

export default function PayPage() {
  const [form, setForm] = useState({
    payer_name: "",
    phone: "",
    amount: "",
    purpose: purposes[0],
    method: "MTN Mobile Money",
    txn_ref: "",
    note: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/_api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: parseInt(form.amount || "0", 10) }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  const momo = site.payment.momo;
  const momoAlt = site.payment.momoAlt;

  if (status === "done") {
    return (
      <section className="container-page py-16">
        <div className="mx-auto max-w-lg rounded-card border border-green-200 bg-green-50 p-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl">✓</div>
          <h1 className="text-2xl font-extrabold text-ink-900">Payment reported</h1>
          <p className="mt-2 text-sm text-ink-700/70">
            Thank you, {form.payer_name.split(" ")[0] || "friend"}. We&apos;ve received your payment details and our
            team will confirm it against our Mobile Money records shortly. You&apos;ll be notified once it&apos;s
            verified.
          </p>
          <a href="/" className="mt-6 inline-block rounded-full bg-brand-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-600">
            Back to home
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="container-page py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-extrabold text-ink-900">Confirm a payment</h1>
        <p className="mt-2 text-sm text-ink-700/65">
          Paid us on Mobile Money? Pay to one of the numbers below, then fill in the form so we can record and confirm
          your payment.
        </p>

        {/* Numbers to pay to */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[momo, momoAlt].map((m) => {
            const merchantId = (m as { merchantId?: string }).merchantId;
            return (
              <div key={m.number} className="rounded-card border border-ink-600/10 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-700/50">{m.provider}</p>
                <p className="mt-1 text-lg font-extrabold tracking-wide text-ink-900">{m.number}</p>
                <p className="text-xs text-ink-700/60">{m.name}</p>
                {merchantId && (
                  <p className="mt-1 text-xs font-bold text-brand-600">
                    Merchant ID: {merchantId} <span className="font-normal text-ink-700/50">(use “Pay Merchant”)</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <form onSubmit={submit} className="mt-8 space-y-4 rounded-card border border-ink-600/10 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name" required value={form.payer_name} onChange={(v) => set("payer_name", v)} placeholder="Full name" />
            <Field label="Phone you paid with" value={form.phone} onChange={(v) => set("phone", v)} placeholder="07XX XXX XXX" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Amount paid (UGX)" required type="number" value={form.amount} onChange={(v) => set("amount", v)} placeholder="50000" />
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink-800">Payment method</span>
              <select value={form.method} onChange={(e) => set("method", e.target.value)} className="w-full rounded-lg border border-ink-600/15 px-3 py-2.5 text-sm outline-none focus:border-brand-400">
                <option>MTN Mobile Money</option>
                <option>Airtel Money</option>
                <option>Bank transfer</option>
                <option>Cash</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink-800">What is it for?</span>
              <select value={form.purpose} onChange={(e) => set("purpose", e.target.value)} className="w-full rounded-lg border border-ink-600/15 px-3 py-2.5 text-sm outline-none focus:border-brand-400">
                {purposes.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <Field label="Transaction ID (from MoMo SMS)" value={form.txn_ref} onChange={(v) => set("txn_ref", v)} placeholder="e.g. 1234567890" />
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-ink-800">Note (optional)</span>
            <textarea value={form.note} onChange={(e) => set("note", e.target.value)} rows={2} className="w-full rounded-lg border border-ink-600/15 px-3 py-2.5 text-sm outline-none focus:border-brand-400" placeholder="Anything we should know about this payment" />
          </label>

          {status === "error" && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              Something went wrong. Please check your details and try again.
            </p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-full bg-brand-500 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {status === "sending" ? "Submitting…" : "Submit payment details"}
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-ink-800">
        {label} {required && <span className="text-brand-500">*</span>}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-ink-600/15 px-3 py-2.5 text-sm outline-none focus:border-brand-400"
      />
    </label>
  );
}
