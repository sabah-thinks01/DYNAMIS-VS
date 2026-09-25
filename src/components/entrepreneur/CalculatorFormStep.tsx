"use client";

import React from "react";
import type { ApplicantInput } from "@/lib/schemeEngine";

export interface CalculatorFormData extends ApplicantInput {
  businessType: string;
}

interface CalculatorFormStepProps {
  step: number;
  formData: CalculatorFormData;
  onChange: (updated: Partial<CalculatorFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const CATEGORY_OPTIONS: { value: ApplicantInput["category"]; label: string }[] = [
  { value: "OBC",      label: "OBC — Other Backward Class" },
  { value: "SC",       label: "SC — Scheduled Caste" },
  { value: "ST",       label: "ST — Scheduled Tribe" },
  { value: "Minority", label: "Minority Community" },
  { value: "General",  label: "General / EBC" },
];

export function CalculatorFormStep({
  step, formData, onChange, onNext, onPrev,
}: CalculatorFormStepProps) {
  // Focus ring uses accent variable so it shifts with role theme
  const inputClassName =
    "w-full min-h-[44px] px-4 py-2.5 bg-surface border border-border-default/80 rounded-xl text-sm text-main " +
    "placeholder-muted focus:ring-2 focus:ring-[var(--accent)]/50 " +
    "focus:border-accent-strong focus:outline-none transition-colors";
  const labelClassName = "block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5";

  return (
    <div className="app-card rounded-2xl p-6 shadow-lg border-border-default">
      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-5">
          <h3 className="text-base font-bold text-main border-b border-border-default/60 pb-2">
            Step 1: Select Business Activity &amp; Social Category
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClassName}>Proposed Business Type</label>
              <select value={formData.businessType} onChange={(e) => onChange({ businessType: e.target.value })} className={inputClassName}>
                <option value="Bio-Fertilizer Unit">Bio-Fertilizer Unit</option>
                <option value="Solar Cold Storage">Solar Cold Storage</option>
                <option value="Dairy & Milking Machine">Dairy &amp; Milking Machine</option>
                <option value="Agro Tool Rental Hub">Agro Tool Rental Hub</option>
                <option value="Food & Grain Processing">Food &amp; Grain Processing</option>
              </select>
            </div>
            <div>
              <label className={labelClassName}>Social Category (NBCFDC Eligible)</label>
              <select
                value={formData.category}
                onChange={(e) => onChange({ category: e.target.value as ApplicantInput["category"] })}
                className={inputClassName}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-5">
          <h3 className="text-base font-bold text-main border-b border-border-default/60 pb-2">
            Step 2: Capital Requirement &amp; Household Income
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClassName}>Total Estimated Project Cost (₹)</label>
              <input
                type="number" min={1}
                value={formData.projectCost || ""}
                onChange={(e) => onChange({ projectCost: Number(e.target.value) })}
                className={inputClassName} placeholder="e.g. 350000"
              />
              <span className="text-[10px] text-muted mt-1.5 block">
                NBCFDC ceiling: ₹50,00,000 for Term Loan / ₹1,40,000 for Micro Finance
              </span>
            </div>
            <div>
              <label className={labelClassName}>Annual Household Income (₹)</label>
              <input
                type="number" min={0}
                value={formData.annualFamilyIncome === 0 ? "" : formData.annualFamilyIncome}
                onChange={(e) => onChange({ annualFamilyIncome: Number(e.target.value) })}
                className={inputClassName} placeholder="e.g. 180000"
              />
              <span className="text-[10px] text-muted mt-1.5 block">
                Income ceiling applies — see scheme guidelines for current limit
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-5">
          <h3 className="text-base font-bold text-main border-b border-border-default/60 pb-2">
            Step 3: State Channelizing Agency (SCA) Jurisdiction
          </h3>
          <div>
            <label className={labelClassName}>State of Operation</label>
            <select value={formData.state} onChange={(e) => onChange({ state: e.target.value })} className={inputClassName}>
              <option value="Maharashtra">Maharashtra (MPBCDC)</option>
              <option value="Karnataka">Karnataka (KMDC)</option>
              <option value="Tamil Nadu">Tamil Nadu (TNBCDCC)</option>
              <option value="Uttar Pradesh">Uttar Pradesh (UPSBCFDC)</option>
              <option value="Gujarat">Gujarat (GBCDC)</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div className="space-y-5">
          <h3 className="text-base font-bold text-main border-b border-border-default/60 pb-2">
            Step 4: Review Inputs — Scheme Result Calculated Automatically
          </h3>
          <div className="bg-surface p-5 rounded-xl border border-border-default space-y-3 text-sm">
            <div className="flex justify-between border-b border-border-default pb-2">
              <span className="text-muted">Business Activity:</span>
              <span className="font-semibold text-main">{formData.businessType}</span>
            </div>
            <div className="flex justify-between border-b border-border-default pb-2">
              <span className="text-muted">Category:</span>
              <span className="font-semibold text-main">{formData.category}</span>
            </div>
            <div className="flex justify-between border-b border-border-default pb-2">
              <span className="text-muted">Project Cost:</span>
              {/* text-accent-strong utility class — shifts with role */}
              <span className="font-semibold text-accent-strong">
                ₹{(formData.projectCost || 0).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between border-b border-border-default pb-2">
              <span className="text-muted">Annual Income:</span>
              <span className="font-semibold text-main">
                ₹{(formData.annualFamilyIncome || 0).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-muted">State SCA:</span>
              <span className="font-semibold text-main">{formData.state}</span>
            </div>
          </div>
          <p className="text-xs font-medium flex items-center space-x-2 text-accent-strong">
            <span className="accent-dot w-1.5 h-1.5 rounded-full animate-pulse" />
            <span>The scheme result panel on the right updates in real time.</span>
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-5 border-t border-border-default/60">
        <button
          type="button" onClick={onPrev} disabled={step === 1}
          className={`min-h-[44px] px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
            step === 1
              ? "bg-surface-subtle/30 text-muted/50 cursor-not-allowed border border-transparent"
              : "bg-surface-subtle text-main hover:bg-surface-hover hover:text-main border border-border-default shadow-sm"
          }`}
        >
          ← Previous Step
        </button>

        {step < 4 ? (
          /* Primary CTA uses accent gradient */
          <button
            type="button" onClick={onNext}
            className="min-h-[44px] px-6 py-2.5 hover:opacity-90 transition-opacity text-white text-xs font-bold rounded-xl shadow-md bg-accent-strong text-white"
          >
            Next Step →
          </button>
        ) : (
          <span
            className="min-h-[44px] px-4 py-2.5 text-xs font-bold rounded-xl flex items-center space-x-2 text-accent-strong bg-accent-subtle border border-accent-strong/40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Calculation complete</span>
          </span>
        )}
      </div>
    </div>
  );
}
