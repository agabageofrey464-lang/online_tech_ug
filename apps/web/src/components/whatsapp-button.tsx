"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { chatMessage, readChatContext, type ChatContext } from "@/lib/chat-context";
import { site, whatsappLink } from "@/lib/site";

/**
 * The green chat button in the corner of every page.
 *
 * It is the button most people reach for, so the message it opens says what
 * they were looking at: the product and its price, the course and its fee, or
 * the page they were on. The shop then knows what is being asked about without
 * having to ask.
 *
 * While the customer is looking at a phone it opens on the phones' line, where
 * phone orders are taken, and the owner is told — as the page's own "Order on
 * WhatsApp" button does. Everything else goes to the shop's number.
 */
export function WhatsAppButton() {
  const pathname = usePathname();
  const [ctx, setCtx] = useState<ChatContext | null>(null);

  useEffect(() => {
    const read = () => setCtx(readChatContext());
    read();
    // A page's marker and heading arrive with its content, which can follow the route change.
    const t = setTimeout(read, 700);
    return () => clearTimeout(t);
  }, [pathname]);

  const message = chatMessage(ctx);
  const href = ctx?.phone ? `https://wa.me/${site.phoneOrders.whatsapp}?text=${encodeURIComponent(message)}` : whatsappLink(message);
  const label = ctx?.phone ? "Order this phone" : ctx?.kind === "product" ? "Ask about this" : ctx?.kind === "course" ? "Ask about this course" : "Chat with us";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`${label} on WhatsApp`}
      onClick={(e) => {
        // Read again at the moment of the tap, so the message is about what is
        // on screen now even if the page changed without a new route.
        const now = readChatContext();
        const text = chatMessage(now);
        e.currentTarget.href = now?.phone ? `https://wa.me/${site.phoneOrders.whatsapp}?text=${encodeURIComponent(text)}` : whatsappLink(text);
        if (!now?.phone) return;
        try {
          const body = JSON.stringify({ product: now.kind === "product" ? now.name : "A phone (from the phones shelf)", price: now.price, url: now.url, line: site.phoneOrders.display });
          navigator.sendBeacon("/_api/orders/whatsapp-lead", new Blob([body], { type: "application/json" }));
        } catch {
          /* the chat still opens */
        }
      }}
      className="group fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-3.5 py-3.5 text-white shadow-xl shadow-black/25 transition hover:brightness-105 sm:right-5 md:bottom-5"
    >
      {/* pulse ring */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366] opacity-30"
      />
      <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0 fill-current" aria-hidden>
        <path d="M16 .5C7.5.5.6 7.4.6 15.9c0 2.8.7 5.4 2.1 7.8L.5 31.5l8-2.1c2.3 1.2 4.8 1.9 7.5 1.9 8.5 0 15.4-6.9 15.4-15.4S24.5.5 16 .5zm0 28c-2.4 0-4.7-.6-6.7-1.8l-.5-.3-4.7 1.2 1.3-4.6-.3-.5c-1.3-2.1-2-4.5-2-7 0-7.1 5.8-12.9 12.9-12.9S28.9 8.8 28.9 15.9 23.1 28.5 16 28.5zm7.1-9.6c-.4-.2-2.3-1.1-2.6-1.3-.3-.1-.6-.2-.8.2-.2.4-.9 1.3-1.1 1.5-.2.2-.4.3-.8.1-.4-.2-1.6-.6-3.1-1.9-1.1-1-1.9-2.3-2.1-2.7-.2-.4 0-.6.2-.8.2-.2.4-.4.5-.7.2-.2.2-.4.4-.6.1-.3 0-.5 0-.7-.1-.2-.8-2-1.1-2.7-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.4-.3.4-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.2 2.5 3.8 6 5.3.8.4 1.5.6 2 .8.8.3 1.6.2 2.2.1.7-.1 2.3-.9 2.6-1.8.3-.9.3-1.6.2-1.8-.1-.2-.3-.3-.7-.5z" />
      </svg>
      {/* label — hidden on small screens, shown from sm so it clearly communicates */}
      <span className="hidden pr-1 text-sm font-bold sm:inline">{label}</span>
    </a>
  );
}
