import { timingSafeEqual } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { BASE_TOOLS, CATS, mergeAdminTools } from '../../../data/tools.js';

export const prerender = false;

const dataUrl = new URL('../../../data/tool-admin-data.json', import.meta.url);
const dataPath = fileURLToPath(dataUrl);
const json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
});

function env(name) {
  return import.meta.env[name] || process.env[name] || '';
}

function authorized(request) {
  const expected = env('ADMIN_PASSWORD');
  const supplied = request.headers.get('x-admin-password') || '';
  if (!expected || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

function githubConfig() {
  const repo = env('GITHUB_REPO');
  const token = env('GITHUB_TOKEN');
  const branch = env('GITHUB_BRANCH') || 'main';
  return repo && token ? { repo, token, branch } : null;
}

async function githubRequest(config, method = 'GET', body) {
  const path = 'src/data/tool-admin-data.json';
  const response = await fetch(`https://api.github.com/repos/${config.repo}/contents/${path}?ref=${encodeURIComponent(config.branch)}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${config.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'x-tools-directory-admin',
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || `GitHub returned ${response.status}`);
  return result;
}

async function readData() {
  const config = githubConfig();
  if (!import.meta.env.PROD || !config) {
    return JSON.parse(await readFile(dataPath, 'utf8'));
  }
  const file = await githubRequest(config);
  return JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
}

async function saveData(data, message) {
  const content = `${JSON.stringify(data, null, 2)}\n`;
  const config = githubConfig();
  if (!import.meta.env.PROD) {
    await writeFile(dataPath, content, 'utf8');
    return { mode: 'local' };
  }
  if (!config) throw new Error('GitHub publishing is not configured.');
  const current = await githubRequest(config);
  const result = await githubRequest(config, 'PUT', {
    message,
    content: Buffer.from(content).toString('base64'),
    sha: current.sha,
    branch: config.branch
  });
  return { mode: 'github', commit: result.commit?.html_url || '' };
}

function cleanText(value, max = 5000) {
  return String(value ?? '').trim().slice(0, max);
}

function normalizeTool(input) {
  const id = cleanText(input.id, 80).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
  const name = cleanText(input.name, 120);
  const url = cleanText(input.url, 500);
  const cat = cleanText(input.cat, 80);
  const rawIcon = cleanText(input.icon, 1000);
  const icon = /^https?:\/\//.test(rawIcon) ? rawIcon : '';
  const categories = [...new Set([cat, ...(Array.isArray(input.categories) ? input.categories : [])])].filter(key => CATS[key]);
  if (!id || !name) throw new Error('A name and URL slug are required.');
  if (!/^https?:\/\//.test(url)) throw new Error('Tool URL must begin with http:// or https://.');
  if (!CATS[cat]) throw new Error('Choose a valid primary category.');
  if (!['Free', 'Freemium', 'Paid'].includes(input.price)) throw new Error('Choose a valid pricing model.');

  const capability = value => ['yes', 'no', 'unknown'].includes(value) ? value : 'unknown';
  return {
    id,
    name,
    published: input.published !== false,
    icon,
    url,
    tagline: cleanText(input.tagline, 300),
    desc: cleanText(input.desc, 3000),
    cat,
    categories,
    price: input.price,
    best: cleanText(input.best, 1000),
    color: /^#[0-9a-f]{6}$/i.test(input.color) ? input.color : '#1D9BF0',
    features: (Array.isArray(input.features) ? input.features : []).map(item => cleanText(item, 300)).filter(Boolean).slice(0, 20),
    tested: Boolean(input.tested),
    editorPick: Boolean(input.editorPick),
    verified: Boolean(input.verified),
    featured: Boolean(input.featured),
    sponsored: Boolean(input.sponsored),
    freePlan: capability(input.freePlan),
    mobileApp: capability(input.mobileApp),
    apiAccess: capability(input.apiAccess),
    addedAt: cleanText(input.addedAt, 10) || new Date().toISOString().slice(0, 10),
    lastChecked: cleanText(input.lastChecked, 10)
  };
}

export async function GET({ request }) {
  if (!authorized(request)) return json(401, { error: 'Incorrect admin password.' });
  try {
    const data = await readData();
    return json(200, {
      tools: mergeAdminTools(BASE_TOOLS, data, true).sort((a, b) => a.name.localeCompare(b.name)),
      categories: CATS,
      publishingConfigured: !import.meta.env.PROD || Boolean(githubConfig())
    });
  } catch (error) {
    return json(500, { error: error.message });
  }
}

export async function PUT({ request }) {
  if (!authorized(request)) return json(401, { error: 'Incorrect admin password.' });
  try {
    const tool = normalizeTool((await request.json()).tool || {});
    const data = await readData();
    data.records ||= {};
    data.deleted ||= [];
    data.records[tool.id] = tool;
    data.deleted = data.deleted.filter(id => id !== tool.id);
    const result = await saveData(data, `Update ${tool.name} directory listing`);
    return json(200, { ok: true, tool, ...result });
  } catch (error) {
    return json(400, { error: error.message });
  }
}

export async function DELETE({ request }) {
  if (!authorized(request)) return json(401, { error: 'Incorrect admin password.' });
  try {
    const id = cleanText((await request.json()).id, 80);
    if (!id) throw new Error('Tool id is required.');
    const data = await readData();
    data.records ||= {};
    data.deleted ||= [];
    delete data.records[id];
    if (!data.deleted.includes(id)) data.deleted.push(id);
    const result = await saveData(data, `Remove ${id} from directory`);
    return json(200, { ok: true, ...result });
  } catch (error) {
    return json(400, { error: error.message });
  }
}
