"use client";

import { useCallback, useEffect, useState } from "react";
import { ugx } from "@/lib/api";

type VendorRow = {
  vendor_id: number;
  vendor_name: string;
  gross: number;
  commission: number;
  payout: number;
  paid: number;
  outstanding: number;
};

type Commissions = {
  total_commission: number;
  total_gross: number;
  vendor_payout_owed: number;
  total_paid: number;
  outstanding: number;
  vendors: VendorRow[];
};

type Payout = {
  id: number;
  vendor_name: string;
  amount: number;
  method: string;
  reference: string;
  created_at: string;
};

export default function CommissionsPage() {
  const [data, setData] = useState<Commissions | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [payFor, setPayFor] = useState<VendorRow | null>(null);
  const [form, setForm] = useState({ amount: "", method: "Mobile Money", reference: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([
        fetch("/api/commissions", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/payouts", { cache: "no-store" }).then((r) => r.json()),
      ]);
      if (c && typeof c.total_commission === "number") setData(c);
      setPayouts(Array.isArray(p) ? p : []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openPay(v: VendorRow) {
    setPayFor(v);
    setForm({ amount: String(v.outstanding > 0 ? v.outstanding : ""), method: "Mobile Money", reference: "" });
    setErr("");
  }

  async function savePayout(e: React.FormEvent) {
    e.preventDefault();
    if (!payFor) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor_id: payFor.vendor_id,
          amount: Number(form.amount) || 0,
          method: form.method,
          reference: form.reference,
        }),
      });
      if (!res.ok) {
        setErr("Couldn't record payout. Check the admin key in Settings.");
      } else {
        setPayFor(null);
        await load();
      }
    } catch {
      setErr("Couldn't record payout.");
    } finally {
      setBusy(false);
    }
  }

  const stats = [
    { label: "Your commission earned", value: ugx(data?.total_commission ?? 0), accent: true },
    { label: "Marketplace gross sales", value: ugx(data?.total_gross ?? 0) },
    { label: "Paid to vendors", value: ugx(data?.total_paid ?? 0) },
    { label: "Outstanding to vendors", value: ugx(data?.outstanding ?? 0) },
  ];

  const fmtDate = (iso: string) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink-600">Commissions &amp; payouts</h1>
        <p className="text-sm text-ink-600/60">
          Your marketplace earnings. Commission is charged 5–10% by item value; the rest is owed to each vendor.
        </p>
      </header>

      {loading ? (
        <p className="rounded-2xl border border-ink-600/10 bg-white p-8 text-center text-ink-600/50">Loading…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className={`rounded-2xl border p-5 shadow-sm ${s.accent ? "border-brand-300 bg-brand-500 text-white" : "border-ink-600/10 bg-white"}`}
              >
                <p className={`whitespace-nowrap text-lg font-extrabold leading-tight tabular-nums sm:text-xl ${s.accent ? "text-white" : "text-ink-600"}`}>{s.value}</p>
                <p className={`text-xs font-semibold ${s.accent ? "text-white/80" : "text-ink-600/60"}`}>{s.label}</p>
              </div>
            ))}
          </div>

          <section className="mt-6 rounded-2xl border border-ink-600/10 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-extrabold text-ink-600">Payouts by vendor</h2>
            {!data || data.vendors.length === 0 ? (
              <div className="rounded-lg border border-dashed border-ink-600/20 p-10 text-center text-sm text-ink-600/60">
                No marketplace sales yet. Vendor commissions will appear here after the first order.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-ink-600/10 text-[11px] uppercase tracking-wide text-ink-600/50">
                      <th className="py-2 pr-3 font-semibold">Vendor</th>
                      <th className="py-2 pr-3 text-right font-semibold">Gross</th>
                      <th className="py-2 pr-3 text-right font-semibold">Commission</th>
                      <th className="py-2 pr-3 text-right font-semibold">Paid</th>
                      <th className="py-2 pr-3 text-right font-semibold">Outstanding</th>
                      <th className="py-2 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.vendors.map((v) => (
                      <tr key={v.vendor_id} className="border-b border-ink-600/5">
                        <td className="py-3 pr-3 font-semibold text-ink-600">{v.vendor_name}</td>
                        <td className="py-3 pr-3 text-right text-ink-600">{ugx(v.gross)}</td>
                        <td className="py-3 pr-3 text-right font-semibold text-brand-600">{ugx(v.commission)}</td>
                        <td className="py-3 pr-3 text-right text-ink-600/70">{ugx(v.paid)}</td>
                        <td className="py-3 pr-3 text-right font-bold text-green-700">{ugx(v.outstanding)}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => openPay(v)}
                            disabled={v.outstanding <= 0}
                            className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Record payout
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="mt-6 rounded-2xl border border-ink-600/10 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-extrabold text-ink-600">Payout history</h2>
            {payouts.length === 0 ? (
              <p className="rounded-lg border border-dashed border-ink-600/20 p-8 text-center text-sm text-ink-600/60">
                No payouts recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-ink-600/10 text-[11px] uppercase tracking-wide text-ink-600/50">
                      <th className="py-2 pr-3 font-semibold">Date</th>
                      <th className="py-2 pr-3 font-semibold">Vendor</th>
                      <th className="py-2 pr-3 font-semibold">Method</th>
                      <th className="py-2 pr-3 font-semibold">Reference</th>
                      <th className="py-2 text-right font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p) => (
                      <tr key={p.id} className="border-b border-ink-600/5">
                        <td className="py-3 pr-3 text-ink-600/70">{fmtDate(p.created_at)}</td>
                        <td className="py-3 pr-3 font-semibold text-ink-600">{p.vendor_name}</td>
                        <td className="py-3 pr-3 text-ink-600/70">{p.method}</td>
                        <td className="py-3 pr-3 text-ink-600/70">{p.reference || "—"}</td>
                        <td className="py-3 text-right font-bold text-ink-600">{ugx(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {payFor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setPayFor(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-extrabold text-ink-600">Record payout</h3>
            <p className="mb-3 text-sm text-ink-600/60">
              To <b>{payFor.vendor_name}</b> · outstanding {ugx(payFor.outstanding)}
            </p>
            <form onSubmit={savePayout} className="space-y-3">
              <input
                type="number"
                min="0"
                required
                placeholder="Amount (UGX)"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              />
              <select
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
                className="w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option>Mobile Money</option>
                <option>Bank transfer</option>
                <option>Cash</option>
              </select>
              <input
                placeholder="Reference / txn id (optional)"
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                className="w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              />
              {err && <p className="text-xs font-semibold text-red-500">{err}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={busy} className="flex-1 rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">
                  {busy ? "Saving…" : "Record payout"}
                </button>
                <button type="button" onClick={() => setPayFor(null)} className="rounded-md border border-ink-600/20 px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
