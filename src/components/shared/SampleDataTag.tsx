import React from "react";

export interface SampleDataTagProps {
  variant?: "sample" | "illustrative" | "criteria";
  className?: string;
}

const CONFIG = {
  sample: {
    label: "Sample data",
    explanation: "This value is for demonstration and is not real data",
  },
  illustrative: {
    label: "Illustrative example",
    explanation: "This is an example story, not a real verified case",
  },
  criteria: {
    label: "Sample criteria",
    explanation: "Scheme rules shown here are placeholders, not official criteria",
  },
};

export function SampleDataTag({ variant = "sample", className = "" }: SampleDataTagProps) {
  const item = CONFIG[variant] || CONFIG.sample;

  return (
    <span
      className={`inline-flex items-center text-[11px] font-medium leading-none px-2 py-0.5 rounded-full bg-surface-subtle text-muted border border-border-default tracking-normal select-none shrink-0 align-middle ${className}`}
    >
      <span>{item.label}</span>
      <span className="sr-only"> — {item.explanation}</span>
    </span>
  );
}
