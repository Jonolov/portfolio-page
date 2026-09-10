import type { SkillGroup } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";

export function Skills({ groups }: { groups: SkillGroup[] }) {
  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="bg-paper px-6 py-24 text-paper-fg sm:px-16 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll>
          <SectionHeading
            id="skills-heading"
            index="03"
            kicker="Skills"
            title="Grouped by area"
            accentClassName="text-field"
          />
        </RevealOnScroll>
        <StaggerGroup>
          <dl className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <StaggerItem key={group.category}>
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
              </StaggerItem>
            ))}
          </dl>
        </StaggerGroup>
      </div>
    </section>
  );
}
