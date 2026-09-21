import Link from "next/link";
import { SafeImage } from "@/components/safe-image";
import { productImage, type Product } from "@/lib/data";
import { ugx, site } from "@/lib/site";

/**
 * "Deals of the Day" band — a full-bleed orange strip with a decorative panel
 * at each end and warm gradient product tiles between them.
 *
 * Unlike the white-card rails elsewhere on the home page, the tiles here sit on
 * colour, so the whole band reads as one promotion rather than a row of
 * separate products.
 */

/** The stacked "Deals of the Day" artwork used as the band's bookends. */
function DealsPanel() {
  return (
    <div className="relative flex w-[8.5rem] shrink-0 select-none flex-col items-center justify-center rounded-xl bg-white/15 px-3 py-6 sm:w-[11rem]">
      <span className="text-[26px] font-black uppercase leading-[0.85] tracking-tight text-white [text-shadow:0_3px_0_rgba(0,0,0,0.18)] sm:text-[34px]">
        Deals
      </span>
      <span className="my-1 -rotate-3 rounded-full bg-[#7c3aed] px-3 py-0.5 text-[13px] font-extrabold italic text-white shadow-md sm:text-[15px]">
        of the
      </span>
      <span className="text-[30px] font-black uppercase leading-[0.85] tracking-tight text-gold-300 [text-shadow:0_3px_0_rgba(0,0,0,0.18)] sm:text-[40px]">
        Day
      </span>
      <span className="mt-2 text-center text-[9px] font-extrabold uppercase leading-tight tracking-[0.12em] text-white/85">
        Online<span className="text-gold-300">Tech</span> UG
      </span>
    </div>
  );
}

export function DealsOfTheDay({
  title,
  items,
  href = "/shop?deals=1",
}: {
  /** Defaults to "<brand> Deals Of The Day!". */
  title?: string;
  items: Product[];
  href?: string;
}) {
  if (items.length === 0) return null;

  // Branded like the reference band ("SWT Deals Of The Day!").
  const heading = title ?? `${site.name} Deals Of The Day!`;

  return (
    <section className="overflow-hidden rounded-lg bg-[#f15a29] shadow-sm">
      <div className="flex items-center justify-between gap-2 px-4 pt-4 sm:px-6">
        <h2 className="text-lg font-black tracking-tight text-white sm:text-2xl">{heading}</h2>
        <Link
          href={href}
          className="press shrink-0 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-ink-900 shadow-sm transition hover:bg-white/90 sm:text-sm"
        >
          See All →
        </Link>
      </div>

      <div className="flex snap-x items-stretch gap-3 overflow-x-auto p-4 no-scrollbar sm:gap-4 sm:px-6">
        <DealsPanel />

        {items.map((p) => {
          // Anchor price (design only — the real selling price is unchanged).
          const seed = [...p.id].reduce((a, c) => a + c.charCodeAt(0), 0);
          const pct = 6 + (seed % 15);
          const oldPrice =
            p.oldPrice && p.oldPrice > p.price
              ? p.oldPrice
              : Math.round(p.price / (1 - pct / 100) / 100) * 100;

          return (
            <Link
              key={p.id}
              href={`/shop/${p.id}`}
              className="group flex w-[10.5rem] shrink-0 snap-start flex-col rounded-xl bg-gradient-to-b from-[#fb8b4c] to-[#ef5a22] p-3 shadow-sm ring-1 ring-white/20 transition hover:ring-white/50 sm:w-[13rem]"
            >
              <p className="line-clamp-2 min-h-[2.4em] text-[13px] font-extrabold leading-tight text-white">
                {p.name}
              </p>

              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="rounded-md bg-white px-2 py-0.5 text-[13px] font-extrabold tabular-nums text-ink-900 shadow-sm">
                  {ugx(p.price)}
                </span>
              </div>
              <p className="mt-0.5 text-[10px] font-semibold text-white/70 line-through">
                {ugx(oldPrice)}
              </p>

              <div className="relative my-2 h-24 w-full sm:h-28">
                <SafeImage
                  src={productImage(p)}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 45vw, 208px"
                  className="object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.25)] transition duration-300 group-hover:scale-105"
                />
              </div>

              <span className="mt-auto inline-flex items-center gap-1 text-[12px] font-bold text-white">
                Shop Now
                <span className="transition group-hover:translate-x-0.5">→</span>
              </span>
            </Link>
          );
        })}

        <DealsPanel />
      </div>
    </section>
  );
}
