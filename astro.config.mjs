import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// Deploying to Netlify instead? Swap the adapter:
//   npm rm @astrojs/vercel && npm i @astrojs/netlify
//   import netlify from '@astrojs/netlify';  →  adapter: netlify()
export default defineConfig({
  // Set SITE_URL in the host's env once the real domain exists — it drives
  // sitemap.xml and canonical URLs.
  site: process.env.SITE_URL || 'https://x-tools-directory.vercel.app',
  output: 'static',
  adapter: vercel(),
  integrations: [sitemap({
    filter: (page) => !page.includes('/admin'),
  })],
});
