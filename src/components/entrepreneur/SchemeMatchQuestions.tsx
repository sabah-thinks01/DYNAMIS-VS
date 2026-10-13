"use client";

import React, { useState } from "react";
import type { UserProfile } from "@/lib/profile/types";
import type {
  Gender,
  BackwardClassAnswer,
  IncomeBand,
  YesNo,
  ApplyMode,
} from "@/lib/eligibility/types";
import { saveEligibility } from "@/lib/profile/profileStore";

interface SchemeMatchQuestionsProps {
  profile: UserProfile | null;
  onSaved?: () => void;
  onCancel?: () => void;
}

export function SchemeMatchQuestions({
  profile,
  onSaved,
  onCancel,
}: SchemeMatchQuestionsProps) {
  const [applicantGender, setApplicantGender] = useState<Gender | undefined>(
    profile?.eligibility?.applicantGender?.value
  );
  const [backwardClass, setBackwardClass] = useState<BackwardClassAnswer | undefined>(
    profile?.eligibility?.backwardClass?.value
  );
  const [incomeBand, setIncomeBand] = useState<IncomeBand | undefined>(
    profile?.eligibility?.incomeBand?.value
  );
  const [disability40, setDisability40] = useState<YesNo | undefined>(
    profile?.eligibility?.disability40?.value
  );
  const [applyMode, setApplyMode] = useState<ApplyMode | undefined>(
    profile?.eligibility?.applyMode?.value
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasPrevious = Boolean(
    profile?.eligibility?.applicantGender ||
      profile?.eligibility?.backwardClass ||
      profile?.eligibility?.incomeBand ||
      profile?.eligibility?.disability40 ||
      profile?.eligibility?.applyMode
  );

  const isComplete =
    applicantGender !== undefined &&
    backwardClass !== undefined &&
    incomeBand !== undefined &&
    disability40 !== undefined &&
    applyMode !== undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;

    setErrorMessage(null);
    const updated = saveEligibility(
      {
        applicantGender,
        backwardClass,
        incomeBand,
        disability40,
        applyMode,
      },
      "entrepreneur"
    );

    if (!updated) {
      setErrorMessage("Could not save. Please log in again.");
      return;
    }

    onSaved?.();
  };

  return (
    <form onSubmit={handleSubmit} className="app-card rounded-2xl p-6 sm:p-8 space-y-8 bg-surface border border-border-default">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-main">
          A few questions about the person taking the loan
        </h2>
        <p className="text-sm text-muted mt-1">
          You can change these answers later.
        </p>
      </div>

      {/* Q1 */}
      <fieldset className="space-y-3">
        <div>
          <legend className="text-base font-bold text-main">
            Who will the loan be in the name of?
          </legend>
          <p className="text-xs text-muted mt-0.5">
            Some loans are only for women.
          </p>
        </div>
        <div role="radiogroup" aria-label="Who will the loan be in the name of?" className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { id: "woman" as Gender, label: "A woman" },
            { id: "man" as Gender, label: "A man" },
            { id: "preferNotToSay" as Gender, label: "Prefer not to say" },
          ].map((opt) => {
            const isChecked = applicantGender === opt.id;
            return (
              <label
                key={opt.id}
                className={`
                  flex items-center justify-between p-4 min-h-[48px] rounded-xl border-2 cursor-pointer transition-all
                  ${
                    isChecked
                      ? "border-accent-strong bg-accent-subtle shadow-sm"
                      : "border-border-default bg-surface hover:bg-surface-subtle"
                  }
                `}
              >
                <span className="text-sm font-medium text-main">{opt.label}</span>
                <input
                  type="radio"
                  name="applicantGender"
                  value={opt.id}
                  checked={isChecked}
                  onChange={() => setApplicantGender(opt.id)}
                  className="w-4 h-4 text-accent-strong border-border-strong focus:ring-accent-strong accent-accent-strong"
                />
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Q2 */}
      <fieldset className="space-y-3">
        <div>
          <legend className="text-base font-bold text-main">
            Is this person from a backward class?
          </legend>
          <p className="text-xs text-muted mt-0.5">
            These loans are for backward classes listed by the government.
          </p>
        </div>
        <div role="radiogroup" aria-label="Is this person from a backward class?" className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { id: "yes" as BackwardClassAnswer, label: "Yes" },
            { id: "no" as BackwardClassAnswer, label: "No" },
            { id: "notSure" as BackwardClassAnswer, label: "Not sure" },
          ].map((opt) => {
            const isChecked = backwardClass === opt.id;
            return (
              <label
                key={opt.id}
                className={`
                  flex items-center justify-between p-4 min-h-[48px] rounded-xl border-2 cursor-pointer transition-all
                  ${
                    isChecked
                      ? "border-accent-strong bg-accent-subtle shadow-sm"
                      : "border-border-default bg-surface hover:bg-surface-subtle"
                  }
                `}
              >
                <span className="text-sm font-medium text-main">{opt.label}</span>
                <input
                  type="radio"
                  name="backwardClass"
                  value={opt.id}
                  checked={isChecked}
                  onChange={() => setBackwardClass(opt.id)}
                  className="w-4 h-4 text-accent-strong border-border-strong focus:ring-accent-strong accent-accent-strong"
                />
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Q3 */}
      <fieldset className="space-y-3">
        <div>
          <legend className="text-base font-bold text-main">
            How much does the family earn in a year?
          </legend>
          <p className="text-xs text-muted mt-0.5">
            Add up what everyone in the family earns.
          </p>
        </div>
        <div role="radiogroup" aria-label="How much does the family earn in a year?" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            { id: "upTo3L" as IncomeBand, label: "Up to ₹3 lakh" },
            { id: "3to5L" as IncomeBand, label: "₹3 – 5 lakh" },
            { id: "above5L" as IncomeBand, label: "More than ₹5 lakh" },
            { id: "notSure" as IncomeBand, label: "Not sure" },
          ].map((opt) => {
            const isChecked = incomeBand === opt.id;
            return (
              <label
                key={opt.id}
                className={`
                  flex items-center justify-between p-4 min-h-[48px] rounded-xl border-2 cursor-pointer transition-all
                  ${
                    isChecked
                      ? "border-accent-strong bg-accent-subtle shadow-sm"
                      : "border-border-default bg-surface hover:bg-surface-subtle"
                  }
                `}
              >
                <span className="text-sm font-medium text-main">{opt.label}</span>
                <input
                  type="radio"
                  name="incomeBand"
                  value={opt.id}
                  checked={isChecked}
                  onChange={() => setIncomeBand(opt.id)}
                  className="w-4 h-4 text-accent-strong border-border-strong focus:ring-accent-strong accent-accent-strong"
                />
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Q4 */}
      <fieldset className="space-y-3">
        <div>
          <legend className="text-base font-bold text-main">
            Does this person have a disability of 40% or more?
          </legend>
          <p className="text-xs text-muted mt-0.5">
            This can lower the interest a little.
          </p>
        </div>
        <div role="radiogroup" aria-label="Does this person have a disability of 40% or more?" className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { id: "yes" as YesNo, label: "Yes" },
            { id: "no" as YesNo, label: "No" },
            { id: "preferNotToSay" as YesNo, label: "Prefer not to say" },
          ].map((opt) => {
            const isChecked = disability40 === opt.id;
            return (
              <label
                key={opt.id}
                className={`
                  flex items-center justify-between p-4 min-h-[48px] rounded-xl border-2 cursor-pointer transition-all
                  ${
                    isChecked
                      ? "border-accent-strong bg-accent-subtle shadow-sm"
                      : "border-border-default bg-surface hover:bg-surface-subtle"
                  }
                `}
              >
                <span className="text-sm font-medium text-main">{opt.label}</span>
                <input
                  type="radio"
                  name="disability40"
                  value={opt.id}
                  checked={isChecked}
                  onChange={() => setDisability40(opt.id)}
                  className="w-4 h-4 text-accent-strong border-border-strong focus:ring-accent-strong accent-accent-strong"
                />
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Q5 */}
      <fieldset className="space-y-3">
        <div>
          <legend className="text-base font-bold text-main">
            Will this person apply alone or with a self-help group?
          </legend>
          <p className="text-xs text-muted mt-0.5">
            A self-help group is a small group of people who save and borrow together.
          </p>
        </div>
        <div role="radiogroup" aria-label="Will this person apply alone or with a self-help group?" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            { id: "alone" as ApplyMode, label: "Alone" },
            { id: "shg" as ApplyMode, label: "With a self-help group" },
          ].map((opt) => {
            const isChecked = applyMode === opt.id;
            return (
              <label
                key={opt.id}
                className={`
                  flex items-center justify-between p-4 min-h-[48px] rounded-xl border-2 cursor-pointer transition-all
                  ${
                    isChecked
                      ? "border-accent-strong bg-accent-subtle shadow-sm"
                      : "border-border-default bg-surface hover:bg-surface-subtle"
                  }
                `}
              >
                <span className="text-sm font-medium text-main">{opt.label}</span>
                <input
                  type="radio"
                  name="applyMode"
                  value={opt.id}
                  checked={isChecked}
                  onChange={() => setApplyMode(opt.id)}
                  className="w-4 h-4 text-accent-strong border-border-strong focus:ring-accent-strong accent-accent-strong"
                />
              </label>
            );
          })}
        </div>
      </fieldset>

      {errorMessage && (
        <p className="text-sm text-[var(--status-warning)] font-medium">
          {errorMessage}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={!isComplete}
          className="btn-primary min-h-[48px] px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {hasPrevious ? "Save my answers" : "See my loans"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-4 py-2 text-sm font-medium text-muted hover:text-main"
          >
            Back to my loans
          </button>
        )}
      </div>
    </form>
  );
}
