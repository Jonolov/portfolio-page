import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { ScrollMarquee } from "@/components/motion/ScrollMarquee";
import {
  getEarlierRoles,
  getExperience,
  getProfile,
  getSideProjects,
  getSkillGroups,
} from "@/lib/cms";

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
      <ScrollMarquee
        items={[
          "React", "Next.js", "TypeScript", "Node.js", "GraphQL",
          "Design Systems", "Accessibility", "Performance",
        ]}
      />
      <About paragraphs={profile.about.paragraphs} />
      <Experience experience={experience} earlierRoles={earlierRoles} />
      <Skills groups={skillGroups} />
      <Projects projects={sideProjects} />
      <Contact contact={profile.contact} />
    </>
  );
}
