import { SafeImage } from "@/components/safe-image";

/**
 * A product's photographs, laid out as a grid of large tiles rather than one
 * picture with thumbnails to click through — everything we have of the product
 * is on the page at once. One photo fills the width; with an odd number the
 * first leads across both columns.
 */
export function ProductGallery({
  images,
  alt,
  children,
}: {
  images: string[];
  alt: string;
  children?: React.ReactNode; // badges overlay, on the first tile
}) {
  const list = images.length > 0 ? images : ["/products/placeholder.webp"];
  const odd = list.length % 2 === 1;

  return (
    <div className={`grid gap-3 ${list.length > 1 ? "grid-cols-2" : ""}`}>
      {list.map((src, i) => {
        const wide = odd && i === 0;
        return (
          <div
            key={src}
            className={`relative overflow-hidden bg-[var(--tile)] ${wide ? "col-span-2 aspect-[16/10]" : "aspect-[6/5]"}`}
          >
            <SafeImage
              src={src}
              alt={i === 0 ? alt : `${alt} — view ${i + 1}`}
              fill
              sizes={wide ? "(max-width: 1024px) 100vw, 58vw" : "(max-width: 1024px) 50vw, 29vw"}
              priority={i === 0}
              className="object-contain p-5 mix-blend-multiply sm:p-8"
            />
            {i === 0 && children}
          </div>
        );
      })}
    </div>
  );
}
