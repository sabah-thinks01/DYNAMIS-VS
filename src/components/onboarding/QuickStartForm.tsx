"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveQuickStart, SAMPLE_PINCODE } from "@/lib/profile/profileStore";
import { useProfile } from "@/lib/profile/useProfile";
import type { BusinessType, BusinessStage, LoanRange } from "@/lib/profile/types";

const BUSINESS_TYPES: { id: BusinessType; title: string; subtitle?: string; icon: React.ReactNode }[] = [
  {
    id: "farmSupplies",
    title: "Farm supplies",
    subtitle: "seeds, fertilizer",
    icon: (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a9 9 0 0 1 9 9c0 4.97-4.03 9-9 9A9 9 0 0 1 3 11a9 9 0 0 1 9-9Z" />
        <path d="M12 7v10" />
        <path d="M8 11c2-1 4-1 4-1s2 0 4 1" />
      </svg>
    ),
  },
  {
    id: "dairyAnimals",
    title: "Dairy and animals",
    icon: (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3v4" />
        <path d="M16 3v4" />
        <rect width="18" height="14" x="3" y="7" rx="2" />
        <path d="M7 15h.01" />
        <path d="M17 15h.01" />
      </svg>
    ),
  },
  {
    id: "foodMaking",
    title: "Food making",
    icon: (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 13.87A8 8 0 0 1 18 13.87" />
        <path d="M6 17h12" />
        <path d="M12 2v4" />
        <path d="M4 10h16" />
      </svg>
    ),
  },
  {
    id: "tailoring",
    title: "Tailoring and clothes",
    icon: (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="20" y1="4" x2="8.12" y2="15.88" />
        <line x1="14.47" y1="14.48" x2="20" y2="20" />
        <line x1="8.12" y1="8.12" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    id: "smallShop",
    title: "Small shop",
    icon: (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
        <path d="M2 7h20" />
      </svg>
    ),
  },
  {
    id: "repairServices",
    title: "Repair and services",
    icon: (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    id: "other",
    title: "Something else",
    icon: (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </svg>
    ),
  },
];

const LOAN_RANGES: { id: LoanRange; label: string }[] = [
  { id: "under1L", label: "Less than ₹1 lakh" },
  { id: "1to5L", label: "₹1 – 5 lakh" },
  { id: "5to15L", label: "₹5 – 15 lakh" },
  { id: "above15L", label: "More than ₹15 lakh" },
  { id: "notSure", label: "Not sure yet" },
];

export function QuickStartForm() {
  const router = useRouter();
  const { profile, ready } = useProfile();

  const [pincode, setPincode] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType | "">("");
  const [businessTypeOther, setBusinessTypeOther] = useState("");
  const [stage, setStage] = useState<BusinessStage | "">("");
  const [loanRange, setLoanRange] = useState<LoanRange | "">("");

  const [touchedPincode, setTouchedPincode] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Prefill when editing
  useEffect(() => {
    if (ready && profile?.quickStart) {
      setPincode(profile.quickStart.pincode.value);
      setBusinessType(profile.quickStart.businessType.value);
      if (profile.quickStart.businessTypeOther) {
        setBusinessTypeOther(profile.quickStart.businessTypeOther.value);
      }
      setStage(profile.quickStart.stage.value);
      setLoanRange(profile.quickStart.loanRange.value);
      setIsPrefilled(true);
    }
  }, [ready, profile]);

  // Validation
  const isPincodeValid = /^[1-9]\d{5}$/.test(pincode.trim());
  const isOtherValid = businessType !== "other" || businessTypeOther.trim().length > 0;
  const isFormValid =
    isPincodeValid &&
    businessType !== "" &&
    isOtherValid &&
    stage !== "" &&
    loanRange !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    saveQuickStart(
      {
        pincode: pincode.trim(),
        businessType: businessType as BusinessType,
        businessTypeOther: businessType === "other" ? businessTypeOther.trim() : undefined,
        stage: stage as BusinessStage,
        loanRange: loanRange as LoanRange,
      },
      "entrepreneur"
    );

    router.push("/module1/market-reach");
  };

  const handleSkip = () => {
    saveQuickStart(
      {
        pincode: SAMPLE_PINCODE,
        businessType: "farmSupplies",
        stage: "new",
        loanRange: "1to5L",
      },
      "sample"
    );

    router.push("/module1/market-reach");
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-4 md:py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-border-default pb-5">
        <h1 className="page-title">Tell us about your business</h1>
        <p className="page-subtitle mt-1">
          4 quick questions. You can change these answers later.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Q1: Pincode */}
        <fieldset className="space-y-3">
          <legend className="text-base font-bold text-main">
            Where will your business be?
          </legend>
          <div className="space-y-1.5 max-w-sm">
            <label htmlFor="pincode-input" className="block text-xs font-semibold text-muted uppercase tracking-wider">
              Your area pincode
            </label>
            <input
              id="pincode-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoComplete="postal-code"
              placeholder="e.g. 413102"
              value={pincode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setPincode(val);
                if (!touchedPincode) setTouchedPincode(true);
              }}
              onBlur={() => setTouchedPincode(true)}
              aria-describedby={touchedPincode && !isPincodeValid ? "pincode-error" : "pincode-helper"}
              className="w-full min-h-[48px] px-4 py-2.5 bg-surface border border-border-default rounded-xl text-base text-main placeholder-muted focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-accent-strong focus:outline-none transition-colors"
            />
            <span id="pincode-helper" className="text-xs text-muted block">
              6 digits
            </span>
            {touchedPincode && !isPincodeValid && (
              <span id="pincode-error" className="text-xs text-[var(--status-error)] font-medium block">
                Please enter a 6-digit pincode.
              </span>
            )}
          </div>
        </fieldset>

        {/* Q2: Business Type */}
        <fieldset className="space-y-4">
          <legend className="text-base font-bold text-main">
            What kind of business?
          </legend>
          <div
            role="radiogroup"
            aria-label="What kind of business?"
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {BUSINESS_TYPES.map((b) => {
              const isChecked = businessType === b.id;
              return (
                <label
                  key={b.id}
                  className={`
                    flex flex-col items-start justify-between p-4 min-h-[96px] rounded-xl border-2 cursor-pointer transition-all
                    ${
                      isChecked
                        ? "border-accent-strong bg-accent-subtle shadow-sm"
                        : "border-border-default bg-surface hover:bg-surface-subtle"
                    }
                  `}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={isChecked ? "text-accent-strong" : "text-muted"}>
                      {b.icon}
                    </span>
                    <input
                      type="radio"
                      name="businessType"
                      value={b.id}
                      checked={isChecked}
                      onChange={() => setBusinessType(b.id)}
                      className="w-4 h-4 text-accent-strong border-border-strong focus:ring-accent-strong accent-accent-strong shrink-0"
                    />
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-bold text-main leading-snug">{b.title}</p>
                    {b.subtitle && (
                      <p className="text-xs text-muted mt-0.5 leading-tight">{b.subtitle}</p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          {businessType === "other" && (
            <div className="space-y-1.5 max-w-md pt-2">
              <label htmlFor="other-input" className="block text-xs font-semibold text-muted uppercase tracking-wider">
                Tell us in a few words
              </label>
              <input
                id="other-input"
                type="text"
                maxLength={60}
                required
                placeholder="e.g. Pottery, organic honey"
                value={businessTypeOther}
                onChange={(e) => setBusinessTypeOther(e.target.value)}
                className="w-full min-h-[44px] px-4 py-2 bg-surface border border-border-default rounded-xl text-sm text-main placeholder-muted focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-accent-strong focus:outline-none transition-colors"
              />
            </div>
          )}
        </fieldset>

        {/* Q3: Stage */}
        <fieldset className="space-y-3">
          <legend className="text-base font-bold text-main">
            Is this a new business?
          </legend>
          <div role="radiogroup" aria-label="Is this a new business?" className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
            {[
              { id: "new" as BusinessStage, label: "Starting new" },
              { id: "running" as BusinessStage, label: "Already running" },
            ].map((s) => {
              const isChecked = stage === s.id;
              return (
                <label
                  key={s.id}
                  className={`
                    flex items-center justify-between p-4 min-h-[52px] rounded-xl border-2 cursor-pointer transition-all
                    ${
                      isChecked
                        ? "border-accent-strong bg-accent-subtle shadow-sm"
                        : "border-border-default bg-surface hover:bg-surface-subtle"
                    }
                  `}
                >
                  <span className="text-sm font-bold text-main">{s.label}</span>
                  <input
                    type="radio"
                    name="stage"
                    value={s.id}
                    checked={isChecked}
                    onChange={() => setStage(s.id)}
                    className="w-4 h-4 text-accent-strong border-border-strong focus:ring-accent-strong accent-accent-strong"
                  />
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Q4: Loan Range */}
        <fieldset className="space-y-3">
          <div>
            <legend className="text-base font-bold text-main">
              How much money do you need?
            </legend>
            <p className="text-xs text-muted mt-0.5">
              Total money needed to start
            </p>
          </div>
          <div role="radiogroup" aria-label="How much money do you need?" className="space-y-2.5 max-w-md">
            {LOAN_RANGES.map((lr) => {
              const isChecked = loanRange === lr.id;
              return (
                <label
                  key={lr.id}
                  className={`
                    flex items-center justify-between p-4 min-h-[48px] rounded-xl border-2 cursor-pointer transition-all
                    ${
                      isChecked
                        ? "border-accent-strong bg-accent-subtle shadow-sm"
                        : "border-border-default bg-surface hover:bg-surface-subtle"
                    }
                  `}
                >
                  <span className="text-sm font-medium text-main">{lr.label}</span>
                  <input
                    type="radio"
                    name="loanRange"
                    value={lr.id}
                    checked={isChecked}
                    onChange={() => setLoanRange(lr.id)}
                    className="w-4 h-4 text-accent-strong border-border-strong focus:ring-accent-strong accent-accent-strong"
                  />
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
          <button
            type="submit"
            disabled={!isFormValid}
            className="w-full sm:w-auto min-h-[48px] px-8 py-2.5 btn-primary font-semibold text-base rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPrefilled ? "Save my answers" : "See my market"}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2 text-sm font-medium text-muted hover:text-main transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded-xl text-center"
          >
            Skip – use the sample business
          </button>
        </div>
      </form>
    </div>
  );
}
