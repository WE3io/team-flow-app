import type { DeployClassPref, Unit } from './types';

/**
 * Deploy-class relevance filter (seed §3). A unit shows when the pref is 'all',
 * or the unit is universal (no `appliesTo`), or its `appliesTo` includes the
 * chosen class. This is relevance-by-deployment-context — never the
 * seed-prohibited "learning style" routing.
 */
export function visibleForClass(units: Unit[], pref: DeployClassPref): Unit[] {
  if (pref === 'all') return units;
  return units.filter((u) => !u.appliesTo?.length || u.appliesTo.includes(pref));
}

/**
 * Search — "lookup under stress" (handoff §5.3, acceptance §9.3). Matches
 * title/hook/body/carousel/topics/type and surfaces `runbook` units first so
 * "Git just broke — what now?" is never buried. Guards missing fields.
 */
export function searchUnits(units: Unit[], query: string): Unit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const match = (u: Unit) =>
    u.title.toLowerCase().includes(q) ||
    (u.hook || '').toLowerCase().includes(q) ||
    (u.body || '').toLowerCase().includes(q) ||
    (u.answer || '').toLowerCase().includes(q) ||
    (u.carousel || []).some((sl) => `${sl.heading} ${sl.body}`.toLowerCase().includes(q)) ||
    u.topics.some((t) => t.toLowerCase().includes(q)) ||
    u.type.includes(q);
  return units.filter(match).sort((a, b) => (b.type === 'runbook' ? 1 : 0) - (a.type === 'runbook' ? 1 : 0));
}

export function runbookUnits(units: Unit[]): Unit[] {
  return units.filter((u) => u.type === 'runbook');
}

/** Library filter by tier + type. Tier `all` units always show for any tier. */
export function filterLibrary(units: Unit[], tierFilter: string, typeFilter: string): Unit[] {
  return units.filter(
    (u) =>
      (tierFilter === 'all' || u.tier === tierFilter || u.tier === 'all') &&
      (typeFilter === 'all' || u.type === typeFilter),
  );
}
