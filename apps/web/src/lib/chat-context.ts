// What the customer is looking at when they reach for a chat button.
//
// A message that says only "I found you online, please assist" leaves the shop
// to ask which product or which course — and the customer to explain again
// what was on their screen. A page about one thing leaves a marker saying what
// it is; any other page is described by its heading and its address. Either
// way the message that arrives names the very thing the customer chose.

export type ChatContext = {
  kind: "product" | "course" | "page";
  name: string;
  price: string;
  url: string;
  /** A phone: ordered on the phones' line, with the owner told. */
  phone: boolean;
};

export const CHAT_CONTEXT_ID = "chat-context";

/** Read from the page the customer is on. Null on the home page, which is about everything. */
export function readChatContext(): ChatContext | null {
  const mark = document.getElementById(CHAT_CONTEXT_ID);
  const url = window.location.href.split("#")[0];
  if (mark) {
    const d = mark.dataset;
    return {
      kind: d.kind === "course" ? "course" : "product",
      name: d.name ?? "",
      price: d.price ?? "",
      url: d.url || url,
      phone: d.phone === "1",
    };
  }
  const path = window.location.pathname;
  if (path === "/") return null;
  if (path === "/shop" && new URLSearchParams(window.location.search).get("cat") === "Phones") {
    return { kind: "page", name: "Phones", price: "", url, phone: true };
  }
  const heading = document.querySelector("main h1, h1")?.textContent?.replace(/\s+/g, " ").trim();
  const name = heading || document.title.split("|")[0].trim();
  return name ? { kind: "page", name, price: "", url, phone: false } : null;
}

/** The opening message for a chat about that context. */
export function chatMessage(c: ChatContext | null): string {
  if (!c) {
    return "Hello Online Tech Uganda! 👋 I found you online. You deal in computers & accessories, laptop repairs & IT support, website/app & software development, and computer courses. I'd like to know more / get help with one of these — please assist me.";
  }
  const price = c.price ? `\n💰 ${c.price}` : "";
  if (c.kind === "product") {
    return `Hello Online Tech Uganda 👋\n\nI am interested in this ${c.phone ? "phone" : "product"} on your website:\n\n🛒 ${c.name}${price}\n🔗 ${c.url}\n\nIs it available? Please tell me how I can get it.`;
  }
  if (c.kind === "course") {
    return `Hello Online Tech Uganda 👋\n\nI am interested in this course on your website:\n\n🎓 ${c.name}${price}\n🔗 ${c.url}\n\nPlease tell me how to register and when classes start.`;
  }
  return `Hello Online Tech Uganda 👋\n\nI am on this page of your website and would like your help:\n\n📄 ${c.name}\n🔗 ${c.url}`;
}
