export const site = {
  name: "Online Tech Uganda",
  legalName: "Online Tech Uganda Ltd",
  tagline: "Buy. Build. Learn. Repair.",
  description:
    "Your one-stop tech partner in Uganda — quality computers & accessories, website & app development, software systems, IT support & repairs, and online computer courses.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "onlinetechug@gmail.com",
  phoneDisplay: "+256 756 839 270",
  phoneAlt: "+256 760 547 211",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "256756839270",
  // Second line — WhatsApp only (0760 547 211).
  whatsappAlt: "256760547211",
  whatsappAltDisplay: "+256 760 547 211",
  address: "Kampala, Uganda",
  ceo: {
    name: "Agaba Geofrey",
    title: "Founder & CEO · IT Specialist",
    email: "agabageofrey464@gmail.com",
    photo: "/agaba.jpeg", // CEO headshot
  },
  // Where customers/vendors send payments. Update anytime.
  payment: {
    momo: { number: "0760 547 211", name: "Online Tech Uganda", provider: "MTN Mobile Money" },
    // Airtel Money merchant account — customers can "Pay Merchant" using the ID or number.
    momoAlt: {
      number: "0756 839 270",
      name: "Online TechUG Services",
      provider: "Airtel Money (Merchant)",
      merchantId: "7148212",
    },
    bank: { bank: "", account: "", name: "" }, // fill in to display bank details
  },
  socials: {
    // Brand handle: @onlinetechug across all platforms.
    tiktok: "https://www.tiktok.com/@onlinetechug",
    instagram: "https://www.instagram.com/onlinetechug",
    facebook: "https://www.facebook.com/onlinetechug",
    x: "#",
    linkedin: "#",
  },
} as const;

// Core top-level links shown on the desktop sub-nav (fill the bar).
export const navPrimary = [
  { href: "/shop", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/sell", label: "Vendors" },
  { href: "/jobs", label: "Jobs" },
  { href: "/advertise", label: "Advertise" },
  { href: "/services", label: "Services" },
  { href: "/blog", label: "Blog" },
  { href: "/freelancers", label: "Freelancers" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
] as const;

// Everything else tucked into a single dropdown.
export const navGroups = [
  {
    label: "More",
    items: [
      // Learn, internships and services lead — they are what most visitors
      // come here for, so they sit ahead of the informational pages.
      { href: "/learn", label: "Learn" },
      { href: "/jobs", label: "Internships & Jobs" },
      { href: "/services", label: "Services" },
      { href: "/about", label: "About Us" },
      { href: "/blog", label: "Blog" },
      { href: "/news", label: "News" },
      { href: "/freelancers", label: "Freelancers" },
      { href: "/pricing", label: "Pricing & Plans" },
      { href: "/portfolio", label: "Portfolio" },
      { href: "/request", label: "Request Software" },
      { href: "/track", label: "Track Project" },
      { href: "/refer", label: "Refer & Earn" },
      { href: "/pay", label: "Confirm Payment" },
      { href: "/help", label: "Help" },
      { href: "/contact", label: "Contact" },
    ],
  },
] as const;

// Full flat list — used by the mobile menu and footer.
export const nav = [
  // Marketplace ecosystem first (after Home/Shop), then services & info pages.
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/sell", label: "Vendors" },
  { href: "/learn", label: "Learn" },
  { href: "/jobs", label: "Jobs & Internships" },
  { href: "/freelancers", label: "Freelancers" },
  { href: "/advertise", label: "Advertise" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/request", label: "Request Software" },
  { href: "/track", label: "Track Project" },
  { href: "/blog", label: "Blog" },
  { href: "/news", label: "News" },
  { href: "/pricing", label: "Pricing & Plans" },
  { href: "/refer", label: "Refer & Earn" },
  { href: "/pay", label: "Confirm Payment" },
  { href: "/help", label: "Help" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${site.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Second WhatsApp line (0760 547 211) — WhatsApp only, no calls. */
export function whatsappAltLink(message?: string) {
  const base = `https://wa.me/${site.whatsappAlt}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Format a number as Ugandan Shillings — one clean currency, e.g. "UGX 1,250,000".
 * Single line, no USD, and a plain "UGX" prefix (clearer than the "USh" symbol).
 * The second arg is kept for backwards-compatibility with existing call sites.
 */
export function ugx(amount: number, _withUsd = false) {
  return `UGX ${new Intl.NumberFormat("en-US").format(Math.round(amount))}`;
}
