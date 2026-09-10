"use client";

import { useRef, useState } from "react";
import type { CondensedRole, Role } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { ShardField } from "@/components/motion/ShardField";
import { useReveal } from "@/lib/gsap";

const HIGHLIGHT_TECH = new Set(["Next.js", "React", "Claude Code"]);

function techVariant(tech: string): "plain" | "cyan" | "pink" {
  if (tech === "React") return "pink";
  if (HIGHLIGHT_TECH.has(tech)) return "cyan";
  return "plain";
}

export function Experience({
  experience,
  earlierRoles,
}: {
  experience: Role[];
  earlierRoles: CondensedRole[];
}) {
  const [showEarlier, setShowEarlier] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="relative isolate overflow-hidden bg-field px-6 py-24 text-field-fg sm:px-16 sm:py-28"
    >
      <ShardField
        shards={[{ x: "90%", y: "3rem", size: 24, color: "bg-cyan" }]}
      />

      <div ref={ref} className="relative z-10 mx-auto max-w-6xl">
        <div data-reveal>
          <SectionHeading
            id="experience-heading"
            index="02"
            kicker="Experience"
            title="Selected roles"
          />
        </div>

        <ol className="flex flex-col">
          {experience.map((role) => (
            <li
              key={role.company}
              className="border-t-2 border-field-fg/20 py-8"
            >
              <div data-reveal>
                <p className="text-sm font-semibold text-cyan">
                  {role.dates.start} — {role.dates.end}
                </p>
                <div className="mt-2.5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                    {role.company}
                  </h3>
                  <p className="text-sm text-field-fg/75">{role.title}</p>
                </div>
                <p className="mt-4 max-w-3xl text-field-fg/85">
                  {role.summary}
                </p>
                <ul className="mt-4 list-disc space-y-1 pl-5 text-field-fg/85">
                  {role.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-2">
                  {role.tech.map((tech) => (
                    <Tag key={tech} tone="light" variant={techVariant(tech)}>
                      {tech}
                    </Tag>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div data-reveal className="border-t-2 border-field-fg/20 pt-7">
          <button
            type="button"
            onClick={() => setShowEarlier((prev) => !prev)}
            aria-expanded={showEarlier}
            aria-controls="earlier-roles"
            className="rounded text-sm font-semibold text-cyan underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-fg"
          >
            {showEarlier ? "Hide earlier roles" : "Show earlier roles"}
          </button>
          <ul
            id="earlier-roles"
            hidden={!showEarlier}
            className="mt-4 flex flex-col gap-2 text-sm text-field-fg/70"
          >
            {earlierRoles.map((role) => (
              <li
                key={role.company}
                className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-field-fg/15 py-2"
              >
                <span>
                  {role.company}
                  {role.title ? ` — ${role.title}` : ""}
                </span>
                {role.dates ? (
                  <span>
                    {role.dates.start} — {role.dates.end}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
