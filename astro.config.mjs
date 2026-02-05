// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// https://astro.build/config
const rawBase = process.env.ASTRO_BASE ?? '/';
const normalizedBase = rawBase === '/'
  ? '/'
  : `/${rawBase.replace(/^\/+|\/+$/g, '')}`;

export default defineConfig({
  site: 'https://albertoepic.github.io',
  base: normalizedBase,
  integrations: [mdx()],
});