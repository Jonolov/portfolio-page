"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { NO_PREFERENCE } from "@/lib/gsap";

/**
 * Full-bleed ticker. Base auto-scroll; scroll velocity speeds it up and
 * flips its direction. Reduced motion: static, single copy visible.
 */
export function ScrollMarquee({ items }: { items: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const line = items.join("  ✳  ");

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;
      const mm = gsap.matchMedia();

      mm.add(NO_PREFERENCE, () => {
        const half = track.scrollWidth / 2;
        const tween = gsap.to(track, {
          x: -half,
          duration: 18,
          ease: "none",
          repeat: -1,
          modifiers: { x: (x) => `${parseFloat(x) % half}px` },
        });

        const st = ScrollTrigger.create({
          trigger: document.documentElement,
          start: 0,
          end: "max",
          onUpdate: (self) => {
            const v = self.getVelocity();
            const scale = gsap.utils.clamp(-6, 6, 1 + v / 400);
            gsap.to(tween, {
              timeScale: scale,
              duration: 0.3,
              overwrite: true,
            });
          },
        });

        return () => {
          tween.kill();
          st.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: trackRef },
  );

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-y-2 border-ink bg-cyan text-cyan-fg"
    >
      <div
        ref={trackRef}
        className="flex w-max whitespace-nowrap py-3.5 font-display text-base font-semibold sm:text-lg"
      >
        <span className="px-6">{line}  ✳  </span>
        <span className="px-6">{line}  ✳  </span>
      </div>
    </div>
  );
}
