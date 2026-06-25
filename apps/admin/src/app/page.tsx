const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const cards = [
  { label: "Revenue (this month)", value: "UGX 0", hint: "Connect orders in Phase 2", tone: "brand" },
  { label: "Orders", value: "0", hint: "Pending order system", tone: "ink" },
  { label: "Products", value: "5", hint: "From seed catalog", tone: "ink" },
  { label: "New leads", value: "0", hint: "From contact form", tone: "brand" },
];

async function getHealth() {
  try {
    const res = await fetch(`${API}/api/v1/health`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as { status: string; version: string };
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const health = await getHealth();

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-600">Dashboard</h1>
          <p className="text-sm text-ink-600/60">Welcome back to Online Tech Uganda admin.</p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
            health ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${health ? "bg-green-500" : "bg-red-500"}`} />
          API {health ? `online · v${health.version}` : "offline"}
        </span>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-ink-600/10 bg-white p-6 shadow-sm">
            <p className="text-sm text-ink-600/60">{c.label}</p>
            <p
              className={`mt-2 text-3xl font-extrabold ${
                c.tone === "brand" ? "text-brand-600" : "text-ink-600"
              }`}
            >
              {c.value}
            </p>
            <p className="mt-1 text-xs text-ink-600/50">{c.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-ink-600/20 bg-white p-10 text-center">
        <p className="text-4xl">🚧</p>
        <h2 className="mt-3 text-lg font-bold text-ink-600">Admin modules coming in Phase 2+</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-600/60">
          Product management, orders, course authoring and lead inbox will be built on top of this
          shell. See <code>docs/CHECKLIST.md</code> for the plan.
        </p>
      </div>
    </div>
  );
}
