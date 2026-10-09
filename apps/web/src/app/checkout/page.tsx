"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Ticket, ShieldCheck, Lock } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { ugx, site } from "@/lib/site";
import { createOrder, validateCoupon, initPesapalPayment, onlinePaymentStatus, type OrderPayload } from "@/lib/api";
import { DELIVERY_TOWNS, estimateDelivery, STORE_LOCATION, deliveryDays, estimatedDeliveryDate, formatDeliveryDate } from "@/lib/delivery";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [town, setTown] = useState("Kampala");
  const [payment, setPayment] = useState<OrderPayload["payment_method"]>("airtel_money");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // When Pesapal is live, checkout is pay-online-only. Until
  // keys are set, the existing manual Mobile Money / PoD flow stays as fallback.
  const [pesapalReady, setPesapalReady] = useState(false);

  useEffect(() => {
    let live = true;
    onlinePaymentStatus().then((s) => {
      if (live && s.pesapal) {
        setPesapalReady(true);
        setPayment("pesapal");
      }
    });
    return () => {
      live = false;
    };
  }, []);

  // Coupon / discount
  const [promo, setPromo] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [applying, setApplying] = useState(false);

  const { fee: deliveryFee, km } = useMemo(() => estimateDelivery(town), [town]);
  const discount = coupon ? Math.min(coupon.discount, subtotal) : 0;
  const total = Math.max(0, subtotal - discount) + deliveryFee;

  async function applyPromo() {
    const code = promo.trim();
    if (!code) return;
    setApplying(true);
    setCouponMsg("");
    try {
      const res = await validateCoupon(code, subtotal);
      if (res.valid) {
        setCoupon({ code: res.code, discount: res.discount });
        setCouponMsg(`✓ ${res.code} applied — you save ${ugx(res.discount)}`);
      } else {
        setCoupon(null);
        setCouponMsg(res.message || "Invalid code");
      }
    } finally {
      setApplying(false);
    }
  }

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
      coupon_code: coupon?.code ?? "",
      referral_code: (typeof window !== "undefined" && localStorage.getItem("otu_ref")) || "",
      items: items.map((i) => ({ slug: i.slug, quantity: i.quantity, option: i.option ?? "" })),
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
      // Pesapal (live): pay BEFORE the order is processed. The order was created
      // as pending; we hand off to Pesapal's secure checkout and only mark it paid
      // once the server verifies the transaction (never on redirect back).
      if (pesapalReady) {
        try {
          const { redirect_url } = await initPesapalPayment(order.reference);
          window.location.href = redirect_url;
          return;
        } catch (e) {
          setError(e instanceof Error ? e.message : "Couldn't start the secure payment. Please try again.");
          setSubmitting(false);
          return;
        }
      }
      router.push(`/checkout/success?ref=${order.reference}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong placing your order. Please try again.",
      );
      setSubmitting(false);
    }
  }

  // Airtel first: it is our only true merchant account (Pay Merchant shows our
  // business name before the customer confirms, so they know the money is
  // reaching us). MTN is a normal send-money number.
  const prepay = [
    {
      v: "airtel_money",
      label: "Airtel Money (Merchant)",
      hint: "Pay Merchant — you'll see our business name before you confirm.",
      icon: "/Icons/airtel.svg",
      recommended: true,
    },
    {
      v: "mtn_momo",
      label: "MTN Mobile Money",
      hint: "Send Money to our MoMo number, then confirm your order.",
      icon: "/Icons/mtn.svg",
      recommended: false,
    },
  ] as const;

  return (
    <div>
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: "Checkout" }]} />
        <header className="mx-auto mb-8 mt-6 max-w-xl text-center">
          <p className="font-display text-[18px] italic text-brand-600">Three short steps</p>
          <h1 className="text-center text-[34px] leading-tight text-ink-900 sm:text-[44px]">Checkout</h1>
        </header>

        <form onSubmit={onSubmit} className="grid gap-5 lg:grid-cols-[1fr_400px] lg:gap-8">
          {/* Steps */}
          <div className="space-y-4">
            {/* 1. Customer address */}
            <section className="overflow-hidden rounded-[3px] bg-white">
              <StepHeader n={1} title="Your Details" done />
              {/* key remounts these once the signed-in account loads, so the
                  order carries the customer's REGISTERED name/phone/email. */}
              <div key={user?.email ?? "guest"} className="grid gap-4 p-5 sm:grid-cols-2">
                <Input name="customer_name" label="Full name" required placeholder="Your full name" defaultValue={user?.name} />
                <Input name="phone" label="Phone" required placeholder="07XX XXX XXX" defaultValue={user?.phone} />
                <Input name="email" type="email" label="Email (for receipt)" placeholder="you@example.com" defaultValue={user?.email} />
                <Input name="delivery_address" label="Address / Landmark" required placeholder="e.g. Ntinda, near..." />
              </div>
              {user && (
                <p className="px-5 pb-3 text-xs text-ink-700/55">
                  ✓ Using your account details ({user.email}). Edit above if delivering to someone else.
                </p>
              )}
            </section>

            {/* 2. Delivery details */}
            <section className="overflow-hidden rounded-[3px] bg-white">
              <StepHeader n={2} title="Delivery" done />
              <div className="p-5">
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Delivery town / district</label>
                <select
                  value={town}
                  onChange={(e) => setTown(e.target.value)}
                  required
                  className="w-full rounded-[3px] border border-ink-600/20 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {DELIVERY_TOWNS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <div className="mt-3 flex items-start gap-2 rounded-[3px] bg-brand-50 p-3 text-sm">
                  <span className="text-brand-600">🚚</span>
                  <div>
                    <p className="font-bold text-ink-900">Door Delivery</p>
                    <p className="text-xs text-ink-700/60">
                      {km !== null ? `≈ ${km} km from our shop · ` : ""}
                      Delivery fee <b className="text-ink-900">{ugx(deliveryFee)}</b>, worked out from the distance.
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs font-bold text-green-700">
                      📅 Arrives by {formatDeliveryDate(estimatedDeliveryDate(town))} · about {deliveryDays(km)} days
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium text-ink-700">Order notes (optional)</label>
                  <textarea name="notes" rows={2} className="w-full rounded-[3px] border border-ink-600/20 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                </div>
              </div>
            </section>

            {/* 3. Payment method */}
            <section className="overflow-hidden rounded-[3px] bg-white">
              <StepHeader n={3} title="Payment" />
              <div className="p-5">
                {pesapalReady ? (
                  /* Pesapal live — secure online payment only (pay before processing) */
                  <div className="rounded-[3px] border-2 border-brand-500 bg-brand-50 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
                        <ShieldCheck size={20} />
                      </span>
                      <div>
                        <p className="text-sm font-extrabold text-ink-900">Secure Online Payment — Pesapal</p>
                        <p className="text-xs text-ink-700/70">Pay with MTN, Airtel Money or card. Your order is processed once payment is confirmed.</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-ink-700/60">
                      <Lock size={13} className="text-green-600" /> Encrypted checkout powered by Pesapal — we never see your PIN or card.
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mb-2 text-sm font-bold text-ink-900">Pre-pay Now</p>
                    <div className="space-y-2.5">
                      {prepay.map((opt) => (
                        <PayOption key={opt.v} opt={opt} payment={payment} setPayment={setPayment} />
                      ))}
                    </div>

                    <p className="mb-2 mt-5 text-sm font-bold text-ink-900">Or pay at our shop</p>
                    <PayOption
                      opt={{
                        v: "pay_at_shop",
                        label: "Collect & pay at our shop",
                        hint: "Come to our shop at Mabirizi Complex, Kampala, check the item, and pay there.",
                      }}
                      payment={payment}
                      setPayment={setPayment}
                    />

                    <p className="mt-4 rounded-[3px] border border-ink-600/10 bg-ink-50 px-3.5 py-2.5 text-xs text-ink-700/75">
                      We deliver orders that have been paid for. There is no cash on
                      delivery — pay by Mobile Money and we&apos;ll bring it to you, or
                      collect it from the shop and pay when you see it.
                    </p>
                  </>
                )}

                {/* How-to-pay steps for the chosen mobile-money method */}
                {!pesapalReady && (payment === "airtel_money" || payment === "mtn_momo") && (
                  <div className="mt-4 rounded-[3px] border border-brand-200 bg-brand-50 p-4 text-sm">
                    <p className="font-extrabold text-ink-900">
                      How to pay — {payment === "airtel_money" ? "Airtel Money" : "MTN Mobile Money"}
                    </p>
                    {payment === "airtel_money" ? (
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-ink-700/80">
                        <li>Dial <b>*185#</b> and choose <b>Pay Merchant</b>.</li>
                        <li>Enter Merchant ID <b>{site.payment.momoAlt.merchantId}</b> (or number <b>{site.payment.momoAlt.number}</b>).</li>
                        <li>Enter amount <b>{ugx(total)}</b> and approve with your PIN.</li>
                        <li>You&apos;ll see <b>{site.payment.momoAlt.name}</b> — that&apos;s us.</li>
                      </ol>
                    ) : (
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-ink-700/80">
                        <li>Dial <b>*165#</b> and choose <b>Send Money</b>.</li>
                        <li>Send to <b>{site.payment.momo.number}</b> ({site.payment.momo.name}).</li>
                        <li>Enter amount <b>{ugx(total)}</b> and approve with your PIN.</li>
                      </ol>
                    )}
                    <p className="mt-2 rounded-[3px] bg-white/70 px-2.5 py-1.5 text-xs text-ink-700/75">
                      After paying, tap <b>Confirm order</b> below. We verify your payment and then dispatch — we deliver orders that are already paid for.
                    </p>
                  </div>
                )}

                {/* Institutions can't pay off a web page — they need paperwork first. */}
                <p className="mt-4 rounded-[3px] border border-ink-600/10 bg-ink-50 px-3.5 py-2.5 text-xs text-ink-700/75">
                  Buying for a company, school or NGO?{" "}
                  <Link href="/invoice" className="font-bold text-brand-600 hover:underline">
                    Request a proforma invoice
                  </Link>{" "}
                  and we&apos;ll send figures your finance office can work from.
                </p>
              </div>
            </section>
          </div>

          {/* Order summary */}
          <aside className="h-fit rounded-[3px] bg-white p-5 lg:sticky lg:top-20">
            <h2 className="border-b border-ink-600/10 pb-3 text-[24px] leading-none text-ink-900">Order Summary</h2>
            <div className="space-y-2 py-3 text-sm">
              <div className="flex justify-between text-ink-700/80">
                <span>Item&apos;s total ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                <span className="font-semibold text-ink-900">{ugx(subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-700/80">
                <span>Delivery fees</span>
                <span className="font-semibold text-ink-900">{deliveryFee === 0 ? "Free" : ugx(deliveryFee)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between font-semibold text-green-600">
                  <span>Discount {coupon ? `(${coupon.code})` : ""}</span>
                  <span>−{ugx(discount)}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-y border-ink-600/10 py-3">
              <span className="text-sm font-bold text-ink-900">Total</span>
              <span className="text-xl font-extrabold text-ink-900">{ugx(total)}</span>
            </div>

            {/* Promo code */}
            <div className="mt-4 flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Ticket size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-500" />
                <input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value.toUpperCase())}
                  placeholder="Enter code here"
                  className="w-full rounded-[3px] border border-ink-600/20 py-2 pl-9 pr-3 text-sm uppercase focus:border-brand-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={applyPromo}
                disabled={applying || !promo.trim()}
                className="shrink-0 rounded-[3px] px-3 py-2 text-sm font-bold text-brand-600 hover:bg-brand-50 disabled:opacity-50"
              >
                {applying ? "…" : "APPLY"}
              </button>
            </div>
            {couponMsg && (
              <p className={`mt-1.5 text-xs font-semibold ${discount > 0 ? "text-green-600" : "text-red-500"}`}>{couponMsg}</p>
            )}

            {error && (
              <div className="mt-4 rounded-[3px] border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-medium text-red-700">{error}</p>
                <p className="mt-1 text-xs text-ink-700/70">Please check your details and tap “Confirm order” to try again.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 h-14 w-full bg-brand-500 px-5 text-[13px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-brand-600 disabled:opacity-60"
            >
              {submitting
                ? (pesapalReady ? "Opening secure payment…" : "Placing order…")
                : (pesapalReady ? `PAY NOW · ${ugx(total)}` : "Confirm order")}
            </button>
            <p className="mt-3 text-center text-[11px] text-ink-700/50">
              By proceeding, you accept our{" "}
              <Link href="/terms" target="_blank" className="underline hover:text-brand-600">Terms &amp; Conditions</Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="underline hover:text-brand-600">Privacy Policy</Link>.
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}

function StepHeader({ n, title, done }: { n: number; title: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-3 border-b border-ink-600/10 px-5 py-4">
      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-brand-500 text-white" : "border border-ink-900 text-ink-900"}`}>
        {done ? "✓" : n}
      </span>
      <h2 className="text-[22px] leading-none text-ink-900">{title}</h2>
    </div>
  );
}

type PayOpt = { v: string; label: string; hint: string; icon?: string; recommended?: boolean };
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
    <label className={`flex cursor-pointer items-center gap-3 rounded-[3px] border p-3 transition ${active ? "border-brand-500 bg-brand-50" : "border-ink-600/15 hover:border-ink-600/30"}`}>
      <input
        type="radio"
        name="payment_method"
        value={opt.v}
        checked={active}
        onChange={() => setPayment(opt.v as OrderPayload["payment_method"])}
        className="accent-[#F15A29]"
      />
      <span className="flex-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-semibold text-ink-900">{opt.label}</span>
          {opt.recommended && (
            <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">
              Recommended
            </span>
          )}
        </span>
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
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink-700">
        {label} {required && <span className="text-brand-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-[3px] border border-ink-600/20 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
    </div>
  );
}

