"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { NO_PREFERENCE } from "@/lib/gsap";
import { computeMagnetOffset } from "@/components/motion/magnet";

const RADIUS = 90; // px from centre where the pull starts
const PULL = 0.28; // fraction of the offset the button follows
// Hard cap on travel: two of these sitting close together (e.g. the hero
// CTAs) both chase the same pointer, so an unbounded pull can drag them
// into each other. Capping each one's excursion keeps that gap intact.
const MAX_OFFSET = 18;

/**
 * Pulls its single child toward the pointer on fine-pointer devices.
 * Reduced motion / coarse pointer: inert passthrough.
 */
export function MagneticButton({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (!window.matchMedia("(pointer: fine)").matches) return;

      const mm = gsap.matchMedia();
      mm.add(NO_PREFERENCE, () => {
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          if (Math.hypot(dx, dy) > RADIUS + Math.max(r.width, r.height) / 2) {
            gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: "power3.out" });
            return;
          }
          const { x, y } = computeMagnetOffset(dx, dy, PULL, MAX_OFFSET);
          gsap.to(el, {
            x,
            y,
            duration: 0.3,
            ease: "power2.out",
          });
        };
        const reset = () =>
          gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: "power3.out" });

        window.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", reset);
        return () => {
          window.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", reset);
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className="inline-flex">
      {children}
    </span>
  );
}
