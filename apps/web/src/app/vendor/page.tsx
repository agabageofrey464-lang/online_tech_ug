"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Clock, CheckCircle2, Package, ShoppingBag, Wallet, Plus, LogOut, Trash2, X } from "lucide-react";
import { useAuth, authFetch } from "@/lib/auth";
import { ugx, whatsappLink } from "@/lib/site";
import { Breadcrumbs } from "@/components/breadcrumbs";

type VProduct = {
  id: number;
  name: string;
  category: string;
  price_ugx: number;
  description: string;
  image_url: string;
  in_stock: boolean;
};

const CATEGORIES = ["Laptops", "Desktops", "Components", "Power", "Accessories", "Networking", "Storage", "Other"];
const emptyForm = { name: "", category: "Accessories", price_ugx: "", image_url: "", description: "" };

export default function VendorDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<VProduct[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/vendor");
  }, [loading, user, router]);

  const loadProducts = useCallback(async () => {
    try {
      const res = await authFetch("/vendor/products");
      if (res.ok) setProducts(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (user?.role === "vendor") loadProducts();
  }, [user, loadProducts]);

  if (loading || !user) {
    return <div className="container-page py-16 text-center text-ink-700/50">Loading…</div>;
  }

  if (user.role !== "vendor") {
    return (
      <div className="container-page max-w-lg py-16 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Store size={28} />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-ink-900">Sell on Online Tech Uganda</h1>
        <p className="mt-2 text-sm text-ink-700/70">Reach thousands of shoppers countrywide. Open a vendor account to list your products.</p>
        <Link href="/signup?role=vendor&next=/vendor" className="mt-5 inline-block rounded-md bg-brand-500 px-6 py-3 text-sm font-bold text-white hover:bg-brand-600">
          Become a vendor
        </Link>
      </div>
    );
  }

  const approved = user.vendor_approved;

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await authFetch("/vendor/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          price_ugx: Number(form.price_ugx) || 0,
          image_url: form.image_url,
          description: form.description,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.detail || "Couldn't add product.");
      } else {
        setProducts((p) => [data, ...p]);
        setForm(emptyForm);
        setShowForm(false);
      }
    } catch {
      setErr("Couldn't add product.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteProduct(id: number) {
    const res = await authFetch(`/vendor/products/${id}`, { method: "DELETE" });
    if (res.ok) setProducts((p) => p.filter((x) => x.id !== id));
  }

  const input = "w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div className="container-page py-8">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Vendor dashboard" }]} />
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white">
            <Store size={24} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-ink-900">{user.business_name || user.name}</h1>
            <p className="text-sm text-ink-700/60">Vendor dashboard</p>
          </div>
        </div>
        <button onClick={logout} className="inline-flex items-center gap-2 rounded-md border border-ink-600/20 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50">
          <LogOut size={16} /> Logout
        </button>
      </div>

      {approved ? (
        <div className="mb-6 flex items-center gap-3 rounded-card border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="shrink-0 text-green-600" />
          <p className="text-sm font-semibold text-green-800">Your store is approved and live. Add your products below.</p>
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-3 rounded-card border border-amber-200 bg-amber-50 p-4">
          <Clock className="shrink-0 text-amber-600" />
          <div className="text-sm text-amber-800">
            <p className="font-bold">Your vendor account is under review.</p>
            <p>We&apos;ll approve your store shortly. You can add products once approved.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Products", value: products.length, icon: Package },
          { label: "Orders", value: 0, icon: ShoppingBag },
          { label: "Earnings", value: "UGX 0", icon: Wallet },
        ].map((s) => (
          <div key={s.label} className="rounded-card border border-ink-600/10 bg-white p-5 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <s.icon size={20} />
            </span>
            <p className="mt-3 text-2xl font-extrabold text-ink-900">{s.value}</p>
            <p className="text-xs font-semibold text-ink-700/60">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-card border border-ink-600/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-extrabold text-ink-900">My products</h2>
          <button
            onClick={() => setShowForm(true)}
            disabled={!approved}
            title={approved ? "Add a product" : "Available once your store is approved"}
            className="inline-flex items-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} /> Add product
          </button>
        </div>

        {products.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-ink-600/20 p-10 text-center">
            <Package className="mx-auto text-ink-700/30" size={32} />
            <p className="mt-2 text-sm font-semibold text-ink-700">No products yet</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-ink-700/60">
              {approved ? "Add your first product to start selling." : "Once approved you can list products here."}
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div key={p.id} className="flex gap-3 rounded-lg border border-ink-600/10 p-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-ink-600/10 bg-ink-50">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-ink-700/30"><Package size={20} /></span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="clamp-2 text-sm font-semibold text-ink-900">{p.name}</p>
                  <p className="text-xs text-ink-700/50">{p.category}</p>
                  <p className="text-sm font-extrabold text-ink-900">{ugx(p.price_ugx)}</p>
                </div>
                <button onClick={() => deleteProduct(p.id)} aria-label="Delete" className="h-fit rounded p-1 text-red-500 hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {!approved && products.length === 0 && (
          <a
            href={whatsappLink(`Hi, I'm a vendor (${user.business_name || user.name}) and I'd like help listing my products.`)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block rounded-md border border-brand-300 px-4 py-2 text-xs font-bold text-brand-700 hover:bg-brand-50"
          >
            Get help listing products
          </a>
        )}
      </section>

      {/* Add product modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-ink-900">Add a product</h3>
              <button onClick={() => setShowForm(false)} aria-label="Close" className="text-ink-600/50 hover:text-ink-900"><X size={20} /></button>
            </div>
            <form onSubmit={addProduct} className="space-y-3">
              <input required placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={input}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input required type="number" min="0" placeholder="Price (UGX)" value={form.price_ugx} onChange={(e) => setForm({ ...form, price_ugx: e.target.value })} className={input} />
              </div>
              <input placeholder="Image URL (optional)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={input} />
              <textarea placeholder="Short description (optional)" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={input} />
              {err && <p className="text-xs font-semibold text-red-500">{err}</p>}
              <button type="submit" disabled={busy} className="w-full rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">
                {busy ? "Adding…" : "Add product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
