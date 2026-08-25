"use client";

import { profile } from "@/content/profile";
import { useCommandPalette } from "@/components/command-palette/useCommandPalette";

export function Hero() {
  const { setOpen } = useCommandPalette();

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="mx-auto flex w-full max-w-5xl flex-col justify-center px-4 py-16 sm:min-h-[70vh] sm:px-6 sm:py-24"
    >
      <p className="font-mono text-xs uppercase tracking-wide text-accent">
        {profile.contact.location.toLowerCase()}, se ·{" "}
        {profile.contact.company.toLowerCase()}
      </p>
      <h1
        id="hero-heading"
        className="mt-5 font-mono text-[clamp(2.4rem,7.5vw,5.25rem)] font-bold leading-[0.98] tracking-tight"
      >
        {profile.name}
      </h1>
      <p className="mt-6 max-w-xl text-lg text-foreground/70 sm:text-xl">
        {profile.roleLine}
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
