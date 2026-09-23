import { products, type Product } from "@/lib/data";

/**
 * Budget-first laptop matching.
 *
 * People here shop by "I have 1.5M, what can I get?" — not by filtering a spec
 * sheet. This scores real stock against a budget and an intended use, and is
 * deliberately honest: if nothing in the catalogue genuinely suits the job at
 * that price, it says so rather than pushing the nearest machine.
 */

export type UseCase = "study" | "office" | "design" | "code" | "gaming";

export const USE_CASES: { key: UseCase; label: string; blurb: string; icon: string }[] = [
  { key: "study", label: "School & study", blurb: "Notes, research, assignments, Zoom", icon: "📚" },
  { key: "office", label: "Office & business", blurb: "Excel, email, accounts, reports", icon: "💼" },
  { key: "design", label: "Design & video", blurb: "Photoshop, Illustrator, editing", icon: "🎨" },
  { key: "code", label: "Programming", blurb: "Coding, databases, virtual machines", icon: "💻" },
  { key: "gaming", label: "Gaming", blurb: "Modern games at good frame rates", icon: "🎮" },
];

/** Minimum a machine realistically needs for each job. */
const NEEDS: Record<UseCase, { ram: number; ssd: boolean; gpu: boolean; cpuTier: number; floor: number }> = {
  study:  { ram: 4,  ssd: false, gpu: false, cpuTier: 1, floor: 700000 },
  office: { ram: 8,  ssd: true,  gpu: false, cpuTier: 2, floor: 900000 },
  design: { ram: 16, ssd: true,  gpu: true,  cpuTier: 3, floor: 2500000 },
  code:   { ram: 16, ssd: true,  gpu: false, cpuTier: 3, floor: 1800000 },
  gaming: { ram: 16, ssd: true,  gpu: true,  cpuTier: 3, floor: 3000000 },
};

const text = (p: Product) =>
  [p.name, ...(p.specs ?? []), ...Object.values(p.details ?? {})].join(" ").toLowerCase();

/** Rough CPU tier: 1 entry, 2 mid, 3 strong. */
function cpuTier(t: string): number {
  if (/core i9|ryzen 9|apple m[34]|core i7|ryzen 7|apple m[12] (pro|max)/.test(t)) return 3;
  if (/core i5|ryzen 5|apple m[12]|core ultra/.test(t)) return 2;
  if (/core i3|ryzen 3|celeron|pentium|athlon/.test(t)) return 1;
  return 2; // unknown — assume mid rather than punish it
}

function ramGB(t: string): number {
  const m = t.match(/(\d+)\s?gb (?:ddr|ram|unified|lpddr)/) ?? t.match(/(\d+)\s?gb ram/);
  return m ? Number(m[1]) : 0;
}

const hasSSD = (t: string) => /ssd|nvme|flash storage/.test(t);
const hasGPU = (t: string) =>
  /rtx|gtx|radeon rx|quadro|geforce|nvidia|dedicated|apple m[123] (pro|max)/.test(t) &&
  !/integrated|uhd graphics|iris/.test(t.replace(/rtx|gtx/g, ""));

export type Match = {
  product: Product;
  score: number;
  reasons: string[];
  warnings: string[];
};

/** Rank stock for a budget and a use case. Returns best fit first. */
export function findLaptops(budget: number, use: UseCase): Match[] {
  const need = NEEDS[use];

  return products
    .filter((p) => p.category === "Laptops" && p.inStock !== false && p.price <= budget)
    .map((p) => {
      const t = text(p);
      const ram = ramGB(t);
      const tier = cpuTier(t);
      const ssd = hasSSD(t);
      const gpu = hasGPU(t);

      let score = 0;
      const reasons: string[] = [];
      const warnings: string[] = [];

      if (tier >= need.cpuTier) { score += 30; reasons.push(tier >= 3 ? "Strong processor" : "Processor suits the work"); }
      else { score -= 20; warnings.push("Processor is light for this"); }

      if (ram >= need.ram) { score += 25; reasons.push(`${ram}GB RAM`); }
      else if (ram) { score -= 15; warnings.push(`Only ${ram}GB RAM — we can upgrade it`); }

      if (ssd) { score += 20; reasons.push("SSD — starts up fast"); }
      else if (need.ssd) { score -= 15; warnings.push("No SSD — slower to start"); }

      if (need.gpu) {
        if (gpu) { score += 25; reasons.push("Dedicated graphics"); }
        else { score -= 25; warnings.push("No dedicated graphics"); }
      }

      // Condition and value.
      if (p.condition === "Brand New") { score += 10; reasons.push("Brand new, 12-month warranty"); }
      else if (p.condition === "UK Used") reasons.push("UK Used, tested, 3-month warranty");

      score += Math.round((p.rating ?? 0) * 3);
      // Leaving money unspent is a plus, but only mildly.
      score += Math.round(((budget - p.price) / budget) * 8);

      return { product: p, score, reasons, warnings };
    })
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price);
}

/** Cheapest machine we would genuinely recommend for a job — for honest advice. */
export function entryPrice(use: UseCase): number {
  const good = findLaptops(Number.MAX_SAFE_INTEGER, use).filter((m) => m.warnings.length === 0);
  return good.length ? Math.min(...good.map((m) => m.product.price)) : NEEDS[use].floor;
}
