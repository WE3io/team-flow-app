'use client';
import { box, interval } from '@/lib/scheduler';
import { buttonReset, tokens } from '@/lib/theme';
import type { Unit } from '@/lib/types';
import Markdown from './Markdown';
import type { UnitActions } from './UnitActions';

/**
 * The heart of the app: question-first / tap-to-reveal (handoff §6a).
 * Hidden state shows the prompt (or hook) + a collection-coloured reveal pill;
 * revealing exposes the answer/body/carousel/reel and the retrieval grade
 * buttons that drive the Leitner scheduler. Shared by feed, sheet, and viewer.
 */
export default function RevealBlock({
  unit,
  collColor,
  actions,
  size = 'md',
}: {
  unit: Unit;
  collColor: string;
  actions: UnitActions;
  size?: 'md' | 'lg';
}) {
  const revealed = !!actions.revealed[unit.id];
  const graded = actions.progress.graded[unit.id];
  const hasPrompt = !!unit.prompt;
  const promptSize = size === 'lg' ? 16 : 15;
  const lineH = size === 'lg' ? 1.45 : 1.4;

  if (!revealed) {
    return (
      <button
        type="button"
        onClick={() => actions.onReveal(unit.id)}
        style={{
          ...buttonReset,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          width: '100%',
          textAlign: 'left',
          flex: size === 'lg' ? 1 : undefined,
        }}
      >
        {hasPrompt ? (
          <>
            <div
              style={{
                fontSize: promptSize,
                fontWeight: 600,
                color: tokens.ink,
                lineHeight: lineH,
              }}
            >
              {unit.prompt}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: tokens.text3,
                fontStyle: 'italic',
              }}
            >
              Think of your answer first.
            </div>
          </>
        ) : (
          <div
            style={{
              fontSize: promptSize,
              fontWeight: 600,
              color: tokens.text2,
              lineHeight: lineH,
            }}
          >
            {unit.hook}
          </div>
        )}
        <div
          style={{
            background: collColor,
            borderRadius: 999,
            padding: size === 'lg' ? 14 : 13,
            textAlign: 'center',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            color: '#FFFFFF',
            marginTop: size === 'lg' ? 'auto' : undefined,
          }}
        >
          Tap to reveal
        </div>
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {hasPrompt && unit.answer && (
        <div
          style={{
            padding: '10px 14px',
            background: tokens.successBg,
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            color: tokens.successInk,
            lineHeight: 1.4,
          }}
        >
          <Markdown>{unit.answer}</Markdown>
        </div>
      )}

      {unit.format === 'carousel' ? (
        <>
          {unit.body && (
            <Markdown style={{ fontSize: 14, color: tokens.text2, lineHeight: 1.55 }}>{unit.body}</Markdown>
          )}
          <Carousel unit={unit} actions={actions} />
        </>
      ) : unit.format === 'reel' ? (
        <>
          <ReelPlaceholder text={unit.visual || 'Reel storyboard'} />
          {unit.body && (
            <Markdown style={{ fontSize: 14, color: tokens.text2, lineHeight: 1.55 }}>{unit.body}</Markdown>
          )}
        </>
      ) : (
        unit.body && (
          <Markdown style={{ fontSize: 14, color: tokens.text2, lineHeight: 1.55 }}>{unit.body}</Markdown>
        )
      )}

      {!graded ? (
        <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
          <button type="button" onClick={() => actions.onGrade(unit.id, 'again')} style={gradeBtn(false)}>
            Not yet
          </button>
          <button type="button" onClick={() => actions.onGrade(unit.id, 'good')} style={gradeBtn(true)}>
            Got it
          </button>
        </div>
      ) : (
        <div style={{ fontSize: 11, fontWeight: 700, color: tokens.text3 }}>{boxStatus(unit, actions)}</div>
      )}
    </div>
  );
}

function boxStatus(unit: Unit, actions: UnitActions): string {
  const g = actions.progress.graded[unit.id];
  const b = box(actions.progress, unit.id);
  // lastSeen is a real day-index now (epoch days) — phrase the return as a
  // relative wait, not an absolute day number.
  const inDays = (n: number) => (n <= 1 ? 'tomorrow' : `in ${n} days`);
  if (g === 'good') return `Got it · Box ${b} · resurfaces ${inDays(interval(b))}`;
  if (g === 'again') return `Back to Box 1 · resurfaces ${inDays(1)}`;
  return '';
}

function gradeBtn(good: boolean): React.CSSProperties {
  return {
    flex: 1,
    textAlign: 'center',
    padding: 11,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0.4,
    cursor: 'pointer',
    fontFamily: 'inherit',
    color: good ? '#FFFFFF' : tokens.text2,
    background: good ? tokens.success : 'transparent',
    border: good ? 'none' : '1.5px solid #D8D3C4',
  };
}

function Carousel({ unit, actions }: { unit: Unit; actions: UnitActions }) {
  const slides = unit.carousel ?? [];
  const len = slides.length;
  const idx = Math.min(actions.slides[unit.id] ?? 0, Math.max(0, len - 1));
  const slide = slides[idx];
  if (!slide) return null;
  return (
    <div
      style={{
        border: `1px solid ${tokens.hairline}`,
        borderRadius: 12,
        padding: 14,
        background: '#FBFAF7',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {slide.heading && (
        <div style={{ fontSize: 14, fontWeight: 800, color: tokens.ink }}>{slide.heading}</div>
      )}
      <div style={{ fontSize: 13, color: tokens.text2, lineHeight: 1.5 }}>
        <Markdown>{slide.body}</Markdown>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 6,
        }}
      >
        <button
          type="button"
          onClick={() => actions.onSlide(unit.id, -1, len)}
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 0.6,
            color: tokens.text3,
            cursor: 'pointer',
            padding: '6px 10px',
            border: '1px solid #E6E3DA',
            borderRadius: 999,
            background: '#FFFFFF',
            fontFamily: 'inherit',
          }}
        >
          ← Prev
        </button>
        <span style={{ fontSize: 11, fontWeight: 700, color: tokens.text5 }}>
          {idx + 1} / {len}
        </span>
        <button
          type="button"
          onClick={() => actions.onSlide(unit.id, 1, len)}
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 0.6,
            color: tokens.ink,
            cursor: 'pointer',
            padding: '6px 10px',
            border: `1px solid ${tokens.ink}`,
            borderRadius: 999,
            background: '#FFFFFF',
            fontFamily: 'inherit',
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

function ReelPlaceholder({ text }: { text: string }) {
  return (
    <div
      style={{
        borderRadius: 12,
        border: `1px solid ${tokens.hairline}`,
        minHeight: 160,
        background: 'repeating-linear-gradient(45deg, #EFEDE6, #EFEDE6 8px, #E6E3DA 8px, #E6E3DA 16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
      <span
        style={{
          fontFamily: 'ui-monospace, monospace',
          fontSize: 11,
          color: tokens.text3,
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        ▶ {text}
      </span>
    </div>
  );
}
