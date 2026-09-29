import { access, readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

const outputDirectory = new URL('../dist/client/', import.meta.url);
const failures = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  }));
  return nested.flat();
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

const files = await walk(outputDirectory.pathname);
const htmlFiles = files.filter(file => file.endsWith('.html'));

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const source = relative(outputDirectory.pathname, file);
  if (!/<title>[^<]+<\/title>/.test(html)) failures.push(`${source}: missing page title`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) failures.push(`${source}: missing meta description`);
  if (!/<link rel="canonical" href="https?:\/\//.test(html)) failures.push(`${source}: missing canonical URL`);

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) failures.push(`${source}: duplicate ids: ${[...new Set(duplicates)].join(', ')}`);

  const references = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map(match => match[1]);
  for (const reference of references) {
    if (/^(?:https?:|mailto:|tel:|data:|#)/.test(reference)) continue;
    const parsed = new URL(reference, 'https://local.test/');
    if (parsed.pathname.startsWith('/api/')) continue;
    const decodedPath = decodeURIComponent(parsed.pathname);
    const target = decodedPath.endsWith('/')
      ? join(outputDirectory.pathname, decodedPath, 'index.html')
      : join(outputDirectory.pathname, decodedPath);
    if (!(await exists(target))) failures.push(`${source}: broken internal reference ${reference}`);
  }
}

const sitemap = await readFile(new URL('sitemap-0.xml', outputDirectory), 'utf8');
if (sitemap.includes('/admin/')) failures.push('sitemap-0.xml: private admin route must not be indexed');
if (!(await exists(new URL('robots.txt', outputDirectory)))) failures.push('robots.txt was not generated');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} generated HTML pages and their internal references.`);
