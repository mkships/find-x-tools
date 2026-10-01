import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const [toolsSource, records] = await Promise.all([
  readFile(new URL('src/data/tools.js', root), 'utf8'),
  readFile(new URL('src/data/tools.json', root), 'utf8').then(JSON.parse)
]);

const failures = [];
const fail = message => failures.push(message);
const categorySource = toolsSource.match(/export const CATS = \{([\s\S]*?)\n\};/)?.[1] ?? '';
const categoryIds = new Set([...categorySource.matchAll(/^\s*([a-z]+):\{/gm)].map(match => match[1]));
if (!Array.isArray(records) || !records.length) throw new Error('Catalog must be a nonempty array.');
const activeIds = new Set(records.map(record => record.id));
if (activeIds.size !== records.length) fail('Tool IDs must be unique.');
const xFitValues = new Set(['high', 'medium', 'low', 'unknown']);
const statusValues = new Set(['live', 'degraded', 'dropped-x', 'shut-down']);
const apiValues = new Set(['official', 'official-plus-other', 'no-api', 'unclear']);
const jobIds = new Set(['write', 'schedule', 'engage', 'analytics', 'bookmarks', 'listen', 'clean', 'agents', 'dms', 'visuals']);
const networkIds = new Set(['x', 'linkedin', 'bluesky', 'instagram', 'facebook', 'threads', 'tiktok', 'youtube', 'pinterest', 'mastodon', 'reddit']);
const threadSupportValues = new Set(['native', 'split-only', 'queue-only', 'none']);
for (const record of records) {
  const id = record.id;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) fail(`Invalid tool id: ${id}`);
  if (!categoryIds.has(record.cat)) fail(`Unknown primary category for ${id}: ${record.cat}`);
  for (const category of record.categories ?? []) {
    if (!categoryIds.has(category)) fail(`Unknown category for ${id}: ${category}`);
  }
  try {
    const url = new URL(record.url);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
  } catch {
    fail(`Invalid tool URL for ${id}: ${record.url}`);
  }
  if (!xFitValues.has(record.xFit)) fail(`Invalid X-fit for ${id}: ${record.xFit}`);
  if (!statusValues.has(record.status)) fail(`Invalid status for ${id}: ${record.status}`);
  if (!apiValues.has(record.apiStatus)) fail(`Invalid API status for ${id}: ${record.apiStatus}`);
  // Legacy editorial flags are preserved; display eligibility is gated by status and X-fit.
  if (typeof record.editorPick !== 'boolean') fail(`Editor's Pick flag must be boolean for ${id}.`);
  if (record.openSource != null && typeof record.openSource !== 'boolean') fail(`Open-source flag must be boolean for ${id}.`);
  for (const job of record.jobs ?? []) if (!jobIds.has(job)) fail(`Unknown job for ${id}: ${job}`);
  for (const network of record.networks ?? []) if (!networkIds.has(network)) fail(`Unknown network for ${id}: ${network}`);
  if (record.threadSupport && !threadSupportValues.has(record.threadSupport)) fail(`Invalid thread support for ${id}: ${record.threadSupport}`);
  if (record.demoPostUrl && !/^https:\/\/(?:www\.)?(?:x|twitter)\.com\/[^/]+\/status\/\d+/.test(record.demoPostUrl)) fail(`Invalid demo post URL for ${id}.`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Validated ${activeIds.size} tools and ${categoryIds.size} categories.`);
