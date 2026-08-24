import { profile } from "@/content/profile";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="mx-auto max-w-3xl px-6 py-24"
    >
      <SectionHeading id="about-heading" eyebrow="About" title="How he works" />
      <div className="flex flex-col gap-4 text-lg text-foreground/80">
        {profile.about.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
