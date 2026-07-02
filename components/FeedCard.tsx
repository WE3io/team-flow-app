'use client';
import type { Unit, Collection } from '@/lib/types';
import { tokens, typeStyle, tierLabel } from '@/lib/theme';
import { isDue } from '@/lib/scheduler';
import RevealBlock from './RevealBlock';
import type { UnitActions } from './UnitActions';

export default function FeedCard({
  unit,
  collection,
  actions,
  simDay,
}: {
  unit: Unit;
  collection?: Collection;
  actions: UnitActions;
  simDay: number;
}) {
  const ts = typeStyle(unit.type);
  const collColor = collection?.color ?? tokens.ink;
  const due = isDue(actions.progress, unit.id, simDay);
  const bookmarked = !!actions.bookmarks[unit.id];

  return (
    <div
      style={{
        background: tokens.surface,
        border: `1px solid ${tokens.hairline}`,
        borderRadius: 16,
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: '0 1px 2px rgba(22,21,15,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: 1,
            textTransform: 'uppercase',
            padding: '3px 8px',
            borderRadius: 999,
            background: ts.bg,
            color: ts.color,
          }}
        >
          {unit.type}
        </span>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: tokens.text5 }}>
          {tierLabel(unit.tier)}
        </span>
        {due && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: 'uppercase',
              padding: '3px 8px',
              borderRadius: 4,
              background: tokens.ink,
              color: '#F7F6F2',
            }}
          >
            Due
          </span>
        )}
        <div style={{ flex: 1 }} />
        <span
          onClick={() => actions.onBookmark(unit.id)}
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.6,
            cursor: 'pointer',
            color: bookmarked ? tokens.success : tokens.text5,
          }}
        >
          {bookmarked ? 'Saved ✓' : 'Save'}
        </span>
      </div>

      <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.2, color: tokens.ink, lineHeight: 1.25 }}>
        {unit.title}
      </div>

      <RevealBlock unit={unit} collColor={collColor} actions={actions} />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          borderTop: `1px solid ${tokens.hairlineSoft}`,
          paddingTop: 9,
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: 50, background: collColor }} />
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: collColor }}>
          {collection?.title ?? unit.collection}
        </span>
      </div>
    </div>
  );
}
