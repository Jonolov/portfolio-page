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
