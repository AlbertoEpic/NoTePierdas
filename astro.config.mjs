// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://albertoepic.github.io',
  base: 'NoTePierdas', // El nombre de tu repositorio
  integrations: [mdx()],
});