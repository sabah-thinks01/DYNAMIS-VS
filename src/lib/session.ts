/**
 * Mock session helpers for the DYNAMIS demo.
 * Uses sessionStorage — cleared when the browser tab closes.
 * No real auth; pure front-end hackathon demo.
 */

import type { Role } from "@/components/shared/AppShell";

const SESSION_KEY = "dynamis-session";

export interface DynamisSession {
  role: Role;
  mobile: string; // masked, e.g. "+91 ••••••7890"
}

export function getSession(): DynamisSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DynamisSession;
  } catch {
    return null;
  }
}

export function setSession(session: DynamisSession): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}
