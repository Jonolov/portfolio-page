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

- [x] Ran `pnpm build` (fully static, `○ (Static)` for `/`) + `pnpm start`
      and scanned the actual production output, not just dev mode. Axe
      scan widened to `wcag2a`/`wcag2aa`/`wcag21a`/`wcag21aa` (broader than
      earlier per-phase `wcag2aa`-only scans) in both light and dark —
      **0 violations.**
- [x] Full keyboard-only pass across the whole page (12 tab stops, all in
      logical order with a visible focus outline): skip link → nav (5
      links) → hero CTAs → ⌘K hint button → Experience's earlier-roles
      toggle → contact email. Confirmed the toggle button flips
      `aria-expanded` and reveals `#earlier-roles` correctly via
      keyboard-only Enter. Confirmed the palette's Radix-driven focus trap
      never leaks focus to the page behind it across 15 Tab presses while
      open. **Found and fixed a real bug here:** closing the palette with
      Escape after opening it via the global ⌘K shortcut (no click target)
      left focus stranded on `<body>`, since Radix's own focus-restore
      only knows about a registered trigger element and `cmdk`'s
      `Command.Dialog` doesn't forward Radix's `onCloseAutoFocus` prop to
      customize it. Fixed by tracking `document.activeElement` in
      `useCommandPalette.tsx` at the moment the palette opens and manually
      restoring it (via `requestAnimationFrame`, so it runs after Radix's
      own cleanup) when it closes — verified for both the keyboard-shortcut
      and Hero-button-click open paths.
- [x] **Screen-reader check — with a caveat.** This environment has no
      access to a live VoiceOver GUI session, so I could not do a literal
      manual VoiceOver pass as originally planned. Substituted Playwright's
      accessibility-tree snapshot (`ariaSnapshot()`) for Hero, Experience,
      and the open command palette — the same computed AX tree a screen
      reader consumes — and confirmed clean semantic structure (heading
      levels, list/listitem roles, the palette's combobox/listbox/option
      pattern with a labeled dialog). This is a solid proxy but not a
      substitute for an actual VoiceOver run; flagging this as something
      to manually verify yourself if you want full confidence before
      launch.
- [x] Skip-to-content link confirmed as the first tab stop, and activating
      it (Enter) correctly moves to `#main`. Tab distance from page load to
      Contact is short regardless (11 stops through the full page, 6 of
      which are the nav itself) — the skip link's real value is bypassing
      the nav on repeat visits, not solving an otherwise-unusable distance.

## Phase 7 — Performance pass

- [x] Ran Lighthouse (mobile, `pnpm build && pnpm start`) — **found and
      fixed a real, spec-relevant bug.** With `--throttling-method=simulate`,
      LCP was 2.8s (over spec §3's ~2s bar), and the LCP breakdown pinned it
      on the hero hook paragraph with a 2.6s "element render delay." Root
      cause: Hero was wrapped in `RevealOnScroll`, which sets content to
      `opacity: 0` until React hydrates and Framer Motion's `whileInView`
      fires — appropriate for below-the-fold content a user scrolls to, but
      actively harmful for Hero, which is the *only* section guaranteed to
      already be in the viewport at load. There's no "reveal on scroll" for
      content that's already on screen; it just adds a JS-hydration gate in
      front of the exact content spec §3 says must be readable within 5
      seconds. Fixed by removing the wrapper — Hero is now plain, always-
      visible markup with zero animation dependency for its own visibility.
      Re-measured after the fix: Speed Index dropped 3.2s → 0.8s, perf score
      93 → 96 (simulated). Cross-checked with literal `--throttling-method=devtools`
      (real CPU/network throttling, not Lighthouse's Lantern heuristic
      model) plus a manual CDP+PerformanceObserver measurement — both
      agree: **FCP = LCP = 1.6s** (manual test: LCP at 728ms), CLS 0, TBT
      60ms, perf score 99. The `simulate` method's lingering 2.7s reading
      after the fix looks like a Lantern-model artifact for this specific
      JS-hydration-dependent LCP element, not a real regression — noting
      this in case a future perf pass sees the same discrepancy again.
- [x] Font loading already correct out of the box (no changes needed):
      `next/font`'s Geist/Geist Mono ship `font-display: swap` plus
      automatic fallback-metric overrides (`ascent-override`,
      `size-adjust` on a local-Arial fallback face) that keep the swap
      layout-shift-free — confirmed by CLS: 0 in every run. No images in
      the design (text/icon-only site), so `next/image` doesn't apply;
      removed five unreferenced leftover SVGs (`file.svg`, `globe.svg`,
      `next.svg`, `vercel.svg`, `window.svg`) from `public/` — dead weight
      from the original scaffold, confirmed unreferenced via grep first.
- [x] JS bundle: 194KB compressed total on initial load (React 19 +
      Next.js 16 runtime + Framer Motion + cmdk + Radix Dialog + all app
      code) — checked for obvious duplication across chunks, found none.
      Reasonable for this stack, and the measured real-world performance
      above (99/100, TBT 60ms) confirms it isn't a practical problem;
      didn't chase further bundle-splitting (e.g. Framer Motion's
      `LazyMotion`) given that.
- [x] Re-ran axe (`wcag2a`/`2aa`/`21a`/`21aa`, light+dark) after the Hero
      fix — 0 violations, no regression. Re-verified reduced motion: Hero
      heading is `opacity: 1`/`transform: none` immediately on load (no
      animation dependency at all now), while About/Experience/Skills
      still correctly reveal via `whileInView` when scrolled into view.

## Phase 8 — Testing

- [x] `tests/e2e/smoke.spec.ts` — all sections render with their key
      content, Contact reachable within one click from the top and by
      scroll from the bottom, mailto link is correct, and the Experience
      "show earlier roles" toggle works
- [x] `tests/e2e/a11y.spec.ts` — full `wcag2a`/`2aa`/`21a`/`21aa` axe scan
      (both on the base page and with the palette open), skip-link check,
      keyboard-only traversal through nav/hero/CTAs, and a dedicated
      command-palette test covering keyboard open, focus trap (8x Tab stays
      inside the dialog), and focus restoration on close
- [x] `tests/e2e/reduced-motion.spec.ts` — `contextOptions: { reducedMotion: "reduce" }`
      (**note:** this Playwright version, 1.62.1, moved `reducedMotion` out
      of the flat `test.use()` options into a nested `contextOptions`
      object — `tsc` caught this immediately as a real type error, not a
      style nit). Asserts the Hero is immediately visible with no
      animation dependency, every below-the-fold section is fully visible
      once scrolled to, Experience cards carry no residual transform, the
      hover-tilt is fully inert (before/after mouse-move equality — a
      `transformPerspective`-only 3D matrix is never literally the string
      `"none"`, so asserting exact equality is the correct check, not a
      literal `"none"` match), and the palette's open/close transition has
      `0s` duration
- [x] Ran the full suite twice: once against `pnpm dev` (16/16 passing) and
      once against the actual production build (`pnpm build && pnpm start`,
      reusing the running server per `playwright.config.ts`'s
      `reuseExistingServer` — 16/16 passing, faster). One real test bug
      found and fixed along the way (the literal-`"none"` assertion above);
      no product bugs found in this phase — the ones that existed were
      already caught and fixed in Phases 4/6/7.

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
