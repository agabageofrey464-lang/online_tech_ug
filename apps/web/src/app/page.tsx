import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "@/components/product-card";
import { ShopGrid } from "@/components/shop-grid";
import { FlashSaleCard } from "@/components/flash-sale-card";
import { FlashCountdown } from "@/components/flash-countdown";
import { Icon } from "@/components/icon";
import { CategoryMenu } from "@/components/category-menu";
import { HeroRotator } from "@/components/hero-rotator";
import { OrderBanner } from "@/components/order-banner";
import { RecentlyViewed } from "@/components/recently-viewed";
import { Reveal } from "@/components/reveal";
import { ProductGridSkeleton } from "@/components/skeleton";
import { CategoryCircles } from "@/components/category-circles";
import { products, services, courses, whyUs, type Product } from "@/lib/data";
import { fallbackImage } from "@/lib/image-fallback";
import { ugx, whatsappLink } from "@/lib/site";

function byCat(cat: Product["category"]) {
  return products.filter((p) => p.category === cat);
}

function Panel({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal as="section" className="overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-ink-600/5 px-4 py-3">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-900">
          <span className="h-4 w-1 rounded-full bg-brand-500" /> {title}
        </h2>
        {href && (
          <Link href={href} className="text-sm font-semibold text-brand-600 hover:underline">
            See all →
          </Link>
        )}
      </div>
      {children}
    </Reveal>
  );
}

// Jumia-style horizontal product rail — fixed-width cards, scrolls sideways.
function Rail({ items }: { items: Product[] }) {
  return (
    <div className="flex snap-x gap-2 overflow-x-auto p-3 no-scrollbar">
      {items.map((p) => (
        <div key={p.id} className="w-[45%] shrink-0 snap-start sm:w-[30%] lg:w-[15.5%]">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}

// Jumia-style deal-band colours — cycled per band so rails look varied.
const BAND_COLORS = [
  "from-brand-500 to-brand-600",
  "from-[#6d28d9] to-[#5b21b6]", // purple
  "from-ink-600 to-ink-700", // indigo
  "from-green-600 to-green-700",
  "from-[#c41c2e] to-[#a01722]", // red
  "from-[#0e7490] to-[#155e75]", // teal
];

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
    <Reveal as="section" className={`overflow-hidden rounded-lg bg-gradient-to-br shadow-sm ${band}`}>
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

const FLASH = [
  { id: "hp-elitebook-840-g8", sold: 82 },
  { id: "macbook-air-m1", sold: 67 },
  { id: "dell-xps-13-9310", sold: 74 },
  { id: "lenovo-legion-5-15", sold: 90 },
  { id: "asus-rog-strix-g15", sold: 58 },
  { id: "sandisk-ssd-1tb", sold: 78 },
  { id: "ssd-nvme-500gb", sold: 63 },
  { id: 'macbook-pro-14-m3', sold: 71 },
];

export default function HomePage() {
  const flash = FLASH.map((f) => ({ p: products.find((x) => x.id === f.id)!, sold: f.sold })).filter(
    (f) => f.p,
  );

  // Top sellers (highest rated) and best deals (biggest discounts) for the Jumia-style rails.
  const topSelling = [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 12);
  const deals = products
    .filter((p) => p.oldPrice && p.oldPrice > p.price)
    .sort((a, b) => (b.oldPrice! - b.price) / b.oldPrice! - (a.oldPrice! - a.price) / a.oldPrice!)
    .slice(0, 12);

  // A "Brand | Top Deals" band for each brand with enough products (most first).
  const brandSections = Array.from(new Set(products.map((p) => p.brand)))
    .map((brand) => ({ brand, items: products.filter((p) => p.brand === brand) }))
    .filter((g) => g.items.length >= 4)
    .sort((a, b) => b.items.length - a.items.length);

  return (
    <div className="container-wide space-y-3 py-3">
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

      {/* Order-now banner — desktop only (mobile starts with products) */}
      <div className="hidden md:block">
        <OrderBanner />
      </div>

      {/* Category & services circles — desktop only (mobile starts with products) */}
      <div className="hidden md:block">
        <CategoryCircles />
      </div>

      {/* Products first — Browse all products sits right under the hero/banner
          (the circular "top categories" panel was removed; the header sidebar,
          top nav and mobile menu already cover category navigation). */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold text-ink-900 sm:text-lg">
          <span className="h-5 w-1.5 rounded-full bg-brand-500" /> Browse all products
        </h2>
        <Suspense fallback={<ProductGridSkeleton />}>
          <ShopGrid />
        </Suspense>
      </section>

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

      {/* Flash sales (Jumia-style) */}
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
            <div key={p.id} className="w-[47%] shrink-0 snap-start sm:w-1/4 lg:w-1/6">
              <FlashSaleCard product={p} sold={sold} />
            </div>
          ))}
        </div>
      </section>

      {/* Top selling — teal banded separator */}
      <DealBand title="Top Selling" subtitle="Best Rated" href="/shop?sort=popular">
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
          {["Dell", "HP", "Lenovo", "Apple", "ASUS", "TP-Link", "SanDisk", "Kingston", "Logitech"].map(
            (b) => (
              <Link
                key={b}
                href={`/shop?brand=${encodeURIComponent(b)}`}
                className="flex h-16 w-28 shrink-0 items-center justify-center rounded-lg border border-ink-600/10 bg-white text-sm font-extrabold text-ink-700 shadow-sm transition hover:border-brand-300 hover:text-brand-600"
              >
                {b}
              </Link>
            ),
          )}
        </div>
      </section>

      {/* Category sections (Jumia-style horizontal rails) */}
      <Panel title="Laptops" href="/shop?cat=Laptops">
        <Rail items={byCat("Laptops").slice(0, 12)} />
      </Panel>

      <Panel title="Desktops & PCs" href="/shop?cat=Desktops">
        <Rail items={byCat("Desktops").slice(0, 12)} />
      </Panel>

      <Panel title="Upgrades — RAM, SSD & Power" href="/shop?cat=Components">
        <Rail items={[...byCat("Components"), ...byCat("Power")].slice(0, 12)} />
      </Panel>

      <Panel title="Accessories, Networking & Storage" href="/shop">
        <Rail items={[...byCat("Accessories"), ...byCat("Networking"), ...byCat("Storage")].slice(0, 12)} />
      </Panel>

      {/* Services */}
      <Panel title="Our Services" href="/services">
        <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 lg:grid-cols-6">
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
        <div className="grid grid-cols-2 gap-2.5 p-3 lg:grid-cols-4">
          {courses.map((c) => (
            <Link
              key={c.slug}
              href={`/learn/${c.slug}`}
              className="flex flex-col rounded-lg border border-ink-600/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon name={c.emoji} size={24} />
              </span>
              <p className="mt-2 text-sm font-bold text-ink-900">{c.title}</p>
              <p className="mt-0.5 text-[11px] text-ink-700/60">{c.level} · {c.lessons} lessons</p>
              <p className="mt-2 inline-flex w-fit rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
                Free lessons
              </p>
              <p className="mt-auto pt-2 text-sm font-extrabold text-brand-600">{ugx(c.price)}</p>
            </Link>
          ))}
        </div>
      </Panel>

      {/* Your recently viewed items */}
      <RecentlyViewed />

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
