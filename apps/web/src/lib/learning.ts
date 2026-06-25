// Client-side learning state (localStorage). No backend yet — tracks enrollment,
// lesson progress, quiz results and the learner's name on the device.
"use client";

const KEY = "otu_learning_v1";

export type QuizResult = { score: number; total: number; passed: boolean; at: string };

type State = {
  name?: string;
  enrolled: string[];
  lessons: Record<string, number[]>; // slug -> completed lesson indexes
  quizzes: Record<string, QuizResult>;
  unlocked: string[]; // course slugs unlocked via payment code
};

const empty: State = { enrolled: [], lessons: {}, quizzes: {}, unlocked: [] };

export function read(): State {
  if (typeof window === "undefined") return { ...empty };
  try {
    return { ...empty, ...(JSON.parse(localStorage.getItem(KEY) || "{}") as State) };
  } catch {
    return { ...empty };
  }
}

function write(s: State) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("otu-learning"));
}

export function learnerName(): string {
  const s = read();
  if (s.name) return s.name;
  // fall back to the account profile name if present
  try {
    const acc = JSON.parse(localStorage.getItem("otu_account_v1") || "{}");
    return acc.name || "";
  } catch {
    return "";
  }
}

export function setLearnerName(name: string) {
  const s = read();
  s.name = name;
  write(s);
}

export function enroll(slug: string) {
  const s = read();
  if (!s.enrolled.includes(slug)) s.enrolled.push(slug);
  write(s);
}

export function isEnrolled(slug: string): boolean {
  return read().enrolled.includes(slug);
}

export function enrolledCourses(): string[] {
  return read().enrolled;
}

export function toggleLesson(slug: string, idx: number, done: boolean) {
  const s = read();
  const set = new Set(s.lessons[slug] || []);
  if (done) set.add(idx);
  else set.delete(idx);
  s.lessons[slug] = [...set];
  if (!s.enrolled.includes(slug)) s.enrolled.push(slug);
  write(s);
}

export function doneLessons(slug: string): number[] {
  return read().lessons[slug] || [];
}

export function progressPct(slug: string, total: number): number {
  if (total === 0) return 0;
  return Math.round(((read().lessons[slug] || []).length / total) * 100);
}

export function isUnlocked(slug: string): boolean {
  return read().unlocked.includes(slug);
}

// Unlock a course if the entered code matches (case-insensitive). Returns success.
export function tryUnlock(slug: string, entered: string, code: string): boolean {
  if (!code || entered.trim().toUpperCase() !== code.trim().toUpperCase()) return false;
  const s = read();
  if (!s.unlocked.includes(slug)) s.unlocked.push(slug);
  if (!s.enrolled.includes(slug)) s.enrolled.push(slug);
  write(s);
  return true;
}

export function saveQuiz(slug: string, score: number, total: number) {
  const s = read();
  s.quizzes[slug] = {
    score,
    total,
    passed: score / total >= 0.6,
    at: new Date().toISOString(),
  };
  write(s);
}

export function quizResult(slug: string): QuizResult | undefined {
  return read().quizzes[slug];
}
