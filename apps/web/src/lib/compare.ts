// Products set side by side. Kept in the browser, so it follows a visitor
// from page to page without an account, and is theirs alone.

export type CompareItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  brand: string;
  condition: string;
  /** Label and value, in the order they are shown. */
  rows: [string, string][];
};

const KEY = "otu_compare";
const CHANGED = "otu-compare-changed";
/** Three fit side by side on a laptop and can still be read on a phone. */
export const COMPARE_MAX = 3;

export function compareList(): CompareItem[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(list) ? list.slice(0, COMPARE_MAX) : [];
  } catch {
    return [];
  }
}

function save(list: CompareItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, COMPARE_MAX)));
  } catch {
    /* storage blocked — nothing to carry */
  }
  window.dispatchEvent(new Event(CHANGED));
}

/** Add or remove. Returns "added", "removed", or "full" when three are already chosen. */
export function toggleCompare(item: CompareItem): "added" | "removed" | "full" {
  const list = compareList();
  if (list.some((x) => x.id === item.id)) {
    save(list.filter((x) => x.id !== item.id));
    return "removed";
  }
  if (list.length >= COMPARE_MAX) return "full";
  save([...list, item]);
  return "added";
}

export const removeCompare = (id: string) => save(compareList().filter((x) => x.id !== id));
export const clearCompare = () => save([]);

/** Run `fn` whenever the list changes, on this page or another tab. */
export function onCompareChange(fn: () => void): () => void {
  window.addEventListener(CHANGED, fn);
  window.addEventListener("storage", fn);
  return () => {
    window.removeEventListener(CHANGED, fn);
    window.removeEventListener("storage", fn);
  };
}
