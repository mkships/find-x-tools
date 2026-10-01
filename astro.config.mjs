import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL || 'https://x-tools-directory.vercel.app',
  output: 'static',
  redirects: { '/category/comments/': '/category/bookmarks/' },
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  integrations: [sitemap({ filter: page => !page.includes('/admin/') })],
});
