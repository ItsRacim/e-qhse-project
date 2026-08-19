export type BadgeVariant =
  | "slate"
  | "amber"
  | "green"
  | "red"
  | "blue"
  | "violet"
  | "orange"
  | "cyan"
  | "indigo"
  | "emerald"
  | "teal";

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
  slate: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  red: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  emerald: "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400",
  teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
};

export default function Badge({ children, variant = "slate" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}