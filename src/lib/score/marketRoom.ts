/**
 * DYNAMIS — Market Room Computation
 * Pure math & business logic, no React, no side effects.
 */

// Prototype thresholds, to be tuned with SCA data.
export const MARKET_ROOM_THRESHOLDS = {
  goodRoom: 5000,
  someRoom: 2000,
} as const;

export type MarketRoomVerdict =
  | "goodRoom"
  | "someRoom"
  | "crowded"
  | "noSellersFound"
  | "manySellers";

export interface MarketRoomInput {
  densityPerSqKm: number;
  radiusKm: number;
  sellerCount: number;
  sellerCountIsCapped: boolean;
}

export interface MarketRoomResult {
  peopleInReach: number; // density × π × r², rounded
  peoplePerSeller: number | null; // null when sellerCount === 0 or capped
  verdict: MarketRoomVerdict;
  sellerCountIsCapped: boolean;
}

export function computeMarketRoom(input: {
  densityPerSqKm: number;
  radiusKm: number;
  sellerCount: number;
  sellerCountIsCapped: boolean;
}): MarketRoomResult {
  const { densityPerSqKm, radiusKm, sellerCount, sellerCountIsCapped } = input;
  const reachAreaSqKm = Math.PI * radiusKm * radiusKm;
  const peopleInReach = Math.round(densityPerSqKm * reachAreaSqKm);

  if (sellerCountIsCapped) {
    return {
      peopleInReach,
      peoplePerSeller: null,
      verdict: "manySellers",
      sellerCountIsCapped: true,
    };
  }

  if (sellerCount === 0) {
    return {
      peopleInReach,
      peoplePerSeller: null,
      verdict: "noSellersFound",
      sellerCountIsCapped: false,
    };
  }

  const peoplePerSeller = Math.round(peopleInReach / sellerCount);

  let verdict: MarketRoomVerdict;
  if (peoplePerSeller >= MARKET_ROOM_THRESHOLDS.goodRoom) {
    verdict = "goodRoom";
  } else if (peoplePerSeller >= MARKET_ROOM_THRESHOLDS.someRoom) {
    verdict = "someRoom";
  } else {
    verdict = "crowded";
  }

  return {
    peopleInReach,
    peoplePerSeller,
    verdict,
    sellerCountIsCapped: false,
  };
}
