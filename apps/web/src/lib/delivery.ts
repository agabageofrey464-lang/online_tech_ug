// Distance-based delivery (transport) cost, measured from the shop in
// Kampala. Distances are road-km to each town.
// (A live Google Maps Distance Matrix upgrade can replace this table later.)

export const STORE_LOCATION = "Kampala, Uganda";

export const TOWN_DISTANCE_KM: Record<string, number> = {
  Kampala: 0,
  Nansana: 12,
  Kira: 14,
  Wakiso: 20,
  Mukono: 22,
  Entebbe: 37,
  Lugazi: 45,
  Mityana: 60,
  Njeru: 75,
  Jinja: 80,
  Iganga: 115,
  Masaka: 130,
  Mubende: 150,
  Busia: 195,
  Hoima: 200,
  Tororo: 220,
  Mbale: 230,
  Mbarara: 270,
  Soroti: 290,
  "Fort Portal": 300,
  Gulu: 330,
  Lira: 340,
  Kasese: 350,
  Kabale: 410,
  Arua: 480,
};

export const DELIVERY_TOWNS = Object.keys(TOWN_DISTANCE_KM);

// Transport cost, worked out from the road distance: a base charge that
// covers the first ten kilometres, then a rate for each kilometre after,
// rounded to the nearest thousand shillings. It was five fixed bands, so
// Jinja (80 km) and a town 26 km away were charged the same.
//
// The same three figures are in the API (services/orders.py), which is what
// the customer is actually charged — change them together.
export const DELIVERY_BASE = 10_000;
export const DELIVERY_BASE_KM = 10;
export const DELIVERY_PER_KM = 150;

export function feeForKm(km: number): number {
  const beyond = Math.max(0, km - DELIVERY_BASE_KM);
  return Math.round((DELIVERY_BASE + beyond * DELIVERY_PER_KM) / 1000) * 1000;
}

export function estimateDelivery(town: string): { fee: number; km: number | null } {
  const km = TOWN_DISTANCE_KM[town] ?? null;
  // Unknown town → assume mid-distance upcountry.
  const distance = km ?? 150;
  // Delivery is always charged by distance — no free delivery.
  return { fee: feeForKm(distance), km };
}

// Estimated delivery time in days by distance — 2 days base, longer upcountry.
export function deliveryDays(km: number | null): number {
  const d = km ?? 150;
  if (d <= 80) return 2; // Kampala metro & near towns
  if (d <= 200) return 3; // mid-distance
  if (d <= 350) return 4; // far
  return 5; // very far
}

// The date an order placed now should arrive at `town`.
export function estimatedDeliveryDate(town: string, from: Date = new Date()): Date {
  const km = TOWN_DISTANCE_KM[town] ?? null;
  const d = new Date(from);
  d.setDate(d.getDate() + deliveryDays(km));
  return d;
}

export function formatDeliveryDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}
