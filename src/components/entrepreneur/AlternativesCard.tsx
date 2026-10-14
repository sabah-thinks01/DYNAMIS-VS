import React from "react";
import { SampleDataTag } from "@/components/shared/SampleDataTag";
import { GuideNote } from "@/components/shared/GuideNote";

export const SAMPLE_ALTERNATIVES = {
  title: "Other businesses with room here",
  topPicks: [
    {
      business: "Beauty parlour",
      ratio: "about 7,800 people per seller",
      verdict: "Good room",
      verdictType: "good",
    },
    {
      business: "Kirana store",
      ratio: "about 3,900 people per seller",
      verdict: "Some room",
      verdictType: "warning",
    },
    {
      business: "Dairy products",
      ratio: "about 2,600 people per seller",
      verdict: "Some room",
      verdictType: "warning",
    },
  ],
  notSeenHeading: "Not seen on the map nearby",
  notSeenItem: "Mobile repair",
  notSeenNote:
    "No listings found. This could be an opening, or shops that aren't online. Walk the area and ask before deciding.",
  footerLine:
    "Same rule as above: people nearby ÷ existing sellers. Prototype thresholds, to be tuned with SCA data.",
} as const;

export function AlternativesCard() {
  return (
    <div className="space-y-4">
      <div className="app-card rounded-2xl p-6 flex flex-col justify-between gap-5 border border-border-default shadow-card">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-bold text-main">
            {SAMPLE_ALTERNATIVES.title}
          </h2>
          <SampleDataTag variant="sample" />
        </div>

        {/* Top picks: Numbered list */}
        <ol className="space-y-3 pt-1">
          {SAMPLE_ALTERNATIVES.topPicks.map((pick, index) => {
            const badgeClass =
              pick.verdictType === "good"
                ? "bg-[var(--status-good-bg)] text-[var(--status-good)] border-[var(--status-good-border)]"
                : "bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning-border)]";

            return (
              <li
                key={pick.business}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-surface-subtle/50 border border-border-default/60"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-surface border border-border-default text-xs font-semibold text-main shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-base text-main font-medium">
                    <span className="font-semibold">{pick.business}</span>: {pick.ratio}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center self-start sm:self-auto text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${badgeClass}`}
                >
                  {pick.verdict}
                </span>
              </li>
            );
          })}
        </ol>

        {/* Sub-heading & Not seen on the map section */}
        <div className="border-t border-border-default/60 pt-4 space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
            {SAMPLE_ALTERNATIVES.notSeenHeading}
          </h3>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-muted shrink-0" />
            <p className="text-base text-main font-semibold">
              {SAMPLE_ALTERNATIVES.notSeenItem}
            </p>
          </div>
          <p className="text-base text-muted leading-relaxed">
            {SAMPLE_ALTERNATIVES.notSeenNote}
          </p>
        </div>

        {/* Footer line */}
        <div className="border-t border-border-default/60 pt-3">
          <p className="text-base text-muted leading-relaxed">
            {SAMPLE_ALTERNATIVES.footerLine}
          </p>
        </div>
      </div>

      {/* GuideNote component */}
      <GuideNote />
    </div>
  );
}
