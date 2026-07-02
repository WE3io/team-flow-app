import type { Collection, SeedCollection } from './types';

/**
 * Design identity per collection — colour + letter for the Highlight rings.
 * The id/title/tier/order come from the seed (content/collections.json);
 * this map layers the visual system on top. Extends the prototype's palette
 * (green / blue / red / purple / amber) to all nine seed collections.
 */
export const COLLECTION_STYLE: Record<string, { color: string; letter: string }> = {
  'start-here': { color: '#12A15E', letter: 'S' },
  'everyday-flow': { color: '#3D6FDB', letter: 'E' },
  reviewing: { color: '#0F7B8F', letter: 'R' },
  'ai-tools': { color: '#7B5BE6', letter: 'A' },
  'git-breaks': { color: '#DE4E33', letter: '!' },
  'feature-flags': { color: '#DE8A0D', letter: '⚑' },
  engineers: { color: '#4F6D7A', letter: '⚙' },
  'non-code': { color: '#C2568C', letter: '✎' },
  glossary: { color: '#6B7280', letter: 'G' },
};

const FALLBACK = { color: '#16150F', letter: '•' };

/** Merge the seed registry with the design identity, sorted by seed order. */
export function decorateCollections(seed: SeedCollection[]): Collection[] {
  return [...seed]
    .sort((a, b) => a.order - b.order)
    .map((c) => ({ ...c, ...(COLLECTION_STYLE[c.id] ?? FALLBACK) }));
}
