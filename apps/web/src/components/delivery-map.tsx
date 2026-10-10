"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import { LocateFixed, Search } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { SHOP_POINT, namePlace, quotePlace, searchPlaces, type DeliveryPlace } from "@/lib/delivery-place";
import { ugx } from "@/lib/site";

const pin = (colour: string, letter = "") =>
  `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:${colour};transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);color:#fff;font:700 11px/1 Inter,sans-serif">${letter}</span></div>`;

/**
 * The customer shows us where they are, and the transport fee follows.
 *
 * Three ways to say where: let the phone give its position, type the name of
 * a place, or touch the map and drag the pin to the gate. Each one ends the
 * same way — the road distance from the shop is measured and the fee worked
 * out from it. Nothing is charged for a town's name; it is the kilometres.
 */
export function DeliveryMap({ value, onChange }: { value: DeliveryPlace | null; onChange: (p: DeliveryPlace) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const marker = useRef<Marker | null>(null);
  const first = useRef(value);
  const [q, setQ] = useState("");
  const [found, setFound] = useState<{ lat: number; lng: number; label: string }[]>([]);
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");

  // Measure a point and hand it up. `label` is given when the customer chose
  // a named place; a touched or dragged pin is named from the map.
  const settle = useCallback(
    async (lat: number, lng: number, label?: string) => {
      setBusy("Measuring the road from our shop…");
      setNote("");
      try {
        const [quote, name] = await Promise.all([quotePlace(lat, lng), label ? Promise.resolve(label) : namePlace(lat, lng)]);
        onChange({ lat, lng, label: name, ...quote });
      } catch (e) {
        setNote(e instanceof Error ? e.message : "We could not measure the distance to that place.");
      } finally {
        setBusy("");
      }
    },
    [onChange],
  );
  const settleRef = useRef(settle);
  settleRef.current = settle;

  const place = useCallback((lat: number, lng: number, zoom?: number) => {
    marker.current?.setLatLng([lat, lng]).setOpacity(1);
    if (map.current) map.current.setView([lat, lng], zoom ?? Math.max(map.current.getZoom(), 14));
  }, []);

  useEffect(() => {
    let gone = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (gone || !box.current || map.current) return;
      const start = first.current;
      const m = L.map(box.current, { scrollWheelZoom: false }).setView(start ? [start.lat, start.lng] : [SHOP_POINT.lat, SHOP_POINT.lng], start ? 14 : 11);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(m);
      L.marker([SHOP_POINT.lat, SHOP_POINT.lng], {
        icon: L.divIcon({ html: pin("#16151d", "S"), className: "", iconSize: [26, 26], iconAnchor: [13, 26] }),
        interactive: false,
        keyboard: false,
      }).addTo(m);
      const mk = L.marker(start ? [start.lat, start.lng] : [SHOP_POINT.lat, SHOP_POINT.lng], {
        icon: L.divIcon({ html: pin("#f15a29"), className: "", iconSize: [26, 26], iconAnchor: [13, 26] }),
        draggable: true,
        opacity: start ? 1 : 0,
      }).addTo(m);
      mk.on("dragend", () => {
        const p = mk.getLatLng();
        settleRef.current(p.lat, p.lng);
      });
      m.on("click", (e) => {
        mk.setLatLng(e.latlng).setOpacity(1);
        settleRef.current(e.latlng.lat, e.latlng.lng);
      });
      map.current = m;
      marker.current = mk;
    })();
    return () => {
      gone = true;
      map.current?.remove();
      map.current = null;
      marker.current = null;
    };
  }, []);

  function useMine() {
    if (!navigator.geolocation) {
      setNote("This device cannot give its location. Type your area, or touch the map where you are.");
      return;
    }
    setBusy("Finding where you are…");
    setNote("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        place(pos.coords.latitude, pos.coords.longitude, 16);
        settle(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setBusy("");
        setNote("We were not allowed to see your location. Type your area, or touch the map where you are.");
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    if (q.trim().length < 3) return;
    setBusy("Searching…");
    setNote("");
    try {
      const rows = await searchPlaces(q.trim());
      setFound(rows);
      if (rows.length === 0) setNote("We could not find that place. Try the nearest town or trading centre, or touch the map.");
    } catch {
      setNote("The search is not answering. Touch the map where you are instead.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={useMine}
          className="flex shrink-0 items-center justify-center gap-2 bg-brand-500 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-brand-600"
        >
          <LocateFixed size={15} /> Use my location
        </button>
        {/* Not a <form>: at checkout this sits inside the order form. */}
        <div className="flex min-w-0 flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                search();
              }
            }}
            placeholder="Or type your area — e.g. Ntinda, Gayaza, Mbale"
            aria-label="Search for your area"
            className="min-w-0 flex-1 border border-ink-600/25 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-ink-900 focus:outline-none"
          />
          <button type="button" onClick={() => search()} aria-label="Search" className="shrink-0 bg-ink-800 px-3.5 text-white hover:bg-ink-900">
            <Search size={16} />
          </button>
        </div>
      </div>

      {found.length > 0 && (
        <ul className="mt-2 divide-y divide-ink-600/10 border border-ink-600/15 bg-white">
          {found.map((f) => (
            <li key={`${f.lat},${f.lng}`}>
              <button
                type="button"
                onClick={() => {
                  setFound([]);
                  setQ("");
                  place(f.lat, f.lng, 15);
                  settle(f.lat, f.lng, f.label);
                }}
                className="block w-full px-3 py-2.5 text-left text-[13px] text-ink-800 hover:bg-[#f0ede6]"
              >
                {f.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div ref={box} className="relative z-0 mt-2 h-64 w-full bg-[#e8e4dc] sm:h-72" aria-label="Map — touch where you want your order delivered" />
      <p className="mt-1.5 text-[11.5px] text-ink-700/65">
        Touch the map where you are, then drag the orange pin to the exact spot. <b className="text-ink-900">S</b> is our shop.
      </p>

      {busy && <p className="mt-2 text-[13px] font-semibold text-ink-800">{busy}</p>}
      {note && <p className="mt-2 text-[13px] font-semibold text-brand-700">{note}</p>}
      {value && !busy && (
        <p className="mt-2 border-l-4 border-brand-500 bg-[#f0ede6] px-3 py-2.5 text-[13.5px] text-ink-800">
          <b className="text-ink-900">{value.label}</b> — {value.km} km {value.byRoad ? "by road" : "(estimated)"} from our shop. Transport{" "}
          <b className="text-brand-600">{ugx(value.fee)}</b>.
        </p>
      )}
    </div>
  );
}
