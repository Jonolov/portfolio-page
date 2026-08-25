"use client";

import { useState } from "react";
import { earlierRoles, experience } from "@/content/experience";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";

export function Experience() {
  const [showEarlier, setShowEarlier] = useState(false);

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="mx-auto max-w-3xl px-6 py-16 sm:py-24"
    >
      <RevealOnScroll>
        <SectionHeading
          id="experience-heading"
          eyebrow="experience"
          title="selected roles, most recent first"
        />
      </RevealOnScroll>
      <StaggerGroup>
        <ol className="flex flex-col">
          {experience.map((role) => (
            <li key={role.company} className="border-b border-foreground/10 py-8 first:pt-0">
              <StaggerItem>
                <p className="font-mono text-xs text-accent">
                  {role.dates.start} → {role.dates.end}
                </p>
                <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-xl font-semibold tracking-tight">
                    {role.company}
                  </h3>
                  <p className="font-mono text-sm text-foreground/60">
                    {role.title}
                  </p>
                </div>
                <p className="mt-4 max-w-2xl text-foreground/80">
                  {role.summary}
                </p>
                <ul className="mt-4 list-disc space-y-1 pl-5 text-foreground/80">
                  {role.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  {role.tech.map((tech) => (
                    <Tag key={tech}>{tech}</Tag>
                  ))}
                </div>
              </StaggerItem>
            </li>
          ))}
        </ol>
      </StaggerGroup>

      <RevealOnScroll className="mt-8">
        <button
          type="button"
          onClick={() => setShowEarlier((prev) => !prev)}
          aria-expanded={showEarlier}
          aria-controls="earlier-roles"
          className="rounded font-mono text-sm font-medium text-accent underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          {showEarlier ? "hide earlier roles" : "show earlier roles"}
        </button>
        <ul
          id="earlier-roles"
          hidden={!showEarlier}
          className="mt-4 flex flex-col gap-2 text-sm text-foreground/70"
        >
          {earlierRoles.map((role) => (
            <li
              key={role.company}
              className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-foreground/10 py-2"
            >
              <span>
                {role.company}
                {role.title ? ` — ${role.title}` : ""}
              </span>
              {role.dates ? (
                <span className="font-mono text-xs">
                  {role.dates.start} → {role.dates.end}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </RevealOnScroll>
    </section>
  );
}
