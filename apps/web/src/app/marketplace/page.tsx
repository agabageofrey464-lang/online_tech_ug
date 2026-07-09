import type { Metadata } from "next";
import Link from "next/link";
import { Store } from "lucide-react";
import { ugx, whatsappLink, site } from "@/lib/site";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Marketplace — Shop from our vendors",
  description: "Browse products from verified vendors on Online Tech Uganda's marketplace.",
};

export const dynamic = "force-dynamic";

type Item = {
  id: number;
  name: string;
  category: string;
  price_ugx: number;
  description: string;
  image_url: string;
  vendor_name: string;
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

export default async function MarketplacePage() {
  const items = await getItems();

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Marketplace" }]}
        eyebrow="Marketplace"
        title="Shop from our vendors"
        subtitle="Products listed by verified independent vendors on Online Tech Uganda. Found something? Order it in a tap on WhatsApp."
      />

      <div className="container-page py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-700/60">{items.length} product(s) from our vendors</p>
          <Link href="/signup?role=vendor" className="inline-flex items-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600">
            <Store size={16} /> Sell with us
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-card border border-dashed border-ink-600/20 bg-white p-12 text-center">
            <Store className="mx-auto text-ink-700/30" size={36} />
            <p className="mt-3 font-bold text-ink-800">No vendor products yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink-700/60">
              Our vendor marketplace is just getting started. Are you a seller?
            </p>
            <Link href="/signup?role=vendor" className="mt-4 inline-block rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600">
              Become a vendor
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {items.map((p) => (
              <article key={p.id} className="group flex flex-col overflow-hidden rounded-md border border-ink-600/10 bg-white transition hover:shadow-md">
                <div className="relative aspect-square bg-white">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt={p.name} className="h-full w-full object-contain p-2" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-ink-700/20"><Store size={32} /></span>
                  )}
                  <span className="absolute left-2 top-2 rounded bg-ink-600/85 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Vendor
                  </span>
                </div>
                <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-1.5">
                  <h3 className="clamp-2 min-h-[2.25rem] text-[13px] leading-tight text-ink-800">{p.name}</h3>
                  <p className="mt-0.5 truncate text-[11px] text-ink-700/50">by {p.vendor_name}</p>
                  <p className="mt-1 text-[15px] font-extrabold text-ink-900">{ugx(p.price_ugx)}</p>
                  <a
                    href={whatsappLink(`Hi ${site.name}! I'm interested in "${p.name}" (${ugx(p.price_ugx)}) from vendor ${p.vendor_name} on your marketplace.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-auto rounded bg-brand-500 px-3 py-1.5 text-center text-xs font-bold text-white transition hover:bg-brand-600"
                  >
                    Buy on WhatsApp
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
