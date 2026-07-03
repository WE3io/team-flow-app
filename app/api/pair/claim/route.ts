import { NextResponse } from 'next/server';
import { prisma, rowFromDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Claim a pairing code on a second device: adopt that user id and pull its
 * state. The code is single-use — rotated/invalidated on success (handoff
 * §Slice B). The client then merges any local unsynced units (server wins ties
 * by most-recent lastSeenAt).
 */
export async function POST(req: Request) {
  if (!prisma) return NextResponse.json({ error: 'no-persistence' }, { status: 503 });

  let code: string | undefined;
  try {
    ({ code } = await req.json());
  } catch {
    return NextResponse.json({ error: 'bad-json' }, { status: 400 });
  }
  if (!code) return NextResponse.json({ error: 'bad-request' }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { pairingCode: code.trim().toUpperCase() },
    include: { progress: true },
  });
  if (!user?.pairingExpiry || user.pairingExpiry.getTime() < Date.now()) {
    return NextResponse.json({ error: 'invalid-or-expired' }, { status: 404 });
  }

  // Single-use: invalidate the code now that it has been claimed.
  await prisma.user.update({
    where: { id: user.id },
    data: { pairingCode: null, pairingExpiry: null },
  });

  return NextResponse.json({
    userId: user.id,
    displayName: user.displayName,
    progress: user.progress.map(rowFromDb),
  });
}
