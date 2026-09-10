import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";

export function About({ paragraphs }: { paragraphs: string[] }) {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="bg-paper px-6 py-24 text-paper-fg sm:px-16 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <RevealOnScroll>
          <SectionHeading
            id="about-heading"
            index="01"
            kicker="About"
            title="How he works"
            accentClassName="text-field"
          />
        </RevealOnScroll>
        <RevealOnScroll className="flex flex-col gap-5 text-lg leading-relaxed text-paper-fg/80">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
