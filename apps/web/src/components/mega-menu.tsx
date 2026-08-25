"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu, ChevronRight, Laptop, Monitor, Cpu, Headphones, Wifi, HardDrive,
  BatteryCharging, Wrench, GraduationCap, Store, Briefcase, Newspaper,
} from "lucide-react";
import { products } from "@/lib/data";

type Group = {
  key: string;
  label: string;
  icon: typeof Laptop;
  href: string;
  panels: { title: string; links: [string, string][] }[];
};

// Real brands we actually stock in a category — no invented menu entries.
const brandsIn = (cat: string): [string, string][] =>
  Array.from(new Set(products.filter((p) => p.category === cat).map((p) => p.brand)))
    .sort()
    .slice(0, 8)
    .map((b) => [b, `/shop?cat=${encodeURIComponent(cat)}&brand=${encodeURIComponent(b)}`]);

const GROUPS: Group[] = [
  {
    key: "laptops", label: "Laptops", icon: Laptop, href: "/shop?cat=Laptops",
    panels: [
      { title: "Shop Laptops", links: [
        ["All Laptops", "/shop?cat=Laptops"],
        ["Gaming Laptops", "/shop?q=gaming"],
        ["2-in-1 & Touch", "/shop?q=convertible"],
        ["MacBooks", "/shop?brand=Apple"],
        ["Business Laptops", "/shop?q=elitebook"],
      ] },
      { title: "By Brand", links: brandsIn("Laptops") },
    ],
  },
  {
    key: "desktops", label: "Desktops & PCs", icon: Monitor, href: "/shop?cat=Desktops",
    panels: [
      { title: "Shop Desktops", links: [
        ["All Desktops", "/shop?cat=Desktops"],
        ["All-in-One PCs", "/shop?q=all-in-one"],
        ["Towers", "/shop?q=tower"],
        ["Monitors", "/shop?q=monitor"],
      ] },
      { title: "By Brand", links: brandsIn("Desktops") },
    ],
  },
  {
    key: "components", label: "Components", icon: Cpu, href: "/shop?cat=Components",
    panels: [
      { title: "Upgrades", links: [
        ["All Components", "/shop?cat=Components"],
        ["RAM / Memory", "/shop?q=RAM"],
        ["SSD Drives", "/shop?q=SSD"],
        ["NVMe Drives", "/shop?q=NVMe"],
      ] },
      { title: "By Brand", links: brandsIn("Components") },
    ],
  },
  {
    key: "storage", label: "Storage", icon: HardDrive, href: "/shop?cat=Storage",
    panels: [
      { title: "Shop Storage", links: [
        ["All Storage", "/shop?cat=Storage"],
        ["Portable SSD", "/shop?q=portable"],
        ["1TB & above", "/shop?q=1TB"],
        ["Flash Drives", "/shop?q=flash"],
        ["Memory Cards", "/shop?q=microsd"],
      ] },
      { title: "By Brand", links: brandsIn("Storage") },
    ],
  },
  {
    key: "accessories", label: "Accessories", icon: Headphones, href: "/shop?cat=Accessories",
    panels: [
      { title: "Shop Accessories", links: [
        ["All Accessories", "/shop?cat=Accessories"],
        ["Keyboards & Mice", "/shop?q=keyboard"],
        ["Bags & Backpacks", "/shop?q=backpack"],
        ["Headsets", "/shop?q=headset"],
        ["Cables & Hubs", "/shop?q=hub"],
      ] },
      { title: "By Brand", links: brandsIn("Accessories") },
    ],
  },
  {
    key: "networking", label: "Networking", icon: Wifi, href: "/shop?cat=Networking",
    panels: [{ title: "Shop Networking", links: [
      ["All Networking", "/shop?cat=Networking"],
      ["Routers", "/shop?q=router"],
      ["WiFi Extenders", "/shop?q=extender"],
      ["Switches", "/shop?q=switch"],
    ] }],
  },
  {
    key: "power", label: "Power & Charging", icon: BatteryCharging, href: "/shop?cat=Power",
    panels: [{ title: "Shop Power", links: [
      ["All Power", "/shop?cat=Power"],
      ["Laptop Chargers", "/shop?q=charger"],
      ["Power Banks", "/shop?q=power bank"],
      ["UPS Backup", "/shop?q=UPS"],
    ] }],
  },
  {
    key: "services", label: "Services", icon: Wrench, href: "/services",
    panels: [{ title: "What we do", links: [
      ["Repairs & IT Support", "/services#repairs-support"],
      ["Websites & Software", "/services"],
      ["Request Custom Software", "/request"],
      ["Track Your Project", "/track"],
      ["Our Portfolio", "/portfolio"],
      ["Pricing & Plans", "/pricing"],
    ] }],
  },
  {
    key: "learn", label: "Learn", icon: GraduationCap, href: "/learn",
    panels: [{ title: "Courses", links: [
      ["All Courses", "/learn"],
      ["Computer Basics", "/learn/computer-basics"],
      ["Microsoft Office", "/learn/microsoft-office"],
      ["Graphic Design", "/learn/graphic-design"],
      ["Web Development", "/learn/web-development"],
      ["My Learning", "/learn/dashboard"],
    ] }],
  },
  {
    key: "marketplace", label: "Marketplace", icon: Store, href: "/marketplace",
    panels: [{ title: "Marketplace", links: [
      ["Browse Vendors", "/marketplace"],
      ["Sell With Us", "/sell"],
      ["Advertise", "/advertise"],
      ["Freelancers", "/freelancers"],
    ] }],
  },
  {
    key: "jobs", label: "Jobs", icon: Briefcase, href: "/jobs",
    panels: [{ title: "Careers", links: [
      ["Jobs & Internships", "/jobs"],
      ["Freelancers", "/freelancers"],
      ["Refer & Earn", "/refer"],
    ] }],
  },
  {
    key: "more", label: "More", icon: Newspaper, href: "/about",
    panels: [{ title: "Company", links: [
      ["About Us", "/about"],
      ["Blog", "/blog"],
      ["News", "/news"],
      ["Help Centre", "/help"],
      ["Confirm Payment", "/pay"],
      ["Contact Us", "/contact"],
    ] }],
  },
];

/** Jumia-style mega menu: hamburger -> category rail -> flyout panel of links. */
export function MegaMenu() {
  const [active, setActive] = useState<string>(GROUPS[0].key);
  const current = GROUPS.find((g) => g.key === active) ?? GROUPS[0];

  return (
    <div className="group/mega relative shrink-0">
      <button
        type="button"
        aria-label="All categories"
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-ink-800 transition hover:bg-ink-50 hover:text-brand-600"
      >
        <Menu size={20} strokeWidth={2.2} />
        <span className="text-sm font-bold">All</span>
      </button>

      {/* Panel opens on hover, like Jumia */}
      <div className="invisible absolute left-0 top-full z-50 pt-1 opacity-0 transition duration-150 group-hover/mega:visible group-hover/mega:opacity-100">
        <div className="flex overflow-hidden rounded-b-xl bg-white text-ink-800 shadow-2xl ring-1 ring-ink-600/10">
          {/* Left rail — categories */}
          <ul className="w-56 shrink-0 border-r border-ink-600/10 py-2">
            {GROUPS.map((g) => (
              <li key={g.key}>
                <Link
                  href={g.href}
                  onMouseEnter={() => setActive(g.key)}
                  className={`flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-semibold transition ${
                    active === g.key ? "bg-brand-50 text-brand-600" : "text-ink-800 hover:bg-ink-50"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <g.icon
                      size={17}
                      strokeWidth={2}
                      className={active === g.key ? "text-brand-500" : "text-ink-700/55"}
                    />
                    {g.label}
                  </span>
                  <ChevronRight size={14} className="text-ink-700/35" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Right flyout — the active category's links */}
          <div className="grid w-[520px] grid-cols-2 gap-6 p-6">
            {current.panels.map((panel) => (
              <div key={panel.title}>
                <p className="mb-2.5 border-b border-ink-600/10 pb-1.5 text-xs font-extrabold uppercase tracking-wider text-ink-900">
                  {panel.title}
                </p>
                <ul className="space-y-1.5">
                  {panel.links.map(([label, href]) => (
                    <li key={label + href}>
                      <Link href={href} className="text-sm text-ink-700/80 transition hover:text-brand-600">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
