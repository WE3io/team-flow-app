# Phase 2 Handoff — Persistence, Responsive Shell, Profile & Gamification

**For:** a Claude Code cloud session working in this repo.
**Prerequisites:** read `CLAUDE.md` first. The seed's learning-design governance
(`CLAUDE.md` §"Non-negotiable learning features") remains **binding** — it
constrains the gamification workstream in particular.

Phase 1 (rendering MVP) is complete and live in production at
https://team-flow-app-lilac.vercel.app — pushes to `main` auto-deploy to
production; other branches get Vercel preview URLs.

---

## 0. Ways of working

- Build in **four slices, in order (A → D below), one branch + PR-sized push
  each**. Push the branch, note the Vercel preview URL, and **stop for review
  at the end of each slice** before starting the next. Do not merge to `main`
  yourself unless told to.
- Keep dependencies minimal; every library must earn its place. Prisma is the
  one pre-approved addition (slice B).
- `npm run typecheck` and `npm run validate:content` must pass before every
  push. The design system tokens live in `lib/theme.ts` — reuse them; do not
  introduce new colours outside the existing palette without reason.
- British English in all user-facing copy.

## 1. Environment

Available env vars in the cloud session and what to do with each:

- `NEON_TOKEN` — a **Neon API key**. Administer the database yourself via the
  Neon API (https://api.neon.tech): create (or reuse) a project + database,
  and obtain both connection strings. Use the **pooled** string as
  `DATABASE_URL` at runtime and the **direct** (non-pooled) one as
  `DIRECT_URL` for migrations (Prisma `directUrl`; Neon pooled hosts contain
  `-pooler`). Write them to a git-ignored `.env` locally.
- `VERCEL_TOKEN` — a Vercel API token. Use it to set `DATABASE_URL` /
  `DIRECT_URL` (and the Sentry DSN, below) on the Vercel project
  `team-flow-app` for **Production + Preview** environments yourself
  (`vercel env add … --token` or the REST API), and to check deploy status /
  logs after pushes.
- `SENTRY_TOKEN` — a Sentry auth token. See "Extra — error monitoring" below.
- `CONTEXT7_API_KEY` — for the Context7 docs-lookup tooling available to you
  as a session; not application scope.
- Migrations: `prisma migrate dev` locally per migration; production applies
  via `prisma migrate deploy` (add to the Vercel build command:
  `prisma migrate deploy && next build`).
- **Never commit secrets** — connection strings and DSNs live in `.env`
  (git-ignored) and Vercel env, nowhere else. (This platform teaches exactly
  that rule — unit `ai-secrets`.)

---

## Slice A — Remove the phone frame; tablet-constrained responsive shell

Cheapest slice; do it first as a warm-up.

- Delete the `PhoneFrame` bezel/status-bar presentation entirely. The app
  becomes a real full-viewport web app.
- Constrain the layout to a **centred column, `max-width: 768px`** (standard
  tablet portrait) on wider screens, with the canvas colour (`tokens.canvas`)
  filling the space outside. Within the column, the existing mobile-first
  layout should survive nearly unchanged — that constraint is deliberate, to
  avoid redesigning components.
- Bottom nav stays (it works at tablet width). Overlays (`DetailSheet`,
  `StoryViewer`) are currently absolutely positioned inside the frame —
  re-anchor them to the constrained column, not the full viewport width.
- Verify at 390 px, 768 px, and a desktop width; no horizontal scroll at any
  of them.

**Acceptance:** app is usable and looks intentional on a laptop browser and a
phone; no `PhoneFrame` remnants; overlays open correctly at all three widths.

---

## Slice B — Persistence: local-first with cross-device pairing

Identity model (decided): **anonymous users + pairing code**. No OAuth, no
email.

### Data model (Prisma, keep it this small)

```prisma
model User {
  id           String   @id @default(cuid())
  displayName  String   @default("Anonymous")
  createdAt    DateTime @default(now())
  pairingCode  String?  @unique   // short-lived claim code, nullable
  pairingExpiry DateTime?
  progress     UnitProgress[]
  events       ReviewEvent[]
}

model UnitProgress {
  userId     String
  unitId     String
  box        Int      @default(1)
  lastSeenAt DateTime
  dueAt      DateTime
  lastResult String?  // 'good' | 'again'
  seenCount  Int      @default(0)
  bookmarked Boolean  @default(false)
  user       User     @relation(fields: [userId], references: [id])
  @@id([userId, unitId])
}

model ReviewEvent {
  id      String   @id @default(cuid())
  userId  String
  unitId  String
  result  String   // 'good' | 'again'
  at      DateTime @default(now())
  user    User     @relation(fields: [userId], references: [id])
  @@index([userId, at])
}
```

`ReviewEvent` exists to compute retrieval accuracy, streaks, and the weekly
recap (slices C/D) — don't add more tables until a real need appears.

### Behaviour

- **Local-first:** localStorage remains the immediate read/write store (the
  app must stay fully usable offline / before first sync). Sync write-through
  to Postgres via API routes (`app/api/...`); on conflict, most-recent
  `lastSeenAt` per unit wins.
- **First visit:** create an anonymous `User` server-side, store its id in
  localStorage.
- **Real time replaces `simDay`:** scheduling moves to real dates at day
  granularity (`dueAt = lastSeenAt + interval(box)` in days). Keep the
  Scheduler-demo control but gate it behind `NEXT_PUBLIC_SCHEDULER_DEMO=1`
  (it remains the fastest way to review scheduler behaviour on previews —
  when enabled, it offsets "today" client-side only).
- **Pairing:** in the profile panel (slice C stub is fine for now): "Bring to
  another device" generates a 6-character code valid ~10 minutes; entering it
  on another device adopts that user id and pulls server state (server wins;
  local unsynced units merge by most-recent `lastSeenAt`). Rotate/invalidate
  the code after use.
- The Leitner rules in `lib/scheduler.ts` (boxes 1/3/7/16/35, promote/reset,
  interleave, novice rule) are governance — the storage layer changes, the
  rules must not.

**Acceptance:** grade cards on device 1 → pair device 2 → identical state
appears; going offline still allows reveal/grade with sync on return; the
production feed prioritises genuinely-due units day to day.

---

## Slice C — Profile & settings panel

- Entry point: replace the static yellow day sticker in the feed header with a
  compact avatar/initials button (the day count moves inside the profile
  panel). Opens a full-screen panel consistent with the existing design
  language ("quiet tool, loud progress" — reuse the collection donut
  visual language).
- Contents:
  - Editable `displayName` (this is what the leaderboard shows).
  - Per-collection progress donuts + Leitner box distribution.
  - Badges and streak (slice D data; render placeholders until then).
  - Pairing UI (generate / enter code) from slice B.
  - **Share progress:** a share-card — a canvas- or OG-route-rendered image
    (collection donuts + mastered count + streak) the user can download or
    share via the Web Share API. No public profile pages for now.
- Settings: the scheduler-demo toggle (when the env flag enables it), and a
  "reset my progress" with confirm.

**Acceptance:** rename yourself, see collection/box stats update live, and
produce a share image on phone and desktop.

---

## Slice D — Gamification (seed-governance-compliant)

The seed §6 prohibitions are binding here: **measure retrieval success and
completion, never engagement**. No points-per-tap, no time-in-app, no likes.

- **Leaderboard** (all users, internal team): ranked by **units mastered**
  (box ≥ 4) primary, **retrieval accuracy over the last 30 days** (from
  `ReviewEvent`) secondary. Show streaks as a column. Lives as a section in
  the profile panel (or its own tab if nav allows). Update on load; no
  real-time infra.
- **Review streaks:** a day counts if the user graded ≥ 1 card that day.
  Show current + best streak on the profile; a subtle streak chip may appear
  in the feed header. Streaks reward *returning*, which is what makes spacing
  work — this is the seed-endorsed mechanic.
- **Collection badges:** per collection, "completed" (all units seen) and
  "mastered" (all units box ≥ 4). Render on profile + share card.
- **Weekly recap** on the profile: cards reviewed, accuracy, due-cards cleared
  rate, newly mastered units — computed from `ReviewEvent`, no cron needed.

**Acceptance:** two users on the leaderboard ranked by mastery; streak
increments across a (real or demo-offset) day boundary; badges appear when a
collection completes; recap shows correct numbers for the trailing 7 days.

---

## Extra — error monitoring (Sentry)

Small task; do it alongside slice B (that's when server routes appear) or as
a final pass after D.

- Using `SENTRY_TOKEN`, create (or reuse) a Sentry project via the API and
  wire `@sentry/nextjs` with its DSN — error monitoring only (client +
  server), no performance tracing/replay, keep the config minimal.
- Set the DSN in Vercel env via `VERCEL_TOKEN`; use `SENTRY_TOKEN` for
  source-map upload in the build if straightforward, otherwise skip
  source maps and note it.
- This closes the "no error monitoring" gap flagged at first deploy. It does
  **not** license product analytics — the seed's measurement prohibitions
  stand.

## Out of scope (do not pull forward)

Quizzing/distractor rendering (Phase 3), auth providers, notifications/email,
Coolify/Docker deploy (the platform currently deploys via Vercel), analytics
beyond the retrieval metrics above.

## Kickoff prompt (paste into the cloud session)

> Read `CLAUDE.md` and `PHASE2_HANDOFF.md` in this repo fully. Then implement
> the four slices in order (A responsive shell, B persistence + pairing,
> C profile/settings, D gamification), following the handoff's ways-of-working:
> one branch per slice, typecheck + validate:content green before every push,
> push and stop for review at the end of each slice with the Vercel preview
> URL. Before writing code for slice A, summarise your plan for all four
> slices and flag anything you'd do differently, with reasons.
