import 'server-only';
import { PrismaClient, type UnitProgress } from '@prisma/client';
import type { Grade } from './scheduler';
import type { ProgressRow } from './store';

/**
 * Prisma client singleton (Next.js dev-friendly — one instance across HMR).
 *
 * Guarded: if no DATABASE_URL is configured the app must stay fully usable
 * local-first (PHASE2_HANDOFF §Slice B), so `prisma` is `null` and API routes
 * short-circuit to "no persistence" rather than crashing the request. This is
 * what lets a preview deploy work before the Neon database is wired up.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient | null = process.env.DATABASE_URL
  ? (globalForPrisma.prisma ?? new PrismaClient())
  : null;

if (process.env.NODE_ENV !== 'production' && prisma) globalForPrisma.prisma = prisma;

/** Map a stored UnitProgress row to the client wire format. */
export function rowFromDb(p: UnitProgress): ProgressRow {
  return {
    unitId: p.unitId,
    box: p.box,
    lastSeenAt: p.lastSeenAt.toISOString(),
    dueAt: p.dueAt.toISOString(),
    lastResult: (p.lastResult as Grade | null) ?? null,
    seenCount: p.seenCount,
    bookmarked: p.bookmarked,
  };
}
