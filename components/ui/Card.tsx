import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-foreground/10 p-6 ${className}`}>
      {children}
    </div>
  );
}
