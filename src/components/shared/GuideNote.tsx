import React from "react";

export interface GuideNoteProps {
  className?: string;
}

export function GuideNote({ className = "" }: GuideNoteProps) {
  return (
    <div
      className={`app-card rounded-xl p-4 border border-border-default/80 bg-surface-subtle/60 flex items-start gap-3 text-xs text-muted leading-relaxed ${className}`}
    >
      <svg
        className="w-4 h-4 text-muted shrink-0 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div className="space-y-0.5">
        <p className="font-medium text-main">
          A guide, not a guarantee. This is not a loan approval.
        </p>
        <p>
          Do not pay anyone who promises to get your loan approved.
        </p>
      </div>
    </div>
  );
}
