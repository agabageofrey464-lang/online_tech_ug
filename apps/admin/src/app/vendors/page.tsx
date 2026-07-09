"use client";

import { useCallback, useEffect, useState } from "react";

type Vendor = {
  id: number;
  name: string;
  email: string;
  phone: string;
  business_name: string;
  vendor_approved: boolean;
  products: number;
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vendors", { cache: "no-store" });
      const data = await res.json();
      setVendors(Array.isArray(data) ? data : []);
    } catch {
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setApproved(v: Vendor, approved: boolean) {
    setBusy(v.id);
    try {
      const res = await fetch(`/api/vendors/${v.id}/approve?approved=${approved}`, { method: "POST" });
      if (res.ok) setVendors((prev) => prev.map((x) => (x.id === v.id ? { ...x, vendor_approved: approved } : x)));
    } finally {
      setBusy(null);
    }
  }

  const pending = vendors.filter((v) => !v.vendor_approved).length;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink-600">Vendors</h1>
        <p className="text-sm text-ink-600/60">
          {vendors.length} vendor(s) · {pending} awaiting approval. Approved vendors can list products on the marketplace.
        </p>
      </header>

      {loading ? (
        <p className="rounded-2xl border border-ink-600/10 bg-white p-8 text-center text-ink-600/50">Loading…</p>
      ) : vendors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-600/20 bg-white p-10 text-center text-ink-600/60">
          No vendors yet. People who sign up as vendors on the storefront will appear here for approval.
        </div>
      ) : (
        <div className="space-y-3">
          {vendors.map((v) => (
            <div key={v.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-xl">🏪</span>
                <div>
                  <p className="font-bold text-ink-600">{v.business_name || v.name}</p>
                  <p className="text-sm text-ink-600/60">{v.name} · {v.email} · {v.phone || "no phone"}</p>
                  <p className="text-xs text-ink-600/50">{v.products} product(s) listed</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {v.vendor_approved ? (
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">✓ Approved</span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">⏳ Pending</span>
                )}
                {v.vendor_approved ? (
                  <button onClick={() => setApproved(v, false)} disabled={busy === v.id} className="rounded-md border border-ink-600/20 px-3 py-1.5 text-sm font-semibold text-ink-600 hover:bg-ink-50 disabled:opacity-50">
                    Revoke
                  </button>
                ) : (
                  <button onClick={() => setApproved(v, true)} disabled={busy === v.id} className="rounded-md bg-green-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50">
                    {busy === v.id ? "…" : "Approve"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
