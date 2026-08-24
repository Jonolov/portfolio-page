import type { CondensedRole, Role } from "@/lib/types";

export const experience: Role[] = [
  {
    company: "Utbildningsradion (UR)",
    title: "Senior Developer",
    dates: { start: "Jun 2025", end: "Jun 2026" },
    summary:
      'Continued development of streaming service urplay.se and UR\'s in-house CMS, "Edith."',
    highlights: [
      "Built guided onboarding flows for the platform.",
      "Built a new teacher login using Next-Auth, Keycloak, and Zod.",
      'Delivered personalized content via a recommendations API (EBU\'s "Peach").',
      "Maintained a strong WCAG accessibility focus throughout.",
      "Used Claude Code throughout for codegen, documentation, and debugging.",
    ],
    tech: [
      "Next.js",
      "TypeScript",
      "React",
      "Node.js",
      "Next-Auth",
      "Keycloak",
      "Zod",
      "Playwright",
      "Prisma",
      "Jest",
      "React Query",
      "Claude Code",
    ],
  },
  {
    company: "Hemnet",
    title: "Senior Developer",
    dates: { start: "Sep 2021", end: "Jun 2025" },
    summary:
      "Frontend development on hemnet.se, Sweden's largest real-estate platform.",
    highlights: [
      "Contributed to the migration from Rails to Next.js/TypeScript.",
      "Owned the news articles/advertorials platform and its CMS.",
      "Built and maintained a component library and design system in Storybook, with a WCAG focus.",
    ],
    tech: [
      "Next.js",
      "React",
      "TypeScript",
      "GraphQL",
      "Apollo Client",
      "Playwright",
      "Jest",
      "SCSS",
      "Ruby on Rails",
      "Contentful",
      "Storybook",
    ],
  },
  {
    company: "KTH Royal Institute of Technology",
    title: "Developer",
    dates: { start: "Aug 2018", end: "Sep 2021" },
    summary: "Maintained kth.se and internal tools.",
    highlights: [
      "Built and maintained the university's design system.",
      "Migrated the site from Inferno.js to React.",
    ],
    tech: ["React", "Inferno.js"],
  },
];

export const earlierRoles: CondensedRole[] = [
  {
    company: "Ving / Thomas Cook",
    title: "Developer",
    dates: { start: "Jun 2017", end: "Aug 2018" },
  },
  {
    company: "Fröjd Agency",
    title: "Developer",
    dates: { start: "Jan 2016", end: "Jun 2017" },
  },
  {
    company: "KTH Royal Institute of Technology (internship)",
    title: "Developer",
    dates: { start: "Sep 2015", end: "Dec 2015" },
  },
];
