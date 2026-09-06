"use client";

import React, { useState, useMemo } from "react";
import { evaluateSchemeMatch } from "@/lib/schemeEngine";
import type { SchemeMatchResult } from "@/lib/schemeEngine";
import { CalculatorStepIndicator } from "@/components/entrepreneur/CalculatorStepIndicator";
import { CalculatorFormStep } from "@/components/entrepreneur/CalculatorFormStep";
import type { CalculatorFormData } from "@/components/entrepreneur/CalculatorFormStep";
import { SchemeMatchResultCard } from "@/components/entrepreneur/SchemeMatchResultCard";

function isFormComplete(data: CalculatorFormData): boolean {
  return (
    data.projectCost > 0 &&
    isFinite(data.projectCost) &&
    data.annualFamilyIncome >= 0 &&
    isFinite(data.annualFamilyIncome) &&
    data.state.trim() !== ""
  );
}

export default function FinancialCalculatorPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [formData, setFormData] = useState<CalculatorFormData>({
    businessType: "Bio-Fertilizer Unit",
    projectCost: 350_000,
    annualFamilyIncome: 180_000,
    category: "OBC",
    state: "Maharashtra",
  });

  const handleFormChange = (updated: Partial<CalculatorFormData>) => {
    setFormData((prev) => ({ ...prev, ...updated }));
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const schemeResult = useMemo<SchemeMatchResult | null>(() => {
    if (!isFormComplete(formData)) return null;

    return evaluateSchemeMatch({
      annualFamilyIncome: formData.annualFamilyIncome,
      category: formData.category,
      projectCost: formData.projectCost,
      state: formData.state,
    });
  }, [
    formData.annualFamilyIncome,
    formData.category,
    formData.projectCost,
    formData.state,
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-800/80 pb-4">
        <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-800/50">
          Module 2 — Live
        </span>
        <h1 className="text-2xl font-extrabold text-slate-100 mt-1">
          Financial Scheme &amp; EMI Calculator
        </h1>
        <p className="text-xs text-slate-400">
          Determine NBCFDC scheme fit, estimated margin money split, and projected loan repayment
          — all figures are indicative pending rate confirmation
        </p>
      </div>

      {/* Stepper Indicator */}
      <CalculatorStepIndicator
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs — Left Column */}
        <div className="lg:col-span-7">
          <CalculatorFormStep
            step={currentStep}
            formData={formData}
            onChange={handleFormChange}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        </div>

        {/* Live Scheme Result — Right Column */}
        <div className="lg:col-span-5">
          <SchemeMatchResultCard result={schemeResult} />
        </div>
      </div>
    </div>
  );
}
