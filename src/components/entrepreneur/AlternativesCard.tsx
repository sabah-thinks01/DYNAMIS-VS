"use client";

import React from "react";
import { SampleDataTag } from "@/components/shared/SampleDataTag";
import { GuideNote } from "@/components/shared/GuideNote";
import { formatApprox } from "@/lib/format";
import type { BusinessType } from "@/lib/profile/types";
import { useAlternatives } from "@/lib/score/useAlternatives";

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

export interface AlternativesCardProps {
  mode?:
    | "sample"
    | "loading"
    | "notCovered"
    | "notOnMap"
    | "mapMoved"
    | "otherBusiness"
    | "noLiveData"
    | "verdict";
  businessType?: BusinessType;
  centerLat?: number;
  centerLng?: number;
  radiusKm?: number;
  peopleInReach?: number;
}

export function AlternativesCard({
  mode = "sample",
  businessType,
  centerLat,
  centerLng,
  radiusKm = 10,
  peopleInReach,
}: AlternativesCardProps) {
  const isSample = mode === "sample";

  const enabled =
    !isSample &&
    mode !== "notCovered" &&
    mode !== "mapMoved" &&
    mode !== "notOnMap" &&
    mode !== "noLiveData" &&
    typeof centerLat === "number" &&
    typeof centerLng === "number" &&
    typeof radiusKm === "number" &&
    typeof peopleInReach === "number" &&
    peopleInReach > 0 &&
    !isNaN(centerLat) &&
    !isNaN(centerLng) &&
    !isNaN(radiusKm) &&
    !isNaN(peopleInReach);

  const { status, result, candidateLabels } = useAlternatives({
    currentBusinessType: businessType,
    centerLat,
    centerLng,
    radiusKm,
    peopleInReach,
    enabled,
  });

  // 1. Sample view (Officers, role-switch, sample business)
  if (isSample) {
    return (
      <div className="space-y-4">
        <div className="app-card rounded-2xl p-6 flex flex-col justify-between gap-5 border border-border-default shadow-card">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-main">
              {SAMPLE_ALTERNATIVES.title}
            </h2>
            <SampleDataTag variant="sample" />
          </div>

          <ol className="space-y-3 pt-1">
            {SAMPLE_ALTERNATIVES.topPicks.map((pick, index) => {
              const badgeClass =
                pick.verdictType === "good"
                  ? "bg-[var(--status-good-bg)] text-[var(--status-good)] border-[var(--status-good-border)]"
                  : "bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning-border)]";

              return (
                <li
                  key={pick.business}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-surface-subtle/50 border border-border-default/60 min-h-[44px]"
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

          <div className="border-t border-border-default/60 pt-3">
            <p className="text-base text-muted leading-relaxed">
              {SAMPLE_ALTERNATIVES.footerLine}
            </p>
          </div>
        </div>

        <GuideNote />
      </div>
    );
  }

  // 2. Real user: Not covered state
  if (mode === "notCovered") {
    return (
      <div className="space-y-4">
        <div className="app-card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border border-border-default shadow-card">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-main">Other businesses with room here</h2>
            <p className="text-xs text-muted mt-3 max-w-xl leading-relaxed">
              Your state isn&apos;t covered yet in this prototype.
            </p>
          </div>
          <div className="flex flex-col text-left sm:text-right border border-border-default bg-surface-subtle/50 rounded-2xl px-5 py-3.5 shrink-0 self-start sm:self-auto min-w-[200px]">
            <span className="text-sm font-semibold text-main">Not checked for your area yet</span>
            <span className="text-[11px] text-muted mt-0.5">Other businesses · Market saturation</span>
          </div>
        </div>
        <GuideNote />
      </div>
    );
  }

  // 3. Real user: Map moved state
  if (mode === "mapMoved") {
    return (
      <div className="space-y-4">
        <div className="app-card rounded-2xl p-6 flex flex-col justify-between gap-5 border border-border-default shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-main">Other businesses with room here</h2>
              <p className="text-xs text-muted mt-3 max-w-xl leading-relaxed">
                The map has moved away from your pincode area. Clear your search or use &apos;My answers&apos; to see your area&apos;s result.
              </p>
            </div>
            <div className="flex flex-col text-left sm:text-right border border-border-default bg-surface-subtle/50 rounded-2xl px-5 py-3.5 shrink-0 self-start sm:self-auto min-w-[200px]">
              <span className="text-sm font-semibold text-main">Map moved</span>
              <span className="text-[11px] text-muted mt-0.5">Other businesses · Market saturation</span>
            </div>
          </div>
        </div>
        <GuideNote />
      </div>
    );
  }

  // 4. Real user: Not on map state
  if (mode === "notOnMap") {
    return (
      <div className="space-y-4">
        <div className="app-card rounded-2xl p-6 flex flex-col justify-between gap-5 border border-border-default shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-main">Other businesses with room here</h2>
              <p className="text-xs text-muted mt-3 max-w-xl leading-relaxed">
                Couldn&apos;t place your pincode on the map, so we can&apos;t count sellers nearby. Search for your village on the map to try.
              </p>
            </div>
            <div className="flex flex-col text-left sm:text-right border border-border-default bg-surface-subtle/50 rounded-2xl px-5 py-3.5 shrink-0 self-start sm:self-auto min-w-[200px]">
              <span className="text-sm font-semibold text-main">Couldn&apos;t place your pincode</span>
              <span className="text-[11px] text-muted mt-0.5">Other businesses · Market saturation</span>
            </div>
          </div>
        </div>
        <GuideNote />
      </div>
    );
  }

  // 5. Loading skeleton
  if (mode === "loading" || status === "loading") {
    return (
      <div className="space-y-4">
        <div className="app-card rounded-2xl p-6 flex flex-col justify-between gap-5 border border-border-default shadow-card">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-main">Other businesses with room here</h2>
            <span className="text-xs text-muted">Checking other businesses nearby…</span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="h-12 rounded-xl bg-surface-subtle/70 border border-border-default/40 animate-pulse" />
            <div className="h-12 rounded-xl bg-surface-subtle/70 border border-border-default/40 animate-pulse" />
            <div className="h-12 rounded-xl bg-surface-subtle/70 border border-border-default/40 animate-pulse" />
          </div>
        </div>
        <GuideNote />
      </div>
    );
  }

  // 6. Live data result
  const hasRanked = result.ranked.length > 0;
  const hasNotSeen = result.notSeen.length > 0;
  const hasUnchecked = result.unchecked.length > 0;
  const isEmpty = !hasRanked && !hasNotSeen;
  const formattedRadius =
    typeof radiusKm === "number"
      ? Number.isInteger(radiusKm)
        ? `${radiusKm}`
        : radiusKm.toFixed(1)
      : "";

  return (
    <div className="space-y-4">
      <div className="app-card rounded-2xl p-6 flex flex-col justify-between gap-5 border border-border-default shadow-card">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-bold text-main">Other businesses with room here</h2>
        </div>

        {isEmpty ? (
          <p className="text-sm text-muted leading-relaxed">
            Couldn&apos;t check other businesses right now.
          </p>
        ) : (
          <>
            {/* Ranked List */}
            {hasRanked && (
              <ol className="space-y-3 pt-1">
                {result.ranked.map((item, index) => {
                  let badgeClass = "bg-surface-subtle/50 text-main border-border-default";
                  let badgeLabel = "Some room — think it through";

                  if (item.verdict === "goodRoom") {
                    badgeClass = "bg-[var(--status-good-bg)] text-[var(--status-good)] border-[var(--status-good-border)]";
                    badgeLabel = "Good room for one more";
                  } else if (item.verdict === "someRoom") {
                    badgeClass = "bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning-border)]";
                    badgeLabel = "Some room — think it through";
                  } else if (item.verdict === "crowded") {
                    badgeClass = "bg-[var(--status-error-bg)] text-[var(--status-error)] border-[var(--status-error-border)]";
                    badgeLabel = "Crowded — many sellers already";
                  } else if (item.verdict === "manySellers" || item.capped) {
                    badgeClass = "bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning-border)]";
                    badgeLabel = "Many sellers already";
                  }

                  return (
                    <li
                      key={item.type}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-surface-subtle/50 border border-border-default/60 min-h-[44px]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-surface border border-border-default text-xs font-semibold text-main shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-sm sm:text-base text-main font-medium">
                          <span className="font-semibold">{item.label}</span>:{" "}
                          {item.capped ? (
                            <>
                              30+ sellers · at most {formatApprox(item.maxPeoplePerSeller || 0)} people per seller
                            </>
                          ) : (
                            <>
                              {formatApprox(item.peoplePerSeller || 0)} people per seller
                            </>
                          )}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center self-start sm:self-auto text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${badgeClass}`}
                      >
                        {badgeLabel}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}

            {/* Not seen on the map nearby */}
            {hasNotSeen && (
              <div className="border-t border-border-default/60 pt-4 space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
                  Not seen on the map nearby
                </h3>
                <div className="space-y-1.5">
                  {result.notSeen.map((ns) => (
                    <div key={ns.type} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted shrink-0" />
                      <p className="text-sm sm:text-base text-main font-semibold">{ns.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  No listings found nearby on the map. This can mean an untried business or one that isn&apos;t listed online, so check locally before you invest.
                </p>
              </div>
            )}

            {/* Unchecked quiet line */}
            {hasUnchecked && (
              <p className="text-xs text-muted italic pt-1">
                Couldn&apos;t check: {result.unchecked.map((u) => u.label).join(", ")}
              </p>
            )}
          </>
        )}

        {/* Candidate types checked note */}
        {candidateLabels.length > 0 && (
          <p className="text-xs text-muted leading-relaxed">
            We check these business types: {candidateLabels.join(", ")}.
          </p>
        )}

        {/* How we worked this out footer */}
        <div className="border-t border-border-default/60 pt-3">
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            Same rule as Market Room: Census 2011 population within {formattedRadius} km ÷ businesses listed on Mappls. Prototype thresholds, to be tuned with SCA data.
          </p>
        </div>
      </div>

      <GuideNote />
    </div>
  );
}
