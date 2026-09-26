"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Role } from "@/components/shared/AppShell";
import { ROLE_HOME } from "@/components/shared/AppShell";
import { setSession } from "@/lib/session";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isValidMobile(v: string) {
  return /^[6-9]\d{9}$/.test(v);
}

function maskMobile(mobile: string) {
  return `+91 ${mobile.slice(0, 2)}••••••${mobile.slice(-2)}`;
}

// ─── Brand Panel ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    label: "Check your market",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 shrink-0">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    label: "Understand competition",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 shrink-0">
        <path d="M3 3v18h18" /><path d="m18 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
  {
    label: "Plan your finances",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 shrink-0">
        <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
      </svg>
    ),
  },
];

function BrandPanel() {
  return (
    <div className="relative flex flex-col justify-center px-8 py-12 md:px-12 lg:px-16 overflow-hidden min-h-[300px] md:min-h-screen">
      {/* Full-bleed hero image */}
      <Image 
        src="/images/login-hero.png" 
        alt="Rural tea field" 
        fill 
        className="object-cover" 
        priority 
      />

      {/* Gradient overlay fading in from bottom */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
      />

      {/* Content */}
      <div className="relative z-10 text-white max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-4 mb-10">
          <span
            className="text-white font-extrabold text-xl px-4 py-2 rounded-xl tracking-wide shadow-md"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
          >
            DYNAMIS
          </span>
          <span className="text-xs text-white/80 font-medium leading-tight">
            Rural Credit<br />Platform
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-white mb-6">
          Know your market.<br />Plan your funding.
        </h1>
        <p className="text-base md:text-lg text-white/80 leading-relaxed mb-12 max-w-[28ch]">
          Business guidance and government scheme support for rural entrepreneurs.
        </p>

        <ul className="space-y-6">
          {FEATURES.map((f) => (
            <li key={f.label} className="flex items-center gap-4 text-base font-medium text-white/90">
              <span className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
                {f.svg}
              </span>
              {f.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── OTP Input ────────────────────────────────────────────────────────────────

function OtpInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const focus = (i: number) => refs.current[i]?.focus();

  const handleChange = (i: number, raw: string) => {
    // Only accept digits
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (digit && i < 5) focus(i + 1);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (value[i]) {
        const next = [...value];
        next[i] = "";
        onChange(next);
      } else if (i > 0) {
        focus(i - 1);
        const next = [...value];
        next[i - 1] = "";
        onChange(next);
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && i > 0) {
      focus(i - 1);
    } else if (e.key === "ArrowRight" && i < 5) {
      focus(i + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      onChange(pasted.split(""));
      focus(5);
      e.preventDefault();
    }
  };

  return (
    <div className="flex gap-2 justify-center" role="group" aria-label="One-time passcode">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-12 h-16 text-center text-lg font-bold rounded-xl border-2 border-border-default bg-surface-subtle text-main transition-all focus:bg-surface focus:border-accent-strong focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          aria-label={`OTP digit ${i + 1}`}
          style={{ fontSize: "16px" }} // prevents iOS zoom
        />
      ))}
    </div>
  );
}

// ─── Sign-in Card ─────────────────────────────────────────────────────────────

interface SignInCardProps {
  onSuccess: (role: Role, mobile: string) => void;
}

function SignInCard({ onSuccess }: SignInCardProps) {
  const [role, setRole] = useState<Role>("entrepreneur");
  const [step, setStep] = useState<1 | 2>(1);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [mobileError, setMobileError] = useState("");
  const [otpError, setOtpError] = useState("");
  const mobileRef = useRef<HTMLInputElement>(null);

  // Focus mobile field on mount
  useEffect(() => { mobileRef.current?.focus(); }, []);

  // Sync role to document so the theme matches the active toggle pill
  useEffect(() => {
    document.documentElement.setAttribute("data-role", role === "officer" ? "sca-officer" : "entrepreneur");
  }, [role]);

  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidMobile(mobile)) {
      setMobileError("Enter a valid 10-digit mobile number");
      return;
    }
    setMobileError("");
    setStep(2);
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setOtpError("Enter the 6-digit OTP");
      return;
    }
    setOtpError("");
    onSuccess(role, mobile);
  }

  function handleChangeNumber() {
    setStep(1);
    setOtp(Array(6).fill(""));
    setOtpError("");
    setTimeout(() => mobileRef.current?.focus(), 50);
  }

  const ROLES: { value: Role; label: string }[] = [
    { value: "entrepreneur", label: "Entrepreneur" },
    { value: "officer", label: "SCA Officer" },
  ];

  return (
    <div className="app-card w-full max-w-lg mx-auto px-8 py-10 md:px-10 md:py-12 relative z-10">
      {/* Card header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-main">Sign in</h2>
        <p className="text-base text-muted mt-1.5">Continue to your account</p>
      </div>

      {/* Role segmented control */}
      <fieldset className="mb-8">
        <legend className="text-sm font-semibold text-muted uppercase tracking-wider mb-2.5">
          I am a
        </legend>
        <div className="flex gap-1.5 p-1.5 rounded-xl border border-border-default bg-surface-subtle">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              aria-pressed={role === r.value}
              className={`flex-1 min-h-[48px] px-4 py-2.5 rounded-lg text-base font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                role === r.value
                  ? "bg-accent-strong text-white shadow-sm"
                  : "text-muted hover:text-main"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </fieldset>

      {step === 1 ? (
        <form onSubmit={handleSendOtp} noValidate>
          <div className="mb-6">
            <label htmlFor="mobile" className="block text-base font-medium text-main mb-2.5">
              Mobile number
            </label>
            <div className="flex gap-2.5">
              <span className="flex items-center px-4 min-h-[56px] text-base font-medium text-main bg-surface-subtle border border-border-default rounded-xl select-none">
                +91
              </span>
              <input
                ref={mobileRef}
                id="mobile"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                  if (mobileError) setMobileError("");
                }}
                placeholder="10-digit mobile number"
                aria-describedby={mobileError ? "mobile-error" : undefined}
                aria-invalid={!!mobileError}
                className={`flex-1 min-h-[56px] px-4 text-base bg-surface-subtle border rounded-xl text-main placeholder-muted focus:bg-surface focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent transition-colors ${
                  mobileError ? "border-[var(--status-error)]" : "border-border-default focus:border-accent-strong"
                }`}
                style={{ fontSize: "16px" }}
              />
            </div>
            {mobileError && (
              <p id="mobile-error" role="alert" aria-live="assertive" className="text-sm font-medium mt-2" style={{ color: "var(--status-error)" }}>
                {mobileError}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full min-h-[56px] px-6 py-3 bg-gradient-to-r from-emerald-900 to-emerald-500 hover:from-emerald-800 hover:to-emerald-400 text-white font-bold text-base rounded-xl transition-all shadow-md flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Send OTP
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} noValidate>
          <p className="text-base text-muted mb-6">
            Enter the 6-digit OTP sent to{" "}
            <span className="font-semibold text-main">{maskMobile(mobile)}</span>
          </p>

          <div className="mb-2">
            <OtpInput value={otp} onChange={setOtp} />
          </div>

          {otpError && (
            <p role="alert" aria-live="assertive" className="text-sm font-medium mt-3 text-center" style={{ color: "var(--status-error)" }}>
              {otpError}
            </p>
          )}

          <button
            type="submit"
            className="w-full min-h-[56px] px-6 py-3 bg-gradient-to-r from-emerald-900 to-emerald-500 hover:from-emerald-800 hover:to-emerald-400 text-white font-bold text-base rounded-xl mt-6 transition-all shadow-md flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Verify &amp; continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>

          <div className="flex justify-center gap-5 mt-5">
            <button
              type="button"
              onClick={() => setOtp(Array(6).fill(""))}
              className="text-sm font-medium text-accent-strong hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
            >
              Resend OTP
            </button>
            <span className="text-border-strong select-none" aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleChangeNumber}
              className="text-sm font-medium text-accent-strong hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
            >
              Change number
            </button>
          </div>

          <p className="text-center text-sm text-muted mt-6">
            Demo mode: any 6-digit OTP works
          </p>
        </form>
      )}
    </div>
  );
}

// ─── Main Login Page ──────────────────────────────────────────────────────────

export function LoginPage() {
  const router = useRouter();

  const handleSuccess = useCallback(
    (role: Role, mobile: string) => {
      setSession({ role, mobile });
      // Set the data-role attribute so AppShell picks up the right accent immediately
      const dataRole = role === "officer" ? "sca-officer" : "entrepreneur";
      document.documentElement.setAttribute("data-role", dataRole);
      router.replace(ROLE_HOME[role]);
    },
    [router]
  );

  return (
    <div className="min-h-screen flex flex-col bg-page">
      {/* Theme toggle — always top-right */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Desktop: side-by-side; Mobile: stacked */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Brand panel — full-width on mobile, half on desktop */}
        <div className="md:w-[45%] lg:w-1/2 relative flex flex-col">
          <BrandPanel />
        </div>

        {/* Sign-in area */}
        <div 
          className="flex-1 flex flex-col relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle at 85% 15%, var(--accent-subtle) 0%, transparent 45%), radial-gradient(circle at 15% 85%, var(--accent-glow) 0%, transparent 45%)'
          }}
        >
          {/* Sign-in card — centred */}
          <div className="flex-1 flex items-center justify-center px-4 py-8 md:py-16 relative z-10">
            <SignInCard onSuccess={handleSuccess} />
          </div>

          {/* Mobile-only: feature list after card */}
          <div className="md:hidden px-8 pb-10 space-y-4 relative z-10">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-4 text-base font-medium text-muted">
                <span className="w-12 h-12 rounded-2xl flex items-center justify-center bg-surface-subtle shrink-0 text-muted">
                  {f.svg}
                </span>
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
