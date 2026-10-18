import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { SeminarForm } from "@/components/seminar-form";
import { SafeImage } from "@/components/safe-image";
import { share } from "@/lib/seo";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = share(
  {
    title: "S.4 & S.6 Holiday Computer Seminar — UGX 30,000",
    description: "A two-day online computer seminar for Senior Four and Senior Six leavers: computer basics, Office, design, coding and choosing a tech career. Special student price UGX 30,000.",
  },
  "/seminar",
);

const LEARN = [
  ["💻", "Computer basics & typing", "Using a computer with confidence, files and folders, and fast, accurate typing."],
  ["📊", "Word, Excel & PowerPoint", "A CV and a letter in Word, a budget in Excel, a presentation in PowerPoint."],
  ["🎨", "Graphic design basics", "Posters and social-media designs with free tools."],
  ["</>", "Intro to coding & websites", "How websites are made, and a first page of your own."],
  ["🌐", "Internet safety & research", "Finding good information, avoiding scams, and keeping accounts safe."],
  ["🧭", "Choosing a tech career", "Which university courses lead where, and the skills employers ask for."],
];

export default function SeminarPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "S.4 & S.6 Seminar" }]}
        eyebrow="Make the holiday count"
        title="S.4 & S.6 Holiday Computer Seminar"
        subtitle="Two full days, online, for Senior Four and Senior Six leavers. Special student price: UGX 30,000, with a certificate of attendance."
        image="/web/photo-1509062522246-3755977927d7.webp"
      >
        <a href="#register" className="bg-white px-7 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-900 transition hover:bg-brand-500 hover:text-white">
          Register now
        </a>
      </PageHeader>

      <section className="container-page grid gap-10 py-12 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="font-display text-[19px] italic text-brand-600">What your child will learn</p>
          <h2 className="mt-1 text-[28px] leading-tight text-ink-900 sm:text-[36px]">Two days of practical computer skills</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {LEARN.map(([icon, title, line]) => (
              <li key={title} className="rounded-md bg-white p-4 shadow-sm">
                <span className="text-[22px]">{icon}</span>
                <p className="mt-1 font-semibold text-ink-900">{title}</p>
                <p className="mt-0.5 text-[14px] leading-snug text-ink-700/80">{line}</p>
              </li>
            ))}
          </ul>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["UGX 30,000", "special student price, for both days"],
              ["2 days", "online, join on a phone or laptop"],
              ["Certificate", "of attendance for every student"],
            ].map(([big, small]) => (
              <div key={big} className="rounded-md bg-[#fcdc04] p-4 text-ink-900">
                <p className="text-[24px] font-bold leading-none">{big}</p>
                <p className="mt-1 text-[13px]">{small}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-md border-l-4 border-brand-500 bg-white p-5 shadow-sm">
            <p className="font-semibold text-ink-900">👨‍👩‍👧 A word to parents</p>
            <p className="mt-1 text-[15px] leading-relaxed text-ink-700/85">
              The long holiday after S.4 and S.6 is the best time to learn the computer skills every course and job now
              expects. Kindly register your child, and share this page with fellow parents so their children can join too.
            </p>
            <a
              href={whatsappLink("Hello! Online Tech Uganda is running a 2-day online computer seminar for S.4 and S.6 leavers, UGX 30,000. Details and registration: https://www.onlinetechug.com/seminar")}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-[13px] font-bold text-white"
            >
              Share on WhatsApp
            </a>
            <p className="mt-3 text-[14px] text-ink-700/85">Questions? Call or WhatsApp <a href="tel:+256756839270" className="font-semibold text-brand-600">0756 839 270</a> or <a href="tel:+256754917768" className="font-semibold text-brand-600">0754 917 768</a>.</p>
          </div>

          <div className="mt-8 overflow-hidden rounded-md">
            <SafeImage src="/adverts/s4-s6-seminar.jpg" alt="S.4 & S.6 Holiday Computer Seminar poster" width={1280} height={720} className="h-auto w-full" />
          </div>
        </div>

        <div id="register" className="scroll-mt-40">
          <SeminarForm />
        </div>
      </section>
    </>
  );
}
