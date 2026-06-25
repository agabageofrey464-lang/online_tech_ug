// Projects portfolio. Replace the mockup images in /public/portfolio with real
// screenshots when available (same file names), and edit copy/links here.

export type ProjectCategory = "Websites" | "Mobile Apps" | "Management Systems";

export type PortfolioItem = {
  slug: string;
  title: string;
  category: ProjectCategory;
  client: string;
  year: string;
  summary: string;
  description: string;
  tags: string[];
  demo?: string; // external demo/live URL
  shots: string[]; // image paths (first = cover)
};

export const projectCategories: (ProjectCategory | "All")[] = [
  "All",
  "Websites",
  "Mobile Apps",
  "Management Systems",
];

export const portfolio: PortfolioItem[] = [
  {
    slug: "retail-ecommerce-store",
    title: "Retail E-commerce Store",
    category: "Websites",
    client: "Retail client",
    year: "2026",
    summary: "A fast online store with cart, checkout and Mobile Money.",
    description:
      "A complete e-commerce website with product catalogue, search & filters, cart, secure checkout, Mobile Money payments and an admin dashboard for orders and inventory. Built mobile-first for Ugandan shoppers.",
    tags: ["Next.js", "E-commerce", "Mobile Money", "Admin dashboard"],
    shots: ["/portfolio/retail-ecommerce-store-1.webp", "/portfolio/retail-ecommerce-store-2.webp", "/portfolio/retail-ecommerce-store-3.webp"],
  },
  {
    slug: "business-corporate-site",
    title: "Corporate Business Website",
    category: "Websites",
    client: "Services company",
    year: "2026",
    summary: "A professional company website with blog and lead forms.",
    description:
      "A modern corporate website: services pages, team & about, blog/news, contact and lead-capture forms, SEO setup and analytics. Designed to win trust and generate enquiries.",
    tags: ["Next.js", "SEO", "CMS", "Lead capture"],
    shots: ["/portfolio/business-corporate-site-1.webp", "/portfolio/business-corporate-site-2.webp", "/portfolio/business-corporate-site-3.webp"],
  },
  {
    slug: "delivery-mobile-app",
    title: "Delivery & Orders Mobile App",
    category: "Mobile Apps",
    client: "Logistics startup",
    year: "2026",
    summary: "Android & iOS app for orders, tracking and payments.",
    description:
      "A cross-platform mobile app with user sign-up, ordering, live order tracking, push notifications and in-app Mobile Money payments — published to Google Play and the App Store.",
    tags: ["React Native", "Push notifications", "Payments", "Maps"],
    shots: ["/portfolio/delivery-mobile-app-1.webp", "/portfolio/delivery-mobile-app-2.webp", "/portfolio/delivery-mobile-app-3.webp"],
  },
  {
    slug: "sacco-members-app",
    title: "SACCO Members App",
    category: "Mobile Apps",
    client: "SACCO",
    year: "2026",
    summary: "Members app for savings, loans and statements.",
    description:
      "A mobile app for SACCO members: view savings & loan balances, apply for loans, get statements, and receive notifications — with a secure admin portal for the SACCO staff.",
    tags: ["Mobile app", "Fintech", "Secure auth", "Statements"],
    shots: ["/portfolio/sacco-members-app-1.webp", "/portfolio/sacco-members-app-2.webp", "/portfolio/sacco-members-app-3.webp"],
  },
  {
    slug: "school-management-system",
    title: "School Management System",
    category: "Management Systems",
    client: "School",
    year: "2026",
    summary: "Students, fees, results and SMS to parents.",
    description:
      "A web-based school system: student registration, classes & attendance, fees tracking, exams & report cards, and SMS notifications to parents — with role-based access for admins, teachers and bursars.",
    tags: ["Web app", "Fees", "Report cards", "SMS"],
    shots: ["/portfolio/school-management-system-1.webp", "/portfolio/school-management-system-2.webp", "/portfolio/school-management-system-3.webp"],
  },
  {
    slug: "pos-inventory-system",
    title: "POS & Inventory System",
    category: "Management Systems",
    client: "Retail & wholesale",
    year: "2026",
    summary: "Point of sale, stock control and sales reports.",
    description:
      "A point-of-sale and inventory system: fast sales screen, barcode support, stock tracking with low-stock alerts, suppliers, and daily/monthly sales reports — works on desktop and tablet.",
    tags: ["POS", "Inventory", "Reports", "Multi-user"],
    shots: ["/portfolio/pos-inventory-system-1.webp", "/portfolio/pos-inventory-system-2.webp", "/portfolio/pos-inventory-system-3.webp"],
  },
];

export function findProject(slug: string) {
  return portfolio.find((p) => p.slug === slug);
}
