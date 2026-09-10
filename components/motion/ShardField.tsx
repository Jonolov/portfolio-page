"use client";

import { useRef, useSyncExternalStore } from "react";
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

const FINE_POINTER = "(pointer: fine)";

/** Subscribes to `(pointer: fine)`; SSR-safe (false on the server). */
function useFinePointer(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(FINE_POINTER);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(FINE_POINTER).matches,
    () => false,
  );
}

/**
 * Decorative squares: idle drift + pointer parallax on all pointer types;
 * draggable/inertia only on fine pointers (on coarse pointers the shards keep
 * their default touch-action so a swipe over one still scrolls the page).
 * Each shard is an outer drift/parallax wrapper around an inner `[data-shard]`
 * box — drag transforms the inner element so it never fights the drift tween.
 * Reduced motion: static at their placed positions, no drift/parallax/drag.
 */
export function ShardField({ shards }: { shards: Shard[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const section = root.parentElement;
      const inners = gsap.utils.toArray<HTMLElement>("[data-shard]", root);
      if (inners.length === 0) return;
      const outers = inners.map((el) => el.parentElement as HTMLElement);

      const mm = gsap.matchMedia();
      mm.add(NO_PREFERENCE, () => {
        outers.forEach((el, i) => {
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
          outers.forEach((el, i) => {
            gsap.to(el, {
              xPercent: px * (10 + i * 4),
              yPercent: py * (10 + i * 4),
              duration: 0.6,
              ease: "power2.out",
            });
          });
        };
        const listenTarget: Element = section ?? root;
        listenTarget.addEventListener(
          "pointermove",
          parallax as EventListener,
        );

        const drags = fine
          ? inners.map((el) =>
              Draggable.create(el, {
                type: "x,y",
                inertia: true,
                bounds: root,
              }),
            )
          : [];

        return () => {
          listenTarget.removeEventListener(
            "pointermove",
            parallax as EventListener,
          );
          drags.forEach(([d]) => d.kill());
        };
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [fine] },
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
    >
      {shards.map((s, i) => (
        <span key={i} className="absolute" style={{ left: s.x, top: s.y }}>
          <span
            data-shard
            style={{
              width: s.size,
              height: s.size,
              borderRadius: s.radius ?? 0,
            }}
            className={`block ${s.color} ${
              fine ? "pointer-events-auto touch-none" : ""
            }`}
          />
        </span>
      ))}
    </div>
  );
}
