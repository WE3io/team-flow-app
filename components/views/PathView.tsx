'use client';
import { isStepDone, type Progress, pathUnits } from '@/lib/scheduler';
import { buttonReset, tierLabel, tokens } from '@/lib/theme';
import type { Unit } from '@/lib/types';

/**
 * Directed path (handoff §9.1) as a stepper timeline — done / up-next /
 * pending. Green completed line, "Up next" pill, dimmed pending steps.
 */
export default function PathView({
  units,
  progress,
  revealed,
  openDetail,
}: {
  units: Unit[];
  progress: Progress;
  revealed: Record<string, boolean>;
  openDetail: (id: string) => void;
}) {
  const steps = pathUnits(units);
  const doneCount = steps.filter((u) => isStepDone(u, progress, revealed)).length;
  const pct = Math.round((doneCount / Math.max(1, steps.length)) * 100);
  const firstUndone = steps.findIndex((u) => !isStepDone(u, progress, revealed));

  return (
    <div style={{ padding: '8px 18px 24px' }}>
      <div
        style={{
          fontSize: 24,
          fontWeight: 900,
          letterSpacing: -0.5,
          color: tokens.ink,
          padding: '8px 0 2px',
        }}
      >
        Your path
      </div>
      <div style={{ fontSize: 13, color: tokens.text3, marginBottom: 6 }}>Start Here → The Everyday Flow</div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 0.6,
          color: tokens.success,
          marginBottom: 8,
        }}
      >
        {doneCount} of {steps.length} complete
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: tokens.progressTrack,
          marginBottom: 16,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: 999,
            background: tokens.success,
            width: `${pct}%`,
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {steps.map((u, i) => {
          const done = isStepDone(u, progress, revealed);
          const upNext = !done && firstUndone === i;
          const isLastStep = i === steps.length - 1;
          return (
            <button
              type="button"
              key={u.id}
              onClick={() => openDetail(u.id)}
              style={{
                ...buttonReset,
                display: 'flex',
                alignItems: 'stretch',
                gap: 12,
                width: '100%',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: 30,
                  flex: '0 0 auto',
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 800,
                    border: `2px solid ${done ? tokens.success : upNext ? tokens.ink : '#D8D3C4'}`,
                    background: done ? tokens.success : '#FFFFFF',
                    color: done ? '#FFFFFF' : upNext ? tokens.ink : tokens.text6,
                  }}
                >
                  {done ? '✓' : String(i + 1)}
                </div>
                <div
                  style={{
                    flex: 1,
                    width: 2,
                    borderRadius: 1,
                    background: isLastStep ? 'transparent' : done ? tokens.success : tokens.progressTrack,
                    marginTop: 3,
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 3,
                  minWidth: 0,
                  padding: '4px 0 20px',
                }}
              >
                {upNext && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      background: tokens.ink,
                      color: '#F7F6F2',
                      padding: '3px 8px',
                      borderRadius: 999,
                    }}
                  >
                    Up next
                  </span>
                )}
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: done || upNext ? tokens.ink : tokens.text4,
                  }}
                >
                  {u.title}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    color: tokens.text5,
                  }}
                >
                  {u.type} · level {u.level} · {tierLabel(u.tier)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
