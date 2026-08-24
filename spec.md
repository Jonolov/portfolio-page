# Spec: Portfolio Website — Jon Stjärnström / Independent Tech

## 1. Purpose

A personal portfolio and consulting landing page for Jon Stjärnström, a senior
frontend/fullstack developer operating as an independent consultant
(Independent Tech Sweden AB). The site is the first impression for a
prospective client or hiring manager researching Jon before a call.

## 2. Audience

- Product/engineering leads or founders considering hiring Jon as a
  contractor.
- Recruiters or agencies scanning quickly for stack fit and seniority.
- People who found Jon through a referral and want to verify credibility
  fast.

## 3. Success criteria (what "done" looks like)

Written as testable statements — a visitor should be able to confirm each one
just by using the site:

- When a visitor lands on the homepage, they can state Jon's specialty
  (frontend/fullstack, React/Next.js/TypeScript/Node.js) within 5 seconds
  without scrolling.
- When a visitor looks at the experience section, they can identify at least
  two recognizable companies Jon has worked with (Hemnet, UR/urplay.se) and
  what he did there.
- When a visitor interacts with the page (scroll, hover, click), something
  responds in a way that feels crafted rather than default-template — this is
  a portfolio *demonstrating* frontend skill, not just describing it.
- When a visitor wants to get in touch, a contact path (email or a contact
  section) is reachable from any point on the page within one click/scroll.
- When the page is tested with a screen reader or keyboard-only navigation,
  all interactive content remains usable — playful should not mean
  inaccessible, given Jon's own professional focus on accessibility.
- When the page is tested on a throttled mobile connection, initial content
  is visible in under ~2 seconds — performance is itself part of the pitch.

## 4. Site structure

Single-page site (v1), with anchor-linked sections:

1. **Hero** — name, role, one-line value proposition, a way to stand out
   immediately (see §6).
2. **About** — short bio, years of experience, working style.
3. **Experience** — selected roles, most recent first, with company, dates,
   what he built, and tech used.
4. **Skills** — grouped by category (frontend, backend, tooling/testing,
   platforms), not just a flat tag cloud.
5. **Contact** — email, and optionally a short "available for consulting"
   status line.

## 5. Content requirements

### Hero
- Name: Jon Stjärnström
- Role line: Senior Frontend/Fullstack Developer — React, Next.js, TypeScript, Node.js
- One-line hook communicating 10+ years building high-traffic consumer products.

### About
- 10+ years building and maintaining high-traffic web applications.
- Primary focus: frontend with React, Next.js, TypeScript; also comfortable
  full-stack (Node.js backends, auth flows, CMS integrations,
  personalization).
- Strong focus on performance, SEO, accessibility, and long-term code
  quality.
- Works closely with designers and product teams; comfortable in both small
  cross-functional teams and larger product orgs.
- Actively uses AI-assisted development workflows (e.g. Claude Code) as part
  of how he works today — worth a mention since it signals someone current
  with the field, not just a buzzword.

### Experience (selected, most recent first)
- **Utbildningsradion (UR)** — Senior Developer, Jun 2025–Jun 2026.
  Continued development of streaming service urplay.se and in-house CMS
  "Edith." Built guided onboarding flows, a new teacher login (Next-Auth +
  Keycloak + Zod), and personalized content via a recommendations API (EBU's
  "Peach"). Strong WCAG accessibility focus. Used Claude Code throughout for
  codegen, documentation, and debugging.
  Tech: Next.js, TypeScript, React, Node.js, Next-Auth, Keycloak, Zod,
  Playwright, Prisma, Jest, React Query, Claude Code.
- **Hemnet** — Senior Developer, Sep 2021–Jun 2025. Frontend development on
  hemnet.se, Sweden's largest real-estate platform. Contributed to the
  migration from Rails to Next.js/TypeScript. Owned the news
  articles/advertorials platform and its CMS. Built and maintained a
  component library and design system in Storybook (WCAG-focused).
  Tech: Next.js, React, TypeScript, GraphQL, Apollo Client, Playwright, Jest,
  SCSS, Ruby on Rails, Contentful, Storybook.
- **KTH Royal Institute of Technology** — Developer, Aug 2018–Sep 2021.
  Maintained kth.se and internal tools; built/maintained the university's
  design system; migrated from Inferno.js to React.
- *(Older roles — Ving/Thomas Cook, Fröjd Agency, KTH internship — available
  as a "show more" or condensed timeline rather than full detail, to keep
  the page from feeling like a resume dump.)*

### Skills (grouped, not a flat list)
- **Frontend:** React, Next.js, TypeScript, JavaScript, React Query/Apollo
  Client, SCSS/CSS, Design Systems
- **Backend:** Node.js/Express, GraphQL, Prisma, Ruby on Rails
- **Auth/Identity:** Next-Auth, Keycloak
- **Testing:** Playwright, Jest
- **CMS/Platforms:** Contentful, WordPress
- **Practice:** SEO & performance, accessibility (WCAG), AI-assisted
  development

### Contact
- Company: Independent Tech Sweden AB
- Location: Stockholm
- Site: become.independtech.se
(Confirm which of these Jon wants public vs. contact-form-only before
implementation.)

## 6. Experience / tone requirements ("fun", not static, should stand out)

This is a requirement, not a style guess left to the implementer — but the
*how* (which library, which specific animation) belongs in plan.md, not here.
What the spec pins down is the bar it needs to clear:

- The page must not read as a static, default-template resume site — it
  should include at least one moment of delight or surprise tied to Jon's
  own skillset (motion, interactivity, an unexpected but tasteful detail).
- Motion/interactivity should feel purposeful (reveals content, guides
  attention, reinforces a section's meaning) rather than decorative noise.
- The playful elements must degrade gracefully — someone with reduced-motion
  preferences enabled, or on a low-end device, still gets a fully functional,
  legible site.
- Visual tone: confident and modern, not corporate-generic — this is a
  senior consultant's site, not a template landing page.

## 7. Constraints

- Should be built with the stack it's promoting (React/Next.js/TypeScript) —
  the implementation itself is part of the portfolio.
- Must meet WCAG accessibility basics (keyboard nav, screen-reader labels,
  color contrast) given this is explicitly part of Jon's professional
  positioning.
- Must be reasonably fast on mobile (see §3).
- No CMS/backend needed for v1 — content can be hardcoded/data-driven from a
  local file.

## 8. Out of scope (v1)

- Blog or writing section.
- Case-study deep-dive pages (link out or summarize inline instead).
- Working contact form backend (a `mailto:` link or simple form-to-email
  service is enough for v1).
- CMS or admin panel for editing content.

## 9. Open questions before planning starts

- Should older roles (Ving, Fröjd, KTH internship) appear at all, or stay
  resume-only?
- Any specific companies/projects Jon wants to lead with as the strongest
  proof points — Hemnet and UR are the obvious anchors, but confirm.
- Preference on "available for work" messaging, or keep it purely a
  portfolio without an active pitch?
