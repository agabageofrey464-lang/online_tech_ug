/**
 * The site's three colours besides white: indigo, orange and sand (with teal for the academy).
 *
 * Campaigns and adverts are stored with a background colour of their own,
 * chosen when the palette was wider. Rather than rewrite stored records, a
 * stored colour is drawn as the nearest of ours: warm colours become orange,
 * pale ones sand, everything else indigo.
 */
export const INDIGO = "#282363";
export const ORANGE = "#f15a29";
export const SAND = "#f3efe9";

export function onPalette(hex: string | null | undefined, fallback: string = INDIGO): string {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex ?? "").trim());
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  if (r + g + b > 600) return SAND;
  if (r > 150 && r > b + 50 && r > g + 20) return ORANGE;
  return INDIGO;
}
