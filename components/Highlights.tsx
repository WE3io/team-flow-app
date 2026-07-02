'use client';
import type { Unit, Collection } from '@/lib/types';
import { tokens } from '@/lib/theme';
import { seen, type Progress } from '@/lib/scheduler';

/**
 * Collections as Instagram-style Highlights (handoff §5). The ring is a real
 * progress donut — it fills as you cover the collection ("loud progress").
 */
export default function Highlights({
  collections,
  units,
  progress,
  onOpen,
}: {
  collections: Collection[];
  units: Unit[];
  progress: Progress;
  onOpen: (collection: Collection) => void;
}) {
  return (
    <div
      className="no-scrollbar"
      style={{
        display: 'flex',
        gap: 14,
        overflowX: 'auto',
        padding: '4px 18px 14px',
        borderBottom: `1px solid #E6E3DA`,
      }}
    >
      {collections.map((c) => {
        const us = units.filter((u) => u.collection === c.id);
        const covered = us.filter((u) => seen(progress, u.id)).length;
        const pct = Math.round((covered / Math.max(1, us.length)) * 100);
        return (
          <div
            key={c.id}
            onClick={() => onOpen(c)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              flex: '0 0 auto',
              width: 68,
            }}
          >
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: '50%',
                background: `conic-gradient(${c.color} ${pct}%, ${tokens.progressTrack} 0)`,
                padding: 4,
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: c.color + '1A',
                  border: '2px solid #FFFFFF',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 900, color: c.color }}>{c.letter}</span>
              </div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, color: tokens.text2, textAlign: 'center', lineHeight: 1.2 }}>
              {c.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
