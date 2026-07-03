'use client';
import { tokens } from '@/lib/theme';

/**
 * Canvas-rendered share card (handoff §Slice C): collection donuts + mastered
 * count + streak, drawn client-side so it works local-first (no server, no
 * public profile). 1080×1350 (4:5) — shares cleanly to most surfaces.
 */

export interface ShareCollection {
  letter: string;
  color: string;
  pct: number; // 0..100 covered
}

export interface ShareCardData {
  displayName: string;
  day: number;
  mastered: number;
  covered: number;
  total: number;
  /** null until slice D lands streaks */
  streak: number | null;
  collections: ShareCollection[];
}

const W = 1080;
const H = 1350;
const PAD = 84;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}

export async function renderShareCard(data: ShareCardData): Promise<Blob> {
  if (typeof document !== 'undefined' && document.fonts?.ready) await document.fonts.ready;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas-2d-unavailable');
  const font = (spec: string) => `${spec} Archivo, system-ui, sans-serif`;

  // Canvas background + hairline frame.
  ctx.fillStyle = tokens.canvas;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = tokens.hairline;
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  // Header: wordmark + yellow day sticker (the one playful wink).
  ctx.fillStyle = tokens.ink;
  ctx.font = font('900 46px');
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Team Flow', PAD, PAD + 46);

  const dayLabel = `DAY ${data.day}`;
  ctx.font = font('800 30px');
  const dw = ctx.measureText(dayLabel).width + 56;
  ctx.fillStyle = tokens.sticker;
  roundRect(ctx, W - PAD - dw, PAD - 8, dw, 62, 31);
  ctx.fill();
  ctx.fillStyle = tokens.ink;
  ctx.fillText(dayLabel, W - PAD - dw + 28, PAD + 35);

  // Name (shrink to fit one line).
  let nameSize = 88;
  ctx.font = font(`900 ${nameSize}px`);
  while (ctx.measureText(data.displayName).width > W - PAD * 2 && nameSize > 40) {
    nameSize -= 4;
    ctx.font = font(`900 ${nameSize}px`);
  }
  ctx.fillStyle = tokens.ink;
  ctx.fillText(data.displayName, PAD, 300);
  ctx.font = font('600 30px');
  ctx.fillStyle = tokens.text3;
  ctx.fillText('learning the team workflow', PAD, 352);

  // Stat tiles: mastered / covered / streak.
  const tiles: { big: string; label: string; accent?: string }[] = [
    { big: String(data.mastered), label: 'MASTERED', accent: tokens.success },
    { big: `${data.covered}/${data.total}`, label: 'COVERED' },
    { big: data.streak === null ? '—' : `${data.streak}d`, label: 'STREAK' },
  ];
  const tileW = (W - PAD * 2 - 48) / 3;
  tiles.forEach((t, i) => {
    const x = PAD + i * (tileW + 24);
    const y = 430;
    ctx.fillStyle = tokens.surface;
    roundRect(ctx, x, y, tileW, 220, 24);
    ctx.fill();
    ctx.strokeStyle = tokens.hairline;
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, tileW, 220, 24);
    ctx.stroke();
    ctx.fillStyle = t.accent ?? tokens.ink;
    ctx.font = font('900 84px');
    ctx.fillText(t.big, x + 32, y + 122);
    ctx.fillStyle = tokens.text4;
    ctx.font = font('800 24px');
    ctx.fillText(t.label, x + 32, y + 176);
  });

  // Collection donuts, up to two rows of five.
  const cols = data.collections.slice(0, 10);
  const perRow = Math.min(5, cols.length);
  const cellW = (W - PAD * 2) / perRow;
  const r = 62;
  cols.forEach((c, i) => {
    const row = Math.floor(i / perRow);
    const cx = PAD + (i % perRow) * cellW + cellW / 2;
    const cy = 810 + row * 230;
    // track
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = tokens.progressTrack;
    ctx.lineWidth = 16;
    ctx.stroke();
    // progress arc (from 12 o'clock)
    if (c.pct > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * c.pct) / 100);
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.lineCap = 'butt';
    }
    ctx.fillStyle = c.color;
    ctx.font = font('900 44px');
    ctx.textAlign = 'center';
    ctx.fillText(c.letter, cx, cy + 16);
    ctx.fillStyle = tokens.text3;
    ctx.font = font('700 24px');
    ctx.fillText(`${c.pct}%`, cx, cy + r + 42);
    ctx.textAlign = 'left';
  });

  // Footer.
  ctx.fillStyle = tokens.text5;
  ctx.font = font('600 24px');
  ctx.fillText('Git · trunk-based · AI-assisted — one card a day', PAD, H - PAD + 10);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas-export-failed'))), 'image/png');
  });
}

/** Share via the Web Share API when possible, otherwise download. */
export async function shareOrDownload(blob: Blob, filename: string): Promise<'shared' | 'downloaded'> {
  const file = new File([blob], filename, { type: 'image/png' });
  if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Team Flow progress' });
      return 'shared';
    } catch {
      // fall through to download (user may have cancelled — harmless)
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5_000);
  return 'downloaded';
}
