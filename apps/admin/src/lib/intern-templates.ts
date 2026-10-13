import type { Template } from "@/components/reply-button";

/**
 * Ready replies for students applying for internship.
 *
 * A student asks the same handful of things — am I in, when does it start,
 * what time are the sessions, how do I pay, where is my letter — and each was
 * being typed out again for every one of them. They are written here once,
 * so the answer a student gets is the same whoever sends it, and goes out by
 * WhatsApp or email in one tap from the applicants page.
 *
 * The timetable below is the one place the times are kept. Change them here
 * and every reply that mentions a time follows.
 */
export const INTAKE = {
  window: "2 November – 18 December 2026",
  /** 1 November is a Sunday, so the first working day is the Monday. */
  firstDay: "Monday 2 November 2026",
  orientation: "10:00 am",
  days: "Monday to Friday",
  morning: "9:00 – 10:00 am",
  evening: "7:00 – 8:00 pm",
  submitBy: "6:00 pm",
  review: "Fridays",
  fee: "UGX 150,000",
  pay: "Airtel Money 0756 839 270 (Online TechUG Services, Merchant ID 7148212)",
  phone: "0756 839 270",
};

const TIMETABLE =
  `• Orientation: ${INTAKE.firstDay} at ${INTAKE.orientation}, on Google Meet\n` +
  `• Daily session with your supervisor, ${INTAKE.days} — you choose one:\n` +
  `     Morning ${INTAKE.morning}   or   Evening ${INTAKE.evening}\n` +
  `• Your tasks are done in your own time and submitted by ${INTAKE.submitBy}\n` +
  `• Weekly review of your work on ${INTAKE.review}`;

export const INTERN_TEMPLATES: Template[] = [
  {
    label: "Place approved",
    subject: "Your internship place is approved — Online Tech Uganda",
    body: () =>
      `We are pleased to confirm that your internship place with Online Tech Uganda is approved.\n\n` +
      `Dates: ${INTAKE.window} (7 weeks), 100% online, with a supervisor assigned to you.\n` +
      `Placement fee: ${INTAKE.fee}, paid once.\n\n` +
      `To secure your place:\n` +
      `1. Pay ${INTAKE.fee} by ${INTAKE.pay} and send us the confirmation message.\n` +
      `2. Reply with your university, course, year of study, registration number and the field you want to train in, if you have not given them.\n\n` +
      `We will then issue your acceptance letter, signed and stamped and addressed to your faculty.\n\n` +
      `Your timetable:\n${TIMETABLE}`,
  },
  {
    label: "Training times",
    subject: "Your internship timetable — Online Tech Uganda",
    body: () =>
      `Thank you for asking. The internship runs online from ${INTAKE.window}, ${INTAKE.days}.\n\n` +
      `${TIMETABLE}\n\n` +
      `Please reply with the session you prefer — morning or evening — and we will send you the meeting link before the first day.`,
  },
  {
    label: "Send your details / letter",
    subject: "A few details for your internship — Online Tech Uganda",
    body: () =>
      `Thank you for applying for the internship. To prepare your acceptance letter we need a few details from you.\n\n` +
      `Please reply with:\n` +
      `• Your university and course\n` +
      `• Your year of study and registration number\n` +
      `• The field you want to train in\n` +
      `• A clear photo or PDF of the introduction letter from your university\n\n` +
      `You do not need to pay anything until we confirm your place.`,
  },
  {
    label: "How to pay",
    subject: "How to pay your placement fee — Online Tech Uganda",
    body: () =>
      `The placement fee is ${INTAKE.fee}, paid once for the whole seven weeks. There is nothing further to pay.\n\n` +
      `Pay by ${INTAKE.pay}.\n` +
      `On your phone: dial *185#, choose to pay a merchant, enter Merchant ID 7148212 and the amount, and check the name reads Online TechUG Services.\n\n` +
      `Then send us the confirmation message and we will issue your acceptance letter.`,
  },
  {
    label: "Payment received",
    subject: "Payment received — your acceptance letter is on its way",
    body: () =>
      `We have received your placement fee of ${INTAKE.fee}. Thank you — your place is secured.\n\n` +
      `Your acceptance letter, signed and stamped and addressed to your faculty, will reach you within two working days.\n\n` +
      `Your timetable:\n${TIMETABLE}\n\n` +
      `Please reply with the session you prefer — morning or evening.`,
  },
  {
    label: "Before the first day",
    subject: "Your internship starts on Monday — Online Tech Uganda",
    body: () =>
      `Your internship begins on ${INTAKE.firstDay}.\n\n` +
      `Please join the orientation at ${INTAKE.orientation} on Google Meet — the link follows in a separate message. Have ready: a laptop or desktop, a steady internet connection, and a notebook.\n\n` +
      `${TIMETABLE}\n\n` +
      `If anything will stop you from joining, tell us before the day on ${INTAKE.phone}.`,
  },
  {
    label: "No place this time",
    subject: "Your internship application — Online Tech Uganda",
    body: () =>
      `Thank you for applying for the internship with Online Tech Uganda.\n\n` +
      `We are not able to offer you a place in this intake. The places in that field are taken, and we keep the intake small so that every student has a supervisor.\n\n` +
      `We will let you know when the next intake opens. We wish you the very best with your studies.`,
  },
];
