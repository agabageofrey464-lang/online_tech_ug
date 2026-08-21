"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

// Jumia-style "back to top" — a circular button that appears once you scroll
// down and smoothly returns to the top. Sits above the WhatsApp float button.
export function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-36 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border-2 border-brand-500 bg-white text-ink-800 shadow-lg transition-all hover:bg-brand-50 sm:right-5 md:bottom-20 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ChevronUp size={22} strokeWidth={2.5} />
    </button>
  );
}
