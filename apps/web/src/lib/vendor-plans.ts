/**
 * What a vendor pays to have their products listed. One place, so the Sell,
 * Pricing and Advertise pages and the vendor's own dashboard can never quote
 * different figures. The API holds the same three in services/subscriptions.py.
 *
 * The three are the same rate — UGX 50,000 a month — paid for one, six or
 * twelve months. Nothing is taken from a sale on any of them.
 */
export type VendorPlan = {
  id: "monthly" | "half-year" | "yearly";
  name: string;
  price: number;
  months: number;
  /** Days the owner's dashboard adds when this plan is paid. */
  days: number;
  period: string;
  line: string;
  featured?: boolean;
};

export const VENDOR_MONTHLY = 50000;

export const VENDOR_PLANS: VendorPlan[] = [
  { id: "monthly", name: "Monthly", price: 50000, months: 1, days: 30, period: "a month", line: "Pay as you go, one month at a time." },
  { id: "half-year", name: "Half Year", price: 300000, months: 6, days: 182, period: "for six months", line: "Six months paid once. Nothing to renew until then.", featured: true },
  { id: "yearly", name: "Yearly", price: 600000, months: 12, days: 365, period: "a year", line: "Listed the whole year on a single payment." },
];

/** What every plan includes. They differ only in how long you pay for. */
export const VENDOR_PLAN_INCLUDES = [
  "As many products as you want to list",
  "0% commission — the sale price is yours",
  "Your products in the store and the marketplace",
  "Your own prices, photographs and specifications",
];

/** The free month a vendor's products stay listed after a paid period with no sale. */
export const SECOND_CHANCE =
  "If the time you paid for ends and nothing of yours has sold, we do not take your products down. They stay on the site for one more month, free — a second chance to make that first sale.";
