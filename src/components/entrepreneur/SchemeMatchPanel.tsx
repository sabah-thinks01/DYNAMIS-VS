"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/profile/useProfile";
import { useActiveRole } from "@/lib/role/RoleContext";
import { SAMPLE_PINCODE } from "@/lib/profile/profileStore";
import { decideSchemeMatchView } from "@/lib/eligibility/viewMode";
import {
  buildEligibilityAnswers,
  unansweredQuestions,
  SAMPLE_ELIGIBILITY_ANSWERS,
} from "@/lib/eligibility/profileAnswers";
import { evaluateEligibility } from "@/lib/eligibility/evaluateEligibility";
import { groupSchemes } from "@/lib/eligibility/resultsView";
import type { Gender, LoanRangeKey } from "@/lib/eligibility/types";
import { GuideNote } from "@/components/shared/GuideNote";
import { SampleDataTag } from "@/components/shared/SampleDataTag";
import { SchemeMatchQuestions } from "./SchemeMatchQuestions";
import { SchemeResultCard } from "./SchemeResultCard";

function SchemeMatchSkeleton() {
  return (
    <div
      className="space-y-6 animate-pulse"
      aria-busy="true"
      aria-label="Loading loan schemes"
    >
      <div className="pb-6 border-b border-border-default">
        <div className="h-8 w-64 bg-surface-subtle rounded-lg" />
        <div className="h-4 w-96 bg-surface-subtle rounded-lg mt-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-56 bg-surface-subtle rounded-2xl border border-border-default" />
        <div className="h-56 bg-surface-subtle rounded-2xl border border-border-default" />
      </div>
    </div>
  );
}

const LOAN_RANGE_LABELS: Record<LoanRangeKey, string> = {
  under1L: "Less than ₹1 lakh",
  "1to5L": "₹1 – 5 lakh",
  "5to15L": "₹5 – 15 lakh",
  above15L: "More than ₹15 lakh",
  notSure: "Not sure yet",
};

export function SchemeMatchPanel() {
  const { profile, ready } = useProfile();
  const role = useActiveRole();

  const view = decideSchemeMatchView({
    profileReady: ready,
    role,
    profile,
    samplePincode: SAMPLE_PINCODE,
  });

  const [genderOverride, setGenderOverride] = useState<Gender | null>(null);
  const [editing, setEditing] = useState(false);

  const answers = useMemo(() => {
    if (view === "sample") {
      return {
        ...SAMPLE_ELIGIBILITY_ANSWERS,
        ...(genderOverride ? { gender: genderOverride } : {}),
      };
    }
    return buildEligibilityAnswers(
      profile,
      genderOverride ? { genderOverride } : undefined
    );
  }, [view, profile, genderOverride]);

  const result = useMemo(() => evaluateEligibility(answers), [answers]);
  const groups = useMemo(() => groupSchemes(result), [result]);

  if (view === "skeleton") {
    return <SchemeMatchSkeleton />;
  }

  const missingCount = unansweredQuestions(profile).length;
  if (view === "real" && (missingCount > 0 || editing)) {
    return (
      <div className="space-y-6">
        <SchemeMatchQuestions
          profile={profile}
          onSaved={() => setEditing(false)}
          onCancel={
            editing && missingCount === 0 ? () => setEditing(false) : undefined
          }
        />
        <GuideNote />
      </div>
    );
  }

  const effectiveGender =
    genderOverride !== null
      ? genderOverride
      : answers.gender === "woman" || answers.gender === "man"
      ? answers.gender
      : null;

  const count = groups.eligible.length;
  let headline = "";
  if (result.summary === "someEligible") {
    headline = `You may be able to get ${count}${count === 1 ? " loan" : " loans"}`;
  } else if (result.summary === "needMoreInfo") {
    headline = "We need a little more to tell you";
  } else {
    headline = "No loan matches these answers right now";
  }

  const userLoanRange = profile?.quickStart?.loanRange?.value;
  const loanRangeText = userLoanRange
    ? LOAN_RANGE_LABELS[userLoanRange as LoanRangeKey] || "Not chosen yet"
    : "Not chosen yet";

  const hasAnyGroup =
    groups.eligible.length > 0 ||
    groups.needsInfo.length > 0 ||
    groups.notEligible.length > 0;

  return (
    <div className="space-y-6">
      {view === "sample" && (
        <div className="app-card rounded-2xl p-4 sm:p-5 border border-border-default bg-surface flex flex-col sm:flex-row sm:items-center gap-3">
          <SampleDataTag variant="sample" />
          <p className="text-xs sm:text-sm text-muted">
            This is a sample result for a sample business. Real business owners see their own answers here.
          </p>
        </div>
      )}

      {/* Checking for row */}
      <div className="app-card rounded-2xl p-4 sm:p-6 border border-border-default bg-surface space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs sm:text-sm font-bold text-main">Checking for:</span>
          <div role="radiogroup" aria-label="Checking for" className="flex items-center gap-2">
            {[
              { id: "woman" as Gender, label: "A woman" },
              { id: "man" as Gender, label: "A man" },
            ].map((g) => {
              const isSelected = effectiveGender === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGenderOverride(g.id)}
                  className={`
                    min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border-2 transition-all
                    ${
                      isSelected
                        ? "border-accent-strong bg-accent-subtle text-accent-strong"
                        : "border-border-default bg-surface hover:bg-surface-subtle text-main"
                    }
                  `}
                >
                  {g.label}
                </button>
              );
            })}
          </div>

          {genderOverride !== null && (
            <button
              type="button"
              onClick={() => setGenderOverride(null)}
              className="min-h-[44px] px-2 text-xs font-semibold text-accent-strong hover:underline"
            >
              Use my saved answer
            </button>
          )}
        </div>

        <div className="space-y-1 text-xs text-muted">
          <p>This only changes what you see here. Your saved answers stay the same.</p>
          {view === "real" && (
            <p>
              The other answers (backward class, family income, disability, how you apply) are the ones you saved. Use “Change my answers” to update them.
            </p>
          )}
        </div>
      </div>

      {/* Summary Headline */}
      <div className="space-y-1">
        <h2 className="text-lg sm:text-xl font-bold text-main">{headline}</h2>
        <p className="text-xs text-muted">
          This is a guide. Your state loan office makes the final decision.
        </p>
      </div>

      {/* Real view amount row & change answers button */}
      {view === "real" && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-border-default bg-surface-subtle/50 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-muted">Amount you need:</span>
            <span className="font-semibold text-main">{loanRangeText}</span>
            <Link
              href="/start"
              className="inline-flex items-center min-h-[44px] px-2 text-accent-strong hover:underline font-semibold"
            >
              Change
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center min-h-[44px] px-4 py-2 text-xs font-semibold rounded-lg border border-border-default bg-surface hover:bg-surface-subtle text-main transition-colors"
          >
            Change my answers
          </button>
        </div>
      )}

      {/* Cards & Groups */}
      {hasAnyGroup && (
        <div className="space-y-6">
          {groups.eligible.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groups.eligible.map((s) => (
                <SchemeResultCard key={s.schemeId} scheme={s} variant="eligible" />
              ))}
            </div>
          )}

          {groups.needsInfo.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groups.needsInfo.map((s) => (
                <SchemeResultCard
                  key={s.schemeId}
                  scheme={s}
                  variant="needsInfo"
                  onChangeAnswers={view === "real" ? () => setEditing(true) : undefined}
                />
              ))}
            </div>
          )}

          {groups.notEligible.length > 0 && (
            <details className="app-card rounded-2xl p-4 sm:p-6 border border-border-default bg-surface">
              <summary className="min-h-[44px] flex items-center font-bold text-main cursor-pointer hover:text-accent-strong select-none">
                Loans that don&apos;t fit right now ({groups.notEligible.length})
              </summary>
              <div className="pt-4 space-y-4 border-t border-border-default/40 mt-3">
                {groups.notEligible.map((s) => (
                  <div key={s.schemeId} className="space-y-1">
                    <h4 className="text-sm font-bold text-main">{s.schemeName}</h4>
                    <ul className="space-y-0.5">
                      {s.reasons.map((r, i) => (
                        <li key={i} className="text-xs text-muted list-disc list-inside leading-relaxed">
                          {r.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      <GuideNote />
    </div>
  );
}
