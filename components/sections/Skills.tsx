import { skills } from "@/content/skills";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";

export function Skills() {
  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="mx-auto max-w-3xl px-6 py-16 sm:py-24"
    >
      <SectionHeading id="skills-heading" eyebrow="Skills" title="Grouped by area" />
      <dl className="grid gap-8 sm:grid-cols-2">
        {skills.map((group) => (
          <div key={group.category}>
            <dt className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
              {group.category}
            </dt>
            <dd className="mt-3 flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <Tag key={skill}>{skill}</Tag>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
