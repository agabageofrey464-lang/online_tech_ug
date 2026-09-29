"use client";

import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Shows its children only on the unfiltered shop.
 *
 * Featured products belong at the top of "everything we sell". Above a list
 * someone has narrowed to Phones they are just laptops in the way, which is
 * what happened when the filter check moved to the browser and this did not
 * move with it.
 */
export function UnfilteredOnly({ children }: { children: ReactNode }) {
  const p = useSearchParams();
  const filtered = Boolean(
    p.get("q") || p.get("brand") || p.get("cat") || p.get("deals") || p.get("sort") === "new",
  );
  return filtered ? null : <>{children}</>;
}
