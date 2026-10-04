import Link from "next/link";
import { apiGet, apiGetAdmin, ugx, orderDate, type AdminOrder, type AdminProduct, type AdminLead } from "@/lib/api";


const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function getHealth() {
  try {
    const res = await fetch(`${API}/api/v1/health`, { next: { revalidate: 12 } });
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

type Commissions = { total_commission: number; outstanding: number; vendors: unknown[] };

// Areas worth acting on — shown on the dashboard only when their count > 0.
const ATTENTION: { key: string; label: string; href: string; icon: string }[] = [
  { key: "orders", label: "New orders", href: "/orders", icon: "📦" },
  { key: "payments", label: "Payments to confirm", href: "/payments", icon: "💵" },
  { key: "vendors", label: "Vendors", href: "/vendors", icon: "🏪" },
  { key: "enrollments", label: "Course enrollments", href: "/enrollments", icon: "🎟️" },
  { key: "applications", label: "Job applications", href: "/applications", icon: "📄" },
  { key: "referrals", label: "Referrals", href: "/referrals", icon: "🎁" },
  { key: "freelancers", label: "Freelancers", href: "/freelancers", icon: "🧑‍💻" },
  { key: "leads", label: "New leads", href: "/leads", icon: "💬" },
];

export default async function DashboardPage() {
  const [health, orders, products, leads, commissions, counts] = await Promise.all([
    getHealth(),
    apiGetAdmin<AdminOrder[]>("/api/v1/orders"),
    apiGet<AdminProduct[]>("/api/v1/products"),
    apiGetAdmin<AdminLead[]>("/api/v1/contact"),
    apiGetAdmin<Commissions>("/api/v1/vendor/admin/commissions"),
    apiGetAdmin<Record<string, number>>("/api/v1/stats/counts"),
  ]);

  const attentionItems = ATTENTION.map((a) => ({ ...a, n: counts?.[a.key] ?? 0 })).filter((a) => a.n > 0);

  const orderList = orders ?? [];
  // Revenue = money actually received (payment confirmed), not just orders placed.
  const paidRevenue = orderList.filter((o) => o.payment_status === "paid").reduce((s, o) => s + o.total, 0);
  const pendingRevenue = orderList
    .filter((o) => o.payment_status !== "paid" && o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);
  const pending = orderList.filter((o) => o.status === "pending").length;
  const delivered = orderList.filter((o) => o.status === "delivered").length;

  const cards = [
    { label: "Revenue received", value: ugx(paidRevenue), hint: "Paid & confirmed orders", tone: "brand" as const },
    { label: "Pending (awaiting payment)", value: ugx(pendingRevenue), hint: "Not yet collected", tone: "ink" as const },
    { label: "Orders", value: String(orderList.length), hint: `${pending} pending · ${delivered} delivered`, tone: "ink" as const },
    { label: "Products", value: String(products?.length ?? 0), hint: "Live catalog", tone: "ink" as const },
    { label: "New leads", value: String(leads?.length ?? 0), hint: "From contact form", tone: "brand" as const },
    { label: "Marketplace commission", value: ugx(commissions?.total_commission ?? 0), hint: `${commissions?.vendors?.length ?? 0} vendor(s) selling`, tone: "brand" as const },
    { label: "Owed to vendors", value: ugx(commissions?.outstanding ?? 0), hint: "Outstanding payouts", tone: "ink" as const },
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="min-w-0 rounded-2xl border border-ink-600/10 bg-white p-4 shadow-sm">
            <p className="text-xs text-ink-600/60">{c.label}</p>
            <p className={`mt-1.5 break-words text-lg font-extrabold leading-tight tabular-nums ${c.tone === "brand" ? "text-brand-600" : "text-ink-600"}`}>{c.value}</p>
            <p className="mt-1 text-xs text-ink-600/50">{c.hint}</p>
          </div>
        ))}
      </div>

      {/* Needs your attention — only areas with active items (count > 0) */}
      {attentionItems.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 font-extrabold text-ink-600">
            🔔 Needs your attention
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {attentionItems.map((a) => (
              <Link
                key={a.key}
                href={a.href}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 shadow-sm transition hover:border-brand-400 hover:shadow-md"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-xl">{a.icon}</span>
                  <span className="text-sm font-bold text-ink-600">{a.label}</span>
                </span>
                <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-brand-500 px-2 text-sm font-extrabold tabular-nums text-white">
                  {a.n}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

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
