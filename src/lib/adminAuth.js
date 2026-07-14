// Simple shared-secret admin auth via httpOnly cookie.

import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_COOKIE = 'xtd_admin';

function adminPassword() {
  return import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
}

function sign(password) {
  return createHmac('sha256', password).update('x-tools-directory-admin').digest('hex');
}

export function isAdminConfigured() {
  return Boolean(adminPassword());
}

export function canWriteCatalog() {
  if (import.meta.env.DEV) return true;
  const flag = import.meta.env.ADMIN_WRITE || process.env.ADMIN_WRITE || '';
  return flag === '1' || flag === 'true';
}

export function verifyPassword(password) {
  const expected = adminPassword();
  if (!expected || !password) return false;
  const a = Buffer.from(String(password));
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function sessionToken() {
  const password = adminPassword();
  if (!password) return '';
  return sign(password);
}

export function parseCookies(request) {
  const header = request.headers.get('cookie') || '';
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i === -1) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    out[k] = decodeURIComponent(v);
  }
  return out;
}

export function isAuthed(request) {
  const token = sessionToken();
  if (!token) return false;
  const cookies = parseCookies(request);
  const got = cookies[ADMIN_COOKIE] || '';
  if (!got || got.length !== token.length) return false;
  try {
    return timingSafeEqual(Buffer.from(got), Buffer.from(token));
  } catch {
    return false;
  }
}

export function authCookieHeader(token, { clear = false } = {}) {
  if (clear) {
    return `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
  }
  const maxAge = 60 * 60 * 12; // 12 hours
  const secure = import.meta.env.PROD ? '; Secure' : '';
  return `${ADMIN_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}
