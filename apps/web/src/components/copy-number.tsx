"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Copies the number to pay to, so it can be pasted into the Airtel Money app. */
export function CopyNumber({ number }: { number: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(number.replace(/\s/g, ""));
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          /* no clipboard — the number is on the page to read */
        }
      }}
      className="mt-4 inline-flex items-center gap-2 border border-white/40 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-ink-900"
    >
      {done ? <Check size={14} /> : <Copy size={14} />} {done ? "Number copied" : "Copy the number"}
    </button>
  );
}
