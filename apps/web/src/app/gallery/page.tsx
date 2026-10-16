import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SafeImage } from "@/components/safe-image";
import { share } from "@/lib/seo";
import gallery from "../../../public/gallery/gallery.json";

export const metadata: Metadata = share(
  {
    title: "Gallery — Inside the Shop",
    description: "Photos from the Online Tech Uganda shop floor in Kampala: laptops, phones, bags and the kit we sell, as they are.",
  },
  "/gallery",
);

type Photo = { src: string; w: number; h: number };

/**
 * The shop as it is: photographs from the shop floor, newest first, laid out
 * in columns so each keeps its own shape.
 */
export default function GalleryPage() {
  const photos = [...(gallery as Photo[])].reverse();
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Gallery" }]}
        eyebrow="From the shop floor in Kampala"
        title="Gallery"
        subtitle="Laptops, phones, bags and the kit we sell — photographed in the shop, as they are."
        image="/hero/shop-shelves.webp"
      >
        <Link href="/shop" className="bg-white px-7 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-900 transition hover:bg-brand-500 hover:text-white">
          Shop now
        </Link>
      </PageHeader>

      <section className="container-wide py-10">
        <p className="mb-6 text-[14px] text-ink-700/75">{photos.length} photos · newest first</p>
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
          {photos.map((p, i) => (
            <a key={p.src} href={p.src} target="_blank" rel="noreferrer" className="group block break-inside-avoid overflow-hidden rounded-md bg-white">
              <SafeImage
                src={p.src}
                alt={`Online Tech Uganda shop photo ${photos.length - i}`}
                width={p.w}
                height={p.h}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="h-auto w-full transition duration-500 group-hover:scale-[1.03]"
              />
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
