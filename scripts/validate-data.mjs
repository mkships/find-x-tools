import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const [toolsSource, adminData, curationSource] = await Promise.all([
  readFile(new URL('src/data/tools.js', root), 'utf8'),
  readFile(new URL('src/data/tool-admin-data.json', root), 'utf8').then(JSON.parse),
  readFile(new URL('src/data/catalog-curation.js', root), 'utf8')
]);

const failures = [];
const fail = message => failures.push(message);
const toolDataSource = toolsSource.match(/const TOOL_DATA = \[([\s\S]*?)\n\];/)?.[1] ?? '';
const categorySource = toolsSource.match(/export const CATS = \{([\s\S]*?)\n\};/)?.[1] ?? '';
const baseIds = [...toolDataSource.matchAll(/\bid:'([^']+)'/g)].map(match => match[1]);
const categoryIds = new Set([...categorySource.matchAll(/^\s*([a-z]+):\{/gm)].map(match => match[1]));
const deletedIds = new Set(adminData.deleted ?? []);
const records = adminData.records ?? {};
const activeIds = new Set([...baseIds, ...Object.keys(records)].filter(id => !deletedIds.has(id)));
const xFitValues = new Set(['high', 'medium', 'low', 'unknown']);
const statusValues = new Set(['live', 'degraded', 'dropped-x', 'shut-down']);
const apiValues = new Set(['official', 'official-plus-other', 'no-api', 'unclear']);
const jobIds = new Set(['write', 'schedule', 'engage', 'analytics', 'bookmarks', 'listen', 'clean', 'agents', 'dms', 'visuals']);
const networkIds = new Set(['x', 'linkedin', 'bluesky', 'instagram', 'facebook', 'threads', 'tiktok', 'youtube', 'pinterest', 'mastodon', 'reddit']);
const threadSupportValues = new Set(['native', 'split-only', 'queue-only', 'none']);
const curatedIds = new Set([...curationSource.matchAll(/^\s{2}([a-z0-9]+):\s*\{/gm)].map(match => match[1]));

if (!baseIds.length) fail('No base tool IDs were found.');
if (new Set(baseIds).size !== baseIds.length) fail('Base tool IDs must be unique.');
for (const id of curatedIds) if (!activeIds.has(id) && !baseIds.includes(id)) fail(`Curation metadata has no matching tool: ${id}`);

for (const [id, record] of Object.entries(records)) {
  if (record.id !== id) fail(`Admin record key and id differ: ${id}`);
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
  if (record.xFit && !xFitValues.has(record.xFit)) fail(`Invalid X-fit for ${id}: ${record.xFit}`);
  if (record.status && !statusValues.has(record.status)) fail(`Invalid status for ${id}: ${record.status}`);
  if (record.apiStatus && !apiValues.has(record.apiStatus)) fail(`Invalid API status for ${id}: ${record.apiStatus}`);
  if (record.openSource != null && typeof record.openSource !== 'boolean') fail(`Open-source flag must be boolean for ${id}.`);
  for (const job of record.jobs ?? []) if (!jobIds.has(job)) fail(`Unknown job for ${id}: ${job}`);
  for (const network of record.networks ?? []) if (!networkIds.has(network)) fail(`Unknown network for ${id}: ${network}`);
  if (record.threadSupport && !threadSupportValues.has(record.threadSupport)) fail(`Invalid thread support for ${id}: ${record.threadSupport}`);
  if (record.demoPostUrl && !/^https:\/\/(?:www\.)?(?:x|twitter)\.com\/[^/]+\/status\/\d+/.test(record.demoPostUrl)) fail(`Invalid demo post URL for ${id}.`);
  if (record.editorPick && record.xFit && record.xFit !== 'high') fail(`Editor's Pick must have High X-fit: ${id}`);
  if (record.editorPick && record.status && record.status !== 'live') fail(`Editor's Pick must be live: ${id}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Validated ${activeIds.size} tools and ${categoryIds.size} categories.`);
