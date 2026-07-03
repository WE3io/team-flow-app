import type { Unit } from './types';

/**
 * The spacing scheduler — a Leitner box model (handoff §6b, seed §6).
 * Boxes 1–5 with expanding intervals. "Got it" promotes a box; "Not yet"
 * resets to box 1. A unit is due when simDay ≥ lastSeen + interval(box).
 *
 * All state is kept per-unit in plain maps so the whole thing stays pure and
 * legible; the UI holds it in React state (Phase 1 = local/in-memory only).
 */

export const LEITNER_INTERVALS: Record<number, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 16,
  5: 35,
};
export const MAX_BOX = 5;

export type Grade = 'good' | 'again';

export interface Progress {
  /** simulated-day each unit was last seen/graded; undefined = never seen */
  lastSeen: Record<string, number>;
  /** current Leitner box per unit (defaults to 1) */
  boxes: Record<string, number>;
  /** last grade per unit */
  graded: Record<string, Grade>;
}

export const emptyProgress = (): Progress => ({
  lastSeen: {},
  boxes: {},
  graded: {},
});

export function box(p: Progress, id: string): number {
  return p.boxes[id] ?? 1;
}

export function seen(p: Progress, id: string): boolean {
  return p.lastSeen[id] !== undefined;
}

export function interval(b: number): number {
  return LEITNER_INTERVALS[b] ?? LEITNER_INTERVALS[MAX_BOX];
}

/** dueAt = lastSeenAt + interval(box). */
export function dueDay(p: Progress, id: string): number | null {
  if (!seen(p, id)) return null;
  return p.lastSeen[id] + interval(box(p, id));
}

export function isDue(p: Progress, id: string, simDay: number): boolean {
  const due = dueDay(p, id);
  return due !== null && simDay >= due;
}

/** Mark a unit seen (first reveal) without grading it. */
export function markSeen(p: Progress, id: string, simDay: number): Progress {
  if (seen(p, id)) return p;
  return { ...p, lastSeen: { ...p.lastSeen, [id]: simDay } };
}

/** Grade a retrieval: promote on "good", reset to box 1 on "again". */
export function grade(p: Progress, id: string, g: Grade, simDay: number): Progress {
  const b = box(p, id);
  return {
    lastSeen: { ...p.lastSeen, [id]: simDay },
    boxes: { ...p.boxes, [id]: g === 'good' ? Math.min(b + 1, MAX_BOX) : 1 },
    graded: { ...p.graded, [id]: g },
  };
}

/**
 * Interleave units so no two consecutive cards share a collection — mix
 * types/topics (handoff §6). Round-robins across collection buckets.
 */
export function interleave(units: Unit[]): Unit[] {
  const groups = new Map<string, Unit[]>();
  for (const u of units) {
    const g = groups.get(u.collection) ?? [];
    g.push(u);
    groups.set(u.collection, g);
  }
  const out: Unit[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const g of groups.values()) {
      const next = g.shift();
      if (next) {
        out.push(next);
        added = true;
      }
    }
  }
  return out;
}

/**
 * The feed order (handoff §6):
 *  - Novice exception: a brand-new user (nothing seen in Start Here) gets the
 *    Start Here level-1 units in order first, then everything else interleaved.
 *  - Otherwise: due units first (soonest-due first), then the rest interleaved.
 */
export function computeFeed(units: Unit[], p: Progress, simDay: number, noviceOrdering = true): Unit[] {
  const seenStartHere = units.some((u) => u.collection === 'start-here' && seen(p, u.id));

  if (noviceOrdering && !seenStartHere) {
    const start = units.filter((u) => u.collection === 'start-here').sort((a, b) => a.level - b.level);
    const rest = interleave(units.filter((u) => u.collection !== 'start-here'));
    return [...start, ...rest];
  }

  const due = units.filter((u) => isDue(p, u.id, simDay)).sort((a, b) => dueDay(p, a.id)! - dueDay(p, b.id)!);
  const rest = interleave(units.filter((u) => !isDue(p, u.id, simDay)));
  return [...due, ...rest];
}

export function dueUnits(units: Unit[], p: Progress, simDay: number): Unit[] {
  return units.filter((u) => isDue(p, u.id, simDay));
}

/**
 * The directed path (handoff §5/§9): Start Here → The Everyday Flow, ordered
 * by level. A step counts done when graded "good", or (for prompt-less units)
 * simply revealed.
 */
export function pathUnits(units: Unit[]): Unit[] {
  const inOrder = (coll: string) =>
    units.filter((u) => u.collection === coll).sort((a, b) => a.level - b.level);
  return [...inOrder('start-here'), ...inOrder('everyday-flow')];
}

export function isStepDone(u: Unit, p: Progress, revealed: Record<string, boolean>): boolean {
  return p.graded[u.id] === 'good' || (!!revealed[u.id] && !u.prompt);
}
