"use client";

import type { Profile } from "@/lib/types";
import { useCommandPalette } from "@/components/command-palette/useCommandPalette";
import { KineticName } from "@/components/motion/KineticName";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ShardField } from "@/components/motion/ShardField";

export function Hero({ profile }: { profile: Profile }) {
  const { setOpen } = useCommandPalette();
  const [first, ...restWords] = profile.name.split(" ");
  const last = restWords.join(" ");

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden bg-field px-6 py-24 text-field-fg sm:px-16 sm:py-32"
    >
      <ShardField
        shards={[
          { x: "83%", y: "3.5rem", size: 44, color: "bg-clay", radius: 14 },
          { x: "62%", y: "16%", size: 12, color: "bg-paper", radius: 4 },
          { x: "93%", y: "26%", size: 10, color: "bg-cyan" },
          { x: "70%", y: "46%", size: 20, color: "bg-paper", radius: 4 },
          { x: "90%", y: "58%", size: 30, color: "bg-cyan", radius: 8 },
          { x: "78%", y: "80%", size: 16, color: "bg-clay", radius: 6 },
          { x: "88%", y: "90%", size: 22, color: "bg-paper", radius: 6 },
        ]}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-cyan">
          Stockholm · Consulting · Open
        </p>

        <h1
          id="hero-heading"
          aria-label={profile.name}
          className="font-display text-[clamp(2.75rem,11vw,8.25rem)] font-bold uppercase leading-[0.9] tracking-[-0.04em]"
        >
          <KineticName>
            <span aria-hidden="true">
              {first}
              <br />
              <span className="text-clay-soft">{last.slice(0, 6)}</span>
              <span className="[-webkit-text-stroke:2px_var(--field-fg)] [color:transparent]">
                {last.slice(6)}
              </span>
            </span>
          </KineticName>
        </h1>

        <p className="mt-9 max-w-2xl text-xl text-field-fg/80 sm:text-2xl">
          {profile.roleLine}
          <span
            className="ml-1 inline-block h-[1em] w-[0.5em] translate-y-[0.14em] bg-cyan motion-safe:animate-caret"
            aria-hidden="true"
          />
        </p>
        <p className="mt-4 max-w-xl text-base text-field-fg/80 sm:text-lg">
          {profile.heroHook}
        </p>

        <div className="mt-11 flex flex-col gap-3 sm:flex-row">
          <MagneticButton>
            <a
              href="#contact"
              className="w-full sm:w-auto rounded-lg bg-cyan px-6 py-4 text-center font-display font-semibold text-cyan-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-fg"
            >
              Get in touch →
            </a>
          </MagneticButton>
          <MagneticButton>
            <a
              href="#experience"
              className="w-full sm:w-auto rounded-lg border-2 border-field-fg px-6 py-4 text-center font-display font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-fg"
            >
              See the work
            </a>
          </MagneticButton>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-8 w-fit rounded text-sm text-field-fg/85 transition-colors hover:text-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-fg"
        >
          Press <kbd className="rounded border border-field-fg/40 px-1.5 py-0.5">⌘K</kbd> to
          jump around the site
        </button>
      </div>
    </section>
  );
}
