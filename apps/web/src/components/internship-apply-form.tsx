"use client";

import { useState } from "react";
import { CheckCircle2, Upload } from "lucide-react";
import { INTERNSHIP_FEE, INTERNSHIP_WINDOW } from "@/components/internship-panel";
import { site, ugx, whatsappLink } from "@/lib/site";

/**
 * The internship application, filled in on the site.
 *
 * Applying used to mean a small pop-up asking for a name, a phone number and
 * "why are you a good fit" — or a WhatsApp chat. Neither collected what an
 * acceptance letter needs, so every application began with us writing back to
 * ask for the university, the course, the registration number and the dates.
 * This asks for those once, here, and they arrive together in the dashboard
 * (Admin › Applications) with an alert to the owner.
 */

const IT_FIELDS = [
  "Front-End Web Development", "Back-End & API Development", "Full-Stack Development", "Mobile App Development",
  "Database Design & Administration", "Systems Analysis & Design", "UI / UX Design", "Software Testing & QA",
  "Version Control & Team Workflow", "Cloud, Hosting & DevOps", "Cybersecurity", "Networking & System Administration",
  "IT Support & Hardware", "Business Systems Development", "E-Commerce & Payment Integration", "Data Analysis & Reporting",
  "AI Tools & Automation", "Technical Writing & Project Reports",
];
const OTHER_FIELDS = [
  "Computer Applications for the Office", "Digital Marketing & Social Media", "Graphic Design & Branding", "Video Editing & Photography",
  "Accounting Software", "Records, Data Entry & Administration", "Online Business & E-Commerce", "Customer Service & Sales",
  "Content Writing & Blogging", "AutoCAD & Technical Drawing",
];
const UNIVERSITIES = [
  "Kampala International University (KIU)", "Makerere University", "Kyambogo University", "MUBS", "Uganda Christian University (UCU)",
  "Ndejje University", "Bugema University", "Nkumba University", "Mbarara University (MUST)", "Gulu University",
];

const input = "w-full min-w-0 max-w-full border border-ink-600/25 bg-white px-3 py-3 text-[15px] text-ink-900 focus:border-ink-900 focus:outline-none";
const label = "mb-1.5 block text-[12px] font-bold uppercase tracking-[0.1em] text-ink-800";

export function InternshipApplyForm() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ ref: string; name: string; field: string } | null>(null);
  const [fileName, setFileName] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) || "").trim();
    // Everything the acceptance letter needs, set out so it reads at a glance
    // in the dashboard and in the alert.
    const details = [
      `University: ${get("university")}`,
      `Course: ${get("course")}`,
      `Year of study: ${get("year")}`,
      `Registration no.: ${get("regno")}`,
      `Field wanted: ${get("field")}`,
      get("field2") ? `Second choice: ${get("field2")}` : "",
      `Dates required by school: ${get("dates") || INTERNSHIP_WINDOW}`,
      get("addressee") ? `Letter addressed to: ${get("addressee")}` : "",
      get("district") ? `Doing it from: ${get("district")}` : "",
      get("device") ? `Has: ${get("device")}` : "",
      get("note") ? `Note: ${get("note")}` : "",
    ].filter(Boolean).join("\n");

    const body = new FormData();
    body.set("name", get("name"));
    body.set("phone", get("phone"));
    body.set("email", get("email"));
    body.set("job_title", `Internship (${INTERNSHIP_WINDOW}) — ${get("field")}`);
    body.set("message", details);
    const cv = f.get("cv");
    if (cv instanceof File && cv.size > 0) body.set("cv", cv);

    try {
      const res = await fetch("/_api/careers/apply", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      // News of the next intake, new courses and offers, to those who asked
      // for it. It never holds up the application or fails it.
      if (res.ok && f.get("updates") && get("email")) {
        fetch("/_api/newsletter/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: get("email"), name: get("name"), source: "internship-application" }),
        }).catch(() => {});
      }
      if (!res.ok) {
        setErr(typeof data.detail === "string" ? data.detail : "We could not send your application. Please try again.");
      } else {
        setDone({ ref: `OTU-A${String(data.id ?? "").padStart(5, "0")}`, name: get("name").split(" ")[0], field: get("field") });
        document.getElementById("apply-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch {
      setErr("We could not send your application. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div id="apply-form" className="scroll-mt-44 bg-white p-6 text-center sm:p-10">
        <CheckCircle2 size={48} strokeWidth={1.4} className="mx-auto text-green-600" />
        <h2 className="mt-4 text-[30px] leading-tight text-ink-900">Application received{done.name ? `, ${done.name}` : ""}</h2>
        <p className="mt-2 text-[14px] text-ink-700/80">
          Your reference is <b className="text-ink-900">{done.ref}</b> · {done.field}
        </p>
        <ol className="mx-auto mt-6 max-w-lg space-y-3 text-left text-[14.5px] text-ink-800">
          {[
            "We check there is a place in your field and reply on your phone, usually within two working days.",
            `To confirm the place, pay the placement fee of ${ugx(INTERNSHIP_FEE)} by Airtel Money to ${site.payment.momoAlt.number} (${site.payment.momoAlt.name}).`,
            "We issue your acceptance letter, signed and stamped, addressed to your faculty.",
          ].map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-brand-500 text-[11px] font-bold text-white">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        <a
          href={whatsappLink(`Hello ${site.name}, I have applied for the internship (${INTERNSHIP_WINDOW}). My reference is ${done.ref}.`)}
          target="_blank"
          rel="noreferrer"
          className="mt-7 inline-block bg-brand-500 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-brand-600"
        >
          Message us about my application
        </a>
      </div>
    );
  }

  return (
    <form id="apply-form" onSubmit={submit} className="min-w-0 scroll-mt-44 overflow-hidden bg-white p-5 sm:p-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-600">Apply online</p>
      <h2 className="mt-2 text-[30px] leading-tight text-ink-900 sm:text-[36px]">Internship application</h2>
      <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-ink-700/85">
        {INTERNSHIP_WINDOW} · online · {ugx(INTERNSHIP_FEE)}. Classes are Monday to Friday, 9:00 am – 12:00 pm, and mostly practical. Fill in the boxes below — each one shows an example of what to write. You pay nothing now.
      </p>

      <fieldset className="mt-7 min-w-0">
        <legend className="mb-4 w-full border-b-2 border-ink-900 pb-2 font-display text-[20px] text-ink-900">1 · About you</legend>
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="min-w-0 sm:col-span-2">
            <label className={label} htmlFor="ia-name">Full name, as on your student ID</label>
            <input id="ia-name" name="name" required minLength={3} autoComplete="name" placeholder="e.g. Chandia Judith Bakheit" className={input} />
          </div>
          <div className="min-w-0">
            <label className={label} htmlFor="ia-phone">Phone / WhatsApp</label>
            <input id="ia-phone" name="phone" required inputMode="tel" autoComplete="tel" placeholder="07XX XXX XXX" className={input} />
          </div>
          <div className="min-w-0">
            <label className={label} htmlFor="ia-email">Email</label>
            <input id="ia-email" name="email" type="email" required autoComplete="email" placeholder="e.g. yourname@gmail.com" className={input} />
          </div>
        </div>
      </fieldset>

      <fieldset className="mt-8 min-w-0">
        <legend className="mb-4 w-full border-b-2 border-ink-900 pb-2 font-display text-[20px] text-ink-900">2 · Your school</legend>
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="min-w-0 sm:col-span-2">
            <label className={label} htmlFor="ia-uni">University or institution</label>
            <input id="ia-uni" name="university" required list="ia-unis" placeholder="Start typing — e.g. Kampala International University" className={input} />
            <datalist id="ia-unis">
              {UNIVERSITIES.map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
          </div>
          <div className="min-w-0 sm:col-span-2">
            <label className={label} htmlFor="ia-course">Course / programme</label>
            <input id="ia-course" name="course" required placeholder="e.g. Bachelor of Information Technology" className={input} />
          </div>
          <div className="min-w-0">
            <label className={label} htmlFor="ia-year">Year of study</label>
            <select id="ia-year" name="year" required defaultValue="" className={input}>
              <option value="" disabled>Choose…</option>
              {["Year 1", "Year 2", "Year 3", "Year 4", "Diploma — Year 1", "Diploma — Year 2", "Certificate", "Finished / other"].map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="min-w-0">
            <label className={label} htmlFor="ia-reg">Registration number</label>
            <input id="ia-reg" name="regno" required placeholder="As on your student ID — e.g. 2023-08-12345" className={input} />
          </div>
          <div className="min-w-0">
            <label className={label} htmlFor="ia-dates">Dates your school requires</label>
            <input id="ia-dates" name="dates" defaultValue="1 November – 18 December 2026" className={input} />
          </div>
          <div className="min-w-0">
            <label className={label} htmlFor="ia-addr">Who the letter is addressed to <span className="font-normal normal-case tracking-normal text-ink-700/55">(optional)</span></label>
            <input id="ia-addr" name="addressee" placeholder="e.g. The Dean, School of Computing" className={input} />
          </div>
        </div>
      </fieldset>

      <fieldset className="mt-8 min-w-0">
        <legend className="mb-4 w-full border-b-2 border-ink-900 pb-2 font-display text-[20px] text-ink-900">3 · Your placement</legend>
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <label className={label} htmlFor="ia-field">Field you want</label>
            <select id="ia-field" name="field" required defaultValue="" className={input}>
              <option value="" disabled>Choose a field…</option>
              <optgroup label="Software & IT">
                {IT_FIELDS.map((x) => <option key={x}>{x}</option>)}
              </optgroup>
              <optgroup label="For other courses">
                {OTHER_FIELDS.map((x) => <option key={x}>{x}</option>)}
              </optgroup>
            </select>
          </div>
          <div className="min-w-0">
            <label className={label} htmlFor="ia-field2">Second choice <span className="font-normal normal-case tracking-normal text-ink-700/55">(optional)</span></label>
            <select id="ia-field2" name="field2" defaultValue="" className={input}>
              <option value="">None</option>
              {[...IT_FIELDS, ...OTHER_FIELDS].map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div className="min-w-0">
            <label className={label} htmlFor="ia-district">Where you will do it from <span className="font-normal normal-case tracking-normal text-ink-700/55">(optional)</span></label>
            <input id="ia-district" name="district" placeholder="Town or district" className={input} />
          </div>
          <div className="min-w-0">
            <label className={label} htmlFor="ia-device">What you will use</label>
            <select id="ia-device" name="device" defaultValue="A laptop and internet" className={input}>
              {["A laptop and internet", "A desktop and internet", "A smartphone only", "I need advice on this"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="min-w-0 sm:col-span-2">
            <label className={label} htmlFor="ia-note">Anything we should know <span className="font-normal normal-case tracking-normal text-ink-700/55">(optional)</span></label>
            <textarea id="ia-note" name="note" rows={2} maxLength={600} placeholder="You can leave this empty." className={input} />
          </div>
          <div className="min-w-0 sm:col-span-2">
            <p className={label}>
              Letter from your university <span className="font-normal normal-case tracking-normal text-ink-700/55">(optional — you can send it later)</span>
            </p>
            <label className="flex cursor-pointer items-center gap-3 border border-dashed border-ink-600/35 px-4 py-3.5 text-[14px] text-ink-700/80 hover:border-ink-900">
              <Upload size={18} className="shrink-0 text-brand-500" />
              <span className="min-w-0 truncate">{fileName || "Tap to upload your introduction / recommendation letter"}</span>
              <input type="file" name="cv" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,image/*" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
            </label>
            <p className="mt-1.5 text-[12px] text-ink-700/60">The letter your faculty gives you for internship. A clear photo or a PDF, up to 5MB. We do not need a CV.</p>
          </div>
        </div>
      </fieldset>

      <label className="mt-6 flex items-start gap-3 text-[13.5px] leading-relaxed text-ink-800">
        <input type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-[#f15a29]" />
        <span>
          I understand the placement runs online from {INTERNSHIP_WINDOW}, and that the fee of {ugx(INTERNSHIP_FEE)} is paid once my place is confirmed.
        </span>
      </label>

      <label className="mt-3 flex items-start gap-3 text-[13.5px] leading-relaxed text-ink-800">
        <input type="checkbox" name="updates" defaultChecked className="mt-1 h-4 w-4 shrink-0 accent-[#f15a29]" />
        <span>Email me when new internship intakes, courses and offers are announced. You can stop these at any time.</span>
      </label>

      {err && <p className="mt-4 border-l-4 border-brand-500 bg-brand-50 px-3 py-2.5 text-[13.5px] font-semibold text-brand-800">{err}</p>}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 w-full bg-brand-500 px-7 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-brand-600 disabled:opacity-60 sm:w-auto"
      >
        {busy ? "Sending…" : "Submit my application"}
      </button>
      <p className="mt-3 text-[12px] text-ink-700/60">Your details are used only to process this application and to write your letters.</p>
    </form>
  );
}
