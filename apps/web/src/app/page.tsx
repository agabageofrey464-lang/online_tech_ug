import type { Metadata } from "next";
import { type ReactNode } from "react";
import Link from "next/link";
import { ProductRail } from "@/components/product-rail";
import { ProductCard } from "@/components/product-card";
import { PhoneFestivalFill } from "@/components/phone-festival-fill";
import { EndlessProducts } from "@/components/endless-products";
import { byCategory, CATEGORY_ORDER } from "@/lib/browse-order";
import { BandPreview, type BandItem } from "@/components/band-preview";
import { FlashSaleCard } from "@/components/flash-sale-card";
import { Icon } from "@/components/icon";
import { SafeImage } from "@/components/safe-image";
import { CategoryMenu } from "@/components/category-menu";
import { HeroRotator } from "@/components/hero-rotator";
import { OrderBanner } from "@/components/order-banner";
import { PromoBanners } from "@/components/promo-banners";
import { DailyUpdates } from "@/components/daily-updates";
import { DealsOfTheDay } from "@/components/deals-of-the-day";
import { RecentlyViewed } from "@/components/recently-viewed";
import { CategoryStrip } from "@/components/category-strip";
import { ExploreMore } from "@/components/explore-more";
import { BranchShowcase } from "@/components/branch-showcase";
import { Reveal } from "@/components/reveal";
import { listedProducts as products, whyUs, productImage, type Product } from "@/lib/data";
import { ugx, whatsappLink } from "@/lib/site";
import { share } from "@/lib/seo";

function byCat(cat: Product["category"]) {
  // Out-of-stock items never lead a rail — see the note in shop-grid.
  return products.filter((p) => p.category === cat);
}

// Section bands are white with a dark serif heading. They were solid colour,
// a different one per band, and a page of them left nowhere for the eye to
// rest; colour is now kept for the bars at the top and for buttons.
const BAND_COLORS = ["bg-white"];

function Panel({
  title,
  href,
  items,
  children,
}: {
  title: string;
  href?: string;
  /** The section's own products, rotating in the header like a strip. */
  items?: Product[];
  children: React.ReactNode;
}) {
  // Same coloured deal-band treatment as the rails, with a colour picked per
  // section title so consecutive panels never repeat.
  const seed = [...title].reduce((a, c) => a + c.charCodeAt(0), 0);
  const band = BAND_COLORS[seed % BAND_COLORS.length];

  return (
    <Reveal as="section" className={`overflow-hidden ${band}`}>
      <div className="flex items-center justify-between gap-3 border-b border-ink-600/10 px-4 py-4 text-ink-900 sm:px-6">
        <h2 className="truncate text-[24px] leading-tight sm:text-[30px]">{title}</h2>
        {items && items.length > 0 && <BandPreview items={bandItems(items)} />}
        {href && (
          <Link
            href={href}
            className="shrink-0 border-b border-ink-900 pb-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-900 transition hover:border-brand-500 hover:text-brand-600"
          >
            See All →
          </Link>
        )}
      </div>
      {children}
    </Reveal>
  );
}

// A band header gets a whole category, not a rail of eight, and whatever is
// handed to a client component is written into the page a second time for the
// browser. Its thumbnails show a picture and a price, so that is all they are
// sent — not the spec sheet of every product in the category.
function bandItems(items: Product[]): BandItem[] {
  return items.map(({ id, name, price, image }) => ({ id, name, price, image }));
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
  items,
  children,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  /** The rail's own products, previewed in the band like a festival strip. */
  items?: Product[];
  children: ReactNode;
}) {
  // Jumia-style: a SOLID colour band with white cards. Colour varies per band
  // (by title) so consecutive rails look distinct, like Jumia's deal bands.
  const seed = [...title].reduce((a, c) => a + c.charCodeAt(0), 0);
  const band = BAND_COLORS[seed % BAND_COLORS.length];

  return (
    <Reveal as="section" className={`overflow-hidden ${band}`}>
      <div className="flex items-center justify-between gap-3 border-b border-ink-600/10 px-4 py-4 text-ink-900 sm:px-6">
        <div className="min-w-0">
          <h2 className="truncate text-[24px] leading-tight sm:text-[30px]">{title}</h2>
          {subtitle && <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-600">{subtitle}</p>}
        </div>
        {items && items.length > 0 && <BandPreview items={bandItems(items)} />}

        {href && (
          <Link
            href={href}
            className="shrink-0 border-b border-ink-900 pb-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-900 transition hover:border-brand-500 hover:text-brand-600"
          >
            See All →
          </Link>
        )}
      </div>
      {children}
    </Reveal>
  );
}

export const metadata: Metadata = share({
  title: "Computers, IT Services & Computer Courses in Uganda",
  description:
    "Buy quality laptops, desktops, SSDs and accessories in Kampala with warranty and countrywide delivery. Plus website and software development, IT support and repairs, and 22 computer courses with certificates — physical and online.",
  alternates: { canonical: "/" },
}, "/");

// The storefront re-renders on a schedule (see `revalidate` below). Each slot
// gets a different offset, so the home page leads with different products every
// time it refreshes — the shop feels alive instead of frozen.
export const revalidate = 600; // 10 minutes

/** Rotate an array by `by` places — deterministic, no randomness to hydrate. */
/** Alternate two lists — laptop, phone, laptop, phone — so a mixed rail
 *  actually reads as mixed. Sorting a merged list by price looks mixed until
 *  a price band happens to be all one kind, and then it silently is not. */
// How many products a rail carries. It was eight while the page also held the
// courses, the intakes and the services; with those on their own pages the
// shop has the room, and eight read as a thin shelf.
const RAIL = 8;

// How many products the closing grid starts with. The rest arrive as the
// reader scrolls (see <EndlessProducts />), so this only has to fill the first
// few screens — sending all two hundred with the page is what once pushed it
// past a megabyte.
const GRID = 12;

function mix(a: Product[], b: Product[], take: number): Product[] {
  const inStock = (p: Product) => p.inStock !== false;
  const best = (list: Product[]) =>
    list.filter(inStock).sort((x, y) => (y.rating ?? 0) - (x.rating ?? 0));
  const [ls, ps] = [best(a), best(b)];
  const out: Product[] = [];
  for (let i = 0; out.length < take && (i < ls.length || i < ps.length); i += 1) {
    if (ls[i]) out.push(ls[i]);
    if (out.length < take && ps[i]) out.push(ps[i]);
  }
  return out;
}

function rotate<T>(arr: T[], by: number): T[] {
  if (arr.length === 0) return arr;
  const n = ((by % arr.length) + arr.length) % arr.length;
  return [...arr.slice(n), ...arr.slice(0, n)];
}

// "Sold" bar figures — stable per product so the bar doesn't jump around.

export default function HomePage() {
  // Which slot of the day we're in — advances every 10 minutes.
  const slot = Math.floor(Date.now() / (revalidate * 1000));

  const inStock = products;

  // Price drops: only products with a recorded old price above today's price,
  // biggest saving first. This band used to be "Flash Sales" with a clock
  // counting down to midnight over ordinary stock at its ordinary price — the
  // clock reset every night and nothing ever ended. A shopper who notices that
  // once stops believing every other number on the page.
  const priceDrops = products
    .filter((p) => p.oldPrice && p.oldPrice > p.price)
    .sort((a, b) => (b.oldPrice! - b.price) / b.oldPrice! - (a.oldPrice! - a.price) / a.oldPrice!);

  // Trending: top-rated, rotated so a different set leads each refresh.
  const topPool = [...inStock].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 40);
  const topSelling = rotate(topPool, slot * 5).slice(0, RAIL);

  // Picks of the day: full-price stock, a different set each Kampala day.
  // Reduced items have their own band above, so they are left out of this one.
  const today = Math.floor((Date.now() + 3 * 3600_000) / 86_400_000);
  const picks = rotate(
    inStock.filter((p) => !priceDrops.some((d) => d.id === p.id)).sort((x, y) => (y.rating ?? 0) - (x.rating ?? 0)),
    today * 7,
  ).slice(0, RAIL);

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

  // Newest first: products are appended to the catalogue, so the tail is the
  // most recent stock.
  // The closing section: everything in stock, category by category. The first
  // screens of it come with the page and the rest as the reader scrolls.
  const browse = byCategory(inStock);
  const categoryCounts = Object.fromEntries(CATEGORY_ORDER.map((c) => [c, byCat(c).length]));

  return (
    <div className="container-wide space-y-3 py-3">
      {/* Phone: the hero leads the page, edge to edge — a photograph with the
          headline and its buttons over it. A desktop shows it further down,
          beside the category list. */}
      <div className="-mx-[clamp(1rem,3.5vw,2.5rem)] -mt-3 md:hidden">
        <HeroRotator />
      </div>

      {/* Call / WhatsApp — first thing on the page, on every device, so nobody
          has to scroll to find how to order. */}
      <OrderBanner />

      {/* The three businesses, side by side. Shop, Learn and Software
          Development are separate things we sell, and two of them were only
          reachable through the desktop nav — which a phone never renders.
          Phones only — on a wide screen the nav bar carries the same three in
          the same colours, so repeating them here would say it twice. */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:hidden">
        {[
          {
            href: "/shop",
            icon: "shop",
            title: "Shop",
            tag: "Computers",
            bg: "bg-brand-500",
            ink: "text-brand-600",
          },
          {
            href: "/learn",
            icon: "graduation",
            title: "Learn",
            tag: "Academy",
            bg: "bg-green-600",
            ink: "text-green-700",
          },
          {
            href: "/development",
            icon: "code",
            title: "Develop",
            tag: "Software",
            bg: "bg-ink-600",
            ink: "text-ink-700",
          },
        ].map((b) => (
          <Link
            key={b.href}
            href={b.href}
            className={`press card-lift flex items-center gap-1.5 rounded-full ${b.bg} py-1 pl-1 pr-2 text-white shadow-md ring-1 ring-black/5 sm:gap-2 sm:pr-3`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white ${b.ink} sm:h-7 sm:w-7`}
            >
              <Icon name={b.icon} size={13} strokeWidth={2.6} />
            </span>
            <span className="min-w-0 leading-[1.15]">
              <span className="block truncate text-[11px] font-black tracking-tight sm:text-[13px]">
                {b.title}
              </span>
              <span className="block truncate text-[7.5px] font-bold uppercase tracking-[0.06em] text-white/80 sm:text-[9px]">
                {b.tag}
              </span>
            </span>
          </Link>
        ))}
      </div>

      {/* Categories, on a phone. The mega-menu and the sidebar that cover this
          on a desktop are both hidden here, so browsing by category meant
          opening the menu and going looking. */}
      <CategoryStrip className="md:hidden" />

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

      {/* The rotating offers, as a festival strip directly under the hero —
          where an offer is seen — rather than a full campaign board halfway
          down the page. */}
      <PromoBanners />

      {/* Category quick-nav removed below desktop: 9 tiles left an orphan card
          on its own row and ate the first screen. Desktop keeps the sidebar,
          and "Explore our top categories" covers browsing for everyone. */}


      {/* Phones, first — every one we stock, not a trimmed rail.

          They used to sit two thirds of the way down, below the flash sales,
          the deals band, the trust strip, the trending rail and a band for
          every brand. Nobody scrolls that far to discover a shop sells
          phones. A phone is the cheapest and most frequent thing we sell, so
          it is what belongs in front of a visitor who has not yet decided
          what they came for.

          Above the campaign banners, not below them: on a phone it was landing
          732px down, which is a screen and a bit of scrolling before a visitor
          learns we sell phones at all. */}
      <Panel title="Phones & Smartphones" href="/shop?cat=Phones" items={byCat("Phones")}>
        {/* A grid, not a rail. In a horizontal scroller a phone screen shows
            two handsets and the rest are behind a swipe most people never
            make — so the section that leads the page was showing a sixth of
            what it had. Laid out like this the whole range is reached by
            scrolling down, which is what someone is already doing. */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 p-2 sm:gap-3 sm:p-3">
          {byCat("Phones").map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
          {/* Whatever the last row has left over, as a strip for the range. */}
          <PhoneFestivalFill count={byCat("Phones").length} />
        </div>
      </Panel>

      {/* Price drops — shown only while something really is reduced */}
      {priceDrops.length > 0 && (
        <section className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="flex items-center justify-between gap-2 bg-[#5f4638] px-3 py-3 text-white sm:px-4">
            <h2 className="flex shrink-0 items-center gap-2 text-base font-extrabold sm:text-lg">
              <Icon name="zap" size={18} /> Price Drops
            </h2>
            <p className="min-w-0 truncate text-sm font-medium text-white/90">
              {priceDrops.length} {priceDrops.length === 1 ? "item" : "items"} reduced
              <span className="hidden sm:inline"> — while stock lasts</span>
            </p>
            <Link href="/shop?deals=1" className="flex shrink-0 items-center gap-0.5 text-sm font-semibold hover:underline">
              See All ›
            </Link>
          </div>
          <div className="flex snap-x gap-2 overflow-x-auto p-3 no-scrollbar">
            {priceDrops.map((p) => (
              <div key={p.id} className="w-[62%] shrink-0 snap-start sm:w-[17rem] lg:w-[19rem]">
                <FlashSaleCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Picks of the Day — branded colour band with bookend panels */}
      <DealsOfTheDay items={picks} />



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
      <DealBand title={trending.title} subtitle={trending.subtitle} href="/shop?sort=popular" items={topSelling}>
        <Rail items={topSelling} />
      </DealBand>

      {/* Where to find us — ahead of the brand bands, because the page below
          this point keeps loading products and has no end to put it at. */}
      <BranchShowcase />

      {/* A teal "Brand | Top Picks" band for every brand — categorises the whole page */}
      {brandSections.map((g) => (
        <DealBand
          key={g.brand}
          title={g.brand}
          subtitle="Top Picks"
          href={`/shop?brand=${encodeURIComponent(g.brand)}`}
          items={g.items}
        >
          <Rail items={g.items} />
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
            const hero = products.find((p) => p.brand === b);
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

      {/* Category sections (Jumia-style horizontal rails). Phones are not here
          — they lead the whole page, above the campaign banners. */}
      <Panel title="Laptops" href="/shop?cat=Laptops" items={byCat("Laptops")}>
        <Rail items={byCat("Laptops").slice(0, RAIL)} />
      </Panel>

      <Panel title="Desktops & PCs" href="/shop?cat=Desktops" items={byCat("Desktops")}>
        <Rail items={byCat("Desktops").slice(0, RAIL)} />
      </Panel>

      {/* A laptop and a phone in one rail, cheapest first. The category panels
          keep each kind in its own box, which is fine for somebody who knows
          what they want and useless for somebody kitting themselves out. */}
      <Panel
        title="Work & Talk — a phone and a laptop"
        href="/shop"
        items={[...byCat("Laptops"), ...byCat("Phones")]}
      >
        <Rail items={mix(byCat("Phones"), byCat("Laptops"), RAIL)} />
      </Panel>

      <Panel title="Upgrades — RAM, SSD & Power" href="/shop?cat=Components" items={[...byCat("Components"), ...byCat("Power")]}>
        <Rail items={[...byCat("Components"), ...byCat("Power")].slice(0, RAIL)} />
      </Panel>

      <Panel title="Accessories, Networking & Storage" href="/shop" items={[...byCat("Accessories"), ...byCat("Networking"), ...byCat("Storage")]}>
        <Rail items={[...byCat("Accessories"), ...byCat("Networking"), ...byCat("Storage")].slice(0, RAIL)} />
      </Panel>

      {/* Browse all products — same coloured deal-band treatment as the rails */}
      <Reveal as="section" className="overflow-hidden bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-ink-600/10 px-4 py-4 text-ink-900 sm:px-6">
          <div className="min-w-0">
            <h2 className="truncate text-[24px] leading-tight sm:text-[30px]">Browse all products</h2>
            <p className="text-[12px] text-ink-700/70">By category · {inStock.length} in stock · keeps loading as you scroll</p>
          </div>
          <Link
            href="/shop"
            className="shrink-0 border-b border-ink-900 pb-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-900 transition hover:border-brand-500 hover:text-brand-600"
          >
            See All →
          </Link>
        </div>
        {/* A grid that keeps going: the first products come with the page, and
            the rest are added as the reader scrolls, until the whole catalogue
            has been shown. Cards only — the shop's filters stay in the shop. */}
        <EndlessProducts initial={browse.slice(0, GRID)} total={inStock.length} counts={categoryCounts} />
      </Reveal>

      {/* Your recently viewed items */}
      <RecentlyViewed />

      {/* The rest of the business — the page used to stop dead after the grid,
          which on a phone is a long way to scroll for nothing. */}
      <ExploreMore title="More from Online Tech Uganda" limit={6} exclude={["/learn"]} />

      {/* The standing offer to be told what is new, as the page's closing
          strip: someone who has read this far and not bought is who it is for. */}
      <DailyUpdates />

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
