// @ts-check
import { defineConfig } from 'astro/config';

// The portal is a fully static site for the MVP (M1): no server code,
// no database and no secrets. Everything is rebuilt from data/kingdom.json.
export default defineConfig({
  // The public address (e.g. https://zaunited.pages.dev), set as the SITE_URL
  // environment variable in Cloudflare Pages. It switches on link-preview tags.
  site: process.env.SITE_URL || undefined,
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
  devToolbar: { enabled: false },
});
