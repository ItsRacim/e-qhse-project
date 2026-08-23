"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export type UserRole = "SUPERVISOR" | "QHSE_ENGINEER";

export const ROLE_STORAGE_KEY = "eqhse-active-role";

const DEFAULT_ROLE: UserRole = "SUPERVISOR";

type RoleContextValue = {
  role: UserRole;
  setRole: (role: UserRole) => void;
};

const RoleContext = createContext<RoleContextValue | null>(null);

function resolveStoredRole(): UserRole {
  if (typeof window === "undefined") return DEFAULT_ROLE;
  try {
    const stored = window.localStorage.getItem(ROLE_STORAGE_KEY);
    return stored === "QHSE_ENGINEER" ? "QHSE_ENGINEER" : DEFAULT_ROLE;
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