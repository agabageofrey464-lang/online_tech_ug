"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * The academy, from the owner's side.
 *
 * Three jobs that only the owner does: decide who is a lecturer, approve who
 * is on a course, and tell everyone something. Scheduling and marking belong
 * to the lecturer and are done on the site itself, so they are not repeated
 * here — two places to do one thing is how they end up disagreeing.
 */

type Person = { id: number; name: string; email: string; phone: string; role: string; active: boolean };
type ClassRow = {
  id: number;
  course_slug: string;
  title: string;
  starts_at: string;
  duration_mins: number;
  status: string;
  lecturer_name: string;
  attendees: number;
};
type Student = {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  course_slug: string;
  status: string;
  mode: string;
};
type Register = { id: number; name: string; email: string; minutes: number; status: string; in_room: boolean };

const ROLES = ["customer", "student", "lecturer", "admin"] as const;

const when = (iso: string) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

type Tab = "people" | "classes" | "enrolments" | "announce";

export default function AcademyAdminPage() {
  const [tab, setTab] = useState<Tab>("people");

  const [people, setPeople] = useState<Person[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [register, setRegister] = useState<Register[]>([]);
  const [openRegister, setOpenRegister] = useState<number | null>(null);

  const [course, setCourse] = useState("");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState("info");
  const [forCourse, setForCourse] = useState("");

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([
        fetch("/api/academy/people", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/academy/classes", { cache: "no-store" }).then((r) => r.json()),
      ]);
      if (Array.isArray(p)) setPeople(p);
      if (Array.isArray(c)) setClasses(c);
    } catch {
      /* offline — keep what we have */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setRole(id: number, role: string) {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`/api/academy/people/${id}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error();
      setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, role } : p)));
      setMsg("✓ Saved");
    } catch {
      setMsg("Couldn't change that role.");
    } finally {
      setBusy(false);
    }
  }

  async function loadStudents(slug: string) {
    setCourse(slug);
    if (!slug) return setStudents([]);
    try {
      const r = await fetch(`/api/academy/enrolments?course=${encodeURIComponent(slug)}`, {
        cache: "no-store",
      });
      const d = await r.json();
      setStudents(Array.isArray(d) ? d : []);
    } catch {
      setStudents([]);
    }
  }

  async function setEnrolment(id: number, status: string) {
    await fetch(`/api/academy/enrolments/${id}?status=${status}`, { method: "POST" });
    loadStudents(course);
  }

  async function showRegister(id: number) {
    setOpenRegister(openRegister === id ? null : id);
    if (openRegister !== id) {
      const r = await fetch(`/api/academy/classes/${id}/register`, { cache: "no-store" });
      const d = await r.json();
      setRegister(Array.isArray(d) ? d : []);
    }
  }

  async function announce(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setMsg("Give the announcement a title.");
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/academy/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, kind, course_slug: forCourse }),
      });
      if (!res.ok) throw new Error();
      setTitle("");
      setBody("");
      setMsg("✓ Posted — students see it on their academy page.");
    } catch {
      setMsg("Couldn't post that.");
    } finally {
      setBusy(false);
    }
  }

  const courseSlugs = Array.from(new Set(classes.map((c) => c.course_slug))).sort();
  const shown = people.filter((p) =>
    q.trim()
      ? `${p.name} ${p.email} ${p.role}`.toLowerCase().includes(q.trim().toLowerCase())
      : true,
  );
  const counts = people.reduce<Record<string, number>>((acc, p) => {
    acc[p.role] = (acc[p.role] ?? 0) + 1;
    return acc;
  }, {});

  const input =
    "mt-1 w-full rounded-md border border-ink-600/15 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold text-ink-600">Online Academy</h1>
        <p className="text-sm text-ink-600/60">
          {counts.lecturer ?? 0} lecturer(s) · {counts.student ?? 0} student(s) · {classes.length}{" "}
          class(es). Lecturers schedule and mark on the site itself.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["people", "People & roles"],
            ["classes", "Classes & attendance"],
            ["enrolments", "Enrolments"],
            ["announce", "Announcements"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              tab === id
                ? "bg-brand-500 text-white"
                : "border border-ink-600/15 text-ink-600 hover:border-brand-400"
            }`}
          >
            {label}
          </button>
        ))}
        {msg && <span className="self-center text-xs font-semibold text-ink-700">{msg}</span>}
      </div>

      {tab === "people" && (
        <section className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-ink-700">
              Who is what. Making someone a lecturer lets them schedule and run classes.
            </p>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name or email…"
              className="rounded-md border border-ink-600/15 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-600/10 text-left text-xs uppercase tracking-wide text-ink-600/55">
                <tr>
                  <th className="p-2.5">Name</th>
                  <th className="p-2.5">Contact</th>
                  <th className="p-2.5">Role</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => (
                  <tr key={p.id} className="border-b border-ink-600/5 last:border-0">
                    <td className="p-2.5 font-semibold text-ink-700">{p.name}</td>
                    <td className="p-2.5 text-ink-600/70">
                      <span className="block text-xs">{p.email}</span>
                      <span className="block text-[11px] text-ink-600/50">{p.phone}</span>
                    </td>
                    <td className="p-2.5">
                      <select
                        value={p.role}
                        disabled={busy}
                        onChange={(e) => setRole(p.id, e.target.value)}
                        className={`rounded-md border px-2 py-1 text-xs font-semibold capitalize ${
                          p.role === "lecturer"
                            ? "border-green-300 bg-green-50 text-green-700"
                            : p.role === "admin"
                              ? "border-brand-300 bg-brand-50 text-brand-700"
                              : "border-ink-600/15"
                        }`}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r} className="capitalize">
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {shown.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-ink-600/50">
                      Nobody matches that.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "classes" && (
        <section className="space-y-2.5">
          {classes.length === 0 && (
            <p className="rounded-2xl border border-dashed border-ink-600/20 bg-white p-10 text-center text-sm text-ink-600/55">
              No classes scheduled yet. A lecturer schedules them from the site.
            </p>
          )}
          {classes.map((c) => (
            <div key={c.id} className="rounded-2xl border border-ink-600/10 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-ink-700">{c.title}</p>
                  <p className="text-xs text-ink-600/60">
                    {c.course_slug} · {when(c.starts_at)} · {c.duration_mins} min
                    {c.lecturer_name ? ` · ${c.lecturer_name}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${
                      c.status === "live"
                        ? "bg-green-100 text-green-700"
                        : c.status === "ended"
                          ? "bg-ink-100 text-ink-600/70"
                          : "bg-brand-50 text-brand-700"
                    }`}
                  >
                    {c.status}
                  </span>
                  <button
                    onClick={() => showRegister(c.id)}
                    className="rounded-md border border-ink-600/20 px-3 py-1.5 text-xs font-bold text-ink-600 hover:bg-ink-50"
                  >
                    {c.attendees} attended
                  </button>
                </div>
              </div>

              {openRegister === c.id && (
                <div className="mt-3 border-t border-ink-600/10 pt-3">
                  {register.length === 0 ? (
                    <p className="text-sm text-ink-600/55">Nobody joined this class.</p>
                  ) : (
                    <ul className="space-y-1">
                      {register.map((r) => (
                        <li key={r.id} className="flex justify-between gap-3 text-sm">
                          <span className="truncate text-ink-700">{r.name}</span>
                          <span className="shrink-0 text-xs text-ink-600/55">
                            {r.minutes} min · <span className="capitalize">{r.status}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {tab === "enrolments" && (
        <section className="rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
          <label className="block text-sm font-semibold text-ink-700">Course</label>
          <select value={course} onChange={(e) => loadStudents(e.target.value)} className={input}>
            <option value="">Choose a course…</option>
            {courseSlugs.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[11px] text-ink-600/55">
            Courses appear here once a class has been scheduled for them.
          </p>

          {course && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-ink-600/10 text-left text-xs uppercase tracking-wide text-ink-600/55">
                  <tr>
                    <th className="p-2.5">Student</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-b border-ink-600/5 last:border-0">
                      <td className="p-2.5">
                        <span className="block font-semibold text-ink-700">{s.name}</span>
                        <span className="block text-[11px] text-ink-600/55">
                          {s.email} · {s.phone}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${
                            s.status === "active"
                              ? "bg-green-100 text-green-700"
                              : s.status === "completed"
                                ? "bg-brand-50 text-brand-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        {s.status !== "active" && (
                          <button
                            onClick={() => setEnrolment(s.id, "active")}
                            className="mr-1.5 rounded bg-green-600 px-3 py-1 text-xs font-bold text-white hover:bg-green-700"
                          >
                            Approve
                          </button>
                        )}
                        {s.status !== "completed" && (
                          <button
                            onClick={() => setEnrolment(s.id, "completed")}
                            className="rounded border border-ink-600/20 px-3 py-1 text-xs font-bold text-ink-600 hover:bg-ink-50"
                          >
                            Mark complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-ink-600/50">
                        Nobody enrolled on this course yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === "announce" && (
        <section className="max-w-xl rounded-2xl border border-ink-600/10 bg-white p-5 shadow-sm">
          <form onSubmit={announce}>
            <label className="block text-sm font-semibold text-ink-700">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. No class on Friday"
              className={input}
            />

            <label className="mt-3 block text-sm font-semibold text-ink-700">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className={input}
            />

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-ink-700">Who sees it</label>
                <select value={forCourse} onChange={(e) => setForCourse(e.target.value)} className={input}>
                  <option value="">Everyone in the academy</option>
                  {courseSlugs.map((s) => (
                    <option key={s} value={s}>
                      {s} only
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700">Importance</label>
                <select value={kind} onChange={(e) => setKind(e.target.value)} className={input}>
                  <option value="info">Normal</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <button
              disabled={busy}
              className="mt-4 rounded-lg bg-brand-500 px-6 py-3 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {busy ? "Posting…" : "Post announcement"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
