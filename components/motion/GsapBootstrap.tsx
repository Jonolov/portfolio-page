"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerGsap } from "@/lib/gsap";

/**
 * One-time GSAP setup. `next/font` swaps fonts after first paint, shifting
 * every ScrollTrigger measurement — refresh once the fonts settle. Renders
 * nothing.
 */
export function GsapBootstrap() {
  useEffect(() => {
    registerGsap();
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
