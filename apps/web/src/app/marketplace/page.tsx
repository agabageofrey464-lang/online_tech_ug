import type { Metadata } from "next";
import Link from "next/link";
import { Store, Users, ShieldCheck } from "lucide-react";
import { ugx } from "@/lib/site";
import { fallbackImage } from "@/lib/image-fallback";
import { PageHeader } from "@/components/page-header";
import { WhatsAppOrder, vendorOrderMessage } from "@/components/whatsapp-order";

export const metadata: Metadata = {
  title: "Marketplace — Shop from our vendors",
  description: "Browse products from verified vendors on Online Tech Uganda's marketplace.",
};

export const dynamic = "force-dynamic";

type Item = {
  id: number;
  vendor_id: number;
  name: string;
  category: string;
  price_ugx: number;
  description: string;
  image_url: string;
  vendor_name: string;
  vendor_verified?: boolean;
  vendor_phone?: string;
  vendor_email?: string;
};

async function getItems(): Promise<Item[]> {
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  try {
    const res = await fetch(`${API}/api/v1/vendor/marketplace`, { cache: "no-store" });
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}

type VendorProfile = { name: string; verified: boolean; count: number; categories: string[]; phone: string; email: string };

// Build vendor profiles from the marketplace feed (one card per seller).
function vendorProfiles(items: Item[]): VendorProfile[] {
  const map = new Map<string, VendorProfile>();
  for (const p of items) {
    const v = map.get(p.vendor_name) ?? { name: p.vendor_name, verified: false, count: 0, categories: [], phone: "", email: "" };
    v.count += 1;
    v.verified = v.verified || !!p.vendor_verified;
    v.phone = v.phone || p.vendor_phone || "";
    v.email = v.email || p.vendor_email || "";
    if (p.category && !v.categories.includes(p.category)) v.categories.push(p.category);
    map.set(p.vendor_name, v);
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

const waFromPhone = (p: string) => `https://wa.me/${p.replace(/\D/g, "").replace(/^0/, "256")}`;

const catSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default async function MarketplacePage() {
  const items = await getItems();
  const vendors = vendorProfiles(items);

  // Group vendor products by category so the marketplace shows every category.
  const categories = [...new Set(items.map((p) => p.category || "Other"))].sort();
  const grouped = categories.map((c) => ({ cat: c, list: items.filter((p) => (p.category || "Other") === c) }));

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Marketplace" }]}
        eyebrow="Marketplace"
        title="Shop from our vendors"
        subtitle="Products listed by verified independent vendors on Online Tech Uganda. Add to cart and check out securely — we handle payment and delivery."
      />

      <div className="container-page py-8">
        {/* Trust / stats bar */}
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-ink-600/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="flex items-center gap-1.5 font-bold text-ink-900">
              <Store size={16} className="text-brand-500" /> {items.length} product{items.length === 1 ? "" : "s"}
            </span>
            <span className="flex items-center gap-1.5 text-ink-700/70">
              <Users size={15} className="text-brand-500" /> {vendors.length} vendor{vendors.length === 1 ? "" : "s"}
            </span>
            <span className="hidden items-center gap-1.5 text-ink-700/70 sm:flex">
              <ShieldCheck size={15} className="text-green-600" /> Secure checkout — we handle payment &amp; delivery
            </span>
          </div>
          <Link href="/sell" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600">
            <Store size={16} /> Sell with us
          </Link>
        </div>

        {/* Our Vendors — seller profiles */}
        {vendors.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold text-ink-900 sm:text-lg">
              <span className="h-5 w-1.5 rounded-full bg-brand-500" /> Our Vendors
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {vendors.map((v) => (
                <div key={v.name} className="flex flex-col rounded-xl border border-ink-600/10 bg-white p-3 shadow-sm transition hover:shadow-md hover:ring-1 hover:ring-brand-200">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-extrabold text-white shadow-sm">
                      {v.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 truncate text-sm font-bold text-ink-900">
                        <span className="truncate">{v.name}</span>
                        {v.verified && (
                          <span title="Verified vendor" className="shrink-0 rounded-full bg-green-100 px-1.5 text-[9px] font-bold text-green-700">✓</span>
                        )}
                      </p>
                      <p className="truncate text-[11px] text-ink-700/55">
                        {v.count} product{v.count > 1 ? "s" : ""}
                        {v.categories.length > 0 ? ` · ${v.categories.slice(0, 2).join(", ")}` : ""}
                      </p>
                    </div>
                  </div>
                  {(v.phone || v.email) && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-ink-600/10 pt-2.5">
                      {v.phone && (
                        <>
                          <a href={`tel:${v.phone.replace(/\s/g, "")}`} className="rounded-md bg-brand-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-brand-600">Call</a>
                          <a href={waFromPhone(v.phone)} target="_blank" rel="noreferrer" className="rounded-md bg-[#25D366] px-2.5 py-1 text-[11px] font-bold text-white hover:brightness-105">WhatsApp</a>
                        </>
                      )}
                      {v.email && (
                        <a href={`mailto:${v.email}`} className="rounded-md border border-ink-600/20 px-2.5 py-1 text-[11px] font-bold text-ink-700 hover:bg-ink-50">Email</a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {items.length === 0 ? (
          <div className="rounded-card border border-dashed border-ink-600/20 bg-white p-12 text-center">
            <Store className="mx-auto text-ink-700/30" size={36} />
            <p className="mt-3 font-bold text-ink-800">No vendor products yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink-700/60">
              Our vendor marketplace is just getting started. Are you a seller?
            </p>
            <Link href="/sell" className="mt-4 inline-block rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600">
              Become a vendor
            </Link>
          </div>
        ) : (
          <>
            {/* Category quick-nav chips */}
            {categories.length > 1 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <a key={c} href={`#cat-${catSlug(c)}`} className="rounded-full border border-ink-600/15 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-sm transition hover:border-brand-300 hover:text-brand-600">
                    {c}
                  </a>
                ))}
              </div>
            )}

            {/* One section per category */}
            {grouped.map(({ cat, list }) => (
              <section key={cat} id={`cat-${catSlug(cat)}`} className="mb-8 scroll-mt-24">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-900 sm:text-lg">
                    <span className="h-5 w-1.5 rounded-full bg-brand-500" /> {cat}
                  </h2>
                  <span className="text-xs text-ink-700/50">{list.length} item{list.length > 1 ? "s" : ""}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {list.map((p) => (
                    <VendorCard key={p.id} p={p} />
                  ))}
                </div>
              </section>
            ))}
          </>
        )}
      </div>
    </>
  );
}

function VendorCard({ p }: { p: Item }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-ink-600/10 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(20,16,46,0.14)] hover:ring-1 hover:ring-brand-200">
      {/* Square photo frame with an even inset — matches the store cards. */}
      <div className="relative aspect-square bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.image_url || fallbackImage(p.name, p.category)}
          alt={p.name}
          className="h-full w-full object-contain p-2 transition duration-200 group-hover:scale-[1.03]"
        />
        <span className="absolute left-2 top-2 rounded bg-ink-600/85 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Vendor
        </span>
        {p.vendor_verified && (
          <span title="Verified vendor" className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-green-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
            ✓ Verified
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col border-t border-ink-600/5 px-2.5 pb-2.5 pt-2">
        <h3 className="clamp-2 min-h-[2.25rem] text-[13px] font-medium leading-tight text-ink-800 group-hover:text-brand-600">{p.name}</h3>
        <p className="mt-0.5 truncate text-[11px] text-ink-700/50">by {p.vendor_name}</p>
        <p className="mt-1 text-[15px] font-extrabold text-ink-900">{ugx(p.price_ugx)}</p>
        {/* Paid (verified) vendors with a linked number receive their own orders;
            otherwise the order comes to the business owner. */}
        <WhatsAppOrder
          className="mt-2"
          phone={p.vendor_verified && p.vendor_phone ? p.vendor_phone : undefined}
          message={vendorOrderMessage({
            name: p.name,
            priceLabel: ugx(p.price_ugx),
            vendor: p.vendor_name,
            category: p.category,
          })}
        />
      </div>
    </article>
  );
}
