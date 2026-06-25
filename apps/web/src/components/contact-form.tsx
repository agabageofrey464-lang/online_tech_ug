"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch(`${API}/api/v1/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error
          ? "We couldn't send your message right now. Please WhatsApp or call us instead."
          : "Something went wrong.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-card border border-brand-200 bg-brand-50 p-6 text-center">
        <p className="text-2xl">✅</p>
        <h3 className="mt-2 text-lg font-bold text-ink-600">Message sent!</h3>
        <p className="mt-1 text-sm text-ink-700/70">
          Thank you for reaching out. Our team will get back to you shortly.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-semibold text-brand-600 underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="name" required placeholder="Your full name" />
        <Field label="Phone" name="phone" required placeholder="07XX XXX XXX" />
      </div>
      <Field label="Email" name="email" type="email" placeholder="you@example.com" />
      <div>
        <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-ink-700">
          I'm interested in
        </label>
        <select
          id="subject"
          name="subject"
          className="w-full rounded-lg border border-ink-600/20 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option>Buying a computer / accessory</option>
          <option>Website development</option>
          <option>Mobile app / software system</option>
          <option>Repairs & IT support</option>
          <option>Networking services</option>
          <option>Online courses</option>
          <option>Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink-700">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="Tell us how we can help…"
          className="w-full rounded-lg border border-ink-600/20 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      {status === "error" && <p className="text-sm font-medium text-brand-700">{error}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex w-full items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-ink-700">
        {label} {required && <span className="text-brand-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-ink-600/20 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
    </div>
  );
}
