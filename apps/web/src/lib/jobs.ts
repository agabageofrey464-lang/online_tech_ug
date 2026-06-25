// Job board listings. Add/remove postings here.
export type Job = {
  id: string;
  title: string;
  type: "Full-time" | "Internship" | "Part-time" | "Contract";
  category: "Software" | "IT Support" | "Sales" | "Design" | "Marketing";
  location: string;
  postedAt: string; // ISO
  summary: string;
  requirements: string[];
  openings: number;
};

export const jobs: Job[] = [
  {
    id: "software-developer",
    title: "Software Developer",
    type: "Full-time",
    category: "Software",
    location: "Kampala (Hybrid)",
    postedAt: "2026-06-20T09:00:00+03:00",
    summary: "Build websites, web apps and systems for our clients using modern tools.",
    requirements: [
      "Experience with JavaScript/TypeScript (React/Next.js a plus)",
      "Understanding of APIs and databases",
      "A portfolio or GitHub to show your work",
    ],
    openings: 2,
  },
  {
    id: "it-support-technician",
    title: "IT Support Technician",
    type: "Full-time",
    category: "IT Support",
    location: "Kampala",
    postedAt: "2026-06-18T09:00:00+03:00",
    summary: "Diagnose and repair laptops/desktops, install software, and support clients onsite & remotely.",
    requirements: [
      "Hardware & software troubleshooting skills",
      "Knowledge of Windows installation & networking basics",
      "Good communication and customer care",
    ],
    openings: 1,
  },
  {
    id: "web-development-intern",
    title: "Web Development Intern",
    type: "Internship",
    category: "Software",
    location: "Kampala",
    postedAt: "2026-06-15T09:00:00+03:00",
    summary: "Learn on the job building real websites alongside our developers.",
    requirements: [
      "Basic HTML/CSS/JavaScript",
      "Eager to learn and grow",
      "Student or recent graduate welcome",
    ],
    openings: 3,
  },
  {
    id: "computer-sales-customer-care",
    title: "Computer Sales & Customer Care",
    type: "Full-time",
    category: "Sales",
    location: "Kampala",
    postedAt: "2026-06-12T09:00:00+03:00",
    summary: "Help customers choose the right devices, in-store and on WhatsApp.",
    requirements: [
      "Good knowledge of computers & accessories",
      "Friendly, persuasive communication",
      "Basic record-keeping",
    ],
    openings: 2,
  },
  {
    id: "digital-marketing-intern",
    title: "Digital Marketing Intern",
    type: "Internship",
    category: "Marketing",
    location: "Remote / Kampala",
    postedAt: "2026-06-10T09:00:00+03:00",
    summary: "Create content for social media (TikTok, Instagram) and grow our online presence.",
    requirements: ["Social media savvy", "Basic content creation/editing", "Creative and consistent"],
    openings: 2,
  },
];
