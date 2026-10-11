/**
 * The buildings we trade from. `focus` says which part of the photograph to
 * keep when a tile crops it — the Stagyon sign sits to the left of its picture —
 * and `label` what the photograph is of, so an interior is not called a doorway. `map` is what a maps search is given. `where` is the
 * shop number and floor inside the building — given only where the owner has
 * supplied it, never guessed.
 */
export const BRANCHES = [
  { name: "Stagyon", photo: "/branches/stagyon.webp", focus: "object-left", label: "Building entrance", map: "Stagyon Business Enterprises Kampala", where: "" },
  { name: "Ivory Plaza", photo: "/branches/ivory-plaza.webp", focus: "object-bottom", label: "Inside the shop", map: "Ivory Plaza Kampala", where: "Shop B7, Ground Floor" },
  { name: "E-Tower", photo: "/branches/e-tower.webp", focus: "object-top", label: "Building entrance", map: "E-Tower Kampala Road Kampala", where: "" },
] as const;

export const directionsTo = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
