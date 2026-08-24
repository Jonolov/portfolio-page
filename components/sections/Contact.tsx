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
          <p className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-foreground/80">
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
      </RevealOnScroll>
    </section>
  );
}
