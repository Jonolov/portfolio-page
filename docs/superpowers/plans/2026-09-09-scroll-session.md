# ScrollSession Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `ScrollSession` — a new pinned section between Projects and Contact that scroll-scrubs a terminal "session" (whoami / ls ~/work / cat stack.txt) and ends by assembling the `J` brand mark, as a deliberate GSAP / ScrollTrigger showcase.

**Architecture:** A `"use client"` section renders a static, SSR'd terminal transcript plus the assembled mark (the accessible / no-JS / reduced-motion baseline). `useGSAP` (`@gsap/react`), wrapped in `gsap.matchMedia()`, enhances those same nodes with a pinned, scrubbed master timeline (ScrollTrigger pin + scrub + snap, SplitText typing, staggered reveals). Under `prefers-reduced-motion: reduce` — or no JS — nothing pins and the full transcript shows at once. Loaded from `app/page.tsx` via `next/dynamic` (SSR on).

**Tech Stack:** Next.js 16.3.2 (App Router), React 19.2, TypeScript, Tailwind v4, `gsap` 3.15 + `@gsap/react` 2.1, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-09-scroll-session-design.md` — read it alongside this plan.

## Global Constraints

- **Branch:** all work on `feat/scroll-session` (branched from `main`).
- **NO push to `main` / production without Jon's explicit approval.** Branch + preview deploy only. This overrides the finishing-a-development-branch menu — present it, but do not merge on your own initiative.
- **Next.js is 16.3.2** — consult `node_modules/next/dist/docs/` before Next-specific code. Commit any `AGENTS.md` block `next dev` rewrites.
- **GSAP imports:** `import gsap from "gsap"`, `import { ScrollTrigger } from "gsap/ScrollTrigger"`, `import { SplitText } from "gsap/SplitText"`, `import { useGSAP } from "@gsap/react"`. Register once: `gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)`. GSAP 3.13+ ships these plugins in the public package under the no-charge license — no membership, no separate install.
- **All animation lives inside `gsap.matchMedia()`** keyed on `"(prefers-reduced-motion: no-preference)"`. The `reduce` branch creates **no** ScrollTrigger, **no** pin, **no** SplitText — the static transcript and assembled mark just sit there.
- **`useGSAP(fn, { scope: containerRef })`** for all setup — it reverts everything (matchMedia contexts included) on unmount and is StrictMode-safe. Any `SplitText` instance is reverted in the callback's returned cleanup.
- **Section:** `id="session"`, **not** added to `Nav`'s `navItems`.
- **Styling:** Console Status — Martian Mono (`font-mono`), the terminal-window chrome from `components/sections/Contact.tsx` (traffic-light dots, `$ ` prompt in accent). Use the page's own tokens (`--background`/`--foreground`/`--accent`), not the inverting band tokens.
- **`next/dynamic` with `ssr: true`** (the default) — the transcript must server-render; only the GSAP client chunk defers. Do **not** pass `ssr: false`.
- **Performance bar:** no Lighthouse regression from ~98; no new CLS (ScrollTrigger's pin spacer, not layout mutation).
- **Unit tests:** Vitest, colocated `*.test.ts`. **Animation choreography is not unit-tested** and not asserted by tween value in e2e — only the pure transcript builder is TDD'd; the section gets structural/coarse e2e plus explicit manual verification steps.
- **Commit after every task.** End every commit message with:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01TfFoiZqJSarsptVVAz5D5b
  ```

---

## File Structure

**Created:**

| Path | Responsibility |
| --- | --- |
| `lib/session-transcript.ts` | `buildTranscript(props)` — pure: CMS-derived props → ordered `TranscriptLine[]`. |
| `lib/session-transcript.test.ts` | Unit tests for the builder. |
| `components/sections/ScrollSession.tsx` | `"use client"` — static transcript + `J` mark markup; GSAP scrub enhancement via `useGSAP` + `matchMedia`. |
| `components/sections/block-mark.ts` | The `J` block-glyph grid template + a helper that returns positioned cells. |
| `tests/e2e/scroll-session.spec.ts` | Structural e2e. |

**Modified:**

| Path | Change |
| --- | --- |
| `app/page.tsx` | `next/dynamic` import of `ScrollSession`; render between `<Projects>` and `<Contact>` with `name` / `roleLine` / `companies` / `skills` props. |
| `package.json` | add `gsap`, `@gsap/react`. |
| `tests/e2e/reduced-motion.spec.ts` | add: section not pinned, transcript + mark visible statically. |
| `tests/e2e/a11y.spec.ts` | add: axe scan with the section in view. |
| `README.md` | note the section + GSAP in the stack. |

---

## Task 1: `lib/session-transcript.ts`

**Files:**
- Create: `lib/session-transcript.ts`, `lib/session-transcript.test.ts`

**Interfaces:**
- Produces:
  ```ts
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
  export function buildTranscript(data: ScrollSessionData): TranscriptLine[];
  ```

- [ ] **Step 1: Write the failing test**

```ts
// lib/session-transcript.test.ts
import { describe, expect, it } from "vitest";
import { buildTranscript, type ScrollSessionData } from "@/lib/session-transcript";

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
      expect(text(lines)).toContain(company);
    }
  });

  it("prints the skills after `cat stack.txt` and ends with `render --mark`", () => {
    const lines = buildTranscript(base);
    expect(text(lines)).toContain("cat stack.txt");
    for (const skill of base.skills) expect(text(lines)).toContain(skill);
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
```

- [ ] **Step 2: Run it, verify it fails**

Run: `pnpm test lib/session-transcript.test.ts`
Expected: FAIL — cannot resolve `@/lib/session-transcript`.

- [ ] **Step 3: Implement**

```ts
// lib/session-transcript.ts
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
```

- [ ] **Step 4: Run it, verify it passes**

Run: `pnpm test lib/session-transcript.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/session-transcript.ts lib/session-transcript.test.ts
git commit -m "feat: add the session transcript builder for ScrollSession"
```

---

## Task 2: Static `ScrollSession` + page wiring

**Files:**
- Create: `components/sections/ScrollSession.tsx`
- Create: `tests/e2e/scroll-session.spec.ts`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `buildTranscript`, `ScrollSessionData` from `@/lib/session-transcript`.
- Produces: `default` export `ScrollSession(props: ScrollSessionData)` — a `<section id="session">`.

- [ ] **Step 1: Install GSAP (used from Task 3 on, added now so the import in later tasks resolves)**

```bash
pnpm add gsap @gsap/react
```

Run: `node -e "const g=require('gsap'); console.log(typeof g.gsap || typeof g.default || typeof g); const st=require('gsap/ScrollTrigger'); const sp=require('gsap/SplitText'); console.log('ScrollTrigger' in st, 'SplitText' in sp)"`
Expected: prints a type and `true true` — confirms the plugin subpaths exist in this version. If `SplitText` is not resolvable, check `node_modules/gsap/` for the actual filename and adjust the import path in Task 3.

- [ ] **Step 2: Write the failing e2e test**

```ts
// tests/e2e/scroll-session.spec.ts
import { expect, test } from "@playwright/test";
import { profile } from "@/content/profile";
import { experience } from "@/content/experience";
import { skills } from "@/content/skills";

const firstCompany = experience[0].company.toLowerCase();
const firstSkill = skills[0].skills[0].toLowerCase();

test.describe("scroll session", () => {
  test("renders the transcript content statically", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#session");
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
    await expect(section.getByText("whoami", { exact: false })).toBeVisible();
    await expect(section.getByText(firstCompany, { exact: false })).toBeVisible();
    await expect(section.getByText(firstSkill, { exact: false })).toBeVisible();
  });

  test("contact is still reachable by scrolling past the pinned section", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("link", { name: profile.contact.email }),
    ).toBeInViewport();
  });
});
```

- [ ] **Step 3: Run it, verify it fails**

Run: `pnpm exec playwright test tests/e2e/scroll-session.spec.ts`
Expected: FAIL — `#session` not found.

- [ ] **Step 4: Implement the static section**

```tsx
// components/sections/ScrollSession.tsx
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
            className="flex items-center gap-1.5 border-b border-foreground/15 px-4 py-2.5 text-xs text-foreground/50"
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
        <p className="mt-3 text-xs text-foreground/50">
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
```

(The `data-session-mark` node stays empty in the static baseline — Task 5 fills it. The static transcript alone is a complete, readable fallback.)

- [ ] **Step 5: Wire into `app/page.tsx`**

Add near the top:
```tsx
import dynamic from "next/dynamic";
const ScrollSession = dynamic(
  () => import("@/components/sections/ScrollSession"),
);
```

In the returned JSX, between `<Projects …/>` and `<Contact …/>`:
```tsx
<ScrollSession
  name={profile.name}
  roleLine={profile.roleLine}
  companies={experience.slice(0, 4).map((r) => r.company)}
  skills={skillGroups.flatMap((g) => g.skills).slice(0, 8)}
/>
```
(`profile`, `experience`, `skillGroups` are already loaded in `Home` via the `Promise.all`.)

- [ ] **Step 6: Run tests + checks**

Run: `pnpm exec playwright test tests/e2e/scroll-session.spec.ts`
Expected: PASS (2 tests).

Run: `pnpm lint && pnpm test && pnpm build`
Expected: all pass; `pnpm build` output still lists `/` as static (the dynamic import must not force the page dynamic — if it does, drop `dynamic()` and import `ScrollSession` normally, keeping `"use client"`).

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml components/sections/ScrollSession.tsx app/page.tsx tests/e2e/scroll-session.spec.ts
git commit -m "feat: add the static ScrollSession terminal transcript"
```

---

## Task 3: GSAP scaffold — pin, scrub, snap, reduced-motion gate

**Files:**
- Modify: `components/sections/ScrollSession.tsx`
- Modify: `tests/e2e/scroll-session.spec.ts`, `tests/e2e/reduced-motion.spec.ts`

**Interfaces:**
- Consumes: `gsap`, `ScrollTrigger`, `SplitText`, `useGSAP` (imports per Global Constraints).
- Produces: no new exports. Adds a pinned ScrollTrigger to `[data-session-window]` when motion is allowed.

- [ ] **Step 1: Add the GSAP setup (trivial timeline first — prove the pin)**

At the top of `ScrollSession.tsx`, after the `"use client"` line:
```tsx
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
```

Inside the component, after `const lines = …`:
```tsx
useGSAP(
  () => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "[data-session-window]",
          start: "center center",
          end: "+=180%",
          pin: true,
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
        .from("[data-line='command']", { opacity: 0, y: 6, stagger: 0.1 })
        .addLabel("ls")
        .from("[data-line='output']", { opacity: 0, y: 6, stagger: 0.05 })
        .addLabel("cat")
        .addLabel("mark")
        .addLabel("end");
    });

    return () => mm.revert();
  },
  { scope: scopeRef },
);
```

- [ ] **Step 2: Add the pin e2e assertion**

Append to `tests/e2e/scroll-session.spec.ts`:
```ts
test("pins the terminal window while scrolling through, then releases", async ({
  page,
}) => {
  await page.goto("/");
  const win = page.locator("[data-session-window]");
  await win.scrollIntoViewIfNeeded();

  // While pinned, the window stays put across a scroll nudge.
  const box1 = await win.boundingBox();
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(200);
  const box2 = await win.boundingBox();
  expect(Math.abs((box1?.y ?? 0) - (box2?.y ?? 0))).toBeLessThan(40);

  // After scrolling well past, it has released (contact reachable).
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect(page.locator("#contact")).toBeInViewport();
});
```

- [ ] **Step 3: Add the reduced-motion assertion**

Append to `tests/e2e/reduced-motion.spec.ts` (file already sets `reducedMotion: "reduce"` context-wide):
```ts
test("scroll session is not pinned and shows the whole transcript at once", async ({
  page,
}) => {
  await page.goto("/");
  const section = page.locator("#session");
  await section.scrollIntoViewIfNeeded();

  const win = page.locator("[data-session-window]");
  await expect(win).toHaveCSS("position", /^(?!fixed).*/); // not pinned

  const viewport = page.viewportSize();
  const box = await section.boundingBox();
  expect(box?.height ?? 0).toBeLessThan((viewport?.height ?? 0) * 1.4);

  // Every command line visible without scrubbing.
  await expect(section.getByText("render --mark", { exact: false })).toBeVisible();
});
```

- [ ] **Step 4: Run tests**

Run: `pnpm exec playwright test tests/e2e/scroll-session.spec.ts tests/e2e/reduced-motion.spec.ts`
Expected: PASS. If the pin assertion is flaky, widen the `< 40` tolerance or increase the settle `waitForTimeout`; the intent is "moved far less than the scroll delta".

Run: `pnpm lint && pnpm build`
Expected: pass.

- [ ] **Step 5: Manual check**

Start the app (`pnpm dev`), scroll to the section:
- With normal motion: the window pins, the placeholder tween scrubs with scroll, snap settles, then it releases and Contact follows.
- Toggle OS "reduce motion": reload — no pin, whole transcript visible, page scrolls normally.

- [ ] **Step 6: Commit**

```bash
git add components/sections/ScrollSession.tsx tests/e2e/scroll-session.spec.ts tests/e2e/reduced-motion.spec.ts
git commit -m "feat: pin + scrub + snap scaffold for ScrollSession, reduced-motion gated"
```

---

## Task 4: The session choreography

**Files:**
- Modify: `components/sections/ScrollSession.tsx`

Replace the placeholder timeline (Task 3 Step 1) with the real one. This task is **visual-verification driven** — no new automated assertions; the Task 2/3 structural tests must keep passing.

- [ ] **Step 1: Build the choreographed timeline**

Inside the `mm.add("(prefers-reduced-motion: no-preference)", ...)` callback, replace the placeholder `tl` with:

```tsx
const scrollback = scopeRef.current!.querySelector<HTMLElement>(
  "[data-session-scrollback]",
);
const commandEls = gsap.utils.toArray<HTMLElement>("[data-line='command']");
const outputEls = gsap.utils.toArray<HTMLElement>("[data-line='output']");

// Split every command line into characters for the "typing" effect.
const splits = commandEls.map((el) =>
  SplitText.create(el, { type: "chars", charsClass: "session-char" }),
);

// Start everything hidden.
gsap.set([...commandEls, ...outputEls], { opacity: 0 });
gsap.set(
  splits.flatMap((s) => s.chars),
  { opacity: 0 },
);

const tl = gsap.timeline({
  defaults: { ease: "none" },
  scrollTrigger: {
    trigger: "[data-session-window]",
    start: "center center",
    end: "+=180%",
    pin: true,
    scrub: 1,
    snap: {
      snapTo: "labels",
      duration: { min: 0.1, max: 0.3 },
      ease: "power1.inOut",
    },
  },
});

// helper: reveal one command (prompt fade + char stagger), then its outputs
const frame = (
  label: string,
  cmd: HTMLElement,
  chars: Element[],
  outs: HTMLElement[],
) => {
  tl.addLabel(label)
    .to(cmd, { opacity: 1, duration: 0.4 })
    .to(chars, { opacity: 1, stagger: 0.4 / Math.max(chars.length, 1) }, "<")
    .to(outs, { opacity: 1, y: 0, stagger: 0.15, duration: 0.6 }, ">-0.1");
};

// Map transcript lines → element groups. `lines` (from buildTranscript) tells
// us how many output lines follow each command.
let outCursor = 0;
const labels = ["whoami", "ls", "cat", "mark"];
let labelIdx = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].kind !== "command") continue;
  const outCount = countOutputsAfter(lines, i);
  const cmdEl = commandEls[labelIdx];
  frame(
    labels[labelIdx],
    cmdEl,
    splits[labelIdx].chars as Element[],
    outputEls.slice(outCursor, outCursor + outCount),
  );
  outCursor += outCount;
  labelIdx++;
}

// Terminal clears before the mark frame's tail.
tl.addLabel("clear").to(
  [...commandEls.slice(0, -1), ...outputEls],
  { opacity: 0, y: -16, stagger: 0.02, duration: 0.5 },
  "mark+=0.4",
);

tl.addLabel("end");

return () => {
  splits.forEach((s) => s.revert());
  mm.revert();
};
```

Add this module-level helper near `buildTranscript`'s import (or inline it in the file):
```ts
function countOutputsAfter(
  lines: { kind: "command" | "output" }[],
  cmdIndex: number,
): number {
  let n = 0;
  for (let j = cmdIndex + 1; j < lines.length && lines[j].kind === "output"; j++) {
    n++;
  }
  return n;
}
```

- [ ] **Step 2: Add the scrollback-shift feel (optional polish)**

Between frames, nudge `[data-session-scrollback]` up so earlier lines rise like real terminal history:
```tsx
tl.to(scrollback, { y: "-=1.2em", duration: 0.3 }, "ls")
  .to(scrollback, { y: "-=1.2em", duration: 0.3 }, "cat")
  .to(scrollback, { y: "-=1.2em", duration: 0.3 }, "mark");
```
Skip if it fights the pin visually — judgement call at the dev server.

- [ ] **Step 3: Verify structural tests still pass**

Run: `pnpm exec playwright test tests/e2e/scroll-session.spec.ts tests/e2e/reduced-motion.spec.ts tests/e2e/a11y.spec.ts`
Expected: PASS. The reduced-motion test especially — confirm `SplitText` never runs under `reduce` (it's inside the `no-preference` branch).

Run: `pnpm lint && pnpm build`

- [ ] **Step 4: Manual verification (the real check)**

`pnpm dev`, scroll slowly through `#session`:
- Each command types character-by-character as you scroll; outputs reveal after.
- Snap settles on each of `whoami` / `ls` / `cat` / `mark`.
- Near the end the terminal clears (lines fly up and fade).
- Scrolling back up reverses cleanly (scrub).
- No console errors; no layout jump when the pin engages/releases.
- Screen reader / tab: the transcript still reads as plain lines (SplitText `aria` default hides the char spans — verify with VoiceOver or `document.querySelector("[data-line='command']").getAttribute("aria-label")`).

- [ ] **Step 5: Commit**

```bash
git add components/sections/ScrollSession.tsx
git commit -m "feat: choreograph the ScrollSession terminal typing sequence"
```

---

## Task 5: The `J` mark finale

**Files:**
- Create: `components/sections/block-mark.ts`
- Modify: `components/sections/ScrollSession.tsx`

- [ ] **Step 1: Define the block-glyph grid**

```ts
// components/sections/block-mark.ts
// A 5-wide × 6-tall block-glyph "J". "#" = a filled cell, " " = empty.
const GRID = [
  "#####",
  "  ###",
  "   #",
  "   #",
  "#  #",
  "###",
];

export interface Cell {
  row: number;
  col: number;
}

export function blockMarkCells(): Cell[] {
  const cells: Cell[] = [];
  GRID.forEach((line, row) => {
    [...line].forEach((ch, col) => {
      if (ch === "#") cells.push({ row, col });
    });
  });
  return cells;
}

export const BLOCK_MARK_COLS = 5;
export const BLOCK_MARK_ROWS = GRID.length;
```

(Tune `GRID` at the dev server until the `J` reads well — keep it ≤ ~24 filled cells.)

- [ ] **Step 2: Render the static assembled mark**

In `ScrollSession.tsx`, fill the `[data-session-mark]` node:
```tsx
import { blockMarkCells, BLOCK_MARK_COLS, BLOCK_MARK_ROWS } from "./block-mark";
// …
const cells = blockMarkCells();
// …
<div
  data-session-mark
  className="grid gap-0.5 pt-6"
  style={{
    gridTemplateColumns: `repeat(${BLOCK_MARK_COLS}, 0.6em)`,
    gridTemplateRows: `repeat(${BLOCK_MARK_ROWS}, 0.6em)`,
    width: "fit-content",
  }}
  aria-label={`${props.name} — mark`}
>
  {cells.map((cell, i) => (
    <span
      key={i}
      data-mark-cell
      className="bg-accent"
      style={{ gridRow: cell.row + 1, gridColumn: cell.col + 1 }}
    />
  ))}
</div>
```
The static baseline now shows an assembled `J` made of accent blocks — good for no-JS / reduced-motion.

- [ ] **Step 3: Animate the assembly in the timeline**

After the `clear` label tween in the Task 4 timeline:
```tsx
tl.addLabel("assemble", "clear+=0.3")
  .from(
    "[data-mark-cell]",
    {
      opacity: 0,
      x: () => gsap.utils.random(-120, 120),
      y: () => gsap.utils.random(-80, 80),
      rotation: () => gsap.utils.random(-90, 90),
      stagger: { each: 0.02, from: "random" },
      duration: 0.8,
      ease: "power2.out",
    },
    "assemble",
  );

// scanline sweep across the mark
const mark = scopeRef.current!.querySelector<HTMLElement>("[data-session-mark]");
if (mark) {
  const scan = document.createElement("div");
  scan.setAttribute("aria-hidden", "true");
  scan.className =
    "pointer-events-none absolute inset-x-0 h-0.5 bg-accent/80 mix-blend-screen";
  mark.style.position = "relative";
  mark.appendChild(scan);
  gsap.set(scan, { top: 0, opacity: 0 });
  tl.to(scan, { opacity: 1, duration: 0.1 }, "assemble+=0.5")
    .to(scan, { top: "100%", duration: 0.4, ease: "none" }, "<")
    .to(scan, { opacity: 0, duration: 0.1 }, ">");
}
```

Keep `end` as the last label so `snap` has a final target.

- [ ] **Step 4: Structural tests + build**

Run: `pnpm exec playwright test tests/e2e/scroll-session.spec.ts tests/e2e/reduced-motion.spec.ts`
Expected: PASS. Extend the reduced-motion test to also assert the mark is visible:
```ts
await expect(section.locator("[data-session-mark]")).toBeVisible();
```

Run: `pnpm lint && pnpm build`

- [ ] **Step 5: Manual verification**

`pnpm dev`, scroll to the end of `#session`:
- After the clear, the `J` cells fly in from scattered positions and settle into the grid.
- The scanline sweeps once, top to bottom.
- The `J` is legible and on-brand (accent blocks, monospace scale).
- Reverse scroll un-assembles cleanly.
- Reduced motion: the assembled `J` is just there, static.

- [ ] **Step 6: Commit**

```bash
git add components/sections/block-mark.ts components/sections/ScrollSession.tsx tests/e2e/reduced-motion.spec.ts
git commit -m "feat: assemble the J mark as the ScrollSession finale"
```

---

## Task 6: Accessibility, docs, final verification

**Files:**
- Modify: `tests/e2e/a11y.spec.ts`, `README.md`

- [ ] **Step 1: Add the axe assertion**

Append to `tests/e2e/a11y.spec.ts`:
```ts
test("scroll session has no WCAG violations", async ({ page }) => {
  await page.goto("/");
  await page.locator("#session").scrollIntoViewIfNeeded();
  await expect(page.locator("#session")).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

- [ ] **Step 2: Run it; fix any violation**

Run: `pnpm exec playwright test tests/e2e/a11y.spec.ts -g "scroll session"`
Expected: PASS. Likely fixes if it fails: contrast on `text-foreground/50` → bump to `/70`; ensure the `source ↗` link has discernible text; ensure `[data-session-mark]` cells (decorative) don't trip anything (they're inside an `aria-label`'d container — add `aria-hidden` to the individual cells if needed).

- [ ] **Step 3: Update `README.md`**

Under "Stack":
```md
- [GSAP](https://gsap.com) + [ScrollTrigger](https://gsap.com/scrolltrigger) for the scroll-driven `#session` set piece
```

Under "Notable bits":
```md
- **`#session`** — a scroll-scrubbed terminal sequence (GSAP ScrollTrigger pin + scrub + SplitText) that assembles the brand mark; pins only when motion is allowed, otherwise the full transcript renders at once
```

- [ ] **Step 4: Full local verification**

```bash
pnpm lint          # clean
pnpm test          # all unit pass
pnpm exec playwright test   # all e2e pass (run twice — the suite shares one dev server)
pnpm build         # succeeds; `/` still static
```

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/a11y.spec.ts README.md
git commit -m "test: a11y coverage for ScrollSession; document it"
```

- [ ] **Step 6: Push for preview — DO NOT MERGE**

```bash
git push -u origin feat/scroll-session
```

Then on the Vercel preview URL, verify:
- The scrub, snap, pin engage/release, and the mark assembly all feel right on a real deploy.
- Reduced-motion fallback (OS toggle) — no pin, full transcript.
- A Lighthouse run (mobile) — still ~98, no new CLS, LCP unchanged (the section is below the fold and `next/dynamic`'d).
- Tab through the page — `#session` transcript reads as plain lines; the `source ↗` link is reachable.

**Report the preview URL to Jon and wait for his explicit approval before any merge to `main`.**

---

## Self-Review

**1. Spec coverage**

| Spec item | Task |
| --- | --- |
| New section between Projects and Contact, `id="session"`, not in nav | Task 2 |
| CMS-driven props (`name`/`roleLine`/`companies`/`skills`) | Task 2 (page wiring) |
| Static SSR transcript baseline | Task 2 |
| `next/dynamic`, SSR on | Task 2 |
| Transcript builder, pure, unit-tested | Task 1 |
| ScrollTrigger pin + scrub + snap to labels | Task 3 |
| `gsap.matchMedia` reduced-motion gate (no pin/ST/SplitText under reduce) | Task 3 |
| `useGSAP` scoped setup + revert | Task 3 |
| Command typing via SplitText + stagger | Task 4 |
| Output reveals, scrollback shift, terminal clear | Task 4 |
| `SplitText` aria handling (transcript stays readable) | Task 4 Step 4 (verify) + Task 6 (axe) |
| `J` assembly from block glyphs, staggered `from` random | Task 5 |
| Scanline sweep | Task 5 |
| Static assembled mark for no-JS / reduced motion | Task 5 Step 2 |
| e2e: static content, contact reachable past pin, pin behaves | Task 2, Task 3 |
| e2e: reduced-motion not pinned / full transcript / mark visible | Task 3, Task 5 |
| e2e: axe clean with section in view | Task 6 |
| Perf: no LCP/CLS regression, below-fold, dynamic import | Task 2 (build check), Task 6 Step 6 (preview Lighthouse) |
| README | Task 6 |
| Branch + preview only, no merge without approval | Global Constraints, Task 6 Step 6 |

No gaps.

**2. Placeholder scan:** The Task 3 timeline is explicitly labelled "placeholder … replaced in Task 4" and Task 4 gives the full replacement — not a plan placeholder. `GRID` and `snap`/tolerance values are marked "tune at the dev server", which is correct for animation work, not hand-waving. Every code step has real code.

**3. Type consistency:**
- `ScrollSessionData` / `TranscriptLine` / `buildTranscript` — Task 1 defines, Tasks 2 & 4 consume.
- `blockMarkCells` / `BLOCK_MARK_COLS` / `BLOCK_MARK_ROWS` — Task 5 defines and consumes.
- `scopeRef` (the `useGSAP` scope) — Task 2 creates, Tasks 3–5 use.
- data-attributes (`data-session-window`, `data-session-scrollback`, `data-line`, `data-session-mark`, `data-mark-cell`) — introduced in Task 2/5 markup, selected in Tasks 3–5 timelines and the e2e specs; names consistent throughout.
