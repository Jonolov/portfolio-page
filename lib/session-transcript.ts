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
  // The role line often carries a trailing "— React, Next.js, …" tech list;
  // `cat stack.txt` covers that, so keep the whoami line to the title.
  const title = data.roleLine.split(/\s+[—–-]\s+/)[0];
  const lines: TranscriptLine[] = [
    { kind: "command", text: "whoami" },
    { kind: "output", text: `${data.name}, ${title}` },
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
