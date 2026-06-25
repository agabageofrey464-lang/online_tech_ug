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

  return (
    <div className="container-page py-10">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: "Checkout" }]} />
      </div>
      <h1 className="text-2xl font-extrabold text-ink-600">Checkout</h1>
      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        {/* Details */}
        <div className="space-y-6">
          <fieldset className="rounded-card border border-ink-600/10 bg-white p-6">
            <legend className="px-2 text-sm font-bold text-ink-600">Your details</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="customer_name" label="Full name" required placeholder="Your full name" />
              <Input name="phone" label="Phone (for delivery)" required placeholder="07XX XXX XXX" />
            </div>
            <Input name="email" type="email" label="Email (for receipt)" placeholder="you@example.com" />
          </fieldset>

          <fieldset className="rounded-card border border-ink-600/10 bg-white p-6">
            <legend className="px-2 text-sm font-bold text-ink-600">Delivery</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Town / District</label>
                <select
                  value={town}
                  onChange={(e) => setTown(e.target.value)}
                  required
                  className="w-full rounded-lg border border-ink-600/20 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {DELIVERY_TOWNS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-ink-700/55">
                  {km !== null
                    ? `≈ ${km} km from our shop — transport ${deliveryFee === 0 ? "Free" : ugx(deliveryFee)}`
                    : "Transport calculated by distance"}
                </p>
              </div>
              <Input name="delivery_address" label="Address / Landmark" required placeholder="e.g. Ntinda, near..." />
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Order notes (optional)</label>
              <textarea
                name="notes"
                rows={2}
                className="w-full rounded-lg border border-ink-600/20 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </fieldset>

          <fieldset className="rounded-card border border-ink-600/10 bg-white p-6">
            <legend className="px-2 text-sm font-bold text-ink-600">Payment method</legend>
            <div className="space-y-3">
              {[
                { v: "cash_on_delivery", label: "Cash on Delivery", hint: "Pay when your order arrives." },
                { v: "mtn_momo", label: "MTN Mobile Money", hint: "We'll send a payment prompt / details." },
                { v: "airtel_money", label: "Airtel Money", hint: "We'll send a payment prompt / details." },
              ].map((opt) => (
                <label
                  key={opt.v}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                    payment === opt.v ? "border-brand-500 bg-brand-50" : "border-ink-600/15"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={opt.v}
                    checked={payment === opt.v}
                    onChange={() => setPayment(opt.v as OrderPayload["payment_method"])}
                    className="mt-1 accent-[#F15A29]"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ink-600">{opt.label}</span>
                    <span className="block text-xs text-ink-700/60">{opt.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-card border border-ink-600/10 bg-white p-6 lg:sticky lg:top-20">
          <h2 className="text-sm font-bold text-ink-600">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {items.map((i) => (
              <li key={i.slug} className="flex justify-between gap-3 text-sm">
                <span className="text-ink-700/80">
                  {i.name} <span className="text-ink-700/50">× {i.quantity}</span>
                </span>
                <span className="font-semibold text-ink-600">{ugx(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1.5 border-t border-ink-600/10 pt-4 text-sm">
            <Row label="Subtotal" value={ugx(subtotal)} />
            <Row
              label={km !== null ? `Transport (${town}, ≈${km}km)` : "Transport"}
              value={deliveryFee === 0 ? "Free" : ugx(deliveryFee)}
            />
            <div className="flex justify-between pt-2 text-base font-extrabold text-ink-600">
              <span>Total</span>
              <span>{ugx(total)}</span>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-brand-200 bg-brand-50 p-3">
              <p className="text-sm font-medium text-brand-700">{error}</p>
              {waUrl && (
                <>
                  <p className="mt-1 text-xs text-ink-700/70">
                    No problem — complete your order on WhatsApp and we&apos;ll confirm right away.
                  </p>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block rounded-md bg-[#25D366] px-4 py-2 text-sm font-bold text-white hover:brightness-105"
                  >
                    Complete order on WhatsApp
                  </a>
                </>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {submitting ? "Placing order…" : `Place order · ${ugx(total)}`}
          </button>
          <p className="mt-3 text-center text-xs text-ink-700/50">
            Final delivery fee confirmed by our team.
          </p>
        </aside>
      </form>
    </div>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-ink-700/70">
      <span>{label}</span>
      <span className="font-medium text-ink-600">{value}</span>
    </div>
  );
}
