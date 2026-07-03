import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** First visit: create an anonymous user server-side (handoff §Slice B). */
export async function POST() {
  if (!prisma) return NextResponse.json({ error: 'no-persistence' }, { status: 503 });
  const user = await prisma.user.create({ data: {} });
  return NextResponse.json({ id: user.id, displayName: user.displayName });
}
