# Plan: Portfolio Website — Jon Stjärnström

This plan translates `spec.md` into concrete technical decisions. No code or
scaffolding yet — this is for review first.

## 1. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router), TypeScript** | Matches spec §7's requirement to build with the stack being promoted. App Router gives static generation for a fully content-driven, backend-less page (§7: "no CMS/backend needed"), plus `next/image` and `next/font` for the performance bar in §3. |
| UI library | **React 18/19** | Comes with Next.js; no separate decision needed. |
| Styling | **Tailwind CSS** | Fast to iterate a distinctive visual identity (custom palette, type scale) without a heavy CSS architecture for a single-page site. Utility classes keep the "confident, modern" tone (§6) achievable without fighting a component-library's default look. |
| Animation | **Framer Motion (`motion` package)** | Purpose-built for exactly what §6 asks for: scroll-triggered reveals (`whileInView`), orchestrated enter/exit, and a first-class `useReducedMotion` hook so the reduced-motion requirement (§6, §3) is a built-in check rather than bolted-on CSS media queries everywhere. GSAP is more powerful but imperative and heavier than this scope needs; CSS-only can't cleanly drive the command palette's enter/exit (see §2 below). |
| Command palette primitive | **cmdk** | The unstyled, accessible primitive behind Vercel/Linear/Raycast-style palettes. Ships correct ARIA roles, focus trapping, and keyboard nav out of the box — important since this becomes the site's one non-trivial interactive widget and it must stay screen-reader/keyboard usable (§3, §6). |
| Testing | **Playwright** (+ `@axe-core/playwright` for automated a11y scans) | Playwright is already in Jon's own stack (UR, Hemnet) — using it here is a small meta-signal of consistency, not just a testing choice. Scope: a handful of e2e smoke tests, not full coverage — see §6 below. |
| Deployment | **Vercel** | Zero-config with Next.js (image optimization, edge caching), free tier is sufficient for a static portfolio, and `become.independtech.se` can be pointed at it via custom domain. |
| Package manager | **pnpm** | Fast installs, disk-efficient. Low-stakes choice — flag if you'd rather use npm/yarn. |

Rendering model: everything is statically generated at build time (no
runtime data fetching, no server). Content changes require a rebuild/redeploy,
which is consistent with §7's "no CMS/backend needed for v1."

## 2. Animation / interactivity approach (§6)

§6 asks for one genuine moment of delight tied to Jon's own skillset, not
decorative noise, and it must degrade gracefully. Proposal:

### Flagship: a command palette in the hero (⌘K / Ctrl+K, or a visible hint to click)

A Raycast/Linear/Vercel-style command palette, opened via keyboard shortcut
or a visible "Press ⌘K" affordance in the hero. It lets a visitor:
- Jump to any section (About / Experience / Skills / Contact) — i.e. it's a
  **real navigation feature**, not just a gimmick.
- Type a few playful queries (`whoami`, `stack`, `contact`) that return a
  short, styled response using site content.

Why this is the right "moment of delight" rather than an arbitrary one: it's
a tool a senior frontend dev would actually build and use, it directly
signals the dev-tooling fluency the About section talks about (AI-assisted
workflows, current with the field), and — critically — it's *purposeful*:
its primary job is navigation, so it satisfies §6's "reveals content, guides
attention" bar rather than being pure decoration. If a visitor never
discovers it, the site still fully works via normal anchor nav.

### Supporting motion (secondary, all purposeful)
- **Scroll-triggered reveals**: sections and their children fade/slide in via
  `whileInView`, staggered slightly for lists (Experience roles, Skills
  groups). Guides attention down the page; not full-page choreography.
- **Active-section nav highlighting**: as you scroll, the anchor nav
  indicates which section you're in — small, functional, reinforces
  wayfinding.
- **Subtle hover interaction on Experience cards**: a light tilt/lift on
  hover (Framer Motion `useMotionValue` tied to pointer position), signaling
  "crafted" on the section doing the heaviest credibility work.

### Graceful degradation (§6, §3)
- Every Framer Motion animation is gated through `useReducedMotion()`; when
  true, reveals become instant opacity swaps (no transform/slide), and hover
  tilt is disabled entirely.
- The command palette itself has no motion dependency for functionality —
  keyboard nav and screen-reader labels work identically whether motion is
  reduced or not. It's built on `cmdk`, which handles focus management and
  ARIA regardless of animation state.
- No animation gates initial content visibility — reveals animate content
  that's already in the DOM and readable without JS (important for the
  <2s-on-throttled-mobile bar in §3).

## 3. File / folder structure

```
portfolio-page/
├── app/
│   ├── layout.tsx            # root layout, fonts, metadata
│   ├── page.tsx               # composes sections in order
│   └── globals.css            # Tailwind entry + CSS variables (palette, type scale)
├── components/
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── Experience.tsx
│   │   ├── Skills.tsx
│   │   └── Contact.tsx
│   ├── command-palette/
│   │   ├── CommandPalette.tsx
│   │   └── useCommandPalette.ts   # open-state, keyboard shortcut binding
│   ├── motion/
│   │   ├── RevealOnScroll.tsx     # wraps whileInView + reduced-motion check
│   │   └── variants.ts            # shared Framer Motion variants
│   └── ui/                        # small primitives: SectionHeading, Tag, Card
├── content/
│   ├── profile.ts             # name, role line, hero hook, about copy
│   ├── experience.ts          # typed array of role entries
│   └── skills.ts              # typed grouped skills
├── lib/
│   └── types.ts               # shared content types (Role, SkillGroup, etc.)
├── public/                    # static assets (icons, any images)
├── tests/
│   └── e2e/
│       ├── smoke.spec.ts          # core content visible, contact reachable
│       ├── a11y.spec.ts           # axe scan + keyboard-only pass
│       └── reduced-motion.spec.ts # emulates prefers-reduced-motion, checks no transform animations fire
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
├── spec.md
└── plan.md
```

## 4. Content storage

**Plain typed TypeScript data files under `content/`**, not hardcoded JSX and
not raw JSON. Reasons:
- Type safety + autocomplete against shared interfaces in `lib/types.ts`
  (e.g. a `Role` type with `company`, `dates`, `summary`, `tech: string[]`)
  catches typos/shape mistakes at compile time.
- Editing content (fixing a date, adding a role) never touches component
  logic or JSX — lower risk of breaking layout while updating copy.
- Still fully static — no runtime cost over JSON, and satisfies §7's "no
  CMS/backend needed... data-driven from a local file."

Example shape (illustrative, not final):

```ts
// content/experience.ts
export const experience: Role[] = [
  {
    company: "Utbildningsradion (UR)",
    title: "Senior Developer",
    dates: { start: "2025-06", end: "2026-06" },
    summary: "...",
    tech: ["Next.js", "TypeScript", "Next-Auth", "Keycloak", ...],
    featured: true,
  },
  // ...
];
```

Components (`Experience.tsx`, `Skills.tsx`) stay purely presentational —
they map over the typed content, no copy embedded in JSX.

## 5. Open questions from spec §9 — proposed defaults

Rather than blocking on these, here are proposed defaults. Flag any you want
changed and I'll fold it in before scaffolding.

1. **Older roles (Ving/Thomas Cook, Fröjd, KTH internship)** — *Assumption:*
   include them as a collapsed "Show earlier roles" toggle at the bottom of
   the Experience timeline (condensed to company/title/dates, no detail
   bullets), per the spec's own suggestion in §5. Keeps the page from
   resume-dumping while still being honest about full history for anyone who
   wants it.

2. **Strongest proof points / lead order** — *Assumption:* order Experience
   strictly most-recent-first as spec §4 specifies (UR, then Hemnet, then
   KTH, then the collapsed older roles), which already surfaces Hemnet and UR
   first without needing separate "featured" logic. If you actually want
   Hemnet leading over UR regardless of recency (e.g. because it's the
   stronger/larger-scale proof point), say so and I'll add a `featured`
   flag to reorder independent of date.

3. **"Available for work" messaging** — *Assumption:* include a short,
   low-key status line in the Contact section (e.g. "Currently open to new
   consulting engagements"), not a homepage banner or hard pitch. One
   flagged observation: the UR contract end date given in spec §5 is
   **Jun 2026**, which relative to today (2026-08-24) has already passed —
   so as of now Jon likely *is* between engagements, making an "available"
   line probably accurate rather than aspirational. Worth confirming current
   status before this copy goes in, since it's the one piece of content the
   plan can't infer from the spec.

4. **Which contact details are public** (spec §5 flags this explicitly) —
   *Assumption:* make email, company name, and location public in the
   Contact section (all standard, non-sensitive professional info); no
   contact-form backend per §7/§8, just a `mailto:` link. The site URL
   itself isn't worth listing on the site.

## 6. Testing scope

Kept intentionally small for a single-page portfolio — not a full test
pyramid:
- One Playwright smoke test: all five sections render, contact is reachable
  within one click/scroll from any scroll position (§3).
- One accessibility pass: `@axe-core/playwright` scan + a scripted
  keyboard-only traversal (tab through nav, open/close command palette,
  reach contact) — directly verifies §3's screen-reader/keyboard bar.
- One reduced-motion test: emulate `prefers-reduced-motion: reduce` and
  assert no transform-based animation fires, content is still fully visible.

No unit-test layer planned — content is typed data, components are mostly
presentational, so e2e + a11y coverage is where the actual risk is.

---

Waiting for review before moving to a task breakdown.
