import type { ReactNode } from "react";

export type TagTone =
  | "neutral"
  | "violet"
  | "blue"
  | "amber"
  | "emerald"
  | "rose"
  | "cyan";

const toneClasses: Record<TagTone, string> = {
  neutral: "border-foreground/15 text-foreground/80",
  violet:
    "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  blue: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  amber:
    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  emerald:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rose: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
};

export function Tag({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: TagTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
