import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL || 'https://x-tools-directory.vercel.app',
  output: 'static',
  adapter: vercel(),
  integrations: [sitemap({ filter: page => !page.includes('/admin/') })],
});
