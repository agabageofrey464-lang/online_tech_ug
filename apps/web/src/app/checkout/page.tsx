"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart";
import { ugx, whatsappLink } from "@/lib/site";
import { createOrder, type OrderPayload } from "@/lib/api";
import { DELIVERY_TOWNS, estimateDelivery, STORE_LOCATION } from "@/lib/delivery";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [town, setTown] = useState("Kampala");
  const [payment, setPayment] = useState<OrderPayload["payment_method"]>("cash_on_delivery");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [waUrl, setWaUrl] = useState("");

  const { fee: deliveryFee, km } = useMemo(
    () => estimateDelivery(town, subtotal),
    [town, subtotal],
  );
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center text-center">
        <span className="text-5xl">🛒</span>
        <h1 className="mt-4 text-2xl font-extrabold text-ink-600">Your cart is empty</h1>
        <Link href="/shop" className="mt-4 font-semibold text-brand-600 hover:underline">
          Browse products →
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const payload: OrderPayload = {
      customer_name: String(f.get("customer_name") || ""),
      phone: String(f.get("phone") || ""),
      email: String(f.get("email") || ""),
      delivery_town: town,
      delivery_address: String(f.get("delivery_address") || ""),
      notes: String(f.get("notes") || ""),
      payment_method: payment,
      items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
    };
    try {
      const order = await createOrder(payload);
      // Save the order locally so it appears in the client's account.
      try {
        const key = "otu_orders";
        const list = JSON.parse(localStorage.getItem(key) || "[]");
        list.unshift({
          reference: order.reference,
          total: order.total,
          status: order.status,
          payment_status: order.payment_status,
          payment_method: order.payment_method,
          items: order.items,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem(key, JSON.stringify(list));
      } catch {}
      clear();
      router.push(`/checkout/success?ref=${order.reference}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Checkout failed.",
      );
      // Build a WhatsApp fallback so the order is never lost.
      const lines = items.map((i) => `• ${i.name} ×${i.quantity} — ${ugx(i.price * i.quantity)}`).join("\n");
      const msg =
        `Hello Online Tech Uganda! I'd like to place this order:\n${lines}\n` +
        `Subtotal: ${ugx(subtotal)}\nDelivery (${town}): ${ugx(deliveryFee)}\nTotal: ${ugx(total)}\n` +
        `Name: ${payload.customer_name}\nPhone: ${payload.phone}\nAddress: ${payload.delivery_address}, ${town}\n` +
        `Payment: ${payload.payment_method.replace(/_/g, " ")}`;
      setWaUrl(whatsappLink(msg));
      setSubmitting(false);
    }
  }

  const prepay = [
    { v: "mtn_momo", label: "Pay now with MTN Money", hint: "Use number format: 2567XXXXXXXX", icon: "/Icons/mtn.svg" },
    { v: "airtel_money", label: "Pay now with Airtel Money", hint: "Use number format: 2567XXXXXXXX", icon: "/Icons/airtel.svg" },
  ] as const;

  return (
    <div className="bg-[#f1f3f6]">
      <div className="container-page py-8">
        <div className="mb-4">
          <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: "Checkout" }]} />
        </div>

        <form onSubmit={onSubmit} className="grid gap-5 lg:grid-cols-[1fr_360px]">
          {/* Steps */}
          <div className="space-y-4">
            {/* 1. Customer address */}
            <section className="overflow-hidden rounded-lg bg-white shadow-sm">
              <StepHeader n={1} title="CUSTOMER ADDRESS" done />
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <Input name="customer_name" label="Full name" required placeholder="Your full name" />
                <Input name="phone" label="Phone" required placeholder="07XX XXX XXX" />
                <Input name="email" type="email" label="Email (for receipt)" placeholder="you@example.com" />
                <Input name="delivery_address" label="Address / Landmark" required placeholder="e.g. Ntinda, near..." />
              </div>
            </section>

            {/* 2. Delivery details */}
            <section className="overflow-hidden rounded-lg bg-white shadow-sm">
              <StepHeader n={2} title="DELIVERY DETAILS" done />
              <div className="p-5">
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Delivery town / district</label>
                <select
                  value={town}
                  onChange={(e) => setTown(e.target.value)}
                  required
                  className="w-full rounded-lg border border-ink-600/20 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {DELIVERY_TOWNS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-brand-50 p-3 text-sm">
                  <span className="text-brand-600">🚚</span>
                  <div>
                    <p className="font-bold text-ink-900">Door Delivery</p>
                    <p className="text-xs text-ink-700/60">
                      {km !== null ? `≈ ${km} km from our shop · ` : ""}
                      Delivery fee {deliveryFee === 0 ? "Free" : ugx(deliveryFee)}. Confirmed by our team.
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium text-ink-700">Order notes (optional)</label>
                  <textarea name="notes" rows={2} className="w-full rounded-lg border border-ink-600/20 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                </div>
              </div>
            </section>

            {/* 3. Payment method */}
            <section className="overflow-hidden rounded-lg bg-white shadow-sm">
              <StepHeader n={3} title="PAYMENT METHOD" />
              <div className="p-5">
                <p className="mb-2 text-sm font-bold text-ink-900">Pre-pay Now</p>
                <div className="space-y-2.5">
                  {prepay.map((opt) => (
                    <PayOption key={opt.v} opt={opt} payment={payment} setPayment={setPayment} />
                  ))}
                </div>

                <p className="mb-2 mt-5 text-sm font-bold text-ink-900">Payment on delivery</p>
                <PayOption
                  opt={{ v: "cash_on_delivery", label: "Pay on Delivery", hint: "Pay with cash or Mobile Money when your order arrives." }}
                  payment={payment}
                  setPayment={setPayment}
                />
              </div>
            </section>
          </div>

          {/* Order summary */}
          <aside className="h-fit rounded-lg bg-white p-5 shadow-sm lg:sticky lg:top-20">
            <h2 className="border-b border-ink-600/10 pb-3 text-base font-extrabold text-ink-900">Order summary</h2>
            <div className="space-y-2 py-3 text-sm">
              <div className="flex justify-between text-ink-700/80">
                <span>Item&apos;s total ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                <span className="font-semibold text-ink-900">{ugx(subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-700/80">
                <span>Delivery fees</span>
                <span className="font-semibold text-ink-900">{deliveryFee === 0 ? "Free" : ugx(deliveryFee)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-y border-ink-600/10 py-3">
              <span className="text-sm font-bold text-ink-900">Total</span>
              <span className="text-xl font-extrabold text-ink-900">{ugx(total)}</span>
            </div>

            {/* Promo code */}
            <div className="mt-4 flex gap-2">
              <input name="promo" placeholder="Enter code here" className="min-w-0 flex-1 rounded-md border border-ink-600/20 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
              <button type="button" className="shrink-0 rounded-md px-3 py-2 text-sm font-bold text-brand-600 hover:bg-brand-50">APPLY</button>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-brand-200 bg-brand-50 p-3">
                <p className="text-sm font-medium text-brand-700">{error}</p>
                {waUrl && (
                  <>
                    <p className="mt-1 text-xs text-ink-700/70">Complete your order on WhatsApp and we&apos;ll confirm right away.</p>
                    <a href={waUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block rounded-md bg-[#25D366] px-4 py-2 text-sm font-bold text-white hover:brightness-105">
                      Complete order on WhatsApp
                    </a>
                  </>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full rounded-md bg-brand-500 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-600 disabled:opacity-60"
            >
              {submitting ? "Placing order…" : "Confirm order"}
            </button>
            <p className="mt-3 text-center text-[11px] text-ink-700/50">
              By proceeding, you accept our Terms &amp; Conditions and privacy policy.
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}

function StepHeader({ n, title, done }: { n: number; title: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-3 border-b border-ink-600/10 px-5 py-3">
      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-green-600 text-white" : "border-2 border-ink-600/30 text-ink-600/50"}`}>
        {done ? "✓" : n}
      </span>
      <h2 className="text-sm font-extrabold tracking-wide text-ink-900">{n}. {title}</h2>
    </div>
  );
}

type PayOpt = { v: string; label: string; hint: string; icon?: string };
function PayOption({
  opt,
  payment,
  setPayment,
}: {
  opt: PayOpt;
  payment: string;
  setPayment: (v: OrderPayload["payment_method"]) => void;
}) {
  const active = payment === opt.v;
  return (
    <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${active ? "border-brand-500 bg-brand-50" : "border-ink-600/15 hover:border-ink-600/30"}`}>
      <input
        type="radio"
        name="payment_method"
        value={opt.v}
        checked={active}
        onChange={() => setPayment(opt.v as OrderPayload["payment_method"])}
        className="accent-[#F15A29]"
      />
      <span className="flex-1">
        <span className="block text-sm font-semibold text-ink-900">{opt.label}</span>
        <span className="block text-xs text-ink-700/60">{opt.hint}</span>
      </span>
      {opt.icon && (
        <span className="flex h-7 w-10 shrink-0 items-center justify-center rounded bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={opt.icon} alt="" className="h-5 w-auto object-contain" />
        </span>
      )}
    </label>
  );
}

function Input({
  name,
  label,
  type = "text",
  required,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink-700">
        {label} {required && <span className="text-brand-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-ink-600/20 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
    </div>
  );
}

