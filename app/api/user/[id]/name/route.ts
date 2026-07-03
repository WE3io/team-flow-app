import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Rename a user (leaderboard display name — handoff §Slice C). */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!prisma) return NextResponse.json({ error: 'no-persistence' }, { status: 503 });
  let displayName: string | undefined;
  try {
    ({ displayName } = await req.json());
  } catch {
    return NextResponse.json({ error: 'bad-json' }, { status: 400 });
  }
  const name = (displayName ?? '').trim().slice(0, 40);
  if (!name) return NextResponse.json({ error: 'bad-request' }, { status: 400 });
  try {
    const user = await prisma.user.update({ where: { id: params.id }, data: { displayName: name } });
    return NextResponse.json({ id: user.id, displayName: user.displayName });
  } catch {
    return NextResponse.json({ error: 'not-found' }, { status: 404 });
  }
}
