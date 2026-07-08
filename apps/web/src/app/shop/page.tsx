import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopGrid } from "@/components/shop-grid";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Shop Computers & Accessories",
  description:
    "Buy laptops, desktops, accessories, networking and storage in Uganda. Quality-checked, with delivery and flexible payment options.",
};

export default function ShopPage() {
  return (
    <div className="container-wide py-3">
      <div className="mb-3">
        <Breadcrumbs items={[{ label: "Shop" }]} />
      </div>
      <div className="mb-3 rounded-lg bg-white px-4 py-3 shadow-sm">
        <SectionHeading title="Shop — Computers & Accessories" />
      </div>
      <Suspense fallback={<div className="rounded bg-white p-12 text-center text-ink-700/60 shadow-sm">Loading…</div>}>
        <ShopGrid />
      </Suspense>
    </div>
  );
}
