import { Phone, Mail, MessageCircle } from "lucide-react";
import { site, whatsappLink } from "@/lib/site";

/**
 * The three ways to reach us, offered consistently.
 *
 * Several pages offered WhatsApp only. Not everyone uses it — institutions and
 * schools in particular want something in writing they can forward internally —
 * so call, WhatsApp and email now appear together wherever we ask someone to
 * get in touch.
 */
export function ContactOptions({
  /** Pre-fills both the WhatsApp message and the email subject. */
  subject = "Enquiry",
  message,
  heading = "Talk to us",
  note,
  tone = "light",
  className = "",
}: {
  subject?: string;
  message?: string;
  heading?: string;
  note?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const text = message ?? `Hi Online Tech Uganda, ${subject.toLowerCase()}:`;
  const dark = tone === "dark";

  return (
    <section
      className={`rounded-card p-6 ${dark ? "bg-ink-700 text-white" : "border border-ink-600/10 bg-white shadow-sm"} ${className}`}
    >
      <h2 className={`text-lg font-extrabold ${dark ? "text-white" : "text-ink-900"}`}>{heading}</h2>
      {note && (
        <p className={`mt-1 text-sm ${dark ? "text-white/80" : "text-ink-700/70"}`}>{note}</p>
      )}

      {/* Stacks on a phone, sits in a row from small screens up. */}
      <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
        <a
          href={`tel:${site.phoneDisplay.replace(/\s/g, "")}`}
          className="press flex items-center justify-center gap-2 rounded-md bg-brand-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-600"
        >
          <Phone size={16} /> Call us
        </a>
        <a
          href={whatsappLink(text)}
          target="_blank"
          rel="noreferrer"
          className="press flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700"
        >
          <MessageCircle size={16} /> WhatsApp
        </a>
        <a
          href={`mailto:${site.email}?subject=${encodeURIComponent(subject)}`}
          className={`press flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-bold transition ${
            dark
              ? "bg-white text-ink-900 hover:bg-white/90"
              : "border border-ink-600/20 text-ink-800 hover:bg-ink-50"
          }`}
        >
          <Mail size={16} /> Email us
        </a>
      </div>

      {/* The actual details, selectable and readable on every screen. */}
      <div
        className={`mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ${dark ? "text-white/70" : "text-ink-700/60"}`}
      >
        <a href={`tel:${site.phoneDisplay.replace(/\s/g, "")}`} className="hover:underline">
          {site.phoneDisplay}
        </a>
        <a href={`mailto:${site.email}`} className="break-all hover:underline">
          {site.email}
        </a>
        <span>{site.address}</span>
      </div>
    </section>
  );
}
