"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { RoleSwitcher } from "@/components/shared/RoleSwitcher";

// ---------------------------------------------------------------------------
// Role type — exported so Navbar and RoleSwitcher can import it from one place
// without creating a circular dependency.
// ---------------------------------------------------------------------------
export type Role = "entrepreneur" | "officer";

// Map Role values to the data-role attribute values used in globals.css.
const DATA_ROLE: Record<Role, string> = {
  entrepreneur: "entrepreneur",
  officer:      "sca-officer",
};

// Default landing route for each role — used both for auto-navigation on
// role switch and for redirect enforcement when a user lands on a wrong route.
export const ROLE_HOME: Record<Role, string> = {
  entrepreneur: "/module1/market-reach",
  officer:      "/officer/console",
};

// ---------------------------------------------------------------------------
// AppShell — client boundary that owns `currentRole` state.
//
// layout.tsx is intentionally kept as a Server Component (no "use client")
// for Next.js metadata + font loading. AppShell is the thin client wrapper
// that provides role-aware UI to the rest of the shell.
//
// TEMPORARY ROLE-BASED ROUTE GATE
// The useEffect below enforces that non-officers cannot view /officer routes.
// Modules 1 and 2 are shared and completely ungated.
//
// TODO: Replace this client-side redirect with real middleware-level auth once
// authentication is implemented.
// ---------------------------------------------------------------------------
export function AppShell({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<Role>("entrepreneur");
  const router   = useRouter();
  const pathname = usePathname();

  // ── 1. Sync CSS accent-variable scope ──────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute("data-role", DATA_ROLE[currentRole]);
  }, [currentRole]);

  // ── 2. Temporary client-side route gate (Asymmetric) ───────────────────
  // Modules 1 & 2 are open to both. /officer/ is restricted to sca-officers.
  useEffect(() => {
    if (currentRole === "entrepreneur" && pathname.startsWith("/officer")) {
      router.replace(ROLE_HOME.entrepreneur);
    }
  }, [currentRole, pathname, router]);

  // ── 3. Role-change handler — updates state AND navigates ───────────────
  function handleRoleChange(newRole: Role) {
    setCurrentRole(newRole);
    router.push(ROLE_HOME[newRole]);
  }

  return (
    <div className="flex min-h-screen bg-[#090d16]">

      {/* ── Fixed left sidebar ── */}
      <Navbar currentRole={currentRole} />

      {/* ── Content column: offset by sidebar width (w-64 = 256px) ── */}
      <div className="flex flex-col flex-1 ml-64 min-h-screen">

        {/* Sticky top strip — role switcher lives here, top-right of content area */}
        <div className="sticky top-0 z-30 flex items-center justify-end px-6 py-2.5 bg-[#090d16]/90 backdrop-blur-sm border-b border-slate-800/60">
          <RoleSwitcher currentRole={currentRole} onRoleChange={handleRoleChange} />
        </div>

        {/* Main page content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-[#090d16] py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-6 text-center text-xs text-slate-600">
            DYNAMIS Platform &copy; 2026 — Ministry of Social Justice &amp; Empowerment / NBCFDC
          </div>
        </footer>
      </div>
    </div>
  );
}
