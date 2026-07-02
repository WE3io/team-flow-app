'use client';
import type { Unit, Collection } from '@/lib/types';
import { tokens, typeStyle, tierLabel } from '@/lib/theme';
import RevealBlock from './RevealBlock';
import type { UnitActions } from './UnitActions';

export default function DetailSheet({
  unit,
  collection,
  actions,
  onClose,
}: {
  unit: Unit;
  collection?: Collection;
  actions: UnitActions;
  onClose: () => void;
}) {
  const ts = typeStyle(unit.type);
  const collColor = collection?.color ?? tokens.ink;
  const bookmarked = !!actions.bookmarks[unit.id];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(22,21,15,0.5)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        zIndex: 40,
      }}
    >
      <div onClick={onClose} style={{ flex: 1 }} />
      <div
        className="no-scrollbar"
        style={{
          background: tokens.sheet,
          borderRadius: '20px 20px 0 0',
          padding: '18px 18px 26px',
          maxHeight: '78%',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
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
          <span onClick={onClose} style={{ fontSize: 12, fontWeight: 800, color: tokens.text3, cursor: 'pointer', padding: '6px 10px' }}>
            Close ✕
          </span>
        </div>

        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.3, color: tokens.ink, lineHeight: 1.2, marginBottom: 8 }}>
          {unit.title}
        </div>

        <RevealBlock unit={unit} collColor={collColor} actions={actions} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 16,
            borderTop: `1px solid #E6E3DA`,
            paddingTop: 12,
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: tokens.text6 }}>
            {collection?.title ?? unit.collection} · {tierLabel(unit.tier)}
          </span>
          <span
            onClick={() => actions.onBookmark(unit.id)}
            style={{ fontSize: 11, fontWeight: 800, cursor: 'pointer', color: bookmarked ? tokens.success : tokens.text5 }}
          >
            {bookmarked ? 'Saved ✓' : 'Save'}
          </span>
        </div>
      </div>
    </div>
  );
}
