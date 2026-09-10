# Design: Contact Flip — the nav mark becomes the closing sign-off

**Date:** 2026-09-09
**Status:** Approved for planning
**Branch:** `feat/contact-flip`

## Context

Third animation sub-project (see [[project-ai-sdk-animation-exploration]]).
It **replaces the scrapped ScrollSession** (`feat/scroll-session` — the fake
terminal window read as cheesy; the one part Jon liked was the `J`
assembling from scattered block glyphs).

The consultant assignment lists GSAP experience. This delivers a distinctive
GSAP **Flip** moment *and* redesigns the Contact section around it, dropping
the literal-terminal chrome Jon no longer wants.

**Hard rule:** branch + preview only. No merge to `main` / production
without Jon's explicit approval.

## The moment

As the reader scrolls toward the end of the page, a ScrollTrigger on the
Contact section fires a ~0.8s transition:

1. The nav `<Mark>` (small `J` in the sticky header) appears to detach and
   fly to screen centre, scaling up — GSAP `Flip.fit()` animates from the
   nav mark's measured rect to a large centred state.
2. On arrival it **shatters into ~24 block glyphs** which then **reassemble**
   into the large `J` (kept from ScrollSession's finale — `blockMarkCells()`
   / the `J` grid).
3. The `J` **holds at centre** as the page's closing image. Contact info —
   status line, email (primary CTA), company · location, LinkedIn — sits
   below it in plain type. No terminal-window chrome (no traffic-light dots,
   no `$ contact --jon`).
4. Scrolling back **up** past the trigger reverses everything;
   `Flip.fit()` docks the `J` back into the nav.

## Goals

- A clear GSAP / Flip showcase (`Flip.fit`, `Flip.from`, plus a staggered
  shatter/reassemble timeline).
- Redesign Contact as a clean typographic sign-off, no terminal styling.
- The dark inverting band is a **one-line switch**, decided on the preview.
- Zero regression to accessibility (WCAG 2.1 AA, axe) or performance
  (Lighthouse ~98, LCP ~1.8s, no CLS). Contact stays reachable and its
  `mailto:` link stays correct (existing smoke tests must pass unchanged).
- Full reduced-motion and no-JS fallbacks.

## Non-goals

- Not scrubbed — the transition is **triggered** (`toggleActions: play none
  none reverse`), not tied 1:1 to scroll position.
- No reparenting of React-managed DOM nodes.
- Not a new section — it *is* the Contact section, in the same page slot.
- Not touching the Hero (LCP-critical).
- No change to the nav's own behaviour except dimming its mark during the
  fly-out.
- Scrubbed-tween-value assertions are out of scope for tests — only
  structural / coarse outcomes.

## Approach chosen

**Triggered Flip with a GSAP-owned clone overlay.**

Considered and rejected:
- **Scrubbed** motion — fussier, can feel sticky, and the payoff (shatter →
  reassemble) reads better as a discrete beat.
- **Reparent the real nav `<Mark>`** into a fixed container and back — React
  fights DOM moves it didn't make; brittle across re-renders.
- **Keep ScrollSession, restyle the terminal** — Jon rejected the whole
  framing, not just the chrome.

The clone overlay (`<FlipMark>`) is 100% GSAP-owned; React never touches it
after mount. The real nav `<Mark>` stays as the brand anchor and is only
opacity-dimmed by GSAP during the moment.

## Architecture

### New / changed components

| Path | Responsibility |
| --- | --- |
| `components/contact/FlipMark.tsx` | `"use client"` overlay: `position: fixed`, `pointer-events-none`, `z-45` (above nav `z-40`, below cmdk `z-50` / the AskPanel `<dialog>`). Holds the block-glyph `J`. Runs the Flip + shatter timeline via `useGSAP`, driven by a ScrollTrigger on `#contact`. |
| `components/contact/block-mark.ts` | The `J` block-glyph grid + `blockMarkCells()` — moved from `components/sections/block-mark.ts` (ScrollSession's copy is deleted with that branch; this is the canonical home). |
| `components/sections/Contact.tsx` | Rewritten: `id="contact"`, `aria-labelledby`, a heading, then the contact info as plain type (status line, `mailto:` email as the large CTA, company · location, LinkedIn). A static centred `J` placeholder that the reduced-motion / no-JS path shows and the animated path hides. Ground switched by a token (see "Both grounds"). No terminal chrome. |
| `app/layout.tsx` | Render `<FlipMark />` inside `CommandPaletteProvider` (or just in `<body>` — it needs no palette context; keep it near `<AskLauncher />`). Loaded via `next/dynamic`, SSR off is acceptable here (it is pure decoration; the static `J` in `Contact.tsx` is the SSR/no-JS image). |
| `components/Nav.tsx` | Add `data-nav-mark` to the `<Mark>` wrapper so `FlipMark` can measure it and GSAP can dim it. No behaviour change. |

### The Flip timeline (`FlipMark.tsx`)

`useGSAP(() => { ... }, { scope })` wrapping `gsap.matchMedia()`:

```
mm.add("(prefers-reduced-motion: no-preference)", () => {
  const navMark = document.querySelector("[data-nav-mark]");
  const flip = flipMarkRef.current;      // the overlay's J container
  const cells = gsap.utils.toArray("[data-flip-cell]");

  // 1. Dock: fit the overlay exactly over the nav mark, hidden.
  Flip.fit(flip, navMark, { scale: true });
  gsap.set(flip, { autoAlpha: 0 });

  const tl = gsap.timeline({
    paused: true,
    defaults: { ease: "power3.inOut" },
  });

  // 2. Fly out to centre + scale up (Flip.from a captured state), dim nav mark
  const state = Flip.getState(flip);
  // move `flip` to centred/large via a CSS class or gsap.set, then:
  tl.add(Flip.from(state, { duration: 0.8, scale: true, absolute: true }))
    .to(navMark, { autoAlpha: 0, duration: 0.3 }, 0)
    .set(flip, { autoAlpha: 1 }, 0);

  // 3. Shatter → reassemble the block glyphs
  tl.from(cells, {
    x: () => gsap.utils.random(-160, 160),
    y: () => gsap.utils.random(-120, 120),
    rotation: () => gsap.utils.random(-140, 140),
    opacity: 0,
    stagger: { each: 0.02, from: "random" },
    duration: 0.7,
    ease: "power3.out",
  }, ">-0.2");

  // 4. Reveal the contact copy (targets live in Contact.tsx, selected globally)
  tl.from("[data-contact-reveal]", {
    y: 16, opacity: 0, stagger: 0.08, duration: 0.5,
  }, "<0.1");

  ScrollTrigger.create({
    trigger: "#contact",
    start: "top 65%",
    end: "bottom bottom",
    onEnter: () => tl.play(),
    onLeaveBack: () => tl.reverse(),
    invalidateOnRefresh: true,
  });

  // Re-fit on resize so the dock target stays accurate.
  const onRefresh = () => Flip.fit(flip, navMark, { scale: true });
  ScrollTrigger.addEventListener("refreshInit", onRefresh);

  return () => ScrollTrigger.removeEventListener("refreshInit", onRefresh);
});
```

Exact `Flip.getState` / class-swap mechanics are an implementation detail for
the plan; the shape above is the contract. If `Flip.fit` + `Flip.from`
prove awkward to combine with the paused timeline, fall back to a measured
`gsap.fromTo` on `x` / `y` / `scale` using the nav mark's `getBoundingClientRect()`
as the "from" — same visual result, and still uses `Flip.fit` for the
resize/refresh dock.

### Both grounds

`Contact.tsx` reads a module constant:

```ts
// components/sections/Contact.tsx
const GROUND: "banded" | "paper" = "banded";
```

- **banded** → the section keeps `bg-band-background` full-bleed dark with
  the inverting `--band-*` tokens; the `J` cells use `bg-band-accent`; the
  Flip timeline adds a colour tween on the cells as they land.
- **paper** → normal page background; `J` cells use `bg-foreground` / one
  accent row; no colour tween.

One line to flip. Jon decides on the preview; the loser is deleted before
merge.

## Accessibility

- `Contact.tsx` renders semantic content always, SSR'd: heading, a
  visually-present static `J` (`role="img"`, `aria-label`), status line,
  `mailto:` link, company/location, LinkedIn link with its `sr-only`
  "(opens in a new tab)".
- `FlipMark` and every `[data-flip-cell]` are `aria-hidden="true"`,
  `pointer-events-none` — pure decoration.
- The animated path hides the static `J` in `Contact.tsx` (`aria-hidden` +
  visually) once `FlipMark` takes over, so there is exactly one accessible
  mark.
- Nav mark keeps its existing `aria-hidden` (it already is).
- axe scan with `#contact` in view → 0 violations
  (`wcag2a wcag2aa wcag21a wcag21aa`).
- Keyboard: contact links reachable in normal tab order; `FlipMark` is not
  focusable.

## Reduced motion

`gsap.matchMedia()`:
- `"(prefers-reduced-motion: no-preference)"` → the Flip timeline above.
- otherwise → **no `FlipMark` animation, no ScrollTrigger.** `FlipMark`
  stays `autoAlpha: 0` / unmounted; `Contact.tsx`'s static centred `J` and
  contact info are the whole thing; the nav mark stays visible in the nav.

Consistent with `MotionConfig reducedMotion="user"` and the site's
`motion-safe:` gating.

## Performance

- `gsap` (already a dep on other branches; add here) + `ScrollTrigger` +
  `Flip` ≈ ~32 KB gzipped. `FlipMark` is `next/dynamic` and purely
  decorative — the SSR/no-JS/reduced-motion image is the static `J` in
  `Contact.tsx`, so the dynamic chunk never blocks anything.
- Contact is the last thing on the page — cannot affect LCP.
- The Flip fly-out animates `transform` only (Flip uses transforms with
  `absolute: true`); no layout thrash, no CLS. The static `J` reserves its
  space so nothing shifts when `FlipMark` fades in over it.
- `will-change: transform` on `FlipMark` while the timeline is active,
  cleared on complete/reverse.
- Bar: no Lighthouse regression from ~98; no new CLS.

## Testing

### Unit (Vitest)

- `components/contact/block-mark.test.ts` — `blockMarkCells()` returns the
  expected cell count and the accent row; grid dimensions match the
  exported constants. (Moved test from the ScrollSession branch.)
- No other unit tests — the rest is animation.

### E2E — `tests/e2e/contact-flip.spec.ts`

- **Static contact content:** `#contact` reachable; heading visible; the
  `mailto:` link has the published email (assert against `content/profile`);
  the LinkedIn link present; a large `J` (`[data-contact-mark]` or the
  `role="img"` mark) visible once `#contact` is in view.
- **FlipMark idle at page top:** at `scrollY = 0`, the `FlipMark` overlay is
  not visible (`autoAlpha` 0 / `toBeHidden`).
- **Nav keeps its mark:** `[data-nav-mark]` present and visible at the top.
- **Contact reachable from the bottom** (mirrors the existing smoke
  assertion, kept here too as a guard against a broken pin/overlay).

### E2E — extend `tests/e2e/smoke.spec.ts`

The existing Contact assertions (`mailto` href, "reachable within one click",
"reachable from the bottom") must pass **unchanged** against the rewritten
`Contact.tsx`. If a selector breaks (e.g. the heading text), update the
smoke test minimally to match, keeping the intent.

### E2E — extend `tests/e2e/reduced-motion.spec.ts`

- Under `reducedMotion: "reduce"`: the `FlipMark` overlay is never visible;
  the static `J` in `#contact` is visible; `#contact` height ≤ ~1.6×
  viewport (no pin / no giant spacer); the nav mark is visible.

### E2E — extend `tests/e2e/a11y.spec.ts`

- axe scan with `#contact` scrolled into view → 0 violations.

### Manual pass (preview)

- The fly-out and shatter feel right on a real deploy; the dock-back on
  scroll-up is clean; no flash of the nav mark + FlipMark both visible.
- Resize mid-page — the dock target stays aligned with the nav mark.
- Toggle `GROUND` between `"banded"` and `"paper"`, redeploy, compare.
- Lighthouse mobile — still ~98, no new CLS, LCP unchanged.

## Files

**Created**

| Path | Responsibility |
| --- | --- |
| `components/contact/FlipMark.tsx` | The GSAP-owned Flip + shatter overlay. |
| `components/contact/block-mark.ts` + `.test.ts` | The `J` grid (canonical home). |
| `tests/e2e/contact-flip.spec.ts` | Structural e2e. |

**Modified**

| Path | Change |
| --- | --- |
| `components/sections/Contact.tsx` | Full rewrite — typographic sign-off, static `J`, ground switch, no terminal chrome. |
| `components/Nav.tsx` | `data-nav-mark` on the `<Mark>` wrapper. |
| `app/layout.tsx` | `next/dynamic` import + render `<FlipMark />`. |
| `app/globals.css` | If needed: a `--contact-*` ground token pair; the caret `@utility` / `caret-blink` stays untouched. |
| `package.json` | Add `gsap`, `@gsap/react`. |
| `tests/e2e/smoke.spec.ts`, `reduced-motion.spec.ts`, `a11y.spec.ts` | Extend per Testing. |
| `README.md` | Swap the ScrollSession "notable bit" for the Contact Flip; note GSAP. |

## Rollout

1. Branch `feat/contact-flip`. `pnpm lint`, `pnpm test`, `pnpm exec
   playwright test`, `pnpm build` green locally.
2. Push → preview deploy. Run the manual pass. Decide `GROUND`.
3. Delete the loser ground variant; commit.
4. **Jon reviews the preview and explicitly approves before any merge to
   `main`.**
5. On merge: delete `feat/scroll-session` (local + remote) — superseded.
   Its spec/plan docs stay in `docs/superpowers/` marked superseded, or are
   removed in the same PR — Jon's call.

## Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| `Flip.fit` + `Flip.from` awkward with a paused, reversible timeline | Documented fallback: measured `gsap.fromTo` on x/y/scale using the nav mark's rect; keep `Flip.fit` only for the resize dock. |
| Nav mark + FlipMark both visible for a frame (double `J`) | Dim the nav mark to `autoAlpha: 0` at timeline position 0; `set` FlipMark visible at 0 too — they cross-fade at the same instant. |
| Sticky-nav z-index vs the flying mark | `FlipMark` at `z-45` (over nav `z-40`, under cmdk `z-50`); `pointer-events-none` so nav stays clickable. |
| `next/font` layout shift → wrong nav-mark measurement | `Flip.fit` re-runs on `ScrollTrigger.refreshInit`; a `document.fonts.ready` refresh as on the other GSAP work. |
| Existing smoke tests break on the Contact rewrite | Keep `id="contact"`, a real `mailto:` link, and the nav "contact" anchor target; update smoke selectors minimally if the heading text changes. |
| Reduced-motion users see a broken/empty Contact | Static `J` + full contact info are SSR'd in `Contact.tsx` regardless of JS/motion. |
| CLS when FlipMark fades in over the static `J` | The static `J` reserves the centre space; FlipMark overlays it at the same size; nav-mark dim is opacity-only. |
| Two `block-mark.ts` copies drift | This spec makes `components/contact/block-mark.ts` canonical; the ScrollSession copy dies with that branch. |

## Open questions

None outstanding. `GROUND` ("banded" vs "paper") is deliberately deferred to
the preview.
