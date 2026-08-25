import type { ReactNode } from "react";

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center border border-foreground/15 px-2.5 py-1 font-mono text-xs text-foreground/70 before:content-['--'] before:text-foreground/60">
      {children}
    </span>
  );
}
