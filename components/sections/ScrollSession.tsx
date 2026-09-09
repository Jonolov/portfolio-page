"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  buildTranscript,
  type ScrollSessionData,
  type TranscriptLine,
} from "@/lib/session-transcript";
import {
  BLOCK_MARK_COLS,
  BLOCK_MARK_ROWS,
  blockMarkCells,
} from "./block-mark";

gsap.registerPlugin(useGSAP, ScrollTrigger);

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
  const markCells = blockMarkCells();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const scope = scopeRef.current!;
        const win = scope.querySelector<HTMLElement>("[data-session-window]")!;
        const clips = gsap.utils.toArray<HTMLElement>("[data-cmd-clip]");
        const cmdTexts = gsap.utils.toArray<HTMLElement>("[data-cmd-text]");
        const outputs = gsap.utils.toArray<HTMLElement>("[data-line='output']");
        const prompts = gsap.utils.toArray<HTMLElement>("[data-prompt]");
        const cursors = gsap.utils.toArray<HTMLElement>("[data-cursor]");

        // The scope provides the scroll distance itself (tall + relative), so
        // ScrollTrigger pins with pinSpacing:false — no spacer growth to be
        // eaten by the layout's flex column.
        gsap.set(scope, { position: "relative", height: "280vh" });

        // Start state: only the first prompt shows; commands are clipped to
        // zero width (typed open later), outputs hidden.
        gsap.set(prompts.slice(1), { opacity: 0 });
        gsap.set(cursors, { opacity: 0 });
        gsap.set(clips, { width: 0 });
        gsap.set(outputs, { opacity: 0, y: 8 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: win,
            start: "center center", // pin the window centred in the viewport
            end: () => "+=" + Math.round(window.innerHeight * 2),
            pin: win,
            pinSpacing: false,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            scrub: 1,
            snap: {
              // rough stops: the four command frames, then the finished
              // transcript, then the assembled mark.
              snapTo: [0, 0.18, 0.36, 0.55, 0.72, 1],
              duration: { min: 0.1, max: 0.35 },
              delay: 0.08,
              ease: "power1.inOut",
            },
          },
        });

        const scrollbackEl = scope.querySelector<HTMLElement>(
          "[data-session-scrollback]",
        );

        frames.forEach((frame, fi) => {
          const outs = outputs.filter((o) => Number(o.dataset.frame) === fi);
          const label = FRAME_LABELS[fi] ?? `f${fi}`;
          tl.addLabel(label);

          if (fi > 0) {
            tl.to(prompts[fi], { opacity: 1, duration: 0.08 });
          }
          // Type it: the clip widens character-by-character (steps()), the
          // block cursor rides its trailing edge.
          tl.set(cursors[fi], { opacity: 1 });
          tl.to(clips[fi], {
            width: () => cmdTexts[fi].offsetWidth + 2,
            duration: 0.7,
            ease: `steps(${Math.max(frame.command.length, 1)})`,
          });

          if (outs.length) {
            tl.set(cursors[fi], { opacity: 0 });
            tl.to(outs, { opacity: 1, y: 0, stagger: 0.12, duration: 0.4 }, ">");
          }
          // Nudge earlier history up, like a real terminal.
          if (fi > 0 && scrollbackEl) {
            tl.to(scrollbackEl, { y: `-=${1.6 * fi}rem`, duration: 0.3 }, label);
          }
        });

        // Hold on the finished transcript for a beat before clearing.
        tl.addLabel("typed", "+=0.6");

        // Terminal clears, then the mark assembles as the finale.
        const markWrap = scope.querySelector<HTMLElement>("[data-session-mark]");
        const markCellEls = gsap.utils.toArray<HTMLElement>("[data-mark-cell]");

        // Static baseline shows the mark in flow; for the scrub, overlay it.
        gsap.set(markWrap, { position: "absolute", inset: 0 });

        tl.addLabel("clear", "typed")
          .set(cursors, { opacity: 0 }, "clear")
          .to(scrollbackEl, { opacity: 0, duration: 0.4 }, "clear")
          .addLabel("assemble", "clear+=0.15")
          .from(
            markCellEls,
            {
              opacity: 0,
              x: () => gsap.utils.random(-140, 140),
              y: () => gsap.utils.random(-90, 90),
              rotation: () => gsap.utils.random(-120, 120),
              stagger: { each: 0.03, from: "random" },
              duration: 0.9,
              ease: "power3.out",
            },
            "assemble",
          );

        tl.addLabel("end", "+=0.6");

        document.fonts?.ready.then(() => ScrollTrigger.refresh());
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
          <div className="relative min-h-[17rem] overflow-hidden">
            <div
              data-session-scrollback
              className="flex flex-col gap-1 px-5 py-6 leading-relaxed sm:px-6"
            >
              {frames.map((frame, fi) => (
                <div key={fi} className="flex flex-col gap-1">
                  <p
                    data-line="command"
                    className="flex items-baseline text-foreground/80"
                  >
                    <span aria-hidden="true" className="flex items-baseline">
                      <span data-prompt className="text-accent">
                        $&nbsp;
                      </span>
                      <span
                        data-cmd-clip
                        className="inline-block overflow-hidden align-bottom"
                      >
                        <span
                          data-cmd-text
                          className="inline-block whitespace-nowrap"
                        >
                          {frame.command}
                        </span>
                      </span>
                      <span
                        data-cursor
                        className="ml-0.5 inline-block h-[1.05em] w-[0.5em] shrink-0 translate-y-[0.15em] bg-accent opacity-0"
                      />
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
            </div>
            <div
              data-session-mark
              className="grid place-items-center px-5 py-6 sm:px-6"
              aria-label={`${props.name} — brand mark`}
              role="img"
            >
              <div
                data-mark-grid
                className="relative grid gap-0.5"
                style={{
                  gridTemplateColumns: `repeat(${BLOCK_MARK_COLS}, 0.85em)`,
                  gridTemplateRows: `repeat(${BLOCK_MARK_ROWS}, 0.85em)`,
                }}
              >
                {markCells.map((cell, i) => (
                  <span
                    key={i}
                    data-mark-cell
                    aria-hidden="true"
                    className={cell.accent ? "bg-accent" : "bg-foreground"}
                    style={{
                      gridRow: cell.row + 1,
                      gridColumn: cell.col + 1,
                    }}
                  />
                ))}
              </div>
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
