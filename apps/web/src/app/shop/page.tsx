import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopGrid } from "@/components/shop-grid";
import { Breadcrumbs } from "@/components/breadcrumbs";

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
      <h1 className="mb-3 rounded bg-white px-4 py-3 text-lg font-extrabold text-ink-900 shadow-sm">
        Shop — Computers & Accessories
      </h1>
      <Suspense fallback={<div className="rounded bg-white p-12 text-center text-ink-700/60 shadow-sm">Loading…</div>}>
        <ShopGrid />
      </Suspense>
    </div>
  );
}
