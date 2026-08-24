import { profile } from "@/content/profile";

export function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="mx-auto flex min-h-[80vh] max-w-5xl flex-col justify-center px-6 py-24"
    >
      <p className="text-sm font-medium uppercase tracking-wide text-foreground/60">
        {profile.contact.location} · {profile.contact.company}
      </p>
      <h1
        id="hero-heading"
        className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl"
      >
        {profile.name}
      </h1>
      <p className="mt-4 text-xl text-foreground/80">{profile.roleLine}</p>
      <p className="mt-6 max-w-2xl text-lg text-foreground/70">
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
      <p className="mt-12 text-sm text-foreground/40">
        Press ⌘K to jump around
      </p>
    </section>
  );
}
