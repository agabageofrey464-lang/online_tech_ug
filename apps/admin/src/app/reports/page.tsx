"use client";

import { useEffect, useState } from "react";
import { ugx } from "@/lib/api";
import { RevenueChart, StatusBars, Donut, RankedBars } from "@/components/charts";

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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {cards.map((c) => (
              <div key={c.label} className={`min-w-0 rounded-2xl border p-4 shadow-sm ${c.accent ? "border-brand-300 bg-brand-500 text-white" : "border-ink-600/10 bg-white"}`}>
                <p className={`break-words text-base font-extrabold leading-tight tabular-nums sm:text-lg ${c.accent ? "text-white" : "text-ink-600"}`}>{c.value}</p>
                <p className={`mt-0.5 text-[11px] font-semibold leading-snug ${c.accent ? "text-white/80" : "text-ink-600/60"}`}>{c.label}</p>
              </div>
            ))}
          </div>

          {/* Revenue by day */}
          <section className="mt-6 rounded-2xl border border-ink-600/10 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-extrabold text-ink-600">Revenue — last {days} days</h2>
            <RevenueChart data={data?.by_day ?? []} height={180} />
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-600/60">
              <span>Paid: <b className="text-ink-600">{ugx(data?.paid_revenue ?? 0)}</b></span>
              <span>Pending: <b className="text-ink-600">{ugx(data?.pending_revenue ?? 0)}</b></span>
              <span>Avg order: <b className="text-ink-600">{ugx(data?.avg_order ?? 0)}</b></span>
            </div>
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Top products */}
            <section className="rounded-2xl border border-ink-600/10 bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-extrabold text-ink-600">Best sellers</h2>
              <RankedBars
                data={(data?.top_products ?? []).map((p) => ({ name: `${p.name} ×${p.qty}`, value: p.revenue }))}
                format={(n) => ugx(n)}
              />
            </section>

            {/* Order status breakdown */}
            <section className="rounded-2xl border border-ink-600/10 bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-extrabold text-ink-600">Orders by status</h2>
              <StatusBars
                data={Object.entries(data?.status_counts ?? {}).map(([label, value]) => ({
                  label,
                  value: value as number,
                  tone:
                    label === "delivered" ? "#00a651"
                    : label === "cancelled" ? "#e63946"
                    : label === "shipped" ? "#5a5cae"
                    : "#f15a29",
                }))}
              />
              <div className="mt-5 border-t border-ink-600/10 pt-4">
                <Donut
                  value={data?.paid_revenue ?? 0}
                  total={(data?.paid_revenue ?? 0) + (data?.pending_revenue ?? 0)}
                  label="of revenue collected"
                  color="#00a651"
                />
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
