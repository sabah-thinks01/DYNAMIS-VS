"use client";

import React, { createContext, useContext } from "react";
import type { Role } from "@/components/shared/AppShell";

export const RoleContext = createContext<Role>("entrepreneur");

export function useActiveRole(): Role {
  return useContext(RoleContext);
}
