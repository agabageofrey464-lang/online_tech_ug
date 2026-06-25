"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, LogOut, Save, Package, ShieldCheck, ShoppingBag } from "lucide-react";
import { site, whatsappLink, ugx } from "@/lib/site";
import { Breadcrumbs } from "@/components/breadcrumbs";

type Profile = {
  name: string;
  email: string;
  phone: string;
  town: string;
  address: string;
  createdAt: string;
};

type OrderItem = { product_slug: string; name: string; quantity: number; line_total: number };
type SavedOrder = {
  reference: string;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  items: OrderItem[];
  createdAt: string;
};

const KEY = "otu_account_v1";

const statusTone: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", town: "", address: "" });
  const [saved, setSaved] = useState(false);
  const [orders, setOrders] = useState<SavedOrder[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw) as Profile;
        setProfile(p);
        setForm({ name: p.name, email: p.email, phone: p.phone, town: p.town, address: p.address });
      }
    } catch {}
    try {
      setOrders(JSON.parse(localStorage.getItem("otu_orders") || "[]"));
    } catch {}
    setLoaded(true);
  }, []);

  function save(e: React.FormEvent) {
    e.preventDefault();
    const p: Profile = { ...form, createdAt: profile?.createdAt ?? new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(p));
    setProfile(p);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function signOut() {
    localStorage.removeItem(KEY);
    setProfile(null);
    setForm({ name: "", email: "", phone: "", town: "", address: "" });
  }

  if (!loaded) {
    return <div className="container-page py-16 text-center text-ink-700/50">Loading…</div>;
  }

  const input =
    "w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div className="container-page max-w-3xl py-10">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "My account" }]} />
      </div>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <User size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-ink-600">
            {profile ? `Hi, ${profile.name.split(" ")[0] || "there"} 👋` : "Create your account"}
          </h1>
          <p className="text-sm text-ink-700/60">
            {profile
              ? "Manage your details for faster checkout."
              : "Save your details once and check out faster every time."}
          </p>
        </div>
      </div>

      {/* Saved profile summary */}
      {profile && (
        <div className="mb-6 rounded-card border border-brand-200 bg-brand-50 p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Your profile</p>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
              Signed in
            </span>
          </div>
          <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-ink-700/50">Name</dt>
              <dd className="font-semibold text-ink-800">{profile.name || "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-700/50">Phone</dt>
              <dd className="font-semibold text-ink-800">{profile.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-700/50">Email</dt>
              <dd className="font-semibold text-ink-800">{profile.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-700/50">Town / City</dt>
              <dd className="font-semibold text-ink-800">{profile.town || "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-ink-700/50">Delivery address</dt>
              <dd className="font-semibold text-ink-800">{profile.address || "—"}</dd>
            </div>
          </dl>
        </div>
      )}

      {/* My Orders (Jumia-style) */}
      <div className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink-600">
          <ShoppingBag size={20} className="text-brand-500" /> My Orders
        </h2>
        {orders.length === 0 ? (
          <div className="rounded-card border border-dashed border-ink-600/20 bg-white p-8 text-center">
            <p className="text-sm font-semibold text-ink-700">You have no orders yet.</p>
            <Link
              href="/shop"
              className="mt-3 inline-block rounded-md bg-brand-500 px-5 py-2 text-sm font-bold text-white hover:bg-brand-600"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.reference} className="rounded-card border border-ink-600/10 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-mono text-sm font-bold text-brand-600">{o.reference}</p>
                    <p className="text-xs text-ink-700/50">
                      {new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      {" · "}
                      {o.payment_method.replace(/_/g, " ")}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusTone[o.status] ?? "bg-ink-50 text-ink-600"}`}>
                    {o.status}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {o.items.slice(0, 4).map((it) => (
                    <span key={it.product_slug} className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-ink-600/10 bg-white">
                      <Image src={`/products/${it.product_slug}.webp`} alt={it.name} fill sizes="48px" className="object-contain p-0.5" />
                    </span>
                  ))}
                  {o.items.length > 4 && (
                    <span className="text-xs font-semibold text-ink-700/60">+{o.items.length - 4} more</span>
                  )}
                  <span className="ml-auto text-right">
                    <span className="block text-xs text-ink-700/50">{o.items.reduce((s, i) => s + i.quantity, 0)} item(s)</span>
                    <span className="block font-extrabold text-ink-900">{ugx(o.total)}</span>
                  </span>
                </div>

                <div className="mt-3 flex gap-2">
                  <a
                    href={whatsappLink(`Hi, I'd like an update on my order ${o.reference}.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-ink-600/20 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50"
                  >
                    Track / ask update
                  </a>
                  <Link
                    href="/shop"
                    className="rounded-md bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-600 hover:bg-brand-100"
                  >
                    Buy again
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mb-2 text-sm font-bold text-ink-600">
        {profile ? "Edit your details" : "Create your account"}
      </p>
      <form onSubmit={save} className="grid gap-4 rounded-card border border-ink-600/10 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-ink-700">Full name</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={input}
              placeholder="Your name"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-ink-700">Phone</span>
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={input}
              placeholder="07xx xxx xxx"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-ink-700">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={input}
              placeholder="you@email.com"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-ink-700">Town / City</span>
            <input
              value={form.town}
              onChange={(e) => setForm({ ...form, town: e.target.value })}
              className={input}
              placeholder="Kampala"
            />
          </label>
        </div>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink-700">Delivery address</span>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className={input}
            placeholder="Area, street, landmark"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
          >
            <Save size={16} /> {profile ? "Update account" : "Create account"}
          </button>
          {profile && (
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-md border border-ink-600/20 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
            >
              <LogOut size={16} /> Sign out
            </button>
          )}
          {saved && <span className="text-sm font-semibold text-green-600">✓ Saved</span>}
        </div>
      </form>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/learn/dashboard"
          className="flex items-center gap-3 rounded-card border border-ink-600/10 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <Package className="text-brand-500" />
          <div>
            <p className="font-bold text-ink-800">My Learning</p>
            <p className="text-xs text-ink-700/60">Courses, progress & certificates</p>
          </div>
        </Link>
        <a
          href={whatsappLink("Hi, I need help with my order/account.")}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-card border border-ink-600/10 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <ShieldCheck className="text-brand-500" />
          <div>
            <p className="font-bold text-ink-800">Order help & support</p>
            <p className="text-xs text-ink-700/60">Chat with {site.name} on WhatsApp</p>
          </div>
        </a>
      </div>

      <p className="mt-6 text-center text-xs text-ink-700/45">
        Your details are saved on this device for faster checkout. Secure cloud accounts with order
        history are coming soon.
      </p>
    </div>
  );
}
