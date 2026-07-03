import { NextResponse } from 'next/server';
import { prisma, rowFromDb } from '@/lib/db';
import type { ProgressRow } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface EventIn {
  unitId: string;
  result: 'good' | 'again';
  at: string; // ISO
}
interface Body {
  userId: string;
  rows: ProgressRow[];
  events?: EventIn[];
}

/**
 * Write-through sync. Upserts each unit with the conflict rule "most-recent
 * lastSeenAt wins" (handoff §Slice B); `bookmarked` OR-merges. Appends any new
 * ReviewEvents. Returns the authoritative merged progress.
 */
export async function POST(req: Request) {
  if (!prisma) return NextResponse.json({ error: 'no-persistence' }, { status: 503 });

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad-json' }, { status: 400 });
  }
  const { userId, rows = [], events = [] } = body;
  if (!userId || !Array.isArray(rows)) {
    return NextResponse.json({ error: 'bad-request' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: 'not-found' }, { status: 404 });

  const existing = await prisma.unitProgress.findMany({ where: { userId } });
  const byUnit = new Map(existing.map((p) => [p.unitId, p]));

  const writes = [];
  for (const r of rows) {
    const incomingMs = Date.parse(r.lastSeenAt);
    if (Number.isNaN(incomingMs)) continue;
    const prev = byUnit.get(r.unitId);
    const bookmarked = (prev?.bookmarked ?? false) || r.bookmarked;

    // Newest lastSeenAt wins; if stored is as-new or newer keep its scheduling
    // fields but still let a bookmark from either side stick.
    if (prev && prev.lastSeenAt.getTime() >= incomingMs) {
      if (bookmarked !== prev.bookmarked) {
        writes.push(
          prisma.unitProgress.update({
            where: { userId_unitId: { userId, unitId: r.unitId } },
            data: { bookmarked },
          }),
        );
      }
      continue;
    }

    const data = {
      box: r.box,
      lastSeenAt: new Date(incomingMs),
      dueAt: new Date(r.dueAt),
      lastResult: r.lastResult,
      seenCount: r.seenCount,
      bookmarked,
    };
    writes.push(
      prisma.unitProgress.upsert({
        where: { userId_unitId: { userId, unitId: r.unitId } },
        create: { userId, unitId: r.unitId, ...data },
        update: data,
      }),
    );
  }

  const validEvents = events.filter(
    (e) => e && e.unitId && (e.result === 'good' || e.result === 'again') && !Number.isNaN(Date.parse(e.at)),
  );
  if (validEvents.length) {
    writes.push(
      prisma.reviewEvent.createMany({
        data: validEvents.map((e) => ({ userId, unitId: e.unitId, result: e.result, at: new Date(e.at) })),
      }),
    );
  }

  if (writes.length) await prisma.$transaction(writes);

  const merged = await prisma.unitProgress.findMany({ where: { userId } });
  return NextResponse.json({ ok: true, progress: merged.map(rowFromDb) });
}
