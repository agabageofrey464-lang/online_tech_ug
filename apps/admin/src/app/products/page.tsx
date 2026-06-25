import Link from "next/link";
import { apiGet, ugx, type AdminProduct } from "@/lib/api";

export const dynamic = "force-dynamic";

const CATEGORY_ORDER = ["Laptops", "Desktops", "Components", "Power", "Accessories", "Networking", "Storage"];

export default async function ProductsPage() {
  const products = (await apiGet<AdminProduct[]>("/api/v1/products?limit=100")) ?? [];

  // Group products by category, in a sensible order (unknown categories last).
  const groups = new Map<string, AdminProduct[]>();
  for (const p of products) {
    const arr = groups.get(p.category) ?? [];
    arr.push(p);
    groups.set(p.category, arr);
  }
  const orderedCats = [
    ...CATEGORY_ORDER.filter((c) => groups.has(c)),
    ...[...groups.keys()].filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-600">Products</h1>
          <p className="text-sm text-ink-600/60">
            {products.length} item(s) across {orderedCats.length} categories.
          </p>
        </div>
        <Link href="/products/new" className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
          + Add product
        </Link>
      </header>

      {products.length === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-8">
          {orderedCats.map((cat) => {
            const items = groups.get(cat) ?? [];
            return (
              <section key={cat}>
                <div className="mb-2 flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-ink-600">{cat}</h2>
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
                    {items.length}
                  </span>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-ink-600/10 bg-white shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="border-b border-ink-600/10 bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-600/60">
                      <tr>
                        <th className="p-4">Name</th>
                        <th className="p-4">Brand</th>
                        <th className="p-4">Condition</th>
                        <th className="p-4 text-right">Price</th>
                        <th className="p-4 text-center">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((p) => (
                        <tr key={p.id} className="border-b border-ink-600/5 last:border-0 hover:bg-ink-50/50">
                          <td className="p-4 font-semibold text-ink-600">{p.name}</td>
                          <td className="p-4 text-ink-600/70">{p.brand}</td>
                          <td className="p-4 text-ink-600/70">{p.condition}</td>
                          <td className="p-4 text-right font-semibold text-ink-600">{ugx(p.price_ugx)}</td>
                          <td className="p-4 text-center">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.in_stock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {p.in_stock ? "In stock" : "Out"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-2xl border border-dashed border-ink-600/20 bg-white p-10 text-center text-ink-600/60">
      No products returned. Is the API running at <code>{process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}</code>?
    </div>
  );
}
