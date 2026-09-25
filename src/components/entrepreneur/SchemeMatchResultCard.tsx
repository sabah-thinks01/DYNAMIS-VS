import React from "react";
import type { SchemeMatchResult } from "@/lib/schemeEngine";
import { MARGIN_MONEY_PERCENT, BANK_LOAN_PERCENT } from "@/lib/schemeEngine";

interface SchemeMatchResultCardProps {
  result: SchemeMatchResult | null;
}

export function SchemeMatchResultCard({ result }: SchemeMatchResultCardProps) {
  // ---- State A: Form not yet complete ----
  if (result === null) {
    return (
      <div className="app-card rounded-2xl p-6 flex flex-col items-center justify-center min-h-[280px] text-center space-y-4 border border-border-default">
        <div className="w-12 h-12 rounded-full bg-surface-subtle border border-border-default flex items-center justify-center text-muted shadow-inner">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 7h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-main">Awaiting Information</p>
          <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
            Complete the calculator form to determine your eligibility and view the estimated scheme breakdown.
          </p>
        </div>
      </div>
    );
  }

  // ---- State B: Ineligible — rose/destructive, never accent-colored ----
  if (!result.eligible) {
    return (
      <div className="app-card rounded-2xl p-6 shadow-lg border border-[var(--status-error-border)]">
        <div className="flex items-start space-x-3 border-b border-border-default pb-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-[var(--status-error-bg)] flex items-center justify-center shrink-0 mt-0.5 border border-[var(--status-error-border)] shadow-[0_0_15px_var(--status-error-glow)]">
            <svg className="w-5 h-5 text-[var(--status-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-semibold text-[var(--status-error)] uppercase tracking-widest block mb-1">Not Eligible</span>
            <h2 className="text-lg font-bold text-main leading-snug">Scheme Criteria Not Met</h2>
          </div>
        </div>
        <div className="bg-[var(--status-error-bg)] border border-[var(--status-error-border)] rounded-xl p-4 text-xs text-main leading-relaxed shadow-inner">
          <span className="font-bold text-[var(--status-error)] block mb-1">Reason:</span>
          {result.ineligibilityReason}
        </div>
        <p className="text-xs text-muted mt-5">
          Adjust the project cost or income details and the result will update automatically.
        </p>
      </div>
    );
  }

  // ---- State C: Eligible — accent-themed ----
  return (
    <div className="app-card rounded-2xl p-6 shadow-xl border border-border-default/80">
      <div className="flex items-center justify-between border-b border-border-default/60 pb-4 mb-5">
        <div>
          {/* "Matched Scheme Result" label uses neutral text */}
          <span className="text-xs font-semibold uppercase tracking-wider block mb-1 text-muted">
            Matched Scheme Result
          </span>
          <h2 className="text-xl font-extrabold text-main">{result.schemeName}</h2>
        </div>
        {/* Interest rate badge — neutral outline */}
        <span className="text-xs font-semibold px-3 py-1 rounded-full border border-border-strong text-main bg-surface-subtle">
          Est. {result.interestRatePercent}% p.a.
        </span>
      </div>

      {/* 2-Way NBCFDC Capital Split */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          Capital Split Structure (2-Way)
        </h3>
        {/* Split bar: amber for margin (semantic warning — stays fixed), accent for loan */}
        <div className="w-full h-3 bg-surface rounded-full overflow-hidden flex mb-3 shadow-inner">
          <div
            style={{ width: `${MARGIN_MONEY_PERCENT}%`, backgroundColor: "var(--status-warning)" }}
            className="h-full"
            title={`Entrepreneur Margin (${MARGIN_MONEY_PERCENT}%)`}
          />
          <div
            style={{
              width: `${BANK_LOAN_PERCENT}%`,
              backgroundColor: "var(--accent-strong)",
            }}
            className="h-full"
            title={`SCA / Bank Loan (${BANK_LOAN_PERCENT}%)`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          {/* Margin column — amber (semantic, stays fixed) */}
          <div className="bg-surface/60 p-4 rounded-xl border border-border-default">
            <span className="text-muted block mb-1.5">
              Entrepreneur Margin ({MARGIN_MONEY_PERCENT}%)
            </span>
            <span className="text-lg font-extrabold text-[var(--status-warning)]">
              ₹{result.marginMoney!.toLocaleString("en-IN")}
            </span>
          </div>
          {/* Loan column — neutral stat */}
          <div className="bg-surface/60 p-4 rounded-xl border border-border-default">
            <span className="text-muted block mb-1.5">
              SCA Term Loan ({BANK_LOAN_PERCENT}%)
            </span>
            <span className="text-lg font-extrabold text-main">
              ₹{result.loanAmount!.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* EMI & Repayment Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-border-default/60 pt-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted block mb-1">Indicative Rate</span>
          <span className="text-base font-bold text-main">{result.interestRatePercent}%</span>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted block mb-1">Est. Monthly EMI</span>
          <span className="text-base font-bold text-main">
            ₹{result.monthlyEMI!.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted block mb-1">Tenure</span>
          <span className="text-base font-bold text-main">{result.tenureMonths} mo</span>
        </div>
      </div>

      {/* Total Repayment Breakdown */}
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border-default/60 pt-4 text-xs">
        <div className="bg-surface/40 p-3 rounded-xl border border-border-default">
          <span className="text-muted block mb-1">Total Interest Payable</span>
          <span className="font-bold text-main text-sm">
            ₹{result.totalInterestPayable!.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </span>
        </div>
        <div className="bg-surface/40 p-3 rounded-xl border border-border-default">
          <span className="text-muted block mb-1">Total Repayment</span>
          <span className="font-bold text-main text-sm">
            ₹{result.totalRepayment!.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* Footer — live status dot */}
      <div className="mt-4 pt-4 border-t border-border-default text-xs text-muted flex items-center justify-between">
        <span>* Figures are indicative pending final confirmation.</span>
        <span className="flex items-center gap-1.5 font-medium text-muted">
          <span className="accent-dot w-1.5 h-1.5 rounded-full animate-pulse" />
          Module 2 Live
        </span>
      </div>
    </div>
  );
}
