import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Phone, RotateCcw, ShieldCheck, Store, Truck } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductGallery } from "@/components/product-gallery";
import { ProductBuyBox } from "@/components/product-buy-box";
import { WhatsAppOrder } from "@/components/whatsapp-order";
import { DeliveryCheck } from "@/components/delivery-check";
import { ProductReviews } from "@/components/product-reviews";
import { ProductCard } from "@/components/product-card";
import { asShopProducts, getVendorItem, getVendorItems, shelfFor } from "@/lib/vendor-items";
import { fallbackImage } from "@/lib/image-fallback";
import { vendorOrderMessage } from "@/lib/order-message";
import { share } from "@/lib/seo";
import { site, soldBy, ugx } from "@/lib/site";

export const revalidate = 30;

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const item = await getVendorItem(Number(id));
  if (!item) return { title: "Product not found" };
  return share(
    {
      title: item.name,
      description: `${item.name} — ${ugx(item.price_ugx)}, sold by Online Tech Uganda with our partner vendor ${item.vendor_name}.${item.description ? " " + item.description : ""}`.slice(0, 300),
    },
    `/marketplace/${item.id}`,
    item.image_url || undefined,
  );
}

/**
 * A vendor's product, laid out exactly as one of our own: the photograph in
 * large tiles, then the name, price, colours, quantity and the button, with
 * the description, specification, delivery and seller beneath.
 *
 * A marketplace product was once a card and nothing more. It has had a page of
 * its own since vendors could give a brand, condition and specification; this
 * gives that page the same parts, in the same places, as the rest of the shop.
 */
export default async function VendorProductPage({ params }: Params) {
  const { id } = await params;
  const item = Number.isInteger(Number(id)) ? await getVendorItem(Number(id)) : null;
  if (!item) notFound();

  const oldPrice = item.old_price_ugx && item.old_price_ugx > item.price_ugx ? item.old_price_ugx : null;
  const discountPct = oldPrice ? Math.max(1, Math.round((1 - item.price_ugx / oldPrice) * 100)) : 0;
  const specs = item.specs ?? [];
  const image = item.image_url || fallbackImage(item.name, item.category);
  const condition = item.condition || "Brand New";
  // Phones are ordered on the phones' line; the owner is told of each one.
  const isPhone = shelfFor(item) === "Phones";
  const orderLine = isPhone ? site.phoneOrders.display : site.phoneDisplay;
  // A "Colour" row in the vendor's specification becomes the colour choice.
  const colours = (specs.find((s) => /^colou?rs?$/i.test(s.label.trim()))?.value ?? "")
    .split(/[,/]/)
    .map((c) => c.trim())
    .filter(Boolean);
  const more = asShopProducts((await getVendorItems()).filter((v) => v.id !== item.id))
    .sort((a, b) => Number(b.seller === item.vendor_name) - Number(a.seller === item.vendor_name))
    .slice(0, 4);

  return (
    <div className="container-page py-8">
      {/* Read by the green chat button in the corner, so it too orders this phone on the phones' line. */}
      {isPhone && <span id="phone-order-context" hidden data-product={item.name} data-price={ugx(item.price_ugx)} data-url={`${site.url}/marketplace/${item.id}`} />}
      <div className="mb-6">
        <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: "Marketplace", href: "/marketplace" }, { label: item.name }]} />
      </div>

      <div className="keeps-card-colours grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
        <div className="min-w-0">
          <ProductGallery images={[image]} alt={item.name} />
        </div>

        <div className="min-w-0 lg:sticky lg:top-44 lg:self-start">
          <div className="flex flex-wrap gap-2">
            {condition === "Brand New" && (
              <span className="inline-block bg-ink-600 px-5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-white">Brand New</span>
            )}
            <span className="inline-block bg-[#dcd6cd] px-5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-900">Vendor</span>
          </div>
          <h1 className="mt-4 text-[30px] leading-[1.15] text-ink-900 sm:text-[34px]">{item.name}</h1>
          <p className="mt-2 text-[13px] text-ink-700/70">
            {item.brand && (
              <>
                Brand: <span className="font-semibold text-ink-900">{item.brand}</span>
                {" · "}
              </>
            )}
            Sold by <span className="font-semibold text-brand-600">{site.name}</span>
            {" · "}
            Partner vendor: <span className="font-semibold text-ink-900">{item.vendor_name}</span>
            {item.vendor_verified && (
              <span className="ml-1.5 inline-flex items-center gap-0.5 font-semibold text-ink-900">
                <BadgeCheck size={13} /> Verified
              </span>
            )}
          </p>

          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[20px] text-ink-900">{ugx(item.price_ugx)}</span>
            {oldPrice && (
              <>
                <span className="text-sm text-ink-700/45 line-through">{ugx(oldPrice)}</span>
                <span className="text-sm font-bold text-brand-600">-{discountPct}%</span>
              </>
            )}
          </div>
          <p className={`mt-1.5 text-[13px] ${item.in_stock ? "text-ink-700/70" : "font-semibold text-brand-700"}`}>
            {item.in_stock ? "In stock" : "Currently unavailable"} · delivered the same day, transport by distance
          </p>
          <a href="#reviews" className="mt-3 inline-block text-[12px] font-bold uppercase tracking-[0.1em] text-ink-800 underline-offset-4 hover:underline">
            Reviews
          </a>

          {item.description && (
            <p className="mt-5 font-display text-[19px] leading-[1.45] text-ink-900">{item.description.split(/(?<=\.)\s/)[0]}</p>
          )}

          <div id="order-now" className="mt-6 border-t border-ink-600/15 pt-6">
            {item.in_stock ? (
              <ProductBuyBox
                item={{ slug: `vp-${item.id}`, name: item.name, price: item.price_ugx, category: item.category, condition: soldBy(item.vendor_name), image: item.image_url || undefined }}
                colors={colours}
                choices={[]}
              />
            ) : (
              <button disabled className="h-14 w-full cursor-not-allowed bg-ink-100 text-[13px] font-bold uppercase tracking-[0.18em] text-ink-700/50">
                Out of stock
              </button>
            )}
            <p className="mt-4 text-center font-display text-[17px] italic text-ink-800">You order and pay through Online Tech Uganda</p>
            <WhatsAppOrder
              className="mt-4"
              label="Order on WhatsApp"
              phone={isPhone ? site.phoneOrders.local : undefined}
              report={isPhone ? { product: item.name, price: ugx(item.price_ugx), url: `${site.url}/marketplace/${item.id}`, line: site.phoneOrders.display } : undefined}
              message={vendorOrderMessage({ name: item.name, priceLabel: ugx(item.price_ugx), vendor: item.vendor_name, category: item.category, url: `${site.url}/marketplace/${item.id}` })}
            />

            <ul className="mt-6 space-y-2.5 border-t border-ink-600/15 pt-5">
              <li className="flex items-start gap-2.5 text-sm">
                <Truck size={17} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-700" />
                <span className="text-ink-700/85">
                  Countrywide delivery — <b className="text-ink-900">fee worked out from your distance</b>
                </span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <Phone size={17} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-700" />
                <a href={`tel:${orderLine.replace(/\s/g, "")}`} className="text-brand-600 hover:underline">
                  Call {orderLine} to order
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <ShieldCheck size={17} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-700" />
                <span className="text-ink-700/85">Sold by {site.name} · supplied by an approved partner vendor</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <RotateCcw size={17} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-700" />
                <span className="text-ink-700/85">7-day easy return on eligible items</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* The long-form detail, with delivery and seller beside it. */}
      <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
        <div className="min-w-0 space-y-5">
          {item.description && (
            <div className="bg-white p-5 sm:p-6">
              <h2 className="text-[22px] text-ink-900">Product Details</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-700/85">{item.description}</p>
            </div>
          )}

          <div className="bg-white p-5 sm:p-6">
            <h2 className="text-[22px] text-ink-900">Full specifications</h2>
            <dl className="mt-3 divide-y divide-ink-600/10">
              {[
                ...(item.brand ? [{ label: "Brand", value: item.brand }] : []),
                { label: "Category", value: item.category },
                { label: "Condition", value: condition },
                ...specs,
                { label: "Price", value: ugx(item.price_ugx) },
                { label: "Sold by", value: site.name },
                { label: "Partner vendor", value: item.vendor_name },
              ].map((s, i) => (
                <div key={`${s.label}-${i}`} className="grid grid-cols-[40%_60%] gap-3 py-2.5 text-sm">
                  <dt className="text-ink-700/60">{s.label}</dt>
                  <dd className="text-ink-900">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
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
          </div>
          <h2 className="border-y border-ink-600/10 px-5 py-4 text-[22px] text-ink-900">Seller Information</h2>
          <div className="p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              <Store size={17} strokeWidth={1.5} /> {site.name}
            </p>
            <p className="mt-1 text-[13px] text-ink-700/80">
              Partner vendor: <span className="font-semibold text-ink-900">{item.vendor_name}</span>
            </p>
            {item.vendor_verified && (
              <p className="mt-1 inline-flex items-center gap-1 bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">
                <BadgeCheck size={12} /> Verified vendor
              </p>
            )}
            <p className="mt-3 text-xs leading-relaxed text-ink-700/70">
              You order from and pay {site.name}. This item is supplied by one of our approved partner vendors, and every order and question comes to us on {orderLine}.
            </p>
            <Link href="/marketplace" className="mt-4 block border border-ink-700/25 px-3 py-2.5 text-center text-xs font-bold uppercase tracking-[0.1em] text-ink-900 transition hover:border-ink-900">
              More from the marketplace
            </Link>
          </div>
        </aside>
      </div>

      {/* Reviews, from customers whose order contained this item. */}
      <ProductReviews slug={`vp-${item.id}`} productName={item.name} />

      {more.length > 0 && (
        <section className="mt-16">
          <h2 className="text-[28px] text-ink-900">More from our vendors</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {more.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
