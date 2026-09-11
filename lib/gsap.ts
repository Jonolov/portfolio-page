"use client";

import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";

let registered = false;

/** Register every GSAP plugin the site uses. Idempotent (HMR-safe). */
export function registerGsap(): void {
  if (registered) return;
  gsap.registerPlugin(
    useGSAP,
    ScrollTrigger,
    SplitText,
    Draggable,
    InertiaPlugin,
    MotionPathPlugin,
  );
  registered = true;
}

registerGsap();

export const REDUCED = "(prefers-reduced-motion: reduce)";
export const NO_PREFERENCE = "(prefers-reduced-motion: no-preference)";

/** True when the user asked for reduced motion. SSR-safe (false on server). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(REDUCED).matches;
}

interface RevealOptions {
  selector?: string;
  y?: number;
  stagger?: number;
  start?: string;
}

/**
 * Reveals `[data-reveal]` descendants of `ref` in sequence as it scrolls
 * into view. Replaces the old reveal wrappers. Reduced motion: elements are
 * shown immediately, untransformed, with no ScrollTrigger.
 */
export function useReveal<T extends HTMLElement>(
  ref: RefObject<T | null>,
  opts: RevealOptions = {},
): void {
  const {
    selector = "[data-reveal]",
    y = 32,
    stagger = 0.12,
    start = "top 85%",
  } = opts;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const targets = Array.from(el.querySelectorAll<HTMLElement>(selector));
      if (targets.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(REDUCED, () => {
        gsap.set(targets, { opacity: 1, y: 0, clearProps: "transform" });
      });

      mm.add(NO_PREFERENCE, () => {
        const tween = gsap.from(targets, {
          opacity: 0,
          y,
          duration: 0.7,
          ease: "power3.out",
          stagger,
          paused: true,
        });

        ScrollTrigger.create({
          trigger: el,
          start,
          once: true,
          onEnter: () => {
            const rect = el.getBoundingClientRect();
            const inView =
              rect.top < window.innerHeight && rect.bottom > 0;
            // Scrolled to naturally: play the staggered reveal. Jumped past
            // (deep link, restored scroll position, programmatic scroll):
            // snap straight to the end so nothing sits mid-fade off-screen.
            if (inView) tween.play();
            else tween.progress(1);
          },
        });
      });

      return () => mm.revert();
    },
    { scope: ref },
  );
}
