// Client project tracking. Update these entries (or, later, manage from the API/admin)
// as work progresses. Clients look up their project by its reference code.

export type StageState = "done" | "active" | "pending";

export type ProjectStage = {
  name: string;
  state: StageState;
  note?: string;
};

export type Project = {
  ref: string; // e.g. OTU-WEB-001 — share this with the client
  client: string;
  title: string;
  type: "Website" | "Mobile App" | "Software System" | "Other";
  startedAt: string; // ISO
  updatedAt: string; // ISO
  percent: number; // 0-100
  stages: ProjectStage[];
  note?: string;
};

const STAGES = (active: number, notes: Record<number, string> = {}): ProjectStage[] =>
  ["Requirements", "Design", "Development", "Testing", "Launch & Handover"].map((name, i) => ({
    name,
    state: i < active ? "done" : i === active ? "active" : "pending",
    note: notes[i],
  }));

export const projects: Project[] = [
  {
    ref: "OTU-WEB-001",
    client: "Sample Client Ltd",
    title: "Business Website + Online Store",
    type: "Website",
    startedAt: "2026-06-01T09:00:00+03:00",
    updatedAt: "2026-06-22T16:00:00+03:00",
    percent: 65,
    stages: STAGES(2, { 2: "Building product pages & checkout" }),
    note: "On track. Demo link will be shared at the testing stage.",
  },
  {
    ref: "OTU-APP-002",
    client: "Demo SACCO",
    title: "Members Mobile App (Android & iOS)",
    type: "Mobile App",
    startedAt: "2026-05-15T09:00:00+03:00",
    updatedAt: "2026-06-20T11:00:00+03:00",
    percent: 40,
    stages: STAGES(2, { 2: "Auth & savings module in progress" }),
  },
  {
    ref: "OTU-SYS-003",
    client: "Demo School",
    title: "School Management System",
    type: "Software System",
    startedAt: "2026-04-10T09:00:00+03:00",
    updatedAt: "2026-06-18T15:00:00+03:00",
    percent: 90,
    stages: STAGES(3, { 3: "Final testing with school staff" }),
    note: "Launch scheduled for next term.",
  },
];

export function findProject(ref: string): Project | undefined {
  const q = ref.trim().toUpperCase();
  return projects.find((p) => p.ref.toUpperCase() === q);
}
