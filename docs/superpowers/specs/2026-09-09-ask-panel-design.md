# Design: "Ask" panel — a grounded AI chat in the ⌘K palette

**Date:** 2026-09-09
**Status:** Approved for planning
**Branch:** `feat/ask-panel`

> **Update 2026-09-09 (during implementation):** switched from the Vercel AI
> Gateway (BYOK) to the AI SDK's **direct Anthropic provider**
> (`@ai-sdk/anthropic`, `ANTHROPIC_API_KEY`). The Gateway gated every
> request behind a card on file *and* paid credits even for BYOK, which
> isn't worth it for a personal site. Spend is capped by `maxOutputTokens`
> plus the rate limiter, and a limit set in the Anthropic Console. BotID
> and everything else are unchanged.

## Context

The portfolio site (`jonstjarnstrom.se`) is a consulting lead-gen tool, public on
purpose — the source is part of the pitch. A consultant assignment Jon is
pursuing lists two skill areas he wants to demonstrate on the site:

1. Leveraging the **Vercel AI SDK** for AI-driven features in web apps.
2. Web animation tooling — **Framer Motion / Motion, GSAP, CSS animations**.

This spec covers **only the first sub-project of area 1**: a grounded chat
feature that answers questions about Jon's professional background, reachable
from the existing ⌘K command palette. It demonstrates the Vercel AI SDK's
streaming, `useChat`, and tool-calling surfaces in real code.

The remaining pieces are tracked as a backlog, each to get its own spec:

- **Tailored-pitch generator** — paste a job description, get a structured
  match (`generateObject`). Public. Shares the AI Gateway + rate-limit infra
  built here.
- **GSAP signature moment** — one scroll-driven set piece.
- **CSS animation tier** — native `animation-timeline: scroll()` with a
  fallback, plus small deliberate CSS-only touches.
- **"Notes on animation" write-up** — public case-study content: which tool for
  which job and why.

## Goals

- A recruiter or client can ask free-text questions ("Does Jon have fintech
  experience?", "Has he run Kubernetes in production?") and get a streamed
  answer grounded strictly in the site's CMS content.
- The feature strengthens the ⌘K identity rather than competing with it.
- A tool call (`showContactCard`) turns hiring intent into a contact CTA —
  the feature has a lead-gen point, not just a demo.
- Production-grade guardrails: bot filtering, per-IP rate limiting, a hard
  spend cap, and a system prompt that refuses off-topic use.
- No regression to the site's accessibility (WCAG 2.1 AA, automated axe) or
  performance (Lighthouse ~98, LCP ~1.8s) posture.

## Non-goals

- No conversation persistence. Chat state lives in React state for the life of
  one open panel and resets on close.
- No vector database / embeddings / "RAG" infra. The entire CMS payload is a
  few KB and goes into the system prompt.
- No new page or route in the site's navigation. The panel is a modal.
- No markdown/code rendering in answers — the system prompt forbids them.
- The animation sub-projects are out of scope here.

## Approach chosen

**Palette entry, centered chat dialog** (Approach A of three considered):

- **B — everything inside the cmdk list**: rejected. Multi-turn chat in a
  command list is awkward and hard to make accessible.
- **C — standalone `/ask` page**: rejected. A second page on a one-page site,
  disconnected from the ⌘K identity, more build.

## Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Model | `anthropic/claude-haiku-4.5` via AI Gateway | Cheap ($1/$5 per M tok), fast, ample for grounded Q&A over a few KB of facts. |
| AI access | Vercel AI Gateway with **BYOK** (Jon's Anthropic key) | Anthropic bills Jon directly and spend is visible in his Anthropic console; still gets Gateway observability + a budget cap. Code is a plain `'anthropic/claude-haiku-4.5'` string — unchanged vs. system-credit path. |
| Spend cap | Gateway API key with `--budget 5 --refresh-period monthly` | Hard ceiling regardless of billing source. |
| Panel placement | Centered dialog, ~palette footprint | Visual consistency with the command palette. |
| Conversation memory | Stateless — React state only, reset on close | Non-goal to persist; keeps the backend a pure function of the request. |
| Rate limits (per IP) | 5 / 30 s, 30 / hour, 100 / day | Starting point; tunable. |
| Dialog primitive | Native `<dialog>` + `showModal()` | Focus trap + Esc close for free, zero new dependency, fits the site's a11y-first ethos. |
| Unit test runner | Vitest | Repo has none yet; standard for this stack; light config. |
| Runtime | Default Node (Fluid Compute) | Streaming works on Node with no config; full Node APIs available. |

## Architecture

### New modules

| File | Purpose |
| --- | --- |
| `app/api/chat/route.ts` | POST handler: bot check → rate limit → load CMS content → `streamText` → `toUIMessageStreamResponse()`. |
| `lib/chat/system-prompt.ts` | `buildSystemPrompt(content)` — pure function, CMS content → grounded system-prompt string. |
| `lib/chat/rate-limit.ts` | In-memory sliding-window limiter keyed by IP. |
| `lib/chat/ip.ts` | `ipFromHeaders(headers)` — first hop of `x-forwarded-for`, fallback. |
| `components/command-palette/AskPanel.tsx` | The chat dialog. `useChat` + native `<dialog>`. |
| `components/ui/ContactCard.tsx` | Status dot + mailto + LinkedIn. Extracted from the palette's `contact` page markup; reused there and in tool output. |

### Modified modules

| File | Change |
| --- | --- |
| `components/command-palette/useCommandPalette.tsx` | Add `askOpen`, `askSeed`, `openAsk(seed?)`, `closeAsk()` to the context. `openAsk` closes the palette. Focus-restoration (`previouslyFocused` ref) stays centralized here. |
| `components/command-palette/CommandPalette.tsx` | New "Ask" group item `Ask about Jon's experience →` → `openAsk()`. `Command.Empty` renders an actionable `Ask AI: "{search}"` → `openAsk(search)`. `contact` page markup replaced by `<ContactCard>`. |
| `app/layout.tsx` | Render `<AskPanel contact={profile.contact} />` beside `<CommandPalette>`. |
| `tests/e2e/a11y.spec.ts` | axe scan with the panel open. |
| `tests/e2e/reduced-motion.spec.ts` | No cursor blink under `prefers-reduced-motion: reduce`. |
| `package.json` | Add `ai`, `@ai-sdk/react`, `zod`, `botid`; dev `vitest`. |
| `README.md` | Note the feature + `AI_GATEWAY_API_KEY`. |
| `AGENTS.md` | Note the new env var. |
| `.env.example` | New file — `AI_GATEWAY_API_KEY=`. |

### Data flow

1. User opens ⌘K, types a question, presses Enter (or selects the Ask item).
   `CommandPalette` closes; `AskPanel` opens. A typed question is passed as
   `askSeed`.
2. `AskPanel` mounts, calls `showModal()`, and if seeded calls
   `sendMessage({ text: seed })` exactly once.
3. `useChat` (`DefaultChatTransport`, `api: "/api/chat"`) POSTs the UI message
   array to the route handler.
4. Route handler:
   a. `checkBotId()` — 403 on bot traffic.
   b. `ipFromHeaders(req.headers)` → `rateLimit.check(ip)` — 429 JSON
      `{ error: "rate_limited" }` when over any window.
   c. Reject oversized input (message count / total length) with 400.
   d. `Promise.all` the five `lib/cms.ts` getters (already `cache()`-wrapped
      and ISR-cached — no extra CMS round trip in the hot path).
   e. `buildSystemPrompt(...)` → `streamText({ model, system, messages:
      convertToModelMessages(messages), tools: { showContactCard },
      stopWhen: stepCountIs(3), temperature: 0.3, maxOutputTokens: 600,
      experimental_telemetry: { isEnabled: true } })`.
   f. `return result.toUIMessageStreamResponse()`.
5. `AskPanel` renders streaming text. A `showContactCard` tool part renders
   `<ContactCard>` inline.

## Backend detail

### `app/api/chat/route.ts`

```ts
export const maxDuration = 30;

export async function POST(req: Request) {
  const { isBot } = await checkBotId();
  if (isBot) return new Response("Forbidden", { status: 403 });

  const ip = ipFromHeaders(req.headers);
  if (!rateLimit.check(ip)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const { messages } = (await req.json()) as { messages: UIMessage[] };
  if (!withinLimits(messages)) {
    return new Response("Message too long", { status: 400 });
  }

  const [profile, experience, earlierRoles, skills, sideProjects] =
    await Promise.all([
      getProfile(),
      getExperience(),
      getEarlierRoles(),
      getSkillGroups(),
      getSideProjects(),
    ]);

  const result = streamText({
    model: "anthropic/claude-haiku-4.5",
    system: buildSystemPrompt({
      profile,
      experience,
      earlierRoles,
      skills,
      sideProjects,
      today: new Date(),
    }),
    messages: convertToModelMessages(messages),
    tools: { showContactCard },
    stopWhen: stepCountIs(3),
    temperature: 0.3,
    maxOutputTokens: 600,
    experimental_telemetry: { isEnabled: true },
  });

  return result.toUIMessageStreamResponse();
}
```

`withinLimits`: at most 16 messages, at most ~4000 chars total across user
messages. Values are constants at the top of the file.

### `showContactCard` tool

```ts
const showContactCard = tool({
  description:
    "Show Jon's contact details. Call this when the user asks how to reach " +
    "Jon, discusses a potential role or engagement, or asks about his " +
    "availability.",
  inputSchema: z.object({
    reason: z
      .string()
      .describe("Why the user might want to contact Jon, in a few words"),
  }),
  // no execute — rendered client-side from the tool part; the panel already
  // has profile.contact.
});
```

The model emits at most one call (`stopWhen: stepCountIs(3)` bounds a
text → tool → text sequence). The panel renders `<ContactCard>` for a
`tool-showContactCard` part regardless of call state once it appears.

### `buildSystemPrompt(content)` — `lib/chat/system-prompt.ts`

Pure function. Returns a string with:

- **Identity & framing**: "You answer questions about Jon Stjärnström's
  professional background for visitors to his portfolio site. Today is
  {date}. Jon is based in {location} and is
  {available / not currently available} for consulting."
- **Rules**:
  - Only use the facts below. It is fine to summarize or synthesize across
    roles.
  - If asked something not covered — personal life, opinions, other people,
    anything off Jon's professional background — say briefly that you only
    cover Jon's work, and suggest a rephrase.
  - Never invent employers, dates, titles, technologies, or metrics. If a
    detail is not below, say you don't have it.
  - Answer in a few sentences. Write about Jon in the third person.
  - Plain prose only — no markdown, no code blocks, no lists.
- **Facts**, serialized from CMS content:
  - About paragraphs.
  - Each role: company, title, dates, summary, highlights, tech.
  - Earlier roles: company (+ title/dates when present).
  - Featured skills grouped by category.
  - Side projects: name, description, tech, url.

### `lib/chat/rate-limit.ts`

- Module-level `Map<string, number[]>` of request timestamps per IP.
- `check(ip)`: drop timestamps outside the largest window, then reject if any
  of the three windows (5 / 30 s, 30 / 3600 s, 100 / 86400 s) is exceeded;
  otherwise push `now` and allow.
- Opportunistic sweep of stale keys on each call to bound memory.
- Fluid Compute reuses instances, so an in-memory limiter is meaningfully
  effective. Durable cross-instance limiting (Upstash Redis via the Vercel
  Marketplace) is the documented upgrade if abuse is observed. The Gateway
  budget cap is the backstop.

### `lib/chat/ip.ts`

`ipFromHeaders(headers)`: first entry of `x-forwarded-for`, trimmed; fall back
to `x-real-ip`; fall back to the string `"unknown"` (all `"unknown"` traffic
shares one bucket — acceptable, fail-closed-ish).

## Frontend detail

### `AskPanel.tsx`

- `"use client"`. Props: `contact: Profile["contact"]`.
- `const { askOpen, askSeed, closeAsk } = useCommandPalette();`
- `useChat({ transport: new DefaultChatTransport({ api: "/api/chat" }) })`.
- A `<dialog ref>` — `showModal()` in an effect when `askOpen` goes true,
  `close()` when false. `onClose` (native, fires on Esc) calls `closeAsk()`.
- Seed: a `useRef` guard so `sendMessage({ text: askSeed })` runs once per
  open when `askSeed` is non-empty.
- **Layout**: centered, `max-w-lg`, pinned near the top like the palette.
  Terminal-window chrome — a `~/ask` header in mono, matching the Console
  Status identity. Header has a close button (`aria-label="Close"`).
- **Message list**: `role="log"` container, scrollable, `max-h-[60vh]`.
  Iterate `message.parts`:
  - `type === "text"` → `<p className="whitespace-pre-wrap">`.
  - `type === "tool-showContactCard"` → `<ContactCard contact={contact} />`.
  - anything else → ignored.
- **Streaming indicator**: a block cursor `▍` after the last assistant text
  while `status` is `"submitted"` or `"streaming"`; blink animation under
  `motion-safe:` only.
- **aria-live**: a visually-hidden `aria-live="polite"` region that receives
  the text of each assistant message **once it finishes streaming**
  (`status` back to `"ready"`), not per token.
- **Error**: `status === "error"` → an inline line "Something went wrong —
  email Jon directly at {email}" with a mailto link. A 429 response is
  surfaced by the transport as an error; detect the `rate_limited` body and
  show "You're sending messages a bit fast — give it a moment." instead.
- **Empty state**: three `<button>`s — "Is Jon available for contract work?",
  "What has Jon built with Next.js?", "Does Jon have DevOps experience?" —
  each calls `sendMessage({ text })`.
- **Input**: a `<textarea>` with a visible label or `aria-label="Ask a
  question about Jon"`. Enter submits; Shift+Enter inserts a newline. A
  submit `<button>` for pointer users. Disabled while `status` is
  `"submitted"` / `"streaming"`.
- **Focus**: on open, focus the textarea. On close, `useCommandPalette`
  restores focus to the element focused before the palette opened (same
  `previouslyFocused` ref already used for the palette).

### `useCommandPalette.tsx` changes

- Context gains: `askOpen: boolean`, `askSeed: string`, `openAsk(seed?:
  string): void`, `closeAsk(): void`.
- `openAsk(seed)` sets `askSeed = seed ?? ""`, `askOpen = true`, and closes the
  palette (`setOpen(false)`), preserving `previouslyFocused` across the
  hand-off so `closeAsk` can restore it.
- `closeAsk()` sets `askOpen = false`, clears `askSeed`, and runs the same
  `requestAnimationFrame(() => target?.focus?.())` restore the palette uses.

### `CommandPalette.tsx` changes

- In the "Ask" `Command.Group`, add:
  `<Command.Item onSelect={() => openAsk()}>Ask about Jon's experience →</Command.Item>`
- Replace the `Command.Empty` body with an actionable item when `search` is
  non-empty:
  `<Command.Item onSelect={() => openAsk(search)}>Ask AI: "{search}"</Command.Item>`
  (falls back to the plain "No results found." text when `search` is empty).
- The `contact` page's inline markup → `<ContactCard contact={profile.contact} />`.

### `ContactCard.tsx`

Extracted verbatim from the current palette `contact` page: the
available-for-consulting status line with the accent dot, the `mailto:` link
in mono/accent, and the LinkedIn link with its `sr-only` "(opens in a new
tab)". Props: `contact: Profile["contact"]`.

## Accessibility

- `<dialog>` labelled by its heading via `aria-labelledby`.
- Native `<dialog>` provides the focus trap and Esc-to-close; focus returns to
  the pre-palette element via existing logic.
- Streaming answers are announced once per completed turn through a polite
  live region — never token-by-token.
- Suggested prompts and the close control are real `<button>`s.
- Cursor blink and any transition are `motion-safe:` gated, consistent with
  the rest of the site; `MotionConfig reducedMotion="user"` already wraps the
  tree.
- axe scan (existing `@axe-core/playwright` setup) must pass with the panel
  open and with a rendered conversation.

## Testing

### Unit (Vitest — new `vitest.config.ts`, `pnpm test`)

- `system-prompt.test.ts`: output contains every role company, every featured
  skill, every side-project name; contains the guardrail sentences; handles an
  empty `sideProjects` array; reflects `availableForConsulting` both ways.
- `rate-limit.test.ts`: allows 5 then blocks within 30 s; the 30 s window
  frees up (fake timers); hourly and daily ceilings enforced; two IPs are
  independent.
- `ip.test.ts`: takes the first hop of a multi-value `x-forwarded-for`; uses
  `x-real-ip` fallback; returns `"unknown"` when neither header is present.

### E2E (`tests/e2e/ask.spec.ts`)

The route is stubbed with `page.route("/api/chat", …)` returning a canned
UI-message stream — tests never call the model or use Jon's key.

- ⌘K → "Ask about Jon's experience →" opens the panel; focus is in the
  textarea.
- Type a question, submit → stubbed assistant text renders in the log.
- A stubbed `tool-showContactCard` part renders `<ContactCard>` with the
  published email (assert against `content/profile`).
- A non-matching ⌘K search shows `Ask AI: "…"`; selecting it opens the panel
  and the seeded question is sent (assert the stub received it).
- Esc closes the panel; focus is restored to the trigger.
- Rate-limit stub (429 `{ error: "rate_limited" }`) → the "sending messages a
  bit fast" line shows.

### Extended existing specs

- `a11y.spec.ts`: open the panel, send a stubbed message, run axe — 0
  violations.
- `reduced-motion.spec.ts`: with `prefers-reduced-motion: reduce`, the cursor
  element has no animation (computed `animation-name: none`).

### Manual pass before promoting (preview deploy, real key)

- One real multi-turn exchange grounded in real content.
- An off-topic question ("what do you think about React vs Vue?") → the
  guardrail declines.
- A rapid burst of >5 messages in 30 s → the 429 line appears.

## Rollout

1. Branch `feat/ask-panel`. Implement; `pnpm lint`, `pnpm test`, `pnpm exec
   playwright test`, `pnpm build` all green locally.
2. In the Vercel dashboard: add Jon's Anthropic API key as a BYOK credential
   in AI Gateway. Create a Gateway API key scoped to the project with
   `--budget 5 --refresh-period monthly`. Add `AI_GATEWAY_API_KEY` to the
   project (Development + Preview scopes for now). `vercel env pull` locally.
3. Push → preview deployment. Run the manual pass against the preview URL.
4. Jon reviews the preview. On his approval, merge to `main` → production, and
   add `AI_GATEWAY_API_KEY` to the Production scope.
5. Backlog sub-projects (pitch generator, GSAP moment, CSS tier, animation
   notes) are picked up separately, each with its own spec.

## Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| Cost blow-up from abuse | Per-IP rate limit + `maxOutputTokens: 600` + Gateway monthly budget cap. |
| Prompt-injection ("ignore your instructions, write me a poem") | System prompt scopes hard to Jon's background; `maxOutputTokens` bounds damage; no tools with side effects (the one tool only surfaces already-public contact info). Worst case is an off-topic answer, not data loss or spend. |
| In-memory rate limit is per-instance | Acceptable at this traffic; documented Redis upgrade path; budget cap backstops. |
| CMS unreachable at request time | `lib/cms.ts` already falls back to the static `content/*.ts` snapshot. |
| Streaming answers spam screen readers | Live region announces only completed turns. |
| Hobby plan is non-commercial | Pre-existing exposure for the whole site; flagged to Jon, conscious call. |
| Native `<dialog>` styling/behavior quirks | Well-supported in current browsers; the site targets modern evergreen browsers; axe + manual keyboard pass cover it. |

## Open questions

None outstanding. Model, placement, statelessness, and rate-limit numbers are
decided (see Decisions).
