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

1. Create a Google Sheet with a tab named `Submissions` and this header row:
   `Submitted at | Name | URL | Tagline | Description | Category | Pricing | Plan | Status`
2. In the Sheet: **Extensions → Apps Script**, paste:

   ```js
   function doPost(e) {
     const d = JSON.parse(e.postData.contents);
     SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Submissions').appendRow([
       d.submittedAt, d.name, d.url, d.tagline, d.desc, d.category, d.pricing, d.plan, d.status
     ]);
     return ContentService.createTextOutput(JSON.stringify({ ok: true }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. **Deploy → New deployment → Web app**, execute as **Me**, access **Anyone**.
   Copy the web app URL into the `SUBMISSIONS_WEBHOOK_URL` env var.

The endpoint (`src/pages/api/submit.js`) validates input, drops bot submissions via a
honeypot field, and stamps each row `pending review` — your review queue is the sheet
itself (add an "approved/rejected" value in the Status column as you process them).

## Free vs. paid submissions

`src/config.js` → `PAID_SUBMISSIONS`:

- `false` (current, launch mode): the wizard is Tool details → Category & pricing →
  Review. No plan selection; every submission records plan `free`.
- `true`: enables the designed paid plans step (Free / Featured $49 / Premium $99/mo).
  The screens are already built — flipping the flag is the only change. Note that
  actually charging requires adding a payment step (e.g. Stripe Payment Links) —
  the flag only restores the plan-selection UI and records the chosen plan in the sheet.

## Adding / editing tools

All listings live in `src/data/tools.js`. Add or edit an entry and redeploy — the
tool page, category counts, sitemap and structured data all regenerate at build time.
Tool `id` becomes the URL slug (`/tools/<id>/`), so don't change ids of live pages
(that breaks indexed URLs; if you must rename, add a redirect).

## URL structure

- `/` home · `/tools/` browse all · `/tools/<slug>/` tool page
- `/category/<slug>/` category landing pages (the main SEO surface)
- `/about/` · `/submit/` · `/api/submit` (POST only)

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

## Before real launch — honesty checklist

- **Ratings and user counts in `src/data/tools.js` are prototype sample numbers.**
  Replace them with real data (or remove those fields) before launch; publishing
  invented ratings can hurt trust and violates Google's structured-data guidelines
  if ever added to JSON-LD (they are deliberately left out of it today).
- The tool "Visit" links are plain external URLs marked `rel="sponsored"`; swap in
  real affiliate URLs per tool when you have them (add an `affiliateUrl` field).
- Footer "Privacy Policy / Terms / Contact" entries are placeholders with no pages.
- Removed after the 2026-07 screenshot audit: `blackmagic` (shut down 2026-07-01),
  `tweetflick`, `hashtagify`, `twindr`, `tweetmonk` (sites dead or blank).
  `geniusx`/`clonex` URLs corrected to their blockmm.ai service pages.
