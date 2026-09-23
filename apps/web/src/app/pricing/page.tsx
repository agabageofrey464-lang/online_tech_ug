import type { Metadata } from "next";
import { ContactOptions } from "@/components/contact-options";
import { PageHeader } from "@/components/page-header";
import { PricingSection, postingCharges, vendorPlans, freelancerPlans, advertPlans, servicePlans } from "@/components/pricing-section";

export const metadata: Metadata = {
  title: "Pricing & Subscriptions",
  description:
    "Transparent pricing to build a website, sell, advertise, get hired or promote your business, school, company or institution on Online Tech Uganda.",
};

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
        <PricingSection title="Sell on the Marketplace" subtitle="Subscribe weekly, monthly or yearly." plans={vendorPlans} showPay={false} />
        <PricingSection title="Advertising packages" subtitle="Weekly, monthly or yearly homepage adverts." plans={advertPlans} showPay={false} />
        <PricingSection title="Freelancers — Get Hired" subtitle="List your skills weekly, monthly or yearly." plans={freelancerPlans} showPay={false} />
        <PricingSection title="Websites, Apps & Software" subtitle="Project-based pricing — websites from UGX 1,000,000." plans={servicePlans} showPay={false} />
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
