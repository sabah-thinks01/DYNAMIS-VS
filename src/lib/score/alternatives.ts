import { MARKET_ROOM_THRESHOLDS, type MarketRoomVerdict } from "./marketRoom";

export interface AlternativeCountInput {
  type: string;
  label: string;
  count: number | null;
  capped: boolean;
  failed: boolean;
}

export interface RankedAlternativeItem {
  type: string;
  label: string;
  count: number;
  capped: boolean;
  verdict: MarketRoomVerdict;
  peoplePerSeller?: number;
  maxPeoplePerSeller?: number;
}

export interface NotSeenAlternativeItem {
  type: string;
  label: string;
}

export interface UncheckedAlternativeItem {
  type: string;
  label: string;
}

export interface RankedAlternativesResult {
  ranked: RankedAlternativeItem[];
  notSeen: NotSeenAlternativeItem[];
  unchecked: UncheckedAlternativeItem[];
}

export function rankAlternatives(params: {
  peopleInReach: number | null | undefined;
  counts: AlternativeCountInput[];
}): RankedAlternativesResult {
  const { peopleInReach, counts } = params;

  // If peopleInReach is 0, null, undefined, or NaN, everything goes to unchecked
  if (
    peopleInReach == null ||
    typeof peopleInReach !== "number" ||
    isNaN(peopleInReach) ||
    peopleInReach <= 0
  ) {
    return {
      ranked: [],
      notSeen: [],
      unchecked: counts.map((c) => ({ type: c.type, label: c.label })),
    };
  }

  const ranked: RankedAlternativeItem[] = [];
  const notSeen: NotSeenAlternativeItem[] = [];
  const unchecked: UncheckedAlternativeItem[] = [];

  for (const item of counts) {
    if (item.failed || item.count === null || item.count === undefined) {
      unchecked.push({ type: item.type, label: item.label });
    } else if (item.count === 0) {
      notSeen.push({ type: item.type, label: item.label });
    } else {
      // count > 0 and not failed
      const isCapped = item.capped === true || item.count >= 30;

      if (isCapped) {
        ranked.push({
          type: item.type,
          label: item.label,
          count: item.count,
          capped: true,
          verdict: "manySellers",
          maxPeoplePerSeller: peopleInReach / 30,
        });
      } else {
        const peoplePerSeller = peopleInReach / item.count;
        let verdict: MarketRoomVerdict;
        if (peoplePerSeller >= MARKET_ROOM_THRESHOLDS.goodRoom) {
          verdict = "goodRoom";
        } else if (peoplePerSeller >= MARKET_ROOM_THRESHOLDS.someRoom) {
          verdict = "someRoom";
        } else {
          verdict = "crowded";
        }

        ranked.push({
          type: item.type,
          label: item.label,
          count: item.count,
          capped: false,
          verdict,
          peoplePerSeller,
        });
      }
    }
  }

  // Sorting:
  // All uncapped types by peoplePerSeller descending (tie -> label A-Z),
  // THEN all capped types by maxPeoplePerSeller descending (tie -> label A-Z).
  ranked.sort((a, b) => {
    if (!a.capped && b.capped) return -1;
    if (a.capped && !b.capped) return 1;

    if (!a.capped && !b.capped) {
      if (b.peoplePerSeller! !== a.peoplePerSeller!) {
        return b.peoplePerSeller! - a.peoplePerSeller!;
      }
      return a.label.localeCompare(b.label);
    }

    // Both capped
    if (b.maxPeoplePerSeller! !== a.maxPeoplePerSeller!) {
      return b.maxPeoplePerSeller! - a.maxPeoplePerSeller!;
    }
    return a.label.localeCompare(b.label);
  });

  return {
    ranked,
    notSeen,
    unchecked,
  };
}
