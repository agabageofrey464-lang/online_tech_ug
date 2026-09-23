"use client";

import { useState } from "react";
import type { AutoMessage } from "@/lib/auto-message";

/**
 * Reply to whoever wrote in — from any inbox.
 *
 * Applicants, customers, vendors and enquirers all go quiet for the same
 * reason: nobody told them where they stand. This puts a reply one tap away
 * wherever their details are already on screen, with the wording written
 * once so it reads the same whichever page it was sent from.
 *
 * Email goes out from the server. WhatsApp opens on the admin's own device,
 * because messaging an arbitrary number from the server needs a paid WhatsApp
 * Business account and a link reaches them just as fast.
 */

export type Template = { label: string; subject: string; body: (name: string) => string };

/** Hiring and internship applications. */
export const APPLICANT_TEMPLATES: Template[] = [
  {
    label: "Shortlisted",
    subject: "You've been shortlisted — Online Tech Uganda",
    body: () =>
      `Good news — your application has been shortlisted.\n\nWe'd like to meet you. Please reply with a day and time that suits you this week, or call us on the numbers below and we'll arrange it.\n\nBring your original certificates and a copy of your CV.`,
  },
  {
    label: "Invite to interview",
    subject: "Interview invitation — Online Tech Uganda",
    body: () =>
      `We'd like to invite you for an interview at our offices in Kampala.\n\nPlease reply with a day and time that works for you, and we'll confirm. Bring your original certificates and a copy of your CV.`,
  },
  {
    label: "Accepted",
    subject: "Your placement with Online Tech Uganda",
    body: () =>
      `We're pleased to offer you a place with us.\n\nPlease call us to confirm that you accept, and we'll agree your start date and what to bring on your first day. Your acceptance letter will follow.`,
  },
  {
    label: "Not successful",
    subject: "Your application — Online Tech Uganda",
    body: () =>
      `Thank you for applying to Online Tech Uganda, and for the time you put into it.\n\nOn this occasion we've taken other candidates forward. We'll keep your details on file and will be in touch if something suitable opens up.\n\nWe wish you the very best.`,
  },
  {
    label: "Need more information",
    subject: "A question about your application",
    body: () =>
      `Thank you for your application. Before we can take it further we need a little more from you.\n\nCould you reply with an up-to-date CV and your available start date? Once we have those we'll come straight back to you.`,
  },
];

/** Enquiries, quotes and proforma requests. */
export const ENQUIRY_TEMPLATES: Template[] = [
  {
    label: "We've received it",
    subject: "We've received your enquiry — Online Tech Uganda",
    body: () =>
      `Thank you for getting in touch. We've received your message and someone is looking at it now.\n\nWe'll come back to you within one working day. If it's urgent, please call us on the numbers below.`,
  },
  {
    label: "Quote is ready",
    subject: "Your quotation — Online Tech Uganda",
    body: () =>
      `Your quotation is ready and attached to this email.\n\nThe prices hold for 14 days. If you'd like anything added, removed or priced differently, just say and we'll revise it.`,
  },
  {
    label: "In stock",
    subject: "The item you asked about is in stock",
    body: () =>
      `The item you asked about is in stock and ready.\n\nCall us to confirm and we'll set one aside for you. We deliver countrywide.`,
  },
  {
    label: "Answering your question",
    subject: "About your enquiry — Online Tech Uganda",
    body: () => `Thank you for your enquiry.\n\n`,
  },
];

/** Course enrolments. */
export const ENROLMENT_TEMPLATES: Template[] = [
  {
    label: "Enrolment approved",
    subject: "Your enrolment is approved — Online Tech Uganda",
    body: () =>
      `Your enrolment has been approved. Welcome aboard.\n\nYour access code follows separately. Call us to confirm your class times and whether you'll be attending physically or online.`,
  },
  {
    label: "Payment received",
    subject: "We've received your payment",
    body: () =>
      `We've received your payment — thank you.\n\nYour place is confirmed. Call us and we'll agree your timetable and start date.`,
  },
  {
    label: "Payment pending",
    subject: "Completing your enrolment",
    body: () =>
      `We're holding your place, but we haven't seen your payment yet.\n\nOnce it comes through we'll activate your access straight away. If you've already paid, call us with the transaction details and we'll check.`,
  },
];

/** Vendors and freelancers applying to join. */
export const PARTNER_TEMPLATES: Template[] = [
  {
    label: "Approved",
    subject: "You're approved — Online Tech Uganda",
    body: () =>
      `Your application has been approved. Welcome.\n\nYou can start listing straight away. Call us if you'd like a hand getting set up.`,
  },
  {
    label: "Need more information",
    subject: "About your application",
    body: () =>
      `Thank you for applying to work with us. Before we approve you we need a little more information.\n\nPlease reply with your business details and a sample of your work or stock, and we'll review it right away.`,
  },
  {
    label: "Not approved",
    subject: "Your application — Online Tech Uganda",
    body: () =>
      `Thank you for your interest in working with us.\n\nWe're not able to take your application forward at the moment. You're welcome to apply again once your listings and business details are in place.`,
  },
];

export function ReplyButton({
  name,
  email = "",
  phone = "",
  templates = ENQUIRY_TEMPLATES,
  label = "Reply",
  context = "",
  auto,
  quickSend = true,
}: {
  name: string;
  email?: string;
  phone?: string;
  templates?: Template[];
  label?: string;
  /** Shown above the composer, e.g. the job title or order reference. */
  context?: string;
  /** Written from the record itself, so the composer opens ready to send. */
  auto?: AutoMessage;
  /** Show the one-tap Send button beside Reply. Needs `auto`. */
  quickSend?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(auto?.subject ?? "");
  const [message, setMessage] = useState(auto?.body ?? "");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");
  const [sentInline, setSentInline] = useState("");

  const first = (name || "").trim().split(/\s+/)[0] || "there";

  function pick(t: Template) {
    setSubject(t.subject);
    setMessage(t.body(first));
    setResult("");
  }

  type Channel = "email" | "whatsapp";

  /** Posts whatever is given, so the quick buttons don't depend on state. */
  async function post(s: string, m: string, channel: Channel) {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, subject: s, message: m, channel }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  }

  async function send(channel: Channel) {
    if (message.trim().length < 2) {
      setResult("Write a message first.");
      return;
    }
    setSending(true);
    setResult("");
    try {
      const { ok, data } = await post(subject, message, channel);

      if (!ok) {
        setResult(typeof data?.detail === "string" ? data.detail : "Couldn't send that.");
        return;
      }
      if (channel === "whatsapp") {
        if (data.whatsapp_url) {
          window.open(data.whatsapp_url, "_blank", "noopener");
          setResult(`✅ WhatsApp opened for ${phone}`);
        } else {
          setResult("No phone number on file for this person.");
        }
        return;
      }
      if (data.emailed) setResult(`✅ Emailed to ${email}`);
      else if (data.email_skipped) setResult("That email address isn't deliverable — try WhatsApp.");
      else setResult("No email address on file — try WhatsApp.");
    } catch {
      setResult("Network problem — please try again.");
    } finally {
      setSending(false);
    }
  }

  /** One tap: send the message the record wrote, without opening anything. */
  async function quick(channel: Channel) {
    if (!auto) return;
    setSending(true);
    setSentInline("");
    try {
      const { ok, data } = await post(auto.subject, auto.body, channel);
      if (!ok) {
        setSentInline("failed");
        return;
      }
      if (channel === "whatsapp") {
        if (data.whatsapp_url) {
          window.open(data.whatsapp_url, "_blank", "noopener");
          setSentInline("✓ WhatsApp");
        } else {
          setSentInline("no number");
        }
        return;
      }
      setSentInline(data.emailed ? "✓ Emailed" : "no email");
    } catch {
      setSentInline("failed");
    } finally {
      setSending(false);
    }
  }

  if (!open) {
    return (
      <span className="inline-flex items-center gap-1.5">
        {/* Two ways to reach them, chosen per message: an applicant with a
            working email is best emailed, someone who only left a number is
            not. Whichever detail is missing, that button stays out. */}
        {auto && quickSend && email && (
          <button
            onClick={() => quick("email")}
            disabled={sending || !!sentInline}
            title={`Email ${email} — ${auto.subject}`}
            className="whitespace-nowrap rounded-md bg-brand-500 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {sending ? "…" : sentInline || "📧 Email"}
          </button>
        )}
        {auto && quickSend && phone && (
          <button
            onClick={() => quick("whatsapp")}
            disabled={sending}
            title={`WhatsApp ${phone} — ${auto.subject}`}
            className="whitespace-nowrap rounded-md bg-[#25D366] px-2.5 py-1.5 text-xs font-bold text-white transition hover:brightness-105 disabled:opacity-60"
          >
            💬 WhatsApp
          </button>
        )}
        <button
          onClick={() => setOpen(true)}
          className="whitespace-nowrap rounded-md border border-brand-500 px-2.5 py-1.5 text-xs font-bold text-brand-600 transition hover:bg-brand-50"
        >
          ✉️ {label}
        </button>
      </span>
    );
  }

  const input =
    "mt-1 w-full rounded-md border border-ink-600/15 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink-700">Reply to {name || "this person"}</p>
          <p className="truncate text-xs text-ink-600/60">
            {[email, phone].filter(Boolean).join("  ·  ") || "No contact details on file"}
            {context ? `  ·  ${context}` : ""}
          </p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="shrink-0 text-xs font-bold text-ink-600/50 hover:text-ink-700"
        >
          ✕ Close
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {templates.map((t) => (
          <button
            key={t.label}
            onClick={() => pick(t)}
            className="rounded-full border border-ink-600/15 bg-white px-3 py-1 text-[11px] font-bold text-ink-600 transition hover:border-brand-400 hover:text-brand-600"
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <label className="block text-xs font-semibold text-ink-700">Subject</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject of the email"
          className={input}
        />
      </div>
      <div className="mt-2">
        <label className="block text-xs font-semibold text-ink-700">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={7}
          placeholder="Written from this record — edit it if you like, or pick a template above."
          className={input}
        />
        <p className="mt-1 text-[11px] text-ink-600/55">
          Our phone numbers are added at the bottom automatically, so they can call to confirm.
        </p>
      </div>

      {/* Choose how to reach them. Sending both at once was rarely what was
          wanted — most people need telling once, on the channel they use. */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => send("email")}
          disabled={sending || !email}
          title={email ? `Email ${email}` : "No email address on file"}
          className="rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {sending ? "Sending…" : "📧 Send email"}
        </button>
        <button
          onClick={() => send("whatsapp")}
          disabled={sending || !phone}
          title={phone ? `WhatsApp ${phone}` : "No phone number on file"}
          className="rounded-md bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
        >
          💬 Send on WhatsApp
        </button>
      </div>

      {!email && !phone && (
        <p className="mt-2 text-xs font-semibold text-amber-700">
          There&apos;s no email address or phone number on this record, so there&apos;s nowhere to send it.
        </p>
      )}
      {result && <p className="mt-2 text-xs font-semibold text-ink-700">{result}</p>}
      </div>
    </div>
  );
}
