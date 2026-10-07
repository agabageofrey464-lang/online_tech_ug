"use client";

import { useEffect } from "react";

/**
 * Brings the admin back to the row they were working on.
 *
 * Saving a product returned to the top of a list of two hundred, so pricing a
 * run of items meant scrolling down to find your place after every one. The
 * form now returns to "/products#p-<slug>", and this scrolls that row to the
 * middle of the screen and marks it for a moment so the eye finds it.
 */
export function ReturnToRow() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const row = document.getElementById(id);
    if (!row) return;
    row.scrollIntoView({ block: "center" });
    row.classList.add("bg-brand-50", "ring-2", "ring-inset", "ring-brand-400");
    const t = setTimeout(() => row.classList.remove("bg-brand-50", "ring-2", "ring-inset", "ring-brand-400"), 2600);
    return () => clearTimeout(t);
  }, []);
  return null;
}
