import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { ProgressRail } from "@/components/progress-rail";
import { SafeImage } from "@/components/safe-image";
import { ugx } from "@/lib/site";

/**
 * The home page's sections, drawn the way the big home stores draw theirs:
 * a heading in bold capitals, centred, over tiles with rounded corners, a
 * price in large figures and the name with an arrow beneath.
 */

/** Every section's title the same way: the name in the serif on the left, and "Shop all" on the right. */
export function SectionTitle({ children, sub, href, cta = "Shop all" }: { children: React.ReactNode; sub?: string; href?: string; cta?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
      <div className="min-w-0">
        <h2 className="text-[24px] leading-tight text-ink-900 sm:text-[36px]">{children}</h2>
        {sub && <p className="mt-1 text-[14.5px] text-ink-700/80 sm:text-[16px]">{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="group flex shrink-0 items-center gap-2 pb-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-900 underline underline-offset-4 hover:text-brand-600 sm:text-[13px]">
          {cta} <ArrowRight size={20} strokeWidth={1.1} className="transition group-hover:translate-x-1" />
        </Link>
      )}
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

export type DealTile = { name: string; href: string; img: string; from: number; blurb: string };

/**
 * Each department as a tall photograph in a sliding rail: its name, a line
 * about it, its lowest price and "Shop now".
 */
export function DealTiles({ tiles }: { tiles: DealTile[] }) {
  return (
    <section aria-label="Shop by department">
      <SectionTitle href="/shop">Shop By Department</SectionTitle>
      <ProgressRail>
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className="group w-[58%] shrink-0 snap-start sm:w-[40%] lg:w-[calc((100%-2.25rem)/4)]">
            <span className="relative block aspect-[4/5] overflow-hidden bg-white">
              <SafeImage src={t.img} alt={t.name} fill sizes="(max-width: 640px) 70vw, 25vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" />
            </span>
            <span className="mt-4 flex items-baseline justify-between gap-2">
              <span className="font-display text-[22px] leading-tight text-ink-900">{t.name}</span>
              <span className="whitespace-nowrap text-[13px] text-ink-700/80">From {ugx(t.from)}</span>
            </span>
            <span className="mt-1.5 line-clamp-2 block text-[14.5px] leading-snug text-ink-700/85">{t.blurb}</span>
            <span className="mt-3 inline-block text-[14px] text-ink-900 underline underline-offset-4 group-hover:text-brand-600">Shop Now</span>
          </Link>
        ))}
      </ProgressRail>
    </section>
  );
}

/** The rest of the business, as a mosaic: one large photograph, one wide one, two dark tiles. */
export function BeyondMosaic() {
  const dark = "group relative flex flex-col items-center justify-center overflow-hidden rounded-md green-ribbon p-6 text-center text-white";
  return (
    <section aria-label="Beyond the shop">
      <SectionTitle sub="Software, training and support — under the same roof as the shop." href="/services" cta="All services">Beyond The Shop</SectionTitle>
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <Link href="/development" className="group relative block aspect-[4/3] overflow-hidden rounded-md lg:aspect-auto lg:min-h-[560px]">
          <SafeImage src="/hero/hero-6.webp" alt="Software being built at Online Tech Uganda" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
          <span className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/30 to-transparent" />
          <span className="absolute inset-x-0 bottom-0 flex flex-col items-center p-6 text-center text-white sm:p-10">
            <span className="rounded-sm bg-brand-500 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.12em]">Software</span>
            <span className="mt-3 font-display text-[32px] leading-tight sm:text-[48px]">Websites, Apps &amp; Systems</span>
            <span className="mt-4 bg-white px-8 py-3 text-[15px] font-semibold text-ink-900 transition group-hover:bg-brand-500 group-hover:text-white">Get a quote</span>
          </span>
        </Link>
        <div className="grid gap-3 sm:gap-4">
          <Link href="/learn" className="group relative block aspect-[16/9] overflow-hidden rounded-md lg:aspect-auto lg:min-h-[272px]">
            <SafeImage src="/web/photo-1509062522246-3755977927d7.webp" alt="A class at the Online Tech academy" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
            <span className="absolute inset-0 bg-ink-900/45" />
            <span className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
              <span className="font-display text-[30px] leading-tight sm:text-[42px]">Learn Academy</span>
              <span className="mt-1 text-[15px] sm:text-[18px]">22 computer courses, with a certificate.</span>
              <span className="mt-4 bg-white px-8 py-3 text-[15px] font-semibold text-ink-900 transition group-hover:bg-brand-500 group-hover:text-white">Browse courses</span>
            </span>
          </Link>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Link href="/internship" className={`${dark} min-h-[180px] lg:min-h-[272px]`}>
              <span className="font-display text-[24px] leading-tight sm:text-[34px]">Internships</span>
              <span className="mt-1.5 text-[13.5px] text-white/85 sm:text-[17px]">Industrial training on real client work.</span>
              <span className="mt-4 flex items-center gap-1 text-[15px] font-semibold sm:text-[18px]">
                Apply now <ChevronRight size={18} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
            <Link href="/services#repairs-support" className={`${dark} min-h-[180px] !bg-brand-600 lg:min-h-[272px]`}>
              <span className="font-display text-[24px] leading-tight sm:text-[34px]">Repairs</span>
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
      <SectionTitle sub="Tell us what you can spend — everything here is in stock." href="/find" cta="Find my laptop">Shop By Budget</SectionTitle>
      <div className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-4">
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
      <SectionTitle href="/shop">Top Picks</SectionTitle>
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

/** The best-rated products, in a sliding rail with the shop's own cards. */
export function Bestsellers({ children }: { children: React.ReactNode }) {
  return (
    <section aria-label="Bestsellers">
      <SectionTitle href="/shop?sort=popular">Bestsellers</SectionTitle>
      <ProgressRail>{children}</ProgressRail>
    </section>
  );
}

export type BrandTile = { name: string; img: string; count: number };

/** The brands asked for by name, each by one of its products. */
export function FeaturedBrands({ brands }: { brands: BrandTile[] }) {
  return (
    <section aria-label="Featured brands">
      <SectionTitle href="/categories">Featured Brands</SectionTitle>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {brands.map((b) => (
          <Link key={b.name} href={`/shop?brand=${encodeURIComponent(b.name)}`} className="group">
            <span className="relative block aspect-[4/3] overflow-hidden rounded-md bg-white">
              <SafeImage src={b.img} alt={b.name} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-contain p-5 transition duration-500 group-hover:scale-[1.05]" />
            </span>
            <span className="mt-3 block text-center font-display text-[24px] text-ink-900 group-hover:text-brand-600 sm:text-[28px]">{b.name}</span>
            <span className="block text-center text-[13px] text-ink-700/75">{b.count} in stock ›</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export type StoryTile = { href: string; img: string; title: string; line: string; meta: string };

/**
 * A rail of tall photographs, each with a title, a line and "Find out more" —
 * used for the academy's courses and for the software we have built.
 */
export function StoryRail({ title, sub, href, cta, tiles, more = "Find out more" }: { title: string; sub?: string; href: string; cta: string; tiles: StoryTile[]; more?: string }) {
  return (
    <section aria-label={title}>
      <SectionTitle sub={sub} href={href} cta={cta}>
        {title}
      </SectionTitle>
      <ProgressRail>
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className="group w-[58%] shrink-0 snap-start sm:w-[40%] lg:w-[calc((100%-2.25rem)/4)]">
            <span className="relative block aspect-[4/5] overflow-hidden bg-white">
              <SafeImage src={t.img} alt={t.title} fill sizes="(max-width: 640px) 70vw, 25vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" />
            </span>
            <span className="mt-4 block font-display text-[22px] leading-tight text-ink-900">{t.title}</span>
            <span className="mt-1 block text-[12.5px] uppercase tracking-[0.12em] text-ink-700/70">{t.meta}</span>
            <span className="mt-1.5 line-clamp-2 block text-[14.5px] leading-snug text-ink-700/85">{t.line}</span>
            <span className="mt-3 inline-block text-[14px] text-ink-900 underline underline-offset-4 group-hover:text-brand-600">{more}</span>
          </Link>
        ))}
      </ProgressRail>
    </section>
  );
}
