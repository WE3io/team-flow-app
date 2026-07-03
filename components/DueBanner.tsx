'use client';
import { tokens } from '@/lib/theme';

/**
 * Daily-review banner — the "dark instrument moment" (transcript direction).
 * A black card with a glowing green due-count ring; opens the due queue in the
 * story viewer.
 */
export default function DueBanner({ count, onOpen }: { count: number; onOpen: () => void }) {
  return (
    <div
      onClick={onOpen}
      style={{
        margin: '14px 18px 2px',
        padding: '14px 16px',
        borderRadius: 16,
        background: tokens.ink,
        color: '#F7F6F2',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: tokens.glow,
          boxShadow: '0 0 18px rgba(53,208,127,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '0 0 auto',
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: tokens.ink,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 900,
            color: tokens.glow,
          }}
        >
          {count}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: '#8B887B',
          }}
        >
          Daily review
        </span>
        <span style={{ fontSize: 14, fontWeight: 700 }}>
          {count} {count === 1 ? 'card is' : 'cards are'} due for review
        </span>
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 800,
          padding: '8px 14px',
          borderRadius: 999,
          background: tokens.glow,
          color: tokens.ink,
        }}
      >
        Start
      </span>
    </div>
  );
}
