"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Customer reviews, waiting to be read.
 *
 * A review reaches the shop only after it is approved here. Each one names the
 * order it came from, so before approving you can check that the person
 * really bought the thing they are describing.
 */

type Review = {
  id: number;
  name: string;
  rating: number;
  comment: string;
  product_slug: string;
  order_reference: string;
  status: "pending" | "approved";
  created_at: string;
};

const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);
const when = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await fetch("/api/reviews", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setReviews(await res.json());
    } catch {
      setError("Couldn't load the reviews. Check the API is reachable.");
      setReviews([]);
    }
  }
  useEffect(() => {
    void load();
  }, []);

  async function approve(r: Review) {
    setBusy(r.id);
    const res = await fetch(`/api/reviews/${r.id}`, { method: "POST" });
    if (res.ok) setReviews((list) => (list ?? []).map((x) => (x.id === r.id ? { ...x, status: "approved" } : x)));
    setBusy(null);
  }

  async function remove(r: Review) {
    if (!confirm(`Delete this review by ${r.name}? This cannot be undone.`)) return;
    setBusy(r.id);
    const res = await fetch(`/api/reviews/${r.id}`, { method: "DELETE" });
    if (res.ok) setReviews((list) => (list ?? []).filter((x) => x.id !== r.id));
    setBusy(null);
  }

  const pending = (reviews ?? []).filter((r) => r.status === "pending");
  const approved = (reviews ?? []).filter((r) => r.status === "approved");

  const row = (r: Review) => (
    <li key={r.id} className="rounded-2xl border border-ink-600/10 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-base tracking-wide text-[#f68b1e]">{stars(r.rating)}</span>
        <span className="font-bold text-ink-700">{r.name}</span>
        <span className="text-xs text-ink-600/55">{when(r.created_at)}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide ${
            r.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
          }`}
        >
          {r.status === "pending" ? "Waiting" : "Public"}
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-600/65">
        On{" "}
        <Link href={`/products/${r.product_slug}`} className="font-semibold text-brand-600 hover:underline">
          {r.product_slug}
        </Link>{" "}
        · order{" "}
        <Link href={`/orders/${r.order_reference}`} className="font-mono font-semibold text-brand-600 hover:underline">
          {r.order_reference}
        </Link>
      </p>
      {r.comment ? (
        <p className="mt-2 text-sm leading-relaxed text-ink-700">{r.comment}</p>
      ) : (
        <p className="mt-2 text-sm italic text-ink-600/50">No comment — a rating only.</p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {r.status === "pending" && (
          <button
            onClick={() => approve(r)}
            disabled={busy === r.id}
            className="rounded-md bg-green-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50"
          >
            Approve — show on the shop
          </button>
        )}
        <button
          onClick={() => remove(r)}
          disabled={busy === r.id}
          className="rounded-md border border-red-200 px-4 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </li>
  );

  return (
    <div className="max-w-3xl">
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold text-ink-600">Reviews</h1>
        <p className="text-sm text-ink-600/60">
          Customers review products from their own orders. Nothing appears on the shop until you approve it.
        </p>
      </header>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {reviews === null ? (
        <p className="text-sm text-ink-600/60">Loading…</p>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-600/20 bg-white p-8 text-center text-sm text-ink-600/60">
          No reviews yet. They arrive here when a customer reviews a product from the product&apos;s page on the shop.
        </div>
      ) : (
        <>
          <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-ink-600">
            Waiting for you ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <p className="mb-6 rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-600/65">Nothing waiting.</p>
          ) : (
            <ul className="mb-6 space-y-3">{pending.map(row)}</ul>
          )}

          <h2 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-ink-600">
            On the shop ({approved.length})
          </h2>
          {approved.length === 0 ? (
            <p className="rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-600/65">None approved yet.</p>
          ) : (
            <ul className="space-y-3">{approved.map(row)}</ul>
          )}
        </>
      )}
    </div>
  );
}
