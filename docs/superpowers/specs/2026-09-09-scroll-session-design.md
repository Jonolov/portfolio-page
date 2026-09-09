# Design: ScrollSession — a GSAP scroll-driven terminal set piece

**Date:** 2026-09-09
**Status:** Approved for planning
**Branch:** `feat/scroll-session`

## Context

Second sub-project of the consultant-assignment animation work (see
[[project-ai-sdk-animation-exploration]] / the sibling Ask-panel spec). The
assignment lists "experience with web animation tools such as Framer Motion,
GSAP, and CSS animations". The site already ships Motion; this adds a
deliberate **GSAP / ScrollTrigger** showcase.

Framing agreed with Jon: **"pure craft demo"** — the job is to demonstrate
GSAP skill for the JD; pick the best showcase even if it leans decorative,
as long as it fits the Console Status identity and doesn't hurt performance
or accessibility.

**Hard rule:** this work does NOT go to `main` / production without Jon's
explicit approval. Branch + preview deploy only.

## Goals

- An unambiguous GSAP/ScrollTrigger showcase: `pin` + `scrub` + a labelled
  master timeline + `SplitText` + `stagger` + snap.
- Fits Console Status: a terminal "session" that also lightly recaps the page
  and ends by assembling the `J` brand mark.
- Content is CMS-driven, consistent with the rest of the site.
- Zero regression to accessibility (WCAG 2.1 AA, axe clean) or performance
  (Lighthouse ~98, LCP ~1.8s, no CLS).
- Full reduced-motion and no-JS fallbacks.

## Non-goals

- Not in the nav — a scroll-discovered flourish.
- Not a replacement for Motion anywhere else on the site.
- No horizontal scroll-jacking.
- Not touching the Hero (LCP-critical; a hero scroll-reveal already cost this
  project 2.6s of LCP once).
- Scrubbed tween *values* are not asserted in tests (brittle) — only
  structural / coarse outcomes.

## Approach chosen

**New dedicated section, pinned** (of four options considered):

- New section, no pin — rejected: a play-through is what Motion's
  `RevealOnScroll` already does; demonstrates nothing new.
- Enhance the Hero — rejected: LCP-critical, and a prior hero scroll-reveal
  regressed LCP by 2.6s on this project.
- Enhance Experience/Projects — rejected: pinning real content means it is
  only readable at certain scroll positions, and reduced-motion users get a
  degraded view of content they need.

A dedicated section is safe to pin because the content *is* the demo —
nothing important is hidden, and the reduced-motion fallback (show
everything at once) loses nothing.

## Placement

`app/page.tsx`, between `<Projects>` and `<Contact>` — the "extras" tail of
the one-pager, a final flourish before the Contact band's day-becomes-night
close. `id="session"` for anchoring; absent from `Nav`'s item list.

## Structure

`components/sections/ScrollSession.tsx` — a `"use client"` component that:

1. **Renders a static, SSR'd terminal transcript** (commands + outputs) and
   the assembled `J` mark. This is the accessible / no-JS / reduced-motion
   baseline. Semantic: `<section aria-labelledby>` wrapping the transcript as
   readable text.
2. **Enhances those same nodes** with a GSAP scrub timeline via `useGSAP`
   (`@gsap/react`) wrapped in `gsap.matchMedia()`.

Loaded from `app/page.tsx` via `next/dynamic` with **SSR on** (transcript
still server-renders; only the GSAP client chunk defers).

### Props (CMS-derived, passed from the page)

```ts
interface ScrollSessionProps {
  name: string;        // profile.name
  roleLine: string;    // profile.roleLine
  companies: string[]; // first ~4 from getExperience(), by position
  skills: string[];    // ~8 featured skill names
}
```

### Transcript builder — `lib/session-transcript.ts`

Pure function, unit-tested:

```ts
interface TranscriptLine {
  kind: "command" | "output";
  text: string;
}
export function buildTranscript(props: ScrollSessionProps): TranscriptLine[];
```

Produces, in order:
- `{command, "whoami"}`, `{output, "<name> — <roleLine>"}`
- `{command, "ls ~/work"}`, one `output` line per company
- `{command, "cat stack.txt"}`, `{output, "<skills joined by ' · '>"}`
- `{command, "render --mark"}`

## The scrub timeline

One `gsap.timeline()` on a `ScrollTrigger` with `pin: true`,
`scrub: 1`, `end: "+=180%"`, `snap: { snapTo: "labels", duration: {min: 0.1,
max: 0.3}, ease: "power1.inOut" }`. Labelled frames `whoami` / `ls` / `cat`
/ `mark` / `end`.

| Range | Beat |
| --- | --- |
| 0 – .06 | prompt `$ ` fades in; block cursor blinks (CSS, `motion-safe`) |
| .06 – .20 | `whoami` types — `SplitText` chars, `stagger ~0.03` |
| .20 – .28 | output `<name> — <roleLine>` wipes in L→R |
| .28 – .34 | scrollback shifts up ~1.2em; new prompt |
| .34 – .44 | `ls ~/work` types |
| .44 – .52 | company lines stagger in (y 8→0, opacity, stagger .06) |
| .52 – .58 | scrollback up; new prompt |
| .58 – .66 | `cat stack.txt` types |
| .66 – .74 | skill tokens wrap in, staggered, scale 0.9→1 |
| .74 – .80 | `render --mark` types |
| .80 – .90 | terminal clears — prior lines fly out (y -20, opacity 0, stagger .02) |
| .84 – .96 | `J` assembles: ~24 block-glyph fragments tween `from` random x/y + rotation + opacity, `stagger: { each: .02, from: "random" }` |
| .90 – .97 | a 2px scanline band sweeps top→bottom across the mark once |
| .97 – 1 | mark settles; cursor blinks beneath it; faint `↓` hint |

The `J` fragments are absolutely-positioned block-glyph spans over a target
layout; scatter→assemble via plain `gsap.from` with recorded target
positions (no `Flip` dependency).

## Accessibility

- Static transcript is always in the DOM, SSR'd, semantic — the accessible
  and no-JS baseline.
- `SplitText(el, { aria: "hidden" })` — built-in: sets `aria-hidden` on the
  char/word wrappers and restores the original text as the parent's
  accessible name, so the transcript reads as normal sentences.
- The scanline and the block-glyph fragment layer are `aria-hidden`
  decoration; the `J` also has an accessible label / the real `<Mark>`.
- axe scan with the section in view must report 0 violations
  (`wcag2a wcag2aa wcag21a wcag21aa`).

## Reduced motion

`gsap.matchMedia()`:
- `"(prefers-reduced-motion: no-preference)"` → the pinned scrub timeline.
- otherwise → **no pin, no ScrollTrigger, no SplitText.** Section is
  normal-flow height; full transcript and assembled `J` render statically.
  `matchMedia` reverts cleanly if the OS setting changes at runtime.

Consistent with the rest of the site (`MotionConfig reducedMotion="user"`,
`motion-safe:` gating everywhere).

## Performance

- `gsap` + `ScrollTrigger` + `SplitText` ≈ ~30 KB gzipped. Section is well
  below the fold — cannot affect LCP — and `next/dynamic` keeps the GSAP
  client chunk off the initial bundle (SSR stays on for the transcript).
- `useGSAP({ scope })` scopes all animations and fully reverts on unmount.
- `will-change` only on the pinned wrapper and actively-tweened layers,
  cleared on completion.
- Pin uses ScrollTrigger's spacer — no CLS.
- Bar: no Lighthouse regression from ~98; no new CLS.

## Testing

### Unit (Vitest) — `lib/session-transcript.test.ts`

- Every company and every skill appears in the output.
- `whoami` output line contains `name` and `roleLine`.
- Line order is command→output as specified; ends with `render --mark`.
- Handles a single company / a single skill / empty lists without throwing.

### E2E — `tests/e2e/scroll-session.spec.ts`

- Static content: section reachable; a company name and a skill visible; the
  `J` mark present.
- Contact still reachable by scrolling past the pinned section (guards a
  broken pin trapping scroll).
- Pin behaves (default motion): scrolling into the section, the terminal
  window stays within the viewport across a sampled scroll range, then
  releases.

### E2E — extend `tests/e2e/reduced-motion.spec.ts`

- Under `reducedMotion: "reduce"`: the section wrapper is not
  `position: fixed`; section height ≤ ~1.3× viewport; full transcript and the
  `J` mark visible without scrubbing.

### E2E — extend `tests/e2e/a11y.spec.ts`

- axe scan with the section in view → 0 violations.

## Files

**Created**

| Path | Responsibility |
| --- | --- |
| `components/sections/ScrollSession.tsx` | Static transcript + mark; GSAP scrub enhancement via `useGSAP` + `gsap.matchMedia`. |
| `lib/session-transcript.ts` + `.test.ts` | Pure transcript builder. |
| `tests/e2e/scroll-session.spec.ts` | E2E. |

**Modified**

| Path | Change |
| --- | --- |
| `app/page.tsx` | `next/dynamic` import; render between `<Projects>` and `<Contact>` with CMS props. |
| `package.json` | `gsap`, `@gsap/react`. |
| `tests/e2e/reduced-motion.spec.ts`, `tests/e2e/a11y.spec.ts` | Extend per Testing. |
| `README.md` | Note the section + GSAP in the stack. |

## Rollout

1. Branch `feat/scroll-session`. `pnpm lint`, `pnpm test`, `pnpm exec
   playwright test`, `pnpm build` green locally.
2. Push → preview deploy. Verify the scrub, snap, pin release, reduced-motion
   fallback, and a Lighthouse pass on the preview.
3. **Jon reviews the preview and explicitly approves before any merge to
   `main`.** No exceptions.

## Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| Pin traps scroll / janky release | ScrollTrigger spacer + an e2e test that Contact stays reachable past the section. |
| SplitText reads char-by-char to AT | `{ aria: "hidden" }` + static semantic transcript as the real content. |
| Bundle bloat hurts Lighthouse | Below-fold + `next/dynamic`; measure on preview. |
| CLS from the pin | ScrollTrigger spacer, not layout mutation; CLS checked on preview. |
| GSAP React StrictMode double-invoke | `useGSAP` from `@gsap/react` handles it. |
| Scrub tween values flaky in tests | Not asserted — only structural outcomes. |
| One more section lengthens a tight one-pager | Tight ~180vh pin; it's the deliberate tradeoff for a real ScrollTrigger demo. |

## Open questions

None outstanding.
