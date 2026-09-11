"use client";

import { useRef } from "react";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useReveal } from "@/lib/gsap";

export function About({ paragraphs }: { paragraphs: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="bg-paper px-6 py-24 text-paper-fg sm:px-16 sm:py-28"
    >
      <div
        ref={ref}
        className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
      >
        <div data-reveal className="flex flex-col gap-8">
          {/* Mobile: photo above the title (DOM order). Desktop: below it —
              md:order swaps the two without touching the mobile stacking. */}
          <div className="relative w-40 sm:w-48 md:order-2">
            {/* A shard peeking out behind the photo, tying it to the same
                decorative language as the hero/contact shards. */}
            <div
              aria-hidden="true"
              className="absolute -bottom-3 -right-3 aspect-[4/5] w-full rounded-[2rem] bg-cyan"
            />
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem]">
              <Image
                src="/profile.jpg"
                alt="Portrait of Jon Stjärnström"
                fill
                sizes="(min-width: 640px) 12rem, 10rem"
                className="object-cover object-top grayscale-[55%] sepia-[12%] contrast-105 saturate-75"
              />
            </div>
          </div>
          <div className="md:order-1">
            <SectionHeading
              id="about-heading"
              index="01"
              kicker="About"
              title="How he works"
              accentClassName="text-cyan"
            />
          </div>
        </div>
        <div data-reveal className="flex flex-col gap-5 text-lg leading-relaxed text-paper-fg/80">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
