"use client";

import { useCallback, useEffect, useState } from "react";
import { ugx } from "@/lib/api";

type Payment = {
  id: number;
  payer_name: string;
  phone: string;
  amount: number;
  purpose: string;
  method: string;
  txn_ref: string;
  note: string;
  status: string;
  created_at: string;
};

type Data = { total_confirmed: number; pending: number; count: number; payments: Payment[] };

const statusStyle: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-600",
};

export default function PaymentsPage() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments", { cache: "no-store" });
      const json = await res.json();
      if (json && Array.isArray(json.payments)) setData(json);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: number, status: string) {
    setBusy(id);
    try {
      const res = await fetch(`/api/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) await load();
    } finally {
      setBusy(null);
    }
  }

  const fmtDate = (iso: string) =>
    iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink-600">Payments</h1>
        <p className="text-sm text-ink-600/60">
          Mobile Money payments customers, vendors and advertisers report after paying. Confirm each one against your
          MoMo statement, then it counts towards your confirmed total.
        </p>
      </header>

      {loading ? (
        <p className="rounded-2xl border border-ink-600/10 bg-white p-8 text-center text-ink-600/50">Loading…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-brand-300 bg-brand-500 p-5 text-white shadow-sm">
              <p className="whitespace-nowrap text-xl font-extrabold tabular-nums">{ugx(data?.total_confirmed ?? 0)}</p>
              <p className="text-xs font-semibold text-white/80">Confirmed total</p>
            </div>
            <div className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
              <p className="text-xl font-extrabold text-amber-600">{data?.pending ?? 0}</p>
              <p className="text-xs font-semibold text-ink-600/60">Awaiting confirmation</p>
            </div>
            <div className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
              <p className="text-xl font-extrabold text-ink-600">{data?.count ?? 0}</p>
              <p className="text-xs font-semibold text-ink-600/60">Total reported</p>
            </div>
          </div>

          <section className="mt-6 rounded-2xl border border-ink-600/10 bg-white p-6 shadow-sm">
            {!data || data.payments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-ink-600/20 p-10 text-center text-sm text-ink-600/60">
                No payments reported yet. They appear here when someone submits the &ldquo;confirm payment&rdquo; form
                after paying you on Mobile Money.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-ink-600/10 text-[11px] uppercase tracking-wide text-ink-600/50">
                      <th className="py-2 pr-3 font-semibold">Date</th>
                      <th className="py-2 pr-3 font-semibold">Payer</th>
                      <th className="py-2 pr-3 font-semibold">For</th>
                      <th className="py-2 pr-3 font-semibold">Method / Ref</th>
                      <th className="py-2 pr-3 text-right font-semibold">Amount</th>
                      <th className="py-2 pr-3 font-semibold">Status</th>
                      <th className="py-2 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.payments.map((p) => (
                      <tr key={p.id} className="border-b border-ink-600/5 align-top">
                        <td className="py-3 pr-3 text-ink-600/70 whitespace-nowrap">{fmtDate(p.created_at)}</td>
                        <td className="py-3 pr-3">
                          <p className="font-semibold text-ink-600">{p.payer_name}</p>
                          <p className="text-xs text-ink-600/50">{p.phone}</p>
                        </td>
                        <td className="py-3 pr-3 text-ink-600">
                          {p.purpose || "—"}
                          {p.note && <p className="text-xs text-ink-600/50">{p.note}</p>}
                        </td>
                        <td className="py-3 pr-3 text-ink-600/70">
                          {p.method}
                          {p.txn_ref && <p className="font-mono text-xs text-ink-600/50">{p.txn_ref}</p>}
                        </td>
                        <td className="py-3 pr-3 text-right font-bold text-ink-600">{ugx(p.amount)}</td>
                        <td className="py-3 pr-3">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${statusStyle[p.status] ?? "bg-ink-600/10 text-ink-600/60"}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {p.status !== "confirmed" && (
                            <button
                              onClick={() => setStatus(p.id, "confirmed")}
                              disabled={busy === p.id}
                              className="mb-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              {busy === p.id ? "…" : "Confirm"}
                            </button>
                          )}
                          {p.status !== "rejected" && (
                            <button
                              onClick={() => setStatus(p.id, "rejected")}
                              disabled={busy === p.id}
                              className="ml-1 rounded-md border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              Reject
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
