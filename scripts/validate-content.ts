/**
 * validate-content.ts — build-time content gate (acceptance §9.9).
 * Validates every unit/collection and all cross-references. Exits non-zero
 * on any problem so CI can block. Run: npm run validate:content
 */
import path from 'node:path';
import { loadContentBundle } from '../lib/bundle';

try {
  const { units, collections, warnings } = loadContentBundle(path.resolve(__dirname, '..'));
  console.log(`✓ content valid: ${units.length} units, ${collections.length} collections`);
  if (warnings.length) {
    console.log(`\n  ${warnings.length} dangling cross-reference(s) to not-yet-written units (seed §9):`);
    for (const w of warnings) console.log(`  · ${w}`);
  }
} catch (err) {
  console.error(`\n✗ content invalid: ${(err as Error).message}\n`);
  process.exit(1);
}
