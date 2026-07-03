# Team Flow — internal learning platform

Mobile-first, "snackable" learning app that teaches our team the Git /
trunk-based / AI-assisted workflow. Content is authored once in the seed and
rendered into Instagram-style primitives (feed, carousels, stories, reels,
highlights, saved). See `Team_Workflow_Learning_Seed_v0.2.md` (content + design
governance, **binding** — esp. §6) and `Platform_Build_Handoff_for_Claude_Code.md`
(build spec).

## Status: Phase 1 complete + deployed; Phase 2 in progress

Phase 1 (rendering MVP) is live at https://team-flow-app-lilac.vercel.app —
pushes to `main` auto-deploy production; branches get Vercel previews.
Phase 2 work is specified in **`PHASE2_HANDOFF.md`** — read it before touching
Phase 2 scope. Done so far: slice A (responsive shell — phone frame removed,
centred 768px column), slice B (persistence — Prisma + Postgres, local-first
sync, pairing codes, real-date scheduling), and slice C (profile/settings —
avatar entry, editable name, collection/box stats, pairing UI, canvas share
card, reset), and slice D (gamification — leaderboard, streaks, collection
badges, weekly recap; see `lib/stats.ts` + `/api/leaderboard`). Phase 2 is
complete pending review. Quizzing (Phase 3) is still out of scope.

Persistence is **optional at runtime**: without `DATABASE_URL` the app runs
local-first (localStorage only) and API routes return 503 `no-persistence`.
Deploys need the Neon connection strings in Vercel env (see `.env.example`)
plus `prisma migrate deploy` in the build once a database exists.

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
app/                 Next routes (server page loads content → client app).
  api/               health + persistence: user (create/get/name/reset),
                     progress (write-through sync), pair (generate/claim).
components/          UI. TeamFlowApp = client orchestrator holding all state.
  RevealBlock.tsx    Shared tap-to-reveal / grade / carousel / reel (§6a).
  views/             Feed, Path, Search, Saved, Library.
lib/
  types.ts           Unit + Collection zod schemas + types.
  bundle.ts          Pure content loader/validator (used by app + scripts).
  content.ts         Server-only cached wrapper.
  collections.ts     Collection colour/letter identity.
  scheduler.ts       Leitner boxes + interleave + novice rule + path (§6b).
                     Governance — pure day-index rules; do not change them.
  store.ts           Local-first progress store (real dates ↔ day-index) +
                     wire format + most-recent-lastSeenAt merge.
  sync.ts            useTeamFlowStore(): localStorage persistence, debounced
                     write-through sync, pairing client.
  db.ts              Guarded Prisma singleton (null without DATABASE_URL).
  query.ts           Search + library filters.
  theme.ts           Tokens, type styles, tier labels.
prisma/              schema.prisma (User/UnitProgress/ReviewEvent) + migrations.
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
npm run db:migrate        # prisma migrate dev (needs .env; see .env.example)
npm run db:deploy         # prisma migrate deploy (production/CI)
```

## Non-negotiable learning features (seed §6 — do not drop)

1. **Question-first / tap-to-reveal** is the default card interaction. Units
   with a `prompt` show it before the `answer`; others use hook→body reveal.
2. **Spacing scheduler** (Leitner boxes 1/3/7/16/35 days). "Got it" promotes a
   box, "Not yet" resets to box 1; the feed prioritises due units. Scheduling
   runs on real dates at day granularity; `NEXT_PUBLIC_SCHEDULER_DEMO=1`
   re-enables the Scheduler-demo control (a client-side "jump ahead" lens for
   reviewing previews — stored dates are never changed).
3. **Interleave** the feed (mix types/topics), with the novice exception
   (brand-new users get Start Here level-1 in order first).
4. **Prohibitions:** never tag/route by "learning style"; visuals carry
   information, never decoration; measure retrieval/completion, not engagement.

## Conventions

- British English in content (matches the seed). Code/comments as usual.
- Content changes go through the seed → `npm run migrate:seed`, never by editing
  generated MDX directly.
