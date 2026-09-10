# Kinetic Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the terminal-styled portfolio with the approved "kinetic" colour-blocked identity (Familjen Grotesk, fixed palette) and a single GSAP-owned motion layer, on a feature branch that can be abandoned.

**Architecture:** Four phases, each ending green and committed: (1) visual foundation — tokens, fonts, restyle every section, `motion/react` still present; (2) GSAP core — `lib/gsap.ts` + `useReveal` replace `RevealOnScroll`/`Stagger`, `motion` removed; (3) signature effects — kinetic name, magnetic buttons, scroll-reactive marquee, shard field, projects reel; (4) contact `JS` shatter. Section components stay server components with small `"use client"` motion islands that take DOM refs, never selector strings.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4 (`@theme inline`), `next/font/google`, GSAP 3.15 + `@gsap/react` `useGSAP` (`ScrollTrigger`, `SplitText`, `Draggable`, `InertiaPlugin` — all bundled, all free in 3.15), Vitest (node env), Playwright (chromium).

**Spec:** `docs/superpowers/specs/2026-09-10-kinetic-redesign-design.md` — read it alongside this plan.

## Global Constraints

- **Branch only, clean replace.** No runtime old/new toggle. No merge to `main` / production without Jon's explicit approval. Rollback = don't merge.
- **One committed look.** No `@media (prefers-color-scheme: dark)` anywhere. Delete the existing one.
- **Palette (exact hex — the contract):** `--ink #0b120e` / `--ink-fg #eafbf1`; `--paper #f6f7f5` / `--paper-fg #0b120e`; `--field #0b6130` / `--field-fg #f6f7f5`; `--cyan #5cf2e6` / `--cyan-fg #0b3d24`; `--pink #ff5da2` / `--pink-fg #3a0a1f`; `--js-green #3ddc84`.
- **Type:** Familjen Grotesk (display), Archivo (body). No Martian Mono, no `font-mono` class, no `--font-mono` token.
- **All effects are triggered, not scrubbed.** No test asserts a mid-tween value — only coarse/structural outcomes.
- **Reduced-motion contract:** every effect wraps its GSAP work in `gsap.matchMedia()`. The `(prefers-reduced-motion: reduce)` branch calls `gsap.set(...)` to the final state — no tweens, no `ScrollTrigger`, no `SplitText`, no `Draggable`. Content is always in the a11y tree, visible, `transform: none`.
- **Accessibility gate, every phase:** `npx playwright test a11y` → axe `wcag2a wcag2aa wcag21a wcag21aa` = 0 violations.
- **Preserve for tests:** section `id`s (`#hero #about #experience #skills #projects #contact`), heading roles (h1/h2/h3), the `mailto:` link, the earlier-roles toggle with `aria-controls="earlier-roles"` + `aria-expanded`, nav section order (About → Experience → Skills → Projects → Contact), and an `sr-only` "Jon Stjärnström" inside the nav brand link.
- **Per-phase gate:** `pnpm lint && pnpm test && pnpm exec playwright test && pnpm build` all green before the phase's final commit.
- **Verifying GSAP motion:** use Playwright headless. The `claude-in-chrome` MCP tab throttles `requestAnimationFrame` and shows GSAP frozen — never trust it for motion.
- **GSAP + this app (from the contact-flip work):** `useGSAP({ scope })` scopes selector *strings* to the scope element — always pass resolved DOM elements to `ScrollTrigger.create({ trigger })` / `Draggable.create()`, never `"#id"`. `pin:` (if ever used) needs a resolved element inside `matchMedia`. `document.fonts.ready.then(() => ScrollTrigger.refresh())` once after mount.

---

## File Structure

**Created**

| Path | Responsibility |
| --- | --- |
| `lib/gsap.ts` | `registerGsap()` (idempotent plugin registration), `prefersReducedMotion()`, `useReveal(ref, opts?)` hook. The only module that imports GSAP plugins directly. |
| `components/motion/GsapBootstrap.tsx` | `"use client"`, rendered once in `layout.tsx`. Registers plugins + `document.fonts.ready → ScrollTrigger.refresh()`. Renders `null`. |
| `components/motion/KineticName.tsx` | `"use client"`. Splits the hero `<h1>` into chars and settles them in on load. |
| `components/motion/MagneticButton.tsx` | `"use client"`. Wraps one CTA; pointer-follow within ~40px on fine pointers. |
| `components/motion/ScrollMarquee.tsx` | `"use client"`. Infinite ticker whose speed/direction follows scroll velocity. |
| `components/motion/ShardField.tsx` | `"use client"`. Decorative squares: idle drift + parallax + `Draggable`/inertia. |
| `components/motion/ProjectsReel.tsx` | `"use client"`. 1 card → plain; 2+ → draggable inertia reel with scroll-snap fallback. |
| `components/motion/reel.ts` + `reel.test.ts` | `shouldReel(count)` pure helper (unit-tested). |
| `components/contact/ContactMark.tsx` | `"use client"`. The `JS` + shards shatter/settle on the contact section. |
| `components/ui/Mark.tsx` | The text `JS` brand lockup (replaces `<BlockMark>`). |

**Modified:** `app/layout.tsx`, `app/globals.css`, `app/opengraph-image.tsx`, `components/Nav.tsx`, `components/sections/{Hero,About,Experience,Skills,Projects,Contact}.tsx`, `components/ui/{SectionHeading,Tag,ContactCard}.tsx`, `components/command-palette/{AskPanel,AskLauncher}.tsx`, `scripts/generate-icons.mjs`, `public/{favicon.png,apple-touch-icon.png}`, `package.json`, `README.md`, `.gitignore`, `tests/e2e/{smoke,a11y,reduced-motion}.spec.ts`.

**Deleted:** `components/motion/{RevealOnScroll,Stagger,variants}.*`, `components/contact/FlipMark.tsx`, `components/ui/{BlockMark.tsx,block-mark.ts,block-mark.test.ts}`, `tests/e2e/contact-flip.spec.ts`.

**Note on testing style:** this repo tests animation with coarse e2e outcomes (see the two prior specs), not unit tests. Visual tasks below use the existing Playwright suite as their regression gate; only genuinely pure logic (`shouldReel`) gets a unit test.

---

## PHASE 1 — Visual foundation (no GSAP changes)

### Task 1: Palette tokens + Familjen Grotesk

**Files:**
- Modify: `app/globals.css` (full rewrite of the token section)
- Modify: `app/layout.tsx` (font imports + `<html>` className)
- Modify: `.gitignore`

**Interfaces:**
- Produces: Tailwind utilities `bg-ink bg-paper bg-field bg-cyan bg-pink` (+ `text-*` and `text-*-fg`, `text-js-green`), `font-display`, `font-sans`. `bg-background`/`text-foreground` still exist (map to paper/ink) for the overlay components.

- [ ] **Step 1: Rewrite the token section of `app/globals.css`**

Replace the file's contents from `@import "tailwindcss";` through the end of the dark `@media` block with:

```css
@import "tailwindcss";

:root {
  /* grounds */
  --ink: #0b120e;
  --ink-fg: #eafbf1;
  --paper: #f6f7f5;
  --paper-fg: #0b120e;
  --field: #0b6130;
  --field-fg: #f6f7f5;
  /* accents */
  --cyan: #5cf2e6;
  --cyan-fg: #0b3d24;
  --pink: #ff5da2;
  --pink-fg: #3a0a1f;
  --js-green: #3ddc84;

  /* page defaults, consumed by the skip link / overlays / <body> */
  --background: var(--paper);
  --foreground: var(--paper-fg);
}

@theme inline {
  --color-ink: var(--ink);
  --color-ink-fg: var(--ink-fg);
  --color-paper: var(--paper);
  --color-paper-fg: var(--paper-fg);
  --color-field: var(--field);
  --color-field-fg: var(--field-fg);
  --color-cyan: var(--cyan);
  --color-cyan-fg: var(--cyan-fg);
  --color-pink: var(--pink);
  --color-pink-fg: var(--pink-fg);
  --color-js-green: var(--js-green);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-archivo);
  --font-display: var(--font-familjen);
}
```

Keep the rest of the file **as-is** EXCEPT: delete the `@utility animate-block-in` block and its `@keyframes block-in`. **Keep** `html { overflow-x: clip }`, the `body { ... }` block (change nothing in it), and the `@utility animate-caret` + `@keyframes caret-blink` (the Ask panel + its reduced-motion test depend on them).

- [ ] **Step 2: Swap fonts in `app/layout.tsx`**

Change the font import and instances:

```tsx
import { Archivo, Familjen_Grotesk } from "next/font/google";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const familjen = Familjen_Grotesk({
  variable: "--font-familjen",
  subsets: ["latin"],
});
```

Update the `<html>` className (drop `martianMono.variable`, add `familjen.variable`):

```tsx
className={`${archivo.variable} ${familjen.variable} h-full scroll-pt-20 antialiased sm:scroll-pt-16`}
```

Leave `<MotionConfig>`, `<FlipMark>`, everything else untouched.

- [ ] **Step 3: Add `design-canvas/` to `.gitignore`**

Append a line: `design-canvas/`

- [ ] **Step 4: Verify build + unit tests**

Run: `pnpm lint && pnpm test && pnpm build`
Expected: all pass. (The site now renders in Familjen Grotesk with the new tokens available, but sections still use the old `bg-background`/`text-accent` styling — that's fine, this task is groundwork.)

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx .gitignore
git commit -m "feat(redesign): palette tokens + Familjen Grotesk, drop dark mode"
```

---

### Task 2: Text `<Mark>` + Nav rewrite

**Files:**
- Create: `components/ui/Mark.tsx`
- Modify: `components/Nav.tsx` (full rewrite)
- Modify: `tests/e2e/smoke.spec.ts` (nav link name)
- Modify: `tests/e2e/a11y.spec.ts` (traversal test)

**Interfaces:**
- Produces: `<Mark className?: string size?: "nav" | "lg" />` — renders `role="img" aria-label="Jon Stjärnström"`.
- Consumes: palette utilities from Task 1.
- Note: `BlockMark` / `block-mark.ts` are **not** deleted here — `Contact.tsx` and `FlipMark.tsx` still import them until Task 8.

- [ ] **Step 1: Create `components/ui/Mark.tsx`**

```tsx
type MarkProps = {
  /** Tailwind classes for the box — background + text colour. */
  className?: string;
  size?: "nav" | "lg";
};

/**
 * The "JS" brand lockup — Jon Stjärnström / JavaScript. Plain text in a
 * rounded box (replaces the old block-glyph <BlockMark>). Decorative for
 * sighted users; carries the name for assistive tech.
 */
export function Mark({ className = "", size = "nav" }: MarkProps) {
  const scale =
    size === "nav"
      ? "rounded-md px-1.5 py-0.5 text-[17px] sm:text-xl"
      : "rounded-lg px-2.5 py-1 text-2xl";
  return (
    <span
      role="img"
      aria-label="Jon Stjärnström"
      className={`inline-flex items-center font-display font-bold leading-none tracking-[-0.06em] ${scale} ${className}`}
    >
      JS
    </span>
  );
}
```

- [ ] **Step 2: Update the nav-link name in `tests/e2e/smoke.spec.ts`**

In the test `"contact is reachable within one click from the top of the page"`, change:

```ts
await page.getByRole("link", { name: "contact", exact: true }).click();
```
to:
```ts
await page.getByRole("link", { name: "Contact", exact: true }).click();
```

- [ ] **Step 3: Rewrite the traversal test in `tests/e2e/a11y.spec.ts`**

Replace the whole `"keyboard-only traversal reaches nav, hero CTAs, and contact"` test with:

```ts
  test("keyboard-only traversal reaches the skip link, nav, and hero CTAs", async ({
    page,
  }) => {
    await page.goto("/");

    const navStops: (string | RegExp)[] = [
      "Skip to content",
      /Jon Stjärnström/,
      "About",
      "Experience",
      "Skills",
      "Projects",
      "Contact",
    ];

    for (const name of navStops) {
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");
      await expect(focused).toBeVisible();
      await expect(focused).toHaveText(
        typeof name === "string" ? new RegExp(name) : name,
      );
    }

    // The two hero CTAs are the next focus stops — assert they land,
    // not their exact label.
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
  });
```

- [ ] **Step 4: Run the two tests to see them fail**

Run: `pnpm exec playwright test a11y.spec.ts -g "keyboard-only traversal" smoke.spec.ts -g "reachable within one click from the top"`
Expected: FAIL — nav still renders lowercase `about`/`contact` and `<BlockMark>`, so `"About"` / `"Contact"` / the sr-only text don't match yet.

- [ ] **Step 5: Rewrite `components/Nav.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { Mark } from "@/components/ui/Mark";

const navItems = [
  { href: "#about", label: "About", id: "about" },
  { href: "#experience", label: "Experience", id: "experience" },
  { href: "#skills", label: "Skills", id: "skills" },
  { href: "#projects", label: "Projects", id: "projects" },
  { href: "#contact", label: "Contact", id: "contact" },
];

export function Nav({
  available,
  location,
}: {
  available: boolean;
  location: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const sectionIds = navItems.map((item) => item.id);
    const activationLine = 140;

    function updateActive() {
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) {
        setActiveId(sectionIds[sectionIds.length - 1]);
        return;
      }
      let current: string | null = null;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= activationLine) current = id;
      }
      setActiveId(current);
    }

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-field-fg/15 bg-field text-field-fg">
      <div className="mx-auto flex max-w-6xl flex-col gap-2.5 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 sm:justify-start">
          <a
            href="#hero"
            className="flex shrink-0 items-center gap-2 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-field-fg"
          >
            <Mark className="bg-paper text-field" />
            <span className="sr-only">Jon Stjärnström — home</span>
          </a>
          {available ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan px-3 py-1 text-xs font-semibold text-cyan-fg">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-fg" aria-hidden="true" />
              Available for work
            </span>
          ) : null}
          <span className="hidden whitespace-nowrap text-field-fg/70 lg:inline">
            {location}, Sweden
          </span>
        </div>
        <ul className="flex justify-between gap-x-2 sm:shrink-0 sm:justify-start sm:gap-5">
          {navItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={isActive ? "location" : undefined}
                  className={`rounded transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-fg ${
                    isActive
                      ? "font-semibold text-cyan"
                      : "text-field-fg/80 hover:text-cyan"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
```

(`location` prop already arrives as `"Stockholm"` from `profile.contact.location`.)

- [ ] **Step 6: Run the tests to see them pass**

Run: `pnpm exec playwright test a11y.spec.ts -g "keyboard-only traversal" smoke.spec.ts -g "reachable within one click from the top"`
Expected: PASS

- [ ] **Step 7: Run lint + full smoke/a11y suites**

Run: `pnpm lint && pnpm exec playwright test smoke.spec.ts a11y.spec.ts`
Expected: PASS. If `a11y` flags contrast on the cyan pill or nav links, adjust the `-fg` shade (darken) until axe is clean, then re-run.

- [ ] **Step 8: Commit**

```bash
git add components/ui/Mark.tsx components/Nav.tsx tests/e2e/smoke.spec.ts tests/e2e/a11y.spec.ts
git commit -m "feat(redesign): text JS mark + green colour-blocked nav"
```

---

### Task 3: `SectionHeading` + `Tag` components

**Files:**
- Modify: `components/ui/SectionHeading.tsx` (full rewrite — new API)
- Modify: `components/ui/Tag.tsx` (full rewrite — new API)

**Interfaces:**
- Produces:
  - `<SectionHeading id: string index: string kicker: string title: string accentClassName?: string />`
  - `<Tag variant?: "plain" | "cyan" | "pink" tone?: "light" | "dark">{children}</Tag>`
- Consumed by: About, Experience, Skills, Projects (Tasks 4–7). Those call sites are updated in their own tasks — this task only changes the two components, so **the build will break** until Task 4. That is acceptable within Phase 1; run `pnpm build` at the end of Task 7, not here.

- [ ] **Step 1: Rewrite `components/ui/SectionHeading.tsx`**

```tsx
type SectionHeadingProps = {
  id: string;
  /** Two-digit section number, e.g. "01". */
  index: string;
  /** Short section name next to the number, e.g. "About". */
  kicker: string;
  /** The full heading line. */
  title: string;
  /** Accent colour class for the number label. */
  accentClassName?: string;
};

export function SectionHeading({
  id,
  index,
  kicker,
  title,
  accentClassName = "text-cyan",
}: SectionHeadingProps) {
  return (
    <div className="mb-12">
      <p
        className={`mb-4 inline-block -rotate-2 font-display text-sm font-semibold tracking-wide ${accentClassName}`}
      >
        {index} — {kicker}
      </p>
      <h2
        id={id}
        className="font-display text-[clamp(2.4rem,6vw,4rem)] font-bold uppercase leading-[0.95] tracking-tight"
      >
        {title}
      </h2>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite `components/ui/Tag.tsx`**

```tsx
import type { ReactNode } from "react";

type TagProps = {
  children: ReactNode;
  variant?: "plain" | "cyan" | "pink";
  /** "light" = tag sits on a dark ground; "dark" = on paper. */
  tone?: "light" | "dark";
};

const STYLES: Record<string, string> = {
  "plain-dark": "border border-paper-fg/20 text-paper-fg/80",
  "plain-light": "border border-field-fg/25 text-field-fg/85",
  "cyan-dark": "bg-cyan font-semibold text-cyan-fg",
  "cyan-light": "bg-cyan font-semibold text-cyan-fg",
  "pink-dark": "bg-pink font-semibold text-pink-fg",
  "pink-light": "border border-pink text-pink",
};

export function Tag({
  children,
  variant = "plain",
  tone = "dark",
}: TagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        STYLES[`${variant}-${tone}`]
      }`}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 3: Commit** (build is intentionally red until Task 4)

```bash
git add components/ui/SectionHeading.tsx components/ui/Tag.tsx
git commit -m "feat(redesign): numbered SectionHeading + colour-pill Tag"
```

---

### Task 4: Restyle About + Skills (paper sections)

**Files:**
- Modify: `components/sections/About.tsx` (full rewrite)
- Modify: `components/sections/Skills.tsx` (full rewrite)

**Interfaces:**
- Consumes: `SectionHeading` (index/kicker/title), `Tag` (variant/tone), `RevealOnScroll`/`StaggerGroup` (still present — Phase 2 swaps them).

- [ ] **Step 1: Rewrite `components/sections/About.tsx`**

```tsx
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";

export function About({ paragraphs }: { paragraphs: string[] }) {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="bg-paper px-6 py-24 text-paper-fg sm:px-16 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <RevealOnScroll>
          <SectionHeading
            id="about-heading"
            index="01"
            kicker="About"
            title="How he works"
            accentClassName="text-pink"
          />
        </RevealOnScroll>
        <RevealOnScroll className="flex flex-col gap-5 text-lg leading-relaxed text-paper-fg/80">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Rewrite `components/sections/Skills.tsx`**

```tsx
import type { SkillGroup } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";

export function Skills({ groups }: { groups: SkillGroup[] }) {
  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="bg-paper px-6 py-24 text-paper-fg sm:px-16 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll>
          <SectionHeading
            id="skills-heading"
            index="03"
            kicker="Skills"
            title="Grouped by area"
            accentClassName="text-pink"
          />
        </RevealOnScroll>
        <StaggerGroup>
          <dl className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <StaggerItem key={group.category}>
                <dt className="mb-3 font-display text-base font-semibold">
                  {group.category}
                </dt>
                <dd className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <Tag key={skill} tone="dark">
                      {skill}
                    </Tag>
                  ))}
                </dd>
              </StaggerItem>
            ))}
          </dl>
        </StaggerGroup>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/sections/About.tsx components/sections/Skills.tsx
git commit -m "feat(redesign): paper-ground About + Skills"
```

---

### Task 5: Restyle Hero (static — no motion yet)

**Files:**
- Modify: `components/sections/Hero.tsx` (full rewrite)

**Interfaces:**
- Keeps `id="hero"`, `aria-labelledby="hero-heading"`, `<h1 id="hero-heading" aria-label={profile.name}>`, the `⌘K` button calling `setOpen(true)`.
- The two CTAs are plain `<a>` now; Task 13 wraps them in `<MagneticButton>`.
- Adds static shard `<span>`s with `data-shard` — Task 15's `<ShardField>` will replace this block.

- [ ] **Step 1: Rewrite `components/sections/Hero.tsx`**

```tsx
"use client";

import type { Profile } from "@/lib/types";
import { useCommandPalette } from "@/components/command-palette/useCommandPalette";

export function Hero({ profile }: { profile: Profile }) {
  const { setOpen } = useCommandPalette();
  const [first, ...restWords] = profile.name.split(" ");
  const last = restWords.join(" ");

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-field px-6 py-24 text-field-fg sm:px-16 sm:py-32"
    >
      {/* Decorative shards — replaced by <ShardField> in a later task. */}
      <div aria-hidden="true">
        <span
          data-shard
          className="absolute right-10 top-24 h-12 w-12 rounded-xl bg-pink sm:right-28"
        />
        <span
          data-shard
          className="absolute right-40 top-1/2 h-7 w-7 bg-cyan sm:right-72"
        />
        <span
          data-shard
          className="absolute bottom-24 right-16 hidden h-9 w-9 rounded-lg bg-paper sm:block"
        />
      </div>

      <div className="mx-auto max-w-6xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-cyan">
          Stockholm · Consulting · Open
        </p>

        <h1
          id="hero-heading"
          aria-label={profile.name}
          className="font-display text-[clamp(2.75rem,11vw,8.25rem)] font-bold uppercase leading-[0.9] tracking-[-0.04em]"
        >
          <span aria-hidden="true">
            {first}
            <br />
            <span className="text-pink">{last.slice(0, 2)}</span>
            <span className="[-webkit-text-stroke:2px_var(--field-fg)] [color:transparent]">
              {last.slice(2)}
            </span>
          </span>
        </h1>

        <p className="mt-9 max-w-2xl text-xl text-field-fg/80 sm:text-2xl">
          {profile.roleLine}
          <span
            className="ml-1 inline-block h-[1em] w-[0.5em] translate-y-[0.14em] bg-cyan motion-safe:animate-caret"
            aria-hidden="true"
          />
        </p>
        <p className="mt-4 max-w-xl text-base text-field-fg/70 sm:text-lg">
          {profile.heroHook}
        </p>

        <div className="mt-11 flex flex-col gap-3 sm:flex-row">
          <a
            href="#contact"
            className="rounded-lg bg-cyan px-6 py-4 text-center font-display font-semibold text-cyan-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-fg"
          >
            Get in touch →
          </a>
          <a
            href="#experience"
            className="rounded-lg border-2 border-field-fg px-6 py-4 text-center font-display font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-fg"
          >
            See the work
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-8 w-fit rounded text-sm text-field-fg/70 transition-colors hover:text-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-fg"
        >
          Press <kbd className="rounded bg-field-fg/15 px-1.5 py-0.5">⌘K</kbd> to
          jump around the site
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run traversal + smoke to confirm still green**

Run: `pnpm exec playwright test a11y.spec.ts -g "keyboard-only traversal" smoke.spec.ts`
Expected: PASS (h1 has `aria-label={profile.name}`; CTAs are focusable links).

- [ ] **Step 3: Commit**

```bash
git add components/sections/Hero.tsx
git commit -m "feat(redesign): kinetic hero (static)"
```

---

### Task 6: Restyle Experience

**Files:**
- Modify: `components/sections/Experience.tsx` (full rewrite)

**Interfaces:**
- Keeps `id="experience"`, `aria-labelledby="experience-heading"`, the h3-per-role, the toggle button with `aria-expanded` + `aria-controls="earlier-roles"` and text matching `/show earlier roles/i` ↔ `/hide earlier roles/i`, and `#earlier-roles` list.
- Each role card gets `data-reveal` (Phase 2's `useReveal` uses it). Keeps a `<div>` wrapper per `<li>` (`#experience li > div`).

- [ ] **Step 1: Rewrite `components/sections/Experience.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { CondensedRole, Role } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";

const HIGHLIGHT_TECH = new Set(["Next.js", "React", "Claude Code"]);

function techVariant(tech: string): "plain" | "cyan" | "pink" {
  if (tech === "React") return "pink";
  if (HIGHLIGHT_TECH.has(tech)) return "cyan";
  return "plain";
}

export function Experience({
  experience,
  earlierRoles,
}: {
  experience: Role[];
  earlierRoles: CondensedRole[];
}) {
  const [showEarlier, setShowEarlier] = useState(false);

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="bg-field px-6 py-24 text-field-fg sm:px-16 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll>
          <SectionHeading
            id="experience-heading"
            index="02"
            kicker="Experience"
            title="Selected roles"
          />
        </RevealOnScroll>

        <StaggerGroup>
          <ol className="flex flex-col">
            {experience.map((role) => (
              <li
                key={role.company}
                className="border-t-2 border-field-fg/20 py-8"
              >
                <StaggerItem>
                  <div data-reveal>
                    <p className="text-sm font-semibold text-cyan">
                      {role.dates.start} — {role.dates.end}
                    </p>
                    <div className="mt-2.5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                        {role.company}
                      </h3>
                      <p className="text-sm text-field-fg/60">{role.title}</p>
                    </div>
                    <p className="mt-4 max-w-3xl text-field-fg/85">
                      {role.summary}
                    </p>
                    <ul className="mt-4 list-disc space-y-1 pl-5 text-field-fg/85">
                      {role.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {role.tech.map((tech) => (
                        <Tag key={tech} tone="light" variant={techVariant(tech)}>
                          {tech}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </StaggerItem>
              </li>
            ))}
          </ol>
        </StaggerGroup>

        <RevealOnScroll className="border-t-2 border-field-fg/20 pt-7">
          <button
            type="button"
            onClick={() => setShowEarlier((prev) => !prev)}
            aria-expanded={showEarlier}
            aria-controls="earlier-roles"
            className="rounded text-sm font-semibold text-cyan underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-fg"
          >
            {showEarlier ? "Hide earlier roles" : "Show earlier roles"}
          </button>
          <ul
            id="earlier-roles"
            hidden={!showEarlier}
            className="mt-4 flex flex-col gap-2 text-sm text-field-fg/70"
          >
            {earlierRoles.map((role) => (
              <li
                key={role.company}
                className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-field-fg/15 py-2"
              >
                <span>
                  {role.company}
                  {role.title ? ` — ${role.title}` : ""}
                </span>
                {role.dates ? (
                  <span>
                    {role.dates.start} — {role.dates.end}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </RevealOnScroll>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run the toggle + a11y tests**

Run: `pnpm exec playwright test smoke.spec.ts -g "earlier roles" a11y.spec.ts -g "experience toggle"`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/sections/Experience.tsx
git commit -m "feat(redesign): green-ground Experience with colour-pill tech"
```

---

### Task 7: Restyle Projects (static card — reel comes in Phase 3)

**Files:**
- Modify: `components/sections/Projects.tsx` (full rewrite)

**Interfaces:**
- Keeps `id="projects"`, `aria-labelledby="projects-heading"`, each project as an `<a href={project.url}>` with an h3.
- Renders the cards in a plain row for now; Task 16 introduces `<ProjectsReel>`.

- [ ] **Step 1: Rewrite `components/sections/Projects.tsx`**

```tsx
import type { SideProject } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";

export function Projects({ projects }: { projects: SideProject[] }) {
  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="bg-pink px-6 py-24 text-pink-fg sm:px-16 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll>
          <SectionHeading
            id="projects-heading"
            index="04"
            kicker="Side projects"
            title="Built for fun"
            accentClassName="text-field"
          />
        </RevealOnScroll>

        <div className="flex gap-6 overflow-x-auto pb-2">
          {projects.map((project) => (
            <a
              key={project.name}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block w-full max-w-xl shrink-0 rounded-2xl border-2 border-pink-fg bg-paper p-8 text-paper-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-fg"
            >
              <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {project.name}
                <span className="ml-1.5 inline-block text-field transition-transform group-hover:translate-x-0.5">
                  ↗
                </span>
                <span className="sr-only"> (opens in a new tab)</span>
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-paper-fg/80">
                {project.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <Tag key={tech} tone="dark">
                    {tech}
                  </Tag>
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/sections/Projects.tsx
git commit -m "feat(redesign): pink-ground Projects"
```

---

### Task 8: Rebuild Contact static + delete FlipMark / BlockMark

**Files:**
- Modify: `components/sections/Contact.tsx` (full rewrite)
- Modify: `app/layout.tsx` (remove the `<FlipMark>` dynamic import + render)
- Modify: `app/globals.css` (delete the now-unused `--band-*` tokens + their `@theme` lines)
- Delete: `components/contact/FlipMark.tsx`, `components/ui/BlockMark.tsx`, `components/ui/block-mark.ts`, `components/ui/block-mark.test.ts`, `tests/e2e/contact-flip.spec.ts`
- Modify: `tests/e2e/reduced-motion.spec.ts` (remove the FlipMark test)

**Interfaces:**
- Keeps `id="contact"`, `aria-labelledby="contact-heading"`, the `mailto:` link, the LinkedIn link + `sr-only` "(opens in a new tab)", and `[data-contact-reveal]` on each copy line (a11y.spec waits on `[data-contact-reveal]` `.last()` opacity).
- Renders a static `<Mark size="lg">` + static shard `<span data-shard>`s. Task 17 wraps them in `<ContactMark>`.

- [ ] **Step 1: Delete the files**

```bash
git rm components/contact/FlipMark.tsx components/ui/BlockMark.tsx components/ui/block-mark.ts components/ui/block-mark.test.ts tests/e2e/contact-flip.spec.ts
```

- [ ] **Step 2: Remove `<FlipMark>` from `app/layout.tsx`**

Delete the line `const FlipMark = dynamic(() => import("@/components/contact/FlipMark"));`, the `<FlipMark />` in the JSX, and the now-unused `import dynamic from "next/dynamic";` if nothing else uses it (grep first).

- [ ] **Step 3: Rewrite `components/sections/Contact.tsx`**

```tsx
import type { Profile } from "@/lib/types";
import { Mark } from "@/components/ui/Mark";

export function Contact({ contact }: { contact: Profile["contact"] }) {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      data-contact
      className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden bg-ink px-6 py-28 text-ink-fg"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <p
          id="contact-heading"
          className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-fg/70"
        >
          <span className="text-js-green">05 — </span>Contact
        </p>

        <div
          className="relative my-14 flex h-52 items-center justify-center"
          aria-hidden="true"
        >
          <span data-shard className="absolute left-[calc(50%-90px)] top-16 h-8 w-8 rounded-lg bg-js-green" />
          <span data-shard className="absolute left-[calc(50%+60px)] top-16 h-6 w-6 bg-cyan" />
          <span data-shard className="absolute left-[calc(50%+40px)] top-40 h-7 w-7 rounded bg-pink" />
          <Mark size="lg" className="!text-[clamp(5rem,20vw,10rem)] text-js-green" />
        </div>

        <p className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Let&apos;s build something.
        </p>

        <div className="mt-8 flex w-full max-w-md flex-col items-center gap-3.5 text-sm">
          {contact.availableForConsulting ? (
            <p data-contact-reveal className="text-ink-fg/70">
              <span className="text-js-green">●</span> {contact.statusLine}
            </p>
          ) : null}

          <p data-contact-reveal>
            <a
              href={`mailto:${contact.email}`}
              className="rounded font-display text-lg font-bold text-js-green [overflow-wrap:anywhere] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-fg sm:text-2xl"
            >
              {contact.email}
            </a>
          </p>

          <p data-contact-reveal className="text-ink-fg/70">
            {contact.company} · {contact.location}
          </p>

          <p data-contact-reveal>
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded text-ink-fg/70 underline underline-offset-4 hover:text-js-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-fg"
            >
              LinkedIn<span className="sr-only"> (opens in a new tab)</span> ↗
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Delete `--band-*` from `app/globals.css`**

Remove the six `--band-*` custom properties from `:root` and the three `--color-band-*` lines from `@theme inline`. Run `grep -rn "band-" --include="*.tsx" --include="*.ts" --include="*.css" .` — expect **zero** matches outside `node_modules`.

- [ ] **Step 5: Remove the FlipMark test from `tests/e2e/reduced-motion.spec.ts`**

Delete the entire `test("contact flip: no overlay, static J shown, nav mark stays", ...)` block. Leave every other test in the file (they'll be finalised in Task 11).

- [ ] **Step 6: Run lint, build, and the reduced-motion + smoke + a11y suites**

Run: `pnpm lint && pnpm build && pnpm exec playwright test smoke.spec.ts a11y.spec.ts reduced-motion.spec.ts`
Expected: PASS. If a11y flags contrast on `text-ink-fg/70` on `--ink`, bump the opacity (e.g. `/80`) until clean.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(redesign): ink Contact sign-off; remove FlipMark + BlockMark + band tokens"
```

---

### Task 9: OG image, favicons, Ask panel restyle, Martian Mono removal — Phase 1 close

**Files:**
- Modify: `app/opengraph-image.tsx`
- Modify: `scripts/generate-icons.mjs`
- Modify: `public/favicon.png`, `public/apple-touch-icon.png` (regenerated)
- Modify: `components/command-palette/AskPanel.tsx`, `components/command-palette/AskLauncher.tsx`, `components/ui/ContactCard.tsx`
- Modify: `app/globals.css` (delete `--font-mono` mapping if still present — Task 1 already removed it; confirm), `app/layout.tsx` (drop the `Martian_Mono` import — now unused)
- Modify: `README.md`

**Interfaces:**
- Keeps the Ask panel behaviour, the `motion-safe:animate-caret` class on the streaming caret (reduced-motion test), the `role="dialog"` name matching `/ask/i`.

- [ ] **Step 1: Rewrite `scripts/generate-icons.mjs` to render the text lockup**

Replace the `GRID`/`rects` logic with a text `JS`:

```js
const INK = "#0b120e";
const GREEN = "#3ddc84";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="18" fill="${INK}"/>
  <text x="50" y="50" dy="0.35em" text-anchor="middle"
        font-family="Familjen Grotesk, Archivo, sans-serif"
        font-weight="700" font-size="62" letter-spacing="-4"
        fill="${GREEN}">JS</text>
</svg>`;
```

Keep the `sharp`-from-store resolution, `render(64, "public/favicon.png")` and `render(180, "public/apple-touch-icon.png")`. (`sharp` rasterises the system-fallback if Familjen Grotesk isn't installed on the machine — acceptable for an icon; the shape reads.)

- [ ] **Step 2: Regenerate the PNGs**

Run: `pnpm icons`
Expected: writes `public/favicon.png` + `public/apple-touch-icon.png`. Open both — a green `JS` on a dark rounded square.

- [ ] **Step 3: Rewrite `app/opengraph-image.tsx`**

- Fetch the **Familjen Grotesk** 700 TTF instead of Martian Mono (find the URL at `https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@700` → copy the `.ttf` `src`). Keep the Archivo 500 fetch.
- Palette: `const INK = "#0b120e"; const GREEN = "#3ddc84"; const PAPER = "#eafbf1";`
- Drop the split first-letter / underline treatment. Render the name as one block in Familjen Grotesk 700, uppercase, `fontSize: 104`, `lineHeight: 0.92`, `letterSpacing: -3`, colour `GREEN`; role line + hook below in Archivo as today.
- `fonts: [{ name: "Familjen Grotesk", data: display, weight: 700, style: "normal" }, { name: "Archivo", data: sans, weight: 500, style: "normal" }]`.

- [ ] **Step 4: Restyle `components/ui/ContactCard.tsx`**

Swap `text-foreground/80` → `text-paper-fg/80`, `bg-accent` → `bg-js-green`, `text-accent` → `text-js-green`, `font-mono` → `font-display`. No structural change.

- [ ] **Step 5: Restyle the Ask panel + launcher**

In `AskLauncher.tsx`: `font-mono` → remove (default sans); `border-foreground/15` → `border-paper-fg/15`; `hover:border-accent hover:text-accent` → `hover:border-js-green hover:text-js-green`; `text-accent` (`$`) → `text-js-green`. Keep the `$ ask jon-bot` label and all behaviour.

In `AskPanel.tsx`: replace every `font-mono` with nothing (sans) or `font-display` for the `~/ask` heading; `border-foreground/10` stays (maps to ink at 10% — fine on the paper panel); `bg-accent text-background` on the Send button → `bg-js-green text-ink`; `hover:text-accent` / `hover:border-accent/40` → `hover:text-js-green` / `hover:border-js-green/40`; `text-accent` → `text-js-green`. **Keep** the `motion-safe:animate-caret` spans exactly as they are.

- [ ] **Step 6: Drop the unused Martian Mono import from `app/layout.tsx`**

Remove `Martian_Mono` from the `next/font/google` import and delete the `const martianMono = …` block. Run `grep -rn "martian\|Martian\|font-mono" --include="*.tsx" --include="*.ts" --include="*.css" .` — expect zero matches outside `node_modules`.

- [ ] **Step 7: Update `README.md`**

Replace any mention of Martian Mono / `motion/react` reveals / `BlockMark` / the contact-flip with a two-line note: the site uses Familjen Grotesk + Archivo, a fixed colour-blocked palette, and a GSAP motion layer (details land in Phase 2–4).

- [ ] **Step 8: Full Phase 1 gate**

Run: `pnpm lint && pnpm test && pnpm exec playwright test && pnpm build`
Expected: ALL PASS. Manually load `pnpm dev` and eyeball every section against `design-canvas/Main.dc.html` + `MainMobile.dc.html` at desktop and 390px widths. Fix spacing/scale/contrast discrepancies now.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(redesign): OG image + favicons + Ask panel restyle; remove Martian Mono"
```

---

## PHASE 2 — GSAP core

### Task 10: `lib/gsap.ts` + `GsapBootstrap`

**Files:**
- Create: `lib/gsap.ts`
- Create: `components/motion/GsapBootstrap.tsx`
- Modify: `app/layout.tsx` (drop `<MotionConfig>`, add `<GsapBootstrap />`)

**Interfaces:**
- Produces:
  - `registerGsap(): void` — idempotent.
  - `prefersReducedMotion(): boolean` — SSR-safe.
  - `useReveal<T extends HTMLElement>(ref: RefObject<T | null>, opts?: { selector?: string; y?: number; stagger?: number; start?: string }): void`
  - `<GsapBootstrap />` — renders `null`.

- [ ] **Step 1: Verify the GSAP plugin entry points resolve**

Run: `node -e "['gsap/ScrollTrigger','gsap/SplitText','gsap/Draggable','gsap/InertiaPlugin'].forEach(m=>require(m))"`
Expected: no error (they're all present in `node_modules/gsap/`). If any throws, stop and report — the plan assumes GSAP 3.15 bundles them.

- [ ] **Step 2: Create `lib/gsap.ts`**

```ts
"use client";

import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { useGSAP } from "@gsap/react";

let registered = false;

/** Register every GSAP plugin the site uses. Idempotent (HMR-safe). */
export function registerGsap(): void {
  if (registered) return;
  gsap.registerPlugin(
    useGSAP,
    ScrollTrigger,
    SplitText,
    Draggable,
    InertiaPlugin,
  );
  registered = true;
}

registerGsap();

export const REDUCED = "(prefers-reduced-motion: reduce)";
export const NO_PREFERENCE = "(prefers-reduced-motion: no-preference)";

/** True when the user asked for reduced motion. SSR-safe (false on server). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(REDUCED).matches;
}

interface RevealOptions {
  selector?: string;
  y?: number;
  stagger?: number;
  start?: string;
}

/**
 * Stagger-reveals `[data-reveal]` descendants of `ref` as it scrolls into
 * view. Replaces <RevealOnScroll> / <Stagger>. Reduced motion: elements are
 * shown immediately, untransformed, with no ScrollTrigger.
 */
export function useReveal<T extends HTMLElement>(
  ref: RefObject<T | null>,
  opts: RevealOptions = {},
): void {
  const {
    selector = "[data-reveal]",
    y = 16,
    stagger = 0.08,
    start = "top 85%",
  } = opts;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const targets = Array.from(el.querySelectorAll<HTMLElement>(selector));
      if (targets.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(REDUCED, () => {
        gsap.set(targets, { opacity: 1, y: 0, clearProps: "transform" });
      });

      mm.add(NO_PREFERENCE, () => {
        gsap.from(targets, {
          opacity: 0,
          y,
          duration: 0.5,
          ease: "power2.out",
          stagger,
          scrollTrigger: { trigger: el, start, once: true },
        });
      });

      return () => mm.revert();
    },
    { scope: ref },
  );
}
```

- [ ] **Step 3: Create `components/motion/GsapBootstrap.tsx`**

```tsx
"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerGsap } from "@/lib/gsap";

/**
 * One-time GSAP setup. `next/font` swaps fonts after first paint, shifting
 * every ScrollTrigger measurement — refresh once the fonts settle. Renders
 * nothing.
 */
export function GsapBootstrap() {
  useEffect(() => {
    registerGsap();
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
```

- [ ] **Step 4: Wire into `app/layout.tsx`**

- Remove `import { MotionConfig } from "motion/react";` and unwrap `<MotionConfig reducedMotion="user">…</MotionConfig>` (keep its children).
- Add `import { GsapBootstrap } from "@/components/motion/GsapBootstrap";` and render `<GsapBootstrap />` just inside `<body>` (before `<CommandPaletteProvider>` is fine).

- [ ] **Step 5: Build + lint**

Run: `pnpm lint && pnpm build`
Expected: PASS. (`motion` is still imported by `RevealOnScroll`/`Stagger` — that's Task 11.)

- [ ] **Step 6: Commit**

```bash
git add lib/gsap.ts components/motion/GsapBootstrap.tsx app/layout.tsx
git commit -m "feat(redesign): GSAP core — registerGsap, useReveal, GsapBootstrap"
```

---

### Task 11: Swap `RevealOnScroll`/`Stagger` → `useReveal`; remove `motion`

**Files:**
- Modify: `components/sections/{About,Skills,Experience,Projects}.tsx`
- Delete: `components/motion/RevealOnScroll.tsx`, `components/motion/Stagger.tsx`, `components/motion/variants.ts`
- Modify: `package.json` (remove `motion`)
- Modify: `tests/e2e/reduced-motion.spec.ts` (finalise the reveal assertions)

**Interfaces:**
- Consumes: `useReveal` from Task 10.

- [ ] **Step 1: Convert `About.tsx`**

Make it a client component that reveals its content:

```tsx
"use client";

import { useRef } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useReveal } from "@/lib/gsap";

export function About({ paragraphs }: { paragraphs: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="bg-paper px-6 py-24 text-paper-fg sm:px-16 sm:py-28"
    >
      <div
        ref={ref}
        className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
      >
        <div data-reveal>
          <SectionHeading
            id="about-heading"
            index="01"
            kicker="About"
            title="How he works"
            accentClassName="text-pink"
          />
        </div>
        <div data-reveal className="flex flex-col gap-5 text-lg leading-relaxed text-paper-fg/80">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Convert `Skills.tsx`**

`"use client"`, a `ref` on the `max-w-6xl` wrapper, `useReveal(ref)`, drop the `RevealOnScroll`/`StaggerGroup`/`StaggerItem` imports and wrappers, put `data-reveal` on the `SectionHeading` wrapper `<div>` and on each `<StaggerItem>`-replacement `<div>` (one per skill group). Structure otherwise unchanged from Task 4.

- [ ] **Step 3: Convert `Experience.tsx`**

Already `"use client"`. Add `const ref = useRef<HTMLDivElement>(null); useReveal(ref);`, put `ref` on the `max-w-6xl` wrapper. Remove `RevealOnScroll`/`StaggerGroup`/`StaggerItem` imports + wrappers. Keep the `data-reveal` `<div>` already inside each `<li>` (from Task 6). Put `data-reveal` on the `SectionHeading` wrapper and on the earlier-roles block wrapper.

- [ ] **Step 4: Convert `Projects.tsx`**

`"use client"`, `ref` on the `max-w-6xl` wrapper, `useReveal(ref)`, drop `RevealOnScroll`, `data-reveal` on the `SectionHeading` wrapper and the card row `<div>`.

- [ ] **Step 5: Delete the old motion components + dep**

```bash
git rm components/motion/RevealOnScroll.tsx components/motion/Stagger.tsx components/motion/variants.ts
pnpm remove motion
```

- [ ] **Step 6: Verify nothing still imports `motion`**

Run: `grep -rn "motion/react\|\"motion\"" --include="*.tsx" --include="*.ts" . | grep -v node_modules`
Expected: no output.

- [ ] **Step 7: Finalise `tests/e2e/reduced-motion.spec.ts`**

The file should now contain exactly these tests (adjust the existing ones, they're close):

```ts
import { expect, test } from "@playwright/test";
import { openAskPanel } from "./helpers";

test.use({ contextOptions: { reducedMotion: "reduce" } });

test.describe("reduced motion", () => {
  test("hero content is visible immediately, no animation dependency", async ({
    page,
  }) => {
    await page.goto("/");
    const heading = page.locator("#hero-heading");
    await expect(heading).toBeVisible();
    await expect(heading).toHaveCSS("opacity", "1");
    await expect(heading).toHaveCSS("transform", "none");
  });

  test("below-the-fold sections are fully visible once scrolled to", async ({
    page,
  }) => {
    await page.goto("/");
    for (const id of ["about", "experience", "skills", "projects", "contact"]) {
      const section = page.locator(`#${id}`);
      await section.scrollIntoViewIfNeeded();
      const heading = section.getByRole("heading", { level: 2 }).first();
      await expect(heading).toBeVisible();
      await expect(heading).toHaveCSS("opacity", "1");
    }
  });

  test("revealed elements carry no residual transform", async ({ page }) => {
    await page.goto("/");
    await page.locator("#experience").scrollIntoViewIfNeeded();
    const revealed = page.locator("#experience [data-reveal]");
    const count = await revealed.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(revealed.nth(i)).toHaveCSS("transform", "none");
    }
  });

  test("ask panel streaming caret does not blink", async ({ page }) => {
    await page.route("**/api/chat", (route) =>
      route.fulfill({
        status: 200,
        headers: {
          "content-type": "text/event-stream",
          "x-vercel-ai-ui-message-stream": "v1",
        },
        body:
          'data: {"type":"text-start","id":"t1"}\n\n' +
          'data: {"type":"text-delta","id":"t1","delta":"Streaming."}\n\n' +
          'data: {"type":"text-end","id":"t1"}\n\n' +
          "data: [DONE]\n\n",
      }),
    );
    await page.goto("/");
    await openAskPanel(page);
    const dialog = page.getByRole("dialog", { name: /ask/i });
    await dialog.getByRole("textbox").fill("hi");
    await page.keyboard.press("Enter");
    const caret = dialog.locator(".motion-safe\\:animate-caret");
    await expect(caret.first()).toBeVisible();
    await expect(caret.first()).toHaveCSS("animation-name", "none");
  });

  test("command palette open/close transition has zero duration", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(200);
    await page.keyboard.press("ControlOrMeta+k");
    const dialog = page.locator("[cmdk-dialog]");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveCSS("transition-duration", "0s");
  });
});
```

- [ ] **Step 8: Run the reduced-motion + smoke + a11y suites**

Run: `pnpm exec playwright test reduced-motion.spec.ts smoke.spec.ts a11y.spec.ts`
Expected: PASS. If `"revealed elements carry no residual transform"` fails, the reduced branch of `useReveal` isn't clearing transform — confirm `gsap.set(targets, { opacity: 1, y: 0, clearProps: "transform" })` runs (matchMedia condition string must be exactly `REDUCED`).

- [ ] **Step 9: Phase 2 gate + commit**

Run: `pnpm lint && pnpm test && pnpm exec playwright test && pnpm build`

```bash
git add -A
git commit -m "feat(redesign): useReveal replaces motion/react; drop the motion dep"
```

---

## PHASE 3 — Signature effects

### Task 12: `<KineticName>`

**Files:**
- Create: `components/motion/KineticName.tsx`
- Modify: `components/sections/Hero.tsx` (wrap the `<h1>` content)

**Interfaces:**
- Produces: `<KineticName>{children}</KineticName>` — expects to wrap the inner (`aria-hidden`) markup of the hero `<h1>`; splits its text into chars and animates them in on mount.

- [ ] **Step 1: Create `components/motion/KineticName.tsx`**

```tsx
"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { NO_PREFERENCE, REDUCED } from "@/lib/gsap";

/**
 * Wraps the hero name's decorative markup and settles its characters in on
 * load. Reduced motion: text renders as-is, no split.
 */
export function KineticName({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(NO_PREFERENCE, () => {
        const split = new SplitText(el, { type: "chars" });
        gsap.from(split.chars, {
          yPercent: 60,
          opacity: 0,
          skewX: -8,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.03,
        });
        return () => split.revert();
      });

      mm.add(REDUCED, () => {
        gsap.set(el, { clearProps: "all" });
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return <span ref={ref}>{children}</span>;
}
```

- [ ] **Step 2: Wrap the hero name in `Hero.tsx`**

Change the `<h1>` body from `<span aria-hidden="true">…</span>` to:

```tsx
<KineticName>
  <span aria-hidden="true">
    {first}
    <br />
    <span className="text-pink">{last.slice(0, 2)}</span>
    <span className="[-webkit-text-stroke:2px_var(--field-fg)] [color:transparent]">
      {last.slice(2)}
    </span>
  </span>
</KineticName>
```

Add `import { KineticName } from "@/components/motion/KineticName";`. The `<h1 aria-label={profile.name}>` wrapper is unchanged, so screen readers still get the plain name.

- [ ] **Step 3: Run hero + a11y + reduced-motion tests**

Run: `pnpm exec playwright test -g "hero" a11y.spec.ts reduced-motion.spec.ts`
Expected: PASS. `reduced-motion` "hero content visible immediately" must still see `#hero-heading` `opacity: 1` / `transform: none` — the reduced branch does `clearProps: "all"` on the inner span and the `<h1>` itself is never touched.

- [ ] **Step 4: Manual check (Playwright headless screenshot or a preview)**

The name settles in ~0.7s on load; no layout jump when `SplitText` runs (fonts already loaded via `GsapBootstrap` refresh). Do **not** judge this in the MCP browser tab.

- [ ] **Step 5: Commit**

```bash
git add components/motion/KineticName.tsx components/sections/Hero.tsx
git commit -m "feat(redesign): KineticName — hero name settles in on load"
```

---

### Task 13: `<MagneticButton>`

**Files:**
- Create: `components/motion/MagneticButton.tsx`
- Modify: `components/sections/Hero.tsx` (wrap the two CTAs)

**Interfaces:**
- Produces: `<MagneticButton>{child}</MagneticButton>` — `child` is a single focusable element (an `<a>`); the wrapper adds no semantics.

- [ ] **Step 1: Create `components/motion/MagneticButton.tsx`**

```tsx
"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { NO_PREFERENCE } from "@/lib/gsap";

const RADIUS = 90; // px from centre where the pull starts
const PULL = 0.28; // fraction of the offset the button follows

/**
 * Pulls its single child toward the pointer on fine-pointer devices.
 * Reduced motion / coarse pointer: inert passthrough.
 */
export function MagneticButton({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (!window.matchMedia("(pointer: fine)").matches) return;

      const mm = gsap.matchMedia();
      mm.add(NO_PREFERENCE, () => {
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          if (Math.hypot(dx, dy) > RADIUS + Math.max(r.width, r.height) / 2) {
            gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: "power3.out" });
            return;
          }
          gsap.to(el, {
            x: dx * PULL,
            y: dy * PULL,
            duration: 0.3,
            ease: "power2.out",
          });
        };
        const reset = () =>
          gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: "power3.out" });

        window.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", reset);
        return () => {
          window.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", reset);
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className="inline-block">
      {children}
    </span>
  );
}
```

- [ ] **Step 2: Wrap the CTAs in `Hero.tsx`**

```tsx
<div className="mt-11 flex flex-col gap-3 sm:flex-row">
  <MagneticButton>
    <a href="#contact" className="… (unchanged) …">Get in touch →</a>
  </MagneticButton>
  <MagneticButton>
    <a href="#experience" className="… (unchanged) …">See the work</a>
  </MagneticButton>
</div>
```

Add the import.

- [ ] **Step 3: Run a11y + smoke**

Run: `pnpm exec playwright test a11y.spec.ts smoke.spec.ts`
Expected: PASS — the CTAs are still `<a>` in tab order; the `<span>` wrapper adds nothing.

- [ ] **Step 4: Commit**

```bash
git add components/motion/MagneticButton.tsx components/sections/Hero.tsx
git commit -m "feat(redesign): MagneticButton on the hero CTAs"
```

---

### Task 14: `<ScrollMarquee>`

**Files:**
- Create: `components/motion/ScrollMarquee.tsx`
- Modify: `app/page.tsx` (render `<ScrollMarquee>` between `<Hero>` and `<About>`)

**Interfaces:**
- Produces: `<ScrollMarquee items={string[]} />` — a full-bleed cyan strip.

- [ ] **Step 1: Create `components/motion/ScrollMarquee.tsx`**

```tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { NO_PREFERENCE } from "@/lib/gsap";

/**
 * Full-bleed ticker. Base auto-scroll; scroll velocity speeds it up and
 * flips its direction. Reduced motion: static, single copy visible.
 */
export function ScrollMarquee({ items }: { items: string[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const line = items.join("  ✳  ");

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;
      const mm = gsap.matchMedia();

      mm.add(NO_PREFERENCE, () => {
        const half = track.scrollWidth / 2;
        const tween = gsap.to(track, {
          x: -half,
          duration: 18,
          ease: "none",
          repeat: -1,
          modifiers: { x: (x) => `${parseFloat(x) % half}px` },
        });

        const st = ScrollTrigger.create({
          trigger: document.documentElement,
          start: 0,
          end: "max",
          onUpdate: (self) => {
            const v = self.getVelocity();
            const scale = gsap.utils.clamp(-6, 6, 1 + v / 400);
            gsap.to(tween, {
              timeScale: scale,
              duration: 0.3,
              overwrite: true,
            });
          },
        });

        return () => {
          tween.kill();
          st.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: trackRef },
  );

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-y-2 border-ink bg-cyan text-cyan-fg"
    >
      <div
        ref={trackRef}
        className="flex w-max whitespace-nowrap py-3.5 font-display text-base font-semibold sm:text-lg"
      >
        <span className="px-6">{line}  ✳  </span>
        <span className="px-6">{line}  ✳  </span>
      </div>
    </div>
  );
}
```

(`aria-hidden` because the same tech list is already in the Skills section for assistive tech.)

- [ ] **Step 2: Render it in `app/page.tsx`**

```tsx
import { ScrollMarquee } from "@/components/motion/ScrollMarquee";
// …
<Hero profile={profile} />
<ScrollMarquee
  items={[
    "React", "Next.js", "TypeScript", "Node.js", "GraphQL",
    "Design Systems", "Accessibility", "Performance",
  ]}
/>
<About paragraphs={profile.about.paragraphs} />
```

- [ ] **Step 3: Run smoke + a11y**

Run: `pnpm exec playwright test smoke.spec.ts a11y.spec.ts`
Expected: PASS — the strip is `aria-hidden`, adds no headings/links.

- [ ] **Step 4: Manual check (headless / preview)**

Ticker loops seamlessly, speeds up while scrolling, reverses on scroll-up, never tears at the seam. If jittery, raise the `gsap.to(tween, …)` duration to `0.5` and tighten the clamp to `(-3, 3, …)`.

- [ ] **Step 5: Commit**

```bash
git add components/motion/ScrollMarquee.tsx app/page.tsx
git commit -m "feat(redesign): ScrollMarquee — scroll-reactive tech ticker"
```

---

### Task 15: `<ShardField>`

**Files:**
- Create: `components/motion/ShardField.tsx`
- Modify: `components/sections/{Hero,Experience,Skills,Projects,Contact}.tsx` (replace the static `data-shard` blocks)

**Interfaces:**
- Produces: `<ShardField shards={Shard[]} />` where `Shard = { x: string; y: string; size: number; color: string; radius?: number }` (`x`/`y` are CSS values like `"10%"` / `"6rem"`; `color` a Tailwind bg class).

- [ ] **Step 1: Create `components/motion/ShardField.tsx`**

```tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { useGSAP } from "@gsap/react";
import { NO_PREFERENCE } from "@/lib/gsap";

export type Shard = {
  x: string;
  y: string;
  size: number;
  color: string;
  radius?: number;
};

/**
 * Decorative squares: idle drift + pointer parallax + draggable/inertia.
 * Reduced motion: static at their placed positions, no drag.
 */
export function ShardField({ shards }: { shards: Shard[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const els = gsap.utils.toArray<HTMLElement>("[data-shard]", root);
      if (els.length === 0) return;

      const mm = gsap.matchMedia();
      mm.add(NO_PREFERENCE, () => {
        els.forEach((el, i) => {
          gsap.to(el, {
            y: "+=12",
            x: "+=8",
            rotation: i % 2 ? 12 : -12,
            duration: 6 + i,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        });

        const parallax = (e: PointerEvent) => {
          const r = root.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          els.forEach((el, i) => {
            gsap.to(el, {
              xPercent: px * (10 + i * 4),
              yPercent: py * (10 + i * 4),
              duration: 0.6,
              ease: "power2.out",
            });
          });
        };
        root.addEventListener("pointermove", parallax);

        const drags = els.map((el) =>
          Draggable.create(el, {
            type: "x,y",
            inertia: true,
            bounds: root,
          }),
        );

        return () => {
          root.removeEventListener("pointermove", parallax);
          drags.forEach(([d]) => d.kill());
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0">
      {shards.map((s, i) => (
        <span
          key={i}
          data-shard
          style={{
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            borderRadius: s.radius ?? 0,
          }}
          className={`pointer-events-auto absolute touch-none ${s.color}`}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Replace the static shards in each section**

In `Hero.tsx`, delete the `<div aria-hidden="true">…data-shard…</div>` block and render instead:

```tsx
<ShardField
  shards={[
    { x: "auto", y: "6rem", size: 48, color: "bg-pink", radius: 14 },
    { x: "70%", y: "50%", size: 28, color: "bg-cyan" },
    { x: "82%", y: "auto", size: 36, color: "bg-paper", radius: 10 },
  ]}
/>
```

Adjust per section using the mockup as reference: Experience one small cyan shard top-right; Skills one cyan shard bottom-left; Projects one green shard top-right; Contact the three around the mark (green / cyan / pink). Keep the section `relative overflow-hidden`. For `x: "auto"` cases pass a `right` value instead — extend `Shard` with an optional `right?: string` if simpler, or just use percentage `x`.

> Implementer note: exact shard placements are visual polish — match `design-canvas/Main.dc.html` by eye, they don't need to be pixel-exact.

- [ ] **Step 3: Run smoke + a11y + reduced-motion**

Run: `pnpm exec playwright test smoke.spec.ts a11y.spec.ts reduced-motion.spec.ts`
Expected: PASS — shard container is `aria-hidden`; reduced-motion leaves them static (no `NO_PREFERENCE` branch runs).

- [ ] **Step 4: Manual check (headless / preview)** — shards drift gently, follow the pointer subtly, drag and fling with inertia, stay within their section.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(redesign): ShardField — drifting, parallax, draggable shards"
```

---

### Task 16: `<ProjectsReel>`

**Files:**
- Create: `components/motion/reel.ts`, `components/motion/reel.test.ts`
- Create: `components/motion/ProjectsReel.tsx`
- Modify: `components/sections/Projects.tsx`
- Modify: `tests/e2e/smoke.spec.ts` (assert the project card + no drag hint at 1 card)

**Interfaces:**
- Produces:
  - `shouldReel(count: number): boolean` — `count > 1`.
  - `<ProjectsReel>{cards}</ProjectsReel>` — `cards` is an array of already-rendered card elements (or it maps children). 1 child → plain; 2+ → draggable reel + `[data-reel-hint]`.

- [ ] **Step 1: Write the failing unit test — `components/motion/reel.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { shouldReel } from "./reel";

describe("shouldReel", () => {
  it("is false for a single card", () => {
    expect(shouldReel(1)).toBe(false);
  });
  it("is true for two or more", () => {
    expect(shouldReel(2)).toBe(true);
    expect(shouldReel(5)).toBe(true);
  });
  it("is false for zero", () => {
    expect(shouldReel(0)).toBe(false);
  });
});
```

- [ ] **Step 2: Run it — fails (no module)**

Run: `pnpm test -- reel`
Expected: FAIL — `Cannot find module './reel'`.

- [ ] **Step 3: Create `components/motion/reel.ts`**

```ts
/** A draggable reel only makes sense with more than one card. */
export function shouldReel(count: number): boolean {
  return count > 1;
}
```

- [ ] **Step 4: Run it — passes**

Run: `pnpm test -- reel`
Expected: PASS.

- [ ] **Step 5: Create `components/motion/ProjectsReel.tsx`**

```tsx
"use client";

import { Children, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { useGSAP } from "@gsap/react";
import { NO_PREFERENCE } from "@/lib/gsap";
import { shouldReel } from "./reel";

/**
 * Projects card row. One card → plain, centred, no drag. Two or more →
 * horizontal Draggable with inertia; CSS scroll-snap is the no-JS /
 * reduced-motion fallback, so keyboard scroll always works.
 */
export function ProjectsReel({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reel = shouldReel(Children.count(children));

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track || !reel) return;
      const mm = gsap.matchMedia();
      mm.add(NO_PREFERENCE, () => {
        const [drag] = Draggable.create(track, {
          type: "x",
          inertia: true,
          bounds: {
            minX: -(track.scrollWidth - track.clientWidth),
            maxX: 0,
          },
          edgeResistance: 0.85,
        });
        return () => drag.kill();
      });
      return () => mm.revert();
    },
    { scope: trackRef, dependencies: [reel] },
  );

  return (
    <div className="overflow-hidden">
      <div
        ref={trackRef}
        className={
          reel
            ? "flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scrollbar-width:none]"
            : "flex gap-6"
        }
      >
        {children}
      </div>
      {reel ? (
        <p data-reel-hint aria-hidden="true" className="mt-4 text-sm font-medium text-pink-fg/70">
          drag the reel →
        </p>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 6: Use it in `Projects.tsx`**

Replace the `<div className="flex gap-6 overflow-x-auto pb-2">…</div>` with:

```tsx
<ProjectsReel>
  {projects.map((project) => (
    <a
      key={project.name}
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-[min(100%,36rem)] shrink-0 snap-start rounded-2xl border-2 border-pink-fg bg-paper p-8 text-paper-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-fg"
    >
      {/* h3 + description + tags — unchanged from Task 7 */}
    </a>
  ))}
</ProjectsReel>
```

Add the import.

- [ ] **Step 7: Add the e2e assertion in `tests/e2e/smoke.spec.ts`**

Add to the `"all sections render"` test, after the `#projects` heading check:

```ts
await expect(
  page.locator("#projects").getByRole("link", { name: /Synthesizer/ }),
).toBeVisible();
// one project today → no reel affordance
await expect(page.locator("#projects [data-reel-hint]")).toHaveCount(0);
```

- [ ] **Step 8: Run smoke + unit + a11y**

Run: `pnpm test && pnpm exec playwright test smoke.spec.ts a11y.spec.ts`
Expected: PASS.

- [ ] **Step 9: Manual check — temporarily add a 2nd entry to `content/projects.ts`, `pnpm dev`, confirm the reel drags/flings/snaps and the hint shows; then revert the temp entry.**

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat(redesign): ProjectsReel — draggable at 2+ cards, plain at 1"
```

---

### Task 17: Phase 3 gate

- [ ] **Step 1: Full suite + build**

Run: `pnpm lint && pnpm test && pnpm exec playwright test && pnpm build`
Expected: ALL PASS.

- [ ] **Step 2: Manual pass at desktop + 390px** against both mockup artboards. Fix discrepancies, commit any fixes with `fix(redesign): …`.

---

## PHASE 4 — Contact moment

### Task 18: `<ContactMark>`

**Files:**
- Create: `components/contact/ContactMark.tsx`
- Modify: `components/sections/Contact.tsx` (wrap the mark + shards)
- Modify: `tests/e2e/reduced-motion.spec.ts` (add the contact assertion)
- Modify: `tests/e2e/a11y.spec.ts` (update the stale "fly 0.8s" comment)

**Interfaces:**
- Produces: `<ContactMark />` — renders the big `JS` + its shards and runs the shatter/settle timeline on the contact section. Self-contained (no props); reads `#contact` as the trigger via a ref passed from `Contact.tsx`, or queries its own nearest `section`.

- [ ] **Step 1: Write the failing reduced-motion assertion in `tests/e2e/reduced-motion.spec.ts`**

Add this test inside the `describe`:

```ts
  test("contact mark and every contact link are visible and untransformed", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#contact").scrollIntoViewIfNeeded();

    const mark = page.locator("#contact [data-contact-mark]");
    await expect(mark).toBeVisible();
    await expect(mark).toHaveCSS("transform", "none");

    for (const name of [/@/, /LinkedIn/]) {
      const link = page.locator("#contact").getByRole("link", { name });
      await expect(link).toBeVisible();
      await expect(link).toHaveCSS("opacity", "1");
    }

    const vp = page.viewportSize()!;
    const box = await page.locator("#contact").boundingBox();
    expect(box?.height ?? 0).toBeLessThan(vp.height * 1.6);
  });
```

- [ ] **Step 2: Run it — fails**

Run: `pnpm exec playwright test reduced-motion.spec.ts -g "contact mark"`
Expected: FAIL — there is no `[data-contact-mark]` yet.

- [ ] **Step 3: Create `components/contact/ContactMark.tsx`**

```tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Mark } from "@/components/ui/Mark";
import { NO_PREFERENCE, REDUCED } from "@/lib/gsap";

const SHARDS = [
  { x: "calc(50% - 90px)", y: "16px", size: 36, color: "bg-js-green", radius: 9 },
  { x: "calc(50% + 60px)", y: "16px", size: 28, color: "bg-cyan", radius: 0 },
  { x: "calc(50% + 40px)", y: "112px", size: 32, color: "bg-pink", radius: 8 },
  { x: "calc(50% - 70px)", y: "112px", size: 24, color: "bg-js-green", radius: 0 },
];

/**
 * The closing "JS" shatter. On scroll-in: the mark scales/rotates in and
 * the shards burst outward then ease to rest. Scroll back up reverses it.
 * Triggered, not scrubbed. Decorative — the contact heading + copy live
 * outside this component and are always in the DOM.
 */
export function ContactMark() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const section = root.closest("section");
      const mark = root.querySelector("[data-contact-mark]");
      const shards = gsap.utils.toArray<HTMLElement>("[data-shard]", root);
      if (!section || !mark) return;

      const mm = gsap.matchMedia();

      mm.add(REDUCED, () => {
        gsap.set([mark, ...shards], { clearProps: "all", opacity: 1 });
      });

      mm.add(NO_PREFERENCE, () => {
        const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
        tl.from(mark, { scale: 0.4, rotate: -12, opacity: 0, duration: 0.6 })
          .from(
            shards,
            {
              x: () => gsap.utils.random(-160, 160),
              y: () => gsap.utils.random(-140, 140),
              rotate: () => gsap.utils.random(-140, 140),
              opacity: 0,
              stagger: { each: 0.04, from: "random" },
              duration: 0.7,
            },
            "<0.1",
          );

        const st = ScrollTrigger.create({
          trigger: section,
          start: "top 60%",
          onEnter: () => tl.play(),
          onLeaveBack: () => tl.reverse(),
        });

        return () => {
          tl.kill();
          st.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="relative my-14 flex h-52 items-center justify-center"
    >
      {SHARDS.map((s, i) => (
        <span
          key={i}
          data-shard
          style={{ left: s.x, top: s.y, width: s.size, height: s.size, borderRadius: s.radius }}
          className={`absolute ${s.color}`}
        />
      ))}
      <span data-contact-mark>
        <Mark size="lg" className="!text-[clamp(5rem,20vw,10rem)] text-js-green" />
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Use it in `Contact.tsx`**

Replace the static `<div className="relative my-14 …" aria-hidden>…</div>` block (mark + shards) with `<ContactMark />`. Add the import. Everything else in `Contact.tsx` — heading, "Let's build something.", the `[data-contact-reveal]` copy — stays.

- [ ] **Step 5: Reveal the contact copy**

Add `useReveal` to `Contact.tsx` (it becomes `"use client"`): `const ref = useRef<HTMLDivElement>(null); useReveal(ref, { selector: "[data-contact-reveal]" });` with `ref` on the `max-w-3xl` wrapper.

- [ ] **Step 6: Run it — passes**

Run: `pnpm exec playwright test reduced-motion.spec.ts -g "contact mark"`
Expected: PASS.

- [ ] **Step 7: Fix the stale comment in `tests/e2e/a11y.spec.ts`**

In `"contact sign-off has no WCAG violations"`, change the comment `// wait out the whole timeline (fly 0.8s + shatter + reveal) …` to `// wait out the reveal so axe doesn't measure contrast on mid-fade text`. The assertion (`[data-contact-reveal]` `.last()` opacity `1`) is unchanged and still valid.

- [ ] **Step 8: Run the contact-related suites**

Run: `pnpm exec playwright test reduced-motion.spec.ts a11y.spec.ts smoke.spec.ts`
Expected: PASS. `a11y` "contact sign-off" must be 0 violations — if the shard colours over `--ink` trip a contrast check they shouldn't (shards have no text), but if `text-ink-fg/70` does, bump it.

- [ ] **Step 9: Manual check (headless / preview)** — mark bursts in on scroll-down, reverses on scroll-up, no double-vision, copy reveals under it.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat(redesign): ContactMark — the JS shatter close"
```

---

### Task 19: Final sweep

**Files:**
- Modify: `README.md` (finalise the animation section)
- Any dead-code cleanup surfaced by the sweep

- [ ] **Step 1: Dead-code + import sweep**

Run:
```
grep -rn "motion/react\|MotionConfig\|RevealOnScroll\|Stagger\|BlockMark\|block-mark\|FlipMark\|band-\|font-mono\|Martian" --include="*.ts" --include="*.tsx" --include="*.css" --include="*.mjs" . | grep -v node_modules
```
Expected: no output. Fix any straggler.

- [ ] **Step 2: Finalise `README.md`**

Document the motion layer: `lib/gsap.ts` (`registerGsap`, `useReveal`), the effect components under `components/motion/`, the reduced-motion contract, and "verify motion with Playwright headless, not the browser MCP tab".

- [ ] **Step 3: Full gate**

Run: `pnpm lint && pnpm test && pnpm exec playwright test && pnpm build`
Expected: ALL PASS.

- [ ] **Step 4: Lighthouse check**

`pnpm build && pnpm start`, run Lighthouse mobile on `http://localhost:3000`. Expected: Performance ≈ 98, no new CLS, LCP unchanged (~1.8s). Investigate any regression (likely `SplitText` on the h1 or shard paint) before proceeding.

- [ ] **Step 5: Commit + push**

```bash
git add -A
git commit -m "docs(redesign): motion layer notes; final sweep"
git push -u origin feat/kinetic-redesign
```

- [ ] **Step 6: Hand to Jon**

Post the branch (and a preview URL if pushed). Jon reviews the built result. **No merge to `main` without his explicit approval.** If he approves: standard merge; delete `feat/kinetic-redesign`. If not: the branch stays unmerged, `main` is untouched.

---

## Self-Review

**Spec coverage:**
- Palette / no-dark-mode / tokens → Task 1. ✓
- Fonts (Familjen + Archivo, drop Martian) → Task 1 + Task 9 (import removal). ✓
- Colour-blocked sections (all 8 rows) → Tasks 2 (nav), 5 (hero), 14 (marquee), 4 (about/skills), 6 (experience), 7+16 (projects), 8+18 (contact). ✓
- `<Mark>` + delete BlockMark trio + favicon/OG → Tasks 2, 8, 9. ✓
- `SectionHeading` / `Tag` rewrites → Task 3. ✓
- `lib/gsap.ts` + `useReveal` + `GsapBootstrap` + drop MotionConfig → Tasks 10–11. ✓
- Remove `motion` dep → Task 11. ✓
- Eight effects → KineticName (12), MagneticButton (13), ScrollMarquee (14), ShardField incl. Draggable/inertia (15), ProjectsReel (16), useReveal section reveals (11), ContactMark shatter (18). ✓
- Reduced-motion contract → every effect task has a `matchMedia` reduced branch; enforced by `reduced-motion.spec.ts` (Tasks 8, 11, 18). ✓
- a11y gate every phase → stated in Global Constraints + run in Tasks 2, 8, 9, 11, 15, 16, 18, 19. ✓
- Test rewrites: delete `contact-flip.spec.ts` (8), rewrite `reduced-motion.spec.ts` (8 + 11 + 18), update `smoke`/`a11y` selectors (2, 16, 18), `block-mark.test.ts` deleted (8). ✓
- OG image + `generate-icons.mjs` + regenerated PNGs → Task 9. ✓
- Ask panel / launcher / ContactCard restyle → Task 9. ✓
- `.gitignore` `design-canvas/` → Task 1. ✓
- Four-phase rollout, each green + committed → phase gates at Tasks 9, 11, 17, 19. ✓
- Branch-only, no toggle, Jon approves before merge → Global Constraints + Task 19. ✓

**Placeholder scan:** No "TBD/TODO". Two "implementer note" lines (shard placement, per-section shard configs) deliberately defer *visual polish* to eyeballing the mockup — the mechanism and interfaces are fully specified. Task 9 Step 3 says "find the Familjen Grotesk TTF URL" — this is a lookup the engineer does against a live stylesheet, not a hidden decision.

**Type consistency:** `SectionHeading` props `{id,index,kicker,title,accentClassName?}` — used identically in Tasks 4, 6, 7. `Tag` props `{variant?,tone?}` — consistent Tasks 4, 6, 7. `useReveal(ref, opts?)` signature identical in Tasks 10, 11, 18. `Shard` type defined in Task 15, `SHARDS` in Task 18 uses the same shape inline. `shouldReel(count)` defined Task 16 Step 3, tested Step 1, used in `ProjectsReel` Step 5. `registerGsap` / `prefersReducedMotion` / `NO_PREFERENCE` / `REDUCED` defined Task 10, imported in Tasks 12–18. `data-reveal` / `data-shard` / `data-contact-mark` / `data-reel-hint` attribute names consistent across component and test tasks.
