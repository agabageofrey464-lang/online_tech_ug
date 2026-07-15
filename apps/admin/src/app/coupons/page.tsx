"use client";

import { useCallback, useEffect, useState } from "react";
import { ugx } from "@/lib/api";

type Coupon = {
  id: number;
  code: string;
  discount_type: "percent" | "fixed";
  value: number;
  min_subtotal: number;
  max_uses: number;
  used_count: number;
  active: boolean;
  expires_at: string | null;
};

const emptyForm = {
  code: "",
  discount_type: "percent",
  value: "10",
  min_subtotal: "0",
  max_uses: "0",
  active: true,
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coupons", { cache: "no-store" });
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          discount_type: form.discount_type,
          value: Number(form.value) || 0,
          min_subtotal: Number(form.min_subtotal) || 0,
          max_uses: Number(form.max_uses) || 0,
          active: form.active,
        }),
      });
      if (!res.ok) {
        setErr("Couldn't create. Code may already exist, or check the admin key.");
      } else {
        setForm(emptyForm);
        await load();
      }
    } catch {
      setErr("Couldn't create coupon.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this coupon?")) return;
    const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    if (res.ok) setCoupons((prev) => prev.filter((c) => c.id !== id));
  }

  const input = "w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink-600">Coupons &amp; discounts</h1>
        <p className="text-sm text-ink-600/60">
          Create discount codes customers enter at checkout. Percent or fixed UGX, with optional minimum order and usage limit.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Create form */}
        <form onSubmit={create} className="h-fit space-y-3 rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
          <h2 className="font-extrabold text-ink-600">New coupon</h2>
          <input required placeholder="CODE (e.g. SAVE10)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className={input} />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className={input}>
              <option value="percent">Percent %</option>
              <option value="fixed">Fixed UGX</option>
            </select>
            <input required type="number" min="0" placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className={input} />
          </div>
          <input type="number" min="0" placeholder="Min order (UGX, 0 = none)" value={form.min_subtotal} onChange={(e) => setForm({ ...form, min_subtotal: e.target.value })} className={input} />
          <input type="number" min="0" placeholder="Max uses (0 = unlimited)" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} className={input} />
          <label className="flex items-center gap-2 text-sm text-ink-600">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active
          </label>
          {err && <p className="text-xs font-semibold text-red-500">{err}</p>}
          <button type="submit" disabled={busy} className="w-full rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">
            {busy ? "Creating…" : "Create coupon"}
          </button>
        </form>

        {/* List */}
        <div className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-extrabold text-ink-600">Active codes</h2>
          {loading ? (
            <p className="p-6 text-center text-ink-600/50">Loading…</p>
          ) : coupons.length === 0 ? (
            <p className="rounded-lg border border-dashed border-ink-600/20 p-8 text-center text-sm text-ink-600/60">
              No coupons yet. Create your first discount code on the left.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-600/10 text-[11px] uppercase tracking-wide text-ink-600/50">
                    <th className="py-2 pr-3 font-semibold">Code</th>
                    <th className="py-2 pr-3 font-semibold">Discount</th>
                    <th className="py-2 pr-3 font-semibold">Min order</th>
                    <th className="py-2 pr-3 font-semibold">Used</th>
                    <th className="py-2 pr-3 font-semibold">Status</th>
                    <th className="py-2 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id} className="border-b border-ink-600/5">
                      <td className="py-3 pr-3 font-mono font-bold text-ink-600">{c.code}</td>
                      <td className="py-3 pr-3 text-ink-600">
                        {c.discount_type === "percent" ? `${c.value}%` : ugx(c.value)}
                      </td>
                      <td className="py-3 pr-3 text-ink-600/70">{c.min_subtotal ? ugx(c.min_subtotal) : "—"}</td>
                      <td className="py-3 pr-3 text-ink-600/70">{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ""}</td>
                      <td className="py-3 pr-3">
                        {c.active ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">Active</span>
                        ) : (
                          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-semibold text-ink-600/60">Off</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button onClick={() => remove(c.id)} className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
