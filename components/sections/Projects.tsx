import { projects } from "@/content/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";

export function Projects() {
  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="mx-auto max-w-3xl px-6 py-16 sm:py-24"
    >
      <RevealOnScroll>
        <SectionHeading
          id="projects-heading"
          eyebrow="side projects"
          title="built for fun"
        />
      </RevealOnScroll>
      <StaggerGroup>
        <ul className="flex flex-col gap-6">
          {projects.map((project) => (
            <li key={project.name}>
              <StaggerItem>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded border border-foreground/15 p-5 transition-colors hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:p-6"
                >
                  <h3 className="text-lg font-semibold tracking-tight">
                    {project.name}
                    <span className="ml-1.5 inline-block text-accent transition-transform group-hover:translate-x-0.5">
                      ↗
                    </span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </h3>
                  <p className="mt-2 text-foreground/80">
                    {project.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <Tag key={tech}>{tech}</Tag>
                    ))}
                  </div>
                </a>
              </StaggerItem>
            </li>
          ))}
        </ul>
      </StaggerGroup>
    </section>
  );
}
