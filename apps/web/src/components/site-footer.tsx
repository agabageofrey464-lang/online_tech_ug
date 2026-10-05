import Link from "next/link";
import { MapPin, Phone, Mail, Banknote, MessageCircle } from "lucide-react";
import { site, whatsappAltLink } from "@/lib/site";
import { BrandLogoFull } from "@/components/brand-logo-full";
import { NewsletterSignup } from "@/components/newsletter-signup";

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
    title: "Make money with us",
    links: [
      { label: "Sell on {site}", href: "/sell" },
      { label: "Advertise with us", href: "/advertise" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "Freelancers", href: "/freelancers" },
      { label: "Jobs & Internships", href: "/jobs" },
      { label: "Pricing & Plans", href: "/pricing" },
    ],
  },
  {
    title: "Let us help you",
    links: [
      { label: "All Services", href: "/services" },
      { label: "Repairs & Support", href: "/services#repairs-support" },
      { label: "Request Software", href: "/request" },
      { label: "Track Your Project", href: "/track" },
      { label: "Confirm a Payment", href: "/pay" },
      { label: "Help Center", href: "/help" },
    ],
  },
  {
    title: "About Online Tech",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Learn / Courses", href: "/learn" },
      { label: "Our Portfolio", href: "/portfolio" },
      { label: "Tech Blog", href: "/blog" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-6 border-t border-ink-600/10 bg-white text-ink-700">
      {/* Newsletter + socials (Jumia-style top) */}
      <div className="border-b border-ink-600/10 bg-ink-50">
        <div className="container-wide grid items-center gap-5 py-6 sm:grid-cols-2">
          <NewsletterSignup />

          <div className="text-center sm:justify-self-end sm:text-left">
            <p className="text-sm font-bold uppercase tracking-wider text-ink-700/50">Follow us</p>
            <div className="mt-3 flex items-center justify-center gap-2.5 sm:justify-start">
              <a
                href={site.socials.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1877f2] ring-1 ring-ink-600/10 transition hover:scale-110 hover:ring-brand-300"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                  <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
                </svg>
              </a>
              <a
                href={site.socials.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white p-1.5 ring-1 ring-ink-600/10 transition hover:scale-110 hover:ring-brand-300"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Icons/instagram.svg" alt="Instagram" className="h-full w-full object-contain" />
              </a>
              <a
                href={site.socials.tiktok}
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white p-1.5 ring-1 ring-ink-600/10 transition hover:scale-110 hover:ring-brand-300"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Icons/tiktok.svg" alt="TikTok" className="h-full w-full object-contain" />
              </a>
              <a
                href={whatsappAltLink()}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white ring-1 ring-ink-600/10 transition hover:scale-110"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Columns */}
      <div className="container-wide grid grid-cols-2 gap-x-6 gap-y-7 py-8 sm:gap-y-8 sm:py-10 lg:grid-cols-5">
        {/* Brand + contact — full-width, centered & separated on mobile */}
        <div className="col-span-2 border-b border-ink-600/10 pb-6 text-center sm:border-0 sm:pb-0 sm:text-left lg:col-span-1">
          <div className="flex justify-center sm:justify-start">
            <BrandLogoFull size="sm" onLight />
          </div>
          <p className="mt-3 text-sm text-ink-700/70">{site.tagline}</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-700/80">
            <li className="flex items-center justify-center gap-2 sm:justify-start">
              <MapPin size={16} className="shrink-0 text-brand-500" /> {site.address}
            </li>
            <li>
              <a href={telHref(site.phoneDisplay)} className="flex items-center justify-center gap-2 hover:text-brand-600 sm:justify-start">
                <Phone size={16} className="shrink-0 text-brand-500" /> {site.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="flex items-center justify-center gap-2 hover:text-brand-600 sm:justify-start">
                <Mail size={16} className="shrink-0 text-brand-500" /> {site.email}
              </a>
            </li>
          </ul>
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-bold uppercase tracking-wider text-ink-900">{col.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  {/* The padding is the tap target. These were 16px tall, which is
                      under the 24px a thumb needs, and they sit in a close
                      column where the wrong one is easy to hit. */}
                  <Link
                    href={l.href}
                    className="-mx-1 inline-block rounded px-1 py-1.5 text-ink-700/70 transition hover:text-brand-600"
                  >
                    {l.label.replace("{site}", site.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Payment methods (Jumia bottom strip) */}
      <div className="border-t border-ink-600/10 bg-ink-50">
        <div className="container-wide flex flex-wrap items-center gap-2 py-5">
          <Link href="/pay" title="Confirm a payment you've made" className="text-xs font-bold uppercase tracking-wider text-ink-700/60 hover:text-brand-600">
            Payment methods
          </Link>
          {[
            { src: "/Icons/mtn.svg", label: "MTN MoMo" },
            { src: "/Icons/airtel.svg", label: "Airtel Money" },
            { src: "/Icons/bank.svg", label: "Bank transfer" },
          ].map((p) => (
            <Link
              key={p.label}
              href="/pay"
              title={`${p.label} — confirm a payment`}
              className="flex h-8 items-center justify-center rounded bg-white px-2 ring-1 ring-ink-600/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.label} className="h-5 w-auto object-contain" />
            </Link>
          ))}
          <span className="flex h-8 items-center gap-1 rounded bg-white px-2 text-xs font-semibold text-ink-700 ring-1 ring-ink-600/10">
            <Banknote size={14} className="text-green-600" /> Cash on delivery
          </span>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-ink-600/10 bg-white">
        <div className="container-wide flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-700/55 sm:flex-row">
          <p>© {new Date().getFullYear()} {site.legalName}. All rights reserved.</p>
          <nav aria-label="Policies" className="flex flex-wrap items-center justify-center gap-x-4">
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms & Conditions", href: "/terms" },
              { label: "Returns & Refunds", href: "/returns" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="py-1.5 hover:text-brand-600">
                {l.label}
              </Link>
            ))}
          </nav>
          <p>Kampala, Uganda 🇺🇬</p>
        </div>
      </div>
    </footer>
  );
}
