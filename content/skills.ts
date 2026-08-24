import type { SkillGroup } from "@/lib/types";

export const skills: SkillGroup[] = [
  {
    category: "Frontend",
    skills: [
      "React",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "React Query",
      "Apollo Client",
      "SCSS/CSS",
      "Design Systems",
    ],
  },
  {
    category: "Backend",
    skills: ["Node.js/Express", "GraphQL", "Prisma", "Ruby on Rails"],
  },
  {
    category: "Auth/Identity",
    skills: ["Next-Auth", "Keycloak"],
  },
  {
    category: "Testing",
    skills: ["Playwright", "Jest"],
  },
  {
    category: "CMS/Platforms",
    skills: ["Contentful", "WordPress"],
  },
  {
    category: "Practice",
    skills: ["SEO & Performance", "Accessibility (WCAG)", "AI-assisted development"],
  },
];
