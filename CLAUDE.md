# Team Flow — internal learning platform

Mobile-first, "snackable" learning app that teaches our team the Git /
trunk-based / AI-assisted workflow. Content is authored once in the seed and
rendered into Instagram-style primitives (feed, carousels, stories, reels,
highlights, saved). See `Team_Workflow_Learning_Seed_v0.2.md` (content + design
governance, **binding** — esp. §6) and `Platform_Build_Handoff_for_Claude_Code.md`
(build spec).

## Status: Phase 1 (Rendering MVP) — complete, no backend

Local/in-memory state only. Phases 2–4 (Postgres/Prisma, auth, quizzing, deploy)
are **not** built yet — do not pull them forward. Stop points are per the
handoff §2.

## Stack

- **Next.js (App Router) + TypeScript**, `output: 'standalone'` (single Coolify
  container, one health check — unit `eng-coolify-singleimage`).
- **Tailwind CSS** for scaffolding; the design system lives in `lib/theme.ts`
  (tokens) + inline styles for pixel fidelity to the approved prototype.
- **Content:** one `content/units/<id>.mdx` per unit (YAML frontmatter matching
  the `Unit` type). Generated from the seed by `scripts/migrate-seed.ts`.
- **Validation:** `zod` (`lib/types.ts`). Content is validated at build time;
  invalid/duplicate ids fail the build (acceptance §9.9).
- Deps kept minimal (handoff §3). No component library yet.

## Design direction: "quiet tool, loud progress"

Calm hairline surfaces (feed/library/search); colour lives in progress
(highlight donuts, Leitner state) and collection/type accents. Daily review is
a dark "instrument" moment. Yellow day sticker is the one playful wink.

## Layout

```
app/                 Next routes (server page loads content → client app) + /api/health
components/          UI. TeamFlowApp = client orchestrator holding all state.
  RevealBlock.tsx    Shared tap-to-reveal / grade / carousel / reel (§6a).
  views/             Feed, Path, Search, Saved, Library.
lib/
  types.ts           Unit + Collection zod schemas + types.
  bundle.ts          Pure content loader/validator (used by app + scripts).
  content.ts         Server-only cached wrapper.
  collections.ts     Collection colour/letter identity.
  scheduler.ts       Leitner boxes + interleave + novice rule + path (§6b).
  query.ts           Search + library filters.
  theme.ts           Tokens, type styles, tier labels.
content/units/*.mdx  Generated content (do not hand-edit; re-run migrate:seed).
content/collections.json
scripts/             migrate-seed.ts, validate-content.ts
```

## Commands

```
npm run dev               # local dev
npm run build             # prod build (validates content — fails on bad units)
npm run typecheck         # tsc --noEmit
npm run validate:content  # standalone content gate (for CI)
npm run migrate:seed      # regenerate content/ from the seed
```

## Non-negotiable learning features (seed §6 — do not drop)

1. **Question-first / tap-to-reveal** is the default card interaction. Units
   with a `prompt` show it before the `answer`; others use hook→body reveal.
2. **Spacing scheduler** (Leitner boxes 1/3/7/16/35 days). "Got it" promotes a
   box, "Not yet" resets to box 1; the feed prioritises due units. Phase 1 uses
   a simulated day (Scheduler-demo control on the Feed) in place of real time.
3. **Interleave** the feed (mix types/topics), with the novice exception
   (brand-new users get Start Here level-1 in order first).
4. **Prohibitions:** never tag/route by "learning style"; visuals carry
   information, never decoration; measure retrieval/completion, not engagement.

## Conventions

- British English in content (matches the seed). Code/comments as usual.
- Content changes go through the seed → `npm run migrate:seed`, never by editing
  generated MDX directly.
