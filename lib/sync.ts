'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Grade } from './scheduler';
import {
  emptyStore,
  fromRows,
  grade as gradeStore,
  markSeen as markSeenStore,
  mergeStores,
  toRows,
  toggleBookmark as toggleBookmarkStore,
  type ProgressRow,
  type StoredProgress,
} from './store';

/**
 * Local-first store + write-through sync (PHASE2_HANDOFF §Slice B).
 *
 * localStorage is the immediate read/write store so the app is fully usable
 * offline / before first sync. Mutations persist locally at once, then push to
 * Postgres (debounced); on failure we stay local and retry. Conflict rule
 * (most-recent lastSeenAt wins) lives server-side and in mergeStores().
 */

const K_USER = 'tf.userId';
const K_NAME = 'tf.displayName';
const K_STORE = 'tf.progress';
const K_EVENTS = 'tf.events';

export type SyncState = 'local' | 'syncing' | 'synced' | 'offline';

interface EventOut {
  unitId: string;
  result: Grade;
  at: string;
}

function lsGet(k: string): string | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(k);
  } catch {
    return null;
  }
}
function lsSet(k: string, v: string) {
  try {
    window.localStorage.setItem(k, v);
  } catch {
    /* private mode / quota — stay in-memory */
  }
}
function lsDel(k: string) {
  try {
    window.localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
}

async function jsonPost(url: string, body: unknown): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export interface TeamFlowStore {
  store: StoredProgress;
  userId: string | null;
  displayName: string;
  sync: SyncState;
  reveal: (id: string) => void;
  gradeUnit: (id: string, g: Grade) => void;
  bookmark: (id: string) => void;
  setDisplayName: (name: string) => void;
  resetProgress: () => Promise<void>;
  pairGenerate: () => Promise<{ code: string; expiresAt: string } | null>;
  pairClaim: (code: string) => Promise<'ok' | 'invalid' | 'error'>;
}

export function useTeamFlowStore(): TeamFlowStore {
  const [store, setStoreState] = useState<StoredProgress>(emptyStore);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayNameState] = useState('Anonymous');
  const [sync, setSync] = useState<SyncState>('local');

  // Refs mirror latest state for use inside async callbacks without stale closures.
  const storeRef = useRef(store);
  const userRef = useRef<string | null>(null);
  const eventsRef = useRef<EventOut[]>([]);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setStore = useCallback((next: StoredProgress) => {
    storeRef.current = next;
    setStoreState(next);
    lsSet(K_STORE, JSON.stringify(next));
  }, []);

  const setUser = useCallback((id: string | null) => {
    userRef.current = id;
    setUserId(id);
    if (id) lsSet(K_USER, id);
    else lsDel(K_USER);
  }, []);

  const setName = useCallback((name: string) => {
    setDisplayNameState(name);
    lsSet(K_NAME, name);
  }, []);

  /** Push local store + queued events; adopt the server's authoritative rows. */
  const push = useCallback(async (): Promise<boolean> => {
    const id = userRef.current;
    if (!id || typeof navigator !== 'undefined' && !navigator.onLine) return false;
    const events = eventsRef.current;
    setSync('syncing');
    try {
      const res = await jsonPost('/api/progress', {
        userId: id,
        rows: toRows(storeRef.current),
        events,
      });
      if (res.status === 404) {
        // Stale user id (server DB reset) — re-create and retry once.
        const created = await ensureUser(true);
        if (!created) return false;
        return push();
      }
      if (!res.ok) {
        setSync('offline');
        return false;
      }
      const data: { progress: ProgressRow[] } = await res.json();
      // Merge authoritative server rows with any local mutations since request.
      const merged = mergeStores(storeRef.current, fromRows(data.progress));
      setStore(merged);
      // Drop the events we successfully flushed.
      eventsRef.current = eventsRef.current.slice(events.length);
      lsSet(K_EVENTS, JSON.stringify(eventsRef.current));
      setSync('synced');
      return true;
    } catch {
      setSync('offline');
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setStore]);

  const schedulePush = useCallback(() => {
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => void push(), 700);
  }, [push]);

  const ensureUser = useCallback(async (force = false): Promise<string | null> => {
    if (!force && userRef.current) return userRef.current;
    try {
      const res = await jsonPost('/api/user', {});
      if (!res.ok) return null;
      const data: { id: string; displayName: string } = await res.json();
      setUser(data.id);
      setName(data.displayName);
      return data.id;
    } catch {
      return null;
    }
  }, [setUser, setName]);

  // ---------- mutators ----------
  const reveal = useCallback(
    (id: string) => {
      setStore(markSeenStore(storeRef.current, id, Date.now()));
      schedulePush();
    },
    [setStore, schedulePush],
  );

  const gradeUnit = useCallback(
    (id: string, g: Grade) => {
      setStore(gradeStore(storeRef.current, id, g, Date.now()));
      const ev: EventOut = { unitId: id, result: g, at: new Date().toISOString() };
      eventsRef.current = [...eventsRef.current, ev];
      lsSet(K_EVENTS, JSON.stringify(eventsRef.current));
      schedulePush();
    },
    [setStore, schedulePush],
  );

  const bookmark = useCallback(
    (id: string) => {
      setStore(toggleBookmarkStore(storeRef.current, id, Date.now()));
      schedulePush();
    },
    [setStore, schedulePush],
  );

  const setDisplayName = useCallback(
    (name: string) => {
      setName(name);
      const id = userRef.current;
      if (id) void jsonPost('/api/user/' + id + '/name', { displayName: name }).catch(() => {});
    },
    [setName],
  );

  const resetProgress = useCallback(async () => {
    setStore(emptyStore());
    eventsRef.current = [];
    lsDel(K_EVENTS);
    const id = userRef.current;
    if (id) await jsonPost('/api/user/' + id + '/reset', {}).catch(() => {});
  }, [setStore]);

  const pairGenerate = useCallback(async () => {
    const id = await ensureUser();
    if (!id) return null;
    await push(); // make sure this device's state is on the server first
    try {
      const res = await jsonPost('/api/pair/generate', { userId: id });
      if (!res.ok) return null;
      return (await res.json()) as { code: string; expiresAt: string };
    } catch {
      return null;
    }
  }, [ensureUser, push]);

  const pairClaim = useCallback(
    async (code: string): Promise<'ok' | 'invalid' | 'error'> => {
      try {
        const res = await jsonPost('/api/pair/claim', { code });
        if (res.status === 404) return 'invalid';
        if (!res.ok) return 'error';
        const data: { userId: string; displayName: string; progress: ProgressRow[] } = await res.json();
        // Adopt the paired user; server state merges with local unsynced units.
        setUser(data.userId);
        setName(data.displayName);
        const merged = mergeStores(storeRef.current, fromRows(data.progress));
        setStore(merged);
        await push();
        return 'ok';
      } catch {
        return 'error';
      }
    },
    [setUser, setName, setStore, push],
  );

  // ---------- hydration on mount ----------
  useEffect(() => {
    // 1. Load local immediately (offline-first).
    const localStore: StoredProgress = (() => {
      try {
        return JSON.parse(lsGet(K_STORE) ?? '{}') as StoredProgress;
      } catch {
        return {};
      }
    })();
    try {
      eventsRef.current = JSON.parse(lsGet(K_EVENTS) ?? '[]');
    } catch {
      eventsRef.current = [];
    }
    storeRef.current = localStore;
    setStoreState(localStore);
    const savedId = lsGet(K_USER);
    const savedName = lsGet(K_NAME);
    if (savedId) {
      userRef.current = savedId;
      setUserId(savedId);
    }
    if (savedName) setDisplayNameState(savedName);

    // 2. Reconcile with server in the background.
    (async () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setSync('offline');
        return;
      }
      let id = savedId;
      if (id) {
        try {
          const res = await fetch('/api/user/' + id, { cache: 'no-store' });
          if (res.status === 404) {
            id = await ensureUser(true);
          } else if (res.ok) {
            const data: { displayName: string; progress: ProgressRow[] } = await res.json();
            setName(data.displayName);
            setStore(mergeStores(storeRef.current, fromRows(data.progress)));
          } else if (res.status === 503) {
            setSync('local'); // no persistence configured — stay local, no error
            return;
          }
        } catch {
          setSync('offline');
          return;
        }
      } else {
        id = await ensureUser();
        if (!id) {
          setSync('offline');
          return;
        }
      }
      await push();
    })();
    // Flush again when connectivity returns.
    const onOnline = () => void push();
    if (typeof window !== 'undefined') window.addEventListener('online', onOnline);
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('online', onOnline);
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    store,
    userId,
    displayName,
    sync,
    reveal,
    gradeUnit,
    bookmark,
    setDisplayName,
    resetProgress,
    pairGenerate,
    pairClaim,
  };
}
