import { profile } from "@/content/profile";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";

export function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="mx-auto flex min-h-[70vh] max-w-5xl flex-col justify-center px-6 py-16 sm:min-h-[80vh] sm:py-24"
    >
      <RevealOnScroll>
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
        <p className="mt-12 flex items-center gap-2 text-sm text-foreground/60">
          <kbd className="rounded border border-foreground/20 bg-foreground/5 px-2 py-1 font-mono text-xs">
            ⌘K
          </kbd>
          Jump around the site
        </p>
      </RevealOnScroll>
    </section>
  );
}
