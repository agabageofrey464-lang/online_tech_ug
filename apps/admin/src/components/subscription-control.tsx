"use client";

import { useState } from "react";

/** Shows a listing's subscription status + quick extend buttons (paid = activate). */
export function SubscriptionControl({
  kind,
  id,
  ends,
  onChange,
}: {
  kind: "vendor" | "freelancer" | "advert";
  id: number;
  ends: string | null;
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
      {[
        { d: 7, l: "+1wk" },
        { d: 30, l: "+1mo" },
        { d: 365, l: "+1yr" },
      ].map((o) => (
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
