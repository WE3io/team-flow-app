import type { Grade, Progress } from '@/lib/scheduler';

/** The bundle of per-unit interaction state + handlers threaded to card views. */
export interface UnitActions {
  revealed: Record<string, boolean>;
  slides: Record<string, number>;
  bookmarks: Record<string, boolean>;
  progress: Progress;
  onReveal: (id: string) => void;
  onGrade: (id: string, g: Grade) => void;
  onSlide: (id: string, dir: -1 | 1, len: number) => void;
  onBookmark: (id: string) => void;
  openDetail: (id: string) => void;
}
