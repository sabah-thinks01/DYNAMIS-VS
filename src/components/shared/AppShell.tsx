"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { RoleSwitcher } from "@/components/shared/RoleSwitcher";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Menu } from "lucide-react";
import { getSession } from "@/lib/session";

export type Role = "entrepreneur" | "officer";

const DATA_ROLE: Record<Role, string> = {
  entrepreneur: "entrepreneur",
  officer:      "sca-officer",
};

export const ROLE_HOME: Record<Role, string> = {
  entrepreneur: "/module1/market-reach",
  officer:      "/officer/console",
};

/** Centered full-page spinner shown while the session check is in flight. */
function SessionCheckingSpinner() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-page"
      aria-busy="true"
      aria-label="Checking session"
    >
      <div className="w-8 h-8 border-4 border-border-default border-t-accent-strong rounded-full animate-spin" />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<Role>("entrepreneur");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  /**
   * sessionChecked starts false.
   * While false, protected routes render ONLY the spinner — never children.
   * Flips to true once we've read sessionStorage (synchronous, sub-ms).
   */
  const [sessionChecked, setSessionChecked] = useState(false);

  const router   = useRouter();
  const pathname = usePathname();

  const isLoginRoute = pathname === "/";

  // ─── Session guard ────────────────────────────────────────────────────────
  useEffect(() => {
    // Login page bypasses the guard entirely — always show it.
    if (isLoginRoute) {
      setSessionChecked(true);
      return;
    }

    const session = getSession();
    if (!session) {
      // No session: redirect to login. Keep sessionChecked=false so we never
      // render children while the navigation is pending.
      router.replace("/");
    } else {
      // Valid session: seed the role, then unlock rendering.
      setCurrentRole(session.role);
      setSessionChecked(true);
    }
  // pathname (via isLoginRoute) and router are stable references; listing them
  // prevents the exhaustive-deps lint warning without causing extra runs.
  }, [isLoginRoute, router]);

  // ─── Existing role-guard (Entrepreneur can't visit /officer/*) ───────────
  useEffect(() => {
    if (currentRole === "entrepreneur" && pathname.startsWith("/officer")) {
      router.replace(ROLE_HOME.entrepreneur);
    }
  }, [currentRole, pathname, router]);

  // ─── Close mobile menu on navigation ─────────────────────────────────────
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // ─── data-role attribute sync ─────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute("data-role", DATA_ROLE[currentRole]);
  }, [currentRole]);

  function handleRoleChange(newRole: Role) {
    setCurrentRole(newRole);
    router.push(ROLE_HOME[newRole]);
  }

  // ── LOGIN ROUTE: render children bare (no sidebar/header/footer) ──────────
  // The LoginPage carries its own full-page layout.
  if (isLoginRoute) {
    return <>{children}</>;
  }

  // ── PROTECTED ROUTE, CHECK IN FLIGHT: show spinner only ──────────────────
  // sessionChecked stays false until getSession() resolves (or redirect fires).
  // Children are never rendered in this branch, so there is no flash of
  // protected content.
  if (!sessionChecked) {
    return <SessionCheckingSpinner />;
  }

  // ── PROTECTED ROUTE, SESSION CONFIRMED: render full shell ────────────────
  return (
    <div className="flex min-h-screen bg-page text-main">
      <Navbar currentRole={currentRole} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <div className="flex flex-col flex-1 md:ml-64 min-h-screen min-w-0 transition-all duration-200">
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between md:justify-end px-4 md:px-6 bg-surface/90 backdrop-blur-md border-b border-border-default">
          <button
            className="md:hidden p-2 -ml-2 text-muted hover:text-main focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-md"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <RoleSwitcher currentRole={currentRole} onRoleChange={handleRoleChange} />
          </div>
        </header>

        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-8 flex flex-col gap-6">
          {children}
        </main>
      </div>
    </div>
  );
}
