import { NextResponse } from 'next/server';
import { prisma, rowFromDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EVENT_WINDOW_DAYS = 90;

/** Pull server state for a user (initial sync / after adopting via pairing). */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!prisma) return NextResponse.json({ error: 'no-persistence' }, { status: 503 });
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: { progress: true },
  });
  if (!user) return NextResponse.json({ error: 'not-found' }, { status: 404 });
  // Recent review history rides along so streaks/recap survive pairing and
  // localStorage loss (bounded window — older events age out of the metrics).
  const events = await prisma.reviewEvent.findMany({
    where: { userId: user.id, at: { gte: new Date(Date.now() - EVENT_WINDOW_DAYS * 86_400_000) } },
    orderBy: { at: 'asc' },
    take: 1000,
  });
  return NextResponse.json({
    id: user.id,
    displayName: user.displayName,
    progress: user.progress.map(rowFromDb),
    events: events.map((e) => ({ unitId: e.unitId, result: e.result, at: e.at.toISOString() })),
  });
}
