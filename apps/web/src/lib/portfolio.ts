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

// Temporary web images so cards aren't blank (replace with real screenshots in /public/portfolio later).
const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=900&q=80&auto=format&fit=crop`;

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
    shots: [u("1563013544-824ae1b704d3"), u("1547658719-da2b51169166"), u("1460925895917-afdab827c52f")],
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
    shots: [u("1467232004584-a241de8bcf5d"), u("1547658719-da2b51169166"), u("1555421689-491a97ff2040")],
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
    shots: [u("1512941937669-90a1b58e7e9c"), u("1526498460520-4c246339dccb"), u("1551288049-bebda4e38f71")],
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
    shots: [u("1633158829585-23ba8f7c8caf"), u("1526498460520-4c246339dccb"), u("1551288049-bebda4e38f71")],
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
    shots: [u("1523240795612-9a054b0db644"), u("1509062522246-3755977927d7"), u("1551288049-bebda4e38f71")],
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
    shots: [u("1556740738-b6a63e27c4df"), u("1580828343064-fde4fc206bc6"), u("1551288049-bebda4e38f71")],
  },
];

export function findProject(slug: string) {
  return portfolio.find((p) => p.slug === slug);
}
