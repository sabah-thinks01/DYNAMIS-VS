"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { RoleSwitcher } from "@/components/shared/RoleSwitcher";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Menu } from "lucide-react";
import { getSession, setSession } from "@/lib/session";
import { useProfile } from "@/lib/profile/useProfile";
import { getProfile } from "@/lib/profile/profileStore";
import { RoleContext } from "@/lib/role/RoleContext";
import { HelpChat } from "@/components/shared/HelpChat";

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

  const { profile, ready: profileReady } = useProfile();

  const router   = useRouter();
  const pathname = usePathname();

  const isLoginRoute = pathname === "/";
  const isStartRoute = pathname === "/start";

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
  }, [isLoginRoute, router]);

  // ─── Role guard (Entrepreneur can't visit /officer/*, Officer can't visit /start) ───
  useEffect(() => {
    if (currentRole === "entrepreneur" && pathname.startsWith("/officer")) {
      router.replace(ROLE_HOME.entrepreneur);
    } else if (currentRole === "officer" && pathname === "/start") {
      router.replace(ROLE_HOME.officer);
    }
  }, [currentRole, pathname, router]);

  // ─── Quick Start redirect for entrepreneurs without completed profile ─────
  useEffect(() => {
    if (
      !isLoginRoute &&
      sessionChecked &&
      profileReady &&
      currentRole === "entrepreneur" &&
      !profile?.quickStart &&
      pathname !== "/start"
    ) {
      const freshProfile = getProfile();
      if (!freshProfile?.quickStart) {
        router.replace("/start");
      }
    }
  }, [isLoginRoute, sessionChecked, profileReady, currentRole, profile, pathname, router]);

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
    const session = getSession();
    if (session) {
      setSession({ ...session, role: newRole });
    }
    router.push(ROLE_HOME[newRole]);
  }

  // ── LOGIN ROUTE: render children bare (no sidebar/header/footer) ──────────
  if (isLoginRoute) {
    return <RoleContext.Provider value={currentRole}>{children}</RoleContext.Provider>;
  }

  // ── PROTECTED ROUTE, CHECK IN FLIGHT: show spinner only ──────────────────
  if (!sessionChecked || !profileReady) {
    return <SessionCheckingSpinner />;
  }

  // ── /start ROUTE: minimal shell (header only, no sidebar) ────────────────
  if (isStartRoute) {
    return (
      <RoleContext.Provider value={currentRole}>
        <div className="flex min-h-screen flex-col bg-page text-main">
          <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-8 bg-surface/90 backdrop-blur-md border-b border-border-default">
            <Link
              href={ROLE_HOME[currentRole]}
              className="flex items-center gap-2.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              <span className="text-white font-extrabold text-base px-2.5 py-1 rounded-lg tracking-wide shadow-md bg-accent-strong">
                DYNAMIS
              </span>
              <span className="text-[10px] text-muted font-medium leading-tight hidden sm:block">
                Rural Credit<br />Platform
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <RoleSwitcher currentRole={currentRole} onRoleChange={handleRoleChange} />
            </div>
          </header>

          <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-8 flex flex-col gap-6">
            {children}
          </main>
        </div>
      </RoleContext.Provider>
    );
  }

  // ── PROTECTED ROUTE, SESSION CONFIRMED: render full shell ────────────────
  return (
    <RoleContext.Provider value={currentRole}>
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
      <HelpChat />
    </RoleContext.Provider>
  );
}
