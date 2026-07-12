// POST /api/submit — validates a tool submission and appends it to the
// Google Sheet via an Apps Script web-app webhook (SUBMISSIONS_WEBHOOK_URL).
// See README.md § "Submissions → Google Sheets" for the one-time Sheet setup.

export const prerender = false;

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function POST({ request }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json(400, { error: 'Invalid request body.' });
  }

  // Honeypot: real users never fill this hidden field.
  if (data.website) return json(200, { ok: true });

  const name = String(data.name || '').trim();
  const url = String(data.url || '').trim();
  if (!name || name.length > 120) return json(400, { error: 'Please enter the tool name.' });
  if (!/^https?:\/\/.+\..+/.test(url) || url.length > 500) return json(400, { error: 'Please enter a valid website URL.' });

  const row = {
    submittedAt: new Date().toISOString(),
    name,
    url,
    tagline: String(data.tagline || '').slice(0, 300),
    desc: String(data.desc || '').slice(0, 2000),
    category: String(data.category ?? data.cat ?? '').slice(0, 40),
    pricing: String(data.pricing ?? data.price ?? '').slice(0, 20),
    plan: String(data.plan || 'free').slice(0, 20),
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
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) throw new Error(`webhook responded ${res.status}`);
  } catch (err) {
    console.error('Failed to record submission:', err);
    return json(502, { error: 'Could not record your submission. Please try again.' });
  }

  return json(200, { ok: true });
}
