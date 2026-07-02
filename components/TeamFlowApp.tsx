'use client';
import { useMemo, useState } from 'react';
import type { Unit, Collection } from '@/lib/types';
import {
  emptyProgress,
  markSeen,
  grade as gradeProgress,
  computeFeed,
  dueUnits,
  type Grade,
  type Progress,
} from '@/lib/scheduler';
import BottomNav, { type TabKey } from './BottomNav';
import FeedView from './views/FeedView';
import PathView from './views/PathView';
import SearchView from './views/SearchView';
import SavedView from './views/SavedView';
import LibraryView from './views/LibraryView';
import DetailSheet from './DetailSheet';
import StoryViewer, { type ViewerState } from './StoryViewer';
import type { UnitActions } from './UnitActions';

export default function TeamFlowApp({ units, collections }: { units: Unit[]; collections: Collection[] }) {
  const [tab, setTab] = useState<TabKey>('feed');
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [slides, setSlides] = useState<Record<string, number>>({});
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<Progress>(emptyProgress());
  const [query, setQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [detail, setDetail] = useState<string | null>(null);
  const [viewer, setViewer] = useState<ViewerState | null>(null);

  // Scheduler demo controls (Phase 1 stand-in for real time + persistence).
  const [simDay, setSimDay] = useState(0);
  const [showDueBanner, setShowDueBanner] = useState(true);
  const [noviceOrdering, setNoviceOrdering] = useState(true);

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
      setProgress((p) => markSeen(p, id, simDay));
    },
    onGrade: (id, g: Grade) => {
      setProgress((p) => gradeProgress(p, id, g, simDay));
      setRevealed((r) => ({ ...r, [id]: true }));
    },
    onSlide: (id, dir, len) =>
      setSlides((s) => ({ ...s, [id]: Math.max(0, Math.min(len - 1, (s[id] ?? 0) + dir)) })),
    onBookmark: (id) => setBookmarks((b) => ({ ...b, [id]: !b[id] })),
    openDetail,
  };

  const due = dueUnits(units, progress, simDay);
  const feedItems = computeFeed(units, progress, simDay, noviceOrdering);
  const bannerVisible = showDueBanner && due.length > 0;

  const openHighlight = (c: Collection) => {
    const ids = units.filter((u) => u.collection === c.id).map((u) => u.id);
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
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <div className="no-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        {tab === 'feed' && (
          <FeedView
            units={units}
            collections={collections}
            feedItems={feedItems}
            actions={actions}
            progress={progress}
            simDay={simDay}
            dueCount={due.length}
            bannerVisible={bannerVisible}
            onOpenDue={openDue}
            onOpenHighlight={openHighlight}
            demo={{
              simDay,
              onSimDay: setSimDay,
              showDueBanner,
              onShowDueBanner: setShowDueBanner,
              noviceOrdering,
              onNoviceOrdering: setNoviceOrdering,
            }}
          />
        )}
        {tab === 'path' && <PathView units={units} progress={progress} revealed={revealed} openDetail={openDetail} />}
        {tab === 'search' && <SearchView units={units} query={query} onQuery={setQuery} openDetail={openDetail} />}
        {tab === 'saved' && <SavedView units={units} bookmarks={bookmarks} openDetail={openDetail} />}
        {tab === 'library' && (
          <LibraryView
            units={units}
            tierFilter={tierFilter}
            typeFilter={typeFilter}
            onTier={setTierFilter}
            onType={setTypeFilter}
            openDetail={openDetail}
          />
        )}
      </div>

      <BottomNav tab={tab} onTab={(t) => { setTab(t); setDetail(null); }} />

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
          simDay={simDay}
          onPrev={viewerPrev}
          onNext={viewerNext}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
}
