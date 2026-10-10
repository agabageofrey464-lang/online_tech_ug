import { productEnquiryMessage } from "@/lib/order-message";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExploreMore } from "@/components/explore-more";
import { notFound, redirect } from "next/navigation";
import { Check, Truck, MapPin, RotateCcw, ShieldCheck, Package, Phone } from "lucide-react";
import { products as seedProducts, productImage, type Product } from "@/lib/data";
import { getProduct, getProducts } from "@/lib/catalog";
import { ugx, whatsappLink, site } from "@/lib/site";
import { Badge, Stars, Button } from "@/components/ui";
import { ProductBuyBox, type Choice } from "@/components/product-buy-box";
import { WishlistButton } from "@/components/wishlist-button";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { RecentlyViewedTracker, RecentlyViewed } from "@/components/recently-viewed";
import { ProductStructuredData, BreadcrumbStructuredData } from "@/components/structured-data";
import { productImages } from "@/lib/product-images";
import { productCopy, keyFeatures, boxContents, warrantyFor } from "@/lib/product-copy";
import { ShareProduct } from "@/components/share-product";
import { ProductReviews } from "@/components/product-reviews";
import { shareImage } from "@/lib/seo";
import { DeliveryCheck } from "@/components/delivery-check";
import { StockAlert } from "@/components/stock-alert";
import { StickyOrderBar } from "@/components/sticky-order-bar";
import { API_URL } from "@/lib/api";

/** Approved reviews of one product: its average and how many. Null if none. */
async function reviewSummary(slug: string): Promise<{ average: number; count: number } | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/reviews/summary`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const all = (await res.json()) as Record<string, { average: number; count: number }>;
    return all[slug]?.count ? all[slug] : null;
  } catch {
    return null;
  }
}

// Pre-build the catalogue we ship with; anything added in the admin later is
// rendered on first request and then cached like the rest.
export function generateStaticParams() {
  return seedProducts.map((p) => ({ slug: p.id }));
}

export const dynamicParams = true;
export const revalidate = 300; // keep in step with CATALOG_REVALIDATE

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
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
      images: [{ url: shareImage(productImage(product)), width: 1200, height: 630, alt: product.name }],
      type: "website",
    },
    twitter: { card: "summary_large_image", title: product.name, description: desc, images: [shareImage(productImage(product))] },
  };
}

function specRows(product: Product): [string, string][] {
  const d = product.details ?? {};
  // Only rows with something in them — a router has no battery life, and an
  // empty row reads as a missing answer rather than a detail that does not
  // apply to this kind of product.
  return (
    [
      ["Type", d.type],
      ["Brand", product.brand],
      ["Capacity", d.capacity],
      ["Processor", d.processor],
      ["Generation", d.generation],
      ["RAM", d.ram],
      ["Storage", d.storage],
      ["Graphics card", d.graphics],
      ["Display", d.display],
      ["Interface", d.interface],
      ["Speed", d.speed],
      ["Operating system", d.os],
      ["Battery", d.battery],
      ["Ports & connectivity", d.ports],
      ["Works with", d.compatibility],
      ["Build quality", d.build],
      ["In the box", d.inBox],
      ["Condition", product.condition],
      ["Warranty", d.warranty],
      ["Price", ugx(product.price)],
      ["Best for", d.purpose],
    ] as [string, string | undefined][]
  ).filter((r): r is [string, string] => Boolean(r[1]));
}

/**
 * The model a product is a version of: its name without the bracketed part and
 * without the capacity. "HP EliteBook 840 G8 (16GB)" and "HP EliteBook 840 G8
 * (8GB)" are one model in two configurations.
 */
function modelOf(name: string): string {
  return name
    .replace(/\(.*?\)/g, " ")
    .replace(/\b\d+\s?(GB|TB)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** What sets one configuration apart: the bracketed part, or the capacity. */
function choiceLabel(p: Product): string {
  const inBrackets = p.name.match(/\((.*?)\)/)?.[1];
  const sizes = p.name.replace(/\(.*?\)/g, " ").match(/\b\d+\s?(GB|TB)\b/gi)?.join(" / ");
  return [sizes, inBrackets].filter(Boolean).join(" · ") || p.condition;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // A marketplace vendor's product, reached from a shop card.
  if (/^vp-\d+$/.test(slug)) redirect(`/marketplace/${slug.slice(3)}`);
  const product = await getProduct(slug);
  if (!product) notFound();

  const products = await getProducts();
  const sameBrand = products.filter((p) => p.brand === product.brand && p.id !== product.id);
  const sameCat = products.filter(
    (p) => p.category === product.category && p.id !== product.id && p.brand !== product.brand,
  );
  const related = [...sameBrand, ...sameCat].slice(0, 4);
  const inStock = product.inStock !== false;
  const copy = productCopy[product.id];
  // Only what is true of this product. The page used to print a review count,
  // an "items left" figure and a crossed-out price that were all arithmetic on
  // the product's name and id — "social proof" for products nobody had
  // reviewed, scarcity for stock nobody had counted. The old price shows when
  // there was one; reviews come from customers (see <ProductReviews />).
  const oldPrice = product.oldPrice && product.oldPrice > product.price ? product.oldPrice : null;
  const discountPct = oldPrice ? Math.max(1, Math.round((1 - product.price / oldPrice) * 100)) : 0;
  const ratings = await reviewSummary(product.id);

  // Other listings of the same model, offered as choices. Each is a product of
  // its own — its own price, stock and page.
  const model = modelOf(product.name);
  const choices: Choice[] = products
    .filter((p) => p.brand === product.brand && p.category === product.category && p.inStock !== false && modelOf(p.name) === model)
    .concat(inStock ? [] : [product])
    .sort((a, b) => a.price - b.price)
    .map((p) => ({ id: p.id, label: choiceLabel(p), price: p.price, current: p.id === product.id }));
  const item = { slug: product.id, name: product.name, price: product.price, category: product.category, condition: product.condition };

  return (
    <div className="container-page py-10">
      <ProductStructuredData product={product} rating={ratings} />
      <BreadcrumbStructuredData
        items={[
          { name: "Shop", href: "/shop" },
          { name: product.category, href: `/shop?cat=${product.category}` },
          { name: product.name, href: `/shop/${product.id}` },
        ]}
      />
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

      {/* Two zones: the photographs, and beside them everything needed to
          choose and buy. The long-form detail follows underneath. */}
      <div className="keeps-card-colours grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
        <div className="min-w-0">
          <ProductGallery images={productImages[product.id] ?? [productImage(product)]} alt={product.name}>
            <div className="absolute left-4 top-4 z-10 flex gap-2">
              {product.badge && <Badge>{product.badge}</Badge>}
            </div>
          </ProductGallery>
        </div>

        <div className="min-w-0 lg:sticky lg:top-44 lg:self-start">
          {product.condition === "Brand New" && (
            <span className="inline-block bg-ink-600 px-5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-white">
              Brand New
            </span>
          )}
          <h1 className="mt-4 text-[30px] leading-[1.15] text-ink-900 sm:text-[34px]">{product.name}</h1>
          <p className="mt-2 text-[13px] text-ink-700/70">
            Brand:{" "}
            <Link href={`/shop?brand=${product.brand}`} className="font-semibold text-brand-600 hover:underline">
              {product.brand}
            </Link>
            {" · "}
            <Link href={`/shop?brand=${product.brand}`} className="text-brand-600 hover:underline">
              Similar products from {product.brand}
            </Link>
            {" · "}Official Store
          </p>

          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[20px] text-ink-900">{ugx(product.price)}</span>
            {oldPrice && (
              <>
                <span className="text-sm text-ink-700/45 line-through">{ugx(oldPrice)}</span>
                <span className="text-sm font-bold text-brand-600">-{discountPct}%</span>
              </>
            )}
          </div>
          <p className={`mt-1.5 text-[13px] ${inStock ? "text-ink-700/70" : "font-semibold text-brand-700"}`}>
            {inStock ? "In stock" : "Currently unavailable"} · delivered the same day, transport by distance
          </p>
          <a href="#reviews" className="mt-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-ink-800 underline-offset-4 hover:underline">
            {ratings ? (
              <>
                <Stars rating={ratings.average} />
                {ratings.count} verified {ratings.count === 1 ? "review" : "reviews"}
              </>
            ) : (
              "No reviews yet — be the first"
            )}
          </a>

          {(copy?.description || product.details?.purpose) && (
            <p className="mt-5 font-display text-[19px] leading-[1.45] text-ink-900">
              {(copy?.description ?? product.details?.purpose ?? "").split(/(?<=\.)\s/)[0]}
            </p>
          )}

          <div id="order-now" className="mt-6 border-t border-ink-600/15 pt-6">
            {inStock ? (
              <ProductBuyBox item={item} colors={product.colors ?? []} choices={choices} />
            ) : (
              <div className="space-y-2">
                <button disabled className="h-14 w-full cursor-not-allowed bg-ink-100 text-[13px] font-bold uppercase tracking-[0.18em] text-ink-700/50">
                  Out of stock
                </button>
                <StockAlert productName={product.name} slug={product.id} />
              </div>
            )}
            <p className="mt-4 text-center font-display text-[17px] italic text-ink-800">
              Countrywide delivery — the fee depends on your distance
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                href={whatsappLink(productEnquiryMessage({ name: product.name, priceLabel: ugx(product.price), condition: product.condition, url: `${site.url}/shop/${product.id}` }))}
                external
                variant="outline"
                className="justify-center"
              >
                💬 WhatsApp
              </Button>
              <WishlistButton slug={product.id} variant="full" />
            </div>

            {/* Promotions — real offers only, no invented ones. */}
            <ul className="mt-6 space-y-2.5 border-t border-ink-600/15 pt-5">
              <li className="flex items-start gap-2.5 text-sm">
                <Truck size={17} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-700" />
                <span className="text-ink-700/85">
                  Countrywide delivery — <b className="text-ink-900">fee based on your distance</b>
                </span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <Phone size={17} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-700" />
                <a href={`tel:${site.phoneDisplay.replace(/\s/g, "")}`} className="text-brand-600 hover:underline">
                  Call {site.phoneDisplay} to order
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <ShieldCheck size={17} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-700" />
                <span className="text-ink-700/85">
                  {warrantyFor(product)} · Tested before dispatch
                </span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <RotateCcw size={17} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-700" />
                <span className="text-ink-700/85">7-day easy return on eligible items</span>
              </li>
            </ul>

            <ShareProduct
              className="mt-5 border-t border-ink-600/15 pt-4"
              title={product.name}
              path={`/shop/${product.id}`}
            />
          </div>
        </div>
      </div>

      {/* The long-form detail, with delivery and seller beside it. */}
      <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
        <div className="min-w-0 space-y-5">
          {/* Key features — derived from the spec table, so the two always agree. */}
          {product.details && (
            <div className="bg-[var(--tile)] p-5 sm:p-6">
              <h2 className="text-[22px] text-ink-900">Key Features</h2>
              <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {keyFeatures(product).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink-700/85">
                    <span className="mt-0.5 shrink-0 text-brand-500">✓</span>
                    <span className="min-w-0">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {copy?.description && (
            <div className="bg-white p-5 sm:p-6">
              <h2 className="text-[22px] text-ink-900">Product Details</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-700/85">{copy.description}</p>
            </div>
          )}

          <div className="bg-white p-5 sm:p-6">
            <h2 className="text-[22px] text-ink-900">Full specifications</h2>
            {product.details ? (
              <dl className="mt-3 divide-y divide-ink-600/10">
                {specRows(product).map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[40%_60%] gap-3 py-2.5 text-sm">
                    <dt className="text-ink-700/60">{label}</dt>
                    <dd className="text-ink-900">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {product.specs.map((sp) => (
                  <li key={sp} className="flex items-center gap-2 text-sm text-ink-700/80">
                    <span className="text-brand-500">✓</span> {sp}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* What's in the box + warranty — stacks on phones, side by side on tablets up. */}
          {product.details && (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="bg-white p-5 sm:p-6">
                <h2 className="text-[22px] text-ink-900">What&apos;s in the box</h2>
                <ul className="mt-2 space-y-1.5">
                  {boxContents(product).map((bx) => (
                    <li key={bx} className="flex items-start gap-2 text-sm text-ink-700/85">
                      <Package size={15} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-700" />
                      <span className="min-w-0">{bx}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-5 sm:p-6">
                <h2 className="text-[22px] text-ink-900">Warranty</h2>
                <p className="mt-2 flex items-start gap-2 text-sm text-ink-700/85">
                  <ShieldCheck size={15} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-700" />
                  <span className="min-w-0">
                    {warrantyFor(product)} — covers hardware faults under normal use. Bring the machine to our
                    Kampala workshop and we will repair or replace it.
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        <aside className="h-fit bg-white">
          <h2 className="border-b border-ink-600/10 px-5 py-4 text-[22px] text-ink-900">Delivery &amp; Returns</h2>
          <div className="divide-y divide-ink-600/10 text-sm">
            <DeliveryCheck />
            <div className="flex items-start gap-2.5 p-4">
              <RotateCcw size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-700" />
              <div>
                <p className="font-semibold text-ink-900">Returns Policy</p>
                <p className="mt-0.5 text-xs text-ink-700/60">7-day easy return on eligible items.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-4">
              <ShieldCheck size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-700" />
              <div>
                <p className="font-semibold text-ink-900">Genuine &amp; Warranted</p>
                <p className="mt-0.5 text-xs text-ink-700/60">Quality-checked. Pay via MTN/Airtel MoMo, or at our shop.</p>
              </div>
            </div>
          </div>

          {/* Seller information — we are the seller on our own storefront. */}
          <h2 className="border-y border-ink-600/10 px-5 py-4 text-[22px] text-ink-900">Seller Information</h2>
          <div className="p-5">
            <p className="text-sm font-semibold text-ink-900">{site.name}</p>
            <p className="mt-1 inline-flex items-center gap-1 bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">
              <Check size={11} /> Official Store
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-ink-700/75">
              <li className="flex items-center gap-1.5">
                <MapPin size={13} className="shrink-0 text-ink-700" /> {site.address}
              </li>
              <li className="flex items-center gap-1.5">
                <Phone size={13} className="shrink-0 text-ink-700" />
                <a href={`tel:${site.phoneDisplay.replace(/\s/g, "")}`} className="hover:underline">
                  {site.phoneDisplay}
                </a>
              </li>
            </ul>
            <div className="mt-4 flex gap-2">
              <Link href="/about" className="flex-1 border border-ink-700/25 px-3 py-2.5 text-center text-xs font-bold uppercase tracking-[0.1em] text-ink-900 transition hover:border-ink-900">
                About us
              </Link>
              <Link href="/contact" className="flex-1 bg-ink-600 px-3 py-2.5 text-center text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-ink-700">
                Contact
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <ProductReviews slug={product.id} productName={product.name} />

      {inStock && (
        <StickyOrderBar
          anchorId="order-now"
          item={item}
        />
      )}

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-[28px] text-ink-900">
            {sameBrand.length > 0 ? `More from ${product.brand}` : "Related products"}
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-16">
        <RecentlyViewed exclude={product.id} />
      </div>
      <ExploreMore exclude={["/shop"]} />

    </div>
  );
}
