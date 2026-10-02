/**
 * Tailwind, then a pass that makes its output readable by older phones.
 *
 * Tailwind v4 emits CSS for Chrome 111+, Safari 16.4+ and Firefox 128+, and
 * it puts *everything* — the theme, the reset and every utility class — inside
 * cascade layers:
 *
 *   @layer properties { @layer theme { @layer base { @layer utilities { …
 *
 * A browser that does not know `@layer` does not apply part of that. It throws
 * the whole block away, so the page arrives as raw HTML with no styling at all.
 * That is what visitors were reporting on older Android phones and on data
 * saver browsers such as Opera Mini, which are common in Uganda.
 *
 * So the layers are flattened back into ordinary rules, and the modern colour
 * functions — 300 uses of color-mix(), 29 of oklch() — are resolved to plain
 * values. `preserve: false` drops the modern form rather than keeping both,
 * since the point is a stylesheet an old parser can read end to end.
 *
 * These run after Tailwind, on its generated CSS. Nothing in the source
 * changes: the design, the tokens in globals.css and the class names are
 * untouched.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "@csstools/postcss-color-mix-function": { preserve: false },
    "@csstools/postcss-oklab-function": { preserve: false },
    "postcss-lab-function": { preserve: false },
    // Last, because it rewrites selectors to reproduce the layer ordering
    // through specificity, and it should see the finished rules.
    "@csstools/postcss-cascade-layers": {},
  },
};

export default config;
