"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { whatsappLink, site } from "@/lib/site";

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

  function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const key = "otu_software_requests";
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      list.push({ ...f, at: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}
    const msg =
      `Hello Online Tech Uganda! I'd like to REQUEST software.\n` +
      `Type: ${f.type}\nName: ${f.name}\nPhone: ${f.phone}` +
      `${f.email ? `\nEmail: ${f.email}` : ""}${f.org ? `\nOrganisation: ${f.org}` : ""}` +
      `\nBudget: ${f.budget}\nDetails: ${f.details}`;
    window.open(whatsappLink(msg), "_blank");
    setDone(true);
  }

  const input =
    "w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  if (done) {
    return (
      <div className="rounded-card border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle2 className="mx-auto text-green-600" size={44} />
        <h2 className="mt-3 text-lg font-extrabold text-ink-700">Request sent!</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-700/70">
          We&apos;ve opened WhatsApp with your request. Our team will reply with a proposal, timeline and
          quote. You can also call {site.phoneDisplay}.
        </p>
        <button
          onClick={() => setDone(false)}
          className="mt-4 rounded-md bg-brand-500 px-5 py-2 text-sm font-bold text-white hover:bg-brand-600"
        >
          Send another request
        </button>
      </div>
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
      <button
        type="submit"
        className="mt-5 inline-flex items-center gap-2 rounded-md bg-brand-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
      >
        <Send size={16} /> Send request
      </button>
    </form>
  );
}
