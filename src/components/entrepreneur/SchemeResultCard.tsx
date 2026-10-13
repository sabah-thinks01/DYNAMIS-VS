import React from "react";
import type { SchemeResult } from "@/lib/eligibility/types";
import { missingLabel, rateLabel } from "@/lib/eligibility/resultsView";
import { formatLakh } from "@/lib/format";

interface SchemeResultCardProps {
  scheme: SchemeResult;
  variant: "eligible" | "needsInfo";
  onChangeAnswers?: () => void;
}

export function SchemeResultCard({
  scheme,
  variant,
  onChangeAnswers,
}: SchemeResultCardProps) {
  if (variant === "eligible") {
    const interest = rateLabel(scheme);
    return (
      <div className="app-card rounded-2xl p-6 border border-[var(--status-good-border)] bg-surface flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-bold text-main break-words">
              {scheme.schemeName}
            </h3>
            <span className="font-semibold px-2 py-0.5 rounded-full text-[11px] bg-[var(--status-good-bg)] text-[var(--status-good)] border border-[var(--status-good-border)] shrink-0">
              You may be able to apply
            </span>
          </div>

          <div className="space-y-2 text-xs pt-1">
            {interest && (
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                <span className="text-muted font-medium sm:w-36 shrink-0">Interest:</span>
                <span className="font-semibold text-main">{interest}</span>
              </div>
            )}
            {scheme.repayment?.text && (
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                <span className="text-muted font-medium sm:w-36 shrink-0">Repayment:</span>
                <span className="font-semibold text-main">{scheme.repayment.text}</span>
              </div>
            )}
            {scheme.split?.text && (
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                <span className="text-muted font-medium sm:w-36 shrink-0">Who pays:</span>
                <span className="font-semibold text-main">{scheme.split.text}</span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
              <span className="text-muted font-medium sm:w-36 shrink-0">Most you can borrow:</span>
              <span className="font-semibold text-main">Up to {formatLakh(scheme.maxLoan)}</span>
            </div>
          </div>

          {scheme.notes && scheme.notes.length > 0 && (
            <ul className="space-y-1 pt-2 border-t border-border-default/40">
              {scheme.notes.map((n, i) => (
                <li key={i} className="text-xs text-muted list-disc list-inside leading-relaxed">
                  {n.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="pt-4 mt-auto border-t border-border-default/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
          <a
            href={scheme.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center min-h-[44px] py-1 text-accent-strong hover:underline font-medium"
          >
            Source: NBCFDC website
          </a>
          <span>Rules checked on {scheme.lastVerified}</span>
        </div>
      </div>
    );
  }

  // needsInfo variant
  return (
    <div className="app-card rounded-2xl p-6 border border-[var(--status-warning-border)] bg-surface flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base sm:text-lg font-bold text-main break-words">
            {scheme.schemeName}
          </h3>
          <span className="font-semibold px-2 py-0.5 rounded-full text-[11px] bg-[var(--status-warning-bg)] text-[var(--status-warning)] border border-[var(--status-warning-border)] shrink-0">
            Tell us a little more
          </span>
        </div>

        <div className="space-y-1.5 pt-1">
          <p className="text-xs text-muted font-medium">To check this loan we still need:</p>
          <ul className="space-y-1">
            {scheme.missing.map((key) => (
              <li key={key} className="text-xs font-semibold text-main list-disc list-inside leading-relaxed">
                {missingLabel(key)}
              </li>
            ))}
          </ul>
        </div>

        {scheme.notes && scheme.notes.length > 0 && (
          <ul className="space-y-1 pt-2 border-t border-border-default/40">
            {scheme.notes.map((n, i) => (
              <li key={i} className="text-xs text-muted list-disc list-inside leading-relaxed">
                {n.text}
              </li>
            ))}
          </ul>
        )}

        {onChangeAnswers && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onChangeAnswers}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold rounded-lg border border-border-default bg-surface hover:bg-surface-subtle text-main transition-colors"
            >
              Change my answers
            </button>
          </div>
        )}
      </div>

      <div className="pt-4 mt-auto border-t border-border-default/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
        <a
          href={scheme.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center min-h-[44px] py-1 text-accent-strong hover:underline font-medium"
        >
          Source: NBCFDC website
        </a>
        <span>Rules checked on {scheme.lastVerified}</span>
      </div>
    </div>
  );
}
