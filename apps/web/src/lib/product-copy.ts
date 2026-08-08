import type { Product } from "@/lib/data";

/**
 * Jumia-style selling copy for the computers we stock: a written description,
 * what the buyer actually receives, and the warranty.
 *
 * Key features are DERIVED from each product's `details` (see keyFeatures below)
 * so they can never drift out of sync with the spec table.
 */
export type ProductCopy = {
  description: string;
  inBox?: string[];
  warranty?: string;
};

export const productCopy: Record<string, ProductCopy> = {
  // ── Budget business laptops (UK Used) ───────────────────────────────────
  "dell-latitude-e6440": {
    description:
      "A tough, business-grade Dell built to survive daily use — and priced for students and first-time buyers. The 4th-generation Core i5 handles Word, Excel, email and browsing comfortably, and the magnesium-alloy frame and spill-resistant keyboard mean it takes knocks better than a typical home laptop. It ships with a 320GB hard drive; if you want it noticeably faster, ask us to fit an SSD before delivery.",
  },
  "hp-elitebook-840-g1": {
    description:
      "HP's EliteBook line is what large offices buy when they need machines that keep working, and this 840 G1 is the affordable way into it. A 4th-generation Core i5, a comfortable full-size keyboard and a 14-inch screen make it a solid all-day office and study laptop, with a roomy 500GB drive for documents and photos.",
  },
  "lenovo-thinkpad-x240": {
    description:
      "The classic ThinkPad built for people who are always moving. It is light enough to carry all day, has the legendary ThinkPad keyboard for heavy typing, and runs a dual-battery system that reaches around 7 hours. It already has an SSD fitted, so it boots and opens programs quickly rather than making you wait.",
  },
  "hp-probook-640-g2": {
    description:
      "A meaningful step up in speed for a modest amount more. The 6th-generation Core i5 paired with 8GB of RAM and a 256GB SSD means Windows starts in seconds and you can keep many browser tabs and documents open without the machine struggling. A sensible choice if the cheaper models feel too slow for your work.",
  },
  "dell-latitude-e7270": {
    description:
      "Slim, light and genuinely portable, built for professionals who work between offices, clients and home. The 6th-generation Core i5 and 256GB SSD keep it quick, and around 7 hours of battery gets you through most of a working day away from a socket.",
  },
  "hp-elitebook-840-g3": {
    description:
      "One of our most popular business machines, and for good reason. It combines a fast 6th-generation Core i5, 8GB of RAM and an SSD in a thin aluminium body with a bright 14-inch screen — comfortable for long working days, presentations and heavy multitasking. Memory can be taken up to 32GB later if your work grows.",
  },
  "lenovo-thinkpad-t460": {
    description:
      "The T-series is Lenovo's workhorse, and battery life is its standout feature here: a dual-battery design reaches roughly 10 hours, and the second battery can be swapped without shutting down. Add the best keyboard in the business and it becomes the machine to buy if you write, code or travel for a living.",
  },

  // ── Modern business ultrabooks ─────────────────────────────────────────
  "dell-latitude-7390": {
    description:
      "A modern, genuinely fast business laptop running Windows 11 Pro. The 8th-generation quad-core i5 and NVMe solid-state drive make everyday work feel immediate, and the compact 13-inch chassis stays easy to carry. A strong all-rounder for professionals and serious students.",
  },
  "lenovo-thinkpad-t14": {
    description:
      "A dependable modern workhorse. The 10th-generation Core i5, NVMe SSD and around 10 hours of battery suit long days of real work, and the ThinkPad keyboard remains excellent for anyone who types or codes for hours. RAM can be expanded to 32GB, so it will stay useful for years.",
  },
  "hp-elitebook-840-g8": {
    description:
      "Where this one pulls ahead is memory and storage: 16GB of RAM and a 512GB NVMe SSD, which is what heavy multitasking actually needs. Run a video call, a large spreadsheet and twenty browser tabs at once without slowdown. The 11th-generation processor with Iris Xe graphics also handles light photo and video editing.",
  },
  "dell-latitude-7420": {
    description:
      "A Core i7 business ultrabook for people whose work is genuinely demanding — large datasets, heavy spreadsheets, many applications at once. With 16GB of RAM and roughly 12 hours of battery, it is built for professionals who cannot afford to wait for their laptop or hunt for a charger.",
  },

  // ── Premium & creator laptops ──────────────────────────────────────────
  "dell-xps-13-9310": {
    description:
      "Dell's flagship 13-inch, and one of the best-built laptops made. A near-borderless display, machined aluminium and carbon-fibre construction, and a Core i7 with 16GB of RAM and a 512GB SSD. For professionals and creators who want premium hardware without a full-size laptop to carry.",
  },
  "macbook-air-m1": {
    description:
      "The laptop that changed what battery life means. Apple's M1 chip delivers up to 18 hours on a charge with no fan at all — completely silent, and cool even under load. Excellent for students, writers and creatives, and it handles photo editing and light video work far better than the price suggests.",
  },
  "hp-spectre-x360-14": {
    description:
      "A premium convertible that folds all the way back into a tablet, supplied with a stylus for drawing and handwritten notes. A Core i7, 16GB of RAM and a 512GB SSD sit behind a jewel-cut aluminium body, with around 16 hours of battery. For people who want one machine for work, creativity and entertainment.",
  },
  "hp-pavilion-x360-13": {
    description:
      "A flexible 2-in-1 at a sensible price: fold the touchscreen back and use it as a tablet for reading, drawing or presenting, then fold it flat for typing. The 11th-generation Core i5 and NVMe SSD keep it quick for study, office work and streaming.",
  },

  // ── Gaming ─────────────────────────────────────────────────────────────
  "lenovo-legion-5-15": {
    description:
      "Serious gaming hardware, brand new. An 8-core Ryzen 7 with a dedicated NVIDIA RTX 3060 runs modern titles at high settings, and Legion's cold-front cooling keeps temperatures under control during long sessions. The same graphics power makes it a strong video-editing and 3D-rendering machine.",
  },
  "asus-rog-strix-g15": {
    description:
      "Built for high-FPS competitive gaming, with a fast refresh-rate display so fast-moving games stay sharp. The 8-core Ryzen 7 and RTX 3060 are paired with a full 1TB SSD — enough for a real game library without constant uninstalling. Also a capable workstation for rendering and heavy creative work.",
  },
  "asus-tuf-gaming-f15": {
    description:
      "The affordable way into proper gaming. An 8-core Core i7 and dedicated RTX 3050 handle current titles at good settings, and the TUF chassis is military-standard tested for durability. Equally suited to heavy multitasking and design work on a budget.",
  },

  // ── Creator & Mac ──────────────────────────────────────────────────────
  "dell-xps-15-9520": {
    description:
      "A professional creator's machine. The 14-core i7, DDR5 memory and dedicated RTX 3050 are built for video editing, 3D and design work, and the large colour-accurate 15-inch display matters when colour has to be right. Powerful enough to be a desktop replacement.",
  },
  "macbook-pro-14-m3": {
    description:
      "Apple's professional laptop, brand new. The M3 chip with a 10-core GPU handles demanding video editing, music production and software development while staying quiet, and still reaches around 18 hours of battery. The Liquid Retina XDR display is among the best fitted to any laptop.",
  },
  "macbook-air-m2": {
    description:
      "The refined MacBook Air: thinner, with a larger brighter display and the faster M2 chip. Completely silent with no fan, up to 18 hours of battery, and light enough that you stop noticing it in your bag. An excellent long-term choice for students and creatives.",
  },
  "macbook-pro-13-m2": {
    description:
      "Pro-level performance with the longest battery life of anything we stock — around 20 hours. The M2 chip with active cooling sustains heavy work without throttling, making it well suited to video editing, development and long production sessions away from power.",
  },

  // ── Everyday ───────────────────────────────────────────────────────────
  "asus-vivobook-15": {
    description:
      "A brand-new laptop at a realistic price. The 11th-generation Core i5 and a generous 512GB NVMe SSD make it quick for study, office work and home use, and the full 15-inch screen with a number pad suits anyone working with figures. Comes with full warranty as a new machine.",
  },
  "asus-zenbook-14": {
    description:
      "The OLED display is the reason to buy this one — true blacks and vivid colour that ordinary laptop screens cannot reproduce, which matters for design, photo work and video. Behind it sits a 12th-generation Core i7 with 16GB of fast LPDDR5 memory, in a thin, light, brand-new body.",
  },

  // ── Desktops (note: monitors are sold separately) ──────────────────────
  "hp-prodesk-600-g1": {
    description:
      "An affordable, reliable desktop for a home study or small office. The quad-core i5 is comfortable with office work, browsing and school assignments, and being a tower it is simple and cheap to upgrade later — more RAM, or an SSD to make it considerably faster. Please note this is the system unit only; a monitor, keyboard and mouse are not included.",
    inBox: ["1 x HP ProDesk 600 G1 tower (system unit)", "1 x Power cable"],
  },
  "dell-optiplex-7010-sff": {
    description:
      "A compact small-form-factor desktop that fits where a full tower will not — under a counter or on a small desk. It already has 8GB of RAM, so it handles everyday office work and browsing without complaint. Please note this is the system unit only; a monitor, keyboard and mouse are not included.",
    inBox: ["1 x Dell OptiPlex 7010 SFF (system unit)", "1 x Power cable"],
  },
  "hp-280-g6-desktop": {
    description:
      "A brand-new business desktop with a 6-core 10th-generation i5 and a 1TB hard drive for plenty of storage. Memory can be taken to 32GB as your needs grow. Important: this unit ships with FreeDOS, not Windows — we can install and license Windows for you before delivery, just ask. This is the system unit only; a monitor, keyboard and mouse are not included.",
    inBox: ["1 x HP 280 G6 tower (system unit)", "1 x Power cable", "1 x Documentation"],
  },
  "dell-optiplex-7090-i7": {
    description:
      "Our most capable desktop: a brand-new 8-core Core i7 with 16GB of RAM and a fast 512GB NVMe SSD, running Windows 11 Pro. Built for demanding business workloads — large databases, heavy spreadsheets, accounting systems and many applications at once. This is the system unit only; a monitor, keyboard and mouse are not included.",
    inBox: ["1 x Dell OptiPlex 7090 tower (system unit)", "1 x Power cable", "1 x Documentation"],
  },
};

/** What the buyer receives. Desktops override this above (no monitor included). */
export function boxContents(p: Product): string[] {
  const explicit = productCopy[p.id]?.inBox;
  if (explicit) return explicit;

  const box = [`1 x ${p.brand} ${p.name}`, "1 x Power adapter / charger"];
  if (p.id === "hp-spectre-x360-14") box.push("1 x Stylus pen");
  if (p.brand === "Apple") box[1] = "1 x USB-C charge cable & power adapter";
  return box;
}

/** Warranty depends on condition — new machines carry longer cover. */
export function warrantyFor(p: Product): string {
  if (p.condition === "Brand New") return "12 months warranty";
  if (p.condition === "Refurbished") return "6 months warranty";
  return "3 months warranty";
}

/**
 * Jumia-style "Key Features" bullets, derived from the spec table so the two
 * can never disagree.
 */
export function keyFeatures(p: Product): string[] {
  const d = p.details;
  if (!d) return p.specs;

  const out = [
    `${d.processor} (${d.generation})`,
    `${d.ram} RAM`,
    `${d.storage} storage`,
    d.graphics,
    d.display,
    d.os,
  ].filter(Boolean);

  // Battery is meaningless on a mains-powered desktop.
  if (d.battery && !/not applicable/i.test(d.battery)) out.push(`Battery: ${d.battery}`);
  out.push(`Condition: ${p.condition}`);
  return out;
}
