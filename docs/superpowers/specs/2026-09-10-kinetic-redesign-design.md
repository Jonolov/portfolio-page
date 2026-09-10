# Design: Kinetic Redesign — colour-blocked identity + a GSAP-only motion layer

**Date:** 2026-09-10
**Status:** Approved for planning
**Branch:** `feat/kinetic-redesign` (off `main`)

## Context

The portfolio ([[project-portfolio-site]]) is a demo vehicle for a consultant
assignment that wants AI-SDK and web-animation experience
([[project-ai-sdk-animation-exploration]]). The site today is a restrained,
near-monochrome, terminal-styled page (Martian Mono display, `//` eyebrows,
`[ bracketed ]` buttons, a live clock) with light `motion/react` reveals and
one GSAP moment (the merged contact-flip).

Jon wants a "more fun" site: more colour, more GSAP, and — decided during
brainstorming — a display type and styling that **don't lean on the terminal
look**. A four-direction design exploration landed on the "kinetic
maximalist" direction, refined to use **Familjen Grotesk** with the terminal
tics stripped. Desktop + mobile mockups approved on the design canvas.

This spec covers **both** the visual redesign and the motion-layer rewrite —
they are intertwined (colour-blocked sections drive the reveals, the kinetic
name needs the new type) and ship as one branch.

**Hard rule:** branch only, clean replace. No runtime toggle. Rollback = do
not merge (or `git revert` the merge). Jon reviews the built result before
any merge to `main` / production.

## The design

**One committed look** — no OS light/dark switching. Full-bleed colour-block
sections, in page order:

| Section  | Ground            | Notes |
| ---      | ---               | --- |
| Nav      | `--field` (green) | Text `JS` mark, "Stockholm, Sweden", nav links, "Available for work" pill. No clock, no `status:` readout. Scroll-spy active-section tracking kept. |
| Hero     | green             | Kinetic name (`J`/`S` initials tinted pink/via outline), eyebrow "Stockholm · Consulting · Open", two magnetic CTAs, `⌘K` hint, ambient shards. |
| Marquee  | `--cyan`          | Infinite tech ticker, speed/direction reacts to scroll velocity. |
| About    | `--paper`         | Numbered label `01 — About` + big uppercase `<h2>`, two-column prose. |
| Experience | green           | `02 —`. Role cards stagger in; colour-pill tech tags; "show earlier roles" toggle unchanged. |
| Skills   | `--paper`         | `03 —`. Plain group headings (no `#`), colour-pill tags in a 3-col grid. |
| Projects | `--pink`          | `04 —`. Single restyled card. No reel (deferred), no "next project" placeholder. |
| Contact  | `--ink`           | `05 —`. `<ContactMark>` — big green `JS` + accent shards that burst and settle on scroll-in. "Let's build something." headline, then status / email / company·location / LinkedIn. |

**Type.** Drop `Martian_Mono`. `Familjen_Grotesk` (via `next/font/google`)
for display — headings, hero name, buttons, marquee, mark. `Archivo` stays
for body. CSS vars `--font-display`, `--font-sans`. `--font-mono` token and
every `font-mono` class removed.

**Palette** (`app/globals.css`, no `@media (prefers-color-scheme: dark)`):

```
--ink:        #0b120e   --ink-fg:    #eafbf1
--paper:      #f6f7f5   --paper-fg:  #0b120e
--field:      #0b6130   --field-fg:  #f6f7f5
--cyan:       #5cf2e6   --cyan-fg:   #0b3d24
--pink:       #ff5da2   --pink-fg:   #3a0a1f
--js-green:   #3ddc84            (contact mark only)
```

Tailwind v4 `@theme inline` maps these to `--color-*` utilities. Sections set
their own ground/foreground; no theme switching at runtime. Exact token
names are an implementation detail for the plan — the palette values are the
contract.

## Goals

- The approved kinetic look, faithfully, desktop + mobile.
- A single GSAP-owned motion layer: plugins registered once, one
  reduced-motion contract, one font-ready refresh.
- `useReveal` fully replaces `RevealOnScroll` + `Stagger`; `motion` package
  removed.
- Seven effects: kinetic name, magnetic buttons, scroll-reactive marquee,
  section reveals, ambient shard parallax, **draggable shards with inertia**,
  the contact `JS` shatter.
- Zero regression to accessibility (axe `wcag2a/2aa/21a/21aa` = 0 violations)
  or the existing smoke behaviour. Contact stays reachable; `mailto:` correct.
- Full reduced-motion and no-JS fallbacks — content always in the a11y tree,
  visible, untransformed.
- Identity surfaces updated to match: OG image, favicon, apple-touch-icon.

## Non-goals

- No runtime old/new toggle. No preview-deploy requirement in the spec (Jon
  may still push one; not a gate).
- No horizontal-scroll projects reel; no pinned role cards. Both deferred —
  the reel revisited at 2+ side projects.
- No CSS `animation-timeline: scroll()` work — that is sub-project 4, its own
  spec.
- No changes to the Ask panel / command palette **behaviour** — restyle only.
- No changes to CMS content, `/api/chat`, rate-limiting, BotID, analytics.
- No scrubbed animations — all effects are triggered, not tied 1:1 to scroll
  position. Scrubbed-value assertions are out of scope for tests.
- Keeping `motion/react` for the simple reveals — considered and rejected
  during brainstorming (Jon's call; the "which tool for which job" write-up
  can draw on git history and prior branches).

## Approach chosen

**Shared GSAP setup module + small per-effect client islands.**

`lib/gsap.ts` registers plugins once and owns the cross-cutting concerns
(`gsap.matchMedia`, `document.fonts.ready → ScrollTrigger.refresh()`). Each
signature effect is a focused `"use client"` component that receives **DOM
refs, never selector strings** (the `useGSAP({ scope })` string-scoping
gotcha from contact-flip). Section components stay server components with
small client islands where they animate.

Considered and rejected:
- **One `MotionRoot` client component** wiring everything via
  `[data-reveal]` / `[data-magnetic]` attributes on server-rendered DOM —
  fewer files, but one large imperative module, selector-based (fights
  `useGSAP` scoping), hard to test or reason about in isolation.
- **CSS scroll-timeline for reveals, GSAP for showpieces only** — smallest
  JS, best perf, but it *is* sub-project 4 with its own spec and fallback
  matrix; magnetic buttons + reactive marquee still need JS. Out of scope.

## Architecture

### Motion core

| Path | Responsibility |
| --- | --- |
| `lib/gsap.ts` | Registers `ScrollTrigger`, `SplitText`, `Draggable`, `InertiaPlugin` once (HMR-guarded). Exports `prefersReducedMotion()` and the `useReveal` hook. Central place for `gsap.matchMedia` defaults. |
| `components/motion/GsapBootstrap.tsx` | `"use client"`, rendered once in `layout.tsx` (replaces `<MotionConfig>`). On mount: `document.fonts.ready.then(() => ScrollTrigger.refresh())`. Renders nothing. |
| `useReveal(ref, opts?)` (in `lib/gsap.ts`) | Given a container ref, batch-reveals its direct children (or `[data-reveal]` descendants): `y: 16 → 0`, opacity fade, `stagger: 0.08`, `once: true`, `start: "top 85%"`. Passes the resolved element to `ScrollTrigger`, never a selector. Reduced-motion branch: `gsap.set` final state, no trigger. |

### Signature effect components (`components/motion/`)

| Path | Responsibility |
| --- | --- |
| `KineticName.tsx` | Wraps the hero `<h1>` (keeps `aria-label`, per-word initial spans). `SplitText` into chars; on load, chars settle in — short stagger, slight skew/`y`. Reduced-motion: plain text, no split. |
| `MagneticButton.tsx` | Wraps a single CTA. Fine-pointer only: `pointermove` within ~40px translates ~6px toward the cursor via a quick `gsap.to`; springs back on leave. Reduced-motion / coarse pointer: inert passthrough. |
| `ScrollMarquee.tsx` | The cyan ticker. Base loop tween; a `ScrollTrigger` `onUpdate` maps `getVelocity()` onto `tween.timeScale()` and flips direction with scroll. Content duplicated for a seamless wrap. Reduced-motion: static, no loop. |
| `ShardField.tsx` | Per-section decorative squares. Idle drift + `pointermove` parallax; `Draggable` + `InertiaPlugin` so they can be flung and settle. Config prop: shard list `{x,y,size,color,radius}`. `aria-hidden`, `pointer-events` only on the shards themselves. Reduced-motion: static shards at rest, no drag. |
| `components/contact/ContactMark.tsx` | Rebuilt from scratch (replaces `FlipMark`). Big `JS` in `--font-display` / `--js-green` + 3–4 accent shards. `ScrollTrigger` on the contact section: `onEnter` → mark scales/rotates in, shards burst outward then ease to rest; `onLeaveBack` → reverse. Triggered, not scrubbed. `aria-hidden` — the real contact heading/copy sit under it and are always in the DOM. Reduced-motion: mark + shards rendered at rest, no trigger. |

### Section / shared component changes

| Path | Change |
| --- | --- |
| `app/layout.tsx` | Fonts → `Familjen_Grotesk` + `Archivo`; remove `Martian_Mono`. Drop `<MotionConfig>`, add `<GsapBootstrap />`. Everything else (JSON-LD, skip link, palette provider, Ask panel/launcher, command palette) unchanged. |
| `app/globals.css` | New token block, delete the dark-mode `@media` block, remove `--font-mono`. Keep the `caret-blink` `@utility` (Ask-panel reduced-motion test depends on it); drop `animate-block-in` / `block-in` (nav-mark scatter goes with `BlockMark`). |
| `components/Nav.tsx` | New ground; `<Mark>` replaces `<BlockMark>`; delete the clock `useEffect` + `status:` readout; add "Available for work" pill. Keep the scroll-spy `useEffect`. Two-row mobile layout kept. |
| `components/sections/Hero.tsx` | `<KineticName>` around `<h1>`; both CTAs wrapped in `<MagneticButton>`; new eyebrow copy; `⌘K` hint as plain text + `<kbd>`; `<ShardField section="hero">`. Keeps `id`, `aria-labelledby`, `aria-label` on the name. |
| `components/sections/About.tsx` | Paper ground; `SectionHeading` (numbered) ; `useReveal` on the prose container. |
| `components/sections/Experience.tsx` | Green ground; `useReveal` staggers the `<ol>` items; `Tag` → pill variants; dates `→` become `—`; "show/hide earlier roles" toggle unchanged (smoke test must pass). |
| `components/sections/Skills.tsx` | Paper ground; plain group headings; `Tag` → pill; `useReveal`. |
| `components/sections/Projects.tsx` | Pink ground; single restyled card; `useReveal`; no placeholder card. |
| `components/sections/Contact.tsx` | Ink ground; `<ContactMark>` replaces `<BlockMark data-contact-mark>` + the `<FlipMark>` overlay in `layout.tsx`; `[data-contact-reveal]` copy kept, revealed by `useReveal`; `statusLine` → "● …"; add "Let's build something." headline. Keeps `id="contact"`, `aria-labelledby`, `mailto:` link, LinkedIn link + `sr-only` "(opens in a new tab)". |
| `components/ui/SectionHeading.tsx` | Rewrite: rotated number label (`01 — About`) + big uppercase `<h2>` in `--font-display`. Same `id` / `eyebrow` / `title` props (or `number` replaces `eyebrow` — plan decides). |
| `components/ui/Tag.tsx` | Rewrite: rounded colour-pill, `variant?: "plain" | "cyan" | "pink"` prop, default plain. |
| `components/ui/Mark.tsx` | **New.** `JS` in `--font-display`, weight 700, in a rounded box; `size` prop (nav vs any future use); palette-aware via props/tokens. `role="img"`, `aria-label="Jon Stjärnström"`. |
| `components/ui/ContactCard.tsx` | Restyle to the new palette (used by the Ask-panel `showContactCard` tool). No behaviour change. |
| `components/command-palette/AskPanel.tsx`, `AskLauncher.tsx` | Restyle only — new palette, `font-mono` → `--font-sans`/`--font-display`, keep the `motion-safe:animate-caret` class on the streaming caret (reduced-motion test). No behaviour change. |
| `app/opengraph-image.tsx` | Familjen Grotesk (fetch the Google Fonts TTF as the Martian Mono one is fetched today) + new palette + new hero treatment (drop the underlined-first-letter Martian Mono lockup). |
| `scripts/generate-icons.mjs` | Rewrite: render `JS` text lockup (rounded box, `--js-green` on `--ink`) instead of the block grid. Keep the `sharp`-from-store resolution and the 64 / 180 outputs. |
| `public/favicon.png`, `public/apple-touch-icon.png` | Regenerated by the above. |
| `README.md` | Note the redesign + GSAP-only motion; drop stale `motion/react` / `BlockMark` mentions. |

### Deleted

`components/motion/RevealOnScroll.tsx`, `components/motion/Stagger.tsx`,
`components/motion/variants.ts`, `components/contact/FlipMark.tsx`,
`components/ui/BlockMark.tsx`, `components/ui/block-mark.ts`,
`components/ui/block-mark.test.ts`, `tests/e2e/contact-flip.spec.ts`.
`motion` removed from `package.json`.

## Accessibility

- Every section renders semantic content, SSR'd, regardless of JS/motion:
  headings, prose, links, the `mailto:` CTA, LinkedIn with its `sr-only`
  note.
- All decorative elements — shards, `<ContactMark>`, the kinetic-name split
  wrappers — are `aria-hidden`; the hero `<h1>` keeps `aria-label`.
- `<ContactMark>` overlays nothing focusable; the contact heading + copy are
  real DOM under/around it, in tab order.
- New colour pairs (cyan-on-green pills, text on pink/cyan grounds) must
  clear WCAG AA — the `*-fg` tokens are chosen for this; axe verifies.
- Magnetic buttons stay real `<a>` elements; the wrapper never intercepts
  focus or activation.
- axe scan of every section in view → 0 violations
  (`wcag2a wcag2aa wcag21a wcag21aa`).

## Reduced motion

One contract, enforced by `lib/gsap.ts` and the rewritten
`reduced-motion.spec.ts`:

- Every effect wraps its GSAP work in `gsap.matchMedia()` with a
  `(prefers-reduced-motion: no-preference)` branch.
- The reduced branch runs `gsap.set(...)` to the **final** state
  immediately — no tweens, no `ScrollTrigger`, no `SplitText`, no `Draggable`.
- Result under `reducedMotion: "reduce"`: all content visible, `opacity: 1`,
  `transform: none`; the Ask-panel caret `animation-name: none`; command
  palette transition `0s`.
- No-JS: sections are plain server-rendered HTML with final styling; the
  only thing missing is motion.

## Performance

- `gsap` + `ScrollTrigger` + `SplitText` + `Draggable` + `InertiaPlugin`
  ≈ ~45 KB gzipped, offset by removing `motion` (~35 KB). Roughly flat.
- Effect components are client islands; sections stay server-rendered.
  `<ContactMark>` is below the fold — cannot affect LCP. Hero: `KineticName`
  hydrates the `<h1>` but the text is SSR'd and styled — LCP element paints
  before JS.
- All effects animate `transform` / `opacity` only. No layout thrash.
  Shards and `<ContactMark>` reserve their space (absolute within a sized
  parent) → no CLS.
- `will-change: transform` set while a timeline is active, cleared on
  complete/reverse.
- `ScrollTrigger` config uses `invalidateOnRefresh` where positions depend
  on layout; one `document.fonts.ready` refresh covers `next/font` shift.
- Bar: no Lighthouse regression from ~98, no new CLS, LCP unchanged.

## Testing

Per-phase gate: `pnpm lint && pnpm test && pnpm exec playwright test && pnpm build`.
GSAP motion verified via **Playwright headless** — the `claude-in-chrome`
MCP tab throttles `requestAnimationFrame` and shows animations frozen.

### Unit (Vitest)

- `block-mark.test.ts` deleted.
- `lib/gsap.ts` — light coverage where practical: `prefersReducedMotion()`
  reads the media query; `useReveal` sets final state (not mid-tween) under
  a mocked reduce preference. Anything needing a real layout is left to e2e.

### E2E — rewrite `tests/e2e/reduced-motion.spec.ts`

- Drop the `[data-flip-mark]` / `[data-contact-mark]` / nav-cell assertions.
- Keep/adapt: hero `<h1>` visible, `opacity: 1`, `transform: none`; every
  section `<h2>` visible + `opacity: 1` once scrolled to; experience cards
  `transform: none`; Ask-panel caret `animation-name: none`; command-palette
  transition `0s`.
- Add: `<ContactMark>` — the `JS` mark and **all** contact links visible with
  `transform: none`; `#contact` height ≤ ~1.6× viewport (no runaway spacer).

### E2E — delete `tests/e2e/contact-flip.spec.ts`

Fold any still-relevant guard (contact section height sane; email link
present) into `smoke.spec.ts` if not already covered.

### E2E — `tests/e2e/smoke.spec.ts`

Should pass as-is — keyed on `#hero`/`#about`/… ids, h1/h2/h3 roles, the
email link, the earlier-roles toggle, all preserved. If a selector breaks on
a rewrite (e.g. `#experience li > div` structure), update minimally, keeping
intent. Verify after every phase.

### E2E — `tests/e2e/a11y.spec.ts`

Re-run axe on each section in view; fix contrast violations on the new
colour combos as they surface.

### E2E — `tests/e2e/ask.spec.ts`

Behaviour unchanged — should stay green. Update only if a restyle moves a
selector it depends on.

### Manual pass

- Kinetic name settles cleanly on load; no FOUC / no layout jump when
  `SplitText` runs (font-ready refresh works).
- Magnetic buttons feel responsive, spring back, don't trap the pointer.
- Marquee speeds/reverses with scroll and never tears the loop seam.
- Shards drag and fling with inertia; parallax is subtle, not seasick.
- Contact `JS` bursts and settles on enter, reverses on scroll-up, no
  double-vision with anything.
- Mobile (390): every section, two-row nav, stacked CTAs, tag wrapping,
  marquee, contact — matches the approved mockup.
- Lighthouse mobile — ~98, no new CLS, LCP unchanged.

## Files

**Created:** `lib/gsap.ts`; `components/motion/{GsapBootstrap,KineticName,MagneticButton,ScrollMarquee,ShardField}.tsx`;
`components/contact/ContactMark.tsx`; `components/ui/Mark.tsx`.

**Modified:** `app/{layout.tsx,globals.css,opengraph-image.tsx}`;
`components/Nav.tsx`; `components/sections/{Hero,About,Experience,Skills,Projects,Contact}.tsx`;
`components/ui/{SectionHeading,Tag,ContactCard}.tsx`;
`components/command-palette/{AskPanel,AskLauncher}.tsx`;
`scripts/generate-icons.mjs`; `public/{favicon.png,apple-touch-icon.png}`;
`package.json`; `README.md`;
`tests/e2e/{reduced-motion,smoke,a11y}.spec.ts`.

**Deleted:** `components/motion/{RevealOnScroll,Stagger,variants}.*`;
`components/contact/FlipMark.tsx`; `components/ui/{BlockMark.tsx,block-mark.ts,block-mark.test.ts}`;
`tests/e2e/contact-flip.spec.ts`.

## Rollout

Four phases, each ending green (`lint` + `test` + `playwright` + `build`)
and committed:

1. **Visual foundation, no motion changes.** Fonts, tokens, drop dark mode,
   restyle every section + `SectionHeading` + `Tag`, `<Mark>`, OG image,
   icons, Ask-panel/launcher/`ContactCard` restyle. `RevealOnScroll` /
   `Stagger` still in place and working. Site fully works, looks new, motion
   still old-style.
2. **GSAP core.** `lib/gsap.ts`, `useReveal`, `<GsapBootstrap>`; replace
   `RevealOnScroll` / `Stagger` across all sections; remove `motion` from
   `package.json`.
3. **Signature effects.** `<KineticName>`, `<MagneticButton>`,
   `<ScrollMarquee>`, `<ShardField>` (incl. `Draggable` + inertia).
4. **Contact.** `<ContactMark>`; delete `FlipMark` + `BlockMark` + `block-mark`;
   rewrite `reduced-motion.spec.ts`; delete `contact-flip.spec.ts`.

Then: Jon reviews the built branch (locally or a preview he pushes) and
**explicitly approves before any merge to `main`**. Rollback = don't merge.

`design-canvas/` (the mockup working files, currently untracked) — add to
`.gitignore` in phase 1, or commit under `docs/` — Jon's call in review.

## Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| `SplitText` runs before `next/font` swaps → wrong char metrics / jump | `document.fonts.ready` refresh in `GsapBootstrap`; `KineticName` re-splits on `ScrollTrigger.refresh` / resize. Text is SSR'd and styled so the pre-split state already looks right. |
| `body` flex column absorbs any future pin-spacer | No v1 effect pins. If one is added later, the contact-flip note applies: inner `position:relative` scope + `pinSpacing:false`. |
| `useGSAP({ scope })` string-scoping bites again | Contract: effect components take DOM refs; `ScrollTrigger`/`Draggable` get resolved elements, never selectors. |
| Draggable shards flung off-screen / over content | Clamp with `bounds` to the section; `pointer-events` only on shards; `z-index` below text; `aria-hidden`. |
| Marquee `timeScale` mapping feels jittery | Smooth `getVelocity()` with a clamp + lerp; cap max `timeScale`; fall back to constant speed if it reads badly (manual pass). |
| New colour combos fail AA (cyan/pink grounds) | `*-fg` tokens picked for contrast; `a11y.spec.ts` axe gate per phase; darken a ground or text token if flagged. |
| Removing `motion` breaks an unnoticed import | `grep motion/react` before phase 2 (currently only `layout.tsx` + the 3 `components/motion/` files); `pnpm build` catches the rest. |
| Existing smoke tests break on section rewrites | Preserve `id`s, roles, the `mailto:` link, the earlier-roles toggle text; update selectors minimally, keep intent; run smoke after each phase. |
| OG image font fetch flakes at build | Same pattern as today (Martian Mono is already fetched at build); pin the Familjen Grotesk TTF URL; it is build-time, not request-time. |
| Reduced-motion users get a broken page | Every effect's `matchMedia` else-branch `gsap.set`s final state; sections are SSR'd complete; rewritten `reduced-motion.spec.ts` is the gate. |
| MCP browser tab shows frozen animations during review | Known (rAF throttle); verify via Playwright headless or a pushed preview, per the contact-flip learnings. |

## Open questions

None outstanding. The `design-canvas/` tracking decision and any
ground/text-token contrast tweaks are deferred to implementation/review.
