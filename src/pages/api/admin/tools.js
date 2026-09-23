import { timingSafeEqual } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { BASE_TOOLS, CATS, mergeAdminTools } from '../../../data/tools.js';

export const prerender = false;

const dataUrl = new URL('../../../data/tool-admin-data.json', import.meta.url);
const dataPath = fileURLToPath(dataUrl);
const scoresUrl = new URL('../../../data/popularity-scores.json', import.meta.url);
const scoresPath = fileURLToPath(scoresUrl);
const adminDataRepoPath = 'src/data/tool-admin-data.json';
const scoresRepoPath = 'src/data/popularity-scores.json';
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

async function githubRequest(config, path, method = 'GET', body) {
  const response = await fetch(`https://api.github.com/repos/${config.repo}/${path}`, {
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

async function readJson(localPath, repoPath) {
  const config = githubConfig();
  if (!import.meta.env.PROD || !config) {
    return JSON.parse(await readFile(localPath, 'utf8'));
  }
  const file = await githubRequest(config, `contents/${repoPath}?ref=${encodeURIComponent(config.branch)}`);
  return JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
}

async function saveJsonFiles(files, message) {
  const config = githubConfig();
  if (!import.meta.env.PROD) {
    await Promise.all(files.map(file => writeFile(file.localPath, `${JSON.stringify(file.data, null, 2)}\n`, 'utf8')));
    return { mode: 'local' };
  }
  if (!config) throw new Error('GitHub publishing is not configured.');

  const branchPath = config.branch.split('/').map(encodeURIComponent).join('/');
  const reference = await githubRequest(config, `git/ref/heads/${branchPath}`);
  const parentSha = reference.object.sha;
  const parentCommit = await githubRequest(config, `git/commits/${parentSha}`);
  const blobs = await Promise.all(files.map(file => githubRequest(config, 'git/blobs', 'POST', {
    content: `${JSON.stringify(file.data, null, 2)}\n`,
    encoding: 'utf-8'
  })));
  const tree = await githubRequest(config, 'git/trees', 'POST', {
    base_tree: parentCommit.tree.sha,
    tree: files.map((file, index) => ({
      path: file.repoPath,
      mode: '100644',
      type: 'blob',
      sha: blobs[index].sha
    }))
  });
  const commit = await githubRequest(config, 'git/commits', 'POST', {
    message,
    tree: tree.sha,
    parents: [parentSha]
  });
  await githubRequest(config, `git/refs/heads/${branchPath}`, 'PATCH', {
    sha: commit.sha,
    force: false
  });
  return { mode: 'github', commit: commit.html_url || '' };
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
  const popularityScore = Number(input.popularityScore);
  if (!Number.isSafeInteger(popularityScore) || popularityScore < 0) {
    throw new Error('Popularity score must be a whole number of zero or more.');
  }

  const capability = value => ['yes', 'no', 'unknown'].includes(value) ? value : 'unknown';
  const inputDetail = input.detail && typeof input.detail === 'object' ? input.detail : {};
  const pricingTiers = (Array.isArray(inputDetail.pricingTiers) ? inputDetail.pricingTiers : [])
    .map(tier => ({
      name: cleanText(tier?.name, 120),
      price: cleanText(tier?.price, 120),
      cadence: 'per month',
      description: cleanText(tier?.description, 1000),
      features: (Array.isArray(tier?.features) ? tier.features : [])
        .map(feature => cleanText(feature, 300)).filter(Boolean).slice(0, 20)
    }))
    .filter(tier => tier.name && tier.price)
    .slice(0, 12);
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
    sponsored: Boolean(input.sponsored),
    freePlan: capability(input.freePlan),
    mobileApp: capability(input.mobileApp),
    apiAccess: capability(input.apiAccess),
    addedAt: cleanText(input.addedAt, 10) || new Date().toISOString().slice(0, 10),
    lastChecked: cleanText(input.lastChecked, 10),
    detail: {
      pricingTiers,
      pricingNote: cleanText(inputDetail.pricingNote, 1000),
      pricingLastChecked: cleanText(inputDetail.pricingLastChecked, 10)
    },
    popularityScore
  };
}

export async function GET({ request }) {
  if (!authorized(request)) return json(401, { error: 'Incorrect admin password.' });
  try {
    const [data, scores] = await Promise.all([
      readJson(dataPath, adminDataRepoPath),
      readJson(scoresPath, scoresRepoPath)
    ]);
    return json(200, {
      tools: mergeAdminTools(BASE_TOOLS, data, true, scores).sort((a, b) => a.name.localeCompare(b.name)),
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
    const [data, scores] = await Promise.all([
      readJson(dataPath, adminDataRepoPath),
      readJson(scoresPath, scoresRepoPath)
    ]);
    const scoreChanged = scores[tool.id] !== tool.popularityScore;
    scores[tool.id] = tool.popularityScore;
    data.records ||= {};
    data.deleted ||= [];
    const { popularityScore, ...toolRecord } = tool;
    const listingChanged = JSON.stringify(data.records[tool.id]) !== JSON.stringify(toolRecord)
      || data.deleted.includes(tool.id);
    data.records[tool.id] = toolRecord;
    data.deleted = data.deleted.filter(id => id !== tool.id);
    const files = [];
    if (scoreChanged) files.push({ data: scores, localPath: scoresPath, repoPath: scoresRepoPath });
    if (listingChanged) files.push({ data, localPath: dataPath, repoPath: adminDataRepoPath });
    const message = scoreChanged && listingChanged
      ? `Update ${tool.name} directory listing and popularity score`
      : scoreChanged
        ? `Update ${tool.name} popularity score`
        : `Update ${tool.name} directory listing`;
    const result = files.length
      ? await saveJsonFiles(files, message)
      : { mode: import.meta.env.PROD ? 'github' : 'local', commit: '' };
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
    const data = await readJson(dataPath, adminDataRepoPath);
    data.records ||= {};
    data.deleted ||= [];
    delete data.records[id];
    if (!data.deleted.includes(id)) data.deleted.push(id);
    const result = await saveJsonFiles([
      { data, localPath: dataPath, repoPath: adminDataRepoPath }
    ], `Remove ${id} from directory`);
    return json(200, { ok: true, ...result });
  } catch (error) {
    return json(400, { error: error.message });
  }
}
