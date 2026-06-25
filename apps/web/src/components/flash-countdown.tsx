"use client";

import { useEffect, useState } from "react";

// Counts down to the next midnight, like Jumia (Hh : Mm : Ss).
function nextMidnight() {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

export function FlashCountdown() {
  // null until mounted so SSR/CSR markup matches (avoids hydration mismatch).
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    let end = nextMidnight();
    const tick = () => {
      let rem = end - Date.now();
      if (rem <= 0) {
        end = nextMidnight();
        rem = end - Date.now();
      }
      setLeft(rem);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const total = left === null ? null : Math.max(0, Math.floor(left / 1000));
  const fmt = (n: number) => String(n).padStart(2, "0");
  const h = total === null ? "--" : fmt(Math.floor(total / 3600));
  const m = total === null ? "--" : fmt(Math.floor((total % 3600) / 60));
  const s = total === null ? "--" : fmt(total % 60);

  return (
    <span className="flex items-center gap-1.5 font-extrabold" suppressHydrationWarning>
      <span>{h}h</span>
      <span className="text-white/70">:</span>
      <span>{m}m</span>
      <span className="text-white/70">:</span>
      <span>{s}s</span>
    </span>
  );
}
