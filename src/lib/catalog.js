// Helpers for rewriting src/data/tools.js from the admin CRM.

function serializeValue(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    if (typeof value[0] === 'object' && value[0] !== null) {
      return '[' + value.map(serializeValue).join(',') + ']';
    }
    return '[' + value.map(serializeValue).join(',') + ']';
  }
  if (typeof value === 'object') {
    return '{' + Object.entries(value).map(([k, v]) => `${k}:${serializeValue(v)}`).join(',') + '}';
  }
  return JSON.stringify(String(value));
}

/** Preferred key order for stable, readable catalog rows. */
const TOOL_KEYS = [
  'id', 'name', 'cat', 'price', 'url', 'trendingScore', 'addedAt',
  'verified', 'featured', 'color', 'tagline', 'desc', 'best', 'features',
  'useCases', 'watchOuts', 'pricingNote', 'faqs', 'lastChecked', 'quotes'
];

function isEmptyRich(value) {
  if (value == null) return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'string' && !value.trim()) return true;
  return false;
}

export function normalizeTool(tool) {
  const out = {};
  for (const key of TOOL_KEYS) {
    if (!(key in tool)) continue;
    const value = tool[key];
    // Drop empty optional rich fields so thin tools stay compact.
    if (['useCases', 'watchOuts', 'pricingNote', 'faqs', 'lastChecked', 'quotes'].includes(key) && isEmptyRich(value)) {
      continue;
    }
    out[key] = value;
  }
  // Preserve any unexpected keys last (forward-compat).
  for (const [key, value] of Object.entries(tool)) {
    if (key in out) continue;
    out[key] = value;
  }
  return out;
}

export function serializeTool(tool) {
  const t = normalizeTool(tool);
  return '{' + Object.entries(t).map(([k, v]) => `${k}:${serializeValue(v)}`).join(',') + '}';
}

export function serializeCatalogFile({ CATS, ICONS, PRICE_STYLES, TOOLS }) {
  const header = `// Catalog data for X Tools Directory.
// \`trendingScore\` — editorial weight for Trending / Recommended sorts (never displayed).
// \`addedAt\` — listing date (YYYY-MM-DD) for Recently Added sorts.
// \`verified\` — team-checked functionality and use-cases (shown as Verified badge).
// Optional rich detail fields (omit or leave empty; UI hides missing sections):
//   useCases[], watchOuts[], pricingNote, faqs[{q,a}], lastChecked, quotes[{source,author,text,url,date}]
// Fabricated rating/year/user-count display fields were removed 2026-07.

`;

  const cats = 'export const CATS = ' + serializeValue(CATS) + ';\n\n';
  const icons = 'export const ICONS = ' + serializeValue(ICONS) + ';\n\n';
  const prices = 'export const PRICE_STYLES = ' + serializeValue(PRICE_STYLES) + ';\n\n';
  const tools = 'export const TOOLS = [\n' +
    TOOLS.map(t => '  ' + serializeTool(t)).join(',\n') +
    '\n];\n';

  return header + cats + icons + prices + tools;
}

export function richCompleteness(tool) {
  let n = 0;
  if (tool.useCases?.length) n++;
  if (tool.watchOuts?.length) n++;
  if (tool.pricingNote) n++;
  if (tool.faqs?.length) n++;
  if (tool.lastChecked) n++;
  if (tool.quotes?.length) n++;
  return n;
}
