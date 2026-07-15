"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Icon } from "@/components/icon";

type Group = { title: string; links: [string, string][] };
type Cat = { label: string; icon: string; href: string; groups?: Group[]; blurb?: string };

const CATS: Cat[] = [
  {
    label: "Laptops",
    icon: "laptop",
    href: "/shop?cat=Laptops",
    groups: [
      {
        title: "Shop by brand",
        links: [
          ["HP", "/shop?q=HP"],
          ["Dell", "/shop?q=Dell"],
          ["Lenovo", "/shop?q=Lenovo"],
          ["Apple MacBook", "/shop?q=MacBook"],
          ["ASUS", "/shop?q=ASUS"],
        ],
      },
      {
        title: "Shop by type",
        links: [
          ["Business & office", "/shop?cat=Laptops"],
          ["Gaming (RTX)", "/shop?q=ROG"],
          ["2-in-1 / x360", "/shop?q=x360"],
          ["Brand new", "/shop?cat=Laptops"],
        ],
      },
    ],
  },
  {
    label: "Desktops & PCs",
    icon: "desktop",
    href: "/shop?cat=Desktops",
    groups: [
      {
        title: "Desktops",
        links: [
          ["Towers", "/shop?cat=Desktops"],
          ["All-in-One", "/shop?q=OptiPlex"],
          ["HP ProDesk", "/shop?q=ProDesk"],
          ["Dell OptiPlex", "/shop?q=OptiPlex"],
        ],
      },
    ],
  },
  {
    label: "Components",
    icon: "ram",
    href: "/shop?cat=Components",
    groups: [
      {
        title: "Upgrades",
        links: [
          ["Laptop RAM (SODIMM)", "/shop?q=SODIMM"],
          ["Desktop RAM (DIMM)", "/shop?q=DIMM"],
          ["NVMe M.2 SSD", "/shop?q=NVMe"],
          ["SATA SSD", "/shop?q=SATA"],
        ],
      },
    ],
  },
  {
    label: "Power & Charging",
    icon: "power",
    href: "/shop?cat=Power",
    groups: [
      {
        title: "Power",
        links: [
          ["Laptop chargers", "/shop?q=charger"],
          ["Power banks", "/shop?q=power bank"],
          ["UPS backup", "/shop?q=UPS"],
        ],
      },
    ],
  },
  {
    label: "Accessories",
    icon: "mouse",
    href: "/shop?cat=Accessories",
    groups: [
      {
        title: "Accessories",
        links: [
          ["Mouse & keyboard", "/shop?q=Logitech"],
          ["Webcams", "/shop?q=webcam"],
          ["Laptop bags", "/shop?q=bag"],
        ],
      },
    ],
  },
  {
    label: "Networking",
    icon: "wifi",
    href: "/shop?cat=Networking",
    groups: [
      {
        title: "Networking",
        links: [
          ["Routers", "/shop?q=router"],
          ["Switches", "/shop?q=switch"],
        ],
      },
    ],
  },
  {
    label: "Storage",
    icon: "storage",
    href: "/shop?cat=Storage",
    groups: [
      {
        title: "Storage",
        links: [
          ["Portable SSD", "/shop?q=SSD"],
          ["External HDD", "/shop?q=HDD"],
          ["Flash drives", "/shop?q=flash"],
          ["MicroSD cards", "/shop?q=MicroSD"],
        ],
      },
    ],
  },
  { label: "Repairs & Support", icon: "repair", href: "/services#repairs-support" },
  { label: "Web & Software", icon: "web", href: "/services" },
  { label: "Online Courses", icon: "learn", href: "/learn" },
];

function CategoryRow({ c }: { c: Cat }) {
  return (
    <div className="group/item static">
      <Link
        href={c.href}
        className="flex items-center justify-between gap-2 px-4 py-2 text-sm text-ink-800 transition hover:bg-ink-50 hover:text-ink-900"
      >
        <span className="flex items-center gap-3">
          <Icon name={c.icon} size={17} className="shrink-0 text-brand-500" /> {c.label}
        </span>
        {c.groups && <ChevronRight size={15} className="text-ink-700/40 group-hover/item:text-ink-700/70" />}
      </Link>

      {/* Flyout panel — expands to the right on hover */}
      {c.groups && (
        <div className="invisible absolute left-full top-0 z-40 ml-0 hidden h-full w-[540px] rounded-r-lg bg-white p-6 opacity-0 shadow-2xl ring-1 ring-ink-600/10 transition group-hover/item:visible group-hover/item:opacity-100 lg:block">
          <div className="flex items-center justify-between border-b border-ink-600/10 pb-3">
            <p className="flex items-center gap-2 text-base font-extrabold text-ink-900">
              <Icon name={c.icon} size={18} className="text-brand-500" /> {c.label}
            </p>
            <Link href={c.href} className="text-xs font-bold text-brand-600 hover:underline">
              See all deals →
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-5">
            {c.groups.map((g) => (
              <div key={g.title}>
                <p className="mb-2.5 border-b border-ink-600/5 pb-1 text-xs font-bold uppercase tracking-wider text-ink-900">
                  {g.title}
                </p>
                <ul className="space-y-2">
                  {g.links.map(([label, href]) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-sm text-ink-700/80 transition hover:text-brand-600 hover:underline"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CategoryMenu() {
  const shop = CATS.filter((c) => c.groups);
  const more = CATS.filter((c) => !c.groups);

  return (
    <nav className="relative flex h-full flex-col">
      {/* Dark header (near-black, matches the site palette) */}
      <p className="bg-[#232f3e] px-4 py-2.5 text-sm font-extrabold text-white">Shop by Category</p>

      <div className="flex-1 overflow-y-auto py-1.5">
        {shop.map((c) => (
          <CategoryRow key={c.label} c={c} />
        ))}

        {/* Divider + services section */}
        <div className="my-1.5 border-t border-ink-600/10" />
        <p className="px-4 pb-1 pt-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-700/45">
          More from Online Tech
        </p>
        {more.map((c) => (
          <CategoryRow key={c.label} c={c} />
        ))}
      </div>
    </nav>
  );
}
