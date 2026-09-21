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

Routine catalog maintenance is available at `/admin/`. The password-protected editor
can add, update, hide or delete listings and edit logos, copy, badges, categories,
features and tool facts. Saving commits `src/data/tool-admin-data.json` to GitHub;
Vercel then deploys that commit automatically, so the public directory remains static
and SEO-friendly.

Add these environment variables to the Vercel project:

- `ADMIN_PASSWORD` — a long, unique password for `/admin/`.
- `GITHUB_REPO` — repository in `owner/repository` form.
- `GITHUB_BRANCH` — deployment branch, usually `main`.
- `GITHUB_TOKEN` — a fine-grained GitHub token limited to this repository with
  **Contents: Read and write** permission.

Also add `ADMIN_PASSWORD` to `.env` for local editing. In development, saves write
directly to `src/data/tool-admin-data.json`; no GitHub settings are required. The
admin password is kept only in the browser tab's session storage and is sent only to
the site's own serverless endpoint. The GitHub token never reaches the browser.

Original seed listings remain in `src/data/tools.js`; admin changes are non-destructive
overrides. Git history can restore deleted records. Tool `id` becomes the URL slug
(`/tools/<id>/`), so don't change ids of live pages without adding a redirect.

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

- Fabricated stats (ratings, user counts, founding years) were removed from the
  UI and data in 2026-07. The `users` field that remains in `src/data/tools.js`
  is an internal curation weight that drives the "Recommended" ordering and the
  Editorial Picks section — it is never displayed. Reorder recommendations by
  editing those weights.
- Tool "Visit" links are plain external URLs with `rel="noopener"` (no affiliate /
  sponsored markup yet). Swap in real affiliate URLs per tool when you have them
  (add an `affiliateUrl` field).
- Footer Contact is a non-link placeholder; Privacy Policy / Terms pages are not
  shipped yet.
- Removed after the 2026-07 screenshot audit: `blackmagic` (shut down 2026-07-01),
  `tweetflick`, `hashtagify`, `twindr`, `tweetmonk` (sites dead or blank).
  `geniusx`/`clonex` URLs corrected to their blockmm.ai service pages.
