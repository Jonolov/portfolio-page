"use client";

import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
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
 * Stagger-reveals `[data-reveal]` descendants of `ref` as it scrolls into
 * view. Replaces <RevealOnScroll> / <Stagger>. Reduced motion: elements are
 * shown immediately, untransformed, with no ScrollTrigger.
 */
export function useReveal<T extends HTMLElement>(
  ref: RefObject<T | null>,
  opts: RevealOptions = {},
): void {
  const {
    selector = "[data-reveal]",
    y = 16,
    stagger = 0.08,
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
        gsap.from(targets, {
          opacity: 0,
          y,
          duration: 0.5,
          ease: "power2.out",
          stagger,
          scrollTrigger: { trigger: el, start, once: true },
        });
      });

      return () => mm.revert();
    },
    { scope: ref },
  );
}
