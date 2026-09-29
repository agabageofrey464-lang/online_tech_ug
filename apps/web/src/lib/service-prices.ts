/**
 * What a software job costs, in one place.
 *
 * These were scattered: the services list said a website started at 500,000,
 * the pricing page said 1,000,000, the development page said 2,500,000, and
 * the quotation we actually send said 2,500,000. Somebody could read the
 * cheapest figure, get in touch, and be quoted five times more — which loses
 * the job and makes us look like we were hiding something.
 *
 * Every figure below is the total of the matching template in the admin's
 * quotation presets, so the price on the site and the price in the written
 * quote are the same number. If a preset changes, change it here too.
 *
 * They are floors, not ceilings — a bigger job is quoted on its scope.
 */
export const SERVICE_FROM = {
  /** Up to ~8 pages, responsive, SEO set up, first year hosting. */
  website: 2_500_000,
  /** Catalogue, cart, Mobile Money and card checkout, admin dashboard. */
  ecommerce: 4_600_000,
  /** Android build, admin dashboard, Play Store submission and handover. */
  mobileApp: 4_500_000,
  /** School, POS, inventory, SACCO — discovery, build, reports, training. */
  managementSystem: 3_700_000,
  /** A working final-year system, documented, with a defence walkthrough. */
  studentProject: 900_000,
  /** Diagnosis is free; repairs start here. */
  repairs: 30_000,
} as const;
