import {
  ADMIN_COOKIE,
  authCookieHeader,
  isAdminConfigured,
  isAuthed,
  json,
  sessionToken,
  verifyPassword
} from '../../../lib/adminAuth.js';

export const prerender = false;

export async function POST({ request }) {
  if (!isAdminConfigured()) {
    return json(503, { ok: false, error: 'ADMIN_PASSWORD is not set' });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON' });
  }
  if (!verifyPassword(body?.password)) {
    return json(401, { ok: false, error: 'Invalid password' });
  }
  const token = sessionToken();
  return json(200, { ok: true }, { 'Set-Cookie': authCookieHeader(token) });
}

export async function DELETE({ request }) {
  // Allow logout even if not authed (clears stale cookie).
  void request;
  return json(200, { ok: true }, { 'Set-Cookie': authCookieHeader('', { clear: true }) });
}

export async function GET({ request }) {
  if (!isAdminConfigured()) {
    return json(503, { ok: false, error: 'ADMIN_PASSWORD is not set', configured: false });
  }
  return json(200, {
    ok: true,
    configured: true,
    authed: isAuthed(request),
    cookie: ADMIN_COOKIE
  });
}
