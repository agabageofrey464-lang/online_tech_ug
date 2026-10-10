import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductCard } from "@/components/product-card";
import { PayPanel } from "@/components/pay-panel";
import { getStoreProducts } from "@/lib/catalog";
import { stickerProducts } from "@/lib/data";
import { share } from "@/lib/seo";
import { site, ugx, whatsappLink } from "@/lib/site";

const PRICE = 70000;

export const metadata: Metadata = share(
  {
    title: "Laptop Skins & Stickers",
    description: `Full-body laptop skins in Kampala — linen, wood grain, matte black patterns and colours. ${ugx(PRICE)} for the whole laptop, cut and fitted by Online Tech Uganda.`,
  },
  "/stickers",
);

export const revalidate = 60;

/**
 * Laptop skins, on a page of their own.
 *
 * They are chosen by eye, not by specification, so the page is the designs:
 * each one a close photograph of the material, all at the one price.
 */
export default async function StickersPage() {
  // The live list, so a price or stock change in the dashboard shows here. If
  // the designs have not reached the database yet, the catalogue's own copy.
  const live = (await getStoreProducts()).filter((p) => p.category === "Stickers");
  const skins = live.length > 0 ? live : stickerProducts;

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: "Laptop Skins & Stickers" }]} />

      <header className="mx-auto mt-8 max-w-2xl text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-600">Laptop skins &amp; stickers</p>
        <h1 className="mt-3 text-[38px] leading-[1.1] text-ink-900 sm:text-[48px]">A New Look For Your Laptop</h1>
        <p className="mt-4 font-display text-[19px] leading-[1.5] text-ink-800">
          Choose a design and we cut it to your laptop and fit it — the whole body, for one price. It covers scratches,
          keeps new ones off, and peels away when you want a change.
        </p>
      </header>

      <div className="mt-10 grid gap-px bg-ink-600/15 sm:grid-cols-3">
        {[
          { big: ugx(PRICE), t: "Full body", d: "Any design on this page, the whole laptop." },
          { big: `${skins.length}`, t: "Designs", d: "Linen, wood grain, matte black patterns and colours." },
          { big: "Fitted", t: "By us", d: "Cut to your model and applied at our shop." },
        ].map((k) => (
          <div key={k.t} className="bg-white px-6 py-7 text-center">
            <p className="font-display text-[34px] leading-none text-ink-900">{k.big}</p>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-600">{k.t}</p>
            <p className="mt-1.5 text-[13px] text-ink-700/75">{k.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {skins.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center gap-4 border-l-4 border-brand-500 bg-white p-6 text-center sm:flex-row sm:p-7 sm:text-left">
        <div className="min-w-0 flex-1">
          <h2 className="text-[24px] leading-tight text-ink-900">Not sure which one suits your laptop?</h2>
          <p className="mt-1.5 text-[14px] text-ink-700/85">
            Send us your laptop&apos;s make and model and the design you like. We will tell you how it will look and when to bring it in.
          </p>
        </div>
        <a
          href={whatsappLink(`Hello ${site.name}, I would like a full-body laptop skin (${ugx(PRICE)}). My laptop is: `)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-2 bg-brand-500 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-brand-600"
        >
          <MessageCircle size={15} /> Ask on WhatsApp
        </a>
      </div>

      <PayPanel purpose="a laptop skin" amount={ugx(PRICE)} className="mt-4" />
    </div>
  );
}
