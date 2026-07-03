'use client';
import { useEffect, useMemo, useState } from 'react';
import { MAX_BOX } from '@/lib/scheduler';
import { computeBadges, computeRecap, computeStreaks, MASTERED_BOX } from '@/lib/stats';
import { DAY_MS, dayIndex, isSeen } from '@/lib/store';
import type { TeamFlowStore } from '@/lib/sync';
import { buttonReset, tokens } from '@/lib/theme';
import type { Collection, Unit } from '@/lib/types';
import SchedulerDemo, { type SchedulerDemoProps } from './SchedulerDemo';
import { renderShareCard, shareOrDownload } from './shareCard';

/**
 * Full-screen profile & settings panel (handoff §Slice C + D). Quiet surfaces,
 * colour in the progress donuts and Leitner distribution — same language as
 * the feed highlights. Slice D adds streaks, collection badges, the weekly
 * recap and the team leaderboard (all retrieval/completion measures, seed §6).
 */

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const s = parts
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
  return (s || 'A').toUpperCase();
}

const SYNC_LABEL: Record<TeamFlowStore['sync'], string> = {
  local: 'On this device',
  syncing: 'Syncing…',
  synced: 'Synced',
  offline: 'Offline — will sync',
};

export default function ProfilePanel({
  units,
  collections,
  flow,
  demo,
  onClose,
}: {
  units: Unit[];
  collections: Collection[];
  flow: TeamFlowStore;
  demo: SchedulerDemoProps | null;
  onClose: () => void;
}) {
  const [nameDraft, setNameDraft] = useState(flow.displayName);
  useEffect(() => setNameDraft(flow.displayName), [flow.displayName]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const stats = useMemo(() => {
    const perCollection = collections.map((c) => {
      const us = units.filter((u) => u.collection === c.id);
      const covered = us.filter((u) => isSeen(flow.store[u.id])).length;
      const mastered = us.filter((u) => {
        const s = flow.store[u.id];
        return isSeen(s) && s.box >= MASTERED_BOX;
      }).length;
      return {
        c,
        total: us.length,
        covered,
        mastered,
        pct: Math.round((covered / Math.max(1, us.length)) * 100),
      };
    });
    const boxDist = Array.from({ length: MAX_BOX }, (_, i) => ({ box: i + 1, count: 0 }));
    for (const u of units) {
      const s = flow.store[u.id];
      if (isSeen(s)) boxDist[Math.min(s.box, MAX_BOX) - 1].count++;
    }
    const covered = perCollection.reduce((n, p) => n + p.covered, 0);
    const mastered = perCollection.reduce((n, p) => n + p.mastered, 0);
    return { perCollection, boxDist, covered, mastered, total: units.length };
  }, [units, collections, flow.store]);

  const gamification = useMemo(() => {
    const now = Date.now();
    const streaks = computeStreaks(
      flow.reviewLog.map((e) => dayIndex(e.atMs)),
      dayIndex(now),
    );
    const recap = computeRecap(flow.reviewLog, now, flow.store);
    const badges = new Map(computeBadges(units, flow.store).map((b) => [b.collectionId, b]));
    return { streaks, recap, badges };
  }, [flow.reviewLog, flow.store, units]);

  const day = flow.startedAtMs ? Math.floor((Date.now() - flow.startedAtMs) / DAY_MS) + 1 : 1;

  const commitName = () => {
    const name = nameDraft.trim().slice(0, 40);
    if (name && name !== flow.displayName) flow.setDisplayName(name);
    else setNameDraft(flow.displayName);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Profile and settings"
      style={{
        position: 'absolute',
        inset: 0,
        background: tokens.canvas,
        zIndex: 46,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px 10px',
          borderBottom: `1px solid ${tokens.hairline}`,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: -0.3, color: tokens.ink }}>Profile</span>
        <button
          type="button"
          onClick={onClose}
          style={{ ...buttonReset, fontSize: 13, fontWeight: 800, color: tokens.text3, padding: '6px 4px' }}
        >
          Close ✕
        </button>
      </div>

      <div
        className="no-scrollbar"
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 18px 32px' }}
      >
        {/* Identity */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: tokens.sticker,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 900,
                color: tokens.ink,
                flex: '0 0 auto',
              }}
            >
              {initials(flow.displayName)}
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                maxLength={40}
                aria-label="Display name"
                style={{
                  width: '100%',
                  border: 'none',
                  borderBottom: `2px solid ${tokens.hairline}`,
                  background: 'transparent',
                  fontSize: 20,
                  fontWeight: 900,
                  color: tokens.ink,
                  fontFamily: 'inherit',
                  padding: '2px 0 4px',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 0.6,
                    color: tokens.ink,
                    background: tokens.sticker,
                    padding: '3px 10px',
                    borderRadius: 999,
                  }}
                >
                  Day {day}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: tokens.text4 }}>
                  {SYNC_LABEL[flow.sync]}
                </span>
              </div>
            </div>
          </div>
          <p style={{ fontSize: 11, color: tokens.text4, margin: '10px 0 0', lineHeight: 1.4 }}>
            Your name appears on the team leaderboard. Everything else stays on your devices.
          </p>
        </Card>

        {/* Collections */}
        <SectionLabel>Collections</SectionLabel>
        <Card>
          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 14 }}
          >
            {stats.perCollection.map(({ c, covered, total, mastered, pct }) => (
              <div
                key={c.id}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
              >
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: '50%',
                    background: `conic-gradient(${c.color} ${pct}%, ${tokens.progressTrack} 0)`,
                    padding: 4,
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: `${c.color}1A`,
                      border: '2px solid #FFFFFF',
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: 18, fontWeight: 900, color: c.color }}>{c.letter}</span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: tokens.text2,
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  {c.title}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: tokens.text4 }}>
                  {gamification.badges.get(c.id)?.mastered ? (
                    <span style={{ color: tokens.successInk }}>★ Mastered</span>
                  ) : gamification.badges.get(c.id)?.completed ? (
                    <span style={{ color: tokens.successInk }}>✓ Completed</span>
                  ) : (
                    <>
                      {covered}/{total}
                      {mastered > 0 && <span style={{ color: tokens.successInk }}> · {mastered}★</span>}
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Leitner distribution */}
        <SectionLabel>Spacing boxes</SectionLabel>
        <Card>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 96 }}>
            {stats.boxDist.map(({ box: b, count: n }) => {
              const max = Math.max(1, ...stats.boxDist.map((d) => d.count));
              const h = Math.max(4, Math.round((n / max) * 72));
              return (
                <div
                  key={`box-${b}`}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                >
                  <span style={{ fontSize: 11, fontWeight: 800, color: n ? tokens.ink : tokens.text6 }}>
                    {n}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      height: h,
                      borderRadius: 6,
                      background: b >= MASTERED_BOX ? tokens.success : tokens.progressTrack,
                      opacity: n ? 1 : 0.45,
                    }}
                  />
                  <span style={{ fontSize: 10, fontWeight: 700, color: tokens.text4 }}>B{b}</span>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 11, color: tokens.text4, margin: '10px 0 0', lineHeight: 1.4 }}>
            Cards climb boxes as you retrieve them (1 → 3 → 7 → 16 → 35 days). Box {MASTERED_BOX}+ counts as
            mastered.
          </p>
        </Card>

        {/* Streaks — a day counts when you graded at least one card (seed-endorsed: rewards returning) */}
        <SectionLabel>Streak</SectionLabel>
        <Card>
          <div style={{ display: 'flex', gap: 10 }}>
            <StatTile
              big={gamification.streaks.current ? `${gamification.streaks.current}d` : '—'}
              label="Current streak"
              accent={gamification.streaks.current ? tokens.successInk : undefined}
            />
            <StatTile
              big={gamification.streaks.best ? `${gamification.streaks.best}d` : '—'}
              label="Best streak"
            />
            <StatTile big={String(stats.mastered)} label="Mastered" accent={tokens.successInk} />
          </div>
          <p style={{ fontSize: 11, color: tokens.text4, margin: '10px 0 0', lineHeight: 1.4 }}>
            A day counts when you grade at least one card. Spacing works because you come back.
          </p>
        </Card>

        {/* Weekly recap — trailing 7 days from the review log */}
        <SectionLabel>This week</SectionLabel>
        <Card>
          <div style={{ display: 'flex', gap: 10 }}>
            <StatTile big={String(gamification.recap.reviewed)} label="Reviews" />
            <StatTile
              big={gamification.recap.accuracyPct === null ? '—' : `${gamification.recap.accuracyPct}%`}
              label="Accuracy"
              accent={
                gamification.recap.accuracyPct !== null && gamification.recap.accuracyPct >= 70
                  ? tokens.successInk
                  : undefined
              }
            />
            <StatTile big={String(gamification.recap.newlyMastered)} label="Newly mastered" />
            <StatTile big={`${gamification.recap.activeDays}/7`} label="Active days" />
          </div>
        </Card>

        {/* Leaderboard — mastered primary, 30-day accuracy secondary (server) */}
        <SectionLabel>Team leaderboard</SectionLabel>
        <LeaderboardSection selfId={flow.userId} />

        {/* Share */}
        <SectionLabel>Share progress</SectionLabel>
        <ShareSection
          data={{
            displayName: flow.displayName,
            day,
            mastered: stats.mastered,
            covered: stats.covered,
            total: stats.total,
            streak: gamification.streaks.current || null,
            collections: stats.perCollection.map(({ c, pct }) => ({
              letter: c.letter,
              color: c.color,
              pct,
              completed: gamification.badges.get(c.id)?.completed ?? false,
              mastered: gamification.badges.get(c.id)?.mastered ?? false,
            })),
          }}
        />

        {/* Pairing */}
        <SectionLabel>Devices</SectionLabel>
        <PairingSection flow={flow} />

        {/* Settings */}
        <SectionLabel>Settings</SectionLabel>
        {demo && (
          <div style={{ margin: '0 -18px' }}>
            <SchedulerDemo {...demo} />
          </div>
        )}
        <ResetSection flow={flow} />
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: tokens.surface,
        border: `1px solid ${tokens.hairline}`,
        borderRadius: 16,
        padding: 16,
        marginBottom: 6,
        boxShadow: '0 1px 2px rgba(22,21,15,0.04)',
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: tokens.text4,
        padding: '14px 2px 6px',
      }}
    >
      {children}
    </div>
  );
}

function StatTile({ big, label, accent }: { big: string; label: string; accent?: string }) {
  return (
    <div
      style={{
        flex: 1,
        border: `1px solid ${tokens.hairline}`,
        borderRadius: 12,
        padding: '12px 12px 10px',
        background: tokens.sheet,
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 900, color: accent ?? tokens.ink, letterSpacing: -0.5 }}>
        {big}
      </div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          color: tokens.text4,
        }}
      >
        {label}
      </div>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  ...buttonReset,
  background: tokens.ink,
  color: '#F7F6F2',
  fontSize: 12,
  fontWeight: 800,
  padding: '11px 16px',
  borderRadius: 999,
  textAlign: 'center',
};

const secondaryBtn: React.CSSProperties = {
  ...buttonReset,
  border: `1px solid ${tokens.hairline}`,
  color: tokens.ink,
  fontSize: 12,
  fontWeight: 800,
  padding: '10px 16px',
  borderRadius: 999,
  textAlign: 'center',
  background: tokens.surface,
};

function ShareSection({ data }: { data: Parameters<typeof renderShareCard>[0] }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => () => void (previewUrl && URL.revokeObjectURL(previewUrl)), [previewUrl]);

  const generate = async () => {
    setBusy(true);
    setNote(null);
    try {
      const b = await renderShareCard(data);
      setBlob(b);
      setPreviewUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(b);
      });
    } catch {
      setNote('Could not render the image on this browser.');
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    if (!blob) return;
    const how = await shareOrDownload(blob, 'team-flow-progress.png');
    setNote(how === 'shared' ? 'Shared.' : 'Saved to your downloads.');
  };

  return (
    <Card>
      {previewUrl ? (
        <>
          {/* biome-ignore lint/performance/noImgElement: blob object-URL preview — next/image cannot render it */}
          <img
            src={previewUrl}
            alt="Your Team Flow progress card"
            style={{
              width: '100%',
              borderRadius: 12,
              border: `1px solid ${tokens.hairline}`,
              display: 'block',
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="button" onClick={share} style={{ ...primaryBtn, flex: 2 }}>
              Share / download
            </button>
            <button type="button" onClick={generate} disabled={busy} style={{ ...secondaryBtn, flex: 1 }}>
              Refresh
            </button>
          </div>
        </>
      ) : (
        <button type="button" onClick={generate} disabled={busy} style={{ ...primaryBtn, width: '100%' }}>
          {busy ? 'Rendering…' : 'Create share image'}
        </button>
      )}
      {note && <p style={{ fontSize: 11, color: tokens.text4, margin: '8px 0 0' }}>{note}</p>}
    </Card>
  );
}

function PairingSection({ flow }: { flow: TeamFlowStore }) {
  const [gen, setGen] = useState<{ code: string; expiresAt: string } | null>(null);
  const [remaining, setRemaining] = useState('');
  const [genBusy, setGenBusy] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [claim, setClaim] = useState('');
  const [claimBusy, setClaimBusy] = useState(false);
  const [claimNote, setClaimNote] = useState<string | null>(null);

  useEffect(() => {
    if (!gen) return;
    const tick = () => {
      const ms = new Date(gen.expiresAt).getTime() - Date.now();
      if (ms <= 0) {
        setGen(null);
        setRemaining('');
        return;
      }
      const m = Math.floor(ms / 60_000);
      const s = Math.floor((ms % 60_000) / 1000);
      setRemaining(`${m}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [gen]);

  const generate = async () => {
    setGenBusy(true);
    setGenError(null);
    const res = await flow.pairGenerate();
    setGenBusy(false);
    if (res) setGen(res);
    else setGenError('Sync is not available on this deployment yet — progress stays on this device.');
  };

  const doClaim = async () => {
    const code = claim.trim().toUpperCase();
    if (code.length !== 6) {
      setClaimNote('Codes are 6 characters.');
      return;
    }
    setClaimBusy(true);
    setClaimNote(null);
    const r = await flow.pairClaim(code);
    setClaimBusy(false);
    setClaimNote(
      r === 'ok'
        ? 'Linked — your progress from the other device is here.'
        : r === 'invalid'
          ? 'That code is invalid or has expired.'
          : 'Could not reach the server. Try again in a moment.',
    );
    if (r === 'ok') setClaim('');
  };

  return (
    <Card>
      <div style={{ fontSize: 13, fontWeight: 800, color: tokens.ink, marginBottom: 6 }}>
        Bring to another device
      </div>
      {gen ? (
        <div style={{ textAlign: 'center', padding: '6px 0 2px' }}>
          <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: 10, color: tokens.ink }}>
            {gen.code}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: tokens.text4, marginTop: 4 }}>
            Enter this on the other device · expires in {remaining}
          </div>
        </div>
      ) : (
        <button type="button" onClick={generate} disabled={genBusy} style={{ ...primaryBtn, width: '100%' }}>
          {genBusy ? 'Generating…' : 'Generate pairing code'}
        </button>
      )}
      {genError && (
        <p style={{ fontSize: 11, color: tokens.text4, margin: '8px 0 0', lineHeight: 1.4 }}>{genError}</p>
      )}

      <div style={{ borderTop: `1px solid ${tokens.hairlineSoft}`, margin: '14px 0 12px' }} />

      <div style={{ fontSize: 13, fontWeight: 800, color: tokens.ink, marginBottom: 8 }}>Enter a code</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={claim}
          onChange={(e) => setClaim(e.target.value.toUpperCase())}
          maxLength={6}
          placeholder="ABC123"
          aria-label="Pairing code from another device"
          style={{
            flex: 1,
            minWidth: 0,
            border: `1px solid ${tokens.hairline}`,
            borderRadius: 999,
            padding: '10px 16px',
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: 4,
            color: tokens.ink,
            fontFamily: 'inherit',
            background: tokens.sheet,
            outline: 'none',
            textTransform: 'uppercase',
          }}
        />
        <button type="button" onClick={doClaim} disabled={claimBusy} style={secondaryBtn}>
          {claimBusy ? 'Linking…' : 'Link'}
        </button>
      </div>
      {claimNote && <p style={{ fontSize: 11, color: tokens.text4, margin: '8px 0 0' }}>{claimNote}</p>}
    </Card>
  );
}

function ResetSection({ flow }: { flow: TeamFlowStore }) {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  const reset = async () => {
    await flow.resetProgress();
    setConfirming(false);
    setDone(true);
  };

  return (
    <Card>
      {confirming ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: tokens.ink, lineHeight: 1.35 }}>
            Reset all progress? This clears this device and your synced state.
          </span>
          <button
            type="button"
            onClick={reset}
            style={{ ...secondaryBtn, color: tokens.runbook, borderColor: tokens.runbookBorder }}
          >
            Reset
          </button>
          <button type="button" onClick={() => setConfirming(false)} style={secondaryBtn}>
            Keep
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setConfirming(true);
            setDone(false);
          }}
          style={{ ...buttonReset, fontSize: 12, fontWeight: 800, color: tokens.runbook, padding: '2px 0' }}
        >
          Reset my progress…
        </button>
      )}
      {done && <p style={{ fontSize: 11, color: tokens.text4, margin: '8px 0 0' }}>Progress reset.</p>}
    </Card>
  );
}

interface LeaderboardRow {
  userId: string;
  displayName: string;
  mastered: number;
  accuracyPct: number | null;
  streak: number;
}

function LeaderboardSection({ selfId }: { selfId: string | null }) {
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'unavailable'>('loading');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/leaderboard', { cache: 'no-store' });
        if (!alive) return;
        if (!res.ok) {
          setState('unavailable');
          return;
        }
        const data: { leaderboard: LeaderboardRow[] } = await res.json();
        setRows(data.leaderboard);
        setState('ok');
      } catch {
        if (alive) setState('unavailable');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Card>
      {state === 'loading' && <p style={{ fontSize: 12, color: tokens.text4, margin: 0 }}>Loading…</p>}
      {state === 'unavailable' && (
        <p style={{ fontSize: 12, color: tokens.text4, margin: 0, lineHeight: 1.4 }}>
          The leaderboard needs a connection — it compares everyone's retrieval progress on the server.
        </p>
      )}
      {state === 'ok' && rows && rows.length === 0 && (
        <p style={{ fontSize: 12, color: tokens.text4, margin: 0 }}>
          No reviews on the board yet — grade a card and take first place.
        </p>
      )}
      {state === 'ok' && rows && rows.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 8, padding: '0 0 6px' }}>
            <span style={{ width: 22 }} />
            <span
              style={{
                flex: 1,
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: 0.8,
                color: tokens.text5,
                textTransform: 'uppercase',
              }}
            >
              Name
            </span>
            <span
              style={{
                width: 64,
                textAlign: 'right',
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: 0.8,
                color: tokens.text5,
                textTransform: 'uppercase',
              }}
            >
              Mastered
            </span>
            <span
              style={{
                width: 60,
                textAlign: 'right',
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: 0.8,
                color: tokens.text5,
                textTransform: 'uppercase',
              }}
            >
              30d acc.
            </span>
            <span
              style={{
                width: 44,
                textAlign: 'right',
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: 0.8,
                color: tokens.text5,
                textTransform: 'uppercase',
              }}
            >
              Streak
            </span>
          </div>
          {rows.map((r, i) => {
            const isSelf = r.userId === selfId;
            return (
              <div
                key={r.userId}
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'baseline',
                  padding: '7px 0',
                  borderTop: `1px solid ${tokens.hairlineSoft}`,
                  background: isSelf ? tokens.successBg : 'transparent',
                  borderRadius: isSelf ? 8 : 0,
                }}
              >
                <span
                  style={{
                    width: 22,
                    fontSize: 12,
                    fontWeight: 900,
                    color: i < 3 ? tokens.ink : tokens.text5,
                    textAlign: 'center',
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 13,
                    fontWeight: isSelf ? 900 : 700,
                    color: tokens.ink,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {r.displayName}
                  {isSelf && <span style={{ color: tokens.successInk, fontWeight: 800 }}> · you</span>}
                </span>
                <span
                  style={{
                    width: 64,
                    textAlign: 'right',
                    fontSize: 13,
                    fontWeight: 900,
                    color: tokens.successInk,
                  }}
                >
                  {r.mastered}
                </span>
                <span
                  style={{
                    width: 60,
                    textAlign: 'right',
                    fontSize: 12,
                    fontWeight: 700,
                    color: tokens.text3,
                  }}
                >
                  {r.accuracyPct === null ? '—' : `${r.accuracyPct}%`}
                </span>
                <span
                  style={{
                    width: 44,
                    textAlign: 'right',
                    fontSize: 12,
                    fontWeight: 700,
                    color: tokens.text3,
                  }}
                >
                  {r.streak ? `${r.streak}d` : '—'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
