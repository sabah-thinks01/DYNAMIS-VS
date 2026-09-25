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
  }, [formData]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-6 border-b border-border-default">
        <h1 className="page-title">
          Financial Scheme &amp; EMI Calculator
        </h1>
        <p className="page-subtitle">
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
