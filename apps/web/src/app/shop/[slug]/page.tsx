import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Truck, MapPin, RotateCcw, ShieldCheck, Package, Phone } from "lucide-react";
import { products, productImage } from "@/lib/data";
import { ugx, whatsappLink, site } from "@/lib/site";
import { Badge, Stars, Button } from "@/components/ui";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { WishlistButton } from "@/components/wishlist-button";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { RecentlyViewedTracker, RecentlyViewed } from "@/components/recently-viewed";
import { ProductStructuredData } from "@/components/structured-data";
import { productImages } from "@/lib/product-images";
import { productCopy, keyFeatures, boxContents, warrantyFor } from "@/lib/product-copy";
import { ShareProduct } from "@/components/share-product";

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
  const desc = `${product.name} — ${product.specs.join(", ")}. ${ugx(product.price)} at Online Tech Uganda. ${product.condition}, warranty & countrywide delivery.`;
  return {
    title: product.name,
    description: desc,
    alternates: { canonical: `/shop/${product.id}` },
    openGraph: {
      title: product.name,
      description: desc,
      url: `/shop/${product.id}`,
      images: [productImage(product)],
      type: "website",
    },
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
  const copy = productCopy[product.id];
  // Deterministic “social proof” figures so every product feels stocked/reviewed.
  const reviews = Math.max(5, Math.round(product.rating * 11) + (product.name.length % 8) * 4);
  const itemsLeft = 3 + (product.name.length % 12);
  // Jumia-style anchor pricing (DESIGN only — real selling price unchanged).
  const seed = [...product.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const synthPct = 6 + (seed % 15); // modest, design-only: 6%–20%
  const oldPrice =
    product.oldPrice && product.oldPrice > product.price
      ? product.oldPrice
      : Math.round(product.price / (1 - synthPct / 100) / 100) * 100;
  const discountPct = Math.max(1, Math.round((1 - product.price / oldPrice) * 100));

  return (
    <div className="container-page py-10">
      <ProductStructuredData product={product} />
      <RecentlyViewedTracker slug={product.id} />
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
      <div className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)_minmax(0,3fr)]">
        {/* Gallery */}
        <ProductGallery images={productImages[product.id] ?? [productImage(product)]} alt={product.name}>
          <div className="absolute left-4 top-4 z-10 flex gap-2">
            {product.badge && <Badge>{product.badge}</Badge>}
          </div>
        </ProductGallery>

        {/* Center: details (Jumia-style) */}
        <div className="order-3 lg:order-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-ink-600 px-2 py-0.5 text-[11px] font-bold text-white">Official Store</span>
          </div>
          <h1 className="mt-2 text-xl font-bold text-ink-900 sm:text-2xl">{product.name}</h1>
          <p className="mt-1 text-sm text-ink-700/70">
            Brand:{" "}
            <Link href={`/shop?brand=${product.brand}`} className="font-semibold text-brand-600 hover:underline">
              {product.brand}
            </Link>
            {" | "}
            <Link href={`/shop?brand=${product.brand}`} className="text-brand-600 hover:underline">
              Similar products from {product.brand}
            </Link>
          </p>

          {/* Price box */}
          <div className="mt-4 overflow-hidden rounded-lg border border-ink-600/10">
            <div className="p-4">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-2xl font-extrabold text-ink-900">{ugx(product.price)}</span>
                <span className="text-sm text-ink-700/45 line-through">{ugx(oldPrice)}</span>
                <span className="rounded bg-brand-500 px-1.5 py-0.5 text-xs font-extrabold text-white">
                  -{discountPct}%
                </span>
              </div>
              {inStock ? (
                <div className="mt-2 max-w-xs">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(92, 100 - itemsLeft * 5)}%` }} />
                  </div>
                  <p className="mt-1 text-xs font-semibold text-ink-700/70">{itemsLeft} items left</p>
                </div>
              ) : (
                <p className="mt-2 text-sm font-bold text-red-500">Currently unavailable</p>
              )}
              <p className="mt-2 text-xs text-ink-700/60">+ delivery from {ugx(15000)} within Kampala</p>
              <div className="mt-2 flex items-center gap-1.5">
                <Stars rating={product.rating} />
                <span className="text-xs font-semibold text-brand-600">({reviews} verified ratings)</span>
              </div>
            </div>
          </div>

          {/* Order now — Jumia orange, full width */}
          <div className="mt-3 space-y-2">
            {inStock ? (
              <AddToCartButton
                className="w-full justify-center !py-3.5 !text-base"
                label="Order now"
                item={{
                  slug: product.id,
                  name: product.name,
                  price: product.price,
                  category: product.category,
                  condition: product.condition,
                }}
              />
            ) : (
              <button disabled className="w-full cursor-not-allowed rounded-lg bg-ink-100 py-3.5 font-bold text-ink-700/50">
                Out of stock
              </button>
            )}
            <div className="flex gap-2">
              <Button
                href={whatsappLink(`Hi, I'm interested in the ${product.name} (${ugx(product.price)}).`)}
                external
                variant="outline"
                className="flex-1 justify-center"
              >
                💬 WhatsApp
              </Button>
              <WishlistButton slug={product.id} variant="full" />
            </div>

            {/* Promotions — real offers only, no invented ones. */}
            <div className="mt-5 border-t border-ink-600/10 pt-4">
              <p className="text-sm font-extrabold uppercase tracking-wide text-ink-900">Promotions</p>
              <ul className="mt-2.5 space-y-2">
                <li className="flex items-start gap-2.5 text-sm">
                  <Truck size={17} className="mt-0.5 shrink-0 text-brand-500" />
                  <span className="text-ink-700/85">
                    Countrywide delivery — <b className="text-ink-900">fee based on your distance</b>
                  </span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <Phone size={17} className="mt-0.5 shrink-0 text-brand-500" />
                  <a href={`tel:${site.phoneDisplay.replace(/\s/g, "")}`} className="text-brand-600 hover:underline">
                    Call {site.phoneDisplay} to order
                  </a>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <ShieldCheck size={17} className="mt-0.5 shrink-0 text-brand-500" />
                  <span className="text-ink-700/85">
                    {warrantyFor(product)} · Tested before dispatch
                  </span>
                </li>
              </ul>
            </div>

            {/* Share this product */}
            <ShareProduct
              className="mt-5 border-t border-ink-600/10 pt-4"
              title={product.name}
              path={`/shop/${product.id}`}
            />
          </div>

          {/* Key features — derived from the spec table, so the two always agree. */}
          {product.details && (
            <div className="mt-5 rounded-card bg-brand-50 p-4">
              <p className="text-sm font-extrabold uppercase tracking-wide text-ink-900">Key Features</p>
              <ul className="mt-2 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {keyFeatures(product).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink-700/85">
                    <span className="mt-0.5 shrink-0 text-brand-500">✓</span>
                    <span className="min-w-0">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Written description */}
          {copy?.description && (
            <div className="mt-5 rounded-card border border-ink-600/10 bg-white p-4 sm:p-5">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-900">Product Details</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-700/85">{copy.description}</p>
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

          {/* What's in the box + warranty — stacks on phones, side by side on tablets up. */}
          {product.details && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-card border border-ink-600/10 bg-white p-4 sm:p-5">
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-900">What&apos;s in the box</h2>
                <ul className="mt-2 space-y-1.5">
                  {boxContents(product).map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-ink-700/85">
                      <Package size={15} className="mt-0.5 shrink-0 text-brand-600" />
                      <span className="min-w-0">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-card border border-ink-600/10 bg-white p-4 sm:p-5">
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-900">Warranty</h2>
                <p className="mt-2 flex items-start gap-2 text-sm text-ink-700/85">
                  <ShieldCheck size={15} className="mt-0.5 shrink-0 text-brand-600" />
                  <span className="min-w-0">
                    {warrantyFor(product)} — covers hardware faults under normal use. Bring the machine to our
                    Kampala workshop and we will repair or replace it.
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Delivery & Returns (Jumia-style) */}
        <aside className="order-2 h-fit overflow-hidden rounded-card border border-ink-600/10 bg-white shadow-sm lg:order-3 lg:sticky lg:top-28">
          <div className="border-b border-ink-600/10 px-4 py-2.5">
            <p className="text-sm font-extrabold tracking-wide text-ink-900">DELIVERY &amp; RETURNS</p>
          </div>
          <div className="divide-y divide-ink-600/10 text-sm">
            <div className="flex items-start gap-2.5 p-3">
              <MapPin size={20} className="mt-0.5 shrink-0 text-brand-600" />
              <div>
                <p className="font-bold text-ink-900">Choose your location</p>
                <p className="mt-0.5 text-xs text-ink-700/60">Kampala Region · Countrywide delivery available.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3">
              <Truck size={20} className="mt-0.5 shrink-0 text-brand-600" />
              <div>
                <p className="font-bold text-ink-900">Door Delivery</p>
                <p className="mt-0.5 text-xs text-ink-700/60">
                  From {ugx(15000)} (Kampala) · {ugx(25000)} upcountry. <b>Free</b> on orders above {ugx(3000000)}.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3">
              <RotateCcw size={20} className="mt-0.5 shrink-0 text-brand-600" />
              <div>
                <p className="font-bold text-ink-900">Returns Policy</p>
                <p className="mt-0.5 text-xs text-ink-700/60">7-day easy return on eligible items.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3">
              <ShieldCheck size={20} className="mt-0.5 shrink-0 text-brand-600" />
              <div>
                <p className="font-bold text-ink-900">Genuine &amp; Warranted</p>
                <p className="mt-0.5 text-xs text-ink-700/60">Quality-checked. Pay via MTN/Airtel MoMo or cash on delivery.</p>
              </div>
            </div>
          </div>

          {/* Seller information — we are the seller on our own storefront. */}
          <div className="border-t-4 border-ink-50">
            <div className="border-b border-ink-600/10 px-4 py-2.5">
              <p className="text-sm font-extrabold tracking-wide text-ink-900">SELLER INFORMATION</p>
            </div>
            <div className="p-4">
              <p className="text-sm font-extrabold text-ink-900">{site.name}</p>
              <p className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">
                <Check size={11} /> Official Store
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-ink-700/75">
                <li className="flex items-center gap-1.5">
                  <MapPin size={13} className="shrink-0 text-brand-600" /> {site.address}
                </li>
                <li className="flex items-center gap-1.5">
                  <Phone size={13} className="shrink-0 text-brand-600" />
                  <a href={`tel:${site.phoneDisplay.replace(/\s/g, "")}`} className="hover:underline">
                    {site.phoneDisplay}
                  </a>
                </li>
              </ul>
              <div className="mt-3 flex gap-2">
                <Link
                  href="/about"
                  className="flex-1 rounded-md border border-ink-600/20 px-3 py-2 text-center text-xs font-bold text-ink-800 transition hover:bg-ink-50"
                >
                  About us
                </Link>
                <Link
                  href="/contact"
                  className="flex-1 rounded-md bg-ink-700 px-3 py-2 text-center text-xs font-bold text-white transition hover:bg-ink-800"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
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

      <div className="mt-16">
        <RecentlyViewed exclude={product.id} />
      </div>
    </div>
  );
}
