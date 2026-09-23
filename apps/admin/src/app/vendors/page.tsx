"use client";

import { useCallback, useEffect, useState } from "react";
import { partnerMessage } from "@/lib/auto-message";
import { ReplyButton, PARTNER_TEMPLATES } from "@/components/reply-button";
import { ImageUpload } from "@/components/image-upload";
import { SubscriptionControl } from "@/components/subscription-control";

type Vendor = {
  id: number;
  name: string;
  email: string;
  phone: string;
  business_name: string;
  vendor_approved: boolean;
  products: number;
  verified: boolean;
  id_number: string;
  business_reg: string;
  has_document: boolean;
  subscription_ends: string | null;
  business_category: string;
  location: string;
};

type VendorImpact = {
  id: number;
  name: string;
  email: string;
  products: number;
  messages: number;
  payouts: number;
  sold_items: number;
};

type PendingProduct = {
  id: number;
  vendor_name: string;
  name: string;
  category: string;
  price_ugx: number;
  image_url: string;
  approved: boolean;
};

const ugx = (n: number) =>
  new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(n);

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [pBusy, setPBusy] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ business_name: "", owner_name: "", email: "", phone: "", password: "" });
  const [addBusy, setAddBusy] = useState(false);
  const [addErr, setAddErr] = useState("");
  const [addResult, setAddResult] = useState<{ email: string; password: string } | null>(null);
  const [showProd, setShowProd] = useState(false);
  const [prodForm, setProdForm] = useState({ vendor_id: "", name: "", category: "Accessories", price_ugx: "", image_url: "", description: "" });
  const [prodBusy, setProdBusy] = useState(false);
  const [prodMsg, setProdMsg] = useState("");
  // Delete-vendor flow
  const [delTarget, setDelTarget] = useState<Vendor | null>(null);
  const [impact, setImpact] = useState<VendorImpact | null>(null);
  const [delBusy, setDelBusy] = useState(false);
  const [delErr, setDelErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, pRes] = await Promise.all([
        fetch("/api/vendors", { cache: "no-store" }),
        fetch("/api/vendor-products?pending_only=true", { cache: "no-store" }),
      ]);
      const vData = await vRes.json();
      const pData = await pRes.json();
      setVendors(Array.isArray(vData) ? vData : []);
      setPendingProducts(Array.isArray(pData) ? pData : []);
    } catch {
      setVendors([]);
      setPendingProducts([]);
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

  async function setVerified(v: Vendor, verified: boolean) {
    setBusy(v.id);
    try {
      const res = await fetch(`/api/vendors/${v.id}/verify?verified=${verified}`, { method: "POST" });
      if (res.ok) setVendors((prev) => prev.map((x) => (x.id === v.id ? { ...x, verified } : x)));
    } finally {
      setBusy(null);
    }
  }

  // Open the confirm dialog and load exactly what would be removed.
  async function askDelete(v: Vendor) {
    setDelTarget(v);
    setImpact(null);
    setDelErr("");
    try {
      const res = await fetch(`/api/vendors/${v.id}`, { cache: "no-store" });
      if (res.ok) setImpact(await res.json());
    } catch {
      /* dialog still works without the summary */
    }
  }

  async function confirmDelete() {
    if (!delTarget) return;
    setDelBusy(true);
    setDelErr("");
    try {
      const res = await fetch(`/api/vendors/${delTarget.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDelErr(data.detail || "Couldn't delete this vendor.");
        return;
      }
      setVendors((prev) => prev.filter((x) => x.id !== delTarget.id));
      setPendingProducts((prev) => prev.filter((p) => p.vendor_name !== (delTarget.business_name || delTarget.name)));
      setDelTarget(null);
    } catch {
      setDelErr("Network error — please try again.");
    } finally {
      setDelBusy(false);
    }
  }

  async function approveProduct(p: PendingProduct, approved: boolean) {
    setPBusy(p.id);
    try {
      const res = await fetch(`/api/vendor-products/${p.id}/approve?approved=${approved}`, { method: "POST" });
      if (res.ok) setPendingProducts((prev) => prev.filter((x) => x.id !== p.id));
    } finally {
      setPBusy(null);
    }
  }

  async function addVendor(e: React.FormEvent) {
    e.preventDefault();
    setAddBusy(true);
    setAddErr("");
    setAddResult(null);
    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAddErr(data.detail || "Couldn't add vendor.");
      } else {
        setAddResult({ email: data.email, password: data.password || addForm.password });
        setAddForm({ business_name: "", owner_name: "", email: "", phone: "", password: "" });
        await load();
      }
    } catch {
      setAddErr("Couldn't add vendor.");
    } finally {
      setAddBusy(false);
    }
  }

  const pending = vendors.filter((v) => !v.vendor_approved).length;

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    setProdBusy(true);
    setProdMsg("");
    try {
      const res = await fetch("/api/vendor-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor_id: Number(prodForm.vendor_id),
          name: prodForm.name,
          category: prodForm.category,
          price_ugx: Number(prodForm.price_ugx || 0),
          image_url: prodForm.image_url,
          description: prodForm.description,
        }),
      });
      if (res.ok) {
        setProdMsg("✓ Product added — it's live on the marketplace now.");
        setProdForm((f) => ({ ...f, name: "", price_ugx: "", image_url: "", description: "" }));
        load();
      } else {
        setProdMsg("Couldn't add. Pick a vendor and check the details.");
      }
    } catch {
      setProdMsg("Couldn't add. Please try again.");
    } finally {
      setProdBusy(false);
    }
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-600">Vendors</h1>
          <p className="text-sm text-ink-600/60">
            {vendors.length} vendor(s) · {pending} awaiting approval. Approved vendors can list products on the marketplace.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setShowProd(true); setProdMsg(""); }} className="rounded-md border border-brand-500 px-4 py-2 text-sm font-bold text-brand-600 hover:bg-brand-50">
            + Add product for a vendor
          </button>
          <button onClick={() => { setShowAdd(true); setAddResult(null); setAddErr(""); }} className="rounded-md bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600">
            + Add vendor
          </button>
        </div>
      </header>

      {/* Add product for a vendor — modal */}
      {showProd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowProd(false)}>
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-ink-600">Add a product for a vendor</h2>
              <button onClick={() => setShowProd(false)} className="text-ink-600/50 hover:text-ink-900">✕</button>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {/* Live preview — exactly how the card shows on the marketplace */}
              <div className="order-1 lg:order-2">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-600/50">✨ Marketplace preview</p>
                <ProductPreview
                  f={prodForm}
                  vendorName={vendors.find((v) => String(v.id) === prodForm.vendor_id)?.business_name || vendors.find((v) => String(v.id) === prodForm.vendor_id)?.name || "Vendor"}
                />
                <p className="mt-2 text-xs text-ink-600/55">Updates as you type. Goes live immediately, under the selected vendor.</p>
              </div>

              <form onSubmit={addProduct} className="order-2 space-y-3 lg:order-1">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-ink-600">Vendor</span>
                  <select required value={prodForm.vendor_id} onChange={(e) => setProdForm({ ...prodForm, vendor_id: e.target.value })} className="w-full rounded-lg border border-ink-600/20 px-3 py-2.5 text-sm">
                    <option value="">— Select vendor —</option>
                    {vendors.filter((v) => v.vendor_approved).map((v) => (
                      <option key={v.id} value={v.id}>{v.business_name || v.name} ({v.email})</option>
                    ))}
                  </select>
                </label>
                <input required placeholder="Product name" value={prodForm.name} onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })} className="w-full rounded-lg border border-ink-600/20 px-3 py-2.5 text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Category (e.g. Laptops)" value={prodForm.category} onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })} className="w-full rounded-lg border border-ink-600/20 px-3 py-2.5 text-sm" />
                  <input required type="number" min="0" placeholder="Price (UGX)" value={prodForm.price_ugx} onChange={(e) => setProdForm({ ...prodForm, price_ugx: e.target.value })} className="w-full rounded-lg border border-ink-600/20 px-3 py-2.5 text-sm" />
                </div>
                <input placeholder="Image URL (or upload below)" value={prodForm.image_url} onChange={(e) => setProdForm({ ...prodForm, image_url: e.target.value })} className="w-full rounded-lg border border-ink-600/20 px-3 py-2.5 text-sm" />
                <ImageUpload value={prodForm.image_url} onChange={(url) => setProdForm({ ...prodForm, image_url: url })} />
                <textarea placeholder="Short description" rows={2} value={prodForm.description} onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })} className="w-full rounded-lg border border-ink-600/20 px-3 py-2.5 text-sm" />
                {prodMsg && <p className={`text-sm font-semibold ${prodMsg.startsWith("✓") ? "text-green-600" : "text-red-500"}`}>{prodMsg}</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={prodBusy} className="rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">
                    {prodBusy ? "Adding…" : "Add product"}
                  </button>
                  <button type="button" onClick={() => setShowProd(false)} className="rounded-md border border-ink-600/20 px-5 py-2.5 text-sm font-bold text-ink-600 hover:bg-ink-50">Close</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Product approvals — products stay hidden from the marketplace until approved */}
      {pendingProducts.length > 0 && (
        <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <h2 className="mb-3 font-extrabold text-amber-800">
            🕵️ {pendingProducts.length} product(s) awaiting approval
          </h2>
          <div className="space-y-2">
            {pendingProducts.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-ink-600/10 bg-ink-50">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg">📦</span>
                    )}
                  </span>
                  <div>
                    <p className="font-semibold text-ink-600">{p.name}</p>
                    <p className="text-xs text-ink-600/60">{p.vendor_name} · {p.category} · {ugx(p.price_ugx)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => approveProduct(p, true)} disabled={pBusy === p.id} className="rounded-md bg-green-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50">
                    {pBusy === p.id ? "…" : "Approve"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
                  <p className="flex items-center gap-2 font-bold text-ink-600">
                    {v.business_name || v.name}
                    {v.verified && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">✓ Verified</span>}
                  </p>
                  <p className="text-sm text-ink-600/60">{v.name} · {v.email} · {v.phone || "no phone"}</p>
                  {(v.business_category || v.location) && (
                    <p className="text-xs text-ink-600/50">{[v.business_category, v.location].filter(Boolean).join(" · ")}</p>
                  )}
                  <p className="text-xs text-ink-600/50">
                    {v.products} product(s){v.id_number ? ` · ID: ${v.id_number}` : ""}{v.business_reg ? ` · Reg: ${v.business_reg}` : ""}
                  </p>
                  <div className="mt-2">
                    <SubscriptionControl kind="vendor" id={v.id} ends={v.subscription_ends} onChange={load} />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {v.vendor_approved ? (
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">✓ Approved</span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">⏳ Pending</span>
                )}
                {v.has_document && (
                  <a href={`/api/vendors/${v.id}/document`} target="_blank" rel="noreferrer" className="rounded-md border border-ink-600/20 px-3 py-1.5 text-sm font-semibold text-ink-600 hover:bg-ink-50">
                    View ID
                  </a>
                )}
                {v.verified ? (
                  <button onClick={() => setVerified(v, false)} disabled={busy === v.id} className="rounded-md border border-ink-600/20 px-3 py-1.5 text-sm font-semibold text-ink-600 hover:bg-ink-50 disabled:opacity-50">
                    Unverify
                  </button>
                ) : (
                  <button onClick={() => setVerified(v, true)} disabled={busy === v.id} className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">
                    {busy === v.id ? "…" : "Verify"}
                  </button>
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
                <button
                  onClick={() => askDelete(v)}
                  disabled={busy === v.id}
                  title="Permanently delete this vendor"
                  className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>

              {/* Approving or refusing a vendor without telling them is how
                  they end up calling to ask. */}
              <div className="w-full">
                <ReplyButton
                  name={v.name}
                  email={v.email}
                  phone={v.phone}
                  templates={PARTNER_TEMPLATES}
                  label="Edit"
                  context="Vendor application"
                  auto={partnerMessage({ name: v.name, approved: v.vendor_approved, kind: "vendor" })}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete vendor — confirmation with exactly what will be removed */}
      {delTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => !delBusy && setDelTarget(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-extrabold text-red-600">Delete this vendor?</h3>
            <p className="mt-1 text-sm text-ink-600/70">
              <b className="text-ink-600">{delTarget.business_name || delTarget.name}</b> ({delTarget.email})
            </p>

            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm">
              <p className="font-bold text-red-700">This permanently removes:</p>
              {impact ? (
                <ul className="mt-2 space-y-1 text-ink-600/80">
                  <li>• {impact.products} marketplace product(s)</li>
                  <li>• {impact.messages} customer message(s)</li>
                  <li>• {impact.payouts} payout record(s)</li>
                  <li>• The vendor&apos;s login account</li>
                </ul>
              ) : (
                <p className="mt-2 text-ink-600/60">Checking what will be removed…</p>
              )}
              {impact && impact.sold_items > 0 && (
                <p className="mt-3 rounded-lg bg-white/70 p-2 text-xs text-ink-600/75">
                  ✔ {impact.sold_items} past sale(s) stay in your order history — only the vendor link is removed.
                </p>
              )}
            </div>

            <p className="mt-3 text-xs text-ink-600/60">This cannot be undone.</p>
            {delErr && <p className="mt-2 text-sm font-semibold text-red-600">{delErr}</p>}

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setDelTarget(null)}
                disabled={delBusy}
                className="flex-1 rounded-md border border-ink-600/20 px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={delBusy}
                className="flex-1 rounded-md bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {delBusy ? "Deleting…" : "Yes, delete vendor"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add vendor modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-1 text-lg font-extrabold text-ink-600">Add a vendor</h3>
            <p className="mb-3 text-sm text-ink-600/60">
              For shops that applied offline. The vendor is approved immediately and gets a login to add products.
            </p>

            {addResult ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm">
                  <p className="font-bold text-green-800">✓ Vendor added &amp; approved</p>
                  <p className="mt-2 text-ink-600">Share these login details with the vendor:</p>
                  <p className="mt-1 font-mono text-ink-700">Email: {addResult.email}</p>
                  <p className="font-mono text-ink-700">Password: {addResult.password || "(the one you set)"}</p>
                  <p className="mt-2 text-xs text-ink-600/60">They sign in at the storefront → Sell / Vendor dashboard.</p>
                </div>
                <button onClick={() => { setShowAdd(false); setAddResult(null); }} className="w-full rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600">Done</button>
              </div>
            ) : (
              <form onSubmit={addVendor} className="space-y-3">
                <input required placeholder="Shop / business name" value={addForm.business_name} onChange={(e) => setAddForm({ ...addForm, business_name: e.target.value })} className="w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
                <input placeholder="Owner name" value={addForm.owner_name} onChange={(e) => setAddForm({ ...addForm, owner_name: e.target.value })} className="w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input required type="email" placeholder="Email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
                  <input placeholder="Phone" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} className="w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
                </div>
                <input placeholder="Password (leave blank to auto-generate)" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} className="w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
                {addErr && <p className="text-xs font-semibold text-red-500">{addErr}</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={addBusy} className="flex-1 rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">
                    {addBusy ? "Adding…" : "Add & approve vendor"}
                  </button>
                  <button type="button" onClick={() => setShowAdd(false)} className="rounded-md border border-ink-600/20 px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-ink-50">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Live preview — mirrors the marketplace vendor-product card.
function ProductPreview({ f, vendorName }: { f: { name: string; category: string; price_ugx: string; image_url: string }; vendorName: string }) {
  const price = Number(f.price_ugx || 0);
  return (
    <div className="mx-auto flex max-w-[220px] flex-col overflow-hidden rounded-xl border border-ink-600/10 bg-white shadow-sm">
      <div className="relative aspect-[4/3] bg-white">
        {f.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={f.image_url} alt="" className="h-full w-full object-contain p-1" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl text-ink-600/20">🛍️</div>
        )}
        <span className="absolute left-2 top-2 rounded bg-ink-600/85 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Vendor</span>
      </div>
      <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-1.5">
        <h3 className="min-h-[2.25rem] text-[13px] leading-tight text-ink-600">{f.name || "Product name"}</h3>
        <p className="mt-0.5 truncate text-[11px] text-ink-600/50">by {vendorName}</p>
        <p className="mt-1 text-[15px] font-extrabold text-ink-600">{price > 0 ? ugx(price) : "UGX —"}</p>
        <span className="mt-2 rounded-md bg-brand-500 px-3 py-1.5 text-center text-xs font-bold text-white">Add to cart</span>
      </div>
    </div>
  );
}
