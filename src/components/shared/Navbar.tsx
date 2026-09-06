"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/components/shared/AppShell";
import { ROLE_HOME } from "@/components/shared/AppShell";
import { Map, Lightbulb, ListTodo, Briefcase, Calculator, ShieldHalf } from "lucide-react";

// ---------------------------------------------------------------------------
// TODO: Auth integration point
// Replace the `currentRole` prop (received from AppShell's local state) with
// the authenticated user's role once the Auth service is implemented.
//   const { role } = useAuth();   // e.g. 'entrepreneur' | 'officer'
// ---------------------------------------------------------------------------

interface SidebarProps {
  currentRole: Role;
}

const MODULE1_LINKS = [
  { href: "/module1/market-reach", label: "Market Reach", icon: Map },
  { href: "/module1/opportunity-analysis", label: "Opportunity Analysis", icon: Lightbulb },
  { href: "/module1/swot-analysis", label: "SWOT Analysis", icon: ListTodo },
  { href: "/module1/product-market-value", label: "Product Market Value", icon: Briefcase },
];

const MODULE2_LINKS = [
  { href: "/module2/calculator", label: "Financial Calculator", icon: Calculator },
];

const OFFICER_LINKS = [
  { href: "/officer/console", label: "SCA Officer Console", icon: ShieldHalf },
];

// ── Shared active link style (inline — cannot use Tailwind for CSS vars) ──
const activeLinkStyle = {
  backgroundImage:
    "linear-gradient(to right, color-mix(in srgb, var(--accent-from) 90%, transparent), color-mix(in srgb, var(--accent-from) 80%, transparent))",
  borderWidth:  "1px",
  borderStyle:  "solid",
  borderColor:  "var(--accent-border)",
};

/** A nav link that is fully interactive and navigates. */
function ActiveNavLink({
  href, label, icon: Icon, isActive,
}: { href: string; label: string; icon: any; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
        transition-all duration-150
        ${isActive ? "text-white shadow-md" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"}
      `}
      style={isActive ? activeLinkStyle : undefined}
    >
      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
      <span>{label}</span>
    </Link>
  );
}

export function Navbar({ currentRole }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 z-40 flex flex-col bg-slate-900/95 border-r border-slate-800/80">

      {/* ── Brand ── */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800/80 shrink-0">
        <Link href={ROLE_HOME[currentRole]} className="flex items-center gap-2.5">
          {/* Brand pill uses accent gradient — shifts with role */}
          <span
            className="text-white font-extrabold text-base px-2.5 py-1 rounded-lg tracking-wide shadow-md"
            style={{ backgroundImage: "linear-gradient(to right, var(--accent-from), var(--accent-to))" }}
          >
            DYNAMIS
          </span>
          <span className="text-[10px] text-slate-500 font-medium leading-tight hidden sm:block">
            Rural Credit<br />Platform
          </span>
        </Link>
      </div>

      {/* ── Nav sections ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-8">

        {/* ─── Module 1 ─── */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 px-2 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Module 1 — Feasibility
            </p>
          </div>
          {MODULE1_LINKS.map(({ href, label, icon }) =>
            <ActiveNavLink key={href} href={href} label={label} icon={icon} isActive={pathname === href} />
          )}
        </div>

        {/* ─── Module 2 ─── */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 px-2 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Module 2
            </p>
          </div>
          {MODULE2_LINKS.map(({ href, label, icon }) =>
            <ActiveNavLink key={href} href={href} label={label} icon={icon} isActive={pathname === href} />
          )}
        </div>

        {/* ─── Government (Officer Only) ─── */}
        {currentRole === "officer" && (
          <div className="space-y-0.5 border-t border-slate-800/80 pt-4">
            <div className="flex items-center gap-1.5 px-2 mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Government
              </p>
            </div>
            {OFFICER_LINKS.map(({ href, label, icon }) =>
              <ActiveNavLink key={href} href={href} label={label} icon={icon} isActive={pathname === href} />
            )}
          </div>
        )}
      </nav>

      {/* ── Sidebar footer: live status dot ── */}
      <div className="shrink-0 px-4 py-3 border-t border-slate-800/80">
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <span className="accent-dot w-1.5 h-1.5 rounded-full animate-pulse" />
          Platform online — Mock data
        </div>
        <p className="text-[10px] text-slate-700 mt-0.5">v0.1.0-dev</p>
      </div>
    </aside>
  );
}
