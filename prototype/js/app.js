// X Tools Directory — vanilla JS SPA implementing the Claude Design prototype.
// Routing: hash-based (#/, #/browse, #/tool/:id, #/submit, #/about).

const state = {
  screen: 'home',
  cat: 'all',
  price: 'All',
  sort: 'popular',
  query: '',
  activeId: null,
  step: 1,
  submitted: false,
  form: { name: '', url: '', tagline: '', desc: '', cat: 'content', price: 'Freemium', plan: 'free' }
};

const PLANS = [
  { id: 'free', name: 'Free listing', price: '$0', desc: 'Standard placement in the directory. Reviewed within ~5 days.' },
  { id: 'featured', name: 'Featured', price: '$49', desc: '★ Featured badge and top-of-category placement for 30 days.' },
  { id: 'premium', name: 'Premium spotlight', price: '$99/mo', desc: 'Homepage sponsored slot, featured badge and a newsletter mention.' }
];

const app = document.getElementById('app');

/* ---------- helpers ---------- */

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function fmt(n) {
  return n >= 1000 ? (n % 1000 === 0 ? (n / 1000) + 'K' : (n / 1000).toFixed(1) + 'K') : String(n || 0);
}

function catCounts() {
  const counts = {};
  TOOLS.forEach(t => { counts[t.cat] = (counts[t.cat] || 0) + 1; });
  return counts;
}

function sortList(list) {
  const s = state.sort;
  const a = [...list];
  if (s === 'popular') a.sort((x, y) => y.users - x.users);
  else if (s === 'rating') a.sort((x, y) => y.rating - x.rating);
  else if (s === 'recent') a.sort((x, y) => y.year - x.year || y.users - x.users);
  return a;
}

function applyFilters(usePrice) {
  const q = state.query.trim().toLowerCase();
  return TOOLS.filter(t => {
    if (state.cat !== 'all' && t.cat !== state.cat) return false;
    if (usePrice && state.price !== 'All' && t.price !== state.price) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q) || CATS[t.cat].label.toLowerCase().includes(q))) return false;
    return true;
  });
}

/* ---------- routing ---------- */

function routeFromHash() {
  const h = location.hash.replace(/^#/, '');
  if (h.startsWith('/tool/')) {
    state.screen = 'detail';
    state.activeId = decodeURIComponent(h.slice('/tool/'.length));
  } else if (h === '/browse') state.screen = 'browse';
  else if (h === '/submit') state.screen = 'submit';
  else if (h === '/about') state.screen = 'about';
  else state.screen = 'home';
}

function nav(hash) {
  if (location.hash === hash) { render(); window.scrollTo({ top: 0 }); }
  else location.hash = hash;
}

window.addEventListener('hashchange', () => {
  routeFromHash();
  render();
  window.scrollTo({ top: 0 });
});

/* ---------- shared partials ---------- */

function toolCardHTML(t) {
  const cat = CATS[t.cat] || {};
  const p = PRICE_STYLES[t.price] || PRICE_STYLES.Freemium;
  const initial = (t.name || '?').trim().charAt(0).toUpperCase();
  return `
    <div class="tool-card" data-action="open-tool" data-id="${esc(t.id)}">
      <div class="tool-card-top">
        <div class="tile" style="background:${esc(t.color || '#1D9BF0')}">${esc(initial)}</div>
        <div class="tool-card-body">
          <div class="tool-card-title">
            <span class="name">${esc(t.name)}</span>
            ${t.verified ? '<span class="badge-verified" title="Verified">✓</span>' : ''}
            ${t.featured ? '<span class="badge-featured">★ Featured</span>' : ''}
          </div>
          <p class="tool-card-tagline">${esc(t.tagline)}</p>
        </div>
      </div>
      <div class="tool-card-foot">
        <span class="cat-chip">${esc(cat.label || 'Tool')}</span>
        <span class="users-chip">↗ ${fmt(t.users)}</span>
        <span class="price-badge" style="background:${p.bg};color:${p.fg}">${esc(t.price || 'Freemium')}</span>
      </div>
    </div>`;
}

function categorySidebarHTML() {
  const counts = catCounts();
  const row = (key, label, count) => `
    <div class="cat-row${state.cat === key ? ' active' : ''}" data-action="select-cat" data-cat="${key}">
      <span class="icon">${ICONS[key] || '•'}</span>
      <span class="label">${esc(label)}</span>
      <span class="count">${count}</span>
    </div>`;
  return `
    <aside class="sidebar">
      <div class="sidebar-label">Categories</div>
      <div class="cat-list">
        ${row('all', 'All Tools', TOOLS.length)}
        ${Object.keys(CATS).map(k => row(k, CATS[k].label, counts[k] || 0)).join('')}
      </div>
    </aside>`;
}

function headerHTML() {
  return `
    <header class="header">
      <div class="header-inner">
        <div class="logo" data-action="go-home">
          <div class="logo-badge"><img src="assets/x-white.png" alt="X"></div>
          <span class="logo-text">Tools<span> Directory</span></span>
        </div>
        <nav class="nav">
          <span class="nav-link" data-action="go-browse-all">Browse Tools</span>
          <span class="nav-link" data-action="go-categories">Categories</span>
          <span class="nav-link" data-action="go-about">About</span>
        </nav>
        <div class="header-right">
          <div class="search-pill">
            <span class="glyph">⌕</span>
            <input data-input="query" value="${esc(state.query)}" placeholder="Search tools…">
          </div>
          <button class="btn-submit-header" data-action="go-submit">Submit a Tool</button>
        </div>
      </div>
    </header>`;
}

function footerHTML() {
  const footerCats = Object.keys(CATS).slice(0, 6).map(k =>
    `<span data-action="select-cat-browse" data-cat="${k}">${esc(CATS[k].label)}</span>`).join('');
  return `
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="footer-logo">
            <div class="footer-logo-badge"><img src="assets/x-black.png" alt="X"></div>
            <span>Tools Directory</span>
          </div>
          <p>The independent directory of tools for growing on X — hand-curated for creators, marketers and agencies. Not affiliated with X Corp.</p>
          <span class="badge-updated"><span class="dot"></span>Updated weekly</span>
        </div>
        <div>
          <div class="footer-col-label">Categories</div>
          <div class="footer-links">${footerCats}</div>
        </div>
        <div>
          <div class="footer-col-label">Resources</div>
          <div class="footer-links">
            <span data-action="go-browse-all">Browse All Tools</span>
            <span data-action="go-submit">Submit a Tool</span>
            <span data-action="go-about">About</span>
            <span>Contact</span>
          </div>
        </div>
        <div>
          <div class="footer-col-label">Legal</div>
          <div class="footer-links">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Advertise</span>
          </div>
        </div>
      </div>
      <div class="footer-bar">
        <div class="footer-bar-inner">
          <span>© 2026 X Tools Directory. All rights reserved.</span>
          <span class="right">Built for the X creator community</span>
        </div>
      </div>
    </footer>`;
}

/* ---------- screens ---------- */

function homeHTML() {
  const counts = catCounts();
  const heroChips = Object.keys(CATS).slice(0, 6).map(k =>
    `<span class="hero-chip" data-action="select-cat-browse" data-cat="${k}">${esc(CATS[k].label)}</span>`).join('');
  const featured = TOOLS.filter(t => t.featured).slice(0, 3);
  const popularActive = state.sort === 'popular' || state.sort === 'rating';
  return `
    <main>
      <section class="hero">
        <div class="hero-glow"></div>
        <div class="hero-inner">
          <div class="hero-badge">🚀 ${TOOLS.length} X-native tools, hand-curated</div>
          <h1>Every tool to grow<br>on <span class="grad-text">X, in one place</span></h1>
          <p>Discover, compare and pick the best tools for content, growth, scheduling, analytics and engagement on X.</p>
          <div class="hero-search">
            <input data-input="query" value="${esc(state.query)}" placeholder="Search X tools — e.g. Content Writing, Scheduling, Analytics…">
            <button data-action="go-browse">Search</button>
          </div>
          <div class="hero-chips">${heroChips}</div>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <h2>Featured tools</h2>
          <span class="badge-sponsored">Sponsored</span>
          <span class="link-view-all" data-action="go-browse">View all →</span>
        </div>
        <div class="grid-featured">${featured.map(toolCardHTML).join('')}</div>
      </section>

      <section class="section-home-main">
        <div class="layout-sidebar">
          ${categorySidebarHTML()}
          <div>
            <div class="toolbar">
              <div class="seg">
                <span class="seg-btn${popularActive ? ' active' : ''}" data-action="tab-popular">📈 Popular Tools</span>
                <span class="seg-btn${state.sort === 'recent' ? ' active' : ''}" data-action="tab-recent">🕘 Recently Added</span>
              </div>
              <span class="count-label" id="homeCount"></span>
            </div>
            <div class="grid-tools" id="homeGrid"></div>
            <div style="margin-top:28px;text-align:center">
              <button class="btn-view-all" data-action="go-browse">View all ${TOOLS.length} tools →</button>
            </div>
          </div>
        </div>
      </section>
    </main>`;
}

function updateHomeResults() {
  const all = sortList(applyFilters(false));
  const grid = document.getElementById('homeGrid');
  const count = document.getElementById('homeCount');
  if (!grid) return;
  grid.innerHTML = all.slice(0, 9).map(toolCardHTML).join('');
  count.textContent = all.length + ' tool' + (all.length === 1 ? '' : 's') +
    (state.cat === 'all' ? '' : ' in ' + CATS[state.cat].label);
}

function browseHTML() {
  const title = state.cat === 'all' ? 'All tools' : CATS[state.cat].label;
  const crumb = state.cat === 'all' ? 'Directory / All Tools' : 'Directory / Tools / ' + CATS[state.cat].label;
  const chips = ['All', 'Free', 'Freemium', 'Paid'].map(p =>
    `<span class="seg-sq-btn${state.price === p ? ' active' : ''}" data-action="select-price" data-price="${p}">${p}</span>`).join('');
  return `
    <main class="page">
      <div style="margin-bottom:22px">
        <div class="crumb">${esc(crumb)}</div>
        <h1 class="page-title">${esc(title)}</h1>
      </div>
      <div class="browse-controls">
        <div class="search-box">
          <span class="glyph">⌕</span>
          <input data-input="query" value="${esc(state.query)}" placeholder="Search tools…">
        </div>
        <div class="seg-sq">${chips}</div>
        <select class="sort-select" data-input="sort">
          <option value="popular"${state.sort === 'popular' ? ' selected' : ''}>Sort: Popular</option>
          <option value="rating"${state.sort === 'rating' ? ' selected' : ''}>Sort: Top rated</option>
          <option value="recent"${state.sort === 'recent' ? ' selected' : ''}>Sort: Recently added</option>
        </select>
      </div>
      <div class="layout-sidebar">
        ${categorySidebarHTML()}
        <div id="browseResults"></div>
      </div>
    </main>`;
}

function updateBrowseResults() {
  const wrap = document.getElementById('browseResults');
  if (!wrap) return;
  const results = sortList(applyFilters(true));
  const countLabel = `<div class="results-count">${results.length} result${results.length === 1 ? '' : 's'}</div>`;
  if (results.length > 0) {
    wrap.innerHTML = countLabel + `<div class="grid-tools">${results.map(toolCardHTML).join('')}</div>`;
  } else {
    wrap.innerHTML = countLabel + `
      <div class="empty-state">
        <div class="glyph">⌕</div>
        <div class="title">No tools match your filters</div>
        <p>Try clearing the search or picking another category.</p>
        <button class="btn-dark" data-action="clear-filters">Clear filters</button>
      </div>`;
  }
}

function detailHTML() {
  const t = TOOLS.find(x => x.id === state.activeId) || TOOLS[0];
  const cat = CATS[t.cat];
  const related = TOOLS.filter(x => x.cat === t.cat && x.id !== t.id)
    .sort((a, b) => b.users - a.users).slice(0, 3);
  const domain = (t.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
  return `
    <main class="page-detail">
      <div class="back-link" data-action="go-browse">← Back to directory</div>
      <div class="detail-card">
        <div class="detail-tile" style="background:${esc(t.color)}">${esc(t.name.charAt(0).toUpperCase())}</div>
        <div class="detail-head">
          <div class="detail-title-row">
            <h1>${esc(t.name)}</h1>
            ${t.verified ? '<span class="badge-verified-lg">✓</span>' : ''}
            ${t.featured ? '<span class="badge-featured-lg">★ Featured</span>' : ''}
          </div>
          <p class="detail-tagline">${esc(t.tagline)}</p>
          <div class="detail-stats">
            <span class="detail-stat">★ ${t.rating.toFixed(1)} <span>rating</span></span>
            <span class="detail-stat">↗ ${fmt(t.users)} <span>users</span></span>
            <span class="detail-stat">◷ Since ${t.year}</span>
          </div>
        </div>
        <div class="detail-cta">
          <a class="btn-visit" href="${esc(t.url || '#')}" target="_blank" rel="noopener">Visit ${esc(domain)} ↗</a>
          <div class="affiliate-note">Affiliate link · directory earns a fee</div>
        </div>
      </div>

      <div class="detail-layout">
        <div>
          <h2>About ${esc(t.name)}</h2>
          <p>${esc(t.desc)}</p>
          <h2 class="spaced">Key features</h2>
          <div class="features-grid">
            ${t.features.map(f => `
              <div class="feature-item">
                <span class="check">✓</span>
                <span class="text">${esc(f)}</span>
              </div>`).join('')}
          </div>
          <h2 class="spaced">Preview</h2>
          <div class="preview-box"><span>product screenshot — ${esc(t.name)}</span></div>
        </div>
        <aside class="detail-aside">
          <div class="facts-card">
            <div class="aside-label">Quick facts</div>
            <div class="facts-list">
              <div class="fact-row"><span class="k">Category</span><span class="v" style="color:${cat.color}">${esc(cat.label)}</span></div>
              <div class="fact-row"><span class="k">Pricing</span><span class="v">${esc(t.price)}</span></div>
              <div class="fact-row"><span class="k">Rating</span><span class="v">★ ${t.rating.toFixed(1)}</span></div>
              <div class="fact-row"><span class="k">Users</span><span class="v">${fmt(t.users)}</span></div>
            </div>
          </div>
          <div class="bestfor-card">
            <div class="title">Best for</div>
            <p>${esc(t.best)}</p>
          </div>
          <div class="claim-card" data-action="go-submit">Own this tool? <span class="cta">Claim / update →</span></div>
        </aside>
      </div>

      <div class="alternatives">
        <h2>Alternatives in ${esc(cat.label)}</h2>
        <div class="grid-tools">${related.map(toolCardHTML).join('')}</div>
      </div>
    </main>`;
}

function submitHTML() {
  const f = state.form;
  if (state.submitted) {
    return `
      <main class="page-submit">
        <div class="success-card">
          <div class="success-mark">✓</div>
          <h1>Submission received</h1>
          <p>Thanks — <strong>${esc(f.name || 'Untitled tool')}</strong> is in the review queue. We'll email you within 5 days once it's live in the directory.</p>
          <div class="success-actions">
            <button class="btn-dark-lg" data-action="go-home">Back to directory</button>
            <button class="btn-outline-lg" data-action="reset-submit">Submit another</button>
          </div>
        </div>
      </main>`;
  }

  const steps = [{ n: 1, label: 'Tool details' }, { n: 2, label: 'Category & plan' }, { n: 3, label: 'Review' }]
    .map(s => {
      const done = state.step > s.n, active = state.step === s.n;
      const cls = done ? ' done' : active ? ' active' : '';
      return `
        <div class="step">
          <div class="step-dot${cls}">${done ? '✓' : s.n}</div>
          <span class="step-label${cls}">${s.label}</span>
        </div>`;
    }).join('');

  let body = '';
  if (state.step === 1) {
    body = `
      <div class="form-fields">
        <div>
          <label class="field-label">Tool name</label>
          <input class="input" data-input="f-name" value="${esc(f.name)}" placeholder="e.g. Typefully">
        </div>
        <div>
          <label class="field-label">Website URL</label>
          <input class="input" data-input="f-url" value="${esc(f.url)}" placeholder="https://">
        </div>
        <div>
          <label class="field-label">One-line tagline</label>
          <input class="input" data-input="f-tagline" value="${esc(f.tagline)}" placeholder="What does it do, in one sentence?">
        </div>
        <div>
          <label class="field-label">Description</label>
          <textarea class="input" data-input="f-desc" placeholder="Tell us what makes it great for X creators…">${esc(f.desc)}</textarea>
        </div>
      </div>`;
  } else if (state.step === 2) {
    const cats = Object.keys(CATS).map(k =>
      `<span class="pill-option${f.cat === k ? ' active' : ''}" data-action="form-cat" data-cat="${k}">${esc(CATS[k].label)}</span>`).join('');
    const prices = ['Free', 'Freemium', 'Paid'].map(p =>
      `<span class="price-option${f.price === p ? ' active' : ''}" data-action="form-price" data-price="${p}">${p}</span>`).join('');
    const plans = PLANS.map(p => `
      <div class="plan-card${f.plan === p.id ? ' active' : ''}" data-action="form-plan" data-plan="${p.id}">
        <div class="plan-radio"></div>
        <div style="flex:1">
          <div class="plan-name-row"><span class="plan-name">${p.name}</span><span class="plan-price">${p.price}</span></div>
          <div class="plan-desc">${p.desc}</div>
        </div>
      </div>`).join('');
    body = `
      <div class="form-fields-lg">
        <div><label class="field-label-lg">Category</label><div class="pill-options">${cats}</div></div>
        <div><label class="field-label-lg">Pricing model</label><div class="price-options">${prices}</div></div>
        <div><label class="field-label-lg">Listing plan</label><div class="plan-options">${plans}</div></div>
      </div>`;
  } else {
    const plan = PLANS.find(p => p.id === f.plan) || PLANS[0];
    body = `
      <div>
        <h3 class="review-title">Review your submission</h3>
        <div class="review-rows">
          <div class="review-row"><span class="k">Tool</span><span class="v">${esc(f.name || 'Untitled tool')}</span></div>
          <div class="review-row"><span class="k">Website</span><span class="v link">${esc(f.url || '—')}</span></div>
          <div class="review-row"><span class="k">Tagline</span><span class="v">${esc(f.tagline || '—')}</span></div>
          <div class="review-row"><span class="k">Category</span><span class="v">${esc(CATS[f.cat].label)}</span></div>
          <div class="review-row"><span class="k">Pricing</span><span class="v">${esc(f.price)}</span></div>
          <div class="review-row"><span class="k">Plan</span><span class="v strong">${esc(plan.name)}</span></div>
        </div>
      </div>`;
  }

  return `
    <main class="page-submit">
      <div class="submit-head">
        <h1>Submit a tool</h1>
        <p>List your X tool in the directory. Free listings are reviewed within 5 days.</p>
      </div>
      <div class="steps">${steps}</div>
      <div class="form-card">
        ${body}
        <div class="form-actions">
          <button class="btn-back" data-action="prev-step">← Back</button>
          <button class="btn-next" data-action="next-step">${state.step === 3 ? 'Submit tool' : 'Continue'}</button>
        </div>
      </div>
    </main>`;
}

function aboutHTML() {
  const counts = catCounts();
  const catNav = Object.keys(CATS).map(k => `
    <div class="catnav-card" data-action="select-cat-browse" data-cat="${k}">
      <span class="icon">${ICONS[k] || '•'}</span>
      <span class="label">${esc(CATS[k].label)}</span>
      <span class="count">${counts[k] || 0}</span>
    </div>`).join('');
  return `
    <main class="page-about">
      <div class="crumb" style="margin-bottom:8px">Directory / About</div>
      <h1 class="about-title">The independent directory of tools for growing on X</h1>
      <p class="about-intro">We track every serious tool built for X — thread writing, scheduling, analytics, engagement and profile clean-up — and organize them so you can find the right one in minutes instead of scrolling for hours.</p>

      <h2 class="about-h2">How we curate</h2>
      <div class="curate-grid">
        <div class="curate-card">
          <div class="curate-num" style="color:#1D9BF0">01</div>
          <div class="title">Hand-reviewed, not scraped</div>
          <p>Every listing is checked by a person before it goes live, so the directory stays useful signal — never spam.</p>
        </div>
        <div class="curate-card">
          <div class="curate-num" style="color:#00BA7C">02</div>
          <div class="title">Organized by the job</div>
          <p>Tools are grouped into practical categories so you search by what you’re trying to do, not by brand name.</p>
        </div>
        <div class="curate-card">
          <div class="curate-num" style="color:#7856FF">03</div>
          <div class="title">Kept current</div>
          <p>We revisit listings every week — pricing, links and new arrivals — so what you see is what’s live.</p>
        </div>
      </div>

      <h2 class="about-h2">Browse by category</h2>
      <div class="catnav-grid">${catNav}</div>

      <div class="about-cta">
        <div class="about-cta-glow"></div>
        <div class="about-cta-body">
          <h3>Know a tool we’re missing?</h3>
          <p>Submit it in two minutes. Free listings are reviewed within 5 days.</p>
        </div>
        <button data-action="go-submit">Submit a Tool</button>
      </div>
    </main>`;
}

/* ---------- render ---------- */

function render() {
  let screen;
  if (state.screen === 'browse') screen = browseHTML();
  else if (state.screen === 'detail') screen = detailHTML();
  else if (state.screen === 'submit') screen = submitHTML();
  else if (state.screen === 'about') screen = aboutHTML();
  else screen = homeHTML();

  app.innerHTML = headerHTML() + screen + footerHTML();
  if (state.screen === 'home') updateHomeResults();
  if (state.screen === 'browse') updateBrowseResults();
}

/* ---------- events (delegated) ---------- */

function setForm(patch) { state.form = { ...state.form, ...patch }; }

app.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  switch (action) {
    case 'go-home': nav('#/'); break;
    case 'go-browse': nav('#/browse'); break;
    case 'go-browse-all':
      state.cat = 'all'; state.price = 'All'; state.query = '';
      nav('#/browse'); break;
    case 'go-categories':
      state.cat = Object.keys(CATS)[0];
      nav('#/browse'); break;
    case 'go-about': nav('#/about'); break;
    case 'go-submit': state.submitted = false; nav('#/submit'); break;
    case 'open-tool': nav('#/tool/' + encodeURIComponent(el.dataset.id)); break;
    case 'select-cat': state.cat = el.dataset.cat; render(); break;
    case 'select-cat-browse': state.cat = el.dataset.cat; nav('#/browse'); break;
    case 'select-price': state.price = el.dataset.price; render(); break;
    case 'tab-popular': state.sort = 'popular'; render(); break;
    case 'tab-recent': state.sort = 'recent'; render(); break;
    case 'clear-filters':
      state.cat = 'all'; state.price = 'All'; state.query = '';
      render(); break;
    case 'form-cat': setForm({ cat: el.dataset.cat }); render(); break;
    case 'form-price': setForm({ price: el.dataset.price }); render(); break;
    case 'form-plan': setForm({ plan: el.dataset.plan }); render(); break;
    case 'next-step':
      if (state.step < 3) state.step += 1;
      else state.submitted = true;
      render(); window.scrollTo({ top: 0 });
      break;
    case 'prev-step':
      if (state.step > 1) { state.step -= 1; render(); }
      else nav('#/');
      break;
    case 'reset-submit':
      state.submitted = false; state.step = 1;
      state.form = { name: '', url: '', tagline: '', desc: '', cat: 'content', price: 'Freemium', plan: 'free' };
      render();
      break;
  }
});

app.addEventListener('input', e => {
  const el = e.target.closest('[data-input]');
  if (!el) return;
  const kind = el.dataset.input;
  if (kind === 'query') {
    state.query = el.value;
    // Keep the other search inputs in sync without a full re-render (preserves focus).
    app.querySelectorAll('[data-input="query"]').forEach(other => {
      if (other !== el) other.value = el.value;
    });
    if (state.screen === 'home') updateHomeResults();
    if (state.screen === 'browse') updateBrowseResults();
  }
  else if (kind === 'f-name') setForm({ name: el.value });
  else if (kind === 'f-url') setForm({ url: el.value });
  else if (kind === 'f-tagline') setForm({ tagline: el.value });
  else if (kind === 'f-desc') setForm({ desc: el.value });
});

app.addEventListener('change', e => {
  const el = e.target.closest('[data-input="sort"]');
  if (!el) return;
  state.sort = el.value;
  render();
});

app.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const el = e.target.closest('[data-input="query"]');
  if (el) nav('#/browse');
});

/* ---------- boot ---------- */

routeFromHash();
render();
