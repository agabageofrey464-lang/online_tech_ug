"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const PAYMENTS = ["pending", "unpaid", "paid", "refunded"];

export function OrderStatusControls({
  reference,
  status,
  paymentStatus,
}: {
  reference: string;
  status: string;
  paymentStatus: string;
}) {
  const router = useRouter();
  const [s, setS] = useState(status);
  const [p, setP] = useState(paymentStatus);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function update(next: { status?: string; payment_status?: string }) {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`/api/orders/${reference}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setMsg(d.detail || "Update failed.");
      } else {
        if (next.status) setS(next.status);
        if (next.payment_status) setP(next.payment_status);
        setMsg("✓ Saved");
        router.refresh();
        setTimeout(() => setMsg(""), 2000);
      }
    } catch {
      setMsg("Update failed.");
    } finally {
      setBusy(false);
    }
  }

  const sel = "rounded-lg border border-ink-600/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <section className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
      <h2 className="text-xs font-bold uppercase tracking-wider text-ink-600/50">Update order</h2>

      {/* Quick action */}
      <button
        onClick={() => update({ status: "delivered", payment_status: "paid" })}
        disabled={busy}
        className="mt-3 w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-60"
      >
        ✓ Mark Delivered &amp; Paid
      </button>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink-600/70">Fulfilment status</span>
          <select value={s} onChange={(e) => setS(e.target.value)} disabled={busy} className={`w-full ${sel}`}>
            {STATUSES.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink-600/70">Payment status</span>
          <select value={p} onChange={(e) => setP(e.target.value)} disabled={busy} className={`w-full ${sel}`}>
            {PAYMENTS.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>
      </div>

      {/* Apply the chosen status/payment */}
      <button
        onClick={() => update({ status: s, payment_status: p })}
        disabled={busy || (s === status && p === paymentStatus)}
        className="mt-4 w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Saving…" : "Apply changes"}
      </button>

      {msg && <p className="mt-3 text-center text-sm font-semibold text-green-600">{msg}</p>}
    </section>
  );
}
