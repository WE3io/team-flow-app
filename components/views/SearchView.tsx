'use client';
import { runbookUnits, searchUnits } from '@/lib/query';
import { buttonReset, tokens, typeStyle } from '@/lib/theme';
import type { Unit } from '@/lib/types';

export default function SearchView({
  units,
  query,
  onQuery,
  openDetail,
}: {
  units: Unit[];
  query: string;
  onQuery: (v: string) => void;
  openDetail: (id: string) => void;
}) {
  const q = query.trim();
  const results = searchUnits(units, query);
  const runbooks = runbookUnits(units);

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
        Search
      </div>
      <input
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="Try: merge conflict, undo, pipeline…"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '13px 14px',
          borderRadius: 12,
          border: '1.5px solid #D8D3C4',
          background: '#FFFFFF',
          fontSize: 15,
          fontFamily: 'inherit',
          color: tokens.ink,
          outline: 'none',
        }}
      />

      {q.length === 0 ? (
        <div style={{ marginTop: 18 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              color: tokens.runbook,
              marginBottom: 10,
            }}
          >
            Git just broke? Start here
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {runbooks.map((u) => (
              <button
                type="button"
                key={u.id}
                onClick={() => openDetail(u.id)}
                style={{
                  ...buttonReset,
                  padding: '13px 14px',
                  borderRadius: 12,
                  border: `1.5px solid ${tokens.runbookBorder}`,
                  background: tokens.runbookBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: tokens.ink }}>{u.title}</span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: tokens.runbook,
                  }}
                >
                  Runbook
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginTop: 16,
          }}
        >
          {results.map((u) => {
            const ts = typeStyle(u.type);
            const rb = u.type === 'runbook';
            return (
              <button
                type="button"
                key={u.id}
                onClick={() => openDetail(u.id)}
                style={{
                  ...buttonReset,
                  padding: '13px 14px',
                  borderRadius: 12,
                  border: `1px solid ${rb ? tokens.runbookBorder : tokens.hairline}`,
                  background: rb ? tokens.runbookBg : '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 700, color: tokens.ink }}>{u.title}</span>
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
                </div>
                <span style={{ fontSize: 12, color: tokens.text3 }}>{u.hook}</span>
              </button>
            );
          })}
          {results.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '24px 0',
                fontSize: 13,
                color: tokens.text5,
              }}
            >
              No units match.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
