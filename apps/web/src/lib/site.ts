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
  address: "Liberty Tower, Kampala Road, Kampala",
  ceo: { name: "Agaba Geofrey", title: "Founder & CEO · IT Specialist", email: "onlinetechug@gmail.com" },
  socials: {
    // Brand handle: @onlinetechug across all platforms.
    tiktok: "https://www.tiktok.com/@onlinetechug",
    instagram: "https://www.instagram.com/onlinetechug",
    facebook: "https://www.facebook.com/onlinetechug",
    x: "#",
    linkedin: "#",
  },
} as const;

export const nav = [
  // Ordered by business importance: revenue-driving pages first, info pages last.
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/learn", label: "Learn" },
  { href: "/request", label: "Request Software" },
  { href: "/track", label: "Track Project" },
  { href: "/videos", label: "Videos" },
  { href: "/blog", label: "Blog" },
  { href: "/sell", label: "Sell with us" },
  { href: "/jobs", label: "Jobs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${site.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Format a number as Ugandan Shillings. */
export function ugx(amount: number) {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
  }).format(amount);
}
