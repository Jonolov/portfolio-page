"use client";

import { useState } from "react";
import { earlierRoles, experience } from "@/content/experience";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { Card } from "@/components/ui/Card";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { TiltCard } from "@/components/motion/TiltCard";

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
          eyebrow="Experience"
          title="Selected roles"
        />
      </RevealOnScroll>
      <StaggerGroup>
        <ol className="flex flex-col gap-8">
          {experience.map((role) => (
            <li key={role.company}>
              <StaggerItem>
                <TiltCard>
                  <Card>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="text-xl font-semibold">
                        {role.company}
                      </h3>
                      <p className="text-sm text-foreground/60">
                        {role.dates.start} – {role.dates.end}
                      </p>
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground/70">
                      {role.title}
                    </p>
                    <p className="mt-4 text-foreground/80">{role.summary}</p>
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
                  </Card>
                </TiltCard>
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
          className="rounded text-sm font-medium text-accent underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          {showEarlier ? "Hide earlier roles" : "Show earlier roles"}
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
                <span>
                  {role.dates.start} – {role.dates.end}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </RevealOnScroll>
    </section>
  );
}
