import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Reset a user's progress (keeps identity — handoff §Slice C settings). */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  if (!prisma) return NextResponse.json({ error: 'no-persistence' }, { status: 503 });
  const userId = params.id;
  await prisma.$transaction([
    prisma.unitProgress.deleteMany({ where: { userId } }),
    prisma.reviewEvent.deleteMany({ where: { userId } }),
  ]);
  return NextResponse.json({ ok: true });
}
