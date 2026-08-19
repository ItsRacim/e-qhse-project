import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "amber" | "blue" | "green" | "red";
  href?: string;
};

const borderAccents: Record<NonNullable<StatCardProps["accent"]>, string> = {
  amber: "border-l-amber-400",
  blue: "border-l-blue-500",
  green: "border-l-emerald-500",
  red: "border-l-rose-500",
};

const iconAccents: Record<NonNullable<StatCardProps["accent"]>, string> = {
  amber: "bg-amber-500/10 text-amber-600",
  blue: "bg-blue-500/10 text-blue-600",
  green: "bg-emerald-500/10 text-emerald-600",
  red: "bg-rose-500/10 text-rose-600",
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = "amber",
  href,
}: StatCardProps) {
  const card = (
    <div
      className={`group flex items-center gap-4 rounded-xl border border-l-4 border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 ${
        href ? "cursor-pointer hover:-translate-y-1 hover:shadow-md" : ""
      } ${borderAccents[accent]}`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconAccents[accent]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold leading-tight text-slate-800">
          {value}
        </p>
        <p className="text-sm text-muted">{label}</p>
      </div>
      {href && (
        <ChevronRight className="ms-auto h-4 w-4 shrink-0 text-slate-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-orange-500" />
      )}
    </div>
  );

  if (!href) return card;
  return <Link href={href}>{card}</Link>;
}