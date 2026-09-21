/**
 * @typedef {Object} ToolUseCase
 * @property {string} title
 * @property {string} description
 * @property {string=} icon
 *
 * @typedef {Object} ToolPricingTier
 * @property {string} name
 * @property {string} price
 * @property {string=} cadence
 * @property {string=} description
 * @property {string[]} features
 * @property {boolean=} highlighted
 *
 * @typedef {Object} ToolMention
 * @property {'x'|'youtube'|'linkedin'|'trustpilot'|'g2'|'producthunt'|'other'} source
 * @property {'workflow'|'demo'|'review'|'experience'|'criticism'|'other'=} kind
 * @property {string} author
 * @property {string=} handle
 * @property {string=} context
 * @property {string} text
 * @property {string} url
 * @property {string=} publishedAt
 * @property {string=} lastChecked
 * @property {string=} thumbnail
 * @property {number=} engagement
 * @property {boolean=} demo
 *
 * @typedef {Object} ToolDetail
 * @property {'draft'|'demo'|'researched'=} status
 * @property {string=} listedAt
 * @property {string=} lastChecked
 * @property {ToolUseCase[]=} useCases
 * @property {string[]=} bestFor
 * @property {string[]=} watchOuts
 * @property {ToolPricingTier[]=} pricingTiers
 * @property {string=} pricingNote
 * @property {string=} pricingLastChecked
 * @property {ToolMention[]=} mentions
 */

const cleanList = value => Array.isArray(value) ? value.filter(Boolean) : [];

/**
 * Normalizes optional rich-detail data so every tool page can render safely while
 * the catalog is enriched progressively.
 */
export function normalizeToolDetail(tool) {
  const detail = tool.detail || {};
  const bestFor = cleanList(detail.bestFor);

  return {
    status: detail.status || 'draft',
    listedAt: detail.listedAt || tool.addedAt || null,
    lastChecked: detail.lastChecked || null,
    useCases: cleanList(detail.useCases).filter(item => item?.title && item?.description),
    features: cleanList(tool.features),
    bestFor: bestFor.length ? bestFor : cleanList(tool.best ? [tool.best] : []),
    watchOuts: cleanList(detail.watchOuts),
    pricingTiers: cleanList(detail.pricingTiers).map(tier => ({
      ...tier,
      features: cleanList(tier?.features)
    })).filter(tier => tier.name && tier.price),
    pricingNote: detail.pricingNote || '',
    pricingLastChecked: detail.pricingLastChecked || '',
    mentions: cleanList(detail.mentions).filter(mention => mention?.text && mention?.url),
    isDemo: detail.status === 'demo'
  };
}

export function validateToolDetail(tool) {
  const detail = normalizeToolDetail(tool);
  const errors = [];

  detail.mentions.forEach((mention, index) => {
    if (!mention.author) errors.push(`mentions[${index}].author is required`);
    if (!mention.source) errors.push(`mentions[${index}].source is required`);
  });

  detail.pricingTiers.forEach((tier, index) => {
    if (!Array.isArray(tier.features)) errors.push(`pricingTiers[${index}].features must be an array`);
  });

  return errors;
}
