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
  /**
   * "case-study": something we built that exists — its screenshots are of the
   * real thing. "example": the kind of system we build, shown with
   * illustrative pictures. The two are never presented as the same.
   */
  kind: "case-study" | "example";
  // ── case studies only ──
  industry?: string;
  /** What the client needed, in a paragraph. */
  problem?: string;
  /** What we did about it. */
  solution?: string;
  /** The parts we built, each with a line on what it does. */
  built?: { title: string; body: string }[];
  stack?: string[];
  /** Plain facts about the finished thing — never estimates. */
  facts?: { value: string; label: string }[];
  /** One line under each screenshot, saying what it shows. */
  captions?: string[];
};

export const caseStudies = () => portfolio.filter((p) => p.kind === "case-study");
export const examples = () => portfolio.filter((p) => p.kind === "example");

export const projectCategories: (ProjectCategory | "All")[] = [
  "All",
  "Websites",
  "Mobile Apps",
  "Management Systems",
];

// Temporary web images so cards aren't blank (replace with real screenshots in /public/portfolio later).
const u = (id: string) => `/web/photo-${id}.jpg`;

const shot = (slug: string, n: number) => `/portfolio/${slug}-${n}.webp`;

export const portfolio: PortfolioItem[] = [
  // ── Case studies: real projects, real screenshots ───────────────────────
  {
    kind: "case-study",
    slug: "beds-and-beddings",
    title: "Beds & Beddings — online store",
    category: "Websites",
    client: "Beds & Beddings",
    industry: "Retail · home & bedding",
    year: "2026",
    demo: "https://bedsbeddings.com",
    summary: "A full online shop for a Kampala bedding retailer: storefront, admin dashboard and its own backend.",
    description:
      "An e-commerce platform for Beds & Beddings, a Ugandan retailer of beds, mattresses, duvets, curtains, bedsheets and home furnishings. Customers browse the whole range by category, save favourites and check out online; the owners run the catalogue, orders and promotions from their own dashboard.",
    problem:
      "Beds & Beddings sells a wide range — beds, mattresses, duvets, curtains, towels, carpets and more — from its branches in Kampala. Customers could only see that range by visiting, and there was no way to browse, compare or order from a phone.",
    solution:
      "We built three things that work as one: a storefront customers shop from, a dashboard the owners manage it with, and a backend that holds the catalogue, orders and accounts. It was designed phone-first, since that is how most of its customers arrive, and launched on the client's own domain.",
    built: [
      { title: "Customer storefront", body: "Browse by category, featured deals and promotions, product pages, favourites, cart and checkout, and customer accounts." },
      { title: "Admin dashboard", body: "Products, categories, orders and offers managed by the owners themselves, on a separate secured address." },
      { title: "Backend & database", body: "An API and PostgreSQL database behind both, hosted on the client's own server, with nightly backups." },
      { title: "The pages a shop needs", body: "Delivery and returns, FAQ, privacy, terms and contact — written and in place before launch." },
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "FastAPI (Python)", "PostgreSQL", "Vercel", "Linux VPS"],
    facts: [
      { value: "Live", label: "at bedsbeddings.com" },
      { value: "3", label: "parts: shop, dashboard, backend" },
      { value: "Phone-first", label: "designed for mobile shoppers" },
    ],
    tags: ["E-commerce", "Admin dashboard", "Next.js", "FastAPI"],
    shots: [shot("beds-beddings", 1), shot("beds-beddings", 2), shot("beds-beddings", 3)],
    captions: [
      "The home page: a featured deal, with search, account and cart always in reach.",
      "Shop by category — the whole range, browsable from a phone.",
      "The same shop on a phone, where most customers use it.",
    ],
  },
  {
    kind: "case-study",
    slug: "online-tech-uganda-platform",
    title: "Online Tech Uganda — shop, academy & dashboard",
    category: "Websites",
    client: "Online Tech Uganda (our own platform)",
    industry: "Retail, training & IT services",
    year: "2026",
    demo: "https://www.onlinetechug.com",
    summary: "The site you are on: a computer store, a training academy, a marketplace and the dashboard that runs them.",
    description:
      "Our own platform, and the best evidence of what we build: a computer store, a course academy, an internship programme, a vendor marketplace and a full admin dashboard, all on one system.",
    problem:
      "We sell computers, teach courses, build software and repair machines. Run as four separate tools, that is four places for a price to be wrong and four logins for staff. We needed one system where an order, an enrolment and a repair all land in the same dashboard.",
    solution:
      "We built it the way we would for a client: a storefront, an admin dashboard and a backend, each deployed on its own. Prices are always worked out on the server, so what a customer is shown is what they are charged. Every change is tested automatically before it goes live, and the live site is checked every two hours.",
    built: [
      { title: "Computer store", body: "Search with suggestions, filters, product pages with a delivery-cost checker, cart, checkout, order tracking and verified customer reviews." },
      { title: "Learn Academy", body: "Courses with notes and certificates, intake dates, online registration and an internship programme with its own application flow." },
      { title: "Vendor marketplace", body: "Other businesses apply, are verified, and sell through the site from their own dashboard." },
      { title: "Admin dashboard", body: "Orders, products, courses, vendors, leads, reviews, campaigns, receipts, quotations and internship letters — one sign-in." },
      { title: "Backend", body: "Accounts with email verification and password reset, payments, notifications, nightly database backups and private document storage." },
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "FastAPI (Python)", "PostgreSQL", "Vercel", "Linux VPS", "GitHub Actions"],
    facts: [
      { value: "Live", label: "at onlinetechug.com" },
      { value: "30+", label: "screens in the admin dashboard" },
      { value: "Tested", label: "automatically on every change" },
    ],
    tags: ["E-commerce", "Learning platform", "Marketplace", "Admin dashboard"],
    shots: [shot("online-tech-uganda", 1), shot("online-tech-uganda", 2), shot("online-tech-uganda", 3), shot("online-tech-uganda", 4)],
    captions: [
      "The store's home page: order by phone or WhatsApp, browse by category.",
      "Learn Academy — upcoming intakes, each with its date, and the courses below.",
      "A product page: price, stock, delivery cost to your town, and reviews.",
      "The home page on a phone.",
    ],
  },
  {
    kind: "case-study",
    slug: "digiq-queue-management",
    title: "DigiQ — digital queue management",
    category: "Management Systems",
    client: "DigiQ (our product)",
    industry: "Banks, clinics & service counters",
    year: "2026",
    summary: "Replaces paper tokens and shouted names with a live digital queue customers follow on their phones.",
    description:
      "A web-based queue system for any place people wait to be served. Customers book a token from their phone and watch their position update live; counter staff call and close out tickets from a console; managers see the numbers; and a public board shows who is being served.",
    problem:
      "Wherever people queue for a counter — a bank, a clinic, an office — the system is usually a paper number and a shouted name. Customers cannot tell how long they will wait, staff cannot see who is next across counters, and nobody can say afterwards how long people actually waited.",
    solution:
      "DigiQ gives each of the four people in a queue their own view. It updates live, with no refreshing, so the board on the wall, the phone in a customer's hand and the staff console always agree. Priority customers — the elderly, people with a disability, expectant mothers — are called first, and every action is recorded.",
    built: [
      { title: "Customer", body: "Book a token, see live queue depth and estimated wait, get an alert as your turn approaches, and download a ticket with a QR code." },
      { title: "Counter staff", body: "A console for one counter: call the next customer, scan a ticket with the camera, complete a service or mark a no-show." },
      { title: "Administrator", body: "A dashboard and analytics — demand over time, waiting and service times, counter throughput — plus services, counters, users and an audit log." },
      { title: "Public display board", body: "A full-screen 'Now Serving' board for a waiting-room screen. It shows token numbers only, never names." },
    ],
    stack: ["Java Servlets", "JSP", "MySQL", "Apache Tomcat", "WebSockets"],
    facts: [
      { value: "4", label: "roles, each with its own screens" },
      { value: "Live", label: "updates, with no page refresh" },
      { value: "Priority", label: "queueing for those who need it" },
    ],
    tags: ["Queue management", "Real-time", "Analytics", "QR tickets"],
    shots: [shot("digiq", 1), shot("digiq", 2), shot("digiq", 3), shot("digiq", 4), shot("digiq", 5)],
    captions: [
      "The administrator's dashboard: today's volume, waiting count and counter states.",
      "Analytics — demand over time, how tokens ended, and when people arrive.",
      "A staff console for one counter: call the next customer, or scan a ticket.",
      "A customer's view: each service with its live queue and estimated wait.",
      "The public 'Now Serving' board, made for a waiting-room screen.",
    ],
  },

  // ── Examples: the kinds of system we build, with illustrative pictures ──
  {
    kind: "example",
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
    kind: "example",
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
    kind: "example",
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
    kind: "example",
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
    kind: "example",
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
    kind: "example",
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
