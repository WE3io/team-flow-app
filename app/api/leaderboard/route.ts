import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { computeStreaks, MASTERED_BOX } from '@/lib/stats';
import { DAY_MS, dayIndex } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ACCURACY_WINDOW_DAYS = 30;

/**
 * Team leaderboard (handoff §Slice D): ranked by units mastered (box ≥ 4)
 * primary, retrieval accuracy over the last 30 days secondary; streak shown as
 * a column. Computed on request — internal team scale, no caching or realtime.
 *
 * Seed §6: these are retrieval/completion/returning measures only.
 */
export async function GET() {
  if (!prisma) return NextResponse.json({ error: 'no-persistence' }, { status: 503 });

  const since = new Date(Date.now() - ACCURACY_WINDOW_DAYS * DAY_MS);
  const [users, mastered, events] = await Promise.all([
    prisma.user.findMany({ select: { id: true, displayName: true } }),
    prisma.unitProgress.groupBy({
      by: ['userId'],
      where: { box: { gte: MASTERED_BOX } },
      _count: { unitId: true },
    }),
    prisma.reviewEvent.findMany({
      where: { at: { gte: since } },
      select: { userId: true, result: true, at: true },
    }),
  ]);

  const masteredBy = new Map(mastered.map((m) => [m.userId, m._count.unitId]));
  const eventsBy = new Map<string, { good: number; total: number; days: Set<number> }>();
  for (const e of events) {
    const agg = eventsBy.get(e.userId) ?? { good: 0, total: 0, days: new Set<number>() };
    agg.total++;
    if (e.result === 'good') agg.good++;
    agg.days.add(dayIndex(e.at.getTime()));
    eventsBy.set(e.userId, agg);
  }

  const todayIdx = dayIndex(Date.now());
  const rows = users
    .map((u) => {
      const agg = eventsBy.get(u.id);
      return {
        userId: u.id,
        displayName: u.displayName,
        mastered: masteredBy.get(u.id) ?? 0,
        accuracyPct: agg?.total ? Math.round((agg.good / agg.total) * 100) : null,
        streak: agg ? computeStreaks(agg.days, todayIdx).current : 0,
        reviewed30: agg?.total ?? 0,
      };
    })
    // Hide rows with no activity at all — freshly-created anonymous users.
    .filter((r) => r.mastered > 0 || r.reviewed30 > 0)
    .sort((a, b) => b.mastered - a.mastered || (b.accuracyPct ?? -1) - (a.accuracyPct ?? -1));

  return NextResponse.json({ leaderboard: rows.slice(0, 50) });
}
