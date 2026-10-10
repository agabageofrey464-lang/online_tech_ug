"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site, whatsappLink } from "@/lib/site";

const GENERAL =
  "Hello Online Tech Uganda! 👋 I found you online. You deal in computers & accessories, laptop repairs & IT support, website/app & software development, and computer courses. I'd like to know more / get help with one of these — please assist me.";

type PhoneContext = { product: string; price: string; url: string };

/**
 * The green chat button in the corner of every page.
 *
 * It opens a chat with the shop — except while a customer is looking at a
 * phone. Phone orders are taken on the phones' line, and this button is the
 * one most people reach for, so on a phone's page, and on the phones shelf, it
 * goes to that line too and the owner is told, exactly as the page's own
 * "Order on WhatsApp" button does.
 */
export function WhatsAppButton() {
  const pathname = usePathname();
  const [phone, setPhone] = useState<PhoneContext | null>(null);

  useEffect(() => {
    // A phone's page leaves a marker saying which phone it is. The shelf of
    // phones has no single product, so the chat is about phones in general.
    const read = () => {
      const mark = document.getElementById("phone-order-context");
      if (mark) {
        setPhone({ product: mark.dataset.product ?? "", price: mark.dataset.price ?? "", url: mark.dataset.url ?? "" });
      } else if (pathname === "/shop" && new URLSearchParams(window.location.search).get("cat") === "Phones") {
        setPhone({ product: "", price: "", url: `${site.url}/shop?cat=Phones` });
      } else {
        setPhone(null);
      }
    };
    read();
    // The marker arrives with the page's content, which can follow the route change.
    const t = setTimeout(read, 600);
    return () => clearTimeout(t);
  }, [pathname]);

  const href = phone
    ? `https://wa.me/${site.phoneOrders.whatsapp}?text=${encodeURIComponent(
        phone.product
          ? `Hi Online Tech Uganda! 👋\n\nI'd like to ORDER this phone:\n\n🛒 ${phone.product}\n💰 ${phone.price}\n🔗 ${phone.url}`
          : "Hi Online Tech Uganda! 👋 I'd like to order a phone. Please help me choose.",
      )}`
    : whatsappLink(GENERAL);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={phone ? "Order this phone on WhatsApp" : "Chat with us on WhatsApp"}
      onClick={() => {
        if (!phone) return;
        try {
          const body = JSON.stringify({ product: phone.product || "A phone (from the phones shelf)", price: phone.price, url: phone.url, line: site.phoneOrders.display });
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
      <span className="hidden pr-1 text-sm font-bold sm:inline">{phone ? "Order this phone" : "Chat with us"}</span>
    </a>
  );
}
