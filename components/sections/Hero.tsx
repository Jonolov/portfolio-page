"use client";

import { profile } from "@/content/profile";
import { useCommandPalette } from "@/components/command-palette/useCommandPalette";

const stack = ["React", "Next.js", "TypeScript", "Node.js"];

export function Hero() {
  const { setOpen } = useCommandPalette();

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-10"
    >
      <div className="flex flex-col justify-center">
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
      </div>

      <div
        aria-hidden="true"
        className="hidden min-w-0 border border-foreground/15 bg-foreground/[0.03] font-mono text-[0.82rem] leading-[1.9] lg:block"
      >
        <div className="flex items-center gap-1.5 border-b border-foreground/15 px-3.5 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
        </div>
        <pre className="overflow-x-auto px-4 py-5">
          <span className="text-foreground/60 italic">{"// whoami"}</span>
          {"\n"}
          <span className="text-foreground/60">const</span>{" "}
          <span className="text-foreground/85">consultant</span>{" "}
          <span className="text-foreground/60">=</span>{" "}
          <span className="text-foreground/60">{"{"}</span>
          {"\n"}
          {"  "}
          <span className="text-foreground/85">name</span>
          <span className="text-foreground/60">:</span>{" "}
          <span className="font-semibold text-accent">
            &quot;{profile.name}&quot;
          </span>
          <span className="text-foreground/60">,</span>
          {"\n"}
          {"  "}
          <span className="text-foreground/85">stack</span>
          <span className="text-foreground/60">:</span>{" "}
          <span className="text-foreground/60">[</span>
          {stack.map((item, i) => (
            <span key={item}>
              {i > 0 && i % 2 === 0 ? <>{"\n"}{"    "}</> : null}
              <span className="font-semibold text-accent">
                &quot;{item}&quot;
              </span>
              {i < stack.length - 1 ? (
                <span className="text-foreground/60">, </span>
              ) : null}
            </span>
          ))}
          <span className="text-foreground/60">]</span>
          <span className="text-foreground/60">,</span>
          {"\n"}
          {"  "}
          <span className="text-foreground/85">experience</span>
          <span className="text-foreground/60">:</span>{" "}
          <span className="font-semibold text-accent">
            &quot;10+ years&quot;
          </span>
          <span className="text-foreground/60">,</span>
          {"\n"}
          {"  "}
          <span className="text-foreground/85">status</span>
          <span className="text-foreground/60">:</span>{" "}
          <span className="font-semibold text-accent">
            &quot;
            {profile.contact.availableForConsulting
              ? "available"
              : "unavailable"}
            &quot;
          </span>
          <span className="text-foreground/60">,</span>
          {"\n"}
          <span className="text-foreground/60">{"}"}</span>
          <span className="text-foreground/60">;</span>
        </pre>
      </div>
    </section>
  );
}
