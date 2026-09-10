"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Mark } from "@/components/ui/Mark";
import { NO_PREFERENCE, REDUCED } from "@/lib/gsap";

// Positioned as a fraction of the (bounded, centred) mark box so they orbit
// the "JS" at every width instead of crowding it on desktop.
const SHARDS = [
  { left: "4%", top: "2%", size: 22, color: "bg-js-green", radius: 6 },
  { left: "87%", top: "-8%", size: 28, color: "bg-cyan", radius: 0 },
  { left: "93%", top: "70%", size: 16, color: "bg-clay", radius: 5 },
  { left: "-2%", top: "62%", size: 24, color: "bg-js-green", radius: 0 },
];

/**
 * The closing "JS" shatter. On scroll-in: the mark scales/rotates in and
 * the shards burst outward then ease to rest. Scroll back up reverses it.
 * Triggered, not scrubbed. Decorative — the contact heading + copy live
 * outside this component and are always in the DOM.
 */
export function ContactMark() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const section = root.closest("section");
      const mark = root.querySelector("[data-contact-mark]");
      const shards = gsap.utils.toArray<HTMLElement>("[data-shard]", root);
      if (!section || !mark) return;

      const mm = gsap.matchMedia();

      mm.add(REDUCED, () => {
        gsap.set([mark, ...shards], { clearProps: "all" });
      });

      mm.add(NO_PREFERENCE, () => {
        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: "power3.out" },
        });
        tl.from(mark, { scale: 0.4, rotate: -12, opacity: 0, duration: 0.6 }).from(
          shards,
          {
            x: () => gsap.utils.random(-160, 160),
            y: () => gsap.utils.random(-140, 140),
            rotate: () => gsap.utils.random(-140, 140),
            opacity: 0,
            stagger: { each: 0.04, from: "random" },
            duration: 0.7,
          },
          "<0.1",
        );

        const st = ScrollTrigger.create({
          trigger: section,
          start: "top 60%",
          onEnter: () => tl.play(),
          onLeaveBack: () => tl.reverse(),
        });

        return () => {
          tl.kill();
          st.kill();
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
      className="relative my-16 mx-auto flex h-40 w-full max-w-md items-center justify-center sm:h-52"
    >
      {SHARDS.map((s, i) => (
        <span
          key={i}
          data-shard
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            borderRadius: s.radius,
          }}
          className={`absolute ${s.color}`}
        />
      ))}
      <span data-contact-mark>
        <Mark
          size="lg"
          className="!text-[clamp(4.5rem,16vw,9rem)] text-js-green"
        />
      </span>
    </div>
  );
}
