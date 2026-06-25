import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { products } from "@/lib/data";
import { ugx, whatsappLink } from "@/lib/site";
import { Badge, Stars, Button } from "@/components/ui";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { productImages } from "@/lib/product-images";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.id === slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: `${product.name} — ${product.specs.join(", ")}. ${ugx(product.price)} at Online Tech Uganda.`,
  };
}

function specRows(product: (typeof products)[number]): [string, string][] {
  const d = product.details!;
  return [
    ["Type", d.type],
    ["Brand", product.brand],
    ["Processor", d.processor],
    ["Generation", d.generation],
    ["RAM", d.ram],
    ["Storage", d.storage],
    ["Graphics card", d.graphics],
    ["Display", d.display],
    ["Operating system", d.os],
    ["Battery life", d.battery],
    ["Ports & connectivity", d.ports],
    ["Build quality", d.build],
    ["Condition", product.condition],
    ["Price", ugx(product.price)],
    ["Best for", d.purpose],
  ];
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((p) => p.id === slug);
  if (!product) notFound();

  const sameBrand = products.filter((p) => p.brand === product.brand && p.id !== product.id);
  const sameCat = products.filter(
    (p) => p.category === product.category && p.id !== product.id && p.brand !== product.brand,
  );
  const related = [...sameBrand, ...sameCat].slice(0, 4);
  const inStock = product.inStock !== false;
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  return (
    <div className="container-page py-10">
      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: "Shop", href: "/shop" },
            { label: product.category, href: `/shop?cat=${product.category}` },
            { label: product.name },
          ]}
        />
      </div>

      {/* Amazon-style 3 zones: gallery · details · buy box */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)_minmax(0,3fr)]">
        {/* Gallery */}
        <ProductGallery images={productImages[product.id] ?? [`/products/${product.id}.webp`]} alt={product.name}>
          <div className="absolute left-4 top-4 z-10 flex gap-2">
            {product.badge && <Badge>{product.badge}</Badge>}
            {discount > 0 && <Badge tone="ink">-{discount}%</Badge>}
          </div>
        </ProductGallery>

        {/* Center: details */}
        <div className="order-3 lg:order-2">
          <div className="flex items-center gap-2 text-sm text-ink-700/60">
            <Link href={`/shop?brand=${product.brand}`} className="font-semibold text-brand-600 hover:underline">
              {product.brand}
            </Link>
            <span>•</span><span>{product.condition}</span><span>•</span><span>{product.category}</span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-ink-600 sm:text-3xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Stars rating={product.rating} />
            <span className="text-sm text-ink-700/50">({product.rating.toFixed(1)})</span>
          </div>

          {product.details && (
            <div className="mt-5 rounded-card bg-brand-50 p-4">
              <p className="text-sm font-bold text-ink-600">Overview</p>
              <p className="mt-1 text-sm text-ink-700/80">
                {product.brand} {product.name} — a {product.details.type.toLowerCase()} powered by an{" "}
                {product.details.processor} ({product.details.generation}) with {product.details.ram} and{" "}
                {product.details.storage}. Runs {product.details.os} on a {product.details.display} display.{" "}
                {product.details.purpose}.
              </p>
            </div>
          )}

          <div className="mt-6 rounded-card border border-ink-600/10 bg-white p-5">
            <h2 className="text-sm font-bold text-ink-600">Full specifications</h2>
            {product.details ? (
              <dl className="mt-3 divide-y divide-ink-600/5">
                {specRows(product).map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[40%_60%] gap-3 py-2 text-sm">
                    <dt className="font-medium text-ink-700/60">{label}</dt>
                    <dd className="text-ink-700/90">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {product.specs.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-sm text-ink-700/80">
                    <span className="text-brand-500">✓</span> {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right: buy box */}
        <aside className="order-2 h-fit rounded-card border border-ink-600/10 bg-white p-5 shadow-sm lg:order-3 lg:sticky lg:top-28">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-ink-900">{ugx(product.price)}</span>
            {product.oldPrice && <span className="text-sm text-ink-700/40 line-through">{ugx(product.oldPrice)}</span>}
          </div>
          {discount > 0 && <p className="text-xs font-bold text-brand-600">You save {discount}%</p>}

          <p className={`mt-3 text-sm font-bold ${inStock ? "text-green-600" : "text-red-500"}`}>
            {inStock ? "● In stock" : "● Out of stock"}
          </p>
          <p className="mt-1 text-xs text-ink-700/60">
            Free delivery on orders above {ugx(3000000)}. Delivered countrywide.
          </p>

          <div className="mt-4 space-y-2">
            {inStock ? (
              <AddToCartButton
                className="w-full !py-3"
                item={{
                  slug: product.id,
                  name: product.name,
                  price: product.price,
                  category: product.category,
                  condition: product.condition,
                }}
              />
            ) : (
              <button disabled className="w-full cursor-not-allowed rounded-md bg-ink-100 py-3 font-bold text-ink-700/50">
                Out of stock
              </button>
            )}
            <Button
              href={whatsappLink(`Hi, I'm interested in the ${product.name} (${ugx(product.price)}).`)}
              external
              variant="outline"
              className="w-full justify-center"
            >
              💬 Ask on WhatsApp
            </Button>
          </div>

          <ul className="mt-4 space-y-2 border-t border-ink-600/10 pt-4 text-xs text-ink-700/70">
            <li className="flex items-center gap-2"><Check size={14} className="text-brand-500" /> Genuine & quality-checked</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-brand-500" /> MTN / Airtel MoMo, Cash on delivery</li>
            <li className="flex items-center gap-2"><Check size={14} className="text-brand-500" /> Real human support on WhatsApp</li>
          </ul>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-extrabold text-ink-600">
            {sameBrand.length > 0 ? `More from ${product.brand}` : "Related products"}
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
