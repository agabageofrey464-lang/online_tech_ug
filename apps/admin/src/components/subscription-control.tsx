"use client";

import { useState } from "react";

/** Shows a listing's subscription status + quick extend buttons (paid = activate). */
export function SubscriptionControl({
  kind,
  id,
  ends,
  grace = false,
  onChange,
}: {
  kind: "vendor" | "freelancer" | "advert";
  id: number;
  ends: string | null;
  /** A vendor on the free month given after a paid period with no sale. */
  grace?: boolean;
  onChange: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function extend(days: number) {
    setBusy(true);
    try {
      await fetch("/api/subscriptions/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, id, days }),
      });
      onChange();
    } finally {
      setBusy(false);
    }
  }

  const date = ends ? new Date(ends) : null;
  const expired = date ? date < new Date() : false;
  const label = date
    ? `${expired ? "⛔ Expired" : "⏳ Ends"} ${date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
    : "No subscription set";

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className={expired ? "font-semibold text-red-600" : date ? "text-ink-600/70" : "text-ink-600/40"}>{label}</span>
      <span className="text-ink-600/40">·</span>
      {grace && !expired && (
        <span className="rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-800" title="Nothing sold in the period they paid for, so their products stay one more month at no charge.">
          Free month — no sale
        </span>
      )}
      {(kind === "vendor"
        ? [
            // What a vendor pays: a month, half a year, a year.
            { d: 30, l: "Paid 50k · 1 month" },
            { d: 182, l: "Paid 300k · 6 months" },
            { d: 365, l: "Paid 600k · 1 year" },
          ]
        : [
            { d: 7, l: "+1wk" },
            { d: 30, l: "+1mo" },
            { d: 365, l: "+1yr" },
          ]
      ).map((o) => (
        <button
          key={o.d}
          disabled={busy}
          onClick={() => extend(o.d)}
          className="rounded border border-ink-600/20 px-2 py-0.5 font-semibold text-ink-600 hover:bg-ink-50 disabled:opacity-50"
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}
