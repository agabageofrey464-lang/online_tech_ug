"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Clock, CheckCircle2, Package, ShoppingBag, Wallet, TrendingUp, Plus, LogOut, Trash2, X, Pencil, MessageSquare } from "lucide-react";
import { useAuth, authFetch } from "@/lib/auth";
import { ugx, whatsappLink, site } from "@/lib/site";
import { Breadcrumbs } from "@/components/breadcrumbs";

type VProduct = {
  id: number;
  name: string;
  category: string;
  price_ugx: number;
  description: string;
  image_url: string;
  in_stock: boolean;
  approved: boolean;
};

type Sale = {
  reference: string;
  name: string;
  quantity: number;
  line_total: number;
  commission: number;
  payout: number;
  status: string;
  payment_status: string;
};

type Earnings = {
  gross: number;
  commission: number;
  payout: number;
  paid: number;
  outstanding: number;
  orders: number;
  sales: Sale[];
};

const CATEGORIES = [
  // Tech
  "Laptops", "Desktops", "Phones & Tablets", "Accessories", "Networking", "Storage", "Printing", "Electronics",
  // Other businesses (the marketplace is open to all — not just IT)
  "Fashion & Clothing", "Home & Living", "Beauty & Health", "Food & Groceries",
  "Books & Stationery", "Agriculture", "Services", "Other",
];
const emptyForm = { name: "", category: "Accessories", price_ugx: "", image_url: "", description: "" };

export default function VendorDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<VProduct[]>([]);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [verif, setVerif] = useState<{ status: string; verified: boolean } | null>(null);
  const [vForm, setVForm] = useState({ id_number: "", business_reg: "" });
  const [vFile, setVFile] = useState("");
  const [vBusy, setVBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [messages, setMessages] = useState<
    { id: number; customer_name: string; customer_phone: string; customer_email: string; product: string; message: string; created_at: string }[]
  >([]);
  const [profile, setProfile] = useState({ name: "", business_name: "", business_category: "", location: "", phone: "" });
  const [showProfile, setShowProfile] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);

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

  const loadEarnings = useCallback(async () => {
    try {
      const res = await authFetch("/vendor/earnings");
      if (res.ok) setEarnings(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  const loadVerification = useCallback(async () => {
    try {
      const res = await authFetch("/vendor/verification");
      if (res.ok) setVerif(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const res = await authFetch("/vendor/messages");
      if (res.ok) setMessages(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const res = await authFetch("/vendor/profile");
      if (res.ok) setProfile(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (user?.role === "vendor") {
      loadProducts();
      loadEarnings();
      loadVerification();
      loadMessages();
      loadProfile();
    }
  }, [user, loadProducts, loadEarnings, loadVerification, loadMessages, loadProfile]);

  async function submitVerification(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setVBusy(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await authFetch("/vendor/verify", { method: "POST", body: fd });
      if (res.ok) {
        setVerif({ status: "pending", verified: false });
        setVForm({ id_number: "", business_reg: "" });
        setVFile("");
      }
    } finally {
      setVBusy(false);
    }
  }

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
        <p className="mt-2 text-sm text-ink-700/70">Put your products in front of our customers. Open a vendor account to list your products.</p>
        <Link href="/signup?role=vendor&next=/vendor" className="mt-5 inline-block rounded-md bg-brand-500 px-6 py-3 text-sm font-bold text-white hover:bg-brand-600">
          Become a vendor
        </Link>
      </div>
    );
  }

  const approved = user.vendor_approved;

  function startAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setErr("");
    setShowForm(true);
  }

  function startEdit(p: VProduct) {
    setEditingId(p.id);
    setForm({ name: p.name, category: p.category, price_ugx: String(p.price_ugx), image_url: p.image_url, description: p.description });
    setErr("");
    setShowForm(true);
  }

  async function submitProduct(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const body = JSON.stringify({
      name: form.name,
      category: form.category,
      price_ugx: Number(form.price_ugx) || 0,
      image_url: form.image_url,
      description: form.description,
    });
    try {
      const res = editingId
        ? await authFetch(`/vendor/products/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body })
        : await authFetch("/vendor/products", { method: "POST", headers: { "Content-Type": "application/json" }, body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.detail || "Couldn't save product.");
      } else {
        setProducts((p) => (editingId ? p.map((x) => (x.id === editingId ? data : x)) : [data, ...p]));
        setForm(emptyForm);
        setShowForm(false);
        setEditingId(null);
      }
    } catch {
      setErr("Couldn't save product.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadImage(file: File) {
    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await authFetch("/vendor/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.path) {
        const API = process.env.NEXT_PUBLIC_API_URL ?? "";
        setForm((f) => ({ ...f, image_url: `${API}/api/v1/uploads/${data.path}` }));
      }
    } finally {
      setUploadingImg(false);
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileBusy(true);
    try {
      const res = await authFetch("/vendor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) setShowProfile(false);
    } finally {
      setProfileBusy(false);
    }
  }

  async function deleteProduct(id: number) {
    if (!confirm("Delete this product?")) return;
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

      {/* Business verification */}
      <section className="mb-6 rounded-card border border-ink-600/10 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-extrabold text-ink-900">🪪 Business verification</h2>
        {verif?.verified ? (
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-green-700">
            <CheckCircle2 size={18} /> Your business is verified — a “Verified” badge shows on your products.
          </p>
        ) : verif?.status === "pending" ? (
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-amber-700">
            <Clock size={18} /> Documents submitted — under review. We&apos;ll verify you shortly.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-ink-700/70">
              Get a <b>Verified</b> badge to build buyer trust. Submit your National ID or business registration.
            </p>
            <form onSubmit={submitVerification} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input name="id_number" placeholder="National ID number" value={vForm.id_number} onChange={(e) => setVForm({ ...vForm, id_number: e.target.value })} className="rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
              <input name="business_reg" placeholder="Business registration no. (optional)" value={vForm.business_reg} onChange={(e) => setVForm({ ...vForm, business_reg: e.target.value })} className="rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none" />
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-ink-600/30 px-3 py-2.5 text-sm text-ink-700/70 hover:border-brand-400 sm:col-span-2">
                📎 <span className="truncate">{vFile || "Attach ID / business document (PDF or image, max 8MB)"}</span>
                <input type="file" name="document" required accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" className="hidden" onChange={(e) => setVFile(e.target.files?.[0]?.name ?? "")} />
              </label>
              <button type="submit" disabled={vBusy} className="rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60 sm:col-span-2 sm:w-fit">
                {vBusy ? "Submitting…" : "Submit for verification"}
              </button>
            </form>
          </>
        )}
      </section>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Products", value: String(products.length), icon: Package },
          { label: "Orders", value: String(earnings?.orders ?? 0), icon: ShoppingBag },
          { label: "Gross sales", value: ugx(earnings?.gross ?? 0), icon: TrendingUp },
          { label: "Net payout", value: ugx(earnings?.payout ?? 0), icon: Wallet, accent: true },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-card border p-5 shadow-sm ${s.accent ? "border-brand-200 bg-brand-50" : "border-ink-600/10 bg-white"}`}
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.accent ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-600"}`}>
              <s.icon size={20} />
            </span>
            <p className="mt-3 text-xl font-extrabold text-ink-900">{s.value}</p>
            <p className="text-xs font-semibold text-ink-700/60">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Store profile */}
      <section className="mt-6 rounded-card border border-ink-600/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-extrabold text-ink-900">
            <Store size={18} className="text-brand-600" /> Store profile
          </h2>
          <button onClick={() => setShowProfile(true)} className="inline-flex items-center gap-1.5 rounded-md border border-ink-600/20 px-3 py-1.5 text-xs font-bold text-ink-700 hover:bg-ink-50">
            <Pencil size={14} /> Edit profile
          </button>
        </div>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <p><span className="text-ink-700/50">Store name:</span> <b className="text-ink-900">{profile.business_name || "—"}</b></p>
          <p><span className="text-ink-700/50">Owner:</span> <b className="text-ink-900">{profile.name || "—"}</b></p>
          <p><span className="text-ink-700/50">Category:</span> <b className="text-ink-900">{profile.business_category || "—"}</b></p>
          <p><span className="text-ink-700/50">Location:</span> <b className="text-ink-900">{profile.location || "—"}</b></p>
          <p><span className="text-ink-700/50">Phone:</span> <b className="text-ink-900">{profile.phone || "—"}</b></p>
          <p><span className="text-ink-700/50">Email:</span> <b className="text-ink-900">{user.email}</b></p>
        </div>
      </section>

      {/* Wallet / payouts */}
      <section className="mt-6 rounded-card border border-ink-600/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-extrabold text-ink-900">
            <Wallet size={18} className="text-brand-600" /> Orders, wallet &amp; payouts
          </h2>
          <p className="text-xs text-ink-700/60">
            Platform commission is 5–10% by item value. We collect payment and remit your net payout.
          </p>
        </div>

        {!earnings || earnings.sales.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-ink-600/20 p-10 text-center">
            <Wallet className="mx-auto text-ink-700/30" size={32} />
            <p className="mt-2 text-sm font-semibold text-ink-700">No sales yet</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-ink-700/60">
              When customers buy your products, orders and payouts appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
              <div className="rounded-lg bg-ink-50 p-3">
                <p className="text-sm font-extrabold text-ink-900">{ugx(earnings.gross)}</p>
                <p className="text-[11px] font-semibold text-ink-700/60">Gross</p>
              </div>
              <div className="rounded-lg bg-ink-50 p-3">
                <p className="text-sm font-extrabold text-amber-600">−{ugx(earnings.commission)}</p>
                <p className="text-[11px] font-semibold text-ink-700/60">Commission</p>
              </div>
              <div className="rounded-lg bg-ink-50 p-3">
                <p className="text-sm font-extrabold text-ink-700">{ugx(earnings.paid ?? 0)}</p>
                <p className="text-[11px] font-semibold text-ink-700/60">Paid to you</p>
              </div>
              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-sm font-extrabold text-green-700">{ugx(earnings.outstanding ?? earnings.payout)}</p>
                <p className="text-[11px] font-semibold text-ink-700/60">Outstanding</p>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-600/10 text-[11px] uppercase tracking-wide text-ink-700/50">
                    <th className="py-2 pr-3 font-semibold">Order</th>
                    <th className="py-2 pr-3 font-semibold">Product</th>
                    <th className="py-2 pr-3 text-right font-semibold">Sale</th>
                    <th className="py-2 pr-3 text-right font-semibold">Payout</th>
                    <th className="py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.sales.map((s, i) => (
                    <tr key={`${s.reference}-${i}`} className="border-b border-ink-600/5">
                      <td className="py-2 pr-3 font-mono text-xs text-ink-700/70">{s.reference}</td>
                      <td className="py-2 pr-3 text-ink-800">
                        {s.name} <span className="text-ink-700/50">×{s.quantity}</span>
                      </td>
                      <td className="py-2 pr-3 text-right text-ink-800">{ugx(s.line_total)}</td>
                      <td className="py-2 pr-3 text-right font-bold text-green-700">{ugx(s.payout)}</td>
                      <td className="py-2">
                        <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-ink-700">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* How to pay your listing / subscription fee */}
      <section className="mt-6 rounded-card border border-brand-200 bg-brand-50/60 p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-extrabold text-ink-900">💳 Pay your vendor fee</h2>
        <p className="mt-1 text-sm text-ink-700/70">
          Send your listing / subscription fee to {site.name} using any of the details below, then message us the confirmation.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-ink-600/10 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-700/50">{site.payment.momo.provider}</p>
            <p className="mt-1 text-lg font-extrabold text-ink-900">{site.payment.momo.number}</p>
            <p className="text-sm text-ink-700/70">{site.payment.momo.name}</p>
          </div>
          <div className="rounded-lg border border-ink-600/10 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-700/50">{site.payment.momoAlt.provider}</p>
            <p className="mt-1 text-lg font-extrabold text-ink-900">{site.payment.momoAlt.number}</p>
            <p className="text-sm text-ink-700/70">{site.payment.momoAlt.name}</p>
          </div>
          {site.payment.bank.account && (
            <div className="rounded-lg border border-ink-600/10 bg-white p-4 sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-700/50">Bank transfer</p>
              <p className="mt-1 text-lg font-extrabold text-ink-900">{site.payment.bank.account}</p>
              <p className="text-sm text-ink-700/70">{site.payment.bank.name} · {site.payment.bank.bank}</p>
            </div>
          )}
        </div>
        <a
          href={whatsappLink(`Hi ${site.name}, I'm the vendor "${user.business_name || user.name}". I've paid my vendor fee — here is my confirmation.`)}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block rounded-md bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600"
        >
          I&apos;ve paid — send confirmation
        </a>
      </section>

      <section className="mt-6 rounded-card border border-ink-600/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-extrabold text-ink-900">My products</h2>
          <button
            onClick={startAdd}
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
                  {p.approved ? (
                    <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">● Live</span>
                  ) : (
                    <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">● Pending review</span>
                  )}
                </div>
                <div className="flex h-fit flex-col gap-1">
                  <button onClick={() => startEdit(p)} aria-label="Edit" className="rounded p-1 text-ink-700/70 hover:bg-ink-50 hover:text-brand-600">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => deleteProduct(p.id)} aria-label="Delete" className="rounded p-1 text-red-500 hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </div>
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

      {/* Customer messages */}
      <section className="mt-6 rounded-card border border-ink-600/10 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-extrabold text-ink-900">
          <MessageSquare size={18} className="text-brand-600" /> Customer messages
          {messages.length > 0 && <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-bold text-white">{messages.length}</span>}
        </h2>
        {messages.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-ink-600/20 p-8 text-center">
            <MessageSquare className="mx-auto text-ink-700/30" size={28} />
            <p className="mt-2 text-sm text-ink-700/60">No messages yet. Enquiries from customers about your products will appear here.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className="rounded-lg border border-ink-600/10 bg-ink-50/40 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-ink-900">
                    {m.customer_name || "Customer"}
                    {m.product ? <span className="font-normal text-ink-700/55"> · re: {m.product}</span> : null}
                  </p>
                  <span className="text-[11px] text-ink-700/50">{new Date(m.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                </div>
                <p className="mt-1 text-sm text-ink-700/80">{m.message}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {m.customer_phone && (
                    <>
                      <a href={`tel:${m.customer_phone}`} className="rounded-md bg-brand-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-brand-600">Call</a>
                      <a href={`https://wa.me/${m.customer_phone.replace(/\D/g, "").replace(/^0/, "256")}`} target="_blank" rel="noreferrer" className="rounded-md bg-[#25D366] px-2.5 py-1 text-[11px] font-bold text-white hover:brightness-105">WhatsApp</a>
                    </>
                  )}
                  {m.customer_email && <a href={`mailto:${m.customer_email}`} className="rounded-md border border-ink-600/20 px-2.5 py-1 text-[11px] font-bold text-ink-700 hover:bg-ink-50">Email</a>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add / edit product modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => { setShowForm(false); setEditingId(null); }}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-ink-900">{editingId ? "Edit product" : "Add a product"}</h3>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} aria-label="Close" className="text-ink-600/50 hover:text-ink-900"><X size={20} /></button>
            </div>
            <form onSubmit={submitProduct} className="space-y-3">
              <input required placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={input}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input required type="number" min="0" placeholder="Price (UGX)" value={form.price_ugx} onChange={(e) => setForm({ ...form, price_ugx: e.target.value })} className={input} />
              </div>
              {/* Product photo — upload or paste URL */}
              <div className="rounded-lg border border-dashed border-ink-600/25 p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-ink-600/10 bg-ink-50">
                    {form.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Package size={20} className="text-ink-700/30" />
                    )}
                  </span>
                  <label className="cursor-pointer rounded-md border border-brand-500 px-3 py-2 text-xs font-bold text-brand-600 hover:bg-brand-50">
                    {uploadingImg ? "Uploading…" : "📁 Upload photo"}
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingImg} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} />
                  </label>
                </div>
                <input placeholder="…or paste an image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={`${input} mt-2`} />
              </div>
              <textarea placeholder="Short description (optional)" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={input} />
              {err && <p className="text-xs font-semibold text-red-500">{err}</p>}
              <button type="submit" disabled={busy} className="w-full rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">
                {busy ? "Saving…" : editingId ? "Save changes" : "Add product"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit store profile modal */}
      {showProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowProfile(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-ink-900">Edit store profile</h3>
              <button onClick={() => setShowProfile(false)} aria-label="Close" className="text-ink-600/50 hover:text-ink-900"><X size={20} /></button>
            </div>
            <form onSubmit={saveProfile} className="space-y-3">
              <input placeholder="Business / store name" value={profile.business_name} onChange={(e) => setProfile({ ...profile, business_name: e.target.value })} className={input} />
              <input placeholder="Owner's name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={input} />
              <div className="grid grid-cols-2 gap-3">
                <select value={profile.business_category} onChange={(e) => setProfile({ ...profile, business_category: e.target.value })} className={input}>
                  <option value="">Category…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input placeholder="Location" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} className={input} />
              </div>
              <input placeholder="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className={input} />
              <button type="submit" disabled={profileBusy} className="w-full rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60">
                {profileBusy ? "Saving…" : "Save profile"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
