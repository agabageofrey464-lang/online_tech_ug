"use client";

import { useEffect, useState } from "react";
import { MapPin, Truck } from "lucide-react";
import { DELIVERY_TOWNS, estimateDelivery, estimatedDeliveryDate, formatDeliveryDate } from "@/lib/delivery";
import { ugx } from "@/lib/site";

const KEY = "otu_town";

/**
 * "How much to deliver this to me, and when?" — answered on the product page.
 *
 * The page said "Choose your location" over a line of fixed text; there was
 * nothing to choose. A customer upcountry found out what delivery cost at
 * checkout, after filling in the form. This is the same fee table checkout
 * and the server charge from, so the figure here is the figure they will pay.
 * The town is remembered, so it only has to be picked once.
 */
export function DeliveryCheck() {
  const [town, setTown] = useState("Kampala");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && DELIVERY_TOWNS.includes(saved)) setTown(saved);
    } catch {
      /* storage blocked — Kampala stands */
    }
  }, []);

  function choose(t: string) {
    setTown(t);
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* ignore */
    }
  }

  const { fee } = estimateDelivery(town);
  const arrives = formatDeliveryDate(estimatedDeliveryDate(town));

  return (
    <>
      <div className="flex items-start gap-2.5 p-3">
        <MapPin size={20} className="mt-0.5 shrink-0 text-brand-600" />
        <div className="min-w-0 flex-1">
          <label htmlFor="delivery-town" className="font-bold text-ink-900">
            Deliver to
          </label>
          <select
            id="delivery-town"
            value={town}
            onChange={(e) => choose(e.target.value)}
            className="mt-1 w-full rounded-md border border-ink-600/20 bg-white px-2.5 py-2 text-sm font-semibold text-ink-900 focus:border-brand-500 focus:outline-none"
          >
            {DELIVERY_TOWNS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-start gap-2.5 p-3">
        <Truck size={20} className="mt-0.5 shrink-0 text-brand-600" />
        <div>
          <p className="font-bold text-ink-900">
            Door delivery: <span className="text-brand-600">{ugx(fee)}</span>
          </p>
          <p className="mt-0.5 text-xs text-ink-700/70">
            Arrives by <b className="text-ink-900">{arrives}</b> if you order today. Town not listed? Ask us on WhatsApp.
          </p>
        </div>
      </div>
    </>
  );
}
