import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SafeImage } from "@/components/safe-image";
import { ugx } from "@/lib/site";

/**
 * The home page's sections, drawn the way the big home stores draw theirs:
 * a heading in bold capitals, centred, over tiles with rounded corners, a
 * price in large figures and the name with an arrow beneath.
 */

export function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-5 text-center sm:mb-7">
      <h2 className="text-[23px] !font-bold uppercase leading-tight tracking-[0.01em] text-ink-900 sm:text-[32px]">{children}</h2>
      {sub && <p className="mt-1.5 text-[14.5px] text-ink-700/80 sm:text-[16px]">{sub}</p>}
    </div>
  );
}

/** "From UGX 350,000": the small word over the large figure. */
function From({ amount, label = "From" }: { amount: number; label?: string }) {
  return (
    <span className="flex items-end justify-center gap-1.5 text-ink-900">
      <span className="pb-[3px] text-left text-[10px] font-bold uppercase leading-[1.05] sm:text-[12px]">
        {label.split(" ").map((w) => (
          <span key={w} className="block">
            {w}
          </span>
        ))}
      </span>
      <span className="text-[22px] font-bold leading-none tracking-tight sm:text-[30px]">{ugx(amount).replace("UGX ", "UGX ")}</span>
    </span>
  );
}

export type DealTile = { name: string; href: string; img: string; from: number };

/** Each department, pictured, with its lowest price and its name. */
export function DealTiles({ tiles }: { tiles: DealTile[] }) {
  return (
    <section aria-label="Shop by department">
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-5 sm:gap-y-9 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className="group w-[44%] shrink-0 snap-start sm:w-auto">
            <span className="relative block aspect-[5/4] overflow-hidden rounded-t-md bg-white">
              <SafeImage src={t.img} alt={t.name} fill sizes="(max-width: 640px) 45vw, 25vw" className="object-cover transition duration-500 group-hover:scale-[1.05]" />
            </span>
            <span className="block h-[6px] rounded-b-md bg-brand-400" />
            <span className="mt-3 block">
              <From amount={t.from} />
            </span>
            <span className="mt-2 flex items-center justify-center gap-1 text-[14px] text-ink-800 group-hover:text-brand-600 sm:text-[16px]">
              {t.name} <ChevronRight size={16} strokeWidth={2} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** The rest of the business, as a mosaic: one large photograph, one wide one, two dark tiles. */
export function BeyondMosaic() {
  const dark = "group relative flex flex-col items-center justify-center overflow-hidden rounded-md bg-ink-800 p-6 text-center text-white";
  return (
    <section aria-label="Beyond the shop">
      <SectionTitle sub="Software, training and support — under the same roof as the shop.">Beyond The Shop</SectionTitle>
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <Link href="/development" className="group relative block aspect-[4/3] overflow-hidden rounded-md lg:aspect-auto lg:min-h-[560px]">
          <SafeImage src="/hero/hero-6.webp" alt="Software being built at Online Tech Uganda" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
          <span className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/30 to-transparent" />
          <span className="absolute inset-x-0 bottom-0 flex flex-col items-center p-6 text-center text-white sm:p-10">
            <span className="rounded-sm bg-brand-500 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.12em]">Software</span>
            <span className="mt-3 text-[30px] font-semibold leading-tight sm:text-[46px]">Websites, Apps &amp; Systems</span>
            <span className="mt-4 bg-white px-8 py-3 text-[15px] font-semibold text-ink-900 transition group-hover:bg-brand-500 group-hover:text-white">Get a quote</span>
          </span>
        </Link>
        <div className="grid gap-3 sm:gap-4">
          <Link href="/learn" className="group relative block aspect-[16/9] overflow-hidden rounded-md lg:aspect-auto lg:min-h-[272px]">
            <SafeImage src="/web/photo-1509062522246-3755977927d7.webp" alt="A class at the Online Tech academy" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
            <span className="absolute inset-0 bg-ink-900/45" />
            <span className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
              <span className="text-[28px] font-semibold leading-tight sm:text-[40px]">Learn Academy</span>
              <span className="mt-1 text-[15px] sm:text-[18px]">22 computer courses, with a certificate.</span>
              <span className="mt-4 bg-white px-8 py-3 text-[15px] font-semibold text-ink-900 transition group-hover:bg-brand-500 group-hover:text-white">Browse courses</span>
            </span>
          </Link>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Link href="/internship" className={`${dark} min-h-[180px] lg:min-h-[272px]`}>
              <span className="text-[22px] font-semibold leading-tight sm:text-[32px]">Internships</span>
              <span className="mt-1.5 text-[13.5px] text-white/85 sm:text-[17px]">Industrial training on real client work.</span>
              <span className="mt-4 flex items-center gap-1 text-[15px] font-semibold sm:text-[18px]">
                Apply now <ChevronRight size={18} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
            <Link href="/services#repairs-support" className={`${dark} min-h-[180px] !bg-brand-600 lg:min-h-[272px]`}>
              <span className="text-[22px] font-semibold leading-tight sm:text-[32px]">Repairs</span>
              <span className="mt-1.5 text-[13.5px] text-white/90 sm:text-[17px]">Free diagnosis, from UGX 30,000.</span>
              <span className="mt-4 flex items-center gap-1 text-[15px] font-semibold sm:text-[18px]">
                Book a repair <ChevronRight size={18} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export type BudgetTile = { max: number; img: string; name: string; href: string };

/** Spending to a budget: a photograph with the ceiling in a white corner badge. */
export function BudgetTiles({ tiles }: { tiles: BudgetTile[] }) {
  return (
    <section aria-label="Shop by budget">
      <SectionTitle sub="Tell us what you can spend — everything here is in stock.">Shop By Budget</SectionTitle>
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.max} href={t.href} className="group w-[62%] shrink-0 snap-start sm:w-auto">
            <span className="relative block aspect-square overflow-hidden rounded-md bg-white">
              <SafeImage src={t.img} alt={t.name} fill sizes="(max-width: 640px) 62vw, 25vw" className="object-cover transition duration-500 group-hover:scale-[1.05]" />
              <span className="absolute left-0 top-0 rounded-br-[22px] bg-white/95 px-4 pb-2.5 pt-2 text-ink-900 sm:px-5 sm:pb-3">
                <span className="block text-[11px] font-semibold uppercase leading-none sm:text-[13px]">Under</span>
                <span className="mt-1 block text-[24px] font-bold leading-none tracking-tight sm:text-[32px]">
                  {t.max >= 1_000_000 ? `${t.max / 1_000_000}M` : `${t.max / 1000}K`}
                </span>
                <span className="block text-[10px] font-semibold uppercase leading-none text-ink-700/70 sm:text-[11px]">UGX</span>
              </span>
            </span>
            <span className="mt-3 flex items-center justify-center gap-1 text-[14px] text-ink-800 group-hover:text-brand-600 sm:text-[16px]">
              {t.name} <ChevronRight size={16} strokeWidth={2} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export type PickTile = { name: string; href: string; img: string; price: number };

/** Single products on a pale panel, five across and a last tile for the rest. */
export function TopPicks({ picks }: { picks: PickTile[] }) {
  return (
    <section aria-label="Top picks">
      <SectionTitle>More Top Picks</SectionTitle>
      <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-6">
        {picks.map((p) => (
          <Link key={p.href} href={p.href} className="group text-center">
            <span className="relative block aspect-square overflow-hidden rounded-md bg-[#f5f3ef]">
              <SafeImage src={p.img} alt={p.name} fill sizes="(max-width: 640px) 50vw, 16vw" className="object-contain p-4 mix-blend-multiply transition duration-500 group-hover:scale-[1.06]" />
            </span>
            <span className="mt-3 block">
              <From amount={p.price} label="Only" />
            </span>
            <span className="mt-1.5 line-clamp-2 block px-1 text-[13.5px] leading-snug text-ink-800 group-hover:text-brand-600 sm:text-[15px]">{p.name}</span>
          </Link>
        ))}
        <Link href="/shop" className="group flex flex-col">
          <span className="flex aspect-square flex-col justify-center rounded-md bg-[#f5f3ef] px-4 text-left sm:px-6">
            <span className="text-[30px] font-bold uppercase leading-[0.95] text-ink-900 sm:text-[38px]">
              Shop
              <br />
              All
              <br />
              <span className="inline-flex items-center gap-1">
                Picks <ChevronRight size={24} strokeWidth={2.5} className="transition group-hover:translate-x-1" />
              </span>
            </span>
          </span>
          <span className="mt-3 text-center text-[13.5px] text-ink-800 group-hover:text-brand-600 sm:text-[15px]">Everything in the shop</span>
        </Link>
      </div>
    </section>
  );
}

export type BrandTile = { name: string; img: string; count: number };

/** The brands asked for by name, each by one of its products. */
export function FeaturedBrands({ brands }: { brands: BrandTile[] }) {
  return (
    <section aria-label="Featured brands">
      <SectionTitle>Featured Brands</SectionTitle>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {brands.map((b) => (
          <Link key={b.name} href={`/shop?brand=${encodeURIComponent(b.name)}`} className="group">
            <span className="relative block aspect-[4/3] overflow-hidden rounded-md bg-white">
              <SafeImage src={b.img} alt={b.name} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-contain p-5 transition duration-500 group-hover:scale-[1.05]" />
            </span>
            <span className="mt-3 block text-center text-[20px] font-bold uppercase tracking-[0.04em] text-ink-900 group-hover:text-brand-600 sm:text-[24px]">{b.name}</span>
            <span className="block text-center text-[13px] text-ink-700/75">{b.count} in stock ›</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
