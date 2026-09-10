import type { Profile } from "@/lib/types";
import { Mark } from "@/components/ui/Mark";

export function Contact({ contact }: { contact: Profile["contact"] }) {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      data-contact
      className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden bg-ink px-6 py-28 text-ink-fg"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <h2
          id="contact-heading"
          className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-fg/70"
        >
          <span className="text-js-green">05 — </span>Contact
        </h2>

        <div
          className="relative my-14 flex h-52 items-center justify-center"
          aria-hidden="true"
        >
          <span
            data-shard
            className="absolute left-[calc(50%-90px)] top-16 h-8 w-8 rounded-lg bg-js-green"
          />
          <span
            data-shard
            className="absolute left-[calc(50%+60px)] top-16 h-6 w-6 bg-cyan"
          />
          <span
            data-shard
            className="absolute left-[calc(50%+40px)] top-40 h-7 w-7 rounded bg-pink"
          />
          <Mark
            size="lg"
            className="!text-[clamp(5rem,20vw,10rem)] text-js-green"
          />
        </div>

        <p className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Let&apos;s build something.
        </p>

        <div className="mt-8 flex w-full max-w-md flex-col items-center gap-3.5 text-sm">
          {contact.availableForConsulting ? (
            <p data-contact-reveal className="text-ink-fg/70">
              <span className="text-js-green">●</span> {contact.statusLine}
            </p>
          ) : null}

          <p data-contact-reveal>
            <a
              href={`mailto:${contact.email}`}
              className="rounded font-display text-lg font-bold text-js-green [overflow-wrap:anywhere] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-fg sm:text-2xl"
            >
              {contact.email}
            </a>
          </p>

          <p data-contact-reveal className="text-ink-fg/70">
            {contact.company} · {contact.location}
          </p>

          <p data-contact-reveal>
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded text-ink-fg/70 underline underline-offset-4 hover:text-js-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-fg"
            >
              LinkedIn<span className="sr-only"> (opens in a new tab)</span> ↗
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
