"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useRole } from "@/lib/i18n/role-context";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { role } = useRole();

  useEffect(() => {
    const storedRole = typeof window !== "undefined" 
      ? localStorage.getItem("eqhse-active-role") 
      : null;

    if (!storedRole && pathname !== "/login") {
      router.push("/login");
    }
  }, [pathname, router, role]);

  if (typeof window !== "undefined") {
    const storedRole = localStorage.getItem("eqhse-active-role");
    if (!storedRole && pathname !== "/login") {
      return null;
    }
  }

  return <>{children}</>;
}