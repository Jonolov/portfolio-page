# Tasks: Portfolio Website — Jon Stjärnström

Derived from `plan.md`. Ordered so each phase can be built and sanity-checked
before the next depends on it. Checkboxes are for tracking progress during
implementation — nothing here is scaffolded yet.

## Phase 0 — Project setup

- [x] Init Next.js (App Router, TypeScript) project with `pnpm create next-app`
- [x] Add Tailwind CSS — scaffolded with Tailwind 4 (`@tailwindcss/postcss`).
      Custom palette/type scale still TODO in Phase 3 (placeholder theme for
      now)
- [x] Add Framer Motion (`motion`) and `cmdk` as dependencies
- [x] Add Playwright + `@axe-core/playwright` as dev dependencies, chromium
      browser binary installed, minimal `playwright.config.ts` in place
- [x] `next/font` wired via scaffold default (Geist/Geist Mono). Final
      typeface choice deferred to Phase 3
- [x] Confirmed `pnpm dev` runs and serves a 200 response

## Phase 1 — Content layer

- [x] Define shared types in `lib/types.ts` (`Role`, `CondensedRole`,
      `SkillGroup`, `Profile`)
- [x] Write `content/profile.ts` — name, role line, hero hook, about copy,
      contact fields (email, company, location, availability status line)
- [x] Write `content/experience.ts` — UR, Hemnet, KTH as full `Role` entries;
      Ving/Thomas Cook, Fröjd, KTH internship as `CondensedRole` entries
      (company name only — titles/dates weren't in spec.md, see note below)
- [x] Write `content/skills.ts` — grouped per spec.md §5 (Frontend, Backend,
      Auth/Identity, Testing, CMS/Platforms, Practice)
- [x] Sanity-check: rendered all content as plain text/lists in `app/page.tsx`,
      confirmed `tsc --noEmit` and `pnpm lint` pass clean, and verified via
      dev server that every field renders correctly. This scratch render
      will be replaced by real section components in Phase 2.

## Phase 2 — Static section components (no motion yet)

Build each as plain, fully-functional, server-rendered markup first —
motion gets layered on in Phase 4. This keeps a working, accessible,
no-JS-required baseline at every point.

- [x] `components/ui/` primitives: `SectionHeading`, `Tag`, `Card`
- [x] `components/sections/Hero.tsx` — name, role line, one-line hook,
      "Press ⌘K" hint (palette itself comes in Phase 5)
- [x] `components/sections/About.tsx`
- [x] `components/sections/Experience.tsx` — maps `content/experience.ts`,
      includes the "Show earlier roles" collapse/expand (functional, no
      animation yet — instant show/hide via the `hidden` attribute, element
      stays mounted so `aria-controls` always points at a real node)
- [x] `components/sections/Skills.tsx` — grouped rendering, not a flat tag
      cloud
- [x] `components/sections/Contact.tsx` — `mailto:` link, company, location,
      "open to consulting" status line
- [x] Wire all sections into `app/page.tsx` with anchor IDs matching the nav
- [x] Add a persistent anchor nav (`components/Nav.tsx`, sticky header, no
      active-section highlighting yet — that's Phase 4) that keeps Contact
      reachable within one click/scroll from anywhere on the page (spec §3).
      Also added a skip-to-content link in `app/layout.tsx`.
- [x] Manual pass: scripted Tab-through with Playwright confirmed all 10
      interactive elements (skip link, 5 nav links, 2 hero CTAs, the
      earlier-roles toggle, the contact mailto link) are reachable in a
      logical order with a visible focus outline on each

## Phase 3 — Visual identity

- [x] Finalized palette/type in `app/globals.css` (Tailwind v4 is CSS-first —
      no `tailwind.config.ts` needed). Near-black/white base with a single
      violet accent (`#6d28d9` light / `#a78bfa` dark) used consistently for
      section eyebrows, links, and the primary interactive states. Fixed a
      scaffold bug where `body` hardcoded Arial instead of the Geist
      font-sans variable. Hero name and section headings use fluid
      `clamp()` sizing instead of fixed breakpoint jumps.
- [x] Styled all Phase 2 sections against the finalized palette; replaced
      the emoji hint text with a proper `<kbd>`-styled ⌘K badge in the hero
      (foreshadows the Phase 5 command palette)
- [x] Color contrast: computed WCAG ratios by hand for the palette itself
      (all ≥5.25:1, well above AA), then ran an automated
      `@axe-core/playwright` `wcag2aa` scan in both light and dark
      (`prefers-color-scheme`) — 0 violations in either. Caught and fixed
      one real bug in the process: the original hero hint at 40% text
      opacity was only 2.71:1, below AA; standardized on 60% as the opacity
      floor for any real text.
- [x] Responsive pass at 375/768/1280px via Playwright: no horizontal
      overflow at any width. Nav collapses to a "JS" mark below `sm`
      (full name kept for screen readers via `sr-only`), section padding
      scales down on mobile (`py-16` → `py-24`), and the contact email
      wraps instead of overflowing on narrow viewports.

## Phase 4 — Motion layer

- [x] Built `components/motion/RevealOnScroll.tsx`, `components/motion/Stagger.tsx`
      (`StaggerGroup`/`StaggerItem`), and `components/motion/variants.ts`.
      **Architecture note (found via a real bug):** these always render
      `motion.div` rather than branching between `motion.div`/plain `div`
      based on `useReducedMotion()`. The branching approach caused a React
      hydration mismatch — `useReducedMotion()` is `null` during SSR, so
      under reduced motion the server renders the animated-hidden state and
      React's hydration keeps that stale server markup instead of patching
      to the client's plain-div output, permanently stranding a
      `translateY(16px)`. Fixed by wrapping the app in
      `<MotionConfig reducedMotion="user">` (`app/layout.tsx`) instead,
      which keeps DOM shape identical between server/client and instead
      neutralizes transform-based animation at the Framer Motion engine
      level (opacity still fades; slide/transform snaps instantly) —
      verified via Playwright with `reducedMotion: "reduce"`.
- [x] Applied `RevealOnScroll` to Hero, About, Contact, and the
      Experience "show earlier roles" block; `StaggerGroup`/`StaggerItem`
      to the Experience role list and Skills groups (confirmed `<div>`
      wrapping `dt`/`dd` inside `<dl>` is valid HTML5, so `StaggerItem`
      could directly replace the old grouping wrapper)
- [x] Active-section nav highlighting in `components/Nav.tsx`. Originally
      built on `IntersectionObserver` with a percentage-based `rootMargin`,
      but that never activated the last nav item (Contact) once scrolled to
      the bottom of the page — a short last section can't reach the
      "active" viewport band if there's no room left to scroll. Replaced
      with a scroll-position approach that explicitly special-cases
      "scrolled to the bottom → activate the last item," verified for all
      four sections including Contact at the true page bottom.
- [x] `components/motion/TiltCard.tsx` — pointer-tracked hover tilt via
      `useMotionValue`/`useTransform`/`useSpring`, applied to Experience
      cards. Kept a manual `useReducedMotion()` check here specifically
      (unlike the reveal components) since real-time mouse-tracked tilt is
      worth fully suppressing under reduced motion, not just de-eased —
      implemented as a behavioral gate inside the mousemove handler rather
      than branching the rendered element, so it doesn't reintroduce the
      hydration bug above.
- [x] Verified via Playwright with `reducedMotion: "reduce"`: axe scan
      clean once animations settle, no transform-based movement, hover
      tilt fully inert, and all content visible. Also caught and confirmed
      as a non-issue: axe flags a transient `color-contrast` dip on
      partially-opaque text ~50-200ms into the fade-in (mathematically
      unavoidable for any opacity transition ending above but not far above
      the AA floor) — resolves within the animation's own duration and is
      not present in the settled/at-rest state, which is what Phase 6's
      accessibility pass will audit.

## Phase 5 — Command palette

- [x] Built `components/command-palette/useCommandPalette.tsx` (`.tsx` not
      `.ts` — it exports a Provider component, which needs JSX) — a React
      context holding `open` state, global ⌘K/Ctrl+K keydown listener.
      Escape and outside-click close are handled for free by `cmdk`'s
      `Command.Dialog` (wraps Radix Dialog).
- [x] Built `components/command-palette/CommandPalette.tsx` on `cmdk`'s
      `Command.Dialog`, wired into `app/layout.tsx` via
      `CommandPaletteProvider` so it's a single global instance. The
      Hero's ⌘K hint (Phase 3) is now a real `<button>` that opens it —
      closing the loop from a foreshadowing detail to actual functionality.
- [x] "Navigate" group jumps to Hero/About/Experience/Skills/Contact,
      closes the palette, and calls `scrollIntoView` with
      `behavior: prefers-reduced-motion ? "auto" : "smooth"`
- [x] "Ask" group (`whoami`, `stack`, `contact`) uses cmdk's documented
      "pages" pattern — selecting one pushes a sub-page showing text
      sourced live from `content/profile.ts`/`content/skills.ts`, with a
      real "← Back" item plus Backspace-to-go-back when search is empty
- [x] Open/close transition: **deviated from the plan's "Framer Motion"**
      — `Command.Dialog` doesn't expose Radix's `forceMount`, so
      `AnimatePresence` can't control the exit-unmount timing without
      dropping cmdk's Dialog convenience wrapper entirely. Used Radix's
      own recommended pattern instead: CSS transitions keyed off the
      `data-state` attribute it already sets, gated by Tailwind's
      `motion-safe:`/omitted-otherwise variants (native
      `prefers-reduced-motion` media query, no JS check needed). Verified
      via Playwright: 0.15s transition under normal motion, 0s (instant
      snap, still fully functional) under reduced motion.
- [x] Verified via Playwright: keyboard-only open (⌘K and Ctrl+K, with a
      settle-time note — pressing the shortcut in the same tick as
      navigation can race React hydration attaching the listener, same as
      any client-hydrated shortcut, not palette-specific), arrow-key
      navigation lands on the right item, Enter selects and scrolls, click
      also opens/selects, Escape and outside-click both close, and an axe
      `wcag2aa` scan with the dialog open returns 0 violations. Full-site
      axe re-run in light/dark to confirm no regression from this phase.

## Phase 6 — Accessibility pass (full page)

- [ ] Run an automated `axe` scan against the built page, fix any flagged
      issues
- [ ] Full keyboard-only pass: tab order, focus visibility, palette,
      collapse/expand on Experience, all links
- [ ] Screen reader spot-check (VoiceOver) on Hero, Experience, and the
      command palette
- [ ] Confirm skip-to-content link or equivalent if tab order to Contact is
      long

## Phase 7 — Performance pass

- [ ] Run Lighthouse (mobile, throttled) — target initial content visible
      in ~2s per spec §3
- [ ] Audit font loading (no FOUT/FOIT regressions), image formats/sizes via
      `next/image`
- [ ] Check JS bundle size — confirm Framer Motion + cmdk aren't pulling in
      unused code paths
- [ ] Re-run the reduced-motion and axe checks after any perf-driven
      refactors, since perf work can regress a11y

## Phase 8 — Testing

- [ ] `tests/e2e/smoke.spec.ts` — all sections render, Contact reachable
      within one click/scroll from any scroll position
- [ ] `tests/e2e/a11y.spec.ts` — axe scan + scripted keyboard-only traversal
      (nav → palette open/close → Contact)
- [ ] `tests/e2e/reduced-motion.spec.ts` — emulate
      `prefers-reduced-motion: reduce`, assert no transform-based animation
      fires, content still fully visible
- [ ] Run full Playwright suite in CI-equivalent local run before deploy

## Phase 9 — Deployment

- [ ] Connect repo to Vercel, confirm production build succeeds
- [ ] Point `become.independtech.se` at the Vercel deployment
- [ ] Final live-site pass: repeat Phase 6 (a11y) and Phase 7 (perf) checks
      against the deployed URL, not just local dev
- [ ] Confirm contact `mailto:` link works end-to-end from the live site

---

Open items carried over from plan.md that still need your input before or
during implementation:
- Confirm current "available for consulting" status is accurate (UR
  contract per spec.md shows an end date of Jun 2026, already passed as of
  today).
- Confirm ordering assumption (strict recency: UR → Hemnet → KTH) vs. a
  `featured`-flag override if you want Hemnet leading regardless of date.
