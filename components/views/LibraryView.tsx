'use client';
import { filterLibrary } from '@/lib/query';
import { buttonReset, tierLabel, tokens, typeStyle } from '@/lib/theme';
import type { Unit } from '@/lib/types';

const TIER_CHIPS: [string, string][] = [
  ['all', 'All roles'],
  ['admin', 'Admin'],
  ['product-design', 'Product/Design'],
  ['engineer', 'Engineer'],
];
const TYPE_CHIPS: [string, string][] = [
  ['all', 'All types'],
  ['concept', 'Concept'],
  ['procedure', 'Procedure'],
  ['runbook', 'Runbook'],
  ['guardrail', 'Guardrail'],
  ['antipattern', 'Anti-pattern'],
];

function Chip({ label, active, onTap }: { label: string; active: boolean; onTap: () => void }) {
  return (
    <button
      type="button"
      onClick={onTap}
      aria-pressed={active}
      style={{
        ...buttonReset,
        fontSize: 11,
        fontWeight: 700,
        padding: '6px 12px',
        borderRadius: 999,
        border: `1px solid ${active ? tokens.ink : '#D8D3C4'}`,
        background: active ? tokens.ink : '#FFFFFF',
        color: active ? '#F7F6F2' : tokens.text2,
      }}
    >
      {label}
    </button>
  );
}

export default function LibraryView({
  units,
  tierFilter,
  typeFilter,
  onTier,
  onType,
  openDetail,
}: {
  units: Unit[];
  tierFilter: string;
  typeFilter: string;
  onTier: (t: string) => void;
  onType: (t: string) => void;
  openDetail: (id: string) => void;
}) {
  const tiles = filterLibrary(units, tierFilter, typeFilter);

  return (
    <div style={{ padding: '8px 18px 24px' }}>
      <div
        style={{
          fontSize: 24,
          fontWeight: 900,
          letterSpacing: -0.5,
          color: tokens.ink,
          padding: '8px 0 12px',
        }}
      >
        Library
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {TIER_CHIPS.map(([k, l]) => (
          <Chip key={k} label={l} active={tierFilter === k} onTap={() => onTier(k)} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {TYPE_CHIPS.map(([k, l]) => (
          <Chip key={k} label={l} active={typeFilter === k} onTap={() => onType(k)} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {tiles.map((u) => {
          const ts = typeStyle(u.type);
          return (
            <button
              type="button"
              key={u.id}
              onClick={() => openDetail(u.id)}
              style={{
                ...buttonReset,
                background: '#FFFFFF',
                border: `1px solid ${tokens.hairline}`,
                borderRadius: 14,
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minHeight: 84,
                textAlign: 'left',
                boxShadow: '0 1px 2px rgba(22,21,15,0.04)',
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: ts.color,
                }}
              >
                {u.type}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: tokens.ink,
                  lineHeight: 1.3,
                }}
              >
                {u.title}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: tokens.text6,
                  marginTop: 'auto',
                }}
              >
                L{u.level} · {tierLabel(u.tier)}
              </span>
            </button>
          );
        })}
        {tiles.length === 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '24px 0',
              fontSize: 13,
              color: tokens.text5,
            }}
          >
            No units match these filters.
          </div>
        )}
      </div>
    </div>
  );
}
