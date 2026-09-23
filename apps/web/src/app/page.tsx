import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductRail } from "@/components/product-rail";
import { ShopGrid } from "@/components/shop-grid";
import { FlashSaleCard } from "@/components/flash-sale-card";
import { FlashCountdown } from "@/components/flash-countdown";
import { Icon } from "@/components/icon";
import { SafeImage } from "@/components/safe-image";
import { CategoryMenu } from "@/components/category-menu";
import { HeroRotator } from "@/components/hero-rotator";
import { OrderBanner } from "@/components/order-banner";
import { PromoBanners } from "@/components/promo-banners";
import { DealsOfTheDay } from "@/components/deals-of-the-day";
import { RecentlyViewed } from "@/components/recently-viewed";
import { ExploreMore } from "@/components/explore-more";
import { Reveal } from "@/components/reveal";
import { ProductGridSkeleton } from "@/components/skeleton";
import { products, services, courses, whyUs, productImage, type Product } from "@/lib/data";
import { fallbackImage } from "@/lib/image-fallback";
import { ugx, whatsappLink } from "@/lib/site";

function byCat(cat: Product["category"]) {
  return products.filter((p) => p.category === cat);
}

// Jumia-style deal-band colours — cycled per band so rails look varied.
const BAND_COLORS = [
  "bg-brand-500",
  "bg-teal-600", // teal
  "bg-ink-600", // indigo
  "bg-green-600",
  "bg-[#c41c2e]", // red
  "bg-teal-800", // deep teal
];

function Panel({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
}) {
  // Same coloured deal-band treatment as the rails, with a colour picked per
  // section title so consecutive panels never repeat.
  const seed = [...title].reduce((a, c) => a + c.charCodeAt(0), 0);
  const band = BAND_COLORS[seed % BAND_COLORS.length];

  return (
    <Reveal as="section" className={`overflow-hidden rounded-lg shadow-sm ${band}`}>
      <div className="flex items-center justify-between gap-2 px-4 py-3.5 text-white sm:px-6">
        <h2 className="truncate text-lg font-black tracking-tight sm:text-2xl">{title}</h2>
        {href && (
          <Link
            href={href}
            className="press inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-ink-900 shadow-sm transition hover:bg-white/90 sm:text-sm"
          >
            See All →
          </Link>
        )}
      </div>
      {children}
    </Reveal>
  );
}

// Jumia-style horizontal product rail — fixed-width cards, ‹ › arrows on desktop.
function Rail({ items }: { items: Product[] }) {
  return (
    <ProductRail items={items} />
  );
}


// Coloured banner section that separates product batches (Jumia deal band).
function DealBand({
  title,
  subtitle,
  href,
  children,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  children: ReactNode;
}) {
  // Jumia-style: a SOLID colour band with white cards. Colour varies per band
  // (by title) so consecutive rails look distinct, like Jumia's deal bands.
  const seed = [...title].reduce((a, c) => a + c.charCodeAt(0), 0);
  const band = BAND_COLORS[seed % BAND_COLORS.length];

  return (
    <Reveal as="section" className={`overflow-hidden rounded-lg shadow-sm ${band}`}>
      <div className="flex items-center justify-between gap-2 px-4 py-3.5 text-white sm:px-6">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-black tracking-tight sm:text-2xl">{title}</h2>
          {subtitle && <p className="text-xs font-semibold text-white/85 sm:text-sm">{subtitle}</p>}
        </div>
        {href && (
          <Link
            href={href}
            className="press inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-ink-900 shadow-sm transition hover:bg-white/90 sm:text-sm"
          >
            See All →
          </Link>
        )}
      </div>
      {children}
    </Reveal>
  );
}

export const metadata: Metadata = {
  title: "Computers, IT Services & Computer Courses in Uganda",
  description:
    "Buy quality laptops, desktops, SSDs and accessories in Kampala with warranty and countrywide delivery. Plus website and software development, IT support and repairs, and 22 computer courses with certificates — physical and online.",
  alternates: { canonical: "/" },
};

// The storefront re-renders on a schedule (see `revalidate` below). Each slot
// gets a different offset, so the home page leads with different products every
// time it refreshes — the shop feels alive instead of frozen.
export const revalidate = 600; // 10 minutes

/** Rotate an array by `by` places — deterministic, no randomness to hydrate. */
function rotate<T>(arr: T[], by: number): T[] {
  if (arr.length === 0) return arr;
  const n = ((by % arr.length) + arr.length) % arr.length;
  return [...arr.slice(n), ...arr.slice(0, n)];
}

// "Sold" bar figures — stable per product so the bar doesn't jump around.
const soldFor = (id: string) => 55 + ([...id].reduce((a, c) => a + c.charCodeAt(0), 0) % 40);

export default function HomePage() {
  // Which slot of the day we're in — advances every 10 minutes.
  const slot = Math.floor(Date.now() / (revalidate * 1000));

  const inStock = products.filter((p) => p.inStock !== false);

  // Flash sales: rotate through the well-rated, photographed stock.
  const flashPool = inStock.filter((p) => (p.rating ?? 0) >= 4.4);
  const flash = rotate(flashPool, slot * 3)
    .slice(0, 8)
    .map((p) => ({ p, sold: soldFor(p.id) }));

  // Trending: top-rated, rotated so a different set leads each refresh.
  const topPool = [...inStock].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 40);
  const topSelling = rotate(topPool, slot * 5).slice(0, 8);

  // Weekend deals: genuine markdowns first, then top-rated stock so the band is
  // always full — a rail with one lonely card looks broken.
  const realDeals = products
    .filter((p) => p.oldPrice && p.oldPrice > p.price)
    .sort((a, b) => (b.oldPrice! - b.price) / b.oldPrice! - (a.oldPrice! - a.price) / a.oldPrice!);
  const dealFillers = rotate(
    inStock.filter((p) => !realDeals.some((d) => d.id === p.id)).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)),
    slot * 7,
  );
  const deals = [...realDeals, ...dealFillers].slice(0, 8);

  // Brand bands: rotate WHICH brands get a band, so the page varies by visit.
  const eligibleBrands = Array.from(new Set(products.map((p) => p.brand)))
    .map((brand) => ({ brand, items: products.filter((p) => p.brand === brand) }))
    .filter((g) => g.items.length >= 4 && g.brand !== "Generic")
    .sort((a, b) => b.items.length - a.items.length);
  const brandSections = rotate(eligibleBrands, slot).slice(0, 4);

  // Rotating headline so the same rail doesn't always read the same.
  const TRENDING_TITLES = [
    { title: "Trending Now", subtitle: "What shoppers are buying" },
    { title: "Top Selling", subtitle: "Best Rated" },
    { title: "Hot Right Now", subtitle: "Moving fast" },
    { title: "Customer Favourites", subtitle: "Highest rated picks" },
  ];
  const trending = TRENDING_TITLES[slot % TRENDING_TITLES.length];

  return (
    <div className="container-wide space-y-3 py-3">
      {/* Call / WhatsApp — first thing on the page, on every device, so nobody
          has to scroll to find how to order. */}
      <OrderBanner />

      {/* Hero row — DESKTOP only. On mobile we skip straight to the products
          (Jumia-style), so the hero, call banner and category circles are hidden. */}
      <div className="bleed-wide hidden gap-3 sm:mx-0 md:grid lg:grid-cols-[230px_1fr]">
        {/* Left column: category mega-menu (flyout expands to the right) */}
        <aside className="hidden lg:block lg:h-[400px]">
          <div className="relative h-full rounded bg-white shadow-sm">
            <CategoryMenu />
          </div>
        </aside>

        {/* Hero — animated, rotating category banner */}
        <HeroRotator />
      </div>

      {/* Category quick-nav removed below desktop: 9 tiles left an orphan card
          on its own row and ate the first screen. Desktop keeps the sidebar,
          and "Explore our top categories" covers browsing for everyone. */}


      {/* "Don't Miss Out!" now occupies this slot — the category circles that used
          to sit here are hidden, since the header search, mega-menu and mobile
          tab bar already cover category browsing. */}
      <PromoBanners />

      {/* Flash sales (Jumia-style) — leads the home on every device */}
      <section className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="flex items-center justify-between gap-2 bg-[#c41c2e] px-3 py-3 text-white sm:px-4">
          <h2 className="flex shrink-0 items-center gap-2 text-base font-extrabold sm:text-lg">
            <Icon name="zap" size={18} /> Flash Sales
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden font-medium sm:inline">Time Left:</span>
            <FlashCountdown />
          </div>
          <Link href="/shop" className="flex shrink-0 items-center gap-0.5 text-sm font-semibold hover:underline">
            See All ›
          </Link>
        </div>
        <div className="flex snap-x gap-2 overflow-x-auto p-3 no-scrollbar">
          {flash.map(({ p, sold }) => (
            <div key={p.id} className="w-[47%] shrink-0 snap-start sm:w-[15rem] lg:w-[13.5rem]">
              <FlashSaleCard product={p} sold={sold} />
            </div>
          ))}
        </div>
      </section>

      {/* Deals of the Day — branded colour band with bookend panels */}
      <DealsOfTheDay items={deals} />



      {/* Feature strip (trust badges) — computers only (hidden on phones) */}
      <div className="hidden gap-3 md:grid md:grid-cols-4">
        {whyUs.map((w) => (
          <div key={w.title} className="flex items-center gap-3 rounded-lg border border-ink-600/10 bg-white p-3 shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm">
              <Icon name={w.icon} size={20} />
            </span>
            <div>
              <p className="text-xs font-bold text-ink-900">{w.title}</p>
              <p className="hidden text-[11px] text-ink-700/60 sm:block">{w.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Promo cards — Repairs & Websites — computers only (hidden on phones) */}
      <div className="hidden gap-3 md:grid md:grid-cols-2">
        <Link href="/services#repairs-support" className="group flex items-center justify-between gap-3 rounded-lg border border-ink-600/10 border-l-4 border-l-brand-500 bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm">
              <Icon name="repair" size={24} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-ink-900">Repairs & IT Support</p>
              <p className="text-xs text-ink-700/70">Laptops, desktops & networks · onsite & remote · from {ugx(30000)}</p>
            </div>
          </div>
          <span className="hidden shrink-0 rounded-full bg-brand-500 px-4 py-2 text-xs font-bold text-white transition group-hover:bg-brand-600 sm:inline-block">
            Book a repair →
          </span>
        </Link>
        <Link href="/services" className="group flex items-center justify-between gap-3 rounded-lg border border-ink-600/10 border-l-4 border-l-ink-600 bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-ink-600 shadow-sm">
              <Icon name="web" size={24} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-ink-900">Websites & Software</p>
              <p className="text-xs text-ink-700/70">Custom sites, systems & apps for your business · from {ugx(500000)}</p>
            </div>
          </div>
          <span className="hidden shrink-0 rounded-full bg-ink-600 px-4 py-2 text-xs font-bold text-white transition group-hover:bg-ink-700 sm:inline-block">
            Get a quote →
          </span>
        </Link>
      </div>

      {/* Top selling — teal banded separator */}
      <DealBand title={trending.title} subtitle={trending.subtitle} href="/shop?sort=popular">
        <Rail items={topSelling} />
      </DealBand>

      {/* Weekend Top Deals — teal banded separator */}
      {deals.length > 0 && (
        <DealBand title="Explosion Weekend" subtitle="Top Deals" href="/shop?deals=1">
          <Rail items={deals} />
        </DealBand>
      )}

      {/* A teal "Brand | Top Deals" band for every brand — categorises the whole page */}
      {brandSections.map((g) => (
        <DealBand
          key={g.brand}
          title={g.brand}
          subtitle="Top Deals"
          href={`/shop?brand=${encodeURIComponent(g.brand)}`}
        >
          <Rail items={g.items.slice(0, 8)} />
        </DealBand>
      ))}

      {/* Shop by brand */}
      <section className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-base font-extrabold text-ink-900">Shop by Brand</h2>
          <Link href="/shop" className="text-sm font-semibold text-brand-600 hover:underline">See all →</Link>
        </div>
        <div className="flex gap-2.5 overflow-x-auto px-4 pb-4 no-scrollbar">
          {["Dell", "HP", "Lenovo", "Apple", "ASUS", "TP-Link", "SanDisk", "Kingston", "Logitech"].map((b) => {
            // Show a real product from that brand so the tile is a picture, not a word.
            const hero = products.find((p) => p.brand === b && p.inStock !== false) ?? products.find((p) => p.brand === b);
            const count = products.filter((p) => p.brand === b).length;
            return (
              <Link
                key={b}
                href={`/shop?brand=${encodeURIComponent(b)}`}
                className="group/brand flex w-32 shrink-0 flex-col overflow-hidden rounded-lg border border-ink-600/10 bg-white shadow-sm transition hover:border-brand-300 hover:shadow-md"
              >
                <span className="relative block h-20 w-full bg-white">
                  {hero && (
                    <SafeImage
                      src={productImage(hero)}
                      alt={b}
                      fill
                      sizes="128px"
                      className="object-contain p-2 transition duration-200 group-hover/brand:scale-105"
                    />
                  )}
                </span>
                <span className="border-t border-ink-600/5 px-2 py-1.5 text-center">
                  <span className="block text-xs font-extrabold text-ink-800 group-hover/brand:text-brand-600">{b}</span>
                  <span className="block text-[10px] text-ink-700/50">{count} item{count === 1 ? "" : "s"}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Category sections (Jumia-style horizontal rails) */}
      <Panel title="Laptops" href="/shop?cat=Laptops">
        <Rail items={byCat("Laptops").slice(0, 8)} />
      </Panel>

      <Panel title="Desktops & PCs" href="/shop?cat=Desktops">
        <Rail items={byCat("Desktops").slice(0, 8)} />
      </Panel>

      <Panel title="Upgrades — RAM, SSD & Power" href="/shop?cat=Components">
        <Rail items={[...byCat("Components"), ...byCat("Power")].slice(0, 8)} />
      </Panel>

      <Panel title="Accessories, Networking & Storage" href="/shop">
        <Rail items={[...byCat("Accessories"), ...byCat("Networking"), ...byCat("Storage")].slice(0, 8)} />
      </Panel>

      {/* Services */}
      <Panel title="Our Services" href="/services">
        <div className="grid-cards-sm gap-3 p-3">
          {services.map((s) => (
            <Link
              key={s.slug}
              href={`/services#${s.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-ink-600/10 bg-white text-center shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
            >
              {/* Service photo banner with the icon badge */}
              <div className="relative h-24 w-full overflow-hidden bg-ink-50">
                <Image
                  src={s.image ?? fallbackImage(s.title)}
                  alt={s.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/45 to-transparent" />
                <span className="absolute bottom-2 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-white text-brand-600 shadow-md">
                  <Icon name={s.icon} size={18} />
                </span>
              </div>
              <div className="flex flex-col items-center p-3">
                <p className="text-sm font-bold text-ink-900">{s.title}</p>
                <p className="clamp-2 mt-1 text-[11px] leading-snug text-ink-700/60">{s.summary}</p>
                <p className="mt-2 text-[11px] font-bold text-brand-600">
                  {s.startingFrom ? `From ${ugx(s.startingFrom)}` : "Get a quote"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Panel>

      {/* Learn */}
      <Panel title="Learn Computer Skills" href="/learn">
        <div className="grid-cards-lg gap-2.5 p-3">
          {courses.map((c) => (
            <Link
              key={c.slug}
              href={`/learn/${c.slug}`}
              className="group/course flex flex-col overflow-hidden rounded-lg border border-ink-600/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* Cover photo fills what used to be empty card space */}
              <span className="relative block h-24 w-full overflow-hidden bg-ink-50 sm:h-28">
                <SafeImage
                  src={c.cover ?? `/courses/${c.slug}.webp`}
                  alt={c.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition duration-300 group-hover/course:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-ink-900/55 to-transparent" />
                <span className="absolute bottom-1.5 left-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-white text-brand-600 shadow">
                  <Icon name={c.emoji} size={16} />
                </span>
              </span>
              <div className="flex flex-1 flex-col p-3">
                <p className="clamp-2 text-sm font-bold leading-snug text-ink-900">{c.title}</p>
                {/* How long the taught programme runs is the first thing
                    someone enrolling asks, so it belongs on the card. */}
                <p className="mt-0.5 text-[11px] text-ink-700/60">
                  {c.level} · {c.lessons} lessons
                  {c.durationMonths ? ` · ${c.durationMonths} months` : ""}
                </p>
                <p className="mt-1.5 inline-flex w-fit rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-700">
                  Certificate included
                </p>
                <p className="mt-auto pt-2 text-sm font-extrabold text-brand-600">{ugx(c.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </Panel>

      {/* Browse all products — same coloured deal-band treatment as the rails */}
      <Reveal as="section" className="overflow-hidden rounded-lg bg-teal-600 shadow-sm">
        <div className="flex items-center justify-between gap-2 px-4 py-3.5 text-white sm:px-6">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-black tracking-tight sm:text-2xl">Browse all products</h2>
            <p className="text-xs font-semibold text-white/85 sm:text-sm">Everything in stock</p>
          </div>
          <Link
            href="/shop"
            className="press inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-ink-900 shadow-sm transition hover:bg-white/90 sm:text-sm"
          >
            See All →
          </Link>
        </div>
        <div className="p-3">
          <Suspense fallback={<ProductGridSkeleton />}>
            <ShopGrid />
          </Suspense>
        </div>
      </Reveal>

      {/* Your recently viewed items */}
      <RecentlyViewed />

      {/* The rest of the business — the page used to stop dead after the grid,
          which on a phone is a long way to scroll for nothing. */}
      <ExploreMore title="More from Online Tech Uganda" limit={6} />

      {/* WhatsApp CTA */}
      <section className="rounded bg-ink-700 px-6 py-8 text-center text-white">
        <h2 className="text-xl font-extrabold sm:text-2xl">Need help choosing?</h2>
        <p className="mx-auto mt-1 max-w-lg text-sm text-white/85">
          Chat with our team on WhatsApp — we&apos;ll help you pick the right device or service.
        </p>
        <a
          href={whatsappLink("Hello Online Tech Uganda, I'd like help choosing.")}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block rounded-md bg-white px-6 py-2.5 text-sm font-bold text-brand-600 hover:bg-brand-50"
        >
          Chat on WhatsApp
        </a>
      </section>
    </div>
  );
}
