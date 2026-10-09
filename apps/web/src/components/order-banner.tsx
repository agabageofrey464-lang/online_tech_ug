import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";
import { site, whatsappLink, whatsappAltLink } from "@/lib/site";

const telHref = (p: string) => `tel:${p.replace(/\s/g, "")}`;

// What people ring up about most. Shown in the middle of the banner, which was
// empty on desktop — a phone number alone does not say what we sell.
const POPULAR = [
  { img: "hp-elitebook-840-g3", label: "Laptops", href: "/shop?cat=Laptops" },
  { img: "ssd-480gb-sata", label: "SSDs", href: "/shop?cat=Storage" },
  { img: "ram-ddr4-8gb-dimm", label: "RAM", href: "/shop?cat=Components" },
  { img: "tp-link-archer-c6", label: "Routers", href: "/shop?cat=Networking" },
];

/**
 * Graphical "Order now" banner for the home page — the business number shown
 * large with an advert-style pulse, plus one-tap Call and WhatsApp actions.
 */
export function OrderBanner() {
  return (
    <section className="relative overflow-hidden bg-teal-700 text-white">
      {/* Decorative drifting glows */}
      <span className="hidden animate-blob pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <span className="hidden animate-blob-slow pointer-events-none absolute -bottom-12 left-24 h-28 w-28 rounded-full bg-brand-400/20 blur-2xl" />
      <span
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "none" }}
      />

      {/* ── Phones: one compact row ─────────────────────────────
          Stacked, the eyebrow, the number, the WhatsApp line and a pair of
          pill buttons ran to about 170px — a fifth of a phone screen spent on
          a phone number, before anything we sell. Tapping anywhere here opens
          WhatsApp, with the number itself still dialling. */}
      <div className="relative sm:hidden">
        <a
          href={whatsappLink("Hi Online Tech Uganda! I'd like to place an order.")}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-3 py-2.5"
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
            <Phone size={16} className="text-white" />
            <span className="absolute inset-0 animate-ping rounded-full ring-2 ring-white/40" />
          </span>

          <span className="min-w-0 flex-1 leading-tight">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-200">
              <span className="inline-block h-1.5 w-1.5 animate-soft-blink rounded-full bg-green-400" />
              Order now — tap to WhatsApp
            </span>
            <span className="block truncate font-display text-[17px] font-black tracking-tight">
              {site.phoneDisplay}
            </span>
          </span>

          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#25D366] px-3.5 py-2 text-[13px] font-bold text-white shadow-sm">
            <svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor" aria-hidden>
              <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.6 6L4 29l8.2-2.1c1.7.9 3.7 1.4 5.8 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3z" />
            </svg>
            Order
          </span>
        </a>
        {/* Sits over the link so the number still dials rather than chatting. */}
        <a
          href={telHref(site.phoneDisplay)}
          aria-label={`Call ${site.phoneDisplay}`}
          className="absolute bottom-2 left-[3.25rem] right-[6.5rem] top-[1.6rem]"
        />
      </div>

      <div className="relative hidden flex-col items-center gap-3 px-4 py-4 text-center sm:flex sm:flex-row sm:justify-between sm:px-6 sm:text-left">
        <div className="flex items-center gap-3">
          {/* Pulsing call icon */}
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15">
            <Phone size={22} className="text-white" />
            <span className="absolute inset-0 animate-ping rounded-full ring-2 ring-white/50" />
          </span>
          <div className="leading-tight">
            <p className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-200 sm:justify-start">
              <span className="inline-block h-2 w-2 animate-soft-blink rounded-full bg-green-400" />
              Order now — call or WhatsApp
            </p>
            <a
              href={telHref(site.phoneDisplay)}
              className="animate-soft-blink font-display text-2xl font-black tracking-tight drop-shadow-sm sm:text-3xl"
            >
              {site.phoneDisplay}
            </a>
            {/* Second line — WhatsApp only */}
            <a
              href={whatsappAltLink("Hi Online Tech Uganda! I'd like to place an order.")}
              target="_blank"
              rel="noreferrer"
              className="mt-0.5 flex items-center justify-center gap-1 text-[12px] font-semibold text-white/80 hover:text-white sm:justify-start"
            >
              <svg viewBox="0 0 32 32" width="12" height="12" fill="#25D366" aria-hidden>
                <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.6 6L4 29l8.2-2.1c1.7.9 3.7 1.4 5.8 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3z" />
              </svg>
              WhatsApp: {site.whatsappAltDisplay}
            </a>
          </div>
        </div>

        {/* What we actually sell, between the number and the buttons. */}
        <div className="hidden items-center gap-2 lg:flex">
          {POPULAR.map((p) => (
            <Link
              key={p.img}
              href={p.href}
              className="group flex flex-col items-center gap-1"
              title={p.label}
            >
              <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white/95 ring-1 ring-white/30 transition group-hover:ring-2 group-hover:ring-white">
                <Image
                  src={`/products/${p.img}.webp`}
                  alt=""
                  width={48}
                  height={48}
                  loading="lazy"
                  className="h-9 w-9 object-contain transition duration-300 group-hover:scale-110"
                />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-white/75">
                {p.label}
              </span>
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 gap-2">
          <a
            href={telHref(site.phoneDisplay)}
            className="flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink-900 shadow-sm transition hover:bg-white/90"
          >
            <Phone size={15} /> Call
          </a>
          <a
            href={whatsappLink("Hi Online Tech Uganda! I'd like to place an order.")}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105"
          >
            <svg viewBox="0 0 32 32" width="15" height="15" fill="currentColor" aria-hidden>
              <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.6 6L4 29l8.2-2.1c1.7.9 3.7 1.4 5.8 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.9 0-3.7-.5-5.3-1.5l-.4-.2-4.9 1.3 1.3-4.8-.3-.4A9.7 9.7 0 016 15c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 9.8-10 9.8zm5.5-7.3c-.3-.2-1.8-.9-2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.3-.7.1a8 8 0 01-2.4-1.5 9 9 0 01-1.6-2.1c-.2-.3 0-.5.1-.7l.5-.6.3-.5c.1-.2 0-.4 0-.6l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.4-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.3 2.5 3.8 6 5.3.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.8-.7 2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z" />
            </svg>
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
