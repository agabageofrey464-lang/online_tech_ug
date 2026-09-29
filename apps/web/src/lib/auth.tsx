"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Same-origin proxy in the browser (/_api/* -> API) to avoid CORS.
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const base = () => (typeof window !== "undefined" ? "/_api" : `${API}/api/v1`);
const TOKEN_KEY = "otu_token";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "vendor" | "admin" | "student" | "lecturer";
  business_name: string;
  vendor_approved: boolean;
  email_verified: boolean;
  twofa_enabled: boolean;
  created_at: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "customer" | "vendor";
  business_name?: string;
  business_category?: string;
  location?: string;
};

type LoginResult = { twofa_required: boolean; user?: AuthUser };

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyLogin: (email: string, code: string) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  verifyEmail: (code: string) => Promise<AuthUser>;
  resendVerification: () => Promise<void>;
  setTwofa: (enabled: boolean) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Fired when the server rejects our token, so the UI can stop pretending. */
export const SESSION_EXPIRED = "otu:session-expired";

/**
 * Authenticated fetch helper — attaches the bearer token if present.
 *
 * It also handles the two things that made an expired session look like a
 * broken site. A dead token used to sit in localStorage for good, so every
 * later request carried it and quietly came back empty — a vendor would open
 * their dashboard to no products and a save that did nothing, with no sign
 * that they had simply been signed out. And a renewed token handed back by the
 * server was ignored, so sessions lapsed even for people using the site daily.
 */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${base()}${path}`, { ...init, headers });

  // The server renews an active session before it lapses; keep the new token.
  const renewed = res.headers.get("X-Refreshed-Token");
  if (renewed) {
    try {
      localStorage.setItem(TOKEN_KEY, renewed);
    } catch {
      /* private mode — the session just ends when the token does */
    }
  }

  // Rejected: drop the dead token and tell the app, once.
  if (res.status === 401 && token) {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(SESSION_EXPIRED));
  }

  return res;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from the stored token on load.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authFetch("/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Any rejected request signs the whole app out, so the header, the account
  // page and the vendor dashboard cannot disagree about who is signed in.
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(SESSION_EXPIRED, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED, onExpired);
  }, []);

  async function post(path: string, body: unknown) {
    const res = await fetch(`${base()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || "Something went wrong. Please try again.");
    return data;
  }

  function saveSession(data: { access_token: string; user: AuthUser }): AuthUser {
    localStorage.setItem(TOKEN_KEY, data.access_token);
    setUser(data.user);
    return data.user;
  }

  async function login(email: string, password: string): Promise<LoginResult> {
    const data = await post("/auth/login", { email, password });
    if (data.twofa_required) return { twofa_required: true };
    const u = saveSession(data);
    return { twofa_required: false, user: u };
  }

  async function verifyLogin(email: string, code: string): Promise<AuthUser> {
    return saveSession(await post("/auth/login/verify", { email, code }));
  }

  const register = async (input: RegisterInput) => saveSession(await post("/auth/register", input));

  async function verifyEmail(code: string): Promise<AuthUser> {
    const res = await authFetch("/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || "Invalid or expired code");
    setUser(data);
    return data as AuthUser;
  }

  async function resendVerification(): Promise<void> {
    await authFetch("/auth/resend-verification", { method: "POST" });
  }

  async function setTwofa(enabled: boolean): Promise<AuthUser> {
    const res = await authFetch("/auth/2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || "Could not update 2FA");
    setUser(data);
    return data as AuthUser;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, verifyLogin, register, verifyEmail, resendVerification, setTwofa, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
