"use client";

import React, { useState, useRef, useEffect } from "react";
import type { Role } from "@/components/shared/AppShell";

interface RoleSwitcherProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
}

// Each role entry carries its OWN fixed accent colors for the preview dots/rings
// inside the dropdown. These are intentionally hardcoded here — the dropdown
// must always show BOTH accents simultaneously so the user can see what they're
// switching TO. Using CSS variables here would show the same color for both rows.
const ROLES: {
  value: Role;
  label: string;
  short: string;
  bgClass: string;      // avatar background — always role-specific
  ringClass: string;    // avatar ring     — always role-specific
  dotClass: string;     // preview dot     — always role-specific
}[] = [
  {
    value:     "entrepreneur",
    label:     "Entrepreneur",
    short:     "EN",
    bgClass:   "bg-emerald-500",
    ringClass: "ring-emerald-500/60",
    dotClass:  "bg-emerald-500",
  },
  {
    value:     "officer",
    label:     "State Channelizing Agency (SCA) Officer",
    short:     "OF",
    bgClass:   "bg-sky-500",
    ringClass: "ring-sky-500/60",
    dotClass:  "bg-sky-400",
  },
];

export function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const active = ROLES.find((r) => r.value === currentRole)!;

  return (
    <div ref={containerRef} className="relative">
      {/* Avatar trigger button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 hover:border-slate-600 rounded-full transition-all duration-200"
        title="Switch role — navigates to that role's home"
      >
        {/* Avatar circle — uses the role's own fixed color, not the CSS variable,
            so it always reflects that specific role regardless of which is active */}
        <span
          className={`
            w-7 h-7 rounded-full flex items-center justify-center
            text-[11px] font-extrabold text-white
            ${active.bgClass} ring-2 ${active.ringClass}
            shadow-sm shrink-0
          `}
        >
          {active.short}
        </span>
        <span className="text-xs text-slate-300 font-medium hidden sm:block max-w-[120px] truncate">
          {active.value === "entrepreneur" ? "Entrepreneur" : "SCA Officer"}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Switch Role
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Navigates to that role&apos;s home — no real auth yet.
            </p>
          </div>

          {/* Role options — each shows its OWN fixed-color dot so you can
              always distinguish both options regardless of which is active */}
          <div className="p-2">
            {ROLES.map((role) => {
              const isActive = currentRole === role.value;
              return (
                <button
                  key={role.value}
                  onClick={() => {
                    onRoleChange(role.value);
                    setOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                    transition-colors duration-150
                    ${isActive
                      ? "bg-slate-800 text-slate-100"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                    }
                  `}
                >
                  {/* Role avatar — always role-specific color */}
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white shrink-0 ${role.bgClass}`}
                  >
                    {role.short}
                  </span>

                  <span className="text-xs font-medium flex-1">{role.label}</span>

                  {/* Checkmark on active row uses the role's own dot color */}
                  {isActive && (
                    <svg
                      className={`w-4 h-4 shrink-0 ${role.dotClass.replace("bg-", "text-")}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer TODO callout */}
          <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-950/40">
            {/*
             * TODO: Replace this local-state role switcher with the authenticated user's role
             * from the real auth session (e.g. useAuth().role or JWT claims) once
             * Authentication + RBAC is implemented. At that point:
             *   1. Remove this switcher entirely (or keep as admin impersonation tool).
             *   2. Read role from auth context in AppShell.tsx.
             *   3. Hard-gate routes in middleware.ts (not just visual de-emphasis).
             */}
            <p className="text-[10px] text-slate-600 italic leading-relaxed">
              ⚠ Preview only — role selection is local state. Real auth will replace this.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
