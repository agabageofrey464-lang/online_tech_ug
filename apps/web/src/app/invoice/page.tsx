"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Check, Send, AlertCircle, MessageCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { site, whatsappLink } from "@/lib/site";

/**
 * Proforma invoice / quotation requests.
 *
 * Business, NGO and school buyers cannot raise a payment on a WhatsApp message
 * — their finance office needs a document with figures on it. This collects
 * what has to appear on that document so the owner can issue it in one pass
 * instead of three rounds of questions.
 *
 * It posts to the existing contact endpoint, so the request lands in the admin
 * alongside other enquiries and is emailed through the same route.
 */

type Doc = "Proforma invoice" | "Quotation";

const NEEDS = [
  "A document your finance office can act on",
  "Itemised figures, not a chat message",
  "Your details shown exactly as you need them",
  "Sent by email, ready to forward",
];

export default function InvoiceRequestPage() {
  const [doc, setDoc] = useState<Doc>("Proforma invoice");
  const [org, setOrg] = useState("");
  const [person, setPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tin, setTin] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState("");
  const [notes, setNotes] = useState("");

  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const field =
    "mt-1 w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    if (!org.trim() || !person.trim()) return setErr("Please give the organisation and contact person.");
    if (phone.trim().length < 5) return setErr("Please give a phone number we can reach you on.");
    if (!email.trim()) return setErr("We need an email address to send the document to.");
    if (items.trim().length < 10) return setErr("Please describe what you need quoted.");

    setSending(true);
    try {
      const message = [
        `Document requested: ${doc}`,
        `Organisation: ${org.trim()}`,
        `Contact person: ${person.trim()}`,
        `Email: ${email.trim()}`,
        `Phone: ${phone.trim()}`,
        tin.trim() ? `Their TIN: ${tin.trim()}` : "Their TIN: (not given)",
        address.trim() ? `Address: ${address.trim()}` : "",
        "",
        "Items / services required:",
        items.trim(),
        notes.trim() ? `\nNotes: ${notes.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const res = await fetch("/_api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: person.trim(),
          phone: phone.trim(),
          email: email.trim(),
          subject: `${doc} request — ${org.trim()}`,
          message,
        }),
      });

      if (res.ok) {
        setDone(true);
      } else {
        const d = await res.json().catch(() => ({}));
        setErr(typeof d?.detail === "string" ? d.detail : "Couldn't send that. Please try WhatsApp instead.");
      }
    } catch {
      setErr("Network problem — please try again, or send it on WhatsApp.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-lg rounded-card border border-ink-600/10 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
            <Check size={28} />
          </span>
          <h1 className="mt-4 text-xl font-extrabold text-ink-900">Request received</h1>
          <p className="mt-2 text-sm text-ink-700/75">
            We&apos;ll prepare your {doc.toLowerCase()} and email it to{" "}
            <b className="text-ink-900">{email}</b>, usually within one working day. If it&apos;s
            urgent, message us and we&apos;ll do it straight away.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <a
              href={whatsappLink(`Hi, I've just requested a ${doc.toLowerCase()} for ${org}. It's urgent.`)}
              target="_blank"
              rel="noreferrer"
              className="press rounded-md bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700"
            >
              It&apos;s urgent
            </a>
            <Link
              href="/shop"
              className="press rounded-md border border-ink-600/20 px-5 py-2.5 text-sm font-bold text-ink-700 hover:bg-ink-50"
            >
              Back to shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Request an invoice" }]} />
      </div>

      <header className="mb-6 flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <FileText size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-black text-ink-900">Request an invoice or quotation</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-700/70">
            Buying for a company, school, church or NGO? Tell us what you need and we&apos;ll send a
            document your finance office can work from.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <form onSubmit={submit} className="rounded-card border border-ink-600/10 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-ink-900">What do you need?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["Proforma invoice", "Quotation"] as Doc[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDoc(d)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  doc === d
                    ? "bg-brand-500 text-white"
                    : "border border-ink-600/15 text-ink-700 hover:border-brand-400"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-ink-700/55">
            {doc === "Proforma invoice"
              ? "A pre-payment document with figures — what most finance offices need to release funds."
              : "A priced offer for work or goods, with no obligation to buy."}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-ink-700">
                Organisation name <span className="text-red-500">*</span>
              </label>
              <input value={org} onChange={(e) => setOrg(e.target.value)} placeholder="e.g. Kampala Parents School" className={field} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700">
                Contact person <span className="text-red-500">*</span>
              </label>
              <input value={person} onChange={(e) => setPerson(e.target.value)} placeholder="Your full name" className={field} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700">
                Phone <span className="text-red-500">*</span>
              </label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07xx xxx xxx" className={field} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="finance@yourorg.com" className={field} />
              <p className="mt-1 text-[11px] text-ink-700/50">We send the document here.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700">Your TIN</label>
              <input value={tin} onChange={(e) => setTin(e.target.value)} placeholder="Optional" className={field} />
              <p className="mt-1 text-[11px] text-ink-700/50">If your finance office needs it shown.</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-ink-700">Delivery address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Where goods should be delivered" className={field} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-ink-700">
                What should we quote? <span className="text-red-500">*</span>
              </label>
              <textarea
                value={items}
                onChange={(e) => setItems(e.target.value)}
                rows={5}
                placeholder={"e.g.\n10 x HP EliteBook 840 G8\n2 x HP LaserJet printer\nNetwork setup for 2 offices"}
                className={field}
              />
              <p className="mt-1 text-[11px] text-ink-700/50">
                List items and quantities, or describe the work. The more detail, the more accurate
                the figures.
              </p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-ink-700">Anything else?</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Payment terms, deadline, LPO number…"
                className={field}
              />
            </div>
          </div>

          {err && (
            <p className="mt-4 flex items-start gap-1.5 text-sm font-semibold text-red-600">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="press mt-5 inline-flex items-center gap-2 rounded-md bg-brand-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            <Send size={16} /> {sending ? "Sending…" : `Request ${doc.toLowerCase()}`}
          </button>
        </form>

        <aside className="h-fit space-y-3">
          <div className="rounded-card border border-ink-600/10 bg-white p-5 shadow-sm">
            <p className="font-extrabold text-ink-900">Why request one</p>
            <ul className="mt-2.5 space-y-1.5">
              {NEEDS.map((n) => (
                <li key={n} className="flex items-start gap-1.5 text-sm text-ink-700/75">
                  <Check size={14} className="mt-0.5 shrink-0 text-green-600" />
                  {n}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card bg-ink-700 p-5 text-white">
            <p className="font-extrabold">Need it today?</p>
            <p className="mt-1 text-sm text-white/80">
              Message us and we&apos;ll prepare it while you wait.
            </p>
            <a
              href={whatsappLink("Hi, I need a proforma invoice urgently. Here's what for:")}
              target="_blank"
              rel="noreferrer"
              className="press mt-3 inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700"
            >
              <MessageCircle size={15} /> WhatsApp us
            </a>
            <p className="mt-3 break-all text-xs text-white/60">{site.email}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
