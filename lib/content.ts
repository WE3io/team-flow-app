import 'server-only';
import { type ContentBundle, loadContentBundle } from './bundle';

/**
 * Server-side entry point for content. Validates at build time (via
 * loadContentBundle) and caches the result for the process. A validation
 * failure throws and fails the build (acceptance §9.9).
 */
let cached: ContentBundle | null = null;

export function loadContent(): ContentBundle {
  if (!cached) cached = loadContentBundle(process.cwd());
  return cached;
}

export type { ContentBundle };
