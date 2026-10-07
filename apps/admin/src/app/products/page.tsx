import Link from "next/link";
import { apiGet, ugx, type AdminProduct } from "@/lib/api";
import { ProductPhoto } from "@/components/product-photo";
import { productThumb } from "@/lib/product-image";
import { ReturnToRow } from "@/components/return-to-row";


const CATEGORY_ORDER = ["Laptops", "Desktops", "Components", "Power", "Accessories", "Networking", "Storage"];

export default async function ProductsPage() {
  const products = (await apiGet<AdminProduct[]>("/api/v1/products?limit=500")) ?? [];

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
      <ReturnToRow />
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
            const inStock = items.filter((p) => p.in_stock);
            const out = items.filter((p) => !p.in_stock);
            return (
              <section key={cat}>
                <div className="mb-2 flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-ink-600">{cat}</h2>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                    {inStock.length} in stock
                  </span>
                  {out.length > 0 && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">{out.length} out</span>
                  )}
                </div>
                <div className="overflow-x-auto rounded-2xl border border-ink-600/10 bg-white shadow-sm">
                  <table className="w-full text-sm">
                    <Head />
                    <tbody>
                      {inStock.map((p) => (
                        <Row key={p.id} p={p} />
                      ))}
                      {inStock.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-4 text-sm text-ink-600/60">Nothing in stock in this category.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Out of stock, kept apart: these are the ones to restock or
                    remove, and mixed in with the rest they were easy to miss. */}
                {out.length > 0 && (
                  <div className="mt-3 overflow-x-auto rounded-2xl border border-red-200 bg-red-50/40">
                    <p className="border-b border-red-200 px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-red-700">
                      Out of stock in {cat} · {out.length}
                    </p>
                    <table className="w-full text-sm">
                      <tbody>
                        {out.map((p) => (
                          <Row key={p.id} p={p} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Head() {
  return (
    <thead className="border-b border-ink-600/10 bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-600/60">
      <tr>
        <th className="py-4 pl-4">Photo</th>
        <th className="p-4">Name</th>
        <th className="p-4">Brand</th>
        <th className="p-4">Condition</th>
        <th className="p-4 text-right">Price</th>
        <th className="p-4 text-center">Stock</th>
        <th className="p-4 text-right">Edit</th>
      </tr>
    </thead>
  );
}

function Row({ p }: { p: AdminProduct }) {
  return (
    <tr id={`p-${p.slug}`} className="scroll-mt-24 transition-colors duration-700 border-b border-ink-600/5 last:border-0 hover:bg-ink-50/50">
      <td className="py-2 pl-4">
        <Link href={`/products/${p.slug}`} aria-label={`Edit ${p.name}`}>
          <ProductPhoto
            src={productThumb(p.image_url, p.slug)}
            alt=""
            className="h-12 w-12 rounded-lg border border-ink-600/10"
            emptyLabel="—"
          />
        </Link>
      </td>
      <td className="p-4 font-semibold text-ink-600">
        <Link href={`/products/${p.slug}`} className="hover:text-brand-600 hover:underline">
          {p.name}
        </Link>
      </td>
      <td className="p-4 text-ink-600/70">{p.brand}</td>
      <td className="p-4 text-ink-600/70">{p.condition}</td>
      <td className="p-4 text-right font-semibold text-ink-600">{ugx(p.price_ugx)}</td>
      <td className="p-4 text-center">
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.in_stock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {p.in_stock ? "In stock" : "Out"}
        </span>
      </td>
      <td className="p-4 text-right">
        <Link href={`/products/${p.slug}`} className="rounded-md border border-ink-600/20 px-3 py-1 text-xs font-bold text-ink-600 hover:border-brand-500 hover:text-brand-600">
          Edit
        </Link>
      </td>
    </tr>
  );
}

function Empty() {
  return (
    <div className="rounded-2xl border border-dashed border-ink-600/20 bg-white p-10 text-center text-ink-600/60">
      No products returned. Is the API running at <code>{process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}</code>?
    </div>
  );
}
