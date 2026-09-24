import type { Line } from "@/lib/doc-kit";

/** Starting points for the work we're asked to quote most often. */
export const PRESETS: {
  label: string;
  keys: string[];
  lines: Line[];
  scope: string;
  excludes: string;
}[] = [
  {
    label: "Mobile app",
    keys: ["mobile app", "android", "ios", "app development", "phone app", "application"],
    lines: [
      { desc: "Discovery — requirements, screens and user flows agreed in writing", qty: 1, price: 400000 },
      { desc: "UI design — screen designs for your review before any code is written", qty: 1, price: 600000 },
      { desc: "Android app build — core features as listed in the scope below", qty: 1, price: 2000000 },
      { desc: "Admin dashboard — manage users and content from a browser", qty: 1, price: 900000 },
      { desc: "Testing, Play Store submission and handover training", qty: 1, price: 600000 },
    ],
    scope:
      "User registration and login\nCore in-app workflow as agreed at discovery\nPush notifications\nAdmin dashboard to manage users and content\nOne round of revisions per stage",
    excludes:
      "Google Play developer account (USD 25, one-off) and Apple Developer Program (USD 99/year)\niOS build — quoted separately on request\nSMS and Mobile Money transaction charges\nContent, photographs and copywriting\nHosting and domain after the first year",
  },
  {
    label: "Website",
    keys: ["website", "web site", "web design", "landing page", "portfolio site", "company site"],
    lines: [
      { desc: "Design — homepage and inner page layouts for your approval", qty: 1, price: 600000 },
      { desc: "Build — responsive site, up to 8 pages", qty: 1, price: 1400000 },
      { desc: "Search-engine setup, Google listing and analytics", qty: 1, price: 300000 },
      { desc: "Domain, hosting and SSL for the first year", qty: 1, price: 200000 },
    ],
    scope:
      "Up to 8 pages\nMobile-first design\nContact form to your email\nGoogle Business listing\nTraining so you can update it yourself",
    excludes:
      "Hosting and domain after the first year\nContent, photographs and copywriting\nPaid advertising",
  },
  {
    label: "E-commerce shop",
    keys: ["e-commerce", "ecommerce", "online shop", "online store", "sell online", "shopping site"],
    lines: [
      { desc: "Design — storefront, product and checkout pages", qty: 1, price: 700000 },
      { desc: "Build — catalogue, cart and checkout", qty: 1, price: 1800000 },
      { desc: "Mobile Money and card payment integration", qty: 1, price: 900000 },
      { desc: "Admin dashboard — products, orders and stock", qty: 1, price: 800000 },
      { desc: "Testing, launch and handover training", qty: 1, price: 400000 },
    ],
    scope:
      "Product catalogue with categories and search\nCart and checkout\nMobile Money and card payments\nOrder and stock management\nDelivery fee rules",
    excludes:
      "Payment gateway account fees and per-transaction charges\nProduct photography and descriptions\nHosting after the first year",
  },
  {
    label: "Management system",
    keys: ["system", "management", "erp", "school system", "inventory", "pos", "database", "software"],
    lines: [
      { desc: "Discovery — current process mapped and requirements agreed", qty: 1, price: 500000 },
      { desc: "Build — core modules as listed in the scope below", qty: 1, price: 2200000 },
      { desc: "Reports and data export", qty: 1, price: 500000 },
      { desc: "Installation, staff training and handover", qty: 1, price: 500000 },
    ],
    scope:
      "User accounts with roles and permissions\nCore records and workflow\nReports and export to Excel\nTraining for your staff\nThree months' support after handover",
    excludes: "Hardware and networking\nData entry of existing records\nOngoing support after the first three months",
  },
  {
    label: "Computers supply",
    keys: ["laptop", "computer", "desktop", "printer", "supply", "quotation for laptops", "ssd"],
    lines: [{ desc: "", qty: 1, price: 0 }],
    scope: "Delivery within Kampala\nWindows, Office and antivirus installed\nWarranty as stated per item",
    excludes: "Upcountry delivery, charged by distance\nExtended warranty",
  },
];

/**
 * Which job a request is asking about, read from what the client wrote.
 *
 * "Hi, I'd like a quote for: Mobile App Development" is the shape these
 * arrive in, so matching on the words they used gets the right template up
 * without anyone choosing one. Ties go to the longest phrase matched — "online
 * shop" should win over the bare word "shop" inside it.
 */
export function detectJob(text: string) {
  const t = (text || "").toLowerCase();
  let best: { preset: (typeof PRESETS)[number]; score: number } | null = null;

  for (const preset of PRESETS) {
    let score = 0;
    for (const k of preset.keys) if (t.includes(k)) score = Math.max(score, k.length);
    if (score && (!best || score > best.score)) best = { preset, score };
  }
  return best?.preset ?? null;
}
