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
      className="mx-auto max-w-3xl px-6 py-16 sm:py-24"
    >
      <RevealOnScroll>
        <SectionHeading
          id="skills-heading"
          index="03"
          kicker="Skills"
          title="grouped by area"
          accentClassName="text-field"
        />
      </RevealOnScroll>
      <StaggerGroup>
        <dl className="grid gap-8 sm:grid-cols-2">
          {groups.map((group) => (
            <StaggerItem key={group.category}>
              <dt className="font-mono text-xs text-foreground/60">
                # {group.category.toLowerCase()}
              </dt>
              <dd className="mt-3 flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <Tag key={skill}>{skill}</Tag>
                ))}
              </dd>
            </StaggerItem>
          ))}
        </dl>
      </StaggerGroup>
    </section>
  );
}
