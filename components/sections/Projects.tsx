"use client";

import { useRef } from "react";
import type { SideProject } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { useReveal } from "@/lib/gsap";

export function Projects({ projects }: { projects: SideProject[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="bg-pink px-6 py-24 text-pink-fg sm:px-16 sm:py-28"
    >
      <div ref={ref} className="mx-auto max-w-6xl">
        <div data-reveal>
          <SectionHeading
            id="projects-heading"
            index="04"
            kicker="Side projects"
            title="Built for fun"
            accentClassName="text-pink-fg"
          />
        </div>

        <div data-reveal className="flex gap-6 overflow-x-auto pb-2">
          {projects.map((project) => (
            <a
              key={project.name}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block w-full max-w-xl shrink-0 rounded-2xl border-2 border-pink-fg bg-paper p-8 text-paper-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-fg"
            >
              <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {project.name}
                <span className="ml-1.5 inline-block text-field transition-transform group-hover:translate-x-0.5">
                  ↗
                </span>
                <span className="sr-only"> (opens in a new tab)</span>
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-paper-fg/80">
                {project.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <Tag key={tech} tone="dark">
                    {tech}
                  </Tag>
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
