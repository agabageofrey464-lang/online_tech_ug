"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { MapPin, Truck } from "lucide-react";
import { DELIVERY_BASE, DELIVERY_BASE_KM, DELIVERY_PER_KM, arrivalText } from "@/lib/delivery";
import { loadPlace, onPlaceChange, savePlace, type DeliveryPlace } from "@/lib/delivery-place";
import { ugx } from "@/lib/site";

const DeliveryMap = dynamic(() => import("@/components/delivery-map").then((m) => m.DeliveryMap), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse bg-[#e8e4dc]" />,
});

/**
 * "How much to deliver this to me, and when?" — answered on the product page.
 *
 * It used to show one fixed figure until a town was picked from a list, and a
 * customer between two towns paid for the further one. Now there is no figure
 * until they show us where they are: they mark the place on a map, the road
 * from the shop is measured, and the fee is worked out from the kilometres.
 * The place is remembered, so checkout opens with the same pin and the same fee.
 */
export function DeliveryCheck() {
  const [place, setPlace] = useState<DeliveryPlace | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const read = () => setPlace(loadPlace());
    read();
    return onPlaceChange(read);
  }, []);

  // Worked out after the page is in the browser: the server's "now" is not the customer's.
  const [arrives, setArrives] = useState("");
  useEffect(() => setArrives(arrivalText()), []);

  return (
    <>
      <div className="flex items-start gap-2.5 p-4">
        <MapPin size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-700" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink-900">Deliver to</p>
          <p className="mt-0.5 text-[13px] text-ink-700/80">{place ? place.label : "Show us where you are and we will work out the transport."}</p>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className={
              place
                ? "mt-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-ink-800 underline-offset-4 hover:underline"
                : "mt-3 bg-brand-500 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-brand-600"
            }
          >
            {open ? "Close the map" : place ? "Change location" : "Set my location on the map"}
          </button>
        </div>
      </div>

      {open && (
        <div className="p-4">
          <DeliveryMap
            value={place}
            onChange={(p) => {
              setPlace(p);
              savePlace(p);
            }}
          />
        </div>
      )}

      <div className="flex items-start gap-2.5 p-4">
        <Truck size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-700" />
        {place ? (
          <div>
            <p className="font-semibold text-ink-900">
              Door delivery: <span className="text-brand-600">{ugx(place.fee)}</span>
            </p>
            <p className="mt-0.5 text-xs text-ink-700/70">
              {place.km} km {place.byRoad ? "by road" : "(estimated)"} from our shop. Order now and it arrives <b className="text-ink-900">{arrives}</b>.
            </p>
          </div>
        ) : (
          <div>
            <p className="font-semibold text-ink-900">Door delivery, by distance</p>
            <p className="mt-0.5 text-xs text-ink-700/70">
              {ugx(DELIVERY_BASE)} covers the first {DELIVERY_BASE_KM} km from our shop, then {ugx(DELIVERY_PER_KM)} for each kilometre after. Set your
              location to see your fee. Order before 7pm and it reaches you the same day; after 7pm, the next day.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
