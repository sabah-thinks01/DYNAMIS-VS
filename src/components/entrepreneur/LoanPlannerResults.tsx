"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, AlertCircle, Info } from "lucide-react";
import type { PlanLoanResult } from "@/lib/loanPlanner/planLoan";
import { formatINR, formatLakh } from "@/lib/format";
import { GuideNote } from "@/components/shared/GuideNote";

interface LoanPlannerResultsProps {
  plan: PlanLoanResult;
}

export function LoanPlannerResults({ plan }: LoanPlannerResultsProps) {
  const [showFormula, setShowFormula] = useState(false);

  // 1. noCost -> hide results completely
  if (plan.status === "noCost") {
    return null;
  }

  // 2. overLimit -> friendly message with scheme cap
  if (plan.status === "overLimit") {
    return (
      <div className="bg-status-warning-bg border border-status-warning-border rounded-2xl p-5 sm:p-6 space-y-3 text-status-warning">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm sm:text-base">Plan is above the loan limit</h3>
            <p className="text-xs sm:text-sm text-main leading-relaxed">
              This is more than this loan allows ({formatLakh(plan.maxLoan)}). Try a smaller plan
              or ask your state agency.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. rateUnknown -> split card only (if split percents known) + notice
  if (plan.status === "rateUnknown") {
    const hasSplit =
      typeof plan.loanPart === "number" &&
      typeof plan.ownShare === "number" &&
      typeof plan.nbcfdcPercent === "number" &&
      typeof plan.otherPercent === "number";

    return (
      <div className="space-y-6">
        {hasSplit && (
          <div className="bg-surface rounded-2xl border border-border-default p-5 sm:p-6 shadow-card space-y-4">
            <h3 className="text-base font-bold text-main">How the money splits</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-default">
                <span className="text-xs text-muted block">Total cost</span>
                <span className="text-base font-bold text-main">{formatINR(plan.totalCost)}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-accent-subtle/30 border border-border-default">
                <span className="text-xs text-muted block">Loan ({plan.nbcfdcPercent}%)</span>
                <span className="text-base font-bold text-accent">{formatINR(plan.loanPart!)}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-default">
                <span className="text-xs text-muted block">
                  Your share: up to ({plan.otherPercent}%)
                </span>
                <span className="text-base font-bold text-main">{formatINR(plan.ownShare!)}</span>
              </div>
            </div>
            <p className="text-xs text-muted">
              Sometimes the state agency pays part of your share — ask them.
            </p>
          </div>
        )}

        <div className="p-4 rounded-xl border border-border-default bg-surface-subtle text-xs sm:text-sm text-muted">
          Your state agency will tell you the interest.
        </div>

        <GuideNote />
      </div>
    );
  }

  // 4. status === "ok"
  return (
    <div className="space-y-6">
      {/* How the money splits */}
      <div className="bg-surface rounded-2xl border border-border-default p-5 sm:p-6 shadow-card space-y-4">
        <h3 className="text-base font-bold text-main">How the money splits</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-default">
            <span className="text-xs text-muted block">Total cost</span>
            <span className="text-base font-bold text-main">{formatINR(plan.totalCost)}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-accent-subtle/30 border border-border-default">
            <span className="text-xs text-muted block">Loan ({plan.nbcfdcPercent}%)</span>
            <span className="text-base font-bold text-accent">{formatINR(plan.loanPart)}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-default">
            <span className="text-xs text-muted block">
              Your share: up to ({plan.otherPercent}%)
            </span>
            <span className="text-base font-bold text-main">{formatINR(plan.ownShare)}</span>
          </div>
        </div>
        <p className="text-xs text-muted">
          Sometimes the state agency pays part of your share — ask them.
        </p>
      </div>

      {/* What you pay back */}
      <div className="bg-surface rounded-2xl border border-border-default p-5 sm:p-6 shadow-card space-y-4">
        <h3 className="text-base font-bold text-main">What you pay back</h3>

        <div className="p-4 sm:p-5 rounded-2xl bg-accent-subtle/30 border border-accent/20 space-y-2">
          <div className="text-xs sm:text-sm text-muted font-medium">Regular payments</div>
          <div className="text-2xl sm:text-3xl font-black text-accent tracking-tight">
            About {formatINR(plan.quarterly)} every 3 months
          </div>
          <div className="text-xs sm:text-sm text-main font-semibold">
            That&apos;s about {formatINR(plan.roughMonthly)} a month to save.
          </div>
          <div className="text-xs text-muted pt-1">
            For about {plan.years} years. No repayment for the first {plan.moratoriumMonths} months.
          </div>
        </div>

        {/* In total */}
        <div className="pt-2 border-t border-border-default/60 space-y-2">
          <h4 className="text-xs font-bold text-muted uppercase tracking-wider">In total</h4>
          <p className="text-xs sm:text-sm text-main leading-relaxed">
            You pay back about <span className="font-bold">{formatINR(plan.totalRepaid)}</span>. Of
            this, <span className="font-bold">{formatINR(plan.totalInterest)}</span> is interest.
          </p>
          {plan.rebateNote && (
            <p className="text-xs text-muted bg-surface-subtle p-3 rounded-lg border border-border-default/60">
              {plan.rebateNote}
            </p>
          )}
        </div>

        {/* Collapsible How we worked this out */}
        <div className="pt-2 border-t border-border-default/60">
          <button
            type="button"
            onClick={() => setShowFormula((prev) => !prev)}
            aria-expanded={showFormula}
            className="w-full flex items-center justify-between text-left py-2 text-xs font-semibold text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>How we worked this out</span>
            </span>
            {showFormula ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showFormula && (
            <div className="mt-3 p-4 rounded-xl bg-surface-subtle/80 border border-border-default text-xs text-muted space-y-2.5 leading-relaxed">
              <p>
                Every 3 months, you pay back a fixed share of the loan plus the interest for that
                period. We spread this evenly across {plan.n} quarterly payments.
              </p>
              <div className="space-y-1 pl-2 border-l-2 border-border-default">
                <p>
                  • <strong className="text-main">Full own share:</strong> Assumes you contribute up
                  to {plan.otherPercent}% unless your state agency pays a portion.
                </p>
                <p>
                  • <strong className="text-main">Free months:</strong> Interest continues to add
                  during the first {plan.moratoriumMonths} months before regular payments start.
                </p>
                <p>
                  • <strong className="text-main">Free months inside the years:</strong> The{" "}
                  {plan.moratoriumMonths} free months are counted inside the {plan.years} years,
                  giving {plan.n} payment quarters.
                </p>
                <p>
                  • <strong className="text-main">Rounded up:</strong> Payments are rounded up to
                  whole rupees.
                </p>
                <p>
                  • <strong className="text-main">On-time rebate:</strong> Timely payment discount is
                  not deducted in advance.
                </p>
              </div>
              <p className="text-[11px] text-muted/90 pt-1">
                Your state agency sets the exact schedule.
              </p>
            </div>
          )}
        </div>
      </div>

      <GuideNote />
    </div>
  );
}
