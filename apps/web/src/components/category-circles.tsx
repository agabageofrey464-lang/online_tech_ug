import Image from "next/image";
import Link from "next/link";

type Tile = { label: string; href: string; id: string };

// Higher-res crop so the circular thumbnails stay crisp on retina screens.
const src = (id: string) => `/web/photo-${id}.jpg`;

const TILES: Tile[] = [
  { label: "Laptops", href: "/shop?cat=Laptops", id: "1496181133206-80ce9b88a853" },
  { label: "Desktops & PCs", href: "/shop?cat=Desktops", id: "1587202372775-e229f172b9d7" },
  { label: "New Arrivals", href: "/shop?sort=new", id: "1556910103-1c02745aae4d" },
  { label: "Big Deals", href: "/shop?deals=1", id: "1607083206869-4c7672e72a8a" },
  { label: "RAM & SSD", href: "/shop?cat=Components", id: "1618410320928-25228d811631" },
  { label: "Storage", href: "/shop?cat=Storage", id: "1625842268584-8f3296236761" },
  { label: "Accessories", href: "/shop?cat=Accessories", id: "1527864550417-7fd91fc51a46" },
  { label: "Power & Charging", href: "/shop?cat=Power", id: "1609091839311-d5365f9ff1c5" },
  { label: "Online Courses", href: "/learn", id: "1516321318423-f06f85e504b3" },
  { label: "Repairs & Support", href: "/services#repairs-support", id: "1581092160562-40aa08e78837" },
  { label: "Sell with us", href: "/sell", id: "1556742044-3c52d6e88c62" },
  { label: "Help & Support", href: "/contact", id: "1553775282-20af80779df7" },
];

export function CategoryCircles() {
  // Two copies of the tiles so the marquee track loops seamlessly.
  const loop = [...TILES, ...TILES];

  return (
    <section className="overflow-hidden rounded-lg border border-ink-600/10 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-5 flex items-center gap-2 text-lg font-extrabold text-ink-900 sm:text-xl">
        <span className="h-5 w-1.5 rounded-full bg-brand-500" /> Explore our top categories
      </h2>

      {/* Single moving line — auto-scrolls like an advert, pauses on hover.
          Soft fade masks at both edges. */}
      <div className="marquee-group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent sm:w-16" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent sm:w-16" />
        <div className="overflow-hidden">
          <div className="animate-marquee flex w-max gap-6 sm:gap-8">
            {loop.map((t, i) => (
              <Link
                key={`${t.label}-${i}`}
                href={t.href}
                aria-hidden={i >= TILES.length}
                className="group flex w-20 shrink-0 flex-col items-center sm:w-24"
              >
                <span className="relative h-20 w-20 overflow-hidden rounded-full bg-white shadow-sm ring-2 ring-ink-100 transition duration-200 group-hover:scale-105 group-hover:ring-brand-500 sm:h-24 sm:w-24">
                  <Image src={src(t.id)} alt={t.label} fill sizes="(max-width:640px) 80px, 96px" className="object-cover" />
                </span>
                <span className="mt-2.5 flex min-h-[2.1rem] items-start justify-center px-1 text-center text-[11px] font-bold leading-snug text-ink-800 sm:text-xs">
                  {t.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
