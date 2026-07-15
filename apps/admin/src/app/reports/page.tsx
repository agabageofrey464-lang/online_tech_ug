"use client";

import { useEffect, useState } from "react";
import { ugx } from "@/lib/api";

type Report = {
  revenue: number;
  paid_revenue: number;
  pending_revenue: number;
  discounts: number;
  orders: number;
  delivered: number;
  pending: number;
  avg_order: number;
  by_day: { date: string; revenue: number; orders: number }[];
  status_counts: Record<string, number>;
  top_products: { name: string; revenue: number; qty: number }[];
};

export default function ReportsPage() {
  const [data, setData] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(14);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/report?days=${days}`, { cache: "no-store" });
        const json = await res.json();
        if (json && typeof json.revenue === "number") setData(json);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [days]);

  const maxRev = data ? Math.max(1, ...data.by_day.map((d) => d.revenue)) : 1;

  const cards = [
    { label: "Revenue received (paid)", value: ugx(data?.paid_revenue ?? 0), accent: true },
    { label: "Pending (awaiting payment)", value: ugx(data?.pending_revenue ?? 0) },
    { label: "Orders", value: String(data?.orders ?? 0) },
    { label: "Avg order value", value: ugx(data?.avg_order ?? 0) },
    { label: "Discounts given", value: ugx(data?.discounts ?? 0) },
  ];

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-600">Sales report</h1>
          <p className="text-sm text-ink-600/60">Revenue, orders and best sellers at a glance.</p>
        </div>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="rounded-md border border-ink-600/15 px-3 py-2 text-sm">
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </header>

      {loading ? (
        <p className="rounded-2xl border border-ink-600/10 bg-white p-8 text-center text-ink-600/50">Loading…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {cards.map((c) => (
              <div key={c.label} className={`rounded-2xl border p-5 shadow-sm ${c.accent ? "border-brand-300 bg-brand-500 text-white" : "border-ink-600/10 bg-white"}`}>
                <p className={`whitespace-nowrap text-lg font-extrabold leading-tight tabular-nums sm:text-xl ${c.accent ? "text-white" : "text-ink-600"}`}>{c.value}</p>
                <p className={`text-xs font-semibold ${c.accent ? "text-white/80" : "text-ink-600/60"}`}>{c.label}</p>
              </div>
            ))}
          </div>

          {/* Revenue by day */}
          <section className="mt-6 rounded-2xl border border-ink-600/10 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-extrabold text-ink-600">Revenue — last {days} days</h2>
            <div className="flex items-end gap-1.5 overflow-x-auto" style={{ height: 180 }}>
              {data?.by_day.map((d) => (
                <div key={d.date} className="flex min-w-[24px] flex-1 flex-col items-center justify-end gap-1" title={`${d.date}: ${ugx(d.revenue)} (${d.orders} orders)`}>
                  <div
                    className="w-full rounded-t bg-brand-500/80 transition-all"
                    style={{ height: `${Math.max(2, (d.revenue / maxRev) * 150)}px` }}
                  />
                  <span className="text-[9px] text-ink-600/50">{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Top products */}
            <section className="rounded-2xl border border-ink-600/10 bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-extrabold text-ink-600">Best sellers</h2>
              {!data || data.top_products.length === 0 ? (
                <p className="text-sm text-ink-600/60">No sales yet.</p>
              ) : (
                <ul className="space-y-2">
                  {data.top_products.map((p, i) => (
                    <li key={p.name} className="flex items-center justify-between gap-3 border-b border-ink-600/5 pb-2 text-sm">
                      <span className="flex items-center gap-2 text-ink-600">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">{i + 1}</span>
                        {p.name} <span className="text-ink-600/50">×{p.qty}</span>
                      </span>
                      <span className="font-bold text-ink-600">{ugx(p.revenue)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Order status breakdown */}
            <section className="rounded-2xl border border-ink-600/10 bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-extrabold text-ink-600">Orders by status</h2>
              {!data || Object.keys(data.status_counts).length === 0 ? (
                <p className="text-sm text-ink-600/60">No orders yet.</p>
              ) : (
                <ul className="space-y-2">
                  {Object.entries(data.status_counts).map(([status, n]) => (
                    <li key={status} className="flex items-center justify-between text-sm">
                      <span className="capitalize text-ink-600">{status}</span>
                      <span className="font-bold text-ink-600">{n}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
