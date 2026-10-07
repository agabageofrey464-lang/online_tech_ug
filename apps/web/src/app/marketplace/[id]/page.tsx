import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Store } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { VendorAddToCart } from "@/components/vendor-add-to-cart";
import { WhatsAppOrder } from "@/components/whatsapp-order";
import { DeliveryCheck } from "@/components/delivery-check";
import { ProductReviews } from "@/components/product-reviews";
import { getVendorItem } from "@/lib/vendor-items";
import { fallbackImage } from "@/lib/image-fallback";
import { vendorOrderMessage } from "@/lib/order-message";
import { share } from "@/lib/seo";
import { ugx } from "@/lib/site";

export const revalidate = 120;

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const item = await getVendorItem(Number(id));
  if (!item) return { title: "Product not found" };
  return share(
    {
      title: item.name,
      description: `${item.name} — ${ugx(item.price_ugx)}, sold by ${item.vendor_name} on Online Tech Uganda.${item.description ? " " + item.description : ""}`.slice(0, 300),
    },
    `/marketplace/${item.id}`,
    item.image_url || undefined,
  );
}

/**
 * A vendor's product, on a page of its own.
 *
 * A marketplace product was a card and nothing more: a name, a price and an
 * order button, with nowhere to put what the thing actually is. A vendor can
 * now give a brand, a condition, a description and a specification table, and
 * this is where a customer reads them — laid out like one of our own product
 * pages, with the seller named.
 */
export default async function VendorProductPage({ params }: Params) {
  const { id } = await params;
  const item = Number.isInteger(Number(id)) ? await getVendorItem(Number(id)) : null;
  if (!item) notFound();

  const oldPrice = item.old_price_ugx && item.old_price_ugx > item.price_ugx ? item.old_price_ugx : null;
  const specs = item.specs ?? [];
  const image = item.image_url || fallbackImage(item.name, item.category);

  return (
    <div className="container-page py-8">
      <div className="mb-5">
        <Breadcrumbs items={[{ label: "Marketplace", href: "/marketplace" }, { label: item.name }]} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)_minmax(0,4fr)]">
        {/* Photo */}
        <div className="relative aspect-square overflow-hidden rounded-card border border-ink-600/10 bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={item.name} className="h-full w-full object-contain p-4" />
          <span className="absolute left-3 top-3 rounded bg-ink-600/85 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
            Marketplace
          </span>
        </div>

        {/* Details */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-700/55">{item.category}</p>
          <h1 className="mt-1 text-xl font-bold text-ink-900 sm:text-2xl">{item.name}</h1>
          <p className="mt-1 text-sm text-ink-700/70">
            {item.brand && (
              <>
                Brand: <b className="text-ink-900">{item.brand}</b> ·{" "}
              </>
            )}
            Condition: <b className="text-ink-900">{item.condition || "Brand New"}</b>
          </p>

          <div className="mt-4 rounded-lg border border-ink-600/10 p-4">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-2xl font-extrabold text-ink-900">{ugx(item.price_ugx)}</span>
              {oldPrice && (
                <>
                  <span className="text-sm text-ink-700/45 line-through">{ugx(oldPrice)}</span>
                  <span className="rounded bg-[#00a651] px-1.5 py-0.5 text-xs font-extrabold text-white">
                    -{Math.max(1, Math.round((1 - item.price_ugx / oldPrice) * 100))}%
                  </span>
                </>
              )}
            </div>
            <p className={`mt-2 text-sm font-bold ${item.in_stock ? "text-green-700" : "text-red-500"}`}>
              {item.in_stock ? "In stock" : "Currently unavailable"}
            </p>
          </div>

          {item.in_stock && (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <div className="flex flex-1 [&>button]:mt-0 [&>button]:w-full [&>button]:rounded-lg [&>button]:py-3 [&>button]:text-sm">
                <VendorAddToCart id={item.id} name={item.name} price={item.price_ugx} category={item.category} vendorName={item.vendor_name} image={item.image_url || undefined} />
              </div>
              <WhatsAppOrder
                className="flex-1"
                label="Order on WhatsApp"
                phone={item.vendor_verified && item.vendor_phone ? item.vendor_phone : undefined}
                message={vendorOrderMessage({ name: item.name, priceLabel: ugx(item.price_ugx), vendor: item.vendor_name, category: item.category, url: item.image_url || undefined })}
              />
            </div>
          )}

          {item.description && (
            <div className="mt-6">
              <h2 className="text-sm font-bold text-ink-600">About this item</h2>
              <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink-700/85">{item.description}</p>
            </div>
          )}

          {specs.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-card border border-ink-600/10 bg-white shadow-sm">
              <h2 className="border-b border-ink-600/10 px-4 py-3 text-sm font-bold text-ink-600">Specifications</h2>
              <dl>
                {specs.map((s, i) => (
                  <div key={`${s.label}-${i}`} className={`grid grid-cols-[9rem_1fr] gap-3 px-4 py-2.5 text-sm sm:grid-cols-[12rem_1fr] ${i % 2 ? "bg-ink-50/50" : ""}`}>
                    <dt className="text-ink-700/60">{s.label}</dt>
                    <dd className="font-medium text-ink-900">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        {/* Seller and delivery */}
        <aside className="h-fit space-y-4">
          <div className="rounded-card border border-ink-600/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-wide text-ink-900">Sold by</p>
            <p className="mt-2 flex items-center gap-2 font-bold text-ink-900">
              <Store size={18} className="text-brand-600" /> {item.vendor_name}
            </p>
            {item.vendor_verified && (
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-green-700">
                <BadgeCheck size={14} /> Verified vendor
              </p>
            )}
            <p className="mt-2 text-xs leading-relaxed text-ink-700/65">
              This item is sold by an independent vendor through Online Tech Uganda. You order and pay through us.
            </p>
            <Link href="/marketplace" className="mt-3 inline-block text-sm font-bold text-brand-600 hover:underline">
              More from the marketplace →
            </Link>
          </div>
          <div className="overflow-hidden rounded-card border border-ink-600/10 bg-white text-sm shadow-sm">
            <p className="border-b border-ink-600/10 px-4 py-2.5 text-sm font-extrabold tracking-wide text-ink-900">DELIVERY</p>
            <div className="divide-y divide-ink-600/10">
              <DeliveryCheck />
            </div>
          </div>
        </aside>
      </div>

      {/* Reviews, from customers whose order contained this item. */}
      <ProductReviews slug={`vp-${item.id}`} productName={item.name} />
    </div>
  );
}
