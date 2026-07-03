'use client';
import type { Progress } from '@/lib/scheduler';
import { buttonReset, tokens } from '@/lib/theme';
import type { Collection, Unit } from '@/lib/types';
import DueBanner from '../DueBanner';
import FeedCard from '../FeedCard';
import Highlights from '../Highlights';
import { initials } from '../ProfilePanel';
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
  displayName,
  onOpenDue,
  onOpenHighlight,
  onOpenProfile,
}: {
  units: Unit[];
  collections: Collection[];
  feedItems: Unit[];
  actions: UnitActions;
  progress: Progress;
  today: number;
  dueCount: number;
  bannerVisible: boolean;
  displayName: string;
  onOpenDue: () => void;
  onOpenHighlight: (c: Collection) => void;
  onOpenProfile: () => void;
}) {
  const byId = new Map(collections.map((c) => [c.id, c]));

  return (
    <div style={{ padding: '4px 0 24px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
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
        {/* Profile entry — replaces the static day sticker (handoff §Slice C);
            the day count now lives inside the panel. */}
        <button
          type="button"
          onClick={onOpenProfile}
          aria-label="Open profile and settings"
          style={{
            ...buttonReset,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: tokens.sticker,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 900,
            color: tokens.ink,
          }}
        >
          {initials(displayName)}
        </button>
      </div>

      <Highlights collections={collections} units={units} progress={progress} onOpen={onOpenHighlight} />

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
