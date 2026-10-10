"use client";

import { whatsappLink } from "@/lib/site";
import { useAuth } from "@/lib/auth";

// Build a wa.me link to a specific number (raw, e.g. "0756..."), else fall back
// to the business WhatsApp via whatsappLink().
function orderHref(message: string, phone?: string): string {
  if (phone) {
    const num = phone.replace(/\D/g, "").replace(/^0/, "256");
    if (num.length >= 11) return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
  }
  return whatsappLink(message);
}

// The buyer-details block. When the customer is signed in, their registered
// name / email / phone (from our website or their Google account) are filled in
// automatically; otherwise it prompts them to type it.
function detailsBlock(user: { name: string; email: string; phone?: string } | null): string {
  if (user) {
    return (
      `\n\n———  MY DETAILS  ———\n` +
      `👤 Name: ${user.name}\n` +
      `📧 Email: ${user.email}\n` +
      `📞 Phone: ${user.phone || ""}\n` +
      `📍 Delivery location: (tap 📎 → Location to share your exact spot)\n` +
      `\n(Registered customer on onlinetechug.com)`
    );
  }
  return (
    `\n\n———  MY DETAILS  ———\n` +
    `👤 Name: \n` +
    `📞 Phone: \n` +
    `📍 Delivery location: (tap 📎 → Location to share your exact spot)`
  );
}

/**
 * Compact "Order on WhatsApp" button used across every product listing. The
 * `message` is the product part; the buyer's details are appended here, filled
 * from their signed-in account when available.
 */
export function WhatsAppOrder({
  message,
  phone,
  disabled = false,
  className = "",
  label = "Order on WhatsApp",
  brand = false,
  report,
}: {
  message: string;
  /** Route the order to this number instead of the business one (e.g. a paid vendor's phone). */
  phone?: string;
  disabled?: boolean;
  className?: string;
  /** Button text. */
  label?: string;
  /** Use the brand-orange style instead of WhatsApp green. */
  brand?: boolean;
  /**
   * Set when the chat opens on a line other than the owner's: the owner is
   * told which product it was for, so an order taken there is never unknown
   * to the shop.
   */
  report?: { product: string; price: string; url: string; line: string };
}) {
  const { user } = useAuth();
  const full = message + detailsBlock(user);

  return (
    <a
      href={disabled ? undefined : orderHref(full, phone)}
      onClick={() => {
        if (disabled || !report) return;
        try {
          const body = JSON.stringify({ ...report, customer_name: user?.name ?? "", customer_phone: user?.phone ?? "" });
          // A beacon is sent even as the page gives way to WhatsApp.
          navigator.sendBeacon("/_api/orders/whatsapp-lead", new Blob([body], { type: "application/json" }));
        } catch {
          /* the chat still opens */
        }
      }}
      target="_blank"
      rel="noreferrer"
      aria-disabled={disabled}
      className={`press flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[12px] font-bold transition ${
        disabled
          ? "cursor-not-allowed bg-ink-100 text-ink-700/50"
          : brand
            ? "bg-brand-500 text-white hover:bg-brand-600"
            : "bg-[#25D366] text-white hover:brightness-105"
      } ${className}`}
    >
      <svg viewBox="0 0 32 32" width="15" height="15" fill="currentColor" aria-hidden>
        <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.6 6L4 29l8.2-2.1c1.7.9 3.7 1.4 5.8 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.9 0-3.7-.5-5.3-1.5l-.4-.2-4.9 1.3 1.3-4.8-.3-.4A9.7 9.7 0 016 15c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 9.8-10 9.8zm5.5-7.3c-.3-.2-1.8-.9-2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.3-.7.1a8 8 0 01-2.4-1.5 9 9 0 01-1.6-2.1c-.2-.3 0-.5.1-.7l.5-.6.3-.5c.1-.2 0-.4 0-.6l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.4-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.3 2.5 3.8 6 5.3.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.8-.7 2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z" />
      </svg>
      {label}
    </a>
  );
}
