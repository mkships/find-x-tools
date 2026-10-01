# XToolsList

A curated directory of tools for people who create, publish, engage, and research on X.

Search by tool or job, browse categories, and compare pricing, supported networks, X-fit, and last-checked dates. The homepage features X-native highlights, recommendations, recent additions, and product demos shared on X. Makers can submit tools for review.

## Stack

- **Astro 7** with JavaScript and TypeScript
- **Custom CSS** and Lucide icons
- **JSON** for the catalog: `src/data/tools.json` is the single source of truth; admin edits it directly. Shared definitions and helpers live in `src/data/tools.js`.
- **Astro API routes** for submissions and catalog administration
- **Vercel** for hosting and Web Analytics
- **Astro Sitemap** and structured data for SEO

Most pages are pre-rendered HTML, with lightweight browser JavaScript for search and filters.

## Run locally

Requires Node.js 22.19 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:4321.

```bash
npm run qa      # validate data, types, build, and internal links
npm run build   # production build
```
