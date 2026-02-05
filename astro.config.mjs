// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// https://astro.build/config
const envBase = process.env.ASTRO_BASE;
const isGhActions = process.env.GITHUB_ACTIONS === 'true';
const ghRepo = process.env.GITHUB_REPOSITORY?.split('/')[1];
const fallbackBase = ghRepo ? `/${ghRepo}` : '/NoTePierdas';
const derivedBase = envBase ?? (isGhActions && ghRepo ? `/${ghRepo}` : fallbackBase);
const normalizedBase = derivedBase === '/'
  ? '/'
  : `/${derivedBase.replace(/^\/+|\/+$/g, '')}`;

export default defineConfig({
  site: 'https://albertoepic.github.io/NoTePierdas',
  base: normalizedBase,
  integrations: [mdx()],
});