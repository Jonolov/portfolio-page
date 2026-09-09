import { describe, expect, it } from "vitest";
import {
  buildTranscript,
  type ScrollSessionData,
} from "@/lib/session-transcript";

const base: ScrollSessionData = {
  name: "Jon Stjärnström",
  roleLine: "Senior Frontend/Fullstack Developer",
  companies: ["Svensk Fastighetsförmedling", "Utbildningsradio", "Acme"],
  skills: ["React", "Next.js", "TypeScript", "Node.js"],
};

const text = (lines: ReturnType<typeof buildTranscript>) =>
  lines.map((l) => l.text).join("\n");

describe("buildTranscript", () => {
  it("opens with whoami and an output naming the person and role", () => {
    const lines = buildTranscript(base);
    expect(lines[0]).toEqual({ kind: "command", text: "whoami" });
    expect(lines[1].kind).toBe("output");
    expect(lines[1].text).toContain("Jon Stjärnström");
    expect(lines[1].text).toContain("Senior Frontend/Fullstack Developer");
  });

  it("lists every company as its own output line under `ls ~/work`", () => {
    const lines = buildTranscript(base);
    const lsIndex = lines.findIndex(
      (l) => l.kind === "command" && l.text === "ls ~/work",
    );
    expect(lsIndex).toBeGreaterThan(-1);
    for (const company of base.companies) {
      expect(text(lines).toLowerCase()).toContain(company.toLowerCase());
    }
  });

  it("prints the skills after `cat stack.txt` and ends with `render --mark`", () => {
    const lines = buildTranscript(base);
    expect(text(lines)).toContain("cat stack.txt");
    for (const skill of base.skills) {
      expect(text(lines).toLowerCase()).toContain(skill.toLowerCase());
    }
    expect(lines.at(-1)).toEqual({ kind: "command", text: "render --mark" });
  });

  it("does not throw on single-item or empty lists", () => {
    expect(() =>
      buildTranscript({ ...base, companies: ["Solo"], skills: [] }),
    ).not.toThrow();
    expect(() =>
      buildTranscript({ ...base, companies: [], skills: ["Go"] }),
    ).not.toThrow();
  });
});
