import dynamic from "next/dynamic";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import {
  getEarlierRoles,
  getExperience,
  getProfile,
  getSideProjects,
  getSkillGroups,
} from "@/lib/cms";

const ScrollSession = dynamic(
  () => import("@/components/sections/ScrollSession"),
);

function uniqueByLower(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((v) => {
    const key = v.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default async function Home() {
  const [profile, skillGroups, experience, earlierRoles, sideProjects] =
    await Promise.all([
      getProfile(),
      getSkillGroups(),
      getExperience(),
      getEarlierRoles(),
      getSideProjects(),
    ]);

  return (
    <>
      <Hero profile={profile} />
      <About paragraphs={profile.about.paragraphs} />
      <Experience experience={experience} earlierRoles={earlierRoles} />
      <Skills groups={skillGroups} />
      <Projects projects={sideProjects} />
      <ScrollSession
        name={profile.name}
        roleLine={profile.roleLine}
        companies={uniqueByLower([
          ...experience.map((r) => r.company),
          ...earlierRoles.map((r) => r.company),
        ]).slice(0, 9)}
        skills={skillGroups.flatMap((g) => g.skills.slice(0, 2)).slice(0, 8)}
      />
      <Contact contact={profile.contact} />
    </>
  );
}
