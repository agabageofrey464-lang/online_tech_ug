import type { Metadata } from "next";
import Link from "next/link";
import {
  Store, Wallet, TrendingUp, ShieldCheck, Package, ImageIcon, BarChart3,
  MessageCircle, Boxes, Truck, UserPlus, LogIn, Check,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sell on OnlineTechUg — Become a Vendor",
  description:
    "Join OnlineTechUg as a vendor. Open your own online store, list products, reach thousands of buyers and get paid after every sale.",
};

export const revalidate = 300; // ISR: rebuild every 5 min instead of on every request

const COMMISSION = 10;

type MItem = { vendor_name: string; vendor_verified?: boolean; image_url: string };
type VStore = { name: string; verified: boolean; count: number; image: string };

async function getTopStores(): Promise<VStore[]> {
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${API}/api/v1/vendor/marketplace`, { cache: "no-store" });
    const items: MItem[] = res.ok ? await res.json() : [];
    const map = new Map<string, VStore>();
    for (const p of items) {
      const v = map.get(p.vendor_name) ?? { name: p.vendor_name, verified: false, count: 0, image: "" };
      v.count += 1;
      v.verified = v.verified || !!p.vendor_verified;
      if (!v.image && p.image_url) v.image = p.image_url;
      map.set(p.vendor_name, v);
    }
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 8);
  } catch {
    return [];
  }
}

const perks = [
  { icon: TrendingUp, title: "Reach more buyers", text: "Tap into our shoppers, marketing and WhatsApp audience across Uganda." },
  { icon: Store, title: "Your own online store", text: "A storefront on our marketplace — no website or tech skills needed." },
  { icon: Wallet, title: "Keep most of every sale", text: `You keep ${100 - COMMISSION}% — we take just a ${COMMISSION}% fee per item sold.` },
  { icon: ShieldCheck, title: "Trusted & supported", text: "We handle secure orders, customer care and delivery together with you." },
];

const canDo = [
  { icon: Package, t: "Add & edit products" },
  { icon: ImageIcon, t: "Upload product photos" },
  { icon: Wallet, t: "Set your own prices" },
  { icon: Boxes, t: "Manage inventory & stock" },
  { icon: Truck, t: "Receive & dispatch orders" },
  { icon: BarChart3, t: "Track earnings & sales" },
  { icon: MessageCircle, t: "Reply to customers" },
  { icon: Store, t: "Customize your store profile" },
];

const steps = [
  { n: 1, t: "Register", d: "Create your vendor account in a couple of minutes." },
  { n: 2, t: "Get approved", d: "We review your details and activate your store." },
  { n: 3, t: "List products", d: "Add items, photos and prices from your dashboard." },
  { n: 4, t: "Sell & get paid", d: `Customers order & pay; we deduct ${COMMISSION}% and pay you the rest.` },
];

const faqs = [
  { q: "Who can become a vendor?", a: "Any business or individual in Uganda selling genuine products — electronics, phones, fashion, home items and more. You don't need a website or technical skills." },
  { q: "How much does it cost?", a: `You can start on commission (we keep ${COMMISSION}% per sale, no monthly fee) or pick a flat weekly, monthly or yearly subscription with 0% commission. See our Pricing page for details.` },
  { q: "How do I get paid?", a: "After a sale is delivered and confirmed, we deduct our fee and pay you your balance via Mobile Money or bank transfer." },
  { q: "Do I handle delivery?", a: "We coordinate delivery with you. You prepare and dispatch the order; we help get it to the customer and keep everyone updated." },
  { q: "How long until my store is live?", a: "Once you register, our team reviews and approves your account — usually within a day. Then you can list products right away." },
];

export default async function SellPage() {
  const stores = await getTopStores();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-ink-700 to-ink-500 text-white">
        <div className="container-page py-14 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
              🏪 Sell on OnlineTechUg
            </span>
            <h1 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">Grow your business — sell to thousands of buyers</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
              Open your own online store on OnlineTechUg. List your products, reach customers across Uganda,
              and get paid after every sale — we bring the buyers, you make the sales.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/signup?role=vendor" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-7 py-3 text-sm font-extrabold text-white shadow-lg transition hover:bg-brand-600">
                <UserPlus size={18} /> Become a Vendor
              </Link>
              <Link href="/login?next=/vendor" className="inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/5 px-7 py-3 text-sm font-extrabold text-white transition hover:bg-white/15">
                <LogIn size={18} /> Vendor Login
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/60">Already selling? Log in to your dashboard. New here? Register in 2 minutes.</p>
          </div>
        </div>
      </section>

      <div className="container-page space-y-12 py-12">
        {/* Benefits */}
        <section>
          <h2 className="text-center text-2xl font-extrabold text-ink-900">Why sell with us</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((p) => (
              <div key={p.title} className="rounded-card border border-ink-600/10 bg-white p-5 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <p.icon size={22} />
                </span>
                <h3 className="mt-3 font-bold text-ink-900">{p.title}</h3>
                <p className="mt-1 text-sm text-ink-700/70">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What you can do in your dashboard */}
        <section className="rounded-card border border-ink-600/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-center text-2xl font-extrabold text-ink-900">Everything in your Vendor Dashboard</h2>
          <p className="mx-auto mt-1 max-w-lg text-center text-sm text-ink-700/60">Once approved, manage your whole store yourself.</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {canDo.map((c) => (
              <div key={c.t} className="flex items-center gap-2.5 rounded-lg bg-ink-50/60 px-3 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm">
                  <c.icon size={17} />
                </span>
                <span className="text-[13px] font-semibold text-ink-800">{c.t}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-center text-2xl font-extrabold text-ink-900">How it works</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="relative rounded-card border border-ink-600/10 bg-white p-5 shadow-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-black text-white">{s.n}</span>
                <h3 className="mt-3 font-extrabold text-ink-900">{s.t}</h3>
                <p className="mt-1 text-sm text-ink-700/70">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured vendors / top stores */}
        {stores.length > 0 && (
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-ink-900">Top stores on OnlineTechUg</h2>
              <Link href="/marketplace" className="text-sm font-bold text-brand-600 hover:underline">Visit marketplace →</Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {stores.map((s) => (
                <div key={s.name} className="flex items-center gap-3 rounded-xl border border-ink-600/10 bg-white p-3 shadow-sm">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-sm font-extrabold text-brand-600">
                    {s.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.image} alt={s.name} className="h-full w-full object-cover" />
                    ) : (
                      s.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 truncate text-sm font-bold text-ink-900">
                      <span className="truncate">{s.name}</span>
                      {s.verified && <span className="shrink-0 rounded-full bg-green-100 px-1.5 text-[9px] font-bold text-green-700">✓</span>}
                    </p>
                    <p className="text-[11px] text-ink-700/55">{s.count} product{s.count > 1 ? "s" : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pricing pointer */}
        <Link href="/pricing" className="flex items-center justify-between gap-3 rounded-card border border-brand-200 bg-gradient-to-r from-brand-50 to-white p-5 shadow-sm transition hover:shadow-md">
          <div>
            <p className="text-sm font-extrabold text-ink-900">💰 Vendor plans & pricing</p>
            <p className="text-xs text-ink-700/65">Commission-free subscriptions (weekly / monthly / yearly) or pay-as-you-sell.</p>
          </div>
          <span className="shrink-0 rounded-full bg-brand-500 px-4 py-2 text-xs font-bold text-white">View pricing →</span>
        </Link>

        {/* FAQs */}
        <section>
          <h2 className="text-center text-2xl font-extrabold text-ink-900">Frequently asked questions</h2>
          <div className="mx-auto mt-6 max-w-2xl space-y-2">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-card border border-ink-600/10 bg-white p-4 shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-bold text-ink-900">
                  {f.q}
                  <span className="text-brand-500 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-sm text-ink-700/75">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="rounded-card bg-ink-700 p-8 text-center text-white">
          <h2 className="text-2xl font-extrabold">Ready to start selling?</h2>
          <p className="mx-auto mt-1 max-w-lg text-sm text-white/80">Join OnlineTechUg today and put your products in front of thousands of buyers.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/signup?role=vendor" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-7 py-3 text-sm font-extrabold text-white hover:bg-brand-600">
              <UserPlus size={18} /> Become a Vendor
            </Link>
            <Link href="/login?next=/vendor" className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-7 py-3 text-sm font-extrabold text-white hover:bg-white/10">
              <LogIn size={18} /> Vendor Login
            </Link>
          </div>
          <p className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-white/60">
            <span className="inline-flex items-center gap-1"><Check size={13} /> Free to join</span>
            <span className="inline-flex items-center gap-1"><Check size={13} /> Approved within a day</span>
            <span className="inline-flex items-center gap-1"><Check size={13} /> Get paid after every sale</span>
          </p>
        </section>
      </div>
    </div>
  );
}
