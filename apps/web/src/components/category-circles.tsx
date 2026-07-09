import Image from "next/image";
import Link from "next/link";
import { Sparkles, Zap, GraduationCap, Wrench, Store, Headphones } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Tile = {
  label: string;
  href: string;
  img?: string; // product slug in /public/products
  icon?: LucideIcon;
  ring?: string; // circle background
};

const TILES: Tile[] = [
  { label: "Laptops", href: "/shop?cat=Laptops", img: "macbook-air-m1", ring: "bg-amber-300" },
  { label: "Desktops & PCs", href: "/shop?cat=Desktops", img: "hp-prodesk-600-g1", ring: "bg-amber-300" },
  { label: "New Arrivals", href: "/shop?sort=new", icon: Sparkles, ring: "bg-white text-brand-600" },
  { label: "Big Deals", href: "/shop?deals=1", icon: Zap, ring: "bg-[#0e5b6e] text-white" },
  { label: "RAM & SSD", href: "/shop?cat=Components", img: "ssd-nvme-500gb", ring: "bg-amber-300" },
  { label: "Storage", href: "/shop?cat=Storage", img: "sandisk-ssd-1tb", ring: "bg-amber-300" },
  { label: "Accessories", href: "/shop?cat=Accessories", img: "logitech-mk270", ring: "bg-amber-300" },
  { label: "Power & Charging", href: "/shop?cat=Power", img: "power-bank-20000", ring: "bg-amber-300" },
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
              className={`relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full shadow-md ring-2 ring-white/30 transition group-hover:scale-105 sm:h-24 sm:w-24 ${t.ring ?? "bg-amber-300"}`}
            >
              {t.img ? (
                <Image src={`/products/${t.img}.webp`} alt={t.label} fill sizes="96px" className="object-contain p-2.5" />
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
