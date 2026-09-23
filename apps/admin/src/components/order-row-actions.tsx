"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReplyButton, type Template } from "@/components/reply-button";
import { orderMessage } from "@/lib/auto-message";

/**
 * Move an order on without leaving the list.
 *
 * Reviewing orders one at a time through the detail page is slow when a dozen
 * come in, so each row carries the single next step. Changing the status
 * emails the customer — that part happens on the server, so it can't be
 * forgotten — telling them where their order is and giving them our numbers
 * to call and confirm.
 */

const NEXT: Record<string, { to: string; label: string; hint: string }> = {
  pending: { to: "confirmed", label: "Confirm", hint: "Confirm this order and tell the customer" },
  confirmed: { to: "processing", label: "Preparing", hint: "Mark as being prepared" },
  processing: { to: "shipped", label: "Ready / Out", hint: "Ready and on its way" },
  shipped: { to: "delivered", label: "Delivered", hint: "Delivered to the customer" },
};

const ORDER_TEMPLATES: Template[] = [
  {
    label: "Order received",
    subject: "We've received your order — Online Tech Uganda",
    body: () =>
      `Thank you for your order. We've received it and it's being prepared now.\n\nPlease call us on the numbers below to confirm your delivery details, and we'll get it to you.`,
  },
  {
    label: "Ready for delivery",
    subject: "Your order is ready — Online Tech Uganda",
    body: () =>
      `Your order is ready.\n\nCall us to agree a delivery time that suits you, or come and collect it from our shop in Kampala.`,
  },
  {
    label: "Confirm your details",
    subject: "Confirming your order — Online Tech Uganda",
    body: () =>
      `Before we send your order out, could you confirm your delivery address and the best time to reach you?\n\nCall us on the numbers below and we'll finish it off.`,
  },
  {
    label: "Payment not received",
    subject: "About payment for your order",
    body: () =>
      `We're holding your order, but we haven't seen your payment come through yet.\n\nIf you've already paid, call us with the transaction details and we'll check straight away. Otherwise you're welcome to pay on delivery.`,
  },
];

export function OrderRowActions({
  reference,
  status,
  paymentStatus,
  customerName,
  phone,
  email = "",
  total,
  itemsSummary = "",
}: {
  reference: string;
  status: string;
  paymentStatus: string;
  customerName: string;
  phone: string;
  email?: string;
  total: number;
  itemsSummary?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");

  const step = NEXT[status];

  async function advance() {
    if (!step) return;
    setBusy(true);
    setDone("");
    try {
      const res = await fetch(`/api/orders/${reference}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: step.to }),
      });
      if (res.ok) {
        setDone("✓");
        router.refresh();
      } else {
        setDone("failed");
      }
    } catch {
      setDone("failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {step && (
        <button
          onClick={advance}
          disabled={busy}
          title={`${step.hint} — the customer is emailed automatically`}
          className="whitespace-nowrap rounded-md bg-green-600 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
        >
          {busy ? "…" : done === "✓" ? "✓ Done" : step.label}
        </button>
      )}
      {/* The update is written from the order itself — what they bought,
          the total and where it has got to — so it is one tap to send. */}
      <ReplyButton
        name={customerName}
        email={email}
        phone={phone}
        templates={ORDER_TEMPLATES}
        label="Edit"
        context={`Order ${reference}`}
        auto={orderMessage({
          reference,
          customer_name: customerName,
          status,
          payment_status: paymentStatus,
          total,
          items_summary: itemsSummary,
        })}
      />
    </div>
  );
}
