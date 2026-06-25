"use client";

import { useState } from "react";
import { X, GraduationCap, CheckCircle2 } from "lucide-react";
import { whatsappLink, ugx } from "@/lib/site";
import { enroll, setLearnerName } from "@/lib/learning";

export function CourseRegister({
  courseSlug,
  courseTitle,
  price,
  label = "Register for this course",
}: {
  courseSlug: string;
  courseTitle: string;
  price: number;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // No backend yet — record locally and hand off to WhatsApp to confirm.
    try {
      const key = "otu_course_regs";
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      list.push({ course: courseTitle, ...form, at: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}
    if (form.name) setLearnerName(form.name);
    enroll(courseSlug); // add to the student's dashboard
    setDone(true);
    const msg = `Hello Online Tech Uganda! I'd like to REGISTER for the course "${courseTitle}"${
      price ? ` (${ugx(price)})` : ""
    }.\nName: ${form.name}\nPhone: ${form.phone}${form.email ? `\nEmail: ${form.email}` : ""}`;
    window.open(whatsappLink(msg), "_blank");
  }

  const input =
    "w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <>
      <button
        onClick={() => {
          setDone(false);
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-md bg-brand-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-600"
      >
        <GraduationCap size={16} /> {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-ink-600">Course registration</h3>
                <p className="text-sm text-ink-700/60">{courseTitle}</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-ink-600/50 hover:text-ink-600">
                <X size={20} />
              </button>
            </div>

            {done ? (
              <div className="py-4 text-center">
                <CheckCircle2 className="mx-auto text-green-600" size={40} />
                <p className="mt-2 font-bold text-ink-700">You&apos;re registered!</p>
                <p className="mt-1 text-sm text-ink-700/70">
                  We&apos;ve opened WhatsApp to confirm your spot. We&apos;ll send joining details and payment options.
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-4 rounded-md bg-brand-500 px-5 py-2 text-sm font-bold text-white hover:bg-brand-600"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <input
                  required
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={input}
                />
                <input
                  required
                  placeholder="Phone (07xx xxx xxx)"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={input}
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={input}
                />
                <button
                  type="submit"
                  className="w-full rounded-md bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600"
                >
                  {price ? `Register · ${ugx(price)}` : "Register free"}
                </button>
                <p className="text-center text-[11px] text-ink-700/50">
                  We&apos;ll confirm your spot and payment on WhatsApp.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
