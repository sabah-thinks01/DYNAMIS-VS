import type { MarketRoomVerdict } from "./marketRoom";

export interface CachedMarketRoom {
  pincode: string;
  businessType: string;
  verdict: MarketRoomVerdict;
  sellerCount: number;
  sellerCountIsCapped: boolean;
  peopleInReach: number;
  radiusKm: number;
  savedAt: string;
}

const CACHE_KEY_PREFIX = "dynamis-market-room:v1:";

export function saveMarketRoom(entry: CachedMarketRoom): void {
  if (typeof window === "undefined") return;
  try {
    const key = `${CACHE_KEY_PREFIX}${entry.pincode}:${entry.businessType}`;
    window.sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Ignore storage quota or security errors
  }
}

export function readMarketRoom(pincode: string, businessType: string): CachedMarketRoom | null {
  if (typeof window === "undefined" || !pincode || !businessType) return null;
  try {
    const key = `${CACHE_KEY_PREFIX}${pincode}:${businessType}`;
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as CachedMarketRoom;
  } catch {
    return null;
  }
}
