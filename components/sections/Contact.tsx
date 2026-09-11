"use client";

import { useRef } from "react";
import type { Profile } from "@/lib/types";
import { useReveal } from "@/lib/gsap";
import { ContactMark } from "@/components/contact/ContactMark";

export function Contact({ contact }: { contact: Profile["contact"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLParagraphElement>(null);
  useReveal(ref, { selector: "[data-contact-reveal]" });

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden bg-ink px-6 py-28 text-ink-fg"
    >
      <div
        ref={ref}
        className="mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        <h2
          id="contact-heading"
          className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-fg/70"
        >
          <span className="text-js-green">05 — </span>Contact
        </h2>

        {/* This <p> comes before ContactMark in the tree (order-2 below
            restores the original visual stacking) so its ref is attached
            before ContactMark's mount effect runs — React attaches refs and
            runs layout effects per sibling, depth-first, in tree order. */}
        <p
          ref={headlineRef}
          className="order-2 font-display text-3xl font-bold tracking-tight sm:text-4xl"
        >
          Let&apos;s build something.
        </p>

        <ContactMark headlineRef={headlineRef} className="order-1" />

        <div className="order-last mt-8 flex w-full max-w-md flex-col items-center gap-3.5 text-sm">
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
