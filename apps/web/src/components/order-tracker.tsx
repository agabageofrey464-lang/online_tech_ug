"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, CheckCircle2, Circle, PackageCheck, XCircle } from "lucide-react";
import { getOrder, type Order } from "@/lib/api";
import { ugx, site, whatsappLink } from "@/lib/site";

// Fulfilment stages in order (matches the backend's allowed statuses).
const STEPS = [
  { key: "pending", label: "Order placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
] as const;

const PAY_LABEL: Record<string, string> = {
  paid: "Paid",
  unpaid: "Awaiting payment",
  pending: "Payment pending",
  refunded: "Refunded",
};

export function OrderTracker({ initialRef = "" }: { initialRef?: string }) {
  const [ref, setRef] = useState(initialRef);
  const [order, setOrder] = useState<Order | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "notfound">("idle");

  async function runSearch(code: string) {
    if (!code) return;
    setState("loading");
    setOrder(null);
    try {
      const o = await getOrder(code);
      setOrder(o);
      setState("idle");
    } catch {
      setState("notfound");
    }
  }

  function search(e: React.FormEvent) {
    e.preventDefault();
    void runSearch(ref.trim());
  }

  // Auto-load when arriving from checkout with ?ref=OTU-XXXX.
  useEffect(() => {
    if (initialRef) void runSearch(initialRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRef]);

  const cancelled = order?.status?.toLowerCase() === "cancelled";
  const activeIdx = order ? STEPS.findIndex((s) => s.key === order.status?.toLowerCase()) : -1;

  return (
    <div>
      <form onSubmit={search} className="flex flex-col gap-2 sm:flex-row">
        <input
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          placeholder="Enter your order number (e.g. OTU-AC4C98E1)"
          className="flex-1 rounded-md border border-ink-600/15 px-4 py-2.5 text-sm uppercase tracking-wide focus:border-brand-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {state === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Track order
        </button>
      </form>

      {state === "notfound" && (
        <div className="mt-6 rounded-card border border-dashed border-ink-600/20 bg-white p-8 text-center">
          <p className="font-semibold text-ink-700">No order found for that number.</p>
          <p className="mt-1 text-sm text-ink-700/60">
            Check the order number from your confirmation (it starts with <b>OTU-</b>). Still stuck? Call{" "}
            <a href={`tel:${site.phoneDisplay.replace(/\s/g, "")}`} className="font-semibold text-brand-600 hover:underline">
              {site.phoneDisplay}
            </a>
            .
          </p>
        </div>
      )}

      {order && (
        <div className="mt-6 rounded-card border border-ink-600/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-sm font-bold text-brand-600">{order.reference}</p>
              <h3 className="mt-0.5 text-lg font-extrabold text-ink-900">
                Hi {order.customer_name.split(" ")[0]}, here&apos;s your order
              </h3>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                cancelled ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`}
            >
              {cancelled ? "Cancelled" : STEPS[activeIdx]?.label ?? order.status}
            </span>
          </div>

          {/* Progress timeline */}
          {cancelled ? (
            <div className="mt-5 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <XCircle size={18} /> This order was cancelled. Contact us if this is unexpected.
            </div>
          ) : (
            <ol className="mt-5 space-y-0">
              {STEPS.map((s, i) => {
                const done = i <= activeIdx;
                const current = i === activeIdx;
                const last = i === STEPS.length - 1;
                return (
                  <li key={s.key} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      {done ? (
                        last ? (
                          <PackageCheck size={20} className="text-green-600" />
                        ) : (
                          <CheckCircle2 size={20} className="text-green-600" />
                        )
                      ) : (
                        <Circle size={20} className="text-ink-600/25" />
                      )}
                      {!last && <span className={`my-0.5 w-0.5 flex-1 ${i < activeIdx ? "bg-green-500" : "bg-ink-600/15"}`} />}
                    </div>
                    <div className={`pb-4 ${current ? "" : "opacity-90"}`}>
                      <p className={`text-sm font-bold ${done ? "text-ink-900" : "text-ink-700/50"}`}>{s.label}</p>
                      {current && <p className="text-xs text-brand-600">Current status</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {/* Items */}
          <div className="mt-3 divide-y divide-ink-600/10 border-t border-ink-600/10">
            {order.items.map((it) => (
              <div key={it.product_slug} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="min-w-0 flex-1 truncate text-ink-800">
                  {it.name} <span className="text-ink-700/50">× {it.quantity}</span>
                </span>
                <span className="shrink-0 font-semibold text-ink-900">{ugx(it.line_total)}</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-3 space-y-1 border-t border-ink-600/10 pt-3 text-sm">
            <Row label="Subtotal" value={ugx(order.subtotal)} />
            <Row label="Delivery" value={order.delivery_fee > 0 ? ugx(order.delivery_fee) : "Free"} />
            {order.discount ? <Row label="Discount" value={`− ${ugx(order.discount)}`} /> : null}
            <div className="flex justify-between pt-1 text-base font-extrabold text-ink-900">
              <span>Total</span>
              <span>{ugx(order.total)}</span>
            </div>
            <p className="pt-1 text-xs text-ink-700/60">
              {PAY_LABEL[order.payment_status?.toLowerCase()] ?? order.payment_status} ·{" "}
              {order.delivery_town ? `Delivering to ${order.delivery_town}` : "Delivery details on file"}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`tel:${site.phoneDisplay.replace(/\s/g, "")}`}
              className="rounded-md bg-brand-500 px-4 py-2 text-xs font-bold text-white hover:bg-brand-600"
            >
              Call about this order
            </a>
            <a
              href={whatsappLink(`Hello ${site.name}, I'd like an update on my order ${order.reference}.`)}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-green-600 px-4 py-2 text-xs font-bold text-green-700 hover:bg-green-50"
            >
              WhatsApp us
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-ink-700/80">
      <span>{label}</span>
      <span className="font-medium text-ink-900">{value}</span>
    </div>
  );
}
