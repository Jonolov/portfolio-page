"use client";

import { useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { profile } from "@/content/profile";
import { useCommandPalette } from "@/components/command-palette/useCommandPalette";
import { NameStar } from "@/components/motion/NameStar";

export function Hero() {
  const { setOpen } = useCommandPalette();
  const shouldReduceMotion = useReducedMotion();

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const starX = useSpring(useTransform(cursorX, [-0.5, 0.5], [-40, 40]), {
    stiffness: 60,
    damping: 20,
  });
  const starY = useSpring(useTransform(cursorY, [-0.5, 0.5], [-40, 40]), {
    stiffness: 60,
    damping: 20,
  });

  function handleMouseMove(event: ReactMouseEvent<HTMLElement>) {
    if (shouldReduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    cursorX.set((event.clientX - rect.left) / rect.width - 0.5);
    cursorY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    cursorX.set(0);
    cursorY.set(0);
  }

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex min-h-[70vh] flex-col justify-center overflow-hidden py-16 sm:min-h-[80vh] sm:py-24"
    >
      <NameStar
        offsetX={starX}
        offsetY={starY}
        cursorX={cursorX}
        cursorY={cursorY}
      />
      <div className="mx-auto w-full max-w-5xl px-6">
        <p className="text-sm font-medium uppercase tracking-wide text-foreground/60">
          {profile.contact.location} · {profile.contact.company}
        </p>
        <h1
          id="hero-heading"
          className="mt-4 text-[clamp(2.75rem,7vw,4.75rem)] font-semibold tracking-tight"
        >
          {profile.name}
        </h1>
        <p className="mt-4 text-lg text-foreground/80 sm:text-xl">
          {profile.roleLine}
        </p>
        <p className="mt-6 max-w-2xl text-base text-foreground/70 sm:text-lg">
          {profile.heroHook}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href="#contact"
            className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            Get in touch
          </a>
          <a
            href="#experience"
            className="rounded-full border border-foreground/20 px-6 py-3 text-sm font-medium transition-colors hover:border-foreground/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            See experience
          </a>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-12 flex items-center gap-2 rounded text-sm text-foreground/60 transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          <kbd className="rounded border border-foreground/20 bg-foreground/5 px-2 py-1 font-mono text-xs">
            ⌘K
          </kbd>
          Jump around the site
        </button>
      </div>
    </section>
  );
}
