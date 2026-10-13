"use client";

import { useEffect, useState } from "react";
import { SafeImage } from "@/components/safe-image";

/**
 * The "New In" tile: the newest brand-new products playing behind, one after
 * another like a short film, with the words in front of them.
 */
export function NewInTile({ imgs, aspect, big, small }: { imgs: string[]; aspect: string; big: string; small: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (imgs.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % imgs.length), 2600);
    return () => clearInterval(t);
  }, [imgs.length]);

  return (
    <div className={`relative overflow-hidden bg-white ${aspect}`}>
      {imgs.map((src, n) => (
        <div key={src} className={`absolute inset-0 transition-opacity duration-1000 ${n === i ? "opacity-100" : "opacity-0"}`} aria-hidden={n !== i}>
          <SafeImage
            src={src}
            alt="Brand new at Online Tech Uganda"
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            className={`object-contain pb-[22%] ${n === i ? "animate-kenburns-loop" : ""}`}
          />
        </div>
      ))}
      {/* Shade enough for the words to stand in front of any photograph. */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/45 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-end px-3 pb-[9%] text-center text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.6)]">
        <span className="mb-2 bg-brand-500 px-2.5 py-1 font-sans text-[9.5px] font-bold uppercase tracking-[0.18em] [text-shadow:none]">Brand new</span>
        <span className={`font-display leading-none ${big}`}>New In</span>
        <span className={`mt-1.5 font-display leading-tight ${small}`}>Just arrived at the shop</span>
      </div>
    </div>
  );
}
