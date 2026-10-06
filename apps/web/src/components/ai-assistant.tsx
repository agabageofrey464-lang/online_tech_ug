"use client";

import { useEffect, useRef, useState } from "react";
import { Headset, X, Send } from "lucide-react";
import { whatsappLink, site } from "@/lib/site";

type Msg = { from: "bot" | "you"; text: string };

// Lightweight keyword-matched knowledge base (no external API needed).
const KB: { keys: string[]; answer: string }[] = [
  { keys: ["hi", "hello", "hey", "yo", "good"], answer: "Hi! 👋 I'm OnlineTech Assistant. Ask me about laptops, prices, delivery, payment, courses, repairs or our services." },
  { keys: ["laptop", "computer", "macbook", "dell", "hp", "lenovo", "buy", "product", "price", "cost", "how much"], answer: "We sell laptops, desktops, accessories, RAM/SSD, networking & storage — from UGX 65,000. Browse the Shop and filter by category or brand. Want a recommendation? Tell me your budget and use." },
  { keys: ["deliver", "delivery", "shipping", "ship", "town"], answer: "We deliver countrywide. The fee depends on distance: UGX 10,000 in and around Kampala, and UGX 20,000 to 75,000 upcountry. Checkout shows the exact fee for your town." },
  { keys: ["pay", "payment", "momo", "mobile money", "airtel", "mtn", "cash", "bank"], answer: "You can pay with MTN/Airtel Mobile Money, bank transfer or card, or in cash when you collect from our shop in Kampala. We don't take cash on delivery — what we deliver has already been paid for. For lessons, you pay via MoMo and we send an unlock code." },
  { keys: ["course", "learn", "lesson", "class", "certificate", "quiz"], answer: "Our Learn section has courses (Computer Basics, MS Office, Internet & Email, Typing). First lesson is FREE, others unlock from UGX 1,000. Finish + pass the quiz to earn a certificate. There are live classes too!" },
  { keys: ["website", "app", "software", "system", "develop", "build", "quote"], answer: "We build websites, mobile apps and systems (school, hospital, HR, POS, SACCO). See our Portfolio, or use 'Request Software' for a free quote." },
  { keys: ["repair", "fix", "broken", "service", "screen", "battery", "upgrade"], answer: "We repair laptops & desktops — screens, batteries, RAM/SSD upgrades, OS installs — onsite & remote, from UGX 30,000 with free diagnosis." },
  { keys: ["track", "project", "progress", "status"], answer: "Clients can track their project on the 'Track Project' page using the code we send you." },
  { keys: ["job", "internship", "career", "work", "hire", "vacancy"], answer: "We post IT jobs & internships on the Jobs page — apply on WhatsApp or email your CV." },
  { keys: ["location", "where", "office", "address", "shop"], answer: `We're at ${site.address}. Call ${site.phoneDisplay} or message us on WhatsApp anytime.` },
  { keys: ["contact", "phone", "call", "number", "email", "whatsapp"], answer: `Call or WhatsApp ${site.phoneDisplay}. WhatsApp-only line: ${site.whatsappAltDisplay}. Or email ${site.email}.` },
  { keys: ["warranty", "genuine", "used", "new", "quality"], answer: "All devices are quality-checked. UK-used business laptops are tested (battery, screen, ports, performance); brand-new items come with warranty." },
];

const CHIPS = ["Laptop prices", "Delivery", "Payment", "Courses", "Repairs", "Talk to a human"];

function answerFor(q: string): string {
  const t = q.toLowerCase();
  let best: { score: number; answer: string } | null = null;
  for (const item of KB) {
    const score = item.keys.reduce((s, k) => (t.includes(k) ? s + 1 : s), 0);
    if (score > 0 && (!best || score > best.score)) best = { score, answer: item.answer };
  }
  return (
    best?.answer ??
    `I'm not sure about that one 🤔 — tap 'Talk to a human' to reach our team on WhatsApp, call ${site.phoneDisplay}, or email ${site.email}.`
  );
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "bot", text: "Hi! 👋 I'm the OnlineTech Assistant. How can I help — products, delivery, payment, courses or services?" },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  function send(text: string) {
    const q = text.trim();
    if (!q) return;
    if (q.toLowerCase().includes("human") || q.toLowerCase().includes("agent")) {
      window.open(whatsappLink("Hi, I'd like to talk to your team."), "_blank");
      setMsgs((m) => [...m, { from: "you", text: q }, { from: "bot", text: "Opening WhatsApp so you can chat with our team 👍" }]);
      setInput("");
      return;
    }
    setMsgs((m) => [...m, { from: "you", text: q }, { from: "bot", text: answerFor(q) }]);
    setInput("");
  }

  return (
    <>
      {/* Launcher (bottom-left, clear of the WhatsApp button) */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open chat assistant"
        className="fixed bottom-20 left-4 z-40 flex items-center gap-2 rounded-full bg-ink-700 px-3.5 py-3.5 text-white shadow-xl shadow-black/25 transition hover:bg-ink-600 sm:left-5 md:bottom-5"
      >
        {open ? <X size={22} /> : <Headset size={22} />}
        {!open && <span className="hidden pr-1 text-sm font-bold sm:inline">Ask AI</span>}
      </button>

      {open && (
        <div className="fixed bottom-36 left-4 z-40 flex h-[28rem] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-ink-600/10 bg-white shadow-2xl sm:left-5 md:bottom-24">
          <div className="flex items-center gap-2 bg-ink-700 px-4 py-3 text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500">
              <Headset size={18} />
            </span>
            <div className="flex-1 leading-tight">
              <p className="text-sm font-extrabold">OnlineTech Assistant</p>
              <p className="text-[11px] text-white/70">Usually replies instantly</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-ink-50/40 p-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "you" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    m.from === "you" ? "bg-brand-500 text-white" : "bg-white text-ink-800 shadow-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {CHIPS.map((c) => (
                <button
                  key={c}
                  onClick={() => send(c)}
                  className="rounded-full border border-ink-600/15 bg-white px-2.5 py-1 text-xs font-medium text-ink-700 hover:border-brand-300 hover:text-brand-600"
                >
                  {c}
                </button>
              ))}
            </div>
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-ink-600/10 p-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              className="flex-1 rounded-full border border-ink-600/15 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            <button type="submit" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-600">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
