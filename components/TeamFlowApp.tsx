'use client';
import { useMemo, useState } from 'react';
import { visibleForClass } from '@/lib/query';
import { computeFeed, dueUnits, type Grade } from '@/lib/scheduler';
import { computeStreaks } from '@/lib/stats';
import { bookmarkMap, DAY_MS, dayIndex, toSchedulerProgress } from '@/lib/store';
import { useTeamFlowStore } from '@/lib/sync';
import type { Collection, Unit } from '@/lib/types';
import BottomNav, { type TabKey } from './BottomNav';
import DetailSheet from './DetailSheet';
import ProfilePanel from './ProfilePanel';
import StoryViewer, { type ViewerState } from './StoryViewer';
import type { UnitActions } from './UnitActions';
import FeedView from './views/FeedView';
import LibraryView from './views/LibraryView';
import PathView from './views/PathView';
import SavedView from './views/SavedView';
import SearchView from './views/SearchView';

// The Scheduler-demo control ships only when explicitly enabled (handoff §Slice
// B) — it offsets "today" client-side to review Leitner behaviour on previews.
const SCHEDULER_DEMO = process.env.NEXT_PUBLIC_SCHEDULER_DEMO === '1';

export default function TeamFlowApp({ units, collections }: { units: Unit[]; collections: Collection[] }) {
  const flow = useTeamFlowStore();

  const [tab, setTab] = useState<TabKey>('feed');
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [slides, setSlides] = useState<Record<string, number>>({});
  const [query, setQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [detail, setDetail] = useState<string | null>(null);
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // Scheduler-demo lens (gated behind the env flag; lives in profile settings).
  const [demoOffset, setDemoOffset] = useState(0);
  const [showDueBanner, setShowDueBanner] = useState(true);
  const [noviceOrdering, setNoviceOrdering] = useState(true);
  const demo = SCHEDULER_DEMO
    ? {
        demoOffset,
        onDemoOffset: setDemoOffset,
        showDueBanner,
        onShowDueBanner: setShowDueBanner,
        noviceOrdering,
        onNoviceOrdering: setNoviceOrdering,
      }
    : null;

  // Real time at day granularity replaces Phase-1 simDay; the demo offset (when
  // enabled) shifts only the lens, never the stored dates.
  const today = Math.floor(Date.now() / DAY_MS) + (SCHEDULER_DEMO ? demoOffset : 0);

  const progress = useMemo(() => toSchedulerProgress(flow.store), [flow.store]);
  const bookmarks = useMemo(() => bookmarkMap(flow.store), [flow.store]);
  const streak = useMemo(
    () =>
      computeStreaks(
        flow.reviewLog.map((e) => dayIndex(e.atMs)),
        dayIndex(Date.now()),
      ).current,
    [flow.reviewLog],
  );

  const byId = useMemo(() => new Map(units.map((u) => [u.id, u])), [units]);
  const collById = useMemo(() => new Map(collections.map((c) => [c.id, c])), [collections]);

  const openDetail = (id: string) => setDetail(id);

  const actions: UnitActions = {
    revealed,
    slides,
    bookmarks,
    progress,
    onReveal: (id) => {
      setRevealed((r) => (r[id] ? r : { ...r, [id]: true }));
      flow.reveal(id);
    },
    onGrade: (id, g: Grade) => {
      flow.gradeUnit(id, g);
      setRevealed((r) => ({ ...r, [id]: true }));
    },
    onSlide: (id, dir, len) =>
      setSlides((s) => ({
        ...s,
        [id]: Math.max(0, Math.min(len - 1, (s[id] ?? 0) + dir)),
      })),
    onBookmark: (id) => flow.bookmark(id),
    openDetail,
  };

  // Deploy-class filter: hide the other class's deployment lessons from the
  // discovery surfaces (feed/path/search/library/highlights). Saved and id
  // lookup keep the full set so explicit bookmarks and links always resolve.
  const visibleUnits = useMemo(() => visibleForClass(units, flow.deployClass), [units, flow.deployClass]);

  const due = dueUnits(visibleUnits, progress, today);
  const feedItems = computeFeed(visibleUnits, progress, today, noviceOrdering);
  const bannerVisible = showDueBanner && due.length > 0;

  const openHighlight = (c: Collection) => {
    const ids = visibleUnits.filter((u) => u.collection === c.id).map((u) => u.id);
    setViewer({ ids, i: 0, title: c.title });
  };
  const openDue = () => setViewer({ ids: due.map((u) => u.id), i: 0, title: 'Due today' });

  const detailUnit = detail ? byId.get(detail) : undefined;
  const viewerUnit = viewer ? byId.get(viewer.ids[viewer.i]) : undefined;

  const viewerNext = () =>
    setViewer((v) => {
      if (!v) return v;
      if (v.i >= v.ids.length - 1) return null;
      return { ...v, i: v.i + 1 };
    });
  const viewerPrev = () => setViewer((v) => (!v || v.i === 0 ? v : { ...v, i: v.i - 1 }));

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {tab === 'feed' && (
          <FeedView
            units={visibleUnits}
            collections={collections}
            feedItems={feedItems}
            actions={actions}
            progress={progress}
            today={today}
            dueCount={due.length}
            bannerVisible={bannerVisible}
            displayName={flow.displayName}
            streak={streak}
            onOpenDue={openDue}
            onOpenHighlight={openHighlight}
            onOpenProfile={() => setProfileOpen(true)}
          />
        )}
        {tab === 'path' && (
          <PathView units={visibleUnits} progress={progress} revealed={revealed} openDetail={openDetail} />
        )}
        {tab === 'search' && (
          <SearchView units={visibleUnits} query={query} onQuery={setQuery} openDetail={openDetail} />
        )}
        {tab === 'saved' && <SavedView units={units} bookmarks={bookmarks} openDetail={openDetail} />}
        {tab === 'library' && (
          <LibraryView
            units={visibleUnits}
            tierFilter={tierFilter}
            typeFilter={typeFilter}
            onTier={setTierFilter}
            onType={setTypeFilter}
            openDetail={openDetail}
          />
        )}
      </div>

      <BottomNav
        tab={tab}
        onTab={(t) => {
          setTab(t);
          setDetail(null);
        }}
      />

      {detailUnit && (
        <DetailSheet
          unit={detailUnit}
          collection={collById.get(detailUnit.collection)}
          actions={actions}
          onClose={() => setDetail(null)}
        />
      )}

      {viewer && viewerUnit && (
        <StoryViewer
          viewer={viewer}
          unit={viewerUnit}
          collection={collById.get(viewerUnit.collection)}
          actions={actions}
          today={today}
          onPrev={viewerPrev}
          onNext={viewerNext}
          onClose={() => setViewer(null)}
        />
      )}

      {profileOpen && (
        <ProfilePanel
          units={visibleUnits}
          collections={collections}
          flow={flow}
          demo={demo}
          onClose={() => setProfileOpen(false)}
        />
      )}
    </div>
  );
}
