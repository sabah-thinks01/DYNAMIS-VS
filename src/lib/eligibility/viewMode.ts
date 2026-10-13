import type { UserProfile } from "@/lib/profile/types";

export type SchemeMatchView = "skeleton" | "sample" | "real";

export interface SchemeMatchViewInput {
  profileReady: boolean;
  role: string;
  profile: UserProfile | null | undefined;
  samplePincode: string;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function decideSchemeMatchView(input: SchemeMatchViewInput): SchemeMatchView {
  if (!isPlainObject(input)) {
    return "skeleton";
  }

  if (input.profileReady !== true) {
    return "skeleton";
  }

  if (input.role !== "entrepreneur") {
    return "sample";
  }

  if (
    !isPlainObject(input.profile) ||
    !isPlainObject(input.profile.quickStart) ||
    Object.keys(input.profile.quickStart).length === 0
  ) {
    return "sample";
  }

  const quickStart = input.profile.quickStart as Record<string, unknown>;
  if (isPlainObject(quickStart.pincode) && quickStart.pincode.value === input.samplePincode) {
    return "sample";
  }

  return "real";
}
