"use client";

import { useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { useGSAP } from "@gsap/react";
import { NO_PREFERENCE } from "@/lib/gsap";
import { computeFieldInfluence } from "@/components/motion/field";
import { buildDriftPath } from "@/components/motion/driftPath";

export type Shard = {
  x: string;
  y: string;
  size: number;
  color: string;
  radius?: number;
};

const FINE_POINTER = "(pointer: fine)";

const FIELD_RADIUS = 300; // px reach of the cursor's field
const MAX_PUSH = 42; // px a shard gets shoved when the cursor sits on it
const MAX_SCALE = 1.18; // shard scale directly under the cursor
const SETTLE = { duration: 0.5, ease: "power3.out" };

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
 * Decorative squares: organic idle drift + a cursor "field" (push + depth
 * scale) on all pointer types; draggable/inertia only on fine pointers (on
 * coarse pointers the shards keep their default touch-action so a swipe over
 * one still scrolls the page).
 *
 * Each shard is three nested layers so the independent animations never
 * fight over the same transform: the outer span holds its static placed
 * position; `[data-drift]` runs the idle motion-path loop (x/y, rotation);
 * `[data-field]` handles the cursor push + depth scale (xPercent/yPercent,
 * scale); `[data-shard]` is dragged (x/y again, safe because it's a
 * different element).
 *
 * Reduced motion: static at their placed positions, no drift/field/drag.
 */
export function ShardField({ shards }: { shards: Shard[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const section = root.parentElement;
      const outers = gsap.utils.toArray<HTMLElement>("[data-outer]", root);
      const drifts = gsap.utils.toArray<HTMLElement>("[data-drift]", root);
      const fields = gsap.utils.toArray<HTMLElement>("[data-field]", root);
      const inners = gsap.utils.toArray<HTMLElement>("[data-shard]", root);
      if (inners.length === 0) return;

      const mm = gsap.matchMedia();
      mm.add(NO_PREFERENCE, () => {
        drifts.forEach((el, i) => {
          gsap.to(el, {
            motionPath: {
              path: buildDriftPath(i),
              curviness: 1.5,
              autoRotate: true,
              relative: true,
            },
            duration: 10 + i * 2,
            repeat: -1,
            ease: "none",
          });
        });

        const setters = fields.map((el) => ({
          x: gsap.quickTo(el, "xPercent", SETTLE),
          y: gsap.quickTo(el, "yPercent", SETTLE),
          scale: gsap.quickTo(el, "scale", SETTLE),
        }));

        const field = (e: PointerEvent) => {
          outers.forEach((el, i) => {
            const r = el.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const dx = cx - e.clientX;
            const dy = cy - e.clientY;
            const dist = Math.hypot(dx, dy);
            const influence = computeFieldInfluence(dist, FIELD_RADIUS);
            const nx = dist === 0 ? 1 : dx / dist;
            const ny = dist === 0 ? 0 : dy / dist;
            // xPercent/yPercent scale with the shard's own (tiny) box, so
            // convert the desired pixel push into a percentage of its size.
            const fieldRect = fields[i].getBoundingClientRect();
            setters[i].x((nx * influence * MAX_PUSH) / (fieldRect.width / 100));
            setters[i].y((ny * influence * MAX_PUSH) / (fieldRect.height / 100));
            setters[i].scale(1 + influence * (MAX_SCALE - 1));
          });
        };
        const reset = () => {
          setters.forEach((s) => {
            s.x(0);
            s.y(0);
            s.scale(1);
          });
        };

        const listenTarget: Element = section ?? root;
        listenTarget.addEventListener("pointermove", field as EventListener);
        listenTarget.addEventListener("pointerleave", reset);

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
            field as EventListener,
          );
          listenTarget.removeEventListener("pointerleave", reset);
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
      // overflow-clip on the field itself, not just the section: iOS Safari
      // can let a GSAP-transformed (composited) child escape an ancestor's
      // overflow:hidden, which showed up as a horizontal scrollbar on phones.
      className="pointer-events-none absolute inset-0 -z-10 overflow-clip"
    >
      {shards.map((s, i) => (
        <span
          key={i}
          data-outer
          className="absolute"
          style={{ left: s.x, top: s.y }}
        >
          <span data-drift className="block">
            <span data-field className="block">
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
          </span>
        </span>
      ))}
    </div>
  );
}
