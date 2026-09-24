"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { RequestSent } from "@/components/request-sent";
import { submitRequest } from "@/lib/api";

const TYPES = [
  "Website",
  "E-commerce Store",
  "Mobile App (Android/iOS)",
  "School Management System",
  "Hospital Management System",
  "HR / Payroll System",
  "POS & Inventory System",
  "SACCO / Microfinance System",
  "Custom Software (other)",
];

const BUDGETS = ["Not sure yet", "Under 1M", "1M – 3M", "3M – 8M", "8M+"];

export function SoftwareRequest() {
  const [f, setF] = useState({
    name: "",
    phone: "",
    email: "",
    org: "",
    type: TYPES[0],
    budget: BUDGETS[0],
    details: "",
  });
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sent, setSent] = useState({ reference: "", emailed: false });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const key = "otu_software_requests";
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      list.push({ ...f, at: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}

    // The brief, written out so it arrives readable and needs no chasing.
    const message =
      `Software request: ${f.type}
` +
      `${f.org ? `Organisation: ${f.org}
` : ""}` +
      `Budget: ${f.budget}

` +
      `${f.details}`;

    try {
      const res = await submitRequest({
        name: f.name,
        phone: f.phone,
        email: f.email,
        subject: `Software request — ${f.type}`,
        message,
      });
      setSent({ reference: res.reference, emailed: res.emailed });
      setDone(true);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "We couldn't send that. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  if (done) {
    return (
      <RequestSent
        title="Request received"
        reference={sent.reference}
        emailed={sent.emailed}
        next="Our team will come back to you with a written proposal, timeline and quote — usually within one working day."
        onAgain={() => setDone(false)}
      />
    );
  }

  return (
    <form onSubmit={submit} className="rounded-card border border-ink-600/10 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink-700">What do you need? *</span>
          <select required value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} className={input}>
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink-700">Budget range</span>
          <select value={f.budget} onChange={(e) => setF({ ...f, budget: e.target.value })} className={input}>
            {BUDGETS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink-700">Full name *</span>
          <input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={input} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink-700">Phone *</span>
          <input required value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className={input} placeholder="07xx xxx xxx" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink-700">Email</span>
          <input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={input} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink-700">Organisation</span>
          <input value={f.org} onChange={(e) => setF({ ...f, org: e.target.value })} className={input} />
        </label>
      </div>
      <label className="mt-4 block text-sm">
        <span className="mb-1 block font-medium text-ink-700">Project details *</span>
        <textarea
          required
          rows={4}
          value={f.details}
          onChange={(e) => setF({ ...f, details: e.target.value })}
          className={input}
          placeholder="Describe what you want the system/app/website to do, key features, who will use it…"
        />
      </label>
      {err && <p className="mt-4 text-sm font-semibold text-red-600">{err}</p>}
      <button
        type="submit"
        disabled={busy}
        className="press mt-5 inline-flex items-center gap-2 rounded-md bg-brand-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
      >
        <Send size={16} /> {busy ? "Sending…" : "Send request"}
      </button>
      <p className="mt-2 text-[12px] text-ink-700/55">
        We&apos;ll email you a reference and come back with a quote. No WhatsApp needed.
      </p>
    </form>
  );
}
