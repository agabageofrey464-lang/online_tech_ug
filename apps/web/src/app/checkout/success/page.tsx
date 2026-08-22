"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { getOrder, type Order } from "@/lib/api";
import { ugx } from "@/lib/site";
import { estimatedDeliveryDate, formatDeliveryDate } from "@/lib/delivery";

function SuccessInner() {
  const params = useSearchParams();
  const ref = params.get("ref") || params.get("OrderMerchantReference");
  const txId = params.get("transaction_id"); // present when returning from Flutterwave
  const trackingId = params.get("OrderTrackingId"); // present when returning from Pesapal
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [payStatus, setPayStatus] = useState<null | "checking" | "successful" | "failed">(null);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      return;
    }
    getOrder(ref)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [ref]);

  // Verify the online payment on return. The SERVER re-checks the transaction with
  // the provider (GetTransactionStatus / verify) — the redirect itself proves nothing.
  useEffect(() => {
    if (trackingId) {
      // Pesapal
      setPayStatus("checking");
      fetch(`/_api/payments/pesapal/status?order_tracking_id=${encodeURIComponent(trackingId)}&reference=${encodeURIComponent(ref || "")}`)
        .then((r) => r.json())
        .then((d) => {
          setPayStatus(d?.status === "completed" ? "successful" : "failed");
          if (ref) getOrder(ref).then(setOrder).catch(() => {});
        })
        .catch(() => setPayStatus("failed"));
    } else if (txId) {
      // Flutterwave (legacy)
      setPayStatus("checking");
      fetch(`/_api/payments/online/verify?transaction_id=${encodeURIComponent(txId)}`)
        .then((r) => r.json())
        .then((d) => {
          setPayStatus(d?.status === "successful" ? "successful" : "failed");
          if (ref) getOrder(ref).then(setOrder).catch(() => {});
        })
        .catch(() => setPayStatus("failed"));
    }
  }, [txId, trackingId, ref]);

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-xl text-center">
        <span className="text-6xl">🎉</span>
        <h1 className="mt-4 text-3xl font-extrabold text-ink-600">Order placed!</h1>
        {ref && (
          <p className="mt-2 text-ink-700/70">
            Your order reference is <b className="text-brand-600">{ref}</b>.
          </p>
        )}
      </div>

      {/* Online payment result (when returning from Flutterwave) */}
      {payStatus && (
        <div
          className={`mx-auto mt-5 max-w-xl rounded-card border p-4 text-center text-sm font-bold ${
            payStatus === "successful"
              ? "border-green-300 bg-green-50 text-green-700"
              : payStatus === "failed"
                ? "border-amber-300 bg-amber-50 text-amber-700"
                : "border-ink-600/15 bg-ink-50 text-ink-700"
          }`}
        >
          {payStatus === "checking" && "⏳ Confirming your payment…"}
          {payStatus === "successful" && "✅ Payment received — thank you! Your order is paid."}
          {payStatus === "failed" && "⚠️ Payment wasn't completed. No problem — you can pay on delivery, or contact us to try again."}
        </div>
      )}

      {/* Jumia-style confirmation — order is recorded, pay on delivery. No WhatsApp step. */}
      <div className="mx-auto mt-6 max-w-xl rounded-card border border-green-200 bg-green-50 p-5 text-center">
        <p className="text-base font-extrabold text-ink-900">✅ Your order is confirmed</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-700/75">
          We&apos;ve received your order and it&apos;s being processed. You&apos;ll get a call to arrange
          delivery, and you <b>pay on delivery</b> — nothing to pay now.
        </p>
        <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            href={ref ? `/track?ref=${ref}` : "/track"}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600"
          >
            📦 Track your order
          </Link>
          <Link
            href="/account#orders"
            className="rounded-lg border border-ink-600/20 bg-white px-5 py-2.5 text-sm font-bold text-ink-800 transition hover:bg-ink-50"
          >
            View my orders
          </Link>
        </div>
      </div>

      {loading && <p className="mt-8 text-center text-ink-700/60">Loading your order…</p>}

      {order && (
        <div className="mx-auto mt-8 max-w-xl rounded-card border border-ink-600/10 bg-white p-6 text-left shadow-sm">
          <h2 className="text-sm font-bold text-ink-600">Order summary</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {order.items.map((i) => (
              <li key={i.product_slug} className="flex justify-between">
                <span className="text-ink-700/80">
                  {i.name} <span className="text-ink-700/50">× {i.quantity}</span>
                </span>
                <span className="font-semibold text-ink-600">{ugx(i.line_total)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1.5 border-t border-ink-600/10 pt-4 text-sm">
            <Row label="Subtotal" value={ugx(order.subtotal)} />
            <Row label="Delivery" value={order.delivery_fee === 0 ? "Free" : ugx(order.delivery_fee)} />
            <div className="flex justify-between pt-1 text-base font-extrabold text-ink-600">
              <span>Total</span>
              <span>{ugx(order.total)}</span>
            </div>
          </div>
          {order.delivery_town && (
            <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-sm font-bold text-green-700">
              📅 Estimated delivery to {order.delivery_town}: {formatDeliveryDate(estimatedDeliveryDate(order.delivery_town))}
            </p>
          )}
          <p className="mt-3 text-xs text-ink-700/60">
            Payment: {order.payment_method.replace(/_/g, " ")} · Status: {order.status}
          </p>
        </div>
      )}

      {!loading && !order && ref && (
        <p className="mx-auto mt-8 max-w-xl text-center text-sm text-ink-700/60">
          We&apos;ve recorded your order ({ref}). If details don&apos;t appear, our team still has it —
          we&apos;ll be in touch.
        </p>
      )}

      <div className="mt-10 text-center">
        <Link href="/shop" className="inline-flex rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600">
          Continue shopping
        </Link>
      </div>
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

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container-page py-16 text-center text-ink-700/60">Loading…</div>}>
      <SuccessInner />
    </Suspense>
  );
}
