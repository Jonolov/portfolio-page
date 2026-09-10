import type { Profile } from "@/lib/types";
import { BlockMark } from "@/components/ui/BlockMark";
import { MARK_CELL, MARK_GAP } from "@/components/ui/block-mark";

// The closing view is a full-bleed dark band — "day becomes night" — so
// every colour here is from the inverted `band-*` palette.
export function Contact({ contact }: { contact: Profile["contact"] }) {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      data-contact
      className="flex min-h-screen w-full flex-col justify-center bg-band-background py-24 text-band-foreground"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <h2
          id="contact-heading"
          className="font-mono text-xs uppercase tracking-wide text-band-foreground/60"
        >
          <span className="text-band-accent">{"// "}</span>
          contact — get in touch
        </h2>

        {/* Static J — the accessible / no-JS / reduced-motion image.
            FlipMark overlays this exactly when it animates. */}
        <BlockMark
          data-contact-mark
          cell={MARK_CELL}
          gap={MARK_GAP}
          className="my-16"
          cellClassName="bg-band-foreground"
          accentClassName="bg-band-accent"
        />

        <div className="flex w-full max-w-md flex-col items-center gap-3 font-mono text-sm">
          {contact.availableForConsulting ? (
            <p
              data-contact-reveal
              className="max-w-full text-balance text-band-foreground/70"
            >
              status:{" "}
              <span className="text-band-accent">{contact.statusLine}</span>
            </p>
          ) : null}

          <p data-contact-reveal className="max-w-full">
            <a
              href={`mailto:${contact.email}`}
              className="rounded text-sm font-bold text-band-accent [overflow-wrap:anywhere] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-band-foreground sm:text-lg"
            >
              {contact.email}
            </a>
          </p>

          <p
            data-contact-reveal
            className="max-w-full text-balance text-band-foreground/70"
          >
            {contact.company.toLowerCase()} · {contact.location.toLowerCase()}
          </p>

          <p data-contact-reveal>
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded text-band-foreground/70 underline-offset-4 hover:text-band-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-band-foreground"
            >
              linkedin<span className="sr-only"> (opens in a new tab)</span> ↗
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
