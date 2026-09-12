"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export type UserRole =
  | "SUPERVISOR"
  | "QHSE_ENGINEER"
  | "RESPONSABLE_HSE"
  | "SUPERVISEUR_HSE"
  | "DRH"
  | "RESPONSABLE_COMMERCIAL"
  | "INGENIEUR_QHSE";

export const ROLE_STORAGE_KEY = "eqhse-active-role";

type RoleContextValue = {
  role: UserRole;
  setRole: (role: UserRole) => void;
};

const RoleContext = createContext<RoleContextValue | null>(null);

const DEFAULT_ROLE: UserRole = "SUPERVISOR";

function resolveStoredRole(): UserRole {
  if (typeof window === "undefined") return DEFAULT_ROLE;
  try {
    const stored = window.localStorage.getItem(ROLE_STORAGE_KEY);
    if (!stored) return DEFAULT_ROLE;
    return stored as UserRole;
  } catch {
    return DEFAULT_ROLE;
  }
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(DEFAULT_ROLE);

  useEffect(() => {
    const stored = resolveStoredRole();
    setRoleState(stored);
  }, []);

  const setRole = useCallback((next: UserRole) => {
    setRoleState(next);
    try {
      window.localStorage.setItem(ROLE_STORAGE_KEY, next);
    } catch {
    }
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return ctx;
}