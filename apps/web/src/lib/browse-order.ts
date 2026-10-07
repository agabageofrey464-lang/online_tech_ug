import type { Product } from "@/lib/data";
/**
 * The order the categories arrive in. Phones come last: the top of the home
 * page already lists every one of them.
 */
export const CATEGORY_ORDER: Product["category"][] = [
  "Laptops", "Desktops", "Components", "Storage", "Power", "Accessories", "Networking", "Phones",
];

/** Everything in stock, category by category, newest first within each. */
export function byCategory<T extends { category: Product["category"] }>(newestLast: T[]): T[] {
  return CATEGORY_ORDER.flatMap((c) => newestLast.filter((p) => p.category === c).reverse());
}
