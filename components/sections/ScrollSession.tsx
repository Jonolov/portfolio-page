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
import {
  BLOCK_MARK_COLS,
  BLOCK_MARK_ROWS,
  blockMarkCells,
} from "./block-mark";

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
  const markCells = blockMarkCells();

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

        // Terminal clears, then the mark assembles as the finale.
        const markWrap = scope.querySelector<HTMLElement>("[data-session-mark]");
        const markGrid = scope.querySelector<HTMLElement>("[data-mark-grid]");
        const markCellEls = gsap.utils.toArray<HTMLElement>("[data-mark-cell]");

        // Static baseline shows the mark in flow; for the scrub, overlay it.
        gsap.set(markWrap, { position: "absolute", inset: 0 });

        tl.addLabel("clear", "mark+=0.6")
          .to(
            [
              ...cmdTexts.slice(0, -1),
              ...prompts.slice(0, -1),
              ...outputs,
              scrollbackEl,
            ],
            { opacity: 0, duration: 0.4 },
            "clear",
          )
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

        // A scanline sweeps across the assembled mark once.
        const scan = scope.querySelector<HTMLElement>("[data-scanline]");
        if (scan && markGrid) {
          tl.set(scan, { opacity: 1, y: -4 }, "assemble+=0.5")
            .to(scan, {
              y: markGrid.offsetHeight + 4,
              duration: 0.3,
              ease: "none",
            })
            .to(scan, { opacity: 0, duration: 0.08 });
        }

        tl.addLabel("end", "+=0.5");

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
          <div className="relative min-h-[17rem] overflow-hidden">
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
                <span
                  data-scanline
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-accent opacity-0"
                />
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
