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
      if (!root || !contactEl || !navMark || !staticMark) return;

      const glyphs = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll("[data-flip-cell]"),
      );
      const reveal = gsap.utils.toArray<HTMLElement>(
        contactEl.querySelectorAll("[data-contact-reveal]"),
      );

      // Anchor the overlay in the document, exactly over the static J, so it
      // scrolls with the contact section once it has landed.
      const anchor = () => {
        gsap.set(root, { x: 0, y: 0, scale: 1, clearProps: "left,top" });
        const s = staticMark.getBoundingClientRect();
        gsap.set(root, {
          position: "absolute",
          left: s.left + window.scrollX,
          top: s.top + window.scrollY,
        });
      };

      // Offset needed to sit the overlay over the nav mark instead.
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

      anchor();
      // The static J is only the no-JS / reduced-motion image — hide it now
      // for the animated path so it never flashes before the fly-in.
      gsap.set(staticMark, { autoAlpha: 0 });
      gsap.set(root, {
        ...dock(),
        transformOrigin: "center center",
        autoAlpha: 0,
      });

      const tl = gsap.timeline({
        paused: true,
        onStart: () => gsap.set(root, { autoAlpha: 1 }),
        onReverseComplete: () => {
          anchor();
          gsap.set(root, { ...dock(), autoAlpha: 0 });
          gsap.set(navMark, { clearProps: "opacity,visibility" });
        },
      });

      // 1. Fly the mark from the nav down onto the static J's spot; the nav
      //    mark dims as it leaves.
      tl.to(root, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power3.inOut",
      }).to(navMark, { autoAlpha: 0, duration: 0.3 }, 0.05);

      // 2. Shatter → reassemble as it lands. Scatter distance is capped to
      //    the viewport so glyphs never fly absurdly far on small screens.
      const spreadX = Math.min(180, window.innerWidth * 0.32);
      const spreadY = Math.min(140, window.innerHeight * 0.18);
      tl.from(
        glyphs,
        {
          x: () => gsap.utils.random(-spreadX, spreadX),
          y: () => gsap.utils.random(-spreadY, spreadY),
          rotation: () => gsap.utils.random(-160, 160),
          autoAlpha: 0,
          stagger: { each: 0.02, from: "random" },
          duration: 0.7,
          ease: "power3.out",
        },
        0.35,
      );

      // Banded ground: the mark flies over the light page in page colours,
      // then colour-flips to the band palette as it lands on the dark section.
      if (banded) {
        gsap.set(glyphs, {
          backgroundColor: (_i, el: HTMLElement) =>
            el.dataset.accent === "true" ? "var(--accent)" : "var(--foreground)",
        });
        tl.to(
          glyphs,
          {
            backgroundColor: (_i, el: HTMLElement) =>
              el.dataset.accent === "true"
                ? "var(--band-accent)"
                : "var(--band-foreground)",
            duration: 0.4,
            stagger: { each: 0.01, from: "random" },
          },
          0.55,
        );
      }

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

      // Re-anchor + re-dock when layout changes before the reader arrives.
      const onRefresh = () => {
        if (tl.progress() === 0 && !tl.isActive()) {
          anchor();
          gsap.set(root, { ...dock(), autoAlpha: 0 });
        }
      };
      ScrollTrigger.addEventListener("refreshInit", onRefresh);
      return () => ScrollTrigger.removeEventListener("refreshInit", onRefresh);
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      data-flip-mark
      aria-hidden="true"
      className="invisible pointer-events-none absolute left-0 top-0 z-[45] grid"
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
  );
}
