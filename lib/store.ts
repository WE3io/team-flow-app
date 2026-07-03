import { type Grade, interval, MAX_BOX, type Progress } from './scheduler';

/**
 * Local-first progress store (PHASE2_HANDOFF §Slice B).
 *
 * `StoredProgress` is the single source of truth — held in React state, mirrored
 * to localStorage for immediate offline read/write, and synced write-through to
 * Postgres via /api/progress. It maps 1:1 to the `UnitProgress` table.
 *
 * The Leitner rules stay in `lib/scheduler.ts` (governance): this module derives
 * a scheduler `Progress` view from the store; it never re-implements the boxes.
 */

export const DAY_MS = 86_400_000;
export const dayIndex = (ms: number): number => Math.floor(ms / DAY_MS);

export interface StoredUnit {
  box: number;
  /** epoch ms of last reveal/grade (real time; conflict resolution key) */
  lastSeenAtMs: number;
  /** epoch ms this unit next falls due (lastSeen + interval(box) days) */
  dueAtMs: number;
  lastResult?: Grade;
  /** times revealed/graded; 0 = bookmark-only row (not yet "seen") */
  seenCount: number;
  bookmarked: boolean;
}

export type StoredProgress = Record<string, StoredUnit>;

export const emptyStore = (): StoredProgress => ({});

/** A unit is "seen" (for scheduling / feed) only once actually revealed. */
export const isSeen = (u: StoredUnit | undefined): u is StoredUnit => !!u && u.seenCount > 0;

/** dueAt = start-of-day(lastSeen) + interval(box) days, as epoch ms. */
export function computeDueMs(lastSeenAtMs: number, box: number): number {
  return (dayIndex(lastSeenAtMs) + interval(box)) * DAY_MS;
}

function ensure(u: StoredUnit | undefined): StoredUnit {
  return (
    u ?? {
      box: 1,
      lastSeenAtMs: 0,
      dueAtMs: 0,
      seenCount: 0,
      bookmarked: false,
    }
  );
}

/** First reveal: create/upgrade a row to "seen" without grading it. */
export function markSeen(store: StoredProgress, id: string, nowMs: number): StoredProgress {
  const prev = store[id];
  if (isSeen(prev)) return store; // idempotent, mirrors scheduler.markSeen
  const base = ensure(prev);
  return {
    ...store,
    [id]: {
      ...base,
      lastSeenAtMs: nowMs,
      dueAtMs: computeDueMs(nowMs, base.box),
      seenCount: 1,
    },
  };
}

/** Grade a retrieval: promote on "good", reset to box 1 on "again". */
export function grade(store: StoredProgress, id: string, g: Grade, nowMs: number): StoredProgress {
  const prev = ensure(store[id]);
  const box = g === 'good' ? Math.min(prev.box + 1, MAX_BOX) : 1;
  return {
    ...store,
    [id]: {
      ...prev,
      box,
      lastSeenAtMs: nowMs,
      dueAtMs: computeDueMs(nowMs, box),
      lastResult: g,
      seenCount: prev.seenCount + 1,
    },
  };
}

export function toggleBookmark(store: StoredProgress, id: string, nowMs: number): StoredProgress {
  const prev = ensure(store[id]);
  // A bookmark-only row (seenCount 0) still needs a lastSeenAt for the schema;
  // it is excluded from scheduling because isSeen() checks seenCount.
  const lastSeenAtMs = prev.lastSeenAtMs || nowMs;
  return {
    ...store,
    [id]: {
      ...prev,
      lastSeenAtMs,
      dueAtMs: prev.dueAtMs || computeDueMs(lastSeenAtMs, prev.box),
      bookmarked: !prev.bookmarked,
    },
  };
}

/** Derive the scheduler's day-index Progress view (seen rows only). */
export function toSchedulerProgress(store: StoredProgress): Progress {
  const lastSeen: Record<string, number> = {};
  const boxes: Record<string, number> = {};
  const graded: Record<string, Grade> = {};
  for (const [id, u] of Object.entries(store)) {
    if (!isSeen(u)) continue;
    lastSeen[id] = dayIndex(u.lastSeenAtMs);
    boxes[id] = u.box;
    if (u.lastResult) graded[id] = u.lastResult;
  }
  return { lastSeen, boxes, graded };
}

/** Bookmark map for the Saved view. */
export function bookmarkMap(store: StoredProgress): Record<string, boolean> {
  const m: Record<string, boolean> = {};
  for (const [id, u] of Object.entries(store)) if (u.bookmarked) m[id] = true;
  return m;
}

// ---------- wire format (client ↔ /api) ----------

export interface ProgressRow {
  unitId: string;
  box: number;
  lastSeenAt: string; // ISO
  dueAt: string; // ISO
  lastResult: Grade | null;
  seenCount: number;
  bookmarked: boolean;
}

export function toRows(store: StoredProgress): ProgressRow[] {
  return Object.entries(store).map(([unitId, u]) => ({
    unitId,
    box: u.box,
    lastSeenAt: new Date(u.lastSeenAtMs).toISOString(),
    dueAt: new Date(u.dueAtMs).toISOString(),
    lastResult: u.lastResult ?? null,
    seenCount: u.seenCount,
    bookmarked: u.bookmarked,
  }));
}

export function fromRows(rows: ProgressRow[]): StoredProgress {
  const store: StoredProgress = {};
  for (const r of rows) {
    store[r.unitId] = {
      box: r.box,
      lastSeenAtMs: new Date(r.lastSeenAt).getTime(),
      dueAtMs: new Date(r.dueAt).getTime(),
      lastResult: r.lastResult ?? undefined,
      seenCount: r.seenCount,
      bookmarked: r.bookmarked,
    };
  }
  return store;
}

/**
 * Merge two stores by most-recent lastSeenAt per unit (conflict rule: newest
 * lastSeenAt wins). `bookmarked` OR-merges so a save on either device sticks.
 */
export function mergeStores(a: StoredProgress, b: StoredProgress): StoredProgress {
  const out: StoredProgress = { ...a };
  for (const [id, ub] of Object.entries(b)) {
    const ua = out[id];
    if (!ua) {
      out[id] = ub;
      continue;
    }
    const winner = ub.lastSeenAtMs > ua.lastSeenAtMs ? ub : ua;
    out[id] = { ...winner, bookmarked: ua.bookmarked || ub.bookmarked };
  }
  return out;
}
