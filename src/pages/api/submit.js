// POST /api/submit — validates a tool submission and appends it to the
// Google Sheet via an Apps Script web-app webhook (SUBMISSIONS_WEBHOOK_URL).
// See README.md § "Submissions → Google Sheets" for the one-time Sheet setup.

import { PAID_SUBMISSIONS } from '../../config.js';

export const prerender = false;

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// Best-effort in-memory limiter. Survives warm serverless instances via globalThis;
// cold starts / multi-instance deploys reset the bucket (pair with Turnstile later if needed).
// In local dev, reset on module reload so iterative testing isn't stuck behind a hot bucket.
if (import.meta.env.DEV) globalThis.__submitRateBuckets = new Map();
const buckets = (globalThis.__submitRateBuckets ||= new Map());

function clientIp(request) {
  return (request.headers.get('x-forwarded-for') || '').split(',')[0].trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

function allowedHosts() {
  const hosts = new Set(['localhost', '127.0.0.1', '[::1]']);
  const site = import.meta.env.SITE_URL || process.env.SITE_URL || 'https://x-tools-directory.vercel.app';
  try { hosts.add(new URL(site).hostname); } catch { /* ignore */ }
  // Always allow the current Vercel preview/default host while a custom domain is TBD.
  hosts.add('x-tools-directory.vercel.app');
  return hosts;
}

function originAllowed(request) {
  const hosts = allowedHosts();
  const origin = request.headers.get('origin');
  if (origin) {
    try { return hosts.has(new URL(origin).hostname); } catch { return false; }
  }
  const referer = request.headers.get('referer');
  if (referer) {
    try { return hosts.has(new URL(referer).hostname); } catch { return false; }
  }
  // Browser form POSTs always send Origin; missing both is treated as non-browser abuse.
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
    data = await request.json();
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

  // Honeypot: real users never fill this hidden field.
  if (data.website) return json(200, { ok: true });

  const name = String(data.name || '').trim();
  const email = String(data.email || '').trim().toLowerCase();
  const url = String(data.url || '').trim();
  if (!name || name.length > 120) return json(400, { error: 'Please enter the tool name.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return json(400, { error: 'Please enter a valid email address.' });
  }
  if (!/^https?:\/\/.+\..+/.test(url) || url.length > 500) return json(400, { error: 'Please enter a valid website URL.' });

  const requestedPlan = String(data.plan || 'free').slice(0, 20);
  const plan = PAID_SUBMISSIONS && ['free', 'featured', 'premium'].includes(requestedPlan)
    ? requestedPlan
    : 'free';

  const row = {
    submittedAt: new Date().toISOString(),
    name,
    email,
    url,
    tagline: String(data.tagline || '').slice(0, 300),
    desc: String(data.desc || '').slice(0, 2000),
    category: String(data.category ?? data.cat ?? '').slice(0, 40),
    pricing: String(data.pricing ?? data.price ?? '').slice(0, 20),
    plan,
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
  } catch (err) {
    console.error('Failed to record submission:', err);
    return json(502, { error: 'Could not record your submission. Please try again.' });
  }

  return json(200, { ok: true });
}
