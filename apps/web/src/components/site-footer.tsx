import Link from "next/link";
import { MapPin, Phone, Mail, Banknote } from "lucide-react";
import { site } from "@/lib/site";

const telHref = (p: string) => `tel:${p.replace(/\s/g, "")}`;

const cols = [
  {
    title: "Shop",
    links: [
      { label: "Laptops", href: "/shop?cat=Laptops" },
      { label: "Desktops", href: "/shop?cat=Desktops" },
      { label: "Components (RAM/SSD)", href: "/shop?cat=Components" },
      { label: "Power & Charging", href: "/shop?cat=Power" },
      { label: "Accessories", href: "/shop?cat=Accessories" },
      { label: "Storage", href: "/shop?cat=Storage" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "All Services", href: "/services" },
      { label: "Our Portfolio", href: "/portfolio" },
      { label: "Sell with us", href: "/sell" },
      { label: "Request Software", href: "/request" },
      { label: "Track Your Project", href: "/track" },
      { label: "Repairs & Support", href: "/services#repairs-support" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Learn / Courses", href: "/learn" },
      { label: "Tech Blog", href: "/blog" },
      { label: "Jobs & Internships", href: "/jobs" },
      { label: "Gallery", href: "/gallery" },
      { label: "Videos", href: "/videos" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-4 bg-[#232f3e] text-ink-100">
      {/* Back to top (Amazon) */}
      <a
        href="#top"
        className="block bg-[#37475a] py-3.5 text-center text-sm font-medium text-white transition hover:bg-[#485769]"
      >
        Back to top
      </a>

      {/* Newsletter / help strip */}
      <div className="border-b border-white/10">
        <div className="container-wide flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <div>
            <p className="text-base font-extrabold text-white">New to Online Tech Uganda?</p>
            <p className="text-sm text-ink-200/80">Get genuine devices, expert advice and countrywide delivery.</p>
          </div>
          <Link
            href="/shop"
            className="rounded-md bg-brand-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
          >
            Start shopping
          </Link>
        </div>
      </div>

      {/* Columns */}
      <div className="container-wide grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-extrabold text-white">Online Tech Uganda</p>
          <p className="mt-3 text-sm text-ink-200/80">{site.tagline}</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-200/90">
            <li className="flex items-center gap-2">
              <MapPin size={16} className="shrink-0 text-brand-300" /> {site.address}
            </li>
            <li>
              <a href={telHref(site.phoneDisplay)} className="flex items-center gap-2 hover:text-white">
                <Phone size={16} className="shrink-0 text-brand-300" /> {site.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={telHref(site.phoneAlt)} className="flex items-center gap-2 hover:text-white">
                <Phone size={16} className="shrink-0 text-brand-300" /> {site.phoneAlt}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-white">
                <Mail size={16} className="shrink-0 text-brand-300" /> {site.email}
              </a>
            </li>
          </ul>
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-bold uppercase tracking-wider text-brand-300">{col.title}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-ink-200/90 transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Payments (left) + socials (centered, away from the WhatsApp button) — one line */}
      <div className="border-t border-white/10">
        <div className="container-wide flex items-center gap-3 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-ink-200/70">We accept:</span>
            {[
              { src: "/Icons/mtn.svg", label: "MTN MoMo" },
              { src: "/Icons/airtel.svg", label: "Airtel Money" },
              { src: "/Icons/bank.svg", label: "Bank transfer" },
            ].map((p) => (
              <span
                key={p.label}
                title={p.label}
                className="flex h-7 items-center justify-center rounded bg-white px-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt={p.label} className="h-5 w-auto object-contain" />
              </span>
            ))}
            <span className="flex h-7 items-center gap-1 rounded bg-white/10 px-2 text-xs font-semibold text-white">
              <Banknote size={14} /> Cash
            </span>
          </div>
          <div className="mx-auto flex items-center gap-2.5 text-sm">
            <span className="text-ink-200/70">Follow:</span>
            <a
              href={site.socials.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white p-1.5 transition hover:scale-110"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Icons/instagram.svg" alt="Instagram" className="h-full w-full object-contain" />
            </a>
            <a
              href={site.socials.tiktok}
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white p-1.5 transition hover:scale-110"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Icons/tiktok.svg" alt="TikTok" className="h-full w-full object-contain" />
            </a>
          </div>
          {/* right spacer keeps socials centered & clear of the WhatsApp button */}
          <div className="hidden w-20 shrink-0 sm:block" />
        </div>
      </div>

      <div className="bg-[#131a22]">
        <div className="container-wide flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-200/60 sm:flex-row">
          <p>© {new Date().getFullYear()} {site.legalName}. All rights reserved.</p>
          <p>Kampala, Uganda 🇺🇬</p>
        </div>
      </div>
    </footer>
  );
}
