export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink-600">Settings</h1>
      <div className="mt-8 rounded-2xl border border-dashed border-ink-600/20 bg-white p-10 text-center">
        <p className="text-4xl">⚙️</p>
        <p className="mt-3 font-bold text-ink-600">Store & account settings</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-600/60">
          Delivery zones, payment config, staff accounts & roles. Coming with auth in Phase 2/3.
        </p>
      </div>
    </div>
  );
}
