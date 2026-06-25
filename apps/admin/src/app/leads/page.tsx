export default function LeadsPage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink-600">Leads</h1>
      <div className="mt-8 rounded-2xl border border-dashed border-ink-600/20 bg-white p-10 text-center">
        <p className="text-4xl">💬</p>
        <p className="mt-3 font-bold text-ink-600">Contact & service leads</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-600/60">
          Inbox of contact-form and quote requests. A read endpoint will surface
          <code> contact_messages</code> here in Phase 3.
        </p>
      </div>
    </div>
  );
}
