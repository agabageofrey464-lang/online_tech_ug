import Link from "next/link";
import { apiGet, ugx, orderDate, type AdminOrder } from "@/lib/api";


const statusTone: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const riskTone: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-ink-100 text-ink-600/70",
};

const FILTERS = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = status && FILTERS.includes(status) ? status : "all";
  const all = (await apiGet<AdminOrder[]>("/api/v1/orders")) ?? [];
  const orders = active === "all" ? all : all.filter((o) => o.status === active);
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const countFor = (f: string) => (f === "all" ? all.length : all.filter((o) => o.status === f).length);
  const highRisk = all.filter((o) => o.risk_level === "high").length;

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold text-ink-600">Orders</h1>
        <p className="text-sm text-ink-600/60">
          {orders.length} order(s) · {ugx(revenue)} total value
        </p>
      </header>

      {highRisk > 0 && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="text-lg">⚠️</span>
          <span>
            <b>{highRisk}</b> order{highRisk > 1 ? "s" : ""} flagged high-risk — review the payment and delivery details before fulfilling.
          </span>
        </div>
      )}

      {/* Status filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/orders" : `/orders?status=${f}`}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold capitalize transition ${
              active === f ? "bg-brand-500 text-white" : "bg-white text-ink-600 shadow-sm hover:bg-brand-50"
            }`}
          >
            {f} <span className={active === f ? "text-white/80" : "text-ink-600/40"}>({countFor(f)})</span>
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-600/20 bg-white p-10 text-center text-ink-600/60">
          No orders yet. Orders placed on the storefront will appear here.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-600/10 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-600/10 bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-600/60">
              <tr>
                <th className="p-4">Reference</th>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Payment</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 text-center">Risk</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-ink-600/5 last:border-0 hover:bg-ink-50/50">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/orders/${o.reference}`}
                        className="font-mono font-semibold text-brand-600 underline-offset-2 hover:underline"
                      >
                        {o.reference}
                      </Link>
                      {o.status === "pending" && (
                        <span className="animate-pulse rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                          New
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap p-4 text-xs text-ink-600/60">{orderDate(o.created_at)}</td>
                  <td className="p-4 font-semibold text-ink-600">{o.customer_name}</td>
                  <td className="p-4 text-ink-600/70">{o.phone}</td>
                  <td className="p-4 text-ink-600/70">
                    {o.payment_method.replace(/_/g, " ")}
                    <span className="ml-1 text-xs text-ink-600/40">({o.payment_status})</span>
                  </td>
                  <td className="p-4 text-right font-semibold text-ink-600">{ugx(o.total)}</td>
                  <td className="p-4 text-center">
                    {o.risk_level && o.risk_level !== "none" ? (
                      <span
                        title={o.risk_reasons?.join(" · ")}
                        className={`cursor-help rounded-full px-2 py-0.5 text-xs font-bold capitalize ${riskTone[o.risk_level] ?? ""}`}
                      >
                        {o.risk_level}
                      </span>
                    ) : (
                      <span className="text-xs text-ink-600/30">—</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusTone[o.status] ?? "bg-ink-50 text-ink-600"}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
