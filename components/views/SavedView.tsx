'use client';
import { tokens } from '@/lib/theme';
import type { Unit } from '@/lib/types';

export default function SavedView({
  units,
  bookmarks,
  openDetail,
}: {
  units: Unit[];
  bookmarks: Record<string, boolean>;
  openDetail: (id: string) => void;
}) {
  const saved = units.filter((u) => bookmarks[u.id]);

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
        Saved
      </div>
      {saved.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            fontSize: 13,
            color: tokens.text5,
            lineHeight: 1.5,
          }}
        >
          Nothing saved yet. Tap “Save” on any card to keep it here.
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {saved.map((u) => (
          <div
            key={u.id}
            onClick={() => openDetail(u.id)}
            style={{
              padding: '13px 14px',
              borderRadius: 12,
              border: `1px solid ${tokens.hairline}`,
              background: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
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
                  color: tokens.text5,
                }}
              >
                {u.type}
              </span>
            </div>
            <span style={{ fontSize: 12, color: tokens.text3 }}>{u.hook}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
