"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import {
  buildTranscript,
  type ScrollSessionData,
} from "@/lib/session-transcript";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export default function ScrollSession(props: ScrollSessionData) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const lines = buildTranscript(props);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const scope = scopeRef.current!;
        const win = scope.querySelector<HTMLElement>("[data-session-window]")!;

        // The scope provides the scroll distance itself (tall + relative), so
        // ScrollTrigger pins with pinSpacing:false — no spacer growth to be
        // eaten by the layout's flex column.
        gsap.set(scope, { position: "relative", height: "300vh" });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scope,
            start: "top top",
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

        // Placeholder choreography — replaced in Task 4.
        tl.addLabel("whoami")
          .from("[data-line='command']", {
            opacity: 0,
            y: 6,
            stagger: 0.1,
            duration: 1,
          })
          .addLabel("ls")
          .from("[data-line='output']", {
            opacity: 0,
            y: 6,
            stagger: 0.05,
            duration: 1,
          })
          .addLabel("cat")
          .addLabel("mark")
          .addLabel("end");

        // next/font + the dynamic import settle after this effect runs;
        // re-measure once fonts are ready so start/end aren't computed at 0.
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
