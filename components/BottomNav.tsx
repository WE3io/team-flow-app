'use client';
import { buttonReset, tokens } from '@/lib/theme';

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
        // Bottom safe-area padding: the phone frame used to provide this gap.
        padding: '10px 8px calc(6px + env(safe-area-inset-bottom, 0px))',
        flex: '0 0 auto',
      }}
    >
      {NAV.map((n) => {
        const active = tab === n.key;
        return (
          <button
            type="button"
            key={n.key}
            onClick={() => onTab(n.key)}
            aria-current={active ? 'page' : undefined}
            style={{
              ...buttonReset,
              flex: 1,
              textAlign: 'center',
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
          </button>
        );
      })}
    </div>
  );
}
