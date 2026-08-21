import type { Metadata } from "next";
import Link from "next/link";
import { Store, Users, ShieldCheck } from "lucide-react";
import { ugx } from "@/lib/site";
import { fallbackImage } from "@/lib/image-fallback";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { WhatsAppOrder } from "@/components/whatsapp-order";
import { vendorOrderMessage } from "@/lib/order-message";

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
const initials = (n: string) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export default async function MarketplacePage() {
  const items = await getItems();
  const vendors = vendorProfiles(items);
  // One tidy grid, grouped naturally by category (no fragmented sections).
  const products = [...items].sort(
    (a, b) => (a.category || "Other").localeCompare(b.category || "Other") || a.name.localeCompare(b.name),
  );

  return (
    <div className="container-wide py-4">
      <div className="mb-3">
        <Breadcrumbs items={[{ label: "Marketplace" }]} />
      </div>

      {/* Banner (matches the shop page) */}
      <section className="mb-4 overflow-hidden rounded-lg bg-gradient-to-r from-ink-700 to-ink-600 text-white shadow-sm">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-black sm:text-2xl">🏪 Marketplace</h1>
            <p className="mt-1 max-w-xl text-sm text-white/85">
              Shop from independent vendors on Online Tech Uganda — secure checkout, we handle payment &amp; delivery.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">
                <Store size={13} /> {items.length} product{items.length === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">
                <Users size={13} /> {vendors.length} vendor{vendors.length === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/15">
                <ShieldCheck size={13} /> Secure checkout
              </span>
            </div>
          </div>
          <Link
            href="/sell"
            className="press inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink-900 shadow-sm transition hover:bg-white/90"
          >
            <Store size={16} /> Sell with us
          </Link>
        </div>
      </section>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ink-600/20 bg-white p-12 text-center shadow-sm">
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
          {/* Our Vendors — one clean horizontal row */}
          {vendors.length > 0 && (
            <section className="mb-6">
              <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold text-ink-900 sm:text-lg">
                <span className="h-5 w-1.5 rounded-full bg-brand-500" /> Our Vendors
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                {vendors.map((v) => (
                  <div
                    key={v.name}
                    className="flex w-60 shrink-0 flex-col rounded-xl border border-ink-600/10 bg-white p-3 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-extrabold text-white shadow-sm">
                        {initials(v.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1 truncate text-sm font-bold text-ink-900">
                          <span className="truncate">{v.name}</span>
                          {v.verified && (
                            <span title="Verified vendor" className="shrink-0 rounded-full bg-brand-100 px-1.5 text-[9px] font-bold text-brand-700">✓</span>
                          )}
                        </p>
                        <p className="truncate text-[11px] text-ink-700/55">
                          {v.count} product{v.count > 1 ? "s" : ""}
                          {v.categories.length ? ` · ${v.categories.slice(0, 2).join(", ")}` : ""}
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

          {/* All vendor products — ONE tidy grid */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold text-ink-900 sm:text-lg">
              <span className="h-5 w-1.5 rounded-full bg-brand-500" /> Vendor products
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {products.map((p) => (
                <VendorCard key={p.id} p={p} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function VendorCard({ p }: { p: Item }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg bg-white ring-1 ring-ink-600/[0.06] transition duration-200 hover:ring-brand-200 hover:shadow-[0_4px_18px_rgba(20,16,46,0.12)]">
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
          <span title="Verified vendor" className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-brand-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
            ✓ Verified
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-2">
        <h3 className="clamp-2 min-h-[2.25rem] text-[12.5px] leading-tight text-ink-800 group-hover:text-brand-600">{p.name}</h3>
        <p className="mt-0.5 truncate text-[10.5px] text-ink-700/50">by {p.vendor_name} · {p.category}</p>
        <p className="mt-1 text-[15px] font-extrabold text-ink-900">{ugx(p.price_ugx)}</p>
        <WhatsAppOrder
          className="mt-2"
          label="Order now"
          brand
          phone={p.vendor_verified && p.vendor_phone ? p.vendor_phone : undefined}
          message={vendorOrderMessage({
            name: p.name,
            priceLabel: ugx(p.price_ugx),
            vendor: p.vendor_name,
            category: p.category,
            url: p.image_url || undefined,
          })}
        />
      </div>
    </article>
  );
}
