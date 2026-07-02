import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { UnitSchema, CollectionSchema, type Unit, type SeedCollection, type Collection } from './types';
import { decorateCollections } from './collections';

/**
 * Pure content loader + validator (no server-only, no cache) so it can run
 * from both the Next.js server and the standalone validate script. Throws on
 * the first schema or referential-integrity failure.
 */
export interface ContentBundle {
  units: Unit[];
  collections: Collection[];
  /** Dangling prereq/related ids — units listed but not yet written (seed §9). */
  warnings: string[];
}

export function loadContentBundle(root: string): ContentBundle {
  const contentDir = path.join(root, 'content');
  const unitsDir = path.join(contentDir, 'units');
  const collectionsFile = path.join(contentDir, 'collections.json');

  const rawCollections = JSON.parse(fs.readFileSync(collectionsFile, 'utf8')) as unknown[];
  const seedCollections: SeedCollection[] = rawCollections.map((c, i) => {
    const parsed = CollectionSchema.safeParse(c);
    if (!parsed.success) throw new Error(`collection #${i} invalid — ${parsed.error.message}`);
    return parsed.data;
  });
  const collections = decorateCollections(seedCollections);
  const collectionIds = new Set(collections.map((c) => c.id));

  const files = fs.readdirSync(unitsDir).filter((f) => f.endsWith('.mdx')).sort();
  const seen = new Set<string>();
  const units: Unit[] = files.map((file) => {
    const src = fs.readFileSync(path.join(unitsDir, file), 'utf8');
    const { data, content } = matter(src);
    const body = (data.body ?? content ?? '').toString().trim();
    const parsed = UnitSchema.safeParse({ ...data, body });
    if (!parsed.success) {
      throw new Error(`${file} failed validation — ${JSON.stringify(parsed.error.format())}`);
    }
    const unit = parsed.data;
    if (seen.has(unit.id)) throw new Error(`duplicate unit id "${unit.id}" (${file})`);
    seen.add(unit.id);
    if (`${unit.id}.mdx` !== file) throw new Error(`id "${unit.id}" does not match filename "${file}"`);
    if (!collectionIds.has(unit.collection)) {
      throw new Error(`unit "${unit.id}" references unknown collection "${unit.collection}"`);
    }
    return unit;
  });

  // prereqs/related may point at units listed-but-unwritten in the seed's
  // Population Manifest (§9). Surface them as warnings, not build failures.
  // Restore the seed's authored order (files are read alphabetically).
  units.sort((a, b) => a.order - b.order);

  const unitIds = new Set(units.map((u) => u.id));
  const warnings: string[] = [];
  for (const u of units) {
    for (const ref of [...u.prereqs, ...u.related]) {
      if (!unitIds.has(ref)) {
        warnings.push(`unit "${u.id}" references not-yet-written unit "${ref}"`);
      }
    }
  }

  return { units, collections, warnings };
}
