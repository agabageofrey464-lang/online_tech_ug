// Generate clean branded mockup screenshots (browser/phone frames) for the
// portfolio. Replace with real screenshots later (same filenames).
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const require = createRequire("e:/Projects/onlinetech_ug/");
const sharp = require("e:/Projects/onlinetech_ug/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js");

const OUT = "e:/Projects/onlinetech_ug/apps/web/public/portfolio";
fs.mkdirSync(OUT, { recursive: true });

const ORANGE = "#f15a29";
const INK = "#282363";
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const PROJECTS = {
  "retail-ecommerce-store": { kind: "web", title: "Retail E-commerce", labels: ["Storefront", "Product page", "Admin orders"] },
  "business-corporate-site": { kind: "web", title: "Corporate Website", labels: ["Home", "Services", "Contact"] },
  "delivery-mobile-app": { kind: "app", title: "Delivery App", labels: ["Home", "Track order", "Payment"] },
  "sacco-members-app": { kind: "app", title: "SACCO App", labels: ["Dashboard", "Loans", "Statements"] },
  "school-management-system": { kind: "web", title: "School System", labels: ["Dashboard", "Students", "Report cards"] },
  "pos-inventory-system": { kind: "web", title: "POS & Inventory", labels: ["Sales", "Inventory", "Reports"] },
};

function webSVG(title, label, accent) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="750" viewBox="0 0 1000 750">
    <rect width="1000" height="750" fill="#eef0f5"/>
    <rect x="60" y="70" width="880" height="610" rx="16" fill="#fff" stroke="#d8dbe6"/>
    <rect x="60" y="70" width="880" height="46" rx="16" fill="#f3f4f8"/>
    <circle cx="86" cy="93" r="6" fill="#ff5f57"/><circle cx="106" cy="93" r="6" fill="#febc2e"/><circle cx="126" cy="93" r="6" fill="#28c840"/>
    <rect x="170" y="80" width="620" height="26" rx="13" fill="#e6e8f0"/>
    <text x="186" y="98" font-family="Arial" font-size="13" fill="#9aa">onlinetechug.com</text>
    <rect x="60" y="116" width="880" height="92" fill="${INK}"/>
    <text x="92" y="165" font-family="Arial" font-size="30" font-weight="bold" fill="#fff">${esc(title)}</text>
    <rect x="780" y="140" width="130" height="36" rx="8" fill="${ORANGE}"/>
    <text x="845" y="164" font-family="Arial" font-size="14" font-weight="bold" fill="#fff" text-anchor="middle">${esc(label)}</text>
    ${[0, 1, 2].map((i) => `<rect x="${92 + i * 280}" y="250" width="250" height="150" rx="12" fill="#f3f4f8" stroke="#e2e4ee"/><rect x="${112 + i * 280}" y="270" width="60" height="60" rx="8" fill="${accent}"/><rect x="${112 + i * 280}" y="345" width="180" height="12" rx="6" fill="#d8dbe6"/><rect x="${112 + i * 280}" y="367" width="120" height="10" rx="5" fill="#e6e8f0"/>`).join("")}
    <rect x="92" y="430" width="816" height="14" rx="7" fill="#e6e8f0"/>
    <rect x="92" y="458" width="700" height="14" rx="7" fill="#eceef4"/>
    <rect x="92" y="486" width="760" height="14" rx="7" fill="#eceef4"/>
    <rect x="92" y="540" width="816" height="110" rx="12" fill="#fbece6"/>
    <text x="500" y="600" font-family="Arial" font-size="18" font-weight="bold" fill="${ORANGE}" text-anchor="middle">Built by Online Tech Uganda</text>
  </svg>`;
}

function appSVG(title, label, accent) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="750" viewBox="0 0 1000 750">
    <rect width="1000" height="750" fill="#eef0f5"/>
    <rect x="370" y="50" width="260" height="650" rx="36" fill="#111" />
    <rect x="384" y="64" width="232" height="622" rx="26" fill="#fff"/>
    <rect x="384" y="64" width="232" height="120" rx="26" fill="${INK}"/>
    <rect x="384" y="150" width="232" height="34" fill="${INK}"/>
    <text x="500" y="116" font-family="Arial" font-size="18" font-weight="bold" fill="#fff" text-anchor="middle">${esc(title)}</text>
    <rect x="430" y="135" width="140" height="26" rx="13" fill="${ORANGE}"/>
    <text x="500" y="153" font-family="Arial" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">${esc(label)}</text>
    ${[0, 1, 2, 3].map((i) => `<rect x="404" y="${205 + i * 86}" width="192" height="70" rx="12" fill="#f3f4f8" stroke="#e6e8f0"/><circle cx="438" cy="${240 + i * 86}" r="18" fill="${accent}"/><rect x="466" y="${228 + i * 86}" width="110" height="11" rx="5" fill="#d8dbe6"/><rect x="466" y="${248 + i * 86}" width="80" height="9" rx="4" fill="#e6e8f0"/>`).join("")}
    <rect x="440" y="668" width="120" height="6" rx="3" fill="#ccc"/>
  </svg>`;
}

for (const [slug, p] of Object.entries(PROJECTS)) {
  const accents = [ORANGE, INK, "#3c3a87"];
  for (let i = 0; i < p.labels.length; i++) {
    const svg = p.kind === "app" ? appSVG(p.title, p.labels[i], accents[i]) : webSVG(p.title, p.labels[i], accents[i]);
    await sharp(Buffer.from(svg)).webp({ quality: 88 }).toFile(path.join(OUT, `${slug}-${i + 1}.webp`));
  }
  console.log("mockups:", slug);
}
console.log("done");
