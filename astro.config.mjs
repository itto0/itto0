import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://itto0.github.io',
  output: 'static',
  integrations: [
    tailwind({
      applyBaseStyles: false
    })
  ]
});
