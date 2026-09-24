/**
 * Talking to the Online Academy.
 *
 * Every call goes through the same-origin /_api proxy and carries the signed-in
 * user's token, so the server decides what someone may see. Nothing here
 * decides access — a check in the browser is a suggestion.
 */

export type Role = "customer" | "student" | "lecturer" | "admin";

export type LiveClass = {
  id: number;
  course_slug: string;
  title: string;
  topic: string;
  room: string;
  starts_at: string;
  duration_mins: number;
  status: "scheduled" | "live" | "ended" | "cancelled";
  lecturer_id: number | null;
  lecturer_name: string;
  recording_url: string;
  notes_url: string;
  joinable: boolean;
  join_note: string;
  attendees: number;
};

export type JoinInfo = LiveClass & {
  display_name: string;
  is_host: boolean;
  attendance_id: number;
  provider: string;
  domain: string;
};

export type Enrolment = {
  id: number;
  course_slug: string;
  status: "pending" | "active" | "completed";
  mode: string;
  progress: number[];
  quiz: { score: number; total: number; passed: boolean } | null;
  attendance: { held: number; attended: number; percent: number };
};

export type Assignment = {
  id: number;
  course_slug: string;
  title: string;
  brief: string;
  attachment: string;
  due_at: string | null;
  max_score: number;
  overdue: boolean;
};

export type Submission = {
  id: number;
  assignment_id: number;
  user_id: number;
  text: string;
  attachment: string;
  score: number | null;
  feedback: string;
  marked: boolean;
  submitted_at: string | null;
};

export type Material = {
  id: number;
  course_slug: string;
  title: string;
  kind: "note" | "recording" | "slide" | "resource";
  url: string;
  added_at: string | null;
};

export type AnnouncementItem = {
  id: number;
  course_slug: string;
  title: string;
  body: string;
  kind: string;
  posted_at: string | null;
};

export type MyAcademy = {
  user: { id: number; name: string; email: string; role: Role };
  courses: Enrolment[];
  timetable: LiveClass[];
  assignments: Assignment[];
  submissions: Submission[];
  materials: Material[];
  announcements: AnnouncementItem[];
};

const TOKEN_KEYS = ["otu_token", "token", "auth_token"];

/** The signed-in user's token, wherever the existing auth put it. */
export function authToken(): string {
  if (typeof window === "undefined") return "";
  for (const k of TOKEN_KEYS) {
    try {
      const v = localStorage.getItem(k);
      if (v) return v;
    } catch {
      /* storage blocked */
    }
  }
  return "";
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = authToken();
  const res = await fetch(`/_api/academy${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      typeof body?.detail === "string"
        ? body.detail
        : res.status === 401
          ? "Please sign in to continue."
          : "Something went wrong. Please try again.",
    );
  }
  return (await res.json()) as T;
}

export const academy = {
  me: () => call<MyAcademy>("/me"),
  teaching: () => call<{ user: { id: number; name: string; role: Role }; classes: LiveClass[] }>("/teaching"),
  classes: (course?: string) => call<LiveClass[]>(`/classes${course ? `?course=${encodeURIComponent(course)}` : ""}`),

  join: (classId: number) => call<JoinInfo>(`/classes/${classId}/join`, { method: "POST" }),
  leave: (classId: number) => call<{ ok: boolean; minutes?: number }>(`/classes/${classId}/leave`, { method: "POST" }),

  enrol: (course_slug: string, mode = "online") =>
    call<Enrolment>("/enrol", { method: "POST", body: JSON.stringify({ course_slug, mode }) }),

  markLesson: (course_slug: string, lesson_index: number, done = true) =>
    call("/progress", { method: "POST", body: JSON.stringify({ course_slug, lesson_index, done }) }),

  saveQuiz: (course_slug: string, score: number, total: number) =>
    call("/quiz", { method: "POST", body: JSON.stringify({ course_slug, score, total }) }),

  submit: (assignmentId: number, text: string, attachment = "") =>
    call<Submission>(`/assignments/${assignmentId}/submit`, {
      method: "POST",
      body: JSON.stringify({ text, attachment }),
    }),

  // Lecturer
  scheduleClass: (body: {
    course_slug: string;
    title: string;
    starts_at: string;
    duration_mins?: number;
    topic?: string;
  }) => call<LiveClass>("/classes", { method: "POST", body: JSON.stringify(body) }),

  startClass: (id: number) => call<LiveClass>(`/classes/${id}/start`, { method: "POST" }),
  endClass: (id: number) => call<LiveClass>(`/classes/${id}/end`, { method: "POST" }),
  register: (id: number) =>
    call<
      { id: number; name: string; email: string; minutes: number; status: string; in_room: boolean }[]
    >(`/classes/${id}/register`),

  students: (course_slug: string) =>
    call<{ id: number; name: string; email: string; status: string }[]>(
      `/courses/${encodeURIComponent(course_slug)}/students`,
    ),

  addAssignment: (body: {
    course_slug: string;
    title: string;
    brief?: string;
    due_at?: string | null;
    max_score?: number;
    attachment?: string;
  }) => call<Assignment>("/assignments", { method: "POST", body: JSON.stringify(body) }),

  courseAssignments: (course_slug: string) =>
    call<Assignment[]>(`/assignments?course=${encodeURIComponent(course_slug)}`),

  submissionsFor: (assignmentId: number) =>
    call<(Submission & { name: string; email: string })[]>(
      `/assignments/${assignmentId}/submissions`,
    ),

  mark: (submissionId: number, score: number, feedback = "") =>
    call<Submission>(`/submissions/${submissionId}/mark`, {
      method: "POST",
      body: JSON.stringify({ score, feedback }),
    }),

  addMaterial: (body: {
    course_slug: string;
    title: string;
    kind?: Material["kind"];
    url?: string;
    live_class_id?: number | null;
  }) => call<Material>("/materials", { method: "POST", body: JSON.stringify(body) }),

  announce: (body: { title: string; body?: string; course_slug?: string; kind?: string }) =>
    call<AnnouncementItem>("/announcements", { method: "POST", body: JSON.stringify(body) }),
};

export type Upload = { stored: string; name: string; url: string; size_kb: number };

/**
 * Send a file up and get back its URL.
 *
 * Deliberately outside `academy` because it can't go through `call` — a
 * multipart body must set its own boundary, so the Content-Type header has
 * to be left alone rather than forced to JSON.
 */
export async function uploadFile(file: File): Promise<Upload> {
  const token = authToken();
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/_api/academy/files", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(typeof body?.detail === "string" ? body.detail : "That file wouldn't upload.");
  }
  return (await res.json()) as Upload;
}

/** "Today at 14:00", "Tomorrow at 09:30", or the date for anything further off. */
export function whenLabel(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";

  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const today = new Date();
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (sameDay(d, today)) return `Today at ${time}`;
  if (sameDay(d, tomorrow)) return `Tomorrow at ${time}`;
  return `${d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} at ${time}`;
}

/** How long until a class, for a countdown that means something. */
export function countdown(iso: string): string {
  const mins = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  if (mins <= 0) return "now";
  if (mins < 60) return `in ${mins} min`;
  if (mins < 1440) return `in ${Math.floor(mins / 60)}h ${mins % 60}m`;
  return `in ${Math.round(mins / 1440)} day${Math.round(mins / 1440) === 1 ? "" : "s"}`;
}
