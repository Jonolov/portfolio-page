# Jon Stjärnström — Portfolio

Personal portfolio and consulting site for Jon Stjärnström, a senior frontend/fullstack developer. Live at **[jonstjarnstrom.se](https://jonstjarnstrom.se)**.

![Screenshot of the site's hero section](.github/readme/hero.png)

Built with the stack it's promoting — the source is public on purpose, as part of the pitch.

## Stack

- [Next.js](https://nextjs.org) (App Router) + [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com) — CSS-first config, no `tailwind.config.ts`
- [Motion](https://motion.dev) for animation
- [cmdk](https://cmdk.paco.me) for the ⌘K command palette
- [Playwright](https://playwright.dev) + [axe-core](https://github.com/dequelabs/axe-core) for e2e and accessibility testing
- Deployed on [Vercel](https://vercel.com), with [Vercel Web Analytics](https://vercel.com/analytics)

## Notable bits

- **⌘K command palette** — jump to any section, or ask `whoami`, `stack`, or `contact`
- **Accessibility-first** — WCAG 2.1 AA, checked continuously with automated `axe` scans plus manual keyboard-only and reduced-motion passes, not bolted on at the end
- **No hand-authored images** — the favicon, Apple touch icon, and Open Graph image are all generated from code (`next/og`), not uploaded assets
- Respects `prefers-reduced-motion` throughout, including every scroll-reveal and hover interaction

## Development

```bash
pnpm install
pnpm dev                    # start the dev server at localhost:3000
pnpm build                  # production build
pnpm lint                   # eslint
pnpm exec playwright test   # e2e, accessibility, and reduced-motion tests
```

## Project structure

- `content/` — all copy and data, hardcoded and typed (no CMS)
- `components/sections/` — the page's sections (Hero, About, Experience, Skills, Contact)
- `components/motion/` — reusable animation primitives
- `components/command-palette/` — the ⌘K command palette
- `tests/e2e/` — Playwright smoke, accessibility, and reduced-motion tests
- `plan.md` / `tasks.md` — the running design and build log for this project, phase by phase
