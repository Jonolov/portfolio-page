import { profile } from "@/content/profile";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";

export function Contact() {
  const { contact } = profile;

  return (
    <section id="contact" aria-labelledby="contact-heading" className="w-full">
      <div className="mx-auto max-w-3xl px-6 pt-16 sm:pt-24">
        <RevealOnScroll>
          <SectionHeading
            id="contact-heading"
            eyebrow="contact"
            title="get in touch"
          />
        </RevealOnScroll>
      </div>
      <RevealOnScroll>
        <div className="mt-2 w-full bg-band-background py-16 text-band-foreground sm:py-20">
          <div className="mx-auto max-w-3xl px-6">
            <div className="border border-band-foreground/15 bg-band-foreground/5">
              <div
                className="flex items-center gap-1.5 border-b border-band-foreground/15 px-4 py-2.5"
                aria-hidden="true"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-band-foreground/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-band-foreground/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-band-foreground/20" />
              </div>
              <div className="px-5 py-6 font-mono text-sm leading-loose sm:px-6 sm:py-8">
                <p className="text-band-foreground/70">
                  <span className="text-band-accent">$ </span>
                  contact --jon
                  <span
                    className="ml-0.5 inline-block h-[1em] w-[0.5em] translate-y-[0.15em] bg-band-accent motion-safe:animate-caret"
                    aria-hidden="true"
                  />
                </p>
                {contact.availableForConsulting ? (
                  <p className="text-band-foreground/70">
                    status:{" "}
                    <span className="text-band-accent">
                      {contact.statusLine}
                    </span>
                  </p>
                ) : null}
                <p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="rounded text-lg font-bold break-words text-band-accent underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-band-foreground sm:text-xl"
                  >
                    {contact.email}
                  </a>
                </p>
                <p className="text-band-foreground/70">
                  {contact.company.toLowerCase()} · {contact.location.toLowerCase()}
                </p>
                <p>
                  <a
                    href={contact.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded text-band-foreground/70 underline-offset-4 hover:text-band-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-band-foreground"
                  >
                    linkedin
                    <span className="sr-only"> (opens in a new tab)</span> ↗
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
