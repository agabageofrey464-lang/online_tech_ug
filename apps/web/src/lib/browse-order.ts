import type { Product } from "@/lib/data";
/**
 * The order the categories arrive in. Phones lead, ahead of the computers.
 */
export const CATEGORY_ORDER: Product["category"][] = [
  "Phones", "Laptops", "Desktops", "Components", "Storage", "Power", "Accessories", "Networking",
];

/** Everything in stock, category by category, newest first within each. */
export function byCategory<T extends { category: Product["category"] }>(newestLast: T[]): T[] {
  return CATEGORY_ORDER.flatMap((c) => newestLast.filter((p) => p.category === c).reverse());
}

/**
 * The order products arrive in as a page is scrolled: phones first, then the
 * three computer brands most people ask for by name, then everything else by
 * what it is.
 *
 * A group is a brand (for a Lenovo, HP or Dell computer) or a category (for
 * the rest), so every product lands in exactly one.
 */
export const LEAD_BRANDS = ["Lenovo", "HP", "Dell"];
export const GROUP_ORDER: string[] = ["Phones", ...LEAD_BRANDS, "Laptops", "Desktops", "Components", "Storage", "Power", "Accessories", "Networking"];

export function groupOf(p: { brand: string; category: string }): string {
  if (p.category === "Phones") return "Phones";
  const lead = LEAD_BRANDS.find((b) => b.toLowerCase() === (p.brand ?? "").toLowerCase());
  return lead && (p.category === "Laptops" || p.category === "Desktops") ? lead : p.category;
}

/** Where a group's "see all" link goes. */
export function groupHref(group: string): string {
  return LEAD_BRANDS.includes(group) ? `/shop?brand=${encodeURIComponent(group)}` : `/shop?cat=${encodeURIComponent(group)}`;
}

/** The heading a group is shown under. */
export function groupTitle(group: string): string {
  return LEAD_BRANDS.includes(group) ? `${group} Computers` : group === "Laptops" ? "More Laptops" : group === "Desktops" ? "More Desktops" : group;
}

/** Everything, group by group, newest first within each. */
export function byGroup<T extends { brand: string; category: string }>(newestLast: T[]): T[] {
  const rank = (p: T) => {
    const i = GROUP_ORDER.indexOf(groupOf(p));
    return i === -1 ? GROUP_ORDER.length : i;
  };
  return [...newestLast].reverse().sort((a, b) => rank(a) - rank(b));
}
