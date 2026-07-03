'use client';
import { useState } from 'react';
import { buttonReset, tokens } from '@/lib/theme';

export interface SchedulerDemoProps {
  demoOffset: number;
  onDemoOffset: (v: number) => void;
  showDueBanner: boolean;
  onShowDueBanner: (v: boolean) => void;
  noviceOrdering: boolean;
  onNoviceOrdering: (v: boolean) => void;
}

/**
 * Demo control for the spacing scheduler (handoff §6b / §Slice B). Scheduling
 * now runs on real dates; this offsets "today" forward *client-side only* so a
 * reviewer can watch the Leitner due queue resurface cards without waiting days.
 * Gated behind NEXT_PUBLIC_SCHEDULER_DEMO=1, so it never ships to production.
 */
export default function SchedulerDemo({
  demoOffset,
  onDemoOffset,
  showDueBanner,
  onShowDueBanner,
  noviceOrdering,
  onNoviceOrdering,
}: SchedulerDemoProps) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ margin: '2px 18px 0' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          ...buttonReset,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: tokens.text4,
          padding: '6px 0',
        }}
      >
        <span>⚙ Scheduler demo</span>
        <span style={{ color: tokens.text6 }}>{open ? '▲' : '▼'}</span>
      </button>

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
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: tokens.ink }}>Jump ahead</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: tokens.success }}>
                {demoOffset === 0 ? 'Today' : `Today +${demoOffset}d`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              step={1}
              value={demoOffset}
              onChange={(e) => onDemoOffset(Number(e.target.value))}
              style={{ width: '100%', accentColor: tokens.success }}
            />
            <span style={{ fontSize: 11, color: tokens.text3, lineHeight: 1.4 }}>
              Grade a card “Got it / Not yet”, then jump ahead to see it resurface via the daily-review
              banner. Offsets the view only — real dates are still stored.
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
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          minWidth: 0,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: tokens.ink }}>{label}</span>
        {hint && <span style={{ fontSize: 11, color: tokens.text3, lineHeight: 1.35 }}>{hint}</span>}
      </div>
      <button
        type="button"
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
