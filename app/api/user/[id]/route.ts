import { NextResponse } from 'next/server';
import { prisma, rowFromDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Pull server state for a user (initial sync / after adopting via pairing). */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!prisma) return NextResponse.json({ error: 'no-persistence' }, { status: 503 });
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: { progress: true },
  });
  if (!user) return NextResponse.json({ error: 'not-found' }, { status: 404 });
  return NextResponse.json({
    id: user.id,
    displayName: user.displayName,
    progress: user.progress.map(rowFromDb),
  });
}
