// Pure builders for the WhatsApp order text — the PRODUCT part only. The
// buyer's details block is appended by the WhatsAppOrder button (client-side),
// pre-filled from their registered account when they're signed in.

/** Store (house-catalogue) product. The link makes WhatsApp preview the photo. */
export function storeOrderMessage(p: {
  name: string;
  priceLabel: string;
  condition: string;
  category: string;
  url: string;
}): string {
  return (
    `Hi Online Tech Uganda! 👋\n\nI'd like to ORDER this product:\n\n` +
    `🛒 ${p.name}\n💰 ${p.priceLabel}\n📦 ${p.condition} · ${p.category}\n🔗 ${p.url}`
  );
}

/** Marketplace / vendor product. */
export function vendorOrderMessage(p: {
  name: string;
  priceLabel: string;
  vendor: string;
  category: string;
  url?: string;
}): string {
  return (
    `Hi Online Tech Uganda! 👋\n\nI'd like to ORDER this marketplace product:\n\n` +
    `🛒 ${p.name}\n💰 ${p.priceLabel}\n🏪 Sold by: ${p.vendor}\n📦 ${p.category}` +
    (p.url ? `\n🔗 ${p.url}` : "")
  );
}
