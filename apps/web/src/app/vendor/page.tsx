"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Store, Clock, CheckCircle2, Package, ShoppingBag, Wallet, Plus, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { whatsappLink } from "@/lib/site";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function VendorDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Send guests to sign in.
  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/vendor");
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="container-page py-16 text-center text-ink-700/50">Loading…</div>;
  }

  // Signed in but not a vendor — invite them to open a vendor account.
  if (user.role !== "vendor") {
    return (
      <div className="container-page max-w-lg py-16 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Store size={28} />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-ink-900">Sell on Online Tech Uganda</h1>
        <p className="mt-2 text-sm text-ink-700/70">
          Reach thousands of shoppers countrywide. Open a vendor account to list your products.
        </p>
        <Link href="/signup?role=vendor&next=/vendor" className="mt-5 inline-block rounded-md bg-brand-500 px-6 py-3 text-sm font-bold text-white hover:bg-brand-600">
          Become a vendor
        </Link>
      </div>
    );
  }

  const approved = user.vendor_approved;

  return (
    <div className="container-page py-8">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Vendor dashboard" }]} />
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white">
            <Store size={24} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-ink-900">{user.business_name || user.name}</h1>
            <p className="text-sm text-ink-700/60">Vendor dashboard</p>
          </div>
        </div>
        <button onClick={logout} className="inline-flex items-center gap-2 rounded-md border border-ink-600/20 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50">
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Approval status */}
      {approved ? (
        <div className="mb-6 flex items-center gap-3 rounded-card border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="shrink-0 text-green-600" />
          <p className="text-sm font-semibold text-green-800">Your store is approved and live. Start adding products below.</p>
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-3 rounded-card border border-amber-200 bg-amber-50 p-4">
          <Clock className="shrink-0 text-amber-600" />
          <div className="text-sm text-amber-800">
            <p className="font-bold">Your vendor account is under review.</p>
            <p>We&apos;ll approve your store shortly. You can prepare your products in the meantime.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Products", value: 0, icon: Package },
          { label: "Orders", value: 0, icon: ShoppingBag },
          { label: "Earnings", value: "UGX 0", icon: Wallet },
        ].map((s) => (
          <div key={s.label} className="rounded-card border border-ink-600/10 bg-white p-5 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <s.icon size={20} />
            </span>
            <p className="mt-3 text-2xl font-extrabold text-ink-900">{s.value}</p>
            <p className="text-xs font-semibold text-ink-700/60">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Products */}
      <section className="mt-6 rounded-card border border-ink-600/10 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-extrabold text-ink-900">My products</h2>
          <button
            disabled={!approved}
            title={approved ? "Add a product" : "Available once your store is approved"}
            className="inline-flex items-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} /> Add product
          </button>
        </div>
        <div className="mt-6 rounded-lg border border-dashed border-ink-600/20 p-10 text-center">
          <Package className="mx-auto text-ink-700/30" size={32} />
          <p className="mt-2 text-sm font-semibold text-ink-700">No products yet</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-ink-700/60">
            {approved
              ? "Add your first product to start selling."
              : "Once your store is approved you can list products here."}
          </p>
          <a
            href={whatsappLink(`Hi, I'm a vendor (${user.business_name || user.name}) and I'd like help listing my products.`)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block rounded-md border border-brand-300 px-4 py-2 text-xs font-bold text-brand-700 hover:bg-brand-50"
          >
            Get help listing products
          </a>
        </div>
      </section>
    </div>
  );
}
