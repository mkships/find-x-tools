import { timingSafeEqual } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { API_STATUS, BASE_TOOLS, CATS, JOBS, mergeAdminTools, NETWORKS, THREAD_SUPPORT, TOOL_STATUS, X_FIT } from '../../../data/tools.js';

export const prerender = false;

const dataUrl = new URL('../../../data/tool-admin-data.json', import.meta.url);
const dataPath = fileURLToPath(dataUrl);
const adminDataRepoPath = 'src/data/tool-admin-data.json';
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
  const expectedBytes = Buffer.from(expected);
  const suppliedBytes = Buffer.from(supplied);
  if (!expected || suppliedBytes.length !== expectedBytes.length) return false;
  return timingSafeEqual(suppliedBytes, expectedBytes);
}

function githubConfig() {
  const repo = env('GITHUB_REPO');
  const token = env('GITHUB_TOKEN');
  const branch = env('GITHUB_BRANCH') || 'main';
  const validRepo = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo);
  const validBranch = branch && !branch.startsWith('/') && !branch.endsWith('/') && !branch.includes('..');
  return validRepo && validBranch && token ? { repo, token, branch } : null;
}

async function githubRequest(config, path, method = 'GET', body) {
  const repoPath = config.repo.split('/').map(encodeURIComponent).join('/');
  const response = await fetch(`https://api.github.com/repos/${repoPath}/${path}`, {
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

async function readJsonBody(request, maxBytes = 250_000) {
  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > maxBytes) throw new Error('Request body is too large.');
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) throw new Error('Request body is too large.');
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Invalid request body.');
  }
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
  const xFit = Object.hasOwn(X_FIT, input.xFit) ? input.xFit : 'unknown';
  const status = Object.hasOwn(TOOL_STATUS, input.status) ? input.status : 'live';
  const apiStatus = Object.hasOwn(API_STATUS, input.apiStatus) ? input.apiStatus : 'unclear';
  const jobs = [...new Set(Array.isArray(input.jobs) ? input.jobs : [])].filter(job => JOBS[job]);
  const networks = [...new Set(Array.isArray(input.networks) ? input.networks : [])].filter(network => NETWORKS[network]);
  const threadSupport = Object.hasOwn(THREAD_SUPPORT, input.threadSupport) ? input.threadSupport : '';
  const demoPostUrl = cleanText(input.demoPostUrl, 500);
  const launchedAt = cleanText(input.launchedAt, 10);
  if (demoPostUrl && !/^https:\/\/(?:www\.)?(?:x|twitter)\.com\/[^/]+\/status\/\d+/.test(demoPostUrl)) {
    throw new Error('Demo post must be a complete X or Twitter post URL.');
  }
  if (demoPostUrl && !/^\d{4}-\d{2}-\d{2}$/.test(launchedAt)) {
    throw new Error('A launch date is required for a Shipped on X post.');
  }
  if (input.editorPick && (xFit !== 'high' || status !== 'live')) {
    throw new Error("Editor's Picks must be live tools with High X-fit.");
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
    xFit,
    status,
    apiStatus,
    founderBuilt: Boolean(input.founderBuilt),
    openSource: Boolean(input.openSource),
    jobs,
    networks,
    threadSupport,
    notFor: cleanText(input.notFor, 1000),
    startingPrice: cleanText(input.startingPrice, 120),
    editorPickOrder: Number.isSafeInteger(Number(input.editorPickOrder)) && Number(input.editorPickOrder) > 0 ? Number(input.editorPickOrder) : null,
    demoPostUrl,
    demoSummary: cleanText(input.demoSummary, 300),
    founderHandle: cleanText(input.founderHandle, 80).replace(/^@/, ''),
    launchedAt,
    demoImage: /^https?:\/\//.test(cleanText(input.demoImage, 1000)) ? cleanText(input.demoImage, 1000) : '',
    shippedOnXOrder: Number.isSafeInteger(Number(input.shippedOnXOrder)) && Number(input.shippedOnXOrder) > 0 ? Number(input.shippedOnXOrder) : null,
    verificationNotes: cleanText(input.verificationNotes, 3000),
    verificationSources: (Array.isArray(input.verificationSources) ? input.verificationSources : [])
      .map(source => cleanText(source, 500)).filter(source => /^https?:\/\//.test(source)).slice(0, 20),
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
  };
}

export async function GET({ request }) {
  if (!authorized(request)) return json(401, { error: 'Incorrect admin password.' });
  try {
    const data = await readJson(dataPath, adminDataRepoPath);
    return json(200, {
      tools: mergeAdminTools(BASE_TOOLS, data, true).sort((a, b) => a.name.localeCompare(b.name)),
      categories: CATS,
      jobs: JOBS,
      networks: NETWORKS,
      publishingConfigured: !import.meta.env.PROD || Boolean(githubConfig())
    });
  } catch (error) {
    return json(500, { error: error.message });
  }
}

export async function PUT({ request }) {
  if (!authorized(request)) return json(401, { error: 'Incorrect admin password.' });
  try {
    const body = await readJsonBody(request);
    const tool = normalizeTool(body.tool || {});
    const originalId = cleanText(body.originalId, 80);
    if (originalId && !/^[a-z0-9-]+$/.test(originalId)) throw new Error('Original tool id is invalid.');
    const data = await readJson(dataPath, adminDataRepoPath);
    data.records ||= {};
    data.deleted ||= [];
    let listingChanged = JSON.stringify(data.records[tool.id]) !== JSON.stringify(tool)
      || data.deleted.includes(tool.id);
    if (originalId && originalId !== tool.id) {
      delete data.records[originalId];
      if (BASE_TOOLS.some(item => item.id === originalId)) {
        if (!data.deleted.includes(originalId)) data.deleted.push(originalId);
      } else {
        data.deleted = data.deleted.filter(id => id !== originalId);
      }
      listingChanged = true;
    }
    data.records[tool.id] = tool;
    data.deleted = data.deleted.filter(id => id !== tool.id);
    const files = listingChanged ? [{ data, localPath: dataPath, repoPath: adminDataRepoPath }] : [];
    const message = `Update ${tool.name} directory listing`;
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
    const id = cleanText((await readJsonBody(request, 10_000)).id, 80);
    if (!/^[a-z0-9-]+$/.test(id)) throw new Error('A valid tool id is required.');
    const data = await readJson(dataPath, adminDataRepoPath);
    data.records ||= {};
    data.deleted ||= [];
    delete data.records[id];
    const files = [{ data, localPath: dataPath, repoPath: adminDataRepoPath }];
    if (BASE_TOOLS.some(item => item.id === id)) {
      if (!data.deleted.includes(id)) data.deleted.push(id);
    } else {
      data.deleted = data.deleted.filter(deletedId => deletedId !== id);
    }
    const result = await saveJsonFiles(files, `Remove ${id} from directory`);
    return json(200, { ok: true, ...result });
  } catch (error) {
    return json(400, { error: error.message });
  }
}
