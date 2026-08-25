"use client";

import { profile } from "@/content/profile";
import { useCommandPalette } from "@/components/command-palette/useCommandPalette";

export function Hero() {
  const { setOpen } = useCommandPalette();
  const firstLetter = profile.name.slice(0, 1);
  const rest = profile.name.slice(1);

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="mx-auto flex w-full max-w-5xl flex-col justify-center px-4 py-16 sm:px-6 sm:py-24"
    >
      <p className="font-mono text-xs uppercase tracking-wide text-accent">
        {profile.contact.location.toLowerCase()}, se ·{" "}
        {profile.contact.company.toLowerCase()}
      </p>
      <h1
        id="hero-heading"
        aria-label={profile.name}
        className="mt-5 font-mono text-[clamp(2.1rem,7.5vw,5.25rem)] font-bold leading-[1.35] tracking-tight"
      >
        <span
          aria-hidden="true"
          className="border-b-[0.12em] border-accent pb-[0.06em]"
        >
          {firstLetter}
        </span>
        <span aria-hidden="true">{rest}</span>
      </h1>
      <p className="mt-6 max-w-xl text-lg text-foreground/70 sm:text-xl">
        {profile.roleLine}
        <span
          className="ml-0.5 inline-block h-[1em] w-[0.5em] translate-y-[0.15em] bg-accent motion-safe:animate-caret"
          aria-hidden="true"
        />
      </p>
      <p className="mt-4 max-w-2xl text-base text-foreground/70 sm:text-lg">
        {profile.heroHook}
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <a
          href="#contact"
          className="rounded border border-foreground bg-foreground px-5 py-3 font-mono text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          [ get in touch ]
        </a>
        <a
          href="#experience"
          className="rounded border border-foreground/25 px-5 py-3 font-mono text-sm font-medium transition-colors hover:border-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          [ see experience ]
        </a>
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-10 flex w-fit items-center gap-2 rounded font-mono text-sm text-foreground/65 transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        [ <kbd>⌘k</kbd> ] jump around the site
      </button>
    </section>
  );
}
