"use client";

import { useMemo, useState } from "react";
import { ContactOptions } from "@/components/contact-options";
import Link from "next/link";
import {
  Search, ShoppingBag, CreditCard, Truck, RotateCcw, Package, User, Ticket,
  ShieldCheck, Store, MessageCircle, Banknote,
} from "lucide-react";
import { site, whatsappLink, ugx } from "@/lib/site";

const TOPICS = [
  { label: "Place an Order", icon: ShoppingBag, href: "#ordering" },
  { label: "Pay for Your Order", icon: CreditCard, href: "#payments" },
  { label: "Track Your Order", icon: Truck, href: "#delivery" },
  { label: "Returns & Refunds", icon: RotateCcw, href: "#returns" },
];

const SIDEBAR = [
  { id: "ordering", label: "Ordering", icon: ShoppingBag },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "delivery", label: "Delivery & Tracking", icon: Truck },
  { id: "returns", label: "Returns & Refunds", icon: RotateCcw },
  { id: "products", label: "Products & Warranty", icon: ShieldCheck },
  { id: "account", label: "Account", icon: User },
  { id: "vouchers", label: "Vouchers", icon: Ticket },
  { id: "sell", label: "Sell with us", icon: Store },
];

const PAY_METHODS = [
  { name: "MTN MoMo", tag: "Fast & secure", icon: "/Icons/mtn.svg", note: "Pay with your MTN Mobile Money — quick and safe, at no extra cost." },
  { name: "Airtel Money", tag: "Airtel Money", icon: "/Icons/airtel.svg", note: "Pay with your Airtel Money account — simple and secure, no extra charge." },
  { name: "Bank Transfer", tag: "Bank / Cards", icon: "/Icons/bank.svg", note: "Pay safely by bank transfer or card. Contact us for account details." },
  { name: "Pay at our shop", tag: "Collect in person", icon: null, note: "Come to our shop in Kampala, check the item, and pay there." },
];

type Faq = { cat: string; q: string; a: string };
const FAQS: Faq[] = [
  { cat: "ordering", q: "How do I place an order?", a: "Browse the shop, tap Order now, then open the cart and press Checkout. Fill in your name, phone and delivery address, choose a payment method, and confirm. You'll get an order reference." },
  { cat: "ordering", q: "Can I order without an account?", a: "Yes — you can check out as a guest. Creating an account lets you track orders and check out faster next time." },
  { cat: "ordering", q: "How do I cancel an order?", a: "Contact us on WhatsApp with your order reference and we'll cancel it if it hasn't shipped yet." },
  { cat: "payments", q: "What payment methods do you accept?", a: "MTN MoMo, Airtel Money, bank transfer or card, or cash when you collect from our shop in Kampala." },
  { cat: "payments", q: "Do you accept cash on delivery?", a: "No. We deliver orders that have already been paid for. Pay by Mobile Money, bank transfer or card and we'll bring it to you — or come to our shop in Kampala, check the item yourself, and pay there." },
  { cat: "delivery", q: "How long does delivery take?", a: "Kampala deliveries are usually same-day or next-day. Upcountry takes 1–3 days. We confirm timing on WhatsApp after you order." },
  { cat: "delivery", q: "How much is delivery?", a: `${ugx(10000)} in and around Kampala, and ${ugx(20000)} to ${ugx(75000)} upcountry depending on distance. Checkout shows the exact fee for your town before you confirm.` },
  { cat: "delivery", q: "How do I track my order?", a: "Go to Track Project / your Account, or message us on WhatsApp with your order reference for a live update." },
  { cat: "returns", q: "What is your return policy?", a: "Eligible items can be returned within 7 days if faulty or not as described. Contact us to arrange the return." },
  { cat: "returns", q: "How do refunds work?", a: "Once a return is approved, refunds are processed to your Mobile Money or original payment method, usually within a few days." },
  { cat: "products", q: "Are your products genuine?", a: "Yes — all devices are genuine and quality-checked before delivery." },
  { cat: "products", q: "Do products have warranty?", a: "Yes, most items include a warranty. New devices carry manufacturer warranty; UK-used/refurbished include a shop warranty. Ask us for specifics per product." },
  { cat: "account", q: "How do I create an account?", a: "Tap Account → Create account, or Sign up. Enter your name, email and a password. Vendors can pick 'Sell as vendor'." },
  { cat: "account", q: "I forgot my password", a: "On the sign-in page, tap 'Forgot password?'. We email you a 6-digit code; enter it with your new password. The code works once and expires after 20 minutes." },
  { cat: "vouchers", q: "How do I use a voucher/promo code?", a: "Enter your code in the 'Enter code here' box on the checkout order summary and tap APPLY." },
  { cat: "sell", q: "How do I sell on Online Tech Uganda?", a: "Tap 'Sell with us' or Sign up as a vendor. Once approved, you can list your products from your vendor dashboard." },
];

export default function HelpCenterPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return FAQS;
    return FAQS.filter((f) => f.q.toLowerCase().includes(s) || f.a.toLowerCase().includes(s));
  }, [q]);

  return (
    <div className="bg-[#f6f4f1]">
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-100 to-[#f6f4f1] py-10">
        <div className="container-page">
          <p className="text-sm font-bold text-brand-700">Help Center</p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink-900 sm:text-3xl">Hi, how can we help you?</h1>
          <div className="mt-4 flex max-w-2xl items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
            <Search size={20} className="text-ink-700/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder='Type keywords like "return", "delivery", "MoMo"'
              className="w-full bg-transparent py-1 text-sm focus:outline-none"
            />
          </div>

          {/* Topic cards */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TOPICS.map((t) => (
              <a key={t.label} href={t.href} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <t.icon size={20} />
                </span>
                <span className="text-sm font-bold text-ink-900">{t.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="h-fit overflow-hidden rounded-lg bg-white shadow-sm lg:sticky lg:top-20">
          <nav className="py-1">
            {SIDEBAR.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="flex items-center justify-between border-b border-ink-600/5 px-4 py-3 text-sm font-semibold text-ink-800 transition last:border-0 hover:bg-brand-50 hover:text-brand-700">
                <span className="flex items-center gap-3"><s.icon size={18} /> {s.label}</span>
                <span className="text-ink-700/30">›</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="space-y-8">
          {/* Payments — means of payment grid */}
          <section id="payments" className="scroll-mt-24 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="text-center text-lg font-bold text-ink-900">Your different means of payment</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PAY_METHODS.map((m) => (
                <div key={m.name} className="rounded-lg border border-ink-600/10 p-4 text-center">
                  <p className="text-sm font-bold text-ink-900">{m.name}</p>
                  <span className="mx-auto my-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
                    {m.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.icon} alt={m.name} className="h-8 w-8 object-contain" />
                    ) : (
                      <Banknote className="text-brand-600" size={26} />
                    )}
                  </span>
                  <p className="text-xs font-semibold text-brand-600">{m.tag}</p>
                  <p className="mt-1 text-[11px] leading-snug text-ink-700/60">{m.note}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-3 text-sm text-ink-700/80">
              <p><b className="text-ink-900">Option 1: Mobile Money (MTN / Airtel)</b><br />Pay for your order with MTN MoMo or Airtel Money, and we deliver it to you.</p>
              <p><b className="text-ink-900">Option 2: Collect &amp; pay at our shop</b><br />Come to our shop in Kampala, look at the item first, and pay there.</p>
              <p><b className="text-ink-900">Option 3: Bank transfer or card</b><br />For companies, schools and NGOs. Ask us for a proforma invoice and account details.</p>
              <p><b className="text-ink-900">Vouchers</b><br />Apply a valid promo code at checkout to save on your order.</p>
              <p className="rounded-lg border border-ink-600/10 bg-ink-50 px-3.5 py-2.5 text-[13px]"><b className="text-ink-900">We don&apos;t collect cash on delivery.</b> What we deliver has already been paid for — it keeps our prices down and our drivers safe.</p>
            </div>
          </section>

          {/* FAQ sections */}
          {SIDEBAR.filter((s) => s.id !== "payments").map((s) => {
            const items = filtered.filter((f) => f.cat === s.id);
            if (items.length === 0) return null;
            return (
              <section key={s.id} id={s.id} className="scroll-mt-24 rounded-lg bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900">
                  <s.icon size={20} className="text-brand-500" /> {s.label}
                </h2>
                <div className="mt-3 divide-y divide-ink-600/10">
                  {items.map((f) => (
                    <details key={f.q} className="group py-3">
                      <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-ink-800">
                        {f.q}
                        <span className="text-ink-700/40 transition group-open:rotate-45">+</span>
                      </summary>
                      <p className="mt-2 text-sm leading-relaxed text-ink-700/70">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            );
          })}

          {q.trim() && filtered.length === 0 && (
            <p className="rounded-lg bg-white p-6 text-center text-sm text-ink-700/60 shadow-sm">
              No results for “{q}”. Try different keywords or chat with us below.
            </p>
          )}

          {/* Live help CTA */}
          <section className="flex flex-col items-center gap-3 rounded-lg bg-ink-700 p-6 text-center text-white sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="flex items-center gap-2 text-lg font-extrabold"><MessageCircle size={20} /> Still need help?</p>
              <p className="text-sm text-white/80">Chat with our team — we reply fast on WhatsApp.</p>
            </div>
            <div className="flex gap-2">
              <a href={whatsappLink("Hello Online Tech Uganda, I need help.")} target="_blank" rel="noreferrer" className="rounded-md bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white hover:brightness-105">WhatsApp</a>
              <Link href="/contact" className="rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600">Contact us</Link>
            </div>
          </section>

          <p className="text-center text-xs text-ink-700/50">{site.name} — genuine tech, real human support.</p>
        </div>
      </div>
    
      <div className="container-page pb-10">
        <ContactOptions
          subject="Help request"
          heading="Still need help?"
          note="Reach a real person — call, WhatsApp or email, whichever suits you."
        />
      </div>
</div>
  );
}
