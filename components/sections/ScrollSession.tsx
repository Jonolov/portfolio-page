"use client";

import { useRef } from "react";
import {
  buildTranscript,
  type ScrollSessionData,
} from "@/lib/session-transcript";

export default function ScrollSession(props: ScrollSessionData) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const lines = buildTranscript(props);

  return (
    <section
      id="session"
      aria-labelledby="session-heading"
      className="mx-auto max-w-3xl px-6 py-16 sm:py-24"
    >
      <h2 id="session-heading" className="sr-only">
        A scroll-driven GSAP sequence
      </h2>
      <div ref={scopeRef} data-session-scope>
        <div
          data-session-window
          className="border border-foreground/15 bg-foreground/[0.03] font-mono text-sm"
        >
          <div
            className="flex items-center gap-1.5 border-b border-foreground/15 px-4 py-2.5 text-xs text-foreground/60"
            aria-hidden="true"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
            <span className="ml-2">~/session</span>
          </div>
          <div
            data-session-scrollback
            className="flex flex-col gap-1 px-5 py-6 leading-relaxed sm:px-6"
          >
            {lines.map((line, i) =>
              line.kind === "command" ? (
                <p key={i} data-line="command" className="text-foreground/80">
                  <span className="text-accent">$ </span>
                  {line.text}
                </p>
              ) : (
                <p key={i} data-line="output" className="text-foreground/70">
                  {line.text}
                </p>
              ),
            )}
            <div data-session-mark className="pt-4" aria-hidden="true" />
          </div>
        </div>
        <p className="mt-3 text-xs text-foreground/60">
          {"// scroll-driven GSAP · "}
          <a
            href="https://github.com/Jonolov/portfolio-page/blob/main/components/sections/ScrollSession.tsx"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-accent"
          >
            source
            <span className="sr-only"> (opens in a new tab)</span> ↗
          </a>
        </p>
      </div>
    </section>
  );
}
