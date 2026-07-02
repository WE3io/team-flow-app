'use client';
import { useState } from 'react';
import { tokens } from '@/lib/theme';

/**
 * Phase-1 demo control for the spacing scheduler (handoff §6b). In Phase 2 the
 * simulated day is replaced by real elapsed time + persistence; here it lets a
 * reviewer advance "time" and watch the Leitner due queue resurface cards.
 */
export default function SchedulerDemo({
  simDay,
  onSimDay,
  showDueBanner,
  onShowDueBanner,
  noviceOrdering,
  onNoviceOrdering,
}: {
  simDay: number;
  onSimDay: (v: number) => void;
  showDueBanner: boolean;
  onShowDueBanner: (v: boolean) => void;
  noviceOrdering: boolean;
  onNoviceOrdering: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ margin: '2px 18px 0' }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: tokens.text4,
          cursor: 'pointer',
          padding: '6px 0',
        }}
      >
        <span>⚙ Scheduler demo</span>
        <span style={{ color: tokens.text6 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div
          style={{
            border: `1px solid ${tokens.hairline}`,
            borderRadius: 14,
            padding: 14,
            background: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: tokens.ink }}>Simulated day</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: tokens.success }}>Day {simDay}</span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              step={1}
              value={simDay}
              onChange={(e) => onSimDay(Number(e.target.value))}
              style={{ width: '100%', accentColor: tokens.success }}
            />
            <span style={{ fontSize: 11, color: tokens.text3, lineHeight: 1.4 }}>
              Grade a card “Got it / Not yet”, then drag to a later day to see it resurface via the daily-review banner.
            </span>
          </div>

          <Toggle label="Daily-review banner" value={showDueBanner} onChange={onShowDueBanner} />
          <Toggle
            label="Novice ordering"
            hint="Serve Start Here in order to brand-new users before interleaving"
            value={noviceOrdering}
            onChange={onNoviceOrdering}
          />
        </div>
      )}
    </div>
  );
}

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: tokens.ink }}>{label}</span>
        {hint && <span style={{ fontSize: 11, color: tokens.text3, lineHeight: 1.35 }}>{hint}</span>}
      </div>
      <button
        onClick={() => onChange(!value)}
        aria-pressed={value}
        style={{
          flex: '0 0 auto',
          width: 42,
          height: 24,
          borderRadius: 999,
          border: 'none',
          cursor: 'pointer',
          background: value ? tokens.success : '#D8D3C4',
          position: 'relative',
          transition: 'background 120ms',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: value ? 21 : 3,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#FFFFFF',
            transition: 'left 120ms',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          }}
        />
      </button>
    </div>
  );
}
