import { Phone } from "lucide-react";
import { site, whatsappLink, whatsappAltLink } from "@/lib/site";

const telHref = (p: string) => `tel:${p.replace(/\s/g, "")}`;

/**
 * Graphical "Order now" banner for the home page — the business number shown
 * large with an advert-style pulse, plus one-tap Call and WhatsApp actions.
 */
export function OrderBanner() {
  return (
    <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-ink-700 via-ink-600 to-brand-600 text-white shadow-md ring-1 ring-black/5">
      {/* Decorative drifting glows */}
      <span className="animate-blob pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <span className="animate-blob-slow pointer-events-none absolute -bottom-12 left-24 h-28 w-28 rounded-full bg-brand-400/20 blur-2xl" />
      <span
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0 2px, transparent 2px 16px)" }}
      />

      <div className="relative flex flex-col items-center gap-3 px-4 py-4 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
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
