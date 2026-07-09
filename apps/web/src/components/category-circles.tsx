import Image from "next/image";
import Link from "next/link";
import { Sparkles, Zap, GraduationCap, Wrench, Store, Headphones } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Tile = {
  label: string;
  href: string;
  image?: string; // web photo URL (fills the circle)
  icon?: LucideIcon;
  ring?: string; // circle background for icon tiles
};

const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=240&q=80&auto=format&fit=crop`;

const TILES: Tile[] = [
  { label: "Laptops", href: "/shop?cat=Laptops", image: u("1496181133206-80ce9b88a853") },
  { label: "Desktops & PCs", href: "/shop?cat=Desktops", image: u("1587202372775-e229f172b9d7") },
  { label: "New Arrivals", href: "/shop?sort=new", icon: Sparkles, ring: "bg-white text-brand-600" },
  { label: "Big Deals", href: "/shop?deals=1", icon: Zap, ring: "bg-[#0e5b6e] text-white" },
  { label: "RAM & SSD", href: "/shop?cat=Components", image: u("1618410320928-25228d811631") },
  { label: "Storage", href: "/shop?cat=Storage", image: u("1625842268584-8f3296236761") },
  { label: "Accessories", href: "/shop?cat=Accessories", image: u("1527864550417-7fd91fc51a46") },
  { label: "Power & Charging", href: "/shop?cat=Power", image: u("1609091839311-d5365f9ff1c5") },
  { label: "Online Courses", href: "/learn", icon: GraduationCap, ring: "bg-white text-brand-600" },
  { label: "Repairs & Support", href: "/services#repairs-support", icon: Wrench, ring: "bg-amber-300 text-brand-700" },
  { label: "Sell with us", href: "/signup?role=vendor", icon: Store, ring: "bg-[#0e5b6e] text-white" },
  { label: "Help & Support", href: "/contact", icon: Headphones, ring: "bg-white text-brand-600" },
];

export function CategoryCircles() {
  return (
    <section className="overflow-hidden rounded-lg bg-brand-500 p-4 sm:p-6">
      <h2 className="mb-4 text-lg font-extrabold text-white sm:text-xl">Explore our top categories</h2>
      <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 lg:grid-cols-6">
        {TILES.map((t) => (
          <Link key={t.label} href={t.href} className="group flex flex-col items-center gap-2 text-center">
            <span
              className={`relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full shadow-md ring-2 ring-white/40 transition group-hover:scale-105 sm:h-24 sm:w-24 ${
                t.image ? "bg-white" : t.ring ?? "bg-amber-300"
              }`}
            >
              {t.image ? (
                <Image src={t.image} alt={t.label} fill sizes="96px" className="object-cover" />
              ) : t.icon ? (
                <t.icon size={34} strokeWidth={1.8} />
              ) : null}
            </span>
            <span className="text-[11px] font-bold leading-tight text-white sm:text-xs">{t.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
