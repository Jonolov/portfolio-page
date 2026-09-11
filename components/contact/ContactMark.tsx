"use client";

import { useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { Mark } from "@/components/ui/Mark";
import { NO_PREFERENCE, REDUCED } from "@/lib/gsap";

// Positioned as a fraction of the (bounded, centred) mark box so they orbit
// the "JS" at every width instead of crowding it on desktop. Kept inside
// [0,100%] and the container is overflow-clip — a shard that pokes past the
// box plus a GSAP transform reads as page overflow on iOS Safari.
const SHARDS = [
  { left: "3%", top: "5%", size: 22, color: "bg-js-green", radius: 6 },
  { left: "82%", top: "1%", size: 26, color: "bg-ink-fg", radius: 0 },
  { left: "86%", top: "68%", size: 15, color: "bg-js-green", radius: 5 },
  { left: "2%", top: "62%", size: 22, color: "bg-ink-fg", radius: 0 },
];

/**
 * The closing "JS" shatter. On scroll-in: the "J" and "S" fly in separately
 * and spring into place, the shards burst in right after with the same
 * bouncy overshoot, the "Let's build something." headline (owned by
 * `Contact`, passed in via `headlineRef`) pops in word-by-word, and the
 * shards settle into a small idle wobble so the corner never goes fully
 * still. Scroll back up kills the wobble and reverses the whole thing.
 * Triggered, not scrubbed.
 *
 * The mark + shards are decorative and always in the DOM; the real contact
 * heading + copy live in `Contact`, outside this component — `headlineRef`
 * only lets this timeline drive their entrance, it doesn't own their text.
 *
 * The ScrollTrigger is anchored to the headline, not the (much taller,
 * vertically-centred) `<section>` — triggering off the section's own top
 * edge fires while the actual content is still below the fold, since a
 * `min-h-screen` section's centred content can start well past that edge.
 *
 * `headlineRef`'s element must already be attached by the time this mounts:
 * `Contact` renders that `<p>` before this component in the tree (visual
 * order restored via `className`/CSS `order`) so its ref attaches first —
 * React attaches refs and runs layout effects per sibling, depth-first, in
 * tree order. (A `dependencies`-keyed re-run was tried instead, but
 * `useGSAP`'s deferred-cleanup mode is additive across dependency changes,
 * not revert-and-recreate — it left two competing ScrollTriggers/timelines
 * alive on the same elements.)
 */
export function ContactMark({
  headlineRef,
  className = "",
}: {
  headlineRef?: RefObject<HTMLElement | null>;
  className?: string;
}) {
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
        // aria: "none" for both splits — a plain <p> has no ARIA role that
        // permits an aria-label (axe flags it), and the mark's span is
        // already inside this component's aria-hidden root. Neither split
        // hides any text, so screen readers read the same content either
        // way.
        const markSplit = new SplitText(mark, { type: "chars", aria: "none" });
        const split = headlineRef?.current
          ? new SplitText(headlineRef.current, { type: "words", aria: "none" })
          : null;

        let idle: gsap.core.Tween[] = [];
        const startIdle = () => {
          idle = shards.map((el) =>
            gsap.to(el, {
              rotation: `+=${gsap.utils.random(-22, 22)}`,
              x: `+=${gsap.utils.random(-8, 8)}`,
              y: `+=${gsap.utils.random(-12, 12)}`,
              duration: gsap.utils.random(1.6, 2.4),
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            }),
          );
        };
        const stopIdle = () => {
          idle.forEach((t) => t.kill());
          idle = [];
        };

        const tl = gsap.timeline({ paused: true });
        tl.from(markSplit.chars, {
          scale: 0,
          opacity: 0,
          rotate: () => gsap.utils.random(-40, 40),
          y: () => gsap.utils.random(-30, 30),
          duration: 0.6,
          ease: "back.out(1.8)",
          stagger: 0.12,
        }).from(
          shards,
          {
            // Kept modest so a shard never travels far past the mark box —
            // see the SHARDS note (iOS Safari + transforms + overflow).
            x: () => gsap.utils.random(-90, 90),
            y: () => gsap.utils.random(-70, 70),
            rotate: () => gsap.utils.random(-140, 140),
            opacity: 0,
            stagger: { each: 0.04, from: "random" },
            duration: 0.7,
            ease: "back.out(1.7)",
          },
          "<0.1",
        );
        if (split) {
          tl.from(
            split.words,
            {
              y: 16,
              opacity: 0,
              duration: 0.5,
              ease: "back.out(2)",
              stagger: 0.05,
            },
            "<0.25",
          );
        }
        tl.eventCallback("onComplete", startIdle);

        const st = ScrollTrigger.create({
          trigger: headlineRef?.current ?? section,
          start: "top 85%",
          onEnter: () => tl.play(),
          onLeaveBack: () => {
            stopIdle();
            tl.reverse();
          },
        });

        return () => {
          stopIdle();
          tl.kill();
          st.kill();
          markSplit.revert();
          split?.revert();
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
      className={`relative my-16 mx-auto flex h-40 w-full max-w-md items-center justify-center sm:h-52 ${className}`}
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
