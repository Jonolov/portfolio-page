import { profile } from "@/content/profile";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";

export function Contact() {
  const { contact } = profile;

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="mx-auto max-w-3xl px-6 py-16 sm:py-24"
    >
      <RevealOnScroll>
        <SectionHeading
          id="contact-heading"
          eyebrow="Contact"
          title="Get in touch"
        />
        {contact.availableForConsulting ? (
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
            <span
              className="h-2 w-2 rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            {contact.statusLine}
          </p>
        ) : null}
        <a
          href={`mailto:${contact.email}`}
          className="block w-fit rounded text-xl font-semibold break-words text-accent underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:text-2xl"
        >
          {contact.email}
        </a>
        <p className="mt-4 text-foreground/70">
          {contact.company} · {contact.location}
        </p>
        <a
          href={contact.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block w-fit rounded text-foreground/70 underline underline-offset-4 transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          LinkedIn<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </RevealOnScroll>
    </section>
  );
}
