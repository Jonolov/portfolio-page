import { profile } from "@/content/profile";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="mx-auto max-w-3xl px-6 py-16 sm:py-24"
    >
      <RevealOnScroll>
        <SectionHeading
          id="about-heading"
          eyebrow="About"
          title="How he works"
        />
        <div className="flex flex-col gap-4 text-base text-foreground/80 sm:text-lg">
          {profile.about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </RevealOnScroll>
    </section>
  );
}
