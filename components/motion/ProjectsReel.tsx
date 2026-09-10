"use client";

import { Children, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { useGSAP } from "@gsap/react";
import { NO_PREFERENCE } from "@/lib/gsap";
import { shouldReel } from "./reel";

/**
 * Projects card row. One card → a plain row, no drag. Two or more → the row
 * becomes drag-scrollable (Draggable drives native `scrollLeft`, so it composes
 * with `overflow-x-auto`, scroll-snap and keyboard scrolling); CSS scroll-snap
 * is the no-JS / reduced-motion fallback, so keyboard scroll always works.
 */
export function ProjectsReel({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reel = shouldReel(Children.count(children));

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track || !reel) return;
      const mm = gsap.matchMedia();
      mm.add(NO_PREFERENCE, () => {
        const [drag] = Draggable.create(track, {
          type: "scrollLeft",
          inertia: true,
          edgeResistance: 0.85,
        });
        return () => drag.kill();
      });
      return () => mm.revert();
    },
    { scope: trackRef, dependencies: [reel] },
  );

  return (
    <div className="overflow-hidden">
      <div
        ref={trackRef}
        className={
          reel
            ? "flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scrollbar-width:none]"
            : "flex gap-6"
        }
      >
        {children}
      </div>
      {reel ? (
        <p data-reel-hint aria-hidden="true" className="mt-4 text-sm font-medium text-field-fg/80">
          drag the reel →
        </p>
      ) : null}
    </div>
  );
}
