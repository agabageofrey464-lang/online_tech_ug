import { whatsappLink } from "@/lib/site";

/**
 * Compact "Order on WhatsApp" button used across every product listing (store,
 * marketplace, vendors). The pre-filled `message` should carry the exact
 * product + details so the owner sees what was ordered and where to deliver.
 * Always targets the business WhatsApp number via whatsappLink().
 */
// Build a wa.me link to a specific number (raw, e.g. "0756..."), else fall back
// to the business WhatsApp via whatsappLink().
function orderHref(message: string, phone?: string): string {
  if (phone) {
    const num = phone.replace(/\D/g, "").replace(/^0/, "256");
    if (num.length >= 11) return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
  }
  return whatsappLink(message);
}

export function WhatsAppOrder({
  message,
  phone,
  disabled = false,
  className = "",
}: {
  message: string;
  /** Route the order to this number instead of the business one (e.g. a paid vendor's phone). */
  phone?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <a
      href={disabled ? undefined : orderHref(message, phone)}
      target="_blank"
      rel="noreferrer"
      aria-disabled={disabled}
      className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[12px] font-bold transition ${
        disabled
          ? "cursor-not-allowed bg-ink-100 text-ink-700/50"
          : "bg-[#25D366] text-white hover:brightness-105"
      } ${className}`}
    >
      <svg viewBox="0 0 32 32" width="15" height="15" fill="currentColor" aria-hidden>
        <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.6 6L4 29l8.2-2.1c1.7.9 3.7 1.4 5.8 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.9 0-3.7-.5-5.3-1.5l-.4-.2-4.9 1.3 1.3-4.8-.3-.4A9.7 9.7 0 016 15c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 9.8-10 9.8zm5.5-7.3c-.3-.2-1.8-.9-2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.3-.7.1a8 8 0 01-2.4-1.5 9 9 0 01-1.6-2.1c-.2-.3 0-.5.1-.7l.5-.6.3-.5c.1-.2 0-.4 0-.6l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.4-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.3 2.5 3.8 6 5.3.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.8-.7 2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z" />
      </svg>
      Order on WhatsApp
    </a>
  );
}

/** Builds a rich order message for the house catalogue (store products). */
export function storeOrderMessage(p: {
  name: string;
  priceLabel: string;
  condition: string;
  category: string;
  url: string;
}): string {
  return (
    `Hi Online Tech Uganda! 👋\n\nI'd like to ORDER this product:\n\n` +
    `🛒 ${p.name}\n💰 ${p.priceLabel}\n📦 ${p.condition} · ${p.category}\n🔗 ${p.url}\n\n` +
    `My name: \nDelivery location (please share your location): `
  );
}

/** Builds a rich order message for a marketplace/vendor product. */
export function vendorOrderMessage(p: {
  name: string;
  priceLabel: string;
  vendor: string;
  category: string;
}): string {
  return (
    `Hi Online Tech Uganda! 👋\n\nI'd like to ORDER this marketplace product:\n\n` +
    `🛒 ${p.name}\n💰 ${p.priceLabel}\n🏪 Sold by: ${p.vendor}\n📦 ${p.category}\n\n` +
    `My name: \nDelivery location (please share your location): `
  );
}
