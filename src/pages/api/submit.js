export const prerender = false;

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const MAX_BODY_BYTES = 10_000;

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });

if (import.meta.env.DEV) globalThis.__submitRateBuckets = new Map();
const buckets = (globalThis.__submitRateBuckets ||= new Map());

function clientIp(request) {
  return (request.headers.get('x-forwarded-for') || '').split(',')[0].trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

function allowedOrigins(request) {
  const origins = new Set([new URL(request.url).origin]);
  const site = import.meta.env.SITE_URL || process.env.SITE_URL;
  if (site) {
    try { origins.add(new URL(site).origin); } catch { /* invalid configuration is ignored */ }
  }
  return origins;
}

function originAllowed(request) {
  const origins = allowedOrigins(request);
  const origin = request.headers.get('origin');
  if (origin) {
    try { return origins.has(new URL(origin).origin); } catch { return false; }
  }
  const referer = request.headers.get('referer');
  if (referer) {
    try { return origins.has(new URL(referer).origin); } catch { return false; }
  }
  return false;
}

function rateLimit(ip) {
  const now = Date.now();
  let bucket = buckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + RATE_WINDOW_MS };
    buckets.set(ip, bucket);
  }
  bucket.count += 1;
  return { allowed: bucket.count <= RATE_LIMIT, count: bucket.count, resetAt: bucket.resetAt };
}

export async function POST({ request }) {
  let data;
  try {
    const declaredLength = Number(request.headers.get('content-length') || 0);
    if (declaredLength > MAX_BODY_BYTES) throw new Error('Request body is too large.');
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) throw new Error('Request body is too large.');
    data = JSON.parse(raw);
  } catch {
    return json(400, { error: 'Invalid request body.' });
  }

  if (!originAllowed(request)) {
    return json(403, { error: 'Forbidden.' });
  }

  const rl = rateLimit(clientIp(request));
  if (!rl.allowed) {
    return json(429, { error: 'Too many submissions. Please try again later.' });
  }

  if (data.website) return json(200, { ok: true });

  const name = String(data.name || '').trim();
  const email = String(data.email || '').trim().toLowerCase();
  const url = String(data.url || '').trim();
  const desc = String(data.desc || '').trim();
  const category = String(data.category ?? data.cat ?? '').trim();
  const pricing = String(data.pricing ?? data.price ?? '').trim();
  const demoPostUrl = String(data.demoPostUrl || '').trim();
  if (!name || name.length > 120) return json(400, { error: 'Please enter the tool name.' });
  if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)) {
    return json(400, { error: 'Please enter a valid email address.' });
  }
  let parsedUrl;
  try { parsedUrl = new URL(url); } catch { /* handled below */ }
  if (!parsedUrl || !['http:', 'https:'].includes(parsedUrl.protocol) || !parsedUrl.hostname.includes('.')
    || parsedUrl.username || parsedUrl.password || url.length > 500) {
    return json(400, { error: 'Please enter a valid website URL.' });
  }
  if (!desc || desc.length > 2000) return json(400, { error: 'Please add a short description of the tool.' });
  if (!category || category.length > 80) return json(400, { error: 'Please choose or suggest a category.' });
  if (!['Free', 'Freemium', 'Paid'].includes(pricing)) return json(400, { error: 'Please choose a valid pricing model.' });
  if (demoPostUrl && (!/^https:\/\/(?:www\.)?(?:x|twitter)\.com\/[^/]+\/status\/\d+/.test(demoPostUrl) || demoPostUrl.length > 500)) {
    return json(400, { error: 'Please enter a valid X launch or demo post URL.' });
  }

  const row = {
    submittedAt: new Date().toISOString(),
    name,
    email,
    url,
    tagline: String(data.tagline || '').trim().slice(0, 300),
    desc,
    category,
    pricing,
    demoPostUrl,
    xPrimary: ['yes', 'no'].includes(data.xPrimary) ? data.xPrimary : '',
    apiStatus: ['official', 'official-plus-other', 'no-api', 'unclear'].includes(data.apiStatus) ? data.apiStatus : '',
    networks: String(data.networks || '').trim().slice(0, 300),
    teamSize: ['solo', 'small', 'team'].includes(data.teamSize) ? data.teamSize : '',
    xJobs: String(data.xJobs || '').trim().slice(0, 500),
    status: 'pending review'
  };

  const webhook = import.meta.env.SUBMISSIONS_WEBHOOK_URL || process.env.SUBMISSIONS_WEBHOOK_URL;
  if (!webhook) {
    console.error('SUBMISSIONS_WEBHOOK_URL is not configured');
    return json(503, { error: 'Submissions are temporarily unavailable. Please try again later.' });
  }

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row),
      signal: AbortSignal.timeout(15000),
      redirect: 'follow'
    });
    const raw = await res.text();
    let parsed = null;
    try { parsed = JSON.parse(raw); } catch { /* Apps Script often returns HTML on failure */ }
    if (!(res.ok && parsed && parsed.ok === true)) {
      throw new Error(`webhook responded ${res.status}: ${raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)}`);
    }
  } catch {
    console.error('Failed to record submission');
    return json(502, { error: 'Could not record your submission. Please try again.' });
  }

  return json(200, { ok: true });
}
