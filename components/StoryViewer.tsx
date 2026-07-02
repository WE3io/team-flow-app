'use client';
import type { Unit, Collection } from '@/lib/types';
import { tokens, typeStyle } from '@/lib/theme';
import { isDue } from '@/lib/scheduler';
import RevealBlock from './RevealBlock';
import type { UnitActions } from './UnitActions';

export interface ViewerState {
  ids: string[];
  i: number;
  title: string;
}

/**
 * Story / Highlight viewer — full-screen dark instrument surface with segment
 * progress bars (handoff §5 format: story). Also hosts the daily due queue.
 */
export default function StoryViewer({
  viewer,
  unit,
  collection,
  actions,
  simDay,
  onPrev,
  onNext,
  onClose,
}: {
  viewer: ViewerState;
  unit: Unit;
  collection?: Collection;
  actions: UnitActions;
  simDay: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const ts = typeStyle(unit.type);
  const collColor = collection?.color ?? tokens.ink;
  const due = isDue(actions.progress, unit.id, simDay);
  const isLast = viewer.i >= viewer.ids.length - 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: tokens.ink, zIndex: 50, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 4, padding: '12px 14px 8px' }}>
        {viewer.ids.map((_, i) => (
          <span
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: i < viewer.i ? '#F7F6F2' : i === viewer.i ? '#B8B5A8' : 'rgba(247,246,242,0.25)',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 16px 10px' }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#F7F6F2', letterSpacing: 0.4 }}>{viewer.title}</span>
        <span onClick={onClose} style={{ fontSize: 13, fontWeight: 800, color: '#B8B5A8', cursor: 'pointer', padding: 6 }}>
          ✕
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0, padding: '4px 16px 16px', display: 'flex', flexDirection: 'column' }}>
        <div
          className="no-scrollbar"
          style={{
            flex: 1,
            background: tokens.sheet,
            borderRadius: 18,
            padding: '20px 18px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
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
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.3, color: tokens.ink, lineHeight: 1.2 }}>
            {unit.title}
          </div>
          <RevealBlock unit={unit} collColor={collColor} actions={actions} size="lg" />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button
            onClick={onPrev}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: 12,
              borderRadius: 12,
              border: '1px solid #4A483F',
              fontSize: 12,
              fontWeight: 800,
              color: '#B8B5A8',
              cursor: 'pointer',
              background: 'transparent',
              fontFamily: 'inherit',
            }}
          >
            ← Back
          </button>
          <button
            onClick={onNext}
            style={{
              flex: 2,
              textAlign: 'center',
              padding: 12,
              borderRadius: 12,
              background: tokens.glow,
              fontSize: 12,
              fontWeight: 800,
              color: tokens.ink,
              cursor: 'pointer',
              border: 'none',
              fontFamily: 'inherit',
            }}
          >
            {isLast ? 'Done' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
