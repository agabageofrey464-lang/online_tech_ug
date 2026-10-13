/**
 * Course catalogue for admin paperwork (certificates, enrolment forms).
 *
 * Mirrors the fees in apps/web/src/lib/data.ts. Kept as a small local list so
 * the admin app doesn't have to import the storefront's data module — if fees
 * change there, update them here too.
 */

export const REGISTRATION_FEE = 50000;

export type AdminCourse = {
  title: string;
  months: number;
  trainingFee: number;
};

export const COURSES: AdminCourse[] = [
  { title: "Computer Basics", months: 2, trainingFee: 450000 },
  // Word, Excel, PowerPoint and Access as one course: UGX 700,000 with registration.
  { title: "Microsoft Office", months: 2, trainingFee: 650000 },
  { title: "Microsoft Word", months: 2, trainingFee: 450000 },
  { title: "Microsoft Excel", months: 2, trainingFee: 480000 },
  { title: "Microsoft PowerPoint", months: 2, trainingFee: 450000 },
  { title: "Microsoft Access", months: 2, trainingFee: 480000 },
  { title: "Microsoft Publisher", months: 2, trainingFee: 450000 },
  { title: "Internet & Email", months: 2, trainingFee: 450000 },
  { title: "Typing Skills", months: 2, trainingFee: 450000 },
  { title: "Microsoft 365 & Teams", months: 2, trainingFee: 480000 },
  { title: "Advanced Excel & Data Analysis", months: 2, trainingFee: 530000 },
  { title: "Graphic Design", months: 2, trainingFee: 580000 },
  { title: "Computer Networking & IT Essentials", months: 2, trainingFee: 580000 },
  { title: "Cybersecurity Basics", months: 2, trainingFee: 580000 },
  { title: "AutoCAD", months: 2, trainingFee: 580000 },
  { title: "Digital Marketing", months: 2, trainingFee: 530000 },
  { title: "Video Editing", months: 2, trainingFee: 530000 },
  { title: "QuickBooks Accounting", months: 2, trainingFee: 530000 },
  { title: "Photography & Photo Editing", months: 2, trainingFee: 530000 },
  { title: "Python Programming", months: 2, trainingFee: 630000 },
  { title: "Web Development", months: 2, trainingFee: 730000 },
  { title: "Mobile App Development", months: 2, trainingFee: 730000 },
];

export const courseTotal = (c: AdminCourse) => REGISTRATION_FEE + c.trainingFee;

export const ugx = (n: number) => `UGX ${n.toLocaleString("en-UG")}`;
