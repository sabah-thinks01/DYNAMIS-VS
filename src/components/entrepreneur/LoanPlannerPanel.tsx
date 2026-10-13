"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
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
import type { SchemeResult } from "@/lib/eligibility/types";
import { formatLakhAmount } from "@/lib/eligibility/evaluateEligibility";
import { planLoan } from "@/lib/loanPlanner/planLoan";
import { SampleDataTag } from "@/components/shared/SampleDataTag";
import { LoanPlannerItems, type PurchaseItem } from "./LoanPlannerItems";
import { LoanPlannerResults } from "./LoanPlannerResults";

const SAMPLE_ITEMS: PurchaseItem[] = [
  { id: "s1", name: "Sewing machine", amount: "40000" },
  { id: "s2", name: "Cloth and thread", amount: "20000" },
  { id: "s3", name: "Table and lights", amount: "15000" },
];

export function LoanPlannerPanel() {
  const { profile, ready } = useProfile();
  const role = useActiveRole();

  const view = decideSchemeMatchView({
    profileReady: ready,
    role,
    profile,
    samplePincode: SAMPLE_PINCODE,
  });

  // Purchase items state (starts with sample in sample view, or one empty row in real view)
  const [items, setItems] = useState<PurchaseItem[]>(() =>
    view === "sample" ? SAMPLE_ITEMS : [{ id: "1", name: "", amount: "" }]
  );

  // Sync sample items when view flips to sample
  useEffect(() => {
    if (view === "sample") {
      setItems(SAMPLE_ITEMS);
    }
  }, [view]);

  // Selected scheme card ID
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);

  // Calculate live total cost from items
  const totalCost = useMemo(() => {
    return items.reduce((sum, item) => {
      const val = parseFloat(item.amount);
      return isFinite(val) && val > 0 ? sum + Math.round(val) : sum;
    }, 0);
  }, [items]);

  // Eligibility answers
  const answers = useMemo(() => {
    if (view === "sample") {
      return SAMPLE_ELIGIBILITY_ANSWERS;
    }
    return buildEligibilityAnswers(profile);
  }, [view, profile]);

  const missingCount = view === "real" ? unansweredQuestions(profile).length : 0;

  // Candidate schemes calculation according to Change 2:
  // 1. Evaluate with loanAmount = totalCost
  // 2. For any scheme notEligible AND totalCost > scheme.maxLoan: evaluate again with loanAmount = scheme.maxLoan
  //    If eligible then, still show its card!
  const candidateSchemes = useMemo(() => {
    if (view === "real" && missingCount > 0) {
      return [];
    }

    const resAtTotal = evaluateEligibility({
      ...answers,
      loanAmount: totalCost > 0 ? totalCost : undefined,
    });

    const list: SchemeResult[] = [];

    for (const s of resAtTotal.schemes) {
      if (s.status === "eligible") {
        list.push(s);
      } else if (s.status === "notEligible" && totalCost > s.maxLoan) {
        // Re-evaluate at cap
        const resAtCap = evaluateEligibility({
          ...answers,
          loanAmount: s.maxLoan,
        });
        const atCap = resAtCap.schemes.find((item) => item.schemeId === s.schemeId);
        if (atCap && atCap.status === "eligible") {
          list.push(s);
        }
      }
    }

    return list;
  }, [answers, totalCost, view, missingCount]);

  // Keep selectedSchemeId valid
  const effectiveSelectedId = useMemo(() => {
    if (candidateSchemes.length === 0) return null;
    if (selectedSchemeId && candidateSchemes.some((s) => s.schemeId === selectedSchemeId)) {
      return selectedSchemeId;
    }
    return candidateSchemes[0].schemeId;
  }, [candidateSchemes, selectedSchemeId]);

  const selectedScheme = useMemo(() => {
    return candidateSchemes.find((s) => s.schemeId === effectiveSelectedId) || null;
  }, [candidateSchemes, effectiveSelectedId]);

  // Calculate plan result
  const plan = useMemo(() => {
    if (!selectedScheme) return null;
    return planLoan({ scheme: selectedScheme, totalCost });
  }, [selectedScheme, totalCost]);

  // Item handlers
  function handleAddItem() {
    setItems((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, name: "", amount: "" },
    ]);
  }

  function handleRemoveItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleItemChange(id: string, field: "name" | "amount", value: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  if (view === "skeleton") {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading loan planner">
        <div className="h-8 w-64 bg-surface-subtle rounded-lg" />
        <div className="h-48 bg-surface-subtle rounded-2xl border border-border-default" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-border-default/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-main tracking-tight">
              Loan Planner
            </h1>
            {view === "sample" && <SampleDataTag variant="sample" />}
          </div>
          <p className="text-xs sm:text-sm text-muted mt-1">
            List what you need to buy. We&apos;ll show how the loan works.
          </p>
        </div>
      </div>

      {/* 1. What you need to buy */}
      <LoanPlannerItems
        items={items}
        totalCost={totalCost}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onItemChange={handleItemChange}
      />

      {/* 2. Choose your loan OR Fallback check */}
      {candidateSchemes.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border-default p-6 sm:p-8 text-center space-y-4">
          <p className="text-sm sm:text-base font-semibold text-main">
            Check Scheme Match first to see which loan fits you.
          </p>
          <div>
            <Link
              href="/module2/scheme-match"
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-strong transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              <span>Go to Scheme Match</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-main">Choose your loan</h2>
            <span className="text-xs text-muted">
              {candidateSchemes.length} {candidateSchemes.length === 1 ? "loan" : "loans"} available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {candidateSchemes.map((scheme) => {
              const isSelected = scheme.schemeId === effectiveSelectedId;
              return (
                <button
                  key={scheme.schemeId}
                  type="button"
                  onClick={() => setSelectedSchemeId(scheme.schemeId)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-150 min-h-[72px] flex items-center justify-between group focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                    isSelected
                      ? "border-accent bg-accent-subtle/25 shadow-sm"
                      : "border-border-default bg-surface hover:bg-surface-hover"
                  }`}
                >
                  <div className="space-y-0.5 pr-2">
                    <h3 className="font-bold text-sm text-main">{scheme.schemeName}</h3>
                    <p className="text-xs text-muted">
                      Up to {formatLakhAmount(scheme.maxLoan)}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "border-accent bg-accent text-white"
                        : "border-border-default group-hover:border-muted"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 3. Results Section */}
          {plan && <LoanPlannerResults plan={plan} />}
        </div>
      )}
    </div>
  );
}
