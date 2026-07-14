# X Tools Directory

SEO-first directory of tools for growing on X, built with [Astro](https://astro.build).
Every tool and category is a pre-rendered static HTML page (crawlable, with meta tags,
JSON-LD structured data and a sitemap). Submissions post to a serverless endpoint that
appends rows to a Google Sheet.

The original claude.ai/design prototype (client-only SPA) is preserved in `prototype/`
for reference; it is not deployed.

## Commands

```bash
npm install       # once
npm run dev       # local dev at http://localhost:4321
npm run build     # production build (outputs .vercel/output via the adapter)
```

## Deploying (Vercel)

1. Push this folder to a Git repo and import it in Vercel — the adapter is already
   configured, no settings needed.
2. Set two environment variables in the Vercel project:
   - `SITE_URL` — the real domain, e.g. `https://xtoolsdirectory.com` (drives
     canonical URLs and the sitemap). Also update the domain in `public/robots.txt`.
   - `SUBMISSIONS_WEBHOOK_URL` — the Google Apps Script URL (setup below).

**Netlify instead:** `npm rm @astrojs/vercel && npm i @astrojs/netlify`, then in
`astro.config.mjs` import `netlify` from `@astrojs/netlify` and use `adapter: netlify()`.
Everything else is identical.

## Submissions → Google Sheets (one-time setup, ~5 minutes)

1. Create a Google Sheet with a tab named exactly `Submissions` (case-sensitive) and this header row:
   `Submitted at | Name | Email | URL | Tagline | Description | Category | Pricing | Plan | Status`
   If `getSheetByName('Submissions')` returns null, `appendRow` throws and the web app
   returns an HTML error page instead of `{ ok: true }`.
2. In the Sheet: **Extensions → Apps Script**, paste:

   ```js
   function doPost(e) {
     const d = JSON.parse(e.postData.contents);
     SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Submissions').appendRow([
       d.submittedAt, d.name, d.email, d.url, d.tagline, d.desc, d.category, d.pricing, d.plan, d.status
     ]);
     return ContentService.createTextOutput(JSON.stringify({ ok: true }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

   If the sheet already exists, insert an **Email** column after **Name**, update the
   script as above, then **Deploy → Manage deployments → Edit → New version** so the
   live web app picks up the change.

3. **Deploy → New deployment → Web app**, execute as **Me**, access **Anyone**.
   Copy the web app URL into the `SUBMISSIONS_WEBHOOK_URL` env var.

The endpoint (`src/pages/api/submit.js`) validates input, checks `Origin`/`Referer`
against the site host, rate-limits to 5 submissions per IP per hour (in-memory /
best-effort on serverless), drops bot submissions via a honeypot field, and stamps
each row `pending review` — your review queue is the sheet itself (add an
"approved/rejected" value in the Status column as you process them).

## Free vs. paid submissions

`src/config.js` → `PAID_SUBMISSIONS`:

- `false` (current, launch mode): the wizard is Tool details → Category & pricing →
  Review. No plan selection; the API always records plan `free` even if a client
  sends another value.
- `true`: enables the designed paid plans step (Free / Featured $49 / Premium $99/mo)
  and allows those plan ids through to the sheet. The screens are already built —
  flipping the flag restores the UI. Note that actually charging requires adding a
  payment step (e.g. Stripe Payment Links) — the flag only restores plan selection
  and records the chosen plan; it does not charge anyone.

## Adding / editing tools

All listings live in `src/data/tools.js`. Prefer editing via the **admin CRM**
(`/admin`) locally; alternatively edit the file by hand and redeploy. Tool `id`
becomes the URL slug (`/tools/<id>/`), so don't change ids of live pages
(that breaks indexed URLs; if you must rename, add a redirect).

## Admin CRM (`/admin`)

Password-gated catalog editor for flags (`verified`, `featured`), scores/dates
(`trendingScore`, `addedAt`, `lastChecked`), and rich detail fields.

1. Set `ADMIN_PASSWORD` in `.env` (local) and in the Vercel project env.
2. Run `npm run dev`, open `/admin`, sign in.
3. Pick tools (sort by trending / rich completeness), fill fields, then **Save**.
4. In local/dev, Save writes `src/data/tools.js` directly. On Vercel (no
   filesystem write unless you set `ADMIN_WRITE=1`, not recommended), use
   **Download tools.js**, commit the file, and redeploy.

The page is `noindex` and excluded from the sitemap. Google Sheet remains
submissions-only — not the live catalog.

### Content workflow (pilot queue)

You do not need all 78 tools richly filled. Suggested first wave: Featured tools,
top Trending, plus one per major category. Per tool (~15–25 min): open the vendor
homepage + pricing page and only fill what you can verify in ~30 seconds. Leave
fields empty when unsure — empty sections hide on the detail page.

## URL structure

- `/` home · `/tools/` browse all · `/tools/<slug>/` tool page
- `/category/<slug>/` category landing pages (the main SEO surface)
- `/about/` · `/submit/` · `/admin/` (private) · `/api/submit` · `/api/admin/*`

The `/tools/` prefix deliberately leaves room for future listing types, e.g.
`/agencies/<slug>/` for X growth agencies — copy the pattern of
`src/pages/tools/[slug].astro` with a new data file when that day comes.

## Homepage screenshots

Tool detail pages show a real homepage screenshot (`public/screenshots/<id>.jpg`,
1200px JPEG, also used as the page's `og:image`). Tools without one automatically
fall back to the striped placeholder.

Captured via Firecrawl: `scripts/capture-screenshots.sh` loops over every tool URL in
`src/data/tools.js`, scrapes with `--format screenshot`, and resizes with `sips`.
It skips ids that already have an image — to refresh a stale one, delete its jpg
and re-run; to refresh everything, empty `public/screenshots/` first. Re-run every
month or two (or wire it into CI later) so captures don't rot. ~1 Firecrawl credit
per page.

Known gap (placeholder shown): `xpro` — pro.x.com blocks all bots; capture
manually from a logged-in browser and save as `public/screenshots/xpro.jpg`.

## Catalog field meanings (`src/data/tools.js`)

- `trendingScore` — editorial trend weight (never displayed). Drives homepage
  **Trending**, browse **Recommended**, category ItemLists, and related-tool
  sorts. Raise or lower a tool’s score to change order; this is not live traffic.
- `addedAt` — listing date (`YYYY-MM-DD`). Drives homepage **Recently Added**.
  When approving a submission into the catalog, set `addedAt` to the day it goes live.
- `verified` — team reviewed functionality and use-cases. Shown as the Verified
  badge on cards and tool detail pages.
- `featured` — homepage Featured strip.
- `useCases` — optional bullets for “Main use-cases” on the detail page.
- `watchOuts` — optional honest caveats (“when not to use”).
- `pricingNote` — optional one-line pricing honesty beyond Free/Freemium/Paid.
- `faqs` — optional `{ q, a }[]`; renders FAQ accordion + `FAQPage` JSON-LD.
- `lastChecked` — optional date shown in the sidebar when you last reviewed the listing.
- `quotes` — optional curated public testimonials
  `{ source, author, text, url, date }`. Never invent quotes; leave empty for the
  placeholder (“collecting public reviews…”).

## Before real launch — honesty checklist

- Fabricated stats (ratings, user counts, founding years) were removed from the
  UI and data in 2026-07. Do not reintroduce displayed user counts or ratings.
  Use `trendingScore` / `addedAt` as above instead of inventing popularity metrics.
- Do not invent `quotes`, `watchOuts`, or pricing claims you cannot source.
- Tool "Visit" links are plain external URLs with `rel="noopener"` (no affiliate /
  sponsored markup yet). Swap in real affiliate URLs per tool when you have them
  (add an `affiliateUrl` field).
- Footer Contact is a non-link placeholder; Privacy Policy / Terms pages are not
  shipped yet.
- Removed after the 2026-07 screenshot audit: `blackmagic` (shut down 2026-07-01),
  `tweetflick`, `hashtagify`, `twindr`, `tweetmonk` (sites dead or blank).
  `geniusx`/`clonex` URLs corrected to their blockmm.ai service pages.
