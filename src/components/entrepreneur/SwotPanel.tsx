"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useUserLocation } from "@/lib/location/useUserLocation";
import { useDistrictGeo } from "@/lib/geo/useDistrictGeo";
import { useProfile } from "@/lib/profile/useProfile";
import { useActiveRole } from "@/lib/role/RoleContext";
import { readMarketRoom, type CachedMarketRoom } from "@/lib/score/marketRoomCache";
import { buildSwot, type SwotPoint } from "@/lib/score/swotRules";
import { GuideNote } from "@/components/shared/GuideNote";

function kindLabel(kind: SwotPoint["kind"]): string {
  switch (kind) {
    case "strength":
      return "Your strength";
    case "opportunity":
      return "Chance to grow";
    case "weakness":
      return "Your weak point";
    case "threat":
      return "Risk from outside";
  }
}

function sourceLabel(source: SwotPoint["source"]): string {
  switch (source) {
    case "Census 2011":
      return "from Census 2011";
    case "Opportunity Analysis":
      return "from Opportunity Analysis";
    case "Your answers":
      return "from your answers";
  }
}

function SwotSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading SWOT analysis">
      <div className="pb-6 border-b border-border-default">
        <div className="h-8 w-64 bg-surface-subtle rounded-lg" />
        <div className="h-4 w-96 bg-surface-subtle rounded-lg mt-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-56 bg-surface-subtle rounded-2xl border border-border-default" />
        <div className="h-56 bg-surface-subtle rounded-2xl border border-border-default" />
      </div>
    </div>
  );
}

export function SwotPanel() {
  const { pincode, businessType } = useUserLocation();
  const geoResult = useDistrictGeo(pincode);
  const { profile } = useProfile();
  const [marketRoom, setMarketRoom] = useState<CachedMarketRoom | null>(null);
  const [marketRoomChecked, setMarketRoomChecked] = useState(false);

  useEffect(() => {
    if (pincode && businessType) {
      setMarketRoom(readMarketRoom(pincode, businessType));
      setMarketRoomChecked(true);
    } else {
      setMarketRoom(null);
      setMarketRoomChecked(true);
    }
  }, [pincode, businessType]);

  const isGeoPending = geoResult.status === "loading" || geoResult.status === "idle";

  if (isGeoPending || !marketRoomChecked) {
    return <SwotSkeleton />;
  }

  const { helps, hurts } = buildSwot({
    geo: geoResult.geo,
    marketRoom,
    stage: profile?.quickStart?.stage?.value,
    loanRange: profile?.quickStart?.loanRange?.value,
    geoNotCovered: geoResult.status === "notCovered",
  });

  return (
    <div className="space-y-6">
      {/* Real View Header */}
      <div className="pb-6 border-b border-border-default">
        <h1 className="page-title">
          What helps you / What could hurt you
        </h1>
        <p className="text-xs text-muted mb-2">SWOT Analysis</p>
        <p className="page-subtitle">
          Built from your answers, Census 2011 and the sellers check — a guide, not a guarantee.
        </p>
      </div>

      {/* Two cards side by side on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Helps Card */}
        <div className="app-card rounded-2xl p-6 border border-[var(--status-good-border)] bg-[var(--bg-surface)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-good)] shadow-[0_0_8px_var(--status-good-glow)]" />
              <h2 className="text-base font-bold text-main">What helps you</h2>
            </div>

            {helps.length === 0 ? (
              <p className="text-xs text-muted leading-relaxed">
                Nothing clearly in your favour yet — check the points below.
              </p>
            ) : (
              <ul className="space-y-4">
                {helps.map((pt) => (
                  <li key={pt.id} className="space-y-1.5 border-b border-border-default/40 pb-3 last:border-b-0 last:pb-0">
                    <p className="text-sm font-semibold text-main leading-snug">{pt.text}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted">
                      <span className="font-semibold px-2 py-0.5 rounded-full bg-[var(--status-good-bg)] text-[var(--status-good)] border border-[var(--status-good-border)]">
                        {kindLabel(pt.kind)}
                      </span>
                      <span>{sourceLabel(pt.source)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Hurts Card */}
        <div className="app-card rounded-2xl p-6 border border-[var(--status-warning-border)] bg-[var(--bg-surface)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-warning)]" />
              <h2 className="text-base font-bold text-main">What could hurt you</h2>
            </div>

            {hurts.length === 0 ? (
              <p className="text-xs text-muted leading-relaxed">
                No clear risks found from what we know. Still visit the area before you invest.
              </p>
            ) : (
              <ul className="space-y-4">
                {hurts.map((pt) => (
                  <li key={pt.id} className="space-y-1.5 border-b border-border-default/40 pb-3 last:border-b-0 last:pb-0">
                    <p className="text-sm font-semibold text-main leading-snug">{pt.text}</p>
                    {pt.todo && (
                      <div className="text-xs text-muted pt-0.5">
                        <span className="font-semibold text-main">What to do: </span>
                        {pt.link ? (
                          <Link
                            href={pt.link}
                            className="inline-flex items-center min-h-[44px] py-1 text-accent-strong hover:underline font-medium"
                          >
                            {pt.todo}
                          </Link>
                        ) : (
                          <span>{pt.todo}</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[10px] text-muted pt-1">
                      <span className="font-semibold px-2 py-0.5 rounded-full bg-[var(--status-warning-bg)] text-[var(--status-warning)] border border-[var(--status-warning-border)]">
                        {kindLabel(pt.kind)}
                      </span>
                      <span>{sourceLabel(pt.source)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <GuideNote />
    </div>
  );
}

export function SwotSwitch({ sampleView }: { sampleView: React.ReactNode }) {
  const { ready, isSampleBusiness, status } = useUserLocation();
  const activeRole = useActiveRole();

  if (!ready) {
    return <SwotSkeleton />;
  }

  if (isSampleBusiness || status === "noProfile" || activeRole === "officer") {
    return <>{sampleView}</>;
  }

  return <SwotPanel />;
}
