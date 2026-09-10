"use client";

import { useRef } from "react";
import type { SkillGroup } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { ShardField } from "@/components/motion/ShardField";
import { useReveal } from "@/lib/gsap";

export function Skills({ groups }: { groups: SkillGroup[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="relative overflow-hidden bg-paper px-6 py-24 text-paper-fg sm:px-16 sm:py-28"
    >
      <ShardField
        shards={[{ x: "6%", y: "82%", size: 26, color: "bg-cyan" }]}
      />

      <div ref={ref} className="mx-auto max-w-6xl">
        <div data-reveal>
          <SectionHeading
            id="skills-heading"
            index="03"
            kicker="Skills"
            title="Grouped by area"
            accentClassName="text-field"
          />
        </div>
        <dl className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <div data-reveal key={group.category}>
              <dt className="mb-3 font-display text-base font-semibold">
                {group.category}
              </dt>
              <dd className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <Tag key={skill} tone="dark">
                    {skill}
                  </Tag>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
