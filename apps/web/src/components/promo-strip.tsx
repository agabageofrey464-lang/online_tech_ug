"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

const telHref = (p: string) => `tel:${p.replace(/\s/g, "")}`;

/**
 * Thin promo bar above the header. On desktop it shows both messages inline;
 * on mobile (where both won't fit) it rotates between them advert-style so the
 * "Call to order" CTA gets equal billing with the free-delivery note.
 */
export function PromoStrip() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % 2), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-brand-500 text-white">
      <div className="container-wide py-1 text-center text-[11px] font-semibold sm:text-xs">
        {/* Mobile — one rotating message at a time */}
        <div key={i} className="ad-fade sm:hidden">
          {i === 1 ? (
            <a href={telHref(site.phoneDisplay)} className="hover:underline">
              📞 Call {site.phoneDisplay} to order
            </a>
          ) : (
            <span>🚚 Countrywide delivery — fee based on your distance</span>
          )}
        </div>

        {/* Desktop — both messages inline */}
        <div className="hidden items-center justify-center gap-2 sm:flex">
          <span>🚚 Countrywide delivery — fee based on your distance</span>
          <span className="text-white/60">·</span>
          <a href={telHref(site.phoneDisplay)} className="hover:underline">
            📞 Call {site.phoneDisplay} to order
          </a>
        </div>
      </div>
    </div>
  );
}
