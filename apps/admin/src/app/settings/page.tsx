import { PhoneAlerts } from "@/components/phone-alerts";

const store = {
  name: "Online Tech Uganda",
  phone: "+256 756 839 270 / +256 760 547 211",
  email: "onlinetechug@gmail.com",
  address: "Liberty Tower, Kampala Road, Kampala",
  payments: ["MTN MoMo", "Airtel Money", "Bank transfer / cards", "Pay at our shop"],
  delivery: ["Kampala metro UGX 10,000", "Upcountry by distance (UGX 20k–75k)"],
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink-600/10 bg-white p-6 shadow-sm">
      <h2 className="text-xs font-bold uppercase tracking-wider text-ink-600/50">{title}</h2>
      <div className="mt-3 text-sm text-ink-600/80">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink-600">Settings</h1>
        <p className="text-sm text-ink-600/60">Store configuration & admin account.</p>
      </header>

      <div className="mb-5">
        <PhoneAlerts />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Store details">
          <p className="font-bold text-ink-600">{store.name}</p>
          <p>{store.address}</p>
          <p>{store.phone}</p>
          <p>{store.email}</p>
        </Card>

        <Card title="Payment methods">
          <ul className="space-y-1">
            {store.payments.map((p) => (
              <li key={p} className="flex items-center gap-2"><span className="text-brand-500">✓</span> {p}</li>
            ))}
          </ul>
        </Card>

        <Card title="Delivery">
          <ul className="space-y-1">
            {store.delivery.map((d) => (
              <li key={d} className="flex items-center gap-2"><span className="text-brand-500">•</span> {d}</li>
            ))}
          </ul>
        </Card>

        <Card title="Admin account">
          <p>Signed in as the store admin.</p>
          <p className="mt-2 text-xs text-ink-600/60">
            To change the admin username/password or API keys, update the environment variables
            (<code>ADMIN_USER</code>, <code>ADMIN_PASS</code>, <code>ADMIN_API_KEY</code>) in the
            admin&apos;s Vercel project settings, then redeploy.
          </p>
        </Card>
      </div>

      <p className="mt-5 text-xs text-ink-600/45">
        Editing these values from the dashboard (with staff roles) is planned. Prices, products,
        orders, courses and leads are managed from their own pages in the sidebar.
      </p>
    </div>
  );
}
