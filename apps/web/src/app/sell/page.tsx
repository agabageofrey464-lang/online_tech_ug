import type { Metadata } from "next";
import { Store, Wallet, TrendingUp, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { VendorApply } from "@/components/vendor-apply";

export const metadata: Metadata = {
  title: "Sell on OnlineTechUg",
  description:
    "Become a vendor and sell your computers & electronics through Online Tech Uganda. We bring the customers; you get paid after every sale.",
};

const COMMISSION = 10; // platform fee %

const perks = [
  { icon: Store, title: "Your own storefront", text: "List your products on our marketplace and reach more buyers." },
  { icon: TrendingUp, title: "We bring the customers", text: "Tap into our traffic, marketing and WhatsApp audience." },
  { icon: Wallet, title: "Get paid after each sale", text: `You keep ${100 - COMMISSION}% — we retain a ${COMMISSION}% platform fee per item sold.` },
  { icon: ShieldCheck, title: "Trusted & supported", text: "Secure orders, customer care and delivery handled with you." },
];

export default function SellPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Sell with us" }]}
        eyebrow="Marketplace"
        title="Sell on OnlineTechUg"
        subtitle="Other shops can sell through our platform. We bring the customers and handle the storefront — you get paid after every sale."
      />

      <section className="container-page py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((p) => (
            <div key={p.title} className="rounded-card border border-ink-600/10 bg-white p-5 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <p.icon size={22} />
              </span>
              <h3 className="mt-3 font-bold text-ink-700">{p.title}</h3>
              <p className="mt-1 text-sm text-ink-700/70">{p.text}</p>
            </div>
          ))}
        </div>

        {/* How payouts work */}
        <div className="mt-8 rounded-card border border-brand-200 bg-brand-50 p-6">
          <h2 className="text-lg font-extrabold text-ink-700">How it works</h2>
          <ol className="mt-3 grid gap-3 text-sm text-ink-700/80 sm:grid-cols-2 lg:grid-cols-4">
            <li><b className="text-brand-700">1. Apply</b><br />Send your shop details below — we review and set up your vendor account.</li>
            <li><b className="text-brand-700">2. List products</b><br />We add your items (photos, prices, stock) to the marketplace.</li>
            <li><b className="text-brand-700">3. Sell</b><br />Customers order &amp; pay through OnlineTechUg.</li>
            <li><b className="text-brand-700">4. Get paid</b><br />After each sale we deduct our {COMMISSION}% fee and pay you the balance.</li>
          </ol>
          <p className="mt-3 text-xs text-ink-700/60">
            Example: an item sold at UGX 1,000,000 → platform fee UGX {((COMMISSION / 100) * 1000000).toLocaleString()} →
            you receive UGX {((1 - COMMISSION / 100) * 1000000).toLocaleString()}.
          </p>
        </div>

        <div className="mt-8">
          <VendorApply />
        </div>
      </section>
    </>
  );
}
