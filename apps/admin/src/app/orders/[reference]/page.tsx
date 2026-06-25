import Link from "next/link";
import { apiGet, ugx, type AdminOrderDetail } from "@/lib/api";

export const dynamic = "force-dynamic";

const statusTone: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const order = await apiGet<AdminOrderDetail>(`/api/v1/orders/${reference}`);

  if (!order) {
    return (
      <div>
        <Link href="/orders" className="text-sm font-semibold text-brand-600 hover:underline">
          ← Back to orders
        </Link>
        <div className="mt-6 rounded-2xl border border-dashed border-ink-600/20 bg-white p-10 text-center text-ink-600/60">
          Order <span className="font-mono font-semibold">{reference}</span> was not found.
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/orders" className="text-sm font-semibold text-brand-600 hover:underline">
        ← Back to orders
      </Link>

      <header className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-extrabold text-ink-600">{order.reference}</h1>
          <p className="text-sm text-ink-600/60">
            {order.payment_method.replace(/_/g, " ")} · {order.payment_status}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            statusTone[order.status] ?? "bg-ink-50 text-ink-600"
          }`}
        >
          {order.status}
        </span>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Customer + delivery */}
        <div className="space-y-6 lg:col-span-1">
          <section className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-600/50">Customer</h2>
            <p className="mt-2 font-semibold text-ink-600">{order.customer_name}</p>
            <p className="text-sm text-ink-600/70">
              <a href={`tel:${order.phone}`} className="hover:text-brand-600">{order.phone}</a>
            </p>
            {order.email && (
              <p className="text-sm text-ink-600/70">
                <a href={`mailto:${order.email}`} className="hover:text-brand-600">{order.email}</a>
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-600/50">Delivery</h2>
            <p className="mt-2 font-semibold text-ink-600">{order.delivery_town}</p>
            <p className="text-sm text-ink-600/70">{order.delivery_address}</p>
            {order.notes && (
              <p className="mt-2 rounded-lg bg-ink-50 p-2 text-sm text-ink-600/70">📝 {order.notes}</p>
            )}
          </section>
        </div>

        {/* Items + totals */}
        <section className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-600/50">Items</h2>
          <table className="mt-3 w-full text-sm">
            <thead className="border-b border-ink-600/10 text-left text-xs uppercase tracking-wider text-ink-600/50">
              <tr>
                <th className="py-2">Product</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Unit</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.product_slug} className="border-b border-ink-600/5 last:border-0">
                  <td className="py-3 font-medium text-ink-600">{it.name}</td>
                  <td className="py-3 text-center text-ink-600/70">{it.quantity}</td>
                  <td className="py-3 text-right text-ink-600/70">{ugx(it.unit_price)}</td>
                  <td className="py-3 text-right font-semibold text-ink-600">{ugx(it.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <dl className="mt-4 space-y-1 border-t border-ink-600/10 pt-4 text-sm">
            <div className="flex justify-between text-ink-600/70">
              <dt>Subtotal</dt>
              <dd>{ugx(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-ink-600/70">
              <dt>Delivery</dt>
              <dd>{order.delivery_fee === 0 ? "Free" : ugx(order.delivery_fee)}</dd>
            </div>
            <div className="flex justify-between text-base font-extrabold text-ink-600">
              <dt>Total</dt>
              <dd>{ugx(order.total)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
