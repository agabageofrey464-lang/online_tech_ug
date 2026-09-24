import { apiGetAdmin, type AdminLead } from "@/lib/api";
import { enquiryMessage } from "@/lib/auto-message";
import Link from "next/link";
import { ReplyButton, ENQUIRY_TEMPLATES } from "@/components/reply-button";


export default async function LeadsPage() {
  const leads = (await apiGetAdmin<AdminLead[]>("/api/v1/contact")) ?? [];

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink-600">Leads</h1>
        <p className="text-sm text-ink-600/60">
          {leads.length} contact / quote message(s) from the website.
        </p>
      </header>

      {leads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-600/20 bg-white p-10 text-center text-ink-600/60">
          No messages yet. Contact-form and quote requests will appear here.
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((l) => (
            <div key={l.id} className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-ink-600">{l.name}</p>
                  <p className="text-sm text-ink-600/70">
                    <a href={`tel:${l.phone}`} className="hover:text-brand-600">{l.phone}</a>
                    {l.email && (
                      <>
                        {" · "}
                        <a href={`mailto:${l.email}`} className="hover:text-brand-600">{l.email}</a>
                      </>
                    )}
                  </p>
                </div>
                {l.subject && (
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                    {l.subject}
                  </span>
                )}
              </div>
              <p className="mt-3 whitespace-pre-wrap rounded-lg bg-ink-50 p-3 text-sm text-ink-600/80">{l.message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={{
                    pathname: "/quotations",
                    query: {
                      name: l.name,
                      phone: l.phone,
                      email: l.email ?? "",
                      subject: l.subject ?? "",
                      note: (l.message ?? "").slice(0, 300),
                    },
                  }}
                  className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-600"
                >
                  🧾 Quote this
                </Link>
                <a
                  href={`https://wa.me/${l.phone.replace(/\D/g, "").replace(/^0/, "256")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white hover:brightness-105"
                >
                  Reply on WhatsApp
                </a>
                {l.email && (
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(l.email)}&su=${encodeURIComponent("Re: " + (l.subject || "Your enquiry — Online Tech Uganda"))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-ink-600/20 px-3 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-50"
                  >
                    Email back
                  </a>
                )}
              </div>

              {/* Templated reply — faster than composing the same answer for
                  the tenth time, and it carries our numbers automatically. */}
              <ReplyButton
                name={l.name}
                email={l.email}
                phone={l.phone}
                templates={ENQUIRY_TEMPLATES}
                label="Edit"
                context={l.subject || "Website enquiry"}
                auto={enquiryMessage({ name: l.name, subject: l.subject })}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
