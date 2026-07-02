import type { UnitType, Tier } from './types';

/**
 * Design tokens — "quiet tool, loud progress". Calm hairline surfaces, colour
 * reserved for progress + collection/type accents. Mirrors the final prototype.
 */
export const tokens = {
  ink: '#16150F',
  canvas: '#F6F1E4',
  surface: '#FFFFFF',
  sheet: '#F7F6F2',
  hairline: '#E8E4D8',
  hairlineSoft: '#F0EEE7',
  // text ramp (dark → faint)
  text: '#16150F',
  text2: '#4A483F',
  text3: '#6E6B60',
  text4: '#8B887B',
  text5: '#9B988B',
  text6: '#B0AD9F',
  // accents
  sticker: '#FFD23F',
  success: '#12A15E',
  successInk: '#0C6B41',
  successBg: '#E4F5EC',
  glow: '#35D07F',
  runbook: '#B4472E',
  runbookBg: '#FCEBE7',
  runbookBorder: '#F0CFC5',
  progressTrack: '#E3DFD2',
} as const;

export interface TypeStyle {
  color: string;
  bg: string;
}

const TYPE_STYLE: Record<UnitType, TypeStyle> = {
  concept: { color: '#3D6FDB', bg: '#E8EEFB' },
  procedure: { color: '#0F7B8F', bg: '#E2F2F5' },
  guardrail: { color: '#C2410C', bg: '#FBEBE2' },
  antipattern: { color: '#B91C1C', bg: '#FBE7E7' },
  runbook: { color: '#DE4E33', bg: '#FCEBE7' },
  decision: { color: '#A16207', bg: '#F8F0DC' },
  glossary: { color: '#6D28D9', bg: '#F0EAFB' },
  culture: { color: '#12A15E', bg: '#E4F5EC' },
};

export function typeStyle(type: UnitType): TypeStyle {
  return TYPE_STYLE[type] ?? TYPE_STYLE.concept;
}

const TIER_LABEL: Record<Tier, string> = {
  all: 'All roles',
  admin: 'Admin',
  'product-design': 'Product/Design',
  engineer: 'Engineer',
};

export function tierLabel(t: Tier): string {
  return TIER_LABEL[t] ?? t;
}
