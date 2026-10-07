import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { site } from "@/lib/site";
import { share } from "@/lib/seo";

export const metadata: Metadata = share({
  title: "Privacy Policy",
  description:
    "What personal information Online Tech Uganda collects when you shop, learn or work with us, why we need it, who we share it with, and the rights you have over it.",
  alternates: { canonical: "/privacy" },
}, "/privacy");

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <>
        <p>
          This website is run by <b>{site.legalName}</b>, {site.address}. When this page says
          &ldquo;we&rdquo;, it means us. We decide how the personal information described here is
          used, and we are responsible for looking after it under Uganda&apos;s{" "}
          <b>Data Protection and Privacy Act, 2019</b>.
        </p>
        <p>
          This policy covers the shop, the courses, the marketplace, the jobs and freelancer pages,
          and every form on this site.
        </p>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "What we collect",
    body: (
      <>
        <p>We only ask for what the thing you are doing needs.</p>
        <ul>
          <li>
            <b>When you order:</b> your name, phone number, email address if you give one, delivery
            town and address, any note you add, and what you bought.
          </li>
          <li>
            <b>When you pay:</b> the amount, the method, and the transaction reference. Card and
            Mobile Money PIN details are entered with the payment provider and never reach us.
          </li>
          <li>
            <b>When you create an account:</b> your name, email, phone number and a password. The
            password is stored scrambled; we cannot read it.
          </li>
          <li>
            <b>When you register for a course:</b> your name, contact details, the course, your
            progress, quiz results, submitted assignments and attendance.
          </li>
          <li>
            <b>When you apply for a job or internship, or list yourself as a freelancer:</b> the
            details on the form and any CV you upload.
          </li>
          <li>
            <b>When you sell with us:</b> your business details, the products you list, and any
            document you send to verify your business.
          </li>
          <li>
            <b>When you contact us, request a quote or post in the community:</b> what you write
            and how to reach you.
          </li>
          <li>
            <b>When you subscribe:</b> your email address for the newsletter, or your
            device&apos;s notification address if you turn notifications on.
          </li>
          <li>
            <b>When you browse:</b> the pages you visit, roughly where you are, and the kind of
            device you use, through Google Analytics.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "why",
    title: "Why we use it",
    body: (
      <ul>
        <li>To process, deliver and support what you ordered, and to send you its progress.</li>
        <li>To confirm payments and keep the financial records the law requires.</li>
        <li>To run your account, your courses and your certificates.</li>
        <li>To answer you when you write to us or apply for something.</li>
        <li>To spot fraud and misuse, such as fake orders.</li>
        <li>To see which pages and products people use, so we can improve the site.</li>
        <li>
          To send news and offers, but only if you subscribed or turned notifications on. You can
          stop these at any time.
        </li>
      </ul>
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: (
      <>
        <p>
          <b>We do not sell your personal information.</b> We pass on only what each of these needs
          to do its job for us:
        </p>
        <ul>
          <li>
            <b>Delivery riders and couriers</b> — your name, phone number and address, to bring
            your order.
          </li>
          <li>
            <b>Payment providers</b> — Pesapal, MTN Mobile Money, Airtel Money and our bank, to
            take and confirm your payment.
          </li>
          <li>
            <b>Marketplace vendors</b> — when you message a vendor or buy their product, the
            details needed to answer you or fulfil the order.
          </li>
          <li>
            <b>Companies that run our systems</b> — hosting, email delivery and analytics. Some of
            them store information on servers outside Uganda.
          </li>
          <li>
            <b>Authorities</b> — when the law requires it.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "your-device",
    title: "What is stored on your device",
    body: (
      <>
        <p>
          Your cart, wishlist, recently viewed items and sign-in are kept in your own
          browser&apos;s storage so the site remembers them between visits. Clearing your browser
          data removes them.
        </p>
        <p>
          Google Analytics sets cookies to tell visits apart. You can block cookies in your browser
          settings; the shop still works without them.
        </p>
      </>
    ),
  },
  {
    id: "how-long",
    title: "How long we keep it",
    body: (
      <ul>
        <li>
          <b>Orders and payments:</b> for as long as tax and accounting law requires us to keep
          business records.
        </li>
        <li>
          <b>Accounts and course records:</b> while your account is open, so your progress and
          certificates stay available.
        </li>
        <li>
          <b>Job applications and CVs:</b> until the position is filled, unless you ask us to keep
          you on file.
        </li>
        <li>
          <b>Newsletter and notifications:</b> until you unsubscribe.
        </li>
      </ul>
    ),
  },
  {
    id: "security",
    title: "How we protect it",
    body: (
      <p>
        The site and its connections are encrypted, passwords are stored scrambled, and customer
        records can only be opened by our staff. No system is perfectly secure; if something
        happens that puts your information at risk, we will tell you and the regulator as the law
        requires.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>You can ask us to:</p>
        <ul>
          <li>show you the personal information we hold about you;</li>
          <li>correct anything that is wrong or out of date;</li>
          <li>delete information we no longer have a reason to keep;</li>
          <li>stop using your information for marketing.</li>
        </ul>
        <p>
          Write to{" "}
          <a href={`mailto:${site.email}`} className="font-semibold text-brand-600 hover:underline">
            {site.email}
          </a>{" "}
          or call {site.phoneDisplay}. We will answer as soon as we can. You can leave the
          newsletter from the link in any email or on the{" "}
          <Link href="/unsubscribe" className="font-semibold text-brand-600 hover:underline">
            unsubscribe page
          </Link>
          . If you are unhappy with our answer, you can complain to Uganda&apos;s Personal Data
          Protection Office.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        Anyone under 18 should use the shop and register for courses with a parent or guardian, who
        places the order and gives the contact details.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        When we change how we handle personal information we will update this page and the date at
        the top. For a significant change we will also tell account holders by email.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      path="/privacy"
      title="Privacy Policy"
      subtitle="What we collect when you shop, learn or work with us, why we need it, and the control you have over it."
      updated="5 October 2026"
      sections={sections}
    />
  );
}
