import fs from 'node:fs';
import path from 'node:path';
import { CATS, ICONS, PRICE_STYLES, TOOLS } from '../../../data/tools.js';
import {
  canWriteCatalog,
  isAdminConfigured,
  isAuthed,
  json
} from '../../../lib/adminAuth.js';
import { normalizeTool, richCompleteness, serializeCatalogFile } from '../../../lib/catalog.js';

export const prerender = false;

function catalogPath() {
  return path.join(process.cwd(), 'src/data/tools.js');
}

function requireAuth(request) {
  if (!isAdminConfigured()) {
    return json(503, { ok: false, error: 'ADMIN_PASSWORD is not set' });
  }
  if (!isAuthed(request)) {
    return json(401, { ok: false, error: 'Unauthorized' });
  }
  return null;
}

export async function GET({ request }) {
  const denied = requireAuth(request);
  if (denied) return denied;

  const tools = TOOLS.map(t => ({
    ...t,
    _rich: richCompleteness(t)
  }));

  return json(200, {
    ok: true,
    canWrite: canWriteCatalog(),
    cats: CATS,
    tools
  });
}

export async function PUT({ request }) {
  const denied = requireAuth(request);
  if (denied) return denied;

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON' });
  }

  const incoming = body?.tools;
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return json(400, { ok: false, error: 'tools array required' });
  }

  // Merge by id against known catalog so we never drop tools accidentally.
  const byId = new Map(TOOLS.map(t => [t.id, t]));
  const seen = new Set();
  const merged = [];

  for (const raw of incoming) {
    if (!raw?.id || !byId.has(raw.id)) {
      return json(400, { ok: false, error: `Unknown or missing tool id: ${raw?.id || '(empty)'}` });
    }
    if (seen.has(raw.id)) {
      return json(400, { ok: false, error: `Duplicate tool id: ${raw.id}` });
    }
    seen.add(raw.id);
    const prev = byId.get(raw.id);
    merged.push(normalizeTool({
      ...prev,
      ...raw,
      id: prev.id,
      // Keep core identity fields unless explicitly provided
      name: raw.name ?? prev.name,
      cat: raw.cat ?? prev.cat,
      url: raw.url ?? prev.url
    }));
  }

  if (seen.size !== TOOLS.length) {
    return json(400, {
      ok: false,
      error: `Expected ${TOOLS.length} tools, got ${seen.size}. Send the full catalog.`
    });
  }

  // Preserve original order from the file.
  const ordered = TOOLS.map(t => merged.find(m => m.id === t.id));
  const file = serializeCatalogFile({ CATS, ICONS, PRICE_STYLES, TOOLS: ordered });

  let written = false;
  if (canWriteCatalog()) {
    try {
      fs.writeFileSync(catalogPath(), file, 'utf8');
      written = true;
    } catch (err) {
      return json(500, {
        ok: false,
        error: `Write failed: ${err.message}`,
        file,
        written: false
      });
    }
  }

  return json(200, {
    ok: true,
    written,
    canWrite: canWriteCatalog(),
    file,
    message: written
      ? 'Catalog written to src/data/tools.js'
      : 'Filesystem write disabled — download the file and commit it'
  });
}
