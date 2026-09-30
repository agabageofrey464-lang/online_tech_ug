"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { thumb } from "@/lib/thumb";
import Link from "next/link";
import { productImage, type Product } from "@/lib/data";
import { ugx } from "@/lib/site";

/**
 * The products shown in a deal band's header.
 *
 * Five fixed thumbnails only ever advertise five things out of a rail of
 * eight or more. These move instead — the window slides along by one every
 * couple of seconds, so a band quietly shows its whole shelf while somebody
 * reads the page, in the same way the offer strips rotate.
 *
 * Desktop only: on a phone the header has no room, and animation on a rail
 * nobody can see is battery spent for nothing.
 */

const STEP_MS = 1400;
const SHOWN = 5;

export function BandPreview({ items }: { items: Product[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    // Nothing to slide along if the rail already fits.
    if (items.length <= SHOWN) return;
    const t = setInterval(() => setI((v) => (v + 1) % items.length), STEP_MS);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;

  // Wrap round, so the last few are followed by the first few.
  const window = Array.from(
    { length: Math.min(SHOWN, items.length) },
    (_, n) => items[(i + n) % items.length],
  );
  const from = Math.min(...items.map((p) => p.price));

  return (
    <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 lg:flex">
      {window.map((p, n) => (
        <Link
          key={`${i}-${n}`}
          href={`/shop/${p.id}`}
          title={p.name}
          className="ad-fade group flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/95 ring-1 ring-white/30 transition hover:ring-2 hover:ring-white"
        >
          {/* The 96px copy: these are 44px circles, and pulling the full
              photograph for each was most of what made a panel header sit
              empty on a slow connection. */}
          <Image
            src={thumb(productImage(p))}
            alt=""
            width={44}
            height={44}
            loading="eager"
            className="h-8 w-8 object-contain transition duration-300 group-hover:scale-110"
          />
        </Link>
      ))}
      <span className="ml-1 shrink-0 rounded-full bg-black/20 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide ring-1 ring-white/20">
        From {ugx(from)}
      </span>
    </div>
  );
}
