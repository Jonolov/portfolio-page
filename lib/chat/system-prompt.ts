import type {
  CondensedRole,
  Profile,
  Role,
  SideProject,
  SkillGroup,
} from "@/lib/types";

export interface ChatContent {
  profile: Profile;
  experience: Role[];
  earlierRoles: CondensedRole[];
  skills: SkillGroup[];
  sideProjects: SideProject[];
  today: Date;
}

export function buildSystemPrompt({
  profile,
  experience,
  earlierRoles,
  skills,
  sideProjects,
  today,
}: ChatContent): string {
  const date = today.toISOString().slice(0, 10);
  const availability = profile.contact.availableForConsulting
    ? "currently available for consulting engagements"
    : "not currently available for new consulting engagements";

  const roles = experience
    .map((r) =>
      [
        `${r.title}, ${r.company} (${r.dates.start}–${r.dates.end})`,
        `  ${r.summary}`,
        ...r.highlights.map((h) => `  - ${h}`),
        `  Tech: ${r.tech.join(", ")}`,
      ].join("\n"),
    )
    .join("\n\n");

  const earlier = earlierRoles
    .map((r) => {
      const meta = [r.title, r.dates && `${r.dates.start}–${r.dates.end}`]
        .filter(Boolean)
        .join(", ");
      return meta ? `- ${r.company} (${meta})` : `- ${r.company}`;
    })
    .join("\n");

  const skillLines = skills
    .map((g) => `- ${g.category}: ${g.skills.join(", ")}`)
    .join("\n");

  const projects = sideProjects
    .map(
      (p) =>
        `- ${p.name}: ${p.description} (tech: ${p.tech.join(", ")}; ${p.url})`,
    )
    .join("\n");

  return `You answer questions about ${profile.name}'s professional background for visitors to his portfolio site. Today is ${date}. ${profile.name} is based in ${profile.contact.location} and is ${availability}.

RULES
- Only use the facts in FACTS below. You may summarize or synthesize across roles.
- If you are asked something the facts do not cover — personal life, opinions, other people, or anything unrelated to ${profile.name}'s professional background — say briefly that you only cover ${profile.name}'s work, and suggest they rephrase or email him.
- Never invent employers, dates, job titles, technologies, or metrics. If a detail is not in FACTS, say you do not have it.
- Keep answers to a few sentences. Write about ${profile.name} in the third person.
- Plain prose only. No markdown, no code blocks, no bullet lists.
- When the visitor asks how to contact ${profile.name}, discusses a possible role or engagement, or asks about availability, call the showContactCard tool.

FACTS

About:
${profile.about.paragraphs.join("\n\n")}

Experience:
${roles}

Earlier roles:
${earlier}

Skills:
${skillLines}

Side projects:
${projects}
`;
}
