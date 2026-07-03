'use client';
import type { Progress } from '@/lib/scheduler';
import { tokens } from '@/lib/theme';
import type { Collection, Unit } from '@/lib/types';
import DueBanner from '../DueBanner';
import FeedCard from '../FeedCard';
import Highlights from '../Highlights';
import SchedulerDemo, { type SchedulerDemoProps } from '../SchedulerDemo';
import type { UnitActions } from '../UnitActions';

export default function FeedView({
  units,
  collections,
  feedItems,
  actions,
  progress,
  today,
  dueCount,
  bannerVisible,
  onOpenDue,
  onOpenHighlight,
  demo,
}: {
  units: Unit[];
  collections: Collection[];
  feedItems: Unit[];
  actions: UnitActions;
  progress: Progress;
  today: number;
  dueCount: number;
  bannerVisible: boolean;
  onOpenDue: () => void;
  onOpenHighlight: (c: Collection) => void;
  demo: SchedulerDemoProps | null;
}) {
  const byId = new Map(collections.map((c) => [c.id, c]));
  const dayLabel = dueCount ? `${dueCount} due` : 'Up to date';

  return (
    <div style={{ padding: '4px 0 24px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          padding: '8px 18px 10px',
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: -0.8,
            color: tokens.ink,
          }}
        >
          Team Flow
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 0.6,
            color: tokens.ink,
            background: tokens.sticker,
            padding: '5px 12px',
            borderRadius: 999,
          }}
        >
          {dayLabel}
        </div>
      </div>

      <Highlights collections={collections} units={units} progress={progress} onOpen={onOpenHighlight} />

      {demo && <SchedulerDemo {...demo} />}

      {bannerVisible && <DueBanner count={dueCount} onOpen={onOpenDue} />}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          padding: '14px 18px 0',
        }}
      >
        {feedItems.map((u) => (
          <FeedCard key={u.id} unit={u} collection={byId.get(u.collection)} actions={actions} today={today} />
        ))}
      </div>
    </div>
  );
}
