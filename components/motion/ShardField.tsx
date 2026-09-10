"use client";

import { useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { useGSAP } from "@gsap/react";
import { NO_PREFERENCE } from "@/lib/gsap";

export type Shard = {
  x: string;
  y: string;
  size: number;
  color: string;
  radius?: number;
};

/**
 * Decorative squares: idle drift + pointer parallax + draggable/inertia.
 * Reduced motion: static at their placed positions, no drag.
 */
export function ShardField({ shards }: { shards: Shard[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const els = gsap.utils.toArray<HTMLElement>("[data-shard]", root);
      if (els.length === 0) return;

      const mm = gsap.matchMedia();
      mm.add(NO_PREFERENCE, () => {
        els.forEach((el, i) => {
          gsap.to(el, {
            y: "+=12",
            x: "+=8",
            rotation: i % 2 ? 12 : -12,
            duration: 6 + i,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        });

        const parallax = (e: PointerEvent) => {
          const r = root.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          els.forEach((el, i) => {
            gsap.to(el, {
              xPercent: px * (10 + i * 4),
              yPercent: py * (10 + i * 4),
              duration: 0.6,
              ease: "power2.out",
            });
          });
        };
        root.addEventListener("pointermove", parallax);

        const drags = els.map((el) =>
          Draggable.create(el, {
            type: "x,y",
            inertia: true,
            bounds: root,
          }),
        );

        return () => {
          root.removeEventListener("pointermove", parallax);
          drags.forEach(([d]) => d.kill());
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    >
      {shards.map((s, i) => (
        <span
          key={i}
          data-shard
          style={{
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            borderRadius: s.radius ?? 0,
          }}
          className={`pointer-events-auto absolute touch-none ${s.color}`}
        />
      ))}
    </div>
  );
}
