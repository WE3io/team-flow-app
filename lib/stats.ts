import { DAY_MS, dayIndex, isSeen, type StoredProgress } from './store';
import type { Unit } from './types';

/** Box ≥ 4 counts as mastered (handoff §Slice D). */
export const MASTERED_BOX = 4;

/**
 * Gamification metrics (PHASE2_HANDOFF §Slice D) — pure functions, shared by
 * the profile UI and the leaderboard route.
 *
 * Seed §6 governance: everything here measures retrieval success, completion,
 * or returning (streaks) — never engagement. Day boundaries are UTC days
 * (the same day-index the scheduler uses).
 */

export interface ReviewLogEntry {
  unitId: string;
  result: 'good' | 'again';
  /** epoch ms */
  atMs: number;
}

export interface Streaks {
  current: number;
  best: number;
}

/**
 * A day counts if the user graded ≥ 1 card that day. The current streak
 * includes today, or yesterday's run if today has no review yet (a streak is
 * "alive" until a full day is missed).
 */
export function computeStreaks(reviewDayIndices: Iterable<number>, todayIdx: number): Streaks {
  const days = [...new Set(reviewDayIndices)].sort((a, b) => a - b);
  if (days.length === 0) return { current: 0, best: 0 };

  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = days[i] === days[i - 1] + 1 ? run + 1 : 1;
    if (run > best) best = run;
  }

  const last = days[days.length - 1];
  let current = 0;
  if (last === todayIdx || last === todayIdx - 1) {
    current = 1;
    for (let i = days.length - 2; i >= 0; i--) {
      if (days[i] === days[i + 1] - 1) current++;
      else break;
    }
  }
  return { current, best };
}

export interface Recap {
  reviewed: number;
  /** 0..100, null when nothing reviewed in the window */
  accuracyPct: number | null;
  newlyMastered: number;
  activeDays: number;
}

/** Trailing 7-day recap from the review log (client) or ReviewEvent rows (server). */
export function computeRecap(log: ReviewLogEntry[], nowMs: number, store: StoredProgress): Recap {
  const cutoff = nowMs - 7 * DAY_MS;
  const recent = log.filter((e) => e.atMs >= cutoff);
  const good = recent.filter((e) => e.result === 'good').length;

  // Newly mastered: units now at box ≥ MASTERED_BOX whose promoting review
  // ("good" at box MASTERED_BOX-1 or later) happened inside the window. The
  // store only has current state, so approximate: mastered now + last graded
  // "good" within the window.
  let newlyMastered = 0;
  for (const [id, u] of Object.entries(store)) {
    if (!isSeen(u) || u.box < MASTERED_BOX || u.lastResult !== 'good') continue;
    if (u.lastSeenAtMs >= cutoff && recent.some((e) => e.unitId === id && e.result === 'good'))
      newlyMastered++;
  }

  return {
    reviewed: recent.length,
    accuracyPct: recent.length ? Math.round((good / recent.length) * 100) : null,
    newlyMastered,
    activeDays: new Set(recent.map((e) => dayIndex(e.atMs))).size,
  };
}

export interface CollectionBadge {
  collectionId: string;
  completed: boolean;
  mastered: boolean;
}

/** Per collection: "completed" = all units seen; "mastered" = all units box ≥ 4. */
export function computeBadges(units: Unit[], store: StoredProgress): CollectionBadge[] {
  const byCollection = new Map<string, Unit[]>();
  for (const u of units) {
    const g = byCollection.get(u.collection) ?? [];
    g.push(u);
    byCollection.set(u.collection, g);
  }
  const out: CollectionBadge[] = [];
  for (const [collectionId, us] of byCollection) {
    const seen = us.filter((u) => isSeen(store[u.id]));
    const completed = seen.length === us.length;
    const mastered = completed && us.every((u) => (store[u.id]?.box ?? 0) >= MASTERED_BOX);
    out.push({ collectionId, completed, mastered });
  }
  return out;
}

/** Units mastered = box ≥ 4 among seen units (leaderboard primary key). */
export function masteredCount(store: StoredProgress): number {
  return Object.values(store).filter((u) => isSeen(u) && u.box >= MASTERED_BOX).length;
}
