// Distance-based delivery (transport) cost, measured from the shop at
// Liberty Tower, Kampala Road. Distances are road-km to each town.
// (A live Google Maps Distance Matrix upgrade can replace this table later.)

export const STORE_LOCATION = "Liberty Tower, Kampala Road, Kampala";

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

export const FREE_DELIVERY_THRESHOLD = 3_000_000;

// Tiered transport cost by road distance.
export function feeForKm(km: number): number {
  if (km <= 25) return 10_000; // Kampala metro
  if (km <= 80) return 20_000; // near towns
  if (km <= 200) return 35_000; // mid distance
  if (km <= 350) return 55_000; // far
  return 75_000; // very far
}

export function estimateDelivery(
  town: string,
  subtotal: number,
): { fee: number; km: number | null } {
  const km = TOWN_DISTANCE_KM[town] ?? null;
  // Unknown town → assume mid-distance upcountry.
  const distance = km ?? 150;
  let fee = feeForKm(distance);
  // Free delivery within the Kampala metro for big orders.
  if (subtotal >= FREE_DELIVERY_THRESHOLD && distance <= 25) fee = 0;
  return { fee, km };
}
