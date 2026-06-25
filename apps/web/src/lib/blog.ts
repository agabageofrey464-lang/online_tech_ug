// Weekly tech blog articles. Add a new entry at the top each week.
export type Block = { h?: string; p?: string };

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Buying Guides" | "Tips" | "Business" | "Security";
  author: string;
  date: string; // ISO
  readMins: number;
  body: Block[];
};

export const articles: Article[] = [
  {
    slug: "how-to-choose-a-laptop-in-uganda",
    title: "How to Choose the Right Laptop in Uganda (2026)",
    excerpt: "RAM, storage, processor and budget — a simple guide to picking a laptop that fits your needs.",
    category: "Buying Guides",
    author: "Agaba Geofrey",
    date: "2026-06-22T09:00:00+03:00",
    readMins: 5,
    body: [
      { p: "Buying a laptop can feel confusing with all the specs. Here's how to keep it simple and get value for your money." },
      { h: "1. Start with what you'll do" },
      { p: "For browsing, typing and online classes, a Core i3/i5 with 8GB RAM and an SSD is plenty. For design, editing or gaming, look at Core i7/Ryzen 7 with 16GB RAM and a dedicated graphics card (like RTX 3060)." },
      { h: "2. SSD over HDD — always" },
      { p: "An SSD makes a laptop feel several times faster than an old hard drive. If a machine still has an HDD, budget for an SSD upgrade — it's the best value upgrade you can make." },
      { h: "3. RAM: 8GB minimum" },
      { p: "8GB handles everyday work. 16GB is better if you keep many browser tabs open or run heavier software. Most business laptops can be upgraded later." },
      { h: "4. UK Used vs Brand New" },
      { p: "UK-Used business laptops (HP EliteBook, Dell Latitude, Lenovo ThinkPad) offer premium build at lower prices. Brand new gives you warranty and the latest specs. We quality-check every UK-used machine before sale." },
      { p: "Need help deciding? Chat with us on WhatsApp and we'll recommend the best option for your budget." },
    ],
  },
  {
    slug: "uk-used-vs-brand-new-laptops",
    title: "UK Used vs Brand New Laptops — Which Should You Buy?",
    excerpt: "Both are great choices. Here's how to decide based on budget, warranty and how you'll use it.",
    category: "Buying Guides",
    author: "Online Tech Uganda",
    date: "2026-06-15T09:00:00+03:00",
    readMins: 4,
    body: [
      { p: "One of the most common questions we get: should I buy UK-used or brand new? The honest answer — it depends." },
      { h: "Why UK-Used is popular" },
      { p: "UK-used business laptops are built tougher than many new budget laptops. You get premium metal bodies, great keyboards and strong performance for much less money." },
      { h: "When to buy Brand New" },
      { p: "Choose brand new when you want a manufacturer warranty, the newest processors, or a specific model like a gaming laptop or MacBook." },
      { h: "Our promise" },
      { p: "Every UK-used device we sell is tested for battery health, screen, keyboard, ports and performance — so you buy with confidence." },
    ],
  },
  {
    slug: "protect-yourself-from-online-scams",
    title: "5 Ways to Protect Yourself From Online & Mobile Money Scams",
    excerpt: "Simple habits that keep your money and accounts safe online.",
    category: "Security",
    author: "Online Tech Uganda",
    date: "2026-06-08T09:00:00+03:00",
    readMins: 4,
    body: [
      { p: "Scammers are getting smarter. These five habits will keep you safe." },
      { h: "1. Never share your PIN or OTP" },
      { p: "No real bank, telecom or company will ever ask for your Mobile Money PIN or a one-time code. Anyone who does is a scammer." },
      { h: "2. Confirm the number before sending money" },
      { p: "Double-check the name and number before approving any Mobile Money transaction." },
      { h: "3. Use strong, unique passwords" },
      { p: "Long passwords with a mix of letters and numbers — and don't reuse the same one everywhere." },
      { h: "4. Be careful with links" },
      { p: "If a message says you've won money you never entered for, it's a scam. Don't click." },
      { h: "5. Keep software updated" },
      { p: "Updates fix security holes. Turn on automatic updates for your phone and computer." },
    ],
  },
  {
    slug: "why-your-business-needs-a-website",
    title: "Why Every Ugandan Business Needs a Website in 2026",
    excerpt: "A website works for you 24/7 — building trust and bringing in customers.",
    category: "Business",
    author: "Agaba Geofrey",
    date: "2026-06-01T09:00:00+03:00",
    readMins: 4,
    body: [
      { p: "Social media is great, but a website is your business's home online — one you fully own and control." },
      { h: "It builds trust" },
      { p: "Customers check you online before buying. A clean, professional website signals that you're a real, serious business." },
      { h: "It sells while you sleep" },
      { p: "With an online store or enquiry form, customers can buy or reach you any time — not only when you're online." },
      { h: "It's more affordable than you think" },
      { p: "We build fast, mobile-friendly websites for Ugandan businesses from UGX 500,000. Request a quote and we'll propose a plan." },
    ],
  },
];

export function findArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}
