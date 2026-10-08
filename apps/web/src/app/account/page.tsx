"use client";

import { useEffect, useState } from "react";
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
  Gift,
  ChevronRight,
  ChevronDown,
  MessageCircle,
  Phone,
  HelpCircle,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { site, whatsappLink, ugx } from "@/lib/site";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Avatar } from "@/components/avatar";
import { useAuth } from "@/lib/auth";
import { productImage, products } from "@/lib/data";
import { fallbackImage } from "@/lib/image-fallback";
import { SafeImage } from "@/components/safe-image";
import { EmptyState } from "@/components/empty-state";
import { estimatedDeliveryDate, formatDeliveryDate } from "@/lib/delivery";

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
const telHref = (p: string) => `tel:${p.replace(/\s/g, "")}`;

type Tab = "overview" | "orders" | "address" | "details";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", town: "", address: "" });
  const [saved, setSaved] = useState(false);
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [orderFilter, setOrderFilter] = useState<"ongoing" | "canceled">("ongoing");

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
    if (typeof window !== "undefined" && window.location.hash === "#orders") setTab("orders");
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
    { href: "/refer", label: "Refer & Earn", icon: Gift },
    { href: "/wishlist", label: "Saved Items", icon: Heart },
    { href: "/learn/dashboard", label: "My Learning", icon: GraduationCap },
    ...(user?.role === "vendor" ? [{ href: "/vendor", label: "Vendor Dashboard", icon: Store }] : []),
    ...(user?.role === "admin" ? [{ href: "/learn/codes", label: "Course Unlock Codes", icon: ShieldCheck }] : []),
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

      {/* Vendor banner — unmissable path to the seller dashboard */}
      {user?.role === "vendor" && (
        <Link
          href="/vendor"
          className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-card border border-brand-200 bg-gradient-to-r from-brand-50 to-white p-4 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
              <Store size={22} />
            </span>
            <div>
              <p className="font-extrabold text-ink-900">
                You&apos;re a vendor{user.vendor_approved ? "" : " (pending approval)"} — go to your dashboard
              </p>
              <p className="text-sm text-ink-700/65">Add products, upload photos and manage your store &amp; sales.</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-bold text-white">
            Open Vendor Dashboard →
          </span>
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar menu (Jumia-style) */}
        <aside className="h-fit overflow-hidden rounded-card border border-ink-600/10 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-ink-600/10 bg-ink-50/60 p-4">
            <Avatar name={displayName} seed={user?.email || profile?.email} size={44} />
            <div className="min-w-0">
              <p className="truncate font-extrabold text-ink-900">Welcome {displayName.split(" ")[0]}!</p>
              <p className="truncate text-xs text-ink-700/60">{user?.email || profile?.email || "Guest account"}</p>
            </div>
          </div>

          {/* Live Chat / WhatsApp (Jumia-style) */}
          <div className="grid grid-cols-2 gap-2 border-b border-ink-600/10 p-3">
            <a
              href={telHref(site.phoneDisplay)}
              className="flex items-center justify-center gap-1.5 rounded-md bg-brand-500 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-brand-600"
            >
              <Phone size={15} /> Call us
            </a>
            <a
              href={whatsappLink("Hi Online Tech Uganda, I need help with my account.")}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-md bg-[#25D366] px-3 py-2.5 text-xs font-bold text-white transition hover:brightness-95"
            >
              <MessageCircle size={15} /> WhatsApp
            </a>
          </div>

          {/* Need assistance */}
          <p className="px-4 pt-3 text-[11px] font-bold uppercase tracking-wider text-ink-700/45">Need assistance?</p>
          <Link
            href="/help"
            className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
          >
            <span className="flex items-center gap-3"><HelpCircle size={18} /> Help &amp; Support</span>
            <ChevronRight size={16} className="text-ink-700/40" />
          </Link>

          <nav className="p-2">
            <p className="px-1 pb-1 pt-1 text-[11px] font-bold uppercase tracking-wider text-ink-700/45">My account</p>
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

              {user && <SecuritySection />}

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
                <OrderList orders={orders.slice(0, 2)} town={profile?.town} />
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div>
              <h1 className="mb-4 flex items-center gap-2 text-xl font-extrabold text-ink-900">
                <ShoppingBag size={22} className="text-brand-500" /> Orders
              </h1>
              {/* Jumia-style tabs */}
              <div className="mb-4 flex border-b border-ink-600/10">
                {([
                  { key: "ongoing", label: "ONGOING / DELIVERED" },
                  { key: "canceled", label: "CANCELED / RETURNED" },
                ] as const).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setOrderFilter(t.key)}
                    className={`flex-1 border-b-2 px-2 pb-2.5 text-xs font-extrabold tracking-wide transition sm:text-sm ${
                      orderFilter === t.key
                        ? "border-brand-500 text-brand-600"
                        : "border-transparent text-ink-700/50 hover:text-ink-700"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <OrderList
                town={profile?.town}
                orders={orders.filter((o) =>
                  orderFilter === "canceled"
                    ? ["cancelled", "returned"].includes(o.status.toLowerCase())
                    : !["cancelled", "returned"].includes(o.status.toLowerCase()),
                )}
              />
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

// Email verification + two-factor authentication controls.
function SecuritySection() {
  const { user, verifyEmail, resendVerification, setTwofa } = useAuth();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  if (!user) return null;

  async function doVerify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(""); setMsg("");
    try {
      await verifyEmail(code);
      setMsg("Email verified ✓");
      setCode("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Invalid code");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setBusy(true); setErr(""); setMsg("");
    try {
      await resendVerification();
      setMsg("A new code has been emailed to you.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle2fa() {
    setBusy(true); setErr(""); setMsg("");
    try {
      await setTwofa(!user!.twofa_enabled);
      setMsg(user!.twofa_enabled ? "Two-factor turned off." : "Two-factor turned on.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not update 2FA");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-card border border-ink-600/10 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <ShieldCheck size={18} className="text-brand-500" />
        <h2 className="font-extrabold text-ink-900">Security</h2>
      </div>

      {/* Email verification */}
      <div className="mt-4 border-t border-ink-600/10 pt-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-ink-900">Email address</p>
            <p className="text-xs text-ink-700/60">{user.email}</p>
          </div>
          {user.email_verified ? (
            <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold text-green-700">✓ Verified</span>
          ) : (
            <span className="rounded-full bg-gold-100 px-2.5 py-1 text-[11px] font-bold text-gold-700">Unverified</span>
          )}
        </div>
        {!user.email_verified && (
          <form onSubmit={doVerify} className="mt-3 flex flex-wrap items-center gap-2">
            <input
              inputMode="numeric"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-36 rounded-md border border-ink-600/15 px-3 py-2 text-sm tracking-widest focus:border-brand-500 focus:outline-none"
            />
            <button type="submit" disabled={busy || code.length < 4} className="rounded-md bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-50">
              Verify
            </button>
            <button type="button" onClick={resend} disabled={busy} className="text-xs font-semibold text-brand-600 hover:underline disabled:opacity-50">
              Resend code
            </button>
          </form>
        )}
      </div>

      {/* Two-factor */}
      <div className="mt-4 border-t border-ink-600/10 pt-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink-900">Two-factor authentication</p>
            <p className="text-xs text-ink-700/60">Email a one-time code each time you sign in.</p>
          </div>
          <button
            onClick={toggle2fa}
            disabled={busy || (!user.email_verified && !user.twofa_enabled)}
            title={!user.email_verified ? "Verify your email first" : undefined}
            className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-40 ${user.twofa_enabled ? "bg-green-500" : "bg-ink-300"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${user.twofa_enabled ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </div>
        {!user.email_verified && (
          <p className="mt-1 text-xs text-gold-600">Verify your email to enable two-factor.</p>
        )}
      </div>

      {msg && <p className="mt-3 text-xs font-semibold text-green-600">{msg}</p>}
      {err && <p className="mt-3 text-xs font-semibold text-red-500">{err}</p>}
    </div>
  );
}

// Jumia-style status badge (green DELIVERED, red cancelled, etc.)
const STATUS_LABEL: Record<string, string> = {
  pending: "Processing",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};
function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const tone =
    s === "delivered"
      ? "bg-green-500 text-white"
      : s === "cancelled" || s === "returned"
        ? "bg-red-500 text-white"
        : s === "shipped"
          ? "bg-ink-500 text-white"
          : "bg-brand-500 text-white"; // pending/confirmed/processing
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${tone}`}>
      {STATUS_LABEL[s] ?? status}
    </span>
  );
}

const fmtLong = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

const imgFor = (slug?: string, name?: string) => {
  const prod = products.find((p) => p.id === slug);
  return prod ? productImage(prod) : fallbackImage(name ?? "");
};

// Jumia-style delivery tracking timeline. Highlights progress up to the current
// status; cancelled/returned orders show a distinct stopped state.
const TRACK_STEPS = [
  { key: "placed", label: "Order placed", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "processing", label: "Processing", icon: Clock },
  { key: "shipped", label: "Out for delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
] as const;
const STEP_INDEX: Record<string, number> = { pending: 0, confirmed: 1, processing: 2, shipped: 3, delivered: 4 };

function TrackingTimeline({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "cancelled" || s === "returned") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-bold text-red-600">
        <XCircle size={18} /> Order {s === "returned" ? "returned" : "cancelled"}
      </div>
    );
  }
  const current = STEP_INDEX[s] ?? 0;
  return (
    <ol className="flex">
      {TRACK_STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step.key} className="relative flex flex-1 flex-col items-center text-center">
            {i > 0 && (
              <span
                className={`absolute right-1/2 top-[13px] h-0.5 w-full ${i <= current ? "bg-brand-500" : "bg-ink-600/15"}`}
              />
            )}
            <span
              className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-white ${
                done ? "bg-brand-500 text-white" : "bg-ink-100 text-ink-700/40"
              }`}
            >
              <step.icon size={14} />
            </span>
            <span className={`mt-1.5 text-[10px] font-semibold leading-tight ${done ? "text-ink-900" : "text-ink-700/45"}`}>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function OrderList({ orders, town }: { orders: SavedOrder[]; town?: string }) {
  const [open, setOpen] = useState<string | null>(null);

  if (orders.length === 0) {
    return (
      <EmptyState
        art="orders"
        title="No orders here yet"
        message="When you place an order it shows up here, with live delivery tracking."
        actionLabel="Start shopping"
        actionHref="/shop"
      />
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => {
        const first = o.items[0];
        const more = o.items.length - 1;
        const isOpen = open === o.reference;
        const s = o.status.toLowerCase();
        const eta =
          town && !["delivered", "cancelled", "returned"].includes(s)
            ? formatDeliveryDate(estimatedDeliveryDate(town))
            : null;
        return (
          <div
            key={o.reference}
            className="overflow-hidden rounded-card border border-ink-600/10 bg-white shadow-sm transition hover:shadow-md"
          >
            {/* Header — click to expand order details */}
            <button
              onClick={() => setOpen(isOpen ? null : o.reference)}
              className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-ink-50/50"
            >
              <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-ink-600/10 bg-white">
                <SafeImage src={imgFor(first?.product_slug, first?.name)} alt={first?.name ?? "Item"} fill sizes="80px" className="object-contain p-1" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="clamp-2 text-sm font-semibold text-ink-900">
                  {first?.name ?? "Order"}
                  {more > 0 && <span className="font-normal text-ink-700/60"> +{more} more item{more > 1 ? "s" : ""}</span>}
                </p>
                <p className="mt-0.5 text-xs text-ink-700/50">Order #{o.reference} · {fmtLong(o.createdAt)}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <StatusBadge status={o.status} />
                  <span className="text-sm font-extrabold text-ink-900">{ugx(o.total)}</span>
                </div>
              </div>
              <ChevronDown size={20} className={`shrink-0 text-ink-700/40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Expanded detail — tracking timeline, all items, actions */}
            {isOpen && (
              <div className="border-t border-ink-600/10 bg-ink-50/40 p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-700/50">Delivery status</p>
                <TrackingTimeline status={o.status} />
                {eta && (
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-ink-700/70">
                    <Truck size={14} className="text-brand-500" /> Estimated delivery: <b className="text-ink-900">{eta}</b>
                  </p>
                )}

                {/* Items in this order */}
                <div className="mt-4 divide-y divide-ink-600/10 rounded-lg border border-ink-600/10 bg-white">
                  {o.items.map((it, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5">
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-ink-600/10 bg-white">
                        <SafeImage src={imgFor(it.product_slug, it.name)} alt={it.name} fill sizes="48px" className="object-contain p-0.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="clamp-2 text-xs font-semibold text-ink-900">{it.name}</p>
                        <p className="text-[11px] text-ink-700/50">Qty: {it.quantity}</p>
                      </div>
                      <span className="text-xs font-bold text-ink-900">{ugx(it.line_total)}</span>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between text-ink-700/70">
                    <span>Payment</span>
                    <span className="font-semibold text-ink-900">
                      {o.payment_method || "Awaiting payment"} · {o.payment_status === "paid" ? "Paid" : "Not paid"}
                    </span>
                  </div>
                  <div className="flex justify-between text-ink-700/70">
                    <span>Order total</span>
                    <span className="font-extrabold text-ink-900">{ugx(o.total)}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={whatsappLink(`Hi, I'd like an update on my order ${o.reference}.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="press inline-flex items-center gap-1.5 rounded-md bg-[#25D366] px-4 py-2 text-xs font-bold text-white hover:brightness-95"
                  >
                    <MessageCircle size={14} /> Track on WhatsApp
                  </a>
                  <Link href="/shop" className="press rounded-md border border-brand-300 bg-brand-50 px-4 py-2 text-xs font-bold text-brand-600 hover:bg-brand-100">
                    Buy again
                  </Link>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
