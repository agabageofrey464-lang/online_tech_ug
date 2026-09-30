/**
 * When the next classes start.
 *
 * This used to be written out three times — a list on the Learn page, a pair
 * of hand-written banners in the home-page carousel, and a couple of strips in
 * the offer bar. They drifted: the September intake was still being advertised
 * on the home page days after it had started, because only the Learn page's
 * copy knew how to expire itself.
 *
 * One list now, and everything that advertises an intake reads from it. An
 * intake that has passed disappears from the site by itself; adding a date
 * here is all it takes to advertise a new one everywhere.
 */

export type Intake = {
  /** ISO date. Anything on or after today is still advertised. */
  date: string;
  /** How the date is written to a reader. */
  label: string;
  /** Short headline for the advert. */
  title: string;
  /** The line that does the selling. */
  note: string;
  /** Small print under the call to action. */
  small: string;
  /** Band colour, so consecutive adverts do not repeat. */
  bg: string;
  /** A course cover, for the advert's picture panel. */
  img: string;
};

export const intakes: Intake[] = [
  {
    date: "2026-10-15",
    label: "15 October 2026",
    title: "October Online Intake",
    note: "Learn from anywhere — same tutors, same certificate as the Kampala centre.",
    small: "Limited places",
    bg: "bg-teal-700",
    img: "/courses/microsoft-office.webp",
  },
  {
    date: "2026-11-03",
    label: "3 November 2026",
    title: "November Intake",
    note: "Finished your exams? Start a skill while everyone else is waiting for results.",
    small: "Physical & online · certificate included",
    bg: "bg-ink-700",
    img: "/courses/computer-basics.webp",
  },
  {
    date: "2026-12-01",
    label: "1 December 2026",
    title: "December Holiday Classes",
    note: "The long holiday is long enough to finish a whole course. Come out of it with a certificate instead of just a tan.",
    small: "Built for students on holiday · 2 months",
    bg: "bg-brand-600",
    img: "/courses/graphic-design.webp",
  },
  {
    date: "2026-12-15",
    label: "15 December 2026",
    title: "Mid-December Holiday Intake",
    note: "A second holiday start, for anyone who travels home first. Excel, design, coding or networking.",
    small: "Places fill before the schools close",
    bg: "bg-green-700",
    img: "/courses/microsoft-excel.webp",
  },
];

/** Intakes that have not started yet, soonest first. */
export function upcomingIntakes(today = new Date().toISOString().slice(0, 10)): Intake[] {
  return intakes.filter((i) => i.date >= today).sort((a, b) => a.date.localeCompare(b.date));
}
