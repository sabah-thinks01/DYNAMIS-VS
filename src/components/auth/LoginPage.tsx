"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    label: "Understand competition",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <path d="M3 3v18h18" /><path d="m18 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
  {
    label: "Plan your finances",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
        <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
      </svg>
    ),
  },
];

function BrandPanel() {
  return (
    <div className="relative flex flex-col justify-center px-8 py-12 md:px-12 lg:px-16 overflow-hidden min-h-[200px] md:min-h-screen">
      {/* SVG contour pattern background */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="contours" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="40" cy="40" r="25" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="40" cy="40" r="15" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#contours)" />
      </svg>

      {/* Gradient overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, var(--brand-panel-from, #0a2e1e) 0%, var(--brand-panel-to, #0d3d2a) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-white max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <span
            className="text-white font-extrabold text-lg px-3 py-1.5 rounded-xl tracking-wide shadow-md"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
          >
            DYNAMIS
          </span>
          <span className="text-[11px] text-white/60 font-medium leading-tight">
            Rural Credit<br />Platform
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-white mb-4">
          Know your market.<br />Plan your funding.
        </h1>
        <p className="text-sm text-white/70 leading-relaxed mb-10 max-w-[28ch]">
          Business guidance and government scheme support for rural entrepreneurs.
        </p>

        <ul className="space-y-4">
          {FEATURES.map((f) => (
            <li key={f.label} className="flex items-center gap-3 text-sm text-white/80">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.12)" }}>
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
          className="w-11 h-14 text-center text-base font-bold rounded-xl border-2 border-border-default bg-surface-subtle text-main transition-all focus:bg-surface focus:border-accent-strong focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
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
    <div className="app-card w-full max-w-md mx-auto px-6 py-8 md:px-8 md:py-10">
      {/* Card header */}
      <div className="mb-7">
        <h2 className="text-xl font-bold text-main">Sign in</h2>
        <p className="text-sm text-muted mt-1">Continue to your account</p>
      </div>

      {/* Role segmented control */}
      <fieldset className="mb-6">
        <legend className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
          I am a
        </legend>
        <div className="flex gap-1 p-1 rounded-xl border border-border-default bg-surface-subtle">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              aria-pressed={role === r.value}
              className={`flex-1 min-h-[44px] px-3 py-2 rounded-lg text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
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
          <div className="mb-5">
            <label htmlFor="mobile" className="block text-sm font-medium text-main mb-2">
              Mobile number
            </label>
            <div className="flex gap-2">
              <span className="flex items-center px-3 min-h-[48px] text-sm font-medium text-main bg-surface-subtle border border-border-default rounded-xl select-none">
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
                className={`flex-1 min-h-[48px] px-3.5 text-sm bg-surface-subtle border rounded-xl text-main placeholder-muted focus:bg-surface focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent transition-colors ${
                  mobileError ? "border-[var(--status-error)]" : "border-border-default focus:border-accent-strong"
                }`}
                style={{ fontSize: "16px" }}
              />
            </div>
            {mobileError && (
              <p id="mobile-error" role="alert" aria-live="assertive" className="text-xs font-medium mt-1.5" style={{ color: "var(--status-error)" }}>
                {mobileError}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] px-6 py-3 btn-primary font-semibold text-sm rounded-xl transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Send OTP
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} noValidate>
          <p className="text-sm text-muted mb-5">
            Enter the 6-digit OTP sent to{" "}
            <span className="font-semibold text-main">{maskMobile(mobile)}</span>
          </p>

          <div className="mb-1.5">
            <OtpInput value={otp} onChange={setOtp} />
          </div>

          {otpError && (
            <p role="alert" aria-live="assertive" className="text-xs font-medium mt-2 text-center" style={{ color: "var(--status-error)" }}>
              {otpError}
            </p>
          )}

          <button
            type="submit"
            className="w-full min-h-[48px] px-6 py-3 btn-primary font-semibold text-sm rounded-xl mt-5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            Verify &amp; continue
          </button>

          <div className="flex justify-center gap-4 mt-4">
            <button
              type="button"
              onClick={() => setOtp(Array(6).fill(""))}
              className="text-xs font-medium text-accent-strong hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
            >
              Resend OTP
            </button>
            <span className="text-border-strong select-none" aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleChangeNumber}
              className="text-xs font-medium text-accent-strong hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
            >
              Change number
            </button>
          </div>

          <p className="text-center text-xs text-muted mt-5">
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
        <div
          className="md:w-[45%] lg:w-1/2 relative"
          style={{
            background:
              "linear-gradient(135deg, #0a2e1e 0%, #0d3d2a 100%)",
          }}
        >
          <BrandPanel />
        </div>

        {/* Sign-in area */}
        <div className="flex-1 flex flex-col">
          {/* Sign-in card — centred */}
          <div className="flex-1 flex items-center justify-center px-4 py-8 md:py-16">
            <SignInCard onSuccess={handleSuccess} />
          </div>

          {/* Mobile-only: feature list after card */}
          <div className="md:hidden px-6 pb-8 space-y-3">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-3 text-sm text-muted">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-subtle shrink-0 text-muted">
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
