"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { Role } from "@/components/shared/AppShell";
import { ROLE_HOME } from "@/components/shared/AppShell";
import { Map, Lightbulb, ListTodo, Briefcase, Calculator, ShieldHalf, X } from "lucide-react";

interface SidebarProps {
  currentRole: Role;
  isOpen: boolean;
  onClose: () => void;
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

function ActiveNavLink({
  href, label, icon: Icon, isActive, onClick
}: { href: string; label: string; icon: any; isActive: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-r-lg text-sm font-medium
        transition-colors duration-150 relative border-l-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent
        ${isActive 
          ? "bg-accent-subtle text-accent-strong border-accent-strong" 
          : "text-muted hover:text-main hover:bg-surface-hover border-transparent"}
      `}
    >
      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-accent-strong" : "text-muted"}`} />
      <span>{label}</span>
    </Link>
  );
}

export function Navbar({ currentRole, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen || !navRef.current) return;
    
    // Store previous focus
    previousFocusRef.current = document.activeElement as HTMLElement;
    
    const focusableElements = navRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    
    // Focus first element on open
    const closeBtn = navRef.current.querySelector('button[aria-label="Close menu"]') as HTMLElement;
    closeBtn?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus on close
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const sidebarClasses = `
    fixed inset-y-0 left-0 w-64 z-50 flex flex-col bg-surface border-r border-border-default transition-transform duration-200 ease-in-out
    ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-main/20 backdrop-blur-sm z-40 md:hidden" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside ref={navRef} className={sidebarClasses}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-border-default shrink-0">
          <Link href={ROLE_HOME[currentRole]} className="flex items-center gap-2.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
            <span className="text-white font-extrabold text-base px-2.5 py-1 rounded-lg tracking-wide shadow-md bg-accent-strong">
              DYNAMIS
            </span>
            <span className="text-[10px] text-muted font-medium leading-tight hidden sm:block">
              Rural Credit<br />Platform
            </span>
          </Link>
          <button 
            className="md:hidden p-1.5 text-muted hover:text-main focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-md"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-8">
          <div className="space-y-1 pr-3">
            <div className="px-4 mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                Module 1 — Feasibility
              </p>
            </div>
            {MODULE1_LINKS.map(({ href, label, icon }) =>
              <ActiveNavLink key={href} href={href} label={label} icon={icon} isActive={pathname === href} onClick={() => isOpen && onClose()} />
            )}
          </div>

          <div className="space-y-1 pr-3">
            <div className="px-4 mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                Module 2
              </p>
            </div>
            {MODULE2_LINKS.map(({ href, label, icon }) =>
              <ActiveNavLink key={href} href={href} label={label} icon={icon} isActive={pathname === href} onClick={() => isOpen && onClose()} />
            )}
          </div>

          {currentRole === "officer" && (
            <div className="space-y-1 border-t border-border-default pt-4 pr-3">
              <div className="px-4 mb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                  Government
                </p>
              </div>
              {OFFICER_LINKS.map(({ href, label, icon }) =>
                <ActiveNavLink key={href} href={href} label={label} icon={icon} isActive={pathname === href} onClick={() => isOpen && onClose()} />
              )}
            </div>
          )}
        </nav>

        <div className="shrink-0 px-4 py-4 border-t border-border-default bg-surface">
          <div className="flex items-center gap-2 text-[10px] text-muted font-medium">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-status-good" />
            Platform online — Mock data
          </div>
          <p className="text-[10px] text-muted/70 mt-1">v0.1.0-dev</p>
        </div>
      </aside>
    </>
  );
}
