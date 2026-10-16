"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

/** The intake starts on 2 November; a fortnight in, there is no place left to announce. */
const UNTIL = "2026-11-15";
const CLOSED = "otu_intake_banner_closed";

/**
 * The internship announcement, as a festival strip across the top of every page.
 *
 * The announcement posted in the academy is seen only by students already
 * signed in to it. The students it is for have not enrolled yet — they are
 * visitors — so the same news is carried here, above everything else, where a
 * visitor cannot miss it: what it is, when, what it costs, and one button.
 *
 * It is green, the academy's colour, so it reads as a different thing from
 * the orange store strips beneath it. It can be closed, and it takes itself
 * down once the intake is under way.
 */
export function IntakeBanner() {
  // Drawn by default, so the server's copy and the browser's agree; removed in
  // the browser if the visitor closed it or the date has passed.
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let closed = false;
    try {
      closed = sessionStorage.getItem(CLOSED) === "1";
    } catch {
      /* storage blocked — the banner stays */
    }
    setHidden(closed || new Date().toISOString().slice(0, 10) > UNTIL);
  }, []);
  if (hidden) return null;

  return (
    <div className="green-ribbon relative overflow-hidden text-white">
      <span aria-hidden className="strip-shine" />
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-brand-500" />
      <div className="container-wide flex items-center gap-3 py-2.5 pr-10 sm:gap-4 sm:py-3">
        {/* A graduate in cap and gown: where the training leads. */}
        <span className="relative block h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-[#fcdc04] sm:h-14 sm:w-14">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/people/graduate.webp" alt="An Online Tech Uganda graduate in cap and gown" width={56} height={56} className="h-full w-full object-cover" />
        </span>
        <Link href="/apply" className="min-w-0 flex-1">
          <span className="block text-[10px] font-black uppercase leading-none tracking-[0.2em] text-[#fcdc04] sm:text-[11px]">
            <span className="sm:hidden">Nov – Dec internship · all levels</span>
            <span className="hidden sm:inline">Nov – Dec internship · university students, every level · non-students welcome</span>
          </span>
          <span className="mt-1 block font-display text-[17px] font-semibold leading-tight sm:text-[22px]">
            <span className="sm:hidden">Internship begins Monday 2 November</span>
            <span className="hidden sm:inline">Industrial training & internship begins Monday 2 November</span>
          </span>
          <span className="mt-0.5 hidden text-[11.5px] leading-snug text-white/85 sm:block sm:text-[13px]">
            7 weeks · online · classes 9:00 am – 12:00 pm, 3–4 days a week · UGX 150,000
          </span>
        </Link>
        <Link
          href="/apply"
          className="strip-spring shrink-0 bg-brand-500 px-3.5 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-brand-600 sm:px-6 sm:py-3 sm:text-[12px]"
        >
          Apply
        </Link>
      </div>
      <button
        onClick={() => {
          setHidden(true);
          try {
            sessionStorage.setItem(CLOSED, "1");
          } catch {
            /* it is closed for this page at least */
          }
        }}
        aria-label="Close this announcement"
        className="absolute right-1.5 top-1.5 rounded-full p-1.5 text-white/70 hover:bg-white/15 hover:text-white"
      >
        <X size={15} />
      </button>
    </div>
  );
}
