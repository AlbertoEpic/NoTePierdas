// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// https://astro.build/config
const envBase = process.env.ASTRO_BASE;
const isGhActions = process.env.GITHUB_ACTIONS === 'true';
const ghRepo = process.env.GITHUB_REPOSITORY?.split('/')[1];
const fallbackBase = ghRepo ? `/${ghRepo}` : '/NoTePierdas';

export default defineConfig(({ command }) => {
  const isDev = command === 'dev';
  const derivedBase = isDev
    ? '/'
    : (envBase ?? (isGhActions && ghRepo ? `/${ghRepo}` : fallbackBase));
  const normalizedBase = derivedBase === '/'
    ? '/'
    : `/${derivedBase.replace(/^\/+|\/+$/g, '')}`;

  return {
    site: 'https://albertoepic.github.io/NoTePierdas',
    base: normalizedBase,
    integrations: [mdx()],
    vite: {
      plugins: [
        {
          name: 'dev-strip-notepierdas-prefix',
          configureServer(server) {
            server.middlewares.use((req, _res, next) => {
              if (!req.url) return next();
              if (!req.url.startsWith('/NoTePierdas/')) return next();

              req.url = req.url.replace(/^\/NoTePierdas\//, '/');
              next();
            });
          }
        }
      ]
    }
  };
});