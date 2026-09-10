# Contact Flip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Contact section as a typographic sign-off built around a GSAP **Flip** moment — the nav `J` flies to screen centre, shatters into block glyphs and reassembles, and holds as the page's closing image with the contact info in plain type. No terminal-window chrome.

**Architecture:** `Contact.tsx` is rewritten to render (always, SSR) a semantic sign-off: heading, static centred block-`J` (decoration), status line, `mailto:` email CTA, company · location, LinkedIn. A separate GSAP-owned `<FlipMark>` overlay (`fixed`, `pointer-events-none`, `z-45`, `aria-hidden`) does the fly-out + shatter, driven by a ScrollTrigger on `#contact` with `toggleActions`-style play/reverse. The real nav `<Mark>` stays as the brand anchor and is only opacity-dimmed during the moment. Everything animated is behind `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`; reduced motion / no-JS get the static sign-off.

**Tech Stack:** Next.js 16.3.2 (App Router), React 19.2, TypeScript, Tailwind v4, `gsap` 3.15 + `@gsap/react` 2.1 (ScrollTrigger + Flip), Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-09-contact-flip-design.md` — read it alongside this plan.

## Global Constraints

- **Branch:** all work on `feat/contact-flip` (branched from `main`).
- **NO push to `main` / production without Jon's explicit approval.** Branch + preview deploy only. This overrides the finishing-a-development-branch menu — present it, do not merge on your own initiative.
- **`feat/scroll-session` is superseded** by this work. Do not merge or reference it. It gets deleted (local + remote) once this lands, on Jon's say-so.
- **Next.js is 16.3.2** — consult `node_modules/next/dist/docs/` before Next-specific code. Commit any `AGENTS.md` block `next dev` rewrites.
- **GSAP imports:** `import gsap from "gsap"`, `import { ScrollTrigger } from "gsap/ScrollTrigger"`, `import { Flip } from "gsap/Flip"`, `import { useGSAP } from "@gsap/react"`. Register once: `gsap.registerPlugin(useGSAP, ScrollTrigger, Flip)`. GSAP 3.13+ ships every plugin in the public package under the no-charge licence — no membership, no separate install.
- **All animation lives inside `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`.** The `reduce` branch (and no-JS) creates **no** ScrollTrigger, **no** Flip, **no** timeline — `FlipMark` stays `autoAlpha: 0`, the static `J` and contact info in `Contact.tsx` are the whole thing, the nav mark stays visible.
- **`useGSAP(fn, { scope })`** for all setup — reverts everything (matchMedia contexts included) on unmount, StrictMode-safe. Re-measure once fonts are ready: `document.fonts?.ready.then(() => ScrollTrigger.refresh())` inside the callback (fixes `next/font` layout-shift mis-measurement — learned on the ScrollSession work).
- **`FlipMark`:** `position: fixed`, `pointer-events-none`, `aria-hidden="true"`, `z-45` (over nav `z-40`, under cmdk `z-50` and the AskPanel `<dialog>` top layer).
- **`Contact.tsx` invariants** — the existing smoke tests must pass **unchanged**:
  - keeps `id="contact"`
  - renders `<a href="mailto:{email}">{email}</a>` whose visible text is exactly the email (accessible name = email)
  - the email link is in the viewport when `#contact` is scrolled into view (not buried under the giant `J` + margins)
  - reachable via the nav `contact` link (anchor to `#contact`)
  If a smoke selector genuinely must change (e.g. heading text), change it minimally, keeping the test's intent.
- **`GROUND` constant** in `Contact.tsx`: `const GROUND: "banded" | "paper" = "banded";` — one line, both variants built, Jon picks on the preview, the loser is deleted before merge.
- **`FlipMark` + the static `J` are both `aria-hidden` decoration.** No accessible label on the mark — the page `<h1>` and nav carry the identity. JS only toggles opacity between them.
- **Performance bar:** no Lighthouse regression from ~98; no new CLS. The static `J` reserves the centre space so `FlipMark` fading in over it shifts nothing; the fly-out animates `transform`/opacity only.
- **Unit tests:** Vitest, colocated `*.test.ts`. Only the `blockMarkCells()` helper is unit-tested; the animation is visual-verification driven with structural-only e2e.
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
| `components/contact/block-mark.ts` | The `J` block-glyph grid + `blockMarkCells()` — canonical home. |
| `components/contact/block-mark.test.ts` | Unit test for the grid. |
| `components/contact/FlipMark.tsx` | `"use client"` GSAP-owned overlay: dock over the nav mark, fly to centre, shatter → reassemble, reveal contact copy; driven by a ScrollTrigger on `#contact`. |
| `tests/e2e/contact-flip.spec.ts` | Structural e2e. |

**Modified:**

| Path | Change |
| --- | --- |
| `components/sections/Contact.tsx` | Full rewrite — typographic sign-off, static centred `J`, `GROUND` switch, no terminal chrome. |
| `components/Nav.tsx` | `data-nav-mark` on the `<Mark>` wrapper. No behaviour change. |
| `app/layout.tsx` | `next/dynamic` import of `FlipMark`; render it beside `<AskLauncher />`. |
| `app/globals.css` | Only if a `--contact-*` token pair is needed for the ground switch (prefer Tailwind classes + the existing `--band-*` tokens; add nothing if avoidable). |
| `package.json` | add `gsap`, `@gsap/react`. |
| `tests/e2e/smoke.spec.ts` | Only if a selector breaks on the rewrite — minimal, intent-preserving. |
| `tests/e2e/reduced-motion.spec.ts`, `tests/e2e/a11y.spec.ts` | Extend per Testing. |
| `README.md` | Swap the ScrollSession "notable bit" for the Contact Flip; keep the GSAP stack line. |

---

## Task 1: Dependencies, block-mark helper, nav hook

**Files:**
- Modify: `package.json`, `components/Nav.tsx`
- Create: `components/contact/block-mark.ts`, `components/contact/block-mark.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface MarkCell { row: number; col: number; accent: boolean }
  export function blockMarkCells(): MarkCell[]
  export const BLOCK_MARK_COLS: number
  export const BLOCK_MARK_ROWS: number
  ```

- [ ] **Step 1: Install GSAP**

```bash
pnpm add gsap @gsap/react
```

Run: `node -e "const g=require('gsap'); const st=require('gsap/ScrollTrigger'); const f=require('gsap/Flip'); console.log(typeof g, 'ScrollTrigger' in st, 'Flip' in f)"`
Expected: prints a type and `true true`. If `gsap/Flip` is not resolvable, check `node_modules/gsap/` for the filename and adjust the import path in Task 3.

- [ ] **Step 2: Write the failing test**

```ts
// components/contact/block-mark.test.ts
import { describe, expect, it } from "vitest";
import {
  BLOCK_MARK_COLS,
  BLOCK_MARK_ROWS,
  blockMarkCells,
} from "@/components/contact/block-mark";

describe("blockMarkCells", () => {
  it("returns cells within the declared grid bounds", () => {
    const cells = blockMarkCells();
    expect(cells.length).toBeGreaterThan(10);
    expect(cells.length).toBeLessThanOrEqual(28);
    for (const c of cells) {
      expect(c.row).toBeGreaterThanOrEqual(0);
      expect(c.row).toBeLessThan(BLOCK_MARK_ROWS);
      expect(c.col).toBeGreaterThanOrEqual(0);
      expect(c.col).toBeLessThan(BLOCK_MARK_COLS);
    }
  });

  it("has an accent (green bar) row and non-accent letter cells", () => {
    const cells = blockMarkCells();
    expect(cells.some((c) => c.accent)).toBe(true);
    expect(cells.some((c) => !c.accent)).toBe(true);
    // the accent cells all sit on the same (bottom) row
    const accentRows = new Set(cells.filter((c) => c.accent).map((c) => c.row));
    expect(accentRows.size).toBe(1);
    expect([...accentRows][0]).toBe(BLOCK_MARK_ROWS - 1);
  });
});
```

- [ ] **Step 3: Run it, verify it fails**

Run: `pnpm test components/contact/block-mark.test.ts`
Expected: FAIL — cannot resolve the module.

- [ ] **Step 4: Implement**

```ts
// components/contact/block-mark.ts
// A block-glyph "J" that echoes the brand <Mark>: the letter, then the
// green underline bar. "#" = letter cell, "=" = accent (green) cell.
const GRID = [
  ".####",
  "...#.",
  "...#.",
  "...#.",
  "#..#.",
  "#..#.",
  ".##..",
  "=====",
];

export interface MarkCell {
  row: number;
  col: number;
  accent: boolean;
}

export function blockMarkCells(): MarkCell[] {
  const cells: MarkCell[] = [];
  GRID.forEach((line, row) => {
    [...line].forEach((ch, col) => {
      if (ch === "#") cells.push({ row, col, accent: false });
      else if (ch === "=") cells.push({ row, col, accent: true });
    });
  });
  return cells;
}

export const BLOCK_MARK_COLS = GRID[0].length;
export const BLOCK_MARK_ROWS = GRID.length;
```

- [ ] **Step 5: Run it, verify it passes**

Run: `pnpm test components/contact/block-mark.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Add `data-nav-mark` in `Nav.tsx`**

The nav logo link wraps `<Mark className="h-5 w-5 shrink-0" />`. Put the hook on the `<Mark>` (add a wrapping `<span data-nav-mark className="contents">` or pass a `data-nav-mark` through if `Mark` forwards props — it does not, so wrap):

```tsx
<span data-nav-mark className="inline-flex">
  <Mark className="h-5 w-5 shrink-0" />
</span>
```
Keep the surrounding `<a href="#hero" …>` and the `sr-only` "Jon Stjärnström — home" span exactly as they are.

- [ ] **Step 7: Verify nothing regressed**

Run: `pnpm lint && pnpm build`
Expected: pass; `/` still `○` (static).

Run: `pnpm exec playwright test tests/e2e/smoke.spec.ts tests/e2e/a11y.spec.ts`
Expected: all pass (the nav change is inert).

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml components/contact/block-mark.ts components/contact/block-mark.test.ts components/Nav.tsx
git commit -m "feat: add the contact block-mark grid and a nav-mark hook"
```

---

## Task 2: Rewrite `Contact.tsx` as the typographic sign-off

**Files:**
- Modify: `components/sections/Contact.tsx`
- Create: `tests/e2e/contact-flip.spec.ts`
- Maybe modify: `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: `blockMarkCells`, `BLOCK_MARK_COLS`, `BLOCK_MARK_ROWS`, `Profile["contact"]`.
- Produces: `Contact({ contact }: { contact: Profile["contact"] })` — a `<section id="contact">` with `data-*` hooks the FlipMark timeline will target.

- [ ] **Step 1: Write the failing e2e test**

```ts
// tests/e2e/contact-flip.spec.ts
import { expect, test } from "@playwright/test";
import { profile } from "@/content/profile";

test.describe("contact flip", () => {
  test("static sign-off content is present and correct", async ({ page }) => {
    await page.goto("/");
    const contact = page.locator("#contact");
    await contact.scrollIntoViewIfNeeded();
    await expect(contact).toBeVisible();

    await expect(
      contact.getByRole("heading", { level: 2 }),
    ).toBeVisible();

    const mail = page.getByRole("link", { name: profile.contact.email });
    await expect(mail).toHaveAttribute(
      "href",
      `mailto:${profile.contact.email}`,
    );
    await expect(mail).toBeInViewport();

    await expect(
      page.getByRole("link", { name: /linkedin/i }),
    ).toBeVisible();

    await expect(contact.locator("[data-contact-mark]")).toBeVisible();
  });

  test("the FlipMark overlay is idle at the top of the page", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("[data-flip-mark]")).toBeHidden();
    await expect(page.locator("[data-nav-mark]")).toBeVisible();
  });

  test("contact is still reachable by scrolling to the bottom", async ({
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

(The FlipMark assertions will pass trivially until Task 3 adds `[data-flip-mark]`; that's fine — `toBeHidden()` also passes when the element is absent.)

- [ ] **Step 2: Run it, verify the static-content test fails**

Run: `pnpm exec playwright test tests/e2e/contact-flip.spec.ts`
Expected: the static-content test FAILS on `[data-contact-mark]` (doesn't exist yet); the others may pass.

- [ ] **Step 3: Rewrite `Contact.tsx`**

```tsx
// components/sections/Contact.tsx
import type { Profile } from "@/lib/types";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import {
  BLOCK_MARK_COLS,
  BLOCK_MARK_ROWS,
  blockMarkCells,
} from "@/components/contact/block-mark";

// Swap on the preview, then delete the loser before merge.
const GROUND: "banded" | "paper" = "banded";

const banded = GROUND === "banded";

export function Contact({ contact }: { contact: Profile["contact"] }) {
  const cells = blockMarkCells();

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      data-contact
      className={
        banded
          ? "w-full bg-band-background py-24 text-band-foreground sm:py-32"
          : "w-full py-24 sm:py-32"
      }
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <h2
          id="contact-heading"
          className={`font-mono text-xs uppercase tracking-wide ${
            banded ? "text-band-foreground/60" : "text-foreground/60"
          }`}
        >
          <span className={banded ? "text-band-accent" : "text-accent"}>
            {"// "}
          </span>
          contact — get in touch
        </h2>

        {/* Static centred J — the accessible/no-JS/reduced-motion image.
            FlipMark overlays this exactly when it animates. */}
        <div
          data-contact-mark
          aria-hidden="true"
          className="mt-14 grid"
          style={{
            gridTemplateColumns: `repeat(${BLOCK_MARK_COLS}, 1.1rem)`,
            gridTemplateRows: `repeat(${BLOCK_MARK_ROWS}, 1.1rem)`,
            gap: "0.15rem",
          }}
        >
          {cells.map((cell, i) => (
            <span
              key={i}
              style={{ gridRow: cell.row + 1, gridColumn: cell.col + 1 }}
              className={
                cell.accent
                  ? banded
                    ? "bg-band-accent"
                    : "bg-accent"
                  : banded
                    ? "bg-band-foreground"
                    : "bg-foreground"
              }
            />
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center gap-3 font-mono text-sm">
          {contact.availableForConsulting ? (
            <p data-contact-reveal className={banded ? "text-band-foreground/70" : "text-foreground/70"}>
              status:{" "}
              <span className={banded ? "text-band-accent" : "text-accent"}>
                {contact.statusLine}
              </span>
            </p>
          ) : null}

          <p data-contact-reveal>
            <a
              href={`mailto:${contact.email}`}
              className={`rounded text-lg font-bold break-words underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:text-xl ${
                banded
                  ? "text-band-accent focus-visible:outline-band-foreground"
                  : "text-accent focus-visible:outline-foreground"
              }`}
            >
              {contact.email}
            </a>
          </p>

          <p data-contact-reveal className={banded ? "text-band-foreground/70" : "text-foreground/70"}>
            {contact.company.toLowerCase()} · {contact.location.toLowerCase()}
          </p>

          <p data-contact-reveal>
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                banded
                  ? "text-band-foreground/70 hover:text-band-accent focus-visible:outline-band-foreground"
                  : "text-foreground/70 hover:text-accent focus-visible:outline-foreground"
              }`}
            >
              linkedin<span className="sr-only"> (opens in a new tab)</span> ↗
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
```

Note: this drops `SectionHeading` (it had a top border that doesn't fit a centred layout) — the h2 is inlined with the same `// eyebrow — title` style. If the smoke "all sections render" test asserts a contact h2 via `SectionHeading`'s exact markup, it still finds `getByRole("heading", { level: 2 })` — no change needed.

- [ ] **Step 4: Run tests**

Run: `pnpm exec playwright test tests/e2e/contact-flip.spec.ts tests/e2e/smoke.spec.ts`
Expected: contact-flip static test PASSES; smoke tests PASS. If a smoke test fails, fix its selector minimally (keep the intent — a `mailto:` link named after the email, reachable).

Run: `pnpm lint && pnpm test && pnpm build`
Expected: all pass; `/` still static.

- [ ] **Step 5: Commit**

```bash
git add components/sections/Contact.tsx tests/e2e/contact-flip.spec.ts tests/e2e/smoke.spec.ts
git commit -m "feat: rewrite Contact as a typographic sign-off with a static J"
```

---

## Task 3: `FlipMark` — dock over the nav mark, fly to centre

**Files:**
- Create: `components/contact/FlipMark.tsx`
- Modify: `app/layout.tsx`, `tests/e2e/contact-flip.spec.ts`, `tests/e2e/reduced-motion.spec.ts`

**Interfaces:**
- Consumes: `blockMarkCells` etc; `gsap`, `ScrollTrigger`, `Flip`, `useGSAP`; the DOM hooks `[data-nav-mark]`, `#contact`, `[data-contact-mark]`.
- Produces: no exports beyond the default `FlipMark` component. Adds `[data-flip-mark]` (the overlay) and `[data-flip-cell]` (the glyphs) to the DOM.

- [ ] **Step 1: Create `FlipMark.tsx` (fly-out only — shatter comes in Task 4)**

```tsx
// components/contact/FlipMark.tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";
import {
  BLOCK_MARK_COLS,
  BLOCK_MARK_ROWS,
  blockMarkCells,
} from "@/components/contact/block-mark";

gsap.registerPlugin(useGSAP, ScrollTrigger, Flip);

export default function FlipMark() {
  const rootRef = useRef<HTMLDivElement>(null);
  const cells = blockMarkCells();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const root = rootRef.current!;
        const navMark = document.querySelector<HTMLElement>("[data-nav-mark]");
        const staticMark = document.querySelector<HTMLElement>(
          "[data-contact-mark]",
        );
        if (!navMark) return;

        // The overlay is styled (CSS) to sit centred + large. Capture that
        // state, then Flip.fit it onto the nav mark so it starts docked.
        const centredState = Flip.getState(root);
        Flip.fit(root, navMark, { scale: true, absolute: true });
        gsap.set(root, { autoAlpha: 0 });

        const tl = gsap.timeline({ paused: true });

        // Fly-out: animate from docked → the captured centred state.
        tl.add(
          Flip.from(centredState, {
            duration: 0.8,
            scale: true,
            absolute: true,
            ease: "power3.inOut",
          }),
        )
          .to(navMark, { autoAlpha: 0, duration: 0.3 }, 0)
          .set(root, { autoAlpha: 1 }, 0)
          .set(staticMark, { autoAlpha: 0 }, 0);

        ScrollTrigger.create({
          trigger: "#contact",
          start: "top 65%",
          onEnter: () => tl.play(),
          onLeaveBack: () => tl.reverse(),
        });

        document.fonts?.ready.then(() => ScrollTrigger.refresh());

        return () => tl.kill();
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      data-flip-mark
      aria-hidden="true"
      className="pointer-events-none fixed left-1/2 top-1/2 z-[45] grid -translate-x-1/2 -translate-y-1/2 opacity-0"
      style={{
        gridTemplateColumns: `repeat(${BLOCK_MARK_COLS}, min(9vw, 3.5rem))`,
        gridTemplateRows: `repeat(${BLOCK_MARK_ROWS}, min(9vw, 3.5rem))`,
        gap: "min(1.2vw, 0.4rem)",
      }}
    >
      {cells.map((cell, i) => (
        <span
          key={i}
          data-flip-cell
          style={{ gridRow: cell.row + 1, gridColumn: cell.col + 1 }}
          className={cell.accent ? "bg-band-accent" : "bg-band-foreground"}
        />
      ))}
    </div>
  );
}
```

Notes:
- `left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2` centres the overlay; `Flip.fit` then overrides transform to dock it. On `tl.reverse()` completion, GSAP restores the centred transform — verify at the dev server.
- Cell colours use `--band-*` for the banded ground; Task 5 makes this follow `GROUND`.
- **Fallback (if `Flip.from` fights the paused/reversible timeline):** replace the `Flip.from(...)` add with a measured tween:
  ```ts
  const nav = navMark.getBoundingClientRect();
  const me = root.getBoundingClientRect();
  gsap.set(root, {
    x: nav.left + nav.width / 2 - (me.left + me.width / 2),
    y: nav.top + nav.height / 2 - (me.top + me.height / 2),
    scale: nav.width / me.width,
    transformOrigin: "center center",
  });
  tl.to(root, { x: 0, y: 0, scale: 1, duration: 0.8, ease: "power3.inOut" });
  ```
  Keep `Flip.fit` for the resize re-dock either way (Task 6 polish).

- [ ] **Step 2: Wire into `app/layout.tsx`**

```tsx
import dynamic from "next/dynamic";
const FlipMark = dynamic(() => import("@/components/contact/FlipMark"));
```
Render it just after `<AskLauncher />`, still inside `<CommandPaletteProvider>` (it needs no context but the placement is tidy):
```tsx
<AskLauncher />
<FlipMark />
```

- [ ] **Step 3: Extend the e2e**

`tests/e2e/contact-flip.spec.ts` — add:
```ts
test("the mark flies to centre when contact enters, docks back on scroll up", async ({
  page,
}) => {
  await page.goto("/");
  const overlay = page.locator("[data-flip-mark]");
  await expect(overlay).toBeHidden();

  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect(overlay).toBeVisible();
  // it's large and roughly centred
  const box = await overlay.boundingBox();
  const vp = page.viewportSize()!;
  expect((box?.width ?? 0)).toBeGreaterThan(vp.width * 0.1);
  expect(Math.abs((box!.x + box!.width / 2) - vp.width / 2)).toBeLessThan(
    vp.width * 0.15,
  );

  // scroll back to the top → it docks away
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(overlay).toBeHidden();
});
```

`tests/e2e/reduced-motion.spec.ts` — add (file already sets `reducedMotion: "reduce"`):
```ts
test("contact flip: no overlay, static J shown, nav mark stays", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-flip-mark]")).toBeHidden();
  await expect(page.locator("#contact [data-contact-mark]")).toBeVisible();
  await expect(page.locator("[data-nav-mark]")).toBeVisible();

  const vp = page.viewportSize()!;
  const box = await page.locator("#contact").boundingBox();
  expect(box?.height ?? 0).toBeLessThan(vp.height * 1.6);
});
```

- [ ] **Step 4: Run tests**

Run: `pnpm exec playwright test tests/e2e/contact-flip.spec.ts tests/e2e/reduced-motion.spec.ts`
Expected: PASS. If the "flies to centre" test is flaky on timing, add a short `await page.waitForTimeout(900)` after `scrollIntoViewIfNeeded` (the fly-out is ~0.8s) — the intent is "eventually large and centred".

Run: `pnpm lint && pnpm build`
Expected: pass; `/` static.

- [ ] **Step 5: Manual check (dev server)**

`pnpm dev`, scroll to the bottom:
- The nav `J` fades as a big `J` arrives at centre; no frame with both visible.
- Scroll back up → the big `J` shrinks/moves back toward the nav and the nav `J` returns.
- Resize the window while at the top — scroll down again, the dock origin still tracks the nav mark (or note it for Task 6).
- Reduced motion (OS toggle): no overlay, the static `J` sits in `#contact`, nav `J` stays.
- No console errors.

- [ ] **Step 6: Commit**

```bash
git add components/contact/FlipMark.tsx app/layout.tsx tests/e2e/contact-flip.spec.ts tests/e2e/reduced-motion.spec.ts
git commit -m "feat: FlipMark flies the nav mark to centre on the contact hand-off"
```

---

## Task 4: Shatter → reassemble, and the contact-copy reveal

**Files:**
- Modify: `components/contact/FlipMark.tsx`

Visual-verification driven — no new automated assertions; Task 2/3 structural tests must keep passing.

- [ ] **Step 1: Extend the timeline**

Inside the `mm.add` callback, after the fly-out is added to `tl`:

```ts
const glyphs = gsap.utils.toArray<HTMLElement>("[data-flip-cell]");

// Shatter → reassemble: as the mark lands, the glyphs scatter from random
// offsets and settle into the grid.
tl.from(
  glyphs,
  {
    x: () => gsap.utils.random(-180, 180),
    y: () => gsap.utils.random(-140, 140),
    rotation: () => gsap.utils.random(-160, 160),
    opacity: 0,
    stagger: { each: 0.02, from: "random" },
    duration: 0.7,
    ease: "power3.out",
  },
  ">-0.15", // overlap the tail of the fly-out
);

// Contact copy rises in.
tl.from(
  "#contact [data-contact-reveal]",
  { y: 16, autoAlpha: 0, stagger: 0.08, duration: 0.5, ease: "power2.out" },
  "<0.1",
);
```

- [ ] **Step 2: Make the static contact copy start hidden only when animated**

The `[data-contact-reveal]` elements are SSR-visible (reduced motion / no-JS need them). In the `no-preference` branch, before building `tl`, hide them so the `from` has somewhere to animate from:
```ts
gsap.set("#contact [data-contact-reveal]", { autoAlpha: 0, y: 16 });
```
`tl.reverse()` on scroll-up returns them to hidden — acceptable (you're leaving the section). Confirm they're visible again if you scroll back down (the `from` re-plays).

- [ ] **Step 3: Structural tests still pass**

Run: `pnpm exec playwright test tests/e2e/contact-flip.spec.ts tests/e2e/reduced-motion.spec.ts tests/e2e/a11y.spec.ts`
Expected: PASS. In particular the reduced-motion test — the `gsap.set(... autoAlpha:0)` on the reveal copy must **only** run in the `no-preference` branch, so under `reduce` the copy stays visible.

Run: `pnpm lint && pnpm build`

- [ ] **Step 4: Manual verification**

`pnpm dev`, scroll to the bottom slowly:
- Fly-out → glyphs scatter and snap into the `J` → contact copy rises in, in that order, reading as one motion.
- Reverse scroll un-does it cleanly (copy fades, `J` returns to nav).
- The `mailto:` link is on screen and clickable once settled.
- Screen reader / tab: `#contact` still reads heading → status → email → location → linkedin; the `J`s are silent.

- [ ] **Step 5: Commit**

```bash
git add components/contact/FlipMark.tsx
git commit -m "feat: shatter-and-reassemble the J, then reveal the contact copy"
```

---

## Task 5: Ground variants — "banded" and "paper"

**Files:**
- Modify: `components/sections/Contact.tsx`, `components/contact/FlipMark.tsx`

- [ ] **Step 1: `Contact.tsx` already branches on `GROUND`** (Task 2). Verify both render:

Set `const GROUND = "paper"`, run `pnpm dev`, check `#contact` — light background, `J` in `foreground`/`accent`, links readable. Set back to `"banded"`, check — dark band, `J` in `band-*`, links readable. Fix any contrast/spacing issue in whichever variant needs it.

- [ ] **Step 2: `FlipMark.tsx` follows the ground**

The FlipMark cells are hard-coded to `--band-*` in Task 3. Make them read the same choice. Simplest: export the constant from `Contact.tsx` or a shared module and import it in `FlipMark`:
```ts
// components/contact/ground.ts
export const CONTACT_GROUND: "banded" | "paper" = "banded";
```
Import in both `Contact.tsx` and `FlipMark.tsx`; delete the local `GROUND` in `Contact.tsx`.

In `FlipMark.tsx`:
```tsx
className={
  cell.accent
    ? CONTACT_GROUND === "banded" ? "bg-band-accent" : "bg-accent"
    : CONTACT_GROUND === "banded" ? "bg-band-foreground" : "bg-foreground"
}
```

- [ ] **Step 3: Banded colour-flip on landing (banded only)**

In the `no-preference` branch, when `CONTACT_GROUND === "banded"`, the glyphs start in the page's `--foreground`/`--accent` (matching the nav mark on the light page) and tween to `--band-*` as they land over the dark section:
```ts
if (CONTACT_GROUND === "banded") {
  gsap.set(glyphs, {
    backgroundColor: (i, el) =>
      el.dataset.accent === "true"
        ? "var(--accent)"
        : "var(--foreground)",
  });
  tl.to(
    glyphs,
    {
      backgroundColor: (i, el) =>
        el.dataset.accent === "true"
          ? "var(--band-accent)"
          : "var(--band-foreground)",
      duration: 0.4,
      stagger: { each: 0.01, from: "random" },
    },
    ">-0.2",
  );
}
```
Add `data-accent={cell.accent}` to each `[data-flip-cell]` span so the function-based value can branch. (`paper` ground: skip this — the mark stays one colour set the whole way.)

- [ ] **Step 4: Tests + build**

Run: `pnpm lint && pnpm test && pnpm exec playwright test tests/e2e/contact-flip.spec.ts tests/e2e/reduced-motion.spec.ts`
Expected: PASS with `CONTACT_GROUND` at its default. Quickly flip it to `"paper"`, re-run the two specs, flip back — both variants pass.

Run: `pnpm build`

- [ ] **Step 5: Commit**

```bash
git add components/sections/Contact.tsx components/contact/FlipMark.tsx components/contact/ground.ts
git commit -m "feat: banded/paper ground switch for the contact sign-off"
```

---

## Task 6: Accessibility, resize dock, docs, final verification

**Files:**
- Modify: `components/contact/FlipMark.tsx`, `tests/e2e/a11y.spec.ts`, `README.md`

- [ ] **Step 1: Resize re-dock**

In the `no-preference` branch, re-fit the docked origin when layout changes and the timeline is at the start (reader hasn't reached contact):
```ts
const onRefresh = () => {
  if (tl.progress() === 0 && !tl.isActive()) {
    Flip.fit(root, navMark, { scale: true, absolute: true });
    gsap.set(root, { autoAlpha: 0 });
  }
};
ScrollTrigger.addEventListener("refreshInit", onRefresh);
// in cleanup:
ScrollTrigger.removeEventListener("refreshInit", onRefresh);
```

- [ ] **Step 2: Add the axe assertion**

`tests/e2e/a11y.spec.ts` — add:
```ts
test("contact sign-off has no WCAG violations", async ({ page }) => {
  await page.goto("/");
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect(page.locator("#contact")).toBeVisible();
  await page.waitForTimeout(1000); // let the fly-out + reveal settle

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

- [ ] **Step 3: Run it; fix any violation**

Run: `pnpm exec playwright test tests/e2e/a11y.spec.ts -g "contact sign-off"`
Expected: PASS. Likely fixes: text opacity below the 4.5:1 line (bump `/60` → `/70`); confirm every `[data-flip-cell]` and `[data-contact-mark]` cell inherits `aria-hidden` from the container (axe should not see them as content).

- [ ] **Step 4: Update `README.md`**

Replace the ScrollSession "notable bit" (if present on this branch it is not — it was never merged) — add:
```md
- **Contact sign-off** — the nav brand mark flies to screen centre (GSAP Flip), shatters into block glyphs and reassembles as the closing image; static and unanimated under `prefers-reduced-motion`
```
Under "Stack", ensure the GSAP line is present:
```md
- [Motion](https://motion.dev) for section reveals; [GSAP](https://gsap.com) Flip + ScrollTrigger for the contact sign-off
```

- [ ] **Step 5: Full local verification**

```bash
pnpm lint                    # clean
pnpm test                    # all unit pass
pnpm exec playwright test    # all e2e pass (run twice — shared dev server)
pnpm build                   # succeeds; / still ○ static
```

- [ ] **Step 6: Commit**

```bash
git add components/contact/FlipMark.tsx tests/e2e/a11y.spec.ts README.md
git commit -m "test: a11y + resize handling for the contact flip; document it"
```

- [ ] **Step 7: Push for preview — DO NOT MERGE**

```bash
git push -u origin feat/contact-flip
```

On the Vercel preview, verify:
- The fly-out / shatter / reveal feel right on a real deploy; the dock-back on scroll-up is clean; no double-mark frame.
- Resize mid-page, scroll down — dock origin still aligns with the nav mark.
- Toggle `CONTACT_GROUND` between `"banded"` and `"paper"`, redeploy, compare. Delete the loser variant + its branches in the code; commit.
- Mobile Lighthouse — still ~98, no new CLS, LCP unchanged.
- Reduced motion (OS toggle) — static sign-off, nav mark in place.

**Report the preview URL to Jon and wait for explicit approval before any merge to `main`.** On merge: delete `feat/scroll-session` (local + remote).

---

## Self-Review

**1. Spec coverage**

| Spec item | Task |
| --- | --- |
| Nav `J` flies to centre via Flip | Task 3 |
| Shatter into ~24 block glyphs, reassemble | Task 4 |
| `J` holds at centre as closing image | Task 3 (timeline end state) |
| Contact info in plain type, no terminal chrome | Task 2 |
| Reverse / dock back on scroll-up | Task 3 (`onLeaveBack` → `tl.reverse()`) |
| GSAP-owned clone, no React reparenting | Task 3 (`FlipMark` is standalone) |
| `data-nav-mark` hook, dim nav mark during fly-out | Task 1 (hook) + Task 3 (dim) |
| Both grounds, one-line switch | Task 2 + Task 5 |
| Banded colour-flip on landing | Task 5 |
| `block-mark.ts` canonical home + unit test | Task 1 |
| `next/dynamic` FlipMark in layout | Task 3 |
| Reduced-motion / no-JS: static sign-off, nav mark stays | Task 2 (SSR) + Task 3 (matchMedia gate) + Task 3/4 e2e |
| `fonts.ready` refresh | Task 3 |
| Resize re-dock | Task 6 |
| Keeps `id="contact"`, `mailto:` link, reachable | Task 2 (+ Global Constraints) |
| axe clean with `#contact` in view | Task 6 |
| e2e: FlipMark idle at top; large J near contact; nav mark present | Task 2 + Task 3 |
| Perf: below-fold, dynamic, transform-only, static J reserves space | Task 2/3 + Task 6 Step 7 preview |
| README | Task 6 |
| Branch + preview, no merge without approval; supersedes scroll-session | Global Constraints + Task 6 Step 7 |

No gaps.

**2. Placeholder scan:** No "TBD" / "handle edge cases" / "similar to". Every code step has real code. The `Flip.from` uncertainty carries an explicit, complete measured-tween fallback in Task 3 Step 1 — not a placeholder.

**3. Type consistency:**
- `MarkCell` / `blockMarkCells` / `BLOCK_MARK_COLS` / `BLOCK_MARK_ROWS` — Task 1 defines; Task 2 (`Contact.tsx`) and Task 3 (`FlipMark.tsx`) consume.
- `CONTACT_GROUND` — introduced in Task 5 (`components/contact/ground.ts`), replaces the local `GROUND` in `Contact.tsx`; imported by both `Contact.tsx` and `FlipMark.tsx`.
- Data hooks — `[data-nav-mark]` (Task 1), `[data-contact-mark]` / `[data-contact]` / `[data-contact-reveal]` (Task 2), `[data-flip-mark]` / `[data-flip-cell]` / `data-accent` (Task 3 / Task 5) — names consistent across the component markup, the timeline selectors, and the e2e specs.
- `rootRef` is the `useGSAP` scope and the overlay element — one ref, Task 3.
