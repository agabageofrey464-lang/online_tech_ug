"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Star } from "lucide-react";
import { refreshRatings } from "@/components/product-rating";

type Review = { id: number; name: string; rating: number; comment: string; created_at: string };

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={n <= Math.round(value) ? "fill-[#f68b1e] text-[#f68b1e]" : "text-ink-600/20"} />
      ))}
    </span>
  );
}

/**
 * What customers have said about a product, and the form to add to it.
 *
 * A review needs the number of an order that contained the product, which is
 * what lets every one of them be marked a verified purchase truthfully. They
 * appear once we have read them, so a spam post or a competitor's one-star
 * never reaches the page. A product nobody has reviewed says so plainly.
 */
export function ProductReviews({ slug, productName }: { slug: string; productName: string }) {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", order_reference: "", rating: 0, comment: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let alive = true;
    fetch(`/_api/reviews?product=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => alive && setReviews(Array.isArray(rows) ? rows : []))
      .catch(() => alive && setReviews([]));
    return () => {
      alive = false;
    };
  }, [slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.rating === 0) {
      setState("error");
      setMsg("Tap a star to give your rating.");
      return;
    }
    setState("sending");
    setMsg("");
    try {
      const res = await fetch("/_api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, product_slug: slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setState("sent");
        refreshRatings();
      } else {
        setState("error");
        setMsg(typeof data.detail === "string" ? data.detail : "We couldn't save your review. Please check the details and try again.");
      }
    } catch {
      setState("error");
      setMsg("Network problem — please try again.");
    }
  }

  const count = reviews?.length ?? 0;
  const average = count ? reviews!.reduce((a, r) => a + r.rating, 0) / count : 0;
  const input =
    "w-full rounded-lg border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <section id="reviews" className="mt-10 scroll-mt-28 rounded-card border border-ink-600/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-ink-900">Customer reviews</h2>
          {count > 0 ? (
            <p className="mt-1 flex items-center gap-2 text-sm text-ink-700/75">
              <Stars value={average} />
              <b className="text-ink-900">{average.toFixed(1)}</b> from {count} verified {count === 1 ? "purchase" : "purchases"}
            </p>
          ) : (
            <p className="mt-1 text-sm text-ink-700/65">
              {reviews === null ? "Loading…" : "No reviews yet. If you bought this from us, yours would be the first."}
            </p>
          )}
        </div>
        {state !== "sent" && (
          <button
            onClick={() => setOpen((v) => !v)}
            className="press rounded-full border-2 border-brand-500 px-4 py-2 text-sm font-bold text-brand-600 transition hover:bg-brand-50"
          >
            {open ? "Close" : "Write a review"}
          </button>
        )}
      </div>

      {state === "sent" && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          Thank you. Your review has reached us and will appear here once we have read it.
        </p>
      )}

      {open && state !== "sent" && (
        <form onSubmit={submit} className="mt-4 grid gap-3 rounded-lg bg-ink-50/60 p-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="text-sm font-bold text-ink-900">Your rating for {productName}</p>
            <div className="mt-1.5 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, rating: n })}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  className="rounded p-1 transition hover:scale-110"
                >
                  <Star size={28} className={n <= form.rating ? "fill-[#f68b1e] text-[#f68b1e]" : "text-ink-600/25"} />
                </button>
              ))}
            </div>
          </div>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-ink-800">Your name</span>
            <input required maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} placeholder="Shown as your first name only" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-ink-800">Order number</span>
            <input required maxLength={20} value={form.order_reference} onChange={(e) => setForm({ ...form, order_reference: e.target.value })} className={`${input} font-mono uppercase`} placeholder="e.g. OTU-AC4C98E1" />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-ink-800">What was it like? (optional)</span>
            <textarea rows={3} maxLength={1500} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} className={input} placeholder="How it has been to use, what you'd tell someone thinking of buying it" />
          </label>
          {state === "error" && <p className="text-sm font-semibold text-red-600 sm:col-span-2">{msg}</p>}
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <button type="submit" disabled={state === "sending"} className="press rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60">
              {state === "sending" ? "Sending…" : "Submit review"}
            </button>
            <p className="text-xs text-ink-700/60">
              The order number is on your confirmation. It proves the purchase and is never shown.
            </p>
          </div>
        </form>
      )}

      {count > 0 && (
        <ul className="mt-5 divide-y divide-ink-600/10">
          {reviews!.map((r) => (
            <li key={r.id} className="py-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Stars value={r.rating} size={14} />
                <span className="text-sm font-bold text-ink-900">{r.name}</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                  <BadgeCheck size={13} /> Verified purchase
                </span>
                <span className="text-xs text-ink-700/50">
                  {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              {r.comment && <p className="mt-1.5 text-sm leading-relaxed text-ink-700/85">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
