import { type Product } from "@/lib/data";
import { ProductCard } from "@/components/product-card";

/**
 * The tile used in the Price Drops band. It is the standard product card —
 * which already shows a crossed-out price only when the product has a recorded
 * old one — kept under its own name so the band can be given a different tile
 * later without touching the home page.
 */
export function FlashSaleCard({ product }: { product: Product }) {
  return <ProductCard product={product} />;
}
