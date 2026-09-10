import type { ReactNode } from "react";

type TagProps = {
  children: ReactNode;
  variant?: "plain" | "cyan" | "pink";
  /** "light" = tag sits on a dark ground; "dark" = on paper. */
  tone?: "light" | "dark";
};

const STYLES: Record<string, string> = {
  "plain-dark": "border border-paper-fg/20 text-paper-fg/80",
  "plain-light": "border border-field-fg/25 text-field-fg/85",
  "cyan-dark": "bg-cyan font-semibold text-cyan-fg",
  "cyan-light": "bg-cyan font-semibold text-cyan-fg",
  "pink-dark": "bg-pink font-semibold text-pink-fg",
  "pink-light": "border border-pink text-pink",
};

export function Tag({
  children,
  variant = "plain",
  tone = "dark",
}: TagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        STYLES[`${variant}-${tone}`]
      }`}
    >
      {children}
    </span>
  );
}
