"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/components/shared/AppShell";
import { clearSession } from "@/lib/session";

interface RoleSwitcherProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
}

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
  const router = useRouter();

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
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-surface hover:bg-surface-hover border border-border-default hover:border-border-strong rounded-full transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        title="Switch role — navigates to that role's home"
      >
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
        <span className="text-xs text-main font-medium hidden sm:block max-w-[120px] truncate">
          {active.value === "entrepreneur" ? "Entrepreneur" : "SCA Officer"}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-surface border border-border-default rounded-xl shadow-card overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-border-default">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
              Switch Role
            </p>
            <p className="text-xs text-muted mt-0.5">
              Navigates to that role&apos;s home — no real auth yet.
            </p>
          </div>

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
                    transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent
                    ${isActive
                      ? "bg-surface-hover text-main"
                      : "text-main hover:bg-surface-hover"
                    }
                  `}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white shrink-0 ${role.bgClass}`}
                  >
                    {role.short}
                  </span>

                  <span className="text-xs font-medium flex-1 truncate">{role.label}</span>

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

          <div className="px-2 pb-2 border-t border-border-default pt-2">
            <button
              onClick={() => {
                clearSession();
                setOpen(false);
                router.replace("/");
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm text-main hover:bg-surface-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              <svg className="w-4 h-4 shrink-0 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-xs font-medium">Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
