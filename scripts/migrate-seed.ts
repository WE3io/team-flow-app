/**
 * migrate-seed.ts — one-off migration (handoff §4).
 *
 * Parses Team_Workflow_Learning_Seed_v0.2.md (the content source of truth) and
 * emits one content/units/<id>.mdx per unit with YAML frontmatter matching the
 * `Unit` type, plus content/collections.json from seed §4. Every unit is
 * validated against the zod schema; invalid or duplicate ids abort the run.
 *
 * Run:  npm run migrate:seed
 * Re-run any time the seed changes — it rewrites content/ from scratch.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { CollectionSchema, type Unit, UnitSchema } from '../lib/types';

const ROOT = path.resolve(__dirname, '..');
const SEED = path.join(ROOT, 'Team_Workflow_Learning_Seed_v0.2.md');
const UNITS_DIR = path.join(ROOT, 'content', 'units');
const COLLECTIONS_OUT = path.join(ROOT, 'content', 'collections.json');

function fail(msg: string): never {
  console.error(`\n✗ migrate-seed: ${msg}\n`);
  process.exit(1);
}

/** Slice a labelled section out of the seed by its `## N. Title` heading. */
function section(src: string, startHeading: string, endHeading: string): string {
  const start = src.indexOf(startHeading);
  if (start === -1) fail(`could not find section "${startHeading}"`);
  const end = endHeading ? src.indexOf(endHeading, start) : src.length;
  return src.slice(start, end === -1 ? src.length : end);
}

// ---------- collections (seed §4) ----------
function parseCollections(src: string) {
  const region = section(src, '## 4. Information architecture', '### Three access modes');
  const rows = region.split('\n').filter((l) => /^\|\s*\d+\s*\|/.test(l)); // table body rows only
  const collections = rows.map((row) => {
    const cells = row.split('|').map((c) => c.trim());
    // cells: ['', '1', 'Start Here (`start-here`)', 'all', 'covers…', '']
    const order = Number(cells[1]);
    const titleCell = cells[2];
    const m = titleCell.match(/^(.*?)\s*\(`([^`]+)`\)/);
    if (!m) fail(`could not parse collection row: ${row}`);
    const title = m[1].trim();
    const id = m[2].trim();
    const tier = cells[3]
      .split('·')
      .map((t) => t.trim())
      .filter(Boolean);
    const parsed = CollectionSchema.safeParse({ id, title, tier, order });
    if (!parsed.success) fail(`invalid collection "${id}": ${parsed.error.message}`);
    return parsed.data;
  });
  if (!collections.length) fail('no collections parsed from §4');
  return collections;
}

// ---------- units (seed §8) ----------
const FIELD_RE = /^\*\*([A-Za-z][A-Za-z /]*?)(?:\s*\([^)]*\))?:\*\*\s?(.*)$/;

/** Split the §8 content region into one raw block per unit (yaml + fields). */
function splitUnitBlocks(region: string): string[] {
  const parts: string[] = [];
  const fenceRe = /```yaml\s*\n([\s\S]*?)\n```/g;
  const matches: { yaml: string; index: number; endYaml: number }[] = [];
  let m: RegExpExecArray | null;
  // biome-ignore lint/suspicious/noAssignInExpressions: idiomatic RegExp.exec iteration
  while ((m = fenceRe.exec(region))) {
    matches.push({ yaml: m[1], index: m.index, endYaml: fenceRe.lastIndex });
  }
  matches.forEach((cur, i) => {
    const contentStart = cur.endYaml;
    const contentEnd = i + 1 < matches.length ? matches[i + 1].index : region.length;
    parts.push(
      JSON.stringify({
        yaml: cur.yaml,
        content: region.slice(contentStart, contentEnd),
      }),
    );
  });
  return parts;
}

function parseCarousel(raw: string) {
  const items: { heading: string; body: string }[] = [];
  let current: string | null = null;
  for (const line of raw.split('\n')) {
    const numbered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (numbered) {
      if (current !== null) items.push(splitSlide(current));
      current = numbered[1];
    } else if (current !== null && line.trim()) {
      current += ` ${line.trim()}`;
    }
  }
  if (current !== null) items.push(splitSlide(current));
  return items;
}

function splitSlide(text: string) {
  const m = text.match(/^\*\*(.+?)\*\*\s*(.*)$/);
  if (!m) return { heading: '', body: text.trim() };
  const heading = m[1].replace(/:$/, '').trim();
  const body = m[2].replace(/^\s*[—–:-]\s*/, '').trim();
  return { heading, body };
}

function parseUnitContent(content: string): Record<string, unknown> {
  const fields: Record<string, string> = {};
  let currentLabel: string | null = null;
  for (const line of content.split('\n')) {
    const fm = line.match(FIELD_RE);
    if (fm) {
      const label = fm[1].trim().toLowerCase(); // "Visual (reel storyboard)" -> "visual"
      currentLabel = label;
      fields[label] = fm[2];
    } else if (currentLabel) {
      fields[currentLabel] += `\n${line}`;
    }
  }

  const out: Record<string, unknown> = {};
  const get = (k: string) => (fields[k] ?? '').trim();
  if (fields.hook !== undefined) out.hook = get('hook');
  if (fields.body !== undefined) out.body = get('body');
  if (fields.carousel !== undefined) out.carousel = parseCarousel(fields.carousel);
  if (fields.visual !== undefined) out.visual = get('visual');
  if (fields.next !== undefined) out.next = get('next');
  if (fields.prompt !== undefined) out.prompt = get('prompt');
  if (fields.answer !== undefined) out.answer = get('answer');
  if (fields.misconception !== undefined) out.misconception = get('misconception');
  if (fields.distractors !== undefined) {
    try {
      out.distractors = JSON.parse(get('distractors'));
    } catch {
      fail(`could not parse Distractors as JSON: ${get('distractors')}`);
    }
  }
  return out;
}

function parseUnits(src: string): Unit[] {
  const region = section(src, '## 8. The units', '## 9. Population manifest');
  const blocks = splitUnitBlocks(region);
  const seen = new Set<string>();
  return blocks.map((packed, i) => {
    const { yaml: yamlText, content } = JSON.parse(packed) as {
      yaml: string;
      content: string;
    };
    const meta = yaml.load(yamlText) as Record<string, unknown>;
    const merged = { order: i, ...meta, ...parseUnitContent(content) };
    const parsed = UnitSchema.safeParse(merged);
    if (!parsed.success) {
      fail(`unit "${meta.id ?? '?'}" failed validation:\n${JSON.stringify(parsed.error.format(), null, 2)}`);
    }
    if (seen.has(parsed.data.id)) fail(`duplicate unit id: ${parsed.data.id}`);
    seen.add(parsed.data.id);
    return parsed.data;
  });
}

function toMdx(unit: Unit): string {
  // Everything lives in frontmatter (data-driven render); the MDX body holds
  // the human-readable markdown body for easy editing/diffing.
  const { body, ...front } = unit;
  const fm = matter.stringify(body ? `\n${body}\n` : '\n', front).trimStart();
  return fm.endsWith('\n') ? fm : `${fm}\n`;
}

function main() {
  if (!fs.existsSync(SEED)) fail(`seed not found at ${SEED}`);
  const src = fs.readFileSync(SEED, 'utf8');

  const collections = parseCollections(src);
  const units = parseUnits(src);

  // Every unit's collection must exist in the registry.
  const collIds = new Set(collections.map((c) => c.id));
  for (const u of units) {
    if (!collIds.has(u.collection)) fail(`unit "${u.id}" references unknown collection "${u.collection}"`);
  }

  fs.rmSync(UNITS_DIR, { recursive: true, force: true });
  fs.mkdirSync(UNITS_DIR, { recursive: true });
  for (const u of units) {
    fs.writeFileSync(path.join(UNITS_DIR, `${u.id}.mdx`), toMdx(u), 'utf8');
  }
  fs.mkdirSync(path.dirname(COLLECTIONS_OUT), { recursive: true });
  fs.writeFileSync(COLLECTIONS_OUT, `${JSON.stringify(collections, null, 2)}\n`, 'utf8');

  console.log(`✓ migrate-seed: wrote ${units.length} units and ${collections.length} collections`);
  const byColl = collections
    .map((c) => `  ${c.id}: ${units.filter((u) => u.collection === c.id).length}`)
    .join('\n');
  console.log(byColl);
}

main();
