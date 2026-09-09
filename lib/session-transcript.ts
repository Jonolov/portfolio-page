export interface ScrollSessionData {
  name: string;
  roleLine: string;
  companies: string[];
  skills: string[];
}

export interface TranscriptLine {
  kind: "command" | "output";
  text: string;
}

export function buildTranscript(data: ScrollSessionData): TranscriptLine[] {
  const lines: TranscriptLine[] = [
    { kind: "command", text: "whoami" },
    { kind: "output", text: `${data.name} — ${data.roleLine}` },
    { kind: "command", text: "ls ~/work" },
    ...data.companies.map(
      (c): TranscriptLine => ({ kind: "output", text: c.toLowerCase() }),
    ),
    { kind: "command", text: "cat stack.txt" },
  ];
  if (data.skills.length > 0) {
    lines.push({
      kind: "output",
      text: data.skills.map((s) => s.toLowerCase()).join(" · "),
    });
  }
  lines.push({ kind: "command", text: "render --mark" });
  return lines;
}
