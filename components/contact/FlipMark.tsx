"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  BLOCK_MARK_COLS,
  BLOCK_MARK_ROWS,
  MARK_CELL,
  MARK_GAP,
  blockMarkCells,
} from "@/components/contact/block-mark";
import { CONTACT_GROUND } from "@/components/contact/ground";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const banded = CONTACT_GROUND === "banded";

export default function FlipMark() {
  const rootRef = useRef<HTMLDivElement>(null);
  const cells = blockMarkCells();

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const root = rootRef.current;
      const contactEl = document.querySelector<HTMLElement>("#contact");
      const navMark = document.querySelector<HTMLElement>("[data-nav-mark]");
      const staticMark = document.querySelector<HTMLElement>(
        "[data-contact-mark]",
      );
      if (!root || !contactEl || !navMark) return;

      const dimTargets = [navMark, staticMark].filter(Boolean) as HTMLElement[];
      const glyphs = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll("[data-flip-cell]"),
      );
      const reveal = gsap.utils.toArray<HTMLElement>(
        contactEl.querySelectorAll("[data-contact-reveal]"),
      );

      // Transform the CSS-centred overlay to sit exactly over the nav mark,
      // then animate it home on the contact hand-off.
      const dock = () => {
        gsap.set(root, { x: 0, y: 0, scale: 1 });
        const me = root.getBoundingClientRect();
        const nav = navMark.getBoundingClientRect();
        return {
          x: nav.left + nav.width / 2 - (me.left + me.width / 2),
          y: nav.top + nav.height / 2 - (me.top + me.height / 2),
          scale: nav.width / me.width,
        };
      };

      gsap.set(root, {
        ...dock(),
        transformOrigin: "center center",
        autoAlpha: 0,
      });

      const tl = gsap.timeline({
        paused: true,
        onStart: () => gsap.set(root, { autoAlpha: 1 }),
        onReverseComplete: () => {
          gsap.set(root, { ...dock(), autoAlpha: 0 });
          gsap.set(dimTargets, { clearProps: "opacity,visibility" });
        },
      });

      // 1. Fly the mark from the nav to centre.
      tl.to(root, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power3.inOut",
      }).to(dimTargets, { autoAlpha: 0, duration: 0.3 }, 0.05);

      // 2. Shatter → reassemble: the glyphs scatter in from random offsets
      //    and settle as the mark lands.
      tl.from(
        glyphs,
        {
          x: () => gsap.utils.random(-180, 180),
          y: () => gsap.utils.random(-140, 140),
          rotation: () => gsap.utils.random(-160, 160),
          autoAlpha: 0,
          stagger: { each: 0.02, from: "random" },
          duration: 0.7,
          ease: "power3.out",
        },
        0.35,
      );

      // 3. Contact copy rises in. Opacity only (not autoAlpha) so it stays
      //    in the accessibility tree before it animates.
      tl.from(
        reveal,
        {
          opacity: 0,
          y: 14,
          stagger: 0.08,
          duration: 0.5,
          ease: "power2.out",
        },
        ">-0.1",
      );

      ScrollTrigger.create({
        trigger: contactEl,
        start: "top 30%",
        onEnter: () => tl.play(),
        onLeaveBack: () => tl.reverse(),
      });
    },
    { scope: rootRef },
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[45] grid place-items-center"
    >
      <div
        ref={rootRef}
        data-flip-mark
        className="invisible grid"
        style={{
          gridTemplateColumns: `repeat(${BLOCK_MARK_COLS}, ${MARK_CELL})`,
          gridTemplateRows: `repeat(${BLOCK_MARK_ROWS}, ${MARK_CELL})`,
          gap: MARK_GAP,
        }}
      >
        {cells.map((cell, i) => (
          <span
            key={i}
            data-flip-cell
            data-accent={cell.accent}
            style={{ gridRow: cell.row + 1, gridColumn: cell.col + 1 }}
            className={
              cell.accent
                ? banded
                  ? "bg-band-accent"
                  : "bg-accent"
                : banded
                  ? "bg-band-foreground"
                  : "bg-foreground"
            }
          />
        ))}
      </div>
    </div>
  );
}
