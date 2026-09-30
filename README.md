# XToolsList

SEO-first directory of tools for growing on X, built with [Astro](https://astro.build).
Every tool and category is a pre-rendered static HTML page (crawlable, with meta tags,
JSON-LD structured data and a sitemap). Submissions post to a serverless endpoint that
appends rows to a Google Sheet.

## Commands

```bash
npm install       # once
npm run dev       # local dev at http://localhost:4321
npm run qa        # data validation, type checks, build and generated-page checks
npm run build     # production build (outputs .vercel/output via the adapter)
```

## Deploying (Vercel)

1. Push this folder to a Git repo and import it in Vercel — the adapter is already
   configured, no settings needed.
2. Set two environment variables in the Vercel project:
   - `SITE_URL` — the real domain, e.g. `https://your-domain.example` (drives
     canonical URLs, the sitemap and the generated `robots.txt`).
   - `SUBMISSIONS_WEBHOOK_URL` — the Google Apps Script URL (setup below).

**Netlify instead:** `npm rm @astrojs/vercel && npm i @astrojs/netlify`, then in
`astro.config.mjs` import `netlify` from `@astrojs/netlify` and use `adapter: netlify()`.
Everything else is identical.

## Submissions → Google Sheets (one-time setup, ~5 minutes)

1. Create a Google Sheet with a tab named exactly `Submissions` (case-sensitive) and this header row:
   `Submitted at | Name | Email | URL | Tagline | Description | Category | Pricing | Launch/Demo Post | X Primary | X Access | Networks | Team Size | X Jobs | Status`
   If `getSheetByName('Submissions')` returns null, `appendRow` throws and the web app
   returns an HTML error page instead of `{ ok: true }`.
2. In the Sheet: **Extensions → Apps Script**, paste:

   ```js
   function doPost(e) {
     const d = JSON.parse(e.postData.contents);
     SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Submissions').appendRow([
       d.submittedAt, d.name, d.email, d.url, d.tagline, d.desc, d.category, d.pricing,
       d.demoPostUrl, d.xPrimary, d.apiStatus, d.networks, d.teamSize, d.xJobs, d.status
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

## Adding / editing tools

Routine catalog maintenance is available at `/admin/`. The password-protected editor
can add, update, hide or delete listings and edit logos, copy, badges, categories,
jobs, X-fit, operational status, API classification and other verified tool facts.
Saving writes `src/data/tool-admin-data.json` to a GitHub commit;
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
admin password stays in memory for the current editor session and is sent only to the
site's own serverless endpoint. The GitHub token never reaches the browser.

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

## Catalog principles

- Public recommendations use observable fields such as operational status, X-fit,
  last-checked date, supported jobs, networks and access method. The directory does
  not display invented popularity scores, ratings or user counts.
- `Editor's Pick` is limited to live tools with High X-fit. `Founder-built`,
  `Open source` and `Official API` are independent, evidence-backed labels.
- First-party pages and documentation belong in `verificationSources`. Claims stay
  `unclear` when the access method or product status cannot be confirmed.
- Historical or changed products can remain indexed with `Degraded`, `Dropped X` or
  `Shut down` status so older recommendations do not silently become misleading.
- Run `npm run qa` before publishing catalog or application changes.
