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
 *
 * The plugins below only understand flat CSS. A production build hands them
 * that, because Tailwind lowers its nested rules as part of optimising. In
 * `next dev` it does not, so every responsive utility arrived still nested —
 *
 *   .lg\:hidden { @media (width >= 64rem) { display: none } }
 *
 * — and the layer pass dropped it. The live site was fine while the same code
 * on a developer's machine showed the phone layout at every width. Asking
 * Tailwind to optimise in development too (without minifying, so the output
 * stays readable) gives both the same input.
 */
const dev = process.env.NODE_ENV !== "production";

const config = {
  plugins: {
    "@tailwindcss/postcss": dev ? { optimize: { minify: false } } : {},
    "@csstools/postcss-color-mix-function": { preserve: false },
    "@csstools/postcss-oklab-function": { preserve: false },
    "postcss-lab-function": { preserve: false },
    // Last, because it rewrites selectors to reproduce the layer ordering
    // through specificity, and it should see the finished rules.
    "@csstools/postcss-cascade-layers": {},
  },
};

export default config;
