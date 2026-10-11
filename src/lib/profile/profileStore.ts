import { getSession } from "@/lib/session";
import type { UserProfile, QuickStartData, EnteredBy, BusinessType, BusinessStage, LoanRange } from "./types";

export const SAMPLE_PINCODE = "413102";

const PROFILE_KEY_PREFIX = "dynamis-profile:";

// In-memory fallback if localStorage is disabled or throws
const memoryProfiles = new Map<string, UserProfile>();

type ProfileListener = (profile: UserProfile | null) => void;
const listeners = new Set<ProfileListener>();

function getStorageKey(mobile?: string): string | null {
  const m = mobile || getSession()?.mobile;
  if (!m) return null;
  return `${PROFILE_KEY_PREFIX}${m}`;
}

export function getProfile(explicitMobile?: string): UserProfile | null {
  const key = getStorageKey(explicitMobile);
  if (!key) return null;

  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return memoryProfiles.get(key) || null;
    }
    const parsed = JSON.parse(raw) as UserProfile;
    return parsed;
  } catch {
    return memoryProfiles.get(key) || null;
  }
}

export function saveQuickStart(
  data: {
    pincode: string;
    businessType: BusinessType;
    businessTypeOther?: string;
    stage: BusinessStage;
    loanRange: LoanRange;
  },
  enteredBy: EnteredBy,
  explicitMobile?: string
): UserProfile | null {
  const key = getStorageKey(explicitMobile);
  if (!key) return null;

  const now = new Date().toISOString();

  const current = getProfile(explicitMobile) || { version: 1 };

  const quickStart: QuickStartData = {
    pincode: {
      value: data.pincode,
      enteredBy,
      updatedAt: now,
    },
    businessType: {
      value: data.businessType,
      enteredBy,
      updatedAt: now,
    },
    stage: {
      value: data.stage,
      enteredBy,
      updatedAt: now,
    },
    loanRange: {
      value: data.loanRange,
      enteredBy,
      updatedAt: now,
    },
    completedAt: now,
  };

  if (data.businessType === "other" && data.businessTypeOther) {
    quickStart.businessTypeOther = {
      value: data.businessTypeOther,
      enteredBy,
      updatedAt: now,
    };
  }

  const updatedProfile: UserProfile = {
    ...current,
    version: 1,
    quickStart,
  };

  // Persist to memory
  memoryProfiles.set(key, updatedProfile);

  // Persist to localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(updatedProfile));
    } catch (e) {
      console.warn("Could not save profile to localStorage:", e);
    }
  }

  // Notify listeners synchronously before returning
  notifyListeners(updatedProfile);

  return updatedProfile;
}

export function clearProfile(explicitMobile?: string): void {
  const key = getStorageKey(explicitMobile);
  if (!key) return;

  memoryProfiles.delete(key);

  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Could not clear profile from localStorage:", e);
    }
  }

  notifyListeners(null);
}

function notifyListeners(profile: UserProfile | null): void {
  listeners.forEach((listener) => {
    try {
      listener(profile);
    } catch (e) {
      console.error("Error in profileStore listener:", e);
    }
  });
}

export function subscribe(listener: ProfileListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
