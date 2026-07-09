import Link from "next/link";
import { apiGet, apiGetAdmin, ugx, orderDate, type AdminOrder, type AdminProduct, type AdminLead } from "@/lib/api";

export const dynamic = "force-dynamic";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function getHealth() {
  try {
    const res = await fetch(`${API}/api/v1/health`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as { status: string; version: string };
  } catch {
    return null;
  }
}

const statusTone: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default async function DashboardPage() {
  const [health, orders, products, leads] = await Promise.all([
    getHealth(),
    apiGet<AdminOrder[]>("/api/v1/orders"),
    apiGet<AdminProduct[]>("/api/v1/products"),
    apiGetAdmin<AdminLead[]>("/api/v1/contact"),
  ]);

  const orderList = orders ?? [];
  const revenue = orderList.reduce((s, o) => s + o.total, 0);
  const pending = orderList.filter((o) => o.status === "pending").length;
  const delivered = orderList.filter((o) => o.status === "delivered").length;

  const cards = [
    { label: "Revenue (all orders)", value: ugx(revenue), hint: `${orderList.length} order(s)`, tone: "brand" as const },
    { label: "Orders", value: String(orderList.length), hint: `${pending} pending · ${delivered} delivered`, tone: "ink" as const },
    { label: "Products", value: String(products?.length ?? 0), hint: "Live catalog", tone: "ink" as const },
    { label: "New leads", value: String(leads?.length ?? 0), hint: "From contact form", tone: "brand" as const },
  ];

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-600">Dashboard</h1>
          <p className="text-sm text-ink-600/60">Welcome back to Online Tech Uganda admin.</p>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${health ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          <span className={`h-2 w-2 rounded-full ${health ? "bg-green-500" : "bg-red-500"}`} />
          API {health ? `online · v${health.version}` : "offline"}
        </span>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
            <p className="text-sm text-ink-600/60">{c.label}</p>
            <p className={`mt-2 break-words text-2xl font-extrabold leading-tight tabular-nums ${c.tone === "brand" ? "text-brand-600" : "text-ink-600"}`}>{c.value}</p>
            <p className="mt-1 text-xs text-ink-600/50">{c.hint}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-ink-600/10 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-ink-600/10 p-5">
          <h2 className="font-extrabold text-ink-600">Recent orders</h2>
          <Link href="/orders" className="text-sm font-semibold text-brand-600 hover:underline">View all →</Link>
        </div>
        {orderList.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-600/60">No orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-ink-600/10 bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-600/60">
              <tr>
                <th className="p-4">Reference</th>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {orderList.slice(0, 6).map((o) => (
                <tr key={o.id} className="border-b border-ink-600/5 last:border-0 hover:bg-ink-50/50">
                  <td className="p-4"><Link href={`/orders/${o.reference}`} className="font-mono font-semibold text-brand-600 hover:underline">{o.reference}</Link></td>
                  <td className="whitespace-nowrap p-4 text-xs text-ink-600/60">{orderDate(o.created_at)}</td>
                  <td className="p-4 font-semibold text-ink-600">{o.customer_name}</td>
                  <td className="p-4 text-right font-semibold text-ink-600">{ugx(o.total)}</td>
                  <td className="p-4 text-center"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusTone[o.status] ?? "bg-ink-50 text-ink-600"}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
