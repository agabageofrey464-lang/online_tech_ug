import { SafeImage } from "@/components/safe-image";

/**
 * A product's photographs as a grid of four large tiles — everything we have
 * of the product on the page at once, rather than one picture with thumbnails
 * to click through.
 *
 * Most products have one, two or three photographs. The remaining tiles are
 * close-ups of the main photograph — the same picture, enlarged on a different
 * part each time — so the grid is always full and a shopper can study the
 * detail. They are labelled as close-ups; nothing is shown that is not the
 * product's own picture.
 */

const TILES = 4;

/** Where each close-up looks: the enlargement, and the corner it grows from. */
const CLOSE_UPS = [
  { scale: 1.9, origin: "50% 45%" },
  { scale: 2.3, origin: "28% 30%" },
  { scale: 2.3, origin: "72% 68%" },
];

type Tile = { src: string; closeUp?: (typeof CLOSE_UPS)[number] };

export function ProductGallery({
  images,
  alt,
  children,
}: {
  images: string[];
  alt: string;
  children?: React.ReactNode; // badges overlay, on the first tile
}) {
  const photos = (images.length > 0 ? images : ["/products/placeholder.webp"]).slice(0, TILES);
  const tiles: Tile[] = [
    ...photos.map((src) => ({ src })),
    ...CLOSE_UPS.slice(0, TILES - photos.length).map((closeUp) => ({ src: photos[0], closeUp })),
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3">
      {tiles.map((t, i) => (
        <div key={`${t.src}-${i}`} className="relative aspect-[6/5] overflow-hidden bg-[var(--tile)]">
          <SafeImage
            src={t.src}
            alt={t.closeUp ? `${alt} — close-up` : i === 0 ? alt : `${alt} — view ${i + 1}`}
            fill
            sizes="(max-width: 1024px) 50vw, 29vw"
            priority={i === 0}
            className={`object-contain mix-blend-multiply ${t.closeUp ? "p-0" : "p-4 sm:p-7"}`}
            style={t.closeUp ? { transform: `scale(${t.closeUp.scale})`, transformOrigin: t.closeUp.origin } : undefined}
          />
          {t.closeUp && (
            <span className="absolute bottom-2 left-2 bg-white/85 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-ink-800">
              Close-up
            </span>
          )}
          {i === 0 && children}
        </div>
      ))}
    </div>
  );
}
