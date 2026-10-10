// Where a customer wants their order brought, as a pin on the map, and what
// it costs to take it there. The distance is measured along the road by the
// API, which is also what charges it — so the fee shown is the fee paid.

/** The shop: Mabirizi Complex, Kampala. Distances are measured from here. */
export const SHOP_POINT = { lat: 0.3153705, lng: 32.5777552 };

export type DeliveryPlace = {
  lat: number;
  lng: number;
  /** What the customer sees their pin called: "Ntinda, Kampala". */
  label: string;
  km: number;
  fee: number;
  /** False when the road could not be measured and the distance is an estimate. */
  byRoad: boolean;
};

const KEY = "otu_place";
const CHANGED = "otu-place-changed";

export function loadPlace(): DeliveryPlace | null {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || "null");
    return p && typeof p.lat === "number" && typeof p.lng === "number" && typeof p.fee === "number" ? p : null;
  } catch {
    return null;
  }
}

export function savePlace(p: DeliveryPlace | null) {
  try {
    if (p) localStorage.setItem(KEY, JSON.stringify(p));
    else localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(CHANGED));
  } catch {
    /* storage blocked — the place lasts for this page only */
  }
}

/** Run `fn` whenever the saved place changes, on this page or another tab. */
export function onPlaceChange(fn: () => void): () => void {
  window.addEventListener(CHANGED, fn);
  window.addEventListener("storage", fn);
  return () => {
    window.removeEventListener(CHANGED, fn);
    window.removeEventListener("storage", fn);
  };
}

/** Road distance from the shop to a point, and the transport fee for it. */
export async function quotePlace(lat: number, lng: number): Promise<{ km: number; fee: number; byRoad: boolean }> {
  const res = await fetch(`/_api/orders/delivery-quote?lat=${lat.toFixed(6)}&lng=${lng.toFixed(6)}`);
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.detail || "We could not measure the distance to that place.");
  }
  const d = await res.json();
  return { km: d.km, fee: d.fee, byRoad: !!d.by_road };
}

type Found = { lat: number; lng: number; label: string };

const shortName = (a: Record<string, string> | undefined, fallback: string) => {
  if (!a) return fallback;
  const near = a.neighbourhood || a.suburb || a.village || a.hamlet || a.quarter || a.road || a.town;
  const town = a.city || a.town || a.municipality || a.county || a.state_district || a.state;
  return [near, town].filter((x, i, all) => x && all.indexOf(x) === i).join(", ") || fallback;
};

/** Places in Uganda matching what the customer typed. */
export async function searchPlaces(q: string): Promise<Found[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=ug&limit=5&q=${encodeURIComponent(q)}`,
  );
  if (!res.ok) return [];
  const rows: { lat: string; lon: string; display_name: string; address?: Record<string, string> }[] = await res.json();
  return rows.map((r) => ({
    lat: Number(r.lat),
    lng: Number(r.lon),
    label: r.display_name.split(",").slice(0, 3).join(",").trim() || shortName(r.address, q),
  }));
}

/** A name for a pin: the neighbourhood and town it is in. */
export async function namePlace(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=16&lat=${lat}&lon=${lng}`);
    if (!res.ok) return "Pinned location";
    const d = await res.json();
    return shortName(d.address, "Pinned location");
  } catch {
    return "Pinned location";
  }
}
