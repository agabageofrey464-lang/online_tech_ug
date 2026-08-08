import Link from "next/link";
import { ProductForm } from "@/components/product-form";
import { emptyValues } from "@/lib/product-form-data";

export default function NewProductPage() {
  return (
    <div className="max-w-2xl">
      <Link href="/products" className="text-sm font-semibold text-brand-600 hover:underline">
        ← Back to products
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold text-ink-600">Add product</h1>
      <p className="text-sm text-ink-600/60">New products become orderable immediately.</p>
      <ProductForm mode="create" initial={emptyValues()} />
    </div>
  );
}
