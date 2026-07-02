'use client';
import { tokens } from '@/lib/theme';

export type TabKey = 'feed' | 'path' | 'search' | 'saved' | 'library';

const NAV: { key: TabKey; label: string }[] = [
  { key: 'feed', label: 'FEED' },
  { key: 'path', label: 'PATH' },
  { key: 'search', label: 'SEARCH' },
  { key: 'saved', label: 'SAVED' },
  { key: 'library', label: 'ALL' },
];

export default function BottomNav({ tab, onTab }: { tab: TabKey; onTab: (t: TabKey) => void }) {
  return (
    <div
      style={{
        display: 'flex',
        borderTop: `1px solid ${tokens.hairline}`,
        background: '#FFFFFF',
        padding: '10px 8px 6px',
        flex: '0 0 auto',
      }}
    >
      {NAV.map((n) => {
        const active = tab === n.key;
        return (
          <div
            key={n.key}
            onClick={() => onTab(n.key)}
            style={{
              flex: 1,
              textAlign: 'center',
              cursor: 'pointer',
              padding: '6px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1.2,
                color: active ? '#F7F6F2' : tokens.text5,
                background: active ? tokens.ink : 'transparent',
                padding: '7px 12px',
                borderRadius: 999,
              }}
            >
              {n.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
