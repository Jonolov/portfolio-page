"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import {
  buildTranscript,
  type ScrollSessionData,
  type TranscriptLine,
} from "@/lib/session-transcript";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const FRAME_LABELS = ["whoami", "ls", "cat", "mark"];

function toFrames(lines: TranscriptLine[]) {
  const frames: { command: string; outputs: string[] }[] = [];
  for (const line of lines) {
    if (line.kind === "command") {
      frames.push({ command: line.text, outputs: [] });
    } else {
      frames.at(-1)?.outputs.push(line.text);
    }
  }
  return frames;
}

export default function ScrollSession(props: ScrollSessionData) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const frames = toFrames(buildTranscript(props));

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const scope = scopeRef.current!;
        const win = scope.querySelector<HTMLElement>("[data-session-window]")!;
        const cmdTexts = gsap.utils.toArray<HTMLElement>("[data-cmd-text]");
        const outputs = gsap.utils.toArray<HTMLElement>("[data-line='output']");
        const prompts = gsap.utils.toArray<HTMLElement>("[data-prompt]");

        // The scope provides the scroll distance itself (tall + relative), so
        // ScrollTrigger pins with pinSpacing:false — no spacer growth to be
        // eaten by the layout's flex column.
        gsap.set(scope, { position: "relative", height: "220vh" });

        const splits = cmdTexts.map((el) =>
          SplitText.create(el, {
            type: "chars",
            charsClass: "session-char",
            aria: "none", // the line has a visually-hidden accessible copy
          }),
        );

        // Start state: only the first prompt shows; everything else is hidden.
        gsap.set(prompts.slice(1), { opacity: 0 });
        gsap.set(
          splits.flatMap((s) => s.chars),
          { opacity: 0 },
        );
        gsap.set(outputs, { opacity: 0, y: 8 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: scope,
            start: "top 68px", // clear the sticky nav
            end: "bottom bottom",
            pin: win,
            pinSpacing: false,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            scrub: 1,
            snap: {
              snapTo: "labels",
              duration: { min: 0.1, max: 0.3 },
              ease: "power1.inOut",
            },
          },
        });

        const scrollbackEl = scope.querySelector<HTMLElement>(
          "[data-session-scrollback]",
        );

        frames.forEach((_, fi) => {
          const chars = splits[fi]?.chars ?? [];
          const outs = outputs.filter(
            (o) => Number(o.dataset.frame) === fi,
          );

          tl.addLabel(FRAME_LABELS[fi] ?? `f${fi}`);
          if (fi > 0) {
            tl.to(prompts[fi], { opacity: 1, duration: 0.15 });
          }
          tl.to(chars, {
            opacity: 1,
            stagger: 0.6 / Math.max(chars.length, 1),
            duration: 0.6,
          });
          if (outs.length) {
            tl.to(
              outs,
              { opacity: 1, y: 0, stagger: 0.12, duration: 0.5 },
              ">-0.05",
            );
          }
          // Nudge earlier history up, like a real terminal.
          if (fi > 0 && scrollbackEl) {
            tl.to(
              scrollbackEl,
              { y: `-=${1.6 * fi}rem`, duration: 0.3 },
              FRAME_LABELS[fi],
            );
          }
        });

        // Terminal clears before the mark's finale (Task 5).
        tl.addLabel("clear").to(
          [
            ...cmdTexts.slice(0, -1),
            ...prompts.slice(0, -1),
            ...outputs,
          ],
          { opacity: 0, y: -16, stagger: 0.02, duration: 0.4 },
          "mark+=0.5",
        );

        tl.addLabel("end", "+=0.4");

        document.fonts?.ready.then(() => ScrollTrigger.refresh());

        return () => splits.forEach((s) => s.revert());
      });

      return () => mm.revert();
    },
    { scope: scopeRef },
  );

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
          <div className="overflow-hidden">
            <div
              data-session-scrollback
              className="flex flex-col gap-1 px-5 py-6 leading-relaxed sm:px-6"
            >
              {frames.map((frame, fi) => (
                <div key={fi} className="flex flex-col gap-1">
                  <p data-line="command" className="text-foreground/80">
                    <span aria-hidden="true">
                      <span data-prompt className="text-accent">
                        $&nbsp;
                      </span>
                      <span data-cmd-text>{frame.command}</span>
                    </span>
                    <span className="sr-only">{`$ ${frame.command}`}</span>
                  </p>
                  {frame.outputs.map((out, oi) => (
                    <p
                      key={oi}
                      data-line="output"
                      data-frame={fi}
                      className="text-foreground/70"
                    >
                      {out}
                    </p>
                  ))}
                </div>
              ))}
              <div data-session-mark className="pt-4" aria-hidden="true" />
            </div>
          </div>
          <p className="border-t border-foreground/15 px-4 py-2.5 text-xs text-foreground/60">
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
      </div>
    </section>
  );
}
