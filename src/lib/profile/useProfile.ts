"use client";

import { useState, useEffect } from "react";
import { getSession } from "@/lib/session";
import { getProfile, subscribe } from "./profileStore";
import type { UserProfile } from "./types";

export interface UseProfileResult {
  profile: UserProfile | null;
  ready: boolean;
}

export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Read on mount
    const initial = getProfile();
    setProfile(initial);
    setReady(true);

    // Subscribe to synchronous store changes
    const unsubscribe = subscribe((updated) => {
      setProfile(updated);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Also re-read if the active session mobile changes without a full page reload
  const session = getSession();
  const currentMobile = session?.mobile;

  useEffect(() => {
    if (ready) {
      setProfile(getProfile());
    }
  }, [currentMobile, ready]);

  return { profile, ready };
}
