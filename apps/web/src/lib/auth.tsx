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
  role: "customer" | "vendor" | "admin";
  business_name: string;
  vendor_approved: boolean;
  created_at: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "customer" | "vendor";
  business_name?: string;
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Authenticated fetch helper — attaches the bearer token if present. */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(`${base()}${path}`, { ...init, headers });
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

  async function handleAuth(path: string, body: unknown): Promise<AuthUser> {
    const res = await fetch(`${base()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || "Something went wrong. Please try again.");
    localStorage.setItem(TOKEN_KEY, data.access_token);
    setUser(data.user);
    return data.user as AuthUser;
  }

  const login = (email: string, password: string) => handleAuth("/auth/login", { email, password });
  const register = (input: RegisterInput) => handleAuth("/auth/register", input);

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
