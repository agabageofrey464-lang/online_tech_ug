"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

/**
 * A row that slides sideways, with a thin line beneath that fills as it is
 * scrolled and a pair of long arrows at the end — as the finer home stores
 * draw their rails.
 */
export function ProgressRail({ children, className = "" }: { children: ReactNode; className?: string }) {
  const row = useRef<HTMLDivElement | null>(null);
  const [part, setPart] = useState({ left: 0, width: 0.25 });

  const measure = () => {
    const el = row.current;
    if (!el) return;
    const width = el.scrollWidth > 0 ? Math.min(1, el.clientWidth / el.scrollWidth) : 1;
    const room = el.scrollWidth - el.clientWidth;
    setPart({ left: room > 0 ? (el.scrollLeft / room) * (1 - width) : 0, width });
  };
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const slide = (dir: 1 | -1) => row.current?.scrollBy({ left: dir * row.current.clientWidth * 0.75, behavior: "smooth" });

  return (
    <div className={className}>
      <div ref={row} onScroll={measure} className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:px-0">
        {children}
      </div>
      <div className="mt-6 flex items-center gap-6">
        <div className="relative h-px flex-1 bg-ink-700/20">
          <span className="absolute -top-px h-[3px] bg-ink-900 transition-all duration-300" style={{ left: `${part.left * 100}%`, width: `${part.width * 100}%` }} />
        </div>
        <div className="flex shrink-0 items-center gap-4 text-ink-900">
          <button type="button" aria-label="Back" onClick={() => slide(-1)} className="transition hover:text-brand-600 disabled:opacity-30" disabled={part.left <= 0.001}>
            <ArrowLeft size={26} strokeWidth={1.1} />
          </button>
          <button type="button" aria-label="More" onClick={() => slide(1)} className="transition hover:text-brand-600 disabled:opacity-30" disabled={part.left + part.width >= 0.999}>
            <ArrowRight size={26} strokeWidth={1.1} />
          </button>
        </div>
      </div>
    </div>
  );
}
