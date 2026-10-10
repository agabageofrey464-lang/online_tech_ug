import type { Metadata } from "next";
import { ugx } from "@/lib/site";
import { SERVICE_FROM } from "@/lib/service-prices";
import { ContactOptions } from "@/components/contact-options";
import { PageHeader } from "@/components/page-header";
import { PricingSection, postingCharges, freelancerPlans, advertPlans, servicePlans } from "@/components/pricing-section";
import { VendorPlans } from "@/components/vendor-plans";
import { PayPanel } from "@/components/pay-panel";
import { share } from "@/lib/seo";

export const metadata: Metadata = share({
  title: "Pricing & Subscriptions",
  description:
    "Transparent pricing to build a website, sell, advertise, get hired or promote your business, school, company or institution on Online Tech Uganda.",
}, "/pricing");

export default function PricingPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Pricing" }]}
        eyebrow="Charges per post"
        title="Posting & listing charges"
        subtitle="Pay per post, or subscribe weekly, monthly or yearly. Contact us, choose your package, and our team designs and publishes it for you."
      />

      <section className="container-page space-y-8 py-8">
        <PricingSection title="Charges per post" subtitle="Pay once per post — we design and publish it for you." plans={postingCharges} showPay={false} />
        <div className="py-6">
          <VendorPlans />
        </div>
        <PricingSection title="Advertising packages" subtitle="Weekly, monthly or yearly homepage adverts." plans={advertPlans} showPay={false} />
        <PricingSection title="Freelancers — Get Hired" subtitle="List your skills weekly, monthly or yearly." plans={freelancerPlans} showPay={false} />
        <PricingSection title="Websites, Apps & Software" subtitle={`Project-based pricing — websites from ${ugx(SERVICE_FROM.website)}.`} plans={servicePlans} showPay={false} />
        <PayPanel purpose="the package I chose" />
      </section>
      <div className="container-page pb-10">
        <ContactOptions
          subject={"Pricing enquiry"}
          heading={"Not sure which plan fits?"}
          note={"Tell us your situation and we will recommend honestly."}
        />
      </div>

    </>
  );
}
