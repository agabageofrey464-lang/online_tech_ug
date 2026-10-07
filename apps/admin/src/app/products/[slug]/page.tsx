import Link from "next/link";
import { notFound } from "next/navigation";
import { apiGet } from "@/lib/api";
import { ProductForm } from "@/components/product-form";
import { EMPTY_SPECS, type ProductFormValues } from "@/lib/product-form-data";

// Full product as returned by the API (includes specs + image the list omits).
type FullProduct = {
  slug: string;
  name: string;
  category: string;
  brand: string;
  condition: string;
  description: string;
  price_ugx: number;
  old_price_ugx: number | null;
  in_stock: boolean;
  image_url: string;
  specs: Partial<typeof EMPTY_SPECS> | null;
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await apiGet<FullProduct>(`/api/v1/products/${slug}`);
  if (!p) notFound();

  const initial: ProductFormValues = {
    name: p.name ?? "",
    category: p.category ?? "Accessories",
    brand: p.brand ?? "",
    condition: p.condition ?? "Brand New",
    price_ugx: p.price_ugx != null ? String(p.price_ugx) : "",
    old_price_ugx: p.old_price_ugx != null ? String(p.old_price_ugx) : "",
    description: p.description ?? "",
    in_stock: p.in_stock !== false,
    image_url: p.image_url ?? "",
    specs: { ...EMPTY_SPECS, ...(p.specs ?? {}) },
  };

  return (
    <div className="max-w-5xl">
      <Link href={`/products#p-${slug}`} className="text-sm font-semibold text-brand-600 hover:underline">
        ← Back to products
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold text-ink-600">Edit product</h1>
      <p className="text-sm text-ink-600/60">{p.name}</p>
      <ProductForm mode="edit" slug={slug} initial={initial} />
    </div>
  );
}
