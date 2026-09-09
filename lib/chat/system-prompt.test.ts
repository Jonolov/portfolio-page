import { describe, expect, it } from "vitest";
import { buildSystemPrompt, type ChatContent } from "@/lib/chat/system-prompt";

const base: ChatContent = {
  profile: {
    name: "Jon Stjärnström",
    roleLine: "Senior Frontend/Fullstack Developer",
    heroHook: "hook",
    about: { paragraphs: ["First para.", "Second para."] },
    contact: {
      email: "jon@example.com",
      company: "Co",
      location: "Stockholm",
      linkedin: "https://linkedin.com/in/x",
      availableForConsulting: true,
      statusLine: "available",
    },
  },
  experience: [
    {
      company: "Acme",
      title: "Lead Dev",
      dates: { start: "2022", end: "Present" },
      summary: "Led the platform team.",
      highlights: ["Shipped X", "Cut latency 40%"],
      tech: ["Next.js", "TypeScript"],
    },
  ],
  earlierRoles: [
    { company: "OldCo", title: "Dev", dates: { start: "2018", end: "2020" } },
  ],
  skills: [{ category: "Frontend", skills: ["React", "Next.js"] }],
  sideProjects: [
    {
      name: "Synth",
      description: "A web synth.",
      tech: ["Tone.js"],
      url: "https://s.example",
    },
  ],
  today: new Date("2026-09-09T12:00:00Z"),
};

describe("buildSystemPrompt", () => {
  it("includes every role, highlight, skill, and side project", () => {
    const p = buildSystemPrompt(base);
    expect(p).toContain("Acme");
    expect(p).toContain("Cut latency 40%");
    expect(p).toContain("OldCo");
    expect(p).toContain("React");
    expect(p).toContain("Synth");
  });

  it("includes the guardrail rules and the tool instruction", () => {
    const p = buildSystemPrompt(base);
    expect(p).toContain("Only use the facts");
    expect(p).toContain("Never invent employers");
    expect(p).toContain("showContactCard");
  });

  it("reflects the current date", () => {
    expect(buildSystemPrompt(base)).toContain("Today is 2026-09-09");
  });

  it("states availability both ways", () => {
    expect(buildSystemPrompt(base)).toContain("available for consulting");
    const unavailable: ChatContent = {
      ...base,
      profile: {
        ...base.profile,
        contact: { ...base.profile.contact, availableForConsulting: false },
      },
    };
    expect(buildSystemPrompt(unavailable)).toContain("not currently available");
  });

  it("does not throw on an empty side-projects list", () => {
    expect(() => buildSystemPrompt({ ...base, sideProjects: [] })).not.toThrow();
  });
});
