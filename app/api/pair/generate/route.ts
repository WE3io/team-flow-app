import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Unambiguous alphabet (no 0/O/1/I) for a code read off one screen onto another.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_TTL_MS = 10 * 60 * 1000; // ~10 minutes

function code6(): string {
  const b = randomBytes(6);
  let s = '';
  for (let i = 0; i < 6; i++) s += ALPHABET[b[i] % ALPHABET.length];
  return s;
}

/** "Bring to another device": mint a short-lived, single-use pairing code. */
export async function POST(req: Request) {
  if (!prisma) return NextResponse.json({ error: 'no-persistence' }, { status: 503 });

  let userId: string | undefined;
  try {
    ({ userId } = await req.json());
  } catch {
    return NextResponse.json({ error: 'bad-json' }, { status: 400 });
  }
  if (!userId) return NextResponse.json({ error: 'bad-request' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: 'not-found' }, { status: 404 });

  const expiresAt = new Date(Date.now() + CODE_TTL_MS);
  // Retry on the (astronomically unlikely) unique-collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = code6();
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { pairingCode: code, pairingExpiry: expiresAt },
      });
      return NextResponse.json({ code, expiresAt: expiresAt.toISOString() });
    } catch {
      // unique violation → try another code
    }
  }
  return NextResponse.json({ error: 'code-generation-failed' }, { status: 500 });
}
