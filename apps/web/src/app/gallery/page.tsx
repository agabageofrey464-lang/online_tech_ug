import type { Metadata } from "next";
import { GalleryGrid } from "@/components/gallery-grid";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Photo Gallery",
  description:
    "Real photos of laptops, desktops and devices available at Online Tech Uganda — genuine, quality-checked computers in Kampala.",
};

export default function GalleryPage() {
  return (
    <div className="container-wide py-4">
      <div className="mb-3">
        <Breadcrumbs items={[{ label: "Gallery" }]} />
      </div>
      <div className="mb-3 rounded bg-white px-5 py-4 shadow-sm">
        <h1 className="text-xl font-extrabold text-ink-900">Photo Gallery</h1>
        <p className="mt-1 text-sm text-ink-700/60">
          Genuine devices, shot in-house. Tap any photo to view it larger.
        </p>
      </div>
      <GalleryGrid />
    </div>
  );
}
