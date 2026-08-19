import type { BadgeVariant } from "@/components/Badge";

export const employeeRoleVariant: Record<string, BadgeVariant> = {
  WORKER: "slate",
  SUPERVISOR: "amber",
  INSPECTOR: "violet",
};

export const reportTypeVariant: Record<string, BadgeVariant> = {
  DAILY: "blue",
  INCIDENT: "red",
  INSPECTION: "violet",
  PERMIT: "amber",
};

export const reportStatusVariant: Record<string, BadgeVariant> = {
  DRAFT: "slate",
  SUBMITTED: "blue",
  APPROVED: "green",
  ACTIVE: "green",
  REJECTED: "red",
  EXPIRED: "red",
};

export const employeeStatusVariant: Record<string, BadgeVariant> = {
  ACTIVE: "green",
  INACTIVE: "slate",
  ON_LEAVE: "amber",
};

export const priorityVariant: Record<string, BadgeVariant> = {
  LOW: "slate",
  MEDIUM: "blue",
  HIGH: "amber",
  CRITICAL: "red",
};

export const correctiveActionStatusVariant: Record<string, BadgeVariant> = {
  OPEN: "amber",
  IN_PROGRESS: "blue",
  RESOLVED: "green",
  VERIFIED: "violet",
};

export const permitTypeVariant: Record<string, BadgeVariant> = {
  HOT_WORK: "orange",
  COLD_WORK: "cyan",
  CONFINED_SPACE: "indigo",
  HEIGHT_WORK: "amber",
  ELECTRICAL_LOTO: "red",
  EXCAVATION: "emerald",
  LIFTING: "teal",
};