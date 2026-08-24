import type { ReactNode } from "react";

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-foreground/15 px-3 py-1 text-sm text-foreground/80">
      {children}
    </span>
  );
}
