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
        let half = 0;
        let tween!: gsap.core.Tween;
        let cancelled = false;

        // `next/font` swaps Familjen Grotesk in after hydration, which changes
        // `track.scrollWidth`. Rebuild the loop once the real width is known so
        // the `-half` endpoint and the wrap modifier never go stale.
        const build = () => {
          half = track.scrollWidth / 2;
          tween?.kill();
          gsap.set(track, { x: 0 });
          tween = gsap.to(track, {
            x: -half,
            duration: 18,
            ease: "none",
            repeat: -1,
            modifiers: { x: (x) => `${parseFloat(x) % half}px` },
          });
          // Seed a hair into the cycle: scrolling up in the first seconds walks
          // timeScale negative, which would otherwise park the tween at 0 (the
          // seam).
          tween.progress(0.001);
        };
        build();

        const rebuild = () => {
          if (!cancelled) build();
        };
        void document.fonts.ready.then(rebuild);
        ScrollTrigger.addEventListener("refresh", rebuild);

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
          cancelled = true;
          ScrollTrigger.removeEventListener("refresh", rebuild);
          tween?.kill();
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
      className="overflow-hidden border-y-2 border-js-green bg-ink text-ink-fg"
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
