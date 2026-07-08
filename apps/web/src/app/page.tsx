import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { FlashSaleCard } from "@/components/flash-sale-card";
import { FlashCountdown } from "@/components/flash-countdown";
import { Icon } from "@/components/icon";
import { CategoryMenu } from "@/components/category-menu";
import { HeroRotator } from "@/components/hero-rotator";
import { RecentlyViewed } from "@/components/recently-viewed";
import { products, services, courses, whyUs, type Product } from "@/lib/data";
import { ugx, whatsappLink } from "@/lib/site";

const MOBILE_CATS = [
  { label: "Laptops", icon: "laptop", href: "/shop?cat=Laptops" },
  { label: "Desktops", icon: "desktop", href: "/shop?cat=Desktops" },
  { label: "Components", icon: "ram", href: "/shop?cat=Components" },
  { label: "Power", icon: "power", href: "/shop?cat=Power" },
  { label: "Accessories", icon: "mouse", href: "/shop?cat=Accessories" },
  { label: "Networking", icon: "wifi", href: "/shop?cat=Networking" },
  { label: "Storage", icon: "storage", href: "/shop?cat=Storage" },
  { label: "Repairs", icon: "repair", href: "/services#repairs-support" },
  { label: "Courses", icon: "learn", href: "/learn" },
];

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
    <section className="overflow-hidden rounded-lg bg-white shadow-sm">
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
    </section>
  );
}

function Grid({ items }: { items: Product[] }) {
  // Mobile: horizontal scroll showing ~2 cards + a peek of the 3rd (Jumia style).
  // sm+: regular grid.
  return (
    <div className="grid grid-cols-2 gap-2.5 p-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
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

  return (
    <div className="container-wide space-y-3 py-3">
      {/* Hero row: sidebar + banner (hidden on mobile — looks cramped on small screens) */}
      <div className="hidden gap-3 lg:grid lg:grid-cols-[230px_1fr]">
        {/* Left column: category mega-menu (flyout expands to the right) */}
        <aside className="hidden lg:block lg:h-[400px]">
          <div className="relative h-full rounded bg-white shadow-sm">
            <CategoryMenu />
          </div>
        </aside>

        {/* Hero — animated, rotating category banner */}
        <HeroRotator />
      </div>

      {/* Mobile category quick-nav (sidebar is desktop-only) */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar lg:hidden">
        {MOBILE_CATS.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="flex w-[74px] shrink-0 flex-col items-center gap-1.5 rounded-lg bg-white px-2 py-2.5 shadow-sm"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Icon name={c.icon} size={18} />
            </span>
            <span className="text-[10px] font-medium text-ink-800">{c.label}</span>
          </Link>
        ))}
      </div>

      {/* Feature strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {whyUs.map((w) => (
          <div key={w.title} className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Icon name={w.icon} size={20} />
            </span>
            <div>
              <p className="text-xs font-bold text-ink-900">{w.title}</p>
              <p className="hidden text-[11px] text-ink-700/60 sm:block">{w.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Promo cards (below the hero & features) */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/services#repairs-support" className="group flex items-center justify-between gap-3 rounded-lg border-l-4 border-brand-500 bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
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
        <Link href="/services" className="group flex items-center justify-between gap-3 rounded-lg border-l-4 border-ink-600 bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink-50 text-ink-600">
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

      {/* Shop by category (Amazon-style cards) */}
      <section>
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-900">
            <span className="h-4 w-1 rounded-full bg-brand-500" /> Shop by Category
          </h2>
          <Link href="/shop" className="text-sm font-semibold text-brand-600 hover:underline">See all →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Laptops", img: "macbook-air-m1", href: "/shop?cat=Laptops" },
          { label: "Desktops", img: "hp-prodesk-600-g1", href: "/shop?cat=Desktops" },
          { label: "RAM & SSD", img: "ssd-nvme-500gb", href: "/shop?cat=Components" },
          { label: "Power", img: "power-bank-20000", href: "/shop?cat=Power" },
          { label: "Accessories", img: "logitech-mk270", href: "/shop?cat=Accessories" },
          { label: "Storage", img: "sandisk-ssd-1tb", href: "/shop?cat=Storage" },
        ].map((c) => (
          <Link key={c.label} href={c.href} className="group flex flex-col rounded-lg bg-white p-3 shadow-sm transition hover:shadow-md">
            <p className="text-sm font-extrabold text-ink-900">{c.label}</p>
            <div className="relative my-2 aspect-square overflow-hidden rounded bg-[#f7f7f7]">
              <Image
                src={`/products/${c.img}.webp`}
                alt={c.label}
                fill
                sizes="(max-width: 640px) 45vw, 16vw"
                className="object-contain p-2 transition group-hover:scale-105"
              />
            </div>
            <span className="mt-auto text-xs font-bold text-brand-600 group-hover:underline">Shop now →</span>
          </Link>
        ))}
        </div>
      </section>

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
        <div className="flex snap-x gap-2.5 overflow-x-auto p-3 no-scrollbar">
          {flash.map(({ p, sold }) => (
            <div key={p.id} className="w-[47%] shrink-0 snap-start sm:w-1/4 lg:w-1/6">
              <FlashSaleCard product={p} sold={sold} />
            </div>
          ))}
        </div>
      </section>

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

      {/* Category sections */}
      <Panel title="Laptops" href="/shop?cat=Laptops">
        <Grid items={byCat("Laptops").slice(0, 10)} />
      </Panel>

      <Panel title="Desktops & PCs" href="/shop?cat=Desktops">
        <Grid items={byCat("Desktops")} />
      </Panel>

      <Panel title="Upgrades — RAM, SSD & Power" href="/shop?cat=Components">
        <Grid items={[...byCat("Components"), ...byCat("Power")].slice(0, 10)} />
      </Panel>

      <Panel title="Accessories, Networking & Storage" href="/shop">
        <Grid items={[...byCat("Accessories"), ...byCat("Networking"), ...byCat("Storage")].slice(0, 10)} />
      </Panel>

      {/* Services */}
      <Panel title="Our Services" href="/services">
        <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 lg:grid-cols-6">
          {services.map((s) => (
            <Link
              key={s.slug}
              href={`/services#${s.slug}`}
              className="group relative flex flex-col items-center overflow-hidden rounded-xl border border-ink-600/10 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
            >
              <span className="absolute inset-x-0 top-0 h-1 scale-x-0 bg-brand-500 transition-transform group-hover:scale-x-100" />
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition group-hover:bg-brand-500 group-hover:text-white">
                <Icon name={s.icon} size={26} />
              </span>
              <p className="mt-3 text-sm font-bold text-ink-900">{s.title}</p>
              <p className="clamp-2 mt-1 text-[11px] leading-snug text-ink-700/60">{s.summary}</p>
              <p className="mt-2 text-[11px] font-bold text-brand-600">
                {s.startingFrom ? `From ${ugx(s.startingFrom)}` : "Get a quote"}
              </p>
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
