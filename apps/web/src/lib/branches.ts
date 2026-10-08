/**
 * The buildings we trade from. `focus` says which part of the photograph to
 * keep when a tile crops it — the Stagyon sign sits to the left of its picture —
 * and `label` what the photograph is of, so an interior is not called a doorway. `map` is what a maps search is given; floor and
 * shop numbers are left out until the owner supplies them, rather than guessed.
 */
export const BRANCHES = [
  { name: "Stagyon", photo: "/branches/stagyon.webp", focus: "object-left", label: "Building entrance", map: "Stagyon Business Enterprises Kampala" },
  { name: "Ivory Plaza", photo: "/branches/ivory-plaza.webp", focus: "object-bottom", label: "Inside the shop", map: "Ivory Plaza Kampala" },
  { name: "E-Tower", photo: "/branches/e-tower.webp", focus: "object-top", label: "Building entrance", map: "E-Tower Kampala Road Kampala" },
] as const;

export const directionsTo = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
