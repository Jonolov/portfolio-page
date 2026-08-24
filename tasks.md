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

- [ ] Define shared types in `lib/types.ts` (`Role`, `SkillGroup`, `Profile`,
      etc.) matching the fields spec.md §5 actually uses (company, title,
      dates, summary, tech, featured/collapsed flag)
- [ ] Write `content/profile.ts` — name, role line, hero hook, about copy,
      contact fields (email, company, location) per plan.md §5.4
- [ ] Write `content/experience.ts` — UR, Hemnet, KTH as full entries;
      Ving/Thomas Cook, Fröjd, KTH internship as collapsed/condensed entries
      per plan.md §5.1–5.2
- [ ] Write `content/skills.ts` — grouped per spec.md §5 (Frontend, Backend,
      Auth/Identity, Testing, CMS/Platforms, Practice)
- [ ] Sanity-check: import each content file into a scratch page and confirm
      it type-checks and renders as plain text — confirms the data shape
      before any UI is built on top of it

## Phase 2 — Static section components (no motion yet)

Build each as plain, fully-functional, server-rendered markup first —
motion gets layered on in Phase 4. This keeps a working, accessible,
no-JS-required baseline at every point.

- [ ] `components/ui/` primitives: `SectionHeading`, `Tag`, `Card`
- [ ] `components/sections/Hero.tsx` — name, role line, one-line hook,
      "Press ⌘K" hint (palette itself comes in Phase 5)
- [ ] `components/sections/About.tsx`
- [ ] `components/sections/Experience.tsx` — maps `content/experience.ts`,
      includes the "Show earlier roles" collapse/expand (functional, no
      animation yet — instant show/hide)
- [ ] `components/sections/Skills.tsx` — grouped rendering, not a flat tag
      cloud
- [ ] `components/sections/Contact.tsx` — `mailto:` link, company, location,
      "open to consulting" status line
- [ ] Wire all sections into `app/page.tsx` with anchor IDs matching the nav
- [ ] Add a persistent anchor nav (no active-section highlighting yet —
      that's Phase 4) that keeps Contact reachable within one click/scroll
      from anywhere on the page (spec §3)
- [ ] Manual pass: keyboard-only tab through the whole page, confirm every
      interactive element is reachable and has a visible focus state

## Phase 3 — Visual identity

- [ ] Apply the "confident, modern, not corporate-generic" tone: finalize
      palette, spacing, and type scale in Tailwind config
- [ ] Style all sections built in Phase 2 against the finalized palette
- [ ] Check color contrast against WCAG AA for all text/background pairs
      (spec §7)
- [ ] Responsive pass: mobile, tablet, desktop breakpoints for every section

## Phase 4 — Motion layer

- [ ] Build `components/motion/RevealOnScroll.tsx` wrapping `whileInView`,
      internally checking `useReducedMotion()` and falling back to an
      instant opacity swap when true
- [ ] Define shared variants in `components/motion/variants.ts`
- [ ] Apply `RevealOnScroll` to section entrances and staggered list items
      (Experience roles, Skills groups)
- [ ] Add active-section highlighting to the anchor nav on scroll
- [ ] Add hover-tilt interaction to Experience cards
      (`useMotionValue`/pointer tracking), disabled under reduced motion
- [ ] Manual check: enable OS-level "reduce motion," reload, confirm no
      transform/slide animations fire and all content is still fully visible

## Phase 5 — Command palette

- [ ] Build `components/command-palette/useCommandPalette.ts` — open state,
      ⌘K/Ctrl+K keybinding, closes on Escape/outside click
- [ ] Build `components/command-palette/CommandPalette.tsx` on top of `cmdk`
- [ ] Add navigation commands (jump to each section)
- [ ] Add the playful commands (`whoami`, `stack`, `contact`) returning
      short styled responses sourced from `content/profile.ts`
- [ ] Style palette open/close transition with Framer Motion, gated by
      `useReducedMotion()` (per plan.md, palette functionality itself must
      not depend on motion)
- [ ] Keyboard/screen-reader pass specifically on the palette: open via
      keyboard only, navigate options via arrow keys, confirm `cmdk`'s ARIA
      roles announce correctly

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
