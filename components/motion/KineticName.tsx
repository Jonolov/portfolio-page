"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { NO_PREFERENCE, REDUCED } from "@/lib/gsap";

/**
 * Wraps the hero name's decorative markup and settles its characters in on
 * load. Reduced motion: text renders as-is, no split, nothing transformed.
 */
export function KineticName({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(NO_PREFERENCE, () => {
        // aria: "none" — the wrapped block is already aria-hidden and the
        // <h1> carries aria-label; SplitText must not add its own aria-label.
        const split = new SplitText(el, { type: "chars", aria: "none" });
        gsap.from(split.chars, {
          yPercent: 60,
          opacity: 0,
          skewX: -8,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.03,
        });
        return () => split.revert();
      });

      mm.add(REDUCED, () => {
        gsap.set(el, { clearProps: "all" });
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return <span ref={ref}>{children}</span>;
}
