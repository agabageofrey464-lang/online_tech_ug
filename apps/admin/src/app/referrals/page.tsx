"use client";

import { useCallback, useEffect, useState } from "react";
import { ugx } from "@/lib/api";

type Ref = {
  id: number;
  referrer_name: string;
  referrer_email: string;
  referrer_code: string;
  referred_name: string;
  order_reference: string;
  order_total: number;
  reward: number;
  status: string;
  created_at: string;
};

export default function ReferralsPage() {
  const [data, setData] = useState<{ total_owed: number; count: number; referrals: Ref[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/referrals", { cache: "no-store" });
      const json = await res.json();
      if (json && Array.isArray(json.referrals)) setData(json);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markPaid(id: number) {
    setBusy(id);
    try {
      const res = await fetch(`/api/referrals/${id}/paid`, { method: "POST" });
      if (res.ok) setData((d) => (d ? { ...d, referrals: d.referrals.map((r) => (r.id === id ? { ...r, status: "paid" } : r)) } : d));
    } finally {
      setBusy(null);
    }
  }

  const fmtDate = (iso: string) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink-600">Affiliate / Referrals</h1>
        <p className="text-sm text-ink-600/60">
          Customers earn 3% of orders made by people they refer. Pay out the pending rewards, then mark them paid.
        </p>
      </header>

      {loading ? (
        <p className="rounded-2xl border border-ink-600/10 bg-white p-8 text-center text-ink-600/50">Loading…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-brand-300 bg-brand-500 p-5 text-white shadow-sm">
              <p className="whitespace-nowrap text-xl font-extrabold tabular-nums">{ugx(data?.total_owed ?? 0)}</p>
              <p className="text-xs font-semibold text-white/80">Rewards owed (pending)</p>
            </div>
            <div className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
              <p className="text-xl font-extrabold text-ink-600">{data?.count ?? 0}</p>
              <p className="text-xs font-semibold text-ink-600/60">Total referrals</p>
            </div>
          </div>

          <section className="mt-6 rounded-2xl border border-ink-600/10 bg-white p-6 shadow-sm">
            {!data || data.referrals.length === 0 ? (
              <div className="rounded-lg border border-dashed border-ink-600/20 p-10 text-center text-sm text-ink-600/60">
                No referrals yet. They appear when a customer orders using someone&apos;s referral code.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-ink-600/10 text-[11px] uppercase tracking-wide text-ink-600/50">
                      <th className="py-2 pr-3 font-semibold">Date</th>
                      <th className="py-2 pr-3 font-semibold">Referrer</th>
                      <th className="py-2 pr-3 font-semibold">Referred order</th>
                      <th className="py-2 pr-3 text-right font-semibold">Order total</th>
                      <th className="py-2 pr-3 text-right font-semibold">Reward</th>
                      <th className="py-2 pr-3 font-semibold">Status</th>
                      <th className="py-2 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.referrals.map((r) => (
                      <tr key={r.id} className="border-b border-ink-600/5">
                        <td className="py-3 pr-3 text-ink-600/70">{fmtDate(r.created_at)}</td>
                        <td className="py-3 pr-3">
                          <p className="font-semibold text-ink-600">{r.referrer_name}</p>
                          <p className="text-xs text-ink-600/50">{r.referrer_email} · <span className="font-mono">{r.referrer_code}</span></p>
                        </td>
                        <td className="py-3 pr-3 text-ink-600">
                          {r.referred_name} <span className="font-mono text-xs text-ink-600/50">{r.order_reference}</span>
                        </td>
                        <td className="py-3 pr-3 text-right text-ink-600">{ugx(r.order_total)}</td>
                        <td className="py-3 pr-3 text-right font-bold text-green-700">{ugx(r.reward)}</td>
                        <td className="py-3 pr-3">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${r.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {r.status !== "paid" && (
                            <button onClick={() => markPaid(r.id)} disabled={busy === r.id} className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-600 disabled:opacity-50">
                              {busy === r.id ? "…" : "Mark paid"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
