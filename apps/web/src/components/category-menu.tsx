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

export function CategoryMenu() {
  return (
    <nav className="relative h-full py-1">
      {CATS.map((c) => (
        <div key={c.label} className="group/item static">
          <Link
            href={c.href}
            className="flex items-center justify-between gap-2 px-4 py-[7px] text-sm text-ink-800 transition hover:bg-brand-50 hover:text-brand-700"
          >
            <span className="flex items-center gap-3">
              <Icon name={c.icon} size={17} className="shrink-0 text-brand-500" /> {c.label}
            </span>
            {c.groups && <ChevronRight size={14} className="text-ink-700/40" />}
          </Link>

          {/* Flyout panel — expands to the right on hover */}
          {c.groups && (
            <div className="invisible absolute left-full top-0 z-40 ml-0 hidden h-full w-[520px] rounded-r bg-white p-5 opacity-0 shadow-2xl ring-1 ring-ink-600/10 transition group-hover/item:visible group-hover/item:opacity-100 lg:block">
              <div className="flex items-center justify-between border-b border-ink-600/10 pb-2">
                <p className="text-sm font-extrabold text-ink-900">{c.label}</p>
                <Link href={c.href} className="text-xs font-semibold text-brand-600 hover:underline">
                  Shop all →
                </Link>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-5">
                {c.groups.map((g) => (
                  <div key={g.title}>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-700/50">
                      {g.title}
                    </p>
                    <ul className="space-y-1.5">
                      {g.links.map(([label, href]) => (
                        <li key={label}>
                          <Link
                            href={href}
                            className="text-sm text-ink-700/80 transition hover:text-brand-600"
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
      ))}
    </nav>
  );
}
