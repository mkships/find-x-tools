// Catalog definitions and helpers. Tool records live only in tools.json.
import catalog from './tools.json';

export const JOBS = {
  write: { label: 'Write posts & threads' },
  schedule: { label: 'Schedule & publish' },
  engage: { label: 'Reply & engage' },
  analytics: { label: 'Analyze performance' },
  bookmarks: { label: 'Organize bookmarks' },
  listen: { label: 'Listen & monitor' },
  clean: { label: 'Clean your account' },
  agents: { label: 'Post from an agent' },
  dms: { label: 'Manage DMs' },
  visuals: { label: 'Create X visuals' }
};

export const NETWORKS = {
  x: 'X',
  linkedin: 'LinkedIn',
  bluesky: 'Bluesky',
  instagram: 'Instagram',
  facebook: 'Facebook',
  threads: 'Threads',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  pinterest: 'Pinterest',
  mastodon: 'Mastodon',
  reddit: 'Reddit'
};

export const X_FIT = {
  high: { label: 'High', description: 'X is the product or the core job.' },
  medium: { label: 'Medium', description: 'Multi-network, with a meaningful first-class X workflow.' },
  low: { label: 'Low', description: 'X is incidental or a limited part of the product.' },
  unknown: { label: 'Not rated', description: 'X fit has not been independently verified yet.' }
};

export const TOOL_STATUS = {
  live: { label: 'Live' },
  degraded: { label: 'Degraded' },
  'dropped-x': { label: 'Dropped X' },
  'shut-down': { label: 'Shut down' }
};

export const API_STATUS = {
  official: { label: 'Official API' },
  'official-plus-other': { label: 'Official API + other data' },
  'no-api': { label: 'No API (extension / local)' },
  unclear: { label: 'Unclear' }
};

export const THREAD_SUPPORT = {
  native: { label: 'Native', description: 'Write, preview, and publish a connected reply chain.' },
  'split-only': { label: 'Split only', description: 'Splits a long draft into X-sized chunks for manual posting.' },
  'queue-only': { label: 'Queue only', description: 'Schedules several standalone posts rather than a connected thread.' },
  none: { label: 'None', description: 'Does not provide a connected-thread composer.' }
};

const STATUS_ORDER = { live: 0, degraded: 1, 'dropped-x': 2, 'shut-down': 3 };
const X_FIT_ORDER = { high: 0, medium: 1, low: 2, unknown: 3 };

export function compareTools(a, b) {
  return (STATUS_ORDER[a.status] ?? 4) - (STATUS_ORDER[b.status] ?? 4)
    || (X_FIT_ORDER[a.xFit] ?? 4) - (X_FIT_ORDER[b.xFit] ?? 4)
    || Number(Boolean(b.editorPick)) - Number(Boolean(a.editorPick))
    || a.name.localeCompare(b.name);
}

export const CATS = {
  content:{label:'Content Writing',color:'#1D9BF0'},
  growth:{label:'Growth & Audience',color:'#00BA7C'},
  schedule:{label:'Scheduling & Automation',color:'#7856FF'},
  analytics:{label:'Analytics',color:'#FF7A00'},
  ai:{label:'AI Reply & Engagement',color:'#F91880'},
  design:{label:'Design & Media',color:'#00A9C0'},
  audit:{label:'Profile Audit',color:'#E8A400'},
  bookmarks:{label:'Bookmarks & Saves',color:'#5B6EF5'},
  bio:{label:'Bio Link Tools',color:'#14B8A6'},
  listening:{label:'Social Listening',color:'#8B5CF6'}
};

export const ICONS = {all:'🗂️',content:'✍️',growth:'📈',schedule:'🗓️',analytics:'📊',ai:'🤖',design:'🎨',audit:'🔍',bookmarks:'🔖',bio:'🔗',listening:'👂'};

export const PRICE_STYLES = {
  Free:{bg:'#E3F7EF',fg:'#00875A'},
  Freemium:{bg:'#E8F3FE',fg:'#1478C4'},
  Paid:{bg:'#F0EDFB',fg:'#5B3FD6'}
};

export function isXNative(tool) {
  return tool.networks?.length === 1 && tool.networks[0] === 'x' && ['live', 'degraded'].includes(tool.status);
}

export const ALL_TOOLS = catalog;
export const TOOLS = ALL_TOOLS.filter(tool => tool.published !== false);
