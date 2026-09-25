import React from "react";

interface Props {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function CalculatorStepIndicator({ currentStep, onStepClick }: Props) {
  const steps = [
    { num: 1, label: "Business & Category" },
    { num: 2, label: "Cost & Income" },
    { num: 3, label: "Location" },
    { num: 4, label: "Calculation" },
  ];

  return (
    <div className="w-full flex items-start justify-between relative mb-4">
      {/* Background Line */}
      <div className="absolute left-0 right-0 top-[22px] h-[2px] bg-surface-subtle z-0" />
      
      {steps.map((step) => {
        const isCompleted = currentStep > step.num;
        const isCurrent   = currentStep === step.num;

        return (
          <div key={step.num} className="relative flex flex-col items-center z-10 flex-1 max-w-[90px]">
            <button
              onClick={() => { if (isCompleted) onStepClick(step.num); }}
              disabled={!isCompleted}
              className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2 mb-2"
              style={
                isCompleted
                  ? {
                      backgroundColor: "var(--accent-strong)",
                      borderColor:      "var(--accent-strong)",
                      color:            "var(--text-inverse)",
                      boxShadow:        "0 4px 12px -2px var(--accent-glow)",
                      cursor:           "pointer",
                    }
                  : isCurrent
                  ? {
                      backgroundColor: "var(--bg-surface)",
                      borderColor:     "var(--accent-strong)",
                      color:           "var(--accent-strong)",
                      boxShadow:       "0 0 15px var(--accent-glow)",
                      cursor:          "default",
                    }
                  : {
                      backgroundColor: "var(--bg-surface)",
                      borderColor:     "var(--border-default)",
                      color:           "var(--text-muted)",
                      cursor:          "default",
                    }
              }
            >
              {isCompleted ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.num
              )}
            </button>

            <span
              className="text-xs font-semibold text-center leading-tight transition-colors"
              style={{
                color: isCompleted
                  ? "var(--accent-strong)"
                  : isCurrent
                  ? "var(--text-main)"
                  : "var(--text-muted)",
              }}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
