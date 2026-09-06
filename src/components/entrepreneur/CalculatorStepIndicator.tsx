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
    <div className="w-full flex items-center justify-between relative before:absolute before:inset-0 before:top-1/2 before:-translate-y-1/2 before:h-0.5 before:bg-slate-800 before:z-0">
      {steps.map((step) => {
        const isCompleted = currentStep > step.num;
        const isCurrent   = currentStep === step.num;

        return (
          <div key={step.num} className="relative flex flex-col items-center">
            <button
              onClick={() => { if (isCompleted) onStepClick(step.num); }}
              disabled={!isCompleted}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold relative z-10 transition-all border-2"
              style={
                isCompleted
                  ? {
                      backgroundColor: "var(--accent-from)",
                      borderColor:      "var(--accent-from)",
                      color:            "#fff",
                      boxShadow:        "0 4px 12px -2px var(--accent-glow)",
                      cursor:           "pointer",
                    }
                  : isCurrent
                  ? {
                      backgroundColor: "rgb(15 23 42)",   /* slate-900 */
                      borderColor:     "var(--accent-solid)",
                      color:           "var(--accent-solid)",
                      boxShadow:       "0 0 15px var(--accent-glow)",
                      cursor:          "default",
                    }
                  : {
                      backgroundColor: "rgb(15 23 42)",
                      borderColor:     "rgb(51 65 85)",    /* slate-700 */
                      color:           "rgb(100 116 139)", /* slate-500 */
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
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap transition-colors"
              style={{
                color: isCompleted
                  ? "var(--accent-solid)"
                  : isCurrent
                  ? "rgb(241 245 249)"  /* slate-100 */
                  : "rgb(100 116 139)", /* slate-500 */
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
