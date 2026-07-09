"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  LogOut,
  Save,
  Package,
  ShieldCheck,
  ShoppingBag,
  Heart,
  MapPin,
  GraduationCap,
  Store,
  ChevronRight,
} from "lucide-react";
import { site, whatsappLink, ugx } from "@/lib/site";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useAuth } from "@/lib/auth";
import { productImage } from "@/lib/data";

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

type Tab = "overview" | "orders" | "address" | "details";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", town: "", address: "" });
  const [saved, setSaved] = useState(false);
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [tab, setTab] = useState<Tab>("overview");

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

  // Prefill from the signed-in account when available.
  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, name: f.name || user.name, email: f.email || user.email, phone: f.phone || user.phone }));
    }
  }, [user]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    const p: Profile = { ...form, createdAt: profile?.createdAt ?? new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(p));
    setProfile(p);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function signOut() {
    logout();
    localStorage.removeItem(KEY);
    setProfile(null);
    setForm({ name: "", email: "", phone: "", town: "", address: "" });
  }

  if (!loaded) {
    return <div className="container-page py-16 text-center text-ink-700/50">Loading…</div>;
  }

  const displayName = user?.name || profile?.name || "there";
  const input =
    "w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  const menu: { key: Tab; label: string; icon: typeof User }[] = [
    { key: "overview", label: "My Account", icon: User },
    { key: "orders", label: "Orders", icon: ShoppingBag },
    { key: "address", label: "Address Book", icon: MapPin },
    { key: "details", label: "Account Details", icon: Save },
  ];

  const links = [
    { href: "/wishlist", label: "Saved Items", icon: Heart },
    { href: "/learn/dashboard", label: "My Learning", icon: GraduationCap },
    ...(user?.role === "vendor" ? [{ href: "/vendor", label: "Vendor Dashboard", icon: Store }] : []),
  ];

  return (
    <div className="container-page py-8">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "My account" }]} />
      </div>

      {/* Sign-in banner for guests */}
      {!user && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-card border border-brand-200 bg-brand-50 p-4">
          <p className="text-sm text-ink-700">
            <b>You&apos;re browsing as a guest.</b> Sign in to sync your account across devices.
          </p>
          <div className="flex gap-2">
            <Link href="/login?next=/account" className="rounded-md bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600">Sign in</Link>
            <Link href="/signup?next=/account" className="rounded-md border border-brand-300 px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-100">Create account</Link>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar menu (Jumia-style) */}
        <aside className="h-fit overflow-hidden rounded-card border border-ink-600/10 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-ink-600/10 bg-ink-50/60 p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white">
              <User size={22} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-extrabold text-ink-900">{displayName}</p>
              <p className="truncate text-xs text-ink-700/60">{user?.email || profile?.email || "Guest account"}</p>
            </div>
          </div>
          <nav className="p-2">
            {menu.map((m) => (
              <button
                key={m.key}
                onClick={() => setTab(m.key)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                  tab === m.key ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-ink-50"
                }`}
              >
                <m.icon size={18} /> {m.label}
              </button>
            ))}
            <div className="my-2 border-t border-ink-600/10" />
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
              >
                <span className="flex items-center gap-3"><l.icon size={18} /> {l.label}</span>
                <ChevronRight size={16} className="text-ink-700/40" />
              </Link>
            ))}
            {(user || profile) && (
              <>
                <div className="my-2 border-t border-ink-600/10" />
                <button
                  onClick={signOut}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            )}
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0">
          {tab === "overview" && (
            <div className="space-y-5">
              <div>
                <h1 className="text-xl font-extrabold text-ink-900">Hi, {displayName.split(" ")[0]} 👋</h1>
                <p className="text-sm text-ink-700/60">Welcome to your account dashboard.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Account details card */}
                <div className="rounded-card border border-ink-600/10 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-700/50">Account details</p>
                  <p className="mt-2 font-bold text-ink-900">{displayName}</p>
                  <p className="text-sm text-ink-700/70">{user?.email || profile?.email || "—"}</p>
                  <p className="text-sm text-ink-700/70">{profile?.phone || user?.phone || "—"}</p>
                  <button onClick={() => setTab("details")} className="mt-2 text-xs font-bold text-brand-600 hover:underline">Edit →</button>
                </div>
                {/* Address card */}
                <div className="rounded-card border border-ink-600/10 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-700/50">Default address</p>
                  {profile?.address ? (
                    <>
                      <p className="mt-2 font-bold text-ink-900">{profile.name}</p>
                      <p className="text-sm text-ink-700/70">{profile.address}{profile.town ? `, ${profile.town}` : ""}</p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-ink-700/60">No address saved yet.</p>
                  )}
                  <button onClick={() => setTab("address")} className="mt-2 text-xs font-bold text-brand-600 hover:underline">Edit →</button>
                </div>
              </div>

              {/* Recent orders */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="font-extrabold text-ink-900">Recent orders</h2>
                  {orders.length > 0 && (
                    <button onClick={() => setTab("orders")} className="text-sm font-bold text-brand-600 hover:underline">See all →</button>
                  )}
                </div>
                <OrderList orders={orders.slice(0, 2)} />
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div>
              <h1 className="mb-4 flex items-center gap-2 text-xl font-extrabold text-ink-900">
                <ShoppingBag size={22} className="text-brand-500" /> Order history
              </h1>
              <OrderList orders={orders} />
            </div>
          )}

          {(tab === "address" || tab === "details") && (
            <div>
              <h1 className="mb-4 text-xl font-extrabold text-ink-900">
                {tab === "address" ? "Address Book" : "Account Details"}
              </h1>
              <form onSubmit={save} className="grid gap-4 rounded-card border border-ink-600/10 bg-white p-6 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm">
                    <span className="mb-1 block font-medium text-ink-700">Full name</span>
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} placeholder="Your name" />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block font-medium text-ink-700">Phone</span>
                    <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={input} placeholder="07xx xxx xxx" />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block font-medium text-ink-700">Email</span>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} placeholder="you@email.com" />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block font-medium text-ink-700">Town / City</span>
                    <input value={form.town} onChange={(e) => setForm({ ...form, town: e.target.value })} className={input} placeholder="Kampala" />
                  </label>
                </div>
                <label className="text-sm">
                  <span className="mb-1 block font-medium text-ink-700">Delivery address</span>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={input} placeholder="Area, street, landmark" />
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600">
                    <Save size={16} /> Save changes
                  </button>
                  {saved && <span className="text-sm font-semibold text-green-600">✓ Saved</span>}
                </div>
              </form>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Link href="/learn/dashboard" className="flex items-center gap-3 rounded-card border border-ink-600/10 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <Package className="text-brand-500" />
                  <div>
                    <p className="font-bold text-ink-800">My Learning</p>
                    <p className="text-xs text-ink-700/60">Courses, progress & certificates</p>
                  </div>
                </Link>
                <a href={whatsappLink("Hi, I need help with my order/account.")} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-card border border-ink-600/10 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <ShieldCheck className="text-brand-500" />
                  <div>
                    <p className="font-bold text-ink-800">Order help & support</p>
                    <p className="text-xs text-ink-700/60">Chat with {site.name} on WhatsApp</p>
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderList({ orders }: { orders: SavedOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-ink-600/20 bg-white p-8 text-center">
        <p className="text-sm font-semibold text-ink-700">You have no orders yet.</p>
        <Link href="/shop" className="mt-3 inline-block rounded-md bg-brand-500 px-5 py-2 text-sm font-bold text-white hover:bg-brand-600">
          Start shopping
        </Link>
      </div>
    );
  }
  return (
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
                <Image src={productImage({ id: it.product_slug })} alt={it.name} fill sizes="48px" className="object-contain p-0.5" />
              </span>
            ))}
            {o.items.length > 4 && <span className="text-xs font-semibold text-ink-700/60">+{o.items.length - 4} more</span>}
            <span className="ml-auto text-right">
              <span className="block text-xs text-ink-700/50">{o.items.reduce((s, i) => s + i.quantity, 0)} item(s)</span>
              <span className="block font-extrabold text-ink-900">{ugx(o.total)}</span>
            </span>
          </div>
          <div className="mt-3 flex gap-2">
            <a href={whatsappLink(`Hi, I'd like an update on my order ${o.reference}.`)} target="_blank" rel="noreferrer" className="rounded-md border border-ink-600/20 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50">
              Track / ask update
            </a>
            <Link href="/shop" className="rounded-md bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-600 hover:bg-brand-100">
              Buy again
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
