"use client";

import { useState } from "react";
import { whatsappLink } from "@/lib/site";

/**
 * Registration for the S.4 & S.6 seminar. It goes to the dashboard as a lead,
 * so the owner sees every registration in one place, and offers the parent a
 * WhatsApp message with the same details.
 */
export function SeminarForm() {
  const [sent, setSent] = useState<"" | "ok" | "fail">("");
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    const message = [
      `Student: ${get("student")}`,
      `Class just finished: ${get("level")}`,
      `School: ${get("school")}`,
      `Parent / guardian: ${get("parent")}`,
      get("note") ? `Note: ${get("note")}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    setSummary(message);
    setBusy(true);
    try {
      const res = await fetch("/_api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: get("parent") || get("student"),
          phone: get("phone"),
          email: get("email"),
          subject: "S.4 & S.6 Holiday Seminar registration",
          message,
        }),
      });
      setSent(res.ok ? "ok" : "fail");
    } catch {
      setSent("fail");
    } finally {
      setBusy(false);
    }
  }

  const input = "mt-1 w-full rounded-md border border-ink-600/20 bg-white px-3 py-2.5 text-[15px] focus:border-brand-500 focus:outline-none";

  if (sent === "ok")
    return (
      <div className="rounded-md bg-white p-6 shadow-sm">
        <p className="text-[22px] font-semibold text-ink-900">✅ Registration received</p>
        <p className="mt-2 text-[15px] text-ink-700/85">
          Thank you. We will call or WhatsApp you with the joining link for Saturday 5 and Sunday 6 December, and how to pay the UGX 30,000.
        </p>
        <a
          href={whatsappLink(`Hello Online Tech Uganda, I have registered for the S.4 & S.6 Holiday Seminar.\n\n${summary}`)}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block rounded-full bg-[#25D366] px-5 py-2.5 text-[14px] font-bold text-white"
        >
          Also message us on WhatsApp
        </a>
      </div>
    );

  return (
    <form onSubmit={submit} className="rounded-md bg-white p-6 shadow-sm">
      <p className="text-[24px] font-semibold text-ink-900">Register a student</p>
      <p className="mt-1 text-[14px] text-ink-700/75">Parents may register for their children. Saturday 5 &amp; Sunday 6 December, online. We confirm how to pay.</p>
      <p className="mt-2 text-[14px] font-semibold text-ink-900">📞 Call or WhatsApp: <a href="tel:+256756839270" className="text-brand-600">0756 839 270</a> · <a href="tel:+256754917768" className="text-brand-600">0754 917 768</a></p>
      <div className="mt-4 grid gap-3">
        <label className="text-[14px] font-semibold text-ink-800">Student&apos;s full name<input name="student" required minLength={2} className={input} /></label>
        <label className="text-[14px] font-semibold text-ink-800">
          Class just finished
          <select name="level" required className={input}>
            <option>Senior Four (S.4)</option>
            <option>Senior Six (S.6)</option>
            <option>Other</option>
          </select>
        </label>
        <label className="text-[14px] font-semibold text-ink-800">School<input name="school" className={input} /></label>
        <label className="text-[14px] font-semibold text-ink-800">Parent / guardian&apos;s name<input name="parent" className={input} /></label>
        <label className="text-[14px] font-semibold text-ink-800">Phone or WhatsApp number<input name="phone" required minLength={9} inputMode="tel" className={input} /></label>
        <label className="text-[14px] font-semibold text-ink-800">Email (optional)<input name="email" type="email" className={input} /></label>
        <label className="text-[14px] font-semibold text-ink-800">Anything we should know (optional)<textarea name="note" rows={3} className={input} /></label>
      </div>
      <button disabled={busy} className="mt-5 w-full rounded-full bg-brand-500 py-3.5 text-[13px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-brand-600 disabled:opacity-60">
        {busy ? "Sending…" : "Register — UGX 30,000"}
      </button>
      {sent === "fail" && (
        <p className="mt-3 text-[14px] text-red-600">
          That did not go through. Please WhatsApp 0756 839 270 or 0754 917 768 with the student&apos;s name and class.
        </p>
      )}
    </form>
  );
}
