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
  unlocked: string[]; // course slugs unlocked in full via a course code
  unlockedLessons?: Record<string, number[]>; // slug -> individually unlocked lesson indexes
};

const empty: State = { enrolled: [], lessons: {}, quizzes: {}, unlocked: [], unlockedLessons: {} };

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

// Mark a course as unlocked on this device (after a code is verified server-side).
export function markUnlocked(slug: string) {
  const s = read();
  if (!s.unlocked.includes(slug)) s.unlocked.push(slug);
  if (!s.enrolled.includes(slug)) s.enrolled.push(slug);
  write(s);
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

// ── Per-lesson unlocking ────────────────────────────────────────────────
// A lesson counts as unlocked if the whole course is unlocked OR that specific
// lesson index was unlocked with a per-lesson code.
export function isLessonUnlocked(slug: string, idx: number): boolean {
  const s = read();
  if (s.unlocked.includes(slug)) return true;
  return (s.unlockedLessons?.[slug] || []).includes(idx);
}

// Lesson indexes unlocked individually for this course (excludes full-course unlock).
export function lessonUnlocks(slug: string): number[] {
  return read().unlockedLessons?.[slug] || [];
}

export function unlockLesson(slug: string, idx: number) {
  const s = read();
  s.unlockedLessons = s.unlockedLessons || {};
  const set = new Set(s.unlockedLessons[slug] || []);
  set.add(idx);
  s.unlockedLessons[slug] = [...set];
  if (!s.enrolled.includes(slug)) s.enrolled.push(slug);
  write(s);
}

// Apply an entered code. Base course code (e.g. "GD-2026") unlocks the whole
// course; "GD-2026-5" unlocks only lesson 5. Returns what was unlocked:
//   "course" | <lesson index unlocked> | null (no match)
export function applyCourseCode(slug: string, entered: string, baseCode: string): "course" | number | null {
  const e = entered.trim().toUpperCase().replace(/\s+/g, "");
  const base = (baseCode || "").trim().toUpperCase();
  if (!base) return null;
  if (e === base) {
    markUnlocked(slug);
    return "course";
  }
  const esc = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = e.match(new RegExp(`^${esc}-(\\d+)$`));
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 1) {
      const idx = n - 1;
      unlockLesson(slug, idx);
      return idx;
    }
  }
  return null;
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
