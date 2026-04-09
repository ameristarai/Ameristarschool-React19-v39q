/**
 * vite.config.ts
 * ─────────────────────────────────────────────────────────────────
 * SITEMAP PLUGIN: vite-plugin-sitemap
 *   - Reads route URLs from routes.config.ts (single source of truth)
 *   - Generates /sitemap.xml at build time
 *   - Generates /robots.txt pointing to the sitemap
 *
 * INSTALL THE PLUGIN (run once in your terminal):
 *   npm install --save-dev vite-plugin-sitemap
 * ─────────────────────────────────────────────────────────────────
 */
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from 'vite-plugin-sitemap';

// Build-time import from the single source of truth.
// routes.config.ts is pure TypeScript with no browser APIs.
import { xmlSitemapRoutes } from './routes.config';

// ── Change this when the domain goes live ─────────────────────────
const PRODUCTION_URL = 'https://ameristarschool.com';

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // historyApiFallback: serves index.html for any unknown path in dev,
        // letting React's router handle 404 instead of Vite's native 404.
        // Without this, typing a bogus URL like /xyz returns Vite's own error
        // and React never loads at all.
        historyApiFallback: true,
      },
      plugins: [
        react(),
        tailwindcss(),
        // ── XML SITEMAP + ROBOTS.TXT ─────────────────────────────
        // Generates /sitemap.xml and /robots.txt in dist/ at build time.
        // Source of truth: routes.config.ts — edit there, redeploy, done.
        sitemap({
          hostname: PRODUCTION_URL,
          dynamicRoutes: xmlSitemapRoutes.map((r) => r.url),
          generateRobotsTxt: true,
          lastmod: new Date(),
        }),
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
