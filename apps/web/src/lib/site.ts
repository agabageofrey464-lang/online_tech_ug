export const site = {
  name: "Online Tech Uganda",
  legalName: "Online Tech Uganda Ltd",
  tagline: "Buy. Build. Learn. Repair.",
  description:
    "Your one-stop tech partner in Uganda — quality computers & accessories, website & app development, software systems, IT support & repairs, and online computer courses.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "onlinetech@gmail.com",
  phoneDisplay: "+256 756 839 270",
  phoneAlt: "+256 760 547 211",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "256756839270",
  address: "Liberty Tower, Kampala Road, Kampala",
  ceo: { name: "Agaba Geofrey", title: "Founder & CEO · IT Specialist", email: "onlinetech@gmail.com" },
  socials: {
    // TikTok confirmed by owner. IG/FB mirror the TikTok handle — confirm/replace if different.
    tiktok: "https://www.tiktok.com/@techplug.ug_store",
    instagram: "https://www.instagram.com/techplug.ug_store",
    facebook: "https://www.facebook.com/techplug.ug.store",
    x: "#",
    linkedin: "#",
  },
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/gallery", label: "Gallery" },
  { href: "/videos", label: "Videos" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/learn", label: "Learn" },
  { href: "/request", label: "Request Software" },
  { href: "/track", label: "Track Project" },
  { href: "/blog", label: "Blog" },
  { href: "/jobs", label: "Jobs" },
  { href: "/sell", label: "Sell with us" },
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
