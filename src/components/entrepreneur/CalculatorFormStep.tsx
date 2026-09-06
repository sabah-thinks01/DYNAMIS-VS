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
    "w-full px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-100 " +
    "placeholder-slate-500 focus:ring-2 focus:ring-[var(--accent-solid)]/50 " +
    "focus:border-[var(--accent-solid)] focus:outline-none transition-colors";
  const labelClassName = "block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5";

  return (
    <div className="glass-card rounded-2xl p-6 shadow-lg border-slate-700/50">
      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-5">
          <h3 className="text-base font-bold text-slate-100 border-b border-slate-700/60 pb-2">
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
          <h3 className="text-base font-bold text-slate-100 border-b border-slate-700/60 pb-2">
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
              <span className="text-[10px] text-slate-500 mt-1.5 block">
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
              <span className="text-[10px] text-slate-500 mt-1.5 block">
                Income ceiling applies — see scheme guidelines for current limit
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-5">
          <h3 className="text-base font-bold text-slate-100 border-b border-slate-700/60 pb-2">
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
          <h3 className="text-base font-bold text-slate-100 border-b border-slate-700/60 pb-2">
            Step 4: Review Inputs — Scheme Result Calculated Automatically
          </h3>
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50 space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Business Activity:</span>
              <span className="font-semibold text-slate-100">{formData.businessType}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Category:</span>
              <span className="font-semibold text-slate-100">{formData.category}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Project Cost:</span>
              {/* accent-text utility class — shifts with role */}
              <span className="font-semibold accent-text">
                ₹{(formData.projectCost || 0).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Annual Income:</span>
              <span className="font-semibold text-slate-100">
                ₹{(formData.annualFamilyIncome || 0).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-slate-400">State SCA:</span>
              <span className="font-semibold text-slate-100">{formData.state}</span>
            </div>
          </div>
          <p className="text-xs font-medium flex items-center space-x-2 accent-text">
            <span className="accent-dot w-1.5 h-1.5 rounded-full animate-pulse" />
            <span>The scheme result panel on the right updates in real time.</span>
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-700/60">
        <button
          type="button" onClick={onPrev} disabled={step === 1}
          className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
            step === 1
              ? "bg-slate-800/30 text-slate-600 cursor-not-allowed border border-transparent"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 shadow-sm"
          }`}
        >
          ← Previous Step
        </button>

        {step < 4 ? (
          /* Primary CTA uses accent gradient */
          <button
            type="button" onClick={onNext}
            className="px-6 py-2.5 hover:opacity-90 transition-opacity text-white text-xs font-bold rounded-xl shadow-md accent-gradient"
          >
            Next Step →
          </button>
        ) : (
          <span
            className="px-4 py-2.5 text-xs font-bold rounded-xl flex items-center space-x-2 accent-text"
            style={{ backgroundColor: "color-mix(in srgb, var(--accent-from) 15%, transparent)", borderWidth: "1px", borderStyle: "solid", borderColor: "var(--accent-border)" }}
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
